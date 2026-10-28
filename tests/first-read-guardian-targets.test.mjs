// SPDX-License-Identifier: Apache-2.0
// Authored native responses test acquisition refusal only, not native ownership.
import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,writeFile,rm} from 'node:fs/promises';import {EventEmitter} from 'node:events';
import {acquireGuardianTargets} from '../src/first-read/guardian-targets.mjs';
test('guardian native acquisition binds exact original script, sole parented worker and cleans child session',async t=>{
 const base=await mkdtemp('/tmp/list-guardian-code-');t.after(()=>rm(base,{recursive:true,force:true}));await writeFile(base+'/atom-guardian-worker.js','void 0;');
 for(const mode of ['valid','changed-bytes','other-script','second-script','wrong-parent','missing-document','script-failed']){
  const extensionId='a'.repeat(32),origin='chrome-extension://'+extensionId,documentURL=origin+'/atom-guardian.html',workerURL=origin+'/atom-guardian-worker.js';let detached=false;
  const cdp=new EventEmitter(),worker={targetId:'worker',type:'worker',url:'',parentId:mode==='wrong-parent'?'app':'doc',parentFrameId:'doc'};
  cdp.send=async(method,p)=>{
   if(method==='Target.getTargets')return{targetInfos:[{targetId:'doc',type:'background_page',url:documentURL},worker]};
   if(method==='Target.getTargetInfo')return{targetInfo:worker};
   if(method==='Target.attachToTarget')return{sessionId:'child'};
   if(method==='Target.detachFromTarget'){detached=true;return{};}
   if(method==='Target.sendMessageToTarget'){
    const message=JSON.parse(p.message),emit=m=>cdp.emit('Target.receivedMessageFromTarget',{sessionId:'child',message:JSON.stringify(m)});
    if(message.method==='Debugger.enable'){emit({method:mode==='script-failed'?'Debugger.scriptFailedToParse':'Debugger.scriptParsed',params:{scriptId:'source',url:mode==='other-script'?origin+'/other.js':workerURL}});if(mode==='second-script')emit({method:'Debugger.scriptParsed',params:{scriptId:'second',url:workerURL}});}
    emit({id:message.id,result:message.method==='Debugger.getScriptSource'?{scriptSource:mode==='changed-bytes'?'void 1;':'void 0;'}:{}});return{};
   }throw Error('Unexpected native command');
  };
  const invoke=()=>acquireGuardianTargets({cdp,base,extensionId,extensionWorker:{evaluate:async()=>mode==='missing-document'?[]:[{contextType:'OFFSCREEN_DOCUMENT',documentUrl:documentURL}]}});
  if(mode==='valid'){const result=await invoke();assert.equal(result.workerId,'worker');assert.equal(result.workerTargetURL,'');assert.equal(result.scriptDigest.length,64);}else await assert.rejects(invoke(),/Guardian|guardian/);
  assert.equal(cdp.listenerCount('Target.receivedMessageFromTarget'),0);assert.equal(detached,!['wrong-parent','missing-document'].includes(mode));
 }
});
