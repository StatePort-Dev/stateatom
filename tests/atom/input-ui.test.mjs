// SPDX-License-Identifier: Apache-2.0
// Controlled DOM/client models; no browser/native acceptance credit.
import test from'node:test';import assert from'node:assert/strict';import{createInputUI}from'../../packages/atom/src/input-ui.mjs';import{describeCapabilities}from'../../packages/atom/src/transport.mjs';import{createResponseLedger}from'../../core/response-ledger.mjs';
import{createControlLedger}from'../../core/control-ledger.mjs';import{prepareExperimentPlan}from'../../core/experiment-plan.mjs';
function node(tag='div'){return{get parentElement(){return this.parent;},prepend(...v){for(const n of [...v].reverse()){n.remove?.();n.parent=this;this.children.unshift(n);}},tagName:tag.toUpperCase(),children:[],attributes:{},value:'',textContent:'',append(...v){for(const n of v){n.remove?.();n.parent=this;this.children.push(n);}},remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null;},replaceWith(next){const p=this.parent,i=p?.children.indexOf(this);if(i>=0){next.remove();p.children[i]=next;next.parent=p;this.parent=null;}},replaceChildren(...v){for(const n of this.children)n.parent=null;this.children=[];this.append(...v);},setAttribute(k,v){this.attributes[k]=v;}};}
const target={tabId:1,origin:'http://127.0.0.1:4173',run:'r',document:'d',node:'n',selector:'#confirm',property:'disabled',value:true,observedAt:1,build:null};
const cap=describeCapabilities({url:target.origin+'/',permission:true,grants:['read','inject','cache','reload','override','replay'],lease:'owned',attached:true,hasSelection:true,hasAnalysis:true,nativeInputOwner:true,workerIndependent:true,inputSourceKind:'json-response',hasInputEditor:true});
const find=(el,tag)=>el.tagName===tag?el:el.children.map(n=>find(n,tag)).find(Boolean);
const inlineBinding={kind:'json-response',name:'quota',value:5,...target,requestId:'q1',requestOrdinal:1,url:target.origin+'/api',method:'GET',pointer:'/value'};
async function fixture({initialInputAbsent=false,initialValue=true}={}){
 const elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);},ledger=createResponseLedger({investigationId:'i',target});let ordinal=0,opened=false,currentPolicy=cap;
 const snap=()=>({...ledger.snapshot(),sourceKind:'json-response',cleanup:'inactive',observation:{status:'Observed',value:true,dependency:'unknown'}}),observe=value=>ledger.observeResponse({url:target.origin+'/api',method:'GET',requestId:'q'+(++ordinal),requestOrdinal:ordinal,document:'d',body:JSON.stringify({value})});observe(initialValue);
 const state=()=>({tabId:1,run:'r',capabilityPolicy:currentPolicy,inputs:initialInputAbsent&&!opened?null:snap(),selection:{domIdentity:{document:'d',node:'n',property:'disabled'}}});
 const calls=[],client={request:async p=>{calls.push(p);if(p.op==='capabilities')return currentPolicy;if(p.op==='inputs-open'){opened=true;return snap();}if(p.op==='inputs-read')return snap();if(p.op==='inputs-close')return{...snap(),closed:true};throw Error('Unexpected mutation '+p.op);}};
 const view=createInputUI({document:{createElement:node},$,client});$('input-source').value='json-response';view.update(state());await new Promise(r=>setTimeout(r,0));await $('input-open').onclick();return{$,view,calls,state,setPolicy:value=>{currentPolicy=value;},change:value=>{observe(value);view.update(state());},row:()=>$('input-fields').children[0]};
}
test('same response id refresh changes a boolean row into a usable numerical field',async()=>{const f=await fixture();try{assert.equal(find(f.row(),'INPUT'),undefined);f.change(5);const input=find(f.row(),'INPUT');assert(input,'numeric resource must have a text input');assert.equal(input.inputMode,'decimal');assert.equal(input.value,'5');await f.$('input-mode-draft').onclick();input.value='6';input.oninput();assert.equal(f.view.snapshot().draft.canApply,true);assert.equal(f.view.snapshot().draft.entries[0].value,6);}finally{await f.view.dispose();}});

