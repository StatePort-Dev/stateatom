// SPDX-License-Identifier: Apache-2.0
// Metadata observer/harness controls only. No real native/model evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const load=()=>import('./helpers/local-model-metadata-observer.mjs');
async function observe(api,timeoutMs=20){
 const {observeNativeModelMetadata}=await load();const timers=new Set(),context={LanguageModel:api,performance,setTimeout(fn,ms){const t=setTimeout(fn,ms);timers.add(t);return t;},clearTimeout(t){timers.delete(t);clearTimeout(t);}};
 const result=await vm.runInNewContext('('+observeNativeModelMetadata.toString()+')('+timeoutMs+')',context);
 return {result:JSON.parse(JSON.stringify(result)),timers};
}
for(const state of ['available','downloadable','downloading','unavailable'])test(`native metadata preserves ${state}, matching English options, and never accesses create/prompt`,async()=>{
 let calls=0,forbidden=0;const api={availability(options){calls++;assert.deepEqual(JSON.parse(JSON.stringify(options)),{expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:[{type:'text',languages:['en']}]});return state;},get create(){forbidden++;throw Error('private');},get prompt(){forbidden++;throw Error('private');}};
 const {result:r,timers}=await observe(api);assert.equal(r.outcome,'resolved');assert.equal(r.state,state);assert.equal(r.availabilityInvocations,1);assert.equal(calls,1);assert.equal(forbidden,0);assert.equal(timers.size,0);
});
test('missing API/method are distinct observations with no invocation',async()=>{
 for(const [api,outcome] of [[undefined,'api-missing'],[null,'api-missing'],[{},'method-missing']]){const {result:r,timers}=await observe(api);assert.equal(r.outcome,outcome);assert.equal(r.state,null);assert.equal(r.availabilityInvocations,0);assert.equal(timers.size,0);}
});
test('unrecognized values are unknown rather than unavailable and private values never escape',async()=>{
 for(const value of ['private-native-result',{},false,undefined,null,0]){let calls=0;const {result:r,timers}=await observe({availability(){calls++;return value;}});assert.equal(r.outcome,'unrecognized');assert.equal(r.state,null);assert.equal(r.availabilityInvocations,1);assert.equal(calls,1);assert(!JSON.stringify(r).includes('private-native-result'));assert.equal(timers.size,0);}
});
test('throw/rejection/method getter error omit private details and retain invocation distinction',async()=>{
 for(const [api,invocations] of [[{availability(){throw Error('private-error');}},1],[{availability(){return Promise.reject(Error('private-error'));}},1],[{get availability(){throw Error('private-error');}},0]]){const {result:r,timers}=await observe(api);assert.equal(r.outcome,'exception');assert.equal(r.state,null);assert.equal(r.availabilityInvocations,invocations);assert(!JSON.stringify(r).includes('private-error'));assert.equal(timers.size,0);}
});
test('pending metadata is finite, calls once and late rejection cannot rewrite saved outcome',async()=>{
 const pending=Promise.withResolvers();let calls=0;const {result:r,timers}=await observe({availability(){calls++;return pending.promise;}},5);assert.equal(r.outcome,'pending');assert.equal(r.state,null);assert.equal(calls,1);assert.equal(r.availabilityInvocations,1);assert.equal(timers.size,0);const saved=JSON.stringify(r);pending.reject(Error('private-late-error'));await new Promise(r=>setImmediate(r));assert.equal(JSON.stringify(r),saved);
});
test('driver missing/wrong case/revision refuses before resource or output creation',()=>{
 const marker='.artifacts/l02/official-google-readiness/2026-10-28/native-attempt.json',out='.artifacts/l02/official-google-readiness/2026-10-28/native';
 const snapshot=()=>({marker:existsSync(marker)?readFileSync(marker,'utf8'):null,out:existsSync(out)?readdirSync(out).sort():null}),before=snapshot();
 const caseFile='docs/testing/local-model-official87-readiness-case.json',caseSha=createHash('sha256').update(readFileSync(caseFile)).digest('hex');
 for(const args of [[],['--case','/tmp/not-this-case','--case-sha','0'.repeat(64),'--revision','0'.repeat(40)],['--case',caseFile,'--case-sha','bad','--revision','bad'],['--case',caseFile,'--case-sha','0'.repeat(64),'--revision','0'.repeat(40)],['--case',caseFile,'--case-sha',caseSha,'--revision','0'.repeat(40)]]){
  const r=spawnSync(process.execPath,['tests/integration/local-model-official87-readiness.mjs',...args],{encoding:'utf8',timeout:5000});assert.equal(r.status,1);assert.match(r.stderr,/OFFICIAL_MODEL_CASE_REQUIRED|OFFICIAL_MODEL_CASE_PATH|OFFICIAL_MODEL_REVISION_OR_HASH|OFFICIAL_MODEL_CASE_HASH|OFFICIAL_MODEL_REVISION/);assert(!r.stdout.includes('NATIVE_ATTEMPT'));assert.deepEqual(snapshot(),before);
 }
});
