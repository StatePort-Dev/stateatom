// SPDX-License-Identifier: Apache-2.0
// Entry refusals only. These subprocesses must not start a browser or a server.
import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
const driver=new URL('../integration/react19-product.mjs',import.meta.url).pathname;
test('unknown React19 native driver options refuse before opening a preparation or registering any native run',()=>{
 const r=spawnSync(process.execPath,[driver,'/tmp/no-such-react19-preparation.json','--skip-freeze'],{encoding:'utf8'});
 assert.equal(r.status,1);assert.match(r.stderr,/Unexpected native driver option/);assert.doesNotMatch(r.stderr,/ENOENT/);
});
test('missing explicit preparation never starts a default native environment',()=>{
 const r=spawnSync(process.execPath,[driver],{encoding:'utf8'});assert.equal(r.status,1);assert.match(r.stderr,/Pass the exact prepared.json/);
});

const remaining=new URL('../integration/react19-remaining.mjs',import.meta.url).pathname;
test('unknown remaining-case options refuse before reading metadata or starting any native resources',()=>{
 const r=spawnSync(process.execPath,[remaining,'/tmp/no-such-react19-remaining.json','--skip-freeze'],{encoding:'utf8'});assert.equal(r.status,1);assert.match(r.stderr,/Unexpected remaining native driver option/);assert.doesNotMatch(r.stderr,/ENOENT/);
});
test('remaining-case driver cannot invent a default preparation',()=>{
 const r=spawnSync(process.execPath,[remaining],{encoding:'utf8'});assert.equal(r.status,1);assert.match(r.stderr,/Pass exact remaining prepared.json/);
});