test('a linked value uses the same editor node once, retains drafts and sends no mutation on binding',async()=>{
 const f=await fixture({initialValue:5});try{
  const row=f.row(),field=find(row,'INPUT'),container=node(),fallback=node('code'),label=node('button'),calls=f.calls.length;
  f.view.setValueSlots([{container,fallback,label,binding:inlineBinding}]);
  assert.equal(container.children[0],row);assert.equal(f.$('input-fields').children.length,0);assert.equal(find(container,'INPUT'),field);assert.equal(field.attributes['aria-label'],'quota');assert.equal(f.calls.length,calls);
  await f.$('input-mode-draft').onclick();field.value='-';field.oninput();assert.equal(find(container,'INPUT').value,'-');assert.equal(f.view.snapshot().draft.dirtyCount,1);
  f.view.setValueSlots([]);assert.equal(f.$('input-linked-values').children[0],row);assert.equal(find(row,'INPUT'),field);assert.equal(field.value,'-');assert.equal(f.calls.filter(c=>c.op==='inputs-apply').length,0);
  const next=node();f.view.setValueSlots([{container:next,fallback,label:node('button'),binding:inlineBinding}]);assert.equal(next.children[0],row);assert.equal(f.$('input-linked-values').children.length,0);assert.equal(field.value,'-');
 }finally{await f.view.dispose();}
});
test('a new response occurrence removes the old inline association without merging equal named fields',async()=>{
 const f=await fixture({initialValue:5});try{
  const container=node();f.view.setValueSlots([{container,fallback:node('code'),label:node('button'),binding:inlineBinding}]);assert(find(container,'INPUT'));
  f.change(5);assert.equal(find(container,'INPUT'),undefined);assert(find(f.row(),'INPUT'));assert.equal(f.view.snapshot().draft.dirtyCount,0);
 }finally{await f.view.dispose();}
});
test('conflicting invalid numerical text remains visible across a type change until explicit discard',async()=>{const f=await fixture();try{f.change(5);await f.$('input-mode-draft').onclick();let input=find(f.row(),'INPUT');assert(input);input.value='-';input.oninput();f.change(false);assert.equal(find(f.row(),'INPUT').value,'-');assert.equal(f.view.snapshot().draft.entries[0].conflict,true);assert.equal(f.view.snapshot().draft.canApply,false);await f.$('input-discard').onclick();assert.equal(find(f.row(),'INPUT'),undefined);const buttons=[];const visit=n=>{if(n.tagName==='BUTTON')buttons.push(n);n.children.forEach(visit);};visit(f.row());assert(buttons.some(n=>n.textContent==='false'&&n.attributes['aria-pressed']==='true'));assert.equal(f.calls.filter(p=>p.op==='inputs-apply').length,0);}finally{await f.view.dispose();}});

test('opening inputs is unavailable while another element is being picked even if old capability metadata allows it',async()=>{
 const f=await fixture();try{
  await f.view.close('Preparing another selection');assert.equal(f.$('input-open').disabled,false);const opens=f.calls.filter(p=>p.op==='inputs-open').length;
  const previous=f.state();f.view.update({...previous,selection:null,picker:{status:'picking',id:'new-target'}});await new Promise(r=>setTimeout(r,0));
  assert.equal(f.$('input-open').disabled,true);assert.match(f.$('input-note').textContent,/finish|cancel.*selection/i);assert.equal(f.calls.filter(p=>p.op==='inputs-open').length,opens);
  f.view.update({...previous,picker:{status:'cancelled',id:'new-target'}});await new Promise(r=>setTimeout(r,0));assert.equal(f.$('input-open').disabled,false);await f.$('input-open').onclick();assert.equal(f.calls.filter(p=>p.op==='inputs-open').length,opens+1);
 }finally{await f.view.dispose();}
});

test('fresh owner-scoped capability reply binds the opened editor before its first main-state echo without disabling the current field',async()=>{
 const f=await fixture({initialInputAbsent:true,initialValue:5});try{await new Promise(r=>setTimeout(r,0));const field=find(f.row(),'INPUT');assert.equal(field.disabled,false);const before=f.calls.filter(p=>p.op==='capabilities').length;f.view.update(f.state());assert.equal(field.disabled,false,'Same owned-editor echo must not clear fresh admission and blur the field');assert.equal(f.calls.filter(p=>p.op==='capabilities').length,before);}finally{await f.view.dispose();}
});

