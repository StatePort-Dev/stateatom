// SPDX-License-Identifier: Apache-2.0
// Independent observations of one native node, not an atomic render snapshot.
const sameNode=(a,b)=>!!a&&!!b&&a.document===b.document&&a.node===b.node;
const same=(a,b)=>sameNode(a,b)&&a.property===b.property&&a.value===b.value;
export const hasDisabledProperty=tag=>['button','input','textarea','select','option','optgroup','fieldset'].includes(tag?.toLowerCase());
export function staleElementProperties(bundle,reason){return bundle?{...bundle,properties:bundle.properties.map(({analysis,...row})=>({...row,status:'Stale',reason}))}:null;}
export async function collectElementProperties({selection,analysis,identify,observe,resolve,isCurrent,now=Date.now}){
 const properties=[{property:selection.property,status:'Observed',selection,analysis}];
 const guard=async()=>{if(!isCurrent()||!same(selection.domIdentity,await identify(selection.property))||!isCurrent())throw Error('Element changed during property inspection; inspect again');};
 await guard();
 for(const property of ['text',...(hasDisabledProperty(selection.tag)?['disabled']:[])]){
  if(property===selection.property)continue;
  const before=await identify(property);if(!isCurrent())throw Error('Element changed during property inspection');
  if(!before){properties.push({property,status:'Unknown/Unsupported',reason:'Native observation is unavailable for this element.'});continue;}
  if(!sameNode(selection.domIdentity,before))throw Error('Element changed during property inspection');
  const observation=await observe(property);
  const after=await identify(property);
  if(!isCurrent()||!same(before,after))throw Error('Element changed during property inspection');
  if(observation?.status==='Unknown/Unsupported'&&!Object.hasOwn(observation,'value')){properties.push({property,status:'Unknown/Unsupported',reason:observation.reason||'Property observation unavailable.'});continue;}
  if(observation.property!==property||observation.value!==after?.value)throw Error('Element changed during property inspection');
  // Never inherit another property’s trace, occurrence or analysis.
  const {trace,instance,page,frame,property:ignored,value,...metadata}=selection;
  const selected={...metadata,...observation,property,domIdentity:after,observedAt:now()};
  const result=await resolve(selected);await guard();
  if(!same(after,await identify(property))||!isCurrent())throw Error('Element changed during property inspection');
  properties.push({property,status:'Observed',selection:selected,analysis:result});
 }
 await guard();return {schemaVersion:1,properties:properties.sort((a,b)=>a.property==='text'?-1:b.property==='text'?1:0)};
}
export async function refreshElementProperties(bundle,identify,isCurrent){
 if(!bundle)return null;const rows=[];
 for(const row of bundle.properties){
  if(row.status!=='Observed'){rows.push(row);continue;}
  const current=await identify(row.property);if(!isCurrent())throw Error('Element changed during property refresh');
  if(current&&!sameNode(row.selection.domIdentity,current))return staleElementProperties(bundle,'Selected element was replaced; inspect again.');
  rows.push(same(row.selection.domIdentity,current)?row:{property:row.property,status:'Stale',selection:row.selection,reason:'This value changed or became unavailable; inspect again.'});
 }
 return {...bundle,properties:rows};
}
export function projectElementProperties(state){
 const bundle=state.elementInspection||state.stale?.elementInspection;if(!bundle)return null;
 const changed=state.inputEditedInspection===state.inspectionGeneration&&state.inspectionGeneration!==undefined||state.observationStaleInspection===state.inspectionGeneration&&state.inspectionGeneration!==undefined||bundle.sourceGeneration!==undefined&&bundle.sourceGeneration!==(state.sourceGeneration||0);
 if(!state.selection||state.stale||changed)return staleElementProperties(bundle,changed?'Inputs, observation or source changed; inspect again.':state.stale?.reason||'Historical observation; inspect again.');
 return bundle;
}
