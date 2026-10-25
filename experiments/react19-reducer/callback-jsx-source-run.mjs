// SPDX-License-Identifier: Apache-2.0
// One newly registered owned source matrix; no native/browser/product launcher.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {transform} from 'esbuild';
import {jsxConfigProfile,transformPinnedJSXConfig} from './jsx-config-vendor.mjs';
import {propCopyProfile,transformPinnedPropCopy} from './prop-copy-vendor.mjs';
import {instrumentJSXConfigInputs} from './jsx-config-transform.mjs';
import {instrumentCallbackCopyIntervals} from './callback-copy-transform.mjs';
import {callbackJSXCases,expectedCallbackJSXLinks,prepareCallbackJSXCase,executeCallbackJSXCase} from '../../tests/helpers/react19-callback-jsx-controls.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex'),root=process.cwd(),base=path.resolve('.artifacts/a02/callback-jsx-interval/2026-10-25'),registrationFile=base+'/registration.json';
const delta='experiments/react19-reducer/callback-copy-observer.mjs';
const ownFiles=[delta,'experiments/react19-reducer/callback-jsx-source-run.mjs','tests/helpers/react19-callback-jsx-controls.mjs','tests/engine/react19-callback-jsx-observer.test.mjs','tests/engine/react19-callback-jsx-recipes.test.mjs','docs/superpowers/specs/2026-10-25-a02-callback-jsx-interval-design.md','docs/superpowers/plans/2026-10-25-a02-callback-jsx-interval.md','package.json','package-lock.json','node_modules/esbuild/package.json','node_modules/@babel/parser/package.json','node_modules/@babel/traverse/package.json','node_modules/@babel/generator/package.json','node_modules/@babel/types/package.json'];
async function currentInputs(reg){
 assert.equal(reg.schema,'stateatom.callback-jsx-source-registration/1');assert.equal(reg.base,'0cc2457e1ef6e7950bf9b043a0dece29fb7bff7d');assert.deepEqual(reg.declaredResearchDeltas,[delta]);
 assert.equal(Object.keys(reg.sourceBefore).length,78);assert.equal(Object.keys(reg.productInputs).length,327);assert.equal(reg.V03Raw.length,15);assert.equal(Object.keys(reg.L02Raw).length,12);assert.equal(Object.keys(reg.protectedInputs).length,4);assert.equal(Object.keys(reg.A0210Raw).length,2);assert.equal(Object.keys(reg.A0211Raw).length,1);assert.equal(Object.keys(reg.A0212Raw).length,2);assert.equal(Object.keys(reg.A0214Raw).length,3);
 const inputs={...reg.sourceBefore,...reg.productInputs,...reg.L02Raw,...reg.protectedInputs,...reg.A0210Raw,...reg.A0211Raw,...reg.A0212Raw,...reg.A0213SourceDiagnosis,...reg.A0214Raw,...reg.Main,[reg.vendor.file]:reg.vendor.sha256,[reg.vendor.package]:reg.vendor.packageSha256,[reg.jsxVendor.file]:reg.jsxVendor.sha256};
 for(const row of reg.V03Raw)inputs[path.resolve(row.file)]=row.sha256;
 delete inputs[path.resolve(delta)];
 for(const[file,digest]of Object.entries(inputs)){assert(path.isAbsolute(file)&&file.startsWith(root+'/'));assert.equal(hash(await readFile(file)),digest,'Protected input drift');}
 assert.equal(reg.vendor.file,path.resolve('.runtime/todomvc/examples/react/node_modules/react/cjs/react.development.js'));assert.equal(reg.jsxVendor.file,path.resolve('.runtime/todomvc/examples/react/node_modules/react/cjs/react-jsx-runtime.development.js'));
 assert.equal(reg.vendor.sha256,propCopyProfile.sha256);assert.equal(reg.jsxVendor.sha256,jsxConfigProfile.sha256);assert.equal(reg.vendor.version,'19.2.5');assert.equal(reg.jsxVendor.version,'19.2.5');assert.equal(reg.jsxVendor.package,reg.vendor.package);
 const pkg=JSON.parse(await readFile(reg.vendor.package));assert.equal(pkg.name,'react');assert.equal(pkg.version,'19.2.5');
 for(const file of [...ownFiles,registrationFile])inputs[path.resolve(file)]=hash(await readFile(file));return inputs;
}
function verifyCase({id,original,off,on}){
 assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.trace,original.trace);assert.deepEqual(off.trace,original.trace);assert.equal(on.warnings,original.warnings);assert.equal(off.warnings,original.warnings);
 for(const r of [original,off,on]){
  assert.equal(r.sourceOnly,true);assert.equal(r.fixtureInputsOnly,true);assert.equal(r.browserStarted,false);assert.equal(r.nativeWriterCalls,0);assert.equal(r.modelCalls,0);
  for(const k of ['valueTraps','iteratorCalls','intrinsicCalls'])assert.equal(r.summary[k],0);assert.equal(r.summary.helperFrame,false);assert.equal(r.summary.lexicalOK,true);assert.equal(r.hookGetterReads,0);
  for(const k of ['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin'])assert.equal(r.snapshot[k],'Unknown/Unsupported');assert.equal(r.snapshot.nativeOrigin,'NotAttested');assert.equal(r.snapshot.fullPath,false);
 }
 const count=expectedCallbackJSXLinks[id];assert.equal(original.snapshot.links.length,0);assert.equal(off.snapshot.links.length,0);assert.equal(on.snapshot.links.length,count);
 for(const selected of on.selected)assert.equal(selected.status,count?'Observed':'Unknown/Unsupported');
 assert.equal(on.snapshot.schema,id==='classic-new'?'stateatom.callback-copy-interval/1':'stateatom.callback-jsx-config-interval/1');
 if(count){assert.equal(on.identityOracle.length,count);for(const row of on.identityOracle){assert.equal(row.valueIsOriginalCallbackItem,true);assert.equal(row.configIsReturnedProps,true);}}
 if(id==='freeze-mutate'){assert.equal(on.summary.storedFirst,false);assert.equal(on.summary.storedSecond,true);}
 if(id==='expression-getter')assert.equal(on.summary.reads,1);if(id==='key-getter')assert.equal(on.summary.keyReads,1);
 if(id.startsWith('throw-')||id==='freeze-throw')assert.equal(on.summary.sameThrown,true);if(id==='foreign-map')assert.equal(on.summary.callbackLength,1);
 assert.doesNotMatch(JSON.stringify(on.snapshot),/private-owned/);
}
export async function runCallbackJSXSourceQualification(args=process.argv.slice(2)){
 if(!Array.isArray(args)||args.length!==0)throw Object.assign(Error('INVALID_ARGUMENTS'),{code:'INVALID_ARGUMENTS'});
 const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',timeout:5000}).trim(),sourceDirty=execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8',timeout:5000}).trim()!=='';assert.equal(sourceDirty,false,'Commit source before retained qualification');
 const reg=JSON.parse(await readFile(registrationFile)),inputs=await currentInputs(reg),reactSource=await readFile(reg.vendor.file,'utf8'),jsxSource=await readFile(reg.jsxVendor.file,'utf8'),jsxNative=transformPinnedJSXConfig(jsxSource,jsxConfigProfile.file),classicNative=transformPinnedPropCopy(reactSource,propCopyProfile.file);
 assert.equal(jsxNative.nativeVersionAdmitted,true);assert.equal(classicNative.nativeVersionAdmitted,true);
 const prepared={};for(const id of callbackJSXCases){prepared[id]={};for(const mode of ['original','off','on'])prepared[id][mode]=await prepareCallbackJSXCase({caseName:id,mode});}
 const mainFile=Object.keys(reg.Main)[0],main=await readFile(mainFile,'utf8'),interval=instrumentCallbackCopyIntervals(main,path.relative(root,mainFile),{enabled:true}),mainStatic=[];assert.equal(interval.skipped,false);
 for(const[name,text,count]of[['original',main,1],['interval',interval.code,2]]){const c=await transform(text,{loader:'jsx',jsx:'automatic',format:'esm',target:'es2022'}),r=instrumentJSXConfigInputs(c.code,'owned-compiled-main.js',{enabled:true});assert.equal(r.skipped,false);assert.equal(r.sites.length,count);mainStatic.push({name,compiledDigest:hash(c.code),sites:r.sites,appExecuted:false});}
 const out=base+'/qualification-'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{mode:0o700});
 const compilation=[];for(const id of callbackJSXCases)for(const mode of ['original','off','on']){const p=prepared[id][mode],file=out+'/'+id+'-'+mode+'.cjs';assert.equal(hash(p.code),p.compiledDigest);await writeFile(file,p.code,{flag:'wx'});inputs[file]=p.compiledDigest;compilation.push({...p,code:undefined,file});}
 for(const[name,receipt]of[['jsx',jsxNative],['classic',classicNative]]){const file=out+'/transformed-'+name+'.cjs';await writeFile(file,receipt.code,{flag:'wx'});inputs[file]=receipt.outputDigest;}
 const node={version:process.version,executable:await realpath(process.execPath),sha256:hash(await readFile('/proc/self/exe'))},recipes={jsx:{...jsxNative,code:undefined},classic:{...classicNative,code:undefined}};
 const registration={schema:'stateatom.callback-jsx-vm-registration/1',at:new Date().toISOString(),sourceRevision,sourceDirty,inputs,node,cases:callbackJSXCases,expectedLinks:expectedCallbackJSXLinks,modes:['original','off','on'],hookControls:['missing','accessor','throwing'],compilation,recipes,mainStatic,VMContextsStarted:0,VMContextsCompleted:0,processEnvironment:'development',moduleLexicalWrappers:true,sourceOnly:true};
 await writeFile(out+'/registered-before-vm.json',JSON.stringify(registration,null,2)+'\n',{flag:'wx'});
 const marker={schema:'stateatom.callback-jsx-source-started/1',sourceRevision,out,at:new Date().toISOString(),maximumRuns:1};await writeFile(base+'/source-run-started.json',JSON.stringify(marker,null,2)+'\n',{flag:'wx'});
 const result={schema:'stateatom.callback-jsx-source-qualification/1',status:'SOURCE_QUALIFICATION_INCOMPLETE',sourceRevision,sourceDirty,node,inputsBefore:inputs,inputsAfter:null,inputsUnchanged:false,recipes,compilation,mainStatic,marker,rows:[],hookControls:[],VMContextsStarted:0,VMContextsCompleted:0,sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0,modelCalls:0,productImporter:false,ReactDOMExecuted:false,installedRuntimeProven:false,JSXProductSupported:false,fullA02:false,errors:[]};
 try{
  for(const id of callbackJSXCases){const row={id,currentMode:null};result.rows.push(row);for(const mode of ['original','off','on']){row.currentMode=mode;result.VMContextsStarted++;row[mode]=executeCallbackJSXCase({reactSource:id==='classic-new'&&mode!=='original'?classicNative.code:reactSource,jsxSource:mode==='original'?jsxSource:jsxNative.code,prepared:prepared[id][mode]});result.VMContextsCompleted++;}row.currentMode=null;verifyCase(row);row.status=expectedCallbackJSXLinks[id]?'PASS_SCOPED_CALLBACK_INPUT':'PASS_EXPECTED_UNSUPPORTED_INTERVAL';await writeFile(out+'/running.json',JSON.stringify(result,null,2)+'\n');}
  const baseline=result.rows.find(r=>r.id==='ordinary').original;
  for(const hook of ['missing','accessor','throwing']){const row={hook};result.hookControls.push(row);result.VMContextsStarted++;row.result=executeCallbackJSXCase({reactSource,jsxSource:jsxNative.code,prepared:prepared.ordinary.on,hook});result.VMContextsCompleted++;assert.deepEqual(row.result.summary,baseline.summary);assert.deepEqual(row.result.trace,baseline.trace);assert.equal(row.result.hookGetterReads,0);assert.equal(row.result.snapshot.links.length,0);row.status='PASS_SOURCE_ERROR_ISOLATION';}
  result.status='RETAINED_REACT_CALLBACK_JSX_SOURCE_VM_QUALIFIED_NOT_PRODUCT_A02';
 }catch(error){result.errors.push({name:error.name,message:error.message,stack:error.stack});}
 finally{const after={};try{for(const[file,digest]of Object.entries(inputs)){after[file]=hash(await readFile(file));assert.equal(after[file],digest,'Current source/compiled input drift');}result.inputsAfter=after;result.inputsUnchanged=true;}catch(error){result.errors.push({name:error.name,message:error.message});result.status='SOURCE_QUALIFICATION_INCOMPLETE';}
 result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(result.status,out);if(result.status!=='RETAINED_REACT_CALLBACK_JSX_SOURCE_VM_QUALIFIED_NOT_PRODUCT_A02')process.exitCode=1;}
 return{out,result};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)runCallbackJSXSourceQualification().catch(error=>{console.error('CALLBACK_JSX_SOURCE_ERROR',error.code==='INVALID_ARGUMENTS'?'INVALID_ARGUMENTS':'FAILED');process.exitCode=1;});
