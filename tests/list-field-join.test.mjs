// SPDX-License-Identifier: Apache-2.0
// Authored occurrence DTOs with actual compiler sites: protocol controls, not
// acquired React/browser evidence or owned effect/native capabilities.
import test from 'node:test';import assert from 'node:assert/strict';
import {buildListFieldCompilation} from '../src/engine/list-field-compilation.mjs';
const load=()=>import('../src/engine/list-field-join.mjs');let compiled;
async function input(){
 compiled??=buildListFieldCompilation({appRoot:'.runtime/todomvc/examples/react',entry:'src/index.js',root:{file:'src/todo/app.jsx',export:'App'},field:'title',sources:['src/todo/app.jsx','src/todo/reducer.js','src/todo/components/main.jsx','src/todo/components/item.jsx','src/todo/components/footer.jsx']});
 const {manifest}=await compiled,p=manifest.program,writer=p.modules.find(m=>m.writer),w=writer.writer.sites[0],reader=p.modules.find(m=>m.fieldRead).fieldRead,middle=p.modules.find(m=>m.transfer?.outputs.some(o=>o.callback)),top=p.modules.find(m=>m.transfer?.inputs[0].kind==='state-binding'),out=middle.transfer.outputs[0],up=top.transfer.outputs.find(o=>o.prop===middle.transfer.inputs[0].prop),row=writer.dataSites.find(s=>s.kind==='row-literal'&&s.start===w.objectStart),state=writer.dataSites.find(s=>s.method==='concat'),map=middle.dataSites.find(s=>s.method==='map'),filter=middle.dataSites.find(s=>s.method==='filter');
 const page='list-'+p.digest+':123e4567-e89b-42d3-a456-426614174000',id=s=>page+':'+s,commitId=id('commit'),rootId=id('root'),nodeId=id('node'),rowId=id('row'),resultId=id('state'),revisionId=id('revision'),dataRow=id('data:row'),dataState=id('data:state'),filtered=id('filtered');
 const receipt=extra=>({schema:'stateatom.list-data-receipt/1',page,status:'Observed',fullPath:false,...extra});
 const joined={schema:'stateatom.selected-field-write-read/1',page,status:'Observed',read:{field:p.field,parameterProp:reader.parameterProp,siteId:reader.read.id,componentSiteId:reader.id,hostSiteId:reader.hosts[0].id,invocationId:id('read'),rowId},write:{field:p.field,siteId:w.id,callId:id('write'),revisionId,rowId},native:{selected:{nodeId,rootId,commitId,fiberId:id('reader'),hostPropsId:id('host-props')},ancestor:{nodeId,rootId,commitId,fiberId:id('root-owner'),revisionId,resultId,updateId:id('update'),queueId:id('queue')}}};
 const transfers=[{siteId:out.id,prop:out.prop,valueId:rowId,invocationId:id('middle-call'),producerFiberId:id('middle'),input:{siteId:middle.transfer.inputs[0].id,kind:'parameter',prop:middle.transfer.inputs[0].prop,valueId:resultId},callback:{siteId:out.callback.id,method:'map',rowId,collectionId:filtered}},{siteId:up.id,prop:up.prop,valueId:resultId,invocationId:id('root-call'),producerFiberId:id('root-owner'),input:{siteId:top.transfer.inputs[0].id,kind:'state-binding',prop:null,valueId:resultId},callback:null}];
 const facts={schema:'stateatom.selected-list-observation/1',page,property:'text',status:'Recorded',fullPath:false,selected:{schema:'stateatom.selected-list-data/1',page,status:'Observed',selected:{schema:'stateatom.selected-list-transfers/1',page,status:'Observed',transfers,selected:joined},data:{row:receipt({rowId:dataRow,siteId:row.id,fields:row.properties.filter(p=>p.kind==='field').map(p=>p.key)}),state:receipt({arrayId:dataState,rowId:dataRow,siteId:state.id,method:'concat'}),callback:receipt({arrayId:id('data:filtered'),rowId:dataRow,sourceId:dataState,filterSiteId:filter.id,mapSiteId:map.id,mapCallId:id('map-call')})}},commit:{schema:'stateatom.native-commit/1',page,status:'Observed',commitId,rootId},environment:{schema:'stateatom.native-list-environment/1',page,status:'Observed',originalChecksUndefined:true,checks:4},dom:{schema:'stateatom.list-dom-history/1',status:'Observed',commitId,commitMutationSequence:3,selectedMutationSequence:2}};
 return{manifest,trace:{schema:1,page,status:'Unknown/Unsupported',listFieldObservations:facts},selection:{page,frame:0,property:'text',value:'display text is not a resolver key',observedAt:Date.now(),domIdentity:{document:'cdp:1',node:'cdp:2',property:'text',value:'display text is not a resolver key'}}};
}
test('exact conditional list facts map to readable original source steps without acquiring full-path authority',async()=>{const i=await input(),r=(await load()).joinListFieldObservations(i);assert.equal(r.status,'Conditional selected list join');assert.equal(r.fullPath,false);assert.equal(r.fieldOwnership,'Unknown/Unsupported');assert.equal(r.field,'title');assert.deepEqual(r.chain.map(s=>s.kind),['write','state-binding','prop','parameter','filter','map','prop','read','host']);assert(r.chain.some(s=>s.kind==='write'&&s.source.file.endsWith('/src/todo/reducer.js')));assert(r.chain.some(s=>s.kind==='read'&&s.source.file.endsWith('/src/todo/components/item.jsx')));assert(r.chain.every(s=>s.source.line>0&&s.source.column>0));assert.equal(r.joins.commitId,i.trace.listFieldObservations.commit.commitId);assert.notEqual(r.joins.row.nativeId,r.joins.row.dataId);});
for(const [name,mutate]of[
 ['wrong page',i=>i.selection.page+='other'],['wrong write row',i=>i.trace.listFieldObservations.selected.selected.selected.write.rowId+='other'],
 ['wrong revision',i=>i.trace.listFieldObservations.selected.selected.selected.native.ancestor.revisionId+='old'],
 ['unrelated source site',i=>i.trace.listFieldObservations.selected.selected.selected.write.siteId='0'.repeat(64)],
 ['unknown environment',i=>i.trace.listFieldObservations.environment.status='Unknown/Unsupported'],
 ['post-commit text change',i=>i.trace.listFieldObservations.dom.selectedMutationSequence=4],
 ['wrong data row',i=>i.trace.listFieldObservations.selected.data.state.rowId+='other'],
 ['wrong prop input',i=>i.trace.listFieldObservations.selected.selected.transfers[0].input.valueId+='other'],
 ['missing filter',i=>i.trace.listFieldObservations.selected.data.callback.filterSiteId='0'.repeat(64)],
 ['no native DOM identity',i=>delete i.selection.domIdentity]
])test(name+' denies the conditional selected list join',async()=>{const i=structuredClone(await input());mutate(i);const r=(await load()).joinListFieldObservations(i);assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.fullPath,false)});
test('changing displayed text alone does not select a different writer or create field authority',async()=>{const i=await input(),{joinListFieldObservations}=await load(),before=joinListFieldObservations(i);i.selection.value=i.selection.domIdentity.value='a different spelling';const after=joinListFieldObservations(i);assert.equal(after.status,'Conditional selected list join');assert.deepEqual(after.joins,before.joins);assert.equal(after.fullPath,false)});

test('root application source mapping joins the same original sites after workspace relocation',async()=>{
 const i=structuredClone(await input()),prefix=i.manifest.program.appRoot+'/';
 i.manifest.program.appRoot='.';
 for(const source of i.manifest.inputs)if(source.file.startsWith(prefix))source.file=source.file.slice(prefix.length);
 const r=(await load()).joinListFieldObservations(i);
 assert.equal(r.status,'Conditional selected list join');
 assert(r.chain.some(step=>step.source?.file==='src/todo/reducer.js'));
 i.manifest.program.appRoot='../outside';
 assert.equal((await load()).joinListFieldObservations(i).status,'Unknown/Unsupported');
});
