// SPDX-License-Identifier: Apache-2.0
// New fixed writer controls only; no retained Main or browser execution.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {mkdtemp,readdir,readFile,writeFile,rm} from 'node:fs/promises';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseMainInputArgs,guardMainInputSourceCase,prepareMainInputSourceCase,preflightMainInputSourceCase,runMainInputSourceCase,verifyMainInputInputs} from '../../experiments/react19-reducer/main-input-cleanup-source-run.mjs';
const root=process.cwd(),fixed='docs/testing/main-input-cleanup-source-case.json',old='docs/testing/main-input-source-case.json',driver=fileURLToPath(new URL('../../experiments/react19-reducer/main-input-cleanup-source-run.mjs',import.meta.url)),hash=s=>createHash('sha256').update(s).digest('hex');
const oldCase=JSON.parse(await readFile(old,'utf8'));
// Synthetic guard fixture: rebase paths without changing the archived case.
function ownedCase(){
 const s=structuredClone(oldCase);for(const v of [s.main,s.core,s.jsx]){v.file=path.resolve('.runtime/todomvc/'+v.file.split('/.runtime/todomvc/')[1]);s.inputHashes[v.file]=v.sha256;}s.schema='stateatom.main-input-cleanup-source-case/1';s.out=path.resolve('.artifacts/a02/main-input-cleanup-bridge/owned-guard');s.registrationFile=path.resolve('.artifacts/a02/main-input-cleanup-source/2026-10-25/registration.json');s.inputHashes[s.registrationFile]=s.registrationSha256;s.sourceCounts.priorResearch=93;
 for(const [name,v]of Object.entries(s.outputs)){v.file=s.out+'/'+name;s.inputHashes[v.file]=v.sha256;}
 for(const p of ['docs/superpowers/specs/2026-10-25-a02-cleanup-main-source-design.md','docs/superpowers/plans/2026-10-25-a02-cleanup-main-source.md'])s.inputHashes[path.resolve(p)]='e'.repeat(64);
 return s;
}
test('corrected-source writer parser admits only explicit operation shapes',()=>{
 for(const args of [[],['--reset'],['--prepare'],['--prepare',fixed],['--preflight'],['--preflight',fixed,'extra'],['--run']])assert.throws(()=>parseMainInputArgs(args));
 assert.deepEqual(parseMainInputArgs([fixed]),{mode:'run',caseFile:fixed});assert.deepEqual(parseMainInputArgs(['--preflight',fixed]),{mode:'preflight',caseFile:fixed});assert.deepEqual(parseMainInputArgs(['--prepare',fixed,'out']),{mode:'prepare',caseFile:fixed,out:'out'});
});
test('old exhausted and foreign case paths refuse before any resources',async()=>{
 for(const file of [old,'/tmp/foreign-main-cleanup-case']){await assert.rejects(prepareMainInputSourceCase(file,'/tmp/out'));await assert.rejects(preflightMainInputSourceCase(file));await assert.rejects(runMainInputSourceCase(file));}
});
test('new pure case guard admits exactly its source-only 93/327/28 fixed profile',()=>{const s=ownedCase();assert.equal(guardMainInputSourceCase(s),s);assert.throws(()=>guardMainInputSourceCase(oldCase));});
for(const [name,change]of [
 ['old schema',s=>s.schema=oldCase.schema],['old research count',s=>s.sourceCounts.priorResearch=86],['reset budget',s=>s.maximumSourceRuns=2],['shortened matrix',s=>s.vmContextsExpected=3],['missing modes',s=>s.modes=['on']],['old output family',s=>s.out=oldCase.out],['old registration',s=>s.registrationFile=oldCase.registrationFile],['native upgrade',s=>s.nativeRuntimeProven=true],['lifecycle upgrade',s=>s.realHookLifecycleProven=true],['missing owned controls',s=>s.ownedHookControls=false],['Main pin',s=>s.main.sha256='0'.repeat(64)],['missing new plan pin',s=>delete s.inputHashes[path.resolve('docs/superpowers/plans/2026-10-25-a02-cleanup-main-source.md')]]
])test('new pure case guard rejects '+name,()=>{const s=ownedCase();change(s);assert.throws(()=>guardMainInputSourceCase(s));});
test('new writer import and no-argument CLI create no case/output/VM resources',async()=>{
 const cwd=await mkdtemp('/tmp/a0222-cli-');try{
  const text=execFileSync(process.execPath,['--input-type=module','-e','await import('+JSON.stringify(pathToFileURL(driver).href)+');console.log("IMPORTED_ONLY");'],{cwd,encoding:'utf8',timeout:10000});assert.equal(text.trim(),'IMPORTED_ONLY');assert.deepEqual(await readdir(cwd),[]);
  const r=spawnSync(process.execPath,[driver],{cwd,encoding:'utf8',timeout:10000});assert.equal(r.status,1);assert.match(r.stderr,/INVALID_ARGUMENTS/);assert.deepEqual(await readdir(cwd),[]);
 }finally{await rm(cwd,{recursive:true,force:true});}
});
test('new writer requires current physical input bytes without historical substitution',async()=>{
 const cwd=await mkdtemp('/tmp/a0222-input-');try{const f=cwd+'/owned',before='owned-before';await writeFile(f,before);const expected={[f]:hash(before)};assert.deepEqual(await verifyMainInputInputs(expected),expected);await writeFile(f,'changed');await assert.rejects(verifyMainInputInputs(expected));await rm(f);await assert.rejects(verifyMainInputInputs(expected));}finally{await rm(cwd,{recursive:true,force:true});}
});
