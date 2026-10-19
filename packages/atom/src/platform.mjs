// SPDX-License-Identifier: Apache-2.0
import {appOrigin,siteRecord} from './origin-policy.mjs';
import {retainDiagnostics} from '../../../core/diagnostic.mjs';
import {DEBUGGER_CAPABILITIES,debuggerCommandCapability,isDevelopmentOrigin,isInspectionOrigin} from './capabilities.mjs';
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
   async command(method,params={}){assert(commandCapability(method));if(!attached)throw atomError('LEASE_EXPIRED','Debugger is not attached');return debuggerAPI.sendCommand({tabId},method,params);},
   release(){if(releasing)return releasing;if(!active)return Promise.resolve();assert();closing=true;releasing=(async()=>{try{await attachment?.catch(()=>{});if(attached)await debuggerAPI.detach({tabId});}finally{attached=false;active=false;if(leases.get(tabId)===token)leases.delete(tabId);}})();return releasing;},
   invalidate(){active=false;attached=false;if(leases.get(tabId)===token)leases.delete(tabId);}
  };
 },status(tabId,owner){const token=leases.get(tabId);return !token?'none':token.owner===owner?'owned':'foreign';},invalidate(tabId){leases.delete(tabId);}};
}
export function createEventHub(){const handlers=new Set();return {subscribe(fn){handlers.add(fn);return()=>handlers.delete(fn);},emit(event){for(const fn of handlers)fn(event);}};}
export function namespacedStorage(area,namespace='stateport.atom.v1.'){
 return {async get(keys){const list=typeof keys==='string'?[keys]:keys;const raw=await area.get(list.map(k=>namespace+k));return Object.fromEntries(list.filter(k=>Object.hasOwn(raw,namespace+k)).map(k=>[k,raw[namespace+k]]));},set(value){return area.set(Object.fromEntries(Object.entries(value).map(([k,v])=>[namespace+k,v])));}};
}
// Receives host-owned events, never installs global Chrome listeners.
export function createChromePlatform(api,{events,broker,capabilities:grants=capabilities,namespace='stateport.atom.v1.',readOnlySites=false}={}){
 if(!events||!broker)throw atomError('INVALID_PLATFORM','Host events and shared broker required');
 grants=Object.freeze([...grants]);
 const leases=new Map(),acquiring=new Map(),connections=new Map();let stopped=false,authorityEpoch=0;
 const storage=namespacedStorage(api.storage.session,namespace);
 const ready=storage.get(['connections']).then(x=>{for(const raw of x.connections||[]){try{const c=siteRecord({origin:raw.origin,mode:raw.mode,actions:raw.actions});connections.set(c.origin,c);}catch{/* Old or malformed records cannot grant authority. */}}});
 const persistConnections=()=>storage.set({connections:[...connections.values()]});
 const approvedSite=url=>connections.has(appOrigin(url));
 const permission=async origin=>!!origin&&!!await api.permissions?.contains({origins:[origin+'/*']});
 async function revoke(id){const entry=leases.get(id);leases.delete(id);if(entry)await entry.l.release().catch(()=>{});}
 async function facts(id){
  await ready;const epoch=authorityEpoch,tab=await api.tabs.get(id),origin=appOrigin(tab.url),connection=connections.get(origin)||null;
  const supported=isInspectionOrigin(tab.url,readOnlySites)||!!connection&&new URL(origin).protocol==='http:';
  const permitted=supported&&await permission(origin)&&epoch===authorityEpoch&&appOrigin((await api.tabs.get(id)).url)===origin;
  if(!permitted&&connection){connections.delete(origin);await persistConnections();}
  const active=permitted?connection:null,readOnly=active?.mode!=='development'||new URL(origin).protocol==='https:';
  return {url:tab.url,origin,epoch,siteApproved:!!active&&new URL(origin).protocol==='http:',permission:permitted,readOnly,connection:active,grants:grants.filter(c=>['read','inject'].includes(c)||!readOnly&&active.actions.includes(c))};
 }
 async function check(id,entry){
  if(stopped)throw atomError('DISPOSED');const f=await facts(id);
  if(!f.permission||f.origin!==entry.origin||entry.epoch!==authorityEpoch||(connections.get(entry.origin)||null)!==entry.connection){
   await revoke(id);throw atomError('ORIGIN_DENIED','Site permission or connection changed; attach again');
  }
  entry.l.assert();return entry.l;
 }
 async function lease(id){
  if(stopped)throw atomError('DISPOSED');
  if(leases.has(id))return check(id,leases.get(id));
  if(!acquiring.has(id))acquiring.set(id,(async()=>{
   const f=await facts(id);if(!f.permission)throw atomError('ORIGIN_DENIED','Site origin permission required');
   if(stopped)throw atomError('DISPOSED');const l=await broker.acquire({tabId:id,owner:'atom',capabilities:f.grants});
   const entry={l,origin:f.origin,epoch:f.epoch,connection:f.connection};leases.set(id,entry);
   try{await check(id,entry);return l;}catch(e){await revoke(id);throw e;}
  })().finally(()=>acquiring.delete(id)));
  return acquiring.get(id);
 }
 async function requireLease(id,cap){if(stopped)throw atomError('DISPOSED');const e=leases.get(id);if(!e)throw atomError('LEASE_REQUIRED');const l=await check(id,e);l.assert(cap);return l;}
 const chrome={runtime:{id:api.runtime.id,sendMessage:m=>api.runtime.sendMessage(m)},storage:{local:namespacedStorage(api.storage.local,namespace),session:storage},
  debugger:{attach:async({tabId})=>{const l=await lease(tabId);try{await l.attach();await requireLease(tabId,'read');}catch(e){await revoke(tabId);throw e;}},sendCommand:async({tabId},m,p)=>{const l=await requireLease(tabId);const result=await l.command(m,p);await requireLease(tabId);return result;},getTargets:()=>api.debugger.getTargets(),detach:async({tabId})=>revoke(tabId)},
  scripting:{executeScript:async op=>{const l=await lease(op.target.tabId);l.assert('inject');const result=await api.scripting.executeScript(op);await requireLease(op.target.tabId,'inject');return result;}},
  tabs:{get:id=>api.tabs.get(id),query:q=>api.tabs.query(q),reload:async(id,o)=>{await requireLease(id,'reload');return api.tabs.reload(id,o);},sendMessage:async(id,m)=>{(await lease(id)).assert('read');return api.tabs.sendMessage(id,m);},onUpdated:api.tabs.onUpdated}};
 return {ready,approvedSite,async connectSite(id,value){
   await ready;const epoch=authorityEpoch,record=siteRecord(value),tab=await api.tabs.get(id);
   if(new URL(record.origin).protocol==='https:'&&!readOnlySites||appOrigin(tab.url)!==record.origin||!await permission(record.origin))throw atomError('ORIGIN_DENIED','Approve browser access to the current exact origin first');
   if(epoch!==authorityEpoch)throw atomError('ORIGIN_DENIED','Permission changed during connection approval');await revoke(id);const currentTab=await api.tabs.get(id);if(epoch!==authorityEpoch||appOrigin(currentTab.url)!==record.origin)throw atomError('ORIGIN_DENIED','Connection context changed');connections.set(record.origin,record);await persistConnections();return record;
  },async forgetSite(id){const origin=appOrigin((await api.tabs.get(id)).url);connections.delete(origin);await persistConnections();await revoke(id);},
  async describeTarget(id){
   const f=await facts(id),entry=leases.get(id);
   if(entry){try{await check(id,entry);}catch{/* Revocation closes the old lease. */}}
   let status=broker.status?.(id,'atom')||'unknown';if(!leases.has(id)&&status==='owned')status='foreign';
   return {...f,readOnlySites:readOnlySites===true,lease:status,disposed:stopped,workerIndependent:broker.workerIndependent===true};
  },permittedOrigin:permission,owns:id=>leases.has(id),chrome,fetch:(...args)=>fetch(...args),events,
  async authorize(id,cap){const l=await lease(id);l.assert(cap);},
  async invalidate(id){await revoke(id);},
  async permissionsRemoved(){authorityEpoch++;await ready;connections.clear();await persistConnections();await Promise.allSettled([...leases.keys()].map(revoke));},
  async shutdown(){if(stopped)return;stopped=true;await Promise.allSettled([...acquiring.values()]);for(const[id,{l}]of leases){try{await l.command('Fetch.disable');}catch{}try{await l.command('Network.setCacheDisabled',{cacheDisabled:false});}catch{}await revoke(id);}},
  detached(id){leases.get(id)?.l.invalidate();leases.delete(id);}
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
