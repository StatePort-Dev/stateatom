// SPDX-License-Identifier: Apache-2.0
// Compile-only full retained source pipeline; no App/browser execution.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';import {build} from 'esbuild';
import {buildCommittedMemoOverlay} from './committed-memo-overlay.mjs';
import {transformPinnedComponentCall} from './component-call-transform.mjs';
import {transformRetainedItemBody} from './component-body-transform.mjs';
import {componentBodyFactory} from './component-body-bootstrap.mjs';
const hash=v=>createHash('sha256').update(v).digest('hex');
export async function buildComponentBodyOverlay(){
 const base=await buildCommittedMemoOverlay(),app=path.resolve('.runtime/todomvc/examples/react'),domFile=app+'/node_modules/react-dom/cjs/react-dom-client.development.js',itemFile=app+'/src/todo/components/item.jsx';
 for(const [file,digest]of Object.entries(base.physicalInputs))assert.equal(hash(await readFile(file)),digest,'Source changed before body composition');
 const native=transformPinnedComponentCall(await readFile(domFile,'utf8')),body=transformRetainedItemBody(await readFile(itemFile,'utf8'));assert.equal(native.memoOutputDigest,base.nativeMemo.outputDigest);
 const replacements=new Map([[app+'/src/todo/app.jsx',base.appOutputs['app-config.js']],[app+'/src/todo/components/main.jsx',base.mainOutputs['main-config.js']],[app+'/node_modules/react/cjs/react-jsx-runtime.development.js',base.nativeJSXCode],[domFile,native.code],[itemFile,body.code]]),seen=new Set(),loaded=[],before=base.loadedInputs.filter(v=>v.mode==='observed'),original=base.loadedInputs.filter(v=>v.mode==='original');
 const plugin={name:'owned-complete-component-body',setup(b){b.onLoad({filter:/.*/},async args=>{
  assert(args.path.startsWith(app+'/')&&Object.hasOwn(base.physicalInputs,args.path));assert(!seen.has(args.path));seen.add(args.path);
  const bytes=await readFile(args.path),digest=hash(bytes);assert.equal(digest,base.physicalInputs[args.path]);const transformed=replacements.has(args.path),contents=transformed?replacements.get(args.path):bytes.toString('utf8'),prior=before.find(v=>v.file===args.path);assert(prior);
  if(args.path!==domFile&&args.path!==itemFile)assert.equal(hash(contents),prior.compilerInputSha256);
  loaded.push({mode:'observed',file:args.path,physicalSha256:digest,compilerInputSha256:hash(contents),transformed});
  const ext=path.extname(args.path),loader=ext==='.css'?'css':ext==='.json'?'json':['.js','.jsx','.mjs','.cjs'].includes(ext)?'jsx':null;assert(loader);return{contents,loader,resolveDir:path.dirname(args.path)};
 });}};
 const result=await build({absWorkingDir:process.cwd(),entryPoints:[app+'/src/index.js'],outfile:path.resolve('.artifacts/a02/callback-jsx-build-memory/observed.js'),bundle:true,write:false,metafile:true,format:'iife',platform:'browser',target:'es2022',jsx:'automatic',loader:{'.js':'jsx'},legalComments:'inline',tsconfigRaw:{compilerOptions:{}},define:{'process.env.NODE_ENV':'"development"'},plugins:[plugin]});
 assert.deepEqual([...seen].sort(),before.map(v=>v.file).sort());assert.equal(loaded.filter(v=>v.transformed).length,5);assert.equal(loaded.filter(v=>v.compilerInputSha256!==before.find(p=>p.file===v.file).compilerInputSha256).length,2);
 const bundles={'original.js':base.bundles['original.js'],'original.css':base.bundles['original.css']};for(const f of result.outputFiles){const name=path.basename(f.path);assert(['observed.js','observed.css'].includes(name));assert(!Object.hasOwn(bundles,name));bundles[name]={contents:f.text,sha256:hash(f.contents),bytes:f.contents.length};}
 assert.deepEqual(bundles['observed.css'],base.bundles['observed.css']);for(const [file,digest]of Object.entries(base.physicalInputs))assert.equal(hash(await readFile(file)),digest,'Source changed after body composition');
 const policy={...base.policy,componentCall:native.policy,componentBody:body.policy};
 return{...base,schema:'stateatom.component-body-overlay/1',sourceOnly:true,appExecuted:false,browserStarted:false,componentBodyQualified:false,bundles,metafiles:{original:base.metafiles.original,observed:result.metafile},loadedInputs:[...original,...loaded],previousMemoObserved:{bundleSha256:base.bundles['observed.js'].sha256,loadedInputs:before},nativeCall:{...native,code:undefined},nativeCallCode:native.code,componentBody:{...body,code:undefined},componentBodyCode:body.code,policy,factory:componentBodyFactory(policy)};
}
