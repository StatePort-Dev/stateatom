// SPDX-License-Identifier: Apache-2.0
// Conservative known-category privacy overlap, not general PII inference.
import {observationFail as fail,observationOwn as own,observationArray as array} from './handoff-observation-data.mjs';
const visible=f=>f&&['included','filtered','replaced'].includes(f.state),rows=b=>b.report.technicalEvidence.state==='reviewed-projection'?[b.report.target.value,...b.report.technicalEvidence.fields]:[];
const mapping={selectionDetails:['observationIdentities','observationLocations'],diagnosticDetails:['observationIdentities','observationLocations'],actionDetails:['observationIdentities'],networkLocations:['observationLocations'],routePaths:['observationLocations'],runtimeValues:['observationValues'],interventionValues:['observationValues']};
const inner=b=>({...b,...(b.profile==='action-evidence/1'?b.actionBaseHeader:b.inputBaseHeader)});
const categoryMap={inputIdentities:'observationIdentities',inputLocations:'observationLocations',inputValues:'observationValues',actionIdentities:'observationIdentities'};
export function observationPriorBaseOmissions(base){
 const categories=new Set();for(const f of rows(base))if(f.state==='replaced'||f.state==='omitted'&&f.reason==='explicit-field-omission'){if(f.sourcePointer==='/target/value'&&base.report.target.property==='disabled')categories.add('observationValues');for(const c of mapping[f.category]||[])categories.add(c);}
 if(base.report.target.property==='disabled'&&!visible(base.report.target.value))categories.add('observationValues');
 for(const packet of [base.inputEvidence,base.actionEvidence])if(packet?.lineage?.kind==='privacy-derivative'){
  const fields=packet.fields||[];for(const f of fields)if(f.state==='omitted'&&categoryMap[f.category])categories.add(categoryMap[f.category]);
  for(const c of packet.privacy?.excludedCategories||[])if(categoryMap[c])categories.add(categoryMap[c]);
 }
 return [...categories];
}
export function observationRequireBasePrivacy(base,packet,required=[]){if(!packet)return;const categories=new Set([...observationPriorBaseOmissions(base),...required]);if(packet.fields.some(f=>categories.has(f.category)&&['included','filtered'].includes(f.state)))fail('Observation retains fields redacted from the base');}
// An already-default-omitted old field cannot encode a later explicit request.
// The new envelope retains this policy separately instead of changing old codecs.
export function observationRequestedBaseOmissions(base,review){
 const categories=new Set();function visit(b,r){
  if(b.profile==='action-evidence/1'||b.profile==='input-evidence/1'){const action=b.profile==='action-evidence/1',name=action?'actionReview':'inputReview';for(const c of r[name]?.omitCategories||[])if(categoryMap[c])categories.add(categoryMap[c]);visit(inner(b),r.baseReview||{});return;}
  for(const c of r.omitCategories||[])for(const o of mapping[c]||[])categories.add(o);
  for(const f of rows(b))if((r.omitFields||[]).includes(f.id)||(r.replaceFields||[]).some(x=>x.id===f.id)){if(f.sourcePointer==='/target/value'&&b.report.target.property==='disabled')categories.add('observationValues');for(const o of mapping[f.category]||[])categories.add(o);}
 }visit(base,review);return [...categories];
}
export function observationBaseReview(base,value){
 if(base.profile==='action-evidence/1'||base.profile==='input-evidence/1'){
  const action=base.profile==='action-evidence/1',name=action?'actionReview':'inputReview',whole=action?'omitActionEvidence':'omitInputEvidence',r=own(value,['baseReview',name,whole]);
  if(Object.hasOwn(r,whole)&&typeof r[whole]!=='boolean')fail('Explicit component omission required');if(r.baseReview)observationBaseReview(inner(base),r.baseReview);if(r[name]){const c=own(r[name],action?['omitCategories','omitFields','replaceFields']:['omitCategories','omitFields']);for(const v of Object.values(c))array(v,2048);}return r;
 }
 const r=own(value,['omitIssueFields','omitCategories','omitFields','replaceFields','omitNotes','omitEvidence','omitEvidenceFiles']);for(const v of Object.values(r))array(v,2048);return r;
}
const unique=(a=[],b=[])=>[...new Set([...a,...b])];
export function observationRelatedBaseReview(base,review,packet,choice){
 const selected=new Set([...(choice.omitCategories||[]),...packet.fields.filter(f=>(choice.omitFields||[]).includes(f.path)||(choice.replaceFields||[]).some(r=>r.id===f.path)).map(f=>f.category)]);
 function visit(b,r){
  if(b.profile==='action-evidence/1'||b.profile==='input-evidence/1'){
   const action=b.profile==='action-evidence/1',name=action?'actionReview':'inputReview',whole=action?'omitActionEvidence':'omitInputEvidence',out={...r,baseReview:visit(inner(b),r.baseReview||{})};
   if(!out[whole]){const related=Object.entries(categoryMap).filter(([c,o])=>(action?c.startsWith('action'):c.startsWith('input'))&&selected.has(o)).map(([c])=>c);out[name]={...(r[name]||{}),omitCategories:unique(r[name]?.omitCategories,related)};}return out;
  }
  const all=rows(b),out={...r},cats=Object.entries(mapping).filter(([,cs])=>cs.some(c=>selected.has(c))).map(([c])=>c).filter(c=>all.some(f=>f.category===c&&visible(f)));
  if(cats.length)out.omitCategories=unique(out.omitCategories,cats);
  if(selected.has('observationValues')&&b.report.target.property==='disabled'&&visible(b.report.target.value)){
   if(!b.report.target.value.id)throw Object.assign(Error('Use a reviewed snapshot to redact overlapping selected values; this minimal component cannot redact its original condition.'),{code:'UNSUPPORTED_HANDOFF_FORMAT'});
   out.omitFields=unique(out.omitFields,[b.report.target.value.id]);
  }
  return out;
 }
 return visit(base,review);
}
export function observationReduction(packet,choice,derived){
 const c={...choice},replaced=new Set((c.replaceFields||[]).map(f=>f.id));
 for(const f of c.replaceFields||[])if((c.omitFields||[]).includes(f.id)||(c.omitCategories||[]).includes(packet.fields.find(p=>p.path===f.id)?.category))fail('Conflicting observation privacy choices');
 c.omitFields=unique(c.omitFields,packet.fields.filter(f=>derived.includes(f.category)&&f.state!=='omitted'&&!replaced.has(f.path)).map(f=>f.path));return c;
}
