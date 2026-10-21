// SPDX-License-Identifier: Apache-2.0
// Preregistered finite workload and guards; not a universal performance SLA.
export const actionTraceResourceConfig=Object.freeze({samples:7,warmups:2,leafCalls:50,recordLimit:64,maxTraceBytes:65536,maxHandlerMedianMs:50,maxHandlerP95Ms:100,maxAppTaskP95Ms:250,maxListenerDelta:4});
export const actionTraceResourceCases=Object.freeze([
 {id:'unarmed',expected:'Action instrumentation enabled without Arm records no interaction and preserves original workload'},
 {id:'armed-budget',expected:'Selected original Event reaches exactly64 records then explicit partial gap; all50 original leaf calls still run'},
 {id:'cleanup',expected:'Cancel/Clear remove owned capture, preserve application effects and do not collect later native clicks'},
 {id:'baseline',expected:'Action instrumentation OFF with the same other property instrumentation preserves identical original outputs'},
 {id:'visual',expected:'Bounded partial rows retain scope, original13px and narrow layout without horizontal overflow'}
]);
export function installActionTraceResourceCases(app){
 if(!app.includes('</script>')||!app.includes('<template><main>'))throw Error('Registered resource fixture shape changed');
 const script=`
let resourceCalls=0;
function resourceLeaf(event: Event){resourceCalls++;}
function resourceBurst(event: Event){
 const begin=performance.now();
 ${'resourceLeaf(event);'.repeat(actionTraceResourceConfig.leafCalls)}
 const elapsed=performance.now()-begin;
 const output=document.getElementById('resource-result')!;
 output.dataset.calls=String(resourceCalls);output.dataset.elapsed=String(elapsed);
 output.textContent='Completed '+resourceCalls+' original leaf calls';
}
`;
 return app.replace('</script>',script+'</script>').replace('<template><main>','<template><main><section aria-label="Synthetic bounded resource workload"><button id="trace-resource-burst" :disabled="false" @click="resourceBurst">Run bounded workload</button><output id="resource-result" data-calls="0" data-elapsed="0">No workload yet</output></section>');
}
