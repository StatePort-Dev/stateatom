// SPDX-License-Identifier: Apache-2.0
// Live policy/cleanup coordinator. Native facts and owned retirement are supplied
// by the host; confirmation messages never supply a target or operation grant.
import{createProductionChangePolicy}from'./production-change-policy.mjs';
const error=code=>Object.assign(new Error(code),{code});
const defaultClock={now:()=>Date.now(),setTimeout:(...args)=>globalThis.setTimeout(...args),clearTimeout:id=>globalThis.clearTimeout(id)};
export function createProductionChangeHost({available,readTarget,retire,onChange=()=>{},clock=defaultClock}){
 if(typeof readTarget!=='function'||typeof retire!=='function'||typeof onChange!=='function'||!['now','setTimeout','clearTimeout'].every(k=>typeof clock[k]==='function'))throw error('INVALID_PLATFORM');
 const active=new Set(),cleanups=new Map();let stopped=false,timer=null;
 const emit=e=>{try{onChange(e);}catch{/* Native cleanup cannot depend on a view. */}};
 function cleanup(id){
  const old=cleanups.get(id);if(old?.pending)return old.promise;
  const record={pending:true,result:{cleanup:'pending'},promise:null};cleanups.set(id,record);
  record.promise=Promise.resolve().then(()=>retire(id)).then(value=>{const result=['released','none'].includes(value?.cleanup)?value.cleanup:'unknown';record.result={cleanup:result==='none'&&old?.result.cleanup==='unknown'?'unknown':result};return record.result;},()=>record.result={cleanup:'unknown'}).finally(()=>{record.pending=false;for(const[k,r]of cleanups)if(cleanups.size>32&&!r.pending&&k!==id)cleanups.delete(k);});
  return record.promise;
 }
 function schedule(){
  if(timer!==null)clock.clearTimeout(timer);timer=null;if(stopped)return;
  let delay;try{delay=policy.nextExpiryDelay();}catch{return;}if(delay!==null)timer=clock.setTimeout(()=>{timer=null;try{policy.expire();}catch{}schedule();},delay);
 }
 const policy=createProductionChangePolicy({now:()=>clock.now(),onRevoke:e=>{
  active.delete(e.target.tabId);const done=cleanup(e.target.tabId);emit({type:'production-revoked',tabId:e.target.tabId,grantId:e.grantId,reason:e.reason,cleanup:'pending'});
  void done.then(s=>emit({type:'production-revoked',tabId:e.target.tabId,grantId:e.grantId,reason:e.reason,cleanup:s.cleanup}));schedule();
 }});
 const addCleanup=s=>({...s,cleanup:cleanups.get(s.target?.tabId)?.result.cleanup||'none'});
 function describe(id){const s=policy.describe(id);return{...s,cleanup:cleanups.get(id)?.result.cleanup||'none'};}
 async function transition(stage,id,{ticket,owner,viewId,assertCurrent}={}){
  if(stopped)throw error('DISPOSED');if(!available)throw error('CAPABILITY_UNAVAILABLE');if(!['begin','advance','confirm'].includes(stage)||typeof assertCurrent!=='function')throw error('INVALID_PLATFORM');
  const guard=()=>{if(stopped)throw error('DISPOSED');assertCurrent();};guard();let issued=false;
  try{
   if(cleanups.get(id)?.pending)throw error('BUSY');const target=await readTarget(id,guard);guard();
   if(stage==='begin')return policy.begin(target,owner,viewId);
   if(stage==='advance')return policy.advance(ticket,target,owner,viewId);
   const grant=policy.confirm(ticket,target,owner,viewId);issued=true;active.add(id);schedule();
   const retired=await cleanup(id);guard();if(retired.cleanup==='unknown')throw error('CLEANUP_UNCONFIRMED');const result=policy.snapshot(target);if(!result.active||result.grantId!==grant.grantId)throw error('CAPABILITY_DENIED');return{...result,cleanup:retired.cleanup};
  }catch(e){if(issued)policy.revokeOwner(owner,viewId);throw e;}
 }
 return Object.freeze({available:available===true,transition,
  cancel:(ticket,owner,viewId)=>policy.cancel(ticket,owner,viewId),
  async close(owner,viewId){const ids=policy.revokeOwner(owner,viewId);await Promise.allSettled(ids.map(id=>cleanups.get(id)?.promise));},
  async revoke(id,reason='user'){policy.revoke(id,reason);const done=cleanups.get(id);if(done?.pending)await done.promise;return describe(id);},
  async revokeAll(reason){const ids=policy.revokeAll(reason);await Promise.allSettled(ids.map(id=>cleanups.get(id)?.promise));},
  describe,snapshot:target=>addCleanup(policy.snapshot(target)),assert:(target,kind)=>policy.assert(target,kind),
  async shutdown(){if(stopped)return;stopped=true;if(timer!==null)clock.clearTimeout(timer);timer=null;policy.revokeAll('runtime-stopped');await Promise.allSettled([...cleanups.values()].map(r=>r.promise));}
 });
}
