// SPDX-License-Identifier: Apache-2.0
import {TraceMap,decodedMap} from '@jridgewell/trace-mapping';
import {parseSourceMap} from './source-maps.mjs';
import {readZip} from './source-map-archive.mjs';
import {sourceParseSpec,sourceParseError,validSourceParseResult} from './source-parse-contract.mjs';
// Internal owned-Worker data, never a public validated-map input or certificate.
export async function runSourceParseJob(request){
 if(!request||Object.keys(request).sort().join(',')!=='bytes,operation'||!(request.bytes instanceof Uint8Array))throw sourceParseError('SOURCE_PARSE_INVALID');
 const {operation,bytes}=request,spec=sourceParseSpec(operation);if(bytes.length>spec.bytes)throw sourceParseError('SOURCE_PARSE_BUDGET');
 if(operation==='archive')return{kind:operation,value:[...await readZip(bytes)]};
 const parsed=await parseSourceMap(bytes);return{kind:operation,value:decodedMap(parsed.trace)};
}
export function restoreSourceMap(value){
 if(!validSourceParseResult({kind:'map',value},'map'))throw sourceParseError('SOURCE_PARSE_INVALID');
 const trace=new TraceMap(value);return{trace,lines:value.mappings,sourceCount:value.sources.length,hasContent:(value.sourcesContent||[]).some(x=>typeof x==='string'),sources:value.sources,sourcesContent:value.sourcesContent||[],sourceRoot:value.sourceRoot||''};
}
