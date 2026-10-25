// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {parse} from '@babel/parser';
import {instrumentCallbackCopyIntervals} from '../../experiments/react19-reducer/callback-copy-transform.mjs';
import {createPropCopyObserver} from '../../experiments/react19-reducer/prop-copy-observer.mjs';
import {createCallbackCopyObserver} from '../../experiments/react19-reducer/callback-copy-observer.mjs';
function run(source,mode='on'){
 const c=vm.createContext({});
 vm.runInContext(`const createPropCopyObserver=${createPropCopyObserver.toString()};globalThis.__sa_callback_copy=(${createCallbackCopyObserver.toString()})({page:'owned-arrow',enabled:${mode==='on'}});globalThis.__sa_array_calls=__sa_callback_copy.arrayRuntime;function make(item){const props={},element={};__sa_callback_copy.tap('props-created',props);__sa_callback_copy.tap('copy-input',item,props,'todo');__sa_callback_copy.tap('element-return',element,props);return element;}`,c);
 const receipt=instrumentCallbackCopyIntervals(source,'owned-arrow.js',{enabled:mode!=='original',sourceType:'script'});vm.runInContext(receipt.code,c);c.__sa_callback_copy.sealWindow();return{out:JSON.parse(JSON.stringify(c.out)),view:c.__sa_callback_copy.snapshot(),receipt,c};
}
function parity(source){const original=run(source,'original'),off=run(source,'off'),on=run(source);assert.deepEqual(on.out,original.out);assert.deepEqual(off.out,original.out);return{original,off,on};}
test('same-arrow new copy input qualifies while original/off outputs agree',()=>{const s='function run(rows){return rows.filter(item=>true).map(item=>make(item));}const result=run([{}]);globalThis.out={count:result.length};';const {off,on}=parity(s);assert.equal(on.receipt.intervalSites.length,1);assert.equal(on.view.status,'Observed');assert.equal(on.view.links.length,1);assert.equal(off.view.links.length,0);assert.equal(on.receipt.sourceOnly,true);assert.equal(on.receipt.nativeRuntimeProven,false);});
test('return branches and implicit return preserve original outputs without borrowing missing construction',()=>{const s='function run(rows){return rows.map(item=>{if(item.new)return make(item);if(item.old)return item.old;});}const item={new:true},old=make(item);const results=run([item,{old},{}]);globalThis.out=[!!results[0],!!results[1],!!results[2]];';const {on}=parity(s);assert.equal(on.view.links.length,1);assert.deepEqual(on.out,[true,true,false]);});
test('element created before callback remains unsupported even same input and return',()=>{const {on}=parity('const item={};const prior=make(item);function run(rows){return rows.map(item=>prior);}globalThis.out=run([item]).length;');assert.equal(on.view.links.length,0);});
test('nested function callback can only own its own constructed element',()=>{const s='function inner(rows){return rows.map(item=>make(item));}function outer(rows){return rows.map(item=>inner([item])[0]);}globalThis.out=outer([{}]).length;';const {on}=parity(s);assert.equal(on.view.links.length,0);});
test('lexical this arguments and new.target survive without another callback frame',()=>{const s='const marker={};function Run(rows){this.results=rows.map(item=>({element:make(item),same:new.target===Run,args:arguments[0]===rows,lexical:this instanceof Run}));}const r=new Run([{}]);globalThis.out={count:r.results.length,same:r.results[0].same,args:r.results[0].args,lexical:r.results[0].lexical};';const {on}=parity(s);assert.deepEqual(on.out,{count:1,same:true,args:true,lexical:true});assert.equal(on.view.links.length,0,'callback returned enclosing object, not new element');});
test('getter sees no persistent metadata-helper or callback-wrapper frame',()=>{const s='let calls=0;const item={get value(){calls++;return /Object\\.(enter|returned|exit)|__saCallback|forwarded/.test(new Error().stack)?null:this;}};function run(rows){return rows.map(item=>make(item.value));}globalThis.out={count:run([item]).length,calls};';const {on}=parity(s);assert.equal(on.out.calls,1);assert.equal(on.view.links.length,1);});
test('original thrown object escapes with one callback invocation and no partial positive',()=>{const s='let calls=0;const sentinel={};function run(rows){return rows.map(item=>{calls++;make(item);throw sentinel;});}let same=false;try{run([{}]);}catch(e){same=e===sentinel;}globalThis.out={calls,same};';const {on}=parity(s);assert.deepEqual(on.out,{calls:1,same:true});assert.equal(on.view.links.length,0);assert.equal(on.c.__sa_callback_copy.retention().active,0);});
test('original return expression executes once before metadata',()=>{const s='let calls=0;function run(rows){return rows.map(item=>(calls++,make(item)));}globalThis.out={count:run([{}]).length,calls};';const {on}=parity(s);assert.equal(on.out.calls,1);assert.equal(on.view.links.length,1);});
test('non-native method still receives the original callback shape',()=>{const s='const rows={map(cb){return {length:cb.length,name:cb.name,prototype:cb.prototype===undefined,value:!!cb({})};}};function run(){return rows.map(item=>make(item));}globalThis.out=run();';const {on}=parity(s);assert.deepEqual(on.out,{length:1,name:'',prototype:true,value:true});assert.equal(on.view.links.length,0);});
test('native callback length1 is unchanged in observed and inactive branches',()=>{const s='function run(rows){return rows.map(item=>make(item));}globalThis.out=run([{}]).length;';for(const mode of ['on','off']){const x=run(s,mode);const ast=parse(x.receipt.code);let lengths=[];const visit=n=>{if(!n||typeof n!=='object')return;if(n.type==='ArrowFunctionExpression')lengths.push(n.params.findIndex(p=>p.type==='RestElement')<0?n.params.length:n.params.findIndex(p=>p.type==='RestElement'));for(const k of Object.keys(n)){if(k==='loc')continue;const v=n[k];if(Array.isArray(v))for(const q of v)visit(q);else visit(v);}};visit(ast);assert(lengths.length>=2);assert(lengths.every(n=>n===1));}});
for(const[name,s]of[
 ['reserved','const __sa_callback_copy={};function run(rows){return rows.map(item=>make(item));}'],
 ['eval','function run(rows){eval("");return rows.map(item=>make(item));}'],
 ['finalizer','function run(rows){return rows.map(item=>{try{return make(item);}finally{return {};}});}'],
 ['async','function run(rows){return rows.map(async item=>make(item));}'],
 ['nested array','function run(rows){return rows.map(item=>rows.map(other=>make(other)));}'],
 ['destructured','function run(rows){return rows.map(({item})=>make(item));}']
])test('unsupported '+name+' stays original or has explicit boundaries',()=>{const r=instrumentCallbackCopyIntervals(s,'unsupported.js',{enabled:true,sourceType:'script'});assert.equal(r.intervalSites.length,0);assert.equal(r.code,s);assert(r.unsupported.length>0);});
test('generated names and multiple lexical scopes retain their exact source site',()=>{const s='function first(rows){const _saCallbackFrame=1;return rows.map(item=>make(item));}function second(rows){return rows.map(item=>make(item));}first([{}]);second([{}]);globalThis.out=true;';const {on}=parity(s);assert.equal(on.receipt.intervalSites.length,2);assert.equal(on.view.links.length,2);assert.notEqual(on.view.links[0].site.id,on.view.links[1].site.id);});
test('disabled source stays byte exact and no admitted map stays unchanged',()=>{const s='function run(rows){return rows.filter(item=>true);}';assert.equal(instrumentCallbackCopyIntervals(s,'a.js').code,s);const r=instrumentCallbackCopyIntervals(s,'a.js',{enabled:true});assert.equal(r.code,s);assert.equal(r.intervalSites.length,0);});

