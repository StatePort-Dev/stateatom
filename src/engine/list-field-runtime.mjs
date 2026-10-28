// SPDX-License-Identifier: Apache-2.0
// Public read protocol for the explicitly enabled finite list profile. The
// source observer cannot issue helper-owned effects or code-history authority.
import {createReact19Acquisition} from './react19-acquisition.mjs';
import {createListDOMHistory} from './list-dom-history.mjs';
export function createListFieldRuntime({page}={}){
 if(typeof page!=='string'||!page||page.length>120)throw Error('Bounded list profile page prefix required');
 let identityAvailable=false;const prefix=page;
 try{const nonce=globalThis.crypto.randomUUID();if(typeof nonce!=='string'||!/^[-a-f0-9]{36}$/.test(nonce))throw Error('Native observation identity unavailable');page=prefix+':'+nonce;identityAvailable=true}catch{page=prefix+':unavailable'}
 const api=createReact19Acquisition({page,reducerFields:true,listData:true}),dom=createListDOMHistory(),apply=Reflect.apply,own=Object.getOwnPropertyDescriptor,create=Object.create,ObjectProto=Object.prototype,ArrayProto=Array.prototype;
 let stopped=!identityAvailable,invalidated=false;
 if(!identityAvailable){api.stop();dom.stop()}
 const missing=reason=>({status:'Unknown/Unsupported',reason,fullPath:false,fieldOwnership:'Unknown/Unsupported'});
 function snapshot(_instance,property,node){
  // Check descriptors only. Never call an application serialization hook while
  // preparing data for the native extension/helper transport.
  const serialization=!!(own(ObjectProto,'toJSON')||own(ArrayProto,'toJSON'));
  if(serialization){const result=create(null);result.schema=1;result.page=page;result.status='Unknown/Unsupported';result.reason='Application prototype serialization hook unsupported';result.target=null;return result}
  const reason=!identityAvailable?'Secure observation identity unavailable':stopped?'List observer stopped; old history is not current':invalidated?'List observer invalidated by changed source':property!=='text'?'This finite list profile observes text only':'Selected list facts require current helper-owned source, code and occurrence verification';
  const available=!serialization&&!stopped&&!invalidated&&property==='text',commit=available?api.currentCommit():missing(reason);
  return{schema:1,page,status:invalidated?'Stale':'Unknown/Unsupported',reason,target:null,nodes:[],exchanges:[],recentExchanges:[],
   listFieldObservations:{schema:'stateatom.selected-list-observation/1',page,property,status:available?'Recorded':'Unknown/Unsupported',reason:available?null:reason,
    selected:available?api.matchSelectedListData(node):missing(reason),environment:available?api.nativeEnvironment():missing(reason),commit,dom:available?dom.snapshot(node,commit.commitId):missing(reason),fieldOwnership:'Unknown/Unsupported',fullPath:false,
    scope:'Original selected list/field facts only; complete source/effect/code authority must come from the trusted helper'},
   boundaries:['The page observer supplies no complete field ownership or full lineage authority.']};
 }
 const runtime=Object.freeze({version:1,page,nativeStateAcquisition:true,
  react19NativeTap(){if(!stopped&&!invalidated){if(arguments[0]==='list-host-begin')dom.beginHost(arguments[1]);if(arguments[0]==='list-host-end')dom.endHost(arguments[1],arguments[2]);const result=apply(api.tap,api,arguments);if(arguments[0]==='root-current'){const commit=api.currentCommit();if(commit.status==='Observed')dom.commit(commit.commitId)}return result}},snapshot,
  stop(){stopped=true;api.stop();dom.stop()},invalidate(){invalidated=true;api.stop();dom.stop()}
 });
 return Object.freeze({api,runtime});
}
