// SPDX-License-Identifier: Apache-2.0
// Fixed local reference corpus; app debugger remains exclusively Atom-owned.
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {readFile,writeFile,appendFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {rpc,waitFor} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {sourceAccessDesktop} from '../helpers/source-access-native-desktop.mjs';
import {nativeSourceParseObserver} from '../helpers/source-parse-observer.mjs';
import {storedZip} from '../helpers/source-map-zip.mjs';
import {warmSourceOrder,installWarmSourceTiming,summarizeWarmSource,assertMapCache} from '../helpers/warm-source-performance.mjs';

const [hf,cf,retainedFile]=process.argv.slice(2);assert(hf&&cf,'Exact handoff and corpus paths required');
const h=JSON.parse(await readFile(hf)),corpus=JSON.parse(await readFile(cf)),intake=JSON.parse(await readFile(corpus.intakeFile)),intakeRoot=path.dirname(corpus.intakeFile);
assert.equal(h.package.version,'0.1.0-candidate.20261021.64');assert.equal(corpus.revision,'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');
const out='.artifacts/v02/warm-source/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true,mode:0o700});
const previous=JSON.parse(await readFile('.artifacts/v02/attachment-floor/2026-10-23/source-before.json'));
const paths=[...new Set([...Object.keys(previous.inputs),'tests/helpers/warm-source-performance.mjs','tests/atom/warm-source-performance.test.mjs','tests/integration/warm-source-performance-native.mjs','docs/superpowers/plans/2026-10-23-v02-warm-source.md','docs/superpowers/plans/2026-10-23-v02-warm-source-preparation.md','docs/superpowers/plans/2026-10-23-v02-warm-source-remainder.md','tests/helpers/source-parse-observer.mjs','tests/helpers/source-map-zip.mjs','tests/fixtures/production-source-mapping/NativeListeners.js',cf,corpus.intakeFile,...Object.keys(intake.files).map(f=>intakeRoot+'/'+f),...corpus.apps.map(a=>a.prepared+'/release.zip')])];
const inputs=async()=>Object.fromEntries(await Promise.all(paths.map(async f=>[f,sha256(await readFile(f))])));
const environment=()=>({platform:os.platform(),release:os.release(),arch:os.arch(),cpu:os.cpus()[0]?.model,logicalCPUs:os.cpus().length,totalRAM:os.totalmem(),freeRAM:os.freemem(),load:os.loadavg()});
const b=await build({entryPoints:['tests/fixtures/production-source-mapping/NativeListeners.js'],bundle:true,minify:true,sourcemap:'external',write:false,outfile:'app.js',platform:'browser'});
const js=b.outputFiles.find(f=>f.path.endsWith('/app.js')).contents,map=b.outputFiles.find(f=>f.path.endsWith('.map')).contents;
const manifest={schemaVersion:1,releaseId:'v02-warm-synthetic',assets:[{asset:'app.js',sourceMap:'app.js.map',assetSha256:sha256(js),sourceMapSha256:sha256(map)}]};
const zip=storedZip([['manifest.json',Buffer.from(JSON.stringify(manifest))],['app.js',js],['app.js.map',map]]);
const html='<!doctype html><title>V02 source reference</title><button id="first">Confirm</button><button id="second">Confirm</button><script src="/synthetic/app.js"></script>';
const large={version:3,sources:['private-parser.ts'],names:Array.from({length:35000},(_,i)=>'n'+i+'x'.repeat(55)),mappings:'AAAA,'+'CAAA,'.repeat(249998)+'CAAA',sourcesContent:['const PRIVATE_PARSER_BODY=1;']};
const heavy=Buffer.from(JSON.stringify(large));assert(heavy.length>3*1024*1024&&heavy.length<=4*1024*1024);
for(const [name,bytes]of [['app.js',js],['app.js.map',map],['fixture.html',html],['release.zip',zip],['parser-heavy.map',heavy],['driver.mjs',await readFile(new URL(import.meta.url))]])await writeFile(out+'/'+name,bytes);
const generated=Object.fromEntries(await Promise.all(['app.js','app.js.map','fixture.html','release.zip','parser-heavy.map'].map(async f=>[f,sha256(await readFile(out+'/'+f))])));
let retained=null;
if(retainedFile){
 assert.equal(retainedFile,'.artifacts/v02/warm-source/2026-10-23T12-06-47-419Z/results.json','Only the preregistered retained phase');
 retained=JSON.parse(await readFile(retainedFile));const dir=path.dirname(retainedFile),p=JSON.parse(await readFile(dir+'/preregistration.json'));
 assert.equal(retained.status,'INCOMPLETE');assert.equal(retained.schema,'stateatom.warm-source-performance/1');assert.equal(retained.preregistrationSha256,sha256(await readFile(dir+'/preregistration.json')));assert.deepEqual(p.inputs,retained.inputsAfter);assert.equal(retained.errors.length,0);assert.equal(retained.console.length,0);assert.equal(retained.samples.length,46);assert.deepEqual(retained.samples,JSON.parse('['+(await readFile(dir+'/samples.jsonl','utf8')).trim().split('\n').join(',')+']'));assert.equal(retained.cache.length,0);assert.equal(retained.cancellations.length,0);assert.equal(p.handoff.sha256,sha256(await readFile(hf)));assert.deepEqual(p.generated,generated);assert.deepEqual(p.order,warmSourceOrder());assert.deepEqual(summarizeWarmSource(retained.samples,'standalone'),retained.cases[0].summary);
 for(const[f,v]of Object.entries(p.inputs)){const bytes=f==='tests/integration/warm-source-performance-native.mjs'?execFileSync('git',['show','e633f1d:'+f]):await readFile(f);assert.equal(sha256(bytes),v,'Retained phase input '+f);}assert.equal(sha256(await readFile(dir+'/driver.mjs')),p.inputs['tests/integration/warm-source-performance-native.mjs']);
 await writeFile(out+'/retained-attempts.jsonl',await readFile(dir+'/attempts.jsonl'));
}
const preregistration={schema:'stateatom.warm-source-performance/1',createdAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),inputs:await inputs(),handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},corpusFile:cf,order:warmSourceOrder(),generated,environment:environment(),configuration:{headed:true,route:'loopback HTTP/read-only/exact local ZIP',appTargetTestCDP:false,manualSelection:'CSS in setup',manualGeneratedCoordinates:false,sourceTextInTimingRows:false,cacheCycles:3,cancelAfterActualParserStart:true,sourceObserverDuringWarm:false,performanceAcceptance:false,targetsWaived:false}};
if(retained)preregistration.retainedWarm={file:retainedFile,sha256:sha256(await readFile(retainedFile)),host:'standalone',raw:46,measured:40,warmup:6,freshWarmRows:46};
await writeFile(out+'/preregistration.json',JSON.stringify(preregistration,null,2),{flag:'wx'});
const result={schema:preregistration.schema,status:'RUNNING',out,preregistrationSha256:sha256(await readFile(out+'/preregistration.json')),cases:[],samples:[],cache:[],cancellations:[],errors:[],console:[],performanceAcceptance:false,targetsWaived:false};
if(retained){result.retainedWarm=preregistration.retainedWarm;result.samples.push(...retained.samples);await writeFile(out+'/samples.jsonl',retained.samples.map(s=>JSON.stringify(s)).join('\n')+'\n');}
let server,desktop,browser,panel,d,sourceObserver;
const traffic=[];
try{
 for(const[f,v]of Object.entries(previous.inputs))assert.equal(preregistration.inputs[f],v,'Previous diagnostic input '+f);
 for(const[f,v]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(preregistration.inputs[f],v,'Candidate input '+f);
 await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
 for(const host of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[host]),h.consumerReceipt.hostFiles[host]);
 assert.equal(sha256(await readFile(corpus.intakeFile)),corpus.intakeSha256);
 const assets=new Map();for(const[f,v]of Object.entries(intake.files)){const bytes=await readFile(intakeRoot+'/'+f);assert.equal(sha256(bytes),v.sha256,f);assets.set('/'+f,bytes);}
 for(const a of corpus.apps)assert.equal(sha256(await readFile(a.prepared+'/release.zip')),a.bundleSha256,a.id);
 assets.set('/synthetic/index.html',Buffer.from(html));assets.set('/synthetic/app.js',js);
 server=createServer((req,res)=>{const route=new URL(req.url,'http://local').pathname,name=route.endsWith('/')?route+'index.html':route;traffic.push({route,status:assets.has(name)?200:route==='/favicon.ico'?204:404});res.setHeader('cache-control','no-store');if(assets.has(name)){const ext=path.extname(name);res.setHeader('content-type',ext==='.html'?'text/html':ext==='.js'?'text/javascript':ext==='.css'?'text/css':'application/octet-stream');res.end(assets.get(name));}else{res.statusCode=route==='/favicon.ico'?204:404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;result.origin=origin;desktop=await sourceAccessDesktop(out);
 for(const host of ['standalone','embedding']){
  const entry={host,environmentBefore:environment(),sourceEvidence:[],lifecycle:[]};result.cases.push(entry);console.log('SETUP',host);
  browser=await startNativeBrowser(out+'/profiles',host,true,false,[],{extensionPath:h.hosts[host],headless:false,display:desktop.display});entry.browser=browser.context.browser().version();assert.match(entry.browser,/Chrome\/153\./);
  panel=await browser.context.newPage();panel.on('pageerror',e=>result.errors.push({host,message:e.message}));await panel.goto('chrome-extension://'+browser.id+'/'+(host==='standalone'?'panel.html':'workspace/inspect.html'));d=await nativeInspectorUI(panel,browser);
  d.p.on('Runtime.consoleAPICalled',e=>{if(['error','warning','warn'].includes(e.type))result.console.push({host,type:e.type,text:e.args.map(a=>a.value??a.description??a.type).join(' ').slice(0,500)});});await d.p.send('Runtime.enable');
  const warmApps=[{id:'synthetic',selector:'#first',subtree:'synthetic',prepared:out,pairs:[{asset:'app.js',sourceMap:'app.js.map'}]},...corpus.apps];const tabs=new Map();
  const state=id=>rpc(panel,{op:'state',tabId:id,refreshDeep:false});
  const readApp=async a=>panel.evaluate(async({id,selector,synthetic})=>(await chrome.scripting.executeScript({target:{tabId:id},world:synthetic?'MAIN':'ISOLATED',func:({selector,synthetic})=>({title:document.title,input:document.querySelector(selector)?.value??null,todos:[...document.querySelectorAll('.todo-list li')].map(e=>e.textContent),storage:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),...(synthetic?{counts:{...window.actionCounts}}:{})}),args:[{selector,synthetic}]}))[0].result,{id:tabs.get(a.id).tabId,selector:a.selector,synthetic:a.id==='synthetic'});
  async function choose(a){await d.select('tabs',tabs.get(a.id).tabId);await d.waitOK();}
  async function importFile(a){await d.files(d.q('source-map-file'),[a.prepared+'/release.zip']);await waitFor(()=>panel.evaluate(s=>document.querySelector(s).value==='',d.q('source-map-file')));await d.waitOK();}
  async function clear(){await d.click('source-map-clear');await d.waitOK();}
  async function currentCache(id){const s=await state(id);assert.equal(s.readOnly,true);assert.equal(s.productionChange.active,false);assertMapCache(s.sourceMaps.cache);return s;}
  async function prepare(a,phase){
   assert(tabs.size<3,'No fourth inspected tab');
   const tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin+'/'+a.subtree+'/');tabs.set(a.id,{tabId});await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
   await waitFor(async()=>{try{return(await readApp(a)).title.length>0;}catch{return false;}});tabs.get(a.id).before=await readApp(a);
   await d.click('refresh-tabs');await waitFor(()=>panel.evaluate(({selector,id})=>[...document.querySelector(selector).options].some(o=>o.value===String(id)),{selector:d.q('tabs'),id:tabId}));await choose(a);if(!await panel.evaluate(s=>document.querySelector(s).checked,d.q('source-map-readonly')))await d.click('source-map-readonly');await d.click('attach');await d.waitOK();
   await d.fill('selector',a.selector);await d.click('inspect-selector');await d.waitOK();const s=await state(tabId),script=await waitFor(async()=>(await state(tabId)).sourceMaps.scripts.find(s=>s.url===origin+'/'+a.subtree+'/'+a.pairs[0].asset));tabs.get(a.id).script=script;
   await d.select('source-map-script',script.scriptId);
   if(['synthetic','javascript-es6'].includes(a.id)){
    await importFile(a);await d.click('native-source-0');await d.waitOK();await waitFor(async()=>/^Source analysis · (Available|Partial) ·/.test(await d.text('source-analysis-status')));
    const current=await currentCache(tabId),binding=current.analysis.actionBindings.filter(b=>b.mechanism==='dom-listener'&&b.registeredOn==='selected-element'&&b.status==='Observed')[0];assert(binding);
    const anchor=await rpc(panel,{op:'source-map-anchor',tabId,bindingId:binding.id,snapshotId:binding.registration.snapshotId,contextKey:JSON.stringify(current.analysis.actionContext)});assert.equal(anchor.status,'Code-linked');assert.equal(anchor.match,'Exact artifact match');assert.equal(anchor.execution,'not-observed');assert.equal(anchor.analysisInput,undefined);
    const sourceMap=JSON.parse(a.id==='synthetic'?Buffer.from(map):await readFile(a.inputRoot+'/'+a.pairs[0].sourceMap));assert.equal(anchor.sourceDigest,sha256(Buffer.from(sourceMap.sourcesContent[anchor.sourceIndex])));
    const status=await d.text('source-analysis-status');assert.match(status,a.id==='synthetic'?/^Source analysis · Available ·/:/^Source analysis · Partial ·/);
    entry.sourceEvidence.push({phase,caseId:a.id,tabId,scriptId:script.scriptId,bindingId:binding.id,sourceDigest:anchor.sourceDigest,sourceIndex:anchor.sourceIndex,generated:anchor.anchor.generated,relation:anchor.anchor.relation,execution:anchor.execution,status});
   }
   assert.deepEqual(await readApp(a),tabs.get(a.id).before);entry.lifecycle.push({phase,operation:'prepared',caseId:a.id,tabId,tracked:tabs.size});
  }
  async function remove(a,phase){await choose(a);assert.deepEqual(await readApp(a),tabs.get(a.id).before);await d.click('detach');await d.waitOK();const tabId=tabs.get(a.id).tabId;await panel.evaluate(id=>chrome.tabs.remove(id),tabId);tabs.delete(a.id);entry.lifecycle.push({phase,operation:'removed',caseId:a.id,tabId,tracked:tabs.size,appUnchanged:true});}
  for(const a of warmApps.filter(a=>['synthetic','javascript-es6'].includes(a.id)))await prepare(a,'warm');
  await panel.evaluate(installWarmSourceTiming);
  for(const trial of retained&&host==='standalone'?[]:warmSourceOrder()){
   const a=warmApps.find(a=>a.id===trial.caseId);await choose(a);const tabId=tabs.get(a.id).tabId,s=await state(tabId);assert.equal(s.attached,true);assert(s.selection);const attempt={...trial,host,tabId,startedAt:new Date().toISOString()};result.currentTrial=attempt;await appendFile(out+'/attempts.jsonl',JSON.stringify(attempt)+'\n');
   await panel.evaluate(meta=>globalThis.__warmSourceTiming.arm(meta),{...trial,host,tabId});await d.click('native-source-0');await d.waitOK();
   const row=await waitFor(()=>panel.evaluate(ordinal=>{const t=globalThis.__warmSourceTiming;if(t.errors.length)throw Error(t.errors.join('; '));return t.samples.find(s=>s.ordinal===ordinal);},trial.ordinal),15000);
   result.samples.push(row);await appendFile(out+'/samples.jsonl',JSON.stringify(row)+'\n');delete result.currentTrial;console.log('SAMPLE',host,trial.ordinal,trial.caseId,row.previewPaintMs,row.analysisPaintMs,row.analysisStatus);
  }
  entry.summary=summarizeWarmSource(result.samples,host);await panel.evaluate(()=>globalThis.__warmSourceTiming.close());
  await remove(warmApps[0],'before-cache');for(const a of corpus.apps.filter(a=>a.id!=='javascript-es6'))await prepare(a,'cache');
  for(let cycle=0;cycle<3;cycle++)for(const a of corpus.apps){
   await choose(a);await clear();await d.select('source-map-script',tabs.get(a.id).script.scriptId);const tabId=tabs.get(a.id).tabId,attempt={host,cycle,caseId:a.id,tabId,status:'started'};result.currentCache=attempt;await appendFile(out+'/cache-attempts.jsonl',JSON.stringify(attempt)+'\n');
   await importFile(a);await d.fill('source-map-line','1');await d.fill('source-map-column','0');await d.click('source-map-lookup');await d.waitOK();const imported=await currentCache(tabId);assert.equal(imported.sourceMaps.bundle.assetCount,a.pairs.length);assert(imported.sourceMaps.cache.retainedMapBytes>0&&imported.sourceMaps.cache.parsedInputBytes>0);assert.equal(imported.sourceMaps.scripts.find(s=>s.scriptId===tabs.get(a.id).script.scriptId).map.status,'Exact artifact match');
   await clear();const cleared=await currentCache(tabId);assertMapCache(cleared.sourceMaps.cache,{cleared:true});assert.equal(cleared.sourceMaps.bundle,null);assert.equal(await d.text('source-map-preview'),'');assert.deepEqual(await readApp(a),tabs.get(a.id).before);
   const checkpoint={...attempt,status:'complete',imported:imported.sourceMaps.cache,cleared:cleared.sourceMaps.cache,bundle:imported.sourceMaps.bundle,appUnchanged:true};result.cache.push(checkpoint);await appendFile(out+'/cache.jsonl',JSON.stringify(checkpoint)+'\n');delete result.currentCache;console.log('CACHE',host,cycle,a.id);
  }
  for(const a of corpus.apps)await remove(a,'before-cancel');const a=warmApps[0];await prepare(a,'cancel');await choose(a);await clear();await d.select('source-map-script',tabs.get(a.id).script.scriptId);
  sourceObserver=await nativeSourceParseObserver(out+'/profiles/'+host,browser.id);entry.parserIdentity=sourceObserver.identity;
  const point=await panel.evaluate(async selector=>{const e=document.querySelector(selector);for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS')a.open=true;e.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return{x,y,visible:hit===e||e.contains(hit)};},d.q('source-map-clear'));assert(point.visible);
  const after=(await sourceObserver.snapshot()).length;result.currentCancellation={host,status:'started'};await appendFile(out+'/cancellation-attempts.jsonl',JSON.stringify(result.currentCancellation)+'\n');
  await d.files(d.q('source-map-file'),[out+'/parser-heavy.map']);const job=await sourceObserver.waitStarted('map',after);
  await panel.evaluate(({point,selector})=>{const e=document.querySelector(selector),hit=document.elementFromPoint(point.x,point.y);if(hit!==e&&!e.contains(hit))throw Error('Clear point changed');}, {point,selector:d.q('source-map-clear')});
  // Recheck live work; Clear dispatch-to-verification uses the separate Node clock.
  const beforeClear=(await sourceObserver.snapshot()).find(r=>r.id===job.id);assert(beforeClear.started&&!beforeClear.replied&&!beforeClear.terminated);
  const clearSentAt=Date.now();for(const type of ['mouseMoved','mousePressed','mouseReleased'])await d.p.send('Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});await d.waitOK();
  const terminated=await sourceObserver.waitTerminated(job.id),cleared=await currentCache(tabs.get(a.id).tabId);assert.equal(terminated.terminated,1);assert.equal(terminated.replied,false);assertMapCache(cleared.sourceMaps.cache,{cleared:true});assert.equal(cleared.sourceMaps.bundle,null);assert.equal(await d.text('source-map-preview'),'');assert.equal(await d.text('source-analysis-expression'),'');assert.deepEqual(await readApp(a),tabs.get(a.id).before);
  const cancellation={host,status:'complete',job:terminated,startedToTerminationMs:terminated.terminatedAt-terminated.startedAt,clearToVerifiedMs:Date.now()-clearSentAt,clearTimingClock:'Node wall clock dispatch to verified product state; not parser-clock clear dispatch',cache:cleared.sourceMaps.cache,previewEmpty:true,appUnchanged:true};result.cancellations.push(cancellation);await appendFile(out+'/cancellations.jsonl',JSON.stringify(cancellation)+'\n');delete result.currentCancellation;
  assert.equal(sourceObserver.events.length,0);entry.parserEvents=sourceObserver.events;await sourceObserver.close();sourceObserver=null;
  assert.deepEqual(await readApp(a),tabs.get(a.id).before);
  entry.environmentAfter=environment();entry.hostFiles=await fileManifest(h.hosts[host]);assert.deepEqual(entry.hostFiles,h.consumerReceipt.hostFiles[host]);
  await d.close();d=null;await browser.context.close();browser=null;console.log('HOST_COMPLETE',host);
 }
 assert.equal(result.samples.length,92);assert.equal(result.cache.length,18);assert.equal(result.cancellations.length,2);assert.equal(result.errors.length,0);assert.equal(result.console.length,0);result.status='COMPLETE';
}catch(error){result.status='INCOMPLETE';result.error=error.stack;process.exitCode=1;console.error(error);if(panel)await panel.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});if(sourceObserver)result.parserFailure=await sourceObserver.snapshot().catch(e=>({unavailable:e.message}));}
finally{
 await sourceObserver?.close().catch(()=>{});await d?.close().catch(()=>{});await browser?.context.close().catch(()=>{});await desktop?.close();if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}
 result.inputsAfter=await inputs();if(JSON.stringify(preregistration.inputs)!==JSON.stringify(result.inputsAfter)){result.status='INCOMPLETE';result.inputDrift=true;process.exitCode=1;}result.traffic=traffic;result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('RESULT',result.status,out);
}
