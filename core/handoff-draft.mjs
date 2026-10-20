// SPDX-License-Identifier: Apache-2.0
// Internal, unimported reporter draft. Not the public diagnostic-v2 format.
// No Chrome, storage, native actions, source reads, observation collector or export.
import {parseDiagnostic} from './diagnostic.mjs';

const error=(code,message=code)=>Object.assign(new Error(message),{code});
const hex=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const fieldNames=['title','actual','expected','question','steps'];
const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');

function ownData(value,allowed,code='INVALID_HANDOFF_FIELDS'){
 if(!value||typeof value!=='object'||Array.isArray(value))throw error(code,'Plain data fields required');
 const prototype=Object.getPrototypeOf(value);
 if(prototype!==Object.prototype&&prototype!==null)throw error(code,'Plain data fields required');
 const descriptors=Object.getOwnPropertyDescriptors(value),out=Object.create(null);
 for(const key of Reflect.ownKeys(descriptors)){
  if(typeof key!=='string'||!allowed.includes(key)||!('value' in descriptors[key]))throw error(code,'Unexpected field or accessor');
  out[key]=descriptors[key].value;
 }
 return out;
}
function steps(value){
 if(!Array.isArray(value))throw error('INVALID_HANDOFF_FIELDS','Steps must be plain strings');
 const descriptors=Object.getOwnPropertyDescriptors(value),length=descriptors.length.value;
 if(length>8)throw error('HANDOFF_LIMIT','At most eight reporter steps');
 if(Reflect.ownKeys(descriptors).some(k=>k!=='length'&&(typeof k!=='string'||!/^\d+$/.test(k)||String(Number(k))!==k||Number(k)>=length)))throw error('INVALID_HANDOFF_FIELDS','Unexpected step field');
 const result=[];
 for(let i=0;i<length;i++){
  const d=descriptors[i];if(!d||!('value'in d)||typeof d.value!=='string')throw error('INVALID_HANDOFF_FIELDS','Steps must be own string values');
  if(d.value.length>512)throw error('HANDOFF_LIMIT','A step exceeds 512 UTF-16 units');
  result.push(d.value);
 }
 return result;
}
function fields(value){
 const data=ownData(value,fieldNames),out={};
 for(const key of fieldNames){
  if(!Object.hasOwn(data,key))continue;
  const v=data[key];
  if(key==='steps'){out.steps=steps(v);continue;}
  if(v===null&&key!=='title'){out[key]=null;continue;}
  if(typeof v!=='string')throw error('INVALID_HANDOFF_FIELDS',key+' must be text');
  if(v.length>(key==='title'?160:1024))throw error('HANDOFF_LIMIT',key+' exceeds its text bound');
  out[key]=key!=='title'&&v===''?null:v;
 }
 return out;
}
function finding(value){
 const data=ownData(value,['text','build']);
 if(typeof data.text!=='string'||!data.text.trim())throw error('INVALID_HANDOFF_FIELDS','A developer note is required');
 if(data.text.length>4096)throw error('HANDOFF_LIMIT','A finding exceeds 4096 UTF-16 units');
 if(data.build!==undefined&&data.build!==null&&!hex(data.build))throw error('INVALID_HANDOFF_FIELDS','Build must be an exact lowercase SHA-256 or unknown');
 return{text:data.text,build:data.build??null};
}
function readonly(value){
 const copy=structuredClone(value);
 const freeze=x=>{if(x&&typeof x==='object'){for(const child of Object.values(x))freeze(child);Object.freeze(x);}return x;};
 return freeze(copy);
}
async function sourceReference(raw){
 // Only strict inert JSON enters the legacy parser; never an application object.
 const report=parseDiagnostic(raw),build=hex(report.identity?.build)?report.identity.build:null;
 const capturedAt=typeof report.capturedAt==='number'&&Number.isFinite(report.capturedAt)&&report.capturedAt>=0&&report.capturedAt<=8640000000000000?report.capturedAt:null;
 return{
  sourceDiagnostic:{schema:'stateatom.diagnostic',version:1,id:report.id,digest:await digest(raw),createdAt:new Date(Date.parse(report.createdAt)).toISOString(),capturedAt,build,freshness:report.freshness,trust:'untrusted-historical-reference'},
  target:{property:report.target.property,value:report.target.property==='disabled'?{state:'included',value:report.target.value}:{state:'omitted',reason:'private-content-default'}}
 };
}

