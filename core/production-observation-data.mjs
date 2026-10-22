// SPDX-License-Identifier: Apache-2.0
// Passive historical validation only. Never reconstructs a collector or owner.
import {PRODUCTION_OBSERVATION_LIMITS} from './production-observations.mjs';
import {observationFail as fail,observationKeys as keys,observationTime as time,observationUUID as uuid,observationJSON as json,observationFrozen as frozen,observationEqual as equal} from './handoff-observation-data.mjs';
const countKeys=['requests','completed','transportFailed','cancelled','redirects','httpErrors','errors','checkpoints'],gapKeys=['beforeStart','future','foreignContext','unmatched','invalid','outOfOrder','recordLimit','pendingLimit','byteLimit'];
const reasons=['user','cancelled','navigation','tab-switch','permission-lost','inspector-lost','runtime-stopped','target-replaced','target-unavailable','metadata-evicted','context-changed','record-limit','pending-limit','byte-limit','time-limit','clock-invalid'];
const opaque=x=>typeof x==='string'&&/^[A-Za-z0-9._:-]{1,160}$/.test(x);
const origin=x=>{if(typeof x!=='string'||x.length>512)return false;try{const u=new URL(x);return ['http:','https:'].includes(u.protocol)&&u.origin===x;}catch{return false;}};
const integer=(x,max=1000000)=>Number.isSafeInteger(x)&&x>=0&&!Object.is(x,-0)&&x<=max;
const check=(yes,message)=>{if(!yes)fail(message);};
const position=x=>x===null||integer(x,10000000);
const value=(v,property,notRead=false)=>{if(property==='text')check(equal(v,{state:'omitted',reason:'private-content'}),'Text content cannot enter an observation');else if(notRead&&equal(v,{state:'not-read'}))return;else{keys(v,['state','value']);check(v.state==='included'&&typeof v.value==='boolean','Boolean observation required');}};

