// SPDX-License-Identifier: Apache-2.0
// Synthetic passive dispatch/persistence. Not native acquisition or H05 proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {inputReportFixture,hash} from './helpers/input-report-fixture.mjs';
import {composeHandoffInputReport} from '../core/handoff-input-report.mjs';
import * as files from '../core/handoff-files.mjs';
import {createHandoffStore} from '../core/handoff-store.mjs';
const opts=raw=>({expectedParentDigest:hash(raw),now:()=>6000});
async function fixture(profile='reviewed') {const f=await inputReportFixture({profile});return {...f,raw:'\n'+await composeHandoffInputReport(f.baseRaw,f.packetRaw,opts(f.baseRaw))+'\n'};}
for(const profile of ['minimal','reviewed','source'])test(profile+' input dispatch/store preserves exact bytes and entire input packet on an ordinary note',async()=>{
 const f=await fixture(profile),parsed=await files.readHandoffFile(f.raw);assert.equal(parsed.version,2);assert.equal(parsed.record.profile,'input-evidence/1');
 let disk=null;const adapter={read:async()=>disk,write:async x=>disk=x,now:()=>7000},s=createHandoffStore(adapter);
 await s.save(f.raw);assert.equal((await createHandoffStore(adapter).open(parsed.record.id)).raw,f.raw);
 const child=await files.appendHandoffFinding(f.raw,{text:'Ordinary inert developer note',build:f.build},opts(f.raw)),r=await files.parseHandoffReport(child,{parentRaw:f.raw});
 assert.equal(r.parentStatus,'content-matched');assert.deepEqual(r.record.inputEvidence,parsed.record.inputEvidence);assert.deepEqual(r.record.report,parsed.record.report);assert.equal(r.record.additions.at(-1).evidenceStatus,'unverified-note');
 await s.save(child);assert.equal((await s.open(r.record.id)).parentStatus,'content-matched');
 const before=disk;await assert.rejects(s.save(f.raw+' '),{code:'HANDOFF_ID_CONFLICT'});assert.equal(disk,before);
});
test('dispatcher privacy has separate component/input choices and exact whole-file parent',async()=>{
 const f=await fixture('source'),r=(await files.parseHandoffReport(f.raw)).record;
 const child=await files.redactHandoffFile(f.raw,{inputReview:{omitCategories:['inputValues']}},opts(f.raw)),p=await files.parseHandoffReport(child,{parentRaw:f.raw});
 assert.equal(p.parentStatus,'content-matched');assert.deepEqual(p.record.sourceEvidence,r.sourceEvidence);assert(!child.includes('PrivateInputCedar'));assert.equal(p.record.lineage.parentArtifactDigest,hash(f.raw));
 await assert.rejects(files.appendHandoffFinding(f.raw,{text:'stale'},{expectedParentDigest:'0'.repeat(64)}),{code:'STALE_HANDOFF_PARENT'});
});
test('public source dispatch snapshots mutable buffers, note and consent before its first asynchronous hash',async()=>{
 const f=await fixture(),prior=(await files.parseHandoffReport(f.raw)).record,finding={text:'Before hash note'},options={...opts(f.raw),includeFiles:[f.file]},sourceFiles=f.files;
 const promise=files.appendHandoffSourceFinding(f.raw,f.developerRaw,sourceFiles,finding,options);
 new Uint8Array(sourceFiles[0].bytes).fill(88);finding.text='After hash note';options.includeFiles.length=0;sourceFiles.length=0;
 const child=await promise,r=(await files.parseHandoffReport(child,{parentRaw:f.raw})).record;assert.equal(r.additions.at(-1).text,'Before hash note');assert.equal(r.sourceEvidence[0].files[0].status,'content-matched');assert.deepEqual(r.inputEvidence,prior.inputEvidence);assert.equal(r.lineage.parentArtifactDigest,hash(f.raw));
});
test('public note dispatch snapshots finding and a single host clock before async work',async()=>{
 const f=await fixture(),finding={text:'Before note hash'};let calls=0;const options={expectedParentDigest:hash(f.raw),now:()=>{calls++;return 8000;}};
 const promise=files.appendHandoffFinding(f.raw,finding,options);finding.text='After note hash';options.expectedParentDigest='0'.repeat(64);const child=await promise,r=(await files.parseHandoffReport(child,{parentRaw:f.raw})).record;
 assert.equal(calls,1);assert.equal(r.additions.at(-1).text,'Before note hash');
});
