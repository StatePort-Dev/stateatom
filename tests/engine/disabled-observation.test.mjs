// SPDX-License-Identifier: Apache-2.0
// Synthetic native boundary and helper realm; actual MV3 is a separate gate.
import test from 'node:test';import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {createBrowserEngine} from '../../src/engine/browser.mjs';
import {createNativeDOMQueue} from '../../browser-extension/picker.mjs';
function fixture({kind='textarea',disabled=false,change,trace=false}={}){
 const state={kind,disabled,node:102,document:101,getters:0,constructors:0,scripts:0,queued:0,active:0,peak:0};
 function Button(){}
 Object.defineProperty(Button.prototype,'disabled',{get(){state.getters++;throw Error('App prototype getter invoked');}});
 const element=Object.assign(Object.create(Button.prototype),{getAttribute:name=>name==='data-stateatom'?'original-instance':null});
 Object.defineProperty(element,'disabled',{get(){state.getters++;throw Error('App getter invoked');}});
 const context={document:{querySelector:()=>element},window:{__STATEATOM__:{version:1,page:'original-page',snapshot(){return{status:'Observed',page:'original-page',target:{id:'original-target',value:false},nodes:[]};}}}};
 Object.defineProperty(context,'HTMLButtonElement',{get(){state.constructors++;return Button;}});
 const queue=createNativeDOMQueue(),listeners=new Set();
 const execute=(func,args,bound)=>{state.scripts++;const realm={args,bound};Object.defineProperties(realm,Object.getOwnPropertyDescriptors(context));return runInNewContext('('+func+').apply(bound,args)',realm);};
 const chrome={debugger:{onEvent:{addListener:f=>listeners.add(f),removeListener:f=>listeners.delete(f)},async sendCommand(_,method,params){await new Promise(r=>setImmediate(r));
  if(method==='DOM.enable'||method==='Runtime.releaseObjectGroup')return{};
  if(method==='DOM.resolveNode')return{object:{objectId:'exact-node'}};
  if(method==='DOM.requestNode')return{nodeId:2};
  if(method==='Runtime.callFunctionOn')return{result:{value:execute(params.functionDeclaration,params.arguments.map(a=>a.value),element)}};
  if(method==='DOM.getDocument')return{root:{nodeId:1,backendNodeId:state.document}};
  if(method==='DOM.querySelector')return{nodeId:state.node&&(!params.selector.endsWith('[disabled]')||state.disabled)?2:0};
  if(method==='DOM.describeNode')return{node:{nodeId:2,backendNodeId:state.node,nodeType:1,nodeName:state.kind.toUpperCase(),localName:state.kind,attributes:state.disabled?['disabled','']:[]}};
  throw Error('Unexpected command '+method);
 }},scripting:{}};
 // Preserve accessors when creating the synthetic realm, rather than invoking
 // them in the test adapter or passing their descriptors as ordinary values.
 chrome.scripting.executeScript=async operation=>[{result:execute(operation.func.toString(),operation.args)}];
 const engine=createBrowserEngine(chrome,{readDOM:(id,read)=>queue(id,async()=>{state.queued++;state.active++;state.peak=Math.max(state.peak,state.active);try{return await read();}finally{state.active--;}})});
 const observe=()=>engine.observeDeep(9,{selector:'#control'},'disabled',{includeTrace:trace,beforeMainScript:async()=>{change?.(state);}});
 return{state,observe};
}
for(const kind of ['button','input','textarea'])test(kind+' deep disabled value uses native data without disabled getter or constructor access',async()=>{
 for(const trace of [false,true])for(const disabled of [false,true]){const f=fixture({kind,disabled,trace}),r=await f.observe();assert.equal(r.value,disabled);assert.equal(r.property,'disabled');assert.equal(f.state.getters,0);assert.equal(f.state.constructors,0);assert.equal(f.state.scripts,trace?1:0);assert.equal(f.state.queued,1);}
});
for(const change of ['node','document','disabled'])test('deep disabled '+change+' change cannot borrow old value or Observed trace',async()=>{
 const f=fixture({trace:true,change:s=>{s[change]=change==='disabled'?true:s[change]+1;}}),r=await f.observe();assert.equal(r.status,'Stale');assert.equal(r.value,undefined);assert.equal(r.trace?.status,'Stale');assert.equal(r.trace?.target,null);assert.equal(f.state.getters,0);assert.equal(f.state.constructors,0);
});
test('unsupported disabled element runs no helper and reports an explicit unavailable boundary',async()=>{
 const f=fixture({kind:'select'}),r=await f.observe();assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.value,undefined);assert.equal(f.state.scripts,0);assert.match(r.reason,/disabled|native|unsupported/i);
});
test('concurrent disabled observations share the supplied native DOM queue',async()=>{
 const f=fixture();const values=await Promise.all([f.observe(),f.observe()]);assert(values.every(r=>r.value===false));assert.equal(f.state.peak,1);assert.equal(f.state.queued,2);
});
test('a mismatched target trace cannot borrow the measured native disabled value',async()=>{
 const f=fixture({disabled:true,trace:true}),r=await f.observe();assert.equal(r.value,true);assert.equal(r.trace.status,'Unknown/Unsupported');assert.equal(r.trace.targetCorrespondence,'mismatch');assert.equal(f.state.getters,0);
});
test('text observation retains its three serializable arguments and original text value',async()=>{
 let args;const engine=createBrowserEngine({debugger:{sendCommand(){throw Error('Text helper must not acquire disabled metadata');}},scripting:{executeScript:async operation=>{
  args=operation.args;function Node(){};Object.defineProperty(Node.prototype,'textContent',{get(){return '  Original text  ';}});
  return[{result:runInNewContext('('+operation.func.toString()+')(...args)',{args,Node,document:{querySelector:()=>({getAttribute:()=>null})}})}];
 }}});
 const r=await engine.observeDeep(9,{selector:'#text'},'text',{includeTrace:false});assert.equal(r.value,'Original text');assert.deepEqual(args,['#text','text',false]);
});
