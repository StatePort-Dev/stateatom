// SPDX-License-Identifier: Apache-2.0
// One bounded exact private native-return/source-element association, not selected DOM.
import assert from 'node:assert/strict';import path from 'node:path';
import {guardMainInputNativeWindow,guardMainInputNativeOffWindow,projectMainInputNativeCase,projectMainInputNativeResult} from './main-input-native-qualification.mjs';
import {classifyCallbackJSXNativeRun} from './callback-jsx-native-qualification.mjs';
import {guardAppMainNativeWindow,guardAppMainNativeOffWindow,projectAppMainNativeCase,projectAppMainNativeResult} from './app-main-props-native-qualification.mjs';
import {guardNativeStateReturnWindow,guardNativeStateReturnOffWindow,projectNativeStateReturnCase,projectNativeStateReturnResult} from './native-state-return-native-qualification.mjs';
const U='Unknown/Unsupported',TYPE='stateatom.main-input-native-case/1',RESULT='stateatom.main-input-native-result/1',APP_TYPE='stateatom.app-main-props-native-case/1',APP_RESULT='stateatom.app-main-props-native-result/1',NATIVE_TYPE='stateatom.native-state-return-native-case/1',NATIVE_RESULT='stateatom.native-state-return-native-result/1',PATH_TYPE='stateatom.retained-app-state-source-case/1',PATH_RESULT='stateatom.retained-app-state-source-result/1';
const hex=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s),count=n=>Number.isSafeInteger(n)&&n>=0&&n<=4096,accepted=['equal','same','changed','toggle'];
export function projectNativeStateSourceCase(s){assert.equal(s.schema,PATH_TYPE);return{...s,schema:NATIVE_TYPE};}
export function projectNativeStateSourceResult(r){assert.equal(r.schema,PATH_RESULT);return{...r,schema:NATIVE_RESULT};}
function common(c,phase,p){const n=c.stateSource;assert(n&&n.snapshot&&n.retention);const s=n.snapshot,r=n.retention;assert.equal(s.schema,'stateatom.native-state-source-path/1');assert.equal(s.page,p.page);for(const k of ['nativeStateOrigin','tupleIndexOrigin','publicHookKind','stateRevision','propStorage','propTransfer','fieldOwnership','componentInstance','selectedPropertyOrigin'])assert.equal(s[k],U);assert.equal(s.sourceOnly,true);assert.equal(s.nativeOrigin,'NotAttested');assert.equal(s.fullPath,false);assert.equal(s.collecting,false);assert.equal(r.collecting,false);assert.equal(r.active,0);assert(count(r.window)&&r.window>0);assert.equal(r.window,c.retention.window);assert.deepEqual(s.window,{id:p.page+':native-state-source-path:window:'+r.window,label:phase.id});assert.deepEqual(c.retention.stateSource,r);assert(count(r.events));return{n,s,r};}
function empty(c,phase,p){const{n,s,r}=common(c,phase,p),stopped=phase.id==='stopped';assert.equal(n.sealed,!stopped);assert.equal(s.sealed,!stopped);assert.equal(r.stopped,stopped);assert.equal(s.status,U);assert.equal(s.links.length,0);for(const k of ['apps','mains','callbacks','active'])assert.equal(r[k],0);return c;}
function positive(c,phase,p){const{n,s,r}=common(c,phase,p);assert.equal(n.sealed,true);assert.equal(s.sealed,true);assert.equal(s.status,'Observed');assert.equal(s.reason,null);for(const k of ['stopped','invalid','overflow'])assert.equal(r[k],false);assert.equal(r.apps,1);assert.equal(r.mains,1);assert.equal(r.callbacks,phase.rowCount);assert.equal(s.links.length,phase.rowCount);assert(r.events>0);assert.equal(new Set(s.links.map(l=>l.appAssociationId)).size,1);assert.equal(new Set(s.links.map(l=>l.mainAssociationId)).size,1);assert.equal(new Set(s.links.map(l=>l.callbackAssociationId)).size,phase.rowCount);const scoped=(v,role)=>{const prefix=p.page+':native-state-source-path:'+r.window+':'+role+':';assert(typeof v==='string'&&v.startsWith(prefix)&&/^[1-9][0-9]*$/.test(v.slice(prefix.length)));};for(let i=0;i<s.links.length;i++){const l=s.links[i];assert.equal(l.nativeReturnedStateSourceAssociation,'Observed');for(const k of ['nativeStateOrigin','tupleIndexOrigin','fieldOwnership','selectedPropertyOrigin'])assert.equal(l[k],U);assert.deepEqual(l.appMainSourceOccurrence,c.snapshot.links[i]);assert.deepEqual(l.nativeReturnedStateReference,c.nativeReturn.snapshot.links[0]);scoped(l.appAssociationId,'app');scoped(l.mainAssociationId,'main');scoped(l.callbackAssociationId,'callback');}return c;}
function guardNativeStateSourceWindowBase(c,phase,p){guardNativeStateReturnWindow(c,phase,p);if(phase.id==='stopped')return empty(c,phase,p);if(phase.id==='filtered'){const{s}=common(c,phase,p);if(s.status==='Observed')return positive(c,phase,p);assert.equal(s.status,U);assert.equal(s.links.length,0);return c;}assert(accepted.includes(phase.id));return positive(c,phase,p);}
function guardNativeStateSourceOffWindowBase(c,phase,p){guardNativeStateReturnOffWindow(c,phase,p);empty(c,phase,p);assert.equal(c.stateSource.retention.events,0);return c;}
function classifyMainAtActualAppCase(r,s){
 const failures=[],fail=code=>{if(!failures.includes(code))failures.push(code);};let callbackQualification=null,positiveWindows=0,links=0;
 try{
  assert.equal(s.schema,TYPE);assert.equal(r.schema,RESULT);assert.equal(r.execution,'ACTUAL_OWNED_PUBLIC_DRIVER');assert.equal(r.actualBrowserStarted,true);assert.equal(r.browserStarted,true);assert.equal(r.sourceDirty,false);
  for(const k of ['withExtension','withHelper','withIDE','productSupport','installedRuntimeProven','fullA02'])assert.equal(r[k],false);assert.equal(r.modelCalls,0);assert.equal(r.nativeWriterCalls,0);
 }catch{fail('MAIN_INPUT_ACTUAL_EXECUTION_REFUSED');}
 try{
  assert(r.inputsBefore&&typeof r.inputsBefore==='object'&&r.inputsAfter&&typeof r.inputsAfter==='object');assert.equal(r.inputsUnchanged,true);assert.deepEqual(r.inputsAfter,r.inputsBefore);const caseFile=path.resolve('docs/testing/component-body-native-case.json');assert(!Object.hasOwn(s.inputHashes,caseFile));assert.equal(Object.keys(r.inputsBefore).length,Object.keys(s.inputHashes).length+1);assert(hex(r.inputsBefore[caseFile]));
  for(const[p,h]of Object.entries(r.inputsBefore)){assert(path.isAbsolute(p)&&hex(h));if(p!==caseFile)assert.equal(s.inputHashes[p],h);}
 }catch{fail('MAIN_INPUT_FROZEN_INPUTS_REFUSED');}
 try{callbackQualification=classifyCallbackJSXNativeRun(projectMainInputNativeResult(r),projectMainInputNativeCase(s));if(callbackQualification.status!=='PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02')fail('CALLBACK_NATIVE_SUBPROTOCOL_REFUSED');}catch{fail('CALLBACK_NATIVE_SUBPROTOCOL_REFUSED');}
 try{
  assert.deepEqual(r.runs.map(run=>run.mode),['original','off','on']);
  for(const run of r.runs){
   assert.deepEqual(run.phases.map(v=>v.id),s.protocol.phases.map(v=>v.id));
   if(run.mode!=='original'){const setup=run.setup.observation;assert.equal(setup.snapshot.status,U);assert.equal(setup.snapshot.links.length,0);assert.equal(setup.snapshot.mainFrames.length,0);assert.equal(setup.retention.mainFrames,0);assert.equal(setup.retention.calls,0);assert.equal(setup.retention.callbacks,0);}
   for(let i=0;i<run.phases.length;i++){const v=run.phases[i],phase=s.protocol.phases[i],p={...s.sitePolicy,page:run.pageId};if(run.mode==='on'){guardMainInputNativeWindow(v.capture,phase,p);if(phase.id!=='stopped'){positiveWindows++;links+=v.capture.snapshot.links.length;}}else if(run.mode==='off')guardMainInputNativeOffWindow(v.capture,phase,p);else assert.equal(v.capture,null);}
  }
  assert.equal(positiveWindows,5);assert.equal(links,9);
 }catch{fail('MAIN_INPUT_WINDOWS_REFUSED');}
 const passed=failures.length===0;return{schema:'stateatom.main-input-native-qualification/1',status:passed?'PASS_BOUNDED_MAIN_INPUT_CALLBACK_JSX_NOT_FULL_A02':'INCOMPLETE_MAIN_INPUT_NOT_FULL_A02',failures,callbackQualification,acceptedMainWindows:passed?positiveWindows:0,acceptedMainLinks:passed?links:0,candidateMainWindows:positiveWindows,candidateMainLinks:links,realHookAndRouterExecuted:passed,realHookLifecycleProven:false,installedRuntimeProven:false,productSupport:false,fullA02:false,scope:'Historical same original Main input/native filter result/map/callback-JSX path in fixed retained app; not state ownership, selected host origin or installed support'};
}

