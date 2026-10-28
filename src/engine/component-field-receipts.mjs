// SPDX-License-Identifier: Apache-2.0
// Private original-read/native-frame bridge; not writer or ordinary-data authority.
import {capturePrivateCollections} from './private-collections.mjs';
export function createComponentFieldReceipts({page,weakRef=globalThis.WeakRef}={}){
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function'),apply=Reflect.apply,same=Object.is,isArray=Array.isArray;
 const describe=Object.getOwnPropertyDescriptor,deref=typeof weakRef==='function'?describe(weakRef.prototype,'deref')?.value:null,ref=v=>new weakRef(v),read=r=>r?apply(deref,r,[]):undefined;
 const collections=capturePrivateCollections(),pop=Array.prototype.pop,define=Object.defineProperty,create=Object.create,assign=Object.assign;
 const append=(a,v)=>{const d=create(null);d.value=v;d.writable=true;d.enumerable=true;d.configurable=true;define(a,a.length,d);};
 let sites=collections.map(),transferSites=collections.map(),emissions=collections.weakMap(),frames=collections.weakMap(),tokens=collections.weakMap(),sourceTokens=collections.weakMap(),elements=collections.weakMap(),stack=[],stopped=false,refused=typeof deref!=='function',serial=0,events=0;
 const live=()=>!stopped&&!refused;
 function clear(){emissions=collections.weakMap();frames=collections.weakMap();tokens=collections.weakMap();sourceTokens=collections.weakMap();elements=collections.weakMap();stack=[];}
 const safe=fn=>function(){if(!live())return null;try{if(++events>4096){refused=true;clear();return null;}return apply(fn,undefined,arguments);}catch{refused=true;clear();return null;}};
 const id=s=>typeof s==='string'&&s.length>0&&s.length<=128;
 const register=safe(site=>{
  if(!site||!id(site.id)||!id(site.read?.id)||!id(site.field)||!isArray(site.hosts)||!site.hosts.length||site.hosts.length>32||sites.has(site.id)||sites.size>=64)return false;
  const hosts=collections.set();for(let i=0;i<site.hosts.length;i++){const key=site.hosts[i]?.id;if(!id(key)||hosts.has(key))return false;hosts.add(key);}sites.set(site.id,{id:site.id,readId:site.read.id,field:site.field,parameterProp:typeof site.parameterProp==='string'?site.parameterProp:null,hosts});return true;
 });
 const registerTransfers=safe(site=>{
  if(!site||!id(site.id)||!isArray(site.inputs)||site.inputs.length!==1||!isArray(site.outputs)||!site.outputs.length||site.outputs.length>32||transferSites.size>=64||transferSites.has(site.id))return false;
  const input=site.inputs[0];if(!id(input.id)||input.kind!=='parameter'&&input.kind!=='state-binding'||input.kind==='parameter'&&!id(input.prop))return false;
  const outputs=collections.map();for(let i=0;i<site.outputs.length;i++){const output=site.outputs[i];if(!id(output.id)||!id(output.prop)||outputs.has(output.id)||output.callback&&output.callback.method!=='map')return false;outputs.set(output.id,{id:output.id,prop:output.prop,callback:output.callback?{id:output.callback.id,method:'map'}:null});}
  transferSites.set(site.id,{id:site.id,input:{id:input.id,prop:input.prop,kind:input.kind},outputs});return true;
 });
 const native=safe((kind,a,b,c)=>{
  if(kind==='jsx-element-return'){if(object(a)&&object(b))elements.set(a,ref(b));return null;}
  if(kind==='component-call-begin'){
   if(!object(a)||typeof b!=='function'||!object(c)||stack.length>=32){refused=true;clear();return null;}
   const token={},frame=assign(create(null),{id:page+':component-read:'+ ++serial,fiber:ref(a),component:ref(b),props:ref(c),phase:'active',invalid:false,entered:false,hasRead:false,hosts:[],operands:collections.set()});
   frames.set(a,frame);tokens.set(token,frame);append(stack,frame);return token;
  }
  const frame=object(a)?tokens.get(a):null;if(!frame||(stack.length?stack[stack.length-1]:null)!==frame){refused=true;clear();return null;}
  if(kind==='component-call-return'){if(frame.phase!=='active')frame.invalid=true;frame.phase='returned';return null;}
  if(kind==='component-call-throw'){frame.invalid=true;frame.phase='thrown';return null;}
  if(kind==='component-call-end'){if(frame.phase!=='returned')frame.invalid=true;frame.phase='complete';frame.scalar=undefined;apply(pop,stack,[]);return null;}
  frame.invalid=true;return null;
 });
 const source=safe((kind,a,b,c)=>{
  if(kind==='enter'){
   const frame=(stack.length?stack[stack.length-1]:null);if(!frame)return null;
   if(frame.phase!=='active'||frame.entered||read(frame.component)!==a||!sites.has(b)||!object(c)){frame.invalid=true;return null;}
   frame.entered=true;frame.site=sites.get(b);frame.row=ref(c);const token={};sourceTokens.set(token,frame);return token;
  }
  const frame=object(a)?sourceTokens.get(a):null;if(!frame)return null;
  if(frame.phase!=='active'||(stack.length?stack[stack.length-1]:null)!==frame){frame.invalid=true;return null;}
  if(kind==='read'){
   if(frame.hasRead||b!==frame.site.readId||!(typeof c==='string'||typeof c==='number')){frame.invalid=true;return null;}
   frame.hasRead=true;frame.scalar=c;return null;
  }
  if(!frame.hasRead||!frame.site.hosts.has(b)){frame.invalid=true;return null;}
  if(kind==='operand'){if(frame.operands.has(b)||!same(frame.scalar,c))frame.invalid=true;else frame.operands.add(b);return null;}
  if(kind==='element'){
   const props=object(c)?read(elements.get(c)):null;if(!frame.operands.has(b)||!props||frame.hosts.length>=32){frame.invalid=true;return null;}
   for(let i=0;i<frame.hosts.length;i++)if(frame.hosts[i].siteId===b){frame.invalid=true;return null;}
   // Consume native element->props synchronously; do not retain discarded elements.
   elements.delete(c);append(frame.hosts,{siteId:b,props:ref(props)});return null;
  }
  frame.invalid=true;return null;
 });
 const transferSource=safe((kind,a,b,c,d)=>{
  if(kind==='enter'){
   const frame=(stack.length?stack[stack.length-1]:null);if(!frame)return null;
   if(frame.phase!=='active'||frame.transferEntered||read(frame.component)!==a||!transferSites.has(b)){frame.invalid=true;return null;}
   frame.transferEntered=true;frame.transferSite=transferSites.get(b);frame.pending=collections.map();frame.callbacks=collections.map();frame.outputCount=0;const token={};sourceTokens.set(token,frame);return token;
  }
  const frame=object(a)?sourceTokens.get(a):null;if(!frame)return null;
  if(!frame.transferEntered||frame.phase!=='active'||(stack.length?stack[stack.length-1]:null)!==frame){frame.invalid=true;return null;}
  if(kind==='input'){if(frame.input||b!==frame.transferSite.input.id||!object(c)){frame.invalid=true;return null;}frame.input=ref(c);return null;}
  const meta=frame.transferSite.outputs.get(b);if(!meta){frame.invalid=true;return null;}
  if(kind==='callback'){if(!meta.callback||!object(c)||!object(d)||frame.pending.has(b)){frame.invalid=true;return null;}frame.callbacks.set(b,{row:ref(c),collection:ref(d)});return null;}
  if(kind==='prop'){
   const callback=frame.callbacks.get(b);if(!frame.input||frame.pending.has(b)||!object(c)||meta.callback&&(!callback||read(callback.row)!==c)){frame.invalid=true;return null;}
   frame.pending.set(b,{value:ref(c),callback});frame.callbacks.delete(b);return null;
  }
  if(kind==='element'){
   const pending=frame.pending.get(b),props=object(c)?read(elements.get(c)):null;
   if(!pending||!props||emissions.has(props)||++frame.outputCount>128){frame.invalid=true;return null;}
   frame.pending.delete(b);elements.delete(c);emissions.set(props,{frame,meta,value:pending.value,callback:pending.callback});return null;
  }
  frame.invalid=true;return null;
 });
 const incomingTransfer=safe((childProps,prop,value)=>{
  const emission=object(childProps)?emissions.get(childProps):null;if(!emission)return null;const{frame,meta}=emission;
  if(frame.invalid||frame.phase!=='complete'||!frame.transferEntered||frame.pending.size||meta.prop!==prop||read(emission.value)!==value)return null;
  const fiber=read(frame.fiber),component=read(frame.component),props=read(frame.props),input=read(frame.input);if(!fiber||!component||!props||!input||frames.get(fiber)!==frame)return null;
  let callback=null;if(meta.callback){const row=read(emission.callback?.row),collection=read(emission.callback?.collection);if(!row||!collection)return null;callback={...meta.callback,row,collection};}
  return{fiber,component,props,invocationId:frame.id,input:{...frame.transferSite.input,value:input},output:{siteId:meta.id,prop:meta.prop,value,callback}};
 });
 const lookup=safe((fiber,component,props,hostProps)=>{
  const frame=frames.get(fiber);if(!frame||frame.invalid||frame.phase!=='complete'||!frame.entered||!frame.hasRead||read(frame.fiber)!==fiber||read(frame.component)!==component||read(frame.props)!==props)return null;
  const row=read(frame.row);if(!row)return null;let match=null;
  for(let i=0;i<frame.hosts.length;i++)if(read(frame.hosts[i].props)===hostProps){if(match)return null;match=frame.hosts[i];}
  return match?{row,field:frame.site.field,parameterProp:frame.site.parameterProp,siteId:frame.site.readId,componentSiteId:frame.site.id,hostSiteId:match.siteId,invocationId:frame.id}:null;
 });
 return{register,native,source,lookup,registerTransfers,transferSource,incomingTransfer,stop(){stopped=true;sites.clear();transferSites.clear();clear();}};
}
