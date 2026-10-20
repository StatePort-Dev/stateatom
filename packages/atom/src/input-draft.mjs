// SPDX-License-Identifier: Apache-2.0
// Inert UI draft/acknowledgement state. No scheduler, transport or native writer.
import{prepareExperimentPlan}from'../../../core/experiment-plan.mjs';
const clone=v=>structuredClone(v),error=code=>Object.assign(new Error(code),{code});
const equal=(a,b)=>Object.is(a,b)||!!a&&!!b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)&&Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>Object.hasOwn(b,k)&&equal(a[k],b[k]));
const text=r=>r.type==='boolean'?r.value:String(r.value);
function parsed(resource,raw){
 let value;
 if(resource.type==='boolean'){if(typeof raw==='boolean')value=raw;else if(raw==='true'||raw==='false')value=raw==='true';else return{valid:false,error:'Choose true or false'};}
 else if(resource.type==='number'){
  if(typeof raw!=='string'||!/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(raw))return{valid:false,error:'Enter a complete finite number'};
  value=Number(raw);if(!Number.isFinite(value)||Object.is(value,-0))return{valid:false,error:'Enter a finite number other than negative zero'};
 }else if(resource.type==='string'){
  if(typeof raw!=='string'||raw.length>4096||new TextEncoder().encode(raw).length>4096)return{valid:false,error:'Text exceeds the 4096-byte field limit'};value=raw;
 }else return{valid:false,error:'Unsupported scalar type'};
 if(resource.kind==='dom-control'&&resource.locator.control==='select'&&!resource.locator.options?.includes(value))return{valid:false,error:'Choose an observed enabled option'};
 return{valid:true,value,error:null};
}
const identity=r=>({id:r.id,kind:r.kind,type:r.type,writable:r.writable,locator:r.locator});
function acknowledged(c,o,row,plan){
 if(c.resource.kind==='dom-control'){
  if(o?.phase!=='applied'||!o.after)return false;
  try{
   const after=prepareExperimentPlan({id:plan.id,investigationId:plan.investigationId,mode:plan.mode,target:plan.target,changes:[{resource:o.after,value:c.value}]}).changes[0].resource;
   return equal(identity(after),identity(c.resource))&&Object.is(after.value,c.value)&&after.revision!==c.resource.revision;
  }catch{return false;}
 }
 return ['waiting','delivered','delivered-after-close'].includes(o?.phase)&&Object.is(o.value,c.value)&&(o.phase!=='waiting'||row?.rule?.transactionId===plan.id);
}
export function createInputDraft({mode='live'}={}){
 if(!['live','draft'].includes(mode))throw error('INVALID_MODE');
 let state=null,rows=new Map(),drafts=new Map(),generation=0,version=0,flight=null,heldDraft=false;
 const editable=()=>!!state&&!state.closed&&!state.tainted;
 function begin(snapshot){generation++;state=clone(snapshot);rows=new Map(state.resources.map(r=>[r.resource.id,r]));drafts=new Map();flight=null;heldDraft=false;return output();}
 function receive(snapshot){
  if(!state||snapshot.investigationId!==state.investigationId||snapshot.revision<state.revision)return false;
  state=clone(snapshot);rows=new Map(state.resources.map(r=>[r.resource.id,r]));
  for(const[id,d]of drafts)if(!equal(rows.get(id)?.resource,d.resource))d.conflict=true;
  return true;
 }
 function edit(id,raw){
  if(!editable())throw error('EDITOR_CLOSED');const row=rows.get(id);if(!row||row.resource.writable!==true)throw error('RESOURCE_UNSUPPORTED');
  if(!['string','boolean'].includes(typeof raw))throw error('INVALID_FIELD_INPUT');
  const value=parsed(row.resource,raw),prior=drafts.get(id),pendingValue=flight?.plan.changes.find(c=>c.resource.id===id),baseline=pendingValue?pendingValue.value:row.resource.value;
  if(value.valid&&Object.is(value.value,baseline)){drafts.delete(id);if(!drafts.size)heldDraft=false;return output();}
  drafts.set(id,{resource:clone(prior?.resource||row.resource),raw,version:++version,conflict:prior?.conflict===true,...value});return output();
 }
 function setMode(next){if(!['live','draft'].includes(next))throw error('INVALID_MODE');if(next==='live'&&mode==='draft'&&drafts.size)heldDraft=true;mode=next;if(next==='draft')heldDraft=false;return output();}
 function discard(id){if(flight)throw error('BUSY');if(id===undefined)drafts.clear();else drafts.delete(id);if(!drafts.size)heldDraft=false;return output();}
 function output(){
  const ids=new Set([...rows.keys(),...drafts.keys()]),entries=[...ids].map(id=>{const row=rows.get(id),d=drafts.get(id),resource=row?.resource||d.resource;return{id,resource:clone(resource),draftResource:d?clone(d.resource):null,raw:d?d.raw:text(resource),value:d?.valid?d.value:resource.value,dirty:!!d,valid:d?d.valid:true,conflict:d?.conflict===true,missing:!row,error:d?.error||null};});
  const dirty=entries.filter(e=>e.dirty),valid=e=>e.valid&&!e.conflict&&!e.missing;
  return clone({investigationId:state?.investigationId||null,mode,heldDraft,pending:!!flight,closed:!editable(),entries,dirtyCount:dirty.length,canApply:editable()&&!flight&&dirty.length>0&&dirty.length<=32&&dirty.every(valid),liveCandidates:editable()&&mode==='live'&&!heldDraft&&!flight?dirty.filter(e=>valid(e)&&!e.error).map(e=>e.id):[]});
 }
 function prepare({mode:requested=mode,ids}={}){
  if(flight)throw error('BUSY');if(!editable())throw error('EDITOR_CLOSED');if(!['live','draft'].includes(requested)||requested==='live'&&mode!=='live')throw error('INVALID_MODE');if(requested==='live'&&heldDraft)throw error('DRAFT_PENDING');
  const selected=ids||[...drafts.keys()];if(!Array.isArray(selected)||!selected.length||new Set(selected).size!==selected.length||selected.length>32)throw error('NO_CHANGE');
  const members=selected.map(id=>{const d=drafts.get(id),row=rows.get(id);if(!d||!d.valid)throw error('INVALID_FIELD_INPUT');if(d.conflict||!row||!equal(d.resource,row.resource))throw error('STALE_RESOURCE');return{id,d,row};});
  const plan=prepareExperimentPlan({investigationId:state.investigationId,mode:requested,target:state.target,changes:members.map(({d,row})=>({resource:row.resource,value:d.value}))});
  const ticket=crypto.randomUUID();flight={ticket,generation,plan,versions:new Map(members.map(({id,d})=>[id,d.version]))};return{ticket,plan:clone(plan)};
 }
 function settle(ticket,snapshot){
  if(!flight||flight.ticket!==ticket||flight.generation!==generation||snapshot.investigationId!==state.investigationId)return false;
  const sent=flight;flight=null;const effective=snapshot.revision<state.revision?state:snapshot;const tx=snapshot.history?.find(t=>t.id===sent.plan.id),outcomes=new Map((tx?.outcomes||[]).map(o=>[o.resourceId,o])),fresh=new Map(effective.resources.map(r=>[r.resource.id,r]));
  for(const c of sent.plan.changes){
   const d=drafts.get(c.resource.id);if(!d)continue;const o=outcomes.get(c.resource.id),row=fresh.get(c.resource.id),accepted=acknowledged(c,o,row,sent.plan);
   if(accepted&&d.version===sent.versions.get(c.resource.id)){drafts.delete(c.resource.id);continue;}
   const own=accepted&&row&&(c.resource.kind==='dom-control'?equal(row.resource,o.after):row.rule?.transactionId===sent.plan.id&&Object.is(row.resource.value,c.value));
   if(own){d.resource=clone(row.resource);d.conflict=false;d.error=null;}
   else if(!accepted){d.error=o?.error||(['failed','unattempted'].includes(o?.phase)?o.phase:'ACK_UNCONFIRMED');if(d.error==='ACK_UNCONFIRMED')d.conflict=true;}
  }
  receive(effective);if(!drafts.size)heldDraft=false;return true;
 }
 function reject(ticket,code='REQUEST_FAILED'){if(!flight||flight.ticket!==ticket)return false;for(const[id,v]of flight.versions){const d=drafts.get(id);if(d&&d.version===v)d.error=String(code).slice(0,256);}flight=null;return true;}
 return Object.freeze({begin,receive,edit,setMode,discard,prepare,settle,reject,snapshot:output});
}
