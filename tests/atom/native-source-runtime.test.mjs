// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createAtomRuntime} from '../../packages/atom/src/runtime.mjs';
import {createNativeSourceAnchor} from '../../core/source-anchor.mjs';
import {sourceAnchorFixture} from '../helpers/source-anchor-fixture.mjs';
import {operationPolicy} from '../../packages/atom/src/capabilities.mjs';
import {validateRequest} from '../../packages/atom/src/transport.mjs';
const envelope=payload=>({version:1,id:crypto.randomUUID(),session:'source-read',payload});
test('native source read is read-only and needs a current selected observation, not an IDE or mutation grant',()=>{
 const c={url:'https://app.invalid/',permission:true,readOnlySites:true,readOnly:true,grants:['read'],lease:'owned',attached:true,hasSelection:true,hasAnalysis:true};
 assert.deepEqual(operationPolicy('source-map-anchor',c),{available:true,reason:null,code:null,requiredGrants:['read']});
 for(const patch of[{hasSelection:false},{hasAnalysis:false},{stale:true}])assert.equal(operationPolicy('source-map-anchor',{...c,...patch}).code,'OBSERVATION_REQUIRED');
 assert.equal(operationPolicy('source-map-anchor',{...c,attached:false}).code,'LEASE_REQUIRED');
});
test('native source request rejects client coordinates, source text and anchor objects',()=>{
 const p={op:'source-map-anchor',tabId:7,bindingId:'native:0',snapshotId:'read-1',contextKey:'current'};
 assert.equal(validateRequest(envelope(p)).payload,p);
 for(const patch of[{scriptId:'9'},{line:1},{column:0},{source:'private'},{anchor:{}},{bindingId:'action:0'},{bindingId:'native:12'},{snapshotId:''},{contextKey:''}])assert.throws(()=>validateRequest(envelope({...p,...patch})),{code:'INVALID_MESSAGE'});
});
async function fixture(t,{listeners,marker='occurrence:1',pause}={}){
 const calls=[],stored={},s={requests:[],pending:{},samples:[],sampleEntries:{},events:[],run:'run',attached:false};let notify;
 const area={get:async()=>({tabs:{7:s}}),set:async v=>Object.assign(stored,v)};
 const chrome={storage:{session:area,local:{get:async()=>({}),set:async()=>{}}},runtime:{sendMessage:async()=>{}},tabs:{get:async()=>({url:'https://app.invalid/'})},debugger:{attach:async()=>{},detach:async()=>{},sendCommand:async(_,method,p)=>{
  calls.push(method);if(method==='Page.getFrameTree')return{frameTree:{frame:{id:'frame-main'}}};
  if(method==='DOM.getDocument')return{root:{nodeId:1,backendNodeId:101}};
  if(method==='DOM.querySelector')return{nodeId:p.selector==='#target'?9:p.selector==='html'?2:3};
  if(method==='DOM.describeNode')return{node:{nodeId:9,backendNodeId:109,nodeType:1,attributes:['data-stateatom',marker]}};
  if(method==='DOM.resolveNode')return{object:{objectId:'node-'+p.nodeId}};
  if(method==='DOMDebugger.getEventListeners'){if(p.objectId==='node-9'){await pause?.();return{listeners:listeners?.()??[{type:'click',scriptId:'9',lineNumber:0,columnNumber:3,backendNodeId:109}]};}return{listeners:[]};}
  if(method==='Debugger.getScriptSource')return{scriptSource:'function t(){return 1}'};
  return{};
 }},scripting:{executeScript:async()=>{throw Error('Application injection forbidden in source read');}}};
 const platform={chrome,ready:Promise.resolve(),fetch:()=>{throw Error('IDE/network forbidden');},events:{subscribe(fn){notify=fn;return()=>{};}},authorize:async(_,grant)=>{calls.push('grant:'+grant);},owns:()=>true,describeTarget:async()=>({url:'https://app.invalid/',permission:true,readOnlySites:true,grants:['read','inject'],lease:s.attached?'owned':'none'}),shutdown:async()=>{}};
 const runtime=createAtomRuntime(platform,{readOnlySites:true});t.after(()=>runtime.shutdown());await runtime.ready;
 const call=p=>runtime.request(envelope({tabId:7,...p}));await call({op:'attach',readOnly:true});
 const input=sourceAnchorFixture();Object.assign(s,{stale:null,analysisAt:Date.now(),inspectionGeneration:1,sourceGeneration:0,selection:{selector:'#target',instance:'occurrence:1',observedAt:100,domIdentity:{document:'cdp:101',node:'cdp:109'}},analysis:{graph:{identity:input.context,nodes:[],edges:[]},actionContext:input.context,actionBindings:[{...input.binding,capture:false,passive:false,once:false}]}});
 async function event(method,params){notify({type:'debugger',source:{tabId:7},method,params});await new Promise(r=>setTimeout(r,0));}
 await event('Runtime.executionContextCreated',{context:{id:3,auxData:{frameId:'frame-main',isDefault:true}}});
 await event('Debugger.scriptParsed',{scriptId:'9',executionContextId:3,url:'https://app.invalid/app.js',hash:'a'.repeat(64),startLine:0,startColumn:0,endLine:0,endColumn:22,length:22});
 // The fixture supplies native context/registration only. It does not establish a real browser anchor.
 s.sourceGeneration=0;s.analysis.actionsInvalidated=false;
 await call({op:'source-map-import',scriptId:'9',name:'app.map',data:btoa(JSON.stringify({version:3,sources:['private.ts'],names:[],mappings:'AAAA',sourcesContent:['const PRIVATE_SOURCE = 1;']}))});
 const view=await call({op:'state',refreshDeep:false}),anchor=createNativeSourceAnchor({context:view.analysis.actionContext,binding:view.analysis.actionBindings[0],maps:view.sourceMaps});assert.equal(anchor.status,'Observed');
 const request={op:'source-map-anchor',bindingId:'native:0',snapshotId:anchor.acquisition.snapshotId,contextKey:JSON.stringify(anchor.identity)};calls.length=0;
 return{call,calls,s,request,stored};
}
test('runtime derives source coordinates from private native metadata and never calls the app or IDE',async t=>{
 const f=await fixture(t),r=await f.call(f.request);assert.equal(r.status,'Candidate');assert.match(r.excerpt,/PRIVATE_SOURCE/);assert.equal(r.execution,'not-observed');assert.equal(r.propertyProducer,'Unknown/Unsupported');
 assert(f.calls.includes('DOMDebugger.getEventListeners'));assert(!f.calls.some(x=>['Runtime.callFunctionOn','inject','grant:inject'].includes(x)));assert(!JSON.stringify(f.stored).includes('PRIVATE_SOURCE'));
 await assert.rejects(f.call(f.request),/snapshot|current|changed|Stale/i);
});
test('input-edited investigation cannot read an old native source snapshot through direct admission',async t=>{const f=await fixture(t);f.s.inputEditedInspection=f.s.inspectionGeneration;await assert.rejects(f.call(f.request),/Stale|current|inspect/i);assert(!f.calls.includes('DOMDebugger.getEventListeners'));});
test('removed, replaced, ambiguous or foreign-target listener cannot reuse native index for source',async t=>{
 for(const listeners of[()=>[],()=>[{type:'click',scriptId:'9',lineNumber:0,columnNumber:7,backendNodeId:109}],()=>Array(2).fill({type:'click',scriptId:'9',lineNumber:0,columnNumber:3,backendNodeId:109}),()=>[{type:'click',scriptId:'9',lineNumber:0,columnNumber:3,backendNodeId:999}]]){
  const f=await fixture(t,{listeners});await assert.rejects(f.call(f.request),/listener|registration|anchor|current|changed|Stale/i);assert(!JSON.stringify(f.stored).includes('PRIVATE_SOURCE'));
 }
});
test('changed DOM occurrence stales inspection and a late selection change returns no source text',async t=>{
 const f=await fixture(t,{marker:'other'});await assert.rejects(f.call(f.request),/Stale|changed|occurrence/i);assert(f.s.stale);assert.equal(f.s.analysis,null);
 let entered,release;const begun=new Promise(r=>entered=r),pending=new Promise(r=>release=r),g=await fixture(t,{pause:async()=>{entered();await pending;}});
 const reading=g.call(g.request);await begun;g.s.selection={...g.s.selection};release();await assert.rejects(reading,/Stale|current|changed/i);
});
