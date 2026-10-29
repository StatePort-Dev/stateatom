// SPDX-License-Identifier: Apache-2.0
// Actual packaged product controls; no injected facts or model API replacement.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,open,copyFile,access,readlink} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {fork,execFileSync} from 'node:child_process';
import {fileManifest,sha256} from '../../scripts/atom-package-receipt.mjs';
import {pilotFileSha256,pilotProfileManifest} from '../../experiments/official-comparison-pilot-qualification.mjs';
import {startNativeBrowser,nativeApproveDevelopment} from '../../scripts/native-browser.mjs';
import {startIDE,rpc,waitFor,sleep} from '../../scripts/harness.mjs';
import {sourceAccessDesktop} from '../helpers/source-access-native-desktop.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {readExplanationUI} from '../helpers/explanation-native-cases.mjs';
const root=resolve(import.meta.dirname,'../..'),casePath='docs/testing/grounded-product-case.json';
const [kind,caseSha,revision]=process.argv.slice(2),git=(...a)=>execFileSync('git',a,{cwd:root,encoding:'utf8'}).trim();
assert(['official','standalone'].includes(kind));assert.match(caseSha,/^[a-f0-9]{64}$/);assert.match(revision,/^[a-f0-9]{40}$/);
const bytes=await readFile(resolve(root,casePath)),c=JSON.parse(bytes);assert.equal(sha256(bytes),caseSha);assert.equal(git('rev-parse','HEAD'),revision);assert.equal(git('status','--porcelain'),'');
const pc=JSON.parse(await readFile(resolve(root,c.profileCase))),out=resolve(root,c.out,kind),host=c.hosts[kind],project=c.project;
const verify=async()=>{for(const [p,h]of Object.entries(c.inputs))assert.equal(await pilotFileSha256(resolve(root,p)),h,p);assert.deepEqual(await fileManifest(host.path),host.files);assert.deepEqual(await pilotProfileManifest(pc.profileSource),{files:pc.profileFiles,links:pc.profileLinks});};
await verify();assert.equal(await access('/proc/'+pc.profileSourceOwnerPid).then(()=>true,()=>false),false);await mkdir(out,{recursive:true});
const attempt=await open(out+'/attempt.json','wx');await attempt.writeFile(JSON.stringify({revision,caseSha,maximumAttempts:1,kind,at:new Date().toISOString()}));await attempt.close();
const r={schema:'stateatom.grounded-product-native/1',status:'RUNNING',revision,caseSha,kind,host,plugin:c.plugin,vsix:c.vsix,startedAt:new Date().toISOString(),scope:'Real packaged product UI, installed plugin and VSIX, synthetic ordinary React fixture; extension-only offline, test-only loadUnpacked, no API overrides or injected model facts. Not normal-installation or human proof.',modelBuildId:'Unknown; not API-exposed',nativeApiCallCounts:'Unknown; UI initiation counts separately recorded',checks:[],modelUIInitiations:0,errors:[],cleanup:{}};
await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));await writeFile(out+'/case.json',bytes);
let browser,desktop,control,panel,ui,ide,server,serverLog,tabId,origin;
const persist=()=>writeFile(out+'/results-running.json',JSON.stringify(r,null,2)+'\n');
async function check(name,fn){r.currentCheck=name;console.log('START',name);const evidence=await fn();r.checks.push({name,status:'PASS',evidence});await persist();console.log('PASS',name);}
async function local(){return panel.evaluate(()=>{const e=id=>document.querySelector('[data-atom-id="'+(id==='property-explanation'?'property-disabled-recorded-answer':id.replace('property-local-','property-disabled-local-'))+'"]');return{open:e('property-local-tools').open,hidden:e('property-local-tools').hidden,enabled:e('property-local-enabled').checked,disabled:e('property-local-run').disabled,cancelHidden:e('property-local-cancel').hidden,note:e('property-local-note').textContent,status:e('property-local-status').textContent,template:e('property-explanation').textContent};});}
async function probe(){return panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>({ready:!!document.getElementById('condition'),events:window.ordinaryPropertyEvents??null,hold:document.getElementById('controls-hold')?.checked,condition:document.getElementById('condition')?.disabled,mask:document.getElementById('mask')?.disabled})}))[0]?.result,tabId);}
async function pick(selector){
 await ui.click('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');
 const point=await panel.evaluate(async({id,selector})=>{await chrome.tabs.update(id,{active:true});return(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:async selector=>{const e=document.querySelector(selector);e.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect(),x=r.x+Math.min(8,r.width/2),y=r.y+r.height/2,hit=document.elementFromPoint(x,y);if(hit!==e&&!e.contains(hit))throw Error('App picker target covered');return{x,y};},args:[selector]}))[0].result;},{id:tabId,selector});
 await panel.evaluate(async({id,point})=>{for(const type of ['mouseMoved','mousePressed','mouseReleased'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});},{id:tabId,point});
 return waitFor(async()=>{const state=await rpc(panel,{op:'state',tabId});return state.picker?.status==='selected'&&state.selection?.selector===selector&&state.elementInspection?state:null;});
}
async function inspect(selector){
 await ui.click('inputs-nav');const state=await pick(selector);await ui.waitOK();
 const row=state.elementInspection.properties.find(row=>row.property==='disabled');assert(row);assert.equal(row.analysis.stateatom.runtime.status,'Observed');assert.equal(row.analysis.stateatom.runtime.target.sourceDigest,await pilotFileSha256(project+'/control-src/App.jsx'));
 await waitFor(async()=>!(await local()).hidden);return{selection:row.selection,runtime:row.analysis.stateatom.runtime,explanation:await readExplanationUI(panel)};
}
async function explain(){assert(++r.modelUIInitiations<=c.maxUIInitiationsPerHost);await ui.click('property-disabled-local-run');}
async function generating(){return waitFor(async()=>{const s=await local();return s.status==='Selecting a local explanation…'&&!s.cancelHidden&&s.disabled?s:null;},120000);}
async function success(){return waitFor(async()=>{const s=await local();if(!s.disabled&&s.cancelHidden&&!s.note&&s.status!=='Checking local model availability…')throw Error('No model note: '+s.status);return !s.disabled&&s.cancelHidden&&s.note&&s.status==='Model-selected recorded facts · derived note, not evidence.'?s:null;},120000);}
try{
 const profile=out+'/profiles/model';await mkdir(profile,{recursive:true});for(const [p,h]of Object.entries(pc.cloneFiles)){const dest=join(profile,p);await mkdir(dirname(dest),{recursive:true});await copyFile(join(pc.profileSource,p),dest);assert.equal(await pilotFileSha256(dest),h,p);}assert.deepEqual(await pilotProfileManifest(profile),{files:pc.cloneFiles,links:{}});
 desktop=await sourceAccessDesktop(out);r.display=desktop.display;
 serverLog=await open(out+'/server.log','wx');server=fork(resolve(root,'tests/helpers/grounded-product-server.mjs'),[project],{cwd:project,stdio:['ignore',serverLog.fd,serverLog.fd,'ipc']});let ready,error;server.on('message',m=>{if(m.type==='ready')ready=m;else error=m.message;});r.server=await waitFor(()=>{if(error)throw Error(error);return ready;},45000);origin=ready.origin;
 ide=await startIDE(out+'/profiles/ide',{logDir:out+'/ide',installedVsix:c.vsix.file,projectRoot:project,ownedEndpoint:true,userSettings:{'stateatom.appOrigin':origin,'stateatom.sourceFolder':'control-src'}});r.ide={installedVsix:c.vsix,ownedEndpoint:true,sourceRoot:'control-src'};
 browser=await startNativeBrowser(out+'/profiles','model',true,true,['--enable-unsafe-extension-debugging'],{executablePath:'/usr/bin/google-chrome',extensionPath:host.path,headless:false,display:desktop.display,beforeExtensionLoad:async({send})=>{r.loadedExtensionId=(await send('Extensions.loadUnpacked',{path:host.path})).id;}});
 browser.command.extensionSetup='test-only Extensions.loadUnpacked; normal installation separate';r.browser={version:browser.context.browser().version(),command:browser.command};assert.equal(r.browser.version,pc.browserProduct);assert.equal(await pilotFileSha256('/proc/'+browser.command.pid+'/exe'),pc.browserExeSha256);
 const {ownedBrowserControl}=await import(pathToFileURL(pc.googleAdapter));control=await ownedBrowserControl(browser.command);r.owner=control.provenance;
 panel=await browser.context.newPage();panel.on('pageerror',e=>r.errors.push(e.message));await panel.goto('chrome-extension://'+browser.id+'/'+host.page);ui=await nativeInspectorUI(panel,browser);await ui.p.send('Emulation.setDeviceMetricsOverride',{width:1100,height:900,deviceScaleFactor:1,mobile:false});
 await panel.evaluate(()=>{globalThis.__groundedClicks=[];document.addEventListener('click',e=>{const id=e.target.closest('[data-atom-id]')?.dataset.atomId;if(id?.startsWith('property-local')||id?.startsWith('action-'))globalThis.__groundedClicks.push({id,trusted:e.isTrusted,active:navigator.userActivation.isActive});},true);});
 await check('actual source pairing and recorded ordinary property',async()=>{
  tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin);await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
  await nativeApproveDevelopment(panel,tabId);await ui.click('refresh-tabs');await waitFor(()=>panel.evaluate(id=>[...document.querySelector('[data-atom-id="tabs"]').options].some(o=>o.value===String(id)),tabId));await ui.select('tabs',tabId);
  await waitFor(()=>panel.evaluate(id=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return Number(get('tabs').value)===id&&get('site-mode').value==='development'&&get('status').textContent==='OK'&&get('connection-label').textContent==='Not attached';},tabId));await ui.click('attach');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).attached);await ui.waitOK();
  await ui.click('source-nav');for(const[id,value]of[['bridge',ide.conn.url],['origin',origin],['source-root','control-src'],['token',ide.conn.token]])await ui.fill(id,value);await ui.click('pair');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).connection.source?.url===ide.conn.url);await ui.fill('token','');
  const before=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree')).frameTree.frame.loaderId,tabId);await panel.evaluate(id=>chrome.debugger.sendCommand({tabId:id},'Page.reload',{ignoreCache:true}),tabId);
  await waitFor(async()=>await panel.evaluate(async({id,before})=>(await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree')).frameTree.frame.loaderId!==before,{id:tabId,before})&&(await probe())?.ready);
  const selected=await inspect('#condition');assert.equal(selected.selection.value,true);assert.deepEqual((await probe()).events,[]);assert.equal((await local()).open,false);assert.equal((await local()).enabled,false);assert.equal((await local()).note,'');return selected;
 });
 let original;
 await check('explicit opt-in metadata and actual model note retain recorded answer',async()=>{
  original=(await local()).template;await ui.click('property-disabled-local-enabled');await waitFor(async()=>(await local()).status==='Local model available.',30000);assert.equal((await local()).note,'');const at=Date.now();await explain();const state=await success();assert.equal(state.template,original);assert.match(state.note,/true/);assert.match(state.note,/unavailable|unknown/i);assert.deepEqual((await probe()).events,[]);return{state,elapsedMs:Date.now()-at,explanation:await readExplanationUI(panel)};
 });
 await check('Cancel during generation clears note and prevents late publication',async()=>{
  await explain();const before=await generating();await ui.click('property-disabled-local-cancel');const after=await local();assert.equal(after.status,'Cancelled. The recorded answer is unchanged.');assert.equal(after.note,'');assert.equal(after.template,original);await sleep(4500);assert.deepEqual(await local(),after);return{before,after};
 });
 await check('equal-value different DOM target cancels pending old note',async()=>{
  await explain();const before=await generating();const selected=await inspect('#mask');assert.equal(selected.selection.value,true);const after=await local();assert.equal(after.note,'');assert.equal(after.cancelHidden,true);assert.equal(after.open,false);await sleep(4500);assert.deepEqual(await local(),after);return{before,after,selected};
 });
 await check('fresh inference works with extension document offline',async()=>{
  const fetchProbe=()=>panel.evaluate(async url=>{try{const r=await fetch(url,{cache:'no-store'});return{ok:r.ok};}catch(e){return{ok:false,name:e.name};}},origin+'/index.html');assert.equal((await fetchProbe()).ok,true);
  await ui.p.send('Network.enable');await ui.p.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});const online=await panel.evaluate(()=>navigator.onLine),fetch=await fetchProbe();assert.equal(online,false);assert.equal(fetch.ok,false);
  await ui.click('property-disabled-local-enabled');await waitFor(async()=>(await local()).status==='Local model available.',30000);const template=(await local()).template,at=Date.now();await explain();const state=await success();assert.equal(state.template,template);assert.deepEqual((await probe()).events,[]);
  await ui.p.send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});return{state,elapsedMs:Date.now()-at,online,fetch,scope:'Extension document only; not whole-device network airgap'};
 });
 await check('rendered disclosure, narrow views, keyboard and actual zoom',async()=>{
  const views=[];for(const width of[440,390]){const view=await ui.screenshot(out+'/property-'+width+'-candidate.png',{width,focus:'element-properties'});assert.equal(view.overflow,false);assert.equal(view.rootFont,'13px');views.push(view);}
  await panel.evaluate(()=>{const s=document.querySelector('[data-atom-id="property-disabled-local-tools"] > summary');s.scrollIntoView({block:'center'});s.focus();});const was=(await local()).open;await ui.key('Enter','Enter',13);assert.equal((await local()).open,!was);await ui.key('Enter','Enter',13);assert.equal((await local()).open,was);
  await ui.p.send('Emulation.setDeviceMetricsOverride',{width:1100,height:900,deviceScaleFactor:1,mobile:false});await panel.evaluate(async()=>{const t=await chrome.tabs.getCurrent();await chrome.tabs.setZoom(t.id,2);});await sleep(200);const zoom=await panel.evaluate(async()=>({zoom:await chrome.tabs.getZoom((await chrome.tabs.getCurrent()).id),overflow:document.documentElement.scrollWidth>innerWidth+1}));assert.equal(zoom.zoom,2);assert.equal(zoom.overflow,false);await panel.screenshot({path:out+'/property-zoom200-candidate.png'});await panel.evaluate(async()=>chrome.tabs.setZoom((await chrome.tabs.getCurrent()).id,1));return{views,zoom,humanReviewed:false};
 });
 await check('opt-out removes note without changing recorded answer',async()=>{const before=await local();await ui.click('property-disabled-local-enabled');const after=await local();assert.equal(after.enabled,false);assert.equal(after.disabled,true);assert.equal(after.note,'');assert.equal(after.template,before.template);return after;});
 await check('actual Actions model note remains separate from deterministic answer',async()=>{
  await pick('#controls-name');await ui.click('actions-nav');await ui.click('action-explain');await waitFor(async()=>!!await ui.text('action-explanation'));const template=await ui.text('action-explanation');await ui.click('action-local-enabled');await waitFor(async()=>await ui.text('action-local-status')==='Local model available.',30000);
  assert(++r.modelUIInitiations<=c.maxUIInitiationsPerHost);await ui.click('action-explain');const state=await waitFor(()=>panel.evaluate(()=>{const e=id=>document.querySelector('[data-atom-id="'+id+'"]');return !e('action-explain').disabled&&e('action-local-note').textContent?{template:e('action-explanation').textContent,note:e('action-local-note').textContent,status:e('action-local-status').textContent}:null;}),120000);assert.equal(state.template,template);assert.match(state.status,/Model-selected/);assert.deepEqual((await probe()).events,[]);await ui.screenshot(out+'/actions-390-candidate.png',{width:390,focus:'action-explanation'});return state;
 });
 r.clickAudit=await panel.evaluate(()=>globalThis.__groundedClicks);assert(r.clickAudit.filter(x=>['property-disabled-local-run','property-disabled-local-cancel','property-disabled-local-enabled','action-explain','action-local-enabled'].includes(x.id)).every(x=>x.trusted&&x.active));assert.equal(r.errors.length,0);r.status='PASS_PRODUCT_CONTROLS_PENDING_CLEANUP';
}catch(error){r.status='INCOMPLETE_PRODUCT_CONTROLS';r.error=error.stack;process.exitCode=1;console.error(error.stack);if(panel){r.lastUI=await panel.evaluate(()=>document.body.innerText).catch(String);r.lastLocal=await local().catch(String);await panel.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}}
finally{
 for(const[name,fn]of[['ui',()=>ui?.close()],['control',()=>control?.close()],['browser',()=>browser?.context.close()],['ide',()=>ide?.close(false)],['server',async()=>{if(server&&server.exitCode===null){server.send({op:'stop'});try{await waitFor(()=>server.exitCode!==null,10000);}catch{server.kill('SIGTERM');await waitFor(()=>server.exitCode!==null,5000);}}await serverLog?.close();}],['desktop',()=>desktop?.close()]])try{await fn();r.cleanup[name]=true;}catch(error){r.cleanup[name]=false;r.errors.push(name+': '+String(error));}
 if(browser?.command?.pid)r.cleanup.browserPidAbsent=await access('/proc/'+browser.command.pid).then(()=>false,()=>true);
 try{await verify();r.frozenInputsUnchanged=true;}catch(error){r.frozenInputsUnchanged=false;r.errors.push(String(error));}
 r.finishedAt=new Date().toISOString();if(r.status==='PASS_PRODUCT_CONTROLS_PENDING_CLEANUP'&&Object.values(r.cleanup).every(Boolean)&&r.frozenInputsUnchanged&&!r.errors.length)r.status='PASS_BOUNDED_PRODUCT_CONTROLS';else process.exitCode=1;
 await writeFile(out+'/results.json',JSON.stringify(r,null,2)+'\n');console.log(r.status,out);
}
