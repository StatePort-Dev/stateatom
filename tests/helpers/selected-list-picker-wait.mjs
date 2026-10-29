// SPDX-License-Identifier: Apache-2.0
// Native-driver completion barrier: a resolving picker may still expose the
// previous selected proof. It must finish before a new inspection begins.
export function completedListPicker(state,{pickerId,observedAt,revisionId}){
 const profile=state?.analysis?.stateatom?.selectedListProfile;
 return state?.picker?.status==='selected'&&state.picker.id===pickerId&&state.selection?.observedAt>observedAt&&profile?.observedAt===state.selection.observedAt&&profile?.fullPath===true&&profile.occurrence?.joins?.revisionId===revisionId;
}
