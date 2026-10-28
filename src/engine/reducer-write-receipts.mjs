// SPDX-License-Identifier: Apache-2.0
// Private compiler/native bridge prerequisite. Historical write occurrence only;
// supplied applied revision is trusted adapter input, not caller-authenticated proof.
export function createReducerWriteReceipts({page,weakRef=globalThis.WeakRef}={}){
 if(typeof page!=='string'||!page||page.length>160)throw TypeError('Bounded page identity required');
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function'),apply=Reflect.apply;
 const deref=typeof weakRef==='function'?Object.getOwnPropertyDescriptor(weakRef.prototype,'deref')?.value:null;
 const ref=v=>new weakRef(v),read=r=>apply(deref,r,[]);
 const table=Type=>{const value=new Type();return{get:value.get.bind(value),set:value.set.bind(value),has:value.has.bind(value),clear:value.clear?.bind(value)};};
 let registrations=table(WeakMap),native=table(WeakMap),sources=table(WeakMap),revisions=table(Map),stack=[];
 const push=Function.call.bind(Array.prototype.push),pop=Function.call.bind(Array.prototype.pop);
 let stopped=false,refused=typeof deref!=='function',reason=refused?'Weak references unavailable':null,serial=0,calls=0,writes=0,appliedCount=0;
 const live=()=>!stopped&&!refused;
 function refuse(why){refused=true;reason=why;stack=[];native=table(WeakMap);sources=table(WeakMap);revisions.clear();}
 const safe=fn=>(...args)=>{if(!live())return null;try{return fn(...args);}catch{refuse('Receipt bookkeeping unavailable');return null;}};
 const register=safe((reducer,siteIds)=>{
  if(typeof reducer!=='function'||!Array.isArray(siteIds)||!siteIds.length||siteIds.length>64||registrations.has(reducer))return false;
  const ids=new Set();for(const id of siteIds){if(typeof id!=='string'||!id||id.length>128||ids.has(id))return false;ids.add(id);}
  registrations.set(reducer,ids);return true;
 });
 const begin=safe((token,reducer,input,action)=>{
  if(!object(token)||native.has(token)||typeof reducer!=='function'||!object(input)||!object(action)){refuse('Invalid native call entry');return;}
  if(++calls>512||stack.length>=16){refuse('Native call capacity exceeded');return;}
  const frame={id:page+':reducer-call:'+ ++serial,reducer:ref(reducer),input:ref(input),action:ref(action),phase:'active',entered:false,exited:false,invalid:false,writes:[]};native.set(token,frame);push(stack,frame);
 });
 const source=safe((kind,a,b,c)=>{
  if(kind==='enter'){
   const frame=stack[stack.length-1];if(!frame)return null;
   if(frame.phase!=='active'||frame.entered||read(frame.reducer)!==a||read(frame.input)!==b||read(frame.action)!==c||!registrations.has(a)){frame.invalid=true;return null;}
   frame.entered=true;const token={};sources.set(token,frame);return token;
  }
  const frame=object(a)?sources.get(a):null;if(!frame)return null;
  // A delayed original callback may still construct a new object after lexical
  // exit: it gets no receipt. Duplicate exit/unknown events invalidate this frame.
  if(frame.phase!=='active'||frame.exited){if(kind!=='write')frame.invalid=true;return null;}
  if(stack[stack.length-1]!==frame){frame.invalid=true;return null;}
  if(kind==='exit'){frame.exited=true;return null;}
  if(kind!=='write'){frame.invalid=true;return null;}
  const reducer=read(frame.reducer),sites=reducer&&registrations.get(reducer);
  if(!sites?.has(b)||!object(c)){frame.invalid=true;return null;}
  if(++writes>2048||frame.writes.length>=128){refuse('Field write capacity exceeded');return null;}
  for(const previous of frame.writes)if(read(previous.row)===c){frame.invalid=true;return null;}
  push(frame.writes,{siteId:b,row:ref(c)});return null;
 });
 const complete=safe((token,result)=>{
  const frame=object(token)?native.get(token):null;
  if(!frame||frame.phase!=='active'||stack[stack.length-1]!==frame){refuse('Invalid native call completion');return;}
  pop(stack);frame.phase='complete';if(!object(result)||!frame.entered||!frame.exited)frame.invalid=true;else frame.result=ref(result);
 });
 const discard=safe(token=>{
  const frame=object(token)?native.get(token):null;if(!frame)return;
  if(frame.phase==='active'){if(stack[stack.length-1]!==frame){refuse('Invalid native abort order');return;}pop(stack);}
  if(frame.phase==='applied'){refuse('Applied call discarded');return;}frame.phase='discarded';frame.writes=[];
 });
 const applied=safe((token,{result,input,action,reducer,revisionId}={})=>{
  const frame=object(token)?native.get(token):null;
  if(!frame||frame.phase==='discarded')return;
  if(frame.phase!=='complete'||typeof revisionId!=='string'||!revisionId||revisionId.length>160||revisions.has(revisionId)){refuse('Ambiguous applied call or revision');return;}
  frame.phase='applied';
  if(frame.invalid||read(frame.result)!==result||read(frame.input)!==input||read(frame.action)!==action||read(frame.reducer)!==reducer){frame.invalid=true;return;}
  if(++appliedCount>128){refuse('Applied receipt capacity exceeded');return;}
  frame.revisionId=revisionId;revisions.set(revisionId,frame);
 });
 const unknown=why=>({schema:'stateatom.reducer-write-receipt/1',page,status:'Unknown/Unsupported',reason:why,write:null,scope:'Field creation during the exact completed reducer call linked by the trusted native adapter to an applied revision; historical occurrence only',currentMembership:'Unknown/Unsupported',fieldOwnership:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false});
 function lookup({row,result,reducer,revisionId}={}){
  if(!live())return unknown(stopped?'Observer stopped':reason);
  try{
   const frame=revisions.get(revisionId);if(!frame||frame.invalid||!object(row)||!object(result)||typeof reducer!=='function')return unknown('No exact applied field receipt');
   const originalResult=read(frame.result),originalReducer=read(frame.reducer);if(!originalResult||!originalReducer){frame.invalid=true;return unknown('Original call reference unavailable');}
   if(originalResult!==result||originalReducer!==reducer)return unknown('No exact applied field receipt');
   if(!read(frame.input)||!read(frame.action)){frame.invalid=true;return unknown('Original call reference unavailable');}
   let match=null;for(const write of frame.writes){const current=read(write.row);if(!current){frame.invalid=true;return unknown('Original row reference unavailable');}if(current===row){if(match)return unknown('Ambiguous original row write');match=write;}}
   return match?{...unknown(null),status:'Observed',write:{callId:frame.id,revisionId:frame.revisionId,siteId:match.siteId}}:unknown('No exact applied field receipt');
  }catch{refuse('Receipt lookup unavailable');return unknown(reason);}
 }
 return Object.freeze({register,begin,source,complete,discard,applied,lookup,stop(){stopped=true;stack=[];registrations=table(WeakMap);native=table(WeakMap);sources=table(WeakMap);revisions.clear();},retention(){return{stopped,refused,calls,writes,applied:appliedCount,active:stack.length};}});
}
