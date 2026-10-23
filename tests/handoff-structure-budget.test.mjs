// SPDX-License-Identifier: Apache-2.0
// Shareable synthetic metadata reproduces the independent-app representation shape.
// This is codec evidence, not a new browser observation or complete data lineage.
import test from 'node:test';
import assert from 'node:assert/strict';
import {inputReportFixture,hash} from './helpers/input-report-fixture.mjs';
import {actionObservationReportFixture} from './helpers/action-observation-report-fixture.mjs';
import {productionObservationCaptureFixture} from './helpers/production-observation-capture-fixture.mjs';
import {parseDiagnostic} from '../core/diagnostic.mjs';
import {createHandoffDraft} from '../core/handoff-draft.mjs';
import {createHandoffContentReview} from '../core/handoff-content.mjs';
import {createReviewedHandoffReport,redactReviewedHandoff} from '../core/handoff-reviewed.mjs';
import {createHandoffInputOutcomes} from '../core/handoff-input-outcomes.mjs';
import {createHandoffInputEvidence} from '../core/handoff-input-evidence.mjs';
import {composeHandoffInputReport} from '../core/handoff-input-report.mjs';
import {appendHandoffSourceEvidence} from '../core/handoff-source-attachment.mjs';
import {createHandoffActionEvidence} from '../core/handoff-action-evidence.mjs';
import {composeHandoffActionReport} from '../core/handoff-action-report.mjs';
import {createHandoffObservationEvidence} from '../core/handoff-observation-evidence.mjs';
import {composeHandoffObservationReport} from '../core/handoff-observation-report.mjs';
import {parseHandoffReport,readHandoffFile,appendHandoffFinding} from '../core/handoff-files.mjs';
import {readHandoffFile as readLegacy} from '../core/handoff-report.mjs';
import * as budgets from '../core/handoff-json.mjs';

const options=raw=>({expectedParentDigest:hash(raw),now:()=>8000});
async function largeFixture(){
  const trace=structuredClone(actionObservationReportFixture().trace);trace.identity.run='input-run-cedar';
  const f=await inputReportFixture({profile:'minimal',actionTrace:trace});
  const source=JSON.parse(f.diagnosticRaw);source.target.property='text';source.target.value='PRIVATE_TEXT_CEDAR';
  source.runtime.sourceMaps={schema:1,status:'Connected',scripts:Array.from({length:90},(_,i)=>({scriptId:String(i+1),executionContextId:1,frameId:'synthetic-frame',cdpHash:'a'.repeat(64),cdpHashDomain:'v8-script-content-sha256',digest:null,digestDomain:null,map:null})),lookup:null};
  const diagnosticRaw=JSON.stringify(source),developer=JSON.parse(f.developerRaw);developer.target.property='text';developer.target.value=source.target.value;
  assert.equal(parseDiagnostic(diagnosticRaw).runtime.sourceMaps.scripts.length,90);
  const review=await createHandoffContentReview(diagnosticRaw,{separateActionEvidence:true}),projection=review.project({});
  const draft=await createHandoffDraft(diagnosticRaw,{title:'Synthetic mixed metadata',actual:'Recorded text',expected:'Explain this observation'},{now:()=>3000});
  const frozen=await draft.freeze({expectedRevision:0});
  const baseRaw=await createReviewedHandoffReport(diagnosticRaw,JSON.stringify(frozen.baseline),{content:{},separateActionEvidence:true},{now:()=>4000});
  const capture={schema:'stateatom.input-outcome-capture/1',exportable:false,executable:false,capturedAt:2000,diagnosticRaw,outcomes:await createHandoffInputOutcomes(diagnosticRaw,null),limitations:[]};
  return{...f,diagnosticRaw,developerRaw:JSON.stringify(developer),projection,baseRaw,capture};
}
function shape(value){let nodes=0,members=0,entries=0;const stack=[value];while(stack.length){const x=stack.pop();nodes++;if(x&&typeof x==='object'){if(Array.isArray(x))entries+=x.length;else members+=Object.keys(x).length;stack.push(...Object.values(x));}}return{nodes,members,entries};}

test('large mixed reviewed metadata roundtrips every field, join and omission without a simple fallback',async()=>{
  const f=await largeFixture(),parsed=await parseHandoffReport(f.baseRaw),r=parsed.record,s=shape(r);
  assert(s.nodes>10000);assert(s.members<=10000);assert(s.entries<=9999);assert(Buffer.byteLength(f.baseRaw)<1048576);
  assert.equal(r.profile,'reviewed-snapshot/1');assert.equal(parsed.trust,'historical-untrusted');assert.equal(r.report.sourceDiagnostic.digest,hash(f.diagnosticRaw));
  for(const key of['fields','joins','omissions','counts'])assert.deepEqual(r.report.technicalEvidence[key],f.projection[key]);
  assert.deepEqual(r.report.target.value,f.projection.target.value);assert.equal(r.report.target.value.state,'omitted');assert(!f.baseRaw.includes('PRIVATE_TEXT_CEDAR'));
  assert(r.report.technicalEvidence.joins.some(g=>g.kind==='map'&&g.evidenceKind==='Unknown/Unsupported'&&g.state==='unverifiable'));
  const child=await redactReviewedHandoff(f.baseRaw,{omitIssueFields:['actual']},options(f.baseRaw));
  const derived=await parseHandoffReport(child,{parentRaw:f.baseRaw});assert.equal(derived.parentStatus,'content-matched');assert.equal(derived.record.report.issue.actual,null);assert.deepEqual(derived.record.report.technicalEvidence,r.report.technicalEvidence);
});

