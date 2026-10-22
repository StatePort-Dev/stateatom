// SPDX-License-Identifier: Apache-2.0
// Private native metadata projection. No browser commands, response bodies or actors.
import {createProductionObservation} from '../../../core/production-observations.mjs';
// Epoch milliseconds on the host monotonic high-resolution clock. Cross-clock
// drift is still a gap; no rounding, tolerance or receipt-time substitution.
export const productionObservationTime=(clock=globalThis.performance)=>clock.timeOrigin+clock.now();
const observationReads=new Set(['DOM.enable','DOM.getDocument','DOM.querySelector','DOM.describeNode','DOM.pushNodesByBackendIdsToFrontend']);
export function createObservationReadFence(send){
 if(typeof send!=='function')throw Object.assign(Error('INVALID_PLATFORM'),{code:'INVALID_PLATFORM'});
 return async(id,method,params={})=>{if(!Number.isSafeInteger(id)||id<1||!observationReads.has(method))throw Object.assign(Error('Observation read command unavailable'),{code:'CAPABILITY_DENIED'});return send(id,method,params);};
}
export function createNativeProductionObservation({identity,target,loader,contextId,now=Date.now}){
 if(typeof loader!=='string'||!loader||loader.length>160||!Number.isSafeInteger(contextId)||contextId<1)throw Object.assign(Error('OBSERVATION_REQUIRED'),{code:'OBSERVATION_REQUIRED'});
 const ledger=createProductionObservation({identity,target,now}),pending=new Map();
 const finite=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
 const snapshot=()=>{const s=ledger.snapshot();if(s.status!=='recording')pending.clear();return s;};
 const at=(pair,t)=>finite(t)?pair.wall+(t-pair.monotonic)*1000:NaN;
 const inFrame=p=>p.frameId===identity.frame&&p.loaderId===loader;
 return Object.freeze({
  start:()=>ledger.start(),snapshot,
  stop(reason){const s=ledger.stop(reason);pending.clear();return s;},
  clear(){pending.clear();return ledger.clear();},
  get pendingCount(){snapshot();return pending.size;},
  checkpoint:value=>ledger.checkpoint(value,identity),
  event(source,method,p){
   if(source.tabId!==identity.tabId||source.sessionId||snapshot().status!=='recording')return;
   if(method==='Network.requestWillBeSent'){
    if(!inFrame(p))return;
    const previous=pending.get(p.requestId);
    if(previous){
     if(!p.redirectResponse){ledger.stop('context-changed');snapshot();return;}
     const time=at(previous,p.timestamp);
     ledger.requestResponse(previous.token,{at:time,status:p.redirectResponse.status},identity);
     if(!ledger.requestEnd(previous.token,{at:time,outcome:'redirect'},identity)){snapshot();return;}
     pending.delete(p.requestId);
    }
    const time=finite(p.timestamp)&&finite(p.wallTime)?p.wallTime*1000:NaN;
    const token=ledger.requestStart({requestId:p.requestId,at:time,url:p.request?.url,method:p.request?.method},identity);
    if(token)pending.set(p.requestId,{token,wall:time,monotonic:p.timestamp});
   }else if(method==='Network.responseReceived'){
    if(!inFrame(p))return;
    const pair=pending.get(p.requestId);ledger.requestResponse(pair?.token,{at:pair?at(pair,p.timestamp):NaN,status:p.response?.status},identity);
   }else if(method==='Network.loadingFinished'||method==='Network.loadingFailed'){
    const pair=pending.get(p.requestId);
    if(ledger.requestEnd(pair?.token,{at:pair?at(pair,p.timestamp):NaN,outcome:method==='Network.loadingFinished'?'finished':p.canceled===true?'cancelled':'failed'},identity))pending.delete(p.requestId);
   }else if(method==='Runtime.exceptionThrown'&&p.exceptionDetails?.executionContextId===contextId){
    const d=p.exceptionDetails;ledger.error({at:p.timestamp,category:d.exception?.className,url:d.url,line:d.lineNumber,column:d.columnNumber},identity);
   }
   snapshot();
  }
 });
}
