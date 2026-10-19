// SPDX-License-Identifier: Apache-2.0
// Owns only this investigation's future-response rules. The host supplies fresh
// native occurrence/authority facts and an already owned debugger command port.
import {createResponseLedger} from '../../../core/response-ledger.mjs';
import {parseExperimentPlan,validateExperimentPlan} from '../../../core/experiment-plan.mjs';

function error(code,message=code){return Object.assign(new Error(message),{code});}
const physical=['tabId','origin','run','document','node','selector','property','build'];
function decode(response){
 if(typeof response?.body!=='string'||response.body.length>349528)throw error('RESPONSE_UNSUPPORTED','Response body budget');
 return response.base64Encoded?new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(response.body),c=>c.charCodeAt(0))):response.body;
}
function encode(text){const bytes=new TextEncoder().encode(text);let raw='';for(let i=0;i<bytes.length;i+=16384)raw+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(raw);}

export function createResponseEditor({investigationId,target,responses=[],readCurrent,send,ownsFetch,onChange=()=>{}}){
 const ledger=createResponseLedger({investigationId,target}),handled=new Set(),notes=[];
 let published=structuredClone(target),observation={status:'Observed',value:target.value,observedAt:target.observedAt,dependency:'unknown'},cleanup='inactive',touched=false,closed=false,closing=null,serial=Promise.resolve();
 for(const response of responses.slice(-32).sort((a,b)=>a.requestOrdinal-b.requestOrdinal))try{ledger.observeResponse(response);}catch(e){notes.push({code:e.code||'RESPONSE_UNSUPPORTED'});}
 function snapshot(){return {...ledger.snapshot(),target:structuredClone(published),observation:structuredClone(observation),cleanup,notes:structuredClone(notes.slice(-8))};}
 function publish(){try{onChange(snapshot());}catch{/* A view cannot grant or revoke runtime authority. */}}
 function queue(fn){const work=serial.then(fn);serial=work.catch(()=>{});return work;}
 function assertOpen(signal){if(closed)throw error('EDITOR_CLOSED');if(signal?.aborted)throw error('CANCELLED');}
 async function current(){
  if(!ownsFetch())throw error('CAPABILITY_DENIED','Debugger lease is no longer owned');
  const fresh=await readCurrent();
  if(!physical.every(k=>fresh.target?.[k]===target[k]))throw error('STALE_TARGET','Physical target or code revision changed');
  if(fresh.admission?.available!==true||!['read','override'].every(g=>fresh.admission.grants?.includes(g)))throw error('CAPABILITY_DENIED','Current response editing authority required');
  return fresh;
 }
 function preflight(plan,fresh){
  if(plan.investigationId!==investigationId)throw error('STALE_INVESTIGATION');
  if(plan.changes.some(c=>c.resource.kind!=='json-response'))throw error('RESOURCE_UNSUPPORTED');
  const resources=ledger.snapshot().resources.map(r=>r.resource).filter(r=>plan.changes.some(c=>c.resource.id===r.id));
  validateExperimentPlan(plan,{...fresh,resources});
 }
 function markClosed(reason){if(!closed){closed=true;ledger.close(reason);publish();}}
 async function disable(){
  if(!touched)return;
  if(!ownsFetch()){cleanup='authority-lost';publish();return;}
  try{await send('Fetch.disable',{});touched=false;cleanup='disabled';}catch{cleanup='unknown';}
  publish();
 }
 function close(reason='Editor closed'){
  markClosed(reason);return closing??=(serial.then(disable).then(snapshot));
 }
 function mutation(fn,signal){
  const abort=()=>{markClosed('Pending edit cancelled');void close('Pending edit cancelled');};signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  return queue(async()=>{assertOpen(signal);return fn();}).finally(()=>signal?.removeEventListener('abort',abort));
 }
 async function apply(input,{signal}={}){
  return mutation(async()=>{
   let activated=false;
   try{
    const plan=parseExperimentPlan(input);preflight(plan,await current());assertOpen(signal);
    if(!touched){touched=true;activated=true;await send('Fetch.enable',{patterns:[{urlPattern:target.origin+'/*',resourceType:'Fetch',requestStage:'Response'}]});cleanup='active';}
    assertOpen(signal);const fresh=await current();assertOpen(signal);preflight(plan,fresh);
    ledger.apply(plan,fresh);published=structuredClone(fresh.target);publish();return snapshot();
   }catch(e){
    if(activated||signal?.aborted||['CAPABILITY_DENIED','STALE_TARGET'].includes(e.code)){markClosed(signal?.aborted?'Pending edit cancelled':'Plan admission changed');await disable();}
    throw e;
   }
  },signal);
 }
 async function read(){return queue(async()=>{
  assertOpen();try{const fresh=await current();assertOpen();const changed=JSON.stringify(fresh.target)!==JSON.stringify(published);published=structuredClone(fresh.target);observation={status:'Observed',value:published.value,observedAt:published.observedAt,dependency:'unknown'};if(changed)publish();return snapshot();}
  catch(e){markClosed('Current target unavailable');await disable();throw e;}
 });}
 function restore(kind,expectedRevision,{signal}={}){return mutation(async()=>{
  try{const fresh=await current();assertOpen(signal);ledger[kind]({...fresh,expectedRevision});published=structuredClone(fresh.target);publish();return snapshot();}
  catch(e){if(['CAPABILITY_DENIED','STALE_TARGET'].includes(e.code)){markClosed('Restoration admission changed');await disable();}throw e;}
 },signal);}
 async function continuePaused(p){if(ownsFetch())try{await send('Fetch.continueRequest',{requestId:p.requestId});}catch{notes.push({code:'CONTINUE_UNCONFIRMED'});publish();}}
 function matches(p,meta){
  const mime=p.responseHeaders?.find(h=>h.name?.toLowerCase()==='content-type')?.value||'';
  return meta?.mainFrame===true&&typeof meta.frameId==='string'&&p.frameId===meta.frameId&&meta.document===target.document&&meta.type==='Fetch'&&['Fetch','XHR'].includes(p.resourceType)&&p.request?.method==='GET'&&meta.method==='GET'&&p.networkId===meta.requestId&&p.request.url===meta.url&&ledger.responseURLs().includes(meta.url)&&p.responseStatusCode>=200&&p.responseStatusCode<300&&/^application\/(?:[\w.-]+\+)?json(?:\s*;|$)/i.test(mime);
 }
 async function handlePaused(p,meta){
  if(!touched)return false;
  // Mark synchronously: loadingFinished must never observe our substituted body
  // as though it were a new original server value while this task is queued.
  const matching=!closed&&matches(p,meta);if(matching)handled.add(p.networkId);
  return queue(async()=>{
   // A preceding job may have disabled Fetch and already released this native
   // pause. Never issue a second command against the released interception.
   if(!touched)return true;
   if(!matching||closed){await continuePaused(p);return true;}
   let receipt=null,deliveryAttempted=false;
   try{
    await current();assertOpen();
    // A later-started request may finish first. Continue the older exact native
    // occurrence unchanged; it cannot replace the current resource revision or
    // consume a rule/restoration intended for a newer response.
    const recorded=ledger.snapshot().resources.find(r=>r.resource.locator.url===meta.url)?.resource.locator;
    if(recorded&&Number.isSafeInteger(meta.requestOrdinal)&&meta.requestOrdinal>0&&meta.requestOrdinal<recorded.requestOrdinal){
     await send('Fetch.continueRequest',{requestId:p.requestId});notes.push({code:'SUPERSEDED_RESPONSE'});publish();return true;
    }
    const response=await send('Fetch.getResponseBody',{requestId:p.requestId});assertOpen();await current();assertOpen();
    const prepared=ledger.prepareResponse({...meta,body:decode(response)});receipt=prepared.receipt;
    await current();assertOpen();
    deliveryAttempted=true;
    if(prepared.modified)await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:p.responseStatusCode,responseHeaders:(p.responseHeaders||[]).filter(h=>!['content-length','content-encoding','transfer-encoding','etag','content-md5','digest'].includes(h.name.toLowerCase())),body:encode(prepared.body)});
    else await send('Fetch.continueRequest',{requestId:p.requestId});
    if(receipt){ledger.confirmResponse(receipt,{delivered:true});receipt=null;}
    publish();if(!ledger.responseURLs().length)await disable();return true;
   }catch(e){
    if(receipt)ledger.confirmResponse(receipt,{delivered:deliveryAttempted?null:false,error:e.code||'RESPONSE_SEND_FAILED'});
    notes.push({code:e.code||'RESPONSE_SEND_FAILED'});markClosed('Response intervention failed');await continuePaused(p);await disable();publish();return true;
   }
  });
 }
 async function observe(response){
  if(closed||handled.has(response.requestId))return;
  return queue(async()=>{if(closed||handled.has(response.requestId))return;try{ledger.observeResponse(response);publish();}catch(e){notes.push({code:e.code||'RESPONSE_UNSUPPORTED'});publish();}});
 }
 return Object.freeze({snapshot,apply,read,undoLast:(revision,options)=>restore('undoLast',revision,options),restoreBaseline:(revision,options)=>restore('restoreBaseline',revision,options),close,handlePaused,observe,handledNetwork:id=>handled.has(id)});
}
