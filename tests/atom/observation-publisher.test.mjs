// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createObservationPublisher} from '../../packages/atom/src/observation-publisher.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const turn=()=>new Promise(setImmediate);
test('burst shares one flight and publishes only after latest current-state follow-up',async()=>{
 const gate=deferred(),saved=[],notices=[];let current=1;
 const publish=createObservationPublisher({schedule:task=>task(),persist:async()=>{const value=current;saved.push(value);if(saved.length===1)await gate.promise;},notify:()=>notices.push(current)});
 const first=publish();for(current=2;current<=20;current++)assert.equal(publish(),first);current=20;
 assert.deepEqual(saved,[1]);assert.deepEqual(notices,[]);gate.resolve();await first;assert.deepEqual(saved,[1,20]);assert.deepEqual(notices,[20]);
 await publish();assert.deepEqual(saved,[1,20,20]);assert.deepEqual(notices,[20,20]);
});
test('request during final notice or after awaited settlement is never lost',async()=>{
 let writes=0,notices=0,again;const publish=createObservationPublisher({schedule:task=>task(),persist:async()=>{writes++;},notify:()=>{if(++notices===1)again=publish();}});
 const first=publish();await first;assert.equal(again,first);assert.equal(writes,2);assert.equal(notices,2);await publish();assert.equal(writes,3);assert.equal(notices,3);
});
test('failed save rejects without notification or an automatic retry loop and permits later request',async()=>{
 let writes=0,notices=0;const error=new Error('storage unavailable'),publish=createObservationPublisher({schedule:task=>task(),persist:async()=>{if(++writes===1)throw error;},notify:()=>notices++});
 await assert.rejects(publish(),e=>e===error);await turn();assert.equal(writes,1);assert.equal(notices,0);await publish();assert.equal(writes,2);assert.equal(notices,1);
});
test('a later dirty request during a failing save gets its own latest-state attempt',async()=>{
 const gate=deferred();let writes=0,notices=0;const publish=createObservationPublisher({schedule:task=>task(),persist:async()=>{if(++writes===1)await gate.promise;},notify:()=>notices++});
 const first=publish();assert.equal(publish(),first);gate.reject(new Error('first rejected'));await first;assert.equal(writes,2);assert.equal(notices,1);
});
test('independent owner publishers cannot block or misroute each other',async()=>{
 const gate=deferred(),notices=[];const a=createObservationPublisher({schedule:task=>task(),persist:()=>gate.promise,notify:()=>notices.push('a')}),b=createObservationPublisher({schedule:task=>task(),persist:async()=>{},notify:()=>notices.push('b')});
 const pending=a();await b();assert.deepEqual(notices,['b']);gate.resolve();await pending;assert.deepEqual(notices,['b','a']);
});

// Fast acknowledgements must not defeat batching before the scheduled task.
test('fast acknowledged requests before one scheduled task save only the latest state',async()=>{
 const tasks=[],saved=[],notices=[];let current=0;
 const publish=createObservationPublisher({schedule:task=>tasks.push(task),persist:async()=>{saved.push(current);},notify:()=>notices.push(current)});
 const first=publish();
 for(current=1;current<=30;current++){await Promise.resolve();assert.equal(publish(),first);}
 current=30;
 assert.equal(tasks.length,1,'One task per flight, independent of fast storage acknowledgements');
 assert.deepEqual(saved,[],'No historical first-state storage submission before scheduling boundary');
 tasks.shift()();await first;
 assert.deepEqual(saved,[30]);assert.deepEqual(notices,[30]);
});

test('scheduling failure rejects without saving and a later call starts a new flight',async()=>{
 const error=new Error('scheduler unavailable');let schedules=0,writes=0,notices=0;
 const publish=createObservationPublisher({schedule:task=>{if(++schedules===1)throw error;task();},persist:async()=>{writes++;},notify:()=>notices++});
 await assert.rejects(publish(),e=>e===error);assert.equal(writes,0);assert.equal(notices,0);
 await publish();assert.equal(writes,1);assert.equal(notices,1);
});
test('queued publishers route independent current state without holding snapshots',async()=>{
 const tasks=[],saved=[],notices=[];let a='recording-old',b='recording-b';
 const publishA=createObservationPublisher({schedule:task=>tasks.push(task),persist:async()=>saved.push(a),notify:()=>notices.push('a')});
 const publishB=createObservationPublisher({schedule:task=>tasks.push(task),persist:async()=>saved.push(b),notify:()=>notices.push('b')});
 const first=publishA(),second=publishB();a='deleted-then-new-window';
 tasks[1]();await second;assert.deepEqual(saved,['recording-b']);
 tasks[0]();await first;assert.deepEqual(saved,['recording-b','deleted-then-new-window']);assert.deepEqual(notices,['b','a']);
});
test('default scheduling waits for a task boundary while retaining one Promise',async()=>{
 let writes=0;const publish=createObservationPublisher({persist:async()=>{writes++;},notify:()=>{}});
 const first=publish();await Promise.resolve();assert.equal(writes,0);assert.equal(publish(),first);await first;assert.equal(writes,1);
});
