// SPDX-License-Identifier: Apache-2.0
// Private original-read/native-frame bridge; not writer or ordinary-data authority.
import {capturePrivateCollections} from './private-collections.mjs';
export function createComponentFieldReceipts({page,weakRef=globalThis.WeakRef}={}){
 const object=v=>v!==null&&(typeof v==='object'||typeof v==='function'),apply=Reflect.apply,same=Object.is,isArray=Array.isArray;
 const describe=Object.getOwnPropertyDescriptor,deref=typeof weakRef==='function'?describe(weakRef.prototype,'deref')?.value:null,ref=v=>new weakRef(v),read=r=>r?apply(deref,r,[]):undefined;
 const collections=capturePrivateCollections(),push=Array.prototype.push,pop=Array.prototype.pop;
 let sites=collections.map(),frames=collections.weakMap(),tokens=collections.weakMap(),sourceTokens=collections.weakMap(),elements=collections.weakMap(),stack=[],stopped=false,refused=typeof deref!=='function',serial=0,events=0;
 const live=()=>!stopped&&!refused;
 function clear(){frames=collections.weakMap();tokens=collections.weakMap();sourceTokens=collections.weakMap();elements=collections.weakMap();stack=[];}
 const safe=fn=>function(){if(!live())return null;try{if(++events>4096){refused=true;clear();return null;}return apply(fn,undefined,arguments);}catch{refused=true;clear();return null;}};
 const id=s=>typeof s==='string'&&s.length>0&&s.length<=128;
 const register=safe(site=>{
  if(!site||!id(site.id)||!id(site.read?.id)||!id(site.field)||!isArray(site.hosts)||!site.hosts.length||site.hosts.length>32||sites.has(site.id)||sites.size>=64)return false;
  const hosts=collections.set();for(let i=0;i<site.hosts.length;i++){const key=site.hosts[i]?.id;if(!id(key)||hosts.has(key))return false;hosts.add(key);}sites.set(site.id,{id:site.id,readId:site.read.id,field:site.field,hosts});return true;
 });
 const native=safe((kind,a,b,c)=>{
  if(kind==='jsx-element-return'){if(object(a)&&object(b))elements.set(a,ref(b));return null;}
  if(kind==='component-call-begin'){
   if(!object(a)||typeof b!=='function'||!object(c)||stack.length>=32){refused=true;clear();return null;}
   const token={},frame={id:page+':component-read:'+ ++serial,fiber:ref(a),component:ref(b),props:ref(c),phase:'active',invalid:false,entered:false,hasRead:false,hosts:[],operands:collections.set()};
   frames.set(a,frame);tokens.set(token,frame);apply(push,stack,[frame]);return token;
  }
  const frame=object(a)?tokens.get(a):null;if(!frame||stack[stack.length-1]!==frame){refused=true;clear();return null;}
  if(kind==='component-call-return'){if(frame.phase!=='active')frame.invalid=true;frame.phase='returned';return null;}
  if(kind==='component-call-throw'){frame.invalid=true;frame.phase='thrown';return null;}
  if(kind==='component-call-end'){if(frame.phase!=='returned')frame.invalid=true;frame.phase='complete';frame.scalar=undefined;apply(pop,stack,[]);return null;}
  frame.invalid=true;return null;
 });
 const source=safe((kind,a,b,c)=>{
  if(kind==='enter'){
   const frame=stack[stack.length-1];if(!frame)return null;
   if(frame.phase!=='active'||frame.entered||read(frame.component)!==a||!sites.has(b)||!object(c)){frame.invalid=true;return null;}
   frame.entered=true;frame.site=sites.get(b);frame.row=ref(c);const token={};sourceTokens.set(token,frame);return token;
  }
  const frame=object(a)?sourceTokens.get(a):null;if(!frame)return null;
  if(frame.phase!=='active'||stack[stack.length-1]!==frame){frame.invalid=true;return null;}
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
   elements.delete(c);apply(push,frame.hosts,[{siteId:b,props:ref(props)}]);return null;
  }
  frame.invalid=true;return null;
 });
 const lookup=safe((fiber,component,props,hostProps)=>{
  const frame=frames.get(fiber);if(!frame||frame.invalid||frame.phase!=='complete'||!frame.entered||!frame.hasRead||read(frame.fiber)!==fiber||read(frame.component)!==component||read(frame.props)!==props)return null;
  const row=read(frame.row);if(!row)return null;let match=null;
  for(let i=0;i<frame.hosts.length;i++)if(read(frame.hosts[i].props)===hostProps){if(match)return null;match=frame.hosts[i];}
  return match?{row,field:frame.site.field,siteId:frame.site.readId,componentSiteId:frame.site.id,hostSiteId:match.siteId,invocationId:frame.id}:null;
 });
 return{register,native,source,lookup,stop(){stopped=true;sites.clear();clear();}};
}