function classifyAppAtActualNewCase(r,s){const failures=[],fail=code=>{if(!failures.includes(code))failures.push(code);};let mainQualification=null,appWindows=0,appLinks=0,filteredAudit=null;
 try{assert.equal(s.schema,APP_TYPE);assert.equal(r.schema,APP_RESULT);assert.equal(r.execution,'ACTUAL_OWNED_PUBLIC_DRIVER');for(const k of ['actualBrowserStarted','browserStarted','appExecuted','ReactDOMExecuted','originalMainExecuted'])assert.equal(r[k],true);assert.equal(r.sourceDirty,false);for(const k of ['withExtension','withHelper','withIDE','productSupport','installedRuntimeProven','fullA02'])assert.equal(r[k],false);assert.equal(r.modelCalls,0);assert.equal(r.nativeWriterCalls,0);assert.deepEqual(s.appPathPolicy,{acceptedPhases:accepted,filtered:'audit-only-not-counted'});}catch{fail('APP_MAIN_ACTUAL_EXECUTION_REFUSED');}
 try{mainQualification=classifyMainAtActualAppCase(projectAppMainNativeResult(r),projectAppMainNativeCase(s));if(mainQualification.status!=='PASS_BOUNDED_MAIN_INPUT_CALLBACK_JSX_NOT_FULL_A02')fail('MAIN_NATIVE_SUBPROTOCOL_REFUSED');}catch{fail('MAIN_NATIVE_SUBPROTOCOL_REFUSED');}
 try{assert.deepEqual(r.runs.map(x=>x.mode),['original','off','on']);for(const run of r.runs){assert.deepEqual(run.phases.map(v=>v.id),s.protocol.phases.map(v=>v.id));if(run.mode!=='original'){const initial=run.setup.observation;assert.equal(initial.snapshot.status,U);assert.equal(initial.snapshot.links.length,0);assert.equal(initial.snapshot.configs.length,0);for(const k of ['apps','configs','mains','callbacks'])assert.equal(initial.retention[k],0);}for(let i=0;i<run.phases.length;i++){const v=run.phases[i],phase=s.protocol.phases[i],p={...s.sitePolicy,page:run.pageId};if(run.mode==='on'){guardAppMainNativeWindow(v.capture,phase,p);if(accepted.includes(phase.id)){appWindows++;appLinks+=v.capture.snapshot.links.length;}else if(phase.id==='filtered')filteredAudit={status:v.capture.snapshot.status,sourceLinks:v.capture.snapshot.links.length,acceptedAppLinks:0};}else if(run.mode==='off')guardAppMainNativeOffWindow(v.capture,phase,p);else assert.equal(v.capture,null);}}assert.equal(appWindows,4);assert.equal(appLinks,8);}catch{fail('APP_MAIN_WINDOWS_REFUSED');}
 const passed=failures.length===0;return{schema:'stateatom.app-main-props-native-qualification/1',status:passed?'PASS_BOUNDED_NATIVE_APP_MAIN_SOURCE_PATH_NOT_STATE_A02':'INCOMPLETE_NATIVE_APP_MAIN_NOT_STATE_A02',failures,mainQualification,acceptedAppWindows:passed?appWindows:0,acceptedAppLinks:passed?appLinks:0,candidateAppWindows:appWindows,candidateAppLinks:appLinks,filteredAudit,realHookRouterSubprotocolQualified:mainQualification?.status==='PASS_BOUNDED_MAIN_INPUT_CALLBACK_JSX_NOT_FULL_A02',nativeStateOrigin:U,tupleIndexOrigin:U,sourcePathOnly:true,realHookLifecycleProven:false,productSupport:false,installedRuntimeProven:false,fullA02:false,scope:'Historical App bound value/fresh native JSX props/exact Main source path acquired in native renderer; no native state, ownership or selected committed host origin'};}

