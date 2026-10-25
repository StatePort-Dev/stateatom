// SPDX-License-Identifier: Apache-2.0
// Real runtime/platform with synthetic native boundaries; not Chrome acceptance.
import test from 'node:test';import assert from 'node:assert/strict';
import {inputCaptureRuntimeFixture} from '../helpers/input-capture-runtime-fixture.mjs';
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const origin='http://127.0.0.1:4173';
async function fixture(t,{domGate,cacheTabs}={}){
 let gate=false;
 const f=inputCaptureRuntimeFixture({send:async(m,p)=>{if(m==='Page.getFrameTree')return{frameTree:{frame:{id:'main',loaderId:'loader'}}};if(gate&&m==='DOM.getDocument')await domGate?.();}});
 if(cacheTabs)f.data['stateport.atom.v1.tabs']=cacheTabs;
 f.data['stateport.atom.v1.connections']=[{origin,mode:'read-only',actions:[]}];
 t.after(()=>f.runtime.shutdown());await f.inspect();await f.emit('Runtime.executionContextCreated',{context:{id:7,uniqueId:'main-context',origin,auxData:{frameId:'main',isDefault:true}}});
 const clients=new Map(),request=(payload,session='p04-a',options)=>f.runtime.request({version:1,id:crypto.randomUUID(),session,payload:{tabId:1,...(payload.op.startsWith('observation-')||payload.op==='capabilities'?{ownerId:'view-a'}:{}),...payload}},options);
 clients.set('p04-a',f.runtime.connectInspector('p04-a'));
 const connect=session=>{const c=f.runtime.connectInspector(session);clients.set(session,c);return c;};
 const state=()=>request({op:'state',ownerId:'view-a'});
 async function network(id='r'){const wall=(performance.timeOrigin+performance.now())/1000;await f.emit('Network.requestWillBeSent',{requestId:id,frameId:'main',loaderId:'loader',timestamp:50,wallTime:wall,request:{url:origin+'/private?secret',method:'GET'}});await f.emit('Network.responseReceived',{requestId:id,frameId:'main',loaderId:'loader',timestamp:50,response:{url:origin+'/private',status:200,mimeType:'application/json'}});await f.emit('Network.loadingFinished',{requestId:id,timestamp:50,encodedDataLength:100});}
 gate=true;return{...f,request,connect,clients,state,network};
}
test('only explicit Start records, bounded metadata stays in same state/session budget and reads no bodies',async t=>{const f=await fixture(t);await f.network('before');assert.equal((await f.state()).productionObservation,undefined);const before=f.calls.length,s=await f.request({op:'observation-start'});assert.equal(s.status,'recording');assert.equal(s.target.property,'disabled');await f.network();const current=await f.request({op:'observation-read',windowId:s.windowId});assert.equal(current.records.length,1);assert.equal(current.records[0].completion,'finished');assert(!JSON.stringify(current).includes('secret'));assert.equal(f.calls.slice(before).filter(c=>/getResponseBody|Fetch\.|RELOAD|SCRIPT|setCacheDisabled/.test(c.m)).length,0);assert.equal(f.data['stateport.atom.v1.tabs'][1].productionObservation.windowId,s.windowId);assert.equal(current.executable,false);});
test('ordinary/legacy host request without a connected private inspector cannot start',async t=>{const f=await fixture(t);await assert.rejects(f.request({op:'observation-start'},'unconnected'),{code:'INSPECTOR_DISCONNECTED'});assert.equal((await f.state()).productionObservation,undefined);});
test('foreign session/view cannot read, stop, clear or replace an active window',async t=>{const f=await fixture(t),s=await f.request({op:'observation-start'});f.connect('p04-b');for(const op of ['observation-read','observation-stop','observation-clear'])for(const payload of [{ownerId:'view-b'},{session:'p04-b'}]){const session=payload.session||'p04-a';await assert.rejects(f.request({op,windowId:s.windowId,...(payload.ownerId?{ownerId:payload.ownerId}:{})},session),{code:'BUSY'});}await assert.rejects(f.request({op:'observation-start'},'p04-b'),{code:'BUSY'});assert.equal((await f.state()).productionObservation.status,'recording');});
test('wrong nonce cannot stop or delete matching current history',async t=>{const f=await fixture(t),s=await f.request({op:'observation-start'});for(const op of ['observation-stop','observation-read','observation-clear'])await assert.rejects(f.request({op,windowId:crypto.randomUUID()}),{code:'STALE_TARGET'});assert.equal((await f.state()).productionObservation.windowId,s.windowId);});
test('Stop freezes pending history; Clear deletes metadata; next Start uses new identity',async t=>{const f=await fixture(t),s=await f.request({op:'observation-start'});await f.network();const stopped=await f.request({op:'observation-stop',windowId:s.windowId});assert.equal(stopped.stopReason,'user');await f.network('after');assert.deepEqual((await f.state()).productionObservation,stopped);const cleared=await f.request({op:'observation-clear',windowId:s.windowId});assert.equal(cleared.status,'deleted');assert.equal(cleared.identity,null);const next=await f.request({op:'observation-start'});assert.notEqual(next.windowId,s.windowId);});
for(const change of ['property','selection','navigation','context','detach','disconnect'])test('lifecycle '+change+' ends current window before later events',async t=>{const f=await fixture(t),s=await f.request({op:'observation-start'});if(change==='property')await f.request({op:'property',property:'text'});if(change==='selection')await f.request({op:'inspect-selector',selector:'#confirm'});if(change==='navigation')await f.emit('Page.frameNavigated',{frame:{id:'main',loaderId:'replacement',url:origin+'/next'}});if(change==='context')await f.emit('Runtime.executionContextDestroyed',{executionContextId:7,executionContextUniqueId:'main-context'});if(change==='detach')await f.request({op:'detach'});if(change==='disconnect')await f.clients.get('p04-a').close();const stopped=(await f.state()).productionObservation;assert.equal(stopped?.status,'stopped');assert.equal(stopped.windowId,s.windowId);await f.network('late');assert.deepEqual((await f.state()).productionObservation,stopped);});
test('native node replacement found by Read closes history rather than retargeting',async t=>{const f=await fixture(t),s=await f.request({op:'observation-start'});f.setNode(200);const r=await f.request({op:'observation-read',windowId:s.windowId});assert.equal(r.status,'stopped');assert.equal(r.stopReason,'target-replaced');assert.equal(r.target.node,'cdp:103');});
test('permission loss clears unsaved private scope and cannot be restored by late events',async t=>{const f=await fixture(t);await f.request({op:'observation-start'});f.deny();f.events.emit({type:'permissions-removed'});await new Promise(setImmediate);await new Promise(setImmediate);await f.network();const s=await f.state();assert.equal(s.productionObservation,undefined);await assert.rejects(f.request({op:'observation-start'}),{code:'ORIGIN_DENIED'});});
test('cancelled pending Start cannot publish after late native identity reply',async t=>{const entered=deferred(),ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t,{domGate:async()=>{entered.resolve();await ack.promise;}}),abort=new AbortController(),pending=f.request({op:'observation-start'},'p04-a',{signal:abort.signal});await entered.promise;abort.abort();await assert.rejects(pending,{code:'CANCELLED'});ack.resolve();await new Promise(setImmediate);await new Promise(setImmediate);assert.equal((await f.state()).productionObservation,undefined);});
test('simultaneous Start cannot establish two collectors while native identity waits',async t=>{const entered=deferred(),ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t,{domGate:async()=>{entered.resolve();await ack.promise;}}),a=f.request({op:'observation-start'});await entered.promise;await assert.rejects(f.request({op:'observation-start'}),{code:'BUSY'});ack.resolve();assert.equal((await a).status,'recording');});
test('global tab eviction removes its collector; old window nonce cannot regain it',async t=>{const f=await fixture(t),s=await f.request({op:'observation-start'});for(const id of [2,3,4])await f.request({op:'attach',tabId:id});assert.equal(f.data['stateport.atom.v1.tabs'][1],undefined);await f.network();assert.equal((await f.state()).productionObservation,undefined);await assert.rejects(f.request({op:'observation-stop',windowId:s.windowId}),{code:'STALE_TARGET'});});
test('strict operation DTO rejects raw filters/content/forged scope',async t=>{const f=await fixture(t);for(const extra of [{includeBody:true},{identity:{}},{url:origin},{windowId:crypto.randomUUID()}])await assert.rejects(f.request({op:'observation-start',...extra}),{code:'INVALID_MESSAGE'});});
test('worker restart retains only stopped unknown-ended history and no executable owner',async t=>{const f=await fixture(t),a=await f.request({op:'observation-start'});const restart=inputCaptureRuntimeFixture();restart.data['stateport.atom.v1.tabs']=structuredClone(f.data['stateport.atom.v1.tabs']);t.after(()=>restart.runtime.shutdown());await restart.runtime.ready;const stored=await restart.request({op:'state'});assert.equal(stored.productionObservation.status,'stopped');assert.equal(stored.productionObservation.endedAt,null);assert.equal(stored.productionObservation.stopReason,'context-changed');restart.runtime.connectInspector('inputs-runtime');await assert.rejects(restart.request({op:'observation-stop',ownerId:'view-a',windowId:a.windowId}),{code:'STALE_TARGET'});assert.equal(stored.productionObservation.executable,false);});
test('global5MB ceiling charges snapshot growth and removes its evicted owner',async t=>{
 const tab=padding=>({run:crypto.randomUUID(),attached:false,events:[],requests:[],pending:{},samples:[],sampleEntries:{},padding:'x'.repeat(padding)});
 const f=await fixture(t,{cacheTabs:{1:tab(4970000),2:tab(10000),3:tab(10000)}});
 const a=await f.request({op:'observation-start'});let sawEviction=false;
 for(let i=0;i<60;i++){await f.network('request-'+i+'-'.repeat(110));const saved=f.data['stateport.atom.v1.tabs'];assert(JSON.stringify(saved).length<=5000000);if(Object.keys(saved).length<3)sawEviction=true;}
 assert(sawEviction,'actual persisted snapshot growth must trigger the existing shared budget');
 assert.equal((await f.state()).productionObservation,undefined);
 await assert.rejects(f.request({op:'observation-stop',windowId:a.windowId}),{code:'STALE_TARGET'});
 await f.network('after-eviction');assert.equal((await f.state()).productionObservation,undefined);
});
test('corrupt restored recording is discarded without reviving an owner or breaking startup',async t=>{const f=inputCaptureRuntimeFixture();f.data['stateport.atom.v1.tabs']={1:{run:'old',attached:true,events:[],requests:[],pending:{},samples:[],sampleEntries:{},productionObservation:{schema:'stateatom.production-observation/1',status:'recording',records:'bad'}}};t.after(()=>f.runtime.shutdown());await f.runtime.ready;assert.equal((await f.request({op:'state'})).productionObservation,undefined);});
test('Start pending during private inspector loss cannot publish after a late native read',async t=>{const entered=deferred(),ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t,{domGate:async()=>{entered.resolve();await ack.promise;}});const pending=f.request({op:'observation-start'});void pending.catch(()=>{});await entered.promise;const closed=f.clients.get('p04-a').close();await assert.rejects(pending,e=>['CANCELLED','STALE_TARGET','INSPECTOR_DISCONNECTED'].includes(e.code));ack.resolve();await closed;await new Promise(setImmediate);assert.equal((await f.state()).productionObservation,undefined);});
test('late Read of stopped A cannot stop or publish over replacement window B',async t=>{const entered=deferred(),ack=deferred();let block=false;t.after(()=>ack.resolve());const f=await fixture(t,{domGate:async()=>{if(block){block=false;entered.resolve();await ack.promise;}}});const a=await f.request({op:'observation-start'});block=true;const reading=f.request({op:'observation-read',windowId:a.windowId});void reading.catch(()=>{});await entered.promise;await f.request({op:'observation-stop',windowId:a.windowId});const pendingB=f.request({op:'observation-start'});void pendingB.catch(()=>{});await new Promise(setImmediate);ack.resolve();await assert.rejects(reading,{code:'STALE_TARGET'});const b=await pendingB;const current=(await f.state()).productionObservation;assert.equal(current.windowId,b.windowId);assert.equal(current.status,'recording');});
test('generic state cannot bypass private observation read ownership',async t=>{const f=await fixture(t),a=await f.request({op:'observation-start'});await f.network();f.connect('p04-b');for(const [session,ownerId]of [['p04-a','view-b'],['p04-b','view-a']]){const state=await f.request({op:'state',ownerId},session);assert.equal(state.productionObservation.status,'owned-elsewhere');assert.equal(state.productionObservation.windowId,undefined);assert.equal(state.productionObservation.records,undefined);}assert.equal((await f.state()).productionObservation.windowId,a.windowId);});
test('separate observation view exposes only its own metadata/policy and leaves every legacy policy unchanged',async t=>{const f=await fixture(t),a=await f.request({op:'observation-start'}),legacy=await f.request({op:'state'}),before=f.calls.length,s=await f.request({op:'state',observationOwnerId:'view-a',refreshDeep:false});assert.equal(s.productionObservation.windowId,a.windowId);assert.equal(s.observationPolicy['observation-stop'].available,true);assert.equal(s.observationPolicy['observation-checkpoint'].available,true);assert.deepEqual(s.capabilityPolicy,legacy.capabilityPolicy);assert.equal(s.capabilityPolicy.operations['observation-stop'].code,'BUSY');assert.equal(f.calls.length,before,'Scoped metadata must not add native reads/checkpoints');});
test('separate view field cannot borrow a foreign inspector/view despite a matching window',async t=>{const f=await fixture(t);await f.request({op:'observation-start'});f.connect('p04-b');for(const [session,observationOwnerId]of [['p04-a','view-b'],['p04-b','view-a']]){const s=await f.request({op:'state',observationOwnerId},session);assert.equal(s.productionObservation.status,'owned-elsewhere');assert.equal(s.productionObservation.windowId,undefined);assert.equal(s.productionObservation.records,undefined);assert.equal(s.observationPolicy['observation-stop'].code,'BUSY');}});
test('separate observer selector is a bounded state-only field, never another operation authority',async t=>{const f=await fixture(t);for(const observationOwnerId of ['',0,{},'x'.repeat(101)])await assert.rejects(f.request({op:'state',observationOwnerId}),{code:'INVALID_MESSAGE'});await assert.rejects(f.request({op:'metrics',observationOwnerId:'view-a'}),{code:'INVALID_MESSAGE'});});
test('runtime window and selected native read timestamps stay inside actual precise host bounds',async t=>{const f=await fixture(t),before=performance.timeOrigin+performance.now(),s=await f.request({op:'observation-start'}),after=performance.timeOrigin+performance.now();assert(s.startedAt>=before&&s.startedAt<=after);assert(s.target.observedAt>=before&&s.target.observedAt<=s.startedAt);});
test('debugger owner loss closes as context change without inventing permission revocation',async t=>{const f=await fixture(t);await f.request({op:'observation-start'});f.broker.invalidate(1);const foreign=await f.broker.acquire({tabId:1,owner:'other',capabilities:['read']});t.after(()=>foreign.release());const s=await f.state();assert.equal(s.productionObservation.status,'stopped');assert.equal(s.productionObservation.stopReason,'context-changed');assert.equal(f.broker.status(1,'other'),'owned');});
test('late Read persistence acknowledgment cannot return recording A after Stop and replacement B',async t=>{const f=await fixture(t),a=await f.request({op:'observation-start'}),entered=deferred(),ack=deferred(),original=f.platform.chrome.storage.session.set;let first=true;t.after(()=>ack.resolve());f.platform.chrome.storage.session.set=async value=>{if(first){first=false;entered.resolve();await ack.promise;}return original(value);};const reading=f.request({op:'observation-read',windowId:a.windowId});void reading.catch(()=>{});await entered.promise;await f.request({op:'observation-stop',windowId:a.windowId});const b=await f.request({op:'observation-start'});ack.resolve();await assert.rejects(reading,{code:'STALE_TARGET'});assert.equal((await f.state()).productionObservation.windowId,b.windowId);assert.equal(f.data['stateport.atom.v1.tabs'][1].productionObservation.windowId,b.windowId);});

