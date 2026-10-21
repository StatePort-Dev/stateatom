// SPDX-License-Identifier: Apache-2.0
// CDP metadata only. Never read handler descriptions, function source or closures.
export async function inspectNativeActions(send,selector,identity,expected={}){
 const group='stateatom-actions-'+crypto.randomUUID(),out=[];
 const gap=(reason,stale=false)=>({id:'native:unknown',event:'unknown',mechanism:'dom-listener',registeredOn:'unknown',entry:{status:'Unknown/Unsupported',reason,evidenceIds:[]},calls:[],hookRelations:[],execution:{status:'not-observed'},freshness:stale?'Stale':'snapshot',identity});
 const valid=v=>Number.isSafeInteger(v)&&v>0;
 const marker=node=>{const a=node?.attributes;if(!Array.isArray(a)||a.length>512||a.length%2)return null;for(let i=0;i<a.length;i+=2)if(a[i]==='data-stateatom')return typeof a[i+1]==='string'&&a[i+1].length<=512?a[i+1]:null;return null;};
 const mismatch=(root,node)=>expected.document&&expected.document!=='cdp:'+root.backendNodeId||expected.node&&expected.node!=='cdp:'+node.backendNodeId;
 if(selector.includes(' >>> '))return [gap('Native listener lookup in shadow roots is unsupported')];
 try{
  const {root}=await send('DOM.getDocument',{depth:0});
  const selected=await send('DOM.querySelector',{nodeId:root.nodeId,selector});if(!selected.nodeId)return [gap('Selected node unavailable')];
  const {node}=await send('DOM.describeNode',{nodeId:selected.nodeId,depth:0,pierce:false});
  if(!valid(root.backendNodeId)||!valid(node?.backendNodeId)||node.nodeType!==1)return [gap('Native selected identity unavailable')];
  if(mismatch(root,node))return [gap('Selected DOM identity changed during native metadata read; inspect again',true)];
  if(typeof expected.marker==='string'&&marker(node)!==expected.marker)return [gap('Selected render occurrence changed or unavailable; inspect again',true)];
  const targets=[{nodeId:selected.nodeId,registeredOn:'selected-element'},{nodeId:root.nodeId,registeredOn:'document'}];
  for(const name of ['html','body']){const r=await send('DOM.querySelector',{nodeId:root.nodeId,selector:name});if(r.nodeId&&!targets.some(t=>t.nodeId===r.nodeId))targets.push({nodeId:r.nodeId,registeredOn:name});}
  for(const target of targets){
   const {object}=await send('DOM.resolveNode',{nodeId:target.nodeId,objectGroup:group});
   if(!object?.objectId)continue;
   const {listeners=[]}=await send('DOMDebugger.getEventListeners',{objectId:object.objectId,depth:1,pierce:false}),readAt=Date.now();
   for(const l of listeners.slice(0,12-out.length)){
    const id='native:'+out.length,registeredBackend=valid(l.backendNodeId)?l.backendNodeId:null,selectedTarget=target.registeredOn==='selected-element',targetConfirmed=!selectedTarget||registeredBackend===node.backendNodeId,registeredOn=selectedTarget&&!targetConfirmed?(registeredBackend===null?'unknown':'other-node'):target.registeredOn,delegated=registeredOn!=='selected-element';
    out.push({id,event:typeof l.type==='string'?l.type.slice(0,40):'unknown',mechanism:'dom-listener',registeredOn,status:targetConfirmed?'Observed':'Unknown/Unsupported',capture:l.useCapture===true,passive:l.passive===true,once:l.once===true,registration:{scriptId:String(l.scriptId).slice(0,80),line:l.lineNumber+1,column:l.columnNumber+1,positionBase:'one-based',selectedDocument:'cdp:'+root.backendNodeId,selectedNode:'cdp:'+node.backendNodeId,registeredNode:registeredBackend===null?null:'cdp:'+registeredBackend,nodeId:target.nodeId,mapping:'generated-script; original source unvalidated',snapshotId:group,readAt},entry:{status:'Unknown/Unsupported',reason:!targetConfirmed?'Listener backend target unavailable or different; selected-node registration is not established':delegated?'Propagation/delegation candidate; callback identity, event reach and invocation unknown':'Registered listener metadata; callback identity and original source unknown; execution not observed',evidenceIds:targetConfirmed?[id+':registration']:[]},calls:[],hookRelations:[],execution:{status:'not-observed'},freshness:'snapshot',identity});
   }
   if(out.length>=12)break;
  }
  const again=await send('DOM.querySelector',{nodeId:root.nodeId,selector});if(!again.nodeId)return [gap('Selected DOM identity changed during native metadata read; inspect again',true)];
  const {node:after}=await send('DOM.describeNode',{nodeId:again.nodeId,depth:0,pierce:false}),{root:current}=await send('DOM.getDocument',{depth:0});
  if(current?.backendNodeId!==root.backendNodeId||after?.backendNodeId!==node.backendNodeId||mismatch(current,after))return [gap('Selected DOM identity changed during native metadata read; inspect again',true)];
  if(typeof expected.marker==='string'&&marker(after)!==expected.marker)return [gap('Selected render occurrence changed or unavailable; inspect again',true)];
  return out;
 }catch{return [gap('Native listener metadata unavailable in this attached session')];}
 finally{await send('Runtime.releaseObjectGroup',{objectGroup:group}).catch(()=>{});}
}
