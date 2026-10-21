// SPDX-License-Identifier: Apache-2.0
// Native DOM adapter for a finite opt-in development mechanism. No public global
// establishes provenance; the owning product must supply its admitted context.
import {createActionObservation} from '../../core/action-observation.mjs';
const invoke=Reflect.apply,describe=Object.getOwnPropertyDescriptor,freeze=Object.freeze;
const NativeWeakMap=WeakMap,weakGet=WeakMap.prototype.get,weakSet=WeakMap.prototype.set;
export function captureBrowserActionObservation(w){
 const eventPrototype=w.Event?.prototype,get=name=>eventPrototype&&describe(eventPrototype,name)?.get,target=get('target'),currentTarget=get('currentTarget'),phase=get('eventPhase'),eventType=get('type');
 const contains=w.Node?.prototype?.contains,add=w.EventTarget?.prototype?.addEventListener,remove=w.EventTarget?.prototype?.removeEventListener;
 const setTimer=w.setTimeout,clearTimer=w.clearTimeout,crypto=w.crypto,random=crypto?.randomUUID,performance=w.performance,performanceNow=performance?.now,wallClock=Date.now,uuid=()=>invoke(random,crypto,[]),clock=typeof performanceNow==='function'?()=>invoke(performanceNow,performance,[]):wallClock;
 const available=!!(target&&currentTarget&&phase&&eventType&&contains&&add&&remove&&setTimer&&clearTimer&&random);
 const create=({identity,sites,recordLimit=64})=>{
 if(!available)throw Error('Native event observation unavailable');
 const ledger=createActionObservation({identity,sites,recordLimit,now:clock,id:uuid}),nodeIds=new NativeWeakMap();let selected=null,original=null,finishTimer=null,expiryTimer=null,listening=false;
 function nodeId(node){if(!node||(typeof node!=='object'&&typeof node!=='function'))return null;let id=invoke(weakGet,nodeIds,[node]);if(!id){id=uuid();invoke(weakSet,nodeIds,[node,id]);}return id;}
 function cleanup(){if(listening)invoke(remove,w,['click',capture,true]);listening=false;if(finishTimer!==null)invoke(clearTimer,w,[finishTimer]);if(expiryTimer!==null)invoke(clearTimer,w,[expiryTimer]);finishTimer=expiryTimer=null;selected=original=null;}
 function capture(event){try{
  if(original===event){ledger.invalidate();cleanup();return;}
  if(ledger.snapshot().status!=='armed'||invoke(eventType,event,[])!=='click')return;
  const actualTarget=invoke(target,event,[]),trustedGetter=describe(event,'isTrusted')?.get;
  if(!trustedGetter||invoke(trustedGetter,event,[])!==true||!selected||!invoke(contains,selected,[actualTarget]))return;
  if(!ledger.dispatch(event,{targetId:nodeId(actualTarget),trusted:true}))return;original=event;
  finishTimer=invoke(setTimer,w,[()=>{try{if(original&&invoke(phase,original,[])===0)ledger.finish('Only instrumented synchronous bodies receiving this original Event; listener coverage and effects remain incomplete');else ledger.invalidate();}catch{ledger.invalidate();}finally{cleanup();}},0]);
 }catch{ledger.invalidate();cleanup();}}
 const api={
  arm(node,{timeoutMs=1000}={}){cleanup();if(!target||!currentTarget||!phase||!eventType||!node)throw Error('Native event observation unavailable');selected=node;try{invoke(contains,selected,[selected]);ledger.arm({selectedId:nodeId(selected),timeoutMs});invoke(add,w,['click',capture,true]);listening=true;expiryTimer=invoke(setTimer,w,[()=>{ledger.snapshot();cleanup();},timeoutMs]);return ledger.snapshot();}catch(e){cleanup();throw e;}},
  enter(siteId,event){try{if(!original||event!==original||invoke(phase,event,[])===0)return null;return ledger.enter(siteId,event,nodeId(invoke(currentTarget,event,[])));}catch{return null;}},
  leave(token,threw){return ledger.leave(token,threw);},
  snapshot(){return ledger.snapshot();},
  cancel(){cleanup();ledger.cancel();},clear(){cleanup();ledger.clear();},invalidate(){cleanup();ledger.invalidate();},stop(){cleanup();ledger.stop();},
 };
 return freeze(api);
 };return freeze({available,create});
}
export function createBrowserActionObservation(w,options){return captureBrowserActionObservation(w).create(options);}
