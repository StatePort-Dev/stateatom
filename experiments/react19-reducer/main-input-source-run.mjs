// SPDX-License-Identifier: Apache-2.0
// ONE source-only Main function matrix; owned hooks are not an app lifecycle.
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {transform} from 'esbuild';
import {transformPinnedJSXConfig,jsxConfigProfile} from './jsx-config-vendor.mjs';
import {guardCallbackJSXNativeWindow} from './callback-jsx-native-qualification.mjs';
import {mainInputCases,expectedMainInputLinks,mainInputFactory,mainInputFixtureSource,prepareMainInputApplication,executeMainInputSourceCase} from '../../tests/helpers/react19-main-input-controls.mjs';
const root=process.cwd(),CASE=path.resolve('docs/testing/main-input-source-case.json'),PREFIX=path.resolve('.artifacts/a02/main-input-bridge')+path.sep,REG=path.resolve('.artifacts/a02/main-input-source/2026-10-25/registration.json');
const MAIN='.runtime/todomvc/examples/react/src/todo/components/main.jsx',UP=path.resolve('.runtime/todomvc'),APP=UP+'/examples/react',CORE=APP+'/node_modules/react/cjs/react.development.js',JSX=APP+'/node_modules/react/cjs/react-jsx-runtime.development.js';
const PIN_MAIN='09164b4bb70f4162ca2d32e3961133653fd0f9934244ba21eb85477218008a28',PIN_CORE='4325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72',PIN_JSX='dd50fd0db2fba44e0eee66243a45c81cfa3774cf41e4e6c0c080a601815c694d';
const PASS='RETAINED_MAIN_INPUT_SOURCE_VM_QUALIFIED_NOT_NATIVE_A02',UNKNOWN='Unknown/Unsupported';
const VM_ENV={NODE_ENV:'development',hooks:'owned useMemo/useCallback controls',router:'owned useLocation control',item:'owned unexecuted Item function',constants:'retained constants compiled to CJS',jsxReactDependency:'actual retained Core',scriptTimeoutMs:5000,weakUnavailableCase:'controlled weak-cleared simulation only'};
const hash=s=>createHash('sha256').update(s).digest('hex'),hex=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s),json=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const git=args=>execFileSync('git',args,{encoding:'utf8',timeout:5000}).trim(),ownFiles=['experiments/react19-reducer/main-input-observer.mjs','experiments/react19-reducer/main-input-transform.mjs','experiments/react19-reducer/main-input-source-run.mjs','tests/engine/react19-main-input-observer.test.mjs','tests/engine/react19-main-input-transform.test.mjs','tests/engine/react19-main-input-source-driver.test.mjs','tests/helpers/react19-main-input-controls.mjs'];
function ownCase(file){assert.equal(path.resolve(file),CASE,'Only fixed source case admitted');}
export function parseMainInputArgs(a){
 if(!Array.isArray(a))throw Error('INVALID_ARGUMENTS');
 if(a.length===1&&typeof a[0]==='string'&&a[0]&&!a[0].startsWith('--'))return{mode:'run',caseFile:a[0]};
 if(a.length===2&&a[0]==='--preflight'&&typeof a[1]==='string'&&a[1]&&!a[1].startsWith('--'))return{mode:'preflight',caseFile:a[1]};
 if(a.length===3&&a[0]==='--prepare'&&typeof a[1]==='string'&&a[1]&&!a[1].startsWith('--')&&typeof a[2]==='string'&&a[2])return{mode:'prepare',caseFile:a[1],out:a[2]};
 throw Error('INVALID_ARGUMENTS');
}
export async function verifyMainInputInputs(expected){
 assert(expected&&typeof expected==='object'&&Object.keys(expected).length>0);const actual={};
 for(const p of Object.keys(expected)){
  const d=Object.getOwnPropertyDescriptor(expected,p);assert(d&&Object.hasOwn(d,'value')&&hex(d.value)&&path.isAbsolute(p));assert((await fs.lstat(p)).isFile(),'Physical regular source input required');
  actual[p]=hash(await fs.readFile(p));assert.equal(actual[p],d.value,'Frozen physical input drift');
 }
 return actual;
}
async function hashes(files){const out={};for(const p of [...new Set(files)].sort())out[path.resolve(p)]=hash(await fs.readFile(p));return out;}
function loadedModules(){const files=Object.keys(createRequire(import.meta.url).cache).filter(p=>p.includes('/node_modules/'));for(const p of files)assert(p.startsWith(root+'/node_modules/'),'External compiler dependency refused');return files;}
async function protectedInputs(){
 const r=await json(REG);assert.equal(r.schema,'stateatom.main-input-source-registration/1');assert.equal(Object.keys(r.sourceBefore).length,86);assert.equal(Object.keys(r.productInputs).length,327);assert.deepEqual(r.declaredResearchDeltas,[]);assert.deepEqual(r.newFiles,ownFiles);
 const inputs={};for(const k of ['sourceBefore','productInputs','L02Raw','protectedInputs','A0210Raw','A0211Raw','A0212Raw','A0213SourceDiagnosis','A0214Raw','A0215Raw','Main','exhaustedNativeCases','A0216Raw','A0217Raw','A0218Raw','A0219Raw','A0220Evidence'])Object.assign(inputs,r[k]);for(const v of r.V03Raw)inputs[path.resolve(v.file)]=v.sha256;
 await verifyMainInputInputs(inputs);return inputs;
}
export function guardMainInputSourceCase(s){
 assert.equal(s.schema,'stateatom.main-input-source-case/1');assert.equal(s.maximumSourceRuns,1);assert.equal(s.sourceOnly,true);assert.equal(s.ownedHookControls,true);assert.equal(s.ownedRouterControls,true);assert.equal(s.unexecutedItemType,true);
 for(const k of ['ReactDOMExecuted','realHookLifecycleProven','browserStarted','nativeRuntimeProven','productSupport','fullA02'])assert.equal(s[k],false);
 assert.equal(s.preparedDirty,false);assert(/^[a-f0-9]{40}$/.test(s.preparedAtRevision));assert(path.isAbsolute(s.out)&&s.out.startsWith(PREFIX)&&path.dirname(s.out)===PREFIX.slice(0,-1));assert.deepEqual(s.vmEnvironment,VM_ENV);assert.equal(s.vmContextsExpected,54);assert.deepEqual(s.cases,mainInputCases);assert.deepEqual(s.modes,['original','off','on']);assert.deepEqual(s.expectedLinks,expectedMainInputLinks);
 assert.equal(s.main.file,path.resolve(MAIN));assert.equal(s.main.sha256,PIN_MAIN);assert.equal(s.core.file,CORE);assert.equal(s.core.sha256,PIN_CORE);assert.equal(s.jsx.file,JSX);assert.equal(s.jsx.sha256,PIN_JSX);
 assert.equal(s.nativeJSX.nativeVersionAdmitted,true);assert.equal(s.nativeJSX.sourceDigest,PIN_JSX);assert.equal(s.applicationReceipt.sourceDigest,PIN_MAIN);assert.equal(s.applicationReceipt.ownedHookControlsRequired,true);assert.equal(s.applicationReceipt.ReactDOMExecuted,false);
 assert.deepEqual(s.policy,{mainSite:s.applicationReceipt.mainSite,filterSite:s.applicationReceipt.filterSite,mapSite:s.applicationReceipt.mapSite});assert.equal(s.applicationReceipt.configSites.length,2);
 assert.equal(s.registrationFile,REG);assert(hex(s.registrationSha256));assert.equal(s.inputHashes[REG],s.registrationSha256);assert.equal(s.sourceCounts.priorResearch,86);assert.equal(s.sourceCounts.productInputs,327);assert.equal(s.sourceCounts.originalCorpus,28);
 assert(path.isAbsolute(s.node.executable)&&hex(s.node.sha256)&&/^v24[.]/.test(s.node.version));assert.equal(s.inputHashes[s.node.executable],s.node.sha256);
 const names=['original-main.cjs','observed-main.cjs','main-lowered.js','main-config.js','transformed-jsx.cjs','constants.cjs','observer-factory.js','owned-fixture.js'];
 assert.deepEqual(Object.keys(s.outputs).sort(),names.sort());
 for(const name of names){const v=s.outputs[name];assert.equal(v.file,s.out+'/'+name);assert(hex(v.sha256));assert.equal(s.inputHashes[v.file],v.sha256);}
 assert.equal(s.outputs['original-main.cjs'].sha256,s.applicationReceipt.originalCompiledDigest);assert.equal(s.outputs['observed-main.cjs'].sha256,s.applicationReceipt.observedCompiledDigest);assert.equal(s.outputs['transformed-jsx.cjs'].sha256,s.nativeJSX.outputDigest);
 for(const v of [s.main,s.core,s.jsx])assert.equal(s.inputHashes[v.file],v.sha256);
 assert(s.inputHashes[path.resolve('docs/superpowers/specs/2026-10-25-a02-main-input-bridge-design.md')]);assert(s.inputHashes[path.resolve('docs/superpowers/plans/2026-10-25-a02-main-input-bridge.md')]);
 return s;
}
async function nodeIdentity(){return{executable:await fs.realpath(process.execPath),version:process.version,sha256:hash(await fs.readFile('/proc/self/exe'))};}
export async function prepareMainInputSourceCase(file,out){
 ownCase(file);out=path.resolve(out);assert(out.startsWith(PREFIX)&&path.dirname(out)===PREFIX.slice(0,-1),'Fixed source output child required');assert.equal(git(['status','--porcelain','--untracked-files=normal']),'','Commit source before preparation');
 await fs.lstat(file).then(()=>assert.fail('Case already exists'),e=>assert.equal(e.code,'ENOENT'));
 const inputs=await protectedInputs(),manifest=await json(UP+'/SOURCE_SHA256.json');assert.equal(Object.keys(manifest).length,28);assert.equal((await fs.readFile(UP+'/REVISION','utf8')).trim(),'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');
 for(const[p,h]of Object.entries(manifest)){const f=path.resolve(UP,p);assert(f.startsWith(UP+'/'));assert.equal(hash(await fs.readFile(f)),h);inputs[f]=h;}
 const source=await fs.readFile(MAIN,'utf8'),core=await fs.readFile(CORE,'utf8'),jsx=await fs.readFile(JSX,'utf8');assert.equal(hash(source),PIN_MAIN);assert.equal(hash(core),PIN_CORE);assert.equal(hash(jsx),PIN_JSX);
 assert.equal((await json(APP+'/node_modules/react/package.json')).version,'19.2.5');
 const application=await prepareMainInputApplication(source,MAIN),nativeJSX=transformPinnedJSXConfig(jsx,jsxConfigProfile.file),constants=await transform(await fs.readFile(APP+'/src/todo/constants.js','utf8'),{loader:'js',format:'cjs',target:'es2022',tsconfigRaw:{compilerOptions:{}}});
 await fs.mkdir(PREFIX.slice(0,-1),{recursive:true});assert.equal(await fs.realpath(PREFIX.slice(0,-1)),PREFIX.slice(0,-1));await fs.mkdir(out,{mode:0o700});assert.equal(await fs.realpath(out),out);assert.equal(await fs.realpath(path.dirname(CASE)),path.dirname(CASE));
 const outputs={},write=async(name,value)=>{const f=out+'/'+name;await fs.writeFile(f,value,{flag:'wx'});const d=hash(value);inputs[f]=d;outputs[name]={file:f,sha256:d};};
 for(const[name,value]of Object.entries({'original-main.cjs':application.originalCode,'observed-main.cjs':application.observedCode,'main-lowered.js':application.loweredCode,'main-config.js':application.configCode,'transformed-jsx.cjs':nativeJSX.code,'constants.cjs':constants.code,'observer-factory.js':mainInputFactory(),'owned-fixture.js':mainInputFixtureSource()}))await write(name,value);
 const node=await nodeIdentity();Object.assign(inputs,await hashes([...ownFiles,REG,CORE,JSX,APP+'/node_modules/react/package.json',node.executable,'package.json','package-lock.json','node_modules/@babel/parser/package.json','node_modules/@babel/traverse/package.json','node_modules/@babel/generator/package.json','node_modules/@babel/types/package.json','node_modules/esbuild/package.json','node_modules/@esbuild/linux-x64/bin/esbuild','docs/superpowers/specs/2026-10-25-a02-main-input-bridge-design.md','docs/superpowers/plans/2026-10-25-a02-main-input-bridge.md',UP+'/SOURCE_SHA256.json',UP+'/REVISION',...loadedModules()]));
 const s={schema:'stateatom.main-input-source-case/1',maximumSourceRuns:1,sourceOnly:true,ownedHookControls:true,ownedRouterControls:true,unexecutedItemType:true,ReactDOMExecuted:false,realHookLifecycleProven:false,browserStarted:false,nativeRuntimeProven:false,productSupport:false,fullA02:false,preparedAt:new Date().toISOString(),preparedAtRevision:git(['rev-parse','HEAD']),preparedDirty:false,out,node,vmEnvironment:VM_ENV,vmContextsExpected:54,cases:mainInputCases,modes:['original','off','on'],expectedLinks:expectedMainInputLinks,main:{file:path.resolve(MAIN),sha256:PIN_MAIN},core:{file:CORE,sha256:PIN_CORE},jsx:{file:JSX,sha256:PIN_JSX},nativeJSX:{...nativeJSX,code:undefined},policy:application.policy,applicationReceipt:application.receipt,registrationFile:REG,registrationSha256:hash(await fs.readFile(REG)),sourceCounts:{priorResearch:86,productInputs:327,originalCorpus:28},outputs,inputHashes:inputs};
 guardMainInputSourceCase(s);await verifyMainInputInputs(inputs);await fs.writeFile(out+'/prepared.json',JSON.stringify({sourceOnly:true,VMContextsStarted:0,case:s},null,2)+'\n',{flag:'wx'});await fs.writeFile(file,JSON.stringify(s,null,2)+'\n',{flag:'wx'});console.log('PREPARED_MAIN_INPUT_SOURCE',Object.keys(inputs).length,'inputs; no VM/browser');return s;
}
export async function preflightMainInputSourceCase(file){
 ownCase(file);const bytes=await fs.readFile(file),s=guardMainInputSourceCase(JSON.parse(bytes));assert.equal(await fs.realpath(s.out),s.out);assert.deepEqual(await nodeIdentity(),s.node);assert.equal(hash(await fs.readFile(REG)),s.registrationSha256);
 const old=await protectedInputs();for(const[p,h]of Object.entries(old))assert.equal(s.inputHashes[p],h);
 for(const p of Object.keys(s.inputHashes))assert(p.startsWith(root+'/')||p===s.node.executable);
 assert.equal(hash(mainInputFactory()),s.outputs['observer-factory.js'].sha256);assert.equal(hash(mainInputFixtureSource()),s.outputs['owned-fixture.js'].sha256);assert.deepEqual((await json(s.out+'/prepared.json')).case,s);
 const inputs={...await verifyMainInputInputs(s.inputHashes),[path.resolve(file)]:hash(bytes)};return{s,inputs,caseSha256:hash(bytes)};
}
function scopedID(id,page,role){const p=page+':main-input:1:'+role+':';assert(typeof id==='string'&&id.startsWith(p)&&/^[1-9][0-9]*$/.test(id.slice(p.length)));}
function verifyRow(row,s){
 const {id,original,off,on}=row,n=s.expectedLinks[id],page='main-input-source:'+id;
 assert.equal(original.mode,'original');assert.equal(off.mode,'off');assert.equal(on.mode,'on');
 for(const v of [original,off,on]){
  assert.equal(v.caseName,id);assert.equal(v.sourceOnly,true);assert.equal(v.fixtureInputsOnly,true);assert.equal(v.originalMainFunctionSourceUsed,true);assert.equal(v.ownedHookAndRouterControls,true);
  for(const k of ['realHookLifecycleProven','realRouterExecuted','ItemComponentExecuted','ReactDOMExecuted','originalWholeAppExecuted','browserStarted','nativeRuntimeProven','installedRuntimeProven','fullA02','realGCProven'])assert.equal(v[k],false);
  assert.equal(v.modelCalls,0);assert.equal(v.nativeWriterCalls,0);assert.equal(v.summary.dispatchCalls,0);assert.equal(v.summary.helperNameInStack,false);
 }
 for(const v of [off,on]){assert.deepEqual(v.summary,original.summary);assert.deepEqual(v.trace,original.trace);assert.deepEqual(v.identityOracle,original.identityOracle);}
 assert.equal(original.seal,null);assert.deepEqual(original.selected,[]);assert.equal(on.summary.invocations,id==='cross-invocation-memo'?2:1);
 assert.deepEqual(on.summary.sameThrown,['throw-todos','throw-completed','throw-id'].includes(id)?[true]:id==='cross-invocation-memo'?[false,false]:[false]);
 assert.equal(on.summary.mainBodiesEntered,id==='throw-todos'?0:on.summary.invocations);
 for(const v of [off,on]){
  const a=v.seal.snapshot,r=v.seal.retention;assert.equal(a.schema,'stateatom.main-parameter-filter-map/1');assert.equal(a.page,page);assert.equal(a.window.label,id);assert.equal(a.window.id,page+':main-input:window:1');assert.equal(r.window,1);assert.equal(r.active,0);assert.equal(r.collecting,false);
  for(const k of ['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin','componentInstance'])assert.equal(a[k],UNKNOWN);assert.equal(a.nativeOrigin,'NotAttested');assert.equal(a.fullPath,false);
  assert.equal(v.lookalike.status,UNKNOWN);assert.equal(v.lookalike.links.length,0);
  if(v===off||!n){assert.equal(a.status,UNKNOWN);assert.equal(a.links.length,0);for(const x of v.selected){assert.equal(x.status,UNKNOWN);assert.equal(x.links.length,0);}continue;}
  assert.equal(a.status,'Observed');assert.equal(v.seal.sealed,true);assert.equal(a.sealed,true);assert.equal(r.stopped,false);assert.equal(r.invalid,false);assert.equal(r.overflow,false);assert.equal(r.mainFrames,1);assert.equal(r.calls,2);assert.equal(r.callbacks,n);assert.equal(a.mainFrames.length,1);assert.equal(a.links.length,n);assert.equal(v.selected.length,n);
  guardCallbackJSXNativeWindow({sealed:true,snapshot:a.callbackInterval,retention:r.callbackInterval},{id,rowCount:n},{page,mapSite:s.policy.mapSite,jsxSites:s.applicationReceipt.configSites});
  const m=a.mainFrames[0];assert.equal(m.closed,true);assert.equal(m.returned,true);assert.deepEqual(m.mainSite,s.policy.mainSite);
  for(const l of a.links){
   assert.equal(l.mainFrameId,m.mainFrameId);assert.equal(l.argumentId,m.argumentId);assert.equal(l.parameterId,m.parameterId);assert.equal(l.parameter,'todos');assert.equal(l.parameterId,l.filterReceiverId);assert.equal(l.filterResultId,l.mapReceiverId);
   assert.deepEqual(l.mainSite,s.policy.mainSite);assert.deepEqual(l.filterSite,s.policy.filterSite);assert.deepEqual(l.mapSite,s.policy.mapSite);
   for(const[key,role]of [['mainFrameId','main'],['argumentId','object'],['parameterId','object'],['filterCallId','call'],['filterReceiverId','object'],['filterResultId','object'],['mapCallId','call'],['mapReceiverId','object']])scopedID(l[key],page,role);
   assert(a.callbackInterval.links.some(b=>JSON.stringify(b)===JSON.stringify(l.callbackOccurrence)));
  }
  for(const selected of v.selected){assert.equal(selected.status,'Observed');assert.equal(selected.links.length,1);}
  for(const oracle of v.identityOracle)assert(oracle.itemIsFirst!==oracle.itemIsSecond);
 }
}
export async function runMainInputSourceCase(file){
 const{s,inputs,caseSha256}=await preflightMainInputSourceCase(file);assert.equal(git(['status','--porcelain','--untracked-files=normal']),'','Commit case before qualification');
 await fs.writeFile(s.out+'/registered-before-vm.json',JSON.stringify({sourceRevision:git(['rev-parse','HEAD']),sourceDirty:false,caseSha256,case:s,inputsBefore:inputs,VMContextsStarted:0},null,2)+'\n',{flag:'wx'});
 await fs.writeFile(s.out+'/source-vm-started.json',JSON.stringify({at:new Date().toISOString(),driverPid:process.pid,maximumSourceRuns:1},null,2)+'\n',{flag:'wx'});
 const r={schema:'stateatom.main-input-source-qualification/1',status:'MAIN_INPUT_SOURCE_QUALIFICATION_INCOMPLETE',sourceRevision:git(['rev-parse','HEAD']),preparedAtRevision:s.preparedAtRevision,sourceDirty:false,sourceOnly:true,ownedHookAndRouterControls:true,realHookLifecycleProven:false,ReactDOMExecuted:false,originalWholeAppExecuted:false,browserStarted:false,nativeRuntimeProven:false,productSupport:false,fullA02:false,modelCalls:0,nativeWriterCalls:0,VMContextsStarted:0,VMContextsCompleted:0,rows:[],errors:[],inputsBefore:inputs,inputsAfter:null,inputsUnchanged:false};
 const save=(name,value)=>fs.writeFile(s.out+'/'+name+'.json',JSON.stringify(value,null,2)+'\n',name==='running'?{}:{flag:'wx'});
 try{
  const coreSource=await fs.readFile(s.core.file,'utf8'),originalJSX=await fs.readFile(s.jsx.file,'utf8'),observedJSX=await fs.readFile(s.outputs['transformed-jsx.cjs'].file,'utf8'),constantsCode=await fs.readFile(s.outputs['constants.cjs'].file,'utf8'),factory=await fs.readFile(s.outputs['observer-factory.js'].file,'utf8'),originalCode=await fs.readFile(s.outputs['original-main.cjs'].file,'utf8'),observedCode=await fs.readFile(s.outputs['observed-main.cjs'].file,'utf8');
  for(const id of s.cases){
   const row={id,currentMode:null,currentStage:null};r.rows.push(row);
   for(const mode of s.modes){row.currentMode=mode;row.currentStage='context';await save('running',r);
    row[mode]=executeMainInputSourceCase({coreSource,jsxSource:mode==='original'?originalJSX:observedJSX,constantsCode,appCode:mode==='original'?originalCode:observedCode,applicationReceipt:s.applicationReceipt,factory,policy:s.policy,caseName:id,mode,onContextStarted:()=>{r.VMContextsStarted++;},onStage:stage=>{row.currentStage=stage;}});
    r.VMContextsCompleted++;await save(id+'-'+mode,row[mode]);
   }
   verifyRow(row,s);row.currentMode=null;row.currentStage=null;row.status='PASS_SOURCE_CONTROL';await save('running',r);
  }
  assert.equal(r.VMContextsStarted,54);assert.equal(r.VMContextsCompleted,54);r.status=PASS;
 }catch(e){r.errors.push({name:e.name,message:e.message,stack:e.stack});}
 finally{
  try{r.inputsAfter=await verifyMainInputInputs(inputs);for(const p of loadedModules())assert(Object.hasOwn(inputs,p),'Unregistered loaded compiler input');r.inputsUnchanged=true;}catch(e){r.errors.push({name:e.name,message:e.message});r.status='MAIN_INPUT_SOURCE_QUALIFICATION_INCOMPLETE';}
  r.finishedAt=new Date().toISOString();await save('results',r);
 }
 console.log('MAIN_INPUT_SOURCE',r.status,s.out+'/results.json');process.exitCode=r.status===PASS?0:1;return r;
}
async function main(){const a=parseMainInputArgs(process.argv.slice(2));if(a.mode==='prepare')await prepareMainInputSourceCase(a.caseFile,a.out);else if(a.mode==='preflight'){const r=await preflightMainInputSourceCase(a.caseFile);console.log('PREFLIGHT_MAIN_INPUT_SOURCE',Object.keys(r.inputs).length,'inputs; no VM/browser');}else await runMainInputSourceCase(a.caseFile);}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)main().catch(e=>{console.error('MAIN_INPUT_SOURCE_DRIVER_ERROR',e.message==='INVALID_ARGUMENTS'?'INVALID_ARGUMENTS':'SOURCE_CASE_REFUSED');process.exitCode=1;});
