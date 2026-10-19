// SPDX-License-Identifier: Apache-2.0
// Offscreen side: only runtime messaging and Worker APIs. No debugger/tabs access.
import {registryClient} from '../../../core/guardian-worker-wire.mjs';
import {createGuardianSession} from '../../../core/guardian-session.mjs';
export const GUARDIAN_PORT='stateatom.guardian/1';
const fail=code=>Object.assign(new Error(code),{code});
function frame(m,required){
 if(!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).length!==required.length||required.some(k=>!Object.hasOwn(m,k))||new TextEncoder().encode(JSON.stringify(m)).length>131072)throw fail('INVALID_PROTOCOL');
 if(m.version!==1)throw fail('INVALID_PROTOCOL');
}
export function serveGuardianPort(port,{registry,onClose=()=>{},onSnapshot=()=>{}}){
 let nonce=null,session=null,closed=false,closing=null,lastSequence=0,cleanupSequence=0;const cleanup=new Map();let finish;
 const done=new Promise(resolve=>finish=resolve);
 const send=m=>{if(closed)throw fail('SESSION_CLOSED');port.postMessage({...m,version:1,nonce});};
 function close(){
  if(closing)return closing;closed=true;for(const p of cleanup.values())p.reject(fail('SESSION_CLOSED'));cleanup.clear();
  closing=(async()=>{try{await session?.close();}catch{}port.onMessage.removeListener(receive);port.onDisconnect.removeListener(disconnected);try{port.disconnect();}catch{}finish();await onClose();})();return closing;
 }
 const disconnected=()=>{void close();};
 function executeCleanup(job){return new Promise((resolve,reject)=>{const sequence=++cleanupSequence;cleanup.set(sequence,{resolve,reject});try{send({kind:'cleanup',sequence,job});}catch(e){cleanup.delete(sequence);reject(e);}});}
 function receive(m){
  if(closed)return;
  try{
   if(nonce===null){
    frame(m,['kind','version','nonce']);if(m.kind!=='challenge'||typeof m.nonce!=='string'||m.nonce.length<16||m.nonce.length>100)throw fail('INVALID_PROTOCOL');nonce=m.nonce;
    session=createGuardianSession({registry,executeCleanup});void session.ready.then(snapshot=>{if(!closed){onSnapshot(snapshot);send({kind:'ready',snapshot});}},()=>close());return;
   }
   if(m?.nonce!==nonce||m.version!==1)throw fail('INVALID_PROTOCOL');
   if(m.kind==='cleanup-result'){
    frame(m,['kind','version','nonce','sequence','result']);if(!Number.isSafeInteger(m.sequence)||m.sequence<1)throw fail('INVALID_PROTOCOL');const p=cleanup.get(m.sequence);if(p){cleanup.delete(m.sequence);p.resolve(m.result);}return;
   }
   frame(m,['kind','version','nonce','sequence','op','args']);if(m.kind!=='rpc'||!Number.isSafeInteger(m.sequence)||m.sequence<1)throw fail('INVALID_PROTOCOL');
   if(m.sequence<=lastSequence){send({kind:'reply',sequence:m.sequence,ok:false,code:'STALE_MESSAGE'});return;}
   if(m.sequence!==lastSequence+1)throw fail('INVALID_PROTOCOL');lastSequence=m.sequence;
   void session.request(m.op,m.args).then(result=>{if(!closed){onSnapshot(result.snapshot);send({kind:'reply',sequence:m.sequence,ok:true,...result});}},error=>{if(!closed)send({kind:'reply',sequence:m.sequence,ok:false,code:error.code||'GUARDIAN_FAILED'});}).catch(()=>close());
  }catch{void close();}
 }
 port.onMessage.addListener(receive);port.onDisconnect.addListener(disconnected);
 return Object.freeze({done,close,get closed(){return closed;}});
}


export function runGuardianDocument({runtime,WorkerCtor,documentURL,healthInterval=2000,workerTimeout=3000,reconnectDelay=100}){
 let stopped=false,broken=false,active=null,health=null,retryTimer=null,attempts=0,registry;
 const worker=new WorkerCtor(new URL('./atom-guardian-worker.js',documentURL),{type:'module'});
 const stopHealth=()=>{clearInterval(health);health=null;};
 function failed(){if(broken||stopped)return;broken=true;stopHealth();clearTimeout(retryTimer);void active?.close();}
 registry=registryClient(worker,{timeout:workerTimeout,onLost:failed});
 function observe(snapshot){
  if(stopped||broken)return;
  if(!snapshot.leases.length){stopHealth();return;}
  if(!health)health=setInterval(()=>{void registry.snapshot().then(observe,failed);},healthInterval);
 }
 async function connect(){
  if(stopped||broken)return;if(active?.closed)await active.close();if(active||stopped||broken)return;
  clearTimeout(retryTimer);const port=runtime.connect({name:GUARDIAN_PORT});let server;
  server=serveGuardianPort(port,{registry,onSnapshot:snapshot=>{attempts=0;observe(snapshot);},onClose:async()=>{
   if(active===server)active=null;if(stopped||broken)return;
   try{const snapshot=await registry.snapshot();observe(snapshot);if(snapshot.leases.length&&attempts++<3)retryTimer=setTimeout(()=>{void connect().catch(failed);},reconnectDelay*Math.max(1,attempts));}catch{failed();}
  }});active=server;
 }
 const wake=(message,sender,reply)=>{
  if(message?.stateatomGuardianWake!==1||sender?.id!==runtime.id||sender.tab||sender.documentId)return false;
  if(broken){reply({ok:false,code:'REGISTRY_LOST'});return false;}
  void connect().then(()=>reply({ok:true}),()=>reply({ok:false,code:'REGISTRY_LOST'}));return true;
 };
 runtime.onMessage.addListener(wake);void connect().catch(failed);
 return Object.freeze({async dispose(){if(stopped)return;stopped=true;stopHealth();clearTimeout(retryTimer);runtime.onMessage.removeListener(wake);await active?.close();registry.close();}});
}
