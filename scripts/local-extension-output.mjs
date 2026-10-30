// SPDX-License-Identifier: Apache-2.0
import {mkdir,mkdtemp,rename,rm,lstat} from 'node:fs/promises';
import path from 'node:path';
// Only the stable developer output is replaceable. Issued archives use another path.
export async function replaceLocalExtension(destination,build){
 const parent=path.dirname(destination),lock=destination+'.build-lock';
 await mkdir(parent,{recursive:true});
 try{await mkdir(lock);}catch(error){if(error.code==='EEXIST')throw Error('Local extension build already running');throw error;}
 let stage,preserve=false;
 try{
  const old=await lstat(destination).catch(error=>{if(error.code!=='ENOENT')throw error;});
  if(old&&!old.isDirectory())throw Error('Local extension output must be a directory, not a link');
  stage=await mkdtemp(path.join(parent,'.browser-build-'));
  const next=path.join(stage,'next'),previous=path.join(stage,'previous');await mkdir(next);
  await build(next);
  if(old)await rename(destination,previous);
  try{await rename(next,destination);}catch(error){
   if(old)try{await rename(previous,destination);}catch(rollback){preserve=true;throw new AggregateError([error,rollback],'Restore the previous local build from '+previous);}
   throw error;
  }
 }finally{
  if(stage&&!preserve)await rm(stage,{recursive:true,force:true});
  await rm(lock,{recursive:true,force:true});
 }
}