for(const reason of['context-changed','tab-switch'])test('owned contextual Stop records '+reason+' without adopting foreign identity or replacing the first closing reason',async t=>{const f=await fixture(t),w=await f.request({op:'observation-start'});f.connect('p04-b');await assert.rejects(f.request({op:'observation-stop',windowId:w.windowId,reason},'p04-b'),{code:'BUSY'});await assert.rejects(f.request({op:'observation-stop',windowId:crypto.randomUUID(),reason}),{code:'STALE_TARGET'});assert.equal((await f.state()).productionObservation.status,'recording');const stopped=await f.request({op:'observation-stop',windowId:w.windowId,reason});assert.equal(stopped.stopReason,reason);assert.equal(stopped.windowId,w.windowId);const again=await f.request({op:'observation-stop',windowId:w.windowId});assert.deepEqual(again,stopped);await f.network('late-context');assert.deepEqual((await f.state()).productionObservation,stopped);});
test('context Stop DTO accepts only its closed reason set and no reason on another observation command',async t=>{const f=await fixture(t),w=await f.request({op:'observation-start'});for(const reason of['user','permission-lost','invented',null,1])await assert.rejects(f.request({op:'observation-stop',windowId:w.windowId,reason}),{code:'INVALID_MESSAGE'});for(const op of['observation-read','observation-clear','observation-checkpoint'])await assert.rejects(f.request({op,windowId:w.windowId,reason:'tab-switch'}),{code:'INVALID_MESSAGE'});assert.equal((await f.state()).productionObservation.status,'recording');});

