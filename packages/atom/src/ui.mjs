import {parseConnectionReceipt} from '../../../core/project-connection.mjs';
import {appOrigin,helperURL} from './origin-policy.mjs';
import {createSourceMapUI} from './source-map-ui.mjs';
import {createActionUI} from './action-ui.mjs';
import {parseDiagnostic,serializeDiagnostic,omitDiagnosticContent} from '../../../core/diagnostic.mjs';
import {inspectionView,selectionPresentation} from '../../../browser-extension/inspection-view.mjs';
import {template} from './template.mjs';
import {atomError} from './platform.mjs';
import {supportsCapabilityPolicy} from './transport.mjs';
const mounted=new WeakMap();
export function mountAtom(rootElement,client,options={}){
 if(!rootElement?.ownerDocument||mounted.has(rootElement))throw atomError('INVALID_ROOT');
 const document=rootElement.ownerDocument, root=document.createElement('div');
 root.setAttribute('data-sp-ui','');root.setAttribute('data-atom-root','');
 if(options.maxWidth!==undefined)root.style.maxWidth=options.maxWidth;if(options.padding!==undefined)root.style.padding=options.padding;
 root.innerHTML=template;
 for(const button of root.querySelectorAll('button'))button.type='button';
 const prefix=options.idPrefix??('atom-'+crypto.randomUUID()+'-');
 for(const e of root.querySelectorAll('[id]'))e.id=prefix+e.id;
 for(const e of root.querySelectorAll('[aria-labelledby]'))e.setAttribute('aria-labelledby',e.getAttribute('aria-labelledby').split(' ').map(id=>prefix+id).join(' '));
 rootElement.append(root);mounted.set(rootElement,root);
 const $=id=>root.querySelector('[data-atom-id="'+id+'"]');
 $('reader-link').href=options.readerURL||'reader.html';
 let disposed=false;const controller=new AbortController(),urls=new Set(),timers=new Set();
 const later=(fn,ms)=>{const timer=setTimeout(()=>{timers.delete(timer);if(!disposed)fn();},ms);timers.add(timer);};
let ownedPicker;
function ownPickerRequest(tabId,id){ownedPicker?.controller?.abort();const own={tabId,id,controller:new AbortController()};ownedPicker=own;return AbortSignal.any([controller.signal,own.controller.signal]);}

let analysis,selectedState,loadGeneration=0,selectionGeneration=0,tabGeneration=0,renderedAt,restorationNotice;
const tab=()=>Number($('tabs').value);
async function rpc(message,signal=controller.signal){const r=await client.request(message,{signal});if(disposed)throw atomError('DISPOSED');return r;}
async function action(fn){const id=tab(),epoch=tabGeneration;try{$('status').textContent='Working…';const r=await fn();if(!disposed&&id===tab()&&epoch===tabGeneration)$('status').textContent='OK';return r;}catch(e){if(disposed||id!==tab()||epoch!==tabGeneration)return;$('status').textContent='Error: '+e.message;}}
async function tabs(){const old=$('tabs').value;const ts=await rpc({op:'tabs'});$('tabs').replaceChildren(...ts.map(t=>{const o=document.createElement('option');o.value=t.id;o.setAttribute('data-origin',new URL(t.url).origin);o.textContent=t.id+' '+t.url;return o;}));if(ts.some(t=>String(t.id)===old))$('tabs').value=old;}
async function load(){
 const id=tab(),generation=++loadGeneration;
 if(!Number.isSafeInteger(id)||id<=0){selectedState=null;analysis=null;renderInspection();return;}
 const state=await rpc({op:'state',tabId:id,refreshDeep:true});
 if(generation!==loadGeneration||id!==tab())return;
 selectedState={...state,tabId:id};analysis=state.analysis;renderInspection();
}
const sourceMapUI=createSourceMapUI({document,$,rpc,tab,load,action,requestPermission:options.requestOriginPermission});
const actionsUI=createActionUI({document,$,rpc,tab,action});
function admission(op){const p=selectedState?.capabilityPolicy;return supportsCapabilityPolicy(p)?p.operations?.[op]:{available:false,reason:'Host does not advertise capability policy v1; update the Atom host'};}
function gate(id,decision,otherwise=false){$(id).disabled=otherwise||!decision?.available;$(id).title=decision?.available?'':decision?.reason||'Capability unavailable';}
function attachAvailability(){const p=selectedState?.capabilityPolicy,known=supportsCapabilityPolicy(p),requestAccess=known&&!!options.requestOriginPermission&&p.features['basic.request-site-access'].available;gate('attach',requestAccess?p.features['basic.request-site-access']:$('source-map-readonly').checked&&known?p.features['basic.attach-read-only']:admission('attach'));$('attach').textContent=requestAccess?'Allow site and attach':'Attach';}
function renderInspection(){
 sourceMapUI.render(selectedState);
 actionsUI.render(selectedState);
 $('project-setup-status').textContent=selectedState?.projectSetup?.reason||'Basic works without the helper. For source access, install matching components and paste a private receipt.';
 const view=inspectionView(selectedState||{}),selection=view.target;
 $('mode').textContent=view.mode;
 $('site-origin').textContent=$('tabs').selectedOptions?.[0]?.dataset.origin||'No application selected';
 for(const name of ['cache','reload','override','replay'])$('site-'+name).checked=selectedState?.connection?.actions?.includes(name)===true;
 $('site-mode').value=selectedState?.connection?.mode||'read-only';
 $('connection-label').textContent=selectedState?.attached?(selectedState.readOnly?'Attached · read-only':'Attached · this tab'):'Not attached';
 if(view.observedAt&&view.observedAt!==renderedAt){$('scroll').scrollTop=0;for(const id of ['actions-nav','evidence-nav','diagnostics-nav'])$(id).removeAttribute('aria-current');$('inputs-nav').setAttribute('aria-current','location');}renderedAt=view.observedAt;
 const target=selection||selectedState?.stale?.target;
 const trial=selectedState?.diagnosticExperiment;
 const matchingTrial=trial&&selectedState?.deepExperiment?.id===trial.result?.id&&trial.target?.selector===target?.selector&&trial.target?.property===target?.property;
 const restored=restorationNotice&&selectedState?.attached&&restorationNotice.tab===tab()&&restorationNotice.epoch===tabGeneration&&restorationNotice.generation===selectionGeneration&&restorationNotice.origin===selectedState.origin&&restorationNotice.selector===target?.selector&&restorationNotice.property===target?.property&&restorationNotice.property===selectedState.property&&(!restorationNotice.id||matchingTrial&&restorationNotice.id===trial.result.id);
 $('atom-result').textContent=restored?restorationNotice.text:matchingTrial?trial.result.status+' · Historical controlled trials · baseline '+JSON.stringify(trial.result.trials?.[0]?.a?.value)+' · '+trial.result.scope:'';
 const presentation=selectionPresentation(selection,{stale:view.stale,picker:selectedState?.picker});
 $('selection-title').textContent=presentation.title;
 $('selection-value').textContent=presentation.value;
 $('selection-kind').textContent=presentation.kind;
 if((selectedState&&!selectedState.attached&&!target)||!Number.isSafeInteger(tab())||tab()<=0)$('browser-connection').open=true;
 $('commit-summary').textContent=view.commit.status+' · '+view.commit.reason;
 const profile=view.firstReadProfile;
 $('first-read-summary').textContent=profile.status+' · '+(profile.fullPath?'HTTP field → original read → committed property':profile.reason||'Finite trace unavailable');
 $('first-read-scope').textContent=profile.fullPath?profile.scope+' Snapshot; inspect again after changes.':'';
 $('first-read-joins').replaceChildren(...(profile.fullPath?['Code-linked · reviewed source/effect derivation '+profile.sourceProof.profile,'Observed · '+profile.occurrence.pointer+' = '+JSON.stringify(profile.occurrence.readValue)+' · parse '+profile.occurrence.parseId+' · browser request '+profile.occurrence.requestId,'Observed · read '+profile.occurrence.readId+' → target '+profile.occurrence.targetId+' → commit '+profile.occurrence.commitId,...profile.limits]:[]).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 $('property').value=selectedState?.property||'text';
 $('save-report').disabled=!selectedState?.selection&&!selectedState?.stale?.target;
 gate('load',admission('inspect-selector'),!selectedState?.selection?.selector&&!selectedState?.stale?.target?.selector);
 const picker=selectedState?.picker,picking=['starting','picking','resolving'].includes(picker?.status);
 gate('pick',admission(picking?'cancel-pick':'pick'));$('pick').setAttribute('aria-label',picking?'Cancel element selection':'Select page element');$('pick').setAttribute('aria-pressed',String(picking));$('pick').title=picking?'Cancel selection; Escape also cancels on the page':$('pick').title;
 $('picker-status').hidden=!picking&&picker?.status!=='unsupported';$('picker-status').textContent=picker?.status==='starting'?'Preparing selection…':picking?'Click an element. Cancel here, or Escape (may reach the page).':picker?.reason||'';
 $('element-details').hidden=!target&&!picking&&picker?.status!=='unsupported';
 $('picker-limits').textContent='Escape cancels but may reach page key handlers; Cancel in the inspector avoids page keys. Frame and closed-root internals are unsupported. DOM selection does not establish a source association.'+(picker?.reason?' '+picker.reason:'');
 $('picker-parent').hidden=presentation.parentIndex===null;
 $('picker-parent').disabled=!admission('refine-pick')?.available;
 $('picker-parent').onclick=()=>action(async()=>{if(presentation.parentIndex===null)return;const signal=ownPickerRequest(tab(),picker.id);await rpc({op:'refine-pick',tabId:tab(),pickerId:picker.id,index:presentation.parentIndex},signal);await load();});
 const focusedChoice=$('picker-choices').contains(document.activeElement)?document.activeElement.dataset.pickerChoice:null;
 $('picker-choices').replaceChildren(...(picker?.choices||[]).map(choice=>{const button=document.createElement('button');button.type='button';button.dataset.pickerChoice=picker.id+':'+choice.index;button.textContent=choice.label;button.disabled=!admission('refine-pick').available;button.onclick=()=>action(async()=>{const signal=ownPickerRequest(tab(),picker.id);await rpc({op:'refine-pick',tabId:tab(),pickerId:picker.id,index:choice.index},signal);await load();});return button;}));$('picker-choices').hidden=!(picker?.choices?.length);if(focusedChoice){const button=[...$('picker-choices').children].find(b=>b.dataset.pickerChoice===focusedChoice&&!b.disabled);button?.focus({preventScroll:true});}
 gate('inspect-selector',admission('inspect-selector'));attachAvailability();
 $('selected').textContent=selection?selection.selector+' · '+selection.property+' = '+JSON.stringify(selection.value):view.stale?'Previous observation is stale. Select an element or inspect again.':'Select an element on the attached page.';
 $('freshness').textContent=view.stale?'Stale · '+view.reason:view.observedAt?'Snapshot at '+new Date(view.observedAt).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',fractionalSecondDigits:3})+'. Not live.':'No observation yet.';
 $('freshness').title='Recorded snapshot. Inspect again after changing the app.';
 $('capabilities').textContent=view.mode==='Instrumented'?'Instrumented snapshot · open IDE + source + dev plugin. Only supported executions are available. A finite supported trace, when available, is shown separately above.':view.mode==='Source-linked'?'Source-linked snapshot · open IDE and source available. Operand values require supported dev instrumentation.':'Basic · DOM observation only. Connect the open IDE for source links; add the open dev plugin for supported operand observations.';
 $('state-handoffs').replaceChildren(...(view.handoffs.length?view.handoffs:[{status:view.stale?'Stale':'Unknown/Unsupported',reason:'No supported native state handoff for this selected trace.'}]).map(h=>{const item=document.createElement('li');item.textContent=h.status+' · '+(h.queueId?'queue '+h.queueId+' · update '+(h.updateId||'unknown')+' · ':'')+(h.parsedObject?'JSON consumption '+h.parsedObject.consumptionId+' · ':'')+(h.reason||h.scope||'')+(view.finiteTraceSupported?' This state handoff alone does not establish current field value ancestry; see the separately scoped finite trace.':' Current field value ancestry is unknown.');return item;}));
 $('exchange-bindings').replaceChildren(...(view.exchanges.length?view.exchanges:[{status:view.stale?'Stale':'Unknown/Unsupported',reason:'No exact exchange binding for a supported selected trace.'}]).map(b=>{const item=document.createElement('li');item.textContent=b.status+' · '+(b.requestId?b.method+' '+b.url+' · browser request '+b.requestId+' · ':'')+(b.reason||b.scope||'')+(view.finiteTraceSupported?' This exchange identity alone does not establish complete HTTP provenance; see the separately scoped finite trace.':' Complete HTTP provenance is not established.');return item;}));
 const journal=view.codeJournal;
 $('code-journal-summary').textContent=journal?journal.freshness+' · collected '+new Date(journal.capturedAt).toISOString()+' · '+journal.counts.captured+' compiled scripts, '+journal.counts.hashed+' digests, '+journal.counts.pending+' pending. '+(journal.freshness==='Stale'?'Collection changed or was interrupted; Inspect again for a newer snapshot.':'Historical collection snapshot; later compilations may be absent.'):'No compilation snapshot for this selection. Attach and inspect again.';
 $('code-journal-limits').textContent=journal?'Independent browser observations. Compilation does not establish calls, source equivalence, readonly effects or field ancestry. Earlier/future effects and other targets/workers are not excluded. '+(journal.armedBeforeNavigation?'Collection started before this navigation. ':'Earlier history unavailable: attached after navigation. ')+(journal.gaps.length?'Collection boundaries: '+journal.gaps.join(', ')+'. ':'No recorded acquisition gaps in this bounded snapshot. '):'';
 $('code-journal-records').textContent=journal?journal.scripts.map(r=>'script '+r.scriptId+' · '+r.world+' · '+r.resource+' · '+r.sourceStatus+(r.digest?' · SHA-256 '+r.digest:'')).join('\n'):'';
 $('sources').replaceChildren();$('expressions').replaceChildren();$('fields').replaceChildren();$('operands').replaceChildren();
 renderAtom(analysis?.stateatom,view.finiteTraceSupported);
 if(view.stale)$('atom-summary').textContent='Stale · '+view.reason;
 for(const source of view.sources){
  const row=document.createElement('div');row.className='sp-atom-source';
  const location=document.createElement('span');location.className='sp-code-location';location.textContent=source.file.split('/').at(-1)+' : '+source.line;location.title=source.file+':'+source.line+':'+source.column;
  const button=document.createElement('button');button.type='button';button.className='sp-button-subtle';button.setAttribute('aria-label','Open in IDE: '+source.file+':'+source.line+':'+source.column);button.title='Open in IDE: '+source.file+':'+source.line+':'+source.column;
  const external=document.createElementNS('http://www.w3.org/2000/svg','svg');external.setAttribute('viewBox','0 0 24 24');external.setAttribute('class','sp-icon');external.setAttribute('aria-hidden','true');const arrow=document.createElementNS('http://www.w3.org/2000/svg','path');arrow.setAttribute('d','M14 3h7v7m0-7L10 14M10 3H3v18h18v-7');external.append(arrow);button.append(location,external);
  const badge=document.createElement('span');badge.className='sp-status';badge.textContent='Code-linked';
  button.disabled=!admission('open')?.available;button.title=button.disabled?admission('open')?.reason:button.title;
  button.onclick=()=>action(async()=>{await rpc({op:'open',tabId:tab(),source});});row.append(button,badge);$('sources').append(row);
  const expression=document.createElement('pre');expression.textContent=(source.expressions||[]).join('\n');$('expressions').append(expression);
 }
 if(!view.sources.length)$('sources').textContent='Source unavailable for this selection.';
 for(const node of view.operands){const item=document.createElement('li');item.className='sp-data-row';const expression=document.createElement('span'),value=document.createElement('code');value.className='sp-value';expression.textContent=node.expression+' = ';value.textContent=JSON.stringify(node.value);item.append(expression,value);$('operands').append(item);}
 $('values-unavailable').textContent=view.operands.length?'':'No scalar operand values observed for this selected computation.';
 $('experiment-result').textContent=selectedState?.experiment?selectedState.experiment.status+': '+selectedState.experiment.reason:'';
 const candidates=[...(analysis?.fields||[])];
 for(const request of selectedState?.requests||[])for(const field of flatten(request.json))if(!candidates.some(c=>c.requestId===request.id&&c.path===field.path))candidates.push({...field,url:request.url,requestId:request.id,status:'Unknown',method:'manually selectable observed response leaf'});
 // Keep the existing experiment index contract without mutating the resolver result.
 fields=candidates;
 candidates.forEach((field,i)=>{const option=document.createElement('option');option.value=i;option.textContent=field.status+' '+field.url+' #'+field.path+' = '+JSON.stringify(field.value);$('fields').append(option);});
 const eligible=admission('deep-experiment')?.available===true;
 gate('atom-run',admission('deep-experiment'),!selection||!analysis||view.stale);gate('atom-restore',admission('restore'));
 gate('experiment',admission('experiment'),!candidates.length);
 $('experiment-eligibility').textContent=!eligible?(admission('deep-experiment')?.reason||'Capability unavailable'):selection?.property==='text'&&candidates.length?'Text response experiment available for a recorded JSON leaf. Response presence alone is not dependency. Trials reset storage/cache and reload; server writes are not undone.':'Controlled property trials require explicit response variants below. The simpler response-field experiment supports text only. Trials reset storage/cache and reload; server writes are not undone.';
 $('evidence').textContent=selectedState?JSON.stringify({analysis,events:selectedState.events,bufferBytes:selectedState.bufferBytes,...(matchingTrial?{experiment:trial}:{})},null,2):'';
}
function reveal(id){const e=$(id),scroller=$('scroll');if(e.tagName==='DETAILS')e.open=true;scroller.scrollTop+=e.getBoundingClientRect().top-scroller.getBoundingClientRect().top-16;(e.querySelector('summary')||e).focus({preventScroll:true});}
 $('setup-toggle').onclick=()=>reveal('browser-connection');
 $('diagnostic-toggle').onclick=()=>reveal('diagnostics-details');
 for(const [button,section] of [['inputs-nav','inputs-section'],['actions-nav','actions-section'],['evidence-nav','evidence-section'],['diagnostics-nav','diagnostics-details']])$(button).onclick=()=>{for(const id of ['inputs-nav','actions-nav','evidence-nav','diagnostics-nav'])$(id).removeAttribute('aria-current');$(button).setAttribute('aria-current','location');reveal(section);};
 for(const d of root.querySelectorAll('.sp-atom-tools > details, .sp-atom-inspection > details'))d.classList.add('sp-disclosure');
let fields=[];
function clearInspection(keepTarget=true){++selectionGeneration;const property=$('property').value;++loadGeneration;selectedState=keepTarget&&selectedState?{...selectedState,selection:null,analysis:null,stale:null}:null;analysis=null;renderInspection();$('property').value=property;}
async function inspectAgain(){
 const id=tab(),selector=selectedState?.selection?.selector||selectedState?.stale?.target?.selector;
 if(!selector)throw Error('Select an element first');
 clearInspection();
 try{await rpc({op:'inspect-selector',tabId:id,selector});}
 finally{if(id===tab())await load();}
}
function flatten(v,p='',out=[]){if(v!==null&&typeof v==='object')for(const[k,x]of Object.entries(v))flatten(x,p?p+'.'+k:k,out);else out.push({path:p,value:v});return out;}
$('connect-receipt').onclick=()=>action(async()=>{try{const r=parseConnectionReceipt($('connection-receipt').value);if(options.requestOriginPermission&&!await options.requestOriginPermission(r.url))throw Error('Helper origin permission denied');await rpc({op:'pair',url:r.url,token:r.token,origin:r.origin,sourceRoot:r.sourceRoot,receipt:r});await load();}finally{$('connection-receipt').value='';}});
$('pair').onclick=()=>action(async()=>{const url=$('bridge').value,origin=$('origin').value;if(!helperURL(url)||!appOrigin(origin,{exact:true}))throw Error('Enter canonical origins without paths');if(options.requestOriginPermission&&!await options.requestOriginPermission(url))throw Error('Helper origin permission denied');await rpc({op:'pair',url,token:$('token').value,origin,sourceRoot:$('source-root').value});await load();});
$('save-site').onclick=()=>action(async()=>{const id=tab(),epoch=tabGeneration,origin=$('tabs').selectedOptions?.[0]?.dataset.origin,mode=$('site-mode').value,actions=mode==='development'?['cache','reload','override','replay'].filter(n=>$('site-'+n).checked):[];if(!appOrigin(origin,{exact:true}))throw Error('Select an exact application origin');if(options.requestOriginPermission&&!await options.requestOriginPermission(origin))throw Error('Site origin permission denied');if(id!==tab()||epoch!==tabGeneration)throw Error('Selected tab changed');await rpc({op:'connect-site',tabId:id,connection:{origin,mode,actions}});await load();});
$('forget-site').onclick=()=>action(async()=>{await rpc({op:'forget-site',tabId:tab()});await load();});
$('refresh-tabs').onclick=()=>action(async()=>{await tabs();await load();});$('tabs').onchange=()=>{const owned=ownedPicker;owned?.controller?.abort();ownedPicker=null;++tabGeneration;return action(async()=>{if(owned)await client.request({op:'cancel-pick',tabId:owned.tabId,pickerId:owned.id}).catch(()=>{});clearInspection(false);await load();});};$('attach').onclick=()=>action(async()=>{const id=tab(),epoch=tabGeneration,origin=$('tabs').selectedOptions?.[0]?.dataset.origin;if(selectedState?.capabilityPolicy?.features?.['basic.request-site-access']?.available&&(!options.requestOriginPermission||!await options.requestOriginPermission(origin)))throw Error('Site origin permission denied');await rpc({op:'attach',tabId:id,readOnly:$('source-map-readonly').checked});if(disposed||id!==tab()||epoch!==tabGeneration)return;await load();if(disposed||id!==tab()||epoch!==tabGeneration)return;$('browser-connection').open=false;$('source-connection').open=false;$('scroll').scrollTop=0;});$('pick').onclick=()=>action(async()=>{const cancelling=['starting','picking','resolving'].includes(selectedState?.picker?.status),pickerId=cancelling?selectedState.picker.id:crypto.randomUUID();const signal=cancelling?controller.signal:ownPickerRequest(tab(),pickerId);if(cancelling)ownedPicker?.controller?.abort();await rpc({op:cancelling?'cancel-pick':'pick',tabId:tab(),pickerId},signal);if(cancelling)ownedPicker=null;await load();});$('inspect-selector').onclick=()=>action(async()=>{const id=tab(),selector=$('selector').value;clearInspection();try{await rpc({op:'inspect-selector',tabId:id,selector});}finally{if(id===tab())await load();}});$('load').onclick=()=>action(inspectAgain);$('detach').onclick=()=>action(async()=>{await rpc({op:'detach',tabId:tab()});await load();});
$('experiment').onclick=()=>action(async()=>{const id=tab(),generation=selectionGeneration;const field=fields[Number($('fields').value)];$('experiment-result').textContent='Running…';const result=await rpc({op:'experiment',tabId:tab(),field,value:JSON.parse($('value').value),controlPath:$('control').value,actions:JSON.parse($('actions').value)});if(id!==tab()||generation!==selectionGeneration)return;$('experiment-result').textContent=result.status+': '+result.reason;$('evidence').textContent=JSON.stringify(result,null,2);});
const unsubscribe=client.subscribe(m=>{if(disposed)return;if(['selection','state-invalidated'].includes(m.event)&&m.tabId===tab())void action(load);});const ready=tabs().then(load).catch(e=>{if(disposed)return;$('status').textContent='Error: '+e.message;});

function renderAtom(atom,finiteTraceSupported=false){$('atom-chain').replaceChildren();$('atom-independent').textContent='';if(!atom){$('atom-summary').textContent=selectedState?.stale?'Stale · '+selectedState.stale.reason+' · inspect again':'Unknown/Unsupported: no inspection';return;}const r=atom.runtime;$('atom-summary').textContent=(r.status||'Unknown/Unsupported')+' · '+atom.target.property+' = '+JSON.stringify(atom.target.value)+' · '+(r.status==='Observed'?'selected computation snapshot':r.reason||'');
 for(const n of (r.nodes||[])){const d=document.createElement('details'),s=document.createElement('summary');s.textContent=n.status+' · '+n.kind+' · '+n.expression+(n.kind==='potential-property-write'?' · potential access; completion unknown':' = '+JSON.stringify(n.value))+(n.origin?' · parsed object/field '+n.origin.url+' #'+n.origin.pointer+(finiteTraceSupported?' · independent fragment value origin ':' · current value origin ')+(n.valueOrigin||'Unknown/Unsupported')+(finiteTraceSupported?' · This parsed-identity fragment alone does not establish ancestry; see the separately scoped finite trace for the original selected read.':''):'')+(n.boundary?' · '+n.boundary:'');const p=document.createElement('pre');p.textContent=JSON.stringify(n,null,2);d.append(s,p);$('atom-chain').append(d);}
 for(const slice of atom.slices||[]){const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Code-linked · possible source slice · '+slice.nodes.length+' nodes';const p=document.createElement('pre');p.textContent=JSON.stringify(slice,null,2);d.append(s,p);$('atom-chain').append(d);}$('atom-independent').textContent=JSON.stringify(r.independentObservations||[],null,2);}
$('property').onchange=()=>action(async()=>{await rpc({op:'property',tabId:tab(),property:$('property').value});await load();});
$('source-map-readonly').onchange=attachAvailability;
$('atom-run').onclick=()=>action(async()=>{restorationNotice=null;const id=tab(),generation=selectionGeneration;$('atom-result').textContent='Running controlled trials…';const r=await rpc({op:'deep-experiment',tabId:tab(),variants:JSON.parse($('atom-variants').value)});if(id!==tab()||generation!==selectionGeneration)return;$('atom-result').textContent=r.status+' · baseline '+JSON.stringify(r.baseline)+' · '+r.scope;$('evidence').textContent=JSON.stringify(r,null,2);});
$('atom-restore').onclick=()=>action(async()=>{const id=tab(),generation=selectionGeneration,epoch=tabGeneration,experimentId=selectedState?.deepExperiment?.id,target=selectedState?.selection||selectedState?.stale?.target,origin=selectedState?.origin;const r=await rpc({op:'restore',tabId:id});if(id!==tab()||generation!==selectionGeneration)return;restorationNotice={id:experimentId,tab:id,epoch,generation,origin,selector:target?.selector,property:target?.property,text:'Restored by reload + cache/storage reset · '+JSON.stringify(r.value)};await load();});

let reports=[];
async function savedReports(prefer){reports=await rpc({op:'list-diagnostics'});const chosen=prefer||$('report-select').value;$('report-select').replaceChildren(...reports.map(r=>{const o=document.createElement('option');o.value=r.id;o.textContent=r.createdAt+' · '+r.target.selector+' · '+r.target.property;return o;}));if(reports.some(r=>r.id===chosen))$('report-select').value=chosen;else if(reports.length)$('report-select').value=reports.at(-1).id;$('export-report').disabled=$('delete-report').disabled=reports.length===0;}
$('save-report').onclick=()=>action(async()=>{const r=await rpc({op:'save-diagnostic',tabId:tab(),includeContent:$('diagnostic-content').checked,notes:$('diagnostic-notes').value});await savedReports(r.id);$('diagnostic-status').textContent='Saved historical diagnostic · '+r.id;});
$('export-report').onclick=()=>action(async()=>{const r=parseDiagnostic(JSON.stringify(reports.find(r=>r.id===$('report-select').value)));$('export-json').value=serializeDiagnostic(r);$('export-summary').textContent=r.target.selector+' · '+r.target.property+' · '+r.freshness+' · '+r.sources.length+' source locations · '+r.network.length+' observed exchanges · excerpts '+(r.contentPolicy.includeContent?'included':'excluded');$('export-review-status').textContent='No file downloaded. Review before sharing.';$('export-review').showModal();});
$('export-cancel').onclick=()=>{$('export-review').close();$('export-json').value='';};
$('export-review').addEventListener('close',()=>{$('export-json').value='';},{signal:controller.signal});
$('export-omit-content').onclick=()=>{try{$('export-json').value=serializeDiagnostic(omitDiagnosticContent(parseDiagnostic($('export-json').value)));$('export-review-status').textContent='Excerpts removed. Review remaining target values, notes and URLs.';}catch(e){$('export-review-status').textContent='Invalid diagnostic: '+e.message;}};
$('export-confirm').onclick=()=>{try{const r=parseDiagnostic($('export-json').value),url=URL.createObjectURL(new Blob([$('export-json').value],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='stateatom-'+r.id+'.stateatom.json';urls.add(url);a.click();later(()=>{URL.revokeObjectURL(url);urls.delete(url);},1000);$('export-review').close();$('diagnostic-status').textContent='Exported reviewed diagnostic JSON · not a State Card';}catch(e){$('export-review-status').textContent='Invalid diagnostic: '+e.message;}};
$('delete-report').onclick=()=>action(async()=>{await rpc({op:'delete-diagnostic',id:$('report-select').value});await savedReports();$('diagnostic-status').textContent='Deleted local diagnostic';});
$('unpair').onclick=()=>action(async()=>{await rpc({op:'unpair'});await load();});
void savedReports().catch(e=>{if(disposed)return;$('diagnostic-status').textContent='Local reports unavailable: '+e.message;});

return {ready,element:root,dispose(){ownedPicker?.controller?.abort();const cleanup=ownedPicker?client.request({op:'cancel-pick',tabId:ownedPicker.tabId,pickerId:ownedPicker.id}).catch(()=>{}):Promise.resolve();ownedPicker=null;sourceMapUI.dispose();actionsUI.dispose();if(disposed)return;disposed=true;++loadGeneration;controller.abort();unsubscribe();for(const t of timers)clearTimeout(t);for(const u of urls)URL.revokeObjectURL(u);timers.clear();urls.clear();$('export-review').close();root.remove();mounted.delete(rootElement);return cleanup;}};
}
