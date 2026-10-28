// SPDX-License-Identifier: Apache-2.0
// Helper-owned actual source/stage/output acquisition. No effect proof or browser
// witness is issued by compiling, and serialized manifests are not capabilities.
import path from 'node:path';import {createHash} from 'node:crypto';
import {acquireOwnedCompilationTools} from '../first-read/build-profile.mjs';
import {prepareListFieldProgram,bindListFieldModule} from './list-field-program.mjs';
import {transformPinnedFieldVendor} from './react19-field-vendor.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex'),issued=new WeakMap(),LIMIT=2*1024*1024;
const runtimeId='stateatom:owned-list-runtime';
const LIST_BUILDER_PIN = 'c88f3d6be2a4af31429ca47ec5d054c5cd0529cff50652357715e301430db7d6';
const LIST_RECIPE_PINS={
 "src/engine/react19-devtools-checks.mjs": "7bbe515a78d1313e75d8538a5909c6ac0684851fe447dad90dfdffe30ef39894",
 "src/engine/list-field-program.mjs": "89025f8d8f634e803979911744455441e45156c5540220c31d43c9c1853d738f",
 "src/engine/list-field-source-admission.mjs": "ff4e385e0c5564e0b23ae4e74c7a8554fe17f8eafe2a90eef9bfaeb905b28f23",
 "src/engine/list-data-transform.mjs": "130341edf69da47fabafa50fd7e716d5837f117ae0e86fff7404ec76c682ade2",
 "src/engine/component-field-reads.mjs": "4e13bc19558d2217afb9acd27a21f66a88c18891eb17aa8d6a58d91382ada709",
 "src/engine/component-prop-transfers.mjs": "44ec2ccbb297e2eae2a4d9af366a0720ef550e861305026f32eb0b4859f6f34d",
 "src/engine/reducer-field-writes.mjs": "0a2184f035c2861e4e247a2faac6ab9e6a32493c42c28544136b3684cac2bb6c",
 "src/engine/react19-field-vendor.mjs": "32f9a25b545fdab45843f5eadcf2245253c65b5dc6b338409454ff41503de6d4",
 "src/engine/reducer-call-frames.mjs": "36206c1069101d1e7d5e202fbf755cf166cf78261c51dbcce798a66097114947",
 "src/engine/component-call-frames.mjs": "ee9cb1cec79c0ca2f6e40e27970d62f303da99f981d93e4af8d6d893ecae9fa4",
 "src/engine/react19-vendor.mjs": "e798519bd68e8e5476f5065eef37eacb477261f7578c7fecc4cd8c1fd4243bca"
};
const nativeFiles=new Set(['react/cjs/react.development.js','react/cjs/react-jsx-runtime.development.js','react/cjs/react-jsx-dev-runtime.development.js','react-dom/cjs/react-dom-client.development.js']);
const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
const relative=s=>typeof s==='string'&&s.length>0&&s.length<4096&&!s.includes('\\')&&!s.includes('\0')&&!path.isAbsolute(s)&&s.split('/').every(p=>p&&p!=='.'&&p!=='..');
export const isOwnedListFieldCompilation=value=>value!==null&&typeof value==='object'&&issued.has(value);
export async function validateOwnedListFieldCompilation(value){const check=issued.get(value);if(!check)return false;try{await check();return true;}catch{issued.delete(value);return false;}}
export async function buildListFieldCompilation({projectRoot=process.cwd(),appRoot,entry,root,field,sources}={}){
 if(!relative(appRoot)||!relative(entry)||!relative(root?.file)||typeof root.export!=='string'||!Array.isArray(sources)||sources.length<1||sources.length>32||sources.some(s=>!relative(s))||new Set(sources).size!==sources.length||!sources.includes(root.file))throw Error('Bounded original source configuration required');
 const tools=await acquireOwnedCompilationTools({projectRoot}),app=path.join(tools.root,appRoot),records=new Map(),inputs=new Map();let sourceBytes=0,stageBytes=0;
 async function read(file){const local=path.relative(tools.root,file).split(path.sep).join('/'),bytes=await tools.read(local);const record={file:local,digest:sha(bytes),bytes:bytes.length};if(records.has(local)&&JSON.stringify(records.get(local))!==JSON.stringify(record))throw Error('Source revision changed');records.set(local,record);return bytes.toString('utf8');}
 const recipeRecords=[];const self=await read(path.join(tools.root,'src/engine/list-field-compilation.mjs'));if(sha(self.replace(/const LIST_BUILDER_PIN = '[a-f0-9]+';/,"const LIST_BUILDER_PIN = 'BUILDER_HASH';"))!==LIST_BUILDER_PIN)throw Error('Owned list compiler differs');recipeRecords.push(records.get('src/engine/list-field-compilation.mjs'));
 for(const [file,pin]of Object.entries(LIST_RECIPE_PINS)){const source=await read(path.join(tools.root,file));if(sha(source)!==pin)throw Error('Owned list compiler recipe differs: '+file);recipeRecords.push(records.get(file));}
 const originals=[];for(const file of sources)originals.push({file,text:await read(path.join(app,file))});
 const program=prepareListFieldProgram(originals,{root,field});if(program.status!=='Code-linked list program')throw Error('Original list source program unavailable');
 const modules=new Map(program.modules.map(m=>[path.join(app,m.file),m]));
 const runtime=`import {createListFieldRuntime} from ${JSON.stringify('./src/engine/list-field-runtime.mjs')};const binding=createListFieldRuntime({page:${JSON.stringify('list-'+program.digest)}});export const api=binding.api;Object.defineProperty(window,'__STATEATOM__',{value:binding.runtime});`;
 const bootstrap=`import ${JSON.stringify(runtimeId)};import ${JSON.stringify('./'+entry)};`;
 function recordStage(file,source,code,transform){sourceBytes+=Buffer.byteLength(source);stageBytes+=Buffer.byteLength(code);if(sourceBytes>LIMIT||stageBytes>LIMIT||inputs.size>=160||inputs.has(file))throw Error('Compiled input/stage budget exceeded');inputs.set(file,{file,sourceDigest:sha(source),sourceBytes:Buffer.byteLength(source),stageDigest:sha(code),stageBytes:Buffer.byteLength(code),transform});}
 const options={bundle:true,write:false,metafile:true,preserveSymlinks:true,platform:'browser',format:'iife',target:'chrome153',define:{'process.env.NODE_ENV':'"development"'},jsx:'automatic',jsxDev:true,sourcemap:false,minify:false,legalComments:'inline',charset:'utf8',tsconfigRaw:{}};
 const loader={name:'stateatom-owned-list-inputs',setup(b){
  b.onResolve({filter:/^stateatom:owned-list-runtime$/},()=>({path:'runtime.mjs',namespace:'stateatom-owned-list'}));
  b.onLoad({filter:/.*/,namespace:'stateatom-owned-list'},()=>{recordStage('stateatom-owned-list:runtime.mjs',runtime,runtime,'owned-bootstrap');return{contents:runtime,loader:'js',resolveDir:tools.root};});
  b.onLoad({filter:/\.[cm]?[jt]sx?$|\.css$/},async({path:file})=>{
   const source=await read(file),relativeFile=path.relative(tools.root,file).split(path.sep).join('/'),vendor=path.relative(path.join(app,'node_modules'),file).split(path.sep).join('/');let code=source,transform='identity';
   if(modules.has(file)){const module=modules.get(file);if(sha(source)!==module.sourceDigest)throw Error('Original program changed');code=bindListFieldModule(module,runtimeId);transform='list-source';}
   else if(nativeFiles.has(vendor)){code=transformPinnedFieldVendor(source,vendor).code;transform='react19-field-native';}
   recordStage(relativeFile,source,code,transform);return{contents:code,loader:file.endsWith('.css')?'css':/\.[cm]?tsx?$/.test(file)?'tsx':'jsx',resolveDir:path.dirname(file)};
  });
 }};
 const result=await tools.build({...options,absWorkingDir:tools.root,stdin:{contents:bootstrap,resolveDir:app,sourcefile:'stateatom-owned-list-entry.mjs'},outdir:path.join(tools.root,'.runtime/list-compiler-output'),plugins:[loader],logLevel:'silent'});
 const bootstrapKey=path.posix.join(appRoot,'stateatom-owned-list-entry.mjs');recordStage(bootstrapKey,bootstrap,bootstrap,'owned-bootstrap');
 for(const input of Object.keys(result.metafile.inputs))if(!inputs.has(input.replaceAll('\\','/')))throw Error('Unrecorded compiled input: '+input);
 const cssReferences=[];for(const [output,metadata]of Object.entries(result.metafile.outputs))for(const item of metadata.imports)if(item.external){if(!output.endsWith('.css')||item.kind!=='url-token'||!item.path.startsWith('data:image/svg+xml;')||item.path.length>4096)throw Error('Closed compilation has external code or resource imports');cssReferences.push({kind:'css-inline-image',digest:sha(item.path),bytes:Buffer.byteLength(item.path)});}
 const js=result.outputFiles.filter(f=>f.path.endsWith('.js'));if(js.length!==1||js[0].contents.length>LIMIT)throw Error('One bounded closed JavaScript bundle required');
 const code=js[0].text,assets=result.outputFiles.filter(f=>!f.path.endsWith('.js')).map(f=>{if(!f.path.endsWith('.css')||f.contents.length>LIMIT)throw Error('Unsupported compiled asset');return{kind:'css',name:path.basename(f.path),code:f.text,digest:sha(f.contents),bytes:f.contents.length}});
 await tools.confirm([...records.values()]);
 const manifest={schema:'stateatom.list-field-compilation/1',programDigest:program.digest,bundle:{digest:sha(code),bytes:Buffer.byteLength(code)},assets:assets.map(({code,...meta})=>meta),cssReferences,compiler:{name:'esbuild',version:tools.version,options,...tools.compiler,externalImports:0},trust:{recipe:{builder:LIST_BUILDER_PIN,transforms:LIST_RECIPE_PINS},files:[...tools.files,...recipeRecords]},inputs:[...inputs.values()].sort((a,b)=>a.file.localeCompare(b.file)),scope:'Helper-owned compiled bytes only; source/native effects, complete browser journal and selected occurrence remain separate'};
 manifest.digest=sha(JSON.stringify(manifest));if(Buffer.byteLength(JSON.stringify(manifest))>256*1024)throw Error('Compilation metadata budget exceeded');
 const value=freeze({code,assets,manifest,fieldOwnership:'Unknown/Unsupported',fullPath:false,publicProduct:false});issued.set(value,()=>tools.confirm([...records.values()]));return value;
}
