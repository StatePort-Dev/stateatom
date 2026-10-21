// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeSources,digest} from '../../core/analyzer.mjs';
const file='src/View.vue', identity={run:'vue-run',build:'vue-build',freshness:'instrumented-source-digest'};
function inspect(text,{needle='<button',extra=[],...overrides}={}){const at=text.indexOf(needle),head=text.slice(0,at),line=head.split('\n').length,column=at-head.lastIndexOf('\n');return analyzeSources([{file,text},...extra],{tag:'button',marker:`${file}:${line}:${digest(text).slice(0,12)}:${column}`,markerOnSelected:true,tabId:7,instance:'instance-a',...overrides},[],identity);}
test('Vue SFC exact directive links ordinary script setup method at original source location',()=>{
 const text='<script setup lang="ts">\nfunction save(){return 42}\n</script>\n<template><button @click="save">Save</button></template>',a=inspect(text),b=a.actionBindings[0];
 assert.equal(a.actionBindings.length,1);assert.equal(b.mechanism,'vue-template');assert.equal(b.binding.expression,'save');assert.equal(b.entry.symbol,'save');assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.source.line,2);assert.equal(b.entry.source.column,10);assert.equal(b.binding.source.column,text.split('\n')[3].indexOf('"save"')+2);assert.equal(b.execution.status,'not-observed');assert.match(b.entry.reason,/runtime.*identity.*not observed/);
});
test('Vue compiler script spans preserve aliased imports and a composable return without inventing invocation',()=>{
 const text='<script setup>import {useActions as useWork} from "./work";const {save:submit}=useWork();</script><template><button @click="submit"/></template>',a=inspect(text,{extra:[{file:'src/work.ts',text:'export function useActions(){const save=()=>42;return {save}}'}]}),b=a.actionBindings[0];
 assert.equal(b.entry.status,'Code-linked');assert.equal(b.entry.symbol,'save');assert.equal(b.entry.source.file,'src/work.ts');assert.equal(b.hookRelations[0].relation,'returns-handler');assert.equal(b.calls.length,0);assert.equal(b.execution.status,'not-observed');
});
test('Vue two same-line tags use exact source column and keep selected instance identities',()=>{
 const text='<script setup>const left=()=>1,right=()=>2;</script><template><button @click="left"/><button @click="right"/></template>',a=inspect(text),b=inspect(text,{needle:'<button @click="right"',instance:'instance-b'});
 assert.equal(a.actionBindings[0].entry.symbol,'left');assert.equal(b.actionBindings[0].entry.symbol,'right');assert.notEqual(a.actionBindings[0].binding.source.column,b.actionBindings[0].binding.source.column);assert.notEqual(a.actionBindings[0].identity.instance,b.actionBindings[0].identity.instance);
});
test('Vue absent/inherited/wrong digest/wrong column never borrows a nearby directive',()=>{
 const text='<script setup>function save(){}</script><template><button @click="save"/></template>';
 for(const overrides of [{markerOnSelected:false},{unbound:true},{marker:`${file}:1:000000000000:1`},{marker:`${file}:1:${digest(text).slice(0,12)}:1`}])assert.deepEqual(inspect(text,overrides).actionBindings,[]);
});
test('Vue dynamic argument, modifiers, event-object override, loop and slot scopes remain explicit boundaries',()=>{
 for(const template of ['<button @[event]="save"/>','<button @click.stop="save"/>','<button @click="save" v-on="handlers"/>','<button @click="save" :onClick="other"/>','<button v-for="save in items" @click="save"/>','<Comp v-slot="{save}"><button @click="save"/></Comp>']){
  const a=inspect('<script setup>function save(){};const handlers={},items=[];</script><template>'+template+'</template>');assert.equal(a.actionBindings.length,1,template);assert.equal(a.actionBindings[0].entry.status,'Unknown/Unsupported',template);assert.equal(a.actionBindings[0].execution.status,'not-observed');
 }
});
test('Vue getter/member and template assignment cannot acquire a false constant callback declaration',()=>{
 for(const setup of ['const actions={get save(){throw new Error("no inspection")}}','let save=()=>1;']){
  const expression=setup.includes('actions')?'actions.save':'save',text='<script setup>'+setup+'</script><template><button @click="'+expression+'"/><button @click="save = other"/></template>';
  const b=inspect(text).actionBindings[0];assert.equal(b.entry.status,'Unknown/Unsupported');assert.equal(b.execution.status,'not-observed');
 }
});
test('Vue SFC source location uses compiler blocks rather than matching template text inside script strings',()=>{
 const text='<script setup>const decoy="<template><button>{{fake}}</button></template>";const shown=3;</script>\n<template><button :disabled="shown < 2">{{shown}}</button></template>',a=inspect(text,{needle:'<button :disabled'});
 assert.equal(a.sources.length,1);assert.equal(a.sources[0].line,2);assert(a.sources[0].expressions.includes('shown < 2'));assert(a.sources[0].expressions.includes('shown'));assert(!a.sources[0].expressions.includes('fake'));
});

test('Vue v-pre compiler literal text cannot become a source event declaration',()=>{const text='<script setup>function save(){}</script><template><section v-pre><button @click="save"/></section></template>';assert.deepEqual(inspect(text).actionBindings,[]);});
test('legacy Options API template source navigation stays available without claiming setup handler ownership',()=>{
 const text='<script>export default {data(){return {shown:2}},methods:{save(){}}}</script><template><button id="options" :disabled="shown < 3" @click="save">{{shown}}</button></template>';
 const a=inspect(text,{marker:null,id:'options'});assert.equal(a.sources.length,1);assert(a.sources[0].expressions.includes('shown < 3'));assert(a.actionBindings.every(b=>b.entry.status==='Unknown/Unsupported'));
});
test('Vue interpolation assignment invalidates the original handler declaration without weakening the unchanged control',()=>{
 const setup='<script setup>let save=()=>1;const other=()=>2;</script>',button='<button @click="save"/>',plain=inspect(setup+'<template>'+button+'</template>'),written=inspect(setup+'<template><p>{{ save = other }}</p>'+button+'</template>');
 assert.equal(plain.actionBindings[0].entry.status,'Code-linked');
 assert.equal(written.actionBindings[0].entry.status,'Unknown/Unsupported');
 assert.equal(written.actionBindings[0].execution.status,'not-observed');
});
test('Vue encoded event expressions retain the complete original binding span and refuse unsupported inner mapping',()=>{
 for(const raw of ['&#115;ave','() => save(&quot;x&quot;)','() => shown &lt; 2']){
  const text='<script setup>const save=()=>1,shown=1;</script><template><button @click="'+raw+'"/></template>',b=inspect(text).actionBindings[0];
  assert(b,raw);assert.equal(b.binding.expression,raw);assert.equal(b.binding.source.column,text.indexOf(raw)+1);assert.equal(b.binding.source.endColumn,text.indexOf(raw)+raw.length+1);
  assert.equal(b.entry.status,'Unknown/Unsupported');assert.match(b.entry.reason,/encoded.*mapping/i);assert.equal(b.entry.source,undefined);assert.deepEqual(b.calls,[]);assert.equal(b.execution.status,'not-observed');
 }
});
