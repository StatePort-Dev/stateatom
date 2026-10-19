// SPDX-License-Identifier: Apache-2.0
// Live ownership only. No browser API, storage, imported lease or native evidence.
const grants=['read','inject','reload','cache','override','replay'];
const bytes=new TextEncoder(),uuid=()=>crypto.randomUUID(),clone=x=>structuredClone(x);
function fail(code,message=code){throw Object.assign(new Error(message),{name:'DebuggerGuardianError',code});}
function fields(input,required,optional=[]){
 if(!input||typeof input!=='object'||Array.isArray(input)||![Object.prototype,null].includes(Object.getPrototypeOf(input)))fail('INVALID_PROTOCOL');
 const out={};for(const k of Reflect.ownKeys(input)){
  if(typeof k!=='string'||!required.includes(k)&&!optional.includes(k))fail('INVALID_PROTOCOL');
  const d=Object.getOwnPropertyDescriptor(input,k);if(!d?.enumerable||!Object.hasOwn(d,'value'))fail('INVALID_PROTOCOL');out[k]=d.value;
 }
 if(required.some(k=>!Object.hasOwn(out,k)))fail('INVALID_PROTOCOL');return out;
}
function string(value,max=512){if(typeof value!=='string'||!value||bytes.encode(value).length>max)fail('INVALID_PROTOCOL');return value;}
function list(value){
 if(!Array.isArray(value)||value.length>16)fail('INVALID_PROTOCOL');
 const d=Object.getOwnPropertyDescriptors(value);if(Reflect.ownKeys(d).length!==value.length+1)fail('INVALID_PROTOCOL');
 const result=[];for(let i=0;i<value.length;i++){if(!Object.hasOwn(d[i]||{},'value')||!d[i].enumerable)fail('INVALID_PROTOCOL');result.push(string(d[i].value,128));}return result;
}
function capabilities(value){const a=list(value);if(!a.includes('read')||new Set(a).size!==a.length||a.some(v=>!grants.includes(v)))fail('INVALID_PROTOCOL');return grants.filter(g=>a.includes(g));}
function origin(value){string(value,4096);let u;try{u=new URL(value);}catch{fail('INVALID_PROTOCOL');}if(!['http:','https:'].includes(u.protocol)||u.origin!==value||u.username||u.password)fail('INVALID_PROTOCOL');return value;}
function tab(value){if(!Number.isSafeInteger(value)||value<1)fail('INVALID_PROTOCOL');return value;}
function freeze(value){if(value&&typeof value==='object'){for(const x of Object.values(value))freeze(x);Object.freeze(value);}return value;}

