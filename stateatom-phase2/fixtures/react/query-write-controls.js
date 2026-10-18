// SPDX-License-Identifier: Apache-2.0
import {QueryClient} from '@tanstack/query-core';
let data,client;const counts={calls:0};
window.prepareQueryWriteCase=async()=>{data=await(await fetch('/api/query-write-options')).json();window.queryWriteData=data;client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity,retry:false,queryFn:()=>{counts.calls++;return 7}}}});};
window.runQueryWriteCase=async name=>{let options=data.rules,getters=0,setters=0,caught=false,errorName=null,errorMessage=null,value=null;const traps=[],error={original:true};
 if(name==='getter'||name==='throw')Object.defineProperty(options,'pages',{enumerable:true,get(){getters++;if(name==='throw')throw error;return 1}});
 if(name==='setter')Object.defineProperty(options,'behavior',{enumerable:true,set(){setters++;throw error}});
 if(name==='frozen')Object.freeze(options);
 if(name==='proxy'||name==='proxy-throw')options=new Proxy(options,{get(t,k,r){traps.push('get:'+String(k));return Reflect.get(t,k,r)},set(t,k,v,r){traps.push('set:'+String(k));if(name==='proxy-throw')throw error;return Reflect.set(t,k,v,r)},getOwnPropertyDescriptor(t,k){traps.push('descriptor:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k)}});
 try{value=await client[name==='ensure'?'ensureInfiniteQueryData':'fetchInfiniteQuery'](options)}catch(e){caught=e===error;errorName=e.name??null;errorMessage=e instanceof TypeError?e.message:null;}
 const result={name,calls:counts.calls,getters,setters,caught,errorName,errorMessage,traps,quota:options.quota,value};document.getElementById('result').textContent=JSON.stringify(result);return result;
};window.queryWriteReady=true;
