import{createHandoffActionReview,createHandoffActionEvidence}from'../../../core/handoff-action-evidence.mjs';
import{composeHandoffActionReport}from'../../../core/handoff-action-report.mjs';
import{handoffActionSummary,handoffActionText}from'../../../core/handoff-action-presentation.mjs';
// SPDX-License-Identifier: Apache-2.0
// Readable reviewed issue from an explicit saved or owner-captured v1 snapshot.
import{createHandoffInputEvidence,parseHandoffInputEvidence}from'../../../core/handoff-input-evidence.mjs';
import{composeHandoffInputReport}from'../../../core/handoff-input-report.mjs';
import{parseDiagnostic}from'../../../core/diagnostic.mjs';
import{createHandoffDraft}from'../../../core/handoff-draft.mjs';
import{createHandoffReport}from'../../../core/handoff-report.mjs';
import{createReviewedHandoffReport}from'../../../core/handoff-reviewed.mjs';
import{createHandoffContentReview}from'../../../core/handoff-content.mjs';
import{createHandoffReview}from'./handoff-review.mjs';
import{parseHandoffReport,handoffArtifactDigest}from'../../../core/handoff-files.mjs';
import{handoffConditionText,handoffTechnicalText,handoffTechnicalSummary,handoffBaseProfile,handoffSourceEvidenceText,handoffHasSourceEvidence,handoffHasInputEvidence}from'../../../core/handoff-presentation.mjs';
import{handoffInputText,handoffInputSummary}from'../../../core/handoff-input-presentation.mjs';
export const handoffButton='<button id="handoff-open" data-atom-id="handoff-open" class="sp-button-primary" disabled title="Save a snapshot locally first">Prepare saved issue</button><button id="handoff-current" data-atom-id="handoff-current" class="sp-button-secondary" disabled title="Prepare a local preview of the selected observation and recorded input history">Prepare current issue</button>';
export const handoffImport='<button id="report-refresh" data-atom-id="report-refresh" class="sp-button-secondary">Refresh local files</button><label class="sp-atom-report-import">Import a report file locally<input id="report-import" data-atom-id="report-import" type="file" accept=".json,.stateatom.json,application/json"></label>';
export const handoffTemplate=`<dialog id="handoff-dialog" data-atom-id="handoff-dialog" class="sp-atom-settings sp-atom-handoff" aria-labelledby="handoff-heading">
 <div class="sp-atom-settings-head"><div><p id="handoff-origin-label" data-atom-id="handoff-origin-label" class="sp-section-title">Saved snapshot</p><h2 id="handoff-heading" data-atom-id="handoff-heading" tabindex="-1">Prepare issue</h2></div><button id="handoff-cancel" data-atom-id="handoff-cancel" class="sp-button-secondary">Cancel</button></div>
 <p id="handoff-source" data-atom-id="handoff-source" class="sp-atom-hint"></p>
 <p id="handoff-intro" data-atom-id="handoff-intro">Review your description and choose any saved details to include. Private details are excluded by default. No observation window is recorded.</p>
 <div id="handoff-fields" data-atom-id="handoff-fields"><label>Issue title<input id="handoff-title" data-atom-id="handoff-title" maxlength="160"></label>
 <label>What happened<textarea id="handoff-actual" data-atom-id="handoff-actual" maxlength="1024" rows="2"></textarea></label>
 <label>Expected behavior<textarea id="handoff-expected" data-atom-id="handoff-expected" maxlength="1024" rows="2"></textarea></label>
 <details><summary>Steps and question · optional</summary><label>Steps I performed · one per line<textarea id="handoff-steps" data-atom-id="handoff-steps" maxlength="4103" rows="3"></textarea></label><label>Question for the developer<textarea id="handoff-question" data-atom-id="handoff-question" maxlength="1024" rows="2"></textarea></label></details>
 <details><summary>Privacy review</summary><p>Review your words for private information. Omitted fields stay out of the downloaded file; the saved snapshot is unchanged.</p>
 ${['title','actual','expected','steps','question'].map(k=>'<label class="sp-atom-content-option"><input type="checkbox" id="handoff-omit-'+k+'" data-atom-id="handoff-omit-'+k+'">Omit '+({actual:'what happened',expected:'expected behavior'}[k]||k)+'</label>').join('')}
 </details><details id="handoff-content-details" data-atom-id="handoff-content-details"><summary>Technical details · optional</summary><p>Choose only saved fragments you want in the file. Categories are excluded by default; missing data is not fetched.</p><div id="handoff-content-review" data-atom-id="handoff-content-review"></div></details></div>
 <details id="handoff-input-content" data-atom-id="handoff-input-content" hidden><summary>Input history privacy · optional</summary><p>Review locally captured runtime history. Categories stay out of the file until included; local draft fields are not recorded history.</p><div id="handoff-input-review" data-atom-id="handoff-input-review"></div></details>
 <details id="handoff-action-content" data-atom-id="handoff-action-content" hidden><summary>Interaction privacy · optional</summary><p>Recorded synchronous body history. Private fields stay out until included. Saved diagnostic references and content hashes remain; imported history never resumes collection.</p><div id="handoff-action-review" data-atom-id="handoff-action-review"></div></details>
 <div class="sp-atom-settings-actions"><button id="handoff-simple" data-atom-id="handoff-simple" class="sp-button-secondary" hidden>Use a simple report</button><button id="handoff-preview" data-atom-id="handoff-preview" class="sp-button-primary">Review report</button><button id="handoff-save" data-atom-id="handoff-save" class="sp-button-primary" disabled>Save reviewed report locally</button><button id="handoff-download" data-atom-id="handoff-download" class="sp-button-secondary" disabled>Download reviewed file</button></div>
 <p id="handoff-status" data-atom-id="handoff-status" class="sp-atom-hint" role="status"></p><section id="handoff-summary" data-atom-id="handoff-summary" class="sp-atom-handoff-preview" aria-label="Report preview"></section><details id="handoff-technical" data-atom-id="handoff-technical" hidden><summary>Reviewed technical details</summary><div id="handoff-technical-text" data-atom-id="handoff-technical-text" class="sp-atom-handoff-technical"></div></details>
<details id="handoff-source-comparisons" data-atom-id="handoff-source-comparisons" hidden><summary>Local source comparisons · historical</summary><div id="handoff-source-text" data-atom-id="handoff-source-text" class="sp-atom-handoff-technical"></div></details>\n<details id="handoff-input-outcomes" data-atom-id="handoff-input-outcomes" hidden><summary>Historical input outcomes</summary><div id="handoff-input-text" data-atom-id="handoff-input-text" class="sp-atom-handoff-technical"></div><details><summary>Input identities and locations</summary><div id="handoff-input-advanced" data-atom-id="handoff-input-advanced" class="sp-atom-handoff-technical"></div></details></details>
<details id="handoff-action-outcomes" data-atom-id="handoff-action-outcomes" hidden><summary>Historical interaction</summary><div id="handoff-action-text" data-atom-id="handoff-action-text" class="sp-atom-handoff-technical"></div><details><summary>Interaction identities and source details</summary><div id="handoff-action-advanced" data-atom-id="handoff-action-advanced" class="sp-atom-handoff-technical"></div></details></details>
</dialog>`;
const names=['title','actual','expected','steps','question'];
export function createHandoffUI({$,getSource,getCurrent,saveReviewed,download,now=Date.now}={}){
 if(typeof getSource!=='function'||typeof download!=='function')throw Error('Saved snapshot and download callbacks required');
 let available=false,contextKey=null,epoch=0,pending=null,sourceRaw=null,prepared=null,disposed=false,controlledCloses=0,readOnly=false,detailedReady=false,simpleAvailable=false,simpleMode=false,simpleReason='',currentAvailable=false,currentKey=null,currentMode=false,captureRaw=null,inputReady=false,actionReady=false;
 const review=createHandoffReview({document:$('handoff-content-review').ownerDocument,root:$('handoff-content-review'),onChange:()=>invalidate()});
 const inputReview=createHandoffReview({document:$('handoff-input-review').ownerDocument,root:$('handoff-input-review'),onChange:()=>invalidate()});
 const actionReview=createHandoffReview({document:$('handoff-action-review').ownerDocument,root:$('handoff-action-review'),onChange:()=>invalidate()});
 const text=(id,value)=>{$(id).textContent=value;};
 function current(token){return !disposed&&pending===token&&epoch===token.epoch&&!token.controller.signal.aborted;}
 function mode(saved){
  readOnly=saved;$('handoff-fields').hidden=saved;$('handoff-preview').hidden=saved;$('handoff-save').hidden=saved||typeof saveReviewed!=='function';
  text('handoff-origin-label',currentMode?'Current investigation':'Saved snapshot');text('handoff-heading',saved?'Saved issue report':currentMode?'Prepare current issue':'Prepare issue');text('handoff-cancel',saved?'Close':'Cancel');
  text('handoff-intro',saved?'Historical statements from the reporter. Claims are untrusted and have not been reverified.':currentMode?'Review the captured observation and recorded runtime input history. Local draft fields are excluded. Preparing this report does not apply inputs or read the app again. Private details stay out of the file until included.':'Review your description and choose any saved details to include. Private details are excluded by default. No observation window is recorded.');
 }
 function render(){
  if(disposed)return;if(!readOnly&&simpleAvailable&&!detailedReady&&!simpleMode&&!pending)text('handoff-status',simpleReason);
  $('handoff-simple').hidden=readOnly||!simpleAvailable||simpleMode;$('handoff-simple').disabled=!!pending;text('handoff-simple',currentMode?'Use simple report without input history':'Use a simple report');
  $('handoff-content-details').hidden=readOnly||simpleMode||!detailedReady;$('handoff-input-content').hidden=readOnly||!currentMode||simpleMode||!inputReady;$('handoff-action-content').hidden=readOnly||simpleMode||!actionReady;
  if(!readOnly&&simpleMode)text('handoff-intro','Simple report: your words and recorded condition. Technical details'+(currentMode?' and input history':'')+' and interaction history are excluded. No observation window is recorded.');
  review.busy(readOnly||pending?.kind==='source');inputReview.busy(readOnly||pending?.kind==='source');actionReview.busy(readOnly||pending?.kind==='source');
  for(const name of names){$('handoff-'+name).disabled=$('handoff-omit-'+name).disabled=readOnly||pending?.kind==='source';}
  $('handoff-open').disabled=!available||!!pending;$('handoff-current').disabled=typeof getCurrent!=='function'||!currentAvailable||!!pending;
  $('handoff-preview').disabled=readOnly||!sourceRaw||(!detailedReady&&!simpleMode)||!!pending;$('handoff-save').disabled=readOnly||!prepared||prepared.saved||!!pending||typeof saveReviewed!=='function';$('handoff-download').disabled=!prepared||!!pending;
 }
 function invalidate(message='Review your changes before saving or downloading.'){pending?.controller.abort();epoch++;pending=null;prepared=null;text('handoff-summary','');text('handoff-technical-text','');$('handoff-technical').hidden=true;text('handoff-source-text','');$('handoff-source-comparisons').hidden=true;text('handoff-input-text','');text('handoff-input-advanced','');$('handoff-input-outcomes').hidden=true;text('handoff-action-text','');text('handoff-action-advanced','');$('handoff-action-outcomes').hidden=true;text('handoff-status',message);render();}
 function cancel(){const wasOpen=$('handoff-dialog').open;invalidate('Dialog closed. Existing local snapshots and reports are unchanged.');sourceRaw=null;captureRaw=null;inputReady=false;actionReady=false;actionReview.clear();detailedReady=false;simpleAvailable=false;simpleMode=false;simpleReason='';review.clear();inputReview.clear();if(wasOpen){controlledCloses++;$('handoff-dialog').close();const trigger=readOnly?$('export-report'):$(currentMode?'handoff-current':'handoff-open');if(!trigger.disabled)trigger.focus();else if(!$('export-report').disabled)$('export-report').focus();}render();}
 function summary(record,parentStatus){
  const r=record.report,omitted=record.privacy.redactedIssueFields,label=k=>omitted.includes(k)?'Omitted during review':r.issue[k]||'Not supplied';
  const rows=['Title: '+label('title'),'What happened: '+label('actual'),'Expected: '+label('expected'),handoffConditionText(record),'Snapshot: '+r.sourceDiagnostic.freshness+' · '+(r.sourceDiagnostic.capturedAt===null?'capture time unknown':new Date(r.sourceDiagnostic.capturedAt).toISOString()),'No observation window recorded. Earlier history is unknown.','Steps: '+(omitted.includes('steps')?'Omitted during review':r.issue.steps.join(' → ')||'Not supplied'),'Question: '+label('question'),handoffTechnicalSummary(record)];
  if(handoffHasInputEvidence(record))rows.push(handoffInputSummary(record));
  if(record.profile==='action-evidence/1')rows.push(handoffActionSummary(record));
  if(record.additions.length)rows.push('Developer notes · unverified:\n'+record.additions.map(n=>n.text+'\n'+({'same-hash':'Same recorded build hash; not verification.','different-hash':'Different recorded build hash; no evidence match.','unknown':'Recorded build comparison is unknown.'}[n.buildRelation])).join('\n\n'));
  if(parentStatus==='not-checked')rows.push('Parent file unavailable; content continuity is not checked.');
  else if(parentStatus==='content-matched')rows.push('Parent content matches. These historical claims remain untrusted.');
  return rows.join('\n\n');
 }
 function present(record,parentStatus){text('handoff-summary',summary(record,parentStatus));text('handoff-technical-text',handoffTechnicalText(record));$('handoff-technical').hidden=handoffBaseProfile(record)!=='reviewed-snapshot/1';$('handoff-technical').open=false;text('handoff-source-text',handoffSourceEvidenceText(record));$('handoff-source-comparisons').hidden=!handoffHasSourceEvidence(record);$('handoff-source-comparisons').open=false;text('handoff-input-text',handoffInputText(record));text('handoff-input-advanced',handoffInputText(record,{advanced:true}));$('handoff-input-outcomes').hidden=!handoffHasInputEvidence(record);$('handoff-input-outcomes').open=false;text('handoff-action-text',handoffActionText(record));text('handoff-action-advanced',handoffActionText(record,{advanced:true}));$('handoff-action-outcomes').hidden=record.profile!=='action-evidence/1';$('handoff-action-outcomes').open=false;}
 function begin(kind){const token={epoch,kind,controller:new AbortController()};pending=token;render();return token;}
 async function open(currentSource){
  if(disposed||pending||(currentSource?!currentAvailable||typeof getCurrent!=='function':!available))return;
  currentMode=currentSource;invalidate('Preparing a historical source for review…');mode(false);sourceRaw=null;captureRaw=null;inputReady=false;actionReady=false;actionReview.clear();detailedReady=false;simpleAvailable=false;simpleMode=false;simpleReason='';review.clear();inputReview.clear();
  const token=begin('source');if(!$('handoff-dialog').open)$('handoff-dialog').showModal();$('handoff-heading').focus();
  try{
   let raw;
   if(currentSource){const reply=await getCurrent({signal:token.controller.signal});if(!current(token))return;if(reply?.schema!=='stateatom.input-outcome-capture/1'||reply.exportable!==false||reply.executable!==false||typeof reply.diagnosticRaw!=='string')throw Error('Unsupported private capture; use a saved snapshot instead.');raw=reply.diagnosticRaw;captureRaw=JSON.stringify(reply);}
   else raw=await getSource({signal:token.controller.signal});
   if(!current(token))return;const r=parseDiagnostic(raw);sourceRaw=raw;
   try{
    const model=await createHandoffContentReview(raw,r.runtime.actionObservation?{separateActionEvidence:true}:{});if(!current(token))return;review.source(model.catalogue());
    if(r.runtime.actionObservation){const actions=await createHandoffActionReview(raw);if(!current(token))return;actionReview.source(actions.catalogue());actionReady=true;}
    if(currentSource){const full=await createHandoffInputEvidence(captureRaw,{includeCategories:['inputIdentities','inputValues','inputLocations','inputErrors']},{now});const packet=(await parseHandoffInputEvidence(full)).record;if(!current(token))return;inputReview.inputSource(packet);inputReady=true;}
    detailedReady=true;
   }catch(e){if(!['HANDOFF_LIMIT','UNSUPPORTED_HANDOFF_EVIDENCE'].includes(e.code))throw e;if(!current(token))return;simpleAvailable=true;simpleReason=(e.code==='UNSUPPORTED_HANDOFF_EVIDENCE'?e.message:'This capture exceeds the detailed-review limit.')+' You can explicitly choose a simple report without technical details'+(currentSource?' or input history':'')+'; your description is kept.';}
   if(!$('handoff-title').value)$('handoff-title').value='Selected '+r.target.property+' condition';
   text('handoff-source',currentSource?'Original selected '+(r.target.property==='disabled'?'disabled = '+r.target.value:'text observation')+' · '+r.freshness+' · '+(r.capturedAt===null?'observation time unknown':new Date(r.capturedAt).toISOString())+'. No new app observation.':(r.target.property==='text'?'Saved text snapshot · historical condition.':'Saved disabled snapshot · selected condition = '+r.target.value));text('handoff-status',detailedReady?'Describe the discrepancy, then review the exact report before saving or downloading.':simpleReason);
  }catch(e){if(current(token)){sourceRaw=null;captureRaw=null;inputReady=false;actionReady=false;actionReview.clear();inputReview.clear();text('handoff-status',e.message+' You can prepare a previously saved snapshot separately. Your description is kept.');}}
  finally{if(pending===token){pending=null;render();}}
 }
 $('handoff-open').onclick=()=>open(false);
 $('handoff-current').onclick=()=>open(true);
 for(const k of names){$('handoff-'+k).oninput=()=>invalidate();$('handoff-omit-'+k).onchange=()=>invalidate();}
 $('handoff-preview').onclick=async()=>{
  if(disposed||readOnly||!sourceRaw||(!detailedReady&&!simpleMode)||pending)return;prepared=null;const source=sourceRaw,capture=captureRaw,withInputs=currentMode&&!simpleMode,withActions=actionReady&&!simpleMode,fields=Object.fromEntries(names.map(k=>[k,k==='steps'?$('handoff-steps').value.split('\n').filter(s=>s.length):$('handoff-'+k).value])),omitIssueFields=names.filter(k=>$('handoff-omit-'+k).checked),token=begin();text('handoff-status','Preparing a historical report…');let phase='inputs';
  try{
   const content=review.read(),inputChoices=withInputs?inputReview.read():null,actionChoices=withActions?actionReview.read():null,actor=await createHandoffDraft(source,fields,{now}),frozen=await actor.freeze({expectedRevision:0});phase='codec';
   let raw=simpleMode?await createHandoffReport(source,JSON.stringify(frozen.baseline),{omitIssueFields},{now}):await createReviewedHandoffReport(source,JSON.stringify(frozen.baseline),{omitIssueFields,content,...(withActions?{separateActionEvidence:true}:{})},{now});
   if(withInputs){const packet=await createHandoffInputEvidence(capture,inputChoices,{now});raw=await composeHandoffInputReport(raw,packet,{expectedParentDigest:await handoffArtifactDigest(raw),now});}
   if(withActions){const packet=await createHandoffActionEvidence(source,actionChoices,{now});raw=await composeHandoffActionReport(raw,packet,{expectedParentDigest:await handoffArtifactDigest(raw),now});}
   const {record}=await parseHandoffReport(raw),digest=await handoffArtifactDigest(raw);if(!current(token))return;prepared={raw,id:record.id,digest,saved:false};present(record);text('handoff-status','Review your words and exclusions. Save keeps a local file; downloading does not send it.');
  }
  catch(e){if(current(token)){if(e.code==='HANDOFF_LIMIT'&&phase==='codec'&&!simpleMode){simpleAvailable=true;text('handoff-status',e.message+' You can explicitly choose a simple report without technical details'+(currentMode?' or input history':'')+', then review again.');}else text('handoff-status',e.message);}}
  finally{if(pending===token){pending=null;render();}}
 };
 $('handoff-simple').onclick=()=>{if(disposed||readOnly||pending||!sourceRaw||!simpleAvailable)return;simpleMode=true;captureRaw=null;inputReady=false;actionReady=false;actionReview.clear();review.clear();inputReview.clear();invalidate('Simple report selected. Technical details, input history and interaction history will be excluded. Review your description and recorded condition again.');};
 $('handoff-save').onclick=async()=>{
  if(disposed||readOnly||!prepared||prepared.saved||pending||typeof saveReviewed!=='function')return;const snapshot=prepared,document=$('handoff-dialog').ownerDocument,restoreFocus=document.activeElement===$('handoff-save'),token=begin();text('handoff-status','Saving the reviewed report locally…');
  try{const result=await saveReviewed(snapshot.raw,{signal:token.controller.signal});if(!current(token))return;if(!['saved','unchanged'].includes(result?.status)||result.entry?.id!==snapshot.id||result.entry?.digest!==snapshot.digest)throw Error('Save was not confirmed for this exact file; reopen local reports to check.');snapshot.saved=true;text('handoff-status',(result.status==='unchanged'?'Identical report already saved locally.':'Saved locally; not sent.')+(result.evicted?.length?' Oldest local reports removed by retention: '+result.evicted.length+'.':''));}
  catch(e){if(current(token))text('handoff-status','Save was not confirmed: '+e.message+' Reopen local reports before retrying if the reply was lost.');}
  finally{if(pending===token){pending=null;render();const active=document.activeElement;if(restoreFocus&&$('handoff-dialog').open&&(!active||active===document.body||active===document.documentElement||active===$('handoff-save')&&active.disabled)){const next=prepared===snapshot&&snapshot.saved?$('handoff-download'):$('handoff-save');if(!next.disabled)next.focus();}}}
 };
 $('handoff-download').onclick=()=>{if(disposed||!prepared||pending)return;try{download(prepared.raw,'stateatom-issue-'+prepared.id+'.stateatom.json');text('handoff-status','File downloaded; not sent. Original saved files unchanged.');}catch(e){text('handoff-status',e.message);}};
 $('handoff-cancel').onclick=cancel;
 $('handoff-dialog').addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();cancel();});
 $('handoff-dialog').addEventListener('close',()=>{if(controlledCloses){controlledCloses--;return;}if(!disposed){pending?.controller.abort();epoch++;pending=null;sourceRaw=null;captureRaw=null;inputReady=false;actionReady=false;actionReview.clear();inputReview.clear();prepared=null;render();}});
 $('handoff-dialog').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...$('handoff-dialog').querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),summary')].filter(n=>{if(n.hidden||!n.getClientRects().length)return false;for(let child=n,parent=n.parentElement;parent;child=parent,parent=parent.parentElement){if(parent.hidden)return false;if(parent.tagName==='DETAILS'&&!parent.open&&child!==[...parent.children].find(e=>e.tagName==='SUMMARY'))return false;}return true;}),first=nodes[0],last=nodes.at(-1),focused=$('handoff-dialog').ownerDocument.activeElement;if(!first)return;if(e.shiftKey&&(focused===first||focused===$('handoff-heading'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&focused===last){e.preventDefault();first.focus();}});
 mode(false);render();return Object.freeze({
  update(next){if(disposed)return;if(contextKey!==next.contextKey){if(!currentMode||readOnly)cancel();contextKey=next.contextKey;}available=next.available===true;render();},
  updateCurrent(next){if(disposed)return;if(currentKey!==next.contextKey){if(currentMode&&!readOnly)cancel();currentKey=next.contextKey;}currentAvailable=next.available===true;render();},
  async openSaved(raw,options={}){
   if(disposed)return;currentMode=false;invalidate('Opening a saved historical report…');mode(true);sourceRaw=null;captureRaw=null;inputReady=false;actionReady=false;actionReview.clear();inputReview.clear();detailedReady=false;simpleAvailable=false;simpleMode=false;simpleReason='';review.clear();const token=begin();if(!$('handoff-dialog').open)$('handoff-dialog').showModal();$('handoff-heading').focus();
   try{const {record,parentStatus}=await parseHandoffReport(raw,options);if(!current(token))return;prepared={raw,id:record.id,saved:true};text('handoff-source','Saved historical report · '+record.report.sourceDiagnostic.freshness);present(record,parentStatus);text('handoff-status','Historical, untrusted report; not reverified. Download preserves this original file.');}
   catch(e){if(current(token))text('handoff-status',e.message);}
   finally{if(pending===token){pending=null;render();}}
  },
  dispose(){if(disposed)return;cancel();disposed=true;}
 });
}
