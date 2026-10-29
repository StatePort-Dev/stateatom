// SPDX-License-Identifier: Apache-2.0
import path from 'node:path';import {readFile,writeFile,mkdir,readdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';import {gzipSync} from 'node:zlib';import {build} from 'esbuild';
import {acquireOwnedCompilationTools} from '../src/first-read/build-profile.mjs';
export async function packListToolchain(root,output){
 const tools=await acquireOwnedCompilationTools({projectRoot:root});
 const entries=['src/engine/list-launch.mjs','src/engine/list-field-compilation.mjs','src/engine/list-field-effects.mjs','src/engine/list-field-server.mjs','src/engine/list-field-code.mjs','core/list-field-channel.mjs','scripts/native-browser.mjs'];
 const graph=await build({absWorkingDir:root,entryPoints:entries,bundle:true,packages:'external',platform:'node',format:'esm',write:false,metafile:true,outdir:'unused-list-tools'});
 const names=new Set([...tools.files.map(r=>r.file),...Object.keys(graph.metafile.inputs),'src/engine/list-field-runtime.mjs','src/engine/list-field-reviewed-inputs.json','LICENSE','NOTICE','LICENSES/Apache-2.0.txt']);
 // Browser-only dynamic dependencies are part of the same exact compilation.
 const runtime=await build({absWorkingDir:root,entryPoints:['src/engine/list-field-runtime.mjs'],bundle:true,packages:'external',platform:'browser',format:'esm',write:false,metafile:true});
 for(const file of Object.keys(runtime.metafile.inputs))names.add(file);
 // Preserve original license/notice documents for each included upstream tool.
 const packages=new Set([...names].filter(n=>n.startsWith('node_modules/')&&n.endsWith('/package.json')).map(n=>path.posix.dirname(n)));
 for(const directory of packages)for(const name of await readdir(path.join(root,directory)))if(/^(?:licen[sc]e|notice|copying)(?:\.|$)/i.test(name)){
  const file=path.posix.join(directory,name);if((await lstat(path.join(root,file))).isFile())names.add(file);
 }
 async function tree(directory){for(const name of await readdir(path.join(root,directory))){const file=path.posix.join(directory,name),stat=await lstat(path.join(root,file));if(stat.isSymbolicLink())throw Error('Toolchain symlink denied');if(stat.isDirectory())await tree(file);else if(stat.isFile())names.add(file);}}
 await tree('dist/browser');
 const files=[];for(const file of [...names].sort()){if(path.isAbsolute(file)||file.split('/').includes('..'))throw Error('Toolchain input path denied');const bytes=await readFile(path.join(root,file));files.push({file,sha256:createHash('sha256').update(bytes).digest('hex'),mode:file.endsWith('/bin/esbuild')?0o700:0o600,data:bytes.toString('base64')});}
 const archive=gzipSync(JSON.stringify({schema:'stateatom.list-toolchain/1',files}),{level:9});await mkdir(path.dirname(output),{recursive:true});await writeFile(output,archive);
 return{sha256:createHash('sha256').update(archive).digest('hex'),bytes:archive.length,files:files.map(({data,...r})=>r)};
}
