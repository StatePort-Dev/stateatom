// SPDX-License-Identifier: Apache-2.0
// Known metadata privacy overlap only. No inference of execution or dependency.
import{handoffInputEvidenceFields}from'./handoff-input-evidence.mjs';
import{actionFail as fail}from'./handoff-action-data.mjs';
const visible=f=>f&&['included','filtered','replaced'].includes(f.state);
const rows=base=>base.report.technicalEvidence.state==='reviewed-projection'?[base.report.target.value,...base.report.technicalEvidence.fields]:[];
const priorMap={selectionDetails:['actionIdentities'],sourceLocations:['actionSources'],sourceExcerpts:['actionSymbols'],actionDetails:['actionIdentities','actionSymbols'],diagnosticDetails:['actionIdentities','actionNotes']};
export function actionPriorBaseOmissions(base){
 const categories=new Set();for(const f of rows(base))if(f.state==='replaced'||f.state==='omitted'&&f.reason==='explicit-field-omission')for(const c of priorMap[f.category]||(/\/sourceDigest$/.test(f.sourcePointer)?['actionSources']:[]))categories.add(c);return{omitCategories:[...categories],omitFields:[]};
}
function unique(current=[],extra=[]){if(!Array.isArray(current)||current.some(x=>typeof x!=='string')||new Set(current).size!==current.length)fail('Unique base privacy choices required');return[...new Set([...current,...extra])];}
const textValues=value=>{const out=[];function walk(x){if(typeof x==='string')out.push(x);else if(x&&typeof x==='object')Object.values(x).forEach(walk);}walk(value);return out;};
const protectedHash=f=>f.path==='/identity/build'||/\/(siteId|sourceDigest)$/.test(f.path);
export function actionRelatedBaseReview(base,packet,review,whole=false,choices={}){
 const input=base.profile==='input-evidence/1',outer=input?{...review}:null,b=input?{...(review.baseReview||{})}:{...review},selected=packet?packet.fields.filter(f=>whole||(choices.omitCategories||[]).includes(f.category)||(choices.omitFields||[]).includes(f.path)||(choices.replaceFields||[]).some(r=>r.id===f.path)):[];
 // Original excluded, filtered or replaced values are deliberately not retained.
 // An explicit later reduction cannot match those originals by replacement text;
 // remove the corresponding metadata categories conservatively instead. Merely
 // projecting a default-private packet still preserves independent base consent.
 const unknown=new Set(selected.filter(f=>f.state!=='included').map(f=>f.category)),fallback=new Set();
 for(const[category,related]of Object.entries({actionIdentities:['selectionDetails','actionDetails','diagnosticDetails'],actionSources:['sourceLocations','sourceExcerpts','actionDetails','diagnosticDetails'],actionSymbols:['actionDetails','sourceExcerpts'],actionNotes:['diagnosticDetails']}))if(unknown.has(category))for(const c of related)fallback.add(c);
 const identifiers=new Set(selected.filter(f=>f.category==='actionIdentities'&&!protectedHash(f)).map(f=>f.value).filter(v=>typeof v==='string')),symbols=new Set(selected.filter(f=>f.category==='actionSymbols').map(f=>f.value).filter(v=>typeof v==='string')),paths=new Set(selected.filter(f=>f.category==='actionSources'&&f.path.endsWith('/file')).map(f=>f.value).filter(v=>typeof v==='string')),notes=new Set(selected.filter(f=>f.category==='actionNotes').map(f=>f.value).filter(v=>typeof v==='string'));
 const sourceHashes=new Set(selected.filter(f=>f.category==='actionSources'&&f.path.endsWith('/sourceDigest')).map(f=>f.value));
 const all=rows(base),ids=new Set(),prefixes=new Set();
 b.omitCategories=unique(b.omitCategories||[],[...fallback].filter(c=>all.some(f=>f.category===c&&visible(f))));
 for(const f of all){if(!visible(f))continue;const values=textValues(f.value),ptr=f.sourcePointer;
  if(['selectionDetails','actionDetails','diagnosticDetails'].includes(f.category)&&values.some(v=>identifiers.has(v)))ids.add(f.id);
  if(f.category==='actionDetails'&&values.some(v=>[...symbols].some(word=>v.includes(word))))ids.add(f.id);
  if(f.category==='diagnosticDetails'&&values.some(v=>notes.has(v)||[...paths].some(path=>v.includes(path))))ids.add(f.id);
  if(ptr.endsWith('/sourceDigest')&&(unknown.has('actionSources')||sourceHashes.has(f.value)))ids.add(f.id);
  if(f.category==='sourceLocations'&&ptr.endsWith('/file')&&paths.has(f.value))prefixes.add(ptr.slice(0,-5));
  if(f.category==='sourceExcerpts'&&values.some(v=>[...symbols,...paths].some(word=>v.includes(word))))ids.add(f.id);
 }
 for(const f of all)if([...prefixes].some(p=>f.sourcePointer.startsWith(p+'/')))ids.add(f.id);
 b.omitFields=unique(b.omitFields||[],[...ids]);
 // A matching byte-comparison path must not survive through a source attachment.
 const comparisons=base.sourceEvidence||[],omittedNotes=new Set(b.omitNotes||[]),omittedPackets=new Set(b.omitEvidence||[]),files=(b.omitEvidenceFiles||[]).map(x=>({findingId:x.findingId,files:[...x.files]}));
 if(new Set(files.map(x=>x.findingId)).size!==files.length)fail('Duplicate source comparison privacy choice');
 for(const p of comparisons){if(omittedNotes.has(p.findingId)||omittedPackets.has(p.findingId))continue;const names=p.files.filter(f=>unknown.has('actionSources')||paths.has(f.file)||[f.digest,f.reporterDigest,f.developerDigest].some(d=>sourceHashes.has(d))).map(f=>f.file);if(!names.length)continue;const old=files.find(f=>f.findingId===p.findingId);if(old)old.files=unique(old.files,names);else files.push({findingId:p.findingId,files:names});}
 if(files.length)b.omitEvidenceFiles=files;
 if(!input)return b;
 outer.baseReview=b;const ir={...(outer.inputReview||{})};if(!outer.omitInputEvidence&&base.inputEvidence){const matched=handoffInputEvidenceFields(base.inputEvidence).filter(f=>visible(f)&&['inputIdentities','inputLocations'].includes(f.category)&&textValues(f.value).some(v=>identifiers.has(v)||paths.has(v))).map(f=>f.path);ir.omitFields=unique(ir.omitFields||[],matched);ir.omitCategories=unique(ir.omitCategories||[],[...(unknown.has('actionIdentities')?['inputIdentities']:[]),...(unknown.has('actionSources')?['inputLocations']:[])]);}outer.inputReview=ir;return outer;
}
export function actionMergePrivacy(packet,user,derived){
 const cats=unique(user.omitCategories||[],derived.omitCategories),fields=unique(user.omitFields||[],derived.omitFields),originalCats=new Set(user.omitCategories||[]),originalFields=new Set(user.omitFields||[]),replacements=user.replaceFields||[],byPath=new Map(packet.fields.map(f=>[f.path,f]));
 if(!Array.isArray(replacements)||new Set(replacements.map(r=>r.id)).size!==replacements.length)fail('Unique action redactions required');for(const r of replacements)if(originalFields.has(r.id)||originalCats.has(byPath.get(r.id)?.category))fail('Conflicting action privacy choices');
 return{omitCategories:cats,omitFields:fields,replaceFields:replacements.filter(r=>!fields.includes(r.id)&&!cats.includes(byPath.get(r.id)?.category))};
}
export function actionRequireBasePrivacy(base,packet){if(!packet)return;const required=new Set(actionPriorBaseOmissions(base).omitCategories);if(packet.fields.some(f=>required.has(f.category)&&f.state!=='omitted'))fail('Action packet retains metadata redacted from the base');}
