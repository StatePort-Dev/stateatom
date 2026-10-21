// SPDX-License-Identifier: Apache-2.0
// Preregistered synthetic application controls. Not new supported-product claims.
export const actionTraceSessionCases=Object.freeze([
 {id:'bubble',expected:'Exact original child and parent synchronous bodies, independent source-open range'},
 {id:'capture-stop',expected:'Capture then child stopPropagation; no bubble-parent body'},
 {id:'throw',expected:'Original thrown object reaches Vue error handler unchanged; one body leave by throw'},
 {id:'disabled',expected:'Disabled target selectable; no native click dispatch/body; observation expires'},
 {id:'unrelated',expected:'Other target click changes the app but never joins selected interaction'},
 {id:'keyboard',expected:'Tab skips disabled Cancel, Enter arms and cancels through native controls'},
 {id:'selection',expected:'Changing selected native instance retains old history stale with no source navigation'},
 {id:'clear-stale',expected:'Clear removes this view’s retired stale history without entering the new native context'},
 {id:'foreign-view-clear',expected:'Clearing old rows locally cannot clear or cancel another live inspector’s observation'},
 {id:'navigation',expected:'Real reload invalidates old run; unarmed new-document click is not collected'},
 {id:'private-peer',expected:'Closing armed inspector peer retires owner; fresh peer can arm without reinspection'},
 {id:'source-HMR',expected:'Actual same-output source edit invalidates armed trace; original bytes restored'},
 {id:'source-disconnect',expected:'Unpair stops collection; Basic keeps selection usable and Arm unavailable'},
 {id:'descriptor-override',expected:'Later page descriptor override is never invoked by native Arm/Read/Cancel/Clear'},
 {id:'helper-global-getter',expected:'Accessor-backed helper global is refused without running the getter'},
 {id:'helper-stale',expected:'Collector invalidation stays historical through native polling, with no current source button'},
 {id:'helper-stopped',expected:'Stopped collector stays historical through native polling, with no current source button'},
 {id:'cancel-pending-IDE',expected:'Cancel retains body without waiting for held real IDE reply; late reply cannot undo cancellation'}
]);
export function installActionTraceSessionCases(app,main){
 const script=`
(window as any).vueSessionLog=[];
const sessionError={syntheticActionError:true};(window as any).vueSessionError=sessionError;
(window as any).vueSessionErrorSame=null;
function traceChild(event: Event){(window as any).vueSessionLog.push('child');}
function traceParent(event: Event){(window as any).vueSessionLog.push('parent');}
function traceCapture(event: Event){(window as any).vueSessionLog.push('capture');}
function traceStop(event: Event){(window as any).vueSessionLog.push('stop');event.stopPropagation();}
function traceOther(event: Event){(window as any).vueSessionLog.push('other');}
function traceInvalidate(event: Event){(window as any).__STATEATOM__.invalidate('Synthetic collector invalidation');}
function traceStopObserver(event: Event){(window as any).__STATEATOM__.stop();}
function traceThrow(event: Event){(window as any).vueSessionLog.push('throw');throw sessionError;}
`;
 const controls=`<section aria-label="Synthetic Action Trace controls">
<div @click="traceParent"><button id="trace-child" @click="traceChild">Child and parent</button></div>
<div @click.capture="traceCapture" @click="traceParent"><button id="trace-stop" @click="traceStop">Capture and stop</button></div>
<button id="trace-throw" @click="traceThrow">Throw original object</button>
<button id="trace-disabled" disabled @click="traceChild">Disabled action</button>
<button id="trace-invalidate" @click="traceInvalidate">Invalidate collector</button><button id="trace-stop-observer" @click="traceStopObserver">Stop observer</button>
<button id="trace-other" @click="traceOther">Other target</button>
</section>`;
 if(!app.includes('</script>')||!app.includes('<template><main>')||!main.includes('const app=createApp(App);'))throw Error('Registered fixture shape changed');
 return{app:app.replace('</script>',script+'</script>').replace('<template><main>','<template><main>'+controls),main:main.replace('const app=createApp(App);',"const app=createApp(App);app.config.errorHandler=error=>{(window as any).vueSessionErrorSame=error===(window as any).vueSessionError;};")};
}
