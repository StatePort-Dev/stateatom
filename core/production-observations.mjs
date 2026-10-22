// SPDX-License-Identifier: Apache-2.0
// Pure normalized-event ledger. Native admission/clock mapping belongs to its host.
export const PRODUCTION_OBSERVATION_LIMITS=Object.freeze({records:64,pending:32,bytes:65536,durationMs:120000});
const encoder=new TextEncoder(),RESERVE=4096,DATE_MAX=8640000000000000,MAX_COUNT=1000000;
const opaque=s=>typeof s==='string'&&/^[A-Za-z0-9._:-]{1,160}$/.test(s),uuid=s=>typeof s==='string'&&/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(s);
const date=n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=DATE_MAX;
const methods=new Set(['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS','CONNECT','TRACE']);
const categories=new Set(['Error','TypeError','ReferenceError','SyntaxError','RangeError','URIError','EvalError','AggregateError']);
const reasons=new Set(['user','cancelled','navigation','tab-switch','permission-lost','inspector-lost','runtime-stopped','target-replaced','metadata-evicted','context-changed','record-limit','pending-limit','byte-limit','time-limit','clock-invalid']);
const error=code=>Object.assign(Error(code),{code});
function own(value,allowed,code='INVALID_OBSERVATION_FIELDS'){
 if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw error(code);
 const keys=Reflect.ownKeys(value);if(keys.length>allowed.length)throw error(code);const out=Object.create(null);
 for(const key of keys){if(typeof key!=='string'||!allowed.includes(key))throw error(code);const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!('value'in d))throw error(code);out[key]=d.value;}return out;
}
function origin(input){if(typeof input!=='string'||input.length>4096)return null;try{const u=new URL(input);return ['http:','https:'].includes(u.protocol)&&u.origin.length<=512?u.origin:null;}catch{return null;}}
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const v of Object.values(value))freeze(v);Object.freeze(value);}return value;}
const counts=()=>({requests:0,completed:0,transportFailed:0,cancelled:0,redirects:0,httpErrors:0,errors:0,checkpoints:0});
const gaps=()=>({beforeStart:0,future:0,foreignContext:0,unmatched:0,invalid:0,outOfOrder:0,recordLimit:0,pendingLimit:0,byteLimit:0});
export function createProductionObservation(input){
 let options=own(input,['identity','target','now','id','limits']),identity=own(options.identity,['tabId','run','document','frame','origin']),target=own(options.target,['node','property','value','observedAt']);
 if(!Number.isSafeInteger(identity.tabId)||identity.tabId<1||!['run','document','frame'].every(k=>opaque(identity[k]))||origin(identity.origin)!==identity.origin||!opaque(target.node)||!['text','disabled'].includes(target.property)||!date(target.observedAt)||target.property==='disabled'&&typeof target.value!=='boolean')throw error('INVALID_OBSERVATION_FIELDS');
 identity={...identity};target={node:target.node,property:target.property,observedAt:target.observedAt,value:target.property==='disabled'?{state:'included',value:target.value}:{state:'omitted',reason:'private-content'}};
 const now=Object.hasOwn(options,'now')?options.now:Date.now,id=Object.hasOwn(options,'id')?options.id:(()=>crypto.randomUUID());if(typeof now!=='function'||typeof id!=='function')throw error('INVALID_OBSERVATION_FIELDS');
 const configured=own(options.limits===undefined?{}:options.limits,Object.keys(PRODUCTION_OBSERVATION_LIMITS),'INVALID_OBSERVATION_LIMITS'),limits={...PRODUCTION_OBSERVATION_LIMITS,...configured};
 for(const[k,max]of Object.entries(PRODUCTION_OBSERVATION_LIMITS))if(!Number.isSafeInteger(limits[k])||limits[k]<(k==='bytes'?8192:1)||limits[k]>max)throw error('INVALID_OBSERVATION_LIMITS');
 options=null;input=null;
 let sequence=0,lastClock=null;const pending=new Map();
 const empty=status=>({schema:'stateatom.production-observation/1',exportable:false,executable:false,status,windowId:null,identity:null,target:null,startedAt:null,endedAt:null,deadlineAt:null,lastObservedAt:null,stopReason:null,missingHistory:{before:true,after:true},causalDependency:'unknown',limits:{...limits},counts:counts(),gaps:gaps(),records:[]});
 let state=freeze(empty('not-recorded'));
 const size=s=>encoder.encode(JSON.stringify(s)).length;
 function gap(kind){state=freeze({...state,gaps:{...state.gaps,[kind]:Math.min(MAX_COUNT,state.gaps[kind]+1)}});}
 function end(reason,at){pending.clear();state=freeze({...state,status:'stopped',stopReason:reason,endedAt:at,records:state.records.map(r=>r.kind==='network'&&r.completion==='pending'?{...r,completion:'unobserved'}:r)});return state;}
 function tick(){if(state.status!=='recording')return false;let at;try{at=now();}catch{return end('clock-invalid',null),false;}if(!date(at)||at<lastClock)return end('clock-invalid',null),false;lastClock=at;if(at>=state.deadlineAt)return end('time-limit',at),false;return true;}
 function scope(context){let c;try{c=own(context,['tabId','run','document','frame','origin']);}catch{gap('invalid');return false;}if(Object.keys(c).length!==5||Object.keys(identity).some(k=>c[k]!==identity[k])){gap('foreignContext');return false;}return true;}
 function active(context){return tick()&&scope(context);}
 function fields(value,allowed){try{return own(value,allowed);}catch{gap('invalid');return null;}}
 function time(at,min=state.startedAt){if(!date(at)){gap('invalid');return false;}if(at<state.startedAt){gap('beforeStart');return false;}if(at>lastClock){gap('future');return false;}if(at<min){gap('outOfOrder');return false;}return true;}
 function commit(candidate){if(size(candidate)>limits.bytes-RESERVE){gap('byteLimit');end('byte-limit',lastClock);return false;}state=freeze(candidate);return true;}
 function append(record,field,at){if(state.records.length>=limits.records){gap('recordLimit');end('record-limit',lastClock);return false;}return commit({...state,lastObservedAt:Math.max(state.lastObservedAt??state.startedAt,at),records:[...state.records,record],counts:{...state.counts,[field]:state.counts[field]+1}});}
 function find(token){const index=typeof token==='string'?pending.get(token):undefined;if(index===undefined){gap('unmatched');return null;}return{index,row:state.records[index]};}
 function update(index,row,count,at){return commit({...state,lastObservedAt:Math.max(state.lastObservedAt??state.startedAt,at),records:state.records.map((r,i)=>i===index?row:r),counts:count?{...state.counts,[count]:state.counts[count]+1}:state.counts});}
 return Object.freeze({
  start(){if(state.status==='deleted')throw error('OBSERVATION_DELETED');if(state.status!=='not-recorded')throw error('OBSERVATION_ALREADY_STARTED');let at;try{at=now();}catch{throw error('OBSERVATION_CLOCK_UNAVAILABLE');}if(!date(at)||target.observedAt>at||at+limits.durationMs>DATE_MAX)throw error('OBSERVATION_CLOCK_UNAVAILABLE');let windowId;try{windowId=id();}catch{throw error('INVALID_OBSERVATION_FIELDS');}if(!uuid(windowId))throw error('INVALID_OBSERVATION_FIELDS');lastClock=at;state=freeze({...state,status:'recording',windowId,identity:{...identity},target:{...target},startedAt:at,deadlineAt:at+limits.durationMs});if(size(state)>limits.bytes-RESERVE)throw error('INVALID_OBSERVATION_LIMITS');return state;},
  requestStart(value,context){
   if(!active(context))return null;const d=fields(value,['requestId','at','url','method']);if(!d)return null;
   if(!opaque(d.requestId)||typeof d.method!=='string'||d.method.length>32){gap('invalid');return null;}if(!time(d.at))return null;const site=origin(d.url);if(!site){gap('invalid');return null;}
   if(pending.size>=limits.pending){gap('pendingLimit');end('pending-limit',lastClock);return null;}
   const token=state.windowId+':'+(++sequence),record={kind:'network',id:token,requestId:d.requestId,at:d.at,method:methods.has(d.method)?d.method:'OTHER',route:{origin:site,detail:'omitted'},status:null,responseAt:null,endedAt:null,durationMs:null,completion:'pending',timingOrder:'not-completed'};
   if(!append(record,'requests',d.at))return null;pending.set(token,state.records.length-1);return token;
  },
  requestResponse(token,value,context){
   if(!active(context))return false;const found=find(token);if(!found)return false;const d=fields(value,['at','status']);if(!d)return false;if(!Number.isInteger(d.status)||d.status<100||d.status>599||found.row.status!==null){gap('invalid');return false;}if(!time(d.at,found.row.at))return false;
   return update(found.index,{...found.row,status:d.status,responseAt:d.at},d.status>=400?'httpErrors':null,d.at);
  },
  requestEnd(token,value,context){
   if(!active(context))return false;const found=find(token);if(!found)return false;const d=fields(value,['at','outcome']);if(!d)return false;
   const counter={finished:'completed',failed:'transportFailed',cancelled:'cancelled',redirect:'redirects'};
   if(typeof d.outcome!=='string'||!Object.hasOwn(counter,d.outcome)){gap('invalid');return false;}if(!time(d.at,found.row.at))return false;
   if(!update(found.index,{...found.row,endedAt:d.at,durationMs:d.at-found.row.at,completion:d.outcome,timingOrder:found.row.responseAt===null?'response-unobserved':d.at<found.row.responseAt?'end-precedes-response':'response-precedes-end'},counter[d.outcome],d.at))return false;pending.delete(token);return true;
  },
  error(value,context){
   if(!active(context))return false;const d=fields(value,['at','category','url','line','column']);if(!d||!time(d.at))return false;
   const site=origin(d.url),position=n=>Number.isSafeInteger(n)&&n>=0&&n<=10000000?n:null;
   const location=site?{origin:site,line:position(d.line),column:position(d.column),positionBase:0,file:'omitted'}:null;
   return append({kind:'error',id:state.windowId+':'+(++sequence),at:d.at,category:typeof d.category==='string'&&d.category.length<=80&&categories.has(d.category)?d.category:'Unknown',location},'errors',d.at);
  },
  checkpoint(value,context){
   if(!active(context))return false;const d=fields(value,['at','node','changeKind','value']);if(!d||!time(d.at))return false;
   if(d.node!==target.node){gap('foreignContext');return false;}if(!['snapshot','attribute','text','children'].includes(d.changeKind)){gap('invalid');return false;}
   if(target.property==='disabled'&&Object.hasOwn(d,'value')&&typeof d.value!=='boolean'){gap('invalid');return false;}
   const projection=target.property==='text'?{state:'omitted',reason:'private-content'}:Object.hasOwn(d,'value')?{state:'included',value:d.value}:{state:'not-read'};
   return append({kind:'dom',id:state.windowId+':'+(++sequence),at:d.at,node:target.node,property:target.property,changeKind:d.changeKind,value:projection},'checkpoints',d.at);
  },
  stop(reason='user'){if(!reasons.has(reason))throw error('INVALID_OBSERVATION_REASON');if(tick())end(reason,lastClock);return state;},
  clear(){pending.clear();identity=null;target=null;state=freeze(empty('deleted'));return state;},
  snapshot(){tick();return state;}
 });
}
