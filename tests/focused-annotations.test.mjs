// SPDX-License-Identifier: Apache-2.0
// Synthetic fact boundaries only, not real model quality.
import test from 'node:test';import assert from 'node:assert/strict';
import {localModelCorpus30} from './fixtures/local-model-acceptance-corpus.mjs';
import {inspectionExplanationFacts} from '../core/inspection-explanations.mjs';
import {explanationFixture} from './helpers/explanation-facts-fixture.mjs';
import {projectFocusedAnnotation,buildFocusedPrompt,focusedResponseConstraint,validateFocusedAnnotation,isCurrentFocusedAnnotation} from '../core/focused-annotations.mjs';
const cases=()=>localModelCorpus30(),get=id=>cases().find(c=>c.id===id).facts;
test('fixed original30 gives27 current model inputs and3 real fallback boundaries, preserving untrusted and incomplete cases',()=>{
 const rows=cases(),projected=rows.map(c=>projectFocusedAnnotation(c.facts));assert.equal(projected.filter(Boolean).length,27);assert.equal(rows.filter(c=>c.category==='incomplete').length,6);assert.equal(rows.filter(c=>c.category==='untrusted').length,5);
 for(const p of projected.filter(Boolean)){const prompt=buildFocusedPrompt(p);assert(!/IGNORE|Cedar|App\.jsx|page:|action-evidence/.test(prompt));assert(prompt.length<2400);assert.equal(focusedResponseConstraint(p).properties.schema.const,'stateatom.local-derived-annotation/3');}
});
test('known recorded result, unresolved copy and zero unavailable inputs remain different facts',()=>{
 const unresolved=projectFocusedAnnotation(get('unknown-left')).input.facts;assert.equal(unresolved.find(f=>f.id==='recorded-result').value,true);assert.equal(unresolved.find(f=>f.id==='copied-result').value,null);assert(unresolved.find(f=>f.id==='unavailable-input-count').value>0);
 const masking=projectFocusedAnnotation(get('masking')).input.facts;assert.equal(masking.find(f=>f.id==='unavailable-input-count').value,0);assert.equal(masking.find(f=>f.id==='copied-result').value,true);
});
test('text inputs never send original scalar and action inputs do not invent invocation',()=>{
 for(const id of ['local-scalar','untrusted-scalar']){const p=projectFocusedAnnotation(get(id));assert.equal(p.input.task,'scalar-boundary');assert(!JSON.stringify(p.input).includes('Cedar'));assert(!p.input.facts.some(f=>f.id==='recorded-result'));}
 const p=projectFocusedAnnotation(get('native-click'));assert.equal(p.input.task,'action-boundary');assert.equal(p.input.facts.find(f=>f.id==='independent-body-count').value,0);assert.match(buildFocusedPrompt(p),/does not prove invocation/);
});
test('forged, cloned, stale and historical facts do not initialize a projection or execute hostile getters',()=>{
 let reads=0;const hostile=new Proxy({},{get(){reads++;throw 1},ownKeys(){reads++;throw 2}});
 for(const f of [hostile,structuredClone(get('masking')),get('property-stale'),inspectionExplanationFacts(explanationFixture(),{historical:true})])assert.equal(projectFocusedAnnotation(f),null);assert.equal(reads,0);
});
test('annotation binds exact current facts and immutable limitations, while text entailment stays explicitly unverified',()=>{
 const f=get('short-circuit'),p=projectFocusedAnnotation(f),tokens=p.input.facts.map(f=>f.id),value={schema:'stateatom.local-derived-annotation/3',text:'The recorded result is true; the copied result remains separate.',factTokens:tokens};
 const r=validateFocusedAnnotation(JSON.stringify(value),p,f);assert.equal(r.factualEntailmentVerified,false);assert.deepEqual(r.evidenceIds,f.evidenceIds);assert.deepEqual(r.limitations,f.limitations);assert(Object.isFrozen(r.limitations));assert(isCurrentFocusedAnnotation(p,f));
 for(const raw of [JSON.stringify({...value,factTokens:['invented']}),JSON.stringify({...value,extra:true}),JSON.stringify({...value,text:'x'.repeat(513)}),JSON.stringify(value).replace('"text":','"text":"duplicate","text":')])assert.throws(()=>validateFocusedAnnotation(raw,p,f));
 assert.throws(()=>validateFocusedAnnotation(JSON.stringify(value),p,get('no-blocker')));assert.throws(()=>buildFocusedPrompt(structuredClone(p)));
});
