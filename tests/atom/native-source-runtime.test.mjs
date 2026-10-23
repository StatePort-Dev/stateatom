// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {runSourceParseJob} from '../../core/source-parse-job.mjs';
import {createAtomRuntime} from '../../packages/atom/src/runtime.mjs';
import {createNativeSourceAnchor,createReactHostSourceAnchor} from '../../core/source-anchor.mjs';
import {sourceAnchorFixture,reactAnchorFixture} from '../helpers/source-anchor-fixture.mjs';
import {operationPolicy} from '../../packages/atom/src/capabilities.mjs';
import {validateRequest} from '../../packages/atom/src/transport.mjs';
import {storedZip} from '../helpers/source-map-zip.mjs';
import {createHash} from 'node:crypto';
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
 for(const bindingId of['react-host:0','react-host:1'])assert.equal(validateRequest(envelope({...p,bindingId})).payload.bindingId,bindingId);
 for(const patch of[{scriptId:'9'},{line:1},{column:0},{source:'private'},{anchor:{}},{bindingId:'action:0'},{bindingId:'native:12'},{bindingId:'react-host:2'},{snapshotId:''},{contextKey:''}])assert.throws(()=>validateRequest(envelope({...p,...patch})),{code:'INVALID_MESSAGE'});
});
async function fixture(t,{listeners,marker='occurrence:1',pause,react=false,frameworkProps,frameworkHost=109,frameworkPause,frameworkPosition=()=>({scriptId:'9',lineNumber:0,columnNumber:3}),scriptSources,withoutParser=false}={}){
 const calls=[],stored={},s={requests:[],pending:{},samples:[],sampleEntries:{},events:[],run:'run',attached:false};let notify;
 const area={get:async()=>({tabs:{7:s}}),set:async v=>Object.assign(stored,v)};
 const chrome={storage:{session:area,local:{get:async()=>({}),set:async()=>{}}},runtime:{sendMessage:async()=>{}},tabs:{get:async()=>({url:'https://app.invalid/'})},debugger:{attach:async()=>{},detach:async()=>{},sendCommand:async(_,method,p)=>{
  calls.push(method);if(method==='Page.getFrameTree')return{frameTree:{frame:{id:'frame-main'}}};
  if(method==='DOM.getDocument')return{root:{nodeId:1,backendNodeId:101}};
  if(method==='DOM.querySelector')return{nodeId:p.selector==='#target'?9:p.selector==='html'?2:3};
  if(method==='DOM.describeNode')return{node:{nodeId:9,backendNodeId:p.objectId==='host'?frameworkHost:109,nodeType:1,localName:'button',attributes:['data-stateatom',marker]}};
  if(method==='DOM.resolveNode')return{object:{type:'object',subtype:'node',objectId:'node-'+p.nodeId}};
  if(method==='Runtime.getProperties'){
   const d=(name,value)=>({name,isOwn:true,value}),o=objectId=>({type:'object',objectId});
   if(p.objectId==='node-9')return{result:[d('__reactFiber$abc',o('fiber')),d('__reactProps$abc',o('props'))]};
   if(p.objectId==='fiber')return{result:[d('tag',{type:'number',value:5}),d('type',{type:'string',value:'button'}),d('elementType',{type:'string',value:'button'}),d('stateNode',{...o('host'),subtype:'node'})]};
   if(p.objectId==='props'){await frameworkPause?.();return{result:frameworkProps?.()??[d('onClick',{type:'function',objectId:'handler'})]};}
   if(p.objectId==='handler')return{result:[],internalProperties:[{name:'[[FunctionLocation]]',value:{type:'object',value:frameworkPosition()}}]};
  }
  if(method==='DOMDebugger.getEventListeners'){if(p.objectId==='node-9'){await pause?.();return{listeners:listeners?.()??[{type:'click',scriptId:'9',lineNumber:0,columnNumber:3,backendNodeId:109}]};}return{listeners:[]};}
  if(method==='Debugger.getScriptSource')return{scriptSource:scriptSources?.[p.scriptId]??'function t(){return 1}'};
  return{};
 }},scripting:{executeScript:async()=>{throw Error('Application injection forbidden in source read');}}};
 const platform={chrome,async readScriptSource(id,scriptId,assertCurrent){assertCurrent();return chrome.debugger.sendCommand({tabId:id},'Debugger.getScriptSource',{scriptId});},ready:Promise.resolve(),fetch:()=>{throw Error('IDE/network forbidden');},events:{subscribe(fn){notify=fn;return()=>{};}},authorize:async(_,grant)=>{calls.push('grant:'+grant);},owns:()=>true,describeTarget:async()=>({url:'https://app.invalid/',permission:true,readOnlySites:true,grants:['read','inject'],lease:s.attached?'owned':'none'}),shutdown:async()=>{}};
 // Explicit in-process boundary model only; actual owned Worker is a separate gate.
 if(!withoutParser)platform.parseSourceArtifact=(operation,bytes)=>runSourceParseJob({operation,bytes});
 const runtime=createAtomRuntime(platform,{readOnlySites:true});t.after(()=>runtime.shutdown());await runtime.ready;
 const call=p=>runtime.request(envelope({tabId:7,...p}));await call({op:'attach',readOnly:true});
 const input=react?reactAnchorFixture():sourceAnchorFixture();Object.assign(s,{stale:null,analysisAt:Date.now(),inspectionGeneration:1,sourceGeneration:0,selection:{selector:'#target',property:'text',value:'Confirm',instance:'occurrence:1',observedAt:100,domIdentity:{document:'cdp:101',node:'cdp:109'}},analysis:{graph:{identity:input.context,nodes:[],edges:[]},actionContext:input.context,actionBindings:react?[{...sourceAnchorFixture().binding,capture:false,passive:false,once:false},input.binding]:[{...input.binding,capture:false,passive:false,once:false}]}});
 async function event(method,params){notify({type:'debugger',source:{tabId:7},method,params});await new Promise(r=>setTimeout(r,0));}
 await event('Runtime.executionContextCreated',{context:{id:3,uniqueId:'main-context',auxData:{frameId:'frame-main',isDefault:true}}});
 await event('Debugger.scriptParsed',{scriptId:'9',executionContextId:3,url:'https://app.invalid/app.js',hash:'a'.repeat(64),startLine:0,startColumn:0,endLine:0,endColumn:22,length:22});
 // The fixture supplies native context/registration only. It does not establish a real browser anchor.
 s.sourceGeneration=0;s.analysis.actionsInvalidated=false;
 if(!withoutParser)await call({op:'source-map-import',scriptId:'9',name:'app.map',data:btoa(JSON.stringify({version:3,sources:['private.ts'],names:[],mappings:'AAAA',sourcesContent:['const PRIVATE_SOURCE = 1;']}))});
 const view=await call({op:'state',refreshDeep:false}),anchor=(react?createReactHostSourceAnchor:createNativeSourceAnchor)({context:view.analysis.actionContext,binding:view.analysis.actionBindings.find(b=>b.id===input.binding.id),maps:view.sourceMaps});assert.equal(anchor.status,'Observed');
 const request={op:'source-map-anchor',bindingId:input.binding.id,snapshotId:anchor.acquisition.snapshotId,contextKey:JSON.stringify(anchor.identity)};calls.length=0;
 return{call,calls,s,request,stored,event};
}
test('runtime derives source coordinates from private native metadata and never calls the app or IDE',async t=>{
 const f=await fixture(t),r=await f.call(f.request);assert.equal(r.status,'Candidate');assert.match(r.excerpt,/PRIVATE_SOURCE/);assert.equal(r.execution,'not-observed');assert.equal(r.propertyProducer,'Unknown/Unsupported');
 assert(f.calls.includes('DOMDebugger.getEventListeners'));assert(!f.calls.some(x=>['Runtime.callFunctionOn','inject','grant:inject'].includes(x)));assert(!JSON.stringify(f.stored).includes('PRIVATE_SOURCE'));
 await assert.rejects(f.call(f.request),/snapshot|current|changed|Stale/i);
});
test('host source request derives private MAIN callback coordinates, preserving native metadata and renderer uncertainty',async t=>{const f=await fixture(t,{react:true}),native=JSON.stringify(f.s.analysis.actionBindings[0]),r=await f.call(f.request);assert.equal(r.status,'Candidate');assert.match(r.excerpt,/PRIVATE_SOURCE/);assert.equal(r.anchor.frameworkVersion,'not-attested');assert.match(r.link,/host callback/);assert(!/registered listener/.test(r.link));assert.equal(JSON.stringify(f.s.analysis.actionBindings.find(b=>b.id==='native:0')),native);assert(f.calls.includes('Runtime.getProperties'));assert(!f.calls.includes('DOMDebugger.getEventListeners'));assert(!f.calls.includes('Runtime.callFunctionOn'));assert(!JSON.stringify(f.stored).includes('PRIVATE_SOURCE'));const report=await f.call({op:'save-diagnostic'});assert(!JSON.stringify(report).includes('PRIVATE_SOURCE'));});
test('removed/replaced/getter/wrong-host and expired MAIN carrier refuse an old current host source view',async t=>{for(const options of[{frameworkProps:()=>[]},{frameworkProps:()=>[{name:'onClick',isOwn:true,get:{type:'function',objectId:'getter'}}]},{frameworkHost:999},{frameworkPosition:()=>({scriptId:'9',lineNumber:0,columnNumber:10})}]){const f=await fixture(t,{react:true,...options});await assert.rejects(f.call(f.request),/changed|current|anchor|callback|carrier/i);assert(!JSON.stringify(f.stored).includes('PRIVATE_SOURCE'));}const f=await fixture(t,{react:true});f.s.codeJournal.contexts={};await assert.rejects(f.call(f.request),/changed|current|anchor|callback|carrier/i);});
test('late own-host source read after inspection replacement cannot return old text',async t=>{let entered,release;const ready=new Promise(r=>entered=r),pending=new Promise(r=>release=r),f=await fixture(t,{react:true,frameworkPause:async()=>{entered();await pending;}});const reading=f.call(f.request);await ready;f.s.selection={...f.s.selection};release();await assert.rejects(reading,/Stale|current|changed/i);});
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
test('optional parser input admission is a boolean only; clients still cannot supply source data or options',()=>{const p={op:'source-map-anchor',tabId:7,bindingId:'native:0',snapshotId:'read',contextKey:'current'};for(const includeAnalysisInput of[true,false])assert.equal(validateRequest(envelope({...p,includeAnalysisInput})).payload.includeAnalysisInput,includeAnalysisInput);for(const includeAnalysisInput of['true',1,null,{}])assert.throws(()=>validateRequest(envelope({...p,includeAnalysisInput})),{code:'INVALID_MESSAGE'});});
test('opt-in runtime parser input uses only the private current map and never persists or exports bodies',async t=>{const f=await fixture(t,{react:true}),r=await f.call({...f.request,includeAnalysisInput:true});assert.equal(r.status,'Candidate');assert.match(r.analysisInput.serialized,/PRIVATE_SOURCE/);assert.equal(r.analysisInput.point.file,r.sourceKey);assert(!f.calls.includes('Runtime.callFunctionOn'));assert(!JSON.stringify(f.stored).includes('PRIVATE_SOURCE'));assert(!JSON.stringify(await f.call({op:'state',refreshDeep:false})).includes('PRIVATE_SOURCE'));assert(!JSON.stringify(await f.call({op:'save-diagnostic'})).includes('PRIVATE_SOURCE'));});
test('runtime lazily matches the second chunk only after private native or own-host metadata is revalidated',async t=>{
 const a='function t(){return 1}',b='function other(){return 2}',sha=x=>createHash('sha256').update(x).digest('hex'),map=text=>JSON.stringify({version:3,sources:['original.ts'],names:[],mappings:'AAAA',sourcesContent:[text]}),ma=map('FIRST_INCLUDED'),mb=map('SECOND_INCLUDED'),assets=[{asset:'a.js',sourceMap:'a.map',assetSha256:sha(a),sourceMapSha256:sha(ma)},{asset:'b.js',sourceMap:'b.map',assetSha256:sha(b),sourceMapSha256:sha(mb)}],zip=storedZip([['manifest.json',JSON.stringify({schemaVersion:1,releaseId:'synthetic',assets})],['a.js',a],['a.map',ma],['b.js',b],['b.map',mb]]);
 for(const react of[false,true]){
  const f=await fixture(t,{react,scriptSources:{9:a,10:b},listeners:()=>[{type:'click',scriptId:'10',lineNumber:0,columnNumber:3,backendNodeId:109}],frameworkPosition:()=>({scriptId:'10',lineNumber:0,columnNumber:3})});
  await f.event('Debugger.scriptParsed',{scriptId:'10',executionContextId:3,url:'https://app.invalid/same-name.js',hash:'c'.repeat(64),startLine:0,startColumn:0,endLine:0,endColumn:b.length,length:b.length});
  await f.call({op:'source-map-import',scriptId:'9',name:'r.zip',data:zip.toString('base64')});const binding=f.s.analysis.actionBindings.find(b=>b.id===(react?'react-host:0':'native:0'));if(react)binding.generated.scriptId='10';else binding.registration.scriptId='10';
  const view=await f.call({op:'state',refreshDeep:false}),current=(react?createReactHostSourceAnchor:createNativeSourceAnchor)({context:view.analysis.actionContext,binding:view.analysis.actionBindings.find(b=>b.id===binding.id),maps:view.sourceMaps});assert.equal(current.status,'Observed');assert.equal(current.artifact.status,'Unavailable');f.calls.length=0;
  const r=await f.call({op:'source-map-anchor',bindingId:binding.id,snapshotId:current.acquisition.snapshotId,contextKey:JSON.stringify(current.identity)});assert.equal(r.status,'Code-linked');assert.equal(r.excerpt,'SECOND_INCLUDED');assert.equal(r.anchor.generated.scriptId,'10');assert.equal(f.calls.filter(c=>c==='Debugger.getScriptSource').length,1);assert(f.calls.indexOf(react?'Runtime.getProperties':'DOMDebugger.getEventListeners')<f.calls.indexOf('Debugger.getScriptSource'));assert(!f.calls.includes('Runtime.callFunctionOn'));assert(!JSON.stringify(f.stored).includes('SECOND_INCLUDED'));assert(!JSON.stringify(await f.call({op:'save-diagnostic'})).includes('SECOND_INCLUDED'));
 }
});

test('runtime without a host parser refuses source import rather than parsing synchronously',async t=>{const f=await fixture(t,{withoutParser:true});await assert.rejects(f.call({op:'source-map-import',scriptId:'9',name:'app.map',data:btoa(JSON.stringify({version:3,sources:['private.ts'],names:[],mappings:'AAAA',sourcesContent:['PRIVATE_SOURCE']}))}),e=>e.code==='CAPABILITY_UNAVAILABLE');assert(!f.calls.includes('Debugger.getScriptSource'));assert(!JSON.stringify(f.stored).includes('PRIVATE_SOURCE'));});
test('source-parser absence leaves Clear/local state available but refuses source operations with an explicit gap',()=>{const c={url:'https://app.invalid/',readOnlySites:true,permission:true,grants:['read'],lease:'owned',attached:true,hasSelection:true,hasAnalysis:true,sourceParser:false};for(const op of['source-map-import','source-map-acquire','source-map-lookup','source-map-anchor'])assert.equal(operationPolicy(op,c).code,'CAPABILITY_UNAVAILABLE');assert.equal(operationPolicy('source-map-clear',c).available,true);assert.equal(operationPolicy('state',c).available,true);});
