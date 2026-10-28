// SPDX-License-Identifier: Apache-2.0
// Original list/row construction receipts. Whole-code/no-write authority is external
// to this recorder; no page-supplied flag can promote these facts to full lineage.
import {capturePrivateCollections} from './private-collections.mjs';
export function createListDataReceipts({page,realm=globalThis}={}){
 if(typeof page!=='string'||!page||page.length>160)throw Error('Bounded page required');
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function'),primitive=v=>v===null||typeof v==='string'||typeof v==='number'||typeof v==='boolean'||typeof v==='undefined';
 const apply=Reflect.apply,describe=Object.getOwnPropertyDescriptor,hasOwn=Object.hasOwn,create=Object.create,define=Object.defineProperty,assign=Object.assign,freeze=Object.freeze,isArray=Array.isArray;
 const NativeArray=realm.Array,ArrayProto=NativeArray.prototype,ObjectProto=realm.Object.prototype,prototype=Object.getPrototypeOf,NativeWeak=realm.WeakRef,deref=typeof NativeWeak==='function'?describe(NativeWeak.prototype,'deref')?.value:null;
 const ref=v=>new NativeWeak(v),read=r=>r&&apply(deref,r,[]),collections=capturePrivateCollections(),append=(a,v)=>{const d=create(null);d.value=v;d.writable=true;d.enumerable=true;d.configurable=true;define(a,a.length,d);};
 const methods={map:ArrayProto.map,filter:ArrayProto.filter,concat:ArrayProto.concat,every:ArrayProto.every};
 const guards=[[ArrayProto,'constructor'],[NativeArray,realm.Symbol.species],[ArrayProto,realm.Symbol.isConcatSpreadable],[ObjectProto,realm.Symbol.isConcatSpreadable]],descriptors=[];
 for(let i=0;i<guards.length;i++)append(descriptors,describe(guards[i][0],guards[i][1]));
 const own=(o,k)=>o&&hasOwn(o,k)?o[k]:undefined,keys=['value','get','set','writable','enumerable','configurable'];
 function nativeShape(){if(prototype(ArrayProto)!==ObjectProto||prototype(ObjectProto)!==null)return false;for(let i=0;i<guards.length;i++){const actual=describe(guards[i][0],guards[i][1]),expected=descriptors[i];if(!!actual!==!!expected)return false;for(let j=0;j<keys.length;j++)if(own(actual,keys[j])!==own(expected,keys[j]))return false;}return true;}
 let sites=collections.map(),rows=collections.weakMap(),arrays=collections.weakMap(),tokens=collections.weakMap(),caps=collections.weakMap(),ids=collections.weakMap(),stack=[],events=0,serial=0,stopped=false,refused=typeof deref!=='function';
 const top=()=>stack.length?stack[stack.length-1]:null,id=o=>{let value=ids.get(o);if(!value){value=page+':data:'+ ++serial;ids.set(o,value);}return value;};
 function clear(){rows=collections.weakMap();arrays=collections.weakMap();tokens=collections.weakMap();caps=collections.weakMap();stack=[];}
 const safe=fn=>function(){if(stopped||refused)return null;try{if(++events>8192){refused=true;clear();return null;}return apply(fn,undefined,arguments);}catch{refused=true;clear();return null;}};
 const validId=s=>typeof s==='string'&&s.length>0&&s.length<=128;
 const register=safe(input=>{if(!isArray(input)||input.length>512)return false;for(let i=0;i<input.length;i++){const s=input[i];if(!validId(s?.id)||sites.has(s.id))return false;if(s.kind==='row-literal'){if(!isArray(s.properties)||!s.properties.length||s.properties.length>16)return false;const properties=[];for(let j=0;j<s.properties.length;j++){const p=s.properties[j];if(p.kind!=='spread'&&(p.kind!=='field'||!validId(p.key)))return false;append(properties,{kind:p.kind,key:p.key});}sites.set(s.id,{id:s.id,kind:s.kind,properties});}else if(s.kind==='empty-array')sites.set(s.id,{id:s.id,kind:s.kind});else if(s.kind==='array-call'&&hasOwn(methods,s.method))sites.set(s.id,{id:s.id,kind:s.kind,method:s.method,output:s.output});else return false;}return true;});
 const source=safe((kind,a,b,c,d,value)=>{
  if(kind==='empty-array'){const s=sites.get(a);if(s?.kind==='empty-array'&&object(value)&&nativeShape()&&!arrays.has(value))arrays.set(value,{id:id(value),siteId:s.id,members:[],ref:ref(value),method:'literal',parent:null});return null;}
  if(kind==='row-begin'){const s=sites.get(a);if(s?.kind!=='row-literal'||!nativeShape())return null;const token={},frame=assign(create(null),{kind:'row',site:s,cursor:0,invalid:false,finished:false,keys:[],definitions:collections.map()});tokens.set(token,frame);return token;}
  if(kind==='array-begin'){
   const s=sites.get(c),input=object(b)?arrays.get(b):null;if(s?.kind!=='array-call'||a!==methods[s.method]||!input||!nativeShape()||read(input.ref)!==b||input.members.length>128||stack.length>=16)return null;
   const token={},frame=assign(create(null),{kind:'array',id:page+':array-call:'+ ++serial,site:s,input,receiver:ref(b),invalid:false,finished:false,constructed:false,visited:0,members:[],callback:null,concat:null});tokens.set(token,frame);append(stack,frame);return token;
  }
  const frame=object(a)?tokens.get(a):null;if(!frame)return null;
  if(frame.kind==='row'){
   if(frame.finished)return null;
   if(kind==='row-field'||kind==='row-spread'){
    const expected=frame.cursor<frame.site.properties.length?frame.site.properties[frame.cursor++]:null;if(!expected){frame.invalid=true;return null;}
    if(kind==='row-field'){if(expected.kind!=='field'||expected.key!==b||!primitive(value)){frame.invalid=true;return null;}if(!frame.definitions.has(b))append(frame.keys,b);frame.definitions.set(b,{siteId:frame.site.id,field:b});}
    else{const previous=object(value)?rows.get(value):null;if(expected.kind!=='spread'||!previous){frame.invalid=true;return null;}for(let i=0;i<previous.keys.length;i++){const key=previous.keys[i];if(!frame.definitions.has(key))append(frame.keys,key);frame.definitions.set(key,previous.definitions.get(key));}}
    if(frame.keys.length>16)frame.invalid=true;return null;
   }
   if(kind==='row-end'){frame.finished=true;if(frame.invalid||frame.cursor!==frame.site.properties.length||!object(value)||rows.has(value)||!nativeShape())return null;rows.set(value,{id:id(value),siteId:frame.site.id,keys:frame.keys,definitions:frame.definitions,ref:ref(value)});return null;}
   frame.invalid=true;return null;
  }
  if(kind==='array-abort'){if(frame.finished)return null;if(top()!==frame){refused=true;clear();return null;}stack.length--;frame.invalid=true;frame.finished=true;frame.callback=null;return null;}
  if(frame.finished||top()!==frame){frame.invalid=true;return null;}
  if(kind==='concat-arg'){if(frame.site.method!=='concat'||frame.concat||!object(value)||!rows.has(value)){frame.invalid=true;return null;}frame.concat=ref(value);return null;}
  if(kind==='array-entry'){
   const expected=frame.visited<frame.input.members.length?frame.input.members[frame.visited]:null;if(frame.site.method==='concat'||frame.callback||c!==frame.visited||d!==read(frame.receiver)||!expected||read(expected)!==b){frame.invalid=true;return null;}
   const capability=freeze({}),callback=assign(create(null),{frame,row:ref(b),index:c,yielded:false,capability});caps.set(capability,callback);frame.callback=callback;return null;
  }
  if(kind==='array-yield'){
   const cb=frame.callback;if(!cb||cb.yielded||read(cb.row)!==b||cb.index!==c||d!==read(frame.receiver)){frame.invalid=true;return null;}cb.yielded=true;frame.callback=null;frame.visited++;
   if(frame.site.method==='filter'){if(value)append(frame.members,cb.row);}
   else if(frame.site.method==='map'){if(!object(value)||frame.site.output==='collection'&&!rows.has(value))frame.invalid=true;else append(frame.members,ref(value));}return null;
  }
  if(kind==='array-end'){
   stack.length--;frame.finished=true;if(frame.invalid||frame.callback||!nativeShape())return null;
   if(frame.site.method==='every')return null;
   if(frame.site.method==='concat'){const row=read(frame.concat);if(!row)return null;for(let i=0;i<frame.input.members.length;i++)append(frame.members,frame.input.members[i]);append(frame.members,frame.concat);}
   else if(frame.visited!==frame.input.members.length)return null;
   if(!object(value)||!isArray(value)||arrays.has(value)||frame.members.length>128)return null;
   const entry={id:id(value),siteId:frame.site.id,method:frame.site.method,ref:ref(value),members:frame.members,parent:frame.input,call:frame};arrays.set(value,entry);frame.constructed=true;frame.result=ref(value);return null;
  }
  frame.invalid=true;return null;
 });
 const unknown=reason=>({schema:'stateatom.list-data-receipt/1',page,status:'Unknown/Unsupported',reason,fieldOwnership:'Unknown/Unsupported',currentMembership:'Unknown/Unsupported',ordinaryConstruction:'Requires complete source/no-write/code premises',fullPath:false});
 function membership(array,row){try{if(stopped||refused||!nativeShape())return unknown('Data observation unavailable');const entry=object(array)?arrays.get(array):null,created=object(row)?rows.get(row):null;if(!entry||!created||read(entry.ref)!==array||read(created.ref)!==row)return unknown('No exact original collection/row creation');let count=0;for(let i=0;i<entry.members.length;i++){const item=read(entry.members[i]);if(!item)return unknown('Original member reference missing');if(item===row)count++;}if(count!==1)return unknown('Missing or ambiguous original row occurrence');return{...unknown(null),status:'Observed',arrayId:entry.id,rowId:created.id,siteId:entry.siteId,method:entry.method};}catch{return unknown('Original data lookup unavailable');}}
 function row(value){try{const entry=!stopped&&!refused&&object(value)?rows.get(value):null;if(!entry||read(entry.ref)!==value)return{...unknown('Original row unavailable'),fields:[]};const fields=[];for(let i=0;i<entry.keys.length;i++)append(fields,entry.keys[i]);return{...unknown(null),status:'Observed',rowId:entry.id,siteId:entry.siteId,fields};}catch{return{...unknown('Original row lookup unavailable'),fields:[]};}}
 const currentCallback=safe((receiver,row)=>{const frame=top(),cb=frame?.callback;return frame&&!frame.invalid&&cb&&!cb.yielded&&read(frame.receiver)===receiver&&read(cb.row)===row?cb.capability:null;});
 function callbackPath(capability,{state,filtered,row}={}){try{if(stopped||refused||!nativeShape())return unknown('Data observation unavailable');const cb=object(capability)?caps.get(capability):null,frame=cb?.frame,f=object(filtered)?arrays.get(filtered):null;if(!cb?.yielded||!frame?.finished||!frame.constructed||frame.invalid||frame.site.method!=='map'||read(cb.row)!==row||read(frame.receiver)!==filtered||!f||f.method!=='filter'||read(f.parent?.ref)!==state)return unknown('Original native filter/map callback path unavailable');const member=membership(filtered,row);if(member.status!=='Observed')return member;return{...member,filterSiteId:f.siteId,mapSiteId:frame.site.id,mapCallId:frame.id,sourceId:f.parent.id};}catch{return unknown('Native callback lookup unavailable');}}
 return freeze({register,source,membership,row,currentCallback,callbackPath,stop(){stopped=true;sites.clear();clear();},retention(){return{events,stopped,refused,active:stack.length}}});
}
