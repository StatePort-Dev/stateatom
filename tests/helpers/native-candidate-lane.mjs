// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const nativeLaneCases = [
  {id:'basic',script:'tests/integration/basic-reader-native.mjs',schema:'stateatom.v01-basic-reader/1',status:'PASS_NATIVE_BASIC_READER',checks:23,perHost:11},
  {id:'maps',script:'tests/integration/source-map-native.mjs',schema:'stateatom.l01-native-map-regression/1',status:'PASS_L01_CURRENT_NATIVE_MAP_REGRESSION',checks:39,perHost:19}
];
export function immutableHandoffPath(file,root){
  const relative=path.relative(root,path.resolve(root,file)).split(path.sep).join('/');
  assert.match(relative,/^\.artifacts\/atom\/\d{4}-\d{2}-\d{2}T[\d-]+Z\/atom-handoff\.json$/,'Exact timestamped candidate required');
  return relative;
}
export function validateLaneResult(id,result,handoffSha256){
  const def=nativeLaneCases.find(x=>x.id===id);assert(def,'Unknown native case');
  assert.equal(result.schema,def.schema);assert.equal(result.status,def.status);
  assert.equal(result.handoff?.sha256,handoffSha256,'Candidate identity mismatch');
  assert.equal(result.error,undefined);assert.deepEqual(result.errors,[]);
  if(result.console!==undefined)assert.deepEqual(result.console,[]);
  assert.equal(result.checks?.length,def.checks,'Incomplete native checks');
  const names=result.checks.map(x=>{assert.equal(x.status,'PASS');assert(typeof x.name==='string'&&x.name.trim());return x.name;});
  assert.equal(new Set(names).size,names.length,'Duplicate native checks');
  assert.equal(result.cases?.length,2,'Both hosts required');
  assert.deepEqual(result.cases.map(x=>x.kind),['standalone','embedding']);
  for(const c of result.cases){
    assert.match(c.browser,/^Chrome\/\d+\./,'Actual browser version required');
    assert.equal(c.checks?.length,def.perHost,'Incomplete host');
    assert(c.checks.every(x=>typeof x==='string'&&x.trim()));
    assert.equal(new Set(c.checks).size,c.checks.length);
    assert(c.before&&Object.keys(c.before).length);assert.deepEqual(c.after,c.before,'Installed host drift');
  }
  assert(result.inputsBefore&&Object.keys(result.inputsBefore).length,'Frozen inputs required');
  for(const value of Object.values(result.inputsBefore))assert.match(value,/^[a-f0-9]{64}$/);
  assert.deepEqual(result.inputsAfter,result.inputsBefore,'Source drift');
  return {id,checks:result.checks.length,hosts:result.cases.map(x=>x.kind)};
}
export function validateRetainedBasic(previous,raw,handoffSha256,currentInputs){
  assert.equal(previous.schema,'stateatom.native-candidate-lane/1');
  assert.equal(previous.handoff?.sha256,handoffSha256);
  assert(previous.inputsBefore&&Object.keys(previous.inputsBefore).length);
  assert.deepEqual(previous.inputsAfter,previous.inputsBefore,'Original lane input drift');
  const entries=previous.cases.filter(x=>x.id==='basic');assert.equal(entries.length,1);
  const entry=entries[0];assert.equal(entry.status,'PASS');assert.equal(entry.process.code,0);assert.equal(entry.process.signal,null);
  assert.equal(createHash('sha256').update(raw).digest('hex'),entry.result.sha256,'Retained bytes changed');
  const child=JSON.parse(raw),summary=validateLaneResult('basic',child,handoffSha256);
  assert.equal(entry.result.status,child.status);
  for(const[file,digest]of Object.entries(child.inputsBefore))assert.equal(currentInputs[file],digest,'Retained Basic source changed: '+file);
  return summary;
}
