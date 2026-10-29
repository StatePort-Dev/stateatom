// SPDX-License-Identifier: Apache-2.0
// Final94 Basic-only UI latency. Accepted89 Active overhead is not remeasured.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,appendFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import os from 'node:os';
import {performance} from 'node:perf_hooks';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {waitFor,rpc} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {sourceAccessDesktop} from '../helpers/source-access-native-desktop.mjs';
import {performanceFixtureScript,performanceFixtureHTML} from '../helpers/basic-observer-performance.mjs';
const hf=process.argv[2];assert(hf);const h=JSON.parse(await readFile(hf));assert.equal(h.package.version,'0.1.0-candidate.20261029.94');
const hostSpecs=JSON.parse(await readFile('docs/testing/current94-host-case.json')).hosts;
const out='.artifacts/v02/current94-basic/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true,mode:0o700});
const paths=[...new Set(['tests/integration/current94-basic-native.mjs','tests/helpers/basic-observer-performance.mjs','tests/helpers/native-inspector-ui.mjs','tests/helpers/source-access-native-desktop.mjs','scripts/native-browser.mjs','scripts/harness.mjs','docs/testing/current94-host-case.json','docs/completion/340-v02-current94-latency-case.md',...Object.keys(h.sourceManifest),...Object.keys(h.buildSources.manifest)])];
const inputs=async()=>Object.fromEntries(await Promise.all(paths.map(async f=>[f,sha256(await readFile(f))])));
const environment=()=>({platform:os.platform(),release:os.release(),cpu:os.cpus()[0]?.model,logicalCPUs:os.cpus().length,freeRAM:os.freemem(),load:os.loadavg()});
const order=Array.from({length:33},(_,ordinal)=>({ordinal,warmup:ordinal<3,block:ordinal<3?ordinal:ordinal-3,mode:'basic'}));
const preregistration={schema:'stateatom.current94-basic-latency/1',createdAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),inputs:await inputs(),handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},order,environment:environment(),configuration:{route:'loopback HTTP, fresh owned headed Chrome153 profile, readonly attachment',latency:'Unchanged original manual CSS lookup pointerdown to useful #run text + OK + two inspector frames',workload:'Original fixed script:20 sequential1024-byte GET responses per trusted app click',comparison:'Current UI Basic latency only; no off/active workload ratio or HTTPS-equivalence claim',basicP95Ms:1000,fixture:{html:sha256(performanceFixtureHTML),script:sha256(performanceFixtureScript)}}};
await writeFile(out+'/preregistration.json',JSON.stringify(preregistration,null,2),{flag:'wx'});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const result={schema:preregistration.schema,status:'RUNNING',out,preregistrationSha256:sha256(await readFile(out+'/preregistration.json')),cases:[],samples:[],errors:[],console:[]};
let server,desktop,browser,panel,d;const traffic=[];
async function fixture(tabId){return panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id,frameIds:[0]},world:'ISOLATED',func:()=>({ready:document.readyState==='complete',value:JSON.parse(document.getElementById('result').textContent),counter:document.getElementById('counter').textContent,disabled:document.getElementById('run').disabled})}))[0].result,tabId);}
async function primeVisibleSelector(tabId){
 // Current UI reveals advanced lookup only after a real element is selected.
 // Select a DIFFERENT element so the measured #run read is not the primed target.
 await d.click('inputs-nav');await d.click('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId,refreshDeep:false})).picker?.status==='picking');
 const point=await panel.evaluate(async id=>{await chrome.tabs.update(id,{active:true});return(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:()=>{const e=document.getElementById('counter');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};}}))[0].result;},tabId);
 for(const type of ['mouseMoved','mousePressed','mouseReleased'])await panel.evaluate(({id,type,point})=>chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})}),{id:tabId,type,point});
 await waitFor(async()=>{const state=await rpc(panel,{op:'state',tabId,refreshDeep:false});return state.picker?.status==='selected'&&state.selection?.selector==='#counter';});await d.waitOK();
}
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
async function appClick(tabId){
 await panel.evaluate(id=>chrome.tabs.update(id,{active:true}),tabId);
 const point=await panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id,frameIds:[0]},world:'ISOLATED',func:async()=>{const e=document.getElementById('run');if(e.disabled)throw Error('Workload still busy');e.scrollIntoView({block:'center'});await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect();return{x:screenX+(outerWidth-innerWidth)/2+r.x+r.width/2,y:screenY+outerHeight-innerHeight+r.y+r.height/2};}}))[0].result,tabId);
 const win=await waitFor(()=>{try{return desktop.native(['search','--onlyvisible','--name','V02 fixed workload']).split('\n')[0];}catch{return null;}});result.nativeAppWindowTitle=desktop.native(['getwindowname',win]);desktop.native(['windowfocus','--sync',win]);desktop.native(['mousemove',String(Math.round(point.x)),String(Math.round(point.y))]);desktop.native(['mousedown','1']);desktop.native(['mouseup','1']);
}
async function closeBrowser(){await d?.close().catch(()=>{});d=null;await browser?.context.close();browser=null;}
try{
 await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
 for(const[f,hash]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(preregistration.inputs[f],hash,'Frozen candidate input '+f);
 for(const host of ['standalone','official'])assert.deepEqual(await fileManifest(hostSpecs[host].path),hostSpecs[host].files);
 server=createServer((req,res)=>{const route=new URL(req.url,'http://fixture').pathname;traffic.push({route,at:Date.now()});res.setHeader('cache-control','no-store');if(route==='/app.js'){res.setHeader('content-type','text/javascript');res.end(performanceFixtureScript);}else if(route==='/sample'){res.setHeader('content-type','text/plain');res.end('V'.repeat(1024));}else if(route==='/favicon.ico'){res.writeHead(204);res.end();}else{res.setHeader('content-type','text/html');res.end(performanceFixtureHTML);}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;result.origin=origin;
 desktop=await sourceAccessDesktop(out);
 for(const host of ['standalone','official']){
  const c={host,environmentBefore:environment()};result.cases.push(c);console.log('SETUP',host);
  browser=await startNativeBrowser(out+'/profiles',host,true,false,[],{extensionPath:hostSpecs[host].path,headless:false,display:desktop.display});c.browser=browser.context.browser().version();assert.match(c.browser,/Chrome\/153\./);
  panel=await browser.context.newPage();panel.on('pageerror',e=>result.errors.push({host,text:e.message}));await panel.goto('chrome-extension://'+browser.id+'/'+hostSpecs[host].page);
  {const base=await nativeInspectorUI(panel,browser);const connection=async()=>{if(await panel.evaluate(()=>document.querySelector('[data-atom-id="browser-connection"]').hidden))await base.click('setup-toggle');};d={...base,click:async(id,opts)=>{if(['refresh-tabs','attach','detach'].includes(id))await connection();if(id==='source-map-readonly')await base.click('source-nav');if(id==='inspect-selector')await base.click('inputs-nav');return base.click(id,opts);},select:async(id,value)=>{if(id==='tabs')await connection();return base.select(id,value);},fill:async(id,value)=>{await base.click('inputs-nav');return base.fill(id,value);}};}
  d.p.on('Runtime.consoleAPICalled',e=>{if(['error','warning','warn'].includes(e.type))result.console.push({host,level:e.type,text:(e.args||[]).map(x=>x.value??x.description??x.type).join(' ').slice(0,1024)});});await d.p.send('Runtime.enable');
  const tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin+'/');await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).title==='V02 fixed workload',tabId));await d.click('refresh-tabs');await waitFor(()=>panel.evaluate(({q,id})=>[...document.querySelector(q).options].some(o=>o.value===String(id)),{q:d.q('tabs'),id:tabId}));await d.select('tabs',tabId);await d.waitOK();if(!await panel.evaluate(s=>document.querySelector(s).checked,d.q('source-map-readonly')))await d.click('source-map-readonly');let lastAction=0;
  for(const trial of order){
   if((await rpc(panel,{op:'state',tabId,refreshDeep:false})).attached){await d.click('detach');await d.waitOK();}
   const row={...trial,host,startedAt:new Date().toISOString()};result.currentTrial=row;await appendFile(out+'/attempts.jsonl',JSON.stringify(row)+'\n');
   await d.click('attach');await d.waitOK();await primeVisibleSelector(tabId);const timing=await selectTarget(true);row.basicLatencyMs=timing.durationMs;row.basicLatency=timing;
   const state=await rpc(panel,{op:'state',tabId,refreshDeep:false});assert.equal(state.attached,true);assert.equal(state.readOnly,true);assert.equal(state.selection.selector,'#run');assert.equal(state.selection.value,'Run workload');assert.equal(state.productionChange.active,false);assert.notEqual(state.productionObservation?.status,'recording');
   const before=await fixture(tabId);assert.equal(before.value?.id??0,lastAction);assert.equal(before.disabled,false);const trafficBefore=traffic.filter(x=>x.route==='/sample').length,start=performance.now();
   await appClick(tabId);const final=await waitFor(async()=>{const f=await fixture(tabId);return f.value?.id===lastAction+1&&!f.disabled?f:null;},30000);
   Object.assign(row,final.value,{actions:final.value.id-lastAction,wallGestureToReadbackMs:performance.now()-start});lastAction=final.value.id;assert.equal(row.status,'complete');assert.equal(row.trusted,true);assert.equal(row.actions,1);assert.equal(row.requests,20);assert.equal(row.bytes,20480);assert.equal(final.counter,'20');assert.equal(traffic.filter(x=>x.route==='/sample').length-trafficBefore,20);
   result.samples.push(row);delete result.currentTrial;await appendFile(out+'/samples.jsonl',JSON.stringify(row)+'\n');console.log('SAMPLE',host,trial.ordinal,row.basicLatencyMs);
  }
  const rows=result.samples.filter(r=>r.host===host);assert.equal(rows.length,33);for(let i=0;i<33;i++)for(const[k,v]of Object.entries(order[i]))assert.equal(rows[i][k],v);
  const values=rows.filter(r=>!r.warmup).map(r=>r.basicLatencyMs).sort((a,b)=>a-b);assert(values.every(x=>Number.isFinite(x)&&x>0));c.latency={n:values.length,min:values[0],p50:(values[14]+values[15])/2,p95:values[28],max:values[29]};c.targetPass=c.latency.p95<=1000;c.environmentAfter=environment();
  // Separate post-timing U04 recovery: no sample is replaced or excluded.
  await d.fill('selector','[');await d.click('inspect-selector');await waitFor(async()=>/^Error: Could not use this CSS selector\./.test(await d.text('status')));c.selectorError=await d.text('status');assert.doesNotMatch(c.selectorError,/TypeError|null|undefined/);await selectTarget(false);assert.match(await d.text('selected'),/#run.*Run workload/);c.selectorRecovery=true;
  await d.click('selector-details',{summary:true});c.views=[];for(const width of [440,390]){const file=out+'/'+host+'-'+width+'-candidate.png',geometry=await d.screenshot(file,{width});assert.equal(geometry.overflow,false);assert(Number.parseFloat(geometry.rootFont)>=13);c.views.push({file,...geometry});}
  await d.click('actions-nav');await d.key('ArrowRight','ArrowRight',39);c.keyboard=await panel.evaluate(()=>({active:document.activeElement?.dataset.atomId,selected:document.querySelector('[data-atom-id="source-nav"]').getAttribute('aria-selected')}));assert.equal(c.keyboard.active,'source-nav');assert.equal(c.keyboard.selected,'true');
  assert.deepEqual(await fileManifest(hostSpecs[host].path),hostSpecs[host].files);await closeBrowser();
 }
 assert.equal(result.samples.length,66);assert.equal(result.errors.length,0);assert.equal(result.console.length,0);result.targetsMet=result.cases.every(c=>c.targetPass);result.status='COMPLETE_BASIC_ONLY';
}catch(error){result.status='INCOMPLETE';result.error=error.stack;process.exitCode=1;console.error(error);if(panel)await panel.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}
finally{await closeBrowser().catch(e=>result.errors.push({cleanup:e.message}));await desktop?.close().catch(e=>result.errors.push({cleanup:e.message}));server?.closeAllConnections();if(server?.listening)await new Promise(r=>server.close(r));result.inputsAfter=await inputs();if(JSON.stringify(preregistration.inputs)!==JSON.stringify(result.inputsAfter)){result.status='INCOMPLETE';result.inputDrift=true;process.exitCode=1;}result.traffic=traffic;result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('RESULT',result.status,out);}
