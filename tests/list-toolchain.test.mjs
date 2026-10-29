// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,readdir,lstat} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const capsule=files=>gzipSync(JSON.stringify({schema:'stateatom.list-toolchain/1',files:files.map(([file,text,mode=0o600])=>({file,data:Buffer.from(text).toString('base64'),sha256:sha(text),mode}))}));
const load=()=>import('../src/engine/list-toolchain.mjs');
test('materialized installed toolchain retains exact bytes/modes and owns only its temporary directory',async()=>{
 const {materializeListToolchain}=await load(),root=await mkdtemp('/tmp/stateatom-capsule-test-');let value;
 try{value=await materializeListToolchain(capsule([['package.json','{}'],['bin/compiler','compiler',0o700]]),root);assert.equal(await readFile(value.root+'/bin/compiler','utf8'),'compiler');assert.equal((await lstat(value.root+'/bin/compiler')).mode&0o777,0o700);assert.equal(value.digest.length,64);await value.close();assert.deepEqual(await readdir(root),[]);await value.close();}finally{await value?.close();await rm(root,{recursive:true,force:true});}
});
test('toolchain refuses traversal, duplicate files, invalid bytes, modes and oversized compressed inputs',async()=>{
 const {materializeListToolchain}=await load(),root=await mkdtemp('/tmp/stateatom-capsule-test-');
 try{for(const raw of [capsule([['../outside','x']]),capsule([['/absolute','x']]),capsule([['same','a'],['same','b']]),capsule([['bad','x',0o777]]),gzipSync(JSON.stringify({schema:'stateatom.list-toolchain/1',files:[{file:'bad',data:'eA==',sha256:'0'.repeat(64),mode:0o600}]})),Buffer.alloc(40*1024*1024+1)])await assert.rejects(materializeListToolchain(raw,root));assert.deepEqual(await readdir(root),[]);}finally{await rm(root,{recursive:true,force:true});}
});

test('installed capsule compiles actual app bytes without resolving tooling from the producer checkout',async()=>{
 const {packListToolchain}=await import('../scripts/pack-list-toolchain.mjs');const {materializeListToolchain}=await load();const {cp}=await import('node:fs/promises');const {pathToFileURL}=await import('node:url');
 const root=await mkdtemp('/tmp/stateatom-installed-tools-');let tools;
 try{
  await packListToolchain(process.cwd(),root+'/tools.gz');tools=await materializeListToolchain(await readFile(root+'/tools.gz'),root);
  await cp('.runtime/todomvc/examples/react',root+'/app',{recursive:true});
  const native=await import(pathToFileURL(tools.root+'/scripts/native-browser.mjs'));assert.equal(typeof native.startNativeBrowser,'function');
  const {buildListFieldCompilation}=await import(pathToFileURL(tools.root+'/src/engine/list-field-compilation.mjs'));
  const {establishListFieldEffects,listFieldEffectsView}=await import(pathToFileURL(tools.root+'/src/engine/list-field-effects.mjs'));
  const compilation=await buildListFieldCompilation({projectRoot:root+'/app',toolRoot:tools.root,appRoot:'.',entry:'src/index.js',root:{file:'src/todo/app.jsx',export:'App'},field:'title',sources:['src/todo/app.jsx','src/todo/reducer.js','src/todo/components/main.jsx','src/todo/components/item.jsx','src/todo/components/footer.jsx']});
  assert.equal(listFieldEffectsView(await establishListFieldEffects(compilation)).status,'Code-linked');assert.equal(compilation.fullPath,false);
 }finally{await tools?.close();await rm(root,{recursive:true,force:true});}
});
