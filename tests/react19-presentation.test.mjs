// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {inspectionView} from '../browser-extension/inspection-view.mjs';
import {makeDiagnostic,serializeDiagnostic,parseDiagnostic} from '../core/diagnostic.mjs';
import {createHandoffContentReview} from '../core/handoff-content.mjs';
function state(){
 const page='page-one',id=name=>page+':react19:'+name,ancestors=[{hookId:id('1'),fiberId:id('2'),queueId:id('3'),dispatchId:id('4'),resultId:id('5'),revisionId:id('revision:6'),updateId:null,updateOriginStatus:'Unknown/Unsupported',publicHookKind:'Unknown/Unsupported'}];
 return{attached:true,selection:{selector:'#title',tag:'label',property:'text',value:'Equal title',page,observedAt:100},analysis:{capabilities:{sourceResolver:'open-ide'},sources:[],stateatom:{runtime:{schema:1,page,status:'Unknown/Unsupported',target:null,nodes:[],nativeStateAncestors:{schema:1,page,status:'Observed',nodeId:id('7'),rootId:id('8'),commitId:id('commit:1'),ancestors,fullPath:false,consumerOracle:false,selectedPropertyOrigin:'Unknown/Unsupported',stateToProp:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported'}}}}};
}
test('compact independent ancestor view does not require or promote a selected-property producer',()=>{
 const s=state(),v=inspectionView(s);assert.equal(v.runtimeStatus,'Unknown/Unsupported');assert.equal(v.commit.status,'Unknown/Unsupported');assert.deepEqual(v.operands,[]);
 assert.equal(v.nativeStateAncestors.status,'Observed');assert.equal(v.nativeStateAncestors.count,1);assert.equal(v.nativeStateAncestors.updateOrigins,0);
 assert.match(v.nativeStateAncestors.summary,/1 native React state ancestor/);assert.match(v.nativeStateAncestors.summary,/selected.property origin.*unknown/i);
 assert.doesNotMatch(v.nativeStateAncestors.summary,/page-one|react19:|revision:|queueId|useReducer|useState/);
 s.analysis.stateatom.runtime.nativeStateAncestors.ancestors[0].updateId='page-one:react19:9';s.analysis.stateatom.runtime.nativeStateAncestors.ancestors[0].updateOriginStatus='Observed';assert.equal(inspectionView(s).nativeStateAncestors.updateOrigins,1);
});
for(const [name,change]of[
 ['Basic',s=>s.analysis.capabilities.sourceResolver='unavailable'],['foreign page',s=>s.analysis.stateatom.runtime.nativeStateAncestors.page='foreign'],['runtime page',s=>s.analysis.stateatom.runtime.page='foreign'],
 ['missing page',s=>s.selection.page=null],['new target pending',s=>s.picker={status:'picking'}],['stale',s=>s.stale={reason:'changed'}],['runtime stale',s=>s.analysis.stateatom.runtime.status='Stale'],
 ['producer promotion',s=>s.analysis.stateatom.runtime.nativeStateAncestors.selectedPropertyOrigin='Observed'],['full-path promotion',s=>s.analysis.stateatom.runtime.nativeStateAncestors.fullPath=true],['oracle',s=>s.analysis.stateatom.runtime.nativeStateAncestors.consumerOracle=true],
 ['claimed public hook',s=>s.analysis.stateatom.runtime.nativeStateAncestors.ancestors[0].publicHookKind='useReducer'],['duplicate hook',s=>s.analysis.stateatom.runtime.nativeStateAncestors.ancestors.push({...s.analysis.stateatom.runtime.nativeStateAncestors.ancestors[0]})],['empty witness',s=>s.analysis.stateatom.runtime.nativeStateAncestors.ancestors=[]],['foreign row',s=>s.analysis.stateatom.runtime.nativeStateAncestors.ancestors[0].resultId='another-page:react19:5'],['malformed rows',s=>s.analysis.stateatom.runtime.nativeStateAncestors.ancestors={}],['over budget',s=>s.analysis.stateatom.runtime.nativeStateAncestors.ancestors=Array(65).fill(s.analysis.stateatom.runtime.nativeStateAncestors.ancestors[0])]
])test(name+' cannot display a positive native ancestor observation',()=>{const s=state();change(s);assert.notEqual(inspectionView(s).nativeStateAncestors?.status,'Observed');});
test('legacy snapshots do not gain an empty React19 card',()=>{const s=state();delete s.analysis.stateatom.runtime.nativeStateAncestors;assert.equal(inspectionView(s).nativeStateAncestors,null);});
test('saved v1 diagnostic explicitly omits independent ancestor identities without changing evidence kind or schema',async()=>{
 const s=state(),report=makeDiagnostic(s),raw=serializeDiagnostic(report),parsed=parseDiagnostic(raw);
 assert.equal(parsed.version,1);assert.equal(parsed.runtime.status,'Unknown/Unsupported');assert.equal(parsed.runtime.nativeStateAncestors,undefined);
 assert(parsed.limitations.some(x=>/React19 native ancestor observations.*omitted.*v1/i.test(x)));
 assert.doesNotMatch(raw,/page-one:react19:/);
 const review=await createHandoffContentReview(raw),limits=review.catalogue().fields.filter(f=>f.sourcePointer.startsWith('/limitations/'));
 assert(limits.some(f=>/React19 native ancestor observations.*omitted.*v1/i.test(f.preview.value)));
});
