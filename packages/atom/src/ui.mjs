import {renderSelectedList} from './selected-list-ui.mjs';
import {createElementPropertiesUI} from './element-properties-ui.mjs';
import {createObservationHistoryUI} from './observation-history-ui.mjs';
import {createObservationController} from './observation-controller.mjs';
import {createHandoffUI} from './handoff-ui.mjs';
import {createHandoffLibrary} from './handoff-library.mjs';
import {parseConnectionReceipt} from '../../../core/project-connection.mjs';
import {appOrigin,helperURL} from './origin-policy.mjs';
import {createSourceMapUI} from './source-map-ui.mjs';
import {createSourceAnalysisClient} from './source-analysis-client.mjs';
import {createProductionUI} from './production-ui.mjs';
import {createInputUI} from './input-ui.mjs';
import {createActionUI} from './action-ui.mjs';
import {createInspectionExplanationUI} from './inspection-explanation-ui.mjs';
import {parseDiagnostic,serializeDiagnostic,omitDiagnosticContent} from '../../../core/diagnostic.mjs';
import {inspectionView,inspectionDisplayState,selectionPresentation} from '../../../browser-extension/inspection-view.mjs';
import {template} from './template.mjs';
import {createSectionNavigation} from './section-navigation.mjs';
import {atomError} from './platform.mjs';
import {supportsCapabilityPolicy} from './transport.mjs';
const mounted=new WeakMap();
export function mountAtom(rootElement,client,options={}){
 if(!rootElement?.ownerDocument||mounted.has(rootElement))throw atomError('INVALID_ROOT');
 if(options.initialTabId!==undefined&&(!Number.isSafeInteger(options.initialTabId)||options.initialTabId<=0))throw atomError('INVALID_MESSAGE');
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
 let inputUI;
 const navigation=createSectionNavigation({$,onShow:()=>inputUI?.refreshPlacement()});
 $('reader-link').href=options.readerURL||'reader.html';
 let disposed=false,connectionLost=false;const controller=new AbortController(),urls=new Set(),timers=new Set();
 const later=(fn,ms)=>{const timer=setTimeout(()=>{timers.delete(timer);if(!disposed)fn();},ms);timers.add(timer);};
let ownedPicker,connectionSettingsOpen=false;
function ownPickerRequest(tabId,id){ownedPicker?.controller?.abort();const own={tabId,id,controller:new AbortController()};ownedPicker=own;return AbortSignal.any([controller.signal,own.controller.signal]);}

let analysis,selectedState,loadGeneration=0,selectionGeneration=0,tabGeneration=0,tabsGeneration=0,tabsInitialized=false,renderedAt,restorationNotice,selectionIntent=0;
const tab=()=>Number($('tabs').value);
async function rpc(message,signal=controller.signal){const r=await client.request(['inspect-selector','pick','refine-pick'].includes(message.op)?{...message,elementProperties:true}:message,{signal});if(disposed)throw atomError('DISPOSED');return r;}
const pendingActions=new Map(),pendingProperties=new Map(),pendingInspections=new Map();
async function action(fn){
 const id=tab(),epoch=tabGeneration,key=epoch+':'+id,batch=pendingActions.get(key)||{count:0,error:null};pendingActions.set(key,batch);++batch.count;
 try{$('status').textContent='Working…';return await fn();}
 catch(e){batch.error=e.message;}
 finally{if(!--batch.count){pendingActions.delete(key);if(!disposed&&id===tab()&&epoch===tabGeneration)$('status').textContent=batch.error?'Error: '+batch.error:pendingProperties.has(id)?'Working…':'OK';}}
}
async function tabs(){
 const generation=++tabsGeneration,ts=await rpc({op:'tabs'});if(generation!==tabsGeneration)return;
 const current=$('tabs').value,preferred=!tabsInitialized&&options.initialTabId!==undefined?String(options.initialTabId):current;
 $('tabs').replaceChildren(...ts.map(t=>{const o=document.createElement('option');o.value=t.id;o.setAttribute('data-origin',new URL(t.url).origin);o.textContent=(t.title?t.title+' · ':'')+t.url;return o;}));
 if(preferred||tabsInitialized||options.initialTabId!==undefined)$('tabs').value=ts.some(t=>String(t.id)===preferred)?preferred:'';
 tabsInitialized=true;if(current!==$('tabs').value)void changeContext().catch(()=>{});
}
async function load(options={}){
 const id=tab(),generation=++loadGeneration;
 if(pendingProperties.has(id)||pendingInspections.has(id))return;
 if(!Number.isSafeInteger(id)||id<=0){selectedState=null;analysis=null;renderInspection();return;}
 const input=inputUI.snapshot(),receiveInputState=inputUI.stateReplyReceiver(),request={op:'state',tabId:id,observationOwnerId,...(input.active||input.opening?{ownerId:input.ownerId}:{}),refreshDeep:options?.refreshDeep!==false,...(options?.refreshIdentity===true?{refreshIdentity:true}:{})};
 const current=()=>!disposed&&generation===loadGeneration&&id===tab()&&!pendingProperties.has(id)&&!pendingInspections.has(id);
 let state;
 try{state=await rpc(request);}
 catch(e){
  if(!current())return;
  if(options?.refreshIdentity!==true||e.code!=='DEEP_REFRESH_REQUIRED')throw e;
  try{state=await rpc({...request,refreshDeep:true,refreshIdentity:false});}
  catch(fallbackError){if(!current())return;throw fallbackError;}
 }
 if(!current()){receiveInputState({...state,tabId:id});return;}
 selectedState={...state,tabId:id};analysis=state.analysis;observation.update(selectedState);inputUI.update(inspectionDisplayState(selectedState));renderInspection();
}
const sourceAnalysis=createSourceAnalysisClient({url:options.sourceAnalysisWorkerURL,baseURL:document.location?.href,Worker:document.defaultView?.Worker});
const sourceMapUI=createSourceMapUI({document,$,rpc,tab,load,action,requestPermission:options.requestOriginPermission,sourceAnalysis,onReveal:()=>reveal('source-map-details')});
const actionsUI=createActionUI({document,$,rpc,cleanupRpc:m=>client.request(m),tab,action,nativeSource:sourceMapUI});
inputUI=createInputUI({document,$,client,preview:options.inputEditorPreview===true,onPermission:()=>$('input-permissions').click()});
let handoffUI;const observation=createObservationController({client,onChange:s=>handoffUI?.updateObservation(s)}),observationOwnerId=observation.snapshot().ownerId;
const observationHistoryUI=createObservationHistoryUI({$,client});
const propertyUI=createElementPropertiesUI({document,$,onValues:slots=>inputUI.setValueSlots(slots),refresh:()=>$('load').click(),connectProject:()=>reveal('source-connection'),openSource:source=>action(async()=>{await rpc({op:'open',tabId:tab(),source});})});
const explanationUI=createInspectionExplanationUI({document,$,onNext:id=>{if(id==='connect-project')reveal('source-connection');else if(id==='inspect-again')$('load').click();}});
const productionUI=createProductionUI({$,client,onRefresh:load,prepareEnable:selectedRecovery,onEnabled:async recovery=>{if(await reconnectSelection(recovery,{readOnly:true})){reveal('input-editing-details');await inputUI.open();}},onAttach:async()=>{await rpc({op:'attach',tabId:tab(),readOnly:true});await load();},onConnection:()=>reveal('browser-connection')});
function lostConnection(){if(disposed)return;connectionLost=true;ownedPicker?.controller?.abort();ownedPicker=null;++tabGeneration;clearInspection(false);inputUI.update(null);$('status').textContent='Inspector connection lost. Reopen this inspector to continue.';}
const offConnection=client.subscribeConnection?.(lostConnection)||(()=>{});
$('inspector-reconnect').onclick=()=>{if(typeof options.onReconnect==='function')void options.onReconnect();};
function admission(op){const p=selectedState?.capabilityPolicy;return supportsCapabilityPolicy(p)?p.operations?.[op]:{available:false,reason:'Host does not advertise capability policy v1; update the Atom host'};}
function gate(id,decision,otherwise=false){$(id).disabled=otherwise||!decision?.available;$(id).title=decision?.available?'':decision?.reason||'Capability unavailable';}
function attachAvailability(){const p=selectedState?.capabilityPolicy,known=supportsCapabilityPolicy(p),requestAccess=known&&!!options.requestOriginPermission&&p.features['basic.request-site-access'].available;gate('attach',requestAccess?p.features['basic.request-site-access']:$('source-map-readonly').checked&&known?p.features['basic.attach-read-only']:admission('attach'));$('attach').textContent=requestAccess?'Allow site and connect':'Connect to page';}
function hasSelectedRecord(state){return !!(state.selection||state.stale?.target);}
function renderInspection(){
 observationHistoryUI.update(selectedState);
 productionUI.update(selectedState);
 $('load').hidden=connectionLost;$('inspector-reconnect').hidden=!connectionLost||typeof options.onReconnect!=='function';
 const displayState=inspectionDisplayState(selectedState||{}),displayAnalysis=displayState.analysis;
 sourceMapUI.render(displayState);
 actionsUI.render(displayState);
 $('project-setup-status').textContent=selectedState?.projectSetup?.code==='HELPER_DISCONNECTED'?'':selectedState?.projectSetup?.reason||'';
 const view=inspectionView(displayState),selection=view.target;
 renderSelectedList(document,$('selected-list-origin'),view.selectedListProfile,{...displayState.capabilityPolicy?.operations?.open,openSource:source=>action(()=>rpc({op:'open',tabId:tab(),source}))});
 if(selection)navigation.setContext(JSON.stringify([selectedState?.tabId,selectedState?.run,selection.domIdentity?.document??selection.page,selection.domIdentity?.node??selection.instance??selection.selector,selection.property]));
 const explanation=explanationUI.render(displayState,{fallbackPresented:view.nextStep==='connect-project'});if(!hasSelectedRecord(displayState)){$('property-explanation-block').hidden=true;$('explanation-details').hidden=true;}
 $('mode').textContent=view.mode;
 $('site-origin').textContent=$('tabs').selectedOptions?.[0]?.dataset.origin||'No application selected';
 for(const name of ['cache','reload','override','replay'])$('site-'+name).checked=selectedState?.connection?.actions?.includes(name)===true;
 $('site-mode').value=selectedState?.connection?.mode||'read-only';
 $('browser-connection').hidden=selectedState?.attached===true&&!connectionSettingsOpen;
 $('setup-toggle').setAttribute('aria-controls',$('browser-connection').id);
 $('connection-label').textContent=selectedState?.attached?(selectedState.readOnly?'Attached · read-only':'Attached · this tab'):'Not attached';
 if(view.observedAt)renderedAt=view.observedAt;
 const hasTarget=!!displayState.selection;
 $('getting-started').hidden=!!selectedState?.attached||hasTarget;
 $('getting-started-title').textContent=selectedState?.attached?'Choose something on the page':'Start with a page';
 $('getting-started-help').textContent=selectedState?.attached?'Click Select page element, then click a button, label or field in your application. Come back here to see what Atom could observe.':'Choose the browser tab you want to understand and connect it below. You can start without an account, IDE or AI model.';
 $('selection-header').hidden=!selectedState?.attached&&!hasTarget&&!displayState.stale?.target;
 $('selection-context').hidden=!selectedState?.attached&&!hasTarget&&!view.stale;
 $('selection-tools').hidden=!selectedState?.attached;
 $('inputs-empty').hidden=hasTarget||!selectedState?.attached;
 $('inputs-empty').textContent=view.stale?'This snapshot is out of date. Inspect again to see current values.':'Use the selection icon beside Atom, then click an element on your page.';
 const editing=inputUI.snapshot();
 const editableFeature=supportsCapabilityPolicy(selectedState?.capabilityPolicy)&&['inputs.live','inputs.draft-apply'].some(id=>selectedState.capabilityPolicy.features[id]?.code!=='NOT_IMPLEMENTED');
 $('input-editing-details').hidden=(!editableFeature&&$('input-editor').hidden)||(!hasTarget&&!editing.active&&!editing.opening&&!editing.draft?.dirtyCount);
 const readOnly=selectedState?.readOnly===true&&!selectedState?.productionChange?.active,https=(selectedState?.origin||selectedState?.connection?.origin||'').startsWith('https:');
 $('input-permissions').hidden=!readOnly||!editableFeature||editing.active||!!editing.draft?.dirtyCount;
 $('input-permissions').textContent=https?'Enable editing on this live site':'Switch to editing';
 $('input-permissions').onclick=()=>{if(https)return productionUI.requestEditing();return action(async()=>{const recovery=selectedRecovery();await rpc({op:'connect-site',tabId:tab(),connection:{origin:selectedState.origin||selectedState.connection.origin,mode:'development',actions:['override','replay']}});if(await reconnectSelection(recovery)){reveal('input-editing-details');await inputUI.open();}});};
 $('input-editing-help').textContent=readOnly?(https?'This live site is read-only. Enable editing temporarily to try a change.':'Read-only mode is enabled for this page.'):(editing.editor?.sourceKind==='json-response'?'Response fields':'Page fields')+' · relation to this element not established.';
 $('actions-intro').hidden=hasTarget;
 $('actions-intro').textContent=hasTarget?'Explore handlers linked to this element. A source path is not proof that a handler ran.':'Select an element to explore its click handlers and supported interactions.';
 $('inspection-summary').textContent=view.summary;
 $('inspection-summary').hidden=!selectedState?.attached||view.nextStep==='select-element'||explanation.status==='Supported';
 $('computation-result').hidden=!hasTarget||!view.sources.length&&!view.operands.length;
 $('computation-source').hidden=!view.sources.length;
 $('observed-inputs').hidden=!view.operands.length;
 $('evidence-overview').textContent=view.stale?'This snapshot is stale. Inspect again before drawing conclusions.':selection?'Recorded: '+selection.property+' = '+JSON.stringify(selection.value)+'. '+(view.operands.length?view.operands.length+' input value'+(view.operands.length===1?'':'s')+' observed in the selected computation. ':'')+(view.sources.length?view.sources.length+' code-linked location'+(view.sources.length===1?'':'s')+'. ':'')+(view.selectedListSupported?'The recorded text origin is shown in Dependencies.':view.finiteTraceSupported?'A finite trace is available below; its scope and limits still apply.':'Complete data origin is not established. See the scoped records below.'):'Select an element to record evidence, then save a report of what was observed.';
 $('inspection-next').hidden=['attach','select-element'].includes(view.nextStep)||explanation.status==='Supported';
 $('detach').hidden=!selectedState?.attached;
 $('load').hidden=connectionLost||!view.target&&!view.stale;
 const pendingPicker=['starting','picking','resolving'].includes(selectedState?.picker?.status);
 const next={attach:['Choose tab and attach',()=>reveal('browser-connection')],'select-element':[pendingPicker?'Cancel element selection':'Select page element',()=>$('pick').click()],'inspect-again':['Inspect again',()=>$('load').click()],'connect-project':['Connect project for source',()=>reveal('source-connection')],'start-observation':['Set up input observation',()=>reveal('source-connection')],unsupported:['View supported boundaries',()=>reveal('evidence-scope-details')]};
 const [nextLabel,nextAction]=next[view.nextStep];$('inspection-next').textContent=nextLabel;$('inspection-next').onclick=nextAction;
 $('inspection-next').disabled=view.nextStep==='inspect-again'&&(!admission('inspect-selector')?.available||!selectedState?.selection&&!selectedState?.stale?.target)||view.nextStep==='select-element'&&!admission(pendingPicker?'cancel-pick':'pick')?.available;
 $('source-project').textContent=view.mode==='Basic'?'Connect project':'Project connection';
 $('source-overview').textContent=view.stale?'Source links expired with this snapshot. Inspect again.':view.sources.length?view.sources.length+' code-linked source location'+(view.sources.length===1?'':'s')+'. A code link alone does not establish execution or data ancestry.':'No selected-property source association. Connect the project for supported source links, or explore this release’s sources separately.';
 const target=selection||displayState.stale?.target;
 const trial=selectedState?.diagnosticExperiment;
 const matchingTrial=trial&&selectedState?.deepExperiment?.id===trial.result?.id&&trial.target?.selector===target?.selector&&trial.target?.property===target?.property;
 const restored=restorationNotice&&selectedState?.attached&&restorationNotice.tab===tab()&&restorationNotice.epoch===tabGeneration&&restorationNotice.intent===selectionIntent&&restorationNotice.origin===selectedState.origin&&restorationNotice.selector===target?.selector&&restorationNotice.property===target?.property&&restorationNotice.property===selectedState.property&&(!restorationNotice.id||matchingTrial&&restorationNotice.id===trial.result.id);
 $('atom-result').textContent=restored?restorationNotice.text:matchingTrial?trial.result.status+' · Historical controlled trials · baseline '+JSON.stringify(trial.result.trials?.[0]?.a?.value)+' · '+trial.result.scope:'';
 const latestText=displayState.elementInspection?.properties.find(row=>row.property==='text')?.latestObservation;
 const headerSelection=displayState.selection;
 const presentation=selectionPresentation(headerSelection&&latestText?{...headerSelection,text:latestText.value}:selection||headerSelection,{stale:!headerSelection&&view.stale,picker:selectedState?.picker});
 $('selection-title').textContent=presentation.title;$('selection-title').title=selection?.text||presentation.title;
 $('selection-value').textContent=presentation.value;$('selection-value').hidden=!!displayState.elementInspection||!hasTarget;
 $('selection-kind').textContent=presentation.kind;$('selection-header').setAttribute('data-empty',String(!target));
 if((selectedState&&!selectedState.attached&&!target)||!Number.isSafeInteger(tab())||tab()<=0)$('browser-connection').open=true;
 $('setup-toggle').setAttribute('aria-expanded',String(!$('browser-connection').hidden&&$('browser-connection').open));
 $('commit-summary').textContent=view.commit.status+' · '+view.commit.reason;
 $('native-state-summary').hidden=!view.nativeStateAncestors;
 $('native-state-summary').textContent=view.nativeStateAncestors?.summary||'';
 const profile=view.firstReadProfile;
 $('first-read-summary').textContent=profile.status+' · '+(profile.fullPath?'HTTP field → original read → committed property':profile.reason||'Finite trace unavailable');
 $('first-read-scope').textContent=profile.fullPath?profile.scope+' Snapshot; inspect again after changes.':'';
 $('first-read-joins').replaceChildren(...(profile.fullPath?['Code-linked · reviewed source/effect derivation '+profile.sourceProof.profile,'Observed · '+profile.occurrence.pointer+' = '+JSON.stringify(profile.occurrence.readValue)+' · parse '+profile.occurrence.parseId+' · browser request '+profile.occurrence.requestId,'Observed · read '+profile.occurrence.readId+' → target '+profile.occurrence.targetId+' → commit '+profile.occurrence.commitId,...profile.limits]:[]).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 $('property').value=pendingProperties.get(tab())?.property||selectedState?.property||'text';$('property').disabled=pendingProperties.has(tab());
 $('save-report').disabled=!displayState.selection&&!displayState.stale?.target;
 handoffUI.updateCurrent({tabId:tab(),observationSupported:supportsCapabilityPolicy(selectedState?.capabilityPolicy)&&selectedState.capabilityPolicy.features['production.observations']?.code!=='NOT_IMPLEMENTED',observationPolicy:selectedState?.observationPolicy,available:!!(displayState.selection||displayState.stale?.target)&&supportsCapabilityPolicy(selectedState?.capabilityPolicy)&&!connectionLost,contextKey:JSON.stringify([tab(),tabGeneration,selectionGeneration,selectedState?.run,displayState.selection?.domIdentity,displayState.selection?.observedAt,displayState.stale?.at,selectedState?.property,connectionLost,selectedState?.picker?.status,selectedState?.picker?.id])});
 gate('load',admission('inspect-selector'),!displayState.selection?.selector&&!displayState.stale?.target?.selector);
 const picker=selectedState?.picker,picking=['starting','picking','resolving'].includes(picker?.status);
 gate('pick',admission(picking?'cancel-pick':'pick'));$('pick').setAttribute('aria-label',picking?'Cancel element selection':'Select page element');$('pick').setAttribute('aria-pressed',String(picking));$('pick').title=picking?'Cancel selection; Escape also cancels on the page':$('pick').disabled?$('pick').title:'Select page element';
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
 $('freshness').textContent=latestText?'Page values checked. Refresh to update the explanation.':view.stale?'Stale · '+view.reason:view.observedAt?'Snapshot at '+new Date(view.observedAt).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit',fractionalSecondDigits:3})+'. Not live.':'No observation yet.';
 $('freshness').title='Recorded snapshot. Inspect again after changing the app.';
 $('capabilities').textContent=view.mode==='Instrumented'?'Instrumented snapshot · open IDE + source + dev plugin. Only supported executions are available. A finite supported trace, when available, is shown separately above.':view.mode==='Source-linked'?'Source-linked snapshot · open IDE and source available. Operand values require supported dev instrumentation.':'Basic · DOM observation only. Connect the open IDE for source links; add the open dev plugin for supported operand observations.';
 $('state-handoffs').replaceChildren(...(view.handoffs.length?view.handoffs:[{status:view.stale?'Stale':'Unknown/Unsupported',reason:'No supported native state handoff for this selected trace.'}]).map(h=>{const item=document.createElement('li');item.textContent=h.status+' · '+(h.queueId?'queue '+h.queueId+' · update '+(h.updateId||'unknown')+' · ':'')+(h.parsedObject?'JSON consumption '+h.parsedObject.consumptionId+' · ':'')+(h.reason||h.scope||'')+(view.finiteTraceSupported?' This state handoff alone does not establish current field value ancestry; see the separately scoped finite trace.':' Current field value ancestry is unknown.');return item;}));
 $('exchange-bindings').replaceChildren(...(view.exchanges.length?view.exchanges:[{status:view.stale?'Stale':'Unknown/Unsupported',reason:'No exact exchange binding for a supported selected trace.'}]).map(b=>{const item=document.createElement('li');item.textContent=b.status+' · '+(b.requestId?b.method+' '+b.url+' · browser request '+b.requestId+' · ':'')+(b.reason||b.scope||'')+(view.finiteTraceSupported?' This exchange identity alone does not establish complete HTTP provenance; see the separately scoped finite trace.':' Complete HTTP provenance is not established.');return item;}));
 const journal=view.codeJournal;
 $('code-journal-summary').textContent=journal?journal.freshness+' · collected '+new Date(journal.capturedAt).toISOString()+' · '+journal.counts.captured+' compiled scripts, '+journal.counts.hashed+' digests, '+journal.counts.pending+' pending. '+(journal.freshness==='Stale'?'Collection changed or was interrupted; Inspect again for a newer snapshot.':'Historical collection snapshot; later compilations may be absent.'):'No compilation snapshot for this selection. Attach and inspect again.';
 $('code-journal-limits').textContent=journal?'Independent browser observations. Compilation does not establish calls, source equivalence, readonly effects or field ancestry. Earlier/future effects and other targets/workers are not excluded. '+(journal.armedBeforeNavigation?'Collection started before this navigation. ':'Earlier history unavailable: attached after navigation. ')+(journal.gaps.length?'Collection boundaries: '+journal.gaps.join(', ')+'. ':'No recorded acquisition gaps in this bounded snapshot. '):'';
 $('code-journal-records').textContent=journal?journal.scripts.map(r=>'script '+r.scriptId+' · '+r.world+' · '+r.resource+' · '+r.sourceStatus+(r.digest?' · SHA-256 '+r.digest:'')).join('\n'):'';
 $('sources').replaceChildren();$('expressions').replaceChildren();$('fields').replaceChildren();$('operands').replaceChildren();
 renderAtom(displayAnalysis?.stateatom,view.finiteTraceSupported,displayState);
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
 for(const node of view.operands){const item=document.createElement('li');item.className='sp-data-row'+(node.expression.length>60||JSON.stringify(node.value).length>80?' sp-atom-data-long':'');const expression=document.createElement('span'),value=document.createElement('code');value.className='sp-value';expression.textContent=node.expression+' = ';value.textContent=JSON.stringify(node.value);item.append(expression,value);$('operands').append(item);}
 $('values-unavailable').textContent=view.operands.length?'':'No scalar operand values observed for this selected computation.';
 $('experiment-result').textContent=displayState.experiment?displayState.experiment.status+': '+displayState.experiment.reason:'';
 const candidates=[...(displayAnalysis?.fields||[])];
 for(const request of selectedState?.requests||[])for(const field of flatten(request.json))if(!candidates.some(c=>c.requestId===request.id&&c.path===field.path))candidates.push({...field,url:request.url,requestId:request.id,status:'Unknown',method:'manually selectable observed response leaf'});
 // Keep the existing experiment index contract without mutating the resolver result.
 fields=candidates;
 candidates.forEach((field,i)=>{const option=document.createElement('option');option.value=i;option.textContent=field.status+' '+field.url+' #'+field.path+' = '+JSON.stringify(field.value);$('fields').append(option);});
 const multi=propertyUI.render(displayState);
 if(multi){
  for(const id of ['computation-result','property-explanation-block','explanation-details','inspection-summary','inspection-next','source-overview'])$(id).hidden=true;
  $('selection-value').textContent=displayState.elementInspection.properties.some(r=>r.status==='Stale')?'Snapshot needs refresh':'Element snapshot';
  $('evidence-overview').textContent=(view.stale||displayState.elementInspection.properties.some(r=>r.status==='Stale')?'Some records are out of date. Refresh the inspection before using them. ': '')+(displayState.elementInspection.properties.length>1?'Properties were read separately, not in one render snapshot.':'Observation and supporting records for this property.');
  $('primary-evidence-label').textContent='Additional '+(selectedState.property||'text')+' records · editor and experiment context';
 }
 $('primary-evidence-label').hidden=!multi;
 const eligible=admission('deep-experiment')?.available===true;
 gate('atom-run',admission('deep-experiment'),!selection||!analysis||view.stale);gate('atom-restore',admission('restore'));
 gate('experiment',admission('experiment'),!selection||!candidates.length);
 $('experiment-eligibility').textContent=!eligible?(admission('deep-experiment')?.reason||'Capability unavailable'):selection?.property==='text'&&candidates.length?'Text response experiment available for a recorded JSON leaf. Response presence alone is not dependency. Trials reset storage/cache and reload; server writes are not undone.':'Controlled property trials require explicit response variants below. The simpler response-field experiment supports text only. Trials reset storage/cache and reload; server writes are not undone.';
 $('evidence').textContent=selectedState?JSON.stringify({analysis:displayAnalysis,events:selectedState.events,bufferBytes:selectedState.bufferBytes,...(matchingTrial?{experiment:trial}:{})},null,2):'';
}
function reveal(id){const e=$(id),scroller=$('scroll');if(id==='browser-connection'){connectionSettingsOpen=true;e.hidden=false;$('setup-toggle').setAttribute('aria-expanded','true');}navigation.reveal(e);for(let parent=e;parent&&parent!==root;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;scroller.scrollTop+=e.getBoundingClientRect().top-scroller.getBoundingClientRect().top-16;(e.tagName==='DETAILS'?e.querySelector('summary'):e).focus({preventScroll:true});}
 $('setup-toggle').onclick=()=>{const panel=$('browser-connection');if(panel.open&&!panel.hidden){connectionSettingsOpen=false;panel.open=false;panel.hidden=selectedState?.attached===true;$('setup-toggle').setAttribute('aria-expanded','false');}else reveal('browser-connection');};
 $('browser-connection').ontoggle=()=>{const panel=$('browser-connection');if(!panel.open&&selectedState?.attached){const returnFocus=panel.contains(document.activeElement);connectionSettingsOpen=false;panel.hidden=true;if(returnFocus)$('setup-toggle').focus({preventScroll:true});}$('setup-toggle').setAttribute('aria-expanded',String(!panel.hidden&&panel.open));};
 $('diagnostic-toggle').onclick=()=>reveal('diagnostics-details');
 $('action-source-setup').onclick=()=>reveal('source-section');
 $('source-project').onclick=()=>reveal('source-connection');$('source-import').onclick=()=>reveal('source-map-details');
 for(const d of root.querySelectorAll('.sp-atom-tools > details, .sp-atom-inspection > details'))d.classList.add('sp-disclosure');
let fields=[];
function clearInspection(keepTarget=true,{preserveViewport=false,preserveIntent=false}={}){if(!preserveIntent){++selectionIntent;void observation.contextChanged();}if(!preserveViewport)renderedAt=null;++selectionGeneration;const property=$('property').value;++loadGeneration;selectedState=keepTarget&&selectedState?{...selectedState,selection:null,analysis:null,stale:null}:null;analysis=null;renderInspection();if(keepTarget)$('property').value=property;}
async function changeContext(){const productionCleanup=productionUI.contextChanged(),observationCleanup=observation.contextChanged('tab-switch'),inputCleanup=inputUI.close('Selected tab changed'),owned=ownedPicker;owned?.controller?.abort();ownedPicker=null;++tabGeneration;clearInspection(false);if(owned)await client.request({op:'cancel-pick',tabId:owned.tabId,pickerId:owned.id}).catch(()=>{});await Promise.all([inputCleanup,productionCleanup,observationCleanup]);}
function retainPendingEdits(){if(!inputUI.snapshot().draft?.dirtyCount)return false;reveal('input-editing-details');inputUI.explainPendingDraft();return true;}
async function inspectSelection(selector,reason,expectedIdentity){
 if(retainPendingEdits())return;
 const id=tab(),inputCleanup=inputUI.close(reason);clearInspection();const intent=selectionIntent;pendingInspections.set(id,intent);let inspected=false;
 try{await inputCleanup;if(id!==tab())return;await rpc({op:'inspect-selector',tabId:id,selector,...(expectedIdentity?{expectedIdentity}:{})});inspected=true;}
 // Preserve the completed snapshot; a later intent or failure uses ordinary recovery.
 finally{if(pendingInspections.get(id)===intent)pendingInspections.delete(id);if(id===tab())await load({refreshDeep:!inspected||intent!==selectionIntent,refreshIdentity:inspected&&intent===selectionIntent});}
}
async function inspectAgain(){
 const selector=selectedState?.selection?.selector||selectedState?.stale?.target?.selector;
 if(!selector)throw Error('Select an element first');
 return inspectSelection(selector,'Inspect again');
}
function flatten(v,p='',out=[]){if(v!==null&&typeof v==='object')for(const[k,x]of Object.entries(v))flatten(x,p?p+'.'+k:k,out);else out.push({path:p,value:v});return out;}
$('connect-receipt').onclick=()=>action(async()=>{try{const r=parseConnectionReceipt($('connection-receipt').value);if(options.requestOriginPermission&&!await options.requestOriginPermission(r.url))throw Error('Helper origin permission denied');await rpc({op:'pair',url:r.url,token:r.token,origin:r.origin,sourceRoot:r.sourceRoot,receipt:r});await load();}finally{$('connection-receipt').value='';}});
$('pair').onclick=()=>action(async()=>{const url=$('bridge').value,origin=$('origin').value;if(!helperURL(url)||!appOrigin(origin,{exact:true}))throw Error('Enter canonical origins without paths');if(options.requestOriginPermission&&!await options.requestOriginPermission(url))throw Error('Helper origin permission denied');await rpc({op:'pair',url,token:$('token').value,origin,sourceRoot:$('source-root').value});await load();});
function selectedRecovery(){const selection=selectedState?.selection;return{tabId:tab(),epoch:tabGeneration,origin:selectedState?.origin||selectedState?.connection?.origin||$('tabs').selectedOptions?.[0]?.dataset.origin,...(selection?.domIdentity?{selector:selection.selector,expectedIdentity:{document:selection.domIdentity.document,node:selection.domIdentity.node}}:{})};}
async function reconnectSelection(recovery,{readOnly=false}={}){
 const id=tab(),epoch=tabGeneration;if(recovery&&(recovery.tabId!==id||recovery.epoch!==epoch))return;
 const current=()=>!disposed&&id===tab()&&epoch===tabGeneration&&(!recovery?.origin||$('tabs').selectedOptions?.[0]?.dataset.origin===recovery.origin);
 if(!current())return;await rpc({op:'attach',tabId:id,readOnly});if(!current())return;
 connectionSettingsOpen=false;$('browser-connection').open=false;$('site-permissions-details').open=false;
 if(recovery?.selector&&recovery.expectedIdentity)await inspectSelection(recovery.selector,'Connection updated',recovery.expectedIdentity);else await load({refreshDeep:false});
 if(!current())return;navigation.show('inputs');$('scroll').scrollTop=0;return !!selectedState?.selection;
}
$('save-site').onclick=()=>action(async()=>{const id=tab(),epoch=tabGeneration,recovery=selectedRecovery(),wasAttached=selectedState?.attached,origin=$('tabs').selectedOptions?.[0]?.dataset.origin,mode=$('site-mode').value,actions=mode==='development'?['cache','reload','override','replay'].filter(n=>$('site-'+n).checked):[];if(!appOrigin(origin,{exact:true}))throw Error('Select an exact application origin');if(selectedState?.capabilityPolicy?.features?.['basic.request-site-access']?.available&&options.requestOriginPermission&&!await options.requestOriginPermission(origin))throw Error('Site origin permission denied');if(id!==tab()||epoch!==tabGeneration)return;await rpc({op:'connect-site',tabId:id,connection:{origin,mode,actions}});if(id!==tab()||epoch!==tabGeneration)return;if(wasAttached)await reconnectSelection(recovery,{readOnly:mode==='read-only'});else await load({refreshDeep:false});});
$('forget-site').onclick=()=>action(async()=>{await rpc({op:'forget-site',tabId:tab()});await load();});
$('refresh-tabs').onclick=()=>action(async()=>{await tabs();await action(()=>load());});$('tabs').onchange=()=>{const cleanup=changeContext();return action(async()=>{await cleanup;await load();});};$('attach').onclick=()=>action(async()=>{const id=tab(),epoch=tabGeneration,origin=$('tabs').selectedOptions?.[0]?.dataset.origin;if(selectedState?.capabilityPolicy?.features?.['basic.request-site-access']?.available&&(!options.requestOriginPermission||!await options.requestOriginPermission(origin)))throw Error('Site origin permission denied');await rpc({op:'attach',tabId:id,readOnly:$('source-map-readonly').checked});if(disposed||id!==tab()||epoch!==tabGeneration)return;await load();if(disposed||id!==tab()||epoch!==tabGeneration)return;if(selectedState?.attached&&!$('pick').disabled&&$('browser-connection').contains(document.activeElement))$('pick').focus({preventScroll:true});connectionSettingsOpen=false;$('browser-connection').open=false;$('browser-connection').hidden=selectedState?.attached===true;$('setup-toggle').setAttribute('aria-expanded','false');$('source-connection').open=false;$('scroll').scrollTop=0;});$('pick').onclick=()=>action(async()=>{if(!['starting','picking','resolving'].includes(selectedState?.picker?.status)&&retainPendingEdits())return;await inputUI.close('Element selection changed');const cancelling=['starting','picking','resolving'].includes(selectedState?.picker?.status),pickerId=cancelling?selectedState.picker.id:crypto.randomUUID();const signal=cancelling?controller.signal:ownPickerRequest(tab(),pickerId);if(cancelling)ownedPicker?.controller?.abort();await rpc({op:cancelling?'cancel-pick':'pick',tabId:tab(),pickerId},signal);if(cancelling)ownedPicker=null;await load({refreshDeep:!cancelling});});$('inspect-selector').onclick=()=>action(()=>inspectSelection($('selector').value,'Manual selection changed'));$('load').onclick=()=>action(inspectAgain);$('detach').onclick=()=>action(async()=>{await rpc({op:'detach',tabId:tab()});await load();});
$('experiment').onclick=()=>action(async()=>{const id=tab(),generation=selectionGeneration;const field=fields[Number($('fields').value)];$('experiment-result').textContent='Running…';const result=await rpc({op:'experiment',tabId:tab(),field,value:JSON.parse($('value').value),controlPath:$('control').value,actions:JSON.parse($('actions').value)});if(id!==tab()||generation!==selectionGeneration)return;$('experiment-result').textContent=result.status+': '+result.reason;$('evidence').textContent=JSON.stringify(result,null,2);});
const unsubscribe=client.subscribe(m=>{if(disposed)return;if(['selection','state-invalidated'].includes(m.event)&&m.tabId===tab()){const observer=observation.snapshot();if(m.event==='state-invalidated'&&m.scope==='input-history'&&observer.tabId===m.tabId&&observer.window?.status==='recording'&&m.windowId===observer.window.windowId&&selectedState?.observationAccess==='owned'&&selectedState.productionObservation?.windowId===observer.window.windowId&&!observer.connectionLost){
 if(m.inspectionChanged===true){analysis=null;selectedState={...selectedState,analysis:null};renderInspection();}
 void action(()=>load({refreshDeep:false}));return;
 }if(m.event==='state-invalidated'&&m.scope==='production-observation'&&(observer.noticeTabId===m.tabId||selectedState?.observationAccess==='historical')&&!observer.connectionLost){void action(()=>load({refreshDeep:false}));return;}
 const input=inputUI.snapshot();
 if(m.event==='state-invalidated'&&m.scope==='input-history'&&input.tabId===m.tabId&&(input.active||input.opening)&&!input.connectionLost){
  // Keep the selected identity and mounted editor through its own refresh. The
  // previous explanation loses currency immediately; only a fresh read updates it.
  if(m.inspectionChanged===true&&selectedState){++selectionGeneration;analysis=selectedState.analysis?{...selectedState.analysis,actionsInvalidated:true,
   stateatom:selectedState.analysis.stateatom?{...selectedState.analysis.stateatom,runtime:{...selectedState.analysis.stateatom.runtime,status:'Stale',reason:'Page values changed; refresh the explanation.'}}:undefined,
   actionBindings:selectedState.analysis.actionBindings?.map(binding=>({...binding,freshness:'Stale'}))}:null;selectedState={...selectedState,analysis};renderInspection();}
  void action(()=>load());return;
 }
 const pickerHistory=['starting','picking','resolving','cancelled'].includes(selectedState?.picker?.status);clearInspection(true,{preserveViewport:m.event==='state-invalidated',preserveIntent:m.event==='state-invalidated'});void action(()=>load({refreshDeep:!pickerHistory}));}});const ready=tabs().then(load).then(()=>{if(!disposed&&$('status').textContent==='Choose a local app and attach.')$('status').textContent=selectedState?.attached?'Ready':'Connect a page to begin';}).catch(e=>{if(disposed)return;if(e.code==='INSPECTOR_DISCONNECTED')lostConnection();else $('status').textContent='Error: '+e.message;});

function renderAtom(atom,finiteTraceSupported=false,displayState=selectedState){$('atom-chain').replaceChildren();$('atom-independent').textContent='';if(!atom){$('atom-summary').textContent=displayState?.stale?'Stale · '+displayState.stale.reason+' · inspect again':'Unknown/Unsupported: no inspection';return;}const r=atom.runtime;$('atom-summary').textContent=(r.status||'Unknown/Unsupported')+' · '+atom.target.property+' = '+JSON.stringify(atom.target.value)+' · '+(r.status==='Observed'?'selected computation snapshot':r.reason||'');
 for(const n of (r.nodes||[])){const d=document.createElement('details'),s=document.createElement('summary');s.textContent=n.status+' · '+n.kind+' · '+n.expression+(n.kind==='potential-property-write'?' · potential access; completion unknown':' = '+JSON.stringify(n.value))+(n.origin?' · parsed object/field '+n.origin.url+' #'+n.origin.pointer+(finiteTraceSupported?' · independent fragment value origin ':' · current value origin ')+(n.valueOrigin||'Unknown/Unsupported')+(finiteTraceSupported?' · This parsed-identity fragment alone does not establish ancestry; see the separately scoped finite trace for the original selected read.':''):'')+(n.boundary?' · '+n.boundary:'');const p=document.createElement('pre');p.textContent=JSON.stringify(n,null,2);d.append(s,p);$('atom-chain').append(d);}
 for(const slice of atom.slices||[]){const d=document.createElement('details'),s=document.createElement('summary');s.textContent='Code-linked · possible source slice · '+slice.nodes.length+' nodes';const p=document.createElement('pre');p.textContent=JSON.stringify(slice,null,2);d.append(s,p);$('atom-chain').append(d);}$('atom-independent').textContent=JSON.stringify(r.independentObservations||[],null,2);}
$('property').onchange=()=>action(async()=>{
 const id=tab(),property=$('property').value;if(pendingProperties.has(id))return;const inputCleanup=inputUI.close('Selected property changed');
 pendingProperties.set(id,{property});clearInspection();
 try{await inputCleanup;await rpc({op:'property',tabId:id,property});}
 finally{pendingProperties.delete(id);if(!disposed&&id===tab())await action(load);}
});
$('source-map-readonly').onchange=attachAvailability;
$('atom-run').onclick=()=>action(async()=>{restorationNotice=null;const id=tab(),generation=selectionGeneration;$('atom-result').textContent='Running controlled trials…';const r=await rpc({op:'deep-experiment',tabId:tab(),variants:JSON.parse($('atom-variants').value)});if(id!==tab()||generation!==selectionGeneration)return;$('atom-result').textContent=r.status+' · baseline '+JSON.stringify(r.baseline)+' · '+r.scope;$('evidence').textContent=JSON.stringify(r,null,2);});
$('atom-restore').onclick=()=>action(async()=>{const id=tab(),intent=selectionIntent,epoch=tabGeneration,experimentId=selectedState?.deepExperiment?.id,target=selectedState?.selection||selectedState?.stale?.target,origin=selectedState?.origin;const r=await rpc({op:'restore',tabId:id});if(id!==tab()||epoch!==tabGeneration||intent!==selectionIntent)return;restorationNotice={id:experimentId,tab:id,epoch,intent,origin,selector:target?.selector,property:target?.property,text:'Restored by reload + cache/storage reset · '+JSON.stringify(r.value)};await load();});

let reportLibrary;
handoffUI=createHandoffUI({$,observation,
 getSource:({signal}={})=>reportLibrary.getSource(signal),
 getCurrent:async({signal}={})=>{
  const id=tab(),epoch=tabGeneration,generation=selectionGeneration;
  const observer=observation.snapshot(),options={tabId:id,includeContent:$('diagnostic-content').checked,notes:$('diagnostic-notes').value,includeCategories:['inputIdentities','inputValues','inputLocations','inputErrors'],signal};if(observer.window?.status==='recording')throw atomError('OBSERVATION_RECORDING','Stop the window before preparing its report');
  const result=observer.window?await inputUI.captureObservation({...options,observationOwnerId:observer.ownerId,windowId:observer.window.windowId}):await inputUI.capture(options);
  if(id!==tab()||epoch!==tabGeneration||generation!==selectionGeneration)throw atomError('STALE_CAPTURE','Selected occurrence changed; prepare the current issue again.');
  return result;
 },
 saveReviewed:async(raw,{signal})=>{const result=await rpc({op:'save-handoff',raw},signal);$('diagnostic-status').textContent='Saved a reviewed report locally; not sent.'+(result.evicted.length?' Oldest local reports removed by retention: '+result.evicted.length+'.':'');await reportLibrary.refresh();return result;},
 download:(raw,name)=>{const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;urls.add(url);a.click();later(()=>{URL.revokeObjectURL(url);urls.delete(url);},1000);}
});
reportLibrary=createHandoffLibrary({$,document,rpc,onContext:next=>handoffUI.update(next),openReport:(raw,options)=>handoffUI.openSaved(raw,options),openLegacy:({raw,record:r})=>{
 $('export-json').value=raw;$('export-summary').textContent=r.target.selector+' · '+r.target.property+' · '+r.freshness+' · '+r.sources.length+' source locations · '+r.network.length+' observed exchanges · excerpts '+(r.contentPolicy.includeContent?'included':'excluded');$('export-review-status').textContent='No file downloaded. Review before sharing.';$('export-review').showModal();
}});
$('save-report').onclick=()=>action(async()=>{const r=await rpc({op:'save-diagnostic',tabId:tab(),includeContent:$('diagnostic-content').checked,notes:$('diagnostic-notes').value});await reportLibrary.refresh(r.id);$('diagnostic-status').textContent='Saved historical snapshot locally';});
$('export-cancel').onclick=()=>{$('export-review').close();$('export-json').value='';};
$('export-review').addEventListener('close',()=>{$('export-json').value='';},{signal:controller.signal});
$('export-omit-content').onclick=()=>{try{$('export-json').value=serializeDiagnostic(omitDiagnosticContent(parseDiagnostic($('export-json').value)));$('export-review-status').textContent='Excerpts removed. Review remaining target values, notes and URLs.';}catch(e){$('export-review-status').textContent='Invalid diagnostic: '+e.message;}};
$('export-confirm').onclick=()=>{try{const r=parseDiagnostic($('export-json').value),url=URL.createObjectURL(new Blob([$('export-json').value],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='stateatom-'+r.id+'.stateatom.json';urls.add(url);a.click();later(()=>{URL.revokeObjectURL(url);urls.delete(url);},1000);$('export-review').close();$('diagnostic-status').textContent='Exported reviewed diagnostic JSON · not a State Card';}catch(e){$('export-review-status').textContent='Invalid diagnostic: '+e.message;}};
$('unpair').onclick=()=>action(async()=>{await rpc({op:'unpair'});await load();});
void reportLibrary.refresh().catch(e=>{if(disposed)return;$('diagnostic-status').textContent='Local reports unavailable: '+e.message;});

return {ready,element:root,dispose(){observationHistoryUI.dispose();reportLibrary.dispose();handoffUI.dispose();const productionCleanup=productionUI.dispose(),observationCleanup=observation.dispose(),inputCleanup=inputUI.dispose();ownedPicker?.controller?.abort();const cleanup=ownedPicker?client.request({op:'cancel-pick',tabId:ownedPicker.tabId,pickerId:ownedPicker.id}).catch(()=>{}):Promise.resolve();ownedPicker=null;sourceMapUI.dispose();const actionCleanup=actionsUI.dispose();if(disposed)return;disposed=true;++loadGeneration;controller.abort();unsubscribe();offConnection();for(const t of timers)clearTimeout(t);for(const u of urls)URL.revokeObjectURL(u);timers.clear();urls.clear();$('export-review').close();root.remove();mounted.delete(rootElement);return Promise.all([cleanup,inputCleanup,productionCleanup,observationCleanup,actionCleanup]).then(()=>{});}};
}
