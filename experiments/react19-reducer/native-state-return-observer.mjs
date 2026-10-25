// SPDX-License-Identifier: Apache-2.0
// Conditional supplied-event reference gate; no payload reflection/native-origin attestation.
export function createNativeStateReturnObserver({page,enabled=true,policy}={}){
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,descriptor=Object.getOwnPropertyDescriptor,has=Object.hasOwn,integer=Number.isSafeInteger,isArray=Array.isArray,apply=Reflect.apply;
 const WM=WeakMap,WS=WeakSet,Ref=globalThis.WeakRef,get=WM.prototype.get,set=WM.prototype.set,wsHas=WS.prototype.has,wsAdd=WS.prototype.add,supported=typeof Ref==='function',deref=supported?Ref.prototype.deref:null;
 const U='Unknown/Unsupported',object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
 const data=(value,enumerable=false,writable=false,configurable=false)=>{const d=create(null);d.value=value;d.enumerable=enumerable;d.writable=writable;d.configurable=configurable;return d;};
 const dto=fields=>{const out=create(null),names=keys(fields);for(let i=0;i<names.length;i++)define(out,names[i],data(fields[names[i]],true));return freeze(out);};
 const list=()=>{const a=[];define(a,'toJSON',data(undefined));return a;},append=(a,v)=>define(a,a.length,data(v,true,true,true));
 const read=(m,k)=>apply(get,m,[k]),put=(m,k,v)=>apply(set,m,[k,v]),weak=r=>r?apply(deref,r,[]):undefined,seen=(s,k)=>apply(wsHas,s,[k]),mark=(s,k)=>apply(wsAdd,s,[k]);
 const own=(o,k)=>{if(!object(o))throw TypeError('Owned policy required');const d=descriptor(o,k);if(!d||!has(d,'value'))throw TypeError('Policy own data required');return d.value;},hex=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
 function site(input,kind){
  const out=create(null),names=['id','file','sourceDigest','kind','line','column','endLine','endColumn'];
  if(kind==='app-hook-binding'){append(names,'callName');append(names,'todosBinding');append(names,'dispatchBinding');}else append(names,'functionName');
  for(let i=0;i<names.length;i++)out[names[i]]=own(input,names[i]);
  if(!hex(out.id)||!hex(out.sourceDigest)||typeof out.file!=='string'||!out.file||out.file.length>1100||out.kind!==kind)throw TypeError('Closed source site required');
  const locations=['line','column','endLine','endColumn'];for(let i=0;i<locations.length;i++)if(!integer(out[locations[i]])||out[locations[i]]<1)throw TypeError('Site location required');
  if(out.endLine<out.line||out.endLine===out.line&&out.endColumn<out.column)throw TypeError('Site range required');return dto(out);
 }
 if(typeof page!=='string'||!page||page.length>128||typeof enabled!=='boolean')throw TypeError('Bounded page and enabled required');
 const ap=own(policy,'app'),appSite=site(own(ap,'appSite'),'app-hook-function'),bindingSite=site(own(ap,'bindingSite'),'app-hook-binding');
 if(appSite.functionName!=='App'||bindingSite.callName!=='useReducer'||bindingSite.todosBinding!=='todos'||bindingSite.dispatchBinding!=='dispatch'||appSite.id===bindingSite.id||appSite.file!==bindingSite.file||appSite.sourceDigest!==bindingSite.sourceDigest)throw TypeError('One original App/useReducer binding required');
 if(bindingSite.line<appSite.line||bindingSite.line===appSite.line&&bindingSite.column<appSite.column||bindingSite.endLine>appSite.endLine||bindingSite.endLine===appSite.endLine&&bindingSite.endColumn>appSite.endColumn)throw TypeError('Binding must lie inside App');
 const np=own(policy,'native'),nativeFile=own(np,'file'),nativeDigest=own(np,'sourceDigest'),version=own(np,'version'),nativeVersionAdmitted=own(np,'nativeVersionAdmitted');
 if(typeof nativeFile!=='string'||!nativeFile||!hex(nativeDigest)||version!=='19.2.5'||typeof nativeVersionAdmitted!=='boolean')throw TypeError('Declared native source policy required');
 const returns=list(),renders=list(),returnTags=create(null),renderTags=create(null),all=create(null),returnNames=['mountReducer','updateReducerImpl','rerenderReducer'],renderNames=['renderWithHooks','renderWithHooksAgain'];
 function sites(input,kind,names,out,tags){if(!isArray(input)||input.length!==names.length)throw TypeError('Closed native site count required');for(let i=0;i<names.length;i++){const s=site(own(input,String(i)),kind);if(s.functionName!==names[i]||s.file!==nativeFile||s.sourceDigest!==nativeDigest||all[s.id])throw TypeError('Closed native site shape/source required');all[s.id]=true;tags[s.id]=s;append(out,s);}}
 sites(own(np,'returnSites'),'native-state-return',returnNames,returns,returnTags);sites(own(np,'renderSites'),'native-render-component',renderNames,renders,renderTags);
 const nativePolicy=dto({file:nativeFile,sourceDigest:nativeDigest,version,nativeVersionAdmitted,returnSites:freeze(returns),renderSites:freeze(renders)});
 let generation=0,label='initial',serial=0,identity=0,events=0,renderCount=0,nativeReturns=0,stopped=false,collecting=true,invalid=false,overflow=false,reason=null;
 let rows=list(),stack=list(),handles=new WM(),renderMap=new WM(),tupleMap=new WM(),ids=new WM(),tokens=new WS();
 const live=()=>enabled&&supported&&!stopped&&collecting&&!invalid&&!overflow,window=()=>dto({id:page+':native-state-reference:window:'+generation,label});
 function id(value){let n=read(ids,value);if(!n){n=page+':native-state-reference:'+generation+':object:'+ ++identity;put(ids,value,n);}return n;}
 const number=role=>page+':native-state-reference:'+generation+':'+role+':'+ ++serial,current=()=>stack.length?stack[stack.length-1]:null;
 function clear(){rows=list();stack=list();handles=new WM();renderMap=new WM();tupleMap=new WM();ids=new WM();renderCount=0;nativeReturns=0;}
 function refuse(why,capacity=false){reason=why;if(capacity)overflow=true;else invalid=true;clear();}
 function tick(){if(events>=4096){refuse('Reference event capacity refused',true);return false;}events++;return true;}
 function appEnter(token,component,tag){
  if(!live())return token;
  try{if(!tick())return token;if(rows.length>=64){refuse('App frame capacity refused',true);return token;}if(typeof tag!=='string'||tag!==appSite.id||!object(token)||typeof component!=='function'||seen(tokens,token)){refuse('Invalid or reused private App frame');return token;}mark(tokens,token);const row={frameId:number('frame'),component:new Ref(component),componentId:id(component),native:null,result:null,method:null,boundState:null,boundDispatch:null,resultRecorded:false,bound:false,returned:false,closed:false};append(rows,row);append(stack,row);put(handles,token,row);}catch{refuse('App reference registration unavailable');}return token;
 }
 function nativeTap(kind,a,b,c,d,e,f){
  if(!live())return a;
  try{
   if(kind==='render-component'){
    if(!tick())return a;const s=typeof c==='string'&&c.length===64?renderTags[c]:null;
    if(!s||!object(a)||typeof b!=='function'){refuse('Unadmitted native render event');return a;}if(renderCount>=128){refuse('Native render metadata capacity refused',true);return a;}
    renderCount++;put(renderMap,a,{id:number('render'),component:new Ref(b),componentId:id(b),fiberId:id(a),site:s});return a;
   }
   if(kind!=='state-result')return a;
   const owner=current();if(!owner)return a;if(!tick())return a;
   const s=typeof d==='string'&&d.length===64?returnTags[d]:null,render=object(c)?read(renderMap,c):null;
   if(!s||owner.returned||owner.closed||owner.native||!isArray(a)||!object(b)||!object(c)||!isArray(e)||typeof f!=='function'||!render||weak(render.component)!==weak(owner.component)||read(tupleMap,a)){refuse('No unique same-App native return reference');return a;}
   const row={render,site:s,tuple:new Ref(a),state:new Ref(e),dispatch:new Ref(f),hook:new Ref(b),fiber:new Ref(c),tupleId:id(a),stateId:id(e),dispatchId:id(f),hookId:id(b),fiberId:id(c)};
   owner.native=row;put(tupleMap,a,row);nativeReturns++;
  }catch{refuse('Native supplied references unavailable');}
  return a;
 }
 function result(token,tuple,method,tag){
  if(!live())return tuple;
  try{if(!tick())return tuple;const row=object(token)?read(handles,token):null;if(typeof tag!=='string'||tag!==bindingSite.id||!row||row!==current()||row.resultRecorded||row.returned||row.closed||!row.native||weak(row.native.tuple)!==tuple||typeof method!=='function'){refuse('App result differs from its native return tuple');return tuple;}row.result=new Ref(tuple);row.resultId=id(tuple);row.method=new Ref(method);row.methodId=id(method);row.resultRecorded=true;}catch{refuse('App result reference unavailable');}
  return tuple;
 }
 function bound(token,tuple,todos,dispatch,tag){
  if(!live())return;
  try{if(!tick())return;const row=object(token)?read(handles,token):null;if(typeof tag!=='string'||tag!==bindingSite.id||!row||row!==current()||!row.resultRecorded||row.bound||row.returned||row.closed||weak(row.result)!==tuple||weak(row.native.state)!==todos||weak(row.native.dispatch)!==dispatch){refuse('Already-bound values differ from native return values');return;}row.boundState=new Ref(todos);row.boundDispatch=new Ref(dispatch);row.boundStateId=id(todos);row.boundDispatchId=id(dispatch);row.bound=true;}catch{refuse('Bound source references unavailable');}
 }
 function returned(token,value){
  if(!live())return value;
  try{if(!tick())return value;const row=object(token)?read(handles,token):null;if(!row||row!==current()||!row.bound||row.returned||row.closed){refuse('Invalid source App return');return value;}row.returned=true;}catch{refuse('App return bookkeeping unavailable');}
  return value;
 }
 function exit(token){
  if(!live())return;
  try{if(!tick())return;const row=object(token)?read(handles,token):null;if(!row||row!==current()||!row.returned||row.closed){refuse('Source App did not complete');return;}row.closed=true;stack.length--;}catch{refuse('App exit bookkeeping unavailable');}
 }
 function snapshotFor(selected=null){
  const audit=list(),candidates=list(),links=list();let eligible=enabled&&supported&&!stopped&&!collecting&&!invalid&&!overflow&&stack.length===0,why=reason;
  try{
   for(let i=0;i<rows.length;i++){const r=rows[i],n=r.native;append(audit,dto({frameId:r.frameId,componentId:r.componentId,resultRecorded:r.resultRecorded,bound:r.bound,returned:r.returned,closed:r.closed}));if(!n||!r.resultRecorded||!r.bound||!r.returned||!r.closed||!object(weak(r.component))||weak(n.render.component)!==weak(r.component)||!object(weak(n.tuple))||weak(n.tuple)!==weak(r.result)||!object(weak(n.state))||weak(n.state)!==weak(r.boundState)||!object(weak(n.dispatch))||weak(n.dispatch)!==weak(r.boundDispatch)||!object(weak(n.hook))||!object(weak(n.fiber))||!object(weak(r.method))){eligible=false;why=why||'Complete current weak references unavailable';continue;}
    append(candidates,{row:r,link:dto({frameId:r.frameId,appSite,bindingSite,componentId:r.componentId,nativeComponentId:n.render.componentId,nativeRenderId:n.render.id,nativeRenderSite:n.render.site,nativeReturnSite:n.site,nativeFiberId:n.fiberId,nativeHookId:n.hookId,nativeTupleId:n.tupleId,sourceTupleId:r.resultId,nativeStateId:n.stateId,boundTodosId:r.boundStateId,nativeDispatchId:n.dispatchId,boundDispatchId:r.boundDispatchId,sourceMethodId:r.methodId,nativeReturnedStateReferenceAssociation:'Observed',nativeStateOrigin:U,tupleIndexOrigin:U})});}
   if(eligible)for(let i=0;i<candidates.length;i++)if(!selected||selected===candidates[i].row)append(links,candidates[i].link);
  }catch{eligible=false;why='Reference snapshot unavailable';}
  const output=eligible?links:list();return dto({schema:'stateatom.native-state-return-reference/1',scope:'Conditional exact source App/native renderer/returned tuple and already-computed state references from supplied declared events; not native-origin attestation',page,window:window(),status:output.length?'Observed':U,reason:output.length?null:stopped?'Observer stopped':!supported?'WeakRef unavailable':why||(collecting?'Window not sealed':'No complete reference association'),collecting,sealed:!collecting&&!stopped,frames:freeze(audit),links:freeze(output),appSite,bindingSite,nativePolicy,sourceOnly:true,nativeOrigin:'NotAttested',nativeStateOrigin:U,tupleIndexOrigin:U,publicHookKind:U,stateRevision:U,propStorage:U,propTransfer:U,fieldOwnership:U,componentInstance:U,selectedPropertyOrigin:U,fullPath:false});
 }
 const snapshot=()=>snapshotFor();
 function lookupFrame(token){const row=object(token)?read(handles,token):null;if(row)return snapshotFor(row);const s=snapshotFor();return dto({...s,status:U,links:freeze(list())});}
 const retention=()=>dto({frames:rows.length,renders:renderCount,nativeReturns,active:stack.length,events,window:generation,stopped,collecting,invalid,overflow,available:supported});
 function sealWindow(){if(stopped)return dto({sealed:false,snapshot:snapshot(),retention:retention()});if(stack.length)refuse('App frame incomplete at seal');collecting=false;return dto({sealed:true,snapshot:snapshot(),retention:retention()});}
 function startWindow(next){if(stopped||typeof next!=='string'||!next||next.length>80)return null;clear();generation++;label=next;serial=0;identity=0;events=0;invalid=false;overflow=false;reason=null;collecting=true;return window();}
 function stop(){stopped=true;collecting=false;clear();tokens=new WS();}
 return dto({appEnter,nativeTap,result,bound,returned,exit,snapshot,lookupFrame,retention,sealWindow,startWindow,stop});
}
