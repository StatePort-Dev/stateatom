// SPDX-License-Identifier: Apache-2.0
// Public read protocol for the explicitly enabled finite list profile. The
// source observer cannot issue helper-owned effects or code-history authority.
import {createReact19Acquisition} from './react19-acquisition.mjs';
export function createListFieldRuntime({page}={}){
 const api=createReact19Acquisition({page,reducerFields:true,listData:true}),apply=Reflect.apply,own=Object.getOwnPropertyDescriptor,create=Object.create,ObjectProto=Object.prototype,ArrayProto=Array.prototype;
 let stopped=false,invalidated=false;
 const missing=reason=>({status:'Unknown/Unsupported',reason,fullPath:false,fieldOwnership:'Unknown/Unsupported'});
 function snapshot(_instance,property,node){
  // Check descriptors only. Never call an application serialization hook while
  // preparing data for the native extension/helper transport.
  const serialization=!!(own(ObjectProto,'toJSON')||own(ArrayProto,'toJSON'));
  if(serialization){const result=create(null);result.schema=1;result.page=page;result.status='Unknown/Unsupported';result.reason='Application prototype serialization hook unsupported';result.target=null;return result}
  const reason=stopped?'List observer stopped; old history is not current':invalidated?'List observer invalidated by changed source':property!=='text'?'This finite list profile observes text only':'Selected list facts require current helper-owned source, code and occurrence verification';
  const available=!serialization&&!stopped&&!invalidated&&property==='text';
  return{schema:1,page,status:invalidated?'Stale':'Unknown/Unsupported',reason,target:null,nodes:[],exchanges:[],recentExchanges:[],
   listFieldObservations:{schema:'stateatom.selected-list-observation/1',page,property,status:available?'Recorded':'Unknown/Unsupported',reason:available?null:reason,
    selected:available?api.matchSelectedListData(node):missing(reason),environment:available?api.nativeEnvironment():missing(reason),commit:available?api.currentCommit():missing(reason),fieldOwnership:'Unknown/Unsupported',fullPath:false,
    scope:'Original selected list/field facts only; complete source/effect/code authority must come from the trusted helper'},
   boundaries:['The page observer supplies no complete field ownership or full lineage authority.']};
 }
 const runtime=Object.freeze({version:1,page,nativeStateAcquisition:true,
  react19NativeTap(){if(!stopped&&!invalidated)return apply(api.tap,api,arguments)},snapshot,
  stop(){stopped=true;api.stop()},invalidate(){invalidated=true;api.stop()}
 });
 return Object.freeze({api,runtime});
}
