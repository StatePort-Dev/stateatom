// SPDX-License-Identifier: Apache-2.0
// Resource-free source controls. No test launches a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import vm from 'node:vm';
import {parse} from '@babel/parser';
import {ownedProcessDeadline} from '../../experiments/owned-browser-process.mjs';
import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {createCallbackCopyObserver} from '../../experiments/react19-reducer/callback-copy-observer.mjs';
import {captureBrowserLaunchWitness} from '../../experiments/browser-launch-witness.mjs';
import {capturePublicCallbackJSXStartup,callbackJSXNativeProtocol} from '../../experiments/react19-reducer/callback-jsx-native-qualification.mjs';
import {parseCallbackJSXNativeArgs,buildCallbackJSXMainOverlay,callbackJSXNativeFactory,callbackJSXNativeBootstrap,guardCallbackJSXNativeCase,verifyCallbackJSXNativeInputs,runCallbackJSXNativeStages,acquireCallbackJSXNativeHandle,prepareCallbackJSXNativeCase,preflightCallbackJSXNativeCase,readCallbackJSXLoadedSource,callbackJSXNativeLaunchOptions,captureCallbackJSXAutomationRequest} from '../../experiments/react19-reducer/callback-jsx-native-run.mjs';
let overlayPromise;const sourceOverlay=()=>overlayPromise??=buildCallbackJSXMainOverlay();
const hash=s=>createHash('sha256').update(s).digest('hex'),copy=x=>JSON.parse(JSON.stringify(x));
test('explicit CLI prepare/preflight/run only; import and noargs never launch',()=>{for(const args of [[],['--unknown'],['--run'],['x','y'],['--prepare','--bad','out']])assert.throws(()=>parseCallbackJSXNativeArgs(args));assert.deepEqual(parseCallbackJSXNativeArgs(['case']),{mode:'run',caseFile:'case'});assert.deepEqual(parseCallbackJSXNativeArgs(['--preflight','case']),{mode:'preflight',caseFile:'case'});assert.deepEqual(parseCallbackJSXNativeArgs(['--prepare','case','out']),{mode:'prepare',caseFile:'case',out:'out'});});
test('current factory/bootstrap bytes are deterministic and explicit JSX profile with initially sealed collector',()=>{const f=callbackJSXNativeFactory();assert.match(f,/createJSXConfigInputObserver/);assert.match(f,/createPropCopyObserver/);assert.match(f,/inputProfile/);assert.equal(hash(f),hash(callbackJSXNativeFactory()));const on=callbackJSXNativeBootstrap(f,{page:'owned:on',mode:'on'}),off=callbackJSXNativeBootstrap(f,{page:'owned:off',mode:'off'});assert.match(on,/sealWindow/);assert.match(on,/__STATEATOM_REACT19_JSX_INPUT__/);assert.doesNotMatch(off,/defineProperty\(globalThis,"__STATEATOM_REACT19_JSX_INPUT__"/);assert.match(on,/sourceURL=stateatom-owned:\/\/a0216\/on\/bootstrap.js/);});
test('fixed originalMain source build pins actual retained Core/DOM/JSX, no application or browser execution',async()=>{const r=await sourceOverlay();assert.equal(r.sourceOnly,true);assert.equal(r.appExecuted,false);assert.equal(r.browserStarted,false);assert.equal(r.main.originalDigest,'09164b4bb70f4162ca2d32e3961133653fd0f9934244ba21eb85477218008a28');assert.equal(r.main.intervalSites.length,1);assert.equal(r.main.arraySites.length,2);assert.equal(r.main.configSites.length,2);assert.notEqual(r.main.configSites[0].id,r.main.configSites[1].id);assert.equal(r.nativeJSX.nativeVersionAdmitted,true);assert.equal(r.nativeJSX.sourceDigest,'dd50fd0db2fba44e0eee66243a45c81cfa3774cf41e4e6c0c080a601815c694d');assert.equal(r.loadedInputs.filter(x=>x.mode==='observed'&&x.transformed).length,2);assert(r.loadedInputs.some(x=>x.file.endsWith('/react-dom/cjs/react-dom-client.development.js')));for(const x of r.loadedInputs)if(x.file.includes('/node_modules/react/'))assert(x.file.startsWith(path.resolve('.runtime/todomvc/examples/react')+'/'));assert.deepEqual(Object.keys(r.bundles).sort(),['observed.css','observed.js','original.css','original.js']);for(const b of Object.values(r.bundles))assert.equal(hash(b.contents),b.sha256);});
test('frozen input verification rejects missing/changed bytes without replacing expected hashes',async()=>{const dir=await mkdtemp('/tmp/a0216-source-input-');try{const file=dir+'/owned.txt';await writeFile(file,'before');const expected={[file]:hash('before')};assert.deepEqual(await verifyCallbackJSXNativeInputs(expected),expected);await writeFile(file,'after');await assert.rejects(verifyCallbackJSXNativeInputs(expected));assert.equal(expected[file],hash('before'));await rm(file);await assert.rejects(verifyCallbackJSXNativeInputs(expected));}finally{await rm(dir,{recursive:true,force:true});}});
test('native case requires exact fixed scope before resources',()=>{for(const s of [null,{}, {schema:'stateatom.callback-jsx-native-case/1'}])assert.throws(()=>guardCallbackJSXNativeCase(s));});

const mapSite={id:'owned-map',file:'owned-main.jsx',sourceDigest:'a'.repeat(64),kind:'map',line:1,column:1,endLine:1,endColumn:90},jsxSite={id:'owned-jsx',file:'compiled-main.js',sourceDigest:'b'.repeat(64),line:1,column:1,endLine:1,endColumn:60};
const policy={executable:'/owned/chrome',sha256:'c'.repeat(64),profile:'/tmp/playwright_chromiumdev_profile-control1',browserVersion:'153.0.8010.12'};
function sourceOps({fail=null,latePublic=false}={}){
 const saved=[],calls=[],observers=new Map(),s={protocol:callbackJSXNativeProtocol(),sitePolicy:{mapSite,jsxSites:[jsxSite]},pagePrefix:'owned-source-driver',bundles:{'original.js':{sha256:'e'.repeat(64)},'observed.js':{sha256:'f'.repeat(64)}},bootstrapDigests:{off:'d'.repeat(64),on:'c'.repeat(64)},preparedAtRevision:'d'.repeat(40),browser:{executable:policy.executable,sha256:policy.sha256,version:policy.browserVersion},profilePolicy:{root:'/tmp',prefix:'playwright_chromiumdev_profile-'}};
 const proc={pid:222,startTime:'1234',startTimeStable:true,procExe:policy.executable,sha256:policy.sha256,errors:[],argumentCount:1,profileOptions:[],headless:false,forbiddenFlags:[]};
 const publicArgs=[policy.executable,'--headless','--enable-automation','--user-data-dir='+policy.profile];
 const owner=captureBrowserLaunchWitness({pid:222,spawnfile:policy.executable,spawnargs:publicArgs,exitCode:null,signalCode:null},{...policy,profileRoot:'/tmp',profilePrefix:'playwright_chromiumdev_profile-'});
 const ops={sourceControl:true,timeoutMs:20,
  async save(name,value){saved.push({name,value:copy(value)});},
  async launch(){calls.push('launch');if(fail==='launch')throw Object.assign(Error('private-owned'),{code:'CONTROL_FAIL'});return{owner};},
  async readOwner(){return owner;},
  async readProcess(){return{schema:'stateatom.owned-browser-process-facts/1',driverPid:111,reportedBrowserPids:[222],reported:proc,directChildren:[copy(proc)],errors:[]};},
  async readPublic(expected){if(latePublic)await delay(60);if(fail==='public')throw Object.assign(Error('private-owned'),{code:'CONTROL_FAIL'});return capturePublicCallbackJSXStartup(publicArgs,expected);},
  async readManaged(){return{realPath:policy.profile,isDirectory:true,isSymbolicLink:false,errors:[]};},
  async readVersion(){return policy.browserVersion;},
  async openHTTP(){calls.push('http');return{origin:'http://127.0.0.1:12345'};},
  async openMode(run){calls.push('open:'+run.mode);if(run.mode!=='original'){const o=createCallbackCopyObserver({page:run.pageId,enabled:run.mode==='on',inputProfile:'jsx-config'});o.sealWindow();observers.set(run.mode,o);}run.document={targetId:'target-'+run.mode,frameId:'frame-'+run.mode,loaderId:'loader-'+run.mode,browserContextId:'context-'+run.mode,mainOnly:true};},
  async setupMode(run){run.initialDom={texts:[],checked:[]};run.setup={dom:s.protocol.setup,sourceWindowNotAccepted:true,observation:run.mode==='original'?null:observers.get(run.mode).sealWindow()};run.sourceWitness={sourceControl:true,schema:'stateatom.callback-jsx-loaded-source/1',status:'EXACT_LOADED_MAIN_BUNDLE_AND_BOOTSTRAP',frameId:run.document.frameId,targetId:run.document.targetId,browserContextId:run.document.browserContextId,executionContextId:1,bundle:{scriptId:'bundle',executionContextId:1,sha256:s.bundles[run.mode==='original'?'original.js':'observed.js'].sha256,url:'http://127.0.0.1:12345/'+(run.mode==='original'?'original.js':'observed.js')},bootstrap:run.mode==='original'?null:{scriptId:'bootstrap',executionContextId:1,sha256:s.bootstrapDigests[run.mode],url:'stateatom-owned://a0216/'+run.mode+'/bootstrap.js'}};},
  async performPhase(run,phase){calls.push(run.mode+':'+phase.id);if(fail==='action'&&run.mode==='on'&&phase.id==='changed')throw Object.assign(Error('private-owned'),{code:'CONTROL_FAIL'});const o=observers.get(run.mode);if(!o)return;o.startWindow(phase.id);if(phase.id==='stopped'){o.stop();return;}if(run.mode!=='on')return;const items=Array.from({length:phase.rowCount},()=>({})),token=o.arrayRuntime.begin(Array.prototype.map,items,mapSite);for(let i=0;i<items.length;i++){const frame=o.enter(token,mapSite,items[i],i,items),config={},element={};o.tap('config-input',items[i],config,jsxSite);o.tap('jsx-element-return',element,config);o.returned(frame,element);o.exit(frame);}o.arrayRuntime.finish(token,[]);},
  async capturePhase(run,phase,record){record.dom={texts:phase.texts,checked:phase.checked};if(fail==='document'&&run.mode==='on'&&phase.id==='changed')throw Object.assign(Error('private-owned'),{code:'CONTROL_FAIL'});record.document=copy(run.document);record.capture=run.mode==='original'?null:observers.get(run.mode).sealWindow();},
  async closeMode(run){calls.push('close:'+run.mode);run.cleanup={pageSession:true,page:true,context:true};if(fail==='mode-close'&&run.mode==='on'){run.cleanup.page=false;throw Object.assign(Error('private-owned'),{code:'CONTROL_FAIL'});}},
  async closeRoot(r){calls.push('close-root');r.cleanup={browserSession:true,client:true,owner:true,httpServer:true,ownerKill:'not-needed',ownerProcessExited:true,managedProfileRemoved:true,pendingResources:true};r.traffic=[{method:'GET',ownedOrigin:true}];},
  async verifyInputs(){return true;}
 };
 return{s,ops,saved,calls};
}
test('complete injected orchestration is explicitly SOURCE_CONTROL_NOT_NATIVE_PROOF',async()=>{const{s,ops,saved,calls}=sourceOps(),r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.execution,'SOURCE_CONTROL_NOT_NATIVE_PROOF');assert.equal(r.status,'SOURCE_CONTROL_COMPLETED_NOT_NATIVE_PROOF');assert.equal(r.actualBrowserStarted,false);assert.equal(r.phasesCompleted,18);assert.equal(r.modesCompleted,3);assert.equal(calls.filter(x=>x==='launch').length,1);assert(saved.some(x=>x.name==='owner-before-admission'));assert.equal(calls.at(-1),'close-root');});
test('startup failure keeps original owner/process and attempts independent remaining facts, no app/HTTP/retry',async()=>{const{s,ops,calls}=sourceOps({fail:'public'}),r=await runCallbackJSXNativeStages(s,ops);assert(r.startup.owner);assert(r.startup.proc);assert(r.startup.managedProfile);assert.equal(r.modesStarted,0);assert.equal(r.browserLaunchesStarted,1);assert.equal(calls.includes('http'),false);assert.equal(calls.filter(x=>x==='launch').length,1);assert.equal(calls.at(-1),'close-root');assert.doesNotMatch(JSON.stringify(r),/private-owned/);});
test('action failure retains prior completed modes and exact incomplete current phase',async()=>{const{s,ops,calls}=sourceOps({fail:'action'}),r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.modesCompleted,2);assert.equal(r.phasesCompleted,14);assert.equal(r.phasesStarted,15);assert.equal(r.runs[2].phases[2].id,'changed');assert.equal(r.runs[2].phases[2].completed,false);assert.equal(calls.at(-2),'close:on');assert.equal(calls.at(-1),'close-root');});
test('post-DOM document failure preserves already captured DOM, no completed-phase fabrication',async()=>{const{s,ops}=sourceOps({fail:'document'}),r=await runCallbackJSXNativeStages(s,ops),p=r.runs[2].phases[2];assert.deepEqual(p.dom,{texts:['CHANGED','SAME'],checked:[false,false]});assert.equal(p.completed,false);assert.equal(r.phasesCompleted,14);});
test('mode cleanup failure cannot prevent independent root cleanup',async()=>{const{s,ops,calls}=sourceOps({fail:'mode-close'}),r=await runCallbackJSXNativeStages(s,ops);assert.equal(calls.at(-1),'close-root');assert.equal(r.cleanup.owner,true);assert.equal(r.status,'SOURCE_CONTROL_INCOMPLETE_NOT_NATIVE_PROOF');});
test('launch failure makes one attempt, no app and mandatory root finalization',async()=>{const{s,ops,calls}=sourceOps({fail:'launch'}),r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.browserLaunchesStarted,1);assert.equal(r.browserLaunchesCompleted,0);assert.equal(r.modesStarted,0);assert.equal(calls.at(-1),'close-root');});
test('late public reply cannot revive a failed startup or enter application stages',async()=>{const{s,ops,calls}=sourceOps({latePublic:true}),r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.modesStarted,0);assert.equal(r.startup.publicReport,null);await delay(70);assert.equal(r.modesStarted,0);assert.equal(r.startup.publicReport,null);assert.equal(calls.includes('http'),false);});
test('resource handle returned after deadline closes itself and never becomes active',async()=>{const handles={};let closed=0;await assert.rejects(acquireCallbackJSXNativeHandle(handles,'page',async()=>{await delay(30);return{close:async()=>{closed++;}};},{timeoutMs:5}));await delay(45);assert.equal(handles.page,undefined);assert.equal(closed,1);});

