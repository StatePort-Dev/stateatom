import {parseConnectionReceipt} from '../../../core/project-connection.mjs';
// SPDX-License-Identifier: Apache-2.0
export {createInspectorConnections} from './inspector-connections.mjs';
import {parseExperimentPlan} from '../../../core/experiment-plan.mjs';
import {siteRecord} from './origin-policy.mjs';
import {atomError} from './platform.mjs';
import {CAPABILITY_VERSION,FEATURE_IDS,GLOBAL_OPERATIONS,OPERATIONS,DEBUGGER_CAPABILITIES,isBridgeURL} from './capabilities.mjs';
export const API_VERSION=1;
const globalOps=new Set(GLOBAL_OPERATIONS),ops=new Set(OPERATIONS);
export {isInspectionOrigin,describeCapabilities,operationPolicy,CAPABILITY_VERSION,FEATURE_IDS} from './capabilities.mjs';
export function supportsCapabilityPolicy(value){
 const decision=d=>d&&typeof d.available==='boolean'&&Array.isArray(d.requiredGrants)&&d.requiredGrants.every(c=>DEBUGGER_CAPABILITIES.includes(c))&&(d.available?d.reason===null&&d.code===null:typeof d.reason==='string'&&typeof d.code==='string');
 return value?.schemaVersion===CAPABILITY_VERSION&&value.wireVersion===API_VERSION&&Array.isArray(value.featureIds)&&FEATURE_IDS.every(id=>value.featureIds.includes(id)&&decision(value.features?.[id]))&&OPERATIONS.every(op=>decision(value.operations?.[op]));
}
export function validateRequest(m){
 const bad=()=>{throw atomError('INVALID_MESSAGE');};
 if(!m||m.version!==1||typeof m.id!=='string'||!m.id||m.id.length>100||typeof m.session!=='string'||!m.session||m.session.length>100||!m.payload||typeof m.payload!=='object')bad();
 const p=m.payload;if(!ops.has(p.op)||JSON.stringify(m).length>(p.op==='source-map-import'?11500000:p.op==='save-handoff'?2200000:65536))bad();
 if(['save-handoff','list-handoffs','open-handoff','delete-handoff'].includes(p.op)){
  const allowed=p.op==='save-handoff'?['op','raw']:p.op==='list-handoffs'?['op']:p.op==='open-handoff'?['op','id']:['op','id','expectedDigest'];
  if(Object.keys(p).some(k=>!allowed.includes(k)))bad();
  if(p.op==='save-handoff'&&(typeof p.raw!=='string'||new TextEncoder().encode(p.raw).length>1048576))bad();
  if(['open-handoff','delete-handoff'].includes(p.op)&&(typeof p.id!=='string'||!/^[a-f0-9-]{36}$/.test(p.id)))bad();
  if(p.op==='delete-handoff'&&(typeof p.expectedDigest!=='string'||!/^[a-f0-9]{64}$/.test(p.expectedDigest)))bad();
 }
 if(!globalOps.has(p.op)&&(!Number.isSafeInteger(p.tabId)||p.tabId<1))bad();
 if(['selected','inspect-selector'].includes(p.op)&&(typeof p.selector!=='string'||!p.selector||p.selector.length>1024))bad();
 if(['pick','cancel-pick'].includes(p.op)&&p.pickerId!==undefined&&(typeof p.pickerId!=='string'||!p.pickerId||p.pickerId.length>100))bad();
 if(p.op==='refine-pick'&&(typeof p.pickerId!=='string'||!p.pickerId||p.pickerId.length>100||!Number.isSafeInteger(p.index)||p.index<0||p.index>11))bad();
 if(p.ownerId!==undefined&&(!(p.op.startsWith('inputs-')||p.op.startsWith('production-')||p.op==='capabilities')||typeof p.ownerId!=='string'||!p.ownerId||p.ownerId.length>100))bad();
 if(p.op.startsWith('production-')){if(typeof p.ownerId!=='string'||!p.ownerId||p.ownerId.length>100||Object.keys(p).some(k=>!['op','tabId','ownerId','ticket'].includes(k)))bad();const ticket=['production-advance','production-confirm','production-cancel'].includes(p.op);if(ticket&&(typeof p.ticket!=='string'||!p.ticket||p.ticket.length>100)||!ticket&&p.ticket!==undefined)bad();}
 if(p.sourceKind!==undefined&&(!['inputs-open','capabilities'].includes(p.op)||!['dom-control','json-response'].includes(p.sourceKind)))bad();
 if(p.op==='inputs-apply'){try{if(!p.plan||typeof p.plan!=='object'||parseExperimentPlan(p.plan).target.tabId!==p.tabId)bad();}catch{bad();}}
 if(['inputs-read','inputs-undo','inputs-baseline'].includes(p.op)&&(typeof p.investigationId!=='string'||!p.investigationId||p.investigationId.length>512))bad();
 if(p.op==='inputs-close'&&p.investigationId!==undefined&&(typeof p.investigationId!=='string'||!p.investigationId||p.investigationId.length>512))bad();
 if(['inputs-undo','inputs-baseline'].includes(p.op)&&(!Number.isSafeInteger(p.expectedRevision)||p.expectedRevision<0))bad();
 if(p.op==='connect-site')siteRecord(p.connection);
 if(p.op==='property'&&!['text','disabled'].includes(p.property))bad();
 if(p.op==='pair'&&p.receipt)parseConnectionReceipt(p.receipt);
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
 },subscribeConnection(fn){if(disposed)throw atomError('DISPOSED');const off=transport.subscribeConnection?.(session,fn)||(()=>{});subscriptions.add(off);return()=>{subscriptions.delete(off);off();};},subscribe(fn){if(disposed)throw atomError('DISPOSED');const off=transport.subscribe(fn);subscriptions.add(off);return()=>{subscriptions.delete(off);off();};},dispose(){if(disposed)return;disposed=true;for(const c of pending)c.abort();for(const off of subscriptions)off();subscriptions.clear();transport.closeSession?.(session);}};
}
export function chromeTransport(api,{inspectorOwnership=false,startupTimeout=5000}={}){
 const channels=new Map(),connectionListeners=new Map();
 function lost(r){
  if(r.closed)return;r.closed=true;clearTimeout(r.timer);r.reject(atomError('INSPECTOR_DISCONNECTED'));
  if(r.port){r.port.onMessage.removeListener(r.message);r.port.onDisconnect.removeListener(r.disconnected);}
  for(const fn of connectionListeners.get(r.session)||[])try{fn({state:'closed',code:'INSPECTOR_DISCONNECTED'});}catch{}
 }
 function establish(session){
  let r=channels.get(session);if(r)return r.closed?Promise.reject(atomError('INSPECTOR_DISCONNECTED')):r.ready;
  let resolve,reject;const ready=new Promise((a,b)=>{resolve=a;reject=b;});void ready.catch(()=>{});r={session,ready,resolve,reject,closed:false,port:null};channels.set(session,r);
  try{
   if(typeof api.runtime.connect!=='function')throw atomError('INSPECTOR_DISCONNECTED');
   r.port=api.runtime.connect({name:'stateatom.inspector/1:'+session});
   r.disconnected=()=>{void api.runtime.lastError;lost(r);};
   r.message=m=>{if(m?.version===1&&m.kind==='ready'&&m.session===session&&Object.keys(m).length===3){clearTimeout(r.timer);r.resolve(r);}else{lost(r);try{r.port.disconnect();}catch{}}};
   r.port.onMessage.addListener(r.message);r.port.onDisconnect.addListener(r.disconnected);
   r.timer=setTimeout(()=>{lost(r);try{r.port.disconnect();}catch{}},startupTimeout);
  }catch{lost(r);}return ready;
 }
 return {async request(m,{signal}){
  let dispatched=false,rejectAborted;const aborted=new Promise((_,reject)=>rejectAborted=reject);void aborted.catch(()=>{});
  const abort=()=>{rejectAborted(atomError('CANCELLED'));if(dispatched)void api.runtime.sendMessage({atomCancel:{version:1,id:m.id,session:m.session}}).catch(()=>{});};signal.addEventListener('abort',abort,{once:true});
  try{
   if(signal.aborted)throw atomError('CANCELLED');
   if(inspectorOwnership){const r=await Promise.race([establish(m.session),aborted]);if(signal.aborted)throw atomError('CANCELLED');if(r.closed)throw atomError('INSPECTOR_DISCONNECTED');}
   dispatched=true;return await Promise.race([api.runtime.sendMessage({atom:m,...(inspectorOwnership?{atomOwned:true}:{})}),aborted]);
  }finally{signal.removeEventListener('abort',abort);}
 },subscribe(fn){const listener=m=>{if(m?.event)fn(m);};api.runtime.onMessage.addListener(listener);return()=>api.runtime.onMessage.removeListener(listener);},
 subscribeConnection(session,fn){const list=connectionListeners.get(session)||new Set();connectionListeners.set(session,list);list.add(fn);return()=>{list.delete(fn);if(!list.size)connectionListeners.delete(session);};},
 closeSession(session){const r=channels.get(session);if(!r)return;lost(r);try{r.port?.disconnect();}catch{}channels.delete(session);}
 };
}
// The host supplies exact peer authentication. It registers this return value itself.
export function createAtomDispatcher(runtime,{isTrusted,isSelectionSender,connections}){
 return (message,sender,reply)=>{
  if(!message?.atom&&!message?.atomCancel&&!ops.has(message?.op))return false;
  const trusted=isTrusted(sender);
  if(message?.atomCancel){if(trusted){const c=message.atomCancel;if(c.version===1&&typeof c.id==='string'&&typeof c.session==='string')runtime.cancel(c.session,c.id);}return false;}
  let envelope,legacy=false;
  try{
   if(trusted){legacy=!message.atom;envelope=message.atom||{version:1,id:crypto.randomUUID(),session:'host-legacy',payload:message};}
   else if(message?.op==='selected'&&isSelectionSender(sender)&&(!message.tabId||message.tabId===sender.tab.id))envelope={version:1,id:crypto.randomUUID(),session:'picker-'+sender.tab.id,payload:{op:'selected',selector:message.selector,token:message.token,documentId:sender.documentId,tabId:sender.tab.id}};
   else return false;
   validateRequest(envelope);if(['production-begin','production-advance','production-confirm'].includes(envelope.payload.op)&&message.atomOwned!==true)throw atomError('INSPECTOR_DISCONNECTED');if(message.atomOwned===true||connections?.has(envelope.session)){if(!connections)throw atomError('INSPECTOR_DISCONNECTED');connections.assert(envelope.session,sender);}
  }catch(e){reply({ok:false,error:e.message,code:e.code});return false;}
  void runtime.request(envelope).then(result=>reply({version:1,id:envelope.id,session:envelope.session,ok:true,result}),e=>reply({version:1,id:envelope.id,session:envelope.session,ok:false,error:e.message,code:e.code||'OPERATION_FAILED'}));return true;
 };
}
