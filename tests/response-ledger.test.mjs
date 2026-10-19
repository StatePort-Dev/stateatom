// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createResponseLedger} from '../core/response-ledger.mjs';
import {prepareExperimentPlan} from '../core/experiment-plan.mjs';

const target=()=>({tabId:1,origin:'http://127.0.0.1:4173',run:'r1',document:'d1',node:'cdp:2',selector:'#confirm',property:'disabled',value:true,observedAt:1,build:null});
const admission={available:true,grants:['read','override']};
const url=target().origin+'/api/account';
const facts=(body={risk:{hold:true},quota:2,note:'old'},ordinal=1,extra={})=>({url,method:'GET',requestId:'q'+ordinal,requestOrdinal:ordinal,document:'d1',body:JSON.stringify(body),...extra});
const fresh=(extra={})=>({target:target(),admission,...extra});
const create=()=>{const l=createResponseLedger({investigationId:'i1',target:target()});l.observeResponse(facts());return l;};
const row=(l,pointer='/risk/hold')=>l.snapshot().resources.find(r=>r.resource.locator.pointer===pointer);
const plan=(l,values={'/risk/hold':false},mode='live')=>prepareExperimentPlan({investigationId:'i1',mode,target:target(),changes:Object.entries(values).map(([pointer,value])=>({resource:row(l,pointer).resource,value}))});
const guard=l=>fresh({expectedRevision:l.snapshot().revision});
const rejects=(fn,code)=>assert.throws(fn,e=>e?.code===code);

