// SPDX-License-Identifier: Apache-2.0
// Source-only research wiring; existing declared App retention, no native execution.
import {callbackJSXNativeFactory,callbackJSXNativeBootstrap} from './retained-app-state-source-run.mjs';
import {createReact19Acquisition} from '../../src/engine/react19-acquisition.mjs';
import {createNativeElementFiberObserver} from './native-element-fiber-observer.mjs';
import {createCommittedSourcePathObserver} from './committed-source-path-observer.mjs';

const own=(o,k)=>{
 if(o===null||typeof o!=='object')throw TypeError('Owned metadata object required');
 const d=Object.getOwnPropertyDescriptor(o,k);
 if(!d||!Object.hasOwn(d,'value'))throw TypeError('Own metadata data required');
 return d.value;
};
// Copy only JSON metadata, never raw toJSON, accessors or inherited fields. The
// result has null prototypes and every array shadows a possible inherited toJSON.
function metadata(input){
 const active=new WeakSet();let count=0;
 function copy(v,depth){
  if(++count>4096||depth>20)throw TypeError('Bounded metadata required');
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(typeof v!=='object'||active.has(v))throw TypeError('Acyclic JSON metadata required');
  active.add(v);const array=Array.isArray(v),out=array?[]:Object.create(null),names=Object.keys(v);
  if(array){
   const length=own(v,'length');if(length>128||names.length!==length)throw TypeError('Closed metadata array required');
   Object.defineProperty(out,'toJSON',{value:undefined});
   for(let i=0;i<length;i++)Object.defineProperty(out,i,{value:copy(own(v,String(i)),depth+1),enumerable:true});
  }else for(const name of names)Object.defineProperty(out,name,{value:copy(own(v,name),depth+1),enumerable:true});
  active.delete(v);return out;
 }
 return copy(input,0);
}

export function committedMemoFactory(profiles){
 const elementFiber=metadata(own(profiles,'elementFiber')),memoBranch=metadata(own(profiles,'memoBranch'));
 const check=createNativeElementFiberObserver({page:'owned-memo-factory-validation',policy:elementFiber,memoPolicy:memoBranch});
 const valid=check.retention();check.stop();
 if(!valid.available||!valid.memoEnabled)throw TypeError('Closed element and memo source profiles required');
 const embedded=JSON.stringify(metadata({elementFiber,memoBranch}));
 return 'function(options){"use strict";'+
  'const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))throw TypeError("Own factory option required");return d.value;};'+
  'const policy=own(options,"policy");if(Object.hasOwn(policy,"elementFiber")||Object.hasOwn(policy,"memoBranch"))throw TypeError("Embedded profile override refused");'+
  'const profiles='+embedded+';const sourcePolicy=Object.assign(Object.create(null),{app:own(policy,"app"),main:own(policy,"main"),configSite:own(policy,"configSite"),native:own(policy,"native"),elementFiber:profiles.elementFiber,memoBranch:profiles.memoBranch});'+
  'const createNativeStateSourcePathObserver=('+callbackJSXNativeFactory()+');'+
  'const createReact19Acquisition='+createReact19Acquisition.toString()+';'+
  'const createNativeElementFiberObserver='+createNativeElementFiberObserver.toString()+';'+
  'const createCommittedSourcePathObserver='+createCommittedSourcePathObserver.toString()+';'+
  'const o=createCommittedSourcePathObserver({page:own(options,"page"),enabled:Object.hasOwn(options,"enabled")?own(options,"enabled"):true,policy:sourcePolicy});'+
  'const apply=Reflect.apply;function nativeTap(){const result=apply(o.nativeTap,undefined,arguments);apply(o.referenceTap,undefined,arguments);return result;}'+
  'const mainInput=Object.freeze(Object.assign(Object.create(null),o.mainInput,{referenceTap:o.referenceTap,lookupNode:o.lookupNode,lookupStateSource:o.lookupStateSource,referenceRetention:o.referenceRetention}));'+
  'return Object.freeze(Object.assign(Object.create(null),o,{nativeTap,mainInput}));}';
}

export function committedMemoBootstrap({page,mode,policy}={}){
 if(typeof page!=='string'||!page||page.length>128||!['off','on'].includes(mode))throw TypeError('Bounded page and off/on mode required');
 const clean=metadata(policy),factory=committedMemoFactory(clean),main=own(clean,'main');
 const sourcePolicy={app:own(clean,'app'),mainSite:own(main,'mainSite'),filterSite:own(main,'filterSite'),mapSite:own(main,'mapSite'),configSite:own(clean,'configSite'),native:own(clean,'native')};
 const slots=['__sa_app_hook_binding','__sa_callback_copy','__sa_array_calls','__STATEATOM_REACT19_JSX_INPUT__','__STATEATOM__','__STATEATOM_ELEMENT_FIBER_TAP__','__STATEATOM_MEMO_BRANCH_TAP__'];
 const guard='(()=>{"use strict";for(const name of '+JSON.stringify(slots)+')if(Object.hasOwn(globalThis,name))throw Error("Owned observer collision");})();\n';
 const original=callbackJSXNativeBootstrap(factory,{page,mode,policy:sourcePolicy});
 const hooks=mode==='on'?'(()=>{"use strict";const main=Object.getOwnPropertyDescriptor(globalThis,"__sa_callback_copy").value;const tap=Object.getOwnPropertyDescriptor(main,"referenceTap").value;Object.defineProperty(globalThis,"__STATEATOM_ELEMENT_FIBER_TAP__",{value:tap});Object.defineProperty(globalThis,"__STATEATOM_MEMO_BRANCH_TAP__",{value:tap});})();\n':'';
 return guard+original+hooks;
}
