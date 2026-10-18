// SPDX-License-Identifier: Apache-2.0
// Source-only prerequisite experiment, not native runtime or product UI evidence.
import assert from 'node:assert/strict';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {functionFragment} from "../../src/engine/source-functions.mjs";
import {sourceUses} from "../../src/engine/source-uses.mjs";
import {fileDigests} from "../../scripts/short-loop-inputs.mjs";
import {root} from "../../scripts/vite-config.mjs";
const tag=process.env.SOURCE_TAG||new Date().toISOString().replaceAll(/[:.]/g,'-');assert.match(tag,/^[a-zA-Z0-9_-]+$/);
const out=root+'/.runtime/source-use-probes/'+tag;await mkdir(root+'/.runtime/source-use-probes',{recursive:true});await mkdir(out);
const entries=["experiments/execution/source.mjs","src/engine/source-uses.mjs","src/engine/source-functions.mjs","src/engine/slice.mjs",'tests/fixtures/inspection','package.json','package-lock.json'],before=await fileDigests(root,entries);
const paths=["tests/fixtures/inspection/react/App.tsx",...(await readdir(root+"/tests/fixtures/inspection/shared")).filter(n=>n.endsWith('.ts')).map(n=>"tests/fixtures/inspection/shared/"+n)];
const files=await Promise.all(paths.map(async file=>({file,text:await readFile(root+'/'+file,'utf8')})));
let revision=null;try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
const result={revision,startedAt:new Date().toISOString(),inputs:before,checks:[],errors:[],fullPath:false,configuration:{sourceOnly:true,native:false,productUI:false}};
try{
 const audit=sourceUses(files,{file:paths[0],binding:'account',line:13});result.audit=audit;
 assert(audit.bindings.some(b=>b.name==='account'));assert(audit.bindings.some(b=>b.name==='data'));assert(audit.records.some(n=>n.kind==='state-candidate'));
 assert(audit.records.some(n=>n.kind==='call-boundary'&&n.expression.startsWith('cache.setQueryData')));
 assert(audit.records.some(n=>n.kind==='call-boundary'&&n.expression.startsWith('calculateEligibility')));
 assert(audit.records.some(n=>n.kind==='escape'&&n.expression.includes('data')));
 assert(audit.boundaries.some(n=>n.reason.includes('native runtime')));assert.equal(audit.complete,false);assert.equal(audit.ownership,'Unknown/Unsupported');assert.equal(audit.fullPath,false);
 result.checks.push({name:'all-reference inventory follows lexical account/data candidate and retains cache/function/props/native boundaries',status:'PASS'});
 const logic=files.find(f=>f.file.endsWith('/shared/logic.ts'));result.fragments=['calculateEligibility','selectAllowance'].map(name=>functionFragment({...logic,name}));
 for(const fragment of result.fragments){assert.equal(fragment.syntaxSupported,true);assert(fragment.primitivePremises.includes('/rules/quota'));assert.equal(fragment.runtimePremisesVerified,false);assert.equal(fragment.ownership,'Unknown/Unsupported');assert.equal(fragment.fullPath,false);}
 const row=functionFragment({...files[0],name:'Row'});assert.equal(row.syntaxSupported,false);result.rowBoundary=row;
 result.checks.push({name:'two original straight-line helpers produce only conditional source facts; Row and runtime premises remain unsupported',status:'PASS'});
 result.status='PASS_BOUNDED_SOURCE_USE_INVENTORY';
}catch(e){result.status='FAIL';result.errors.push(String(e.stack||e));process.exitCode=1;}
result.inputsStable=JSON.stringify(before)===JSON.stringify(await fileDigests(root,entries));if(!result.inputsStable){result.status='FAIL';result.errors.push('Inputs changed');process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out,result.errors);if(result.audit)console.log(JSON.stringify({bindings:result.audit.bindings.map(b=>b.name),records:result.audit.records.length,boundaries:result.audit.boundaries.length,complete:result.audit.complete,gaps:result.audit.gaps}));
