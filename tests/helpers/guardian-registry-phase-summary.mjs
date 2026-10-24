// SPDX-License-Identifier: Apache-2.0
// Partial guardian segment; temporal occupancy, not selected-request causality.
import assert from'node:assert/strict';import{summarizeWorkerAPIPhases}from'./worker-api-phase-summary.mjs';
const methods=['connect','acquire','verify','begin','finish','release','disconnect','claimCleanup','finishCleanup','retryCleanup','status','snapshot'];
function union(intervals){let end=-Infinity,total=0;for(const[a,b]of intervals.toSorted((a,b)=>a[0]-b[0])){if(b<=end)continue;total+=b-Math.max(end,a);end=b;}return total;}
export function summarizeGuardianRegistryPhases(snapshot,apply,{inspectorOrigin,workerTrace,tabId}){
 const api=summarizeWorkerAPIPhases(workerTrace,apply,{inspectorOrigin,tabId,maxLimit:16384});
 assert.deepEqual(Object.keys(snapshot).sort(),['tag','limit','clock','rows','overflow','inflight','unsupported'].sort());assert.equal(snapshot.tag,workerTrace.tag);
 assert.deepEqual(Object.keys(snapshot.clock).sort(),['timeOrigin','crossOriginIsolated'].sort());assert(Number.isFinite(snapshot.clock.timeOrigin)&&snapshot.clock.timeOrigin>0);assert.equal(typeof snapshot.clock.crossOriginIsolated,'boolean');
 assert(Number.isSafeInteger(snapshot.limit)&&snapshot.limit>0&&snapshot.limit<=16384);assert.equal(snapshot.overflow,false);assert.equal(snapshot.inflight,0);assert.equal(snapshot.unsupported,false);assert(Array.isArray(snapshot.rows)&&snapshot.rows.length>0&&snapshot.rows.length<=snapshot.limit);
 const delta=snapshot.clock.timeOrigin-inspectorOrigin,intervals=[],groups={};let lastStart=-Infinity,intersectingRows=0;
 const clip=(row,shift)=>[Math.max(apply.startMs,row.startMs+shift),Math.min(apply.endMs,row.endMs+shift)];
 for(const[i,row]of snapshot.rows.entries()){
  assert.deepEqual(Object.keys(row).sort(),['ordinal','op','startMs','endMs','durationMs','ok'].sort());assert.equal(row.ordinal,i);assert(methods.includes(row.op));assert.equal(typeof row.ok,'boolean');assert(Number.isFinite(row.startMs)&&row.startMs>=0&&row.startMs>=lastStart&&Number.isFinite(row.endMs)&&row.endMs>=row.startMs);lastStart=row.startMs;assert.equal(row.durationMs,row.endMs-row.startMs);
  const group=groups[row.op]??={rows:0,intersectingRows:0,intervals:[]};group.rows++;const interval=clip(row,delta);if(interval[1]>interval[0]){group.intersectingRows++;intersectingRows++;intervals.push(interval);group.intervals.push(interval);}
 }
 const apiIntervals=workerTrace.rows.map(row=>clip(row,api.clockTranslationMs)).filter(([a,b])=>b>a),registryUnionMs=union(intervals),combinedUnionMs=union([...intervals,...apiIntervals]),uncoveredMs=apply.durationMs-combinedUnionMs;assert(uncoveredMs>=0);assert.equal(union(apiIntervals),api.apiUnionMs);
 return{clockTranslationMs:delta,applyMs:apply.durationMs,windowRows:snapshot.rows.length,intersectingRows,registryUnionMs,apiUnionMs:api.apiUnionMs,combinedUnionMs,uncoveredMs,registryOutsideAPIUnionMs:combinedUnionMs-api.apiUnionMs,rejectedRegistryRowsInWholeWindow:snapshot.rows.filter(row=>!row.ok).length,ops:Object.fromEntries(Object.entries(groups).map(([key,{intervals,...group}])=>[key,{...group,unionMs:union(intervals)}])),registryScope:'OFFSCREEN_REGISTRY_WORKER_ROUND_TRIP_ONLY',requestAttribution:'UNKNOWN_CONCURRENT_STATE_AND_HEALTH_INCLUDED',uncoveredAttribution:'UNKNOWN_CHROME_PORT_DOCUMENT_SERVICE_WORKER_JS_QUEUE_AND_UNWRAPPED_WORK',precision:'COARSENED_UNKNOWN_BROWSER_PRECISION',performanceAcceptance:false};
}
