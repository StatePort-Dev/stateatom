// SPDX-License-Identifier: Apache-2.0
// Synthetic identities and real native calls only; no independent-app evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createArrayTransferObserver} from '../../experiments/react19-reducer/array-transfer.mjs';
const filter=Array.prototype.filter,map=Array.prototype.map;
function fixture({source=[{},{}],predicate=()=>true,project=()=>({})}={}){
 const observer=createArrayTransferObserver(),filtered=observer.call(filter,source,[predicate]),mapped=observer.call(map,filtered,[project]);
 return{observer,source,filtered,mapped,query:(index=0,changes={})=>observer.snapshot({source,filtered,mapped,item:filtered[index],element:mapped[index],...changes})};
}
function unknown(result){assert.equal(result.status,'Unknown/Unsupported');assert.equal(result.fullPath,false);assert.equal(result.transfer,null);}
test('construction is inert; an unobserved identity cannot produce a transfer',()=>{
 const o=createArrayTransferObserver();assert.deepEqual(o.retention(),{calls:0,yields:0,stopped:false,overflow:false});unknown(o.snapshot({source:[],filtered:[],mapped:[],item:{},element:{}}));
});
test('distinct equal rows retain exact native callback indices and opaque transfer identities',()=>{
 const a={text:'SAME'},b={text:'SAME'},f=fixture({source:[a,b]}),one=f.query(0),two=f.query(1);
 for(const r of[one,two]){assert.equal(r.status,'Observed');assert.equal(r.fullPath,false);assert.equal(r.fieldOwnership,'Unknown/Unsupported');assert.equal(r.selectedPropertyOrigin,'Unknown/Unsupported');assert.equal(r.currentMembership,'Unknown/Unsupported');assert(r.transfer.sourceId);assert(r.transfer.filterCallId);assert(r.transfer.mapCallId);}
 assert.notEqual(one.transfer.itemId,two.transfer.itemId);assert.notEqual(one.transfer.elementId,two.transfer.elementId);assert.equal(one.transfer.sourceIndex,0);assert.equal(two.transfer.sourceIndex,1);assert.equal(two.transfer.mapIndex,1);assert.equal(one.transfer.sourceId,two.transfer.sourceId);assert.equal(f.observer.retention().calls,2);
});
test('equal-value copies, wrong arrays and wrong element cannot borrow a transfer',()=>{
 const f=fixture({source:[{text:'SAME'},{text:'SAME'}]});
 for(const changes of[{source:[...f.source]},{filtered:[...f.filtered]},{mapped:[...f.mapped]},{item:{text:'SAME'}},{item:f.filtered[1]},{element:{}},{element:f.mapped[1]}])unknown(f.query(0,changes));
});
test('excluded row is not supplied by an adjacent successful filter result',()=>{
 const a={},b={},f=fixture({source:[a,b],predicate:(_,i)=>i===1});assert.equal(f.query().status,'Observed');assert.equal(f.query().transfer.sourceIndex,1);assert.equal(f.query().transfer.mapIndex,0);unknown(f.query(0,{item:a}));
});
test('sparse native arrays retain original holes and callback indices',()=>{
 const a={},b={},source=[,a,,b],o=createArrayTransferObserver(),calls=[];
 const filtered=o.call(filter,source,[(value,index,array)=>{calls.push([value,index,array]);return true;}]),mapped=o.call(map,filtered,[()=>({})]);
 assert.deepEqual(calls.map(x=>x[1]),[1,3]);assert(calls.every(x=>x[2]===source));assert.equal(0 in source,false);assert.equal(2 in source,false);const r=o.snapshot({source,filtered,mapped,item:b,element:mapped[1]});assert.equal(r.status,'Observed');assert.equal(r.transfer.sourceIndex,3);assert.equal(r.transfer.mapIndex,1);
 const sparse=o.call(map,source,[x=>x]);assert.equal(0 in sparse,false);assert.equal(2 in sparse,false);assert.equal(sparse[1],a);assert.equal(sparse[3],b);
});
test('original callback this, exact three arguments and return identity are preserved once',()=>{
 const o=createArrayTransferObserver(),source=[{},{}],context={},returns=[{},{}],seen=[];
 const result=o.call(map,source,[function(value,index,array){assert.equal(this,context);assert.equal(arguments.length,3);seen.push([value,index,array]);return returns[index];},context]);
 assert.deepEqual(seen.map(x=>x[1]),[0,1]);assert(seen.every(x=>x[2]===source));assert.equal(result[0],returns[0]);assert.equal(result[1],returns[1]);
});
test('the argument tuple callback and thisArg getters are consumed exactly once like Reflect.apply',()=>{
 function run(observed){const o=createArrayTransferObserver(),source=[{}],seen=[],context={},callback=function(value,index,array){assert.equal(this,context);assert.equal(array,source);return value;},args={get length(){seen.push('length');return 2;},get 0(){seen.push('callback');return callback;},get 1(){seen.push('thisArg');return context;}};const result=observed?o.call(map,source,args):Reflect.apply(map,source,args);assert.equal(result[0],source[0]);return seen;}
 assert.deepEqual(run(true),run(false));
});
test('the original callback error is rethrown and a failed call supplies no completed evidence',()=>{
 const o=createArrayTransferObserver(),source=[{},{}],error={},calls=[];assert.throws(()=>o.call(filter,source,[(value,index)=>{calls.push(index);if(index===1)throw error;return true;}]),e=>e===error);assert.deepEqual(calls,[0,1]);
 const filtered=source.slice(),mapped=o.call(map,filtered,[()=>({})]);unknown(o.snapshot({source,filtered,mapped,item:source[0],element:mapped[0]}));
});
test('foreign methods receive their original callback identity, receiver and argument order',()=>{
 const o=createArrayTransferObserver(),source=[],callback=()=>{},context={},answer={};let calls=0;function foreign(a,b){calls++;assert.equal(this,source);assert.equal(arguments.length,2);assert.equal(a,callback);assert.equal(b,context);return answer;}
 assert.equal(o.call(foreign,source,[callback,context]),answer);assert.equal(calls,1);assert.equal(o.retention().calls,0);const error={};function fail(){throw error;}assert.throws(()=>o.call(fail,source,[callback]),e=>e===error);
});
test('nonfunction callback and arraylike receiver keep native behavior without evidence',()=>{
 const o=createArrayTransferObserver(),arraylike={0:{},length:1};assert.throws(()=>o.call(filter,[],[null]),TypeError);const filtered=o.call(filter,arraylike,[()=>true]),mapped=o.call(map,filtered,[()=>({})]);assert.equal(filtered[0],arraylike[0]);unknown(o.snapshot({source:arraylike,filtered,mapped,item:arraylike[0],element:mapped[0]}));
});
test('mutating the source during the callback has the same native visits and output',()=>{
 function run(observed){const o=createArrayTransferObserver(),source=[1,2,3],seen=[],callback=(value,index,array)=>{seen.push([value,index]);if(index===0){array.push(4);delete array[1];}return true;};const result=observed?o.call(filter,source,[callback]):filter.call(source,callback);return{source,seen,result};}
 assert.deepEqual(run(true),run(false));
});
test('array Proxy getters, has and ownKeys run only as often as the original native operations',()=>{
 function run(observed){const o=createArrayTransferObserver(),traps=[],source=new Proxy([{},{}],{get(t,k,r){traps.push(['get',String(k)]);return Reflect.get(t,k,r);},has(t,k){traps.push(['has',String(k)]);return Reflect.has(t,k);},ownKeys(t){traps.push(['keys']);return Reflect.ownKeys(t);},getOwnPropertyDescriptor(t,k){traps.push(['descriptor',String(k)]);return Reflect.getOwnPropertyDescriptor(t,k);}});const predicate=()=>true;const filtered=observed?o.call(filter,source,[predicate]):filter.call(source,predicate);const mapped=observed?o.call(map,filtered,[()=>({})]):map.call(filtered,()=>({}));if(observed)assert.equal(o.snapshot({source,filtered,mapped,item:filtered[0],element:mapped[0]}).status,'Observed');return traps;}
 assert.deepEqual(run(true),run(false));
});
test('opaque item, predicate-result and element Proxies are never inspected',()=>{
 let traps=0;const opaque=()=>new Proxy({},{get(){traps++;throw Error('get');},ownKeys(){traps++;throw Error('keys');},getOwnPropertyDescriptor(){traps++;throw Error('descriptor');}}),item=opaque(),truthy=opaque(),element=opaque(),f=fixture({source:[item],predicate:()=>truthy,project:()=>element});assert.equal(f.query().status,'Observed');assert.equal(traps,0);
});
test('nested native calls retain separate source/result identities',()=>{
 const o=createArrayTransferObserver(),source=[{}],inner=[{}];let innerResult;
 const filtered=o.call(filter,source,[()=>{innerResult=o.call(map,inner,[()=>({})]);return true;}]),mapped=o.call(map,filtered,[()=>({})]);assert.equal(o.retention().calls,3);assert.equal(o.snapshot({source,filtered,mapped,item:source[0],element:mapped[0]}).status,'Observed');unknown(o.snapshot({source,filtered,mapped:innerResult,item:source[0],element:innerResult[0]}));
});
test('a map of a species-leaked result before filter completion is not a filter-to-map transfer',()=>{
 const o=createArrayTransferObserver(),item={},element={},source=[item];let leaked,mapped;
 class Leaked extends Array{constructor(length){super(length);this[0]=item;leaked=this;}}
 Object.defineProperty(source,'constructor',{value:{[Symbol.species]:Leaked}});
 const filtered=o.call(filter,source,[()=>{const early=leaked;mapped=o.call(map,early,[()=>element]);return true;}]);
 assert.equal(filtered[0],item);assert.equal(mapped[0],element);unknown(o.snapshot({source,filtered,mapped,item,element}));
});
test('species Proxy storage substitution preserves only callback identity, never causal storage transfer',()=>{
 const o=createArrayTransferObserver(),item={},copy={},element={},source=[item];
 class Storage{constructor(){return new Proxy([],{defineProperty(target,key,d){return Reflect.defineProperty(target,key,/^\d+$/.test(String(key))?{...d,value:copy}:d);},get(target,key,receiver){return key==='0'?item:Reflect.get(target,key,receiver);}});}}
 Object.defineProperty(source,'constructor',{value:{[Symbol.species]:Storage}});
 const filtered=o.call(filter,source,[()=>true]),mapped=o.call(map,filtered,[()=>element]);assert.equal(Object.getOwnPropertyDescriptor(filtered,'0').value,copy);
 const r=o.snapshot({source,filtered,mapped,item,element});assert.equal(r.status,'Observed');assert.equal(r.resultStorage,'Unknown/Unsupported');assert.equal(r.causalTransfer,'Unknown/Unsupported');assert.equal(r.fullPath,false);
});
test('duplicate accepted alias slots are ambiguous; a unique accepted slot stays exact',()=>{
 const item={},f=fixture({source:[item,item]});unknown(f.query());unknown(f.query(1));const unique=fixture({source:[item,item],predicate:(_,i)=>i===1});assert.equal(unique.query().status,'Observed');assert.equal(unique.query().transfer.sourceIndex,1);
});
test('a same-value new row and arrays do not reuse a previous transfer occurrence',()=>{
 const o=createArrayTransferObserver(),a={text:'SAME'},b={text:'SAME'},source=[a],filtered=o.call(filter,source,[()=>true]),mapped=o.call(map,filtered,[()=>({})]),next=[b],nextFiltered=o.call(filter,next,[()=>true]),nextMapped=o.call(map,nextFiltered,[()=>({})]);const query=(s,f,m,i,e)=>o.snapshot({source:s,filtered:f,mapped:m,item:i,element:e});assert.equal(query(next,nextFiltered,nextMapped,b,nextMapped[0]).status,'Observed');unknown(query(next,nextFiltered,nextMapped,a,nextMapped[0]));unknown(query(source,filtered,mapped,b,mapped[0]));
});
test('retained observation never asserts current membership or field ownership after mutation',()=>{
 const f=fixture(),item=f.filtered[0],element=f.mapped[0];f.source.length=0;f.filtered.length=0;const r=f.observer.snapshot({source:f.source,filtered:f.filtered,mapped:f.mapped,item,element});assert.equal(r.status,'Observed');assert.equal(r.currentMembership,'Unknown/Unsupported');assert.equal(r.fieldOwnership,'Unknown/Unsupported');assert.equal(r.fullPath,false);
});
test('stop drops evidence and references while native execution continues',()=>{
 const f=fixture();f.observer.stop();assert.deepEqual(f.observer.retention(),{calls:0,yields:0,stopped:true,overflow:false});unknown(f.query());let calls=0;assert.deepEqual(f.observer.call(map,[1,2],[x=>{calls++;return x+1;}]),[2,3]);assert.equal(calls,2);f.observer.stop();assert.equal(f.observer.retention().calls,0);
});
test('call capacity fails evidence closed and preserves every native callback',()=>{
 const o=createArrayTransferObserver(),source=[{}];let callbacks=0;for(let i=0;i<65;i++)assert.equal(o.call(filter,source,[()=>{callbacks++;return true;}]).length,1);assert.equal(callbacks,65);assert.equal(o.retention().overflow,true);assert(o.retention().calls<=64);const filtered=o.call(filter,source,[()=>true]),mapped=o.call(map,filtered,[()=>({})]);unknown(o.snapshot({source,filtered,mapped,item:source[0],element:mapped[0]}));
});
test('yield capacity fails evidence closed without stopping a long original call',()=>{
 const o=createArrayTransferObserver(),source=Array.from({length:513},()=>({}));let callbacks=0;const filtered=o.call(filter,source,[()=>{callbacks++;return true;}]),mapped=o.call(map,filtered,[()=>({})]);assert.equal(callbacks,513);assert.equal(filtered.length,513);assert.equal(mapped.length,513);assert.equal(o.retention().overflow,true);assert(o.retention().yields<=512);unknown(o.snapshot({source,filtered,mapped,item:source[0],element:mapped[0]}));
});
