// SPDX-License-Identifier: Apache-2.0
// Synthetic protocol DTOs only, never native evidence.
import test from 'node:test';import assert from 'node:assert/strict';
import {restoreAvailabilityResultFixture} from '../helpers/restore-availability-result-fixture.mjs';
import {guardConvergedRestoreAvailability,finalizeConvergedRestoreAvailability,guardExternalRestoreAvailability,guardRestoreAvailability} from '../../experiments/restore-availability-qualification.mjs';
const PASS='PASS_CONVERGED_EXTERNAL_RESTORE_AVAILABILITY_NOT_FULL_V03',INCOMPLETE='INCOMPLETE_CONVERGED_RESTORE_AVAILABILITY';
function externalFixture(){
 const r=restoreAvailabilityResultFixture();r.schema='stateatom.external-restore-availability-native/1';r.status=PASS;r.protocolMode='external-aba';r.checks[2].name='live10-external-aba-read-and-disabled-restoration';r.checks[3].name='live20-external-aba-read-and-disabled-restoration';
 r.firstWindow.startedAt+=10;r.firstWindow.finishedAt+=10;for(const p of r.firstWindow.samples){p.startedAt+=10;p.finishedAt+=10;}
 r.externalInteractions=[10,20].map((value,index)=>{
  const final=index?r.afterSecond:r.afterFirst,start=index?1302:3,before=structuredClone(final),after=structuredClone(final);before.startedAt=start+1;before.finishedAt=start+2;before.inputs.resources[0].resource=structuredClone(final.inputs.history[index].outcomes[0].after);before.inputs.resources[0].externalRevision=false;before.inputs.canUndo=true;before.inputs.canRestoreBaseline=true;before.field.undo.disabled=false;before.field.baseline.disabled=false;after.startedAt=start+9;after.finishedAt=start+10;
  return {captureStatus:'Complete',ownValue:value,startedAt:start,finishedAt:start+11,before,appEdits:[value+1,value].map((v,i)=>({captureStatus:'Complete',value:v,method:'CDP.Input.insertText',startedAt:start+3+i*2,finishedAt:start+4+i*2,dom:{ready:'complete',minValue:String(v),minFocused:true,products:index?[]:[1],imagesReady:true,errorOverlay:false},snapshot:{...structuredClone(before),startedAt:start+3+i*2,finishedAt:start+4+i*2,dom:{ready:'complete',minValue:String(v),minFocused:true,products:index?[]:[1],imagesReady:true,errorOverlay:false}}})),read:{captureStatus:'Complete',method:'native-input-ui-button',control:'input-read',directInputReadRPC:false,startedAt:start+7,finishedAt:start+8},after};
 });return r;
}

