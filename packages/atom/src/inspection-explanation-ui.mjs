// SPDX-License-Identifier: Apache-2.0
import{inspectionExplanationFacts,explanationIdentity}from'../../../core/inspection-explanations.mjs';
export function renderExplanationDetails(document,container,facts){
 const lines=facts.details.map(d=>d.status+' · '+(d.expression||d.kind)+(Object.hasOwn(d,'value')?' = '+JSON.stringify(d.value):'')+(d.scope?' · '+d.scope:'')+(d.source?' · '+d.source.file+':'+d.source.line+':'+d.source.column:'')+(d.evidenceIds.length?'\nEvidence: '+d.evidenceIds.join(', '):''));
 lines.push(...facts.limitations.map(x=>'Limit: '+x));
 if(facts.evidenceIds.length)lines.push('Supporting records: '+facts.evidenceIds.join(', '));
 container.replaceChildren(...lines.map(line=>{const p=document.createElement('pre');p.textContent=line;return p;}));
}
export function createInspectionExplanationUI({document,$,onNext=()=>{}}){
 let key;
 return{render(state){
  const facts=inspectionExplanationFacts(state||{}),visible=!!state?.selection||!!state?.stale,nextKey=visible?explanationIdentity(facts):null;
  $('property-explanation-block').hidden=!visible;$('explanation-details').hidden=!visible;
  if(key===nextKey)return facts;key=nextKey;$('explanation-details').open=false;
  $('property-explanation').textContent=visible?facts.summaries[0]:'';
  $('property-explanation-scope').textContent=visible&&facts.status==='Supported'?'Computation snapshot · DOM producer and HTTP origin remain unverified.':'';
  $('explanation-next').textContent=visible?facts.nextAction.label:'';$('explanation-next').disabled=!visible;
  if(visible)renderExplanationDetails(document,$('explanation-data'),facts);else $('explanation-data').replaceChildren();
  $('explanation-next').onclick=()=>{if(!visible)return;if(facts.nextAction.id==='view-evidence'){$('explanation-details').open=true;$('explanation-details').querySelector?.('summary')?.focus();}else onNext(facts.nextAction.id);};
  return facts;
 }};
}
