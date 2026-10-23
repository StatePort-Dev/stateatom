// SPDX-License-Identifier: Apache-2.0
// Fixed V02.1 measurement protocol, not product capability or a general benchmark.
import assert from 'node:assert/strict';
export const PERFORMANCE_PROTOCOL=Object.freeze({schema:'stateatom.basic-observer-performance/1',requests:20,responseBytes:1024,warmupBlocks:3,measuredBlocks:30,basicP95Ms:1000,activeOverheadPercent:10});
const orders=[['off','basic','active'],['off','active','basic'],['basic','off','active'],['basic','active','off'],['active','off','basic'],['active','basic','off']];
export function trialOrder(){const result=[];for(const warmup of [true,false])for(let block=0;block<(warmup?3:30);block++)for(const mode of orders[block%6])result.push({ordinal:result.length,warmup,block,mode});return result;}
function distribution(values){const a=[...values].sort((a,b)=>a-b),n=a.length;assert(n);return{n,p50:n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,p95:a[Math.ceil(n*.95)-1],max:a[n-1],min:a[0]};}
const percent=(a,b)=>Math.round((a/b-1)*100*1e8)/1e8;
export function assertPerformanceWindow(w){
 assert.equal(w?.status,'stopped');assert.equal(w.stopReason,'user');assert.equal(w.counts.requests,20);assert.equal(w.counts.completed,20);assert.equal(w.counts.checkpoints,1);assert.equal(w.records,21);assert(w.bytes>0&&w.bytes<=65536,'Invalid observer buffer');
 const keys=['beforeStart','future','foreignContext','unmatched','invalid','outOfOrder','recordLimit','pendingLimit','byteLimit'];
 assert(w.gaps&&typeof w.gaps==='object'&&!Array.isArray(w.gaps),'Missing observation gap schema');assert.deepEqual(Object.keys(w.gaps).sort(),keys.sort(),'Incomplete observation gap schema');for(const k of keys)assert.equal(w.gaps[k],0,'Observation gap '+k);
}
export function summarizePerformance(rows,host){
 const r=rows.filter(x=>x.host===host),order=trialOrder();assert.equal(r.length,order.length,'Incomplete/duplicate sample count');
 for(let i=0;i<order.length;i++){
  const x=r[i];for(const [k,v] of Object.entries(order[i]))assert.equal(x[k],v,'Changed or reordered '+k);
  assert.equal(x.status,'complete');assert.equal(x.trusted,true);assert.equal(x.actions,1);assert.equal(x.requests,20);assert.equal(x.bytes,20480);assert(Number.isFinite(x.durationMs)&&x.durationMs>0,'Invalid workload duration');
  if(x.mode==='basic')assert(Number.isFinite(x.basicLatencyMs)&&x.basicLatencyMs>0,'Invalid gesture latency');
  if(x.mode==='active')assertPerformanceWindow(x.window);
 }
 const measured=r.filter(x=>!x.warmup),byMode=Object.fromEntries(orders[0].map(m=>[m,measured.filter(x=>x.mode===m)])),workload=Object.fromEntries(Object.entries(byMode).map(([m,a])=>[m,distribution(a.map(x=>x.durationMs))])),latency=distribution(byMode.basic.map(x=>x.basicLatencyMs));
 const paired={activeVsOffPercent:[],basicVsOffPercent:[],activeVsBasicPercent:[]};for(let b=0;b<30;b++){const a=Object.fromEntries(measured.filter(x=>x.block===b).map(x=>[x.mode,x.durationMs]));paired.activeVsOffPercent.push(percent(a.active,a.off));paired.basicVsOffPercent.push(percent(a.basic,a.off));paired.activeVsBasicPercent.push(percent(a.active,a.basic));}
 return{complete:true,host,measuredSamples:90,warmupSamples:9,workload,latency,overhead:{activeVsOffPercent:percent(workload.active.p50,workload.off.p50),basicVsOffPercent:percent(workload.basic.p50,workload.off.p50),activeVsBasicPercent:percent(workload.active.p50,workload.basic.p50)},paired,pairedDistributions:Object.fromEntries(Object.entries(paired).map(([k,a])=>[k,distribution(a)])),targets:{basicLatencyPass:latency.p95<=1000,activeOverheadPass:workload.active.p50<=workload.off.p50*1.1},buffer:{records:distribution(byMode.active.map(x=>x.window.records)),bytes:distribution(byMode.active.map(x=>x.window.bytes))}};
}
export const performanceFixtureScript=`
let actions=0;const button=document.getElementById('run'),counter=document.getElementById('counter'),output=document.getElementById('result');
button.addEventListener('click',async event=>{
 const start=performance.now(),trusted=event.isTrusted,id=++actions;button.disabled=true;let requests=0,bytes=0;
 try{
  for(let n=0;n<20;n++){const response=await fetch('/sample?trial='+id+'&n='+n,{cache:'no-store'});if(response.status!==200)throw Error('HTTP '+response.status);const body=await response.text();requests++;bytes+=body.length;if(body.length!==1024)throw Error('Payload size');counter.textContent=String(n+1);}
  await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
  output.textContent=JSON.stringify({id,status:'complete',trusted,requests,bytes,durationMs:performance.now()-start});
 }catch(error){output.textContent=JSON.stringify({id,status:'error',trusted,requests,bytes,message:String(error.message),durationMs:performance.now()-start});}
 finally{button.disabled=false;}
});`;
export const performanceFixtureHTML='<!doctype html><title>V02 fixed workload</title><style>body{font:18px system-ui;padding:24px}button{font:inherit;padding:12px}</style><h1>V02 fixed network workload</h1><button id="run">Run workload</button><p>Completed requests: <span id="counter">0</span></p><pre id="result">null</pre><script src="/app.js"></script>';
