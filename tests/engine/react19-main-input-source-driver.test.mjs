// SPDX-License-Identifier: Apache-2.0
// No source qualification is launched by these CLI/input controls.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseMainInputArgs,prepareMainInputSourceCase,preflightMainInputSourceCase,runMainInputSourceCase,verifyMainInputInputs,guardMainInputSourceCase} from '../../experiments/react19-reducer/main-input-source-run.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),file='docs/testing/main-input-source-case.json';
test('source qualification requires explicit fixed prepare/preflight/run invocation',()=>{for(const args of [[],['--unknown'],['--prepare'],['--preflight'],['--run'],['--prepare',file],['--preflight',file,'extra']])assert.throws(()=>parseMainInputArgs(args));assert.deepEqual(parseMainInputArgs([file]),{mode:'run',caseFile:file});assert.deepEqual(parseMainInputArgs(['--preflight',file]),{mode:'preflight',caseFile:file});assert.deepEqual(parseMainInputArgs(['--prepare',file,'out']),{mode:'prepare',caseFile:file,out:'out'});});
test('foreign case paths refuse before any source/VM resources',async()=>{await assert.rejects(prepareMainInputSourceCase('/tmp/foreign','/tmp/out'));await assert.rejects(preflightMainInputSourceCase('/tmp/foreign'));await assert.rejects(runMainInputSourceCase('/tmp/foreign'));});
test('unknown or incomplete prepared cases cannot pass a guard',()=>{for(const s of [null,{}, {schema:'stateatom.main-input-source-case/1'}])assert.throws(()=>guardMainInputSourceCase(s));});
test('current physical input verification rejects change/missing bytes and never substitutes historical files',async()=>{const d=await mkdtemp('/tmp/a0221-input-');try{const f=d+'/file';await writeFile(f,'before');const expected={[f]:hash('before')};assert.deepEqual(await verifyMainInputInputs(expected),expected);await writeFile(f,'after');await assert.rejects(verifyMainInputInputs(expected));assert.equal(expected[f],hash('before'));await rm(f);await assert.rejects(verifyMainInputInputs(expected));}finally{await rm(d,{recursive:true,force:true});}});

test('input hash metadata accessors are rejected without executing them',async()=>{
 let reads=0;const expected={};Object.defineProperty(expected,'/tmp/owned-main-input-never-read',{enumerable:true,get(){reads++;return 'a'.repeat(64);}});
 await assert.rejects(verifyMainInputInputs(expected));assert.equal(reads,0);
});