test('prepare/preflight cannot use another case path or output before source/resources',async()=>{await assert.rejects(prepareCallbackJSXNativeCase('/tmp/foreign-case','/tmp/foreign-out'));await assert.rejects(preflightCallbackJSXNativeCase('/tmp/foreign-case'));});
function loadedFixture(){
 const bundle='owned bundle bytes',bootstrap='owned bootstrap bytes',origin='http://127.0.0.1:12345',doc={targetId:'target',frameId:'frame',browserContextId:'context',loaderId:'loader',mainOnly:true},calls=[];
 const options={document:doc,contexts:[{id:7,origin,auxData:{frameId:'frame',isDefault:true}}],scripts:[{scriptId:'bundle',url:origin+'/observed.js',executionContextId:7},{scriptId:'bootstrap',url:'stateatom-owned://a0216/on/bootstrap.js',executionContextId:7}],origin,mode:'on',bundleHash:hash(bundle),bootstrapHash:hash(bootstrap)};
 const session={async send(method,params){calls.push({method,params});assert.equal(method,'Debugger.getScriptSource');return{scriptSource:params.scriptId==='bundle'?bundle:bootstrap};}};
 return{options,session,calls};
}
test('loaded source binds exact bytes and same current default frame context, no Runtime.evaluate',async()=>{const{options,session,calls}=loadedFixture(),w=await readCallbackJSXLoadedSource(session,options);assert.equal(w.status,'EXACT_LOADED_MAIN_BUNDLE_AND_BOOTSTRAP');assert.equal(w.executionContextId,7);assert.equal(w.bundle.sha256,options.bundleHash);assert.equal(w.bootstrap.executionContextId,7);assert.equal(calls.length,2);});
for(const[name,mutate]of [
 ['bundle digest',x=>x.options.bundleHash='0'.repeat(64)],
 ['bootstrap digest',x=>x.options.bootstrapHash='0'.repeat(64)],
 ['foreign context',x=>x.options.scripts[1].executionContextId=999],
 ['duplicate script',x=>x.options.scripts.push({...x.options.scripts[0]})],
 ['foreign frame',x=>x.options.contexts[0].auxData.frameId='foreign'],
 ['two default contexts',x=>x.options.contexts.push({...x.options.contexts[0],id:8})]
])test('loaded script refuses '+name+' without nearest-source substitution',async()=>{const x=loadedFixture();mutate(x);await assert.rejects(readCallbackJSXLoadedSource(x.session,x.options));});
test('late CDP session is detached and pending disposal is observable',async()=>{const handles={},pending=[];let detached=0;await assert.rejects(acquireCallbackJSXNativeHandle(handles,'session',async()=>{await delay(20);return{detach:async()=>{detached++;}};},{timeoutMs:5,closeMethod:'detach',onPending:p=>pending.push(p)}));assert.equal(pending.length,1);await Promise.allSettled(pending);assert.equal(handles.session,undefined);assert.equal(detached,1);});
test('failed phase records the precise operation stage without exposing its private message',async()=>{const{s,ops}=sourceOps({fail:'action'}),r=await runCallbackJSXNativeStages(s,ops);assert(r.errors.some(e=>e.stage==='on:changed:perform'));assert.doesNotMatch(JSON.stringify(r.errors),/private-owned/);});

