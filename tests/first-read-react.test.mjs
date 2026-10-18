// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {parse} from '@babel/parser';import generatorModule from '@babel/generator';import {build} from 'esbuild';import traverseModule from '@babel/traverse';
const file='react-dom/cjs/react-dom.development.js',source=readFileSync('node_modules/'+file,'utf8'),generate=generatorModule.default||generatorModule;
let serial=0;
async function reducerModule(){
 const {transformFirstReact}=await import('../stateatom-field-revision/react-contracts.mjs');const transformed=transformFirstReact(source,file),ast=parse(transformed.code,{sourceType:'module'});
 // Execute the real transformed reducer fragment, without a DOM mock or app replay.
 let reducer;const traverse=traverseModule.default||traverseModule;traverse(ast,{FunctionDeclaration(p){if(p.node.id.name==='basicStateReducer')reducer=p.node;}});assert(reducer);
 const code=generate({type:'File',program:{type:'Program',sourceType:'module',body:[ast.program.body[0],reducer]}}).code.replaceAll('/@stateatom/first-read-query','stateatom:first-read-query-ledger')+'\nexport {basicStateReducer}; export {firstQuerySnapshot} from "stateatom:first-read-query-ledger";';
 const {queryFirstReadPlugin}=await import('../stateatom-field-revision/query-contracts.mjs');const output=await build({stdin:{contents:code,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'neutral',plugins:[queryFirstReadPlugin({instrument:false})],logLevel:'silent'});
 return import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text+'\n// '+(++serial)).toString('base64'));
}
test('pinned reducer original direct and functional actions keep identity, one callback and exact errors',async()=>{
 const{basicStateReducer,firstQuerySnapshot}=await reducerModule(),account={rules:{quota:12}},error={original:true};let calls=0;
 assert.equal(basicStateReducer(null,account),account);assert.equal(basicStateReducer(account,s=>{calls++;assert.equal(s,account);return s;}),account);assert.equal(calls,1);
 assert.throws(()=>basicStateReducer(account,()=>{throw error;}),e=>e===error);
 const events=firstQuerySnapshot().events;assert.equal(events.length,3);assert(events.every(e=>e.kind==='react-reducer'));assert.equal(events[0].args[0].type,'null');assert.equal(events[0].args[1].type,'object');assert.equal(events[1].args[1].type,'function');
});
test('first-read React acquisition rejects changed vendor input and retains exact pinned site counts',async()=>{
 const {transformFirstReact}=await import('../stateatom-field-revision/react-contracts.mjs');assert.throws(()=>transformFirstReact(source+'\n',file),/digest/i);
 const r=transformFirstReact(source,file);assert.deepEqual(r.counts,{'react-reducer':1,'react-mount':1,'react-dispatch':1,'react-eager':1,'react-apply':1,'react-devtools-absent':1,'react-devtools-present':1});
});
