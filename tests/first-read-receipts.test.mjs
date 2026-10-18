// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../stateatom-phase2/engine/observer.mjs',import.meta.url),'utf8');
let serial=0;
async function setup(){
 const {instrumentReadReceipts}=await import('../stateatom-field-revision/observer-receipts.mjs');
 const ledgerURL=new URL('../stateatom-field-revision/query-ledger.mjs?receipt-'+(++serial),import.meta.url).href;
 let code=instrumentReadReceipts(source,{ledgerURL});
 for(const file of['query-handoff.mjs','react-state.mjs'])code=code.replaceAll(`'./${file}'`,JSON.stringify(new URL('../stateatom-phase2/engine/'+file,import.meta.url).href));
 const module=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64')+'#receipt-'+serial),ledger=await import(ledgerURL);
 class Response extends globalThis.Response{}const w={crypto,Response,fetch:()=>Promise.resolve(new Response('{"rules":{"quota":12}}')),location:{href:'http://127.0.0.1:4173/'}};
 const o=module.createObserver(w);return{w,o,ledger};
}
const meta={file:'controlled.ts',key:'quota',expression:'data.rules.quota'};
test('parse identity joins original reads separately while destructuring retains only a reconstructed receiver candidate',async()=>{
 const {w,o,ledger}=await setup();try{
  const data=await(await w.fetch('/account')).json();const scope=o.scope();
  const member=o.capture({...meta,kind:'binding'},scope,()=>o.member(meta,data.rules,'quota'));
  o.capture({...meta,key:'root',kind:'destructure-root'},scope,()=>data);
  const {rules:{quota}}=data;o.pattern(meta,scope,'quota',quota,'root',['rules','quota'],true);
  assert.equal(member,12);assert.equal(quota,12);const s=ledger.firstQuerySnapshot(),parse=s.events.find(e=>e.kind==='parse'),fields=s.events.filter(e=>e.kind==='field'||e.kind==='field-receiver-candidate');
  assert.equal(fields.length,2);assert.equal(parse.args[0].id,ledger.firstQueryObjectId(data));
  assert.equal(fields[0].kind,'field');assert.equal(fields[1].kind,'field-receiver-candidate');
  assert.notEqual(fields[0].args[0].value,fields[1].args[0].value);
  for(const f of fields){assert.equal(f.args[1].value,parse.args[0].id);assert.equal(f.args[2].value,ledger.firstQueryObjectId(data.rules));assert.equal(f.args[3].value,'/rules/quota');assert.equal(f.args[4].value,12);assert(f.sequence>parse.sequence);}
  const scopes=s.events.filter(e=>e.kind==='field-scope');assert.equal(scopes.length,2);assert(scopes.every(e=>e.args[1].value===scope));
 }finally{o.stop();}
});
test('a self-restoring getter cannot make a reconstructed destructuring receiver an observed actual receiver',async()=>{
 const {w,o,ledger}=await setup();try{
  const data=await(await w.fetch('/account')).json(),oldRules=data.rules,scope=o.scope();let reads=0;
  o.capture({...meta,key:'root',kind:'destructure-root'},scope,()=>data);
  const foreignRules={get quota(){reads++;return 12;}};
  Object.defineProperty(data,'rules',{configurable:true,get(){Object.defineProperty(data,'rules',{configurable:true,writable:true,enumerable:true,value:oldRules});return foreignRules;}});
  const {rules:{quota}}=data;o.pattern(meta,scope,'quota',quota,'root',['rules','quota'],true);
  const events=ledger.firstQuerySnapshot().events;assert.equal(reads,1);assert.equal(events.filter(e=>e.kind==='field').length,0);
  const candidate=events.find(e=>e.kind==='field-receiver-candidate');assert(candidate);assert.equal(candidate.args[2].value,ledger.firstQueryObjectId(oldRules));assert.notEqual(candidate.args[2].value,ledger.firstQueryObjectId(foreignRules));
 }finally{o.stop();}
});
test('read receipt acquisition leaves one original getter/key operation and its exact exception unchanged',async()=>{
 const {o,ledger}=await setup();let gets=0,keys=0,descriptors=0;const error={original:true},key={[Symbol.toPrimitive](){keys++;return 'quota';}},receiver=new Proxy({},{get(){gets++;throw error;},getOwnPropertyDescriptor(){descriptors++;throw Error('unexpected descriptor');}});
 try{assert.throws(()=>o.member(meta,receiver,key),e=>e===error);assert.equal(gets,1);assert.equal(keys,1);assert.equal(descriptors,0);assert.equal(ledger.firstQuerySnapshot().events.length,0);}finally{o.stop();}
});
test('invalidated field or an inactive observer cannot supply an original field receipt',async()=>{
 const {w,o,ledger}=await setup();try{
  const data=await(await w.fetch('/account')).json();data.rules.quota=13;o.member(meta,data.rules,'quota');
  o.stop();o.member(meta,data.rules,'quota');assert.equal(ledger.firstQuerySnapshot().events.filter(e=>e.kind==='field').length,0);
 }finally{o.stop();}
});