async function validSourceCase(version=1){
 const r=await sourceOverlay(),out=path.resolve(version===4?'.artifacts/a02/callback-jsx-main-literal-native/source-fixture':version===3?'.artifacts/a02/callback-jsx-main-fragment-native/source-fixture':version===2?'.artifacts/a02/callback-jsx-main-automation-native/source-fixture':'.artifacts/a02/callback-jsx-main-native/source-fixture'),pagePrefix='source-fixture',factory=callbackJSXNativeFactory(),sourceRegistration=path.resolve(version===4?'.artifacts/a02/callback-jsx-literal-source/2026-10-25/registration.json':version===3?'.artifacts/a02/callback-jsx-fragment-source/2026-10-25/registration.json':version===2?'.artifacts/a02/callback-jsx-explicit-source/2026-10-25/registration.json':'.artifacts/a02/callback-jsx-native-source/2026-10-25/registration.json'),inputHashes={...r.physicalInputs},sourceRegistrationSha256=hash(await readFile(sourceRegistration));
 const bundles={};for(const[name,b]of Object.entries(r.bundles)){bundles[name]={file:out+'/'+name,sha256:b.sha256,bytes:b.bytes};inputHashes[out+'/'+name]=b.sha256;}
 inputHashes[out+'/observer-factory.js']=hash(factory);inputHashes['/owned/chrome']='1'.repeat(64);inputHashes['/owned/node']='2'.repeat(64);inputHashes[sourceRegistration]=sourceRegistrationSha256;inputHashes[out+'/main-config.js']=r.main.configDigest;inputHashes[out+'/transformed-jsx.cjs']=r.nativeJSX.outputDigest;
 const bootstrapDigests={};for(const mode of ['off','on']){bootstrapDigests[mode]=hash(callbackJSXNativeBootstrap(factory,{page:pagePrefix+':'+mode,mode}));inputHashes[out+'/'+mode+'-bootstrap.js']=bootstrapDigests[mode];}
 return{schema:version===4?'stateatom.callback-jsx-native-case/4':version===3?'stateatom.callback-jsx-native-case/3':version===2?'stateatom.callback-jsx-native-case/2':'stateatom.callback-jsx-native-case/1',maximumNativeRuns:1,out,preparedAtRevision:'d'.repeat(40),preparedDirty:false,upstreamRevision:'ff43b02e59dfa604386bb382034b2cd07c2bcd8a',originalManifest:JSON.parse(await readFile('.runtime/todomvc/SOURCE_SHA256.json','utf8')),pagePrefix,protocol:callbackJSXNativeProtocol(),profilePolicy:{root:'/tmp',prefix:'playwright_chromiumdev_profile-'},transport:{host:'127.0.0.1',port:0},node:{executable:'/owned/node',sha256:'2'.repeat(64),version:process.version},browser:{executable:'/owned/chrome',sha256:'1'.repeat(64),version:'153.0.8010.12',headless:true,chromiumSandbox:true,args:version>=2?['--enable-automation']:[],timeout:20000},withExtension:false,withHelper:false,withIDE:false,productSupport:false,fullA02:false,sourceCounts:{priorResearch:version>=2?86:82,productInputs:327,originalCorpus:28},sourceRegistrationSha256,sitePolicy:{mapSite:r.main.intervalSites[0],jsxSites:r.main.configSites},main:r.main,nativeJSX:r.nativeJSX,loadedInputs:r.loadedInputs,bundles,factory:{file:out+'/observer-factory.js',sha256:hash(factory)},bootstrapDigests,inputHashes};
}
test('resource-free case shape is constructed from actual current source build receipts',async()=>{const s=await validSourceCase();assert.doesNotThrow(()=>guardCallbackJSXNativeCase(s));});

