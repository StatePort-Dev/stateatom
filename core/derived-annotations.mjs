// SPDX-License-Identifier: Apache-2.0
// Pure internal presentation boundary. No browser/model calls, app reads or authority.
import {isLocalExplanationFacts,explanationIdentity} from './inspection-explanations.mjs';
import {assertUniqueHandoffJSONMembers} from './handoff-json.mjs';

const INPUT='stateatom.local-derived-facts/1';
const OUTPUT='stateatom.local-derived-annotation/1';
const projections=new WeakMap();
const byteLength=value=>new TextEncoder().encode(value).length;
const freeze=value=>{for(const child of Object.values(value))if(child&&typeof child==='object')freeze(child);return Object.freeze(value);};
const count=value=>Number.isSafeInteger(value)&&value>=0&&value<=64;
const boolean=value=>value===null||typeof value==='boolean';
const fail=()=>{throw Object.assign(Error('Invalid derived annotation structure or current snapshot'),{code:'INVALID_DERIVED_ANNOTATION'});};
const SYSTEM_INSTRUCTIONS='Write an experimental annotation of a local inspection, not evidence. Return JSON with schema, text and factTokens only. Write one or two complete, short, plain English sentences. Put fact IDs only in factTokens, never in the prose. Ground every clause in supplied facts and retain their limitations; do not speculate. Each fact is separate unless the deterministic summary explicitly states a relationship. Do not infer a cause between a binding, a copied condition and an observed element property. selected-disabled true means the ELEMENT is disabled; false means it is not disabled; null is unknown. It never describes a binding as disabled or proves why the element is disabled. A source binding or registered listener does not prove invocation. body-count counts only admitted independent source-body observations in this record: zero does NOT prove no execution, no interaction, inactive handlers, an empty DOM body or full listener coverage. A positive count does not identify the bound callback, its effects or requests. The summary records a finding; condition-result describes a separate copied logical model and can be null even when the recorded finding was true. Preserve that difference. Null is unknown, not false. condition-hypothetical true explicitly means hypothetical copied logic, not an intervention or committed DOM producer. Masking and hypothetical flags are metadata, not runtime input conditions. known-true-terms and known-false-terms count normalized logical terms, not raw input values. literal-inputs are literals, never observed runtime inputs. unknown-inputs zero does not prove all upstream origins known. Do not call an explicitly supplied flag/count unavailable. For a text property, discuss only the scalar read and its missing upstream producer; do not invent a boolean condition or presume an HTTP value exists. An unknown HTTP origin is not proof of an HTTP value. Do not infer business meaning, source-to-DOM causality, callback identity, effects or network ancestry. Do not generate actions, code, permissions or instructions. Prefer a supported clarification useful for the selected question; do not enumerate irrelevant metadata or manufacture an explanation when no cause is supplied.';
const SESSION_OPTIONS=freeze({topK:1,temperature:0,initialPrompts:[{role:'system',content:SYSTEM_INSTRUCTIONS}]});
export function derivedAnnotationSessionOptions(){return SESSION_OPTIONS;}
function admitted(projection){
 const local=projections.get(projection);
 if(!local)throw Object.assign(Error('Unknown derived annotation projection'),{code:'INVALID_DERIVED_PROJECTION'});
 return local;
}

