// SPDX-License-Identifier: Apache-2.0
// Inert live authority actor. No Chrome, storage, timer, input adapter or writer.
import{appOrigin}from'./origin-policy.mjs';
const GRANT_MS=600000,TICKET_MS=120000,LIMIT=16,kinds=['json-response','dom-control'];
const clone=v=>structuredClone(v),fail=code=>{throw Object.assign(new Error(code),{code});};
const string=(v,max=100)=>typeof v==='string'&&v.length>0&&new TextEncoder().encode(v).length<=max;
function target(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||![Object.prototype,null].includes(Object.getPrototypeOf(input)))fail('INVALID_PRODUCTION_TARGET');
 const fields=['tabId','origin','document'],out={};
 if(Reflect.ownKeys(input).length!==fields.length)fail('INVALID_PRODUCTION_TARGET');
 for(const k of fields){const d=Object.getOwnPropertyDescriptor(input,k);if(!d?.enumerable||!Object.hasOwn(d,'value'))fail('INVALID_PRODUCTION_TARGET');out[k]=d.value;}
 if(!Number.isSafeInteger(out.tabId)||out.tabId<1||!string(out.origin,4096)||appOrigin(out.origin,{exact:true})!==out.origin||!out.origin.startsWith('https:')||!string(out.document,512))fail('INVALID_PRODUCTION_TARGET');
 return out;
}
const same=(a,b)=>a.tabId===b.tabId&&a.origin===b.origin&&a.document===b.document;
function identity(owner,viewId){if(!owner||typeof owner!=='object'||!string(viewId))fail('INVALID_CONFIRMATION');}
function tab(id){if(!Number.isSafeInteger(id)||id<1)fail('INVALID_PRODUCTION_TARGET');return id;}
export function createProductionChangePolicy({now=Date.now,onRevoke=()=>{}}={}){
 if(typeof now!=='function'||typeof onRevoke!=='function')fail('INVALID_PLATFORM');
 const tickets=new Map(),grants=new Map();let lastTime=null;
 function notify(g,reason){try{onRevoke({target:clone(g.target),grantId:g.id,reason});}catch{/* Notification failure cannot restore deleted authority. */}}
 function revoke(id,reason='user'){
  tab(id);if(!string(reason,512))fail('INVALID_CONFIRMATION');
  for(const[k,t]of tickets)if(t.target.tabId===id)tickets.delete(k);
  const g=grants.get(id);if(!g)return false;grants.delete(id);notify(g,reason);return true;
 }
 function time(){
  const t=now(),valid=Number.isSafeInteger(t)&&t>=0&&t<=Number.MAX_SAFE_INTEGER-GRANT_MS;if(!valid||lastTime!==null&&t<lastTime){tickets.clear();const old=[...grants.values()];grants.clear();for(const g of old)notify(g,'clock-changed');if(valid)lastTime=t;fail('CLOCK_CHANGED');}
  lastTime=t;return t;
 }
 function prune(t){for(const[k,x]of tickets)if(x.expiresAt<=t)tickets.delete(k);for(const[id,g]of grants)if(g.expiresAt<=t)revoke(id,'expired');}
 function clock(){const t=time();prune(t);return t;}
 function view(id,t){const g=grants.get(id);return clone({schemaVersion:1,active:!!g,target:g?.target||null,grantId:g?.id||null,remainingMs:g?Math.max(0,g.expiresAt-t):0,operations:g?[...kinds]:[],reason:g?null:'Two confirmations required'});}
 function current(scope,t){const g=grants.get(scope.tabId);if(g&&!same(g.target,scope))revoke(scope.tabId,'target-changed');return view(scope.tabId,t);}
 function challenge(x){return clone({ticket:x.id,stage:x.stage,target:x.target,lifetimeMs:GRANT_MS,operations:[...kinds]});}
 function check(ticket,input,owner,viewId,stage){
  identity(owner,viewId);const scope=target(input),t=clock();if(!string(ticket))fail('INVALID_CONFIRMATION');const x=tickets.get(ticket);
  if(!x)fail('STALE_CONFIRMATION');if(x.owner!==owner||x.viewId!==viewId||x.stage!==stage)fail('INVALID_CONFIRMATION');
  if(!same(x.target,scope)){tickets.delete(ticket);fail('STALE_CONFIRMATION');}return{x,t};
 }
 function begin(input,owner,viewId){
  identity(owner,viewId);const scope=target(input),t=clock();if(current(scope,t).active)fail('PRODUCTION_ALREADY_ENABLED');
  for(const[k,x]of tickets)if(x.owner===owner&&x.viewId===viewId)tickets.delete(k);
  if(tickets.size>=LIMIT)fail('PRODUCTION_LIMIT');const x={id:crypto.randomUUID(),target:scope,owner,viewId,stage:'risk',expiresAt:t+TICKET_MS};tickets.set(x.id,x);return challenge(x);
 }
 function advance(ticket,input,owner,viewId){const{x}=check(ticket,input,owner,viewId,'risk');tickets.delete(ticket);const next={...x,id:crypto.randomUUID(),stage:'scope'};tickets.set(next.id,next);return challenge(next);}
 function confirm(ticket,input,owner,viewId){
  const{x,t}=check(ticket,input,owner,viewId,'scope');if(grants.has(x.target.tabId))fail('PRODUCTION_ALREADY_ENABLED');if(grants.size>=LIMIT)fail('PRODUCTION_LIMIT');
  for(const[k,p]of tickets)if(p.target.tabId===x.target.tabId)tickets.delete(k);
  const g={id:crypto.randomUUID(),target:clone(x.target),owner,viewId,expiresAt:t+GRANT_MS};grants.set(g.target.tabId,g);return view(g.target.tabId,t);
 }
 function cancel(ticket,owner,viewId){identity(owner,viewId);clock();if(!string(ticket))fail('INVALID_CONFIRMATION');const x=tickets.get(ticket);if(!x)return false;if(x.owner!==owner||x.viewId!==viewId)fail('INVALID_CONFIRMATION');tickets.delete(ticket);return true;}
 function revokeOwner(owner,viewId){
  if(!owner||typeof owner!=='object'||viewId!==undefined&&!string(viewId))fail('INVALID_CONFIRMATION');
  const retired=[];
  for(const[k,x]of tickets)if(x.owner===owner&&(viewId===undefined||x.viewId===viewId))tickets.delete(k);
  for(const[id,g]of grants)if(g.owner===owner&&(viewId===undefined||g.viewId===viewId)){retired.push(id);revoke(id,'owner-closed');}return retired;
 }
 function revokeAll(reason){tickets.clear();const retired=[...grants.keys()];for(const id of retired)revoke(id,reason);return retired;}
 function snapshot(input){const scope=target(input),t=clock();return current(scope,t);}
 function assert(input,kind){if(!kinds.includes(kind))fail('CAPABILITY_DENIED');const s=snapshot(input);if(!s.active)fail('CAPABILITY_DENIED');return s.grantId;}
 return Object.freeze({begin,advance,confirm,cancel,revoke,revokeOwner,revokeAll,snapshot,assert,
  // Metadata only: callers must supply fresh native facts to snapshot/assert.
  describe:id=>view(tab(id),clock()),expire:()=>{clock();},nextExpiryDelay(){const t=clock();return grants.size?Math.max(0,Math.min(...[...grants.values()].map(g=>g.expiresAt))-t):null;}
 });
}
