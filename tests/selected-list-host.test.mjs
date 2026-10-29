// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {build} from 'esbuild';import {parse} from '@babel/parser';
import {readFile,mkdtemp,writeFile,rm,symlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fetchPolicyDeclaration,selectedListHost} from '../src/first-read/selected-list-host.mjs';

test('official selected-list host requires an explicit absolute directory and complete byte pin',()=>{
 assert.equal(selectedListHost(undefined).panel,'panel.html');
 assert.deepEqual(selectedListHost({directory:'/tmp/official/dist',sha256:'a'.repeat(64)}),{kind:'stateport',directory:'/tmp/official/dist',sha256:'a'.repeat(64),panel:'atom.html',worker:'service-worker.js'});
 for(const v of [null,{}, {directory:'relative',sha256:'a'.repeat(64)},{directory:'/tmp/official',sha256:'wrong'},{directory:'/tmp/official',sha256:'a'.repeat(64),panel:'evil.html'}])assert.throws(()=>selectedListHost(v),/Official extension/);
});
test('exact policy declaration survives official identifier minification without a guessed function name',async()=>{
 const result=await build({stdin:{contents:await readFile('core/fetch-bindings.mjs','utf8'),resolveDir:process.cwd()+'/core',sourcefile:'fetch-bindings.mjs'},bundle:true,format:'esm',minify:true,write:false});
 const code=result.outputFiles[0].text,ast=parse(code,{sourceType:'module'}),declaration=fetchPolicyDeclaration(ast,code,{official:true});
 assert.match(declaration,/stateatom:fetch-policy-helper\/1/);assert(!declaration.startsWith('function installFetchPolicy('));
 assert.throws(()=>fetchPolicyDeclaration(parse('function installFetchPolicy(){}'), 'function installFetchPolicy(){}',{official:true}),/policy declaration/);
 const duplicate='function a(){"stateatom:fetch-policy-helper/1";}function b(){"stateatom:fetch-policy-helper/1";}';
 assert.throws(()=>fetchPolicyDeclaration(parse(duplicate),duplicate,{official:true}),/policy declaration/);
});
test('official output acquisition checks all exact files, expected layout and byte drift before any browser',async t=>{
 const dir=await mkdtemp('/tmp/selected-official-output-');t.after(()=>rm(dir,{recursive:true,force:true}));
 const sha=b=>createHash('sha256').update(b).digest('hex');
 const files={'atom.html':'<html></html>','manifest.json':JSON.stringify({manifest_version:3,name:'StatePort Capture (development beta)',version:'0.1',background:{type:'module',service_worker:'service-worker.js'}}),'service-worker.js':'void 0;'};
 for(const [name,bytes]of Object.entries(files))await writeFile(dir+'/'+name,bytes);
 const pin=sha(JSON.stringify(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([name,bytes])=>[name,sha(bytes)])));
 const code=(await readFile('src/first-read/controlled-session.mjs','utf8')).replace("import('./selected-list-host.mjs')",`import(${JSON.stringify(new URL('../src/first-read/selected-list-host.mjs',import.meta.url).href)})`);
 const {outputIdentity}=await import('data:text/javascript;base64,'+Buffer.from(code+'\nexport {outputIdentity};').toString('base64'));
 assert.equal((await outputIdentity('/unused',{directory:dir,sha256:pin})).identity,pin);
 await assert.rejects(outputIdentity('/unused',{directory:dir,sha256:'a'.repeat(64)}),/byte pin/);
 await writeFile(dir+'/service-worker.js','void 1;');await assert.rejects(outputIdentity('/unused',{directory:dir,sha256:pin}),/byte pin/);
 await symlink(dir+'/atom.html',dir+'/extra.html');await assert.rejects(outputIdentity('/unused',{directory:dir,sha256:pin}),/Built output/);
});
