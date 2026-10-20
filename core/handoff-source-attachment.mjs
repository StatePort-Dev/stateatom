// SPDX-License-Identifier: Apache-2.0
// Explicit attachment codec. Data comparisons never confer app authority.
import{portableSourcePath}from'./diagnostic.mjs';
import{filterHandoffReviewText}from'./handoff-content.mjs';
import{omitHandoffFields}from'./handoff-report.mjs';
import{redactReviewedHandoff}from'./handoff-reviewed.mjs';
import{parseHandoffReport,appendHandoffFinding,handoffArtifactDigest}from'./handoff-files.mjs';
import{createHandoffSourceEvidence,sourceEvidenceReporterAnchors}from'./handoff-source-evidence.mjs';
const PROFILE='source-evidence/1',BASES=['minimal-snapshot/1','reviewed-snapshot/1'],MAX=1048576;
const extras=['baseProfile','sourceEvidence','evidencePrivacy','sourceEvidenceDigest','evidenceLimitations'];
const common=['schema','version','kind','profile','id','createdAt','revision','report','reportDigest','lineage','additions','privacy','limitations'];
const scope='Historical local source byte comparison only; no selected-occurrence or execution join.';
const limits=['Historical local source-byte comparisons; not independently reverified on import.','Content match is not execution, selected-occurrence identity, value ancestry or a successful fix.','Recorded collected-source sample hashes are not full application build attestation.','No hidden source bytes, source resolution, app mutation, replay, production grant or action authority.','Explicitly included paths remain private information requiring review before sharing.'];
const error=(code,message=code)=>Object.assign(new Error(message),{code}),fail=message=>{throw error('INVALID_SOURCE_ATTACHMENT',message);};
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x),uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x),integer=(x,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
const iso=x=>typeof x==='string'&&Number.isFinite(Date.parse(x))&&new Date(Date.parse(x)).toISOString()===x;
const canonical=x=>JSON.stringify(function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}(x));
const equal=(a,b)=>canonical(a)===canonical(b),freeze=x=>{if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;};
function keys(x,names){if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).length!==names.length||names.some(k=>!Object.hasOwn(x,k)))fail('Unexpected attachment fields');}
function own(x,names){if(!x||typeof x!=='object'||Array.isArray(x)||![Object.prototype,null].includes(Object.getPrototypeOf(x)))fail('Own plain input required');const d=Object.getOwnPropertyDescriptors(x),out={};for(const k of Reflect.ownKeys(d)){if(typeof k!=='string'||!names.includes(k)||!Object.hasOwn(d[k],'value'))fail('Unknown input or accessor');out[k]=d[k].value;}return out;}
function dense(x,max){if(!Array.isArray(x)||Object.getPrototypeOf(x)!==Array.prototype)fail('Dense own array required');const d=Object.getOwnPropertyDescriptors(x),n=d.length.value;if(n>max||Reflect.ownKeys(d).length!==n+1)fail('Array bound or decoration');const out=[];for(let i=0;i<n;i++){if(!d[i]||!Object.hasOwn(d[i],'value'))fail('Sparse/accessor array');out.push(d[i].value);}return out;}
function json(raw){if(typeof raw!=='string')fail('JSON text required');if(new TextEncoder().encode(raw).length>MAX)throw error('HANDOFF_LIMIT');let r;try{r=JSON.parse(raw);}catch{fail('Malformed JSON');}const stack=[[r,0]];let n=0;while(stack.length){const[v,d]=stack.pop();if(++n>10000||d>16||typeof v==='string'&&v.length>16384)throw error('HANDOFF_LIMIT');if(v&&typeof v==='object')for(const[k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))fail('Forbidden key');stack.push([x,d+1]);}}return r;}
function baseView(record){if(BASES.includes(record?.profile))return structuredClone(record);if(record?.profile!==PROFILE||!BASES.includes(record.baseProfile))throw error('UNSUPPORTED_HANDOFF_FORMAT');const r=structuredClone(record);for(const k of extras)delete r[k];r.profile=record.baseProfile;return r;}
function clock(now){if(now!==undefined&&typeof now!=='function')fail('Explicit clock must be a function');const n=now?now():Date.now();if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>8640000000000000)fail('Invalid clock');return n;}
function note(value,withBuild=false){const n=own(value,withBuild?['text','build']:['text']);if(typeof n.text!=='string'||!n.text.trim()||n.text.length>4096||withBuild&&n.build!==undefined&&n.build!==null&&!hash(n.build))fail('Bounded Developer note required');return{text:n.text,...(withBuild?{build:n.build??null}:{})};}
function choice(value,withFiles){const c=own(value,withFiles?['includeFiles','expectedParentDigest','now']:['expectedParentDigest','now']),includeFiles=withFiles&&Object.hasOwn(c,'includeFiles')?dense(c.includeFiles,8):[];if(includeFiles.some(x=>!portableSourcePath(x))||new Set(includeFiles).size!==includeFiles.length)fail('Unique safe file consent required');return{includeFiles,expectedParentDigest:c.expectedParentDigest,at:clock(c.now)};}
function sourceReference(r){keys(r,['schema','version','id','digest','createdAt','capturedAt','build','freshness','trust']);if(r.schema!=='stateatom.diagnostic'||r.version!==1||!uuid(r.id)||!hash(r.digest)||!iso(r.createdAt)||r.capturedAt!==null&&(typeof r.capturedAt!=='number'||!Number.isFinite(r.capturedAt)||r.capturedAt<0||r.capturedAt>8640000000000000)||r.build!==null&&!hash(r.build)||!['Recorded','Stale'].includes(r.freshness)||r.trust!=='untrusted-historical-reference')fail('Invalid Developer diagnostic reference');}
const relation=(a,b)=>!a||!b?'unknown':a===b?'same-hash':'different-hash';
function comparison(r,reporter,developer){keys(r,['reporter','developer','relation','domain','scope']);if(r.reporter!==reporter.build||r.developer!==developer.build||r.relation!==relation(reporter.build,developer.build)||r.domain!=='recorded-collected-source-sample-hash'||r.scope!=='Equality of recorded sample-set hashes only; not a full application build attestation.')fail('Invalid recorded build comparison');}
function indices(x){if(!Array.isArray(x)||x.length>32||x.some((n,i)=>!integer(n,31)||i>0&&n<=x[i-1]))fail('Invalid source indices');}
function fileCheck(f,base,packet){
 keys(f,['file','bytes','digest','reporterDigest','developerDigest','reporterIndices','developerIndices','status','reasons','developerKind']);if(!portableSourcePath(f.file)||filterHandoffReviewText(f.file)!==f.file||!integer(f.bytes,262144)||!hash(f.digest)||f.reporterDigest!==null&&!hash(f.reporterDigest)||f.developerDigest!==null&&!hash(f.developerDigest))fail('Invalid source file comparison');indices(f.reporterIndices);indices(f.developerIndices);
 const anchors=sourceEvidenceReporterAnchors(base).filter(x=>x.file===f.file),reporterDigest=anchors.length===1?anchors[0].digest:null;
 if(!equal(f.reporterIndices,anchors.map(x=>x.index).sort((a,b)=>a-b))||f.reporterDigest!==reporterDigest)fail('Reporter anchors differ from retained content');
 const dn=f.developerIndices.length;if(dn!==1&&f.developerDigest!==null||f.developerKind!==(dn===0?'missing':dn>1?'ambiguous':f.developerKind)||dn===1&&!['Code-linked','unavailable'].includes(f.developerKind))fail('Invalid Developer source-kind comparison');
 const reasons=[],build=packet.buildComparison.relation,reporter=base.report.sourceDiagnostic,developer=packet.developerDiagnostic;
 if(build==='unknown')reasons.push('recorded-build-missing');else if(build==='different-hash')reasons.push('recorded-build-mismatch');if(reporter.freshness!=='Recorded')reasons.push('reporter-snapshot-stale');if(developer.freshness!=='Recorded')reasons.push('developer-snapshot-stale');
 if(!anchors.length)reasons.push('reporter-source-anchor-missing');else if(anchors.length>1)reasons.push('reporter-source-ambiguous');if(!dn)reasons.push('developer-source-anchor-missing');else if(dn>1)reasons.push('developer-source-ambiguous');if(dn===1&&f.developerKind==='unavailable')reasons.push('developer-source-kind-unavailable');if(dn===1&&!f.developerDigest)reasons.push('developer-source-digest-missing');if(reporterDigest&&f.developerDigest&&reporterDigest!==f.developerDigest)reasons.push('recorded-source-digest-mismatch');if(reporterDigest&&reporterDigest!==f.digest||f.developerDigest&&f.developerDigest!==f.digest)reasons.push('local-bytes-mismatch');
 if(!equal(reasons,f.reasons)||f.status!==(reasons.length?'unjoined':'content-matched'))fail('Invalid comparison reasons or status');
}
function packetCheck(p,r,base){
 keys(p,['kind','findingId','createdAt','parentArtifactDigest','parentReportDigest','developerDiagnostic','buildComparison','files','omittedFiles','scope']);const n=r.additions.find(n=>n.id===p.findingId);
 if(p.kind!=='local-source-byte-comparison'||!n||p.createdAt!==n.createdAt||!hash(p.parentArtifactDigest)||p.parentArtifactDigest!==n.parentArtifactDigest||(!hash(p.parentReportDigest)||r.lineage.kind==='developer-addition'&&p.findingId===r.additions.at(-1).id&&p.parentReportDigest!==r.reportDigest)||p.scope!==scope||!Array.isArray(p.files)||p.files.length>8||!integer(p.omittedFiles,8)||p.files.length+p.omittedFiles>8)fail('Invalid comparison packet');sourceReference(p.developerDiagnostic);comparison(p.buildComparison,r.report.sourceDiagnostic,p.developerDiagnostic);if(n.build!==p.developerDiagnostic.build)fail('Note build differs from supplied Developer diagnostic');let size=0;const paths=new Set();for(const f of p.files){fileCheck(f,base,p);if(paths.has(f.file)||(size+=f.bytes)>524288)fail('Packet file budget or duplicate');paths.add(f.file);}
}
async function decode(raw){
 const r=json(raw);keys(r,[...common,...extras]);if(r.schema!=='stateatom.diagnostic'||r.version!==2||r.kind!=='historical-diagnostic'||r.profile!==PROFILE||!BASES.includes(r.baseProfile))throw error('UNSUPPORTED_HANDOFF_FORMAT');if(!hash(r.sourceEvidenceDigest))fail('Missing attachment checksum');if(await handoffArtifactDigest(canonical({sourceEvidence:r.sourceEvidence,evidencePrivacy:r.evidencePrivacy}))!==r.sourceEvidenceDigest)throw error('HANDOFF_EVIDENCE_INTEGRITY','Source comparison checksum differs. Original files unchanged.');
 const base=baseView(r);await parseHandoffReport(canonical(base));if(!['developer-addition','privacy-derivative'].includes(r.lineage.kind))fail('Unknown attachment lineage');keys(r.evidencePrivacy,['omittedAttachments']);if(!integer(r.evidencePrivacy.omittedAttachments)||!equal(r.evidenceLimitations,limits)||!Array.isArray(r.sourceEvidence)||r.sourceEvidence.length>8||!r.sourceEvidence.length&&!r.evidencePrivacy.omittedAttachments)fail('Invalid attachment limits/privacy');const ids=new Set();for(const p of r.sourceEvidence){packetCheck(p,r,base);if(ids.has(p.findingId))fail('Duplicate attachment finding');ids.add(p.findingId);}return r;
}
async function parseAny(raw){const r=json(raw);return r?.profile===PROFILE?decode(raw):(await parseHandoffReport(raw)).record;}
async function validateBaseContinuity(r,p){
 // Public bytes/counters are checked independently. These private views adapt
 // only the digest namespace and bounded counter delta for the strict base
 // semantic checker; no public baseline, note or omission count is rewritten.
 const previousView=baseView(p),next=baseView(r);
 if(r.lineage.kind==='privacy-derivative'){
  const removed=p.additions.length-r.additions.length,count=p.privacy.omittedDeveloperFindings+removed;if(removed<0||!integer(count)||r.privacy.omittedDeveloperFindings!==count)throw error('HANDOFF_PARENT_MISMATCH');
  previousView.privacy.omittedDeveloperFindings=0;next.privacy.omittedDeveloperFindings=removed;
 }
 const previous=canonical(previousView),shadowDigest=await handoffArtifactDigest(previous);next.lineage.parentArtifactDigest=shadowDigest;
 if(next.lineage.kind==='developer-addition')next.additions.at(-1).parentArtifactDigest=shadowDigest;
 await parseHandoffReport(canonical(next),{parentRaw:previous});
}
function subsequence(oldRows,nextRows){let at=0;for(const row of nextRows){while(at<oldRows.length&&!equal(oldRows[at],row))at++;if(at===oldRows.length)return false;at++;}return true;}
async function parentCheck(r,parentRaw){
 const p=await parseAny(parentRaw),digest=await handoffArtifactDigest(parentRaw),previous=p.profile===PROFILE?p.sourceEvidence:[],privacy=p.profile===PROFILE?p.evidencePrivacy:{omittedAttachments:0},baseProfile=p.profile===PROFILE?p.baseProfile:p.profile;
 if(r.id===p.id||r.revision!==p.revision+1||r.baseProfile!==baseProfile||r.lineage.parentArtifactDigest!==digest||r.lineage.parentReportDigest!==p.reportDigest)throw error('HANDOFF_PARENT_MISMATCH');
 await validateBaseContinuity(r,p);
 if(r.lineage.kind==='developer-addition'){
  const added=r.sourceEvidence.slice(previous.length);if(!equal(r.evidencePrivacy,privacy)||!equal(r.sourceEvidence.slice(0,previous.length),previous)||added.length>1||added.length===1&&(added[0].findingId!==r.additions.at(-1).id||added[0].parentArtifactDigest!==digest))throw error('HANDOFF_PARENT_MISMATCH');return;
 }
 let at=0;for(const packet of r.sourceEvidence){while(at<previous.length&&previous[at].findingId!==packet.findingId)at++;if(at===previous.length)throw error('HANDOFF_PARENT_MISMATCH');const before=previous[at++],expected={...before,files:packet.files,omittedFiles:before.omittedFiles+before.files.length-packet.files.length};if(!equal(expected,packet)||!subsequence(before.files,packet.files))throw error('HANDOFF_PARENT_MISMATCH');}
 const attachmentCount=privacy.omittedAttachments+(previous.length-r.sourceEvidence.length),noteCount=p.privacy.omittedDeveloperFindings+(p.additions.length-r.additions.length);if(!integer(attachmentCount)||!integer(noteCount)||r.evidencePrivacy.omittedAttachments!==attachmentCount||r.privacy.omittedDeveloperFindings!==noteCount)throw error('HANDOFF_PARENT_MISMATCH');
}
export async function parseHandoffSourceEvidence(raw,options={}){const d=own(options,['parentRaw']),r=await decode(raw);let parentStatus='not-checked';if(Object.hasOwn(d,'parentRaw')){await parentCheck(r,d.parentRaw);parentStatus='content-matched';}return freeze({record:r,trust:'historical-untrusted',parentStatus});}
async function emit(r){r.sourceEvidenceDigest=await handoffArtifactDigest(canonical({sourceEvidence:r.sourceEvidence,evidencePrivacy:r.evidencePrivacy}));const raw=canonical(r);await decode(raw);return raw;}
async function childBase(p,parentRaw,n,c){const digest=await handoffArtifactDigest(parentRaw);if(!hash(c.expectedParentDigest)||c.expectedParentDigest!==digest)throw error('STALE_HANDOFF_PARENT');const raw=canonical(baseView(p)),child=(await parseHandoffReport(await appendHandoffFinding(raw,n,{expectedParentDigest:await handoffArtifactDigest(raw),now:()=>c.at}))).record,r=structuredClone(child);r.lineage.parentArtifactDigest=digest;r.additions.at(-1).parentArtifactDigest=digest;return{...r,profile:PROFILE,baseProfile:child.profile,sourceEvidence:structuredClone(p.profile===PROFILE?p.sourceEvidence:[]),evidencePrivacy:structuredClone(p.profile===PROFILE?p.evidencePrivacy:{omittedAttachments:0}),evidenceLimitations:[...limits]};}
export async function appendHandoffSourceEvidence(parentRaw,developerDiagnosticRaw,files,finding,options={}){
 const n=note(finding),c=choice(options,true),view=canonical(baseView(json(parentRaw)));
 // Starting the model immediately snapshots external file buffers before the first await.
 const model=await createHandoffSourceEvidence(view,developerDiagnosticRaw,files),p=await parseAny(parentRaw);for(const name of c.includeFiles)if(!model.sourceChecks.some(f=>f.file===name))fail('Unknown file consent');const r=await childBase(p,parentRaw,{text:n.text,build:model.developer.build},c),newNote=r.additions.at(-1),selected=model.sourceChecks.filter(f=>c.includeFiles.includes(f.file)).map(f=>({...f,developerKind:f.developerIndices.length===0?'missing':f.developerIndices.length>1?'ambiguous':f.reasons.includes('developer-source-kind-unavailable')?'unavailable':'Code-linked'}));
 r.sourceEvidence.push({kind:'local-source-byte-comparison',findingId:newNote.id,createdAt:newNote.createdAt,parentArtifactDigest:await handoffArtifactDigest(parentRaw),parentReportDigest:p.reportDigest,developerDiagnostic:structuredClone(model.developer),buildComparison:structuredClone(model.buildComparison),files:selected,omittedFiles:model.sourceChecks.length-selected.length,scope});return emit(r);
}
export async function appendSourceEvidenceNote(raw,finding,options={}){const n=note(finding,true),c=choice(options,false),p=await decode(raw);return emit(await childBase(p,raw,n,c));}

