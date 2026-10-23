// SPDX-License-Identifier: Apache-2.0
// V02.1 fixed reference workload. No product instrumentation or parallel app CDP.
import assert from 'node:assert/strict';
import {createServer} from 'node:https';
import {readFile,writeFile,appendFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import {performance} from 'node:perf_hooks';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {waitFor,rpc} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {sourceAccessDesktop,importProfileRoot} from '../helpers/source-access-native-desktop.mjs';
import {sourceAccessHTTPSFixture} from '../helpers/source-access-https-fixture.mjs';
import {PERFORMANCE_PROTOCOL,trialOrder,summarizePerformance,assertPerformanceWindow,performanceFixtureScript,performanceFixtureHTML} from '../helpers/basic-observer-performance.mjs';

const hf=process.argv[2];assert(hf,'Exact atom-handoff.json required');
const h=JSON.parse(await readFile(hf)),out='.artifacts/v02/basic-observer/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(out,{recursive:true,mode:0o700});
const paths=[...new Set(['tests/integration/basic-observer-performance-native.mjs','tests/helpers/basic-observer-performance.mjs','tests/atom/basic-observer-performance.test.mjs','tests/helpers/native-inspector-ui.mjs','tests/helpers/source-access-native-desktop.mjs','tests/helpers/source-access-https-fixture.mjs','scripts/native-browser.mjs','scripts/harness.mjs','docs/superpowers/plans/2026-10-23-v02-basic-observer.md',...Object.keys(h.sourceManifest),...Object.keys(h.buildSources.manifest)])];
const inputs=async()=>Object.fromEntries(await Promise.all(paths.map(async f=>[f,sha256(await readFile(f))])));
const environment=()=>({platform:os.platform(),release:os.release(),arch:os.arch(),cpu:os.cpus()[0]?.model,logicalCPUs:os.cpus().length,totalRAM:os.totalmem(),freeRAM:os.freemem(),load:os.loadavg()});
const preregistration={schema:PERFORMANCE_PROTOCOL.schema,createdAt:new Date().toISOString(),protocol:PERFORMANCE_PROTOCOL,order:trialOrder(),hosts:['standalone','embedding'],revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},inputs:await inputs(),environment:environment(),measurements:{workload:'Trusted original handler entry through 20 sequential 1024-byte HTTPS GETs, DOM counter changes and final two app animation frames',basicLatency:'Actual inspector manual CSS lookup pointerdown to useful #run text snapshot + OK + two inspector animation frames',primaryOverhead:'100*(median(active)/median(off)-1), <=10%',otherComparisons:['basic/off','active/basic','per-paired-block ratios'],latencyScope:'Existing-page manual lookup, not full Basic corpus, picker or installation',warmup:'First three blocks, fixed excluded label, all rows retained',admission:'Actual native CA import and site Allow. Read-only; no production editing grant',actor:'Same trusted X11 click for every mode. ISOLATED DOM JSON polling at 100ms; no app CDP or implementation injection',boundary:'P04 bounded collector only; no dev instrumentation/Action Trace/model/Live/source attribution; full V02 remains open'},fixture:{html:sha256(performanceFixtureHTML),script:sha256(performanceFixtureScript)}};
await writeFile(out+'/preregistration.json',JSON.stringify(preregistration,null,2),{flag:'wx'});
await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
await writeFile(out+'/fixture.html',performanceFixtureHTML);await writeFile(out+'/app.js',performanceFixtureScript);
const result={schema:PERFORMANCE_PROTOCOL.schema,status:'RUNNING',out,preregistrationSha256:sha256(await readFile(out+'/preregistration.json')),cases:[],samples:[],errors:[],console:[]};
let pki,server,desktop,browser,panel,d;const traffic=[];
async function fixture(tabId){return panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id,frameIds:[0]},world:'ISOLATED',func:()=>({ready:document.readyState==='complete',value:JSON.parse(document.getElementById('result').textContent),counter:document.getElementById('counter').textContent,disabled:document.getElementById('run').disabled})}))[0].result,tabId);}
async function stored(tabId){return panel.evaluate(async id=>(await chrome.storage.session.get('stateport.atom.v1.tabs'))['stateport.atom.v1.tabs']?.[id],tabId);}
async function windowState(tabId){return (await stored(tabId))?.productionObservation;}
async function selectTarget(measure){
 await d.fill('selector','#run');
 if(measure)await panel.evaluate(()=>{
  window.v02Latency=null;const q=id=>document.querySelector('[data-atom-id="'+id+'"]'),button=q('inspect-selector');
  button.addEventListener('pointerdown',event=>{
   const start=performance.now();let working=false,finishing=false;
   const observer=new MutationObserver(()=>{
    const status=q('status').textContent;if(status==='Working…')working=true;
    if(working&&!finishing&&status==='OK'&&q('selected').textContent.includes('#run')&&q('selected').textContent.includes('Run workload')){
     finishing=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{observer.disconnect();window.v02Latency={durationMs:performance.now()-start,trusted:event.isTrusted,status:q('status').textContent,selected:q('selected').textContent};}));
    }
   });observer.observe(q('status'),{subtree:true,childList:true,characterData:true});
  },{capture:true,once:true});
 });
 await d.click('inspect-selector');await d.waitOK();
 const latency=measure?await waitFor(()=>panel.evaluate(()=>window.v02Latency)):null;
 if(measure){assert.equal(latency.trusted,true);assert.equal(latency.status,'OK');}
 return latency;
}
async function openReporter(){await d.click('diagnostic-toggle');await d.click('handoff-current');await waitFor(()=>panel.evaluate(()=>document.querySelector('[data-atom-id="handoff-dialog"]').open&&!document.querySelector('[data-atom-id="observation-start"]').disabled));}
async function startWindow(tabId){
 await openReporter();await d.click('observation-start');await waitFor(()=>panel.evaluate(()=>!document.querySelector('[data-atom-id="observation-read"]').disabled));await d.click('observation-read');await waitFor(async()=>{const w=await windowState(tabId);return w?.status==='recording'&&w.counts.checkpoints===1;});await waitFor(()=>panel.evaluate(()=>!document.querySelector('[data-atom-id="observation-continue"]').disabled));await d.click('observation-continue');await waitFor(()=>panel.evaluate(()=>!document.querySelector('[data-atom-id="handoff-dialog"]').open));
 const w=await windowState(tabId);assert.equal(w.status,'recording');assert.equal(w.counts.requests,0);return{windowId:w.windowId,records:w.records.length,bytes:Buffer.byteLength(JSON.stringify(w)),counts:w.counts};
}
async function stopWindow(tabId,initial){
 await waitFor(async()=>{const w=await windowState(tabId);assert.equal(w.windowId,initial.windowId);assert.equal(w.status,'recording','Collector stopped before explicit Stop');return w.counts.completed===20;});
 await d.click('handoff-current');await waitFor(()=>panel.evaluate(()=>document.querySelector('[data-atom-id="handoff-dialog"]').open));await d.click('observation-stop');
 const w=await waitFor(async()=>{const w=await windowState(tabId);return w?.status==='stopped'?w:null;});assert.equal(w.windowId,initial.windowId);assert.equal(w.stopReason,'user');
 const saved={windowId:w.windowId,status:w.status,stopReason:w.stopReason,counts:w.counts,gaps:w.gaps,records:w.records.length,bytes:Buffer.byteLength(JSON.stringify(w)),initial};result.currentTrial.window=saved;await appendFile(out+'/windows.jsonl',JSON.stringify(saved)+'\n');assertPerformanceWindow(saved);
 await waitFor(()=>panel.evaluate(()=>!document.querySelector('[data-atom-id="observation-clear"]').disabled));await d.click('observation-clear');await waitFor(async()=>{const cleared=await windowState(tabId);return cleared?.status==='deleted'&&cleared.windowId===null&&cleared.identity===null&&cleared.records.length===0;});await d.click('handoff-cancel');await waitFor(()=>panel.evaluate(()=>!document.querySelector('[data-atom-id="handoff-dialog"]').open));return saved;
}
async function appClick(tabId){
 await panel.evaluate(id=>chrome.tabs.update(id,{active:true}),tabId);
 const point=await panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id,frameIds:[0]},world:'ISOLATED',func:async()=>{const e=document.getElementById('run');if(e.disabled)throw Error('Workload still busy');e.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect();return{x:screenX+(outerWidth-innerWidth)/2+r.x+r.width/2,y:screenY+outerHeight-innerHeight+r.y+r.height/2};}}))[0].result,tabId);
 const win=await waitFor(()=>{try{return desktop.native(['search','--onlyvisible','--name','V02 fixed workload']).split('\n')[0];}catch{return null;}});result.nativeAppWindowTitle=desktop.native(['getwindowname',win]);desktop.native(['windowfocus','--sync',win]);desktop.native(['mousemove',String(Math.round(point.x)),String(Math.round(point.y))]);desktop.native(['mousedown','1']);desktop.native(['mouseup','1']);
}
async function closeBrowser(){await d?.close().catch(()=>{});d=null;await browser?.context.close();browser=null;}
try{
 await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
 for(const kind of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
 for(const [f,hash] of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(preregistration.inputs[f],hash,'Frozen candidate input '+f);
 pki=await sourceAccessHTTPSFixture(out+'/pki',{js:'',map:'',manifest:{},zip:new Uint8Array(),marker:'V02_SYNTHETIC'});await pki.stop();
 server=createServer({key:await readFile(out+'/pki/server.key'),cert:await readFile(out+'/pki/server.pem')},(req,res)=>{const route=new URL(req.url,'https://fixture').pathname;traffic.push({route,at:Date.now()});res.setHeader('cache-control','no-store');if(route==='/app.js'){res.setHeader('content-type','text/javascript');res.end(performanceFixtureScript);}else if(route==='/sample'){res.setHeader('content-type','text/plain');res.end('V'.repeat(1024));}else if(route==='/favicon.ico'){res.writeHead(204);res.end();}else{res.setHeader('content-type','text/html');res.end(performanceFixtureHTML);}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='https://app.p03.test:'+server.address().port;result.origin=origin;
 desktop=await sourceAccessDesktop(out);
 for(const kind of ['standalone','embedding']){
  const c={host:kind,environmentBefore:environment()};result.cases.push(c);console.log('SETUP',kind);
  browser=await startNativeBrowser(out+'/profiles',kind,true,false,pki.chromeArguments,{extensionPath:h.hosts[kind],headless:false,display:desktop.display});c.browser=browser.context.browser().version();panel=await browser.context.newPage();panel.on('pageerror',e=>result.errors.push({host:kind,text:e.message}));await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));d=await nativeInspectorUI(panel,browser);d.p.on('Runtime.consoleAPICalled',e=>{if(['error','warning','warn'].includes(e.type))result.console.push({host:kind,level:e.type,text:(e.args||[]).map(x=>x.value??x.description??x.type).join(' ').slice(0,1024)});});await d.p.send('Runtime.enable');c.trust=await importProfileRoot(browser,desktop,pki.root,out+'/'+kind);
  const tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin+'/');await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).title==='V02 fixed workload',tabId));await d.click('refresh-tabs');await d.waitOK();await d.select('tabs',tabId);await d.waitOK();await d.click('attach');await desktop.decide(out+'/'+kind+'-site-allow-candidate.png','allow');await d.waitOK();await waitFor(async()=>(await fixture(tabId)).ready);await d.click('detach');await d.waitOK();let lastAction=0;
  for(const trial of trialOrder()){
   let state=await rpc(panel,{op:'state',tabId,refreshDeep:false});if(state.attached){await d.click('detach');await d.waitOK();}
   const row={...trial,host:kind,startedAt:new Date().toISOString(),status:'started'};result.currentTrial=row;await appendFile(out+'/attempts.jsonl',JSON.stringify(row)+'\n');let window;
   if(trial.mode!=='off'){
    await d.click('attach');await d.waitOK();const timing=await selectTarget(trial.mode==='basic');if(timing){row.basicLatencyMs=timing.durationMs;row.basicLatency=timing;}
    state=await rpc(panel,{op:'state',tabId,refreshDeep:false});assert.equal(state.attached,true);assert.equal(state.selection.selector,'#run');assert.equal(state.selection.property,'text');assert.equal(state.selection.value,'Run workload');assert.equal(state.productionChange.active,false);
    if(trial.mode==='active')window=await startWindow(tabId);
   }else{assert.equal((await rpc(panel,{op:'state',tabId,refreshDeep:false})).attached,false);}
   const before=await fixture(tabId);assert.equal(before.value?.id??0,lastAction);assert.equal(before.disabled,false);const trafficBefore=traffic.filter(x=>x.route==='/sample').length,wallStart=performance.now();
   await appClick(tabId);const final=await waitFor(async()=>{const f=await fixture(tabId);return f.value?.id===lastAction+1&&!f.disabled?f:null;},30000);
   Object.assign(row,final.value,{actions:final.value.id-lastAction,wallGestureToReadbackMs:performance.now()-wallStart});lastAction=final.value.id;assert.equal(row.status,'complete');assert.equal(row.trusted,true);assert.equal(row.requests,20);assert.equal(row.bytes,20480);assert.equal(final.counter,'20');assert.equal(traffic.filter(x=>x.route==='/sample').length-trafficBefore,20);
   await appendFile(out+'/workloads.jsonl',JSON.stringify(row)+'\n');
   if(window)row.window=await stopWindow(tabId,window);
   // Persist before aggregation. A later failure cannot erase valid raw samples.
   result.samples.push(row);delete result.currentTrial;await appendFile(out+'/samples.jsonl',JSON.stringify(row)+'\n');console.log('SAMPLE',kind,trial.ordinal,trial.warmup?'warmup':'measured',trial.block,trial.mode,row.durationMs.toFixed(2),row.basicLatencyMs?.toFixed(2)??'');
  }
  c.summary=summarizePerformance(result.samples,kind);c.environmentAfter=environment();console.log('SUMMARY',kind,JSON.stringify(c.summary));await closeBrowser();
 }
 result.inputsAfter=await inputs();assert.deepEqual(result.inputsAfter,preregistration.inputs,'Measurement inputs changed');assert.equal(result.errors.length,0,'Inspector exception');assert.equal(result.console.length,0,'Inspector console warning/error');result.status='COMPLETE';result.targetsMet=result.cases.every(c=>c.summary.targets.basicLatencyPass&&c.summary.targets.activeOverheadPass);
}catch(error){result.status='INCOMPLETE';result.errors.push({message:error.message,stack:error.stack});console.error(error.stack);process.exitCode=1;}
finally{
 await closeBrowser().catch(e=>result.errors.push({cleanup:e.message}));await desktop?.close().catch(e=>result.errors.push({cleanup:e.message}));server?.closeAllConnections();if(server?.listening)await new Promise(r=>server.close(r));await pki?.stop().catch(()=>{});result.finishedAt=new Date().toISOString();result.environmentAfter=environment();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('RESULT',result.status,'targetsMet='+result.targetsMet,out);
}
