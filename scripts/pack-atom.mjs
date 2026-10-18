// SPDX-License-Identifier: Apache-2.0
import {buildAtom} from './build-atom.mjs';
import {buildUI} from '../packages/extension-ui/scripts/build.mjs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,cp,copyFile,mkdtemp} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import path from 'node:path';
import {root} from './vite-config.mjs';
await buildUI();await buildAtom();
const tag=new Date().toISOString().replaceAll(/[:.]/g,'-'),out=root+'/.artifacts/atom/'+tag;
await mkdir(out,{recursive:true});
const npm=(args,cwd)=>execFileSync('npm',args,{cwd,encoding:'utf8'});
const pack=dir=>JSON.parse(npm(['pack','--ignore-scripts','--json','--pack-destination',out],dir))[0];
const ui=pack(root+'/packages/extension-ui'),atom=pack(root+'/packages/atom');
const consumer=await mkdtemp('/tmp/stateatom-embedding-consumer-');
await cp(root+'/examples/embedding-host',consumer,{recursive:true});
const metadata=JSON.parse(await readFile(consumer+'/package.json','utf8'));
metadata.dependencies={'@stateport/atom':'file:'+out+'/'+atom.filename,'@stateport/extension-ui':'file:'+out+'/'+ui.filename};
await writeFile(consumer+'/package.json',JSON.stringify(metadata,null,2));
npm(['install','--prefer-offline','--ignore-scripts','--no-audit','--no-fund'],consumer);
npm(['run','build'],consumer);
// Both host copies below retain normalized bundle-input receipts; example npm build also ran independently.
const resolve=createRequire(consumer+'/package.json');const assets=async(dest)=>{
 await mkdir(dest,{recursive:true});
 for(const f of ['atom.css','content.js','reader.js','reader.html','reader.css'])await copyFile(resolve.resolve('@stateport/atom/'+f),dest+'/'+f);
 for(const f of ['tokens.css','components.css','contract.json'])await copyFile(resolve.resolve('@stateport/extension-ui/'+f),dest+'/extension-ui-'+f);
 for(const pkg of ['atom','extension-ui']){const dir=resolve.resolve('@stateport/'+pkg+'/contract.json').replace('/contract.json','');await mkdir(dest+'/'+pkg+'-licenses',{recursive:true});for(const f of ['LICENSE','NOTICE'])await copyFile(dir+'/'+f,dest+'/'+pkg+'-licenses/'+f);if(pkg==='atom')await cp(dir+'/LICENSES',dest+'/LICENSES',{recursive:true});}
};
const aliases=Object.fromEntries(['runtime','ui','platform','transport'].map(x=>['@stateport/atom/'+x,resolve.resolve('@stateport/atom/'+x)]));
const bundles={};
for(const [kind,entries]of [['embedding',[['worker.js','host-worker.js'],['inspect.js','workspace/inspect.js']]],['standalone',[['worker.js','worker.js'],['panel.js','panel.js']]]]){
 const source=kind==='embedding'?consumer:consumer+'/standalone';if(kind==='standalone')await cp(root+'/browser-extension',source,{recursive:true});
 const dest=out+'/'+kind;await assets(dest);await mkdir(dest+'/workspace',{recursive:true});
 await copyFile(source+'/manifest.json',dest+'/manifest.json');if(kind==='embedding')await copyFile(source+'/inspect.html',dest+'/workspace/inspect.html');else await copyFile(source+'/panel.html',dest+'/panel.html');
 for(const [entry,target]of entries){const r=await build({entryPoints:[source+'/'+entry],bundle:true,absWorkingDir:consumer,format:'esm',platform:'browser',alias:aliases,metafile:true,outfile:dest+'/'+target});bundles[kind+'/'+target]=Object.keys(r.metafile.inputs).map(p=>path.resolve(consumer,p));}
}
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex');
const handoff={schema:'stateatom.handoff/1',status:'BUILT_NOT_VERIFIED',createdAt:new Date().toISOString(),sourceRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceDirty:true,sourceManifest:JSON.parse(await readFile(root+'/packages/atom/dist/source-manifest.json','utf8')),apiVersion:1,contract:JSON.parse(await readFile(root+'/packages/atom/contract.json','utf8')),package:{name:'@stateport/atom',version:JSON.parse(await readFile(root+'/packages/atom/package.json','utf8')).version,file:out+'/'+atom.filename,sha256:await hash(out+'/'+atom.filename),exports:JSON.parse(await readFile(root+'/packages/atom/package.json','utf8')).exports},ui:{file:out+'/'+ui.filename,sha256:await hash(out+'/'+ui.filename),owner:'Host imports tokens.css, components.css once, then atom.css'},consumer,hosts:{standalone:out+'/standalone',embedding:out+'/embedding'},browserInputs:bundles,permissions:JSON.parse(await readFile(root+'/browser-extension/manifest.json','utf8')).permissions,verification:[],limits:['No registry publication or private StatePort integration','Screenshots require human review','Analyzer and evidence acceptance criteria unchanged']};
await writeFile(out+'/atom-handoff.json',JSON.stringify(handoff,null,2));await writeFile(root+'/.artifacts/atom/atom-handoff.json',JSON.stringify(handoff,null,2));console.log(out);
