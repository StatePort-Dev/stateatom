// SPDX-License-Identifier: Apache-2.0
// Controlled DOM, actual public codecs. Not rendered/native acceptance.
import test from 'node:test';import assert from 'node:assert/strict';
import {inputReportFixture,hash} from '../helpers/input-report-fixture.mjs';
import {composeHandoffInputReport} from '../../core/handoff-input-report.mjs';
import {parseHandoffReport,redactHandoffFile} from '../../core/handoff-files.mjs';
import {createHandoffReview} from '../../packages/atom/src/handoff-review.mjs';
import {handoffInputFields,handoffInputText} from '../../core/handoff-input-presentation.mjs';
import {reviewDocument,control} from '../helpers/review-dom.mjs';
const opts=raw=>({expectedParentDigest:hash(raw),now:()=>6000});
async function fixture(profile='source') {const f=await inputReportFixture({profile}),raw=await composeHandoffInputReport(f.baseRaw,f.packetRaw,opts(f.baseRaw)),r=(await parseHandoffReport(raw)).record,document=reviewDocument(),root=document.createElement('div');let changes=0;const ui=createHandoffReview({document,root,onChange:()=>changes++});ui.report(r);return {...f,raw,r,root,ui,changes:()=>changes};}
function set(n,v){assert(n,'Missing native review control');if(n.type==='checkbox')n.checked=v;else n.value=v;n.onchange?.();}
test('all retained optional input values are readable and individually removable with their recorded states',async()=>{
 const f=await fixture();for(const field of handoffInputFields(f.r).filter(x=>['included','filtered'].includes(x.state))){const c=control(f.root,'spReviewInputField',field.path);assert(c,field.path);assert(f.root.textContent.includes(typeof field.value==='string'?field.value:JSON.stringify(field.value)),field.path);}
 const path='/projection/transactions/0/outcomes/0/value';set(control(f.root,'spReviewInputField',path),true);const choice=f.ui.read();assert.deepEqual(choice.inputReview.omitFields,[path]);assert.equal(choice.omitInputEvidence,false);
 const raw=await redactHandoffFile(f.raw,choice,opts(f.raw)),r=(await parseHandoffReport(raw,{parentRaw:f.raw})).record;assert.equal(r.inputEvidence.projection.transactions[0].outcomes[0].value.state,'omitted');assert.deepEqual(r.sourceEvidence,f.r.sourceEvidence);assert(f.changes()>0);
});
test('whole input omission disables subordinate choices and never restores their prior contents',async()=>{
 const f=await fixture(),path='/projection/transactions/0/outcomes/0/value',field=control(f.root,'spReviewInputField',path),category=control(f.root,'spReviewInputCategory','inputValues'),whole=control(f.root,'spReviewInputWhole','all');set(field,true);set(whole,true);assert.equal(field.disabled,true);assert.equal(category.disabled,true);assert.deepEqual(f.ui.read().inputReview,{omitCategories:[],omitFields:[]});
 const raw=await redactHandoffFile(f.raw,f.ui.read(),opts(f.raw)),r=(await parseHandoffReport(raw,{parentRaw:f.raw})).record;assert.equal(r.inputEvidence,null);f.ui.report(r);assert.match(f.root.textContent,/cannot be restored/i);assert.equal(control(f.root,'spReviewInputField',path),undefined);
});
test('category omission locks its fields; changing choices invalidates and preserves their local state',async()=>{
 const f=await fixture('reviewed'),path='/projection/transactions/0/outcomes/0/value',field=control(f.root,'spReviewInputField',path),category=control(f.root,'spReviewInputCategory','inputValues');set(field,true);set(category,true);assert.equal(field.disabled,true);assert.deepEqual(f.ui.read().inputReview,{omitCategories:['inputValues'],omitFields:[]});set(category,false);assert.equal(field.checked,true);assert.equal(field.disabled,false);f.ui.busy(true);assert.equal(field.disabled,true);f.ui.busy(false);assert.equal(field.disabled,false);
});
test('minimal input wrapper still offers packet privacy without silently deleting developer notes',async()=>{
 const f=await fixture('minimal');set(control(f.root,'spReviewInputCategory','inputValues'),true);const child=await redactHandoffFile(f.raw,f.ui.read(),opts(f.raw));assert.equal((await parseHandoffReport(child,{parentRaw:f.raw})).record.inputEvidence.projection.transactions[0].outcomes[0].value.state,'omitted');
});
test('passive input wording keeps original/later observations, native ACK and unknown effect separate',async()=>{
 const f=await fixture(),text=handoffInputText(f.r);for(const word of ['Original selected','Later selected','Native acknowledgement','Consumption','unknown'])assert(text.includes(word),word);assert(!text.includes('Selected occurrence identity'));assert(handoffInputText(f.r,{advanced:true}).includes('Selected occurrence identity'));
});
