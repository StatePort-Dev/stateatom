// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {summarizeWorkerAPIPhases} from '../helpers/worker-api-phase-summary.mjs';
const fixture=()=>({tag:'trial',tabId:9,limit:2048,clock:{timeOrigin:1000,crossOriginIsolated:false},overflow:false,inflight:0,unsupported:false,rows:[
 {ordinal:0,api:'storage.session.set',method:null,startMs:0,endMs:3,durationMs:3,ok:true,supported:true},
 {ordinal:1,api:'tabs.get',method:null,startMs:5,endMs:15,durationMs:10,ok:true,supported:true},
 {ordinal:2,api:'permissions.contains',method:null,startMs:12,endMs:22,durationMs:10,ok:true,supported:true},
 {ordinal:3,api:'tabs.get',method:null,startMs:20,endMs:35,durationMs:15,ok:true,supported:true}
]});
const apply={op:'inputs-apply',startMs:110,endMs:130,durationMs:20,ok:true};
const summarize=s=>summarizeWorkerAPIPhases(s,apply,{inspectorOrigin:900,tabId:9});
test('worker origin translation clips and unions overlapping APIs without summing them',()=>{
 const s=summarize(fixture());assert.equal(s.clockTranslationMs,100);assert.equal(s.applyMs,20);assert.equal(s.windowRows,4);assert.equal(s.intersectingRows,3);assert.equal(s.apiUnionMs,20);assert.equal(s.uncoveredMs,0);assert.deepEqual(s.apis['tabs.get'],{scope:'selected-tab',rows:2,intersectingRows:2,unionMs:15});assert.deepEqual(s.apis['permissions.contains'],{scope:'worker-wide',rows:1,intersectingRows:1,unionMs:10});assert.equal(s.apis['storage.session.set'].unionMs,0);
});
test('gaps remain uncovered and wholly external API intervals do not supply Apply cost',()=>{
 const f=fixture();f.rows.splice(2);const s=summarize(f);assert.equal(s.apiUnionMs,5);assert.equal(s.uncoveredMs,15);assert.equal(s.intersectingRows,1);assert.equal(s.apis['storage.session.set'].rows,1);
});
test('settled internal API rejections retain occupied time and explicit failure count',()=>{
 const f=fixture();f.rows[1].ok=false;const s=summarize(f);assert.equal(s.apiUnionMs,20);assert.equal(s.rejectedRowsInWholeWindow,1);assert.equal(s.requestAttribution,'UNKNOWN_CONCURRENT_STATE_INCLUDED');assert.equal(s.performanceAcceptance,false);
});
test('unknown clocks, target, shape, duration, cap, pending, unsupported and reordered rows refuse',()=>{
 const mutations=[x=>x.clock.timeOrigin=NaN,x=>x.tabId=99,x=>x.rows[0].value='private',x=>x.rows[0].durationMs++,x=>x.overflow=true,x=>x.inflight=1,x=>x.unsupported=true,x=>x.rows[0].ok=null,x=>x.rows[0].supported=false,x=>x.rows[0].api='private',x=>x.rows[0].method='private',x=>x.rows[0].ordinal=9,x=>x.rows=[],x=>x.limit=0,x=>[x.rows[0],x.rows[1]]=[x.rows[1],x.rows[0]]];for(const mutate of mutations){const f=fixture();mutate(f);assert.throws(()=>summarize(f));}assert.throws(()=>summarizeWorkerAPIPhases(fixture(),apply,{inspectorOrigin:NaN,tabId:9}));assert.throws(()=>summarizeWorkerAPIPhases(fixture(),{...apply,durationMs:21},{inspectorOrigin:900,tabId:9}));
});
