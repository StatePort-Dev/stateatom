// SPDX-License-Identifier: Apache-2.0
// Frozen v3 transport predicates; semantic quality is assessed separately.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {localDerivedCorpus} from '../tests/fixtures/local-derived-corpus.mjs';
import {TemplateExplanation} from '../core/action-explanations.mjs';
import {explanationIdentity} from '../core/inspection-explanations.mjs';
import {projectGroundedAnnotation,validateGroundedAnnotation,buildGroundedPrompt,groundedResponseConstraint,groundedAnnotationSessionOptions} from '../core/grounded-annotations.mjs';
export const groundedSha=x=>createHash('sha256').update(x).digest('hex');
export function groundedProtocol(){return {schema:'stateatom.l02-grounded-protocol/4',maximumNativeRuns:1,mainCases:30,separateBodyCases:4,maxPromptCalls:31,allowDownload:false,cachedAvailabilityMs:20000,requestTimeoutMs:30000,observationTimeoutMs:35000,caseBudgetMs:600000,qualityAssessedByCollection:false,originalAcceptanceWaived:false};}
export function expectedGroundedCreateOptions(){return {expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:[{type:'text',languages:['en']}],...groundedAnnotationSessionOptions(),signalPresent:true};}
export function expectedGroundedCases(){return localDerivedCorpus().map((c,index)=>{const p=projectGroundedAnnotation(c.facts);return{index,id:c.id,campaign:c.campaign,status:c.facts.status,eligible:!!p,template:TemplateExplanation(c.facts),identitySha256:groundedSha(explanationIdentity(c.facts)),input:p?p.input:null,prompt:p?buildGroundedPrompt(p):null,constraint:p?groundedResponseConstraint(p):null};});}
const text=(x,max=8192)=>typeof x==='string'&&x.length>0&&x.length<=max,sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x),start=x=>typeof x==='string'&&/^\d+$/.test(x),pid=x=>Number.isSafeInteger(x)&&x>0;
const words=x=>x===null?0:x.trim().split(/\s+/).length;
function event(r,name){const all=r.events.filter(e=>e.op===name);assert.equal(all.length,1,'Expected exactly one '+name);return all[0];}
function templateFields(r,expected){for(const key of ['summary','evidenceIds','limitations'])assert.deepEqual(r[key],expected[key]);}
export function guardGroundedRunRecord(r,expected,s){
 assert.equal(r.id,expected.id);assert.equal(r.campaign,expected.campaign);assert.equal(r.caseIndex,expected.index);assert.equal(r.expectedEligible,expected.eligible);
 assert.equal(r.activation.trusted,true);assert.equal(r.activation.isActive,true);assert.deepEqual(r.requestOptions,{userActivation:true,allowDownload:false,timeoutMs:30000});
 assert(!Object.hasOwn(r,'error')&&!Object.hasOwn(r,'cancel')&&!Object.hasOwn(r,'changed'));
 templateFields(r.template,expected.template);templateFields(r.currentTemplate,expected.template);templateFields(r.result,expected.template);assert.equal(r.exactCurrentReferences,true);assert.equal(r.exactCurrentLimits,true);
 assert.equal(r.registeredPrompt,expected.prompt);assert.deepEqual(r.registeredConstraint,expected.constraint);assert(Number.isFinite(r.started)&&Number.isFinite(r.elapsedMs)&&r.elapsedMs>=0&&r.elapsedMs<=35000);assert(text(r.usefulness)&&r.usefulness.startsWith('UNASSESSED'));
 assert(Array.isArray(r.events)&&r.events.length<=32);let previous=r.started;
 for(const e of r.events){assert(Number.isFinite(e.at)&&e.at>=previous&&e.at<=r.started+r.elapsedMs);previous=e.at;}
 assert.equal(r.wordCounts.template,words(expected.template.summary));
 if(!expected.eligible){assert.deepEqual(r.events,[]);assert.equal(r.inferenceReturned,false);assert.equal(r.annotationAccepted,false);assert.equal(r.annotationText,null);assert.equal(r.result.provider,'template');assert.equal(r.result.annotation,null);assert.equal(r.wordCounts.annotation,0);return 'template-outside-scope';}
 assert.deepEqual(r.events.map(e=>e.op),['availability-start','availability-resolved','create-start','create-resolved','prompt-start','prompt-resolved','destroy-attempt','destroy-returned']);
 assert.deepEqual(event(r,'availability-start').options,{expectedInputs:s.expectedCreateOptions.expectedInputs,expectedOutputs:s.expectedCreateOptions.expectedOutputs});assert.equal(event(r,'availability-resolved').result,'available');
 assert.deepEqual(event(r,'create-start').options,s.expectedCreateOptions);
 const settings=event(r,'create-resolved').returnedSettings;assert(['Observed','Unknown/Unsupported'].includes(settings.status));
 assert(settings.topK===null||Number.isFinite(settings.topK));assert(settings.temperature===null||Number.isFinite(settings.temperature));
 if(settings.topK!==null)assert.equal(settings.topK,s.expectedCreateOptions.topK);if(settings.temperature!==null)assert.equal(settings.temperature,s.expectedCreateOptions.temperature);
 if(settings.status==='Observed'){assert.equal(settings.topK,s.expectedCreateOptions.topK);assert.equal(settings.temperature,s.expectedCreateOptions.temperature);}else assert(settings.topK===null||settings.temperature===null);
 const sent=event(r,'prompt-start'),returned=event(r,'prompt-resolved');assert.equal(sent.prompt,expected.prompt);assert.deepEqual(sent.requestedConstraint,expected.constraint);assert.deepEqual(sent.constraint,expected.constraint);assert.equal(sent.signalPresent,true);assert.equal(returned.rawType,'string');assert.equal(typeof returned.raw,'string');assert.equal(returned.signalAbortedAtReturn,false);assert.equal(r.inferenceReturned,true);
 const c=localDerivedCorpus()[expected.index];assert.equal(c.id,expected.id);let validated,invalid=false;
 try{validated=validateGroundedAnnotation(returned.raw,projectGroundedAnnotation(c.facts),c.facts);}catch{invalid=true;}
 if(invalid){assert.equal(r.result.provider,'template');assert.equal(r.result.annotation,null);assert.equal(r.annotationAccepted,false);assert.equal(r.annotationText,null);assert.equal(r.wordCounts.annotation,0);assert.equal(r.result.reason,'Local annotation unavailable or rejected; showing the template.');return 'model-returned-client-rejected';}
 assert.equal(r.result.provider,'chrome-built-in-grounded');assert.deepEqual(r.result.annotation,validated);assert.equal(groundedSha(r.result.annotation.identity),expected.identitySha256);assert.equal(r.result.annotation.factualEntailmentVerified,false);assert.equal(r.annotationAccepted,true);assert.equal(r.annotationText,validated.text);assert.equal(r.wordCounts.annotation,words(validated.text));return 'model-returned-client-accepted';
}
export function qualifyGroundedCollection(r,c){
 assert.equal(c.schema,'stateatom.l02-grounded-case/4');assert.equal(r.schema,'stateatom.l02-grounded-native/4');
 assert.deepEqual(c.protocol,groundedProtocol());assert.deepEqual(c.expectedCases,expectedGroundedCases());assert.deepEqual(c.expectedCreateOptions,expectedGroundedCreateOptions());
 assert.equal(r.diagnosticOnly,true);for(const key of ['originalAcceptanceWaived','modelQualityAssessed','fullL02','productProviderSelected'])assert.equal(r[key],false);
 assert.equal(r.initialAvailability,'available');assert.equal(r.context.href,'chrome-extension://'+c.developmentId+'/l02-eval.html');assert.equal(r.context.runtimeId,c.developmentId);assert.equal(r.context.topLevel,true);assert.equal(r.context.nonce,c.nonce);
 assert.equal(r.compiledEvaluation.url,'chrome-extension://'+c.developmentId+'/l02-eval.js');assert.equal(r.compiledEvaluation.sha256,c.addon.jsSha256);assert.equal(r.compiledEvaluation.debuggerDisabledBeforeRun,true);
 assert(Array.isArray(r.runs));assert.equal(r.runs.length,34);const counts={modelReturns:0,structurallyAccepted:0,structurallyRejected:0,templateOnly:0};
 for(const [index,row]of r.runs.entries()){
  const result=guardGroundedRunRecord(row,c.expectedCases[index],{expectedCreateOptions:c.expectedCreateOptions});
  if(result==='template-outside-scope')counts.templateOnly++;else{counts.modelReturns++;counts[result==='model-returned-client-accepted'?'structurallyAccepted':'structurallyRejected']++;}
 }
 assert.equal(counts.modelReturns,31);assert.equal(counts.templateOnly,3);
 assert.deepEqual(r.errors,[]);assert.deepEqual(r.pageErrors,[]);assert.equal(r.console.overflow,false);assert(r.console.records.length<=128);assert(r.console.records.every(x=>x.type==='warning'));
 for(const key of ['originalHostUnchanged','profileSourceUnchanged','allFrozenInputsUnchanged'])assert.equal(r[key],true);
 for(const key of ['driver','control','browser','desktop','ownedBrowserPidAbsent'])assert.equal(r.cleanup[key],true);
 return {status:'COLLECTED_GROUNDED_ANNOTATIONS_NOT_L02',...counts,qualityAssessed:false,fullL02:false,productProviderSelected:false};
}
