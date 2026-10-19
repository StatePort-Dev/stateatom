// SPDX-License-Identifier: Apache-2.0
import {test} from 'node:test';
import assert from 'node:assert/strict';

// A broken presentation must not upgrade unsupported/stale records or mix instances.
import {inspectionView} from '../browser-extension/inspection-view.mjs';
function snapshot() {
 return {attached:true,property:'disabled',analysisAt:200,selection:{selector:'#confirm',property:'disabled',value:true,observedAt:100,page:'page1',instance:'row1'},analysis:{capabilities:{sourceResolver:'open-ide'},sources:[{file:'App.jsx',line:7,column:1,expressions:['hold || !ready']}],stateatom:{runtime:{status:'Observed',target:{property:'disabled',value:true,page:'page1'},nodes:[{status:'Observed',kind:'read',expression:'hold',value:true},{status:'Observed',kind:'read',expression:'object',value:{kind:'object'}}],independentObservations:[{status:'Observed',kind:'binding',expression:'ready',value:false}]}}}};
}
test('compact view distinguishes basic, source-linked and instrumented evidence',()=>{
 assert.equal(typeof inspectionView,'function','inspection presentation is available');
 assert.equal(inspectionView(snapshot()).mode,'Instrumented');
 const source=snapshot();source.selection.page=null;source.analysis.stateatom.runtime={status:'Unknown/Unsupported',nodes:[]};
 assert.equal(inspectionView(source).mode,'Source-linked');
 source.analysis.capabilities.sourceResolver='unavailable';source.analysis.sources=[];
 assert.equal(inspectionView(source).mode,'Basic');
 assert.equal(inspectionView(source).sources.length,0);
});
test('only values from the supported selected computation appear as operands',()=>{
 assert.equal(typeof inspectionView,'function');
 assert.deepEqual(inspectionView(snapshot()).operands.map(n=>[n.expression,n.value]),[['hold',true]]);
 const mismatch=snapshot();mismatch.analysis.stateatom.runtime.status='Unknown/Unsupported';
 assert.deepEqual(inspectionView(mismatch).operands,[]);
 const stale=snapshot();stale.analysis.stateatom.runtime.status='Stale';
 assert.deepEqual(inspectionView(stale).operands,[]);
 assert.equal(inspectionView(stale).stale,true);
});
test('snapshot time and retained stale target remain historical without current source or values',()=>{
 assert.equal(typeof inspectionView,'function');
 assert.equal(inspectionView(snapshot()).observedAt,100);
 const view=inspectionView({property:'text',stale:{reason:'Property changed',target:{selector:'#confirm',property:'disabled',value:true}},analysis:null,selection:null});
 assert.equal(view.stale,true);
 assert.equal(view.target,null);
 assert.deepEqual(view.operands,[]);
 assert.deepEqual(view.sources,[]);
});
test('compact operands omit expression totals and repeated reads, and require source validation',()=>{
 const state=snapshot();state.analysis.stateatom.runtime.nodes.push(
  {status:'Observed',kind:'logical',expression:'hold || !ready',value:true},
  {status:'Observed',kind:'read',expression:'hold',value:true}
 );
 assert.deepEqual(inspectionView(state).operands.map(n=>n.expression),['hold']);
 state.analysis.capabilities.sourceResolver='unavailable';
 assert.deepEqual(inspectionView(state).operands,[]);
});
test('host-prop correspondence is scoped and unavailable without a current source-validated observation',()=>{
 const s=snapshot(),rt=s.analysis.stateatom.runtime;
 rt.commitIdentity='Observed: pinned host props';rt.commit={status:'Observed',producer:{status:'Observed'},adapter:'react18-final-host-props/1'};
 assert.equal(inspectionView(s).commit.status,'Observed');
 rt.commitIdentity='Unknown/Unsupported: not bound';assert.equal(inspectionView(s).commit.status,'Unknown/Unsupported');
 rt.commitIdentity='Observed: pinned host props';s.stale={reason:'changed'};assert.equal(inspectionView(s).commit.status,'Stale');
 s.stale=null;s.analysis.capabilities.sourceResolver='unavailable';assert.equal(inspectionView(s).commit.status,'Unknown/Unsupported');
});
test('transport identities require a current supported source-validated trace',()=>{const s=snapshot();s.analysis.stateatom.runtime.exchangeBindings=[{status:'Observed',requestId:'exact'}];assert.equal(inspectionView(s).exchanges[0].requestId,'exact');s.stale={reason:'reload'};assert.deepEqual(inspectionView(s).exchanges,[]);s.stale=null;s.analysis.capabilities.sourceResolver='unavailable';assert.deepEqual(inspectionView(s).exchanges,[]);});
test('state handoffs are visible only for current source-validated selected observations',()=>{const s=snapshot();s.analysis.stateatom.runtime.stateHandoffs=[{status:'Observed',queueId:'q',valueOrigin:'Unknown/Unsupported'}];assert.equal(inspectionView(s).handoffs.length,1);s.analysis.stateatom.runtime.status='Stale';assert.deepEqual(inspectionView(s).handoffs,[]);s.analysis.stateatom.runtime.status='Observed';s.analysis.capabilities.sourceResolver='unavailable';assert.deepEqual(inspectionView(s).handoffs,[]);});
test('finite trace view is scoped to the current selected occurrence and code collection',()=>{const s=snapshot();s.analysis.stateatom.firstReadProfile={schema:1,status:'Supported finite trace',fullPath:true,freshness:'Recorded',occurrence:{page:'page1',targetId:'target',observedAt:100},scope:'first read'};assert.equal(inspectionView(s).firstReadProfile.fullPath,true);s.analysis.codeJournal={freshness:'Stale'};assert.equal(inspectionView(s).firstReadProfile.fullPath,false);s.analysis.codeJournal=null;s.analysis.stateatom.firstReadProfile.occurrence.page='other';assert.equal(inspectionView(s).firstReadProfile.fullPath,false);});

