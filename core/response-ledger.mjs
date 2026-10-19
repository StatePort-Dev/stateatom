// SPDX-License-Identifier: Apache-2.0
// Inert, document-bound response editing. No CDP, fetch, reload or app-state writer.
import {prepareExperimentPlan,parseExperimentPlan,validateExperimentPlan} from './experiment-plan.mjs';

const utf8=new TextEncoder();
const unsafe=new Set(['__proto__','constructor','prototype']);
const copy=value=>structuredClone(value);
const keyOf=(url,pointer)=>JSON.stringify([url,pointer]);
function fail(code,message){const e=new Error(message);e.name='ResponseLedgerError';e.code=code;throw e;}
function checkedTarget(investigationId,target){
 // Reuse the inert contract's identity/type/budget validation, without an adapter.
 return prepareExperimentPlan({investigationId,mode:'live',target,changes:[{resource:{id:'validation',kind:'json-response',revision:0,type:'boolean',value:true,writable:true,locator:{url:(Object.getOwnPropertyDescriptor(target,'origin')?.value??'')+'/',method:'GET',requestId:'validation',requestOrdinal:1,pointer:'/value'}},value:false}]}).target;
}
function sameOccurrence(a,b){return ['tabId','origin','run','document','node','selector','property','build'].every(k=>a[k]===b[k]);}
function scalar(value){return ['boolean','number','string'].includes(typeof value)&&!(typeof value==='number'&&(!Number.isFinite(value)||Object.is(value,-0)))&&!(typeof value==='string'&&utf8.encode(value).length>4096);}
function parseBody(body){
 if(typeof body!=='string'||utf8.encode(body).length>262144)fail('RESPONSE_UNSUPPORTED','JSON response body exceeds 256 KiB');
 let parsed;try{parsed=JSON.parse(body);}catch{fail('RESPONSE_UNSUPPORTED','Response is not JSON');}
 let count=0;const leaves=[];
 function visit(value,pointer,depth){
  if(++count>4096||depth>12)fail('RESPONSE_UNSUPPORTED','JSON response structure budget exceeded');
  if(value&&typeof value==='object')for(const k of Object.keys(value)){
   if(unsafe.has(k))fail('RESPONSE_UNSUPPORTED','Unsafe JSON key');
   visit(value[k],pointer+'/'+k.replace(/~/g,'~0').replace(/\//g,'~1'),depth+1);
  }else if(pointer&&utf8.encode(pointer).length<=1024&&scalar(value))leaves.push({pointer,value});
 }
 visit(parsed,'',0);return {parsed,leaves};
}
function replaceLeaf(body,pointer,value){
 const keys=pointer.slice(1).split('/').map(k=>k.replace(/~1/g,'/').replace(/~0/g,'~'));let at=body;
 for(const k of keys.slice(0,-1))at=at[k];at[keys.at(-1)]=value;
}

export function createResponseLedger({investigationId,target}){
 const selected=checkedTarget(investigationId,target);
 const records=new Map(),byKey=new Map(),ordinals=new Map(),pending=new Map(),history=[],stack=[],baselines=new Map(),plans=new Set(),restorations=new Map();
 let revision=0,nextResource=0,receiptCount=0,closed=false,closeReason=null;
 function open(){if(closed)fail('EDITOR_CLOSED','Investigation is closed');}
 function idle(){if(pending.size)fail('EDITOR_BUSY','A response delivery is in flight');}
 function room(){if(history.length>=64)fail('HISTORY_LIMIT','Start a new investigation before more edits');}
 function targetGuard(fresh){
  const checked=checkedTarget(investigationId,fresh.target);
  if(!sameOccurrence(selected,checked))fail('STALE_TARGET','Selected physical occurrence changed');
  if(fresh.admission?.available!==true||!Array.isArray(fresh.admission.grants)||!['read','override'].every(g=>fresh.admission.grants.includes(g)))fail('CAPABILITY_DENIED','Current runtime authority is required');
 }
 function touch(r){r.resource.revision=++revision;}
 function phase(tx){
  const phases=tx.outcomes.map(o=>o.phase),delivered=phases.filter(p=>p==='delivered'||p==='delivered-after-close').length;
  if(phases.some(p=>p==='failed'))tx.phase=delivered||tx.outcomes.some(o=>o.deliveries?.some(d=>d.delivered))?'partial-failure':'failed';
  else if(delivered===phases.length)tx.phase='delivered';
  else if(delivered)tx.phase='partial';
  else if(phases.some(p=>p==='prepared'))tx.phase='prepared';
  else if(phases.every(p=>p==='superseded'))tx.phase='superseded';
  else if(phases.every(p=>p==='closed'))tx.phase='closed';
  else tx.phase=closed?'closed':'waiting';
 }
 function outcome(rule,id,value){
  const tx=history.find(t=>t.id===(rule.historyId??rule.transactionId)),o=tx?.outcomes.find(o=>o.resourceId===id);
  if(o){const {delivery,...fields}=value;if(delivery)(o.deliveries??=[]).push(delivery);Object.assign(o,fields);phase(tx);}
 }
 function inspect(facts){
  let u;try{u=new URL(facts.url);}catch{fail('RESPONSE_MISMATCH','Exact same-origin GET response required');}
  if(u.origin!==selected.origin||u.href!==facts.url||u.hash||u.username||u.password||facts.method!=='GET'||facts.document!==selected.document||typeof facts.requestId!=='string'||!facts.requestId||utf8.encode(facts.requestId).length>512||!Number.isSafeInteger(facts.requestOrdinal)||facts.requestOrdinal<=0||facts.requestOrdinal<=(ordinals.get(facts.url)??0))fail('RESPONSE_MISMATCH','Response occurrence is foreign, repeated or out of order');
  if([...pending.values()].some(p=>p.url===facts.url))fail('EDITOR_BUSY','Prior response delivery is in flight');
  if(!ordinals.has(facts.url)&&ordinals.size>=128)fail('RESOURCE_LIMIT','Investigation limit is 128 response URLs');
  const parsed=parseBody(facts.body),keys=new Set(parsed.leaves.map(l=>keyOf(facts.url,l.pointer)));
  const additions=[...keys].filter(k=>!byKey.has(k)).length;
  if(records.size+additions>128)fail('RESOURCE_LIMIT','Investigation limit is 128 scalar resource sites');
  return {...parsed,keys};
 }
 function recordResponse(facts,parsed){
  for(const r of records.values())if(r.resource.locator.url===facts.url&&!parsed.keys.has(r.key)){
   if(r.present){r.present=false;r.externalEpoch++;touch(r);}
  }
  for(const leaf of parsed.leaves){
   const key=keyOf(facts.url,leaf.pointer);let r=records.get(byKey.get(key));
   if(!r){const id='response:'+ ++nextResource;r={key,present:true,serverValue:leaf.value,externalEpoch:0,rule:null,resource:{id,kind:'json-response',revision:0,type:typeof leaf.value,value:leaf.value,writable:true,locator:{}}};records.set(id,r);byKey.set(key,id);}
   else if(!r.present||!Object.is(r.serverValue,leaf.value)){r.externalEpoch++;}
   r.present=true;r.serverValue=leaf.value;r.resource.type=typeof leaf.value;r.resource.value=r.rule?r.rule.value:leaf.value;
   r.resource.locator={url:facts.url,method:'GET',requestId:facts.requestId,requestOrdinal:facts.requestOrdinal,pointer:leaf.pointer};touch(r);
  }
  ordinals.set(facts.url,facts.requestOrdinal);
 }
 function active(url){return [...records.values()].filter(r=>r.rule&&r.resource.locator.url===url);}
 function watches(url){return [...restorations].filter(([id])=>records.get(id)?.resource.locator.url===url);}
 function snapshot(){return copy({investigationId,target:selected,revision,closed,closeReason,resources:[...records.values()].filter(r=>r.present).map(r=>({resource:r.resource,serverValue:r.serverValue,rule:r.rule,externalRevision:r.externalEpoch>0,consumption:'unknown',effect:'unknown'})),history,pending:[...pending].map(([receipt,p])=>({receipt,url:p.url,resourceIds:p.entries.map(e=>e.id)})),canUndo:stack.length>0,canRestoreBaseline:baselines.size>0});}
 function observeResponse(facts){
  open();if(active(facts.url).length||watches(facts.url).length)fail('EDITOR_BUSY','Use guarded response preparation while rules exist');
  const parsed=inspect(facts);recordResponse(facts,parsed);return snapshot();
 }
 function apply(input,fresh){
  open();idle();room();const p=parseExperimentPlan(input);
  if(p.investigationId!==investigationId)fail('STALE_INVESTIGATION','Plan belongs to another investigation');
  if(plans.has(p.id))fail('PLAN_REPLAY','Plan was already applied');
  targetGuard(fresh);
  validateExperimentPlan(p,{target:fresh.target,resources:p.changes.map(c=>records.get(c.resource.id)).filter(r=>r?.present).map(r=>r.resource),admission:fresh.admission});
  if(p.changes.some(c=>c.resource.kind!=='json-response'))fail('RESOURCE_UNSUPPORTED','This adapter only edits response scalars');
  if(p.changes.every(c=>Object.is(c.resource.value,c.value)))fail('NO_CHANGE','Plan does not change an input');
  const tx={id:p.id,kind:'apply',mode:p.mode,phase:'waiting',atomic:false,consumption:'unknown',effect:'unknown',applicationRestored:false,outcomes:[],before:[]};
  for(const c of p.changes){
   const r=records.get(c.resource.id);
   const before={id:r.resource.id,rule:copy(r.rule),epoch:r.externalEpoch};tx.before.push(before);
   const prior=restorations.get(r.resource.id);if(prior){outcome(prior,r.resource.id,{phase:'superseded'});restorations.delete(r.resource.id);}
   if(!baselines.has(r.resource.id))baselines.set(r.resource.id,{...copy(before),serverValue:r.serverValue});
   r.rule={value:c.value,phase:'waiting',transactionId:p.id,baseValue:r.serverValue,epoch:r.externalEpoch};r.resource.value=c.value;touch(r);
   tx.outcomes.push({resourceId:r.resource.id,phase:'waiting',value:c.value,consumption:'unknown',effect:'unknown'});
  }
  plans.add(p.id);history.push(tx);stack.push(tx);return copy(tx);
 }
 function prepareResponse(facts){
  open();const parsed=inspect(facts),rules=active(facts.url),waiting=watches(facts.url);
  if(!rules.length&&!waiting.length){recordResponse(facts,parsed);return {receipt:null,body:facts.body,modified:false};}
  const values=new Map(parsed.leaves.map(l=>[l.pointer,l.value]));
  const conflict=rules.some(r=>!values.has(r.resource.locator.pointer)||!Object.is(values.get(r.resource.locator.pointer),r.rule.baseValue)||r.externalEpoch!==r.rule.epoch)||waiting.some(([id,w])=>{const r=records.get(id);return !values.has(r.resource.locator.pointer)||!Object.is(values.get(r.resource.locator.pointer),w.value)||r.externalEpoch!==w.epoch;});
  if(conflict){
   for(const r of rules){outcome(r.rule,r.resource.id,{phase:'failed',error:'EXTERNAL_REVISION'});r.rule=null;r.externalEpoch++;}
   for(const [id,w] of waiting){outcome(w,id,{phase:'failed',error:'EXTERNAL_REVISION'});restorations.delete(id);records.get(id).externalEpoch++;}
   recordResponse(facts,parsed);return {receipt:null,body:facts.body,modified:false,reason:'EXTERNAL_REVISION'};
  }
  if(pending.size>=32)fail('EDITOR_BUSY','Too many in-flight response deliveries');
  if(receiptCount>=128)fail('DELIVERY_LIMIT','Investigation delivery evidence budget exhausted');
  for(const r of rules)replaceLeaf(parsed.parsed,r.resource.locator.pointer,r.rule.value);
  const body=rules.length?JSON.stringify(parsed.parsed):facts.body,receipt=crypto.randomUUID();
  if(utf8.encode(body).length>262144)fail('RESPONSE_UNSUPPORTED','Patched JSON response exceeds 256 KiB');
  recordResponse(facts,parsed);
  const entries=rules.map(r=>{r.rule.phase='prepared';outcome(r.rule,r.resource.id,{phase:'prepared'});return {id:r.resource.id,rule:copy(r.rule)};});
  for(const [id,w] of waiting){outcome(w,id,{phase:'prepared'});entries.push({id,rule:copy(w),restoration:true});}
  receiptCount++;pending.set(receipt,{url:facts.url,requestId:facts.requestId,requestOrdinal:facts.requestOrdinal,entries});return {receipt,body,modified:rules.length>0};
 }
 function confirmResponse(receipt,result){
  const delivery=pending.get(receipt);if(!delivery)fail('STALE_RECEIPT','Unknown or already confirmed response receipt');
  if(!result||typeof result.delivered!=='boolean'||result.error!==undefined&&typeof result.error!=='string')fail('INVALID_RECEIPT','Delivery acknowledgement required');
  pending.delete(receipt);
  for(const e of delivery.entries){
   const r=records.get(e.id),isCurrent=r?.rule?.transactionId===e.rule.transactionId;
   const value={phase:result.delivered?(closed?'delivered-after-close':'delivered'):'failed',...(result.error?{error:result.error.slice(0,512)}:{})};
   outcome(e.rule,e.id,{...value,delivery:{receipt,url:delivery.url,requestId:delivery.requestId,requestOrdinal:delivery.requestOrdinal,delivered:result.delivered,...(value.error?{error:value.error}:{}),afterClose:closed}});
   if(e.restoration){restorations.delete(e.id);continue;}
   if(isCurrent){if(result.delivered)r.rule.phase='delivered';else{r.rule=null;r.resource.value=r.serverValue;}touch(r);}
  }
  revision++;return snapshot();
 }
 function restoration(kind,fresh){
  open();idle();room();targetGuard(fresh);if(fresh.expectedRevision!==revision)fail('STALE_RESOURCE','Ledger changed; refresh before undo');
  const previous=kind==='undo'?stack.at(-1):null;
  if(kind==='undo'&&!previous)fail('NO_CHANGE','No edit remains to undo');
  const changes=kind==='undo'?previous.before:[...baselines.values()];
  if(!changes.length)fail('NO_CHANGE','No baseline is recorded');
  for(const c of changes){const r=records.get(c.id);if(!r?.present||r.externalEpoch!==c.epoch)fail('EXTERNAL_REVISION','Cannot overwrite an external response revision');if(kind==='undo'&&r.rule?.transactionId!==previous.id)fail('STALE_RESOURCE','Edit no longer owns this rule');}
  if(kind==='baseline'&&changes.every(c=>!records.get(c.id).rule))fail('NO_CHANGE','Baseline rules are already restored');
  const tx={id:crypto.randomUUID(),kind,phase:'waiting',atomic:false,consumption:'unknown',effect:'unknown',applicationRestored:false,outcomes:[]};
  for(const c of changes){const r=records.get(c.id);const prior=restorations.get(c.id);if(prior)outcome(prior,c.id,{phase:'superseded'});restorations.delete(c.id);r.rule=copy(c.rule);if(r.rule){r.rule.phase='waiting';r.rule.historyId=tx.id;}else restorations.set(c.id,{historyId:tx.id,value:r.serverValue,epoch:r.externalEpoch});r.resource.value=r.rule?r.rule.value:r.serverValue;touch(r);tx.outcomes.push({resourceId:c.id,phase:'waiting',value:r.resource.value,consumption:'unknown',effect:'unknown'});}
  if(kind==='undo')stack.pop();else stack.length=0;
  history.push(tx);return copy(tx);
 }
 function close(reason='closed'){
  if(typeof reason!=='string')fail('INVALID_REASON','Close reason must be plain text');
  if(closed)return snapshot();closed=true;closeReason=reason.slice(0,512);
  for(const r of records.values())if(r.rule){outcome(r.rule,r.resource.id,{phase:'closed'});r.rule=null;r.resource.value=r.serverValue;touch(r);}
  for(const [id,w] of restorations)outcome(w,id,{phase:'closed'});restorations.clear();
  revision++;return snapshot();
 }
 return Object.freeze({snapshot,responseURLs:()=>[...new Set([...records.values()].filter(r=>r.rule||restorations.has(r.resource.id)).map(r=>r.resource.locator.url))],observeResponse,apply,prepareResponse,confirmResponse,undoLast:fresh=>restoration('undo',fresh),restoreBaseline:fresh=>restoration('baseline',fresh),close});
}
