// SPDX-License-Identifier: Apache-2.0
import {retainDiagnostics} from '../../../core/diagnostic.mjs';
export function atomError(code,message=code){return Object.assign(new Error(message),{code});}
export const capabilities=Object.freeze(['read','inject','reload','cache','override','replay']);
const readCommands=new Set(['Network.enable','Page.enable','Runtime.enable','Debugger.enable','Performance.enable','Page.getFrameTree','Runtime.getIsolateId','Debugger.getScriptSource','Network.getResponseBody','Performance.getMetrics','Fetch.getResponseBody']);
function commandCapability(method){if(readCommands.has(method))return 'read';if(method==='Network.setCacheDisabled'||method==='Network.clearBrowserCache'||method==='Storage.clearDataForOrigin')return 'cache';if(method.startsWith('Fetch.'))return 'override';if(method==='Runtime.callFunctionOn')return 'inject';throw atomError('CAPABILITY_DENIED','Unsupported scoped debugger command');}
// One broker per host, shared by every debugger consumer. Construction is inert.
export function createDebuggerBroker(debuggerAPI){
 const leases=new Map();
 return {async acquire({tabId,documentId=null,owner,capabilities:grants=[]}){
  if(!Number.isSafeInteger(tabId)||tabId<1||!owner||grants.some(c=>!capabilities.includes(c)))throw atomError('INVALID_PLATFORM');
  if(leases.has(tabId))throw atomError('BUSY','Debugger resource busy');
  let active=true,attached=false,closing=false,attachment=null,releasing=null;const token={};leases.set(tabId,token);
  const assert=cap=>{if(!active||closing||leases.get(tabId)!==token)throw atomError('LEASE_EXPIRED');if(cap&&!grants.includes(cap))throw atomError('CAPABILITY_DENIED',cap+' capability required');};
  return {tabId,documentId,assert,
   async attach(){assert('read');if(!attached){attachment??=(async()=>{try{await debuggerAPI.attach({tabId},'1.3');attached=true;}catch(e){if(/already attached|another debugger/i.test(e.message))throw atomError('BUSY','Native debugger resource busy');throw e;}})();await attachment;}assert('read');},
   async command(method,params={}){assert(commandCapability(method));if(!attached)throw atomError('LEASE_EXPIRED','Debugger is not attached');return debuggerAPI.sendCommand({tabId},method,params);},
   release(){if(releasing)return releasing;if(!active)return Promise.resolve();assert();closing=true;releasing=(async()=>{try{await attachment?.catch(()=>{});if(attached)await debuggerAPI.detach({tabId});}finally{attached=false;active=false;if(leases.get(tabId)===token)leases.delete(tabId);}})();return releasing;},
   invalidate(){active=false;attached=false;if(leases.get(tabId)===token)leases.delete(tabId);}
  };
 },invalidate(tabId){leases.delete(tabId);}};
}
export function createEventHub(){const handlers=new Set();return {subscribe(fn){handlers.add(fn);return()=>handlers.delete(fn);},emit(event){for(const fn of handlers)fn(event);}};}
export function namespacedStorage(area,namespace='stateport.atom.v1.'){
 return {async get(keys){const list=typeof keys==='string'?[keys]:keys;const raw=await area.get(list.map(k=>namespace+k));return Object.fromEntries(list.filter(k=>Object.hasOwn(raw,namespace+k)).map(k=>[k,raw[namespace+k]]));},set(value){return area.set(Object.fromEntries(Object.entries(value).map(([k,v])=>[namespace+k,v])));}};
}
// Receives host-owned events, never installs global Chrome listeners.
export function createChromePlatform(api,{events,broker,capabilities:grants=capabilities,namespace='stateport.atom.v1.'}={}){
 if(!events||!broker)throw atomError('INVALID_PLATFORM','Host events and shared broker required');
 const leases=new Map(),acquiring=new Map();let stopped=false;
 async function lease(id){
  if(stopped)throw atomError('DISPOSED');
  if(!leases.has(id)){
   if(!acquiring.has(id))acquiring.set(id,(async()=>{
    const tab=await api.tabs.get(id);
    if(!/^http:\/\/127\.0\.0\.1:(4173|4174|4175)$/.test(new URL(tab.url).origin))throw atomError('ORIGIN_DENIED');
    if(stopped)throw atomError('DISPOSED');
    const l=await broker.acquire({tabId:id,owner:'atom',capabilities:grants});
    if(stopped){await l.release();throw atomError('DISPOSED');}
    leases.set(id,l);return l;
   })().finally(()=>acquiring.delete(id)));
   return acquiring.get(id);
  }
  return leases.get(id);
 }
 const requireLease=(id,cap)=>{if(stopped)throw atomError('DISPOSED');const l=leases.get(id);if(!l)throw atomError('LEASE_REQUIRED');l.assert(cap);return l;};
 const chrome={runtime:{id:api.runtime.id,sendMessage:m=>api.runtime.sendMessage(m)},storage:{local:namespacedStorage(api.storage.local,namespace),session:namespacedStorage(api.storage.session,namespace)},
  debugger:{attach:async({tabId})=>{const l=await lease(tabId);try{await l.attach();}catch(e){await l.release().catch(()=>{});leases.delete(tabId);throw e;}},sendCommand:({tabId},m,p)=>requireLease(tabId).command(m,p),getTargets:()=>api.debugger.getTargets(),detach:async({tabId})=>{const l=leases.get(tabId);if(l){await l.release();leases.delete(tabId);}}},
  scripting:{executeScript:async op=>{const l=await lease(op.target.tabId);l.assert('inject');return api.scripting.executeScript(op);}},
  tabs:{get:id=>api.tabs.get(id),query:q=>api.tabs.query(q),reload:async(id,o)=>{requireLease(id,'reload');return api.tabs.reload(id,o);},sendMessage:async(id,m)=>{(await lease(id)).assert('read');return api.tabs.sendMessage(id,m);},onUpdated:api.tabs.onUpdated}};
 return {owns:id=>leases.has(id),chrome,fetch:(...args)=>fetch(...args),events,
  async authorize(id,cap){const l=await lease(id);l.assert(cap);},
  async shutdown(){if(stopped)return;stopped=true;await Promise.allSettled([...acquiring.values()]);for(const[id,l]of leases){try{await l.command('Fetch.disable');}catch{}try{await l.command('Network.setCacheDisabled',{cacheDisabled:false});}catch{}await l.release().catch(()=>{});leases.delete(id);}stopped=true;},
  detached(id){leases.get(id)?.invalidate();leases.delete(id);}
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
