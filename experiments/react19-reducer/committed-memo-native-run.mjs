// SPDX-License-Identifier: Apache-2.0
// One exact private native-state/source-element association overlay; historical cases unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {build,transform} from 'esbuild';
import {chromium} from 'playwright';
import {appMainPropsFactory} from '../../tests/helpers/react19-app-main-props-controls.mjs';
import {createAppElementRetainingObserver} from './app-element-retaining-observer.mjs';
import {createNativeStateSourcePathObserver} from './native-state-source-path-observer.mjs';
import {createNativeStateReturnObserver} from './native-state-return-observer.mjs';
import {prepareNativeStateApp} from './native-state-return-transform.mjs';
import {transformPinnedNativeStateReturn} from './native-state-return-transform.mjs';
import {instrumentMainInputBridge as instrumentCallbackCopyIntervals} from './main-input-transform.mjs';
import {instrumentJSXConfigInputs} from './jsx-config-transform.mjs';
import {jsxConfigProfile,transformPinnedJSXConfig} from './jsx-config-vendor.mjs';
import {captureBrowserLaunchWitness} from '../browser-launch-witness.mjs';
import {readManagedLaunchProfile,closeLaunchWitnessHandles} from '../browser-launch-witness-run.mjs';
import {collectOwnedBrowserProcess,ownedProcessDeadline} from '../owned-browser-process.mjs';
import {capturePublicCallbackJSXStartup,qualifyCallbackJSXStartup,callbackJSXNativeProtocol} from './callback-jsx-native-qualification.mjs';
import {guardNativeStateSourceWindow as guardCallbackJSXNativeWindow,guardNativeStateSourceOffWindow as guardMainInputNativeOffWindow,classifyNativeStateSourceRun as classifyCallbackJSXNativeRun,retainedAppResearchPolicy,assertRetainedAppResearchPolicy,committedMemoCasePolicy,classifyCommittedMemoRun} from './committed-memo-native-qualification.mjs';
import {buildCommittedMemoOverlay} from './committed-memo-overlay.mjs';
import {committedMemoFactory,committedMemoBootstrap} from './committed-memo-bootstrap.mjs';
const root=process.cwd(),upstream=path.resolve('.runtime/todomvc'),app=upstream+'/examples/react',mainFile=app+'/src/todo/components/main.jsx',appFile=app+'/src/todo/app.jsx';
const profiles=[{schema:'stateatom.retained-app-state-source-case/1',casePath:path.resolve('docs/testing/committed-memo-native-case.json'),outputPrefix:path.resolve('.artifacts/a02/committed-memo-native')+path.sep,registrationFile:path.resolve('.artifacts/a02/committed-memo-native-source/2026-10-26/registration.json'),registrationSchema:'stateatom.committed-memo-native-registration/1',sourceCount:169,deltas:[],args:['--enable-automation'],pagePrefix:'a0245'}];
function caseProfile(schema){const p=profiles.find(p=>p.schema===schema);assert(p,'Unknown closed case schema');return p;}
const hex=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s),hash=s=>createHash('sha256').update(s).digest('hex'),json=async p=>JSON.parse(await fs.readFile(p,'utf8')),git=args=>execFileSync('git',args,{encoding:'utf8',timeout:5000}).trim();
const pins={'react/cjs/react.development.js':'4325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72','react/cjs/react-jsx-runtime.development.js':'dd50fd0db2fba44e0eee66243a45c81cfa3774cf41e4e6c0c080a601815c694d','react-dom/cjs/react-dom-client.development.js':'806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08'};
const fault=code=>Object.assign(Error(code),{code});
function safeError(error,stage){
 const allowed=new Set(['CONTROL_FAIL','STAGE_TIMEOUT','METADATA_TIMEOUT','HANDLE_TIMEOUT','CLEANUP_TIMEOUT','SOURCE_MISMATCH','STARTUP_REFUSED','SOURCE_CONTROL_ONLY','CASE_INCOMPLETE','NATIVE_INPUTS_REFUSED','ENOENT','EEXIST','ECONNRESET','ECONNREFUSED']);let code='STAGE_FAILED',message=null;
 try{const d=Object.getOwnPropertyDescriptor(error,'code');if(d&&Object.hasOwn(d,'value')){if(allowed.has(d.value))code=d.value;else if(d.value==='ERR_ASSERTION')code='ASSERTION_FAILED';}const m=Object.getOwnPropertyDescriptor(error,'message');if(m&&Object.hasOwn(m,'value')&&typeof m.value==='string'&&Buffer.byteLength(m.value)<=65536)message=m.value;}catch{}
 const diagnostics=[];if(message)for(const[pattern,label]of [[/Failed to move to .*namespace|Failed to move to a new namespace/i,'NAMESPACE_UNAVAILABLE'],[/Operation not permitted/i,'OPERATION_NOT_PERMITTED'],[/No usable sandbox/i,'SANDBOX_UNAVAILABLE'],[/Target page, context or browser has been closed/i,'TARGET_CLOSED'],[/Timeout.*exceeded/i,'OPERATION_TIMEOUT'],[/getBrowserCommandLine.*enable-automation/i,'AUTOMATION_API_UNAVAILABLE']])if(pattern.test(message))diagnostics.push(label);
 return{stage,code,diagnostics,messageDigest:message===null?null:hash(message)};
}
export function parseCallbackJSXNativeArgs(a){if(a.length===1&&a[0]&&!a[0].startsWith('--'))return{mode:'run',caseFile:a[0]};if(a.length===2&&a[0]==='--preflight'&&a[1]&&!a[1].startsWith('--'))return{mode:'preflight',caseFile:a[1]};if(a.length===3&&a[0]==='--prepare'&&a[1]&&a[2]&&!a[1].startsWith('--')&&!a[2].startsWith('--'))return{mode:'prepare',caseFile:a[1],out:a[2]};throw fault('CASE_INCOMPLETE');}
export function callbackJSXNativeLaunchOptions(s){
 const profile=caseProfile(s.schema);assert.deepEqual(s.browser.args,profile.args);assert.equal(s.browser.chromiumSandbox,true);assert.equal(s.browser.headless,true);assert.equal(s.browser.timeout,20000);assert(path.isAbsolute(s.browser.executable));
 return{executablePath:s.browser.executable,headless:true,chromiumSandbox:true,args:[...profile.args],timeout:20000,host:'127.0.0.1',port:0};
}
export function captureCallbackJSXAutomationRequest(child,owner){
 const r={schema:'stateatom.callback-jsx-requested-automation/1',source:'BrowserServer.process().spawnargs',status:'REQUIRED_AUTOMATION_ARGUMENT_REFUSED',pid:null,argumentCount:0,vectorDigest:null,automationOptionCount:0,automationExact:false,errors:[]};
 const fail=code=>{if(!r.errors.includes(code))r.errors.push(code);},own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,'value'))throw fault('CASE_INCOMPLETE');return d.value;};
 try{
  if(owner?.schema!=='stateatom.browser-launch-witness/1'||owner.status!=='CAPTURED_ORIGINAL_INVOCATION'||owner.errors?.length!==0)fail('OWNER_UNQUALIFIED');
  const pid=own(child,'pid'),input=own(child,'spawnargs');if(Number.isSafeInteger(pid)&&pid>0&&pid===owner?.pid)r.pid=pid;else fail('OWNER_PID_MISMATCH');
  if(!Array.isArray(input)||input.length<2||input.length>256)throw fault('CASE_INCOMPLETE');const args=[];let bytes=0;
  for(let i=0;i<input.length;i++){const value=own(input,String(i));if(typeof value!=='string'||value.includes('\0'))throw fault('CASE_INCOMPLETE');bytes+=Buffer.byteLength(value)+1;if(bytes>65536)throw fault('CASE_INCOMPLETE');args.push(value);}
  r.argumentCount=args.length;r.vectorDigest=hash(JSON.stringify(args));if(r.argumentCount!==owner?.argumentCount||r.vectorDigest!==owner?.vectorDigest)fail('OWNER_VECTOR_MISMATCH');
  const switches=args.filter(a=>a==='--enable-automation'||a.startsWith('--enable-automation='));r.automationOptionCount=switches.length;r.automationExact=switches.length===1&&switches[0]==='--enable-automation';if(!r.automationExact)fail('REQUIRED_AUTOMATION_ARGUMENT_MISSING_OR_AMBIGUOUS');
 }catch{fail('ORIGINAL_ARGUMENT_METADATA_UNSUPPORTED');}
 return Object.freeze({...r,status:r.errors.length?'REQUIRED_AUTOMATION_ARGUMENT_REFUSED':'REQUIRED_AUTOMATION_ARGUMENT_OBSERVED',errors:Object.freeze(r.errors)});
}
export function callbackJSXNativeFactory(policy){return committedMemoFactory(policy);}
export function callbackJSXNativeBootstrap(factory,{page,mode,policy}){
 const complete={app:policy.app,main:{mainSite:policy.mainSite,filterSite:policy.filterSite,mapSite:policy.mapSite},configSite:policy.configSite,native:policy.native,elementFiber:policy.elementFiber,memoBranch:policy.memoBranch};
 assert.equal(factory,committedMemoFactory(complete));return committedMemoBootstrap({page,mode,policy:complete});
}
export async function buildCallbackJSXMainOverlay(){return buildCommittedMemoOverlay();}
// CDP Page.Frame.url excludes the fragment; urlFragment, when present, includes '#'.
export function qualifyCallbackJSXFrameURL(frame,targetURL,{origin,mode,pageURL}){
 assert(['original','off','on'].includes(mode));
 assert.equal(frame.url,origin+'/?mode='+mode);
 const fragment=frame.urlFragment===undefined?'':frame.urlFragment;
 assert(['','#/','#/active'].includes(fragment));
 const completeURL=frame.url+fragment;
 assert.equal(targetURL,completeURL);assert.equal(pageURL,completeURL);
 return completeURL;
}
export async function verifyCallbackJSXNativeInputs(expected){
 assert(expected&&typeof expected==='object'&&Object.keys(expected).length>0&&Object.keys(expected).length<=2048);const measuredHashes={},mismatches=[],readErrors=[];
 for(const file of Object.keys(expected)){
  const d=Object.getOwnPropertyDescriptor(expected,file);assert(d&&Object.hasOwn(d,'value')&&hex(d.value)&&path.isAbsolute(file),'Owned absolute input hash required');
  try{const st=await fs.lstat(file);if(!st.isFile())throw Object.assign(Error('Regular input required'),{code:'NONREGULAR'});const actual=hash(await fs.readFile(file));measuredHashes[file]=actual;if(actual!==d.value)mismatches.push({file,expectedSha256:d.value,actualSha256:actual});}
  catch(e){readErrors.push({file,code:typeof e.code==='string'?e.code:'INPUT_READ_ERROR'});}
 }
 if(mismatches.length||readErrors.length)throw Object.assign(Error('App frozen inputs drifted or could not be read'),{code:'NATIVE_INPUTS_REFUSED',measuredHashes,mismatches,readErrors});return measuredHashes;
}
export function guardCallbackJSXNativeCase(s){
 const profile=caseProfile(s.schema);assertRetainedAppResearchPolicy(s.researchRetention);assert.equal(s.maximumNativeRuns,1);assert(path.resolve(s.out).startsWith(profile.outputPrefix));assert.equal(path.dirname(s.out),profile.outputPrefix.slice(0,-1));assert.equal(s.preparedDirty,false);assert(/^[a-f0-9]{40}$/.test(s.preparedAtRevision));assert.equal(s.upstreamRevision,'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');assert.equal(Object.keys(s.originalManifest).length,28);
 assert.deepEqual(s.protocol,callbackJSXNativeProtocol());assert.deepEqual(s.profilePolicy,{root:'/tmp',prefix:'playwright_chromiumdev_profile-'});assert.deepEqual(s.transport,{host:'127.0.0.1',port:0});assert.equal(s.profile,undefined);
 for(const k of ['withExtension','withHelper','withIDE','productSupport','fullA02'])assert.equal(s[k],false);
 assert.equal(s.browser.headless,true);assert.equal(s.browser.chromiumSandbox,true);assert.equal(s.browser.timeout,20000);assert.deepEqual(s.browser.args,profile.args);assert.equal(s.browser.version,'153.0.8010.12');assert(path.isAbsolute(s.browser.executable));assert(/^[a-f0-9]{64}$/.test(s.browser.sha256));
 assert(path.isAbsolute(s.node.executable));assert(/^v24\./.test(s.node.version));assert(/^[a-f0-9]{64}$/.test(s.node.sha256));
 assert.equal(s.sourceCounts.priorResearch,profile.sourceCount);assert.equal(s.sourceCounts.productInputs,327);assert.equal(s.sourceCounts.originalCorpus,28);assert(/^[a-f0-9]{64}$/.test(s.sourceRegistrationSha256));
 assert.equal(s.main.originalDigest,'09164b4bb70f4162ca2d32e3961133653fd0f9934244ba21eb85477218008a28');assert.equal(s.main.intervalSites.length,1);assert.equal(s.main.configSites.length,2);assert.notEqual(s.main.configSites[0].id,s.main.configSites[1].id);assert.deepEqual(s.sitePolicy.mapSite,s.main.intervalSites[0]);assert.deepEqual(s.sitePolicy.jsxSites,s.main.configSites);assert.deepEqual(s.sitePolicy.mainSite,s.main.mainSite);assert.deepEqual(s.sitePolicy.filterSite,s.main.filterSite);assert.deepEqual(s.sitePolicy.mapSite,s.main.mapSite);assert.equal(s.main.mainSite.sourceDigest,s.main.originalDigest);assert.equal(s.main.mainSite.file,path.relative(root,mainFile));assert.deepEqual(s.main.filterSite,s.main.arraySites.find(v=>v.kind==='filter'));assert.equal(s.app.originalDigest,'9062e9b90d3ef5c292e84cc2e765797d1336373271d7c5f39944d704f98d661f');assert.equal(s.app.receipt.sourceDigest,s.app.originalDigest);assert.deepEqual(s.sitePolicy.app,s.app.app);assert.deepEqual(s.sitePolicy.configSite,s.app.configSite);assert.equal(s.app.receipt.observedESMDigest,s.app.observedESMDigest);assert.equal(s.inputHashes[s.out+'/app-config.js'],s.app.observedESMDigest);assert.deepEqual(s.appPathPolicy,{acceptedPhases:['equal','same','changed','toggle'],filtered:'audit-only-not-counted'});const policyCheck=createNativeStateSourcePathObserver({page:'native-return-case-policy',enabled:false,policy:{app:s.sitePolicy.app,main:s.sitePolicy,configSite:s.sitePolicy.configSite,native:s.sitePolicy.native}});policyCheck.stop();
 assert.equal(s.nativeReturn.nativeVersionAdmitted,true);assert.equal(s.nativeReturn.sourceDigest,pins['react-dom/cjs/react-dom-client.development.js']);assert.equal(s.nativeReturn.version,'19.2.5');assert.deepEqual(s.nativeReturn.counts,{returns:3,renders:2});assert.deepEqual(s.nativeReturn.policy,s.sitePolicy.native);assert.equal(s.inputHashes[s.out+'/transformed-native-state.cjs'],s.nativeReturn.outputDigest);
 assert.equal(s.nativeJSX.nativeVersionAdmitted,true);assert.equal(s.nativeJSX.sourceDigest,pins['react/cjs/react-jsx-runtime.development.js']);assert.equal(s.nativeJSX.version,'19.2.5');
 assert.equal(s.factory.file,s.out+'/observer-factory.js');assert(/^[a-f0-9]{64}$/.test(s.factory.sha256));assert.equal(s.inputHashes[s.factory.file],s.factory.sha256);
 assert.deepEqual(Object.keys(s.bundles).sort(),['observed.css','observed.js','original.css','original.js']);
 for(const[name,b]of Object.entries(s.bundles)){assert.equal(b.file,s.out+'/'+name);assert.equal(s.inputHashes[b.file],b.sha256);assert(/^[a-f0-9]{64}$/.test(b.sha256));assert(Number.isSafeInteger(b.bytes)&&b.bytes>0);}
 for(const mode of ['off','on']){assert(/^[a-f0-9]{64}$/.test(s.bootstrapDigests[mode]));assert.equal(s.inputHashes[s.out+'/'+mode+'-bootstrap.js'],s.bootstrapDigests[mode]);}
 assert.equal(s.inputHashes[s.browser.executable],s.browser.sha256);assert.equal(s.inputHashes[s.node.executable],s.node.sha256);assert.equal(s.inputHashes[profile.registrationFile],s.sourceRegistrationSha256);
 for(const[p,d]of Object.entries(pins))assert.equal(s.inputHashes[app+'/node_modules/'+p],d);
 assert.equal(s.inputHashes[s.out+'/main-config.js'],s.main.configDigest);assert.equal(s.inputHashes[s.out+'/transformed-jsx.cjs'],s.nativeJSX.outputDigest);
 assert.equal(s.main.arraySites.length,2);assert.equal(s.sitePolicy.mapSite.kind,'map');assert.equal(s.sitePolicy.mapSite.sourceDigest,s.main.originalDigest);
 for(const site of s.main.configSites)assert.equal(site.sourceDigest,s.main.loweredDigest);
 const seen=new Set();for(const loaded of s.loadedInputs){
  assert(['original','observed'].includes(loaded.mode)&&loaded.file.startsWith(app+'/'));const key=loaded.mode+':'+loaded.file;assert(!seen.has(key));seen.add(key);
  assert.equal(s.inputHashes[loaded.file],loaded.physicalSha256);assert(/^[a-f0-9]{64}$/.test(loaded.compilerInputSha256));assert.equal(typeof loaded.transformed,'boolean');
  if(loaded.transformed){assert.equal(loaded.mode,'observed');assert([appFile,mainFile,app+'/node_modules/react/cjs/react-jsx-runtime.development.js',app+'/node_modules/react-dom/cjs/react-dom-client.development.js'].includes(loaded.file));assert.equal(loaded.compilerInputSha256,loaded.file===appFile?s.app.observedESMDigest:loaded.file===mainFile?s.main.configDigest:loaded.file===app+'/node_modules/react/cjs/react-jsx-runtime.development.js'?s.nativeJSX.outputDigest:s.nativeMemo.outputDigest);}else assert.equal(loaded.compilerInputSha256,loaded.physicalSha256);
 }
 for(const mode of ['original','observed']){assert(seen.has(mode+':'+appFile));assert(seen.has(mode+':'+mainFile));assert(seen.has(mode+':'+app+'/node_modules/react/cjs/react-jsx-runtime.development.js'));assert(seen.has(mode+':'+app+'/node_modules/react-dom/cjs/react-dom-client.development.js'));}
 assert.equal(s.loadedInputs.filter(x=>x.mode==='observed'&&x.transformed).length,4);assert(typeof s.pagePrefix==='string'&&s.pagePrefix.length>0&&s.pagePrefix.length<110);
 assert.deepEqual(s.committedMemoCase,committedMemoCasePolicy());assert.deepEqual(s.nativeMemo.nativeReturnPolicy,s.sitePolicy.native);assert.deepEqual(s.nativeMemo.elementFiberPolicy,s.sitePolicy.elementFiber);assert.deepEqual(s.nativeMemo.policy,s.sitePolicy.memoBranch);assert.equal(s.nativeMemo.chainDigests.nativeReturnOutput,s.nativeReturn.outputDigest);assert.equal(s.nativeMemo.chainDigests.memoOutput,s.nativeMemo.outputDigest);assert.equal(s.inputHashes[s.out+'/memo-native-final.cjs'],s.nativeMemo.outputDigest);assert.equal(s.nativeMemo.retainedMemoItemQualified,false);
 const expectedFactory=committedMemoFactory(s.sitePolicy);assert.equal(hash(expectedFactory),s.factory.sha256);for(const mode of ['off','on'])assert.equal(hash(callbackJSXNativeBootstrap(expectedFactory,{page:s.pagePrefix+':'+mode,mode,policy:s.sitePolicy})),s.bootstrapDigests[mode]);
 return s;
}
export async function acquireCallbackJSXNativeHandle(handles,key,task,{timeoutMs=5000,closeMethod='close',isActive=()=>true,onPending=()=>{},onLate=()=>{}}={}){
 assert(['close','detach'].includes(closeMethod));let active=true;
 const pending=Promise.resolve().then(task).then(async handle=>{if(active&&isActive()){handles[key]=handle;return handle;}try{await ownedProcessDeadline(()=>handle[closeMethod](),5000,'CLEANUP_TIMEOUT');onLate(true);}catch{onLate(false);}return undefined;});
 onPending(pending);try{return await ownedProcessDeadline(()=>pending,timeoutMs,'HANDLE_TIMEOUT');}finally{active=false;}
}
export async function runCallbackJSXNativeStages(s,ops){
 const timeout=ops.sourceControl?ops.timeoutMs:5000;
 const r={schema:'stateatom.retained-app-state-source-result/1',committedMemoCase:s.committedMemoCase,committedMemoQualification:null,committedMemoStatus:'RUNNING',researchRetention:s.researchRetention,status:'RUNNING',execution:ops.sourceControl?'SOURCE_CONTROL_NOT_NATIVE_PROOF':'ACTUAL_OWNED_PUBLIC_DRIVER',actualBrowserStarted:false,sourceRevision:ops.sourceControl?'0'.repeat(40):git(['rev-parse','HEAD']),preparedAtRevision:s.preparedAtRevision,sourceDirty:false,inputsUnchanged:false,inputsBefore:null,inputsAfter:null,browserStarted:false,appExecuted:false,ReactDOMExecuted:false,originalMainExecuted:false,browserLaunchesStarted:0,browserLaunchesCompleted:0,modesStarted:0,modesCompleted:0,phasesStarted:0,phasesCompleted:0,startup:{owner:null,proc:null,publicReport:null,managedProfile:null,browserVersion:null},startupQualification:null,runs:[],traffic:[],networkDenied:[],errors:[],cleanup:{},withExtension:false,withHelper:false,withIDE:false,productSupport:false,modelCalls:0,nativeWriterCalls:0,installedRuntimeProven:false,JSXProductSupported:false,fullA02:false,inputVerificationErrors:{mismatches:[],readErrors:[]}};
 ops.bindResult?.(r);
 const bounded=async(fn,metadata=false)=>{const lease={active:true};try{return await ownedProcessDeadline(()=>fn(lease),ops.sourceControl?timeout:metadata?5000:30000,metadata?'METADATA_TIMEOUT':'STAGE_TIMEOUT');}finally{lease.active=false;}};
 const executionKeys=['appExecuted','ReactDOMExecuted','originalMainExecuted'],syncExecution=()=>{for(const key of executionKeys){const values=r.runs.map(run=>run.executionMilestones?.[key]);r[key]=values.some(v=>v===true)?true:values.some(v=>v!==false)?'Unknown/Unsupported':false;}};
 const save=async(name,value)=>ops.save(name,value),read=async(name,fn)=>{try{r.startup[name]=await bounded(fn,true);}catch(e){r.errors.push(safeError(e,'startup:'+name));}await save('startup-'+name,r.startup[name]);};
 try{
  r.currentStage='launch';r.browserLaunchesStarted++;if(!ops.sourceControl){r.browserStarted='Unknown/Unsupported';r.actualBrowserStarted='Unknown/Unsupported';}await bounded(lease=>ops.launch(lease));r.browserStarted=true;r.actualBrowserStarted=!ops.sourceControl;r.browserLaunchesCompleted++;
  await read('owner',lease=>ops.readOwner(lease));await save('owner-before-admission',r.startup.owner);
  if(r.startup.owner?.status!=='CAPTURED_ORIGINAL_INVOCATION')throw fault('STARTUP_REFUSED');
  if(s.schema==='stateatom.retained-app-state-source-case/1'){r.startup.requestedAutomation=null;await read('requestedAutomation',lease=>ops.readRequestedAutomation(r.startup.owner,lease));if(r.startup.requestedAutomation?.status!=='REQUIRED_AUTOMATION_ARGUMENT_OBSERVED')throw fault('STARTUP_REFUSED');}
  const policy={executable:s.browser.executable,sha256:s.browser.sha256,profile:r.startup.owner.profile,browserVersion:s.browser.version};
  await read('proc',lease=>ops.readProcess(lease));await read('publicReport',lease=>ops.readPublic(policy,lease));await read('managedProfile',lease=>ops.readManaged(lease));await read('browserVersion',lease=>ops.readVersion(lease));
  r.startupQualification=qualifyCallbackJSXStartup(r.startup,policy);await save('startup-qualification',r.startupQualification);
  if(r.startupQualification.status!=='QUALIFIED_PUBLIC_STARTUP_AND_OWNER_PROCESS_FACTS_ONLY'||r.errors.length)throw fault('STARTUP_REFUSED');
  const http=await bounded(lease=>ops.openHTTP(lease));r.origin=http.origin;
  for(const mode of s.protocol.modes){
   r.modesStarted++;const run={mode,pageId:s.pagePrefix+':'+mode,document:null,initialDom:null,setup:null,sourceWitness:null,executionMilestones:{appExecuted:'Unknown/Unsupported',ReactDOMExecuted:'Unknown/Unsupported',originalMainExecuted:'Unknown/Unsupported'},phases:[],console:[],pageErrors:[],cleanup:{}};r.runs.push(run);syncExecution();
   try{
    r.currentStage=mode+':open';await bounded(lease=>ops.openMode(run,lease));r.currentStage=mode+':setup';await bounded(lease=>ops.setupMode(run,lease));if(run.setup?.dom&&run.sourceWitness?.status==='EXACT_LOADED_MAIN_BUNDLE_AND_BOOTSTRAP')for(const key of executionKeys)run.executionMilestones[key]=true;syncExecution();await save(mode+'-setup',run);
    for(const phase of s.protocol.phases){
     r.phasesStarted++;const v={id:phase.id,completed:false,startedAt:new Date().toISOString()};run.phases.push(v);await save(mode+'-'+phase.id+'-started',v);
     r.currentStage=mode+':'+phase.id+':perform';await bounded(lease=>ops.performPhase(run,phase,lease));r.currentStage=mode+':'+phase.id+':capture';await bounded(lease=>ops.capturePhase(run,phase,v,lease));await save(mode+'-'+phase.id+'-observed',v);
     assert.deepEqual(v.document,run.document);assert.deepEqual(v.dom,{texts:phase.texts,checked:phase.checked});
     if(mode==='on')guardCallbackJSXNativeWindow(v.capture,phase,{...s.sitePolicy,page:run.pageId});
     else if(mode==='original')assert.equal(v.capture,null);
     else guardMainInputNativeOffWindow(v.capture,phase,{...s.sitePolicy,page:run.pageId});
     v.completed=true;v.finishedAt=new Date().toISOString();r.phasesCompleted++;await save(mode+'-'+phase.id,v);await save('running',r);
    }
    r.modesCompleted++;
   }finally{syncExecution();try{await bounded(lease=>ops.closeMode(run,lease));}catch(e){r.errors.push(safeError(e,'cleanup:'+mode));}await save(mode+'-closed',run);}
  }
 }catch(e){r.errors.push(safeError(e,r.currentStage??'run'));}
 finally{
  try{await bounded(lease=>ops.closeRoot(r,lease));}catch(e){r.errors.push(safeError(e,'cleanup:root'));}
  try{r.inputsUnchanged=await bounded(lease=>ops.verifyInputs(lease));assert.equal(r.inputsUnchanged,true);}catch(e){r.inputsUnchanged=false;if(e.measuredHashes)r.inputsAfter=e.measuredHashes;if(e.mismatches||e.readErrors)r.inputVerificationErrors={mismatches:e.mismatches||[],readErrors:e.readErrors||[]};r.errors.push(safeError(e,'inputs'));}
  r.qualification=classifyCallbackJSXNativeRun(r,s);r.status=r.qualification.status;r.committedMemoQualification=classifyCommittedMemoRun(r,s);r.committedMemoStatus=r.committedMemoQualification.status;
  if(ops.sourceControl){r.status=r.errors.length||r.qualification.failures.length?'SOURCE_CONTROL_INCOMPLETE_NOT_NATIVE_PROOF':'SOURCE_CONTROL_COMPLETED_NOT_NATIVE_PROOF';r.committedMemoStatus='SOURCE_CONTROL_NOT_NATIVE_PROOF';}
  r.finishedAt=new Date().toISOString();await save('results',r);
 }
 return r;
}