function classifyNativeReturnAtActualPathCase(r,s){
 const failures=[],fail=code=>{if(!failures.includes(code))failures.push(code);};let appQualification=null,windows=0,links=0,filteredAudit=null;
 try{assert.equal(r.schema,NATIVE_RESULT);assert.equal(s.schema,NATIVE_TYPE);assert.equal(r.execution,'ACTUAL_OWNED_PUBLIC_DRIVER');for(const k of ['actualBrowserStarted','browserStarted','appExecuted','ReactDOMExecuted','originalMainExecuted'])assert.equal(r[k],true);assert.equal(r.inputsUnchanged,true);assert.equal(s.sitePolicy.native.nativeVersionAdmitted,true);assert.equal(s.sitePolicy.native.version,'19.2.5');assert.equal(s.sitePolicy.native.sourceDigest,'806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08');assert.deepEqual(s.nativeReturn.policy,s.sitePolicy.native);assert.deepEqual(s.nativeReturn.counts,{returns:3,renders:2});}catch{fail('NATIVE_RETURN_ACTUAL_EXECUTION_REFUSED');}
 try{appQualification=classifyAppAtActualNewCase(projectNativeStateReturnResult(r),projectNativeStateReturnCase(s));if(appQualification.status!=='PASS_BOUNDED_NATIVE_APP_MAIN_SOURCE_PATH_NOT_STATE_A02')fail('APP_MAIN_NATIVE_SUBPROTOCOL_REFUSED');}catch{fail('APP_MAIN_NATIVE_SUBPROTOCOL_REFUSED');}
 try{assert.deepEqual(r.runs.map(v=>v.mode),['original','off','on']);for(const run of r.runs){assert.deepEqual(run.phases.map(v=>v.id),s.protocol.phases.map(v=>v.id));if(run.mode!=='original'){const setup=run.setup.observation;assert.equal(setup.nativeReturn.snapshot.status,U);assert.equal(setup.nativeReturn.snapshot.links.length,0);assert.equal(setup.nativeReturn.retention.frames,0);assert.equal(setup.nativeReturn.retention.events,0);}for(let i=0;i<run.phases.length;i++){const v=run.phases[i],phase=s.protocol.phases[i],p={...s.sitePolicy,page:run.pageId};if(run.mode==='on'){guardNativeStateReturnWindow(v.capture,phase,p);if(accepted.includes(phase.id)){windows++;links+=v.capture.nativeReturn.snapshot.links.length;}else if(phase.id==='filtered')filteredAudit={status:v.capture.nativeReturn.snapshot.status,links:v.capture.nativeReturn.snapshot.links.length,acceptedNativeReferenceLinks:0};}else if(run.mode==='off')guardNativeStateReturnOffWindow(v.capture,phase,p);else assert.equal(v.capture,null);}}assert.equal(windows,4);assert.equal(links,4);}catch{fail('NATIVE_RETURN_WINDOWS_REFUSED');}
 const passed=failures.length===0;return{schema:'stateatom.native-state-return-native-qualification/1',status:passed?'PASS_BOUNDED_NATIVE_RETURN_STATE_REFERENCE_NOT_FULL_A02':'INCOMPLETE_NATIVE_RETURN_STATE_REFERENCE_NOT_FULL_A02',failures,appQualification,acceptedNativeReferenceWindows:passed?windows:0,acceptedNativeReferenceLinks:passed?links:0,candidateNativeReferenceWindows:windows,candidateNativeReferenceLinks:links,filteredAudit,actualNativeReturnedStateReferenceAcquired:passed,nativeStateOrigin:U,tupleIndexOrigin:U,fieldOwnership:U,selectedPropertyOrigin:U,installedRuntimeProven:false,productSupport:false,fullA02:false,scope:'One actual retained App native-render/returned tuple/already-computed state reference premise; separate App/Main source subprotocol, not selected committed DOM lineage or native hook-state origin'};
}