// This structural projection contains no native IDs, origin or selected values.
export function productionObservationStructure(s){
 const out=Object.fromEntries(['status','startedAt','endedAt','deadlineAt','lastObservedAt','stopReason','missingHistory','causalDependency','limits','counts','gaps'].map(k=>[k,structuredClone(s[k])]));
 out.target={property:s.target.property,observedAt:s.target.observedAt};
 out.records=s.records.map((r,sequence)=>{if(r.kind==='network')return Object.fromEntries([['sequence',sequence],...['kind','at','method','status','responseAt','endedAt','durationMs','completion','timingOrder'].map(k=>[k,r[k]])]);if(r.kind==='error')return{kind:r.kind,sequence,at:r.at,category:r.category,locationRecorded:r.location!==null};return{kind:r.kind,sequence,at:r.at,property:r.property,changeKind:r.changeKind,mutationTime:r.mutationTime,readWindow:structuredClone(r.readWindow),valueRecorded:r.value.state==='included'};});
 return out;
}
export function validateProductionObservationStructure(s){
 keys(s,['status','startedAt','endedAt','deadlineAt','lastObservedAt','stopReason','missingHistory','causalDependency','limits','counts','gaps','target','records']);
 check(s.status==='stopped'&&reasons.includes(s.stopReason),'Only a stopped historical window can be reviewed');
 check(time(s.startedAt)&&time(s.deadlineAt)&&(s.endedAt===null||time(s.endedAt)&&s.endedAt>=s.startedAt),'Invalid window clocks');
 check(s.lastObservedAt===null||time(s.lastObservedAt)&&s.lastObservedAt>=s.startedAt&&(s.endedAt===null||s.lastObservedAt<=s.endedAt),'Invalid last observation time');
 check(equal(s.missingHistory,{before:true,after:true})&&s.causalDependency==='unknown','Missing history and dependency must stay unknown');
 keys(s.limits,Object.keys(PRODUCTION_OBSERVATION_LIMITS));for(const [k,max] of Object.entries(PRODUCTION_OBSERVATION_LIMITS))check(integer(s.limits[k],max)&&s.limits[k]>=(k==='bytes'?8192:1),'Invalid window limit');
 check(s.deadlineAt===s.startedAt+s.limits.durationMs,'Deadline differs from configured bound');
 keys(s.counts,countKeys);keys(s.gaps,gapKeys);for(const n of Object.values(s.counts))check(integer(n,64),'Invalid observation count');for(const n of Object.values(s.gaps))check(integer(n),'Invalid gap count');
 keys(s.target,['property','observedAt']);check(['text','disabled'].includes(s.target.property)&&time(s.target.observedAt)&&s.target.observedAt<=s.startedAt,'Invalid selected observation');
 check(Array.isArray(s.records)&&s.records.length<=s.limits.records,'Observation record limit');const counts=Object.fromEntries(countKeys.map(k=>[k,0]));let last=null,pending=0;
 for(const [sequence,r] of s.records.entries()){
  check(r.sequence===sequence&&time(r.at)&&r.at>=s.startedAt&&r.at<s.deadlineAt&&(s.endedAt===null||r.at<=s.endedAt),'Invalid observation sequence/time');last=Math.max(last??s.startedAt,r.at);
  if(r.kind==='network'){
   keys(r,['sequence','kind','at','method','status','responseAt','endedAt','durationMs','completion','timingOrder']);counts.requests++;
   check(['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS','CONNECT','TRACE','OTHER'].includes(r.method),'Invalid request method');
   check(r.status===null?r.responseAt===null:Number.isInteger(r.status)&&r.status>=100&&r.status<=599&&time(r.responseAt)&&r.responseAt>=r.at,'Invalid HTTP observation');if(r.status>=400)counts.httpErrors++;
   for(const at of [r.responseAt,r.endedAt])if(at!==null){check(time(at)&&at>=r.at&&at<s.deadlineAt&&(s.endedAt===null||at<=s.endedAt),'Invalid request phase time');last=Math.max(last,at);}
   if(r.completion==='unobserved'){pending++;check(r.endedAt===null&&r.durationMs===null&&r.timingOrder==='not-completed','Unobserved terminal outcome was invented');}
   else{const counter={finished:'completed',failed:'transportFailed',cancelled:'cancelled',redirect:'redirects'};check(Object.hasOwn(counter,r.completion)&&time(r.endedAt)&&r.durationMs===r.endedAt-r.at,'Invalid request terminal outcome');counts[counter[r.completion]]++;check(r.timingOrder===(r.responseAt===null?'response-unobserved':r.endedAt<r.responseAt?'end-precedes-response':'response-precedes-end'),'Request phase order was rewritten');}
  }else if(r.kind==='error'){
   keys(r,['kind','sequence','at','category','locationRecorded']);check(['Error','TypeError','ReferenceError','SyntaxError','RangeError','URIError','EvalError','AggregateError','Unknown'].includes(r.category)&&typeof r.locationRecorded==='boolean','Invalid exception metadata');counts.errors++;
  }else if(r.kind==='dom'){
   keys(r,['kind','sequence','at','property','changeKind','mutationTime','readWindow','valueRecorded']);check(r.property===s.target.property&&['snapshot','attribute','text','children'].includes(r.changeKind)&&r.mutationTime==='unobserved'&&typeof r.valueRecorded==='boolean'&&(r.property!=='text'||!r.valueRecorded),'Invalid sampled read claim');
   if(r.readWindow!==null){keys(r.readWindow,['startedAt','completedAt']);check(time(r.readWindow.startedAt)&&r.readWindow.startedAt>=s.startedAt&&r.readWindow.startedAt<=r.at&&r.readWindow.completedAt===r.at,'Invalid native read interval');}counts.checkpoints++;
  }else fail('Unknown observation row');
 }
 check(pending<=s.limits.pending&&equal(counts,s.counts)&&last===s.lastObservedAt,'Counts or last observation disagree with retained rows');return s;
}
export function parseStoppedProductionObservation(raw){
 const s=json(raw);keys(s,['schema','exportable','executable','status','windowId','identity','target','startedAt','endedAt','deadlineAt','lastObservedAt','stopReason','missingHistory','causalDependency','limits','counts','gaps','records']);
 check(s.schema==='stateatom.production-observation/1'&&s.exportable===false&&s.executable===false&&uuid(s.windowId),'Invalid private observation identity');
 keys(s.identity,['tabId','run','document','frame','origin']);check(integer(s.identity.tabId,Number.MAX_SAFE_INTEGER)&&s.identity.tabId>0&&['run','document','frame'].every(k=>opaque(s.identity[k]))&&origin(s.identity.origin),'Invalid private window context');
 keys(s.target,['node','property','observedAt','value']);check(opaque(s.target.node),'Invalid native node');value(s.target.value,s.target.property);
 check(Array.isArray(s.records)&&s.records.length<=64,'Private row bound');const ids=new Set();
 for(const r of s.records){
  check(typeof r.id==='string'&&new RegExp('^'+s.windowId+':[1-9][0-9]*$').test(r.id)&&!ids.has(r.id),'Invalid occurrence token');ids.add(r.id);
  if(r.kind==='network'){keys(r,['kind','id','requestId','at','method','route','status','responseAt','endedAt','durationMs','completion','timingOrder']);check(opaque(r.requestId)&&equal(r.route,{origin:r.route?.origin,detail:'omitted'})&&origin(r.route.origin),'Invalid private route');}
  else if(r.kind==='error'){keys(r,['kind','id','at','category','location']);if(r.location!==null){keys(r.location,['origin','line','column','positionBase','file']);check(origin(r.location.origin)&&position(r.location.line)&&position(r.location.column)&&r.location.positionBase===0&&r.location.file==='omitted','Invalid private error location');}}
  else if(r.kind==='dom'){keys(r,['kind','id','at','node','property','changeKind','mutationTime','readWindow','value']);check(r.node===s.target.node,'Foreign native node');value(r.value,r.property,true);}
  else fail('Unknown private observation kind');
 }
 validateProductionObservationStructure(productionObservationStructure(s));check(new TextEncoder().encode(raw).length<=s.limits.bytes,'Private observation byte bound');return frozen(s);
}
