// SPDX-License-Identifier: Apache-2.0
// Private source channel only. Binary references occur at declared positions,
// never via magic properties inside owner-supplied map/source JSON.
import {ARCHIVE_LIMITS} from './source-map-archive.mjs';
import {sourceParseError,validSourceParseResult} from './source-parse-contract.mjs';
export const SOURCE_PARSE_WIRE_BYTES=32*1024*1024;
const fail=()=>sourceParseError('SOURCE_PARSE_INVALID'),budget=()=>sourceParseError('SOURCE_PARSE_BUDGET');
export function encodeSourceBytes(bytes){if(!(bytes instanceof Uint8Array)||bytes.length>ARCHIVE_LIMITS.expanded)throw fail();let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(text);}
export function decodeSourceBytes(text,limit){
 if(typeof text!=='string'||!Number.isSafeInteger(limit)||limit<0||text.length>4*Math.ceil(limit/3))throw budget();
 if(text.length%4||/[^A-Za-z0-9+/=]/.test(text)||text.indexOf('=')>=0&&!/^={1,2}$/.test(text.slice(text.indexOf('='))))throw fail();
 let raw;try{raw=atob(text);}catch{throw fail();}if(raw.length>limit)throw budget();const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes;
}
function bounded(wire){let n;try{n=new TextEncoder().encode(JSON.stringify(wire)).length;}catch{throw fail();}if(n>SOURCE_PARSE_WIRE_BYTES)throw budget();}
export function packSourceParseResult(result){
 if(!validSourceParseResult(result,result?.kind))throw fail();const blobs=[],ids=new Map();
 const binary=b=>{if(!ids.has(b)){ids.set(b,blobs.length);blobs.push(encodeSourceBytes(b));}return ids.get(b);};
 let value=result.value;if(result.kind==='archive')value=value.map(([path,b])=>[path,binary(b)]);
 else if(result.kind==='bundle')value=value.map(e=>({mapId:e.mapId,mapIndex:binary(e.mapBytes),...(e.asset?{asset:e.asset,assetIndex:binary(e.assetBytes),releaseId:e.releaseId,manifestDigest:e.manifestDigest}:{})}));
 const wire={kind:result.kind,value,blobs};bounded(wire);return wire;
}
export function unpackSourceParseResult(wire,operation){
 if(!wire||Object.keys(wire).sort().join(',')!=='blobs,kind,value'||wire.kind!==operation||!Array.isArray(wire.blobs)||wire.blobs.length>ARCHIVE_LIMITS.files)throw fail();bounded(wire);
 let total=0;const blobs=wire.blobs.map(s=>{const b=decodeSourceBytes(s,ARCHIVE_LIMITS.entry);total+=b.length;if(total>ARCHIVE_LIMITS.expanded)throw budget();return b;}),used=new Set();
 const binary=i=>{if(!Number.isSafeInteger(i)||i<0||i>=blobs.length)throw fail();used.add(i);return blobs[i];};
 let value=wire.value;
 if(operation==='archive'){if(!Array.isArray(value))throw fail();value=value.map(e=>{if(!Array.isArray(e)||e.length!==2)throw fail();return[e[0],binary(e[1])];});}
 else if(operation==='bundle'){if(!Array.isArray(value))throw fail();value=value.map(e=>{if(!e||Object.keys(e).sort().join(',')!==(e.asset?'asset,assetIndex,manifestDigest,mapId,mapIndex,releaseId':'mapId,mapIndex'))throw fail();return{mapId:e.mapId,mapBytes:binary(e.mapIndex),...(e.asset?{asset:e.asset,assetBytes:binary(e.assetIndex),releaseId:e.releaseId,manifestDigest:e.manifestDigest}:{})};});}
 if(used.size!==blobs.length)throw fail();const result={kind:operation,value};if(!validSourceParseResult(result,operation))throw fail();return result;
}
