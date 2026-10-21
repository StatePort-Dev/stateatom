// SPDX-License-Identifier: Apache-2.0
// New original-matrix controls through the actual immutable Atom/Vue/IDE pair.
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {actionTraceSemanticCases} from './action-trace-semantic-cases.mjs';
export async function runActionTraceSemanticProbe(o){
 const{kind,entry,check,inspect,action,appClick,waitTrace,storedTrace,waitFor}=o;
 entry.semantics=[];
 const record=async(id,fn)=>{const row={...actionTraceSemanticCases.find(c=>c.id===id)};entry.semantics.push(row);await check(kind+' '+id+' '+row.expected,async()=>{await fn(row);row.status='PASS';});return row;};
 const network=()=>o.panel().evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:()=>{const e=document.getElementById('network-result');return{selected:Number(e.dataset.selected),background:Number(e.dataset.background),selectedFlag:e.dataset.selectedFlag==='true',backgroundFlag:e.dataset.backgroundFlag==='true',text:e.textContent};}}))[0].result,o.tabId());
 const bodies=t=>t.records.filter(r=>r.kind==='body-entry').map(r=>r.source.symbol);
 async function independent(trace){
  const s=await o.state(),nodes=s.analysis.graph.nodes.filter(n=>String(n.id).startsWith('action-trace:')),edges=s.analysis.graph.edges.filter(e=>String(e.id).startsWith('action-trace:'));
  assert.equal(nodes.length,trace.records.length);assert.equal(edges.length,trace.records.length);assert(edges.every(e=>e.relation==='independent-action-observation'&&/no property\/network consequence/.test(e.method)));assert(nodes.every(n=>['dispatch','body-entry','body-leave'].includes(n.kind)));return{nodes,edges};
 }
 async function requestRound(observe,row){
  await inspect('#request-selected','disabled');const before=await network();
  if(observe){await action('action-observe');await waitTrace(/Waiting/);}
  await appClick('#request-background');const background=await o.waitHttp('/__a05/background');
  if(observe){const t=await storedTrace();assert.equal(t.status,'armed');assert.equal(t.records.length,0);}
  await appClick('#request-selected');const selected=await o.waitHttp('/__a05/selected');let trace;
  if(observe){await waitTrace(/Recorded/);trace=await storedTrace();assert.equal(trace.status,'complete');assert.deepEqual(bodies(trace),['requestSelected']);assert.equal(trace.records.find(r=>r.kind==='body-leave').completion,'return');assert.equal(trace.asyncEffects,'Unlinked');assert.equal(trace.runtimeFunctionObjectIdentity,'Unavailable');row.traceBeforeResponses=trace;row.graphBeforeResponses=await independent(trace);}
  assert.deepEqual(await network(),before);await o.releaseHttp(background.id);await waitFor(async()=> (await network()).background===before.background+1);assert.equal((await network()).selected,before.selected);
  await o.releaseHttp(selected.id);const after=await waitFor(async()=>{const n=await network();return n.selected===before.selected+1?n:null;});assert.equal(after.selectedFlag,true);assert.equal(after.backgroundFlag,true);
  if(observe){const afterTrace=await storedTrace();assert.deepEqual(afterTrace.records,trace.records);assert.equal(afterTrace.asyncEffects,'Unlinked');row.graphAfterResponses=await independent(afterTrace);}
  const s=await waitFor(async()=>{const s=await o.state();return s.requests.some(r=>r.url.endsWith('/__a05/background'))&&s.requests.some(r=>r.url.endsWith('/__a05/selected'))?s:null;});row.requests=s.requests.filter(r=>r.url.includes('/__a05/')).map(r=>({url:r.url,requestId:r.requestId??r.id??null}));row.serverRequests={background,selected};row.after=after;return after;
 }
 async function asyncRound(observe,row){
  await inspect('#request-async','disabled');const before=await network();if(observe){await action('action-observe');await waitTrace(/Waiting/);}
  await appClick('#request-async');const selected=await o.waitHttp('/__a05/selected');let trace;
  if(observe){await waitTrace(/incomplete/);trace=await storedTrace();assert.equal(trace.status,'partial');assert.deepEqual(bodies(trace),[]);assert.equal(trace.records.length,1);assert.equal(trace.records[0].kind,'dispatch');row.traceBeforeResponse=trace;}
  await o.releaseHttp(selected.id);const after=await waitFor(async()=>{const n=await network();return n.selected===before.selected+1?n:null;});assert.equal(after.selectedFlag,true);
  if(observe){const afterTrace=await storedTrace();assert.deepEqual(afterTrace.records,trace.records);assert.equal(afterTrace.asyncEffects,'Unlinked');row.graphAfterResponse=await independent(afterTrace);}row.after=after;row.serverRequest=selected;return after;
 }
 async function replaceRound(observe,row){
  await inspect('#replaced','disabled');const before=await o.appProbe();if(observe){await action('action-observe');await waitTrace(/Waiting/);}
  await appClick('#replace-handler');await appClick('#replaced');await waitFor(async()=> (await o.appProbe()).alternative===before.alternative+1);
  if(observe){const old=await waitFor(async()=>{const t=await storedTrace();return t&&['complete','stale','stopped','cancelled'].includes(t.status)?t:null;});assert(!bodies(old).includes('ordinary'),'old declaration cannot substitute the actual replacement body');if(old.status==='complete')assert.deepEqual(bodies(old),['alternative']);else assert.equal(old.sourceCurrent,false);row.oldArmAfterReplacement=old;}
  await inspect('#replaced','disabled');if(observe){await action('action-observe');await waitTrace(/Waiting/);}await appClick('#replaced');const after=await waitFor(async()=>{const p=await o.appProbe();return p.alternative===before.alternative+2?p:null;});assert.equal(after.invocations,before.invocations);
  if(observe){await waitTrace(/Recorded/);const trace=await storedTrace();assert.equal(trace.status,'complete');assert.deepEqual(bodies(trace),['alternative']);assert.equal(trace.runtimeFunctionObjectIdentity,'Unavailable');row.currentTrace=trace;row.graph=await independent(trace);}row.before={ordinary:before.invocations,alternative:before.alternative};row.after={ordinary:after.invocations,alternative:after.alternative};return row.after;
 }
 async function slowRound(observe,row){
  await inspect('#request-slow','disabled');if(observe){await action('action-observe');await waitTrace(/Waiting/);}
  const clicking=appClick('#request-slow'),pending=await o.waitHttp('/__a05/slow');await new Promise(resolve=>setTimeout(resolve,10100));await o.releaseHttp(pending.id);await clicking;
  const output=await o.panel().evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:()=>{const e=document.getElementById('slow-result');return{count:Number(e.dataset.count),elapsedMs:Number(e.dataset.elapsed),text:e.textContent};}}))[0].result,o.tabId());assert.equal(output.count,1);assert(output.elapsedMs>=10000);row.output=output;row.serverRequest=pending;
  if(observe){row.ui=await waitTrace(/timeout|timed out/);row.trace=await storedTrace();assert.equal(row.trace.status,'expired');assert.deepEqual(bodies(row.trace),['requestSlow']);assert.equal(row.trace.records.length,2);assert.equal(row.trace.records.filter(r=>r.kind==='body-leave').length,0);assert.equal(row.trace.actionUndone,false);row.graph=await independent(row.trace);const p=await o.protocol();await p.send('Page.bringToFront');assert.match(row.ui.status,/Click recorded.*timed out/);assert.doesNotMatch(row.ui.status,/No supported interaction/);
   row.views=[];for(const width of[390,1100]){await p.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await o.panel().evaluate(async()=>{document.querySelector('[data-atom-id="action-observe-status"]').scrollIntoView({block:'center',behavior:'instant'});await document.fonts.ready;await new Promise(requestAnimationFrame);});const v=await o.panel().evaluate(()=>{const root=document.querySelector('[data-atom-root]');return{width:innerWidth,fontSize:getComputedStyle(root).fontSize,overflow:root.scrollWidth>root.clientWidth+1,body:document.querySelector('[data-atom-id="action-observe-records"]').textContent};});assert.equal(v.width,width);assert.equal(v.fontSize,'13px');assert.equal(v.overflow,false);assert.match(v.body,/requestSlow.*exit unavailable/);const file=o.out+'/'+kind+'-expired-body-'+width+'-candidate.png',shot=await p.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(file,Buffer.from(shot.data,'base64'));row.views.push({...v,file});}
  }
  return output;
 }
 const concurrent=await record('concurrent-requests',row=>requestRound(true,row));
 const async=await record('async-gap',row=>asyncRound(true,row));
 const replaced=await record('callback-replaced',row=>replaceRound(true,row));
 const slow=await record('expiry-inside-body',row=>slowRound(true,row));
 await o.switchMode('C');
 await record('action-disabled-control',async row=>{row.concurrent={};await requestRound(false,row.concurrent);row.async={};await asyncRound(false,row.async);row.replaced={};await replaceRound(false,row.replaced);row.slow={};await slowRound(false,row.slow);assert.deepEqual(row.concurrent.after,concurrent.after);assert.deepEqual(row.async.after,async.after);assert.deepEqual(row.replaced.after,replaced.after);assert.equal(row.slow.output.count,slow.output.count);assert.equal(row.slow.output.text,slow.output.text);const trace=await storedTrace();assert(!trace||trace.records.length===0);row.scope='Original outputs/control only; equal HTTP data never supplies an action consequence edge.';});
 assert.deepEqual(entry.semantics.map(r=>r.id),actionTraceSemanticCases.map(r=>r.id));
}
