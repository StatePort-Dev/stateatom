// SPDX-License-Identifier: Apache-2.0
// Projection of helper evidence, never an ownership verifier or action capability.
import {portableSourcePath} from './source-path.mjs';
export const selectedListSchema='stateatom.selected-list-profile/1';
const kinds=new Set(['write','state-binding','prop','parameter','filter','map','read','host']);
const string=x=>typeof x==='string'&&x.length>0&&x.length<=512;
const digest=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export function validSelectedListEvidence(p){
 const j=p?.occurrence?.joins;
 return p?.schema===selectedListSchema&&string(p.field)&&string(p.page)&&Number.isFinite(p.observedAt)&&p.observedAt>=0&&
  p.sourceProof?.status==='Code-linked'&&['digest','manifestDigest','bundleDigest'].every(k=>digest(p.sourceProof[k]))&&
  p.occurrence?.status==='Observed'&&j&&['revisionId','commitId','writeCallId','readInvocationId','rootId'].every(k=>string(j[k]))&&
  ['row','state'].every(k=>string(j[k]?.nativeId)&&string(j[k]?.dataId))&&['observedId','document','domId'].every(k=>string(j.node?.[k]))&&
  Array.isArray(p.chain)&&p.chain.length>=3&&p.chain.length<=32&&p.chain[0]?.kind==='write'&&p.chain.at(-2)?.kind==='read'&&p.chain.at(-1)?.kind==='host'&&
  p.chain.every(r=>kinds.has(r?.kind)&&string(r.label)&&portableSourcePath(r.source?.file)&&digest(r.source.sourceDigest)&&['line','column'].every(k=>Number.isSafeInteger(r.source[k])&&r.source[k]>0))&&
  Array.isArray(p.limits)&&p.limits.length<=8&&p.limits.every(x=>typeof x==='string'&&x.length<=2048);
}
export function selectedListView(state={}){
 const p=state.analysis?.stateatom?.selectedListProfile;if(!p)return null;
 const stale=!!state.stale||state.analysis?.stateatom?.runtime?.status==='Stale'||state.analysis?.codeJournal?.freshness==='Stale'||p.freshness==='Stale'||p.status==='Stale';
 const s=state.selection,j=p.occurrence?.joins;
 const matches=s?.property==='text'&&s.page===p.page&&s.observedAt===p.observedAt&&s.domIdentity?.document===j?.node?.document&&s.domIdentity?.node===j?.node?.domId;
 const current=!stale&&state.attached===true&&state.analysis?.capabilities?.sourceResolver==='open-ide'&&matches;
 if(stale&&matches&&validSelectedListEvidence(p))return {...p,status:'Stale',fullPath:false,freshness:'Stale',reason:'Inspect again after the change.'};
 if(current&&p.freshness==='Recorded'&&p.status==='Supported finite trace'&&p.fullPath===true&&validSelectedListEvidence(p))return p;
 return {schema:selectedListSchema,status:stale?'Stale':'Unknown/Unsupported',fullPath:false,freshness:stale?'Stale':'Recorded',reason:stale?'Inspect again after the change.':p.reason||'No text origin bound to this selected snapshot.'};
}
// Allow-listed historical data only. No code-context witness, capability, value or script.
export function selectedListRecord(p,{sanitizeText=(x=>x)}={}){
 if(!p)return null;
 const text=sanitizeText,positive=p.fullPath===true&&p.status==='Supported finite trace'&&p.freshness==='Recorded'&&validSelectedListEvidence(p);
 const record={schema:selectedListSchema,status:positive?'Supported finite trace':p.status==='Stale'||p.freshness==='Stale'?'Stale':'Unknown/Unsupported',fullPath:positive,freshness:p.status==='Stale'||p.freshness==='Stale'?'Stale':'Recorded',reason:text(p.reason,1024),trust:'Historical source and occurrence claims; not reverified on import; no action authority.'};
 if(!positive&&!(record.status==='Stale'&&validSelectedListEvidence(p)))return record;
 const j=p.occurrence.joins;
 return {...record,field:text(p.field,128),page:text(p.page,128),observedAt:p.observedAt,scope:text(p.scope,2048),chain:p.chain.map(r=>({kind:r.kind,label:text(r.label,512),source:{file:r.source.file,line:r.source.line,column:r.source.column,sourceDigest:r.source.sourceDigest}})),sourceProof:{status:'Code-linked',profile:text(p.sourceProof.profile,256),...Object.fromEntries(['digest','manifestDigest','bundleDigest'].map(k=>[k,p.sourceProof[k]]))},occurrence:{status:'Observed',joins:{...Object.fromEntries(['revisionId','commitId','writeCallId','readInvocationId','rootId'].map(k=>[k,text(j[k],512)])),...Object.fromEntries(['row','state'].map(k=>[k,{nativeId:text(j[k].nativeId,512),dataId:text(j[k].dataId,512)}])),node:Object.fromEntries(['observedId','document','domId'].map(k=>[k,text(j.node[k],512)]))}},limits:p.limits.map(x=>text(x,2048))};
}
export function parseSelectedListRecord(p,report,options){
 if(p?.chain&&(!validSelectedListEvidence(p)||report.target.property!=='text'||p.page!==report.target.page||p.observedAt!==report.capturedAt))throw Error('Invalid diagnostic selected-list evidence');
 if(!p||p.schema!==selectedListSchema||!['Supported finite trace','Unknown/Unsupported','Stale'].includes(p.status)||!['Recorded','Stale'].includes(p.freshness)||typeof p.fullPath!=='boolean'||p.fullPath!==(p.status==='Supported finite trace')||p.fullPath&&(p.freshness!=='Recorded'||!validSelectedListEvidence(p)||report.freshness==='Stale'||report.target.property!=='text'||p.page!==report.target.page||p.observedAt!==report.capturedAt))throw Error('Invalid diagnostic selected-list evidence');
 return selectedListRecord(p,options);
}