export function classifyNativeStateSourceRun(r,s){
 const failures=[],fail=code=>{if(!failures.includes(code))failures.push(code);};let nativeQualification=null,windows=0,links=0,filteredAudit=null;
 try{assertRetainedAppResearchPolicy(s.researchRetention);assertRetainedAppResearchPolicy(r.researchRetention);}catch{fail('RESEARCH_RETENTION_POLICY_REFUSED');}
 try{assert.equal(r.schema,PATH_RESULT);assert.equal(s.schema,PATH_TYPE);assert.equal(r.execution,'ACTUAL_OWNED_PUBLIC_DRIVER');for(const k of ['actualBrowserStarted','browserStarted','appExecuted','ReactDOMExecuted','originalMainExecuted','inputsUnchanged'])assert.equal(r[k],true);}catch{fail('STATE_SOURCE_ACTUAL_EXECUTION_REFUSED');}
 try{nativeQualification=classifyNativeReturnAtActualPathCase(projectNativeStateSourceResult(r),projectNativeStateSourceCase(s));if(nativeQualification.status!=='PASS_BOUNDED_NATIVE_RETURN_STATE_REFERENCE_NOT_FULL_A02')fail('NATIVE_RETURN_SUBPROTOCOL_REFUSED');}catch{fail('NATIVE_RETURN_SUBPROTOCOL_REFUSED');}
 try{assert.deepEqual(r.runs.map(v=>v.mode),['original','off','on']);for(const run of r.runs){assert.deepEqual(run.phases.map(v=>v.id),s.protocol.phases.map(v=>v.id));if(run.mode!=='original'){const c=run.setup.observation;guardRetainedAppReferences(c,{enabled:run.mode==='on'});guardAppMainClosureAvailability(c,{enabled:run.mode==='on'});assert.equal(c.stateSource.snapshot.status,U);assert.equal(c.stateSource.snapshot.links.length,0);for(const k of ['apps','mains','callbacks','events','active'])assert.equal(c.stateSource.retention[k],0);}for(let i=0;i<run.phases.length;i++){const v=run.phases[i],phase=s.protocol.phases[i],p={...s.sitePolicy,page:run.pageId};if(run.mode==='on'){guardNativeStateSourceWindow(v.capture,phase,p);if(accepted.includes(phase.id)){windows++;links+=v.capture.stateSource.snapshot.links.length;}else if(phase.id==='filtered')filteredAudit={status:v.capture.stateSource.snapshot.status,links:v.capture.stateSource.snapshot.links.length,acceptedStateSourceLinks:0};}else if(run.mode==='off')guardNativeStateSourceOffWindow(v.capture,phase,p);else assert.equal(v.capture,null);}}assert.equal(windows,4);assert.equal(links,8);}catch{fail('STATE_SOURCE_WINDOWS_REFUSED');}
 const passed=failures.length===0;return{schema:'stateatom.retained-app-state-source-qualification/1',status:passed?'PASS_BOUNDED_RETAINED_APP_STATE_SOURCE_NOT_FULL_A02':'INCOMPLETE_RETAINED_APP_STATE_SOURCE_NOT_FULL_A02',failures,nativeQualification,acceptedStateSourceWindows:passed?windows:0,acceptedStateSourceLinks:passed?links:0,candidateStateSourceWindows:windows,candidateStateSourceLinks:links,filteredAudit,actualPrivateReferenceSourceAssociationAcquired:passed,nativeStateOrigin:U,tupleIndexOrigin:U,fieldOwnership:U,selectedPropertyOrigin:U,installedRuntimeProven:false,productSupport:false,fullA02:false,scope:'Same actual private App/config/Main/callback returned React source element and native returned-state reference; not selected committed DOM, field ownership, hook storage or current state origin'};
}

