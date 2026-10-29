// SPDX-License-Identifier: Apache-2.0
// Test-only fixed evaluation document. Defaults delegate to the real browser API;
// unit tests pass a fake DOM/API. No URL-selected mode or response transformation.
import {ChromeGroundedAnnotation} from '../../core/derived-model-provider.mjs';
import {TemplateExplanation} from '../../core/action-explanations.mjs';
import {projectGroundedAnnotation,buildGroundedPrompt,groundedResponseConstraint} from '../../core/grounded-annotations.mjs';
import {localDerivedCorpus,localDerivedCorpusVersion} from '../fixtures/local-derived-corpus.mjs';

const copy=value=>value===undefined?null:JSON.parse(JSON.stringify(value));
const apiError=error=>({name:typeof error?.name==='string'?error.name:'Error',message:typeof error?.message==='string'?error.message:'Unknown API failure'});
const words=text=>text===null?0:text.trim().split(/\s+/).length;
export function installGroundedEvaluationPage({document:doc=globalThis.document,window:view=globalThis.window,navigator:nav=globalThis.navigator,performance:clock=globalThis.performance,model=globalThis.LanguageModel}={}){
 const controls=Object.fromEntries(['status','run','cancel','change','case'].map(id=>[id,doc.getElementById(id)]));
 if(Object.values(controls).some(e=>!e))throw Error('Evaluation controls unavailable');
 const {status,run,cancel,change,case:select}=controls,cases=localDerivedCorpus(),caseOrder=cases.map(c=>({id:c.id,campaign:c.campaign,status:c.facts.status,eligible:!!projectGroundedAnnotation(c.facts)}));
 if(cases.length!==34||caseOrder.filter(c=>c.campaign==='main30').length!==30||caseOrder.filter(c=>c.campaign==='body-supplement4').length!==4||caseOrder.filter(c=>c.eligible).length!==31)throw Error('Registered focused annotation corpus changed');
 let controller,currentFacts;
 const state=view.l02Evaluation={schema:'stateatom.local-grounded-evaluation-page/4',corpusVersion:localDerivedCorpusVersion,scope:'Fixed synthetic main30 plus separate4; unselected grounded selection provider, not product acceptance',phase:'idle',results:[],errors:[],progress:[],active:null,api:typeof model,realApiForwarding:true,modelBuildId:'Unknown; no API-exposed build ID',availability:null,caseOrder,eligibleCount:31,templateOnlyCount:3,ready:false};
 for(const [index,c]of cases.entries()){const option=doc.createElement('option');option.value=String(index);option.textContent=c.campaign+' / '+c.id;select.append(option);}select.value='0';
 const language={expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:[{type:'text',languages:['en']}]};
 view.l02CheckAvailability=async()=>{try{return state.availability=model?await model.availability(language):'API missing';}catch(error){state.availabilityError=apiError(error);return state.availability='Unavailable/Unknown';}};
 run.onclick=async event=>{
  if(controller)return null;
  const selected=select.value,index=typeof selected==='string'&&/^(0|[1-9]\d*)$/.test(selected)?Number(selected):-1;
  if(!Number.isSafeInteger(index)||index<0||index>=cases.length){state.errors.push({code:'INVALID_REGISTERED_CASE'});return null;}
  controller=new AbortController();const own=controller,c=cases[index],projection=projectGroundedAnnotation(c.facts),events=[];currentFacts=c.facts;
  const activation={trusted:event?.isTrusted===true,isActive:nav.userActivation?.isActive===true},requestOptions={userActivation:activation.trusted&&activation.isActive,allowDownload:false,timeoutMs:30000};
  const record={id:c.id,campaign:c.campaign,expected:c.expected,expectedEligible:!!projection,startedAt:new Date().toISOString(),started:clock.now(),activation,requestOptions,template:TemplateExplanation(c.facts),registeredPrompt:projection?buildGroundedPrompt(projection):null,registeredConstraint:projection?groundedResponseConstraint(projection):null,events,phases:[],inferenceReturned:false,annotationText:null,annotationAccepted:false,usefulness:'UNASSESSED: structure and wording difference do not establish factual entailment or usefulness',latencyMeaning:'Provider return latency; late native API returns remain separate events'};
  state.active=record;state.phase='running';state.progress=[];run.disabled=true;cancel.disabled=false;change.disabled=false;status.textContent='Explicit cached-model focused annotation request; not product acceptance';
  const forwarded={
   async availability(o){events.push({op:'availability-start',at:clock.now(),options:copy(o)});try{const result=await model.availability(o);events.push({op:'availability-resolved',at:clock.now(),result});return result;}catch(error){events.push({op:'availability-rejected',at:clock.now(),...apiError(error)});throw error;}},
   async create(o){
    events.push({op:'create-start',at:clock.now(),options:{expectedInputs:copy(o.expectedInputs),expectedOutputs:copy(o.expectedOutputs),topK:o.topK??null,temperature:o.temperature??null,initialPrompts:copy(o.initialPrompts),signalPresent:!!o.signal}});
    let session;try{session=await model.create(o);}catch(error){events.push({op:'create-rejected',at:clock.now(),...apiError(error)});throw error;}
    const returnedSettings={status:'Unknown/Unsupported',topK:null,temperature:null};
    // Diagnostic getters must not orphan the already acquired native session.
    try{const value=session.topK;if(Number.isFinite(value))returnedSettings.topK=value;}catch{}
    try{const value=session.temperature;if(Number.isFinite(value))returnedSettings.temperature=value;}catch{}
    if(returnedSettings.topK!==null&&returnedSettings.temperature!==null)returnedSettings.status='Observed';
    events.push({op:'create-resolved',at:clock.now(),returnedSettings});
    return {
     async prompt(prompt,options){events.push({op:'prompt-start',at:clock.now(),prompt,requestedConstraint:copy(options.responseConstraint),constraint:copy(options.responseConstraint),signalPresent:!!options.signal});try{const raw=await session.prompt(prompt,options);record.inferenceReturned=true;events.push({op:'prompt-resolved',at:clock.now(),rawType:typeof raw,raw:typeof raw==='string'?raw:null,signalAbortedAtReturn:options.signal?.aborted??null});return raw;}catch(error){events.push({op:'prompt-rejected',at:clock.now(),...apiError(error)});throw error;}},
     destroy(){events.push({op:'destroy-attempt',at:clock.now()});try{session.destroy();events.push({op:'destroy-returned',at:clock.now()});}catch(error){events.push({op:'destroy-rejected',at:clock.now(),...apiError(error)});throw error;}}
    };
   }
  };
  try{
   record.result=await ChromeGroundedAnnotation(model?forwarded:null).explain(c.facts,{...requestOptions,signal:own.signal,getCurrentFacts:()=>currentFacts,onPhase:phase=>{record.phases.push({phase,at:clock.now()});status.textContent=phase;},onProgress:loaded=>{state.progress.push({loaded,at:clock.now()});status.textContent='Browser-reported progress '+Math.round(loaded*100)+'%';}});
   record.elapsedMs=clock.now()-record.started;record.annotationText=record.result.annotation?.text??null;record.annotationAccepted=record.result.annotation!==null;
   record.annotationEqualsTemplate=record.annotationText===null?null:record.annotationText===record.template.summary;record.wordCounts={template:words(record.template.summary),annotation:words(record.annotationText)};
   record.exactCurrentReferences=JSON.stringify(record.result.evidenceIds)===JSON.stringify(currentFacts.evidenceIds);record.exactCurrentLimits=JSON.stringify(record.result.limitations)===JSON.stringify(currentFacts.limitations);record.currentTemplate=TemplateExplanation(currentFacts);record.progress=[...state.progress];
   status.textContent=record.result.provider+' · '+record.result.reason+'\n'+(record.annotationText??record.result.summary);state.results.push(record);return record;
  }catch(error){record.error=apiError(error);record.elapsedMs=clock.now()-record.started;state.results.push(record);status.textContent='Evaluation incomplete; deterministic template remains available.';return record;}
  finally{if(controller===own){controller=null;state.active=null;state.phase='idle';run.disabled=false;cancel.disabled=true;change.disabled=true;}}
 };
 cancel.onclick=event=>{if(controller){state.active.cancel={trusted:event?.isTrusted===true,isActive:nav.userActivation?.isActive===true,at:clock.now()};controller.abort();}};
 change.onclick=event=>{if(controller){const index=cases.findIndex(c=>c.id===state.active.id),replacement=cases[(index+1)%cases.length];currentFacts=replacement.facts;state.active.changed={trusted:event?.isTrusted===true,isActive:nav.userActivation?.isActive===true,at:clock.now(),replacementCase:replacement.id};status.textContent='Cached fixture facts changed; old annotation must be discarded.';}};
 state.ready=true;const availabilityReady=view.l02CheckAvailability();return {state,availabilityReady};
}
if(typeof window!=='undefined'&&typeof document!=='undefined')installGroundedEvaluationPage();
