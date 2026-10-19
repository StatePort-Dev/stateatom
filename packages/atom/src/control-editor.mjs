// SPDX-License-Identifier: Apache-2.0
// Selected-target controller. Native writes stay in its private owner and every
// acknowledgement passes the inert ledger before becoming a scoped outcome.
import {createControlLedger} from '../../../core/control-ledger.mjs';
import {parseExperimentPlan} from '../../../core/experiment-plan.mjs';
const error=(code,message=code)=>Object.assign(new Error(message),{code});
const physical=['tabId','origin','run','document','node','selector','property','build'];
export function createControlEditor({investigationId,target,readCurrent,openOwner,onChange=()=>{}}){
 const ledger=createControlLedger({investigationId,target}),notes=[];let owner=null,closed=false,closing=null,serial=Promise.resolve(),cleanup='opening',ownerOpening=false,unsupported=[],truncated=false,published=structuredClone(target),observation={status:'Observed',value:target.value,observedAt:target.observedAt,dependency:'unknown'};
 function snapshot(){return{...ledger.snapshot(),sourceKind:'dom-control',target:structuredClone(published),observation:structuredClone(observation),cleanup,unsupported:structuredClone(unsupported),truncated,notes:structuredClone(notes.slice(-8))};}
 function publish(){try{onChange(snapshot());}catch{}}
 function markClosed(reason){if(closed)return;closed=true;ledger.close(reason);observation={...observation,status:'Stale',reason};publish();}
 function assertOpen(signal){if(closed)throw error('EDITOR_CLOSED');if(signal?.aborted)throw error('CANCELLED');}
 async function current(){
  assertOpen();const fresh=await readCurrent();assertOpen();
  if(!physical.every(k=>fresh.target?.[k]===target[k]))throw error('STALE_TARGET','Selected physical target changed');
  if(fresh.admission?.available!==true||!['read','inject','replay'].every(g=>fresh.admission.grants?.includes(g)))throw error('CAPABILITY_DENIED','Current native input editing authority required');return fresh;
 }
 function observeTarget(fresh){published=structuredClone(fresh.target);observation={status:'Observed',value:published.value,observedAt:published.observedAt,dependency:'unknown'};}
 async function refresh(){
  const before=JSON.stringify(snapshot());await current();const native=await owner.read();assertOpen();if(!native?.ok)throw error(native?.code||'CONTROL_READ_FAILED');const fresh=await current();
  ledger.observeControls(native.resources);unsupported=native.unsupported||[];truncated=native.truncated===true;observeTarget(fresh);if(JSON.stringify(snapshot())!==before)publish();return fresh;
 }
 const ready=(async()=>{
  try{await current();ownerOpening=true;owner=await openOwner({target,verify:()=>current(),onLost:reason=>{cleanup='authority-lost';markClosed(reason);}});if(closed){await owner.close('Opening cancelled');throw error('EDITOR_CLOSED');}cleanup='active';await refresh();return snapshot();}
  catch(e){if(!owner)cleanup=ownerOpening?'unknown':'not-started';markClosed('Native input opening failed');if(owner)try{const result=await owner.close('Opening failed');cleanup=result?.cleanup||'closed';}catch{cleanup='unknown';}throw e;}
 })();void ready.catch(()=>{});
 function queue(fn){const work=serial.then(fn);serial=work.catch(()=>{});return work;}
 function close(reason='Editor closed'){
  markClosed(reason);return closing??=(async()=>{try{await ready.catch(()=>{});if(owner){const result=await owner.close(reason);cleanup=result?.cleanup||'closed';}else if(cleanup!=='unknown')cleanup='not-started';}catch{cleanup='unknown';}publish();return snapshot();})();
 }
 async function read(){return queue(async()=>{await ready;assertOpen();try{await refresh();return snapshot();}catch(e){await close('Current native input target unavailable');throw e;}});}
 function mutation(kind,input,{signal}={}){
  const abort=()=>{void close('Pending native edit cancelled');};signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  return queue(async()=>{
   await ready;assertOpen(signal);let batch=null;
   try{
    const fresh=await refresh();assertOpen(signal);
    if(kind==='apply'){
     const p=parseExperimentPlan(input);if(p.changes.some(c=>c.resource.kind!=='dom-control'))throw error('RESOURCE_UNSUPPORTED','Apply response and form input groups separately');batch=ledger.prepareApply(p,fresh);
    }else batch=ledger[kind==='undo'?'prepareUndo':'prepareBaseline']({...fresh,expectedRevision:input});
    publish();
    for(const change of batch.changes){
     if(closed||signal?.aborted)break;
     let result,dispatched=false;
     try{await current();assertOpen(signal);dispatched=true;result=await owner.write(change.resource,change.value);}
     catch(e){result={ok:false,status:!dispatched||e.nativeDispatched===false?'failed':'unconfirmed',attempted:dispatched&&e.nativeDispatched!==false,code:e.code||'CONTROL_SEND_FAILED'};}
     let status=result?.status==='applied'&&result.ok===true?'applied':result?.attempted===false?'failed':'unconfirmed';
     try{ledger.confirmControl(batch.receipt,{resourceId:change.resource.id,status,...(status==='applied'?{after:result.after}:{}),...(status!=='applied'?{error:result?.code||'CONTROL_ACK_UNCONFIRMED'}:{})});}
     catch{ledger.confirmControl(batch.receipt,{resourceId:change.resource.id,status:'unconfirmed',error:'INVALID_NATIVE_ACK'});status='unconfirmed';result={status:'unconfirmed',code:'INVALID_NATIVE_ACK'};}
     if(status!=='applied'||result?.authorityLost){
      if(status==='unconfirmed'||result?.status==='unconfirmed'||result?.authorityLost){notes.push({code:result?.code||'CONTROL_ACK_UNCONFIRMED'});await close('Native input effect or authority unavailable');}break;
     }
    }
    ledger.finish(batch.receipt);batch=null;
    if(!closed)try{await refresh();}catch(e){notes.push({code:e.code||'CONTROL_REFRESH_FAILED'});await close('Native input refresh unavailable');}
    publish();return snapshot();
   }catch(e){if(batch){try{ledger.finish(batch.receipt);}catch{}publish();}if(['CAPABILITY_DENIED','STALE_TARGET','EDITOR_CLOSED','CANCELLED'].includes(e.code))await close('Native edit admission changed');throw e;}
  }).finally(()=>signal?.removeEventListener('abort',abort));
 }
 return Object.freeze({ready,sourceKind:'dom-control',snapshot,read,apply:(plan,options)=>mutation('apply',plan,options),undoLast:(revision,options)=>mutation('undo',revision,options),restoreBaseline:(revision,options)=>mutation('baseline',revision,options),close,handlePaused:async()=>false,observe:async()=>{},handledNetwork:()=>false});
}
