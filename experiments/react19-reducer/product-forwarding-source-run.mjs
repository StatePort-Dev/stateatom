// SPDX-License-Identifier: Apache-2.0
// Current product source + trusted retained React CJS, no browser/native launcher.
import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
import {react19Profile,transformPinnedReact19} from '../../src/engine/react19-vendor.mjs';
import {nativeForwardingCases,executeNativeForwardingSource} from '../../tests/helpers/react19-native-forwarding-controls.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const root=process.cwd(),base=path.resolve('.artifacts/a02/product-native-forwarding/2026-10-25'),registrationFile=base+'/registration.json';
const deltas=['src/engine/react19-vendor.mjs','src/engine/observer.mjs','src/engine/react19-acquisition.mjs'].map(p=>path.resolve(p));
const ownFiles=['experiments/react19-reducer/product-forwarding-source-run.mjs','tests/engine/react19-native-forwarding.test.mjs','tests/helpers/react19-native-forwarding-controls.mjs','docs/superpowers/specs/2026-10-25-a02-product-native-forwarding-design.md','docs/superpowers/plans/2026-10-25-a02-product-native-forwarding.md','package.json','package-lock.json','node_modules/esbuild/package.json','node_modules/@babel/parser/package.json','node_modules/@babel/traverse/package.json','node_modules/@babel/generator/package.json','node_modules/@babel/types/package.json'];
async function registerCurrent(reg,bundleInputs){
 assert.equal(reg.schema,'stateatom.product-forwarding-source-registration/1');assert.equal(reg.base,'bcb734d4815b621c245612db47b3377139542b06');assert.deepEqual(reg.declaredResearchDeltas,deltas);
 assert.equal(Object.keys(reg.sourceBefore).length,65);assert.equal(Object.keys(reg.productInputs).length,327);assert.equal(reg.V03Raw.length,15);assert.equal(Object.keys(reg.L02Raw).length,12);assert.equal(Object.keys(reg.protectedInputs).length,4);assert.equal(Object.keys(reg.A0210Raw).length,2);assert.equal(Object.keys(reg.A0211Raw).length,1);
 const inputs={},historicalSource=[];
 for(const[file,digest]of Object.entries(reg.sourceBefore)){
  if(deltas.includes(file)){
   assert.equal(hash(execFileSync('git',['show',reg.base+':'+path.relative(root,file)],{timeout:5000,maxBuffer:4*1024*1024})),digest,'Original historical source lost');
   const current=hash(await readFile(file));assert.notEqual(current,digest,'Declared fix missing');inputs[file]=current;historicalSource.push({file,revision:reg.base,sha256:digest,kind:'historical-only-not-new-run-fallback'});
  }else{assert.equal(hash(await readFile(file)),digest,'Protected source drift');inputs[file]=digest;}
 }
 const pinned={...reg.productInputs,...reg.L02Raw,...reg.protectedInputs,...reg.A0210Raw,...reg.A0211Raw,[reg.vendor.file]:reg.vendor.sha256,[reg.vendor.package]:reg.vendor.packageSha256};
 for(const row of reg.V03Raw)pinned[path.resolve(row.file)]=row.sha256;
 for(const[file,digest]of Object.entries(pinned)){assert(!deltas.includes(file),'Issued payload unexpectedly contains changed engine source');assert.equal(hash(await readFile(file)),digest,'Protected artifact/payload/vendor drift');inputs[file]=digest;}
 assert.equal(reg.vendor.file,path.resolve('.runtime/todomvc/examples/react/node_modules/react/cjs/react.development.js'));assert.equal(reg.vendor.sha256,react19Profile.files['react/cjs/react.development.js']);assert.equal(reg.vendor.version,'19.2.5');
 assert.equal(hash(await readFile(base+'/reproduction.json')),reg.reproductionSha256);
 for(const file of [...ownFiles,registrationFile,base+'/reproduce.mjs',base+'/reproduction.json',...bundleInputs]){
  const absolute=path.resolve(file);assert(absolute.startsWith(root+'/'));inputs[absolute]=hash(await readFile(absolute));
 }
 return{inputs,historicalSource};
}
function verifyCase(row){
 const{id,original,off,on}=row;assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.trace,original.trace);assert.deepEqual(on.trace,original.trace);
 for(const result of [original,off,on]){
  assert.equal(result.sourceOnly,true);assert.equal(result.fixtureInputsOnly,true);assert.equal(result.browserStarted,false);assert.equal(result.nativeWriterCalls,0);assert.equal(result.modelCalls,0);
  assert.equal(result.summary.iteratorCalls,0);assert.equal(result.summary.mutation,0);assert.equal(result.summary.proxyItemTraps,0);assert.equal(result.summary.helperFrame,false);assert.equal(result.metadata.accessorReads,0);
 }
 const expected=['throw-getter','missing-runtime','runtime-accessor','tap-accessor'].includes(id)?0:1;
 assert.equal(original.metadata.calls,0);assert.equal(off.metadata.calls,expected);assert.equal(on.metadata.calls,expected);
 if(expected)for(const r of [off,on]){assert.equal(r.metadata.arity,3);assert.equal(r.metadata.kind,'element');assert.equal(r.metadata.receiverSame,true);assert.equal(r.metadata.elementSame,true);assert.equal(r.metadata.propsSame,true);}
 assert.equal(original.nativeAncestors,null);assert.equal(off.nativeAncestors,null);assert.equal(on.nativeAncestors.status,'Unknown/Unsupported');assert.equal(on.nativeAncestors.fieldOwnership,'Unknown/Unsupported');assert.equal(on.nativeAncestors.stateToProp,'Unknown/Unsupported');assert.equal(on.nativeAncestors.selectedPropertyOrigin,'Unknown/Unsupported');assert.equal(on.nativeAncestors.fullPath,false);
 if(id==='throw-getter')assert.equal(on.summary.sameThrown,true);else assert.equal(on.summary.todoMatches,true);
 if(id==='getter')assert.equal(on.summary.getterReads,1);
 assert.doesNotMatch(JSON.stringify(on.nativeAncestors),/synthetic-private/);
}
export async function runProductForwardingSourceQualification(args=process.argv.slice(2)){
 if(!Array.isArray(args)||args.length!==0)throw Object.assign(Error('INVALID_ARGUMENTS'),{code:'INVALID_ARGUMENTS'});
 const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',timeout:5000}).trim(),sourceDirty=execFileSync('git',['status','--porcelain','--untracked-files=normal'],{encoding:'utf8',timeout:5000}).trim()!=='';
 const reg=JSON.parse(await readFile(registrationFile));
 const loadedInputHashes={};
 const capture={name:'owned-product-source-bytes',setup(b){b.onLoad({filter:/\.mjs$/},async args=>{assert(args.path.startsWith(root+'/'));const bytes=await readFile(args.path);loadedInputHashes[args.path]=hash(bytes);return{contents:bytes.toString('utf8'),loader:'js',resolveDir:path.dirname(args.path)};});}};
 const built=await build({entryPoints:[path.resolve('src/engine/observer.mjs')],bundle:true,write:false,format:'iife',globalName:'__StateAtomForwardingProduct',platform:'browser',target:'es2022',legalComments:'inline',metafile:true,plugins:[capture]});
 assert.equal(built.outputFiles.length,1);const observerBundle=built.outputFiles[0].text,bundleInputs=Object.keys(built.metafile.inputs).map(p=>path.resolve(p));
 assert.equal(Object.keys(loadedInputHashes).length,bundleInputs.length);for(const file of bundleInputs)assert.equal(hash(await readFile(file)),loadedInputHashes[file],'Compiled current source changed before registration');
 const{inputs,historicalSource}=await registerCurrent(reg,bundleInputs),source=await readFile(reg.vendor.file,'utf8'),transformed=transformPinnedReact19(source,'react/cjs/react.development.js');
 assert.equal(transformed.nativeVersionAdmitted,true);assert.equal(transformed.sourceDigest,reg.vendor.sha256);assert.deepEqual(transformed.counts,{element:1});
 const out=base+'/qualification-'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{mode:0o700});
 const node={version:process.version,executable:await realpath(process.execPath),sha256:hash(await readFile('/proc/self/exe'))},bundleReceipt={sha256:hash(observerBundle),inputs:bundleInputs,loadedInputHashes,metafile:built.metafile,configuration:'actual product observer browser IIFE, sourceVM only'},recipeReceipt={...transformed,code:undefined};
 await writeFile(out+'/registered-before-vm.json',JSON.stringify({schema:'stateatom.product-forwarding-vm-registration/1',at:new Date().toISOString(),sourceRevision,sourceDirty,inputs,historicalSource,bundleReceipt,recipeReceipt,cases:nativeForwardingCases,modes:['original','off','on'],sourceOnly:true,fixtureInputsOnly:true,VMContextsBeforeExecution:0,browserStarted:false,nativeWriterCalls:0,modelCalls:0,node},null,2)+'\n',{flag:'wx'});
 await writeFile(out+'/product-observer.js',observerBundle,{flag:'wx'});await writeFile(out+'/transformed-react.cjs',transformed.code,{flag:'wx'});
 const result={schema:'stateatom.product-forwarding-source-qualification/1',status:'SOURCE_QUALIFICATION_INCOMPLETE',sourceRevision,sourceDirty,node,inputsBefore:inputs,inputsAfter:null,inputsUnchanged:false,historicalSource,bundleReceipt,recipeReceipt,rows:[],VMContextsExecuted:0,sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0,modelCalls:0,ReactDOMExecuted:false,installedRuntimeProven:false,fullA02:false,errors:[]};
 try{
  for(const id of nativeForwardingCases){const row={id,currentMode:null};result.rows.push(row);for(const mode of ['original','off','on']){row.currentMode=mode;row[mode]=executeNativeForwardingSource({source:mode==='original'?source:transformed.code,observerBundle,caseName:id,mode});result.VMContextsExecuted++;}row.currentMode=null;verifyCase(row);row.status='PASS_SOURCE_CONTROL';await writeFile(out+'/running.json',JSON.stringify(result,null,2)+'\n');}
  result.status='RETAINED_REACT_PRODUCT_FORWARDING_SOURCE_VM_QUALIFIED_NOT_INSTALLED_A02';
 }catch(error){result.errors.push({name:error.name,message:error.message,stack:error.stack});}
 finally{
  const after={};try{for(const[file,digest]of Object.entries(inputs)){after[file]=hash(await readFile(file));assert.equal(after[file],digest,'Actual current source changed during sourceVM qualification');}result.inputsAfter=after;result.inputsUnchanged=true;}catch(error){result.errors.push({name:error.name,message:error.message});result.status='SOURCE_QUALIFICATION_INCOMPLETE';}
  result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(result.status,out);if(result.status!=='RETAINED_REACT_PRODUCT_FORWARDING_SOURCE_VM_QUALIFIED_NOT_INSTALLED_A02')process.exitCode=1;
 }
 return{out,result};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)runProductForwardingSourceQualification().catch(error=>{console.error('PRODUCT_FORWARDING_SOURCE_ERROR',error.code==='INVALID_ARGUMENTS'?'INVALID_ARGUMENTS':'FAILED');process.exitCode=1;});
