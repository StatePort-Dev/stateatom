// SPDX-License-Identifier: Apache-2.0
// Exact installed native controls. Numeric protocol metrics are not heap/object capture.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {actionTraceResourceConfig as config,actionTraceResourceCases} from './action-trace-resource-cases.mjs';

export async function runActionTraceResourceProbe(o){
 const {kind,entry,out,check,waitFor,inspect,action,appClick,waitTrace,storedTrace}=o;
 const selector='#trace-resource-burst',q=id=>'[data-atom-id="'+id+'"]';
 entry.resources=[];entry.resourceConfig=config;
 const record=async(id,fn)=>{
  const row={...actionTraceResourceCases.find(x=>x.id===id)};entry.resources.push(row);
  await check(kind+' '+id+' '+row.expected,async()=>{await fn(row);row.status='PASS';});return row;
 };
 const appCommand=(method,params={})=>o.panel().evaluate(({id,method,params})=>chrome.debugger.sendCommand({tabId:id},method,params),{id:o.tabId(),method,params});
 const output=()=>o.panel().evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:()=>{const e=document.getElementById('resource-result');return{calls:Number(e.dataset.calls),elapsedMs:Number(e.dataset.elapsed),text:e.textContent,ready:document.readyState};}}))[0].result,o.tabId());
 async function metrics(){
  const raw=await appCommand('Performance.getMetrics'),m=Object.fromEntries(raw.metrics.map(x=>[x.name,x.value]));
  for(const key of['Timestamp','TaskDuration','ScriptDuration','JSHeapUsedSize','JSEventListeners','Nodes','Documents'])assert(Number.isFinite(m[key])&&m[key]>=0,'Native performance metric missing: '+key);
  return Object.fromEntries(['Timestamp','TaskDuration','ScriptDuration','JSHeapUsedSize','JSEventListeners','Nodes','Documents'].map(k=>[k,m[k]]));
 }
 const percentile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.ceil(values.length*p)-1];
 const beforeApp=await o.appProbe();assert.equal(beforeApp.observer,true);
 async function compilation(mode){
  const code=await(await fetch(o.origin()+'/App.vue',{signal:AbortSignal.timeout(10000)})).text();assert(code.includes('resourceBurst'));
  assert.equal(code.includes('__sa_actionToken'),mode!=='C','Actual consumed compiler action mode');const file=out+'/'+kind+'-resource-'+mode+'-compiled.mjs';await writeFile(file,code);return{mode,file,sha256:o.sha256(code),bytes:Buffer.byteLength(code)};
 }
 const compiledB=await compilation('B');
 async function samples(armed){
  const rows=[];
  for(let n=0;n<config.samples;n++){
   await o.reloadApp();await inspect(selector,'disabled');await appCommand('Performance.enable');
   for(let warmup=0;warmup<config.warmups;warmup++){await appClick(selector);await waitFor(async()=> (await output()).calls===(warmup+1)*config.leafCalls);}
   const before=await metrics();let armMetrics=null;
   if(armed){await action('action-observe');await waitTrace(/Waiting for one click/);armMetrics=await metrics();}
   const at=Date.now();await appClick(selector);const actual=await waitFor(async()=>{const r=await output();return r.calls===(config.warmups+1)*config.leafCalls?r:null;});
   let trace=null;if(armed){await waitTrace(/incomplete/);trace=await storedTrace();assert.equal(trace.status,'partial');assert.equal(trace.records.length,config.recordLimit);assert.match(trace.reason,/record budget/);assert.equal(trace.records.filter(r=>r.kind==='dispatch').length,1);assert.equal(trace.records.filter(r=>r.kind==='body-entry').length,32);assert.equal(trace.records.filter(r=>r.kind==='body-leave').length,31);assert.equal(trace.runtimeFunctionObjectIdentity,'Unavailable');assert.equal(trace.asyncEffects,'Unlinked');assert.equal(trace.actionUndone,false);assert.equal(trace.completeListenerCoverage,false);assert(trace.records.filter(r=>r.kind==='body-entry').every(r=>['resourceBurst','resourceLeaf'].includes(r.source.symbol)));assert(Buffer.byteLength(JSON.stringify(trace))<=config.maxTraceBytes);}
   else{const untouched=await storedTrace();assert(!untouched||!['armed','collecting','complete'].includes(untouched.status));assert(!untouched||untouched.records.length===0);}
   const after=await metrics(),reference=armMetrics||before;
   assert(after.TaskDuration>=reference.TaskDuration);assert(after.JSEventListeners<=before.JSEventListeners+config.maxListenerDelta,'Owned capture listener growth');
   rows.push({sample:n+1,original:actual,nativeWallMs:Date.now()-at,before,armMetrics,after,taskMs:(after.TaskDuration-reference.TaskDuration)*1000,traceBytes:trace?Buffer.byteLength(JSON.stringify(trace)):0,...(trace?{trace}:{}),scope:'Handler self-time excludes root enter/leave; native task counter includes collector/probes. Heap totals descriptive, no forced GC.'});
  }
  const handlerTimes=rows.map(r=>r.original.elapsedMs),taskTimes=rows.map(r=>r.taskMs),summary={samples:rows.length,handlerMedianMs:percentile(handlerTimes,.5),handlerP95Ms:percentile(handlerTimes,.95),appTaskP95Ms:percentile(taskTimes,.95)};
  assert(summary.handlerMedianMs<=config.maxHandlerMedianMs,'Preregistered local handler median guard');assert(summary.handlerP95Ms<=config.maxHandlerP95Ms,'Preregistered local handler p95 guard');assert(summary.appTaskP95Ms<=config.maxAppTaskP95Ms,'Preregistered local app task p95 guard');
  return{summary,samples:rows};
 }
 const unarmed=await record('unarmed',async row=>{row.compilation=compiledB;Object.assign(row,await samples(false));});
 const armed=await record('armed-budget',async row=>{row.compilation=compiledB;Object.assign(row,await samples(true));});
 await record('cleanup',async row=>{
  const before=await output(),baseline=await metrics();await action('action-observe');await waitTrace(/Waiting/);await action('action-observe-cancel');await waitTrace(/cancelled/);await appClick(selector);const afterCancel=await output();assert.equal(afterCancel.calls,before.calls+config.leafCalls);assert.equal((await storedTrace()).records.length,0);assert.equal((await storedTrace()).status,'cancelled');
  await action('action-observe-clear');await waitTrace(/cleared/);await appClick(selector);const afterClear=await output(),trace=await storedTrace(),end=await metrics();assert.equal(afterClear.calls,afterCancel.calls+config.leafCalls);assert.equal(trace.status,'cleared');assert.equal(trace.traceId,null);assert.equal(trace.records.length,0);assert(end.JSEventListeners<=baseline.JSEventListeners+config.maxListenerDelta);row.before=before;row.afterCancel=afterCancel;row.afterClear=afterClear;row.metrics={baseline,end};
 });
 // Retain another bounded partial for the actual rendered card after cleanup.
 await inspect(selector,'disabled');await action('action-observe');await waitTrace(/Waiting/);await appClick(selector);await waitTrace(/incomplete/);
 await record('visual',async row=>{
  row.views=[];for(const width of[390,1100]){const p=await o.protocol();await p.send('Page.bringToFront');await p.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await o.panel().evaluate(async()=>{document.querySelector('[data-atom-id="action-observe-status"]').scrollIntoView({block:'start',behavior:'instant'});await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});const v=await o.panel().evaluate(()=>{const root=document.querySelector('[data-atom-root]'),status=document.querySelector('[data-atom-id="action-observe-status"]');return{width:innerWidth,fontSize:getComputedStyle(root).fontSize,overflow:root.scrollWidth>root.clientWidth+1,status:status.textContent,rows:document.querySelectorAll('[data-atom-id="action-observe-records"] > p').length};});assert.equal(v.width,width);assert.equal(v.fontSize,'13px');assert.equal(v.overflow,false);assert.match(v.status,/incomplete/);assert.equal(v.rows,32);row.views.push({...v,phase:'geometry-before-screenshot'});const file=out+'/'+kind+'-resource-partial-'+width+'-candidate.png',shot=await p.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(file,Buffer.from(shot.data,'base64'));row.views.push({...v,file});}
 });
 await o.switchMode('C');const baseline=await record('baseline',async row=>{row.compilation=await compilation('C');Object.assign(row,await samples(false));});
 const expected=(config.warmups+1)*config.leafCalls;for(const mode of[unarmed,armed,baseline])assert(mode.samples.every(s=>s.original.calls===expected&&s.original.text==='Completed '+expected+' original leaf calls'));
 entry.performanceComparison={baseline:baseline.summary,unarmed:unarmed.summary,armed:armed.summary,limits:'Finite local numeric guards only, no universal responsiveness/heap/host or production acceptance; no new async/state/request edges.'};
 assert.deepEqual(entry.resources.map(r=>r.id),['unarmed','armed-budget','cleanup','visual','baseline']);
 assert.equal(await readFile(o.sourceFile(),'utf8'),o.originalSource);
}