test('fresh admission binding never carries a native editor across a changed selected node',async()=>{const f=await fixture({initialInputAbsent:true,initialValue:5});try{await new Promise(r=>setTimeout(r,0));const next=f.state();f.view.update({...next,selection:{domIdentity:{document:'d',node:'other',property:'disabled'}}});assert.equal(f.view.snapshot().active,false);assert.equal(find(f.row(),'INPUT').disabled,true);}finally{await f.view.dispose();}});
test('foreign investigation echo closes the local view without sending cleanup to that foreign owner',async()=>{const f=await fixture({initialInputAbsent:true,initialValue:5});try{await new Promise(r=>setTimeout(r,0));const next=f.state(),before=f.calls.filter(x=>x.op==='inputs-close').length;f.view.update({...next,inputs:{...next.inputs,investigationId:'foreign-input'}});assert.equal(f.view.snapshot().active,false);assert.equal(find(f.row(),'INPUT').disabled,true);await new Promise(r=>setTimeout(r,0));assert.equal(f.calls.filter(x=>x.op==='inputs-close').length,before);}finally{await f.view.dispose();}});

test('captured editor receiver follows the existing capability refresh path and disables a newly denied field',async()=>{const f=await fixture({initialValue:5});try{const receive=f.view.stateReplyReceiver(),denied=structuredClone(cap);denied.operations['inputs-apply']={...denied.operations['inputs-apply'],available:false,code:'CAPABILITY_DENIED',reason:'Synthetic permission revoked'};f.setPolicy(denied);const before=f.calls.filter(p=>p.op==='capabilities').length;assert.equal(receive(f.state()),true);await new Promise(r=>setTimeout(r,0));assert.equal(find(f.row(),'INPUT').disabled,true);assert.equal(f.calls.filter(p=>p.op==='capabilities').length,before+1);assert.equal(f.calls.filter(p=>p.op==='inputs-read').length,0);assert.equal(f.calls.filter(p=>p.op==='inputs-apply').length,0);}finally{await f.view.dispose();}});
test('a refused reply cannot replace the input UI state, policy or current view',async()=>{const f=await fixture({initialValue:5});try{const receive=f.view.stateReplyReceiver(),before=f.view.snapshot(),calls=f.calls.length,r=f.state();r.inputs.target={...r.inputs.target,node:'foreign'};assert.equal(receive(r),false);assert.deepEqual(f.view.snapshot(),before);assert.equal(f.calls.length,calls);assert.equal(find(f.row(),'INPUT').value,'5');}finally{await f.view.dispose();}});
test('admitted same-editor reply preserves dirty text and conflicts through the normal model path',async()=>{const f=await fixture({initialValue:5});try{const receive=f.view.stateReplyReceiver();await f.$('input-mode-draft').onclick();const field=find(f.row(),'INPUT');field.value='6';field.oninput();const before=f.view.snapshot().draft.entries[0],r=f.state(),old=r.inputs.resources[0].resource;r.inputs.revision++;r.inputs.resources[0].resource={...old,value:10,revision:typeof old.revision==='number'?old.revision+1:old.revision+'-next'};assert.equal(receive(r),true);const row=f.view.snapshot().draft.entries[0];assert.equal(row.raw,'6');assert.equal(row.conflict,true);assert.deepEqual(row.draftResource,before.draftResource);assert.equal(f.$('input-apply').disabled,true);assert.equal(f.calls.filter(p=>p.op==='inputs-apply').length,0);}finally{await f.view.dispose();}});
test('a current closed reply disables editing and cannot later be used to revive the editor',async()=>{const f=await fixture({initialValue:5});try{const receive=f.view.stateReplyReceiver(),r=f.state();r.inputs.closed=true;r.inputs.revision++;assert.equal(receive(r),true);assert.equal(f.view.snapshot().active,false);assert.equal(find(f.row(),'INPUT').disabled,true);assert.equal(receive({...r,inputs:{...r.inputs,closed:false,revision:r.inputs.revision+1}}),false);}finally{await f.view.dispose();}});
test('mounted native input buttons follow exact ledger ownership on passive refresh without sending a mutation',async()=>{
 const ledger=createControlLedger({investigationId:'native-i',target}),resource={id:'native-number',kind:'dom-control',revision:0,type:'number',value:1,writable:true,locator:{document:'d',node:'native-number',selector:'#amount',control:'number'}};ledger.observeControls([resource]);const plan=prepareExperimentPlan({investigationId:'native-i',mode:'live',target,changes:[{resource,value:2}]}),batch=ledger.prepareApply(plan,{target,admission:{available:true,grants:['read','inject','replay']}});ledger.confirmControl(batch.receipt,{resourceId:resource.id,status:'applied',after:{...resource,value:2,revision:1}});ledger.finish(batch.receipt);
 const nativeCap=describeCapabilities({url:target.origin+'/',permission:true,grants:['read','inject','cache','reload','override','replay'],lease:'owned',attached:true,hasSelection:true,hasAnalysis:true,nativeInputOwner:true,workerIndependent:true,inputSourceKind:'dom-control',hasInputEditor:true}),elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);},calls=[],snap=()=>({...ledger.snapshot(),sourceKind:'dom-control',cleanup:'active',unsupported:[],observation:{status:'Observed',value:true,dependency:'unknown'}}),state=()=>({tabId:1,run:'r',capabilityPolicy:nativeCap,inputs:snap(),selection:{domIdentity:{document:'d',node:'n',property:'disabled'}}}),client={request:async p=>{calls.push(p);if(p.op==='capabilities')return nativeCap;if(['inputs-open','inputs-read'].includes(p.op))return snap();if(p.op==='inputs-close'){ledger.close();return snap();}throw Error('Unexpected writer '+p.op);}},view=createInputUI({document:{createElement:node},$,client});
 try{view.update(state());$('input-source').value='dom-control';await new Promise(r=>setTimeout(r,0));await $('input-open').onclick();assert.equal($('input-undo').disabled,false);assert.equal($('input-baseline').disabled,false);const history=structuredClone(ledger.snapshot().history);ledger.observeControls([{...resource,value:2,revision:2}]);view.update(state());assert.equal($('input-undo').disabled,true);assert.equal($('input-baseline').disabled,true);assert.deepEqual(view.snapshot().editor.history,history);assert.equal(view.snapshot().active,true);assert.equal(calls.filter(p=>['inputs-apply','inputs-undo','inputs-baseline'].includes(p.op)).length,0);}finally{await view.dispose();}
});

