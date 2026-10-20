// SPDX-License-Identifier: Apache-2.0
// Source harness only: synthetic CDP/ACKs, not native/browser acceptance.
import test from 'node:test';
import assert from 'node:assert/strict';
import {inputCaptureRuntimeFixture,captureControlOwner} from '../helpers/input-capture-runtime-fixture.mjs';
import {prepareExperimentPlan} from '../../core/experiment-plan.mjs';
import {validateRequest,createAtomDispatcher} from '../../packages/atom/src/transport.mjs';
import {operationPolicy} from '../../packages/atom/src/capabilities.mjs';
import {parseDiagnostic} from '../../core/diagnostic.mjs';
const ownerId='capture-owner',session='inputs-runtime';
const message=payload=>({version:1,id:crypto.randomUUID(),session,payload:{tabId:1,...(/^(inputs-|production-)/.test(payload.op)||payload.op==='capabilities'?{ownerId}:{}),...payload}});
async function fixture(t,{connected=true,...options}={}){
 const f=inputCaptureRuntimeFixture(options);t.after(()=>f.runtime.shutdown());
 const client=connected?f.runtime.connectInspector(session):null;
 const request=(p,options)=>f.runtime.request(message(p),options);
 await f.inspect();return {...f,client,request,capture:p=>request({op:'inputs-capture',...p})};
}
test('capture admission is explicit local metadata with live inspector, observation and no grants',()=>{
 assert.equal(operationPolicy('inputs-capture',{}).code,'INSPECTOR_DISCONNECTED');
 assert.equal(operationPolicy('inputs-capture',{captureInspector:true}).code,'OBSERVATION_REQUIRED');
 const c={captureInspector:true,hasSelection:true,permission:false,lease:'foreign',grants:[]};
 assert.deepEqual(operationPolicy('inputs-capture',c),{available:true,reason:null,code:null,requiredGrants:[]});
 assert.equal(operationPolicy('inputs-capture',{...c,busy:true}).code,'BUSY');
 assert.equal(operationPolicy('inputs-capture',{...c,foreignInputEditor:true}).code,'BUSY');
});
test('wire refuses caller snapshots, grants, ambiguous revision and unbounded review choices',()=>{
 validateRequest(message({op:'inputs-capture'}));
 validateRequest(message({op:'inputs-capture',investigationId:'i',expectedRevision:0,includeCategories:['inputValues']}));
 for(const patch of [{ownerId:undefined},{snapshot:{}},{grants:['read']},{capture:{}},{investigationId:'i'},{expectedRevision:0},{investigationId:'i',expectedRevision:-1},{includeContent:1},{notes:'x'.repeat(1025)},{includeCategories:['inputValues','inputValues']},{includeCategories:['unknown']},{includeCategories:'inputValues'}]){
  assert.throws(()=>validateRequest(message({op:'inputs-capture',...patch})),{code:'INVALID_MESSAGE'});
 }
});
test('dispatcher refuses legacy/unowned capture even for a trusted peer',async()=>{
 let calls=0;const dispatcher=createAtomDispatcher({request:async()=>{calls++;}},{isTrusted:()=>true,isSelectionSender:()=>false});
 let reply;dispatcher({atom:message({op:'inputs-capture'})},{},v=>reply=v);
 assert.equal(reply?.code,'INSPECTOR_DISCONNECTED');assert.equal(calls,0);
});
test('wire refuses sparse or decorated privacy selections rather than dropping category input',()=>{
 for(const includeCategories of [Array(1),Object.assign(['inputValues'],{extra:'inputErrors'})])assert.throws(()=>validateRequest(message({op:'inputs-capture',includeCategories})),{code:'INVALID_MESSAGE'});
});
test('absent editor is not-recorded and capture never refreshes target, observes app or stores data',async t=>{
 const f=await fixture(t),stored=JSON.stringify(f.data),calls=f.calls.length;
 f.platform.describeTarget=()=>{throw Error('Capture must not refresh browser authority');};
 const r=await f.capture();assert.equal(r.schema,'stateatom.input-outcome-capture/1');
 assert.equal(r.exportable,false);assert.equal(r.executable,false);assert.equal(r.outcomes.binding.status,'not-recorded');
 assert.equal(r.outcomes.snapshot,null);assert.equal(parseDiagnostic(r.diagnosticRaw).version,1);
 assert.equal(Date.parse(JSON.parse(r.diagnosticRaw).createdAt),r.capturedAt);
 assert.equal(JSON.stringify(f.data),stored);assert.equal(f.calls.length,calls);
 assert(Object.isFrozen(r));assert(Object.isFrozen(r.outcomes));
 await assert.rejects(f.capture({investigationId:'missing',expectedRevision:0}),{code:'STALE_INVESTIGATION'});
});
test('only connected exact editor owner can capture, including a closed editor',async t=>{
 const f=await fixture(t),s=await f.request({op:'inputs-open'});
 await assert.rejects(f.request({op:'inputs-capture',ownerId:'other'}),{code:'BUSY'});
 await f.request({op:'inputs-close',investigationId:s.investigationId});
 await assert.rejects(f.request({op:'inputs-capture',ownerId:'other'}),{code:'BUSY'});
 const r=await f.capture();assert.equal(r.outcomes.snapshot.closed,true);assert.equal(r.outcomes.snapshot.freshness,'Stale');
 assert.equal(r.outcomes.binding.status,'capture-context-matched');
 const legacy=await fixture(t,{connected:false});await assert.rejects(legacy.capture(),{code:'INSPECTOR_DISCONNECTED'});
});
test('response capture binds original selection and exact ledger revision without reads or active rule leakage',async t=>{
 const f=await fixture(t),s=await f.request({op:'inputs-open'}),applied=await f.request({op:'inputs-apply',plan:f.plan(s)});
 const calls=f.calls.length,stored=JSON.stringify(f.data);
 const r=await f.capture({investigationId:s.investigationId,expectedRevision:applied.revision});
 assert.equal(r.outcomes.binding.status,'capture-context-matched');assert.equal(r.outcomes.transactions[0].mode,'draft');
 assert.equal(r.outcomes.transactions[0].phase,'waiting');assert.equal(r.outcomes.transactions[0].effect,'unknown');
 assert.equal(r.outcomes.transactions[0].outcomes[0].value.state,'omitted');
 assert.equal(r.outcomes.binding.visibleJoin,'unverifiable-omitted-or-filtered-context');
 const bytes=JSON.stringify(r);assert(!bytes.includes('requiredGrants'));assert(!bytes.includes('canUndo'));assert(!bytes.includes('"rule":'));
 assert.equal(f.calls.length,calls);assert.equal(JSON.stringify(f.data),stored);
 await assert.rejects(f.capture({investigationId:s.investigationId,expectedRevision:s.revision}),{code:'STALE_REVISION'});
 await assert.rejects(f.capture({investigationId:'another',expectedRevision:applied.revision}),{code:'STALE_INVESTIGATION'});
 const included=await f.capture({includeCategories:['inputIdentities','inputLocations','inputValues']});
 assert.equal(included.outcomes.binding.context.identity.value.frameId,'main');
 assert.equal(included.outcomes.binding.context.identity.value.document,'cdp:101');
 assert.equal(included.outcomes.transactions[0].outcomes[0].value.value,false);
});
test('ordinary admission retains the host disposed fact alongside capture metadata',async t=>{
 const f=await fixture(t),original=f.platform.describeTarget.bind(f.platform);
 f.platform.describeTarget=async id=>({...await original(id),disposed:true});
 await assert.rejects(f.request({op:'capabilities'}),{code:'DISPOSED'});
});
async function pauseHash(t){
 const original=crypto.subtle.digest;let enter,release,first=true;
 const entered=new Promise(r=>enter=r),wait=new Promise(r=>release=r);
 crypto.subtle.digest=async function(...args){if(first){first=false;enter();await wait;}return Reflect.apply(original,this,args);};
 t.after(()=>{release();crypto.subtle.digest=original;});return {entered,release};
}
for(const change of ['ledger','observation-without-revision','close','selection','navigation','disconnect','cancel'])test(`capture refuses obsolete hash reply after ${change}`,{timeout:10000},async t=>{
 const f=await fixture(t),s=await f.request({op:'inputs-open'}),gate=await pauseHash(t),abort=new AbortController();
 const pending=f.request({op:'inputs-capture'},{signal:abort.signal});void pending.catch(()=>{});try{await gate.entered;
 if(change==='ledger')await f.request({op:'inputs-apply',plan:f.plan(s)});
 if(change==='observation-without-revision'){f.setDisabled(false);const next=await f.request({op:'inputs-read',investigationId:s.investigationId});assert.equal(next.revision,s.revision);assert.equal(next.target.value,false);}
 if(change==='close')await f.request({op:'inputs-close',investigationId:s.investigationId});
 if(change==='selection')await f.request({op:'property',property:'text'});
 if(change==='navigation')await f.emit('Page.frameNavigated',{frame:{id:'main',loaderId:'new',url:s.target.origin+'/react/'}});
 if(change==='disconnect')await f.client.close();
 if(change==='cancel')abort.abort();
 gate.release();await assert.rejects(pending,{code:['disconnect','cancel'].includes(change)?'CANCELLED':'STALE_CAPTURE'});
 }finally{gate.release();}
});
test('a stable snapshot is frozen before hashing and later editing cannot change the returned history',async t=>{
 const f=await fixture(t),s=await f.request({op:'inputs-open'}),r=await f.capture();
 await f.request({op:'inputs-apply',plan:f.plan(s)});assert.equal(r.outcomes.transactions.length,0);
 assert.equal(r.outcomes.snapshot.revision,s.revision);assert.equal(r.outcomes.selectedObservation.value.state,'omitted');
});
test('changed selected context never joins an old closed investigation to a new observation',async t=>{
 const f=await fixture(t);await f.request({op:'inputs-open'});
 await f.request({op:'inspect-selector',selector:'#confirm'});
 const r=await f.capture();assert.equal(r.outcomes.binding.status,'unjoined');assert.equal(r.outcomes.transactions,null);
 assert(r.outcomes.binding.reasons.includes('investigation-context-mismatch'));
});
test('restart retains summary incompleteness, never restores private editor-open context',async t=>{
 const f=await fixture(t),s=await f.request({op:'inputs-open'});await f.request({op:'inputs-apply',plan:f.plan(s)});
 await f.runtime.shutdown();
 const {createAtomRuntime}=await import('../../packages/atom/src/runtime.mjs');
 const {createChromePlatform,createDebuggerBroker}=await import('../../packages/atom/src/platform.mjs');
 const broker=createDebuggerBroker(f.api.debugger);broker.workerIndependent=true;
 const restarted=createAtomRuntime(createChromePlatform(f.api,{events:f.events,broker}));t.after(()=>restarted.shutdown());restarted.connectInspector(session);
 const r=await restarted.request(message({op:'inputs-capture'}));
 assert.equal(r.outcomes.capture.kind,'runtime-summary');assert.equal(r.outcomes.binding.status,'unjoined');
 assert.equal(r.outcomes.transactions,null);assert.equal(r.outcomes.snapshot.historyCoverage,'retained-summary-only');
 assert.equal(r.outcomes.snapshot.availableTransactions,1);assert.equal(r.outcomes.snapshot.totalTransactions,null);
});
for(const mode of ['live','draft'])test(`native ${mode} acknowledgements, undo and baseline remain scoped historical outcomes`,async t=>{
 const controlOwner=captureControlOwner(),f=await fixture(t,{controlOwner,workerIndependent:false});
 let s=await f.request({op:'inputs-open',sourceKind:'dom-control'});
 const plan=value=>prepareExperimentPlan({investigationId:s.investigationId,mode,target:s.target,changes:[{resource:s.resources[0].resource,value}]});
 s=await f.request({op:'inputs-apply',plan:plan('Cedar')});
 s=await f.request({op:'inputs-undo',investigationId:s.investigationId,expectedRevision:s.revision});
 s=await f.request({op:'inputs-apply',plan:plan('Pine')});
 s=await f.request({op:'inputs-baseline',investigationId:s.investigationId,expectedRevision:s.revision});
 const calls=f.calls.length,writes=controlOwner.writes,reads=controlOwner.reads;
 const r=await f.capture({includeCategories:['inputValues','inputIdentities','inputLocations']});
 assert.equal(r.outcomes.binding.status,'capture-context-matched');
 assert.deepEqual(r.outcomes.transactions.map(tx=>tx.kind),['apply','undo','apply','baseline']);
 assert.equal(r.outcomes.transactions[0].mode,mode);assert.equal(r.outcomes.transactions[0].phase,'applied');
 assert.equal(r.outcomes.transactions[0].outcomes[0].after.value.value,'Cedar');
 assert.equal(r.outcomes.transactions[3].outcomes[0].after.value.value,'AB');
 assert(r.outcomes.transactions.every(tx=>tx.effect==='unknown'&&tx.applicationRestored===false));
 assert.equal(f.calls.length,calls);assert.equal(controlOwner.writes,writes);assert.equal(controlOwner.reads,reads);
});
test('actual response delivery receipts are preserved without claiming application consumption',async t=>{
 const f=await fixture(t);let s=await f.request({op:'inputs-open'});await f.request({op:'inputs-apply',plan:f.plan(s)});
 await f.network(2,{finish:false});await f.emit('Fetch.requestPaused',{requestId:'f2',networkId:'q2',frameId:'main',resourceType:'Fetch',request:{url:s.target.origin+'/api',method:'GET'},responseStatusCode:200,responseHeaders:[{name:'content-type',value:'application/json'}]});
 const r=await f.capture({includeCategories:['inputIdentities','inputLocations']});
 assert.equal(r.outcomes.transactions[0].phase,'delivered');const receipt=r.outcomes.transactions[0].outcomes[0].deliveries[0];
 assert.equal(receipt.delivered,true);assert.equal(receipt.requestId.value,'q2');
 assert.equal(r.outcomes.transactions[0].consumption,'unknown');assert.equal(r.outcomes.transactions[0].effect,'unknown');
});
test('native failed acknowledgement is not promoted to applied or restored',async t=>{
 const f=await fixture(t,{controlOwner:captureControlOwner({status:'unconfirmed'}),workerIndependent:false});
 const s=await f.request({op:'inputs-open',sourceKind:'dom-control'});
 await f.request({op:'inputs-apply',plan:prepareExperimentPlan({investigationId:s.investigationId,mode:'live',target:s.target,changes:[{resource:s.resources[0].resource,value:'Cedar'}]})});
 const r=await f.capture({includeCategories:['inputErrors']});assert.equal(r.outcomes.transactions[0].phase,'unconfirmed');
 assert.equal(r.outcomes.transactions[0].applicationRestored,false);assert.equal(r.outcomes.transactions[0].outcomes[0].after,null);
});
test('cleanup-only change during hashing invalidates the reply even at the same ledger revision',async t=>{
 let releaseClose,enteredClose;const closeEntered=new Promise(r=>enteredClose=r),closeWait=new Promise(r=>releaseClose=r);
 const f=await fixture(t,{controlOwner:captureControlOwner({closeGate:async()=>{enteredClose();await closeWait;}}),workerIndependent:false});
 await f.request({op:'inputs-open',sourceKind:'dom-control'});
 const closing=f.request({op:'inputs-close'});void closing.catch(()=>{});await closeEntered;
 try{
  const historical=await f.capture();assert.equal(historical.outcomes.snapshot.closed,true);assert.equal(historical.outcomes.snapshot.cleanup,'active');
  const gate=await pauseHash(t),pending=f.capture();void pending.catch(()=>{});
  try{await gate.entered;releaseClose();const closed=await closing;assert.equal(closed.revision,historical.outcomes.snapshot.revision);assert.equal(closed.cleanup,'closed');gate.release();await assert.rejects(pending,{code:'STALE_CAPTURE'});}
  finally{gate.release();}
 }finally{releaseClose();await closing;}
});
test('capture freezes an in-flight response and refuses a later delivery during hashing',async t=>{
 let enteredSend,releaseSend;const sendEntered=new Promise(r=>enteredSend=r),sendWait=new Promise(r=>releaseSend=r);
 const f=await fixture(t,{send:async m=>{if(m==='Fetch.fulfillRequest'){enteredSend();await sendWait;}}});
 const s=await f.request({op:'inputs-open'});await f.request({op:'inputs-apply',plan:f.plan(s)});
 await f.network(2,{finish:false});await f.emit('Fetch.requestPaused',{requestId:'f2',networkId:'q2',frameId:'main',resourceType:'Fetch',request:{url:s.target.origin+'/api',method:'GET'},responseStatusCode:200,responseHeaders:[{name:'content-type',value:'application/json'}]});await sendEntered;
 try{
  const r=await f.capture();assert.equal(r.outcomes.snapshot.pendingCount,1);assert.equal(r.outcomes.transactions[0].phase,'prepared');
  const gate=await pauseHash(t),pending=f.capture();void pending.catch(()=>{});
  try{await gate.entered;releaseSend();await f.emit('Runtime.consoleAPICalled',{});const state=await f.request({op:'state'});assert.equal(state.inputs.history[0].phase,'delivered');gate.release();await assert.rejects(pending,{code:'STALE_CAPTURE'});}
  finally{gate.release();}
 }finally{releaseSend();}
});
test('a source revision event invalidates hashing without assigning that revision to old outcomes',async t=>{
 const f=await fixture(t,{send:async m=>m==='Debugger.getScriptSource'?{scriptSource:'const selectedInputCedar = 42;'}:undefined});
 await f.request({op:'inputs-open'});const gate=await pauseHash(t),pending=f.capture();void pending.catch(()=>{});
 try{await gate.entered;await f.emit('Debugger.scriptParsed',{scriptId:'script-cedar',url:'http://127.0.0.1:4173/source-cedar.js'});gate.release();await assert.rejects(pending,{code:'STALE_CAPTURE'});}
 finally{gate.release();}
 const r=await f.capture();assert.equal(r.outcomes.binding.status,'unjoined');assert.equal(r.outcomes.transactions,null);
});
test('private capture respects the same unsaved observation expiry as save-diagnostic without refreshing the app',async t=>{
 const f=await fixture(t),legacy=await fixture(t);await f.request({op:'inputs-open'});
 const realNow=Date.now,future=realNow()+300001,calls=f.calls.length;
 f.platform.describeTarget=()=>{throw Error('Historical capture must not refresh browser authority');};
 Date.now=()=>future;
 try{
  await assert.rejects(legacy.request({op:'save-diagnostic'}),{code:'OBSERVATION_REQUIRED'});
  await assert.rejects(f.capture(),{code:'OBSERVATION_REQUIRED'});
  assert.equal(f.calls.length,calls);
 }finally{Date.now=realNow;}
});
