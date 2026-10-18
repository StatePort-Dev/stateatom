// SPDX-License-Identifier: Apache-2.0
// Two monitored native call sites, not an effect/ownership engine or attestation.
export function createQueryCalls({page,identify,eligible,origin=()=>null,weakRef=globalThis.WeakRef,maxEvents=256,maxFrames=32}={}){
 const own=Object.getOwnPropertyDescriptor,apply=Reflect.apply,push=Array.prototype.push,map=Array.prototype.map,same=Object.is,derefFn=weakRef&&own(weakRef.prototype,'deref')?.value;
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function'),ref=v=>object(v)&&weakRef?new weakRef(v):null,deref=r=>r&&derefFn?apply(derefFn,r,[]):undefined;
 const tokens=new WeakMap(),events=[];let active=true,overflow=![maxEvents,maxFrames].every(v=>Number.isSafeInteger(v)&&v>=0)||maxEvents>4096||maxFrames>128,top=null,depth=0,serial=0;
 const okay=()=>active&&!overflow&&typeof weakRef==='function'&&typeof derefFn==='function';
 const scope='Two monitored native Query call sites and actual body occurrences only; parent is nearest observed native frame, not immediate JS caller. Other callees, effects and alias lifetime unknown';
 const unknown=reason=>({status:'Unknown/Unsupported',reason,scope});
 function parsed(v){if(!object(v))return null;let p;try{p=origin(v);}catch{return null;}return p&&typeof p.exchangeId==='string'&&p.exchangeId.length<=256&&typeof p.consumptionId==='string'&&p.consumptionId.length<=256&&typeof p.pointer==='string'&&p.pointer.length<=512?{exchangeId:p.exchangeId,consumptionId:p.consumptionId,pointer:p.pointer}:null;}
 function emit(kind,fields){if(!okay())return;if(events.length>=maxEvents){overflow=true;return;}apply(push,events,[{kind,...fields,readonlyEffects:'Unknown/Unsupported',scope}]);}
 function known(kind,value){if(!object(value))return null;return identify(kind,value);}
 function association(parent,kind,receiver,data,options){
  if(!parent||parent.method!=='client-set'||!parent.plan)return unknown('No compatible monitored owner call site');const plan=parent.plan;
  if(kind==='cache-build'){
   if(plan.buildConsumed||!plan.buildEligible||deref(plan.cache)!==receiver||deref(parent.receiver)!==data||(!object(options)?!same(plan.buildOptionsPrimitive,options):deref(plan.buildOptions)!==options))return unknown('Native build body does not establish the planned native callee');
   plan.buildConsumed=true;return{status:'Observed',ownerFrameId:parent.token.id,site:'client-set#cache-build',scope};
  }
  if(kind!=='query-set'||!plan.buildAccepted||!plan.setEligible||!plan.ready||plan.setConsumed||deref(plan.query)!==receiver||(!object(data)?!same(plan.primitive,data):deref(plan.data)!==data)||deref(plan.options)!==options)return unknown('Missing ready operands, replaced callee or unmatched monitored setData occurrence');
  plan.setConsumed=true;return{status:'Observed',ownerFrameId:parent.token.id,site:'client-set#query-set',scope};
 }
 function begin(method,receiver,data,options){
  if(!okay())return null;if(depth>=maxFrames){overflow=true;return null;}const kind=method==='client-set'?'client':method==='cache-build'?'cache':method==='query-set'?'query':null;if(!kind)return null;
  const actor=known(kind,receiver);if(!actor)return null;const token={id:page+':queryCall'+(++serial)},parent=top,callSite=association(parent,method,receiver,data,options);
  const frame={token,method,actor,parent,receiver:ref(receiver),callSite,completed:false};tokens.set(token,frame);top=frame;depth++;
  emit('native-body-entry',{frameId:token.id,method,actorId:actor.id,nearestObservedParentId:parent?.token.id||null,callSite,parsedObject:parsed(data)});return token;
 }
 function plan(token,cache,data,options){const f=object(token)&&tokens.get(token),c=known('cache',cache);if(!okay()||!f||top!==f||f.method!=='client-set'||f.plan||!c||f.actor.cacheId!==c.id)return;
  f.plan={cache:ref(cache),cacheId:c.id,buildOptions:ref(options),buildOptionsPrimitive:!object(options)?options:undefined,buildEligible:eligible('cache-build',cache)===true,buildConsumed:false,buildAccepted:false,setConsumed:false,ready:false,data:ref(data),primitive:!object(data)?data:undefined};
  emit('native-call-site-preflight',{frameId:token.id,site:'client-set#cache-build',eligible:f.plan.buildEligible,nativeInvocation:false});
 }
 function result(token,value){const f=object(token)&&tokens.get(token);if(!okay()||!f||top!==f||f.completed)return;f.completed=true;
  if(f.method==='cache-build'&&f.callSite.status==='Observed'){
   const parent=f.parent,q=known('query',value),p=parent?.plan;
   if(parent?.method==='client-set'&&p&&q&&q.cacheId===p.cacheId&&q.clientId===parent.actor.id){p.buildAccepted=true;p.query=ref(value);p.setEligible=eligible('query-set',value)===true;
    emit('native-call-site-preflight',{frameId:parent.token.id,site:'client-set#query-set',queryId:q.id,eligible:p.setEligible,nativeInvocation:false});}
  }
  emit('native-body-result',{frameId:token.id,method:f.method,parsedObject:parsed(value)});
 }
 function ready(token,options){const f=object(token)&&tokens.get(token);if(!okay()||!f||top!==f||f.method!=='client-set'||!f.plan?.buildAccepted||f.plan.ready||!object(options))return;f.plan.ready=true;f.plan.options=ref(options);
  emit('native-call-arguments-ready',{frameId:token.id,site:'client-set#query-set',nativeInvocation:false});
 }
 function clear(f){f.parent=null;f.receiver=null;f.plan=null;f.closed=true;}
 function end(token){if(!object(token))return;const f=tokens.get(token);if(!f||f.closed)return;if(top!==f){overflow=true;for(let p=top;p;){const parent=p.parent;clear(p);p=parent;}top=null;depth=0;return;}
  emit('native-body-exit',{frameId:token.id,method:f.method,outcome:f.completed?'returned':'abrupt'});top=f.parent;depth--;clear(f);
 }
 function stop(){active=false;for(let f=top;f;){const parent=f.parent;clear(f);f=parent;}top=null;depth=0;}
 function snapshot(){return{status:okay()?'Observed':'Unknown/Unsupported',scope,readonlyEffects:'Unknown/Unsupported',fullPath:false,events:apply(map,events,[e=>({...e,...(e.callSite?{callSite:{...e.callSite}}:{}),...(e.parsedObject?{parsedObject:{...e.parsedObject}}:{})})]),retention:{events:events.length,frames:depth},overflow};}
 return{begin,plan,result,ready,end,stop,snapshot};
}
