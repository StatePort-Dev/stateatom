// SPDX-License-Identifier: Apache-2.0
// Explicit host-owned private transport. Never accepts commands from content,
// never reconstructs authority from storage, never claims unknown ports.
import {nativeControlOperation} from './control-world.mjs';
const error=(code,message=code,extra={})=>Object.assign(new Error(message),{code,...extra});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});void promise.catch(()=>{});return{promise,resolve,reject};};
const bounded=(promise,ms,code)=>{let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(error(code)),ms);})]).finally(()=>clearTimeout(timer));};
export function createNativeControlOwner(runtime,{startupTimeout=5000,closeTimeout=5000,maxSessions=16}={}){
 const records=new Map();let disposed=false;
 const available=!!runtime?.id&&!!runtime.onConnect?.addListener&&!!runtime.onConnect?.removeListener;
 function remove(r){if(r.signal&&r.abort)r.signal.removeEventListener('abort',r.abort);if(records.get(r.token)===r)records.delete(r.token);clearTimeout(r.startupTimer);if(r.port){r.port.onMessage.removeListener(r.message);r.port.onDisconnect.removeListener(r.disconnected);}}
 function notify(r,reason){if(r.notified)return;r.notified=true;try{r.onLost(reason);}catch{}}
 function gone(r,reason){r.gone.resolve();if(!r.closed){r.closed=true;r.ready.reject(error('EDITOR_CLOSED',reason));r.failed.reject(error('EDITOR_CLOSED',reason));notify(r,reason);}remove(r);}
 function retire(r,reason='Editor closed',unexpected=false){
  if(r.closing)return r.closing;r.closed=true;clearTimeout(r.startupTimer);r.ready.reject(error('EDITOR_CLOSED',reason));r.failed.reject(error('EDITOR_CLOSED',reason));if(!r.bootDispatched&&!r.port)r.gone.resolve();if(unexpected)notify(r,reason);
  r.closing=(async()=>{
   if(r.port&&!r.remoteGone)try{r.port.postMessage({version:1,kind:'close',session:r.token});}catch{r.gone.resolve();}
   try{await bounded(r.gone.promise,closeTimeout,'CLEANUP_UNCONFIRMED');remove(r);return{cleanup:'closed'};}
   catch(e){try{r.port?.disconnect();}catch{}throw e;}
  })();void r.closing.catch(()=>{});return r.closing;
 }
 function protocol(r){r.ready.reject(error('INVALID_CONTROL_PROTOCOL'));r.failed.reject(error('INVALID_CONTROL_PROTOCOL'));void retire(r,'Invalid private control protocol',true).catch(()=>{});}
 async function admit(r){
  if(r.closed||r.admitting||!r.port||!r.nativeDocument)return;
  r.admitting=true;
  try{
   if(r.sender.documentId!==r.nativeDocument)throw error('NATIVE_DOCUMENT_MISMATCH');
   await r.guard(['read','inject']);if(r.closed||records.get(r.token)!==r)return;
   r.admitted=true;r.port.postMessage({version:1,kind:'admit',session:r.token,documentId:r.nativeDocument});
  }catch(e){r.ready.reject(e);void retire(r,'Native owner admission failed',true).catch(()=>{});}
 }
 function connected(port){
  const prefix='stateatom.controls/1:';if(disposed||typeof port.name!=='string'||!port.name.startsWith(prefix))return;
  const r=records.get(port.name.slice(prefix.length));if(!r)return;
  const s=port.sender;let valid=false;
  try{valid=s?.id===runtime.id&&s.tab?.id===r.tabId&&s.frameId===0&&typeof s.documentId==='string'&&!!s.documentId&&new URL(s.url).origin===r.origin;}catch{}
  if(!valid||r.port){try{port.disconnect();}catch{}return;}
  r.port=port;r.sender={documentId:s.documentId};
  r.message=m=>{
   if(records.get(r.token)!==r)return;
   if(!m||typeof m!=='object'||m.version!==1||m.session!==r.token||!['ready','closed'].includes(m.kind)||Object.keys(m).length!==3){protocol(r);return;}
   if(m.kind==='closed'){r.remoteGone=true;r.gone.resolve();if(!r.closed)gone(r,'Native owner closed');return;}
   if(r.closed)return;if(!r.admitted){protocol(r);return;}r.active=true;r.ready.resolve();
  };
  r.disconnected=()=>{void runtime.lastError;r.remoteGone=true;gone(r,'Native content connection lost');};
  port.onMessage.addListener(r.message);port.onDisconnect.addListener(r.disconnected);
  if(r.closed){try{port.postMessage({version:1,kind:'close',session:r.token});}catch{r.gone.resolve();}return;}
  void admit(r);
 }
 if(available)runtime.onConnect.addListener(connected);
 async function open(options={}){
  if(!available)throw error('CONTROL_OWNER_UNAVAILABLE');if(disposed)throw error('DISPOSED');
  const{tabId,origin,document,execute,guard,onLost=()=>{},signal}=options;
  if(!Number.isSafeInteger(tabId)||tabId<1||typeof origin!=='string'||new URL(origin).origin!==origin||typeof document!=='string'||!document||document.length>512||typeof execute!=='function'||typeof guard!=='function'||typeof onLost!=='function')throw error('INVALID_PLATFORM');
  if(signal?.aborted)throw error('CANCELLED');
  if(records.size>=maxSessions||[...records.values()].some(r=>r.tabId===tabId))throw error('BUSY','Native control owner is already active or cleanup is unconfirmed');
  const r={token:crypto.randomUUID(),tabId,origin,document,execute,guard,onLost,ready:deferred(),gone:deferred(),failed:deferred(),bootDispatched:false,port:null,nativeDocument:null,active:false,admitted:false,closed:false,closing:null,admitting:false,notified:false,signal};records.set(r.token,r);
  r.startupTimer=setTimeout(()=>{const failure=error('CONTROL_OWNER_UNAVAILABLE','Native input owner startup timed out');r.ready.reject(failure);r.failed.reject(failure);void retire(r,'Native input startup timed out',true).catch(()=>{});},startupTimeout);
  r.abort=()=>{void retire(r,'Native input owner cancelled',true).catch(()=>{});};signal?.addEventListener('abort',r.abort,{once:true});if(signal?.aborted)r.abort();
  async function dispatch(operation,extra={}){
   const target=r.nativeDocument?{tabId,documentIds:[r.nativeDocument]}:{tabId,frameIds:[0]};
   return execute({target,world:'ISOLATED',func:nativeControlOperation,args:[{version:1,operation,session:r.token,document,origin,...extra}]});
  }
  function row(rows,boot=false){
   const value=rows?.[0];if(!Array.isArray(rows)||rows.length!==1||value?.frameId!==0||typeof value.documentId!=='string'||!value.documentId||!boot&&value.documentId!==r.nativeDocument||!value.result||typeof value.result.ok!=='boolean')throw error('INVALID_NATIVE_RESPONSE');return value;
  }
  const booting=(async()=>{
   if(r.closed)throw error('CANCELLED');await guard(['read','inject']);if(r.closed)throw error('EDITOR_CLOSED');
   r.bootDispatched=true;const boot=row(await dispatch('open'),true);if(!boot.result.ok){if(!r.port)r.gone.resolve();throw error(boot.result.code||'CONTROL_BOOTSTRAP_FAILED');}
   if(boot.result.owner!=='pending'||boot.result.document!==document)throw error('INVALID_NATIVE_RESPONSE');
   r.nativeDocument=boot.documentId;void admit(r);await r.ready.promise;if(r.closed)throw error('EDITOR_CLOSED');await guard(['read','inject']);
  })();void booting.catch(()=>{});
  try{await Promise.race([booting,r.failed.promise]);clearTimeout(r.startupTimer);if(r.closed)throw error('EDITOR_CLOSED');}catch(e){r.ready.reject(e);void retire(r,'Native control opening failed',true).catch(()=>{});throw e;}
  async function invoke(operation,extra={}){
   if(r.closed||!r.active||disposed)throw error('EDITOR_CLOSED','Native control owner closed',{nativeDispatched:false});
   try{await guard(operation==='write'?['read','inject','replay']:['read','inject']);}catch(e){e.nativeDispatched=false;void retire(r,'Native input authority changed',true).catch(()=>{});throw e;}
   if(r.closed)throw error('EDITOR_CLOSED','Native control owner closed',{nativeDispatched:false});
   let result;
   try{result=row(await dispatch(operation,extra)).result;}catch(e){e.nativeDispatched=true;void retire(r,'Native input acknowledgement unavailable',true).catch(()=>{});throw e;}
   try{await guard(operation==='write'?['read','inject','replay']:['read','inject']);}
   catch(e){void retire(r,'Native input authority changed after dispatch',true).catch(()=>{});if(operation==='write')return{...result,authorityLost:true};throw e;}
   return result;
  }
  return Object.freeze({read:()=>invoke('read'),write:(resource,value)=>invoke('write',{resource,value}),close:reason=>retire(r,reason),get closed(){return r.closed;}});
 }
 async function dispose(){if(disposed)return;disposed=true;if(available)runtime.onConnect.removeListener(connected);await Promise.allSettled([...records.values()].map(r=>retire(r,'Host native owner disposed',true)));}
 return Object.freeze({get available(){return available&&!disposed;},open,dispose});
}
