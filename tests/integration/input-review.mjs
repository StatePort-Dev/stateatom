// SPDX-License-Identifier: Apache-2.0
// Review regressions on unchanged installed hosts. No catalogue credit.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {startNativeBrowser,nativeChooseTab,nativeApproveDevelopment} from '../../scripts/native-browser.mjs';
import {rpc,waitFor} from '../../scripts/harness.mjs';
import {fileManifest,verifyArtifactHashes,inspectInstalledPair,sha256} from '../../scripts/atom-package-receipt.mjs';
const file=process.argv[2]||'.artifacts/atom/atom-handoff.json',h=JSON.parse(await readFile(file));
const out='.artifacts/u02/review-native/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const inputs=['tests/integration/input-review.mjs','tests/fixtures/input-review/index.html','scripts/native-browser.mjs','scripts/harness.mjs'];
const hashes=async()=>Object.fromEntries(await Promise.all(inputs.map(async p=>[p,sha256(await readFile(p))])));
const result={schema:'stateatom.input-review-native/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,handoff:{file,sha256:sha256(await readFile(file)),package:h.package,ui:h.ui},configuration:{operator:'agent',nativePackagedUI:true,preview:false,fixture:'synthetic local JSON',implementationInjection:false,continuationFailure:'source command-boundary fault tests separately; native checks ordinary nonmatching continuation',browserPlugin:'Unavailable; isolated native Chrome without prior app debugger'},checks:[],errors:[],inputsBefore:await hashes(),nativeCatalogueRowsVerified:0};
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
let server,browser,panel,tabId,body,served=0;
try{
 await check('exact immutable package pair and installed host manifests',async()=>{await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);for(const k of['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[k]),h.consumerReceipt.hostFiles[k]);});
 const html=await readFile('tests/fixtures/input-review/index.html');
 server=createServer((req,res)=>{res.setHeader('cache-control','no-store');if(req.url==='/api/data'){served++;res.setHeader('content-type','application/json');res.end(body);}else if(req.url==='/other'){res.setHeader('content-type','text/plain');res.end('Unrelated unchanged');}else{res.setHeader('content-type','text/html; charset=utf-8');res.end(html);}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 for(const kind of['standalone','embedding']){
  browser=await startNativeBrowser(out+'/profiles',kind,true,false,[],{extensionPath:h.hosts[kind]});const c=browser.context;result.configuration.browser=c.browser().version();panel=await c.newPage();await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));
  let app=await c.newPage();await app.goto(origin+'/safe');tabId=await nativeChooseTab(panel,origin+'/safe');await nativeApproveDevelopment(panel,tabId);await rpc(panel,{op:'attach',tabId});
  const keyboard=await c.newCDPSession(panel);await keyboard.send('Emulation.setDeviceMetricsOverride',{width:440,height:960,deviceScaleFactor:1,mobile:false});
  panel.on('pageerror',e=>result.errors.push({kind,surface:'panel',error:e.message}));app.on('pageerror',e=>result.errors.push({kind,surface:'app',error:e.message}));
  const ui=id=>'[data-atom-id="'+id+'"]',state=()=>rpc(panel,{op:'state',tabId});
  const click=async id=>{await waitFor(()=>panel.evaluate(s=>{const e=document.querySelector(s);return e&&!e.disabled&&!e.hidden;},ui(id)));await panel.locator(ui(id)).click();if(['input-open','input-read','input-apply','input-undo','input-baseline'].includes(id))await waitFor(()=>panel.evaluate(s=>document.querySelector(s)?.getAttribute('aria-busy')==='false',ui('input-editor')));};
  const refresh=async()=>{const count=await app.evaluate(()=>window.refreshes);await app.locator('#refresh').click();await waitFor(async()=>await app.locator('#status').textContent()==='Loaded '+(count+1));};
  const choose=async()=>{await click('refresh-tabs');await waitFor(()=>panel.evaluate(id=>[...document.querySelector('[data-atom-id="tabs"]').options].some(o=>o.value===String(id)),tabId));await panel.evaluate(id=>{const e=document.querySelector('[data-atom-id="tabs"]');e.value=String(id);e.dispatchEvent(new Event('change',{bubbles:true}));},tabId);await waitFor(()=>panel.evaluate(()=>document.querySelector('[data-atom-id="selection-title"]')?.textContent==='Confirm'));};
  const open=async()=>{await rpc(panel,{op:'inspect-selector',tabId,selector:'#confirm'});await choose();await click('input-open');};
  const row=async()=>{const s=await state();const id=s.inputs.resources.find(r=>r.resource.locator.pointer==='/flag')?.resource.id;assert(id);return '[data-input-resource="'+id+'"]';};
  const editFalse=async(mode)=>{await click('input-read');await click('input-mode-'+mode);const path=await row();await panel.evaluate(path=>[...document.querySelectorAll(path+' button')].find(e=>e.textContent==='false').click(),path);if(mode==='draft')await click('input-apply');await waitFor(async()=>(await state()).inputs.history.at(-1)?.phase==='waiting');};
  const close=async()=>{if(!(await state()).inputs?.closed)await click('input-close');};
  for(const mode of['live','draft']){
   body='{"flag":true,"zero":0,"large":1e300,"tiny":1e-300,"text":"-0"}';await refresh();await waitFor(async()=>(await state()).requests.some(r=>r.url===origin+'/api/data'));await open();
   await check(kind+' '+mode+' finite siblings stay unchanged through actual UI edit and ordinary nonmatching request',async()=>{
    const before=served;await editFalse(mode);assert.equal(served,before);await app.locator('#other').click();await waitFor(async()=>await app.locator('#other-result').textContent()==='Unrelated unchanged');assert.equal((await state()).inputs.closed,false);assert.equal((await state()).inputs.history.at(-1).phase,'waiting');await refresh();assert.equal(await app.locator('#result').textContent(),'false');assert.deepEqual(await app.evaluate(()=>({zero:window.latest.zero,large:window.latest.large,tiny:window.latest.tiny,text:window.latest.text})),{zero:0,large:1e300,tiny:1e-300,text:'-0'});await click('input-undo');await refresh();assert.equal(await app.locator('#result').textContent(),'true');
   });
   await check(kind+' '+mode+' unsafe numerical sibling arrives unchanged and closes the owned rule',async()=>{
    await editFalse(mode);body='{"flag":true,"negativeZero":-0,"nested":[1e400,-1e400]}';await refresh();assert.deepEqual(await app.evaluate(()=>({flag:window.latest.flag,negativeZero:Object.is(window.latest.negativeZero,-0),positive:window.latest.nested[0]===Infinity,negative:window.latest.nested[1]===-Infinity})),{flag:true,negativeZero:true,positive:true,negative:true});await waitFor(async()=>{const s=(await state()).inputs;return s.closed&&s.cleanup==='disabled';});const s=(await state()).inputs;assert.equal(s.cleanup,'disabled');assert(!s.resources.some(r=>r.rule));assert(s.notes.some(n=>n.code==='RESPONSE_UNSUPPORTED'));assert.notEqual(s.history.at(-1).phase,'delivered');
   });
  }
  body='{"flag":true}';await refresh();await open();
  await check(kind+' same response pointer changes to number with a working fresh widget',async()=>{
   const path=await row();body='{"flag":5}';await refresh();await waitFor(()=>panel.evaluate(path=>document.querySelector(path+' input')?.value==='5',path));assert.equal(await panel.evaluate(path=>document.querySelector(path+' input').inputMode,path),'decimal');await click('input-mode-draft');await panel.evaluate(path=>{const e=document.querySelector(path+' input');e.value='6';e.dispatchEvent(new Event('input',{bubbles:true}));},path);await click('input-apply');await refresh();assert.equal(await app.locator('#result').textContent(),'6');await click('input-undo');await refresh();assert.equal(await app.locator('#result').textContent(),'5');
  });
  await check(kind+' invalid numerical draft stays visible after response becomes boolean until explicit discard',async()=>{
   const path=await row();await panel.evaluate(path=>{const e=document.querySelector(path+' input');e.value='-';e.dispatchEvent(new Event('input',{bubbles:true}));},path);body='{"flag":false}';await refresh();await waitFor(()=>panel.evaluate(path=>document.querySelector(path+' input')?.getAttribute('aria-invalid')==='true'&&document.querySelector(path+' .sp-atom-input-current')?.textContent==='false',path));assert.equal(await panel.evaluate(path=>document.querySelector(path+' input').value,path),'-');assert.equal(await panel.locator(ui('input-apply')).isDisabled(),true);await click('input-discard');assert.equal(await panel.evaluate(path=>!!document.querySelector(path+' input'),path),false);assert.equal(await panel.evaluate(path=>[...document.querySelectorAll(path+' button')].find(e=>e.textContent==='false').getAttribute('aria-pressed'),path),'true');await panel.evaluate(()=>document.querySelector('[data-atom-id="input-editor"]').scrollIntoView({block:'start'}));await panel.screenshot({path:out+'/'+kind+'-refreshed-field-candidate.png'});await close();
  });
  await check(kind+' initial unsafe JSON creates no editable scalar catalogue',async()=>{
   await rpc(panel,{op:'detach',tabId});app=await c.newPage();await app.goto(origin+'/unsafe-initial');tabId=await nativeChooseTab(panel,origin+'/unsafe-initial');await nativeApproveDevelopment(panel,tabId);await rpc(panel,{op:'attach',tabId});body='{"flag":true,"n":-0,"overflow":1e400}';await refresh();await waitFor(async()=>(await state()).requests.some(r=>r.url===origin+'/api/data'));await open();const s=(await state()).inputs;assert.equal(s.resources.length,0);assert(s.notes.some(n=>n.code==='RESPONSE_UNSUPPORTED'));assert.equal(s.cleanup,'inactive');assert.equal(await app.evaluate(()=>Object.is(window.latest.n,-0)&&window.latest.overflow===Infinity),true);await close();
  });
  assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);await c.close();browser=null;
 }
 result.status='PASS_NATIVE_REVIEW_REGRESSIONS';
}catch(e){result.status='FAIL';result.error=String(e.stack);process.exitCode=1;console.error(e);result.failureState=await rpc(panel,{op:'state',tabId}).catch(()=>null);await panel?.screenshot({path:out+'/failure.png'}).catch(()=>{});}
finally{await browser?.context.close();if(server)await new Promise(r=>server.close(r));result.inputsAfter=await hashes();if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);}