for(const[name,mutate]of [
 ['browser binary omitted',s=>delete s.inputHashes[s.browser.executable]],
 ['native JSX input omitted',s=>delete s.inputHashes[path.resolve('.runtime/todomvc/examples/react/node_modules/react/cjs/react-jsx-runtime.development.js')]],
 ['Main compiler bytes contradicted',s=>s.loadedInputs.find(x=>x.mode==='observed'&&x.file.endsWith('/components/main.jsx')).compilerInputSha256='0'.repeat(64)],
 ['unchanged compiler bytes contradicted',s=>s.loadedInputs.find(x=>!x.transformed).compilerInputSha256='0'.repeat(64)],
 ['bootstrap input omitted',s=>delete s.inputHashes[s.out+'/on-bootstrap.js']],
 ['foreign compiler input',s=>s.loadedInputs[0].file='/foreign/input.js'],
 ['native JSX output contradicted',s=>s.nativeJSX.outputDigest='0'.repeat(64)],
 ['array site list omitted',s=>s.main.arraySites=[]],
 ['config source contradicted',s=>{s.main.configSites[0].sourceDigest='0'.repeat(64);s.sitePolicy.jsxSites[0].sourceDigest='0'.repeat(64);}],
 ['callback source contradicted',s=>{s.main.intervalSites[0].sourceDigest='0'.repeat(64);s.sitePolicy.mapSite.sourceDigest='0'.repeat(64);}]
])test('case rejects '+name+' before native resources',async()=>{const s=copy(await validSourceCase());mutate(s);assert.throws(()=>guardCallbackJSXNativeCase(s));});
test('launch refusal retains safe OS diagnostic codes and digest without persisting private endpoint or raw message',async()=>{const{s,ops}=sourceOps();ops.launch=async()=>{throw Error('private-owned ws://127.0.0.1:1234/private-key Failed to move to a new namespace: Operation not permitted');};const r=await runCallbackJSXNativeStages(s,ops),e=r.errors.find(e=>e.stage==='launch');assert(e);assert(e.diagnostics.includes('NAMESPACE_UNAVAILABLE'));assert(e.diagnostics.includes('OPERATION_NOT_PERMITTED'));assert.match(e.messageDigest,/^[a-f0-9]{64}$/);assert.doesNotMatch(JSON.stringify(r),/private-owned|private-key|127[.]0[.]0[.]1:1234/);});