test('finite trace view refuses its own stale or missing freshness despite current page metadata',()=>{
 const s=snapshot();s.analysis.stateatom.firstReadProfile={schema:1,status:'Supported finite trace',fullPath:true,freshness:'Stale',occurrence:{page:'page1'},scope:'first read'};
 assert.equal(inspectionView(s).firstReadProfile.status,'Stale');assert.equal(inspectionView(s).firstReadProfile.fullPath,false);
 delete s.analysis.stateatom.firstReadProfile.freshness;assert.equal(inspectionView(s).firstReadProfile.fullPath,false);
});
test('finite trace view checks available runtime target and recorded selection occurrence identities',()=>{
 const s=snapshot(),p=s.analysis.stateatom.firstReadProfile={schema:1,status:'Supported finite trace',fullPath:true,freshness:'Recorded',observedAt:100,occurrence:{page:'page1',targetId:'target-current'}};
 s.analysis.stateatom.runtime.target.id='target-current';assert.equal(inspectionView(s).firstReadProfile.fullPath,true);
 p.occurrence.targetId='target-old';assert.equal(inspectionView(s).firstReadProfile.fullPath,false);
 p.occurrence.targetId='target-current';p.observedAt=99;assert.equal(inspectionView(s).firstReadProfile.fullPath,false);
 p.observedAt=100;p.occurrence.observedAt=99;assert.equal(inspectionView(s).firstReadProfile.fullPath,false);
 p.occurrence.observedAt=100;assert.equal(inspectionView(s).firstReadProfile.fullPath,true);
 delete s.selection.page;delete p.occurrence.page;assert.equal(inspectionView(s).firstReadProfile.fullPath,false);
});

