// SPDX-License-Identifier: Apache-2.0
// Bounded native ownership experiment, not a production recovery mechanism.
// Direct native calls belong solely to this isolated synthetic browser/profile.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {startBrowser,waitFor} from '../../scripts/harness.mjs';
import {root} from '../../scripts/vite-config.mjs';
import {verifyArtifactHashes,fileManifest,sha256} from '../../scripts/atom-package-receipt.mjs';
const file=process.argv[2]||root+'/.artifacts/atom/atom-handoff.json',h=JSON.parse(await readFile(file));
await verifyArtifactHashes([h.package,h.ui]);
const out=root+'/.artifacts/u02/owner-lifetime/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
const result={schema:'stateatom.native-owner-lifetime/1',status:'RUNNING',startedAt:new Date().toISOString(),configuration:{operator:'agent',sandbox:true,host:'standalone',browserPlugin:'Unavailable; existing Playwright MV3',productEditingEnabled:false,scope:'Native extension-document owner lifetime only; no production recovery claim'},handoff:{file,sha256:sha256(await readFile(file)),package:h.package,ui:h.ui},observations:[],errors:[]};
const sources=['tests/integration/input-owner-lifetime.mjs','tests/fixtures/input-editor/index.html','scripts/harness.mjs'];const hashes=async()=>Object.fromEntries(await Promise.all(sources.map(async f=>[f,sha256(await readFile(root+'/'+f))])));result.inputs={before:await hashes()};await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
let server,browser,owner,observer,page;
try{
 const html=await readFile(root+'/tests/fixtures/input-editor/index.html');server=createServer((req,res)=>{res.setHeader('cache-control','no-store');if(req.url==='/api/account'||req.url==='/api/permission'){res.setHeader('content-type','application/json; charset=utf-8');res.end(JSON.stringify(req.url==='/api/account'?{risk:{hold:true},rules:{quota:2},metadata:{note:'Owner lifetime control'}}:{access:{ready:true}}));}else{res.setHeader('content-type','text/html');res.end(html);}});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const origin='http://127.0.0.1:'+server.address().port;
 const before=await fileManifest(h.hosts.standalone);browser=await startBrowser(out+'/profiles','owner',true,false,[],{extensionPath:h.hosts.standalone});const context=browser.context;result.configuration.browser=context.browser().version();
 owner=await context.newPage();await owner.goto('chrome-extension://'+browser.id+'/panel.html');observer=await context.newPage();await observer.goto('chrome-extension://'+browser.id+'/panel.html');page=await context.newPage();await page.goto(origin+'/');
 const tabId=await observer.evaluate(async origin=>(await chrome.tabs.query({})).find(t=>t.url===origin+'/').id,origin);result.tabId=tabId;let generation=0;
 const refresh=async(timeout=10000)=>{await page.locator('#refresh').click();await page.locator('#status').filter({hasText:'Loaded '+ ++generation,exact:true}).waitFor({timeout});};
 await refresh();assert.equal(await page.locator('#confirm').isDisabled(),true);
 const native=await owner.evaluate(async({tabId,origin})=>{
  window.ownerRecord={tabId,origin,mutations:0,errors:[],pauses:[]};
  const listener=async(source,method,p)=>{if(source.tabId!==tabId||method!=='Fetch.requestPaused')return;const s=window.ownerRecord;s.pauses.push({requestId:p.requestId,networkId:p.networkId,type:p.resourceType});try{
   if(p.request.url===origin+'/api/account'&&p.request.method==='GET'&&p.responseStatusCode===200){const r=await chrome.debugger.sendCommand({tabId},'Fetch.getResponseBody',{requestId:p.requestId});const text=r.base64Encoded?new TextDecoder().decode(Uint8Array.from(atob(r.body),c=>c.charCodeAt(0))):r.body;const body=JSON.parse(text);if(body.risk.hold!==true)throw Error('Original synthetic control changed');body.risk.hold=false;const bytes=new TextEncoder().encode(JSON.stringify(body));await chrome.debugger.sendCommand({tabId},'Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:p.responseHeaders.filter(h=>!['content-length','transfer-encoding','content-encoding','etag'].includes(h.name.toLowerCase())),body:btoa(String.fromCharCode(...bytes))});s.mutations++;
   }else await chrome.debugger.sendCommand({tabId},'Fetch.continueRequest',{requestId:p.requestId});
  }catch(e){s.errors.push(e.message);}};
  chrome.debugger.onEvent.addListener(listener);await chrome.debugger.attach({tabId},'1.3');await chrome.debugger.sendCommand({tabId},'Fetch.enable',{patterns:[{urlPattern:origin+'/*',requestStage:'Response'}]});return{attached:(await chrome.debugger.getTargets()).find(t=>t.tabId===tabId)?.attached,ownerURL:location.href};
 },{tabId,origin});assert.equal(native.attached,true);result.observations.push({step:'document-attached',...native});
 await refresh();assert.equal(await page.locator('#confirm').isDisabled(),false);result.observations.push({step:'document-owned-response-effect',record:await owner.evaluate(()=>window.ownerRecord)});
 const cdp=await context.newCDPSession(observer),versions=[];cdp.on('ServiceWorker.workerVersionUpdated',e=>versions.push(...e.versions));await cdp.send('ServiceWorker.enable');const version=await waitFor(()=>versions.find(v=>v.scriptURL==='chrome-extension://'+browser.id+'/worker.js'&&v.runningStatus==='running'));await cdp.send('ServiceWorker.stopWorker',{versionId:version.versionId});await waitFor(()=>versions.find(v=>v.versionId===version.versionId&&v.runningStatus==='stopped'));await refresh();assert.equal(await page.locator('#confirm').isDisabled(),false);result.observations.push({step:'document-owner-survives-worker-stop',record:await owner.evaluate(()=>window.ownerRecord)});
 await owner.close();owner=null;let attached=await observer.evaluate(async tabId=>(await chrome.debugger.getTargets()).find(t=>t.tabId===tabId)?.attached,tabId);
 try{await waitFor(async()=>{attached=await observer.evaluate(async tabId=>(await chrome.debugger.getTargets()).find(t=>t.tabId===tabId)?.attached,tabId);return attached===false;},2000);}catch{}
 let completed=false;try{await refresh(5000);completed=true;}catch{}
 result.observations.push({step:'owner-document-closed',attached,requestCompleted:completed,status:await page.locator('#status').textContent(),buttonDisabled:await page.locator('#confirm').isDisabled()});
 result.nativeOwnerCloseSafe=attached===false&&completed&&await page.locator('#confirm').isDisabled();result.status=result.nativeOwnerCloseSafe?'OBSERVED_DOCUMENT_CLEANUP':'OBSERVED_OWNER_CLOSE_UNSAFE';
 await cdp.detach();assert.deepEqual(await fileManifest(h.hosts.standalone),before);
}catch(e){result.status='EXPERIMENT_FAILED';result.error=e.stack;process.exitCode=1;console.error(e);}
finally{await browser?.context.close().catch(()=>{});if(server)await new Promise(resolve=>server.close(resolve));result.inputs.after=await hashes();if(JSON.stringify(result.inputs.before)!==JSON.stringify(result.inputs.after)){result.status='INPUTS_CHANGED';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out);}
