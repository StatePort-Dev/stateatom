// SPDX-License-Identifier: Apache-2.0
// Consumer-visible runtime ownership tests; synthetic external boundaries only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {actionTraceRuntimeFixture,deferred} from '../helpers/action-trace-runtime-fixture.mjs';
const createRuntime=process.env.ATOM_ACTION_RUNTIME_VARIANT?(await import(pathToFileURL(process.env.ATOM_ACTION_RUNTIME_VARIANT).href)).createAtomRuntime:undefined;
const fixture=(t,options={})=>actionTraceRuntimeFixture(t,{createRuntime,...options});

test('cancelled pending Arm A cannot cancel or publish over replacement view B after its late acknowledgement',async t=>{
 const entered=deferred(),ack=deferred(),oldCleanup=deferred();let first=true;
 t.after(()=>ack.resolve());
 const f=await fixture(t,{armGate:async()=>{if(first){first=false;entered.resolve();await ack.promise;}},onCleanup:id=>{if(id==='trace-1')oldCleanup.resolve();}});
 const abort=new AbortController(),a=f.request({op:'actions-arm'},{signal:abort.signal});
 await entered.promise;abort.abort();await assert.rejects(a,{code:'CANCELLED'});
 const b=await f.request({op:'actions-arm',ownerId:'view-b'});assert.equal(b.traceId,'trace-2');
 ack.resolve();
 // Its CDP cleanup is the last external boundary. Drain the ready continuations,
 // rather than depending on a guessed wall-clock delay after the raced reply.
 await oldCleanup.promise;await new Promise(setImmediate);
 const state=await f.state();assert.equal(state.actionTrace.traceId,'trace-2');assert.equal(state.actionTrace.status,'armed');
 const observed=await f.request({op:'actions-read',ownerId:'view-b',traceId:b.traceId});
 assert.equal(observed.traceId,'trace-2');assert.equal(observed.status,'armed');
 assert.equal((await f.state()).actionTrace.traceId,'trace-2');
});

test('late source verification of A cannot overwrite re-armed B or return a fresh old trace',async t=>{
 const entered=deferred(),verified=deferred();
 t.after(()=>verified.resolve());
 const f=await fixture(t,{sourceGate:async()=>{entered.resolve();await verified.promise;}});
 const a=await f.request({op:'actions-arm'});f.action();
 const reading=f.request({op:'actions-read',traceId:a.traceId});
 await entered.promise;
 const b=await f.request({op:'actions-arm'});assert.notEqual(b.traceId,a.traceId);
 verified.resolve();await assert.rejects(reading,{code:'STALE_TARGET'});
 const state=await f.state();assert.equal(state.actionTrace.traceId,b.traceId);assert.equal(state.actionTrace.status,'armed');
 assert.equal(state.actionTrace.sourceCurrent,false);
 const current=await f.request({op:'actions-read',traceId:b.traceId});assert.equal(current.traceId,b.traceId);
});

test('late source verification after a changed selection cannot resurrect the old observation',async t=>{
 const entered=deferred(),verified=deferred();
 t.after(()=>verified.resolve());
 const f=await fixture(t,{sourceGate:async()=>{entered.resolve();await verified.promise;}});
 const a=await f.request({op:'actions-arm'});f.action();
 const reading=f.request({op:'actions-read',traceId:a.traceId});await entered.promise;
 await f.request({op:'inspect-selector',selector:'#confirm'});
 verified.resolve();await assert.rejects(reading,{code:'STALE_TARGET'});
 const state=await f.state();assert.equal(state.actionTrace.freshness,'Stale');assert.equal(state.actionTrace.sourceCurrent,false);
 assert.equal(state.analysis.graph.nodes.some(n=>String(n.id).startsWith('action-trace:')),false);
});

test('destroyed and reused native MAIN context cannot accept a late Arm acknowledgement as current',async t=>{
 const entered=deferred(),ack=deferred();t.after(()=>ack.resolve());
 const f=await fixture(t,{armGate:async()=>{entered.resolve();await ack.promise;}});
 const pending=f.request({op:'actions-arm'});await entered.promise;
 await f.emit('Runtime.executionContextDestroyed',{executionContextId:7,executionContextUniqueId:'main-context'});
 await f.emit('Runtime.executionContextCreated',{context:{id:7,uniqueId:'replacement-context',auxData:{frameId:'main',isDefault:true}}});
 ack.resolve();await assert.rejects(pending,{code:'STALE_TARGET'});
 const stored=(await f.state()).actionTrace;
 assert(!stored||stored.freshness==='Stale');
});

