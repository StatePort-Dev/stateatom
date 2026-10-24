// SPDX-License-Identifier: Apache-2.0
// Own trusted extension worker only. No request, params, result or error content.
export function installWorkerAPIProbe(scope=globalThis,{tabId,limit=2048,maxLimit=2048}={}){
 if(!Number.isSafeInteger(tabId)||tabId<1||![2048,16384].includes(maxLimit)||!Number.isSafeInteger(limit)||limit<1||limit>maxLimit)throw Error('Invalid worker probe configuration');
 const paths=['debugger.sendCommand','tabs.get','permissions.contains','scripting.executeScript','storage.session.get','storage.session.set','storage.local.get','storage.local.set','runtime.sendMessage'];
 const nativeMethods=new Set(['DOM.enable','DOM.getDocument','DOM.querySelector','DOM.describeNode','DOM.pushNodesByBackendIdsToFrontend','DOM.resolveNode','DOM.requestNode','Runtime.callFunctionOn','Runtime.releaseObjectGroup','Debugger.getScriptSource']);
 const clock={timeOrigin:scope.performance.timeOrigin,crossOriginIsolated:scope.crossOriginIsolated===true};if(!Number.isFinite(clock.timeOrigin)||clock.timeOrigin<=0)throw Error('Worker clock unavailable');
 const then=(scope.Promise||Promise).prototype.then;
 let tag=null,rows=[],overflow=false,inflight=0,unsupported=false,ordinal=0;
 function data(object,key){if(!object||typeof object!=='object')return undefined;const descriptor=Object.getOwnPropertyDescriptor(object,key);if(descriptor&&!Object.hasOwn(descriptor,'value')){unsupported=true;return undefined;}return descriptor?.value;}
 const entries=paths.map(label=>{const parts=label.split('.'),name=parts.pop(),api=parts.reduce((o,k)=>o?.[k],scope.chrome),original=api?.[name];if(typeof original!=='function')throw Error('Worker API unavailable: '+label);return{label,api,name,original,wrapped:null};});
 for(const entry of entries)entry.wrapped=function(...args){
  const {label,original}=entry;
  if(!tag||label==='tabs.get'&&args[0]!==tabId||label==='debugger.sendCommand'&&data(args[0],'tabId')!==tabId||label==='scripting.executeScript'&&data(data(args[0],'target'),'tabId')!==tabId)return Reflect.apply(original,this,args);
  const method=label==='debugger.sendCommand'&&nativeMethods.has(args[1])?args[1]:null;
  const row={ordinal:ordinal++,api:label,method,startMs:scope.performance.now(),endMs:null,durationMs:null,ok:null,supported:!(typeof args.at(-1)==='function'||label==='debugger.sendCommand'&&method===null)};
  if(!row.supported)unsupported=true;if(rows.length<limit)rows.push(row);else overflow=true;inflight++;
  function finish(ok){row.endMs=scope.performance.now();row.durationMs=row.endMs-row.startMs;row.ok=ok;inflight--;}
  let result;try{result=Reflect.apply(original,this,args);}catch(error){finish(false);throw error;}
  // Intrinsic brand check avoids accessing a user thenable's .then getter.
  try{Reflect.apply(then,result,[()=>finish(true),()=>finish(false)]);}
  catch{unsupported=true;row.supported=false;finish(null);}
  return result;
 };
 const installed=[];
 try{for(const entry of entries){entry.api[entry.name]=entry.wrapped;if(entry.api[entry.name]!==entry.wrapped)throw Error('Worker API replacement unavailable');installed.push(entry);}}
 catch(error){const failures=[];for(const entry of installed.reverse())try{if(entry.api[entry.name]===entry.wrapped)entry.api[entry.name]=entry.original;else failures.push(entry.label);}catch{failures.push(entry.label);}if(failures.length)error.workerProbeRollbackFailed=failures;throw error;}
 return Object.freeze({
  reset(value){if(inflight)throw Error('Worker probe request still pending');if(typeof value!=='string'||!/^[A-Za-z0-9-]{1,64}$/.test(value))throw Error('Invalid worker probe tag');tag=value;rows=[];overflow=false;unsupported=false;ordinal=0;},
  snapshot(){return{tag,tabId,limit,clock:{...clock},rows:rows.map(row=>({...row})),overflow,inflight,unsupported};},
  restore(){if(inflight)throw Error('Worker probe request still pending');if(entries.some(entry=>entry.api[entry.name]!==entry.wrapped))throw Error('Worker probe API replaced');for(const entry of entries)entry.api[entry.name]=entry.original;tag=null;}
 });
}
