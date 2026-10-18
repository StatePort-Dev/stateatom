import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyzeSources,digest} from '../core/analyzer.mjs';
const file='src/Entry.vue',text=`<script setup>const props = defineProps(['entry']);</script>
<template><section>
<label>{{ entry.label }}</label>
<label class="repeated">{{ entry.other }}</label>
<label class="repeated">{{ entry.third }}</label>
</section></template>`;
const files=[{file,text}],identity={run:'short-loop',build:'local',freshness:'current'},marker=line=>`${file}:${line}:${digest(text).slice(0,12)}`;
const analyze=selection=>analyzeSources(files,selection,[],identity).sources;
test('digest-bound marker locates an unnamed SFC label and excludes another line',()=>{
 const sources=analyze({tag:'label',marker:marker(3)});
 assert.equal(sources.length,1);
 assert.deepEqual(sources[0].expressions,['entry.label']);
 assert.equal(sources[0].line,3);
});
test('SFC marker takes precedence over repeated class matches',()=>{
 const sources=analyze({tag:'label',classes:['repeated'],marker:marker(4)});
 assert.equal(sources.length,1);
 assert.deepEqual(sources[0].expressions,['entry.other']);
});
test('wrong tag or digest cannot acquire SFC marker source links',()=>{
 assert.equal(analyze({tag:'button',marker:marker(3)}).length,0);
 assert.equal(analyze({tag:'label',marker:`${file}:3:deadbeef0000`}).length,0);
});
test('same-line SFC marker preserves unique id and class disambiguation',()=>{
 const text='<template><p id="a" class="one">{{ first }}</p><p id="b" class="two">{{ second }}</p></template>';
 const marker=`${file}:1:${digest(text).slice(0,12)}`;
 for(const selection of[{id:'b'},{classes:['two']}]){
  const sources=analyzeSources([{file,text}],{tag:'p',marker,...selection},[],identity).sources;
  assert.equal(sources.length,1);
  assert.deepEqual(sources[0].expressions,['second']);
  assert.equal(sources[0].column,text.indexOf('<p id="b"')+1);
 }
});
test('an indistinguishable same-line SFC marker cannot select the first sibling',()=>{
 const text='<template><p>{{ first }}</p><p>{{ second }}</p></template>';
 const sources=analyzeSources([{file,text}],{tag:'p',marker:`${file}:1:${digest(text).slice(0,12)}`},[],identity).sources;
 assert.equal(sources.length,0);
});
