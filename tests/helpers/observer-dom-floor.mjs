// SPDX-License-Identifier: Apache-2.0
// Harness-only diagnostic; never a performance acceptance/waiver.
import assert from'node:assert/strict';
import{transportOrder}from'./observer-transport-floor.mjs';
const full=['Network','Page','Runtime','Debugger','Performance'],modes=['off','full','dom','atom-basic'];
export function domOrder(){return transportOrder().map(t=>({...t,mode:t.mode==='network'?'dom':t.mode}));}
export function domDomains(mode){assert(modes.includes(mode));return mode==='off'?[]:[...full,...(['dom','atom-basic'].includes(mode)?['DOM']:[])];}
const commands=['DOM.enable','DOM.getDocument','DOM.querySelector','DOM.describeNode','DOM.querySelector','DOM.getDocument'];
const positive=n=>Number.isSafeInteger(n)&&n>0;
const percent=(a,b)=>Math.round((a/b-1)*1e10)/1e8;
const distribution=a=>{a=[...a].sort((a,b)=>a-b);const n=a.length;assert(n);return{n,p50:n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,p95:a[Math.ceil(.95*n)-1],max:a[n-1],min:a[0]};};
export function summarizeDOM(rows,host){
 const r=rows.filter(x=>x.host===host),order=domOrder();assert.equal(r.length,112,'Incomplete/duplicate samples');
 for(let i=0;i<order.length;i++){
  const x=r[i];for(const[k,v]of Object.entries(order[i]))assert.equal(x[k],v,'Changed/reordered '+k);
  assert.equal(x.status,'complete');assert.equal(x.trusted,true);assert.equal(x.actions,1);assert.equal(x.requests,20);assert.equal(x.bytes,20480);assert(Number.isFinite(x.durationMs)&&x.durationMs>0);assert.equal(x.released,true);
  assert.equal(x.admission.nativeAttached,x.mode!=='off');assert.equal(x.admission.atomAttached,x.mode==='atom-basic');assert.equal(x.admission.editingGrant,false);assert.equal(x.admission.activeObservation,false);assert.deepEqual(x.admission.domains,domDomains(x.mode));
  if(['full','dom'].includes(x.mode))assert.deepEqual(x.enabledCommands,full.map(d=>d+'.enable'));else assert.equal(x.enabledCommands,undefined);
  if(x.mode==='dom'){const p=x.domSeed;assert(p&&positive(p.document)&&positive(p.node));assert.equal(p.selector,'#run');assert.equal(p.value,'Run workload');assert.deepEqual(p.commands,commands);}else assert.equal(x.domSeed,undefined);
  if(x.mode==='atom-basic'){const p=x.atomPoint;assert(p&&/^cdp:[1-9]\d*$/.test(p.document)&&/^cdp:[1-9]\d*$/.test(p.node));assert.equal(p.selector,'#run');assert.equal(p.property,'text');assert.equal(p.value,'Run workload');}else assert.equal(x.atomPoint,undefined);
 }
 const measured=r.filter(x=>!x.warmup),workload=Object.fromEntries(modes.map(m=>[m,distribution(measured.filter(x=>x.mode===m).map(x=>x.durationMs))]));
 const comparisons={fullVsOff:['full','off'],domVsOff:['dom','off'],atomVsOff:['atom-basic','off'],domVsFull:['dom','full'],atomVsDOM:['atom-basic','dom']},overhead=Object.fromEntries(Object.entries(comparisons).map(([k,[a,b]])=>[k+'Percent',percent(workload[a].p50,workload[b].p50)])),paired={};
 for(const[k,[a,b]]of Object.entries(comparisons))paired[k+'Percent']=Array.from({length:24},(_,block)=>{const t=Object.fromEntries(measured.filter(x=>x.block===block).map(x=>[x.mode,x.durationMs]));return percent(t[a],t[b]);});
 return{host,complete:true,measuredSamples:96,warmupSamples:16,workload,overhead,paired,pairedDistributions:Object.fromEntries(Object.entries(paired).map(([k,a])=>[k,distribution(a)])),targetsWaived:false,performanceAcceptance:false,boundary:'Single-target raw attach domains versus attach+DOM/native fixed point versus actual Basic. Includes Chrome extension delivery/guards; no pure browser CPU attribution or product target acceptance.'};
}
// Self-contained: executed only in the owned inspector or source test. This
// fixed synthetic button is not a new general DOM resolver or app evaluation.
export async function seedDOMControl(idOrSend){
 const sent=[],send=async(m,p)=>{sent.push(m);return typeof idOrSend==='function'?idOrSend(m,p):chrome.debugger.sendCommand({tabId:idOrSend},m,p);};
 const check=(ok,why)=>{if(!ok)throw Error('DOM diagnostic seed: '+why);},positive=n=>Number.isSafeInteger(n)&&n>0;
 if(typeof idOrSend!=='function')check(positive(idOrSend),'invalid tab');
 await send('DOM.enable',{includeWhitespace:'all'});const {root}=await send('DOM.getDocument',{depth:0});check(positive(root?.nodeId)&&positive(root.backendNodeId),'missing document');
 const first=await send('DOM.querySelector',{nodeId:root.nodeId,selector:'#run'});check(positive(first?.nodeId),'missing node');
 const {node}=await send('DOM.describeNode',{nodeId:first.nodeId,depth:32});check(positive(node?.backendNodeId)&&node.nodeType===1&&node.nodeName==='BUTTON'&&node.localName==='button','wrong native button');
 check(node.childNodeCount===1&&node.children?.length===1&&node.children[0].nodeType===3&&node.children[0].nodeValue==='Run workload','changed fixture text');
 const again=await send('DOM.querySelector',{nodeId:root.nodeId,selector:'#run'});check(again?.nodeId===first.nodeId,'node replaced');
 const current=await send('DOM.getDocument',{depth:0});check(current.root?.backendNodeId===root.backendNodeId,'document replaced');
 return{document:root.backendNodeId,node:node.backendNodeId,value:'Run workload',selector:'#run',commands:sent};
}
