// SPDX-License-Identifier: Apache-2.0
// Node-only explicit artifact preparation. Never builds or evaluates an app.
import {open,lstat,realpath,mkdtemp,link,rm} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {releaseZip,releaseArtifactPath} from './release-bundle-zip.mjs';
import {ARCHIVE_LIMITS} from './source-map-archive.mjs';
import {parseSourceMap,validateManifest,MAP_LIMITS} from './source-maps.mjs';
import {assertUniqueHandoffJSONMembers} from './handoff-json.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const decoder=new TextDecoder('utf-8',{fatal:true}),sourceDecoder=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}),RECIPE_BYTES=128*1024;
const keys=(value,names)=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join(',')===names.slice().sort().join(',');
const sameFile=(a,b)=>a&&b&&a.dev===b.dev&&a.ino===b.ino;
function recipeData(bytes){
 let recipe;try{const text=decoder.decode(bytes);recipe=JSON.parse(text);assertUniqueHandoffJSONMembers(text,{maxDepth:3,maxMembers:4096});}catch{throw Error('Invalid or duplicate release-bundle recipe JSON');}
 const enriched=recipe?.schema==='stateatom.release-bundle-recipe/2';
 if(!keys(recipe,enriched?['schema','releaseId','assets','companions']:['schema','releaseId','assets'])||!['stateatom.release-bundle-recipe/1','stateatom.release-bundle-recipe/2'].includes(recipe.schema)||typeof recipe.releaseId!=='string'||!recipe.releaseId.trim()||recipe.releaseId.length>128||/[\u0000-\u001f\u007f]/.test(recipe.releaseId)||!Array.isArray(recipe.assets)||!recipe.assets.length||recipe.assets.length>64)throw Error('Invalid release-bundle recipe');
 const names=new Set(),maps=new Set();
 for(const asset of recipe.assets){if(!keys(asset,['asset','sourceMap']))throw Error('Invalid recipe asset fields');releaseArtifactPath(asset.asset);releaseArtifactPath(asset.sourceMap);if(asset.asset==='manifest.json'||asset.sourceMap==='manifest.json')throw Error('Reserved manifest path');if(names.has(asset.asset))throw Error('Duplicate recipe asset');names.add(asset.asset);maps.add(asset.sourceMap);}
 if([...maps].some(name=>names.has(name)))throw Error('Conflicting artifact/map roles');
 if(enriched){
  if(!Array.isArray(recipe.companions)||!recipe.companions.length||recipe.companions.length>MAP_LIMITS.sources)throw Error('Invalid companion declarations');
  const bound=new Set();
  for(const c of recipe.companions){
   if(!keys(c,['sourceMap','sourceMapSha256','sourceIndex','source','file'])||!maps.has(c.sourceMap)||typeof c.sourceMapSha256!=='string'||!/^[a-f0-9]{64}$/.test(c.sourceMapSha256)||!Number.isSafeInteger(c.sourceIndex)||c.sourceIndex<0||c.sourceIndex>=MAP_LIMITS.sources||typeof c.source!=='string'||c.source.length>2048)throw Error('Invalid companion map/index binding');
   releaseArtifactPath(c.file);if(names.has(c.file)||maps.has(c.file)||c.file==='manifest.json')throw Error('Conflicting companion input role');
   const key=c.sourceMap+'\0'+c.sourceIndex;if(bound.has(key))throw Error('Duplicate companion source index');bound.add(key);
  }
 }

 if(new Set([...names,...maps,'manifest.json']).size>ARCHIVE_LIMITS.files)throw Error('Archive entry count budget');
 return recipe;
}
async function boundedFile(file,limit,check,label='Artifact',assertPath=async()=>{}){
 check();await assertPath();check();const beforeOpen=await lstat(file,{bigint:true});check();if(beforeOpen.isSymbolicLink()||!beforeOpen.isFile())throw Error(label+' must be a regular file, not a symlink');
 const handle=await open(file,constants.O_RDONLY|(constants.O_NOFOLLOW??0)|(constants.O_NONBLOCK??0));
 try{
  check();await assertPath();check();const initial=await handle.stat({bigint:true});if(!initial.isFile())throw Error(label+' must be a regular file');if(initial.size>BigInt(limit))throw Error(label+' file size budget');
  const data=Buffer.alloc(Number(initial.size)+1);let at=0;
  while(at<data.length){check();const {bytesRead}=await handle.read(data,at,Math.min(64*1024,data.length-at),at);check();if(!bytesRead)break;at+=bytesRead;}
  const final=await handle.stat({bigint:true});check();
  if(!sameFile(initial,final)||initial.size!==final.size||initial.mtimeNs!==final.mtimeNs||initial.ctimeNs!==final.ctimeNs||at!==Number(initial.size))throw Error(label+' changed while reading');
  await assertPath();check();return data.subarray(0,at);
 }finally{await handle.close();}
}
async function artifactFile(root,name,check){
 let directory=root;const segments=name.split('/'),ancestors=[];
 for(const part of [null,...segments.slice(0,-1)]){check();if(part!==null)directory=path.join(directory,part);const stat=await lstat(directory,{bigint:true});check();if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('Artifact directory must be a regular directory, not a symlink');ancestors.push({directory,stat});}
 const assertPath=async()=>{for(const ancestor of ancestors){check();const current=await lstat(ancestor.directory,{bigint:true});check();if(current.isSymbolicLink()||!current.isDirectory()||!sameFile(current,ancestor.stat))throw Error('Artifact directory changed while reading');}};
 // Revalidate the selected root/ancestors before opening, after opening and
 // before accepting bytes. Detect ordinary persistent rename/symlink changes;
 // this remains a bounded local read, not an atomic/hostile-filesystem snapshot.
 return boundedFile(path.join(directory,segments.at(-1)),ARCHIVE_LIMITS.entry,check,'Artifact',assertPath);
}
async function enrichMaps(root,recipe,files,expanded,check){
 const receipts=[];
 for(const name of [...new Set(recipe.companions.map(c=>c.sourceMap))].sort()){
  check();const original=files.get(name),digest=sha(original),bindings=recipe.companions.filter(c=>c.sourceMap===name).sort((a,b)=>a.sourceIndex-b.sourceIndex);
  if(bindings.some(c=>c.sourceMapSha256!==digest))throw Error('Companion original map digest mismatch');
  const text=decoder.decode(original);assertUniqueHandoffJSONMembers(text);const map=JSON.parse(text),content=map.sourcesContent?.slice()||map.sources.map(()=>null),sources=[];
  let contentBytes=content.reduce((n,c)=>n+(c===null?0:Buffer.byteLength(c)),0);
  for(const c of bindings){
   check();if(c.sourceIndex>=map.sources.length||map.sources[c.sourceIndex]!==c.source)throw Error('Companion source index/name mismatch');
   if(content[c.sourceIndex]!==null)throw Error('Companion cannot replace existing source content');
   const raw=await artifactFile(root,c.file,check);let source;try{source=sourceDecoder.decode(raw);}catch{throw Error('Invalid UTF-8 companion source');}
   contentBytes+=Buffer.byteLength(source);if(contentBytes>MAP_LIMITS.sourceBytes)throw Error('Source content budget');
   content[c.sourceIndex]=source;sources.push({index:c.sourceIndex,rawSourceSha256:sha(raw),bytes:raw.length});
  }
  const bytes=Buffer.from(JSON.stringify({...map,sourcesContent:content}));if(bytes.length>MAP_LIMITS.bytes)throw Error('Enriched map size budget');
  expanded+=bytes.length-original.length;if(expanded>ARCHIVE_LIMITS.expanded)throw Error('Archive expansion budget');
  await parseSourceMap(bytes);check();files.set(name,bytes);receipts.push({originalMapSha256:digest,enrichedMapSha256:sha(bytes),sources});
 }
 return{schema:'stateatom.source-enrichment-receipt/1',maps:receipts};
}
async function writeNew(output,bytes,check){
 // Complete the file in a private same-filesystem directory. A hard link creates
 // the final name atomically and refuses an existing destination. Never unlink
 // the public output path: an ownership check followed by unlink has a race.
 check();const parent=await realpath(path.dirname(path.resolve(output)));check();
 const destination=path.join(parent,path.basename(output)),stage=await mkdtemp(path.join(parent,'.stateatom-source-'));
 let handle,failure;const cleanup={status:'Complete'};
 try{
  check();const file=path.join(stage,'release.zip');handle=await open(file,'wx',0o600);check();let at=0;
  while(at<bytes.length){check();const {bytesWritten}=await handle.write(bytes,at,Math.min(64*1024,bytes.length-at),at);check();if(!bytesWritten)throw Error('Output write made no progress');at+=bytesWritten;}
  await handle.close();handle=null;check();await link(file,destination);
  // The final name now contains the complete archive. Cancellation after this
  // commit point must not remove a completed artifact or a later replacement.
 }catch(error){failure=error;}
 finally{
  if(handle)await handle.close().catch(error=>{failure??=error;});
  await rm(stage,{recursive:true,force:true}).catch(error=>{cleanup.status='Unavailable';cleanup.directory=path.basename(stage);cleanup.reason=error.code??'LOCAL_IO';if(failure)failure.message+='; private staging cleanup unavailable';});
 }
 if(failure)throw failure;return cleanup;
}
export async function prepareReleaseBundle({root,recipeFile,outputFile,signal}){
 if([root,recipeFile,outputFile].some(s=>typeof s!=='string'||!s)||!outputFile.toLowerCase().endsWith('.zip'))throw Error('Root, recipe and new .zip output paths required');
 const check=()=>{if(signal?.aborted)throw Error('Release bundle cancelled');};check();
 const canonical=await realpath(root);check();if(!(await lstat(canonical)).isDirectory())throw Error('Artifact root must be a directory');
 const recipe=recipeData(await boundedFile(recipeFile,RECIPE_BYTES,check,'Recipe')),files=new Map(),assets=[],mapNames=new Set(recipe.assets.map(a=>a.sourceMap));let expanded=0;
 for(const name of [...new Set(recipe.assets.flatMap(a=>[a.asset,a.sourceMap]))].sort()){
  const data=await artifactFile(canonical,name,check);expanded+=data.length;if(expanded>ARCHIVE_LIMITS.expanded)throw Error('Archive expansion budget');
  if(mapNames.has(name))await parseSourceMap(data);else try{decoder.decode(data);}catch{throw Error('Invalid UTF-8 JavaScript artifact');}
  check();files.set(name,data);
 }
 const companionSources=recipe.companions?await enrichMaps(canonical,recipe,files,expanded,check):null;
 for(const entry of [...recipe.assets].sort((a,b)=>a.asset<b.asset?-1:a.asset>b.asset?1:0)){
  assets.push({asset:entry.asset,sourceMap:entry.sourceMap,assetSha256:sha(files.get(entry.asset)),sourceMapSha256:sha(files.get(entry.sourceMap))});
 }
 const manifest=validateManifest({schemaVersion:1,releaseId:recipe.releaseId,assets});files.set('manifest.json',Buffer.from(JSON.stringify(manifest)+'\n'));
 const bytes=releaseZip(files,{signal});check();const cleanup=await writeNew(outputFile,bytes,check);return{status:'PREPARED_NOT_ATTACHED',releaseId:recipe.releaseId,assets:assets.length,bytes:bytes.length,sha256:sha(bytes),cleanup,...(companionSources?{companionSources}:{})};
}