test('observations retain exact server occurrence and detached writable scalar descriptors only',()=>{
 const l=create();const s=l.snapshot();assert.equal(s.resources.length,3);const r=row(l);assert.equal(r.resource.value,true);assert.equal(r.serverValue,true);assert.equal(r.rule,null);assert.equal(r.resource.locator.requestId,'q1');assert.equal(r.consumption,'unknown');assert.equal(r.effect,'unknown');s.resources[0].resource.value='forged';assert.equal(row(l).resource.value,true);
});
test('Live and Draft install future rules without fetching, reloading or claiming app effects',()=>{
 for(const mode of ['live','draft']){const l=create(),p=plan(l,undefined,mode),before=p.changes[0].resource;const result=l.apply(p,fresh());assert.equal(result.phase,'waiting');assert.equal(row(l).resource.value,false);assert.equal(row(l).serverValue,true);assert.equal(row(l).rule.phase,'waiting');assert.notEqual(row(l).resource.revision,before.revision);assert.equal(l.snapshot().history[0].mode,mode);assert.equal(l.snapshot().history[0].consumption,'unknown');assert(!JSON.stringify(l.snapshot()).includes('Experimentally verified'));}
});
test('all plan members and independent admission are validated before any rule installs',()=>{
 const l=create(),p=plan(l,{'/risk/hold':false,'/quota':3}),bad=structuredClone(p);bad.changes[1].resource.revision='old';const before=l.snapshot();rejects(()=>l.apply(bad,fresh()),'STALE_RESOURCE');assert.deepEqual(l.snapshot(),before);rejects(()=>l.apply(p,fresh({admission:{available:false,grants:[]}})),'CAPABILITY_DENIED');assert.deepEqual(l.snapshot(),before);
});
test('investigation and physical target binding prevent cross-document/node retargeting',()=>{
 const l=create();let p=plan(l);p=prepareExperimentPlan({...{investigationId:'other',mode:p.mode,target:p.target,changes:p.changes}});rejects(()=>l.apply(p,fresh()),'STALE_INVESTIGATION');
 for(const field of ['document','node','run','selector','build']){const t={...target(),[field]:field==='build'?'a'.repeat(64):'other'};const q=prepareExperimentPlan({investigationId:'i1',mode:'live',target:t,changes:plan(l).changes});rejects(()=>l.apply(q,fresh({target:t})),'STALE_TARGET');}
});
test('target value/time can be freshly re-observed without changing the physical selected occurrence',()=>{
 const l=create(),t={...target(),value:false,observedAt:2};const p=prepareExperimentPlan({investigationId:'i1',mode:'live',target:t,changes:plan(l).changes});assert.equal(l.apply(p,fresh({target:t})).phase,'waiting');
});
test('same-response group patches only guarded escaped leaves and awaits adapter acknowledgement',()=>{
 const l=createResponseLedger({investigationId:'i1',target:target()}),f=facts({'a/b':{'~x':true},quota:2});l.observeResponse(f);l.apply(plan(l,{'/a~1b/~0x':false,'/quota':3},'draft'),fresh());const r=l.prepareResponse({...f,requestId:'q2',requestOrdinal:2});assert.equal(r.modified,true);assert.deepEqual(JSON.parse(r.body),{'a/b':{'~x':false},quota:3});assert.equal(row(l,'/quota').rule.phase,'prepared');assert.equal(l.snapshot().history[0].phase,'prepared');l.confirmResponse(r.receipt,{delivered:true});assert.equal(row(l,'/quota').rule.phase,'delivered');assert.equal(row(l,'/quota').consumption,'unknown');assert.equal(l.snapshot().history[0].phase,'delivered');
});
test('wrong origin/document/method and duplicate or older request ordinals cannot consume rules',()=>{
 const l=create();l.apply(plan(l),fresh());for(const change of [{url:'http://127.0.0.1:4174/api/account'},{document:'d2'},{method:'POST'},{requestOrdinal:1},{requestOrdinal:0}]){const before=l.snapshot();rejects(()=>l.prepareResponse(facts(undefined,2,change)),'RESPONSE_MISMATCH');assert.deepEqual(l.snapshot(),before);}
});
test('external server scalar change disarms the whole response group before any patch',()=>{
 const l=create();l.apply(plan(l,{'/risk/hold':false,'/quota':3},'draft'),fresh());const r=l.prepareResponse(facts({risk:{hold:true},quota:99,note:'old'},2));assert.equal(r.modified,false);assert.equal(r.receipt,null);assert.equal(r.reason,'EXTERNAL_REVISION');assert.equal(JSON.parse(r.body).risk.hold,true);assert.equal(row(l).rule,null);assert.equal(row(l,'/quota').resource.value,99);assert.equal(l.snapshot().history[0].phase,'failed');rejects(()=>l.restoreBaseline(guard(l)),'EXTERNAL_REVISION');
});
test('missing or structurally changed guarded leaf is external revision, never a new writable object',()=>{
 for(const body of [{risk:{},quota:2,note:'old'},{risk:{hold:{nested:true}},quota:2,note:'old'}]){const l=create();l.apply(plan(l),fresh());const r=l.prepareResponse(facts(body,2));assert.equal(r.modified,false);assert.equal(r.reason,'EXTERNAL_REVISION');assert.equal(row(l),undefined);rejects(()=>l.undoLast(guard(l)),'EXTERNAL_REVISION');}
});
test('delivery failure is explicit and disarms failed rules without fabricating consumption',()=>{
 const l=create();l.apply(plan(l),fresh());const r=l.prepareResponse(facts(undefined,2));l.confirmResponse(r.receipt,{delivered:false,error:'CDP failure'});assert.equal(row(l).rule,null);assert.equal(row(l).resource.value,true);assert.equal(l.snapshot().history[0].phase,'failed');assert.equal(l.snapshot().history[0].outcomes[0].phase,'failed');assert.equal(row(l).consumption,'unknown');
});
test('cross-response Draft group reports partial delivery rather than atomic success',()=>{
 const l=create(),other=url+'?other';l.observeResponse(facts({flag:true},1,{url:other,requestId:'other1'}));const a=row(l).resource,b=l.snapshot().resources.find(r=>r.resource.locator.url===other).resource;l.apply(prepareExperimentPlan({investigationId:'i1',mode:'draft',target:target(),changes:[{resource:a,value:false},{resource:b,value:false}]}),fresh());const x=l.prepareResponse(facts(undefined,2));l.confirmResponse(x.receipt,{delivered:true});assert.equal(l.snapshot().history[0].phase,'partial');const y=l.prepareResponse(facts({flag:true},2,{url:other,requestId:'other2'}));l.confirmResponse(y.receipt,{delivered:false,error:'failed'});assert.equal(l.snapshot().history[0].phase,'partial-failure');assert.equal(row(l).rule.phase,'delivered');assert.equal(l.snapshot().history[0].atomic,false);
});
test('undo-last restores prior owned rule, baseline removes rules, neither changes consumed application copies',()=>{
 const l=create();l.apply(plan(l,{'/quota':3}),fresh());let r=l.prepareResponse(facts(undefined,2));l.confirmResponse(r.receipt,{delivered:true});l.apply(plan(l,{'/quota':4}),fresh());assert.equal(row(l,'/quota').rule.value,4);const undo=l.undoLast(guard(l));assert.equal(undo.phase,'waiting');assert.equal(row(l,'/quota').rule.value,3);assert.equal(row(l,'/quota').effect,'unknown');const baseline=l.restoreBaseline(guard(l));assert.equal(baseline.phase,'waiting');assert.equal(row(l,'/quota').rule,null);assert.equal(row(l,'/quota').resource.value,2);assert.equal(baseline.applicationRestored,false);assert.equal(l.snapshot().history.at(-1).kind,'baseline');
});
test('undo guards stale ledger, independent permission and physical target',()=>{
 const l=create();l.apply(plan(l),fresh());const before=l.snapshot();rejects(()=>l.undoLast(fresh({expectedRevision:before.revision-1})),'STALE_RESOURCE');rejects(()=>l.undoLast({...guard(l),admission:{available:false,grants:[]}}),'CAPABILITY_DENIED');rejects(()=>l.undoLast({...guard(l),target:{...target(),node:'other'}}),'STALE_TARGET');assert.deepEqual(l.snapshot(),before);
});
test('pending delivery prevents concurrent apply/undo, while close disarms and retains late actual acknowledgement',()=>{
 const l=create();l.apply(plan(l),fresh());const r=l.prepareResponse(facts(undefined,2));rejects(()=>l.apply(plan(l,{'/quota':3}),fresh()),'EDITOR_BUSY');rejects(()=>l.undoLast(guard(l)),'EDITOR_BUSY');l.close('navigation');assert.equal(row(l).rule,null);assert.equal(l.snapshot().closed,true);assert.equal(l.snapshot().pending.length,1);l.confirmResponse(r.receipt,{delivered:true});assert.equal(l.snapshot().pending.length,0);assert.equal(l.snapshot().history[0].outcomes[0].phase,'delivered-after-close');assert.equal(row(l).rule,null);rejects(()=>l.apply(plan(l),fresh()),'EDITOR_CLOSED');
});
test('receipts are unique single-use, unknown receipts cannot mutate the ledger',()=>{
 const l=create();l.apply(plan(l),fresh());const r=l.prepareResponse(facts(undefined,2)),before=l.snapshot();rejects(()=>l.confirmResponse('forged',{delivered:true}),'STALE_RECEIPT');assert.deepEqual(l.snapshot(),before);l.confirmResponse(r.receipt,{delivered:true});rejects(()=>l.confirmResponse(r.receipt,{delivered:true}),'STALE_RECEIPT');
});
test('JSON intake rejects unsafe keys, oversize bodies/depth and non-JSON without side effects',()=>{
 const l=create(),before=l.snapshot();for(const body of ['{"__proto__":{"x":true}}','{"constructor":1}','{bad','"'+ 'x'.repeat(262144)+'"','{"x":'.repeat(14)+'1'+'}'.repeat(14)]){rejects(()=>l.observeResponse({...facts(undefined,2),body}),'RESPONSE_UNSUPPORTED');assert.deepEqual(l.snapshot(),before);}
});
test('null, structural values, negative zero and oversized strings remain unsupported leaves',()=>{
 const l=createResponseLedger({investigationId:'i1',target:target()});l.observeResponse({...facts(),body:'{"nil":null,"n":-0,"large":"'+ 'x'.repeat(4097)+'","ok":true}'});assert.deepEqual(l.snapshot().resources.map(r=>r.resource.locator.pointer),['/ok']);
});
test('resource/history budgets reject before dropping prior evidence or installing a partial group',()=>{
 const l=createResponseLedger({investigationId:'i1',target:target()});const many=Object.fromEntries(Array.from({length:129},(_,i)=>['k'+i,i]));rejects(()=>l.observeResponse(facts(many)),'RESOURCE_LIMIT');assert.equal(l.snapshot().resources.length,0);const q=create();for(let i=0;i<64;i++)q.apply(plan(q,{'/quota':i+3}),fresh());const before=q.snapshot();rejects(()=>q.apply(plan(q,{'/quota':100}),fresh()),'HISTORY_LIMIT');assert.deepEqual(q.snapshot(),before);
});
test('no-op and duplicate plan replay cannot create misleading new history',()=>{
 const l=create(),p=plan(l);l.apply(p,fresh());rejects(()=>l.apply(p,fresh()),'PLAN_REPLAY');const before=l.snapshot();rejects(()=>l.apply(plan(l,{'/risk/hold':false}),fresh()),'NO_CHANGE');assert.deepEqual(l.snapshot(),before);
});
test('undo delivery belongs to the restoration operation, not the historical apply',()=>{
 const l=create();l.apply(plan(l,{'/quota':3}),fresh());l.apply(plan(l,{'/quota':4}),fresh());const u=l.undoLast(guard(l));const r=l.prepareResponse(facts(undefined,2));l.confirmResponse(r.receipt,{delivered:true});const history=l.snapshot().history;assert.equal(history.find(t=>t.id===u.id).phase,'delivered');assert.equal(row(l,'/quota').rule.value,3);l.undoLast(guard(l));
});
test('baseline removal tracks a later untouched response without claiming an application rollback',()=>{
 const l=create();l.apply(plan(l),fresh());const a=l.prepareResponse(facts(undefined,2));l.confirmResponse(a.receipt,{delivered:true});const b=l.restoreBaseline(guard(l));const r=l.prepareResponse(facts(undefined,3));assert.equal(r.modified,false);assert(r.receipt);l.confirmResponse(r.receipt,{delivered:true});const restored=l.snapshot().history.find(t=>t.id===b.id);assert.equal(restored.phase,'delivered');assert.equal(restored.applicationRestored,false);assert.equal(restored.consumption,'unknown');
});
test('body growth beyond the response budget refuses preparation before changing any metadata',()=>{
 const l=createResponseLedger({investigationId:'i1',target:target()});const body={value:'x',ignored:'a'.repeat(260000)};l.observeResponse(facts(body));l.apply(plan(l,{'/value':'b'.repeat(4096)}),fresh());const before=l.snapshot();rejects(()=>l.prepareResponse(facts(body,2)),'RESPONSE_UNSUPPORTED');assert.deepEqual(l.snapshot(),before);
});
test('JSON bodies cannot hide unsafe escaped keys under arrays',()=>{
 const l=create(),before=l.snapshot();rejects(()=>l.observeResponse({...facts(undefined,2),body:'{"safe":[{"constr\\u0075ctor":true}]}'}),'RESPONSE_UNSUPPORTED');assert.deepEqual(l.snapshot(),before);
});
test('repeated deliveries retain exact occurrence acknowledgements including a later failure',()=>{
 const l=create();l.apply(plan(l),fresh());for(let i=2;i<=3;i++){const r=l.prepareResponse(facts(undefined,i));l.confirmResponse(r.receipt,{delivered:i===2,...(i===3?{error:'failure after success'}:{})});}const h=l.snapshot().history[0];assert.equal(h.phase,'partial-failure');assert.deepEqual(h.outcomes[0].deliveries.map(d=>[d.requestId,d.requestOrdinal,d.delivered]),[['q2',2,true],['q3',3,false]]);
});
test('restore baseline refuses an external update even when its value later returns to the original',()=>{
 const l=create();l.apply(plan(l),fresh());l.prepareResponse(facts({risk:{hold:'external'},quota:2,note:'old'},2));l.observeResponse(facts(undefined,3));rejects(()=>l.restoreBaseline(guard(l)),'EXTERNAL_REVISION');
});
test('ledger target validation refuses accessors without invoking them',()=>{
 let reads=0;const t=target();Object.defineProperty(t,'origin',{enumerable:true,get(){reads++;return 'http://127.0.0.1:4173';}});assert.throws(()=>createResponseLedger({investigationId:'i1',target:t}));assert.equal(reads,0);
});
test('empty responses cannot create an unbounded URL ordinal registry',()=>{
 const l=createResponseLedger({investigationId:'i1',target:target()});for(let i=0;i<128;i++)l.observeResponse(facts({},1,{url:url+'?'+i}));const before=l.snapshot();rejects(()=>l.observeResponse(facts({},1,{url:url+'?overflow'})),'RESOURCE_LIMIT');assert.deepEqual(l.snapshot(),before);
});
test('delivery evidence has a hard bound rather than silently dropping earlier acknowledgements',()=>{
 const l=create();l.apply(plan(l),fresh());for(let i=2;i<=129;i++){const r=l.prepareResponse(facts(undefined,i));l.confirmResponse(r.receipt,{delivered:true});}const before=l.snapshot();rejects(()=>l.prepareResponse(facts(undefined,130)),'DELIVERY_LIMIT');assert.deepEqual(l.snapshot(),before);assert.equal(before.history[0].outcomes[0].deliveries.length,128);
});
test('close rejects an object reason without evaluating user conversion hooks',()=>{
 const l=create();let conversions=0;const before=l.snapshot();rejects(()=>l.close({toString(){conversions++;return 'closed';}}),'INVALID_REASON');assert.equal(conversions,0);assert.deepEqual(l.snapshot(),before);
});
