// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {makeQueryProbe} from "../src/engine/query-vendor.mjs";
const probe=await import("../src/first-read/query-contracts.mjs").catch(e=>{if(e.code!=='ERR_MODULE_NOT_FOUND')throw e;return {};});
let serial=0;
test('nonfinite or oversized primitive metadata never masquerades as a known null or truncated scalar',async()=>{
 const ledger=await import("../src/first-read/query-ledger.mjs?scalar-bounds");
 ledger.firstQueryTap('bounds',NaN,Infinity,-Infinity,'x'.repeat(129),null);
 const args=ledger.firstQuerySnapshot().events[0].args;
 for(const value of args.slice(0,4)){assert.equal(value.type,'Unsupported');assert.equal(Object.hasOwn(value,'value'),false);}
 assert.deepEqual(args[4],{type:'null',value:null});
});
async function queryModule(instrumented){
 assert.equal(typeof probe.queryFirstReadPlugin,'function','first-read Query acquisition missing');
 const built=await build({stdin:{contents:'export {QueryClient,notifyManager} from "@tanstack/query-core"; export {firstQuerySnapshot,firstQueryObjectId} from "stateatom:first-read-query-ledger";',resolveDir:process.cwd()},bundle:true,write:false,platform:'neutral',format:'esm',plugins:instrumented==='composed'?[probe.queryFirstReadPlugin({instrument:false}),makeQueryProbe(process.cwd(),{queryCallCensus:true,queryWriteAccessGuards:true,firstReadContracts:true}).plugin]:[probe.queryFirstReadPlugin({instrument:instrumented})],logLevel:'silent'});
 return import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text+'\n// distinct test module '+(++serial)).toString('base64'));
}
// Missing notification tracking would accept a same-value callback writer as an
// empty-listener branch. These run the actual pinned Query bodies, not a mock.
test('actual Query first-data branch records direct updater and empty notification loops without altering object identity',async()=>{
 const{QueryClient,firstQuerySnapshot,firstQueryObjectId}=await queryModule(true),client=new QueryClient(),account=JSON.parse('{"rules":{"quota":12}}');
 const result=client.setQueryData(['account'],account);assert.equal(result,account);assert.equal(client.getQueryData(['account']),account);assert.equal(account.rules.quota,12);
 const records=firstQuerySnapshot().events,accountId=firstQueryObjectId(account);
 assert(records.some(r=>r.kind==='client'&&r.args[1].value===0));
 assert(records.some(r=>r.kind==='updater'&&r.args[0].id===accountId&&r.args[1].type==='undefined'&&r.args[2].type==='undefined'));
 assert(records.some(r=>r.kind==='sharing'&&r.args[0].type==='undefined'&&r.args[1].id===accountId&&r.args[2].value==='undefined'));
 assert(records.filter(r=>r.kind==='cache-notify').every(r=>r.args[2].value===0&&r.args[3].value==='Unknown/Unsupported'));
 assert(records.filter(r=>r.kind==='query-notify').every(r=>r.args[2].value===0&&r.args[3].value==='Unknown/Unsupported'));
 assert.equal(records.filter(r=>r.kind==='cache-notify').length,2);assert.equal(records.filter(r=>r.kind==='query-notify').length,1);
 assert(!JSON.stringify(firstQuerySnapshot()).includes('quota'));client.clear();
});
test('actual client/cache/query/data identities do not borrow another fresh client with the same updater object',async()=>{
 const{QueryClient,firstQuerySnapshot,firstQueryObjectId}=await queryModule(true),a=new QueryClient(),b=new QueryClient(),account={rules:{quota:12}};
 try{a.setQueryData(['account'],account);b.setQueryData(['account'],account);const e=firstQuerySnapshot().events;
  for(const client of[a,b]){const id=firstQueryObjectId(client),created=e.find(r=>r.kind==='client'&&r.args[0].id===id),updater=e.find(r=>r.kind==='updater'&&r.args[3]?.id===id),query=e.find(r=>r.kind==='query-create'&&r.args[1].id===id);assert(created.args[2].id);assert(updater);assert(query);
   const data=e.find(r=>r.kind==='query-data'&&r.args[0].id===query.args[0].id);assert.equal(data.args[1].id,firstQueryObjectId(account));assert.equal(data.args[2].id,firstQueryObjectId(account));assert.equal(updater.args[4].id,firstQueryObjectId(account));assert(e.some(r=>r.kind==='cache-notify'&&r.args[0].id===created.args[2].id));
  }
 }finally{a.clear();b.clear();}
});
test('same-value listener/sharing effects remain visible and original callback errors/counts match off/on',async()=>{
 for(const enabled of [false,true]){
  const{QueryClient,notifyManager,firstQuerySnapshot}=await queryModule(enabled);let listeners=0,sharing=0;const account={rules:{quota:12}},client=new QueryClient({defaultOptions:{queries:{structuralSharing:(_a,b)=>{sharing++;account.rules.quota=12;return b;}}}});
  const unsubscribe=client.getQueryCache().subscribe(()=>{listeners++;account.rules.quota=12;});assert.equal(client.setQueryData(['account'],account),account);assert.equal(listeners,2);assert.equal(sharing,1);assert.equal(account.rules.quota,12);
  if(enabled){const records=firstQuerySnapshot().events;assert(records.some(r=>r.kind==='sharing'&&r.args[2].value==='function'));assert(records.filter(r=>r.kind==='cache-notify').every(r=>r.args[2].value===1));assert(records.some(r=>r.kind==='subscribe'));}
  unsubscribe();const error={original:true},stop=client.getQueryCache().subscribe(()=>{throw error;});assert.throws(()=>client.setQueryData(['other'],account),e=>e===error);stop();
  notifyManager.setNotifyFunction(fn=>fn());if(enabled)assert(firstQuerySnapshot().events.some(r=>r.kind==='notify-config'));client.clear();
 }
});
test('branch telemetry does not adopt a public callback, inspect proxy fields, or call replaced collection/scalar methods',async()=>{
 const ledger=await import("../src/first-read/query-ledger.mjs?intrinsic-control");let traps=0,calls=0;
 const proxy=new Proxy({},{get(){traps++;throw Error('get');},getOwnPropertyDescriptor(){traps++;throw Error('describe');},ownKeys(){traps++;throw Error('keys');}});
 const oldSlice=String.prototype.slice,oldFinite=Number.isFinite,oldIncludes=Array.prototype.includes,oldGet=WeakMap.prototype.get,oldPush=Array.prototype.push;
 Object.defineProperty(globalThis,'__STATEATOM_FIRST_READ_TAP__',{configurable:true,get(){traps++;throw Error('public callback');}});
 let snapshot;try{
  String.prototype.slice=function(){calls++;throw Error('replaced slice');};Number.isFinite=()=>{calls++;throw Error('replaced finite');};Array.prototype.includes=function(){calls++;throw Error('replaced includes');};WeakMap.prototype.get=function(){calls++;throw Error('replaced weak get');};Array.prototype.push=function(){calls++;throw Error('replaced push');};
  ledger.firstQueryTap('control',proxy,42,'undefined');snapshot=ledger.firstQuerySnapshot();
 }finally{String.prototype.slice=oldSlice;Number.isFinite=oldFinite;Array.prototype.includes=oldIncludes;WeakMap.prototype.get=oldGet;Array.prototype.push=oldPush;delete globalThis.__STATEATOM_FIRST_READ_TAP__;}
 assert.equal(traps,0);assert.equal(calls,0);assert.equal(snapshot.status,'Observed');assert.equal(snapshot.events.length,1);assert.equal(snapshot.events[0].args[1].value,42);
 ledger.stopFirstQuery();assert.equal(ledger.firstQuerySnapshot().events.length,0);assert.equal(ledger.firstQueryObjectId(proxy),null);
});
test('noncallable original notification methods keep their native TypeError messages',async()=>{
 const messages={off:[],on:[]};for(const enabled of [false,true]){
  const{QueryClient}=await queryModule(enabled),client=new QueryClient(),cache=client.getQueryCache();cache.listeners.forEach=0;
  assert.throws(()=>client.setQueryData(['account'],{rules:{quota:12}}),e=>{messages[enabled?'on':'off'].push(e.message);return e instanceof TypeError;});
  delete cache.listeners.forEach;client.setQueryData(['account'],{rules:{quota:12}});const query=cache.find({queryKey:['account']});query.observers.forEach=0;
  assert.throws(()=>client.setQueryData(['account'],{rules:{quota:12}}),e=>{messages[enabled?'on':'off'].push(e.message);return e instanceof TypeError;});delete query.observers.forEach;client.clear();
 }
 assert.deepEqual(messages.off,['this.listeners.forEach is not a function','this.observers.forEach is not a function']);assert.deepEqual(messages.on,messages.off);
});
test('malformed event kind cannot retain or expose an application object graph',async()=>{
 const ledger=await import("../src/first-read/query-ledger.mjs?malformed-kind");let traps=0;const kind=new Proxy({secret:{graph:true}},{get(){traps++;throw Error('get');},ownKeys(){traps++;throw Error('keys');},getOwnPropertyDescriptor(){traps++;throw Error('describe');}});
 ledger.firstQueryTap(kind,{private:true});const snapshot=ledger.firstQuerySnapshot();assert.equal(snapshot.status,'Unknown/Unsupported');assert.deepEqual(snapshot.events,[]);assert.doesNotThrow(()=>JSON.stringify(snapshot));assert.equal(traps,0);
});

