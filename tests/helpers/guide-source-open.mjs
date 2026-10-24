// SPDX-License-Identifier: Apache-2.0
// Response-only observer on an owned extension worker, never an application target.
import assert from'node:assert/strict';import path from'node:path';
const keys=(v,k)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===[...k].sort().join(',');
function range(r){assert(keys(r,['file','line','column','endLine','endColumn']));assert.equal(typeof r.file,'string');assert(r.file.length>0&&r.file.length<=4096);for(const key of ['line','column','endLine','endColumn'])assert(Number.isSafeInteger(r[key])&&r[key]>0);assert(r.endLine>r.line||r.endLine===r.line&&r.endColumn>=r.column);}
export function validateGuideSourceOpen(record,{source,workspaceRoot}){assert.equal(record.status,200);range(record.result);assert(path.isAbsolute(workspaceRoot));assert(!path.isAbsolute(source.file));const expected=path.resolve(workspaceRoot,source.file);assert(expected.startsWith(path.resolve(workspaceRoot)+path.sep));assert.equal(record.result.file,expected);for(const k of ['line','column','endLine','endColumn'])assert.equal(record.result[k],source[k],k);return record.result;}
export async function observeGuideSourceOpen(session,{helperURL,maxBytes=16384}){
 const u=new URL(helperURL);assert.equal(u.protocol,'http:');assert.equal(u.hostname,'127.0.0.1');assert(u.port&&!u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash);assert(Number.isSafeInteger(maxBytes)&&maxBytes>0&&maxBytes<=16384);
 const url=u.origin+'/open',records=[],errors=[],seen=new Set(),active=new Map(),pending=new Set();let closed=false;
 const fail=code=>{if(!closed&&errors.length<16)errors.push({code});};
 session.on('Network.responseReceived',e=>{if(closed||e.response?.url!==url)return;if(seen.has(e.requestId)){fail('DUPLICATE_OPEN_RESPONSE');return;}if(seen.size>=128){fail('OPEN_RESPONSE_LIMIT');return;}seen.add(e.requestId);if(e.response.status!==200){fail('OPEN_RESPONSE_HTTP_FAILED');return;}active.set(e.requestId,{url,status:e.response.status});});
 session.on('Network.loadingFailed',e=>{if(closed||!active.delete(e.requestId))return;fail('OPEN_RESPONSE_TRANSFER_FAILED');});
 session.on('Network.loadingFinished',e=>{
  if(closed||!active.has(e.requestId))return;const metadata=active.get(e.requestId);active.delete(e.requestId);
  const job=(async()=>{let response;try{response=await session.send('Network.getResponseBody',{requestId:e.requestId});}catch{fail('OPEN_RESPONSE_READ_FAILED');return;}if(closed)return;
   if(typeof response?.body!=='string'||typeof response.base64Encoded!=='boolean'){fail('OPEN_RESPONSE_INVALID');return;}
   if(response.body.length>maxBytes*2){fail('OPEN_RESPONSE_TOO_LARGE');return;}
   const raw=response.base64Encoded?Buffer.from(response.body,'base64'):Buffer.from(response.body);if(raw.length>maxBytes){fail('OPEN_RESPONSE_TOO_LARGE');return;}
   try{const parsed=JSON.parse(raw.toString('utf8'));assert(keys(parsed,['ok','result'])&&parsed.ok===true);range(parsed.result);records.push({...metadata,result:{...parsed.result},bodyBytes:raw.length});}catch{fail('OPEN_RESPONSE_INVALID');}
  })();pending.add(job);job.finally(()=>pending.delete(job));return job;
 });
 const close=async()=>{closed=true;active.clear();await Promise.allSettled([...pending]);};
 try{await session.send('Network.enable',{maxTotalBufferSize:131072,maxResourceBufferSize:32768,maxPostDataSize:0});}catch(error){await close();throw error;}
 return{records,errors,close};
}
