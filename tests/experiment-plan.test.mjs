// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareExperimentPlan,parseExperimentPlan,validateExperimentPlan} from '../core/experiment-plan.mjs';

const id='12345678-1234-4123-8123-123456789012';
const target=()=>({tabId:1,origin:'http://127.0.0.1:4173',run:'run-1',document:'doc-1',node:'cdp:42',selector:'#confirm',property:'disabled',value:true,observedAt:100,build:null});
const response=(overrides={})=>({id:'response-1',kind:'json-response',revision:'response:request-1',type:'boolean',value:true,writable:true,locator:{url:'http://127.0.0.1:4173/api/account',method:'GET',requestId:'request-1',requestOrdinal:1,pointer:'/risk/hold'},...overrides});
const control=(control='text',value='Alex')=>({id:'control-1',kind:'dom-control',revision:0,type:typeof value,value,writable:true,locator:{document:'doc-1',node:'cdp:43',selector:'#form',control,...(control==='select'?{options:['Basic','Pro']}: {})}});
const make=(changes=[{resource:response(),value:false}],options={})=>prepareExperimentPlan({id,investigationId:'investigation-1',mode:'live',target:target(),changes,...options});
const current=plan=>({target:structuredClone(plan.target),resources:plan.changes.map(c=>structuredClone(c.resource)),admission:{available:true,grants:['read','inject','override','replay']}});
const rejects=(fn,code)=>assert.throws(fn,e=>e?.code===code);

