// SPDX-License-Identifier: Apache-2.0
// Pure saved-fact qualification. No browser, application or native attestation.
import assert from 'node:assert/strict';
import path from 'node:path';
import {createHash} from 'node:crypto';
const hash=s=>createHash('sha256').update(s).digest('hex'),digest=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s),revision=s=>typeof s==='string'&&/^[a-f0-9]{40}$/.test(s);
const count=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
const unknown='Unknown/Unsupported',strong=['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin'];
const forbidden=/^--(?:no-sandbox|disable-setuid-sandbox|ignore-certificate-errors(?:-spki-list)?|disable-web-security|load-extension|disable-extensions-except)(?:=|$)/;
const managed=p=>typeof p==='string'&&path.dirname(p)==='/tmp'&&/^playwright_chromiumdev_profile-[A-Za-z0-9_-]+$/.test(path.basename(p));
export function capturePublicCallbackJSXStartup(input,expected){
 const r={schema:'stateatom.callback-jsx-public-startup/1',source:'Browser.getBrowserCommandLine',status:'PUBLIC_STARTUP_REPORT_REFUSED',argumentCount:0,vectorDigest:null,executable:null,executableDigest:null,profile:null,profileDigest:null,profileOptionCount:0,headless:false,automation:false,forbidden:[],errors:[]};
 const error=c=>{if(!r.errors.includes(c))r.errors.push(c);};
 try{
  if(!Array.isArray(input)||!count(input.length,256)||input.length<2){error('ARGUMENT_VECTOR_UNSUPPORTED');return finish();}
  const args=[];let bytes=0;
  for(let i=0;i<input.length;i++){const d=Object.getOwnPropertyDescriptor(input,String(i));if(!d||!Object.hasOwn(d,'value')||typeof d.value!=='string'||d.value.includes('\0')){error('ARGUMENT_VALUE_UNSUPPORTED');return finish();}bytes+=Buffer.byteLength(d.value)+1;if(bytes>65536){error('ARGUMENT_CAPACITY');return finish();}args.push(d.value);}
  r.argumentCount=args.length;r.vectorDigest=hash(JSON.stringify(args));r.executableDigest=hash(args[0]);
  if(args[0]===expected.executable)r.executable=args[0];else error('EXECUTABLE_MISMATCH');
  const profiles=args.filter(a=>a==='--user-data-dir'||a.startsWith('--user-data-dir='));
  r.profileOptionCount=profiles.length;
  if(profiles.length===1&&profiles[0]==='--user-data-dir='+expected.profile&&managed(expected.profile)){r.profile=expected.profile;r.profileDigest=hash(expected.profile);}else error('PROFILE_MISMATCH');
  const heads=args.filter(a=>a.startsWith('--headless')),automation=args.filter(a=>a==='--enable-automation'||a.startsWith('--enable-automation='));
  r.headless=heads.length===1&&heads[0]==='--headless';if(!r.headless)error('HEADLESS_REPORT_MISSING');
  r.automation=automation.length===1&&automation[0]==='--enable-automation';if(!r.automation)error('AUTOMATION_REPORT_MISSING');
  r.forbidden=args.filter(a=>forbidden.test(a)).map(a=>a.split('=')[0]);if(r.forbidden.length)error('FORBIDDEN_ARGUMENT');
 }catch{error('PUBLIC_REPORT_UNAVAILABLE');}
 return finish();
 function finish(){return Object.freeze({...r,status:r.errors.length?'PUBLIC_STARTUP_REPORT_REFUSED':'PUBLIC_STARTUP_REPORT_CAPTURED',forbidden:Object.freeze(r.forbidden),errors:Object.freeze(r.errors)});}
}
export function qualifyCallbackJSXStartup(f,p){
 const failures=[],check=(ok,code)=>{if(!ok&&!failures.includes(code))failures.push(code);},w=f?.owner,r=f?.publicReport,proc=f?.proc,c=proc?.reported,m=f?.managedProfile;
 check(typeof p?.executable==='string'&&path.isAbsolute(p.executable)&&digest(p.sha256)&&managed(p.profile),'POLICY');
 check(w?.schema==='stateatom.browser-launch-witness/1'&&w.status==='CAPTURED_ORIGINAL_INVOCATION'&&w.errors?.length===0&&Number.isSafeInteger(w.pid)&&w.pid>0&&w.executable===p.executable&&w.executableDigest===hash(p.executable)&&w.profile===p.profile&&w.profileDigest===hash(p.profile)&&w.flags?.headless===true&&w.flags.profileOptionCount===1&&w.flags.forbidden?.length===0&&count(w.argumentCount,256)&&w.argumentCount>=2&&digest(w.vectorDigest)&&digest(w.commandLineDigest)&&count(w.commandLineLength,65536)&&w.commandLineLength>0,'ORIGINAL_OWNER_WITNESS');
 check(proc?.schema==='stateatom.owned-browser-process-facts/1'&&Number.isSafeInteger(proc.driverPid)&&proc.driverPid>0&&proc.driverPid!==w?.pid&&proc.errors?.length===0&&proc.reportedBrowserPids?.length===1&&proc.reportedBrowserPids[0]===w?.pid&&c?.pid===w?.pid,'CDP_OWNER_PID');
 const errorsOK=a=>Array.isArray(a)&&a.every(e=>e?.code==='PROC_ARGUMENTS_ERROR');
 check(c?.startTimeStable===true&&/^\d+$/.test(c?.startTime||'')&&c.procExe===p.executable&&c.sha256===p.sha256&&errorsOK(c.errors),'OWNED_PROCESS_IDENTITY');
 const children=Array.isArray(proc?.directChildren)?proc.directChildren.filter(x=>x?.pid===w?.pid):[];
 check(children.length===1&&children[0].startTime===c?.startTime&&children[0].startTimeStable===true&&children[0].procExe===p.executable&&children[0].sha256===p.sha256&&errorsOK(children[0].errors),'DIRECT_CHILD_IDENTITY');
 check(r?.schema==='stateatom.callback-jsx-public-startup/1'&&r.source==='Browser.getBrowserCommandLine'&&r.status==='PUBLIC_STARTUP_REPORT_CAPTURED'&&r.errors?.length===0&&r.executable===p.executable&&r.executableDigest===hash(p.executable)&&r.profile===p.profile&&r.profileDigest===hash(p.profile)&&r.profileOptionCount===1&&r.headless===true&&r.automation===true&&r.forbidden?.length===0&&count(r.argumentCount,256)&&r.argumentCount>=2&&digest(r.vectorDigest),'PUBLIC_STARTUP_REPORT');
 check(m?.realPath===p.profile&&m.isDirectory===true&&m.isSymbolicLink===false&&m.errors?.length===0,'MANAGED_PROFILE');
 check(f?.browserVersion===p.browserVersion,'BROWSER_VERSION');
 return{schema:'stateatom.callback-jsx-startup-qualification/1',status:failures.length?'REFUSED_PUBLIC_STARTUP_OR_OWNER_PROCESS_FACTS':'QUALIFIED_PUBLIC_STARTUP_AND_OWNER_PROCESS_FACTS_ONLY',failures,effectiveMode:unknown,procArgumentObservation:unknown,appExecuted:false,fullA02:false};
}
const frozen=x=>{if(x&&typeof x==='object'){for(const k of Object.keys(x))frozen(x[k]);Object.freeze(x);}return x;};
export function callbackJSXNativeProtocol(){return frozen({schema:'stateatom.callback-jsx-native-protocol/1',modes:['original','off','on'],setup:{texts:['SAME'],checked:[false]},phases:[
 {id:'equal',texts:['SAME','SAME'],checked:[false,false],rowCount:2},
 {id:'same',texts:['SAME','SAME'],checked:[false,false],rowCount:2},
 {id:'changed',texts:['CHANGED','SAME'],checked:[false,false],rowCount:2},
 {id:'toggle',texts:['CHANGED','SAME'],checked:[true,false],rowCount:2},
 {id:'filtered',texts:['SAME'],checked:[false],rowCount:1},
 {id:'stopped',texts:['SAME','AFTER_STOP'],checked:[false,false],rowCount:2}
 ]});}
