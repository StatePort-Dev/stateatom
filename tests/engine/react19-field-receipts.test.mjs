// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {transformSync} from 'esbuild';
import {createReact19Acquisition} from '../../src/engine/react19-acquisition.mjs';import {instrumentReducerFieldWrites} from '../../src/engine/reducer-field-writes.mjs';
const source='export function revise(items,event){return items.map(item=>item.id===event.payload.id?{...item,title:event.payload.title}:item)}';
function fixture({weakRef=WeakRef}={}){
 const api=createReact19Acquisition({page:'field-page',weakRef,reducerFields:true}),recipe=instrumentReducerFieldWrites(source,'app/reducer.js',{binding:'revise',field:'title',observerName:'sourceTap',capture:'invocation'}),c=vm.createContext({module:{exports:{}},exports:{},sourceTap:api.reducerFieldSource});vm.runInContext(transformSync(recipe.code,{format:'cjs'}).code,c);const reducer=c.module.exports.revise;
 api.registerReducerFields(reducer,recipe.sites.map(s=>s.id));const rootFiber={tag:3},fiber={tag:0},host={tag:5},other={tag:5},node={},otherNode={},root={current:rootFiber},queue={dispatch(){}};rootFiber.child=fiber;fiber.child=host;host.sibling=other;host.stateNode=node;other.stateNode=otherNode;let hook={queue,memoizedState:[{id:1,title:'SAME'},{id:2,title:'SAME'}],next:null};fiber.memoizedState=hook;
 for(const f of[rootFiber,fiber,host,other])api.tap('fiber',f);api.tap('root',root);api.tap('state-result',[hook.memoizedState,queue.dispatch],hook,fiber);api.tap('root-current',root,rootFiber);
 function invoke(input,action,{ignored=false,aborted=false}={}){const token={};api.tap('reducer-call-begin',token,reducer,input,action);const result=reducer(input,action);api.tap(aborted?'reducer-call-abort':'reducer-call-complete',aborted?token:result,...(aborted?[]:[token]));if(ignored)api.tap('reducer-ignored',result,hook,queue,{},input,action,fiber,reducer,token);return{token,result};}
 function run({cloned=false,commit=true,wrongResult=false,ignored=false,aborted=false}={}){
  const input=hook.memoizedState,action={payload:{id:1,title:'SAME'}},update={action},next={queue,memoizedState:input,next:null};api.tap('dispatch',queue,update,fiber,action);api.tap('begin',next,hook,queue,fiber);const discarded=ignored?invoke(input,action,{ignored:true}):null,call=invoke(input,action,{aborted});const result=wrongResult?[...call.result]:call.result;api.tap('reducer-applied',result,next,queue,cloned?{action}:update,input,action,fiber,reducer,call.token);next.memoizedState=result;api.tap('state-result',[result,queue.dispatch],next,fiber);if(commit){hook=next;fiber.memoizedState=next;api.tap('root-current',root,rootFiber);}return{...call,committedResult:result,discarded,next};
 }
 return{api,recipe,reducer,node,otherNode,root,rootFiber,fiber,queue,run,get hook(){return hook;}};
}
test('default native collector does not expose or allocate field observation API',()=>{
 const api=createReact19Acquisition({page:'default'});assert.equal(api.registerReducerFields,undefined);assert.equal(api.reducerFieldSource,undefined);assert.equal(api.matchReducerFieldWrite,undefined);api.tap('reducer-call-begin',{},()=>{},[],{});assert.equal(api.retention().events,0);
});
test('original source write joins actual collector-generated applied revision on current ancestor',()=>{
 const f=fixture(),{result}=f.run(),native=f.api.snapshot(f.node),r=f.api.matchReducerFieldWrite(f.node,result[0]);assert.equal(r.status,'Observed');assert.equal(r.write.revisionId,native.ancestors[0].revisionId);assert.equal(r.native.updateId,native.ancestors[0].updateId);assert.equal(r.native.commitId,native.commitId);assert.equal(r.write.siteId,f.recipe.sites[0].id);assert.equal(r.currentMembership,'Unknown/Unsupported');assert.equal(r.selectedPropertyOrigin,'Unknown/Unsupported');assert.equal(r.fieldOwnership,'Unknown/Unsupported');assert.equal(r.fullPath,false);assert.doesNotMatch(JSON.stringify(r),/SAME/);
 assert.equal(f.api.matchReducerFieldWrite(f.node,result[1]).status,'Unknown/Unsupported');
});
test('shared selected ancestor is explicitly not proof that a row belongs to this selected host',()=>{
 const f=fixture(),{result}=f.run(),a=f.api.matchReducerFieldWrite(f.node,result[0]),b=f.api.matchReducerFieldWrite(f.otherNode,result[0]);assert.equal(a.status,'Observed');assert.equal(b.status,'Observed');assert.notEqual(a.native.nodeId,b.native.nodeId);assert.equal(b.selectedPropertyOrigin,'Unknown/Unsupported');assert.equal(b.currentMembership,'Unknown/Unsupported');assert.equal(b.fullPath,false);
});
test('repeated same-value updates have distinct actual revisions and old row cannot borrow the new one',()=>{
 const f=fixture(),a=f.run(),old=f.api.matchReducerFieldWrite(f.node,a.result[0]),b=f.run(),fresh=f.api.matchReducerFieldWrite(f.node,b.result[0]);assert.equal(fresh.status,'Observed');assert.notEqual(old.write.revisionId,fresh.write.revisionId);assert.notEqual(old.write.callId,fresh.write.callId);assert.equal(f.api.matchReducerFieldWrite(f.node,a.result[0]).status,'Unknown/Unsupported');
});
for(const mode of ['cloned','wrongResult','aborted'])test('native '+mode+' result cannot grant an applied field receipt',()=>{const f=fixture(),{result}=f.run({[mode]:true});assert.equal(f.api.matchReducerFieldWrite(f.node,result[0]).status,'Unknown/Unsupported');});
test('ignored native result is discarded while its separately applied sibling is recorded',()=>{
 const f=fixture(),{result,discarded}=f.run({ignored:true});assert.equal(f.api.matchReducerFieldWrite(f.node,result[0]).status,'Observed');assert.equal(f.api.matchReducerFieldWrite(f.node,discarded.result[0]).status,'Unknown/Unsupported');
});
test('pending uncommitted hook cannot borrow the current selected ancestor',()=>{
 const f=fixture(),{result,next}=f.run({commit:false});assert.equal(f.api.matchReducerFieldWrite(f.node,result[0]).status,'Unknown/Unsupported');f.fiber.memoizedState=next;f.api.tap('root-current',f.root,f.rootFiber);assert.equal(f.api.matchReducerFieldWrite(f.node,result[0]).status,'Observed');
});
test('changed result or detached selected host invalidates the field ancestor join',()=>{
 const f=fixture(),{result}=f.run();f.hook.memoizedState=[...result];assert.equal(f.api.matchReducerFieldWrite(f.node,result[0]).status,'Unknown/Unsupported');const g=fixture(),b=g.run();g.fiber.child=null;assert.equal(g.api.matchReducerFieldWrite(g.node,b.result[0]).status,'Unknown/Unsupported');
});
test('Stop invalidates matching and makes source and registration APIs inert',()=>{
 const f=fixture(),{result}=f.run();f.api.stop();assert.equal(f.api.matchReducerFieldWrite(f.node,result[0]).status,'Unknown/Unsupported');assert.equal(f.api.registerReducerFields(()=>{},['new']),false);assert.equal(f.api.reducerFieldSource('enter',f.reducer,[],{}),null);
});
test('lost original row reference cannot yield an observed receipt',()=>{
 const lost=new WeakSet();class Weak{constructor(value){this.value=value}deref(){return lost.has(this.value)?undefined:this.value}}
 const f=fixture({weakRef:Weak}),{result}=f.run();lost.add(result[0]);assert.equal(f.api.matchReducerFieldWrite(f.node,result[0]).status,'Unknown/Unsupported');
});
test('native collector captures weak dereference before later application prototype accessor',()=>{
 const api=createReact19Acquisition({page:'weak'}),rootFiber={tag:3},root={current:rootFiber};api.tap('fiber',rootFiber);api.tap('root',root);api.tap('root-current',root,rootFiber);const descriptor=Object.getOwnPropertyDescriptor(WeakRef.prototype,'deref');let calls=0,result;
 try{Object.defineProperty(WeakRef.prototype,'deref',{configurable:true,get(){calls++;throw Error('late app weak getter')}});result=api.currentCommit();}finally{Object.defineProperty(WeakRef.prototype,'deref',descriptor)}assert.equal(calls,0);assert.equal(result.status,'Observed');
});
test('field receipt source forwarding avoids later application array iterator and methods',()=>{
 const f=fixture(),keys=[Symbol.iterator,'push','pop'],descriptors=keys.map(key=>Object.getOwnPropertyDescriptor(Array.prototype,key));let calls=0,result,error;
 // Avoid the fixture helper's deliberate array spreads while private prototypes are patched.
 const input=f.hook.memoizedState,action={payload:{id:1,title:'SAME'}},update={action},hook={queue:f.queue,memoizedState:input,next:null},token={};
 try{for(let i=0;i<keys.length;i++)Object.defineProperty(Array.prototype,keys[i],{configurable:true,get(){calls++;throw Error('late app Array getter')}});
  try{f.api.tap('dispatch',f.queue,update,f.fiber,action);f.api.tap('begin',hook,f.hook,f.queue,f.fiber);f.api.tap('reducer-call-begin',token,f.reducer,input,action);const rows=f.reducer(input,action);f.api.tap('reducer-call-complete',rows,token);f.api.tap('reducer-applied',rows,hook,f.queue,update,input,action,f.fiber,f.reducer,token);hook.memoizedState=rows;f.api.tap('state-result',[rows,f.queue.dispatch],hook,f.fiber);f.fiber.memoizedState=hook;f.api.tap('root-current',f.root,f.rootFiber);result=f.api.matchReducerFieldWrite(f.node,rows[0]);}catch(e){error=e;}
 }finally{for(let i=0;i<keys.length;i++)Object.defineProperty(Array.prototype,keys[i],descriptors[i]);}
 assert.equal(error,undefined);assert.equal(calls,0);assert.equal(result.status,'Observed');
});

