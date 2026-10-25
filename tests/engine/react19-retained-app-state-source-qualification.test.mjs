// SPDX-License-Identifier: Apache-2.0
// OWNED serialized/declared source association controls only.
import test from 'node:test';import assert from 'node:assert/strict';import path from 'node:path';
import vm from 'node:vm';
import {callbackJSXNativeFactory} from '../../experiments/react19-reducer/retained-app-state-source-run.mjs';
import {guardAppMainClosureAvailability,guardNativeStateSourceWindow,guardNativeStateSourceOffWindow,classifyNativeStateSourceRun,projectNativeStateSourceCase,projectNativeStateSourceResult,retainedAppResearchPolicy,assertRetainedAppResearchPolicy} from '../../experiments/react19-reducer/retained-app-state-source-qualification.mjs';
const U='Unknown/Unsupported',site=(id,kind,file='owned-Main.jsx',digest='a')=>({id:id.repeat(64),file,sourceDigest:digest.repeat(64),kind,line:1,column:1,endLine:20,endColumn:1});
function ownedWindow({enabled=true,stopped=false,n=2,label='equal',freshApp=true,foreignRealm=false}={}){
 const page='owned-native-app-main',policy={page,mainSite:{...site('1','main-input'),functionName:'Main',parameter:'todos'},filterSite:site('2','filter'),mapSite:site('3','map'),jsxSites:[{id:'4'.repeat(64),file:'owned-lowered.js',sourceDigest:'b'.repeat(64),line:1,column:1,endLine:1,endColumn:40}],app:{appSite:{...site('5','app-hook-function','owned-App.jsx','c'),functionName:'App'},bindingSite:{...site('6','app-hook-binding','owned-App.jsx','c'),callName:'useReducer',todosBinding:'todos',dispatchBinding:'dispatch'}},configSite:{...site('7','app-main-config','owned-App-lowered.js','d'),appSiteId:'5'.repeat(64),bindingSiteId:'6'.repeat(64),field:'todos',component:'Main'}};
 const ns=(id,kind,functionName)=>({...site(id,kind,'owned-native.js','e'),functionName});policy.native={file:'owned-native.js',sourceDigest:'e'.repeat(64),version:'19.2.5',nativeVersionAdmitted:false,returnSites:[ns('8','native-state-return','mountReducer'),ns('9','native-state-return','updateReducerImpl'),ns('a','native-state-return','rerenderReducer')],renderSites:[ns('b','native-render-component','renderWithHooks'),ns('c','native-render-component','renderWithHooksAgain')]};const make=vm.runInNewContext('('+callbackJSXNativeFactory()+')',foreignRealm?{WeakRef}:{WeakRef,Array});const o=make({page,enabled,policy:{app:policy.app,main:policy,configSite:policy.configSite,native:policy.native}});o.sealWindow();
 const todos=Array.from({length:n},()=>({owned:true})),dispatch=()=>{},tuple=[todos,dispatch],arg={todos,dispatch},appElement={props:arg},hook=()=>tuple;
 function app(){const fiber={};o.nativeTap('render-component',fiber,app,policy.native.renderSites[0].id);const a=o.appHook,t=a.appEnter(policy.app.appSite.id,app);o.nativeTap('state-result',tuple,{},fiber,policy.native.returnSites[0].id,todos,dispatch);a.result(t,tuple,hook,policy.app.bindingSite.id);a.bound(t,tuple,todos,dispatch,policy.app.bindingSite.id);a.config(t,arg,policy.configSite.id);if(enabled)o.tap('jsx-element-return',appElement,arg);a.appReturned(t,appElement);a.appExit(t);}
 if(!freshApp)app();o.startWindow(label);if(freshApp)app();const m=o.mainInput,frame=m.mainEnter(arg,todos,policy.mainSite.id);m.arrayRuntime.abort(undefined);const f=m.arrayRuntime.begin(Array.prototype.filter,todos,policy.filterSite.id),visible=todos.filter(()=>true);m.arrayRuntime.finish(f,visible);m.arrayRuntime.abort(null);const map=m.arrayRuntime.begin(Array.prototype.map,visible,policy.mapSite.id),elements=visible.map((item,index,array)=>{const h=m.enter(map,policy.mapSite.id,item,index,array),c={todo:item},e={props:c};if(enabled){o.tap('config-input',item,c,policy.jsxSites[0]);o.tap('jsx-element-return',e,c);}m.returned(h,e);m.exit(h);return e;});m.arrayRuntime.finish(map,elements);m.arrayRuntime.abort(null);const root={elements};m.mainReturned(frame,root);m.mainExit(frame);if(stopped)o.stop();return{capture:{...JSON.parse(JSON.stringify(o.sealWindow())),nativeTapPresent:enabled},policy,phase:{id:label,rowCount:n},keep:[todos,tuple,arg,appElement,visible,elements,root]};
}
for(const label of ['equal','same','changed','toggle'])test('joint native/source OWNED positive: '+label,()=>{const c=ownedWindow({label});assert.equal(guardNativeStateSourceWindow(c.capture,c.phase,c.policy),c.capture);assert.equal(c.capture.stateSource.snapshot.links.length,2);});
test('filtered joint scope stays audit-only',()=>{const c=ownedWindow({label:'filtered',n:1,freshApp:false});assert.equal(guardNativeStateSourceWindow(c.capture,c.phase,c.policy),c.capture);assert.equal(c.capture.stateSource.snapshot.links.length,0);});
test('Stop joint records cleared/unsealed',()=>{const c=ownedWindow({label:'stopped',stopped:true});assert.equal(guardNativeStateSourceWindow(c.capture,c.phase,c.policy),c.capture);});
for(const stopped of [false,true])test('Off every joint record/event zero: '+stopped,()=>{const c=ownedWindow({enabled:false,stopped,label:stopped?'stopped':'equal'});assert.equal(guardNativeStateSourceOffWindow(c.capture,c.phase,c.policy),c.capture);});
for(const[name,change]of [
 ['missing stateSource',c=>delete c.capture.stateSource],
 ['no joint proof',c=>c.capture.stateSource.snapshot.status=U],
 ['wrong nested native frame',c=>c.capture.stateSource.snapshot.links[0].nativeReturnedStateReference.frameId='foreign'],
 ['wrong nested source occurrence',c=>c.capture.stateSource.snapshot.links[0].appMainSourceOccurrence.sourceElementId='foreign'],
 ['split App identity',c=>c.capture.stateSource.snapshot.links[1].appAssociationId='foreign'],
 ['split Main identity',c=>c.capture.stateSource.snapshot.links[1].mainAssociationId='foreign'],
 ['duplicate callback identity',c=>c.capture.stateSource.snapshot.links[1].callbackAssociationId=c.capture.stateSource.snapshot.links[0].callbackAssociationId],
 ['extra callback',c=>c.capture.stateSource.retention.callbacks=3],
 ['missing link',c=>c.capture.stateSource.snapshot.links.pop()],
 ['stale window',c=>c.capture.stateSource.retention.window++],
 ['unsealed',c=>c.capture.stateSource.sealed=false],
 ['invalid',c=>c.capture.stateSource.retention.invalid=true],
 ['active',c=>c.capture.stateSource.retention.active=1],
 ['state origin upgrade',c=>c.capture.stateSource.snapshot.nativeStateOrigin='Observed'],
 ['ownership upgrade',c=>c.capture.stateSource.snapshot.fieldOwnership='Observed'],
 ['DOM upgrade',c=>c.capture.stateSource.snapshot.selectedPropertyOrigin='Observed'],
 ['fullpath',c=>c.capture.stateSource.snapshot.fullPath=true],
 ['native attestation',c=>c.capture.stateSource.snapshot.nativeOrigin='Attested'],
 ['no source scope',c=>c.capture.stateSource.snapshot.sourceOnly=false],
 ['child joint upgrade',c=>c.capture.stateSource.snapshot.links[0].nativeStateOrigin='Observed'],
 ['lost native subproof',c=>c.capture.nativeReturn.snapshot.status=U],
 ['lost App/Main subproof',c=>c.capture.snapshot.status=U]
])test('joint native/source guard refuses '+name,()=>{const c=ownedWindow();change(c);assert.throws(()=>guardNativeStateSourceWindow(c.capture,c.phase,c.policy));});
test('Off rejects joint-only diagnostic retention',()=>{const c=ownedWindow({enabled:false});c.capture.stateSource.retention.events=1;assert.throws(()=>guardNativeStateSourceOffWindow(c.capture,c.phase,c.policy));});
test('typed projection preserves native/source facts and actual new case identity',()=>{const inputs={},runs=[],s={schema:'stateatom.retained-app-state-source-case/1',inputHashes:inputs},r={schema:'stateatom.retained-app-state-source-result/1',inputsBefore:inputs,runs};assert.equal(projectNativeStateSourceCase(s).schema,'stateatom.native-state-return-native-case/1');const p=projectNativeStateSourceResult(r);assert.equal(p.schema,'stateatom.native-state-return-native-result/1');assert.equal(p.inputsBefore,inputs);assert.equal(p.runs,runs);assert.throws(()=>projectNativeStateSourceCase({schema:'foreign'}));});
for(const field of ['actualBrowserStarted','appExecuted','ReactDOMExecuted','originalMainExecuted','inputsUnchanged'])test('incomplete result cannot acquire joined native/source claim: '+field,()=>{const r={schema:'stateatom.retained-app-state-source-result/1',execution:'ACTUAL_OWNED_PUBLIC_DRIVER',actualBrowserStarted:true,browserStarted:true,appExecuted:true,ReactDOMExecuted:true,originalMainExecuted:true,inputsUnchanged:true,runs:[]};r[field]=false;const q=classifyNativeStateSourceRun(r,{schema:'stateatom.retained-app-state-source-case/1',sitePolicy:{},inputHashes:{},protocol:{phases:[]}});assert.equal(q.status,'INCOMPLETE_RETAINED_APP_STATE_SOURCE_NOT_FULL_A02');assert(q.failures.length);assert.equal(q.acceptedStateSourceLinks,0);assert.equal(q.fullA02,false);});

