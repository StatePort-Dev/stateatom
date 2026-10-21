// SPDX-License-Identifier: Apache-2.0
import {portableSourcePath} from '../../../core/diagnostic.mjs';
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
 return{schema:1,status:value.status,traceId:value.traceId??null,selectedId:value.selectedId??null,identity:{...identity,page},records,reason:typeof value.reason==='string'?value.reason.slice(0,1024):null,sourceCurrent:false,sessionOnly:true,runtimeFunctionObjectIdentity:'Unavailable',asyncEffects:'Unlinked',completeListenerCoverage:false,actionUndone:false};
}
// Executed only in the exact recorded MAIN context. No application handler,
// expression, getter, argument or closure is evaluated to obtain observations.
export function actionPageOperation(op,expectedPage,identity,expectedTraceId){
 const own=(o,k)=>Object.getOwnPropertyDescriptor(o,k)?.value,api=own(window,'__STATEATOM__');
 if(!api||own(api,'version')!==1||typeof own(api,'actionTraceRead')!=='function'||typeof own(api,'actionTraceInfo')!=='function')return{ok:false,code:'ACTION_TRACE_UNAVAILABLE'};
 const page=own(api,'page');if(expectedPage&&page!==expectedPage)return{ok:false,code:'STALE_TARGET'};
 const info=api.actionTraceInfo();if(op==='arm'){if(info.available!==true||typeof own(api,'actionTraceArm')!=='function')return{ok:false,code:'ACTION_TRACE_UNAVAILABLE'};return{ok:true,page,trace:api.actionTraceArm(this,identity,{timeoutMs:10000})};}
 const before=api.actionTraceRead();if(before.traceId!==expectedTraceId)return{ok:false,code:'STALE_TARGET'};
 if(op==='cancel')api.actionTraceCancel();else if(op==='clear')api.actionTraceClear();else if(op!=='read')return{ok:false,code:'INVALID_MESSAGE'};
 return{ok:true,page,trace:api.actionTraceRead()};
}
export function createActionTraceController({identity,invoke,guard,onChange=()=>{}}){
 let current=null,page=null,closed=false,serial=Promise.resolve();
 function publish(value){current=value;onChange(value);return value;}
 function queue(fn){const task=serial.then(fn);serial=task.catch(()=>{});return task;}
 async function call(op){if(closed)throw fail('STALE_TARGET','Observation closed');await guard(op);const r=await invoke(op,page,identity,current?.traceId);if(!r?.ok)throw fail(r?.code||'ACTION_TRACE_UNAVAILABLE','Supported action observation is unavailable; enable it in the connected development project');if(!small(r.page))throw fail('ACTION_TRACE_UNAVAILABLE');page=r.page;const parsed=parseActionTrace(r.trace,identity,page);if(current?.traceId&&op!=='arm'&&parsed.traceId&&parsed.traceId!==current.traceId)throw fail('STALE_TARGET');if(current?.selectedId&&parsed.selectedId&&parsed.selectedId!==current.selectedId)throw fail('STALE_TARGET');current=parsed;if(closed)throw fail('STALE_TARGET','Observation closed');await guard(op);return publish(parsed);}
 return Object.freeze({arm:()=>queue(()=>call('arm')),read:()=>queue(()=>call('read')),cancel:()=>queue(()=>call('cancel')),clear:()=>queue(()=>call('clear')),snapshot:()=>current,
  close(reason='Context changed'){if(closed)return Promise.resolve(current);closed=true;return queue(async()=>{try{if(current?.traceId)await invoke('cancel',page,identity,current.traceId);}catch{}if(current)publish({...current,freshness:'Stale',status:'stale',reason});return current;});}
 });
}
