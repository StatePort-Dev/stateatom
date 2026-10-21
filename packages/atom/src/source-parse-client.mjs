// SPDX-License-Identifier: Apache-2.0
import {SOURCE_PARSE_REQUEST,SOURCE_PARSE_REPLY,sourceParseSpec,sourceParseError,validSourceParseResult} from '../../../core/source-parse-contract.mjs';
function ownedURL(value,baseURL){try{const b=new URL(baseURL),u=new URL(value,b);if(!['chrome-extension:','http:','https:'].includes(b.protocol)||u.protocol!==b.protocol||u.host!==b.host||u.username||u.password||u.href.includes('?')||u.href.includes('#')||!u.pathname.endsWith('/source-parse-worker.js'))return null;return u.href;}catch{return null;}}
export function createSourceParseClient({url,baseURL,Worker=globalThis.Worker,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const asset=typeof url==='string'?ownedURL(url,baseURL):null;let active=null,disposed=false;
 const cancel=()=>active?.finish(sourceParseError('SOURCE_PARSE_CANCELLED'));
 return{available:!!asset&&typeof Worker==='function',cancel,dispose(){if(disposed)return;disposed=true;cancel();},async run(operation,input,{signal,onStarted}={}){
  if(disposed||!asset||typeof Worker!=='function')throw sourceParseError('SOURCE_PARSE_UNAVAILABLE');
  const spec=sourceParseSpec(operation);if(!(input instanceof Uint8Array))throw sourceParseError('SOURCE_PARSE_INVALID');if(input.length>spec.bytes)throw sourceParseError('SOURCE_PARSE_BUDGET');if(signal?.aborted)throw sourceParseError('SOURCE_PARSE_CANCELLED');
  cancel();const bytes=input.slice();
  return new Promise((resolve,reject)=>{
   let worker,timer,done=false,started=false;const id=crypto.randomUUID(),abort=()=>finish(sourceParseError('SOURCE_PARSE_CANCELLED'));
   function finish(error,result){if(done)return;done=true;clearTimer(timer);signal?.removeEventListener('abort',abort);if(worker){worker.removeEventListener('message',message);worker.removeEventListener('error',failed);worker.removeEventListener('messageerror',failed);worker.terminate();}if(active?.id===id)active=null;if(error)reject(error);else resolve(result);}
   const failed=event=>{event.preventDefault?.();finish(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));};
   function message(event){
    if(done)return;const m=event.data;
    if(!m||m.schema!==SOURCE_PARSE_REPLY||m.id!==id){finish(sourceParseError('SOURCE_PARSE_INVALID'));return;}
    if(m.kind==='started'&&Object.keys(m).sort().join(',')==='id,kind,operation,schema'&&m.operation===operation&&!started){started=true;try{onStarted?.();}catch{finish(sourceParseError('SOURCE_PARSE_CANCELLED'));}return;}
    if(m.kind!=='result'){finish(sourceParseError('SOURCE_PARSE_INVALID'));return;}
    if(m.ok===true&&Object.keys(m).sort().join(',')==='id,kind,ok,result,schema'&&validSourceParseResult(m.result,operation))finish(null,m.result);
    else if(m.ok===false&&Object.keys(m).sort().join(',')==='error,id,kind,ok,schema'&&m.error&&Object.keys(m.error).join(',')==='code'&&['SOURCE_PARSE_INVALID','SOURCE_PARSE_UNSUPPORTED','SOURCE_PARSE_BUDGET'].includes(m.error.code))finish(sourceParseError(m.error.code));
    else finish(sourceParseError('SOURCE_PARSE_INVALID'));
   }
   active={id,finish};
   try{worker=new Worker(asset,{type:'module',name:'stateatom-source-parse'});worker.addEventListener('message',message);worker.addEventListener('error',failed);worker.addEventListener('messageerror',failed);signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}timer=setTimer(()=>finish(sourceParseError('SOURCE_PARSE_BUDGET')),spec.ms);worker.postMessage({schema:SOURCE_PARSE_REQUEST,id,operation,bytes},[bytes.buffer]);}
   catch{finish(sourceParseError('SOURCE_PARSE_UNAVAILABLE'));}
  });
 }};
}
