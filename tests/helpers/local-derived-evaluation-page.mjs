// SPDX-License-Identifier: Apache-2.0
// Test-only adapter delegates to the actual browser API, retaining raw forwarded args.
import {ChromeDerivedAnnotation} from '../../core/derived-model-provider.mjs';
import {TemplateExplanation} from '../../core/action-explanations.mjs';
import {projectDerivedAnnotation,buildDerivedAnnotationPrompt} from '../../core/derived-annotations.mjs';
import {localDerivedSchemaProbe,forwardDerivedSchemaProbe} from '../fixtures/local-derived-schema-probe.mjs';
import {localDerivedInstructionControls} from '../fixtures/local-derived-instruction-controls.mjs';
import {localDerivedCorpus,localDerivedCorpusVersion} from '../fixtures/local-derived-corpus.mjs';
const schemaProbe=new URL(location.href).searchParams.get('schemaProbe')==='unique-items',instructionControls=new URL(location.href).searchParams.get('instructionControls')==='1',cases=schemaProbe?localDerivedSchemaProbe():instructionControls?localDerivedInstructionControls():localDerivedCorpus(),status=document.getElementById('status'),run=document.getElementById('run'),cancel=document.getElementById('cancel'),change=document.getElementById('change'),select=document.getElementById('case');
let controller,currentFacts;
const state=window.l02Evaluation={schema:localDerivedCorpusVersion,phase:'idle',results:[],progress:[],active:null,api:typeof LanguageModel,realApiForwarding:true,modelBuildId:'Unknown; no API-exposed build ID',availability:null};
for(const [i,c]of cases.entries()){const o=document.createElement('option');o.value=String(i);o.textContent=c.campaign+' / '+c.id;select.append(o);}
const api=globalThis.LanguageModel,options={expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:[{type:'text',languages:['en']}]};
window.l02CheckAvailability=async()=>state.availability=api?await api.availability(options):'API missing';
run.onclick=async event=>{
 if(controller)return;
 controller=new AbortController();const own=controller,index=Number(select.value),c=cases[index],projection=projectDerivedAnnotation(c.facts),events=[];
 currentFacts=c.facts;
 const record={id:c.id,campaign:c.campaign,schemaVariant:c.schemaVariant??null,expected:c.expected,expectedEligible:!!projection,startedAt:new Date().toISOString(),started:performance.now(),activation:{trusted:event.isTrusted,isActive:navigator.userActivation.isActive},template:TemplateExplanation(c.facts),registeredPrompt:projection?buildDerivedAnnotationPrompt(projection):null,events,phases:[]};
 state.active=record;state.phase='running';state.progress=[];run.disabled=true;cancel.disabled=false;change.disabled=false;status.textContent='Explicit real experimental provider request';
 const forwarded={
  async availability(o){const value=await api.availability(o);events.push({op:'availability',at:performance.now(),result:value});return value;},
  async create(o){events.push({op:'create-start',at:performance.now(),options:{expectedInputs:o.expectedInputs,expectedOutputs:o.expectedOutputs,topK:o.topK??null,temperature:o.temperature??null,initialPrompts:o.initialPrompts??null}});try{
   const session=await api.create(o);events.push({op:'create-resolved',at:performance.now(),returnedSettings:{topK:session.topK??null,temperature:session.temperature??null}});
   return {async prompt(p,o){const constraint=schemaProbe?forwardDerivedSchemaProbe(o.responseConstraint,c.schemaVariant):o.responseConstraint;events.push({op:'prompt-start',at:performance.now(),prompt:p,requestedConstraint:o.responseConstraint,constraint});try{const raw=await session.prompt(p,{...o,responseConstraint:constraint});events.push({op:'prompt-resolved',at:performance.now(),raw});return raw;}catch(error){events.push({op:'prompt-rejected',at:performance.now(),name:error.name,message:error.message});throw error;}},
    destroy(){events.push({op:'destroy-attempt',at:performance.now()});try{session.destroy();events.push({op:'destroy-returned',at:performance.now()});}catch(error){events.push({op:'destroy-rejected',at:performance.now(),name:error.name,message:error.message});throw error;}}};
  }catch(error){events.push({op:'create-rejected',at:performance.now(),name:error.name,message:error.message});throw error;}}
 };
 try{
  record.result=await ChromeDerivedAnnotation(api?forwarded:null).explain(c.facts,{userActivation:record.activation.isActive,allowDownload:true,signal:own.signal,timeoutMs:120000,getCurrentFacts:()=>currentFacts,onPhase:phase=>{record.phases.push({phase,at:performance.now()});status.textContent=phase;},onProgress:loaded=>{state.progress.push({loaded,at:performance.now()});status.textContent='Browser-reported download progress '+Math.round(loaded*100)+'%';}});
  record.elapsedMs=performance.now()-record.started;record.inferenceReturned=events.some(e=>e.op==='prompt-resolved');record.annotationText=record.result.annotation?.text??null;
  record.annotationEqualsTemplate=record.annotationText===null?null:record.annotationText===record.template.summary;
  record.wordCounts={template:record.template.summary.trim().split(/\s+/).length,annotation:record.annotationText===null?0:record.annotationText.trim().split(/\s+/).length};
  record.exactCurrentReferences=JSON.stringify(record.result.evidenceIds)===JSON.stringify(currentFacts.evidenceIds);record.exactCurrentLimits=JSON.stringify(record.result.limitations)===JSON.stringify(currentFacts.limitations);record.currentTemplate=TemplateExplanation(currentFacts);record.progress=[...state.progress];
  record.usefulness='UNASSESSED: wording difference/JSON validity is not usefulness; requires per-clause comparison';
  status.textContent=record.result.provider+' · '+record.result.reason+'\n'+(record.annotationText||record.result.summary);state.results.push(record);
 }catch(error){record.error={name:error.name,message:error.message};record.elapsedMs=performance.now()-record.started;state.results.push(record);status.textContent='Evaluation incomplete';}
 finally{if(controller===own){controller=null;state.active=null;state.phase='idle';run.disabled=false;cancel.disabled=true;change.disabled=true;}}
};
cancel.onclick=event=>{if(controller){state.active.cancel={trusted:event.isTrusted,isActive:navigator.userActivation.isActive,at:performance.now()};controller.abort();}};
change.onclick=event=>{if(controller){const index=(Number(select.value)+1)%cases.length;currentFacts=cases[index].facts;state.active.changed={trusted:event.isTrusted,isActive:navigator.userActivation.isActive,at:performance.now(),replacementCase:cases[index].id};status.textContent='Cached inspection facts changed; old annotation must be discarded.';}};
state.ready=true;void window.l02CheckAvailability();
