// SPDX-License-Identifier: Apache-2.0
// View-bound Settings. Tickets/results come from the live host, never storage.
export const productionSettingsButton='<button id="settings-toggle" data-atom-id="settings-toggle" class="sp-icon-button" aria-label="Settings" title="Settings"><svg class="sp-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="white"/><circle cx="16" cy="17" r="3" fill="white"/></svg></button>';
export const productionStateTemplate='<div id="production-state" data-atom-id="production-state" class="sp-atom-production-state" hidden><span id="production-state-text" data-atom-id="production-state-text" role="status"></span><button id="production-revoke" data-atom-id="production-revoke" class="sp-button-subtle" hidden>Return to read-only</button></div>';
const siteSettingsTemplate=`<section id="site-settings" data-atom-id="site-settings"><h3>Inspection</h3><div class="sp-atom-toolbar sp-toolbar"><label>Inspected tab <select id="tabs" data-atom-id="tabs" aria-label="Inspected tab"></select></label><button id="refresh-tabs" data-atom-id="refresh-tabs" class="sp-button-secondary">Refresh tabs</button><button id="detach" data-atom-id="detach" class="sp-button-secondary">Stop inspecting</button></div><details id="site-permissions-details" data-atom-id="site-permissions-details"><summary>Advanced site permissions</summary><fieldset><legend>Site permissions · this browser session</legend><p id="site-origin" data-atom-id="site-origin"></p><label>Inspection mode <select id="site-mode" data-atom-id="site-mode"><option value="read-only">Read-only</option><option value="development">Trusted development (HTTP only)</option></select></label><p>Changes apply to this exact origin. Atom reconnects this tab and refreshes the selected element. Cache resets and experiments are separate from ordinary editing.</p><label><input type="checkbox" id="site-cache" data-atom-id="site-cache"> Clear browser cache and this app’s storage; disable cache</label><label><input type="checkbox" id="site-reload" data-atom-id="site-reload"> Reload this app</label><label><input type="checkbox" id="site-override" data-atom-id="site-override"> Overlay selected network responses</label><label><input type="checkbox" id="site-replay" data-atom-id="site-replay"> Replay programmatic app actions during trials</label><button id="save-site" data-atom-id="save-site">Save site permissions</button><button id="forget-site" data-atom-id="forget-site">Forget site permissions</button></fieldset></details><p id="site-status" data-atom-id="site-status" class="sp-atom-hint" role="status"></p></section>`;
export const productionSettingsTemplate=`
<dialog id="production-dialog" data-atom-id="production-dialog" class="sp-atom-settings" aria-labelledby="production-title">
 <div class="sp-atom-settings-head"><div><h2 id="production-title" data-atom-id="production-title" tabindex="-1">Settings</h2></div><button id="production-back" data-atom-id="production-back" class="sp-button-secondary">Back to inspector</button></div>
 <p id="production-origin" data-atom-id="production-origin" class="sp-atom-settings-origin"></p>
 <p id="production-step" data-atom-id="production-step" class="sp-atom-hint" aria-live="polite"></p>
 <section id="production-overview" data-atom-id="production-overview"><h3 id="production-current" data-atom-id="production-current">Read-only</h3><p>Inspection stays read-only. You can separately allow supported input changes for this page.</p><dl class="sp-atom-settings-scope"><dt>Target</dt><dd>Only this tab and its current page</dd><dt>Changes</dt><dd>Supported form controls and recorded JSON response fields</dd><dt>Lifetime</dt><dd>10 minutes; ends on reload, navigation, tab switch or closing this inspector</dd></dl><p>Enabling permission does not change inputs, reload the app or clear data. Local undo cannot undo server changes.</p><div class="sp-atom-settings-actions"><button id="production-start" data-atom-id="production-start" class="sp-button-primary">Enable changes…</button><button id="production-attach" data-atom-id="production-attach" class="sp-button-primary" hidden>Attach this tab</button><button id="production-settings-revoke" data-atom-id="production-settings-revoke" hidden>Return to read-only</button></div></section>
 ${siteSettingsTemplate}
 <section id="production-risk" data-atom-id="production-risk" hidden><h3>Your edits can have real effects</h3><ul class="sp-atom-permission-effects"><li>Changing a field can trigger app actions and server requests.</li><li>Replacing a response changes the data this browser receives.</li><li>Undo cannot reverse server changes.</li></ul><p>Continue only on a page you are authorized to change.</p></section>
 <section id="production-scope" data-atom-id="production-scope" hidden><h3>Confirm this page and its limits</h3><p id="production-scope-origin" data-atom-id="production-scope-origin" class="sp-atom-settings-origin"></p><dl class="sp-atom-settings-scope"><dt>Scope</dt><dd>This tab's current page only; no other tabs or API origins</dd><dt>Allowed</dt><dd>Supported native controls and JSON response fields in Live or Draft</dd><dt>Ends</dt><dd>After 10 minutes, reload/navigation, tab switch or closing this inspector</dd></dl><p>Undo is revision-checked and may refuse an external change. It does not undo server effects. Enabling performs no input edit, request, reload or data reset.</p></section>
 <p id="production-note" data-atom-id="production-note" class="sp-atom-hint" role="status" aria-live="polite"></p>
 <div class="sp-atom-settings-actions"><button id="production-cancel" data-atom-id="production-cancel" hidden>Cancel</button><button id="production-next" data-atom-id="production-next" class="sp-button-primary" hidden>I understand · Continue</button><button id="production-confirm" data-atom-id="production-confirm" class="sp-button-primary" hidden>Enable for 10 minutes</button></div>
</dialog>`;
const defaultClock={now:()=>Date.now(),setTimeout:(...a)=>globalThis.setTimeout(...a),clearTimeout:id=>globalThis.clearTimeout(id)};
const message=e=>({STALE_CONFIRMATION:'The page changed or confirmation expired. Review again.',INVALID_CONFIRMATION:'This confirmation belongs to another view or step.',CLEANUP_UNCONFIRMED:'Native cleanup is unconfirmed. Return to read-only and reconnect explicitly.',INSPECTOR_DISCONNECTED:'Inspector disconnected. Reopen it to continue.',CAPABILITY_DENIED:'Current change permission is unavailable. Review Settings again.'})[e?.code]||e?.message||'Settings operation failed';
export function createProductionUI({$,client,onRefresh=async()=>{},onAttach=async()=>{},prepareEnable=()=>null,onEnabled,clock=defaultClock}={}){
 if(typeof client?.request!=='function')throw Error('Settings client required');
 const ownerId=crypto.randomUUID();let recovery=null,state=null,scope=null,stage='overview',ticket=null,busy=null,pending=null,epoch=0,disposed=false,lost=false,error=null,timer=null,deadline=0,grantId=null,expiryRequested=null,suppressClose=false,disposing=null;
 const status=()=>state?.productionChange,active=()=>!lost&&status()?.active===true,https=()=>scope?.origin?.startsWith('https:')===true;
 const text=(id,v)=>{$(id).textContent=v;};
 const request=(op,extra={},signal)=>client.request({op,tabId:scope?.tabId,ownerId,...extra},{signal});
 function stopTimer(){if(timer!==null)clock.clearTimeout(timer);timer=null;}
 function remaining(){return Math.max(0,deadline-clock.now());}
 function countdown(){const total=Math.ceil(remaining()/1000);return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');}
 function schedule(){if(timer!==null||!active()||disposed)return;timer=clock.setTimeout(()=>{timer=null;if(disposed)return;render();if(!remaining()&&expiryRequested!==grantId){expiryRequested=grantId;void onRefresh().catch(e=>{error=message(e);render();});}},Math.min(1000,Math.max(1,remaining())));}
 function render(){
  if(disposed)return;const enabled=active(),cleanupUnknown=!enabled&&(status()?.cleanup==='unknown'||state?.productionCleanup?.cleanup==='unknown'),cleanupPending=!enabled&&(status()?.cleanup==='pending'||state?.productionCleanup?.cleanup==='pending'),pendingRevoke=busy==='production-revoke',decision=state?.capabilityPolicy?.operations?.['production-begin'];
  $('settings-toggle').hidden=false;$('settings-toggle').disabled=lost;
  $('production-state').hidden=!https();$('production-state').setAttribute('data-active',String(enabled));
  text('production-state-text',lost?'Read-only · inspector disconnected; cleanup unconfirmed':enabled?'Changes enabled · '+countdown():cleanupUnknown?'Read-only · cleanup unconfirmed':cleanupPending?'Read-only · cleanup pending':'Live site · read-only');
  $('production-revoke').hidden=!enabled;$('production-revoke').disabled=lost||pendingRevoke;
  text('production-origin',scope?.origin||'No tab selected');text('production-scope-origin',ticket?.target?.origin||scope?.origin||'');
  text('production-step',stage==='risk'?'Step 1 of 2 · what can happen':stage==='scope'?'Step 2 of 2 · where and how long':'Exact origin · separate change permission');
  $('production-overview').hidden=!https()||stage!=='overview';$('site-settings').hidden=stage!=='overview';$('production-step').hidden=!https();$('production-note').hidden=!https()&&!error;$('production-risk').hidden=stage!=='risk';$('production-scope').hidden=stage!=='scope';
  text('production-current',enabled?'Changes enabled for this page':'Live page editing · read-only');
  $('production-start').hidden=enabled;$('production-start').disabled=!!busy||lost||!https()||!decision?.available;
  $('production-attach').hidden=!enabled||state?.attached===true;$('production-attach').disabled=!!busy||lost;
  $('production-settings-revoke').hidden=!enabled;$('production-settings-revoke').disabled=lost||pendingRevoke;
  $('production-next').hidden=stage!=='risk';$('production-confirm').hidden=stage!=='scope';$('production-cancel').hidden=stage==='overview'&&!busy;
  for(const id of['production-next','production-confirm'])$(id).disabled=!!busy||lost;
  text('production-note',error||(lost?'Inspector disconnected. Native cleanup is unconfirmed. Reopen the inspector explicitly.':cleanupUnknown?'Permission revoked; native cleanup is unconfirmed. Reconnect explicitly before further changes; already admitted app or server effects may remain.':cleanupPending?'Permission revoked; native cleanup is pending. New edits are blocked.':busy==='production-revoke'?'Returning to read-only…':busy?'Waiting for the host…':enabled&&!state?.attached?'Permission enabled. Attach this tab, then inspect a current element.':enabled?'Supported edits still check their current target and revision.':!https()?'Production changes require an HTTPS tab. Local development is ready to edit without this confirmation.':stage==='overview'&&!decision?.available?decision?.reason||'Attach the permitted tab first.':''));
  if(enabled&&remaining()>0)schedule();else stopTimer();
 }
 function hideDialog(){if($('production-dialog').open){suppressClose=true;$('production-dialog').close();$('settings-toggle').focus();}}
 function closeView(id){if(!Number.isSafeInteger(id)||id<1)return Promise.resolve();return client.request({op:'production-close',tabId:id,ownerId}).catch(e=>{if(!disposed){error=message(e);render();}});}
 async function cancelDialog(){
  const id=scope?.tabId,staged=stage!=='overview'||!!pending;epoch++;pending?.abort();pending=null;busy=null;ticket=null;stage='overview';hideDialog();
  // A delayed successful reply may outlive its backend job. Explicit owner close
  // also retires a grant already created before the cancelled reply arrived.
  if(staged){await closeView(id);if(!disposed)await onRefresh();}render();
 }
 async function invoke(op,extra={}){
  if(disposed||lost||busy||!scope)return;const at=epoch,abort=new AbortController();if(op==='production-begin')recovery=prepareEnable();pending=abort;busy=op;error=null;render();
  try{
   const result=await request(op,extra,abort.signal);if(disposed||at!==epoch)return;
   if(op==='production-begin'||op==='production-advance'){ticket=result;stage=result.stage;}
   else if(op==='production-confirm'){ticket=null;stage='overview';state={...state,attached:false,productionChange:result};deadline=clock.now()+result.remainingMs;grantId=result.grantId;expiryRequested=null;await onRefresh();if(onEnabled&&!disposed&&at===epoch){await onEnabled(recovery);if(!disposed&&at===epoch)hideDialog();}}
  }catch(e){if(!disposed&&at===epoch){error=message(e);if(['STALE_CONFIRMATION','INVALID_CONFIRMATION'].includes(e.code)){stage='overview';ticket=null;}}}
  finally{if(!disposed&&at===epoch){pending=null;busy=null;render();}}
 }
 async function revoke(){
  if(disposed||lost||!scope||busy==='production-revoke')return;epoch++;pending?.abort();pending=null;ticket=null;stage='overview';busy='production-revoke';error=null;render();
  try{const result=await request('production-revoke');state={...state,attached:false,productionChange:result};await onRefresh();}catch(e){error=message(e);}finally{busy=null;render();}
 }
 function contextChanged(){const id=scope?.tabId;epoch++;pending?.abort();pending=null;busy=null;ticket=null;stage='overview';state=null;scope=null;deadline=0;grantId=null;expiryRequested=null;stopTimer();hideDialog();render();return closeView(id);}
 function update(next){
  if(disposed||!next)return;const origin=next.origin||next.connection?.origin||'',nextScope={tabId:next.tabId,run:next.run,origin};
  if(scope&&(scope.tabId!==nextScope.tabId||scope.run!==nextScope.run||scope.origin!==nextScope.origin))void contextChanged();
  state=next;scope=nextScope;const s=status();
  if(s?.active){const end=clock.now()+s.remainingMs;deadline=grantId===s.grantId?Math.min(deadline,end):end;grantId=s.grantId;}
  else{deadline=0;grantId=null;expiryRequested=null;stopTimer();}
  render();
 }
 $('settings-toggle').onclick=()=>{if(disposed||lost)return;error=null;render();if(!$('production-dialog').open)$('production-dialog').showModal();$('production-title').focus();};
 $('production-start').onclick=()=>{if(stage==='overview'&&!active())return invoke('production-begin');};
 $('production-next').onclick=()=>{if(stage==='risk'&&ticket)return invoke('production-advance',{ticket:ticket.ticket});};
 $('production-confirm').onclick=()=>{if(stage==='scope'&&ticket)return invoke('production-confirm',{ticket:ticket.ticket});};
 $('production-back').onclick=$('production-cancel').onclick=cancelDialog;
 $('production-revoke').onclick=$('production-settings-revoke').onclick=revoke;
 $('production-attach').onclick=async()=>{if(disposed||lost||busy||!active())return;busy='attach';error=null;render();try{await onAttach();hideDialog();}catch(e){error=message(e);}finally{busy=null;render();}};
 $('production-dialog').addEventListener('keydown',e=>{if(e.key!=='Tab')return;const nodes=[...$('production-dialog').querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')].filter(n=>!n.hidden&&n.getClientRects().length),first=nodes[0],last=nodes.at(-1),focused=$('production-dialog').ownerDocument.activeElement;if(!first)return;if(e.shiftKey&&(focused===first||focused===$('production-title'))){e.preventDefault();last.focus();}else if(!e.shiftKey&&focused===last){e.preventDefault();first.focus();}});
 $('production-dialog').addEventListener('cancel',e=>{e.preventDefault();e.stopPropagation();void cancelDialog();});
 $('production-dialog').addEventListener('close',()=>{if(suppressClose){suppressClose=false;return;}if(!disposed)void cancelDialog();});
 const off=client.subscribeConnection?.(()=>{epoch++;pending?.abort();pending=null;busy=null;ticket=null;stage='overview';lost=true;stopTimer();hideDialog();render();})||(()=>{});
 return Object.freeze({update,contextChanged,requestEditing:()=>{if(disposed||lost||!scope)return;error=null;render();if(!$('production-dialog').open)$('production-dialog').showModal();$('production-title').focus();return invoke('production-begin');},dispose(){if(disposing)return disposing;const id=scope?.tabId;disposed=true;epoch++;pending?.abort();pending=null;off();stopTimer();hideDialog();return disposing=closeView(id);}});
}
