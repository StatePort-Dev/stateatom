// SPDX-License-Identifier: Apache-2.0
import test from'node:test';import assert from'node:assert/strict';
import{registryDispatcher,registryClient}from'../core/guardian-worker-wire.mjs';
import{createGuardianSession}from'../core/guardian-session.mjs';
import{createDebuggerGuardian}from'../core/debugger-guardian.mjs';
import{debuggerCommandCapability}from'../packages/atom/src/capabilities.mjs';
const options=tabId=>({tabId,origin:'http://127.0.0.1:4173',owner:'atom',capabilities:['read']});
function fixture({timeout=1000}={}){
 const actor=createDebuggerGuardian({commandCapability:debuggerCommandCapability}),calls=[],messages=[],listeners=new Map(),held=[];let dead=false,hold=false,transform=x=>x;
 const registry=Object.fromEntries(Object.entries(actor).map(([op,fn])=>[op,(...args)=>{calls.push(op);return fn(...args);}])) ,dispatch=registryDispatcher(registry);
 const deliver=m=>{if(!dead)listeners.get('message')?.({data:transform(dispatch(m))});};
 const worker={addEventListener:(type,fn)=>listeners.set(type,fn),removeEventListener:type=>listeners.delete(type),postMessage:m=>{messages.push(m);queueMicrotask(()=>{if(hold)held.push(()=>deliver(m));else deliver(m);});},terminate:()=>{dead=true;}};
 return{actor,registry,calls,messages,dispatch,client:registryClient(worker,{timeout}),hold:()=>{hold=true;},resume:()=>{hold=false;for(const fn of held.splice(0))fn();},transform:fn=>{transform=fn;}};
}
async function lease(f){const client=await f.client.connect(),cap=await f.client.acquire(client,options(1));return{client,cap};}
test('one fast request performs the same live verify then a fresh snapshot in one dispatcher turn',async t=>{
 const f=fixture();t.after(()=>f.client.close());const {client,cap}=await lease(f);f.messages.length=0;f.calls.length=0;const result=await f.client.verifyWithSnapshot(client,cap,'read');
 assert.deepEqual(f.calls,['verify','snapshot']);assert.equal(f.messages.length,1);assert.equal(f.messages[0].op,'verify');assert.equal(f.messages[0].withSnapshot,true);assert.equal(result.value,true);assert.deepEqual(result.snapshot,f.actor.snapshot());assert(!JSON.stringify(result.snapshot).includes(cap.token));
});
test('session fast path keeps result boundary and snapshots new foreign state rather than a cached view',async t=>{
 const f=fixture(),s=createGuardianSession({registry:f.client,executeCleanup:async()=>({status:'detached'})});t.after(()=>f.client.close());await s.ready;const cap=(await s.request('acquire',[options(1)])).value,foreign=f.actor.connect();f.actor.acquire(foreign,{...options(2),owner:'other'});f.messages.length=0;f.calls.length=0;
 const reply=await s.request('verify',[cap,'read']);assert.equal(reply.value,true);assert.equal(reply.snapshot.leases.length,2);assert.deepEqual(f.calls,['verify','snapshot']);assert.equal(f.messages.length,1);assert.equal(f.messages[0].withSnapshot,true);await s.close();
});
test('wrong grant, expired lease and expired client retain exact rejection and do not take a success snapshot',async t=>{
 for(const cause of ['grant','lease','client']){const f=fixture();t.after(()=>f.client.close());const {client,cap}=await lease(f);if(cause==='lease')f.actor.release(client,cap);if(cause==='client')f.actor.disconnect(client);f.calls.length=0;await assert.rejects(f.client.verifyWithSnapshot(client,cap,cause==='grant'?'override':'read'),{code:cause==='grant'?'CAPABILITY_DENIED':cause==='lease'?'LEASE_EXPIRED':'CLIENT_EXPIRED'});assert.deepEqual(f.calls,['verify']);}
});
test('legacy plain verify and registry without fast method retain original values and two-call fallback',async t=>{
 const f=fixture();t.after(()=>f.client.close());const {client,cap}=await lease(f);f.messages.length=0;assert.equal(await f.client.verify(client,cap,'read'),true);assert.equal(f.messages[0].withSnapshot,undefined);
 const actor=createDebuggerGuardian({commandCapability:debuggerCommandCapability}),calls=[],registry=Object.fromEntries(Object.entries(actor).map(([op,fn])=>[op,async(...args)=>{calls.push(op);return fn(...args);}])) ,s=createGuardianSession({registry,executeCleanup:async()=>({status:'detached'})});await s.ready;const own=(await s.request('acquire',[options(1)])).value;calls.length=0;const reply=await s.request('verify',[own,'read']);assert.deepEqual(calls,['verify','snapshot']);assert.equal(reply.value,true);assert.deepEqual(reply.snapshot,actor.snapshot());await s.close();
});
test('fast flag is only own data true on verify and accessor never executes before rejection',()=>{
 for(const flag of [false,null,'true','getter']){const f=fixture();let reads=0;const request={version:1,id:1,op:'verify',args:[]};if(flag==='getter')Object.defineProperty(request,'withSnapshot',{enumerable:true,get(){reads++;return true;}});else request.withSnapshot=flag;const reply=f.dispatch(request);assert.equal(reply.ok,false);assert.equal(reply.code,'INVALID_PROTOCOL');assert.equal(reads,0);assert.deepEqual(f.calls,[]);f.client.close();}
 const f=fixture();assert.equal(f.dispatch({version:1,id:1,op:'connect',args:[],withSnapshot:true}).ok,false);assert.equal(f.actor.snapshot().clients,0);f.client.close();
});
test('malformed or legacy fast reply closes transport and rejects this and other pending calls',async()=>{
 for(const value of [true,{value:false,snapshot:{}},{value:true,snapshot:null},{value:true,snapshot:[]},{value:true,snapshot:{},extra:'unknown'}]){const f=fixture();const {client,cap}=await lease(f);f.hold();f.transform(reply=>({...reply,value}));const fast=f.client.verifyWithSnapshot(client,cap,'read'),other=f.client.snapshot(),checks=Promise.all([assert.rejects(fast,{code:'REGISTRY_LOST'}),assert.rejects(other,{code:'REGISTRY_LOST'})]);await Promise.resolve();f.resume();await checks;await assert.rejects(f.client.snapshot(),{code:'REGISTRY_LOST'});f.client.close();}
});
test('fast verification uses the same channel timeout and loses all outstanding requests',async()=>{
 const f=fixture({timeout:20}),{client,cap}=await lease(f);f.hold();await Promise.all([assert.rejects(f.client.verifyWithSnapshot(client,cap,'read'),{code:'REGISTRY_LOST'}),assert.rejects(f.client.snapshot(),{code:'REGISTRY_LOST'})]);f.resume();f.client.close();
});
test('session close after fast verification started rejects a late snapshot instead of publishing it current',{timeout:1000},async()=>{
 const actor=createDebuggerGuardian({commandCapability:debuggerCommandCapability});let entered,release;const started=new Promise(r=>entered=r),gate=new Promise(r=>release=r),registry={...actor,async verifyWithSnapshot(...args){const value=actor.verify(...args),snapshot=actor.snapshot();entered();await gate;return{value,snapshot};}},s=createGuardianSession({registry,executeCleanup:async()=>({status:'detached'})});await s.ready;const cap=(await s.request('acquire',[options(1)])).value,pending=s.request('verify',[cap,'read']);await started;await s.close();release();await assert.rejects(pending,{code:'SESSION_CLOSED'});assert.equal(actor.snapshot().clients,0);
});

