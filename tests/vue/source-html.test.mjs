// SPDX-License-Identifier: Apache-2.0
// Synthetic source-only controls. Original app/native gates are separate.
import test from 'node:test';
import assert from 'node:assert/strict';
import {vueSourceUnit} from '../../core/vue-source.mjs';
import {analyzeSources,digest} from '../../core/analyzer.mjs';
const file='src/Fields.vue',identity={run:'source-html',build:'synthetic',freshness:'source-only'};
const position=(text,offset)=>({line:text.slice(0,offset).split('\n').length,column:offset-text.slice(0,offset).lastIndexOf('\n')});
function inspect(text,needle,overrides={}){
 const at=position(text,text.indexOf(needle));
 return analyzeSources([{file,text}],{tag:needle.startsWith('<textarea')?'textarea':'input',marker:`${file}:${at.line}:${digest(text).slice(0,12)}:${at.column}`,markerOnSelected:true,tabId:7,instance:'selected-original',...overrides},[],identity);
}
test('ordinary void input after selected textarea preserves its exact source expression and original range',()=>{
 const text='<script setup lang="ts">\nconst blocked=false;\n</script>\n<template>\n  <div>\n    <textarea :disabled="blocked" />\n    <input :disabled="blocked">\n  </div>\n</template>';
 const a=inspect(text,'<textarea'),b=inspect(text,'<input'),start=position(text,text.indexOf('<textarea')),end=position(text,text.indexOf('/>',text.indexOf('<textarea'))+2);
 assert.equal(a.sources.length,1);const s=a.sources[0];assert.deepEqual({line:s.line,column:s.column,endLine:s.endLine,endColumn:s.endColumn},{...start,endLine:end.line,endColumn:end.column});
 assert.equal(s.sourceDigest,digest(text));assert.deepEqual(s.expressions,['blocked']);assert.equal(s.runtimeValue,null);assert.equal(a.graph.edges.find(e=>e.relation==='render-location')?.status,'Code-linked');
 assert.equal(b.sources.length,1);assert.equal(b.sources[0].line,7);assert.equal(b.sources[0].column,5);assert.equal(b.sources[0].endColumn,32);
});
test('all standard HTML void tags retain sibling spans rather than swallowing later targets',()=>{
 const tags=['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
 const text='<script setup>const blocked=false;</script><template><div>'+tags.map(t=>'<'+t+' :disabled="blocked">').join('')+'</div></template>',unit=vueSourceUnit(file,text);
 assert(unit);assert.deepEqual(unit.targets.slice(1).map(n=>n.tag),tags);
 for(const n of unit.targets.slice(1))assert.equal(text.slice(n.column-1,n.endColumn-1),'<'+n.tag+' :disabled="blocked">');
});
test('repeated same-line inputs bind exact columns and never borrow neighboring or wrong-digest evidence',()=>{
 const text='<script setup>const left=false,right=true;</script><template><input :disabled="left"><input :disabled="right"></template>',a=inspect(text,'<input :disabled="left"'),b=inspect(text,'<input :disabled="right"',{instance:'other-instance'});
 assert.equal(a.sources.length,1);assert.equal(b.sources.length,1);assert.deepEqual(a.sources[0].expressions,['left']);assert.deepEqual(b.sources[0].expressions,['right']);assert.notEqual(a.sources[0].column,b.sources[0].column);
 for(const override of [{markerOnSelected:false,unbound:true},{marker:`${file}:1:000000000000:1`},{marker:`${file}:1:${digest(text).slice(0,12)}`},{marker:`${file}:1:${digest(text).slice(0,12)}:1`}])assert.deepEqual(inspect(text,'<input',override).sources,[]);
});
test('DOM namespace boundaries remain compiler-derived across SVG foreignObject and MathML',()=>{
 const text='<script setup>const blocked=false;</script><template><svg><foreignObject><input :disabled="blocked" /></foreignObject></svg><math><mi>x</mi></math></template>',u=vueSourceUnit(file,text);
 assert(u);assert.equal(u.targets.find(n=>n.tag==='svg').node.ns,1);assert.equal(u.targets.find(n=>n.tag==='foreignObject').node.ns,1);assert.equal(u.targets.find(n=>n.tag==='input').node.ns,0);assert.equal(u.targets.find(n=>n.tag==='math').node.ns,2);
});
test('textarea raw text resembling a handler never invents a nested source target or action binding',()=>{
 const text='<script setup>function danger(){throw Error("must not execute")};const blocked=false;</script><template><textarea><button @click="danger" /></textarea><input :disabled="blocked" /></template>',u=vueSourceUnit(file,text);
 assert(u);assert.deepEqual(u.targets.map(n=>n.tag),['textarea','input']);assert.deepEqual(inspect(text,'<textarea').actionBindings,[]);
});
test('malformed nonvoid markup remains refused and explicit self-closing controls remain source-only',()=>{
 assert.equal(vueSourceUnit(file,'<script setup>const x=1;</script><template><div><span>{{x}}</div></template>'),null);
 const text='<script setup>const blocked=false;</script><template><input :disabled="blocked" /></template>',a=inspect(text,'<input');assert.equal(a.sources.length,1);assert.equal(a.sources[0].runtimeValue,null);
});
