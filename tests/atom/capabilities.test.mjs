// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {describeCapabilities,operationPolicy} from '../../packages/atom/src/capabilities.mjs';
import {createAtomRuntime} from '../../packages/atom/src/runtime.mjs';
import {createChromePlatform,createDebuggerBroker,createEventHub} from '../../packages/atom/src/platform.mjs';
import {validateRequest,supportsCapabilityPolicy} from '../../packages/atom/src/transport.mjs';

const context={url:'http://127.0.0.1:4173/react/',permission:true,grants:['read','inject','reload','cache','override','replay'],lease:'none'};
const message=payload=>({version:1,id:crypto.randomUUID(),session:'capability-test',payload});
function fixture({url=context.url,permission=true,grants=context.grants,initial={}}={}){
 const calls=[],data={'stateport.atom.v1.connections':[{origin:new URL(url).origin,mode:url.startsWith('http:')?'development':'read-only',actions:url.startsWith('http:')?context.grants.filter(c=>!['read','inject'].includes(c)):[]}],'stateport.atom.v1.tabs':initial};
 const area={get:async keys=>Object.fromEntries(keys.filter(k=>k in data).map(k=>[k,data[k]])),set:async v=>Object.assign(data,v)};
 const api={permissions:{contains:async()=>permission},runtime:{id:'test',sendMessage:async()=>{}},storage:{local:area,session:area},tabs:{query:async()=>[{id:1,url}],get:async()=>({id:1,url}),reload:async()=>calls.push('reload'),onUpdated:{addListener(){},removeListener(){}}},debugger:{attach:async()=>calls.push('attach'),detach:async()=>calls.push('detach'),sendCommand:async(_,m)=>{calls.push(m);return m==='Page.getFrameTree'?{frameTree:{frame:{id:'frame'}}}:{};}},scripting:{executeScript:async()=>{calls.push('inject');return[];}}};
 const events=createEventHub(),broker=createDebuggerBroker(api.debugger),platform=createChromePlatform(api,{events,broker,capabilities:grants,readOnlySites:true});
 return {calls,api,broker,platform,runtime:createAtomRuntime(platform,{readOnlySites:true})};
}
test('Basic can inspect without a helper; connecting source never fabricates operands or invocation',()=>{
 const basic=describeCapabilities(context);
 assert.equal(basic.features['basic.inspect'].available,true);
 assert.equal(basic.features['source.navigate'].available,false);
 assert.match(basic.features['source.navigate'].reason,/source|IDE/i);
 const source=describeCapabilities({...context,sourceConnected:true,instrumented:true});
 assert.equal(source.features['source.navigate'].available,true);
 assert.equal(source.features['inputs.observed'].available,false);
 assert.match(source.features['inputs.observed'].reason,/supported|observ/i);
 assert.equal(source.features['actions.trace'].available,false);
 assert.equal(source.features['inputs.live'].available,false);
 assert.equal(source.features['inputs.draft-apply'].available,false);
 assert.equal(source.features['production.changes'].available,false);
});
test('read-only source access and existing observations never authorize production mutation',()=>{
 const view=describeCapabilities({...context,url:'https://app.invalid/',readOnlySites:true,readOnly:true,attached:true,lease:'owned',sourceConnected:true,hasSelection:true,hasAnalysis:true});
 assert.equal(view.features['basic.inspect'].available,true);
 assert.equal(view.features['production.maps'].available,true);
 for(const op of ['experiment','deep-experiment','restore','open','definitions','references']){
  assert.equal(view.operations[op].available,false,op);assert.match(view.operations[op].reason,/read.only/i);
 }
});
test('a denied HTTPS attach still advertises the separate site-access request, never inspection authority',()=>{
 const c={...context,url:'https://app.invalid/',readOnlySites:true,permission:false};
 const view=describeCapabilities(c);
 assert.equal(view.operations.attach.available,false);
 assert.equal(view.features['basic.request-site-access'].available,true);
 assert.equal(describeCapabilities({...c,readOnlySites:false}).features['basic.request-site-access'].available,false);
});
test('discovery and direct admission share origin, permission, lease, disposed and grant refusals',()=>{
 for(const [patch,code] of [[{url:'http://localhost.evil:4999/'},'ORIGIN_DENIED'],[{url:'https://app.invalid/',readOnlySites:true,permission:false},'ORIGIN_DENIED'],[{lease:'foreign'},'BUSY'],[{disposed:true},'DISPOSED'],[{grants:['read']},'CAPABILITY_DENIED']]){
  const c={...context,...patch},feature=describeCapabilities(c).features['basic.inspect'];
  assert.equal(feature.available,false);assert.equal(feature.code,code);assert.equal(operationPolicy('inspect-selector',c).code,code);
 }
});
test('capability negotiation refuses legacy and malformed discovery rather than inferring support from wire v1',()=>{
 assert.equal(supportsCapabilityPolicy({version:1}),false);
 assert.equal(supportsCapabilityPolicy({schemaVersion:1,wireVersion:1,featureIds:['basic.inspect']}),false);
 assert.equal(supportsCapabilityPolicy(describeCapabilities(context)),true);
 assert.equal(supportsCapabilityPolicy({...describeCapabilities(context),operations:{}}),false);
 assert.equal(validateRequest(message({op:'capabilities',tabId:1})).payload.op,'capabilities');
 assert.throws(()=>validateRequest(message({op:'capabilities',tabId:1,capabilityVersion:2})),{code:'INVALID_MESSAGE'});
});
test('capabilities are side-effect-free; a foreign lease returns the same reason and blocks direct injection',async()=>{
 const f=fixture();const foreign=await f.broker.acquire({tabId:1,owner:'Capture',capabilities:['read']});
 try{
  const view=await f.runtime.request(message({op:'capabilities',tabId:1}));
  assert.equal(view.features['basic.inspect'].code,'BUSY');assert.deepEqual(f.calls,[]);
  await assert.rejects(f.runtime.request(message({op:'inspect-selector',tabId:1,selector:'#p1'})),{code:'BUSY'});
  assert.deepEqual(f.calls,[]);
 }finally{await f.runtime.shutdown();await foreign.release();}
});
test('missing browser permission stays denied even when callers forge availability in the request',async()=>{
 const f=fixture({url:'https://app.invalid/',permission:false});
 try{
  const v=await f.runtime.request(message({op:'capabilities',tabId:1}));assert.equal(v.operations.pick.code,'ORIGIN_DENIED');
  await assert.rejects(f.runtime.request(message({op:'pick',tabId:1,capabilityPolicy:{available:true}})),{code:'ORIGIN_DENIED'});
  assert.deepEqual(f.calls,[]);
 }finally{await f.runtime.shutdown();}
});
test('source connection does not need recorded operands, and stale metadata cannot enable an experiment',async()=>{
 const f=fixture({initial:{1:{run:'old',attached:true,requests:[],pending:{},samples:[],sampleEntries:{},events:[],selection:{selector:'#p1',property:'text',value:'13'},analysis:{sources:[]}}}});
 try{
  const s=await f.runtime.request(message({op:'state',tabId:1}));
  assert.equal(s.capabilityPolicy.features['experiment.response'].available,false);
  await assert.rejects(f.runtime.request(message({op:'deep-experiment',tabId:1,variants:[]})));
  assert.deepEqual(f.calls,[]);
 }finally{await f.runtime.shutdown();}
 await assert.rejects(f.runtime.request(message({op:'capabilities',tabId:1})),{code:'DISPOSED'});
});
test('revocation after discovery and restricted synthetic-site permissions deny the next browser operation',async()=>{
 const f=fixture({url:'https://app.invalid/'});let permission=true;f.api.permissions.contains=async()=>permission;
 try{
  assert.equal((await f.runtime.request(message({op:'capabilities',tabId:1}))).operations.pick.available,true);
  permission=false;
  await assert.rejects(f.runtime.request(message({op:'pick',tabId:1})),{code:'ORIGIN_DENIED'});assert.deepEqual(f.calls,[]);
 }finally{await f.runtime.shutdown();}
 const local=fixture({permission:false});try{assert.equal((await local.runtime.request(message({op:'capabilities',tabId:1}))).features['basic.inspect'].code,'ORIGIN_DENIED');}finally{await local.runtime.shutdown();}
});
test('a replaced lease with the same owner label is foreign; discovery cannot adopt it',async()=>{
 const f=fixture();const lease=await f.broker.acquire({tabId:1,owner:'atom',capabilities:['read']});
 try{assert.equal((await f.runtime.request(message({op:'capabilities',tabId:1}))).features['basic.inspect'].code,'BUSY');assert.deepEqual(f.calls,[]);}finally{await f.runtime.shutdown();await lease.release();}
});
test('caller mutation of grant arrays cannot widen an existing platform or broker lease',async()=>{
 const grants=['read'];const f=fixture({grants});grants.push('inject','cache');
 try{
  assert.equal((await f.runtime.request(message({op:'capabilities',tabId:1}))).features['basic.inspect'].available,false);
  await assert.rejects(f.runtime.request(message({op:'inspect-selector',tabId:1,selector:'#p1'})),{code:'CAPABILITY_DENIED'});assert.deepEqual(f.calls,[]);
 }finally{await f.runtime.shutdown();}
 const values=['read'],broker=createDebuggerBroker({attach:async()=>{},sendCommand:async()=>{throw Error('should not execute');},detach:async()=>{}});
 const lease=await broker.acquire({tabId:1,owner:'test',capabilities:values});values.push('cache');
 try{await lease.attach();await assert.rejects(lease.command('Network.clearBrowserCache'),{code:'CAPABILITY_DENIED'});}finally{await lease.release();}
});
test('missing or invalid custom-platform lease facts cannot claim browser admission',async()=>{
 for(const lease of [undefined,'unrecognised'])assert.equal(describeCapabilities({...context,lease}).features['basic.inspect'].code,'CAPABILITY_UNAVAILABLE');
 const f=fixture();f.platform.describeTarget=async()=>({url:context.url,permission:true,grants:[...context.grants]});
 try{
  assert.equal((await f.runtime.request(message({op:'capabilities',tabId:1}))).features['basic.inspect'].available,false);
  await assert.rejects(f.runtime.request(message({op:'inspect-selector',tabId:1,selector:'#p1'})),{code:'CAPABILITY_UNAVAILABLE'});assert.deepEqual(f.calls,[]);
 }finally{await f.runtime.shutdown();}
});
test('state refresh with denied inspection authority returns metadata without any operand injection',async()=>{
 const f=fixture({permission:false,initial:{1:{run:'old',attached:true,requests:[],pending:{},samples:[],sampleEntries:{},events:[],selection:{selector:'#p1',property:'text',value:'13'},analysis:{stateatom:{runtime:{status:'Observed'}},sources:[],graph:{nodes:[],edges:[]}}}}});
 try{
  const view=await f.runtime.request(message({op:'capabilities',tabId:1}));assert.equal(view.operations['inspect-selector'].code,'ORIGIN_DENIED');
  const state=await f.runtime.request(message({op:'state',tabId:1,refreshDeep:true}));assert.equal(state.capabilityPolicy.operations['inspect-selector'].available,false);assert.deepEqual(f.calls,[]);
 }finally{await f.runtime.shutdown();}
});
test('cancelling while target admission waits cannot later attach or change cache policy',async()=>{
 const f=fixture(),original=f.platform.describeTarget;let release,started;
 const wait=new Promise(r=>release=r),begun=new Promise(r=>started=r);
 f.platform.describeTarget=async id=>{started();await wait;return original(id);};
 const m=message({op:'attach',tabId:1}),pending=f.runtime.request(m);await begun;f.runtime.cancel(m.session,m.id);await assert.rejects(pending,{code:'CANCELLED'});
 release();await new Promise(r=>setTimeout(r,0));
 try{assert.deepEqual(f.calls,[]);}finally{await f.runtime.shutdown();}
});
test('action availability uses the same invalidation projection as returned source bindings',async()=>{
 const state={run:'old',attached:false,requests:[],pending:{},samples:[],sampleEntries:{},events:[],selection:{selector:'#p1',property:'text',value:'13'},analysis:{actionsInvalidated:true,actionBindings:[{freshness:'Fresh',binding:{source:{file:'App.tsx',line:1}}}],sources:[]}};
 const f=fixture({initial:{1:state}});await f.runtime.ready;state.stale=null;
 try{const view=await f.runtime.request(message({op:'state',tabId:1}));assert.equal(view.analysis.actionBindings[0].freshness,'Stale');assert.equal(view.capabilityPolicy.features['actions.source'].available,false);}finally{await f.runtime.shutdown();}
});
test('Restore is unavailable before an investigation exists and remains available for a retained stale target',()=>{
 const attached={...context,attached:true,lease:'owned'};
 assert.equal(describeCapabilities(attached).features['experiment.restore'].code,'OBSERVATION_REQUIRED');
 assert.equal(describeCapabilities({...attached,hasHistoricalTarget:true,stale:true}).features['experiment.restore'].available,true);
});
test('an admitted intervention publishes fresh availability after cleanup, including failure',async()=>{
 const f=fixture({initial:{1:{run:'old',attached:false,requests:[],pending:{},samples:[],sampleEntries:{},events:[],selection:{selector:'#p1',property:'text',value:'13'},analysis:{sources:[]}}}}),events=[];
 f.api.runtime.sendMessage=async e=>events.push(e.event);f.api.tabs.reload=async()=>{throw Error('controlled reload refusal');};
 try{
  await f.runtime.request(message({op:'attach',tabId:1}));
  await assert.rejects(f.runtime.request(message({op:'restore',tabId:1})),/controlled reload refusal/);
  assert(events.includes('state-invalidated'));
  const state=await f.runtime.request(message({op:'state',tabId:1}));assert.equal(state.capabilityPolicy.operations['inspect-selector'].available,true);assert.equal(state.busy,null);
 }finally{await f.runtime.shutdown();}
});

test('read-only broker admits native DOM identity facts but no DOM writes or evaluation',async()=>{
 const calls=[],broker=createDebuggerBroker({attach:async()=>{},detach:async()=>{},sendCommand:async(target,method,params)=>{calls.push({target,method,params});return {nativeFact:true};}}),lease=await broker.acquire({tabId:7,owner:'identity',capabilities:['read']});
 await lease.attach();
 for(const [method,params]of [['DOM.enable',{includeWhitespace:'all'}],['DOM.describeNode',{nodeId:2,depth:32}],['DOM.pushNodesByBackendIdsToFrontend',{backendNodeIds:[3]}]])assert.equal((await lease.command(method,params)).nativeFact,true);
 assert.equal(calls.length,3);
 for(const method of ['Runtime.evaluate','Runtime.compileScript','DOM.setAttributeValue','DOM.setNodeValue','DOM.removeNode'])await assert.rejects(lease.command(method),e=>e.code==='CAPABILITY_DENIED');
 assert.equal(calls.length,3);await lease.release();
});