test('enabled field collection avoids later application Map Set and weak-collection methods',()=>{
 const f=fixture(),changes=[[WeakMap.prototype,'get'],[WeakMap.prototype,'set'],[WeakSet.prototype,'has'],[Set.prototype,'has'],[Set.prototype,'add'],[Map.prototype,'get']],saved=changes.map(([p,k])=>Object.getOwnPropertyDescriptor(p,k));let calls=0,result,error;
 try{for(let i=0;i<changes.length;i++)Object.defineProperty(changes[i][0],changes[i][1],{configurable:true,get(){calls++;throw Error('late collection getter')}});try{const call=f.run();result=f.api.matchReducerFieldWrite(f.node,call.result[0]);}catch(e){error=e;}}
 finally{for(let i=0;i<changes.length;i++)Object.defineProperty(changes[i][0],changes[i][1],saved[i]);}
 assert.equal(error,undefined);assert.equal(calls,0);assert.equal(result.status,'Observed');
});

test('unregistered boolean state frame between selection and edit preserves list receipt acquisition',()=>{
 const f=fixture();f.run();const token={},basicStateReducer=(state,action)=>action;f.api.tap('reducer-call-begin',token,basicStateReducer,false,true);f.api.tap('reducer-call-complete',true,token);f.api.tap('reducer-applied',true,{}, {},{},false,true,f.fiber,basicStateReducer,token);const {result}=f.run();assert.equal(f.api.matchReducerFieldWrite(f.node,result[0]).status,'Observed');
});