test('native context destruction retires its owner and leaves stale history without blocking another view',async t=>{
 const f=await fixture(t);const a=await f.request({op:'actions-arm'});f.action();
 await f.request({op:'actions-read',traceId:a.traceId});
 await f.emit('Runtime.executionContextDestroyed',{executionContextId:7,executionContextUniqueId:'main-context'});
 const stored=(await f.state()).actionTrace;assert.equal(stored.freshness,'Stale');assert.equal(stored.sourceCurrent,false);
 await f.emit('Runtime.executionContextCreated',{context:{id:8,uniqueId:'new-main',auxData:{frameId:'main',isDefault:true}}});
 const b=await f.request({op:'actions-arm',ownerId:'view-b'});assert.equal(b.status,'armed');
});

for(const change of ['navigation','disconnect','unpair'])test(`late IDE response after ${change} cannot publish source-current history`,async t=>{
 const entered=deferred(),verified=deferred();t.after(()=>verified.resolve());
 const f=await fixture(t,{sourceGate:async()=>{entered.resolve();await verified.promise;}});
 const a=await f.request({op:'actions-arm'});f.action();
 const reading=f.request({op:'actions-read',traceId:a.traceId});const rejected=assert.rejects(reading,e=>['CANCELLED','STALE_TARGET','INSPECTOR_DISCONNECTED'].includes(e.code));await entered.promise;
 if(change==='navigation')await f.emit('Page.frameNavigated',{frame:{id:'main',loaderId:'next-loader',url:'http://127.0.0.1:4173/react/'}});
 else if(change==='disconnect')await f.client.close();
 else await f.request({op:'unpair'});
 verified.resolve();await rejected;
 const state=await f.state();assert(!state.actionTrace||state.actionTrace.freshness==='Stale');assert.notEqual(state.actionTrace?.sourceCurrent,true);
});

test('Cancel acknowledges captured body history without waiting for an IDE source check',async t=>{
 const entered=deferred(),verified=deferred();t.after(()=>verified.resolve());
 const f=await fixture(t,{sourceGate:async()=>{entered.resolve('source-check');await verified.promise;}});
 const a=await f.request({op:'actions-arm'});f.action();
 const cancelling=f.request({op:'actions-cancel',traceId:a.traceId});
 const first=await Promise.race([cancelling.then(()=> 'cancelled'),entered.promise]);
 assert.equal(first,'cancelled','local cleanup must not depend on an IDE response');
 const result=await cancelling;assert.equal(result.status,'cancelled');assert.equal(result.records[1].source.symbol,'confirm');assert.equal(result.sourceCurrent,false);
});

test('a late pre-Cancel read cannot republish acknowledged cancellation as complete or source-current',async t=>{
 const entered=deferred(),verified=deferred();t.after(()=>verified.resolve());
 const f=await fixture(t,{sourceGate:async()=>{entered.resolve();await verified.promise;}});
 const a=await f.request({op:'actions-arm'});f.action();
 const reading=f.request({op:'actions-read',traceId:a.traceId});await entered.promise;
 const cancelled=await f.request({op:'actions-cancel',traceId:a.traceId});assert.equal(cancelled.status,'cancelled');
 verified.resolve();await reading.catch(e=>assert.equal(e.code,'STALE_TARGET'));
 const stored=(await f.state()).actionTrace;assert.equal(stored.status,'cancelled');assert.equal(stored.sourceCurrent,false);
});

test('the owning view can clear retired stale history without another native operation',async t=>{
 const f=await fixture(t);const a=await f.request({op:'actions-arm'});f.action();await f.request({op:'actions-read',traceId:a.traceId});
 await f.request({op:'inspect-selector',selector:'#confirm'});
 const nativeBefore=f.calls.length,result=await f.request({op:'actions-clear',traceId:a.traceId});
 assert.equal(result.status,'cleared');assert.equal(result.traceId,null);assert.equal(result.records.length,0);
 assert.equal(f.calls.length,nativeBefore,'historical metadata cleanup must not enter a native context');
 const stored=(await f.state()).actionTrace;assert.equal(stored.status,'cleared');assert.equal(stored.records.length,0);
});

