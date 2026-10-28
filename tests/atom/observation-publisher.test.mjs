// SPDX-License-Identifier: Apache-2.0
import * as publicationModule from '../../packages/atom/src/observation-publisher.mjs';
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

// Real default factory with an owned virtual timer; no native timing claim.
async function virtualPublication(run){
 const original=globalThis.setTimeout,tasks=[];let now=0;
 const micro=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
 const advance=async at=>{now=at;for(;;){const i=tasks.findIndex(t=>t.at<=now);if(i<0)break;tasks.splice(i,1)[0].callback();await micro();}};
 globalThis.setTimeout=(callback,delay)=>{tasks.push({at:now+delay,callback,delay});return tasks.length;};
 try{return await run({tasks,advance,micro,flush:async()=>{while(tasks.length)await advance(Math.min(...tasks.map(t=>t.at)));}});}finally{globalThis.setTimeout=original;}
}
test('separate fast-ack event tasks share a first-save window without losing latest state',async()=>{
 await virtualPublication(async clock=>{
  let current=0,last;const saved=[],notices=[],publish=createObservationPublisher({persist:async()=>saved.push(current),notify:()=>notices.push(current)});
  for(let i=0;i<20;i++){current=i;last=publish();await clock.advance(i);}
  await clock.flush();await last;assert.deepEqual(saved,[16,19]);assert.deepEqual(notices,[16,19]);assert.equal(publicationModule.OBSERVATION_PUBLICATION_DELAY_MS,16);
 });
});
test('default first save waits nominal16ms and persists current state when it dispatches',async()=>{
 await virtualPublication(async clock=>{
  let current='first';const saved=[],publish=createObservationPublisher({persist:async()=>saved.push(current),notify:()=>{}}),first=publish();await clock.advance(15);assert.deepEqual(saved,[]);
  current='latest';assert.equal(publish(),first);await clock.advance(16);await first;assert.deepEqual(saved,['latest']);assert.equal(clock.tasks.length,0);
 });
});

test('dirty acknowledged follow-up waits the same scheduling window and keeps its flight',async()=>{
 await virtualPublication(async clock=>{const gate=deferred(),saved=[],notices=[];let current=0,settled=false;const publish=createObservationPublisher({persist:async()=>{saved.push(current);if(saved.length===1)await gate.promise;},notify:()=>notices.push(current)}),first=publish();void first.then(()=>{settled=true;});await clock.advance(16);current=1;assert.equal(publish(),first);gate.resolve();await clock.micro();assert.deepEqual(saved,[0]);assert.equal(settled,false);assert.equal(clock.tasks.length,1);current=2;assert.equal(publish(),first);await clock.advance(31);assert.deepEqual(saved,[0]);current=3;await clock.advance(32);await first;assert.deepEqual(saved,[0,3]);assert.deepEqual(notices,[3]);assert.equal(clock.tasks.length,0);});
});
test('dirty rejected save schedules its latest-state retry rather than saving immediately',async()=>{
 await virtualPublication(async clock=>{const gate=deferred();let writes=0,notices=0;const publish=createObservationPublisher({persist:async()=>{if(++writes===1)await gate.promise;},notify:()=>notices++}),first=publish();await clock.advance(16);assert.equal(publish(),first);gate.reject(Error('first save rejected'));await clock.micro();assert.equal(writes,1);assert.equal(clock.tasks.length,1);await clock.advance(32);await first;assert.equal(writes,2);assert.equal(notices,1);});
});
test('reentrant notification leaves the next dirty save scheduled without losing its promise',async()=>{
 await virtualPublication(async clock=>{const saved=[];let current=1,again;const publish=createObservationPublisher({persist:async()=>saved.push(current),notify:()=>{if(current===1){current=2;again=publish();}}}),first=publish();await clock.advance(16);assert.equal(again,first);assert.deepEqual(saved,[1]);assert.equal(clock.tasks.length,1);await clock.advance(32);await first;assert.deepEqual(saved,[1,2]);});
});
test('failure scheduling a dirty follow-up rejects and permits a new independent flight',async()=>{
 const gate=deferred(),error=Error('follow-up scheduling failed');let schedules=0,writes=0,notices=0;const publish=createObservationPublisher({schedule:task=>{if(++schedules===2)throw error;task();},persist:async()=>{if(++writes===1)await gate.promise;},notify:()=>notices++}),first=publish();assert.equal(publish(),first);const rejected=assert.rejects(first,e=>e===error);gate.resolve();await rejected;assert.equal(writes,1);assert.equal(notices,0);await publish();assert.equal(writes,2);assert.equal(notices,1);
});
