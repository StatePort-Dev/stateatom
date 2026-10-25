// SPDX-License-Identifier: Apache-2.0
// Explicit research object-lifetime mode. Not wired into product or native cases.
import {createAppMainPropsObserver} from './app-main-props-observer.mjs';

export function createAppElementRetainingObserver({page,enabled=true,policy}={}){
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,apply=Reflect.apply;
 const WS=WeakSet,has=WeakSet.prototype.has,add=WeakSet.prototype.add;
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const data=(value,enumerable=false,writable=false,configurable=false)=>{
  const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;
 };
 const dto=fields=>{
  const out=create(null),names=keys(fields);
  for(let i=0;i<names.length;i++)define(out,names[i],data(fields[names[i]],true));
  return freeze(out);
 };
 const source=createAppMainPropsObserver({page,enabled,policy}),pins=[];
 let acceptedConfigs=new WS();
 function clear(){pins.length=0;acceptedConfigs=new WS();}
 const bad=r=>!!r&&(r.stopped||r.invalid||r.overflow);
 const failed=r=>bad(r)||bad(r?.appBinding)||bad(r?.mainInput)||bad(r?.mainInput?.callbackInterval)||bad(r?.mainInput?.callbackInterval?.configInput)||bad(r?.mainInput?.callbackInterval?.copy);
 function state(){
  try{
   const r=source.retention();
   if(failed(r))clear();
   return r;
  }catch{clear();return null;}
 }
 const live=r=>enabled&&r&&!failed(r)&&r.collecting;
 function delegated(fn){
  return function(){try{return apply(fn,undefined,arguments);}catch(error){clear();throw error;}finally{state();}};
 }
 function config(token,value,tag){
  const before=state();let result,after;
  try{result=source.config(token,value,tag);}finally{after=state();}
  try{
   if(live(before)&&live(after)&&after.configs===before.configs+1&&object(value))apply(add,acceptedConfigs,[value]);
  }catch{clear();}
  return result;
 }
 function tap(kind,value,props,site){
  // Match the original disabled fast path: no metadata reads or delegation.
  if(!enabled)return value;
  let result,r;
  try{result=source.tap(kind,value,props,site);}finally{r=state();}
  try{
   if(kind==='jsx-element-return'&&live(r)&&object(value)&&object(props)&&apply(has,acceptedConfigs,[props])){
    if(pins.length>=64){source.stop();clear();}
    else define(pins,pins.length,data(value,true,true,true));
   }
  }catch{clear();}
  return result;
 }
 function startWindow(next){
  let result;
  try{result=source.startWindow(next);}finally{state();}
  if(result!==null)clear();
  return result;
 }
 function stop(){try{return source.stop();}finally{clear();}}
 function retention(){
  const r=state(),out=create(null);
  if(r){const names=keys(r);for(let i=0;i<names.length;i++)define(out,names[i],data(r[names[i]],true));}
  define(out,'referenceRetention',data(dto({schema:'stateatom.app-element-retention/1',mode:'research-strong-app-elements',sourceOnly:true,available:r!==null,count:pins.length,limit:64,window:r?.window??null,reachableGraphBytes:'Unknown/Unsupported',lifetime:'Until successful startWindow or stop; invalid/overflow clears',historicalGCCauseProven:false}),true));
  return freeze(out);
 }
 const app=source.appHook,main=source.mainInput;
 const runtime=main.arrayRuntime,arrayRuntime=dto({apply:delegated(runtime.apply),begin:delegated(runtime.begin),finish:delegated(runtime.finish),abort:delegated(runtime.abort),yielded:delegated(runtime.yielded)});
 const appHook=dto({appEnter:delegated(app.appEnter),result:delegated(app.result),bound:delegated(app.bound),config,appReturned:delegated(app.appReturned),appExit:delegated(app.appExit)});
 const mainInput=dto({arrayRuntime,mainEnter:delegated(main.mainEnter),mainReturned:delegated(main.mainReturned),mainExit:delegated(main.mainExit),enter:delegated(main.enter),returned:delegated(main.returned),exit:delegated(main.exit),tap});
 return dto({appHook,mainInput,config,tap,snapshot:delegated(source.snapshot),lookup:delegated(source.lookup),retention,sealWindow:delegated(source.sealWindow),startWindow,stop});
}