// Final ONE review correction pass I1/I3. All injected source controls, no browser.
for(const operation of ['openMode','setupMode','performPhase','capturePhase'])test('I1 unresolved '+operation+' still reaches final refusal and cleanup within its deadline',async()=>{
 const{s,ops,calls}=sourceOps();let release,entered=false;const original=ops[operation];
 ops[operation]=async(...args)=>{if(!entered){entered=true;await new Promise(resolve=>{release=resolve;});}return original(...args);};
 let settled=false;const pending=runCallbackJSXNativeStages(s,ops).then(r=>{settled=true;return r;});
 await delay(120);const cleanupBeforeRelease=calls.includes('close-root'),settledBeforeRelease=settled;release?.();const r=await pending;
 assert.equal(cleanupBeforeRelease,true);assert.equal(settledBeforeRelease,true);assert.equal(r.status,'SOURCE_CONTROL_INCOMPLETE_NOT_NATIVE_PROOF');assert(r.errors.some(e=>e.code==='STAGE_TIMEOUT'));
 const completed=r.phasesCompleted;await delay(10);assert.equal(r.phasesCompleted,completed);
});
test('I1 handle completing inside its own deadline but after outer lease closes is disposed, not activated',async()=>{const handles={},lease={active:true};let closed=0;const pending=acquireCallbackJSXNativeHandle(handles,'page',async()=>{await delay(30);return{close:async()=>{closed++;}};},{timeoutMs:100,isActive:()=>lease.active});await delay(5);lease.active=false;await pending;assert.equal(handles.page,undefined);assert.equal(closed,1);});
test('I3 setup failure retains already established execution milestones',async()=>{const{s,ops}=sourceOps(),original=ops.setupMode;ops.setupMode=async run=>{await original(run);run.setup=null;run.executionMilestones={appExecuted:true,ReactDOMExecuted:true,originalMainExecuted:true};throw Object.assign(Error('private-owned'),{code:'CONTROL_FAIL'});};const r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.appExecuted,true);assert.equal(r.ReactDOMExecuted,true);assert.equal(r.originalMainExecuted,true);assert.equal(r.phasesStarted,0);});
test('I3 navigation with incomplete source attribution is Unknown rather than false',async()=>{const{s,ops}=sourceOps();ops.setupMode=async run=>{run.executionMilestones={appExecuted:true,ReactDOMExecuted:'Unknown/Unsupported',originalMainExecuted:'Unknown/Unsupported'};throw Object.assign(Error('private-owned'),{code:'CONTROL_FAIL'});};const r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.appExecuted,true);assert.equal(r.ReactDOMExecuted,'Unknown/Unsupported');assert.equal(r.originalMainExecuted,'Unknown/Unsupported');});
test('I3 explicit pre-navigation failure can still truthfully retain no app execution',async()=>{const{s,ops}=sourceOps();ops.openMode=async run=>{run.executionMilestones={appExecuted:false,ReactDOMExecuted:false,originalMainExecuted:false};throw Object.assign(Error('private-owned'),{code:'CONTROL_FAIL'});};const r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.appExecuted,false);assert.equal(r.ReactDOMExecuted,false);assert.equal(r.originalMainExecuted,false);});


