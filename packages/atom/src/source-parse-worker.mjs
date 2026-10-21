// SPDX-License-Identifier: Apache-2.0
import {runSourceParseJob} from '../../../core/source-parse-job.mjs';
import {SOURCE_PARSE_REQUEST,SOURCE_PARSE_REPLY,sourceParseError} from '../../../core/source-parse-contract.mjs';
export function installSourceParseWorker(scope){
 let used=false;
 const receive=event=>{
  if(used)return;used=true;scope.removeEventListener('message',receive);
  const m=event.data,id=typeof m?.id==='string'?m.id:null;
  void(async()=>{
   try{
    if(!m||Object.keys(m).sort().join(',')!=='bytes,id,operation,schema'||m.schema!==SOURCE_PARSE_REQUEST||!id||id.length>100||!(m.bytes instanceof Uint8Array))throw sourceParseError('SOURCE_PARSE_INVALID');
    scope.postMessage({schema:SOURCE_PARSE_REPLY,id,kind:'started',operation:m.operation});
    const result=await runSourceParseJob({operation:m.operation,bytes:m.bytes});
    scope.postMessage({schema:SOURCE_PARSE_REPLY,id,kind:'result',ok:true,result});
   }catch(error){const code=error.code==='SOURCE_PARSE_BUDGET'||/budget/i.test(error.message)?'SOURCE_PARSE_BUDGET':error.message==='Unsupported source map (flat v3 only)'?'SOURCE_PARSE_UNSUPPORTED':'SOURCE_PARSE_INVALID';scope.postMessage({schema:SOURCE_PARSE_REPLY,id,kind:'result',ok:false,error:{code}});}
   finally{scope.close?.();}
  })();
 };
 scope.addEventListener('message',receive);
}
if(typeof self!=='undefined'&&typeof self.postMessage==='function'&&typeof document==='undefined')installSourceParseWorker(self);