function reviewSnapshot(value){
 const c=own(value,['omitIssueFields','omitCategories','omitFields','replaceFields','omitNotes','omitEvidence','omitEvidenceFiles']);
 for(const[name,max]of[['omitIssueFields',5],['omitCategories',13],['omitFields',2048],['omitNotes',8],['omitEvidence',8]])if(Object.hasOwn(c,name)){c[name]=dense(c[name],max);if(c[name].some(x=>typeof x!=='string')||new Set(c[name]).size!==c[name].length)fail('Unique own omission choices required');}
 if(Object.hasOwn(c,'replaceFields'))c.replaceFields=dense(c.replaceFields,2048).map(x=>{const d=own(x,['id','text']);if(typeof d.id!=='string'||typeof d.text!=='string')fail('Replacement must be own text');return{id:d.id,text:d.text};});
 if(Object.hasOwn(c,'omitEvidenceFiles'))c.omitEvidenceFiles=dense(c.omitEvidenceFiles,8).map(x=>{const d=own(x,['findingId','files']);if(typeof d.findingId!=='string')fail('Packet finding required');const files=dense(d.files,8);if(files.some(f=>!portableSourcePath(f))||new Set(files).size!==files.length)fail('Unique own packet file omissions required');return{findingId:d.findingId,files};});
 return c;
}
function affectedSourceFile(before,after,file){
 if(before.profile!=='reviewed-snapshot/1')return false;const old=before.report.technicalEvidence.fields,next=new Map(after.report.technicalEvidence.fields.map(f=>[f.id,f]));
 for(const field of old){const m=/^\/sources\/(\d+)\/(file|sourceDigest)$/.exec(field.sourcePointer);if(!m||equal(field,next.get(field.id)))continue;const path=old.find(f=>f.sourcePointer==='/sources/'+m[1]+'/file');if(file.reporterIndices.includes(Number(m[1]))||['included','filtered','replaced'].includes(path?.state)&&path.value===file.file)return true;}
 return false;
}
export async function redactHandoffSourceEvidence(raw,review={},options={}){
 const c=reviewSnapshot(review),o=choice(options,false),p=await decode(raw),digest=await handoffArtifactDigest(raw);if(!hash(o.expectedParentDigest)||o.expectedParentDigest!==digest)throw error('STALE_HANDOFF_PARENT');
 const packetIds=new Set(p.sourceEvidence.map(x=>x.findingId)),omitted=new Set(c.omitEvidence??[]),fileOmissions=new Map();for(const id of omitted)if(!packetIds.has(id))fail('Unknown packet omission');
 for(const item of c.omitEvidenceFiles??[]){const packet=p.sourceEvidence.find(x=>x.findingId===item.findingId);if(!packet||fileOmissions.has(item.findingId)||item.files.some(file=>!packet.files.some(x=>x.file===file)))fail('Unknown or duplicate packet file omission');fileOmissions.set(item.findingId,new Set(item.files));}
 const base=baseView(p),baseRaw=canonical(base);let child;
 if(p.baseProfile==='minimal-snapshot/1'){
  if((c.omitCategories?.length??0)||(c.omitFields?.length??0)||(c.replaceFields?.length??0))throw error('UNSUPPORTED_SOURCE_PRIVACY','Minimal profile has no granular source fields.');
  const notes=new Set(p.additions.map(n=>n.id));if((c.omitNotes??[]).some(id=>!notes.has(id)))fail('Unknown note omission');if((c.omitNotes?.length??0)!==notes.size)throw error('UNSUPPORTED_SOURCE_PRIVACY','Minimal profile requires explicit omission of all Developer notes.');
  child=(await parseHandoffReport(await omitHandoffFields(baseRaw,c.omitIssueFields??[],{now:()=>o.at}))).record;
 }else{
  const baseReview=Object.fromEntries(['omitIssueFields','omitCategories','omitFields','replaceFields','omitNotes'].filter(k=>Object.hasOwn(c,k)).map(k=>[k,c[k]]));child=(await parseHandoffReport(await redactReviewedHandoff(baseRaw,baseReview,{expectedParentDigest:await handoffArtifactDigest(baseRaw),now:()=>o.at}))).record;
 }
 const r=structuredClone(child),noteIds=new Set(r.additions.map(n=>n.id)),allSourcePaths=(c.omitCategories??[]).includes('sourceLocations'),packets=[];
 for(const packet of p.sourceEvidence){if(omitted.has(packet.findingId)||!noteIds.has(packet.findingId))continue;const files=packet.files.filter(file=>!allSourcePaths&&!fileOmissions.get(packet.findingId)?.has(file.file)&&!affectedSourceFile(base,child,file));packets.push({...packet,files,omittedFiles:packet.omittedFiles+packet.files.length-files.length});}
 const count=p.evidencePrivacy.omittedAttachments+(p.sourceEvidence.length-packets.length);if(!integer(count))throw error('HANDOFF_LIMIT');r.lineage.parentArtifactDigest=digest;
 return emit({...r,profile:PROFILE,baseProfile:p.baseProfile,sourceEvidence:packets,evidencePrivacy:{omittedAttachments:count},evidenceLimitations:[...limits]});
}
