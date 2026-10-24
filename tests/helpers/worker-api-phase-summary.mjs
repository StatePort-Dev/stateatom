// SPDX-License-Identifier: Apache-2.0
// Temporal API occupancy only. Concurrent requests, JS and guardian RPC are not
// causally assigned to Apply; timer coarsening remains a browser limitation.
import assert from 'node:assert/strict';
const apis=['debugger.sendCommand','tabs.get','permissions.contains','scripting.executeScript','storage.session.get','storage.session.set','storage.local.get','storage.local.set','runtime.sendMessage'];
const methods=['DOM.enable','DOM.getDocument','DOM.querySelector','DOM.describeNode','DOM.pushNodesByBackendIdsToFrontend','DOM.resolveNode','DOM.requestNode','Runtime.callFunctionOn','Runtime.releaseObjectGroup','Debugger.getScriptSource'];
function union(intervals){let end=-Infinity,total=0;for(const[a,b]of intervals.toSorted((a,b)=>a[0]-b[0])){if(b<=end)continue;total+=b-Math.max(end,a);end=b;}return total;}
export function summarizeWorkerAPIPhases(snapshot,apply,{inspectorOrigin,tabId,maxLimit=2048}){
 assert(Number.isFinite(inspectorOrigin)&&inspectorOrigin>0);assert(Number.isSafeInteger(tabId)&&tabId>0);assert.equal(snapshot.tabId,tabId);
 assert.deepEqual(Object.keys(snapshot).sort(),['tag','tabId','limit','clock','rows','overflow','inflight','unsupported'].sort());assert(typeof snapshot.tag==='string'&&/^[A-Za-z0-9-]{1,64}$/.test(snapshot.tag));
 assert.deepEqual(Object.keys(snapshot.clock).sort(),['timeOrigin','crossOriginIsolated'].sort());assert(Number.isFinite(snapshot.clock.timeOrigin)&&snapshot.clock.timeOrigin>0);assert.equal(typeof snapshot.clock.crossOriginIsolated,'boolean');
 assert([2048,16384].includes(maxLimit));assert(Number.isSafeInteger(snapshot.limit)&&snapshot.limit>0&&snapshot.limit<=maxLimit);assert.equal(snapshot.overflow,false);assert.equal(snapshot.inflight,0);assert.equal(snapshot.unsupported,false);assert(Array.isArray(snapshot.rows)&&snapshot.rows.length>0&&snapshot.rows.length<=snapshot.limit);
 assert.equal(apply.op,'inputs-apply');assert.equal(apply.ok,true);assert(Number.isFinite(apply.startMs)&&apply.startMs>=0&&Number.isFinite(apply.endMs)&&apply.endMs>=apply.startMs);assert.equal(apply.durationMs,apply.endMs-apply.startMs);
 const delta=snapshot.clock.timeOrigin-inspectorOrigin,groups={},all=[],methodCounts={};let intersectingRows=0,lastStart=-Infinity;
 for(const[i,row]of snapshot.rows.entries()){
  assert.deepEqual(Object.keys(row).sort(),['ordinal','api','method','startMs','endMs','durationMs','ok','supported'].sort());assert.equal(row.ordinal,i);assert(apis.includes(row.api));assert.equal(typeof row.ok,'boolean');assert.equal(row.supported,true);
  assert(Number.isFinite(row.startMs)&&row.startMs>=0&&row.startMs>=lastStart&&Number.isFinite(row.endMs)&&row.endMs>=row.startMs);lastStart=row.startMs;assert.equal(row.durationMs,row.endMs-row.startMs);
  if(row.api==='debugger.sendCommand'){assert(methods.includes(row.method));methodCounts[row.method]=(methodCounts[row.method]||0)+1;}else assert.equal(row.method,null);
  const g=groups[row.api]??={scope:['debugger.sendCommand','tabs.get','scripting.executeScript'].includes(row.api)?'selected-tab':'worker-wide',rows:0,intersectingRows:0,intervals:[]};g.rows++;
  const a=Math.max(apply.startMs,row.startMs+delta),b=Math.min(apply.endMs,row.endMs+delta);
  if(b>a){g.intersectingRows++;g.intervals.push([a,b]);all.push([a,b]);intersectingRows++;}
 }
 const apiUnionMs=union(all),uncoveredMs=apply.durationMs-apiUnionMs;assert(uncoveredMs>=0);
 return{clockTranslationMs:delta,applyMs:apply.durationMs,windowRows:snapshot.rows.length,intersectingRows,apiUnionMs,uncoveredMs,rejectedRowsInWholeWindow:snapshot.rows.filter(row=>!row.ok).length,apis:Object.fromEntries(Object.entries(groups).map(([key,{intervals,...group}])=>[key,{...group,unionMs:union(intervals)}])),nativeMethodCountsInWholeWindow:methodCounts,requestAttribution:'UNKNOWN_CONCURRENT_STATE_INCLUDED',uncoveredAttribution:'UNKNOWN_GUARDIAN_JS_QUEUE_AND_UNWRAPPED_WORK',precision:'COARSENED_UNKNOWN_BROWSER_PRECISION',performanceAcceptance:false};
}
