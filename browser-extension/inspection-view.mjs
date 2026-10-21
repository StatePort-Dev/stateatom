// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 StateAtom contributors.
// Presentation of validated records only. No page reads or expression evaluation.
export function inspectionDisplayState(state={}) {
 if(!['starting','picking','resolving'].includes(state.picker?.status))return state;
 // Keep the original record for Cancel; hide it while another target is pending.
 return {...state,selection:null,analysis:null,stale:null,experiment:null};
}
export function inspectionView(state={}) {
 state=inspectionDisplayState(state);
 const analysis=state.analysis,runtime=analysis?.stateatom?.runtime;
 const stale=!!state.stale||runtime?.status==='Stale';
 const sourceLinked=analysis?.capabilities?.sourceResolver==='open-ide';
 const instrumented=sourceLinked&&!!state.selection?.page;
 const seen=new Set(),profile=analysis?.stateatom?.firstReadProfile;
 const profileStale=stale||analysis?.codeJournal?.freshness==='Stale'||profile?.freshness==='Stale'||profile?.status==='Stale';
 const selection=state.selection,occurrence=profile?.occurrence;
 const profileCurrent=sourceLinked&&!profileStale&&profile?.freshness==='Recorded'&&typeof selection?.page==='string'&&selection.page.length>0&&occurrence?.page===selection.page&&
  (!runtime?.target?.id||occurrence.targetId===runtime.target.id)&&
  (profile.observedAt==null||profile.observedAt===selection.observedAt)&&
  (occurrence.observedAt==null||occurrence.observedAt===selection.observedAt);
 const firstReadProfile=profileCurrent?profile:profile?{schema:1,status:profileStale?'Stale':'Unknown/Unsupported',fullPath:false,freshness:profileStale?'Stale':profile.freshness,reason:profileStale?'Inspect again after the change.':profile.reason||'No finite trace bound to the current selected occurrence.'}:{schema:1,status:'Unknown/Unsupported',fullPath:false,reason:'No controlled first-read profile for this selection.'};
 const finiteTraceSupported=firstReadProfile.status==='Supported finite trace'&&firstReadProfile.fullPath===true&&firstReadProfile.sourceProof?.status==='Code-linked'&&firstReadProfile.occurrence?.status==='Observed';
 const view={
  firstReadProfile,finiteTraceSupported,
  mode:instrumented?'Instrumented':sourceLinked?'Source-linked':'Basic',
  stale,
  target:stale?null:state.selection||null,
  observedAt:state.selection?.observedAt||null,
  sources:stale?[]:analysis?.sources||[],
  operands:sourceLinked&&!stale&&runtime?.status==='Observed'?(runtime.nodes||[]).filter(n=>{
   if(n.status!=='Observed'||!['read','member','destructure'].includes(n.kind)||typeof n.expression!=='string'||
    !(n.value===null||['string','number','boolean'].includes(typeof n.value)))return false;
   const key=JSON.stringify([n.expression,n.value,n.page,n.scope]);
   if(seen.has(key))return false;
   seen.add(key);return true;
  }):[],
  handoffs:sourceLinked&&!stale&&runtime?.status==='Observed'?(runtime.stateHandoffs||[]):[],
  exchanges:sourceLinked&&!stale&&runtime?.status==='Observed'?(runtime.exchangeBindings||[]):[],
  codeJournal:stale?null:analysis?.codeJournal||null,
  runtimeStatus:runtime?.status||'Unknown/Unsupported',
  commit:stale?{status:'Stale',reason:'Inspect again after the change.'}:sourceLinked&&runtime?.status==='Observed'&&runtime?.commit?.adapter==='react18-final-host-props/1'&&runtime.commit.status==='Observed'&&runtime.commit.producer?.status==='Observed'&&runtime.commitIdentity?.startsWith('Observed:')?{status:'Observed',reason:'React committed this host prop from the recorded JSX execution. Experimental React 18.3.1 dev adapter; instrumented-page evidence, not runtime attestation. '+(finiteTraceSupported?'This host-property observation alone does not establish complete HTTP provenance; see the separately scoped finite trace.':'Complete HTTP provenance is not established.')}:{status:'Unknown/Unsupported',reason:runtime?.commit?.reason||runtime?.commit?.producer?.reason||'A source marker alone does not identify the committed property producer.'},
  reason:state.stale?.reason||runtime?.reason||'No inspection yet.',
 };
 const summary=!state.attached?'Connect the application tab to inspect an element.':stale?'Previous snapshot is stale.':!view.target?'Select an element to record a snapshot.':!sourceLinked?'DOM snapshot · source and input dependencies are unknown.':view.operands.length?view.operands.length+' observed input'+(view.operands.length===1?'':'s')+' for the selected computation.':instrumented?'No supported scalar input observation for this snapshot.':'Source linked · runtime input values were not observed.';
 const nextStep=!state.attached?'attach':stale?'inspect-again':!view.target?'select-element':!sourceLinked?'connect-project':!instrumented?'start-observation':view.operands.length?'inspect-again':'unsupported';
 return {...view,summary,nextStep};
}

// Friendly labels for already observed DOM records. Never infer a component.
export function selectionPresentation(selection,{stale=false,picker}={}){
 const names={button:'Button',a:'Link',input:'Input',textarea:'Text area',select:'Select',form:'Form',p:'Paragraph',img:'Image',svg:'Graphic',div:'Container',body:'Page body',html:'Document element'};
 const kind=selection?names[selection.tag]||'Element':'';
 const text=typeof selection?.text==='string'?selection.text.trim().replace(/\s+/g,' '):'';
 const title=stale?'Previous element':selection?(text?(text.length>64?text.slice(0,63)+'…':text):kind):'Select an element';
 const next=Number.isSafeInteger(picker?.selectedIndex)?picker.choices?.find(c=>c.index===picker.selectedIndex+1):null;
 const parentIndex=!stale&&picker?.status==='selected'&&next&&!/^(body|html)(#|$)/.test(next.label)?next.index:null;
 return{title,kind,value:stale?'Stale':!selection?'No observation':selection.property==='text'?'Text':selection.property+' = '+JSON.stringify(selection.value),parentIndex};
}
