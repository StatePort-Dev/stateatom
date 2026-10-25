// SPDX-License-Identifier: Apache-2.0
// Source-only, closed Main/todos/filter/map handoff. No state or DOM ownership.
import {createCallbackCopyObserver} from './callback-copy-observer.mjs';
export function createMainInputObserver({page,enabled=true,policy}={}){
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,descriptor=Object.getOwnPropertyDescriptor,has=Object.hasOwn;
 const apply=Reflect.apply,WM=WeakMap,Ref=WeakRef,get=WeakMap.prototype.get,set=WeakMap.prototype.set,deref=WeakRef.prototype.deref;
 const isArray=Array.isArray,isInteger=Number.isSafeInteger,nativeFilter=Array.prototype.filter,nativeMap=Array.prototype.map;
 const object=x=>x!==null&&(typeof x==='object'||typeof x==='function');
 const data=(value,enumerable=false,writable=false,configurable=false)=>{const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;};
 const dto=fields=>{const out=create(null),names=keys(fields);for(let i=0;i<names.length;i++)define(out,names[i],data(fields[names[i]],true));return freeze(out);};
 const list=()=>{const a=[];define(a,'toJSON',data(undefined));return a;},append=(a,v)=>define(a,a.length,data(v,true,true,true));
 const read=(m,k)=>apply(get,m,[k]),put=(m,k,v)=>apply(set,m,[k,v]),weak=r=>r?apply(deref,r,[]):undefined;
 const own=(o,k)=>{if(!object(o))throw TypeError('Owned source policy required');const d=descriptor(o,k);if(!d||!has(d,'value'))throw TypeError('Source policy requires own data');return d.value;};
 const hex=s=>typeof s==='string'&&s.length===64&&/^[a-f0-9]+$/.test(s);
 function site(value,kind){
  const fields=create(null),names=['id','file','sourceDigest','kind','line','column','endLine','endColumn'];
  if(kind==='main-input'){append(names,'functionName');append(names,'parameter');}
  for(let i=0;i<names.length;i++)fields[names[i]]=own(value,names[i]);
  if(!hex(fields.id)||!hex(fields.sourceDigest)||typeof fields.file!=='string'||!fields.file||fields.file.length>1024||fields.kind!==kind)throw TypeError('Closed source site required');
  for(const k of ['line','column','endLine','endColumn'])if(!isInteger(fields[k])||fields[k]<1)throw TypeError('Source location required');
  if(fields.endLine<fields.line||fields.endLine===fields.line&&fields.endColumn<fields.column)throw TypeError('Source range required');
  if(kind==='main-input'&&(fields.functionName!=='Main'||fields.parameter!=='todos'))throw TypeError('Only Main.todos binding admitted');
  return dto(fields);
 }
 if(typeof page!=='string'||!page||page.length>128||typeof enabled!=='boolean')throw TypeError('Bounded source page and explicit enabled flag required');
 // This policy is compiler/loader-owned data, copied before application execution.
 const mainSite=site(own(policy,'mainSite'),'main-input'),filterSite=site(own(policy,'filterSite'),'filter'),mapSite=site(own(policy,'mapSite'),'map');
 if(mainSite.sourceDigest!==filterSite.sourceDigest||mainSite.sourceDigest!==mapSite.sourceDigest||mainSite.file!==filterSite.file||mainSite.file!==mapSite.file||mainSite.id===filterSite.id||mainSite.id===mapSite.id||filterSite.id===mapSite.id)throw TypeError('One distinct same-source site triple required');
 const children=[filterSite,mapSite];
 for(let i=0;i<children.length;i++){const s=children[i];if(s.line<mainSite.line||s.line===mainSite.line&&s.column<mainSite.column||s.endLine>mainSite.endLine||s.endLine===mainSite.endLine&&s.endColumn>mainSite.endColumn)throw TypeError('Native sites must lie inside Main');}
 const base=createCallbackCopyObserver({page,enabled,inputProfile:'jsx-config'});
 const baseBegin=base.arrayRuntime.begin,baseFinish=base.arrayRuntime.finish,baseAbort=base.arrayRuntime.abort,baseEnter=base.enter,baseReturned=base.returned,baseExit=base.exit,baseLookup=base.lookup,baseSnapshot=base.snapshot;
 let generation=0,label='initial',serial=0,identity=0,events=0,collecting=true,stopped=false,invalid=false,overflow=false,reason=null;
 let mains=list(),calls=list(),callbacks=list(),stack=list(),mainHandles=new WM(),callHandles=new WM(),callbackHandles=new WM(),ids=new WM();
 const live=()=>enabled&&!stopped&&collecting&&!invalid&&!overflow;
 const window=()=>dto({id:page+':main-input:window:'+generation,label});
 const number=role=>page+':main-input:'+generation+':'+role+':'+ ++serial;
 function id(value){let v=read(ids,value);if(!v){v=page+':main-input:'+generation+':object:'+ ++identity;put(ids,value,v);}return v;}
 function clear(){mains=list();calls=list();callbacks=list();stack=list();mainHandles=new WM();callHandles=new WM();callbackHandles=new WM();ids=new WM();}
 function refuse(why,capacity=false){reason=why;if(capacity)overflow=true;else invalid=true;clear();}
 function tick(){if(events>=4096){refuse('Main bridge event capacity refused',true);return false;}events++;return true;}
 const current=()=>stack.length?stack[stack.length-1]:null;
 function mainEnter(argument,todos,tag){
  if(!live())return null;
  try{
   if(!tick())return null;
   if(typeof tag!=='string'||tag!==mainSite.id||!object(argument)||!isArray(todos)){refuse('Unadmitted Main binding');return null;}
   if(mains.length>=64){refuse('Main frame capacity refused',true);return null;}
   const token=create(null),row={frameId:number('main'),argument:new Ref(argument),input:new Ref(todos),argumentId:id(argument),parameterId:id(todos),returned:false,closed:false};
   put(mainHandles,token,row);append(mains,row);append(stack,row);return token;
  }catch{refuse('Main binding bookkeeping unavailable');return null;}
 }
 function mainReturned(token,value){
  if(!live())return value;
  try{if(!tick())return value;const row=object(token)?read(mainHandles,token):null;if(!row||row!==current()||row.returned||row.closed){refuse('Invalid Main return');return value;}row.returned=true;}
  catch{refuse('Main return bookkeeping unavailable');}
  return value;
 }
 function mainExit(token){
  if(!live()||token===null)return;
  try{if(!tick())return;const row=object(token)?read(mainHandles,token):null;if(!row||row!==current()||row.closed||!row.returned){refuse('Main did not complete in its own invocation');return;}row.closed=true;stack.length--;}
  catch{refuse('Main exit bookkeeping unavailable');}
 }
 // Primitive tags are checked without reading any event metadata object.
 function begin(method,array,tag){
  const canonical=typeof tag==='string'?(tag===filterSite.id?filterSite:tag===mapSite.id?mapSite:null):null;
  if(!canonical){if(live())refuse('Unadmitted native call tag');return null;}
  const token=apply(baseBegin,undefined,[method,array,canonical]);
  if(!live())return token;
  try{
   if(!tick())return token;const owner=current();
   if(!owner||owner.returned||owner.closed||!object(token)||!isArray(array)||method!==(canonical===filterSite?nativeFilter:nativeMap)){refuse('No current admitted Main native call');return token;}
   if(calls.length>=64){refuse('Main native call capacity refused',true);return token;}
   let filter=null;
   if(canonical===filterSite){const input=weak(owner.input);if(!object(input)||input!==array){refuse('Filter receiver is not the original parameter binding');return token;}}
   else{
    let matches=0;
    for(let i=0;i<calls.length;i++){const c=calls[i];if(c.kind==='filter'&&c.main===owner&&c.done&&!c.aborted&&weak(c.result)===array){filter=c;matches++;}}
    if(matches!==1){refuse('No unique same-invocation filter result for map');return token;}
   }
   const row={callId:number('call'),kind:canonical===filterSite?'filter':'map',main:owner,receiver:new Ref(array),receiverId:id(array),result:null,resultId:null,filter,done:false,aborted:false};
   append(calls,row);put(callHandles,token,row);
  }catch{refuse('Main native call bookkeeping unavailable');}
  return token;
 }
 function finish(token,value){
  const result=apply(baseFinish,undefined,arguments);
  if(!live())return result;
  try{
   if(!tick())return result;const row=object(token)?read(callHandles,token):null;
   if(!row||row.main!==current()||row.done||row.aborted){refuse('Native result outside its Main invocation');return result;}
   row.done=true;if(row.kind==='filter'){if(!isArray(value)){refuse('Filter result is outside the array profile');return result;}row.result=new Ref(value);row.resultId=id(value);}
  }catch{refuse('Main result bookkeeping unavailable');}
  return result;
 }
 function abort(token){
  apply(baseAbort,undefined,arguments);
  // The unchanged recipe clears an absent token before begin and after finish.
  if(!live()||token===null||token===undefined)return;
  try{const row=object(token)?read(callHandles,token):null;if(!row){refuse('Invalid native abort');return;}if(row.done)return;if(!tick())return;if(row.main!==current()||row.aborted){refuse('Invalid native abort');return;}row.aborted=true;refuse('Native call did not complete');}
  catch{refuse('Main abort bookkeeping unavailable');}
 }
 function enter(token,tag,item,index,array){
  if(typeof tag!=='string'||tag!==mapSite.id){if(live())refuse('Unadmitted callback tag');return null;}
  const handle=apply(baseEnter,undefined,[token,mapSite,item,index,array]);
  if(!live())return handle;
  try{
   if(!tick())return handle;const call=object(token)?read(callHandles,token):null;
   if(!object(handle)||!call||call.kind!=='map'||call.done||call.aborted||call.main!==current()||weak(call.receiver)!==array){refuse('Callback is outside its Main map');return handle;}
   if(callbacks.length>=512){refuse('Main callback capacity refused',true);return handle;}
   const row={main:call.main,call,element:null,returned:false,closed:false};append(callbacks,row);put(callbackHandles,handle,row);
  }catch{refuse('Main callback bookkeeping unavailable');}
  return handle;
 }
 function returned(handle,value){
  const result=apply(baseReturned,undefined,arguments);
  if(!live())return result;
  try{if(!tick())return result;const row=object(handle)?read(callbackHandles,handle):null;if(!row||row.main!==current()||row.returned||row.closed){refuse('Invalid Main callback return');return result;}row.returned=true;if(object(value))row.element=new Ref(value);}
  catch{refuse('Main callback result unavailable');}
  return result;
 }
 function exit(handle){
  apply(baseExit,undefined,arguments);
  if(!live()||handle===null)return;
  try{if(!tick())return;const row=object(handle)?read(callbackHandles,handle):null;if(!row||row.main!==current()||row.closed||!row.returned){refuse('Main callback did not complete');return;}row.closed=true;}
  catch{refuse('Main callback exit unavailable');}
 }
 function snapshotFor(selected=null){
  const callbackInterval=apply(baseSnapshot,undefined,[]),audit=list(),links=list(),candidates=list();
  let why=stopped?'Observer stopped':reason,eligible=enabled&&!stopped&&!collecting&&!invalid&&!overflow&&stack.length===0&&callbackInterval.status==='Observed';
  try{
   for(let i=0;i<mains.length;i++){const m=mains[i];append(audit,dto({mainFrameId:m.frameId,argumentId:m.argumentId,parameterId:m.parameterId,mainSite,returned:m.returned,closed:m.closed}));if(!m.returned||!m.closed||!object(weak(m.argument))||!object(weak(m.input)))eligible=false;}
   if(eligible)for(let i=0;i<callbacks.length;i++){
    const c=callbacks[i],map=c.call,filter=map.filter,element=weak(c.element),input=weak(c.main.input),filterInput=filter?weak(filter.receiver):undefined,result=filter?weak(filter.result):undefined,receiver=weak(map.receiver);
    if(!c.returned||!c.closed||!map.done||map.aborted||!filter||!filter.done||filter.aborted||!object(input)||input!==filterInput||!object(result)||result!==receiver||!object(element)){eligible=false;why='A complete same-invocation reference handoff is unavailable';break;}
    const exact=apply(baseLookup,undefined,[element]);
    if(exact.status!=='Observed'||exact.links.length!==1){eligible=false;why='No unique exact callback/JSX element association';break;}
    append(candidates,{element,link:dto({mainFrameId:c.main.frameId,argumentId:c.main.argumentId,parameter:'todos',parameterId:c.main.parameterId,mainSite,filterCallId:filter.callId,filterReceiverId:filter.receiverId,filterSite,filterResultId:filter.resultId,mapCallId:map.callId,mapReceiverId:map.receiverId,mapSite,callbackOccurrence:exact.links[0]})});
   }
   if(eligible)for(let i=0;i<candidates.length;i++)if(!selected||candidates[i].element===selected)append(links,candidates[i].link);
  }catch{eligible=false;why='Main reference lookup unavailable';}
  const output=eligible?links:list(),observed=output.length>0;
  return dto({schema:'stateatom.main-parameter-filter-map/1',scope:'Historical same original Main call: already-bound todos, exact native filter return, map receiver and callback-JSX occurrence',page,window:window(),status:observed?'Observed':'Unknown/Unsupported',reason:observed?null:why|| (collecting?'Collection window not sealed':'No eligible complete Main handoff'),collecting,sealed:!collecting&&!stopped,mainFrames:freeze(audit),links:freeze(output),callbackInterval,nativeOrigin:'NotAttested',propStorage:'Unknown/Unsupported',propTransfer:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',stateRevision:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',componentInstance:'Unknown/Unsupported',fullPath:false});
 }
 function snapshot(){return snapshotFor();}
 function lookup(element){if(!object(element)){const s=snapshotFor();return dto({...s,status:'Unknown/Unsupported',links:freeze(list())});}return snapshotFor(element);}
 function retention(){return dto({mainFrames:mains.length,calls:calls.length,callbacks:callbacks.length,active:stack.length,events,stopped,collecting,invalid,overflow,window:generation,callbackInterval:base.retention()});}
 function sealWindow(){if(stopped)return dto({sealed:false,snapshot:snapshot(),retention:retention()});if(stack.length)refuse('Main invocation incomplete at seal');collecting=false;base.sealWindow();return dto({sealed:true,snapshot:snapshot(),retention:retention()});}
 function startWindow(next){if(stopped||typeof next!=='string'||!next||next.length>80)return null;clear();generation++;label=next;serial=0;identity=0;events=0;invalid=false;overflow=false;reason=null;collecting=true;base.startWindow(next);return window();}
 function stop(){stopped=true;collecting=false;clear();base.stop();}
 const arrayRuntime=dto({apply:base.arrayRuntime.apply,begin,finish,abort,yielded:base.arrayRuntime.yielded});
 return dto({arrayRuntime,enter,returned,exit,tap:base.tap,mainEnter,mainReturned,mainExit,snapshot,lookup,retention,sealWindow,startWindow,stop});
}
