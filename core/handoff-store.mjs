// SPDX-License-Identifier: Apache-2.0
// Single-writer historical storage controller. Data only, no host authority.
import {readHandoffFile, handoffArtifactDigest} from './handoff-files.mjs';

const MAX_BYTES=2097152, MAX_ITEMS=8, DAY=86400000, DATE_MAX=8640000000000000;
const encoder=new TextEncoder();
const error=(code,message=code)=>Object.assign(new Error(message),{code});
const invalid=()=>{throw error('INVALID_HANDOFF_STORE','Invalid local report store; original bytes preserved');};
const bytes=raw=>encoder.encode(raw).length;
function envelope(entries){
 return JSON.stringify({schema:'stateatom.handoff-store',version:2,entries:entries.map(({raw,representation})=>{
  // Only reserialized legacy objects can use compact storage. New files keep raw bytes.
  if(representation==='legacy-reserialized'){
   const legacy=JSON.parse(raw);if(JSON.stringify(legacy)===raw)return {legacy,representation};
  }
  return {raw,representation};
 })});
}
function exactKeys(value,names){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==names.length||names.some(k=>!Object.hasOwn(value,k)))invalid();
}
function frozen(value){
 const copy=structuredClone(value);
 const freeze=v=>{if(v&&typeof v==='object'){for(const child of Object.values(v))freeze(child);Object.freeze(v);}return v;};
 return freeze(copy);
}
const metadata=entry=>({id:entry.view.record.id,version:entry.view.version,createdAt:entry.view.record.createdAt,digest:entry.digest,representation:entry.representation,trust:'historical-untrusted',title:entry.view.version===2?entry.view.record.report.issue.title:null,property:entry.view.version===2?entry.view.record.report.target.property:entry.view.record.target.property});
function configuration(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw error('INVALID_HANDOFF_ADAPTER');
 const descriptors=Object.getOwnPropertyDescriptors(value),out={};
 for(const k of Reflect.ownKeys(descriptors)){
  if(!['read','write','now'].includes(k)||!('value'in descriptors[k]))throw error('INVALID_HANDOFF_ADAPTER');
  out[k]=descriptors[k].value;
 }
 if(typeof out.read!=='function'||typeof out.write!=='function'||Object.hasOwn(out,'now')&&typeof out.now!=='function')throw error('INVALID_HANDOFF_ADAPTER');
 return {...out,now:out.now??Date.now};
}
async function entry(raw,representation='input-bytes'){
 const view=await readHandoffFile(raw);
 return {raw,representation,view,digest:await handoffArtifactDigest(raw)};
}
async function checkLinks(entries){
 const byDigest=new Map(entries.map(e=>[e.digest,e]));
 for(const e of entries){
  if(e.view.version!==2)continue;
  const parent=byDigest.get(e.view.record.lineage.parentArtifactDigest);
  if(parent)await readHandoffFile(e.raw,{parentRaw:parent.raw});
 }
}