// Consistency of owned serialized diagnostics; no runtime payload inspection.
export function guardAppMainClosureAvailability(c,{enabled=true}={}){
 assert.equal(typeof enabled,'boolean');const a=c.snapshot,r=c.retention,d=a.closureAvailability;
 assert(d&&d.schema==='stateatom.app-main-closure-availability/1');assert.equal(typeof d.scope,'string');
 for(const k of ['configs','mains','callbacks'])assert(Array.isArray(d[k]));
 assert(Number.isSafeInteger(r.configs)&&r.configs>=0&&r.configs<=64);assert(Number.isSafeInteger(r.mains)&&r.mains>=0&&r.mains<=64);assert(Number.isSafeInteger(r.callbacks)&&r.callbacks>=0&&r.callbacks<=512);
 assert.equal(d.configs.length,r.configs);assert.equal(d.configs.length,a.configs.length);assert.equal(d.mains.length,r.mains);assert(d.callbacks.length<=r.callbacks);
 const bool=v=>{assert.equal(typeof v,'boolean');return v;},sequence=(row,ready,names)=>{for(const k of names){if(ready)ready=bool(row[k]);else assert.equal(row[k],'NotChecked');}return ready;};
 const scoped=(v,role)=>{const prefix=a.page+':app-main-props:'+r.window+':'+role+':';assert(typeof v==='string'&&v.startsWith(prefix)&&/^[1-9][0-9]*$/.test(v.slice(prefix.length)));};
 let configsPass=true,mainsPass=true;const mainIds=new Set();
 for(let i=0;i<d.configs.length;i++){const v=d.configs[i],cfg=a.configs[i];assert.equal(v.configId,cfg.configId);assert.equal(v.appOccurrence,cfg.appOccurrence);assert.equal(v.done,cfg.done);scoped(v.configId,'object');scoped(v.appOccurrence,'app');const complete=bool(v.done)&&bool(v.appReturned)&&bool(v.appClosed);for(const k of ['done','appReturned','appClosed'])bool(v[k]);const pass=sequence(v,complete,['appTodosAvailable','configAvailable','configPropsEqual','appElementAvailable']);configsPass=configsPass&&pass;}
 for(const v of d.mains){scoped(v.mainOccurrence,'main');assert(!mainIds.has(v.mainOccurrence));mainIds.add(v.mainOccurrence);const returned=bool(v.returned),closed=bool(v.closed),pass=sequence(v,returned&&closed,['argumentPropsEqual','argumentAvailable','parameterTodosEqual','parameterAvailable']);mainsPass=mainsPass&&pass;}
 const stopped=bool(r.stopped),collecting=bool(a.collecting),invalid=bool(r.invalid),overflow=bool(r.overflow);assert(Number.isSafeInteger(r.active)&&r.active>=0&&r.active<=128);const before=enabled&&!stopped&&!collecting&&!invalid&&!overflow&&r.active===0&&configsPass&&mainsPass;
 assert.equal(d.snapshotGateEligibleBeforeCallbacks,before);let callbackPass=true;
 if(!before)assert.equal(d.callbacks.length,0);
 for(let i=0;i<d.callbacks.length;i++){const v=d.callbacks[i];assert.equal(v.callbackIndex,i);assert(mainIds.has(v.mainOccurrence));const returned=bool(v.returned),closed=bool(v.closed),element=returned&&closed?bool(v.elementAvailable):false;
  if(!returned||!closed)assert.equal(v.elementAvailable,'NotChecked');
  if(!element){for(const k of ['appSubproofStatus','appSubproofLinks','mainSubproofStatus','mainSubproofLinks'])assert.equal(v[k],'NotChecked');}
  else{for(const k of ['appSubproofStatus','mainSubproofStatus'])assert(['Observed',U].includes(v[k]));for(const k of ['appSubproofLinks','mainSubproofLinks'])assert(Number.isSafeInteger(v[k])&&v[k]>=0&&v[k]<=512);}
  const pass=returned&&closed&&element&&v.appSubproofStatus==='Observed'&&v.appSubproofLinks===1&&v.mainSubproofStatus==='Observed'&&v.mainSubproofLinks===1;callbackPass=callbackPass&&pass;if(!pass)assert.equal(i,d.callbacks.length-1);
 }
 if(before&&callbackPass)assert.equal(d.callbacks.length,r.callbacks);
 const positive=before&&callbackPass&&r.callbacks>0;
 assert.equal(a.status,positive?'Observed':U);if(!positive)assert.equal(a.links.length,0);
 return c;
}
export function guardNativeStateSourceWindow(c,phase,p){guardRetainedAppReferences(c,{enabled:true});guardAppMainClosureAvailability(c,{enabled:true});return guardNativeStateSourceWindowBase(c,phase,p);}
export function guardNativeStateSourceOffWindow(c,phase,p){guardRetainedAppReferences(c,{enabled:false});guardAppMainClosureAvailability(c,{enabled:false});return guardNativeStateSourceOffWindowBase(c,phase,p);}

// Additional configuration/fact requirements; every original gate above is retained.
export function retainedAppResearchPolicy(){return Object.freeze({mode:'research-strong-app-elements',limit:64,reachableGraphBytes:'Unknown/Unsupported',lifetime:'window-replace-or-stop',productPolicyApproved:false});}
export function assertRetainedAppResearchPolicy(value){assert.deepEqual(value,retainedAppResearchPolicy());return value;}
export function guardRetainedAppReferences(c,{enabled=true}={}){
 assert.equal(typeof enabled,'boolean');const r=c.retention,m=r.referenceRetention;
 assert(m&&typeof m==='object');assert.deepEqual(Object.keys(m).sort(),['schema','mode','sourceOnly','available','count','limit','window','reachableGraphBytes','lifetime','historicalGCCauseProven'].sort());
 assert.equal(m.schema,'stateatom.app-element-retention/1');assert.equal(m.mode,'research-strong-app-elements');assert.equal(m.sourceOnly,true);assert.equal(m.available,true);
 assert.equal(m.limit,64);assert(Number.isSafeInteger(m.count)&&m.count>=0&&m.count<=64);assert(Number.isSafeInteger(m.window)&&m.window>=0&&m.window<=4096);assert.equal(m.window,r.window);
 assert.equal(m.reachableGraphBytes,'Unknown/Unsupported');assert.equal(m.historicalGCCauseProven,false);assert.equal(m.lifetime,'Until successful startWindow or stop; invalid/overflow clears');
 assert.equal(m.count,!enabled||r.stopped?0:r.configs);return c;
}

