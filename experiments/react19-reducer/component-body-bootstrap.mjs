// SPDX-License-Identifier: Apache-2.0
// Closed source serialization; bootstrap is not native acquisition evidence.
import {committedMemoFactory} from './committed-memo-bootstrap.mjs';
import {callbackJSXNativeBootstrap} from './retained-app-state-source-run.mjs';
import {createNativeComponentCallObserver} from './component-call-observer.mjs';
import {createComponentBodyObserver} from './component-body-observer.mjs';
import {createComponentBodyPathObserver} from './component-body-path-observer.mjs';
const own=(o,k)=>{if(o===null||typeof o!=='object')throw TypeError('Owned metadata required');const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,'value'))throw TypeError('Own metadata data required');return d.value;};
function metadata(input){
 const active=new WeakSet();let count=0;
 function copy(v,depth){
  if(++count>8192||depth>24)throw TypeError('Bounded metadata required');
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(typeof v!=='object'||active.has(v))throw TypeError('Acyclic JSON metadata required');
  active.add(v);const array=Array.isArray(v),out=array?[]:Object.create(null),names=Object.keys(v);
  if(array){const length=own(v,'length');if(length>128||names.length!==length)throw TypeError('Closed metadata array required');Object.defineProperty(out,'toJSON',{value:undefined});for(let i=0;i<length;i++)Object.defineProperty(out,i,{value:copy(own(v,String(i)),depth+1),enumerable:true});}
  else for(const name of names)Object.defineProperty(out,name,{value:copy(own(v,name),depth+1),enumerable:true});
  active.delete(v);return out;
 }
 return copy(input,0);
}
export function componentBodyFactory(profiles){
 const componentCall=metadata(own(profiles,'componentCall')),componentBody=metadata(own(profiles,'componentBody'));
 const native=createNativeComponentCallObserver({page:'body-factory-validation',policy:componentCall}),body=createComponentBodyObserver({page:'body-factory-validation',nativeCalls:native,policy:componentBody});
 const valid=native.retention().available&&body.retention().available;body.stop();native.stop();if(!valid)throw TypeError('Closed call/body source profiles required');
 const base=committedMemoFactory(profiles),embedded=JSON.stringify(metadata({componentCall,componentBody}));
 return 'function(options){"use strict";const policy=Object.getOwnPropertyDescriptor(options,"policy")?.value;if(!policy||Object.hasOwn(policy,"componentCall")||Object.hasOwn(policy,"componentBody"))throw TypeError("Embedded body profile override refused");'+
  'const make='+base+';const base=make(options);const profiles='+embedded+';'+
  'const createNativeComponentCallObserver='+createNativeComponentCallObserver.toString()+';'+
  'const createComponentBodyObserver='+createComponentBodyObserver.toString()+';'+
  'const createComponentBodyPathObserver='+createComponentBodyPathObserver.toString()+';'+
  'return createComponentBodyPathObserver({page:options.page,enabled:Object.hasOwn(options,"enabled")?options.enabled:true,base,callPolicy:profiles.componentCall,bodyPolicy:profiles.componentBody});}';
}
export function componentBodyBootstrap({page,mode,policy}={}){
 if(typeof page!=='string'||!page||page.length>128||!['off','on'].includes(mode))throw TypeError('Bounded page and mode required');
 const clean=metadata(policy),factory=componentBodyFactory(clean),main=own(clean,'main');
 const canonical={app:own(clean,'app'),mainSite:own(main,'mainSite'),filterSite:own(main,'filterSite'),mapSite:own(main,'mapSite'),configSite:own(clean,'configSite'),native:own(clean,'native')};
 const slots=['__sa_app_hook_binding','__sa_callback_copy','__sa_array_calls','__STATEATOM_REACT19_JSX_INPUT__','__STATEATOM__','__STATEATOM_ELEMENT_FIBER_TAP__','__STATEATOM_MEMO_BRANCH_TAP__','__STATEATOM_COMPONENT_CALL_TAP__','__STATEATOM_COMPONENT_BODY_TAP__'];
 const guard='(()=>{"use strict";for(const name of '+JSON.stringify(slots)+')if(Object.hasOwn(globalThis,name))throw Error("Owned observer collision");})();\n';
 const hooks=mode==='on'?'(()=>{"use strict";const main=Object.getOwnPropertyDescriptor(globalThis,"__sa_callback_copy").value;const tap=Object.getOwnPropertyDescriptor(main,"referenceTap").value;Object.defineProperty(globalThis,"__STATEATOM_ELEMENT_FIBER_TAP__",{value:tap});Object.defineProperty(globalThis,"__STATEATOM_MEMO_BRANCH_TAP__",{value:tap});Object.defineProperty(globalThis,"__STATEATOM_COMPONENT_CALL_TAP__",{value:Object.getOwnPropertyDescriptor(main,"componentCallTap").value});Object.defineProperty(globalThis,"__STATEATOM_COMPONENT_BODY_TAP__",{value:Object.getOwnPropertyDescriptor(main,"componentBodyTap").value});})();\n':'';
 return guard+callbackJSXNativeBootstrap(factory,{page,mode,policy:canonical})+hooks;
}