/** Adapter must be the sole writer for its key and atomically replace a string. */
export function createHandoffStore(options){
 const adapter=configuration(options);let queue=Promise.resolve();
 function run(operation){
  const pending=queue.then(async()=>{
   const at=adapter.now();
   if(typeof at!=='number'||!Number.isFinite(at)||at<0||at>DATE_MAX)throw error('INVALID_CLOCK');
   return operation(at);
  });
  queue=pending.catch(()=>{});return pending;
 }
 async function load(){
  const source=await adapter.read();if(source===null)return {source,entries:[]};
  if(typeof source!=='string'||bytes(source)>MAX_BYTES)invalid();
  let value;try{value=JSON.parse(source);}catch{invalid();}
  const legacy=Array.isArray(value);
  if(!legacy){exactKeys(value,['schema','version','entries']);if(value.schema!=='stateatom.handoff-store'||![1,2].includes(value.version)||!Array.isArray(value.entries))invalid();}
  const stored=legacy?value.map(item=>({raw:JSON.stringify(item),representation:'legacy-reserialized'})):value.entries;
  if(stored.length>MAX_ITEMS)invalid();
  const entries=[],ids=new Set();
  for(const item of stored){
   const compact=!legacy&&value.version===2&&Object.hasOwn(item??{},'legacy');
   exactKeys(item,[compact?'legacy':'raw','representation']);
   if(!['input-bytes','legacy-reserialized'].includes(item.representation))invalid();
   if(compact&&item.representation!=='legacy-reserialized')invalid();
   let parsed;try{parsed=await entry(compact?JSON.stringify(item.legacy):item.raw,item.representation);}catch{invalid();}
   if(item.representation==='legacy-reserialized'&&parsed.view.version!==1||ids.has(parsed.view.record.id))invalid();
   ids.add(parsed.view.record.id);entries.push(parsed);
  }
  await checkLinks(entries);return {source,entries};
 }
 function retained(entries,at){
  const active=[],expired=[];
  for(const e of entries)(Date.parse(e.view.record.createdAt)>=at-7*DAY?active:expired).push(e);
  return {active,expired:expired.map(e=>e.view.record.id)};
 }
 async function persist(entries,source){
  const legacy=typeof source==='string'&&source.trimStart().startsWith('[')&&entries.every(e=>e.representation==='legacy-reserialized');
  const raw=legacy?JSON.stringify(entries.map(e=>JSON.parse(e.raw))):envelope(entries);
  if(raw===source||source===null&&entries.length===0)return;
  await adapter.write(raw);
 }
 async function add(incoming,at){
  const {source,entries}=await load(),{active,expired}=retained(entries,at),saved=[];
  for(const e of incoming){
   if(Date.parse(e.view.record.createdAt)<at-7*DAY)throw error('HANDOFF_EXPIRED','Report is older than local retention');
   if(bytes(envelope([e]))>MAX_BYTES)throw error('HANDOFF_STORE_LIMIT');
   const existing=active.find(x=>x.view.record.id===e.view.record.id);
   if(existing){
    if(existing.raw!==e.raw)throw error('HANDOFF_ID_CONFLICT','Same report ID has different bytes; existing report preserved');
   }else {active.push(e);saved.push(e.view.record.id);}
  }
  await checkLinks(active);
  const evicted=[];
  while(active.length>MAX_ITEMS||bytes(envelope(active))>MAX_BYTES)evicted.push(active.shift().view.record.id);
  // A batch must never acknowledge a record it immediately evicted.
  if(saved.some(id=>evicted.includes(id)))throw error('HANDOFF_STORE_LIMIT','Incoming batch does not fit local retention');
  await persist(active,source);
  return {saved,expired,evicted,entries:active};
 }
 return Object.freeze({
  save:raw=>run(async at=>{
   const incoming=await entry(raw),result=await add([incoming],at);
   return frozen({status:result.saved.length?'saved':'unchanged',entry:metadata(result.entries.find(e=>e.view.record.id===incoming.view.record.id)),expired:result.expired,evicted:result.evicted});
  }),
  list:()=>run(async at=>{
   const {source,entries}=await load(),{active,expired}=retained(entries,at);await persist(active,source);
   return frozen({entries:active.map(metadata),expired});
  }),
  open:id=>run(async at=>{
   if(typeof id!=='string')throw error('INVALID_HANDOFF_ID');
   const {source,entries}=await load(),{active}=retained(entries,at),e=active.find(item=>item.view.record.id===id);
   let view=e?.view;
   if(e?.view.version===2){
    const parent=active.find(item=>item.digest===e.view.record.lineage.parentArtifactDigest);
    if(parent)view=await readHandoffFile(e.raw,{parentRaw:parent.raw});
   }
   await persist(active,source);
   return e?frozen({...view,raw:e.raw,digest:e.digest,representation:e.representation}):null;
  }),
  remove:(id,expectedDigest)=>run(async at=>{
   if(typeof id!=='string'||typeof expectedDigest!=='string'||!/^[a-f0-9]{64}$/.test(expectedDigest))throw error('STALE_HANDOFF_RECORD');
   const {source,entries}=await load(),{active,expired}=retained(entries,at),e=active.find(item=>item.view.record.id===id);
   if(e&&e.digest!==expectedDigest)throw error('STALE_HANDOFF_RECORD','Stored bytes differ; reopen before removing');
   await persist(active.filter(item=>item!==e),source);return frozen({removed:!!e,expired});
  }),
  importLegacy:raw=>run(async at=>{
   if(typeof raw!=='string'||bytes(raw)>MAX_BYTES)throw error('INVALID_HANDOFF_LEGACY');
   let items;try{items=JSON.parse(raw);}catch{throw error('INVALID_HANDOFF_LEGACY');}
   if(!Array.isArray(items)||items.length>MAX_ITEMS)throw error('INVALID_HANDOFF_LEGACY');
   const incoming=[];
   for(const item of items){
    let e;try{e=await entry(JSON.stringify(item),'legacy-reserialized');}catch{throw error('INVALID_HANDOFF_LEGACY');}
    if(e.view.version!==1)throw error('INVALID_HANDOFF_LEGACY');incoming.push(e);
   }
   const result=await add(incoming,at);return frozen({saved:result.saved,expired:result.expired,evicted:result.evicted});
  })
 });
}