test('identity-only state never adds native reads to an owned active or historical observation window',async t=>{const f=await fixture(t),w=await f.request({op:'observation-start'});for(const historical of[false,true]){if(historical){await f.request({op:'observation-stop',windowId:w.windowId});await f.clients.get('p04-a').close();f.connect('p04-a');}const at=f.calls.length,s=await f.request({op:'state',observationOwnerId:'view-a',refreshDeep:false,refreshIdentity:true});assert.equal(s.productionObservation.windowId,w.windowId);assert.equal(f.calls.length,at,'Observation/history metadata must not acquire another DOM read');assert.equal(s.productionObservation.counts.checkpoints,0);}});

test('native observation burst keeps every record with one in-flight publication and one final notice',async t=>{
 const ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t),w=await f.request({op:'observation-start'}),original=f.platform.chrome.storage.session.set;
 let writes=0,inflight=0,maxInflight=0;const notices=[];
 f.api.runtime.sendMessage=async m=>{if(m.scope==='production-observation')notices.push(m);};
 f.platform.chrome.storage.session.set=async value=>{writes++;inflight++;maxInflight=Math.max(maxInflight,inflight);try{await ack.promise;return await original(value);}finally{inflight--;}};
 for(let i=0;i<20;i++)await f.network('burst-'+i);
 assert.equal(maxInflight,1,'Native event publication must not start one concurrent storage submission per event');
 assert.equal(writes,1);assert.equal(notices.length,0,'Only a saved settled view may be announced');
 ack.resolve();for(let i=0;i<5;i++)await new Promise(setImmediate);
 assert.equal(writes,2,'One latest-current-state follow-up after the gated first save');assert.equal(notices.length,1);assert.equal(notices[0].tabId,1);
 const saved=f.data['stateport.atom.v1.tabs'][1].productionObservation;assert.equal(saved.windowId,w.windowId);assert.equal(saved.records.length,20);assert(saved.records.every(r=>r.completion==='finished'));assert(Object.values(saved.gaps).every(n=>n===0));
});

