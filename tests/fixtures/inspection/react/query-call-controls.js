// SPDX-License-Identifier: Apache-2.0
// Native call-site/body facts only. These controls deliberately demonstrate effects gaps.
import {QueryClient,Query} from '@tanstack/query-core';
const evidence=()=>window.__STATEATOM__?.queryCallObservations?.()||{events:[],fullPath:false,readonlyEffects:'Unknown/Unsupported'};
export async function runQueryCallCase(name){
 const data=await(await fetch('/api/account?query-call-control')).json();
 const client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity}}}),cache=client.getQueryCache(),key=['call-control'];
 const original=Object.getOwnPropertyDescriptor(Query.prototype,'setData');let returned,getters=0,writes=0,sharing=0,updaters=0,callbacks=0,caught=false,errorMessage=null,afterThrow=null;const error={synthetic:true};
 let start=evidence().events.length;
 try{
  if(name==='nested-wrapper')Object.defineProperty(Query.prototype,'setData',{...original,value:function(value,options){writes++;value.rules.quota=12;return Reflect.apply(original.value,this,[value,options]);}});
  if(name==='build-wrapper'){const native=cache.build;cache.build=function(a,b,c){return Reflect.apply(native,this,[a,b,c]);};}
  if(name==='build-getter'){const native=cache.build;Object.defineProperty(cache,'build',{configurable:true,get(){getters++;return native;}});}
  if(name==='noncallable')Object.defineProperty(Query.prototype,'setData',{...original,value:42});
  if(['getter-ready','getter-throw','callee-ABA','method-getter','functional','custom-sharing','listener'].includes(name)){
   client.setQueryData(key,data);start=evidence().events.length;
  }
  const query=cache.find({queryKey:key});
  if(name==='method-getter')Object.defineProperty(query,'setData',{configurable:true,get(){getters++;return original.value;}});
  if(name==='custom-sharing')query.options.structuralSharing=(previous,value)=>{sharing++;value.rules.quota=12;writes++;return value;};
  if(name==='listener'){let once=false;cache.subscribe(event=>{if(event.type==='updated'){callbacks++;if(!once){once=true;client.setQueryData(key,{rules:{quota:99}});}}});}
  let options;
  if(name==='getter-ready')options={get stamp(){getters++;query.setData(data,{manual:true});return 1;}};
  if(name==='getter-throw')options={get stamp(){getters++;throw error;}};
  if(name==='callee-ABA')options={get stamp(){getters++;Object.defineProperty(Query.prototype,'setData',{...original,value:function(){callbacks++;throw error;}});return 1;}};
  try{returned=client.setQueryData(key,name==='functional'?(old=>{updaters++;old.rules.quota=12;writes++;return old;}):data,options);}catch(e){caught=e===error;errorMessage=e instanceof TypeError?e.message:null;}
  if(name==='getter-throw'){afterThrow=evidence();returned=client.setQueryData(key,data);}
  const actual=client.getQueryData(key);
  if(name==='later-alias'){actual.rules.quota=12;writes++;}
  return{semantics:{name,sameReturn:returned===data,sameRead:actual===data,value:actual?.rules.quota??null,getters,writes,sharing,updaters,callbacks,caught,errorMessage,updates:cache.find({queryKey:key})?.state.dataUpdateCount??null},census:{...evidence(),events:evidence().events.slice(start)},afterThrow};
 }finally{Object.defineProperty(Query.prototype,'setData',original);}
}
window.runQueryCallCase=runQueryCallCase;window.queryCallsReady=true;
