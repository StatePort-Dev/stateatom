// SPDX-License-Identifier: Apache-2.0
// Pure passive wording shared by Atom and the recipient; callers render inert text.
const outerProfile=r=>r?.profile==='action-evidence/1'?r.actionBaseHeader.profile:r?.profile;
export const handoffHasInputEvidence=r=>outerProfile(r)==='input-evidence/1';
const componentProfile=r=>handoffHasInputEvidence(r)?r.inputBaseHeader.profile:outerProfile(r);
export const handoffHasSourceEvidence=r=>componentProfile(r)==='source-evidence/1';
export const handoffBaseProfile=r=>handoffHasSourceEvidence(r)?r.baseProfile:componentProfile(r);
const reviewed=r=>handoffBaseProfile(r)==='reviewed-snapshot/1';
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
 if(!reviewed(record))return(record.profile==='action-evidence/1'||handoffHasSourceEvidence(record)?'Base snapshot: source':'Source')+', responses and recorded actions are excluded. Historical claims are not reverified.';
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

const sourceReasons={'recorded-build-missing':'A recorded source-sample hash is missing.','recorded-build-mismatch':'Recorded source-sample hashes differ.','reporter-snapshot-stale':'Reporter snapshot is stale.','developer-snapshot-stale':'Developer snapshot is stale.','reporter-source-anchor-missing':'Reporter source context is not retained.','reporter-source-ambiguous':'Reporter source path is ambiguous.','developer-source-anchor-missing':'Developer source context is not retained.','developer-source-ambiguous':'Developer source path is ambiguous.','developer-source-kind-unavailable':'Developer snapshot has no explicit Code-linked source kind.','developer-source-digest-missing':'Developer source digest is missing.','recorded-source-digest-mismatch':'Recorded source digests differ.','local-bytes-mismatch':'Selected local file bytes differ from a recorded source digest.'};
export function handoffSourceEvidenceSummary(record){
 if(!handoffHasSourceEvidence(record))return'';
 const kept=record.sourceEvidence.reduce((n,p)=>n+p.files.length,0),omitted=record.sourceEvidence.reduce((n,p)=>n+p.omittedFiles,0);
 return'Local source comparisons: '+kept+' file checks retained, '+omitted+' omitted; '+record.evidencePrivacy.omittedAttachments+' comparisons omitted. Historical untrusted claims, not reverified.';
}
export function handoffSourceEvidenceText(record,{creating=false}={}){
 if(!handoffHasSourceEvidence(record))return'';
 const lines=[handoffSourceEvidenceSummary(record),creating?'Selected local file bytes were compared for this revision. Recorded source/build claims remain historical and untrusted; execution is not verified.':'These recorded local byte comparisons are not reverified by this reader. No original source file is opened.'];
 for(const p of record.sourceEvidence){
  const ordinal=record.additions.findIndex(n=>n.id===p.findingId)+1,build={'same-hash':'Same recorded collected-source sample hash.','different-hash':'Different recorded collected-source sample hashes.','unknown':'Recorded collected-source hash comparison is unknown.'}[p.buildComparison.relation];
  lines.push('','Developer note '+ordinal+' · unverified',build+' Not full application build attestation.',p.files.length+' file checks included; '+p.omittedFiles+' omitted.');
  for(const f of p.files){lines.push((f.status==='content-matched'?'Recorded content match · not reverified':'Unjoined recorded file')+': '+f.file+' · '+f.bytes+' bytes.');for(const reason of f.reasons)lines.push(sourceReasons[reason]);}
 }
 lines.push('',...record.evidenceLimitations);return lines.join('\n');
}
