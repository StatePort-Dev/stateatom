// SPDX-License-Identifier: Apache-2.0
import {atomError} from './platform.mjs';
import {CAPABILITY_VERSION,FEATURE_IDS,GLOBAL_OPERATIONS,OPERATIONS,DEBUGGER_CAPABILITIES,isBridgeURL} from './capabilities.mjs';
export const API_VERSION=1;
const globalOps=new Set(GLOBAL_OPERATIONS),ops=new Set(OPERATIONS);
export {describeCapabilities,operationPolicy,CAPABILITY_VERSION,FEATURE_IDS} from './capabilities.mjs';
export function supportsCapabilityPolicy(value){
 const decision=d=>d&&typeof d.available==='boolean'&&Array.isArray(d.requiredGrants)&&d.requiredGrants.every(c=>DEBUGGER_CAPABILITIES.includes(c))&&(d.available?d.reason===null&&d.code===null:typeof d.reason==='string'&&typeof d.code==='string');
 return value?.schemaVersion===CAPABILITY_VERSION&&value.wireVersion===API_VERSION&&Array.isArray(value.featureIds)&&FEATURE_IDS.every(id=>value.featureIds.includes(id)&&decision(value.features?.[id]))&&OPERATIONS.every(op=>decision(value.operations?.[op]));
}
export function validateRequest(m){
 const bad=()=>{throw atomError('INVALID_MESSAGE');};
 if(!m||m.version!==1||typeof m.id!=='string'||!m.id||m.id.length>100||typeof m.session!=='string'||!m.session||m.session.length>100||!m.payload||typeof m.payload!=='object')bad();
 const p=m.payload;if(!ops.has(p.op)||JSON.stringify(m).length>(p.op==='source-map-import'?11500000:65536))bad();
 if(!globalOps.has(p.op)&&(!Number.isSafeInteger(p.tabId)||p.tabId<1))bad();
 if(['selected','inspect-selector'].includes(p.op)&&(typeof p.selector!=='string'||!p.selector||p.selector.length>1024))bad();
 if(p.op==='property'&&!['text','disabled'].includes(p.property))bad();
 if(p.op==='pair'&&(!isBridgeURL(p.url)||typeof p.token!=='string'||p.token.length>4096||typeof p.origin!=='string'||typeof p.sourceRoot!=='string'))bad();
 if(p.op==='capabilities'&&p.capabilityVersion!==undefined&&p.capabilityVersion!==CAPABILITY_VERSION)bad();
 if(['open','definitions','references'].includes(p.op)&&(!p.source||typeof p.source.file!=='string'||!Number.isSafeInteger(p.source.line)||p.source.line<1))bad();
 if(p.op==='deep-experiment'&&!Array.isArray(p.variants))bad();
 if(p.op==='experiment'&&(!p.field||typeof p.field.url!=='string'||typeof p.field.path!=='string'||typeof p.field.requestId!=='string'||!Array.isArray(p.actions)))bad();
 if(p.op.startsWith('source-map-')&&p.op!=='source-map-clear'&&(typeof p.scriptId!=='string'||p.scriptId.length>128))bad();
 if(p.op==='source-map-import'&&(typeof p.name!=='string'||p.name.length>512||typeof p.data!=='string'||p.data.length>11200000||p.data.length%4!==0||/[^A-Za-z0-9+/=]/.test(p.data)))bad();
 if(p.op==='source-map-acquire'&&p.url!==undefined&&(typeof p.url!=='string'||p.url.length>4096))bad();
 if(p.op==='source-map-lookup'&&(!Number.isSafeInteger(p.line)||p.line<1||!Number.isSafeInteger(p.column)||p.column<0))bad();
 if(p.op==='delete-diagnostic'&&typeof p.id!=='string')bad();
 return m;
}
export function createAtomClient(transport){
 let disposed=false;const pending=new Set(),subscriptions=new Set();const session=crypto.randomUUID();
 return {async request(payload,{signal}={}){
  if(disposed)throw atomError('DISPOSED');const message=validateRequest({version:1,id:crypto.randomUUID(),session,payload});const controller=new AbortController();pending.add(controller);
  const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  try{if(controller.signal.aborted)throw atomError('CANCELLED');const reply=await transport.request(message,{signal:controller.signal});if(controller.signal.aborted||disposed)throw atomError('CANCELLED');if(reply?.version!==1||reply.id!==message.id||reply.session!==session||typeof reply.ok!=='boolean')throw atomError('INVALID_MESSAGE');if(!reply.ok)throw atomError(reply.code||'OPERATION_FAILED',reply.error);return reply.result;}finally{pending.delete(controller);signal?.removeEventListener('abort',abort);}
 },subscribe(fn){if(disposed)throw atomError('DISPOSED');const off=transport.subscribe(fn);subscriptions.add(off);return()=>{subscriptions.delete(off);off();};},dispose(){if(disposed)return;disposed=true;for(const c of pending)c.abort();for(const off of subscriptions)off();subscriptions.clear();}};
}
export function chromeTransport(api){return {async request(m,{signal}){
 const abort=()=>{void api.runtime.sendMessage({atomCancel:{version:1,id:m.id,session:m.session}}).catch(()=>{});};signal.addEventListener('abort',abort,{once:true});
 try{return await api.runtime.sendMessage({atom:m});}finally{signal.removeEventListener('abort',abort);}
 },subscribe(fn){const listener=m=>{if(m?.event)fn(m);};api.runtime.onMessage.addListener(listener);return()=>api.runtime.onMessage.removeListener(listener);}};}
// The host supplies exact peer authentication. It registers this return value itself.
export function createAtomDispatcher(runtime,{isTrusted,isSelectionSender}){
 return (message,sender,reply)=>{
  if(!message?.atom&&!message?.atomCancel&&!ops.has(message?.op))return false;
  const trusted=isTrusted(sender);
  if(message?.atomCancel){if(trusted){const c=message.atomCancel;if(c.version===1&&typeof c.id==='string'&&typeof c.session==='string')runtime.cancel(c.session,c.id);}return false;}
  let envelope,legacy=false;
  try{
   if(trusted){legacy=!message.atom;envelope=message.atom||{version:1,id:crypto.randomUUID(),session:'host-legacy',payload:message};}
   else if(message?.op==='selected'&&isSelectionSender(sender)&&(!message.tabId||message.tabId===sender.tab.id))envelope={version:1,id:crypto.randomUUID(),session:'picker-'+sender.tab.id,payload:{op:'selected',selector:message.selector,token:message.token,documentId:sender.documentId,tabId:sender.tab.id}};
   else return false;
   validateRequest(envelope);
  }catch(e){reply({ok:false,error:e.message,code:e.code});return false;}
  void runtime.request(envelope).then(result=>reply({version:1,id:envelope.id,session:envelope.session,ok:true,result}),e=>reply({version:1,id:envelope.id,session:envelope.session,ok:false,error:e.message,code:e.code||'OPERATION_FAILED'}));return true;
 };
}
