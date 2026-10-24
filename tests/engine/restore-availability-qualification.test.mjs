// SPDX-License-Identifier: Apache-2.0
// Synthetic result DTOs only; no native observation or manufactured run evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {guardRestoreAvailability,finalizeRestoreAvailability} from '../../experiments/restore-availability-qualification.mjs';

const PASS='PASS_RESTORE_AVAILABILITY_NOT_FULL_V03',INCOMPLETE='INCOMPLETE_RESTORE_AVAILABILITY';
function fixture(){
 const target={tabId:1,origin:'http://127.0.0.1:4173',run:'run',document:'doc',node:'selected',selector:'#minPrice',property:'disabled',build:null};
 const resource=(value,revision)=>({id:'min',kind:'dom-control',type:'number',writable:true,value,revision,locator:{document:'doc',node:'native-min',selector:'#minPrice',control:'number'}});
 const tx=(id,value,revision)=>({id,kind:'apply',mode:'live',phase:'applied',atomic:false,applicationRestored:false,outcomes:[{resourceId:'min',phase:'applied',value,after:resource(value,revision)}]});
 const history=[tx('p1',10,'owned:1'),tx('p2',20,'owned:2')];
 const panelURL='chrome-extension://'+'a'.repeat(32)+'/panel.html';
 const phase=(value,revision,count,start,closed=false)=>({captureStatus:'Complete',startedAt:start,finishedAt:start+1,inputs:{investigationId:'i',target:{...target},closed,tainted:false,pending:null,cleanup:closed?'closed':'active',resources:[{resource:resource(value,revision),externalRevision:count>0}],history:structuredClone(history.slice(0,count)),canUndo:false,canRestoreBaseline:false},selection:{domIdentity:{document:'doc',node:'selected',property:'disabled'}},dom:{ready:'complete',minValue:String(value),products:value===0?[1,2]:value===10?[1]:[],imagesReady:true,errorOverlay:false},field:{rowPresent:true,value:String(value),focused:!closed,disabled:closed,dirty:false,ariaInvalid:'false',rowErrorVisible:false,rowError:'',undo:{exists:true,visible:true,disabled:true},baseline:{exists:true,visible:true,disabled:true},document:{url:panelURL,title:'StateAtom',mainPresent:true,noOverlay:true}}});
 const baseline=phase(0,'initial',0,1),afterFirst=phase(10,'external:1',1,1300),afterSecond=phase(20,'external:2',2,2700),closed=phase(20,'external:2',2,2800,true);
 const window=(value,revision,count,start)=>({startedAt:start,finishedAt:start+1201,requestedMs:1200,samples:[phase(value,revision,count,start+1),phase(value,revision,count,start+1200)]});
 return {schema:'stateatom.restore-availability-native/1',status:PASS,diagnosticOnly:true,originalCriteriaWaived:false,originalGuide:'FAIL',fullV03:false,traceInstrumented:false,productionChanges:false,selectedControlMatchesOriginal:true,panelURL,baseline,afterFirst,afterSecond,closed,firstWindow:window(10,'external:1',1,10),secondWindow:window(20,'external:2',2,1400),edits:[10,20].map(value=>({value,enter:false,blur:false,focused:true})),views:[1100,390].map(width=>({width,overflow:false,rootFont:'13px'})),console:[],appConsole:[],errors:[],checks:['exact78-package-and-node-admission','original-picker-and-open','live10-and-disabled-restoration','live20-and-disabled-restoration','native-close-preserves-value','console-host-and-rendered-checks'].map(name=>({name,status:'PASS'})),cleanup:Object.fromEntries(['inspector','browser','vite','viteLogWrite','viteLogClose','api','desktop','pidsAbsent'].map(k=>[k,true])),inputsUnchanged:true,inputsBefore:{'/synthetic/source':'a'.repeat(64)},inputsAfter:{'/synthetic/source':'a'.repeat(64)}};
}
test('coherent synthetic behavior qualifies only the affected scope, without mutating it',()=>{const r=fixture(),before=JSON.stringify(r);assert.equal(guardRestoreAvailability(r),PASS);assert.equal(JSON.stringify(r),before);assert.equal(finalizeRestoreAvailability(r),PASS);assert.equal(r.fullV03,false);assert.equal(r.originalGuide,'FAIL');});
for(const[name,mutate]of[
 ['backend Undo enabled',r=>r.afterFirst.inputs.canUndo=true],
 ['backend baseline enabled',r=>r.afterSecond.inputs.canRestoreBaseline=true],
 ['UI Undo enabled',r=>r.afterFirst.field.undo.disabled=false],
 ['UI baseline missing',r=>r.afterSecond.field.baseline.exists=false],
 ['UI action hidden',r=>r.afterSecond.field.undo.visible=false],
 ['resource never changed from owned receipt',r=>r.afterFirst.inputs.resources[0].resource.revision='owned:1'],
 ['external flag absent',r=>r.afterSecond.inputs.resources[0].externalRevision=false],
 ['receipt scalar differs',r=>r.afterSecond.inputs.history[1].outcomes[0].after.value=30],
 ['receipt resource foreign',r=>r.afterSecond.inputs.history[1].outcomes[0].after.locator.node='foreign'],
 ['receipt not applied',r=>r.afterSecond.inputs.history[1].phase='failed'],
 ['receipt mode changed',r=>r.afterSecond.inputs.history[1].mode='draft'],
 ['first receipt changes later',r=>r.afterSecond.inputs.history[0].id='foreign'],
 ['foreign physical target',r=>r.afterSecond.inputs.target.node='foreign'],
 ['foreign investigation',r=>r.afterFirst.inputs.investigationId='foreign'],
 ['foreign selected occurrence',r=>r.afterSecond.selection.domIdentity.node='foreign'],
 ['foreign native resource',r=>r.afterFirst.inputs.resources[0].resource.locator.node='foreign'],
 ['app stays10',r=>r.afterSecond.dom.minValue='10'],
 ['products remain',r=>r.afterSecond.dom.products=[1]],
 ['local raw stale',r=>r.afterSecond.field.value='10'],
 ['local draft dirty',r=>r.afterFirst.field.dirty=true],
 ['field error visible',r=>r.afterSecond.field.rowErrorVisible=true],
 ['native Enter added',r=>r.edits[1].enter=true],
 ['native focus lost',r=>r.edits[0].focused=false],
 ['Close keeps owner active',r=>r.closed.inputs.cleanup='active'],
 ['Close drops history',r=>r.closed.inputs.history=[]],
 ['Close claims app restored',r=>r.closed.dom.minValue='0'],
 ['Close field writable',r=>r.closed.field.disabled=false],
 ['missing observation window',r=>r.firstWindow.samples=[]],
 ['short observation window',r=>r.secondWindow.finishedAt=r.secondWindow.startedAt+1199],
 ['window has another write',r=>r.firstWindow.samples[0].inputs.history.push(r.afterSecond.inputs.history[1])],
 ['partial final capture',r=>r.afterSecond.captureStatus='Partial'],
 ['partial window capture',r=>r.firstWindow.samples[0].captureStatus='Partial'],
 ['wrong extension document',r=>r.afterSecond.field.document.url='https://foreign.invalid'],
 ['blank panel',r=>r.afterFirst.field.document.mainPresent=false],
 ['framework overlay',r=>r.afterSecond.dom.errorOverlay=true],
 ['guide upgraded',r=>r.originalGuide='PASS'],
 ['wholeV03 upgraded',r=>r.fullV03=true],
 ['trace instrumented',r=>r.traceInstrumented=true],
 ['production changed',r=>r.productionChanges=true]
])test('reject '+name+' without claiming native acceptance',()=>{const r=fixture();mutate(r);
 // Receipt semantics must not be rejected merely because retained copies differ.
 if(['receipt scalar differs','receipt resource foreign','receipt not applied','receipt mode changed'].includes(name)){
  r.closed.inputs.history=structuredClone(r.afterSecond.inputs.history);
  for(const sample of r.secondWindow.samples)sample.inputs.history=structuredClone(r.afterSecond.inputs.history);
 }
 const expected=name==='receipt mode changed'?{code:'ERR_ASSERTION',actual:'draft',expected:'live'}:name==='receipt not applied'?{code:'ERR_ASSERTION',actual:'failed',expected:'applied'}:undefined;
 assert.throws(()=>guardRestoreAvailability(r),expected);assert.equal(finalizeRestoreAvailability(r),INCOMPLETE);assert.equal(r.status,INCOMPLETE);});
for(const[name,mutate]of[
 ['late console',r=>r.console.push('late error')],
 ['late app console',r=>r.appConsole.push('late error')],
 ['late error',r=>r.errors.push('late capture error')],
 ['cleanup unknown',r=>r.cleanup.browser='unknown'],
 ['cleanup missing',r=>delete r.cleanup.api],
 ['PID remains',r=>r.cleanup.pidsAbsent=false],
 ['input drift',r=>r.inputsAfter['/synthetic/source']='b'.repeat(64)],
 ['input map missing',r=>r.inputsAfter={}],
 ['unchanged flag absent',r=>r.inputsUnchanged=false],
 ['missing named gate',r=>r.checks.pop()],
 ['failed gate',r=>r.checks[2].status='FAIL'],
 ['blanket initial status',r=>r.status='RUNNING'],
 ['narrow overflow',r=>r.views[1].overflow=true],
 ['missing narrow view',r=>r.views.pop()]
])test('finalization refuses '+name+' after valid behavior facts',()=>{const r=fixture();mutate(r);assert.equal(guardRestoreAvailability(r),PASS);assert.equal(finalizeRestoreAvailability(r),INCOMPLETE);});
