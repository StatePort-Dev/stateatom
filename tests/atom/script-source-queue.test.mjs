// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createScriptSourceQueue} from '../../packages/atom/src/script-source-queue.mjs';
const tick=()=>new Promise(r=>setImmediate(r));
test('cancelled waiting reads reclaim finite capacity without starting work',async()=>{
 const queue=createScriptSourceQueue();let release;const gate=new Promise(r=>release=r),active=Array.from({length:4},()=>queue(()=>gate));
 const c=new AbortController();let calls=0;const pending=Array.from({length:256},()=>queue(()=>{calls++;},{signal:c.signal}).catch(e=>e.code));
 try{await assert.rejects(queue(()=>{}),{code:'SOURCE_READ_LIMIT'});c.abort();
  assert.equal(await Promise.race([Promise.all(pending).then(()=>true),tick().then(()=>false)]),true,'cancel must reclaim queued jobs without waiting for active native reads');
  const live=queue(()=>{calls++;});release();await Promise.all([...active,live]);assert.equal(calls,1);assert((await Promise.all(pending)).every(c=>c==='CANCELLED'));
 }finally{release();await Promise.all(active);}
});
test('already-aborted or invalidated waiting work never runs and listeners are removed',async()=>{
 const queue=createScriptSourceQueue(),c=new AbortController();let calls=0;c.abort();await assert.rejects(queue(()=>{calls++;},{signal:c.signal}),{code:'CANCELLED'});assert.equal(calls,0);
 let release,live=true,added=0,removed=0;const gate=new Promise(r=>release=r),active=Array.from({length:4},()=>queue(()=>gate));
 const d=new AbortController(),signal=d.signal,add=signal.addEventListener.bind(signal),remove=signal.removeEventListener.bind(signal);
 signal.addEventListener=(...args)=>{added++;return add(...args);};signal.removeEventListener=(...args)=>{removed++;return remove(...args);};
 const pending=queue(()=>{calls++;},{signal,assertCurrent:()=>{if(!live)throw Error('Map replaced');}});const rejected=assert.rejects(pending,/Map replaced/);live=false;release();await Promise.all(active);await rejected;assert.equal(calls,0);assert.equal(added,removed);
});
