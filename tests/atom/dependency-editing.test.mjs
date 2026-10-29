// SPDX-License-Identifier: Apache-2.0
// Copied-record admission tests, not native provenance evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {explanationFixture} from '../helpers/explanation-facts-fixture.mjs';
import {inspectionDependencies} from '../../core/inspection-explanations.mjs';
import {dependencyResponseBinding,dependencyEditorEntry} from '../../packages/atom/src/dependency-editing.mjs';

function fixture(){
 const state=explanationFixture('hold || !ready'),input=inspectionDependencies(state).inputs[0];
 state.analysis.stateatom.firstReadProfile={status:'Supported finite trace',fullPath:true,freshness:'Recorded',observedAt:100,sourceProof:{status:'Code-linked'},occurrence:{status:'Observed',page:'page',targetId:'page:target',run:'run',frame:'frame',readId:input.id,readValue:true,pointer:'/hold',requestId:'request-1',exchangeId:'exchange-1',parseId:'parse-1'}};
 state.requests=[{id:'request-1',url:'http://localhost/api',inputResponse:{requestId:'request-1',frameId:'frame',mainFrame:true,requestOrdinal:1,method:'GET',url:'http://localhost/api'},inputBody:'{"hold":true}'}];
 const snapshot={active:true,sourceKind:'json-response',editor:{target:{tabId:1,run:'run',document:'doc',node:'node',selector:'#confirm',property:'disabled'}},draft:{entries:[{id:'response:1',resource:{kind:'json-response',writable:true,locator:{requestId:'request-1',requestOrdinal:1,url:'http://localhost/api',method:'GET',pointer:'/hold'}}}]}};
 return {state,input,snapshot};
}
test('exact finite read joins the existing owned response editor entry',()=>{const {state,input,snapshot}=fixture(),binding=dependencyResponseBinding(state,input);assert(binding);assert.equal(dependencyEditorEntry(binding,snapshot),snapshot.draft.entries[0]);});
for(const [name,change] of Object.entries({
 'parsed origin without a finite trace':s=>{delete s.analysis.stateatom.firstReadProfile;s.analysis.stateatom.runtime.nodes.at(-1).origin={exchangeId:'exchange-1',pointer:'/hold'};},
 'stale profile':s=>s.analysis.stateatom.firstReadProfile.freshness='Stale',
 'invalidated inspection':s=>s.analysis.actionsInvalidated=true,
 'another execution':s=>s.analysis.stateatom.firstReadProfile.occurrence.readId='other-read',
 'another selected target':s=>s.analysis.stateatom.firstReadProfile.occurrence.targetId='other-target',
 'another frame':s=>s.analysis.stateatom.firstReadProfile.occurrence.frame='other-frame',
 'another run':s=>s.analysis.stateatom.firstReadProfile.occurrence.run='other-run',
 'different read value':s=>s.analysis.stateatom.firstReadProfile.occurrence.readValue=false,
 'ambiguous native request':s=>s.requests.push(structuredClone(s.requests[0])),
 'same URL different occurrence':s=>{s.requests[0].id='request-2';s.requests[0].inputResponse.requestId='request-2';},
 'unretained response':s=>delete s.requests[0].inputBody,
 'non GET response':s=>s.requests[0].inputResponse.method='POST',
}))test('does not offer inline editing for '+name,()=>{const {state,input}=fixture();change(state);assert.equal(dependencyResponseBinding(state,input),null);});
for(const [name,change] of Object.entries({
 'foreign selected node':s=>s.editor.target.node='other',
 'foreign document':s=>s.editor.target.document='other',
 'foreign run':s=>s.editor.target.run='other',
 'another property':s=>s.editor.target.property='text',
 'another source family':s=>s.sourceKind='dom-control',
 'closed editor':s=>s.active=false,
 'ambiguous resource':s=>s.draft.entries.push(structuredClone(s.draft.entries[0])),
 'later same URL response':s=>s.draft.entries[0].resource.locator.requestId='request-2',
 'another response field':s=>s.draft.entries[0].resource.locator.pointer='/ready',
 'missing resource':s=>s.draft.entries[0].missing=true,
 'read only resource':s=>s.draft.entries[0].resource.writable=false,
}))test('does not reuse an editor for '+name,()=>{const {state,input,snapshot}=fixture(),binding=dependencyResponseBinding(state,input);change(snapshot);assert.equal(dependencyEditorEntry(binding,snapshot),null);});
