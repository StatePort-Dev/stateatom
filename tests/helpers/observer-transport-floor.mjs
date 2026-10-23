// SPDX-License-Identifier: Apache-2.0
// Diagnostic controls only; no target waiver or product acceptance.
import assert from 'node:assert/strict';
const full=['Network','Page','Runtime','Debugger','Performance'];
export function transportDomains(mode){assert(['off','network','full','atom-basic'].includes(mode));return mode==='off'?[]:mode==='network'?['Network']:[...full];}
function permutations(a){return a.length===1?[a]:a.flatMap((x,i)=>permutations(a.filter((_,j)=>j!==i)).map(rest=>[x,...rest]));}
export function transportOrder(){const orders=permutations(['off','network','full','atom-basic']),rows=[];for(const warmup of[true,false])for(let block=0;block<(warmup?4:24);block++)orders[block].forEach((mode,position)=>rows.push({ordinal:rows.length,warmup,block,position,mode}));return rows;}
const percent=(a,b)=>Math.round((a/b-1)*1e10)/1e8;
const distribution=a=>{a=[...a].sort((a,b)=>a-b);const n=a.length;assert(n);return{n,p50:n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,p95:a[Math.ceil(.95*n)-1],max:a[n-1],min:a[0]};};
export function summarizeTransport(rows,host){
 const r=rows.filter(x=>x.host===host),order=transportOrder();assert.equal(r.length,112,'Incomplete/duplicate samples');
 for(let i=0;i<order.length;i++){const x=r[i];for(const[k,v]of Object.entries(order[i]))assert.equal(x[k],v,'Changed/reordered '+k);assert.equal(x.status,'complete');assert.equal(x.trusted,true);assert.equal(x.actions,1);assert.equal(x.requests,20);assert.equal(x.bytes,20480);assert(Number.isFinite(x.durationMs)&&x.durationMs>0);assert.equal(x.released,true);assert.equal(x.admission.nativeAttached,x.mode!=='off');assert.equal(x.admission.atomAttached,x.mode==='atom-basic');assert.equal(x.admission.editingGrant,false);assert.deepEqual(x.admission.domains,transportDomains(x.mode));}
 const measured=r.filter(x=>!x.warmup),modes=['off','network','full','atom-basic'],workload=Object.fromEntries(modes.map(m=>[m,distribution(measured.filter(x=>x.mode===m).map(x=>x.durationMs))]));
 const comparisons={networkVsOff:['network','off'],fullVsOff:['full','off'],atomVsOff:['atom-basic','off'],fullVsNetwork:['full','network'],atomVsFull:['atom-basic','full']},overhead=Object.fromEntries(Object.entries(comparisons).map(([k,[a,b]])=>[k+'Percent',percent(workload[a].p50,workload[b].p50)])),paired={};
 for(const[k,[a,b]]of Object.entries(comparisons))paired[k+'Percent']=Array.from({length:24},(_,block)=>{const t=Object.fromEntries(measured.filter(x=>x.block===block).map(x=>[x.mode,x.durationMs]));return percent(t[a],t[b]);});
 return{host,complete:true,measuredSamples:96,warmupSamples:16,workload,overhead,paired,pairedDistributions:Object.fromEntries(Object.entries(paired).map(([k,a])=>[k,distribution(a)])),targetsWaived:false,performanceAcceptance:false,boundary:'Harness-only single-target domain controls include Chrome extension event delivery/guards; no pure browser attribution, product target pass or replacement for V02.1'};
}