// A02.17: closed explicit observability input, never a generic launch flag API.
test('schema2 delivers exactly the required flag while schema1 retains empty args',async()=>{const v1=await validSourceCase(),v2=await validSourceCase(2);assert.doesNotThrow(()=>guardCallbackJSXNativeCase(v1));assert.doesNotThrow(()=>guardCallbackJSXNativeCase(v2));const a=callbackJSXNativeLaunchOptions(v1),b=callbackJSXNativeLaunchOptions(v2);assert.deepEqual(a.args,[]);assert.deepEqual(b.args,['--enable-automation']);assert.equal(b.chromiumSandbox,true);assert.equal(b.headless,true);assert.equal(b.host,'127.0.0.1');assert.equal(b.port,0);assert.equal(b.executablePath,v2.browser.executable);b.args.push('not-owned');assert.deepEqual(v2.browser.args,['--enable-automation']);});
for(const args of [[],['--enable-automation','--enable-automation'],['--enable-automation=false'],['--no-sandbox'],['--enable-automation','--ignore-certificate-errors']])test('schema2 refuses alternate argv '+JSON.stringify(args),async()=>{const s=copy(await validSourceCase(2));s.browser.args=args;assert.throws(()=>guardCallbackJSXNativeCase(s));assert.throws(()=>callbackJSXNativeLaunchOptions(s));});
test('v2 cannot borrow legacy output/registration or change prior-source count',async()=>{const source=await validSourceCase(2);for(const mutate of [s=>s.out=s.out.replace('callback-jsx-main-automation-native','callback-jsx-main-native'),s=>s.sourceCounts.priorResearch=82,s=>s.sourceRegistrationSha256='0'.repeat(64)]){const s=copy(source);mutate(s);assert.throws(()=>guardCallbackJSXNativeCase(s));}});
function originalArgumentFixture(args=['--headless','--enable-automation','--user-data-dir='+policy.profile]){const child={pid:222,spawnfile:policy.executable,spawnargs:[policy.executable,...args],exitCode:null,signalCode:null},owner=captureBrowserLaunchWitness(child,{...policy,profileRoot:'/tmp',profilePrefix:'playwright_chromiumdev_profile-'});return{child,owner};}
test('original requested-argument receipt has own source/PID/digest without raw argv',()=>{const{child,owner}=originalArgumentFixture(),r=captureCallbackJSXAutomationRequest(child,owner);assert.equal(r.status,'REQUIRED_AUTOMATION_ARGUMENT_OBSERVED');assert.equal(r.source,'BrowserServer.process().spawnargs');assert.equal(r.pid,owner.pid);assert.equal(r.vectorDigest,owner.vectorDigest);assert.equal(r.argumentCount,owner.argumentCount);assert.equal(r.automationOptionCount,1);assert.equal(r.automationExact,true);assert.equal(r.arguments,undefined);assert(Object.isFrozen(r));});
for(const[name,mutate]of [
 ['missing',f=>f.child.spawnargs=f.child.spawnargs.filter(a=>a!=='--enable-automation')],
 ['duplicate',f=>f.child.spawnargs.push('--enable-automation')],
 ['false',f=>f.child.spawnargs=f.child.spawnargs.map(a=>a==='--enable-automation'?'--enable-automation=false':a)],
 ['wrong PID',f=>f.child.pid=333],
 ['wrong vector',f=>f.owner={...f.owner,vectorDigest:'0'.repeat(64)}],
 ['invalid owner',f=>f.owner={...f.owner,status:'UNSUPPORTED_ORIGINAL_INVOCATION'}],
 ['non-array',f=>f.child.spawnargs={}],
 ['non-string',f=>f.child.spawnargs.push(1)]
])test('original delivery receipt refuses '+name,()=>{const f=originalArgumentFixture();mutate(f);assert.equal(captureCallbackJSXAutomationRequest(f.child,f.owner).status,'REQUIRED_AUTOMATION_ARGUMENT_REFUSED');});
test('original argument metadata getters are not invoked or persisted',()=>{for(const type of ['child','argument']){let reads=0;const f=originalArgumentFixture();if(type==='child')Object.defineProperty(f.child,'spawnargs',{get(){reads++;return[];}});else Object.defineProperty(f.child.spawnargs,1,{get(){reads++;return '--enable-automation';}});assert.equal(captureCallbackJSXAutomationRequest(f.child,f.owner).status,'REQUIRED_AUTOMATION_ARGUMENT_REFUSED');assert.equal(reads,0);}});
test('private original argument values never enter the sanitized receipt',()=>{const{child,owner}=originalArgumentFixture(['--headless','--enable-automation','--user-data-dir='+policy.profile,'--private=private-owned']);assert.doesNotMatch(JSON.stringify(captureCallbackJSXAutomationRequest(child,owner)),/private-owned/);});
test('v2 delivery refusal stops before process/publicAPI/HTTP/app with no launch retry',async()=>{const{s,ops,calls}=sourceOps();s.schema='stateatom.callback-jsx-native-case/2';let processReads=0;ops.readProcess=async()=>{processReads++;throw Error();};ops.readRequestedAutomation=async()=>({status:'REQUIRED_AUTOMATION_ARGUMENT_REFUSED',errors:['CONTROL']});const r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.startup.requestedAutomation.status,'REQUIRED_AUTOMATION_ARGUMENT_REFUSED');assert.equal(processReads,0);assert.equal(calls.includes('http'),false);assert.equal(r.modesStarted,0);assert.equal(r.browserLaunchesStarted,1);assert.equal(calls.at(-1),'close-root');});
test('legacy schema1 never borrows the explicit v2 argument',async()=>{const s=copy(await validSourceCase());s.browser.args=['--enable-automation'];assert.throws(()=>guardCallbackJSXNativeCase(s));assert.throws(()=>callbackJSXNativeLaunchOptions(s));});
test('v2 valid original receipt precedes process/public/app stages in source control',async()=>{const{s,ops,calls}=sourceOps();s.schema='stateatom.callback-jsx-native-case/2';const readProcess=ops.readProcess;ops.readRequestedAutomation=async owner=>{calls.push('requested-argument');const child={pid:owner.pid,spawnargs:[owner.executable,'--headless','--enable-automation','--user-data-dir='+owner.profile]};return captureCallbackJSXAutomationRequest(child,owner);};ops.readProcess=async()=>{calls.push('process-read');return readProcess();};const r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.status,'SOURCE_CONTROL_COMPLETED_NOT_NATIVE_PROOF');assert(calls.indexOf('requested-argument')<calls.indexOf('process-read'));assert(calls.indexOf('process-read')<calls.indexOf('http'));assert.equal(r.startup.requestedAutomation.source,'BrowserServer.process().spawnargs');assert.equal(r.phasesCompleted,18);assert.equal(r.actualBrowserStarted,false);});


// ONE final A02.17 review I1: execute the actual private documentFor body.
async function actualDocumentControl({fragment,includeFragment=true,targetOverride}={}){
 const module=await import('../../experiments/react19-reducer/callback-jsx-native-run.mjs'),source=await readFile('experiments/react19-reducer/callback-jsx-native-run.mjs','utf8'),ast=parse(source,{sourceType:'module'}),owner=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='createNativeOperations'),fn=owner.body.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='documentFor');
 assert(fn);const origin='http://127.0.0.1:44513',base=origin+'/?mode=original',full=base+(fragment??''),target={type:'page',targetId:'target',browserContextId:'context',url:targetOverride??full},frame={id:'frame',loaderId:'loader',url:base};if(includeFragment)frame.urlFragment=fragment;
 const m={pageSession:{async send(name){if(name==='Target.getTargetInfo')return{targetInfo:target};if(name==='Page.getFrameTree')return{frameTree:{frame}};throw Error('Unexpected source-control method');}},context:{pages(){return[{}];}},page:{frames(){return[{}];},url(){return full;}}};
 const c=vm.createContext({URL,assert,modeHandles:new Map([['original',m]]),result:{origin},activeLease(lease){assert.equal(lease.active,true);},activeStep:async(lease,task)=>{assert.equal(lease.active,true);return task();},ownedProcessDeadline,qualifyCallbackJSXFrameURL:module.qualifyCallbackJSXFrameURL});
 const run={mode:'original'},facts={},call=new vm.Script('('+source.slice(fn.start,fn.end)+')').runInContext(c);return{run,facts,invoke:()=>call(run,{active:true},facts)};
}
test('I1 actual documentFor accepts a conforming separate fragment while preserving IDs',async()=>{const c=await actualDocumentControl({fragment:'#/active'}),d=await c.invoke();assert.deepEqual(copy(d),{targetId:'target',frameId:'frame',loaderId:'loader',browserContextId:'context',mainOnly:true});});
test('I1 actual documentFor baseline without fragment still works',async()=>{const c=await actualDocumentControl({includeFragment:false});assert.equal((await c.invoke()).mainOnly,true);});