test('clearing old history cannot clear another view’s newer active observation',async t=>{
 const f=await fixture(t);const a=await f.request({op:'actions-arm'});await f.request({op:'inspect-selector',selector:'#confirm'});
 const b=await f.request({op:'actions-arm',ownerId:'view-b'});
 await assert.rejects(f.request({op:'actions-clear',traceId:a.traceId}),{code:'BUSY'});
 const current=await f.request({op:'actions-read',ownerId:'view-b',traceId:b.traceId});assert.equal(current.status,'armed');assert.equal(current.traceId,b.traceId);
});

test('only the matching view can clear the last retired trace even when its nonce is known',async t=>{
 const f=await fixture(t);const b=await f.request({op:'actions-arm',ownerId:'view-b'});f.action();await f.request({op:'actions-read',ownerId:'view-b',traceId:b.traceId});
 await f.request({op:'inspect-selector',selector:'#confirm'});
 await assert.rejects(f.request({op:'actions-clear',traceId:b.traceId}),{code:'STALE_TARGET'});
 assert.equal((await f.state()).actionTrace.records[1].source.symbol,'confirm');
 assert.equal((await f.request({op:'actions-clear',ownerId:'view-b',traceId:b.traceId})).status,'cleared');
});

test('a different nonce cannot clear or consume the authority for matching retired history',async t=>{
 const f=await fixture(t);const a=await f.request({op:'actions-arm'});await f.request({op:'inspect-selector',selector:'#confirm'});
 await assert.rejects(f.request({op:'actions-clear',traceId:'not-the-owned-trace'}),{code:'STALE_TARGET'});
 assert.equal((await f.request({op:'actions-clear',traceId:a.traceId})).status,'cleared');
});

for(const status of ['stale','stopped'])test(`helper ${status} stays historical through source verification and graph publication`,async t=>{
 const f=await fixture(t),a=await f.request({op:'actions-arm'});f.action();f.terminal(status);
 const result=await f.request({op:'actions-read',traceId:a.traceId});
 assert.equal(result.freshness,'Stale');assert.equal(result.sourceCurrent,false);assert.equal(f.sourceChecks,0);
 const graph=(await f.state()).analysis.graph;assert(graph.nodes.filter(n=>String(n.id).startsWith('action-trace:')).every(n=>n.status==='Stale'));
});

test('completed trace context retirement persists and notifies a root refresh',async t=>{
 const f=await fixture(t),messages=[];f.api.runtime.sendMessage=async m=>messages.push(m);
 const a=await f.request({op:'actions-arm'});f.action();await f.request({op:'actions-read',traceId:a.traceId});messages.length=0;
 await f.emit('Runtime.executionContextDestroyed',{executionContextId:7,executionContextUniqueId:'main-context'});
 assert(messages.some(m=>m.event==='state-invalidated'&&m.tabId===1));
 assert.equal(f.data['stateport.atom.v1.tabs'][1].actionTrace.freshness,'Stale');
});

test('replacement MAIN during native node resolution cannot arm a replacement collector',async t=>{
 const entered=deferred(),resolved=deferred();t.after(()=>resolved.resolve());
 const f=await fixture(t,{resolveGate:async()=>{entered.resolve();await resolved.promise;}}),pending=f.request({op:'actions-arm'});
 const rejected=assert.rejects(pending,e=>['STALE_TARGET','ACTION_TRACE_UNAVAILABLE'].includes(e.code));await entered.promise;
 f.setNativeContext('replacement-context');await f.emit('Runtime.executionContextDestroyed',{executionContextId:7,executionContextUniqueId:'main-context'});
 await f.emit('Runtime.executionContextCreated',{context:{id:7,uniqueId:'replacement-context',auxData:{frameId:'main',isDefault:true}}});resolved.resolve();await rejected;
 assert.equal(f.armCalls,0,'node resolved in reused numeric context must not invoke a replacement helper');
});