test('input controls follow an opened editor; closing hides inactive undo tools and keeps dirty drafts visible',async()=>{const f=await fixture({initialValue:5});try{assert.equal(f.$('input-editing-details').open,true);assert.equal(f.$('input-modes').hidden,false);assert.equal(f.$('input-read').hidden,false);await f.$('input-mode-draft').onclick();const input=find(f.row(),'INPUT');input.value='6';input.oninput();f.$('input-editing-details').open=false;await f.view.close('Test close');assert.equal(f.$('input-editing-details').open,true);assert.equal(f.$('input-discard').hidden,false);assert.equal(f.$('input-undo').hidden,true);assert.equal(f.view.snapshot().draft.dirtyCount,1);}finally{await f.view.dispose();}});

test('passive refresh respects a collapsed active editor while a newly edited draft becomes visible',async()=>{const f=await fixture({initialValue:5});try{f.$('input-editing-details').open=false;f.view.update(f.state());assert.equal(f.$('input-editing-details').open,false);await f.$('input-mode-draft').onclick();const input=find(f.row(),'INPUT');input.value='6';input.oninput();assert.equal(f.$('input-editing-details').open,true);}finally{await f.view.dispose();}});
test('ordinary editor applies valid edits live without a mode choice; opening alone never writes',async()=>{const f=await fixture({initialValue:5});try{assert.equal(f.view.snapshot().mode,'live');assert.equal(f.calls.filter(p=>p.op==='inputs-apply').length,0);assert.equal(f.$('input-columns').textContent,'Next matching response');const field=find(f.row(),'INPUT');field.value='7';field.oninput();await new Promise(r=>setTimeout(r,300));const writes=f.calls.filter(p=>p.op==='inputs-apply');assert.equal(writes.length,1);assert.equal(writes[0].plan.changes[0].value,7);assert.equal(f.$('input-apply').hidden,true);}finally{await f.view.dispose();}});
test('opening fields keeps the unknown dependency explicit without waiting for outer state refresh',async()=>{const f=await fixture();try{assert.match(f.$('input-editing-help').textContent,/relation to this element not established/);}finally{await f.view.dispose();}});

test('invalid number explains how to fix this field and says this edit was not applied',async()=>{const f=await fixture({initialValue:5});try{const field=find(f.row(),'INPUT');field.value='-';field.oninput();const message=f.row().children.find(n=>n.className==='sp-error');assert(message.textContent.includes('12 or 3.5'));assert.match(message.textContent,/This edit has not been applied/);await new Promise(r=>setTimeout(r,280));assert.equal(f.calls.filter(p=>p.op==='inputs-apply').length,0);assert.equal(field.value,'-');}finally{await f.view.dispose();}});


