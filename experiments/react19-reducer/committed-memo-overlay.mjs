// SPDX-License-Identifier: Apache-2.0
// Compile-only retained source handoff. Never execute React/App or launch a browser.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {buildCallbackJSXMainOverlay} from './retained-app-state-source-run.mjs';
import {transformPinnedMemoBranch} from './memo-branch-transform.mjs';
import {committedMemoFactory} from './committed-memo-bootstrap.mjs';
const hash=v=>createHash('sha256').update(v).digest('hex');
export async function buildCommittedMemoOverlay(){
 const base=await buildCallbackJSXMainOverlay(),root=process.cwd(),app=path.resolve('.runtime/todomvc/examples/react');
 const appFile=app+'/src/todo/app.jsx',mainFile=app+'/src/todo/components/main.jsx',jsxFile=app+'/node_modules/react/cjs/react-jsx-runtime.development.js',domFile=app+'/node_modules/react-dom/cjs/react-dom-client.development.js';
 for(const [file,digest]of Object.entries(base.physicalInputs))assert.equal(hash(await readFile(file)),digest,'Source changed before memo composition: '+file);
 const source=await readFile(domFile,'utf8');assert.equal(hash(source),base.physicalInputs[domFile]);
 const native=transformPinnedMemoBranch(source);assert.equal(native.skipped,false);assert.equal(native.chainDigests.nativeReturnOutput,base.nativeReturn.outputDigest);
 const replacements=new Map([[appFile,base.appOutputs['app-config.js']],[mainFile,base.mainOutputs['main-config.js']],[jsxFile,base.nativeJSXCode],[domFile,native.code]]);
 const loaded=[],seen=new Set(),before=base.loadedInputs.filter(v=>v.mode==='observed'),original=base.loadedInputs.filter(v=>v.mode==='original');
 const plugin={name:'owned-complete-memo-source-only',setup(b){b.onLoad({filter:/.*/},async args=>{
  assert(args.path.startsWith(app+'/'));assert(Object.hasOwn(base.physicalInputs,args.path),'Unexpected memo compiler input');assert(!seen.has(args.path),'Duplicate memo compiler input');seen.add(args.path);
  const bytes=await readFile(args.path),digest=hash(bytes);assert.equal(digest,base.physicalInputs[args.path]);
  const transformed=replacements.has(args.path),contents=transformed?replacements.get(args.path):bytes.toString('utf8'),prior=before.find(v=>v.file===args.path);assert(prior);assert.equal(prior.transformed,transformed);
  if(args.path!==domFile)assert.equal(hash(contents),prior.compilerInputSha256,'Unrelated compiler input changed');
  loaded.push({mode:'observed',file:args.path,physicalSha256:digest,compilerInputSha256:hash(contents),transformed});
  const ext=path.extname(args.path),loader=ext==='.css'?'css':ext==='.json'?'json':['.js','.jsx','.mjs','.cjs'].includes(ext)?'jsx':null;assert(loader,'Unsupported fixed compiler input');
  return{contents,loader,resolveDir:path.dirname(args.path)};
 });}};
 const result=await build({absWorkingDir:root,entryPoints:[app+'/src/index.js'],outfile:path.resolve('.artifacts/a02/callback-jsx-build-memory/observed.js'),bundle:true,write:false,metafile:true,format:'iife',platform:'browser',target:'es2022',jsx:'automatic',loader:{'.js':'jsx'},legalComments:'inline',tsconfigRaw:{compilerOptions:{}},define:{'process.env.NODE_ENV':'"development"'},plugins:[plugin]});
 assert.equal(loaded.length,before.length);assert.deepEqual([...seen].sort(),before.map(v=>v.file).sort());
 assert.equal(loaded.filter(v=>v.transformed).length,4);assert.equal(loaded.filter(v=>v.compilerInputSha256!==before.find(p=>p.file===v.file).compilerInputSha256).length,1);
 const bundles={'original.js':base.bundles['original.js'],'original.css':base.bundles['original.css']};
 for(const f of result.outputFiles){const name=path.basename(f.path);assert(['observed.js','observed.css'].includes(name));assert(!Object.hasOwn(bundles,name));bundles[name]={contents:f.text,sha256:hash(f.contents),bytes:f.contents.length};}
 assert(bundles['observed.js']&&bundles['observed.css']);assert.deepEqual(bundles['observed.css'],base.bundles['observed.css']);
 for(const [file,digest]of Object.entries(base.physicalInputs))assert.equal(hash(await readFile(file)),digest,'Source changed after memo composition: '+file);
 const policy={app:base.app.app,main:{mainSite:base.main.mainSite,filterSite:base.main.filterSite,mapSite:base.main.mapSite},configSite:base.app.configSite,native:native.nativeReturnPolicy,elementFiber:native.elementFiberPolicy,memoBranch:native.policy};
 return{...base,schema:'stateatom.committed-memo-overlay/1',sourceOnly:true,appExecuted:false,browserStarted:false,retainedMemoItemQualified:false,fullA02:false,bundles,metafiles:{original:base.metafiles.original,observed:result.metafile},loadedInputs:[...original,...loaded],previousObserved:{bundleSha256:base.bundles['observed.js'].sha256,loadedInputs:before},nativeMemo:{...native,code:undefined},nativeMemoCode:native.code,policy,factory:committedMemoFactory(policy)};
}
