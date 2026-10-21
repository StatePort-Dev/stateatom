// SPDX-License-Identifier: Apache-2.0
// A01 retained picker-start regression; real runtime/platform on synthetic CDP.
import test from 'node:test';
import assert from 'node:assert/strict';
import {inputCaptureRuntimeFixture} from '../helpers/input-capture-runtime-fixture.mjs';
import {inspectionView} from '../../browser-extension/inspection-view.mjs';
const globalRequest=(f,payload)=>f.runtime.request({version:1,id:crypto.randomUUID(),session:'inputs-runtime',payload});

test('native picker retains original history for Cancel while its display hides the previous target',async t=>{
 const f=inputCaptureRuntimeFixture();t.after(()=>f.runtime.shutdown());await f.inspect();
 const before=await f.request({op:'state'});assert.equal(before.selection.selector,'#confirm');assert(before.analysis);
 const saved=await f.request({op:'save-diagnostic',notes:'Original selected occurrence'}),original=await globalRequest(f,{op:'open-handoff',id:saved.id});
 const started=await f.request({op:'pick',pickerId:'a01-new-selection'});assert.equal(started.status,'picking');
 const selecting=await f.request({op:'state'});assert.deepEqual(selecting.selection,before.selection);assert.deepEqual(selecting.analysis,before.analysis);assert.equal(selecting.property,'disabled');assert.equal(selecting.inspectionGeneration,before.inspectionGeneration);assert.equal(inspectionView(selecting).target,null);
 assert.equal((await globalRequest(f,{op:'open-handoff',id:saved.id})).raw,original.raw);
 await f.request({op:'cancel-pick',pickerId:started.id});const cancelled=await f.request({op:'state'});assert.deepEqual(cancelled.selection,before.selection);assert.deepEqual(cancelled.analysis,before.analysis);assert.deepEqual(inspectionView(cancelled).target,before.selection);
 await f.request({op:'inspect-selector',selector:'#confirm'});const fresh=await f.request({op:'state'});assert.equal(fresh.selection.selector,'#confirm');assert.equal(fresh.selection.property,'disabled');assert(fresh.analysis);assert(fresh.inspectionGeneration>selecting.inspectionGeneration);
 assert.equal((await globalRequest(f,{op:'open-handoff',id:saved.id})).raw,original.raw);
});

test('pending and failed native admission cannot rewrite the prior snapshot',async t=>{
 let pending=false,release,entered,outcome;const gate=new Promise(r=>release=r),started=new Promise(r=>entered=r);
 const f=inputCaptureRuntimeFixture({send:async method=>{if(pending&&method==='DOM.getDocument'){entered();await gate;return{};}}});t.after(async()=>{release();await outcome;await f.runtime.shutdown();});await f.inspect();const before=await f.request({op:'state'});assert(before.selection);pending=true;
 outcome=f.request({op:'pick',pickerId:'a01-pending-selection'}).then(value=>({value}),error=>({error}));await started;
 const during=await f.request({op:'state'});assert.deepEqual(during.selection,before.selection);assert.deepEqual(during.analysis,before.analysis);assert.equal(during.property,'disabled');assert.equal(inspectionView(during).target,null);
 release();assert.match((await outcome).error.message,/Native document unavailable/);const failed=await f.request({op:'state'});assert.equal(failed.picker.status,'unsupported');assert.deepEqual(failed.selection,before.selection);assert.deepEqual(failed.analysis,before.analysis);assert.equal(failed.property,'disabled');
});
