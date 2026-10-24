// SPDX-License-Identifier: Apache-2.0
// Pure saved-fact guards. Controlled tests are not browser/runtime evidence.
import assert from'node:assert/strict';
const unknown=['causalTransfer','resultStorage','currentMembership','fieldOwnership','stateRevision','propTransfer','selectedPropertyOrigin'];
export function admitArrayCallsiteNode(actual,expected){assert.equal(actual.execPath,expected.executable);assert.equal(actual.procExe,expected.executable);assert.equal(actual.version,expected.version);assert.equal(actual.sha256,expected.sha256);}
export function guardArrayCallsiteWindow(capture,{siteMap,filterSite,mapSite,rowCount}){
 const s=capture.snapshot,r=capture.retention;assert.equal(capture.sealed,true);assert.equal(r.collecting,false);assert.equal(s.schema,'stateatom.array-callsite-observation/1');assert.equal(s.status,'Observed');for(const k of unknown)assert.equal(s[k],'Unknown/Unsupported');assert.equal(s.fullPath,false);
 assert.equal(r.stopped,false);assert.equal(r.overflow,false);assert.equal(r.invalid,false);assert.equal(r.pending,0);assert.equal(r.calls,s.calls.length);assert.equal(r.yields,s.calls.reduce((n,c)=>n+c.yields.length,0));assert(r.calls>0&&r.calls<=64);assert(r.yields<=512);assert.equal(s.window.id,s.page+':window:'+r.window);assert(Number.isSafeInteger(rowCount)&&rowCount>0&&rowCount<=32);
 const identity=(value,kind)=>{assert.equal(typeof value,'string');const prefix=s.page+':'+kind+':';assert(value.startsWith(prefix));const suffix=value.slice(prefix.length);assert(/^[1-9]\d*$/.test(suffix));assert(Number.isSafeInteger(Number(suffix)));},calls=new Map(),order=[];
 for(const c of s.calls){identity(c.id,'call');assert(!calls.has(c.id));calls.set(c.id,c);assert.deepEqual(c.site,siteMap[c.site.id]);assert.equal(c.kind,c.site.kind);assert(['filter','map'].includes(c.kind));assert.equal(c.status,'completed');identity(c.sourceId,'object');identity(c.resultId,'object');assert(Number.isSafeInteger(c.started)&&c.started>0&&Number.isSafeInteger(c.finished)&&c.finished>c.started);order.push(c.started,c.finished);const indices=new Set();for(const y of c.yields){assert(Number.isSafeInteger(y.index)&&y.index>=0);assert(!indices.has(y.index));indices.add(y.index);if(y.itemId!==null)identity(y.itemId,'object');if(c.kind==='map'){assert.equal(y.accepted,null);if(y.elementId!==null)identity(y.elementId,'object');}else{assert.equal(typeof y.accepted,'boolean');assert.equal(y.elementId,null);}}}
 assert.deepEqual([...order].sort((a,b)=>a-b),Array.from({length:2*s.calls.length},(_,i)=>i+1),'Complete source window sequence required');
 const view=c=>({id:c.id,site:c.site,sourceId:c.sourceId,resultId:c.resultId,started:c.started,finished:c.finished}),keys=new Set();
 for(const l of s.links){const f=calls.get(l.filter.id),m=calls.get(l.map.id);assert(f&&m);assert.equal(f.kind,'filter');assert.equal(m.kind,'map');assert.deepEqual(l.filter,view(f));assert.deepEqual(l.map,view(m));assert.equal(f.resultId,m.sourceId);assert(f.finished<m.started);const from=f.yields.filter(y=>y.accepted&&y.itemId===l.itemId),to=m.yields.filter(y=>y.itemId===l.itemId&&y.elementId===l.elementId);assert.equal(from.length,1);assert.equal(to.length,1);assert.equal(from[0].index,l.sourceIndex);assert.equal(to[0].index,l.mapIndex);identity(l.itemId,'object');identity(l.elementId,'object');const key=[f.id,m.id,l.sourceIndex,l.mapIndex].join('/');assert(!keys.has(key));keys.add(key);}
 const groups=[],maps=s.calls.filter(c=>c.kind==='map'&&c.site.id===mapSite);assert(maps.length>0,'No observed Main map');assert.equal(siteMap[filterSite].kind,'filter');assert.equal(siteMap[mapSite].kind,'map');
 for(const m of maps){const parents=s.calls.filter(f=>f.kind==='filter'&&f.site.id===filterSite&&f.resultId===m.sourceId);assert.equal(parents.length,1);const f=parents[0];assert(f.finished<m.started);assert.equal(m.yields.length,rowCount);assert.deepEqual(m.yields.map(y=>y.index),Array.from({length:rowCount},(_,i)=>i));const itemIds=[],elementIds=[],sourceIndices=[];
  for(const y of m.yields){identity(y.itemId,'object');identity(y.elementId,'object');const matches=s.links.filter(l=>l.map.id===m.id&&l.mapIndex===y.index);assert.equal(matches.length,1);const l=matches[0];assert.equal(l.filter.id,f.id);assert.equal(l.itemId,y.itemId);assert.equal(l.elementId,y.elementId);itemIds.push(y.itemId);elementIds.push(y.elementId);sourceIndices.push(l.sourceIndex);}
  assert.equal(new Set(itemIds).size,rowCount);assert.equal(new Set(elementIds).size,rowCount);groups.push({filterCallId:f.id,mapCallId:m.id,itemIds,elementIds,sourceIndices});
 }
 return{page:s.page,window:{...s.window},groups,scope:'Original source callback identity only',causalTransfer:'Unknown/Unsupported',stateRevision:'Unknown/Unsupported',selectedPropertyOrigin:'Unknown/Unsupported',fullPath:false};
}
export function guardArrayCallsiteEvolution(phases){
 const names=['equal','same','changed','toggle','filtered'],windows=new Set(),page=phases.equal.page;for(const name of names){const p=phases[name];assert.equal(p.page,page);assert.equal(p.window.label,name);assert(!windows.has(p.window.id));windows.add(p.window.id);assert(p.groups.length>0);}
 const second=phases.equal.groups[0].itemIds[1],seenFirst=new Set();assert(second);
 for(const name of names.slice(0,4)){const groups=phases[name].groups;for(const g of groups){assert.equal(g.itemIds.length,2);assert.equal(g.itemIds[1],second);assert.deepEqual(g.sourceIndices,[0,1]);assert.notEqual(g.itemIds[0],second);}const first=groups.map(g=>g.itemIds[0]);if(name!=='equal')assert(first.some(x=>!seenFirst.has(x)),'A newly observed first-row reference required for '+name);for(const x of first)seenFirst.add(x);}
 for(const g of phases.filtered.groups){assert.deepEqual(g.itemIds,[second]);assert.deepEqual(g.sourceIndices,[1]);}
 return{secondRowId:second,firstRowIds:[...seenFirst],allFiveWindowsDistinct:true,fullPath:false,ownership:'Unknown/Unsupported',selectedProducer:'Unknown/Unsupported'};
}
export async function cleanupArrayCallsite(boundaries,flags,errors){for(const[name,close]of Object.entries(boundaries)){try{flags[name]=await close();}catch(e){flags[name]=false;errors.push('cleanup '+name+': '+String(e.message||e));}}}
export function parseArrayCallsiteArgs(args){
 if(args.length===1&&typeof args[0]==='string'&&args[0]&&!args[0].startsWith('--'))return{mode:'run',caseFile:args[0]};
 if(args.length===2&&args[0]==='--preflight'&&args[1]&&!args[1].startsWith('--'))return{mode:'preflight',caseFile:args[1]};
 if(args.length===3&&args[0]==='--prepare'&&args[1]&&args[2]&&!args[1].startsWith('--')&&!args[2].startsWith('--'))return{mode:'prepare',caseFile:args[1],out:args[2]};
 throw Error('Unexpected array-callsite CLI options');
}
export function arrayCallsiteProtocol(){return{callLimit:64,yieldLimit:512,sealedWindows:true,phases:[
 ['equal',['SAME','SAME'],[false,false],2,[0,1]],['same',['SAME','SAME'],[false,false],2,[0,1]],['changed',['CHANGED','SAME'],[false,false],2,[0,1]],['toggle',['CHANGED','SAME'],[true,false],2,[0,1]],['filtered',['SAME'],[false],1,[1]],['stopped',['SAME','AFTER_STOP'],[false,false],null,null]
 ].map(([id,texts,checked,rowCount,sourceIndices])=>({id,texts,checked,rowCount,sourceIndices}))};}
