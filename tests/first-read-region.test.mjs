// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {instrumentScript} from '../stateatom-phase2/engine/plugin.mjs';
const file='stateatom-phase2/fixtures/react/App.tsx',source=readFileSync(file,'utf8');
test('first-read region accepts unchanged original App but refuses a competing source writer without changing its emitted code',async()=>{
 const {instrumentReadRegion}=await import('../stateatom-field-revision/source-region.mjs');
 const generated=instrumentScript(source,file,{reactHostProps:true,reactStateHandoffs:true,sourceConsumption:true}).code;
 const approved=instrumentReadRegion(source,file,generated);assert.equal(approved.status,'Code-linked');assert.equal(approved.count,1);assert(approved.code.includes('"read-region"'));
 const changed=source.replace('  const { rules:', '  data.rules.quota=12;\n  const { rules:'),emitted=instrumentScript(changed,file,{reactHostProps:true,reactStateHandoffs:true,sourceConsumption:true}).code;
 const refused=instrumentReadRegion(changed,file,emitted);assert.equal(refused.status,'Unknown/Unsupported');assert.equal(refused.code,emitted);assert.equal(refused.count,0);
});
test('unchanged source cannot license a changed post-stage binding/read region',async()=>{
 const {instrumentReadRegion}=await import('../stateatom-field-revision/source-region.mjs');assert.throws(()=>instrumentReadRegion(source,file,'export const unsupported=true;'),/region/i);
});
