// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {instrumentEntries} from "../experiments/compiler/entry-records.mjs";
const source=await readFile(new URL("../src/engine/observer.mjs",import.meta.url),'utf8');
const meta={file:'controlled.ts',key:'member',expression:'object.quota'};
let serial=0;
async function setup(){
 let text=instrumentEntries(source,{retainOperands:true}).code;
 for(const file of['query-handoff.mjs','react-state.mjs','action-observer.mjs','react19-acquisition.mjs'])text=text.replaceAll(`'./${file}'`,JSON.stringify(new URL("../src/engine/"+file,import.meta.url).href)).replaceAll(`"./${file}"`,JSON.stringify(new URL("../src/engine/"+file,import.meta.url).href));
 const m=await import('data:text/javascript;base64,'+Buffer.from(text+'\nexport const log=__sa_invocation_log;').toString('base64')+'#operands-'+(++serial));
 const env=()=>{class Response extends globalThis.Response{}return{crypto,Response,fetch:()=>Promise.resolve(new Response('{}')),location:{href:'http://127.0.0.1:4173/'}};};return{log:m.log,create:()=>m.createObserver(env())};
}
test('entry operands retain exact receiver and original object key without extra coercion or getter reads',async()=>{
 const {log,create}=await setup(),o=create();let keys=0,reads=0;const key={[Symbol.toPrimitive](){keys++;return 'quota';}},receiver={get quota(){reads++;return 12;}};
 try{assert.equal(o.member(meta,receiver,key),12);assert.equal(keys,1);assert.equal(reads,1);assert.equal(log.entries[1].receiver,receiver);assert.equal(log.entries[1].key,key);assert.equal(log.entries[1].readCompleted,true);assert.equal(log.entries[1].readValue,12);assert.equal(Object.hasOwn(log.entries[1],'meta'),false);}finally{o.stop();}
});
test('operand acquisition preserves original proxy operation count and exact thrown value',async()=>{
 const {log,create}=await setup(),o=create(),error={original:true};let gets=0,descriptors=0;const receiver=new Proxy({},{get(){gets++;throw error;},getOwnPropertyDescriptor(){descriptors++;throw Error('unrequested descriptor');}});
 try{assert.throws(()=>o.member(meta,receiver,'quota'),e=>e===error);assert.equal(gets,1);assert.equal(descriptors,0);assert.equal(log.entries[1].receiver,receiver);assert.equal(log.entries[1].key,'quota');assert.equal(log.entries[1].nodeId,null);assert.equal(log.entries[1].readCompleted,false);}finally{o.stop();}
});
test('stop drops only that observer retained operands and later inactive reads retain nothing',async()=>{
 const {log,create}=await setup(),a=create(),b=create(),left={quota:12},right={quota:777};
 try{a.member(meta,left,'quota');b.member(meta,right,'quota');const rightEntry=log.entries[2];a.stop();assert.equal(Object.hasOwn(log.entries,'1'),false);assert.equal(log.entries[2],rightEntry);assert.equal(log.entries[2].receiver,right);a.member(meta,left,'quota');assert.equal(log.count,2);assert.equal(Object.keys(log.entries).length,1);a.stop();b.stop();assert.equal(Object.keys(log.entries).length,0);}finally{a.stop();b.stop();}
});
test('operand journal refuses overflow without retaining the 257th receiver',async()=>{
 const {log,create}=await setup(),o=create();try{for(let i=0;i<257;i++)o.member(meta,{quota:i},'quota');assert.equal(log.count,257);assert.equal(Object.keys(log.entries).length,256);assert.equal(log.overflow,true);assert.equal(log.entries[256].receiver.quota,255);assert.equal(log.entries[257],undefined);o.stop();assert.equal(Object.keys(log.entries).length,0);assert.equal(log.overflow,true);}finally{o.stop();}
});

test('nonprimitive and oversized string read results remain omitted while the original result returns unchanged',async()=>{
 const {log,create}=await setup(),o=create(),object={},text='x'.repeat(257);try{assert.equal(o.member(meta,{quota:object},'quota'),object);assert.equal(o.member(meta,{quota:text},'quota'),text);for(const e of Object.values(log.entries)){assert.equal(e.readCompleted,true);assert.equal(e.readValueRetained,false);assert.equal(e.readValue,undefined);}}finally{o.stop();}
});
test('captured scalar assignment never invokes an inherited readValue getter or setter',async()=>{
 const {create}=await setup(),o=create(),saved=Object.getOwnPropertyDescriptor(Object.prototype,'readValue'),error={applicationSetter:true};let calls=0;
 try{Object.defineProperty(Object.prototype,'readValue',{configurable:true,get(){calls++;throw error;},set(){calls++;throw error;}});assert.equal(o.member(meta,{quota:12},'quota'),12);assert.equal(calls,0);}finally{if(saved)Object.defineProperty(Object.prototype,'readValue',saved);else delete Object.prototype.readValue;o.stop();}
});
