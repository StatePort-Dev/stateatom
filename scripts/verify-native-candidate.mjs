// SPDX-License-Identifier: Apache-2.0
// Finite candidate matrix, sequential because the existing map case owns4175.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,open,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {root} from './vite-config.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from './atom-package-receipt.mjs';
import {immutableHandoffPath,validateLaneResult,nativeLaneCases} from '../tests/helpers/native-candidate-lane.mjs';
assert.equal(process.argv.length,3,'Usage: node scripts/verify-native-candidate.mjs <timestamped atom-handoff.json>');
process.chdir(root);const hf=immutableHandoffPath(process.argv[2],root),h=JSON.parse(await readFile(hf));
const out='.artifacts/v01/native-candidate/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
const registered=[...new Set([...Object.keys({...h.sourceManifest,...h.buildSources.manifest}),
  ...nativeLaneCases.map(x=>x.script),'scripts/verify-native-candidate.mjs','tests/helpers/native-candidate-lane.mjs',
  'tests/atom/native-candidate-lane.test.mjs','tests/helpers/native-inspector-ui.mjs','scripts/native-browser.mjs','scripts/harness.mjs',
  'tests/helpers/source-map-zip.mjs','tests/fixtures/picker/index.html','tests/fixtures/production-source-mapping/OrderActions.jsx',
  'tests/integration/production-source-mapping.mjs','.github/workflows/ci.yml','docs/superpowers/plans/2026-10-23-v01-native-candidate.md'])];
const inputs=async()=>Object.fromEntries(await Promise.all(registered.map(async f=>[f,sha256(await readFile(f))])));
const result={schema:'stateatom.native-candidate-lane/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},environment:{node:process.version,platform:os.platform(),release:os.release(),arch:os.arch()},configuration:{sequential:true,headless:'new',certificateSetup:false,realMV3:true,appTargetTestCDP:false,sharedPorts:[4175],scope:'Two packed browser hosts; no IDE, model, performance, real StatePort integration or release acceptance'},cases:[],inputsBefore:await inputs()};
const lock='.artifacts/v01/native-candidate.lock';let ownsLock=false;
async function pair(){
  await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
  for(const[f,v]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(sha256(await readFile(f)),v,f);
  for(const kind of['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
  assert.equal(sha256(await readFile(hf)),result.handoff.sha256,'Handoff drift');
}
try{
  try{await mkdir(lock);ownsLock=true;}catch(error){if(error.code==='EEXIST')throw Error('BLOCKED: another native candidate owns the cooperative lock');throw error;}
  await writeFile(lock+'/owner.json',JSON.stringify({pid:process.pid,out,startedAt:result.startedAt},null,2));
  await pair();await writeFile(out+'/preregistration.json',JSON.stringify(result,null,2),{flag:'wx'});
  for(const def of nativeLaneCases){
    const log=out+'/'+def.id+'.log',entry={id:def.id,script:def.script,log,status:'RUNNING'};result.cases.push(entry);
    const fd=await open(log,'wx');let code;
    try{code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[def.script,hf],{cwd:root,stdio:['ignore',fd.fd,fd.fd]});child.once('error',reject);child.once('close',(code,signal)=>resolve({code,signal}));});}finally{await fd.close();}
    entry.process=code;const text=await readFile(log,'utf8'),sentinels=text.split('\n').filter(x=>x.startsWith('STATEATOM_RESULT '));assert.equal(sentinels.length,1,'Missing or ambiguous native result; see '+log);
    const childFile=JSON.parse(sentinels[0].slice('STATEATOM_RESULT '.length)).file;
    const relative=path.relative(root,path.resolve(root,childFile));assert(relative.startsWith('.artifacts'+path.sep)&&!relative.includes('..'+path.sep),'Result outside artifacts');
    const raw=await readFile(childFile),child=JSON.parse(raw);entry.result={file:childFile,sha256:sha256(raw),status:child.status};
    if(code.code!==0||code.signal)throw Error((/ENOENT|Native Chrome exited|EADDRINUSE|Missing browser|browser executable/i.test(child.error||'')?'BLOCKED: native environment unavailable: ':'Native case failed: ')+(child.error||def.id));
    entry.summary=validateLaneResult(def.id,child,result.handoff.sha256);
    for(const[f,v]of Object.entries(child.inputsBefore))assert.equal(result.inputsBefore[f],v,'Unfrozen child input '+f);
    entry.status='PASS';await pair();console.log('PASS_NATIVE_CASE',def.id,entry.summary.checks,childFile);
  }
  result.inputsAfter=await inputs();assert.deepEqual(result.inputsAfter,result.inputsBefore,'Frozen lane source drift');
  result.status='PASS_NATIVE_CANDIDATE_BROWSER_LANE';
}catch(error){result.status=String(error.message).startsWith('BLOCKED:')?'BLOCKED_ENVIRONMENT':'FAIL';result.error=error.stack;process.exitCode=1;console.error(error);}
finally{
  result.inputsAfter=await inputs();if(JSON.stringify(result.inputsAfter)!==JSON.stringify(result.inputsBefore)){result.status='FAIL';result.sourceDrift=true;process.exitCode=1;}
  if(ownsLock)await rm(lock,{recursive:true});result.finishedAt=new Date().toISOString();
  await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('STATEATOM_CANDIDATE_RESULT '+JSON.stringify({file:out+'/results.json',status:result.status}));
}
