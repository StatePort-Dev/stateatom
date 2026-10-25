// SPDX-License-Identifier: Apache-2.0
// Historical source binding only; tuple slots and native state origin stay unknown.
export function createAppHookBindingObserver({page,enabled=true,policy}={}){
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,describe=Object.getOwnPropertyDescriptor,has=Object.hasOwn,apply=Reflect.apply,isArray=Array.isArray,integer=Number.isSafeInteger;
 const WM=WeakMap,Ref=globalThis.WeakRef,get=WeakMap.prototype.get,set=WeakMap.prototype.set,supported=typeof Ref==='function',deref=supported?Ref.prototype.deref:null;
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function'),read=(m,k)=>apply(get,m,[k]),put=(m,k,v)=>apply(set,m,[k,v]),weak=r=>r?apply(deref,r,[]):undefined;
 const data=(value,enumerable=false,writable=false,configurable=false)=>{const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;};
 const dto=fields=>{const out=create(null),names=keys(fields);for(let i=0;i<names.length;i++)define(out,names[i],data(fields[names[i]],true));return freeze(out);};
 const list=()=>{const a=[];define(a,'toJSON',data(undefined));return a;},append=(a,v)=>define(a,a.length,data(v,true,true,true));
 const own=(o,k)=>{if(!object(o))throw TypeError('Owned App policy required');const d=describe(o,k);if(!d||!has(d,'value'))throw TypeError('Own source policy data required');return d.value;};
 const hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
 function site(input,kind){
  const fields=create(null),names=['id','file','sourceDigest','kind','line','column','endLine','endColumn'];if(kind==='app-hook-function')append(names,'functionName');else{append(names,'callName');append(names,'todosBinding');append(names,'dispatchBinding');}
  for(let i=0;i<names.length;i++)fields[names[i]]=own(input,names[i]);
  if(!hex(fields.id)||!hex(fields.sourceDigest)||typeof fields.file!=='string'||!fields.file||fields.file.length>1024||fields.kind!==kind)throw TypeError('Closed App source site required');
  const coordinates=['line','column','endLine','endColumn'];for(let i=0;i<coordinates.length;i++)if(!integer(fields[coordinates[i]])||fields[coordinates[i]]<1)throw TypeError('App source location required');
  if(fields.endLine<fields.line||fields.endLine===fields.line&&fields.endColumn<fields.column)throw TypeError('App source range required');
  if(kind==='app-hook-function'?fields.functionName!=='App':fields.callName!=='useReducer'||fields.todosBinding!=='todos'||fields.dispatchBinding!=='dispatch')throw TypeError('Only original App hook bindings admitted');
  return dto(fields);
 }
 if(typeof page!=='string'||!page||page.length>160||typeof enabled!=='boolean')throw TypeError('Bounded App page and enabled flag required');
 const appSite=site(own(policy,'appSite'),'app-hook-function'),bindingSite=site(own(policy,'bindingSite'),'app-hook-binding');
 if(appSite.id===bindingSite.id||appSite.file!==bindingSite.file||appSite.sourceDigest!==bindingSite.sourceDigest||bindingSite.line<appSite.line||bindingSite.line===appSite.line&&bindingSite.column<appSite.column||bindingSite.endLine>appSite.endLine||bindingSite.endLine===appSite.endLine&&bindingSite.endColumn>appSite.endColumn)throw TypeError('One same-App binding policy required');
 let generation=0,label='initial',serial=0,identity=0,events=0,collecting=true,stopped=false,invalid=false,overflow=false,reason=null,frames=list(),stack=list(),handles=new WM(),ids=new WM();
 const live=()=>enabled&&supported&&!stopped&&collecting&&!invalid&&!overflow,current=()=>stack.length?stack[stack.length-1]:null,number=role=>page+':app-hook-binding:'+generation+':'+role+':'+ ++serial;
 const window=()=>dto({id:page+':app-hook-binding:window:'+generation,label});
 function id(value){let n=read(ids,value);if(!n){n=page+':app-hook-binding:'+generation+':object:'+ ++identity;put(ids,value,n);}return n;}
 function clear(){frames=list();stack=list();handles=new WM();ids=new WM();}
 function refuse(why,capacity=false){reason=why;if(capacity)overflow=true;else invalid=true;clear();}
 function tick(){if(events>=4096){refuse('App binding event capacity refused',true);return false;}events++;return true;}
 function appEnter(tag){
  if(!live())return null;
  try{if(!tick())return null;if(typeof tag!=='string'||tag!==appSite.id){refuse('Unadmitted App source tag');return null;}if(frames.length>=64){refuse('App frame capacity refused',true);return null;}
   const token=create(null),row={appFrameId:number('frame'),callId:null,hookFunctionId:null,resultId:null,todosId:null,dispatchId:null,hook:null,tuple:null,todos:null,dispatch:null,resultRecorded:false,bound:false,returned:false,closed:false};put(handles,token,row);append(frames,row);append(stack,row);return token;
  }catch{refuse('App entry bookkeeping unavailable');return null;}
 }
 function result(token,tuple,method,tag){
  if(!live())return tuple;
  try{if(!tick())return tuple;const row=object(token)?read(handles,token):null;
   if(typeof tag!=='string'||tag!==bindingSite.id||!row||row!==current()||row.resultRecorded||row.returned||row.closed||!isArray(tuple)||typeof method!=='function'){refuse('No exact current App hook result');return tuple;}
   row.callId=number('call');row.hookFunctionId=id(method);row.resultId=id(tuple);row.hook=new Ref(method);row.tuple=new Ref(tuple);row.resultRecorded=true;
  }catch{refuse('App result bookkeeping unavailable');}
  return tuple;
 }
 function bound(token,tuple,todos,dispatch,tag){
  if(!live())return;
  try{if(!tick())return;const row=object(token)?read(handles,token):null;
   if(typeof tag!=='string'||tag!==bindingSite.id||!row||row!==current()||!row.resultRecorded||row.bound||row.returned||row.closed||weak(row.tuple)!==tuple||!isArray(todos)||typeof dispatch!=='function'){refuse('No exact original App result/binding occurrence');return;}
   // Never inspect tuple[0/1], its iterator, state contents or dispatch properties.
   row.todos=new Ref(todos);row.dispatch=new Ref(dispatch);row.todosId=id(todos);row.dispatchId=id(dispatch);row.bound=true;
  }catch{refuse('App binding bookkeeping unavailable');}
 }
 function appReturned(token,value){
  if(!live())return value;
  try{if(!tick())return value;const row=object(token)?read(handles,token):null;if(!row||row!==current()||!row.resultRecorded||!row.bound||row.returned||row.closed){refuse('Invalid App normal return');return value;}row.returned=true;}
  catch{refuse('App return bookkeeping unavailable');}
  return value;
 }
 function appExit(token){
  if(!live()||token===null)return;
  try{if(!tick())return;const row=object(token)?read(handles,token):null;if(!row||row!==current()||!row.returned||!row.bound||row.closed){refuse('App did not complete its original binding');return;}row.closed=true;stack.length--;}
  catch{refuse('App exit bookkeeping unavailable');}
 }
 function snapshotFor(kind=null,value=null){
  const audit=list(),candidates=list(),links=list();let why=stopped?'Observer stopped':!supported?'WeakRef unavailable':reason,eligible=enabled&&supported&&!stopped&&!collecting&&!invalid&&!overflow&&stack.length===0;
  try{
   for(let i=0;i<frames.length;i++){const r=frames[i];append(audit,dto({appFrameId:r.appFrameId,callId:r.callId,appSite,bindingSite,resultRecorded:r.resultRecorded,bound:r.bound,returned:r.returned,closed:r.closed}));if(!r.resultRecorded||!r.bound||!r.returned||!r.closed||!object(weak(r.tuple))||!object(weak(r.todos))||typeof weak(r.hook)!=='function'||typeof weak(r.dispatch)!=='function')eligible=false;}
   if(eligible)for(let i=0;i<frames.length;i++){const r=frames[i],link=dto({appFrameId:r.appFrameId,callId:r.callId,appSite,bindingSite,hookFunctionId:r.hookFunctionId,resultId:r.resultId,todosBinding:'todos',todosId:r.todosId,dispatchBinding:'dispatch',dispatchId:r.dispatchId,tupleIndexOrigin:'Unknown/Unsupported',nativeStateOrigin:'Unknown/Unsupported'});append(candidates,{row:r,link});}
   if(eligible){
    const frame=kind==='frame'&&object(value)?read(handles,value):null;
    for(let i=0;i<candidates.length;i++){const c=candidates[i];if(kind===null||kind==='frame'&&frame===c.row||kind==='tuple'&&object(value)&&weak(c.row.tuple)===value||kind==='todos'&&object(value)&&weak(c.row.todos)===value)append(links,c.link);}
    if(kind!==null&&links.length!==1){if(links.length>1)why='Ambiguous source binding reference';links.length=0;}
   }
  }catch{eligible=false;why='App binding reference lookup unavailable';}
  const output=eligible?links:list(),observed=output.length>0;
  return dto({schema:'stateatom.app-hook-result-binding/1',scope:'Historical original App call result and values already produced by its destructuring; tuple positions and native state origin unknown',sourceBindingOnly:true,page,window:window(),status:observed?'Observed':'Unknown/Unsupported',reason:observed?null:why|| (collecting?'Collection window not sealed':'No eligible unique App binding'),collecting,sealed:!collecting&&!stopped,frames:freeze(audit),links:freeze(output),tupleIndexOrigin:'Unknown/Unsupported',nativeStateOrigin:'Unknown/Unsupported',publicHookKind:'Unknown/Unsupported',stateRevision:'Unknown/Unsupported',propStorage:'Unknown/Unsupported',propTransfer:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',componentInstance:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',nativeOrigin:'NotAttested',fullPath:false});
 }
 function snapshot(){return snapshotFor();}
 function lookupFrame(token){return snapshotFor('frame',token);}
 function lookupTuple(tuple){return snapshotFor('tuple',tuple);}
 function lookupTodos(todos){return snapshotFor('todos',todos);}
 function retention(){let calls=0,bindings=0;for(let i=0;i<frames.length;i++){if(frames[i].resultRecorded)calls++;if(frames[i].bound)bindings++;}return dto({frames:frames.length,calls,bindings,active:stack.length,events,window:generation,collecting,stopped,invalid,overflow,available:supported});}
 function sealWindow(){if(stopped)return dto({sealed:false,snapshot:snapshot(),retention:retention()});if(stack.length)refuse('App binding incomplete at seal');collecting=false;return dto({sealed:true,snapshot:snapshot(),retention:retention()});}
 function startWindow(next){if(stopped||typeof next!=='string'||!next||next.length>80)return null;clear();generation++;label=next;serial=0;identity=0;events=0;invalid=false;overflow=false;reason=null;collecting=true;return window();}
 function stop(){stopped=true;collecting=false;clear();}
 return dto({appEnter,result,bound,appReturned,appExit,snapshot,lookupFrame,lookupTuple,lookupTodos,retention,sealWindow,startWindow,stop});
}