test('first-read branch taps compose with original pinned Query handoff/call/write guards',async()=>{
 const{QueryClient,firstQuerySnapshot,firstQueryObjectId}=await queryModule('composed'),client=new QueryClient(),account={rules:{quota:12}};
 assert.equal(client.setQueryData(['account'],account),account);assert.equal(client.getQueryData(['account']),account);const records=firstQuerySnapshot().events,id=firstQueryObjectId(account);
 assert(records.some(r=>r.kind==='updater'&&r.args[0].id===id));assert.equal(records.filter(r=>r.kind==='cache-notify').length,2);assert(records.some(r=>r.kind==='sharing'&&r.args[1].id===id));client.clear();
});
test('identical module bytes at distinct ESM identities cannot share ledger or object-id authority',async()=>{
 const a=await import("../src/first-read/query-ledger.mjs?incarnation-a"),b=await import("../src/first-read/query-ledger.mjs?incarnation-b"),value={};
 assert.notEqual(a.firstQuerySnapshot().id,b.firstQuerySnapshot().id);assert.notEqual(a.firstQueryObjectId(value),b.firstQueryObjectId(value));
 a.firstQueryTap('control',value);assert.equal(a.firstQuerySnapshot().events.length,1);assert.equal(b.firstQuerySnapshot().events.length,0);
});
test('original listener receiver/callee getters run only their original two lookups off/on',async()=>{
 for(const enabled of [false,true]){const{QueryClient}=await queryModule(enabled),client=new QueryClient(),cache=client.getQueryCache(),listeners=cache.listeners,nativeEach=Set.prototype.forEach;let receiverGets=0,calleeGets=0;
  Object.defineProperty(cache,'listeners',{configurable:true,get(){receiverGets++;return listeners;}});Object.defineProperty(listeners,'forEach',{configurable:true,get(){calleeGets++;return nativeEach;}});
  const account={rules:{quota:12}};assert.equal(client.setQueryData(['account'],account),account);
  Object.defineProperty(cache,'listeners',{configurable:true,value:listeners,writable:true});delete listeners.forEach;client.clear();assert.equal(receiverGets,2);assert.equal(calleeGets,2);
 }
});
test('sharing-property getter/proxy counts and original thrown values survive the first-read transform',async()=>{
 for(const enabled of [false,true]){
  const output=await build({stdin:{contents:'export {replaceData} from "./node_modules/@tanstack/query-core/build/modern/utils.js";',resolveDir:process.cwd()},bundle:true,write:false,platform:'neutral',format:'esm',plugins:[probe.queryFirstReadPlugin({instrument:enabled})],logLevel:'silent'});
  const{replaceData}=await import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text+'\n// utility control '+(++serial)).toString('base64'));
  const account={rules:{quota:12}};let gets=0,descriptors=0,calls=0;const options=new Proxy({},{get(_target,key){assert.equal(key,'structuralSharing');gets++;return undefined;},getOwnPropertyDescriptor(){descriptors++;throw Error('extra descriptor');}});
  assert.equal(replaceData(undefined,account,options),account);assert.equal(gets,2);assert.equal(descriptors,0);
  const sharing={get structuralSharing(){calls++;return(_old,data)=>data;}};assert.equal(replaceData(undefined,account,sharing),account);assert.equal(calls,2);
  const error={original:true};assert.throws(()=>replaceData(undefined,account,{get structuralSharing(){throw error;}}),e=>e===error);
 }
});
