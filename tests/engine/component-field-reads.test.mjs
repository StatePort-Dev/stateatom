// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';import {transformSync} from 'esbuild';
import {instrumentComponentFieldReads} from '../../src/engine/component-field-reads.mjs';
const source='export const Card = wrap(function Card({entry,send}) { const {caption:label,done,id}=entry; return <section><label>{label}</label><label>same</label></section> });';
const options={binding:'Card',parameter:'entry',field:'caption',observerName:'observe'};
function run(text,{row,throwObserver=false}={}){const events=[],order=[],c=vm.createContext({exports:{},module:{exports:{}},wrap:v=>v,observe(kind,...args){events.push({kind,args});if(throwObserver)throw Error('observer');return kind==='enter'?{}:null;},jsx(type,props,...children){order.push(type);return{type,props,children}},row});vm.runInContext(transformSync(text,{loader:'jsx',format:'cjs',jsxFactory:'jsx'}).code,c);let value,error;try{value=c.module.exports.Card({entry:row,send(){}});}catch(e){error=e;}return{events,order,value,error,name:c.module.exports.Card.name,length:c.module.exports.Card.length};}
test('original destructured scalar and its exact host JSX operand get distinct immutable source sites',()=>{
 const r=instrumentComponentFieldReads(source,'card.jsx',options);assert.equal(r.status,'Code-linked field reads');assert.equal(r.sites.length,1);assert.equal(r.sites[0].field,'caption');assert.equal(r.sites[0].hosts.length,1);assert.equal(r.fullPath,false);assert.equal(r.fieldOwnership,'Unknown/Unsupported');
 let gets=0;const row={get caption(){gets++;return'same'},done:false,id:1};const a=run(source,{row}),b=run(r.code,{row});assert.equal(gets,2);assert.equal(JSON.stringify(a.value),JSON.stringify(b.value));assert.deepEqual(b.order,a.order);assert.equal(b.name,a.name);assert.equal(b.length,a.length);assert.deepEqual(b.events.map(e=>e.kind),['enter','read','operand','element']);assert.equal(b.events[0].args[2],row);assert.equal(b.events[1].args[2],'same');assert.equal(b.events[3].args[2],b.value.children[0]);
});
test('original getter error identity/order remains; no successful read or operand is invented',()=>{
 const r=instrumentComponentFieldReads(source,'card.jsx',options);assert.equal(r.status,'Code-linked field reads');const sentinel={error:true};let gets=0;const a=run(r.code,{row:{get caption(){gets++;throw sentinel}}});assert.equal(a.error,sentinel);assert.equal(gets,1);assert.deepEqual(a.events.map(e=>e.kind),['enter']);
});
test('throwing bookkeeping leaves the original expression results and callback identity intact',()=>{
 const r=instrumentComponentFieldReads(source,'card.jsx',options);assert.equal(r.status,'Code-linked field reads');const row={caption:'same',done:false,id:1};const a=run(source,{row}),b=run(r.code,{row,throwObserver:true});assert.equal(b.error,undefined);assert.equal(JSON.stringify(a.value),JSON.stringify(b.value));
});
test('retained actual memo Item source is admitted without adding reads or replacing memo',()=>{
 const text=readFileSync('.runtime/todomvc/examples/react/src/todo/components/item.jsx','utf8'),r=instrumentComponentFieldReads(text,'item.jsx',{binding:'Item',parameter:'todo',field:'title',observerName:'observe'});assert.equal(r.status,'Code-linked field reads');assert.equal(r.sites.length,1);assert.equal(r.sites[0].hosts.length,1);assert.match(r.code,/memo\(function Item/);assert.equal(r.fieldOwnership,'Unknown/Unsupported');
});
for(const [label,text]of [
 ['mutable scalar',source.replace('const {caption:label,done,id}=entry;','let {caption:label,done,id}=entry; label="other";')],
 ['getter default',source.replace('caption:label','caption:label="fallback"')],
 ['row reassignment',source.replace('const {caption:label,done,id}=entry;','entry={caption:"other"}; const {caption:label,done,id}=entry;')],
 ['opaque text expression',source.replace('{label}</label>','{String(label)}</label>')],
 ['nested callback read',source.replace('return <section>','return (()=><section>').replace('</section> });','</section>)() });')],
 ['eval',source.replace('const {caption','eval("entry"); const {caption')],
 ['observer collision',source.replace('const {caption','const observe=()=>{}; const {caption')],
 ['shadowed scalar',source.replace('return <section>','return (()=>{const label="other";return <section>').replace('</section> });','</section>})() });')],
])test('unsupported '+label+' preserves original source and supplies no recipe',()=>{const r=instrumentComponentFieldReads(text,'card.jsx',options);assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.code,text);assert.equal(r.sites.length,0);});

test('original immutable local alias chain preserves receiver and one actual field read',()=>{
 const text=source.replace('const {caption:label,done,id}=entry;','const first=entry;const alias=first;const {caption:label,done,id}=alias;');
 const r=instrumentComponentFieldReads(text,'renamed.jsx',options);assert.equal(r.status,'Code-linked field reads');
 let gets=0;const row={get caption(){gets++;return 'same'},done:false,id:1};const a=run(text,{row}),b=run(r.code,{row});assert.equal(gets,2);assert.equal(JSON.stringify(a.value),JSON.stringify(b.value));assert.equal(b.events[0].args[2],row);assert.deepEqual(b.events.map(e=>e.kind),['enter','read','operand','element']);
});
for(const [name,decl]of[
 ['mutable alias','let alias=entry;'],
 ['reassigned alias','let alias=entry;alias={caption:"same"};'],
 ['different object','const alias={caption:"same"};'],
 ['property alias','const alias=entry.other;'],
 ['function alias','const alias=copy(entry);']
])test('field reader refuses '+name+' instead of equating its scalar',()=>{const text=source.replace('const {caption:label,done,id}=entry;',decl+'const {caption:label,done,id}=alias;');const r=instrumentComponentFieldReads(text,'alias.jsx',options);assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.code,text)});
test('alias getter throwing keeps the original exception and produces no successful read',()=>{const text=source.replace('const {caption:label,done,id}=entry;','const alias=entry;const {caption:label,done,id}=alias;');const r=instrumentComponentFieldReads(text,'alias.jsx',options);assert.equal(r.status,'Code-linked field reads');const sentinel={};let gets=0;const b=run(r.code,{row:{get caption(){gets++;throw sentinel}}});assert.equal(b.error,sentinel);assert.equal(gets,1);assert.deepEqual(b.events.map(e=>e.kind),['enter'])});