export function guardArrayCallsiteCase(s){
 assert.equal(s.schema,'stateatom.array-callsite-case/1');assert.equal(s.maximumNativeRuns,1);assert.equal(typeof s.pagePrefix,'string');assert(s.pagePrefix.length>0&&s.pagePrefix.length<=80);assert.equal(s.upstreamRevision,'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');assert.equal(s.originalSourceFiles,28);assert.deepEqual(s.modes,['original','off','on']);assert.deepEqual(s.protocol,arrayCallsiteProtocol());assert.equal(s.browser.headless,true);assert.equal(s.browser.chromiumSandbox,true);assert.equal(s.browser.withExtension,false);assert.equal(s.withHelper,false);assert.equal(s.withIDE,false);assert.equal(s.productSupport,false);assert.equal(s.fullA02,false);assert.equal(s.siteMap[s.targetSites.filter].kind,'filter');assert.equal(s.siteMap[s.targetSites.map].kind,'map');assert.notEqual(s.targetSites.filter,s.targetSites.map);
}
export function guardArrayCallsiteRun(r,s){
 guardArrayCallsiteCase(s);assert.equal(r.schema,'stateatom.array-callsite-result/1');assert.equal(r.diagnosticOnly,true);assert.equal(r.productSupport,false);assert.equal(r.fullA02,false);assert.deepEqual(r.errors,[]);assert.deepEqual(r.console,[]);assert.equal(r.inputsUnchanged,true);for(const k of['browser','server','browserPidAbsent'])assert.equal(r.cleanup[k],true);assert(Object.values(r.cleanup).every(v=>v===true));assert.deepEqual(r.runs.map(x=>x.mode),s.modes);
 const qualified={};
 for(const run of r.runs){assert.equal(run.closed,true);assert.equal(run.pageId,s.pagePrefix+':'+run.mode);assert.equal(run.document.mainOnly,true);for(const key of['frameId','loaderId','targetId'])assert.equal(typeof run.document[key],'string');assert.deepEqual(run.phases.map(p=>p.id),s.protocol.phases.map(p=>p.id));const callIds=new Set();
  for(const expected of s.protocol.phases){const p=run.phases.find(p=>p.id===expected.id);assert.deepEqual(p.document,run.document);assert.deepEqual(p.dom.texts,expected.texts);assert.deepEqual(p.dom.checked,expected.checked);
   if(run.mode==='original'){assert.equal(p.capture,null);continue;}
   const c=p.capture;assert.equal(c.snapshot.page,run.pageId);assert.equal(c.sealed,true);assert.equal(c.retention.collecting,false);assert.equal(c.retention.overflow,false);assert.equal(c.retention.invalid,false);assert.equal(c.retention.pending,0);assert.equal(c.snapshot.window.label,p.id);for(const key of unknown)assert.equal(c.snapshot[key],'Unknown/Unsupported');assert.equal(c.snapshot.fullPath,false);
   for(const call of c.snapshot.calls){assert(!callIds.has(call.id),'Reused call event across windows');callIds.add(call.id);}
   if(expected.id==='stopped'||run.mode==='off'){assert.equal(c.snapshot.status,'Unknown/Unsupported');assert.equal(c.snapshot.reason,expected.id==='stopped'?'Observer stopped':'Observer disabled');assert.equal(c.retention.stopped,expected.id==='stopped');assert.equal(c.retention.calls,0);assert.equal(c.retention.yields,0);assert.deepEqual(c.snapshot.calls,[]);assert.deepEqual(c.snapshot.links,[]);}
   else qualified[p.id]=guardArrayCallsiteWindow(c,{siteMap:s.siteMap,filterSite:s.targetSites.filter,mapSite:s.targetSites.map,rowCount:expected.rowCount});
  }
 }
 const evolution=guardArrayCallsiteEvolution(qualified);return{status:'PASS_SAVED_SOURCE_FACTS_ONLY',nativeRuntimeProven:false,on:{groups:Object.entries(qualified).map(([phase,q])=>({phase,...q}))},evolution,fullA02:false,selectedProducer:'Unknown/Unsupported'};
}
