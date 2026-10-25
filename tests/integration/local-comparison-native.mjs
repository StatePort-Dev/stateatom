// SPDX-License-Identifier: Apache-2.0
// One sealed cached-model research candidate. Import is inert; never part of npm test.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import {readFile,writeFile,open,lstat,unlink} from 'node:fs/promises';
import {chromium} from 'playwright';
import {fileManifest} from '../../scripts/atom-package-receipt.mjs';
import {parseComparisonNativeArgs,preflightComparisonCase,registerComparisonNativeRun,comparisonSha,comparisonDriverError,verifyComparisonFrozenInputs} from '../../scripts/comparison-evaluation-case.mjs';
import {comparisonCollectionStatus,comparisonIncompleteStatus,comparisonCleanupKeys,guardComparisonRunRecord,finalizeComparisonCollection} from '../../experiments/comparison-evaluation-qualification.mjs';
import {readComparisonProcess,attestComparisonBrowser,retireComparisonProcess,acquireComparisonLease,independentComparisonCleanup,createComparisonDesktop,waitComparison,comparisonPause} from '../helpers/comparison-native-desktop.mjs';

function bounded(promise,ms,onLate){
 let expired=false,timer;
 const job=Promise.resolve(promise).then(value=>{if(expired){onLate?.(value);throw Error('LATE_ACQUISITION');}return value;});
 return Promise.race([job,new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Error('OPERATION_TIMEOUT'));},ms);})]).finally(()=>clearTimeout(timer));
}
export function collectComparisonConsole(page,pageURL){
 const log={schema:'stateatom.l02-comparison-console/1',pageURL,scope:'Evaluation page deliveries until explicit stop',status:'Collecting',startedAt:Date.now(),stoppedAt:null,seen:0,overflow:false,records:[],failures:[]};let stopped=false;
 const failure=e=>{log.failures.push(String(e?.message??e));};
 const collect=(type,text,location)=>{
  if(stopped)return;
  try{assert.equal(page.url(),pageURL);log.seen++;if(log.records.length>=128){log.overflow=true;return;}log.records.push({type,text,location,at:Date.now()});}catch(e){failure(e);}
 };
 const consoleMessage=message=>{if(stopped)return;try{const type=message.type();if(['warning','error'].includes(type))collect(type,message.text(),message.location());}catch(e){failure(e);}};
 const pageError=error=>collect('pageerror',String(error?.message??error),null),closed=()=>{if(!stopped)failure('Page closed before collector stop');};
 page.on('console',consoleMessage);page.on('pageerror',pageError);page.on('close',closed);
 return {log,async stop(){if(stopped)return log;await Promise.resolve();stopped=true;log.stoppedAt=Date.now();log.status=log.failures.length||log.overflow?'Unknown':'Stopped';page.off('console',consoleMessage);page.off('pageerror',pageError);page.off('close',closed);return log;}};
}
export async function proveComparisonLoadedScript({session,page,s,extensionId,write=writeFile}){
 const url='chrome-extension://'+extensionId+'/l02-eval.js',parsed=[];
 const listener=event=>{if(event.url===url)parsed.push(event);};session.on('Debugger.scriptParsed',listener);
 try{
  await session.send('Debugger.enable');
  const nonce=await page.evaluate(()=>document.querySelector('meta[name="stateatom-comparison-case"]')?.content??null);assert.equal(nonce,s.nonce);
  assert.equal(parsed.length,1,'Expected one actual evaluation script');assert(parsed[0].scriptId);
  const {scriptSource}=await session.send('Debugger.getScriptSource',{scriptId:parsed[0].scriptId});assert.equal(typeof scriptSource,'string');
  const sourceSha256=comparisonSha(scriptSource);assert.equal(sourceSha256,s.addon.jsSha256,'Loaded evaluation source differs');
  const loadedFile=s.out+'/loaded-evaluation.js';await write(loadedFile,scriptSource,{flag:'wx'});
  return {scriptURL:url,scriptId:parsed[0].scriptId,sourceSha256,nonce,loadedFile};
 }finally{session.off('Debugger.scriptParsed',listener);}
}
export async function driveComparisonRows({s,r,run,save,checkStop=()=>{},afterRow=async()=>{}}){
 r.runs??=[];r.unvisited=s.expectedCases.map(c=>c.id);
 for(const expected of s.expectedCases){
  checkStop();r.currentAttempt={index:expected.index,id:expected.id,campaign:expected.campaign,startedAt:new Date().toISOString()};await save();
  const row=await run(expected.index);row.caseIndex=expected.index;r.runs.push(row);r.unvisited=s.expectedCases.slice(expected.index+1).map(c=>c.id);await save();
  guardComparisonRunRecord(row,expected,s);checkStop();await afterRow(row,expected);checkStop();
 }
 r.currentAttempt=null;
}
function extensionUI(){
 const manager=document.querySelector('extensions-manager'),toolbar=manager?.shadowRoot?.querySelector('extensions-toolbar'),toggle=toolbar?.shadowRoot?.querySelector('#devMode'),rect=toggle?.getBoundingClientRect();
 return {ready:!!toggle,checked:toggle?.checked,point:rect?{x:rect.x+rect.width/2,y:rect.y+rect.height/2}:null};
}
function previousToggle(id){
 function find(root,p){for(const n of root.querySelectorAll('*')){if(p(n))return n;if(n.shadowRoot){const v=find(n.shadowRoot,p);if(v)return v;}}}
 const item=find(document,n=>n.localName==='extensions-item'&&(n.id===id||n.data?.id===id));if(!item)return {absent:true};
 item.scrollIntoView({block:'center'});const toggle=item.shadowRoot.querySelector('#enableToggle')||item.shadowRoot.querySelector('cr-toggle'),rect=toggle?.getBoundingClientRect();
 return {absent:false,checked:toggle?.checked,point:rect?{x:rect.x+rect.width/2,y:rect.y+rect.height/2}:null};
}
export async function runComparisonNative(args=process.argv.slice(2)){
 const options=parseComparisonNativeArgs(args),{s,h,inputs,node}=await preflightComparisonCase(options.caseFile);
 if(options.preflight){console.log('COMPARISON_PREFLIGHT_PASS',s.id,Object.keys(inputs).length,'browser=false model=false');return {preflight:true};}
 const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',timeout:5000}).trim();
 assert.equal(execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8',timeout:5000}).trim(),'','Commit the fixed case and sources before the one run');
 await registerComparisonNativeRun(s.out,{caseFile:options.caseFile,caseId:s.id,caseSha256:inputs[options.caseFile],sourceRevision,protocol:s.protocol,expectedCases:s.expectedCases,registeredAt:new Date().toISOString(),modelCreateNotYetCalled:true});
 const r={schema:'stateatom.l02-comparison-native/1',status:comparisonIncompleteStatus,caseId:s.id,caseSha256:inputs[options.caseFile],sourceRevision,nativePID:process.pid,actualNode:node,startedAt:new Date().toISOString(),diagnosticOnly:true,originalAcceptanceWaived:false,modelQualityAssessed:false,fullL02:false,productProviderSelected:false,issuedPair:{atomSha256:s.atomSha256,uiSha256:s.uiSha256,checkedBeforeBrowser:true,newProviderIsArchiveExport:false},inputsBefore:inputs,inputsAfter:null,inputsUnchanged:false,ownedProcesses:{},processRetirement:[],cleanup:Object.fromEntries(comparisonCleanupKeys.map(k=>[k,false])),cleanupErrors:[],errors:[],pageErrors:[],runs:[],unvisited:s.expectedCases.map(c=>c.id),modelBuildId:'Unknown; no API-exposed model/component build ID',installation:{method:'native-gtk-folder-drop',sourceFolder:s.hostPath,developerModeObserved:false,previousState:'Unknown',authenticatedX:false,privateDBus:false},profileLease:{acquired:false,releaseConfirmed:false,nonce:s.nonce,profile:s.profile.path}};
 let stopped=false;const deadline=Date.now()+s.protocol.caseBudgetMs;
 const stop=()=>{stopped=true;},checkStop=()=>{if(stopped||Date.now()>=deadline)throw Error('CASE_STOPPED_OR_DEADLINE');};
 process.once('SIGINT',stop);process.once('SIGTERM',stop);
 let lease,desktop,chromeLog,launcher,dragSource,browser,rootSession,pageSession,page,consoleCollector;
 const onOwned=(role,identity)=>{assert(identity,'Missing process identity '+role);r.ownedProcesses[role]=identity;};
 const save=()=>writeFile(s.out+'/results-running.json',JSON.stringify(r,null,2)+'\n');
 const observe=(fn,ms=15000)=>waitComparison(()=>bounded(Promise.resolve().then(fn),5000),ms,{checkStop});
 const click=async(target,id)=>{
  checkStop();await bounded(target.bringToFront(),5000);checkStop();
  const point=await bounded(target.evaluate(id=>{const e=document.getElementById(id);if(!e||e.disabled)throw Error('Control unavailable');e.scrollIntoView({block:'center'});const q=e.getBoundingClientRect();return {x:q.x+q.width/2,y:q.y+q.height/2};},id),5000);
  checkStop();await bounded(target.mouse.click(point.x,point.y),5000);
 };
 try{
  checkStop();lease=await acquireComparisonLease(s.profile.path,s.nonce);r.profileLease.acquired=true;
  // Remove only a prior endpoint in this idle owned cache, after taking its lease.
  const endpointFile=s.profile.path+'/DevToolsActivePort';let old;
  try{const st=await lstat(endpointFile);assert(st.isFile()&&!st.isSymbolicLink());old=await readFile(endpointFile);await writeFile(s.out+'/previous-closed-endpoint.txt',old,{flag:'wx'});await unlink(endpointFile);}catch(e){if(e.code!=='ENOENT')throw e;}
  desktop=createComparisonDesktop(s,{onOwned,checkStop});await desktop.start();checkStop();r.installation.authenticatedX=desktop.authenticated;
  chromeLog=await open(s.out+'/chrome.log','ax',0o600);checkStop();
  launcher=spawn('/usr/bin/dbus-run-session',['--',s.chrome.launcher,...s.launchArguments],{env:desktop.env,stdio:['ignore',chromeLog.fd,chromeLog.fd]});
  launcher.once('error',e=>{r.errors.push('Launcher: '+e.message);stopped=true;});
  onOwned('launcher',await observe(()=>readComparisonProcess(launcher.pid),2000));r.installation.privateDBus=true;
  const endpoint=await observe(async()=>{
   let raw;try{raw=await readFile(endpointFile,'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}
   const [port,suffix]=raw.trim().split('\n');assert(/^\d+$/.test(port)&&Number(port)>0&&Number(port)<65536);assert(/^\/devtools\/browser\/[a-zA-Z0-9-]+$/.test(suffix));return 'ws://127.0.0.1:'+port+suffix;
  },20000);r.endpoint=endpoint;
  checkStop();browser=await bounded(chromium.connectOverCDP(endpoint,{timeout:15000,noDefaults:true}),17000,late=>late.close().catch(()=>{}));checkStop();
  rootSession=await bounded(browser.newBrowserCDPSession(),5000,late=>late.detach().catch(()=>{}));
  const version=await bounded(rootSession.send('Browser.getVersion'),5000),processInfo=await bounded(rootSession.send('SystemInfo.getProcessInfo'),5000);
  r.browser=await attestComparisonBrowser({launcher:r.ownedProcesses.launcher,nativePID:process.pid,uid:s.profile.uid,binary:s.chrome.binary,binarySha256:s.chrome.binarySha256,processInfo:processInfo.processInfo,product:version.product,version:s.chrome.version,profile:s.profile.path});
  r.browser.originalArguments=s.launchArguments;r.browser.versionMetadata=version;r.browser.argvMeaning='Original spawned vector; not a reconstruction of runtime argv';onOwned('browser',r.browser);
  checkStop();assert.equal(browser.contexts().length,1);const context=browser.contexts()[0],extensions=await bounded(context.newPage(),5000);await extensions.goto('chrome://extensions/',{timeout:10000});await extensions.bringToFront();
  const initial=await observe(async()=>{const v=await extensions.evaluate(extensionUI);return v.ready?v:null;});r.developerModeBefore=initial;
  if(!initial.checked){checkStop();await extensions.mouse.click(initial.point.x,initial.point.y);}
  const after=await observe(async()=>{const v=await extensions.evaluate(extensionUI);return v.checked===true?v:null;});r.developerModeAfter=after;r.installation.developerModeObserved=after.checked;
  const prior=await observe(async()=>{const v=await extensions.evaluate(previousToggle,s.profile.previousExtensionId);return v.absent||v.point?v:null;});
  if(prior.checked){checkStop();await extensions.mouse.click(prior.point.x,prior.point.y);}
  const disabled=await observe(async()=>{const v=await extensions.evaluate(previousToggle,s.profile.previousExtensionId);return v.absent||v.checked===false?v:null;});r.previousExtensionObserved=disabled;r.installation.previousState=disabled.absent?'absent':'disabled';
  await observe(async()=>!(await rootSession.send('Target.getTargets')).targetInfos.some(t=>t.type==='service_worker'&&t.url.startsWith('chrome-extension://'+s.profile.previousExtensionId+'/')));
  const baseline=(await rootSession.send('Target.getTargets')).targetInfos;r.targetsBefore=baseline;
  await extensions.bringToFront();checkStop();
  dragSource=spawn('/usr/bin/python3',['tests/helpers/native-folder-source.py',s.hostPath],{env:{...desktop.env,DBUS_SESSION_BUS_ADDRESS:'unix:path='+s.out+'/no-source-bus',NO_AT_BRIDGE:'1'},stdio:['ignore',chromeLog.fd,chromeLog.fd]});
  dragSource.once('error',e=>{r.errors.push('Drag source: '+e.message);stopped=true;});onOwned('dragSource',await observe(()=>readComparisonProcess(dragSource.pid),2000));
  const xdo=args=>{checkStop();return execFileSync('/usr/bin/xdotool',args,{env:desktop.env,encoding:'utf8',timeout:3000,stdio:['ignore','pipe','pipe']}).trim();};
  const windowID=await observe(()=>{try{return xdo(['search','--onlyvisible','--name','^StateAtom exact folder drag source$']).split('\n').filter(Boolean)[0];}catch(e){if(e.status===1)return null;throw e;}});
  assert.equal(Number(xdo(['getwindowpid',windowID])),dragSource.pid);r.dragWindowID=windowID;await comparisonPause(400);checkStop();
  r.nativeDrop={sourceWindowPID:dragSource.pid,startedAt:new Date().toISOString(),path:s.hostPath,coordinates:[]};
  try{xdo(['mousemove','900','370','mousedown','1']);for(const x of [890,850,750,650,550,450,400]){r.nativeDrop.coordinates.push([x,370]);xdo(['mousemove',String(x),'370']);await comparisonPause(120);}}finally{xdo(['mouseup','1']);}
  const manifest=JSON.parse(await readFile(s.hostPath+'/manifest.json','utf8')),known=new Set(baseline.map(t=>t.targetId));
  const worker=await observe(async()=>{const targets=(await rootSession.send('Target.getTargets')).targetInfos;r.targetsAfter=targets;const found=targets.filter(t=>!known.has(t.targetId)&&t.type==='service_worker'&&t.url.startsWith('chrome-extension://')&&t.url.endsWith('/'+manifest.background.service_worker));assert(found.length<=1,'Ambiguous newly installed host');return found[0];},20000);
  r.extensionId=new URL(worker.url).hostname;assert.match(r.extensionId,/^[a-p]{32}$/);r.evalURL='chrome-extension://'+r.extensionId+'/l02-eval.html';await extensions.screenshot({path:s.out+'/extensions-candidate.png'});
  checkStop();page=await context.newPage();consoleCollector=collectComparisonConsole(page,r.evalURL);await page.goto(r.evalURL,{timeout:10000});
  await observe(()=>page.evaluate(()=>window.l02Evaluation?.ready===true));pageSession=await context.newCDPSession(page);
  r.runtimeProof=await bounded(proveComparisonLoadedScript({session:pageSession,page,s,extensionId:r.extensionId}),10000);r.originalHostUnchanged=JSON.stringify(await fileManifest(s.hostPath))===JSON.stringify(s.hostFiles);assert.equal(r.originalHostUnchanged,true);
  r.availabilityObservations=[];
  await observe(async()=>{const value=await page.evaluate(()=>window.l02CheckAvailability());r.availabilityObservations.push({at:new Date().toISOString(),value});if(value!=='available')throw Error('CACHED_MODEL_NOT_AVAILABLE: '+value);return true;},s.protocol.cachedAvailabilityMs);
  await driveComparisonRows({s,r,checkStop,save,afterRow:async(_row,expected)=>{if(expected.id==='unknown-left')await page.screenshot({path:s.out+'/unknown-left-candidate.png'});},run:async index=>{
   checkStop();await bounded(page.evaluate(index=>{if(window.l02Evaluation.phase!=='idle'||window.l02Evaluation.results.length!==index)throw Error('Evaluation order drift');document.getElementById('case').value=String(index);},index),5000);
   await click(page,'run');
   return observe(async()=>{const state=await page.evaluate(()=>JSON.parse(JSON.stringify(window.l02Evaluation)));r.latestEvaluation=state;if(state.phase==='idle'&&state.results.length===index+1){assert.equal(await page.evaluate(()=>document.getElementById('case').value),String(index));return state.results[index];}return null;},s.protocol.observationTimeoutMs);
  }});
  r.finalEvaluation=await bounded(page.evaluate(()=>JSON.parse(JSON.stringify(window.l02Evaluation))),5000);assert.deepEqual(r.finalEvaluation.errors,[]);assert.equal(r.finalEvaluation.results.length,34);
  await page.screenshot({path:s.out+'/evaluation-candidate.png'});r.status=comparisonCollectionStatus;
 }catch(e){
  r.status=comparisonIncompleteStatus;r.errors.push({name:e.name,message:e.message,stack:e.stack});
  if(page&&r.browser?.ownerAttested){try{r.finalEvaluation=await bounded(page.evaluate(()=>JSON.parse(JSON.stringify(window.l02Evaluation))),3000);await bounded(page.screenshot({path:s.out+'/failure-evaluation-candidate.png'}),3000);}catch(error){r.failureObservation={name:error.name,message:error.message};}}
 }finally{
  // Every action runs independently; Unknown/failure cannot become successful collection.
  await independentComparisonCleanup(r,{
   frozenInputs:async()=>{r.inputsAfter=await verifyComparisonFrozenInputs(inputs);r.inputsUnchanged=true;r.finalHostFiles=await fileManifest(s.hostPath);assert.deepEqual(r.finalHostFiles,s.hostFiles);return true;},
   console:async()=>{if(!consoleCollector)return false;try{if(page&&!page.isClosed())await bounded(page.evaluate(()=>0),3000);}catch(e){consoleCollector.log.failures.push('Final delivery barrier: '+e.message);}r.consoleCollection=await consoleCollector.stop();r.pageErrors=r.consoleCollection.records.filter(x=>x.type==='pageerror');return r.consoleCollection.status==='Stopped';},
   browser:async()=>{if(!r.browser?.ownerAttested)return false;try{await bounded(rootSession.send('Browser.close'),5000);}catch(e){r.browserCloseDiagnostic={name:e.name,message:e.message};}const retired=await retireComparisonProcess(r.ownedProcesses.browser);r.processRetirement.push(retired);return ['Absent','ReusedDifferentIdentity'].includes(retired.state);},
   browserConnection:async()=>{if(pageSession)await bounded(pageSession.detach().catch(()=>{}),3000);if(rootSession)await bounded(rootSession.detach().catch(()=>{}),3000);if(browser)await bounded(browser.close(),3000);return !browser||!browser.isConnected();},
   dragSource:async()=>{if(!dragSource)return true;const retired=await retireComparisonProcess(r.ownedProcesses.dragSource);r.processRetirement.push(retired);return ['Absent','ReusedDifferentIdentity'].includes(retired.state);},
   launcher:async()=>{if(!launcher)return true;const retired=await retireComparisonProcess(r.ownedProcesses.launcher);r.processRetirement.push(retired);return ['Absent','ReusedDifferentIdentity'].includes(retired.state);},
   desktop:async()=>{if(!desktop)return true;const ok=await desktop.close();if(desktop.retirement)r.processRetirement.push(desktop.retirement);return ok;},
   chromeLog:async()=>{if(chromeLog)await chromeLog.close();return true;},
   profileLease:async()=>{if(!lease)return true;r.profileLease.releaseConfirmed=await lease.release();return r.profileLease.releaseConfirmed;},
   knownOwnedRetired:async()=>{const known=Object.values(r.ownedProcesses);return known.every(p=>r.processRetirement.some(q=>q.pid===p.pid&&q.startTime===p.startTime&&['Absent','ReusedDifferentIdentity'].includes(q.state)));}
  });
  process.off('SIGINT',stop);process.off('SIGTERM',stop);r.completedAt=new Date().toISOString();finalizeComparisonCollection(r,s);
  await writeFile(s.out+'/results.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log(r.status,s.out);if(r.status!==comparisonCollectionStatus)process.exitCode=1;
 }
 return r;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)runComparisonNative().catch(e=>{console.error('COMPARISON_NATIVE_ERROR',comparisonDriverError(e));process.exitCode=1;});
