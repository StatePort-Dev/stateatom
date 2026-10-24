// SPDX-License-Identifier: Apache-2.0
// Own trusted guardian document only: registry wire metadata, never args/results.
export function installGuardianRegistryProbe(scope=globalThis,{limit=16384}={}){
 if(!Number.isSafeInteger(limit)||limit<1||limit>16384)throw Error('Invalid registry probe limit');
 const proto=scope.Worker?.prototype,descriptor=proto&&Object.getOwnPropertyDescriptor(proto,'postMessage'),original=descriptor?.value;
 const add=scope.EventTarget?.prototype.addEventListener,remove=scope.EventTarget?.prototype.removeEventListener,readEvent=Object.getOwnPropertyDescriptor(scope.MessageEvent?.prototype||{},'data')?.get;
 if(typeof original!=='function'||!descriptor.configurable||typeof add!=='function'||typeof remove!=='function'||typeof readEvent!=='function')throw Error('Registry native worker APIs unavailable');
 const clock={timeOrigin:scope.performance.timeOrigin,crossOriginIsolated:scope.crossOriginIsolated===true};if(!Number.isFinite(clock.timeOrigin)||clock.timeOrigin<=0)throw Error('Registry clock unavailable');
 const methods=new Set(['connect','acquire','verify','begin','finish','release','disconnect','claimCleanup','finishCleanup','retryCleanup','status','snapshot']);
 let tag=null,rows=[],overflow=false,unsupported=false,ordinal=0,observed=null;const pending=new Map(),seen=new Set(),listeners=new Map();
 function data(object,key){if(!object||typeof object!=='object')return undefined;const d=Object.getOwnPropertyDescriptor(object,key);if(d&&!Object.hasOwn(d,'value'))unsupported=true;return d&&Object.hasOwn(d,'value')?d.value:undefined;}
 function finish(id,ok){const row=pending.get(id);if(!row)return;pending.delete(id);row.endMs=scope.performance.now();row.durationMs=row.endMs-row.startMs;row.ok=ok;}
 function listen(worker){
  if(listeners.has(worker))return;
  const message=event=>{
   if(!tag||worker!==observed)return;
   try{const m=Reflect.apply(readEvent,event,[]),id=data(m,'id');if(!pending.has(id)){if(seen.has(id))unsupported=true;return;}const version=data(m,'version'),ok=data(m,'ok');if(version!==1||typeof ok!=='boolean'){unsupported=true;finish(id,null);}else finish(id,ok);}
   catch{unsupported=true;for(const id of pending.keys())finish(id,null);}
  };
  const failed=()=>{if(tag&&worker===observed){unsupported=true;for(const id of pending.keys())finish(id,null);}};
  const entries=[['message',message],['error',failed],['messageerror',failed]],installed=[];
  try{for(const[type,fn]of entries){Reflect.apply(add,worker,[type,fn]);installed.push([type,fn]);}listeners.set(worker,entries);}
  catch(error){for(const[type,fn]of installed)try{Reflect.apply(remove,worker,[type,fn]);}catch{listeners.set(worker,installed);}throw error;}
 }
 function wrapped(...args){
  if(!tag)return Reflect.apply(original,this,args);
  let id,op,tracked=false;
  try{
   const message=args[0],version=data(message,'version');id=data(message,'id');op=data(message,'op');
   if(version!==1||!Number.isSafeInteger(id)||id<1||!methods.has(op))unsupported=true;
   else if(observed&&observed!==this||seen.has(id))unsupported=true;
   else{
    listen(this);observed=this;seen.add(id);
    const row={ordinal:ordinal++,op,startMs:scope.performance.now(),endMs:null,durationMs:null,ok:null};
    if(rows.length<limit)rows.push(row);else overflow=true;pending.set(id,row);tracked=true;
   }
  }catch{unsupported=true;}
  let result;try{result=Reflect.apply(original,this,args);}catch(error){if(tracked)finish(id,false);throw error;}
  if(result!==undefined)unsupported=true;return result;
 }
 Object.defineProperty(proto,'postMessage',{...descriptor,value:wrapped});
 return Object.freeze({
  reset(value){if(pending.size)throw Error('Registry probe request still pending');if(typeof value!=='string'||!/^[A-Za-z0-9-]{1,64}$/.test(value))throw Error('Invalid registry tag');tag=value;rows=[];overflow=false;unsupported=false;ordinal=0;observed=null;seen.clear();},
  snapshot(){return{tag,limit,clock:{...clock},rows:rows.map(r=>({...r})),overflow,inflight:pending.size,unsupported};},
  restore(){
   if(pending.size)throw Error('Registry probe request still pending');const errors=[],owned=Object.getOwnPropertyDescriptor(proto,'postMessage')?.value===wrapped;
   for(const[worker,entries]of listeners)for(const[type,fn]of entries)try{Reflect.apply(remove,worker,[type,fn]);}catch(e){errors.push(e);}listeners.clear();
   if(!owned)errors.push(Error('Registry native method replaced'));else try{Object.defineProperty(proto,'postMessage',descriptor);}catch(e){errors.push(e);}
   if(errors.length)throw new AggregateError(errors,'Registry probe restore failed: '+errors.map(e=>e.message).join('; '));tag=null;
  }
 });
}
