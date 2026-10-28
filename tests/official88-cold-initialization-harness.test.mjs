// SPDX-License-Identifier: Apache-2.0
// One-shot CLI admission only; no browser/model or old native case execution.
import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {existsSync,readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
test('official88 cold driver refuses absent/wrong case/hash/revision before resources',()=>{
 const base='.artifacts/i02/current88/cold-initialization/2026-10-28',marker=base+'/native-attempt.json',out=base+'/native',caseFile='docs/testing/official88-cold-initialization-case.json';const snapshot=()=>({marker:existsSync(marker)?readFileSync(marker,'utf8'):null,out:existsSync(out)?readdirSync(out).sort():null}),before=snapshot();
 const args=[[],['--case','/tmp/other-case','--case-sha','0'.repeat(64),'--revision','0'.repeat(40)],['--case',caseFile,'--case-sha','bad','--revision','bad']];
 if(existsSync(caseFile)){const hash=createHash('sha256').update(readFileSync(caseFile)).digest('hex');args.push(['--case',caseFile,'--case-sha','0'.repeat(64),'--revision','0'.repeat(40)],['--case',caseFile,'--case-sha',hash,'--revision','0'.repeat(40)]);}
 for(const argv of args){const r=spawnSync(process.execPath,['tests/integration/official88-cold-initialization.mjs',...argv],{encoding:'utf8',timeout:5000});assert.equal(r.status,1);assert.match(r.stderr,/OFFICIAL_COLD_CASE_REQUIRED|OFFICIAL_COLD_CASE_PATH|OFFICIAL_COLD_REVISION_OR_HASH|OFFICIAL_COLD_CASE_HASH|OFFICIAL_COLD_REVISION/);assert(!r.stdout.includes('NATIVE_ATTEMPT'));assert.deepEqual(snapshot(),before);}
});
