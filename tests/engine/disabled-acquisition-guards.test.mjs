// SPDX-License-Identifier: Apache-2.0
// Synthetic CDP event/remote-object boundaries; not native browser proof.
import test from 'node:test';import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {createBrowserEngine} from '../../src/engine/browser.mjs';
function fixture({filtered,shadowFailure=false,mode}={}){
 const listeners=new Set(),calls=[],state={selected:'A',disabled:false};
 const emit=method=>{for(const f of listeners)f({tabId:1},method,{nodeId:2});};
 const elements=Object.fromEntries(['A','B'].map(id=>[id,{id,getAttribute:()=> 'same-marker'}]));
 const realm={document:{querySelector:()=>elements[state.selected]},window:{__STATEATOM__:{version:1,page:'p',snapshot(marker,property,e){return{status:'Observed',page:'p',target:{id:'target-'+e.id,value:state.disabled},nodes:[]};}}}};
 function execute(func,args,bound){
  if(mode==='node-aba')state.selected='B';
  if(mode==='value-aba'){state.disabled=true;emit('DOM.attributeModified');}
  const result=runInNewContext('('+func+').apply(bound,args)',{...realm,args,bound});
  if(mode==='node-aba')state.selected='A';
  if(mode==='value-aba'){state.disabled=false;emit('DOM.attributeRemoved');}
  return result;
 }
 let shadowQueries=0;
 const chrome={debugger:{onEvent:{addListener:f=>listeners.add(f),removeListener:f=>listeners.delete(f)},async sendCommand(_,m,p){
  calls.push({m,p});if(m==='DOM.enable'||m==='Runtime.releaseObjectGroup')return{};
  if(m==='DOM.getDocument')return{root:{nodeId:1,backendNodeId:101}};
  if(m==='DOM.querySelector'){
   if(p.selector==='#host'){shadowQueries++;return{nodeId:shadowFailure&&shadowQueries===2?0:7};}
   if(p.selector.endsWith('[disabled]')&&filtered!==undefined)return filtered;
   return{nodeId:p.selector.endsWith('[disabled]')&&!state.disabled?0:2};
  }
  if(m==='DOM.describeNode'){if(p.nodeId===7)return{node:{shadowRoots:[{shadowRootType:'open',backendNodeId:107}]}};return{node:{nodeId:2,backendNodeId:102,nodeType:1,nodeName:'TEXTAREA',localName:'textarea',attributes:state.disabled?['disabled','']:[]}};}
  if(m==='DOM.pushNodesByBackendIdsToFrontend')return{nodeIds:[8]};
  if(m==='DOM.resolveNode')return{object:{objectId:'node-A',type:'object',subtype:'node'}};
  if(m==='DOM.requestNode')return{nodeId:2};
  if(m==='Runtime.callFunctionOn')return{result:{type:'object',value:execute(p.functionDeclaration,p.arguments.map(a=>a.value),elements.A)}};
  throw Error(m);
 }},scripting:{async executeScript(op){return[{result:execute(op.func.toString(),op.args,undefined)}];}}};
 return{engine:createBrowserEngine(chrome),calls,state,listeners};
}
for(const filtered of [{},{nodeId:null},{nodeId:-1},{nodeId:'0'},{nodeId:2.5}])test('malformed disabled filtered response '+JSON.stringify(filtered)+' stays unavailable',async()=>{
 const f=fixture({filtered});assert.equal(await f.engine.identifySelection(1,'#field','disabled'),null);
});
test('successful terminal filtered no-match still means own disabled false',async()=>{
 const f=fixture({filtered:{nodeId:0}});assert.equal((await f.engine.identifySelection(1,'#field','disabled')).value,false);
});
test('Basic disabled value needs no MAIN helper or remote function execution',async()=>{
 const f=fixture();let declared=0;const r=await f.engine.observeDeep(1,{selector:'#field'},'disabled',{includeTrace:false,beforeMainScript:async()=>declared++});
 assert.equal(r.value,false);assert.equal(r.trace,null);assert.equal(declared,0);assert(!f.calls.some(c=>c.m==='Runtime.callFunctionOn'));
});
test('missing intermediate shadow scope cannot become a known disabled false',async()=>{
 const f=fixture({shadowFailure:true});assert.equal(await f.engine.identifySelection(1,'#host >>> #field','disabled'),null);
});
for(const mode of ['node-aba','value-aba'])test(mode+' cannot lend a different occurrence or restored value an Observed trace',async()=>{
 const f=fixture({mode}),r=await f.engine.observeDeep(1,{selector:'#field'},'disabled',{includeTrace:true});
 assert.notEqual(r.trace?.status,'Observed');assert.equal(r.value,undefined);assert.equal(r.trace?.target,null);
 assert.equal(f.listeners.size,0,'Transient native watcher must be released');
});
test('disabled native function declaration is declared exactly before calling the resolved node and releases the group',async()=>{
 const f=fixture();let owned;const r=await f.engine.observeDeep(1,{selector:'#field'},'disabled',{includeTrace:true,beforeMainScript:async op=>{owned=op;assert(!f.calls.some(c=>c.m==='Runtime.callFunctionOn'));}});
 const call=f.calls.find(c=>c.m==='Runtime.callFunctionOn');assert(call);assert.equal(call.p.objectId,'node-A');assert.equal(call.p.functionDeclaration,owned.func.toString());assert.equal(owned.compilation,'call-function-on');assert.equal(r.trace.target.id,'target-A');assert.equal(r.trace.status,'Observed');assert(f.calls.some(c=>c.m==='DOM.requestNode'));assert(f.calls.some(c=>c.m==='Runtime.releaseObjectGroup'));assert.equal(f.listeners.size,0);
});
