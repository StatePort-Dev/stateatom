// SPDX-License-Identifier: Apache-2.0
// Admission controls only. No browser, server, model or application is started.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtemp,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const driver=fileURLToPath(new URL('./integration/current-plugin-weak-dispatch.mjs',import.meta.url));
for(const mode of ['prepare','frozen'])test(mode+' refuses incompatible readonly/module proof before reading inputs or creating an attempt',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'stateatom-native-admission-'));
 try{
  const missing=join(directory,'must-not-be-read');
  const args=mode==='prepare'?['--prepare',missing,missing,missing,missing]:[missing];
  const result=spawnSync(process.execPath,[driver,...args],{encoding:'utf8',timeout:15000});
  assert.equal(result.error,undefined);
  assert.equal(result.status,1);
  assert.match(result.stderr,/READONLY_MODULE_EVIDENCE_UNAVAILABLE/);
  assert.doesNotMatch(result.stderr,/ENOENT|START |HTTP_PREFLIGHT/);
  assert.deepEqual(await readdir(directory),[]);
 }finally{await rm(directory,{recursive:true,force:true});}
});
