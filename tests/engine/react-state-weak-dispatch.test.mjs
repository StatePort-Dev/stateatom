// SPDX-License-Identifier: Apache-2.0
// Declared native events are synthetic controls, not React/runtime or GC proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createStateHandoffLedger} from '../../src/engine/react-state.mjs';

function fixture(weakRef=WeakRef){
 const fibers=new WeakSet(),origins=new WeakMap(),events=[];
 const ledger=createStateHandoffLedger({page:'synthetic-weak-dispatch',weakRef,
  field:(o,k)=>o&&Object.getOwnPropertyDescriptor(o,k)?.value,
  isFiber:v=>fibers.has(v),origin:v=>origins.get(v),
  add:(meta,value)=>{const n={...meta,value,id:'read'+events.length};events.push(n);return n;}});
 const queue={dispatch(){}},hook={queue,memoizedState:null,next:null},fiber={memoizedState:hook};
 fibers.add(fiber);
 function apply(value={quota:12},update={action:value}){
  origins.set(value,{exchangeId:'synthetic-exchange',consumptionId:'synthetic-parse',pointer:''});
  ledger.tap('state-dispatch',queue,update,fiber);
  ledger.tap('state-applied',hook,update,value);hook.memoizedState=value;return value;
 }
 const nativeResult=()=>{const result=[hook.memoizedState,queue.dispatch];ledger.tap('state-result',result,hook,fiber);return result;};
 function associate(result){ledger.stage({binding:'data'},'render',result);return ledger.associate({binding:'data'},'render',result[0],result[1]);}
 return{ledger,queue,hook,fiber,fibers,origins,apply,nativeResult,associate,
  mount:()=>ledger.tap('state-mount',hook,queue,fiber),
  witness:read=>ledger.witness([read],new Set([fiber]))[0]};
}

// Descriptor restoration happens before assertions; no patched intrinsic escapes.
for(const phase of ['state-result','association','witness'])for(const kind of ['method','accessor'])
 test('late native WeakRef '+kind+' replacement is not called during '+phase,()=>{
  const f=fixture();f.mount();const value=f.apply();
  let result=phase==='state-result'?null:f.nativeResult();
  let read=phase==='witness'?f.associate(result):null,calls=0,error,witness;
  const original=Object.getOwnPropertyDescriptor(WeakRef.prototype,'deref');
  const descriptor=kind==='method'?{value(){calls++;throw Error('application weak method');}}:{get(){calls++;throw Error('application weak getter');}};
  Object.defineProperty(WeakRef.prototype,'deref',{configurable:true,...descriptor});
  try{
   if(!result)result=f.nativeResult();if(!read)read=f.associate(result);witness=f.witness(read);
  }catch(e){error=e;}finally{Object.defineProperty(WeakRef.prototype,'deref',original);}
  assert.equal(calls,0,'telemetry must not dispatch application-installed code');
  assert.equal(error,undefined);assert.equal(witness.status,'Observed');
  assert.equal(witness.parsedObject.consumptionId,'synthetic-parse');
  assert.equal(witness.valueOrigin,'Unknown/Unsupported');assert.equal(f.hook.memoizedState,value);
 });

for(const kind of ['missing','accessor','noncallable'])test('unsupported '+kind+' weak deref does not invoke or adopt an accessor',()=>{
 let calls=0;class WeakControl{constructor(value){this.value=value;}}
 if(kind==='accessor')Object.defineProperty(WeakControl.prototype,'deref',{get(){calls++;return function(){return this.value;};}});
 if(kind==='noncallable')Object.defineProperty(WeakControl.prototype,'deref',{value:1});
 const f=fixture(WeakControl);let error,witness;
 try{f.mount();f.apply();witness=f.witness(f.associate(f.nativeResult()));}catch(e){error=e;}
 assert.equal(error,undefined);assert.equal(calls,0);assert.equal(witness.status,'Unknown/Unsupported');
});

for(const kind of ['prototype','deref'])test('capability '+kind+' accessor does not read an inherited descriptor value getter',()=>{
 let capabilityCalls=0,inheritedCalls=0,error,witness;
 const WeakControl=kind==='prototype'?()=>{}:class{constructor(value){this.value=value;}};
 Object.defineProperty(kind==='prototype'?WeakControl:WeakControl.prototype,kind==='prototype'?'prototype':'deref',
  {configurable:true,get(){capabilityCalls++;return undefined;}});
 const previous=Object.getOwnPropertyDescriptor(Object.prototype,'value');
 Object.defineProperty(Object.prototype,'value',{configurable:true,get(){inheritedCalls++;return undefined;}});
 try{const f=fixture(WeakControl);f.mount();f.apply();witness=f.witness(f.associate(f.nativeResult()));}
 catch(e){error=e;}finally{
  if(previous)Object.defineProperty(Object.prototype,'value',previous);else delete Object.prototype.value;
 }
 assert.equal(error,undefined);assert.equal(capabilityCalls,0);assert.equal(inheritedCalls,0);
 assert.equal(witness.status,'Unknown/Unsupported');
});

function controlledWeak(){
 // Deterministic weak-unavailable control only; no actual collection is asserted.
 const refs=new WeakMap(),created=[];
 class WeakControl{constructor(value){refs.set(this,value);created.push(this);}deref(){return refs.get(this);}}
 return{WeakControl,lose:()=>{for(const r of created)refs.delete(r);}};
}
test('missing retained references still refuse the witness without replacing them by equal values',()=>{
 const c=controlledWeak(),f=fixture(c.WeakControl);f.mount();f.apply();const read=f.associate(f.nativeResult());
 assert.equal(f.witness(read).status,'Observed');c.lose();assert.equal(f.witness(read).status,'Unknown/Unsupported');
});
for(const change of ['value','queue','revision','ancestor','stop'])test('captured weak deref preserves '+change+' invalidation',()=>{
 const f=fixture();f.mount();const value=f.apply(),read=f.associate(f.nativeResult());
 assert.equal(f.witness(read).status,'Observed');
 if(change==='value')f.hook.memoizedState={...value};
 if(change==='queue')f.hook.queue={dispatch:f.queue.dispatch};
 if(change==='revision')f.apply(value,{action:value});
 if(change==='ancestor')f.fiber.memoizedState={...f.hook};
 if(change==='stop')f.ledger.stop();
 assert.equal(f.witness(read).status,'Unknown/Unsupported');
});
