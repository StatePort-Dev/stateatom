// SPDX-License-Identifier: Apache-2.0
// Finite owned-harness qualification, not end-user installation or app restoration.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,open,realpath,copyFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {spawn,execFileSync} from 'node:child_process';
import {stripVTControlCharacters} from 'node:util';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {waitFor,rpc} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {sourceAccessDesktop} from '../helpers/source-access-native-desktop.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {admitInspectorOrderNode,cleanupInspectorOrder as cleanupRestoreAvailability} from './inspector-input-order-native.mjs';
import {guardRestoreAvailability,finalizeRestoreAvailability,restoreAvailabilityPass} from '../../experiments/restore-availability-qualification.mjs';
export {cleanupRestoreAvailability};

const root=process.cwd(),casePath=path.join(root,'docs/testing/restore-availability-case78.json');
export const restoreAvailabilityCandidateSha='8e2d67e68a0ef2a798409156c581629adb3cd2e37f06e8bb3ef7c3c0d16bcf4a';
export const restoreAvailabilityUISha='2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5';
const error=code=>Object.assign(Error(code),{code}),json=async f=>JSON.parse(await readFile(f));
const git=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',timeout:5000,maxBuffer:4*1024*1024,stdio:['ignore','pipe','pipe']}).trim();
export function parseRestoreAvailabilityArgs(args){
 if(!Array.isArray(args)||!(args.length===1||args.length===2&&args[1]==='--preflight')||typeof args[0]!=='string'||!args[0]||args[0].startsWith('--'))throw error('INVALID_ARGUMENTS');
 if(path.resolve(args[0])!==casePath)throw error('CASE_SCOPE');return {caseFile:casePath,preflight:args.length===2};
}
export function restoreAvailabilityProtocol(){return {nativeInserts:[10,20],mode:'live',enter:false,blur:false,windowMs:1200,sampleIntervalMs:100,maxSamples:64,maximumReadyMs:20000,inputReadRefresh:false,rebase:false,discard:false,undo:false,restoreBaseline:false,close:true,productionChanges:false,certificateChanges:false,inputOrderTrace:false,newLiveTimingPolicy:false,extensionSetup:'historical-cli-preload',viewWidths:[1100,390]};}
export function admitRestoreAvailabilityPackage({h,types,admission,handoffSha256}){
 assert.equal(h.sourceDirty,false);assert.equal(h.package.version,'0.1.0-candidate.20261021.78');assert.equal(h.package.sha256,restoreAvailabilityCandidateSha);assert.equal(h.ui.sha256,restoreAvailabilityUISha);
 assert.equal(h.contract.apiVersion,1);assert.equal(h.contract.wireVersion,1);assert.equal(h.contract.uiContract,'2.1.0');
 assert.equal(types.package.sha256,h.package.sha256);assert.equal(types.checks.length,2);assert(types.checks.every(c=>c.status==='PASS'));
 assert.equal(admission.status,'PASS');assert.equal(admission.handoffSha256,handoffSha256);assert.equal(admission.checks.length,9);assert(admission.checks.every(c=>c.status==='PASS'));
}
export async function verifyRestoreAvailabilityFrozenInputs(expected,{read=readFile}={}){
 const entries=expected&&typeof expected==='object'&&!Array.isArray(expected)?Object.entries(expected):[];
 if(!entries.length||entries.length>1000||entries.some(([f,h])=>!path.isAbsolute(f)||path.resolve(f)!==f||typeof h!=='string'||!/^[a-f0-9]{64}$/.test(h)))throw error('INPUT_FORMAT');
 const actual={};for(const[f,h]of entries){actual[f]=sha256(await read(f));if(actual[f]!==h)throw error('FROZEN_INPUT_DRIFT');}return actual;
}
export async function registerRestoreAvailabilityRun(out,registration){
 await writeFile(out+'/registered-before-native.json',JSON.stringify(registration,null,2)+'\n',{flag:'wx'});
 await writeFile(out+'/native-run-started.json',JSON.stringify({at:new Date().toISOString(),pid:process.pid,browserStarted:false})+'\n',{flag:'wx'});
}
export async function captureRestoreAvailabilitySnapshot(record,key,ops){
 const now=ops.now||Date.now,snapshot={captureStatus:'Partial',startedAt:now()};record[key]=snapshot;
 try{const s=await ops.state();snapshot.inputs=s.inputs;snapshot.selection=s.selection;snapshot.dom=await ops.dom();snapshot.field=await ops.field();snapshot.captureStatus='Complete';return snapshot;}
 finally{snapshot.finishedAt=now();}
}
export async function acquireRestoreAvailabilityOwner(record,key,start){
 if(!['browser','desktop'].includes(key))throw error('INPUT_FORMAT');
 record.acquisition??={browser:'NotAttempted',desktop:'NotAttempted'};
 if(record.acquisition[key]!=='NotAttempted')throw error('ACQUISITION_REPLAY');
 record.acquisition[key]='Acquiring';if(key==='browser')record.browserNotStarted='Unknown/Unsupported';
 try{const owner=await start();if(!owner||typeof(key==='browser'?owner.context?.close:owner.close)!=='function')throw error('CLEANUP_UNCONFIRMED');record.acquisition[key]='Acquired';if(key==='browser')record.browserNotStarted=false;return owner;}
 catch(e){record.acquisition[key]='FailedCleanupUnknown';throw e;}
}
export async function closeRestoreAvailabilityOwner(record,key,owner){
 if(!owner){if(record.acquisition?.[key]&&record.acquisition[key]!=='NotAttempted')throw error('CLEANUP_UNCONFIRMED');return;}
 return key==='browser'?owner.context.close():owner.close();
}
export function readRestoreAvailabilityField(selector,doc=globalThis.document,style=globalThis.getComputedStyle){
 const field=doc.querySelector(selector),row=field?.closest('[data-input-resource]'),error=row?.querySelector('.sp-error');
 const visible=e=>{if(!e||e.hidden)return false;const s=style(e),r=e.getBoundingClientRect();return s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0;};
 const action=id=>{const e=doc.querySelector('[data-atom-id="'+id+'"]');return {exists:!!e,visible:visible(e),disabled:e?e.disabled:null};};
 const dirty=row?.getAttribute('data-dirty');
 return {rowPresent:!!field&&!!row,value:field?.value,focused:field===doc.activeElement,disabled:field?.disabled,dirty:dirty===null||dirty===undefined?null:dirty==='true',ariaInvalid:field?.getAttribute('aria-invalid'),rowErrorVisible:visible(error),rowError:error?.textContent||'',undo:action('input-undo'),baseline:action('input-baseline'),status:doc.querySelector('[data-atom-id="input-status"]')?.textContent,note:doc.querySelector('[data-atom-id="input-note"]')?.textContent,document:{url:doc.location.href,title:doc.title,mainPresent:!!doc.querySelector('[data-atom-root]')&&!!doc.querySelector('[data-atom-id="input-editor"]'),noOverlay:!doc.querySelector('vite-error-overlay, #webpack-dev-server-client-overlay, nextjs-portal')}};
}

