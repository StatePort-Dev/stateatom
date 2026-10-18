// SPDX-License-Identifier: Apache-2.0
import {createQueryCalls} from './query-calls.mjs';
// Native handoff observations only. Brands are instrumentation facts, not attestation.
export function createQueryLedger({page,origin=()=>null,weakRef=globalThis.WeakRef,maxEvents=256,maxInstances=256,maxStates=512,maxFrames=32,callCensus=false}={}){
 const same=Object.is,own=Object.getOwnPropertyDescriptor,apply=Reflect.apply,mapGet=Map.prototype.get,mapPrototype=Map.prototype,getPrototype=Object.getPrototypeOf,arrayPush=Array.prototype.push,arrayMap=Array.prototype.map,weakDeref=weakRef&&Object.getOwnPropertyDescriptor(weakRef.prototype,'deref')?.value;
 const missing=Symbol('missing own data');
 const field=(obj,key)=>{const d=own(obj,key),v=d&&own(d,'value');return v?v.value:missing;};
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const ref=v=>object(v)&&weakRef?new weakRef(v):null,deref=r=>r&&weakDeref?apply(weakDeref,r,[]):undefined;
 const caches=new WeakMap(),clients=new WeakMap(),queries=new WeakMap(),states=new WeakSet(),methods=new WeakSet(),cachePrototypes=new WeakMap(),callMethods=new WeakMap(),maps=new WeakSet(),frames=new WeakMap();
 const validLimits=[maxEvents,maxInstances,maxStates,maxFrames].every(n=>Number.isSafeInteger(n)&&n>=0)&&maxEvents<=4096&&maxInstances<=4096&&maxStates<=8192&&maxFrames<=128;
 const events=[],eventIds=new Set();let active=true,overflow=!validLimits,instances=0,stateCount=0,serial=0,top=null,depth=0;
 const calls=callCensus?createQueryCalls({page,weakRef,origin:v=>parsed(v),identify(kind,v){const m=(kind==='client'?clients:kind==='cache'?caches:queries).get(v);if(!m)return null;if(kind==='client'){const c=caches.get(deref(m.cache));return c?{id:m.id,cacheId:c.id}:null;}return{id:m.id,cacheId:m.cacheId,clientId:m.clientId};},eligible(kind,v){const instances=kind==='cache-build'?caches:queries;if(!instances.has(v))return false;const method=kind==='cache-build'?'build':'setData',descriptor=own(v,method),prototype=getPrototype(v),record=callMethods.get(prototype);if(!record||record.kind!==kind)return false;return descriptor?field(descriptor,'value')===record.fn:field(prototype,method)===record.fn;}}):null;
 const scope='Pinned native cache/query identities and observed assignment/return/read occurrences only; not complete cache version, writer history or current field ancestry';
 const unavailable=reason=>({status:'Unknown/Unsupported',reason,valueOrigin:'Unknown/Unsupported',scope});
 const okay=()=>active&&!overflow&&typeof weakRef==='function'&&typeof weakDeref==='function';
 function parsed(value){if(!object(value))return null;let p;try{p=origin(value);}catch{return null;}if(!p||typeof p.exchangeId!=='string'||p.exchangeId.length>256||typeof p.consumptionId!=='string'||p.consumptionId.length>256||typeof p.pointer!=='string'||p.pointer.length>512)return null;return{exchangeId:p.exchangeId,consumptionId:p.consumptionId,pointer:p.pointer};}
 function emit(kind,extra={}){if(!okay())return unavailable('Ledger stopped, unavailable or budget lost');if(events.length>=maxEvents){overflow=true;return unavailable('Native query event budget exceeded');}const event={id:page+':queryEvent'+(++serial),kind,status:'Observed',valueOrigin:'Unknown/Unsupported',scope,...extra};apply(arrayPush,events,[event]);eventIds.add(event.id);return event;}
 function instance(map,obj,extra){if(!okay()||!object(obj))return null;const old=map.get(obj);if(old)return old;if(++instances>maxInstances){overflow=true;return null;}const record={id:page+':queryInstance'+instances,...extra};map.set(obj,record);return record;}
 function state(value){if(!okay()||!object(value)||states.has(value))return;if(++stateCount>maxStates){overflow=true;return;}states.add(value);}
 function cache(value,map){if(!okay()||!object(value)||!object(map))return;try{apply(mapGet,map,[missing]);}catch{return;}maps.add(map);instance(caches,value,{map:ref(map)});}
 function client(value,cache){if(!okay()||!caches.has(cache))return;instance(clients,value,{cache:ref(cache)});}
 function assigned(query,state){
  if(!okay())return unavailable('Native query history unavailable');const q=queries.get(query);if(!q||!object(state)||!states.has(state))return unavailable('Unbranded native query/state; not inspected');
  if(field(query,'state')!==state)return unavailable('Actual own query state differs from completed assignment');const data=field(state,'data');if(data===missing)return unavailable('State data is not an ordinary own data slot');
  const event=emit('native-state-assignment',{queryId:q.id,clientId:q.clientId,cacheId:q.cacheId,parsedObject:parsed(data)});
  if(event.status==='Observed'){q.state=ref(state);q.assignmentId=event.id;q.data=object(data)?ref(data):null;q.dataPrimitive=!object(data)?data:missing;}
  return event;
 }
 function query(value,clientValue,cacheValue,initialState){const c=clients.get(clientValue),cacheMeta=caches.get(cacheValue);if(!c||!cacheMeta||deref(c.cache)!==cacheValue)return;const q=instance(queries,value,{clientId:c.id,cacheId:cacheMeta.id,client:ref(clientValue),cache:ref(cacheValue)});if(q)return assigned(value,initialState);}
 function stored(cacheValue,map,key,queryValue){if(!okay())return;const c=caches.get(cacheValue),q=queries.get(queryValue);if(!c||!q||deref(c.map)!==map||q.cacheId!==c.id)return;let actual;try{actual=apply(mapGet,map,[key]);}catch{return;}if(actual===queryValue)return emit('native-cache-storage',{cacheId:c.id,queryId:q.id});}
 function cacheMethod(fn,prototype){if(typeof fn==='function'){methods.add(fn);if(object(prototype))cachePrototypes.set(prototype,fn);}}
 function cacheMethodAt(value){if(!okay()||!caches.has(value))return null;const descriptor=own(value,'get');if(descriptor){const fn=field(descriptor,'value');return typeof fn==='function'&&methods.has(fn)?fn:null;}const prototype=getPrototype(value),fn=cachePrototypes.get(prototype);return fn&&field(prototype,'get')===fn?fn:null;}
 function mapMethodAt(value){if(!okay()||!maps.has(value))return null;const descriptor=own(value,'get');if(descriptor)return field(descriptor,'value')===mapGet?mapGet:null;return getPrototype(value)===mapPrototype&&field(mapPrototype,'get')===mapGet?mapGet:null;}
 function beginRead(clientValue){if(!okay()||!clients.has(clientValue))return null;if(++depth>maxFrames){overflow=true;depth--;return null;}const token={},frame={token,client:clientValue,parent:top,gets:[],closed:false};frames.set(token,frame);top=frame;return token;}
 function got(cacheValue,map,callee,key,value){if(!okay()||!top)return;const c=caches.get(cacheValue);if(!c||deref(c.map)!==map||callee!==mapGet){top.invalid=true;return;}let actual;try{actual=apply(mapGet,map,[key]);}catch{top.invalid=true;return;}if(actual!==value){top.invalid=true;return;}if(top.gets.length>=2){top.invalid=true;return;}apply(arrayPush,top.gets,[{cache:cacheValue,map,key,value}]);}
 function read(token,{cache:cacheValue,callee,query:queryValue,state:stateValue,data}={}){
  if(!okay())return unavailable('Native query history unavailable');const f=object(token)&&frames.get(token),c=caches.get(cacheValue),q=queries.get(queryValue),clientMeta=f&&clients.get(f.client);
  if(!f||f.closed||top!==f||f.invalid||f.gets.length!==1||!c||!q||!clientMeta||!methods.has(callee))return unavailable('Missing, replaced or competing native cache read');
  const g=f.gets[0];if(g.cache!==cacheValue||g.value!==queryValue||q.cacheId!==c.id||q.clientId!==clientMeta.id||deref(clientMeta.cache)!==cacheValue)return unavailable('Actual read Query differs from native cache/client operand');
  let actual;try{actual=apply(mapGet,g.map,[g.key]);}catch{return unavailable('Native cache storage unavailable');}if(actual!==queryValue)return unavailable('Native cache storage changed during read');
  // Query is an ordinary native instance; arbitrary state is never descriptor-inspected.
  if(!object(stateValue)||!states.has(stateValue))return unavailable('Unbranded read state; not inspected');
  if(!q.assignmentId||!eventIds.has(q.assignmentId)||deref(q.state)!==stateValue||field(queryValue,'state')!==stateValue)return unavailable('Read does not match a retained native assignment occurrence');
  const slot=field(stateValue,'data');if(slot===missing||!same(slot,data)||(!object(data)?!same(q.dataPrimitive,data):deref(q.data)!==data))return unavailable('Actual own data/return operand differs from native assignment');
  return emit('native-cache-read',{queryId:q.id,clientId:q.clientId,cacheId:q.cacheId,assignmentId:q.assignmentId,parsedObject:parsed(data)});
 }
 function endRead(token){if(!object(token))return;const f=frames.get(token);if(!f||f.closed)return;f.closed=true;f.gets.length=0;if(top!==f){overflow=true;top=null;depth=0;return;}top=f.parent;depth--;f.parent=null;f.client=null;}
 function returned(queryValue,data){const q=queries.get(queryValue);if(!q)return unavailable('Unbranded native return');return emit('native-set-return',{queryId:q.id,parsedObject:parsed(data),reason:'Original native return object only; not current storage or assignment association'});}
 function stop(){active=false;calls?.stop();for(let f=top;f;){const parent=f.parent;f.gets.length=0;f.parent=null;f.client=null;f.closed=true;f=parent;}top=null;depth=0;}
 function snapshot(){return{status:okay()?'Observed':'Unknown/Unsupported',reason:okay()?'Bounded native handoff observations; full history and field ancestry unknown':'Stopped, unavailable or native retention budget exceeded',events:apply(arrayMap,events,[e=>({...e,...(e.parsedObject?{parsedObject:{...e.parsedObject}}:{})})]),fullPath:false,valueOrigin:'Unknown/Unsupported',scope,limits:{maxEvents,maxInstances,maxStates,maxFrames},retention:{events:events.length,instances,stateCount,frames:depth},overflow};}
 return{censusBrand(kind,prototype,fn){if(calls&&object(prototype)&&typeof fn==='function')callMethods.set(prototype,{kind,fn});},callBegin:(kind,receiver,data,options)=>calls?.begin(kind,receiver,data,options),callPlan:(token,cache,data,options)=>calls?.plan(token,cache,data,options),callResult:(value,token)=>calls?.result(token,value),callReady:(value,token)=>calls?.ready(token,value),callEnd:token=>calls?.end(token),callSnapshot:()=>calls?.snapshot()||{status:'Unknown/Unsupported',reason:'Native call census disabled',events:[],fullPath:false,readonlyEffects:'Unknown/Unsupported'},state,cache,client,query,assigned,stored,cacheMethod,cacheMethodAt,mapMethodAt,beginRead,got,read,endRead,returned,snapshot,stop};
}
