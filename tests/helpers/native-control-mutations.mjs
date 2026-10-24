// SPDX-License-Identifier: Apache-2.0
// Test-only passive observer. Self-contained for ISOLATED executeScript serialization.
export function controlMutationProbe({action}={}){
 const key='__stateatom_v0317_control_attribute_probe_v1';
 if(!['start','read','stop'].includes(action))throw Error('PROBE_ACTION_INVALID');
 if(action!=='start'){
  if(!globalThis[key])throw Error('PROBE_NOT_ACTIVE');
  return globalThis[key].take(action==='stop');
 }
 if(globalThis[key])throw Error('PROBE_ALREADY_ACTIVE');
 if(typeof document==='undefined'||typeof MutationObserver==='undefined'||typeof HTMLInputElement==='undefined'||typeof Element==='undefined')throw Error('PROBE_ENVIRONMENT_UNAVAILABLE');
 const target=document.querySelector('#minPrice');
 if(!target)throw Error('PROBE_TARGET_UNAVAILABLE');
 const attr=(node,name,namespace=null)=>namespace===null?Element.prototype.getAttribute.call(node,name):Element.prototype.getAttributeNS.call(node,namespace,name);
 if(!(target instanceof HTMLInputElement)||attr(target,'type')!=='number')throw Error('PROBE_TARGET_UNSUPPORTED');
 const valueGetter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').get;
 const installedAt=Date.now(),records=[];let seen=0,batch=0,truncated=false;
 function bounded(value){if(value===undefined||value===null)return{value:null,truncated:false};if(typeof value!=='string'||value.length>1024){truncated=true;return{value:null,truncated:true};}return{value,truncated:false};}
 function collect(pending){
  if(!pending.length)return;batch++;const deliveredAt=Date.now();
  for(const mutation of pending){
   seen++;if(records.length===256){truncated=true;continue;}
   const isAttribute=mutation.type==='attributes',name=bounded(isAttribute?mutation.attributeName:null),namespace=bounded(isAttribute?mutation.attributeNamespace:null),old=bounded(isAttribute?mutation.oldValue:null),next=bounded(isAttribute?attr(mutation.target,mutation.attributeName,mutation.attributeNamespace??null):null);
   records.push({index:seen,type:mutation.type,attributeName:name.value,attributeNamespace:namespace.value,oldValue:old.value,oldValueTruncated:old.truncated,newValueAtDelivery:next.value,newValueAtDeliveryTruncated:next.truncated,targetIsOriginal:mutation.target===target,deliveredAt,batch,addedNodes:mutation.addedNodes?.length||0,removedNodes:mutation.removedNodes?.length||0});
  }
 }
 const observer=new MutationObserver(collect);
 observer.observe(target,{attributes:true,attributeOldValue:true,childList:true,subtree:true});
 const holder={take(stop){
  try{collect(observer.takeRecords());}
  finally{if(stop){observer.disconnect();delete globalThis[key];}}
  const value=bounded(valueGetter.call(target));
  return{schema:'stateatom.native-control-mutations/1',status:stop?'STOPPED':'ACTIVE',selector:'#minPrice',world:'ISOLATED',installedAt,readAt:Date.now(),originalNodePresent:target.isConnected&&document.querySelector('#minPrice')===target,valueAtRead:value.value,valueAtReadTruncated:value.truncated,records:structuredClone(records),seen,truncated,writer:'Unknown',mutationTime:'Unknown'};
 }};
 globalThis[key]=holder;return holder.take(false);
}
