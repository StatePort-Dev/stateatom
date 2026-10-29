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

const setupOnly=process.argv.includes('--setup-only');const [hf,cf]=process.argv.slice(2),retainedFile=undefined;assert(hf&&cf,'Exact handoff and corpus paths required');
const h=JSON.parse(await readFile(hf)),corpus=JSON.parse(await readFile(cf)),intake=JSON.parse(await readFile(corpus.intakeFile)),intakeRoot=path.dirname(corpus.intakeFile);
assert.equal(h.package.version,'0.1.0-candidate.20261029.94');assert.equal(corpus.revision,'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');
const out='.artifacts/v02/current94-warm-source/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true,mode:0o700});
const previous={inputs:{}};assert(!retainedFile,'Fresh affected-candidate warm rows only');const hostSpecs=JSON.parse(await readFile('docs/testing/current94-host-case.json')).hosts;
const paths=[...new Set([...Object.keys(previous.inputs),'tests/helpers/warm-source-performance.mjs','tests/atom/warm-source-performance.test.mjs','tests/integration/warm-source-performance-native.mjs','tests/integration/current94-warm-source-native.mjs','docs/testing/current94-host-case.json','docs/superpowers/plans/2026-10-23-v02-warm-source.md','docs/superpowers/plans/2026-10-23-v02-warm-source-preparation.md','docs/superpowers/plans/2026-10-23-v02-warm-source-remainder.md','tests/helpers/source-parse-observer.mjs','tests/helpers/source-map-zip.mjs','tests/fixtures/production-source-mapping/NativeListeners.js',cf,corpus.intakeFile,...Object.keys(intake.files).map(f=>intakeRoot+'/'+f),...corpus.apps.map(a=>a.prepared+'/release.zip')])];
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
const retained=null;
const preregistration={schema:'stateatom.warm-source-performance/1',createdAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),inputs:await inputs(),handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},corpusFile:cf,order:warmSourceOrder(),generated,environment:environment(),configuration:{headed:true,route:'loopback HTTP/read-only/exact local ZIP',appTargetTestCDP:false,manualSelection:'actual picker in setup',manualGeneratedCoordinates:false,sourceTextInTimingRows:false,cacheCycles:0,cancelAfterActualParserStart:false,retainedCacheRecord:'107-v02-warm-source-and-map-resources.md',sourceObserverDuringWarm:false,performanceAcceptance:false,targetsWaived:false}};
if(retained)preregistration.retainedWarm={file:retainedFile,sha256:sha256(await readFile(retainedFile)),host:'standalone',raw:46,measured:40,warmup:6,freshWarmRows:46};
await writeFile(out+'/preregistration.json',JSON.stringify(preregistration,null,2),{flag:'wx'});
const result={schema:preregistration.schema,status:'RUNNING',out,preregistrationSha256:sha256(await readFile(out+'/preregistration.json')),cases:[],samples:[],cache:[],cancellations:[],errors:[],console:[],performanceAcceptance:false,targetsWaived:false};
if(retained){result.retainedWarm=preregistration.retainedWarm;result.samples.push(...retained.samples);await writeFile(out+'/samples.jsonl',retained.samples.map(s=>JSON.stringify(s)).join('\n')+'\n');}
let server,desktop,browser,panel,d,sourceObserver;
const traffic=[];
try{
 for(const[f,v]of Object.entries(previous.inputs))assert.equal(preregistration.inputs[f],v,'Previous diagnostic input '+f);
 for(const[f,v]of Object.entries({...h.sourceManifest,...h.buildSources.manifest})){let bytes=await readFile(f);assert.equal(sha256(bytes),v,'Candidate executable input '+f);}
 await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
 for(const host of ['standalone','official'])assert.deepEqual(await fileManifest(hostSpecs[host].path),hostSpecs[host].files);
 assert.equal(sha256(await readFile(corpus.intakeFile)),corpus.intakeSha256);
 const assets=new Map();for(const[f,v]of Object.entries(intake.files)){const bytes=await readFile(intakeRoot+'/'+f);assert.equal(sha256(bytes),v.sha256,f);assets.set('/'+f,bytes);}
 for(const a of corpus.apps)assert.equal(sha256(await readFile(a.prepared+'/release.zip')),a.bundleSha256,a.id);
 assets.set('/synthetic/index.html',Buffer.from(html));assets.set('/synthetic/app.js',js);
 server=createServer((req,res)=>{const route=new URL(req.url,'http://local').pathname,name=route.endsWith('/')?route+'index.html':route;traffic.push({route,status:assets.has(name)?200:route==='/favicon.ico'?204:404});res.setHeader('cache-control','no-store');if(assets.has(name)){const ext=path.extname(name);res.setHeader('content-type',ext==='.html'?'text/html':ext==='.js'?'text/javascript':ext==='.css'?'text/css':'application/octet-stream');res.end(assets.get(name));}else{res.statusCode=route==='/favicon.ico'?204:404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;result.origin=origin;desktop=await sourceAccessDesktop(out);
 for(const host of ['standalone','official']){
  result.currentHost=host;const entry={host,environmentBefore:environment(),sourceEvidence:[],lifecycle:[]};result.cases.push(entry);console.log('SETUP',host);
  browser=await startNativeBrowser(out+'/profiles',host,true,false,[],{extensionPath:hostSpecs[host].path,headless:false,display:desktop.display});entry.browser=browser.context.browser().version();assert.match(entry.browser,/Chrome\/153\./);
  panel=await browser.context.newPage();panel.on('pageerror',e=>result.errors.push({host,message:e.message}));await panel.goto('chrome-extension://'+browser.id+'/'+hostSpecs[host].page);{const base=await nativeInspectorUI(panel,browser);const connection=async()=>{if(await panel.evaluate(()=>document.querySelector('[data-atom-id="browser-connection"]').hidden))await base.click('setup-toggle');};d={...base,click:async(id,opts)=>{if(['refresh-tabs','attach','detach'].includes(id))await connection();if(id.startsWith('source-map-'))await base.click('source-nav');if(id.startsWith('native-source-'))await base.click('actions-nav');return base.click(id,opts);},select:async(id,value)=>{if(id==='tabs')await connection();if(id.startsWith('source-map-'))await base.click('source-nav');return base.select(id,value);},files:async(selector,files)=>{await base.click('source-nav');return base.files(selector,files);}};}
  d.p.on('Runtime.consoleAPICalled',e=>{if(['error','warning','warn'].includes(e.type))result.console.push({host,type:e.type,text:e.args.map(a=>a.value??a.description??a.type).join(' ').slice(0,500)});});await d.p.send('Runtime.enable');
  if(setupOnly)await panel.evaluate(()=>{globalThis.__sourceRPC=[];const original=chrome.runtime.sendMessage;chrome.runtime.sendMessage=function(...args){const request=args[0]?.atom?.payload;const id=args[0]?.atom?.id;globalThis.__sourceRPC.push({at:performance.now(),direction:'out',id,op:request?.op,tabId:request?.tabId});const result=original.apply(this,args);result?.then(m=>globalThis.__sourceRPC.push({at:performance.now(),direction:'in',id,op:request?.op,tabId:request?.tabId,ok:m?.ok,error:m?.error,attached:m?.result?.attached,selected:m?.result?.selection?.selector,context:m?.result?.analysis?.actionContext}));return result;};});
  if(setupOnly)await panel.evaluate(()=>{globalThis.__sourceSetupEvents=[];const add=(kind,data)=>{globalThis.__sourceSetupEvents.push({at:performance.now(),kind,...data});if(globalThis.__sourceSetupEvents.length>500)globalThis.__sourceSetupEvents.shift();};chrome.runtime.onMessage.addListener(m=>{if(m?.event)add('event',{event:m.event,scope:m.scope,tabId:m.tabId});});const read=()=>Object.fromEntries(['status','selection-title','selected','source-map-location','source-analysis-status'].map(id=>[id,document.querySelector('[data-atom-id="'+id+'"]')?.textContent]));new MutationObserver(()=>add('ui',read())).observe(document.querySelector('[data-atom-root]'),{childList:true,subtree:true,characterData:true});});
  const warmApps=[{id:'synthetic',selector:'#first',subtree:'synthetic',prepared:out,pairs:[{asset:'app.js',sourceMap:'app.js.map'}]},...corpus.apps];const tabs=new Map();
  const state=id=>rpc(panel,{op:'state',tabId:id,refreshDeep:false});
  const readApp=async a=>panel.evaluate(async({id,selector,synthetic})=>(await chrome.scripting.executeScript({target:{tabId:id},world:synthetic?'MAIN':'ISOLATED',func:({selector,synthetic})=>({title:document.title,input:document.querySelector(selector)?.value??null,todos:[...document.querySelectorAll('.todo-list li')].map(e=>e.textContent),storage:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])),...(synthetic?{counts:{...window.actionCounts}}:{})}),args:[{selector,synthetic}]}))[0].result,{id:tabs.get(a.id).tabId,selector:a.selector,synthetic:a.id==='synthetic'});
  async function choose(a){await d.select('tabs',tabs.get(a.id).tabId);await d.waitOK();}
  async function importFile(a){await d.files(d.q('source-map-file'),[a.prepared+'/release.zip']);await waitFor(()=>panel.evaluate(s=>document.querySelector(s).value==='',d.q('source-map-file')));await d.waitOK();}
  async function clear(){await d.click('source-map-clear');await d.waitOK();}
  async function currentCache(id){const s=await state(id);assert.equal(s.readOnly,true);assert.equal(s.productionChange.active,false);assertMapCache(s.sourceMaps.cache);return s;}
  async function prepare(a,phase){
   assert(tabs.size<3,'No fourth inspected tab');
   const tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin+'/'+a.subtree+'/');result.currentTabId=tabId;tabs.set(a.id,{tabId});await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
   await waitFor(async()=>{try{return(await readApp(a)).title.length>0;}catch{return false;}});tabs.get(a.id).before=await readApp(a);
   await d.click('refresh-tabs');await waitFor(()=>panel.evaluate(({selector,id})=>[...document.querySelector(selector).options].some(o=>o.value===String(id)),{selector:d.q('tabs'),id:tabId}));await choose(a);if(!await panel.evaluate(s=>document.querySelector(s).checked,d.q('source-map-readonly')))await d.click('source-map-readonly');await d.click('attach');await d.waitOK();
   await d.click('inputs-nav');await d.click('pick');await waitFor(async()=>(await state(tabId)).picker?.status==='picking');const point=await panel.evaluate(async({id,selector})=>{await chrome.tabs.update(id,{active:true});return(await chrome.scripting.executeScript({target:{tabId:id},args:[selector],func:selector=>{const e=document.querySelector(selector);e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+Math.min(8,r.width/2),y:r.y+r.height/2};}}))[0].result;},{id:tabId,selector:a.selector});for(const type of ['mouseMoved','mousePressed','mouseReleased'])await panel.evaluate(({id,type,point})=>chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})}),{id:tabId,type,point});await waitFor(async()=>(await state(tabId)).picker?.status==='selected');await d.waitOK();const s=await state(tabId),script=await waitFor(async()=>(await state(tabId)).sourceMaps.scripts.find(s=>s.url===origin+'/'+a.subtree+'/'+a.pairs[0].asset));tabs.get(a.id).script=script;
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
  for(const a of warmApps.filter(a=>['synthetic','javascript-es6'].includes(a.id)))await prepare(a,'warm');if(setupOnly){for(const id of ['synthetic','javascript-es6','javascript-es6']){const a=warmApps.find(a=>a.id===id);console.log('DIAGNOSTIC_SELECT',id);await choose(a);result.currentTabId=tabs.get(id).tabId;console.log('DIAGNOSTIC_SOURCE',id);await d.click('native-source-0');await d.waitOK();await waitFor(async()=>/^Source analysis · (Available|Partial) ·/.test(await d.text('source-analysis-status')));}result.setupState=await state(result.currentTabId);result.setupUI=await panel.evaluate(()=>globalThis.__sourceSetupEvents);await d.close();d=null;await browser.context.close();browser=null;break;}
  await panel.evaluate(installWarmSourceTiming);
  for(const trial of retained&&host==='standalone'?[]:warmSourceOrder()){
   const a=warmApps.find(a=>a.id===trial.caseId);await choose(a);const tabId=tabs.get(a.id).tabId,s=await state(tabId);assert.equal(s.attached,true);assert(s.selection);const attempt={...trial,host,tabId,startedAt:new Date().toISOString()};result.currentTrial=attempt;await appendFile(out+'/attempts.jsonl',JSON.stringify(attempt)+'\n');
   await panel.evaluate(meta=>globalThis.__warmSourceTiming.arm(meta),{...trial,host,tabId});await d.click('native-source-0');await d.waitOK();
   const row=await waitFor(()=>panel.evaluate(ordinal=>{const t=globalThis.__warmSourceTiming;if(t.errors.length)throw Error(t.errors.join('; '));return t.samples.find(s=>s.ordinal===ordinal);},trial.ordinal),15000);
   result.samples.push(row);await appendFile(out+'/samples.jsonl',JSON.stringify(row)+'\n');delete result.currentTrial;console.log('SAMPLE',host,trial.ordinal,trial.caseId,row.previewPaintMs,row.analysisPaintMs,row.analysisStatus);
  }
  entry.summary=summarizeWarmSource(result.samples,host);await panel.evaluate(()=>globalThis.__warmSourceTiming.close());
  for(const a of warmApps.filter(a=>tabs.has(a.id)))assert.deepEqual(await readApp(a),tabs.get(a.id).before);
  entry.environmentAfter=environment();entry.hostFiles=await fileManifest(hostSpecs[host].path);assert.deepEqual(entry.hostFiles,hostSpecs[host].files);
  await d.close();d=null;await browser.context.close();browser=null;console.log('HOST_COMPLETE',host);
 }
 assert.equal(result.samples.length,setupOnly?0:92);assert.equal(result.cache.length,0);assert.equal(result.cancellations.length,0);assert.equal(result.errors.length,0);assert.equal(result.console.length,0);result.targetsMet=setupOnly?null:result.cases.every(c=>Object.values(c.summary.cases).every(x=>x.targets.previewPass&&x.targets.analysisPass));result.status=setupOnly?'PASS_SETUP_ONLY_NOT_LATENCY':'COMPLETE_CURRENT94_WARM_ONLY';
}catch(error){result.status='INCOMPLETE';result.error=error.stack;process.exitCode=1;console.error(error);if(panel){result.failureRPC=await panel.evaluate(()=>globalThis.__sourceRPC).catch(String);result.failureEvents=await panel.evaluate(()=>globalThis.__sourceSetupEvents).catch(String);result.failureState=await rpc(panel,{op:'state',tabId:result.currentTabId,refreshDeep:false}).catch(String);}if(panel)await panel.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});if(sourceObserver)result.parserFailure=await sourceObserver.snapshot().catch(e=>({unavailable:e.message}));}
finally{
 await sourceObserver?.close().catch(()=>{});await d?.close().catch(()=>{});await browser?.context.close().catch(()=>{});await desktop?.close();if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}
 result.inputsAfter=await inputs();if(JSON.stringify(preregistration.inputs)!==JSON.stringify(result.inputsAfter)){result.status='INCOMPLETE';result.inputDrift=true;process.exitCode=1;}result.traffic=traffic;result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('RESULT',result.status,out);
}
