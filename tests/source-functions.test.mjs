// SPDX-License-Identifier: Apache-2.0
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {functionFragment} from "../src/engine/source-functions.mjs";
const run=(text,options={})=>functionFragment({file:'logic.ts',text,name:'derive',...options});
test('generic straight-line fragment retains property and primitive premises without evaluating',()=>{const r=run('export function derive(item){const a=item.rules;const n=a.quota*2;return n>=20;}');assert.equal(r.syntaxSupported,true);assert(r.primitivePremises.includes('/rules/quota'));assert.equal(r.runtimePremisesVerified,false);assert.equal(r.fullPath,false);assert.equal(r.ownership,'Unknown/Unsupported');});
test('whole body rejects hidden calls and global/closure effects independent of parameter references',()=>{for(const body of ['evil();return item.x*2;','globalThis.x=1;return item.x;','return captured+item.x;','return item.fn();'])assert.equal(run('function derive(item){'+body+'}').syntaxSupported,false);});
test('writes computed getters object returns and unsupported control flow fail closed',()=>{for(const body of ['item.x=12;return 1;','const a=item;a.x++;return 1;','return item[key];','return item;','return {n:item.x};','try{return item.x;}catch(e){return 1;}'])assert.equal(run('function derive(item){'+body+'}').syntaxSupported,false,body);});
test('direct field return stays conditional on ordinary data and primitive leaf',()=>{const r=run('function derive(item){return item.x;}');assert(r.syntaxSupported);assert(r.primitivePremises.includes('/x'));assert.equal(r.runtimePremisesVerified,false);});
test('ambiguous functions malformed sources and budgets fail closed',()=>{for(const r of [run('function derive(item){return 1;} function other(){function derive(item){return 2;}}'),run('function derive('),run('function derive(item){return item.x;}',{budget:0}),run('function derive(item){return item.x;}',{maxBytes:1})])assert.equal(r.syntaxSupported,false);});
