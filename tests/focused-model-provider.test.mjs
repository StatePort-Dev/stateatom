// SPDX-License-Identifier: Apache-2.0
// Mock lifecycle/structure only; no quality or real inference claim.
import test from 'node:test';import assert from 'node:assert/strict';
import{ChromeFocusedAnnotation}from'../core/derived-model-provider.mjs';
import{localModelCorpus30}from'./fixtures/local-model-acceptance-corpus.mjs';
import{TemplateExplanation}from'../core/action-explanations.mjs';
const fact=id=>localModelCorpus30().find(c=>c.id===id).facts;
function model(){const calls={create:0,prompt:0,destroy:0};return{calls,api:{availability:async()=> 'available',create:async options=>{calls.create++;assert(options.initialPrompts[0].content.includes('/3'));return{prompt:async(prompt,o)=>{calls.prompt++;return JSON.stringify({schema:'stateatom.local-derived-annotation/3',text:'This is a synthetic test annotation.',factTokens:o.responseConstraint.properties.factTokens.items.enum});},destroy(){calls.destroy++;}};}}};}
test('focused provider uses v3 and27 main model routes; finite product/templates remain separate',async()=>{
 let count=0;for(const c of localModelCorpus30()){const m=model(),r=await ChromeFocusedAnnotation(m.api).explain(c.facts,{userActivation:true});assert.equal(r.summary,TemplateExplanation(c.facts).summary);assert.deepEqual(r.limitations,c.facts.limitations);if(r.annotation){count++;assert.equal(r.provider,'chrome-built-in-focused');assert.equal(r.annotation.factualEntailmentVerified,false);assert.equal(m.calls.destroy,1);}else assert.equal(m.calls.create,0);}assert.equal(count,27);
});
test('focused late prompt cannot survive cancellation or current-fact change; native session is destroyed once',async()=>{
 for(const mode of ['abort','changed']){const gate=Promise.withResolvers(),started=Promise.withResolvers(),c=new AbortController();let current=fact('unknown-left'),destroy=0;const initial=current;
 const api={availability:async()=> 'available',create:async()=>({prompt:async(_p,o)=>{started.resolve(o);return gate.promise;},destroy(){destroy++;}})};
 const pending=ChromeFocusedAnnotation(api).explain(initial,{userActivation:true,signal:c.signal,getCurrentFacts:()=>current});const options=await started.promise;if(mode==='abort')c.abort();else current=fact('no-blocker');gate.resolve(JSON.stringify({schema:'stateatom.local-derived-annotation/3',text:'Old synthetic annotation.',factTokens:options.responseConstraint.properties.factTokens.items.enum}));const r=await pending;assert.equal(r.annotation,null);assert.equal(destroy,1);
 }
});
test('focused unavailable/no gesture/rejected structure falls back without inventing useful quality',async()=>{
 for(const api of [null,{availability:async()=> 'unavailable'}])assert.equal((await ChromeFocusedAnnotation(api).explain(fact('masking'),{userActivation:true})).annotation,null);
 const m=model();assert.equal((await ChromeFocusedAnnotation(m.api).explain(fact('masking'))).annotation,null);assert.equal(m.calls.create,0);
 let destroyed=0;const api={availability:async()=> 'available',create:async()=>({prompt:async()=>'{"schema":"wrong"}',destroy(){destroyed++;}})};assert.equal((await ChromeFocusedAnnotation(api).explain(fact('masking'),{userActivation:true})).annotation,null);assert.equal(destroyed,1);
});
