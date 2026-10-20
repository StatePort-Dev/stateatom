// SPDX-License-Identifier: Apache-2.0
// Real public codecs/store with synthetic data; not native acquisition evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {inputReportFixture,hash} from './helpers/input-report-fixture.mjs';
import {parseHandoffReport as parseMinimal,readHandoffFile as readMinimal} from '../core/handoff-report.mjs';
import {parseReviewedHandoffReport} from '../core/handoff-reviewed.mjs';
import {parseHandoffSourceEvidence} from '../core/handoff-source-attachment.mjs';
import {parseHandoffInputReport,composeHandoffInputReport} from '../core/handoff-input-report.mjs';
import {parseHandoffInputEvidence} from '../core/handoff-input-evidence.mjs';
import {readHandoffFile} from '../core/handoff-files.mjs';
import {createHandoffStore} from '../core/handoff-store.mjs';
import {parseDiagnostic} from '../core/diagnostic.mjs';
const secret='PrivateDuplicateSecretCedar';
const shadow=(raw,key,escaped=false)=>raw.replace('{','{'+(escaped?'"\\u00'+key.charCodeAt(0).toString(16)+key.slice(1)+'"':JSON.stringify(key))+':{"hidden":'+JSON.stringify(secret)+'},');
for(const profile of ['minimal','reviewed','source','input','packet'])test(profile+' rejects shadow root, escape-equivalent and nested member names while preserving exact unique JSON',async()=>{
 const f=await inputReportFixture({profile:['minimal','source'].includes(profile)?profile:'reviewed'}),raw=profile==='input'?await composeHandoffInputReport(f.baseRaw,f.packetRaw,{expectedParentDigest:hash(f.baseRaw),now:()=>5000}):profile==='packet'?f.packetRaw:f.baseRaw;
 const parse={minimal:parseMinimal,reviewed:parseReviewedHandoffReport,source:parseHandoffSourceEvidence,input:parseHandoffInputReport,packet:parseHandoffInputEvidence}[profile],key=profile==='packet'?'projection':'report',nested=profile==='packet'?'diagnosticDigest':'actual';
 const record=(await parse(raw)).record,pretty='\n'+JSON.stringify(JSON.parse(raw),null,2)+' \n';assert.deepEqual((await parse(pretty)).record,record);
 const escapedOnly=raw.replace(JSON.stringify(key)+':','"\\u00'+key.charCodeAt(0).toString(16)+key.slice(1)+'":');assert.deepEqual((await parse(escapedOnly)).record,record);
 const variants=[shadow(raw,key),shadow(raw,key,true),raw.replace(JSON.stringify(nested)+':',JSON.stringify(nested)+':'+JSON.stringify(secret)+','+JSON.stringify(nested)+':')];
 for(const bad of variants){assert(bad.includes(secret));assert.deepEqual(JSON.parse(bad),JSON.parse(raw));await assert.rejects(parse(bad),e=>e.code==='INVALID_HANDOFF_JSON'&&/duplicate/i.test(e.message));if(profile!=='packet')await assert.rejects(readHandoffFile(bad),{code:'INVALID_HANDOFF_JSON'});}
});
test('refused shadow-member import never replaces or rewrites exact stored originals',async()=>{
 const f=await inputReportFixture({profile:'minimal'});let stored=null,writes=0;const store=createHandoffStore({now:()=>7000,read:async()=>stored,write:async value=>{writes++;stored=value;}}),raw='\n'+JSON.stringify(JSON.parse(f.baseRaw),null,2)+'\n';await store.save(raw);const before=structuredClone(stored),count=writes;
 await assert.rejects(store.save(shadow(raw,'report')),{code:'INVALID_HANDOFF_JSON'});assert.equal(writes,count);assert.deepEqual(stored,before);assert.equal((await store.open(JSON.parse(raw).id)).raw,raw);
});
test('strict v2 rejection does not reinterpret legacy v1 parser or its exact historical bytes',async()=>{
 const f=await inputReportFixture(),legacy=f.diagnosticRaw.replace('{','{"version":999,');assert.deepEqual(parseDiagnostic(legacy),parseDiagnostic(f.diagnosticRaw));assert.deepEqual((await readHandoffFile(legacy)).record,parseDiagnostic(legacy));assert.deepEqual((await readMinimal(legacy)).record,parseDiagnostic(legacy));
});

import {assertUniqueHandoffJSONMembers} from '../core/handoff-json.mjs';
import {createHandoffUI} from '../packages/atom/src/handoff-ui.mjs';
import {reviewDocument} from './helpers/review-dom.mjs';
test('member detection respects object scope, string escapes and decoded Unicode names',()=>{
 for(const value of [{a:[{a:1},{a:2}]},{text:'"report": { }, [ ] \\ ", "report": ignored',other:{text:'safe'}},{'r\\eport':1,report:2}])assert.doesNotThrow(()=>assertUniqueHandoffJSONMembers(JSON.stringify(value)));
 for(const raw of ['{"a":1,"\\u0061":2}','{"nested":{"x":1,"x":2}}','{"\\ud83d\\ude00":1,"😀":2}'])assert.throws(()=>assertUniqueHandoffJSONMembers(raw),{code:'INVALID_HANDOFF_JSON'});
});
test('shadow structures cannot bypass the existing depth/member budgets',()=>{
 assert.throws(()=>assertUniqueHandoffJSONMembers('['.repeat(18)+'0'+']'.repeat(18)),{code:'HANDOFF_LIMIT'});
 assert.throws(()=>assertUniqueHandoffJSONMembers(JSON.stringify(Object.fromEntries(Array.from({length:10001},(_,i)=>['key'+i,0])))),{code:'HANDOFF_LIMIT'});
});
test('saved read-only preview refuses shadow members and disables the old exact-file download',async()=>{
 const f=await inputReportFixture({profile:'minimal'}),document=reviewDocument(),nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,document.createElement('div'));return nodes.get(id);},downloads=[],ui=createHandoffUI({$,getSource:async()=>f.diagnosticRaw,download:raw=>downloads.push(raw)});
 await ui.openSaved(f.baseRaw);$('handoff-download').onclick();assert.deepEqual(downloads,[f.baseRaw]);$('handoff-cancel').onclick();await ui.openSaved(shadow(f.baseRaw,'report',true));assert.match($('handoff-status').textContent,/duplicate.*unambiguous/i);assert.equal($('handoff-summary').textContent,'');assert.equal($('handoff-download').disabled,true);$('handoff-download').onclick();assert.deepEqual(downloads,[f.baseRaw]);ui.dispose();
});
