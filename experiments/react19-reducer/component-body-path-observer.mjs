// SPDX-License-Identifier: Apache-2.0
// Conditional same-collector source/call/body join; no field or writer ownership.
import {createNativeComponentCallObserver} from './component-call-observer.mjs';
import {createComponentBodyObserver} from './component-body-observer.mjs';
export function createComponentBodyPathObserver({page,base,callPolicy,bodyPolicy,enabled=true,weakRef=globalThis.WeakRef}={}){
 if(typeof page!=='string'||!page||page.length>128||typeof enabled!=='boolean')throw TypeError('Bounded page and boolean enabled required');
 const create=Object.create,describe=Object.getOwnPropertyDescriptor,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,has=Object.hasOwn,apply=Reflect.apply,Ref=weakRef,WM=WeakMap,get=WM.prototype.get,set=WM.prototype.set,U='Unknown/Unsupported';
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const own=(o,k)=>{if(!object(o))throw Error('Owned observer API required');const d=describe(o,k);if(!d||!has(d,'value'))throw Error('Own observer API data required');return d.value;};
 const dto=fields=>{const o=create(null);for(const k of keys(fields)){const d=create(null);d.value=fields[k];d.enumerable=true;define(o,k,d);}return freeze(o);};
 const copy=o=>{const r=create(null);for(const k of keys(o))r[k]=own(o,k);return r;};
 const m=own(base,'mainInput'),enterBase=own(m,'enter'),returnedBase=own(m,'returned'),startBase=own(base,'startWindow'),sealBase=own(base,'sealWindow'),stopBase=own(base,'stop'),referenceBase=own(base,'referenceTap'),nativeBase=own(base,'nativeTap'),lookupBase=own(base,'lookupNode'),queryBase=own(base,'matchInvocationNode'),commitBase=own(base,'currentReferenceCommit');
 for(const f of [enterBase,returnedBase,startBase,sealBase,stopBase,referenceBase,nativeBase,lookupBase,queryBase,commitBase])if(typeof f!=='function')throw TypeError('Complete owned source API required');
 let calls=null,body=null,sources=[],nativeRows=[],byHandle=new WM(),byToken=new WM(),collecting=false,stopped=false,fault=null,capped=false,lastCommit=null;
 let deref=null;try{deref=own(own(Ref,'prototype'),'deref');}catch{}
 const read=(map,k)=>apply(get,map,[k]),put=(map,k,v)=>apply(set,map,[k,v]),weak=r=>r?apply(deref,r,[]):undefined;
 const clear=()=>{sources=[];nativeRows=[];byHandle=new WM();byToken=new WM();};
 const close=()=>{calls?.stop();body?.stop();};
 const fail=why=>{fault=why;collecting=false;clear();close();};
 function reset(){close();clear();calls=createNativeComponentCallObserver({page,enabled,policy:callPolicy,weakRef:Ref});body=createComponentBodyObserver({page,nativeCalls:calls,policy:bodyPolicy,enabled,weakRef:Ref});fault=null;capped=false;lastCommit=null;}
 reset();
 const active=()=>enabled&&collecting&&!stopped&&!fault&&!capped&&typeof deref==='function';
 const unknown=why=>dto({schema:'stateatom.committed-component-body-reference/1',page,status:U,reason:why,links:freeze([]),sourceOnly:true,nativeOrigin:'NotAttested',componentInvocationRuntimeQualified:false,fieldOwnership:U,selectedPropertyOrigin:U,fullPath:false});
 function currentCommit(){try{return apply(commitBase,base,[]);}catch{return null;}}
 function afterReference(args){
  if(!active()||args[0]!=='root-current')return;
  const c=currentCommit();if(c?.status!=='Observed'||c.commitId===lastCommit)return;
  for(const row of nativeRows)if(row.ended&&row.confirmed===null&&row.before!==c.commitId)row.confirmed=c.commitId;
  lastCommit=c.commitId;
 }
 function referenceTap(){const r=apply(referenceBase,base,arguments);try{afterReference(arguments);}catch{fail('Commit confirmation unavailable');}return r;}
 function nativeTap(){const r=apply(nativeBase,base,arguments);try{afterReference(arguments);}catch{fail('Commit confirmation unavailable');}return r;}
 function enter(){const handle=apply(enterBase,m,arguments);if(active())try{
  if(sources.length>=512){capped=true;fail('Body source research capacity refused');return handle;}
  if(!object(handle)||!object(arguments[2])||read(byHandle,handle))throw Error('Unique callback item required');
  const row={item:new Ref(arguments[2]),element:null,returned:false};sources.push(row);put(byHandle,handle,row);
 }catch{fail('Body callback source unavailable');}return handle;}
 function returned(){const result=apply(returnedBase,m,arguments);if(active())try{
  const row=object(arguments[0])?read(byHandle,arguments[0]):null;
  if(!row||row.returned||!object(result)||result!==arguments[1])throw Error('Exact callback return required');
  row.element=new Ref(result);row.returned=true;
 }catch{fail('Body callback return unavailable');}return result;}
 function componentCallTap(){
  if(!active())return undefined;
  try{
   const token=apply(calls.tap,calls,arguments),kind=arguments[0];
   if(calls.retention().faulted||calls.retention().capped){fail('Native component call refused');return token;}
   if(kind==='component-call-begin'&&object(token)){
    if(nativeRows.length>=512){capped=true;fail('Body native research capacity refused');return undefined;}
    const c=currentCommit(),row={token,fiber:new Ref(arguments[1]),self:new Ref(arguments[2]),props:new Ref(arguments[3]),result:null,a:null,b:null,before:c?.status==='Observed'?c.commitId:null,confirmed:null,ended:false};
    nativeRows.push(row);put(byToken,token,row);
   }else if(kind==='component-call-return'){
    const row=object(arguments[1])?read(byToken,arguments[1]):null;if(row&&object(arguments[2]))row.result=new Ref(arguments[2]);
   }else if(kind==='component-call-end'){
    const row=object(arguments[1])?read(byToken,arguments[1]):null;if(row)row.ended=true;
   }
   return token;
  }catch{fail('Body native call references unavailable');return undefined;}
 }
 function componentBodyTap(){
  if(!active())return undefined;
  try{
   const token=apply(body.tap,body,arguments);
   if(body.retention().faulted||body.retention().capped){fail('Component body refused');return token;}
   if(arguments[0]==='component-body-entry'&&object(token)){
    const native=calls.currentToken(arguments[1]),row=object(native)?read(byToken,native):null;
    if(!row)throw Error('Exact pending native body required');
    if(!row.a&&object(arguments[2]))row.a=new Ref(arguments[2]);if(!row.b&&object(arguments[3]))row.b=new Ref(arguments[3]);
   }
   return token;
  }catch{fail('Body parameter references unavailable');return undefined;}
 }
 function lookupBodyNode(node){
  try{
   if(!enabled||stopped||collecting||fault||capped||typeof deref!=='function')return unknown(!enabled?'Body path disabled':stopped?'Body path stopped':fault||capped?'Body path refused':collecting?'Body window not sealed':'WeakRef unavailable');
   const original=apply(lookupBase,base,[node]);if(original.status!=='Observed')return unknown('Original complete selected source gate unavailable');
   const c=currentCommit();if(c?.status!=='Observed')return unknown('Current commit unavailable');
   let selected=null;
   for(const source of sources){
    const item=weak(source.item),element=weak(source.element);if(!source.returned||!object(item)||!object(element))return unknown('Complete live callback references unavailable');
    for(const row of nativeRows){
     if(!row.ended||row.confirmed!==c.commitId)continue;
     const fiber=weak(row.fiber),self=weak(row.self),props=weak(row.props);if(!object(fiber)||typeof self!=='function'||!object(props))continue;
     const exact=apply(queryBase,base,[node,element,fiber,self,props]);if(exact.status!=='Observed')continue;
     const a=weak(row.a),b=weak(row.b),result=weak(row.result);
     if(a!==item||!object(a)||!object(b)||!object(result))return unknown('Exact callback to body parameter unavailable');
     const matched=body.match(row.token,fiber,self,props,a,b,result);if(matched.status!=='Observed')return unknown('Complete unique native/body interval unavailable');
     if(selected)return unknown('Ambiguous current body invocation');
     selected=dto({stateSource:exact.links[0],body:matched.match,parameterIndex:0,parameterReference:'Same',secondParameterAncestry:U,commitId:c.commitId});
    }
   }
   return selected?dto({...unknown(null),status:'Observed',links:freeze([selected])}):unknown('No complete selected body parameter association');
  }catch{return unknown('Selected body lookup unavailable');}
 }
 function sealWindow(){const result=apply(sealBase,base,arguments);collecting=false;return result;}
 function startWindow(label){if(stopped)return null;const result=apply(startBase,base,arguments);if(result){reset();collecting=true;const c=currentCommit();if(c?.status==='Observed')lastCommit=c.commitId;}return result;}
 function stop(){if(stopped)return;stopped=true;collecting=false;clear();close();apply(stopBase,base,[]);}
 const bodyRetention=()=>dto({callbacks:sources.length,calls:nativeRows.length,collecting,stopped,faulted:fault!==null,capped,strongApplicationPins:0,nativeCall:calls.retention(),body:body.retention()});
 const mainInput=dto({...copy(m),enter,returned,referenceTap,componentCallTap,componentBodyTap,lookupBodyNode,bodyRetention});
 return dto({...copy(base),mainInput,nativeTap,referenceTap,componentCallTap,componentBodyTap,lookupBodyNode,bodyRetention,startWindow,sealWindow,stop});
}