// New edge-specific metadata guards. Original source gates above stay unchanged.
export function committedMemoCasePolicy(){return{schema:'stateatom.committed-memo-native-case-edge/1',positivePhases:['equal','same','changed','toggle'],equalExistingRow:'bailout-different-boundary',equalNewRow:'function-same-positive',filtered:'audit-only-not-counted',detached:'Unknown/Unsupported',fullA02:false};}
export function guardCommittedMemoRows(c,selection,phase,p,{enabled=true}={}){
 assert.equal(typeof enabled,'boolean');assert(phase&&selection&&c);
 const rows=selection.rows,r=selection.retention,n=r.nativeElement,stopped=phase.id==='stopped',audit=phase.id==='filtered';
 const scoped=(v,family)=>{assert(typeof v==='string'&&v.startsWith(p.page+':'+family+':'));assert(/^[1-9][0-9]*$/.test(v.slice((p.page+':'+family+':').length)));};
 const origins=v=>{assert.equal(v.schema,'stateatom.committed-state-source-reference/1');assert.equal(v.page,p.page);assert.equal(v.window,c.retention.window);assert.equal(v.sourceOnly,true);assert.equal(v.nativeOrigin,'NotAttested');assert.equal(v.fullPath,false);for(const k of ['nativeStateOrigin','tupleIndexOrigin','fieldOwnership','selectedPropertyOrigin','stateToProp'])assert.equal(v[k],U);assert(Array.isArray(v.links));};
 const empty=v=>{origins(v);assert.equal(v.status,U);assert.equal(v.links.length,0);assert.equal(v.selectedCommittedSourceAssociation,U);assert.equal(v.memoBoundary,undefined);};
 assert(Array.isArray(rows));assert.equal(rows.length,phase.texts.length);assert.equal(r.window,c.retention.window);assert.equal(r.collecting,false);assert.equal(r.stopped,stopped);assert.equal(r.invalid,false);assert.equal(r.reason,null);assert.equal(n.stopped,stopped);assert.equal(n.capped,false);assert.equal(n.collector.stopped,stopped);assert.equal(n.collector.capped,false);
 for(const kind of ['native','jsx','element','memo'])assert.equal(selection.hooks[kind],enabled);
 empty(selection.detached);
 if(!enabled||stopped){
  for(let i=0;i<rows.length;i++){assert.equal(rows[i].index,i);empty(rows[i].lookup);}
  for(const key of ['callbacks'])assert.equal(r[key],0);for(const key of ['bindings','memoOutcomes'])assert.equal(n[key],0);
  if(!enabled){assert.equal(n.events,0);assert.equal(n.memoEnabled,false);}return{positive:0,boundaries:0,rows:rows.length};
 }
 assert.equal(n.available,true);assert.equal(n.memoEnabled,true);assert.equal(n.collector.available,true);
 if(audit&&c.stateSource.snapshot.status!== 'Observed'){
  for(let i=0;i<rows.length;i++){assert.equal(rows[i].index,i);empty(rows[i].lookup);}return{positive:0,boundaries:0,rows:rows.length};
 }
 assert.equal(c.stateSource.snapshot.status,'Observed');assert.equal(c.stateSource.snapshot.links.length,rows.length);assert.equal(r.callbacks,rows.length);assert.equal(rows.length,phase.rowCount);
 for(const key of ['events','bindings','memoOutcomes'])assert(Number.isSafeInteger(n[key])&&n[key]>=rows.length&&n[key]<=4096);
 let positive=0,boundaries=0,commit=null;const fibers=new Set(),nodes=new Set();
 for(let i=0;i<rows.length;i++){
  const row=rows[i],v=row.lookup;assert.equal(row.index,i);origins(v);let proof,source,element=null;
  if(v.status==='Observed'){
   assert.equal(v.reason,null);assert.equal(v.selectedCommittedSourceAssociation,'Observed');assert.equal(v.memoBoundary,undefined);assert.equal(v.links.length,1);
   const link=v.links[0];source=link.stateSource;proof=link.nativeMemo;element=link.nativeElement;assert.equal(link.selectedCommittedSourceAssociation,'Observed');for(const k of ['nativeStateOrigin','tupleIndexOrigin','fieldOwnership','selectedPropertyOrigin'])assert.equal(link[k],U);
   assert.equal(proof.propsReference,'Same');assert.equal(proof.commitId,element.commitId);assert.equal(proof.fiberId,element.fiberId);assert(p.elementFiber.sites.some(s=>s.id===element.siteId));
   for(const k of ['nodeId','rootId','fiberId','propsId','componentId','memoElementTypeId'])scoped(element[k],'react19');scoped(element.nativeElementId,'native-element-fiber:object');scoped(element.eventId,'native-element-fiber:event');assert(!nodes.has(element.nodeId));nodes.add(element.nodeId);positive++;
  }else{
   assert.equal(v.status,U);assert.equal(v.reason,'Incoming memo element props were not retained');assert.equal(v.selectedCommittedSourceAssociation,U);assert.equal(v.links.length,0);assert(v.memoBoundary);source=v.memoBoundary.stateSource;proof=v.memoBoundary.nativeMemo;assert.equal(proof.propsReference,'Different');boundaries++;
  }
  assert.deepEqual(source,c.stateSource.snapshot.links[i]);assert(proof);const site=p.memoBranch.sites.find(s=>s.id===proof.siteId);assert(site);assert.equal(proof.kind,site.eventKind);scoped(proof.eventId,'native-element-fiber:memo-event');scoped(proof.fiberId,'react19');scoped(proof.commitId,'react19:commit');
  if(commit===null)commit=proof.commitId;else assert.equal(proof.commitId,commit);assert(!fibers.has(proof.fiberId));fibers.add(proof.fiberId);
  if(phase.id==='equal'){assert.equal(proof.propsReference,i===0?'Different':'Same');assert.equal(proof.kind,i===0?'memo-bailout-return':'memo-function-update-return');}
 }
 return{positive:audit?0:positive,boundaries:audit?0:boundaries,rows:rows.length};
}
export function classifyCommittedMemoRun(r,s){
 const failures=[],fail=code=>{if(!failures.includes(code))failures.push(code);};let base=null,positives=0,boundaries=0,windows=0;
 try{assert.deepEqual(s.committedMemoCase,committedMemoCasePolicy());assert.deepEqual(r.committedMemoCase,s.committedMemoCase);assert.equal(r.execution,'ACTUAL_OWNED_PUBLIC_DRIVER');assert.deepEqual(r.errors,[]);assert.equal(r.sourceDirty,false);base=classifyNativeStateSourceRun(r,s);assert.equal(base.status,'PASS_BOUNDED_RETAINED_APP_STATE_SOURCE_NOT_FULL_A02');assert.deepEqual(base.failures,[]);assert.equal(r.qualification.status,base.status);}catch{fail('ORIGINAL_COMPLETE_SOURCE_OR_CASE_REFUSED');}
 try{
  assert.deepEqual(s.nativeMemo.nativeReturnPolicy,s.sitePolicy.native);assert.deepEqual(s.nativeMemo.elementFiberPolicy,s.sitePolicy.elementFiber);assert.deepEqual(s.nativeMemo.policy,s.sitePolicy.memoBranch);assert.equal(s.nativeMemo.chainDigests.nativeReturnOutput,s.nativeReturn.outputDigest);assert.equal(s.nativeMemo.chainDigests.memoOutput,s.nativeMemo.outputDigest);assert.equal(s.nativeMemo.retainedMemoItemQualified,false);assert.deepEqual(s.nativeMemo.counts,{functionUpdate:1,bailout:1});assert.deepEqual(s.nativeMemo.elementFiberCounts,{create:1,update:1,single:1});
  for(const run of r.runs){for(let i=0;i<run.phases.length;i++){const v=run.phases[i],phase=s.protocol.phases[i];if(run.mode==='original'){assert.equal(v.committedMemo,null);continue;}const n=guardCommittedMemoRows(v.capture,v.committedMemo,phase,{...s.sitePolicy,page:run.pageId},{enabled:run.mode==='on'});if(run.mode==='on'&&accepted.includes(phase.id)){windows++;positives+=n.positive;boundaries+=n.boundaries;}}}
  assert.equal(windows,4);assert.equal(positives+boundaries,8);assert(positives>=1&&boundaries>=1);
 }catch{fail('COMPLETE_COMMITTED_MEMO_ROWS_REFUSED');}
 const passed=failures.length===0;return{schema:'stateatom.committed-memo-reference-qualification/1',status:passed?'PASS_BOUNDED_COMMITTED_MEMO_REFERENCE_NOT_FULL_A02':'INCOMPLETE_COMMITTED_MEMO_REFERENCE_NOT_FULL_A02',failures,originalSourceQualified:base?.status==='PASS_BOUNDED_RETAINED_APP_STATE_SOURCE_NOT_FULL_A02',acceptedWindows:passed?windows:0,acceptedPositiveLinks:passed?positives:0,acceptedBoundaryRows:passed?boundaries:0,candidateWindows:windows,candidatePositiveLinks:positives,candidateBoundaryRows:boundaries,retainedMemoItemQualified:passed,nativeStateOrigin:U,tupleIndexOrigin:U,fieldOwnership:U,selectedPropertyOrigin:U,stateToProp:U,installedRuntimeProven:false,productSupport:false,fullA02:false};
}

