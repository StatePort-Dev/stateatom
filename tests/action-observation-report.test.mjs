// SPDX-License-Identifier: Apache-2.0
// Synthetic ledger records test the passive codec, not native Event acquisition.
import test from 'node:test';import assert from 'node:assert/strict';
import{makeDiagnostic,parseDiagnostic,serializeDiagnostic,omitDiagnosticContent}from'../core/diagnostic.mjs';
import{createHandoffContentReview}from'../core/handoff-content.mjs';
import{actionObservationReportFixture as fixture}from'./helpers/action-observation-report-fixture.mjs';

test('diagnostic retains bounded historical invocation independently of selected property and source declaration',()=>{
 const f=fixture(),r=makeDiagnostic(f.state),a=r.runtime.actionObservation;assert(a,'observed body must survive save');
 assert.equal(a.kind,'historical-action-observation');assert.equal(a.freshness,'Recorded');assert.equal(a.lastReadAt,1234);assert.equal(a.identity.run,'recorded-run');assert.equal(r.identity.run,'other-run');
 assert.equal(a.records[1].source.symbol,'save');assert.equal(a.records[2].completion,'return');assert.equal(a.sourceAtLastRead,'Code-linked');assert.equal(a.sourceCurrent,false);assert.equal(a.executable,false);assert.equal(a.runtimeFunctionObjectIdentity,'Unavailable');assert.equal(a.asyncEffects,'Unlinked');assert.match(a.scope,/not.*selected property/i);assert.match(a.trust,/historical.*untrusted/i);
 assert.equal(r.runtime.actionBindings[0].execution.status,'not-observed');assert.deepEqual(parseDiagnostic(serializeDiagnostic(r)).runtime.actionObservation,a);
});
for(const status of ['armed','collecting','partial','stale','stopped','cancelled'])test(`saved ${status} remains an inert scoped record`,()=>{
 const f=fixture(status),a=makeDiagnostic(f.state).runtime.actionObservation;assert(a);assert.equal(a.status,status);assert.equal(a.executable,false);assert.equal(a.sourceCurrent,false);
 if(['stale','stopped'].includes(status)){assert.equal(a.freshness,'Stale');assert.equal(a.sourceAtLastRead,'Unknown/Unsupported');}if(status==='armed')assert.equal(a.records.length,0);
});
test('Clear and legacy absence do not manufacture an observation or change old raw bytes',()=>{
 const f=fixture('cleared');assert.equal(makeDiagnostic(f.state).runtime.actionObservation,undefined);delete f.state.actionTrace;const r=makeDiagnostic(f.state),raw=JSON.stringify(r);assert.equal(parseDiagnostic(raw).runtime.actionObservation,undefined);assert.equal(serializeDiagnostic(r),raw);
});
test('bounded report excludes extra arguments, credentials, object IDs and action authority',()=>{
 const f=fixture();Object.assign(f.trace,{ownerId:'PRIVATE_OWNER',token:'PRIVATE_CREDENTIAL',objectId:'PRIVATE_OBJECT',grant:'replay'});Object.assign(f.trace.records[1],{arguments:['PRIVATE_ARGUMENT'],value:'PRIVATE_VALUE'});
 const r=makeDiagnostic(f.state,{includeContent:true}),raw=serializeDiagnostic(r);assert(r.runtime.actionObservation);assert(!raw.includes('PRIVATE_'));assert.deepEqual(omitDiagnosticContent(r).runtime.actionObservation,r.runtime.actionObservation);
});
test('import refuses malformed or promoted observation claims while preserving valid original',()=>{
 const r=makeDiagnostic(fixture().state),original=serializeDiagnostic(r);assert(r.runtime.actionObservation);
 for(const mutate of [a=>a.records[2].activationId='orphan',a=>a.records[1].source.file='../secret.js',a=>a.identity.page='',a=>a.sourceCurrent=true,a=>a.executable=true,a=>a.grant='replay',a=>a.records.push(a.records[0])]){const bad=JSON.parse(original);mutate(bad.runtime.actionObservation);assert.throws(()=>parseDiagnostic(JSON.stringify(bad)),/action|observation|context|bounded/i);}
 assert.equal(serializeDiagnostic(r),original);
});
test('new trace codec never reads input accessors or serialization hooks',()=>{
 const f=fixture();f.trace.records[1].source={...f.trace.records[1].source};let reads=0;Object.defineProperty(f.trace.records[1].source,'symbol',{enumerable:true,get(){reads++;return'save';}});
 assert.throws(()=>makeDiagnostic(f.state),/action|observation|data|accessor/i);assert.equal(reads,0);
});
test('closed reviewed profile refuses silently discarding new execution evidence',async()=>{
 const r=makeDiagnostic(fixture().state);assert(r.runtime.actionObservation);await assert.rejects(createHandoffContentReview(serializeDiagnostic(r)),{code:'UNSUPPORTED_HANDOFF_EVIDENCE'});
});

test('unknown serialization getters and payloads are excluded without execution',()=>{
 const f=fixture();let reads=0;Object.defineProperty(f.trace,'toJSON',{get(){reads++;throw Error('Must not run');}});Object.defineProperty(f.trace.records[1].source={...f.trace.records[1].source},'toJSON',{get(){reads++;throw Error('Must not run');}});
 const r=makeDiagnostic(f.state);assert(r.runtime.actionObservation);assert.equal(reads,0);
});
test('public codec rejects accessor-backed nested data without invoking it',async()=>{
 const {parseActionObservationReport}=await import('../core/action-observation-report.mjs'),r=makeDiagnostic(fixture().state).runtime.actionObservation;let reads=0;Object.defineProperty(r.records[1],'arguments',{enumerable:true,get(){reads++;throw Error('Must not run');}});
 assert.throws(()=>parseActionObservationReport(r),/action observation/i);assert.equal(reads,0);
});
