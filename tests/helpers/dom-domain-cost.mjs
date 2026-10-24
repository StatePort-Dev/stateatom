// SPDX-License-Identifier: Apache-2.0
// Diagnostic controls only; no target waiver or product acceptance.
import assert from 'node:assert/strict';
const full=['Network','Page','Runtime','Debugger','Performance'];
export function domCostDomains(mode){assert(['off','full','full-dom','atom-basic'].includes(mode));return mode==='off'?[]:mode==='full'?[...full]:[...full,'DOM'];}
function permutations(a){return a.length===1?[a]:a.flatMap((x,i)=>permutations(a.filter((_,j)=>j!==i)).map(rest=>[x,...rest]));}
export function domCostOrder(){const orders=permutations(['off','full','full-dom','atom-basic']),rows=[];for(const warmup of[true,false])for(let block=0;block<(warmup?4:24);block++)orders[block].forEach((mode,position)=>rows.push({ordinal:rows.length,warmup,block,position,mode}));return rows;}
const percent=(a,b)=>Math.round((a/b-1)*1e10)/1e8;
const distribution=a=>{a=[...a].sort((a,b)=>a-b);const n=a.length;assert(n);return{n,p50:n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,p95:a[Math.ceil(.95*n)-1],max:a[n-1],min:a[0]};};
export function summarizeDOMCost(rows,host){
 assert(['standalone','embedding'].includes(host));const r=rows.filter(x=>x.host===host),order=domCostOrder();assert.equal(r.length,112,'Incomplete/duplicate samples');
 for(let i=0;i<order.length;i++){const x=r[i];for(const[k,v]of Object.entries(order[i]))assert.equal(x[k],v,'Changed/reordered '+k);assert.equal(x.status,'complete');assert.equal(x.trusted,true);assert.equal(x.actions,1);assert.equal(x.requests,20);assert.equal(x.bytes,20480);assert(Number.isFinite(x.durationMs)&&x.durationMs>0);assert.equal(x.released,true);assert.equal(x.admission.nativeAttached,x.mode!=='off');assert.equal(x.admission.atomAttached,x.mode==='atom-basic');assert.equal(x.admission.editingGrant,false);assert.deepEqual(x.admission.domains,domCostDomains(x.mode));assert.equal(x.admission.observationRecording,false);assert.equal(x.releaseNativeAttached,false);assert.equal(x.releaseAtomAttached,false);assert.equal(x.id,x.ordinal+1);assert.equal(x.admission.target.attached,x.mode!=='off');assert.equal(x.admission.target.type,'page');assert(Number.isSafeInteger(x.admission.target.tabId)&&x.admission.target.tabId>0);assert.deepEqual(x.enabledCommands,domCostCommands(x.mode));
  if(x.mode==='full-dom'){const d=x.domIdentity;assert.equal(d?.kind,'harness-native-dom');assert(Number.isSafeInteger(d.document)&&d.document>0&&Number.isSafeInteger(d.node)&&d.node>0);assert.equal(d.selector,'#run');assert.equal(d.value,'Run workload');assert.equal(d.verifiedTwice,true);}else if(x.mode==='atom-basic'){const d=x.domIdentity;assert.equal(d?.kind,'actual-atom-state');assert(/^cdp:[1-9]\d*$/.test(d.document));assert(/^cdp:[1-9]\d*$/.test(d.node));assert.equal(d.selector,'#run');assert.equal(d.value,'Run workload');}else assert.equal(x.domIdentity,null);}
 const measured=r.filter(x=>!x.warmup),modes=['off','full','full-dom','atom-basic'],workload=Object.fromEntries(modes.map(m=>[m,distribution(measured.filter(x=>x.mode===m).map(x=>x.durationMs))]));
 const comparisons={fullVsOff:['full','off'],fullDOMVsOff:['full-dom','off'],atomVsOff:['atom-basic','off'],fullDOMVsFull:['full-dom','full'],atomVsFullDOM:['atom-basic','full-dom']},overhead=Object.fromEntries(Object.entries(comparisons).map(([k,[a,b]])=>[k+'Percent',percent(workload[a].p50,workload[b].p50)])),paired={};
 for(const[k,[a,b]]of Object.entries(comparisons))paired[k+'Percent']=Array.from({length:24},(_,block)=>{const t=Object.fromEntries(measured.filter(x=>x.block===block).map(x=>[x.mode,x.durationMs]));return percent(t[a],t[b]);});
 return{host,complete:true,measuredSamples:96,warmupSamples:16,workload,overhead,paired,pairedDistributions:Object.fromEntries(Object.entries(paired).map(([k,a])=>[k,distribution(a)])),targetsWaived:false,performanceAcceptance:false,boundary:'Current full-vs-fullDOM harness controls include Chrome event routing/guards/setup effects; no pure browser CPU/cause, approved optimization or original15 target pass'};
}

export function domCostCommands(mode){
 domCostDomains(mode);if(mode==='atom-basic')return null;if(mode==='off')return[];
 return [...full.map(name=>name+'.enable'),...(mode==='full-dom'?['DOM.enable','DOM.getDocument','DOM.querySelector','DOM.describeNode','DOM.querySelector','DOM.getDocument']:[])];
}
export async function installDOMControl(send){
 const commands=[],command=async(method,params)=>{commands.push(method);return send(method,params);},valid=id=>Number.isSafeInteger(id)&&id>0;
 await command('DOM.enable',{includeWhitespace:'all'});const {root}=await command('DOM.getDocument',{depth:0});assert(valid(root?.nodeId)&&valid(root.backendNodeId),'DOMcontrol document identity');
 const {nodeId}=await command('DOM.querySelector',{nodeId:root.nodeId,selector:'#run'});assert(valid(nodeId),'DOMcontrol selected node');
 const {node}=await command('DOM.describeNode',{nodeId,depth:32});assert(node?.nodeType===1&&node.localName==='button'&&node.nodeName==='BUTTON'&&valid(node.backendNodeId),'DOMcontrol native button');assert.equal(node.childNodeCount,1);assert.equal(node.children?.length,1);assert([3,4].includes(node.children[0].nodeType));assert.equal(node.children[0].nodeValue,'Run workload');
 const repeated=await command('DOM.querySelector',{nodeId:root.nodeId,selector:'#run'});assert.equal(repeated.nodeId,nodeId,'DOMcontrol selected identity changed');const current=await command('DOM.getDocument',{depth:0});assert.equal(current.root?.backendNodeId,root.backendNodeId,'DOMcontrol document changed');
 return{commands,identity:{kind:'harness-native-dom',document:root.backendNodeId,node:node.backendNodeId,selector:'#run',value:'Run workload',verifiedTwice:true}};
}
