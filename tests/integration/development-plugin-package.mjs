// SPDX-License-Identifier: Apache-2.0
// Local archive and independent Node consumer only, never native/UI acceptance.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {fileManifest,verifyArtifactHashes} from '../../scripts/atom-package-receipt.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const [receiptArg,consumerArg]=process.argv.slice(2);assert(receiptArg&&consumerArg,'Exact receipt and separate consumer required');
const receipt=resolve(receiptArg),consumer=await realpath(consumerArg),h=JSON.parse(await readFile(receipt));
assert(!consumer.startsWith(root+'/')&&consumer!==root,'Consumer must be outside source checkout');
assert.equal(h.schema,'stateatom.development-plugin-artifact/1');assert.equal(h.plugin.version,'0.1.0-candidate.20261028.10');
const out=await mkdtemp(root+'/.artifacts/v03/current-dev-plugin/package-check-'),sha=b=>createHash('sha256').update(b).digest('hex');
const result={schema:'stateatom.development-plugin-package-check/1',status:'RUNNING',startedAt:new Date().toISOString(),receipt,consumer,producer:h.sourceRevision,producerDirty:h.sourceDirty,configuration:{operator:'agent',NodeOnly:true,browser:false,model:false,helperVSIX:false,wholeV03:false,installedNativeSupport:false},checks:[]};
await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
try{
 await check('immutable exact archive/source inputs and separate physical installed payload',async()=>{
  await verifyArtifactHashes([h.plugin]);assert.equal(h.sourceDirty,false);assert(!Object.hasOwn(h,'helper'));
  for(const[p,digest]of Object.entries(h.sourceManifest))assert.equal(sha(await readFile(resolve(root,p))),digest,p);
  const list=execFileSync('tar',['-tzf',h.plugin.file],{encoding:'utf8'}).trim().split('\n');
  assert(list.every(p=>p.startsWith('package/')&&!p.split('/').includes('..')));assert.equal(new Set(list).size,list.length);
  const entries=execFileSync('tar',['-tvzf',h.plugin.file],{encoding:'utf8'}).trim().split('\n');
  assert.equal(entries.length,list.length);assert(entries.every(line=>line.startsWith('-')),'Only regular package files may be extracted');
  const archive=out+'/unpacked';await mkdir(archive);execFileSync('tar',['-xzf',h.plugin.file,'-C',archive]);
  const packagePath=await realpath(consumer+'/node_modules/@stateport/vite-plugin');
  assert(packagePath.startsWith(consumer+'/node_modules/'),'No symlink to producer/source');
  const unpacked=await fileManifest(archive+'/package'),installed=await fileManifest(packagePath);
  assert.deepEqual(installed,unpacked);assert.equal(Object.keys(installed).length,15);
  for(const[p,digest]of Object.entries(installed))assert.equal(sha(await readFile(root+'/packages/vite-plugin/'+p)),digest,p);
  const manifest=JSON.parse(await readFile(packagePath+'/dist/source-manifest.json'));assert.deepEqual(manifest,h.sourceManifest);
  const pkg=JSON.parse(await readFile(packagePath+'/package.json'));assert.equal(pkg.version,h.plugin.version);
  const js=await readFile(packagePath+'/dist/engine/plugin.mjs','utf8');assert(!js.includes(root+'/'),'No absolute producer path in entry bundle');
  result.packagePath=packagePath;result.payload=installed;result.sourceInputs=Object.keys(manifest).length;result.archiveSha256=sha(await readFile(h.plugin.file));
 });
 let entry,plugin;
 await check('all consumed external dependencies resolve inside independent consumer',async()=>{
  const req=createRequire(consumer+'/package.json'),own=createRequire(result.packagePath+'/dist/engine/plugin.mjs');
  result.dependencies={};
  const pkg=JSON.parse(await readFile(result.packagePath+'/package.json'));
  for(const name of new Set(['vite','react','react-dom',...Object.keys(pkg.dependencies)])){
   const resolved=await realpath(own.resolve(name));assert(resolved.startsWith(consumer+'/node_modules/'),name+' outside consumer');result.dependencies[name]=resolved;
  }
  const path=await realpath(req.resolve('@stateport/vite-plugin'));assert(path.startsWith(result.packagePath+'/'));
  entry=await import(pathToFileURL(path));assert.deepEqual(Object.keys(entry),['stateatomPlugin']);
  const lock=JSON.parse(await readFile(consumer+'/package-lock.json')),p=lock.packages['node_modules/@stateport/vite-plugin'];
  assert.equal(p.version,h.plugin.version);assert.equal(p.integrity,'sha512-'+createHash('sha512').update(await readFile(h.plugin.file)).digest('base64'));
  result.consumerLockSha256=sha(await readFile(consumer+'/package-lock.json'));result.resolvedEntry=path;
 });
 await check('actual packaged default React18 adapter config and transform, without source checkout imports',async()=>{
  plugin=entry.stateatomPlugin({enabled:true,root:consumer,reactHostProps:true,reactStateHandoffs:true});
  const config={root:consumer,plugins:[],esbuild:{jsx:'transform',jsxFactory:'React.createElement'}};
  plugin.config(config);plugin.configResolved(config);assert.equal(plugin.apply,'serve');assert.equal(plugin.reactHost.contract.status,'Observed');
  assert.equal(plugin.reactHost.contract.adapter,'react18-final-host-props/1');
  const transformed=plugin.transform('import React,{useState} from "react";export function App(){const [name,setName]=useState("sample");return <button disabled={!name}>Confirm</button>;}',consumer+'/App.jsx');
  assert.equal(typeof transformed.code,'string');assert.match(transformed.code,/__sa\./);assert.match(transformed.code,/reactStateResult/);
  assert.equal(plugin.transform('export const inert=1',consumer+'/App.jsx?raw'),undefined);
  assert.equal(plugin.transform('export const inert=1','/outside-consumer/App.jsx'),undefined);
  result.transformedSha256=sha(transformed.code);result.adapter=plugin.reactHost.contract;
 });
 await check('actual package serves its complete current virtual runtime modules as source data',async()=>{
  const modules=['','/react-state','/query-handoff','/query-calls','/action-observer','/action-core','/react19-acquisition'];result.virtualModules={};
  for(const suffix of modules){const url='/@stateatom/runtime'+suffix,id=plugin.resolveId(url);assert.equal(typeof id,'string');const text=plugin.load(id);assert.equal(typeof text,'string');assert(text.length>0);assert(!text.includes(root+'/'));result.virtualModules[url]={bytes:Buffer.byteLength(text),sha256:sha(text)};}
  const stateText=plugin.load(plugin.resolveId('/@stateatom/runtime/react-state'));
  assert.equal(stateText,await readFile(result.packagePath+'/dist/engine/react-state.mjs','utf8'));
  const runtime=plugin.load(plugin.resolveId('/@stateatom/runtime'));assert.match(runtime,/reactStateHandoffs:true/);
  assert.equal(plugin.resolveId('/@stateatom/foreign-runtime'),undefined);
 });
 await check('disabled package remains inert and unsupported installed profiles refuse',async()=>{
  const disabled=entry.stateatomPlugin({enabled:false,root:'/missing-app',profile:'react19-state-ancestors'});
  assert.equal(disabled.apply,'serve');assert.equal(disabled.config({}),undefined);disabled.configResolved({root:'/missing-app',plugins:[]});
  assert.equal(disabled.transform('throw Error("never execute")','/missing-app/App.jsx'),undefined);
  assert.equal(disabled.transformIndexHtml.handler('<html/>'),undefined);
  assert.throws(()=>entry.stateatomPlugin({enabled:true,profile:'unsupported'}),/Unknown.*profile/);
  assert.throws(()=>entry.stateatomPlugin({enabled:true,firstReadContracts:true}),/Controlled first-read/);
  assert.throws(()=>entry.stateatomPlugin({enabled:true,profile:'react19-state-ancestors',reactStateHandoffs:true}),/profile.*option/);
  assert.throws(()=>entry.stateatomPlugin({enabled:true,profile:'vue3',reactHostProps:true}),/profile.*option/);
  assert.throws(()=>entry.stateatomPlugin({enabled:true,reactHostProps:true}).configResolved({plugins:[{name:'vite:react-babel'}],esbuild:{jsx:'automatic'}}),/React transform conflict/);
 });
 await check('all17 exact source-slice weak dispatch controls pass against installed package module',async()=>{
  const sourceTest=root+'/tests/engine/react-state-weak-dispatch.test.mjs',original=await readFile(sourceTest,'utf8');
  const needle="'../../src/engine/react-state.mjs'";assert.equal(original.split(needle).length,2);
  const adapted=original.replace(needle,JSON.stringify(pathToFileURL(result.packagePath+'/dist/engine/react-state.mjs').href));
  const file=consumer+'/packaged-state-weak-dispatch.test.mjs';await writeFile(file,adapted);
  const log=execFileSync(process.execPath,['--test','--test-isolation=none',file],{cwd:consumer,encoding:'utf8'});await writeFile(out+'/packaged-state-controls.log',log);
  assert.match(log,/(?:#|ℹ) tests 17/);assert.match(log,/(?:#|ℹ) pass 17/);assert.match(log,/(?:#|ℹ) fail 0/);
  result.stateControls={sourceTestSha256:sha(original),adaptedTestSha256:sha(adapted),onlyChange:'One import redirects to physically installed module; all17test bodies unchanged',passed:17,syntheticDeclaredEvents:true,GC:false};
 });
 await check('all13 exact authored host-caller source controls pass against installed observer module',async()=>{
  const file=root+'/tests/engine/react-host-weak-dispatch.test.mjs',original=await readFile(file,'utf8'),needle="'../../src/engine/observer.mjs'";
  assert.equal(original.split(needle).length,2);const adapted=original.replace(needle,JSON.stringify(pathToFileURL(result.packagePath+'/dist/engine/observer.mjs').href));
  const target=consumer+'/packaged-host-weak-dispatch.test.mjs';await writeFile(target,adapted);
  const log=execFileSync(process.execPath,['--test','--test-isolation=none',target],{cwd:consumer,encoding:'utf8'});await writeFile(out+'/packaged-host-controls.log',log);
  assert.match(log,/(?:#|ℹ) tests 13/);assert.match(log,/(?:#|ℹ) pass 13/);assert.match(log,/(?:#|ℹ) fail 0/);
  result.hostControls={sourceTestSha256:sha(original),adaptedTestSha256:sha(adapted),onlyChange:'One import redirects to installed observer;13test bodies unchanged',passed:13,mockDOMAndAuthoredEvents:true,browser:false,GC:false};
 });
 assert.deepEqual(await fileManifest(result.packagePath),result.payload);await verifyArtifactHashes([h.plugin]);
 assert.equal(sha(await readFile(consumer+'/package-lock.json')),result.consumerLockSha256);
 result.status='PASS_LOCAL_CURRENT_DEV_PLUGIN_NOT_NATIVE';
}catch(e){result.status='FAIL';result.error=e.stack||String(e);process.exitCode=1;console.error(e);}
finally{result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);}
