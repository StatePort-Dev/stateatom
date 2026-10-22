// SPDX-License-Identifier: Apache-2.0
// Data-only stopped history. Never adopts an observation owner or executes a page read.
import{parseStoppedProductionObservation}from'../../../core/production-observation-data.mjs';
export const observationHistoryTemplate='<section id="observation-history" data-atom-id="observation-history" hidden aria-label="Previous observation window"><p class="sp-section-title">Previous observation window</p><p id="observation-history-summary" data-atom-id="observation-history-summary" class="sp-atom-hint"></p><div class="sp-atom-settings-actions"><button id="observation-history-read" data-atom-id="observation-history-read" class="sp-button-secondary" disabled>Read stored history</button><button id="observation-history-delete" data-atom-id="observation-history-delete" class="sp-button-secondary" disabled>Delete history</button></div><p id="observation-history-status" data-atom-id="observation-history-status" class="sp-atom-hint" role="status"></p></section>';
export function createObservationHistoryUI({$,client}){
 const ownerId=crypto.randomUUID();let tabId=null,window=null,key=null,pending=null,epoch=0,disposed=false,lost=false;
 const decode=w=>parseStoppedProductionObservation(JSON.stringify(w));
 function abort(){epoch++;pending?.abort.abort();pending=null;}
 function render(){
  const visible=!!window&&!disposed; $('observation-history').hidden=!visible;
  for(const id of['read','delete'])$('observation-history-'+id).disabled=!visible||!!pending||lost;
  if(!visible){$('observation-history-summary').textContent='';return;}
  const w=window,c=w.counts;$('observation-history-summary').textContent='Stopped · '+w.stopReason.replaceAll('-',' ')+' · '+c.requests+' requests · '+c.httpErrors+' HTTP errors · '+c.transportFailed+' transport failures · '+c.errors+' errors · '+c.checkpoints+' sampled reads. Start: '+new Date(w.startedAt).toISOString()+'. End: '+(w.endedAt===null?'unknown':new Date(w.endedAt).toISOString())+'. Missing history: before and after this window. Dependency: unknown. No new page observation.';
 }
 function update(s){
  if(disposed||lost)return;let next=null;try{if(s?.observationAccess==='historical'&&Number.isSafeInteger(s.tabId)&&s.tabId>0){next=decode(s.productionObservation);if(next.identity.tabId!==s.tabId)next=null;}}catch{}
  const nextKey=next?JSON.stringify([s.tabId,next]):null;if(nextKey===key)return;abort();key=nextKey;window=next;tabId=next?s.tabId:null;$('observation-history-status').textContent=next?'Collection ended. This window cannot be resumed. Read or delete its stored history.':'';render();
 }
 async function perform(clear){
  if(disposed||lost||pending||!window)return;const token={epoch:++epoch,abort:new AbortController()},w=window,id=tabId;pending=token;render();
  try{const r=await client.request({op:clear?'observation-clear':'observation-read',tabId:id,windowId:w.windowId,ownerId},{signal:token.abort.signal});if(disposed||lost||token.epoch!==epoch||token.abort.signal.aborted)return;
   if(clear){if(r?.status!=='deleted'||r.windowId!==null)throw Error('Historical observation delete was not confirmed');window=null;key=null;tabId=null;}
   else{const next=decode(r);if(next.windowId!==w.windowId||next.identity.tabId!==id)throw Error('Historical observation changed');window=next;key=JSON.stringify([id,next]);}
   $('observation-history-status').textContent=clear?'Stored history deleted. Application state is unchanged.':'Stored history read. No page access or collection was started.';
  }catch(e){if(!disposed&&!lost&&token.epoch===epoch&&!token.abort.signal.aborted)$('observation-history-status').textContent=String(e.message||'Historical observation is invalid').slice(0,1024);}
  finally{if(pending===token){pending=null;render();}}
 }
 $('observation-history-read').onclick=()=>perform(false);$('observation-history-delete').onclick=()=>perform(true);
 const off=client.subscribeConnection?.(()=>{if(disposed||lost)return;lost=true;abort();$('observation-history-status').textContent='Inspector connection ended. Reopen the inspector to read stored history.';render();})||(()=>{});
 function dispose(){if(disposed)return;disposed=true;abort();window=null;off();render();}
 render();return Object.freeze({update,dispose});
}
