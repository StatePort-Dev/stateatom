// SPDX-License-Identifier: Apache-2.0
import {buildAtom} from './build-atom.mjs';
import {buildUI} from '../packages/extension-ui/scripts/build.mjs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,cp,copyFile,mkdtemp,rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import path from 'node:path';
import {root} from './vite-config.mjs';
import {assertImmutableArtifact,inspectInstalledPair,fileManifest,sha256,verifyArtifactHashes,stageCandidate} from './atom-package-receipt.mjs';
import {disallowedBrowserInputs} from './atom-browser-inputs.mjs';
import {assertSourceParseInputs} from './atom-source-parse-inputs.mjs';
import {assertSourceAnalysisInputs} from './atom-source-analysis-inputs.mjs';
await mkdir(root+'/.artifacts/atom',{recursive:true});
const lock=root+'/.artifacts/atom/.pack.lock';await mkdir(lock);
try{
await buildUI();await buildAtom();
const tag=new Date().toISOString().replaceAll(/[:.]/g,'-'),stage=await stageCandidate(root+'/.artifacts/atom',tag),out=stage.directory,finalOut=stage.finalDirectory;
const npm=(args,cwd)=>execFileSync('npm',args,{cwd,encoding:'utf8'});
const pack=dir=>JSON.parse(npm(['pack','--ignore-scripts','--json','--pack-destination',out],dir))[0];
const ui=pack(root+'/packages/extension-ui'),atom=pack(root+'/packages/atom');
// Compare actual bytes with every already-issued identity, including earlier
// timestamped Atom pairs and the independently packed UI candidates. Never
// overwrite a historical receipt or "repair" its recorded artifact hash.
const reproduced={};
for(const packed of [ui,atom]){
 const bytes=await readFile(out+'/'+packed.filename);
 reproduced[packed.name]=(await assertImmutableArtifact([root+'/.artifacts/atom',root+'/.artifacts/extension-ui'],packed.filename,bytes)).filter(file=>path.dirname(file)!==out);
 const repeat=await mkdtemp('/tmp/stateatom-repeat-');npm(['pack','--ignore-scripts','--json','--pack-destination',repeat],root+'/packages/'+(packed.name==='@stateport/atom'?'atom':'extension-ui'));
 if(sha256(await readFile(repeat+'/'+packed.filename))!==sha256(bytes))throw Error('Nondeterministic package: '+packed.name);
}
const consumer=await mkdtemp('/tmp/stateatom-embedding-consumer-');
await cp(root+'/examples/embedding-host',consumer,{recursive:true});
await mkdir(consumer+'/tarballs');for(const packed of [atom,ui])await copyFile(out+'/'+packed.filename,consumer+'/tarballs/'+packed.filename);
const metadata=JSON.parse(await readFile(consumer+'/package.json','utf8'));
metadata.dependencies={'@stateport/atom':'file:./tarballs/'+atom.filename,'@stateport/extension-ui':'file:./tarballs/'+ui.filename};
await writeFile(consumer+'/package.json',JSON.stringify(metadata,null,2));
// Fresh consumers need registry metadata even when npm ci cached tarballs.
npm(['install','--prefer-offline','--ignore-scripts','--no-audit','--no-fund'],consumer);
const contract=JSON.parse(await readFile(root+'/packages/atom/contract.json','utf8'));
const accepted={atomVersion:atom.version,uiVersion:ui.version,apiVersion:contract.apiVersion,wireVersion:contract.wireVersion,uiContract:contract.uiContract};
const installedPair=await inspectInstalledPair(consumer,accepted);
const tree=JSON.parse(npm(['ls','--all','--json'],consumer));if(tree.problems?.length)throw Error('Invalid installed dependency tree');
const browserInputs=JSON.parse(await readFile(consumer+'/node_modules/@stateport/atom/dist/browser-inputs.json','utf8'));if(disallowedBrowserInputs(browserInputs.flat()).length)throw Error('Forbidden browser package inputs');
assertSourceAnalysisInputs(JSON.parse(await readFile(consumer+'/node_modules/@stateport/atom/dist/source-analysis-worker-inputs.json','utf8')));
assertSourceParseInputs(JSON.parse(await readFile(consumer+'/node_modules/@stateport/atom/dist/source-parse-worker-inputs.json','utf8')));
npm(['run','build'],consumer);
// Both host copies below retain normalized bundle-input receipts; example npm build also ran independently.
const resolve=createRequire(consumer+'/package.json');const assets=async(dest)=>{
 await mkdir(dest,{recursive:true});
 for(const f of ['guardian.html','guardian.js','guardian-worker.js'])await copyFile(resolve.resolve('@stateport/atom/'+f),dest+'/atom-'+f);
 await copyFile(resolve.resolve('@stateport/atom/source-analysis-worker.js'),dest+'/source-analysis-worker.js');
 await copyFile(resolve.resolve('@stateport/atom/source-parse-worker.js'),dest+'/source-parse-worker.js');
 for(const f of ['atom.css','content.js','reader.js','reader.html','reader.css'])await copyFile(resolve.resolve('@stateport/atom/'+f),dest+'/'+f);
 for(const f of ['tokens.css','components.css','fonts.css','contract.json'])await copyFile(resolve.resolve('@stateport/extension-ui/'+f),dest+'/extension-ui-'+f);
 await mkdir(dest+'/assets/fonts',{recursive:true});await copyFile(resolve.resolve('@stateport/extension-ui/assets/fonts/InterVariable.woff2'),dest+'/assets/fonts/InterVariable.woff2');
 for(const pkg of ['atom','extension-ui']){const dir=resolve.resolve('@stateport/'+pkg+'/contract.json').replace('/contract.json','');await mkdir(dest+'/'+pkg+'-licenses',{recursive:true});for(const f of ['LICENSE','NOTICE'])await copyFile(dir+'/'+f,dest+'/'+pkg+'-licenses/'+f);if(pkg==='extension-ui')await copyFile(dir+'/assets/fonts/Inter-LICENSE.txt',dest+'/extension-ui-licenses/Inter-LICENSE.txt');if(pkg==='atom')await cp(dir+'/LICENSES',dest+'/LICENSES',{recursive:true});}
 await copyFile(resolve.resolve('@stateport/atom/runtime').replace('/runtime.mjs','/THIRD_PARTY_LICENSES.md'),dest+'/atom-licenses/THIRD_PARTY_LICENSES.md');
};
const aliases=Object.fromEntries(['runtime','ui','platform','transport'].map(x=>['@stateport/atom/'+x,resolve.resolve('@stateport/atom/'+x)]));
const bundles={};
for(const [kind,entries]of [['embedding',[['worker.js','host-worker.js'],['inspect.js','workspace/inspect.js']]],['standalone',[['worker.js','worker.js'],['panel.js','panel.js']]]]){
 const source=kind==='embedding'?consumer:consumer+'/standalone';if(kind==='standalone')await cp(root+'/browser-extension',source,{recursive:true});
 const dest=out+'/'+kind;await assets(dest);await mkdir(dest+'/workspace',{recursive:true});
 await copyFile(source+'/manifest.json',dest+'/manifest.json');if(kind==='embedding')await copyFile(source+'/inspect.html',dest+'/workspace/inspect.html');else {await copyFile(source+'/panel.html',dest+'/panel.html');await copyFile(source+'/panel.css',dest+'/panel.css');}
 for(const [entry,target]of entries){const r=await build({entryPoints:[source+'/'+entry],bundle:true,absWorkingDir:consumer,format:'esm',platform:'browser',alias:aliases,metafile:true,outfile:dest+'/'+target});bundles[kind+'/'+target]=Object.keys(r.metafile.inputs).map(p=>path.resolve(consumer,p));}
}
const hash=async file=>createHash('sha256').update(await readFile(file)).digest('hex');
for(const [bundle,inputs]of Object.entries(bundles))if(!inputs.every(p=>p.startsWith(consumer+'/'))||!inputs.some(p=>p.startsWith(consumer+'/node_modules/@stateport/atom/')))throw Error('Browser bundle escaped installed pair: '+bundle);
const packageBuildSources={...JSON.parse(await readFile(root+'/packages/atom/dist/source-manifest.json','utf8'))};
for(const dir of ['packages/atom/src','packages/atom/types','packages/extension-ui/tokens','packages/extension-ui/styles','packages/extension-ui/scripts','packages/extension-ui/assets','browser-extension','examples/embedding-host'])for(const[file,digest]of Object.entries(await fileManifest(root+'/'+dir)))packageBuildSources[dir+'/'+file]=digest;
for(const file of ['package.json','package-lock.json','packages/atom/package.json','packages/atom/contract.json','packages/atom/README.md','packages/atom/CHANGELOG.md','packages/extension-ui/package.json','packages/extension-ui/contract.json','packages/extension-ui/README.md','packages/extension-ui/CHANGELOG.md','packages/extension-ui/LICENSE','packages/extension-ui/NOTICE','LICENSE','NOTICE','LICENSES/Apache-2.0.txt','scripts/build-atom.mjs','scripts/pack-atom.mjs','scripts/pack-extension-ui.mjs','scripts/atom-package-receipt.mjs','scripts/atom-browser-inputs.mjs','scripts/atom-source-analysis-inputs.mjs','scripts/atom-source-analysis-inputs.json','scripts/atom-source-parse-inputs.mjs','scripts/bundled-licenses.mjs','scripts/vite-config.mjs'])packageBuildSources[file]=await hash(root+'/'+file);
const buildManifest=Object.fromEntries(Object.entries(packageBuildSources).sort(([a],[b])=>a<b?-1:a>b?1:0));
const visualSourceManifest={};for(const file of ['packages/atom/src/atom.css','packages/atom/src/template.mjs','packages/atom/src/ui.mjs','packages/atom/package.json','packages/atom/contract.json','browser-extension/panel.html','browser-extension/panel.css','browser-extension/reader.html','browser-extension/reader.css','examples/embedding-host/inspect.html'])visualSourceManifest[file]=await hash(root+'/'+file);
const handoff={visualSourceManifest,schema:'stateatom.handoff/1',status:'BUILT_NOT_VERIFIED',createdAt:new Date().toISOString(),sourceRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sourceDirty:true,sourceManifest:JSON.parse(await readFile(root+'/packages/atom/dist/source-manifest.json','utf8')),apiVersion:1,contract:JSON.parse(await readFile(root+'/packages/atom/contract.json','utf8')),package:{name:'@stateport/atom',version:JSON.parse(await readFile(root+'/packages/atom/package.json','utf8')).version,file:out+'/'+atom.filename,sha256:await hash(out+'/'+atom.filename),exports:JSON.parse(await readFile(root+'/packages/atom/package.json','utf8')).exports},ui:{file:out+'/'+ui.filename,sha256:await hash(out+'/'+ui.filename),owner:'Host imports tokens.css, optional local fonts.css plus its relative asset, components.css once, then atom.css'},consumer,hosts:{standalone:out+'/standalone',embedding:out+'/embedding'},browserInputs:bundles,permissions:JSON.parse(await readFile(root+'/browser-extension/manifest.json','utf8')).permissions,verification:[],limits:['No registry publication or private StatePort integration','Screenshots require human review','Analyzer and evidence acceptance criteria unchanged']};
handoff.sourceDirty=npmGitDirty();
handoff.wireVersion=contract.wireVersion;
Object.assign(handoff.ui,{name:ui.name,version:ui.version,uiContractVersion:contract.uiContract,exports:JSON.parse(await readFile(root+'/packages/extension-ui/package.json','utf8')).exports});
handoff.buildSources={manifest:buildManifest,sha256:sha256(JSON.stringify(buildManifest)),method:'SHA-256 of JSON.stringify of path-sorted POSIX path to exact SHA-256 map; package inputs, browser and example host sources, packaging scripts and lockfile. Generated dist is bound by installed and host manifests.'};
handoff.consumerReceipt={schema:'stateatom.consumer-receipt/1',status:'BUILT_NOT_VERIFIED',...installedPair,tarballsDeterministic:true,reproduced,dependencyTree:tree,hostFiles:{standalone:await fileManifest(handoff.hosts.standalone),embedding:await fileManifest(handoff.hosts.embedding)},tools:{node:process.version,npm:npm(['--version'],consumer).trim(),esbuild:JSON.parse(await readFile(consumer+'/node_modules/esbuild/package.json','utf8')).version}};
await verifyArtifactHashes([handoff.package,handoff.ui]);
await inspectInstalledPair(consumer,{...accepted,files:installedPair.files});
handoff.package.file=finalOut+'/'+atom.filename;handoff.ui.file=finalOut+'/'+ui.filename;
handoff.hosts={standalone:finalOut+'/standalone',embedding:finalOut+'/embedding'};
await writeFile(out+'/atom-handoff.json',JSON.stringify(handoff,null,2));
await stage.promote();
await writeFile(root+'/.artifacts/atom/atom-handoff.json',JSON.stringify(handoff,null,2));console.log(finalOut);
}finally{await rm(lock,{recursive:true});}
function npmGitDirty(){return execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{cwd:root,encoding:'utf8'}).trim().length>0;}
