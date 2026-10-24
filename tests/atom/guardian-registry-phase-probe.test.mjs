// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import{installGuardianRegistryProbe}from'../helpers/guardian-registry-phase-probe.mjs';
function fixture(){
 let time=0,throws=null,result,read=0;const calls=[];
 class W extends EventTarget{postMessage(...args){calls.push({receiver:this,args});if(throws)throw throws;return result;}}
 const original=W.prototype.postMessage,scope={Worker:W,EventTarget,MessageEvent,performance:{timeOrigin:1000,now:()=>time},crossOriginIsolated:false},worker=new W();
 return{scope,worker,original,calls,setTime:v=>time=v,setThrow:v=>throws=v,setResult:v=>result=v,reply:(w,id,ok=true)=>w.dispatchEvent(new MessageEvent('message',{data:{version:1,id,ok,get value(){read++;throw Error('private');},get code(){read++;throw Error('private');}}})),message:(id,op='verify')=>({version:1,id,op,get args(){read++;throw Error('private');}}),reads:()=>read};
}
test('registry probe forwards original native call and observes only matching metadata without reading private fields',()=>{
 const f=fixture(),probe=installGuardianRegistryProbe(f.scope),message=f.message(17),transfer=[];probe.reset('one');f.setTime(2);assert.equal(f.worker.postMessage(message,transfer),undefined);assert.equal(f.calls.length,1);assert.equal(f.calls[0].receiver,f.worker);assert.equal(f.calls[0].args[0],message);assert.equal(f.calls[0].args[1],transfer);assert.equal(probe.snapshot().inflight,1);f.setTime(8);f.reply(f.worker,17);assert.deepEqual(probe.snapshot().rows,[{ordinal:0,op:'verify',startMs:2,endMs:8,durationMs:6,ok:true}]);assert.equal(f.reads(),0);assert.equal(probe.snapshot().unsupported,false);probe.restore();assert.equal(f.scope.Worker.prototype.postMessage,f.original);
});
test('out of order overlapping replies keep exact IDs while pre-window replies cannot complete rows',()=>{
 const f=fixture(),p=installGuardianRegistryProbe(f.scope);f.worker.postMessage(f.message(1));p.reset('two');f.setTime(1);f.worker.postMessage(f.message(2,'begin'));f.setTime(2);f.worker.postMessage(f.message(3,'snapshot'));f.reply(f.worker,1);assert.equal(p.snapshot().inflight,2);f.setTime(4);f.reply(f.worker,3,false);f.setTime(9);f.reply(f.worker,2);assert.deepEqual(p.snapshot().rows.map(r=>[r.op,r.durationMs,r.ok]),[['begin',8,true],['snapshot',2,false]]);assert.equal(p.snapshot().inflight,0);p.restore();
});
test('synchronous error and non-native return remain exact and do not suppress original behavior',()=>{
 const f=fixture(),p=installGuardianRegistryProbe(f.scope),error={private:true};p.reset('throw');f.setThrow(error);assert.throws(()=>f.worker.postMessage(f.message(1)),e=>e===error);assert.equal(p.snapshot().rows[0].ok,false);f.setThrow(null);const value={};f.setResult(value);assert.equal(f.worker.postMessage(f.message(2)),value);assert.equal(p.snapshot().unsupported,true);f.reply(f.worker,2);p.restore();
});
test('configuration invalidity refuses before replacing native method',()=>{
 for(const limit of [0,-1,1.5,16385,Infinity]){const f=fixture();assert.throws(()=>installGuardianRegistryProbe(f.scope,{limit}));assert.equal(f.scope.Worker.prototype.postMessage,f.original);}
});
test('unsupported getters/protocol and another matching worker forward without private execution or accepted matching',()=>{
 const f=fixture(),p=installGuardianRegistryProbe(f.scope);p.reset('bad');let read=0;const message={version:1,id:1,get op(){read++;throw Error('private');}};f.worker.postMessage(message);assert.equal(read,0);assert.equal(f.calls.length,1);assert.equal(p.snapshot().unsupported,true);p.reset('foreign');f.worker.postMessage({kind:'source-parse',private:'value'});assert.equal(p.snapshot().unsupported,true);p.reset('second');f.worker.postMessage(f.message(2));const other=new f.scope.Worker();other.postMessage(f.message(3));f.reply(other,2);assert.equal(p.snapshot().inflight,1);assert.equal(p.snapshot().unsupported,true);f.reply(f.worker,2);p.restore();
});
test('duplicate send/reply and malformed reply cannot manufacture completed records',()=>{
 for(const kind of ['send','reply','malformed']){const f=fixture(),p=installGuardianRegistryProbe(f.scope);p.reset(kind);f.worker.postMessage(f.message(1));if(kind==='send')f.worker.postMessage(f.message(1));if(kind==='malformed')f.worker.dispatchEvent(new MessageEvent('message',{data:{version:1,id:1,ok:'true'}}));else{f.reply(f.worker,1);if(kind==='reply')f.reply(f.worker,1);}assert.equal(p.snapshot().unsupported,true);assert.equal(p.snapshot().inflight,0);p.restore();}
});
test('cap overflow stays disqualifying and pending reset/restore cannot drop unfinished work',()=>{
 const f=fixture(),p=installGuardianRegistryProbe(f.scope,{limit:1});p.reset('cap');f.worker.postMessage(f.message(1));assert.throws(()=>p.reset('lost'));assert.throws(()=>p.restore());f.worker.postMessage(f.message(2));assert.equal(p.snapshot().overflow,true);assert.equal(p.snapshot().inflight,2);f.reply(f.worker,1);f.reply(f.worker,2);assert.equal(p.snapshot().rows.length,1);const copy=p.snapshot();copy.rows[0].ok=false;copy.clock.timeOrigin=9;assert.equal(p.snapshot().rows[0].ok,true);assert.equal(p.snapshot().clock.timeOrigin,1000);p.restore();
});
test('native worker error and messageerror leave explicit unsupported outcomes without inspecting event content',()=>{
 for(const type of ['error','messageerror']){const f=fixture(),p=installGuardianRegistryProbe(f.scope);p.reset(type);f.worker.postMessage(f.message(1));f.worker.dispatchEvent(new Event(type));assert.equal(p.snapshot().unsupported,true);assert.equal(p.snapshot().inflight,0);assert.equal(p.snapshot().rows[0].ok,null);p.restore();}
});
test('restoration removes owned listeners and preserves foreign native method replacement with explicit failure',()=>{
 const f=fixture(),p=installGuardianRegistryProbe(f.scope);p.reset('replace');f.worker.postMessage(f.message(1));f.reply(f.worker,1);const foreign=()=>{};f.scope.Worker.prototype.postMessage=foreign;assert.throws(()=>p.restore(),/replaced/i);assert.equal(f.scope.Worker.prototype.postMessage,foreign);f.reply(f.worker,1);assert.equal(p.snapshot().unsupported,false);
});
test('listener acquisition failure rolls back acquired listeners and still forwards exactly once',()=>{
 const f=fixture(),removed=[];f.scope.EventTarget={prototype:{addEventListener(type,fn){if(type==='error')throw Error('add failure');return Reflect.apply(EventTarget.prototype.addEventListener,this,[type,fn]);},removeEventListener(type,fn){removed.push(type);return Reflect.apply(EventTarget.prototype.removeEventListener,this,[type,fn]);}}};const p=installGuardianRegistryProbe(f.scope);p.reset('add');const m=f.message(1);f.worker.postMessage(m);assert.equal(f.calls.length,1);assert.equal(f.calls[0].args[0],m);assert.deepEqual(removed,['message']);assert.equal(p.snapshot().unsupported,true);assert.equal(p.snapshot().inflight,0);p.restore();
});
test('listener removal failures are explicit and do not skip remaining listener or prototype cleanup',()=>{
 const f=fixture(),removed=[];f.scope.EventTarget={prototype:{addEventListener:EventTarget.prototype.addEventListener,removeEventListener(type,fn){removed.push(type);if(type==='error')throw Error('remove failure');return Reflect.apply(EventTarget.prototype.removeEventListener,this,[type,fn]);}}};const p=installGuardianRegistryProbe(f.scope);p.reset('remove');f.worker.postMessage(f.message(1));f.reply(f.worker,1);assert.throws(()=>p.restore(),/remove failure/);assert.deepEqual(removed,['message','error','messageerror']);assert.equal(f.scope.Worker.prototype.postMessage,f.original);
});
