// SPDX-License-Identifier: Apache-2.0
import{createInputController}from'./input-controller.mjs';import{supportsCapabilityPolicy}from'./transport.mjs';
export const inputEditorTemplate=`
<section id="input-editor" data-atom-id="input-editor" class="sp-atom-input-editor" aria-label="Edit page values" hidden>
 <span id="input-preview" data-atom-id="input-preview" class="sp-status" hidden>Preview</span>
 <button id="input-open" data-atom-id="input-open" class="sp-button-primary">Show editable fields</button><button id="input-reconnect" data-atom-id="input-reconnect" hidden>Reopen inspector</button>
 <div id="input-column-headings" data-atom-id="input-column-headings" class="sp-section-row sp-atom-input-columns"><span id="input-kind" data-atom-id="input-kind"></span><span id="input-columns" data-atom-id="input-columns">Current → New value</span></div>
 <div id="input-fields" data-atom-id="input-fields"></div>
 <div class="sp-atom-input-actions sp-atom-edit-commit"><button id="input-apply" data-atom-id="input-apply" class="sp-button-primary" hidden>Apply changes</button><button id="input-discard" data-atom-id="input-discard" class="sp-button-subtle" hidden>Discard</button><button id="input-undo" data-atom-id="input-undo" class="sp-button-subtle" hidden>Undo</button></div>
 <p id="input-status" data-atom-id="input-status" class="sp-atom-input-status" role="status" aria-live="polite"></p>
 <details id="input-options" data-atom-id="input-options" class="sp-disclosure"><summary>Editing options</summary>
 <div class="sp-atom-input-toolbar"><label>Fields from <select id="input-source" data-atom-id="input-source"><option value="dom-control">Page fields</option><option value="json-response">Network responses</option></select></label><div id="input-modes" data-atom-id="input-modes" class="sp-atom-input-modes" role="group" aria-label="When to apply changes"><button id="input-mode-draft" data-atom-id="input-mode-draft" aria-pressed="true">On Apply</button><button id="input-mode-live" data-atom-id="input-mode-live" aria-pressed="false">As I type</button></div></div>
 <p id="input-note" data-atom-id="input-note" class="sp-atom-hint"></p>
 <div class="sp-atom-input-actions"><button id="input-read" data-atom-id="input-read">Refresh fields</button><button id="input-baseline" data-atom-id="input-baseline">Restore original values</button><button id="input-close" data-atom-id="input-close" hidden>Stop editing</button></div>
 <p id="input-observation" data-atom-id="input-observation" class="sp-atom-hint"></p>
 <p>Fields are collected from this page; their effect on the selected element is not established. Response replacements wait for the next matching request. Closing removes replacement rules, but does not restore changed values.</p>
 </details>
 <details id="input-unavailable" data-atom-id="input-unavailable" hidden><summary id="input-unavailable-title" data-atom-id="input-unavailable-title">Unavailable fields</summary><ul id="input-unavailable-list" data-atom-id="input-unavailable-list"></ul></details>
</section>`;
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),label=r=>r.kind==='json-response'?(r.locator.pointer.split('/').at(-1)||'response value').replaceAll('~1','/').replaceAll('~0','~'):r.locator.selector.startsWith('#')?r.locator.selector.slice(1):r.locator.control+' input';
const short=v=>{const s=JSON.stringify(v);return s===undefined?'Unknown':s;};
// A conflicted draft keeps its original input shape until explicit discard.
// Current observed values still come from entry.resource, never this UI hint.
const fieldResource=entry=>entry.conflict&&entry.draftResource||entry.resource;
const rowKey=r=>JSON.stringify([r.kind,r.type,r.locator.control,r.locator.selector,r.locator.url,r.locator.method,r.locator.pointer]);
function explanation(code,message){return({DRAFT_PENDING:'Apply or discard the local draft first.',INVALID_CONTROL_VALUE:'Not an allowed value for this control.',STALE_CONTROL:'This control changed. Discard the stale draft.',STALE_RESOURCE:'This field changed. Discard the stale draft.',EXTERNAL_REVISION:'A newer external value cannot be overwritten by undo.',INSPECTOR_DISCONNECTED:'Inspector connection lost. Reopen this inspector.',BUSY:'This input editor is busy or belongs to another view.',OBSERVATION_REQUIRED:'Inspect a current target before opening inputs.',ACK_UNCONFIRMED:'The edit may have had effects; acknowledgement is unavailable.'})[code]||message||code;}
export function createInputUI({document,$,client,preview=false,onReconnect}={}){
 const rows=new Map();let state=null,caps=null,capKey=null,capEpoch=0,visible=false,disposed=false,localError=null,disclosureKey=null,disclosureState=null;
 const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
 const text=(id,value)=>{const el=$(id);if(el.textContent!==value)el.textContent=value;};
 const controller=createInputController({client,onChange:render,initialMode:'draft'});
 function run(fn){localError=null;return Promise.resolve().then(fn).catch(e=>{localError=explanation(e.code,e.message);render();});}
 function decision(op){return caps?.operations?.[op];}
 function capabilityKey(next,ownedPolicy=null){
  const own=controller.snapshot(),input=ownedPolicy&&own.active?own.editor:next?.inputs,policy=ownedPolicy||next?.capabilityPolicy;
  return JSON.stringify([next?.tabId,next?.run,next?.selection?.domIdentity,next?.property,next?.attached,next?.readOnly,policy?.operations?.['inputs-open'],policy?.operations?.['inputs-apply'],next?.connection,next?.stale?.at,input?.investigationId,input?.closed,visible,$('input-source').value]);
 }
 function ask(){
  const id=state?.tabId,epoch=++capEpoch;caps=null;
  if(!Number.isSafeInteger(id)||id<1||!supportsCapabilityPolicy(state?.capabilityPolicy)){render();return;}
  void client.request({op:'capabilities',tabId:id,ownerId:controller.snapshot().ownerId,sourceKind:$('input-source').value}).then(value=>{if(disposed||epoch!==capEpoch)return;caps=supportsCapabilityPolicy(value)?value:null;capKey=capabilityKey(state,caps);render();},e=>{if(disposed||epoch!==capEpoch)return;localError=explanation(e.code,e.message);render();});render();
 }
 function makeRow(entry){
  const r=fieldResource(entry),name=label(r),el=node('article',undefined,'sp-atom-input-row');el.setAttribute('data-input-resource',entry.id);el.setAttribute('data-input-selector',r.locator.selector||'');
  const top=node('div',undefined,'sp-atom-input-row-top'),title=node('label',name,'sp-atom-input-name'),values=node('div',undefined,'sp-atom-input-values'),observed=node('code',undefined,'sp-atom-input-current'),arrow=node('span','→','sp-atom-input-arrow'),control=node('div',undefined,'sp-atom-input-control'),error=node('p',undefined,'sp-error');
  const uid='input-'+crypto.randomUUID();error.id=uid+'-error';error.hidden=true;const common=field=>{field.setAttribute('aria-label',name);field.setAttribute('aria-describedby',error.id);return field;};let input,buttons;
  if(r.type==='boolean'){
   control.setAttribute('role','group');control.setAttribute('aria-label',name);buttons=[true,false].map(value=>{const b=common(node('button',String(value)));b.type='button';b.setAttribute('aria-label',name+': '+value);b.onclick=()=>run(()=>controller.edit(entry.id,value));control.append(b);return b;});
  }else if(r.kind==='dom-control'&&r.locator.control==='select'){
   input=common(node('select'));input.onchange=()=>run(()=>controller.edit(entry.id,input.value));control.append(input);
  }else{
   input=common(node(r.locator.control==='textarea'?'textarea':'input'));if(input.tagName==='INPUT'){input.type='text';if(r.type==='number')input.inputMode='decimal';}else input.rows=2;
   input.autocomplete='off';input.spellcheck=false;input.oninput=()=>{try{controller.edit(entry.id,input.value);localError=null;}catch(e){localError=explanation(e.code,e.message);render();}};
   input.onblur=()=>run(()=>controller.flush(entry.id));input.onkeydown=e=>{if(e.key==='Enter'&&(input.tagName!=='TEXTAREA'||e.ctrlKey)){e.preventDefault();void run(()=>controller.flush(entry.id));}};control.append(input);
  }
  if(input){input.id=uid;title.htmlFor=uid;}else title.setAttribute('id',uid+'-label');
  values.append(observed,arrow,control);top.append(title,values);el.append(top);
  const meta=node('div',undefined,'sp-atom-input-meta'),hint=node('span',r.kind==='dom-control'?'Native '+r.locator.control:'Observed response'),reset=node('button','Discard field','sp-button-subtle');reset.type='button';reset.onclick=()=>run(()=>controller.discard(entry.id));meta.append(reset);el.append(meta,error);
  const details=node('details'),summary=node('summary','Source / scope'),location=node('code');location.textContent=r.kind==='dom-control'?r.locator.selector:r.locator.method+' '+r.locator.url+' #'+r.locator.pointer;details.append(summary,hint,location,node('p','Consumption and selected-property dependency remain unknown.','sp-atom-hint'));el.append(details);
  return{el,input,buttons,observed,error,reset,location,options:null,key:rowKey(r)};
 }
 function render(){
  if(disposed)return;const s=controller.snapshot(),d=s.draft,e=s.editor;const region=$('input-editor');region.hidden=!visible||state?.readOnly===true&&!state?.productionChange?.active&&!s.active&&!d?.dirtyCount;if(!visible)return;
  if(s.active)$('input-editing-help').textContent='Applying can trigger app actions. Undo does not reverse server changes.';
  region.setAttribute('aria-busy',String(s.busy));$('input-preview').hidden=!preview||state?.capabilityPolicy?.features?.['inputs.live']?.available===true;
  for(const m of['live','draft'])$('input-mode-'+m).setAttribute('aria-pressed',String(s.mode===m));
  $('input-source').disabled=s.busy||s.opening||s.connectionLost;
  const retained=s.active||!!d?.dirtyCount;
  $('input-modes').hidden=!retained;$('input-column-headings').hidden=!retained;
  for(const id of ['input-read','input-undo','input-baseline'])$(id).hidden=!s.active;
  $('input-discard').hidden=!d?.dirtyCount;
  const disclosure=$('input-editing-details'),nextDisclosureState=JSON.stringify([s.active,s.opening,e?.investigationId,d?.dirtyCount]);
  if(disclosure&&nextDisclosureState!==disclosureState&&(retained||s.opening))disclosure.open=true;disclosureState=nextDisclosureState;
  const openDecision=decision('inputs-open');
  const targetKey=JSON.stringify([state?.tabId,state?.run,state?.selection?.domIdentity,state?.property]);
  if(disclosure&&openDecision?.available&&state?.selection&&targetKey!==disclosureKey){disclosureKey=targetKey;disclosure.open=true;}
  const heldClosed=!s.active&&!!d?.dirtyCount,selecting=['starting','picking','resolving'].includes(state?.picker?.status);
  $('input-open').disabled=selecting||s.opening||s.busy||s.connectionLost||heldClosed||!openDecision?.available;
  $('input-open').title=selecting?'Finish or cancel element selection before opening inputs.':heldClosed?'Discard the closed draft before opening another investigation.':openDecision?.reason||'Current capability policy is unavailable';
  $('input-open').textContent=s.active?'Refresh fields':'Show editable fields';$('input-open').hidden=s.active;
  $('input-close').hidden=!s.active&&!s.opening;$('input-close').disabled=!s.active&&!s.opening;
  $('input-reconnect').hidden=!s.connectionLost||typeof onReconnect!=='function';
  $('input-apply').hidden=!d?.dirtyCount||s.mode!=='draft'&&!d?.heldDraft;$('input-apply').disabled=!s.active||s.busy||!d?.canApply||!decision('inputs-apply')?.available;
  text('input-apply','Apply changes'+(d?.dirtyCount?' · '+d.dirtyCount:''));$('input-discard').disabled=s.busy||!d?.dirtyCount;
  $('input-read').disabled=!s.active||s.busy||!decision('inputs-read')?.available;$('input-undo').disabled=!s.active||s.busy||!e?.canUndo||!decision('inputs-undo')?.available;$('input-baseline').disabled=!s.active||s.busy||!e?.canRestoreBaseline||!decision('inputs-baseline')?.available;
  text('input-note',selecting?'Finish or cancel element selection before opening inputs.':s.connectionLost?'Reopen the inspector, then inspect again; old drafts do not restore authority.':heldClosed?'A local draft from the closed investigation is kept read-only. Discard it to open another target.':d?.heldDraft?'Draft kept. Apply or discard to resume Live.':s.mode==='draft'?'Draft stays local until Apply.':s.active?'Live sends valid text/number edits after 250 ms; Enter or blur sends now.':'Choose a source, then open supported inputs.');
  text('input-kind',e?(e.sourceKind==='dom-control'?'PAGE FIELDS':'RESPONSE FIELDS'):'');text('input-columns',e?.sourceKind==='json-response'?'Rule → New value':'Current → New value');
  const ids=new Set();for(const entry of d?.entries||[]){ids.add(entry.id);const resource=fieldResource(entry);let row=rows.get(entry.id);if(!row||row.key!==rowKey(resource)){const old=row;row=makeRow(entry);rows.set(entry.id,row);if(old)old.el.replaceWith(row.el);else $('input-fields').append(row.el);}const disabled=!s.active||entry.missing||!decision('inputs-apply')?.available;
   row.el.setAttribute('data-dirty',String(entry.dirty));row.observed.textContent=short(entry.resource.value);row.observed.title=short(entry.resource.value);row.reset.hidden=!entry.dirty;row.reset.disabled=s.busy;
   const message=entry.conflict?'Field changed elsewhere. Discard this draft.':entry.error?explanation(entry.error,entry.error):null;row.error.hidden=!message;row.error.textContent=message||'';
   if(row.buttons)row.buttons.forEach((b,i)=>{b.disabled=disabled;b.setAttribute('aria-pressed',String(entry.raw===(i===0)));b.setAttribute('aria-invalid',String(!entry.valid||entry.conflict));});
   else{const field=row.input;field.disabled=disabled;field.setAttribute('aria-invalid',String(!entry.valid||entry.conflict));if(field.tagName==='SELECT'){
     const choices=resource.locator.options||[],key=JSON.stringify([choices,entry.raw]);if(row.options!==key){row.options=key;const values=choices.map(value=>{const option=node('option',value);option.value=value;return option;});if(!choices.includes(entry.raw)){const option=node('option',String(entry.raw)+' (unavailable)');option.value=entry.raw;option.disabled=true;values.unshift(option);}field.replaceChildren(...values);}
    }if(field.value!==String(entry.raw))field.value=String(entry.raw);}
  }
  for(const[id,row]of rows)if(!ids.has(id)){row.el.remove();rows.delete(id);}
  if(e&&!d?.entries.length)text('input-status',e.sourceKind==='dom-control'?'No editable fields found on this page. Try another element or view network responses in Editing options.':'No response fields recorded yet. Use the page to load data, then refresh these fields.');
  else{
   const phase=e?.history?.at(-1)?.phase,errors=d?.entries.filter(r=>r.error||r.conflict).length||0;
   text('input-status',localError||s.error&&explanation(s.error.code,s.error.message)||s.connectionLost&&'Inspector connection lost.'||s.opening&&'Opening eligible inputs…'||s.busy&&'Sending / reading…'||!s.active&&e&&(e.closed?'Editor closed. App state is not automatically restored.':'Closing input editing…')||s.active&&!decision('inputs-apply')?.available&&explanation(decision('inputs-apply')?.code,decision('inputs-apply')?.reason)||errors&&('Review '+errors+' field '+(errors===1?'error.':'errors.'))||d?.dirtyCount&&(d.dirtyCount+' local '+(d.dirtyCount===1?'edit':'edits')+(s.mode==='live'&&!d.heldDraft?' pending.':'.'))||phase==='waiting'&&'Waiting for the next matching app response.'||phase==='delivered'&&'Response delivered; consumption/effect remain unknown.'||phase==='applied'&&'Changes applied.'||phase&&('Outcome: '+phase)||!e&&!openDecision?.available&&explanation(openDecision?.code,openDecision?.reason)||'');
  }
  $('input-status').hidden=!$('input-status').textContent||!s.active&&!s.opening&&!s.error&&!localError;
  $('input-undo').hidden=!e?.canUndo;
  text('input-observation',e?.observation?'Observed '+e.target.property+' = '+short(e.observation.value)+' · '+e.observation.status+' · dependency unknown.':'');
  const unavailable=e?.unsupported||[];$('input-unavailable').hidden=!unavailable.length;text('input-unavailable-title',unavailable.length+' unavailable '+(unavailable.length===1?'input':'inputs'));$('input-unavailable-list').replaceChildren(...unavailable.map(r=>node('li',(r.selector||'Input')+' · '+r.reason)));
 }
 function stateReplyReceiver(){
  const admit=controller.stateReplyGuard();
  return next=>{if(disposed||!admit(next))return false;update(next);return true;};
 }
 function update(next){
  state=next;controller.update(next||{});visible=preview||supportsCapabilityPolicy(next?.capabilityPolicy)&&['inputs.live','inputs.draft-apply'].some(id=>next.capabilityPolicy.features[id].code!=='NOT_IMPLEMENTED')||visible&&!!controller.snapshot().draft?.dirtyCount;
  const key=capabilityKey(next);if(key!==capKey){capKey=key;if(visible)ask();else{caps=null;++capEpoch;}}render();
 }
 $('input-source').value='dom-control';$('input-source').onchange=()=>{const s=controller.snapshot();if(s.active&&s.draft?.dirtyCount){$('input-source').value=s.sourceKind;localError='Apply or discard the current draft before changing sources.';render();return;}ask();if(s.active)void run(()=>controller.open({tabId:state.tabId,sourceKind:$('input-source').value}));};
 $('input-open').onclick=()=>run(async()=>{await controller.open({tabId:state.tabId,sourceKind:$('input-source').value});ask();});
 for(const m of['live','draft'])$('input-mode-'+m).onclick=()=>run(()=>controller.setMode(m));
 for(const[id,fn]of[['input-apply',()=>controller.apply()],['input-discard',()=>controller.discard()],['input-read',()=>controller.refresh()],['input-undo',()=>controller.undo()],['input-baseline',()=>controller.baseline()],['input-close',()=>controller.close()]])$(id).onclick=()=>run(fn);
 $('input-reconnect').onclick=()=>run(()=>onReconnect?.());
 return Object.freeze({update,stateReplyReceiver,open:()=>$('input-open').onclick(),capture:options=>controller.capture(options),captureObservation:options=>controller.captureObservation(options),close:reason=>controller.close(reason),dispose(){if(disposed)return;disposed=true;++capEpoch;return controller.dispose();},snapshot:controller.snapshot});
}
