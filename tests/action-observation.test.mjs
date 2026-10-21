// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createActionObservation} from '../core/action-observation.mjs';
const site={id:'a'.repeat(64)+':0',file:'src/action.js',sourceDigest:'a'.repeat(64),line:1,column:1,endLine:1,endColumn:45,kind:'function',symbol:'save'};
function make(options={}){let time=0,serial=0;const api=createActionObservation({identity:{run:'run',build:'build',page:'page',frame:'main'},sites:[site],now:()=>time,id:()=>String(++serial),...options});return{api,advance:n=>{time+=n;}};}
test('one exact Event carrier separates dispatch, body entry and normal/throw leave',()=>{
 const {api}=make(),event={};api.arm({selectedId:'node-a',timeoutMs:1000});assert.equal(api.enter(site.id,event,'node-a'),null);api.dispatch(event,{targetId:'node-child',trusted:true});assert.equal(api.enter(site.id,{},'node-a'),null);const token=api.enter(site.id,event,'node-a'),nested=api.enter(site.id,event,'node-a');assert(token);api.leave(nested,true);api.leave(token,false);api.finish();const s=api.snapshot();assert.equal(s.status,'complete');assert.deepEqual(s.records.map(r=>r.kind),['dispatch','body-entry','body-entry','body-leave','body-leave']);assert.equal(s.records[2].parentActivationId,s.records[1].activationId);assert.equal(s.records[3].completion,'throw');assert.equal(s.records[4].completion,'return');assert.equal(s.runtimeFunctionObjectIdentity,'Unavailable');assert.equal(api.enter(site.id,event,'node-a'),null);
});
test('unknown source, argument proxies and nonmatching event never trigger getter or coercion',()=>{
 const {api}=make(),event={},poison=new Proxy({},{get(){throw Error('get');},getOwnPropertyDescriptor(){throw Error('descriptor');}});api.arm({selectedId:'node-a'});api.dispatch(event,{targetId:'node-a',trusted:true});assert.equal(api.enter(poison,event,'node-a'),null);assert.equal(api.enter(site.id,poison,'node-a'),null);assert.equal(api.enter('missing',event,'node-a'),null);assert.equal(api.enter(site.id,event,null),null);api.finish();assert.equal(api.snapshot().records.length,1);
});
test('timeout, cancellation, Clear, stale context and limits release the event without undo claims',()=>{
 for(const operation of ['cancel','clear','invalidate']){const {api}=make(),event={};api.arm({selectedId:'node-a'});api.dispatch(event,{targetId:'node-a',trusted:true});api[operation]('test');assert.equal(api.enter(site.id,event,'node-a'),null);assert.equal(api.snapshot().actionUndone,false);}
 const {api,advance}=make({recordLimit:3}),event={};api.arm({selectedId:'node-a',timeoutMs:10});advance(11);assert.equal(api.dispatch(event,{targetId:'node-a',trusted:true}),false);assert.equal(api.snapshot().status,'expired');api.arm({selectedId:'node-a'});api.dispatch(event,{targetId:'node-a',trusted:true});const token=api.enter(site.id,event,'node-a');api.leave(token,false);assert.equal(api.enter(site.id,event,'node-a'),null);assert.match(api.snapshot().reason,/budget/);
});
test('untrusted dispatch and forged/out-of-order leave cannot acquire a complete trace',()=>{
 const {api}=make(),event={};api.arm({selectedId:'node-a'});assert.equal(api.dispatch(event,{targetId:'node-a',trusted:false}),false);assert.equal(api.snapshot().status,'armed');api.dispatch(event,{targetId:'node-a',trusted:true});const token=api.enter(site.id,event,'node-a');api.leave({},false);assert.equal(api.snapshot().records.length,2);api.finish();assert.equal(api.snapshot().status,'partial');assert.match(api.snapshot().reason,/unclosed/i);assert.equal(api.leave(token,false),false);
});
test('private catalog and snapshot do not call application Array iterator or species hooks',()=>{
 const iterator=Object.getOwnPropertyDescriptor(Array.prototype,Symbol.iterator),constructor=Object.getOwnPropertyDescriptor(Array.prototype,'constructor');let traps=0,error;
 try{Object.defineProperty(Array.prototype,Symbol.iterator,{configurable:true,get(){traps++;throw Error('Application iterator');}});Object.defineProperty(Array.prototype,'constructor',{configurable:true,get(){traps++;throw Error('Application species');}});const {api}=make();api.arm({selectedId:'node'});const event={};api.dispatch(event,{targetId:'node',trusted:true});const token=api.enter(site.id,event,'node');api.leave(token,false);api.finish();api.snapshot();}catch(e){error=e;}finally{Object.defineProperty(Array.prototype,Symbol.iterator,iterator);Object.defineProperty(Array.prototype,'constructor',constructor);}assert.equal(traps,0);assert.equal(error,undefined);
});

test('time budget expiring inside an original body retains entry without inventing its later exit',()=>{
 const{api,advance}=make(),event={};api.arm({selectedId:'node',timeoutMs:10});api.dispatch(event,{targetId:'node',trusted:true});const token=api.enter(site.id,event,'node');advance(11);assert.equal(api.leave(token,false),false);const r=api.snapshot();assert.equal(r.status,'expired');assert.deepEqual(r.records.map(x=>x.kind),['dispatch','body-entry']);assert.equal(r.actionUndone,false);assert.equal(api.enter(site.id,event,'node'),null);
});
