// SPDX-License-Identifier: Apache-2.0
// Synthetic new-protocol DTOs; old native result remains exhausted/INCOMPLETE.
import test from 'node:test';import assert from 'node:assert/strict';
import {restoreAvailabilityResultFixture} from '../helpers/restore-availability-result-fixture.mjs';
import {guardExternalRestoreAvailability,finalizeExternalRestoreAvailability,guardRestoreAvailability} from '../../experiments/restore-availability-qualification.mjs';
const PASS='PASS_EXPLICIT_EXTERNAL_RESTORE_AVAILABILITY_NOT_FULL_V03',INCOMPLETE='INCOMPLETE_EXTERNAL_RESTORE_AVAILABILITY';
function fixture(){
 const r=restoreAvailabilityResultFixture();r.schema='stateatom.external-restore-availability-native/1';r.status=PASS;r.protocolMode='external-aba';r.checks[2].name='live10-external-aba-read-and-disabled-restoration';r.checks[3].name='live20-external-aba-read-and-disabled-restoration';
 r.firstWindow.startedAt+=10;r.firstWindow.finishedAt+=10;for(const p of r.firstWindow.samples){p.startedAt+=10;p.finishedAt+=10;}
 r.externalInteractions=[10,20].map((value,index)=>{
  const final=index?r.afterSecond:r.afterFirst,start=index?1302:3,before=structuredClone(final),after=structuredClone(final);before.startedAt=start+1;before.finishedAt=start+2;before.inputs.resources[0].resource=structuredClone(final.inputs.history[index].outcomes[0].after);before.inputs.resources[0].externalRevision=false;before.inputs.canUndo=true;before.inputs.canRestoreBaseline=true;before.field.undo.disabled=false;before.field.baseline.disabled=false;after.startedAt=start+9;after.finishedAt=start+10;
  return {captureStatus:'Complete',ownValue:value,startedAt:start,finishedAt:start+11,before,appEdits:[value+1,value].map((v,i)=>({captureStatus:'Complete',value:v,method:'CDP.Input.insertText',startedAt:start+3+i*2,finishedAt:start+4+i*2,dom:{ready:'complete',minValue:String(v),minFocused:true,products:index?[]:[1],imagesReady:true,errorOverlay:false},snapshot:{...structuredClone(before),startedAt:start+3+i*2,finishedAt:start+4+i*2,dom:{ready:'complete',minValue:String(v),minFocused:true,products:index?[]:[1],imagesReady:true,errorOverlay:false}}})),read:{captureStatus:'Complete',method:'native-input-ui-button',control:'input-read',directInputReadRPC:false,startedAt:start+7,finishedAt:start+8},after};
 });return r;
}
test('new protocol requires its own actual external observations and cannot be judged as the passive case',()=>{const r=fixture(),before=JSON.stringify(r);assert.equal(guardExternalRestoreAvailability(r),PASS);assert.equal(finalizeExternalRestoreAvailability(r),PASS);assert.equal(JSON.stringify(r),before);assert.throws(()=>guardRestoreAvailability(r));assert.equal(r.fullV03,false);assert.equal(r.originalGuide,'FAIL');});
for(const[name,mutate]of[
 ['missing per-edit snapshot',r=>delete r.externalInteractions[0].appEdits[0].snapshot],
 ['partial per-edit snapshot',r=>r.externalInteractions[0].appEdits[0].snapshot.captureStatus='Partial'],
 ['foreign per-edit investigation',r=>r.externalInteractions[0].appEdits[0].snapshot.inputs.investigationId='foreign'],
 ['foreign per-edit target',r=>r.externalInteractions[0].appEdits[0].snapshot.inputs.target.node='foreign'],
 ['foreign per-edit selected occurrence',r=>r.externalInteractions[0].appEdits[0].snapshot.selection.domIdentity.node='foreign'],
 ['foreign per-edit resource',r=>r.externalInteractions[0].appEdits[0].snapshot.inputs.resources[0].resource.id='foreign'],
 ['missing per-edit revision',r=>delete r.externalInteractions[0].appEdits[0].snapshot.inputs.resources[0].resource.revision],
 ['changed per-edit history',r=>r.externalInteractions[0].appEdits[0].snapshot.inputs.history=[]],
 ['closed per-edit investigation',r=>r.externalInteractions[0].appEdits[0].snapshot.inputs.closed=true],
 ['pending per-edit investigation',r=>r.externalInteractions[0].appEdits[0].snapshot.inputs.pending={}],
 ['tainted per-edit investigation',r=>r.externalInteractions[0].appEdits[0].snapshot.inputs.tainted=true],
 ['dirty per-edit field',r=>r.externalInteractions[0].appEdits[0].snapshot.field.dirty=true],
 ['per-edit snapshot before stimulus',r=>r.externalInteractions[0].appEdits[0].snapshot.startedAt=0],
 ['per-edit snapshot after recorded step',r=>r.externalInteractions[0].appEdits[0].snapshot.finishedAt=100],
 ['per-edit changed DOM value',r=>r.externalInteractions[0].appEdits[0].snapshot.dom.minValue='12'],
 ['per-edit lost app focus',r=>r.externalInteractions[0].appEdits[0].snapshot.dom.minFocused=false],
 ['passive schema',r=>r.schema='stateatom.restore-availability-native/1'],
 ['passive mode',r=>r.protocolMode='passive'],
 ['missing interaction',r=>r.externalInteractions.pop()],
 ['partial interaction',r=>r.externalInteractions[0].captureStatus='Partial'],
 ['wrong intended ABA',r=>r.externalInteractions[0].appEdits[0].value=12],
 ['actual ABA not observed',r=>r.externalInteractions[0].appEdits[0].dom.minValue='10'],
 ['app focus absent',r=>r.externalInteractions[0].appEdits[0].dom.minFocused=false],
 ['synthetic setter',r=>r.externalInteractions[0].appEdits[0].method='MAIN.value='],
 ['partial app edit',r=>r.externalInteractions[1].appEdits[1].captureStatus='Partial'],
 ['reversed app steps',r=>r.externalInteractions[0].appEdits.reverse()],
 ['no explicit UI read',r=>delete r.externalInteractions[0].read],
 ['direct backend read',r=>r.externalInteractions[0].read.directInputReadRPC=true],
 ['wrong UI read',r=>r.externalInteractions[0].read.control='input-open'],
 ['read before app edits',r=>r.externalInteractions[0].read.startedAt=1],
 ['partial read',r=>r.externalInteractions[0].read.captureStatus='Partial'],
 ['no new observed revision',r=>r.externalInteractions[0].after.inputs.resources[0].resource.revision=r.externalInteractions[0].before.inputs.resources[0].resource.revision],
 ['foreign investigation',r=>r.externalInteractions[0].after.inputs.investigationId='foreign'],
 ['foreign target',r=>r.externalInteractions[1].before.inputs.target.node='foreign'],
 ['missing resource revision',r=>delete r.externalInteractions[0].before.inputs.resources[0].resource.revision],
 ['new inspector transaction',r=>r.externalInteractions[0].after.inputs.history.push(r.afterSecond.inputs.history[1])],
 ['after read field dirty',r=>r.externalInteractions[0].after.field.dirty=true],
 ['after read action enabled',r=>r.externalInteractions[1].after.field.undo.disabled=false],
 ['window before observation',r=>r.externalInteractions[0].finishedAt=r.firstWindow.startedAt+1],
 ['old window safety bypass',r=>r.firstWindow.samples[0].field.undo.disabled=false],
 ['old Close safety bypass',r=>r.closed.inputs.cleanup='active'],
 ['guide upgrade',r=>r.originalGuide='PASS']
])test('new external guard refuses '+name,()=>{const r=fixture();mutate(r);assert.throws(()=>guardExternalRestoreAvailability(r));assert.equal(finalizeExternalRestoreAvailability(r),INCOMPLETE);assert.equal(r.status,INCOMPLETE);});
test('new finalizer retains common stopped-console and cleanup gates',()=>{for(const mutate of[r=>r.appConsoleCollection.status='Active',r=>r.cleanup.browser=false,r=>r.inputsUnchanged=false,r=>r.appConsole.push('late error'),r=>r.views[1].overflow=true]){const r=fixture();mutate(r);assert.equal(guardExternalRestoreAvailability(r),PASS);assert.equal(finalizeExternalRestoreAvailability(r),INCOMPLETE);}});
