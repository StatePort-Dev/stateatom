// SPDX-License-Identifier: Apache-2.0
// Behavioral boundary: exact persisted bytes, conflicts and atomic retention.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {makeDiagnostic} from '../core/diagnostic.mjs';
import {createHandoffDraft} from '../core/handoff-draft.mjs';
import {createHandoffReport, appendHandoffFinding} from '../core/handoff-report.mjs';
const {createHandoffStore} = await import('../core/handoff-store.mjs').catch(e => {
 if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e;
 return {};
});
const DAY=86400000, AT=10*DAY;
const hash=raw=>createHash('sha256').update(raw).digest('hex');
const v1=(at=AT)=>JSON.stringify(makeDiagnostic({selection:{selector:'#confirm',property:'disabled',value:true,observedAt:at}},{notes:'Синтетический пример',now:at}));
async function v2(){
 const source=v1(), draft=await createHandoffDraft(source,{title:'Кнопка недоступна',actual:'Disabled',expected:'Enabled'},{now:()=>AT});
 await draft.freeze({expectedRevision:0});
 return createHandoffReport(source,JSON.stringify(draft.read().baseline),{},{now:()=>AT});
}
async function disk(t){
 const dir=await mkdtemp(join(tmpdir(),'stateatom-handoff-store-')),file=join(dir,'store.json');
 t.after(()=>rm(dir,{recursive:true,force:true}));
 const adapter={read:async()=>{try{return await readFile(file,'utf8');}catch(e){if(e.code==='ENOENT')return null;throw e;}},write:raw=>writeFile(file,raw,'utf8'),now:()=>AT};
 assert.equal(typeof createHandoffStore,'function','missing compatible store controller');
 return {adapter,restart:()=>createHandoffStore(adapter),bytes:()=>adapter.read()};
}
test('v1 and noncanonical Unicode v2 reopen after controller restart with exact bytes',async t=>{
 const d=await disk(t),old=v1(),raw='\n'+JSON.stringify(JSON.parse(await v2()),null,2)+'\n';
 const a=d.restart();await a.save(old);await a.save(raw);
 const b=d.restart(),list=await b.list();assert.equal(list.entries.length,2);
 const opened=await b.open(JSON.parse(raw).id);assert.equal(opened.raw,raw);assert.equal(opened.digest,hash(raw));assert.equal(opened.version,2);assert.equal(opened.record.report.issue.title,'Кнопка недоступна');assert.equal(opened.trust,'historical-untrusted');
 assert.equal((await b.open(JSON.parse(old).id)).raw,old);assert.equal((await b.open(JSON.parse(old).id)).version,1);
});
test('an existing legacy v1 array remains readable without rewriting it',async t=>{
 const d=await disk(t),old=JSON.parse(v1()),source=JSON.stringify([old]);await d.adapter.write(source);
 const s=d.restart(),list=await s.list();assert.equal(list.entries.length,1);assert.equal((await s.open(old.id)).raw,JSON.stringify(old));assert.equal((await s.open(old.id)).representation,'legacy-reserialized');assert.equal(await d.bytes(),source);
 const raw='\n'+await v2();await s.save(raw);const stored=JSON.parse(await d.bytes());assert.equal(stored.version,2);assert.deepEqual(stored.entries[0].legacy,old);assert.equal(stored.entries[1].raw,raw);
 assert.equal((await d.restart().open(old.id)).raw,JSON.stringify(old));assert.equal((await d.restart().open(JSON.parse(raw).id)).raw,raw);
});
test('near-budget legacy archive is not inflated into unreadability',async t=>{
 const d=await disk(t),old=Array.from({length:2},()=>JSON.parse(largeV1())),source=JSON.stringify(old);assert(Buffer.byteLength(source)<2097152);await d.adapter.write(source);
 const s=d.restart();assert.equal((await s.list()).entries.length,2);assert.equal(await d.bytes(),source);
 await s.save(await v2());assert.equal((await d.restart().list()).entries.length,3);assert(Buffer.byteLength(await d.bytes())<=2097152);assert.equal((await s.open(old[0].id)).raw,JSON.stringify(old[0]));
});
test('prior private v1 envelope reopens without rewriting supplied raw bytes',async t=>{
 const d=await disk(t),raw='\n'+await v2(),input=JSON.stringify({schema:'stateatom.handoff-store',version:1,entries:[{raw,representation:'input-bytes'}]});await d.adapter.write(input);
 assert.equal((await d.restart().open(JSON.parse(raw).id)).raw,raw);
});
test('same bytes are idempotent, different bytes at the same ID conflict without any write',async t=>{
 const d=await disk(t),s=d.restart(),raw=await v2();await s.save(raw);const before=await d.bytes();
 assert.equal((await s.save(raw)).status,'unchanged');assert.equal(await d.bytes(),before);
 for(const altered of[' '+raw,raw.replace('Disabled','Different')])await assert.rejects(s.save(altered),{code:altered.startsWith(' ')?'HANDOFF_ID_CONFLICT':'HANDOFF_INTEGRITY'});
 assert.equal(await d.bytes(),before);assert.equal((await d.restart().open(JSON.parse(raw).id)).raw,raw);
});
test('valid v1 with conflicting content cannot replace the original',async t=>{
 const d=await disk(t),s=d.restart(),raw=v1();await s.save(raw);const changed=JSON.parse(raw);changed.notes='A different claim';
 await assert.rejects(s.save(JSON.stringify(changed)),{code:'HANDOFF_ID_CONFLICT'});assert.equal((await s.open(changed.id)).raw,raw);
});
test('explicit legacy intake preserves old input and labels reserialized bytes truthfully',async t=>{
 const d=await disk(t),old=JSON.parse(v1()),input=JSON.stringify([old],null,2),s=d.restart();
 const result=await s.importLegacy(input);assert.equal(result.saved.length,1);const opened=await d.restart().open(old.id);
 assert.equal(opened.raw,JSON.stringify(old));assert.equal(opened.representation,'legacy-reserialized');assert.equal(opened.record.version,1);assert.equal(input,JSON.stringify([old],null,2));
 const before=await d.bytes();assert.equal((await s.importLegacy(input)).saved.length,0);assert.equal(await d.bytes(),before);
});
test('legacy batch conflict is atomic, even when the first incoming record is new',async t=>{
 const d=await disk(t),s=d.restart(),old=JSON.parse(v1());await s.save(JSON.stringify(old));const before=await d.bytes(),changed={...old,notes:'Conflict'};
 await assert.rejects(s.importLegacy(JSON.stringify([JSON.parse(v1()),changed])),{code:'HANDOFF_ID_CONFLICT'});assert.equal(await d.bytes(),before);
 await assert.rejects(s.importLegacy(JSON.stringify([JSON.parse(v1()),JSON.parse(await v2())])),{code:'INVALID_HANDOFF_LEGACY'});assert.equal(await d.bytes(),before);
});
test('source and developer children retain their exact parent bytes and immutable baseline',async t=>{
 const d=await disk(t),s=d.restart(),parent='\n'+await v2(),child=await appendHandoffFinding(parent,{text:'Developer hypothesis'},{expectedParentDigest:hash(parent),now:()=>AT+1});
 await s.save(child);assert.equal((await s.open(JSON.parse(child).id)).parentStatus,'not-checked');
 await s.save(parent);const opened=await d.restart().open(JSON.parse(child).id);assert.equal(opened.parentStatus,'content-matched');assert.equal(opened.record.additions[0].evidenceStatus,'unverified-note');assert.deepEqual(opened.record.report,JSON.parse(parent).report);assert.equal((await s.open(JSON.parse(parent).id)).raw,parent);
 const fork=await appendHandoffFinding(parent,{text:'Separate branch'},{expectedParentDigest:hash(parent),now:()=>AT+2});await s.save(fork);assert.equal((await s.list()).entries.length,3);
});
test('a retained parent cannot validate different raw whitespace',async t=>{
 const d=await disk(t),s=d.restart(),parent=await v2(),child=await appendHandoffFinding(parent,{text:'Hypothesis'},{expectedParentDigest:hash(parent),now:()=>AT+1});
 await s.save(' '+parent);await s.save(child);assert.equal((await s.open(JSON.parse(child).id)).parentStatus,'not-checked');
});
test('inconsistent links reject whether the parent or child arrives first',async t=>{
 const d=await disk(t),parent=await v2(),valid=await appendHandoffFinding(parent,{text:'Hypothesis'},{expectedParentDigest:hash(parent),now:()=>AT+1}),bad=JSON.parse(valid);bad.revision=2;const child=JSON.stringify(bad),s=d.restart();
 await s.save(child);const before=await d.bytes();await assert.rejects(s.save(parent),{code:'HANDOFF_PARENT_MISMATCH'});assert.equal(await d.bytes(),before);
 await s.remove(bad.id,hash(child));await s.save(parent);const after=await d.bytes();await assert.rejects(s.save(child),{code:'HANDOFF_PARENT_MISMATCH'});assert.equal(await d.bytes(),after);
});
test('missing parent after explicit deletion stays not-checked and grants no authority',async t=>{
 const d=await disk(t),s=d.restart(),parent=await v2(),child=await appendHandoffFinding(parent,{text:'<script>reload()</script> https://example.invalid/'},{expectedParentDigest:hash(parent),now:()=>AT});
 await s.save(parent);await s.save(child);await s.remove(JSON.parse(parent).id,hash(parent));
 const r=await d.restart().open(JSON.parse(child).id);assert.equal(r.parentStatus,'not-checked');assert.equal(r.trust,'historical-untrusted');assert.match(r.record.additions[0].text,/<script>/);
});
test('eight-entry retention evicts insertion-oldest and duplicate saves do not reorder',async t=>{
 const d=await disk(t),s=d.restart(),raws=Array.from({length:9},()=>v1());for(const r of raws.slice(0,8))await s.save(r);
 await s.save(raws[0]);const out=await s.save(raws[8]);assert.deepEqual(out.evicted,[JSON.parse(raws[0]).id]);assert.equal(await s.open(JSON.parse(raws[0]).id),null);assert.deepEqual((await s.list()).entries.map(x=>x.id),raws.slice(1).map(r=>JSON.parse(r).id));
});
test('seven-day cutoff is inclusive and cannot be extended by reimport',async t=>{
 const d=await disk(t),s=d.restart(),raw=v1(AT-7*DAY);await s.save(raw);d.adapter.now=()=>AT+1;
 const later=d.restart(),out=await later.list();assert.deepEqual(out.expired,[JSON.parse(raw).id]);assert.equal(out.entries.length,0);
 const before=await d.bytes();await assert.rejects(later.save(raw),{code:'HANDOFF_EXPIRED'});assert.equal(await d.bytes(),before);
});
test('expiry is based on the artifact, not its older source snapshot',async t=>{
 const d=await disk(t),raw=await v2();d.adapter.now=()=>AT+6*DAY;const s=d.restart();await s.save(raw);assert.equal((await s.list()).entries.length,1);
});
function largeV1(){const r=JSON.parse(v1());r.notes='🧪'.repeat(7000);for(let i=0;i<32;i++)r.network.push({id:'n'+i,url:'https://example.invalid/',status:200,observedAt:AT,evidence:'Observed exchange; not evidence of dependency',body:'🧪'.repeat(7000)});return JSON.stringify(r);}
test('encoded UTF-8 storage budget evicts before eight entries without truncating reports',async t=>{
 const d=await disk(t),s=d.restart(),raws=Array.from({length:3},()=>largeV1());for(const r of raws)await s.save(r);
 const out=await s.list();assert.equal(out.entries.length,2);assert.equal(await s.open(JSON.parse(raws[0]).id),null);assert.equal((await s.open(JSON.parse(raws[2]).id)).raw,raws[2]);assert(Buffer.byteLength(await d.bytes())<=2097152);
});
test('compact legacy intake fits a valid batch without double-encoding its strings',async t=>{
 const d=await disk(t),s=d.restart(),batch=JSON.stringify(Array.from({length:3},()=>{
  const r=JSON.parse(largeV1());r.notes='\\'.repeat(9000);for(const n of r.network)n.body='\\'.repeat(9000);return r;
 }));
 assert(Buffer.byteLength(batch)<2097152);assert.equal((await s.importLegacy(batch)).saved.length,3);assert.equal((await d.restart().list()).entries.length,3);assert(Buffer.byteLength(await d.bytes())<=2097152);
});
test('removal rejects stale digest and preserves the exact stored report',async t=>{
 const d=await disk(t),s=d.restart(),raw=v1(),id=JSON.parse(raw).id;await s.save(raw);const before=await d.bytes();await assert.rejects(s.remove(id,hash('wrong')),{code:'STALE_HANDOFF_RECORD'});assert.equal(await d.bytes(),before);assert.equal((await s.remove(id,hash(raw))).removed,true);assert.equal(await s.open(id),null);
});
test('returned views cannot mutate stored data or later reads',async t=>{
 const d=await disk(t),s=d.restart(),raw=await v2();await s.save(raw);const list=await s.list(),opened=await s.open(JSON.parse(raw).id);
 assert.throws(()=>list.entries.push({}),TypeError);assert.throws(()=>opened.record.report.issue.expected='Rewrite',TypeError);assert.equal((await s.open(opened.record.id)).raw,raw);
});
test('queued saves and deletion cannot lose another acknowledged write',async t=>{
 const d=await disk(t),s=d.restart(),a=v1(),b=await v2();await Promise.all([s.save(a),s.save(b)]);assert.equal((await d.restart().list()).entries.length,2);
 const c=v1();await Promise.all([s.remove(JSON.parse(a).id,hash(a)),s.save(c)]);assert.deepEqual((await d.restart().list()).entries.map(e=>e.id),[JSON.parse(b).id,JSON.parse(c).id]);
});
test('failed write rejects without publishing a successful in-memory record; queue recovers',async t=>{
 const d=await disk(t),base=d.adapter,raw=v1();let fail=true;
 const s=createHandoffStore({...base,write:async value=>{if(fail)throw Error('disk unavailable');await base.write(value);}});
 await assert.rejects(s.save(raw),/disk unavailable/);assert.equal(await d.bytes(),null);assert.equal((await s.list()).entries.length,0);fail=false;await s.save(raw);assert.equal((await d.restart().open(JSON.parse(raw).id)).raw,raw);
});
test('failed read never becomes an empty store write; queue recovers',async t=>{
 const d=await disk(t),base=d.adapter,raw=v1();await d.restart().save(raw);const before=await d.bytes();let fail=true;
 const s=createHandoffStore({...base,read:async()=>{if(fail)throw Error('read unavailable');return base.read();}});
 await assert.rejects(s.save(v1()),/read unavailable/);assert.equal(await d.bytes(),before);fail=false;assert.equal((await s.list()).entries.length,1);
});
test('lost write acknowledgement rejects; reopen reads actual disk without blind rollback',async t=>{
 const d=await disk(t),base=d.adapter,raw=v1();let loseAck=true;
 const s=createHandoffStore({...base,write:async value=>{await base.write(value);if(loseAck)throw Error('write acknowledgement lost');}});
 await assert.rejects(s.save(raw),/acknowledgement lost/);
 assert.equal((await d.restart().open(JSON.parse(raw).id)).raw,raw);
 loseAck=false;assert.equal((await s.save(raw)).status,'unchanged');assert.equal((await s.list()).entries.length,1);
});
for(const corrupt of['{bad','null','{}','{"schema":"stateatom.handoff-store","version":99,"entries":[]}','{"schema":"stateatom.handoff-store","version":1,"entries":[{"raw":"{}","representation":"input-bytes"}]}'])test('corrupt envelope is preserved on read: '+corrupt.slice(0,28),async t=>{
 const d=await disk(t);await d.adapter.write(corrupt);await assert.rejects(d.restart().save(v1()));assert.equal(await d.bytes(),corrupt);
});
test('preexisting duplicate IDs are corrupt, not silently merged',async t=>{
 const d=await disk(t),raw=v1(),entry={raw,representation:'input-bytes'},corrupt=JSON.stringify({schema:'stateatom.handoff-store',version:1,entries:[entry,entry]});await d.adapter.write(corrupt);await assert.rejects(d.restart().list(),{code:'INVALID_HANDOFF_STORE'});assert.equal(await d.bytes(),corrupt);
});
for(const raw of['{bad','{}','{"schema":"stateatom.diagnostic","version":9}',' '.repeat(1048577)])test('invalid incoming file leaves the store unchanged: '+raw.slice(0,35),async t=>{
 const d=await disk(t),s=d.restart();await s.save(v1());const before=await d.bytes();await assert.rejects(s.save(raw));assert.equal(await d.bytes(),before);
});
for(const at of[-1,NaN,Infinity,8640000000000001])test('invalid host clock cannot prune or write: '+at,async t=>{
 const d=await disk(t);await d.restart().save(v1());const before=await d.bytes();await assert.rejects(createHandoffStore({...d.adapter,now:()=>at}).list(),{code:'INVALID_CLOCK'});assert.equal(await d.bytes(),before);
});
test('external getters are never evaluated as stored records or configuration',async t=>{
 const d=await disk(t);let calls=0;assert.throws(()=>createHandoffStore({...d.adapter,get now(){calls++;return Date.now;}}));const s=d.restart();await assert.rejects(s.save({get id(){calls++;return'fake';}}));await assert.rejects(s.importLegacy({get length(){calls++;return 0;}}));assert.equal(calls,0);
});
