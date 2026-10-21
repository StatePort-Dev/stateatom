// SPDX-License-Identifier: Apache-2.0
// Internal explicit source-file boundary; no network, filesystem or code execution.
import {MAP_LIMITS,sourceDigest} from './source-maps.mjs';
import {assertUniqueHandoffJSONMembers} from './handoff-json.mjs';
const enc=new TextEncoder(),hex=/^[a-f\d]{64}$/i;
const keys=(o,names)=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===names.slice().sort().join(',');
const fail=()=>{throw Error('Invalid or oversized explicit source-file set');};
const unavailable=reason=>Object.freeze({status:'Unavailable',content:null,reason});
export async function createReadOnlySourceProvider(serialized,{signal}={}){
 if(typeof serialized!=='string'||serialized.length>MAP_LIMITS.bytes)fail();
 const check=()=>{if(signal?.aborted)throw Error('Source provider construction cancelled');};check();
 if(enc.encode(serialized).length>MAP_LIMITS.bytes)fail();
 let value;try{assertUniqueHandoffJSONMembers(serialized,{maxDepth:4,maxMembers:MAP_LIMITS.sources*3+4});value=JSON.parse(serialized);}catch{fail();}
 if(!keys(value,['schema','kind','ownerDigest','files'])||value.schema!=='stateatom.readonly-source-files/1'||!['user-map','ide-owned'].includes(value.kind)||typeof value.ownerDigest!=='string'||!hex.test(value.ownerDigest)||!Array.isArray(value.files)||value.files.length>MAP_LIMITS.sources)fail();
 let bytes=0;const deadline=Date.now()+MAP_LIMITS.ms,files=new Map();
 for(const [index,file]of value.files.entries()){
  check();if(Date.now()>deadline)throw Error('Source provider construction budget');
  if(!keys(file,['index','source','content'])||file.index!==index||typeof file.source!=='string'||file.source.length>2048||file.content!==null&&typeof file.content!=='string')fail();
  const content=file.content,data=typeof content==='string'?enc.encode(content):null;bytes+=data?.length||0;if(bytes>MAP_LIMITS.sourceBytes)fail();
  const digest=data?await sourceDigest(data):null;check();if(Date.now()>deadline)throw Error('Source provider construction budget');
  const key='stateatom-source://'+value.kind+'/'+value.ownerDigest+'/'+index;
  const metadata=Object.freeze({key,index,source:file.source,hasContent:content!==null,sourceDigest:digest,sourceDigestDomain:digest?'utf8-original-source-text':null});files.set(key,{metadata,content});
 }
 let closed=false;
 return Object.freeze({schema:'stateatom.readonly-source-provider/1',kind:value.kind,ownerDigest:value.ownerDigest,
  describe(){return Object.freeze({schema:'stateatom.readonly-source-provider/1',status:closed?'Unavailable':'Available',sourceCount:files.size,contentBytes:closed?0:bytes,artifactVerification:'not established by source provider'});},
  list(){return Object.freeze([...files.values()].map(r=>r.metadata));},
  read(key){if(closed)return unavailable('Source provider closed');if(typeof key!=='string')return unavailable('Unknown local source key');const r=files.get(key);if(!r)return unavailable('Unknown local source key');if(r.content===null)return Object.freeze({...r.metadata,...unavailable('Source content was not included in this explicit file set')});return Object.freeze({...r.metadata,status:'Available',content:r.content,artifactVerification:'not established by source provider'});},
  close(){closed=true;files.clear();}
 });
}
