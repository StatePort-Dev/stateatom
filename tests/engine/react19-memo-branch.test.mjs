// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {parse} from '@babel/parser';
import {memoBranchGrammar} from '../helpers/react19-memo-branch-grammar.mjs';
const load=()=>import('../../experiments/react19-reducer/memo-branch-transform.mjs'),file='react-dom/cjs/react-dom-client.development.js',sha=s=>createHash('sha256').update(s).digest('hex');
function execute(source,mode,{callThrows=false,propsThrows=false,compareThrows=false,observerThrows=false,hookAccessor=false,missingHook=false,opaque=false,mutateIntrinsics=false}={}){
 const events=[],trace=[],sentinel={},incoming={},previous={},work={},current=mode==='mount'?null:{},lanes={};let getterCalls=0,hookCalls=0,opaqueCalls=0;
 const trap=()=>{opaqueCalls++;throw Error('opaque app value');},Component=opaque?new Proxy(function Item(){},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap,apply:trap}):function Item(){},result=opaque?new Proxy({},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap}):{};
 if(current)Object.defineProperty(current,'memoizedProps',{get(){getterCalls++;trace.push('previous-props');if(propsThrows)throw sentinel;return previous;}});
 const context=vm.createContext({exports:{},tracePrelude(a){trace.push({kind:'bailout-prelude',fiber:a===work});},reusePrevious(a,b){trace.push({kind:'compare',current:a===current,incoming:b===incoming});if(compareThrows)throw sentinel;return mode==='bailout'||mode==='scheduled';},hasUpdate(a,b){trace.push({kind:'scheduled',current:a===current,lanes:b===lanes});return mode==='scheduled';},update:function(a,b,c,d,e){trace.push({kind:'update',receiver:this===undefined,current:a===current,fiber:b===work,component:c===Component,props:d===incoming?'incoming':d===previous?'previous':'foreign',lanes:e===lanes});if(callThrows)throw sentinel;return result;},skip:function(a,b,c){trace.push({kind:'bailout',receiver:this===undefined,current:a===current,fiber:b===work,lanes:c===lanes});if(callThrows)throw sentinel;return result;}});
 if(hookAccessor)Object.defineProperty(context,'__STATEATOM_MEMO_BRANCH_TAP__',{get(){hookCalls++;throw Error('hook getter');}});
 else if(!missingHook)context.__STATEATOM_MEMO_BRANCH_TAP__=(...args)=>{events.push(args);if(observerThrows)throw Error('observer');return {forged:true};};
 vm.runInContext(source,context);if(mutateIntrinsics)vm.runInContext('Object.getOwnPropertyDescriptor=()=>{throw Error("late descriptor");};Reflect.apply=()=>{throw Error("late apply");};',context);
 let returned,caught;try{returned=context.exports.run(current,work,Component,incoming,lanes);}catch(e){caught=e;}
 return{events,trace,sentinel,caught,returned,result,work,Component,incoming,previous,getterCalls,hookCalls,opaqueCalls};
}
for(const mode of ['mount','update','bailout','scheduled'])test('original '+mode+' branch preserves exact native result/arguments/receiver/order and actual props reference',async()=>{
 const m=await load(),r=m.instrumentMemoBranchGrammar(memoBranchGrammar,file);assert.equal(r.skipped,false);
 const a=execute(memoBranchGrammar,mode),b=execute(r.code,mode);assert.deepEqual(b.trace,a.trace);assert.equal(b.returned,b.result);assert.equal(b.events.length,1);
 assert.equal(b.events[0][0],mode==='bailout'?'memo-bailout-return':'memo-function-update-return');assert.equal(b.events[0][1],b.work);assert.equal(b.events[0][2],b.Component);assert.equal(b.events[0][3],mode==='bailout'||mode==='scheduled'?b.previous:b.incoming);assert.match(b.events[0][4],/^[a-f0-9]{64}$/);
 assert.equal(b.getterCalls,mode==='bailout'||mode==='scheduled'?1:0);assert.equal(r.sourceOnly,true);assert.equal(r.nativeVersionAdmitted,false);assert.equal(r.retainedMemoItemQualified,false);assert.deepEqual(r.counts,{functionUpdate:1,bailout:1});
});
for(const mode of ['mount','update','bailout','scheduled'])test('original native '+mode+' error remains identical with no successful branch event',async()=>{
 const m=await load(),r=m.instrumentMemoBranchGrammar(memoBranchGrammar,file),a=execute(memoBranchGrammar,mode,{callThrows:true}),b=execute(r.code,mode,{callThrows:true});assert.equal(a.caught,a.sentinel);assert.equal(b.caught,b.sentinel);assert.deepEqual(b.trace,a.trace);assert.equal(b.events.length,0);
});
for(const fault of ['propsThrows','compareThrows'])test('original '+fault+' cannot force a native branch',async()=>{
 const m=await load(),r=m.instrumentMemoBranchGrammar(memoBranchGrammar,file),a=execute(memoBranchGrammar,'bailout',{[fault]:true}),b=execute(r.code,'bailout',{[fault]:true});assert.equal(b.caught,b.sentinel);assert.deepEqual(b.trace,a.trace);assert.equal(b.events.length,0);
});
for(const option of ['observerThrows','hookAccessor','missingHook'])test(option+' never changes result or invokes a hook getter',async()=>{
 const m=await load(),r=m.instrumentMemoBranchGrammar(memoBranchGrammar,file);for(const mode of ['mount','bailout','scheduled']){const a=execute(memoBranchGrammar,mode),b=execute(r.code,mode,{[option]:true});assert.deepEqual(b.trace,a.trace);assert.equal(b.returned,b.result);assert.equal(b.caught,undefined);assert.equal(b.hookCalls,0);assert.equal(b.events.length,option==='observerThrows'?1:0);}
});
test('opaque component/result and late realm mutations do not add app reflection or replace captured intrinsics',async()=>{
 const m=await load(),r=m.instrumentMemoBranchGrammar(memoBranchGrammar,file);for(const mode of ['mount','bailout','scheduled']){const b=execute(r.code,mode,{opaque:true,mutateIntrinsics:true});assert.equal(b.returned,b.result);assert.equal(b.opaqueCalls,0);assert.equal(b.caught,undefined);assert.equal(b.events.length,1);}
});
test('original comma-expression bailout prelude remains before the one native call',async()=>{
 const m=await load(),source=memoBranchGrammar.replace('return bailoutOnAlreadyFinishedWork(current,workInProgress,renderLanes);','return (tracePrelude(workInProgress),bailoutOnAlreadyFinishedWork(current,workInProgress,renderLanes));'),r=m.instrumentMemoBranchGrammar(source,file);assert.equal(r.skipped,false);
 const a=execute(source,'bailout'),b=execute(r.code,'bailout');assert.deepEqual(b.trace,a.trace);assert.equal(b.returned,b.result);assert.equal(b.events.length,1);assert.equal(b.events[0][3],b.previous);assert.equal(b.trace.filter(x=>x.kind==='bailout-prelude').length,1);
});
for(const [name,change] of [
 ['missing owner',s=>s.replace('function updateSimpleMemoComponent','function otherMemo')],
 ['duplicate owner',s=>s+'\nfunction updateSimpleMemoComponent(a,b,c,d,e){}'],
 ['wrong parameters',s=>s.replace('current,workInProgress,Component,nextProps,renderLanes){\n','current,other,Component,nextProps,renderLanes){\n')],
 ['wrong function operands',s=>s.replace('return updateFunctionComponent(current,workInProgress,Component,nextProps,renderLanes);','return updateFunctionComponent(current,workInProgress,Component,{},renderLanes);')],
 ['extra bailout operand',s=>s.replace('return bailoutOnAlreadyFinishedWork(current,workInProgress,renderLanes);','return bailoutOnAlreadyFinishedWork(current,workInProgress,renderLanes,nextProps);')],
 ['shadowed native callee',s=>s.replace('if(current!==null','function updateFunctionComponent(){}if(current!==null')],
 ['duplicate function call',s=>s.replace('if(current!==null','updateFunctionComponent(current,workInProgress,Component,nextProps,renderLanes);if(current!==null')],
 ['dynamic eval',s=>s.replace('if(current!==null','eval("nextProps");if(current!==null')],
 ['nested props mutation',s=>s.replace('if(current!==null','function mutate(){nextProps={};}if(current!==null')],
 ['helper collision',s=>s+'\nconst __saMemoBranch=1;'],
 ['async owner',s=>s.replace('function updateSimpleMemoComponent','async function updateSimpleMemoComponent')],
 ['generator owner',s=>s.replace('function updateSimpleMemoComponent','function* updateSimpleMemoComponent')],
 ['conditional final return',s=>s.replace('return updateFunctionComponent(current,workInProgress,Component,nextProps,renderLanes);','if(renderLanes)return updateFunctionComponent(current,workInProgress,Component,nextProps,renderLanes);')],
])test('closed memo grammar refuses '+name,async()=>{const m=await load(),source=change(memoBranchGrammar);assert.notEqual(source,memoBranchGrammar);const r=m.instrumentMemoBranchGrammar(source,file);assert.equal(r.skipped,true);assert.equal(r.code,source);assert.equal(r.nativeVersionAdmitted,false);});
test('foreign/malformed/oversized source and unpinned source never acquire pinned memo admission',async()=>{
 const m=await load();for(const [s,f] of [[memoBranchGrammar,'other.js'],['function {',file],['x'.repeat(4*1024*1024+1),file]]){const r=m.instrumentMemoBranchGrammar(s,f);assert.equal(r.skipped,true);assert.equal(r.code,s);}assert.throws(()=>m.transformPinnedMemoBranch(memoBranchGrammar,file));
});
test('actual pinned source composes old native-return/element recipes and memo2sites without execution',async()=>{
 const m=await load(),source=readFileSync('.runtime/todomvc/examples/react/node_modules/react-dom/cjs/react-dom-client.development.js','utf8'),r=m.transformPinnedMemoBranch(source,file);
 assert.equal(sha(source),'806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08');assert.equal(r.skipped,false);assert.equal(r.nativeVersionAdmitted,true);assert.equal(r.retainedMemoItemQualified,false);assert.equal(r.policy.version,'19.2.5');assert.equal(r.policy.sites.length,2);assert.deepEqual(r.counts,{functionUpdate:1,bailout:1});
 assert.deepEqual(r.nativeReturnCounts,{returns:3,renders:2});assert.deepEqual(r.elementFiberCounts,{create:1,update:1,single:1});assert.equal(r.baseCounts.fiber,1);assert.equal(r.baseCounts['root-current'],1);assert.equal(r.nativeReturnPolicy.nativeVersionAdmitted,true);assert.equal(r.elementFiberPolicy.nativeVersionAdmitted,true);
 assert.equal(r.outputDigest,sha(r.code));assert.doesNotThrow(()=>parse(r.code,{sourceType:'script'}));for(const site of r.policy.sites){assert.equal(site.file,file);assert.equal(site.sourceDigest,sha(source));assert.equal(site.owner,'updateSimpleMemoComponent');assert.match(site.id,/^[a-f0-9]{64}$/);}
 assert.equal(r.chainDigests.baseSource,sha(source));assert.equal(r.chainDigests.elementInput,r.chainDigests.nativeReturnOutput);assert.equal(r.chainDigests.memoInput,r.chainDigests.elementOutput);assert.equal(r.chainDigests.memoOutput,r.outputDigest);
 assert.throws(()=>m.transformPinnedMemoBranch(source+'\n',file));
});