test('snapshot failure after successful live verify remains a failed request with original code',async t=>{
 const f=fixture();t.after(()=>f.client.close());const {client,cap}=await lease(f);f.calls.length=0;f.registry.snapshot=()=>{f.calls.push('snapshot');throw Object.assign(Error('snapshot unavailable'),{code:'SNAPSHOT_FAILED'});};await assert.rejects(f.client.verifyWithSnapshot(client,cap,'read'),{code:'SNAPSHOT_FAILED'});assert.deepEqual(f.calls,['verify','snapshot']);
});
test('fast flag cannot bypass sequence or serialized size admission',()=>{
 for(const request of [{version:1,id:2,op:'verify',args:[],withSnapshot:true},{version:1,id:1,op:'verify',args:['x'.repeat(131072)],withSnapshot:true}]){const f=fixture();const reply=f.dispatch(request);assert.equal(reply.ok,false);assert.equal(reply.code,'INVALID_PROTOCOL');assert.deepEqual(f.calls,[]);f.client.close();}
});
test('fast and ordinary requests share the same64pending budget and close rejects all admitted requests',async()=>{
 const f=fixture(),{client,cap}=await lease(f);f.hold();const pending=Array.from({length:64},()=>f.client.verifyWithSnapshot(client,cap,'read')),checks=Promise.all(pending.map(p=>assert.rejects(p,{code:'REGISTRY_LOST'})));await assert.rejects(f.client.snapshot(),{code:'BUSY'});f.client.close();await checks;f.resume();
});
