// SPDX-License-Identifier: Apache-2.0
// Fixed raw attachment controls, not a product performance gate.
import assert from'node:assert/strict';
const modes=['off','bare','network','debugger','full'],base=[0,1,4,2,3];
const orders=[base,[...base].reverse()].flatMap(a=>Array.from({length:5},(_,offset)=>a.map(i=>modes[(i+offset)%5])));
export function attachmentOrder(){const r=[];for(const warmup of[true,false])for(let block=0;block<(warmup?5:30);block++)orders[block%10].forEach((mode,position)=>r.push({ordinal:r.length,warmup,block,position,mode}));return r;}
export function attachmentCommands(mode){
 assert(modes.includes(mode));const network=['Network.enable',{maxTotalBufferSize:2000000,maxResourceBufferSize:512000}],debuggerCommand=['Debugger.enable',{maxScriptsCacheSize:2000000}];
 return mode==='network'?[network]:mode==='debugger'?[debuggerCommand]:mode==='full'?[network,['Page.enable',{}],['Runtime.enable',{}],debuggerCommand,['Performance.enable',{}]]:[];
}
const percent=(a,b)=>Math.round((a/b-1)*1e10)/1e8;
const distribution=a=>{a=[...a].sort((a,b)=>a-b);const n=a.length;assert(n);return{n,p50:n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,p95:a[Math.ceil(.95*n)-1],max:a[n-1],min:a[0]};};
export function summarizeAttachment(rows,host){
 const r=rows.filter(x=>x.host===host),order=attachmentOrder();assert.equal(r.length,175,'Incomplete/duplicate samples');
 for(let i=0;i<order.length;i++){
  const x=r[i];for(const[k,v]of Object.entries(order[i]))assert.equal(x[k],v,'Changed/reordered '+k);
  assert.equal(x.status,'complete');assert.equal(x.trusted,true);assert.equal(x.actions,1);assert.equal(x.setupActionDelta,0);assert.equal(x.requests,20);assert.equal(x.bytes,20480);assert(Number.isFinite(x.durationMs)&&x.durationMs>0);assert.equal(x.released,true);
  const expected=attachmentCommands(x.mode);assert.deepEqual(x.issuedCommands,expected);assert.equal(x.admission.nativeAttached,x.mode!=='off');assert.equal(x.admission.atomAttached,false);assert.equal(x.admission.editingGrant,false);assert.equal(x.admission.activeObservation,false);assert.deepEqual(x.admission.domains,expected.map(([m])=>m.split('.')[0]));assert(Number.isSafeInteger(x.tabId)&&x.tabId>0);assert.equal(x.admission.target.tabId,x.tabId);assert.equal(x.admission.target.type,'page');assert.equal(x.admission.target.attached,x.mode!=='off');
 }
 const measured=r.filter(x=>!x.warmup),workload=Object.fromEntries(modes.map(m=>[m,distribution(measured.filter(x=>x.mode===m).map(x=>x.durationMs))]));
 const comparisons={bareVsOff:['bare','off'],networkVsOff:['network','off'],debuggerVsOff:['debugger','off'],fullVsOff:['full','off'],networkVsBare:['network','bare'],debuggerVsBare:['debugger','bare'],fullVsNetwork:['full','network'],fullVsDebugger:['full','debugger']},overhead=Object.fromEntries(Object.entries(comparisons).map(([k,[a,b]])=>[k+'Percent',percent(workload[a].p50,workload[b].p50)])),paired={};
 for(const[k,[a,b]]of Object.entries(comparisons))paired[k+'Percent']=Array.from({length:30},(_,block)=>{const t=Object.fromEntries(measured.filter(x=>x.block===block).map(x=>[x.mode,x.durationMs]));return percent(t[a],t[b]);});
 return{host,complete:true,measuredSamples:150,warmupSamples:25,workload,overhead,paired,pairedDistributions:Object.fromEntries(Object.entries(paired).map(([k,a])=>[k,distribution(a)])),targetsWaived:false,performanceAcceptance:false,boundary:'Raw explicit enable-command controls, Atom detached. Includes native attachment/extension delivery/shared-host context, not pure browser CPU attribution, universal floor or product latency/active acceptance.'};
}
