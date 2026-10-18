// SPDX-License-Identifier: Apache-2.0
// Synthetic semantic controls; no external application or full-path claim.
await Promise.resolve('top-level suspension');
const rejections=[];let failedFetch,failedJSON;
window.addEventListener('unhandledrejection',event=>{rejections.push({fetch:event.promise===failedFetch,json:event.promise===failedJSON});event.preventDefault();});
window.sourceRejections=()=>rejections.slice();
window.rejectSourceControls=()=>{failedFetch=fetch('/api/fail');failedJSON=new Response('not JSON').json();};
window.runSourceControls=async()=>{
 let method=0,thenGets=0,called=0;
 const response=await fetch('/api/account',{get method(){method++;return 'GET';}});
 const data=await response.json();
 const originalThen=Promise.prototype.then,p=Promise.resolve(7);
 Object.defineProperty(p,'then',{get(){thenGets++;return originalThen;}});
 const direct=await p;
 const fromThen=await fetch('/api/account').then(r=>r.json().then(function(value){'use strict';called++;return {value:value.rules.quota,receiver:this===undefined};}));
 const handler=()=>19,custom={then(fn){return {same:this===custom&&fn===handler};}},unknown=custom.then(handler);
 const error={original:true};let sameError=false;
 try{await fetch('/api/account',{get method(){throw error;}});}catch(e){sameError=e===error;}
 return {method,thenGets,called,direct,data:data.rules.quota,fromThen,unknown,sameError};
};
window.sourceReady=true;
window.runSerializationControl=async()=>{
 let calls=0,status=null;
 Object.defineProperty(Object.prototype,'toJSON',{configurable:true,get(){calls++;return undefined;}});
 try{const data=await(await fetch('/api/account?serialization-control')).json();status=window.__STATEATOM__?.snapshot('absent','text').status;return {calls,status,value:data.rules.quota};}finally{delete Object.prototype.toJSON;}
};
window.runPoisonControls=async()=>{
 const result={};
 const constructorDescriptor=Object.getOwnPropertyDescriptor(Promise.prototype,'constructor'),thenDescriptor=Object.getOwnPropertyDescriptor(Promise.prototype,'then'),speciesDescriptor=Object.getOwnPropertyDescriptor(Promise,Symbol.species),savedThen=thenDescriptor.value;
 let busy=false;
 const constructorGet=function(){if(!busy){busy=true;Reflect.apply(savedThen,this,[d=>{if(d?.rules)d.rules.quota=99;}]);busy=false;}return Promise;};
 Object.defineProperty(Promise.prototype,'constructor',{configurable:true,get:constructorGet});
 try{const data=await(await fetch('/api/account?constructor-control')).json();result.constructor=data.rules.quota;}finally{Object.defineProperty(Promise.prototype,'constructor',constructorDescriptor);}
 const r=await fetch('/api/account?then-control');
 Object.defineProperty(Promise.prototype,'then',{configurable:true,get(){Reflect.apply(savedThen,this,[d=>{if(d?.rules)d.rules.quota=99;}]);return savedThen;}});
 try{await r.json().then(data=>{result.then=data.rules.quota;});}finally{Object.defineProperty(Promise.prototype,'then',thenDescriptor);}
 const s=await fetch('/api/account?species-control');let speciesCalls=0;
 Object.defineProperty(Promise,Symbol.species,{configurable:true,get(){speciesCalls++;return Promise;}});
 try{await s.json().then(data=>{result.species=data.rules.quota;});result.speciesCalls=speciesCalls;}finally{Object.defineProperty(Promise,Symbol.species,speciesDescriptor);}
 const t=await fetch('/api/account?custom-control');let p;
 try{Promise.prototype.then=function(){return this;};p=t.json().then();}finally{Object.defineProperty(Promise.prototype,'then',thenDescriptor);}
 Reflect.apply(savedThen,p,[d=>{d.rules.quota=99;}]);result.custom=(await p).rules.quota;
 return result;
};
window.runDescriptorControl=async()=>{
 const saved=Object.getOwnPropertyDescriptor;let calls=0;
 try{Object.getOwnPropertyDescriptor=function(...args){calls++;return Reflect.apply(saved,Object,args);};const data=await(await fetch('/api/account?descriptor-control')).json();return {calls,value:data.rules.quota};}
 finally{Object.getOwnPropertyDescriptor=saved;}
};
