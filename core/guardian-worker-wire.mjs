// SPDX-License-Identifier: Apache-2.0
// Private dedicated-worker transport. No browser commands or persisted authority.
export const REGISTRY_METHODS=Object.freeze(['connect','acquire','verify','begin','finish','release','disconnect','claimCleanup','finishCleanup','retryCleanup','status','snapshot']);
const err=()=>Object.assign(new Error('Registry worker unavailable'),{code:'REGISTRY_LOST'});
export function registryDispatcher(registry){let last=0;return m=>{
 try{const flag=m&&typeof m==='object'?Object.getOwnPropertyDescriptor(m,'withSnapshot'):undefined;if(flag&&(!Object.hasOwn(flag,'value')||flag.value!==true||m.op!=='verify'))throw Object.assign(new Error(),{code:'INVALID_PROTOCOL'});if(!m||m.version!==1||!Number.isSafeInteger(m.id)||m.id!==last+1||!REGISTRY_METHODS.includes(m.op)||!Array.isArray(m.args)||m.args.length>3||new TextEncoder().encode(JSON.stringify(m)).length>131072)throw Object.assign(new Error(),{code:'INVALID_PROTOCOL'});last=m.id;const value=registry[m.op](...m.args);return{version:1,id:m.id,ok:true,value:flag?{value,snapshot:registry.snapshot()}:value};}
 catch(e){return{version:1,id:m?.id,ok:false,code:e.code||'INVALID_PROTOCOL'};}
};}
export function registryClient(worker,{timeout=3000,onLost=()=>{}}={}){
 const pending=new Map();let next=0,closed=false;
 function close(){if(closed)return;closed=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(err());}pending.clear();worker.removeEventListener('message',message);worker.removeEventListener('error',lost);worker.terminate();}
 function lost(){if(closed)return;close();onLost();}
 function message(e){if(closed)return;const m=e.data,p=pending.get(m?.id);if(!p)return;if(m.version!==1||typeof m.ok!=='boolean'){lost();return;}if(p.withSnapshot&&m.ok){const box=m.value;if(!box||typeof box!=='object'||Array.isArray(box)||Object.keys(box).length!==2||!Object.hasOwn(box,'value')||!Object.hasOwn(box,'snapshot')||box.value!==true||!box.snapshot||typeof box.snapshot!=='object'||Array.isArray(box.snapshot)){lost();return;}}pending.delete(m.id);clearTimeout(p.timer);if(m.ok)p.resolve(m.value);else p.reject(Object.assign(new Error(m.code),{code:m.code}));}
 worker.addEventListener('message',message);worker.addEventListener('error',lost);
 const call=(op,args,withSnapshot=false)=>new Promise((resolve,reject)=>{if(closed){reject(err());return;}if(pending.size>=64){reject(Object.assign(new Error('Registry request budget'),{code:'BUSY'}));return;}const id=++next,timer=setTimeout(lost,timeout);pending.set(id,{resolve,reject,timer,withSnapshot});try{worker.postMessage({version:1,id,op,args,...(withSnapshot?{withSnapshot:true}:{})});}catch{lost();}});
 return Object.freeze({...Object.fromEntries(REGISTRY_METHODS.map(op=>[op,(...args)=>call(op,args)])),verifyWithSnapshot:(...args)=>call('verify',args,true),close});
}
