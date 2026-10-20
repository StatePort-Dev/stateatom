// SPDX-License-Identifier: Apache-2.0
// Actual file-change reader + real codecs in controlled DOM, not native UI proof.
import test from 'node:test';import assert from 'node:assert/strict';
import {inputReportFixture,hash} from '../helpers/input-report-fixture.mjs';
import {composeHandoffInputReport} from '../../core/handoff-input-report.mjs';
import {reviewDocument} from '../helpers/review-dom.mjs';
const canonical=x=>JSON.stringify(function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}(x));
test('a future nested input schema refuses in plain language and clears prepared outputs without network or action adoption',async t=>{
 const f=await inputReportFixture(),raw=await composeHandoffInputReport(f.baseRaw,f.packetRaw,{expectedParentDigest:hash(f.baseRaw),now:()=>5000});
 const document=reviewDocument(),nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,document.createElement('div'));return nodes.get(id);};document.getElementById=$;
 let listener,fetches=0;const input=$('diagnostic-file');input.addEventListener=(kind,fn)=>{if(kind==='change')listener=fn;};
 const originals={document:globalThis.document,addEventListener:globalThis.addEventListener,fetch:globalThis.fetch};globalThis.document=document;globalThis.addEventListener=()=>{};globalThis.fetch=()=>{fetches++;throw Error('No network from reading');};
 t.after(()=>{for(const[k,v]of Object.entries(originals))if(v===undefined)delete globalThis[k];else globalThis[k]=v;});
 await import('../../browser-extension/reader.mjs?u03-h04-nested-input');
 const load=async text=>{input.files=[new File([text],'synthetic-input.stateatom.json',{type:'application/json'})];await listener();};
 await load(raw);assert.match($('reader-status').textContent,/Historical issue report/);$('reader-note-text').value='A previous valid-file note';await $('reader-note-review').onclick();assert.equal($('reader-note-download').disabled,false);
 const future=JSON.parse(raw);future.inputEvidence.schema='stateatom.input-evidence/99';future.inputEvidenceDigest=hash(canonical({inputEvidence:future.inputEvidence,inputPrivacy:future.inputPrivacy}));
 await load(canonical(future));assert.match($('reader-status').textContent,/not supported.*compatible export/i);assert.doesNotMatch($('reader-status').textContent,/UNSUPPORTED_INPUT_EVIDENCE/);assert.equal($('reader-summary').children.length,0);assert.equal($('reader-payload').textContent,'');assert.equal($('reader-note-download').disabled,true);assert.equal($('reader-privacy-download').disabled,true);assert.equal($('reader-source-download').disabled,true);assert.equal(fetches,0);
});
