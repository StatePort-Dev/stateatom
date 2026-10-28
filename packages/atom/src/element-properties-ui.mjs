// SPDX-License-Identifier: Apache-2.0
import {inspectionView} from '../../../browser-extension/inspection-view.mjs';
import {inspectionExplanationFacts} from '../../../core/inspection-explanations.mjs';
import {renderExplanationDetails} from './inspection-explanation-ui.mjs';
export function createElementPropertiesUI({document,$,openSource,connectProject}){
 let key,openDecision;
 const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
 function sourceRows(container,view){for(const source of view.sources){const b=el('button',source.file.split('/').at(-1)+':'+source.line,'sp-button-subtle');b.type='button';b.title='Code-linked · '+source.file+':'+source.line+':'+source.column;b.setAttribute('aria-label','Open in IDE: '+source.file+':'+source.line+':'+source.column);b.disabled=!openDecision?.available;if(b.disabled)b.title=openDecision?.reason||'Source opening unavailable';b.onclick=()=>{if(!b.disabled)openSource(source);};const line=el('div',undefined,'sp-section-row');line.append(b,el('span','Code-linked','sp-status'));container.append(line);if(source.expressions?.length)container.append(el('pre',source.expressions.join('\n'),'sp-code'));}}
 function render(state){
  const bundle=state?.elementInspection,visible=!!bundle&&(!!state.selection||!!state.stale)&&!['starting','picking','resolving'].includes(state.picker?.status);
  for(const id of ['element-properties','element-property-evidence','element-property-sources'])$(id).hidden=!visible;
  if(!visible){key=null;return false;}
  openDecision=state.capabilityPolicy?.operations?.open;const next=JSON.stringify([bundle,openDecision]);if(key===next)return true;key=next;
  const inputs=[],evidence=[],sources=[];
  for(const row of bundle.properties){
   const name=row.property==='text'?'Text':'Disabled attribute',stale=row.status==='Stale';
   const scoped={attached:state.attached,selection:row.selection,analysis:stale?null:row.analysis,stale:stale?{target:row.selection,reason:row.reason}:null};
   const view=inspectionView(scoped),facts=inspectionExplanationFacts(scoped),card=el('section',undefined,'sp-atom-property-card');card.setAttribute('aria-label',name);card.setAttribute('data-property',row.property);
   const heading=el('div',undefined,'sp-section-row');heading.append(el('h3',name,'sp-section-title'),el('span',stale?(row.latestObservation?'Value checked':'Needs refresh'):row.selection?'':'Not recorded','sp-atom-column-key'));card.append(heading);
   const value=row.latestObservation?row.latestObservation.value:row.selection?.value;
   card.append(el('p',!row.selection?'Not recorded':row.property==='text'?(value===''?'Empty text':value):value?'Set':'Not set','sp-atom-property-value'));

   if(stale&&!row.latestObservation||!row.selection)card.append(el('p',row.reason||'Inspect again to record this property.','sp-atom-hint'));
   else if(facts.status==='Supported')card.append(el('p',facts.summaries[0],'sp-atom-property-answer'));

   sourceRows(card,view);
   if(view.operands.length){card.append(el('h4','Observed inputs','sp-atom-eyebrow'));const list=el('ul');for(const n of view.operands){const li=el('li',undefined,'sp-data-row');li.append(el('span',n.expression),el('code',JSON.stringify(n.value),'sp-value'));list.append(li);}card.append(list);}
   inputs.push(card);
   const group=el('details',undefined,'sp-disclosure');group.append(el('summary',name+' · '+row.status));const body=el('div');
   if(row.selection)body.append(el('p','Recorded '+new Date(row.selection.observedAt).toLocaleTimeString()+' · '+row.property+' = '+JSON.stringify(row.selection.value),'sp-atom-hint'));
   if(row.latestObservation)body.append(el('p','Separately checked '+new Date(row.latestObservation.observedAt).toLocaleTimeString()+' · '+row.property+' = '+JSON.stringify(row.latestObservation.value)+'. Code explanation has not been refreshed.','sp-atom-hint'));
   if(row.property==='disabled')body.append(el('p','Native disabled attribute only; this does not establish whether the element can be clicked.'));
   if(row.reason)body.append(el('p',row.reason));const explanation=el('div');renderExplanationDetails(document,explanation,facts);body.append(explanation);
   body.append(el('p',view.commit.status+' · '+view.commit.reason,'sp-atom-hint'));
   if(row.analysis){const raw=el('details');raw.append(el('summary','Scoped property records'),el('pre',JSON.stringify({sources:row.analysis.sources,stateatom:row.analysis.stateatom},null,2)));body.append(raw);}
   group.append(body);evidence.push(group);
   const locations=el('section',undefined,'sp-atom-property-card');locations.append(el('h4',name,'sp-section-title'));sourceRows(locations,view);if(!view.sources.length)locations.append(el('p',stale?'Snapshot is stale; inspect again.':'No source location linked to this property.','sp-atom-hint'));sources.push(locations);
  }
  if(state.analysis?.capabilities?.sourceResolver!=='open-ide'&&!state.stale){const connect=el('button','Connect project to explain these values','sp-button-subtle');connect.type='button';connect.onclick=connectProject;sources.push(connect);}
  $('element-properties').replaceChildren(...inputs);$('element-property-evidence').replaceChildren(...evidence);$('element-property-sources').replaceChildren(...sources);return true;
 }
 return {render};
}
