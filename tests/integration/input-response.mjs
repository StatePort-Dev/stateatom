// SPDX-License-Identifier: Apache-2.0
// Actual packed MV3 response backend. UI modes/native-control coverage is separate.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {rpc,waitFor} from '../../scripts/harness.mjs';
import {startNativeBrowser as startBrowser,nativeChooseTab as chooseTab,nativeApproveDevelopment as approveDevelopment} from '../../scripts/native-browser.mjs';
import {root} from '../../scripts/vite-config.mjs';
import {fileManifest,verifyArtifactHashes,inspectInstalledPair,sha256} from '../../scripts/atom-package-receipt.mjs';
import {prepareExperimentPlan} from '../../core/experiment-plan.mjs';
const file=process.argv[2]||root+'/.artifacts/atom/atom-handoff.json',handoff=JSON.parse(await readFile(file,'utf8'));
const gated=process.argv.includes('--expect-unsafe-owner'),guardianOnly=process.argv.includes('--guardian-controls');
const out=root+'/.artifacts/u02/response-native/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
const result={schema:'stateatom.input-response-native/1',status:'RUNNING',startedAt:new Date().toISOString(),sourceRevision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,handoff:{file,sha256:sha256(await readFile(file)),package:handoff.package,ui:handoff.ui},configuration:{operator:'agent',sandbox:true,browserPlugin:'Unavailable; native Chrome CDP backend driver, no app debugger before Atom admission',IDE:false,helper:false,fieldModes:false,guardianControls:guardianOnly},checks:[],errors:[],hosts:{},nativeCatalogueRowsVerified:0};
await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const inputFiles=['tests/integration/input-response.mjs','tests/fixtures/input-editor/index.html','scripts/harness.mjs','scripts/native-browser.mjs'];const hashes=async()=>Object.fromEntries(await Promise.all(inputFiles.map(async f=>[f,sha256(await readFile(root+'/'+f))])));result.inputs={before:await hashes()};
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
let server,browser,panel,page,account,permission,served=0;
try{
 await check('exact immutable package pair and both installed host manifests',async()=>{await verifyArtifactHashes([handoff.package,handoff.ui]);await inspectInstalledPair(handoff.consumer,handoff.consumerReceipt);for(const kind of ['standalone','embedding'])assert.deepEqual(await fileManifest(handoff.hosts[kind]),handoff.consumerReceipt.hostFiles[kind]);});
 const html=await readFile(root+'/tests/fixtures/input-editor/index.html');
 server=createServer((req,res)=>{res.setHeader('cache-control','no-store');if(req.url==='/api/account'||req.url==='/api/permission'){served++;res.setHeader('content-type','application/json; charset=utf-8');res.end(JSON.stringify(req.url==='/api/account'?account:permission));}else{res.setHeader('content-type','text/html; charset=utf-8');res.end(html);}});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const origin='http://127.0.0.1:'+server.address().port;result.origin=origin;
 for(const kind of ['standalone','embedding']){
  account={risk:{hold:true},rules:{quota:2},metadata:{note:'Привет'}};permission={access:{ready:false}};
  const host=handoff.hosts[kind],before=await fileManifest(host);browser=await startBrowser(out+'/profiles',kind,true,false,[],{extensionPath:host});const context=browser.context;result.configuration.browser=context.browser().version();
  panel=await context.newPage();await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));await panel.evaluate(()=>{window.nativeInputEvents=[];chrome.debugger.onEvent.addListener((source,method,p)=>{if(!['Fetch.requestPaused','Network.requestWillBeSent'].includes(method))return;window.nativeInputEvents.push({source,method,requestId:p.requestId,networkId:p.networkId,frameId:p.frameId,type:p.type,resourceType:p.resourceType,request:p.request?{url:p.request.url,method:p.request.method}:null,responseStatusCode:p.responseStatusCode,contentType:p.responseHeaders?.filter(h=>h.name.toLowerCase()==='content-type')});window.nativeInputEvents=window.nativeInputEvents.slice(-40);});});page=await context.newPage();await page.goto(origin+'/');
  for(const [surface,p]of [['panel',panel],['app',page]])p.on('pageerror',e=>result.errors.push({kind,surface,error:e.message}));
  const tabId=await chooseTab(panel,origin+'/');await approveDevelopment(panel,tabId);await rpc(panel,{op:'attach',tabId});
  let refreshes=0;const refresh=async()=>{const expected='Loaded '+ ++refreshes;await page.locator('#refresh').click();await page.locator('#status').filter({hasText:expected,exact:true}).waitFor();};
  const read=investigationId=>rpc(panel,{op:'inputs-read',tabId,investigationId});
  const inspect=async(selector='#confirm',property='disabled')=>{await rpc(panel,{op:'property',tabId,property});await rpc(panel,{op:'inspect-selector',tabId,selector});return rpc(panel,{op:'inputs-open',tabId});};
  const make=(s,values,mode='live')=>prepareExperimentPlan({investigationId:s.investigationId,mode,target:s.target,changes:values.map(([pathname,pointer,value])=>({resource:s.resources.find(r=>r.resource.locator.url===origin+pathname&&r.resource.locator.pointer===pointer).resource,value}))});
  await refresh();await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).requests.some(r=>r.url===origin+'/api/permission'));
  if(guardianOnly){
   const foreign=await panel.evaluate(async origin=>{const tab=await chrome.tabs.create({url:origin+'/foreign'});return tab.id;},origin);
   await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',foreign));
   const nativeAttached=id=>panel.evaluate(async id=>chrome.debugger.sendCommand({tabId:id},'Runtime.getIsolateId').then(()=>true,e=>{if(!/not attached/i.test(e.message))throw e;return false;}),id);
   await check(kind+' unknown pre-existing native owner stays BUSY and untouched',async()=>{
    await panel.evaluate(async id=>{await chrome.debugger.attach({tabId:id},'1.3');await chrome.debugger.sendCommand({tabId:id},'Fetch.enable',{patterns:[{urlPattern:'*/never-intercept',requestStage:'Response'}]});},foreign);
    await assert.rejects(rpc(panel,{op:'attach',tabId:foreign}),/already attached|busy/i);assert.equal(await nativeAttached(foreign),true);
   });
   let s=await inspect();
   await rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/account','/risk/hold',false]])});
   await refresh();s=await read(s.investigationId);assert.equal(s.resources.find(r=>r.resource.locator.pointer==='/risk/hold').rule.phase,'delivered');
   await check(kind+' actual guardian document loss disarms owned Fetch, preserves foreign native owner and refuses old authority',async()=>{
    await panel.evaluate(()=>chrome.offscreen.closeDocument());await waitFor(async()=>!(await rpc(panel,{op:'state',tabId})).attached);
    await assert.rejects(rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/account','/risk/hold',true]])}));
    assert.equal(await nativeAttached(tabId),false);assert.equal(await nativeAttached(foreign),true);
    await refresh();assert.equal(await page.locator('#confirm').isDisabled(),true);assert.equal(await page.locator('#quota').textContent(),'2');
   });
   await check(kind+' native inspector cannot impersonate the offscreen authority peer',async()=>{
    const r=await panel.evaluate(()=>new Promise(resolve=>{const port=chrome.runtime.connect({name:'stateatom.guardian/1'});let challenge=false;const timer=setTimeout(()=>{port.disconnect();resolve({disconnected:false,challenge});},2000);port.onMessage.addListener(()=>challenge=true);port.onDisconnect.addListener(()=>{void chrome.runtime.lastError;clearTimeout(timer);resolve({disconnected:true,challenge});});}));assert.deepEqual(r,{disconnected:true,challenge:false});assert.equal(await nativeAttached(foreign),true);
   });
   await panel.evaluate(id=>chrome.debugger.detach({tabId:id}),foreign);
   if(kind==='embedding')await check('embedding Atom shutdown releases only Atom leases and preserves a connected shared consumer',async()=>{
    const control=m=>panel.evaluate(m=>chrome.runtime.sendMessage(m),m);assert.equal((await control({hostControl:'reserve',tabId:foreign})).ok,true);
    const fresh=await panel.evaluate(async origin=>(await chrome.tabs.create({url:origin+'/fresh'})).id,origin);await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',fresh));await rpc(panel,{op:'attach',tabId:fresh});
    assert.equal(await nativeAttached(fresh),true);assert.equal(await nativeAttached(foreign),true);assert.equal((await control({hostControl:'shutdown'})).ok,true);assert.equal(await nativeAttached(fresh),false);assert.equal(await nativeAttached(foreign),true);assert.equal((await control({hostControl:'release'})).ok,true);assert.equal(await nativeAttached(foreign),false);
   });
   const after=await fileManifest(host);assert.deepEqual(after,before);result.hosts[kind]={before,after,guardianControls:true};await context.close();browser=null;continue;
  }
  if(gated){
   await check(kind+' worker-only owner denies direct and forged response editing without intercepting a request',async()=>{
    await rpc(panel,{op:'property',tabId,property:'disabled'});await rpc(panel,{op:'inspect-selector',tabId,selector:'#confirm'});const count=served;
    await assert.rejects(rpc(panel,{op:'inputs-open',tabId}),/worker-independent/);await assert.rejects(rpc(panel,{op:'inputs-open',tabId,workerIndependent:true}),/worker-independent/);
    assert.equal(served,count);const s=await rpc(panel,{op:'state',tabId});assert.equal(s.capabilityPolicy.operations['inputs-open'].code,'UNSAFE_LIFECYCLE');assert.equal(s.capabilityPolicy.features['inputs.live'].available,false);
    await refresh();assert.equal(served,count+2);assert.equal(await page.locator('#confirm').isDisabled(),true);assert.equal(await panel.evaluate(()=>window.nativeInputEvents.filter(e=>e.method==='Fetch.requestPaused').length),0);
   });
   const after=await fileManifest(host);assert.deepEqual(after,before);result.hosts[kind]={before,after,gated:true};await context.close();browser=null;continue;
  }
  let s=await inspect();
  await check(kind+' observed typed response catalogue opens without fetching or known-build fabrication',async()=>{const count=served;assert(s.resources.some(r=>r.resource.type==='number'));assert(s.resources.some(r=>r.resource.value==='Привет'));assert.equal(s.target.build,null);await read(s.investigationId);assert.equal(served,count);});
  await check(kind+' Live backend hold rule waits, then actual app consumes it without upgrading masked target dependency',async()=>{
   const count=served;s=await rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/account','/risk/hold',false]])});assert.equal(served,count);assert.equal(s.history.at(-1).phase,'waiting');await refresh();assert.equal(await page.locator('#confirm').isDisabled(),true);s=await read(s.investigationId);const leaf=s.resources.find(r=>r.resource.locator.pointer==='/risk/hold');assert.equal(leaf.rule.phase,'delivered');assert.equal(leaf.consumption,'unknown');assert.equal(s.observation.dependency,'unknown');assert(!JSON.stringify(s).includes('Experimentally verified'));
  });
  await check(kind+' Draft backend changes second blocker and real selected button, then undo restores its local effect',async()=>{
   s=await rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/permission','/access/ready',true]],'draft')});await refresh();assert.equal(await page.locator('#confirm').isDisabled(),false);s=await read(s.investigationId);assert.equal(s.target.value,false);assert.equal(s.observation.status,'Observed');s=await rpc(panel,{op:'inputs-undo',tabId,investigationId:s.investigationId,expectedRevision:s.revision});assert.equal(s.history.at(-1).applicationRestored,false);await refresh();assert.equal(await page.locator('#confirm').isDisabled(),true);s=await read(s.investigationId);assert.equal(s.history.at(-1).phase,'delivered');
  });
  await check(kind+' grouped number and Unicode string substitution has actual field effects and baseline return',async()=>{
   s=await rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/account','/rules/quota',3],['/api/account','/metadata/note','Изменено ✓']],'draft')});await refresh();assert.equal(await page.locator('#quota').textContent(),'3');assert.equal(await page.locator('#note').textContent(),'Изменено ✓');s=await read(s.investigationId);assert.equal(s.history.at(-1).atomic,false);s=await rpc(panel,{op:'inputs-baseline',tabId,investigationId:s.investigationId,expectedRevision:s.revision});await refresh();assert.equal(await page.locator('#quota').textContent(),'2');assert.equal(await page.locator('#note').textContent(),'Привет');assert.equal(await page.locator('#confirm').isDisabled(),true);s=await read(s.investigationId);assert(!s.resources.some(r=>r.rule));assert.equal(s.history.at(-1).phase,'delivered');assert.equal(s.history.at(-1).applicationRestored,false);
  });
  await rpc(panel,{op:'inputs-close',tabId,investigationId:s.investigationId});s=await inspect('#quota','text');
  await check(kind+' selected text occurrence changes and returns through actual response effects',async()=>{
   assert.equal(s.target.value,'2');s=await rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/account','/rules/quota',5]])});await refresh();s=await read(s.investigationId);assert.equal(s.target.value,'5');s=await rpc(panel,{op:'inputs-undo',tabId,investigationId:s.investigationId,expectedRevision:s.revision});await refresh();s=await read(s.investigationId);assert.equal(s.target.value,'2');assert.equal(s.observation.dependency,'unknown');
  });
  await rpc(panel,{op:'inputs-close',tabId,investigationId:s.investigationId});s=await inspect();
  await check(kind+' new external server revision refuses overwrite and old-baseline restoration',async()=>{
   s=await rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/account','/rules/quota',4],['/api/permission','/access/ready',true]],'draft')});account.rules.quota=7;await refresh();assert.equal(await page.locator('#quota').textContent(),'7');s=await read(s.investigationId);assert.equal(s.history.at(-1).phase,'partial-failure');assert(!s.resources.find(r=>r.resource.locator.pointer==='/rules/quota').rule);let refused=false;try{await rpc(panel,{op:'inputs-baseline',tabId,investigationId:s.investigationId,expectedRevision:s.revision});}catch{refused=true;}assert(refused);assert.equal(await page.locator('#quota').textContent(),'7');await rpc(panel,{op:'inputs-close',tabId,investigationId:s.investigationId});await refresh();assert.equal(await page.locator('#quota').textContent(),'7');
  });
  s=await inspect();await rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/account','/risk/hold',false]])});
  await check(kind+' actual worker stop while Fetch is active cannot leave hidden response mutation or restore authority',async()=>{
   const cdp=await context.newCDPSession(panel),versions=[];cdp.on('ServiceWorker.workerVersionUpdated',e=>versions.push(...e.versions));await cdp.send('ServiceWorker.enable');const version=await waitFor(()=>versions.find(v=>v.scriptURL==='chrome-extension://'+browser.id+'/'+(kind==='standalone'?'worker.js':'host-worker.js')&&v.runningStatus==='running'));await cdp.send('ServiceWorker.stopWorker',{versionId:version.versionId});await waitFor(()=>versions.find(v=>v.versionId===version.versionId&&v.runningStatus==='stopped'));
   const state=await rpc(panel,{op:'state',tabId});assert.equal(state.attached,false);assert.equal(state.inputs.executable,false);assert.equal(state.inputs.status,'Stale');assert.equal(state.inputs.investigationId,s.investigationId);let denied=false;try{await rpc(panel,{op:'inputs-apply',tabId,plan:make(s,[['/api/account','/risk/hold',true]])});}catch{denied=true;}assert(denied);await refresh();assert.equal(await page.locator('#confirm').isDisabled(),true);assert.equal(await page.locator('#quota').textContent(),'7');await cdp.detach();
  });
  const after=await fileManifest(host);assert.deepEqual(after,before);result.hosts[kind]={before,after};await context.close();browser=null;
 }
 result.status=guardianOnly?'PASS_GUARDIAN_CONTROLS':gated?'PASS_GATED':'PASS';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;console.error(e);if(panel)result.failureState=await panel.evaluate(async()=>{const tabs=await chrome.tabs.query({});const tab=tabs.find(t=>t.url.startsWith('http://127.0.0.1:'));return{events:window.nativeInputEvents,state:tab?await chrome.runtime.sendMessage({op:'state',tabId:tab.id}):null};}).catch(()=>null);await panel?.screenshot({path:out+'/failure.png'}).catch(()=>{});}
finally{await browser?.context.close().catch(()=>{});if(server)await new Promise(resolve=>server.close(resolve));result.inputs.after=await hashes();if(JSON.stringify(result.inputs.before)!==JSON.stringify(result.inputs.after)){result.status='FAIL';result.errors.push('Driver/fixture inputs changed');process.exitCode=1;}if(result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);}
