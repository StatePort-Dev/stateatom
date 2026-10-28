// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
const load=()=>import('../src/engine/list-field-code.mjs');
const digest='a'.repeat(64),manifest={digest:'b'.repeat(64),bundle:{digest,bytes:100}},view={schema:1,witnessId:'witness',targetId:'target',extensionId:'extension',browserVersion:'Chrome/153',mainFrameId:'frame',contextUniqueId:'context',freshProfile:true,sandbox:true,soleStateAtomExtension:true};
const input=()=>({manifest,controlledBrowser:view,code:{targetId:'target',extensionId:'extension',frameCount:1,openerAbsent:true,journal:{schema:1,run:'run',id:'journal',mainFrameId:'frame',armedBeforeNavigation:true,freshness:'Recorded',counts:{pending:0},generation:7,capturedAt:Date.now(),gaps:[],scripts:[{scriptId:'script',digest,sourceStatus:'Hashed',bytes:100,frameId:'frame',world:'default',contextUniqueId:'context',ownedRole:null}]}},run:'run'});
test('pure list code check describes only a conditional exact-byte/context join',async()=>{const r=(await load()).checkListFieldCode(input());assert.equal(r.status,'Conditional list code interval');assert.equal(r.generation,7);assert.equal(r.fullPath,false);assert.equal(r.currentOwnership,'Unknown/Unsupported');assert.match(r.scope,/not.*effect|not.*invocation/i)});
for(const [name,mutate]of[
 ['unknown extra MAIN code',i=>i.code.journal.scripts.push({...i.code.journal.scripts[0],scriptId:'extra',digest:'c'.repeat(64)})],
 ['other context',i=>i.code.journal.scripts[0].contextUniqueId='other'],
 ['unarmed journal',i=>i.code.journal.armedBeforeNavigation=false],
 ['pending source',i=>i.code.journal.counts.pending=1],
 ['source loss',i=>i.code.journal.gaps.push('source-fetch-failed')],
 ['other native target',i=>i.code.targetId='other'],
 ['stale code',i=>i.code.journal.capturedAt-=300001]
])test(name+' denies the conditional list interval',async()=>{const i=input();mutate(i);const r=(await load()).checkListFieldCode(i);assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.fullPath,false)});
test('serialized native browser view and all page proof flags cannot issue an owned list context',async()=>{const {createListFieldCodeContext,listFieldCodeContextView,inspectListFieldCodeContext}=await load(),i=input();for(const witness of[view,{...view,owned:true},Object.freeze({})]){const c=await createListFieldCodeContext({compilation:{manifest,...i,fullPath:true},effects:{status:'Code-linked',bundleDigest:digest},witness});assert.equal(listFieldCodeContextView(c).status,'Unknown/Unsupported');assert.equal((await inspectListFieldCodeContext(c,{code:i.code,run:i.run})).status,'Unknown/Unsupported')}});
test('complete-looking page facts cannot bypass owned native/code context in final composition',async()=>{const {verifyListFieldSelection}=await load();assert.equal(typeof verifyListFieldSelection,'function');for(const context of[{},null,{status:'Owned list code context',fullPath:true}]){const result=await verifyListFieldSelection(context,{trace:{status:'Observed',fullPath:true,listFieldObservations:{status:'Recorded'}},selection:{page:'forged',property:'text'},code:input().code,run:'run'});assert.equal(result.status,'Unknown/Unsupported');assert.equal(result.fullPath,false)}});
