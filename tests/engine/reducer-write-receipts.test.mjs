// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {transformSync} from 'esbuild';import {readFile} from 'node:fs/promises';
import {instrumentReducerFieldWrites} from '../../src/engine/reducer-field-writes.mjs';
const load=()=>import('../../src/engine/reducer-write-receipts.mjs');
const nativeLoad=()=>import('../../src/engine/reducer-call-frames.mjs');
const source='export const revise=(items,command)=>items.map(item=>item.key===command.data.key?{...item,caption:command.data.caption}:item);';
const options={binding:'revise',field:'caption',observerName:'writeObserver',capture:'invocation'};
function compile(text=source,extra={}){return instrumentReducerFieldWrites(text,'app/rows.js',{...options,...extra});}
function run(code,values){const c=vm.createContext({module:{exports:{}},exports:{},...values});vm.runInContext(transformSync(code,{format:'cjs'}).code,c);return c.module.exports;}
async function setup({weakRef=WeakRef,text=source}={}){const api=(await load()).createReducerWriteReceipts({page:'owned-page',weakRef}),recipe=compile(text),mod=run(recipe.code,{writeObserver:api.source});api.register(mod.revise,recipe.sites.map(s=>s.id));return{api,recipe,reducer:mod.revise};}
function call(f,input,action,{revisionId='revision-1',apply=true}={}){const token={};f.api.begin(token,f.reducer,input,action);let result;try{result=f.reducer(input,action);f.api.complete(token,result);}catch(error){f.api.discard(token);throw error;}if(apply)f.api.applied(token,{result,input,action,reducer:f.reducer,revisionId});return{token,result};}
function lookup(f,row,result,revisionId='revision-1'){return f.api.lookup({row,result,reducer:f.reducer,revisionId});}
test('framed original source emits exact enter/write/exit without rereading initializer',()=>{
 const recipe=compile(),events=[];let reads=0;const mod=run(recipe.code,{writeObserver:(...args)=>{events.push(args);if(args[0]==='enter')return 'token';}}),input=[{key:1,caption:'SAME'}],action={data:{key:1,get caption(){reads++;return'SAME';}}},result=mod.revise(input,action);
 assert.deepEqual(events.map(e=>e[0]),['enter','write','exit']);assert.equal(events[0][1],mod.revise);assert.equal(events[0][2],input);assert.equal(events[0][3],action);assert.equal(events[1][1],'token');assert.equal(events[1][2],recipe.sites[0].id);assert.equal(events[1][3],result[0]);assert.equal(events[2][1],'token');assert.equal(reads,1);
});
test('source finally and thrown identity are unchanged with missing/throwing observer',()=>{
 const text='export function revise(s,a){try{return [{caption:a.data.caption}]}finally{mark();if(a.fail)throw sentinel;}}';
 for(const observer of [undefined,()=>{throw Error('observer');}]){let marks=0,reads=0;const sentinel={},action={fail:true,data:{get caption(){reads++;return'SAME';}}},mod=run(compile(text).code,{writeObserver:observer,mark:()=>marks++,sentinel});assert.throws(()=>mod.revise([],action),e=>e===sentinel);assert.equal(marks,1);assert.equal(reads,1);}
});
test('one completed source/native invocation can bind to only its applied result and revision',async()=>{
 const f=await setup(),input=[{key:1,caption:'SAME'},{key:2,caption:'SAME'}],action={data:{key:1,caption:'SAME'}},{result}=call(f,input,action),r=lookup(f,result[0],result);
 assert.equal(r.status,'Observed');assert.equal(r.write.siteId,f.recipe.sites[0].id);assert.equal(r.write.revisionId,'revision-1');assert.equal(r.fullPath,false);assert.equal(r.currentMembership,'Unknown/Unsupported');assert.equal(r.fieldOwnership,'Unknown/Unsupported');assert.equal(r.selectedPropertyOrigin,'Unknown/Unsupported');assert.doesNotMatch(JSON.stringify(r),/SAME/);
 assert.equal(lookup(f,result[1],result).status,'Unknown/Unsupported');assert.equal(lookup(f,result[0],input).status,'Unknown/Unsupported');assert.equal(lookup(f,result[0],result,'different').status,'Unknown/Unsupported');
});
test('same-valued repeated edits have distinct call and revision identities',async()=>{
 const f=await setup(),action={data:{key:1,caption:'SAME'}},a=call(f,[{key:1,caption:'SAME'}],action),b=call(f,a.result,action,{revisionId:'revision-2'}),x=lookup(f,a.result[0],a.result),y=lookup(f,b.result[0],b.result,'revision-2');assert.equal(x.status,'Observed');assert.equal(y.status,'Observed');assert.notEqual(x.write.callId,y.write.callId);assert.equal(lookup(f,a.result[0],b.result,'revision-2').status,'Unknown/Unsupported');
});
for(const part of ['result','input','action','reducer'])test('applied '+part+' mismatch cannot borrow a completed call',async()=>{
 const f=await setup(),input=[{key:1}],action={data:{key:1,caption:'secret'}},{token,result}=call(f,input,action,{apply:false}),details={result,input,action,reducer:f.reducer,revisionId:'revision-1'};details[part]=part==='reducer'?()=>{}:{};f.api.applied(token,details);assert.equal(lookup(f,result[0],result).status,'Unknown/Unsupported');
});
test('ignored and aborted call tokens cannot be applied later',async()=>{
 for(const incomplete of [false,true]){const f=await setup(),input=[{key:1}],action={data:{key:1,caption:'SAME'}},token={};f.api.begin(token,f.reducer,input,action);const result=f.reducer(input,action);if(!incomplete)f.api.complete(token,result);f.api.discard(token);f.api.applied(token,{result,input,action,reducer:f.reducer,revisionId:'revision-1'});assert.equal(lookup(f,result[0],result).status,'Unknown/Unsupported');}
});
test('same result reference in separate invocations cannot merge writes or consume another token',async()=>{
 const f=await setup(),input=[{key:1}],action={data:{key:1,caption:'SAME'}},first=call(f,input,action,{apply:false}),token={};f.api.begin(token,f.reducer,input,action);f.api.complete(token,first.result);f.api.applied(token,{result:first.result,input,action,reducer:f.reducer,revisionId:'revision-1'});assert.equal(lookup(f,first.result[0],first.result).status,'Unknown/Unsupported');
});
test('delayed source callback has a closed lexical frame even during another native invocation',async()=>{
 let delayed;const api=(await load()).createReducerWriteReceipts({page:'p'}),recipe=compile('export function revise(s,a){schedule(()=>({caption:a.data.caption}));return s;}'),reducer=run(recipe.code,{writeObserver:api.source,schedule:fn=>{delayed=fn;}}).revise;api.register(reducer,recipe.sites.map(s=>s.id));const f={api,reducer},input=[],action={data:{caption:'SAME'}},first=call(f,input,action),token={};api.begin(token,reducer,input,action);const row=delayed();api.complete(token,input);api.applied(token,{result:input,input,action,reducer,revisionId:'revision-2'});assert.equal(lookup(f,row,input,'revision-2').status,'Unknown/Unsupported');assert.equal(first.result,input);
});
test('unregistered site or wrong source reducer/input/action refuses the call',async()=>{
 for(const mode of ['site','reducer','input','action']){const api=(await load()).createReducerWriteReceipts({page:'p'}),reducer=()=>{},input={},action={},token={},row={},result={};api.register(reducer,['known']);api.begin(token,reducer,input,action);const args=[reducer,input,action];if(mode!=='site')args[['reducer','input','action'].indexOf(mode)]={};const frame=api.source('enter',...args);api.source('write',frame,mode==='site'?'other':'known',row);api.source('exit',frame);api.complete(token,result);api.applied(token,{result,input,action,reducer,revisionId:'r'});assert.equal(api.lookup({row,result,reducer,revisionId:'r'}).status,'Unknown/Unsupported');}
});
test('recorder never reads an app object or retains serializable values',async()=>{
 let traps=0;const opaque=()=>new Proxy({},{get(){traps++;throw Error('get')},getOwnPropertyDescriptor(){traps++;throw Error('descriptor')},ownKeys(){traps++;throw Error('keys')}}),api=(await load()).createReducerWriteReceipts({page:'p'}),reducer=()=>{},input=opaque(),action=opaque(),row=opaque(),result=opaque(),token={};api.register(reducer,['known']);api.begin(token,reducer,input,action);const frame=api.source('enter',reducer,input,action);api.source('write',frame,'known',row);api.source('exit',frame);api.complete(token,result);api.applied(token,{result,input,action,reducer,revisionId:'r'});assert.equal(api.lookup({row,result,reducer,revisionId:'r'}).status,'Observed');assert.equal(traps,0);
});
test('weak loss and Stop invalidate receipt without resurrecting it',async()=>{
 let gone=false;class Weak{constructor(value){this.value=value}deref(){return gone?undefined:this.value}}
 const f=await setup({weakRef:Weak}),{result}=call(f,[{key:1}],{data:{key:1,caption:'SAME'}});assert.equal(lookup(f,result[0],result).status,'Observed');gone=true;assert.equal(lookup(f,result[0],result).status,'Unknown/Unsupported');gone=false;f.api.stop();assert.equal(lookup(f,result[0],result).status,'Unknown/Unsupported');assert.equal(f.api.retention().stopped,true);
});
test('duplicate apply and reused revision do not replace earlier authority',async()=>{
 const f=await setup(),input=[{key:1}],action={data:{key:1,caption:'SAME'}},{token,result}=call(f,input,action);f.api.applied(token,{result,input,action,reducer:f.reducer,revisionId:'revision-2'});assert.equal(lookup(f,result[0],result,'revision-2').status,'Unknown/Unsupported');assert.equal(lookup(f,result[0],result).status,'Unknown/Unsupported');
});
test('bounded recorder capacity refuses all positive claims',async()=>{
 const f=await setup();let last;for(let i=0;i<130;i++)last=call(f,[{key:1}],{data:{key:1,caption:'SAME'}},{revisionId:'r'+i});assert.equal(lookup(f,last.result[0],last.result,'r129').status,'Unknown/Unsupported');assert.equal(f.api.retention().refused,true);
});
const native=`'use strict';function __sa19Tap(kind,value){try{tap(...arguments)}catch{}return value}function updateReducerImpl(hook,current,reducer){var queue=hook.queue,update=queue.pending,pendingQueue=hook.memoizedState,updateLane=update.action,currentlyRenderingFiber={};if(double)__sa19Tap('reducer-ignored',reducer(pendingQueue,updateLane),hook,queue,update,pendingQueue,updateLane,currentlyRenderingFiber,reducer);pendingQueue=__sa19Tap('reducer-applied',reducer(pendingQueue,updateLane),hook,queue,update,pendingQueue,updateLane,currentlyRenderingFiber,reducer);return pendingQueue;}exports.run=updateReducerImpl;`;
test('native call recipe threads distinct opaque tokens and preserves reducer semantics',async()=>{
 const recipe=(await nativeLoad()).instrumentReducerCallFrames(native),events=[],ctx=vm.createContext({exports:{},tap:(...e)=>events.push(e),double:true});vm.runInContext(recipe.code,ctx);const input={},action={},hook={memoizedState:input,queue:{pending:{action}}};let calls=0;const reducer=function(s,a){'use strict';assert.equal(this,undefined);assert.equal(s,input);assert.equal(a,action);calls++;return{call:calls};},result=ctx.exports.run(hook,hook,reducer);assert.equal(calls,2);assert.equal(result.call,2);const begins=events.filter(e=>e[0]==='reducer-call-begin'),applied=events.find(e=>e[0]==='reducer-applied'),ignored=events.find(e=>e[0]==='reducer-ignored');assert.equal(begins.length,2);assert.notEqual(begins[0][1],begins[1][1]);assert.equal(ignored.at(-1),begins[0][1]);assert.equal(applied.at(-1),begins[1][1]);assert.equal(recipe.nativeVersionAdmitted,false);
});
test('native original exception aborts the token and never emits applied',async()=>{
 const recipe=(await nativeLoad()).instrumentReducerCallFrames(native),events=[],ctx=vm.createContext({exports:{},tap:(...e)=>events.push(e),double:false});vm.runInContext(recipe.code,ctx);const error={},hook={memoizedState:{},queue:{pending:{action:{}}}};assert.throws(()=>ctx.exports.run(hook,hook,()=>{throw error}),e=>e===error);assert.equal(events.filter(e=>e[0]==='reducer-call-abort').length,1);assert.equal(events.filter(e=>e[0]==='reducer-applied').length,0);
});
test('native recipe refuses missing duplicate and unexpected call shapes',async()=>{
 const {instrumentReducerCallFrames:prepare}=await nativeLoad();for(const text of [native.replace("'reducer-ignored'","'other'"),native.replace('reducer(pendingQueue,updateLane)','reducer(other,updateLane)'),native+native])assert.throws(()=>prepare(text));
});
test('exact retained vendor bytes admit both call sites without native execution credit',async()=>{
 const {transformPinnedReducerCallFrames}=await nativeLoad(),file='react-dom/cjs/react-dom-client.development.js',vendor=await readFile(new URL('../../.runtime/todomvc/examples/react/node_modules/'+file,import.meta.url),'utf8'),r=transformPinnedReducerCallFrames(vendor,file);assert.equal(r.nativeVersionAdmitted,true);assert.equal(r.calls,2);assert.equal(r.nativeExecuted,false);
});

