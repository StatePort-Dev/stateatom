// SPDX-License-Identifier: Apache-2.0
// Readable minimal issue derivative of an explicitly saved v1 snapshot.
import{parseDiagnostic}from'../../../core/diagnostic.mjs';
import{createHandoffDraft}from'../../../core/handoff-draft.mjs';
import{createHandoffReport,parseHandoffReport}from'../../../core/handoff-report.mjs';
export const handoffButton='<button id="handoff-open" data-atom-id="handoff-open" class="sp-button-primary" disabled title="Save a snapshot locally first">Prepare issue</button>';
export const handoffTemplate=`<dialog id="handoff-dialog" data-atom-id="handoff-dialog" class="sp-atom-settings sp-atom-handoff" aria-labelledby="handoff-heading">
 <div class="sp-atom-settings-head"><div><p class="sp-section-title">Saved snapshot</p><h2 id="handoff-heading" data-atom-id="handoff-heading" tabindex="-1">Prepare issue</h2></div><button id="handoff-cancel" data-atom-id="handoff-cancel" class="sp-button-secondary">Cancel</button></div>
 <p id="handoff-source" data-atom-id="handoff-source" class="sp-atom-hint"></p>
 <p>Your description and the selected condition form a simple historical report. Source, responses and recorded actions are excluded. No observation window is recorded.</p>
 <label>Issue title<input id="handoff-title" data-atom-id="handoff-title" maxlength="160"></label>
 <label>What happened<textarea id="handoff-actual" data-atom-id="handoff-actual" maxlength="1024" rows="2"></textarea></label>
 <label>Expected behavior<textarea id="handoff-expected" data-atom-id="handoff-expected" maxlength="1024" rows="2"></textarea></label>
 <details><summary>Steps and question · optional</summary><label>Steps I performed · one per line<textarea id="handoff-steps" data-atom-id="handoff-steps" maxlength="4103" rows="3"></textarea></label><label>Question for the developer<textarea id="handoff-question" data-atom-id="handoff-question" maxlength="1024" rows="2"></textarea></label></details>
 <details><summary>Privacy review</summary><p>Review your words for private information. Omitted fields stay out of the downloaded file; the saved snapshot is unchanged.</p>
 ${['title','actual','expected','steps','question'].map(k=>'<label class="sp-atom-content-option"><input type="checkbox" id="handoff-omit-'+k+'" data-atom-id="handoff-omit-'+k+'">Omit '+({actual:'what happened',expected:'expected behavior'}[k]||k)+'</label>').join('')}
 </details>
 <div class="sp-atom-settings-actions"><button id="handoff-preview" data-atom-id="handoff-preview" class="sp-button-primary">Review report</button><button id="handoff-download" data-atom-id="handoff-download" class="sp-button-primary" disabled>Download reviewed file</button></div>
 <p id="handoff-status" data-atom-id="handoff-status" class="sp-atom-hint" role="status"></p><section id="handoff-summary" data-atom-id="handoff-summary" class="sp-atom-handoff-preview" aria-label="Report preview"></section>
</dialog>`;
const names=['title','actual','expected','steps','question'];
export function createHandoffUI({$,getSource,download,now=Date.now}={}){
 if(typeof getSource!=='function'||typeof download!=='function')throw Error('Saved snapshot and download callbacks required');
 let available=false,contextKey=null,epoch=0,pending=null,sourceRaw=null,prepared=null,disposed=false,controlledCloses=0;
 const text=(id,value)=>{$(id).textContent=value;};
 function render(){if(disposed)return;$('handoff-open').disabled=!available||!!pending;$('handoff-preview').disabled=!sourceRaw||!!pending;$('handoff-download').disabled=!prepared||!!pending;}
 function invalidate(message='Review your changes before downloading.'){epoch++;pending=null;prepared=null;text('handoff-summary','');text('handoff-status',message);render();}
 function cancel(){const wasOpen=$('handoff-dialog').open;invalidate('No file downloaded.');sourceRaw=null;if(wasOpen){controlledCloses++;$('handoff-dialog').close();$('handoff-open').focus();}render();}
 function summary(record){const r=record.report,omitted=record.privacy.redactedIssueFields,label=k=>omitted.includes(k)?'Omitted during review':r.issue[k]||'Not supplied';return['Title: '+label('title'),'What happened: '+label('actual'),'Expected: '+label('expected'),r.target.property==='text'?'Selected text: excluded from this report.':'Selected disabled = '+r.target.value.value,'Snapshot: '+r.sourceDiagnostic.freshness+' · '+(r.sourceDiagnostic.capturedAt===null?'capture time unknown':new Date(r.sourceDiagnostic.capturedAt).toISOString()),'No observation window recorded. Earlier history is unknown.','Steps: '+(omitted.includes('steps')?'Omitted during review':r.issue.steps.join(' → ')||'Not supplied'),'Question: '+label('question'),'Source, responses and recorded actions are excluded. Historical claims are not reverified.'].join('\n\n');}
 $('handoff-open').onclick=async()=>{
  if(disposed||!available||pending)return;invalidate('Preparing the selected saved snapshot…');sourceRaw=null;const token={epoch};pending=token;$('handoff-dialog').showModal();$('handoff-heading').focus();render();
  try{const raw=await getSource();if(disposed||pending!==token||epoch!==token.epoch)return;const r=parseDiagnostic(raw);sourceRaw=raw;if(!$('handoff-title').value)$('handoff-title').value='Selected '+r.target.property+' condition';text('handoff-source',r.target.property==='text'?'Saved text snapshot · selected text is excluded.':'Saved disabled snapshot · selected condition = '+r.target.value);text('handoff-status','Describe the discrepancy, then review the exact report before downloading.');}
  catch(e){if(!disposed&&pending===token)text('handoff-status',e.message);}
  finally{if(pending===token){pending=null;render();}}
 };
 for(const k of names){$('handoff-'+k).oninput=()=>invalidate();$('handoff-omit-'+k).onchange=()=>invalidate();}
 $('handoff-preview').onclick=async()=>{
  if(disposed||!sourceRaw||pending)return;prepared=null;const token={epoch};pending=token;render();text('handoff-status','Preparing a historical report…');
  try{const fields=Object.fromEntries(names.map(k=>[k,k==='steps'?$('handoff-steps').value.split('\n').filter(s=>s.length):$('handoff-'+k).value])),actor=await createHandoffDraft(sourceRaw,fields,{now}),frozen=await actor.freeze({expectedRevision:0}),raw=await createHandoffReport(sourceRaw,JSON.stringify(frozen.baseline),{omitIssueFields:names.filter(k=>$('handoff-omit-'+k).checked)},{now}),{record}=await parseHandoffReport(raw);if(disposed||pending!==token||epoch!==token.epoch)return;prepared={raw,id:record.id};text('handoff-summary',summary(record));text('handoff-status','Review your words and exclusions. Downloading does not send this file to anyone.');}
  catch(e){if(!disposed&&pending===token)text('handoff-status',e.message);}
  finally{if(pending===token){pending=null;render();}}
 };
 $('handoff-download').onclick=()=>{if(disposed||!prepared||pending)return;try{download(prepared.raw,'stateatom-issue-'+prepared.id+'.stateatom.json');text('handoff-status','File downloaded; not sent. Original saved snapshot unchanged.');}catch(e){text('handoff-status',e.message);}};
 $('handoff-cancel').onclick=cancel;
 $('handoff-dialog').addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();cancel();});
 $('handoff-dialog').addEventListener('close',()=>{if(controlledCloses){controlledCloses--;return;}if(!disposed){epoch++;pending=null;sourceRaw=null;prepared=null;render();}});
 $('handoff-dialog').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...$('handoff-dialog').querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled]),summary')].filter(n=>!n.hidden&&n.getClientRects().length),first=nodes[0],last=nodes.at(-1),focused=$('handoff-dialog').ownerDocument.activeElement;if(!first)return;if(e.shiftKey&&(focused===first||focused===$('handoff-heading'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&focused===last){e.preventDefault();first.focus();}});
 render();return Object.freeze({update(next){if(disposed)return;if(contextKey!==next.contextKey){cancel();contextKey=next.contextKey;}available=next.available===true;render();},dispose(){if(disposed)return;cancel();disposed=true;}});
}
