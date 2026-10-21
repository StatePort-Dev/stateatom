// SPDX-License-Identifier: Apache-2.0
import {MAP_LIMITS} from './source-maps.mjs';
import {ARCHIVE_LIMITS,artifactPath} from './source-map-archive.mjs';
export const SOURCE_PARSE_REQUEST='stateatom.source-parse-request/1';
export const SOURCE_PARSE_REPLY='stateatom.source-parse-reply/1';
const reasons=Object.freeze({SOURCE_PARSE_INVALID:'Source artifact parsing failed validation',SOURCE_PARSE_UNSUPPORTED:'Unsupported source map (flat v3 only)',SOURCE_PARSE_BUDGET:'Source artifact parsing exceeded a budget',SOURCE_PARSE_CANCELLED:'Source artifact parsing cancelled',SOURCE_PARSE_UNAVAILABLE:'Source artifact parsing unavailable'});
export const sourceParseError=code=>Object.assign(Error(reasons[code]||reasons.SOURCE_PARSE_INVALID),{code:Object.hasOwn(reasons,code)?code:'SOURCE_PARSE_INVALID'});
export function sourceParseSpec(operation){if(operation==='map')return{bytes:MAP_LIMITS.bytes,ms:MAP_LIMITS.ms};if(operation==='archive')return{bytes:ARCHIVE_LIMITS.compressed,ms:ARCHIVE_LIMITS.ms};throw sourceParseError('SOURCE_PARSE_INVALID');}
export function validSourceParseResult(result,operation){try{
 if(!result||Object.keys(result).sort().join(',')!=='kind,value'||result.kind!==operation)return false;
 const v=result.value;
 if(operation==='map')return !!v&&v.version===3&&Array.isArray(v.sources)&&v.sources.length<=MAP_LIMITS.sources&&Array.isArray(v.names)&&v.names.length<=50000&&Array.isArray(v.mappings)&&v.mappings.length<=MAP_LIMITS.lines&&(v.sourcesContent===undefined||v.sourcesContent===null||Array.isArray(v.sourcesContent)&&v.sourcesContent.length===v.sources.length);
 if(operation!=='archive'||!Array.isArray(v)||v.length>ARCHIVE_LIMITS.files)return false;
 let n=0;const names=new Set();for(const e of v){if(!Array.isArray(e)||e.length!==2||!(e[1] instanceof Uint8Array)||e[1].length>ARCHIVE_LIMITS.entry)return false;artifactPath(e[0]);if(names.has(e[0]))return false;names.add(e[0]);n+=e[1].length;}return n<=ARCHIVE_LIMITS.expanded;
 }catch{return false;}}
