import test from 'node:test';import assert from 'node:assert/strict';
import {createAtomRuntime} from '../../packages/atom/src/runtime.mjs';
import {createChromePlatform,createDebuggerBroker,createEventHub} from '../../packages/atom/src/platform.mjs';
const message=p=>({version:1,id:crypto.randomUUID(),session:'test',payload:p});
function fixture({getTabs=async()=>[],grants,initial={}}={}){
 const data={...initial},calls=[];const area={async get(keys){return Object.fromEntries(keys.filter(k=>k in data).map(k=>[k,data[k]]));},async set(v){Object.assign(data,v);}};
 const api={runtime:{id:'test',sendMessage:async()=>{}},storage:{local:area,session:area},tabs:{query:getTabs,get:async id=>({id,url:'http://127.0.0.1:4173/react/'}),reload:async()=>calls.push('reload'),onUpdated:{addListener(){},removeListener(){}}},debugger:{attach:async()=>calls.push('attach'),detach:async()=>calls.push('detach'),sendCommand:async(_,m)=>{calls.push(m);return m==='Page.getFrameTree'?{frameTree:{frame:{id:'frame'}}}:{};}},scripting:{executeScript:async()=>{calls.push('script');return[];}}};
 const events=createEventHub(),broker=createDebuggerBroker(api.debugger),platform=createChromePlatform(api,{events,broker,capabilities:grants});return {data,calls,broker,events,platform,runtime:createAtomRuntime(platform)};
}
test('restored metadata is Stale and cannot restore leases or dangerous actions',async()=>{
 const f=fixture({initial:{'stateport.atom.v1.tabs':{1:{attached:true,run:'old',events:[],requests:[],pending:{},samples:[],sampleEntries:{},selection:{selector:'#p1',property:'text',value:'13'},analysis:{sources:[]},override:{url:'x'},deepOverrides:[{}],busy:'old'}}}});
 const s=await f.runtime.request(message({op:'state',tabId:1}));assert.equal(s.attached,false);assert.equal(s.stale.status,'Stale');assert.equal(s.override,null);assert.equal(s.deepOverrides,null);assert.equal(s.busy,null);assert.deepEqual(f.calls,[]);await f.runtime.shutdown();
});
test('BUSY and denied capabilities prevent injection, reload, cache and attach',async()=>{
 const f=fixture();const other=await f.broker.acquire({tabId:1,owner:'other',capabilities:['read']});
 for(const op of ['attach','inspect-selector','restore'])await assert.rejects(f.runtime.request(message({op,tabId:1,selector:'#p1'})),{code:'BUSY'});
 assert.deepEqual(f.calls,[]);await f.runtime.shutdown();assert.deepEqual(f.calls,[]);await other.release();
 const denied=fixture({grants:['read']});await assert.rejects(denied.runtime.request(message({op:'inspect-selector',tabId:1,selector:'#p1'})),{code:'CAPABILITY_DENIED'});await assert.rejects(denied.runtime.request(message({op:'restore',tabId:1})),{code:'CAPABILITY_DENIED'});assert.deepEqual(denied.calls,[]);await denied.runtime.shutdown();
});
test('cancel returns promptly, ignores late results and shutdown releases only Atom work',async()=>{
 let resolve;const f=fixture({getTabs:()=>new Promise(r=>resolve=r)}),m=message({op:'tabs'});await f.runtime.ready;
 const pending=f.runtime.request(m);await new Promise(r=>setTimeout(r,0));f.runtime.cancel(m.session,m.id);
 const outcome=await Promise.race([pending.then(()=> 'accepted',e=>e.code),new Promise(r=>setTimeout(()=>r('timeout'),100))]);assert.equal(outcome,'CANCELLED');resolve([]);await f.runtime.shutdown();await assert.rejects(f.runtime.request(message({op:'tabs'})),{code:'DISPOSED'});
});
test('events belonging to another consumer cannot create or mutate Atom metadata',async()=>{
 const f=fixture();await f.runtime.ready;const other=await f.broker.acquire({tabId:2,owner:'other',capabilities:['read']});
 f.events.emit({type:'debugger',source:{tabId:2},method:'Page.frameNavigated',params:{frame:{id:'foreign',url:'http://127.0.0.1:4173/'}}});await new Promise(r=>setTimeout(r,0));assert.deepEqual(f.calls,[]);assert.equal(f.data['stateport.atom.v1.tabs']?.[2],undefined);await other.release();await f.runtime.shutdown();
});

