// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {parse} from '@babel/parser';
import {instrumentScript} from '../../src/engine/script-transform.mjs';
import {createObserver} from '../../src/engine/observer.mjs';

const transform=source=>instrumentScript(source,'module.ts',{imports:false}).code;
function exportsOf(code){
  return parse(code,{sourceType:'module',plugins:['typescript']}).program.body
    .filter(n=>n.type==='ExportNamedDeclaration').flatMap(n=>n.specifiers)
    .map(s=>({local:s.local?.name,exported:s.exported?.name,type:s.type}));
}

test('named export links and aliases remain Identifier specifiers, not observer calls',()=>{
  const source='let count=1; const next=()=>++count; export {count, count as renamed, next};';
  assert.deepEqual(exportsOf(transform(source)),exportsOf(source));
});

test('TypeScript type-only and imported re-export links stay declarations',()=>{
  const source="import {outside} from './dependency.js'; type Kind='one'; const inside=1; export type {Kind}; export {outside, inside as renamed};";
  assert.deepEqual(exportsOf(transform(source)),exportsOf(source));
});

test('ES module live bindings, alias function identity and default object getter semantics survive observation',async()=>{
  const source=`let value=1,reads=0;
const box={get number(){reads++;return value;}};
const increment=()=>{value+=1;};
export {value as renamed,reads,box,increment as first,increment as second};
export default box;`;
  async function run(observe){
    let observer,key;let code=source;
    if(observe){const transformed=transform(source);const ctx={location:{href:'http://127.0.0.1:4173/'},fetch,Response,crypto,performance};ctx.globalThis=ctx;observer=createObserver(ctx);key='__atom_export_'+crypto.randomUUID();globalThis[key]=observer;code='const __sa=globalThis['+JSON.stringify(key)+'];\n'+transformed;}
    try{
      const m=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
      const before=m.renamed;m.first();const after=m.renamed,number=m.default.number;
      return {before,after,number,reads:m.reads,aliases:m.first===m.second,defaultIdentity:m.default===m.box};
    }finally{observer?.stop();if(key)delete globalThis[key];}
  }
  const expected=await run(false);assert.deepEqual(expected,{before:1,after:2,number:2,reads:1,aliases:true,defaultIdentity:true});assert.deepEqual(await run(true),expected);
});

test('export default expression is still an ordinary executed read with exact value',async()=>{
  const source='let count=1;const next=()=>++count;export {count,next};export default count;';
  const ctx={location:{href:'http://127.0.0.1:4173/'},fetch,Response,crypto,performance};ctx.globalThis=ctx;const observer=createObserver(ctx),key='__atom_default_'+crypto.randomUUID();globalThis[key]=observer;
  try{const code='const __sa=globalThis['+JSON.stringify(key)+'];\n'+transform(source),m=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));assert.equal(m.default,1);m.next();assert.equal(m.count,2);assert.equal(m.default,1);}finally{observer.stop();delete globalThis[key];}
});
