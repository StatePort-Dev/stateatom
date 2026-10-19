// SPDX-License-Identifier: Apache-2.0
// Inert live-authority actor; acknowledgements here are harness data, not Chrome proof.
import test from 'node:test';import assert from 'node:assert/strict';
import {createDebuggerGuardian} from '../core/debugger-guardian.mjs';
import {debuggerCommandCapability} from '../packages/atom/src/capabilities.mjs';
const create=()=>createDebuggerGuardian({commandCapability:debuggerCommandCapability,now:()=>100});
const request=(tabId=1,capabilities=['read','override'],owner='atom')=>({tabId,origin:'http://127.0.0.1:4173',owner,capabilities});
const fixture=(grants)=>{const g=create(),client=g.connect(),lease=g.acquire(client,request(1,grants));return{g,client,lease};};
const attach=f=>{const t=f.g.begin(f.client,f.lease,{kind:'attach'});f.g.finish(f.client,t,{ok:true});return f;};
const denied=(fn,code)=>assert.throws(fn,e=>e?.code===code);

test('construction starts empty and refuses imported authority or caller-supplied registry state',()=>{
 const g=create();assert.deepEqual(g.snapshot().leases,[]);assert.deepEqual(g.claimCleanup(g.connect()),[]);denied(()=>createDebuggerGuardian({commandCapability:debuggerCommandCapability,restored:{leases:[{}]}}),'INVALID_PROTOCOL');
});
test('connection and lease tokens are fresh immutable capabilities, absent from redacted snapshots',()=>{
 const f=fixture(),other=f.g.connect();assert.notEqual(f.client.clientId,other.clientId);assert.notEqual(f.client.token,other.token);assert(Object.isFrozen(f.client));assert(Object.isFrozen(f.lease.capabilities));const text=JSON.stringify(f.g.snapshot());assert(!text.includes(f.client.token));assert(!text.includes(f.lease.token));assert.equal(f.g.status(f.client,1,'atom'),'owned');assert.equal(f.g.status(other,1,'atom'),'foreign');assert.equal(f.g.status(f.client,1,'capture'),'foreign');
});
test('same owner label and same client never adopt an existing allocation',()=>{
 const f=fixture(),other=f.g.connect(),before=f.g.snapshot();denied(()=>f.g.acquire(f.client,request()),'BUSY');denied(()=>f.g.acquire(other,request()),'BUSY');assert.deepEqual(f.g.snapshot(),before);
});
test('forged client, lease, tab, guardian and grants cannot widen authority',()=>{
 const f=fixture();for(const c of [{...f.client,token:'forged'},{...f.client,guardianId:'other'}])denied(()=>f.g.verify(c,f.lease,'read'),'CLIENT_EXPIRED');
 for(const l of [{...f.lease,token:'forged'},{...f.lease,tabId:2},{...f.lease,owner:'capture'},{...f.lease,capabilities:['read','cache','override']}])denied(()=>f.g.verify(f.client,l,'read'),'LEASE_EXPIRED');denied(()=>f.g.verify(f.client,f.lease,'cache'),'CAPABILITY_DENIED');assert.equal(f.g.verify(f.client,f.lease,'read'),true);
});
test('exclusive allocation validates exact origin/tab/grants and never coerces objects',()=>{
 const g=create(),c=g.connect();for(const patch of [{tabId:0},{tabId:1.5},{origin:'http://127.0.0.1:4173/path'},{origin:'http://name:secret@127.0.0.1:4173'},{origin:'data:text/plain,x'},{owner:''},{capabilities:['override']},{capabilities:['read','eval']},{capabilities:['read','read']},{capabilities:Array(2)}])denied(()=>g.acquire(c,{...request(),...patch}),'INVALID_PROTOCOL');assert.equal(g.snapshot().leases.length,0);
});
test('commands wait for acknowledged attachment and exact actual method grants',()=>{
 const f=fixture(['read']);denied(()=>f.g.begin(f.client,f.lease,{kind:'command',method:'DOM.getDocument'}),'LEASE_REQUIRED');attach(f);const t=f.g.begin(f.client,f.lease,{kind:'command',method:'DOM.getDocument'});f.g.finish(f.client,t,{ok:true});for(const method of ['Fetch.enable','Storage.clearDataForOrigin','Runtime.callFunctionOn','Runtime.evaluate'])denied(()=>f.g.begin(f.client,f.lease,{kind:'command',method}),'CAPABILITY_DENIED');assert.equal(f.g.snapshot().inFlight,0);
});
test('known failed native attachment can retry or release without a foreign detach',()=>{
 const f=fixture();let t=f.g.begin(f.client,f.lease,{kind:'attach'});denied(()=>f.g.begin(f.client,f.lease,{kind:'attach'}),'BUSY');f.g.finish(f.client,t,{ok:false});assert.equal(f.g.release(f.client,f.lease).phase,'released');assert.deepEqual(f.g.claimCleanup(f.client),[]);const l=f.g.acquire(f.client,request());t=f.g.begin(f.client,l,{kind:'attach'});f.g.finish(f.client,t,{ok:true});assert.equal(f.g.verify(f.client,l,'override'),true);
});
test('unused allocations release directly; pending attachment is unknown and requires cleanup',()=>{
 const f=fixture();assert.equal(f.g.release(f.client,f.lease).phase,'released');const l=f.g.acquire(f.client,request());f.g.begin(f.client,l,{kind:'attach'});f.g.release(f.client,l);const jobs=f.g.claimCleanup(f.client);assert.equal(jobs.length,1);assert.equal(jobs[0].nativeState,'unknown');assert(jobs[0].actions.includes('detach'));denied(()=>f.g.acquire(f.client,request()),'BUSY');
});
test('disconnect revokes only that client and never queues an active foreign lease',()=>{
 const f=attach(fixture()),c=f.g.connect(),foreign=f.g.acquire(c,request(2,['read'],'capture'));f.g.finish(c,f.g.begin(c,foreign,{kind:'attach'}),{ok:true});f.g.disconnect(f.client);denied(()=>f.g.verify(f.client,f.lease,'read'),'CLIENT_EXPIRED');assert.equal(f.g.verify(c,foreign,'read'),true);const jobs=f.g.claimCleanup(c);assert.deepEqual(jobs.map(j=>j.tabId),[1]);assert.equal(f.g.status(c,2,'capture'),'owned');
});
test('cleanup grants contain fixed owned teardown actions, never ordinary mutation authority',()=>{
 const f=attach(fixture(['read','override','cache']));f.g.release(f.client,f.lease);const [job]=f.g.claimCleanup(f.client);assert.deepEqual(job.actions,['Fetch.disable','Network.setCacheDisabled:false','detach']);denied(()=>f.g.verify(f.client,job,'override'),'INVALID_PROTOCOL');const text=JSON.stringify(job);assert(!text.includes('reload'));assert(!text.includes('clearData'));assert(!text.includes('Runtime.'));assert.equal(job.tabId,1);
 const readonly=attach(fixture(['read']));readonly.g.release(readonly.client,readonly.lease);assert.deepEqual(readonly.g.claimCleanup(readonly.client)[0].actions,['detach']);
});
test('closing lock survives a failed cleanup and explicit retry cannot target active foreign ownership',()=>{
 const f=attach(fixture()),executor=f.g.connect();f.g.release(f.client,f.lease);const [j]=f.g.claimCleanup(executor);f.g.finishCleanup(executor,j,{status:'failed'});assert.deepEqual(f.g.claimCleanup(executor),[]);denied(()=>f.g.acquire(executor,request()),'BUSY');f.g.retryCleanup(executor,f.lease.leaseId);const [again]=f.g.claimCleanup(executor);assert.notEqual(again.token,j.token);f.g.finishCleanup(executor,again,{status:'detached'});assert.equal(f.g.status(executor,1,'atom'),'none');const live=f.g.acquire(executor,request());denied(()=>f.g.retryCleanup(f.client,live.leaseId),'LEASE_ACTIVE');
});
test('cleanup can be claimed once and only by its current executor',()=>{
 const f=attach(fixture()),executor=f.g.connect();f.g.release(f.client,f.lease);const [j]=f.g.claimCleanup(executor);assert.deepEqual(f.g.claimCleanup(f.client),[]);denied(()=>f.g.finishCleanup(f.client,j,{status:'detached'}),'STALE_CLEANUP');const bad={...j,token:'fake'};denied(()=>f.g.finishCleanup(executor,bad,{status:'detached'}),'STALE_CLEANUP');f.g.finishCleanup(executor,j,{status:'already-detached'});denied(()=>f.g.finishCleanup(executor,j,{status:'detached'}),'STALE_CLEANUP');
});
test('executor loss rotates cleanup authority; old acknowledgements cannot release a newer lease',()=>{
 const f=attach(fixture()),old=f.g.connect(),next=f.g.connect();f.g.disconnect(f.client);const [j]=f.g.claimCleanup(old);f.g.disconnect(old);const [k]=f.g.claimCleanup(next);assert.notEqual(k.token,j.token);denied(()=>f.g.finishCleanup(old,j,{status:'detached'}),'CLIENT_EXPIRED');f.g.finishCleanup(next,k,{status:'detached'});const l=f.g.acquire(next,request());denied(()=>f.g.finishCleanup(next,k,{status:'detached'}),'STALE_CLEANUP');assert.equal(f.g.verify(next,l,'read'),true);
});
test('pending command acknowledgements cannot revive a released investigation or another incarnation',()=>{
 const f=attach(fixture()),t=f.g.begin(f.client,f.lease,{kind:'command',method:'Fetch.enable'});f.g.release(f.client,f.lease);denied(()=>f.g.finish(f.client,t,{ok:true}),'STALE_OPERATION');const [j]=f.g.claimCleanup(f.client);assert.equal(j.abandonedOperations,1);f.g.finishCleanup(f.client,j,{status:'detached'});const l=f.g.acquire(f.client,request());assert.notEqual(l.leaseId,f.lease.leaseId);denied(()=>f.g.verify(f.client,f.lease,'read'),'LEASE_EXPIRED');assert.equal(f.g.verify(f.client,l,'read'),true);
});
test('command failure retains native ownership and single-use tickets cannot be replayed',()=>{
 const f=attach(fixture()),t=f.g.begin(f.client,f.lease,{kind:'command',method:'Fetch.enable'});f.g.finish(f.client,t,{ok:false});denied(()=>f.g.finish(f.client,t,{ok:true}),'STALE_OPERATION');assert.equal(f.g.verify(f.client,f.lease,'read'),true);f.g.release(f.client,f.lease);assert.equal(f.g.claimCleanup(f.client).length,1);
});
test('client/lease/operation budgets refuse before partial allocation or dropped authority',()=>{
 const g=create(),clients=Array.from({length:8},()=>g.connect());denied(()=>g.connect(),'CLIENT_LIMIT');for(let i=1;i<=16;i++)g.acquire(clients[0],request(i));const before=g.snapshot();denied(()=>g.acquire(clients[0],request(17)),'LEASE_LIMIT');assert.deepEqual(g.snapshot(),before);
 const f=attach(fixture());for(let i=0;i<32;i++)f.g.begin(f.client,f.lease,{kind:'command',method:'DOM.getDocument'});const snapshot=f.g.snapshot();denied(()=>f.g.begin(f.client,f.lease,{kind:'command',method:'DOM.getDocument'}),'OPERATION_LIMIT');assert.deepEqual(f.g.snapshot(),snapshot);
});
test('global operation limit is independent from per-lease command limits',()=>{
 const g=create(),c=g.connect();for(let n=1;n<=4;n++){const l=g.acquire(c,request(n));g.finish(c,g.begin(c,l,{kind:'attach'}),{ok:true});for(let i=0;i<32;i++)g.begin(c,l,{kind:'command',method:'DOM.getDocument'});}const l=g.acquire(c,request(5));denied(()=>g.begin(c,l,{kind:'attach'}),'OPERATION_LIMIT');assert.equal(g.snapshot().inFlight,128);
});
test('snapshots are detached and event retention reports loss explicitly without leaking tokens',()=>{
 const g=create(),c=g.connect();for(let i=0;i<80;i++){const l=g.acquire(c,request());g.release(c,l);}const s=g.snapshot();assert.equal(s.events.length,128);assert(s.droppedEvents>0);assert(!JSON.stringify(s).includes(c.token));s.leases.push({tabId:99});s.events[0].kind='forged';assert.equal(g.snapshot().leases.length,0);assert.notEqual(g.snapshot().events[0].kind,'forged');
});
test('repeated disconnect is idempotent and cannot disconnect a new client by label',()=>{
 const f=fixture();f.g.disconnect(f.client);const c=f.g.connect(),before=f.g.snapshot();f.g.disconnect(f.client);assert.deepEqual(f.g.snapshot(),before);const l=f.g.acquire(c,request());assert.equal(f.g.verify(c,l,'read'),true);
});
test('accessors and conversion hooks in protocol records are never executed',()=>{
 const f=fixture();let reads=0;const c={...f.client};Object.defineProperty(c,'token',{enumerable:true,get(){reads++;return f.client.token;}});denied(()=>f.g.verify(c,f.lease,'read'),'INVALID_PROTOCOL');const r=request(2);Object.defineProperty(r,'origin',{enumerable:true,get(){reads++;return request().origin;}});denied(()=>f.g.acquire(f.client,r),'INVALID_PROTOCOL');denied(()=>f.g.begin(f.client,f.lease,{kind:{toString(){reads++;return'attach';}}}),'INVALID_PROTOCOL');assert.equal(reads,0);
});
test('protocol rejects extra executor-supplied operations, unknown outcomes and sparse grants',()=>{
 const f=attach(fixture());denied(()=>f.g.begin(f.client,f.lease,{kind:'command',method:'DOM.getDocument',eval:'unsafe'}),'INVALID_PROTOCOL');f.g.release(f.client,f.lease);const [j]=f.g.claimCleanup(f.client),before=f.g.snapshot();denied(()=>f.g.finishCleanup(f.client,j,{status:'success'}),'INVALID_PROTOCOL');assert.deepEqual(f.g.snapshot(),before);
});
test('cleanup capability identity survives harmless JSON key ordering without accepting changed actions',()=>{
 const f=attach(fixture());f.g.release(f.client,f.lease);const [j]=f.g.claimCleanup(f.client),reordered=Object.fromEntries(Object.entries(j).reverse());assert.equal(f.g.finishCleanup(f.client,reordered,{status:'detached'}).phase,'released');
});
test('a live foreign lease cannot be released, used or submitted for cleanup by another connected client',()=>{
 const f=attach(fixture()),other=f.g.connect(),before=f.g.snapshot();denied(()=>f.g.release(other,f.lease),'LEASE_EXPIRED');denied(()=>f.g.begin(other,f.lease,{kind:'command',method:'Fetch.disable'}),'LEASE_EXPIRED');assert.deepEqual(f.g.claimCleanup(other),[]);assert.deepEqual(f.g.snapshot(),before);
});
test('default constructor never infers a native command grant from a method name',()=>{
 const g=createDebuggerGuardian(),client=g.connect(),lease=g.acquire(client,request());g.finish(client,g.begin(client,lease,{kind:'attach'}),{ok:true});denied(()=>g.begin(client,lease,{kind:'command',method:'DOM.getDocument'}),'CAPABILITY_DENIED');
});
