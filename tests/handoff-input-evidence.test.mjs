// SPDX-License-Identifier: Apache-2.0
// Synthetic real-ledger projections, not native capture or installed handoff proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inputOutcomeFixture} from './helpers/input-outcome-fixture.mjs';
import {createHandoffInputOutcomes} from '../core/handoff-input-outcomes.mjs';
import {filterHandoffReviewValue} from '../core/handoff-content.mjs';
import {createHandoffInputEvidence,parseHandoffInputEvidence,redactHandoffInputEvidence} from '../core/handoff-input-evidence.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const all=['inputIdentities','inputValues','inputLocations','inputErrors'];
async function fixture({sourceKind='dom-control',captureKind='editor-snapshot',apply=true,applyStatus='applied',privateValue='PrivateInputCedar'}={}){
 const f=inputOutcomeFixture({sourceKind,privateValue});if(apply)f.apply(applyStatus);let capture=f.capture();
 if(captureKind==='none')capture=null;
 if(captureKind==='runtime-summary'){const s=capture.snapshot;capture={...capture,kind:captureKind,selectionContext:null,investigationContext:null,snapshot:{sourceKind,investigationId:s.investigationId,target:s.target,revision:s.revision,closed:true,closeReason:'Worker restart',cleanup:'unknown',status:'Stale',executable:false,resources:[],history:s.history.map(t=>({id:t.id,kind:t.kind,phase:t.phase,outcomeCount:t.outcomes.length})),details:'Retained compact summary'}};}
 const outcomes=await createHandoffInputOutcomes(f.raw,capture,{includeCategories:all});
 const raw=JSON.stringify({schema:'stateatom.input-outcome-capture/1',exportable:false,executable:false,capturedAt:2000,diagnosticRaw:f.raw,outcomes,limitations:['Atomic acquisition of stored runtime/editor data only; no new DOM, permission or execution observation.','Not a public file, saved report, replay, causal dependency, successful fix or application restoration attestation.']});
 return {...f,raw,outcomes,capture};
}
const create=(f,review={})=>createHandoffInputEvidence(f.raw,review,{now:()=>3000});
test('default packet omits private categories even when the private capture includes every category',async()=>{
 const f=await fixture(),raw=await create(f),r=(await parseHandoffInputEvidence(raw)).record;
 assert.equal(r.schema,'stateatom.input-evidence/1');assert.equal(r.trust,'historical-untrusted');assert.equal(r.kind,'historical-input-outcomes');
 assert.equal(r.source.diagnosticDigest,hash(f.raw?JSON.parse(f.raw).diagnosticRaw:''));assert.equal(r.acquisition.privateReplyDigest,hash(f.raw));
 assert.deepEqual(r.privacy.excludedCategories,all);assert.equal(r.projection.transactions[0].phase,'applied');assert.equal(r.projection.transactions[0].outcomes[0].value.state,'omitted');
 for(const secret of ['PrivateInputCedar','PrivateControlCedar','input-document-cedar','input-investigation-cedar','diagnosticRaw','requiredGrants','canUndo','"rule":','"snapshot":{"resources"'])assert(!raw.includes(secret),secret);
 assert(Object.isFrozen(r.projection.transactions));assert.equal(r.projection.binding.visibleJoin,'unverifiable-omitted-or-filtered-context');
});
test('explicit review retains native ACK and separate selected/editor observations without a global verified claim',async()=>{
 const f=await fixture(),r=(await parseHandoffInputEvidence(await create(f,{includeCategories:all}))).record;
 assert.equal(r.projection.selectedObservation.value.value,true);assert.equal(r.projection.editorObservation.value.value,false);
 assert.equal(r.projection.selectedObservation.observedAt,1000);assert.equal(r.projection.editorObservation.observedAt,1500);
 const tx=r.projection.transactions[0];assert.equal(tx.outcomes[0].after.value.value,'PrivateInputCedar');assert.equal(tx.effect,'unknown');assert.equal(tx.applicationRestored,false);assert.equal(tx.recordedAt,null);
 assert.equal(r.projection.snapshot.inputBuild,null);assert.equal(r.source.sampleHash,'a'.repeat(64));assert(!JSON.stringify(r).includes('Experimentally verified'));
});
test('per-field review removes only the chosen optional envelope and preserves typed failure metadata',async()=>{
 const f=await fixture(),raw=await create(f,{includeCategories:all,omitFields:['/projection/transactions/0/outcomes/0/value']});
 const r=(await parseHandoffInputEvidence(raw)).record;
 assert.equal(r.projection.transactions[0].outcomes[0].value.state,'omitted');
 assert.equal(r.projection.transactions[0].outcomes[0].after.value.value,'PrivateInputCedar');assert.equal(r.projection.transactions[0].outcomeCount,1);
 await assert.rejects(create(f,{includeCategories:all,omitFields:['/projection/transactions/0/phase']}));
});
for(const captureKind of ['none','runtime-summary'])test(`${captureKind} stays explicitly incomplete rather than zero edits or joined history`,async()=>{
 const f=await fixture({captureKind}),r=(await parseHandoffInputEvidence(await create(f))).record;
 assert.equal(r.projection.binding.status,captureKind==='none'?'not-recorded':'unjoined');assert.equal(r.projection.transactions,null);
 if(captureKind==='none')assert.equal(r.projection.snapshot,null);else{assert.equal(r.projection.snapshot.availableTransactions,1);assert.equal(r.projection.snapshot.totalTransactions,null);assert.equal(r.projection.snapshot.historyCoverage,'retained-summary-only');}
});
test('response waiting remains different from native applied and application consumption stays unknown',async()=>{
 const f=await fixture({sourceKind:'json-response'}),r=(await parseHandoffInputEvidence(await create(f,{includeCategories:all}))).record;
 assert.equal(r.acquisition.sourceKind,'json-response');assert.equal(r.projection.transactions[0].phase,'waiting');assert.equal(r.projection.transactions[0].consumption,'unknown');assert.equal(r.projection.transactions[0].outcomes[0].after,null);
});
test('private capture source digest and capture clock must match the exact diagnostic bytes',async()=>{
 const f=await fixture();for(const mutate of [c=>{c.diagnosticRaw+=' ';},c=>{c.capturedAt++;},c=>{c.outcomes.sourceDiagnostic.digest='0'.repeat(64);},c=>{c.outcomes.selectedObservation.observedAt++;}]){const c=JSON.parse(f.raw);mutate(c);await assert.rejects(createHandoffInputEvidence(JSON.stringify(c)));}
});
test('private envelope never accepts extra snapshot/rule/grant fields or switched executable flags',async()=>{
 const f=await fixture();for(const patch of [{snapshot:{}},{grants:['read']},{exportable:true},{executable:true},{schema:'stateatom.diagnostic'}])await assert.rejects(createHandoffInputEvidence(JSON.stringify({...JSON.parse(f.raw),...patch})));
});
test('review input getters and decorated choices never execute',async()=>{
 const f=await fixture();let reads=0;const review={get includeCategories(){reads++;return all;}};await assert.rejects(create(f,review));assert.equal(reads,0);
 for(const includeCategories of [Array(1),Object.assign(['inputValues'],{extra:'inputErrors'}),['inputValues','inputValues'],['unknown']])await assert.rejects(create(f,{includeCategories}));
});
test('immutable redaction binds exact parent bytes and changes only explicitly omitted optional content',async()=>{
 const f=await fixture(),parent=await create(f,{includeCategories:all}),before=JSON.parse(parent);
 const raw=await redactHandoffInputEvidence(parent,{omitCategories:['inputValues'],omitFields:['/projection/binding/context/identity']},{expectedParentDigest:hash(parent),now:()=>4000});
 const parsed=await parseHandoffInputEvidence(raw,{parentRaw:parent}),r=parsed.record;
 assert.equal(parsed.parentStatus,'content-matched');assert.notEqual(r.id,before.id);assert.equal(r.revision,1);assert.equal(r.lineage.parentArtifactDigest,hash(parent));assert.equal(r.lineage.parentEvidenceDigest,before.evidenceDigest);
 assert.deepEqual(r.acquisition,before.acquisition);assert.equal(r.projection.binding.context.identity.state,'omitted');assert.equal(r.projection.transactions[0].phase,'applied');assert(!raw.includes('PrivateInputCedar'));assert.equal(JSON.stringify(JSON.parse(parent)),JSON.stringify(before));
 assert.equal((await parseHandoffInputEvidence(raw)).parentStatus,'not-checked');await assert.rejects(parseHandoffInputEvidence(raw,{parentRaw:' '+parent}));
});
test('stale and unknown privacy choices reject instead of changing history or restoring omitted data',async()=>{
 const f=await fixture(),raw=await create(f);
 await assert.rejects(redactHandoffInputEvidence(raw,{omitCategories:['inputValues']},{expectedParentDigest:'0'.repeat(64)}));
 await assert.rejects(redactHandoffInputEvidence(raw,{includeCategories:all},{expectedParentDigest:hash(raw)}));
 await assert.rejects(redactHandoffInputEvidence(raw,{omitFields:['/missing']},{expectedParentDigest:hash(raw)}));
});
test('unsupported/malformed/budget imports reject before any external action',async()=>{
 let calls=0;const old=globalThis.fetch;globalThis.fetch=async()=>{calls++;throw Error('Unexpected fetch');};
 try{for(const raw of ['{}','{bad',JSON.stringify({schema:'stateatom.input-evidence/2'}),' '.repeat(1048577)])await assert.rejects(parseHandoffInputEvidence(raw));assert.equal(calls,0);}finally{globalThis.fetch=old;}
});
for(const [name,mutate] of [
 ['future editor clock',c=>{c.outcomes.editorObservation.observedAt=3000;}],
 ['contradictory native resource identity',c=>{c.outcomes.transactions[0].outcomes[0].after.identity.value.id='different-resource';}],
 ['contradictory cleanup',c=>{c.outcomes.snapshot.cleanup='closed';}],
 ['too many pending responses',c=>{c.outcomes.snapshot.pendingCount=33;}]
])test(`private projection rejects ${name} instead of exporting a self-consistent-looking claim`,async()=>{
 const f=await fixture({sourceKind:name==='too many pending responses'?'json-response':'dom-control'}),c=JSON.parse(f.raw);mutate(c);await assert.rejects(createHandoffInputEvidence(JSON.stringify(c),{includeCategories:all}));
});
function canonical(v){return JSON.stringify(function sort(x){return Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;}(v));}
function rehash(raw,mutate){const r=JSON.parse(raw);mutate(r);r.evidenceDigest=hash(canonical({source:r.source,acquisition:r.acquisition,projection:r.projection,privacy:r.privacy}));return canonical(r);}
test('rehashing cannot upgrade unknown effect, invent transactions or bypass typed counts',async()=>{
 const f=await fixture(),raw=await create(f,{includeCategories:all});assert.equal((await parseHandoffInputEvidence(rehash(raw,()=>{}))).trust,'historical-untrusted');
 for(const mutate of [r=>{r.projection.transactions[0].effect='verified';},r=>{r.projection.snapshot.availableTransactions++;},r=>{r.projection.transactions[0].recordedAt=1900;},r=>{r.projection.transactions[0].applicationRestored=true;}])await assert.rejects(parseHandoffInputEvidence(rehash(raw,mutate)),{code:'INVALID_INPUT_EVIDENCE'});
});
test('a plausible deliberately rehashed alternative remains an untrusted claim rather than native proof',async()=>{
 const f=await fixture(),raw=await create(f,{includeCategories:all});const changed=rehash(raw,r=>{r.projection.transactions[0].outcomes[0].value.value='Different untrusted claim';r.projection.transactions[0].outcomes[0].after.value.value='Different untrusted claim';});
 const parsed=await parseHandoffInputEvidence(changed);assert.equal(parsed.trust,'historical-untrusted');assert.equal(parsed.parentStatus,'not-checked');assert.equal(parsed.record.projection.transactions[0].effect,'unknown');
});
test('supplied parent detects rehashed changes in retained outcomes and acquisition',async()=>{
 const f=await fixture(),parent=await create(f,{includeCategories:all}),child=await redactHandoffInputEvidence(parent,{omitCategories:['inputErrors']},{expectedParentDigest:hash(parent)});
 const changed=rehash(child,r=>{r.acquisition.privateReplyDigest='0'.repeat(64);});assert.equal((await parseHandoffInputEvidence(changed)).trust,'historical-untrusted');await assert.rejects(parseHandoffInputEvidence(changed,{parentRaw:parent}));
});
test('creation snapshots review choices before hashing and invokes explicit clock once',async()=>{
 const f=await fixture();let clocks=0;const review={includeCategories:['inputValues'],omitFields:[]},pending=createHandoffInputEvidence(f.raw,review,{now:()=>{clocks++;return 3000;}});review.includeCategories.push('inputIdentities');review.omitFields.push('/projection/transactions/0/outcomes/0/value');const r=(await parseHandoffInputEvidence(await pending)).record;
 assert.equal(clocks,1);assert.equal(r.projection.transactions[0].outcomes[0].value.value,'PrivateInputCedar');assert.equal(r.projection.transactions[0].id.state,'omitted');assert.deepEqual(r.privacy.omittedFields,[]);
});
test('unrecorded optional notices stay null while an explicit empty list remains empty',async()=>{
 const f=await fixture(),c=JSON.parse(f.raw);c.outcomes.snapshot.notes=null;const r=(await parseHandoffInputEvidence(await createHandoffInputEvidence(JSON.stringify(c)))).record;assert.equal(r.projection.snapshot.notes,null);
 const present=(await parseHandoffInputEvidence(await create(f))).record;assert.deepEqual(present.projection.snapshot.notes,[]);
});
test('an oversized private projection cannot be hidden by default public omission',async()=>{
 const f=await fixture(),c=JSON.parse(f.raw),tx=c.outcomes.transactions[0];
 c.outcomes.transactions=Array.from({length:64},(_,i)=>{const t=structuredClone(tx);t.ordinal=i+1;t.id.value='transaction-'+i;t.outcomes[0].value.value='x'.repeat(10000);t.outcomes[0].after.value.value='x'.repeat(10000);return t;});c.outcomes.snapshot.availableTransactions=64;c.outcomes.snapshot.revision=129;
 const raw=JSON.stringify(c);assert(Buffer.byteLength(JSON.stringify(c.outcomes))>1048576);assert(Buffer.byteLength(raw)<2097152);await assert.rejects(createHandoffInputEvidence(raw),{code:'HANDOFF_LIMIT'});
});
test('unconfirmed native ACK stays unconfirmed with no invented after locator or success',async()=>{
 const f=await fixture({applyStatus:'unconfirmed'}),r=(await parseHandoffInputEvidence(await create(f,{includeCategories:all}))).record;
 const tx=r.projection.transactions[0];assert.equal(tx.phase,'unconfirmed');assert.equal(tx.outcomes[0].after,null);assert.equal(tx.outcomes[0].historicalLocator,'not-recorded');assert.equal(tx.applicationRestored,false);
});
test('known URL details remain filtered in included input values and identity omission breaks the visible join',async()=>{
 const f=await fixture({privateValue:'https://example.invalid/cedar?token=NeverExportCedar#SecretFragment'}),raw=await create(f,{includeCategories:all});const r=(await parseHandoffInputEvidence(raw)).record;
 assert(!raw.includes('NeverExportCedar'));assert(!raw.includes('SecretFragment'));assert.equal(r.projection.transactions[0].outcomes[0].value.state,'filtered');
 const next=(await parseHandoffInputEvidence(await redactHandoffInputEvidence(raw,{omitFields:['/projection/binding/context/identity']},{expectedParentDigest:hash(raw)}),{parentRaw:raw})).record;
 assert.equal(next.projection.binding.visibleJoin,'unverifiable-omitted-or-filtered-context');assert.equal(next.projection.binding.status,'capture-context-matched');
});
test('real-ledger delivered response accepts the known filter origin representation without reconstructing its removed route',async()=>{
 const f=inputOutcomeFixture({sourceKind:'json-response'});f.apply();const prepared=f.ledger.prepareResponse({url:f.resource().locator.url,method:'GET',requestId:'request-cedar-2',requestOrdinal:2,document:f.target.document,body:JSON.stringify({value:'BeforeInputCedar'})});f.ledger.confirmResponse(prepared.receipt,{delivered:true});
 const outcomes=await createHandoffInputOutcomes(f.raw,f.capture(),{includeCategories:all});
 const raw=JSON.stringify({schema:'stateatom.input-outcome-capture/1',exportable:false,executable:false,capturedAt:2000,diagnosticRaw:f.raw,outcomes,limitations:[]});
 const r=(await parseHandoffInputEvidence(await createHandoffInputEvidence(raw,{includeCategories:all}))).record;
 const delivery=r.projection.transactions[0].outcomes[0].deliveries[0];assert.equal(delivery.url.state,'filtered');assert.equal(delivery.url.value,'http://127.0.0.1:4173');assert.equal(delivery.delivered,true);assert(!JSON.stringify(delivery).includes('/api/private'));assert(!JSON.stringify(delivery).includes('NeverQueryCedar'));
});
test('filtered delivery suffixes cannot retain credentials or query fields after a redaction marker',async()=>{
 const f=await fixture({sourceKind:'json-response'}),c=JSON.parse(f.raw),o=c.outcomes.transactions[0].outcomes[0];
 o.phase='delivered';c.outcomes.transactions[0].phase='delivered';
 o.deliveries=[{receipt:{state:'included',value:'delivery-cedar'},requestId:{state:'included',value:'request-cedar'},requestOrdinal:2,url:filterHandoffReviewValue('https://user:pass@example.invalid/path?token=SecretCedar&private=NeverSuffixCedar#HiddenFragment','json'),delivered:true,afterClose:false,error:{state:'not-recorded'}}];
 const raw=await createHandoffInputEvidence(JSON.stringify(c),{includeCategories:all}),r=(await parseHandoffInputEvidence(raw)).record;
 assert.equal(r.projection.transactions[0].outcomes[0].deliveries[0].url.value,'https://example.invalid');for(const fragment of ['user:pass','SecretCedar','NeverSuffixCedar','HiddenFragment','/path'])assert(!raw.includes(fragment),fragment);
});
test('omitted data cannot be reintroduced with a rehashed derivative when its parent is supplied',async()=>{
 const f=await fixture(),base=await create(f,{includeCategories:all}),parent=await redactHandoffInputEvidence(base,{omitCategories:['inputValues']},{expectedParentDigest:hash(base)}),child=await redactHandoffInputEvidence(parent,{},{expectedParentDigest:hash(parent)});
 const forged=rehash(child,r=>{r.privacy.excludedCategories=[];r.projection.transactions[0].outcomes[0].value={state:'included',value:'Invented previous value'};});
 assert.equal((await parseHandoffInputEvidence(forged)).trust,'historical-untrusted');await assert.rejects(parseHandoffInputEvidence(forged,{parentRaw:parent}));
});
test('safe revision limit refuses a new derivative without mutating the parent',async()=>{
 const f=await fixture(),base=await create(f),raw=rehash(base,r=>{r.revision=Number.MAX_SAFE_INTEGER;r.lineage={kind:'privacy-derivative',parentArtifactDigest:'a'.repeat(64),parentEvidenceDigest:'b'.repeat(64)};});
 assert.equal((await parseHandoffInputEvidence(raw)).trust,'historical-untrusted');await assert.rejects(redactHandoffInputEvidence(raw,{},{expectedParentDigest:hash(raw)}),{code:'HANDOFF_LIMIT'});assert.equal(JSON.parse(raw).revision,Number.MAX_SAFE_INTEGER);
});
test('parallel privacy forks retain independent identities and bind the same immutable parent',async()=>{
 const f=await fixture(),parent=await create(f,{includeCategories:all}),options={expectedParentDigest:hash(parent)},[a,b]=await Promise.all([redactHandoffInputEvidence(parent,{omitCategories:['inputValues']},options),redactHandoffInputEvidence(parent,{omitCategories:['inputErrors']},options)]);
 const left=(await parseHandoffInputEvidence(a,{parentRaw:parent})).record,right=(await parseHandoffInputEvidence(b,{parentRaw:parent})).record;assert.notEqual(left.id,right.id);assert.equal(left.lineage.parentArtifactDigest,right.lineage.parentArtifactDigest);assert(left.privacy.excludedCategories.includes('inputValues'));assert(!right.privacy.excludedCategories.includes('inputValues'));
});
test('HTML-like values remain inert JSON data and cannot invoke any code while parsing',async()=>{
 const f=await fixture({privateValue:'<img src=x onerror="globalThis.inputEvidenceExecuted=true">'}),raw=await create(f,{includeCategories:all});
 const r=(await parseHandoffInputEvidence(raw)).record;assert.equal(r.projection.transactions[0].outcomes[0].value.value,'<img src=x onerror="globalThis.inputEvidenceExecuted=true">');assert.equal(globalThis.inputEvidenceExecuted,undefined);
});
test('a filtered label cannot contradict the actual selected value or source run in the exact diagnostic',async()=>{
 const f=await fixture();for(const mutate of [c=>{c.outcomes.selectedObservation.value={state:'filtered',value:false,reason:'known-secrets-or-url-details-filtered'};},c=>{c.outcomes.sourceDiagnostic.run={state:'filtered',value:'Different untrusted run',reason:'known-secrets-or-url-details-filtered'};}]){const c=JSON.parse(f.raw);mutate(c);await assert.rejects(createHandoffInputEvidence(JSON.stringify(c),{includeCategories:all}));}
});
test('filtered transaction IDs do not prove a collision with a known literal redaction marker ID',async()=>{
 const f=await fixture(),c=JSON.parse(f.raw),first=c.outcomes.transactions[0];first.id={state:'filtered',value:'[REDACTED_SECRET]',reason:'known-secrets-or-url-details-filtered'};const second=structuredClone(first);second.ordinal=2;second.id={state:'included',value:'[REDACTED_SECRET]'};c.outcomes.transactions.push(second);c.outcomes.snapshot.availableTransactions=2;
 const r=(await parseHandoffInputEvidence(await createHandoffInputEvidence(JSON.stringify(c),{includeCategories:all}))).record;assert.equal(r.projection.transactions.length,2);assert.equal(r.projection.transactions[0].id.state,'filtered');
 first.id={state:'included',value:'[REDACTED_SECRET]'};await assert.rejects(createHandoffInputEvidence(JSON.stringify(c),{includeCategories:all}));
});
