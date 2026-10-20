// SPDX-License-Identifier: Apache-2.0
// Actual packed MV3 runtime acquisition; backend requests, not normal reporter UI.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {startNativeBrowser,nativeChooseTab,nativeApproveDevelopment} from '../../scripts/native-browser.mjs';
import {rpc,waitFor} from '../../scripts/harness.mjs';
import {fileManifest,verifyArtifactHashes,inspectInstalledPair,sha256} from '../../scripts/atom-package-receipt.mjs';
import {prepareExperimentPlan} from '../../core/experiment-plan.mjs';
const hf=process.argv.find(x=>x.endsWith('atom-handoff.json'))||'.artifacts/atom/atom-handoff.json',h=JSON.parse(await readFile(hf));
const out='.artifacts/u03/input-capture-native/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const files=['tests/integration/handoff-input-capture.mjs','tests/fixtures/native-controls/index.html','tests/fixtures/input-acceptance/index.html','scripts/native-browser.mjs','scripts/harness.mjs'];
const inputs=async()=>Object.fromEntries(await Promise.all(files.map(async p=>[p,sha256(await readFile(p))])));
const result={schema:'stateatom.input-capture-native/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},configuration:{operator:'agent',browserPlugin:'Existing isolated native Chrome integration harness',surface:'Actual packed dispatcher/runtime/editors; separate live extension port and backend requests',mockBackend:false,sourceInstrumentation:false,IDE:false,appCDP:true,appProbeScope:'Existing native-browser facade uses app-target CDP for fixture actions, output and counter probes; capture itself adds no app read',normalReporterUI:false,Live:'Backend mode marker; no new typing/debounce scheduler claim',scope:'Atomic stored outcome acquisition only; no public file, saved-outcome UI or whole U03 proof'},checks:[],artifacts:[],errors:[],inputsBefore:await inputs()};
let browser,panel,app,tabId,server,apiRequests=0,refreshes=0;
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
const owned=p=>panel.evaluate(async payload=>{const m={version:1,id:crypto.randomUUID(),session:window.captureSession,payload:{tabId:window.captureTab,ownerId:'native-capture-view',...payload}};const r=await chrome.runtime.sendMessage({atom:m,atomOwned:true});if(!r.ok)throw Object.assign(Error(r.error),{code:r.code});return r.result;},p);
const capture=(p={})=>owned({op:'inputs-capture',...p});
const save=async(name,r)=>{const file=out+'/'+name+'.json',raw=JSON.stringify(r,null,2);await writeFile(file,raw);result.artifacts.push({file,sha256:sha256(raw),bytes:Buffer.byteLength(raw)});};
const stored=()=>panel.evaluate(async()=>({diagnostics:(await chrome.storage.local.get('stateport.atom.v1.diagnostics'))['stateport.atom.v1.diagnostics']??null,permissions:await chrome.permissions.getAll()}));
async function refresh(){await app.locator('#refresh').click();await app.locator('#status').filter({hasText:'Loaded '+ ++refreshes}).waitFor();}
async function select(selector){await rpc(panel,{op:'property',tabId,property:'disabled'});await rpc(panel,{op:'inspect-selector',tabId,selector});}
async function visit(url,selector){
 if(tabId){await owned({op:'inputs-close'});await rpc(panel,{op:'detach',tabId});await panel.evaluate(id=>chrome.tabs.remove(id),tabId);}
 app=await browser.context.newPage();await app.goto(url);app.on('pageerror',e=>result.errors.push({surface:'app',error:e.message}));
 tabId=await nativeChooseTab(panel,url);await panel.evaluate(id=>window.captureTab=id,tabId);
 await nativeApproveDevelopment(panel,tabId);await rpc(panel,{op:'attach',tabId});
 if(url.endsWith('/response')){refreshes=0;await refresh();}
 await select(selector);
}
try{
 await check('immutable package, installed pair and both exact host maps',async()=>{await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);for(const kind of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);});
 const native=await readFile('tests/fixtures/native-controls/index.html'),response=await readFile('tests/fixtures/input-acceptance/index.html');
 server=createServer((req,res)=>{res.setHeader('cache-control','no-store');if(req.url.startsWith('/api/')){apiRequests++;res.setHeader('content-type','application/json');res.end(JSON.stringify(req.url==='/api/account'?{risk:{hold:true},rules:{quota:2,current:null},metadata:{note:'Original'},structure:{items:[1,2]}}:req.url==='/api/permission'?{access:{ready:false}}:{amount:5,completion:'ordinary',metadata:{note:'control'}}));}else{res.setHeader('content-type','text/html; charset=utf-8');res.end(req.url==='/native'?native:response);}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 for(const kind of ['standalone','embedding']){
  browser=await startNativeBrowser(out+'/profiles',kind,true,false,[],{extensionPath:h.hosts[kind]});result.configuration.browser=browser.context.browser().version();
  panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));panel.on('pageerror',e=>result.errors.push({surface:'panel',error:e.message}));
  await panel.evaluate(()=>new Promise((resolve,reject)=>{window.captureSession=crypto.randomUUID();window.capturePort=chrome.runtime.connect({name:'stateatom.inspector/1:'+window.captureSession});const timer=setTimeout(()=>reject(Error('Inspector ready timeout')),5000);window.capturePort.onMessage.addListener(m=>{if(m.kind==='ready'&&m.session===window.captureSession){clearTimeout(timer);resolve();}});}));
  await visit(origin+'/native','#native-confirm');
  await check(kind+' real observation without editor records absence; legacy caller cannot capture',async()=>{
   const r=await capture();assert.equal(r.outcomes.binding.status,'not-recorded');assert.equal(r.outcomes.snapshot,null);await save(kind+'-absent',r);
   await assert.rejects(rpc(panel,{op:'inputs-capture',tabId,ownerId:'native-capture-view'}),/INSPECTOR|live inspector/i);
   const before=await stored();await assert.rejects(rpc(panel,{op:'save-handoff',raw:JSON.stringify(r)}),/Unsupported|UNSUPPORTED/i);assert.deepEqual(await stored(),before);
  });
  for(const mode of ['live','draft']){
   let s=await owned({op:'inputs-open',sourceKind:'dom-control'});
   const plan=value=>prepareExperimentPlan({investigationId:s.investigationId,mode,target:s.target,changes:[{resource:s.resources.find(x=>x.resource.locator.selector==='#native-text').resource,value}]});
   await check(kind+' '+mode+' actual native edits and scoped capture preserve original selected observation',async()=>{
    s=await owned({op:'inputs-apply',plan:plan('Cedar')});assert.equal(await app.locator('#text-result').textContent(),'Cedar');assert.equal(await app.locator('#native-confirm').isDisabled(),false);
    s=await owned({op:'inputs-read',investigationId:s.investigationId});
    const before=await stored(),requests=apiRequests,getters=await app.evaluate(()=>window.nativeGetterReads);
    const r=await capture({investigationId:s.investigationId,expectedRevision:s.revision,includeCategories:['inputIdentities','inputValues','inputLocations']});
    assert.equal(r.outcomes.binding.status,'capture-context-matched');assert.equal(r.outcomes.transactions[0].mode,mode);assert.equal(r.outcomes.transactions[0].phase,'applied');
    assert.equal(r.outcomes.selectedObservation.value.value,true);assert.equal(r.outcomes.editorObservation.value.value,false);
    assert.equal(r.outcomes.transactions[0].outcomes[0].after.value.value,'Cedar');assert.equal(r.outcomes.transactions[0].effect,'unknown');assert.equal(r.outcomes.snapshot.inputBuild,null);
    assert.equal(apiRequests,requests);assert.equal(await app.evaluate(()=>window.nativeGetterReads),getters);assert.deepEqual(await stored(),before);
    await assert.rejects(capture({ownerId:'foreign-owner'}),/belongs to another inspector/);
    await assert.rejects(capture({investigationId:s.investigationId,expectedRevision:s.revision-1}),/STALE_REVISION/);
    await save(kind+'-'+mode+'-native',r);
   });
   await check(kind+' '+mode+' native undo and baseline remain separate outcomes with default exclusions',async()=>{
    s=await owned({op:'inputs-undo',investigationId:s.investigationId,expectedRevision:s.revision});assert.equal(await app.locator('#text-result').textContent(),'AB');
    s=await owned({op:'inputs-apply',plan:plan('Pine')});s=await owned({op:'inputs-baseline',investigationId:s.investigationId,expectedRevision:s.revision});assert.equal(await app.locator('#text-result').textContent(),'AB');
    const r=await capture();assert.deepEqual(r.outcomes.transactions.map(tx=>tx.kind),['apply','undo','apply','baseline']);assert.equal(r.outcomes.transactions[0].outcomes[0].value.state,'omitted');assert(r.outcomes.transactions.every(tx=>tx.applicationRestored===false&&tx.effect==='unknown'));await save(kind+'-'+mode+'-restore',r);
   });
   await check(kind+' '+mode+' closed editor stays historical and owner-bound',async()=>{await owned({op:'inputs-close'});const r=await capture();assert.equal(r.outcomes.snapshot.closed,true);assert.equal(r.outcomes.snapshot.freshness,'Stale');assert.equal(r.outcomes.binding.status,'capture-context-matched');await assert.rejects(capture({ownerId:'foreign-owner'}),/belongs to another inspector/);});
   await select('#native-confirm');
  }
  await visit(origin+'/response','#confirm');
  for(const mode of ['live','draft']){
   let s=await owned({op:'inputs-open',sourceKind:'json-response'});
   await check(kind+' '+mode+' response wait and actual native delivery retain distinct phases',async()=>{
    const plan=prepareExperimentPlan({investigationId:s.investigationId,mode,target:s.target,changes:[{resource:s.resources.find(x=>x.resource.locator.pointer==='/risk/hold').resource,value:false}]});
    s=await owned({op:'inputs-apply',plan});const requests=apiRequests,r=await capture();assert.equal(r.outcomes.transactions[0].phase,'waiting');assert.equal(apiRequests,requests);
    await refresh();assert.equal(await app.locator('#hold').textContent(),'false');await owned({op:'inputs-read',investigationId:s.investigationId});
    const delivered=await capture({includeCategories:['inputIdentities','inputValues','inputLocations']});assert.equal(delivered.outcomes.transactions[0].phase,'delivered');const tx=delivered.outcomes.transactions[0];assert(tx.outcomes[0].deliveries.some(d=>d.delivered===true));assert.equal(tx.consumption,'unknown');assert.equal(tx.effect,'unknown');await save(kind+'-'+mode+'-response',delivered);
   });
   s=await owned({op:'inputs-read',investigationId:s.investigationId});await owned({op:'inputs-baseline',investigationId:s.investigationId,expectedRevision:s.revision});await refresh();assert.equal(await app.locator('#hold').textContent(),'true');await owned({op:'inputs-close'});await select('#confirm');
  }
  await check(kind+' context change leaves previous editor unjoined, not silently rebound',async()=>{await rpc(panel,{op:'property',tabId,property:'text'});await rpc(panel,{op:'inspect-selector',tabId,selector:'#status'});const r=await capture();assert.equal(r.outcomes.binding.status,'unjoined');assert.equal(r.outcomes.transactions,null);await save(kind+'-unjoined',r);});
  await check(kind+' port loss closes the actual active writer and denies further capture',async()=>{
   const s=await owned({op:'inputs-open',sourceKind:'json-response'});assert.equal(s.closed,false);const requests=apiRequests;
   await panel.evaluate(()=>window.capturePort.disconnect());
   await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).inputs.closed===true);
   await waitFor(async()=>{try{await capture();return false;}catch(e){return /INSPECTOR|live inspector/i.test(e.message);}});assert.equal(apiRequests,requests);
  });
  assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);await browser.context.close();browser=null;tabId=null;
 }
 result.status='PASS_NATIVE_INPUT_CAPTURE';
}catch(e){result.status='FAIL';result.error=String(e.stack);process.exitCode=1;console.error(e);}
finally{await browser?.context.close();if(server)await new Promise(r=>server.close(r));result.inputsAfter=await inputs();if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);}
