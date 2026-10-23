// SPDX-License-Identifier: Apache-2.0
// Workspace source acquisition only. Page paths are candidates, never authority.
import {realpath,readdir,lstat,open} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
const excluded=new Set(['node_modules','.git','dist','artifacts']);
const sourceName=/\.(jsx?|tsx?|vue|svelte)$/;
const limits={files:160,fileBytes:256000,totalBytes:2000000};
export async function safePath(root,relative){
 if(typeof relative!=='string'||relative.includes('%')||relative.includes('\\')||relative.split('/').includes('..')||path.isAbsolute(relative))throw Error('Path denied');
 const base=await realpath(root),full=await realpath(path.resolve(base,relative));
 if(!(full===base&&relative==='.')&&!full.startsWith(base+path.sep))throw Error('Outside workspace');return full;
}
export async function readWorkspaceSources(root,sourceRoot,{priorityFiles=[],isAllowed=()=>true}={}){
 const check=()=>{if(!isAllowed())throw Error('Workspace trust revoked; reconnect before source access');};
 const step=async fn=>{check();const v=await fn();check();return v;};
 const canonicalRoot=await step(()=>realpath(root)),base=await step(()=>safePath(canonicalRoot,sourceRoot));
 const files=[],seen=new Set();let bytes=0;
 const within=full=>full.startsWith(base+path.sep);
 const fullBudget=()=>files.length>=limits.files||bytes>=limits.totalBytes;
 const same=(a,b)=>['dev','ino','size','mtimeNs','ctimeNs'].every(k=>a[k]===b[k]);
 function parts(file){
  if(typeof file!=='string'||file.length>1024||file.includes('%')||file.includes('\\')||file.includes(':')||path.isAbsolute(file)||!sourceName.test(file))return null;
  const p=file.split('/');return p.length>48||p.some(s=>!s||s==='.'||s==='..'||excluded.has(s))?null:p;
 }
 async function candidate(file){
  const segments=parts(file);if(!segments)return null;
  const full=path.join(canonicalRoot,...segments);if(!within(full))return null;
  let current=canonicalRoot,info;
  for(const segment of segments){current=path.join(current,segment);info=await step(()=>lstat(current,{bigint:true}));if(info.isSymbolicLink())return null;}
  if(!info.isFile()||await step(()=>realpath(full))!==full)return null;
  return{full,info};
 }
 async function admit(file){
  if(fullBudget())return;let handle;
  try{
   const before=await candidate(file);if(!before||seen.has(before.full))return;
   const max=Math.min(limits.fileBytes,limits.totalBytes-bytes);if(before.info.size>BigInt(max))return;
   // NOFOLLOW refuses a replaced leaf; NONBLOCK prevents a regular-file→FIFO
   // race from hanging before fstat can reject the new descriptor.
   check();handle=await open(before.full,constants.O_RDONLY|(constants.O_NOFOLLOW||0)|(constants.O_NONBLOCK||0));check();
   const opened=await step(()=>handle.stat({bigint:true})),current=await candidate(file);
   if(!opened.isFile()||!current||!same(before.info,opened)||!same(current.info,opened))return;
   const buffer=Buffer.alloc(Number(opened.size)+1);let length=0;
   while(length<buffer.length){const r=await step(()=>handle.read(buffer,length,buffer.length-length,length));if(r.bytesRead===0)break;length+=r.bytesRead;}
   const after=await step(()=>handle.stat({bigint:true})),last=await candidate(file);
   if(length>max||BigInt(length)!==opened.size||!last||!same(opened,after)||!same(last.info,after))return;
   seen.add(before.full);bytes+=length;files.push({file:path.relative(canonicalRoot,before.full).split(path.sep).join('/'),text:buffer.toString('utf8',0,length)});
  }catch{check(); /* Missing, replaced or unsupported source remains absent. */}
  finally{await handle?.close();}
 }
 const prioritySeen=new Set();
 for(const file of Array.isArray(priorityFiles)?priorityFiles:[]){
  if(typeof file!=='string'||prioritySeen.has(file))continue;
  if(prioritySeen.size>=limits.files||fullBudget())break;prioritySeen.add(file);await admit(file);
 }
 async function walk(dir){
  if(fullBudget())return;
  const info=await step(()=>lstat(dir));if(info.isSymbolicLink()||!info.isDirectory())return;
  const canonical=await step(()=>realpath(dir));if(canonical!==dir||dir!==base&&!within(dir))return;
  for(const entry of await step(()=>readdir(dir,{withFileTypes:true}))){
   if(fullBudget())return;if(excluded.has(entry.name)||entry.isSymbolicLink())continue;
   const full=path.join(dir,entry.name);
   if(entry.isDirectory())await walk(full);else if(sourceName.test(entry.name))await admit(path.relative(canonicalRoot,full).split(path.sep).join('/'));
  }
 }
 await walk(base);check();return files;
}