export async function readCallbackJSXLoadedSource(session,{document,contexts,scripts,origin,mode,bundleHash,bootstrapHash,lease}){
 activeLease(lease);
 const defaults=contexts.filter(c=>c.auxData?.frameId===document.frameId&&c.auxData?.isDefault===true&&c.origin===origin);assert.equal(defaults.length,1);const contextId=defaults[0].id;assert(Number.isSafeInteger(contextId)&&contextId>0);
 const read=async(url,expected)=>{activeLease(lease);const candidates=scripts.filter(s=>s.url===url&&s.executionContextId===contextId);assert.equal(candidates.length,1,'No unique exact current-context script');const parsed=candidates[0],actual=await ownedProcessDeadline(()=>session.send('Debugger.getScriptSource',{scriptId:parsed.scriptId}),5000,'METADATA_TIMEOUT');activeLease(lease);assert(typeof actual.scriptSource==='string'&&Buffer.byteLength(actual.scriptSource)<=8*1024*1024);assert.equal(hash(actual.scriptSource),expected,'Exact loaded source mismatch');return{scriptId:parsed.scriptId,executionContextId:contextId,url,sha256:expected};};
 const bundle=await read(origin+'/'+(mode==='original'?'original.js':'observed.js'),bundleHash),bootstrap=mode==='original'?null:await read('stateatom-owned://a0216/'+mode+'/bootstrap.js',bootstrapHash);
 return{schema:'stateatom.callback-jsx-loaded-source/1',status:'EXACT_LOADED_MAIN_BUNDLE_AND_BOOTSTRAP',frameId:document.frameId,targetId:document.targetId,browserContextId:document.browserContextId,executionContextId:contextId,bundle,bootstrap};
}
async function nodeIdentity(){return{executable:await fs.realpath(process.execPath),sha256:hash(await fs.readFile('/proc/self/exe')),version:process.version};}
async function hashes(files){const out={};for(const p of [...new Set(files)].sort())out[path.resolve(p)]=hash(await fs.readFile(p));return out;}
function localModules(){return Object.keys(createRequire(import.meta.url).cache).filter(p=>p.startsWith(root+'/node_modules/'));}
function ownCase(file){const p=profiles.find(p=>p.casePath===path.resolve(file));assert(p,'Unknown fixed case path');return p;}
async function protectedInputs(profile){
 const r=await json(profile.registrationFile);assert.equal(r.schema,profile.registrationSchema);assert.equal(r.base,'cb529a4599f383fd73abe6f3a8a95b4f80571432');assert.equal(r.sourceBase,r.base);assert.equal(Object.keys(r.sourceBefore).length,profile.sourceCount);assert.equal(Object.keys(r.productInputs).length,327);assert.deepEqual(r.declaredResearchDeltas,[]);assert.deepEqual(r.newFiles,['experiments/react19-reducer/committed-memo-native-run.mjs','experiments/react19-reducer/committed-memo-native-qualification.mjs','tests/engine/react19-committed-memo-native-driver.test.mjs','tests/engine/react19-committed-memo-native-qualification.test.mjs']);
 const inputs={...r.nativeInputs,...r.sourceBefore,...r.productInputs};assert(Object.keys(inputs).length<=2048);await verifyCallbackJSXNativeInputs(inputs);return inputs;
}
export async function prepareCallbackJSXNativeCase(file,out){
 const profile=ownCase(file);out=path.resolve(out);assert(out.startsWith(profile.outputPrefix));assert.equal(path.dirname(out),profile.outputPrefix.slice(0,-1));assert.equal(git(['status','--porcelain','--untracked-files=normal']),'','Commit driver source first');assert.equal(await fs.realpath(os.tmpdir()),'/tmp');await fs.lstat(file).then(()=>assert.fail('Case exists; preserve it'),e=>assert.equal(e.code,'ENOENT'));
 const inputs=await protectedInputs(profile),originalManifest=await json(upstream+'/SOURCE_SHA256.json'),upstreamRevision=(await fs.readFile(upstream+'/REVISION','utf8')).trim();assert.equal(Object.keys(originalManifest).length,28);assert.equal(upstreamRevision,'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');
 for(const[p,d]of Object.entries(originalManifest)){const f=path.resolve(upstream,p);assert(f.startsWith(upstream+'/'));assert.equal(hash(await fs.readFile(f)),d);inputs[f]=d;}
 const overlay=await buildCallbackJSXMainOverlay();Object.assign(inputs,overlay.physicalInputs);
 const node=await nodeIdentity(),executable=await fs.realpath(chromium.executablePath()),version=(await json(path.resolve('node_modules/playwright-core/browsers.json'))).browsers.find(x=>x.name==='chromium').browserVersion;
 const browser={executable,sha256:hash(await fs.readFile(executable)),version,headless:true,chromiumSandbox:true,args:[...profile.args],timeout:20000};assert.equal(version,'153.0.8010.12');
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.mkdir(out,{mode:0o700});assert.equal(await fs.realpath(out),out);
 const write=async(name,contents)=>{const p=out+'/'+name;await fs.writeFile(p,contents,{flag:'wx'});inputs[p]=hash(contents);return p;},bundles={};
 for(const[name,b]of Object.entries(overlay.bundles)){const f=await write(name,b.contents);bundles[name]={file:f,sha256:b.sha256,bytes:b.bytes};}
 for(const[name,contents]of Object.entries(overlay.appOutputs))await write(name,contents);
 for(const[name,contents]of Object.entries(overlay.mainOutputs))await write(name,contents);await write('transformed-jsx.cjs',overlay.nativeJSXCode);await write('transformed-native-state.cjs',overlay.nativeReturnCode);await write('memo-native-final.cjs',overlay.nativeMemoCode);
 for(const[name,meta]of Object.entries(overlay.metafiles))await write(name+'-metafile.json',JSON.stringify(meta,null,2)+'\n');
 const factoryFile=await write('observer-factory.js',overlay.factory),pagePrefix=profile.pagePrefix+'-'+path.basename(out),bootstrapDigests={};
 for(const mode of ['off','on']){const content=callbackJSXNativeBootstrap(overlay.factory,{page:pagePrefix+':'+mode,mode,policy:{...overlay.main,app:overlay.app.app,configSite:overlay.app.configSite,native:overlay.nativeReturn.policy,elementFiber:overlay.policy.elementFiber,memoBranch:overlay.policy.memoBranch}});await write(mode+'-bootstrap.js',content);bootstrapDigests[mode]=hash(content);}
 const ownFiles=[fileURLToPath(import.meta.url),'experiments/react19-reducer/committed-memo-native-qualification.mjs','tests/engine/react19-committed-memo-native-qualification.test.mjs','tests/engine/react19-committed-memo-native-driver.test.mjs','experiments/react19-reducer/callback-jsx-native-qualification.mjs','experiments/browser-launch-witness.mjs','experiments/browser-launch-witness-run.mjs','experiments/owned-browser-process.mjs','experiments/owned-browser-process-run.mjs','experiments/react19-reducer/native-state-source-path-observer.mjs','tests/engine/react19-native-state-source-path-observer.test.mjs','docs/superpowers/specs/2026-10-26-a02-committed-memo-native-design.md','docs/superpowers/plans/2026-10-26-a02-committed-memo-native.md','package.json','package-lock.json','node_modules/playwright/package.json','node_modules/playwright-core/package.json','node_modules/playwright-core/browsers.json','node_modules/esbuild/package.json','node_modules/@esbuild/linux-x64/bin/esbuild',profile.registrationFile,upstream+'/SOURCE_SHA256.json',upstream+'/REVISION',node.executable,executable,...localModules()];
 Object.assign(inputs,await hashes(ownFiles));
 const s={schema:profile.schema,maximumNativeRuns:1,out,preparedAt:new Date().toISOString(),preparedAtRevision:git(['rev-parse','HEAD']),preparedDirty:false,upstreamRevision,originalManifest,pagePrefix,protocol:callbackJSXNativeProtocol(),profilePolicy:{root:'/tmp',prefix:'playwright_chromiumdev_profile-'},transport:{host:'127.0.0.1',port:0},node,browser,withExtension:false,withHelper:false,withIDE:false,productSupport:false,fullA02:false,researchRetention:retainedAppResearchPolicy(),sourceCounts:{priorResearch:profile.sourceCount,productInputs:327,originalCorpus:28},sourceRegistrationSha256:hash(await fs.readFile(profile.registrationFile)),sitePolicy:{mainSite:overlay.main.mainSite,filterSite:overlay.main.filterSite,mapSite:overlay.main.mapSite,jsxSites:overlay.main.configSites,app:overlay.app.app,configSite:overlay.app.configSite,native:overlay.nativeReturn.policy,elementFiber:overlay.policy.elementFiber,memoBranch:overlay.policy.memoBranch},committedMemoCase:committedMemoCasePolicy(),nativeMemo:overlay.nativeMemo,app:overlay.app,appPathPolicy:{acceptedPhases:['equal','same','changed','toggle'],filtered:'audit-only-not-counted'},main:overlay.main,nativeJSX:overlay.nativeJSX,nativeReturn:overlay.nativeReturn,loadedInputs:overlay.loadedInputs,bundles,factory:{file:factoryFile,sha256:hash(overlay.factory)},bootstrapDigests,inputHashes:inputs};
 guardCallbackJSXNativeCase(s);await verifyCallbackJSXNativeInputs(inputs);await fs.writeFile(out+'/prepared.json',JSON.stringify({browserNotStarted:true,configuration:'Original retained source under automatic JSX/esbuild overlay; not original Webpack or installed Atom',case:s},null,2)+'\n',{flag:'wx'});await fs.writeFile(file,JSON.stringify(s,null,2)+'\n',{flag:'wx'});console.log('PREPARED_RETAINED_APP_STATE_SOURCE',file,Object.keys(inputs).length,'inputs; browser not started');return s;
}
export async function preflightCallbackJSXNativeCase(file){
 const profile=ownCase(file);const bytes=await fs.readFile(file),s=guardCallbackJSXNativeCase(JSON.parse(bytes));assert.equal(s.schema,profile.schema,'Case path/schema mismatch');assert.equal(await fs.realpath(s.out),s.out);assert((await fs.lstat(s.out)).isDirectory()&&!(await fs.lstat(s.out)).isSymbolicLink());assert.deepEqual(await nodeIdentity(),s.node);assert.equal(s.browser.executable,await fs.realpath(chromium.executablePath()));assert.deepEqual(s.originalManifest,await json(upstream+'/SOURCE_SHA256.json'));assert.equal(hash(await fs.readFile(profile.registrationFile)),s.sourceRegistrationSha256);
 const protectedNow=await protectedInputs(profile);for(const[p,d]of Object.entries(protectedNow))assert.equal(s.inputHashes[p],d);
 for(const p of Object.keys(s.inputHashes))assert(p.startsWith(root+'/')||p===s.node.executable||p===s.browser.executable);
 assert.equal(hash(callbackJSXNativeFactory()),s.factory.sha256);for(const mode of ['off','on'])assert.equal(hash(callbackJSXNativeBootstrap(callbackJSXNativeFactory(),{page:s.pagePrefix+':'+mode,mode,policy:s.sitePolicy})),s.bootstrapDigests[mode]);
 const inputs={...await verifyCallbackJSXNativeInputs(s.inputHashes),[path.resolve(file)]:hash(bytes)};assert.deepEqual((await json(s.out+'/prepared.json')).case,s);return{s,inputs,caseSha256:hash(bytes)};
}
async function procState(pid,expectedStartTime){
 if(!Number.isSafeInteger(pid)||pid<=0)return{state:'Unknown',expectedStartTime};
 try{const raw=await fs.readFile('/proc/'+pid+'/stat','utf8');assert.equal(raw.slice(0,raw.indexOf(' ')),String(pid));const start=raw.slice(raw.lastIndexOf(')')+2).trim().split(/\s+/)[19];assert(/^\d+$/.test(start));return{pid,expectedStartTime,actualStartTime:start,state:expectedStartTime&&start!==expectedStartTime?'DifferentProcess':'Present'};}catch(e){return{pid,expectedStartTime,state:e.code==='ENOENT'?'Absent':'Unknown'};}
}
async function awaitExit(pid,start){let value;for(let i=0;i<100;i++){value=await procState(pid,start);if(['Absent','DifferentProcess'].includes(value.state))return value;await new Promise(resolve=>setTimeout(resolve,50));}return value;}
function activeLease(lease){if(lease&&lease.active!==true)throw fault('STAGE_TIMEOUT');}
async function activeStep(lease,fn){activeLease(lease);const value=await fn();activeLease(lease);return value;}
function createNativeOperations(s,inputs){
 const h={active:true},modeHandles=new Map(),pending=new Set();let result,connectPromise;
 const save=async(name,value)=>fs.writeFile(s.out+'/'+name+'.json',JSON.stringify(value,null,2)+'\n',name==='running'?{}:{flag:'wx'});
 const acquire=async(bag,key,fn,closeMethod='close',timeoutMs=5000,lease)=>{activeLease(lease);if(bag.active===false)throw fault('STAGE_TIMEOUT');const value=await acquireCallbackJSXNativeHandle(bag,key,()=>{activeLease(lease);return fn();},{timeoutMs,closeMethod,isActive:()=>bag.active!==false&&(!lease||lease.active),onPending:p=>{pending.add(p);p.then(()=>pending.delete(p),()=>pending.delete(p));},onLate:ok=>{result.errors.push({stage:'late:'+key,code:ok?'LATE_HANDLE_CLOSED':'LATE_HANDLE_CLEANUP_UNKNOWN'});}});activeLease(lease);return value;};
 const session=lease=>connectPromise??=(async()=>{
  const endpoint=h.owner.wsEndpoint(),u=new URL(endpoint);assert.equal(u.protocol,'ws:');assert.equal(u.hostname,'127.0.0.1');assert(!u.username&&!u.password&&!u.search&&!u.hash);
  await acquire(h,'client',()=>chromium.connect(endpoint,{timeout:10000}),'close',12000,lease);assert.equal(h.client.contexts().length,0);await acquire(h,'browserSession',()=>h.client.newBrowserCDPSession(),'detach',5000,lease);return h.browserSession;
 })();
 const dom=page=>page.evaluate(()=>({texts:[...document.querySelectorAll('[data-testid="todo-item-label"]')].map(n=>n.textContent),checked:[...document.querySelectorAll('[data-testid="todo-item-toggle"]')].map(n=>n.checked)}));
 const waitDOM=(page,expected)=>page.waitForFunction(e=>JSON.stringify([...document.querySelectorAll('[data-testid="todo-item-label"]')].map(n=>n.textContent))===JSON.stringify(e.texts)&&JSON.stringify([...document.querySelectorAll('[data-testid="todo-item-toggle"]')].map(n=>n.checked))===JSON.stringify(e.checked),expected,{timeout:20000});
 async function documentFor(run,lease,urlFacts={}){
  activeLease(lease);
  const m=modeHandles.get(run.mode);
  run.documentURLReadings??=[];assert(run.documentURLReadings.length<8);run.documentURLReadings.push(urlFacts);
  const target=(await activeStep(lease,()=>ownedProcessDeadline(()=>m.pageSession.send('Target.getTargetInfo'),5000,'METADATA_TIMEOUT'))).targetInfo;
  urlFacts.targetURL=target.url;
  const tree=(await activeStep(lease,()=>ownedProcessDeadline(()=>m.pageSession.send('Page.getFrameTree'),5000,'METADATA_TIMEOUT'))).frameTree;
  urlFacts.frameURL=tree.frame.url;urlFacts.urlFragmentPresent=Object.hasOwn(tree.frame,'urlFragment');
  if(urlFacts.urlFragmentPresent)urlFacts.urlFragment=tree.frame.urlFragment;
  urlFacts.pageURL=m.page.url();
  assert.equal(target.type,'page');assert(!target.openerId&&!target.openerFrameId);assert.equal(m.context.pages().length,1);assert.equal(m.page.frames().length,1);assert.equal((tree.childFrames||[]).length,0);assert(!tree.frame.parentId);
  qualifyCallbackJSXFrameURL(tree.frame,target.url,{origin:result.origin,mode:run.mode,pageURL:urlFacts.pageURL});
  return{targetId:target.targetId,frameId:tree.frame.id,loaderId:tree.frame.loaderId,browserContextId:target.browserContextId,mainOnly:true};
 }
 return{
  sourceControl:false,bindResult:r=>{result=r;result.inputsBefore=inputs;},save,
  async launch(lease){await acquire(h,'owner',()=>chromium.launchServer(callbackJSXNativeLaunchOptions(s)),'close',22000,lease);},
  async readOwner(lease){activeLease(lease);const w=captureBrowserLaunchWitness(h.owner.process(),{...s.browser,profileRoot:'/tmp',profilePrefix:s.profilePolicy.prefix});result.launchProcess={pid:w.pid,expectedStartTime:null};const p=await activeStep(lease,()=>procState(w.pid,null));if(p.actualStartTime)result.launchProcess.expectedStartTime=p.actualStartTime;return w;},
  async readRequestedAutomation(owner,lease){activeLease(lease);return captureCallbackJSXAutomationRequest(h.owner.process(),owner);},
  async readProcess(lease){const cdp=await activeStep(lease,()=>session(lease));return activeStep(lease,()=>collectOwnedBrowserProcess(cdp,s.browser));},
  async readPublic(policy,lease){const cdp=await activeStep(lease,()=>session(lease)),version=await activeStep(lease,()=>cdp.send('Browser.getVersion'));result.startup.browserReportedProduct=version.product;assert(['Chrome/'+s.browser.version,'HeadlessChrome/'+s.browser.version].includes(version.product));await save('public-browser-protocol',{product:version.product,protocolVersion:version.protocolVersion});activeLease(lease);const targets=(await activeStep(lease,()=>cdp.send('Target.getTargets'))).targetInfos;assert(Array.isArray(targets)&&targets.length<=128);const pages=targets.filter(t=>t.type==='page'),extensions=targets.filter(t=>typeof t.url==='string'&&t.url.startsWith('chrome-extension://'));await save('public-initial-target-counts',{pages:pages.length,extensionTargets:extensions.length});assert.equal(pages.length,0);assert.equal(extensions.length,0);activeLease(lease);const line=await activeStep(lease,()=>cdp.send('Browser.getBrowserCommandLine'));return capturePublicCallbackJSXStartup(line.arguments,policy);},
  async readManaged(lease){return activeStep(lease,()=>readManagedLaunchProfile(result.startup.owner.profile,s.profilePolicy));},
  async readVersion(lease){await activeStep(lease,()=>session(lease));return h.client.version();},
  async openHTTP(lease){
   activeLease(lease);
   const buffers={};for(const[name,b]of Object.entries(s.bundles)){const data=await activeStep(lease,()=>fs.readFile(b.file));assert.equal(hash(data),b.sha256);buffers['/'+name]=data;}
   const server=createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');result.traffic.push({method:req.method,ownedOrigin:true,path:Object.hasOwn(buffers,u.pathname)||['/','/favicon.ico'].includes(u.pathname)?u.pathname:undefined,pathDigest:hash(u.pathname)});res.setHeader('cache-control','no-store');if(req.method!=='GET'){res.writeHead(405).end();return;}if(u.pathname==='/favicon.ico'){res.writeHead(204).end();return;}if(u.pathname==='/'){const mode=u.searchParams.get('mode');if(!s.protocol.modes.includes(mode)){res.writeHead(400).end();return;}const bundle=mode==='original'?'original':'observed';res.setHeader('content-type','text/html; charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><title>Original Main JSX source experiment</title><link rel="stylesheet" href="/'+bundle+'.css"><div id="root"></div><script src="/'+bundle+'.js"></script>');return;}if(!Object.hasOwn(buffers,u.pathname)){res.writeHead(404).end();return;}res.setHeader('content-type',u.pathname.endsWith('.js')?'text/javascript':'text/css');res.end(buffers[u.pathname]);});h.httpServer=server;
   await ownedProcessDeadline(()=>new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>{if(!lease.active||h.active===false){server.close(()=>{});reject(fault('STAGE_TIMEOUT'));}else resolve();});}),5000,'HANDLE_TIMEOUT');activeLease(lease);return{origin:'http://127.0.0.1:'+server.address().port};
  },
  async openMode(run,lease){
   activeLease(lease);run.executionMilestones={appExecuted:false,ReactDOMExecuted:false,originalMainExecuted:false};const m={active:true,contexts:new Map(),scripts:[]};modeHandles.set(run.mode,m);await acquire(m,'context',()=>h.client.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'}),'close',5000,lease);assert.equal(m.context.pages().length,0);
   await activeStep(lease,()=>m.context.route('**/*',async route=>{if(!m.active){await route.abort().catch(()=>{});return;}const request=route.request(),u=new URL(request.url());if(u.origin!==result.origin||request.method()!=='GET'){result.networkDenied.push({method:request.method(),urlDigest:hash(request.url())});await route.abort();}else await route.continue();}));
   m.context.on('page',()=>{if(m.context.pages().length>1)result.errors.push({stage:run.mode,code:'EXTRA_PAGE'});});
   await acquire(m,'page',()=>m.context.newPage(),'close',5000,lease);m.page.setDefaultTimeout(20000);m.page.on('pageerror',e=>run.pageErrors.push({name:e.name,message:e.message}));m.page.on('console',message=>{if(['warning','error'].includes(message.type()))run.console.push({type:message.type(),text:message.text()});});
   await acquire(m,'pageSession',()=>m.context.newCDPSession(m.page),'detach',5000,lease);m.pageSession.on('Runtime.executionContextCreated',e=>{if(m.contexts.size>=32)result.errors.push({stage:run.mode,code:'CONTEXT_CAPACITY'});else m.contexts.set(e.context.id,e.context);});m.pageSession.on('Runtime.executionContextDestroyed',e=>m.contexts.delete(e.executionContextId));m.pageSession.on('Runtime.executionContextsCleared',()=>m.contexts.clear());
   m.pageSession.on('Debugger.scriptParsed',e=>{if(e.url===result.origin+'/'+(run.mode==='original'?'original.js':'observed.js')||e.url==='stateatom-owned://a0216/'+run.mode+'/bootstrap.js'){if(m.scripts.length>=16)result.errors.push({stage:run.mode,code:'SCRIPT_CAPACITY'});else m.scripts.push({scriptId:e.scriptId,url:e.url,executionContextId:e.executionContextId});}});
   await activeStep(lease,()=>m.pageSession.send('Runtime.enable'));await activeStep(lease,()=>m.pageSession.send('Debugger.enable'));
   if(run.mode!=='original'){
    await activeStep(lease,()=>m.pageSession.send('Page.enable'));
    const bootstrap=await activeStep(lease,()=>fs.readFile(s.out+'/'+run.mode+'-bootstrap.js','utf8'));assert.equal(hash(bootstrap),s.bootstrapDigests[run.mode]);
    const registration=await activeStep(lease,()=>m.pageSession.send('Page.addScriptToEvaluateOnNewDocument',{source:bootstrap,runImmediately:false}));
    assert(typeof registration?.identifier==='string'&&registration.identifier.length>0&&registration.identifier.length<=512);
   }
   run.executionMilestones={appExecuted:'Unknown/Unsupported',ReactDOMExecuted:'Unknown/Unsupported',originalMainExecuted:'Unknown/Unsupported'};await activeStep(lease,()=>m.page.goto(result.origin+'/?mode='+run.mode,{waitUntil:'load',timeout:20000}));await activeStep(lease,()=>m.page.getByRole('textbox',{name:'New Todo Input'}).waitFor());run.executionMilestones.appExecuted=true;run.document=await documentFor(run,lease);
  },
  async setupMode(run,lease){
   const m=modeHandles.get(run.mode);run.initialDom=await activeStep(lease,()=>dom(m.page));assert.deepEqual(run.initialDom,{texts:[],checked:[]});const bundle=s.bundles[run.mode==='original'?'original.js':'observed.js'];
   run.sourceWitness=await activeStep(lease,()=>readCallbackJSXLoadedSource(m.pageSession,{document:run.document,contexts:[...m.contexts.values()],scripts:m.scripts,origin:result.origin,mode:run.mode,bundleHash:bundle.sha256,bootstrapHash:s.bootstrapDigests[run.mode],lease}));assert.equal(await activeStep(lease,()=>m.page.locator('[data-testid="main"]').count()),1);
   run.executionMilestones={appExecuted:true,ReactDOMExecuted:true,originalMainExecuted:true};await save(run.mode+'-loaded-source',run.sourceWitness);activeLease(lease);
   const add=m.page.getByRole('textbox',{name:'New Todo Input'});await activeStep(lease,()=>add.fill('SAME'));await activeStep(lease,()=>add.press('Enter'));await activeStep(lease,()=>waitDOM(m.page,s.protocol.setup));const observed=await activeStep(lease,()=>dom(m.page)),observation=run.mode==='original'?null:await activeStep(lease,()=>m.page.evaluate(()=>globalThis.__sa_callback_copy.sealWindow()));run.setup={dom:observed,sourceWindowNotAccepted:true,observation};assert.deepEqual(await documentFor(run,lease),run.document);
  },
  async performPhase(run,phase,lease){
   activeLease(lease);const m=modeHandles.get(run.mode),page=m.page,add=page.getByRole('textbox',{name:'New Todo Input'});
   if(run.mode!=='original')await activeStep(lease,()=>page.evaluate(label=>globalThis.__sa_callback_copy.startWindow(label),phase.id));
   if(phase.id==='equal'){await activeStep(lease,()=>add.fill('SAME'));await activeStep(lease,()=>add.press('Enter'));}
   else if(['same','changed'].includes(phase.id)){await activeStep(lease,()=>page.locator('[data-testid="todo-item-label"]').first().dblclick());const edit=page.getByRole('textbox',{name:'Edit todo',exact:true});await activeStep(lease,()=>edit.fill(phase.id==='same'?'SAME':'CHANGED'));await activeStep(lease,()=>edit.press('Enter'));await activeStep(lease,()=>edit.waitFor({state:'detached'}));}
   else if(phase.id==='toggle')await activeStep(lease,()=>page.locator('[data-testid="todo-item-toggle"]').first().check());
   else if(phase.id==='filtered')await activeStep(lease,()=>page.locator('a[href="#/active"]').click());
   else{if(run.mode!=='original')await activeStep(lease,()=>page.evaluate(()=>globalThis.__sa_callback_copy.stop()));await activeStep(lease,()=>add.fill('AFTER_STOP'));await activeStep(lease,()=>add.press('Enter'));}
   await activeStep(lease,()=>waitDOM(page,{texts:phase.texts,checked:phase.checked}));
  },
   async capturePhase(run,phase,v,lease){const m=modeHandles.get(run.mode);const values=await activeStep(lease,()=>m.page.evaluate(()=>{
    const observer=globalThis.__sa_callback_copy,capture=observer?.sealWindow()??null,labels=[...document.querySelectorAll('[data-testid="todo-item-label"]')];
    const hook=name=>{const d=Object.getOwnPropertyDescriptor(globalThis,name);return !!d&&Object.hasOwn(d,'value')&&typeof d.value==='function';};
    const nativeTapPresent=(()=>{const d=Object.getOwnPropertyDescriptor(globalThis,'__STATEATOM__');if(!d||!Object.hasOwn(d,'value'))return false;const t=Object.getOwnPropertyDescriptor(d.value,'react19NativeTap');return !!t&&Object.hasOwn(t,'value')&&typeof t.value==='function';})();
    const committedMemo=observer?{rows:labels.map((node,index)=>({index,lookup:observer.lookupNode(node)})),detached:observer.lookupNode(document.createElement('span')),retention:observer.referenceRetention(),hooks:{native:nativeTapPresent,jsx:hook('__STATEATOM_REACT19_JSX_INPUT__'),element:hook('__STATEATOM_ELEMENT_FIBER_TAP__'),memo:hook('__STATEATOM_MEMO_BRANCH_TAP__')}}:null;
    return{dom:{texts:labels.map(n=>n.textContent),checked:[...document.querySelectorAll('[data-testid="todo-item-toggle"]')].map(n=>n.checked)},capture,nativeTapPresent,committedMemo};
   }));v.dom=values.dom;v.capture=values.capture;v.committedMemo=values.committedMemo;if(v.capture)v.capture.nativeTapPresent=values.nativeTapPresent;v.url=m.page.url();await save(run.mode+'-'+phase.id+'-before-document',v);activeLease(lease);v.document=await documentFor(run,lease);},
  async closeMode(run){const m=modeHandles.get(run.mode);if(m){m.active=false;await closeLaunchWitnessHandles(m,run.cleanup,result.errors);}},
  async closeRoot(r){
   h.active=false;await closeLaunchWitnessHandles(h,r.cleanup,r.errors);
   try{if(h.httpServer){await ownedProcessDeadline(()=>new Promise((resolve,reject)=>h.httpServer.close(e=>e?reject(e):resolve())),5000,'CLEANUP_TIMEOUT');r.cleanup.httpServer=true;}else r.cleanup.httpServer='not-started';}catch(e){r.cleanup.httpServer=false;r.errors.push(safeError(e,'cleanup:http'));}
   try{await ownedProcessDeadline(()=>Promise.allSettled([...pending]),5000,'CLEANUP_TIMEOUT');r.cleanup.pendingResources=pending.size===0;if(!r.cleanup.pendingResources)throw fault('CLEANUP_TIMEOUT');}catch(e){r.cleanup.pendingResources=false;r.errors.push(safeError(e,'cleanup:pending'));}
   const pid=r.startup.owner?.pid??r.launchProcess?.pid,start=r.startup.proc?.reported?.startTime??r.launchProcess?.expectedStartTime??null;r.cleanup.processExit=await awaitExit(pid,start);r.cleanup.ownerProcessExited=['Absent','DifferentProcess'].includes(r.cleanup.processExit.state);
   let removed=false;const profile=r.startup.owner?.profile;for(let i=0;typeof profile==='string'&&i<100;i++){try{await fs.lstat(profile);}catch(e){if(e.code==='ENOENT'){removed=true;break;}}await new Promise(resolve=>setTimeout(resolve,50));}r.cleanup.managedProfileRemoved=removed;
  },
  async verifyInputs(){result.inputsAfter=await verifyCallbackJSXNativeInputs(inputs);for(const p of localModules())assert(Object.hasOwn(inputs,p),'Unregistered loaded Node module');return true;}
 };
}
export function assertCommittedMemoReaderContract(c,s,b){
 assert.equal(c.schema,'stateatom.committed-memo-reader-contract/1');assert.equal(c.prepareRevision,s.preparedAtRevision);assert.equal(c.executionRevision,b.executionRevision);assert.equal(c.caseSha256,b.caseSha256);assert.equal(c.readerSha256,b.readerSha256);assert.equal(c.preservationReaderSha256,b.preservationReaderSha256);assert.equal(c.maximumNativeRuns,1);assert.equal(c.originalNegativeControlClasses,546);assert.equal(c.qualification,'prewritten-first-pass-only');
 for(const k of ['caseSha256','readerSha256','preservationReaderSha256'])assert(hex(c[k]));for(const k of ['prepareRevision','executionRevision'])assert(/^[a-f0-9]{40}$/.test(c[k]));
 return c;
}
export async function runCallbackJSXNativeCase(file){
 const{s,inputs,caseSha256}=await preflightCallbackJSXNativeCase(file);assert.equal(git(['status','--porcelain','--untracked-files=normal']),'','Commit frozen case first');
 const contractFile=path.resolve('.artifacts/a02/committed-memo-native-saved-verification/2026-10-26/reader-contract.json'),fullReaderFile=path.resolve('.artifacts/a02/committed-memo-native-saved-verification/2026-10-26/verify.py'),preservationReaderFile=path.resolve('.artifacts/a02/committed-memo-native-preservation/2026-10-26/verify.py');
 const contractBytes=await fs.readFile(contractFile),contract=JSON.parse(contractBytes.toString('utf8')),readerSha256=hash(await fs.readFile(fullReaderFile)),preservationReaderSha256=hash(await fs.readFile(preservationReaderFile));
 assertCommittedMemoReaderContract(contract,s,{executionRevision:git(['rev-parse','HEAD']),caseSha256,readerSha256,preservationReaderSha256});
 const prewrittenReaders={contractFile,contractSha256:hash(contractBytes),fullReaderFile,readerSha256,preservationReaderFile,preservationReaderSha256};
 await fs.writeFile(s.out+'/registered-before-browser.json',JSON.stringify({sourceRevision:git(['rev-parse','HEAD']),sourceDirty:false,caseSha256,case:s,inputsBefore:inputs,browserNotStarted:true,prewrittenReaders},null,2)+'\n',{flag:'wx'});
 await fs.writeFile(s.out+'/native-run-started.json',JSON.stringify({at:new Date().toISOString(),driverPid:process.pid,maximumNativeRuns:1},null,2)+'\n',{flag:'wx'});
 const r=await runCallbackJSXNativeStages(s,createNativeOperations(s,inputs));console.log('COMMITTED_MEMO_REFERENCE',r.status,r.committedMemoStatus,s.out+'/results.json');process.exitCode=r.status==='PASS_BOUNDED_RETAINED_APP_STATE_SOURCE_NOT_FULL_A02'&&r.committedMemoStatus==='PASS_BOUNDED_COMMITTED_MEMO_REFERENCE_NOT_FULL_A02'?0:1;return r;
}
async function main(){const args=parseCallbackJSXNativeArgs(process.argv.slice(2));if(args.mode==='prepare')await prepareCallbackJSXNativeCase(args.caseFile,args.out);else if(args.mode==='preflight'){const r=await preflightCallbackJSXNativeCase(args.caseFile);console.log('PREFLIGHT_RETAINED_APP_STATE_SOURCE',Object.keys(r.inputs).length,'inputs; no browser');}else await runCallbackJSXNativeCase(args.caseFile);}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)main().catch(e=>{console.error('RETAINED_APP_STATE_SOURCE_DRIVER_ERROR',safeError(e,'main').code);process.exitCode=1;});
