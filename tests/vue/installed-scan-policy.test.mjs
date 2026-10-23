// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {stateatomPlugin} from '../../src/engine/vite-install.mjs';
const plugin=options=>stateatomPlugin({enabled:true,profile:'vue3',...options});
const entries=['**/*.html','**/*.vue','!**/__tests__/**','!**/coverage/**'];
test('enabled installed Vue includes default HTML and SFC scan with original test/coverage excludes',()=>{
  const config=Object.freeze({optimizeDeps:Object.freeze({include:['existing'],exclude:['excluded']}),build:Object.freeze({outDir:'custom-output'})});
  const result=plugin().config(config,{command:'serve'});
  assert.deepEqual(result,{optimizeDeps:{entries}});
  assert.equal(config.optimizeDeps.entries,undefined);
  assert.equal(config.optimizeDeps.include[0],'existing');
});
for(const value of ['src/main.ts',[],['src/**/*.vue','!src/private/**'],undefined])test('preserves explicit optimizer entries '+JSON.stringify(value),()=>{
  assert.equal(plugin().config({optimizeDeps:{entries:value}}),undefined);
});
for(const value of ['src/main.ts',[],{main:'index.html'},undefined])test('preserves explicit Rollup input '+JSON.stringify(value),()=>{
  assert.equal(plugin().config({build:{rollupOptions:{input:value}}}),undefined);
});
for(const key of ['disabled','noDiscovery'])for(const value of [true,false,'dev'])test('preserves explicit optimizer policy '+key+'='+value,()=>{
  assert.equal(plugin().config({optimizeDeps:{[key]:value}}),undefined);
});
test('disabled and default profiles retain their original config hook result',()=>{
  assert.equal(plugin({enabled:false}).config({}),undefined);
  assert.equal(stateatomPlugin({enabled:true}).config({}),undefined);
  assert.equal(stateatomPlugin({enabled:false}).config({}),undefined);
});
test('fresh entry arrays cannot leak mutations across instances or config calls',()=>{
  const first=plugin().config({});first.optimizeDeps.entries.push('private');
  assert.deepEqual(plugin().config({}),{optimizeDeps:{entries}});
});
test('accessors and non-plain config containers are preserved without evaluating getters',()=>{
  let reads=0;const accessor={get(){reads++;throw Error('MUST_NOT_READ_CONFIG_GETTER');}};
  for(const config of [Object.defineProperty({},'optimizeDeps',accessor),{optimizeDeps:Object.defineProperty({},'entries',accessor)},Object.defineProperty({},'build',accessor),{build:Object.defineProperty({},'rollupOptions',accessor)},{build:{rollupOptions:Object.defineProperty({},'input',accessor)}},Object.create({optimizeDeps:{entries:[]}}),{optimizeDeps:Object.create({entries:[]})},{optimizeDeps:[]},{build:[]},{build:{rollupOptions:[]}}])assert.equal(plugin().config(config),undefined);
  assert.equal(reads,0);
});
test('default React config still returns its actual vendor probe instead of Vue entries',()=>{
  const p=stateatomPlugin({enabled:true,reactHostProps:true,root:process.cwd()});
  const result=p.config({root:process.cwd(),esbuild:{jsx:'transform',jsxFactory:'React.createElement'}});
  assert.equal(result.optimizeDeps.force,true);
  assert(result.optimizeDeps.include.includes('react-dom/client'));
  assert(result.optimizeDeps.esbuildOptions.plugins.length>0);
  assert.equal(result.optimizeDeps.entries,undefined);
});
