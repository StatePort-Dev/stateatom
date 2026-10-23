// SPDX-License-Identifier: Apache-2.0
// Synthetic reductions of the HTML-void parsing failure; no independent app copy.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parse,compileScript,compileTemplate} from '@vue/compiler-sfc';
import {parse as parseDOM} from '@vue/compiler-dom';
import {parse as parseJS} from '@babel/parser';
import {stateatomPlugin} from '../../src/engine/plugin.mjs';

function compiled(source){
  const parsed=parse(source,{filename:'Field.vue'});assert.deepEqual(parsed.errors,[]);
  const script=compileScript(parsed.descriptor,{id:'void-case'});
  const template=compileTemplate({source:parsed.descriptor.template.content,filename:'Field.vue',id:'void-case',compilerOptions:{bindingMetadata:script.bindings}});
  assert.deepEqual(template.errors,[]);return {script,template};
}
function transformed(source){return stateatomPlugin({enabled:true,root:process.cwd()}).transform(source,path.resolve('Field.vue')).code;}

test('Vue instrumentation accepts original HTML input void syntax and retains exact selected source columns',()=>{
  const source='<script setup>const blocked=false;</script><template><div><input :disabled="blocked"><textarea :disabled="blocked"></textarea></div></template>';
  compiled(source);const code=transformed(source);compiled(code);
  const digest=createHash('sha256').update(source).digest('hex').slice(0,12),column=source.indexOf('<input')+1;
  assert(code.includes('data-xray-source="Field.vue:1:'+digest+':'+column+'"'));
  assert.equal((code.match(/:data-stateatom=/g)||[]).length,2);
});

test('standard DOM void tags keep native sibling structure rather than requiring invented end tags',()=>{
  const tags=['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
  const source='<script setup>const blocked=false;</script><template><div>'+tags.map(t=>'<'+t+' :disabled="blocked">').join('')+'</div></template>';
  compiled(source);const code=transformed(source);compiled(code);
  const ast=parseDOM(parse(code).descriptor.template.content);
  assert.deepEqual(ast.children[0].children.map(n=>n.tag),tags);
});

test('ordinary withDefaults and destructured toRefs props compile around native void and textarea controls',()=>{
  const source=`<script setup lang="ts">
import {toRefs} from 'vue';
const props=withDefaults(defineProps<{disabled?:boolean}>(),{disabled:false});
const {disabled}=toRefs(props);
</script><template><div><input :disabled="disabled"><textarea :disabled="disabled"></textarea></div></template>`;
  compiled(source);const code=transformed(source);const result=compiled(code);
  // Original source words legitimately survive in inert observation metadata.
  // The executable compiled AST must contain no remaining compiler-macro call.
  const stack=[parseJS(result.script.content,{sourceType:'module',plugins:['typescript']})],calls=[];
  while(stack.length){const node=stack.pop();if(!node||typeof node!=='object')continue;
    if(node.type==='CallExpression'&&node.callee.type==='Identifier'&&['withDefaults','defineProps'].includes(node.callee.name))calls.push(node.callee.name);
    stack.push(...Object.values(node).filter(v=>v&&typeof v==='object'));
  }
  assert.deepEqual(calls,[]);
});

test('nonvoid missing end tags still refuse and explicit self-closing input remains supported',()=>{
  assert.throws(()=>transformed('<script setup>const x=1;</script><template><section><span>{{x}}</section></template>'),/missing end tag/i);
  compiled(transformed('<script setup>const blocked=false;</script><template><input :disabled="blocked" /></template>'));
});
