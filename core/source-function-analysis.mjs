// SPDX-License-Identifier: Apache-2.0
// Transient explicit-provider adapter for the shared resolver; no native attestation.
import {createReadOnlySourceProvider} from './source-provider.mjs';
import {analyzeMappedFunction} from './action-analysis-pure.mjs';
export const SOURCE_ANALYSIS_RESULT_BYTES=65536;
const enc=new TextEncoder(),keys=(v,n)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===n.slice().sort().join(',');
export function sourceAnalysisGap(reason,status='Unavailable'){return{schema:'stateatom.source-function-analysis/1',status,entry:null,calls:[],identifiers:[],expression:null,graph:{nodes:[],edges:[]},execution:'not-observed',runtimeValues:'Unavailable',propertyProducer:'Unknown/Unsupported',httpOrigin:'Unknown/Unsupported',scope:'Bounded lexical source relationships only; not a complete call graph or runtime observation',gaps:[reason]};}
export async function analyzeExplicitSource(input,{signal}={}){
 let provider;try{
  if(signal?.aborted)return sourceAnalysisGap('Source analysis cancelled','Cancelled');
  if(!keys(input,['schema','serialized','point','identity'])||input.schema!=='stateatom.source-analysis-input/1'||!keys(input.point,['file','line','column'])||!keys(input.identity,['run','build'])||typeof input.identity.run!=='string'||!input.identity.run||input.identity.run.length>160||typeof input.identity.build!=='string'||!/^[a-f\d]{64}$/i.test(input.identity.build)||typeof input.point.file!=='string'||!Number.isSafeInteger(input.point.line)||input.point.line<1||!Number.isSafeInteger(input.point.column)||input.point.column<0)return sourceAnalysisGap('Invalid explicit source-analysis input');
  provider=await createReadOnlySourceProvider(input.serialized,{signal});
  const files=provider.list().map(meta=>{const f=provider.read(meta.key);return{file:meta.key,importName:meta.source,text:f.content,sourceDigest:meta.sourceDigest};});
  if(signal?.aborted)return sourceAnalysisGap('Source analysis cancelled','Cancelled');
  const result=analyzeMappedFunction(files,input.point,input.identity);
  if(enc.encode(JSON.stringify(result)).length>SOURCE_ANALYSIS_RESULT_BYTES)return sourceAnalysisGap('Source analysis result budget exceeded','Budget');
  return result;
 }catch{return sourceAnalysisGap(signal?.aborted?'Source analysis cancelled':'Explicit source analysis unavailable',signal?.aborted?'Cancelled':'Unavailable');}
 finally{provider?.close();}
}
