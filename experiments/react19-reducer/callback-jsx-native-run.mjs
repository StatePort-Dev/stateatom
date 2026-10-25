// SPDX-License-Identifier: Apache-2.0
// One owned original Main source overlay. No installed-product or full A02 claim.
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
import {createPropCopyObserver} from './prop-copy-observer.mjs';
import {createJSXConfigInputObserver} from './jsx-config-observer.mjs';
import {createCallbackCopyObserver} from './callback-copy-observer.mjs';
import {instrumentCallbackCopyIntervals} from './callback-copy-transform.mjs';
import {instrumentJSXConfigInputs} from './jsx-config-transform.mjs';
import {jsxConfigProfile,transformPinnedJSXConfig} from './jsx-config-vendor.mjs';
import {captureBrowserLaunchWitness} from '../browser-launch-witness.mjs';
import {readManagedLaunchProfile,closeLaunchWitnessHandles} from '../browser-launch-witness-run.mjs';
import {collectOwnedBrowserProcess,ownedProcessDeadline} from '../owned-browser-process.mjs';
import {capturePublicCallbackJSXStartup,qualifyCallbackJSXStartup,callbackJSXNativeProtocol,guardCallbackJSXNativeWindow,classifyCallbackJSXNativeRun} from './callback-jsx-native-qualification.mjs';
const root=process.cwd(),upstream=path.resolve('.runtime/todomvc'),app=upstream+'/examples/react',mainFile=app+'/src/todo/components/main.jsx';
const casePath=path.resolve('docs/testing/callback-jsx-main-native-case.json'),outputPrefix=path.resolve('.artifacts/a02/callback-jsx-main-native')+path.sep,registrationFile=path.resolve('.artifacts/a02/callback-jsx-native-source/2026-10-25/registration.json');
const hash=s=>createHash('sha256').update(s).digest('hex'),json=async p=>JSON.parse(await fs.readFile(p,'utf8')),git=args=>execFileSync('git',args,{encoding:'utf8',timeout:5000}).trim();
const pins={'react/cjs/react.development.js':'4325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72','react/cjs/react-jsx-runtime.development.js':'dd50fd0db2fba44e0eee66243a45c81cfa3774cf41e4e6c0c080a601815c694d','react-dom/cjs/react-dom-client.development.js':'806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08'};
const fault=code=>Object.assign(Error(code),{code});
function safeError(error,stage){
 const allowed=new Set(['CONTROL_FAIL','METADATA_TIMEOUT','HANDLE_TIMEOUT','CLEANUP_TIMEOUT','SOURCE_MISMATCH','STARTUP_REFUSED','SOURCE_CONTROL_ONLY','CASE_INCOMPLETE','ENOENT','EEXIST','ECONNRESET','ECONNREFUSED']);let code='STAGE_FAILED',message=null;
 try{const d=Object.getOwnPropertyDescriptor(error,'code');if(d&&Object.hasOwn(d,'value')){if(allowed.has(d.value))code=d.value;else if(d.value==='ERR_ASSERTION')code='ASSERTION_FAILED';}const m=Object.getOwnPropertyDescriptor(error,'message');if(m&&Object.hasOwn(m,'value')&&typeof m.value==='string'&&Buffer.byteLength(m.value)<=65536)message=m.value;}catch{}
 const diagnostics=[];if(message)for(const[pattern,label]of [[/Failed to move to .*namespace|Failed to move to a new namespace/i,'NAMESPACE_UNAVAILABLE'],[/Operation not permitted/i,'OPERATION_NOT_PERMITTED'],[/No usable sandbox/i,'SANDBOX_UNAVAILABLE'],[/Target page, context or browser has been closed/i,'TARGET_CLOSED'],[/Timeout.*exceeded/i,'OPERATION_TIMEOUT'],[/getBrowserCommandLine.*enable-automation/i,'AUTOMATION_API_UNAVAILABLE']])if(pattern.test(message))diagnostics.push(label);
 return{stage,code,diagnostics,messageDigest:message===null?null:hash(message)};
}
export function parseCallbackJSXNativeArgs(a){if(a.length===1&&a[0]&&!a[0].startsWith('--'))return{mode:'run',caseFile:a[0]};if(a.length===2&&a[0]==='--preflight'&&a[1]&&!a[1].startsWith('--'))return{mode:'preflight',caseFile:a[1]};if(a.length===3&&a[0]==='--prepare'&&a[1]&&a[2]&&!a[1].startsWith('--')&&!a[2].startsWith('--'))return{mode:'prepare',caseFile:a[1],out:a[2]};throw fault('CASE_INCOMPLETE');}
export function callbackJSXNativeFactory(){return '(()=>{const createPropCopyObserver='+createPropCopyObserver.toString()+';const createJSXConfigInputObserver='+createJSXConfigInputObserver.toString()+';return '+createCallbackCopyObserver.toString()+';})()';}
export function callbackJSXNativeBootstrap(factory,{page,mode}){
 assert(['off','on'].includes(mode));assert(typeof page==='string'&&page.length>0&&page.length<=128);
 return '(()=>{"use strict";if(Object.hasOwn(globalThis,"__sa_callback_copy")||Object.hasOwn(globalThis,"__sa_array_calls")||Object.hasOwn(globalThis,"__STATEATOM_REACT19_JSX_INPUT__"))throw Error("Owned observer collision");const make='+factory+';const o=make('+JSON.stringify({page,enabled:mode==='on',inputProfile:'jsx-config'})+');o.sealWindow();Object.defineProperty(globalThis,"__sa_callback_copy",{value:o});Object.defineProperty(globalThis,"__sa_array_calls",{value:o.arrayRuntime});'+(mode==='on'?'Object.defineProperty(globalThis,"__STATEATOM_REACT19_JSX_INPUT__",{value:o.tap});':'')+'})();\n//# sourceURL=stateatom-owned://a0216/'+mode+'/bootstrap.js\n';
}
export async function buildCallbackJSXMainOverlay(){
 const physical={},loadedInputs=[],mainSource=await fs.readFile(mainFile,'utf8'),relative=path.relative(root,mainFile);
 for(const[p,d]of Object.entries(pins))assert.equal(hash(await fs.readFile(app+'/node_modules/'+p)),d);
 for(const name of ['react','react-dom'])assert.equal((await json(app+'/node_modules/'+name+'/package.json')).version,'19.2.5');
 const interval=instrumentCallbackCopyIntervals(mainSource,relative,{enabled:true});assert.equal(interval.skipped,false);assert.equal(interval.intervalSites.length,1);assert.equal(interval.sites.length,2);
 const lowered=await transform(interval.code,{loader:'jsx',jsx:'automatic',format:'esm',target:'es2022',sourcefile:relative}),config=instrumentJSXConfigInputs(lowered.code,'a0216-compiled-main.js',{enabled:true});assert.equal(config.skipped,false);assert.equal(config.sites.length,2);
 const jsxFile=app+'/node_modules/react/cjs/react-jsx-runtime.development.js',nativeJSX=transformPinnedJSXConfig(await fs.readFile(jsxFile,'utf8'),jsxConfigProfile.file),bundles={},metafiles={};
 for(const mode of ['original','observed']){
  const plugin={name:'owned-current-main-and-jsx-only',setup(b){b.onLoad({filter:/.*/},async args=>{
   assert(args.path.startsWith(app+'/'),'Only retained application dependency source');
   const bytes=await fs.readFile(args.path),digest=hash(bytes);if(physical[args.path])assert.equal(physical[args.path],digest);physical[args.path]=digest;
   let contents=bytes.toString('utf8'),transformed=false;
   if(mode==='observed'&&args.path===mainFile){assert.equal(contents,mainSource);contents=config.code;transformed=true;}
   if(mode==='observed'&&args.path===jsxFile){assert.equal(digest,nativeJSX.sourceDigest);contents=nativeJSX.code;transformed=true;}
   const ext=path.extname(args.path),loader=ext==='.css'?'css':ext==='.json'?'json':['.js','.jsx','.mjs','.cjs'].includes(ext)?'jsx':null;assert(loader,'Unsupported fixed application input: '+path.relative(app,args.path));
   loadedInputs.push({mode,file:args.path,physicalSha256:digest,compilerInputSha256:hash(contents),transformed});
   return{contents,loader,resolveDir:path.dirname(args.path)};
  });}};
  const result=await build({absWorkingDir:root,entryPoints:[app+'/src/index.js'],outfile:path.resolve('.artifacts/a02/callback-jsx-build-memory/'+mode+'.js'),bundle:true,write:false,metafile:true,format:'iife',platform:'browser',target:'es2022',jsx:'automatic',loader:{'.js':'jsx'},legalComments:'inline',tsconfigRaw:{compilerOptions:{}},define:{'process.env.NODE_ENV':'"development"'},plugins:[plugin]});
  for(const f of result.outputFiles){const name=path.basename(f.path);assert([mode+'.js',mode+'.css'].includes(name));bundles[name]={contents:f.text,sha256:hash(f.contents),bytes:f.contents.length};}
  assert(bundles[mode+'.js']&&bundles[mode+'.css']);metafiles[mode]=result.metafile;
 }
 for(const[p,d]of Object.entries(physical))assert.equal(hash(await fs.readFile(p)),d);
 assert.equal(loadedInputs.filter(x=>x.mode==='observed'&&x.transformed).length,2);
 for(const p of Object.keys(pins))assert(physical[app+'/node_modules/'+p]);
 return{schema:'stateatom.callback-jsx-main-source-overlay/1',sourceOnly:true,appExecuted:false,browserStarted:false,physicalInputs:physical,loadedInputs,bundles,metafiles,main:{originalDigest:hash(mainSource),intervalSites:interval.intervalSites,arraySites:interval.sites,intervalDigest:hash(interval.code),loweredDigest:hash(lowered.code),configDigest:hash(config.code),configSites:config.sites},mainOutputs:{'main-interval.jsx':interval.code,'main-lowered.js':lowered.code,'main-config.js':config.code},nativeJSX:{...nativeJSX,code:undefined},nativeJSXCode:nativeJSX.code,factory:callbackJSXNativeFactory()};
}
export async function verifyCallbackJSXNativeInputs(expected){const actual={};assert(expected&&typeof expected==='object'&&Object.keys(expected).length>0);for(const[p,d]of Object.entries(expected)){assert(path.isAbsolute(p)&&/^[a-f0-9]{64}$/.test(d));actual[p]=hash(await fs.readFile(p));assert.equal(actual[p],d,'Frozen current input drift');}return actual;}
export function guardCallbackJSXNativeCase(s){
 assert.equal(s.schema,'stateatom.callback-jsx-native-case/1');assert.equal(s.maximumNativeRuns,1);assert(path.resolve(s.out).startsWith(outputPrefix));assert.equal(s.preparedDirty,false);assert(/^[a-f0-9]{40}$/.test(s.preparedAtRevision));assert.equal(s.upstreamRevision,'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');assert.equal(Object.keys(s.originalManifest).length,28);
 assert.deepEqual(s.protocol,callbackJSXNativeProtocol());assert.deepEqual(s.profilePolicy,{root:'/tmp',prefix:'playwright_chromiumdev_profile-'});assert.deepEqual(s.transport,{host:'127.0.0.1',port:0});assert.equal(s.profile,undefined);
 for(const k of ['withExtension','withHelper','withIDE','productSupport','fullA02'])assert.equal(s[k],false);
 assert.equal(s.browser.headless,true);assert.equal(s.browser.chromiumSandbox,true);assert.equal(s.browser.timeout,20000);assert.deepEqual(s.browser.args,[]);assert.equal(s.browser.version,'153.0.8010.12');assert(path.isAbsolute(s.browser.executable));assert(/^[a-f0-9]{64}$/.test(s.browser.sha256));
 assert(path.isAbsolute(s.node.executable));assert(/^v24\./.test(s.node.version));assert(/^[a-f0-9]{64}$/.test(s.node.sha256));
 assert.equal(s.sourceCounts.priorResearch,82);assert.equal(s.sourceCounts.productInputs,327);assert.equal(s.sourceCounts.originalCorpus,28);assert(/^[a-f0-9]{64}$/.test(s.sourceRegistrationSha256));
 assert.equal(s.main.originalDigest,'09164b4bb70f4162ca2d32e3961133653fd0f9934244ba21eb85477218008a28');assert.equal(s.main.intervalSites.length,1);assert.equal(s.main.configSites.length,2);assert.notEqual(s.main.configSites[0].id,s.main.configSites[1].id);assert.deepEqual(s.sitePolicy.mapSite,s.main.intervalSites[0]);assert.deepEqual(s.sitePolicy.jsxSites,s.main.configSites);
 assert.equal(s.nativeJSX.nativeVersionAdmitted,true);assert.equal(s.nativeJSX.sourceDigest,pins['react/cjs/react-jsx-runtime.development.js']);assert.equal(s.nativeJSX.version,'19.2.5');
 assert.equal(s.factory.file,s.out+'/observer-factory.js');assert(/^[a-f0-9]{64}$/.test(s.factory.sha256));assert.equal(s.inputHashes[s.factory.file],s.factory.sha256);
 assert.deepEqual(Object.keys(s.bundles).sort(),['observed.css','observed.js','original.css','original.js']);
 for(const[name,b]of Object.entries(s.bundles)){assert.equal(b.file,s.out+'/'+name);assert.equal(s.inputHashes[b.file],b.sha256);assert(/^[a-f0-9]{64}$/.test(b.sha256));assert(Number.isSafeInteger(b.bytes)&&b.bytes>0);}
 for(const mode of ['off','on']){assert(/^[a-f0-9]{64}$/.test(s.bootstrapDigests[mode]));assert.equal(s.inputHashes[s.out+'/'+mode+'-bootstrap.js'],s.bootstrapDigests[mode]);}
 assert.equal(s.inputHashes[s.browser.executable],s.browser.sha256);assert.equal(s.inputHashes[s.node.executable],s.node.sha256);assert.equal(s.inputHashes[registrationFile],s.sourceRegistrationSha256);
 for(const[p,d]of Object.entries(pins))assert.equal(s.inputHashes[app+'/node_modules/'+p],d);
 assert.equal(s.inputHashes[s.out+'/main-config.js'],s.main.configDigest);assert.equal(s.inputHashes[s.out+'/transformed-jsx.cjs'],s.nativeJSX.outputDigest);
 assert.equal(s.main.arraySites.length,2);assert.equal(s.sitePolicy.mapSite.kind,'map');assert.equal(s.sitePolicy.mapSite.sourceDigest,s.main.originalDigest);
 for(const site of s.main.configSites)assert.equal(site.sourceDigest,s.main.loweredDigest);
 const seen=new Set();for(const loaded of s.loadedInputs){
  assert(['original','observed'].includes(loaded.mode)&&loaded.file.startsWith(app+'/'));const key=loaded.mode+':'+loaded.file;assert(!seen.has(key));seen.add(key);
  assert.equal(s.inputHashes[loaded.file],loaded.physicalSha256);assert(/^[a-f0-9]{64}$/.test(loaded.compilerInputSha256));assert.equal(typeof loaded.transformed,'boolean');
  if(loaded.transformed){assert.equal(loaded.mode,'observed');assert([mainFile,app+'/node_modules/react/cjs/react-jsx-runtime.development.js'].includes(loaded.file));assert.equal(loaded.compilerInputSha256,loaded.file===mainFile?s.main.configDigest:s.nativeJSX.outputDigest);}else assert.equal(loaded.compilerInputSha256,loaded.physicalSha256);
 }
 for(const mode of ['original','observed']){assert(seen.has(mode+':'+mainFile));assert(seen.has(mode+':'+app+'/node_modules/react/cjs/react-jsx-runtime.development.js'));}
 assert.equal(s.loadedInputs.filter(x=>x.mode==='observed'&&x.transformed).length,2);assert(typeof s.pagePrefix==='string'&&s.pagePrefix.length>0&&s.pagePrefix.length<110);
 return s;
}
export async function acquireCallbackJSXNativeHandle(handles,key,task,{timeoutMs=5000,closeMethod='close',onPending=()=>{},onLate=()=>{}}={}){
 assert(['close','detach'].includes(closeMethod));let active=true;
 const pending=Promise.resolve().then(task).then(async handle=>{if(active){handles[key]=handle;return handle;}try{await ownedProcessDeadline(()=>handle[closeMethod](),5000,'CLEANUP_TIMEOUT');onLate(true);}catch{onLate(false);}return undefined;});
 onPending(pending);try{return await ownedProcessDeadline(()=>pending,timeoutMs,'HANDLE_TIMEOUT');}finally{active=false;}
}
export async function runCallbackJSXNativeStages(s,ops){
 const timeout=ops.sourceControl?ops.timeoutMs:5000;
 const r={schema:'stateatom.callback-jsx-native-result/1',status:'RUNNING',execution:ops.sourceControl?'SOURCE_CONTROL_NOT_NATIVE_PROOF':'ACTUAL_OWNED_PUBLIC_DRIVER',actualBrowserStarted:false,sourceRevision:ops.sourceControl?'0'.repeat(40):git(['rev-parse','HEAD']),preparedAtRevision:s.preparedAtRevision,sourceDirty:false,inputsUnchanged:false,browserStarted:false,appExecuted:false,ReactDOMExecuted:false,originalMainExecuted:false,browserLaunchesStarted:0,browserLaunchesCompleted:0,modesStarted:0,modesCompleted:0,phasesStarted:0,phasesCompleted:0,startup:{owner:null,proc:null,publicReport:null,managedProfile:null,browserVersion:null},startupQualification:null,runs:[],traffic:[],networkDenied:[],errors:[],cleanup:{},withExtension:false,withHelper:false,withIDE:false,productSupport:false,modelCalls:0,nativeWriterCalls:0,installedRuntimeProven:false,JSXProductSupported:false,fullA02:false};
 ops.bindResult?.(r);
 const save=async(name,value)=>ops.save(name,value),read=async(name,fn)=>{try{r.startup[name]=await ownedProcessDeadline(fn,timeout,'METADATA_TIMEOUT');}catch(e){r.errors.push(safeError(e,'startup:'+name));}await save('startup-'+name,r.startup[name]);};
 try{
  r.currentStage='launch';r.browserLaunchesStarted++;if(!ops.sourceControl){r.browserStarted='Unknown/Unsupported';r.actualBrowserStarted='Unknown/Unsupported';}await ops.launch();r.browserStarted=true;r.actualBrowserStarted=!ops.sourceControl;r.browserLaunchesCompleted++;
  await read('owner',()=>ops.readOwner());await save('owner-before-admission',r.startup.owner);
  if(r.startup.owner?.status!=='CAPTURED_ORIGINAL_INVOCATION')throw fault('STARTUP_REFUSED');
  const policy={executable:s.browser.executable,sha256:s.browser.sha256,profile:r.startup.owner.profile,browserVersion:s.browser.version};
  await read('proc',()=>ops.readProcess());await read('publicReport',()=>ops.readPublic(policy));await read('managedProfile',()=>ops.readManaged());await read('browserVersion',()=>ops.readVersion());
  r.startupQualification=qualifyCallbackJSXStartup(r.startup,policy);await save('startup-qualification',r.startupQualification);
  if(r.startupQualification.status!=='QUALIFIED_PUBLIC_STARTUP_AND_OWNER_PROCESS_FACTS_ONLY'||r.errors.length)throw fault('STARTUP_REFUSED');
  const http=await ops.openHTTP();r.origin=http.origin;
  for(const mode of s.protocol.modes){
   r.modesStarted++;const run={mode,pageId:s.pagePrefix+':'+mode,document:null,initialDom:null,setup:null,sourceWitness:null,phases:[],console:[],pageErrors:[],cleanup:{}};r.runs.push(run);
   try{
    r.currentStage=mode+':open';await ops.openMode(run);r.currentStage=mode+':setup';await ops.setupMode(run);r.appExecuted=true;r.ReactDOMExecuted=true;r.originalMainExecuted=true;await save(mode+'-setup',run);
    for(const phase of s.protocol.phases){
     r.phasesStarted++;const v={id:phase.id,completed:false,startedAt:new Date().toISOString()};run.phases.push(v);await save(mode+'-'+phase.id+'-started',v);
     r.currentStage=mode+':'+phase.id+':perform';await ops.performPhase(run,phase);r.currentStage=mode+':'+phase.id+':capture';await ops.capturePhase(run,phase,v);await save(mode+'-'+phase.id+'-observed',v);
     assert.deepEqual(v.document,run.document);assert.deepEqual(v.dom,{texts:phase.texts,checked:phase.checked});
     if(mode==='on')guardCallbackJSXNativeWindow(v.capture,phase,{...s.sitePolicy,page:run.pageId});
     else if(mode==='original')assert.equal(v.capture,null);
     else{assert.equal(v.capture.snapshot.links.length,0);assert.equal(v.capture.retention.frames,0);}
     v.completed=true;v.finishedAt=new Date().toISOString();r.phasesCompleted++;await save(mode+'-'+phase.id,v);await save('running',r);
    }
    r.modesCompleted++;
   }finally{try{await ops.closeMode(run);}catch(e){r.errors.push(safeError(e,'cleanup:'+mode));}await save(mode+'-closed',run);}
  }
 }catch(e){r.errors.push(safeError(e,r.currentStage??'run'));}
 finally{
  try{await ops.closeRoot(r);}catch(e){r.errors.push(safeError(e,'cleanup:root'));}
  try{r.inputsUnchanged=await ops.verifyInputs();assert.equal(r.inputsUnchanged,true);}catch(e){r.inputsUnchanged=false;r.errors.push(safeError(e,'inputs'));}
  r.qualification=classifyCallbackJSXNativeRun(r,s);r.status=r.qualification.status;
  if(ops.sourceControl)r.status=r.errors.length||r.qualification.failures.length?'SOURCE_CONTROL_INCOMPLETE_NOT_NATIVE_PROOF':'SOURCE_CONTROL_COMPLETED_NOT_NATIVE_PROOF';
  r.finishedAt=new Date().toISOString();await save('results',r);
 }
 return r;
}