test('prepared plans are inert bounded immutable data, without automatic refresh or causal verification',()=>{
 const changes=[{resource:response(),value:false}],before=JSON.stringify(changes),p=make(changes);
 assert.equal(p.schema,'stateatom.experiment-plan/1');assert.equal(p.mode,'live');assert.equal(p.target.build,null);assert.equal(p.refresh,'none');assert.equal(p.atomic,false);assert.equal(p.cleanup,'adapter-specific');assert.deepEqual(p.requiredGrants,['read','override']);
 assert.equal(JSON.stringify(changes),before);assert(Object.isFrozen(p.changes[0].resource.locator));assert(!JSON.stringify(p).includes('Experimentally verified'));
 changes[0].resource.value=false;assert.equal(p.changes[0].resource.value,true);assert.throws(()=>{p.changes[0].value=true;},TypeError);
});
test('JSON roundtrip preserves the exact typed plan',()=>{const p=make();assert.deepEqual(parseExperimentPlan(JSON.stringify(p)),p);assert.deepEqual(validateExperimentPlan(p,current(p)),p);});
test('native text, number, checkbox and select use explicit types and input-event grants',()=>{
 for(const [kind,old,value] of [['text','Alex','Sam'],['textarea','Alex','Sam'],['number',2,3],['checkbox',false,true],['select','Basic','Pro']]){const p=make([{resource:control(kind,old),value}]);assert.deepEqual(p.requiredGrants,['read','inject','replay']);assert.deepEqual(validateExperimentPlan(p,current(p)),p);}
});
test('mixed Draft groups derive grants and never claim a cross-adapter transaction',()=>{const p=make([{resource:response(),value:false},{resource:control(),value:'Sam'}],{mode:'draft'});assert.equal(p.mode,'draft');assert.deepEqual(p.requiredGrants,['read','inject','override','replay']);assert.equal(p.atomic,false);});
test('all selected occurrence identities, including time and unknown build, are preconditions',()=>{
 const p=make();for(const [key,value]of Object.entries({tabId:2,origin:'http://127.0.0.1:4174',run:'run-2',document:'doc-2',node:'cdp:99',selector:'#other',property:'text',value:false,observedAt:101,build:'a'.repeat(64)})){const c=current(p);c.target[key]=value;if(key==='property')c.target.value='other';rejects(()=>validateExperimentPlan(p,c),'STALE_TARGET');}
});
test('resource revision, value and exact network occurrence cannot be substituted',()=>{
 const p=make();for(const modify of [r=>r.revision='new',r=>r.value=false,r=>r.locator.requestId='request-2',r=>r.locator.requestOrdinal=2,r=>r.locator.pointer='/other',r=>r.locator.url+='?revision=2']){const c=current(p);modify(c.resources[0]);rejects(()=>validateExperimentPlan(p,c),'STALE_RESOURCE');}
});
test('missing or ambiguous fresh resources cannot select a similarly named replacement',()=>{
 const p=make(),c=current(p);c.resources=[];rejects(()=>validateExperimentPlan(p,c),'STALE_RESOURCE');c.resources=[response(),response()];rejects(()=>validateExperimentPlan(p,c),'INVALID_PLAN');
});
test('runtime admission is independent of plan metadata and checks every actual grant',()=>{
 const p=make();for(const admission of [{available:false,grants:['read','override']},{available:true,grants:['read']},{available:true,grants:['override']}])rejects(()=>validateExperimentPlan(p,{...current(p),admission}),'CAPABILITY_DENIED');
 const forged=structuredClone(p);forged.requiredGrants=[];rejects(()=>parseExperimentPlan(forged),'INVALID_PLAN');
});
test('duplicate change resource keys and empty/oversized groups are refused',()=>{
 rejects(()=>make([]),'INVALID_PLAN');rejects(()=>make([{resource:response(),value:false},{resource:response(),value:false}]),'INVALID_PLAN');
 rejects(()=>make(Array.from({length:33},(_,i)=>({resource:response({id:'r'+i}),value:false}))),'INVALID_PLAN');
});
test('all changes retain their declared scalar type and finite number domain',()=>{
 for(const value of [0,'false',null,{},[],undefined])rejects(()=>make([{resource:response(),value}]),'TYPE_MISMATCH');
 for(const value of [NaN,Infinity,-Infinity])rejects(()=>make([{resource:response({type:'number',value:1}),value}]),'TYPE_MISMATCH');
 assert.equal(make([{resource:response({type:'number',value:1}),value:0}]).changes[0].value,0);
});
test('UTF8 string and total plan budgets are enforced before any adapter runs',()=>{
 rejects(()=>make([{resource:response({type:'string',value:'old'}),value:'😀'.repeat(1025)}]),'INVALID_PLAN');
 const changes=Array.from({length:20},(_,i)=>({resource:response({id:'r'+i,type:'string',value:'a'.repeat(3000)}),value:'b'.repeat(3000)}));rejects(()=>make(changes),'INVALID_PLAN');
});
test('JSON pointers preserve escaped keys, reject unsafe names and do not accept dotted paths or root replacement',()=>{
 assert.equal(make([{resource:response({locator:{...response().locator,pointer:'/a~1b/~0x'}}),value:false}]).changes[0].resource.locator.pointer,'/a~1b/~0x');
 for(const pointer of ['', 'risk.hold','/x~2','/__proto__/x','/prototype','/constructor/x','/a/'.repeat(33)])rejects(()=>make([{resource:response({locator:{...response().locator,pointer}}),value:false}]),'INVALID_PLAN');
});
test('response edits require an exact same-origin observed GET occurrence',()=>{
 for(const locator of [{...response().locator,method:'POST'},{...response().locator,url:'http://127.0.0.1:4174/api/account'},{...response().locator,requestId:''},{...response().locator,requestOrdinal:0},{...response().locator,url:'http://user:secret@127.0.0.1:4173/api/account'}])rejects(()=>make([{resource:response({locator}),value:false}]),'INVALID_PLAN');
});
test('no writer is inferred for null, object/array, readonly resources or unsupported state kinds',()=>{
 for(const resource of [response({type:'null',value:null}),response({type:'object',value:{a:1}}),response({writable:false}),response({kind:'react-state'})])rejects(()=>make([{resource,value:false}]),'RESOURCE_UNSUPPORTED');
 const p=make(),c=current(p);c.resources[0].writable=false;rejects(()=>validateExperimentPlan(p,c),'RESOURCE_UNSUPPORTED');
});
test('native selector, document, node, control kind and option set are revision preconditions',()=>{
 const p=make([{resource:control('select','Basic'),value:'Pro'}]);for(const modify of [r=>r.locator.node='cdp:99',r=>r.locator.selector='#other',r=>r.locator.document='doc-2',r=>r.locator.options=['Basic','Pro','Other']]){const c=current(p);modify(c.resources[0]);rejects(()=>validateExperimentPlan(p,c),'STALE_RESOURCE');}
 rejects(()=>make([{resource:control('select','Basic'),value:'Other'}]),'TYPE_MISMATCH');
 const r=control('select','Basic');r.locator.options=['Basic','Basic'];rejects(()=>make([{resource:r,value:'Basic'}]),'RESOURCE_UNSUPPORTED');
});
test('new plan cannot bind a control from another document or mismatch its native value type',()=>{
 const r=control();r.locator.document='other';rejects(()=>make([{resource:r,value:'Sam'}]),'INVALID_PLAN');const n=control('number','2');rejects(()=>make([{resource:n,value:'3'}]),'RESOURCE_UNSUPPORTED');
});
test('unsafe tree keys, unknown fields and user supplied operation names are refused',()=>{
 const p=structuredClone(make());p.execute='eval';rejects(()=>parseExperimentPlan(p),'INVALID_PLAN');
 const raw=JSON.stringify(make()).replace('"mode":"live"','"__proto__":{},"mode":"live"');rejects(()=>parseExperimentPlan(raw),'INVALID_PLAN');
 const c=structuredClone(make());c.requiredGrants.push('reload');rejects(()=>parseExperimentPlan(c),'INVALID_PLAN');
});
test('validation never invokes an accessor to obtain a value, target or toJSON',()=>{
 let reads=0;for(const key of ['target','toJSON']){const input={id,investigationId:'investigation-1',mode:'live',target:target(),changes:[{resource:response(),value:false}]};Object.defineProperty(input,key,{enumerable:true,get(){reads++;throw Error('must not run');}});rejects(()=>prepareExperimentPlan(input),'INVALID_PLAN');}
 assert.equal(reads,0);
});
test('all members are preflighted before returning a group and neither input state nor snapshots are changed',()=>{
 const p=make([{resource:response(),value:false},{resource:control(),value:'Sam'}]),c=current(p);c.resources[1].revision=1;const before=JSON.stringify(c);rejects(()=>validateExperimentPlan(p,c),'STALE_RESOURCE');assert.equal(JSON.stringify(c),before);assert.equal(p.changes[0].resource.value,true);
});
test('mode, schema, target value and build formats are explicit rather than guessed',()=>{
 for(const mode of [undefined,'Live','apply'])rejects(()=>make(undefined,{mode}),'INVALID_PLAN');
 const p=structuredClone(make());p.schema='other';rejects(()=>parseExperimentPlan(p),'INVALID_PLAN');
 rejects(()=>make(undefined,{target:{...target(),value:'true'}}),'INVALID_PLAN');rejects(()=>make(undefined,{target:{...target(),build:'unknown'}}),'INVALID_PLAN');
});
test('preregistered catalogue keeps unsupported rows in its fixed denominator and is not implementation evidence',async()=>{
 const c=JSON.parse(await readFile(new URL('../docs/completion/u02-input-catalogue.json',import.meta.url),'utf8'));assert.equal(c.schema,'stateatom.input-catalogue/1');assert.equal(c.rows.length,18);assert.equal(new Set(c.rows.map(r=>r.id)).size,18);assert.equal(c.rows.filter(r=>r.liveTarget).length,11);assert.equal(c.rows.filter(r=>!r.liveTarget).length,7);assert(c.rows.filter(r=>!r.liveTarget).every(r=>r.reason));assert(c.rows.every(r=>!Object.hasOwn(r,'passed')));
});
test('an explicitly undefined optional plan id gets a new inert id without overriding it',()=>{
 const p=make(undefined,{id:undefined});assert.match(p.id,/^[a-f0-9-]{36}$/);assert.notEqual(p.id,id);
});
test('sparse groups are not silently converted to null edits by a JSON roundtrip',()=>{
 const changes=[{resource:response(),value:false},,{resource:control(),value:'Sam'}];rejects(()=>make(changes),'INVALID_PLAN');
});
test('different display ids cannot alias the same effective edit destination in a group',()=>{
 rejects(()=>make([{resource:response(),value:false},{resource:response({id:'alias'}),value:false}]),'INVALID_PLAN');
 const a=control(),b=control();b.id='alias';b.locator.selector='input#form';rejects(()=>make([{resource:a,value:'Sam'},{resource:b,value:'Sam'}]),'INVALID_PLAN');
});
test('fresh resources containing competing revisions for the same destination remain ambiguous',()=>{
 const p=make(),c=current(p);c.resources.push(response({id:'newer',revision:'newer'}));rejects(()=>validateExperimentPlan(p,c),'INVALID_PLAN');
});
test('negative zero cannot silently lose its identity in JSON transport',()=>{
 rejects(()=>make([{resource:response({type:'number',value:1}),value:-0}]),'TYPE_MISMATCH');rejects(()=>make([{resource:response({type:'number',value:-0}),value:1}]),'TYPE_MISMATCH');
});