export function componentBodyCasePolicy(){return{schema:'stateatom.committed-component-body-case-edge/1',positiveRows:{equal:1,same:0,changed:0,toggle:0},positiveLinks:4,boundaryRows:4,parameterIndex:0,secondParameterAncestry:U,filtered:'audit-only-not-counted',fullA02:false};}
export function guardComponentBodyRows(selection,memo,phase,p,{enabled=true}={}){
 assert(selection&&Array.isArray(selection.rows)&&selection.rows.length===phase.rowCount);assert(memo&&Array.isArray(memo.rows)&&memo.rows.length===phase.rowCount);
 assert.deepEqual(selection.hooks,{call:enabled,body:enabled});assert(selection.retention);assert.equal(selection.retention.strongApplicationPins,0);
 const common=r=>{assert.equal(r.schema,'stateatom.committed-component-body-reference/1');assert.equal(r.page,p.page);assert.equal(r.sourceOnly,true);assert.equal(r.nativeOrigin,'NotAttested');assert.equal(r.componentInvocationRuntimeQualified,false);assert.equal(r.fullPath,false);assert.equal(r.fieldOwnership,U);assert.equal(r.selectedPropertyOrigin,U);assert(Array.isArray(r.links));};
 const negative=r=>{common(r);assert.equal(r.status,U);assert.equal(r.links.length,0);};
 negative(selection.detached);let positive=0,boundaries=0;
 for(let i=0;i<selection.rows.length;i++){
  const row=selection.rows[i];assert.equal(row.index,i);const r=row.lookup;common(r);
  const selected=enabled&&accepted.includes(phase.id)&&i===componentBodyCasePolicy().positiveRows[phase.id];
  if(!selected){negative(r);if(enabled&&accepted.includes(phase.id))boundaries++;continue;}
  assert.equal(r.status,'Observed');assert.equal(r.reason,null);assert.equal(r.links.length,1);const link=r.links[0],original=memo.rows[i];assert.equal(original.index,i);assert.equal(original.lookup.status,'Observed');assert.equal(original.lookup.links.length,1);assert.deepEqual(link.stateSource,original.lookup.links[0]);
  assert.equal(link.parameterIndex,0);assert.equal(link.parameterReference,'Same');assert.equal(link.secondParameterAncestry,U);assert.equal(link.commitId,original.lookup.links[0].nativeElement.commitId);
  assert(link.body&&typeof link.body.id==='string'&&link.body.id.startsWith(p.page+':body:'));assert(typeof link.body.nativeFrame==='string'&&link.body.nativeFrame.startsWith(p.page+':component-call:frame:'));
  const source=link.body.source,policy=p.componentBody;assert(policy);assert.equal(source.file,policy.file);assert.equal(source.sourceDigest,policy.sourceDigest);assert.equal(source.owner,policy.owner);for(const [actual,expected]of [[source.parameter1,policy.parameters[0]],[source.parameter2,policy.parameters[1]]]){assert.deepEqual(Object.keys(actual).sort(),['binding','key']);assert.equal(actual.key,expected.key);assert.equal(actual.binding,expected.binding);}assert.equal(source.entrySite,policy.sites.find(s=>s.kind==='component-body-entry').id);assert.equal(source.returnSite,policy.sites.find(s=>s.kind==='component-body-return').id);
  positive++;
 }
 if(!enabled||phase.id==='stopped'){assert.equal(selection.retention.calls,0);assert.equal(selection.retention.callbacks,0);}
 return{positive,boundaries};
}
export function classifyComponentBodyRun(r,s){
 const failures=[],fail=code=>{if(!failures.includes(code))failures.push(code);};let base=null,positives=0,boundaries=0,windows=0;
 try{assert.equal(r.execution,'ACTUAL_OWNED_PUBLIC_DRIVER');assert.deepEqual(r.componentBodyCase,componentBodyCasePolicy());assert.deepEqual(s.componentBodyCase,r.componentBodyCase);assert.deepEqual(r.errors,[]);base=classifyCommittedMemoRun(r,s);assert.equal(base.status,'PASS_BOUNDED_COMMITTED_MEMO_REFERENCE_NOT_FULL_A02');assert.deepEqual(base.failures,[]);assert.equal(r.committedMemoQualification.status,base.status);}catch{fail('ORIGINAL_COMPLETE_MEMO_OR_BODY_CASE_REFUSED');}
 try{
  assert.equal(s.nativeCall.nativeVersionAdmitted,true);assert.equal(s.nativeCall.version,'19.2.5');assert.deepEqual(s.nativeCall.policy,s.sitePolicy.componentCall);assert.equal(s.nativeCall.chainDigests.memoOutput,s.nativeMemo.outputDigest);assert.equal(s.nativeCall.chainDigests.componentCallOutput,s.nativeCall.outputDigest);assert.deepEqual(s.nativeCall.counts,{initial:1,again:1});assert.deepEqual(s.componentBody.policy,s.sitePolicy.componentBody);assert.equal(s.componentBody.componentInvocationRuntimeQualified,false);
  for(const run of r.runs)for(let i=0;i<run.phases.length;i++){
   const v=run.phases[i],phase=s.protocol.phases[i];if(run.mode==='original'){assert.equal(v.componentBody,null);continue;}
   const counts=guardComponentBodyRows(v.componentBody,v.committedMemo,phase,{...s.sitePolicy,page:run.pageId},{enabled:run.mode==='on'});
   if(run.mode==='on'&&accepted.includes(phase.id)){windows++;positives+=counts.positive;boundaries+=counts.boundaries;}
  }
  assert.equal(windows,4);assert.equal(positives,4);assert.equal(boundaries,4);
 }catch{fail('COMPLETE_COMMITTED_BODY_ROWS_REFUSED');}
 const passed=failures.length===0;return{schema:'stateatom.committed-component-body-qualification/1',status:passed?'PASS_BOUNDED_COMMITTED_COMPONENT_PARAMETERS_NOT_FULL_A02':'INCOMPLETE_COMMITTED_COMPONENT_PARAMETERS_NOT_FULL_A02',failures,originalMemoQualified:base?.status==='PASS_BOUNDED_COMMITTED_MEMO_REFERENCE_NOT_FULL_A02',acceptedWindows:passed?windows:0,acceptedPositiveLinks:passed?positives:0,acceptedBoundaryRows:passed?boundaries:0,candidateWindows:windows,candidatePositiveLinks:positives,candidateBoundaryRows:boundaries,componentBodyQualified:passed,secondParameterAncestry:U,fieldOwnership:U,selectedPropertyOrigin:U,installedRuntimeProven:false,productSupport:false,fullA02:false};
}
