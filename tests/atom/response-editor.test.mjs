// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createResponseEditor} from '../../packages/atom/src/response-editor.mjs';
import {prepareExperimentPlan} from '../../core/experiment-plan.mjs';
const target=()=>({tabId:1,origin:'http://127.0.0.1:4173',run:'r1',document:'cdp:101',node:'cdp:103',selector:'#confirm',property:'disabled',value:true,observedAt:1,build:null});
const response=(ordinal=1,body={flag:true,note:'Привет'})=>({url:target().origin+'/api',method:'GET',requestId:'q'+ordinal,requestOrdinal:ordinal,document:'cdp:101',body:JSON.stringify(body)});
const paused=(ordinal=2,extra={})=>({requestId:'fetch'+ordinal,networkId:'q'+ordinal,frameId:'main',resourceType:'Fetch',request:{url:response().url,method:'GET'},responseStatusCode:200,responseHeaders:[{name:'Content-Type',value:'application/json; charset=utf-8'},{name:'Content-Length',value:'1'},{name:'ETag',value:'old'}],...extra});
const meta=ordinal=>({...response(ordinal),mainFrame:true,frameId:'main',type:'Fetch'});
function fixture(options={}){
 const calls=[],updates=[];let t=target(),allowed=true,owned=true;const editor=createResponseEditor({investigationId:'i1',target:target(),responses:[response()],readCurrent:async()=>({target:structuredClone(t),admission:{available:allowed,grants:allowed?['read','override']:[]}}),ownsFetch:()=>owned,send:async(method,params)=>{calls.push({method,params});if(options.send){const v=await options.send(method,params);if(v!==undefined)return v;}if(method==='Fetch.getResponseBody')return{body:btoa(String.fromCharCode(...new TextEncoder().encode(response().body))),base64Encoded:true};return{};},onChange:s=>updates.push(s)});
 const plan=(value=false)=>prepareExperimentPlan({investigationId:'i1',mode:'live',target:editor.snapshot().target,changes:[{resource:editor.snapshot().resources.find(r=>r.resource.locator.pointer==='/flag').resource,value}]});
 return {editor,calls,updates,plan,setTarget:v=>t={...t,...v},deny:()=>allowed=false,foreign:()=>owned=false};
}
const methods=f=>f.calls.map(c=>c.method);