test('large metadata survives source, input, action, window and note composition with strict exact parents',async()=>{
  const f=await largeFixture();let raw=f.baseRaw;
  const append=async factory=>{const parent=raw;raw=await factory(parent);const p=await parseHandoffReport(raw,{parentRaw:parent});assert.equal(p.parentStatus,'content-matched');assert.deepEqual(p.record.report.technicalEvidence.fields,f.projection.fields);assert.equal(p.record.report.target.value.state,'omitted');assert.equal(p.record.report.sourceDiagnostic.digest,hash(f.diagnosticRaw));await assert.rejects(parseHandoffReport(raw,{parentRaw:parent+' '}),{code:'HANDOFF_PARENT_MISMATCH'});return p.record;};
  await append(parent=>appendHandoffSourceEvidence(parent,f.developerRaw,f.files,{text:'Compared synthetic source bytes'},{...options(parent),includeFiles:[f.file]}));
  const input=await createHandoffInputEvidence(JSON.stringify(f.capture));
  await append(parent=>composeHandoffInputReport(parent,input,options(parent)));
  const action=await createHandoffActionEvidence(f.diagnosticRaw);
  await append(parent=>composeHandoffActionReport(parent,action,options(parent)));
  const window=await productionObservationCaptureFixture({property:'text'});window.inputCapture=f.capture;
  const observation=await createHandoffObservationEvidence(JSON.stringify(window));
  const observed=await append(parent=>composeHandoffObservationReport(parent,observation,options(parent)));
  assert.equal(observed.report.observationWindow.status,'recorded');assert.equal(observed.report.observationWindow.dependency,'unknown');
  const noted=await append(parent=>appendHandoffFinding(parent,{text:'Synthetic note; not fix verification',build:null},options(parent)));
  assert.equal(noted.additions.at(-1).evidenceStatus,'unverified-note');assert.equal((await readHandoffFile(raw)).trust,'historical-untrusted');
});

test('v2 structure budget retains member, flat-array and aggregate nested-array refusals',()=>{
  const check=value=>{budgets.assertUniqueHandoffJSONMembers(JSON.stringify(value));budgets.assertHandoffJSONArrayBudget(value);};
  assert.doesNotThrow(()=>check(Array(9999).fill(null)));
  for(const value of[Array(10000).fill(null),[Array(4999).fill(null),Array(4999).fill(null)],{a:Array(5000).fill(0),b:Array(5000).fill(0)},Object.fromEntries(Array.from({length:10001},(_,i)=>['k'+i,0]))])assert.throws(()=>check(value),{code:'HANDOFF_LIMIT'});
  assert.doesNotThrow(()=>check({a:Array(4998).fill(null),b:Array(4999).fill(null)}));
});

test('all six public JSON decoder paths retain complexity, depth, text, byte and duplicate refusal',async()=>{
  const {actionJSON}=await import('../core/handoff-action-data.mjs'),{observationJSON}=await import('../core/handoff-observation-data.mjs');
  const {parseReviewedHandoffReport}=await import('../core/handoff-reviewed.mjs'),{parseHandoffInputReport}=await import('../core/handoff-input-report.mjs'),{parseHandoffSourceEvidence}=await import('../core/handoff-source-attachment.mjs');
  const parsers=[readLegacy,parseReviewedHandoffReport,parseHandoffInputReport,parseHandoffSourceEvidence,async raw=>actionJSON(raw),async raw=>observationJSON(raw)];
  const limited=[JSON.stringify(Array(10000).fill(null)),JSON.stringify({a:Array(5000).fill(0),b:Array(5000).fill(0)}),JSON.stringify(Object.fromEntries(Array.from({length:10001},(_,i)=>['k'+i,0]))),'['.repeat(18)+'0'+']'.repeat(18),JSON.stringify({text:'x'.repeat(16385)}),' '.repeat(1048577)];
  for(const parse of parsers){for(const raw of limited)await assert.rejects(parse(raw),{code:'HANDOFF_LIMIT'});await assert.rejects(parse('{"x":1,"\\u0078":2}'),{code:'INVALID_HANDOFF_JSON'});}
});

test('legacy v1 read retains its original mixed10000-node guard and raw content behavior',async()=>{
  const f=await inputReportFixture({profile:'minimal'}),source=JSON.parse(f.diagnosticRaw);source.unknownExtension=Array.from({length:5000},()=>({x:0}));
  await assert.rejects(readLegacy(JSON.stringify(source)),{code:'HANDOFF_LIMIT'});
  assert.equal((await readLegacy(f.diagnosticRaw)).record.id,parseDiagnostic(f.diagnosticRaw).id);
});

test('newly supported large reports still refuse forged evidence, duplicate identities and digests',async()=>{
  const f=await largeFixture();
  for(const mutate of[r=>{r.report.target.value.evidenceKind='Code-linked';},r=>{r.report.technicalEvidence.fields[0].id='f0';}]){
    const r=JSON.parse(f.baseRaw);mutate(r);await assert.rejects(parseHandoffReport(JSON.stringify(r)),{code:'INVALID_HANDOFF_REPORT'});
  }
  const corrupt=JSON.parse(f.baseRaw);corrupt.reportDigest='b'.repeat(64);await assert.rejects(parseHandoffReport(JSON.stringify(corrupt)),{code:'HANDOFF_INTEGRITY'});
  await assert.rejects(parseHandoffReport(f.baseRaw.replace('{','{"__proto__":{},')),{code:'INVALID_HANDOFF_REPORT'});
  await assert.rejects(parseHandoffReport(f.baseRaw.replace('{','{"report":{},')),{code:'INVALID_HANDOFF_JSON'});
});
