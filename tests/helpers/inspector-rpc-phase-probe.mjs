// SPDX-License-Identifier: Apache-2.0
// Diagnostic timing in the owned inspector document only. No messages are sent here.
export function installInspectorRPCProbe(scope=globalThis,{limit=32,operations=['inspect-selector','state']}={}){
 const api=scope.chrome.runtime,original=api.sendMessage;if(!Number.isSafeInteger(limit)||limit<1||limit>32)throw Error('Invalid probe cap');
 const allowed=['inspect-selector','state','inputs-apply','inputs-read','capabilities'];if(!Array.isArray(operations)||!operations.length||operations.length>allowed.length||operations.some(op=>!allowed.includes(op))||new Set(operations).size!==operations.length)throw Error('Invalid probe operations');const selected=new Set(operations);
 let tag=null,rows=[],overflow=false,inflight=0;
 function wrapped(...args){
  const message=args[0],payload=message?.atom?.payload,op=payload?.op;
  if(!tag||message?.atomOwned!==true||!selected.has(op))return Reflect.apply(original,this,args);
  const row={ordinal:rows.length,op,refreshDeep:op==='state'?payload.refreshDeep===true:null,startMs:scope.performance.now(),endMs:null,durationMs:null,ok:null};
  if(rows.length<limit)rows.push(row);else overflow=true;inflight++;
  function finish(ok){row.endMs=scope.performance.now();row.durationMs=row.endMs-row.startMs;row.ok=ok;inflight--;}
  let result;try{result=Reflect.apply(original,this,args);}catch(error){finish(false);throw error;}
  if(result&&typeof result.then==='function')result.then(()=>finish(true),()=>finish(false));else finish(true);
  return result;
 }
 api.sendMessage=wrapped;
 return Object.freeze({reset(value){if(inflight)throw Error('Probe request still pending');if(typeof value!=='string'||!/^[A-Za-z0-9-]{1,64}$/.test(value))throw Error('Invalid probe tag');tag=value;rows=[];overflow=false;},snapshot(){return{tag,rows:rows.map(r=>({...r})),overflow,inflight};},restore(){if(inflight)throw Error('Probe request still pending');if(api.sendMessage!==wrapped)throw Error('Probe method replaced');api.sendMessage=original;tag=null;}});
}
