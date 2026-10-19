// SPDX-License-Identifier: Apache-2.0
// Static packaging contract only; does not establish Chrome lifecycle behavior.
import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';
import * as platform from '../../packages/atom/src/platform.mjs';
const json=async p=>JSON.parse(await readFile(new URL('../../'+p,import.meta.url),'utf8'));
test('optional public guardian factory preserves the plain broker fallback API',()=>{assert.equal(typeof platform.createGuardianBroker,'function');assert.equal(typeof platform.createDebuggerBroker,'function');});
test('guardian capability declares live-only authority and all three exact public assets',async()=>{const p=await json('packages/atom/package.json'),c=await json('packages/atom/contract.json');assert.equal(c.guardian.protocolVersion,1);assert.equal(c.guardian.authority,'live-memory-only');for(const f of ['guardian.html','guardian.js','guardian-worker.js'])assert.equal(typeof p.exports['./'+f],'string');});
test('only the two local host examples request the needed offscreen permission and use the same shared factory',async()=>{for(const prefix of ['browser-extension','examples/embedding-host']){const m=await json(prefix+'/manifest.json');assert(m.permissions.includes('offscreen'));const s=await readFile(new URL('../../'+prefix+'/worker.js',import.meta.url),'utf8');assert.match(s,/broker=createGuardianBroker\(chrome/);assert(!m.permissions.includes('nativeMessaging'));}});
