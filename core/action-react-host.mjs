// SPDX-License-Identifier: Apache-2.0
// Internal finite React-compatible host-data collector, not renderer attestation.
// Native descriptors only: no application function/getter/source/closure execution.
import {MAP_LIMITS} from './source-maps.mjs';
const integer=(x,min=0)=>Number.isSafeInteger(x)&&x>=min;
const ordinary=o=>o?.type==='object'&&typeof o.objectId==='string'&&!o.subtype;
const callable=o=>o?.type==='function'&&typeof o.objectId==='string'&&!o.subtype;
export async function inspectReactHostActions(send,selector,identity,expected={},options={}){
 const group='stateatom-react-host-'+crypto.randomUUID(),out=[];let commands=0,staleRead=false;
 const gap=(reason,stale=false)=>[{id:'react-host:unknown',mechanism:'react-host-props',status:stale?'Stale':'Unknown/Unsupported',boundOn:'unknown',reason,entry:{status:'Unknown/Unsupported',reason,evidenceIds:[]},freshness:stale?'Stale':'snapshot',execution:{status:'not-observed'},callbackIdentity:'Unknown/Unsupported',frameworkVersion:'not-attested',propertyProducer:'Unknown/Unsupported',identity}];
 const guard=()=>{if(options.signal?.aborted||options.current?.()===false)throw Error('Stale');};
 const call=async(method,p)=>{guard();if(++commands>24)throw Error('Budget');const r=await send(method,p);guard();return r;};
 const properties=async objectId=>{const r=await call('Runtime.getProperties',{objectId,ownProperties:true,generatePreview:false});if(r.exceptionDetails||!Array.isArray(r.result)||r.result.length>512)throw Error('Descriptors');const names=new Set();for(const d of r.result){if(typeof d.name!=='string'||d.name.length>512||names.has(d.name))throw Error('Descriptors');names.add(d.name);}return r;};
 const data=(r,name)=>{const d=r.result.find(d=>d.name===name);return d?.isOwn===true&&!d.get&&!d.set?d.value:undefined;};
 const marker=n=>{const a=n?.attributes;if(!Array.isArray(a)||a.length>512||a.length%2)return null;const i=a.indexOf('data-stateatom');return i>=0&&i%2===0?a[i+1]:null;};
 const same=(root,n)=>'cdp:'+root?.backendNodeId===expected.document&&'cdp:'+n?.backendNodeId===expected.node&&n?.nodeType===1&&(typeof expected.marker!=='string'||marker(n)===expected.marker);
 try{
  guard();if(typeof selector!=='string'||!selector||selector.length>1024||selector.includes(' >>> ')||!integer(expected.executionContextId,1)||typeof expected.frameId!=='string'||!expected.frameId||typeof expected.document!=='string'||!/^cdp:[1-9]\d*$/.test(expected.document)||typeof expected.node!=='string'||!/^cdp:[1-9]\d*$/.test(expected.node))return gap('Exact selected MAIN context/backend required');
  const {root}=await call('DOM.getDocument',{depth:0}),selected=await call('DOM.querySelector',{nodeId:root.nodeId,selector});if(!selected.nodeId)return gap('Selected host unavailable',true);
  const {node}=await call('DOM.describeNode',{nodeId:selected.nodeId,depth:0,pierce:false});if(!same(root,node))return gap('Selected DOM occurrence changed',true);
  const {object}=await call('DOM.resolveNode',{nodeId:selected.nodeId,executionContextId:expected.executionContextId,objectGroup:group});if(object?.type!=='object'||object.subtype!=='node'||!object.objectId)return gap('Selected MAIN node wrapper unavailable');
  async function carrier(){const own=await properties(object.objectId),propsKeys=own.result.filter(d=>d.name.startsWith('__reactProps$')),fiberKeys=own.result.filter(d=>d.name.startsWith('__reactFiber$'));
  if(propsKeys.length!==1||fiberKeys.length!==1||!/^__reactProps\$[a-z0-9]{1,64}$/i.test(propsKeys[0].name)||propsKeys[0].name.slice(13)!==fiberKeys[0].name.slice(13))return gap('No unique matching own React-compatible host carrier');
  const props=data(own,propsKeys[0].name),fiber=data(own,fiberKeys[0].name);if(!ordinary(props)||!ordinary(fiber))return gap('Host carrier is accessor, Proxy or unsupported object');
  const fields=await properties(fiber.objectId),host=data(fields,'stateNode');if(data(fields,'tag')?.value!==5||data(fields,'type')?.value!==node.localName||data(fields,'elementType')?.value!==node.localName||host?.subtype!=='node'||!host.objectId)return gap('Selected carrier does not identify a direct host Fiber');
  const {node:hostNode}=await call('DOM.describeNode',{objectId:host.objectId,depth:0,pierce:false});if('cdp:'+hostNode?.backendNodeId!==expected.node)return gap('Fiber stateNode is not the selected host');
  return{slots:await properties(props.objectId),hostNode:'cdp:'+hostNode.backendNodeId};}
  async function collect(carrierRead){const slots=carrierRead.slots,rows=[];
  for(const property of['onClick','onClickCapture']){
   const callback=data(slots,property);if(!callable(callback))continue;
   const fn=await properties(callback.objectId),locations=fn.internalProperties?.filter(d=>d.name==='[[FunctionLocation]]')||[];if(locations.length!==1)continue;
   const location=locations[0].value?.value;if(typeof location?.scriptId!=='string'||!location.scriptId||location.scriptId.length>80||!integer(location.lineNumber)||location.lineNumber>=MAP_LIMITS.lines||!integer(location.columnNumber)||location.columnNumber>MAP_LIMITS.bytes)continue;
   const id='react-host:'+rows.length;rows.push({id,mechanism:'react-host-props',event:'click',capture:property==='onClickCapture',property,boundOn:'selected-element',status:'Observed',generated:{scriptId:location.scriptId,line:location.lineNumber+1,column:location.columnNumber+1,positionBase:'one-based'},carrier:{method:'CDP own-data descriptors / native FunctionLocation',profile:'react-dom18-compatible-host-props/1',hostNode:carrierRead.hostNode,selectedDocument:expected.document,selectedNode:expected.node,frameId:expected.frameId,executionContextId:expected.executionContextId,snapshotId:group,readAt:Date.now()},entry:{status:'Unknown/Unsupported',reason:'Current own host callback slot and native function location only; renderer/version not attested, original source and execution unverified',evidenceIds:[id+':host-slot']},freshness:'snapshot',execution:{status:'not-observed'},callbackIdentity:'Unknown/Unsupported',frameworkVersion:'not-attested',propertyProducer:'Unknown/Unsupported',httpOrigin:'Unknown/Unsupported',identity});
  }
  return rows;}
  const first=await carrier();if(!first.slots)return first;out.push(...await collect(first));
  if(out.length){const second=await carrier();if(!second.slots)return gap('Selected callback carrier changed during read',true);const latest=await collect(second),key=rows=>JSON.stringify(rows.map(b=>[b.property,b.generated]));if(key(out)!==key(latest)){staleRead=true;throw Error('Changed');}}
  const again=await call('DOM.querySelector',{nodeId:root.nodeId,selector});if(!again.nodeId)return gap('Selected host changed during metadata read',true);const {node:after}=await call('DOM.describeNode',{nodeId:again.nodeId,depth:0,pierce:false}),{root:current}=await call('DOM.getDocument',{depth:0});if(!same(current,after))return gap('Selected DOM occurrence changed during metadata read',true);
  return out.length?out:gap('No supported own click callback with native function location');
 }catch{const stale=staleRead||options.signal?.aborted||options.current?.()===false;return gap(stale?'Native host metadata read cancelled, changed or stale':'Native host callback metadata unavailable',stale);}
 finally{await send('Runtime.releaseObjectGroup',{objectGroup:group}).catch(()=>{});}
}