// Real observer + source recipe together on authored native-shape grammar.
const {propCopySyntheticGrammar}=await import('../helpers/react19-prop-copy-controls.mjs');
const {transformPropCopyGrammar}=await import('../../experiments/react19-reducer/prop-copy-vendor.mjs');
const {callbackCopyCases,executeCallbackCopySource}=await import('../helpers/react19-callback-copy-controls.mjs');
for(const id of callbackCopyCases)test('authored config original/off/on interval semantics: '+id,()=>{
 const transformed=transformPropCopyGrammar(propCopySyntheticGrammar,'react/cjs/react.development.js');
 const original=executeCallbackCopySource({source:propCopySyntheticGrammar,caseName:id,mode:'original'}),off=executeCallbackCopySource({source:transformed.code,caseName:id,mode:'off'}),on=executeCallbackCopySource({source:transformed.code,caseName:id});
 assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.trace,original.trace);assert.deepEqual(off.trace,original.trace);
 const expected=['new','two-new','getter','stack-getter','proxy-config','proxy-item','prototype-setter','iterator-mutate','iterator-throw','weakmap-get','array-push'].includes(id)?id==='two-new'?2:1:0;
 assert.equal(on.snapshot.links.length,expected);assert.equal(on.summary.helperFrame,false);assert.equal(on.summary.iteratorCalls,0);assert.equal(on.summary.intrinsicCalls,0);assert.equal(on.summary.valueProxyTraps,0);assert.equal(off.snapshot.links.length,0);
 if(id==='prototype-setter'){assert.equal(on.summary.ownsTodo,false);assert.equal(on.snapshot.propStorage,'Unknown/Unsupported');}
 if(id==='throw-getter')assert.equal(on.summary.sameThrown,true);
 for(const link of on.snapshot.links)assert.equal(link.itemId,link.copyInputId);
 assert.doesNotMatch(JSON.stringify(on.snapshot),/private-synthetic/);
});
test('source runner import is inert and unexpected arguments refuse before any run',async()=>{const {runCallbackCopySourceQualification}=await import('../../experiments/react19-reducer/callback-copy-source-run.mjs');await assert.rejects(runCallbackCopySourceQualification(['--unknown']),e=>e.code==='INVALID_ARGUMENTS');});
test('mixed supported and unsupported source refuses whole interval profile',()=>{const source='function run(rows){const first=rows.map(item=>make(item));return rows.map(async item=>make(item));}';const r=instrumentCallbackCopyIntervals(source,'mixed.js',{enabled:true});assert.equal(r.code,source);assert.equal(r.intervalSites.length,0);assert.equal(r.skipped,true);assert(r.unsupported.length>0);});
