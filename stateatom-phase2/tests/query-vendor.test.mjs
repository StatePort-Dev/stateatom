// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {transformQueryVendor,queryVendorHashes,makeQueryProbe} from '../engine/query-vendor.mjs';
import {root} from '../../scripts/vite-config.mjs';
test('Query vendor taps require exact pinned sources and guarded native sites',()=>{
 const probe=makeQueryProbe(root);assert.equal(probe.contract.status,'Observed');
 for(const file of Object.keys(queryVendorHashes)){
  const source=readFileSync(root+'/node_modules/'+file,'utf8'),out=transformQueryVendor(source,file);
  assert(out.code.includes('query5-native-handoff/1'));assert(out.outputBytes>out.sourceBytes);assert.throws(()=>transformQueryVendor(source+'\n',file),/digest mismatch/);
  if(file.endsWith('/query.js'))assert.equal(out.counts.state,9);
 }
});
import {stateatomPlugin} from '../engine/plugin.mjs';
test('Query acquisition is explicitly opt-in and requires source consumption',()=>{
 const off=stateatomPlugin({enabled:true,root});assert.equal(off.queryHandoffs,null);
 assert.throws(()=>stateatomPlugin({queryHandoffs:true,sourceConsumption:false}),/require source consumption/);
 const on=stateatomPlugin({enabled:true,root,queryHandoffs:true});const config=on.config({root});assert.equal(on.queryHandoffs.contract.status,'Observed');assert(config.optimizeDeps.include.includes('@tanstack/query-core'));assert.equal(config.optimizeDeps.esbuildOptions.plugins.length,1);
 assert(on.load('\0stateatom-runtime').includes('queryHandoffs:true'));assert(on.load('\0stateatom-query-handoff').includes('createQueryLedger'));
});
import {build} from 'esbuild';import vm from 'node:vm';
test('private native bundle preserves actual identities errors getters updaters listeners and sharing',async()=>{
 const fixture=root+'/stateatom-phase2/fixtures/react/query-controls.js';
 async function run(observed){const probe=makeQueryProbe(root),output=await build({stdin:{contents:`import {createQueryLedger} from './stateatom-phase2/engine/query-handoff.mjs';const ledger=createQueryLedger({page:'test'});globalThis.__STATEATOM__={queryObservations:()=>ledger.snapshot(),queryTap(adapter,kind,...args){return ledger[kind](...args);}};import '${fixture}';`,resolveDir:root},bundle:true,write:false,platform:'browser',format:'iife',plugins:observed?[probe.plugin]:[]});
  const context=vm.createContext({console,setTimeout,clearTimeout,fetch:async()=>({json:async()=>({rules:{quota:12},risk:{hold:true}})})});context.window=context;vm.runInContext(output.outputFiles[0].text,context);return JSON.parse(JSON.stringify(await context.runQueryControls()));
 }
 const off=await run(false),on=await run(true);assert.deepEqual(on.semantics,off.semantics);
 assert.deepEqual(on.semantics.proxy,{same:true,proxyGets:1,proxyDescriptors:0});assert.deepEqual(on.semantics.lateDescriptor,{same:true,calls:0});
 for(const name of ['twoClients','sharing','functional','custom','reentrant','nested','lateDescriptor','hashGetter','afterThrow'])assert(on.observations[name].some(e=>e.kind==='native-cache-read'),name);
 for(const name of ['substitution','competing','proxy','accessor','throwing','mapReplacement','configProxy','dataAccessor','prototypeProxy','badCall'])assert(!on.observations[name].some(e=>e.kind==='native-cache-read'),name);
 assert.equal(on.observations.nested.filter(e=>e.kind==='native-cache-read').length,2);assert.equal(on.ledger.fullPath,false);assert.equal(on.ledger.overflow,true);assert.equal(on.ledger.status,'Unknown/Unsupported');assert.deepEqual(on.semantics.hashGetter,{hashGets:2,same:true});
});
test('native Query telemetry does not invoke a later application Array iterator',async()=>{
 async function run(observed){const probe=makeQueryProbe(root),output=await build({stdin:{contents:`import {QueryClient} from '@tanstack/query-core';globalThis.__STATEATOM__={queryTap(){}};const client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity}}});client.setQueryData(['a'],1);const key=['a'],saved=Array.prototype[Symbol.iterator];let calls=0;Array.prototype[Symbol.iterator]=function(){calls++;return Reflect.apply(saved,this,[]);};let value;try{value=client.getQueryData(key);}finally{Array.prototype[Symbol.iterator]=saved;}globalThis.result={calls,value};`,resolveDir:root},bundle:true,write:false,platform:'browser',format:'iife',plugins:observed?[probe.plugin]:[]});const context=vm.createContext({setTimeout,clearTimeout});vm.runInContext(output.outputFiles[0].text,context);return JSON.parse(JSON.stringify(context.result));}
 assert.deepEqual(await run(true),await run(false));
});
import {createObserver} from '../engine/observer.mjs';
test('observer Query bridge also avoids application Array iterators',()=>{
 class R extends Response{}const w={Response:R,Promise,WeakRef,crypto,location:{href:'http://127.0.0.1:4173/'},fetch:()=>Promise.resolve(new R('{}'))};
 const o=createObserver(w,{sourceConsumption:true,queryHandoffs:true}),call=(kind,a,b,c,d,e)=>o.queryTap('query5-native-handoff/1',kind,a,b,c,d,e),map=new Map(),cache={},client={},state={data:12},query={state},get=function(){};
 call('state',state);call('cache',cache,map);call('client',client,cache);call('query',query,client,cache,state);call('cacheMethod',get);map.set('key',query);
 const saved=Array.prototype[Symbol.iterator];let calls=0;Array.prototype[Symbol.iterator]=function(){calls++;return Reflect.apply(saved,this,[]);};
 try{const frame=call('beginRead',client);call('got',cache,map,Map.prototype.get,'key',query);call('read',frame,{cache,callee:get,query,state,data:12});call('endRead',frame);call('returned',query,12);}finally{Array.prototype[Symbol.iterator]=saved;}
 assert.equal(calls,0);assert(o.queryObservations().events.some(e=>e.kind==='native-cache-read'));o.stop();
});
test('private native handoff keeps noncallable member-call TypeError messages',async()=>{
 async function run(observed){const probe=makeQueryProbe(root),output=await build({stdin:{contents:`import {QueryClient} from '@tanstack/query-core';globalThis.__STATEATOM__={queryTap(){}};const c=new QueryClient({defaultOptions:{queries:{gcTime:Infinity}}});c.getQueryCache().get=42;try{c.getQueryData(['bad']);}catch(e){globalThis.result={name:e.name,message:e.message};}`,resolveDir:root},bundle:true,write:false,platform:'browser',format:'iife',plugins:observed?[probe.plugin]:[]});const context=vm.createContext({setTimeout,clearTimeout});vm.runInContext(output.outputFiles[0].text,context);return JSON.parse(JSON.stringify(context.result));}
 assert.deepEqual(await run(true),await run(false));
});
test('private ledger app reads do not invoke a later public Array.push replacement',async()=>{
 async function run(observed){const probe=makeQueryProbe(root),output=await build({stdin:{contents:`import {QueryClient} from '@tanstack/query-core';import {createQueryLedger} from './stateatom-phase2/engine/query-handoff.mjs';const ledger=createQueryLedger({page:'push'});globalThis.__STATEATOM__={queryTap(adapter,kind,a,b,c,d,e){return ledger[kind](a,b,c,d,e);}};const client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity}}});client.setQueryData(['a'],1);const key=['a'],saved=Array.prototype.push;let calls=0;Array.prototype.push=function(...args){calls++;return Reflect.apply(saved,this,args);};let value;try{value=client.getQueryData(key);}finally{Array.prototype.push=saved;}globalThis.result={calls,value};`,resolveDir:root},bundle:true,write:false,platform:'browser',format:'iife',plugins:observed?[probe.plugin]:[]});const context=vm.createContext({setTimeout,clearTimeout});vm.runInContext(output.outputFiles[0].text,context);return JSON.parse(JSON.stringify(context.result));}
 assert.deepEqual(await run(true),await run(false));
});
test('two-site census is independently opt-in and guarded at pinned native call sites',()=>{
 assert.throws(()=>stateatomPlugin({queryCallCensus:true}),/require.*Query handoffs/i);
 const p=stateatomPlugin({enabled:true,root,queryHandoffs:true,queryCallCensus:true});p.config({root});assert(p.load('\0stateatom-runtime').includes('queryCallCensus:true'));
 for(const file of Object.keys(queryVendorHashes)){const r=transformQueryVendor(readFileSync(root+'/node_modules/'+file,'utf8'),file,{queryCallCensus:true});assert.equal(r.counts['call-frame'],1);assert(r.code.includes('call-result'));}
});
