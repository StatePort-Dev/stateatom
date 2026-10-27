// SPDX-License-Identifier: Apache-2.0
// Actual runtime declarations in an owned VM; no browser/performance evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parse} from '@babel/parser';
import generatorModule from '@babel/generator';
import {inputCaptureRuntimeFixture} from '../helpers/input-capture-runtime-fixture.mjs';
const generate=generatorModule.default||generatorModule;
const source=await readFile(new URL('../../packages/atom/src/runtime.mjs',import.meta.url),'utf8');
const ast=parse(source,{sourceType:'module'});
const runtime=ast.program.body.find(n=>n.type==='ExportNamedDeclaration'&&n.declaration?.id?.name==='createAtomRuntime').declaration;
const cap=runtime.body.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='cap');
const helper=ast.program.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='requestPrefixDrop');
assert(cap);
const now=1000000,cutoff=now-300000,limit=256000;
function run(records){
 const serializations=[];
 const context=vm.createContext({Date:{now:()=>now},JSON:{stringify(value){const text=JSON.stringify(value);serializations.push(text.length);return text;}},journalGap(){throw Error('Unexpected journal change');},newFetchBindings(){throw Error('Unexpected binding change');}});
 new vm.Script((helper?generate(helper).code+'\n':'')+'globalThis.runCap='+generate(cap).code).runInContext(context);
 const s={requests:records,samples:[],pending:{},events:[]};
 context.runCap(s);return{requests:s.requests,serializations};
}
// Unchanged legacy retention is the comparison oracle, not the new scanner.
function legacy(records){const out=records.filter(r=>r.time>cutoff).slice(-32);while(JSON.stringify(out).length>limit)out.shift();return out;}
function equivalent(records){const expected=legacy(records),actual=run(records);assert.equal(actual.requests.length,expected.length);for(let i=0;i<expected.length;i++)assert.equal(actual.requests[i],expected[i]);assert(JSON.stringify(actual.requests).length<=limit);return actual;}
const row=(id,json,extra={})=>Object.freeze({id,time:now,json,...extra});
function sized(length,id='large'){const base=row(id,{text:''}),overhead=JSON.stringify([base]).length;return row(id,{text:'x'.repeat(length-overhead)});}

test('empty private request list requires no serialization',()=>{const r=equivalent([]);assert.deepEqual(r.serializations,[]);});
test('nonempty in-budget records retain original references and serialize once',()=>{const records=[row('a',{ok:true}),row('b',{n:2})],r=equivalent(records);assert.deepEqual(r.requests,records);assert.equal(r.serializations.length,1);});
test('time cutoff and last32 order stay exact before byte trimming',()=>{const records=[row('expired',null,{time:cutoff}),...Array.from({length:36},(_,i)=>row('q'+i,{i},{time:cutoff+1+i}))];const r=equivalent(records);assert.equal(r.requests.length,32);assert.equal(r.requests[0].id,'q4');assert.equal(r.serializations.length,1);});
test('exact256000UTF16characters fit and one additional character removes the row',()=>{for(const n of[limit-1,limit,limit+1]){const record=sized(n),r=equivalent([record]);assert.equal(JSON.stringify([record]).length,n);assert.equal(r.requests.length,n<=limit?1:0);}});
test('over-budget newest row evicts all32 without repeatedly serializing suffixes',()=>{const records=[...Array.from({length:31},(_,i)=>row('q'+i,{n:i})),sized(limit+1)],r=equivalent(records);assert.equal(r.requests.length,0);assert.equal(r.serializations.length,1);});
test('escaped strings and nested delimiters cannot create a false row boundary',()=>{const text='quotes" slash\\ comma, brackets[] braces{} newline\n astral😀 lone\ud800';const records=Array.from({length:32},(_,i)=>row('q'+i,{nested:[null,false,true,0,-1,{text:text.repeat(200),s:'\\"],}'}]},i%2?{inputBody:text.repeat(180)}:{}));const r=equivalent(records);assert(r.requests.length>0&&r.requests.length<32);assert.equal(r.serializations.length,1);});
test('retention uses UTF16JSONlength without changing to UTF8 byte accounting',()=>{const records=Array.from({length:32},(_,i)=>row('unicode'+i,{text:'😀Ж'.repeat(2800)}));const r=equivalent(records);assert(r.requests.length>0&&r.requests.length<32);assert.equal(r.serializations.length,1);});
test('bounded varied JSON records preserve the same shortest deleted prefix',()=>{
 for(let seed=0;seed<24;seed++){
  const records=Array.from({length:40},(_,i)=>row('s'+seed+'q'+i,{key:'},[\\"'.repeat((i*7+seed)%19),array:[seed,i,null,true,{str:('x😀\\\n'+seed).repeat(((i*37+seed*17)%1200)+1)}]},{time:i%13===0?cutoff:now}));
  const r=equivalent(records);assert(r.serializations.length<=1);
 }
});
test('real source runtime over synthetic CDP keeps the same newest response under the private budget',async t=>{
 const body=JSON.stringify({flag:true,text:'x'.repeat(119000)});
 const f=inputCaptureRuntimeFixture({send:m=>m==='Network.getResponseBody'?{body,base64Encoded:false}:undefined});t.after(()=>f.runtime.shutdown());
 await f.request({op:'attach'});
 for(let i=1;i<=3;i++)await f.network(i);
 const s=await f.request({op:'state',refreshDeep:false});
 assert.deepEqual(s.requests.map(r=>r.id),['q3']);
 assert.equal(s.requests[0].inputBody,body);assert.equal(s.requests[0].json.text.length,119000);
 assert.equal(s.bufferBytes,JSON.stringify(s.requests).length);assert(s.bufferBytes<=limit);
 assert.equal(f.calls.filter(c=>c.m==='Network.getResponseBody').length,3);
});
test('real source runtime drops an oversized newest escaped response instead of retaining an over-budget row',async t=>{
 let body=JSON.stringify({flag:true});
 const f=inputCaptureRuntimeFixture({send:m=>m==='Network.getResponseBody'?{body,base64Encoded:false}:undefined});t.after(()=>f.runtime.shutdown());
 await f.request({op:'attach'});await f.network(1);
 assert.equal((await f.request({op:'state',refreshDeep:false})).requests.length,1);
 body=JSON.stringify({text:'"'.repeat(60000)});assert(body.length<128000);
 await f.network(2);const s=await f.request({op:'state',refreshDeep:false});
 assert.deepEqual(s.requests,[]);assert.equal(s.bufferBytes,2);
});
