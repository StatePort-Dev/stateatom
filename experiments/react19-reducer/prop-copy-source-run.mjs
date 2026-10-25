// SPDX-License-Identifier: Apache-2.0
// Explicit retained-source NodeVM qualification, never a browser/native launcher.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {propCopyProfile,transformPinnedPropCopy} from './prop-copy-vendor.mjs';
import {propCopyCases,executePropCopySource} from '../../tests/helpers/react19-prop-copy-controls.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const root=process.cwd(),base=path.resolve('.artifacts/a02/prop-copy-source/2026-10-25');
const registrationFile=base+'/registration.json';
const actualVendor=path.resolve('.runtime/todomvc/examples/react/node_modules/react/cjs/react.development.js');
const ownFiles=['experiments/react19-reducer/prop-copy-observer.mjs','experiments/react19-reducer/prop-copy-vendor.mjs','experiments/react19-reducer/prop-copy-source-run.mjs','tests/engine/react19-prop-copy-observer.test.mjs','tests/engine/react19-prop-copy-vendor.test.mjs','tests/helpers/react19-prop-copy-controls.mjs','docs/superpowers/specs/2026-10-25-a02-react19-prop-copy-input-design.md','docs/superpowers/plans/2026-10-25-a02-react19-prop-copy-input.md','package.json','package-lock.json','node_modules/@babel/parser/package.json','node_modules/@babel/traverse/package.json','node_modules/@babel/generator/package.json','node_modules/@babel/types/package.json'];
async function currentInputs(reg){
 assert.equal(reg.schema,'stateatom.react19-prop-copy-source-registration/1');assert.equal(reg.base,'f48be1ac435b30c213debdba58ead5b9f5c44cc8');assert.deepEqual(reg.declaredResearchDeltas,[]);
 assert.equal(Object.keys(reg.sourceBefore).length,47);assert.equal(Object.keys(reg.productInputs).length,327);assert.equal(Object.keys(reg.L02Raw).length,12);assert.equal(reg.V03Raw.length,15);assert.equal(Object.keys(reg.protectedInputs).length,4);
 assert.equal(reg.vendor.file,actualVendor);assert.equal(reg.vendor.sha256,propCopyProfile.sha256);assert.equal(reg.vendor.version,propCopyProfile.version);
 const expected={...reg.sourceBefore,...reg.productInputs,...reg.L02Raw,...reg.protectedInputs,[reg.vendor.file]:reg.vendor.sha256,[reg.vendor.package]:reg.vendor.packageSha256};
 for(const p of reg.V03Raw)expected[path.resolve(p.file)]=p.sha256;
 for(const[file,digest]of Object.entries(expected)){assert(path.isAbsolute(file)&&path.resolve(file)===file&&file.startsWith(root+'/'));assert.match(digest,/^[a-f0-9]{64}$/);assert.equal(hash(await readFile(file)),digest,'Registered old input drift');}
 for(const file of [...ownFiles,registrationFile])expected[path.resolve(file)]=hash(await readFile(file));
 const pkg=JSON.parse(await readFile(reg.vendor.package));assert.equal(pkg.name,'react');assert.equal(pkg.version,propCopyProfile.version);
 return expected;
}
function verifyCase(row){
 const {id,original,off,on}=row;
 assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.trace,original.trace);assert.deepEqual(on.trace,original.trace);
 assert.equal(on.getterHelperFrame,false);assert.equal(on.proxyValueTraps,0);assert.equal(on.hookGetterReads,0);assert.equal(on.sourceOnly,true);assert.equal(on.fixtureInputsOnly,true);assert.equal(on.browserStarted,false);assert.equal(on.nativeWriterCalls,0);
 assert.doesNotMatch(JSON.stringify(on.snapshot),/synthetic-private/);
 for(const key of ['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin'])assert.equal(on.snapshot[key],'Unknown/Unsupported');assert.equal(on.snapshot.nativeOrigin,'NotAttested');assert.equal(on.snapshot.fullPath,false);
 const positive=['object','equal-two','getter','proxy-config','proxy-value','stack-getter','prototype-setter'].includes(id);
 assert.equal(on.selected.status,positive?'Observed':'Unknown/Unsupported');
 if(id==='equal-two'){assert.equal(on.snapshot.links.length,2);assert.notEqual(on.snapshot.links[0].valueId,on.snapshot.links[1].valueId);}
 if(id==='prototype-setter'){assert.equal(on.summary.ownsTodo,false);assert.equal(on.copyIntoSelectedProps,true);assert.equal(on.snapshot.propStorage,'Unknown/Unsupported');}
 if(id==='throw-getter'){assert.equal(on.summary.sameThrown,true);assert.equal(on.copyInputs,0);}
 if(id==='clone'){assert.equal(on.summary.todoMatches,true);assert.equal(on.copyIntoSelectedProps,false);}
 if(positive)assert.equal(on.copyInputsMatchRows,true);
}
export async function runPropCopySourceQualification(args=process.argv.slice(2)){
 if(!Array.isArray(args)||args.length!==0)throw Object.assign(Error('INVALID_ARGUMENTS'),{code:'INVALID_ARGUMENTS'});
 const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',timeout:5000}).trim(),sourceDirty=execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8',timeout:5000}).trim()!=='';
 const reg=JSON.parse(await readFile(registrationFile)),inputs=await currentInputs(reg),source=await readFile(actualVendor,'utf8'),transformed=transformPinnedPropCopy(source,propCopyProfile.file);
 assert.equal(transformed.nativeVersionAdmitted,true);assert.equal(transformed.sourceDigest,propCopyProfile.sha256);
 const out=base+'/qualification-'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{mode:0o700});
 const node={version:process.version,executable:await realpath(process.execPath),sha256:hash(await readFile('/proc/self/exe'))};
 await writeFile(out+'/registered-before-vm.json',JSON.stringify({schema:'stateatom.prop-copy-source-registration/1',at:new Date().toISOString(),sourceRevision,sourceDirty,sourceOnly:true,fixtureInputsOnly:true,sourceProfile:propCopyProfile,recipeReceipt:{...transformed,code:undefined},inputs,node,cases:propCopyCases,modes:['original','off','on'],VMContextsBeforeExecution:0,browserStarted:false,nativeWriterCalls:0,modelCalls:0},null,2)+'\n',{flag:'wx'});
 await writeFile(out+'/transformed-react.cjs',transformed.code,{flag:'wx'});
 const result={schema:'stateatom.react19-prop-copy-source-qualification/1',status:'SOURCE_QUALIFICATION_INCOMPLETE',sourceRevision,sourceDirty,sourceOnly:true,fixtureInputsOnly:true,sourceProfile:propCopyProfile,recipeReceipt:{...transformed,code:undefined},node,inputsBefore:inputs,inputsAfter:null,inputsUnchanged:false,rows:[],tapControls:[],VMContextsExecuted:0,browserStarted:false,nativeWriterCalls:0,modelCalls:0,productImporter:false,nativeRuntimeProven:false,fullA02:false,errors:[]};
 try{
  for(const id of propCopyCases){const row={id,currentMode:null};result.rows.push(row);for(const mode of ['original','off','on']){row.currentMode=mode;row[mode]=executePropCopySource({source:mode==='original'?source:transformed.code,caseName:id,mode});result.VMContextsExecuted++;}row.currentMode=null;verifyCase(row);row.status='PASS_SOURCE_CONTROL';await writeFile(out+'/running.json',JSON.stringify(result,null,2)+'\n');}
  const original=result.rows.find(r=>r.id==='getter').original;
  for(const hook of ['missing','accessor','throwing']){const item={hook};result.tapControls.push(item);item.result=executePropCopySource({source:transformed.code,caseName:'getter',mode:'on',hook});result.VMContextsExecuted++;assert.deepEqual(item.result.summary,original.summary);assert.deepEqual(item.result.trace,original.trace);assert.equal(item.result.hookGetterReads,0);item.status='PASS_SOURCE_CONTROL';}
  result.status='RETAINED_REACT_SOURCE_VM_QUALIFIED_NOT_NATIVE_A02';
 }catch(error){result.errors.push({name:error.name,message:error.message,stack:error.stack});}
 finally{
  const after={};try{for(const[file,digest]of Object.entries(inputs)){after[file]=hash(await readFile(file));assert.equal(after[file],digest,'Source changed during VM qualification');}result.inputsAfter=after;result.inputsUnchanged=true;}catch(error){result.errors.push({name:error.name,message:error.message});result.status='SOURCE_QUALIFICATION_INCOMPLETE';}
  result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(result.status,out);if(result.status!=='RETAINED_REACT_SOURCE_VM_QUALIFIED_NOT_NATIVE_A02')process.exitCode=1;
 }
 return {out,result};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)runPropCopySourceQualification().catch(error=>{console.error('PROP_COPY_SOURCE_ERROR',error.code==='INVALID_ARGUMENTS'?'INVALID_ARGUMENTS':'FAILED');process.exitCode=1;});
