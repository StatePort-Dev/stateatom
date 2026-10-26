// SPDX-License-Identifier: Apache-2.0
// Complete original private source gate + conditional current native reference.
import {createNativeStateSourcePathObserver} from './native-state-source-path-observer.mjs';
import {createNativeElementFiberObserver} from './native-element-fiber-observer.mjs';
export function createCommittedSourcePathObserver({page,enabled=true,policy,weakRef=globalThis.WeakRef}={}){
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,describe=Object.getOwnPropertyDescriptor,has=Object.hasOwn,apply=Reflect.apply,WM=WeakMap,Ref=weakRef,get=WM.prototype.get,set=WM.prototype.set;
 const U='Unknown/Unsupported',object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const data=(value,enumerable=false,writable=false,configurable=false)=>{const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;};
 const dto=fields=>{const o=create(null),names=keys(fields);for(let i=0;i<names.length;i++)define(o,names[i],data(fields[names[i]],true));return freeze(o);};
 const list=()=>{const a=[];define(a,'toJSON',data(undefined));return a;},append=(a,v)=>define(a,a.length,data(v,true,true,true));
 const own=(o,k)=>{if(!object(o))throw TypeError('Owned source policy required');const d=describe(o,k);if(!d||!has(d,'value'))throw TypeError('Own source policy data required');return d.value;};
 const read=(m,k)=>apply(get,m,[k]),put=(m,k,v)=>apply(set,m,[k,v]),supported=typeof Ref==='function',deref=supported?own(Ref.prototype,'deref'):null,weak=r=>r?apply(deref,r,[]):undefined;
 const source=createNativeStateSourcePathObserver({page,enabled,policy:{app:own(policy,'app'),main:own(policy,'main'),configSite:own(policy,'configSite'),native:own(policy,'native')}});
 let elementPolicy;try{elementPolicy=own(policy,'elementFiber');}catch{}
 const native=createNativeElementFiberObserver({page,enabled,policy:elementPolicy,weakRef:Ref}),m=source.mainInput;
 let rows=list(),byElement=new WM(),collecting=true,stopped=false,invalid=false,reason=null,generation=0,lastCommit=null;
 function clear(){rows=list();byElement=new WM();}
 function refuse(why){invalid=true;reason=why;clear();}
 function returned(){
  let result;try{result=apply(m.returned,undefined,arguments);}catch(e){refuse('Delegated source return failed');throw e;}
  if(!enabled||stopped||!collecting||invalid||!supported)return result;
  try{
   if(rows.length>=512){refuse('Source callback reference capacity refused');return result;}
   if(!object(arguments[0])||!object(result)||result!==arguments[1]||read(byElement,result)){refuse('Unique actual source callback result required');return result;}
   const row={element:new Ref(result),nativeSeen:false,beforeCommit:null,confirmedCommit:null};append(rows,row);put(byElement,result,row);
  }catch{refuse('Source callback reference unavailable');}
  return result;
 }
 function referenceTap(){
  if(!enabled||stopped)return arguments[1];
  let before=null;
  try{
   const kind=arguments[0],element=arguments[2];
   if(kind==='element-fiber'&&collecting&&!invalid){const c=native.currentCommit();if(c.status==='Observed')before=c.commitId;else if(lastCommit!==null)refuse('Current commit scope unavailable before native element event');}
   const result=apply(native.tap,native,arguments);
   if(kind==='element-fiber'&&collecting&&!invalid&&object(element)){
    const row=read(byElement,element);if(row){row.nativeSeen=true;row.beforeCommit=before;row.confirmedCommit=null;}
   }
   const c=native.currentCommit();if(c.status==='Observed'&&c.commitId!==lastCommit){lastCommit=c.commitId;if(kind==='root-current')for(let i=0;i<rows.length;i++){const row=rows[i];if(row.nativeSeen&&row.confirmedCommit===null&&row.beforeCommit!==c.commitId)row.confirmedCommit=c.commitId;}}
   return result;
  }catch{refuse('Native/source event interval unavailable');return arguments[1];}
 }
 const output=(status,why,links=list())=>dto({schema:'stateatom.committed-state-source-reference/1',page,window:generation,status,reason:why,links:freeze(links),selectedCommittedSourceAssociation:status==='Observed'?'Observed':U,sourceOnly:true,nativeOrigin:'NotAttested',nativeStateOrigin:U,tupleIndexOrigin:U,fieldOwnership:U,selectedPropertyOrigin:U,stateToProp:U,fullPath:false});
 function lookupNode(node){
  try{
   if(!enabled||stopped||collecting||invalid||!supported)return output(U,!enabled?'Observer disabled':stopped?'Observer stopped':invalid?reason:!supported?'WeakRef unavailable':'Source window not sealed');
   const c=native.currentCommit();if(c.status!=='Observed')return output(U,c.reason);
   const ret=source.retention();if(!rows.length||ret.stateSource.callbacks!==rows.length)return output(U,'Complete source callback reference coverage unavailable');
   const links=list();
   for(let i=0;i<rows.length;i++){
    const row=rows[i],element=weak(row.element);if(!object(element)||!row.nativeSeen||row.confirmedCommit!==c.commitId)return output(U,'Complete fresh source/native element interval unavailable');
    const exact=source.lookupStateSource(element);if(exact.status!=='Observed'||exact.links.length!==1)return output(U,'Original complete source/native gate unavailable');
    const observed=native.match(node,element);
    if(observed.status!=='Observed'){
     if(observed.reason==='No complete exact current native element association')continue;
     return output(U,'Incomplete or ambiguous current native element evidence');
    }
    if(observed.match.commitId!==row.confirmedCommit)return output(U,'Selected commit differs from confirmed source/native interval');
    if(links.length)return output(U,'Ambiguous selected source/native element join');
    append(links,dto({stateSource:exact.links[0],nativeElement:observed.match,selectedCommittedSourceAssociation:'Observed',nativeStateOrigin:U,tupleIndexOrigin:U,fieldOwnership:U,selectedPropertyOrigin:U}));
   }
   return links.length?output('Observed',null,links):output(U,'No exact selected complete source/native element join');
  }catch{return output(U,'Complete source/native selected lookup unavailable');}
 }
 function sealWindow(){const r=source.sealWindow();if(!stopped)collecting=false;return r;}
 function startWindow(label){const r=source.startWindow(label);if(r){clear();generation++;collecting=true;invalid=false;reason=null;}return r;}
 function stop(){stopped=true;collecting=false;clear();lastCommit=null;source.stop();native.stop();}
 const mainInput=dto({arrayRuntime:m.arrayRuntime,mainEnter:m.mainEnter,mainReturned:m.mainReturned,mainExit:m.mainExit,enter:m.enter,returned,exit:m.exit,tap:m.tap});
 return dto({appHook:source.appHook,mainInput,tap:source.tap,config:source.config,nativeTap:source.nativeTap,snapshot:source.snapshot,lookup:source.lookup,lookupStateSource:source.lookupStateSource,retention:source.retention,sealWindow,startWindow,stop,referenceTap,lookupNode,referenceRetention:()=>dto({callbacks:rows.length,window:generation,collecting,stopped,invalid,reason,nativeElement:native.retention()})});
}
