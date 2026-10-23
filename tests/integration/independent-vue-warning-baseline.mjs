// SPDX-License-Identifier: Apache-2.0
// Read-only original-app startup diagnostic, without Atom or IDE authority.
import assert from 'node:assert/strict';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {stripVTControlCharacters} from 'node:util';
import {chromium} from 'playwright';
import {waitFor} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes} from '../../scripts/atom-package-receipt.mjs';
import {diagnosticMessages,compareMessages} from '../helpers/vue-warning-comparison.mjs';
import {createViteStartupTrace} from '../helpers/vite-startup-trace.mjs';
const [caseFile]=process.argv.slice(2);assert.equal(process.argv.length,3,'Registered diagnostic case required');
const json=async f=>JSON.parse(await readFile(f)),scenario=await json(caseFile),native=await json(scenario.nativeResult),originalCase=await json(scenario.originalCase);
const prep=await json(scenario.dependencyReceipt),app=prep.apps.find(a=>a.slug==='CorentinTh--it-tools'),manifest=await json(app.sourceManifest);
const h=await json(originalCase.developmentHandoff),reuse=await json(originalCase.consumerReceipt);
assert.equal(scenario.schema,'stateatom.v03-vue-warning-case/1');assert.equal(native.status,'FAIL');assert.equal(native.checks.length,15);assert.equal(native.appConsole.length,24);
assert.equal(sha256(await readFile(scenario.nativeResult)),scenario.expectedNativeSha256);assert.deepEqual(native.scenario,originalCase);assert.equal(originalCase.revision,scenario.applicationRevision);
assert.equal(sha256(await readFile('tests/integration/independent-vue-warning-baseline.mjs')),scenario.expectedDriverSha256);assert.equal(sha256(await readFile('tests/helpers/vue-warning-comparison.mjs')),scenario.expectedComparisonHelperSha256);
assert.equal(h.plugin.sha256,scenario.expectedPluginSha256);assert.equal(reuse.artifacts.plugin.sha256,h.plugin.sha256);assert.equal(app.status,'PASS_FROZEN_DEPENDENCY_PREPARATION_NOT_APP_ACCEPTANCE');
const tracing=scenario.purpose==='retained-cold-on-startup-trace';assert(['warning-comparison','retained-cold-on-startup-trace'].includes(scenario.purpose||'warning-comparison'));
assert.deepEqual(scenario.order,tracing?[true]:[false,true,true,false]);assert.equal(Object.keys(manifest).length,498);assert.equal(execFileSync(originalCase.nodeExecutable,['--version'],{encoding:'utf8'}).trim(),originalCase.nodeVersion);
if(tracing){assert.equal(scenario.trace.debug,'vite:deps');assert.equal(sha256(await readFile('tests/helpers/vite-startup-trace.mjs')),scenario.expectedTraceHelperSha256);assert.equal(sha256(await readFile(scenario.parentFailure.file)),scenario.parentFailure.sha256);}
const consumerVitePackage=reuse.consumer+'/node_modules/vite/package.json';assert.equal((await json(consumerVitePackage)).version,originalCase.viteVersion);assert.equal(sha256(await readFile(reuse.packageLock.file)),reuse.packageLock.sha256);
const browserExecutable=chromium.executablePath();assert.equal(browserExecutable,scenario.expectedBrowserExecutable);assert.equal(sha256(await readFile(browserExecutable)),scenario.expectedBrowserExecutableSha256);
const out=path.resolve('.artifacts/v03/warning-baseline/'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const registered=[caseFile,scenario.nativeResult,scenario.originalCase,scenario.dependencyReceipt,app.sourceManifest,originalCase.developmentHandoff,originalCase.consumerReceipt,'tests/integration/independent-vue-warning-baseline.mjs','tests/helpers/vue-warning-comparison.mjs','tests/helpers/vite-startup-trace.mjs','scripts/harness.mjs',...Object.keys(h.sourceManifest),...Object.keys(reuse.installedPlugin.files).map(f=>path.join(reuse.installedPlugin.path,f)),h.plugin.file,app.workingCopy+'/package.json',consumerVitePackage,reuse.packageLock.file,...Object.keys(app.installedVersions).map(name=>path.join(app.workingCopy,'node_modules',name,'package.json')),...(tracing?[scenario.parentFailure.file]:[])];
const inputs=async()=>Object.fromEntries(await Promise.all(registered.map(async f=>[f,sha256(await readFile(f))])));
async function sourceAudit(){
 const generated=[];for(const[file,hash]of Object.entries(manifest)){assert.equal(sha256(await readFile(app.immutableSource+'/'+file)),hash,'immutable '+file);const actual=sha256(await readFile(app.workingCopy+'/'+file));if(actual!==hash)generated.push({file,sha256:actual});}
 assert.deepEqual(generated,originalCase.initialGeneratedDeltas);return{files:498,unchanged:498-generated.length,generated};
}
const result={schema:'stateatom.v03-vue-warning-baseline/1',status:'RUNNING',purpose:tracing?'retained-cold-on-startup-trace':'warning-comparison',originalWarningMatrixComplete:false,startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),caseFile,scenario,out,browserPolicy:'Browser plugin not available; owned Playwright/CDP; no Atom/IDE/console wrapper',phases:[],nativeOverallStatusUnchanged:'FAIL',originalNativeQuestionAccepted:false,fullV03Complete:false,inputsBefore:await inputs()};
async function freePort(){const server=createServer();await new Promise((r,j)=>{server.once('error',j);server.listen(0,'127.0.0.1',r);});const port=server.address().port;await new Promise(r=>server.close(r));return port;}
await writeFile(out+'/registration.json',JSON.stringify(result,null,2),{flag:'wx'});
try{
 await verifyArtifactHashes([h.plugin]);for(const[f,hash]of Object.entries(h.sourceManifest))assert.equal(sha256(await readFile(f)),hash,f);assert.deepEqual(await fileManifest(reuse.installedPlugin.path),reuse.installedPlugin.files);
 for(const[name,v]of Object.entries(app.installedVersions))assert.equal(sha256(await readFile(path.join(app.workingCopy,'node_modules',name,'package.json'))),v.packageJsonSha256,name);
 assert.equal(JSON.parse(await readFile(app.workingCopy+'/package.json')).scripts.dev,'vite');result.sourceBefore=await sourceAudit();
 for(const [index,enabled]of scenario.order.entries()){
  const dir=out+'/'+index+'-'+(enabled?'on':'off');await mkdir(dir,{recursive:true});const phase={index,enabled,status:'RUNNING',startedAt:new Date().toISOString(),rawEvents:[],postWindowEvents:[],rawBytes:0,overflow:false,dropped:0};result.phases.push(phase);
  let vite,context,page,cdp,trace,viteFailure,log='';const port=await freePort(),origin='http://127.0.0.1:'+port;
  try{
   const configFile=reuse.consumer+'/warning-'+path.basename(out)+'-'+index+'.config.mjs';
   const config=`import original from ${JSON.stringify(app.workingCopy+'/vite.config.ts')};\n${enabled?"import {stateatomPlugin} from '@stateport/vite-plugin';\n":''}export default {...original,root:${JSON.stringify(app.workingCopy)},cacheDir:${JSON.stringify(dir+'/vite-cache')},plugins:[${enabled?'stateatomPlugin({enabled:true,profile:"vue3",root:'+JSON.stringify(app.workingCopy)+'}),':''}...original.plugins]};\n`;
   await writeFile(configFile,config,{flag:'wx'});phase.config={file:configFile,sha256:sha256(config),enabled};
   const env={PATH:path.dirname(originalCase.nodeExecutable)+':/usr/bin:/bin',LANG:'C.UTF-8',CI:'1',npm_package_version:JSON.parse(await readFile(app.workingCopy+'/package.json')).version,...(tracing?{DEBUG:scenario.trace.debug}:{})};
   const args=[reuse.consumer+'/node_modules/vite/bin/vite.js','--config',configFile,'--host','127.0.0.1','--port',String(port),'--strictPort'];phase.command={executable:originalCase.nodeExecutable,args,cwd:app.workingCopy,env,origin};
   vite=spawn(originalCase.nodeExecutable,args,{cwd:app.workingCopy,env,stdio:['ignore','pipe','pipe']});phase.command.ownedPid=vite.pid;vite.once('error',e=>{viteFailure=e;});for(const stream of [vite.stdout,vite.stderr])stream.on('data',d=>{log+=d;});
   await waitFor(()=>{if(viteFailure)throw viteFailure;if(vite.exitCode!==null||vite.signalCode!==null)throw Error('Owned Vite exited before ready');return stripVTControlCharacters(log).includes(origin+'/');},originalCase.startupTimeoutMs);
   phase.browserLaunch={executablePath:browserExecutable,executableSha256:scenario.expectedBrowserExecutableSha256,channel:'chromium',headless:true};
   context=await chromium.launchPersistentContext(dir+'/profile',{executablePath:browserExecutable,channel:'chromium',headless:true,viewport:originalCase.viewport});page=context.pages()[0]||await context.newPage();cdp=await context.newCDPSession(page);
   phase.browser=(await cdp.send('Browser.getVersion')).product;assert.equal(phase.browser,scenario.expectedBrowserProduct);
   const capture=(method,params)=>{const event={method,params},bytes=Buffer.byteLength(JSON.stringify(event));if(phase.rawEvents.length+phase.postWindowEvents.length>=scenario.maxEvents||phase.rawBytes+bytes>scenario.maxRawBytes){phase.overflow=true;phase.dropped++;return;}phase.rawBytes+=bytes;(phase.appCaptureEndedAt?phase.postWindowEvents:phase.rawEvents).push(event);};
   for(const method of ['Runtime.consoleAPICalled','Runtime.exceptionThrown','Log.entryAdded'])cdp.on(method,params=>capture(method,params));
   if(tracing){
    trace=createViteStartupTrace({origin,maxEvents:scenario.trace.maxEvents,maxBytes:scenario.trace.maxBytes,readMetadata:()=>readFile(dir+'/vite-cache/deps/_metadata.json','utf8')});
    for(const method of ['Network.requestWillBeSent','Network.responseReceived','Network.loadingFailed','Network.webSocketCreated','Network.webSocketFrameReceived','Network.webSocketFrameSent','Network.webSocketClosed','Network.webSocketFrameError','Page.frameNavigated'])cdp.on(method,p=>trace.capture(method,p));
    await cdp.send('Network.enable');await cdp.send('Page.enable');
   }
   await cdp.send('Runtime.enable');await cdp.send('Log.enable');await page.evaluate(()=>console.warn('stateatom-warning-collector-positive-control'));
   await waitFor(()=>phase.rawEvents.some(e=>e.method==='Runtime.consoleAPICalled'&&e.params.args?.[0]?.value==='stateatom-warning-collector-positive-control'));
   phase.collectorControl={status:'PASS',events:structuredClone(phase.rawEvents)};phase.rawEvents=[];phase.rawBytes=0;phase.appCaptureStartedAt=new Date().toISOString();
   await page.goto(origin+originalCase.route,{waitUntil:'domcontentloaded',timeout:originalCase.appReadyTimeoutMs});
   const snapshot=()=>page.evaluate(selector=>{const e=document.querySelector(selector);return{ready:document.readyState,url:location.href,title:document.title,inputCount:document.querySelectorAll(selector).length,input:e?.value,disabled:e?.disabled,marker:e?.getAttribute('data-xray-source'),statistics:[...document.querySelectorAll('.n-statistic-value__content')].map(e=>e.textContent.trim()),overlay:!!document.querySelector('vite-error-overlay')};},originalCase.selectionSelector);
   await waitFor(async()=>{const s=await snapshot();return s.ready==='complete'&&s.inputCount===1&&s.input===''&&s.statistics.join('|')==='0|0|0|0 Bytes'&&!s.overlay;},originalCase.appReadyTimeoutMs);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.waitForTimeout(scenario.settleMs);
   phase.app=await snapshot();assert.equal(phase.app.disabled,false);assert.equal(phase.app.url,origin+originalCase.route);assert.equal(phase.app.marker!==null,enabled,'Actual plugin treatment marker');if(enabled)assert.match(phase.app.marker,/^src\/ui\/c-input-text\/c-input-text\.vue:156:471084ece218:9$/);
   phase.appCaptureEndedAt=new Date().toISOString();assert.equal(phase.overflow,false,'Raw event limit makes comparison invalid');assert(!phase.rawEvents.some(e=>e.params.args?.[0]?.value==='stateatom-warning-collector-positive-control'),'Blank positive control must not contaminate app data');
   phase.messages=diagnosticMessages(phase.rawEvents);phase.messageCounts={total:phase.messages.length,console:phase.messages.filter(m=>m.kind==='console').length,exceptions:phase.messages.filter(m=>m.kind==='exception').length,log:phase.messages.filter(m=>m.kind==='log').length};
   await page.screenshot({path:dir+'/app-startup.png'});phase.sourceAfter=await sourceAudit();phase.status='PASS_SCOPED_STARTUP_CAPTURE_NOT_ZERO_CONSOLE';
  }catch(e){phase.status='FAIL';phase.error=e.stack;
   if(tracing&&page&&phase.appCaptureStartedAt){try{phase.failureDOM=await page.evaluate(()=>({url:location.href,ready:document.readyState,title:document.title,body:document.body?.innerText.slice(0,15000),html:document.body?.outerHTML.slice(0,4000),overlay:document.querySelector('vite-error-overlay')?.shadowRoot?.textContent.slice(0,12000)}));}catch(f){phase.failureDOMError=f.message;}try{const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(dir+'/app-failure.png',Buffer.from(shot.data,'base64'));phase.failureScreenshot=dir+'/app-failure.png';}catch(f){phase.failureScreenshotError=f.message;}}
   throw e;}
  finally{
   try{await context?.close();phase.browserClosed=true;}catch(e){phase.cleanupError=e.message;throw e;}
   finally{
    if(vite&&vite.exitCode===null&&vite.signalCode===null){vite.kill('SIGTERM');try{await waitFor(()=>vite.exitCode!==null||vite.signalCode!==null,5000);}catch{vite.kill('SIGKILL');await waitFor(()=>vite.exitCode!==null||vite.signalCode!==null,5000);}}
    if(trace){await trace.drain();phase.trace=trace.snapshot();if(phase.trace.overflow||!phase.trace.events.some(e=>e.method==='Network.requestWillBeSent'&&e.url===origin+originalCase.route)){phase.status='FAIL';result.status='FAIL';process.exitCode=1;}}
    if(phase.overflow){phase.status='FAIL';result.status='FAIL';process.exitCode=1;}
    phase.viteExit=vite?{code:vite.exitCode,signal:vite.signalCode}:null;await writeFile(dir+'/vite.log',log);phase.viteLogSha256=sha256(log);phase.finishedAt=new Date().toISOString();await writeFile(dir+'/phase.json',JSON.stringify(phase,null,2));console.log('PHASE '+index+' '+(enabled?'on':'off')+' '+phase.status+' '+JSON.stringify(phase.messageCounts||{}));
   }
  }
 }
 const p=result.phases;assert(p.every(p=>p.status==='PASS_SCOPED_STARTUP_CAPTURE_NOT_ZERO_CONSOLE'&&!p.overflow));if(!tracing)result.comparisons={offRepeat:compareMessages(p[0].messages,p[3].messages),onRepeat:compareMessages(p[1].messages,p[2].messages),offOnFirst:compareMessages(p[0].messages,p[1].messages),offOnSecond:compareMessages(p[3].messages,p[2].messages),nativeVersusOff:compareMessages(diagnosticMessages(native.appConsole),p[0].messages),nativeVersusOn:compareMessages(diagnosticMessages(native.appConsole),p[1].messages)};
 result.originalWarningMatrixComplete=!tracing;result.status=tracing?'PASS_SINGLE_COLD_ON_TRACE_NOT_ORIGINAL_COMPARISON':'PASS_BOUNDED_WARNING_COMPARISON_NOT_NATIVE_ACCEPTANCE';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;console.error(e.message);}
finally{
 result.inputsAfter=await inputs();if(JSON.stringify(result.inputsAfter)!==JSON.stringify(result.inputsBefore)){result.status='FAIL';result.inputDrift=true;process.exitCode=1;}
 try{result.sourceAfter=await sourceAudit();}catch(e){result.status='FAIL';result.sourceError=e.stack;process.exitCode=1;}
 result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/results.json',status:result.status}));
}