test('availability exposes original Boolean predicates separately from child status/count summaries',()=>{const c=ownedWindow(),d=c.capture.snapshot.closureAvailability;assert.equal(guardAppMainClosureAvailability(c.capture,{enabled:true}),c.capture);assert.equal(d.configs[0].appElementAvailable,true);assert.equal(d.callbacks[0].appSubproofStatus,'Observed');assert.equal(d.callbacks[0].appSubproofLinks,1);});
for(const[name,change]of [
 ['missing metadata',c=>delete c.capture.snapshot.closureAvailability],
 ['wrong schema',c=>c.capture.snapshot.closureAvailability.schema='foreign'],
 ['wrong config length',c=>c.capture.snapshot.closureAvailability.configs=[]],
 ['wrong main length',c=>c.capture.snapshot.closureAvailability.mains=[]],
 ['foreign config',c=>c.capture.snapshot.closureAvailability.configs[0].configId='foreign'],
 ['foreign main occurrence',c=>c.capture.snapshot.closureAvailability.callbacks[0].mainOccurrence='foreign'],
 ['false config availability under Observed',c=>c.capture.snapshot.closureAvailability.configs[0].appElementAvailable=false],
 ['skipped checked config',c=>c.capture.snapshot.closureAvailability.configs[0].configAvailable='NotChecked'],
 ['numeric Boolean',c=>c.capture.snapshot.closureAvailability.configs[0].configPropsEqual=1],
 ['false Main equality under Observed',c=>c.capture.snapshot.closureAvailability.mains[0].argumentPropsEqual=false],
 ['wrong callback eligibility',c=>c.capture.snapshot.closureAvailability.snapshotGateEligibleBeforeCallbacks=false],
 ['false callback element under Observed',c=>c.capture.snapshot.closureAvailability.callbacks[0].elementAvailable=false],
 ['Boolean child status',c=>c.capture.snapshot.closureAvailability.callbacks[0].appSubproofStatus=true],
 ['string child count',c=>c.capture.snapshot.closureAvailability.callbacks[0].appSubproofLinks='1'],
 ['missing callback row',c=>c.capture.snapshot.closureAvailability.callbacks.pop()],
 ['reordered callback index',c=>c.capture.snapshot.closureAvailability.callbacks[0].callbackIndex=1]
])test('diagnostic consistency refuses '+name,()=>{const c=ownedWindow();change(c);assert.throws(()=>guardNativeStateSourceWindow(c.capture,c.phase,c.policy));});
test('lawful missing App element metadata stays Unknown and never passes old source gate',()=>{const c=ownedWindow(),d=c.capture.snapshot.closureAvailability;d.configs[0].appElementAvailable=false;d.snapshotGateEligibleBeforeCallbacks=false;d.callbacks=[];c.capture.snapshot.status=U;c.capture.snapshot.links=[];assert.equal(guardAppMainClosureAvailability(c.capture,{enabled:true}),c.capture);assert.throws(()=>guardNativeStateSourceWindow(c.capture,c.phase,c.policy));});
test('lawful skipped predicates remain NotChecked; equality of unavailable targets is not identity',()=>{const c=ownedWindow(),d=c.capture.snapshot.closureAvailability;Object.assign(d.configs[0],{appTodosAvailable:false,configAvailable:'NotChecked',configPropsEqual:'NotChecked',appElementAvailable:'NotChecked'});Object.assign(d.mains[0],{parameterTodosEqual:true,parameterAvailable:false});d.snapshotGateEligibleBeforeCallbacks=false;d.callbacks=[];c.capture.snapshot.status=U;c.capture.snapshot.links=[];assert.equal(guardAppMainClosureAvailability(c.capture,{enabled:true}),c.capture);assert.throws(()=>guardNativeStateSourceWindow(c.capture,c.phase,c.policy));});
test('checking a predicate after an earlier false value is inconsistent metadata',()=>{const c=ownedWindow(),d=c.capture.snapshot.closureAvailability;Object.assign(d.configs[0],{appTodosAvailable:false,configAvailable:true,configPropsEqual:'NotChecked',appElementAvailable:'NotChecked'});d.snapshotGateEligibleBeforeCallbacks=false;d.callbacks=[];c.capture.snapshot.status=U;c.capture.snapshot.links=[];assert.throws(()=>guardAppMainClosureAvailability(c.capture,{enabled:true}));});

