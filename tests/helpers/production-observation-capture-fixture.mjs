// SPDX-License-Identifier: Apache-2.0
// Synthetic real-ledger acquisition only; no installed runtime/UX proof.
import {createProductionObservation} from '../../core/production-observations.mjs';
import {inputOutcomeFixture} from './input-outcome-fixture.mjs';
import {createHandoffInputOutcomes} from '../../core/handoff-input-outcomes.mjs';
export async function productionObservationCaptureFixture({property='disabled',pending=false,endUnknown=false}={}){
 const f=inputOutcomeFixture();if(property==='text'){const d=JSON.parse(f.raw);d.target.property='text';d.target.value='PRIVATE_TEXT_CEDAR';f.raw=JSON.stringify(d);}const outcomes=await createHandoffInputOutcomes(f.raw,null),inputCapture={schema:'stateatom.input-outcome-capture/1',exportable:false,executable:false,capturedAt:2000,diagnosticRaw:f.raw,outcomes,limitations:[]};
 let at=2100;const identity={tabId:7,run:'PrivateRunCedar',document:'PrivateDocumentCedar',frame:'PrivateFrameCedar',origin:'https://private-cedar.example'},ledger=createProductionObservation({identity,target:{node:'PrivateNodeCedar',property,value:property==='disabled'?true:'PRIVATE_TEXT_CEDAR',observedAt:1900},now:()=>at});ledger.start();
 at=2200;const token=ledger.requestStart({requestId:'PrivateRequestCedar',at:2150,url:'https://private-request-cedar.example/private-path?q=PRIVATE_QUERY',method:'GET'},identity);
 at=2300;ledger.requestResponse(token,{at:2250,status:503},identity);if(!pending)ledger.requestEnd(token,{at:2240,outcome:'finished'},identity);
 ledger.error({at:2260,category:'TypeError',url:'https://private-error-cedar.example/PRIVATE_STACK',line:4,column:2},identity);
 ledger.checkpoint({at:2280,readStartedAt:2270,node:'PrivateNodeCedar',changeKind:'snapshot',value:property==='disabled'?false:'PRIVATE_NEW_TEXT'},identity);
 at=2400;let observation=ledger.stop('user');if(endUnknown){observation=structuredClone(observation);observation.endedAt=null;observation.stopReason='context-changed';}
 return {schema:'stateatom.production-observation-capture/1',exportable:false,executable:false,capturedAt:2500,inputCapture,observation,binding:{status:'capture-context-matched',reasons:[],dependency:'unknown'},limitations:[]};
}
