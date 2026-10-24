// SPDX-License-Identifier: Apache-2.0
// An authenticated host connection binds its actor client privately. This module
// does not authenticate Chrome peers or execute native calls itself.
const methods=new Map(Object.entries({acquire:[1,1],verify:[1,2],begin:[2,2],finish:[2,2],release:[1,1],retryCleanup:[1,1],status:[2,2],snapshot:[0,0]}));
const fail=code=>{throw Object.assign(new Error(code),{code});};
function argumentsOf(op,args){
 if(typeof op!=='string'||!methods.has(op)||!Array.isArray(args))fail('INVALID_PROTOCOL');
 const [min,max]=methods.get(op);if(args.length<min||args.length>max)fail('INVALID_PROTOCOL');
 const descriptors=Object.getOwnPropertyDescriptors(args);if(Reflect.ownKeys(descriptors).length!==args.length+1)fail('INVALID_PROTOCOL');
 const values=[];for(let i=0;i<args.length;i++){const d=descriptors[i];if(!d?.enumerable||!Object.hasOwn(d,'value'))fail('INVALID_PROTOCOL');values.push(d.value);}return values;
}
export function createGuardianSession({registry,executeCleanup}){
 if(typeof registry?.connect!=='function'||typeof executeCleanup!=='function')fail('INVALID_PROTOCOL');
 let closed=false,closing=null,draining=null,pending=0;
 const client=Promise.resolve().then(()=>registry.connect());
 const open=()=>{if(closed)fail('SESSION_CLOSED');};
 function close(){closed=true;return closing??=(client.then(c=>registry.disconnect(c)));}
 function drain(){
  if(draining)return draining;
  const work=(async()=>{const c=await client;open();for(;;){
   const jobs=await registry.claimCleanup(c);open();if(!jobs.length)return;
   for(const job of jobs){open();const result=await executeCleanup(job);open();await registry.finishCleanup(c,job,result);}
  }})();
  draining=work.catch(async error=>{await close();throw error;}).finally(()=>{draining=null;});
  return draining;
 }
 const ready=drain().then(()=>registry.snapshot());void ready.catch(()=>{});
 async function request(op,input){
  const args=argumentsOf(op,input);open();if(pending>=64)fail('SESSION_LIMIT');pending++;
  try{
   await ready;open();const c=await client;open();if(op==='verify'&&typeof registry.verifyWithSnapshot==='function'){const result=await registry.verifyWithSnapshot(c,...args);open();return result;}let value=await registry[op](...(op==='snapshot'?[]:[c]),...args);open();
   if(op==='release'||op==='retryCleanup')await drain();open();const snapshot=await registry.snapshot();open();
   if(op==='release')value={phase:snapshot.leases.some(l=>l.leaseId===args[0].leaseId)?'closing':'released'};
   return {value,snapshot};
  }finally{pending--;}
 }
 return Object.freeze({ready,request,drain,close});
}
