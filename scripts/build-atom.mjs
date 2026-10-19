import {bundledLicenses} from './bundled-licenses.mjs';
// SPDX-License-Identifier: Apache-2.0
import {build} from 'esbuild';
import {mkdir,copyFile,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {root} from './vite-config.mjs';
export async function buildAtom(){
 const dir=root+'/packages/atom';await mkdir(dir+'/dist',{recursive:true});
 const results=[];
 for(const entry of ['runtime','ui','platform','transport'])results.push(await build({entryPoints:[dir+'/src/'+entry+'.mjs'],bundle:true,metafile:true,format:'esm',platform:'browser',outfile:dir+'/dist/'+entry+'.mjs'}));
 for(const [entry,out]of [['guardian-entry','atom-guardian.js'],['guardian-worker','atom-guardian-worker.js']])results.push(await build({entryPoints:[dir+'/src/'+entry+'.mjs'],bundle:true,metafile:true,format:'esm',platform:'browser',outfile:dir+'/dist/'+out}));
 await copyFile(dir+'/src/guardian.html',dir+'/dist/atom-guardian.html');
 await build({entryPoints:[root+'/browser-extension/reader.mjs'],bundle:true,format:'iife',platform:'browser',outfile:dir+'/dist/reader.js'});
 await build({entryPoints:[root+'/browser-extension/content.js'],bundle:true,format:'iife',platform:'browser',outfile:dir+'/dist/content.js'});
 for(const name of ['reader.html','reader.css'])await copyFile(root+'/browser-extension/'+name,dir+'/dist/'+name);
 for(const entry of ['runtime','ui','platform','transport','capabilities'])await copyFile(dir+'/types/'+entry+'.d.ts',dir+'/dist/'+entry+'.d.ts');
 await copyFile(dir+'/src/atom.css',dir+'/dist/atom.css');
 await mkdir(dir+'/LICENSES',{recursive:true});for(const name of ['LICENSE','NOTICE','LICENSES/Apache-2.0.txt'])await copyFile(root+'/'+name,dir+'/'+name);
 await writeFile(dir+'/NOTICE',(await readFile(root+'/NOTICE','utf8'))+'\nEmbeddable runtime/UI adapted from the historical MIT StateAtom worker, panel and browser engine. Original platform/transport and packaging files carry Apache-2.0 SPDX headers. Supplied StatePort brand artwork and icon geometry in the UI template retain its extension-ui/design origin and is not relicensed.\n');
 const inputFiles=[...new Set(results.flatMap(r=>Object.keys(r.metafile.inputs)))];await writeFile(dir+'/dist/THIRD_PARTY_LICENSES.md',await bundledLicenses(inputFiles,root));const sourceManifest={};for(const file of inputFiles)sourceManifest[file]=createHash('sha256').update(await readFile(path.resolve(root,file))).digest('hex');await writeFile(dir+'/dist/source-manifest.json',JSON.stringify(sourceManifest,null,2));
 await writeFile(dir+'/dist/browser-inputs.json',JSON.stringify(results.map(r=>Object.keys(r.metafile.inputs)),null,2));
}
if(process.argv[1]===new URL(import.meta.url).pathname)await buildAtom();