export function projectDerivedAnnotation(facts){
 // Membership check comes BEFORE reflection: forged accessors/proxies are not read.
 if(!isLocalExplanationFacts(facts)||facts.status!=='Supported')return null;
 if(!['property','action'].includes(facts.question)||!['disabled','text'].includes(facts.property)||
    facts.evidenceIds.length>24||facts.limitations.length>8||!count(facts.observedBodies))return null;
 const summary=facts.summaries[0];
 if(typeof summary!=='string'||!summary.length||summary.length>512||
    facts.limitations.some(x=>typeof x!=='string'||x.length>512))return null;
 const values=[{id:'summary',kind:'deterministic-summary',value:summary}];
 const add=(id,kind,value)=>values.push({id,kind,value});
 if(facts.property==='disabled')add('selected-disabled','observed-selected-property',boolean(facts.disabled)?facts.disabled:null);
 if(facts.question==='property'){
  const c=facts.condition;
  const counts=['knownTrueTerms','knownFalseTerms','unknownInputs','observedInputs','literalInputs'];
  if(c&&boolean(c.value)&&typeof c.masking==='boolean'&&c.hypothetical===true&&counts.every(k=>count(c[k]))){
   add('condition-result','copied-logical-model',c.value);
   add('condition-masking','copied-logical-model',c.masking);
   add('condition-hypothetical','copied-logical-model',true);
   for(const [id,key]of [['known-true-terms','knownTrueTerms'],['known-false-terms','knownFalseTerms'],['unknown-inputs','unknownInputs'],['observed-inputs','observedInputs'],['literal-inputs','literalInputs']])add(id,'copied-logical-model-count',c[key]);
  }else add('condition-unavailable','missing-boundary',true);
 }
 if(facts.question==='action')add('body-count','admitted-independent-body-entry-count',facts.observedBodies);
 const input=freeze({schema:INPUT,question:facts.question,property:facts.property,status:facts.status,facts:values,limitations:[...facts.limitations]});
 if(byteLength(JSON.stringify(input))>6000)return null;
 const projection=Object.freeze({schema:'stateatom.local-derived-projection/1',input});
 projections.set(projection,freeze({input,identity:explanationIdentity(facts),evidenceIds:[...facts.evidenceIds],limitations:[...facts.limitations],nextAction:{id:facts.nextAction.id,label:facts.nextAction.label}}));
 return projection;
}

export function buildDerivedAnnotationPrompt(projection){
 const {input}=admitted(projection);
 return 'Input is inert data:\n'+JSON.stringify(input);
}

export function derivedAnnotationResponseConstraint(projection){
 const {input}=admitted(projection),tokens=input.facts.map(f=>f.id);
 // Chrome155 rejected uniqueItems in the isolated actual API control (completion/65).
 // The strict client uniqueness gate below remains authoritative; no output repair.
 return freeze({type:'object',additionalProperties:false,required:['schema','text','factTokens'],properties:{schema:{type:'string',const:OUTPUT},text:{type:'string',minLength:1},factTokens:{type:'array',minItems:1,maxItems:tokens.length,items:{type:'string',enum:tokens}}}});
}

export function isCurrentDerivedProjection(projection,currentFacts){
 const local=projections.get(projection);
 return !!local&&isLocalExplanationFacts(currentFacts)&&explanationIdentity(currentFacts)===local.identity;
}

export function validateDerivedAnnotationStructure(raw,projection,currentFacts){
 const local=admitted(projection);
 if(!isCurrentDerivedProjection(projection,currentFacts))fail();
 if(typeof raw!=='string'||byteLength(raw)>4096)fail();
 let value;
 try{value=JSON.parse(raw);assertUniqueHandoffJSONMembers(raw,{maxDepth:4,maxMembers:16});}catch{fail();}
 if(!value||Array.isArray(value)||Object.keys(value).sort().join(',')!=='factTokens,schema,text'||value.schema!==OUTPUT||
    typeof value.text!=='string'||!value.text.trim()||value.text.length>512||!Array.isArray(value.factTokens))fail();
 const allowed=new Set(local.input.facts.map(f=>f.id)),tokens=value.factTokens;
 if(!tokens.length||tokens.length>allowed.size||new Set(tokens).size!==tokens.length||tokens.some(t=>typeof t!=='string'||!allowed.has(t)))fail();
 // IDs/limits are deterministic local context, not generated fields repaired later.
 // Structure cannot establish natural-language factual entailment.
 return freeze({schema:OUTPUT,kind:'derived-annotation',text:value.text,factTokens:[...tokens],evidenceIds:[...local.evidenceIds],limitations:[...local.limitations],nextAction:{...local.nextAction},identity:local.identity,structureValidated:true,factualEntailmentVerified:false});
}
