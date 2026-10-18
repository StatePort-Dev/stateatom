// SPDX-License-Identifier: Apache-2.0
// Disposable native probe only; no receiver objects or handles enter the result.
export async function operandCheckpoint({refs,event}){
 const result={status:'Unknown/Unsupported',valueOrigin:'Unknown/Unsupported',fullPath:false,claim:'Instrumented original read plus later native own-data descriptor; matching values do not establish parse-to-read revision history'};
 try{
  refs.guard();const data=name=>refs.data(event,name),receiver=data('receiver'),key=data('key');
  if(receiver.subtype==='proxy'||!receiver.objectId||!['object','function'].includes(receiver.type))throw Error('Ordinary receiver reference unavailable');
  if(key.type!=='string'||typeof key.value!=='string'||key.value.length>256)throw Error('Only bounded original string keys supported; no key coercion for inspection');
  if(data('readCompleted').value!==true||data('readValueRetained').value!==true)throw Error('Original bounded scalar read unavailable');
  const read=data('readValue');const scalar=value=>!value.objectId&&!value.unserializableValue&&(value.type==='boolean'&&typeof value.value==='boolean'||value.type==='number'&&Number.isFinite(value.value)||value.type==='string'&&typeof value.value==='string'&&value.value.length<=256||value.subtype==='null');
  if(!scalar(read))throw Error('Original serializable scalar unavailable');
  const properties=await refs.properties(receiver),value=refs.data(properties,key.value);if(!scalar(value))throw Error('Checkpoint own-data scalar unavailable');refs.guard();
  result.status='Observed';result.key=key.value;result.entryRead={type:read.type,value:read.value};result.descriptorAtCheckpoint={kind:'own-data',type:value.type,value:value.value,sameScalarAsEntryRead:Object.is(read.value,value.value)};
 }catch(error){result.reason=String(error.message);}
 return result;
}