test('I1 refused actual document keeps explicit CDP URL facts without changing identity',async()=>{
 const c=await actualDocumentControl({fragment:'#/active',targetOverride:'http://127.0.0.1:44513/?mode=original#/wrong'});
 await assert.rejects(c.invoke());
 assert.equal(c.facts.frameURL,'http://127.0.0.1:44513/?mode=original');
 assert.equal(c.facts.urlFragment,'#/active');
 assert.equal(c.facts.targetURL,'http://127.0.0.1:44513/?mode=original#/wrong');
 assert.equal(c.facts.pageURL,'http://127.0.0.1:44513/?mode=original#/active');
});
test('I1 explicit Frame URL composition accepts only exact allowed fragment fields',async()=>{
 const {qualifyCallbackJSXFrameURL:q}=await import('../../experiments/react19-reducer/callback-jsx-native-run.mjs');
 const base='http://127.0.0.1:44513/?mode=original',policy={origin:'http://127.0.0.1:44513',mode:'original'};
 for(const fragment of [undefined,'','#/','#/active']){
  const frame={url:base};if(fragment!==undefined)frame.urlFragment=fragment;
  assert.equal(q(frame,base+(fragment??''),{...policy,pageURL:base+(fragment??'')}),base+(fragment??''));
 }
});
for(const [label,change]of [
 ['null fragment',f=>f.frame.urlFragment=null],
 ['numeric fragment',f=>f.frame.urlFragment=4],
 ['unapproved fragment',f=>f.frame.urlFragment='#/completed'],
 ['unmarked fragment',f=>f.frame.urlFragment='/active'],
 ['embedded fragment',f=>f.frame.url+='#/active'],
 ['foreign origin',f=>f.frame.url='http://127.0.0.1:44514/?mode=original'],
 ['foreign path',f=>f.frame.url='http://127.0.0.1:44513/other?mode=original'],
 ['foreign mode',f=>f.frame.url='http://127.0.0.1:44513/?mode=on'],
 ['extra query',f=>f.frame.url+='&extra=1'],
 ['mismatched target fragment',f=>f.target='http://127.0.0.1:44513/?mode=original'],
 ['mismatched page fragment',f=>f.policy.pageURL='http://127.0.0.1:44513/?mode=original#/'],
]){
 test('I1 URL qualification refuses '+label,async()=>{
  const {qualifyCallbackJSXFrameURL:q}=await import('../../experiments/react19-reducer/callback-jsx-native-run.mjs');
  const full='http://127.0.0.1:44513/?mode=original#/active',f={frame:{url:'http://127.0.0.1:44513/?mode=original',urlFragment:'#/active'},target:full,policy:{origin:'http://127.0.0.1:44513',mode:'original',pageURL:full}};change(f);
  assert.equal(typeof q,'function');assert.throws(()=>q(f.frame,f.target,f.policy));
 });
}

// A02.18: fixed new case, not a retry of either exhausted historical case.
test('schema3 fixed profile accepts the same explicit safe public launch options',async()=>{
 const s=await validSourceCase(3);assert.doesNotThrow(()=>guardCallbackJSXNativeCase(s));
 const o=callbackJSXNativeLaunchOptions(s);assert.deepEqual(o.args,['--enable-automation']);assert.equal(o.chromiumSandbox,true);assert.equal(o.headless,true);
});
test('schema3 cannot borrow old output/registration or accept arbitrary arguments',async()=>{
 const s=await validSourceCase(3);
 for(const change of [x=>x.out=x.out.replace('fragment-native','automation-native'),x=>x.inputHashes={},x=>x.browser.args=[],x=>x.browser.args.push('--ignore-certificate-errors')]){
  const c=copy(s);change(c);assert.throws(()=>guardCallbackJSXNativeCase(c));
 }
});
test('schema3 refusal of original delivery stops before public facts HTTP or app',async()=>{
 const{s,ops,calls}=sourceOps();s.schema='stateatom.callback-jsx-native-case/3';
 ops.readRequestedAutomation=async()=>({status:'REQUIRED_AUTOMATION_ARGUMENT_REFUSED'});
 const r=await runCallbackJSXNativeStages(s,ops);
 assert.equal(r.modesStarted,0);assert.equal(calls.includes('http'),false);assert.equal(calls.includes('proc'),false);
 assert.equal(r.startup.requestedAutomation.status,'REQUIRED_AUTOMATION_ARGUMENT_REFUSED');assert.equal(r.browserLaunchesStarted,1);
});


