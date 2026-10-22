// SPDX-License-Identifier: Apache-2.0
import {MAP_LIMITS,validateManifest} from './source-maps.mjs';
import {ARCHIVE_LIMITS,artifactPath} from './source-map-archive.mjs';
export const SOURCE_PARSE_REQUEST='stateatom.source-parse-request/1';
export const SOURCE_PARSE_REPLY='stateatom.source-parse-reply/1';
const reasons=Object.freeze({SOURCE_PARSE_INVALID:'Source artifact parsing failed validation',SOURCE_PARSE_UNSUPPORTED:'Unsupported source map (flat v3 only)',SOURCE_PARSE_BUDGET:'Source artifact parsing exceeded a budget',SOURCE_PARSE_CANCELLED:'Source artifact parsing cancelled',SOURCE_PARSE_UNAVAILABLE:'Source artifact parsing unavailable',SOURCE_PARSE_BUSY:'Source parser busy; try again'});
export const sourceParseError=code=>Object.assign(Error(reasons[code]||reasons.SOURCE_PARSE_INVALID),{code:Object.hasOwn(reasons,code)?code:'SOURCE_PARSE_INVALID'});
export function sourceParseSpec(operation){if(['map','manifest'].includes(operation))return{bytes:MAP_LIMITS.bytes,ms:MAP_LIMITS.ms};if(['archive','bundle'].includes(operation))return{bytes:ARCHIVE_LIMITS.compressed,ms:ARCHIVE_LIMITS.ms};throw sourceParseError('SOURCE_PARSE_INVALID');}
function manifest(value){validateManifest(value);return Object.keys(value).sort().join(',')==='assets,releaseId,schemaVersion'&&value.assets.every(a=>Object.keys(a).sort().join(',')==='asset,assetSha256,sourceMap,sourceMapSha256');}
export function validSourceParseResult(result,operation){try{
 if(!result||Object.keys(result).sort().join(',')!=='kind,value'||result.kind!==operation)return false;
 const v=result.value;
 if(operation==='manifest')return v===null||manifest(v);
 if(operation==='bundle'){
  if(!Array.isArray(v)||v.length>64)return false;const seen=new Set();let n=0;
  for(const e of v){if(!e||typeof e!=='object'||Object.keys(e).sort().join(',')!==(e.asset?'asset,assetBytes,manifestDigest,mapBytes,mapId,releaseId':'mapBytes,mapId'))return false;artifactPath(e.mapId);if(!(e.mapBytes instanceof Uint8Array)||e.mapBytes.length>MAP_LIMITS.bytes)return false;const list=[e.mapBytes];if(e.asset){if(!manifest({schemaVersion:1,releaseId:e.releaseId,assets:[e.asset]})||!(e.assetBytes instanceof Uint8Array)||e.assetBytes.length>ARCHIVE_LIMITS.entry||!/^[a-f0-9]{64}$/.test(e.manifestDigest))return false;list.push(e.assetBytes);}else if(e.assetBytes||e.releaseId||e.manifestDigest)return false;for(const b of list)if(!seen.has(b)){seen.add(b);n+=b.length;}}
  return n<=ARCHIVE_LIMITS.expanded;
 }
 if(operation==='map')return !!v&&!Object.keys(v).some(k=>!['version','file','names','sourceRoot','sources','sourcesContent','mappings','ignoreList'].includes(k))&&v.version===3&&Array.isArray(v.sources)&&v.sources.length<=MAP_LIMITS.sources&&Array.isArray(v.names)&&v.names.length<=50000&&Array.isArray(v.mappings)&&v.mappings.length<=MAP_LIMITS.lines&&(v.sourcesContent===undefined||v.sourcesContent===null||Array.isArray(v.sourcesContent)&&v.sourcesContent.length===v.sources.length);
 if(operation!=='archive'||!Array.isArray(v)||v.length>ARCHIVE_LIMITS.files)return false;
 let n=0;const names=new Set();for(const e of v){if(!Array.isArray(e)||e.length!==2||!(e[1] instanceof Uint8Array)||e[1].length>ARCHIVE_LIMITS.entry)return false;artifactPath(e[0]);if(names.has(e[0]))return false;names.add(e[0]);n+=e[1].length;}return n<=ARCHIVE_LIMITS.expanded;
 }catch{return false;}}