test('delayed old event publication cannot block Stop/Delete/new Start or resurrect its window',{timeout:5000},async t=>{
 const ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t),a=await f.request({op:'observation-start'}),original=f.platform.chrome.storage.session.set;let first=true;
 f.platform.chrome.storage.session.set=async value=>{if(first){first=false;await ack.promise;}return original(value);};
 await f.network('old-pending');assert.equal(first,false);
 const stopped=await f.request({op:'observation-stop',windowId:a.windowId});assert.equal(stopped.stopReason,'user');
 await f.request({op:'observation-clear',windowId:a.windowId});const deleted=f.data['stateport.atom.v1.tabs'][1].productionObservation;assert.equal(deleted.status,'deleted');assert.equal(deleted.windowId,null);assert.deepEqual(deleted.records,[]);
 const b=await f.request({op:'observation-start'});assert.notEqual(b.windowId,a.windowId);assert.equal(b.records.length,0);
 ack.resolve();for(let i=0;i<5;i++)await new Promise(setImmediate);
 const saved=f.data['stateport.atom.v1.tabs'][1].productionObservation;assert.equal(saved.windowId,b.windowId);assert.equal(saved.status,'recording');assert.equal(saved.records.length,0);assert.equal((await f.state()).productionObservation.windowId,b.windowId);
});
test('permission cleanup stays independent of delayed native event publication',{timeout:5000},async t=>{
 const ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t);await f.request({op:'observation-start'});const original=f.platform.chrome.storage.session.set;let first=true;
 f.platform.chrome.storage.session.set=async value=>{if(first){first=false;await ack.promise;}return original(value);};await f.network('private-old');
 f.deny();f.events.emit({type:'permissions-removed'});for(let i=0;i<5;i++)await new Promise(setImmediate);
 assert.equal((await f.state()).productionObservation,undefined);assert.equal(f.data['stateport.atom.v1.tabs'][1].productionObservation,undefined);
 ack.resolve();for(let i=0;i<5;i++)await new Promise(setImmediate);assert.equal(f.data['stateport.atom.v1.tabs'][1].productionObservation,undefined);await assert.rejects(f.request({op:'observation-start'}),{code:'ORIGIN_DENIED'});
});
test('two native owner publishers retain exact tab routing without delaying the second tab',{timeout:5000},async t=>{
 const ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t);await f.request({op:'observation-start'});
 await f.request({op:'attach',tabId:2});await f.request({op:'property',tabId:2,property:'disabled'});await f.request({op:'inspect-selector',tabId:2,selector:'#confirm'});
 f.events.emit({type:'debugger',source:{tabId:2},method:'Runtime.executionContextCreated',params:{context:{id:7,uniqueId:'tab2-context',origin,auxData:{frameId:'main',isDefault:true}}}});await new Promise(setImmediate);
 const b=await f.request({op:'observation-start',tabId:2}),notices=[],original=f.platform.chrome.storage.session.set;let first=true;
 f.api.runtime.sendMessage=async m=>{if(m.scope==='production-observation')notices.push(m.tabId);};
 f.platform.chrome.storage.session.set=async value=>{if(first){first=false;await ack.promise;}return original(value);};await f.network('tab1-gated');
 f.events.emit({type:'debugger',source:{tabId:2},method:'Runtime.executionContextsCleared',params:{}});for(let i=0;i<5;i++)await new Promise(setImmediate);
 assert.deepEqual(notices,[2]);const saved=f.data['stateport.atom.v1.tabs'][2].productionObservation;assert.equal(saved.windowId,b.windowId);assert.equal(saved.stopReason,'context-changed');
 ack.resolve();for(let i=0;i<5;i++)await new Promise(setImmediate);assert.deepEqual(notices,[2,1]);assert.equal(f.data['stateport.atom.v1.tabs'][2].productionObservation.stopReason,'context-changed');
});

