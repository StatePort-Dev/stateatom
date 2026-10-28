// SPDX-License-Identifier: Apache-2.0
// Native text-subtree mutation history for the finite selected-list profile.
// No property value reads, application getter calls or write attribution.
import {capturePrivateCollections} from './private-collections.mjs';
export function createListDOMHistory({realm=globalThis,maxRecords=4096,maxAncestors=128}={}){
 const apply=Reflect.apply,own=Object.getOwnPropertyDescriptor,collections=capturePrivateCollections();
 const data=(o,key)=>{if(!o)return undefined;const d=own(o,key);return d&&own(d,'value')?.value};
 const accessor=(o,key)=>{if(!o)return undefined;const d=own(o,key);return d&&own(d,'get')?.value};
 let observer=null,marks=collections.weakMap(),sequence=0,recordsSeen=0,current=null,stopped=false,refused=false;
 const NativeObserver=realm.MutationObserver,document=realm.document,parent=accessor(realm.Node?.prototype,'parentNode'),target=accessor(realm.MutationRecord?.prototype,'target'),type=accessor(realm.MutationRecord?.prototype,'type'),observe=data(NativeObserver?.prototype,'observe'),take=data(NativeObserver?.prototype,'takeRecords'),disconnect=data(NativeObserver?.prototype,'disconnect');
 const valid=Number.isSafeInteger(maxRecords)&&maxRecords>0&&maxRecords<=4096&&Number.isSafeInteger(maxAncestors)&&maxAncestors>0&&maxAncestors<=128&&document&&[NativeObserver,parent,target,type,observe,take,disconnect].every(fn=>typeof fn==='function');
 function refuse(){refused=true;current=null;marks=collections.weakMap();if(observer&&typeof disconnect==='function')try{apply(disconnect,observer,[])}catch{}}
 function record(records){
  if(stopped||refused)return;
  try{
   const length=data(records,'length');if(!Number.isSafeInteger(length)||length<0||(recordsSeen+=length)>maxRecords)throw Error('Native mutation budget');
   for(let i=0;i<length;i++){
    const r=data(records,String(i)),kind=apply(type,r,[]);if(kind!=='childList'&&kind!=='characterData')throw Error('Unexpected mutation');
    let node=apply(target,r,[]),depth=0;const seen=collections.weakSet();sequence++;
    while(node){if(++depth>maxAncestors||seen.has(node))throw Error('Native ancestry budget');seen.add(node);marks.set(node,sequence);node=apply(parent,node,[])}
   }
  }catch{refuse()}
 }
 function drain(){if(!stopped&&!refused)try{record(apply(take,observer,[]))}catch{refuse()}}
 if(valid)try{observer=new NativeObserver(record);apply(observe,observer,[document,{subtree:true,childList:true,characterData:true}])}catch{refuse()}else refused=true;
 function commit(commitId){if(stopped||refused||current?.id===commitId)return;drain();if(refused)return;if(typeof commitId!=='string'||!commitId||commitId.length>256){refuse();return}current={id:commitId,sequence};}
 const unknown=reason=>({schema:'stateatom.list-dom-history/1',status:'Unknown/Unsupported',reason,fullPath:false,scope:'Native text-subtree mutation interval only; no field ownership or write attribution'});
 function snapshot(node,commitId){
  if(stopped||refused)return unknown('Native DOM history unavailable');drain();if(refused||!current||current.id!==commitId)return unknown('Current native commit DOM interval unavailable');
  try{
   let cursor=node,depth=0;const seen=collections.weakSet();while(cursor!==document){if(!cursor||++depth>maxAncestors||seen.has(cursor))return unknown('Selected node is outside the observed document');seen.add(cursor);cursor=apply(parent,cursor,[])}
   if((marks.get(node)||0)>current.sequence)return unknown('Selected text subtree changed after the recorded native commit');
   return{...unknown(null),status:'Observed',commitId,commitMutationSequence:current.sequence,selectedMutationSequence:marks.get(node)||0};
  }catch{return unknown('Native selected-node ancestry unavailable')}
 }
 return Object.freeze({commit,snapshot,stop(){if(stopped)return;stopped=true;current=null;marks=collections.weakMap();if(observer&&typeof disconnect==='function')try{apply(disconnect,observer,[])}catch{}},retention(){return{records:recordsSeen,sequence,stopped,refused}}});
}
