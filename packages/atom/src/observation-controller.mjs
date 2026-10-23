// SPDX-License-Identifier: Apache-2.0
// Inert per-view controller. Native identity, limits and authority stay in runtime.
const error=(code,message=code)=>Object.assign(Error(message),{code}),clone=x=>structuredClone(x),uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(x);
export function createObservationController({client,onChange=()=>{}}={}){
 if(typeof client?.request!=='function'||typeof onChange!=='function')throw error('INVALID_PLATFORM');
 const ownerId=crypto.randomUUID();let tabId=null,noticeTabId=null,window=null,pending=null,cleanup=null,epoch=0,disposed=false,connectionLost=false,failure=null;
 const snapshot=()=>clone({ownerId,tabId,noticeTabId,window,busy:!!pending||!!cleanup,operation:pending?.op??null,connectionLost,error:failure});
 const emit=()=>{if(!disposed)try{onChange(snapshot());}catch{}};
 function alive(){if(disposed)throw error('DISPOSED');if(connectionLost)throw error('INSPECTOR_DISCONNECTED');}
 function valid(value,op,id){if(op==='observation-clear'){if(value?.status!=='deleted'||value.windowId!==null)throw error('INVALID_OBSERVATION_REPLY');return null;}if(value?.schema!=='stateatom.production-observation/1'||value.executable!==false||value.exportable!==false||!uuid(value.windowId)||!['recording','stopped'].includes(value.status)||id&&value.windowId!==id||op==='observation-stop'&&value.status!=='stopped')throw error('INVALID_OBSERVATION_REPLY');return clone(value);}
 async function perform(op,id=tabId){
  alive();if(pending||cleanup)throw error('BUSY','Wait for the current observation operation');
  if(op!=='observation-start'&&!window)throw error('OBSERVATION_REQUIRED','Start a bounded window first');
  if(op==='observation-checkpoint'&&window.status!=='recording')throw error('OBSERVATION_STOPPED','Start another window for a new sampled read');
  if(op==='observation-stop'&&window.status==='stopped')return snapshot();
  const token={epoch:++epoch,op,abort:new AbortController()},windowId=window?.windowId;pending=token;noticeTabId=id;failure=null;emit();
  try{
   const reply=await client.request({op,tabId:id,ownerId,...(op==='observation-start'?{}:{windowId})},{signal:token.abort.signal});
   if(token.epoch!==epoch||token.abort.signal.aborted)throw error('CANCELLED');alive();const next=valid(reply,op,op==='observation-start'?null:windowId);tabId=next?id:null;window=next;return snapshot();
  }catch(e){if(token.epoch!==epoch||token.abort.signal.aborted)throw error('CANCELLED');failure={code:e.code||'OPERATION_FAILED',message:String(e.message||e.code||'Observation operation failed').slice(0,1024)};throw e;}
  finally{if(pending===token){pending=null;emit();}}
 }
 function start(options){
  const descriptors=options&&Object.getOwnPropertyDescriptors(options);if(!descriptors||Reflect.ownKeys(descriptors).length!==1||!Object.hasOwn(descriptors,'tabId')||!Object.hasOwn(descriptors.tabId,'value')||!Number.isSafeInteger(descriptors.tabId.value)||descriptors.tabId.value<1)return Promise.reject(error('INVALID_MESSAGE'));
  return perform('observation-start',descriptors.tabId.value);
 }
 function cancel({forget=false,reason}={}){
  if(cleanup)return cleanup.then(()=>{if(forget){tabId=null;noticeTabId=null;window=null;emit();}return snapshot();});
  const old=pending;epoch++;old?.abort.abort();pending=null;if(old?.op==='observation-start'){window=null;tabId=null;}
  const selected=window,selectedTab=tabId,at=epoch;
  if(!selected||selected.status!=='recording'||connectionLost){if(forget){tabId=null;noticeTabId=null;window=null;}emit();return Promise.resolve(snapshot());}
  let finish;cleanup=new Promise(r=>finish=r);const closing=cleanup;emit();
  void (async()=>{try{const reply=await client.request({op:'observation-stop',tabId:selectedTab,ownerId,windowId:selected.windowId,...(reason?{reason}:{})});if(epoch===at&&!connectionLost&&window?.windowId===selected.windowId)window=valid(reply,'observation-stop',selected.windowId);}catch(e){if(epoch===at&&!connectionLost)failure={code:e.code||'OPERATION_FAILED',message:String(e.message||'Stop was not confirmed').slice(0,1024)};}finally{if(forget&&epoch===at){tabId=null;noticeTabId=null;window=null;}cleanup=null;emit();finish(snapshot());}})();return closing;
 }
 function advances(before,after){
  if(before.status==='stopped'&&after.status!=='stopped'||after.records.length<before.records.length||(after.lastObservedAt??-1)<(before.lastObservedAt??-1))return false;
  for(const k of Object.keys(before.counts))if(after.counts[k]<before.counts[k])return false;for(const k of Object.keys(before.gaps))if(after.gaps[k]<before.gaps[k])return false;
  for(const [i,row] of before.records.entries()){const next=after.records[i];if(!next||next.id!==row.id||next.kind!==row.kind)return false;if(row.kind==='network'){if(row.responseAt!==null&&next.responseAt!==row.responseAt||row.endedAt!==null&&(next.endedAt!==row.endedAt||next.completion!==row.completion))return false;}else if(JSON.stringify(next)!==JSON.stringify(row))return false;}
  return true;
 }
 function update(state){
  if(disposed||connectionLost||pending||cleanup||!window||state?.tabId!==tabId||state.productionObservation?.windowId!==window.windowId)return;
  let next;try{next=valid(state.productionObservation,'observation-read',window.windowId);if(!advances(window,next))return;}catch{return;}
  if(JSON.stringify(next)!==JSON.stringify(window)){window=next;emit();}
 }
 const off=client.subscribeConnection?.(()=>{if(disposed||connectionLost)return;connectionLost=true;failure={code:'INSPECTOR_DISCONNECTED',message:'Inspector connection ended. Collection cannot be resumed here.'};epoch++;pending?.abort.abort();pending=null;emit();})||(()=>{});
 function dispose(){if(disposed)return cleanup||Promise.resolve(snapshot());const result=cancel({forget:true});disposed=true;off();return result;}
 return Object.freeze({snapshot,start,checkpoint:()=>perform('observation-checkpoint'),stop:()=>perform('observation-stop'),clear:()=>perform('observation-clear'),cancel,contextChanged:(reason='context-changed')=>['context-changed','tab-switch'].includes(reason)?cancel({forget:true,reason}):Promise.reject(error('INVALID_MESSAGE')),update,dispose});
}