export async function readCallbackJSXLoadedSource(session,{document,contexts,scripts,origin,mode,bundleHash,bootstrapHash}){
 const defaults=contexts.filter(c=>c.auxData?.frameId===document.frameId&&c.auxData?.isDefault===true&&c.origin===origin);assert.equal(defaults.length,1);const contextId=defaults[0].id;assert(Number.isSafeInteger(contextId)&&contextId>0);
 const read=async(url,expected)=>{const candidates=scripts.filter(s=>s.url===url&&s.executionContextId===contextId);assert.equal(candidates.length,1,'No unique exact current-context script');const parsed=candidates[0],actual=await ownedProcessDeadline(()=>session.send('Debugger.getScriptSource',{scriptId:parsed.scriptId}),5000,'METADATA_TIMEOUT');assert(typeof actual.scriptSource==='string'&&Buffer.byteLength(actual.scriptSource)<=8*1024*1024);assert.equal(hash(actual.scriptSource),expected,'Exact loaded source mismatch');return{scriptId:parsed.scriptId,executionContextId:contextId,url,sha256:expected};};
 const bundle=await read(origin+'/'+(mode==='original'?'original.js':'observed.js'),bundleHash),bootstrap=mode==='original'?null:await read('stateatom-owned://a0216/'+mode+'/bootstrap.js',bootstrapHash);
 return{schema:'stateatom.callback-jsx-loaded-source/1',status:'EXACT_LOADED_MAIN_BUNDLE_AND_BOOTSTRAP',frameId:document.frameId,targetId:document.targetId,browserContextId:document.browserContextId,executionContextId:contextId,bundle,bootstrap};
}
async function nodeIdentity(){return{executable:await fs.realpath(process.execPath),sha256:hash(await fs.readFile('/proc/self/exe')),version:process.version};}
async function hashes(files){const out={};for(const p of [...new Set(files)].sort())out[path.resolve(p)]=hash(await fs.readFile(p));return out;}
function localModules(){return Object.keys(createRequire(import.meta.url).cache).filter(p=>p.startsWith(root+'/node_modules/'));}
function ownCase(file){assert.equal(path.resolve(file),casePath);}
async function protectedInputs(){
 const r=await json(registrationFile);assert.equal(r.schema,'stateatom.callback-jsx-native-source-registration/1');assert.equal(Object.keys(r.sourceBefore).length,82);assert.equal(Object.keys(r.productInputs).length,327);assert.deepEqual(r.declaredResearchDeltas,[]);
 const inputs={};for(const group of ['sourceBefore','productInputs','L02Raw','protectedInputs','A0210Raw','A0211Raw','A0212Raw','A0213SourceDiagnosis','A0214Raw','A0215Raw','Main','exhaustedNativeCases'])Object.assign(inputs,r[group]);for(const v of r.V03Raw)inputs[path.resolve(v.file)]=v.sha256;
 await verifyCallbackJSXNativeInputs(inputs);return inputs;
}
export async function prepareCallbackJSXNativeCase(file,out){
 ownCase(file);out=path.resolve(out);assert(out.startsWith(outputPrefix));assert.equal(git(['status','--porcelain','--untracked-files=normal']),'','Commit driver source first');assert.equal(await fs.realpath(os.tmpdir()),'/tmp');await fs.lstat(file).then(()=>assert.fail('Case exists; preserve it'),e=>assert.equal(e.code,'ENOENT'));
 const inputs=await protectedInputs(),originalManifest=await json(upstream+'/SOURCE_SHA256.json'),upstreamRevision=(await fs.readFile(upstream+'/REVISION','utf8')).trim();assert.equal(Object.keys(originalManifest).length,28);assert.equal(upstreamRevision,'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');
 for(const[p,d]of Object.entries(originalManifest)){const f=path.resolve(upstream,p);assert(f.startsWith(upstream+'/'));assert.equal(hash(await fs.readFile(f)),d);inputs[f]=d;}
 const overlay=await buildCallbackJSXMainOverlay();Object.assign(inputs,overlay.physicalInputs);
 const node=await nodeIdentity(),executable=await fs.realpath(chromium.executablePath()),version=(await json(path.resolve('node_modules/playwright-core/browsers.json'))).browsers.find(x=>x.name==='chromium').browserVersion;
 const browser={executable,sha256:hash(await fs.readFile(executable)),version,headless:true,chromiumSandbox:true,args:[],timeout:20000};assert.equal(version,'153.0.8010.12');
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.mkdir(out,{mode:0o700});assert.equal(await fs.realpath(out),out);
 const write=async(name,contents)=>{const p=out+'/'+name;await fs.writeFile(p,contents,{flag:'wx'});inputs[p]=hash(contents);return p;},bundles={};
 for(const[name,b]of Object.entries(overlay.bundles)){const f=await write(name,b.contents);bundles[name]={file:f,sha256:b.sha256,bytes:b.bytes};}
 for(const[name,contents]of Object.entries(overlay.mainOutputs))await write(name,contents);await write('transformed-jsx.cjs',overlay.nativeJSXCode);
 for(const[name,meta]of Object.entries(overlay.metafiles))await write(name+'-metafile.json',JSON.stringify(meta,null,2)+'\n');
 const factoryFile=await write('observer-factory.js',overlay.factory),pagePrefix='a0216-'+path.basename(out),bootstrapDigests={};
 for(const mode of ['off','on']){const content=callbackJSXNativeBootstrap(overlay.factory,{page:pagePrefix+':'+mode,mode});await write(mode+'-bootstrap.js',content);bootstrapDigests[mode]=hash(content);}
 const ownFiles=[fileURLToPath(import.meta.url),'experiments/react19-reducer/callback-jsx-native-qualification.mjs','tests/engine/react19-callback-jsx-native-qualification.test.mjs','tests/engine/react19-callback-jsx-native-driver.test.mjs','experiments/browser-launch-witness.mjs','experiments/browser-launch-witness-run.mjs','experiments/owned-browser-process.mjs','experiments/owned-browser-process-run.mjs','docs/superpowers/specs/2026-10-25-a02-original-main-jsx-native-design.md','docs/superpowers/plans/2026-10-25-a02-original-main-jsx-native.md','package.json','package-lock.json','node_modules/playwright/package.json','node_modules/playwright-core/package.json','node_modules/playwright-core/browsers.json','node_modules/esbuild/package.json','node_modules/@esbuild/linux-x64/bin/esbuild',registrationFile,upstream+'/SOURCE_SHA256.json',upstream+'/REVISION',node.executable,executable,...localModules()];
 Object.assign(inputs,await hashes(ownFiles));
 const s={schema:'stateatom.callback-jsx-native-case/1',maximumNativeRuns:1,out,preparedAt:new Date().toISOString(),preparedAtRevision:git(['rev-parse','HEAD']),preparedDirty:false,upstreamRevision,originalManifest,pagePrefix,protocol:callbackJSXNativeProtocol(),profilePolicy:{root:'/tmp',prefix:'playwright_chromiumdev_profile-'},transport:{host:'127.0.0.1',port:0},node,browser,withExtension:false,withHelper:false,withIDE:false,productSupport:false,fullA02:false,sourceCounts:{priorResearch:82,productInputs:327,originalCorpus:28},sourceRegistrationSha256:hash(await fs.readFile(registrationFile)),sitePolicy:{mapSite:overlay.main.intervalSites[0],jsxSites:overlay.main.configSites},main:overlay.main,nativeJSX:overlay.nativeJSX,loadedInputs:overlay.loadedInputs,bundles,factory:{file:factoryFile,sha256:hash(overlay.factory)},bootstrapDigests,inputHashes:inputs};
 guardCallbackJSXNativeCase(s);await verifyCallbackJSXNativeInputs(inputs);await fs.writeFile(out+'/prepared.json',JSON.stringify({browserNotStarted:true,configuration:'Original retained source under automatic JSX/esbuild overlay; not original Webpack or installed Atom',case:s},null,2)+'\n',{flag:'wx'});await fs.writeFile(file,JSON.stringify(s,null,2)+'\n',{flag:'wx'});console.log('PREPARED_CALLBACK_JSX_MAIN_ONLY',file,Object.keys(inputs).length,'inputs; browser not started');return s;
}
export async function preflightCallbackJSXNativeCase(file){
 ownCase(file);const bytes=await fs.readFile(file),s=guardCallbackJSXNativeCase(JSON.parse(bytes));assert.equal(await fs.realpath(s.out),s.out);assert((await fs.lstat(s.out)).isDirectory()&&!(await fs.lstat(s.out)).isSymbolicLink());assert.deepEqual(await nodeIdentity(),s.node);assert.equal(s.browser.executable,await fs.realpath(chromium.executablePath()));assert.deepEqual(s.originalManifest,await json(upstream+'/SOURCE_SHA256.json'));assert.equal(hash(await fs.readFile(registrationFile)),s.sourceRegistrationSha256);
 const protectedNow=await protectedInputs();for(const[p,d]of Object.entries(protectedNow))assert.equal(s.inputHashes[p],d);
 for(const p of Object.keys(s.inputHashes))assert(p.startsWith(root+'/')||p===s.node.executable||p===s.browser.executable);
 assert.equal(hash(callbackJSXNativeFactory()),s.factory.sha256);for(const mode of ['off','on'])assert.equal(hash(callbackJSXNativeBootstrap(callbackJSXNativeFactory(),{page:s.pagePrefix+':'+mode,mode})),s.bootstrapDigests[mode]);
 const inputs={...await verifyCallbackJSXNativeInputs(s.inputHashes),[path.resolve(file)]:hash(bytes)};assert.deepEqual((await json(s.out+'/prepared.json')).case,s);return{s,inputs,caseSha256:hash(bytes)};
}
async function procState(pid,expectedStartTime){
 if(!Number.isSafeInteger(pid)||pid<=0)return{state:'Unknown',expectedStartTime};
 try{const raw=await fs.readFile('/proc/'+pid+'/stat','utf8');assert.equal(raw.slice(0,raw.indexOf(' ')),String(pid));const start=raw.slice(raw.lastIndexOf(')')+2).trim().split(/\s+/)[19];assert(/^\d+$/.test(start));return{pid,expectedStartTime,actualStartTime:start,state:expectedStartTime&&start!==expectedStartTime?'DifferentProcess':'Present'};}catch(e){return{pid,expectedStartTime,state:e.code==='ENOENT'?'Absent':'Unknown'};}
}
async function awaitExit(pid,start){let value;for(let i=0;i<100;i++){value=await procState(pid,start);if(['Absent','DifferentProcess'].includes(value.state))return value;await new Promise(resolve=>setTimeout(resolve,50));}return value;}
function createNativeOperations(s,inputs){
 const h={},modeHandles=new Map(),pending=new Set();let result,connectPromise;
 const save=async(name,value)=>fs.writeFile(s.out+'/'+name+'.json',JSON.stringify(value,null,2)+'\n',name==='running'?{}:{flag:'wx'});
 const acquire=(bag,key,fn,closeMethod='close',timeoutMs=5000)=>acquireCallbackJSXNativeHandle(bag,key,fn,{timeoutMs,closeMethod,onPending:p=>{pending.add(p);p.then(()=>pending.delete(p),()=>pending.delete(p));},onLate:ok=>{result.errors.push({stage:'late:'+key,code:ok?'LATE_HANDLE_CLOSED':'LATE_HANDLE_CLEANUP_UNKNOWN'});}});
 const session=()=>connectPromise??=(async()=>{
  const endpoint=h.owner.wsEndpoint(),u=new URL(endpoint);assert.equal(u.protocol,'ws:');assert.equal(u.hostname,'127.0.0.1');assert(!u.username&&!u.password&&!u.search&&!u.hash);
  await acquire(h,'client',()=>chromium.connect(endpoint,{timeout:10000}),'close',12000);assert.equal(h.client.contexts().length,0);await acquire(h,'browserSession',()=>h.client.newBrowserCDPSession(),'detach');return h.browserSession;
 })();
 const dom=page=>page.evaluate(()=>({texts:[...document.querySelectorAll('[data-testid="todo-item-label"]')].map(n=>n.textContent),checked:[...document.querySelectorAll('[data-testid="todo-item-toggle"]')].map(n=>n.checked)}));
 const waitDOM=(page,expected)=>page.waitForFunction(e=>JSON.stringify([...document.querySelectorAll('[data-testid="todo-item-label"]')].map(n=>n.textContent))===JSON.stringify(e.texts)&&JSON.stringify([...document.querySelectorAll('[data-testid="todo-item-toggle"]')].map(n=>n.checked))===JSON.stringify(e.checked),expected,{timeout:20000});
 async function documentFor(run){
  const m=modeHandles.get(run.mode),target=(await ownedProcessDeadline(()=>m.pageSession.send('Target.getTargetInfo'),5000,'METADATA_TIMEOUT')).targetInfo,tree=(await ownedProcessDeadline(()=>m.pageSession.send('Page.getFrameTree'),5000,'METADATA_TIMEOUT')).frameTree;
  assert.equal(target.type,'page');assert(!target.openerId&&!target.openerFrameId);assert.equal(m.context.pages().length,1);assert.equal(m.page.frames().length,1);assert.equal((tree.childFrames||[]).length,0);assert(!tree.frame.parentId);
  const u=new URL(tree.frame.url);assert.equal(u.origin,result.origin);assert.equal(u.pathname,'/');assert.equal(u.search,'?mode='+run.mode);assert(['','#/','#/active'].includes(u.hash));assert.equal(target.url,tree.frame.url);
  return{targetId:target.targetId,frameId:tree.frame.id,loaderId:tree.frame.loaderId,browserContextId:target.browserContextId,mainOnly:true};
 }
 return{
  sourceControl:false,bindResult:r=>{result=r;},save,
  async launch(){await acquire(h,'owner',()=>chromium.launchServer({executablePath:s.browser.executable,headless:true,chromiumSandbox:true,args:[],timeout:20000,host:'127.0.0.1',port:0}),'close',22000);},
  async readOwner(){const w=captureBrowserLaunchWitness(h.owner.process(),{...s.browser,profileRoot:'/tmp',profilePrefix:s.profilePolicy.prefix});result.launchProcess={pid:w.pid,expectedStartTime:null};const p=await procState(w.pid,null);if(p.actualStartTime)result.launchProcess.expectedStartTime=p.actualStartTime;return w;},
  async readProcess(){return collectOwnedBrowserProcess(await session(),s.browser);},
  async readPublic(policy){const cdp=await session(),version=await cdp.send('Browser.getVersion');result.startup.browserReportedProduct=version.product;assert(['Chrome/'+s.browser.version,'HeadlessChrome/'+s.browser.version].includes(version.product));await save('public-browser-protocol',{product:version.product,protocolVersion:version.protocolVersion});const targets=(await cdp.send('Target.getTargets')).targetInfos;assert(Array.isArray(targets)&&targets.length<=128);const pages=targets.filter(t=>t.type==='page'),extensions=targets.filter(t=>typeof t.url==='string'&&t.url.startsWith('chrome-extension://'));await save('public-initial-target-counts',{pages:pages.length,extensionTargets:extensions.length});assert.equal(pages.length,0);assert.equal(extensions.length,0);const line=await cdp.send('Browser.getBrowserCommandLine');return capturePublicCallbackJSXStartup(line.arguments,policy);},
  async readManaged(){return readManagedLaunchProfile(result.startup.owner.profile,s.profilePolicy);},
  async readVersion(){await session();return h.client.version();},
  async openHTTP(){
   const buffers={};for(const[name,b]of Object.entries(s.bundles)){const data=await fs.readFile(b.file);assert.equal(hash(data),b.sha256);buffers['/'+name]=data;}
   const server=createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1');result.traffic.push({method:req.method,ownedOrigin:true,path:Object.hasOwn(buffers,u.pathname)||['/','/favicon.ico'].includes(u.pathname)?u.pathname:undefined,pathDigest:hash(u.pathname)});res.setHeader('cache-control','no-store');if(req.method!=='GET'){res.writeHead(405).end();return;}if(u.pathname==='/favicon.ico'){res.writeHead(204).end();return;}if(u.pathname==='/'){const mode=u.searchParams.get('mode');if(!s.protocol.modes.includes(mode)){res.writeHead(400).end();return;}const bundle=mode==='original'?'original':'observed';res.setHeader('content-type','text/html; charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><title>Original Main JSX source experiment</title><link rel="stylesheet" href="/'+bundle+'.css"><div id="root"></div><script src="/'+bundle+'.js"></script>');return;}if(!Object.hasOwn(buffers,u.pathname)){res.writeHead(404).end();return;}res.setHeader('content-type',u.pathname.endsWith('.js')?'text/javascript':'text/css');res.end(buffers[u.pathname]);});h.httpServer=server;
   await ownedProcessDeadline(()=>new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);}),5000,'HANDLE_TIMEOUT');return{origin:'http://127.0.0.1:'+server.address().port};
  },
  async openMode(run){
   const m={contexts:new Map(),scripts:[]};modeHandles.set(run.mode,m);await acquire(m,'context',()=>h.client.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'}));assert.equal(m.context.pages().length,0);
   await m.context.route('**/*',async route=>{const request=route.request(),u=new URL(request.url());if(u.origin!==result.origin||request.method()!=='GET'){result.networkDenied.push({method:request.method(),urlDigest:hash(request.url())});await route.abort();}else await route.continue();});
   m.context.on('page',()=>{if(m.context.pages().length>1)result.errors.push({stage:run.mode,code:'EXTRA_PAGE'});});
   if(run.mode!=='original'){const bootstrap=await fs.readFile(s.out+'/'+run.mode+'-bootstrap.js','utf8');assert.equal(hash(bootstrap),s.bootstrapDigests[run.mode]);await m.context.addInitScript({content:bootstrap});}
   await acquire(m,'page',()=>m.context.newPage());m.page.setDefaultTimeout(20000);m.page.on('pageerror',e=>run.pageErrors.push({name:e.name,message:e.message}));m.page.on('console',message=>{if(['warning','error'].includes(message.type()))run.console.push({type:message.type(),text:message.text()});});
   await acquire(m,'pageSession',()=>m.context.newCDPSession(m.page),'detach');m.pageSession.on('Runtime.executionContextCreated',e=>{if(m.contexts.size>=32)result.errors.push({stage:run.mode,code:'CONTEXT_CAPACITY'});else m.contexts.set(e.context.id,e.context);});m.pageSession.on('Runtime.executionContextDestroyed',e=>m.contexts.delete(e.executionContextId));m.pageSession.on('Runtime.executionContextsCleared',()=>m.contexts.clear());
   m.pageSession.on('Debugger.scriptParsed',e=>{if(e.url===result.origin+'/'+(run.mode==='original'?'original.js':'observed.js')||e.url==='stateatom-owned://a0216/'+run.mode+'/bootstrap.js'){if(m.scripts.length>=16)result.errors.push({stage:run.mode,code:'SCRIPT_CAPACITY'});else m.scripts.push({scriptId:e.scriptId,url:e.url,executionContextId:e.executionContextId});}});
   await m.pageSession.send('Runtime.enable');await m.pageSession.send('Debugger.enable');await m.page.goto(result.origin+'/?mode='+run.mode,{waitUntil:'load',timeout:20000});await m.page.getByRole('textbox',{name:'New Todo Input'}).waitFor();run.document=await documentFor(run);
  },
  async setupMode(run){
   const m=modeHandles.get(run.mode);run.initialDom=await dom(m.page);assert.deepEqual(run.initialDom,{texts:[],checked:[]});const bundle=s.bundles[run.mode==='original'?'original.js':'observed.js'];
   run.sourceWitness=await readCallbackJSXLoadedSource(m.pageSession,{document:run.document,contexts:[...m.contexts.values()],scripts:m.scripts,origin:result.origin,mode:run.mode,bundleHash:bundle.sha256,bootstrapHash:s.bootstrapDigests[run.mode]});await save(run.mode+'-loaded-source',run.sourceWitness);
   const add=m.page.getByRole('textbox',{name:'New Todo Input'});await add.fill('SAME');await add.press('Enter');await waitDOM(m.page,s.protocol.setup);run.setup={dom:await dom(m.page),sourceWindowNotAccepted:true,observation:run.mode==='original'?null:await m.page.evaluate(()=>globalThis.__sa_callback_copy.sealWindow())};assert.deepEqual(await documentFor(run),run.document);
  },
  async performPhase(run,phase){
   const m=modeHandles.get(run.mode),page=m.page,add=page.getByRole('textbox',{name:'New Todo Input'});
   if(run.mode!=='original')await page.evaluate(label=>globalThis.__sa_callback_copy.startWindow(label),phase.id);
   if(phase.id==='equal'){await add.fill('SAME');await add.press('Enter');}
   else if(['same','changed'].includes(phase.id)){await page.locator('[data-testid="todo-item-label"]').first().dblclick();const edit=page.getByRole('textbox',{name:'Edit todo',exact:true});await edit.fill(phase.id==='same'?'SAME':'CHANGED');await edit.press('Enter');await edit.waitFor({state:'detached'});}
   else if(phase.id==='toggle')await page.locator('[data-testid="todo-item-toggle"]').first().check();
   else if(phase.id==='filtered')await page.locator('a[href="#/active"]').click();
   else{if(run.mode!=='original')await page.evaluate(()=>globalThis.__sa_callback_copy.stop());await add.fill('AFTER_STOP');await add.press('Enter');}
   await waitDOM(page,{texts:phase.texts,checked:phase.checked});
  },
  async capturePhase(run,phase,v){const m=modeHandles.get(run.mode);const values=await m.page.evaluate(()=>({dom:{texts:[...document.querySelectorAll('[data-testid="todo-item-label"]')].map(n=>n.textContent),checked:[...document.querySelectorAll('[data-testid="todo-item-toggle"]')].map(n=>n.checked)},capture:globalThis.__sa_callback_copy?.sealWindow()??null}));v.dom=values.dom;v.capture=values.capture;v.url= m.page.url();await save(run.mode+'-'+phase.id+'-before-document',v);v.document=await documentFor(run);},
  async closeMode(run){const m=modeHandles.get(run.mode);if(m)await closeLaunchWitnessHandles(m,run.cleanup,result.errors);},
  async closeRoot(r){
   await closeLaunchWitnessHandles(h,r.cleanup,r.errors);
   try{if(h.httpServer){await ownedProcessDeadline(()=>new Promise((resolve,reject)=>h.httpServer.close(e=>e?reject(e):resolve())),5000,'CLEANUP_TIMEOUT');r.cleanup.httpServer=true;}else r.cleanup.httpServer='not-started';}catch(e){r.cleanup.httpServer=false;r.errors.push(safeError(e,'cleanup:http'));}
   try{await ownedProcessDeadline(()=>Promise.allSettled([...pending]),5000,'CLEANUP_TIMEOUT');r.cleanup.pendingResources=pending.size===0;if(!r.cleanup.pendingResources)throw fault('CLEANUP_TIMEOUT');}catch(e){r.cleanup.pendingResources=false;r.errors.push(safeError(e,'cleanup:pending'));}
   const pid=r.startup.owner?.pid??r.launchProcess?.pid,start=r.startup.proc?.reported?.startTime??r.launchProcess?.expectedStartTime??null;r.cleanup.processExit=await awaitExit(pid,start);r.cleanup.ownerProcessExited=['Absent','DifferentProcess'].includes(r.cleanup.processExit.state);
   let removed=false;const profile=r.startup.owner?.profile;for(let i=0;typeof profile==='string'&&i<100;i++){try{await fs.lstat(profile);}catch(e){if(e.code==='ENOENT'){removed=true;break;}}await new Promise(resolve=>setTimeout(resolve,50));}r.cleanup.managedProfileRemoved=removed;
  },
  async verifyInputs(){await verifyCallbackJSXNativeInputs(inputs);for(const p of localModules())assert(Object.hasOwn(inputs,p),'Unregistered loaded Node module');return true;}
 };
}
export async function runCallbackJSXNativeCase(file){
 const{s,inputs,caseSha256}=await preflightCallbackJSXNativeCase(file);assert.equal(git(['status','--porcelain','--untracked-files=normal']),'','Commit frozen case first');
 await fs.writeFile(s.out+'/registered-before-browser.json',JSON.stringify({sourceRevision:git(['rev-parse','HEAD']),sourceDirty:false,caseSha256,case:s,inputsBefore:inputs,browserNotStarted:true},null,2)+'\n',{flag:'wx'});
 await fs.writeFile(s.out+'/native-run-started.json',JSON.stringify({at:new Date().toISOString(),driverPid:process.pid,maximumNativeRuns:1},null,2)+'\n',{flag:'wx'});
 const r=await runCallbackJSXNativeStages(s,createNativeOperations(s,inputs));console.log('CALLBACK_JSX_MAIN_NATIVE',r.status,s.out+'/results.json');process.exitCode=r.status==='PASS_BOUNDED_ORIGINAL_MAIN_CALLBACK_JSX_NOT_FULL_A02'?0:1;return r;
}
async function main(){const args=parseCallbackJSXNativeArgs(process.argv.slice(2));if(args.mode==='prepare')await prepareCallbackJSXNativeCase(args.caseFile,args.out);else if(args.mode==='preflight'){const r=await preflightCallbackJSXNativeCase(args.caseFile);console.log('PREFLIGHT_CALLBACK_JSX_MAIN_ONLY',Object.keys(r.inputs).length,'inputs; no browser');}else await runCallbackJSXNativeCase(args.caseFile);}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)main().catch(e=>{console.error('CALLBACK_JSX_NATIVE_DRIVER_ERROR',safeError(e,'main').code);process.exitCode=1;});
