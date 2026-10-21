// SPDX-License-Identifier: Apache-2.0
import {portableSourcePath} from './source-path.mjs';
const fail=(code,message)=>Object.assign(Error(message||code),{code});
const small=(v,n=160)=>typeof v==='string'&&v.length>0&&v.length<=n;
export function parseActionTrace(value,identity,page){
 if(!value||value.schema!==1||!['idle','armed','collecting','complete','partial','expired','cancelled','cleared','stale','stopped'].includes(value.status)||!Array.isArray(value.records)||value.records.length>64||JSON.stringify(value).length>131072)throw fail('ACTION_TRACE_UNAVAILABLE','Invalid bounded action observation');
 if(!value.identity||['run','build','frame'].some(k=>!small(value.identity[k])||value.identity[k]!==identity[k])||value.identity.page!==page)throw fail('STALE_TARGET','Action observation context changed');
 if(value.traceId!==null&&value.traceId!==undefined&&!small(value.traceId,100))throw fail('ACTION_TRACE_UNAVAILABLE');
 if(value.traceId&&!small(value.selectedId,200))throw fail('ACTION_TRACE_UNAVAILABLE','Selected native identity missing');
 const records=[],seen=new Set(),stack=[];let dispatchId=null;
 for(const r of value.records){if(!r||r.sequence!==records.length)throw fail('ACTION_TRACE_UNAVAILABLE');
  if(r.kind==='dispatch'){if(dispatchId||r.eventType!=='click'||r.trusted!==true||!small(r.dispatchId)||!small(r.targetId)||!small(r.selectedId)||r.selectedId!==value.selectedId)throw fail('ACTION_TRACE_UNAVAILABLE');dispatchId=r.dispatchId;records.push({kind:r.kind,sequence:r.sequence,dispatchId,eventType:'click',trusted:true,targetId:r.targetId,selectedId:r.selectedId});}
  else if(r.kind==='body-entry'){const s=r.source;if(!dispatchId||r.dispatchId!==dispatchId||!small(r.activationId)||seen.has(r.activationId)||!small(r.siteId)||!small(r.currentTargetId)||(r.parentActivationId??null)!==(stack.at(-1)??null)||!s||!portableSourcePath(s.file)||!/^[a-f0-9]{64}$/.test(s.sourceDigest)||!['line','column','endLine','endColumn'].every(k=>Number.isSafeInteger(s[k])&&s[k]>0)||!small(s.symbol,256))throw fail('ACTION_TRACE_UNAVAILABLE');seen.add(r.activationId);stack.push(r.activationId);records.push({kind:r.kind,sequence:r.sequence,dispatchId,activationId:r.activationId,siteId:r.siteId,currentTargetId:r.currentTargetId,parentActivationId:r.parentActivationId??null,source:{file:s.file,line:s.line,column:s.column,endLine:s.endLine,endColumn:s.endColumn,sourceDigest:s.sourceDigest,symbol:s.symbol}});}
  else if(r.kind==='body-leave'){if(!dispatchId||!stack.length||!small(r.activationId)||r.dispatchId!==dispatchId||r.activationId!==stack.at(-1)||!['return','throw'].includes(r.completion))throw fail('ACTION_TRACE_UNAVAILABLE');stack.pop();records.push({kind:r.kind,sequence:r.sequence,dispatchId,activationId:r.activationId,completion:r.completion});}else throw fail('ACTION_TRACE_UNAVAILABLE');
 }
 if(value.status==='complete'&&(!seen.size||stack.length))throw fail('ACTION_TRACE_UNAVAILABLE','Completed observation has missing body exit');
 return{schema:1,status:value.status,...(['stale','stopped'].includes(value.status)?{freshness:'Stale'}:{}),traceId:value.traceId??null,selectedId:value.selectedId??null,identity:{...identity,page},records,reason:typeof value.reason==='string'?value.reason.slice(0,1024):null,sourceCurrent:false,sessionOnly:true,runtimeFunctionObjectIdentity:'Unavailable',asyncEffects:'Unlinked',completeListenerCoverage:false,actionUndone:false};
}
