// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createGuardianSession} from '../core/guardian-session.mjs';
import {createDebuggerGuardian} from '../core/debugger-guardian.mjs';
import {debuggerCommandCapability} from '../packages/atom/src/capabilities.mjs';
const registry=()=>createDebuggerGuardian({commandCapability:debuggerCommandCapability});
const request=tabId=>({tabId,origin:'http://127.0.0.1:4173',owner:'atom',capabilities:['read','override']});
async function attached(s,tabId=1){const {value:l}=await s.request('acquire',[request(tabId)]),{value:t}=await s.request('begin',[l,{kind:'attach'}]);await s.request('finish',[t,{ok:true}]);return l;}

test('session hides client authority and refuses actor-administration or cleanup injection as normal RPC',async()=>{
 const r=registry(),s=createGuardianSession({registry:r,executeCleanup:async()=>({status:'detached'})});await s.ready;
 for(const op of ['connect','disconnect','claimCleanup','finishCleanup','constructor'])await assert.rejects(s.request(op,[]),{code:'INVALID_PROTOCOL'});
 const result=await s.request('snapshot',[]);assert.equal(result.snapshot.clients,1);assert(!('token'in result));assert(!('client'in result));await s.close();
});
test('release waits for actual executor acknowledgement and preserves the closing lock meanwhile',async()=>{
 let resolve,entered;const started=new Promise(r=>entered=r),wait=new Promise(r=>resolve=r),r=registry();const s=createGuardianSession({registry:r,executeCleanup:async job=>{assert.deepEqual(job.actions,['Fetch.disable','detach']);entered();await wait;return{status:'detached'};}});await s.ready;const l=await attached(s);const release=s.request('release',[l]);await started;await assert.rejects(s.request('acquire',[request(1)]),{code:'BUSY'});resolve();assert.equal((await release).snapshot.leases.length,0);await s.close();
});
test('a new connection retires the prior lost client from live registry, without adopting it as a lease',async()=>{
 const r=registry(),old=createGuardianSession({registry:r,executeCleanup:async()=>({status:'detached'})});const l=await attached(old);await old.close();const jobs=[];const next=createGuardianSession({registry:r,executeCleanup:async j=>{jobs.push(j);return{status:'detached'};}});await next.ready;assert.equal(jobs.length,1);await assert.rejects(next.request('verify',[l,'read']),{code:'LEASE_EXPIRED'});const fresh=(await next.request('acquire',[request(1)])).value;assert.notEqual(fresh.leaseId,l.leaseId);await next.close();
});
test('failed detach stays closing and requires explicit retry before later acquisition',async()=>{
 const r=registry();let fail=true;const s=createGuardianSession({registry:r,executeCleanup:async()=>({status:fail?'failed':'detached'})});const l=await attached(s);const result=await s.request('release',[l]);assert.equal(result.snapshot.leases[0].cleanupBlocked,true);await assert.rejects(s.request('acquire',[request(1)]),{code:'BUSY'});fail=false;await s.request('retryCleanup',[l.leaseId]);assert.equal(r.snapshot().leases.length,0);await s.close();
});
test('port loss during cleanup does not report a failure or let its late acknowledgement clear another claim',async()=>{
 const r=registry();let release,entered;const wait=new Promise(r=>release=r),started=new Promise(r=>entered=r);const old=createGuardianSession({registry:r,executeCleanup:async()=>{entered();await wait;return{status:'detached'};}});const l=await attached(old),pending=old.request('release',[l]);await started;await old.close();const next=createGuardianSession({registry:r,executeCleanup:async()=>({status:'detached'})});await next.ready;await next.request('acquire',[request(1)]);release();await assert.rejects(pending,{code:'SESSION_CLOSED'});assert.equal(r.snapshot().leases[0].phase,'allocated');await next.close();
});
test('cleanup for a lost client never includes an active foreign connection',async()=>{
 const r=registry(),jobs=[],a=createGuardianSession({registry:r,executeCleanup:async()=>({status:'detached'})}),b=createGuardianSession({registry:r,executeCleanup:async j=>{jobs.push(j);return{status:'detached'};}});await attached(a,1);const foreign=await attached(b,2);await a.close();await b.drain();assert.deepEqual(jobs.map(j=>j.tabId),[1]);assert.equal((await b.request('verify',[foreign,'read'])).value,true);await b.close();
});
test('malformed executor acknowledgement closes the connection instead of fabricating a release',async()=>{
 const r=registry(),s=createGuardianSession({registry:r,executeCleanup:async()=>({status:'ok'})});const l=await attached(s);await assert.rejects(s.request('release',[l]));assert.equal(r.snapshot().leases[0].phase,'closing');assert.equal(r.snapshot().clients,0);const next=createGuardianSession({registry:r,executeCleanup:async()=>({status:'already-detached'})});await next.ready;assert.equal(r.snapshot().leases.length,0);await next.close();
});
test('asynchronous registry transport preserves the same explicit result/snapshot boundary',async()=>{
 const r=registry(),asyncRegistry=Object.fromEntries(Object.entries(r).map(([k,fn])=>[k,async(...args)=>fn(...args)]));const s=createGuardianSession({registry:asyncRegistry,executeCleanup:async()=>({status:'detached'})});await s.ready;const l=await attached(s);assert.equal((await s.request('status',[1,'atom'])).value,'owned');await s.request('release',[l]);await s.close();
});
test('closed sessions and accessor argument arrays never execute protocol getters',async()=>{
 const r=registry(),s=createGuardianSession({registry:r,executeCleanup:async()=>({status:'detached'})});await s.ready;let reads=0;const args=[];Object.defineProperty(args,'0',{enumerable:true,get(){reads++;return request(1);}});await assert.rejects(s.request('acquire',args),{code:'INVALID_PROTOCOL'});assert.equal(reads,0);await s.close();await assert.rejects(s.request('snapshot',[]),{code:'SESSION_CLOSED'});assert.equal(r.snapshot().clients,0);
});
