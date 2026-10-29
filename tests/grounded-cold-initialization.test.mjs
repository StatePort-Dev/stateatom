// SPDX-License-Identifier: Apache-2.0
// Deterministic source model/timer controls; no native inference or device claim.
import test from 'node:test';import assert from 'node:assert/strict';
import {ChromeGroundedAnnotation} from '../core/derived-model-provider.mjs';
import {localModelCorpus30} from './fixtures/local-model-acceptance-corpus.mjs';
const facts=localModelCorpus30().find(c=>c.id==='unknown-left').facts,output=()=>JSON.stringify({schema:'stateatom.local-derived-annotation/4',claimIds:['recorded-copy','unavailable-input']});
const flush=()=>new Promise(setImmediate);
function setup(t,{state='downloadable',availability,options={}}={}){
 t.mock.timers.enable({apis:['setTimeout']});const creation=Promise.withResolvers(),reply=Promise.withResolvers(),calls={availability:0,create:0,prompt:0,destroy:0};let createOptions,done=false;
 const session={prompt(){calls.prompt++;return reply.promise;},destroy(){calls.destroy++;}};
 const api={availability(){calls.availability++;return availability?availability():Promise.resolve(state);},create(o){calls.create++;createOptions=o;return creation.promise;}};
 const pending=ChromeGroundedAnnotation(api).explain(facts,{userActivation:true,allowDownload:true,timeoutMs:120,coldInitializationTimeoutMs:300,...options});pending.then(()=>done=true);
 return {creation,reply,calls,session,api,pending,done:()=>done,createOptions:()=>createOptions,async tick(ms){t.mock.timers.tick(ms);await flush();}};
}
test('explicit cold preparation can finish after old work budget without changing native options',async t=>{
 const r=setup(t);await flush();assert.equal(r.calls.create,1);await r.tick(150);assert.equal(r.done(),false);r.creation.resolve(r.session);await flush();assert.equal(r.calls.prompt,1);assert.equal(Object.hasOwn(r.createOptions(),'coldInitializationTimeoutMs'),false);assert.deepEqual(r.createOptions().expectedInputs,[{type:'text',languages:['en']}]);r.reply.resolve(output());assert.equal((await r.pending).provider,'chrome-built-in-grounded');assert.equal(r.calls.destroy,1);await r.tick(1000000);assert.equal(r.calls.destroy,1);
});
test('cold preparation has its own finite limit and late ignored-signal session is retired once',async t=>{
 const r=setup(t,{state:'downloading'});await flush();await r.tick(299);assert.equal(r.done(),false);await r.tick(1);assert.match((await r.pending).reason,/cancelled or timed out/);assert.equal(r.calls.prompt,0);r.creation.resolve(r.session);await flush();assert.equal(r.calls.destroy,1);
});
test('a long cold initialization does not consume the original prompt deadline',async t=>{
 const r=setup(t);await flush();await r.tick(250);assert.equal(r.done(),false);r.creation.resolve(r.session);await flush();assert.equal(r.calls.prompt,1);await r.tick(119);assert.equal(r.done(),false);await r.tick(1);assert.equal((await r.pending).provider,'template');assert.equal(r.calls.destroy,1);assert.equal(r.createOptions().signal.aborted,true);r.reply.resolve(output());await flush();assert.equal(r.calls.destroy,1);
});
test('available model keeps the old overall work deadline even when cold option is supplied',async t=>{
 const r=setup(t,{state:'available'});await flush();await r.tick(120);assert.equal((await r.pending).provider,'template');r.creation.resolve(r.session);await flush();assert.equal(r.calls.prompt,0);assert.equal(r.calls.destroy,1);
});
test('default callers retain the original overall cold deadline without explicit new option',async t=>{
 const r=setup(t,{options:{coldInitializationTimeoutMs:undefined}});await flush();await r.tick(120);assert.equal((await r.pending).provider,'template');r.creation.resolve(r.session);await flush();assert.equal(r.calls.prompt,0);assert.equal(r.calls.destroy,1);
});
test('pending availability never borrows the cold preparation budget',async t=>{
 const gate=Promise.withResolvers(),r=setup(t,{availability:()=>gate.promise});await flush();await r.tick(120);assert.equal((await r.pending).provider,'template');assert.equal(r.calls.create,0);gate.resolve('downloadable');await flush();assert.equal(r.calls.create,0);
});
test('cold option grants neither user activation nor download permission and cannot bypass Unknown',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});for(const [state,options]of [['downloadable',{userActivation:false}],['downloading',{allowDownload:false}],['unavailable',{}],['future-state',{}]]){let creates=0,checks=0;const r=await ChromeGroundedAnnotation({availability(){checks++;return state;},create(){creates++;}}).explain(facts,{userActivation:true,allowDownload:true,coldInitializationTimeoutMs:300,...options});assert.equal(r.provider,'template');assert.equal(creates,0);assert.equal(checks,options.userActivation===false?0:1);}
});
test('invalid cold budget retains the original deadline',async t=>{
 const r=setup(t,{options:{coldInitializationTimeoutMs:Infinity}});await flush();await r.tick(120);assert.equal((await r.pending).provider,'template');r.creation.resolve(r.session);await flush();assert.equal(r.calls.destroy,1);
});
test('cancelling cold preparation stops promptly and owns late session cleanup exactly once',async t=>{
 const c=new AbortController(),r=setup(t,{options:{signal:c.signal}});await flush();await r.tick(150);assert.equal(r.done(),false);c.abort();assert.equal((await r.pending).provider,'template');r.creation.resolve(r.session);await flush();assert.equal(r.calls.prompt,0);assert.equal(r.calls.destroy,1);
});
test('cancel from phase callback prevents the next create or prompt even when native API ignores abort',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});for(const phase of ['checking','initializing','downloading','generating']){const c=new AbortController();let creates=0,prompts=0,destroy=0;const r=await ChromeGroundedAnnotation({availability:async()=>phase==='downloading'?'downloadable':'available',create:async()=>{creates++;return{prompt(){prompts++;return output();},destroy(){destroy++;}};}}).explain(facts,{userActivation:true,allowDownload:true,coldInitializationTimeoutMs:300,signal:c.signal,onPhase:p=>{if(p===phase)c.abort();}});assert.equal(r.provider,'template');assert.equal(creates,phase==='generating'?1:0);assert.equal(prompts,0);assert.equal(destroy,phase==='generating'?1:0);}
});
test('synchronous download-progress cancellation cannot double-destroy or prompt a newly returned session',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const c=new AbortController();let creates=0,prompts=0,destroy=0;
 const r=await ChromeGroundedAnnotation({availability:async()=> 'downloadable',create(o){creates++;o.monitor({addEventListener(_name,fn){fn({loaded:0.5});}});return{prompt(){prompts++;return output();},destroy(){destroy++;}};}}).explain(facts,{userActivation:true,allowDownload:true,coldInitializationTimeoutMs:300,signal:c.signal,onProgress:()=>c.abort()});assert.equal(r.provider,'template');assert.equal(creates,1);assert.equal(prompts,0);assert.equal(destroy,1);
});
test('synchronous prompt cancellation cannot publish an already resolved allowed summary',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});const c=new AbortController();let destroy=0;
 const r=await ChromeGroundedAnnotation({availability:async()=> 'available',create:async()=>({prompt(){c.abort();return output();},destroy(){destroy++;}})}).explain(facts,{userActivation:true,signal:c.signal});assert.equal(r.provider,'template');assert.equal(destroy,1);
});

test('explicit cold preparation option is capped at600s',async t=>{
 const r=setup(t,{options:{coldInitializationTimeoutMs:600001}});await flush();await r.tick(599999);assert.equal(r.done(),false);await r.tick(1);assert.equal((await r.pending).provider,'template');r.creation.resolve(r.session);await flush();assert.equal(r.calls.prompt,0);assert.equal(r.calls.destroy,1);
});