export async function createHandoffDraft(raw,initialFields={},options={}){
 const initial=fields(initialFields),config=ownData(options,['now'],'INVALID_HANDOFF_REQUEST'),now=Object.hasOwn(config,'now')?config.now:Date.now;
 if(typeof now!=='function')throw error('INVALID_HANDOFF_REQUEST','A host clock function is required');
 const reference=await sourceReference(raw);
 return draftActor(reference,initial,now);
}
function draftActor(reference,initial,now){
 let state={schema:'stateatom.handoff-draft',version:1,exportable:false,phase:'draft',revision:0,...reference,issue:{attribution:'reporter',title:'Selected '+reference.target.property+' condition',actual:null,expected:null,question:null,steps:[],...initial},observationWindow:{status:'not-recorded'},baseline:null,baselineDigest:null,headDigest:null,findings:[]};
 let pending=false,lastTime=null;
 const read=()=>readonly(state);
 function expected(options){
  const data=ownData(options,['expectedRevision'],'INVALID_HANDOFF_REQUEST');
  if(!Number.isSafeInteger(data.expectedRevision)||data.expectedRevision<0)throw error('INVALID_HANDOFF_REQUEST','An exact draft revision is required');
  if(data.expectedRevision!==state.revision)throw error('STALE_HANDOFF_REVISION','The draft changed; read the current revision');
  if(state.revision===Number.MAX_SAFE_INTEGER)throw error('HANDOFF_LIMIT','Revision bound reached');
 }
 function time(){
  const value=now();
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>8640000000000000||lastTime!==null&&value<lastTime)throw error('INVALID_CLOCK','Invalid or rolled-back local commit clock');
  return value;
 }
 return Object.freeze({
  read,
  update(patch,options){
   expected(options);if(state.phase!=='draft')throw error('HANDOFF_FROZEN','The original reporter baseline is locked');
   const next=fields(patch);state={...state,revision:state.revision+1,issue:{...state.issue,...next}};return read();
  },
  async freeze(options){
   expected(options);if(pending)throw error('HANDOFF_BUSY');if(state.phase==='frozen')return read();
   const before=state;pending=true;state={...before,phase:'freezing'};
   try{
    const at=time();
    const baseline={id:crypto.randomUUID(),createdAt:new Date(at).toISOString(),sourceDiagnostic:structuredClone(before.sourceDiagnostic),target:structuredClone(before.target),issue:structuredClone(before.issue),observationWindow:{status:'not-recorded'}};
    // Construction order is fixed; all fields are validated own scalar/array data.
    const baselineDigest=await digest(JSON.stringify(baseline));
    if(state.revision!==before.revision)throw error('STALE_HANDOFF_REVISION');
    state={...state,phase:'frozen',revision:before.revision+1,baseline,baselineDigest,headDigest:baselineDigest};lastTime=at;return read();
   }catch(e){state=before;throw e;}finally{pending=false;}
  },
  async appendFinding(value,options){
   expected(options);if(pending)throw error('HANDOFF_BUSY');if(state.phase!=='frozen')throw error('HANDOFF_NOT_FROZEN');
   const note=finding(value);if(state.findings.length>=8)throw error('HANDOFF_LIMIT','At most eight developer findings');
   const before=state,build=before.sourceDiagnostic.build;pending=true;
   try{
    const at=time();
    const entry={id:crypto.randomUUID(),createdAt:new Date(at).toISOString(),kind:'developer-note',evidenceStatus:'unverified-note',text:note.text,build:note.build,buildRelation:!build||!note.build?'unknown':build===note.build?'same-hash':'different-hash',revision:before.revision+1,parentDigest:before.headDigest,baselineDigest:before.baselineDigest};
    const entryDigest=await digest(JSON.stringify(entry));
    if(state.revision!==before.revision)throw error('STALE_HANDOFF_REVISION');
    state={...before,revision:before.revision+1,headDigest:entryDigest,findings:[...before.findings,{...entry,digest:entryDigest}]};lastTime=at;return read();
   }finally{pending=false;}
  }
 });
}
