// SPDX-License-Identifier: Apache-2.0
// Pure conditional join over serialized facts and compiler sites. Owned code,
// source/effect and trusted selection acquisition are mandatory separate gates.
import path from 'node:path';
const bounded=s=>typeof s==='string'&&s.length>0&&s.length<=256;
const hash=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const relative=s=>typeof s==='string'&&s.length>0&&s.length<4096&&!path.posix.isAbsolute(s)&&!s.includes('\\')&&!s.includes('\0')&&s.split('/').every(p=>p&&p!=='.'&&p!=='..');
const unknown=reason=>({status:'Unknown/Unsupported',reason,fullPath:false,fieldOwnership:'Unknown/Unsupported',chain:[]});
export function joinListFieldObservations({manifest,trace,selection}={}){
 try{
  const require=(ok,reason)=>{if(!ok)throw Error(reason)},p=manifest?.program,f=trace?.listFieldObservations,page=f?.page;
  require(manifest?.schema==='stateatom.list-field-compilation/1'&&p?.digest===manifest.programDigest&&hash(p.digest)&&relative(p.appRoot)&&bounded(p.field)&&Array.isArray(p.modules)&&p.modules.length>0&&p.modules.length<=32&&Array.isArray(manifest.inputs),'Compiler source catalogue unavailable');
  require(bounded(page)&&page.startsWith('list-'+p.digest+':')&&/^[-a-f0-9]{36}$/.test(page.slice(70))&&trace.page===page&&selection?.page===page,'Original profile page identity does not join');
  const id=v=>bounded(v)&&v.startsWith(page+':');
  const observed=(v,schema)=>v?.schema===schema&&v.page===page&&v.status==='Observed';
  require(trace.status!=='Stale'&&f.schema==='stateatom.selected-list-observation/1'&&f.status==='Recorded'&&f.property==='text'&&selection.property==='text'&&selection.frame===0&&selection.shadow!=='open','Current top-level text observation unavailable');
  require(Number.isFinite(selection.observedAt)&&Date.now()-selection.observedAt>=0&&Date.now()-selection.observedAt<300000,'Selected observation expired');
  const dom=selection.domIdentity;require(dom?.property==='text'&&/^cdp:[1-9][0-9]*$/.test(dom.document)&&/^cdp:[1-9][0-9]*$/.test(dom.node)&&typeof selection.value==='string'&&dom.value===selection.value,'Exact trusted native DOM selection required');
  require(observed(f.environment,'stateatom.native-list-environment/1')&&f.environment.originalChecksUndefined===true&&f.environment.checks===4,'Original native environment checks unavailable');
  require(observed(f.commit,'stateatom.native-commit/1')&&id(f.commit.commitId)&&id(f.commit.rootId),'Current native commit unavailable');
  const dh=f.dom;require(dh?.schema==='stateatom.list-dom-history/1'&&dh.status==='Observed'&&dh.commitId===f.commit.commitId&&Number.isSafeInteger(dh.commitMutationSequence)&&dh.commitMutationSequence>=0&&Number.isSafeInteger(dh.selectedMutationSequence)&&dh.selectedMutationSequence>=0&&dh.selectedMutationSequence<=dh.commitMutationSequence,'Selected text changed after commit or DOM interval unavailable');
  const data=f.selected,transfer=data?.selected,j=transfer?.selected;
  require(observed(data,'stateatom.selected-list-data/1')&&observed(transfer,'stateatom.selected-list-transfers/1')&&observed(j,'stateatom.selected-field-write-read/1'),'Complete original selected write/read/transfer/data facts unavailable');
  const read=j.read,write=j.write,n=j.native?.selected,a=j.native?.ancestor;
  require(read?.field===p.field&&write?.field===p.field&&id(read.rowId)&&write.rowId===read.rowId&&id(read.invocationId)&&id(write.callId)&&id(write.revisionId),'Selected row, field or original invocation differs');
  require(n&&a&&[n.nodeId,n.fiberId,n.hostPropsId,a.fiberId,a.resultId,a.updateId,a.queueId].every(id)&&n.nodeId===a.nodeId&&n.rootId===a.rootId&&n.rootId===f.commit.rootId&&n.commitId===a.commitId&&n.commitId===f.commit.commitId&&a.revisionId===write.revisionId,'Applied revision and selected native commit do not join');
  const sites=new Map(),inputs=new Map(manifest.inputs.map(i=>[i.file,i]));require(inputs.size===manifest.inputs.length,'Duplicate compiler inputs');
  for(const m of p.modules){
   require(relative(m.file)&&hash(m.sourceDigest)&&inputs.get(path.posix.join(p.appRoot,m.file))?.sourceDigest===m.sourceDigest,'Original module source binding unavailable');
   function add(s,kind){require(s&&hash(s.id)&&!sites.has(s.id)&&s.file===m.file&&s.sourceDigest===m.sourceDigest&&Number.isInteger(s.line)&&s.line>0&&Number.isInteger(s.column)&&s.column>0,'Missing or ambiguous original source site');sites.set(s.id,{site:s,kind,module:m,source:{file:path.posix.join(p.appRoot,m.file),sourceDigest:m.sourceDigest,line:s.line,column:s.column}})}
   for(const s of m.writer?.sites||[])add(s,'write');
   if(m.fieldRead){add(m.fieldRead,'reader');add(m.fieldRead.read,'read');for(const s of m.fieldRead.hosts)add(s,'host')}
   if(m.transfer){add(m.transfer,'transfer');for(const s of m.transfer.inputs)add(s,'input');for(const s of m.transfer.outputs){add(s,'output');if(s.callback)add(s.callback,'callback')}}
   for(const s of m.dataSites||[])add(s,'data');
  }
  const site=(id,kind)=>{const s=sites.get(id);require(s?.kind===kind,'Original '+kind+' site unavailable');return s};
  const ws=site(write.siteId,'write'),reader=site(read.componentSiteId,'reader'),rs=site(read.siteId,'read'),hs=site(read.hostSiteId,'host');
  require(ws.site.field===p.field&&reader.site.field===p.field&&reader.site.parameterProp===read.parameterProp&&reader.site.read.id===rs.site.id&&reader.site.hosts.some(h=>h.id===hs.site.id),'Original field/read/host source roles differ');
  const records=data.data;require(['row','state','callback'].every(k=>observed(records?.[k],'stateatom.list-data-receipt/1')),'Original native data receipts unavailable');
  const row=records.row,state=records.state,cb=records.callback;
  require(id(row.rowId)&&row.rowId===state.rowId&&row.rowId===cb.rowId&&id(state.arrayId)&&cb.sourceId===state.arrayId&&id(cb.arrayId)&&id(cb.mapCallId)&&Array.isArray(row.fields)&&row.fields.includes(p.field),'Native data identities do not join');
  const rowSite=site(row.siteId,'data'),stateSite=site(state.siteId,'data'),filter=site(cb.filterSiteId,'data'),map=site(cb.mapSiteId,'data');
  require(rowSite.site.kind==='row-literal'&&rowSite.site.file===ws.site.file&&rowSite.site.sourceDigest===ws.site.sourceDigest&&rowSite.site.start===ws.site.objectStart&&rowSite.site.end===ws.site.objectEnd,'Selected row creation and field writer differ');
  require(stateSite.site.kind==='array-call'&&stateSite.site.output==='collection'&&stateSite.site.method===state.method&&filter.site.kind==='array-call'&&filter.site.method==='filter'&&filter.site.output==='collection'&&map.site.kind==='array-call'&&map.site.method==='map'&&map.site.output==='elements','Original collection/filter/map sites differ');
  const steps=transfer.transfers;require(Array.isArray(steps)&&steps.length>0&&steps.length<=8,'Bounded original prop chain unavailable');let previous=read.rowId,callbacks=0;const fibers=new Set(),sourceSteps=[];
  for(let i=0;i<steps.length;i++){
   const t=steps[i],out=site(t.siteId,'output'),incoming=site(t.input?.siteId,'input');
   require(id(t.invocationId)&&id(t.producerFiberId)&&!fibers.has(t.producerFiberId)&&t.producerFiberId!==n.fiberId&&t.valueId===previous&&id(t.input.valueId)&&out.module===incoming.module&&out.site.prop===t.prop&&incoming.site.kind===t.input.kind&&incoming.site.prop===t.input.prop,'Original prop input/output or native sender differs');fibers.add(t.producerFiberId);
   require(i===0?t.prop===read.parameterProp:t.prop===steps[i-1].input.prop,'Original component parameter names do not join');
   if(t.callback){const callback=site(t.callback.siteId,'callback');callbacks++;require(i===0&&out.site.callback?.id===callback.site.id&&t.callback.method==='map'&&t.callback.rowId===read.rowId&&id(t.callback.collectionId)&&callback.module===map.module&&filter.module===map.module&&callback.site.line===map.site.line&&callback.site.column===map.site.column,'Original selected row callback source differs')}
   else require(!out.site.callback,'Original callback receipt missing');
   if(i===steps.length-1)require(t.input.kind==='state-binding'&&incoming.module.file===p.root?.file&&t.producerFiberId===a.fiberId&&t.input.valueId===a.resultId,'Original root state differs from applied result');else require(t.input.kind==='parameter','Unexpected intermediate state binding');
   sourceSteps.push({kind:'prop',label:'Passed as '+t.prop,source:out.source});if(t.callback)sourceSteps.push({kind:'map',label:'Original row rendered',source:map.source},{kind:'filter',label:'Rows filtered',source:filter.source});sourceSteps.push({kind:t.input.kind,label:t.input.kind==='state-binding'?'Applied state binding':'Received component parameter',source:incoming.source});previous=t.input.valueId;
  }
  require(callbacks===1,'Unique original selected map callback required');
  return{status:'Conditional selected list join',fullPath:false,fieldOwnership:'Unknown/Unsupported',field:p.field,page,
   chain:[{kind:'write',label:'Reducer wrote '+p.field,source:ws.source},...sourceSteps.reverse(),{kind:'read',label:'Component read '+p.field,source:rs.source},{kind:'host',label:'Selected committed text operand',source:hs.source}],
   joins:{row:{nativeId:read.rowId,dataId:row.rowId},state:{nativeId:a.resultId,dataId:state.arrayId},commitId:f.commit.commitId,rootId:f.commit.rootId,revisionId:write.revisionId,writeCallId:write.callId,readInvocationId:read.invocationId,node:{observedId:n.nodeId,document:dom.document,domId:dom.node}},
   scope:'Conditional original fact/source join only. Native/data IDs are separate namespaces joined by acquired collector references; source coordinates and displayed text are not resolver keys. Trusted selection acquisition and owned source/effect/code authority remain required.'};
 }catch(error){return unknown(error.message||'Selected list facts unavailable')}
}
