// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {disallowedBrowserInputs} from '../../scripts/atom-browser-inputs.mjs';
test('approved source-map browser modules do not admit compiler, IDE or arbitrary npm inputs',()=>{
 const maps=['node_modules/@jridgewell/trace-mapping/dist/trace-mapping.mjs','node_modules/@jridgewell/resolve-uri/dist/resolve-uri.umd.js','node_modules/@jridgewell/sourcemap-codec/dist/sourcemap-codec.mjs'];
 assert.deepEqual(disallowedBrowserInputs(['packages/atom/src/runtime.mjs',...maps]),[]);
 for(const bad of ['core/analyzer.mjs','core/bridge.mjs','src/engine/plugin.mjs','ide-extension/extension.mjs','node_modules/typescript/lib/typescript.js','node_modules/@babel/parser/lib/index.js','node_modules/@jridgewell/trace-mapping/other-entry.js','node:fs'])assert.deepEqual(disallowedBrowserInputs([...maps,bad]),[bad]);
});
