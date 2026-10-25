// SPDX-License-Identifier: Apache-2.0
// Synthetic facts/actual recorder API, never an actual browser attestation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {captureBrowserLaunchWitness} from '../../experiments/browser-launch-witness.mjs';
import {admitOwnedBrowserProcess} from '../../experiments/owned-browser-process.mjs';
import {createCallbackCopyObserver} from '../../experiments/react19-reducer/callback-copy-observer.mjs';
import {capturePublicCallbackJSXStartup,qualifyCallbackJSXStartup,callbackJSXNativeProtocol,guardCallbackJSXNativeWindow,classifyCallbackJSXNativeRun} from '../../experiments/react19-reducer/callback-jsx-native-qualification.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),copy=x=>JSON.parse(JSON.stringify(x));
const expected={executable:'/owned/chrome',sha256:'a'.repeat(64),profile:'/tmp/playwright_chromiumdev_profile-owned1',browserVersion:'153.0.8010.12'};
const args=[expected.executable,'--headless','--enable-automation','--user-data-dir='+expected.profile];
function startup(){
 const p={pid:222,startTime:'12345',startTimeStable:true,procExe:expected.executable,sha256:expected.sha256,errors:[],argumentCount:1,profileOptions:[],headless:false,forbiddenFlags:[]};
 return{owner:captureBrowserLaunchWitness({pid:222,spawnfile:expected.executable,spawnargs:args,exitCode:null,signalCode:null},{...expected,profileRoot:'/tmp',profilePrefix:'playwright_chromiumdev_profile-'}),proc:{schema:'stateatom.owned-browser-process-facts/1',driverPid:111,reportedBrowserPids:[222],reported:p,directChildren:[copy(p)],errors:[]},publicReport:capturePublicCallbackJSXStartup(args,expected),managedProfile:{realPath:expected.profile,isDirectory:true,isSymbolicLink:false,errors:[]},browserVersion:expected.browserVersion};
}
test('public startup fact is sanitized, frozen and explicitly separate from proc argv/effective mode',()=>{const r=capturePublicCallbackJSXStartup([...args,'--private-fixture=private-owned'],expected);assert.equal(r.status,'PUBLIC_STARTUP_REPORT_CAPTURED');assert.equal(r.argumentCount,5);assert.equal(r.profile,expected.profile);assert.equal(r.automation,true);assert.equal(r.headless,true);assert.equal(r.source,'Browser.getBrowserCommandLine');assert(Object.isFrozen(r));assert.doesNotMatch(JSON.stringify(r),/private-owned/);assert.equal(r.arguments,undefined);});
for(const[name,change]of [
 ['missing automation',a=>a.filter(x=>x!=='--enable-automation')],
 ['duplicate automation',a=>[...a,'--enable-automation']],
 ['automation false',a=>a.map(x=>x==='--enable-automation'?'--enable-automation=false':x)],
 ['missing headless',a=>a.filter(x=>x!=='--headless')],
 ['duplicate headless',a=>[...a,'--headless']],
 ['wrong exe',a=>['/foreign/chrome',...a.slice(1)]],
 ['wrong profile',a=>a.map(x=>x.startsWith('--user-data-dir=')?'--user-data-dir=/tmp/private-owned':x)],
 ['duplicate profile',a=>[...a,'--user-data-dir='+expected.profile]],
 ['separate profile',a=>a.flatMap(x=>x.startsWith('--user-data-dir=')?['--user-data-dir',expected.profile]:[x])],
 ['flattened text',a=>[a.join(' ')]],
 ['not array',()=>({})],
 ['scalar argument',a=>[...a,1]],
 ['unbounded args',()=>Array(257).fill('x')],
 ['unbounded bytes',a=>[...a,'x'.repeat(65537)]]
])test('public startup refuses '+name,()=>{const r=capturePublicCallbackJSXStartup(change(args),expected);assert.equal(r.status,'PUBLIC_STARTUP_REPORT_REFUSED');assert(r.errors.length>0);assert.doesNotMatch(JSON.stringify(r),/private-owned/);});
for(const flag of ['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors','--disable-web-security','--load-extension=/private-owned','--disable-extensions-except=/private-owned'])test('public startup refuses forbidden '+flag.split('=')[0],()=>{assert.equal(capturePublicCallbackJSXStartup([...args,flag],expected).status,'PUBLIC_STARTUP_REPORT_REFUSED');});
test('metadata numeric accessor is refused without being invoked',()=>{let reads=0;const a=[...args];Object.defineProperty(a,1,{get(){reads++;return '--headless';}});assert.equal(capturePublicCallbackJSXStartup(a,expected).status,'PUBLIC_STARTUP_REPORT_REFUSED');assert.equal(reads,0);});
test('public startup + owner/proc identity fact can qualify while legacy proc argv guard remains refused',()=>{const s=startup();assert.equal(admitOwnedBrowserProcess(s.proc,expected).status,'REFUSED_PROCESS_FACTS');const r=qualifyCallbackJSXStartup(s,expected);assert.equal(r.status,'QUALIFIED_PUBLIC_STARTUP_AND_OWNER_PROCESS_FACTS_ONLY');assert.deepEqual(r.failures,[]);assert.equal(r.effectiveMode,'Unknown/Unsupported');assert.equal(r.procArgumentObservation,'Unknown/Unsupported');assert.equal(r.appExecuted,false);assert.equal(r.fullA02,false);});
for(const[name,mutate]of [
 ['CDP PID',s=>s.proc.reportedBrowserPids=[333]],
 ['reported PID',s=>s.proc.reported.pid=333],
 ['child absent',s=>s.proc.directChildren=[]],
 ['duplicate child',s=>s.proc.directChildren.push(copy(s.proc.directChildren[0]))],
 ['child start',s=>s.proc.directChildren[0].startTime='999'],
 ['unstable start',s=>s.proc.reported.startTimeStable=false],
 ['binary hash',s=>s.proc.reported.sha256='b'.repeat(64)],
 ['wrong executable',s=>s.proc.reported.procExe='/foreign/chrome'],
 ['collection error',s=>s.proc.errors=[{code:'CDP_ERROR'}]],
 ['proc identity error',s=>s.proc.reported.errors=[{code:'PROC_EXE_ERROR'}]],
 ['invalid original witness',s=>s.owner.status='UNSUPPORTED_ORIGINAL_INVOCATION'],
 ['original profile digest',s=>s.owner.profileDigest='b'.repeat(64)],
 ['public profile digest',s=>s.publicReport.profileDigest='b'.repeat(64)],
 ['unqualified public report',s=>s.publicReport.status='PUBLIC_STARTUP_REPORT_REFUSED'],
 ['public automation missing',s=>s.publicReport.automation=false],
 ['wrong reported version',s=>s.browserVersion='other'],
 ['managed symlink',s=>s.managedProfile.isSymbolicLink=true],
 ['managed wrong path',s=>s.managedProfile.realPath='/tmp/foreign'],
 ['managed error',s=>s.managedProfile.errors=[{code:'READ_ERROR'}]]
])test('joined startup refuses '+name,()=>{const s=copy(startup());mutate(s);assert.equal(qualifyCallbackJSXStartup(s,expected).status,'REFUSED_PUBLIC_STARTUP_OR_OWNER_PROCESS_FACTS');});
const mapSite={id:'map-main-owned',file:'original-main.jsx',sourceDigest:'b'.repeat(64),kind:'map',line:1,column:1,endLine:1,endColumn:99},jsxSite={id:'jsx-main-owned',file:'compiled-main.js',sourceDigest:'c'.repeat(64),line:1,column:1,endLine:1,endColumn:55};
const sites={mapSite,jsxSites:[jsxSite],page:'owned-native-fixture:on'};
function capture(phase,{enabled=true,stopped=false,page=sites.page}={}){
 const o=createCallbackCopyObserver({page,inputProfile:'jsx-config',enabled});o.startWindow(phase.id);
 if(stopped){o.stop();return o.sealWindow();}
 const items=Array.from({length:phase.rowCount},()=>({})),token=o.arrayRuntime.begin(Array.prototype.map,items,mapSite);
 for(let i=0;i<items.length;i++){const f=o.enter(token,mapSite,items[i],i,items),cfg={},el={};if(enabled){o.tap('config-input',items[i],cfg,jsxSite);o.tap('jsx-element-return',el,cfg);}o.returned(f,el);o.exit(f);}
 o.arrayRuntime.finish(token,[]);return o.sealWindow();
}
test('native protocol has exact original/off/on and six fixed UI phases',()=>{const p=callbackJSXNativeProtocol();assert.deepEqual(p.modes,['original','off','on']);assert.deepEqual(p.phases.map(x=>x.id),['equal','same','changed','toggle','filtered','stopped']);assert.deepEqual(p.phases.map(x=>x.rowCount),[2,2,2,2,1,2]);assert.deepEqual(p.phases[4].texts,['SAME']);assert(Object.isFrozen(p.phases[0].texts));});
test('actual source recorder fixture supplies two distinct same-label item intervals, no storage or selectedDOM claim',()=>{const phase=callbackJSXNativeProtocol().phases[0],c=capture(phase);assert.doesNotThrow(()=>guardCallbackJSXNativeWindow(c,phase,sites));assert.notEqual(c.snapshot.links[0].itemId,c.snapshot.links[1].itemId);});
for(const[name,mutate]of [
 ['missing link',c=>c.snapshot.links.pop()],
 ['same item',c=>c.snapshot.links[1].itemId=c.snapshot.links[0].itemId],
 ['same frame',c=>c.snapshot.links[1].frameId=c.snapshot.links[0].frameId],
 ['same element',c=>c.snapshot.links[1].elementId=c.snapshot.links[0].elementId],
 ['foreign map site',c=>c.snapshot.links[0].site.id='other'],
 ['foreign config site',c=>c.snapshot.links[0].configInputOccurrence.site.id='other'],
 ['wrong callback input',c=>c.snapshot.links[0].configInputId='other'],
 ['native return pending',c=>c.snapshot.links[0].configInputOccurrence.status='pending'],
 ['unclosed callback',c=>c.snapshot.frames[0].closed=false],
 ['unreturned callback',c=>c.snapshot.frames[0].returned=false],
 ['different callback return',c=>c.snapshot.frames[0].returnedId='other'],
 ['extra frame',c=>c.snapshot.frames.push(copy(c.snapshot.frames[0]))],
 ['foreign page',c=>c.snapshot.page='foreign'],
 ['wrong window',c=>c.snapshot.window.label='other'],
 ['active frame',c=>c.retention.active=1],
 ['incomplete native input',c=>c.retention.configInput.pending=1],
 ['overflow',c=>c.retention.overflow=true],
 ['invalid metadata',c=>c.retention.configInput.invalid=true],
 ['unsealed',c=>c.snapshot.sealed=false],
 ['storage promoted',c=>c.snapshot.propStorage='Observed'],
 ['ownership promoted',c=>c.snapshot.fieldOwnership='Observed'],
 ['native attestation invented',c=>c.snapshot.nativeOrigin='Attested'],
 ['full path promoted',c=>c.snapshot.fullPath=true]
])test('native window refuses '+name,()=>{const phase=callbackJSXNativeProtocol().phases[0],c=copy(capture(phase));mutate(c);assert.throws(()=>guardCallbackJSXNativeWindow(c,phase,sites));});
test('Stop must clear permanently and is not an observed zero-row positive',()=>{const phase=callbackJSXNativeProtocol().phases[5];assert.doesNotThrow(()=>guardCallbackJSXNativeWindow(capture(phase,{stopped:true}),phase,sites));assert.throws(()=>guardCallbackJSXNativeWindow(capture(phase),phase,sites));});
const document={targetId:'target-1',frameId:'frame-1',loaderId:'loader-1',mainOnly:true};
function wholeRun(){
 const protocol=callbackJSXNativeProtocol(),s={protocol,sitePolicy:sites,pagePrefix:'owned-native-fixture',bundles:{'original.js':{sha256:'e'.repeat(64)},'observed.js':{sha256:'f'.repeat(64)}},bootstrapDigests:{off:'d'.repeat(64),on:'c'.repeat(64)},preparedAtRevision:'a'.repeat(40)};
 const r={schema:'stateatom.callback-jsx-native-result/1',sourceRevision:'b'.repeat(40),preparedAtRevision:s.preparedAtRevision,sourceDirty:false,inputsUnchanged:true,origin:'http://127.0.0.1:12345',browserStarted:true,appExecuted:true,ReactDOMExecuted:true,originalMainExecuted:true,errors:[],browserLaunchesStarted:1,browserLaunchesCompleted:1,modesStarted:3,modesCompleted:3,phasesStarted:18,phasesCompleted:18,startupQualification:qualifyCallbackJSXStartup(startup(),expected),networkDenied:[],traffic:[{method:'GET',ownedOrigin:true}],withExtension:false,withHelper:false,withIDE:false,productSupport:false,modelCalls:0,nativeWriterCalls:0,installedRuntimeProven:false,JSXProductSupported:false,fullA02:false,runs:[],cleanup:{browserSession:true,client:true,owner:true,httpServer:true,ownerKill:'not-needed',ownerProcessExited:true,managedProfileRemoved:true,pendingResources:true}};
 for(const mode of protocol.modes){const pageId='owned-native-fixture:'+mode,run={mode,pageId,initialDom:{texts:[],checked:[]},setup:{dom:protocol.setup,sourceWindowNotAccepted:true,observation:mode==='original'?null:capture({id:'initial',rowCount:0},{page:pageId,enabled:false})},document:{...document,targetId:'target-'+mode,frameId:'frame-'+mode,loaderId:'loader-'+mode,browserContextId:'context-'+mode},console:[],pageErrors:[],cleanup:{pageSession:true,page:true,context:true},phases:[]};run.sourceWitness={schema:'stateatom.callback-jsx-loaded-source/1',status:'EXACT_LOADED_MAIN_BUNDLE_AND_BOOTSTRAP',frameId:run.document.frameId,targetId:run.document.targetId,browserContextId:run.document.browserContextId,executionContextId:1,bundle:{scriptId:'bundle',executionContextId:1,sha256:s.bundles[mode==='original'?'original.js':'observed.js'].sha256,url:r.origin+'/'+(mode==='original'?'original.js':'observed.js')},bootstrap:mode==='original'?null:{scriptId:'bootstrap',executionContextId:1,sha256:s.bootstrapDigests[mode],url:'stateatom-owned://a0216/'+mode+'/bootstrap.js'}};for(const phase of protocol.phases)run.phases.push({id:phase.id,dom:{texts:phase.texts,checked:phase.checked},document:copy(run.document),capture:mode==='original'?null:capture(phase,{page:pageId,enabled:mode==='on',stopped:phase.id==='stopped'}),completed:true});r.runs.push(run);}
 return{r,s};
}
test('whole native saved-fact classifier is scoped, not a live attestation',()=>{const{r,s}=wholeRun(),q=classifyCallbackJSXNativeRun(r,s);assert.equal(q.status,'PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02',JSON.stringify(q.failures));assert.equal(q.fullA02,false);assert.equal(q.installedRuntimeProven,false);});
for(const[name,mutate]of [
 ['start omitted',r=>r.browserLaunchesStarted=0],
 ['automatic retry',r=>r.browserLaunchesStarted=2],
 ['mode incomplete',r=>r.modesCompleted=2],
 ['phase incomplete',r=>r.phasesCompleted=17],
 ['boolean completion',r=>r.phasesCompleted=true],
 ['partial phase missing',r=>r.runs[2].phases.pop()],
 ['lost source hashes',r=>r.inputsUnchanged=false],
 ['dirty source',r=>r.sourceDirty=true],
 ['foreign frame',r=>r.runs[2].phases[1].document.frameId='foreign'],
 ['late loader',r=>r.runs[2].phases[1].document.loaderId='foreign'],
 ['extra frame',r=>r.runs[2].phases[1].document.mainOnly=false],
 ['wrong DOM',r=>r.runs[2].phases[0].dom.texts=['WRONG']],
 ['console warning',r=>r.runs[2].console.push({type:'warning'})],
 ['page error',r=>r.runs[0].pageErrors.push({message:'error'})],
 ['external network',r=>r.networkDenied.push({originDigest:'private'})],
 ['mutation request',r=>r.traffic.push({method:'POST',ownedOrigin:true})],
 ['foreign response',r=>r.traffic.push({method:'GET',ownedOrigin:false})],
 ['stale startup',r=>r.startupQualification.status='REFUSED_PUBLIC_STARTUP_OR_OWNER_PROCESS_FACTS'],
 ['missing page cleanup',r=>r.runs[1].cleanup.page=false],
 ['unknown PID exit',r=>r.cleanup.ownerProcessExited='Unknown'],
 ['profile retained',r=>r.cleanup.managedProfileRemoved=false],
 ['owner kill fallback',r=>r.cleanup.ownerKill=true],
 ['source error retained',r=>r.errors.push({code:'CDP_TIMEOUT'})],
 ['installed upgraded',r=>r.installedRuntimeProven=true],
 ['full A02 upgraded',r=>r.fullA02=true]
])test('whole native result stays Incomplete for '+name,()=>{const{r,s}=wholeRun();mutate(r);assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');});

test('startup requires the actual source collector driver PID to be a distinct positive process',()=>{const s=copy(startup());s.proc.driverPid=s.owner.pid;assert.equal(qualifyCallbackJSXStartup(s,expected).status,'REFUSED_PUBLIC_STARTUP_OR_OWNER_PROCESS_FACTS');});
test('window ID cannot contradict the collector window generation',()=>{const phase=callbackJSXNativeProtocol().phases[0],c=copy(capture(phase));c.snapshot.window.id='other';assert.throws(()=>guardCallbackJSXNativeWindow(c,phase,sites));});
test('empty native input identity cannot qualify',()=>{const phase=callbackJSXNativeProtocol().phases[0],c=copy(capture(phase));c.snapshot.links[0].configInputOccurrence.inputId='';assert.throws(()=>guardCallbackJSXNativeWindow(c,phase,sites));});
test('empty document IDs are not a known original document',()=>{const{r,s}=wholeRun();r.runs[0].document.targetId='';for(const p of r.runs[0].phases)p.document.targetId='';assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');});
test('three mode labels cannot recycle one browser document and context',()=>{const{r,s}=wholeRun();for(const run of r.runs){run.document=copy(r.runs[0].document);for(const p of run.phases)p.document=copy(run.document);}assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');});

for(const[name,mutate]of [
 ['loaded source missing',r=>delete r.runs[2].sourceWitness],
 ['loaded source hash',r=>r.runs[2].sourceWitness.bundle.sha256='0'.repeat(64)],
 ['bootstrap hash',r=>r.runs[2].sourceWitness.bootstrap.sha256='0'.repeat(64)],
 ['different loaded context',r=>r.runs[2].sourceWitness.bootstrap.executionContextId=999],
 ['source wrong frame',r=>r.runs[2].sourceWitness.frameId='foreign']
])test('whole native fact requires '+name,()=>{const{r,s}=wholeRun();mutate(r);assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');});

test('unknown pending resource cleanup cannot complete a native result',()=>{const{r,s}=wholeRun();r.cleanup.pendingResources='Unknown';assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');});

// Final review I2: uniqueness and scope inside the independent native ID family.
for(const key of ['inputId','configId','valueId','elementId'])test('I2 distinct outer rows cannot reuse native '+key,()=>{const phase=callbackJSXNativeProtocol().phases[0],c=copy(capture(phase));c.snapshot.links[1].configInputOccurrence[key]=c.snapshot.links[0].configInputOccurrence[key];assert.throws(()=>guardCallbackJSXNativeWindow(c,phase,sites));});
test('I2 copied whole native occurrence cannot qualify two outer rows',()=>{const phase=callbackJSXNativeProtocol().phases[0],c=copy(capture(phase));c.snapshot.links[1].configInputOccurrence=copy(c.snapshot.links[0].configInputOccurrence);assert.throws(()=>guardCallbackJSXNativeWindow(c,phase,sites));});
for(const kind of ['page','window'])test('I2 native occurrence from foreign '+kind+' refuses despite matching outer frame',()=>{const phase=callbackJSXNativeProtocol().phases[0],c=copy(capture(phase)),n=c.snapshot.links[0].configInputOccurrence;for(const key of ['inputId','configId','valueId','elementId'])n[key]=kind==='page'?n[key].replace(sites.page,'foreign-page'):n[key].replace(':jsx-config:1:',':jsx-config:2:');assert.throws(()=>guardCallbackJSXNativeWindow(c,phase,sites));});
test('I2 native retention window must be current collector generation',()=>{const phase=callbackJSXNativeProtocol().phases[0],c=copy(capture(phase));c.retention.configInput.window++;assert.throws(()=>guardCallbackJSXNativeWindow(c,phase,sites));});


// A02.17: a successful saved v2 result must retain the independent original receipt.
function explicitWholeRun(){const{r,s}=wholeRun();s.schema='stateatom.callback-jsx-native-case/2';r.startup=startup();const owner=r.startup.owner;r.startup.requestedAutomation={schema:'stateatom.callback-jsx-requested-automation/1',source:'BrowserServer.process().spawnargs',status:'REQUIRED_AUTOMATION_ARGUMENT_OBSERVED',pid:owner.pid,argumentCount:owner.argumentCount,vectorDigest:owner.vectorDigest,automationOptionCount:1,automationExact:true,errors:[]};return{r,s};}
test('v2 original delivery receipt is distinct from public startup report and permits scoped saved structure',()=>{const{r,s}=explicitWholeRun();assert.equal(classifyCallbackJSXNativeRun(r,s).status,'PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');});
for(const[name,mutate]of [
 ['missing',r=>delete r.startup.requestedAutomation],
 ['wrong source',r=>r.startup.requestedAutomation.source='Browser.getBrowserCommandLine'],
 ['wrong PID',r=>r.startup.requestedAutomation.pid=333],
 ['wrong digest',r=>r.startup.requestedAutomation.vectorDigest='0'.repeat(64)],
 ['wrong count',r=>r.startup.requestedAutomation.argumentCount++],
 ['duplicate switch',r=>r.startup.requestedAutomation.automationOptionCount=2],
 ['not exact',r=>r.startup.requestedAutomation.automationExact=false],
 ['refused',r=>r.startup.requestedAutomation.status='REQUIRED_AUTOMATION_ARGUMENT_REFUSED'],
 ['errors',r=>r.startup.requestedAutomation.errors=['UNKNOWN']]
])test('v2 saved result refuses original delivery '+name,()=>{const{r,s}=explicitWholeRun();mutate(r);assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');});
for(const kind of ['PID','digest','count'])test('v2 matching malformed original and receipt '+kind+' cannot qualify',()=>{const{r,s}=copy(explicitWholeRun()),owner=r.startup.owner,receipt=r.startup.requestedAutomation;if(kind==='PID')owner.pid=receipt.pid=true;else if(kind==='digest')owner.vectorDigest=receipt.vectorDigest='invalid';else owner.argumentCount=receipt.argumentCount=true;assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');});

// A02.18 saved URL facts are explicit CDP fields, never reconstructed from a digest.
function fragmentWholeRun(){
 const {r,s}=copy(explicitWholeRun());s.schema='stateatom.callback-jsx-native-case/3';
 for(const run of r.runs){
  const base=r.origin+'/?mode='+run.mode;
  for(let i=0;i<run.phases.length;i++)run.phases[i].url=base+(i>=4?'#/active':'');
  run.documentURLReadings=Array.from({length:8},(_,i)=>i<6?{frameURL:base,urlFragmentPresent:false,targetURL:base,pageURL:base}:{frameURL:base,urlFragmentPresent:true,urlFragment:'#/active',targetURL:base+'#/active',pageURL:base+'#/active'});
 }
 return {r,s};
}
test('schema3 explicit separate URL facts qualify the scoped saved structure',()=>{
 const {r,s}=fragmentWholeRun();assert.equal(classifyCallbackJSXNativeRun(r,s).status,'PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
});
for(const [label,mutate]of [
 ['no readings',run=>delete run.documentURLReadings],
 ['missing reading',run=>run.documentURLReadings.pop()],
 ['extra reading',run=>run.documentURLReadings.push({...run.documentURLReadings[0]})],
 ['foreign base',run=>run.documentURLReadings[0].frameURL='http://foreign/'],
 ['embedded fragment',run=>run.documentURLReadings[6].frameURL+='#/active'],
 ['missing fragment',run=>delete run.documentURLReadings[6].urlFragment],
 ['false fragment presence',run=>run.documentURLReadings[6].urlFragmentPresent=false],
 ['null fragment',run=>run.documentURLReadings[6].urlFragment=null],
 ['wrong fragment',run=>run.documentURLReadings[6].urlFragment='#/completed'],
 ['early fragment',run=>Object.assign(run.documentURLReadings[0],{urlFragmentPresent:true,urlFragment:'#/active'})],
 ['target mismatch',run=>run.documentURLReadings[6].targetURL=run.documentURLReadings[6].frameURL],
 ['page mismatch',run=>run.documentURLReadings[6].pageURL=run.documentURLReadings[6].frameURL],
 ['reordered reading',run=>[run.documentURLReadings[0],run.documentURLReadings[6]]=[run.documentURLReadings[6],run.documentURLReadings[0]]],
 ['unmarked optional value',run=>run.documentURLReadings[0].urlFragment=''],
 ['nonboolean presence',run=>run.documentURLReadings[0].urlFragmentPresent=0],
]){
 test('schema3 saved URL evidence refuses '+label,()=>{
  const{r,s}=fragmentWholeRun();mutate(r.runs[0]);assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
 });
}
test('schema3 accepts explicit empty optional fragments in unfiltered readings',()=>{
 const{r,s}=fragmentWholeRun();for(const run of r.runs)for(const row of run.documentURLReadings.slice(0,6))Object.assign(row,{urlFragmentPresent:true,urlFragment:''});
 assert.equal(classifyCallbackJSXNativeRun(r,s).status,'PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
});
test('schema3 cannot drop the independent original requested-argument receipt',()=>{
 const{r,s}=fragmentWholeRun();delete r.startup.requestedAutomation;assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
});

for(const mode of ['original','off','on'])for(const kind of ['missing','foreign','contradictory-filter','contradictory-stopped']){
 test('review18 I2 schema3 refuses '+mode+' phase URL '+kind,()=>{
  const{r,s}=fragmentWholeRun(),run=r.runs.find(x=>x.mode===mode);
  if(kind==='missing')delete run.phases[0].url;
  else if(kind==='foreign')run.phases[0].url='http://foreign/';
  else run.phases[kind==='contradictory-filter'?4:5].url=r.origin+'/?mode='+mode+'#/completed';
  assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
 });
}

// A02.19 saved schema4 never bypasses the corrected schema3 acceptance.
function literalWholeRun(){const c=fragmentWholeRun();c.s.schema='stateatom.callback-jsx-native-case/4';return c;}
test('schema4 complete synthetic saved shape retains all scoped controls without native proof',()=>{
 const{r,s}=literalWholeRun();assert.equal(classifyCallbackJSXNativeRun(r,s).status,'PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
});
for(const[label,change]of [
 ['missing original receipt',r=>delete r.startup.requestedAutomation],
 ['missing URL facts',r=>delete r.runs[0].documentURLReadings],
 ['contradictory phase URL',r=>r.runs[2].phases[4].url=r.origin+'/?mode=on#/completed']
])test('schema4 refuses '+label,()=>{
 const{r,s}=literalWholeRun();change(r);assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
});

function pageEnabledWholeRun(){const c=fragmentWholeRun();c.s.schema='stateatom.callback-jsx-native-case/5';return c;}
test('schema5 complete synthetic saved structure retains inherited bounded scope',()=>{
 const{r,s}=pageEnabledWholeRun();assert.equal(classifyCallbackJSXNativeRun(r,s).status,'PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
});
for(const[label,change]of [
 ['missing original receipt',r=>delete r.startup.requestedAutomation],
 ['missing URL facts',r=>delete r.runs[1].documentURLReadings],
 ['contradictory phase URL',r=>r.runs[2].phases[4].url=r.origin+'/?mode=on#/completed']
])test('schema5 refuses '+label,()=>{
 const{r,s}=pageEnabledWholeRun();change(r);assert.equal(classifyCallbackJSXNativeRun(r,s).status,'INCOMPLETE_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02');
});
