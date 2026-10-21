// SPDX-License-Identifier: Apache-2.0
// Negative controls operate on disposable copies, never issued candidates.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,cp,rm} from 'node:fs/promises';
import {inspectInstalledPair,verifyArtifactHashes,fileManifest,sha256} from './atom-package-receipt.mjs';
import {root} from './vite-config.mjs';
import {assertSourceAnalysisInputs} from './atom-source-analysis-inputs.mjs';
import {disallowedBrowserInputs} from './atom-browser-inputs.mjs';
const handoffFile=process.argv[2]||root+'/.artifacts/atom/atom-handoff.json',h=JSON.parse(await readFile(handoffFile));
if(!h.consumerReceipt)throw Error('F04 consumer receipt required');
const out=root+'/.artifacts/atom/compatibility/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
const result={schema:'stateatom.package-admission/1',handoffFile,handoffSha256:sha256(await readFile(handoffFile)),startedAt:new Date().toISOString(),checks:[],status:'RUNNING'};
try{
 await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
 if(h.contract.features?.includes('source-analysis-worker-v1')){
  assertSourceAnalysisInputs(JSON.parse(await readFile(h.consumer+'/node_modules/@stateport/atom/dist/source-analysis-worker-inputs.json')));
  assert.deepEqual(disallowedBrowserInputs(JSON.parse(await readFile(h.consumer+'/node_modules/@stateport/atom/dist/browser-inputs.json')).flat()),[]);
  for(const kind of ['standalone','embedding'])assert.equal(sha256(await readFile(h.hosts[kind]+'/source-analysis-worker.js')),h.consumerReceipt.files['@stateport/atom/dist/source-analysis-worker.js']);
 }
 for(const kind of ['standalone','embedding']){assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);assert.equal(sha256(await readFile(h.hosts[kind]+'/atom-licenses/THIRD_PARTY_LICENSES.md')),h.consumerReceipt.files['@stateport/atom/dist/THIRD_PARTY_LICENSES.md']);}
 for(const file of ['packages/extension-ui/LICENSE','packages/extension-ui/NOTICE','scripts/atom-browser-inputs.mjs'])assert(h.buildSources.manifest[file],file);
 assert.equal(sha256(JSON.stringify(h.buildSources.manifest)),h.buildSources.sha256);
 for(const [file,digest]of Object.entries(h.buildSources.manifest))assert.equal(sha256(await readFile(root+'/'+file)),digest,'Build source changed: '+file);
 result.checks.push({name:'Exact tarballs, installed pair, exported assets/types and both built hosts',status:'PASS'});
 for(const [name,mutate,pattern]of [
  ['wrong peer',async(a,u)=>{const p=JSON.parse(await readFile(u+'/package.json'));p.version='0.0.0-wrong';await writeFile(u+'/package.json',JSON.stringify(p));},/peer/],
  ['old API/wire contract',async a=>{const p=JSON.parse(await readFile(a+'/contract.json'));p.wireVersion=0;await writeFile(a+'/contract.json',JSON.stringify(p));},/contract/],
  ['missing declared export',async a=>{const p=JSON.parse(await readFile(a+'/package.json'));delete p.exports['./reader.js'];await writeFile(a+'/package.json',JSON.stringify(p));},/export/],
  ['missing font asset',async(a,u)=>{const p=JSON.parse(await readFile(u+'/package.json'));await rm(u+'/'+p.exports['./assets/fonts/InterVariable.woff2']);},/ENOENT|Cannot find module/],
  ['stale declarations',a=>writeFile(a+'/dist/runtime.d.ts','export {};'),/digest/],
  ...(h.contract.features?.includes('source-analysis-worker-v1')?[['missing source analysis worker',a=>rm(a+'/dist/source-analysis-worker.js'),/ENOENT|Cannot find module/]]:[])
 ]){
  const temp=await mkdtemp('/tmp/atom-negative-consumer-'),a=temp+'/node_modules/@stateport/atom',u=temp+'/node_modules/@stateport/extension-ui';
  try{await mkdir(temp+'/node_modules/@stateport',{recursive:true});await writeFile(temp+'/package.json','{"private":true}');await cp(h.consumer+'/node_modules/@stateport/atom',a,{recursive:true});await cp(h.consumer+'/node_modules/@stateport/extension-ui',u,{recursive:true});await mutate(a,u);await assert.rejects(inspectInstalledPair(temp,h.consumerReceipt),pattern);result.checks.push({name:'Refuse '+name,status:'PASS'});}finally{await rm(temp,{recursive:true,force:true});}
 }
 await assert.rejects(verifyArtifactHashes([{...h.package,sha256:'0'.repeat(64)}]),/digest/);result.checks.push({name:'Refuse wrong tarball digest before install',status:'PASS'});
 await inspectInstalledPair(h.consumer,h.consumerReceipt);await verifyArtifactHashes([h.package,h.ui]);result.status='PASS';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;console.error(e);}finally{result.completedAt=new Date().toISOString();await writeFile(out+'/result.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);}
