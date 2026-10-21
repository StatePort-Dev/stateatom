// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 StateAtom contributors.
// Extension-owned CDP compilation facts. No code bodies or execution certificate.
const MAX_SCRIPTS=256,MAX_CONTEXTS=64,MAX_PENDING=8,MAX_SOURCE=2*1024*1024,MAX_BYTES=8*1024*1024;
const codes=new Set(['late-attach','worker-restart','detach','context-destroyed','contexts-cleared','context-reused','script-reused','context-unavailable','script-budget','context-budget','pending-budget','pending-source','source-budget','source-length-unavailable','total-byte-budget','source-unavailable','anonymous-or-non-http','sourceURL','isolated-world','other-frame','world-unavailable','main-frame-unavailable','drain-budget','expired','owned-code-unavailable','owned-code-budget']);
const str=x=>typeof x==='string'&&x.length<=160?x:null;
const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x)?x:null;
const integer=x=>Number.isSafeInteger(x)&&x>=0?x:null;
const resources=new Set(['dependency','vite','app-or-other','anonymous-or-non-http','sourceURL','external-http']);
const ownedRoles=new Set(['selection-helper','deep-helper','fetch-policy-helper','fetch-passthrough','action-observation-global','action-observation-helper']);
const scope='Captured target-scoped compilations only, including inspection helpers. Compilation is not invocation, source equivalence, readonly effects, ownership or current field ancestry. Other targets/workers, undelivered events, earlier and future effects are not excluded.';
function resource(p){if(p.hasSourceURL===true)return 'sourceURL';try{const u=new URL(p.url);if(!['http:','https:'].includes(u.protocol))return 'anonymous-or-non-http';if(!/^http:\/\/127\.0\.0\.1:(4173|4174|4175)$/.test(u.origin))return 'external-http';return u.pathname.includes('/node_modules/')?'dependency':u.pathname.includes('/@vite/')?'vite':'app-or-other';}catch{return 'anonymous-or-non-http';}}
export function newCodeJournal(run,{armedBeforeNavigation=false,debuggerSession=crypto.randomUUID(),incarnation=crypto.randomUUID()}={}){return {schema:1,id:crypto.randomUUID(),run,debuggerSession,incarnation,startedAt:Date.now(),armedBeforeNavigation:armedBeforeNavigation===true,generation:0,contexts:Object.create(null),scripts:Object.create(null),bytes:0,gaps:armedBeforeNavigation?[]:['late-attach']};}
export function journalGap(j,code){if(codes.has(code)&&!j.gaps.includes(code)){j.gaps.push(code);j.generation++;}}
export function journalEvent(j,method,p){
 // Delivered events invalidate old collection snapshots even after a sticky loss.
 if(['Runtime.executionContextCreated','Runtime.executionContextDestroyed','Runtime.executionContextsCleared','Debugger.scriptParsed'].includes(method))j.generation++;
 if(method==='Runtime.executionContextCreated'){
  const c=p.context;if(!Number.isInteger(c?.id)||!str(c.uniqueId)){journalGap(j,'context-unavailable');return null;}
  const old=j.contexts[c.id];if(old&&old.uniqueId!==c.uniqueId){journalGap(j,'context-reused');return null;}
  if(!old&&Object.keys(j.contexts).length>=MAX_CONTEXTS){journalGap(j,'context-budget');return null;}
  if(!old){j.contexts[c.id]={id:c.id,uniqueId:c.uniqueId,frameId:str(c.auxData?.frameId),isDefault:typeof c.auxData?.isDefault==='boolean'?c.auxData.isDefault:null};j.generation++;}return null;
 }
 if(method==='Runtime.executionContextDestroyed'){if(j.contexts[p.executionContextId]){delete j.contexts[p.executionContextId];j.generation++;journalGap(j,'context-destroyed');}return null;}
 if(method==='Runtime.executionContextsCleared'){if(Object.keys(j.contexts).length||Object.keys(j.scripts).length)journalGap(j,'contexts-cleared');j.contexts=Object.create(null);j.generation++;return null;}
 if(method!=='Debugger.scriptParsed')return null;
 const id=str(p.scriptId);if(!id){journalGap(j,'source-unavailable');return null;}if(j.scripts[id]){journalGap(j,'script-reused');return null;}if(Object.keys(j.scripts).length>=MAX_SCRIPTS){journalGap(j,'script-budget');return null;}
 const c=j.contexts[p.executionContextId],r={scriptId:id,contextId:Number.isInteger(p.executionContextId)?p.executionContextId:null,contextUniqueId:c?.uniqueId||null,frameId:c?.frameId||null,world:c?.isDefault===true?'default':c?.isDefault===false?'isolated':'unknown',resource:resource(p),sourceStatus:'Pending',digest:null,bytes:null,capturedGeneration:j.generation,ownedRole:null};
 j.scripts[id]=r;j.generation++;
 if(!c)journalGap(j,'context-unavailable');
 if(integer(p.length)===null){r.sourceStatus='Unavailable';journalGap(j,'source-length-unavailable');return null;}
 if(p.length>MAX_SOURCE){r.sourceStatus='Unavailable';journalGap(j,'source-budget');return null;}
 if(Object.values(j.scripts).filter(x=>x.sourceStatus==='Pending'||x.sourceStatus==='Hashing').length>MAX_PENDING){r.sourceStatus='Queued';return null;}
 return id;
}
export function journalReadySources(j){
 const slots=MAX_PENDING-Object.values(j.scripts).filter(r=>['Pending','Hashing'].includes(r.sourceStatus)).length;
 const records=Object.values(j.scripts).filter(r=>r.sourceStatus==='Queued').slice(0,Math.max(0,slots));
 for(const r of records){r.sourceStatus='Pending';j.generation++;}return records.map(r=>r.scriptId);
}
async function sha(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function journalSource(j,id,text,digest=sha,current=()=>true){
 const r=j.scripts[id];if(!r||r.sourceStatus!=='Pending')return;
 if(typeof text!=='string'){r.sourceStatus='Unavailable';journalGap(j,'source-unavailable');j.generation++;return;}
 // Bound UTF-16 allocation before encoding, then enforce the actual UTF-8 budget.
 if(text.length>MAX_SOURCE){r.sourceStatus='Unavailable';journalGap(j,'source-budget');j.generation++;return;}
 const bytes=new TextEncoder().encode(text);
 if(bytes.length>MAX_SOURCE){r.sourceStatus='Unavailable';journalGap(j,'source-budget');j.generation++;return;}
 if(j.bytes+bytes.length>MAX_BYTES){r.sourceStatus='Unavailable';journalGap(j,'total-byte-budget');j.generation++;return;}
 j.bytes+=bytes.length;r.sourceStatus='Hashing';r.bytes=bytes.length;j.generation++;
 try{const h=hash(await digest(bytes));if(!current())return;if(!h)throw Error();r.digest=h;r.sourceStatus='Hashed';const own=j.ownedCode?.[h+':'+r.contextUniqueId];if(own&&own.generation<r.capturedGeneration)r.ownedRole=own.role;}catch{if(!current())return;r.sourceStatus='Unavailable';journalGap(j,'source-unavailable');}j.generation++;
}
export function journalSnapshot(j,{mainFrameId,selectionGeneration,observedAt}={}){
 const gaps=new Set(j.gaps),scripts=Object.values(j.scripts).map(r=>({...r}));
 if(!str(mainFrameId))gaps.add('main-frame-unavailable');
 for(const r of scripts){const c=j.contexts[r.contextId];if(!c||c.uniqueId!==r.contextUniqueId)gaps.add('context-unavailable');if(r.world==='isolated')gaps.add('isolated-world');if(r.world==='unknown')gaps.add('world-unavailable');if(r.world==='default'&&r.frameId!==mainFrameId)gaps.add('other-frame');if(['Pending','Hashing','Queued'].includes(r.sourceStatus))gaps.add('pending-source');if(r.resource==='sourceURL')gaps.add('sourceURL');if(r.resource==='anonymous-or-non-http')gaps.add('anonymous-or-non-http');}
 return journalReport({schema:1,id:j.id,run:j.run,debuggerSession:j.debuggerSession,incarnation:j.incarnation,generation:j.generation,capturedAt:Date.now(),startedAt:j.startedAt,armedBeforeNavigation:j.armedBeforeNavigation,mainFrameId,selectionGeneration,observedAt,freshness:'Recorded',gaps:[...gaps],scripts});
}
export function journalView(snapshot,j){if(!snapshot)return null;const stale=!j||snapshot.id!==j.id||snapshot.run!==j.run||snapshot.generation!==j.generation||Date.now()-snapshot.capturedAt>300000;return journalReport({...snapshot,freshness:stale?'Stale':snapshot.freshness});}
export function journalReport(s){
 if(!s||s.schema!==1||!Array.isArray(s.scripts))return null;
 const scripts=s.scripts.slice(0,MAX_SCRIPTS).map(r=>({scriptId:str(r.scriptId),contextId:Number.isInteger(r.contextId)?r.contextId:null,contextUniqueId:str(r.contextUniqueId),frameId:str(r.frameId),world:['default','isolated'].includes(r.world)?r.world:'unknown',resource:resources.has(r.resource)?r.resource:'anonymous-or-non-http',sourceStatus:['Pending','Hashing','Queued','Hashed','Unavailable'].includes(r.sourceStatus)?r.sourceStatus:'Unavailable',digest:hash(r.digest),bytes:integer(r.bytes),ownedRole:ownedRoles.has(r.ownedRole)?r.ownedRole:null}));
 return {schema:1,id:str(s.id),run:str(s.run),debuggerSession:str(s.debuggerSession),incarnation:str(s.incarnation),generation:integer(s.generation),capturedAt:integer(s.capturedAt),startedAt:integer(s.startedAt),armedBeforeNavigation:s.armedBeforeNavigation===true,mainFrameId:str(s.mainFrameId),selectionGeneration:integer(s.selectionGeneration),observedAt:integer(s.observedAt),freshness:s.freshness==='Stale'?'Stale':'Recorded',status:scripts.length?'Observed':'Unknown/Unsupported',counts:{captured:scripts.length,hashed:scripts.filter(r=>r.digest&&r.sourceStatus==='Hashed').length,pending:scripts.filter(r=>['Pending','Hashing','Queued'].includes(r.sourceStatus)).length,queued:scripts.filter(r=>r.sourceStatus==='Queued').length,isolated:scripts.filter(r=>r.world==='isolated').length,unknownWorld:scripts.filter(r=>r.world==='unknown').length},gaps:[...new Set((Array.isArray(s.gaps)?s.gaps:[]).filter(g=>codes.has(g)))],scripts,scope,executableHistory:'Unknown/Unsupported',readonlyEffects:'Unknown/Unsupported',sourceEquivalence:'Unknown/Unsupported',currentFieldAncestry:'Unknown/Unsupported',completeWriterCoverage:false,fullPath:false,omissions:'No code bodies, URLs, query strings, sourcemaps or raw CDP errors retained. Resource classes are labels, not authority or safe-code classifications.'};
}
