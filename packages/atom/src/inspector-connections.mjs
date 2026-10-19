// SPDX-License-Identifier: Apache-2.0
// Host registers acceptPort explicitly. Live channels, never stored records,
// own inspector lifetimes. This factory does not install global listeners.
const error=code=>Object.assign(new Error(code),{code});
const prefix='stateatom.inspector/1:',uuid=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
export function createInspectorConnections(runtime,{isTrusted,maxClients=16}={}){
 if(typeof runtime?.connectInspector!=='function'||typeof isTrusted!=='function'||!Number.isSafeInteger(maxClients)||maxClients<1||maxClients>128)throw error('INVALID_PLATFORM');
 const records=new Map();let disposed=false;
 const trusted=s=>{try{return isTrusted(s)===true;}catch{return false;}};
 function close(record,reason){
  if(record.closing)return record.closing;let finish;record.closing=new Promise(resolve=>finish=resolve);record.active=false;
  record.port.onMessage.removeListener(record.message);record.port.onDisconnect.removeListener(record.disconnected);
  try{record.port.postMessage({version:1,kind:'closed',session:record.session});}catch{}try{record.port.disconnect();}catch{}
  let cleanup;try{cleanup=record.lease.close(reason);}catch(e){cleanup=Promise.reject(e);}
  void Promise.resolve(cleanup).then(()=>{if(records.get(record.session)===record)records.delete(record.session);finish({cleanup:'closed'});},()=>finish({cleanup:'unknown'}));return record.closing;
 }
 function acceptPort(port){
  if(typeof port?.name!=='string'||!port.name.startsWith(prefix))return false;
  const session=port.name.slice(prefix.length);
  if(disposed||!uuid.test(session)||records.has(session)||records.size>=maxClients||!trusted(port.sender)){try{port.disconnect();}catch{}return true;}
  let lease;try{lease=runtime.connectInspector(session);}catch{try{port.disconnect();}catch{}return true;}
  const s=port.sender,record={session,port,lease,active:true,closing:null,peer:{id:s.id,url:s.url,documentId:typeof s.documentId==='string'?s.documentId:null,tabId:Number.isSafeInteger(s.tab?.id)?s.tab.id:null,frameId:Number.isSafeInteger(s.frameId)?s.frameId:null}};
  records.set(session,record);
  record.disconnected=()=>{void close(record,'Inspector page disconnected');};
  record.message=()=>{void close(record,'Unexpected inspector channel message');};
  port.onDisconnect.addListener(record.disconnected);port.onMessage.addListener(record.message);
  try{port.postMessage({version:1,kind:'ready',session});}catch{void close(record,'Inspector admission unavailable');}return true;
 }
 function assert(session,sender){
  const r=records.get(session),p=r?.peer;
  if(disposed||!r?.active||!trusted(sender)||p.id!==sender.id||p.url!==sender.url||p.documentId!==null&&p.documentId!==sender.documentId||p.tabId!==null&&p.tabId!==sender.tab?.id||p.frameId!==null&&p.frameId!==sender.frameId)throw error('INSPECTOR_DISCONNECTED');
 }
 async function dispose(){if(disposed)return;disposed=true;await Promise.allSettled([...records.values()].map(r=>close(r,'Inspector host disposed')));}
 return Object.freeze({acceptPort,assert,has:session=>!disposed&&records.get(session)?.active===true,dispose});
}