test('finite trace context qualifies host correspondence only for the validated current claim',()=>{
 const s=snapshot(),rt=s.analysis.stateatom.runtime;
 rt.commitIdentity='Observed: host';rt.commit={adapter:'react18-final-host-props/1',status:'Observed',producer:{status:'Observed'}};
 const p=s.analysis.stateatom.firstReadProfile={schema:1,status:'Supported finite trace',fullPath:true,freshness:'Recorded',sourceProof:{status:'Code-linked'},occurrence:{page:'page1',status:'Observed'}};
 assert.match(inspectionView(s).commit.reason,/alone.*finite trace/i);assert.match(inspectionView(s).commit.reason,/not runtime attestation/);
 for(const change of [{freshness:'Stale'},{fullPath:false},{status:'Unknown/Unsupported'},{sourceProof:{status:'Unknown/Unsupported'}},{occurrence:{page:'other',status:'Observed'}}]){
  const candidate=structuredClone(s);Object.assign(candidate.analysis.stateatom.firstReadProfile,change);
  assert.match(inspectionView(candidate).commit.reason,/Complete HTTP provenance is not established/);
 }
});
test('panel fragment warnings point to the current finite trace without upgrading raw ancestry',async()=>{
 const priorDocument=globalThis.document,priorChrome=globalThis.chrome;
 function element(){return {textContent:'',value:'',children:[],contains(){return false},setAttribute(){},removeAttribute(){},append(...nodes){this.children.push(...nodes)},replaceChildren(...nodes){this.children=nodes},addEventListener(){}};}
 const elements=new Map(),node=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id)};
 node('tabs').value='1';
 const s=snapshot(),rt=s.analysis.stateatom.runtime;s.analysis.stateatom.target={property:'disabled',value:true};rt.commitIdentity='Observed: host';rt.commit={adapter:'react18-final-host-props/1',status:'Observed',producer:{status:'Observed'}};
 rt.stateHandoffs=[{status:'Observed',queueId:'q',valueOrigin:'Unknown/Unsupported'}];rt.exchangeBindings=[{status:'Observed',requestId:'request'}];rt.nodes=[{status:'Observed',kind:'member',expression:'account.rules.quota',value:12,valueOrigin:'Unknown/Unsupported',origin:{url:'http://127.0.0.1/api',pointer:'/rules/quota'}}];
 s.analysis.stateatom.firstReadProfile={schema:1,status:'Supported finite trace',fullPath:true,freshness:'Recorded',scope:'original first read only',sourceProof:{status:'Code-linked',profile:'reviewed'},occurrence:{page:'page1',status:'Observed'},limits:['Later renders unsupported']};
 const before=JSON.stringify(s);
 const dom={createElement:element,createElementNS:()=>({...element(),setAttribute(){}})};const container={ownerDocument:dom,append(){}};dom.createElement=()=>({...element(),style:{},setAttribute(){},querySelector(selector){return node(selector.match(/data-atom-id="([^"]+)/)?.[1]);},querySelectorAll(){return[];},remove(){}});globalThis.document={getElementById:node,createElement:element};globalThis.chrome={runtime:{onMessage:{addListener(){}},sendMessage:async m=>({ok:true,result:m.op==='tabs'?[{id:1,url:'http://127.0.0.1'}]:m.op==='list-diagnostics'?[]:s})}};
 const text=n=>[n.textContent,...n.children.map(text)].join(' ');
 try{
  let experimentReply,restoreStateHook,pickSignal,pickReply;const {mountAtom}=await import('../packages/atom/src/ui.mjs');const view=mountAtom(container,{request:async (m,options)=>{if(m.op==='pick'){pickSignal=options?.signal;return new Promise(r=>pickReply=r);}if(m.op==='deep-experiment')return new Promise(r=>experimentReply=r);if(m.op==='restore')return {value:false};if(m.op==='state'&&restoreStateHook){restoreStateHook();restoreStateHook=null;}return m.op==='tabs'?[{id:1,url:'http://127.0.0.1'}]:m.op==='list-diagnostics'?[]:s;},subscribe:()=>()=>{}},{idPrefix:''});await view.ready;assert.doesNotMatch(node('status').textContent,/^Error:/);await node('refresh-tabs').onclick();
  for(const id of ['commit-summary','state-handoffs','exchange-bindings'])assert.match(text(node(id)),/alone.*finite trace/i,id);
  assert.match(text(node('atom-chain')),/fragment.*Unknown\/Unsupported.*finite trace/i);assert.match(node('first-read-scope').textContent,/original first read only/);assert.equal(JSON.stringify(s),before);
  s.analysis.stateatom.firstReadProfile.fullPath=false;await node('refresh-tabs').onclick();
  assert.match(node('commit-summary').textContent,/Complete HTTP provenance is not established/);assert.match(text(node('state-handoffs')),/Current field value ancestry is unknown/);assert.match(text(node('exchange-bindings')),/Complete HTTP provenance is not established/);assert.match(text(node('atom-chain')),/current value origin Unknown\/Unsupported/);
  // A completion invalidation can arrive after the RPC result. Render its
  // target-bound historical trial record instead of erasing a successful result.
  s.deepExperiment={id:'trial-1',status:'Observed',baseline:true,scope:'controlled trials'};
  s.diagnosticExperiment={target:{selector:'#confirm',property:'disabled'},result:{id:'trial-1',status:'Observed',scope:'controlled trials',trials:[{a:{value:true},interventions:[]}]}};
  await node('refresh-tabs').onclick();assert.match(node('atom-result').textContent,/Observed.*historical/i);
  const completed=node('atom-result').textContent;await node('refresh-tabs').onclick();assert.equal(node('atom-result').textContent,completed);
  await node('atom-restore').onclick();assert.match(node('atom-result').textContent,/^Restored.*false/);await node('refresh-tabs').onclick();assert.match(node('atom-result').textContent,/^Restored.*false/);
  const selected=s.selection,analyzed=s.analysis;s.selection=null;s.analysis=null;s.stale={status:'Stale',reason:'trial reload',target:{selector:'#confirm',property:'disabled',value:true}};
  await node('refresh-tabs').onclick();assert.match(node('atom-result').textContent,/^Restored.*false/);assert.match(node('selected').textContent,/stale/i);
  s.diagnosticExperiment.target.selector='#different';await node('refresh-tabs').onclick();assert.equal(node('atom-result').textContent,'');
  const record=s.diagnosticExperiment;
  restoreStateHook=()=>{s.property='text';s.selection={...selected,property:'text'};s.diagnosticExperiment=null;};
  await node('atom-restore').onclick();assert.equal(node('atom-result').textContent,'','Restore own refresh must not display success under a changed property');
  s.property='disabled';s.selection=selected;s.analysis=analyzed;s.stale=null;s.attached=true;s.diagnosticExperiment=record;s.diagnosticExperiment.target.selector='#confirm';s.deepExperiment={id:'trial-1'};await node('refresh-tabs').onclick();
  restoreStateHook=()=>{s.selection=null;s.stale=null;s.attached=false;s.deepExperiment=null;s.diagnosticExperiment=null;};
  await node('atom-restore').onclick();assert.equal(node('atom-result').textContent,'','Restore own refresh must not resurrect a revoked result');
  s.attached=true;
  s.diagnosticExperiment=null;s.deepExperiment=null;s.selection=selected;s.analysis=analyzed;s.stale=null;await node('refresh-tabs').onclick();
  node('atom-variants').value='[]';const oldExperiment=node('atom-run').onclick();node('tabs').value='2';await node('tabs').onchange();const evidence=node('evidence').textContent;experimentReply({status:'Observed',baseline:true,scope:'old tab'});await oldExperiment;assert.equal(node('atom-result').textContent,'');assert.equal(node('evidence').textContent,evidence);
  const picking=node('pick').onclick();await new Promise(r=>setTimeout(r,0));assert(pickSignal);node('tabs').value='1';await node('tabs').onchange();assert.equal(pickSignal.aborted,true,'tab switch aborts pending picker admission before a native session exists');pickReply({});await picking;


 }finally{if(priorDocument===undefined)delete globalThis.document;else globalThis.document=priorDocument;if(priorChrome===undefined)delete globalThis.chrome;else globalThis.chrome=priorChrome;}
});
