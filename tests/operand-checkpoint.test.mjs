// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {operandCheckpoint} from '../stateatom-compiler-probe/operands.mjs';
const primitive=value=>({type:typeof value,value}),receiver={type:'object',objectId:'receiver'};
function fixture({proxy=false,getter=false,key=primitive('quota'),current=12,read=12,completed=true}={}){
 let requests=0;const props={result:[{name:'receiver',value:proxy?{...receiver,subtype:'proxy'}:receiver},{name:'key',value:key},{name:'readCompleted',value:primitive(completed)},{name:'readValueRetained',value:primitive(true)},{name:'readValue',value:primitive(read)}]};
 const refs={guard(){},data:(p,k)=>{const d=p.result.find(v=>v.name===k);if(!d||d.get||d.set)throw Error('Not own data');return d.value;},properties:async()=>{requests++;return{result:[getter?{name:'quota',get:{type:'function',objectId:'getter'}}:{name:'quota',value:primitive(current)}]};}};
 return{run:()=>operandCheckpoint({refs,event:props}),requests:()=>requests};
}
test('own data checkpoint and captured original read remain separate evidence with unknown ancestry',async()=>{
 const f=fixture(),r=await f.run();assert.equal(r.status,'Observed');assert.equal(r.entryRead.value,12);assert.equal(r.descriptorAtCheckpoint.value,12);assert.equal(r.descriptorAtCheckpoint.sameScalarAsEntryRead,true);assert.equal(r.valueOrigin,'Unknown/Unsupported');assert.equal(r.fullPath,false);assert.equal(f.requests(),1);
});
test('later changed descriptor does not rewrite or replay the already acquired scalar read',async()=>{
 const f=fixture({current:99}),r=await f.run();assert.equal(r.status,'Observed');assert.equal(r.entryRead.value,12);assert.equal(r.descriptorAtCheckpoint.value,99);assert.equal(r.descriptorAtCheckpoint.sameScalarAsEntryRead,false);assert.equal(r.valueOrigin,'Unknown/Unsupported');
});
test('proxy receiver and object key are declined without descriptor or coercion attempts',async()=>{
 for(const args of[{proxy:true},{key:{type:'object',objectId:'key'}}]){const f=fixture(args),r=await f.run();assert.equal(r.status,'Unknown/Unsupported');assert.equal(f.requests(),0);assert.equal(r.fullPath,false);}
});
test('accessor checkpoint and incomplete original read never fabricate a scalar descriptor',async()=>{
 for(const args of[{getter:true},{completed:false}]){const f=fixture(args),r=await f.run();assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.descriptorAtCheckpoint,undefined);assert.equal(r.valueOrigin,'Unknown/Unsupported');}
});
