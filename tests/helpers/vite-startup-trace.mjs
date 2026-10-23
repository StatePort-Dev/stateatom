// SPDX-License-Identifier: Apache-2.0
// Passive local-origin projection. No response/header/body mutation or app calls.
export function createViteStartupTrace({origin,maxEvents,maxBytes,readMetadata}){
 const state={events:[],metadata:[],bytes:0,overflow:false,dropped:0},owned=new Set(),pending=[];
 const local=url=>{try{return new URL(url).host===new URL(origin).host&&['http:','ws:'].includes(new URL(url).protocol);}catch{return false;}};
 function record(event){const bytes=Buffer.byteLength(JSON.stringify(event));if(state.events.length>=maxEvents||state.bytes+bytes>maxBytes){state.overflow=true;state.dropped++;return null;}const sequence=state.events.length;state.bytes+=bytes;state.events.push({sequence,receivedAt:new Date().toISOString(),...event});return sequence;}
 function metadata(sequence,url){
  if(!readMetadata||sequence===null||state.metadata.length>=2)return;const entry={observedAfterSequence:sequence,url,startedAt:new Date().toISOString()};state.metadata.push(entry);
  pending.push(Promise.resolve().then(readMetadata).then(text=>{if(Buffer.byteLength(text)>maxBytes){state.overflow=true;entry.error={code:'METADATA_LIMIT',message:'Metadata exceeds diagnostic bound'};}else entry.text=text;},e=>{entry.error={code:e.code||'READ_FAILED',message:e.message};}).finally(()=>{entry.finishedAt=new Date().toISOString();}));
 }
 return{
  capture(method,p){
   if(method==='Network.requestWillBeSent'&&local(p.request?.url)){owned.add(p.requestId);record({method,requestId:p.requestId,url:p.request.url,httpMethod:p.request.method,type:p.type,timestamp:p.timestamp,wallTime:p.wallTime,loaderId:p.loaderId});}
   else if(method==='Network.responseReceived'&&local(p.response?.url)){owned.add(p.requestId);const sequence=record({method,requestId:p.requestId,url:p.response.url,status:p.response.status,statusText:p.response.statusText,type:p.type,mimeType:p.response.mimeType,timestamp:p.timestamp,fromDiskCache:p.response.fromDiskCache,fromServiceWorker:p.response.fromServiceWorker});if(p.response.status===504)metadata(sequence,p.response.url);}
   else if(method==='Network.loadingFailed'&&owned.has(p.requestId))record({method,requestId:p.requestId,errorText:p.errorText,canceled:p.canceled,type:p.type,timestamp:p.timestamp});
   else if(method==='Network.webSocketCreated'&&local(p.url)){owned.add(p.requestId);record({method,requestId:p.requestId,url:p.url});}
   else if(['Network.webSocketFrameReceived','Network.webSocketFrameSent'].includes(method)&&owned.has(p.requestId))record({method,requestId:p.requestId,timestamp:p.timestamp,opcode:p.response.opcode,payloadData:p.response.payloadData});
   else if(['Network.webSocketClosed','Network.webSocketFrameError'].includes(method)&&owned.has(p.requestId))record({method,requestId:p.requestId,timestamp:p.timestamp,errorMessage:p.errorMessage});
   else if(method==='Page.frameNavigated'&&local(p.frame?.url))record({method,frameId:p.frame.id,parentId:p.frame.parentId,loaderId:p.frame.loaderId,url:p.frame.url});
  },
  drain:()=>Promise.all(pending),snapshot:()=>structuredClone(state)
 };
}
