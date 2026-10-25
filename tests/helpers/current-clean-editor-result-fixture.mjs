// SPDX-License-Identifier: Apache-2.0
// Owned DTOs only, no application/native execution.
import{restoreAvailabilityResultFixture}from'./restore-availability-result-fixture.mjs';
const PASS='PASS_CURRENT_CLEAN_EDITOR_CONTRACT_NOT_FULL_V03';
function externalFixture(){
 const r=restoreAvailabilityResultFixture();r.schema='stateatom.external-restore-availability-native/1';r.status=PASS;r.protocolMode='external-aba';r.checks[2].name='live10-external-aba-read-and-disabled-restoration';r.checks[3].name='live20-external-aba-read-and-disabled-restoration';
 r.firstWindow.startedAt+=10;r.firstWindow.finishedAt+=10;for(const p of r.firstWindow.samples){p.startedAt+=10;p.finishedAt+=10;}
 r.externalInteractions=[10,20].map((value,index)=>{
  const final=index?r.afterSecond:r.afterFirst,start=index?1302:3,before=structuredClone(final),after=structuredClone(final);before.startedAt=start+1;before.finishedAt=start+2;before.inputs.resources[0].resource=structuredClone(final.inputs.history[index].outcomes[0].after);before.inputs.resources[0].externalRevision=false;before.inputs.canUndo=true;before.inputs.canRestoreBaseline=true;before.field.undo.disabled=false;before.field.baseline.disabled=false;after.startedAt=start+9;after.finishedAt=start+10;
  return {captureStatus:'Complete',ownValue:value,startedAt:start,finishedAt:start+11,before,appEdits:[value+1,value].map((v,i)=>({captureStatus:'Complete',value:v,method:'CDP.Input.insertText',startedAt:start+3+i*2,finishedAt:start+4+i*2,dom:{ready:'complete',minValue:String(v),minFocused:true,products:index?[]:[1],imagesReady:true,errorOverlay:false},snapshot:{...structuredClone(before),startedAt:start+3+i*2,finishedAt:start+4+i*2,dom:{ready:'complete',minValue:String(v),minFocused:true,products:index?[]:[1],imagesReady:true,errorOverlay:false}}})),read:{captureStatus:'Complete',method:'native-input-ui-button',control:'input-read',directInputReadRPC:false,startedAt:start+7,finishedAt:start+8},after};
 });return r;
}

function originalConvergedFixture(){
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

export function currentCleanEditorResultFixture(){
 const r=originalConvergedFixture();r.schema='stateatom.current-clean-editor-native/1';r.protocolMode='current-clean-external-aba';r.status=PASS;
 r.checks[0].name='exact80-package-and-node-admission';r.checks[2].name='live10-current-clean-external-aba-read-and-disabled-restoration';r.checks[3].name='live20-current-clean-external-aba-read-and-disabled-restoration';
 for(const x of r.externalInteractions)for(const [step,e]of x.appEdits.entries()){
  for(const p of e.convergence.samples){const row=p.inputs.resources[0];row.resource.value=e.value;row.resource.revision=100+x.ownValue+step;row.externalRevision=true;p.inputs.canUndo=false;p.inputs.canRestoreBaseline=false;p.field.value=String(e.value);p.field.undo.disabled=true;p.field.baseline.disabled=true;}
  e.snapshot=structuredClone(e.convergence.samples.at(-1));e.dom=structuredClone(e.snapshot.dom);
 }
 return r;
}
