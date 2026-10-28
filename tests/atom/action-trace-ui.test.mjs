// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {createActionTraceUI}from'../../packages/atom/src/action-trace-ui.mjs';
const state=id=>({run:'r',selection:{domIdentity:{node:'n'+id}},analysis:{actionContext:{}},connection:{source:{url:'http://127.0.0.1:1'}},capabilityPolicy:{operations:{'actions-arm':{available:true}}}});
const records=[{kind:'body-entry',activationId:'a',source:{symbol:'save',file:'src/a.js',line:1}},{kind:'body-leave',activationId:'a',completion:'return'}];
function fixture(request){const elements=new Map(),node=()=>({textContent:'',children:[],append(v){this.children.push(v);},replaceChildren(){this.children=[];}}),$=id=>{if(!elements.has(id))elements.set(id,node());return elements.get(id);};let id=1;const view=createActionTraceUI({document:{createElement:node},$,rpc:request,cleanupRpc:request,tab:()=>id,action:fn=>fn()});view.render(state(1));return{$,view,change(){id=2;view.render(state(2));}};}
test('Cancel retains an action acknowledged before the next UI poll',async()=>{const f=fixture(async m=>m.op==='actions-arm'?{status:'armed',traceId:'trace',records:[]}:{status:'cancelled',traceId:'trace',records});await f.$('action-observe').onclick();await f.$('action-observe-cancel').onclick();assert.match(f.$('action-observe-status').textContent,/cancelled/);assert.match(f.$('action-observe-records').children[0].textContent,/save.*returned/);await f.view.dispose();});
test('late source verification cannot open a previous observation in a new tab',async()=>{let respond,entered;const pending=new Promise(r=>respond=r),ready=new Promise(r=>entered=r),calls=[];const f=fixture(async m=>{calls.push(m);if(m.op==='actions-arm')return{status:'complete',traceId:'trace',records,sourceCurrent:true};if(m.op==='actions-read'){entered();return pending;}return{status:'cancelled',traceId:'trace',records};});await f.$('action-observe').onclick();const button=f.$('action-observe-records').children[0].children[0],opening=button.onclick();await ready;f.change();respond({sourceCurrent:true});await assert.rejects(opening,/changed/);assert(!calls.some(m=>m.op==='open'));await f.view.dispose();});

test('context change retains previous body records explicitly stale without source navigation',async()=>{const f=fixture(async m=>({status:m.op==='actions-arm'?'complete':'cancelled',traceId:'trace',records,sourceCurrent:true}));await f.$('action-observe').onclick();f.change();assert.match(f.$('action-observe-status').textContent,/stale/);assert.match(f.$('action-observe-records').children[0].textContent,/save/);assert.equal(f.$('action-observe-records').children[0].children.length,0);await f.view.dispose();});

for(const code of ['STALE_TARGET','BUSY'])test('Clear removes only this view’s stale rows when the runtime reports '+code,async()=>{
 const f=fixture(async m=>{if(m.op==='actions-clear')throw Object.assign(Error('Another context owns the current trace'),{code});return{status:m.op==='actions-arm'?'complete':'cancelled',traceId:'trace',records,sourceCurrent:true};});
 await f.$('action-observe').onclick();f.change();await f.$('action-observe-clear').onclick();
 assert.match(f.$('action-observe-status').textContent,/cleared.*this view/);assert.equal(f.$('action-observe-records').children.length,0);await f.view.dispose();
});

for(const status of ['stale','stopped'])test(`helper ${status} is visibly historical with no source navigation`,async()=>{
 const f=fixture(async()=>({status,traceId:'trace',records,sourceCurrent:true,freshness:'Stale'}));await f.$('action-observe').onclick();
 assert.match(f.$('action-observe-status').textContent,/stale/);assert.equal(f.$('action-observe-records').children[0].children.length,0);await f.view.dispose();
});

test('same-context root retirement updates a completed local card and rejects an older source button',async()=>{
 const calls=[],f=fixture(async m=>{calls.push(m);return{status:'complete',traceId:'trace',records,sourceCurrent:true};});await f.$('action-observe').onclick();
 const button=f.$('action-observe-records').children[0].children[0];
 f.view.render({...state(1),actionTrace:{traceId:'other',status:'stale',freshness:'Stale',sourceCurrent:false}});
 assert.match(f.$('action-observe-status').textContent,/Recorded/,'foreign trace must not replace this card');
 f.view.render({...state(1),actionTrace:{traceId:'trace',status:'stale',freshness:'Stale',sourceCurrent:false}});
 assert.match(f.$('action-observe-status').textContent,/stale/);assert.equal(f.$('action-observe-records').children[0].children.length,0);
 await assert.rejects(button.onclick(),/changed/);assert(!calls.some(m=>m.op==='open'));await f.view.dispose();
});

test('a timeout after recorded body entry retains known interaction and an explicit missing exit',async()=>{
 const f=fixture(async()=>({status:'expired',traceId:'trace',records:[{kind:'dispatch'},records[0]],reason:'Observation time budget ended',sourceCurrent:true}));await f.$('action-observe').onclick();
 assert.match(f.$('action-observe-status').textContent,/Click recorded.*timed out/);assert.doesNotMatch(f.$('action-observe-status').textContent,/No supported interaction/);assert.match(f.$('action-observe-records').children[0].textContent,/save.*exit unavailable/);await f.view.dispose();
});
test('timeout without a dispatch retains the explicit empty interaction wording',async()=>{
 const f=fixture(async()=>({status:'expired',traceId:'trace',records:[],sourceCurrent:false}));await f.$('action-observe').onclick();assert.match(f.$('action-observe-status').textContent,/No supported interaction recorded before timeout/);assert.equal(f.$('action-observe-records').children.length,0);await f.view.dispose();
});
test('unavailable observation hides idle controls but keeps previously recorded history visible',async()=>{const f=fixture(async()=>({status:'complete',traceId:'trace',records,sourceCurrent:true}));try{assert.equal(f.$('action-observation-details').hidden,false);assert.equal(f.$('action-observe-cancel').hidden,true);f.view.render({});assert.equal(f.$('action-observation-details').hidden,true);f.view.render(state(1));await f.$('action-observe').onclick();f.view.render({});assert.equal(f.$('action-observation-details').hidden,false);assert.equal(f.$('action-observe-clear').hidden,false);assert.match(f.$('action-observation-title').textContent,/stale/);assert.match(f.$('action-observe-records').children[0].textContent,/save/);}finally{await f.view.dispose();}});
