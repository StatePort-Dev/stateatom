// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
const load=()=>import('./helpers/selected-list-picker-wait.mjs');
const before={pickerId:'current-picker',observedAt:100,revisionId:'same-value-revision'};
const state=status=>({picker:{id:before.pickerId,status},selection:{observedAt:102},analysis:{stateatom:{selectedListProfile:{field:'caption',fullPath:true,observedAt:102,occurrence:{joins:{revisionId:before.revisionId}}}}}});
test('recorded resolving picker with an older complete profile must not release the next inspection',async()=>{
 const {completedListPicker}=await load();assert.equal(completedListPicker(state('resolving'),before),false);assert.equal(completedListPicker(state('picking'),before),false);assert.equal(completedListPicker(state('selected'),before),true);
});
test('picker completion requires this session, a new selected snapshot and the same supported revision',async()=>{
 const {completedListPicker}=await load();for(const change of[s=>s.picker.id='other',s=>s.selection.observedAt=100,s=>s.analysis.stateatom.selectedListProfile.observedAt=101,s=>s.analysis.stateatom.selectedListProfile.fullPath=false,s=>s.analysis.stateatom.selectedListProfile.occurrence.joins.revisionId='other']){const value=state('selected');change(value);assert.equal(completedListPicker(value,before),false);}
});
