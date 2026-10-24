// SPDX-License-Identifier: Apache-2.0
// Pure research-result predicates. A synthetic DTO is never native evidence.
import assert from 'node:assert/strict';

export const restoreAvailabilityPass='PASS_RESTORE_AVAILABILITY_NOT_FULL_V03';
export const externalRestoreAvailabilityPass='PASS_EXPLICIT_EXTERNAL_RESTORE_AVAILABILITY_NOT_FULL_V03';
export const convergedRestoreAvailabilityPass='PASS_CONVERGED_EXTERNAL_RESTORE_AVAILABILITY_NOT_FULL_V03';
const incomplete='INCOMPLETE_RESTORE_AVAILABILITY';
const checks=['exact78-package-and-node-admission','original-picker-and-open','live10-and-disabled-restoration','live20-and-disabled-restoration','native-close-preserves-value','console-host-and-rendered-checks'];
const externalChecks=[...checks];externalChecks[2]='live10-external-aba-read-and-disabled-restoration';externalChecks[3]='live20-external-aba-read-and-disabled-restoration';
const convergedChecks=[...externalChecks];convergedChecks[2]='live10-converged-external-aba-read-and-disabled-restoration';convergedChecks[3]='live20-converged-external-aba-read-and-disabled-restoration';
const cleanup=['appConsole','inspector','browser','vite','viteLogWrite','viteLogClose','api','desktop','pidsAbsent'];
const physical=['tabId','origin','run','document','node','selector','property','build'];
const identity=r=>({id:r.id,kind:r.kind,type:r.type,writable:r.writable,locator:r.locator});
const text=(v,max=256)=>typeof v==='string'&&v.length>0&&v.length<=max;
const revision=v=>Number.isSafeInteger(v)&&v>=0||text(v,512);
function currentResource(p){
 assert(Array.isArray(p.inputs.resources)&&p.inputs.resources.length<=32);
 const rows=p.inputs.resources.filter(x=>x.resource.locator.selector==='#minPrice');
 assert.equal(rows.length,1);return rows[0];
}
function requiredSnapshotIdentity(p){
 const s=p.inputs,t=s.target;assert(text(s.investigationId));
 assert(Number.isSafeInteger(t.tabId)&&t.tabId>=0);for(const k of ['origin','run','document','node','selector','property'])assert(text(t[k],512));
 assert(t.build===null||typeof t.build==='string'&&/^[a-f0-9]{64}$/.test(t.build));
 for(const k of ['document','node','property'])assert(text(p.selection.domIdentity[k]));
 assert(revision(currentResource(p).resource.revision));
}
function documentAndField(p,panelURL,value,closed){
 const f=p.field;assert.equal(f.document.url,panelURL);assert.equal(typeof f.document.title,'string');assert(f.document.title.length>0);
 assert.equal(f.document.mainPresent,true);assert.equal(f.document.noOverlay,true);
 assert.equal(f.rowPresent,true);assert.equal(f.value,String(value));assert.equal(f.disabled,closed);
 assert.equal(f.dirty,false);assert.equal(f.ariaInvalid,'false');assert.equal(f.rowErrorVisible,false);assert.equal(f.rowError,'');
 for(const button of ['undo','baseline']){
  assert.equal(f[button].exists,true);assert.equal(f[button].visible,true);assert.equal(f[button].disabled,true);
 }
}
function guardBehaviorFacts(r){
 assert.equal(r.diagnosticOnly,true);
 assert.equal(r.originalCriteriaWaived,false);assert.equal(r.originalGuide,'FAIL');assert.equal(r.fullV03,false);
 assert.equal(r.traceInstrumented,false);assert.equal(r.productionChanges,false);assert.equal(r.selectedControlMatchesOriginal,true);
 assert.match(r.panelURL,/^chrome-extension:\/\/[a-p]{32}\/panel\.html$/);
 const baseline=r.baseline.inputs,base=currentResource(r.baseline).resource,target=baseline.target;
 assert.equal(r.tabId,target.tabId);
 assert.equal(target.selector,'#minPrice');assert.equal(target.property,'disabled');
 const origin=new URL(target.origin);assert.equal(origin.hostname,'127.0.0.1');assert.equal(origin.protocol,'http:');
 assert.equal(base.kind,'dom-control');assert.equal(base.type,'number');assert.equal(base.writable,true);
 assert.equal(base.locator.document,target.document);assert.equal(base.locator.control,'number');
 assert.equal(typeof base.id,'string');assert(base.id.length>0);assert.equal(typeof base.locator.node,'string');assert(base.locator.node.length>0);
 const phases=[[r.baseline,0,0,false],[r.afterFirst,10,1,false],[r.afterSecond,20,2,false],[r.closed,20,2,true]];
 let previousEnd=-Infinity;
 for(const[p,value,count,closed]of phases){
  assert.equal(p.captureStatus,'Complete');
  requiredSnapshotIdentity(p);
  assert(Number.isFinite(p.startedAt)&&Number.isFinite(p.finishedAt)&&p.startedAt>=previousEnd&&p.finishedAt>=p.startedAt);previousEnd=p.finishedAt;
  const s=p.inputs,row=currentResource(p),resource=row.resource;
  assert.equal(s.investigationId,baseline.investigationId);assert.equal(s.closed,closed);assert.equal(s.tainted,false);assert.equal(s.pending,null);assert.equal(s.cleanup,closed?'closed':'active');
  for(const k of physical)assert.equal(s.target[k],target[k]);
  for(const k of ['document','node','property'])assert.equal(p.selection.domIdentity[k],target[k]);
  assert.deepEqual(identity(resource),identity(base));assert.equal(resource.value,value);
  assert.equal(s.history.length,count);assert.equal(s.canUndo,false);assert.equal(s.canRestoreBaseline,false);
  assert.equal(p.dom.ready,'complete');assert.equal(p.dom.minValue,String(value));assert.deepEqual(p.dom.products,value===0?[1,2]:value===10?[1]:[]);assert.equal(p.dom.imagesReady,true);assert.equal(p.dom.errorOverlay,false);
  documentAndField(p,r.panelURL,value,closed);
  if(count){
   assert.equal(row.externalRevision,true);const owned=s.history.at(-1).outcomes[0].after;assert(revision(owned.revision));
   assert.notEqual(resource.revision,owned.revision);assert.equal(resource.value,owned.value);
  }
 }
 assert.deepEqual(r.afterFirst.inputs.history,r.afterSecond.inputs.history.slice(0,1));
 assert.deepEqual(r.closed.inputs.history,r.afterSecond.inputs.history);assert.deepEqual(r.closed.inputs.resources,r.afterSecond.inputs.resources);
 const history=r.afterSecond.inputs.history;assert.notEqual(history[0].id,history[1].id);
 for(const[i,value]of[10,20].entries()){
  const tx=history[i];assert.equal(typeof tx.id,'string');assert(tx.id.length>0);assert.equal(tx.kind,'apply');assert.equal(tx.mode,'live');assert.equal(tx.phase,'applied');assert.equal(tx.atomic,false);assert.equal(tx.applicationRestored,false);
  assert.equal(tx.outcomes.length,1);const o=tx.outcomes[0];assert.equal(o.phase,'applied');assert.equal(o.resourceId,base.id);assert.equal(o.value,value);assert.equal(o.after.value,value);assert(revision(o.after.revision));assert.deepEqual(identity(o.after),identity(base));
 }
 assert.deepEqual(r.edits.map(e=>e.value),[10,20]);assert(r.edits.every(e=>e.enter===false&&e.blur===false&&e.focused===true));
 for(const[w,final,initial,value,count]of [[r.firstWindow,r.afterFirst,r.baseline,10,1],[r.secondWindow,r.afterSecond,r.afterFirst,20,2]]){
  assert.equal(w.requestedMs,1200);assert(Number.isFinite(w.startedAt)&&w.startedAt>=initial.finishedAt);assert(Number.isFinite(w.finishedAt)&&w.finishedAt-w.startedAt>=1200&&w.finishedAt<=final.startedAt);
  assert(Array.isArray(w.samples)&&w.samples.length>=2&&w.samples.length<=64);let previous=w.startedAt;
  for(const sample of w.samples){
   assert.equal(sample.captureStatus,'Complete');
   requiredSnapshotIdentity(sample);
   assert(Number.isFinite(sample.startedAt)&&sample.startedAt>=previous&&Number.isFinite(sample.finishedAt)&&sample.finishedAt>=sample.startedAt&&sample.finishedAt<=w.finishedAt);previous=sample.finishedAt;
   assert.equal(sample.inputs.investigationId,baseline.investigationId);assert.equal(sample.inputs.history.length,count);assert.deepEqual(sample.inputs.history,final.inputs.history);
   for(const k of physical)assert.equal(sample.inputs.target[k],target[k]);
   const row=currentResource(sample),resource=row.resource;assert.deepEqual(identity(resource),identity(base));assert.equal(resource.value,value);
   assert.equal(sample.inputs.closed,false);assert.equal(sample.inputs.tainted,false);assert.equal(sample.inputs.pending,null);assert.equal(sample.inputs.cleanup,'active');assert.equal(sample.inputs.canUndo,false);assert.equal(sample.inputs.canRestoreBaseline,false);
   for(const k of ['document','node','property'])assert.equal(sample.selection.domIdentity[k],target[k]);
   assert.equal(row.externalRevision,true);const owned=sample.inputs.history.at(-1).outcomes[0].after;assert(revision(owned.revision));assert.notEqual(resource.revision,owned.revision);assert.equal(resource.value,owned.value);
   assert.equal(sample.dom.ready,'complete');assert.equal(sample.dom.minValue,String(value));assert.deepEqual(sample.dom.products,value===10?[1]:[]);assert.equal(sample.dom.imagesReady,true);assert.equal(sample.dom.errorOverlay,false);
   documentAndField(sample,r.panelURL,value,false);
  }
 }
 return restoreAvailabilityPass;
}
export function guardRestoreAvailability(r){assert.equal(r.schema,'stateatom.restore-availability-native/1');guardBehaviorFacts(r);return restoreAvailabilityPass;}
export function guardRestoreExternalEditSnapshot(p,before,ownValue,appValue,panelURL){
 assert.equal(p.captureStatus,'Complete');assert.equal(before.captureStatus,'Complete');requiredSnapshotIdentity(p);requiredSnapshotIdentity(before);
 assert(Number.isFinite(p.startedAt)&&Number.isFinite(p.finishedAt)&&p.finishedAt>=p.startedAt);
 assert.equal(p.inputs.investigationId,before.inputs.investigationId);for(const k of physical)assert.equal(p.inputs.target[k],before.inputs.target[k]);
 for(const k of ['document','node','property'])assert.equal(p.selection.domIdentity[k],before.inputs.target[k]);
 assert.deepEqual(identity(currentResource(p).resource),identity(currentResource(before).resource));assert.deepEqual(p.inputs.history,before.inputs.history);
 assert.equal(p.inputs.closed,false);assert.equal(p.inputs.cleanup,'active');assert.equal(p.inputs.tainted,false);assert.equal(p.inputs.pending,null);
 assert.equal(p.dom.minValue,String(appValue));assert.equal(p.dom.minFocused,true);assert.equal(p.dom.ready,'complete');assert.equal(p.dom.errorOverlay,false);assert.equal(p.dom.imagesReady,true);
 const f=p.field;assert.equal(f.document.url,panelURL);assert.equal(f.document.mainPresent,true);assert.equal(f.document.noOverlay,true);
 assert.equal(f.rowPresent,true);assert.equal(f.value,String(ownValue));assert.equal(f.disabled,false);assert.equal(f.dirty,false);assert.equal(f.ariaInvalid,'false');assert.equal(f.rowErrorVisible,false);assert.equal(f.rowError,'');
 return true;
}
function guardExternalBehaviorFacts(r){
 guardBehaviorFacts(r);
 assert(Array.isArray(r.externalInteractions)&&r.externalInteractions.length===2);
 const base=currentResource(r.baseline).resource,target=r.baseline.inputs.target;
 const complete=(p,previous)=>{assert.equal(p.captureStatus,'Complete');assert(Number.isFinite(p.startedAt)&&Number.isFinite(p.finishedAt)&&p.startedAt>=previous&&p.finishedAt>=p.startedAt);return p.finishedAt;};
 for(const[index,ownValue]of[10,20].entries()){
  const x=r.externalInteractions[index],prior=index?r.afterFirst:r.baseline,final=index?r.afterSecond:r.afterFirst,window=index?r.secondWindow:r.firstWindow;
  assert.equal(x.ownValue,ownValue);complete(x,prior.finishedAt);
  let previous=complete(x.before,x.startedAt);
  for(const p of [x.before,x.after]){
   requiredSnapshotIdentity(p);assert.equal(p.inputs.investigationId,r.baseline.inputs.investigationId);for(const k of physical)assert.equal(p.inputs.target[k],target[k]);for(const k of ['document','node','property'])assert.equal(p.selection.domIdentity[k],target[k]);
   assert.deepEqual(identity(currentResource(p).resource),identity(base));assert.equal(currentResource(p).resource.value,ownValue);assert.deepEqual(p.inputs.history,final.inputs.history);assert.equal(p.inputs.closed,false);assert.equal(p.inputs.tainted,false);assert.equal(p.inputs.pending,null);assert.equal(p.inputs.cleanup,'active');
   assert.equal(p.dom.minValue,String(ownValue));assert.equal(p.field.rowPresent,true);assert.equal(p.field.value,String(ownValue));assert.equal(p.field.dirty,false);assert.equal(p.field.ariaInvalid,'false');assert.equal(p.field.rowErrorVisible,false);
  }
  assert(Array.isArray(x.appEdits)&&x.appEdits.length===2);
  for(const[i,value]of[ownValue+1,ownValue].entries()){
   const e=x.appEdits[i];previous=complete(e,previous);assert.equal(e.value,value);assert.equal(e.method,'CDP.Input.insertText');assert.equal(e.dom.minValue,String(value));assert.equal(e.dom.minFocused,true);assert.equal(e.dom.ready,'complete');assert.equal(e.dom.errorOverlay,false);assert.equal(e.dom.imagesReady,true);assert.deepEqual(e.dom.products,index?[]:[1]);guardRestoreExternalEditSnapshot(e.snapshot,x.before,ownValue,value,r.panelURL);assert(e.snapshot.startedAt>=e.startedAt&&e.snapshot.finishedAt<=e.finishedAt);
  }
  previous=complete(x.read,previous);assert.equal(x.read.method,'native-input-ui-button');assert.equal(x.read.control,'input-read');assert.equal(x.read.directInputReadRPC,false);
  previous=complete(x.after,previous);assert(x.finishedAt>=previous&&x.finishedAt<=window.startedAt);
  const after=currentResource(x.after),before=currentResource(x.before).resource,owned=final.inputs.history.at(-1).outcomes[0].after;
  assert.equal(after.externalRevision,true);assert.notEqual(after.resource.revision,before.revision);assert.notEqual(after.resource.revision,owned.revision);assert.equal(x.after.inputs.canUndo,false);assert.equal(x.after.inputs.canRestoreBaseline,false);documentAndField(x.after,r.panelURL,ownValue,false);
 }
 return externalRestoreAvailabilityPass;
}
export function guardExternalRestoreAvailability(r){assert.equal(r.schema,'stateatom.external-restore-availability-native/1');assert.equal(r.protocolMode,'external-aba');return guardExternalBehaviorFacts(r);}
export function guardConvergedRestoreAvailability(r){
 assert.equal(r.schema,'stateatom.converged-restore-availability-native/1');assert.equal(r.protocolMode,'converged-external-aba');guardExternalBehaviorFacts(r);
 for(const x of r.externalInteractions)for(const e of x.appEdits){
  const d=e.immediateDom;assert.equal(d.minValue,String(e.value));assert.equal(d.minFocused,true);assert.equal(d.ready,'complete');assert.equal(d.imagesReady,true);assert.equal(d.errorOverlay,false);
  assert(Number.isFinite(e.immediateObservedAt)&&e.immediateObservedAt>=e.startedAt);
  const g=e.convergence;assert.equal(g.captureStatus,'Complete');assert.equal(g.sampleIntervalMs,100);assert.equal(g.consecutiveMatches,3);assert.equal(g.maxSamples,50);assert.equal(g.maxElapsedMs,5000);
  assert(Number.isFinite(g.startedAt)&&g.startedAt>=e.immediateObservedAt&&Number.isFinite(g.finishedAt)&&g.finishedAt>=g.startedAt&&g.finishedAt-g.startedAt<=5000&&g.finishedAt<=e.finishedAt);
  assert(Array.isArray(g.samples)&&g.samples.length>=3&&g.samples.length<=50);let previous=g.startedAt,previousStart,streak=0;
  for(const [index,p]of g.samples.entries()){
   guardRestoreExternalEditSnapshot(p,x.before,x.ownValue,e.value,r.panelURL);assert(p.startedAt>=previous&&p.finishedAt<=g.finishedAt);if(previousStart!==undefined)assert(p.startedAt-previousStart>=100);previous=p.finishedAt;previousStart=p.startedAt;
   assert(Array.isArray(p.dom.products)&&p.dom.products.length<=2&&p.dom.products.every((v,i,a)=>[1,2].includes(v)&&(i===0||a[i-1]<v)));
   const match=JSON.stringify(p.dom.products)===JSON.stringify(x.ownValue===10?[1]:[]);streak=match?streak+1:0;if(streak===3)assert.equal(index,g.samples.length-1);
  }
  assert.equal(streak,3);assert.deepEqual(e.snapshot,g.samples.at(-1));assert.deepEqual(e.dom,e.snapshot.dom);
 }
 return convergedRestoreAvailabilityPass;
}
function finalizeFacts(r,external,converged=false){
 const pass=converged?convergedRestoreAvailabilityPass:external?externalRestoreAvailabilityPass:restoreAvailabilityPass,fail=converged?'INCOMPLETE_CONVERGED_RESTORE_AVAILABILITY':external?'INCOMPLETE_EXTERNAL_RESTORE_AVAILABILITY':incomplete;
 try{
  assert.equal(r.status,pass);(converged?guardConvergedRestoreAvailability:external?guardExternalRestoreAvailability:guardRestoreAvailability)(r);
  for(const k of ['console','appConsole','errors'])assert.deepEqual(r[k],[]);
  const c=r.appConsoleCollection;assert.equal(c.schema,'stateatom.restore-app-console/1');assert.equal(c.status,'Stopped');assert.equal(c.tabId,r.tabId);assert.equal(c.overflow,false);assert.equal(c.seen,r.appConsole.length);assert.deepEqual(c.records,r.appConsole);assert(Number.isFinite(c.startedAt)&&c.startedAt<=r.baseline.startedAt&&Number.isFinite(c.stoppedAt)&&c.stoppedAt>=r.closed.finishedAt);
  assert.deepEqual(r.checks,(converged?convergedChecks:external?externalChecks:checks).map(name=>({name,status:'PASS'})));
  for(const k of cleanup)assert.equal(r.cleanup[k],true);
  assert.equal(r.inputsUnchanged,true);assert(r.inputsBefore&&Object.keys(r.inputsBefore).length>0);assert.deepEqual(r.inputsAfter,r.inputsBefore);
  assert.deepEqual(r.views.map(v=>v.width),[1100,390]);for(const v of r.views){assert.equal(v.overflow,false);assert.equal(v.rootFont,'13px');}
  return r.status=pass;
 }catch{return r.status=fail;}
}
export function finalizeRestoreAvailability(r){return finalizeFacts(r,false);}
export function finalizeExternalRestoreAvailability(r){return finalizeFacts(r,true);}

export function finalizeConvergedRestoreAvailability(r){return finalizeFacts(r,true,true);}
