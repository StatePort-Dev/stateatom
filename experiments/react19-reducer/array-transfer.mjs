// SPDX-License-Identifier: Apache-2.0
// Research technique only. No product importer, app fields, React/ownership proof.
const nativeFilter=Array.prototype.filter,nativeMap=Array.prototype.map,apply=Reflect.apply,isArray=Array.isArray,Reference=WeakRef;
const object=value=>value!==null&&(typeof value==='object'||typeof value==='function');
const scope='Historical native filter/map callback identity link; causal storage transfer unknown';
export function createArrayTransferObserver(){
 let calls=[],yields=0,stopped=false,overflow=false,ids=new WeakMap(),nextId=0,nextCall=0,sequence=0;
 const unknown=reason=>({status:'Unknown/Unsupported',reason,scope,transfer:null,causalTransfer:'Unknown/Unsupported',resultStorage:'Unknown/Unsupported',currentMembership:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false});
 function clear(){calls=[];yields=0;ids=new WeakMap();}
 function refuse(){overflow=true;clear();}
 function id(value){let found=ids.get(value);if(!found){found='object:'+ ++nextId;ids.set(value,found);}return found;}
 function reference(value){return object(value)?new Reference(value):null;}
 function recordYield(call,value,index,array,result){
  if(stopped||overflow||!calls.includes(call))return;
  if(array!==call.receiver.deref()||!Number.isSafeInteger(index)||index<0){refuse();return;}
  if(yields>=512){refuse();return;}
  call.yields.push({item:reference(value),index,accepted:call.kind==='filter'?!!result:null,element:call.kind==='map'?reference(result):null});++yields;
 }
 function call(method,receiver,args){
  if(stopped||overflow||method!==nativeFilter&&method!==nativeMap)return apply(method,receiver,args);
  // Consume the caller's argument tuple once, just as Reflect.apply would.
  const values=apply((...values)=>values,undefined,args),callback=values[0];
  let eligible=false;try{eligible=isArray(receiver)&&typeof callback==='function';}catch{}
  if(!eligible)return apply(method,receiver,values);
  let entry=null;
  try{
   if(calls.length>=64)refuse();
   if(!overflow){entry={id:'call:'+ ++nextCall,kind:method===nativeFilter?'filter':'map',receiver:new Reference(receiver),result:null,done:false,started:++sequence,finished:null,yields:[]};calls.push(entry);}
  }catch{refuse();}
  if(!entry)return apply(method,receiver,values);
  const forwarded=values.slice();
  forwarded[0]=function(value,index,array){
   const result=apply(callback,this,arguments);
   try{recordYield(entry,value,index,array,result);}catch{refuse();}
   return result;
  };
  let result;
  try{result=apply(method,receiver,forwarded);}
  catch(error){if(calls.includes(entry)){calls=calls.filter(c=>c!==entry);yields-=entry.yields.length;}throw error;}
  try{if(!stopped&&!overflow&&calls.includes(entry)){entry.result=reference(result);entry.finished=++sequence;entry.done=true;}}catch{refuse();}
  return result;
 }
 function snapshot({source,filtered,mapped,item,element}={}){
  if(stopped)return unknown('Observer stopped');if(overflow)return unknown('Observation capacity refused');
  if(![source,filtered,mapped,item,element].every(object))return unknown('Object identities required');
  const filters=calls.filter(c=>c.done&&c.kind==='filter'&&c.receiver.deref()===source&&c.result?.deref()===filtered),maps=calls.filter(c=>c.done&&c.kind==='map'&&c.receiver.deref()===filtered&&c.result?.deref()===mapped);
  if(filters.length!==1||maps.length!==1)return unknown('No unique completed native filter/map calls');
  const first=filters[0],second=maps[0];if(first.finished>=second.started)return unknown('Filter result was not completed before map began');
  const from=first.yields.filter(y=>y.accepted&&y.item?.deref()===item),to=second.yields.filter(y=>y.item?.deref()===item&&y.element?.deref()===element);
  if(from.length!==1||to.length!==1)return unknown('No unique original callback object transfer');
  return{...unknown(null),status:'Observed',transfer:{filterCallId:first.id,mapCallId:second.id,sourceId:id(source),filteredId:id(filtered),mappedId:id(mapped),itemId:id(item),elementId:id(element),sourceIndex:from[0].index,mapIndex:to[0].index}};
 }
 return Object.freeze({call,snapshot,stop(){stopped=true;clear();},retention:()=>({calls:calls.length,yields,stopped,overflow})});
}
