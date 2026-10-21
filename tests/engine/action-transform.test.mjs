// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {instrumentActions} from '../../src/engine/action-transform.mjs';
function execute(source,enabled){const entries=[],leaves=[],context={__sa_actions:{enter:(site,event)=>{entries.push({site,event});return{};},leave:(token,threw)=>leaves.push({token,threw})}};vm.createContext(context);const transformed=instrumentActions(source,'src/actions.js',{enabled,imports:false,sourceType:'script'});vm.runInContext(transformed.code,context);return{...transformed,value:context.result,entries,leaves};}
test('action instrumentation is opt in and binds original source digests/ranges',()=>{
 const source='function save(event){return event;}';assert.equal(instrumentActions(source,'src/actions.js').code,source);const r=instrumentActions(source,'src/actions.js',{enabled:true,imports:false,sourceType:'script'});assert.equal(r.sites.length,1);assert.equal(r.sites[0].sourceDigest,createHash('sha256').update(source).digest('hex'));assert.equal(r.sites[0].line,1);assert.equal(r.sites[0].column,1);assert.equal(r.sites[0].endColumn,source.length+1);
});
test('synchronous body instrumentation preserves receiver, arguments, name, arity and return reference',()=>{
 const source='const event={};const receiver={};function save(event,other){"use strict";return {same:this===receiver,arg:arguments[0]===event,other,ref:event};}const returned=save.call(receiver,event,7);globalThis.result={name:save.name,length:save.length,same:returned.same,arg:returned.arg,other:returned.other,ref:returned.ref===event};';const off=execute(source,false),on=execute(source,true);assert.deepEqual({...on.value},{...off.value});assert.equal(on.entries.length,1);assert.equal(on.leaves.length,1);assert.equal(on.leaves[0].threw,false);
});
test('original finally, thrown values and Promise identity/reaction order are preserved without reactions',async()=>{
 const source='const original={},order=[],promise=Promise.resolve(7);promise.then(()=>order.push("original"));function save(event){try{return promise;}finally{order.push("finally");}}function fail(event){try{return 1;}finally{throw original;}}function primitive(event){throw undefined;}let same=false,undefinedSame=false;const returned=save({});try{fail({});}catch(error){same=error===original;}try{primitive({});}catch(error){undefinedSame=error===undefined;}globalThis.result={same,undefinedSame,promise:returned===promise,order};';const off=execute(source,false),on=execute(source,true);await Promise.resolve();assert.equal(on.value.same,true);assert.equal(on.value.undefinedSame,true);assert.equal(on.value.promise,true);assert.deepEqual(Array.from(on.value.order),Array.from(off.value.order));assert.deepEqual(on.leaves.map(x=>x.threw),[false,true,true]);assert(!/\.then\s*\(/.test(instrumentActions('function f(event){return event;}','src/a.js',{enabled:true,imports:false}).code));
});
test('concise arrow evaluates original getter once and retains lexical this/arguments',()=>{
 const source='let reads=0;const value={get x(){reads++;return 4;}};function factory(){const arrow=event=>[this,arguments[0],value.x];const returned=arrow({});return {receiver:returned[0]===this,arg:returned[1]===arguments[0],value:returned[2]};}const returned=factory.call({},9);globalThis.result={...returned,reads};';const off=execute(source,false),on=execute(source,true);assert.deepEqual({...on.value},{...off.value});assert.equal(on.value.reads,1);assert(on.sites.some(s=>s.kind==='arrow'));
});
test('unsupported function grammar and reserved identifiers retain explicit boundaries',()=>{
 for(const source of ['async function f(event){await 1;}','function* f(event){yield 1;}','function f({event}){}','function f(event){eval("event")}','function f(event){function nested(){};return event;}','const obj={f(event){return event}}']){
  const r=instrumentActions(source,'src/a.js',{enabled:true,imports:false,sourceType:'script'});assert.equal(r.sites.length,0,source);assert(r.unsupported.length,source);
 }
 const reserved='function f(event){return typeof __sa_actions;}';const r=instrumentActions(reserved,'src/a.js',{enabled:true});assert.equal(r.code,reserved);assert.equal(r.skipped,true);
});
test('a callback closing over with cannot add Proxy has traps through helper lookup',()=>{
 const source='let hasCalls=0;const scope=new Proxy({},{has(){hasCalls++;return false;}});var handler;with(scope){handler=function(event){return event;};}const event={};globalThis.result={same:handler(event)===event,hasCalls};';const off=execute(source,false),on=execute(source,true);assert.deepEqual({...on.value},{...off.value});assert.equal(on.sites.length,0);assert.equal(on.skipped,true);
 const mixed='function dynamic(event){return eval(event);}const ordinary=event=>event;';const r=instrumentActions(mixed,'src/a.js',{enabled:true,imports:false,sourceType:'script'});assert.equal(r.sites.length,0);assert.equal(r.skipped,true);
});
