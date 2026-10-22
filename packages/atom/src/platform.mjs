// SPDX-License-Identifier: Apache-2.0
import {appOrigin,siteRecord} from './origin-policy.mjs';
import {retainDiagnostics} from '../../../core/diagnostic.mjs';
import {DEBUGGER_CAPABILITIES,debuggerCommandCapability,isDevelopmentOrigin,isInspectionOrigin} from './capabilities.mjs';
import {createGuardianBroker as makeGuardianBroker} from './guardian-broker.mjs';
import {createSourceParseBroker} from './source-parse-broker.mjs';
import {createNativeControlOwner as makeControlOwner} from './control-owner.mjs';
import {createProductionChangeHost} from './production-change-host.mjs';
export function atomError(code,message=code){return Object.assign(new Error(message),{code});}
export const capabilities=DEBUGGER_CAPABILITIES;
function commandCapability(method){const cap=debuggerCommandCapability(method);if(!cap)throw atomError('CAPABILITY_DENIED','Unsupported scoped debugger command');return cap;}
// One broker per host, shared by every debugger consumer. Construction is inert.
export function createDebuggerBroker(debuggerAPI){
 const leases=new Map();
 return {workerIndependent:false,async acquire({tabId,documentId=null,owner,capabilities:grants=[]}){
  grants=Object.freeze([...grants]);
  if(!Number.isSafeInteger(tabId)||tabId<1||!owner||grants.some(c=>!capabilities.includes(c)))throw atomError('INVALID_PLATFORM');
  if(leases.has(tabId))throw atomError('BUSY','Debugger resource busy');
  let active=true,attached=false,closing=false,attachment=null,releasing=null;const token={owner};leases.set(tabId,token);
  const assert=cap=>{if(!active||closing||leases.get(tabId)!==token)throw atomError('LEASE_EXPIRED');if(cap&&!grants.includes(cap))throw atomError('CAPABILITY_DENIED',cap+' capability required');};
  return {tabId,documentId,assert,
   async attach(){assert('read');if(!attached){attachment??=(async()=>{try{await debuggerAPI.attach({tabId},'1.3');attached=true;}catch(e){if(/already attached|another debugger/i.test(e.message))throw atomError('BUSY','Native debugger resource busy');throw e;}})();await attachment;}assert('read');},
   async command(method,params={},beforeNative){const cap=commandCapability(method);assert(cap);if(!attached)throw atomError('LEASE_EXPIRED','Debugger is not attached');if(beforeNative!==undefined){if(typeof beforeNative!=='function')throw atomError('INVALID_PLATFORM');await beforeNative();assert(cap);}return debuggerAPI.sendCommand({tabId},method,params);},
   release(){if(releasing)return releasing;if(!active)return Promise.resolve();assert();closing=true;releasing=(async()=>{try{await attachment?.catch(()=>{});if(attached)await debuggerAPI.detach({tabId});}finally{attached=false;active=false;if(leases.get(tabId)===token)leases.delete(tabId);}})();return releasing;},
   invalidate(){active=false;attached=false;if(leases.get(tabId)===token)leases.delete(tabId);}
  };
 },status(tabId,owner){const token=leases.get(tabId);return !token?'none':token.owner===owner?'owned':'foreign';},invalidate(tabId){leases.delete(tabId);}};
}
export function createGuardianBroker(api,{documentPath}={}){const broker=makeGuardianBroker(api,{...(documentPath?{documentPath}:{}),fallback:()=>createDebuggerBroker(api.debugger)}),parser=createSourceParseBroker(api,{...(documentPath?{documentPath}:{}),ready:broker.ready,enabled:()=>broker.workerIndependent===true}),dispose=broker.dispose;broker.sourceParsing=parser;broker.dispose=async()=>{await parser.dispose();await dispose();};return broker;}
export function createNativeControlOwner(api,options){return makeControlOwner(api.runtime,options);}
export function createEventHub(){const handlers=new Set();return {subscribe(fn){handlers.add(fn);return()=>handlers.delete(fn);},emit(event){for(const fn of handlers)fn(event);}};}
export function namespacedStorage(area,namespace='stateport.atom.v1.'){
 return {async get(keys){const list=typeof keys==='string'?[keys]:keys;const raw=await area.get(list.map(k=>namespace+k));return Object.fromEntries(list.filter(k=>Object.hasOwn(raw,namespace+k)).map(k=>[k,raw[namespace+k]]));},set(value){return area.set(Object.fromEntries(Object.entries(value).map(([k,v])=>[namespace+k,v])));}};
}
// Receives host-owned events, never installs global Chrome listeners.
export function createChromePlatform(api,{events,broker,capabilities:grants=capabilities,namespace='stateport.atom.v1.',readOnlySites=false,controlOwner,productionClock}={}){
 if(!events||!broker)throw atomError('INVALID_PLATFORM','Host events and shared broker required');
 grants=Object.freeze([...grants]);
 const nativeSessions=new Set();
 const leases=new Map(),acquiring=new Map(),connections=new Map();let stopped=false,authorityEpoch=0;
 const storage=namespacedStorage(api.storage.session,namespace);
 const restored=storage.get(['connections']);const ready=(broker.ready?Promise.all([broker.ready,restored]).then(([,x])=>x):restored).then(x=>{for(const raw of x.connections||[]){try{const c=siteRecord({origin:raw.origin,mode:raw.mode,actions:raw.actions});connections.set(c.origin,c);}catch{/* Old or malformed records cannot grant authority. */}}});
 const persistConnections=()=>storage.set({connections:[...connections.values()]});
 const approvedSite=url=>connections.has(appOrigin(url));
 const permission=async origin=>!!origin&&!!await api.permissions?.contains({origins:[origin+'/*']});
 async function closeNative(id){const results=await Promise.allSettled([...nativeSessions].filter(r=>id===undefined||r.tabId===id).map(async r=>{r.abort.abort();if(r.session){await r.session.close('Platform authority closed');nativeSessions.delete(r);}}));return results.some(r=>r.status==='rejected')?'unknown':'none';}
 const revoking=new Map();
 function revoke(id){
  if(revoking.has(id))return revoking.get(id);const entry=leases.get(id);leases.delete(id);
  const work=(async()=>{const nativeCleanup=await closeNative(id);if(!entry)return{cleanup:nativeCleanup};try{await entry.l.release();return{cleanup:nativeCleanup==='unknown'?'unknown':'released'};}catch{return{cleanup:'unknown'};}})();revoking.set(id,work);void work.finally(()=>{if(revoking.get(id)===work)revoking.delete(id);});return work;
 }
 const productionHost=createProductionChangeHost({available:readOnlySites===true&&typeof api.scripting?.executeScript==='function',readTarget:async(id,guard,{ownedLease=true}={})=>{const l=ownedLease?await requireLease(id,'read'):null;guard();const target=await productionTarget(id,guard);l?.assert('read');guard();return target;},retire:revoke,onChange:e=>events.emit(e),...(productionClock?{clock:productionClock}:{})});
 async function basicFacts(id){
  await ready;const epoch=authorityEpoch,tab=await api.tabs.get(id),origin=appOrigin(tab.url),connection=connections.get(origin)||null;
  const supported=isInspectionOrigin(tab.url,readOnlySites)||!!connection&&new URL(origin).protocol==='http:';
  const permitted=supported&&await permission(origin)&&epoch===authorityEpoch&&appOrigin((await api.tabs.get(id)).url)===origin;
  if(!permitted&&connection){connections.delete(origin);await persistConnections();}
  const active=permitted?connection:null,readOnly=active?.mode!=='development'||new URL(origin).protocol==='https:';
  return {url:tab.url,origin,epoch,siteApproved:!!active&&new URL(origin).protocol==='http:',permission:permitted,readOnly,connection:active,grants:grants.filter(c=>['read','inject'].includes(c)||!readOnly&&active.actions.includes(c))};
 }
 async function productionTarget(id,guard=()=>{}){
  const before=await basicFacts(id);guard();if(stopped||!readOnlySites||!before.permission||!before.origin?.startsWith('https:'))throw atomError('ORIGIN_DENIED');
  const result=await api.scripting.executeScript({target:{tabId:id,frameIds:[0]},world:'ISOLATED',func:()=>null});guard();const after=await basicFacts(id);guard();
  if(stopped||!after.permission||before.origin!==after.origin||before.epoch!==after.epoch)throw atomError('ORIGIN_DENIED');
  if(!Array.isArray(result)||result.length!==1||result[0]?.frameId!==0||typeof result[0].documentId!=='string'||!result[0].documentId||result[0].documentId.length>512)throw atomError('DOCUMENT_UNAVAILABLE');return{tabId:id,origin:after.origin,document:result[0].documentId};
 }
 async function facts(id){
  const f=await basicFacts(id);let p=productionHost.describe(id);
  if(!f.permission){void productionHost.revoke(id,'permission-lost');p=productionHost.describe(id);}
  else if(p.active){if(!f.origin?.startsWith('https:')){void productionHost.revoke(id,'target-changed');p=productionHost.describe(id);}else try{p=productionHost.snapshot(await productionTarget(id));}catch{void productionHost.revoke(id,'document-unavailable');p=productionHost.describe(id);}}
  return{...f,productionChange:p,grants:p.active?grants.filter(c=>['read','inject','override','replay'].includes(c)):f.grants};
 }
 async function check(id,entry,cap,{cleanup=false}={}){
  if(stopped)throw atomError('DISPOSED');const f=await facts(id);
  if(!f.permission||f.origin!==entry.origin||entry.epoch!==authorityEpoch||(connections.get(entry.origin)||null)!==entry.connection){
   await revoke(id);throw atomError('ORIGIN_DENIED','Site permission or connection changed; attach again');
  }
  entry.l.assert(cap);if(entry.l.verify)await entry.l.verify(cap);entry.l.assert(cap);
  if(cap&&['override','replay'].includes(cap)&&entry.origin.startsWith('https:')&&!cleanup){if(!f.productionChange.active||entry.productionGrantId!==f.productionChange.grantId)throw atomError('CAPABILITY_DENIED');productionHost.assert(entry.productionTarget,cap==='replay'?'dom-control':'json-response');}
  return entry.l;
 }
 async function lease(id){
  if(stopped)throw atomError('DISPOSED');
  if(leases.has(id))return check(id,leases.get(id));
  if(!acquiring.has(id))acquiring.set(id,(async()=>{
   const f=await facts(id);if(!f.permission)throw atomError('ORIGIN_DENIED','Site origin permission required');
   if(stopped)throw atomError('DISPOSED');const l=await broker.acquire({tabId:id,owner:'atom',capabilities:f.grants});
   const entry={l,origin:f.origin,epoch:f.epoch,connection:f.connection,productionGrantId:f.productionChange?.grantId,productionTarget:f.productionChange?.target};leases.set(id,entry);
   try{await check(id,entry);return l;}catch(e){await revoke(id);throw e;}
  })().finally(()=>acquiring.delete(id)));
  return acquiring.get(id);
 }
 async function requireLease(id,cap,options){if(stopped)throw atomError('DISPOSED');const e=leases.get(id);if(!e)throw atomError('LEASE_REQUIRED');return check(id,e,cap,options);}
 const chrome={runtime:{id:api.runtime.id,sendMessage:m=>api.runtime.sendMessage(m)},storage:{local:namespacedStorage(api.storage.local,namespace),session:storage},
  debugger:{attach:async({tabId})=>{const l=await lease(tabId);try{await l.attach();await requireLease(tabId,'read');}catch(e){await revoke(tabId);throw e;}},sendCommand:async({tabId},m,p)=>{const cap=commandCapability(m),options={cleanup:['Fetch.disable','Fetch.continueRequest'].includes(m)},l=await requireLease(tabId,cap,options);const result=await l.command(m,p,()=>requireLease(tabId,cap,options));try{await requireLease(tabId,cap,options);}catch(e){e.nativeMayHaveApplied=true;throw e;}return result;},getTargets:()=>api.debugger.getTargets(),detach:async({tabId})=>{await productionHost.revoke(tabId,'debugger-detached');return revoke(tabId);}},
  scripting:{executeScript:async op=>{const l=await lease(op.target.tabId);l.assert('inject');const result=await api.scripting.executeScript(op);await requireLease(op.target.tabId,'inject');return result;}},
  tabs:{get:id=>api.tabs.get(id),query:q=>api.tabs.query(q),reload:async(id,o)=>{await requireLease(id,'reload');return api.tabs.reload(id,o);},sendMessage:async(id,m)=>{(await lease(id)).assert('read');return api.tabs.sendMessage(id,m);},onUpdated:api.tabs.onUpdated}};
 return {ready,approvedSite,get sourceParsingAvailable(){return broker.sourceParsing?.configured===true;},parseSourceArtifact:(operation,bytes,options)=>broker.sourceParsing?.run(operation,bytes,options)??Promise.reject(atomError('SOURCE_PARSE_UNAVAILABLE','Source artifact parsing unavailable')),productionChanges:{available:productionHost.available,transition:productionHost.transition,cancel:productionHost.cancel,close:productionHost.close,revoke:productionHost.revoke},get nativeControlsAvailable(){return controlOwner?.available===true&&typeof api.scripting?.executeScript==='function';},
  async openNativeControls({target,verify,onLost=()=>{}}={}){
   if(controlOwner?.available!==true||typeof api.scripting?.executeScript!=='function')throw atomError('CONTROL_OWNER_UNAVAILABLE');
   if(!target||typeof verify!=='function'||typeof onLost!=='function')throw atomError('INVALID_PLATFORM');
   const id=target.tabId;
   const guard=async required=>{
    for(const cap of required)await requireLease(id,cap);
    if(leases.get(id)?.origin!==target.origin)throw atomError('ORIGIN_DENIED');
    await verify();
    for(const cap of required)await requireLease(id,cap);
   };
   await guard(['read','inject','replay']);
   const record={tabId:id,abort:new AbortController(),session:null};nativeSessions.add(record);
   try{
    const session=await controlOwner.open({tabId:id,origin:target.origin,document:target.document,
     signal:record.abort.signal,guard,execute:async op=>{await guard(['read','inject','replay']);const entry=leases.get(id);if(!entry)throw atomError('LEASE_REQUIRED');entry.l.assert('replay');if(entry.origin.startsWith('https:'))productionHost.assert(entry.productionTarget,'dom-control');return api.scripting.executeScript(op);},onLost});
    record.session=session;
    if(record.abort.signal.aborted||stopped){await session.close('Opening cancelled');throw atomError('EDITOR_CLOSED');}
    return Object.freeze({read:()=>session.read(),write:(...args)=>session.write(...args),get closed(){return session.closed;},async close(reason){const result=await session.close(reason);nativeSessions.delete(record);return result;}});
   }catch(e){record.abort.abort();if(!record.session)nativeSessions.delete(record);throw e;}
  },async connectSite(id,value){
   await ready;const epoch=authorityEpoch,record=siteRecord(value),tab=await api.tabs.get(id);
   if(new URL(record.origin).protocol==='https:'&&!readOnlySites||appOrigin(tab.url)!==record.origin||!await permission(record.origin))throw atomError('ORIGIN_DENIED','Approve browser access to the current exact origin first');
   if(epoch!==authorityEpoch)throw atomError('ORIGIN_DENIED','Permission changed during connection approval');await revoke(id);const currentTab=await api.tabs.get(id);if(epoch!==authorityEpoch||appOrigin(currentTab.url)!==record.origin)throw atomError('ORIGIN_DENIED','Connection context changed');connections.set(record.origin,record);await persistConnections();return record;
  },async forgetSite(id){const origin=appOrigin((await api.tabs.get(id)).url);connections.delete(origin);await persistConnections();await revoke(id);},
  async describeTarget(id){
   const f=await facts(id),entry=leases.get(id);
   if(entry){try{await check(id,entry);}catch(error){
    // A recovered host broker can already report none/foreign while this
    // platform still holds its expired local object. Retire that reference;
    // it cannot authorize native cleanup or block the next explicit attach.
    if(error?.code==='LEASE_EXPIRED'&&leases.get(id)===entry)leases.delete(id);
   }}
   let status=broker.status?.(id,'atom')||'unknown';if(!leases.has(id)&&status==='owned')status='foreign';
   return {...f,sourceParsingAvailable:broker.sourceParsing?.configured===true,readOnlySites:readOnlySites===true,lease:status,disposed:stopped,workerIndependent:broker.workerIndependent===true};
  },permittedOrigin:permission,owns:id=>leases.has(id),chrome,fetch:(...args)=>fetch(...args),events,
  async authorize(id,cap){await lease(id);await requireLease(id,cap);},
  async invalidate(id){await productionHost.revoke(id,'context-changed');await revoke(id);},
  async permissionsRemoved(){authorityEpoch++;await productionHost.revokeAll('permission-lost');await ready;connections.clear();await persistConnections();await Promise.allSettled([...leases.keys()].map(revoke));},
  async shutdown(){if(stopped)return;stopped=true;await productionHost.shutdown();await closeNative();await Promise.allSettled([...acquiring.values()]);for(const[id,{l}]of leases){try{await l.command('Fetch.disable');}catch{}try{await l.command('Network.setCacheDisabled',{cacheDisabled:false});}catch{}await revoke(id);}await Promise.allSettled([...revoking.values()]);},
  detached(id){void productionHost.revoke(id,'debugger-lost');void closeNative(id);leases.get(id)?.l.invalidate();leases.delete(id);}
 };
}

// Only the standalone host opts in. No old session/debugger state is migrated.
export async function migrateStandaloneDiagnostics(area){
 const marker='stateport.atom.v1.migration';
 if((await area.get([marker]))[marker]===1)return;
 const key='stateport.atom.v1.diagnostics',stored=await area.get([key,'diagnostics']);
 const reports=retainDiagnostics([...(stored[key]||[]),...(Array.isArray(stored.diagnostics)?stored.diagnostics:[])],null);
 await area.set({[key]:reports,[marker]:1});
}
