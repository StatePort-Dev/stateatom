// SPDX-License-Identifier: Apache-2.0
// Real packaged MV3/UI. Synthetic app stays owned by Atom, with no test CDP session.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {rpc,waitFor} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {parseDiagnostic} from '../../core/diagnostic.mjs';
import {nativeInspectorUI,nativeDownloads} from '../helpers/native-inspector-ui.mjs';
const hf=process.argv[2];assert(hf&&process.argv.length===3,'Exact handoff required');
const h=JSON.parse(await readFile(hf)),out='.artifacts/v01/basic-reader/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const fixture='tests/fixtures/picker/index.html',html=await readFile(fixture);
const registered=[...new Set([...Object.keys({...h.sourceManifest,...h.buildSources.manifest}),fixture,'tests/integration/basic-reader-native.mjs','tests/helpers/native-inspector-ui.mjs','scripts/native-browser.mjs','scripts/harness.mjs','scripts/owned-ide-endpoint.mjs'])];
const inputs=async()=>Object.fromEntries(await Promise.all(registered.map(async f=>[f,sha256(await readFile(f))])));
const result={schema:'stateatom.v01-basic-reader/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},configuration:{headless:'new',realMV3:true,IDE:false,certificateSetup:false,appTargetTestCDP:false,readOnly:true,scope:'Basic/picker/legacy historical diagnostic/fresh-profile passive reader; not performance or full QA handoff'},checks:[],cases:[],errors:[],console:[],inputsBefore:await inputs()};
let server,browser,d,downloads;const traffic=[];
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
async function observe(page,kind,surface){
  page.on('pageerror',e=>result.errors.push({kind,surface,message:e.message}));
  const driver=await nativeInspectorUI(page,browser);
  driver.p.on('Runtime.consoleAPICalled',e=>{if(['error','warning','warn'].includes(e.type))result.console.push({kind,surface,type:e.type,message:e.args.map(a=>a.value??a.description??'').join(' ').slice(0,500)});});
  driver.p.on('Log.entryAdded',({entry})=>{if(['error','warning'].includes(entry.level))result.console.push({kind,surface,type:entry.level,message:entry.text.slice(0,500)});});
  await driver.p.send('Runtime.enable');await driver.p.send('Log.enable');return driver;
}
try{
  await check('exact archives, current build inputs, installed pair and both hosts',async()=>{
    await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
    for(const[f,v]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(sha256(await readFile(f)),v,f);
    for(const kind of['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
  });
  server=createServer((req,res)=>{traffic.push(req.url);res.setHeader('cache-control','no-store');if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}res.setHeader('content-type','text/html');res.end(req.url==='/frame'?'<!doctype html><button>Frame boundary</button>':html);});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const origin='http://127.0.0.1:'+server.address().port;result.origin=origin;
  for(const kind of['standalone','embedding']){
    const c={kind,checks:[],before:await fileManifest(h.hosts[kind])};result.cases.push(c);
    const local=async(name,fn)=>{await check(kind+' '+name,fn);c.checks.push(name);};
    browser=await startNativeBrowser(out+'/profiles',kind,true,false,[],{extensionPath:h.hosts[kind]});c.browser=browser.context.browser().version();
    const panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));d=await observe(panel,kind,'inspector');downloads=await nativeDownloads(out+'/profiles/'+kind,out+'/downloads/'+kind);
    const tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin+'/');c.tabId=tabId;
    await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
    const state=()=>rpc(panel,{op:'state',tabId,refreshDeep:false});
    const app=()=>panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>({actions:window.actions,calls:window.calls})}))[0].result,tabId);
    async function pointer(selector){await panel.evaluate(async({id,selector})=>{await chrome.tabs.update(id,{active:true});const point=(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:selector=>{const e=document.querySelector(selector);e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};},args:[selector]}))[0].result;for(const type of['mouseMoved','mousePressed','mouseReleased'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});},{id:tabId,selector});}
    await d.click('refresh-tabs');await d.waitOK();await d.select('tabs',tabId);await d.waitOK();await d.click('source-nav');if(!await panel.evaluate(s=>document.querySelector(s).checked,d.q('source-map-readonly')))await d.click('source-map-readonly');await d.click('attach');await d.waitOK();
    await d.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await pointer('#confirm > span');await waitFor(async()=>(await state()).selection?.tag==='span');
    await local('native nested picker selects observed text read-only without app action',async()=>{const s=await state();assert.equal(s.readOnly,true);assert.equal(s.selection.value,'Confirm nested target');assert.equal(s.selection.property,'text');assert.equal(s.analysis.capabilities.sourceResolver,'unavailable');assert.equal(s.analysis.stateatom.runtime.status,'Unknown/Unsupported');assert.deepEqual(await app(),{actions:{submit:0,click:0},calls:{}});});
    await panel.evaluate(s=>{const e=document.querySelector(s);for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS')a.open=true;e.scrollIntoView({block:'center'});e.focus();},d.q('picker-parent'));await d.key('Enter','Enter',13);await d.waitOK();
    await local('keyboard parent refinement preserves actual target and unknown evidence',async()=>{const s=await state();assert.equal(s.selection.id,'confirm');assert.equal(s.selection.tag,'button');assert.equal(s.selection.value,'Confirm nested target');assert.equal(s.analysis.stateatom.runtime.status,'Unknown/Unsupported');assert.deepEqual(await app(),{actions:{submit:0,click:0},calls:{}});c.selected=s.selection;});
    await d.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await d.waitOK();await d.click('pick');await waitFor(async()=>(await state()).picker.status==='cancelled');await d.waitOK();
    await local('inspector Cancel keeps selection and avoids page keys/actions',async()=>{assert.equal((await state()).selection.domIdentity.node,c.selected.domIdentity.node);assert.deepEqual(await app(),{actions:{submit:0,click:0},calls:{}});});
    await d.click('evidence-nav');await d.click('diagnostic-toggle');await d.fill('diagnostic-notes','V01 synthetic Basic checkpoint');await d.click('save-report');await waitFor(async()=>(await d.text('diagnostic-status')).startsWith('Saved'));
    await local('save creates a historical snapshot without mutation grant',async()=>{assert.equal((await state()).readOnly,true);assert.deepEqual(await app(),{actions:{submit:0,click:0},calls:{}});assert.match(await d.text('diagnostic-status'),/historical/);});
    const prior=downloads.ids();await d.click('export-report');await waitFor(()=>panel.evaluate(s=>document.querySelector(s).open,d.q('export-review')));const raw=await panel.evaluate(s=>document.querySelector(s).value,d.q('export-json')),report=parseDiagnostic(raw);
    await local('explicit review retains target and Unknown with default exclusions',async()=>{assert.deepEqual(downloads.ids(),prior);assert.equal(report.kind,'historical-diagnostic');assert.equal(report.target.selector,c.selected.selector);assert.equal(report.target.property,'text');assert.equal(report.target.value,'Confirm nested target');assert.equal(report.runtime.status,'Unknown/Unsupported');assert.equal(report.configuration.ide,false);assert.equal(report.contentPolicy.includeContent,false);assert.equal(report.notes,'V01 synthetic Basic checkpoint');c.report={id:report.id,target:report.target,runtime:report.runtime.status,contentPolicy:report.contentPolicy};});
    await d.click('export-confirm');const download=await downloads.next(prior);c.download={file:download.file,sha256:sha256(download.raw),bytes:Buffer.byteLength(download.raw)};
    await local('native download exactly matches reviewed bytes',async()=>assert.equal(download.raw,raw));
    await pointer('#confirm');await local('ordinary app click works after cancellation',async()=>{const a=await app();assert.deepEqual(a.actions,{submit:1,click:1});assert.equal(a.calls['click:true'],1);assert.equal(a.calls['click:false'],1);c.appAfter=a;});
    await d.close();d=null;downloads.close();downloads=null;await browser.context.close();browser=null;const requestsBeforeReader=traffic.length;
    browser=await startNativeBrowser(out+'/profiles',kind+'-fresh-reader',true,false,[],{extensionPath:h.hosts[kind]});c.readerBrowser=browser.context.browser().version();const reader=await browser.context.newPage();await reader.goto('chrome-extension://'+browser.id+'/reader.html');d=await observe(reader,kind,'fresh-reader');
    const live=()=>reader.evaluate(async()=>({appTabs:(await chrome.tabs.query({})).filter(t=>/^https?:/.test(t.url||'')).length,storedTabs:Object.keys((await chrome.storage.session.get('stateport.atom.v1.tabs'))['stateport.atom.v1.tabs']||{})}));
    await local('reader starts in a fresh profile after originating browser closes',async()=>{assert.equal(c.readerBrowser,c.browser);assert.deepEqual(await live(),{appTabs:0,storedTabs:[]});});
    await d.files('#diagnostic-file',[download.file]);await waitFor(()=>reader.evaluate(()=>document.getElementById('reader-status').textContent.startsWith('Imported')));
    await local('fresh passive reader imports historical Unknown without live authority',async()=>{c.reader=await reader.evaluate(()=>({status:document.getElementById('reader-status').textContent,summary:document.getElementById('reader-summary').textContent,body:document.body.innerText}));assert.match(c.reader.body,/Unknown\/Unsupported/);assert.match(c.reader.body,/Confirm nested target/);assert.deepEqual(await live(),{appTabs:0,storedTabs:[]});});
    await local('reader uses bundled font and makes no app requests',async()=>{const loaded=await reader.evaluate(async()=>{await document.fonts.ready;return[...document.fonts].some(f=>f.family==='StatePort Inter'&&f.status==='loaded');});assert.equal(loaded,true);assert.equal(traffic.length,requestsBeforeReader);});
    c.after=await fileManifest(h.hosts[kind]);await local('owned inspector/reader remain healthy and exact host is unchanged',async()=>{assert.deepEqual(c.after,c.before);assert.deepEqual(result.errors,[]);assert.deepEqual(result.console,[]);});
    assert.equal(c.checks.length,11);await d.close();d=null;await browser.context.close();browser=null;
  }
  assert.equal(result.checks.length,23);result.status='PASS_NATIVE_BASIC_READER';
}catch(error){if(d)result.failureUI=await d.p.send('Runtime.evaluate',{expression:`JSON.stringify(['status','evidence-nav','evidence-section','diagnostic-toggle','diagnostics-details'].map(id=>{const e=document.querySelector('[data-atom-id="'+id+'"]');return {id,hidden:e?.hidden,disabled:e?.disabled,selected:e?.getAttribute('aria-selected'),text:id==='status'?e?.textContent:undefined,rect:e?.getBoundingClientRect().toJSON()};}))`,returnByValue:true}).then(x=>JSON.parse(x.result.value)).catch(()=>null);result.status='FAIL';result.error=error.stack;process.exitCode=1;console.error(error);}
finally{
  await d?.close().catch(()=>{});downloads?.close();await browser?.context.close().catch(()=>{});
  if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  result.inputsAfter=await inputs();if(JSON.stringify(result.inputsAfter)!==JSON.stringify(result.inputsBefore)){result.status='FAIL';result.inputDrift=true;process.exitCode=1;}
  result.traffic=traffic;result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/results.json'}));
}
