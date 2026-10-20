// SPDX-License-Identifier: Apache-2.0
// Passive report presentation, note and privacy-copy review. No app authority.
import{parseHandoffReport,appendHandoffFinding,handoffArtifactDigest,redactHandoffFile}from'../core/handoff-files.mjs';
import{handoffConditionText,handoffTechnicalText,handoffTechnicalSummary,handoffBaseProfile,handoffSourceEvidenceText,handoffSourceEvidenceSummary}from'../core/handoff-presentation.mjs';
import{createHandoffReview}from'../packages/atom/src/handoff-review.mjs';
export function createHandoffReader({document,summary,payload,status,section,download}){
 const $=id=>document.getElementById(id),area=$('reader-note-area');if(!area)return null;
 if(download!==undefined&&typeof download!=='function')throw Error('Download adapter must be a function');
 let raw=null,record=null,prepared=null,preparedPrivacy=null,epoch=0,pending=null,canAppend=false;const urls=new Set();
 const say=value=>{$('reader-note-status').textContent=value;},privacySay=value=>{$('reader-privacy-status').textContent=value;};
 const privacy=createHandoffReview({document,root:$('reader-privacy-fields'),onChange:()=>{invalidate();privacySay('Review changed privacy choices before downloading a copy.');}});
 function render(){
  $('reader-note-review').disabled=!raw||!canAppend||!!pending;$('reader-note-download').disabled=!prepared||!!pending;
  $('reader-privacy-review').disabled=!raw||!canPrivacy()||!!pending;$('reader-privacy-download').disabled=!preparedPrivacy||!!pending;
 }
 function invalidate(){epoch++;pending=null;prepared=null;preparedPrivacy=null;$('reader-note-preview').textContent='';$('reader-privacy-preview').textContent='';render();}
 function reset(){invalidate();raw=null;record=null;canAppend=false;privacy.clear();area.hidden=true;$('reader-privacy-area').hidden=true;$('reader-note-text').value='';$('reader-note-build').value='';say('');privacySay('');render();}
 function begin(kind){const token={epoch,kind};pending=token;prepared=null;preparedPrivacy=null;$('reader-note-preview').textContent='';$('reader-privacy-preview').textContent='';render();return token;}
 const canPrivacy=()=>['reviewed-snapshot/1','source-evidence/1'].includes(record?.profile);
 const current=(token,parent)=>pending===token&&epoch===token.epoch&&raw===parent;
 function downloadFile(text,name){if(download){download(text,name);return;}const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;urls.add(url);a.click();setTimeout(()=>{URL.revokeObjectURL(url);urls.delete(url);},1000);}
 $('reader-note-text').oninput=$('reader-note-build').oninput=()=>{invalidate();say(canAppend?'Review the new note before downloading.':'This report already has eight notes.');};
 $('reader-note-review').onclick=async()=>{
  if(!raw||pending||!canAppend)return;const parent=raw,finding={text:$('reader-note-text').value,build:$('reader-note-build').value||null},token=begin('note');
  try{const child=await appendHandoffFinding(parent,finding,{expectedParentDigest:await handoffArtifactDigest(parent)}),{record:r}=await parseHandoffReport(child,{parentRaw:parent});if(!current(token,parent))return;prepared={raw:child,id:r.id};const note=r.additions.at(-1);$('reader-note-preview').textContent='Developer note · unverified\n\n'+note.text+'\n\nBuild relation: '+note.buildRelation+' · not new execution or fix verification.\nThe original reporter baseline is unchanged.';say('Review your note for private information. Downloading does not send it.');}
  catch(e){if(current(token,parent))say(e.message);}
  finally{if(pending===token){pending=null;render();}}
 };
 $('reader-note-download').onclick=()=>{if(!prepared||pending)return;try{downloadFile(prepared.raw,'stateatom-revision-'+prepared.id+'.stateatom.json');say('File downloaded; not sent. Original report unchanged.');}catch(e){say(e.message);}};
 $('reader-privacy-review').onclick=async()=>{
  if(!raw||pending||!canPrivacy())return;const parent=raw,token=begin('privacy');
  try{const choices=privacy.read(),child=await redactHandoffFile(parent,choices,{expectedParentDigest:await handoffArtifactDigest(parent)}),{record:r,parentStatus}=await parseHandoffReport(child,{parentRaw:parent});if(!current(token,parent))return;preparedPrivacy={raw:child,id:r.id};$('reader-privacy-preview').textContent='New privacy copy · original report unchanged\n\n'+handoffConditionText(r)+'\n\n'+handoffTechnicalSummary(r)+'\n\n'+handoffSourceEvidenceSummary(r)+'\n\nDeveloper notes retained: '+r.additions.length+'; omitted so far: '+r.privacy.omittedDeveloperFindings+'.\nExact parent content: '+parentStatus+'. Claims remain historical and untrusted.';privacySay('Review this new copy. Nothing is saved or downloaded until you choose Download privacy copy.');}
  catch(e){if(current(token,parent))privacySay(e.message);}
  finally{if(pending===token){pending=null;render();}}
 };
 $('reader-privacy-download').onclick=()=>{if(!preparedPrivacy||pending)return;try{downloadFile(preparedPrivacy.raw,'stateatom-privacy-'+preparedPrivacy.id+'.stateatom.json');privacySay('Privacy copy downloaded; not sent. Original report unchanged.');}catch(e){privacySay(e.message);}};
 $('reader-privacy-cancel').onclick=()=>{invalidate();if(canPrivacy())privacy.report(record);privacySay('Privacy review cancelled. Original report and typed developer note unchanged.');render();};
 addEventListener('pagehide',()=>{reset();for(const u of urls)URL.revokeObjectURL(u);urls.clear();},{once:true});
 reset();
 return Object.freeze({reset,async load(text,isCurrent){
  invalidate();const ownEpoch=epoch;raw=null;record=null;canAppend=false;privacy.clear();area.hidden=true;$('reader-privacy-area').hidden=true;render();
  const {record:r,parentStatus}=await parseHandoffReport(text);if(epoch!==ownEpoch||!isCurrent())return;
  raw=text;record=r;canAppend=r.additions.length<8;summary.replaceChildren();const heading=document.createElement('h2');heading.textContent=r.report.issue.title||'Issue report';summary.append(heading);status.textContent='Historical issue report · untrusted claims · not reverified · not a State Card';const body=r.report,omitted=r.privacy.redactedIssueFields,value=k=>omitted.includes(k)?'Omitted during review':body.issue[k]||'Not supplied';
  section('What happened',[value('actual')]);section('Expected behavior',[value('expected')]);section('Selected condition',[handoffConditionText(r),'Captured '+(body.sourceDiagnostic.capturedAt===null?'unknown':new Date(body.sourceDiagnostic.capturedAt).toISOString())+' · '+body.sourceDiagnostic.freshness,'No observation window recorded. Earlier history is unknown.']);section('Reporter steps',omitted.includes('steps')?['Omitted during review']:body.issue.steps.length?body.issue.steps:['Not supplied']);section('Question for the developer',[value('question')]);section('Unknown and omitted',[handoffTechnicalSummary(r),'Original snapshot identity is retained; its claims have not been reverified.','Parent file: '+(parentStatus==='not-applicable'?'none required':parentStatus)+'. Hashes establish content identity, not authorship or a successful fix.',...r.limitations]);
  if(handoffBaseProfile(r)==='reviewed-snapshot/1')section('Reviewed technical details',handoffTechnicalText(r).split('\n').filter(Boolean),{collapsed:true});if(r.profile==='source-evidence/1')section('Local source comparisons',handoffSourceEvidenceText(r).split('\n').filter(Boolean),{collapsed:true});section('Developer notes',r.additions.map(n=>n.text+' · Developer note, unverified · build '+n.buildRelation));payload.textContent=JSON.stringify(r,null,2);area.hidden=false;
  if(canPrivacy()){privacy.report(r);$('reader-privacy-area').hidden=false;privacySay('Optional: create a new copy with selected details removed. Original report stays unchanged.');}
  say(canAppend?'Add a note without rewriting the reporter’s account. A build hash is optional and does not verify the issue.':'This report already has eight notes.');render();
 }});
}
