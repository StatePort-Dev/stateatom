// SPDX-License-Identifier: Apache-2.0
import {build} from 'esbuild';import {execFileSync} from 'node:child_process';
import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {root} from './vite-config.mjs';
import {assertImmutableArtifact} from './atom-package-receipt.mjs';
import {packListToolchain} from './pack-list-toolchain.mjs';
const pluginOnly=process.argv.includes('--plugin-only'),helperOnly=process.argv.includes('--helper-only');
if(pluginOnly&&helperOnly)throw Error('Choose one development artifact mode');
if(process.argv.slice(2).some(arg=>!['--plugin-only','--helper-only'].includes(arg)))throw Error('Unknown development packaging option');
const tag=new Date().toISOString().replace(/[:.]/g,'-'),out=root+'/.artifacts/development/'+tag,pkg=root+'/packages/vite-plugin';await mkdir(out,{recursive:true});await mkdir(pkg+'/dist/engine',{recursive:true});await mkdir(pkg+'/dist/first-read',{recursive:true});
const inputs={};let pack;
if(!helperOnly){
const selected=await build({entryPoints:[root+'/src/engine/list-install.mjs'],bundle:true,packages:'external',format:'esm',platform:'node',metafile:true,outfile:pkg+'/dist/selected-list/plugin.mjs'});
const toolchain=await packListToolchain(root,pkg+'/dist/selected-list/runtime.json.gz');
for(const [file,entry]of Object.entries(selected.metafile.inputs))inputs[file]=createHash('sha256').update(await readFile(file)).digest('hex');
for(const record of toolchain.files)inputs['selected-list/'+record.file]=record.sha256;
const bundle=await build({entryPoints:[root+'/src/engine/vite-install.mjs'],bundle:true,packages:'external',format:'esm',platform:'node',metafile:true,outfile:pkg+'/dist/engine/plugin.mjs'});
for(const name of ['observer','react-state','query-handoff','query-calls','action-observer','react19-acquisition','reducer-write-receipts','private-collections','component-field-receipts','list-data-receipts'])await copyFile(root+'/src/engine/'+name+'.mjs',pkg+'/dist/engine/'+name+'.mjs');await copyFile(root+'/src/first-read/query-ledger.mjs',pkg+'/dist/first-read/query-ledger.mjs');
await mkdir(pkg+'/core',{recursive:true});await copyFile(root+'/core/action-observation.mjs',pkg+'/core/action-observation.mjs');
await mkdir(pkg+'/LICENSES',{recursive:true});for(const name of ['LICENSE','NOTICE','LICENSES/Apache-2.0.txt'])await copyFile(root+'/'+name,pkg+'/'+name);
const digest=b=>createHash('sha256').update(b).digest('hex');for(const input of Object.keys(bundle.metafile.inputs))inputs[input]=digest(await readFile(input));for(const input of ['src/engine/observer.mjs','src/engine/react-state.mjs','src/engine/query-handoff.mjs','src/engine/query-calls.mjs','src/engine/action-observer.mjs','src/engine/react19-acquisition.mjs','src/engine/reducer-write-receipts.mjs','src/engine/private-collections.mjs','src/engine/component-field-receipts.mjs','src/engine/list-data-receipts.mjs','core/action-observation.mjs','src/first-read/query-ledger.mjs'])inputs[input]=digest(await readFile(root+'/'+input));await writeFile(pkg+'/dist/source-manifest.json',JSON.stringify(inputs,null,2));
pack=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json','--pack-destination',out],{cwd:pkg,encoding:'utf8'}))[0];
await assertImmutableArtifact([root+'/.artifacts/development'],pack.filename,await readFile(out+'/'+pack.filename));
}
const digest=b=>createHash('sha256').update(b).digest('hex');
let helper;
if(!pluginOnly){
 const vsix=out+'/stateatom-dev-helper-'+JSON.parse(await readFile(root+'/dist/ide/package.json')).version+(helperOnly?'-'+digest(await readFile(root+'/dist/ide/extension.cjs')).slice(0,12):'')+'.vsix';
 execFileSync(root+'/node_modules/.bin/vsce',['package','--no-dependencies','--skip-license','--out',vsix],{cwd:root+'/dist/ide',stdio:'inherit'});
 helper={file:vsix,sha256:digest(await readFile(vsix)),version:JSON.parse(await readFile(root+'/dist/ide/package.json')).version};
}
const receipt={schema:helperOnly?'stateatom.development-helper-artifact/1':pluginOnly?'stateatom.development-plugin-artifact/1':'stateatom.development-artifacts/1',status:'BUILT_NOT_VERIFIED',sourceRevision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',cwd:root}).trim(),sourceDirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8',cwd:root}).trim(),createdAt:new Date().toISOString(),...(pack?{plugin:{file:out+'/'+pack.filename,sha256:digest(await readFile(out+'/'+pack.filename)),version:JSON.parse(await readFile(pkg+'/package.json')).version}}:{}),...(helper?{helper}:{}),sourceManifest:inputs};
const name=helperOnly?'helper-handoff.json':pluginOnly?'plugin-handoff.json':'handoff.json';
await writeFile(out+'/'+name,JSON.stringify(receipt,null,2));await writeFile(root+'/.artifacts/development/'+name,JSON.stringify(receipt,null,2));console.log('Built local development artifacts:',out);
