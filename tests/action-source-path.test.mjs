// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {actionImportPath} from '../core/action-source-path.mjs';
test('relative explicit source paths normalize lexically with no filesystem or URL acquisition',()=>{for(const[from,relative,want]of[['src/View.tsx','./helper','src/helper'],['src/nested/View.tsx','../helper','src/helper'],['View.js','./helper','helper'],['../src/View.js','../../shared','../../shared'],['/src/View.js','../../shared','/shared'],['src//View.js','./one/../two','src/two']])assert.equal(actionImportPath(from,relative),want);});
test('bare imports are not resolved as a project file or external package',()=>{for(const specifier of['react','node:fs','https://example.invalid/a.js','/private/file'])assert.equal(actionImportPath('src/View.tsx',specifier),null);});
