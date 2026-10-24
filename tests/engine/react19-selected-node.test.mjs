// SPDX-License-Identifier: Apache-2.0
// Synthetic scripting/CDP boundary. Native installation is a separate Task3 gate.
import test from 'node:test';import assert from 'node:assert/strict';import {runInNewContext} from 'node:vm';
import {createBrowserEngine} from '../../src/engine/browser.mjs';
function fixture({marker=null,enabled=true,mode='data',change=false}={}){
 let snapshots=0,accessors=0,selected='a';const node={getAttribute:()=>marker},foreign={getAttribute:()=>marker};
 const runtime={version:1,page:'test-page',snapshot(instance,property,actual){snapshots++;assert.equal(actual,node);assert.equal(instance,marker);if(change)selected='b';return{status:'Unknown/Unsupported',target:null,nativeStateAncestors:{status:'Observed',nodeId:'exact-node',ancestors:[{resultId:'opaque'}],selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false}};}};
 if(mode==='accessor')Object.defineProperty(runtime,'nativeStateAcquisition',{get(){accessors++;return true;}});else runtime.nativeStateAcquisition=enabled;
 function Node(){};Object.defineProperty(Node.prototype,'textContent',{get(){return 'same text';}});
 const context={Node,window:{__STATEATOM__:runtime},document:{querySelector:()=>selected==='a'?node:foreign}},listeners=new Set(),commands=[];
 const chrome={scripting:{executeScript:async op=>[{result:runInNewContext('('+op.func.toString()+')(...args)',{...context,args:op.args})}]},debugger:{onEvent:{addListener:f=>listeners.add(f),removeListener:f=>listeners.delete(f)},async sendCommand(_,method,p){
  commands.push(method);if(method==='DOM.enable'||method==='Runtime.releaseObjectGroup')return{};
  if(method==='DOM.getDocument')return{root:{nodeId:1,backendNodeId:101}};
  if(method==='DOM.querySelector')return{nodeId:p.selector.endsWith('[disabled]')?0:2};
  if(method==='DOM.describeNode')return{node:{nodeId:2,backendNodeId:selected==='a'?102:103,nodeType:1,nodeName:'BUTTON',localName:'button',attributes:[]}};
  if(method==='DOM.resolveNode')return{object:{objectId:'exact-node'}};
  if(method==='DOM.requestNode')return{nodeId:2};
  if(method==='Runtime.callFunctionOn')return{result:{value:runInNewContext('('+p.functionDeclaration+').apply(bound,args)',{...context,bound:node,args:p.arguments.map(a=>a.value)})}};
  throw Error(method);
 }}};
 return{engine:createBrowserEngine(chrome),listeners,commands,get snapshots(){return snapshots;},get accessors(){return accessors;}};
}
for(const property of['text','disabled']){
 test(property+' unmarked selection reads explicit React19 acquisition without fabricating a target producer',async()=>{
  const f=fixture(),r=await f.engine.observeDeep(1,{selector:'#actual'},property,{includeTrace:true});
  assert.equal(f.snapshots,1);assert.equal(r.trace.status,'Unknown/Unsupported');assert.equal(r.trace.target,null);
  assert.equal(r.trace.nativeStateAncestors.status,'Observed');assert.equal(r.instance,null);assert.equal(f.listeners.size,0);
 });
 test(property+' unmarked selection does not broaden old runtime or invoke the feature accessor',async()=>{
  for(const options of[{enabled:false},{mode:'accessor'}]){const f=fixture(options),r=await f.engine.observeDeep(1,{selector:'#actual'},property,{includeTrace:true});assert.equal(r.trace,null);assert.equal(f.snapshots,0);assert.equal(f.accessors,0);}
 });
 test(property+' includeTrace false does not call optional instrumentation on an unmarked target',async()=>{
  const f=fixture(),r=await f.engine.observeDeep(1,{selector:'#actual'},property,{includeTrace:false});assert.equal(r.trace,null);assert.equal(f.snapshots,0);
 });
}
test('disabled helper refuses a replaced unmarked node and releases the exact native object group',async()=>{
 const f=fixture({change:true}),r=await f.engine.observeDeep(1,{selector:'#actual'},'disabled',{includeTrace:true});
 assert.equal(r.status,'Stale');assert.notEqual(r.trace?.nativeStateAncestors?.status,'Observed');assert.equal(f.listeners.size,0);assert(f.commands.includes('Runtime.releaseObjectGroup'));
});
