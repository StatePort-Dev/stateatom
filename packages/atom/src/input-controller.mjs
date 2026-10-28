// SPDX-License-Identifier: Apache-2.0
// View-scoped command queue and local drafts. Construction is inert; concrete
// native authority and acknowledgements remain in the runtime adapters.
import{createInputDraft}from'./input-draft.mjs';
const error=(code,message=code)=>Object.assign(new Error(message),{code}),clone=v=>structuredClone(v);
export function createInputController({client,onChange=()=>{},clock={setTimeout:(...args)=>globalThis.setTimeout(...args),clearTimeout:id=>globalThis.clearTimeout(id)},debounceMs=250,initialMode='live'}={}){
 if(!['live','draft'].includes(initialMode)||typeof client?.request!=='function'||typeof clock.setTimeout!=='function'||typeof clock.clearTimeout!=='function'||!Number.isFinite(debounceMs)||debounceMs<0)throw error('INVALID_PLATFORM');
 const ownerId=crypto.randomUUID(),timers=new Map(),queued=new Set();let scope=null,last=null,model=null,mode=initialMode,epoch=0,busy=false,opening=null,closing=null,closingCaptureEpoch=null,flight=null,disposed=false,connectionLost=false,failure=null;
 const active=()=>!disposed&&!connectionLost&&!!scope&&!!last&&!last.closed;
 function snapshot(){return clone({ownerId,mode,active:active(),opening:!!opening,busy,connectionLost,editor:last,draft:model?.snapshot()||null,error:failure,sourceKind:scope?.sourceKind||last?.sourceKind||null,tabId:scope?.tabId||last?.target.tabId||null});}
 function emit(){if(disposed)return;try{onChange(snapshot());}catch{}}
 function clearTimer(id){const timer=timers.get(id);if(timer!==undefined)clock.clearTimeout(timer);timers.delete(id);}
 function cancelScheduled(){for(const id of timers.keys())clearTimer(id);queued.clear();}
 function fail(e){failure={code:e.code||'OPERATION_FAILED',message:String(e.message||e.code||'Input operation failed').slice(0,1024)};emit();}
 // Admission for an already requested state reply; no rendering or model mutation.
 function stateReplyGuard(){
  if(!active())return()=>false;
  const own=scope,investigationId=last.investigationId,target=last.target,keys=['tabId','origin','run','document','node','selector','property','build'];
  const sameTarget=value=>!!value&&keys.every(key=>value[key]===target[key]);
  return state=>{
   if(scope!==own||!active()||own.abort.signal.aborted||last.investigationId!==investigationId||!sameTarget(last.target))return false;
   const value=state?.inputs;
   if(state?.tabId!==own.tabId||state?.run!==target.run||value?.investigationId!==investigationId||value?.sourceKind!==own.sourceKind||!sameTarget(value?.target))return false;
   if(!Number.isSafeInteger(value.revision)||value.revision<last.revision||['starting','picking','resolving'].includes(state.picker?.status))return false;
   const selected=state.selection?.domIdentity;
   if(selected&&['document','node','property'].some(key=>selected[key]!==target[key]))return false;
   return true;
  };
 }
 function receive(value){
  if(!last||value?.investigationId!==last.investigationId||value.revision<last.revision)return false;
  last=clone(value);model.receive(value);if(value.closed){cancelScheduled();scope?.abort.abort();}emit();return true;
 }
 async function request(op,extra={},own=scope){
  if(!own||own.epoch!==epoch||own.abort.signal.aborted)throw error('EDITOR_CLOSED');
  return client.request({op,tabId:own.tabId,ownerId,...extra},{signal:own.abort.signal});
 }
 async function close(reason='Input editor closed',{remote=false}={}){
  if(!scope)return closing||snapshot();
  const own=scope,closingFlight=flight,at=++epoch;scope=null;flight=null;busy=false;opening=null;cancelScheduled();own.abort.abort();
  closingCaptureEpoch=at;if(model&&last)model.receive({...last,closed:true});emit();
  closing=(async()=>{
   try{
    if(remote){if(closingFlight)model?.reject(closingFlight.ticket,'INSPECTOR_DISCONNECTED');return snapshot();}
    const value=await client.request({op:'inputs-close',tabId:own.tabId,ownerId,...(last?.investigationId?{investigationId:last.investigationId}:{})});
    if(at===epoch&&value?.investigationId===last?.investigationId){if(closingFlight)model.settle(closingFlight.ticket,value);receive(value);}
   }catch(e){if(at===epoch){if(closingFlight)model?.reject(closingFlight.ticket,e.code||'CLEANUP_UNCONFIRMED');fail(e);}}
   finally{if(closingCaptureEpoch===at)closingCaptureEpoch=null;if(at===epoch)emit();}
   return snapshot();
  })();return closing;
 }
 async function open({tabId,sourceKind='json-response'}={}){
  if(disposed)throw error('DISPOSED');if(connectionLost)throw error('INSPECTOR_DISCONNECTED');
  if(!Number.isSafeInteger(tabId)||tabId<1||!['dom-control','json-response'].includes(sourceKind))throw error('INVALID_MESSAGE');
  if(scope?.tabId===tabId&&scope.sourceKind===sourceKind){if(opening)return opening;if(active())return refresh();}
  if(model?.snapshot().dirtyCount)throw error('DRAFT_PENDING','Apply or discard the current local draft first');
  if(scope)await close('Input source changed');if(closing)await closing;
  const own={tabId,sourceKind,epoch:++epoch,abort:new AbortController()};scope=own;last=null;model=null;failure=null;busy=true;
  const work=(async()=>{
   try{
    const value=await request('inputs-open',{sourceKind},own);
    if(own.epoch!==epoch||disposed){try{await client.request({op:'inputs-close',tabId:own.tabId,ownerId,investigationId:value.investigationId});}catch{}throw error('CANCELLED');}last=clone(value);model=createInputDraft({mode});model.begin(value);return snapshot();
   }catch(e){if(own.epoch===epoch){if(e.code!=='BUSY'&&!connectionLost)try{await client.request({op:'inputs-close',tabId:own.tabId,ownerId});}catch{}if(own.epoch===epoch){scope=null;failure={code:e.code||'OPERATION_FAILED',message:String(e.message)};}}throw e;}
   finally{if(own.epoch===epoch){opening=null;busy=false;emit();}}
  })();opening=work;emit();return work;
 }
 async function send(ids,requestedMode){
  if(!active())throw error('EDITOR_CLOSED');if(busy)throw error('BUSY');
  const own=scope,prepared=model.prepare({ids,mode:requestedMode});flight=prepared;busy=true;failure=null;emit();
  try{
   const value=await request('inputs-apply',{plan:prepared.plan},own);
   if(own.epoch===epoch){model.settle(prepared.ticket,value);if(!last||value.revision>=last.revision)last=clone(value);}
   return snapshot();
  }catch(e){if(own.epoch===epoch){model.reject(prepared.ticket,e.code||'REQUEST_FAILED');fail(e);}throw e;}
  finally{if(own.epoch===epoch){flight=null;busy=false;emit();void pump().catch(()=>{});}}
 }
 async function pump(){
  if(!active()||busy)return snapshot();const candidates=new Set(model.snapshot().liveCandidates),ids=[...queued].filter(id=>candidates.has(id)).slice(0,32);
  for(const id of [...queued])if(!candidates.has(id)||ids.includes(id))queued.delete(id);
  if(ids.length)return send(ids,'live');return snapshot();
 }
 async function flush(id){clearTimer(id);if(!active())return snapshot();queued.add(id);return pump();}
 function edit(id,raw){
  if(!active())throw error('EDITOR_CLOSED');clearTimer(id);queued.delete(id);model.edit(id,raw);failure=null;emit();
  const state=model.snapshot(),entry=state.entries.find(e=>e.id===id);
  if(state.mode!=='live'||state.heldDraft||!entry?.dirty||!entry.valid||entry.conflict)return snapshot();
  if(entry.resource.type==='boolean'||entry.resource.locator.control==='select')void flush(id).catch(()=>{});
  else timers.set(id,clock.setTimeout(()=>{timers.delete(id);void flush(id).catch(()=>{});},debounceMs));return snapshot();
 }
 function setMode(next){if(!['live','draft'].includes(next))throw error('INVALID_MODE');cancelScheduled();mode=next;model?.setMode(next);emit();return snapshot();}
 function discard(id){cancelScheduled();model?.discard(id);failure=null;emit();return snapshot();}
 async function apply(){cancelScheduled();return send(undefined,'draft');}
 async function refresh(){
  if(!active())throw error('EDITOR_CLOSED');if(busy)throw error('BUSY');const own=scope;busy=true;failure=null;emit();
  try{const value=await request('inputs-read',{investigationId:last.investigationId},own);if(own.epoch===epoch)receive(value);return snapshot();}
  catch(e){if(own.epoch===epoch)fail(e);throw e;}
  finally{if(own.epoch===epoch){busy=false;emit();void pump().catch(()=>{});}}
 }
 async function restore(op){
  if(!active())throw error('EDITOR_CLOSED');if(busy)throw error('BUSY');cancelScheduled();const own=scope;busy=true;failure=null;emit();
  try{
   const current=await request('inputs-read',{investigationId:last.investigationId},own);if(own.epoch!==epoch)throw error('CANCELLED');receive(current);
   const value=await request(op,{investigationId:last.investigationId,expectedRevision:current.revision},own);if(own.epoch===epoch)receive(value);return snapshot();
  }catch(e){if(own.epoch===epoch)fail(e);throw e;}
  finally{if(own.epoch===epoch){busy=false;emit();}}
 }
 function update(state){
  if(!scope||!last)return;
  const selected=state.selection?.domIdentity,old=last.target;
  if(state.tabId!==scope.tabId||state.run!==undefined&&state.run!==old.run||selected&&(selected.document!==old.document||selected.node!==old.node||selected.property!==old.property)){void close('Selected context changed');return;}
  if(state.inputs?.investigationId===last.investigationId)receive(state.inputs);
  else if(state.inputs&&state.inputs.investigationId!==last.investigationId){void close('Input investigation changed',{remote:true});}
 }
 const off=client.subscribeConnection?.(()=>{if(disposed)return;connectionLost=true;failure={code:'INSPECTOR_DISCONNECTED',message:'Inspector connection lost; reopen this inspector.'};void close('Inspector connection lost',{remote:true});emit();})||(()=>{});
 async function captureData({tabId,includeContent=false,notes='',includeCategories=[],signal}={},observation=null){
  if(disposed)throw error('DISPOSED');if(connectionLost)throw error('INSPECTOR_DISCONNECTED');
  if(signal?.aborted)throw error('CANCELLED');if(busy||opening||closingCaptureEpoch!==null)throw error('BUSY','Wait for the current input operation before preparing a report.');
  if(!Number.isSafeInteger(tabId)||tabId<=0)throw error('INVALID_MESSAGE');
  const at=epoch,expected=last?.target.tabId===tabId?{investigationId:last.investigationId,expectedRevision:last.revision}:{};
  // No read/flush/Apply, no timer cancellation or local draft projection.
  const value=await client.request({op:observation?'observation-capture':'inputs-capture',tabId,ownerId:observation?.ownerId??ownerId,...(observation?{inputOwnerId:ownerId,windowId:observation.windowId}:{}),includeContent,notes,includeCategories,...expected},{signal});
  if(signal?.aborted)throw error('CANCELLED');if(disposed)throw error('DISPOSED');if(connectionLost)throw error('INSPECTOR_DISCONNECTED');if(at!==epoch)throw error('STALE_CAPTURE');
  return value;
 }
 const capture=options=>captureData(options);
 function captureObservation({observationOwnerId,windowId,...options}={}){
  if(typeof observationOwnerId!=='string'||!observationOwnerId||observationOwnerId.length>100||typeof windowId!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(windowId))return Promise.reject(error('INVALID_MESSAGE'));
  return captureData(options,{ownerId:observationOwnerId,windowId});
 }
 function dispose(){if(disposed)return closing||Promise.resolve(snapshot());disposed=true;off();return close('Input view disposed');}
 return Object.freeze({open,edit,flush,setMode,discard,apply,refresh,capture,captureObservation,undo:()=>restore('inputs-undo'),baseline:()=>restore('inputs-baseline'),update,close,dispose,snapshot,stateReplyGuard});
}
