// SPDX-License-Identifier: Apache-2.0
// Captured methods for private telemetry containers only, not primordial attestation.
export function capturePrivateCollections(){
 const apply=Reflect.apply,describe=Object.getOwnPropertyDescriptor,WM=WeakMap,WS=WeakSet,M=Map,S=Set;
 const weakGet=WM.prototype.get,weakSet=WM.prototype.set,weakHas=WM.prototype.has,weakDelete=WM.prototype.delete,weakAdd=WS.prototype.add,weakContains=WS.prototype.has;
 const get=M.prototype.get,set=M.prototype.set,has=M.prototype.has,clear=M.prototype.clear,remove=M.prototype.delete,mapSize=describe(M.prototype,'size').get;
 const add=S.prototype.add,contains=S.prototype.has,setSize=describe(S.prototype,'size').get;
 return{
  weakMap(){const value=new WM();return{get:key=>apply(weakGet,value,[key]),set:(key,item)=>apply(weakSet,value,[key,item]),has:key=>apply(weakHas,value,[key]),delete:key=>apply(weakDelete,value,[key])};},
  weakSet(){const value=new WS();return{add:key=>apply(weakAdd,value,[key]),has:key=>apply(weakContains,value,[key])};},
  map(){const value=new M();return{get:key=>apply(get,value,[key]),set:(key,item)=>apply(set,value,[key,item]),has:key=>apply(has,value,[key]),delete:key=>apply(remove,value,[key]),clear:()=>apply(clear,value,[]),get size(){return apply(mapSize,value,[])}};},
  set(){const value=new S();return{add:key=>apply(add,value,[key]),has:key=>apply(contains,value,[key]),get size(){return apply(setSize,value,[])}};}
 };
}
