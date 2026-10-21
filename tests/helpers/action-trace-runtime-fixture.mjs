// SPDX-License-Identifier: Apache-2.0
// Synthetic CDP/helper/IDE transport boundaries around the real runtime/platform.
// This fixture does not establish native Event identity or browser acceptance.
import {inputCaptureRuntimeFixture} from './input-capture-runtime-fixture.mjs';
import {createActionObservation} from '../../core/action-observation.mjs';

export const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const origin='http://127.0.0.1:4173',page='test-page';
const site={id:'click-site',file:'src/actions.js',sourceDigest:'a'.repeat(64),line:2,column:1,endLine:5,endColumn:2,kind:'function',symbol:'confirm'};
export async function actionTraceRuntimeFixture(t,{createRuntime,armGate,sourceGate,onCleanup}={}){
 let ledger=null,sequence=0,sourceChecks=0;
 const f=inputCaptureRuntimeFixture({createRuntime,
  async fetch(url,init){
   const op=new URL(url).pathname,body=JSON.parse(init.body);
   if(op==='/check-action-sources'){sourceChecks++;await sourceGate?.(body);return{json:async()=>({ok:true,result:{current:true}})};}
   return{json:async()=>({ok:false,error:'No source resolver in this protocol fixture'})};
  },
  async send(method,params){
   if(method==='DOM.resolveNode')return{object:{objectId:'native-selected'}};
   if(method==='DOMDebugger.getEventListeners')return{listeners:[]};
   if(method!=='Runtime.callFunctionOn')return;
   const [op,expectedPage,identity,expectedTraceId]=(params.arguments||[]).map(a=>a.value);
   if(!['arm','read','cancel','clear'].includes(op))return;
   if(op==='arm'){
    ledger=createActionObservation({identity:{...identity,page},sites:[site],id:()=>`trace-${++sequence}`});
    ledger.arm({selectedId:'selected-native-node',timeoutMs:10000});const trace=ledger.snapshot();
    await armGate?.(trace);return{result:{value:{ok:true,page,trace}}};
   }
   if(op==='cancel'||op==='clear')onCleanup?.(expectedTraceId);
   if(expectedPage!==page||ledger?.snapshot().traceId!==expectedTraceId)return{result:{value:{ok:false,code:'STALE_TARGET'}}};
   if(op==='cancel')ledger.cancel();if(op==='clear')ledger.clear();
   return{result:{value:{ok:true,page,trace:ledger.snapshot()}}};
  }
 });
 // Restore the normal persisted source connection before asynchronous startup.
 f.data['stateport.atom.v1.pairing']={url:'http://127.0.0.1:49331',origin,token:'synthetic-private-test-token'};
 t.after(()=>f.runtime.shutdown());
 const session='trace-runtime',client=f.runtime.connectInspector(session);
 const request=(payload,options)=>f.runtime.request({version:1,id:crypto.randomUUID(),session,payload:{tabId:1,...(payload.op.startsWith('actions-')||payload.op==='capabilities'?{ownerId:'view-a'}:{}),...payload}},options);
 await f.inspect();
 await f.emit('Runtime.executionContextCreated',{context:{id:7,uniqueId:'main-context',auxData:{frameId:'main',isDefault:true}}});
 function action(){const event={};ledger.dispatch(event,{targetId:'selected-native-node',trusted:true});const activation=ledger.enter('click-site',event,'selected-native-node');ledger.leave(activation,false);ledger.finish();}
 return{...f,client,request,action,get sourceChecks(){return sourceChecks;},async state(){return request({op:'state'});}};
}
