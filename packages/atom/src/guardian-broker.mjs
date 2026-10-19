// SPDX-License-Identifier: Apache-2.0
// Optional host-owned broker. Live guardian grants, never storage, authorize
// cleanup after worker loss. Application payloads never cross this channel.
import {debuggerCommandCapability} from './capabilities.mjs';
import {GUARDIAN_PORT} from './guardian-document.mjs';
const error=(code,message=code)=>Object.assign(new Error(message),{code});
const absent=e=>/not attached|no tab with (?:given )?id|no target with (?:given )?id/i.test(e?.message||'');
const wire=m=>m&&typeof m==='object'&&!Array.isArray(m)&&new TextEncoder().encode(JSON.stringify(m)).length<=131072;
export function createGuardianBroker(api,{documentPath='atom-guardian.html',fallback,startupTimeout=5000}={}){
 const url=api.runtime.getURL?.(documentPath),local=new Map();let mode='starting',other=null,channel=null,disposed=false,snapshot=null,revision=-1,recovery=Promise.resolve(),sequence=0;
 let resolveReady,rejectReady,settled=false;const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;});void ready.catch(()=>{});
 const pending=new Map();let startupTimer;
 const settle=(failure)=>{if(settled)return;settled=true;clearTimeout(startupTimer);if(failure)rejectReady(failure);else resolveReady();};
 function update(next){
  if(!next||typeof next.guardianId!=='string'||!Array.isArray(next.leases)||next.leases.length>16||!Array.isArray(next.events)||next.events.length>128||!Number.isSafeInteger(next.droppedEvents)||next.droppedEvents<0)throw error('INVALID_PROTOCOL');
  const rev=next.events.length+next.droppedEvents;if(snapshot?.guardianId!==next.guardianId||rev>=revision){snapshot=next;revision=rev;}
 }
 const current=c=>!!c&&!disposed&&channel===c&&c.ready&&mode==='remote';
 function call(op,args){
  const c=channel;if(!current(c))return Promise.reject(error('LEASE_EXPIRED'));
  if(pending.size>=64)return Promise.reject(error('BUSY','Guardian request budget reached'));
  const id=++sequence;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject,c});try{c.port.postMessage({kind:'rpc',version:1,nonce:c.nonce,sequence:id,op,args});}catch(e){pending.delete(id);reject(error('LEASE_EXPIRED'));void lost(c);}});
 }
 async function nativeCleanup(job){
  const allowed=['Fetch.disable','Network.setCacheDisabled:false','detach'];
  if(!Number.isSafeInteger(job?.tabId)||job.tabId<1||!Array.isArray(job.actions)||job.actions.at(-1)!=='detach'||new Set(job.actions).size!==job.actions.length||job.actions.some((a,i)=>!allowed.includes(a)||i&&allowed.indexOf(a)<=allowed.indexOf(job.actions[i-1])))return{status:'failed'};
  const own=local.get(job.tabId);if(own?.inFlight.size){let timer;await Promise.race([Promise.allSettled([...own.inFlight]),new Promise(r=>{timer=setTimeout(r,1000);})]);clearTimeout(timer);}
  for(const action of job.actions.slice(0,-1))try{await api.debugger.sendCommand({tabId:job.tabId},action==='Fetch.disable'?action:'Network.setCacheDisabled',action==='Fetch.disable'?{}:{cacheDisabled:false});}catch{/* Native detach below is the terminal cleanup barrier. */}
  try{await api.debugger.detach({tabId:job.tabId});return{status:'detached'};}catch(e){return{status:absent(e)?'already-detached':'failed'};}
 }
 async function retireKnown(entries){
  for(const l of entries){l.active=false;l.closing=true;if(!l.touched){if(local.get(l.cap.tabId)===l)local.delete(l.cap.tabId);continue;}
   const actions=[];if(l.cap.capabilities.includes('override'))actions.push('Fetch.disable');if(l.cap.capabilities.includes('cache'))actions.push('Network.setCacheDisabled:false');actions.push('detach');
   const result=await nativeCleanup({tabId:l.cap.tabId,actions});if(result.status==='failed')throw error('CLEANUP_UNCONFIRMED');if(local.get(l.cap.tabId)===l)local.delete(l.cap.tabId);
  }
 }
 async function ensureDocument(){
  const contexts=await api.runtime.getContexts({contextTypes:['OFFSCREEN_DOCUMENT']});
  if(contexts.some(c=>c.documentUrl!==url))return false;
  if(!contexts.length)await api.offscreen.createDocument({url:documentPath,reasons:['WORKERS'],justification:'Run the shared live debugger ownership worker and retire its leases after service worker restart.'});
  else{const reply=await api.runtime.sendMessage({stateatomGuardianWake:1});if(reply?.ok===false)throw error('REGISTRY_LOST','Live resource registry lost; restart the extension before editing');}
  return true;
 }
 function lost(c){
  if(channel!==c)return recovery;channel=null;c.ready=false;mode='recovering';
  for(const [id,p]of pending)if(p.c===c){pending.delete(id);p.reject(error('LEASE_EXPIRED'));}
  const entries=[...local.values()];for(const l of entries)l.active=false;
  recovery=recovery.catch(()=>{}).then(()=>retireKnown(entries)).then(async()=>{if(!disposed)await ensureDocument();}).catch(e=>{mode='unavailable';settle(e);throw e;});void recovery.catch(()=>{});return recovery;
 }
 async function accept(port){
  if(port.name!==GUARDIAN_PORT||mode==='fallback'||disposed)return;
  const s=port.sender;if(s?.id!==api.runtime.id||s.url!==url||s.tab||s.documentId!==undefined&&typeof s.documentId!=='string'){port.disconnect();return;}
  try{
   await recovery;if(disposed){port.disconnect();return;}
   const contexts=await api.runtime.getContexts({documentUrls:[url]});
   const peer=contexts.length===1&&contexts[0];
   if(!peer||peer.contextType!=='OFFSCREEN_DOCUMENT'||peer.documentUrl!==url||typeof peer.documentId!=='string'||s.documentId!==undefined&&peer.documentId!==s.documentId||channel){port.disconnect();return;}
   const c={port,documentId:peer.documentId,nonce:crypto.randomUUID(),ready:false,cleanupSequence:0,guardianId:null};channel=c;sequence=0;snapshot=null;revision=-1;
   const drop=()=>{void api.runtime.lastError;void lost(c);};port.onDisconnect.addListener(drop);
   port.onMessage.addListener(m=>{
    if(channel!==c||disposed)return;
    try{
     if(!wire(m)||m.version!==1||m.nonce!==c.nonce)throw error('INVALID_PROTOCOL');
     if(m.kind==='cleanup'){
      if(!Number.isSafeInteger(m.sequence)||m.sequence!==c.cleanupSequence+1||!m.job||typeof m.job.guardianId!=='string'||c.guardianId&&c.guardianId!==m.job.guardianId)throw error('INVALID_PROTOCOL');
      c.guardianId=m.job.guardianId;c.cleanupSequence=m.sequence;
      void nativeCleanup(m.job).then(result=>{if(channel===c&&!disposed)c.port.postMessage({kind:'cleanup-result',version:1,nonce:c.nonce,sequence:m.sequence,result});}).catch(()=>{try{port.disconnect();}catch{}void lost(c);});return;
     }
     if(m.kind==='ready'){
      if(c.ready)return;if(c.guardianId&&c.guardianId!==m.snapshot?.guardianId)throw error('INVALID_PROTOCOL');update(m.snapshot);c.guardianId=snapshot.guardianId;c.ready=true;mode='remote';settle();return;
     }
     if(m.kind!=='reply'||!Number.isSafeInteger(m.sequence))throw error('INVALID_PROTOCOL');
     const p=pending.get(m.sequence);if(!p||p.c!==c)return;pending.delete(m.sequence);if(m.ok===true){update(m.snapshot);p.resolve(m);}else if(m.ok===false&&typeof m.code==='string')p.reject(error(m.code));else throw error('INVALID_PROTOCOL');
    }catch{try{port.disconnect();}catch{}void lost(c);}
   });
   port.postMessage({kind:'challenge',version:1,nonce:c.nonce});
  }catch{try{port.disconnect();}catch{}}
 }
 const connected=port=>{void accept(port);};
 async function initialize(){
  if(!url||!api.offscreen?.createDocument||!api.runtime.getContexts||!api.runtime.onConnect){other=fallback?.();mode='fallback';settle();return;}
  api.runtime.onConnect.addListener(connected);
  try{if(!await ensureDocument()){mode='fallback';other=fallback?.();api.runtime.onConnect.removeListener(connected);settle();return;}}
  catch(e){if(e.code==='REGISTRY_LOST'){mode='unavailable';settle(e);return;}mode='fallback';other=fallback?.();api.runtime.onConnect.removeListener(connected);settle();return;}
  if(!settled)startupTimer=setTimeout(()=>settle(error('CAPABILITY_UNAVAILABLE','Guardian handshake unavailable')),startupTimeout);
 }
 const detached=source=>{
  const l=local.get(source.tabId);if(!l)return;
  l.nativeGone=true;
  if(mode==='remote')void l.public.invalidate();
 };
 api.debugger.onDetach?.addListener(detached);void initialize();
 async function acquire(options){
  await ready;if(disposed)throw error('DISPOSED');if(mode==='fallback')return other.acquire(options);
  if(!current(channel))throw error('CAPABILITY_UNAVAILABLE');
  const {tabId,owner,capabilities=[],documentId=null}=options,tab=await api.tabs.get(tabId);const origin=new URL(tab.url).origin;
  const reply=await call('acquire',[{tabId,owner,capabilities,origin}]),cap=reply.value;
  const l={cap,active:true,attached:false,touched:false,closing:false,nativeGone:false,inFlight:new Set(),releasePromise:null,attachPromise:null,c:channel,public:null};local.set(tabId,l);
  const assert=grant=>{if(!l.active||l.closing||local.get(tabId)!==l||!current(l.c))throw error('LEASE_EXPIRED');if(grant&&!cap.capabilities.includes(grant))throw error('CAPABILITY_DENIED');};
  async function attach(){
   assert('read');if(l.attached)return;
   if(!l.attachPromise)l.attachPromise=(async()=>{
    const targets=await api.debugger.getTargets();assert('read');if(targets.some(t=>t.tabId===tabId&&t.attached))throw error('BUSY','Native debugger resource is already attached');
    const ticket=(await call('begin',[cap,{kind:'attach'}])).value;assert('read');l.touched=true;
    try{await api.debugger.attach({tabId},'1.3');assert('read');await call('finish',[ticket,{ok:true}]);l.attached=true;}
    catch(e){if(current(l.c))await call('finish',[ticket,{ok:false}]).catch(()=>{});throw e;}
   })();
   try{await l.attachPromise;}catch(e){await release().catch(()=>{});throw e;}
  }
  async function command(method,params={}){
   const grant=typeof method==='string'?debuggerCommandCapability(method):null;if(!grant)throw error('CAPABILITY_DENIED');assert(grant);if(!l.attached)throw error('LEASE_EXPIRED');
   const ticket=(await call('begin',[cap,{kind:'command',method}])).value;assert(grant);
   let nativeAcknowledged=false;const work=(async()=>{try{const result=await api.debugger.sendCommand({tabId},method,params);nativeAcknowledged=true;assert(grant);await call('finish',[ticket,{ok:true}]);return result;}catch(e){if(current(l.c))await call('finish',[ticket,{ok:false}]).catch(()=>{});if(nativeAcknowledged)e.nativeMayHaveApplied=true;throw e;}})();
   l.inFlight.add(work);try{return await work;}finally{l.inFlight.delete(work);}
  }
  function release(){
   if(l.releasePromise)return l.releasePromise;l.closing=true;
   l.releasePromise=(async()=>{if(!current(l.c)){if(!l.active)return;throw error('LEASE_EXPIRED');}const result=await call('release',[cap]);if(result.value.phase!=='released')throw error('CLEANUP_UNCONFIRMED');l.active=false;l.attached=false;if(local.get(tabId)===l)local.delete(tabId);})();return l.releasePromise;
  }
  async function invalidate(){
   try{await release();}catch{if(current(l.c))try{await call('retryCleanup',[cap.leaseId]);}catch{}}
  }
  l.public={tabId,documentId,assert,attach,command,release,invalidate,async verify(grant){assert(grant);await call('verify',grant?[cap,grant]:[cap]);assert(grant);}};
  return l.public;
 }
 function status(tabId,owner){
  if(mode==='fallback')return other?.status?.(tabId,owner)||'unknown';if(!snapshot||!current(channel))return'unknown';
  const remote=snapshot.leases.find(l=>l.tabId===tabId);if(!remote)return'none';const l=local.get(tabId);return l?.active&&!l.closing&&l.c===channel&&l.cap.leaseId===remote.leaseId&&remote.phase!=='closing'&&l.cap.owner===owner?'owned':'foreign';
 }
 async function dispose(){
  if(disposed)return;if(mode==='fallback'){disposed=true;api.debugger.onDetach?.removeListener(detached);return;}
  await Promise.allSettled([...local.values()].map(l=>l.public.release()));disposed=true;clearTimeout(startupTimer);api.runtime.onConnect?.removeListener(connected);api.debugger.onDetach?.removeListener(detached);const c=channel;channel=null;for(const p of pending.values())p.reject(error('DISPOSED'));pending.clear();try{c?.port.disconnect();}catch{}
 }
 return {ready,get workerIndependent(){return mode==='remote'&&current(channel);},acquire,status,invalidate(tabId){void local.get(tabId)?.public.invalidate();},dispose};
}
