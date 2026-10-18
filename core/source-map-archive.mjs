// SPDX-License-Identifier: Apache-2.0
// Strict, memory-only ZIP subset. No paths are extracted or followed.
export const ARCHIVE_LIMITS=Object.freeze({compressed:8*1024*1024,expanded:16*1024*1024,entry:4*1024*1024,files:128,ms:2000});
export function artifactPath(name){if(typeof name!=='string'||!name||name.length>512||/^[/.]|^[a-z]:|[\\%\u0000-\u001f\u007f]/i.test(name)||name.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Unsafe artifact path');return name;}
const decoder=new TextDecoder('utf-8',{fatal:true});
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;}
export async function readZip(input,{signal}={}){
 const b=new Uint8Array(input),v=new DataView(b.buffer,b.byteOffset,b.byteLength),lim=ARCHIVE_LIMITS,deadline=Date.now()+lim.ms;
 const check=()=>{if(signal?.aborted)throw Error('Cancelled');if(Date.now()>deadline)throw Error('Archive time budget');};
 const u16=p=>v.getUint16(p,true),u32=p=>v.getUint32(p,true);
 if(b.length>lim.compressed||b.length<22)throw Error('Archive size budget');
 let end=b.length-22;for(;end>=Math.max(0,b.length-65557);end--)if(u32(end)===0x06054b50&&end+22+u16(end+20)===b.length)break;
 if(end<0||u32(end)!==0x06054b50||u16(end+4)||u16(end+6)||u16(end+8)!==u16(end+10))throw Error('Unsupported ZIP');
 const count=u16(end+10),start=u32(end+16),size=u32(end+12);if(count>lim.files||start+size!==end)throw Error('Archive directory budget');
 let p=start,total=0;const records=[],names=new Set(),ranges=[];
 for(let i=0;i<count;i++){check();if(p+46>end||u32(p)!==0x02014b50)throw Error('Invalid ZIP directory');
  const flags=u16(p+8),method=u16(p+10),crc=u32(p+16),compressed=u32(p+20),expanded=u32(p+24),nl=u16(p+28),el=u16(p+30),cl=u16(p+32),off=u32(p+42),attrs=u32(p+38);
  if(p+46+nl+el+cl>end||u16(p+34)||flags&~0x808||![0,8].includes(method)||(attrs>>>16&0xf000)===0xa000)throw Error('Unsupported ZIP entry');
  const rawName=decoder.decode(b.subarray(p+46,p+46+nl)),directory=rawName.endsWith('/'),name=artifactPath(directory?rawName.slice(0,-1):rawName)+(directory?'/':'');if(directory&&expanded!==0)throw Error('Invalid ZIP directory entry');if(names.has(name))throw Error('Duplicate ZIP entry');names.add(name);
  total+=expanded;if(expanded>lim.entry||total>lim.expanded||compressed>lim.compressed)throw Error('Archive expansion budget');
  if(off+30>start||u32(off)!==0x04034b50||u16(off+6)!==flags||u16(off+8)!==method)throw Error('Invalid ZIP local entry');
  const begin=off+30+u16(off+26)+u16(off+28),stop=begin+compressed;
  if(begin>start||stop>start||decoder.decode(b.subarray(off+30,off+30+u16(off+26)))!==name||(!(flags&8)&&(u32(off+14)!==crc||u32(off+18)!==compressed||u32(off+22)!==expanded))||ranges.some(([a,z])=>off<z&&stop>a))throw Error('Conflicting ZIP entries');
  ranges.push([off,stop]);records.push({name,begin,stop,method,expanded,crc,directory});p+=46+nl+el+cl;
 }if(p!==end)throw Error('Invalid ZIP directory size');
 const files=new Map();
 for(const r of records){check();let data=b.slice(r.begin,r.stop);
  if(r.method===8){
   const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')),reader=stream.getReader(),chunks=[];let n=0;
   const timer=setTimeout(()=>{void reader.cancel();},Math.max(1,deadline-Date.now()));
   try{for(;;){const part=await reader.read();check();if(part.done)break;n+=part.value.length;if(n>r.expanded||n>lim.entry)throw Error('Archive expansion budget');chunks.push(part.value);}data=new Uint8Array(n);let pos=0;for(const c of chunks){data.set(c,pos);pos+=c.length;}}finally{clearTimeout(timer);await reader.cancel().catch(()=>{});}
  }
  if(data.length!==r.expanded||crc32(data)!==r.crc)throw Error('ZIP size/checksum mismatch');if(!r.directory)files.set(r.name,data);
 }return files;
}
