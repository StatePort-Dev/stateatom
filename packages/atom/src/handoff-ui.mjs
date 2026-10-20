// SPDX-License-Identifier: Apache-2.0
// Readable minimal issue derivative of an explicitly saved v1 snapshot.
import{parseDiagnostic}from'../../../core/diagnostic.mjs';
import{createHandoffDraft}from'../../../core/handoff-draft.mjs';
import{createHandoffReport,parseHandoffReport,handoffArtifactDigest}from'../../../core/handoff-report.mjs';
export const handoffButton='<button id="handoff-open" data-atom-id="handoff-open" class="sp-button-primary" disabled title="Save a snapshot locally first">Prepare issue</button>';
export const handoffImport='<button id="report-refresh" data-atom-id="report-refresh" class="sp-button-secondary">Refresh local files</button><label class="sp-atom-report-import">Import a report file locally<input id="report-import" data-atom-id="report-import" type="file" accept=".json,.stateatom.json,application/json"></label>';
export const handoffTemplate=`<dialog id="handoff-dialog" data-atom-id="handoff-dialog" class="sp-atom-settings sp-atom-handoff" aria-labelledby="handoff-heading">
 <div class="sp-atom-settings-head"><div><p class="sp-section-title">Saved snapshot</p><h2 id="handoff-heading" data-atom-id="handoff-heading" tabindex="-1">Prepare issue</h2></div><button id="handoff-cancel" data-atom-id="handoff-cancel" class="sp-button-secondary">Cancel</button></div>
 <p id="handoff-source" data-atom-id="handoff-source" class="sp-atom-hint"></p>
 <p id="handoff-intro" data-atom-id="handoff-intro">Your description and the selected condition form a simple historical report. Source, responses and recorded actions are excluded. No observation window is recorded.</p>
 <div id="handoff-fields" data-atom-id="handoff-fields"><label>Issue title<input id="handoff-title" data-atom-id="handoff-title" maxlength="160"></label>
 <label>What happened<textarea id="handoff-actual" data-atom-id="handoff-actual" maxlength="1024" rows="2"></textarea></label>
 <label>Expected behavior<textarea id="handoff-expected" data-atom-id="handoff-expected" maxlength="1024" rows="2"></textarea></label>
 <details><summary>Steps and question · optional</summary><label>Steps I performed · one per line<textarea id="handoff-steps" data-atom-id="handoff-steps" maxlength="4103" rows="3"></textarea></label><label>Question for the developer<textarea id="handoff-question" data-atom-id="handoff-question" maxlength="1024" rows="2"></textarea></label></details>
 <details><summary>Privacy review</summary><p>Review your words for private information. Omitted fields stay out of the downloaded file; the saved snapshot is unchanged.</p>
 ${['title','actual','expected','steps','question'].map(k=>'<label class="sp-atom-content-option"><input type="checkbox" id="handoff-omit-'+k+'" data-atom-id="handoff-omit-'+k+'">Omit '+({actual:'what happened',expected:'expected behavior'}[k]||k)+'</label>').join('')}
 </details></div>
 <div class="sp-atom-settings-actions"><button id="handoff-preview" data-atom-id="handoff-preview" class="sp-button-primary">Review report</button><button id="handoff-save" data-atom-id="handoff-save" class="sp-button-primary" disabled>Save reviewed report locally</button><button id="handoff-download" data-atom-id="handoff-download" class="sp-button-secondary" disabled>Download reviewed file</button></div>
 <p id="handoff-status" data-atom-id="handoff-status" class="sp-atom-hint" role="status"></p><section id="handoff-summary" data-atom-id="handoff-summary" class="sp-atom-handoff-preview" aria-label="Report preview"></section>
</dialog>`;
const names=['title','actual','expected','steps','question'];
export function createHandoffUI({$,getSource,saveReviewed,download,now=Date.now}={}){
 if(typeof getSource!=='function'||typeof download!=='function')throw Error('Saved snapshot and download callbacks required');
 let available=false,contextKey=null,epoch=0,pending=null,sourceRaw=null,prepared=null,disposed=false,controlledCloses=0,readOnly=false;
 const text=(id,value)=>{$(id).textContent=value;};
 function current(token){return !disposed&&pending===token&&epoch===token.epoch&&!token.controller.signal.aborted;}
 function mode(saved){readOnly=saved;$('handoff-fields').hidden=saved;$('handoff-preview').hidden=saved;$('handoff-save').hidden=saved||typeof saveReviewed!=='function';text('handoff-heading',saved?'Saved issue report':'Prepare issue');text('handoff-cancel',saved?'Close':'Cancel');text('handoff-intro',saved?'Historical statements from the reporter. Claims are untrusted and have not been reverified.':'Your description and the selected condition form a simple historical report. Source, responses and recorded actions are excluded. No observation window is recorded.');}
 function render(){if(disposed)return;for(const name of names){$('handoff-'+name).disabled=$('handoff-omit-'+name).disabled=readOnly||pending?.kind==='source';}$('handoff-open').disabled=!available||!!pending;$('handoff-preview').disabled=readOnly||!sourceRaw||!!pending;$('handoff-save').disabled=readOnly||!prepared||prepared.saved||!!pending||typeof saveReviewed!=='function';$('handoff-download').disabled=!prepared||!!pending;}
 function invalidate(message='Review your changes before saving or downloading.'){pending?.controller.abort();epoch++;pending=null;prepared=null;text('handoff-summary','');text('handoff-status',message);render();}
 function cancel(){const wasOpen=$('handoff-dialog').open;invalidate('Dialog closed. Existing local snapshots and reports are unchanged.');sourceRaw=null;if(wasOpen){controlledCloses++;$('handoff-dialog').close();const trigger=readOnly?$('export-report'):$('handoff-open');if(!trigger.disabled)trigger.focus();else if(!$('export-report').disabled)$('export-report').focus();}render();}
 function summary(record,parentStatus){
  const r=record.report,omitted=record.privacy.redactedIssueFields,label=k=>omitted.includes(k)?'Omitted during review':r.issue[k]||'Not supplied';
  const rows=['Title: '+label('title'),'What happened: '+label('actual'),'Expected: '+label('expected'),r.target.property==='text'?'Selected text: excluded from this report.':'Selected disabled = '+r.target.value.value,'Snapshot: '+r.sourceDiagnostic.freshness+' · '+(r.sourceDiagnostic.capturedAt===null?'capture time unknown':new Date(r.sourceDiagnostic.capturedAt).toISOString()),'No observation window recorded. Earlier history is unknown.','Steps: '+(omitted.includes('steps')?'Omitted during review':r.issue.steps.join(' → ')||'Not supplied'),'Question: '+label('question'),'Source, responses and recorded actions are excluded. Historical claims are not reverified.'];
  if(record.additions.length)rows.push('Developer notes · unverified:\n'+record.additions.map(n=>n.text+'\n'+({'same-hash':'Same recorded build hash; not verification.','different-hash':'Different recorded build hash; no evidence match.','unknown':'Recorded build comparison is unknown.'}[n.buildRelation])).join('\n\n'));
  if(parentStatus==='not-checked')rows.push('Parent file unavailable; content continuity is not checked.');
  else if(parentStatus==='content-matched')rows.push('Parent content matches. These historical claims remain untrusted.');
  return rows.join('\n\n');
 }
 function begin(kind){const token={epoch,kind,controller:new AbortController()};pending=token;render();return token;}
 $('handoff-open').onclick=async()=>{
  if(disposed||!available||pending)return;invalidate('Preparing the selected saved snapshot…');mode(false);sourceRaw=null;const token=begin('source');if(!$('handoff-dialog').open)$('handoff-dialog').showModal();$('handoff-heading').focus();
  try{const raw=await getSource({signal:token.controller.signal});if(!current(token))return;const r=parseDiagnostic(raw);sourceRaw=raw;if(!$('handoff-title').value)$('handoff-title').value='Selected '+r.target.property+' condition';text('handoff-source',r.target.property==='text'?'Saved text snapshot · selected text is excluded.':'Saved disabled snapshot · selected condition = '+r.target.value);text('handoff-status','Describe the discrepancy, then review the exact report before saving or downloading.');}
  catch(e){if(current(token))text('handoff-status',e.message);}
  finally{if(pending===token){pending=null;render();}}
 };
 for(const k of names){$('handoff-'+k).oninput=()=>invalidate();$('handoff-omit-'+k).onchange=()=>invalidate();}
 $('handoff-preview').onclick=async()=>{
  if(disposed||readOnly||!sourceRaw||pending)return;prepared=null;const source=sourceRaw,fields=Object.fromEntries(names.map(k=>[k,k==='steps'?$('handoff-steps').value.split('\n').filter(s=>s.length):$('handoff-'+k).value])),omitIssueFields=names.filter(k=>$('handoff-omit-'+k).checked),token=begin();text('handoff-status','Preparing a historical report…');
  try{const actor=await createHandoffDraft(source,fields,{now}),frozen=await actor.freeze({expectedRevision:0}),raw=await createHandoffReport(source,JSON.stringify(frozen.baseline),{omitIssueFields},{now}),{record}=await parseHandoffReport(raw),digest=await handoffArtifactDigest(raw);if(!current(token))return;prepared={raw,id:record.id,digest,saved:false};text('handoff-summary',summary(record));text('handoff-status','Review your words and exclusions. Save keeps a local file; downloading does not send it.');}
  catch(e){if(current(token))text('handoff-status',e.message);}
  finally{if(pending===token){pending=null;render();}}
 };
 $('handoff-save').onclick=async()=>{
  if(disposed||readOnly||!prepared||prepared.saved||pending||typeof saveReviewed!=='function')return;const snapshot=prepared,token=begin();text('handoff-status','Saving the reviewed report locally…');
  try{const result=await saveReviewed(snapshot.raw,{signal:token.controller.signal});if(!current(token))return;if(!['saved','unchanged'].includes(result?.status)||result.entry?.id!==snapshot.id||result.entry?.digest!==snapshot.digest)throw Error('Save was not confirmed for this exact file; reopen local reports to check.');snapshot.saved=true;text('handoff-status',(result.status==='unchanged'?'Identical report already saved locally.':'Saved locally; not sent.')+(result.evicted?.length?' Oldest local reports removed by retention: '+result.evicted.length+'.':''));}
  catch(e){if(current(token))text('handoff-status','Save was not confirmed: '+e.message+' Reopen local reports before retrying if the reply was lost.');}
  finally{if(pending===token){pending=null;render();}}
 };
 $('handoff-download').onclick=()=>{if(disposed||!prepared||pending)return;try{download(prepared.raw,'stateatom-issue-'+prepared.id+'.stateatom.json');text('handoff-status','File downloaded; not sent. Original saved files unchanged.');}catch(e){text('handoff-status',e.message);}};
 $('handoff-cancel').onclick=cancel;
 $('handoff-dialog').addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();cancel();});
 $('handoff-dialog').addEventListener('close',()=>{if(controlledCloses){controlledCloses--;return;}if(!disposed){pending?.controller.abort();epoch++;pending=null;sourceRaw=null;prepared=null;render();}});
 $('handoff-dialog').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...$('handoff-dialog').querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),summary')].filter(n=>!n.hidden&&n.getClientRects().length),first=nodes[0],last=nodes.at(-1),focused=$('handoff-dialog').ownerDocument.activeElement;if(!first)return;if(e.shiftKey&&(focused===first||focused===$('handoff-heading'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&focused===last){e.preventDefault();first.focus();}});
 mode(false);render();return Object.freeze({
  update(next){if(disposed)return;if(contextKey!==next.contextKey){cancel();contextKey=next.contextKey;}available=next.available===true;render();},
  async openSaved(raw,options={}){
   if(disposed)return;invalidate('Opening a saved historical report…');mode(true);sourceRaw=null;const token=begin();if(!$('handoff-dialog').open)$('handoff-dialog').showModal();$('handoff-heading').focus();
   try{const {record,parentStatus}=await parseHandoffReport(raw,options);if(!current(token))return;prepared={raw,id:record.id,saved:true};text('handoff-source','Saved historical report · '+record.report.sourceDiagnostic.freshness);text('handoff-summary',summary(record,parentStatus));text('handoff-status','Historical, untrusted report; not reverified. Download preserves this original file.');}
   catch(e){if(current(token))text('handoff-status',e.message);}
   finally{if(pending===token){pending=null;render();}}
  },
  dispose(){if(disposed)return;cancel();disposed=true;}
 });
}
