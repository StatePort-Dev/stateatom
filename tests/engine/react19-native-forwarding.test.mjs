// SPDX-License-Identifier: Apache-2.0
// Actual product source paths; authored native shape is never native React proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {transformReact19Grammar} from '../../src/engine/react19-vendor.mjs';
import {createReact19Acquisition} from '../../src/engine/react19-acquisition.mjs';
import {createObserver} from '../../src/engine/observer.mjs';
const grammar=`'use strict';function ReactElement(type,key,props,owner,debugStack,debugTask){type={props};return type;}exports.run=function(props){return ReactElement(null,null,props,null,null,null);};`;
const contract={status:'Observed',adapter:'react19-state-ancestors/1',versions:{react:'19.2.5','react-dom':'19.2.5'}};
function underIterator(callback,{throwing=false}={}){const saved=Array.prototype[Symbol.iterator],sentinel={};let calls=0,caught;try{Array.prototype[Symbol.iterator]=function(){calls++;if(throwing)throw sentinel;return Reflect.apply(saved,this,[]);};try{callback();}catch(e){caught=e;}}finally{Array.prototype[Symbol.iterator]=saved;}return{calls,caught,sentinel};}
function observer({enabled=true,admit=true}={}){class R extends Response{};const w={crypto,fetch,Response:R,WeakRef,location:{href:'http://127.0.0.1:4173/'}};const api=createObserver(w,{react19StateAncestors:enabled});if(enabled&&admit)api.enableReact19Probe(contract);return api;}
for(const throwing of [false,true])test('vendor forwarding bypasses late '+(throwing?'throwing':'mutating')+' app iterator and preserves metadata receiver/arity',()=>{
 const c=vm.createContext({exports:{}}),events=[];c.__STATEATOM__={react19NativeTap(){events.push({receiver:this===c.__STATEATOM__,count:arguments.length,kind:arguments[0],value:arguments[1],props:arguments[2]});}};
 vm.runInContext(transformReact19Grammar(grammar,'react/cjs/react.development.js').code,c);
 vm.runInContext(`globalThis.calls=0;globalThis.mutated=false;globalThis.saved=Array.prototype[Symbol.iterator];Array.prototype[Symbol.iterator]=function(){calls++;mutated=true;${throwing?'throw {};':'return Reflect.apply(saved,this,[]);'}};globalThis.props={};globalThis.element=exports.run(props);Array.prototype[Symbol.iterator]=saved;`,c);
 assert.equal(c.calls,0);assert.equal(c.mutated,false);assert.equal(events.length,1);assert.equal(events[0].count,3);assert.equal(events[0].receiver,true);assert.equal(events[0].kind,'element');assert.equal(events[0].value,c.element);assert.equal(events[0].props,c.props);
});
for(const throwing of [false,true])test('collector tap bypasses late '+(throwing?'throwing':'ordinary')+' app iterator without dropping native metadata',()=>{
 const c=createReact19Acquisition({page:'forwarding'}),rootFiber={tag:3},root={current:rootFiber};
 const r=underIterator(()=>{c.tap('fiber',rootFiber);c.tap('root',root);c.tap('root-current',root,rootFiber);},{throwing});
 assert.equal(r.calls,0);assert.equal(r.caught,undefined);assert.equal(c.retention().available,true);assert.equal(c.retention().events,1);c.stop();
});
for(const throwing of [false,true])test('admitted observer forwarding bypasses late '+(throwing?'throwing':'ordinary')+' app iterator',()=>{
 const api=observer(),fiber={};const r=underIterator(()=>api.react19NativeTap('fiber',fiber),{throwing});api.stop();assert.equal(r.calls,0);assert.equal(r.caught,undefined);
});
for(const mode of ['disabled','unadmitted','stopped','stale'])test(mode+' product observer still refuses metadata without invoking app iterator',()=>{const api=observer({enabled:mode!=='disabled',admit:mode!=='unadmitted'});if(mode==='stopped')api.stop();if(mode==='stale')api.invalidate('changed');const r=underIterator(()=>api.react19NativeTap('root-current',{},{}),{throwing:true});api.stop();assert.equal(r.calls,0);assert.equal(r.caught,undefined);});
test('stopped collector tap remains inert under throwing iterator',()=>{const c=createReact19Acquisition({page:'stopped'});c.stop();const r=underIterator(()=>c.tap('fiber',{}),{throwing:true});assert.equal(r.calls,0);assert.equal(r.caught,undefined);assert.equal(c.retention().stopped,true);});
test('vendor bridge keeps minimum kind/value and every supplied argument position',()=>{const c=vm.createContext({exports:{}}),events=[];c.__STATEATOM__={react19NativeTap(){const row={count:arguments.length,values:[]};for(let i=0;i<arguments.length;i++)row.values.push(arguments[i]);events.push(row);}};vm.runInContext(transformReact19Grammar(grammar,'react/cjs/react.development.js').code,c);for(let n=0;n<=11;n++){const args=Array.from({length:n},(_,i)=>i);Reflect.apply(c.__sa19Tap,undefined,args);assert.equal(events[n].count,n<2?2:n);assert.deepEqual(events[n].values,n>=2?args:n===1?[0,undefined]:[undefined,undefined]);}assert.equal(c.__sa19Tap.length,2);});
test('native reducer ninth slot and original state/input/action identities survive real API/collector forwarding',()=>{
 const api=observer(),state={},nextState={},action={},reducer=()=>nextState,queue={dispatch(){}},old={queue,memoizedState:state,next:null},next={queue,memoizedState:state,next:null},host={tag:5,stateNode:{}},fiber={tag:0,memoizedState:old,child:host},finished={tag:3,child:fiber},root={current:finished},update={};
 api.react19NativeTap('fiber',finished);api.react19NativeTap('fiber',fiber);api.react19NativeTap('fiber',host);api.react19NativeTap('root',root);api.react19NativeTap('state-result',[state,queue.dispatch],old,fiber);api.react19NativeTap('root-current',root,finished);
 const before=api.snapshot(null,'text',host.stateNode).nativeStateAncestors;
 const r=underIterator(()=>{api.react19NativeTap('dispatch',queue,update,fiber,action);api.react19NativeTap('begin',next,old,queue,fiber);api.react19NativeTap('reducer-applied',nextState,next,queue,update,state,action,fiber,reducer);},{throwing:true});
 next.memoizedState=nextState;fiber.memoizedState=next;api.react19NativeTap('state-result',[nextState,queue.dispatch],next,fiber);api.react19NativeTap('root-current',root,finished);
 const after=api.snapshot(null,'text',host.stateNode).nativeStateAncestors;api.stop();assert.equal(r.calls,0);assert.equal(r.caught,undefined);assert.equal(after.status,'Observed');assert.equal(after.ancestors[0].inputId,before.ancestors[0].resultId);assert.equal(after.ancestors[0].updateOriginStatus,'Observed');assert.equal(typeof after.ancestors[0].reducerId,'string');assert.equal(after.fieldOwnership,'Unknown/Unsupported');assert.equal(after.fullPath,false);
});
test('product forwarders preserve zero declared parameters and isolate collector failures',()=>{const api=observer(),c=createReact19Acquisition({page:'shape'});assert.equal(api.react19NativeTap.length,0);assert.equal(c.tap.length,0);const proxy=new Proxy({},{getOwnPropertyDescriptor(){throw Error('metadata unavailable');}});assert.doesNotThrow(()=>c.tap('state-result',[],proxy,{}));api.stop();c.stop();});

