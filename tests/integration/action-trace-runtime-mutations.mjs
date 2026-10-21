// SPDX-License-Identifier: Apache-2.0
// Isolated regression-sensitivity check. Never edits the live runtime source.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import {fileDigests} from '../../scripts/short-loop-inputs.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const runtimePath='packages/atom/src/runtime.mjs',testPath='tests/atom/action-trace-runtime.test.mjs';
const out=path.join(root,'.artifacts/a05/runtime-races',new Date().toISOString().replace(/[:.]/g,'-'));
await mkdir(out,{recursive:true});
const entries=[runtimePath,testPath,'packages/atom/src/action-trace.mjs','packages/atom/src/platform.mjs','packages/atom/src/capabilities.mjs','packages/atom/src/transport.mjs','tests/helpers/action-trace-runtime-fixture.mjs','tests/helpers/input-capture-runtime-fixture.mjs','core/action-observation.mjs','core/code-journal.mjs','core/owned-code.mjs','tests/integration/action-trace-runtime-mutations.mjs'];
const source=await readFile(path.join(root,runtimePath),'utf8');
const result={schema:'stateatom.action-runtime-regression-sensitivity/1',status:'RUNNING',baseRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceDirty:true,scope:'Actual runtime/platform/broker and wire with synthetic CDP/helper/IDE transport; not native browser evidence',inputsBefore:await fileDigests(root,entries),checks:[]};
const mutations=[
 ['old-request-cleans-current-owner',s=>s.replace("stopActionTrace(id,'Observation request cancelled',owner)","stopActionTrace(id,'Observation request cancelled')").replace("stopActionTrace(id,'Observation opening failed',owner)","stopActionTrace(id,'Observation opening failed')"),'cancelled pending Arm A'],
 ['late-IDE-reply-skips-owner-guard',s=>s.replace('catch{}await guardResult();result={...result,sourceCurrent}','catch{}result={...result,sourceCurrent}'),'late source verification'],
 ['old-controller-publishes-over-new-epoch',s=>s.replace('||actionEpochs.get(id)!==owner',''),'cancelled pending Arm A'],
 ['same-owner-late-read-overwrites-Cancel',s=>s.replace("if(method==='read'&&previous.controller.snapshot()!==observed)throw atomError('STALE_TARGET','Observation changed while checking source');",''),'pre-Cancel read'],
 ['cancel-waits-for-IDE',s=>s.replace("if(method==='read'&&!result.freshness&&result.records?.some","if(!result.freshness&&result.records?.some"),'Cancel acknowledges'],
 ['arm-transfers-to-reused-context',s=>s.replaceAll('uniqueContextId:main.uniqueId,functionDeclaration:','...(objectId?{objectId}:{uniqueContextId:main.uniqueId}),functionDeclaration:'),'replacement MAIN during native node'],
 ['native-context-change-not-retired',s=>s.replace("if(actionOwner&&!actionOwner.contextCurrent())void stopActionTrace(id,'Native execution context changed',actionOwner).then(persist).then(()=>notifyInvalidation(id)).catch(()=>{});",'').replaceAll('||!contextCurrent()',''),'native MAIN context|native context destruction']
];
function run(file,pattern){return spawnSync(process.execPath,['--test','--test-isolation=none',...(pattern?['--test-name-pattern',pattern]:[]),testPath],{cwd:root,env:{...process.env,ATOM_ACTION_RUNTIME_VARIANT:file||''},encoding:'utf8',timeout:15000});}
try{
 const baseline=run();await writeFile(path.join(out,'baseline.log'),baseline.stdout+baseline.stderr);assert.equal(baseline.error,undefined);assert.equal(baseline.status,0);assert.match(baseline.stdout,/ℹ pass 18\b/);result.checks.push({name:'current actual runtime baseline',status:'PASS',tests:18});
 for(const[name,mutate,pattern]of mutations){
  const changed=mutate(source);assert.notEqual(changed,source,name+' must change the source');
  const module=changed.replace(/from\s+(['"])(\.\.?\/[^'"]+)\1/g,(_,q,spec)=>'from '+JSON.stringify(new URL(spec,pathToFileURL(path.join(root,runtimePath))).href));
  const file=path.join(out,name+'.mjs');await writeFile(file,module);
  const runResult=run(file,pattern);await writeFile(path.join(out,name+'.log'),runResult.stdout+runResult.stderr);
  assert.equal(runResult.error,undefined,name+' cannot fail by timeout/spawn');assert.equal(runResult.status,1,name+' must fail its behavior assertion');
  assert.match(runResult.stdout,/AssertionError|STALE_TARGET/,name+' must fail on the expected observable contract');
  assert.doesNotMatch(runResult.stdout,/ERR_MODULE_NOT_FOUND|SyntaxError|INVALID_MESSAGE/);
  result.checks.push({name,status:'PASS_MUTATION_REJECTED',testPattern:pattern,exitCode:runResult.status});
 }
 result.inputsAfter=await fileDigests(root,entries);assert.deepEqual(result.inputsAfter,result.inputsBefore);result.status='PASS_SCOPED_RUNTIME_RACE_REGRESSION_SENSITIVITY';
}catch(e){result.status='FAIL';result.error=String(e.stack||e);process.exitCode=1;}
await writeFile(path.join(out,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(result.status,out);if(result.error)console.error(result.error);
