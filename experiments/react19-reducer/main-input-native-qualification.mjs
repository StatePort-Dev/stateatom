// SPDX-License-Identifier: Apache-2.0
// Saved owned-native DTO guards; no browser, app execution or origin attestation.
import assert from 'node:assert/strict';
import path from 'node:path';
import {guardCallbackJSXNativeWindow,classifyCallbackJSXNativeRun} from './callback-jsx-native-qualification.mjs';
const U='Unknown/Unsupported',TYPE='stateatom.main-input-native-case/1',RESULT='stateatom.main-input-native-result/1',OLD_CASE='stateatom.callback-jsx-native-case/5',OLD_RESULT='stateatom.callback-jsx-native-result/1';
const hex=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s),count=(v,max=4096)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const strong=['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin'];
function scope(s,main=false){for(const k of main?[...strong,'componentInstance']:strong)assert.equal(s[k],U);assert.equal(s.nativeOrigin,'NotAttested');assert.equal(s.fullPath,false);}
function policy(p){
 assert(typeof p.page==='string'&&p.page.length>0&&p.page.length<=128);const sites=[p.mainSite,p.filterSite,p.mapSite];
 for(let i=0;i<sites.length;i++){const s=sites[i];assert(hex(s.id)&&hex(s.sourceDigest)&&typeof s.file==='string'&&s.file.length>0);assert.equal(s.kind,['main-input','filter','map'][i]);for(const k of ['line','column','endLine','endColumn'])assert(Number.isSafeInteger(s[k])&&s[k]>0);assert.equal(s.file,p.mainSite.file);assert.equal(s.sourceDigest,p.mainSite.sourceDigest);assert(s.endLine>s.line||s.endLine===s.line&&s.endColumn>=s.column);assert(s.line>p.mainSite.line||s.line===p.mainSite.line&&s.column>=p.mainSite.column);assert(s.endLine<p.mainSite.endLine||s.endLine===p.mainSite.endLine&&s.endColumn<=p.mainSite.endColumn);}
 assert.equal(new Set(sites.map(s=>s.id)).size,3);assert.equal(p.mainSite.functionName,'Main');assert.equal(p.mainSite.parameter,'todos');
}
function common(c,phase,p){
 assert(c&&c.snapshot&&c.retention);policy(p);const s=c.snapshot,r=c.retention;assert.equal(s.schema,'stateatom.main-parameter-filter-map/1');assert.equal(s.page,p.page);scope(s,true);assert(count(r.window)&&r.window>0);assert.equal(s.window.id,p.page+':main-input:window:'+r.window);assert.equal(s.window.label,phase.id);assert.equal(s.collecting,false);assert.equal(r.collecting,false);assert.equal(r.active,0);assert.equal(s.callbackInterval.schema,'stateatom.callback-jsx-config-interval/1');assert.equal(s.callbackInterval.window.label,phase.id);assert.equal(r.callbackInterval.window,r.window);return{s,r};
}
export function projectMainInputNativeCapture(c){if(c===null)return null;assert(c&&c.snapshot&&c.retention);assert.equal(c.snapshot.schema,'stateatom.main-parameter-filter-map/1');assert.equal(c.snapshot.callbackInterval.schema,'stateatom.callback-jsx-config-interval/1');return{sealed:c.sealed,snapshot:c.snapshot.callbackInterval,retention:c.retention.callbackInterval};}
export function projectMainInputNativeCase(s){assert.equal(s.schema,TYPE);return{...s,schema:OLD_CASE};}
export function projectMainInputNativeResult(r){
 assert.equal(r.schema,RESULT);return{...r,schema:OLD_RESULT,runs:r.runs.map(run=>({...run,setup:run.setup?{...run.setup,observation:projectMainInputNativeCapture(run.setup.observation)}:run.setup,phases:run.phases.map(v=>({...v,capture:projectMainInputNativeCapture(v.capture)}))}))};
}
export function guardMainInputNativeWindow(c,phase,p){
 const{s,r}=common(c,phase,p);guardCallbackJSXNativeWindow(projectMainInputNativeCapture(c),phase,p);
 if(phase.id==='stopped'){
  assert.equal(c.sealed,false);assert.equal(s.sealed,false);assert.equal(r.stopped,true);assert.equal(s.status,U);assert.equal(s.links.length,0);assert.equal(s.mainFrames.length,0);for(const k of ['mainFrames','calls','callbacks'])assert.equal(r[k],0);return c;
 }
 assert.equal(c.sealed,true);assert.equal(s.sealed,true);assert.equal(s.status,'Observed');assert.equal(s.reason,null);for(const k of ['stopped','invalid','overflow'])assert.equal(r[k],false);assert.equal(r.mainFrames,1);assert.equal(r.calls,2);assert.equal(r.callbacks,phase.rowCount);assert.equal(s.mainFrames.length,1);assert.equal(s.links.length,phase.rowCount);
 assert(Number.isSafeInteger(phase.rowCount)&&phase.rowCount>0&&phase.rowCount<=512);for(const k of ['filterCallId','mapCallId','filterResultId'])assert.equal(new Set(s.links.map(l=>l[k])).size,1);
 const m=s.mainFrames[0];assert.equal(m.closed,true);assert.equal(m.returned,true);assert.deepEqual(m.mainSite,p.mainSite);assert.notEqual(m.argumentId,m.parameterId);
 const id=(value,role)=>{const prefix=p.page+':main-input:'+r.window+':'+role+':';assert(typeof value==='string'&&value.startsWith(prefix));const tail=value.slice(prefix.length);assert(/^[1-9][0-9]*$/.test(tail)&&count(Number(tail)));};
 for(const[k,role]of [['mainFrameId','main'],['argumentId','object'],['parameterId','object']])id(m[k],role);
 for(let i=0;i<s.links.length;i++){
  const l=s.links[i];assert.equal(l.mainFrameId,m.mainFrameId);assert.equal(l.argumentId,m.argumentId);assert.equal(l.parameterId,m.parameterId);assert.equal(l.parameter,'todos');assert.equal(l.filterReceiverId,l.parameterId);assert.equal(l.filterResultId,l.mapReceiverId);assert.notEqual(l.filterResultId,l.parameterId);assert.notEqual(l.filterCallId,l.mapCallId);
  for(const k of ['mainSite','filterSite','mapSite'])assert.deepEqual(l[k],p[k]);
  for(const[k,role]of [['mainFrameId','main'],['argumentId','object'],['parameterId','object'],['filterCallId','call'],['filterReceiverId','object'],['filterResultId','object'],['mapCallId','call'],['mapReceiverId','object']])id(l[k],role);
  assert.deepEqual(l.callbackOccurrence,s.callbackInterval.links[i]);assert.equal(l.callbackOccurrence.mapIndex,i);
 }
 return c;
}
export function guardMainInputNativeOffWindow(c,phase,p){
 const{s,r}=common(c,phase,p),b=s.callbackInterval,br=r.callbackInterval;assert.equal(c.sealed,phase.id!=='stopped');assert.equal(s.sealed,phase.id!=='stopped');assert.equal(r.stopped,phase.id==='stopped');assert.equal(s.status,U);assert.equal(s.links.length,0);assert.equal(s.mainFrames.length,0);for(const k of ['mainFrames','calls','callbacks','events'])assert.equal(r[k],0);assert.equal(r.invalid,false);assert.equal(r.overflow,false);
 scope(b);assert.equal(b.status,U);assert.equal(b.links.length,0);assert.equal(b.frames.length,0);assert.equal(b.page,p.page);assert.equal(b.window.id,p.page+':callback-jsx-config:window:'+r.window);assert.equal(b.sealed,phase.id!=='stopped');assert.equal(b.collecting,false);assert.equal(br.stopped,phase.id==='stopped');assert.equal(br.active,0);assert.equal(br.collecting,false);assert.equal(br.frames,0);assert.equal(br.calls,0);assert.equal(br.configInput.configs,0);assert.equal(br.configInput.pending,0);return c;
}
export function classifyMainInputNativeRun(r,s){
 const failures=[],fail=code=>{if(!failures.includes(code))failures.push(code);};let callbackQualification=null,positiveWindows=0,links=0;
 try{
  assert.equal(s.schema,TYPE);assert.equal(r.schema,RESULT);assert.equal(r.execution,'ACTUAL_OWNED_PUBLIC_DRIVER');assert.equal(r.actualBrowserStarted,true);assert.equal(r.browserStarted,true);assert.equal(r.sourceDirty,false);
  for(const k of ['withExtension','withHelper','withIDE','productSupport','installedRuntimeProven','fullA02'])assert.equal(r[k],false);assert.equal(r.modelCalls,0);assert.equal(r.nativeWriterCalls,0);
 }catch{fail('MAIN_INPUT_ACTUAL_EXECUTION_REFUSED');}
 try{
  assert(r.inputsBefore&&typeof r.inputsBefore==='object'&&r.inputsAfter&&typeof r.inputsAfter==='object');assert.equal(r.inputsUnchanged,true);assert.deepEqual(r.inputsAfter,r.inputsBefore);const caseFile=path.resolve('docs/testing/main-input-native-case.json');assert(!Object.hasOwn(s.inputHashes,caseFile));assert.equal(Object.keys(r.inputsBefore).length,Object.keys(s.inputHashes).length+1);assert(hex(r.inputsBefore[caseFile]));
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
