// SPDX-License-Identifier: Apache-2.0
// Passive full public profile. No app access, executable state or authority.
import {assertUniqueHandoffJSONMembers} from './handoff-json.mjs';
import {parseHandoffReport as parseBase,redactHandoffFile,appendHandoffFinding,handoffArtifactDigest} from './handoff-files.mjs';
import {appendHandoffSourceEvidence} from './handoff-source-attachment.mjs';
import {omitHandoffFields} from './handoff-report.mjs';
import {parseHandoffInputEvidence,redactHandoffInputEvidence} from './handoff-input-evidence.mjs';
const PROFILE='input-evidence/1',BASES=['minimal-snapshot/1','reviewed-snapshot/1','source-evidence/1'],MAX=1048576,encoder=new TextEncoder();
const common=['schema','version','kind','profile','id','createdAt','revision','report','reportDigest','lineage','additions','privacy','limitations'];
const headerKeys=['profile','id','createdAt','revision','lineage'];
const sourceKeys=['baseProfile','sourceEvidence','evidencePrivacy','sourceEvidenceDigest','evidenceLimitations'];
const extraKeys=['inputBaseHeader','inputBaseDigest','inputEvidence','inputPrivacy','inputEvidenceDigest','inputLimitations'];
const limits=['Historical untrusted composed report and input-outcome claims; not independently reverified on import.','Whole-file lineage binds exact parent bytes; base and input component digests use canonical public JSON, a separate domain.','Component notes and source comparisons retain their own recorded parents; a component parent is not a claimed whole-file parent.','Native acknowledgement and response delivery do not establish application consumption, selected-property dependency, complete restoration or a verified fix.','No raw private capture, diagnostic, snapshot, source bytes, rules, plans, permissions, writer, replay or undo authority is adopted.'];
const error=(code,message=code)=>Object.assign(new Error(message),{code});
const fail=message=>{throw error('INVALID_INPUT_HANDOFF',message);};
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x);
const canonical=x=>JSON.stringify(function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}(x));
const equal=(a,b)=>canonical(a)===canonical(b);
const digest=handoffArtifactDigest;
function freeze(x){if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;}
function keys(x,names){if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).length!==names.length||names.some(k=>!Object.hasOwn(x,k)))fail('Unexpected input handoff fields');}
function own(x,names){if(!x||typeof x!=='object'||Array.isArray(x)||![Object.prototype,null].includes(Object.getPrototypeOf(x)))fail('Own plain options required');const out={};for(const k of Reflect.ownKeys(x)){const d=Object.getOwnPropertyDescriptor(x,k);if(typeof k!=='string'||!names.includes(k)||!d.enumerable||!Object.hasOwn(d,'value'))fail('Unknown option or accessor');out[k]=d.value;}return out;}
function inert(x){let nodes=0;function copy(v,depth){if(++nodes>32768||depth>8)throw error('HANDOFF_LIMIT');if(v===null||typeof v==='boolean')return v;if(typeof v==='number'){if(!Number.isFinite(v)||Object.is(v,-0))fail('JSON-stable review scalar required');return v;}if(typeof v==='string'){if(v.length>4096)throw error('HANDOFF_LIMIT');return v;}if(!v||typeof v!=='object'||!Array.isArray(v)&&![Object.prototype,null].includes(Object.getPrototypeOf(v)))fail('Inert review data required');const array=Array.isArray(v),out=array?[]:{};if(array&&Object.getPrototypeOf(v)!==Array.prototype)fail('Plain review array required');const ds=Object.getOwnPropertyDescriptors(v);if(array&&(v.length>2048||Reflect.ownKeys(ds).length!==v.length+1))fail('Review array limit or decoration');for(const k of Reflect.ownKeys(ds)){if(array&&k==='length')continue;const d=ds[k];if(typeof k!=='string'||['__proto__','constructor','prototype'].includes(k)||!d.enumerable||!Object.hasOwn(d,'value')||array&&!/^(0|[1-9]\d*)$/.test(k))fail('Unknown/accessor review data');out[k]=copy(d.value,depth+1);}if(array&&(out.length!==v.length||Object.keys(out).length!==v.length))fail('Sparse review refused');return out;}return copy(x,0);}
function integer(x){if(!Number.isSafeInteger(x)||x<0||Object.is(x,-0))fail('Invalid revision');}
function time(x){if(typeof x!=='number'||!Number.isFinite(x)||x<0||Object.is(x,-0)||x>8640000000000000)fail('Invalid clock');return x;}
function iso(x){if(typeof x!=='string'||!Number.isFinite(Date.parse(x))||new Date(Date.parse(x)).toISOString()!==x)fail('Canonical UTC time required');}
function clock(o){const fn=Object.hasOwn(o,'now')?o.now:Date.now;if(typeof fn!=='function')fail('Explicit host clock required');return time(fn());}
function next(n){integer(n);if(n===Number.MAX_SAFE_INTEGER)throw error('HANDOFF_LIMIT');return n+1;}
function json(raw){if(typeof raw!=='string')fail('Public JSON text required');if(encoder.encode(raw).length>MAX)throw error('HANDOFF_LIMIT');let r;try{r=JSON.parse(raw);}catch{fail('Malformed public report');}assertUniqueHandoffJSONMembers(raw);const stack=[[r,0]];let count=0;while(stack.length){const[v,d]=stack.pop();if(++count>10000||d>16||typeof v==='string'&&v.length>16384)throw error('HANDOFF_LIMIT');if(typeof v==='number'&&(!Number.isFinite(v)||Object.is(v,-0)))fail('JSON-stable public scalar required');if(v&&typeof v==='object')for(const[k,x]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))fail('Forbidden public key');stack.push([x,d+1]);}}return r;}
function header(base){return Object.fromEntries(headerKeys.map(k=>[k,structuredClone(base[k])]));}
function baseView(record){const base=Object.fromEntries(common.map(k=>[k,record[k]]));Object.assign(base,record.inputBaseHeader);if(base.profile==='source-evidence/1')for(const k of sourceKeys)base[k]=record[k];return structuredClone(base);}
function visible(x){return x&&['included','filtered'].includes(x.state);}
function sourceMatch(base,packet){
 const s=base.report.sourceDiagnostic,p=packet.source;
 if(p.diagnosticDigest!==s.digest||p.createdAt!==s.createdAt||p.capturedAt!==s.capturedAt||p.sampleHash!==s.build||p.freshness!==s.freshness||packet.projection.selectedObservation.property!==base.report.target.property||p.id.state==='included'&&p.id.value!==s.id)throw error('HANDOFF_SOURCE_MISMATCH','Input packet refers to a different exact saved diagnostic');
 const old=base.report.target.value,selected=packet.projection.selectedObservation.value;
 if(visible(old)&&visible(selected)&&!equal(old.value,selected.value))throw error('HANDOFF_SOURCE_MISMATCH','Original selected values differ');
}
function selectedMustBeOmitted(base){return !visible(base.report.target.value);}
function baseRows(base){return base.report.technicalEvidence.state==='reviewed-projection'?[base.report.target.value,...base.report.technicalEvidence.fields]:[];}
function overlapRows(rows){
 const categories=new Set(),fields=new Set();
 for(const f of rows){
  if(f.sourcePointer==='/target/value'){fields.add('/projection/selectedObservation/value');continue;}
  if(f.category==='selectionDetails'){categories.add('inputIdentities');categories.add('inputLocations');}
  if(['networkLocations','routePaths'].includes(f.category))categories.add('inputLocations');
  if(['responseBodies','runtimeValues','interventionValues'].includes(f.category))categories.add('inputValues');
  if(f.category==='diagnosticDetails')categories.add('inputErrors');
 }
 return {omitCategories:[...categories],omitFields:[...fields]};
}
function overlaps(before,after){const rows=new Map(baseRows(after).map(f=>[f.id,f]));return overlapRows(baseRows(before).filter(f=>['included','filtered','replaced'].includes(f.state)&&!equal(f,rows.get(f.id))));}
function priorBasePrivacy(base){return overlapRows(baseRows(base).filter(f=>f.state==='replaced'||f.state==='omitted'&&f.reason==='explicit-field-omission'));}
function mergeOmissions(...reviews){return {omitCategories:[...new Set(reviews.flatMap(x=>x.omitCategories??[]))],omitFields:[...new Set(reviews.flatMap(x=>x.omitFields??[]))]};}
function requireOverlapPrivacy(packet,review){if(!packet)return;for(const x of review.omitCategories)if(!packet.privacy.excludedCategories.includes(x))fail('Base privacy retained overlapping input category');for(const x of review.omitFields)if(!packet.privacy.omittedFields.includes(x))fail('Base privacy retained overlapping selected observation');}
function build(base,packet,omitted,at,revision,lineage){return {...structuredClone(base),profile:PROFILE,id:crypto.randomUUID(),createdAt:new Date(at).toISOString(),revision,lineage,inputBaseHeader:header(base),inputBaseDigest:'',inputEvidence:structuredClone(packet),inputPrivacy:{omittedPackets:omitted},inputEvidenceDigest:'',inputLimitations:[...limits]};}
async function decode(raw){
 const r=json(raw);if(r?.schema!=='stateatom.diagnostic'||r.version!==2||r.kind!=='historical-diagnostic'||r.profile!==PROFILE)throw error('UNSUPPORTED_HANDOFF_FORMAT');keys(r.inputBaseHeader,headerKeys);if(!BASES.includes(r.inputBaseHeader.profile))throw error('UNSUPPORTED_HANDOFF_FORMAT');keys(r,[...common,...extraKeys,...(r.inputBaseHeader.profile==='source-evidence/1'?sourceKeys:[])]);
 integer(r.revision);iso(r.createdAt);if(!uuid(r.id)||r.id===r.inputBaseHeader.id||r.revision<=r.inputBaseHeader.revision||!hash(r.inputBaseDigest)||!hash(r.inputEvidenceDigest)||!equal(r.inputLimitations,limits))fail('Invalid composed artifact identity');
 keys(r.lineage,['kind','parentArtifactDigest','parentReportDigest']);if(!['input-evidence-attachment','developer-addition','privacy-derivative'].includes(r.lineage.kind)||!hash(r.lineage.parentArtifactDigest)||!hash(r.lineage.parentReportDigest)||r.lineage.kind!=='privacy-derivative'&&r.lineage.parentReportDigest!==r.reportDigest)fail('Invalid composed lineage');
 const base=baseView(r);await parseBase(canonical(base));if(await digest(canonical(base))!==r.inputBaseDigest)fail('Public component checksum differs');if(r.lineage.kind==='developer-addition'&&(base.lineage.kind!=='developer-addition'||!base.additions.length))fail('Missing developer component addition');
 keys(r.inputPrivacy,['omittedPackets']);if(![0,1].includes(r.inputPrivacy.omittedPackets)||(r.inputEvidence===null?r.inputPrivacy.omittedPackets!==1:r.inputPrivacy.omittedPackets!==0))fail('Input omission state differs');
 if(r.inputEvidence!==null){await parseHandoffInputEvidence(canonical(r.inputEvidence));sourceMatch(base,r.inputEvidence);if(selectedMustBeOmitted(base)&&visible(r.inputEvidence.projection.selectedObservation.value))fail('Redacted original selected value retained in input packet');requireOverlapPrivacy(r.inputEvidence,priorBasePrivacy(base));}
 if(await digest(canonical({inputEvidence:r.inputEvidence,inputPrivacy:r.inputPrivacy}))!==r.inputEvidenceDigest)fail('Input packet component checksum differs');return {record:r,base};
}
async function emit(record){record.inputBaseDigest=await digest(canonical(baseView(record)));record.inputEvidenceDigest=await digest(canonical({inputEvidence:record.inputEvidence,inputPrivacy:record.inputPrivacy}));const raw=canonical(record);await decode(raw);return raw;}
async function mutation(raw,options){const o=own(options,['expectedParentDigest','now']),at=clock(o),p=await decode(raw),parentDigest=await digest(raw);if(!hash(o.expectedParentDigest)||o.expectedParentDigest!==parentDigest)throw error('STALE_HANDOFF_PARENT');return {...p,at,parentDigest};}
async function parentCheck(r,base,parentRaw){
 const rawParent=json(parentRaw),wrapped=rawParent?.profile===PROFILE,p=wrapped?await decode(parentRaw):{record:(await parseBase(parentRaw)).record};
 const old=p.record;if(r.id===old.id||r.revision!==next(old.revision)||r.lineage.parentArtifactDigest!==await digest(parentRaw)||r.lineage.parentReportDigest!==old.reportDigest)throw error('HANDOFF_PARENT_MISMATCH');
 if(r.lineage.kind==='input-evidence-attachment'){
  if(wrapped||!BASES.includes(old.profile)||!equal(base,old)||r.inputEvidence===null||r.inputPrivacy.omittedPackets!==0)throw error('HANDOFF_PARENT_MISMATCH');return;
 }
 if(!wrapped)throw error('HANDOFF_PARENT_MISMATCH');
 if(r.lineage.kind==='developer-addition'){
  if(!equal(r.inputEvidence,old.inputEvidence)||!equal(r.inputPrivacy,old.inputPrivacy)||base.lineage.kind!=='developer-addition')throw error('HANDOFF_PARENT_MISMATCH');
  await parseBase(canonical(base),{parentRaw:canonical(p.base)});return;
 }
 if(!equal(base,p.base)){if(base.lineage.kind!=='privacy-derivative')throw error('HANDOFF_PARENT_MISMATCH');await parseBase(canonical(base),{parentRaw:canonical(p.base)});}
 if(old.inputEvidence===null){if(r.inputEvidence!==null||r.inputPrivacy.omittedPackets!==1)throw error('HANDOFF_PARENT_MISMATCH');}
 else if(r.inputEvidence===null){if(r.inputPrivacy.omittedPackets!==1)throw error('HANDOFF_PARENT_MISMATCH');}
 else{if(r.inputPrivacy.omittedPackets!==old.inputPrivacy.omittedPackets)throw error('HANDOFF_PARENT_MISMATCH');if(!equal(r.inputEvidence,old.inputEvidence))await parseHandoffInputEvidence(canonical(r.inputEvidence),{parentRaw:canonical(old.inputEvidence)});requireOverlapPrivacy(r.inputEvidence,overlaps(p.base,base));}
}
export async function composeHandoffInputReport(baseRaw,packetRaw,options={}){
 const o=own(options,['expectedParentDigest','now']),at=clock(o),base=(await parseBase(baseRaw)).record;if(!BASES.includes(base.profile))throw error('UNSUPPORTED_HANDOFF_FORMAT');const parentDigest=await digest(baseRaw);if(!hash(o.expectedParentDigest)||o.expectedParentDigest!==parentDigest)throw error('STALE_HANDOFF_PARENT');let packet=(await parseHandoffInputEvidence(packetRaw)).record;sourceMatch(base,packet);
 const initialOmissions=mergeOmissions(priorBasePrivacy(base),selectedMustBeOmitted(base)&&visible(packet.projection.selectedObservation.value)?{omitFields:['/projection/selectedObservation/value']}:{});
 if(initialOmissions.omitCategories.length||initialOmissions.omitFields.length)packet=(await parseHandoffInputEvidence(await redactHandoffInputEvidence(packetRaw,initialOmissions,{expectedParentDigest:await digest(packetRaw),now:()=>at}))).record;
 return emit(build(base,packet,0,at,next(base.revision),{kind:'input-evidence-attachment',parentArtifactDigest:parentDigest,parentReportDigest:base.reportDigest}));
}
export async function parseHandoffInputReport(raw,options={}){const o=own(options,['parentRaw']);if(Object.hasOwn(o,'parentRaw')&&typeof o.parentRaw!=='string')fail('Explicit parent JSON required');const {record,base}=await decode(raw);let parentStatus='not-checked';if(Object.hasOwn(o,'parentRaw')){await parentCheck(record,base,o.parentRaw);parentStatus='content-matched';}return freeze({record,trust:'historical-untrusted',parentStatus});}
export async function handoffInputReportComponents(raw){const {record,base}=await decode(raw);return freeze({baseRaw:canonical(base),inputEvidenceRaw:record.inputEvidence===null?null:canonical(record.inputEvidence)});}
export async function advanceHandoffInputReport(raw,childBaseRaw,options={}){
 const {record:p,base,at,parentDigest}=await mutation(raw,options),child=(await parseBase(childBaseRaw,{parentRaw:canonical(base)})).record;if(child.lineage.kind!=='developer-addition'||!BASES.includes(child.profile))fail('Only a strict Developer addition may advance the public component');
 return emit(build(child,p.inputEvidence,p.inputPrivacy.omittedPackets,at,next(p.revision),{kind:'developer-addition',parentArtifactDigest:parentDigest,parentReportDigest:p.reportDigest}));
}
function baseReview(value){const review=own(value,['omitIssueFields','omitCategories','omitFields','replaceFields','omitNotes','omitEvidence','omitEvidenceFiles']);for(const x of Object.values(review))if(!Array.isArray(x))fail('Base review choices must be arrays');return review;}
async function privacyBase(base,review,at){
 if(!Object.values(review).some(x=>x.length))return base;
 const raw=canonical(base);
 if(base.profile!=='minimal-snapshot/1')return (await parseBase(await redactHandoffFile(raw,review,{expectedParentDigest:await digest(raw),now:()=>at}))).record;
 if(['omitCategories','omitFields','replaceFields','omitEvidence','omitEvidenceFiles'].some(k=>review[k]?.length))throw error('UNSUPPORTED_HANDOFF_FORMAT','Minimal component has no granular technical privacy');
 const ids=new Set(base.additions.map(n=>n.id)),selected=review.omitNotes??[];if(new Set(selected).size!==selected.length||selected.length!==ids.size||selected.some(id=>!ids.has(id)))throw error('UNSUPPORTED_HANDOFF_FORMAT','Minimal privacy requires explicit omission of all retained notes');
 return (await parseBase(await omitHandoffFields(raw,review.omitIssueFields??[],{now:()=>at}))).record;
}
export async function redactHandoffInputReport(raw,review={},options={}){
 const c=own(inert(review),['baseReview','inputReview','omitInputEvidence']);if(c.omitInputEvidence!==undefined&&typeof c.omitInputEvidence!=='boolean')fail('Whole input omission must be explicit');const b=Object.hasOwn(c,'baseReview')?baseReview(c.baseReview):{};
 const input=Object.hasOwn(c,'inputReview')?own(c.inputReview,['omitCategories','omitFields']):{};for(const[k,x]of Object.entries(input))if(!Array.isArray(x)||x.length>(k==='omitCategories'?4:2048)||x.some(v=>typeof v!=='string')||new Set(x).size!==x.length||k==='omitCategories'&&x.some(v=>!['inputIdentities','inputValues','inputLocations','inputErrors'].includes(v)))fail('Unique known input privacy choices required');if(c.omitInputEvidence&&Object.values(input).some(x=>x.length))fail('Choose whole packet omission or field privacy');
 const {record:p,base,at,parentDigest}=await mutation(raw,options),child=await privacyBase(base,b,at);let packet=p.inputEvidence,omitted=p.inputPrivacy.omittedPackets;
 if(c.omitInputEvidence){packet=null;omitted=1;}
 else if(packet===null){if(Object.values(input).some(x=>x.length))fail('Omitted input evidence cannot be restored');}
 else{
  const merged=mergeOmissions(input,overlaps(base,child),priorBasePrivacy(child)),categories=merged.omitCategories.filter(x=>!packet.privacy.excludedCategories.includes(x)),fields=merged.omitFields.filter(x=>!packet.privacy.omittedFields.includes(x));
  if(categories.length||fields.length){const packetRaw=canonical(packet);packet=(await parseHandoffInputEvidence(await redactHandoffInputEvidence(packetRaw,{omitCategories:categories,omitFields:fields},{expectedParentDigest:await digest(packetRaw),now:()=>at}))).record;}
 }
 return emit(build(child,packet,omitted,at,next(p.revision),{kind:'privacy-derivative',parentArtifactDigest:parentDigest,parentReportDigest:p.reportDigest}));
}

// Start the old component writer synchronously: it snapshots findings, options and
// source-file buffers before hashing. The full parent is validated before return.
async function appendComponent(raw,start,options,source=false){
 const o=own(options,source?['includeFiles','expectedParentDigest','now']:['expectedParentDigest','now']),at=clock(o),r=json(raw);
 if(r?.profile!==PROFILE)throw error('UNSUPPORTED_HANDOFF_FORMAT');
 const component=canonical(baseView(r)),child=start(component,{...(Object.hasOwn(o,'includeFiles')?{includeFiles:o.includeFiles}:{}),expectedParentDigest:r.inputBaseDigest,now:()=>at});
 child.catch(()=>{});
 return advanceHandoffInputReport(raw,await child,{expectedParentDigest:o.expectedParentDigest,now:()=>at});
}
export function appendHandoffInputFinding(raw,finding,options={}){
 return appendComponent(raw,(base,o)=>appendHandoffFinding(base,finding,o),options);
}
export function appendHandoffInputSource(raw,developerRaw,files,finding,options={}){
 return appendComponent(raw,(base,o)=>appendHandoffSourceEvidence(base,developerRaw,files,finding,o),options,true);
}
