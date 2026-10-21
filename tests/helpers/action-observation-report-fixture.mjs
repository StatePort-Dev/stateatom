// SPDX-License-Identifier: Apache-2.0
import{createActionObservation}from'../../core/action-observation.mjs';
const identity={run:'recorded-run',build:'a'.repeat(64),frame:'main',page:'recorded-page'},site={id:'click-site',file:'src/actions.js',sourceDigest:'b'.repeat(64),line:3,column:1,endLine:6,endColumn:2,kind:'function',symbol:'save'};
export function actionObservationReportFixture(status='complete'){
 let n=0;const ledger=createActionObservation({identity,sites:[site],id:()=>`record-${++n}`});ledger.arm({selectedId:'selected-node'});
 if(status!=='armed'){const event={};ledger.dispatch(event,{targetId:'nested-node',trusted:true});const entry=ledger.enter(site.id,event,'selected-node');if(!['partial','collecting'].includes(status))ledger.leave(entry,false);if(status!=='collecting')ledger.finish();}
 if(status==='stale')ledger.invalidate();if(status==='stopped')ledger.stop();if(status==='cancelled')ledger.cancel();if(status==='cleared')ledger.clear();
 const trace={...ledger.snapshot(),sourceCurrent:true,capturedAt:1234};
 return{trace,state:{selection:{selector:'#different-property',tag:'button',property:'disabled',value:false,observedAt:12},analysis:{graph:{identity:{run:'other-run',build:'c'.repeat(64)}},actionBindings:[{mechanism:'vue-template',execution:{status:'not-observed'},calls:[],hookRelations:[]}]},actionTrace:trace}};
}