async function preflight(caseFile){
 const s=await json(caseFile);assert.equal(s.schema,'stateatom.restore-availability-case/1');assert.equal(s.maximumNativeRuns,1);assert.deepEqual(s.protocol,restoreAvailabilityProtocol());
 assert(path.isAbsolute(s.out)&&s.out.startsWith(root+'/.artifacts/v03/restore-availability/'));assert.equal(s.atomSha256,restoreAvailabilityCandidateSha);assert.equal(s.uiSha256,restoreAvailabilityUISha);
 const actualNode={execPath:await realpath(process.execPath),procExe:await realpath('/proc/self/exe'),sha256:sha256(await readFile('/proc/self/exe'))};admitInspectorOrderNode(actualNode,s.node);
 const h=await json(s.atomHandoff),types=await json(s.packedTypes),admission=await json(s.packedAdmission);
 admitRestoreAvailabilityPackage({h,types,admission,handoffSha256:sha256(await readFile(s.atomHandoff))});
 const expected={...s.inputHashes,...s.productInputs,[caseFile]:sha256(await readFile(caseFile))},inputs=await verifyRestoreAvailabilityFrozenInputs(expected);
 assert.deepEqual(s.productInputs,Object.fromEntries(Object.entries(h.buildSources.manifest).map(([f,v])=>[path.resolve(f),v])));
 const app=(await json(s.dependencyReceipt)).apps.find(a=>a.slug==='Serkanbyx--e-commerce-frontend'),original=await json(app.sourceManifest);
 assert(app.originalSourceAndLockFilesMatch);assert.equal(Object.keys(original).length,65);
 for(const[f,v]of Object.entries(original))for(const base of[app.workingCopy,app.immutableSource])assert.equal(inputs[path.resolve(base,f)],v,'Missing original source input');
 await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
 for(const kind of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
 for(const[f,v]of Object.entries(h.consumerReceipt.hostFiles.standalone))assert.equal(inputs[path.resolve(h.hosts.standalone,f)],v);
 assert.equal(sha256(await readFile(s.chrome.executable)),s.chrome.sha256);
 for(const c of s.retainedResults)assert.equal(sha256(await readFile(c.file)),c.sha256);
 return {s,h,app,actualNode,inputs};
}

async function main(){
 const args=parseRestoreAvailabilityArgs(process.argv.slice(2)),{s,h,app,actualNode,inputs}=await preflight(args.caseFile);
 if(args.preflight){console.log(JSON.stringify({status:'PASS_RESTORE_AVAILABILITY_PREFLIGHT_ONLY',inputs:Object.keys(inputs).length,browserStarted:false,originalFiles:65}));return;}
 assert.equal(git(['status','--porcelain']),'','Commit frozen case before its one run');
 await registerRestoreAvailabilityRun(s.out,{schema:'stateatom.restore-availability-registration/1',sourceRevision:git(['rev-parse','HEAD']),case:s,caseFile:args.caseFile,actualNode,browserNotStarted:true,inputsBefore:inputs});
 const r={schema:'stateatom.restore-availability-native/1',status:'RUNNING',out:s.out,diagnosticOnly:true,originalCriteriaWaived:false,originalGuide:'FAIL',fullV03:false,traceInstrumented:false,productionChanges:false,actualNode,checks:[],edits:[],views:[],console:[],appConsole:[],errors:[],traffic:[],cleanup:{},inputsBefore:inputs,collectionMeaning:'Exact78 owned CLI-preload harness, no inspector trace. Snapshot fields are interval-bounded, not atomic; no React writer/model schedule or user-install proof.'};
 let api,vite,viteLog,viteOutput='',viteError,browser,desktop,panel,ui,tabId;
 const check=async(name,fn)=>{r.phase=name;await fn();r.checks.push({name,status:'PASS'});console.log('PASS',name);};
 const state=()=>rpc(panel,{op:'state',tabId,refreshDeep:false});
 const appCommand=(method,params={})=>panel.evaluate(async({id,method,params})=>chrome.debugger.sendCommand({tabId:id},method,params),{id:tabId,method,params});
 const appDOM=()=>panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:()=>({ready:document.readyState,minValue:document.querySelector('#minPrice')?.value,products:[...document.querySelectorAll('a[href^="/product/"]')].map(e=>Number(e.getAttribute('href').split('/').at(-1))).sort((a,b)=>a-b),imagesReady:[...document.querySelectorAll('a[href^="/product/"] img')].every(e=>e.complete&&e.naturalWidth>0),errorOverlay:!!document.querySelector('vite-error-overlay, #webpack-dev-server-client-overlay, nextjs-portal')})}))[0].result,tabId);
 const fieldSelector='[data-input-selector="#minPrice"] input',field=()=>panel.evaluate(readRestoreAvailabilityField,fieldSelector);
 const ops={state,dom:appDOM,field};
 const capture=(record,key)=>captureRestoreAvailabilitySnapshot(record,key,ops);
 async function windowSamples(key){
  const w={startedAt:Date.now(),requestedMs:1200,samples:[]};r[key]=w;
  try{while(Date.now()-w.startedAt<1200){assert(w.samples.length<64);await capture(w.samples,w.samples.length);await new Promise(resolve=>setTimeout(resolve,100));}}
  finally{w.finishedAt=Date.now();}
 }
 async function fill(value){
  await ui.p.send('Page.bringToFront');
  await panel.evaluate(selector=>{const e=document.querySelector(selector);if(!e||e.disabled)throw Error('Native field unavailable');for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS')a.open=true;e.scrollIntoView({block:'center'});e.focus();e.select();},fieldSelector);
  const startedAt=Date.now();await ui.p.send('Input.insertText',{text:String(value)});const f=await field();assert.equal(f.value,String(value));assert.equal(f.focused,true);r.edits.push({value,startedAt,finishedAt:Date.now(),enter:false,blur:false,focused:true});
 }
 async function settled(count,value){
  return waitFor(async()=>{const st=await state(),f=await field(),row=st.inputs?.resources.find(x=>x.resource.locator.selector==='#minPrice'),tx=st.inputs?.history.at(-1);if(f.rowErrorVisible)throw Error('Visible native field refusal');return st.inputs?.history.length===count&&tx.phase==='applied'&&!st.inputs.pending&&row.resource.value===value&&row.resource.revision!==tx.outcomes[0].after.revision&&row.externalRevision===true&&st.inputs.canUndo===false&&st.inputs.canRestoreBaseline===false&&f.undo.disabled===true&&f.baseline.disabled===true&&!f.dirty&&f.value===String(value);},20000);
 }
 try{
  await check('exact78-package-and-node-admission',async()=>{r.browserNotStarted=true;assert.equal(h.package.version,'0.1.0-candidate.20261021.78');});
  api=createServer((req,res)=>{r.traffic.push({method:req.method,url:req.url});res.setHeader('access-control-allow-origin','*');res.setHeader('cache-control','no-store');if(req.method!=='GET'){res.writeHead(405);res.end();return;}if(req.url==='/synthetic.svg'){res.setHeader('content-type','image/svg+xml');res.end(s.syntheticImage);return;}const products=s.syntheticProducts.map(({imagePath,...p})=>({...p,image:r.apiOrigin+imagePath})),data=req.url==='/products'?products:req.url==='/products/categories'?['electronics']:req.url==='/products/1'?products[0]:null;if(data===null){res.writeHead(404);res.end();return;}res.setHeader('content-type','application/json');res.end(JSON.stringify(data));});
  await new Promise((resolve,reject)=>{api.once('error',reject);api.listen(0,'127.0.0.1',resolve);});r.apiOrigin='http://127.0.0.1:'+api.address().port;
  const reservation=createServer();await new Promise((resolve,reject)=>{reservation.once('error',reject);reservation.listen(0,'127.0.0.1',resolve);});const appPort=reservation.address().port;await new Promise(resolve=>reservation.close(resolve));r.origin='http://127.0.0.1:'+appPort;
  const argv=[app.workingCopy+'/node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(appPort),'--strictPort'];viteLog=await open(s.out+'/vite.log','wx');vite=spawn(process.execPath,argv,{cwd:app.workingCopy,env:{PATH:path.dirname(process.execPath)+':/usr/bin:/bin',LANG:'C.UTF-8',CI:'1',VITE_API_BASE_URL:r.apiOrigin},stdio:['ignore','pipe','pipe']});vite.once('error',e=>viteError=e);for(const stream of[vite.stdout,vite.stderr])stream.on('data',d=>viteOutput+=d);
  await waitFor(()=>viteError||vite.exitCode!==null||stripVTControlCharacters(viteOutput).includes(r.origin+'/'),30000);if(viteError)throw viteError;assert.equal(vite.exitCode,null);assert.equal(await realpath('/proc/'+vite.pid+'/exe'),actualNode.procExe);assert.equal(sha256(await readFile('/proc/'+vite.pid+'/exe')),actualNode.sha256);r.vite={pid:vite.pid,execPath:actualNode.procExe,sha256:actualNode.sha256,args:argv};
  desktop=await acquireRestoreAvailabilityOwner(r,'desktop',()=>sourceAccessDesktop(s.out));browser=await acquireRestoreAvailabilityOwner(r,'browser',()=>startNativeBrowser(s.out,'browser',true,false,[],{extensionPath:h.hosts.standalone,headless:false,display:desktop.display}));r.browser=browser.command;
  assert.equal(browser.context.browser().version(),s.chrome.version);assert.equal(browser.command.executable,s.chrome.executable);assert.equal(browser.command.extensionSetup,'historical-cli-preload');assert(!browser.command.args.some(a=>/no-sandbox|ignore-certificate-errors|disable-web-security/.test(a)));
  panel=await browser.context.newPage();r.panelURL='chrome-extension://'+browser.id+'/panel.html';await panel.goto(r.panelURL);panel.on('pageerror',e=>r.errors.push(e.message));ui=await nativeInspectorUI(panel,browser);ui.p.on('Runtime.consoleAPICalled',e=>{if(['error','warning','warn'].includes(e.type))r.console.push({surface:'inspector',type:e.type,text:e.args.map(a=>a.value??a.description??'').join(' ')});});await ui.p.send('Runtime.enable');
  tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,r.origin+'/');r.tabId=tabId;await waitFor(async()=>{const d=await appDOM();return d.ready==='complete'&&d.minValue==='0'&&JSON.stringify(d.products)==='[1,2]'&&d.imagesReady;},60000);
  await ui.click('refresh-tabs');await ui.waitOK();await ui.select('tabs',tabId);await ui.waitOK();await ui.select('site-mode','development');for(const action of['cache','reload','override','replay'])if(await panel.evaluate(sel=>document.querySelector(sel).checked,ui.q('site-'+action))!==['cache','replay'].includes(action))await ui.click('site-'+action);await ui.click('save-site');await ui.waitOK();await ui.click('attach');await ui.waitOK();
  await panel.evaluate(id=>{globalThis.__restoreAvailabilityAppLogs=[];chrome.debugger.onEvent.addListener((source,method,params)=>{if(source.tabId===id&&(method==='Runtime.exceptionThrown'||method==='Runtime.consoleAPICalled'&&['error','warning','warn'].includes(params.type)))globalThis.__restoreAvailabilityAppLogs.push({method,params});});},tabId);
  await ui.select('property','disabled');await ui.waitOK();await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');
  const point=(await appCommand('Runtime.evaluate',{expression:`(()=>{const e=document.querySelector('#minPrice');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`,returnByValue:true})).result.value;
  await panel.evaluate(id=>chrome.tabs.update(id,{active:true}),tabId);await appCommand('Page.bringToFront');for(const type of['mouseMoved','mousePressed','mouseReleased'])await appCommand('Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});await waitFor(async()=>(await state()).selection);
  await check('original-picker-and-open',async()=>{
   const st=await state();assert.equal(st.selection.property,'disabled');assert.equal(st.selection.value,false);assert.equal(st.selection.tag,'input');assert.equal(st.connection.mode,'development');assert.deepEqual([...st.connection.actions].sort(),['cache','replay']);assert.equal(st.productionChange.active,false);
   r.selectedControlMatchesOriginal=await panel.evaluate(async({id,selector})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:sel=>document.querySelector(sel)===document.querySelector('#minPrice'),args:[selector]}))[0].result,{id:tabId,selector:st.selection.selector});assert.equal(r.selectedControlMatchesOriginal,true);
   await ui.click('inputs-nav');await ui.select('input-source','dom-control');await waitFor(async()=>!await panel.evaluate(sel=>document.querySelector(sel).disabled,ui.q('input-open')));await ui.click('input-open');await waitFor(async()=>(await state()).inputs?.resources.some(x=>x.resource.locator.selector==='#minPrice'));await waitFor(()=>panel.evaluate(sel=>document.querySelector(sel).getAttribute('aria-busy')==='false',ui.q('input-editor')));await capture(r,'baseline');assert.equal(r.baseline.inputs.history.length,0);
  });
  await check('live10-and-disabled-restoration',async()=>{await fill(10);await settled(1,10);await windowSamples('firstWindow');await capture(r,'afterFirst');});
  await check('live20-and-disabled-restoration',async()=>{await fill(20);await settled(2,20);await windowSamples('secondWindow');await capture(r,'afterSecond');});
  // Screenshots are candidate evidence of the active editor before Close.
  for(const width of [1100,390]){const file=s.out+'/inputs-'+width+'-candidate.png',view=await ui.screenshot(file,{width,focus:'inputs-section'});r.views.push(view);await copyFile(file,'/tmp/stateatom-restore-availability-'+width+'-candidate.png');}
  await check('native-close-preserves-value',async()=>{await ui.click('input-close');await waitFor(async()=>{const st=await state();return st.inputs?.closed===true&&st.inputs.cleanup==='closed';});await capture(r,'closed');guardRestoreAvailability(r);});
  await check('console-host-and-rendered-checks',async()=>{r.appConsole=await panel.evaluate(()=>globalThis.__restoreAvailabilityAppLogs);assert.deepEqual(r.appConsole,[]);assert.deepEqual(r.console,[]);assert.deepEqual(r.errors,[]);assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);});
  r.status=restoreAvailabilityPass;
 }catch(e){r.errors.push(String(e.stack||e));r.status='INCOMPLETE_RESTORE_AVAILABILITY';process.exitCode=1;if(panel&&tabId)try{await capture(r,'failure');await panel.screenshot({path:s.out+'/failure-candidate.png'});}catch(e){r.errors.push('Partial capture: '+e.message);}}
 finally{
  await cleanupRestoreAvailability([
   ['inspector',()=>ui?.close()],['browser',()=>closeRestoreAvailabilityOwner(r,'browser',browser)],
   ['vite',async()=>{if(vite&&vite.exitCode===null&&vite.signalCode===null){vite.kill('SIGTERM');try{await waitFor(()=>vite.exitCode!==null||vite.signalCode!==null,5000);}catch{vite.kill('SIGKILL');await waitFor(()=>vite.exitCode!==null||vite.signalCode!==null,5000);}}}],
   ['viteLogWrite',()=>viteLog?.writeFile(viteOutput)],['viteLogClose',()=>viteLog?.close()],
   ['api',async()=>{if(api){api.closeAllConnections();if(api.listening)await new Promise((resolve,reject)=>api.close(e=>e?reject(e):resolve()));}}],['desktop',()=>closeRestoreAvailabilityOwner(r,'desktop',desktop)]
  ],r);
  r.cleanup.pidsAbsent=Object.values(r.acquisition||{}).includes('FailedCleanupUnknown')?'Unknown/Unsupported':true;for(const pid of[vite?.pid,browser?.command.pid].filter(Number.isInteger))try{process.kill(pid,0);r.cleanup.pidsAbsent=false;}catch(e){if(e.code!=='ESRCH')r.cleanup.pidsAbsent=false;}
  r.inputsAfter={};for(const f of Object.keys(inputs))try{r.inputsAfter[f]=sha256(await readFile(f));}catch{r.inputsAfter[f]='UNAVAILABLE';}
  r.inputsUnchanged=JSON.stringify(r.inputsAfter)===JSON.stringify(inputs);finalizeRestoreAvailability(r);if(r.status!==restoreAvailabilityPass)process.exitCode=1;
  r.finishedAt=new Date().toISOString();await writeFile(s.out+'/results.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log(r.status,s.out+'/results.json');
 }
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)main().catch(e=>{const allowed=['INVALID_ARGUMENTS','CASE_SCOPE','FROZEN_INPUT_DRIFT','INPUT_FORMAT','OUTPUT_SCOPE','EEXIST','ENOENT','EACCES'];console.error('RESTORE_AVAILABILITY_ERROR',allowed.includes(e?.code)?e.code:'FAILED');process.exitCode=1;});
