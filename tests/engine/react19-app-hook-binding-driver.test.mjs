// SPDX-License-Identifier: Apache-2.0
// Resource-free CLI/input controls; no retained App source qualification.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {executeAppHookBindingSourceCase,appModuleWrapper} from '../helpers/react19-app-hook-binding-controls.mjs';
import {parseAppHookBindingArgs,guardAppHookBindingCase,prepareAppHookBindingCase,preflightAppHookBindingCase,runAppHookBindingCase,verifyAppHookBindingInputs} from '../../experiments/react19-reducer/app-hook-binding-source-run.mjs';
const file='docs/testing/app-hook-binding-source-case.json',hash=s=>createHash('sha256').update(s).digest('hex');
test('App binding CLI requires explicit prepare/preflight/run and has no reset',()=>{for(const args of [[],['--reset'],['--prepare'],['--prepare',file],['--preflight'],['--preflight',file,'extra'],['--run']])assert.throws(()=>parseAppHookBindingArgs(args));assert.deepEqual(parseAppHookBindingArgs([file]),{mode:'run',caseFile:file});assert.deepEqual(parseAppHookBindingArgs(['--preflight',file]),{mode:'preflight',caseFile:file});assert.deepEqual(parseAppHookBindingArgs(['--prepare',file,'out']),{mode:'prepare',caseFile:file,out:'out'});});
test('old source/native and foreign cases refuse before resources',async()=>{for(const f of ['docs/testing/main-input-native-case.json','docs/testing/main-input-cleanup-source-case.json','docs/testing/main-input-source-case.json','/tmp/foreign-App-source-case']){await assert.rejects(prepareAppHookBindingCase(f,'/tmp/out'));await assert.rejects(preflightAppHookBindingCase(f));await assert.rejects(runAppHookBindingCase(f));}});
test('incomplete and old prepared source schemas cannot pass App guard',()=>{for(const s of [null,{}, {schema:'stateatom.main-input-cleanup-source-case/1'},{schema:'stateatom.app-hook-binding-source-case/1'}])assert.throws(()=>guardAppHookBindingCase(s));});
test('App input verification requires current physical bytes and retains measured drift/read evidence',async()=>{
 const dir=await mkdtemp('/tmp/a0224-input-');try{const a=dir+'/a',b=dir+'/b';await writeFile(a,'before-a');await writeFile(b,'before-b');const expected={[a]:hash('before-a'),[b]:hash('before-b')};assert.deepEqual(await verifyAppHookBindingInputs(expected),expected);await writeFile(a,'after-a');await rm(b);await assert.rejects(verifyAppHookBindingInputs(expected),e=>{assert.equal(e.code,'APP_INPUTS_REFUSED');assert.equal(e.measuredHashes[a],hash('after-a'));assert.equal(Object.hasOwn(e.measuredHashes,b),false);assert.deepEqual(e.mismatches,[{file:a,expectedSha256:hash('before-a'),actualSha256:hash('after-a')}]);assert.equal(e.readErrors.length,1);assert.equal(e.readErrors[0].file,b);assert.equal(e.readErrors[0].code,'ENOENT');return true;});assert.equal(expected[a],hash('before-a'));}finally{await rm(dir,{recursive:true,force:true});}
});
test('input accessors refuse without invoking them',async()=>{let reads=0;const expected={};Object.defineProperty(expected,'/tmp/never-read-App-binding',{enumerable:true,get(){reads++;return'a'.repeat(64);}});await assert.rejects(verifyAppHookBindingInputs(expected));assert.equal(reads,0);});

test('App receipt or strict-wrapper mismatch refuses before any VM is created',()=>{
 let started=0;const base={sourceDigest:'9062e9b90d3ef5c292e84cc2e765797d1336373271d7c5f39944d704f98d661f',originalCompiledDigest:hash('own-code'),appModuleWrapper};
 for(const receipt of [{...base,originalCompiledDigest:'1'.repeat(64)},{...base,appModuleWrapper:'sloppy'}])assert.throws(()=>executeAppHookBindingSourceCase({coreSource:'throw Error("unexecuted")',jsxSource:'throw Error("unexecuted")',appCode:'own-code',applicationReceipt:receipt,caseName:'ordinary',mode:'original',onContextStarted(){started++;}}));assert.equal(started,0);
});
