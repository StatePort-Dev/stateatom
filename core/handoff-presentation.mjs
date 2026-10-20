// SPDX-License-Identifier: Apache-2.0
// Pure passive wording shared by Atom and the recipient; callers render inert text.
const reviewed=r=>r.profile==='reviewed-snapshot/1';
const rows=r=>[r.report.target.value,...r.report.technicalEvidence.fields];
export const handoffCategoryLabels=Object.freeze({selectedText:'Selected text',selectionDetails:'Selection context',sourceLocations:'Source locations',sourceExcerpts:'Source excerpts',responseBodies:'Response excerpts',runtimeValues:'Runtime values',networkLocations:'Network origins',routePaths:'Route paths',originalNotes:'Original notes',diagnosticDetails:'Diagnostic context',actionDetails:'Action source and registration',sourceMaps:'Source-map metadata',interventionValues:'Legacy intervention fragments'});
const categoryLabels=handoffCategoryLabels;
const display=v=>typeof v==='string'?v:JSON.stringify(v);
export function handoffConditionText(record){
 const t=record.report.target;if(!reviewed(record))return t.property==='text'?'Selected text: excluded from this report.':'Selected disabled = '+t.value.value;
 const f=t.value,label=t.property==='text'?'Selected text':'Selected disabled';
 if(f.state==='included')return label+' = '+display(f.value)+' · historical recorded condition.';
 if(f.state==='filtered')return label+' = '+display(f.value)+' · filtered historical content; original context may be missing.';
 if(f.state==='replaced')return label+': reviewer redaction — '+f.value+' · replacement is not an observation.';
 if(f.state==='unavailable')return label+': unavailable in the saved snapshot.';
 return t.property==='text'?'Selected text: excluded from this report.':label+': omitted during review; recorded value unavailable here.';
}
export function handoffTechnicalSummary(record){
 if(!reviewed(record))return'Source, responses and recorded actions are excluded. Historical claims are not reverified.';
 const all=rows(record),count=state=>all.filter(f=>f.state===state).length;
 return'Reviewed historical details: '+count('included')+' included, '+count('filtered')+' filtered, '+count('replaced')+' reviewer replacements, '+count('omitted')+' omitted, '+count('unavailable')+' unavailable. Missing context does not establish no dependency.';
}
export function handoffTechnicalText(record){
 if(!reviewed(record))return'';
 const t=record.report.technicalEvidence,visible=t.fields.filter(f=>f.category!==null&&['included','filtered','replaced'].includes(f.state)),lines=[handoffTechnicalSummary(record)];
 if(!visible.length)lines.push('No private technical content included.');
 for(const category of Object.keys(categoryLabels)){
  const fields=visible.filter(f=>f.category===category);if(!fields.length)continue;
  lines.push('',categoryLabels[category]);
  for(const f of fields){const label=f.state==='replaced'?'Reviewer redaction (not an observation)':f.evidenceKind+' historical claim'+(f.state==='filtered'?' · filtered':'');lines.push(label+' · '+f.label+': '+display(f.value));}
  for(const scope of new Set(fields.map(f=>f.scope)))lines.push(scope);
 }
 const broken=t.joins.filter(j=>j.state==='unverifiable').length;
 lines.push('',broken+' context joins are unverifiable because required context was omitted, filtered, replaced or unavailable.');
 if(t.omittedSourceFragments.length)lines.push('Compilation journal omitted from this profile.');
 lines.push(...t.limitations);return lines.join('\n');
}