// A02.18 ONE final review pass: execute the actual private harness methods with
// resource-free CDP/page controls. No bootstrap/app expression is evaluated.
async function actualNativeMethod(name,bindings){
 const source=await readFile('experiments/react19-reducer/callback-jsx-native-run.mjs','utf8'),ast=parse(source,{sourceType:'module'});
 const owner=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='createNativeOperations');
 const methods=owner.body.body.find(n=>n.type==='ReturnStatement').argument.properties;
 const method=methods.find(n=>n.type==='ObjectMethod'&&n.key.name===name);assert(method);
 const body=source.slice(method.start,method.end).replace('async '+name+'(','async function '+name+'(');
 return new vm.Script('('+body+')').runInContext(vm.createContext({assert,URL,...bindings}));
}
async function actualOpenControl({mode='off',reply={identifier:'owned-script-registration'},enableError=false}={}){
 const calls=[],events=[],origin='http://127.0.0.1:12345',bootstrap=mode==='original'?'':callbackJSXNativeBootstrap(callbackJSXNativeFactory(),{page:'owned:'+mode,mode}),run={mode},session={on(){},async send(method,params){calls.push({method,params});if(method==='Page.enable'&&enableError)throw Error('Page-enable control failure');return method==='Page.addScriptToEvaluateOnNewDocument'?reply:{};}};
 let created=false;
 const page={setDefaultTimeout(){},on(){},async goto(){calls.push({method:'goto'});},getByRole(){return{async waitFor(){calls.push({method:'ready'});}};}};
 const context={pages(){return created?[page]:[];},on(){},async route(){},async addInitScript(){calls.push({method:'context.addInitScript'});},async newPage(){created=true;return page;},async newCDPSession(){return session;}};
 const doc={targetId:'target',frameId:'frame',loaderId:'loader',browserContextId:'context',mainOnly:true};
 const call=await actualNativeMethod('openMode',{
  s:{out:'/owned/case',bootstrapDigests:{[mode]:hash(bootstrap)}},h:{client:{async newContext(){return context;}}},
  modeHandles:new Map(),result:{origin,errors:[]},hash,
  fs:{async readFile(file){assert.equal(file,'/owned/case/'+mode+'-bootstrap.js');events.push('read-bootstrap');return bootstrap;}},
  activeLease:l=>assert.equal(l.active,true),activeStep:async(l,task)=>{assert.equal(l.active,true);return task();},
  acquire:async(bag,key,fn)=>{bag[key]=await fn();return bag[key];},documentFor:async()=>doc
 });
 return{run,calls,events,bootstrap,invoke:()=>call(run,{active:true})};
}
test('review18 I1 actual openMode registers exact literal default-world CDP source before navigation',async()=>{
 const c=await actualOpenControl();await c.invoke();
 const registration=c.calls.find(x=>x.method==='Page.addScriptToEvaluateOnNewDocument');assert(registration);
 assert.deepEqual(copy(registration.params),{source:c.bootstrap,runImmediately:false});
 assert(c.calls.indexOf(registration)<c.calls.findIndex(x=>x.method==='goto'));
 assert.equal(c.calls.some(x=>x.method==='context.addInitScript'),false);
 assert.deepEqual(c.events,['read-bootstrap']);
});
test('review18 I1 original mode never injects bootstrap',async()=>{
 const c=await actualOpenControl({mode:'original'});await c.invoke();
 assert.equal(c.calls.some(x=>x.method==='Page.addScriptToEvaluateOnNewDocument'||x.method==='context.addInitScript'),false);assert.deepEqual(c.events,[]);
});
for(const reply of [{},{identifier:''},{identifier:4},null])test('review18 I1 malformed public registration reply prevents navigation '+JSON.stringify(reply),async()=>{
 const c=await actualOpenControl({reply});await assert.rejects(c.invoke());
 assert.equal(c.calls.some(x=>x.method==='goto'),false);
});
test('review18 I2 actual capture phase URL cannot contradict its saved CDP URL reading',async()=>{
 const {guardCallbackJSXNativeURLReadings:guard}=await import('../../experiments/react19-reducer/callback-jsx-native-qualification.mjs');
 const origin='http://127.0.0.1:12345',base=origin+'/?mode=original',protocol=callbackJSXNativeProtocol(),doc={mainOnly:true};
 const run={mode:'original',documentURLReadings:Array.from({length:8},(_,i)=>({frameURL:base,urlFragmentPresent:i>=6,...(i>=6?{urlFragment:'#/active'}:{}),targetURL:base+(i>=6?'#/active':''),pageURL:base+(i>=6?'#/active':'')})),phases:protocol.phases.map((p,i)=>({id:p.id,url:base+(i>=4?'#/active':'')}))};
 const phase=protocol.phases[4],v=run.phases[4],m={page:{async evaluate(){return{dom:{texts:phase.texts,checked:phase.checked},capture:null};},url(){return base+'#/completed';}}};
 const call=await actualNativeMethod('capturePhase',{modeHandles:new Map([['original',m]]),activeStep:async(l,task)=>task(),save:async()=>{},activeLease:l=>assert.equal(l.active,true),documentFor:async()=>doc});
 await call(run,phase,v,{active:true});assert.equal(v.url,base+'#/completed');assert.throws(()=>guard(run,origin));
});


// A02.19 explicit profile inherits the already corrected mechanism unchanged.
test('schema4 accepts only its fixed literal-bootstrap case with the same safe options',async()=>{
 const s=await validSourceCase(4);assert.doesNotThrow(()=>guardCallbackJSXNativeCase(s));
 const o=callbackJSXNativeLaunchOptions(s);assert.deepEqual(o.args,['--enable-automation']);assert.equal(o.chromiumSandbox,true);assert.equal(o.headless,true);assert.equal(o.host,'127.0.0.1');assert.equal(o.port,0);
});
test('schema4 cannot borrow fragment output or change registered inputs and argv',async()=>{
 const source=await validSourceCase(4);
 for(const change of [s=>s.out=s.out.replace('literal-native','fragment-native'),s=>s.sourceRegistrationSha256='0'.repeat(64),s=>s.sourceCounts.priorResearch=82,s=>s.browser.args.push('--no-sandbox')]){
  const s=copy(source);change(s);assert.throws(()=>guardCallbackJSXNativeCase(s));
 }
});
test('schema4 original argument refusal stops before public facts HTTP or app',async()=>{
 const{s,ops,calls}=sourceOps();s.schema='stateatom.callback-jsx-native-case/4';ops.readRequestedAutomation=async()=>({status:'REQUIRED_AUTOMATION_ARGUMENT_REFUSED'});
 const r=await runCallbackJSXNativeStages(s,ops);assert.equal(r.modesStarted,0);assert.equal(calls.includes('proc'),false);assert.equal(calls.includes('http'),false);assert.equal(r.startup.requestedAutomation.status,'REQUIRED_AUTOMATION_ARGUMENT_REFUSED');
});


// A02.19 ONE final Important correction. This is the actual private harness body,
// with a resource-free same-session protocol control; no bootstrap/app executes.
for(const mode of ['off','on']){
 test('review19 I1 '+mode+' enables its Page session before literal registration and navigation',async()=>{
  const c=await actualOpenControl({mode});await c.invoke();
  const enable=c.calls.findIndex(x=>x.method==='Page.enable'),register=c.calls.findIndex(x=>x.method==='Page.addScriptToEvaluateOnNewDocument'),navigate=c.calls.findIndex(x=>x.method==='goto');
  assert(enable>=0);assert(enable<register&&register<navigate);assert.equal(c.calls.filter(x=>x.method==='Page.enable').length,1);
  assert.deepEqual(copy(c.calls[register].params),{source:c.bootstrap,runImmediately:false});
 });
 test('review19 I1 '+mode+' Page-enable rejection prevents registration and navigation',async()=>{
  const c=await actualOpenControl({mode,enableError:true});await assert.rejects(c.invoke(),/Page-enable control failure/);
  assert.equal(c.calls.some(x=>x.method==='Page.addScriptToEvaluateOnNewDocument'||x.method==='goto'),false);
 });
}
