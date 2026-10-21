// SPDX-License-Identifier: Apache-2.0
// Bounded instrumented-page evidence, not hostile-page attestation. The DOM
// adapter, not this pure ledger, must establish an original trusted Event.
const invoke=Reflect.apply,NativeMap=Map,mapGet=Map.prototype.get,mapSet=Map.prototype.set;
const push=Array.prototype.push,pop=Array.prototype.pop,freeze=Object.freeze,integer=Number.isInteger,finite=Number.isFinite,regexExec=RegExp.prototype.exec;
const append=(a,v)=>invoke(push,a,[v]),copy=a=>{const result=[];for(let i=0;i<a.length;i++)append(result,{...a[i]});return result;};
export function createActionObservation({identity,sites,now=Date.now,id=()=>crypto.randomUUID(),recordLimit=64}){
 if(!identity?.run||!identity?.build||!identity?.page||!identity?.frame||!integer(recordLimit)||recordLimit<3||recordLimit>256)throw Error('Action observation context/budget unavailable');
 const context=freeze({run:identity.run,build:identity.build,page:identity.page,frame:identity.frame}),catalog=new NativeMap();
 for(let i=0;i<sites.length;i++){const s=sites[i];if(typeof s.id!=='string'||!s.file||typeof s.sourceDigest!=='string'||!invoke(regexExec,/^[a-f0-9]{64}$/,[s.sourceDigest]))throw Error('Invalid compiled action source');invoke(mapSet,catalog,[s.id,freeze({id:s.id,file:s.file,sourceDigest:s.sourceDigest,line:s.line,column:s.column,endLine:s.endLine,endColumn:s.endColumn,kind:s.kind,symbol:s.symbol})]);}
 let status='idle',reason=null,records=[],stack=[],event=null,dispatchId=null,selectedId=null,deadline=0,traceId=null;
 function release(){event=null;stack=[];}
 function tick(){if((status==='armed'||status==='collecting')&&now()>=deadline){status='expired';reason='Observation time budget ended; action was not undone';release();}}
 function add(record){if(records.length>=recordLimit){status='partial';reason='Observation record budget ended';release();return false;}append(records,freeze({...record,sequence:records.length}));return true;}
 const api={
  arm({selectedId:selection,timeoutMs=1000}={}){if(typeof selection!=='string'||!selection||selection.length>200||!finite(timeoutMs)||timeoutMs<=0||timeoutMs>10000)throw Error('Action observation selection/budget unavailable');release();records=[];selectedId=selection;traceId=id();dispatchId=null;deadline=now()+timeoutMs;status='armed';reason=null;return traceId;},
  dispatch(original,{targetId,trusted}={}){tick();if(status!=='armed'||!original||trusted!==true||typeof targetId!=='string')return false;event=original;dispatchId=id();status='collecting';return add({kind:'dispatch',dispatchId,eventType:'click',selectedId,targetId,trusted:true});},
  enter(siteId,original,currentTargetId){try{tick();if(status!=='collecting'||original!==event||typeof siteId!=='string'||typeof currentTargetId!=='string')return null;const site=invoke(mapGet,catalog,[siteId]);if(!site)return null;const token=freeze({}),activationId=id(),parent=stack[stack.length-1];if(!add({kind:'body-entry',activationId,dispatchId,siteId,source:site,currentTargetId,parentActivationId:parent?.activationId??null}))return null;append(stack,{token,activationId});return token;}catch{status='partial';reason='Observation helper unavailable';release();return null;}},
  leave(token,threw){try{tick();if(status!=='collecting'||!stack.length||stack[stack.length-1].token!==token)return false;const activation=invoke(pop,stack,[]);return add({kind:'body-leave',activationId:activation.activationId,dispatchId,completion:threw===true?'throw':'return'});}catch{status='partial';reason='Observation helper unavailable';release();return false;}},
  finish(boundary=null){tick();if(status!=='collecting')return false;const unclosed=stack.length;status=unclosed||records.length===1?'partial':'complete';reason=unclosed?'Unclosed function body; exit unavailable':records.length===1?'No supported function body observed':boundary;release();return true;},
  cancel(){status='cancelled';reason='Observation cancelled; action was not undone';release();},
  clear(){status='cleared';reason=null;records=[];traceId=null;dispatchId=null;selectedId=null;release();},
  invalidate(){status='stale';reason='Selected context/source changed';release();},
  stop(){status='stopped';reason='Observation stopped; action was not undone';release();},
  snapshot(){tick();return {schema:1,status,reason,traceId,identity:{...context},selectedId,records:copy(records),runtimeFunctionObjectIdentity:'Unavailable',asyncEffects:'Unlinked',completeListenerCoverage:false,actionUndone:false};},
 };
 return freeze(api);
}
