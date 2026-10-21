// SPDX-License-Identifier: Apache-2.0
// Fixed synthetic inspection facts for model presentation evaluation, not native provenance.
import{explanationFixture}from'../helpers/explanation-facts-fixture.mjs';
import{inspectionExplanationFacts}from'../../core/inspection-explanations.mjs';
export const localModelCorpusVersion='stateatom.local-model-corpus/1';
export function localModelCorpus(){
 const cases=[];
 function action(id,event,mechanism){const state=explanationFixture();state.analysis.graph.edges=[{id:'action-evidence:0'}];state.analysis.actionBindings=[{id:'binding',identity:{...state.analysis.actionContext},mechanism,event,freshness:'Recorded',registeredOn:'selected-element',status:'Observed',binding:{evidenceIds:['action-evidence:0']},entry:{status:mechanism==='dom-listener'?'Unknown/Unsupported':'Code-linked',evidenceIds:['action-evidence:0']},execution:{status:'not-observed'}}];cases.push({id,kind:'action',expected:'binding is not invocation; no callback/effect authority',facts:inspectionExplanationFacts(state,{question:'action'})});}
 for(const event of['click','change','submit','keydown','keyup','blur','focus','input','pointerdown','pointerup'])action('source-'+event,event,'react-jsx');
 for(const event of['click','change','keydown','pointerdown'])action('native-'+event,event,'dom-listener');
 cases.push({id:'action-unavailable',kind:'unknown',expected:'no supported binding or observed execution',facts:inspectionExplanationFacts(explanationFixture(),{question:'action'})});
 const stale=explanationFixture();stale.stale={reason:'Synthetic source changed'};cases.push({id:'action-stale',kind:'stale',expected:'stale; inspect again; no previous values treated current',facts:inspectionExplanationFacts(stale,{question:'action'})});
 for(const[id,expression,values,value,expected]of[
  ['short-circuit','hold || !ready',[['hold',true]],true,'skipped ready unavailable, never false'],
  ['one-blocker','hold || !ready',[['hold',false],['ready',false]],true,'one known true term; hypothetical model only'],
  ['no-blocker','hold || !ready',[['hold',false],['ready',true]],false,'recorded false; no invented blocker'],
  ['masking','hold || true',[['hold',true]],true,'two sufficient terms; one read and one code literal; hypothetical'],
  ['negated-masking','!(false && false)',[],true,'two known sufficient true terms; code-linked literals only'],
  ['negated-false-masking','!(true || true)',[],false,'two known sufficient false terms; code-linked literals only'],
  ['unknown-left','missing || true',[],true,'input unavailable; no model-derived known result']
 ])cases.push({id,kind:'property',expected,facts:inspectionExplanationFacts(explanationFixture(expression,values,value))});
 const scalar=explanationFixture('name',[['name','Cedar']],'Cedar');scalar.selection.property=scalar.analysis.stateatom.target.property=scalar.analysis.stateatom.runtime.target.property='text';cases.push({id:'local-scalar',kind:'property',expected:'copied scalar; upstream producer and HTTP origin not established',facts:inspectionExplanationFacts(scalar)});
 return cases;
}
