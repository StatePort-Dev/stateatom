import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessExperiment,edge} from '../core/evidence.mjs';
import {analyzeSources} from '../core/analyzer.mjs';
const id={run:'r1',build:'b1',freshness:'current'};
test('correlation never becomes observed dependency',()=>{
 const e=edge('ui','field','depends','Candidate','value-equality',['observation:1'],id);
 assert.equal(e.status,'Candidate'); assert.equal(e.build,'b1');
 assert.throws(()=>edge('a','b','depends','Confirmed','guess',[],id));
});
test('causal verdict requires three ABA and irrelevant controls',()=>{
 const trials=Array.from({length:3},()=>({build:'b1',a:'Premium',b:'Basic',rollback:'Premium',control:'Premium',consumed:1,controlConsumed:1,reset:true}));
 assert.equal(assessExperiment(trials).status,'Experimentally verified');
 assert.equal(assessExperiment(trials.slice(0,2)).status,'Unknown');
 assert.equal(assessExperiment(trials.map(x=>({...x,rollback:'Basic'}))).status,'Unknown');
 assert.equal(assessExperiment(trials.map(x=>({...x,b:'Premium'}))).status,'Unknown');
 assert.equal(assessExperiment(trials.map(x=>({...x,control:'Other'}))).status,'Unknown');
 assert.equal(assessExperiment(trials.map(x=>({...x,consumed:0}))).status,'Unknown');
});
test('JSX expression and definition recovered without evaluator truth',()=>{
 const files=[{file:'src/Card.jsx',text:'const data = await load();\nfunction Card(){ return <b id="badge">{data.user.tier}</b>; }'}];
 const r=analyzeSources(files,{id:'badge',tag:'b',owners:['Card']},[{json:{user:{tier:'Gold'}},url:'http://127.0.0.1/api/user'}],id);
 assert.equal(r.sources[0].file,'src/Card.jsx'); assert.equal(r.sources[0].line,2);
 assert.ok(r.sources[0].expressions.includes('data.user.tier'));
 assert.ok(r.sources[0].definitions.some(x=>x.name==='data'&&x.line===1));
 assert.ok(r.fields.some(x=>x.path==='user.tier'&&x.status==='Candidate'));
});
test('literal DOM assignment and Vue interpolation adapters use generic core',()=>{
 for(const f of [{file:'a.js',text:'const result = await load();\ndocument.querySelector("#price").textContent = result.amount;'}, {file:'a.vue',text:'<script setup>const result = ref({amount:1})</script>\n<template><b id="price">{{ result.amount }}</b></template>'}]){
 const r=analyzeSources([f],{id:'price',tag:'b'},[{json:{amount:12},url:'http://127.0.0.1/api'}],id);
 assert.equal(r.sources.length,1); assert.ok(r.fields.some(x=>x.path==='amount'));
 }
});
test('minified/unbound source does not get trusted DOM to source links',()=>{
 const r=analyzeSources([{file:'a.jsx',text:'const x=1;const a=<b id="badge">{x}</b>'}],{id:'badge',unbound:true},[],id);
 assert.equal(r.sources.length,0);
});
test('independent class-based Vue selection recovers source without fixture ids',()=>{
 const r=analyzeSources([{file:'src/Footer.vue',text:'<script setup>const remaining = computed(() => props.todos.length)</script>\n<template><span class="todo-count">{{ remaining }}</span></template>'}],{tag:'span',classes:['todo-count'],runtime:{vue:{file:'/src/Footer.vue'}}},[],id);
 assert.equal(r.sources[0]?.file,'src/Footer.vue');assert.ok(r.sources[0].expressions.includes('remaining'));
});
test('mutation with changed served build cannot be called causal',()=>{
 const trials=Array.from({length:3},()=>({a:'A',b:'B',rollback:'A',control:'A',consumed:1,controlConsumed:1,reset:true,buildStable:false}));assert.equal(assessExperiment(trials).status,'Unknown');
});
test('ordinary dev import URL rewriting preserves source binding but changed code does not',async()=>{
 const {sourceBinding}=await import('../core/analyzer.mjs');const original='import {get} from "../api.js";\nconst d=await get();document.querySelector("#x").textContent=d.name;';
 const served='import {get} from "/api.js";\nconst d=await get();document.querySelector("#x").textContent=d.name;\n//# sourceURL=http://127.0.0.1:4173/main.js';
 assert.equal(sourceBinding?.(original,[served]),'AST body equality (import URLs normalized)');
 assert.equal(sourceBinding?.(original,[served.replace('d.name','d.other')]),null);
});
