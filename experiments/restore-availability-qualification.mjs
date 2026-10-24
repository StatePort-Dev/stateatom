// SPDX-License-Identifier: Apache-2.0
// Pure research-result predicates. A synthetic DTO is never native evidence.
import assert from 'node:assert/strict';

export const restoreAvailabilityPass='PASS_RESTORE_AVAILABILITY_NOT_FULL_V03';
const incomplete='INCOMPLETE_RESTORE_AVAILABILITY';
const checks=['exact78-package-and-node-admission','original-picker-and-open','live10-and-disabled-restoration','live20-and-disabled-restoration','native-close-preserves-value','console-host-and-rendered-checks'];
const cleanup=['inspector','browser','vite','viteLogWrite','viteLogClose','api','desktop','pidsAbsent'];
const physical=['tabId','origin','run','document','node','selector','property','build'];
const identity=r=>({id:r.id,kind:r.kind,type:r.type,writable:r.writable,locator:r.locator});
function currentResource(p){
 assert(Array.isArray(p.inputs.resources)&&p.inputs.resources.length<=32);
 const rows=p.inputs.resources.filter(x=>x.resource.locator.selector==='#minPrice');
 assert.equal(rows.length,1);return rows[0];
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
export function guardRestoreAvailability(r){
 assert.equal(r.schema,'stateatom.restore-availability-native/1');assert.equal(r.diagnosticOnly,true);
 assert.equal(r.originalCriteriaWaived,false);assert.equal(r.originalGuide,'FAIL');assert.equal(r.fullV03,false);
 assert.equal(r.traceInstrumented,false);assert.equal(r.productionChanges,false);assert.equal(r.selectedControlMatchesOriginal,true);
 assert.match(r.panelURL,/^chrome-extension:\/\/[a-p]{32}\/panel\.html$/);
 const baseline=r.baseline.inputs,base=currentResource(r.baseline).resource,target=baseline.target;
 assert.equal(target.selector,'#minPrice');assert.equal(target.property,'disabled');
 const origin=new URL(target.origin);assert.equal(origin.hostname,'127.0.0.1');assert.equal(origin.protocol,'http:');
 assert.equal(base.kind,'dom-control');assert.equal(base.type,'number');assert.equal(base.writable,true);
 assert.equal(base.locator.document,target.document);assert.equal(base.locator.control,'number');
 assert.equal(typeof base.id,'string');assert(base.id.length>0);assert.equal(typeof base.locator.node,'string');assert(base.locator.node.length>0);
 const phases=[[r.baseline,0,0,false],[r.afterFirst,10,1,false],[r.afterSecond,20,2,false],[r.closed,20,2,true]];
 let previousEnd=-Infinity;
 for(const[p,value,count,closed]of phases){
  assert.equal(p.captureStatus,'Complete');
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
   assert.equal(row.externalRevision,true);const owned=s.history.at(-1).outcomes[0].after;
   assert.notEqual(resource.revision,owned.revision);assert.equal(resource.value,owned.value);
  }
 }
 assert.deepEqual(r.afterFirst.inputs.history,r.afterSecond.inputs.history.slice(0,1));
 assert.deepEqual(r.closed.inputs.history,r.afterSecond.inputs.history);assert.deepEqual(r.closed.inputs.resources,r.afterSecond.inputs.resources);
 const history=r.afterSecond.inputs.history;assert.notEqual(history[0].id,history[1].id);
 for(const[i,value]of[10,20].entries()){
  const tx=history[i];assert.equal(typeof tx.id,'string');assert(tx.id.length>0);assert.equal(tx.kind,'apply');assert.equal(tx.mode,'live');assert.equal(tx.phase,'applied');assert.equal(tx.atomic,false);assert.equal(tx.applicationRestored,false);
  assert.equal(tx.outcomes.length,1);const o=tx.outcomes[0];assert.equal(o.phase,'applied');assert.equal(o.resourceId,base.id);assert.equal(o.value,value);assert.equal(o.after.value,value);assert.deepEqual(identity(o.after),identity(base));
 }
 assert.deepEqual(r.edits.map(e=>e.value),[10,20]);assert(r.edits.every(e=>e.enter===false&&e.blur===false&&e.focused===true));
 for(const[w,final,initial,value,count]of [[r.firstWindow,r.afterFirst,r.baseline,10,1],[r.secondWindow,r.afterSecond,r.afterFirst,20,2]]){
  assert.equal(w.requestedMs,1200);assert(Number.isFinite(w.startedAt)&&w.startedAt>=initial.finishedAt);assert(Number.isFinite(w.finishedAt)&&w.finishedAt-w.startedAt>=1200&&w.finishedAt<=final.startedAt);
  assert(Array.isArray(w.samples)&&w.samples.length>=2&&w.samples.length<=64);let previous=w.startedAt;
  for(const sample of w.samples){
   assert.equal(sample.captureStatus,'Complete');
   assert(Number.isFinite(sample.startedAt)&&sample.startedAt>=previous&&Number.isFinite(sample.finishedAt)&&sample.finishedAt>=sample.startedAt&&sample.finishedAt<=w.finishedAt);previous=sample.finishedAt;
   assert.equal(sample.inputs.investigationId,baseline.investigationId);assert.equal(sample.inputs.history.length,count);assert.deepEqual(sample.inputs.history,final.inputs.history);
   for(const k of physical)assert.equal(sample.inputs.target[k],target[k]);
   const resource=currentResource(sample).resource;assert.deepEqual(identity(resource),identity(base));assert.equal(resource.value,value);assert.equal(sample.dom.minValue,String(value));
  }
 }
 return restoreAvailabilityPass;
}
export function finalizeRestoreAvailability(r){
 try{
  assert.equal(r.status,restoreAvailabilityPass);guardRestoreAvailability(r);
  for(const k of ['console','appConsole','errors'])assert.deepEqual(r[k],[]);
  assert.deepEqual(r.checks,checks.map(name=>({name,status:'PASS'})));
  for(const k of cleanup)assert.equal(r.cleanup[k],true);
  assert.equal(r.inputsUnchanged,true);assert(r.inputsBefore&&Object.keys(r.inputsBefore).length>0);assert.deepEqual(r.inputsAfter,r.inputsBefore);
  assert.deepEqual(r.views.map(v=>v.width),[1100,390]);for(const v of r.views){assert.equal(v.overflow,false);assert.equal(v.rootFont,'13px');}
  return r.status=restoreAvailabilityPass;
 }catch{return r.status=incomplete;}
}
