// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {observeElement} from '../../browser-extension/adapters.js';
import {inputCaptureRuntimeFixture} from '../helpers/input-capture-runtime-fixture.mjs';
const selectorMessage='Could not use this CSS selector. Check it or use Pick element.';
const missingMessage='No accessible element matches this selector. Check it or pick an element again.';
const noResultMessage='Could not inspect this element. Select it again or check the CSS selector.';
const observe=(selector,document)=>runInNewContext(`(${observeElement.toString()})(selector,false)`,{selector,document});
for(const shadow of [false,true])test('lookup exception has useful bounded text without repeating query or reading exception '+(shadow?'shadow':'root'),()=>{
 let queries=0;const thrown=Error('private exception that must not be shown');
 const fail=()=>{queries++;throw thrown;};
 const document={querySelector:shadow?()=>({shadowRoot:{querySelector:fail}}):fail};
 const r=observe(shadow?'#host >>> [':'[',document);
 assert.equal(r.unsupported,selectorMessage);assert.equal(queries,1);assert.doesNotMatch(r.unsupported,/private exception/);
});
test('valid unmatched or inaccessible shadow selection has distinct recovery message',()=>{
 for(const document of [{querySelector:()=>null},{querySelector:()=>({shadowRoot:null})}]){
  const r=observe('#host >>> #missing',document);assert.equal(r.unsupported,missingMessage);
 }
});
for(const reply of [[],[{}],[{result:null}]])test('missing injected selection result refuses clearly and permits fresh successful inspection '+JSON.stringify(reply),async t=>{
 const f=inputCaptureRuntimeFixture();t.after(()=>f.runtime.shutdown());await f.inspect();await f.request({op:'property',property:'text'});await f.request({op:'inspect-selector',selector:'#confirm'});
 const execute=f.api.scripting.executeScript;f.api.scripting.executeScript=async op=>op.func.name==='observeElement'?reply:execute(op);
 await assert.rejects(f.request({op:'inspect-selector',selector:'['}),e=>e.code==='SELECTION_UNAVAILABLE'&&e.message===noResultMessage);
 const failed=await f.request({op:'state'});assert.equal(failed.selection,null);assert.equal(failed.analysis,null);
 f.api.scripting.executeScript=execute;await f.request({op:'inspect-selector',selector:'#confirm'});const recovered=await f.request({op:'state'});assert.equal(recovered.selection.selector,'#confirm');assert(recovered.analysis);
});

test('lookup recovery does not inspect an arbitrary thrown object',()=>{
 let reads=0;const thrown=new Proxy({},{get(){reads++;throw Error('private');}});
 const r=observe('[',{querySelector(){throw thrown;}});assert.equal(r.unsupported,selectorMessage);assert.equal(reads,0);
});