test('standalone migration copies only valid legacy diagnostics once, leaving host storage untouched',async()=>{
 const {migrateStandaloneDiagnostics}=await import('../../packages/atom/src/platform.mjs');
 const {makeDiagnostic}=await import('../../core/diagnostic.mjs');
 const report=makeDiagnostic({selection:{selector:'#p1',property:'text',value:'13',observedAt:Date.now()},run:'legacy',requests:[]});
 const data={diagnostics:[report],tabs:{host:true},capture:{host:true}},reads=[];
 const area={async get(keys){reads.push(...keys);return Object.fromEntries(keys.filter(k=>k in data).map(k=>[k,data[k]]));},async set(v){Object.assign(data,v);}};
 await migrateStandaloneDiagnostics(area);assert.equal(data['stateport.atom.v1.diagnostics'][0].id,report.id);assert.deepEqual(data.diagnostics,[report]);assert.deepEqual(data.tabs,{host:true});assert.deepEqual(data.capture,{host:true});assert(!reads.includes('tabs')&&!reads.includes('capture'));data.diagnostics=[];await migrateStandaloneDiagnostics(area);assert.equal(data['stateport.atom.v1.diagnostics'].length,1);
});
test('Detach releases an Atom picker reservation that never attached debugger',async()=>{
 const f=fixture();f.platform.chrome.tabs.sendMessage=async(id)=>{await f.platform.authorize(id,'read');return{};};
 await f.runtime.request(message({op:'pick',tabId:1}));await f.runtime.request(message({op:'detach',tabId:1}));assert.equal(f.platform.owns(1),false);const foreign=await f.broker.acquire({tabId:1,owner:'other',capabilities:['read']});await foreign.release();await f.runtime.shutdown();
});
test('cancelling a read cannot erase the selected observation owned by another request',async()=>{
 const current={selector:'#p1',property:'text',value:'13',observedAt:Date.now()},f=fixture({initial:{'stateport.atom.v1.tabs':{1:{run:'r',requests:[],events:[],pending:{},samples:[],sampleEntries:{},selection:current,analysis:{sources:[]}}}}});await f.runtime.ready;
 let resolve;f.platform.chrome.debugger.sendCommand=()=>new Promise(r=>resolve=r);const m=message({op:'metrics',tabId:1}),pending=f.runtime.request(m);await new Promise(r=>setTimeout(r,0));f.runtime.cancel(m.session,m.id);await assert.rejects(pending,{code:'CANCELLED'});resolve({});const s=await f.runtime.request(message({op:'state',tabId:1}));assert.equal(s.selection.selector,'#p1');await f.runtime.shutdown();
});
test('shutdown keeps owned Fetch event handling alive until in-flight cleanup settles',async()=>{
 const f=fixture();await f.runtime.request(message({op:'attach',tabId:1}));let resolve;const original=f.platform.chrome.debugger.sendCommand;
 f.platform.chrome.debugger.sendCommand=(target,method,params)=>method==='Performance.getMetrics'?new Promise(r=>resolve=r):original(target,method,params);
 const pending=f.runtime.request(message({op:'metrics',tabId:1})).catch(()=>{});await new Promise(r=>setTimeout(r,0));const stopping=f.runtime.shutdown();
 f.events.emit({type:'debugger',source:{tabId:1},method:'Fetch.requestPaused',params:{requestId:'paused',request:{url:'http://127.0.0.1:4173/api'}}});await new Promise(r=>setTimeout(r,0));const continued=f.calls.includes('Fetch.continueRequest');resolve({});await pending;await stopping;assert(continued,'owned paused response must be continued while cleanup is pending');
});
test('tab removal arriving during asynchronous startup cannot resurrect saved tab metadata',async()=>{
 const f=fixture();let restore;const pending=new Promise(r=>restore=r);f.platform.chrome.storage.session.get=()=>pending;
 await new Promise(r=>setTimeout(r,0));f.events.emit({type:'removed',tabId:1});restore({tabs:{1:{run:'removed-document',attached:false,events:[],requests:[],pending:{},samples:[],sampleEntries:{}}}});await f.runtime.ready;await new Promise(r=>setTimeout(r,0));const s=await f.runtime.request(message({op:'state',tabId:1}));assert.notEqual(s.run,'removed-document');await f.runtime.shutdown();
});
