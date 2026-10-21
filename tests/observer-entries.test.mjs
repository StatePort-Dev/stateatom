// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {instrumentEntries} from "../experiments/compiler/entry-records.mjs";
const source=await readFile(new URL("../src/engine/observer.mjs",import.meta.url),'utf8');
const env=()=>{class Response extends globalThis.Response{}return{crypto:globalThis.crypto,Response,fetch:()=>Promise.resolve(new Response('{}')),location:{href:'http://127.0.0.1:4173/'}};};
const meta={file:'controlled.ts',key:'m',expression:'object.quota'};
let moduleSerial=0;
async function setup(){
 const transformed=instrumentEntries(source);assert.equal(transformed.transformed,1,'actual observer member body must be instrumented');
 let text=transformed.code;for(const file of['query-handoff.mjs','react-state.mjs','action-observer.mjs'])text=text.replace(`'./${file}'`,JSON.stringify(new URL("../src/engine/"+file,import.meta.url).href)).replace(`"./${file}"`,JSON.stringify(new URL("../src/engine/"+file,import.meta.url).href));
 const module=await import('data:text/javascript;base64,'+Buffer.from(text+'\nexport const testLog=__sa_invocation_log;').toString('base64')+'#'+(++moduleSerial));return{factory:module.createObserver,log:module.testLog};
}
test('entry record retains exact member function and returned node without reading a getter twice',async()=>{
 const {factory,log}=await setup(),o=factory(env()),scope=o.scope();let reads=0;
 try{o.target({...meta,target:'t',property:'text'},scope,()=>o.member(meta,{get quota(){reads++;return 12;}},'quota'));const s=o.snapshot(scope+':t','text'),member=s.nodes.find(n=>n.kind==='member');assert.equal(reads,1);assert.equal(member.value,12);assert.equal(log.count,1);assert.equal(log.entries[1].callee,o.member);assert.equal(log.entries[1].page,s.page);assert.equal(log.entries[1].nodeId,member.id);}finally{o.stop();}
});
test('same function source in two factories never merges callee, page or node identity',async()=>{
 const {factory,log}=await setup(),a=factory(env()),b=factory(env());try{a.member(meta,{quota:12},'quota');b.member(meta,{quota:777},'quota');assert.notEqual(a.member,b.member);assert.equal(a.member.toString(),b.member.toString());assert.equal(log.entries[1].callee,a.member);assert.equal(log.entries[2].callee,b.member);assert.notEqual(log.entries[1].page,log.entries[2].page);assert.notEqual(log.entries[1].nodeId,log.entries[2].nodeId);}finally{a.stop();b.stop();}
});
test('original throwing getter has one entered record, no fabricated returned node and exact error identity',async()=>{
 const {factory,log}=await setup(),o=factory(env()),error={original:true};let reads=0;try{assert.throws(()=>o.member(meta,{get quota(){reads++;throw error;}},'quota'),e=>e===error);assert.equal(reads,1);assert.equal(log.count,1);assert.equal(log.entries[1].callee,o.member);assert.equal(log.entries[1].nodeId,null);}finally{o.stop();}
});
test('entry retention is capped and loss stays explicit',async()=>{
 const {factory,log}=await setup(),o=factory(env());try{for(let i=0;i<257;i++)assert.equal(o.member(meta,{quota:i},'quota'),i);assert.equal(log.count,257);assert.equal(Object.keys(log.entries).length,256);assert.equal(log.overflow,true);}finally{o.stop();}
});
test('unexpected member shape is rejected instead of silently claiming entry acquisition',()=>{assert.throws(()=>instrumentEntries('export function createObserver(){return {member(){return 1;}}}'),/one supported member/);});
