// SPDX-License-Identifier: Apache-2.0
// Passive projection only: no browser, collector, source resolver or permissions.
import{parseActionTrace}from'./action-trace-record.mjs';
const SCOPE='Separately armed synchronous interaction; not evidence for the selected property or its origin.';
const TRUST='Historical untrusted instrumented-page claims; not independently reverified on import. No action or source-navigation authority.';
const LIMITS=['Runtime callback object identity unavailable.','Full listener coverage unavailable.','Async, state and network consequences unlinked.','Collector status is recorded history; this file never resumes collection.'];
const failure=()=>{throw Object.assign(Error('Invalid historical action observation data'),{code:'INVALID_ACTION_OBSERVATION'});};
const scalar=x=>x===null||x===undefined||typeof x==='string'||typeof x==='boolean'||typeof x==='number'&&Number.isFinite(x);
function own(value,fields,objects=[]){
 if(!value||typeof value!=='object'||Array.isArray(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))failure();
 const descriptors=Object.getOwnPropertyDescriptors(value),out={};for(const key of fields){const d=descriptors[key];if(!d)continue;if(!Object.hasOwn(d,'value')||!objects.includes(key)&&!scalar(d.value))failure();out[key]=d.value;}return out;
}
function records(value,strict=false){
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)failure();const ds=Object.getOwnPropertyDescriptors(value),n=ds.length.value;if(n>64||Reflect.ownKeys(ds).length!==n+1)failure();
 const result=[];for(let i=0;i<n;i++){if(!ds[i]||!Object.hasOwn(ds[i],'value'))failure();const r=own(ds[i].value,['kind','sequence','dispatchId','eventType','trusted','targetId','selectedId','activationId','siteId','currentTargetId','parentActivationId','source','completion'],['source']);if(Object.hasOwn(r,'source')){const original=r.source;r.source=own(original,['file','sourceDigest','line','column','endLine','endColumn','symbol']);if(strict&&(Reflect.ownKeys(original).length!==7||Object.keys(r.source).length!==7))failure();}if(strict){const keys=r.kind==='dispatch'?['kind','sequence','dispatchId','eventType','trusted','targetId','selectedId']:r.kind==='body-entry'?['kind','sequence','dispatchId','activationId','siteId','currentTargetId','parentActivationId','source']:['kind','sequence','dispatchId','activationId','completion'];if(Reflect.ownKeys(ds[i].value).length!==keys.length||keys.some(k=>!Object.hasOwn(r,k)))failure();}result.push(r);}return result;
}
const validTime=x=>x===null||Number.isFinite(x)&&x>=0&&x<=8640000000000000;
function trace(raw){
 if(typeof raw.identity?.page!=='string'||!raw.identity.page||raw.identity.page.length>160||typeof raw.traceId!=='string'||!raw.traceId)failure();
 const parsed=parseActionTrace(raw,raw.identity,raw.identity.page);for(const r of parsed.records)if(r.source&&(r.source.endLine<r.source.line||r.source.endLine===r.source.line&&r.source.endColumn<r.source.column))failure();return parsed;
}
const properties=['schema','kind','status','traceId','selectedId','identity','records','reason','freshness','lastReadAt','sourceAtLastRead','sourceCurrent','executable','runtimeFunctionObjectIdentity','asyncEffects','completeListenerCoverage','actionUndone','scope','trust','limits'];
export function createActionObservationReport(snapshot,{sanitizeText=x=>x}={}){
 if(snapshot==null)return null;
 const raw=own(snapshot,['schema','status','traceId','selectedId','identity','records','reason','sourceCurrent','capturedAt','freshness'],['identity','records']);
 raw.identity=own(raw.identity,['run','build','frame','page']);raw.records=records(raw.records);
 if(raw.traceId==null&&['idle','cleared'].includes(raw.status)&&!raw.records.length)return null;
 const parsed=trace(raw),freshness=raw.freshness==='Stale'||parsed.freshness==='Stale'?'Stale':'Recorded';
 const result={schema:1,kind:'historical-action-observation',status:parsed.status,traceId:parsed.traceId,selectedId:parsed.selectedId,identity:parsed.identity,records:parsed.records,reason:parsed.reason===null?null:sanitizeText(parsed.reason,1024),freshness,lastReadAt:validTime(raw.capturedAt??null)?raw.capturedAt??null:null,sourceAtLastRead:raw.sourceCurrent===true&&freshness!=='Stale'?'Code-linked':'Unknown/Unsupported',sourceCurrent:false,executable:false,runtimeFunctionObjectIdentity:'Unavailable',asyncEffects:'Unlinked',completeListenerCoverage:false,actionUndone:false,scope:SCOPE,trust:TRUST,limits:[...LIMITS]};
 for(const r of result.records)if(r.source)r.source.symbol=sanitizeText(r.source.symbol,256);
 return parseActionObservationReport(result);
}
export function parseActionObservationReport(value){
 const r=own(value,properties,['identity','records','limits']);if(Object.keys(value).length!==properties.length||properties.some(k=>!Object.hasOwn(value,k)))failure();
 if(r.reason!==null&&(typeof r.reason!=='string'||r.reason.length>1024))failure();
 if(r.schema!==1||r.kind!=='historical-action-observation'||!['Recorded','Stale'].includes(r.freshness)||!validTime(r.lastReadAt)||!['Code-linked','Unknown/Unsupported'].includes(r.sourceAtLastRead)||r.sourceCurrent!==false||r.executable!==false||r.runtimeFunctionObjectIdentity!=='Unavailable'||r.asyncEffects!=='Unlinked'||r.completeListenerCoverage!==false||r.actionUndone!==false||r.scope!==SCOPE||r.trust!==TRUST)failure();
 const raw={schema:r.schema,status:r.status,traceId:r.traceId,selectedId:r.selectedId,identity:own(r.identity,['run','build','frame','page']),records:records(r.records,true),reason:r.reason},parsed=trace(raw);if(Reflect.ownKeys(r.identity).length!==4||Object.keys(raw.identity).length!==4)failure();
 if(parsed.freshness==='Stale'&&r.freshness!=='Stale'||r.freshness==='Stale'&&r.sourceAtLastRead!=='Unknown/Unsupported')failure();
 // Limits are fixed bounded strings, never a capability inferred from imported text.
 if(!Array.isArray(r.limits)||Object.getPrototypeOf(r.limits)!==Array.prototype||r.limits.length!==LIMITS.length||Reflect.ownKeys(r.limits).length!==LIMITS.length+1)failure();const ds=Object.getOwnPropertyDescriptors(r.limits);for(let i=0;i<LIMITS.length;i++)if(!ds[i]||!Object.hasOwn(ds[i],'value')||ds[i].value!==LIMITS[i])failure();
 return{...r,identity:parsed.identity,records:parsed.records,limits:[...LIMITS]};
}