test('opening and ordinary snapshots do not install Fetch, inject code or trigger any request',async()=>{const f=fixture();assert.equal(f.editor.snapshot().resources.length,2);assert.deepEqual(f.calls,[]);assert.equal(f.editor.snapshot().consumption,undefined);await f.editor.close('done');assert.deepEqual(f.calls,[]);});
test('apply installs guarded future response rule without reload/cache/storage/request work',async()=>{const f=fixture();try{const r=await f.editor.apply(f.plan());assert.equal(r.resources[0].rule.phase,'waiting');assert.deepEqual(methods(f),['Fetch.enable']);assert.equal(r.cleanup,'active');}finally{await f.editor.close('done');}assert.equal(methods(f).at(-1),'Fetch.disable');});
test('stale/denied/foreign target plans are refused before Fetch enable',async()=>{
 for(const change of ['deny','node','revision']){const f=fixture(),p=structuredClone(f.plan());if(change==='deny')f.deny();else if(change==='node')f.setTarget({node:'other'});else p.changes[0].resource.revision='old';await assert.rejects(f.editor.apply(p));assert.deepEqual(f.calls,[]);await f.editor.close('done');}
});
test('matching future response uses exact network occurrence, preserves UTF-8 and records acknowledgement only',async()=>{
 const f=fixture();try{await f.editor.apply(f.plan());assert.equal(await f.editor.handlePaused(paused(),meta(2)),true);const sent=f.calls.find(c=>c.method==='Fetch.fulfillRequest').params;const text=new TextDecoder().decode(Uint8Array.from(atob(sent.body),c=>c.charCodeAt(0)));assert.deepEqual(JSON.parse(text),{flag:false,note:'Привет'});assert(!sent.responseHeaders.some(h=>['etag','content-length'].includes(h.name.toLowerCase())));const r=f.editor.snapshot().resources.find(r=>r.resource.locator.pointer==='/flag');assert.equal(r.rule.phase,'delivered');assert.equal(r.consumption,'unknown');assert.equal(r.effect,'unknown');assert.equal(f.editor.handledNetwork('q2'),true);}finally{await f.editor.close('done');}
});
test('foreign frame/method/network binding/MIME/status never receive a changed response',async()=>{
 for(const [p,m]of [[paused(2,{frameId:'child'}),{...meta(2),mainFrame:false}],[paused(2,{request:{url:response().url,method:'POST'}}),meta(2)],[paused(2,{networkId:'unknown'}),meta(2)],[paused(2,{responseHeaders:[{name:'Content-Type',value:'text/html'}]}),meta(2)],[paused(2,{responseStatusCode:500}),meta(2)]]){const f=fixture();try{await f.editor.apply(f.plan());await f.editor.handlePaused(p,m);assert(!methods(f).includes('Fetch.fulfillRequest'));assert(!methods(f).includes('Fetch.getResponseBody'));assert(methods(f).includes('Fetch.continueRequest'));}finally{await f.editor.close('done');}}
});
test('permission loss after awaited body read cannot fulfill the response',async()=>{
 let f;f=fixture({send:async m=>{if(m==='Fetch.getResponseBody'){f.deny();return{body:response().body,base64Encoded:false};}}});await f.editor.apply(f.plan());await f.editor.handlePaused(paused(),meta(2));assert(!methods(f).includes('Fetch.fulfillRequest'));assert(methods(f).includes('Fetch.continueRequest'));assert.equal(f.editor.snapshot().closed,true);await f.editor.close('done');
});
test('cancel during delayed Fetch enable drains its late reply then disables the owned domain',async()=>{
 let release,entered;const started=new Promise(r=>entered=r),wait=new Promise(r=>release=r);const f=fixture({send:async m=>{if(m==='Fetch.enable'){entered();await wait;}}}),abort=new AbortController(),p=f.editor.apply(f.plan(),{signal:abort.signal});await started;abort.abort();const closing=f.editor.close('cancelled');release();await assert.rejects(p);await closing;assert.equal(f.editor.snapshot().closed,true);assert(!f.editor.snapshot().resources.some(r=>r.rule));assert.deepEqual(methods(f),['Fetch.enable','Fetch.disable']);
});
test('new authority refusal after Fetch enable cleans up before installing the plan',async()=>{
 let f;f=fixture({send:async m=>{if(m==='Fetch.enable')f.deny();}});await assert.rejects(f.editor.apply(f.plan()));assert(!f.editor.snapshot().resources.some(r=>r.rule));assert(methods(f).includes('Fetch.disable'));await f.editor.close('done');
});
test('Fetch send failure is explicit; current future rules are disarmed and cleanup runs',async()=>{
 const f=fixture({send:async m=>{if(m==='Fetch.fulfillRequest')throw Error('synthetic send failed');}});await f.editor.apply(f.plan());await f.editor.handlePaused(paused(),meta(2));const s=f.editor.snapshot();assert.equal(s.closed,true);assert(!s.resources.some(r=>r.rule));assert.equal(s.history[0].phase,'unconfirmed');assert.equal(s.history[0].outcomes[0].deliveries[0].delivered,null);assert(methods(f).includes('Fetch.continueRequest'));assert(methods(f).includes('Fetch.disable'));await f.editor.close('done');
});
test('close during in-flight fulfillment records late acknowledgement without reviving a rule',async()=>{
 let entered,release;const started=new Promise(r=>entered=r),wait=new Promise(r=>release=r);const f=fixture({send:async m=>{if(m==='Fetch.fulfillRequest'){entered();await wait;}}});await f.editor.apply(f.plan());const p=f.editor.handlePaused(paused(),meta(2));await started;const closing=f.editor.close('navigation');assert.equal(f.editor.snapshot().closed,true);release();await p;await closing;const s=f.editor.snapshot();assert.equal(s.history[0].outcomes[0].phase,'delivered-after-close');assert(!s.resources.some(r=>r.rule));assert.equal(methods(f).at(-1),'Fetch.disable');
});
test('cleanup never disables a foreign lease and reports the unverified native cleanup',async()=>{
 const f=fixture();await f.editor.apply(f.plan());f.foreign();await f.editor.close('lease lost');assert(!methods(f).includes('Fetch.disable'));assert.equal(f.editor.snapshot().cleanup,'authority-lost');assert(!f.editor.snapshot().resources.some(r=>r.rule));
});
test('read refreshes an observed selected value; old plans cannot use it as a current precondition',async()=>{
 const f=fixture(),old=f.plan();f.setTarget({value:false,observedAt:2});const s=await f.editor.read();assert.equal(s.target.value,false);assert.equal(s.observation.status,'Observed');assert.equal(s.observation.value,false);assert.equal(s.observation.dependency,'unknown');await assert.rejects(f.editor.apply(old),{code:'STALE_TARGET'});await f.editor.close('done');
});
test('undo and baseline share guarded admission, stay future-only and acknowledge an untouched later response',async()=>{
 const f=fixture();try{await f.editor.apply(f.plan());const revision=f.editor.snapshot().revision;await assert.rejects(f.editor.undoLast(revision-1),{code:'STALE_RESOURCE'});const s=await f.editor.restoreBaseline(revision);assert.equal(s.history.at(-1).kind,'baseline');assert.equal(s.history.at(-1).applicationRestored,false);await f.editor.handlePaused(paused(),meta(2));assert(!methods(f).includes('Fetch.fulfillRequest'));assert.equal(f.editor.snapshot().history.at(-1).phase,'delivered');}finally{await f.editor.close('done');}
});
test('an out-of-order older response never overwrites a newer acknowledged response',async()=>{
 const f=fixture();try{await f.editor.apply(f.plan());await f.editor.handlePaused(paused(3),meta(3));const before=methods(f).filter(m=>m==='Fetch.fulfillRequest').length;await f.editor.handlePaused(paused(2),meta(2));assert.equal(methods(f).filter(m=>m==='Fetch.fulfillRequest').length,before);assert.equal(f.editor.snapshot().closed,true);}finally{await f.editor.close('done');}
});
test('paused frame must match the independently observed network frame',async()=>{
 const f=fixture();try{await f.editor.apply(f.plan());await f.editor.handlePaused(paused(2,{frameId:'child'}),{...meta(2),frameId:'main'});assert(!methods(f).includes('Fetch.fulfillRequest'));assert(!methods(f).includes('Fetch.getResponseBody'));}finally{await f.editor.close('done');}
});
test('unchanged explicit reads do not emit another invalidation and create an inspector refresh loop',async()=>{
 const f=fixture();try{await f.editor.read();await f.editor.read();assert.equal(f.updates.length,0);f.setTarget({value:false,observedAt:2});await f.editor.read();const count=f.updates.length;await f.editor.read();assert.equal(f.updates.length,count);assert.equal(count,1);}finally{await f.editor.close('done');}
});
test('native Fetch pause XHR label is accepted only with the exact independent Network.Fetch occurrence',async()=>{
 const f=fixture();try{await f.editor.apply(f.plan());await f.editor.handlePaused(paused(2,{resourceType:'XHR'}),{...meta(2),type:'Fetch'});assert(methods(f).includes('Fetch.fulfillRequest'));}finally{await f.editor.close('done');}
 const xhr=fixture();try{await xhr.editor.apply(xhr.plan());await xhr.editor.handlePaused(paused(2,{resourceType:'XHR'}),{...meta(2),type:'XHR'});assert(!methods(xhr).includes('Fetch.getResponseBody'));assert(!methods(xhr).includes('Fetch.fulfillRequest'));}finally{await xhr.editor.close('done');}
});
test('a failed acknowledgement after attempting native fulfillment records unknown delivery',async()=>{const f=fixture({send:async m=>{if(m==='Fetch.fulfillRequest')throw Object.assign(Error('native reply lost'),{nativeMayHaveApplied:true});}});await f.editor.apply(f.plan());await f.editor.handlePaused(paused(),meta(2));const h=f.editor.snapshot().history[0];assert.equal(h.phase,'unconfirmed');assert.equal(h.outcomes[0].deliveries[0].delivered,null);assert.equal(f.editor.snapshot().closed,true);await f.editor.close('done');});