function sameSite(actual,expected){assert(actual&&expected);assert.deepEqual({...actual},{...expected});}
function scope(s,page){assert.equal(s.schema,'stateatom.callback-jsx-config-interval/1');assert.equal(s.page,page);for(const k of strong)assert.equal(s[k],unknown);assert.equal(s.nativeOrigin,'NotAttested');assert.equal(s.fullPath,false);}
export function guardCallbackJSXNativeWindow(c,phase,policy){
 assert(c?.snapshot&&c.retention);const s=c.snapshot,r=c.retention;scope(s,policy.page);assert(count(r.window,4096));assert.equal(s.window.id,policy.page+':callback-jsx-config:window:'+r.window);assert.equal(s.window.label,phase.id);assert.equal(r.collecting,false);assert.equal(r.active,0);
 if(phase.id==='stopped'){
  assert.equal(r.stopped,true);assert.equal(s.status,unknown);assert.equal(s.links.length,0);assert.equal(s.frames.length,0);assert.equal(r.calls,0);assert.equal(r.frames,0);assert.equal(r.configInput.configs,0);assert.equal(r.configInput.pending,0);return c;
 }
 assert.equal(c.sealed,true);assert.equal(s.sealed,true);assert.equal(s.collecting,false);assert.equal(s.status,'Observed');
 assert.equal(r.stopped,false);assert.equal(r.invalid,false);assert.equal(r.overflow,false);assert.equal(r.frames,phase.rowCount);assert(count(r.calls,64)&&r.calls>=1);
 assert.equal(r.configInput.stopped,false);assert.equal(r.configInput.collecting,false);assert.equal(r.configInput.invalid,false);assert.equal(r.configInput.overflow,false);assert.equal(r.configInput.configs,phase.rowCount);assert.equal(r.configInput.completed,phase.rowCount);assert.equal(r.configInput.pending,0);
 assert.equal(s.frames.length,phase.rowCount);assert.equal(s.links.length,phase.rowCount);
 for(const key of ['frameId','itemId','elementId'])assert.equal(new Set(s.links.map(l=>l[key])).size,phase.rowCount);
 assert.equal(new Set(s.links.map(l=>l.callId)).size,1);assert.equal(new Set(s.links.map(l=>l.arrayId)).size,1);
 const indices=[];
 for(const l of s.links){
  sameSite(l.site,policy.mapSite);assert.equal(l.itemId,l.configInputId);
  const f=s.frames.find(f=>f.frameId===l.frameId);assert(f);assert.equal(f.closed,true);assert.equal(f.returned,true);assert.equal(f.returnedId,l.elementId);assert.equal(f.itemId,l.itemId);assert.equal(f.callId,l.callId);assert.equal(f.arrayId,l.arrayId);assert.equal(f.mapIndex,l.mapIndex);sameSite(f.site,policy.mapSite);
  const n=l.configInputOccurrence;assert(n);assert.equal(n.inputKind,'source-fresh-own-data-config');assert.equal(n.field,'todo');assert.equal(n.status,'completed');
  assert(policy.jsxSites.some(site=>JSON.stringify(site)===JSON.stringify(n.site)));for(const k of ['inputId','configId','valueId','elementId']){assert.equal(typeof n[k],'string');assert(n[k].length>0&&n[k].length<=512);}
  assert.equal(l.copyOccurrence,undefined);indices.push(l.mapIndex);
 }
 assert.deepEqual(indices.sort((a,b)=>a-b),Array.from({length:phase.rowCount},(_,i)=>i));return c;
}
export function classifyCallbackJSXNativeRun(r,s){
 const failures=[];
 try{
  assert.equal(r.schema,'stateatom.callback-jsx-native-result/1');assert(revision(r.sourceRevision)&&revision(s.preparedAtRevision));assert.equal(r.preparedAtRevision,s.preparedAtRevision);assert.equal(r.sourceDirty,false);assert.equal(r.inputsUnchanged,true);assert.deepEqual(r.errors,[]);
  for(const k of ['browserStarted','appExecuted','ReactDOMExecuted','originalMainExecuted'])assert.equal(r[k],true);
  for(const k of ['withExtension','withHelper','withIDE','productSupport','installedRuntimeProven','JSXProductSupported','fullA02'])assert.equal(r[k],false);
  for(const k of ['modelCalls','nativeWriterCalls'])assert.equal(r[k],0);
  for(const[k,n]of [['browserLaunchesStarted',1],['browserLaunchesCompleted',1],['modesStarted',3],['modesCompleted',3],['phasesStarted',18],['phasesCompleted',18]])assert.equal(r[k],n);
  assert.deepEqual(s.protocol,callbackJSXNativeProtocol());assert.equal(r.startupQualification.status,'QUALIFIED_PUBLIC_STARTUP_AND_OWNER_PROCESS_FACTS_ONLY');assert.deepEqual(r.startupQualification.failures,[]);assert.equal(r.startupQualification.effectiveMode,unknown);assert.equal(r.startupQualification.procArgumentObservation,unknown);
  assert.deepEqual(r.networkDenied,[]);assert(Array.isArray(r.traffic)&&r.traffic.length>0);for(const t of r.traffic){assert.equal(t.method,'GET');assert.equal(t.ownedOrigin,true);}
  assert.deepEqual(r.runs.map(x=>x.mode),s.protocol.modes);const pages=new Set(),documents={targetId:new Set(),frameId:new Set(),loaderId:new Set(),browserContextId:new Set()};
  for(const run of r.runs){
   assert.equal(run.pageId,s.pagePrefix+':'+run.mode);pages.add(run.pageId);assert.deepEqual(run.initialDom,{texts:[],checked:[]});assert.deepEqual(run.setup.dom,s.protocol.setup);assert.equal(run.setup.sourceWindowNotAccepted,true);
   if(run.mode!=='original'){assert.equal(run.setup.observation.retention.frames,0);assert.equal(run.setup.observation.retention.collecting,false);assert.equal(run.setup.observation.retention.configInput.configs,0);}
   assert.deepEqual(run.console,[]);assert.deepEqual(run.pageErrors,[]);for(const k of ['pageSession','page','context'])assert.equal(run.cleanup[k],true);
   const doc=run.document;assert.equal(doc.mainOnly,true);for(const k of Object.keys(documents)){assert.equal(typeof doc[k],'string');assert(doc[k].length>0&&doc[k].length<=512);documents[k].add(doc[k]);}
   const witness=run.sourceWitness;assert.equal(witness.schema,'stateatom.callback-jsx-loaded-source/1');assert.equal(witness.status,'EXACT_LOADED_MAIN_BUNDLE_AND_BOOTSTRAP');for(const k of ['frameId','targetId','browserContextId'])assert.equal(witness[k],doc[k]);assert(Number.isSafeInteger(witness.executionContextId)&&witness.executionContextId>0);
   const bundleName=run.mode==='original'?'original.js':'observed.js',bundle=witness.bundle;assert.equal(bundle.sha256,s.bundles[bundleName].sha256);assert.equal(bundle.url,r.origin+'/'+bundleName);assert.equal(bundle.executionContextId,witness.executionContextId);assert(typeof bundle.scriptId==='string'&&bundle.scriptId.length>0);
   if(run.mode==='original')assert.equal(witness.bootstrap,null);else{assert.equal(witness.bootstrap.sha256,s.bootstrapDigests[run.mode]);assert.equal(witness.bootstrap.url,'stateatom-owned://a0216/'+run.mode+'/bootstrap.js');assert.equal(witness.bootstrap.executionContextId,witness.executionContextId);assert(typeof witness.bootstrap.scriptId==='string'&&witness.bootstrap.scriptId.length>0&&witness.bootstrap.scriptId!==bundle.scriptId);}
   assert.deepEqual(run.phases.map(x=>x.id),s.protocol.phases.map(x=>x.id));
   for(let i=0;i<s.protocol.phases.length;i++){
    const p=s.protocol.phases[i],v=run.phases[i];assert.equal(v.completed,true);assert.deepEqual(v.document,doc);assert.deepEqual(v.dom,{texts:p.texts,checked:p.checked});
    if(run.mode==='on')guardCallbackJSXNativeWindow(v.capture,p,{...s.sitePolicy,page:run.pageId});
    else if(run.mode==='original')assert.equal(v.capture,null);
    else{scope(v.capture.snapshot,run.pageId);assert.equal(v.capture.snapshot.status,unknown);assert.equal(v.capture.snapshot.links.length,0);assert.equal(v.capture.retention.frames,0);assert.equal(v.capture.retention.configInput.configs,0);assert.equal(v.capture.retention.active,0);assert.equal(v.capture.retention.collecting,false);assert.equal(v.capture.retention.stopped,p.id==='stopped');}
   }
  }
  assert.equal(pages.size,3);for(const k of Object.keys(documents))assert.equal(documents[k].size,3);for(const k of ['browserSession','client','owner','httpServer','ownerProcessExited','managedProfileRemoved','pendingResources'])assert.equal(r.cleanup[k],true);assert.equal(r.cleanup.ownerKill,'not-needed');
 }catch(error){failures.push({code:'NATIVE_CASE_INCOMPLETE',message:error.message});}
 return{status:failures.length?'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02':'PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02',failures,installedRuntimeProven:false,fullA02:false};
}
