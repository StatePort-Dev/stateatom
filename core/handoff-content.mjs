// SPDX-License-Identifier: Apache-2.0
// Unimported saved-v1 review model; no installed/public profile or active operations.
import {parseDiagnostic} from './diagnostic.mjs';
import {createHandoffDraft} from './handoff-draft.mjs';

const MAX=1048576,MAX_ROWS=2048,encoder=new TextEncoder();
const categories=['selectedText','selectionDetails','sourceLocations','sourceExcerpts','responseBodies','runtimeValues','networkLocations','routePaths','originalNotes','diagnosticDetails','actionDetails','sourceMaps','interventionValues'];
const levels=new Set(['Observed','Code-linked','Candidate','Experimentally verified','Unknown/Unsupported','Stale']);
const sensitive=/password|passwd|secret|api[-_]?key|authorization|cookie|token|credential|session[-_]?id/i;
const error=(code,message=code)=>Object.assign(new Error(message),{code});
const invalid=()=>{throw error('INVALID_CONTENT_REVIEW','Plain, bounded review choices required');};
const own=(o,k)=>o!==null&&typeof o==='object'&&Object.hasOwn(o,k);
const object=o=>o!==null&&typeof o==='object'&&!Array.isArray(o)?o:{};
const list=o=>Array.isArray(o)?o:[];
const level=x=>levels.has(x)?x:'Unknown/Unsupported';
const copy=x=>{const v=structuredClone(x);function freeze(o){if(o&&typeof o==='object'){for(const c of Object.values(o))freeze(c);Object.freeze(o);}return o;}return freeze(v);};
const scopes={selection:'Historical selected condition; no producer or value ancestry established.',source:'Historical Code-linked source fragment; execution in the selected update is not established.',runtime:'Historical runtime claim in its recorded scope; no new identity or causal join is inferred.',network:'Observed exchange fragment; presence is not evidence of dependency.',action:'Historical source/registration relation; execution was not observed.',map:'Historical artifact association; not linked to the selected element or independently reverified.',experiment:'Historical legacy intervention claim; no new exact-occurrence join or server rollback is established.'};
const limitations=[
 'Untrusted historical fragments, not independently reverified. Hashes identify data, not authorship or execution.',
 'Filtered patterns are incomplete PII protection. Review every included value before sharing.',
 'Omission, filtering and reviewer replacement can break context; equal values or nearby events do not repair a join.',
 'No source fetch, executable state, permission, production grant, replay or action authority.',
 'Local undo or restored acknowledgement is not server rollback.',
 'Source/map bodies, U02 history, A05 executions and P04 windows absent from saved v1 cannot be recovered here.'
];

