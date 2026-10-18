// SPDX-License-Identifier: Apache-2.0
// Native checkpoint reads only. No evaluation, function calls, getter invocation,
// prototype walking, heap snapshots, or debugger pauses.
export function assertEntryOwner({marker,ownerPage,eventPage,nodeId}){
  if(typeof ownerPage!=='string'||!ownerPage||eventPage!==ownerPage||typeof marker!=='string'||!marker.startsWith(ownerPage+':')||typeof nodeId!=='string'||!nodeId.startsWith(ownerPage+':'))throw Error('Selected marker, event and node must belong to the same observer page');
}
export function nativeReferences(cdp,{maxRequests=768,maxProperties=4096,maxBytes=4*1024*1024}={}){
  let requests=0,bytes=0,epoch=0;const startEpoch=epoch;
  const changed=()=>{epoch++;};cdp.on('Runtime.executionContextsCleared',changed);cdp.on('Runtime.executionContextDestroyed',changed);
  const guard=()=>{if(epoch!==startEpoch)throw Error('Native reference checkpoint invalidated');};
  async function properties(object){
    guard();if(!object?.objectId||object.subtype==='proxy')throw Error('Native ordinary object reference unavailable');
    if(++requests>maxRequests)throw Error('Native property request budget');
    const result=await cdp.send('Runtime.getProperties',{objectId:object.objectId,ownProperties:true,generatePreview:false});guard();
    bytes+=Buffer.byteLength(JSON.stringify(result));if(bytes>maxBytes||result.result.length>maxProperties)throw Error('Native property response budget');if(result.exceptionDetails)throw Error('Native property inspection unavailable');return result;
  }
  function data(result,name){const p=result.result.find(p=>p.name===name&&!p.symbol);if(!p||p.get||p.set||p.wasThrown||!Object.hasOwn(p,'value'))throw Error('Own data slot unavailable: '+name);return p.value;}
  const own=async(object,name)=>data(await properties(object),name);
  const primitive=async(object,name)=>{const value=await own(object,name);if(value.objectId)throw Error('Primitive field unavailable');return value.value;};
  async function scope(fn,name){
    if(fn?.type!=='function')throw Error('Function reference unavailable');
    const propertiesOfFunction=await properties(fn),list=propertiesOfFunction.internalProperties?.find(p=>p.name==='[[Scopes]]')?.value;if(!list)throw Error('Native scopes unavailable');
    const slots=(await properties(list)).result.filter(p=>/^\d+$/.test(p.name));if(slots.length>16)throw Error('Native scope budget');
    for(const slot of slots){if(slot.value?.subtype!=='internal#scope'||/^Global/.test(slot.value.description||''))continue;const values=await properties(slot.value);if(values.result.some(p=>p.name===name))return data(values,name);}
    throw Error('Captured slot unavailable: '+name);
  }
  async function location(fn){
    if(fn?.type!=='function'||fn.subtype==='proxy')throw Error('Ordinary function unavailable');
    const p=await properties(fn),location=p.internalProperties?.find(p=>p.name==='[[FunctionLocation]]')?.value.value;
    return location?{scriptId:location.scriptId,lineNumber:location.lineNumber,columnNumber:location.columnNumber}:null;
  }
  async function map(map){
    const entries=(await properties(map)).internalProperties?.find(p=>p.name==='[[Entries]]')?.value;if(!entries)throw Error('Native Map entries unavailable');
    const list=(await properties(entries)).result.filter(p=>/^\d+$/.test(p.name));if(list.length>2000)throw Error('Native Map retention budget');const result=new Map();
    for(const item of list){const p=await properties(item.value);result.set(data(p,'key').value,data(p,'value'));}return result;
  }
  return{properties,data,own,primitive,scope,location,map,guard,stats:()=>({requests,bytes,invalidated:epoch!==startEpoch}),close(){cdp.off('Runtime.executionContextsCleared',changed);cdp.off('Runtime.executionContextDestroyed',changed);}};
}
