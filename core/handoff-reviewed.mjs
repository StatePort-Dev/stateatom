// SPDX-License-Identifier: Apache-2.0
// Explicit unimported reviewed profile. Inert JSON only; no storage or runtime authority.
import {assertUniqueHandoffJSONMembers} from './handoff-json.mjs';
import {portableSourcePath} from './diagnostic.mjs';
import {createHandoffReport,parseHandoffReport,handoffArtifactDigest} from './handoff-report.mjs';
import {createHandoffContentReview,handoffContentPolicy as policy,filterHandoffReviewText,filterHandoffReviewValue} from './handoff-content.mjs';
const PROFILE='reviewed-snapshot/1',MAX=1048576,DATE_MAX=8640000000000000;
const issueNames=['title','actual','expected','question','steps'];
const levels=new Set(['Observed','Code-linked','Candidate','Experimentally verified','Unknown/Unsupported','Stale']);
const types=new Set(['text','json','json-text','number','boolean','digest']);
const limits=['Historical untrusted claims; not independently reverified.','Reviewed projection preserves scoped evidence and explicit omissions; missing context is not a negative dependency.','Not a State Card, executable state, replay, source resolution or action permission.','Known-secret filtering is incomplete PII protection; review included words and values.','Developer notes and matching hashes are not observed execution, fix verification or trusted authorship.'];
const absent=['u02-history-not-in-v1','action-execution-not-in-v1','observation-window-not-recorded'];
const labels=new Set(['expression','document','value','selector','elementId','tag','page','instance','tab','frame','run','freshness','status','reason','id','kind','boundary','valueOrigin','invocation','completedWrite','exchangeId','pointer','scope','executionContextId','responseStatus','requestId','scriptId','frameId','method','trust','readId','queueId','hookId','revisionId','updateId','consumptionId','adapter','rootId','hostNodeId','hostPropsId','targetId','commitId','property','marker','mechanism','observedAt','case','fullPath','digest','bundleDigest','profile','manifestId','parseId','renderId','event','registeredOn','capture','once','passive','build','sourceRevision','tabId','inspection','symbol','hook','relation','mapping','line','column','endLine','endColumn','cdpHashDomain','digestDomain','cdpHash','mapDigest','manifestDigest','verificationMethod','hasContent','sourceCount','link','originalLine','originalColumn','completedAt','name','rollback','consumed','restored','effectStatus','Selected value','Source path','Source digest','Source expression','Original notes','Original limitation','Unknown boundary','Runtime value','Network origin','Route path','Response excerpt','Response excerpt truncation','Finite trace limit','Historical read value','Action source evidence ID','Action relation evidence ID','Legacy baseline value']);
const err=(code,message=code)=>Object.assign(new Error(message),{code});
const fail=(message='Invalid reviewed historical report')=>{throw err('INVALID_HANDOFF_REPORT',message);};
const invalid=()=>{throw err('INVALID_HANDOFF_FIELDS','Plain, bounded choices required');};
const isHash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const isUUID=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v);
const iso=v=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&new Date(Date.parse(v)).toISOString()===v;
const canonical=v=>JSON.stringify(function sort(x){return Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;}(v));
const equal=(a,b)=>canonical(a)===canonical(b);
function frozen(v){const x=structuredClone(v);function freeze(o){if(o&&typeof o==='object'){for(const c of Object.values(o))freeze(c);Object.freeze(o);}return o;}return freeze(x);}
function keys(v,names){if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==names.length||names.some(k=>!Object.hasOwn(v,k)))fail('Unexpected reviewed record fields');}
function own(v,allowed){if(!v||typeof v!=='object'||Array.isArray(v)||![null,Object.prototype].includes(Object.getPrototypeOf(v)))invalid();const ds=Object.getOwnPropertyDescriptors(v),o=Object.create(null);for(const k of Reflect.ownKeys(ds)){if(typeof k!=='string'||!allowed.includes(k)||!('value'in ds[k]))invalid();o[k]=ds[k].value;}return o;}
function dense(v,max=2048){if(!Array.isArray(v))invalid();const ds=Object.getOwnPropertyDescriptors(v),n=ds.length.value;if(n>max)throw err('HANDOFF_LIMIT');if(Reflect.ownKeys(ds).length!==n+1)invalid();const a=[];for(let i=0;i<n;i++){if(!ds[i]||!('value'in ds[i]))invalid();a.push(ds[i].value);}return a;}
function snapshotChoices(value,allowed){
 const d=own(value,allowed),out={};
 for(const k of Object.keys(d))out[k]=k==='replaceFields'?dense(d[k]).map(item=>{const v=own(item,['id','text']);if(typeof v.id!=='string'||typeof v.text!=='string')invalid();if(v.text.length>4096)throw err('HANDOFF_LIMIT');return{id:v.id,text:v.text};}):dense(d[k]).map(v=>{if(typeof v!=='string')invalid();return v;});
 return out;
}
function choices(v,valid,max=2048){const a=dense(v,max);if(a.some(x=>typeof x!=='string'||!valid.has(x))||new Set(a).size!==a.length)invalid();return a;}
function int(v,max=Number.MAX_SAFE_INTEGER){if(!Number.isSafeInteger(v)||v<0||v>max)fail('Invalid integer');}
function text(v,max,nullable=false){if(nullable&&v===null)return;if(typeof v!=='string'||v.length>max)fail('Invalid bounded text');}
function clock(d){const fn=Object.hasOwn(d,'now')?d.now:Date.now;if(typeof fn!=='function')throw err('INVALID_CLOCK');const n=fn();if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>DATE_MAX)throw err('INVALID_CLOCK');return new Date(n).toISOString();}
function json(raw){if(typeof raw!=='string')fail('JSON text required');if(new TextEncoder().encode(raw).length>MAX)throw err('HANDOFF_LIMIT');let r;try{r=JSON.parse(raw);}catch{fail('Malformed JSON');}assertUniqueHandoffJSONMembers(raw);const stack=[[r,0]];let n=0;while(stack.length){const[v,d]=stack.pop();if(++n>10000||d>16||typeof v==='string'&&v.length>16384)throw err('HANDOFF_LIMIT');if(v&&typeof v==='object')for(const[k,x]of Object.entries(v)){if(['__proto__','prototype','constructor'].includes(k))fail('Forbidden key');stack.push([x,d+1]);}}return r;}
function source(v){keys(v,['schema','version','id','digest','createdAt','capturedAt','build','freshness','trust']);if(v.schema!=='stateatom.diagnostic'||v.version!==1||!isUUID(v.id)||!isHash(v.digest)||!iso(v.createdAt)||v.capturedAt!==null&&(typeof v.capturedAt!=='number'||!Number.isFinite(v.capturedAt)||v.capturedAt<0||v.capturedAt>DATE_MAX)||v.build!==null&&!isHash(v.build)||!['Recorded','Stale'].includes(v.freshness)||v.trust!=='untrusted-historical-reference')fail('Invalid source reference');}
function issue(v){keys(v,['attribution',...issueNames]);if(v.attribution!=='reporter')fail('Invalid issue attribution');text(v.title,160,true);for(const k of['actual','expected','question'])text(v[k],1024,true);if(!Array.isArray(v.steps)||v.steps.length>8)fail('Invalid steps');v.steps.forEach(s=>text(s,512));}
const pathPatterns=[
 /^\/target\/(value|selector|elementId|tag|page|instance|tab|frame)$/,
 /^\/identity\/(run|freshness)$/,/^\/notes$/,/^\/limitations\/\d+$/,
 /^\/sources\/\d+\/(file|line|column|endLine|endColumn|sourceDigest|expressions\/\d+)$/,
 /^\/runtime\/(status|reason|unknownBoundaries\/\d+)$/,
 /^\/runtime\/nodes\/\d+\/(status|file|line|column|endLine|endColumn|sourceDigest|id|kind|boundary|valueOrigin|invocation|expression|value|completedWrite|origin\/(exchangeId|pointer|scope|url))$/,
 /^\/network\/\d+\/(id|url|status|observedAt|body|bodyTruncated)$/,
 /^\/runtime\/exchangeBindings\/\d+\/(status|exchangeId|requestId|scriptId|frameId|page|run|method|scope|reason|trust|url|executionContextId|responseStatus)$/,
 /^\/runtime\/stateHandoffs\/\d+\/(status|readId|queueId|hookId|revisionId|updateId|reason|boundary|scope|valueOrigin|parsedObject\/(consumptionId|exchangeId|pointer|scope|url))$/,
 /^\/runtime\/commit\/(status|adapter|page|rootId|hostNodeId|hostPropsId|targetId|commitId|property|marker|reason|mechanism|trust|observedAt|producer\/(status|scope|reason)|source\/(file|line|column|endLine|endColumn|sourceDigest))$/,
 /^\/runtime\/firstReadProfile\/(status|fullPath|case|scope|reason|freshness|limits\/\d+|sourceProof\/(status|digest|bundleDigest|profile|manifestId)|occurrence\/(status|readId|parseId|exchangeId|requestId|updateId|renderId|targetId|commitId|run|page|frame|pointer|readValue))$/,
 /^\/runtime\/actionBindings\/\d+\/(id|event|mechanism|registeredOn|freshness|capture|once|passive|identity\/(run|frameId|document|instance|build|sourceRevision|tabId|inspection)|binding\/(expression|evidenceIds\/\d+|source\/(file|line|column|endLine|endColumn|sourceDigest))|(entry|calls\/\d+|hookRelations\/\d+)\/(status|symbol|hook|relation|reason|evidenceIds\/\d+|source\/(file|line|column|endLine|endColumn|sourceDigest))|registration\/(scriptId|mapping|line|column))$/,
 /^\/runtime\/sourceMaps\/(status|scripts\/\d+\/(scriptId|frameId|cdpHashDomain|digestDomain|executionContextId|cdpHash|digest|map\/(status|verificationMethod|mapDigest|manifestDigest|hasContent|sourceCount))|lookup\/(scriptId|link|line|column|originalLine|originalColumn))$/,
 /^\/experiment\/(status|id|scope|completedAt|trials\/\d+\/(baseline|interventions\/\d+\/(name|value|rollback|consumed|restored|effectStatus)))$/
];
function categoryFor(f){const p=f.sourcePointer;
 if(p==='/target/value')return f.type==='text'?'selectedText':null;
 if(p.startsWith('/target/')||p.startsWith('/identity/'))return'selectionDetails';
 if(p==='/notes')return'originalNotes';
 if(p.startsWith('/runtime/sourceMaps/'))return'sourceMaps';
 if(p.endsWith('/url'))return f.part==='origin'?'networkLocations':'routePaths';
 if(p.startsWith('/sources/')&&/\/expressions\/\d+$/.test(p)||p.endsWith('/expression'))return'sourceExcerpts';
 if(p.endsWith('/sourceDigest'))return null;
 if(/\/(file|line|column|endLine|endColumn)$/.test(p)&&!p.includes('/registration/'))return'sourceLocations';
 if(/^\/network\/\d+\/body$/.test(p))return'responseBodies';
 if(/^\/runtime\/nodes\/\d+\/value$/.test(p)||p.endsWith('/occurrence/readValue'))return'runtimeValues';
 if(p.startsWith('/experiment/'))return /\/(status|completedAt|consumed|restored|effectStatus)$/.test(p)?null:'interventionValues';
 if(p.startsWith('/runtime/actionBindings/'))return /\/(status|build|sourceRevision)$/.test(p)?null:'actionDetails';
 if(/\/(status|observedAt|executionContextId|responseStatus|fullPath|digest|bundleDigest|completedWrite|bodyTruncated)$/.test(p))return null;
 return'diagnosticDetails';
}
function typeFor(f){
 const p=f.sourcePointer;
 if(p==='/target/value')return f.type==='text'?'text':'boolean';
 if(p.endsWith('/bodyTruncated'))return f.type==='boolean'?'boolean':'text';
 if(/\/(sourceDigest|cdpHash|digest|bundleDigest|mapDigest|manifestDigest|build|sourceRevision)$/.test(p))return'digest';
 if(p.endsWith('/body'))return'json-text';
 if(/^\/runtime\/nodes\/\d+\/value$/.test(p)||p.endsWith('/occurrence/readValue')||p.startsWith('/experiment/')&&/\/(baseline|value|rollback)$/.test(p))return'json';
 if(/\/(completedWrite|fullPath|capture|once|passive|hasContent|consumed|restored)$/.test(p))return'boolean';
 if(/\/(line|column|endLine|endColumn|originalLine|originalColumn|executionContextId|responseStatus|observedAt|sourceCount|completedAt|tabId|inspection)$/.test(p)||/^\/target\/(tab|frame)$/.test(p)||/^\/network\/\d+\/status$/.test(p))return'number';
 return'text';
}
function contextDefinition(id){
 const standard='execution-and-dependency-not-established';
 if(id==='selection')return{kind:'selection',evidenceKind:'Observed',reason:standard,prefix:'/target/'};
 if(id==='context')return{kind:'selection',evidenceKind:'Unknown/Unsupported',reason:standard,prefix:null};
 if(/^source-\d+$/.test(id))return{kind:'source',evidenceKind:'Code-linked',reason:standard,prefix:'/sources/'+id.slice(7)+'/'};
 if(/^network-\d+$/.test(id))return{kind:'network',evidenceKind:'Observed',reason:'exchange-is-not-dependency-proof',prefix:'/network/'+id.slice(8)+'/'};
 if(/^action-\d+$/.test(id))return{kind:'action',evidenceKind:'Code-linked',reason:'execution-not-observed',prefix:'/runtime/actionBindings/'+id.slice(7)+'/'};
 if(id==='source-maps')return{kind:'map',evidenceKind:'Unknown/Unsupported',reason:'not-linked-to-selected-element',prefix:'/runtime/sourceMaps/'};
 if(id==='experiment')return{kind:'experiment',reason:'exact-occurrence-join-not-recorded',prefix:'/experiment/'};
 const prefixes={'node-':'nodes','exchange-binding-':'exchangeBindings','state-handoff-':'stateHandoffs'};
 for(const[k,path]of Object.entries(prefixes))if(new RegExp('^'+k+'\\d+$').test(id))return{kind:'runtime',reason:standard,prefix:'/runtime/'+path+'/'+id.slice(k.length)+'/'};
 if(id==='runtime')return{kind:'runtime',reason:standard,prefix:null};
 if(id==='commit')return{kind:'runtime',reason:standard,prefix:'/runtime/commit/'};
 if(id==='finite-trace')return{kind:'runtime',reason:'historical-finite-trace-not-reverified',prefix:'/runtime/firstReadProfile/'};
 return null;
}
const descriptorNames=['id','category','label','sourcePointer','evidenceKind','scope','type'];
function descriptor(f){return Object.fromEntries([...descriptorNames,...(Object.hasOwn(f,'part')?['part']:[])].map(k=>[k,f[k]]));}
function row(f){
 const meta=[...descriptorNames,...(Object.hasOwn(f||{},'part')?['part']:[])];
 if(!f||!/^f(?:0|[1-9]\d{0,3})$/.test(f.id)||!types.has(f.type)||!labels.has(f.label)||!levels.has(f.evidenceKind)||!Object.values(policy.scopes).includes(f.scope)||typeof f.sourcePointer!=='string'||!pathPatterns.some(re=>re.test(f.sourcePointer))||/\/0\d+(?:\/|$)/.test(f.sourcePointer)||f.category!==categoryFor(f)||f.type!==typeFor(f))fail('Invalid field descriptor');
 if(f.sourcePointer.endsWith('/url')){if(!['origin','path'].includes(f.part))fail('URL part required');}else if(Object.hasOwn(f,'part'))fail('Unexpected field part');
 if(f.state==='included'||f.state==='filtered'){
  keys(f,[...meta,'state','value',...(f.state==='filtered'?['reason']:[])]);
  if(f.state==='filtered'&&!['sensitive-field-context','known-secrets-or-url-details-filtered'].includes(f.reason))fail('Invalid filter reason');
  if(f.type==='boolean'&&typeof f.value!=='boolean'||f.type==='number'&&(typeof f.value!=='number'||!Number.isFinite(f.value))||f.type==='digest'&&!isHash(f.value))fail('Invalid typed field');
  if(['text','json-text'].includes(f.type))text(f.value,16384);
  if(!equal(filterHandoffReviewValue(f.value,f.type).value,f.value))fail('Unfiltered private patterns');
  if(f.sourcePointer.endsWith('/bodyTruncated')&&f.type==='text'&&f.value!=='unknown')fail('Invalid truncation state');
  if(f.sourcePointer.endsWith('/file')&&!portableSourcePath(f.value))fail('Invalid portable source path');
  if(f.part==='origin'){let u;try{u=new URL(f.value);}catch{}if(!u||!['http:','https:'].includes(u.protocol)||u.origin!==f.value)fail('Invalid origin');}
  if(f.part==='path'&&(typeof f.value!=='string'||!f.value.startsWith('/')||/[?#\u0000-\u001f\u007f]/.test(f.value)))fail('Invalid route path');
 }else if(f.state==='replaced'){keys(f,[...meta,'state','value','attribution','reason']);text(f.value,4096);if(f.attribution!=='reviewer-redaction'||f.reason!=='reviewer-replacement-not-observation'||filterHandoffReviewText(f.value)!==f.value)fail('Invalid reviewer replacement');}
 else if(f.state==='omitted'){keys(f,[...meta,'state','reason']);if(!['private-content-default','explicit-field-omission'].includes(f.reason))fail('Invalid omission reason');}
 else if(f.state==='unavailable'){keys(f,[...meta,'state','reason']);if(f.reason!=='not-recorded-in-source')fail('Invalid unavailable reason');}
 else fail('Invalid field state');
}
function rowsOf(r){return[r.target.value,...r.technicalEvidence.fields];}
function index(t,rows){const byId=new Map(rows.map(f=>[f.id,f]));return{joins:t.joins.map(g=>{const missingContext=g.fieldIds.filter(id=>byId.get(id)?.state!=='included');return{...g,state:missingContext.length?'unverifiable':'historical-fragment',missingContext};}),omissions:rows.filter(f=>f.state!=='included').map(f=>({id:f.id,state:f.state,reason:f.reason}))};}
function technical(t,target){
 keys(t,['state','version','configuration','fields','joins','omissions','counts','omittedSourceFragments','absentCapabilities','limitations']);if(t.state!=='reviewed-projection'||t.version!==1||!equal(t.absentCapabilities,absent)||!equal(t.limitations,policy.limitations))fail('Invalid projection policy');
 keys(t.configuration,['ide','instrumented','desktop']);for(const v of Object.values(t.configuration))if(v!==null&&typeof v!=='boolean')fail('Invalid configuration');
 if(!Array.isArray(t.fields)||t.fields.length>=2048||!Array.isArray(t.joins)||t.joins.length>2048)fail('Invalid row budget');const rows=[target,...t.fields],map=new Map();rows.forEach((f,i)=>{row(f);if(f.id!=='f'+i)fail('Duplicate or unordered field identity');map.set(f.id,f);});
 const joined=new Set(),gids=new Set(),reasons=new Set(['execution-and-dependency-not-established','exchange-is-not-dependency-proof','historical-finite-trace-not-reverified','execution-not-observed','not-linked-to-selected-element','exact-occurrence-join-not-recorded']);
 for(const g of t.joins){keys(g,['id','kind','evidenceKind','scope','reason','fieldIds','state','missingContext']);if(!/^(selection|context|source-\d+|runtime|node-\d+|network-\d+|exchange-binding-\d+|state-handoff-\d+|commit|finite-trace|action-\d+|source-maps|experiment)$/.test(g.id)||gids.has(g.id)||!Object.hasOwn(policy.scopes,g.kind)||g.scope!==policy.scopes[g.kind]||!levels.has(g.evidenceKind)||!reasons.has(g.reason)||!Array.isArray(g.fieldIds)||!g.fieldIds.length||!Array.isArray(g.missingContext))fail('Invalid context join');const definition=contextDefinition(g.id);if(!definition||g.kind!==definition.kind||g.reason!==definition.reason||definition.evidenceKind&&g.evidenceKind!==definition.evidenceKind)fail('Invalid context scope');gids.add(g.id);for(const id of g.fieldIds){const f=map.get(id);if(!f||joined.has(id)||f.scope!==g.scope||definition.prefix&&!f.sourcePointer.startsWith(definition.prefix)||g.kind==='source'&&f.evidenceKind!=='Code-linked'||g.kind==='network'&&f.evidenceKind!=='Observed'||g.kind==='map'&&f.evidenceKind!=='Unknown/Unsupported')fail('Invalid context reference');if(g.id==='context'&&!/^\/(identity\/(run|freshness)|notes|limitations\/\d+)$/.test(f.sourcePointer)||g.id==='runtime'&&!/^\/runtime\/(status|reason|unknownBoundaries\/\d+)$/.test(f.sourcePointer))fail('Invalid context path');joined.add(id);}}
 if(joined.size!==rows.length)fail('Missing context references');const derived=index(t,rows);if(!equal(t.joins,derived.joins)||!equal(t.omissions,derived.omissions))fail('Invalid omission/context index');
 const bounds={sources:32,runtimeNodes:120,exchanges:32,actionBindings:24,sourceMapScripts:128,legacyExperiments:1};keys(t.counts,Object.keys(bounds));for(const[k,max]of Object.entries(bounds))int(t.counts[k],max);
 if(!Array.isArray(t.omittedSourceFragments)||t.omittedSourceFragments.length>1)fail('Invalid omitted fragment');for(const o of t.omittedSourceFragments){keys(o,['sourcePointer','state','reason','count']);if(o.sourcePointer!=='/runtime/codeJournal'||o.state!=='omitted'||o.reason!=='not-in-projection-profile')fail('Invalid omitted journal');int(o.count,256);}
}
function body(r){
 keys(r,['id','createdAt','derivedFrom','sourceDiagnostic','target','issue','observationWindow','technicalEvidence']);if(!isUUID(r.id)||!iso(r.createdAt))fail('Invalid baseline identity');if(r.derivedFrom!==null){keys(r.derivedFrom,['reportId','digest']);if(!isUUID(r.derivedFrom.reportId)||r.derivedFrom.reportId===r.id||!isHash(r.derivedFrom.digest))fail('Invalid derivative identity');}
 source(r.sourceDiagnostic);issue(r.issue);keys(r.observationWindow,['status']);if(r.observationWindow.status!=='not-recorded')fail('No observation window in this profile');keys(r.target,['property','value']);if(!['text','disabled'].includes(r.target.property))fail('Invalid selected property');technical(r.technicalEvidence,r.target.value);
 const f=r.target.value;if(f.id!=='f0'||f.sourcePointer!=='/target/value'||f.evidenceKind!=='Observed'||f.scope!==policy.scopes.selection||f.type!==(r.target.property==='text'?'text':'boolean'))fail('Invalid selected condition');
}
function privacy(p,r){keys(p,['policy','redactedIssueFields','omittedDeveloperFindings']);if(p.policy!==PROFILE||!Array.isArray(p.redactedIssueFields)||p.redactedIssueFields.length>5||new Set(p.redactedIssueFields).size!==p.redactedIssueFields.length||p.redactedIssueFields.some(k=>!issueNames.includes(k))||!equal([...p.redactedIssueFields].sort(),p.redactedIssueFields))fail('Invalid issue omissions');int(p.omittedDeveloperFindings);for(const k of p.redactedIssueFields)if(!equal(r.issue[k],k==='steps'?[]:null))fail('Omitted issue bytes retained');if(r.issue.title===null&&!p.redactedIssueFields.includes('title'))fail('Title omission missing');}
function note(n,build){keys(n,['id','createdAt','kind','evidenceStatus','text','build','buildRelation','parentArtifactDigest']);if(!isUUID(n.id)||!iso(n.createdAt)||n.kind!=='developer-note'||n.evidenceStatus!=='unverified-note'||n.build!==null&&!isHash(n.build)||!isHash(n.parentArtifactDigest))fail('Invalid note');text(n.text,4096);if(!n.text.trim()||n.buildRelation!==(!build||!n.build?'unknown':build===n.build?'same-hash':'different-hash'))fail('Invalid note claim');}
async function decode(raw){
 const r=json(raw);if(r?.schema!=='stateatom.diagnostic'||r.version!==2||r.kind!=='historical-diagnostic'||r.profile!==PROFILE)throw err('UNSUPPORTED_HANDOFF_FORMAT');keys(r,['schema','version','kind','profile','id','createdAt','revision','report','reportDigest','lineage','additions','privacy','limitations']);if(!isUUID(r.id)||!iso(r.createdAt)||!isHash(r.reportDigest)||!equal(r.limitations,limits))fail('Invalid artifact identity or limits');int(r.revision);body(r.report);privacy(r.privacy,r.report);
 if(!Array.isArray(r.additions)||r.additions.length>8)fail('Invalid addition bound');const ids=new Set();for(const n of r.additions){note(n,r.report.sourceDiagnostic.build);if(ids.has(n.id))fail('Duplicate note identity');ids.add(n.id);}
 const l=r.lineage;keys(l,['kind','parentArtifactDigest','parentReportDigest']);if(l.kind==='from-v1-snapshot'){if(l.parentArtifactDigest!==null||l.parentReportDigest!==null||r.revision!==0||r.additions.length||r.report.derivedFrom!==null||r.privacy.omittedDeveloperFindings!==0)fail('Invalid initial lineage');}
 else if(l.kind==='developer-addition'){if(!isHash(l.parentArtifactDigest)||!isHash(l.parentReportDigest)||r.revision<1||!r.additions.length||r.additions.at(-1).parentArtifactDigest!==l.parentArtifactDigest||r.additions.at(-1).createdAt!==r.createdAt)fail('Invalid addition lineage');}
 else if(l.kind==='privacy-derivative'){if(!isHash(l.parentArtifactDigest)||!isHash(l.parentReportDigest)||r.revision<1||r.report.derivedFrom?.digest!==l.parentReportDigest||r.report.createdAt!==r.createdAt)fail('Invalid privacy lineage');}
 else fail('Invalid lineage');if(await handoffArtifactDigest(canonical(r.report))!==r.reportDigest)throw err('HANDOFF_INTEGRITY');return r;
}
function parentMismatch(){throw err('HANDOFF_PARENT_MISMATCH','Exact parent content or allowed revision differs');}
function allowedRedaction(p,c){if(equal(p,c))return true;if(!equal(descriptor(p),descriptor(c))||!['included','filtered','replaced'].includes(p.state))return false;return c.state==='omitted'&&c.reason==='explicit-field-omission'||c.state==='replaced';}
async function parent(r,parentRaw){
 let p;try{p=await decode(parentRaw);}catch{parentMismatch();}if(r.lineage.parentArtifactDigest!==await handoffArtifactDigest(parentRaw)||r.lineage.parentReportDigest!==p.reportDigest||r.revision!==p.revision+1||r.id===p.id)parentMismatch();
 if(r.lineage.kind==='developer-addition'){if(!equal(r.report,p.report)||r.reportDigest!==p.reportDigest||!equal(r.privacy,p.privacy)||r.additions.length!==p.additions.length+1||!equal(r.additions.slice(0,-1),p.additions))parentMismatch();return;}
 if(r.lineage.kind!=='privacy-derivative'||!p.privacy.redactedIssueFields.every(k=>r.privacy.redactedIssueFields.includes(k)))parentMismatch();
 const oldRows=rowsOf(p.report),nextRows=rowsOf(r.report);if(oldRows.length!==nextRows.length||oldRows.some((f,i)=>!allowedRedaction(f,nextRows[i])))parentMismatch();
 const expected=structuredClone(p.report);expected.id=r.report.id;expected.createdAt=r.report.createdAt;expected.derivedFrom={reportId:p.report.id,digest:p.reportDigest};for(const k of r.privacy.redactedIssueFields)expected.issue[k]=k==='steps'?[]:null;expected.target.value=structuredClone(r.report.target.value);expected.technicalEvidence.fields=structuredClone(r.report.technicalEvidence.fields);Object.assign(expected.technicalEvidence,index(expected.technicalEvidence,rowsOf(expected)));if(!equal(expected,r.report))parentMismatch();
 let at=0;for(const n of r.additions){while(at<p.additions.length&&!equal(p.additions[at],n))at++;if(at===p.additions.length)parentMismatch();at++;}const omitted=p.privacy.omittedDeveloperFindings+(p.additions.length-r.additions.length);if(!Number.isSafeInteger(omitted)||r.privacy.omittedDeveloperFindings!==omitted)parentMismatch();
}
export async function parseReviewedHandoffReport(raw,options={}){const d=own(options,['parentRaw']),r=await decode(raw);let parentStatus=r.lineage.kind==='from-v1-snapshot'?'not-applicable':'not-checked';if(Object.hasOwn(d,'parentRaw')){await parent(r,d.parentRaw);parentStatus='content-matched';}return frozen({record:r,trust:'historical-untrusted',parentStatus});}
async function emit(r){const raw=canonical(r);await decode(raw);return raw;}
export async function createReviewedHandoffReport(sourceRaw,baselineRaw,review={},options={}){
 const d=own(review,['omitIssueFields','content','separateActionEvidence']);if(Object.hasOwn(d,'separateActionEvidence')&&typeof d.separateActionEvidence!=='boolean')invalid();if(Object.hasOwn(d,'content'))d.content=snapshotChoices(d.content,['includeCategories','includeFields','omitFields','replaceFields']);if(Object.hasOwn(d,'omitIssueFields'))d.omitIssueFields=choices(d.omitIssueFields,new Set(issueNames),5);const minimal=await createHandoffReport(sourceRaw,baselineRaw,Object.hasOwn(d,'omitIssueFields')?{omitIssueFields:d.omitIssueFields}:{},options),base=(await parseHandoffReport(minimal)).record,m=await createHandoffContentReview(sourceRaw,d.separateActionEvidence===true?{separateActionEvidence:true}:{}),p=m.project(Object.hasOwn(d,'content')?d.content:{}),{schema,version,exportable,sourceDiagnostic,target,...technicalEvidence}=p;
 if(!equal(sourceDiagnostic,base.report.sourceDiagnostic))throw err('HANDOFF_SOURCE_MISMATCH');const report={...base.report,target,technicalEvidence:{state:'reviewed-projection',version:1,...technicalEvidence}};
 return emit({...base,profile:PROFILE,report,reportDigest:await handoffArtifactDigest(canonical(report)),privacy:{policy:PROFILE,redactedIssueFields:base.privacy.redactedIssueFields,omittedDeveloperFindings:0},limitations:[...limits]});
}
function revision(p){if(p.revision===Number.MAX_SAFE_INTEGER)throw err('HANDOFF_LIMIT');return p.revision+1;}
async function mutation(raw,options){const d=own(options,['expectedParentDigest','now']),p=await decode(raw),digest=await handoffArtifactDigest(raw);if(!isHash(d.expectedParentDigest)||d.expectedParentDigest!==digest)throw err('STALE_HANDOFF_PARENT');return{p,d,digest};}
export async function appendReviewedHandoffFinding(raw,finding,options={}){
 const n=own(finding,['text','build']);if(typeof n.text!=='string'||!n.text.trim()||n.text.length>4096||n.build!==undefined&&n.build!==null&&!isHash(n.build))invalid();const{p,d,digest}=await mutation(raw,options);if(p.additions.length>=8)throw err('HANDOFF_LIMIT');const at=clock(d),build=n.build??null,sourceBuild=p.report.sourceDiagnostic.build;
 return emit({...p,id:crypto.randomUUID(),createdAt:at,revision:revision(p),lineage:{kind:'developer-addition',parentArtifactDigest:digest,parentReportDigest:p.reportDigest},additions:[...p.additions,{id:crypto.randomUUID(),createdAt:at,kind:'developer-note',evidenceStatus:'unverified-note',text:n.text,build,buildRelation:!build||!sourceBuild?'unknown':build===sourceBuild?'same-hash':'different-hash',parentArtifactDigest:digest}]});
}
export async function redactReviewedHandoff(raw,review={},options={}){
 const c=snapshotChoices(review,['omitIssueFields','omitCategories','omitFields','replaceFields','omitNotes']);const{p,d,digest}=await mutation(raw,options),rows=rowsOf(p.report),byId=new Map(rows.map(f=>[f.id,f])),issueOmissions=choices(c.omitIssueFields??[],new Set(issueNames),5),categories=new Set(choices(c.omitCategories??[],new Set(policy.categories),13)),omitted=new Set(choices(c.omitFields??[],byId)),noteIds=new Set(choices(c.omitNotes??[],new Set(p.additions.map(n=>n.id)),8)),replacements=new Map();
 for(const item of dense(c.replaceFields??[])){const v=own(item,['id','text']),f=byId.get(v.id);if(!f||replacements.has(v.id)||omitted.has(v.id)||categories.has(f.category)||!['included','filtered','replaced'].includes(f.state)||typeof v.text!=='string')invalid();if(v.text.length>4096)throw err('HANDOFF_LIMIT');replacements.set(v.id,filterHandoffReviewText(v.text));}
 const next=rows.map(f=>{if(replacements.has(f.id))return{...descriptor(f),state:'replaced',value:replacements.get(f.id),attribution:'reviewer-redaction',reason:'reviewer-replacement-not-observation'};if((omitted.has(f.id)||categories.has(f.category))&&['included','filtered','replaced'].includes(f.state))return{...descriptor(f),state:'omitted',reason:'explicit-field-omission'};return structuredClone(f);});
 const at=clock(d),report=structuredClone(p.report),redactedIssueFields=[...new Set([...p.privacy.redactedIssueFields,...issueOmissions])].sort();report.id=crypto.randomUUID();report.createdAt=at;report.derivedFrom={reportId:p.report.id,digest:p.reportDigest};for(const k of redactedIssueFields)report.issue[k]=k==='steps'?[]:null;report.target.value=next[0];report.technicalEvidence.fields=next.slice(1);Object.assign(report.technicalEvidence,index(report.technicalEvidence,next));const count=p.privacy.omittedDeveloperFindings+noteIds.size;if(!Number.isSafeInteger(count))throw err('HANDOFF_LIMIT');
 return emit({...p,id:crypto.randomUUID(),createdAt:at,revision:revision(p),report,reportDigest:await handoffArtifactDigest(canonical(report)),lineage:{kind:'privacy-derivative',parentArtifactDigest:digest,parentReportDigest:p.reportDigest},additions:p.additions.filter(n=>!noteIds.has(n.id)),privacy:{policy:PROFILE,redactedIssueFields,omittedDeveloperFindings:count}});
}
