// SPDX-License-Identifier: Apache-2.0
// Original acquisition model. Compiler facts remain separate from invocation/effects.
import {createHash,randomUUID} from 'node:crypto';
import {types} from 'node:util';
export const compilerHash=x=>createHash('sha256').update(x).digest('hex');
const limits={maxPipelines:128,maxResults:256,maxReceipts:256,maxString:2*1024*1024,maxBytes:8*1024*1024};
const ownDescriptor=Object.getOwnPropertyDescriptor,hasOwn=Object.hasOwn,parseJSON=JSON.parse;
const dataValue=(r,key)=>{if(!r||types.isProxy(r))return;const d=ownDescriptor(r,key);return d&&hasOwn(d,'value')?d.value:undefined;};
const codeOf=r=>dataValue(r,'code');
const scope={fullPath:false,sourceEquivalence:'Unknown/Unsupported',completeCompilerInputs:false,invocation:'Unknown/Unsupported',readonlyEffects:'Unknown/Unsupported',responseCreator:'Unknown/Unsupported',currentFieldAncestry:'Unknown/Unsupported',scope:'Trusted Node acquisition of one workspace compiler pipeline and exact wire/compiled content correspondence only; not response creator, execution, complete inputs/history, effects, ownership or product authority.'};
function envelope(code,body){if(code===body)return 'Exact final code';if(!body.startsWith(code))return null;const tail=body.slice(code.length),match=/^\n\/\/# sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/]+={0,2})$/.exec(tail);if(!match)return null;try{const bytes=Buffer.from(match[1],'base64');if(bytes.toString('base64')!==match[1])return null;const m=parseJSON(bytes.toString('utf8'));return dataValue(m,'version')===3&&typeof dataValue(m,'mappings')==='string'&&Array.isArray(dataValue(m,'sources'))?'Exact final code plus one inert inline-sourcemap comment':null;}catch{return null;}}
export function compilerLedger(workspace,options={}){
 const cap=Object.fromEntries(Object.entries(limits).map(([k,v])=>[k,Number.isInteger(options[k])&&options[k]>0&&options[k]<=v?options[k]:v]));
 const session=randomUUID(),pipelines=new WeakMap(),results=new WeakMap(),receipts=new WeakMap(),records=[],gaps=new Set();let generation=0,processedBytes=0,pipelineCount=0,resultCount=0,receiptCount=0;
 const gap=reason=>gaps.add(reason),unknown=(reason,status='Unknown/Unsupported')=>({status,reason,...scope});
 const digest=text=>{if(typeof text!=='string'||Buffer.byteLength(text)>cap.maxString){gap('Source/string budget');return null;}const bytes=Buffer.byteLength(text);if(processedBytes+bytes>cap.maxBytes){gap('Source/processing byte budget');return null;}processedBytes+=bytes;return compilerHash(text);};
 const begin=(id,input)=>{const source=workspace[id];if(!source)return null;if(++pipelineCount>cap.maxPipelines){gap('Pipeline budget');return null;}const token={},p={pipelineId:randomUUID(),generation,id,file:source.file,workspaceDigest:source.digest,inputDigest:digest(input),stages:[],finished:false,failed:false};pipelines.set(token,p);records.push(p);return token;};
 const stage=(token,input,output)=>{const p=pipelines.get(token);if(!p||p.finished||p.failed)return;if(p.stages.length>=2){p.failed=true;return;}p.stages.push({inputDigest:digest(input),outputDigest:digest(output)});};
 const finish=(token,output)=>{const p=pipelines.get(token);if(!p||p.finished){if(p)p.failed=true;return;}p.finalDigest=digest(output);p.finished=true;};
 const fail=token=>{const p=pipelines.get(token);if(p)p.failed=true;};
 const seal=(result,id,tokens)=>{if(!result||types.isProxy(result)||results.has(result))return;const code=codeOf(result);if(typeof code!=='string'||Buffer.byteLength(code)>cap.maxString)return;const hash=digest(code);if(!hash)return;const candidates=tokens.map(t=>pipelines.get(t)).filter(p=>p&&p.generation===generation&&p.id===id&&p.finished&&!p.failed&&p.finalDigest===hash&&p.stages.length===1&&p.inputDigest===p.workspaceDigest&&p.stages[0].inputDigest===p.workspaceDigest&&p.stages[0].outputDigest);if(candidates.length!==1)return;if(++resultCount>cap.maxResults){gap('Result budget');return;}results.set(result,{...candidates[0],stages:candidates[0].stages.map(s=>({...s}))});};
 const receipt=(result,body,url)=>{
  if(++receiptCount>cap.maxReceipts){gap('Receipt budget');return unknown('Receipt budget');}
  const p=results.get(result);let r;
  if(!p)r=unknown('No exact sealed native result object');
  else if(p.generation!==generation)r=unknown('Compiler generation changed','Stale');
  else if(digest(codeOf(result))!==p.finalDigest)r=unknown('Sealed native result code changed');
  else if(gaps.size)r=unknown([...gaps].join('; '));
  else{const hash=digest(body),wire=hash&&envelope(codeOf(result),body);r=!wire?unknown('Wire bytes are not the exact native code/envelope'):{status:'Observed',session,receiptId:randomUUID(),pipelineId:p.pipelineId,generation,url,receiptDigest:hash,bytes:Buffer.byteLength(body),input:{file:p.file,digest:p.workspaceDigest},stageDigest:p.stages[0].outputDigest,finalDigest:p.finalDigest,wireEnvelope:wire,...scope};}
  receipts.set(r,{generation,result:p,claim:{...r,input:r.input?{...r.input}:undefined}});return r;
 };
 const bind=(receipt,script,{mainFrameId}={})=>{
  const own=receipts.get(receipt);if(!own)return unknown('Receipt capability unavailable');
  receipt=own.claim;
  if(own.generation!==generation||receipt.status==='Stale')return unknown('Compiler generation changed','Stale');
  if(gaps.size)return unknown([...gaps].join('; '));if(receipt.status!=='Observed')return unknown(receipt.reason);
  if(!script?.scriptId||script.match!==true||script.hasSourceURL===true||!script.url||script.url!==receipt.url||script.sourceDigest!==receipt.receiptDigest||!script.contextUniqueId||!mainFrameId||script.frameId!==mainFrameId)return unknown('Exact main-frame compiled content correspondence unavailable');
  return {...receipt,input:{...receipt.input},status:'Code-linked',scriptId:script.scriptId,contextUniqueId:script.contextUniqueId,frameId:script.frameId,...scope};
 };
 return {begin,stage,finish,fail,seal,receipt,bind,invalidate(){generation++;},generation:()=>generation,report:()=>({session,generation,pipelines:records.map(p=>({pipelineId:p.pipelineId,generation:p.generation,file:p.file,inputDigest:p.inputDigest,workspaceDigest:p.workspaceDigest,stages:p.stages.map(s=>({...s})),finalDigest:p.finalDigest,finished:p.finished,failed:p.failed})),counts:{pipelines:pipelineCount,results:resultCount,receipts:receiptCount,processedBytes},gaps:[...gaps],...scope})};
}
