// SPDX-License-Identifier: Apache-2.0
// Source mock boundaries only; no real model, device readiness or usefulness proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ChromeDerivedAnnotation,ChromeComparisonAnnotation} from '../core/derived-model-provider.mjs';
import {inspectionExplanationFacts} from '../core/inspection-explanations.mjs';
import {TemplateExplanation} from '../core/action-explanations.mjs';
import {explanationFixture} from './helpers/explanation-facts-fixture.mjs';
const facts=()=>inspectionExplanationFacts(explanationFixture());
const changed=()=>inspectionExplanationFacts(explanationFixture('hold',[['hold',false]],false));
const privateError='private-model-status-detail';
const unknownCases=[
 ['future',()=> 'future-private-status'],['null',()=>null],['undefined',()=>undefined],
 ['object',()=>({private:privateError})],['boolean',()=>false],['number',()=>0],
 ['throw',()=>{throw Error(privateError);}],['reject',()=>Promise.reject(Error(privateError))],
];
for(const [name,make] of [['derived',ChromeDerivedAnnotation],['comparison',ChromeComparisonAnnotation]]){
 test(`${name}: four explicit states and API absence retain their exact meaning`,async()=>{
  for(const state of ['available','downloadable','downloading','unavailable']){
   let calls=0;const provider=make({availability(options){calls++;assert.deepEqual(options,{expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:[{type:'text',languages:['en']}]});return state;}});
   assert.equal(await provider.availability(),state);assert.equal(calls,1);
  }
  assert.equal(await make(null).availability(),'unavailable');
 });
 test(`${name}: unknown values, thrown/rejected API and throwing method access remain unknown`,async()=>{
  for(const [label,answer] of unknownCases){let calls=0;assert.equal(await make({availability(){calls++;return answer();}}).availability(),'unknown',label);assert.equal(calls,1,label);}
  let reads=0;const api={get availability(){reads++;throw Error(privateError);}};
  assert.equal(await make(api).availability(),'unknown');assert.equal(reads,1);
 });
 test(`${name}: eligible facts reach availability once, and unknown never starts download or inference`,async()=>{
  for(const [label,answer] of unknownCases)for(const allowDownload of [false,true]){
   let checks=0,creates=0,prompts=0;const phases=[],progress=[],f=facts();
   const api={availability(){checks++;return answer();},create(){creates++;return{prompt(){prompts++;return '{}';},destroy(){}};}};
   const result=await make(api).explain(f,{userActivation:true,allowDownload,onPhase:p=>phases.push(p),onProgress:p=>progress.push(p)});
   assert.equal(checks,1,label);assert.equal(creates,0,label);assert.equal(prompts,0,label);
   assert.equal(result.provider,'template');assert.equal(result.annotation,null);assert.equal(result.summary,TemplateExplanation(f).summary);
   assert.match(result.reason,/status unknown/i,label);assert(!JSON.stringify(result).includes(privateError));assert(!JSON.stringify(result).includes('future-private-status'));
   assert.deepEqual(phases,['checking']);assert.deepEqual(progress,[]);
  }
 });
 test(`${name}: unknown response after target change yields current facts, never the old template`,async()=>{
  const ready=Promise.withResolvers(),pending=Promise.withResolvers(),initial=facts();let current=initial,checks=0,creates=0;
  const result=make({availability(){checks++;ready.resolve();return pending.promise;},create(){creates++;throw Error(privateError);}}).explain(initial,{userActivation:true,allowDownload:true,getCurrentFacts:()=>current});
  await ready.promise;current=changed();pending.reject(Error(privateError));const r=await result;
  assert.equal(checks,1);assert.equal(creates,0);assert.equal(r.annotation,null);assert.equal(r.summary,TemplateExplanation(current).summary);assert.match(r.reason,/changed; current/i);assert(!JSON.stringify(r).includes(privateError));
 });
 test(`${name}: activation and pre-cancellation still stop before metadata`,async()=>{
  const c=new AbortController();c.abort();let checks=0,creates=0;
  const provider=make({availability(){checks++;return 'future';},create(){creates++;}});
  for(const options of [{allowDownload:true},{userActivation:true,allowDownload:true,signal:c.signal}])assert.equal((await provider.explain(facts(),options)).annotation,null);
  assert.equal(checks,0);assert.equal(creates,0);
 });
}
