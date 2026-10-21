// SPDX-License-Identifier: Apache-2.0
// Additional original A05 controls. Equal HTTP values are never analyzer hints.
export const actionTraceSemanticCases=Object.freeze([
 {id:'concurrent-requests',expected:'An unrelated held request and selected request complete out of order with equal data; only selected synchronous body is observed, no request consequence edge'},
 {id:'async-gap',expected:'Actual async request/consumption completes while trace retains dispatch-only explicit gap'},
 {id:'callback-replaced',expected:'Actual Vue callback replacement never borrows the old body; current reinspection observes the alternative source body'},
 {id:'expiry-inside-body',expected:'An original synchronous body outlives the10-second budget: retain dispatch/entry and explicit missing exit, never deny known interaction or undo the app'},
 {id:'action-disabled-control',expected:'Same property instrumentation without Action Trace produces identical original request/handler outputs'}
]);
export function installActionTraceSemanticCases(app){
 if(!app.includes('function alternative(){')||!app.includes('</script>')||!app.includes('<template><main>'))throw Error('Registered semantic fixture shape changed');
 const script=`
let selectedResponses=0,backgroundResponses=0,selectedFlag=false,backgroundFlag=false;
function networkDone(which: string,body: {flag: boolean}){
 if(which==='selected'){selectedResponses++;selectedFlag=body.flag;}else{backgroundResponses++;backgroundFlag=body.flag;}
 const out=document.getElementById('network-result')!;
 out.dataset.selected=String(selectedResponses);out.dataset.background=String(backgroundResponses);
 out.dataset.selectedFlag=String(selectedFlag);out.dataset.backgroundFlag=String(backgroundFlag);
 out.textContent='Selected '+selectedResponses+'; background '+backgroundResponses;
}
function requestSelected(event: Event){fetch('/__a05/selected').then(r=>r.json()).then(body=>networkDone('selected',body));}
function requestBackground(event: Event){fetch('/__a05/background').then(r=>r.json()).then(body=>networkDone('background',body));}
async function requestAsync(event: Event){const response=await fetch('/__a05/selected');const body=await response.json();networkDone('selected',body);}
function requestSlow(event: Event){const begin=performance.now();const xhr=new XMLHttpRequest();xhr.open('GET','/__a05/slow',false);xhr.send();const out=document.getElementById('slow-result')!;out.dataset.count=String(Number(out.dataset.count)+1);out.dataset.elapsed=String(performance.now()-begin);out.textContent='Original slow action completed';}
`;
 return app.replace('function alternative(){','function alternative(event: Event){').replace('</script>',script+'</script>').replace('<template><main>','<template><main><section aria-label="Synthetic independent network controls"><button id="request-selected" :disabled="false" @click="requestSelected">Selected request</button><button id="request-background" @click="requestBackground">Unrelated request</button><button id="request-async" :disabled="false" @click="requestAsync">Async request</button><output id="network-result" data-selected="0" data-background="0" data-selected-flag="false" data-background-flag="false">No response yet</output><button id="request-slow" :disabled="false" @click="requestSlow">Original action beyond budget</button><output id="slow-result" data-count="0" data-elapsed="0">No slow action yet</output></section>');
}
