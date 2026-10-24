// SPDX-License-Identifier: Apache-2.0
// Inert native-control acknowledgements and owned undo, never a page writer.
import {prepareExperimentPlan,parseExperimentPlan,validateExperimentPlan} from './experiment-plan.mjs';
const clone=x=>structuredClone(x),equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=(code,message=code)=>{throw Object.assign(new Error(message),{name:'ControlLedgerError',code});};
function inert(input){let count=0;function copy(x,depth=0){if(++count>8192||depth>16)fail('INVALID_DATA');if(x===null||x===undefined||['string','number','boolean'].includes(typeof x))return x;if(typeof x!=='object'||!Array.isArray(x)&&![Object.prototype,null].includes(Object.getPrototypeOf(x)))fail('INVALID_DATA');const array=Array.isArray(x),out=array?[]:{};for(const key of Reflect.ownKeys(x)){if(array&&key==='length')continue;const d=Object.getOwnPropertyDescriptor(x,key);if(typeof key!=='string'||['__proto__','constructor','prototype'].includes(key)||!d?.enumerable||!Object.hasOwn(d,'value')||array&&!/^(0|[1-9]\d*)$/.test(key))fail('INVALID_DATA');out[key]=copy(d.value,depth+1);}if(array&&(out.length!==x.length||Object.keys(out).length!==x.length))fail('INVALID_DATA');return out;}return copy(input);}
function checkedTarget(investigationId,input){
 // Internal validation sentinel only, never an observed/writable resource.
 const target=inert(input);return prepareExperimentPlan({investigationId,mode:'live',target,changes:[{resource:{id:'validation',kind:'dom-control',revision:0,type:'string',value:'',writable:true,locator:{document:target.document,node:'validation',selector:'html',control:'text'}},value:''}]}).target;
}
const occurrence=(a,b)=>['tabId','origin','run','document','node','selector','property','build'].every(k=>a[k]===b[k]);
export function createControlLedger({investigationId,target}){
 const selected=checkedTarget(investigationId,target),records=new Map(),history=[],stack=[],baselines=new Map(),owned=new Map(),plans=new Set();let revision=0,pending=null,closed=false,closeReason=null,tainted=false;
 const available=()=>{if(closed)fail('EDITOR_CLOSED');if(tainted)fail('UNCONFIRMED_EFFECT');if(pending)fail('EDITOR_BUSY');if(history.length>=64)fail('HISTORY_LIMIT');};
 const resources=()=>[...records.values()].filter(r=>r.present).map(r=>r.resource);
 function checkedResources(input){const values=inert(input);if(!Array.isArray(values))fail('INVALID_DATA');if(values.length>32)fail('RESOURCE_LIMIT');if(!values.length)return[];const p=prepareExperimentPlan({investigationId,mode:'live',target:selected,changes:values.map(resource=>({resource,value:resource.value}))});if(p.changes.some(c=>c.resource.kind!=='dom-control'))fail('RESOURCE_UNSUPPORTED');return p.changes.map(c=>c.resource);}
 const restorationEntries=kind=>kind==='undo'?stack.at(-1)?.entries:[...baselines].map(([id,b])=>({id,...b}));
 const ownsRestorationEntries=entries=>!!entries?.length&&entries.every(e=>{const r=records.get(e.id),owner=owned.get(e.id);return r?.present&&r.epoch===e.epoch&&!!owner&&owner.epoch===r.epoch&&equal(owner.resource,r.resource);});
 function snapshot(){const available=!closed&&!tainted&&!pending&&history.length<64,undo=restorationEntries('undo'),baseline=restorationEntries('baseline');return clone({investigationId,target:selected,revision,closed,closeReason,tainted,resources:[...records.values()].filter(r=>r.present).map(r=>({resource:r.resource,externalRevision:r.epoch>0,consumption:'unknown',effect:'unknown'})),history,pending:pending?{kind:pending.tx.kind,remaining:pending.changes.length-pending.next}:null,canUndo:available&&ownsRestorationEntries(undo),canRestoreBaseline:available&&ownsRestorationEntries(baseline)&&baseline.some(e=>!Object.is(records.get(e.id).resource.value,e.resource.value))});}
 function observeControls(input){
  if(closed)fail('EDITOR_CLOSED');if(pending)fail('EDITOR_BUSY');const values=checkedResources(input),ids=new Set(values.map(r=>r.id));if(records.size+values.filter(r=>!records.has(r.id)).length>32)fail('RESOURCE_LIMIT');
  for(const r of records.values())if(r.present&&!ids.has(r.resource.id)){r.present=false;r.epoch++;revision++;}
  for(const resource of values){let r=records.get(resource.id);if(!r){r={resource,present:true,epoch:0};records.set(resource.id,r);revision++;}else if(!r.present||!equal(r.resource,resource)){r.epoch++;r.resource=resource;r.present=true;revision++;}}
  return snapshot();
 }
 function guard(input){const fresh=inert(input),current=checkedTarget(investigationId,fresh.target);if(!occurrence(selected,current))fail('STALE_TARGET');if(fresh.admission?.available!==true||!Array.isArray(fresh.admission.grants)||!['read','inject','replay'].every(g=>fresh.admission.grants.includes(g)))fail('CAPABILITY_DENIED');return fresh;}
 function reserve(p,kind,entries,previous=null){
  const changes=p.changes.filter(c=>!Object.is(c.resource.value,c.value));if(!changes.length)fail('NO_CHANGE');const receipt=crypto.randomUUID(),tx={id:p.id,kind,mode:p.mode,phase:'prepared',atomic:false,consumption:'unknown',effect:'unknown',applicationRestored:false,outcomes:[]};pending={receipt,changes:clone(changes),tx,entries,previous,next:0};plans.add(p.id);return clone({receipt,changes,transaction:tx});
 }
 function prepareApply(input,current){
  available();const p=parseExperimentPlan(input);if(p.investigationId!==investigationId)fail('STALE_INVESTIGATION');if(plans.has(p.id))fail('PLAN_REPLAY');const fresh=guard(current);validateExperimentPlan(p,{target:fresh.target,resources:resources(),admission:fresh.admission});if(p.changes.some(c=>c.resource.kind!=='dom-control'))fail('RESOURCE_UNSUPPORTED');return reserve(p,'apply',p.changes.map(c=>({id:c.resource.id,resource:clone(c.resource),epoch:records.get(c.resource.id).epoch})));
 }
 function prepareRestore(kind,input){
  available();const fresh=guard(input);if(fresh.expectedRevision!==revision)fail('STALE_RESOURCE');const previous=kind==='undo'?stack.at(-1):null,entries=restorationEntries(kind);if(!entries?.length)fail('NO_CHANGE');
  if(!ownsRestorationEntries(entries))fail('EXTERNAL_REVISION');
  const p=prepareExperimentPlan({investigationId,mode:'draft',target:fresh.target,changes:entries.map(e=>({resource:records.get(e.id).resource,value:e.resource.value}))});validateExperimentPlan(p,{target:fresh.target,resources:resources(),admission:fresh.admission});return reserve(p,kind,clone(entries),previous);
 }
 function batch(receipt){if(!pending||pending.receipt!==receipt)fail('STALE_RECEIPT');return pending;}
 function confirmControl(receipt,input){
  const b=batch(receipt),result=inert(input),c=b.changes[b.next];if(!c||result.resourceId!==c.resource.id)fail('OUT_OF_ORDER');if(!['applied','failed','unconfirmed'].includes(result.status)||result.error!==undefined&&typeof result.error!=='string')fail('INVALID_RECEIPT');let after;
  if(result.status==='applied'){
   after=checkedResources([result.after])[0];const identity=r=>({id:r.id,kind:r.kind,type:r.type,writable:r.writable,locator:r.locator});if(!equal(identity(after),identity(c.resource))||!Object.is(after.value,c.value)||after.revision===c.resource.revision)fail('INVALID_RECEIPT');
  }else if(Object.hasOwn(result,'after'))fail('INVALID_RECEIPT');
  const out={resourceId:c.resource.id,phase:result.status,afterClose:closed,value:c.value,consumption:'unknown',effect:'unknown',...(result.error?{error:result.error.slice(0,512)}:{})};
  if(after){const r=records.get(c.resource.id);r.resource=after;owned.set(c.resource.id,{resource:clone(after),epoch:r.epoch});out.after=clone(after);revision++;}else if(result.status==='unconfirmed')tainted=true;
  b.tx.outcomes.push(out);b.next++;return snapshot();
 }
 function finish(receipt){
  const b=batch(receipt);while(b.next<b.changes.length){const c=b.changes[b.next++];b.tx.outcomes.push({resourceId:c.resource.id,phase:'unattempted',value:c.value,consumption:'unknown',effect:'unknown'});}
  const applied=b.tx.outcomes.filter(o=>o.phase==='applied'),ids=new Set(applied.map(o=>o.resourceId)),bad=b.tx.outcomes.some(o=>o.phase!=='applied'),unknown=b.tx.outcomes.some(o=>o.phase==='unconfirmed');b.tx.phase=unknown?(applied.length?'partial-unconfirmed':'unconfirmed'):bad?(applied.length?'partial-failure':'failed'):applied.some(o=>o.afterClose)?'applied-after-close':'applied';
  if(b.tx.kind==='apply'&&applied.length){const entries=b.entries.filter(e=>ids.has(e.id));for(const e of entries)if(!baselines.has(e.id))baselines.set(e.id,{resource:clone(e.resource),epoch:e.epoch});stack.push({entries:clone(entries)});}
  else if(b.tx.kind==='undo'&&b.previous){b.previous.entries=b.previous.entries.filter(e=>!ids.has(e.id));if(!b.previous.entries.length)stack.pop();}
  else if(b.tx.kind==='baseline'&&applied.length){for(const entry of stack)entry.entries=entry.entries.filter(e=>!ids.has(e.id));for(let i=stack.length-1;i>=0;i--)if(!stack[i].entries.length)stack.splice(i,1);}
  history.push(b.tx);pending=null;revision++;return snapshot();
 }
 function close(reason='closed'){if(typeof reason!=='string')fail('INVALID_REASON');if(!closed){closed=true;closeReason=reason.slice(0,512);revision++;}return snapshot();}
 return Object.freeze({observeControls,prepareApply,prepareUndo:input=>prepareRestore('undo',input),prepareBaseline:input=>prepareRestore('baseline',input),confirmControl,finish,close,snapshot});
}
