// SPDX-License-Identifier: Apache-2.0
import {TraceMap,originalPositionFor,traceSegment} from '@jridgewell/trace-mapping';
import {readZip,artifactPath} from './source-map-archive.mjs';
export const MAP_LIMITS=Object.freeze({bytes:4*1024*1024,sources:512,sourceBytes:3*1024*1024,segments:250000,lines:100000,ms:1500});
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true}),hex=/^[a-f0-9]{64}$/;
export const sourceDigest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
export function jsonBytes(bytes,limit=MAP_LIMITS.bytes){if(bytes.length>limit)throw Error('Map size budget');try{return JSON.parse(dec.decode(bytes));}catch{throw Error('Invalid UTF-8 JSON artifact');}}
// Validate before invoking the maintained lookup implementation. Its decoder is deliberately permissive.
export async function parseSourceMap(bytes){
 const m=jsonBytes(bytes),lim=MAP_LIMITS,deadline=Date.now()+lim.ms;
 if(!m||m.version!==3||m.sections||!Array.isArray(m.sources)||!Array.isArray(m.names)||typeof m.mappings!=='string')throw Error('Unsupported source map (flat v3 only)');
 if(m.sources.length>lim.sources||m.names.length>50000||m.mappings.length>2000000)throw Error('Map structure budget');
 if(m.sources.some(x=>typeof x!=='string'||x.length>2048)||m.names.some(x=>typeof x!=='string'||x.length>2048)||m.sourceRoot!==undefined&&(typeof m.sourceRoot!=='string'||m.sourceRoot.length>2048))throw Error('Invalid map names');
 if(m.sourcesContent!==undefined&&(!Array.isArray(m.sourcesContent)||m.sourcesContent.length!==m.sources.length||m.sourcesContent.some(x=>x!==null&&typeof x!=='string')))throw Error('Invalid source content');
 if((m.sourcesContent||[]).reduce((n,x)=>n+(x?enc.encode(x).length:0),0)>lim.sourceBytes)throw Error('Source content budget');
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',lines=[[]];let source=0,originalLine=0,originalColumn=0,name=0,column=0,count=0,i=0;
 function vlq(){let value=0,power=1,more=true,digits=0;while(more){const digit=alphabet.indexOf(m.mappings[i++]??'?');if(digit<0||++digits>7)throw Error('Malformed mapping VLQ');more=!!(digit&32);value+=(digit&31)*power;power*=32;if(!Number.isSafeInteger(value)||value>4294967295)throw Error('Mapping integer budget');}return value%2?-(Math.floor(value/2)):Math.floor(value/2);}
 while(i<m.mappings.length){const ch=m.mappings[i];if(ch===';'){if(lines.length>=lim.lines)throw Error('Mapping line budget');lines.push([]);column=0;i++;continue;}if(ch===',')throw Error('Empty mapping segment');
  const vals=[];do{vals.push(vlq());if(vals.length>5)throw Error('Invalid mapping segment');}while(i<m.mappings.length&&m.mappings[i]!==','&&m.mappings[i]!==';');
  if(![1,4,5].includes(vals.length))throw Error('Invalid mapping segment');column+=vals[0];const line=lines.at(-1);if(column<0||column>4000000||(line.length&&column<=line.at(-1)[0]))throw Error('Invalid generated range');
  const seg=[column];if(vals.length>1){source+=vals[1];originalLine+=vals[2];originalColumn+=vals[3];if(source<0||source>=m.sources.length||originalLine<0||originalLine>lim.lines||originalColumn<0||originalColumn>lim.bytes)throw Error('Invalid original range');seg.push(source,originalLine,originalColumn);if(vals.length===5){name+=vals[4];if(name<0||name>=m.names.length)throw Error('Invalid name index');seg.push(name);}}
  line.push(seg);if(++count>lim.segments||Date.now()>deadline)throw Error('Mapping parse budget');if(m.mappings[i]===','){i++;if(i===m.mappings.length||m.mappings[i]===';'||m.mappings[i]===',')throw Error('Empty mapping segment');}
 }
 const trace=new TraceMap({...m,mappings:lines});return {trace,lines,sourceCount:m.sources.length,hasContent:(m.sourcesContent||[]).some(x=>typeof x==='string'),sources:m.sources,sourcesContent:m.sourcesContent||[],sourceRoot:m.sourceRoot||''};
}
export function validateManifest(m){if(!m||m.schemaVersion!==1||typeof m.releaseId!=='string'||m.releaseId.length>128||!Array.isArray(m.assets)||m.assets.length>64)throw Error('Unsupported release manifest');const seen=new Set();for(const a of m.assets){artifactPath(a.asset);artifactPath(a.sourceMap);if(seen.has(a.asset)||!hex.test(a.assetSha256)||!hex.test(a.sourceMapSha256))throw Error('Invalid release asset');seen.add(a.asset);}return m;}
export async function readSourceBundle(bytes,name,{signal}={}){
 if(!/\.zip$/i.test(name))return [{mapBytes:bytes}];
 const files=await readZip(bytes,{signal});const manifestBytes=files.get('manifest.json');
 if(!manifestBytes){const maps=[...files].filter(([p])=>p.endsWith('.map'));if(!maps.length||maps.length>16)throw Error('Choose a bundle with maps');return maps.map(([mapId,mapBytes])=>({mapId,mapBytes}));}
 const m=validateManifest(jsonBytes(manifestBytes)),manifestDigest=await sourceDigest(manifestBytes);return m.assets.map(asset=>{const mapBytes=files.get(asset.sourceMap),assetBytes=files.get(asset.asset);if(!mapBytes||!assetBytes)throw Error('Manifest artifact missing from bundle');return {mapId:asset.sourceMap,mapBytes,assetBytes,asset,releaseId:m.releaseId,manifestDigest};});
}
const copiedBytes=value=>{const view=ArrayBuffer.isView(value)?new Uint8Array(value.buffer,value.byteOffset,value.byteLength):new Uint8Array(value);return view.slice();};
async function prepareArtifacts(bundles,check=()=>{}){
 const maps=new Map(),records=[];
 for(const bundle of bundles){
  check();const raw=copiedBytes(bundle.mapBytes);if(raw.length>MAP_LIMITS.bytes)throw Error('Map size budget');
  const assetBytes=bundle.asset&&bundle.assetBytes?copiedBytes(bundle.assetBytes):null,mapDigest=await sourceDigest(raw);check();
  let map=maps.get(mapDigest);if(!map){map={bytes:raw,digest:mapDigest,parsed:null};maps.set(mapDigest,map);}
  const asset=assetBytes?{assetSha256:bundle.asset.assetSha256,sourceMapSha256:bundle.asset.sourceMapSha256}:null,assetDigest=assetBytes?await sourceDigest(assetBytes):null;check();let textDigest;
  if(assetBytes)try{textDigest=await sourceDigest(enc.encode(dec.decode(assetBytes)));}catch{/* Non-UTF-8 bytes cannot establish a loaded text match. */}
  check();records.push({map,asset,assetDigest,textDigest,manifestDigest:bundle.manifestDigest||null,releaseId:bundle.releaseId?String(bundle.releaseId).slice(0,128):null});
 }
 return{maps,records};
}
function artifactAssociation(script,record,parsed){
 const {map,asset,assetDigest,textDigest}=record,mapDigest=map.digest;let status='Unverified',reason='Map association has no verified release artifact; filenames are insufficient';
 if(asset){
  if(assetDigest!==asset.assetSha256||mapDigest!==asset.sourceMapSha256||script.digest&&textDigest!==script.digest){status='Mismatch';reason='Loaded script or selected artifact digest conflicts with the release manifest';}
  else if(script.digest&&script.digestDomain==='utf8-script-source'&&script.startLine===0&&script.startColumn===0&&!script.special){status='Exact artifact match';reason='User-selected release artifact bytes and map verified; UTF-8 script content matches this loaded script';}
 }
 if(script.endLine!==undefined&&parsed.lines.some((line,i)=>line.some(seg=>i>script.endLine-script.startLine||i===script.endLine-script.startLine&&seg[0]>script.endColumn))){status='Mismatch';reason='Mapping exceeds the loaded script range';}
 return {status,reason,mapDigest,parsed,manifestDigest:record.manifestDigest,verificationMethod:status==='Exact artifact match'?'release-manifest-digests-and-loaded-utf8-script':'unverified-artifact-association',releaseId:record.releaseId};
}
export async function associateSourceMap(script,bundle){
 const {records}=await prepareArtifacts([bundle]),record=records[0],parsed=await parseSourceMap(record.map.bytes);return artifactAssociation(script,record,parsed);
}
// The controller and its prepared records never cross the runtime wire. JS bodies
// are discarded; maps are shared by raw digest and parsed only on explicit use.
export async function createReleaseMapIndex(bundles,{signal,assertCurrent=()=>{}}={}){
 let closed=false,initialized=false;const check=()=>{if(closed||!initialized&&signal?.aborted)throw Error('Release source connection cancelled');if(!initialized)assertCurrent();};
 if(!Array.isArray(bundles)||!bundles.length||bundles.length>64||bundles.some(b=>!b.asset||!b.assetBytes||!b.manifestDigest))throw Error('Explicit release manifest and built artifacts required');
 const {maps,records}=await prepareArtifacts(bundles,check);check();
 const retainedBytes=[...maps.values()].reduce((n,m)=>n+m.bytes.length,0),largestMapBytes=Math.max(...[...maps.values()].map(m=>m.bytes.length));
 if(retainedBytes+largestMapBytes>8*1024*1024)throw Error('Release index and parsed-map cache budget');
 // A connected index outlives the import request and its selected script record.
 // Drop those construction-only references as well as ignoring their lifetime.
 initialized=true;signal=null;assertCurrent=null;
 const matches=digest=>records.filter(r=>typeof digest==='string'&&r.textDigest===digest);
 function find(digest){check();const found=matches(digest);return{status:found.length===1?'Unique':found.length?'Ambiguous':'Missing',count:found.length,...(found.length===1?{mapDigest:found[0].map.digest,mapBytes:found[0].map.bytes.length}:{})};}
 return Object.freeze({
  describe(){const parsed=[...maps.values()].filter(m=>m.parsed);return closed?{status:'Unavailable',assetCount:0,mapCount:0,retainedBytes:0,parsedMaps:0,parsedInputBytes:0}:{status:'Connected',assetCount:records.length,mapCount:maps.size,retainedBytes,largestMapBytes,parsedMaps:parsed.length,parsedInputBytes:parsed.reduce((n,m)=>n+m.bytes.length,0),manifestDigest:records[0].manifestDigest,artifactAuthenticity:'not-established',mapValidation:'lazy'};},
  find,
  async associate(script,{signal:jobSignal,assertCurrent:jobCurrent=()=>{}}={}){
   const current=()=>{check();if(jobSignal?.aborted)throw Error('Release source lookup cancelled');jobCurrent();};
   current();if(script.digestDomain!=='utf8-script-source')throw Error('Loaded UTF-8 script digest required');const found=matches(script.digest);
   if(found.length!==1)throw Object.assign(Error(found.length?'Ambiguous release assets; no unique map for this loaded script':'No matching artifact in this release bundle for the loaded script'),{code:found.length?'AMBIGUOUS_RELEASE_MAP':'NO_RELEASE_MATCH'});
   const record=found[0],parsed=record.map.parsed||await parseSourceMap(record.map.bytes);current();const result=artifactAssociation(script,record,parsed);if(result.status!=='Mismatch')record.map.parsed=parsed;return result;
  },
  release(digest){const m=maps.get(digest);if(m)m.parsed=null;},
  close(){closed=true;for(const m of maps.values())m.parsed=null;records.length=0;maps.clear();}
 });
}
export function sourceExcerpt(content,line,column){
 if(typeof content!=='string'||!Number.isSafeInteger(line)||line<1||!Number.isSafeInteger(column)||column<0)return null;
 // Source-map columns are UTF-16 offsets. CRLF is one JavaScript line break;
 // standalone CR, LF, LS and PS also delimit lines, as in the source analyzer.
 const breaks=/\r\n|[\n\r\u2028\u2029]/g;let start=0;
 for(let n=1;n<line;n++){const next=breaks.exec(content);if(!next)return null;start=breaks.lastIndex;}
 const end=breaks.exec(content)?.index??content.length;if(column>end-start)return null;
 return content.slice(start,end).slice(Math.max(0,column-160),column+480);
}
export function lookupSource(parsed,line,column){
 if(!Number.isSafeInteger(line)||line<1||line>MAP_LIMITS.lines||!Number.isSafeInteger(column)||column<0||column>MAP_LIMITS.bytes)throw Error('Invalid generated position');
 const p=originalPositionFor(parsed.trace,{line,column});if(p.source===null)return {status:'Unavailable',reason:'No mapped segment at this generated position',link:'not linked to element'};
 const index=traceSegment(parsed.trace,line-1,column)[1],content=parsed.sourcesContent[index];
 return {status:'Candidate',sourceIndex:index,source:parsed.sources[index]??p.source,line:p.line,column:p.column,name:p.name,excerpt:sourceExcerpt(content,p.line,p.column),link:'not linked to element',operands:'not observed'};
}
