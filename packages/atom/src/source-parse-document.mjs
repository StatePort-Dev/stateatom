// SPDX-License-Identifier: Apache-2.0
// Offscreen source channel owns dedicated parser threads only. It has no access
// to debugger leases, page targets, registry capabilities or persistent storage.
import {createSourceParseClient} from './source-parse-client.mjs';
import {SOURCE_PARSE_PORT,SOURCE_PARSE_CHANNEL,sourceParseFrame} from './source-parse-channel.mjs';
import {sourceParseSpec,sourceParseError} from '../../../core/source-parse-contract.mjs';
import {decodeSourceBytes,packSourceParseResult} from '../../../core/source-parse-wire.mjs';
export function serveSourceParsePort(port,{createClient,documentURL,onHostURL=()=>{},onClose=()=>{}}){
 let nonce=null,closed=false,lastId=0;const jobs=new Map();let resolveDone;const done=new Promise(r=>resolveDone=r);
 const send=m=>{if(!closed)port.postMessage({schema:SOURCE_PARSE_CHANNEL,nonce,...m});};
 function retire(id,job){if(job.done)return;job.done=true;jobs.delete(id);job.client.dispose();}
 async function close(){if(closed)return;closed=true;port.onMessage.removeListener(receive);port.onDisconnect.removeListener(disconnected);for(const[id,j]of jobs){j.controller.abort();retire(id,j);}try{port.disconnect();}catch{}resolveDone();await onClose();}
 const disconnected=()=>{void close();};
 function receive(m){
  if(closed)return;
  try{
   if(nonce===null){sourceParseFrame(m,['schema','kind','nonce','hostWorkerURL']);if(m.kind!=='challenge'||typeof m.nonce!=='string'||m.nonce.length<16||m.nonce.length>100||typeof m.hostWorkerURL!=='string'||m.hostWorkerURL.length>4096)throw sourceParseError('SOURCE_PARSE_INVALID');const host=new URL(m.hostWorkerURL),doc=new URL(documentURL);if(host.protocol!=='chrome-extension:'||host.protocol!==doc.protocol||host.host!==doc.host||host.username||host.password||host.href.includes('?')||host.href.includes('#')||!/^.*\.m?js$/.test(host.pathname))throw sourceParseError('SOURCE_PARSE_INVALID');nonce=m.nonce;onHostURL(host.href);send({kind:'ready'});return;}
   if(m?.nonce!==nonce)throw sourceParseError('SOURCE_PARSE_INVALID');
   if(m.kind==='cancel'){sourceParseFrame(m,['schema','kind','nonce','id']);if(!Number.isSafeInteger(m.id)||m.id<1)throw sourceParseError('SOURCE_PARSE_INVALID');const j=jobs.get(m.id);if(j){j.controller.abort();retire(m.id,j);}return;}
   sourceParseFrame(m,['schema','kind','nonce','id','operation','data']);if(m.kind!=='parse'||!Number.isSafeInteger(m.id)||m.id<=lastId)throw sourceParseError('SOURCE_PARSE_INVALID');lastId=m.id;
   const spec=sourceParseSpec(m.operation);if(jobs.size>=2){send({kind:'reply',id:m.id,ok:false,code:'SOURCE_PARSE_BUSY'});return;}
   const bytes=decodeSourceBytes(m.data,spec.bytes),controller=new AbortController(),client=createClient(),job={controller,client,done:false};jobs.set(m.id,job);
   void(async()=>{try{
    const result=await client.run(m.operation,bytes,{signal:controller.signal,onStarted:()=>{if(!job.done)send({kind:'started',id:m.id});}});
    if(!closed&&!job.done)send({kind:'reply',id:m.id,ok:true,result:packSourceParseResult(result)});
   }catch(error){if(!closed&&!job.done)send({kind:'reply',id:m.id,ok:false,code:sourceParseError(error.code).code});}
   finally{retire(m.id,job);}})().catch(()=>close());
  }catch{void close();}
 }
 port.onMessage.addListener(receive);port.onDisconnect.addListener(disconnected);return Object.freeze({close,done,get closed(){return closed;}});
}
export function runSourceParseDocument({runtime,WorkerCtor,documentURL}){
 let active=null,stopped=false,hostWorkerURL=null;
 const createClient=()=>createSourceParseClient({url:new URL('./source-parse-worker.js',documentURL).href,baseURL:documentURL,Worker:WorkerCtor});
 function connect(){if(stopped)throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');if(active&&!active.closed)return;let server;const port=runtime.connect({name:SOURCE_PARSE_PORT});server=serveSourceParsePort(port,{createClient,documentURL,onHostURL:url=>{hostWorkerURL=url;},onClose:()=>{if(active===server)active=null;}});active=server;}
 const wake=(m,sender,reply)=>{if(m?.stateatomSourceParseWake!==1||Object.keys(m).length!==1||sender?.id!==runtime.id||sender.tab||sender.documentId||sender.url&&sender.url!==hostWorkerURL)return false;try{connect();reply({ok:true});}catch{reply({ok:false});}return false;};
 runtime.onMessage.addListener(wake);connect();return Object.freeze({async dispose(){if(stopped)return;stopped=true;runtime.onMessage.removeListener(wake);await active?.close();}});
}
