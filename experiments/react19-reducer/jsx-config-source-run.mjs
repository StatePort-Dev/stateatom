// SPDX-License-Identifier: Apache-2.0
// Trusted retained CJS + JSX source qualification, never a browser/native launcher.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {transform} from 'esbuild';
import {jsxConfigProfile,transformPinnedJSXConfig} from './jsx-config-vendor.mjs';
import {instrumentJSXConfigInputs} from './jsx-config-transform.mjs';
import {instrumentCallbackCopyIntervals} from './callback-copy-transform.mjs';
import {jsxConfigCases,prepareJSXConfigCase,executeJSXConfigCase} from '../../tests/helpers/react19-jsx-config-controls.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const root=process.cwd(),base=path.resolve('.artifacts/a02/jsx-config-input/2026-10-25'),registrationFile=base+'/registration.json';
const ownFiles=['experiments/react19-reducer/jsx-config-observer.mjs','experiments/react19-reducer/jsx-config-transform.mjs','experiments/react19-reducer/jsx-config-vendor.mjs','experiments/react19-reducer/jsx-config-source-run.mjs','tests/engine/react19-jsx-config-observer.test.mjs','tests/engine/react19-jsx-config-recipes.test.mjs','tests/helpers/react19-jsx-config-controls.mjs','docs/superpowers/specs/2026-10-25-a02-jsx-config-input-design.md','docs/superpowers/plans/2026-10-25-a02-jsx-config-input.md','package.json','package-lock.json','node_modules/esbuild/package.json','node_modules/@babel/parser/package.json','node_modules/@babel/traverse/package.json','node_modules/@babel/generator/package.json','node_modules/@babel/types/package.json'];
async function currentInputs(reg){
 assert.equal(reg.schema,'stateatom.jsx-config-source-registration/1');assert.equal(reg.base,'b26cbb235cdab769a7d1514e2db7bddb2e5578d8');assert.deepEqual(reg.declaredResearchDeltas,[]);
 assert.equal(Object.keys(reg.sourceBefore).length,71);assert.equal(Object.keys(reg.productInputs).length,327);assert.equal(reg.V03Raw.length,15);assert.equal(Object.keys(reg.L02Raw).length,12);assert.equal(Object.keys(reg.protectedInputs).length,4);assert.equal(Object.keys(reg.A0210Raw).length,2);assert.equal(Object.keys(reg.A0211Raw).length,1);assert.equal(Object.keys(reg.A0212Raw).length,2);
 const inputs={...reg.sourceBefore,...reg.productInputs,...reg.L02Raw,...reg.protectedInputs,...reg.A0210Raw,...reg.A0211Raw,...reg.A0212Raw,...reg.A0213SourceDiagnosis,...reg.Main,[reg.vendor.file]:reg.vendor.sha256,[reg.vendor.package]:reg.vendor.packageSha256,[reg.jsxVendor.file]:reg.jsxVendor.sha256};
 for(const row of reg.V03Raw)inputs[path.resolve(row.file)]=row.sha256;
 for(const[file,digest]of Object.entries(inputs)){assert(path.isAbsolute(file)&&file.startsWith(root+'/'));assert.equal(hash(await readFile(file)),digest,'Registered protected input drift');}
 assert.equal(reg.vendor.sha256,'4325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72');assert.equal(reg.vendor.version,jsxConfigProfile.version);assert.equal(reg.jsxVendor.sha256,jsxConfigProfile.sha256);assert.equal(reg.jsxVendor.version,jsxConfigProfile.version);assert.equal(reg.jsxVendor.package,reg.vendor.package);
 assert.equal(reg.vendor.file,path.resolve('.runtime/todomvc/examples/react/node_modules/react/cjs/react.development.js'));assert.equal(reg.jsxVendor.file,path.resolve('.runtime/todomvc/examples/react/node_modules/react/cjs/react-jsx-runtime.development.js'));
 const pkg=JSON.parse(await readFile(reg.vendor.package));assert.equal(pkg.name,'react');assert.equal(pkg.version,'19.2.5');
 for(const file of [...ownFiles,registrationFile])inputs[path.resolve(file)]=hash(await readFile(file));return inputs;
}
const positive=id=>['ordinary','two','expression-getter','key-getter','proxy-value','freeze-mutate','iterator-mutate','iterator-throw','descriptor-replaced'].includes(id);
function verifyCase(row){
 const{id,original,off,on}=row;assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.trace,original.trace);assert.deepEqual(off.trace,original.trace);assert.equal(on.warnings,original.warnings);assert.equal(off.warnings,original.warnings);
 for(const r of [original,off,on]){
  assert.equal(r.sourceOnly,true);assert.equal(r.fixtureInputsOnly,true);assert.equal(r.browserStarted,false);assert.equal(r.nativeWriterCalls,0);assert.equal(r.modelCalls,0);
  assert.equal(r.summary.iteratorCalls,0);assert.equal(r.summary.mutation,0);assert.equal(r.summary.valueTraps,0);assert.equal(r.summary.helperFrame,false);assert.equal(r.summary.descriptorCalls,0);assert.equal(r.hookGetterReads,0);
  for(const k of ['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin'])assert.equal(r.snapshot[k],'Unknown/Unsupported');assert.equal(r.snapshot.nativeOrigin,'NotAttested');assert.equal(r.snapshot.fullPath,false);
 }
 assert.equal(original.selected.status,'Unknown/Unsupported');assert.equal(off.selected.status,'Unknown/Unsupported');assert.equal(on.selected.status,positive(id)?'Observed':'Unknown/Unsupported');
 if(positive(id)){assert.equal(on.inputOracle[0].isOriginalRow,true);assert.equal(on.inputOracle[0].isSelectedProps,true);assert.equal(on.selected.links.length,1);}
 if(id==='two'){assert.equal(on.secondSelected.status,'Observed');assert.notEqual(on.selected.links[0].valueId,on.secondSelected.links[0].valueId);}
 if(id==='freeze-mutate'){assert.equal(on.summary.storedIsRow,false);assert.equal(on.summary.storedIsSecond,true);assert.equal(on.summary.freezeCalls,2);assert.equal(on.selected.propStorage,'Unknown/Unsupported');}
 if(id==='prototype-key'){assert.equal(on.inputOracle[0].isOriginalRow,true);assert.equal(on.inputOracle[0].isSelectedProps,false);assert.equal(on.retention.pending,1);}
 if(id==='accessor')assert.equal(on.summary.reads,0);
 if(['expression-getter','key-getter'].includes(id))assert.equal(on.summary.reads,1);
 if(id==='key-getter')assert.equal(on.summary.keyReads,1);
 if(id==='clone'){assert.equal(on.snapshot.links.length,1);assert.equal(on.selected.links.length,0);}
 assert.doesNotMatch(JSON.stringify(on.snapshot),/synthetic-private/);
}
export async function runJSXConfigSourceQualification(args=process.argv.slice(2)){
 if(!Array.isArray(args)||args.length!==0)throw Object.assign(Error('INVALID_ARGUMENTS'),{code:'INVALID_ARGUMENTS'});
 const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',timeout:5000}).trim(),sourceDirty=execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8',timeout:5000}).trim()!=='';assert.equal(sourceDirty,false,'Commit source before retained qualification');
 const reg=JSON.parse(await readFile(registrationFile)),inputs=await currentInputs(reg),reactSource=await readFile(reg.vendor.file,'utf8'),jsxSource=await readFile(reg.jsxVendor.file,'utf8'),native=transformPinnedJSXConfig(jsxSource,jsxConfigProfile.file);
 assert.equal(native.nativeVersionAdmitted,true);assert.equal(native.sourceDigest,reg.jsxVendor.sha256);assert.equal(hash(reactSource),reg.vendor.sha256);
 const prepared={};for(const id of jsxConfigCases){prepared[id]={};for(const mode of ['original','off','on'])prepared[id][mode]=await prepareJSXConfigCase({caseName:id,mode});}
 // Recheck new compiled guard on actual Main; this does not execute a component.
 const mainFile=Object.keys(reg.Main)[0],main=await readFile(mainFile,'utf8'),interval=instrumentCallbackCopyIntervals(main,path.relative(root,mainFile),{enabled:true}),mainStatic=[];
 assert.equal(hash(main),reg.Main[mainFile]);assert.equal(interval.skipped,false);for(const[name,text,count]of [['original',main,1],['interval',interval.code,2]]){const c=await transform(text,{loader:'jsx',jsx:'automatic',format:'esm',target:'es2022',sourcefile:path.relative(root,mainFile)}),r=instrumentJSXConfigInputs(c.code,'compiled-main.js',{enabled:true});assert.equal(r.skipped,false);assert.equal(r.sites.length,count);mainStatic.push({name,compiledDigest:hash(c.code),sites:r.sites,appExecuted:false});}
 const out=base+'/qualification-'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{mode:0o700});
 const compilation=[];for(const id of jsxConfigCases)for(const mode of ['original','off','on']){const p=prepared[id][mode],file=out+'/'+id+'-'+mode+'.cjs';assert.equal(hash(p.code),p.compiledDigest);await writeFile(file,p.code,{flag:'wx'});inputs[file]=p.compiledDigest;compilation.push({...p,code:undefined,file});}
 const nativeFile=out+'/transformed-jsx.cjs';await writeFile(nativeFile,native.code,{flag:'wx'});inputs[nativeFile]=native.outputDigest;
 const node={version:process.version,executable:await realpath(process.execPath),sha256:hash(await readFile('/proc/self/exe'))},recipeReceipt={...native,code:undefined};
 await writeFile(out+'/registered-before-vm.json',JSON.stringify({schema:'stateatom.jsx-config-vm-registration/1',at:new Date().toISOString(),sourceRevision,sourceDirty,inputs,node,cases:jsxConfigCases,modes:['original','off','on'],hookControls:['missing','accessor','throwing'],compilation,recipeReceipt,mainStatic,reactSourceSha256:reg.vendor.sha256,VMContextsStarted:0,VMContextsCompleted:0,sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0,modelCalls:0,processEnvironment:'development'},null,2)+'\n',{flag:'wx'});
 const marker={schema:'stateatom.jsx-config-source-started/1',sourceRevision,out,at:new Date().toISOString(),maximumRuns:1};await writeFile(base+'/source-run-started.json',JSON.stringify(marker,null,2)+'\n',{flag:'wx'});
 const result={schema:'stateatom.jsx-config-source-qualification/1',status:'SOURCE_QUALIFICATION_INCOMPLETE',sourceRevision,sourceDirty,node,inputsBefore:inputs,inputsAfter:null,inputsUnchanged:false,recipeReceipt,reactSourceSha256:reg.vendor.sha256,compilation,mainStatic,marker,rows:[],hookControls:[],VMContextsStarted:0,VMContextsCompleted:0,sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0,modelCalls:0,productImporter:false,ReactDOMExecuted:false,installedRuntimeProven:false,JSXProductSupported:false,fullA02:false,errors:[]};
 try{
  for(const id of jsxConfigCases){const row={id,currentMode:null};result.rows.push(row);for(const mode of ['original','off','on']){row.currentMode=mode;result.VMContextsStarted++;row[mode]=executeJSXConfigCase({reactSource,jsxSource:mode==='original'?jsxSource:native.code,prepared:prepared[id][mode]});result.VMContextsCompleted++;}row.currentMode=null;verifyCase(row);row.status=positive(id)?'PASS_SCOPED_HISTORICAL_INPUT':'PASS_EXPECTED_UNSUPPORTED_SELECTED_INPUT';await writeFile(out+'/running.json',JSON.stringify(result,null,2)+'\n');}
  const baseline=result.rows.find(r=>r.id==='ordinary').original;
  for(const hook of ['missing','accessor','throwing']){const row={hook};result.hookControls.push(row);result.VMContextsStarted++;row.result=executeJSXConfigCase({reactSource,jsxSource:native.code,prepared:prepared.ordinary.on,hook});result.VMContextsCompleted++;assert.deepEqual(row.result.summary,baseline.summary);assert.deepEqual(row.result.trace,baseline.trace);assert.equal(row.result.hookGetterReads,0);assert.equal(row.result.selected.status,'Unknown/Unsupported');row.status='PASS_SOURCE_ERROR_ISOLATION';}
  result.status='RETAINED_REACT_JSX_CONFIG_INPUT_SOURCE_VM_QUALIFIED_NOT_PRODUCT_A02';
 }catch(error){result.errors.push({name:error.name,message:error.message,stack:error.stack});}
 finally{
  const after={};try{for(const[file,digest]of Object.entries(inputs)){after[file]=hash(await readFile(file));assert.equal(after[file],digest,'Current source or compiled input changed during qualification');}result.inputsAfter=after;result.inputsUnchanged=true;}catch(error){result.errors.push({name:error.name,message:error.message});result.status='SOURCE_QUALIFICATION_INCOMPLETE';}
  result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(result.status,out);if(result.status!=='RETAINED_REACT_JSX_CONFIG_INPUT_SOURCE_VM_QUALIFIED_NOT_PRODUCT_A02')process.exitCode=1;
 }
 return{out,result};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)runJSXConfigSourceQualification().catch(error=>{console.error('JSX_CONFIG_SOURCE_ERROR',error.code==='INVALID_ARGUMENTS'?'INVALID_ARGUMENTS':'FAILED');process.exitCode=1;});