test('gap-only native traffic retains at most one rejection subscription on each publication flight',async t=>{
 const ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t);await f.request({op:'observation-start'});const originalSet=f.platform.chrome.storage.session.set,originalCatch=Promise.prototype.catch,counts=new WeakMap();let maxSubscriptions=0,writes=0;
 f.platform.chrome.storage.session.set=async value=>{writes++;await ack.promise;return originalSet(value);};
 Promise.prototype.catch=function(...args){const n=(counts.get(this)||0)+1;counts.set(this,n);maxSubscriptions=Math.max(maxSubscriptions,n);return Reflect.apply(originalCatch,this,args);};
 try{
  f.events.emit({type:'debugger',source:{tabId:1},method:'Network.loadingFinished',params:{requestId:'unmatched-0',timestamp:50}});
  await new Promise(setImmediate);await new Promise(resolve=>setTimeout(resolve,0));assert.equal(writes,1,'Exercise the old in-flight case after the new scheduling boundary');
  for(let i=1;i<1000;i++)f.events.emit({type:'debugger',source:{tabId:1},method:'Network.loadingFinished',params:{requestId:'unmatched-'+i,timestamp:50}});
  await new Promise(setImmediate);assert.equal(writes,1);assert.equal(maxSubscriptions,1,'No per-event rejection handlers may accumulate on a shared delayed flight');
 }finally{Promise.prototype.catch=originalCatch;ack.resolve();}
 for(let i=0;i<5;i++)await new Promise(setImmediate);const saved=f.data['stateport.atom.v1.tabs'][1].productionObservation;assert.equal(saved.records.length,0);assert.equal(saved.gaps.unmatched,1000);assert.equal(writes,2);
});
for(const ending of['context','record-limit','pending-limit'])test('same-owner '+ending+' persists and notifies independently of an old recording save',{timeout:10000},async t=>{
 const ack=deferred();t.after(()=>ack.resolve());const f=await fixture(t),w=await f.request({op:'observation-start'}),original=f.platform.chrome.storage.session.set,notices=[];let writes=0;
 f.api.runtime.sendMessage=async m=>{if(m.scope==='production-observation')notices.push(m);};
 f.platform.chrome.storage.session.set=async value=>{if(++writes===1)await ack.promise;return original(value);};
 if(ending==='record-limit')for(let i=0;i<65;i++)await f.network('limit-'+i);
 else if(ending==='pending-limit'){
  for(let i=0;i<33;i++)await f.emit('Network.requestWillBeSent',{requestId:'pending-'+i,frameId:'main',loaderId:'loader',timestamp:50,wallTime:(performance.timeOrigin+performance.now())/1000,request:{url:origin+'/private',method:'GET'}});
 }else{await f.network('before-context');await f.emit('Runtime.executionContextsCleared',{});}
 const saved=f.data['stateport.atom.v1.tabs'][1].productionObservation;assert.equal(saved.windowId,w.windowId);assert.equal(saved.status,'stopped','A terminal native transition must be saved before the old recording write is released');assert.equal(saved.stopReason,ending==='context'?'context-changed':ending);assert.equal(writes,2);assert.equal(notices.length,1);if(ending==='record-limit')assert.equal(saved.records.length,64);if(ending==='pending-limit')assert.equal(saved.records.length,32);
 ack.resolve();for(let i=0;i<5;i++)await new Promise(setImmediate);assert.equal(f.data['stateport.atom.v1.tabs'][1].productionObservation.status,'stopped');assert.equal(f.data['stateport.atom.v1.tabs'][1].productionObservation.stopReason,saved.stopReason);
});