for(const [name,change]of [
 ['missing',r=>delete r.capture.retention.referenceRetention],
 ['schema',r=>r.capture.retention.referenceRetention.schema='foreign'],
 ['mode',r=>r.capture.retention.referenceRetention.mode='weak-default'],
 ['limit',r=>r.capture.retention.referenceRetention.limit=128],
 ['count',r=>r.capture.retention.referenceRetention.count=0],
 ['negative',r=>r.capture.retention.referenceRetention.count=-1],
 ['fraction',r=>r.capture.retention.referenceRetention.count=0.5],
 ['window',r=>r.capture.retention.referenceRetention.window++],
 ['bytes claim',r=>r.capture.retention.referenceRetention.reachableGraphBytes=64],
 ['GC cause',r=>r.capture.retention.referenceRetention.historicalGCCauseProven=true],
 ['unavailable',r=>r.capture.retention.referenceRetention.available=false],
 ['source scope',r=>r.capture.retention.referenceRetention.sourceOnly=false],
 ['extra data',r=>r.capture.retention.referenceRetention.private='not allowed']
])test('retention metadata refuses '+name,()=>{const c=ownedWindow();change(c);assert.throws(()=>guardNativeStateSourceWindow(c.capture,c.phase,c.policy));});
test('Off and Stop cannot conceal retained roots',()=>{for(const options of [{enabled:false},{stopped:true,label:'stopped'}]){const c=ownedWindow(options);c.capture.retention.referenceRetention.count=1;assert.throws(()=>options.enabled===false?guardNativeStateSourceOffWindow(c.capture,c.phase,c.policy):guardNativeStateSourceWindow(c.capture,c.phase,c.policy));}});

test('foreign realm array methods remain unsupported rather than normalized',()=>{const c=ownedWindow({foreignRealm:true});assert.equal(c.capture.snapshot.status,U);assert.throws(()=>guardNativeStateSourceWindow(c.capture,c.phase,c.policy));assert.equal(c.capture.retention.referenceRetention.count,0);});
test('research policy is fixed and never claims approved product retention',()=>{const p=retainedAppResearchPolicy();assert(Object.isFrozen(p));assert.equal(assertRetainedAppResearchPolicy(p),p);for(const change of [v=>v.productPolicyApproved=true,v=>v.limit=128,v=>v.reachableGraphBytes=0,v=>delete v.mode,v=>v.lifetime='forever',v=>v.extra='unapproved']){const c={...p};change(c);assert.throws(()=>assertRetainedAppResearchPolicy(c));}});