test('integrated actual retained reducer/source frames/native call grammar distinguishes StrictMode ignored calls',async()=>{
 const dir=new URL('../../.runtime/todomvc/examples/react/src/todo/',import.meta.url),text=await readFile(new URL('reducer.js',dir),'utf8'),constants=run(await readFile(new URL('constants.js',dir),'utf8'));
 const api=(await load()).createReducerWriteReceipts({page:'integration'}),recipe=instrumentReducerFieldWrites(text,'independent/reducer.js',{binding:'todoReducer',field:'title',observerName:'writeObserver',capture:'invocation'}),reducer=run(recipe.code,{writeObserver:api.source,require:name=>{assert.equal(name,'./constants');return constants;}}).todoReducer;api.register(reducer,recipe.sites.map(s=>s.id));
 const events=[];let revision=0;const ctx=vm.createContext({exports:{},double:true,tap:(kind,value,...args)=>{
  events.push([kind,value,...args]);if(kind==='reducer-call-begin')api.begin(value,...args);else if(kind==='reducer-call-complete')api.complete(args[0],value);else if(kind==='reducer-call-abort')api.discard(value);else if(kind==='reducer-ignored')api.discard(args[7]);else if(kind==='reducer-applied')api.applied(args[7],{result:value,input:args[3],action:args[4],reducer:args[6],revisionId:'synthetic-native-revision-'+ ++revision});
 }});vm.runInContext((await nativeLoad()).instrumentReducerCallFrames(native).code,ctx);
 const execute=(state,action)=>{const hook={memoizedState:state,queue:{pending:{action}}};return ctx.exports.run(hook,hook,reducer);};
 const first=execute([],{type:constants.ADD_ITEM,payload:{title:'SAME'}}),second=execute(first,{type:constants.UPDATE_ITEM,payload:{id:first[0].id,title:'SAME'}});
 assert.equal(revision,2);const a=api.lookup({row:first[0],result:first,reducer,revisionId:'synthetic-native-revision-1'}),b=api.lookup({row:second[0],result:second,reducer,revisionId:'synthetic-native-revision-2'});assert.equal(a.status,'Observed');assert.equal(b.status,'Observed');assert.notEqual(a.write.callId,b.write.callId);assert.notEqual(a.write.siteId,b.write.siteId);assert.notEqual(first[0],second[0]);
 const ignored=events.filter(e=>e[0]==='reducer-ignored');assert.equal(ignored.length,2);for(const e of ignored)assert.equal(api.lookup({row:e[1][0],result:e[1],reducer,revisionId:'synthetic-native-revision-2'}).status,'Unknown/Unsupported');assert.equal(api.retention().active,0);
});
test('nested native calls keep separate source frames and applied tokens',async()=>{
 const api=(await load()).createReducerWriteReceipts({page:'p'}),r1=()=>{},r2=()=>{},input={},action={},t1={},t2={},row1={},row2={},result1={},result2={};api.register(r1,['one']);api.register(r2,['two']);api.begin(t1,r1,input,action);const s1=api.source('enter',r1,input,action);api.begin(t2,r2,input,action);const s2=api.source('enter',r2,input,action);api.source('write',s2,'two',row2);api.source('exit',s2);api.complete(t2,result2);api.applied(t2,{result:result2,input,action,reducer:r2,revisionId:'r2'});api.source('write',s1,'one',row1);api.source('exit',s1);api.complete(t1,result1);api.applied(t1,{result:result1,input,action,reducer:r1,revisionId:'r1'});assert.equal(api.lookup({row:row1,result:result1,reducer:r1,revisionId:'r1'}).status,'Observed');assert.equal(api.lookup({row:row2,result:result2,reducer:r2,revisionId:'r2'}).status,'Observed');assert.equal(api.lookup({row:row1,result:result2,reducer:r2,revisionId:'r2'}).status,'Unknown/Unsupported');
});
test('lost result or reducer reference cannot be matched by supplying undefined',async()=>{
 const lost=new WeakSet();class Weak{constructor(value){this.value=value}deref(){return lost.has(this.value)?undefined:this.value}}
 const f=await setup({weakRef:Weak}),{result}=call(f,[{key:1}],{data:{key:1,caption:'SAME'}});lost.add(result);lost.add(f.reducer);assert.equal(f.api.lookup({row:result[0],result:undefined,reducer:undefined,revisionId:'revision-1'}).status,'Unknown/Unsupported');
});
test('failed source exit cannot be replaced by successful native completion',async()=>{
 const api=(await load()).createReducerWriteReceipts({page:'p'}),reducer=()=>{},input={},action={},token={},row={},result={};api.register(reducer,['site']);api.begin(token,reducer,input,action);const frame=api.source('enter',reducer,input,action);api.source('write',frame,'site',row);api.complete(token,result);api.applied(token,{result,input,action,reducer,revisionId:'r'});assert.equal(api.lookup({row,result,reducer,revisionId:'r'}).status,'Unknown/Unsupported');
});
test('second source invocation under one native call cannot borrow first source entry',async()=>{
 const api=(await load()).createReducerWriteReceipts({page:'p'}),reducer=()=>{},input={},action={},token={},row={},result={};api.register(reducer,['site']);api.begin(token,reducer,input,action);const frame=api.source('enter',reducer,input,action);assert.equal(api.source('enter',reducer,input,action),null);api.source('write',frame,'site',row);api.source('exit',frame);api.complete(token,result);api.applied(token,{result,input,action,reducer,revisionId:'r'});assert.equal(api.lookup({row,result,reducer,revisionId:'r'}).status,'Unknown/Unsupported');
});

