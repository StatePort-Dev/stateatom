// SPDX-License-Identifier: Apache-2.0
// Research-only SAME callback interval/input identities, never property ownership.
import {createPropCopyObserver} from './prop-copy-observer.mjs';
import {createJSXConfigInputObserver} from './jsx-config-observer.mjs';
export function createCallbackCopyObserver({page,enabled=true,inputProfile='classic-copy'}={}){
 if(inputProfile!=='classic-copy'&&inputProfile!=='jsx-config')throw TypeError('Unsupported callback input profile');
 const jsx=inputProfile==='jsx-config',family=jsx?'callback-jsx-config':'callback-copy';
 const copy=jsx?createJSXConfigInputObserver({page}):createPropCopyObserver({page});
 const Map=WeakMap,Ref=WeakRef,apply=Reflect.apply,get=WeakMap.prototype.get,set=WeakMap.prototype.set,deref=WeakRef.prototype.deref;
 const nativeMap=Array.prototype.map,nativeFilter=Array.prototype.filter;
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,descriptor=Object.getOwnPropertyDescriptor,isArray=Array.isArray,isInteger=Number.isSafeInteger;
 const object=x=>x!==null&&(typeof x==='object'||typeof x==='function');
 const read=(m,k)=>apply(get,m,[k]),put=(m,k,v)=>apply(set,m,[k,v]);
 const data=(value,enumerable=false,writable=false,configurable=false)=>{const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;};
 const dto=fields=>{const out=create(null),names=keys(fields);for(let i=0;i<names.length;i++)define(out,names[i],data(fields[names[i]],true));return freeze(out);};
 const list=()=>{const out=[];define(out,'toJSON',data(undefined));return out;};
 const append=(a,v)=>define(a,a.length,data(v,true,true,true));
 let calls=list(),frames=list(),stack=list(),tokens=new Map(),props=new Map(),elements=new Map(),ids=new Map(),handles=new Map();
 let generation=0,serial=0,identity=0,events=0,stopped=false,collecting=true,overflow=false,invalid=false,reason=null,label='initial';
 const window=()=>dto({id:page+':'+family+':window:'+generation,label});
 function id(value){let n=read(ids,value);if(!n){n=page+':'+family+':'+generation+':object:'+ ++identity;put(ids,value,n);}return n;}
 function clear(){calls=list();frames=list();stack=list();tokens=new Map();props=new Map();elements=new Map();ids=new Map();handles=new Map();}
 function refuse(why,capacity=false){reason=why;if(capacity)overflow=true;else invalid=true;clear();}
 const live=()=>enabled&&!stopped&&collecting&&!overflow&&!invalid;
 function tick(){if(events>=4096){refuse('Interval event capacity refused',true);return false;}events++;return true;}
 function siteView(input,kind='map'){
  if(!object(input))return null;const s=create(null);
  const names=['id','file','sourceDigest','kind','line','column','endLine','endColumn'];
  for(let i=0;i<names.length;i++){const k=names[i],d=descriptor(input,k);if(!d||!descriptor(d,'value'))return null;s[k]=d.value;}
  if(s.kind!==kind||typeof s.id!=='string'||!s.id||s.id.length>200||typeof s.file!=='string'||!s.file||s.file.length>1024||typeof s.sourceDigest!=='string'||s.sourceDigest.length!==64)return null;
  for(let i=0;i<64;i++){const c=s.sourceDigest[i];if(!(c>='a'&&c<='f'||c>='0'&&c<='9'))return null;}
  for(let i=4;i<names.length;i++)if(!isInteger(s[names[i]])||s[names[i]]<1)return null;
  if(s.endLine<s.line||s.endLine===s.line&&s.endColumn<s.column)return null;return dto(s);
 }
 // A narrow captured-intrinsic runtime for the ORIGINAL native array call.
 // This is not the legacy array ancestry recorder and emits no filter/map chain.
 function begin(method,array,site){
  if(!live())return null;
  try{
   if(!tick()||!isArray(array)||method!==nativeMap&&method!==nativeFilter)return null;
   const kind=method===nativeMap?'map':'filter',s=siteView(site,kind);if(!s)return null;
   if(calls.length>=64){refuse('Native call capacity refused',true);return null;}
   const token=create(null),row={callId:page+':'+family+':'+generation+':call:'+ ++serial,kind,site:s,array:new Ref(array),arrayId:id(array),done:false,aborted:false};
   append(calls,row);put(tokens,token,row);return token;
  }catch{refuse('Native call bookkeeping unavailable');return null;}
 }
 function finish(token,value){
  if(!live())return value;
  try{if(!tick())return value;const row=object(token)?read(tokens,token):null;if(!row)return value;if(row.done||row.aborted){refuse('Repeated or aborted native call completion');return value;}row.done=true;}catch{refuse('Native call bookkeeping unavailable');}
  return value;
 }
 function abort(token){if(!live())return;try{const row=object(token)?read(tokens,token):null;if(row&&!row.done)row.aborted=true;}catch{refuse('Native call bookkeeping unavailable');}}
 function yielded(token,item,index,array,value){return value;}
 const arrayRuntime=dto({apply,begin,finish,abort,yielded});
 function enter(token,site,item,index,array){
  if(!live())return null;
  try{
   if(!tick())return null;const s=siteView(site),call=object(token)?read(tokens,token):null;if(!call||call.done||call.aborted||!s||call.kind!=='map'||call.site.id!==s.id||call.site.sourceDigest!==s.sourceDigest||!object(item)||!isInteger(index)||index<0||!isArray(array)||apply(deref,call.array,[])!==array)return null;
   if(frames.length>=512){refuse('Callback frame capacity refused',true);return null;}
   const handle=create(null),row={frameId:page+':'+family+':'+generation+':frame:'+ ++serial,call,callId:call.callId,site:s,itemId:id(item),mapIndex:index,arrayId:id(array),returnedId:null,candidate:null,returned:false,closed:false};
   put(handles,handle,row);append(frames,row);append(stack,row);return handle;
  }catch{refuse('Interval bookkeeping unavailable');return null;}
 }
 function tap(kind,value,container,key){
  // Delegate owns native construction validity; interval metadata cannot upgrade it.
  copy.tap(kind,value,container,key);
  if(!live())return value;
  try{
   if(jsx){
    if(kind!=='config-input'&&kind!=='jsx-element-return')return value;
    if(!tick())return value;const owner=stack.length?stack[stack.length-1]:null;
    if(kind==='config-input'){if(object(value)&&object(container))put(props,container,{owner,valueId:id(value),elementId:null,element:null});return value;}
    const row=object(container)?read(props,container):null;
    if(row&&object(value)&&row.owner===owner){row.elementId=id(value);row.element=new Ref(value);put(elements,value,row);}
    return value;
   }
   if(kind!=='props-created'&&kind!=='copy-input'&&kind!=='element-return')return value;
   if(!tick())return value;const owner=stack.length?stack[stack.length-1]:null;
   if(kind==='props-created'){if(object(value))put(props,value,{owner,valueId:null,elementId:null,element:null});return value;}
   const row=object(container)?read(props,container):null;if(!row)return value;
   if(kind==='copy-input'){if(key==='todo'&&object(value)&&row.owner===owner)row.valueId=id(value);return value;}
   if(object(value)&&row.owner===owner){row.elementId=id(value);row.element=new Ref(value);put(elements,value,row);}
  }catch{refuse('Interval bookkeeping unavailable');}
  return value;
 }
 function returned(handle,value){
  if(!live())return value;
  try{
   if(!tick())return value;const row=object(handle)?read(handles,handle):null;
   if(!row||row.closed||row.returned||stack[stack.length-1]!==row){refuse('Invalid callback return occurrence');return value;}
   row.returned=true;if(object(value)){row.returnedId=id(value);const candidate=read(elements,value);if(candidate&&candidate.owner===row&&candidate.valueId===row.itemId)row.candidate=candidate;}
  }catch{refuse('Interval bookkeeping unavailable');}
  return value;
 }
 function exit(handle){
  if(!live()||handle===null)return;
  try{if(!tick())return;const row=object(handle)?read(handles,handle):null;if(!row||row.closed||stack[stack.length-1]!==row){refuse('Invalid callback exit occurrence');return;}row.closed=true;stack.length--;}
  catch{refuse('Interval bookkeeping unavailable');}
 }
 function snapshotFor(selected=null){
  const links=list(),audit=list();const copyView=copy.snapshot();
  const eligible=!stopped&&!collecting&&!overflow&&!invalid&&stack.length===0&&copyView.status==='Observed';
  for(let i=0;i<frames.length;i++){
   const f=frames[i];append(audit,dto({frameId:f.frameId,callId:f.callId,site:f.site,itemId:f.itemId,mapIndex:f.mapIndex,arrayId:f.arrayId,returnedId:f.returnedId,returned:f.returned,closed:f.closed}));
   if(!eligible||!f.closed||!f.returned||!f.candidate||!f.call.done||f.call.aborted)continue;
   let aliases=0;for(let j=0;j<frames.length;j++)if(frames[j].returnedId===f.returnedId)aliases++;
   if(aliases!==1)continue;const c=f.candidate,element=apply(deref,c.element,[]);if(!element||selected&&selected!==element)continue;
   const native=copy.lookup(element);if(native.status!=='Observed'||native.links.length!==1)continue;
   const common={frameId:f.frameId,callId:f.callId,site:f.site,mapIndex:f.mapIndex,arrayId:f.arrayId,itemId:f.itemId,elementId:f.returnedId};
   append(links,jsx?dto({...common,configInputId:c.valueId,configInputOccurrence:native.links[0]}):dto({...common,copyInputId:c.valueId,copyOccurrence:native.links[0]}));
  }
  return dto({schema:jsx?'stateatom.callback-jsx-config-interval/1':'stateatom.callback-copy-interval/1',scope:jsx?'Historical same original map callback interval, fresh JSX config input and exact returned element identities':'Historical same original map callback interval, native copy input and exact returned element identities',page,window:window(),status:links.length?'Observed':'Unknown/Unsupported',reason:links.length?null:stopped?'Observer stopped':overflow||invalid?reason:collecting?'Collection window not sealed':jsx?'No unique completed callback/JSX config interval':'No unique completed callback/copy interval',collecting,sealed:!collecting&&!stopped,frames:freeze(audit),links:freeze(links),nativeOrigin:'NotAttested',propStorage:'Unknown/Unsupported',propTransfer:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',stateRevision:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false});
 }
 function snapshot(){return snapshotFor();}
 function lookup(element){if(!object(element)){const v=snapshotFor();return dto({...v,status:'Unknown/Unsupported',links:freeze(list())});}return snapshotFor(element);}
 function retention(){const common={calls:calls.length,frames:frames.length,active:stack.length,events,stopped,collecting,overflow,invalid,window:generation};return jsx?dto({...common,configInput:copy.retention()}):dto({...common,copy:copy.retention()});}
 function sealWindow(){if(stopped)return dto({sealed:false,snapshot:snapshot(),retention:retention()});if(stack.length)refuse('Callback interval incomplete at seal');collecting=false;copy.sealWindow();return dto({sealed:true,snapshot:snapshot(),retention:retention()});}
 function startWindow(next){if(stopped||typeof next!=='string'||!next||next.length>80)return null;clear();generation++;serial=0;identity=0;events=0;label=next;overflow=false;invalid=false;reason=null;collecting=true;copy.startWindow(next);return window();}
 function stop(){stopped=true;collecting=false;clear();copy.stop();}
 return dto({arrayRuntime,enter,returned,exit,tap,snapshot,lookup,retention,sealWindow,startWindow,stop});
}
