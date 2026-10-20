// SPDX-License-Identifier: Apache-2.0
// Full runtime/platform/storage harness; native package evidence is separate.
import test from 'node:test';import assert from 'node:assert/strict';
import {createAtomRuntime} from '../../packages/atom/src/runtime.mjs';
import {createChromePlatform,createDebuggerBroker,createEventHub} from '../../packages/atom/src/platform.mjs';
import {validateRequest,operationPolicy,createAtomDispatcher} from '../../packages/atom/src/transport.mjs';
import {makeDiagnostic} from '../../core/diagnostic.mjs';
import {createHandoffDraft} from '../../core/handoff-draft.mjs';
import {createHandoffReport,handoffArtifactDigest} from '../../core/handoff-report.mjs';
const key='stateport.atom.v1.diagnostics',message=payload=>({version:1,id:crypto.randomUUID(),session:'handoff-runtime',payload});
const v1=()=>JSON.stringify(makeDiagnostic({selection:{selector:'#confirm',property:'disabled',value:true,observedAt:Date.now()}},{notes:'Synthetic legacy',now:Date.now()}));
async function v2(){const source=v1(),draft=await createHandoffDraft(source,{title:'Synthetic issue',actual:'Disabled',expected:'Enabled'});await draft.freeze({expectedRevision:0});return '\n'+await createHandoffReport(source,JSON.stringify(draft.read().baseline))+'\n';}
function fixture(initial){
 const data={diagnostics:'neighbor host value',...(initial===undefined?{}:{[key]:initial})},calls=[],events=createEventHub();let holdRead,failWrite=false;
 const area={get:async keys=>{await holdRead?.();return Object.fromEntries(keys.filter(k=>k in data).map(k=>[k,structuredClone(data[k])]));},set:async values=>{if(failWrite&&key in values)throw Error('storage unavailable');Object.assign(data,structuredClone(values));}};
 const api={runtime:{id:'test',sendMessage:async()=>{}},permissions:{contains:async()=>false},storage:{local:area,session:area},tabs:{get:async()=>{calls.push('tabs.get');throw Error('No tab needed');},query:async()=>[],reload:async()=>calls.push('reload'),onUpdated:{}},debugger:{attach:async()=>calls.push('attach'),detach:async()=>calls.push('detach'),sendCommand:async()=>calls.push('command')},scripting:{executeScript:async()=>calls.push('script')}};
 const restart=()=>createAtomRuntime(createChromePlatform(api,{events,broker:createDebuggerBroker(api.debugger)})),runtime=restart();
 return {data,calls,runtime,restart,request:(p,o)=>runtime.request(message(p),o),hold:fn=>holdRead=fn,fail:()=>failWrite=true,recover:()=>failWrite=false};
}
test('trusted local save/reopen is available without a tab, grant, source or debugger',async t=>{
 const f=fixture();t.after(()=>f.runtime.shutdown());const raw=await v2(),id=JSON.parse(raw).id;
 const saved=await f.request({op:'save-handoff',raw});assert.equal(saved.status,'saved');assert.equal((await f.request({op:'open-handoff',id})).raw,raw);assert.equal((await f.request({op:'list-handoffs'})).entries.length,1);assert.deepEqual(f.calls,[]);assert.equal(f.data.diagnostics,'neighbor host value');
});
test('same-key legacy v1 and new v2 survive a full runtime restart without changing v1 meaning',async t=>{
 const old=JSON.parse(v1()),f=fixture([old]);await f.runtime.ready;assert.deepEqual(await f.request({op:'list-diagnostics'}),[old]);assert.deepEqual(f.data[key],[old]);
 const raw=await v2();await f.request({op:'save-handoff',raw});await f.runtime.shutdown();const next=f.restart();t.after(()=>next.shutdown());
 const r=p=>next.request(message(p));assert.equal((await r({op:'open-handoff',id:JSON.parse(raw).id})).raw,raw);assert.deepEqual(await r({op:'list-diagnostics'}),[old]);assert.equal(typeof f.data[key],'object');assert.equal(f.data[key].version,2);assert.equal(f.data.diagnostics,'neighbor host value');
});
test('legacy deletion cannot silently remove a v2 report',async t=>{
 const old=JSON.parse(v1()),f=fixture([old]);t.after(()=>f.runtime.shutdown());const raw=await v2(),id=JSON.parse(raw).id;await f.request({op:'save-handoff',raw});await f.request({op:'delete-diagnostic',id});assert.equal((await f.request({op:'open-handoff',id})).raw,raw);await f.request({op:'delete-diagnostic',id:old.id});assert.equal((await f.request({op:'list-diagnostics'})).length,0);assert.equal((await f.request({op:'list-handoffs'})).entries.length,1);
});
test('all old/new files share one eight-report budget',async t=>{
 const originals=Array.from({length:8},()=>JSON.parse(v1())),f=fixture(originals);t.after(()=>f.runtime.shutdown());const saved=await f.request({op:'save-handoff',raw:await v2()});assert.deepEqual(saved.evicted,[originals[0].id]);assert.equal((await f.request({op:'list-handoffs'})).entries.length,8);assert.equal((await f.request({op:'list-diagnostics'})).length,7);
});
test('Chrome value is not a double-encoded JSON string that exceeds the shared byte budget',async t=>{
 const f=fixture();t.after(()=>f.runtime.shutdown());const raws=Array.from({length:3},()=>{
  const r=JSON.parse(v1());r.network=Array.from({length:32},(_,i)=>({id:'q'+i,url:'https://example.invalid/',status:200,body:'\\'.repeat(6000)}));return JSON.stringify(r);
 });
 for(const raw of raws)await f.request({op:'save-handoff',raw});
 assert(Buffer.byteLength(JSON.stringify(f.data[key]))<=2097152,'actual Chrome JSON value must fit, including raw-file escaping');
 assert.equal((await f.request({op:'open-handoff',id:JSON.parse(raws[2]).id})).raw,raws[2]);
});
test('conflicting ID and stale removal preserve the original raw file',async t=>{
 const f=fixture();t.after(()=>f.runtime.shutdown());const raw=await v2(),id=JSON.parse(raw).id;await f.request({op:'save-handoff',raw});const before=f.data[key];await assert.rejects(f.request({op:'save-handoff',raw:' '+raw}),{code:'HANDOFF_ID_CONFLICT'});await assert.rejects(f.request({op:'delete-handoff',id,expectedDigest:'a'.repeat(64)}),{code:'STALE_HANDOFF_RECORD'});assert.equal(f.data[key],before);await f.request({op:'delete-handoff',id,expectedDigest:await handoffArtifactDigest(raw)});assert.equal(await f.request({op:'open-handoff',id}),null);
});
test('malformed old storage is visible and is never overwritten by a new save',async t=>{
 const bad=[{version:1,notes:'Invalid but retained'}],f=fixture(bad);t.after(()=>f.runtime.shutdown());await assert.rejects(f.request({op:'save-handoff',raw:await v2()}),{code:'INVALID_HANDOFF_STORE'});assert.deepEqual(f.data[key],bad);
});
test('failed Chrome storage write rejects; queue can retry without a ghost success',async t=>{
 const f=fixture();t.after(()=>f.runtime.shutdown());const raw=await v2();f.fail();await assert.rejects(f.request({op:'save-handoff',raw}),/storage unavailable/);assert.equal(f.data[key],undefined);f.recover();assert.equal((await f.request({op:'save-handoff',raw})).status,'saved');
});
test('cancellation while a storage read waits prevents the later write',async t=>{
 const f=fixture();t.after(()=>f.runtime.shutdown());await f.runtime.ready;let release,entered;const waiting=new Promise(r=>entered=r);f.hold(()=>{entered();return new Promise(r=>release=r);});const abort=new AbortController(),pending=f.request({op:'save-handoff',raw:await v2()},{signal:abort.signal});await waiting;abort.abort();await assert.rejects(pending,{code:'CANCELLED'});f.hold(null);release();await new Promise(r=>setTimeout(r,0));assert.equal(f.data[key],undefined);
});
test('shutdown drains cancelled storage work without writing it after disposal',async()=>{
 const f=fixture();await f.runtime.ready;let release,entered;const waiting=new Promise(r=>entered=r);f.hold(()=>{entered();return new Promise(r=>release=r);});const pending=f.request({op:'save-handoff',raw:await v2()});await waiting;const closed=f.runtime.shutdown();f.hold(null);release();await assert.rejects(pending,{code:'CANCELLED'});await closed;assert.equal(f.data[key],undefined);
});
test('wire bounds allow escaped JSON while keeping ordinary operations small',async()=>{
 const raw=await v2(),large=raw+'\t'.repeat(100000);assert.equal(validateRequest(message({op:'save-handoff',raw:large})).payload.raw,large);
 for(const p of [{op:'save-handoff',raw:'x'.repeat(1048577)},{op:'save-handoff',raw:'🧪'.repeat(300000)},{op:'save-handoff',raw,grant:'inject'},{op:'open-handoff',id:'x'},{op:'delete-handoff',id:JSON.parse(raw).id,expectedDigest:'bad'},{op:'list-handoffs',raw},{op:'tabs',padding:'x'.repeat(100000)}])assert.throws(()=>validateRequest(message(p)),{code:'INVALID_MESSAGE'});
});
test('local operation admission describes no app authority and still refuses disposed runtime',()=>{
 for(const op of ['save-handoff','list-handoffs','open-handoff','delete-handoff']){assert.deepEqual(operationPolicy(op,{permission:false,lease:'foreign',readOnly:true}),{available:true,reason:null,code:null,requiredGrants:[]});assert.equal(operationPolicy(op,{disposed:true}).code,'DISPOSED');}
});
test('untrusted page cannot store or open reports through the dispatcher',async()=>{
 const called=[],dispatch=createAtomDispatcher({request:async m=>{called.push(m);return{};}},{isTrusted:s=>s.url==='chrome-extension://test/panel.html',isSelectionSender:()=>true});
 for(const op of ['save-handoff','list-handoffs','open-handoff','delete-handoff'])assert.equal(dispatch({op,raw:'{}',id:crypto.randomUUID(),expectedDigest:'a'.repeat(64)},{url:'https://page.invalid/',tab:{id:1}},()=>{}),false);assert.deepEqual(called,[]);
});
