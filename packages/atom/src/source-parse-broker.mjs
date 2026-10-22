// SPDX-License-Identifier: Apache-2.0
// Separate from debugger admission/cleanup. Only the exact native offscreen
// context may return source results; nothing is persisted or sent to a page.
import {SOURCE_PARSE_PORT,SOURCE_PARSE_CHANNEL,sourceParseFrame} from './source-parse-channel.mjs';
import {sourceParseSpec,sourceParseError} from '../../../core/source-parse-contract.mjs';
import {encodeSourceBytes,unpackSourceParseResult} from '../../../core/source-parse-wire.mjs';
export {SOURCE_PARSE_PORT};
export function createSourceParseBroker(api,{documentPath='atom-guardian.html',ready=Promise.resolve(),enabled=()=>true,startupTimeout=5000,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const url=api.runtime.getURL?.(documentPath),workerPath=api.runtime.getManifest?.()?.background?.service_worker,hostWorkerURL=typeof workerPath==='string'?api.runtime.getURL?.(workerPath):null,pending=new Map();let disposed=false,channel=null,startup=null,sequence=0,admitted=0,authorityReady=false;
 Promise.resolve(ready).then(()=>authorityReady=true,()=>{});
 const isConnected=c=>!!c&&!disposed&&channel===c&&c.ready;
 const current=c=>isConnected(c)&&authorityReady&&enabled();
 function settleStartup(error,c){const s=startup;if(!s)return;startup=null;clearTimer(s.timer);if(error)s.reject(error);else s.resolve(c);}
 function lost(c){if(channel!==c)return;channel=null;c.ready=false;for(const p of pending.values())if(p.channel===c)p.finish(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));try{c.port.disconnect();}catch{}settleStartup(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));}
 async function exactContext(c){const contexts=await api.runtime.getContexts({documentUrls:[url]});if(contexts.length!==1||contexts[0].contextType!=='OFFSCREEN_DOCUMENT'||contexts[0].documentUrl!==url||contexts[0].documentId!==c.documentId)throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');}
 async function accept(port){
  if(port.name!==SOURCE_PARSE_PORT)return;const sender=port.sender;
  if(disposed||!url||!hostWorkerURL||sender?.id!==api.runtime.id||sender.url!==url||sender.tab||sender.documentId!==undefined&&typeof sender.documentId!=='string'||channel){port.disconnect();return;}
  const c={port,ready:false,nonce:crypto.randomUUID(),documentId:null};channel=c;
  port.onDisconnect.addListener(()=>{void api.runtime.lastError;lost(c);});
  try{
   const contexts=await api.runtime.getContexts({documentUrls:[url]}),peer=contexts.length===1&&contexts[0];
   if(disposed||channel!==c||!peer||peer.contextType!=='OFFSCREEN_DOCUMENT'||peer.documentUrl!==url||typeof peer.documentId!=='string'||sender.documentId!==undefined&&sender.documentId!==peer.documentId)throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');c.documentId=peer.documentId;
   port.onMessage.addListener(m=>{
    if(channel!==c||disposed)return;
    try{
     if(m?.nonce!==c.nonce)throw sourceParseError('SOURCE_PARSE_INVALID');
     if(m.kind==='ready'){sourceParseFrame(m,['schema','kind','nonce']);if(c.ready)throw sourceParseError('SOURCE_PARSE_INVALID');c.ready=true;if(authorityReady&&enabled())settleStartup(null,c);return;}
     if(!c.ready||!Number.isSafeInteger(m.id)||m.id<1)throw sourceParseError('SOURCE_PARSE_INVALID');
     if(m.kind==='started')sourceParseFrame(m,['schema','kind','nonce','id']);
     else if(m.kind==='reply'&&m.ok===true)sourceParseFrame(m,['schema','kind','nonce','id','ok','result']);
     else if(m.kind==='reply'&&m.ok===false&&typeof m.code==='string'&&m.code.length<=64)sourceParseFrame(m,['schema','kind','nonce','id','ok','code']);
     else throw sourceParseError('SOURCE_PARSE_INVALID');
     const p=pending.get(m.id);if(!p||p.channel!==c)return;
     if(m.kind==='started'){if(p.started)throw sourceParseError('SOURCE_PARSE_INVALID');p.started=true;try{p.onStarted?.();}catch{p.finish(sourceParseError('SOURCE_PARSE_CANCELLED'),null,true);}return;}
     if(m.ok===true)p.finish(null,unpackSourceParseResult(m.result,p.operation));else p.finish(sourceParseError(m.code));
    }catch{lost(c);}
   });
   port.postMessage({schema:SOURCE_PARSE_CHANNEL,kind:'challenge',nonce:c.nonce,hostWorkerURL});
  }catch{lost(c);}
 }
 const connected=port=>{void accept(port);};api.runtime.onConnect?.addListener(connected);
 function start(){
  if(disposed||!url||!hostWorkerURL||!api.runtime.getContexts||!api.runtime.onConnect)return Promise.reject(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));
  if(current(channel))return Promise.resolve(channel);if(startup)return startup.promise;
  let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;}),s={promise,resolve,reject,timer:null};startup=s;s.timer=setTimer(()=>{settleStartup(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));if(channel&&!channel.ready)lost(channel);},startupTimeout);
  void(async()=>{await ready;if(disposed||!enabled())throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');authorityReady=true;
   const contexts=await api.runtime.getContexts({documentUrls:[url]});if(contexts.length!==1||contexts[0].contextType!=='OFFSCREEN_DOCUMENT'||contexts[0].documentUrl!==url)throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');
   if(current(channel)){settleStartup(null,channel);return;}if(channel)return;try{await api.runtime.sendMessage({stateatomSourceParseWake:1});}catch{/* A newly loading owned document can still connect within the startup budget. */}if(current(channel))settleStartup(null,channel);
  })().catch(()=>settleStartup(sourceParseError('SOURCE_PARSE_UNAVAILABLE')));return promise;
 }
 function wait(promise,signal){if(!signal)return promise;if(signal.aborted)return Promise.reject(sourceParseError('SOURCE_PARSE_CANCELLED'));return new Promise((resolve,reject)=>{const abort=()=>finish(sourceParseError('SOURCE_PARSE_CANCELLED'));let done=false;function finish(error,value){if(done)return;done=true;signal.removeEventListener('abort',abort);if(error)reject(error);else resolve(value);}signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();promise.then(v=>finish(null,v),e=>finish(e));});}
 return{get configured(){return !disposed&&!!url&&!!hostWorkerURL&&!!api.runtime.getContexts&&!!api.runtime.onConnect&&authorityReady&&enabled();},get available(){return current(channel);},async run(operation,input,{signal,onStarted}={}){
  const spec=sourceParseSpec(operation);if(!(input instanceof Uint8Array))throw sourceParseError('SOURCE_PARSE_INVALID');if(input.length>spec.bytes)throw sourceParseError('SOURCE_PARSE_BUDGET');if(signal?.aborted)throw sourceParseError('SOURCE_PARSE_CANCELLED');if(disposed)throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');if(admitted>=2)throw sourceParseError('SOURCE_PARSE_BUSY');admitted++;
  try{
   const bytes=input.slice(),c=await wait(start(),signal);await wait(exactContext(c),signal);if(!current(c))throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');if(signal?.aborted)throw sourceParseError('SOURCE_PARSE_CANCELLED');
   const result=await new Promise((resolve,reject)=>{
    const id=++sequence;let timer,done=false;const abort=()=>finish(sourceParseError('SOURCE_PARSE_CANCELLED'),null,true);
    function finish(error,value,cancel=false){if(done)return;done=true;clearTimer(timer);signal?.removeEventListener('abort',abort);pending.delete(id);if(cancel&&isConnected(c))try{c.port.postMessage({schema:SOURCE_PARSE_CHANNEL,kind:'cancel',nonce:c.nonce,id});}catch{lost(c);}if(error)reject(error);else resolve(value);}
    pending.set(id,{channel:c,operation,onStarted,finish,started:false});signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}
    timer=setTimer(()=>finish(sourceParseError('SOURCE_PARSE_BUDGET'),null,true),spec.ms);
    try{c.port.postMessage({schema:SOURCE_PARSE_CHANNEL,kind:'parse',nonce:c.nonce,id,operation,data:encodeSourceBytes(bytes)});}catch{finish(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));lost(c);}
   });
   await wait(exactContext(c),signal);if(!current(c))throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');return result;
  }finally{admitted--;}
 },async dispose(){if(disposed)return;disposed=true;api.runtime.onConnect?.removeListener(connected);settleStartup(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));const c=channel;if(c)lost(c);for(const p of pending.values())p.finish(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));pending.clear();}};
}
