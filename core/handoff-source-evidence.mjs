// SPDX-License-Identifier: Apache-2.0
// Unimported local byte comparisons. No file access, source execution or app authority.
import{parseDiagnostic,portableSourcePath}from'./diagnostic.mjs';
import{parseHandoffReport,handoffArtifactDigest}from'./handoff-files.mjs';
import{createHandoffDraft}from'./handoff-draft.mjs';
const FILE_MAX=262144,TOTAL_MAX=524288,COUNT_MAX=8;
const bufferLength=Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,'byteLength').get;
const fail=message=>{throw Object.assign(new Error(message),{code:'INVALID_SOURCE_EVIDENCE'});};
const digestBytes=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
const isHash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
function ownRecord(x,names){
 if(!x||typeof x!=='object'||Array.isArray(x)||![Object.prototype,null].includes(Object.getPrototypeOf(x)))fail('Plain own source-file data required');
 const descriptors=Object.getOwnPropertyDescriptors(x),keys=Reflect.ownKeys(descriptors);
 if(keys.length!==names.length||keys.some(k=>typeof k!=='string'||!names.includes(k)||!Object.hasOwn(descriptors[k],'value')))fail('Source-file descriptors must be exact own data');
 return Object.fromEntries(names.map(k=>[k,descriptors[k].value]));
}
function snapshotFiles(files){
 if(!Array.isArray(files)||Object.getPrototypeOf(files)!==Array.prototype)fail('Dense source-file array required');
 const d=Object.getOwnPropertyDescriptors(files),n=d.length.value;
 if(n<1||n>COUNT_MAX||Reflect.ownKeys(d).length!==n+1)fail('Choose one to eight undecorated source files');
 const paths=new Set(),result=[];let total=0;
 for(let i=0;i<n;i++){
  const p=d[i];if(!p||!Object.hasOwn(p,'value'))fail('Sparse/accessor source-file arrays are unsupported');
  const f=ownRecord(p.value,['file','bytes']);if(!portableSourcePath(f.file)||paths.has(f.file))fail('Unique safe relative source paths required');paths.add(f.file);
  if(!f.bytes||Object.getPrototypeOf(f.bytes)!==ArrayBuffer.prototype||Reflect.ownKeys(f.bytes).length)fail('Undecorated ArrayBuffer source bytes required');
  let size;try{size=bufferLength.call(f.bytes);}catch{fail('Invalid source-buffer brand');}
  if(size>FILE_MAX||(total+=size)>TOTAL_MAX)fail('Source evidence byte budget exceeded');
  let copy;try{copy=ArrayBuffer.prototype.slice.call(f.bytes,0);}catch{fail('Detached or invalid source bytes');}
  if(bufferLength.call(copy)!==size)fail('Source bytes changed during snapshot');result.push({file:f.file,bytes:new Uint8Array(copy)});
 }
 return result;
}
// Internal shared reader: input is a previously validated base-profile record.
export function sourceEvidenceReporterAnchors(record){
 if(record.profile!=='reviewed-snapshot/1')return[];
 const t=record.report.technicalEvidence,map=new Map(t.fields.map(f=>[f.id,f])),anchors=[];
 for(const g of t.joins){const index=/^source-(\d+)$/.exec(g.id);if(!index||g.kind!=='source'||g.evidenceKind!=='Code-linked')continue;
  const fields=g.fieldIds.map(id=>map.get(id)),base='/sources/'+index[1]+'/',path=fields.find(f=>f.sourcePointer===base+'file'),digest=fields.find(f=>f.sourcePointer===base+'sourceDigest');
  if(path?.state==='included'&&digest?.state==='included'&&portableSourcePath(path.value)&&isHash(digest.value))anchors.push({index:Number(index[1]),file:path.value,digest:digest.value});
 }
 return anchors;
}
export async function createHandoffSourceEvidence(reportRaw,developerDiagnosticRaw,files){
 // File objects and buffers are external mutable input. Snapshot before any hash/parse await.
 const selected=snapshotFiles(files),developerRecord=parseDiagnostic(developerDiagnosticRaw),{record}=await parseHandoffReport(reportRaw);
 const developer=(await createHandoffDraft(developerDiagnosticRaw)).read().sourceDiagnostic,reporter=record.report.sourceDiagnostic;
 const relation=!reporter.build||!developer.build?'unknown':reporter.build===developer.build?'same-hash':'different-hash',globalReasons=[];
 if(relation==='unknown')globalReasons.push('recorded-build-missing');else if(relation==='different-hash')globalReasons.push('recorded-build-mismatch');
 if(reporter.freshness!=='Recorded')globalReasons.push('reporter-snapshot-stale');if(developer.freshness!=='Recorded')globalReasons.push('developer-snapshot-stale');
 const anchors=sourceEvidenceReporterAnchors(record),sourceChecks=[];
 for(const f of selected){
  const reporterSources=anchors.filter(x=>x.file===f.file),developerSources=developerRecord.sources.map((s,index)=>({...s,index})).filter(x=>x.file===f.file),reasons=[...globalReasons];
  if(!reporterSources.length)reasons.push('reporter-source-anchor-missing');else if(reporterSources.length>1)reasons.push('reporter-source-ambiguous');
  if(!developerSources.length)reasons.push('developer-source-anchor-missing');else if(developerSources.length>1)reasons.push('developer-source-ambiguous');
  const r=reporterSources.length===1?reporterSources[0]:null,d=developerSources.length===1?developerSources[0]:null,reporterDigest=r?.digest??null,developerDigest=isHash(d?.sourceDigest)?d.sourceDigest:null;
  if(d&&d.status!=='Code-linked')reasons.push('developer-source-kind-unavailable');if(d&&!developerDigest)reasons.push('developer-source-digest-missing');
  if(reporterDigest&&developerDigest&&reporterDigest!==developerDigest)reasons.push('recorded-source-digest-mismatch');
  const digest=await digestBytes(f.bytes);if(reporterDigest&&reporterDigest!==digest||developerDigest&&developerDigest!==digest)reasons.push('local-bytes-mismatch');
  sourceChecks.push({file:f.file,bytes:f.bytes.byteLength,digest,reporterDigest,developerDigest,reporterIndices:reporterSources.map(x=>x.index),developerIndices:developerSources.map(x=>x.index),status:reasons.length?'unjoined':'content-matched',reasons});
 }
 const matched=sourceChecks.filter(x=>x.status==='content-matched').length;
 return freeze({schema:'stateatom.handoff-source-evidence/1',exportable:false,parent:{id:record.id,artifactDigest:await handoffArtifactDigest(reportRaw),reportId:record.report.id,reportDigest:record.reportDigest},developer:{...developer},buildComparison:{reporter:reporter.build,developer:developer.build,relation,domain:'recorded-collected-source-sample-hash',scope:'Equality of recorded sample-set hashes only; not a full application build attestation.'},sourceChecks,counts:{matched,unjoined:sourceChecks.length-matched},limitations:['Local byte content comparison only; not execution, selected-occurrence identity, current-value ancestry or a successful fix.','Recorded source and build claims remain historical and untrusted; hashes do not prove authorship or native capture.','Omitted source anchors are not recovered; matching names or a sibling file cannot supply missing evidence.','Private local paths require later explicit review; this internal model is not an exportable attachment.','No source fetch, app mutation, production grant, replay or action authority.']});
}
