// SPDX-License-Identifier: Apache-2.0
// New test-only transport qualification; original row predicates remain authoritative.
// Passing these data predicates is not factual entailment or product acceptance.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readdir,readlink} from 'node:fs/promises';
import {join} from 'node:path';
import {comparisonProtocol,expectedComparisonCases,expectedComparisonCreateOptions} from '../scripts/comparison-evaluation-case.mjs';
import {guardComparisonRunRecord} from './comparison-evaluation-qualification.mjs';
export async function pilotFileSha256(file){
 const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);return hash.digest('hex');
}
export async function pilotProfileManifest(root){
 const files={},links={};async function walk(dir,prefix=''){
  for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const name=prefix+entry.name,path=join(dir,entry.name);if(entry.isSymbolicLink())links[name]=await readlink(path);else if(entry.isDirectory())await walk(path,name+'/');else{assert(entry.isFile(),'Unexpected profile entry');files[name]=await pilotFileSha256(path);}}
 }await walk(root);return {files,links};
}
export function qualifyOfficialComparisonPilot(r,c){
 assert.equal(c.schema,'stateatom.l02-official-comparison-case/1');assert.equal(r.schema,'stateatom.l02-official-comparison-native/1');
 assert.deepEqual(c.protocol,comparisonProtocol());assert.deepEqual(c.expectedCases,expectedComparisonCases());assert.deepEqual(c.expectedCreateOptions,expectedComparisonCreateOptions());
 assert.equal(r.diagnosticOnly,true);for(const key of ['originalAcceptanceWaived','modelQualityAssessed','fullL02','productProviderSelected'])assert.equal(r[key],false);
 assert.equal(r.initialAvailability,'available');assert.equal(r.context.href,'chrome-extension://'+c.developmentId+'/l02-eval.html');assert.equal(r.context.runtimeId,c.developmentId);assert.equal(r.context.topLevel,true);assert.equal(r.context.nonce,c.nonce);
 assert.equal(r.compiledEvaluation.url,'chrome-extension://'+c.developmentId+'/l02-eval.js');assert.equal(r.compiledEvaluation.sha256,c.addon.jsSha256);assert.equal(r.compiledEvaluation.debuggerDisabledBeforeRun,true);
 assert(Array.isArray(r.runs));assert.equal(r.runs.length,34);const counts={modelReturns:0,structurallyAccepted:0,structurallyRejected:0,templateOnly:0};
 for(const [index,row]of r.runs.entries()){
  const result=guardComparisonRunRecord(row,c.expectedCases[index],{expectedCreateOptions:c.expectedCreateOptions});
  if(result==='template-outside-scope')counts.templateOnly++;else{counts.modelReturns++;counts[result==='model-returned-client-accepted'?'structurallyAccepted':'structurallyRejected']++;}
 }
 assert.equal(counts.modelReturns,10);assert.equal(counts.templateOnly,24);
 assert.deepEqual(r.errors,[]);assert.deepEqual(r.pageErrors,[]);assert.equal(r.console.overflow,false);assert(r.console.records.length<=128);assert(r.console.records.every(x=>x.type==='warning'));
 for(const key of ['originalHostUnchanged','profileSourceUnchanged','allFrozenInputsUnchanged'])assert.equal(r[key],true);
 for(const key of ['driver','control','browser','desktop','ownedBrowserPidAbsent'])assert.equal(r.cleanup[key],true);
 return {status:'COLLECTED_OFFICIAL_COMPARISON_PILOT_NOT_L02',...counts,qualityAssessed:false,fullL02:false,productProviderSelected:false};
}
