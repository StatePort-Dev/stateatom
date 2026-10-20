// SPDX-License-Identifier: Apache-2.0
// Unimported composition controls. No installed reporter, browser or acquisition.
import test from 'node:test';
import assert from 'node:assert/strict';
import {inputReportFixture,hash} from './helpers/input-report-fixture.mjs';
import {parseHandoffReport,appendHandoffFinding,redactHandoffFile} from '../core/handoff-files.mjs';
import {appendHandoffSourceEvidence} from '../core/handoff-source-attachment.mjs';
import {createHandoffReport} from '../core/handoff-report.mjs';
import {createHandoffInputEvidence,parseHandoffInputEvidence} from '../core/handoff-input-evidence.mjs';
import {composeHandoffInputReport,parseHandoffInputReport,handoffInputReportComponents,advanceHandoffInputReport,redactHandoffInputReport} from '../core/handoff-input-report.mjs';
const opts=(raw,extra={})=>({expectedParentDigest:hash(raw),now:()=>5000,...extra});
const compose=f=>composeHandoffInputReport(f.baseRaw,f.packetRaw,opts(f.baseRaw));
for(const profile of ['minimal','reviewed','source'])test(`${profile} composition preserves the entire original public component and exact input source`,async()=>{
 const f=await inputReportFixture({profile}),base=(await parseHandoffReport(f.baseRaw)).record,raw=await compose(f),parsed=await parseHandoffInputReport(raw,{parentRaw:f.baseRaw}),r=parsed.record;
 assert.equal(r.schema,'stateatom.diagnostic');assert.equal(r.version,2);assert.equal(r.profile,'input-evidence/1');assert.equal(parsed.trust,'historical-untrusted');assert.equal(parsed.parentStatus,'content-matched');
 assert.notEqual(r.id,base.id);assert.equal(r.revision,base.revision+1);assert.deepEqual(r.report,base.report);assert.deepEqual(r.additions,base.additions);assert.equal(r.reportDigest,base.reportDigest);
 assert.equal(r.lineage.kind,'input-evidence-attachment');assert.equal(r.lineage.parentArtifactDigest,hash(f.baseRaw));assert.equal(r.inputBaseHeader.id,base.id);assert.equal(r.inputBaseHeader.profile,base.profile);assert.deepEqual(r.inputBaseHeader.lineage,base.lineage);
 assert.equal(r.inputEvidence.source.diagnosticDigest,base.report.sourceDiagnostic.digest);assert.equal(r.inputEvidence.projection.transactions[0].effect,'unknown');assert.equal(r.inputPrivacy.omittedPackets,0);
 const components=await handoffInputReportComponents(raw);assert.deepEqual((await parseHandoffReport(components.baseRaw)).record,base);assert.equal(hash(components.baseRaw),r.inputBaseDigest);assert(Object.isFrozen(r.inputEvidence));
 if(profile==='source'){assert.deepEqual(r.sourceEvidence,base.sourceEvidence);assert.equal(r.baseProfile,base.baseProfile);assert.equal(r.sourceEvidence[0].files[0].status,'content-matched');assert.equal(r.additions[0].evidenceStatus,'unverified-note');}
 assert(!raw.includes('diagnosticRaw'));assert(!raw.includes('privateReplyRaw'));assert(!raw.includes('actual local fixture bytes'));
});
test('private capture is never accepted as a public packet or direct diagnostic',async()=>{
 const f=await inputReportFixture();await assert.rejects(composeHandoffInputReport(f.baseRaw,f.privateRaw,opts(f.baseRaw)));await assert.rejects(parseHandoffReport(f.packetRaw));
});
test('a packet from another exact saved diagnostic cannot attach by matching selector or property',async()=>{
 const a=await inputReportFixture(),b=await inputReportFixture();assert.notEqual(JSON.parse(a.packetRaw).source.diagnosticDigest,JSON.parse(b.packetRaw).source.diagnosticDigest);await assert.rejects(composeHandoffInputReport(a.baseRaw,b.packetRaw,opts(a.baseRaw)));
});
test('exact outer parent whitespace differs from the explicitly canonical component digest domain',async()=>{
 const f=await inputReportFixture(),pretty='\n'+JSON.stringify(JSON.parse(f.baseRaw),null,2)+'\n',raw=await composeHandoffInputReport(pretty,f.packetRaw,opts(pretty));const r=(await parseHandoffInputReport(raw,{parentRaw:pretty})).record;
 assert.equal(r.lineage.parentArtifactDigest,hash(pretty));assert.notEqual(r.inputBaseDigest,hash(pretty));await assert.rejects(parseHandoffInputReport(raw,{parentRaw:f.baseRaw}));assert.equal((await parseHandoffInputReport(raw)).parentStatus,'not-checked');
});
test('ordinary unverified developer note advances only the base component while preserving input evidence',async()=>{
 const f=await inputReportFixture(),raw=await compose(f),before=(await parseHandoffInputReport(raw)).record,parts=await handoffInputReportComponents(raw),baseChild=await appendHandoffFinding(parts.baseRaw,{text:'Unverified developer observation',build:f.build},opts(parts.baseRaw));
 const next=await advanceHandoffInputReport(raw,baseChild,opts(raw)),r=(await parseHandoffInputReport(next,{parentRaw:raw})).record;
 assert.equal(r.lineage.parentArtifactDigest,hash(raw));assert.equal(r.lineage.kind,'developer-addition');assert.equal(r.revision,before.revision+1);assert.deepEqual(r.report,before.report);assert.deepEqual(r.inputEvidence,before.inputEvidence);assert.deepEqual(r.inputPrivacy,before.inputPrivacy);
 const note=r.additions.at(-1);assert.equal(note.evidenceStatus,'unverified-note');assert.equal(note.parentArtifactDigest,hash(parts.baseRaw));assert.notEqual(note.parentArtifactDigest,hash(raw));
});
test('existing source comparison creation coexists with input evidence and retains the reporter and prior note',async()=>{
 const f=await inputReportFixture({profile:'source'}),raw=await compose(f),before=(await parseHandoffInputReport(raw)).record,parts=await handoffInputReportComponents(raw);
 const child=await appendHandoffSourceEvidence(parts.baseRaw,f.developerRaw,f.files,{text:'Another local source comparison'},{...opts(parts.baseRaw),includeFiles:[f.file]});
 const next=await advanceHandoffInputReport(raw,child,opts(raw)),r=(await parseHandoffInputReport(next,{parentRaw:raw})).record;
 assert.deepEqual(r.report,before.report);assert.deepEqual(r.inputEvidence,before.inputEvidence);assert.deepEqual(r.additions[0],before.additions[0]);assert.deepEqual(r.sourceEvidence[0],before.sourceEvidence[0]);assert.equal(r.sourceEvidence.length,2);assert.equal(r.inputBaseHeader.profile,'source-evidence/1');
});
test('input-only privacy retains the exact base component and creates one actual packet privacy child',async()=>{
 const f=await inputReportFixture({profile:'source'}),raw=await compose(f),before=(await parseHandoffInputReport(raw)).record;
 const next=await redactHandoffInputReport(raw,{inputReview:{omitCategories:['inputValues']}},opts(raw)),r=(await parseHandoffInputReport(next,{parentRaw:raw})).record;
 assert.deepEqual(r.report,before.report);assert.deepEqual(r.sourceEvidence,before.sourceEvidence);assert.equal(r.inputBaseDigest,before.inputBaseDigest);assert.equal(r.inputEvidence.projection.transactions[0].outcomes[0].value.state,'omitted');assert(!next.includes('PrivateInputCedar'));assert.equal(r.lineage.kind,'privacy-derivative');
});
test('base selection privacy also excludes overlapping input identity/location without changing phases',async()=>{
 const f=await inputReportFixture(),raw=await compose(f),next=await redactHandoffInputReport(raw,{baseReview:{omitCategories:['selectionDetails']}},opts(raw));
 const r=(await parseHandoffInputReport(next,{parentRaw:raw})).record;assert.equal(r.inputEvidence.projection.binding.context.identity.state,'omitted');assert.equal(r.inputEvidence.projection.binding.context.location.state,'omitted');assert.equal(r.inputEvidence.projection.transactions[0].phase,'applied');
 assert(r.inputEvidence.privacy.excludedCategories.includes('inputIdentities'));assert(r.inputEvidence.privacy.excludedCategories.includes('inputLocations'));
});
test('whole input omission is explicit, keeps notes/source packets, and cannot restore a hidden packet',async()=>{
 const f=await inputReportFixture({profile:'source'}),raw=await compose(f),before=(await parseHandoffInputReport(raw)).record,next=await redactHandoffInputReport(raw,{omitInputEvidence:true},opts(raw)),r=(await parseHandoffInputReport(next,{parentRaw:raw})).record;
 assert.equal(r.inputEvidence,null);assert.equal(r.inputPrivacy.omittedPackets,1);assert.deepEqual(r.sourceEvidence,before.sourceEvidence);assert.deepEqual(r.additions,before.additions);assert.equal((await handoffInputReportComponents(next)).inputEvidenceRaw,null);
 await assert.rejects(composeHandoffInputReport(next,f.packetRaw,opts(next)));
});
test('minimal privacy never silently discards retained notes without explicit all-note omission',async()=>{
 const f=await inputReportFixture({profile:'minimal'}),base=await appendHandoffFinding(f.baseRaw,{text:'Keep unless explicitly omitted'},opts(f.baseRaw));f.baseRaw=base;
 const raw=await compose(f);await assert.rejects(redactHandoffInputReport(raw,{baseReview:{omitIssueFields:['actual']}},opts(raw)));
 const old=(await parseHandoffInputReport(raw)).record,next=await redactHandoffInputReport(raw,{baseReview:{omitIssueFields:['actual'],omitNotes:old.additions.map(n=>n.id)}},opts(raw)),r=(await parseHandoffInputReport(next,{parentRaw:raw})).record;
 assert.equal(r.report.issue.actual,null);assert.equal(r.additions.length,0);assert.equal(r.privacy.omittedDeveloperFindings,1);assert.equal(r.report.issue.expected,'Enabled');
});
test('stale parent and malicious review objects refuse without getters or external effects',async()=>{
 const f=await inputReportFixture(),raw=await compose(f);await assert.rejects(redactHandoffInputReport(raw,{omitInputEvidence:true},{expectedParentDigest:'0'.repeat(64)}));
 let reads=0;await assert.rejects(redactHandoffInputReport(raw,{get inputReview(){reads++;return {}; }},opts(raw)));assert.equal(reads,0);
 for(const bad of ['{}','{bad',' '.repeat(1048577)])await assert.rejects(parseHandoffInputReport(bad));
});
function canonical(x){return JSON.stringify(function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}(x));}
function packetChange(raw,mutate){const p=JSON.parse(raw);mutate(p);p.evidenceDigest=hash(canonical({source:p.source,acquisition:p.acquisition,projection:p.projection,privacy:p.privacy}));return canonical(p);}
for(const [name,mutate] of [
 ['sample hash',p=>{p.source.sampleHash='b'.repeat(64);}],
 ['original selected value',p=>{p.projection.selectedObservation.value.value=false;}],
 ['original selected time',p=>{p.source.capturedAt++;p.projection.selectedObservation.observedAt++;}],
 ['selected property',p=>{p.projection.selectedObservation.property='text';p.projection.selectedObservation.value.value='true';p.projection.editorObservation.value.value='false';}]
])test(`a plausible rehashed packet with different ${name} cannot borrow the base source`,async()=>{
 const f=await inputReportFixture(),changed=packetChange(f.packetRaw,mutate);assert.equal((await parseHandoffInputEvidence(changed)).trust,'historical-untrusted');await assert.rejects(composeHandoffInputReport(f.baseRaw,changed,opts(f.baseRaw)),{code:'HANDOFF_SOURCE_MISMATCH'});
});
test('composition respects an explicit privacy omission already recorded in a legacy base',async()=>{
 const f=await inputReportFixture(),base=JSON.parse(f.baseRaw),selector=base.report.technicalEvidence.fields.find(x=>x.sourcePointer==='/target/selector');assert(selector);
 f.baseRaw=await redactHandoffFile(f.baseRaw,{omitFields:[selector.id]},opts(f.baseRaw));const raw=await compose(f),r=(await parseHandoffInputReport(raw,{parentRaw:f.baseRaw})).record;
 assert.equal(r.inputEvidence.projection.binding.context.location.state,'omitted');assert.equal(r.inputEvidence.projection.binding.context.identity.state,'omitted');
});
test('a post-edit disabled observation stays boolean across the packet/report boundary',async()=>{
 const f=await inputReportFixture(),c=JSON.parse(f.privateRaw);c.outcomes.editorObservation.value={state:'included',value:3};await assert.rejects(async()=>composeHandoffInputReport(f.baseRaw,await createHandoffInputEvidence(JSON.stringify(c),{includeCategories:['inputValues']}),opts(f.baseRaw)));
});
test('empty base review on an input-only privacy copy preserves minimal notes instead of dropping them',async()=>{
 const f=await inputReportFixture({profile:'minimal'});f.baseRaw=await appendHandoffFinding(f.baseRaw,{text:'Retain this note'},opts(f.baseRaw));const raw=await compose(f),next=await redactHandoffInputReport(raw,{baseReview:{omitIssueFields:[],omitNotes:[]},inputReview:{omitCategories:['inputErrors']}},opts(raw));
 const r=(await parseHandoffInputReport(next,{parentRaw:raw})).record;assert.equal(r.additions.length,1);assert.equal(r.additions[0].text,'Retain this note');assert.equal(r.privacy.omittedDeveloperFindings,0);
});
test('input privacy choices cannot silently deduplicate malformed user lists while merging automatic omissions',async()=>{
 const f=await inputReportFixture(),raw=await compose(f);for(const inputReview of [{omitCategories:['inputValues','inputValues']},{omitFields:['/source/run','/source/run']}])await assert.rejects(redactHandoffInputReport(raw,{inputReview},opts(raw)));
});
test('rehashed developer additions cannot rewrite earlier input acknowledgements',async()=>{
 const f=await inputReportFixture(),raw=await compose(f),parts=await handoffInputReportComponents(raw),childBase=await appendHandoffFinding(parts.baseRaw,{text:'New unverified note'},opts(parts.baseRaw)),child=await advanceHandoffInputReport(raw,childBase,opts(raw)),r=JSON.parse(child);
 r.inputEvidence=JSON.parse(packetChange(canonical(r.inputEvidence),p=>{p.projection.transactions[0].outcomes[0].value.value='Rewritten historical input';p.projection.transactions[0].outcomes[0].after.value.value='Rewritten historical input';}));r.inputEvidenceDigest=hash(canonical({inputEvidence:r.inputEvidence,inputPrivacy:r.inputPrivacy}));const forged=canonical(r);
 assert.equal((await parseHandoffInputReport(forged)).trust,'historical-untrusted');await assert.rejects(parseHandoffInputReport(forged,{parentRaw:raw}));
});
test('rehashed privacy copy cannot retain a context removed from the base component',async()=>{
 const f=await inputReportFixture(),raw=await compose(f),parent=JSON.parse(raw),selector=parent.report.technicalEvidence.fields.find(f=>f.sourcePointer==='/target/selector');
 const child=await redactHandoffInputReport(raw,{baseReview:{omitFields:[selector.id]}},opts(raw)),r=JSON.parse(child);await parseHandoffInputReport(child,{parentRaw:raw});r.inputEvidence=parent.inputEvidence;r.inputEvidenceDigest=hash(canonical({inputEvidence:r.inputEvidence,inputPrivacy:r.inputPrivacy}));await assert.rejects(parseHandoffInputReport(canonical(r)));
});
test('source-note omission keeps its explicit packet count and leaves unrelated input evidence unchanged',async()=>{
 const f=await inputReportFixture({profile:'source'}),raw=await compose(f),before=JSON.parse(raw),next=await redactHandoffInputReport(raw,{baseReview:{omitNotes:[before.additions[0].id]}},opts(raw)),r=(await parseHandoffInputReport(next,{parentRaw:raw})).record;
 assert.equal(r.additions.length,0);assert.equal(r.sourceEvidence.length,0);assert.equal(r.evidencePrivacy.omittedAttachments,1);assert.deepEqual(r.inputEvidence,before.inputEvidence);assert.equal(r.report.issue.expected,'Enabled');
});
test('after whole-input omission a later Developer note cannot restore the packet',async()=>{
 const f=await inputReportFixture(),raw=await compose(f),omitted=await redactHandoffInputReport(raw,{omitInputEvidence:true},opts(raw)),parts=await handoffInputReportComponents(omitted),child=await appendHandoffFinding(parts.baseRaw,{text:'A note after input omission'},opts(parts.baseRaw)),next=await advanceHandoffInputReport(omitted,child,opts(omitted)),r=(await parseHandoffInputReport(next,{parentRaw:omitted})).record;
 assert.equal(r.inputEvidence,null);assert.equal(r.inputPrivacy.omittedPackets,1);assert.equal(r.additions.at(-1).text,'A note after input omission');
});
test('privacy review and clock are captured before await and no packet URLs are resolved',async()=>{
 const f=await inputReportFixture(),raw=await compose(f),review={baseReview:{omitCategories:['selectionDetails']},inputReview:{omitCategories:['inputErrors']}};let clocks=0,calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;throw Error('No network allowed');};
 try{const pending=redactHandoffInputReport(raw,review,opts(raw,{now:()=>{clocks++;return 5000;}}));review.baseReview.omitCategories.length=0;review.inputReview.omitCategories[0]='inputValues';const r=(await parseHandoffInputReport(await pending,{parentRaw:raw})).record;assert.equal(clocks,1);assert.equal(calls,0);assert(r.inputEvidence.privacy.excludedCategories.includes('inputErrors'));assert(r.inputEvidence.privacy.excludedCategories.includes('inputIdentities'));assert(!r.inputEvidence.privacy.excludedCategories.includes('inputValues'));}finally{globalThis.fetch=old;}
});
test('two individually valid public components cannot exceed the unchanged whole-file budget',async()=>{
 const f=await inputReportFixture({large:true});await parseHandoffReport(f.baseRaw);await parseHandoffInputEvidence(f.packetRaw);assert(Buffer.byteLength(f.baseRaw)<1048576);assert(Buffer.byteLength(f.packetRaw)<1048576);assert(Buffer.byteLength(f.baseRaw)+Buffer.byteLength(f.packetRaw)>1048576);
 await assert.rejects(compose(f),{code:'HANDOFF_LIMIT'});const minimal=await createHandoffReport(f.diagnosticRaw,f.baselineRaw,{},{now:()=>5000}),next=await composeHandoffInputReport(minimal,f.packetRaw,opts(minimal));const r=(await parseHandoffInputReport(next,{parentRaw:minimal})).record;assert.equal(r.inputBaseHeader.profile,'minimal-snapshot/1');assert.equal(r.inputEvidence.projection.transactions.length,64);assert.equal(r.report.issue.expected,'Enabled');assert.equal(r.report.sourceDiagnostic.digest,JSON.parse(f.baseRaw).report.sourceDiagnostic.digest);
});
test('maximum safe whole-file revision refuses another derivative without changing either component',async()=>{
 const f=await inputReportFixture(),raw=await compose(f),r=JSON.parse(raw);r.revision=Number.MAX_SAFE_INTEGER;r.lineage={kind:'privacy-derivative',parentArtifactDigest:'a'.repeat(64),parentReportDigest:r.reportDigest};const max=canonical(r);assert.equal((await parseHandoffInputReport(max)).trust,'historical-untrusted');
 await assert.rejects(redactHandoffInputReport(max,{omitInputEvidence:true},opts(max)),{code:'HANDOFF_LIMIT'});const after=(await parseHandoffInputReport(max)).record;assert.equal(after.revision,Number.MAX_SAFE_INTEGER);assert.deepEqual(after.inputEvidence,r.inputEvidence);assert.deepEqual(after.report,r.report);
});
test('parallel privacy forks have independent IDs and retain the same exact immutable parent',async()=>{
 const f=await inputReportFixture(),raw=await compose(f),[a,b]=await Promise.all([redactHandoffInputReport(raw,{inputReview:{omitCategories:['inputValues']}},opts(raw)),redactHandoffInputReport(raw,{inputReview:{omitCategories:['inputErrors']}},opts(raw))]);
 const left=(await parseHandoffInputReport(a,{parentRaw:raw})).record,right=(await parseHandoffInputReport(b,{parentRaw:raw})).record;assert.notEqual(left.id,right.id);assert.equal(left.lineage.parentArtifactDigest,hash(raw));assert.equal(right.lineage.parentArtifactDigest,hash(raw));assert.equal(left.inputBaseDigest,right.inputBaseDigest);assert(!JSON.stringify(left.inputEvidence).includes('PrivateInputCedar'));assert(JSON.stringify(right.inputEvidence).includes('PrivateInputCedar'));
});