test('invocation mode refuses body-level function declarations without changing valid hoisting semantics',()=>{
 const text='export function revise(s,a){function helper(){return 7}var helper;return [{caption:a.data.caption,extra:helper()}]}',action={data:{caption:'SAME'}},original=run(text).revise([],action);assert.equal(original[0].extra,7);const r=compile(text);assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.code,text);assert.equal(run(r.code).revise([],action)[0].extra,7);
});
for(const kind of ['exit','unexpected'])test('malformed source event after exit invalidates current native receipt: '+kind,async()=>{
 const api=(await load()).createReducerWriteReceipts({page:'p'}),reducer=()=>{},input={},action={},token={},row={},result={};api.register(reducer,['site']);api.begin(token,reducer,input,action);const frame=api.source('enter',reducer,input,action);api.source('write',frame,'site',row);api.source('exit',frame);api.source(kind,frame);api.complete(token,result);api.applied(token,{result,input,action,reducer,revisionId:'r'});assert.equal(api.lookup({row,result,reducer,revisionId:'r'}).status,'Unknown/Unsupported');
});

test('unregistered primitive useState reducer calls do not poison later registered list writes',async()=>{
 const f=await setup(),other=(state,action)=>action,t={};f.api.begin(t,other,false,true);f.api.complete(t,true);f.api.applied(t,{result:true,input:false,action:true,reducer:other,revisionId:'boolean-state'});
 const {result}=call(f,[{key:1}],{data:{key:1,caption:'SAME'}});assert.equal(lookup(f,result[0],result).status,'Observed');assert.equal(f.api.retention().refused,false);
});
test('an unregistered nested native frame cannot lend its parent source token',async()=>{
 const f=await setup(),input=[{key:1}],action={data:{key:1,caption:'SAME'}},outer={},foreign={};f.api.begin(outer,f.reducer,input,action);f.api.begin(foreign,()=>true,false,true);const result=f.reducer(input,action);f.api.complete(foreign,true);f.api.complete(outer,result);f.api.applied(outer,{result,input,action,reducer:f.reducer,revisionId:'revision-1'});assert.equal(lookup(f,result[0],result).status,'Unknown/Unsupported');assert.equal(f.api.retention().refused,false);
});

for(const mode of ['array-index','empty-stack','result-field'])test('private write receipt avoids prototype accessors: '+mode,async()=>{
 const f=await setup(),prototype=mode==='result-field'?Object.prototype:Array.prototype,key=mode==='result-field'?'result':mode==='empty-stack'?'-1':'0',saved=Object.getOwnPropertyDescriptor(prototype,key);let calls=0,result,error;
 try{Object.defineProperty(prototype,key,{configurable:true,get(){calls++;throw Error('late private getter')},set(){calls++;throw Error('late private setter')}});try{if(mode==='empty-stack')result=f.api.source('enter',f.reducer,[],{});else{const execution=call(f,[{key:1}],{data:{key:1,caption:'SAME'}});result=lookup(f,execution.result[0],execution.result);}}catch(e){error=e;}}
 finally{if(saved)Object.defineProperty(prototype,key,saved);else delete prototype[key];}
 assert.equal(error,undefined);assert.equal(calls,0);if(mode==='empty-stack')assert.equal(result,null);else assert.equal(result.status,'Observed');
});
