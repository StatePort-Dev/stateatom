// SPDX-License-Identifier: Apache-2.0
// Explicit trusted retained-source qualification, never a browser/native launcher.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {propCopyProfile,transformPinnedPropCopy} from './prop-copy-vendor.mjs';
import {instrumentCallbackCopyIntervals} from './callback-copy-transform.mjs';
import {callbackCopyCases,callbackCopyApplication,executeCallbackCopySource} from '../../tests/helpers/react19-callback-copy-controls.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const root=process.cwd(),base=path.resolve('.artifacts/a02/callback-copy-source/2026-10-25'),registrationFile=base+'/registration.json';
const actualVendor=path.resolve('.runtime/todomvc/examples/react/node_modules/react/cjs/react.development.js');
const ownFiles=['experiments/react19-reducer/callback-copy-observer.mjs','experiments/react19-reducer/callback-copy-transform.mjs','experiments/react19-reducer/callback-copy-source-run.mjs','tests/engine/react19-callback-copy-observer.test.mjs','tests/engine/react19-callback-copy-transform.test.mjs','tests/helpers/react19-callback-copy-controls.mjs','docs/superpowers/specs/2026-10-25-a02-callback-copy-interval-design.md','docs/superpowers/plans/2026-10-25-a02-callback-copy-interval.md','package.json','package-lock.json','node_modules/@babel/parser/package.json','node_modules/@babel/traverse/package.json','node_modules/@babel/generator/package.json','node_modules/@babel/types/package.json'];
async function currentInputs(reg){
 assert.equal(reg.schema,'stateatom.callback-copy-source-registration/1');assert.equal(reg.base,'d57c022cb3746aa27aee1f1a4f123b0404dd7990');assert.deepEqual(reg.declaredResearchDeltas,[]);
 assert.equal(Object.keys(reg.sourceBefore).length,56);assert.equal(Object.keys(reg.productInputs).length,327);assert.equal(Object.keys(reg.L02Raw).length,12);assert.equal(reg.V03Raw.length,15);assert.equal(Object.keys(reg.protectedInputs).length,4);assert.equal(Object.keys(reg.A0210Raw).length,2);
 assert.equal(reg.vendor.file,actualVendor);assert.equal(reg.vendor.sha256,propCopyProfile.sha256);assert.equal(reg.vendor.version,propCopyProfile.version);
 const expected={...reg.sourceBefore,...reg.productInputs,...reg.L02Raw,...reg.protectedInputs,...reg.A0210Raw,[reg.vendor.file]:reg.vendor.sha256,[reg.vendor.package]:reg.vendor.packageSha256};
 for(const row of reg.V03Raw)expected[path.resolve(row.file)]=row.sha256;
 for(const[file,digest]of Object.entries(expected)){assert(path.isAbsolute(file)&&path.resolve(file)===file&&file.startsWith(root+'/'));assert.match(digest,/^[a-f0-9]{64}$/);assert.equal(hash(await readFile(file)),digest,'Registered old input drift');}
 for(const file of [...ownFiles,registrationFile])expected[path.resolve(file)]=hash(await readFile(file));
 const pkg=JSON.parse(await readFile(reg.vendor.package));assert.equal(pkg.name,'react');assert.equal(pkg.version,propCopyProfile.version);
 return expected;
}
function verifyCase(row,applicationReceipt){
 const{id,original,off,on}=row;
 assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.trace,original.trace);assert.deepEqual(on.trace,original.trace);
 assert.equal(on.summary.helperFrame,false);assert.equal(on.summary.valueProxyTraps,0);assert.equal(on.summary.iteratorCalls,0);assert.equal(on.summary.intrinsicCalls,0);
 assert.equal(on.sourceOnly,true);assert.equal(on.fixtureInputsOnly,true);assert.equal(on.browserStarted,false);assert.equal(on.nativeWriterCalls,0);assert.equal(on.modelCalls,0);
 assert.doesNotMatch(JSON.stringify(on.snapshot),/private-synthetic/);
 for(const key of ['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin'])assert.equal(on.snapshot[key],'Unknown/Unsupported');assert.equal(on.snapshot.nativeOrigin,'NotAttested');assert.equal(on.snapshot.fullPath,false);
 assert.equal(on.receipt.generatedDigest,applicationReceipt.generatedDigest);assert.equal(on.receipt.sourceDigest,applicationReceipt.sourceDigest);assert.equal(on.receipt.intervalSites.length,2);
 const positive=['new','two-new','getter','stack-getter','proxy-config','proxy-item','prototype-setter','iterator-mutate','iterator-throw','weakmap-get','array-push'].includes(id),count=positive?id==='two-new'?2:1:0;
 assert.equal(on.snapshot.links.length,count);assert.equal(on.snapshot.status,positive?'Observed':'Unknown/Unsupported');assert.equal(off.snapshot.links.length,0);assert.equal(original.snapshot.links.length,0);
 for(const link of on.snapshot.links){assert.equal(link.itemId,link.copyInputId);assert.equal(link.copyOccurrence.status,'completed');assert.equal(link.site.sourceDigest,applicationReceipt.sourceDigest);assert.equal(link.site.kind,'map');}
 for(const selected of on.selected)assert.equal(selected.status,positive?'Observed':'Unknown/Unsupported');
 if(id==='prototype-setter'){assert.equal(on.summary.ownsTodo,false);assert.equal(on.snapshot.propStorage,'Unknown/Unsupported');}
 if(id==='throw-getter')assert.equal(on.summary.sameThrown,true);
 if(id==='two-new'){assert.equal(on.summary.distinctElements,true);assert.equal(on.summary.secondMatches,true);assert.notEqual(on.snapshot.links[0].itemId,on.snapshot.links[1].itemId);}
}
export async function runCallbackCopySourceQualification(args=process.argv.slice(2)){
 if(!Array.isArray(args)||args.length!==0)throw Object.assign(Error('INVALID_ARGUMENTS'),{code:'INVALID_ARGUMENTS'});
 const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',timeout:5000}).trim(),sourceDirty=execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8',timeout:5000}).trim()!=='';
 const reg=JSON.parse(await readFile(registrationFile)),inputs=await currentInputs(reg),source=await readFile(actualVendor,'utf8'),transformed=transformPinnedPropCopy(source,propCopyProfile.file);
 assert.equal(transformed.nativeVersionAdmitted,true);assert.equal(transformed.sourceDigest,propCopyProfile.sha256);
 const app=instrumentCallbackCopyIntervals(callbackCopyApplication,'owned-callback-application.js',{enabled:true,sourceType:'script'});assert.equal(app.skipped,false);assert.equal(app.intervalSites.length,2);
 const applicationReceipt={...app,code:undefined,generatedDigest:hash(app.code)};
 const out=base+'/qualification-'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{mode:0o700});
 const node={version:process.version,executable:await realpath(process.execPath),sha256:hash(await readFile('/proc/self/exe'))};
 const registration={schema:'stateatom.callback-copy-vm-registration/1',at:new Date().toISOString(),sourceRevision,sourceDirty,sourceOnly:true,fixtureInputsOnly:true,sourceProfile:propCopyProfile,recipeReceipt:{...transformed,code:undefined},applicationReceipt,inputs,node,cases:callbackCopyCases,modes:['original','off','on'],VMContextsBeforeExecution:0,browserStarted:false,nativeWriterCalls:0,modelCalls:0};
 await writeFile(out+'/registered-before-vm.json',JSON.stringify(registration,null,2)+'\n',{flag:'wx'});await writeFile(out+'/transformed-react.cjs',transformed.code,{flag:'wx'});await writeFile(out+'/transformed-application.js',app.code,{flag:'wx'});
 const result={schema:'stateatom.callback-copy-source-qualification/1',status:'SOURCE_QUALIFICATION_INCOMPLETE',sourceRevision,sourceDirty,sourceOnly:true,fixtureInputsOnly:true,sourceProfile:propCopyProfile,recipeReceipt:{...transformed,code:undefined},applicationReceipt,node,inputsBefore:inputs,inputsAfter:null,inputsUnchanged:false,rows:[],VMContextsExecuted:0,browserStarted:false,nativeWriterCalls:0,modelCalls:0,productImporter:false,nativeRuntimeProven:false,fullA02:false,errors:[]};
 try{
  for(const id of callbackCopyCases){const row={id,currentMode:null};result.rows.push(row);for(const mode of ['original','off','on']){row.currentMode=mode;row[mode]=executeCallbackCopySource({source:mode==='original'?source:transformed.code,caseName:id,mode});result.VMContextsExecuted++;}row.currentMode=null;verifyCase(row,applicationReceipt);row.status='PASS_SOURCE_CONTROL';await writeFile(out+'/running.json',JSON.stringify(result,null,2)+'\n');}
  result.status='RETAINED_REACT_CALLBACK_INTERVAL_SOURCE_VM_QUALIFIED_NOT_NATIVE_A02';
 }catch(error){result.errors.push({name:error.name,message:error.message,stack:error.stack});}
 finally{
  const after={};try{for(const[file,digest]of Object.entries(inputs)){after[file]=hash(await readFile(file));assert.equal(after[file],digest,'Source changed during VM qualification');}result.inputsAfter=after;result.inputsUnchanged=true;}catch(error){result.errors.push({name:error.name,message:error.message});result.status='SOURCE_QUALIFICATION_INCOMPLETE';}
  result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(result.status,out);if(result.status!=='RETAINED_REACT_CALLBACK_INTERVAL_SOURCE_VM_QUALIFIED_NOT_NATIVE_A02')process.exitCode=1;
 }
 return{out,result};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)runCallbackCopySourceQualification().catch(error=>{console.error('CALLBACK_COPY_SOURCE_ERROR',error.code==='INVALID_ARGUMENTS'?'INVALID_ARGUMENTS':'FAILED');process.exitCode=1;});
