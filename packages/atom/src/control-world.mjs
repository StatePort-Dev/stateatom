// SPDX-License-Identifier: Apache-2.0
// Serialized into the extension's ISOLATED world. All helpers stay inside this
// function. Native object references and a live private Port, never saved data,
// bind its owner. This module alone does not grant Chrome or production access.
export async function nativeControlOperation(input) {
 const failure=(code,attempted=false)=>({ok:false,code,attempted});
 let attempted=false,registry,dispose=()=>{};
 try {
  let nodes=0;
  function data(value,depth=0){
   if(++nodes>4096||depth>12)throw Error('INVALID_CONTROL_MESSAGE');
   if(value===null||['boolean','number','string'].includes(typeof value)){if(typeof value==='string'&&value.length>65536)throw Error('INVALID_CONTROL_MESSAGE');return value;}
   if(!value||typeof value!=='object'||!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('INVALID_CONTROL_MESSAGE');
   const array=Array.isArray(value),out=array?[]:{};
   for(const key of Reflect.ownKeys(value)){
    if(array&&key==='length')continue;
    const d=Object.getOwnPropertyDescriptor(value,key);
    if(typeof key!=='string'||['__proto__','constructor','prototype'].includes(key)||!d?.enumerable||!Object.hasOwn(d,'value')||array&&!/^(0|[1-9]\d*)$/.test(key))throw Error('INVALID_CONTROL_MESSAGE');
    out[key]=data(d.value,depth+1);
   }
   if(array&&(out.length!==value.length||Object.keys(out).length!==value.length))throw Error('INVALID_CONTROL_MESSAGE');return out;
  }
  const p=data(input),base=['version','operation','session','document','origin'];
  if(!p||Array.isArray(p)||p.version!==1||!['open','read','write','close'].includes(p.operation))return failure('INVALID_CONTROL_MESSAGE');
  const required=p.operation==='write'?[...base,'resource','value']:base,allowed=p.operation==='close'?[...required,'reason']:required;
  if(required.some(k=>!Object.hasOwn(p,k))||Object.keys(p).some(k=>!allowed.includes(k))||typeof p.session!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(p.session)||typeof p.document!=='string'||!p.document||p.document.length>512||typeof p.origin!=='string'||p.origin.length>4096||p.reason!==undefined&&(typeof p.reason!=='string'||p.reason.length>512))return failure('INVALID_CONTROL_MESSAGE');
  let origin;try{origin=new URL(p.origin);}catch{return failure('INVALID_CONTROL_MESSAGE');}
  if(!['http:','https:'].includes(origin.protocol)||origin.origin!==p.origin||origin.username||origin.password||new TextEncoder().encode(JSON.stringify(p)).length>65536)return failure('INVALID_CONTROL_MESSAGE');
  if(p.operation==='write'&&(!p.resource||typeof p.resource!=='object'||Array.isArray(p.resource)||!['string','number','boolean'].includes(typeof p.value)))return failure('INVALID_CONTROL_MESSAGE');
  if(typeof document==='undefined'||typeof chrome==='undefined'||!chrome.runtime?.connect||typeof HTMLInputElement==='undefined'||typeof MutationObserver==='undefined')return failure('CONTROL_ENVIRONMENT_UNAVAILABLE');
  const KEY='__stateport_atom_control_world_v1',nativeDocument=document;
  const actualURL=Object.getOwnPropertyDescriptor(Document.prototype,'URL').get.call(nativeDocument);
  if(new URL(actualURL).origin!==p.origin)return failure('ORIGIN_DENIED');
  const slot=Object.getOwnPropertyDescriptor(globalThis,KEY);
  if(slot&&!Object.hasOwn(slot,'value'))return failure('CONTROL_WORLD_BUSY');
  registry=slot?.value;
  if(registry&&(!registry.privateControlWorld||registry.document!==nativeDocument))return failure('CONTROL_WORLD_BUSY');
  const get=(prototype,key,node)=>Object.getOwnPropertyDescriptor(prototype,key).get.call(node);
  const set=(prototype,key,node,value)=>Object.getOwnPropertyDescriptor(prototype,key).set.call(node,value);
  const attr=(node,name)=>Element.prototype.getAttribute.call(node,name);
  const matches=(node,selector)=>Element.prototype.matches.call(node,selector);
  const equal=(a,b)=>{if(Object.is(a,b))return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(k=>Object.hasOwn(b,k)&&equal(a[k],b[k]));};
  const scalar=value=>['string','number','boolean'].includes(typeof value)&&!(typeof value==='number'&&(!Number.isFinite(value)||Object.is(value,-0)))&&!(typeof value==='string'&&(value.length>4096||new TextEncoder().encode(value).length>4096));
  const uuid=()=>{const b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;const h=[...b].map(v=>v.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);};
  function selector(node){
   const id=attr(node,'id');if(id&&id.length<=256){const css='#'+CSS.escape(id);if(Document.prototype.querySelectorAll.call(nativeDocument,css).length===1)return css;}
   const parts=[];let current=node;
   for(let depth=0;current&&depth<24;depth++){
    const tag=get(Element.prototype,'localName',current);let index=1,sibling=get(Element.prototype,'previousElementSibling',current),count=0;
    while(sibling){if(++count>512)throw Error('SELECTOR_LIMIT');if(get(Element.prototype,'localName',sibling)===tag)index++;sibling=get(Element.prototype,'previousElementSibling',sibling);}
    parts.unshift(tag+':nth-of-type('+index+')');if(parts.join(' > ').length>1024)throw Error('SELECTOR_LIMIT');current=get(Node.prototype,'parentElement',current);
   }
   if(current)throw Error('SELECTOR_LIMIT');return parts.join(' > ');
  }
  function facts(node){
   if(!get(Node.prototype,'isConnected',node)||Node.prototype.getRootNode.call(node)!==nativeDocument)throw Error('STALE_CONTROL');
   const label=selector(node);if(attr(node,'is'))throw Error('CUSTOM_CONTROL_UNSUPPORTED');
   let control,prototype,value,options;
   if(node instanceof HTMLInputElement){control=get(HTMLInputElement.prototype,'type',node);if(!['text','number','checkbox'].includes(control))throw Error('CONTROL_TYPE_UNSUPPORTED');prototype=HTMLInputElement.prototype;}
   else if(node instanceof HTMLTextAreaElement){control='textarea';prototype=HTMLTextAreaElement.prototype;}
   else if(node instanceof HTMLSelectElement){control='select';prototype=HTMLSelectElement.prototype;if(get(prototype,'multiple',node))throw Error('MULTIPLE_SELECT_UNSUPPORTED');}
   else throw Error('CONTROL_TYPE_UNSUPPORTED');
   if(matches(node,':disabled'))throw Error('CONTROL_DISABLED');
   if(control!=='select'&&control!=='checkbox'&&get(prototype,'readOnly',node))throw Error('CONTROL_READONLY');
   if(control==='checkbox'&&get(prototype,'indeterminate',node))throw Error('INDETERMINATE_UNSUPPORTED');
   const validity=get(prototype,'validity',node);if(get(ValidityState.prototype,'customError',validity))throw Error('CUSTOM_VALIDITY_UNSUPPORTED');
   const constraints={};for(const name of ['min','max','step','required','minlength','maxlength','pattern','value']){if(name==='value'&&control!=='number'){constraints[name]=null;continue;}const v=attr(node,name);if(v!==null&&v.length>1024)throw Error('CONSTRAINT_LIMIT');constraints[name]=v;}
   if(control==='checkbox')value=get(prototype,'checked',node);
   else if(control==='number')value=get(prototype,'valueAsNumber',node);
   else value=get(prototype,'value',node);
   if(!scalar(value))throw Error('CONTROL_VALUE_UNSUPPORTED');
   if(control==='select'){
    const collection=get(prototype,'options',node);if(collection.length>128)throw Error('OPTION_LIMIT');options=[];
    for(let i=0;i<collection.length;i++){const option=collection[i];if(matches(option,':disabled'))continue;const v=get(HTMLOptionElement.prototype,'value',option);if(v.length>1024||new TextEncoder().encode(v).length>1024||options.includes(v))throw Error('OPTION_SET_UNSUPPORTED');options.push(v);}
    if(!options.length||!options.includes(value))throw Error('DISABLED_SELECTION_UNSUPPORTED');
   }
   return{selector:label,control,prototype,value,options,constraints};
  }
  function drain(entry){const pending=entry.observer.takeRecords();entry.mutations+=pending.length;}
  function descriptor(entry){
   drain(entry);const f=facts(entry.node),signature=JSON.stringify({selector:f.selector,control:f.control,value:f.value,options:f.options,constraints:f.constraints});
   if(entry.signature!==signature){entry.signature=signature;entry.values++;}
   if(![entry.events,entry.external,entry.mutations,entry.values,entry.writes].every(Number.isSafeInteger))throw Error('REVISION_LIMIT');
   const locator={document:p.document,node:'native-control:'+entry.id,selector:f.selector,control:f.control};if(f.options)locator.options=f.options;
   return{resource:{id:'control:'+entry.id,kind:'dom-control',revision:registry.epoch+':'+entry.id+':'+[entry.events,entry.mutations,entry.values,entry.writes].join(':'),type:typeof f.value,value:f.value,writable:true,locator},facts:f};
  }
  function close(reason,acknowledge=false){
   if(!registry?.active)return;
   registry.active=false;registry.armed=false;
   if(registry.startupTimer!==undefined){clearTimeout(registry.startupTimer);registry.startupTimer=undefined;}
   for(const entry of registry.entries.values()){
    EventTarget.prototype.removeEventListener.call(entry.node,'input',entry.listener,true);EventTarget.prototype.removeEventListener.call(entry.node,'change',entry.listener,true);entry.observer.disconnect();
   }
   registry.entries.clear();
   try{if(registry.message)registry.port?.onMessage.removeListener(registry.message);}catch{}
   try{if(registry.disconnected)registry.port?.onDisconnect.removeListener(registry.disconnected);}catch{}
   if(Object.getOwnPropertyDescriptor(globalThis,KEY)?.value===registry)delete globalThis[KEY];
   if(acknowledge)try{registry.port?.postMessage({version:1,kind:'closed',session:registry.session});}catch{}
   try{registry.port?.disconnect();}catch{}
  }
  dispose=close;
  function snapshot(){
   const resources=[],unsupported=registry.unsupported.slice();let bytes=0;
   for(const entry of registry.entries.values())try{const item=descriptor(entry).resource,size=new TextEncoder().encode(JSON.stringify(item)).length;if(bytes+size>60000){unsupported.push({selector:item.locator.selector,reason:'RESOURCE_BUDGET'});continue;}bytes+=size;resources.push(item);}catch(e){unsupported.push({selector:entry.label,reason:e.message});}
   return{ok:true,owner:registry.armed?'active':'pending',document:p.document,...(registry.nativeDocumentId?{nativeDocumentId:registry.nativeDocumentId}:{}),resources,unsupported:unsupported.slice(0,64),truncated:registry.truncated};
  }
  if(p.operation==='open'){
   if(registry?.active)return failure('EDITOR_BUSY');
   registry={privateControlWorld:true,active:true,armed:false,session:p.session,scope:p.document,document:nativeDocument,epoch:uuid(),entries:new Map(),unsupported:[],ownedEvents:new WeakSet(),truncated:false,nativeDocumentId:null};
   Object.defineProperty(globalThis,KEY,{configurable:true,enumerable:false,writable:false,value:registry});
   try{
    registry.port=chrome.runtime.connect({name:'stateatom.controls/1:'+p.session});
    registry.disconnected=()=>{void chrome.runtime.lastError;close('Owner disconnected');};
    registry.message=m=>{if(!registry.active)return;if(m?.version===1&&m.kind==='close'&&m.session===registry.session&&Object.keys(m).length===3){close('Owner closed',true);return;}if(m?.version!==1||m.kind!=='admit'||m.session!==registry.session||typeof m.documentId!=='string'||!m.documentId||m.documentId.length>128){close('Invalid owner admission');return;}if(registry.armed){if(m.documentId!==registry.nativeDocumentId)close('Native document changed');return;}registry.nativeDocumentId=m.documentId;registry.armed=true;if(registry.startupTimer!==undefined){clearTimeout(registry.startupTimer);registry.startupTimer=undefined;}registry.port.postMessage({version:1,kind:'ready',session:registry.session});};
    registry.port.onDisconnect.addListener(registry.disconnected);registry.port.onMessage.addListener(registry.message);
    registry.startupTimer=setTimeout(()=>close('Native owner admission timed out'),5000);
    const walker=Document.prototype.createTreeWalker.call(nativeDocument,nativeDocument,NodeFilter.SHOW_ELEMENT),started=performance.now();let count=0,node;
    while((node=TreeWalker.prototype.nextNode.call(walker))){
     if(++count>4096||performance.now()-started>100){registry.truncated=true;break;}
     if(!(node instanceof HTMLInputElement||node instanceof HTMLTextAreaElement||node instanceof HTMLSelectElement))continue;
     if(registry.entries.size>=32){registry.truncated=true;break;}
     let label;try{label=selector(node);facts(node);}catch(e){if(registry.unsupported.length<32)registry.unsupported.push({selector:label||'native control',reason:e.message});continue;}
     const entry={id:uuid(),node,label,events:0,external:0,mutations:0,values:0,writes:0,signature:null};
     entry.listener=e=>{if(!registry.active||get(Event.prototype,'target',e)!==entry.node)return;entry.events++;if(!registry.ownedEvents.has(e))entry.external++;};
     entry.observer=new MutationObserver(records=>{if(registry.active)entry.mutations+=records.length;});entry.observer.observe(node,{attributes:true,childList:true,subtree:true});
     EventTarget.prototype.addEventListener.call(node,'input',entry.listener,true);EventTarget.prototype.addEventListener.call(node,'change',entry.listener,true);registry.entries.set('control:'+entry.id,entry);
    }
    return snapshot();
   }catch(e){close('Bootstrap failed');return failure('CONTROL_BOOTSTRAP_FAILED');}
  }
  if(!registry?.active)return p.operation==='close'?{ok:true,closed:true}:failure('EDITOR_CLOSED');
  if(registry.session!==p.session||registry.scope!==p.document)return failure('EDITOR_MISMATCH');
  if(p.operation==='close'){close(p.reason||'Closed');return{ok:true,closed:true};}
  if(!registry.armed)return failure('OWNER_PENDING');
  if(p.operation==='read')return snapshot();
  const expected=p.resource,entry=registry.entries.get(expected.id);if(!entry)return failure('STALE_CONTROL');
  let current;try{current=descriptor(entry);}catch{return failure('STALE_CONTROL');}
  if(!equal(current.resource,expected))return failure('STALE_CONTROL');
  const f=current.facts,value=p.value;
  if(typeof value!==typeof f.value||!scalar(value))return failure('INVALID_CONTROL_VALUE');
  try{
   if(f.control==='select'){if(!f.options.includes(value)||f.constraints.required!==null&&value==='')return failure('INVALID_CONTROL_VALUE');}
   else if(f.control==='checkbox'){if(f.constraints.required!==null&&!value)return failure('INVALID_CONTROL_VALUE');}
   else{
    const test=Document.prototype.createElement.call(nativeDocument,f.control==='textarea'?'textarea':'input');if(f.control!=='textarea')set(HTMLInputElement.prototype,'type',test,f.control);
    for(const[name,attribute]of Object.entries(f.constraints))if(attribute!==null)Element.prototype.setAttribute.call(test,name,attribute);
    set(f.prototype,f.control==='number'?'valueAsNumber':'value',test,value);
    if(typeof value==='string')for(const[name,comparison]of[['minlength',(a,b)=>a<b],['maxlength',(a,b)=>a>b]]){const limit=f.constraints[name];if(limit!==null&&/^\d+$/.test(limit)&&comparison(value.length,Number(limit)))return failure('INVALID_CONTROL_VALUE');}
    if(!get(ValidityState.prototype,'valid',get(f.prototype,'validity',test)))return failure('INVALID_CONTROL_VALUE');
   }
  }catch{return failure('INVALID_CONTROL_VALUE');}
  const beforeExternal=entry.external;attempted=true;entry.writes++;
  set(f.prototype,f.control==='checkbox'?'checked':f.control==='number'?'valueAsNumber':'value',entry.node,value);
  for(const event of [new InputEvent('input',{bubbles:true,composed:true,inputType:'insertText',data:null}),new Event('change',{bubbles:true,composed:true})]){
   registry.ownedEvents.add(event);try{EventTarget.prototype.dispatchEvent.call(entry.node,event);}finally{registry.ownedEvents.delete(event);}
   if(!registry.active||!get(Node.prototype,'isConnected',entry.node))break;
  }
  await Promise.resolve();
  if(!registry.active)return{ok:false,status:'unconfirmed',code:'CONTROL_UNCONFIRMED',attempted:true};
  let after;try{after=descriptor(entry).resource;}catch{close('Control changed during write');return{ok:false,status:'unconfirmed',code:'CONTROL_UNCONFIRMED',attempted:true};}
  const identity=r=>({id:r.id,kind:r.kind,type:r.type,writable:r.writable,locator:r.locator});
  if(entry.external!==beforeExternal||!Object.is(after.value,value)||!equal(identity(after),identity(expected))){close('Unconfirmed native effect');return{ok:false,status:'unconfirmed',code:'CONTROL_UNCONFIRMED',attempted:true};}
  return{ok:true,status:'applied',attempted:true,after,consumption:'unknown',effect:'unknown',applicationRestored:false};
 }catch(e){
  if(attempted){
   // An already dispatched operation may have effects. Revoke this owner rather
   // than promising no write or allowing a follow-up from an unknown baseline.
   dispose('Unconfirmed native operation');
   return{ok:false,status:'unconfirmed',code:'CONTROL_UNCONFIRMED',attempted:true};
  }
  return failure(e?.message==='INVALID_CONTROL_MESSAGE'?'INVALID_CONTROL_MESSAGE':'CONTROL_OPERATION_FAILED');
 }
}
