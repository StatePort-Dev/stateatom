// SPDX-License-Identifier: Apache-2.0
// Exact source byte/immutability controls; not native performance evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createProductionObservation} from '../core/production-observations.mjs';
const origin='https://app.example',identity={tabId:1,run:'run',document:'document',frame:'main',origin};
const windowId='00000000-0000-4000-8000-000000000001';
function fixture(options={}){
 let clock=1000000;const c=createProductionObservation({identity,target:{node:'node',property:'disabled',value:true,observedAt:clock},now:()=>clock,id:()=>windowId,...options});c.start();
 return{c,next:()=>++clock,clock:()=>clock};
}
const bytes=value=>Buffer.byteLength(JSON.stringify(value),'utf8');
test('20 requests do not repeatedly serialize all prior frozen network records',()=>{
 const f=fixture(),original=JSON.stringify;let serializedRecords=0;
 JSON.stringify=function(value,...args){
  if(value?.kind==='network')serializedRecords++;
  else if(Array.isArray(value?.records))serializedRecords+=value.records.filter(r=>r.kind==='network').length;
  return original.call(this,value,...args);
 };
 try{for(let i=0;i<20;i++){const token=f.c.requestStart({requestId:'r'+i,at:f.next(),url:origin+'/private?omitted',method:'GET'},identity);assert(token);assert(f.c.requestResponse(token,{at:f.next(),status:200},identity));assert(f.c.requestEnd(token,{at:f.next(),outcome:'finished'},identity));}}
 finally{JSON.stringify=original;}
 assert.equal(f.c.snapshot().records.length,20);assert.equal(f.c.snapshot().counts.completed,20);
 assert(serializedRecords<=120,`Repeated unchanged record serialization: ${serializedRecords}; at most twice per60 normalized record versions`);
});
for(const property of ['text','disabled'])test(`exact full-JSON byte limit and immutable pending snapshots: ${property}`,()=>{
 const f=fixture({target:{node:'node',property,value:false,observedAt:1000000},limits:{bytes:8192}}),history=[];
 let stopped=false;
 for(let i=0;i<32;i++){
  const before=f.c.snapshot();history.push({value:before,json:JSON.stringify(before)});
  const at=f.next(),record={kind:'network',id:windowId+':'+(i+1),requestId:'r'+i,at,method:'GET',route:{origin,detail:'omitted'},status:null,responseAt:null,endedAt:null,durationMs:null,completion:'pending',timingOrder:'not-completed'};
  const candidate={...before,lastObservedAt:Math.max(before.lastObservedAt??before.startedAt,at),records:[...before.records,record],counts:{...before.counts,requests:before.counts.requests+1}};
  const token=f.c.requestStart({requestId:'r'+i,at,url:origin+'/secret?ignored',method:'GET'},identity);
  if(bytes(candidate)>8192-4096){
   assert.equal(token,null);const after=f.c.snapshot();assert.equal(after.stopReason,'byte-limit');assert.equal(after.gaps.byteLimit,1);assert.equal(after.records.length,before.records.length);assert(after.records.every(r=>r.completion==='unobserved'));stopped=true;break;
  }
  assert.equal(token,record.id);assert.deepEqual(f.c.snapshot(),candidate);assert(bytes(f.c.snapshot())<=8192-4096);
 }
 assert(stopped,'must reach byte limit before pending/record limit');
 for(const old of history){assert(Object.isFrozen(old.value));assert.equal(JSON.stringify(old.value),old.json);}
});
test('completion/status/gap updates and stopped snapshots retain independently serialized exact data',()=>{
 const f=fixture(),start=f.c.snapshot(),token=f.c.requestStart({requestId:'r',at:f.next(),url:'https://other.example/private?token=hidden',method:'POST'},identity),pending=f.c.snapshot(),pendingJSON=JSON.stringify(pending);
 assert(f.c.requestResponse(token,{at:f.next(),status:503},identity));const response=f.c.snapshot(),responseJSON=JSON.stringify(response);
 assert(f.c.requestEnd(token,{at:f.next(),outcome:'failed'},identity));const completed=f.c.snapshot(),completedJSON=JSON.stringify(completed);
 assert.equal(f.c.requestEnd('missing',{at:f.next(),outcome:'finished'},identity),false);assert.equal(f.c.snapshot().gaps.unmatched,1);
 const stopped=f.c.stop('user');assert.equal(stopped.records[0].status,503);assert.equal(stopped.records[0].completion,'failed');assert.equal(stopped.counts.httpErrors,1);assert.equal(stopped.counts.transportFailed,1);assert(bytes(stopped)<65536-4096);
 assert.equal(start.records.length,0);for(const [value,json] of [[pending,pendingJSON],[response,responseJSON],[completed,completedJSON]])assert.equal(JSON.stringify(value),json);
 assert.equal(f.c.clear().records.length,0);assert.equal(JSON.stringify(completed),completedJSON);
 const other=fixture(),otherToken=other.c.requestStart({requestId:'r',at:other.next(),url:origin+'/different',method:'HEAD'},identity);assert.equal(otherToken,token);assert.equal(other.c.snapshot().records[0].method,'HEAD');assert.equal(other.c.snapshot().records[0].route.origin,origin);assert.equal(completed.records[0].method,'POST');
});
for(const [name,prototype,formatter] of [
 ['Object',Object.prototype,function(key){return this.kind==='network'?{...this,padding:key===''?'':'x'.repeat(2000)}:this;}],
 ['Array',Array.prototype,function(){return this.length?['x'.repeat(2000),...this]:this;}]
])test(`inherited ${name} toJSON keeps the original complete-JSON byte authority`,()=>{
 const f=fixture({limits:{bytes:8192}}),descriptor=Object.getOwnPropertyDescriptor(prototype,'toJSON');
 Object.defineProperty(prototype,'toJSON',{configurable:true,value:formatter});
 try{
  for(let i=0;i<4;i++){
   const before=f.c.snapshot(),at=f.next(),record={kind:'network',id:windowId+':'+(i+1),requestId:'r'+i,at,method:'GET',route:{origin,detail:'omitted'},status:null,responseAt:null,endedAt:null,durationMs:null,completion:'pending',timingOrder:'not-completed'},candidate={...before,lastObservedAt:at,records:[...before.records,record],counts:{...before.counts,requests:before.counts.requests+1}};
   const expected=bytes(candidate)<=8192-4096,token=f.c.requestStart({requestId:'r'+i,at,url:origin,method:'GET'},identity);assert.equal(token!==null,expected,'standalone record JSON cannot substitute for nested toJSON keys');if(!expected){assert.equal(f.c.snapshot().stopReason,'byte-limit');break;}
  }
 }finally{if(descriptor)Object.defineProperty(prototype,'toJSON',descriptor);else delete prototype.toJSON;}
});
test('custom Array prototype ancestry retains the complete-JSON byte boundary',()=>{
 const f=fixture({limits:{bytes:8192}}),original=Object.getPrototypeOf(Array.prototype),ancestor=Object.create(original,{toJSON:{value:function(){return this.length?['x'.repeat(3500),...this]:this;}}});
 Object.setPrototypeOf(Array.prototype,ancestor);
 try{const token=f.c.requestStart({requestId:'r',at:f.next(),url:origin,method:'GET'},identity);assert.equal(token,null,'inherited formatting must not hide bytes from the ledger budget');assert.equal(f.c.snapshot().stopReason,'byte-limit');assert.equal(f.c.snapshot().records.length,0);}
 finally{Object.setPrototypeOf(Array.prototype,original);}
});
