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

test('explicit background refresh while picking retains native snapshot IDs clocks and evidence graph',async t=>{
 const f=inputCaptureRuntimeFixture({send:async(m,p)=>m==='DOM.resolveNode'?{object:{objectId:'node-'+p.nodeId}}:m==='DOMDebugger.getEventListeners'?{listeners:[{type:'click',scriptId:'native',lineNumber:1,columnNumber:2,once:true}]}:undefined});t.after(()=>f.runtime.shutdown());await f.inspect();
 const before=await f.request({op:'state'});assert(before.analysis.actionBindings.some(b=>b.registration?.snapshotId));const reads=f.calls.filter(c=>c.m==='DOMDebugger.getEventListeners').length;
 const started=await f.request({op:'pick',pickerId:'retain-native-history'});assert.equal(started.status,'picking');const selecting=await f.request({op:'state',refreshDeep:true});assert.deepEqual(selecting.analysis,before.analysis);assert.equal(f.calls.filter(c=>c.m==='DOMDebugger.getEventListeners').length,reads);
 await f.request({op:'cancel-pick',pickerId:started.id});const cancelled=await f.request({op:'state',refreshDeep:false});assert.deepEqual(cancelled.selection,before.selection);assert.deepEqual(cancelled.analysis,before.analysis);
});

test('manual inspection retires the prior picker choices and refinement authority',async t=>{
 const button={nodeId:3,backendNodeId:103,nodeType:1,nodeName:'BUTTON',localName:'button',attributes:['id','confirm','disabled','']};
 const root={nodeId:1,backendNodeId:101,nodeType:9,children:[{nodeId:2,backendNodeId:102,nodeType:1,nodeName:'BODY',localName:'body',attributes:[],children:[button]}]};
 const f=inputCaptureRuntimeFixture({send:async(m)=>m==='DOM.getDocument'?{root}:m==='DOM.pushNodesByBackendIdsToFrontend'?{nodeIds:[3]}:undefined});t.after(()=>f.runtime.shutdown());await f.inspect();
 const pick=await f.request({op:'pick',pickerId:'prior-element'});await f.emit('Overlay.inspectNodeRequested',{backendNodeId:103});
 let before;for(let i=0;i<50;i++){before=await f.request({op:'state'});if(before.picker.status==='selected')break;await new Promise(r=>setTimeout(r,0));}
 assert.equal(before.picker.status,'selected');assert(before.picker.choices.length>1);
 await f.request({op:'inspect-selector',selector:'#confirm'});const after=await f.request({op:'state'});
 assert.equal(after.picker.status,'cancelled');assert.deepEqual(after.picker.choices,[]);assert.equal(after.selection.selector,'#confirm');assert(after.analysis);
 await assert.rejects(f.request({op:'refine-pick',pickerId:pick.id,index:1}),/expired|select again/i);
});

test('manual selection cancels picking before inspection and late picker events cannot replace it',async t=>{
 const f=inputCaptureRuntimeFixture();t.after(()=>f.runtime.shutdown());await f.inspect();await f.request({op:'pick',pickerId:'pending-manual'});
 await f.request({op:'inspect-selector',selector:'#confirm'});const before=await f.request({op:'state'});assert.equal(before.picker.status,'cancelled');
 await f.emit('Overlay.inspectNodeRequested',{backendNodeId:103});const after=await f.request({op:'state'});assert.deepEqual(after.selection,before.selection);assert.equal(after.inspectionGeneration,before.inspectionGeneration);assert.deepEqual(after.picker.choices,[]);
});

test('failed picker cleanup refuses a new manual inspection instead of keeping two selection authorities',async t=>{
 let refuse=false;const f=inputCaptureRuntimeFixture({send:async m=>{if(refuse&&m==='Overlay.hideHighlight')throw Error('cleanup unavailable');}});t.after(async()=>{refuse=false;await f.runtime.shutdown();});await f.inspect();await f.request({op:'pick',pickerId:'cleanup-fails'});const before=await f.request({op:'state'}),scripts=f.calls.filter(c=>c.m==='SCRIPT').length;refuse=true;
 await assert.rejects(f.request({op:'inspect-selector',selector:'#confirm'}),/cleanup unavailable/);assert.equal(f.calls.filter(c=>c.m==='SCRIPT').length,scripts);const after=await f.request({op:'state'});assert.equal(after.inspectionGeneration,before.inspectionGeneration);assert.deepEqual(after.picker.choices,[]);assert.equal(after.picker.status,'unsupported');
});
