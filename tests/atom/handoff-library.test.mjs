// SPDX-License-Identifier: Apache-2.0
// Controlled DOM, real codec/store. Actual rendered file controls tested separately.
import test from 'node:test';import assert from 'node:assert/strict';
import {createHandoffStore} from '../../core/handoff-store.mjs';
import {makeDiagnostic} from '../../core/diagnostic.mjs';
import {createHandoffDraft} from '../../core/handoff-draft.mjs';
import {createHandoffReport,appendHandoffFinding,handoffArtifactDigest,parseHandoffReport} from '../../core/handoff-report.mjs';
const {createHandoffLibrary}=await import('../../packages/atom/src/handoff-library.mjs').catch(e=>{if(e.code!=='ERR_MODULE_NOT_FOUND')throw e;return{};});
const tick=()=>new Promise(r=>setTimeout(r,0)),deferred=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve};};
const v1=()=>JSON.stringify(makeDiagnostic({selection:{selector:'#private',property:'disabled',value:true,observedAt:Date.now()}}));
async function v2(){const source=v1(),actor=await createHandoffDraft(source,{title:'Readable issue',actual:'Cannot confirm',expected:'Enabled'});await actor.freeze({expectedRevision:0});return '\n'+await createHandoffReport(source,JSON.stringify(actor.read().baseline))+'\n';}
function node(){return {value:'',textContent:'',disabled:false,files:[],children:[],replaceChildren(...children){this.children=children;this.value=children[0]?.value||'';}};}
async function fixture(){
 let stored=null;const store=createHandoffStore({read:async()=>stored,write:async x=>stored=x}),nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},contexts=[],opened=[],legacy=[],calls=[];let intercept;
 const rpc=async(payload,signal)=>{calls.push(payload);if(signal?.aborted)throw Object.assign(Error('Cancelled'),{code:'CANCELLED'});if(intercept){const result=await intercept(payload,signal);if(result!==undefined)return result;}if(signal?.aborted)throw Object.assign(Error('Cancelled'),{code:'CANCELLED'});if(payload.op==='list-handoffs')return store.list();if(payload.op==='open-handoff')return store.open(payload.id);if(payload.op==='save-handoff')return store.save(payload.raw);if(payload.op==='delete-handoff')return store.remove(payload.id,payload.expectedDigest);throw Error('Unexpected live operation '+payload.op);};
 assert.equal(typeof createHandoffLibrary,'function','missing library controller');
 const library=createHandoffLibrary({$,document:{createElement:node},rpc,onContext:x=>contexts.push(x),openReport:async(raw,options)=>{const view=await parseHandoffReport(raw,options);opened.push({raw,options,parentStatus:view.parentStatus});},openLegacy:file=>legacy.push(file)});
 return {$,store,library,calls,contexts,opened,legacy,intercept:fn=>intercept=fn,choose(id){$('report-select').value=id;$('report-select').onchange();},async import(raw){$('report-import').files=[{size:new TextEncoder().encode(raw).length,arrayBuffer:async()=>new TextEncoder().encode(raw).buffer}];await $('report-import').onchange();}};
}
test('selected v1 preparation reopens exact raw bytes; selecting v2 disables preparation',async()=>{
 const f=await fixture(),old='\n'+v1(),raw=await v2();await f.store.save(old);await f.store.save(raw);await f.library.refresh(JSON.parse(old).id);assert.equal(f.contexts.at(-1).available,true);assert.equal(await f.library.getSource(),old);f.choose(JSON.parse(raw).id);assert.equal(f.contexts.at(-1).available,false);await assert.rejects(f.library.getSource());f.library.dispose();
});
test('issue options show reporter title rather than selectors or internal IDs',async()=>{
 const f=await fixture(),raw=await v2();await f.store.save(raw);await f.library.refresh();const label=f.$('report-select').children[0].textContent;assert.match(label,/Readable issue/);assert(!label.includes(JSON.parse(raw).id));assert(!label.includes('#private'));f.library.dispose();
});
test('saved v2 opens readable view with actual available parent bytes',async()=>{
 const f=await fixture(),parent=await v2(),child=await appendHandoffFinding(parent,{text:'Hypothesis'},{expectedParentDigest:await handoffArtifactDigest(parent)});await f.store.save(parent);await f.store.save(child);await f.library.refresh(JSON.parse(child).id);await f.$('export-report').onclick();assert.equal(f.opened[0].raw,child);assert.equal(f.opened[0].options.parentRaw,parent);assert.equal(f.legacy.length,0);f.library.dispose();
});
test('v1 review uses the original reopened file without silently upgrading it',async()=>{
 const f=await fixture(),raw='\n'+v1();await f.store.save(raw);await f.library.refresh();await f.$('export-report').onclick();assert.equal(f.legacy[0].raw,raw);assert.equal(f.legacy[0].version,1);assert.equal(f.opened.length,0);f.library.dispose();
});
test('older list response cannot replace a newer list or selection',async()=>{
 const f=await fixture(),a=v1(),b=await v2();await f.store.save(a);const old=await f.store.list(),hold=deferred();let first=true;f.intercept(p=>p.op==='list-handoffs'&&first?(first=false,hold.promise):undefined);const pending=f.library.refresh();await f.store.save(b);await f.library.refresh(JSON.parse(b).id);hold.resolve(old);await pending;assert.equal(f.$('report-select').children.length,2);assert.equal(f.$('report-select').value,JSON.parse(b).id);f.library.dispose();
});
test('background list completion preserves a user-selected saved report',async()=>{
 const f=await fixture(),a=v1(),b=await v2();await f.store.save(a);await f.store.save(b);await f.library.refresh(JSON.parse(a).id);const hold=deferred(),value=await f.store.list();f.intercept(p=>p.op==='list-handoffs'?hold.promise:undefined);const pending=f.library.refresh();f.choose(JSON.parse(b).id);hold.resolve(value);await pending;assert.equal(f.$('report-select').value,JSON.parse(b).id);f.library.dispose();
});
test('selection change before an open reply cannot show the previous report',async()=>{
 const f=await fixture(),a=await v2(),b=await v2();await f.store.save(a);await f.store.save(b);await f.library.refresh(JSON.parse(a).id);const hold=deferred(),file=await f.store.open(JSON.parse(a).id);f.intercept(p=>p.op==='open-handoff'?hold.promise:undefined);const pending=f.$('export-report').onclick();f.choose(JSON.parse(b).id);hold.resolve(file);await pending;assert.equal(f.opened.length,0);f.library.dispose();
});
test('explicit import stores exact UTF-8 whitespace, then opens the selected report',async()=>{
 const f=await fixture(),raw=await v2();await f.import(raw);assert.equal((await f.store.open(JSON.parse(raw).id)).raw,raw);assert.equal(f.opened[0].raw,raw);assert.match(f.$('diagnostic-status').textContent,/imported|saved/i);assert.equal(f.$('report-import').value,'');f.library.dispose();
});
test('duplicate-ID conflict keeps original and does not open the rejected file',async()=>{
 const f=await fixture(),raw=await v2();await f.store.save(raw);await f.library.refresh();await f.import(' '+raw);assert.equal((await f.store.open(JSON.parse(raw).id)).raw,raw);assert.equal(f.opened.length,0);assert.match(f.$('diagnostic-status').textContent,/different bytes|conflict/i);f.library.dispose();
});
test('strict UTF-8 decoding rejects invalid bytes rather than silently replacing them',async()=>{
 const f=await fixture();f.$('report-import').files=[{size:2,arrayBuffer:async()=>Uint8Array.from([0xc3,0x28]).buffer}];await f.$('report-import').onchange();assert.equal(f.calls.filter(c=>c.op==='save-handoff').length,0);assert.match(f.$('diagnostic-status').textContent,/UTF-8/i);f.library.dispose();
});
test('oversized, BOM and malformed imports never become stored reports',async()=>{
 const f=await fixture();for(const raw of[' '.repeat(1048577),'\ufeff'+await v2(),'{bad'])await f.import(raw);assert.equal(f.calls.filter(c=>c.op==='save-handoff').length,0);assert.equal((await f.store.list()).entries.length,0);f.library.dispose();
});
test('stale digest deletion fails visibly and keeps the record',async()=>{
 const f=await fixture(),raw=await v2();await f.store.save(raw);await f.library.refresh();f.intercept(p=>{if(p.op==='delete-handoff')throw Object.assign(Error('Reopen before removing; stored bytes differ'),{code:'STALE_HANDOFF_RECORD'});});await f.$('delete-report').onclick();assert.equal((await f.store.list()).entries.length,1);assert.match(f.$('diagnostic-status').textContent,/Reopen|differ/i);f.library.dispose();
});
test('explicit deletion removes only the selected exact digest',async()=>{
 const f=await fixture(),a=v1(),b=await v2();await f.store.save(a);await f.store.save(b);await f.library.refresh(JSON.parse(b).id);await f.$('delete-report').onclick();assert.equal(await f.store.open(JSON.parse(b).id),null);assert.equal((await f.store.open(JSON.parse(a).id)).raw,a);assert.equal(f.$('report-select').children.length,1);f.library.dispose();
});
test('disposal during file read prevents subsequent storage mutation',async()=>{
 const f=await fixture(),hold=deferred(),raw=await v2();f.$('report-import').files=[{size:raw.length,arrayBuffer:()=>hold.promise}];const pending=f.$('report-import').onchange();await tick();f.library.dispose();hold.resolve(new TextEncoder().encode(raw).buffer);await pending;assert.equal(f.calls.filter(c=>c.op==='save-handoff').length,0);
});

test('a saved child without a local parent stays readable with continuity unchecked',async()=>{
 const f=await fixture(),parent=await v2(),child=await appendHandoffFinding(parent,{text:'Unjoined note'},{expectedParentDigest:await handoffArtifactDigest(parent)});await f.store.save(child);await f.library.refresh();await f.$('export-report').onclick();assert.equal(f.opened.length,1);assert.equal(f.opened[0].parentStatus,'not-checked');assert.equal(Object.hasOwn(f.opened[0].options,'parentRaw'),false);f.library.dispose();
});
