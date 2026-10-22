// SPDX-License-Identifier: Apache-2.0
// Passive reviewed projection. No native adapter, collector, browser or authority.
import {assertUniqueHandoffJSONMembers} from './handoff-json.mjs';
import {createHandoffDraft} from './handoff-draft.mjs';
import {parseDiagnostic} from './diagnostic.mjs';
import {createHandoffInputEvidence} from './handoff-input-evidence.mjs';
import {filterHandoffReviewText} from './handoff-content.mjs';
import {parseStoppedProductionObservation,productionObservationStructure,validateProductionObservationStructure} from './production-observation-data.mjs';
import {observationFail as fail,observationError as error,observationHash as hash,observationUUID as uuid,observationTime as time,observationISO as iso,observationCanonical as canonical,observationEqual as equal,observationDigest as digest,observationOwn as own,observationArray as array,observationKeys as keys,observationJSON as json,observationFrozen as frozen,observationClock as clock} from './handoff-observation-data.mjs';
export const handoffObservationCategories=Object.freeze({observationIdentities:'Observation identities',observationLocations:'Observed origins and error positions',observationValues:'Selected boolean samples'});
const categories=Object.keys(handoffObservationCategories),scope='Bounded MAIN-frame production observations; temporal co-presence does not establish selected-property dependency.';
const trust='Historical untrusted claims, not independently reverified. No observation owner, permission, mutation, source-navigation, replay or runtime authority.';
const limits=['Earlier and later history is missing. Pending requests at Stop have unobserved terminal outcomes, not cancellation or undo.','Checkpoints are sampled native read intervals; actual DOM mutation times and intervening changes are unobserved.','HTTP status, transport completion, native input acknowledgements and application consumption are separate claims. Dependency and complete restoration remain unknown.','Bodies, headers, query/path details, messages, stacks, source, form values and selected text are ineligible for this packet.','Optional fields are excluded by default. Filtering is limited to known patterns, not a guarantee of PII removal. Reviewer replacements are not observations.','Exact saved diagnostic references and private acquisition digests remain provenance metadata, not native attestation or full application build identity.'];
const bindingReasons=['selected-context-missing','selected-context-differs','selected-context-stale'];
const fieldsKey=['path','category','type'];
function strings(value,allowed){const a=array(value,1024);if(a.some(x=>typeof x!=='string'||allowed&&!allowed.includes(x))||new Set(a).size!==a.length)fail('Unique known review choices required');return a;}
function choices(value,privacy=false){
 const o=own(value,privacy?['omitCategories','omitFields','replaceFields']:['includeCategories','includeFields','omitFields','replaceFields']),out={};
 for(const [k,v] of Object.entries(o))if(k==='replaceFields'){out[k]=array(v,1024).map(x=>{const r=own(x,['id','text']);if(typeof r.id!=='string'||typeof r.text!=='string'||r.text.length>4096)fail('Bounded reviewer replacement required');return{id:r.id,text:filterHandoffReviewText(r.text)};});if(new Set(out[k].map(r=>r.id)).size!==out[k].length)fail('Duplicate reviewer replacement');}else out[k]=strings(v,k.endsWith('Categories')?categories:null);
 return out;
}
function definitions(s){
 const fields=[],add=(path,category,type,label)=>fields.push({path,category,type,label});
 add('/window','observationIdentities','uuid','Window identity');add('/identity/tabId','observationIdentities','tab','Tab identity');for(const k of ['run','document','frame'])add('/identity/'+k,'observationIdentities','opaque',k+' identity');
 add('/identity/origin','observationLocations','origin','Selected origin');add('/target/node','observationIdentities','opaque','Selected native node');if(s.target.property==='disabled')add('/target/value','observationValues','bool','Original selected disabled');
 for(const r of s.records){const path='/records/'+r.sequence,label='Record '+(r.sequence+1)+' · ';
  if(r.kind==='network'){add(path+'/requestId','observationIdentities','opaque',label+'request identity');add(path+'/origin','observationLocations','origin',label+'request origin');}
  if(r.kind==='error'&&r.locationRecorded){add(path+'/origin','observationLocations','origin',label+'error origin');add(path+'/line','observationLocations','position',label+'zero-based error line');add(path+'/column','observationLocations','position',label+'zero-based error column');}
  if(r.kind==='dom'&&r.valueRecorded)add(path+'/value','observationValues','bool',label+'sampled disabled');
 }
 return fields;
}
function originalFields(s){
 const values={'/window':s.windowId,'/identity/tabId':s.identity.tabId,'/identity/run':s.identity.run,'/identity/document':s.identity.document,'/identity/frame':s.identity.frame,'/identity/origin':s.identity.origin,'/target/node':s.target.node};
 if(s.target.property==='disabled')values['/target/value']=s.target.value.value;
 for(const [i,r] of s.records.entries()){const p='/records/'+i;if(r.kind==='network'){values[p+'/requestId']=r.requestId;values[p+'/origin']=r.route.origin;}if(r.kind==='error'&&r.location){for(const k of ['origin','line','column'])values[p+'/'+k]=r.location[k];}if(r.kind==='dom'&&r.value.state==='included')values[p+'/value']=r.value.value;}
 return values;
}
export function handoffObservationFieldLabel(path,observation){const f=definitions(observation).find(f=>f.path===path);if(!f)fail('Unknown observation field');return f.label;}
function filtered(value){if(typeof value!=='string')return{state:'included',value};const clean=filterHandoffReviewText(value);return clean===value?{state:'included',value}:{state:'filtered',value:clean,reason:'known-secret-pattern'};}
function project(defs,values,c){
 const known=new Set(defs.map(f=>f.path)),included=new Set(c.includeFields||[]),omitted=new Set(c.omitFields||[]),replacement=new Map((c.replaceFields||[]).map(f=>[f.id,f.text]));
 for(const p of [...included,...omitted,...replacement.keys()])if(!known.has(p))fail('Unknown observation review field');for(const p of included)if(omitted.has(p)||replacement.has(p))fail('Conflicting observation review choices');for(const p of omitted)if(replacement.has(p))fail('Conflicting observation review choices');
 return defs.map(f=>{const base=Object.fromEntries(fieldsKey.map(k=>[k,f[k]]));if(replacement.has(f.path))return{...base,state:'replaced',value:replacement.get(f.path),attribution:'reviewer-redaction',reason:'reviewer-replacement-not-observation'};if(omitted.has(f.path))return{...base,state:'omitted',reason:'explicit-field-omission'};if(!(c.includeCategories||[]).includes(f.category)&&!included.has(f.path))return{...base,state:'omitted',reason:'excluded-by-default'};return{...base,...filtered(values[f.path])};});
}
function metadata(fields,binding){
 const missingContext=fields.filter(f=>f.category!=='observationValues'&&f.state!=='included').map(f=>f.path);
 return{contextJoin:{state:binding.status==='capture-context-matched'&&!missingContext.length?'historical-fragment':'unverifiable',missingContext},privacy:{excludedCategories:categories.filter(c=>!fields.some(f=>f.category===c&&f.state!=='omitted')),omittedFields:fields.filter(f=>f.state==='omitted').map(f=>f.path),replacedFields:fields.filter(f=>f.state==='replaced').map(f=>f.path)}};
}
function parseCapture(raw){
 if(typeof raw!=='string')fail('Private capture JSON text required');if(new TextEncoder().encode(raw).length>2097152)throw error('Private capture exceeds2MiB','HANDOFF_LIMIT');let c;try{c=JSON.parse(raw);}catch{fail('Malformed private capture');}assertUniqueHandoffJSONMembers(raw,{maxDepth:24,maxMembers:65536});
 const stack=[[c,0]];let count=0;while(stack.length){const [x,depth]=stack.pop();if(++count>65536||depth>24)throw error('Private capture structure limit','HANDOFF_LIMIT');if(typeof x==='number'&&(!Number.isFinite(x)||Object.is(x,-0)))fail('JSON-stable private number required');if(x&&typeof x==='object')for(const [k,v] of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(k))fail('Forbidden private key');stack.push([v,depth+1]);}}
 keys(c,['schema','exportable','executable','capturedAt','inputCapture','observation','binding','limitations']);if(c.schema!=='stateatom.production-observation-capture/1'||c.exportable!==false||c.executable!==false||!time(c.capturedAt))fail('Unsupported private observation capture');if(!Array.isArray(c.limitations)||c.limitations.length>8||c.limitations.some(s=>typeof s!=='string'||s.length>1024))fail('Invalid private limitations');
 validateBinding(c.binding);return c;
}
function validateBinding(b){keys(b,['status','reasons','dependency']);if(!['capture-context-matched','unjoined'].includes(b.status)||b.dependency!=='unknown'||!Array.isArray(b.reasons)||b.reasons.length>3||new Set(b.reasons).size!==b.reasons.length||b.reasons.some(r=>!bindingReasons.includes(r))||(b.status==='capture-context-matched')!==(b.reasons.length===0))fail('Invalid selected-context consistency claim');}
export async function createHandoffObservationReview(privateRaw){
 const c=parseCapture(privateRaw),s=parseStoppedProductionObservation(JSON.stringify(c.observation));
 // Validate the original nested reply, including its original integer clock and
 // exact raw diagnostic digest. Do not rebuild or round either acquisition.
 await createHandoffInputEvidence(JSON.stringify(c.inputCapture));
 const selected=parseDiagnostic(c.inputCapture.diagnosticRaw).target;
 if(c.binding.status==='capture-context-matched'&&(selected.property!==s.target.property||selected.tab!==null&&selected.tab!==s.identity.tabId))fail('Matched selected property/tab differs from the exact diagnostic');
 const sourceDiagnostic=(await createHandoffDraft(c.inputCapture.diagnosticRaw)).read().sourceDiagnostic;
 const observation=productionObservationStructure(s),defs=definitions(observation),values=originalFields(s),acquisition={privateReplyDigest:await digest(privateRaw),capturedAt:c.capturedAt,inputCapturedAt:c.inputCapture.capturedAt};
 return Object.freeze({catalogue(){return frozen({schema:'stateatom.observation-review-catalogue',version:1,exportable:false,categoryLabels:handoffObservationCategories,fields:defs.map(f=>({...f,id:f.path,sourcePointer:f.path,available:true,defaultIncluded:false,evidenceKind:'Observed',scope,preview:filtered(values[f.path])}))});},project(review={}){const fields=project(defs,values,choices(review));return frozen({sourceDiagnostic,acquisition,observation,binding:c.binding,fields,...metadata(fields,c.binding)});}});
}
async function emit(p){p.evidenceDigest=await digest(canonical(Object.fromEntries(Object.entries(p).filter(([k])=>k!=='evidenceDigest'))));const raw=canonical(p);await decode(raw);return raw;}
export async function createHandoffObservationEvidence(privateRaw,review={},options={}){
 const c=choices(review),o=own(options,['now']),at=clock(o),model=await createHandoffObservationReview(privateRaw),p=model.project(c);
 return emit({schema:'stateatom.observation-evidence',version:1,kind:'historical-untrusted',id:crypto.randomUUID(),createdAt:at,revision:0,...p,dependency:'unknown',scope,trust,limits:[...limits],executable:false,lineage:{kind:'projection',parentArtifactDigest:null,parentEvidenceDigest:null},evidenceDigest:''});
}
function sourceReference(s){keys(s,['schema','version','id','digest','createdAt','capturedAt','build','freshness','trust']);if(s.schema!=='stateatom.diagnostic'||s.version!==1||!uuid(s.id)||!hash(s.digest)||!iso(s.createdAt)||s.capturedAt!==null&&!time(s.capturedAt)||s.build!==null&&!hash(s.build)||!['Recorded','Stale'].includes(s.freshness)||s.trust!=='untrusted-historical-reference')fail('Invalid exact diagnostic reference');}
function validateIncluded(value,type){
 if(type==='bool')return typeof value==='boolean';if(type==='tab')return Number.isSafeInteger(value)&&value>0;if(type==='position')return value===null||Number.isSafeInteger(value)&&value>=0&&value<=10000000;if(type==='uuid')return uuid(value);if(type==='opaque')return typeof value==='string'&&/^[A-Za-z0-9._:-]{1,160}$/.test(value);
 if(type==='origin'&&typeof value==='string'&&value.length<=512)try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&u.origin===value;}catch{return false;}return false;
}
async function decode(raw){
 const p=json(raw);keys(p,['schema','version','kind','id','createdAt','revision','sourceDiagnostic','acquisition','observation','binding','fields','contextJoin','privacy','dependency','scope','trust','limits','executable','lineage','evidenceDigest']);
 if(p.schema!=='stateatom.observation-evidence'||p.version!==1||p.kind!=='historical-untrusted')throw error('Unsupported observation evidence','UNSUPPORTED_OBSERVATION_EVIDENCE');
 if(!uuid(p.id)||!iso(p.createdAt)||!Number.isSafeInteger(p.revision)||p.revision<0||p.dependency!=='unknown'||p.executable!==false||p.scope!==scope||p.trust!==trust||!equal(p.limits,limits))fail('Invalid historical observation policy');
 sourceReference(p.sourceDiagnostic);keys(p.acquisition,['privateReplyDigest','capturedAt','inputCapturedAt']);if(!hash(p.acquisition.privateReplyDigest)||!time(p.acquisition.capturedAt)||!time(p.acquisition.inputCapturedAt)||Date.parse(p.sourceDiagnostic.createdAt)!==p.acquisition.inputCapturedAt)fail('Invalid exact acquisition clocks');
 validateProductionObservationStructure(p.observation);validateBinding(p.binding);const defs=definitions(p.observation);if(!Array.isArray(p.fields)||p.fields.length!==defs.length)fail('Observation field catalogue differs');
 for(const [i,f] of p.fields.entries()){
  const d=defs[i];if(fieldsKey.some(k=>f[k]!==d[k]))fail('Unknown or reordered observation field');
  if(f.state==='omitted'){keys(f,[...fieldsKey,'state','reason']);if(!['excluded-by-default','explicit-field-omission','privacy-omission'].includes(f.reason))fail('Unknown omission reason');}
  else if(f.state==='replaced'){keys(f,[...fieldsKey,'state','value','attribution','reason']);if(f.attribution!=='reviewer-redaction'||f.reason!=='reviewer-replacement-not-observation'||typeof f.value!=='string'||f.value.length>4096||filterHandoffReviewText(f.value)!==f.value)fail('Invalid reviewer replacement');}
  else if(f.state==='filtered'){keys(f,[...fieldsKey,'state','value','reason']);if(f.reason!=='known-secret-pattern'||typeof f.value!=='string'||f.value.length>4096||filterHandoffReviewText(f.value)!==f.value||!['opaque','origin'].includes(f.type))fail('Invalid filtered historical field');}
  else{keys(f,[...fieldsKey,'state','value']);if(f.state!=='included'||!validateIncluded(f.value,f.type)||typeof f.value==='string'&&filterHandoffReviewText(f.value)!==f.value)fail('Invalid included historical field');}
 }
 const meta=metadata(p.fields,p.binding);if(!equal(meta.contextJoin,p.contextJoin)||!equal(meta.privacy,p.privacy))fail('Visible context/privacy differs from retained fields');
 keys(p.lineage,['kind','parentArtifactDigest','parentEvidenceDigest']);if(p.lineage.kind==='projection'){if(p.revision!==0||p.lineage.parentArtifactDigest!==null||p.lineage.parentEvidenceDigest!==null)fail('Invalid initial observation lineage');}else if(p.lineage.kind!=='privacy-derivative'||p.revision<1||!hash(p.lineage.parentArtifactDigest)||!hash(p.lineage.parentEvidenceDigest))fail('Invalid privacy lineage');
 if(!hash(p.evidenceDigest)||p.evidenceDigest!==await digest(canonical(Object.fromEntries(Object.entries(p).filter(([k])=>k!=='evidenceDigest')))))throw error('Observation evidence checksum differs','HANDOFF_EVIDENCE_INTEGRITY');return p;
}
export async function parseHandoffObservationEvidence(raw,options={}){
 const o=own(options,['parentRaw']),p=await decode(raw);let parentStatus='not-checked';
 if(Object.hasOwn(o,'parentRaw')){const parent=await decode(o.parentRaw);if(p.lineage.kind!=='privacy-derivative'||p.id===parent.id||p.revision!==parent.revision+1||p.lineage.parentArtifactDigest!==await digest(o.parentRaw)||p.lineage.parentEvidenceDigest!==parent.evidenceDigest)fail('Exact observation parent differs');
  const mutable=['id','createdAt','revision','fields','contextJoin','privacy','lineage','evidenceDigest'];for(const k of Object.keys(parent))if(!mutable.includes(k)&&!equal(p[k],parent[k]))fail('Privacy changed recorded observations');
  for(const [i,f] of p.fields.entries()){const old=parent.fields[i];if(equal(f,old))continue;if(old.state==='omitted'||f.state!=='omitted'&&f.state!=='replaced')fail('Privacy restored or changed recorded evidence');}parentStatus='content-matched';}
 return frozen({record:p,trust:'historical-untrusted',parentStatus});
}
export async function redactHandoffObservationEvidence(raw,review={},options={}){
 const c=choices(review,true),o=own(options,['expectedParentDigest','now']),at=clock(o),p=await decode(raw);if(!hash(o.expectedParentDigest)||o.expectedParentDigest!==await digest(raw))throw error('Observation evidence changed','STALE_HANDOFF_PARENT');
 if(p.revision===Number.MAX_SAFE_INTEGER)throw error('Observation revision bound','HANDOFF_LIMIT');const known=new Set(p.fields.map(f=>f.path)),omitted=new Set(c.omitFields||[]),replaced=new Map((c.replaceFields||[]).map(f=>[f.id,f.text]));for(const path of [...omitted,...replaced.keys()])if(!known.has(path))fail('Unknown privacy field');for(const path of omitted)if(replaced.has(path))fail('Conflicting privacy choices');
 p.fields=p.fields.map(f=>{const base=Object.fromEntries(fieldsKey.map(k=>[k,f[k]]));if(replaced.has(f.path)){if(f.state==='omitted')fail('An omitted observation field cannot be restored');if((c.omitCategories||[]).includes(f.category))fail('Conflicting privacy category and replacement');return{...base,state:'replaced',value:replaced.get(f.path),attribution:'reviewer-redaction',reason:'reviewer-replacement-not-observation'};}return f.state!=='omitted'&&(omitted.has(f.path)||(c.omitCategories||[]).includes(f.category))?{...base,state:'omitted',reason:'privacy-omission'}:f;});
 return emit({...p,...metadata(p.fields,p.binding),id:crypto.randomUUID(),createdAt:at,revision:p.revision+1,lineage:{kind:'privacy-derivative',parentArtifactDigest:o.expectedParentDigest,parentEvidenceDigest:p.evidenceDigest}});
}
