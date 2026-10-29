// SPDX-License-Identifier: Apache-2.0
import {inspectionView} from '../../../browser-extension/inspection-view.mjs';
import {inspectionExplanationFacts,inspectionDependencies} from '../../../core/inspection-explanations.mjs';
import {dependencyResponseBinding} from './dependency-editing.mjs';
import {renderExplanationDetails} from './inspection-explanation-ui.mjs';
import {createPropertyLocalExplanationCard} from './property-local-explanation-ui.mjs';
import {projectGroundedAnnotation} from '../../../core/grounded-annotations.mjs';
export function createElementPropertiesUI({document,$,openSource,connectProject,refresh=()=>{},onValues=()=>{}}){
 let key,openDecision,localCards=[];
 const disposeLocal=()=>{for(const card of localCards)card.dispose();localCards=[];};
 const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
 function sourceRows(container,view){for(const source of view.sources){const b=el('button',source.file.split('/').at(-1)+':'+source.line,'sp-button-subtle');b.type='button';b.title='Code-linked · '+source.file+':'+source.line+':'+source.column;b.setAttribute('aria-label','Open in IDE: '+source.file+':'+source.line+':'+source.column);b.disabled=!openDecision?.available;if(b.disabled)b.title=openDecision?.reason||'Source opening unavailable';b.onclick=()=>{if(!b.disabled)openSource(source);};const line=el('div',undefined,'sp-section-row');line.append(b,el('span','Code-linked','sp-status'));container.append(line);if(source.expressions?.length)container.append(el('pre',source.expressions.join('\n'),'sp-code'));}}
 function sourceLink(label,source,className='sp-atom-dependency-link'){
  const b=el('button',label,className);b.type='button';b.disabled=!source||!openDecision?.available;
  b.title=source?source.file+':'+source.line+':'+source.column:'Source location unavailable';
  b.setAttribute('aria-label','Open in code: '+label+(source?' · '+b.title:''));
  if(b.disabled)b.title=openDecision?.reason||'Source opening unavailable';b.onclick=()=>{if(!b.disabled)openSource(source);};return b;
 }
 function render(state){
  const bundle=state?.elementInspection,visible=!!bundle&&(!!state.selection||!!state.stale)&&!['starting','picking','resolving'].includes(state.picker?.status);
  for(const id of ['element-properties','element-property-evidence','element-property-sources'])$(id).hidden=!visible;
  if(!visible){key=null;disposeLocal();onValues([]);return false;}
  const globalStale=state.stale||state.analysis?.actionsInvalidated===true||state.analysis?.stateatom?.runtime?.status==='Stale';
  openDecision=state.capabilityPolicy?.operations?.open;const next=JSON.stringify([bundle,globalStale,openDecision,state.run,state.sourceGeneration,state.inspectionGeneration,state.analysis?.capabilities,state.stale,state.selection,state.attached]);if(key===next)return true;key=next;
  disposeLocal();
  const valueSlots=[],inputs=[],evidence=[],sources=[],sourceGroups=new Map();let staleCount=0,selectedListSupported=false;
  for(const row of bundle.properties){
   const name=row.property==='text'?'Text':'Disabled attribute',stale=row.status==='Stale'||!!globalStale;
   const scoped={...state,selection:row.selection,analysis:stale?null:row.analysis,stale:stale?{target:row.selection,reason:row.reason||state.stale?.reason||'Inspection changed; inspect again.'}:null};
   const view=inspectionView(scoped),facts=inspectionExplanationFacts(scoped),dependencies=inspectionDependencies(scoped);
   selectedListSupported ||= view.selectedListSupported;
   if(view.selectedListSupported)for(const step of view.selectedListProfile.chain){const source=step.source,id=JSON.stringify(source);if(!sourceGroups.has(id))sourceGroups.set(id,{source,names:[name]});}
   const card=el('section',undefined,'sp-atom-property-card');card.setAttribute('aria-label',name);card.setAttribute('data-property',row.property);
   if(stale||dependencies.status==='Stale'){staleCount++;view.sources=[];}
   if(dependencies.expression){
    const heading=el('div',undefined,'sp-section-row');heading.append(el('h3',row.property==='text'?'Text':'Disabled','sp-section-title'),el('span',dependencies.status==='Observed'?'Recorded computation':'Code-linked','sp-atom-column-key'));card.append(heading);
    card.append(sourceLink(dependencies.expression,dependencies.source,'sp-atom-dependency-expression'));
    if(dependencies.inputs.length){const list=el('div',undefined,'sp-atom-dependencies');for(const input of dependencies.inputs){
     const group=el('div'),line=el('div',undefined,'sp-data-row sp-atom-dependency');
     const value=input.status==='Observed'?el('code',JSON.stringify(input.value),'sp-value'):el('span','Not recorded','sp-atom-unavailable-value');
     if(input.status==='Observed')value.title='Recorded value. Direct editing is unavailable unless Atom has a supported writer for this input.';
     if(input.status!=='Observed')value.title='This value was not recorded for the selected execution. Atom has not evaluated it again.';
     const name=input.source?sourceLink(input.expression,input.source):el('span',input.expression,'sp-atom-dependency-name'),slot=el('div',undefined,'sp-atom-dependency-value');slot.append(value);line.append(name,slot);group.append(line);
     valueSlots.push({container:slot,fallback:value,label:name,binding:dependencyResponseBinding(scoped,input)});
     if(input.upstream?.length){const chain=el('details',undefined,'sp-atom-dependency-origin');chain.append(el('summary','Read from'));for(const read of input.upstream){const row=el('div',undefined,'sp-data-row sp-atom-dependency');const name=read.source?sourceLink(read.expression,read.source):el('span',read.expression,'sp-atom-dependency-name'),value=el('code',JSON.stringify(read.value),'sp-value'),slot=el('div',undefined,'sp-atom-dependency-value');slot.append(value);row.append(name,slot);valueSlots.push({container:slot,fallback:value,label:name,binding:dependencyResponseBinding(scoped,read)});chain.append(row);}group.append(chain);}
     list.append(group);
    }card.append(list);}
    else card.append(el('p','No scalar inputs were recorded for this expression.','sp-atom-hint'));
    if(!stale&&projectGroundedAnnotation(facts)){const local=createPropertyLocalExplanationCard({document,facts,property:row.property});localCards.push(local);card.append(local.element);}
    inputs.push(card);
   }
   const group=el('details',undefined,'sp-disclosure');group.append(el('summary',name+' · '+(stale?'Stale':row.status)));const body=el('div');
   if(row.selection)body.append(el('p','Recorded '+new Date(row.selection.observedAt).toLocaleTimeString()+' · '+row.property+' = '+JSON.stringify(row.selection.value),'sp-atom-hint'));
   if(row.latestObservation)body.append(el('p','Separately checked '+new Date(row.latestObservation.observedAt).toLocaleTimeString()+' · '+row.property+' = '+JSON.stringify(row.latestObservation.value)+'. Code explanation has not been refreshed.','sp-atom-hint'));
   if(row.property==='disabled')body.append(el('p','Native disabled attribute only; this does not establish whether the element can be clicked.'));
   if(row.reason)body.append(el('p',row.reason));const explanation=el('div');renderExplanationDetails(document,explanation,facts);body.append(explanation);
   body.append(el('p',view.commit.status+' · '+view.commit.reason,'sp-atom-hint'));
   if(row.analysis){const raw=el('details');raw.append(el('summary','Scoped property records'),el('pre',JSON.stringify({sources:row.analysis.sources,stateatom:row.analysis.stateatom},null,2)));body.append(raw);}
   group.append(body);evidence.push(group);
   for(const source of view.sources){const id=JSON.stringify(source),group=sourceGroups.get(id)||{source,names:[]};if(!group.names.includes(name))group.names.push(name);sourceGroups.set(id,group);}
  }
  for(const {source,names} of sourceGroups.values()){const locations=el('section',undefined,'sp-atom-property-card');locations.append(el('h4',names.join(' · '),'sp-section-title'));sourceRows(locations,{sources:[source]});sources.push(locations);}
  if(!sources.length)sources.push(el('p',staleCount?'Source links are out of date. Refresh the inspection.':'No source locations linked to this element.','sp-help'));
  if(!inputs.length&&staleCount){inputs.push(el('p','Refresh dependencies after changing page values.','sp-help'));}
  else if(!inputs.length&&!selectedListSupported){
   const empty=el('section',undefined,'sp-atom-dependencies-empty');empty.append(el('h3',staleCount?'Refresh dependencies':'Dependencies not found','sp-title'),el('p',staleCount?'The page changed. Inspect this element again to update its expression and inputs.':'Atom can see the element, but has not linked it to the code that produces it.','sp-help'));
   const connected=state.analysis?.capabilities?.sourceResolver==='open-ide';const action=el('button',staleCount?'Inspect again':connected?'Set up runtime inspection':'Connect project','sp-button-primary');action.type='button';action.onclick=staleCount?refresh:connectProject;empty.append(action);inputs.push(empty);
  }else if(staleCount){const update=el('button','Refresh changed dependencies','sp-button-subtle');update.type='button';update.onclick=refresh;inputs.push(update);}
  const focused=document.activeElement,caret=focused?.selectionStart!=null?[focused.selectionStart,focused.selectionEnd,focused.selectionDirection]:null;
  $('element-properties').replaceChildren(...inputs);onValues(valueSlots);if(focused?.isConnected&&document.activeElement!==focused){focused.focus?.({preventScroll:true});if(caret)focused.setSelectionRange?.(...caret);}$('element-properties').hidden=!inputs.length;$('element-property-evidence').replaceChildren(...evidence);$('element-property-sources').replaceChildren(...sources);return true;
 }
 return {render,dispose:disposeLocal};
}
