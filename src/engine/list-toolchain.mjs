// SPDX-License-Identifier: Apache-2.0
// Installed, pinned tooling is unpacked separately from the application. This
// archive is local executable tooling, never a page/upload/imported diagnostic.
import path from 'node:path';import {mkdtemp,mkdir,writeFile,rm,lstat,realpath} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
const limit=40*1024*1024,sha=b=>createHash('sha256').update(b).digest('hex');
export async function materializeListToolchain(bytes,parent){
 if(!Buffer.isBuffer(bytes)||bytes.length>limit)throw Error('Toolchain archive budget exceeded');
 if(typeof parent!=='string'||!path.isAbsolute(parent)||await realpath(parent)!==parent||!(await lstat(parent)).isDirectory())throw Error('Real toolchain parent required');
 const data=JSON.parse(gunzipSync(bytes,{maxOutputLength:limit*2}).toString('utf8'));
 if(data?.schema!=='stateatom.list-toolchain/1'||!Array.isArray(data.files)||data.files.length<1||data.files.length>2000)throw Error('Toolchain inventory unavailable');
 const files=[],names=new Set();let size=0;
 for(const record of data.files){
  const file=record?.file;
  if(typeof file!=='string'||file.length>4096||file.includes('\\')||file.includes('\0')||path.isAbsolute(file)||file.split('/').some(p=>!p||p==='.'||p==='..')||names.has(file)||![0o600,0o700].includes(record.mode)||typeof record.data!=='string')throw Error('Toolchain entry denied');
  const contents=Buffer.from(record.data,'base64');if(contents.toString('base64')!==record.data||sha(contents)!==record.sha256||(size+=contents.length)>limit)throw Error('Toolchain bytes unavailable');
  names.add(file);files.push({file,contents,mode:record.mode});
 }
 let root,closed=false;
 const close=async()=>{if(root&&!closed){await rm(root,{recursive:true,force:true});closed=true;}};
 try{root=await mkdtemp(path.join(parent,'stateatom-list-tools-'));for(const {file,contents,mode}of files){const target=path.join(root,file);await mkdir(path.dirname(target),{recursive:true,mode:0o700});await writeFile(target,contents,{flag:'wx',mode});}return{root,digest:sha(bytes),close};}catch(error){await close();throw error;}
}
