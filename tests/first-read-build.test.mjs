// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
test('owned profile emits a bounded self-contained dev bundle with actual compiler-input and final-byte receipts',async()=>{
 const {buildFirstReadProfile}=await import('../stateatom-field-revision/build-profile.mjs');const a=await buildFirstReadProfile();
 assert.equal(a.fullPath,false);assert.equal(a.manifest.profile,'react18-query5-first-data-render/1');assert.equal(a.manifest.bundle.digest,createHash('sha256').update(a.code).digest('hex'));assert(a.manifest.bundle.bytes<=2*1024*1024);
 assert.equal(a.manifest.compiler.externalImports,0);assert(a.manifest.inputs.some(i=>i.file==='stateatom-phase2/fixtures/react/App.tsx'));assert(a.manifest.inputs.some(i=>i.file==='node_modules/react-dom/cjs/react-dom.development.js'));
 assert(a.manifest.inputs.filter(i=>i.transform==='query-first-read').length===8);assert(a.manifest.inputs.some(i=>i.transform==='react-first-read'));
 assert.equal(a.manifest.sourceEffectProof,undefined);assert.equal(a.manifest.fullPath,undefined);assert.equal(a.manifest.compiler.version,'0.25.12');assert(a.manifest.trust.files.some(i=>i.file==='package-lock.json'));assert(a.manifest.trust.files.some(i=>i.file==='stateatom-field-revision/build-profile.mjs'));assert.match(a.manifest.compiler.api.digest,/^[a-f0-9]{64}$/);assert.match(a.manifest.compiler.binary.digest,/^[a-f0-9]{64}$/);assert(a.code.includes('read-region'));assert(!a.code.includes('/@vite/client'));
});
