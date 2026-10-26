// SPDX-License-Identifier: Apache-2.0
// Actual runtime over synthetic CDP, not browser buffering or performance proof.
import test from 'node:test';import assert from 'node:assert/strict';
import {inputCaptureRuntimeFixture} from '../helpers/input-capture-runtime-fixture.mjs';
const full={maxTotalBufferSize:2000000,maxResourceBufferSize:512000},passive={maxTotalBufferSize:0,maxResourceBufferSize:0};
function fixture(t,options){const f=inputCaptureRuntimeFixture(options);t.after(()=>f.runtime.shutdown());return f;}
const enables=f=>f.calls.filter(x=>x.m==='Network.enable').map(x=>x.p);
test('explicit passive attach preserves events without reserving unused body payloads',async t=>{
 const f=fixture(t);await f.request({op:'attach',readOnly:true});
 assert.deepEqual(enables(f),[passive]);
 await f.network(1);assert(!f.calls.some(x=>x.m==='Network.getResponseBody'));
 for(const method of ['Page.enable','Runtime.enable','Debugger.enable','Performance.enable'])assert(f.calls.some(x=>x.m===method),method);
 assert(!f.calls.some(x=>x.m==='Network.setCacheDisabled'||x.m==='Fetch.enable'));
});
test('repeat passive attach reapplies explicit zero budgets rather than browser defaults',async t=>{
 const f=fixture(t);await f.request({op:'attach',readOnly:true});await f.request({op:'attach',readOnly:true});await f.request({op:'attach',readOnly:true});assert.deepEqual(enables(f),[passive,passive,passive]);
});
test('host-selected read-only mode receives zero budgets even without caller flag',async t=>{
 const f=fixture(t),describe=f.platform.describeTarget;f.platform.describeTarget=async(...args)=>({...await describe(...args),readOnly:true});await f.request({op:'attach'});assert.equal((await f.request({op:'state'})).readOnly,true);assert.deepEqual(enables(f),[passive]);await f.network(1);assert(!f.calls.some(x=>x.m==='Network.getResponseBody'));
});
test('development retains exact bounded response-body capture on fresh and repeat attachment',async t=>{
 const f=fixture(t);await f.request({op:'attach'});await f.request({op:'attach'});assert.deepEqual(enables(f),[full,full]);await f.network(1);assert(f.calls.some(x=>x.m==='Network.getResponseBody'&&x.p.requestId==='q1'));assert(f.calls.some(x=>x.m==='Network.setCacheDisabled'&&x.p.cacheDisabled===true));
});
test('explicit detach permits fresh development budget after passive mode',async t=>{
 const f=fixture(t);await f.request({op:'attach',readOnly:true});await f.request({op:'detach'});await f.request({op:'attach'});assert.deepEqual(enables(f),[passive,full]);await f.network(1);assert(f.calls.some(x=>x.m==='Network.getResponseBody'));
});
test('buffer setup refusal remains an error before later domain enables',async t=>{
 const f=fixture(t,{send:async m=>{if(m==='Network.enable')throw Error('owned-buffer-refusal');}});await assert.rejects(f.request({op:'attach',readOnly:true}),/owned-buffer-refusal/);assert(!f.calls.some(x=>x.m==='Performance.enable'));assert(!f.calls.some(x=>x.m==='Network.getResponseBody'||x.m==='Fetch.enable'));
});
