// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {installedVitePin,verifyVitePin} from '../stateatom-compiler-probe/compiler-pin.mjs';
const pin=JSON.parse(readFileSync(new URL('../stateatom-compiler-probe/vite-7.3.7-inputs.json',import.meta.url),'utf8'));
const files=()=>new Map(Object.keys(pin.files).map(name=>[name,readFileSync(new URL('../node_modules/vite/dist/node/'+name,import.meta.url))]));
test('compiler pin covers every declared split Vite input and exact installed version',()=>{assert.equal(Object.keys(pin.files).length,15);assert.equal(installedVitePin().length,64);assert.throws(()=>verifyVitePin({version:'7.1.9',files:files()}),/pinned Vite 7.3.7/);});
test('changed or missing implementation bytes cannot borrow version-only acquisition',()=>{const changed=files();changed.set('chunks/config.js',Buffer.from('changed'));assert.throws(()=>verifyVitePin({version:pin.version,files:changed}),/implementation bytes changed/);const missing=files();missing.delete('chunks/server.js');assert.throws(()=>verifyVitePin({version:pin.version,files:missing}),/input set changed/);});