function fixture(){
 const r=externalFixture();r.schema='stateatom.converged-restore-availability-native/1';r.protocolMode='converged-external-aba';r.status=PASS;
 for(const [key,start]of [['afterFirst',1800],['afterSecond',4000],['closed',4100]])Object.assign(r[key],{startedAt:start,finishedAt:start+1});
 for(const [key,start]of [['firstWindow',500],['secondWindow',2500]]){const w=r[key];w.startedAt=start;w.finishedAt=start+1201;for(const [i,p]of w.samples.entries())Object.assign(p,{startedAt:start+1+i*1199,finishedAt:start+2+i*1199});}
 r.appConsoleCollection.stoppedAt=4200;
 for(const [n,x]of r.externalInteractions.entries()){
  const start=n?1802:3;x.startedAt=start;Object.assign(x.before,{startedAt:start+1,finishedAt:start+2});let next=start+3;
  for(const e of x.appEdits){
   e.startedAt=next;e.immediateObservedAt=next+1;e.immediateDom=structuredClone(e.dom);
   const samples=Array.from({length:3},(_,i)=>({...structuredClone(e.snapshot),startedAt:next+2+i*100,finishedAt:next+3+i*100}));
   e.convergence={captureStatus:'Complete',startedAt:next+2,finishedAt:next+203,sampleIntervalMs:100,consecutiveMatches:3,maxSamples:50,maxElapsedMs:5000,samples};e.snapshot=structuredClone(samples.at(-1));e.dom=structuredClone(e.snapshot.dom);e.finishedAt=next+203;next=e.finishedAt+1;
  }
  Object.assign(x.read,{startedAt:next,finishedAt:next+1});Object.assign(x.after,{startedAt:next+2,finishedAt:next+3});x.finishedAt=next+4;
 }
 r.checks[2].name='live10-converged-external-aba-read-and-disabled-restoration';r.checks[3].name='live20-converged-external-aba-read-and-disabled-restoration';return r;
}
test('new converged protocol qualifies only its own complete bounded observations and retains prior guards',()=>{const r=fixture();assert.equal(guardConvergedRestoreAvailability(r),PASS);assert.equal(finalizeConvergedRestoreAvailability(r),PASS);assert.throws(()=>guardExternalRestoreAvailability(r));assert.throws(()=>guardRestoreAvailability(r));assert.equal(r.fullV03,false);assert.equal(r.originalGuide,'FAIL');});
for(const[name,mutate]of[
 ['old schema',r=>r.schema='stateatom.external-restore-availability-native/1'],
 ['old mode',r=>r.protocolMode='external-aba'],
 ['missing immediate DOM',r=>delete r.externalInteractions[0].appEdits[0].immediateDom],
 ['wrong immediate value',r=>r.externalInteractions[0].appEdits[0].immediateDom.minValue='9'],
 ['lost immediate focus',r=>r.externalInteractions[0].appEdits[0].immediateDom.minFocused=false],
 ['missing acquired time',r=>delete r.externalInteractions[0].appEdits[0].immediateObservedAt],
 ['acquired after convergence',r=>r.externalInteractions[0].appEdits[0].immediateObservedAt=400],
 ['missing convergence',r=>delete r.externalInteractions[0].appEdits[0].convergence],
 ['partial convergence',r=>r.externalInteractions[0].appEdits[0].convergence.captureStatus='Partial'],
 ['changed sample interval',r=>r.externalInteractions[0].appEdits[0].convergence.sampleIntervalMs=0],
 ['changed streak',r=>r.externalInteractions[0].appEdits[0].convergence.consecutiveMatches=1],
 ['changed cap',r=>r.externalInteractions[0].appEdits[0].convergence.maxSamples=500],
 ['changed deadline',r=>r.externalInteractions[0].appEdits[0].convergence.maxElapsedMs=10000],
 ['too few observations',r=>r.externalInteractions[0].appEdits[0].convergence.samples.pop()],
 ['excess observations',r=>r.externalInteractions[0].appEdits[0].convergence.samples=Array(51).fill(r.externalInteractions[0].appEdits[0].snapshot)],
 ['partial observation',r=>r.externalInteractions[0].appEdits[0].convergence.samples[0].captureStatus='Partial'],
 ['foreign intermediate investigation',r=>r.externalInteractions[0].appEdits[0].convergence.samples[1].inputs.investigationId='foreign'],
 ['foreign intermediate target',r=>r.externalInteractions[0].appEdits[0].convergence.samples[1].inputs.target.node='foreign'],
 ['changed intermediate history',r=>r.externalInteractions[0].appEdits[0].convergence.samples[1].inputs.history=[]],
 ['wrong intermediate app value',r=>r.externalInteractions[0].appEdits[0].convergence.samples[1].dom.minValue='99'],
 ['lost intermediate focus',r=>r.externalInteractions[0].appEdits[0].convergence.samples[1].dom.minFocused=false],
 ['dirty intermediate editor',r=>r.externalInteractions[0].appEdits[0].convergence.samples[1].field.dirty=true],
 ['overlapping observation times',r=>r.externalInteractions[0].appEdits[0].convergence.samples[1].startedAt=1],
 ['unspaced observations',r=>{const p=r.externalInteractions[0].appEdits[0].convergence.samples[1];p.startedAt=9;p.finishedAt=10;}],
 ['last streak incomplete',r=>r.externalInteractions[0].appEdits[0].convergence.samples[1].dom.products=[]],
 ['deadline exceeded',r=>r.externalInteractions[0].appEdits[0].convergence.finishedAt=6000],
 ['detached final DOM',r=>r.externalInteractions[0].appEdits[0].dom.products=[]],
 ['detached final snapshot',r=>r.externalInteractions[0].appEdits[0].snapshot.inputs.revision=999],
 ['unchanged strict window guard',r=>r.secondWindow.samples[0].dom.products=[1]],
 ['unchanged restoration guard',r=>r.closed.field.undo.disabled=false],
 ['unsafe old guide upgrade',r=>r.originalGuide='PASS']
])test('converged guard rejects '+name,()=>{const r=fixture();mutate(r);assert.throws(()=>guardConvergedRestoreAvailability(r));assert.equal(finalizeConvergedRestoreAvailability(r),INCOMPLETE);});
test('earlier pending product observation is retained and cannot count toward a broken streak',()=>{const r=fixture(),e=r.externalInteractions[0].appEdits[0],g=e.convergence,p=structuredClone(g.samples[0]);p.dom.products=[];for(const q of g.samples){q.startedAt+=100;q.finishedAt+=100;}g.finishedAt+=100;e.finishedAt+=100;e.snapshot=structuredClone(g.samples.at(-1));const second=r.externalInteractions[0].appEdits[1];second.startedAt+=100;second.finishedAt+=100;second.immediateObservedAt+=100;second.convergence.startedAt+=100;second.convergence.finishedAt+=100;for(const q of second.convergence.samples){q.startedAt+=100;q.finishedAt+=100;}second.snapshot=structuredClone(second.convergence.samples.at(-1));r.externalInteractions[0].read.startedAt+=100;r.externalInteractions[0].read.finishedAt+=100;r.externalInteractions[0].after.startedAt+=100;r.externalInteractions[0].after.finishedAt+=100;r.externalInteractions[0].finishedAt+=100;r.firstWindow.startedAt+=100;r.firstWindow.finishedAt+=100;for(const q of r.firstWindow.samples){q.startedAt+=100;q.finishedAt+=100;}g.samples.unshift(p);r.afterFirst.startedAt+=100;r.afterFirst.finishedAt+=100;const shift=o=>{if(o&&typeof o==='object')for(const[k,v]of Object.entries(o)){if(['startedAt','finishedAt','immediateObservedAt'].includes(k))o[k]+=100;else shift(v);}};shift(r.externalInteractions[1]);assert.equal(guardConvergedRestoreAvailability(r),PASS);assert.deepEqual(g.samples[0].dom.products,[]);});
test('converged finalizer preserves stopped console, host checks, cleanup and input integrity',()=>{for(const change of [r=>r.appConsoleCollection.status='Active',r=>r.cleanup.browser=false,r=>r.inputsUnchanged=false,r=>r.appConsole.push('late'),r=>r.checks.pop()]){const r=fixture();change(r);assert.equal(guardConvergedRestoreAvailability(r),PASS);assert.equal(finalizeConvergedRestoreAvailability(r),INCOMPLETE);}});