for(const ending of ['replace','permission','context','record-limit','pending-limit'])test('queued recording save cannot delay or resurrect '+ending,async t=>{
 const f=await fixture(t),a=await f.request({op:'observation-start'}),scheduled=[],originalTimeout=globalThis.setTimeout,originalSet=f.platform.chrome.storage.session.set;
 let writes=0;
 f.platform.chrome.storage.session.set=async value=>{writes++;return originalSet(value);};
 globalThis.setTimeout=(callback,delay,...args)=>delay===0?(scheduled.push(()=>callback(...args)),-1):originalTimeout(callback,delay,...args);
 const emit=(method,params)=>f.events.emit({type:'debugger',source:{tabId:1},method,params});
 const start=n=>emit('Network.requestWillBeSent',{requestId:'queued-'+n,frameId:'main',loaderId:'loader',timestamp:50,wallTime:(performance.timeOrigin+performance.now())/1000,request:{url:origin+'/private',method:'GET'}});
 try{
  start(0);await Promise.resolve();await Promise.resolve();
  assert.equal(writes,0,'Recording storage starts only after its queued task');assert.equal(scheduled.length,1);
  if(ending==='replace'){
   await f.request({op:'observation-stop',windowId:a.windowId});
   assert.equal(f.data['stateport.atom.v1.tabs'][1].productionObservation.status,'stopped');
   await f.request({op:'observation-clear',windowId:a.windowId});
   const b=await f.request({op:'observation-start'});assert.notEqual(b.windowId,a.windowId);
  }else if(ending==='permission'){
   f.deny();f.events.emit({type:'permissions-removed'});for(let i=0;i<5;i++)await new Promise(setImmediate);
  }else if(ending==='context'){
   emit('Runtime.executionContextsCleared',{});for(let i=0;i<5;i++)await Promise.resolve();
  }else if(ending==='pending-limit'){
   for(let i=1;i<33;i++)start(i);for(let i=0;i<5;i++)await Promise.resolve();
  }else{
   // Finish the initial record, then deliver 64 more complete requests.
   emit('Network.loadingFinished',{requestId:'queued-0',timestamp:50});
   for(let i=1;i<65;i++){start(i);emit('Network.loadingFinished',{requestId:'queued-'+i,timestamp:50});}
   for(let i=0;i<5;i++)await Promise.resolve();
  }
  assert(writes>0,'Terminal/explicit writes do not wait for recording scheduling');
  const before=structuredClone(f.data['stateport.atom.v1.tabs'][1].productionObservation);
  if(ending==='permission')assert.equal(before,undefined);
  else if(ending==='replace'){assert.notEqual(before.windowId,a.windowId);assert.equal(before.records.length,0);}
  else{assert.equal(before.status,'stopped');assert.equal(before.stopReason,ending==='context'?'context-changed':ending);assert.equal(before.records.length,ending==='record-limit'?64:ending==='pending-limit'?32:1);}
  assert.equal(scheduled.length,1,'One queued publication across all same-owner event revisions');
  scheduled.shift()();for(let i=0;i<8;i++)await new Promise(setImmediate);
  assert.deepEqual(f.data['stateport.atom.v1.tabs'][1].productionObservation,before,'Late save reads current state, never the queued old window');
 }finally{globalThis.setTimeout=originalTimeout;}
});

