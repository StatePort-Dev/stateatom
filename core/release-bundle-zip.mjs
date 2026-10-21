// SPDX-License-Identifier: Apache-2.0
// Node-only producer for the existing memory-only ZIP import format.
import {deflateRawSync} from 'node:zlib';
import {ARCHIVE_LIMITS,artifactPath} from './source-map-archive.mjs';
export function releaseArtifactPath(name){artifactPath(name);if(!name.isWellFormed())throw Error('Invalid Unicode artifact path');return name;}
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return(crc^0xffffffff)>>>0;}
export function releaseZip(files,{signal}={}){
 const check=()=>{if(signal?.aborted)throw Error('Release bundle cancelled');};check();
 const lim=ARCHIVE_LIMITS;if(files.size<1||files.size>lim.files)throw Error('Archive entry count budget');
 const local=[],central=[];let offset=0,expanded=0,zipSize=22;
 for(const name of [...files.keys()].sort()){
  check();releaseArtifactPath(name);const filename=Buffer.from(name),original=files.get(name);expanded+=original.length;
  if(original.length>lim.entry)throw Error('Archive entry size budget');if(expanded>lim.expanded)throw Error('Archive expansion budget');
  const compressed=deflateRawSync(original,{level:9});check();zipSize+=30+46+2*filename.length+compressed.length;if(zipSize>lim.compressed)throw Error('Archive compressed size budget');
  const crc=crc32(original),header=Buffer.alloc(30),directory=Buffer.alloc(46);
  header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(0x21,12);
  header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(original.length,22);header.writeUInt16LE(filename.length,26);
  directory.writeUInt32LE(0x02014b50);directory.writeUInt16LE(0x314,4);directory.writeUInt16LE(20,6);directory.writeUInt16LE(0x800,8);directory.writeUInt16LE(8,10);directory.writeUInt16LE(0x21,14);
  directory.writeUInt32LE(crc,16);directory.writeUInt32LE(compressed.length,20);directory.writeUInt32LE(original.length,24);directory.writeUInt16LE(filename.length,28);directory.writeUInt32LE((0o100600*65536)>>>0,38);directory.writeUInt32LE(offset,42);
  local.push(header,filename,compressed);central.push(directory,filename);offset+=header.length+filename.length+compressed.length;
 }
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...local,directory,end]);
}
