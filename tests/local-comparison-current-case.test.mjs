// SPDX-License-Identifier: Apache-2.0
import {comparisonCaseFixture} from './helpers/comparison-case-fixture.mjs';
import {retainedTest} from './helpers/retained-evidence-test.mjs';
// Source/immutable receipt controls only. No native/model run or fabricated evidence.
import test from 'node:test';import assert from 'node:assert/strict';import path from 'node:path';import {readFile} from 'node:fs/promises';import {spawnSync} from 'node:child_process';
import {comparisonCollectionFixture} from './helpers/comparison-collection-fixture.mjs';
const load=()=>import('../scripts/comparison-evaluation-case.mjs'),qualify=()=>import('../experiments/comparison-evaluation-qualification.mjs');
const currentId='L02.15-local80-path-discovery-comparison';
async function currentDefinition(){const m=await load(),c=m.comparisonCandidate('current-owned'),s=comparisonCaseFixture(JSON.parse(await readFile('docs/testing/l02-comparison-short-case78.json','utf8')),'current-owned'),out=m.comparisonOutputPath(c.key,{nonce:s.nonce});return {...s,id:c.id,out,hostPath:out+'/evaluation-host',atomHandoff:c.handoff,atomSha256:c.atomSha256,uiSha256:c.uiSha256,packedAdmission:c.admission,packedTypes:path.dirname(c.handoff)+'/type-consumer-result.json',sourceRegistration:c.sourceRegistration};}
test('closed current80 route has own fixed case/pins/short output and leaves old78 mappings strict',async()=>{
 const m=await load(),c=m.comparisonCandidate('current-owned');
 assert.equal(c.id,currentId);assert.equal(c.caseFile,path.resolve('docs/testing/l02-comparison-path-case80.json'));
 assert.equal(c.handoff,path.resolve('.artifacts/atom/2026-10-25T20-19-03-321Z/atom-handoff.json'));
 assert.equal(c.atomSha256,'0d128ea36b1a508c471f8b42c5a7fa3ff310b34119da9a4a1774b90b3c589ba1');
 assert.equal(m.comparisonOutputPath(c.key,{nonce:'a'.repeat(32)}),path.resolve('.artifacts/l02/c2/aaaaaaaa'));
 assert.deepEqual(m.parseComparisonNativeArgs([c.caseFile,'--preflight']),{caseFile:c.caseFile,preflight:true});
 for(const key of ['original','short-owned']){const old=m.comparisonCandidate(key);assert.equal(old.handoff,m.comparisonHandoff);assert.equal(old.atomSha256,m.comparisonAtomSha);}
 assert(Object.isFrozen(c)&&Object.isFrozen(c.protectedInputFiles));assert.throws(()=>m.comparisonCandidate('any-owned'));
});
retainedTest('current80 receipt admission uses actual immutable80 pair while default78 refuses it',async()=>{
 const m=await load(),c=m.comparisonCandidate('current-owned'),json=async f=>JSON.parse(await readFile(f,'utf8'));
 const h=await json(c.handoff),types=await json(path.dirname(c.handoff)+'/type-consumer-result.json'),admission=await json(c.admission),f={h,types,admission,handoffSha256:m.comparisonSha(await readFile(c.handoff))};
 assert.doesNotThrow(()=>m.admitComparisonIssuedPair(f,c));assert.throws(()=>m.admitComparisonIssuedPair(f));
 assert.throws(()=>m.admitComparisonIssuedPair({...f,h:{...h,package:{...h.package,sha256:m.comparisonAtomSha}}},c));
 assert.throws(()=>m.admitComparisonIssuedPair(f,{...c,atomSha256:m.comparisonAtomSha}));
});
test('current80 case definition admits only matching new fixed pins and output',async()=>{const m=await load(),s=await currentDefinition();assert.doesNotThrow(()=>m.admitComparisonCaseDefinition(s));});
for(const [label,change] of [
 ['old handoff',async(s,m)=>s.atomHandoff=m.comparisonHandoff],['old hash',async(s,m)=>s.atomSha256=m.comparisonAtomSha],
 ['old admission',async(s,m)=>s.packedAdmission=m.comparisonAdmission],['old id',async s=>s.id='L02.13-local78-short-temp-comparison'],
 ['old output',async(s,m)=>{s.out=m.comparisonOutputPath('short-owned',{nonce:s.nonce});s.hostPath=s.out+'/evaluation-host';}],
 ['download',async s=>s.protocol.allowDownload=true],['second attempt',async s=>s.maximumNativeRuns=2]
])test('current case refuses '+label,async()=>{const m=await load(),s=await currentDefinition();await change(s,m);assert.throws(()=>m.admitComparisonCaseDefinition(s));});
retainedTest('current source registration admits exact496 base and protects prior exhausted/review bytes',async()=>{
 const m=await load(),c=m.comparisonCandidate('current-owned'),r=JSON.parse(await readFile(c.sourceRegistration,'utf8'));
 assert.doesNotThrow(()=>m.admitComparisonSourceRegistration(r,c));assert.equal(r.base,'496947a04efd266b752d07dff2c3a07f08303735');assert.equal(Object.keys(r.protectedInputs).length,23);
 for(const change of [x=>delete x.protectedInputs,x=>delete x.L02Raw[Object.keys(x.L02Raw)[0]],x=>x.base='0'.repeat(40),x=>x.declaredResearchDeltas.pop()]){const bad=structuredClone(r);change(bad);assert.throws(()=>m.admitComparisonSourceRegistration(bad,c));}
 for(const [f,h]of Object.entries(r.protectedInputs))assert.equal(m.comparisonSha(await readFile(f)),h);
});
function currentCollection(){const f=comparisonCollectionFixture(),s=f.caseData,r=f.result;s.id=currentId;s.atomSha256='0d128ea36b1a508c471f8b42c5a7fa3ff310b34119da9a4a1774b90b3c589ba1';r.issuedPair.atomSha256=s.atomSha256;s.profile.previousExtensionId='b'.repeat(32);r.caseId=s.id;const selected={id:r.extensionId,path:s.hostPath,state:'ENABLED',location:'UNPACKED'};r.extensionDiscovery={method:'exact-prepared-path-in-extension-ui',before:{ready:true,items:[]},latest:{at:'2026-10-25T22:00:00Z',ready:true,items:[{...selected}]},selected};return f;}
test('current collection requires actual discovery facts in addition to all original collection predicates',async()=>{const m=await qualify(),f=currentCollection();assert.equal(f.sourceFixtureOnly,true);assert.equal(m.guardComparisonCollection(f.result,f.caseData),m.comparisonCollectionStatus);});
for(const [label,change]of [
 ['no discovery',r=>delete r.extensionDiscovery],['uninitialized before',r=>r.extensionDiscovery.before.ready=false],
 ['preexisting host',r=>r.extensionDiscovery.before.items.push({...r.extensionDiscovery.selected})],
 ['uninitialized after',r=>r.extensionDiscovery.latest.ready=false],['missing latest row',r=>r.extensionDiscovery.latest.items=[]],
 ['duplicate path',r=>r.extensionDiscovery.latest.items.push({...r.extensionDiscovery.selected})],
 ['foreign selected id',r=>r.extensionDiscovery.selected.id='c'.repeat(32)],['foreign path',r=>r.extensionDiscovery.selected.path+='/foreign'],
 ['prior selected id',(r,s)=>s.profile.previousExtensionId=r.extensionId],
 ['old pair relabelled current',(r,s)=>{s.atomSha256='8e2d67e68a0ef2a798409156c581629adb3cd2e37f06e8bb3ef7c3c0d16bcf4a';r.issuedPair.atomSha256=s.atomSha256;}],
 ['disabled row',r=>r.extensionDiscovery.selected.state='DISABLED'],['store row',r=>r.extensionDiscovery.selected.location='FROM_STORE'],
 ['no observation time',r=>delete r.extensionDiscovery.latest.at]
])test('current collection refuses '+label,async()=>{const m=await qualify(),f=currentCollection();change(f.result,f.caseData);assert.throws(()=>m.guardComparisonCollection(f.result,f.caseData));});
test('current preparer imports inertly and CLI refuses options before case/profile IO',async()=>{
 const m=await import('../scripts/prepare-current-comparison-evaluation.mjs');assert.equal(typeof m.prepareCurrentComparisonEvaluation,'function');
 const r=spawnSync(process.execPath,['scripts/prepare-current-comparison-evaluation.mjs','--retry'],{encoding:'utf8'});assert.equal(r.status,1);assert.match(r.stderr,/PREPARE_CURRENT_COMPARISON_ERROR INVALID_ARGUMENTS/);assert.doesNotMatch(r.stderr,/ENOENT/);
});
retainedTest('current frozen input list includes the prewritten offline reader and contract before native',async()=>{
 const m=await load(),c=m.comparisonCandidate('current-owned'),s=await currentDefinition();
 const h=JSON.parse(await readFile(c.handoff,'utf8')),r=JSON.parse(await readFile(c.sourceRegistration,'utf8'));
 const files=m.comparisonFrozenFileList(s,h,r);
 for(const file of ['verify.py','contract.json'])assert(files.includes(path.resolve('.artifacts/l02/current-comparison-saved-verification/2026-10-26/'+file)));
});