test('queued recording publication becomes inert after shutdown and cannot overwrite replacement storage',async t=>{
 const f=await fixture(t);await f.request({op:'observation-start'});
 const tasks=[],originalTimeout=globalThis.setTimeout,originalSet=f.platform.chrome.storage.session.set;
 let writes=0,notices=0;
 f.platform.chrome.storage.session.set=async value=>{writes++;return originalSet(value);};
 f.api.runtime.sendMessage=async()=>{notices++;};
 globalThis.setTimeout=(callback,delay,...args)=>delay===0?(tasks.push(()=>callback(...args)),-1):originalTimeout(callback,delay,...args);
 try{
  f.events.emit({type:'debugger',source:{tabId:1},method:'Network.requestWillBeSent',params:{requestId:'old-runtime',frameId:'main',loaderId:'loader',timestamp:50,wallTime:(performance.timeOrigin+performance.now())/1000,request:{url:origin+'/private',method:'GET'}}});
  await Promise.resolve();await Promise.resolve();assert.equal(tasks.length,1);assert.equal(writes,0);
  await f.runtime.shutdown();
  // A replacement writer in the same session namespace owns this newer data.
  const replacement={tabs:{replacement:{run:'new-runtime',productionObservation:{status:'deleted',records:[]}}},pairing:{origin:'http://127.0.0.1:4174',owner:'replacement'}};
  await f.platform.chrome.storage.session.set(replacement);
  const before=structuredClone(f.data),writesBefore=writes,noticesBefore=notices;
  tasks.shift()();for(let i=0;i<8;i++)await new Promise(setImmediate);
  assert.equal(writes,writesBefore,'Disposed queued publisher must issue no storage submission');
  assert.equal(notices,noticesBefore,'Disposed queued publisher must issue no notification');
  assert.deepEqual(f.data,before,'Replacement namespace must survive delivery of the old callback');
 }finally{globalThis.setTimeout=originalTimeout;}
});
