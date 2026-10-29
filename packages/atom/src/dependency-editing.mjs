// SPDX-License-Identifier: Apache-2.0
import {inspectionView} from '../../../browser-extension/inspection-view.mjs';
import {inspectionDependencies} from '../../../core/inspection-explanations.mjs';

// A presentation association, never a write capability. The existing editor
// still checks ownership, target identity, permission and resource revision.
// A parsed origin, matching name, URL or value alone cannot establish this join.
export function dependencyResponseBinding(state,input){
 const view=inspectionView(state),profile=view.firstReadProfile,occurrence=profile?.occurrence,selection=state.selection;
 if(!view.finiteTraceSupported||state.stale||state.analysis?.actionsInvalidated||!selection?.domIdentity||occurrence.run!==state.run||occurrence.frame!==state.mainFrameId||occurrence.readId!==input.id||!Object.is(occurrence.readValue,input.value))return null;
 const dependencies=inspectionDependencies(state),reads=dependencies.inputs.flatMap(r=>[r,...r.upstream||[]]);
 if(dependencies.status!=='Observed'||!reads.some(r=>r.id===input.id&&r.status==='Observed'&&Object.is(r.value,input.value)))return null;
 if(typeof occurrence.requestId!=='string'||!occurrence.requestId||typeof occurrence.pointer!=='string'||!occurrence.exchangeId||!occurrence.parseId)return null;
 const requests=(state.requests||[]).filter(r=>r.id===occurrence.requestId&&r.inputResponse?.frameId===occurrence.frame&&r.inputResponse?.mainFrame===true&&r.inputResponse?.requestId===occurrence.requestId);
 if(requests.length!==1)return null;
 const request=requests[0],response=request.inputResponse;
 if(response.method!=='GET'||request.url!==response.url||typeof request.inputBody!=='string')return null;
 return {kind:'json-response',readId:input.id,name:input.expression,source:input.source,value:input.value,tabId:state.tabId,run:state.run,page:selection.page,document:selection.domIdentity.document,node:selection.domIdentity.node,selector:selection.selector,property:selection.property,requestId:occurrence.requestId,requestOrdinal:response.requestOrdinal,url:response.url,method:response.method,pointer:occurrence.pointer};
}

export function dependencyEditorEntry(binding,snapshot){
 const target=snapshot?.editor?.target;
 if(!binding||!snapshot?.active||snapshot.sourceKind!=='json-response'||!target||!['tabId','run','document','node','selector','property'].every(k=>binding[k]===target[k]))return null;
 const matches=(snapshot.draft?.entries||[]).filter(e=>!e.missing&&e.resource.kind==='json-response'&&e.resource.writable===true&&['requestId','requestOrdinal','url','method','pointer'].every(k=>e.resource.locator[k]===binding[k]));
 return matches.length===1?matches[0]:null;
}
