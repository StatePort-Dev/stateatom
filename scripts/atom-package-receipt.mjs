// SPDX-License-Identifier: Apache-2.0
import {readFile,readdir,realpath,mkdtemp,rename} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import path from 'node:path';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function stageCandidate(parent,tag){
 if(!/^[\w-]+$/.test(tag))throw Error('Invalid candidate directory');
 const directory=await mkdtemp(parent+'/.staging-'+tag+'-'),finalDirectory=parent+'/'+tag;
 return{directory,finalDirectory,promote:()=>rename(directory,finalDirectory)};
}
export async function fileManifest(base,prefix=''){
 const result={};
 for(const entry of (await readdir(base,{withFileTypes:true})).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){
  const name=prefix+entry.name,file=path.join(base,entry.name);
  if(entry.isDirectory())Object.assign(result,await fileManifest(file,name+'/'));
  else if(entry.isFile())result[name]=sha256(await readFile(file));
  else throw Error('Non-regular artifact input: '+file);
 }
 return result;
}
export async function verifyArtifactHashes(artifacts){for(const artifact of artifacts)if(sha256(await readFile(artifact.file))!==artifact.sha256)throw Error('Artifact digest mismatch: '+artifact.file);}
export async function assertImmutableArtifact(roots,filename,bytes){
 if(path.basename(filename)!==filename)throw Error('Invalid artifact filename');
 const hash=sha256(bytes),matches=[];
 for(const root of roots){
  let entries;try{entries=await readdir(root,{withFileTypes:true});}catch(e){if(e.code==='ENOENT')continue;throw e;}
  for(const entry of entries.filter(e=>e.isDirectory()&&!e.name.startsWith('.'))){
   const file=root+'/'+entry.name+'/'+filename;let old;try{old=await readFile(file);}catch(e){if(e.code==='ENOENT')continue;throw e;}
   if(sha256(old)!==hash)throw Error('Candidate identity already issued with different bytes; bump version: '+file);
   matches.push(file);
  }
 }
 return matches;
}
export async function inspectInstalledPair(consumer,expected){
 const resolve=createRequire(consumer+'/package.json');
 const atom=consumer+'/node_modules/@stateport/atom',ui=consumer+'/node_modules/@stateport/extension-ui';
 const atomPkg=JSON.parse(await readFile(atom+'/package.json')),uiPkg=JSON.parse(await readFile(ui+'/package.json'));
 const contract=JSON.parse(await readFile(atom+'/contract.json')),uiContract=JSON.parse(await readFile(ui+'/contract.json'));
 if(atomPkg.name!=='@stateport/atom'||atomPkg.version!==expected.atomVersion)throw Error('Atom package identity mismatch');
 for(const key of ['apiVersion','wireVersion','uiContract'])if(contract[key]!==expected[key])throw Error('Atom contract mismatch: '+key);
 if(uiPkg.name!=='@stateport/extension-ui'||uiPkg.version!==expected.uiVersion||atomPkg.peerDependencies?.['@stateport/extension-ui']!==expected.uiVersion||contract.uiPackage!==expected.uiVersion)throw Error('UI peer mismatch');
 if(uiContract.uiContractVersion!==expected.uiContract)throw Error('UI contract mismatch');
 const installed=await realpath(consumer+'/node_modules');
 const contained=async file=>{const real=await realpath(file);if(!real.startsWith(installed+'/'))throw Error('Export escapes clean consumer: '+file);return real;};
 const peer=createRequire(atom+'/package.json');if(await realpath(peer.resolve('@stateport/extension-ui/contract.json'))!==await realpath(ui+'/contract.json'))throw Error('Multiple UI peer resolutions');
 const required={atom:['runtime','ui','platform','transport','atom.css','content.js','reader.js','reader.html','reader.css','contract.json'],'extension-ui':['tokens.css','components.css','fonts.css','contract.json','assets/fonts/InterVariable.woff2']};
 if(contract.guardian?.protocolVersion===1)required.atom.push(...contract.guardian.assets);
 if(Array.isArray(contract.features)&&contract.features.includes('source-analysis-worker-v1')){
  if(contract.sourceAnalysis?.protocolVersion!==1||JSON.stringify(contract.sourceAnalysis.assets)!=='["source-analysis-worker.js"]')throw Error('Invalid source-analysis asset contract');
  required.atom.push('source-analysis-worker.js');
 }
 const exported={};
 for(const [name,pkg,dir]of [['atom',atomPkg,atom],['extension-ui',uiPkg,ui]]){
  for(const key of required[name])if(!pkg.exports?.['./'+key])throw Error('Missing export: '+name+'/'+key);
  for(const [key,target]of Object.entries(pkg.exports)){
   const file=await contained(resolve.resolve('@stateport/'+name+'/'+key.slice(2)));await readFile(file);exported['@stateport/'+name+key.slice(1)]=path.relative(consumer,file);
   if(typeof target==='object'){if(!target.types)throw Error('Missing declaration export: '+key);await readFile(await contained(path.resolve(dir,target.types)));}
  }
 }
 for(const file of [atom+'/LICENSE',atom+'/NOTICE',atom+'/LICENSES/Apache-2.0.txt',atom+'/dist/THIRD_PARTY_LICENSES.md',ui+'/LICENSE',ui+'/NOTICE',ui+'/assets/fonts/Inter-LICENSE.txt'])await readFile(await contained(file));
 const files={};for(const [name,dir]of [['atom',atom],['extension-ui',ui]])for(const [file,hash]of Object.entries(await fileManifest(dir)))files['@stateport/'+name+'/'+file]=hash;
 if(expected.files&&(Object.keys(files).length!==Object.keys(expected.files).length||Object.entries(files).some(([key,hash])=>expected.files[key]!==hash)))throw Error('Installed file digest mismatch (including declarations/assets)');
 return{atomVersion:atomPkg.version,uiVersion:uiPkg.version,apiVersion:contract.apiVersion,wireVersion:contract.wireVersion,uiContract:uiContract.uiContractVersion,files,exports:exported};
}
