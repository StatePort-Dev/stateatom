// SPDX-License-Identifier: Apache-2.0
// Normal local extension update/rollback with a real saved Capture Card.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {waitFor,rpc} from '../../scripts/harness.mjs';
import {fileManifest,sha256} from '../../scripts/atom-package-receipt.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {sourceAccessDesktop} from '../helpers/source-access-native-desktop.mjs';
import {installGuideExtension} from '../helpers/guide-extension-install.mjs';
const host=path.resolve(process.argv[2]||'/home/roman/projects/scenariodeck');
const fromHost=rel=>import(pathToFileURL(path.join(host,rel)).href);
const {createLocalRuntime}=await fromHost('packages/local-runtime/src/runtime.ts');
const {startExtensionBridgeServer}=await fromHost('packages/local-runtime/src/extension-bridge-server.ts');
const {FileStateCardRepository}=await fromHost('packages/local-runtime/src/state-card-repository.ts');
const {readCaptureSessionCheckpointSource}=await fromHost('packages/run-engine/src/index.ts');
const spec=JSON.parse(await readFile(process.argv[3]||'docs/testing/current95-host-case.json'));
const out=path.resolve('.artifacts/i03/current95-update/'+new Date().toISOString().replace(/[:.]/g,'-'));
await mkdir(out,{recursive:true,mode:0o700});
const extension=out+'/extension',runtimeRoot=out+'/runtime',socket=out+'/capture.sock',binary=out+'/capture-host',profile=out+'/profiles/official';
const result={schema:'stateatom.local-update-capture/1',status:'RUNNING',out,startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),checks:[],steps:[],errors:[],scope:'Normal unpacked extension install/update/rollback; real Capture bridge and Review/Save runtime APIs, not OS-installed Desktop GUI or public update channel'};
const check=name=>{result.checks.push(name);console.log('PASS',name);};
await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
await writeFile(out+'/case.json',JSON.stringify(spec,null,2));
const sources={'current95':spec.hosts.official,'previous94':spec.previousOfficial};
let desktop,browser,panel,driver,bridge,server,card,cardIdentity,diagnostics,tabId,origin;
const runtime=createLocalRuntime(runtimeRoot,{developmentAccess:true,validation:true});
const repository=new FileStateCardRepository(runtimeRoot);
async function nativeClick(page,selector){const p=await page.session();try{await p.send('Page.bringToFront');const point=await waitFor(()=>page.evaluate(async selector=>{const e=document.querySelector(selector);if(!e||e.disabled)return null;e.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return r.width&&r.height&&(hit===e||e.contains(hit))?{x,y}:null;},selector));for(const type of ['mouseMoved','mousePressed','mouseReleased'])await p.send('Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});}finally{await p.detach();}}
async function openPanel(){panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/atom.html');panel.on('pageerror',e=>result.errors.push(e.message));driver=await nativeInspectorUI(panel,browser);await driver.click('setup-toggle');await driver.click('refresh-tabs');await driver.waitOK();await waitFor(()=>panel.evaluate(({selector,id})=>[...document.querySelector(selector).options].some(x=>x.value===String(id)),{selector:driver.q('tabs'),id:tabId}));await driver.select('tabs',tabId);await driver.waitOK();}
async function captureStatus(){return panel.evaluate(targetTabId=>chrome.runtime.sendMessage({kind:'status',targetTabId}),tabId);}
async function verifyCard(stage){const stored=await repository.read(card.stateCardId);assert(stored);assert.deepEqual({revision:stored.revision,source:stored.source},cardIdentity);const exact=await readCaptureSessionCheckpointSource({captureSessionPath:stored.source.captureSessionPath,expectedCaptureSessionDigest:stored.source.captureSessionDigest,checkpointId:stored.source.checkpointId});assert.equal(exact.source.sessionDigest,stored.source.captureSessionDigest);assert.deepEqual(await fileManifest(path.dirname(stored.source.captureSessionPath)),result.captureFiles);result.steps.push({stage,cardId:stored.stateCardId,revision:stored.revision,source:stored.source,exactSourceVerified:true});}
async function reloadFromChrome(stage){
 const before=(await browser.native.send('Target.getTargets')).targetInfos.filter(t=>t.type==='service_worker'&&t.url.startsWith('chrome-extension://'+browser.id+'/'));
 await driver?.close();driver=null;
 const chromePage=await browser.context.newPage();await chromePage.goto('chrome://extensions/');
 const p=await chromePage.session();try{
  await p.send('Page.bringToFront');
  const control=await waitFor(()=>chromePage.evaluate(id=>{const nodes=[];function walk(n){nodes.push(n);if(n.shadowRoot)walk(n.shadowRoot);for(const c of n.children||[])walk(c);}walk(document.documentElement);const card=nodes.find(n=>n.tagName==='EXTENSIONS-ITEM'&&n.id===id);if(!card)return null;const buttons=[...card.shadowRoot.querySelectorAll('cr-icon-button,cr-button,button')];const e=buttons.find(e=>/reload/i.test([e.id,e.getAttribute('title'),e.getAttribute('aria-label')].join(' ')));if(!e||e.disabled)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return r.width&&r.height?{x:r.x+r.width/2,y:r.y+r.height/2,id:e.id,title:e.getAttribute('title'),aria:e.getAttribute('aria-label')}:null;},browser.id));
  result.steps.push({stage,action:'trusted rendered Chrome Reload extension',control});
  for(const type of ['mouseMoved','mousePressed','mouseReleased'])await p.send('Input.dispatchMouseEvent',{type,x:control.x,y:control.y,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});
  await waitFor(async()=>{const targets=(await browser.native.send('Target.getTargets')).targetInfos;return targets.some(t=>t.type==='service_worker'&&t.url.startsWith('chrome-extension://'+browser.id+'/')&&!before.some(b=>b.targetId===t.targetId));});
 }finally{await p.detach();}
 await openPanel();
 const loaded=await panel.evaluate(async()=>{const bytes=await(await fetch(chrome.runtime.getURL('service-worker.js'))).arrayBuffer();return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');});
 assert.equal(loaded,(await fileManifest(extension))['service-worker.js']);
 const state=await rpc(panel,{op:'state',tabId,refreshDeep:false});assert.equal(state.attached,false);assert.equal(state.productionChange.active,false);
 const saved=await panel.evaluate(()=>chrome.storage.local.get('stateport.atom.v1.diagnostics'));assert.deepEqual(saved,diagnostics);
 const capture=await captureStatus();assert.notEqual(capture.phase,'recording');assert.notEqual(capture.phase,'starting');
 await verifyCard(stage);result.steps.push({stage,loadedWorkerSha256:loaded,attached:state.attached,productionChange:state.productionChange,capturePhase:capture.phase});
 check(stage+': new worker, no resumed attachment/changes, same exact Card and historical diagnostic');
 if(spec.changedShellFiles&&stage!=='rollback95-to94'){
  await driver.screenshot(out+'/'+stage+'-atom390.png',{width:390});await nativeClick(panel,'#workspace-capture');
  const geometry=await panel.evaluate(()=>{const workspace=document.querySelector('[data-atom-id="inspection"]'),capture=document.querySelector('#capture-container'),r=capture.getBoundingClientRect();return{hidden:workspace.hidden,display:getComputedStyle(workspace).display,captureTop:r.y,captureHeight:r.height,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(geometry.hidden,true);assert.equal(geometry.display,'none');assert(geometry.captureTop<160);assert.equal(geometry.overflow,false);result.steps.push({stage,shellGeometry:geometry});await panel.screenshot({path:out+'/'+stage+'-capture390.png'});
  await nativeClick(panel,'#workspace-atom');assert.equal(await panel.evaluate(()=>document.querySelector('[data-atom-id="inspection"]').hidden),false);check(stage+': real Capture surface occupies workspace without Atom tabs or blank flex region');
 }
}
try{
 for(const s of Object.values(sources))assert.deepEqual(await fileManifest(s.path),s.files);
 await cp(sources.previous94.path,extension,{recursive:true});assert.deepEqual(await fileManifest(extension),sources.previous94.files);
 const identity=JSON.parse(await readFile(host+'/apps/chrome-extension/identity.json'));result.identity={extensionId:identity.developmentId,hostName:identity.hostName,storeId:identity.storeId};
 execFileSync('g++',['-std=c++17','-O2','-DSTATEPORT_TEST_SOCKET="'+socket+'"','-DSTATEPORT_EXTENSION_ID="'+identity.developmentId+'"',host+'/apps/chrome-extension/native/host.cpp','-o',binary]);
 await mkdir(profile+'/NativeMessagingHosts',{recursive:true});await writeFile(profile+'/NativeMessagingHosts/'+identity.hostName+'.json',JSON.stringify({name:identity.hostName,description:'Owned I03 local Capture host',path:binary,type:'stdio',allowed_origins:['chrome-extension://'+identity.developmentId+'/']}));
 result.nativeHost={sha256:sha256(await readFile(binary)),sourceSha256:sha256(await readFile(host+'/apps/chrome-extension/native/host.cpp')),registration:'owned browser profile only'};
 bridge=await startExtensionBridgeServer({socketPath:socket,extensionIds:[identity.developmentId],runtime,runtimeVersion:JSON.parse(await readFile(host+'/apps/desktop/package.json')).version});
 server=createServer((req,res)=>{res.setHeader('cache-control','no-store');if(req.url==='/api/item'){res.setHeader('content-type','application/json');res.end('{"title":"Synthetic update card"}');}else if(req.url==='/favicon.ico'){res.writeHead(204);res.end();}else{res.setHeader('content-type','text/html');res.end('<!doctype html><title>I03 update control</title><main><h1 id="title">Loading</h1><button id="change">Change label</button></main><script>fetch("/api/item").then(r=>r.json()).then(v=>{document.querySelector("h1").textContent=v.title;document.body.dataset.ready="yes"});document.querySelector("button").onclick=()=>document.querySelector("h1").textContent="Changed by user";</script>');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;result.origin=origin;
 desktop=await sourceAccessDesktop(out);browser=await startNativeBrowser(out+'/profiles','official',true,false,[],{extensionPath:extension,headless:false,display:desktop.display,beforeExtensionLoad:async api=>{result.installation=await installGuideExtension(api,{folder:extension,desktop,out,role:'previous94',expectedName:JSON.parse(await readFile(extension+'/manifest.json')).name,expectedBrowser:'Chrome/153.0.8010.12',expectedExecutableSha256:'8c599d43aec53f2460a31ae2f4af6bd863f8258b34ff519564bc5d4726bfaa1e'});}});assert.equal(browser.id,identity.developmentId);
 panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/atom.html');tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin);await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));await (await panel.session()).send('Page.close');await openPanel();
 await nativeClick(panel,'#workspace-capture');await waitFor(()=>panel.evaluate(()=>{const e=document.querySelector('#capture-start');return e&&!e.disabled&&!e.hidden;}));
 await nativeClick(panel,'#capture-start');await waitFor(async()=>(await captureStatus()).phase==='recording');await waitFor(()=>panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},func:()=>document.body.dataset.ready}))[0].result==='yes',tabId));
 const point=await panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},func:()=>{const r=document.querySelector('#change').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};}}))[0].result,tabId);
 await panel.evaluate(id=>chrome.tabs.update(id,{active:true}),tabId);for(const type of ['mouseMoved','mousePressed','mouseReleased'])await panel.evaluate(({id,type,point})=>chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})}),{id:tabId,type,point});
 await nativeClick(panel,'#capture-stop');await waitFor(async()=>(await captureStatus()).phase==='review');
 const review=await runtime.recoverStoppedCaptureReview();assert.equal(review.state,'review_ready');assert.equal(review.review.capturedExchangeCount,1);card=await runtime.saveCapturedState({draftId:review.review.draftId,name:'I03 real update rollback Card',excludeChromeSignIn:true});
 const stored=await repository.read(card.stateCardId);assert(stored&&'captureSessionPath'in stored.source);cardIdentity={revision:stored.revision,source:stored.source};result.captureFiles=await fileManifest(path.dirname(stored.source.captureSessionPath));result.card=cardIdentity;await verifyCard('before-update');check('real native Capture Start/Stop and runtime Review/Save create an exact durable Card');
 await nativeClick(panel,'#workspace-atom');if(await panel.evaluate(()=>document.querySelector('[data-atom-id="browser-connection"]').hidden))await driver.click('setup-toggle');await driver.click('attach');await driver.waitOK();await driver.click('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId,refreshDeep:false})).picker.status==='picking');
 const selectedPoint=await panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},func:()=>{const r=document.querySelector('h1').getBoundingClientRect();return{x:r.x+12,y:r.y+r.height/2};}}))[0].result,tabId);await panel.evaluate(id=>chrome.tabs.update(id,{active:true}),tabId);for(const type of ['mouseMoved','mousePressed','mouseReleased'])await panel.evaluate(({id,type,point})=>chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})}),{id:tabId,type,point:selectedPoint});await waitFor(async()=>(await rpc(panel,{op:'state',tabId,refreshDeep:false})).selection?.value==='Changed by user');await driver.waitOK();await driver.click('evidence-nav');await driver.click('save-report');await driver.waitOK();diagnostics=await panel.evaluate(()=>chrome.storage.local.get('stateport.atom.v1.diagnostics'));assert.equal(diagnostics['stateport.atom.v1.diagnostics'].entries.length,1);check('real inspector Save locally preserves one historical diagnostic before update');
 for(const [stage,key]of [['update94-to95','current95'],['rollback95-to94','previous94'],['restore95','current95']]){await cp(sources[key].path,extension,{recursive:true});assert.deepEqual(await fileManifest(extension),sources[key].files);await reloadFromChrome(stage);}
 const cold=createLocalRuntime(runtimeRoot,{developmentAccess:true,validation:true});assert((await cold.listStateCards()).some(x=>x.stateCardId===card.stateCardId&&x.revision===card.revision));await verifyCard('cold-runtime');check('new runtime instance retains the same saved Card revision and exact checkpoint source');
 for(const s of Object.values(sources))assert.deepEqual(await fileManifest(s.path),s.files);assert.deepEqual(result.errors,[]);result.status='PASS_LOCAL_EXTENSION_UPDATE_ROLLBACK_CAPTURE_DATA';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;console.error(e);try{if(panel)await panel.screenshot({path:out+'/failure.png'});}catch{}}
finally{for(const[name,close]of [['driver',()=>driver?.close()],['browser',()=>browser?.context.close()],['desktop',()=>desktop?.close()],['bridge',()=>bridge?.close()]])try{await close();}catch(e){result.status='FAIL';result.errors.push(name+': '+e.message);process.exitCode=1;}server?.closeAllConnections();if(server?.listening)await new Promise(r=>server.close(r));result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('RESULT',result.status,out);}
