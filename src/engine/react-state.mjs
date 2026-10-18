// SPDX-License-Identifier: Apache-2.0
// Native identities are supplied only by the pinned React dev taps. Page evidence,
// not attestation. No app callbacks, values, setters or getters are re-executed.
export function createStateHandoffLedger({page,field,isFiber,origin,add,weakRef,objectId=null}){
 const queues=new WeakMap(),hooks=new WeakMap(),updates=new WeakMap(),results=new WeakMap(),reads=new Map(),staged=new Map();
 let serial=0,queueCount=0,updateCount=0,stopped=false;
 const id=kind=>page+':'+kind+(++serial),object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const same=Object.is,nativeMapGet=Map.prototype.get,nativeApply=Reflect.apply;
 const mapRead=(map,key)=>nativeApply(nativeMapGet,map,[key]);
 const scope='Actual React useState queue/update/returned object identity; not current field value ancestry';
 const unknown=reason=>({status:'Unknown/Unsupported',scope,reason});
 function tap(kind,a,b,c){
  if(stopped||!weakRef)return;
  if(kind==='state-mount'){
   if(queueCount>=256||!isFiber(c)||field(a,'queue')!==b||typeof field(b,'dispatch')!=='function')return;
   const queue={id:id('stateQueue'),ref:new weakRef(b),...(objectId?{nativeId:objectId(b)}:{})};queues.set(b,queue);queueCount++;
   hooks.set(a,{queue,id:id('stateHook'),revision:{id:id('stateInitial'),reason:'Initial state has no observed replacement update'}});return;
  }
  if(kind==='state-dispatch'){
   const queue=queues.get(a);if(!queue||updateCount>=2048||!object(b))return;updateCount++;
   const action=field(b,'action');updates.set(b,{id:id('stateUpdate'),queue,...(objectId?{nativeId:objectId(b)}:{}),actionKind:typeof action,parsedObject:object(action)?origin(action):null});return;
  }
  if(kind==='state-begin'){
   const queue=queues.get(c),current=hooks.get(b);if(!queue||field(a,'queue')!==c)return;
   hooks.set(a,{queue,id:id('stateHook'),revision:current?.queue===queue?current.revision:{id:id('stateMissing'),reason:'Current native hook history missing'}});return;
  }
  if(kind==='state-applied'){
   const hook=hooks.get(a);if(!hook)return;const update=updates.get(b),action=field(b,'action');
   hook.revision={id:id('stateRevision'),updateId:update?.queue===hook.queue?update.id:null,...(objectId&&update?.queue===hook.queue?{nativeUpdateId:update.nativeId}:{}),
    parsedObject:update?.queue===hook.queue&&typeof action!=='function'&&same(action,c)?update.parsedObject:null,
    reason:update?.queue!==hook.queue?'Rebased/cloned/unobserved update identity':typeof action==='function'?'Functional updater value ancestry unsupported':!same(action,c)?'Reducer result is not the original direct action':null};return;
  }
  if(kind==='state-result'){
   const hook=hooks.get(b);if(!hook||!isFiber(c)||field(b,'queue')!==hook.queue.ref.deref()||!same(field(a,'0'),field(b,'memoizedState'))||field(a,'1')!==field(hook.queue.ref.deref(),'dispatch'))return;
   results.set(a,{hook,hookRef:new weakRef(b),fiberRef:new weakRef(c),revision:hook.revision});
  }
 }
 function stage(meta,renderScope,result){
  if(stopped)return;const r=object(result)?results.get(result):null;if(r)results.delete(result);
  staged.set(renderScope+':'+meta.binding,r);while(staged.size>512)staged.delete(staged.keys().next().value);
 }
 function associate(meta,renderScope,value,setter){
  if(stopped)return null;const key=renderScope+':'+meta.binding;let r=mapRead(staged,key);staged.delete(key);
  const hook=r?.hookRef?.deref(),queue=r?.hook.queue.ref.deref();
  if(r&&(!hook||!queue||!same(value,field(hook,'memoizedState'))||setter!==field(queue,'dispatch')))r={reason:'Actual destructured state/setter differs from retained native hook result'};
  if(r?.hookRef)r={...r,...(object(value)?{valueRef:new weakRef(value)}:{primitive:value})};
  const n=add({...meta,kind:'react-state-read',scope:renderScope},value,[],{boundary:scope+'; raw/equal-value writes remain unobserved'});
  if(!n)return null;
  reads.set(n.id,r||{reason:'No eligible original native useState result identity'});while(reads.size>512)reads.delete(reads.keys().next().value);
  return n;
 }
 function witness(nodes,ancestors){
  return nodes.filter(n=>n.kind==='react-state-read').slice(0,32).map(n=>{
   const r=mapRead(reads,n.id),recordedFiber=r?.fiberRef?.deref(),hook=r?.hookRef?.deref();
   const fiber=ancestors?.has(recordedFiber)?recordedFiber:recordedFiber&&[...(ancestors||[])].find(a=>isFiber(a)&&field(a,'alternate')===recordedFiber&&field(recordedFiber,'alternate')===a);
   if(stopped||!r||!fiber||!hook)return {...unknown(stopped?'Observer stopped':r?.reason||'State read is not in the selected committed ancestor'),readId:n.id};
   let current=field(fiber,'memoizedState'),found=false;const seen=new Set();
   while(object(current)&&seen.size<64&&!seen.has(current)){if(current===hook){found=true;break;}seen.add(current);current=field(current,'next');}
   if(!found||hooks.get(hook)!==r.hook||r.hook.revision!==r.revision||!same(field(hook,'memoizedState'),r.valueRef?r.valueRef.deref():r.primitive)||field(hook,'queue')!==r.hook.queue.ref.deref())return {...unknown('Committed hook/revision no longer matches'),readId:n.id};
   const revision=r.revision,parsed=revision.parsedObject;
   return {status:revision.updateId?'Observed':'Unknown/Unsupported',scope,reason:revision.reason,readId:n.id,queueId:r.hook.queue.id,hookId:r.hook.id,revisionId:revision.id,updateId:revision.updateId||null,
    ...(objectId?{firstReadNativeIds:{queueId:r.hook.queue.nativeId,updateId:revision.nativeUpdateId||null}}:{}),
    parsedObject:parsed?{...parsed,scope:'Parsed object identity handed through this native state update; not current field value ancestry'}:null,
    valueOrigin:'Unknown/Unsupported',boundary:'Unobserved raw/equal-value field writes and opaque escapes are not excluded'};
  });
 }
 return {tap,stage,associate,witness,stop(){stopped=true;reads.clear();staged.clear();},retention:()=>({reads:reads.size,queueCount,updateCount})};
}
