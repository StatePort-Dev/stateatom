// SPDX-License-Identifier: Apache-2.0
// Test-only. Execute only on the owned inspector, never on an application target.
import assert from'node:assert/strict';import{createHash}from'node:crypto';
export function inputOrderProbe({action='read',phase,draft,incoming=null,planId=null,raw=null}={}){
 const key='__stateatom_v0319_inspector_input_order_v1',existing=Object.getOwnPropertyDescriptor(globalThis,key);
 if(action==='start'){
  if(existing)throw Error('ORDER_PROBE_ALREADY_ACTIVE');
  const records=[],errors=[];let seen=0,overflow=false,stopped=false;
  const phases=new Set(['receive-before','receive-after','edit-before','edit-after','settle-before','settle-after']);
  const bounded=(v,max)=>{if(v===null||v===undefined)return null;if(typeof v!=='string'||v.length>max)throw Error('INVALID_STRING');return v;};
  const scalar=v=>{if(v===null||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v))return v;if(typeof v==='string'&&v.length<=128)return v;throw Error('INVALID_SCALAR');};
  const resource=r=>{if(!r||r.locator?.selector!=='#minPrice')throw Error('INVALID_RESOURCE');return{id:bounded(r.id,160),value:scalar(r.value),revision:bounded(r.revision,2048)};};
  function one(rows){if(!Array.isArray(rows))throw Error('MISSING_ROWS');const list=rows.filter(x=>x.resource?.locator?.selector==='#minPrice');if(list.length!==1)throw Error('MISSING_OR_AMBIGUOUS_ROW');return list[0];}
  const api={owner:'stateatom-v0319',record(data){
   seen++;if(stopped)return false;if(seen>256){overflow=true;return false;}
   try{
    if(!phases.has(data.phase))throw Error('INVALID_PHASE');const row=one(data.draft?.entries),r=resource(row.resource);
    const projected={id:bounded(row.id,160),raw:typeof row.raw==='string'?bounded(row.raw,128):scalar(row.raw),value:r.value,resourceRevision:r.revision,draftResourceRevision:bounded(row.draftResource?.revision,2048),draftResourceValue:row.draftResource?scalar(row.draftResource.value):null,dirty:!!row.dirty,valid:!!row.valid,conflict:!!row.conflict,error:bounded(row.error,128)};
    let next=null;if(data.incoming!==null&&data.incoming!==undefined){const value=data.incoming,ir=resource(one(value.resources).resource);if(!Number.isSafeInteger(value.revision)||!Array.isArray(value.history))throw Error('INVALID_INCOMING');next={investigationId:bounded(value.investigationId,160),revision:value.revision,historyLength:value.history.length,row:ir};}
    records.push({index:records.length+1,phase:data.phase,row:projected,incoming:next,planId:bounded(data.planId,160),raw:data.raw===null||data.raw===undefined?null:bounded(data.raw,128)});
   }catch{if(!errors.includes('PROJECTION_INVALID'))errors.push('PROJECTION_INVALID');}return false;
  },invalidate(){if(!errors.includes('OBSERVER_FAILED'))errors.push('OBSERVER_FAILED');return false;},read(){return{schema:1,status:overflow||errors.length?'INVALID':stopped?'STOPPED':'ACTIVE',seen,overflow,records:structuredClone(records),errors:[...errors],applicationTarget:false};},stop(){stopped=true;if(Object.getOwnPropertyDescriptor(globalThis,key)?.value===api)delete globalThis[key];return api.read();}};
  Object.defineProperty(globalThis,key,{value:api,configurable:true,enumerable:false,writable:false});return api.read();
 }
 const api=existing?.value;if(!api||api.owner!=='stateatom-v0319')throw Error('ORDER_PROBE_NOT_ACTIVE');
 if(action==='record')return api.record({phase,draft,incoming,planId,raw});if(action==='error')return api.invalidate();if(action==='stop')return api.stop();if(action==='read')return api.read();throw Error('INVALID_ORDER_ACTION');
}
const hash=s=>createHash('sha256').update(s).digest('hex');
export function inputOrderSites(source,layout){
 assert.equal(typeof source,'string');assert(['source','packed76'].includes(layout),'Unsupported order source layout');
 const startNeedle='function createInputController(',start=source.indexOf(startNeedle);assert(start>=0&&source.indexOf(startNeedle,start+1)===-1,'Ambiguous controller source');
 const end=layout==='packed76'?source.indexOf('function createInputUI(',start):source.length;assert(end>start,'Missing controller boundary');const region=source.slice(start,end),packed=layout==='packed76',value=packed?'value6':'value',id=packed?'id2':'id';
 const pairs=[['receive','model.receive('+value+');',packed?'\n    if (value6.closed)':'if(value.closed)',{incoming:value}],['edit','model.edit('+id+', raw);'.replace(', ',packed?', ':','),packed?'\n    failure3 = null;':'failure=null;', {raw:'raw'}],['settle','model.settle(prepared.ticket,'+(packed?' ':'')+value+');',packed?'\n        if (!last || value6.revision >= last.revision)':'if(!last||value.revision>=last.revision)',{incoming:value,planId:'prepared.plan.id'}]];
 function position(offset){const before=source.slice(0,offset),lineNumber=before.split('\n').length-1,columnNumber=offset-(before.lastIndexOf('\n')+1);return{lineNumber,columnNumber};}
 const sites=[];
 for(const[name,call,after,extra]of pairs){const needle=call+after,at=region.indexOf(needle);assert(at>=0&&region.indexOf(needle,at+1)===-1,'Missing or duplicate '+name+' anchor');
  for(const[side,offset]of[['before',0],['after',call.length+(after.match(/^\s*/)?.[0].length||0)]]){
   const phase=name+'-'+side,absolute=start+at+offset,prefix=side==='before'?call:after.trimStart().split('\n')[0],fields=Object.entries(extra).map(([k,v])=>k+':'+v).join(','),probe='('+inputOrderProbe.toString()+')';
   const condition='(()=>{try{'+probe+'({action:"record",phase:'+JSON.stringify(phase)+',draft:model.snapshot()'+(fields?','+fields:'')+'});}catch{try{'+probe+'({action:"error"});}catch{}}return false;})()';
   sites.push({phase,...position(absolute),end:position(absolute+prefix.length),condition});
  }
 }
 return sites;
}
export async function installInputOrderTrace(session,{sourceURL,source,expectedHash,layout}={}){
 assert.equal(hash(source),expectedHash,'Expected source hash mismatch');const sites=inputOrderSites(source,layout),scripts=new Map(),breakpoints=[],cleanupErrors=[];let enabled=false,started=false,closed=false,pauses=0;
 const evaluate=async action=>{const response=await session.send('Runtime.evaluate',{expression:'('+inputOrderProbe.toString()+')('+JSON.stringify({action})+')',returnByValue:true});if(response.exceptionDetails)throw Error('Order probe evaluation failed');return response.result.value;};
 session.on('Debugger.scriptParsed',s=>{if(s.url===sourceURL)scripts.set(s.scriptId,s);});
 session.on('Debugger.paused',async()=>{pauses++;try{await session.send('Debugger.resume');}catch{cleanupErrors.push('RESUME_FAILED');}});
 async function read(){const value=await evaluate('read');return{...value,...(pauses||cleanupErrors.length?{status:'INVALID'}:{}),unexpectedPauses:pauses,cleanupErrors:[...cleanupErrors]};}
 async function stop(){if(closed)return;closed=true;for(const breakpointId of breakpoints)try{await session.send('Debugger.removeBreakpoint',{breakpointId});}catch{cleanupErrors.push('REMOVE_BREAKPOINT_FAILED');}let value;try{if(started)value=await evaluate('stop');}catch{cleanupErrors.push('STOP_PROBE_FAILED');}try{if(enabled)await session.send('Debugger.disable');}catch{cleanupErrors.push('DISABLE_DEBUGGER_FAILED');}if(cleanupErrors.length)throw Object.assign(Error('ORDER_CLEANUP_FAILED'),{cleanupErrors:[...cleanupErrors],probe:value});return{...value,unexpectedPauses:pauses};}
 try{
  enabled=true;await session.send('Debugger.enable');assert.equal(scripts.size,1,'Expected one exact inspector script');const scriptId=[...scripts.keys()][0],actual=await session.send('Debugger.getScriptSource',{scriptId});assert.equal(hash(actual.scriptSource),expectedHash,'Actual inspector source mismatch');
  const locations=[];for(const site of sites){const start={scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},end={scriptId,...site.end};const response=await session.send('Debugger.getPossibleBreakpoints',{start,end});const location=response.locations[0];assert(location&&location.scriptId===scriptId,'Missing executable order site');const inside=location.lineNumber===site.lineNumber&&location.columnNumber>=site.columnNumber&&(location.lineNumber<end.lineNumber||location.columnNumber<end.columnNumber);assert(inside,'Resolved order location outside intended statement');locations.push({scriptId:location.scriptId,lineNumber:location.lineNumber,columnNumber:location.columnNumber});}
  await evaluate('start');started=true;
  for(const [i,site]of sites.entries()){const response=await session.send('Debugger.setBreakpoint',{location:locations[i],condition:site.condition});assert(response.breakpointId);breakpoints.push(response.breakpointId);assert.deepEqual(response.actualLocation,locations[i],'Unexpected actual order breakpoint');}
  return{registration:{sourceURL,sourceHash:expectedHash,layout,scriptId,sites:sites.map((s,i)=>({phase:s.phase,location:locations[i]})),applicationTarget:false,conditionsAlwaysFalse:true},read,stop};
 }catch(e){try{await stop();}catch(cleanup){e.cleanupErrors=cleanup.cleanupErrors;}throw e;}
}
