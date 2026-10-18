// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {build} from 'esbuild';
import {makeQueryProbe} from '../engine/query-vendor.mjs';import {root} from '../../scripts/vite-config.mjs';
export const queryCallCases=['native','nested-wrapper','build-wrapper','build-getter','noncallable','getter-ready','getter-throw','callee-ABA','method-getter','functional','custom-sharing','listener','later-alias'];
async function bundle(observed){const probe=makeQueryProbe(root,{queryCallCensus:true}),result=await build({stdin:{contents:`import {createQueryLedger} from './stateatom-phase2/engine/query-handoff.mjs';import './stateatom-phase2/fixtures/react/query-call-controls.js';const ledger=createQueryLedger({page:'call-test',callCensus:true,origin:v=>v===globalThis.currentData?{exchangeId:'e',consumptionId:'c',pointer:''}:null});const names={'census-brand':'censusBrand','call-begin':'callBegin','call-plan':'callPlan','call-result':'callResult','call-ready':'callReady','call-end':'callEnd'};globalThis.__STATEATOM__={queryCallObservations:()=>ledger.callSnapshot(),queryTap(adapter,kind,a,b,c,d,e){const fn=ledger[names[kind]||kind];return fn?.(a,b,c,d,e);}};`,resolveDir:root},bundle:true,write:false,platform:'browser',format:'iife',plugins:observed?[probe.plugin]:[]});return result.outputFiles[0].text;}
test('actual pinned native call census preserves original off/on semantics and retained wrapper boundary',async()=>{
 const off=await bundle(false),on=await bundle(true);
 async function run(code,name){const context=vm.createContext({console,setTimeout,clearTimeout,fetch:async()=>({json:async()=>context.currentData})});context.window=context;context.currentData={rules:{quota:12},risk:{hold:true}};vm.runInContext(code,context);return JSON.parse(JSON.stringify(await context.runQueryCallCase(name)));}
 for(const name of queryCallCases){const baseline=await run(off,name),actual=await run(on,name);assert.deepEqual(actual.semantics,baseline.semantics,name);assert.equal(actual.census.retention.frames,0,name);assert.equal(actual.census.readonlyEffects,'Unknown/Unsupported');assert.equal(actual.census.fullPath,false);
  const entries=actual.census.events.filter(e=>e.kind==='native-body-entry'&&e.method==='query-set');
  if(['native','callee-ABA','functional','custom-sharing','listener','later-alias'].includes(name))assert(entries.some(e=>e.callSite.status==='Observed'),name);
  if(['nested-wrapper','build-wrapper','build-getter','method-getter'].includes(name)){assert(entries.length,name);assert(entries.every(e=>e.callSite.status==='Unknown/Unsupported'),name);}
  if(name==='noncallable'){assert.equal(entries.length,0);assert(actual.semantics.errorMessage);}
  if(name==='getter-ready'){assert.equal(entries.length,2);assert.deepEqual(entries.map(e=>e.callSite.status),['Unknown/Unsupported','Observed']);assert.equal(actual.semantics.updates,3);}
  if(name==='getter-throw'){assert(actual.afterThrow.events.some(e=>e.kind==='native-body-exit'&&e.method==='client-set'&&e.outcome==='abrupt'));assert.equal(entries.length,1);assert.equal(entries[0].callSite.status,'Observed');}
 }
});
