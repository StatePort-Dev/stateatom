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
 return {schema:'stateatom.restore-availability-native/1',status:PASS,diagnosticOnly:true,originalCriteriaWaived:false,originalGuide:'FAIL',fullV03:false,traceInstrumented:false,productionChanges:false,selectedControlMatchesOriginal:true,tabId:1,panelURL,baseline,afterFirst,afterSecond,closed,firstWindow:window(10,'external:1',1,10),secondWindow:window(20,'external:2',2,1400),edits:[10,20].map(value=>({value,enter:false,blur:false,focused:true})),views:[1100,390].map(width=>({width,overflow:false,rootFont:'13px'})),console:[],appConsole:[],appConsoleCollection:{schema:'stateatom.restore-app-console/1',status:'Stopped',tabId:1,seen:0,records:[],overflow:false,startedAt:1,stoppedAt:3000},errors:[],checks:['exact78-package-and-node-admission','original-picker-and-open','live10-and-disabled-restoration','live20-and-disabled-restoration','native-close-preserves-value','console-host-and-rendered-checks'].map(name=>({name,status:'PASS'})),cleanup:Object.fromEntries(['appConsole','inspector','browser','vite','viteLogWrite','viteLogClose','api','desktop','pidsAbsent'].map(k=>[k,true])),inputsUnchanged:true,inputsBefore:{'/synthetic/source':'a'.repeat(64)},inputsAfter:{'/synthetic/source':'a'.repeat(64)}};
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

for(const[name,mutate]of[
 ['enabled Undo',p=>p.field.undo.disabled=false],
 ['missing baseline',p=>p.field.baseline.exists=false],
 ['hidden Undo',p=>p.field.undo.visible=false],
 ['stale dirty field',p=>{p.field.value='0';p.field.dirty=true;}],
 ['stale clean field',p=>p.field.value='0'],
 ['tainted owner',p=>p.inputs.tainted=true],
 ['closed owner',p=>p.inputs.closed=true],
 ['pending batch',p=>p.inputs.pending={kind:'apply',remaining:1}],
 ['backend Undo available',p=>p.inputs.canUndo=true],
 ['backend baseline available',p=>p.inputs.canRestoreBaseline=true],
 ['foreign selection',p=>p.selection.domIdentity.node='foreign'],
 ['foreign document',p=>p.field.document.url='https://foreign.invalid'],
 ['no external observation',p=>p.inputs.resources[0].externalRevision=false],
 ['missing observed revision',p=>delete p.inputs.resources[0].resource.revision]
])test('review I1/I2: window '+name+' cannot be hidden by valid final snapshots',()=>{const r=fixture();mutate(r.firstWindow.samples[0]);assert.throws(()=>guardRestoreAvailability(r));assert.equal(finalizeRestoreAvailability(r),INCOMPLETE);});
const allSnapshots=r=>[r.baseline,r.afterFirst,r.afterSecond,r.closed,...r.firstWindow.samples,...r.secondWindow.samples];
for(const name of ['investigation','run','node','tab','build'])test('review I2: synchronized absent '+name+' is not a matching identity',()=>{const r=fixture();for(const p of allSnapshots(r)){
 if(name==='investigation')delete p.inputs.investigationId;
 if(name==='run')delete p.inputs.target.run;
 if(name==='node'){delete p.inputs.target.node;delete p.selection.domIdentity.node;}
 if(name==='tab')delete p.inputs.target.tabId;
 if(name==='build')delete p.inputs.target.build;
}assert.throws(()=>guardRestoreAvailability(r));assert.equal(finalizeRestoreAvailability(r),INCOMPLETE);});
for(const value of [undefined,null,false,''])test('review I2: absent or invalid current revision '+String(value)+' is not external evidence',()=>{const r=fixture();if(value===undefined)delete r.afterFirst.inputs.resources[0].resource.revision;else r.afterFirst.inputs.resources[0].resource.revision=value;assert.throws(()=>guardRestoreAvailability(r));assert.equal(finalizeRestoreAvailability(r),INCOMPLETE);});
test('review I2: coherently missing owned receipt revision cannot establish a difference',()=>{const r=fixture();delete r.afterSecond.inputs.history[1].outcomes[0].after.revision;r.closed.inputs.history=structuredClone(r.afterSecond.inputs.history);for(const p of r.secondWindow.samples)p.inputs.history=structuredClone(r.afterSecond.inputs.history);assert.throws(()=>guardRestoreAvailability(r));assert.equal(finalizeRestoreAvailability(r),INCOMPLETE);});
for(const[name,mutate]of[
 ['not collected',r=>r.appConsoleCollection={status:'NotStarted'}],
 ['unknown collection',r=>r.appConsoleCollection={status:'Unknown/Unsupported'}],
 ['active collector',r=>r.appConsoleCollection.status='Active'],
 ['overflow',r=>r.appConsoleCollection.overflow=true],
 ['unjoined records',r=>{r.appConsoleCollection.records=[{method:'Runtime.exceptionThrown'}];r.appConsoleCollection.seen=1;}],
 ['foreign app',r=>r.appConsoleCollection.tabId=2]
])test('review I3: finalization requires a complete stopped app-console collection: '+name,()=>{const r=fixture();mutate(r);assert.equal(guardRestoreAvailability(r),PASS);assert.equal(finalizeRestoreAvailability(r),INCOMPLETE);});
