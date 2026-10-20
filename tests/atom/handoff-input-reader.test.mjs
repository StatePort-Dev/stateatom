// SPDX-License-Identifier: Apache-2.0
// Controlled document; source-only async UI controls, no native rendering claim.
import test from 'node:test';import assert from 'node:assert/strict';
import {inputReportFixture,hash} from '../helpers/input-report-fixture.mjs';
import {composeHandoffInputReport} from '../../core/handoff-input-report.mjs';
import {parseHandoffReport} from '../../core/handoff-files.mjs';
import {createHandoffReader} from '../../browser-extension/handoff-reader.mjs';
import {createHandoffUI} from '../../packages/atom/src/handoff-ui.mjs';
import {reviewDocument,control} from '../helpers/review-dom.mjs';
async function fixture(){const f=await inputReportFixture({profile:'source'}),raw='\n'+await composeHandoffInputReport(f.baseRaw,f.packetRaw,{expectedParentDigest:hash(f.baseRaw),now:()=>5000})+'\n',document=reviewDocument(),nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,document.createElement('div'));return nodes.get(id);};document.getElementById=$;
 const prior=globalThis.addEventListener;globalThis.addEventListener=()=>{};const sections=[],downloads=[];let reader;try{reader=createHandoffReader({document,summary:$('summary'),payload:$('payload'),status:$('status'),section:(name,lines,options)=>sections.push({name,lines,options}),download:(raw,name)=>downloads.push({raw,name})});}finally{if(prior===undefined)delete globalThis.addEventListener;else globalThis.addEventListener=prior;}
 return {...f,raw,$,reader,sections,downloads};}
test('recipient loads readable input/source detail and exact note/privacy download through ordinary controls',async()=>{
 const f=await fixture();await f.reader.load(f.raw,()=>true);assert(f.sections.some(s=>s.name==='Historical input outcomes'&&s.options.collapsed));assert(f.sections.some(s=>s.name==='Input identities and locations'));assert(f.sections.some(s=>s.name==='Local source comparisons'));assert.equal(f.$('reader-privacy-area').hidden,false);
 f.$('reader-note-text').value='Ordinary input note';await f.$('reader-note-review').onclick();f.$('reader-note-download').onclick();const note=f.downloads[0].raw;assert.equal((await parseHandoffReport(note,{parentRaw:f.raw})).record.additions.at(-1).text,'Ordinary input note');
 const whole=control(f.$('reader-privacy-fields'),'spReviewInputWhole','all');whole.click();await f.$('reader-privacy-review').onclick();assert.match(f.$('reader-privacy-preview').textContent,/omitted from this copy/);f.$('reader-privacy-download').onclick();assert.equal((await parseHandoffReport(f.downloads[1].raw,{parentRaw:f.raw})).record.inputEvidence,null);
});
test('input privacy change or Cancel during hashing discards stale prepared downloads and preserves typed words',async()=>{
 const f=await fixture();await f.reader.load(f.raw,()=>true);f.$('reader-note-text').value='Keep my typed note';const pending=f.$('reader-privacy-review').onclick();control(f.$('reader-privacy-fields'),'spReviewInputWhole','all').click();await pending;assert.equal(f.$('reader-privacy-download').disabled,true);assert.equal(f.$('reader-privacy-preview').textContent,'');
 const second=f.$('reader-privacy-review').onclick();f.$('reader-privacy-cancel').onclick();await second;assert.equal(f.$('reader-privacy-download').disabled,true);assert.equal(f.$('reader-note-text').value,'Keep my typed note');assert.equal(control(f.$('reader-privacy-fields'),'spReviewInputWhole','all').checked,false);
});
test('a different parent loaded while input privacy hashes cannot retain prior preview or output',async()=>{
 const f=await fixture();await f.reader.load(f.raw,()=>true);control(f.$('reader-privacy-fields'),'spReviewInputWhole','all').click();const pending=f.$('reader-privacy-review').onclick();await f.reader.load(f.baseRaw,()=>true);await pending;assert.equal(f.$('reader-privacy-download').disabled,true);assert.equal(control(f.$('reader-privacy-fields'),'spReviewInputWhole','all'),undefined);f.$('reader-privacy-download').onclick();assert.equal(f.downloads.length,0);
});
test('Atom saved input read-only view shows all input fragments, preserves exact download and clears on a legacy parent',async()=>{
 const f=await fixture(),downloads=[],ui=createHandoffUI({$:f.$,getSource:async()=>{throw Error('No capture while reading');},download:(raw,name)=>downloads.push({raw,name})});
 await ui.openSaved(f.raw);assert.equal(f.$('handoff-input-outcomes').hidden,false);assert.equal(f.$('handoff-input-outcomes').open,false);assert.match(f.$('handoff-input-text').textContent,/Native acknowledgement/);assert.match(f.$('handoff-input-advanced').textContent,/Selected occurrence identity/);assert.equal(f.$('handoff-source-comparisons').hidden,false);f.$('handoff-download').onclick();assert.equal(downloads[0].raw,f.raw);
 await ui.openSaved(f.baseRaw);assert.equal(f.$('handoff-input-outcomes').hidden,true);assert.equal(f.$('handoff-input-text').textContent,'');assert.equal(f.$('handoff-input-advanced').textContent,'');ui.dispose();
});