function ownData(v,keys){
 if(!v||typeof v!=='object'||Array.isArray(v)||![Object.prototype,null].includes(Object.getPrototypeOf(v)))invalid();
 const out=Object.create(null),ds=Object.getOwnPropertyDescriptors(v);
 for(const k of Reflect.ownKeys(ds)){if(typeof k!=='string'||!keys.includes(k)||!('value'in ds[k]))invalid();out[k]=ds[k].value;}
 return out;
}
function arrayData(v,max=MAX_ROWS){
 if(!Array.isArray(v))invalid();
 const ds=Object.getOwnPropertyDescriptors(v),n=ds.length.value;
 if(n>max)throw error('HANDOFF_LIMIT');
 if(Reflect.ownKeys(ds).some(k=>k!=='length'&&(typeof k!=='string'||String(Number(k))!==k||!Number.isInteger(Number(k))||Number(k)<0||Number(k)>=n)))invalid();
 const a=[];for(let i=0;i<n;i++){if(!ds[i]||!('value'in ds[i]))invalid();a.push(ds[i].value);}return a;
}
function cleanText(s){
 return s.replace(/\bBearer\s+[^\s"'<>]+/gi,'Bearer [REDACTED_SECRET]')
  .replace(/\b(?:sk_(?:live|test)_|sk-proj-|AKIA)[a-zA-Z0-9_-]+/g,'[REDACTED_SECRET]')
  .replace(/\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g,'[REDACTED_SECRET]')
  .replace(/\b[a-f0-9]{48,}\b/gi,'[REDACTED_SECRET]')
  .replace(/((?:password|passwd|secret|api[-_]?key|authorization|cookie|token|credential|session[-_]?id)["']?\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s&"'<>;,}\]]+)/gi,'$1"[REDACTED_SECRET]"')
  .replace(/https?:\/\/[^\s"'<>]+/gi,url=>{try{return new URL(url).origin;}catch{return'[REDACTED_URL]';}});
}
// Shared only with the explicit reviewed-profile codec; no active authority.
export const handoffContentPolicy=copy({categories,scopes,limitations});
export const filterHandoffReviewText=cleanText;
export const filterHandoffReviewValue=(value,type)=>filteredValue(value,type,false);
function cleanData(v){
 // Only parsed JSON, bounded by parseDiagnostic's existing tree budgets, enters here.
 if(typeof v==='string')return cleanText(v);
 if(v===null||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v))return v;
 if(Array.isArray(v))return v.map(cleanData);
 if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[cleanText(k),sensitive.test(k)?'[REDACTED_SECRET]':cleanData(x)]));
 return null;
}
function filteredValue(value,type,force){
 if(force)return{state:'filtered',value:'[REDACTED_SECRET]',reason:'sensitive-field-context'};
 let result=value;
 if(type==='json')result=cleanData(value);
 else if(type==='json-text'){
  try{result=JSON.stringify(cleanData(JSON.parse(value)));}catch{result=cleanText(value);}
 }else if(type==='text')result=cleanText(value);
 const changed=JSON.stringify(result)!==JSON.stringify(value);
 return{state:changed?'filtered':'included',value:result,...(changed?{reason:'known-secrets-or-url-details-filtered'}:{})};
}
function available(v,type){
 if(type==='text'||type==='json-text')return typeof v==='string';
 if(type==='boolean')return typeof v==='boolean';
 if(type==='number')return typeof v==='number'&&Number.isFinite(v);
 if(type==='digest')return typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
 if(type==='json')return v!==undefined;
 return false;
}

export async function createHandoffContentReview(sourceRaw,options={}){
 const flags=ownData(options,['separateActionEvidence']);if(Object.hasOwn(flags,'separateActionEvidence')&&typeof flags.separateActionEvidence!=='boolean')invalid();
 const source=parseDiagnostic(sourceRaw);
 if(source.runtime.actionObservation&&flags.separateActionEvidence!==true)throw error('UNSUPPORTED_HANDOFF_EVIDENCE','This closed reviewed profile cannot retain saved action execution. The original diagnostic keeps it; a simple report explicitly omits technical evidence.');
 if(source.sources.some(s=>s.status!=='Code-linked'))throw error('UNSUPPORTED_HANDOFF_EVIDENCE','Recorded source evidence cannot be represented by this review profile without changing its kind. Original snapshot unchanged.');
 const reference=(await createHandoffDraft(sourceRaw)).read().sourceDiagnostic;
 const fields=[],groups=[];
 function group(id,kind,evidenceKind,reason='execution-and-dependency-not-established'){
  const g={id,kind,evidenceKind:level(evidenceKind),scope:scopes[kind],reason,fieldIds:[]};groups.push(g);return g;
 }
 function add(g,key,pointer,v,{category=null,type='text',auto=false,part,force=false,label=key}={}){
  if(fields.length>=MAX_ROWS)throw error('HANDOFF_LIMIT','At most 2048 review rows');
  const present=available(v,type),id='f'+fields.length;
  const f={id,category,label,sourcePointer:pointer,...(part?{part}:{}),evidenceKind:g.evidenceKind,scope:g.scope,type,auto,present,...(present?{preview:filteredValue(v,type,force)}:{preview:{state:'unavailable',reason:'not-recorded-in-source'}})};
  fields.push(f);g.fieldIds.push(id);return f;
 }
 function text(g,o,k,p,category,label=k){return add(g,k,p+'/'+k,o?.[k],{category,label});}
 function safe(g,o,k,p,type='number'){return add(g,k,p+'/'+k,o?.[k],{auto:true,type});}
 function status(g,o,k,p,values=levels){return add(g,k,p+'/'+k,values.has(o?.[k])?o[k]:undefined,{auto:true});}
 function location(g,o,p,category='sourceLocations'){
  text(g,o,'file',p,category,'Source path');
  for(const k of['line','column','endLine','endColumn'])add(g,k,p+'/'+k,o?.[k],{category,type:'number'});
  add(g,'sourceDigest',p+'/sourceDigest',o?.sourceDigest,{auto:category!=='sourceMaps',category:category==='sourceMaps'?category:null,type:'digest',label:'Source digest'});
 }
 function url(g,v,p){
  let u;try{if(typeof v==='string'){u=new URL(v);if(!['http:','https:'].includes(u.protocol))u=null;}}catch{}
  add(g,'origin',p,u?.origin,{category:'networkLocations',part:'origin',label:'Network origin'});
  // Route text is filtered independently; credentials/query/fragment are never eligible.
  add(g,'path',p,u?.pathname,{category:'routePaths',part:'path',label:'Route path'});
 }
 const target=group('selection','selection','Observed'),t=object(source.target);
 const selected=add(target,'value','/target/value',t.value,{category:t.property==='text'?'selectedText':null,type:t.property==='text'?'text':'boolean',auto:t.property==='disabled',label:'Selected value'});
 for(const k of['selector','elementId','tag','page','instance'])text(target,t,k,'/target','selectionDetails');
 for(const k of['tab','frame'])add(target,k,'/target/'+k,t[k],{category:'selectionDetails',type:'number'});
 const identity=group('context','selection','Unknown/Unsupported');
 for(const k of['run','freshness'])text(identity,source.identity,k,'/identity','selectionDetails');
 text(identity,source,'notes','','originalNotes','Original notes');
 list(source.limitations).forEach((v,i)=>add(identity,'limit','/limitations/'+i,v,{category:'diagnosticDetails',label:'Original limitation'}));
 source.sources.forEach((s,i)=>{const p='/sources/'+i,g=group('source-'+i,'source','Code-linked');location(g,s,p);const es=list(s.expressions);if(!es.length)add(g,'expression',p+'/expressions/0',undefined,{category:'sourceExcerpts',label:'Source expression'});else es.forEach((v,j)=>add(g,'expression',p+'/expressions/'+j,v,{category:'sourceExcerpts',label:'Source expression'}));});
 const rt=object(source.runtime),runtime=group('runtime','runtime',rt.status);
 status(runtime,rt,'status','/runtime');text(runtime,rt,'reason','/runtime','diagnosticDetails');
 list(rt.unknownBoundaries).forEach((v,i)=>add(runtime,'boundary','/runtime/unknownBoundaries/'+i,v,{category:'diagnosticDetails',label:'Unknown boundary'}));
 rt.nodes.forEach((n,i)=>{const p='/runtime/nodes/'+i,g=group('node-'+i,'runtime',n.status);status(g,n,'status',p);location(g,n,p);for(const k of['id','kind','boundary','valueOrigin','invocation'])text(g,n,k,p,'diagnosticDetails');text(g,n,'expression',p,'sourceExcerpts');add(g,'value',p+'/value',n.value,{category:'runtimeValues',type:'json',force:sensitive.test(n.origin?.pointer||'')||sensitive.test(n.expression||''),label:'Runtime value'});if(own(n,'completedWrite'))safe(g,n,'completedWrite',p,'boolean');if(n.origin){for(const k of['exchangeId','pointer','scope'])text(g,n.origin,k,p+'/origin','diagnosticDetails');url(g,n.origin.url,p+'/origin/url');}});
 source.network.forEach((n,i)=>{const p='/network/'+i,g=group('network-'+i,'network','Observed','exchange-is-not-dependency-proof');text(g,n,'id',p,'diagnosticDetails');url(g,n.url,p+'/url');safe(g,n,'status',p);safe(g,n,'observedAt',p);add(g,'body',p+'/body',n.body,{category:'responseBodies',type:'json-text',label:'Response excerpt'});add(g,'truncated',p+'/bodyTruncated',typeof n.bodyTruncated==='boolean'?n.bodyTruncated:'unknown',{auto:true,type:typeof n.bodyTruncated==='boolean'?'boolean':'text',label:'Response excerpt truncation'});});
 function runtimeRelation(record,p,id,extra){
  const o=object(record),g=group(id,'runtime',o.status);status(g,o,'status',p);
  for(const k of extra)text(g,o,k,p,'diagnosticDetails');return g;
 }
 list(rt.exchangeBindings).forEach((b,i)=>{const p='/runtime/exchangeBindings/'+i,g=runtimeRelation(b,p,'exchange-binding-'+i,['exchangeId','requestId','scriptId','frameId','page','run','method','scope','reason','trust']);url(g,b.url,p+'/url');safe(g,b,'executionContextId',p);safe(g,b,'responseStatus',p);});
 list(rt.stateHandoffs).forEach((h,i)=>{const p='/runtime/stateHandoffs/'+i,g=runtimeRelation(h,p,'state-handoff-'+i,['readId','queueId','hookId','revisionId','updateId','reason','boundary','scope','valueOrigin']);if(h.parsedObject){for(const k of['consumptionId','exchangeId','pointer','scope'])text(g,h.parsedObject,k,p+'/parsedObject','diagnosticDetails');url(g,h.parsedObject.url,p+'/parsedObject/url');}});
 if(rt.commit){const c=rt.commit,p='/runtime/commit',g=runtimeRelation(c,p,'commit',['adapter','page','rootId','hostNodeId','hostPropsId','targetId','commitId','property','marker','reason','mechanism','trust']);safe(g,c,'observedAt',p);status(g,c.producer,'status',p+'/producer');for(const k of['scope','reason'])text(g,c.producer,k,p+'/producer','diagnosticDetails');if(c.source)location(g,c.source,p+'/source');}
 if(rt.firstReadProfile){const f=rt.firstReadProfile,p='/runtime/firstReadProfile',g=group('finite-trace','runtime',f.status==='Supported finite trace'?'Observed':f.status,'historical-finite-trace-not-reverified');status(g,f,'status',p,new Set(['Supported finite trace','Unknown/Unsupported','Stale']));safe(g,f,'fullPath',p,'boolean');for(const k of['case','scope','reason','freshness'])text(g,f,k,p,'diagnosticDetails');list(f.limits).forEach((v,i)=>add(g,'limit',p+'/limits/'+i,v,{category:'diagnosticDetails',label:'Finite trace limit'}));if(f.sourceProof){const q=p+'/sourceProof';status(g,f.sourceProof,'status',q);for(const k of['digest','bundleDigest'])safe(g,f.sourceProof,k,q,'digest');for(const k of['profile','manifestId'])text(g,f.sourceProof,k,q,'diagnosticDetails');}if(f.occurrence){const o=f.occurrence,q=p+'/occurrence';status(g,o,'status',q);for(const k of['readId','parseId','exchangeId','requestId','updateId','renderId','targetId','commitId','run','page','frame','pointer'])text(g,o,k,q,'diagnosticDetails');add(g,'readValue',q+'/readValue',o.readValue,{category:'runtimeValues',type:'json',label:'Historical read value'});}}
 list(rt.actionBindings).forEach((a,i)=>{const p='/runtime/actionBindings/'+i,g=group('action-'+i,'action','Code-linked','execution-not-observed');for(const k of['id','event','mechanism','registeredOn','freshness'])text(g,a,k,p,'actionDetails');for(const k of['capture','once','passive'])add(g,k,p+'/'+k,a[k],{category:'actionDetails',type:'boolean'});if(a.identity){const q=p+'/identity';for(const k of['run','frameId','document','instance'])text(g,a.identity,k,q,'actionDetails');for(const k of['build','sourceRevision'])safe(g,a.identity,k,q,'digest');for(const k of['tabId','inspection'])add(g,k,q+'/'+k,a.identity[k],{category:'actionDetails',type:'number'});}if(a.binding){location(g,a.binding.source,p+'/binding/source');text(g,a.binding,'expression',p+'/binding','sourceExcerpts');list(a.binding.evidenceIds).forEach((v,j)=>add(g,'evidence',p+'/binding/evidenceIds/'+j,v,{category:'actionDetails',label:'Action source evidence ID'}));}
  const link=(l,q)=>{const relation={...g,evidenceKind:level(l.status)};status(relation,l,'status',q);for(const k of['symbol','hook','relation','reason'])text(relation,l,k,q,'actionDetails');if(l.source)location(relation,l.source,q+'/source');list(l.evidenceIds).forEach((v,j)=>add(relation,'evidence',q+'/evidenceIds/'+j,v,{category:'actionDetails',label:'Action relation evidence ID'}));};
  if(a.entry)link(a.entry,p+'/entry');for(const k of['calls','hookRelations'])list(a[k]).forEach((l,j)=>link(l,p+'/'+k+'/'+j));if(a.registration){for(const k of['scriptId','mapping'])text(g,a.registration,k,p+'/registration','actionDetails');for(const k of['line','column'])add(g,k,p+'/registration/'+k,a.registration[k],{category:'actionDetails',type:'number'});}
 });
 if(rt.sourceMaps){const m=rt.sourceMaps,p='/runtime/sourceMaps',g=group('source-maps','map','Unknown/Unsupported','not-linked-to-selected-element');const mapField=(o,k,q,type='text')=>add(g,k,q+'/'+k,o?.[k],{category:'sourceMaps',type});mapField(m,'status',p);list(m.scripts).forEach((s,i)=>{const q=p+'/scripts/'+i;for(const k of['scriptId','frameId','cdpHashDomain','digestDomain'])mapField(s,k,q);mapField(s,'executionContextId',q,'number');for(const k of['cdpHash','digest'])mapField(s,k,q,'digest');if(s.map){const z=q+'/map';for(const k of['status','verificationMethod'])mapField(s.map,k,z);for(const k of['mapDigest','manifestDigest'])mapField(s.map,k,z,'digest');mapField(s.map,'hasContent',z,'boolean');mapField(s.map,'sourceCount',z,'number');}});if(m.lookup){for(const k of['scriptId','link'])mapField(m.lookup,k,p+'/lookup');for(const k of['line','column','originalLine','originalColumn'])mapField(m.lookup,k,p+'/lookup','number');}}
 if(source.experiment){const e=source.experiment,p='/experiment',g=group('experiment','experiment',e.status,'exact-occurrence-join-not-recorded');status(g,e,'status',p);text(g,e,'id',p,'interventionValues');text(g,e,'scope',p,'interventionValues');safe(g,e,'completedAt',p);list(e.trials).forEach((t,i)=>{const q=p+'/trials/'+i;add(g,'baseline',q+'/baseline',t.baseline,{category:'interventionValues',type:'json',label:'Legacy baseline value'});list(t.interventions).forEach((v,j)=>{const z=q+'/interventions/'+j,intervention={...g,evidenceKind:level(v.effectStatus)};text(intervention,v,'name',z,'interventionValues');for(const k of['value','rollback'])add(intervention,k,z+'/'+k,v[k],{category:'interventionValues',type:'json'});for(const k of['consumed','restored'])safe(intervention,v,k,z,'boolean');status(intervention,v,'effectStatus',z);});});}
 const configuration=Object.fromEntries(['ide','instrumented','desktop'].map(k=>[k,typeof source.configuration[k]==='boolean'?source.configuration[k]:null]));
 const counts={sources:source.sources.length,runtimeNodes:rt.nodes.length,exchanges:source.network.length,actionBindings:list(rt.actionBindings).length,sourceMapScripts:list(rt.sourceMaps?.scripts).length,legacyExperiments:source.experiment?1:0};
 const omittedSourceFragments=rt.codeJournal?[{sourcePointer:'/runtime/codeJournal',state:'omitted',reason:'not-in-projection-profile',count:list(rt.codeJournal.scripts).length}]:[];
 const byId=new Map(fields.map(f=>[f.id,f]));
 const catalogue=()=>copy({schema:'stateatom.handoff-content-catalogue',version:1,exportable:false,sourceDiagnostic:reference,categories,fields:fields.map(({present,auto,...f})=>({...f,defaultIncluded:auto,available:present})),counts,limitations});
 function project(choices={}){
  const data=ownData(choices,['includeCategories','includeFields','omitFields','replaceFields']);
  const strings=(k,valid)=>{const a=own(data,k)?arrayData(data[k]):[];if(a.some(v=>typeof v!=='string'||!valid.has(v))||new Set(a).size!==a.length)invalid();return new Set(a);};
  const includedCategories=strings('includeCategories',new Set(categories)),included=strings('includeFields',byId),omitted=strings('omitFields',byId),replaced=new Map();
  for(const v of own(data,'replaceFields')?arrayData(data.replaceFields):[]){const d=ownData(v,['id','text']);if(typeof d.id!=='string'||!byId.has(d.id)||!byId.get(d.id).present||replaced.has(d.id)||typeof d.text!=='string')invalid();if(d.text.length>4096)throw error('HANDOFF_LIMIT');replaced.set(d.id,cleanText(d.text));}
  if([...omitted].some(id=>included.has(id)||replaced.has(id))||[...replaced.keys()].some(id=>included.has(id)))invalid();
  const rows=fields.map(({preview,auto,present,...f})=>{
   let content;if(!present)content={state:'unavailable',reason:'not-recorded-in-source'};
   else if(replaced.has(f.id))content={state:'replaced',value:replaced.get(f.id),attribution:'reviewer-redaction',reason:'reviewer-replacement-not-observation'};
   else if(omitted.has(f.id))content={state:'omitted',reason:'explicit-field-omission'};
   else if(auto||included.has(f.id)||includedCategories.has(f.category))content=preview;
   else content={state:'omitted',reason:'private-content-default'};
   return{...f,...content};
  });
  const rowMap=new Map(rows.map(r=>[r.id,r]));
  const joins=groups.map(g=>{const missingContext=g.fieldIds.filter(id=>rowMap.get(id).state!=='included');return{...g,state:missingContext.length?'unverifiable':'historical-fragment',missingContext};});
  const p={schema:'stateatom.handoff-content-projection',version:1,exportable:false,sourceDiagnostic:reference,configuration,target:{property:t.property,value:rowMap.get(selected.id)},fields:rows.filter(r=>r.id!==selected.id),joins,omissions:rows.filter(r=>r.state!=='included').map(r=>({id:r.id,state:r.state,reason:r.reason})),counts,omittedSourceFragments,absentCapabilities:['u02-history-not-in-v1','action-execution-not-in-v1','observation-window-not-recorded'],limitations};
  if(encoder.encode(JSON.stringify(p)).length>MAX)throw error('HANDOFF_LIMIT','Projection exceeds 1 MiB; choose less content');
  return copy(p);
 }
 return Object.freeze({catalogue,project});
}