const {build}=await import('esbuild');
const {nativeForwardingGrammar,nativeForwardingCases,executeNativeForwardingSource}=await import('../helpers/react19-native-forwarding-controls.mjs');
const productBundle=(await build({entryPoints:['src/engine/observer.mjs'],bundle:true,write:false,format:'iife',globalName:'__StateAtomForwardingProduct',platform:'browser',target:'es2022',legalComments:'inline'})).outputFiles[0].text;
for(const id of nativeForwardingCases)test('actual bundled observer/source config original/off/on: '+id,()=>{
 const transformed=transformReact19Grammar(nativeForwardingGrammar,'react/cjs/react.development.js');
 const original=executeNativeForwardingSource({source:nativeForwardingGrammar,observerBundle:productBundle,caseName:id,mode:'original'}),off=executeNativeForwardingSource({source:transformed.code,observerBundle:productBundle,caseName:id,mode:'off'}),on=executeNativeForwardingSource({source:transformed.code,observerBundle:productBundle,caseName:id});
 assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.trace,original.trace);assert.deepEqual(off.trace,original.trace);
 assert.equal(on.summary.iteratorCalls,0);assert.equal(on.summary.mutation,0);assert.equal(on.summary.proxyItemTraps,0);assert.equal(on.summary.helperFrame,false);assert.equal(on.metadata.accessorReads,0);
 const expected=['throw-getter','missing-runtime','runtime-accessor','tap-accessor'].includes(id)?0:1;
 assert.equal(on.metadata.calls,expected);assert.equal(off.metadata.calls,expected);assert.equal(original.metadata.calls,0);
 if(expected){assert.equal(on.metadata.arity,3);assert.equal(on.metadata.kind,'element');assert.equal(on.metadata.receiverSame,true);assert.equal(on.metadata.elementSame,true);assert.equal(on.metadata.propsSame,true);}
 assert.equal(on.nativeAncestors.status,'Unknown/Unsupported');assert.equal(on.nativeAncestors.fullPath,false);assert.equal(on.nativeAncestors.fieldOwnership,'Unknown/Unsupported');
 if(id==='throw-getter')assert.equal(on.summary.sameThrown,true);if(id==='getter')assert.equal(on.summary.getterReads,1);
});
test('qualification runner import is inert and flags refuse before source/bundle/VM work',async()=>{const {runProductForwardingSourceQualification}=await import('../../experiments/react19-reducer/product-forwarding-source-run.mjs');await assert.rejects(runProductForwardingSourceQualification(['--unknown']),e=>e.code==='INVALID_ARGUMENTS');});
