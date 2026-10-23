// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createObservationPublisher} from '../../packages/atom/src/observation-publisher.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const turn=()=>new Promise(setImmediate);
test('burst shares one flight and publishes only after latest current-state follow-up',async()=>{
 const gate=deferred(),saved=[],notices=[];let current=1;
 const publish=createObservationPublisher({persist:async()=>{const value=current;saved.push(value);if(saved.length===1)await gate.promise;},notify:()=>notices.push(current)});
 const first=publish();for(current=2;current<=20;current++)assert.equal(publish(),first);current=20;
 assert.deepEqual(saved,[1]);assert.deepEqual(notices,[]);gate.resolve();await first;assert.deepEqual(saved,[1,20]);assert.deepEqual(notices,[20]);
 await publish();assert.deepEqual(saved,[1,20,20]);assert.deepEqual(notices,[20,20]);
});
test('request during final notice or after awaited settlement is never lost',async()=>{
 let writes=0,notices=0,again;const publish=createObservationPublisher({persist:async()=>{writes++;},notify:()=>{if(++notices===1)again=publish();}});
 const first=publish();await first;assert.equal(again,first);assert.equal(writes,2);assert.equal(notices,2);await publish();assert.equal(writes,3);assert.equal(notices,3);
});
test('failed save rejects without notification or an automatic retry loop and permits later request',async()=>{
 let writes=0,notices=0;const error=new Error('storage unavailable'),publish=createObservationPublisher({persist:async()=>{if(++writes===1)throw error;},notify:()=>notices++});
 await assert.rejects(publish(),e=>e===error);await turn();assert.equal(writes,1);assert.equal(notices,0);await publish();assert.equal(writes,2);assert.equal(notices,1);
});
test('a later dirty request during a failing save gets its own latest-state attempt',async()=>{
 const gate=deferred();let writes=0,notices=0;const publish=createObservationPublisher({persist:async()=>{if(++writes===1)await gate.promise;},notify:()=>notices++});
 const first=publish();assert.equal(publish(),first);gate.reject(new Error('first rejected'));await first;assert.equal(writes,2);assert.equal(notices,1);
});
test('independent owner publishers cannot block or misroute each other',async()=>{
 const gate=deferred(),notices=[];const a=createObservationPublisher({persist:()=>gate.promise,notify:()=>notices.push('a')}),b=createObservationPublisher({persist:async()=>{},notify:()=>notices.push('b')});
 const pending=a();await b();assert.deepEqual(notices,['b']);gate.resolve();await pending;assert.deepEqual(notices,['b','a']);
});