test('acknowledged undo and baseline distinguish restoration from a new edit',async()=>{
 const f=await fixture({initialValue:5});try{
  for(const [kind,label] of [['undo','Last field change undone.'],['baseline','Original field values restored.']]){
   const state=f.state();state.inputs.revision++;state.inputs.history=[{kind,phase:'applied'}];f.view.update(state);
   assert.equal(f.$('input-status').textContent,label);
  }
  assert.equal(f.calls.filter(p=>p.op==='inputs-apply').length,0);
 }finally{await f.view.dispose();}
});


test('response waiting suggests a page action without claiming delivery or effect',async()=>{
 const f=await fixture();try{
  const state=f.state();state.inputs.revision++;state.inputs.history=[{kind:'apply',phase:'waiting'}];f.view.update(state);
  assert.match(f.$('input-status').textContent,/Use the page to request this data again/);
  state.inputs.revision++;state.inputs.history[0].phase='delivered';f.view.update(state);
  assert.match(f.$('input-status').textContent,/effect on the page is not confirmed/);
  assert.equal(f.calls.filter(p=>p.op==='reload'||p.op==='inputs-apply').length,0);
 }finally{await f.view.dispose();}
});


test('empty fields hide value headings and do not mask a later permission error',async()=>{
 const f=await fixture();try{
  const state=f.state();state.inputs.revision++;state.inputs.resources=[];f.view.update(state);
  assert.equal(f.$('input-column-headings').hidden,true);assert.match(f.$('input-status').textContent,/No response fields/);
  const policy=structuredClone(cap);policy.operations['inputs-apply']={...policy.operations['inputs-apply'],available:false,code:'CAPABILITY_DENIED',reason:'Editing revoked'};f.setPolicy(policy);f.view.stateReplyReceiver()({...state,capabilityPolicy:policy});await new Promise(r=>setTimeout(r,0));
  assert.doesNotMatch(f.$('input-status').textContent,/No response fields/);
 }finally{await f.view.dispose();}
});

test('one requested field open waits for capabilities and never opens a different selection',async()=>{
 for(const changeTarget of [false,true]){
  let resolve,opens=0;const capabilities=new Promise(r=>resolve=r),elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};
  const state={tabId:1,run:target.run,property:target.property,capabilityPolicy:cap,selection:{domIdentity:{document:target.document,node:target.node,property:target.property}}};
  const client={request:async p=>{if(p.op==='capabilities')return capabilities;if(p.op==='inputs-open'){opens++;return{investigationId:'open-after-capability',sourceKind:'dom-control',target,revision:0,closed:false,resources:[],history:[],unsupported:[]};}if(p.op==='inputs-close')return{};throw Error(p.op);}},view=createInputUI({document:{createElement:node},$,client});
  try{view.update(state);const opening=view.open();assert.equal(opens,0);if(changeTarget)view.update({...state,selection:{domIdentity:{...state.selection.domIdentity,node:'different'}}});resolve(cap);await opening;assert.equal(opens,changeTarget?0:1);}finally{await view.dispose();}
 }
});


test('discard describes the local cancellation instead of resurfacing an earlier successful write',async()=>{
 const f=await fixture({initialValue:5});try{
  const state=f.state();state.inputs.revision++;state.inputs.history=[{kind:'apply',phase:'applied'}];f.view.update(state);
  await f.$('input-mode-draft').onclick();const field=find(f.row(),'INPUT');field.value='-';field.oninput();await f.$('input-discard').onclick();
  assert.equal(f.$('input-status').textContent,'Draft discarded. No page change was sent.');
  assert.equal(f.calls.filter(p=>p.op==='inputs-apply').length,0);
 }finally{await f.view.dispose();}
});


test('opening the fields disclosure loads once on the explicit gesture, not on mount',async()=>{
 let opens=0;const elements=new Map(),$=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};
 const summary=node('summary');$('input-editing-details').querySelector=()=>summary;
 const state={tabId:1,run:target.run,property:target.property,capabilityPolicy:cap,selection:{domIdentity:{document:target.document,node:target.node,property:target.property}}};
 const client={request:async p=>{if(p.op==='capabilities')return cap;if(p.op==='inputs-open'){opens++;return{investigationId:'explicit-fields',sourceKind:'dom-control',target,revision:0,closed:false,resources:[],history:[],unsupported:[]};}if(p.op==='inputs-close')return{};throw Error(p.op);}},view=createInputUI({document:{createElement:node},$,client});
 try{view.update(state);await new Promise(setImmediate);assert.equal(opens,0);assert.equal($('input-open').hidden,true);await summary.onclick();assert.equal(opens,1);await summary.onclick();assert.equal(opens,1);}finally{await view.dispose();}
});
