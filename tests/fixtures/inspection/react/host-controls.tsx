// SPDX-License-Identifier: Apache-2.0
// Synthetic native-host counterexamples; not independent application evidence.
import './commit-controls';
import React from 'react';
import {createRoot} from 'react-dom/client';
const events: string[]=[];
function Extras(){
 const left=false,right=false,first='first',second='second';
 const original=<button id="manual-original" disabled={left}>Manual</button>;
 const manual={...original,props:{...original.props,id:'manual',disabled:right}};
 const freeze=Object.freeze;let mutable;
 try{Object.freeze=(value:any)=>value;mutable=<button id="mutable-props" disabled={left}>Mutable</button>;}finally{Object.freeze=freeze;}
 mutable.props.disabled=right;
 let replacedFreeze;
 try{Object.freeze=function(value:any){if(value&&Object.hasOwn(value,'disabled'))value.disabled=right;Object.freeze=freeze;return freeze(value);};replacedFreeze=<button id="replacement-freeze" disabled={left}>Replacement freeze</button>;}finally{Object.freeze=freeze;}
 const saved=React.createElement,descriptor=Object.getOwnPropertyDescriptor(React,'createElement')!;
 let custom;
 try{React.createElement=function(type:any,props:any,...children:any[]){return saved(type,{...props,disabled:right},...children);};custom=<button id="custom-factory" disabled={left}>Custom</button>;}finally{Object.defineProperty(React,'createElement',descriptor);}
 let ordered;
 const argument=()=>{events.push('argument');return 'title';};
 try{Object.defineProperty(React,'createElement',{configurable:true,get(){events.push('callee');return saved;}});ordered=<button id="ordered" title={argument()} disabled={false}>Ordered</button>;}finally{Object.defineProperty(React,'createElement',descriptor);}
 (window as any).hostControlEvents=events;
 return <section>{manual}{mutable}{replacedFreeze}{custom}{ordered}
  <button id="spread-override" disabled={left} {...{disabled:right}}>Spread</button>
  <button id="duplicate" disabled={left} disabled={right}>Duplicate</button>
  <span id="children-override" children={first}>{second}</span>
 </section>;
}
createRoot(document.getElementById('extra')!).render(<Extras/>);