export function createDebuggerGuardian(options={}){
 const config=fields(options,[],['commandCapability','now']),policy=config.commandCapability??(()=>null),now=config.now??Date.now;
 if(typeof policy!=='function'||typeof now!=='function')fail('INVALID_PROTOCOL');
 const guardianId=uuid(),clients=new Map(),leases=new Map(),operations=new Map(),events=[];let droppedEvents=0;
 function event(kind,lease){events.push({kind,at:now(),...(lease?{tabId:lease.cap.tabId,owner:lease.cap.owner}: {})});if(events.length>128){events.shift();droppedEvents++;}}
 function clientData(input){const c=fields(input,['guardianId','clientId','token']);for(const v of Object.values(c))string(v);return c;}
 function client(input){const c=clientData(input),current=clients.get(c.clientId);if(c.guardianId!==guardianId||current?.token!==c.token)fail('CLIENT_EXPIRED');return current;}
 function leaseData(input){
  const l=fields(input,['guardianId','clientId','leaseId','token','tabId','origin','owner','capabilities']);
  return {guardianId:string(l.guardianId),clientId:string(l.clientId),leaseId:string(l.leaseId),token:string(l.token),tabId:tab(l.tabId),origin:origin(l.origin),owner:string(l.owner,100),capabilities:capabilities(l.capabilities)};
 }
 function lease(c,input,closing=false){
  const l=leaseData(input),current=leases.get(l.tabId);
  if(l.guardianId!==guardianId||l.clientId!==c.clientId||!current||JSON.stringify(current.cap)!==JSON.stringify(l)||!closing&&current.phase==='closing')fail('LEASE_EXPIRED');return current;
 }
 function revoke(l){for(const id of l.operations)operations.delete(id);l.abandoned+=l.operations.size;l.operations.clear();}
 function close(l){
  if(l.phase==='closing')return {phase:'closing'};
  revoke(l);
  if(l.native==='none'){leases.delete(l.cap.tabId);event('released-unused',l);return {phase:'released'};}
  l.native=l.native==='attached'?'attached':'unknown';l.phase='closing';l.claim=null;l.blocked=false;event('closing',l);return {phase:'closing'};
 }
 function connect(){if(clients.size>=8)fail('CLIENT_LIMIT');const c=freeze({guardianId,clientId:uuid(),token:uuid()});clients.set(c.clientId,c);event('client-connected');return c;}
 function acquire(input,request){
  const c=client(input),r=fields(request,['tabId','origin','owner','capabilities']);const data={tabId:tab(r.tabId),origin:origin(r.origin),owner:string(r.owner,100),capabilities:capabilities(r.capabilities)};
  if(leases.has(data.tabId))fail('BUSY','A live or closing lease already owns this tab');if(leases.size>=16)fail('LEASE_LIMIT');
  const cap=freeze({guardianId,clientId:c.clientId,leaseId:uuid(),token:uuid(),...data});
  const l={cap,phase:'allocated',native:'none',operations:new Set(),abandoned:0,blocked:false,claim:null};leases.set(cap.tabId,l);event('allocated',l);return cap;
 }
 function verify(input,cap,grant){const c=client(input),l=lease(c,cap);if(grant!==undefined&&(!grants.includes(grant)||!l.cap.capabilities.includes(grant)))fail('CAPABILITY_DENIED');return true;}
 function begin(input,cap,request){
  const c=client(input),l=lease(c,cap),r=fields(request,['kind'],['method']);
  if(!['attach','command'].includes(r.kind)||r.kind==='attach'&&Object.hasOwn(r,'method')||r.kind==='command'&&!Object.hasOwn(r,'method'))fail('INVALID_PROTOCOL');
  if(r.kind==='attach'&&l.native!=='none')fail('BUSY','Attachment already active or pending');
  if(r.kind==='command'){
   const method=string(r.method,128),required=policy(method);
   if(!grants.includes(required)||!l.cap.capabilities.includes(required))fail('CAPABILITY_DENIED');
   if(l.native!=='attached')fail('LEASE_REQUIRED','Native attachment acknowledgement required');
  }
  if(operations.size>=128||l.operations.size>=32)fail('OPERATION_LIMIT');
  const ticket=freeze({guardianId,operationId:uuid(),token:uuid()});operations.set(ticket.operationId,{ticket,lease:l,clientId:c.clientId,kind:r.kind,method:r.method});l.operations.add(ticket.operationId);
  if(r.kind==='attach')l.native='pending';event('operation-begun',l);return ticket;
 }
 function finish(input,cap,result){
  const c=client(input),t=fields(cap,['guardianId','operationId','token']),r=fields(result,['ok']);for(const v of Object.values(t))string(v);if(typeof r.ok!=='boolean')fail('INVALID_PROTOCOL');
  const operation=operations.get(t.operationId);
  if(t.guardianId!==guardianId||!operation||operation.ticket.token!==t.token||operation.clientId!==c.clientId||operation.lease.phase==='closing')fail('STALE_OPERATION');
  operations.delete(t.operationId);operation.lease.operations.delete(t.operationId);
  if(operation.kind==='attach'){operation.lease.native=r.ok?'attached':'none';operation.lease.phase=r.ok?'attached':'allocated';}
  event(r.ok?'operation-acknowledged':'operation-failed',operation.lease);return {accepted:true};
 }
 function release(input,cap){const c=client(input);return close(lease(c,cap,true));}
 function disconnect(input){
  const data=clientData(input);if(data.guardianId!==guardianId)fail('CLIENT_EXPIRED');if(!clients.has(data.clientId))return;
  const c=client(data);
  for(const l of [...leases.values()]){if(l.cap.clientId===c.clientId)close(l);if(l.claim?.executor===c.clientId){l.claim=null;event('cleanup-executor-lost',l);}}
  clients.delete(c.clientId);event('client-disconnected');
 }
 function claimCleanup(input,options={}){
  const c=client(input),o=fields(options,[],['limit']),limit=o.limit??8;if(!Number.isSafeInteger(limit)||limit<1||limit>8)fail('INVALID_PROTOCOL');
  const jobs=[];for(const l of leases.values())if(l.phase==='closing'&&!l.blocked&&!l.claim&&jobs.length<limit){
   const actions=[];if(l.cap.capabilities.includes('override'))actions.push('Fetch.disable');if(l.cap.capabilities.includes('cache'))actions.push('Network.setCacheDisabled:false');actions.push('detach');
   const cap=freeze({guardianId,cleanupId:uuid(),token:uuid(),leaseId:l.cap.leaseId,tabId:l.cap.tabId,owner:l.cap.owner,origin:l.cap.origin,actions,nativeState:l.native,abandonedOperations:l.abandoned,executorId:c.clientId});
   l.claim={cap,executor:c.clientId};event('cleanup-claimed',l);jobs.push(cap);
  }return jobs;
 }
 function cleanupData(input){
  const c=fields(input,['guardianId','cleanupId','token','leaseId','tabId','owner','origin','actions','nativeState','abandonedOperations','executorId']);
  for(const k of ['guardianId','cleanupId','token','leaseId','owner','executorId','nativeState'])string(c[k]);tab(c.tabId);origin(c.origin);const actions=list(c.actions);
  if(!Number.isSafeInteger(c.abandonedOperations)||c.abandonedOperations<0)fail('INVALID_PROTOCOL');return {guardianId:c.guardianId,cleanupId:c.cleanupId,token:c.token,leaseId:c.leaseId,tabId:c.tabId,owner:c.owner,origin:c.origin,actions,nativeState:c.nativeState,abandonedOperations:c.abandonedOperations,executorId:c.executorId};
 }
 function finishCleanup(input,cap,result){
  const c=client(input),t=cleanupData(cap),r=fields(result,['status']);if(!['detached','already-detached','failed'].includes(r.status))fail('INVALID_PROTOCOL');
  const l=leases.get(t.tabId);if(t.guardianId!==guardianId||!l?.claim||l.claim.executor!==c.clientId||JSON.stringify(l.claim.cap)!==JSON.stringify(t))fail('STALE_CLEANUP');
  if(r.status==='failed'){l.claim=null;l.blocked=true;event('cleanup-unconfirmed',l);return {phase:'closing'};}
  leases.delete(t.tabId);event('cleanup-'+r.status,l);return {phase:'released'};
 }
 function retryCleanup(input,leaseId){
  client(input);string(leaseId);const l=[...leases.values()].find(l=>l.cap.leaseId===leaseId);if(!l)fail('LEASE_EXPIRED');if(l.phase!=='closing')fail('LEASE_ACTIVE');if(l.claim)fail('BUSY');l.blocked=false;event('cleanup-retry-requested',l);
 }
 function status(input,tabId,owner){const c=client(input),l=leases.get(tab(tabId));string(owner,100);return !l?'none':l.phase!=='closing'&&l.cap.clientId===c.clientId&&l.cap.owner===owner?'owned':'foreign';}
 function snapshot(){return clone({guardianId,clients:clients.size,inFlight:operations.size,leases:[...leases.values()].map(l=>({leaseId:l.cap.leaseId,tabId:l.cap.tabId,owner:l.cap.owner,origin:l.cap.origin,capabilities:l.cap.capabilities,phase:l.phase,nativeState:l.native,inFlight:l.operations.size,abandonedOperations:l.abandoned,cleanupClaimed:!!l.claim,cleanupBlocked:l.blocked})),events,droppedEvents});}
 return Object.freeze({connect,acquire,verify,begin,finish,release,disconnect,claimCleanup,finishCleanup,retryCleanup,status,snapshot});
}
