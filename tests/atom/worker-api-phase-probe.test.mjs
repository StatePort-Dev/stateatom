// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {installWorkerAPIProbe} from '../helpers/worker-api-phase-probe.mjs';
const apiNames=['debugger.sendCommand','tabs.get','permissions.contains','scripting.executeScript','storage.session.get','storage.session.set','storage.local.get','storage.local.set','runtime.sendMessage'];
function setup(original=()=>Promise.resolve({})){let now=0;const chrome={debugger:{},tabs:{},permissions:{},scripting:{},storage:{session:{},local:{}},runtime:{}};for(const path of apiNames){const keys=path.split('.'),name=keys.pop(),api=keys.reduce((a,k)=>a[k],chrome);api[name]=original;}return{chrome,Promise,performance:{timeOrigin:1000,now:()=>++now},crossOriginIsolated:false};}
const tabArgs=path=>path==='debugger.sendCommand'?[{tabId:9},'DOM.getDocument',{}]:path==='tabs.get'?[9]:path==='scripting.executeScript'?[{target:{tabId:9}}]:[{}];
const call=(scope,path,args=tabArgs(path))=>{const keys=path.split('.'),key=keys.pop(),api=keys.reduce((a,k)=>a[k],scope.chrome);return api[key](...args);};
for(const path of apiNames)test(path+' returns original Promise/args/receiver/result without private reads',async()=>{
 const response={get token(){throw Error('response read');}},promise=Promise.resolve(response),args=tabArgs(path);let calls=0,receiver;
 const scope=setup(function(...passed){calls++;receiver=this;assert.equal(passed.length,args.length);for(let i=0;i<args.length;i++)assert.equal(passed[i],args[i]);return promise;});
 if(path==='debugger.sendCommand')Object.defineProperty(args[2],'secret',{get(){throw Error('params read');}});
 if(path==='scripting.executeScript')for(const key of ['func','args'])Object.defineProperty(args[0],key,{get(){throw Error('script read');}});
 if(path.startsWith('storage.')||path==='runtime.sendMessage'||path==='permissions.contains')Object.defineProperty(args[0],'secret',{get(){throw Error('private input read');}});
 const probe=installWorkerAPIProbe(scope,{tabId:9});probe.reset('trial');assert.equal(call(scope,path,args),promise);assert.equal(await promise,response);await Promise.resolve();const s=probe.snapshot();assert.equal(calls,1);assert.equal(receiver,path.split('.').slice(0,-1).reduce((a,k)=>a[k],scope.chrome));assert.equal(s.rows.length,1);assert.equal(s.rows[0].api,path);assert.equal(s.rows[0].method,path==='debugger.sendCommand'?'DOM.getDocument':null);assert.equal(s.rows[0].ok,true);assert.equal(s.rows[0].supported,true);assert.equal(s.rows[0].durationMs,1);assert.equal(s.inflight,0);assert.equal(s.unsupported,false);assert.deepEqual(s.clock,{timeOrigin:1000,crossOriginIsolated:false});assert(!JSON.stringify(s).includes('secret'));probe.restore();
});
test('native rejection and synchronous throw retain exact original errors without logging content',async()=>{
 const error=Error('PRIVATE_FAILURE'),promise=Promise.reject(error);let sync=false;const scope=setup(()=>{if(sync)throw error;return promise;}),probe=installWorkerAPIProbe(scope,{tabId:9});probe.reset('reject');assert.equal(call(scope,'tabs.get'),promise);await assert.rejects(promise,e=>e===error);await Promise.resolve();assert.equal(probe.snapshot().rows[0].ok,false);probe.reset('throw');sync=true;assert.throws(()=>call(scope,'tabs.get'),e=>e===error);assert.equal(probe.snapshot().rows[0].ok,false);assert(!JSON.stringify(probe.snapshot()).includes('PRIVATE_FAILURE'));probe.restore();
});
test('foreign tab calls and unarmed calls forward unchanged without observation',async()=>{
 let calls=0;const p=Promise.resolve(),scope=setup(()=>{calls++;return p;}),probe=installWorkerAPIProbe(scope,{tabId:9});assert.equal(call(scope,'tabs.get'),p);probe.reset('owned');assert.equal(call(scope,'tabs.get',[99]),p);assert.equal(call(scope,'debugger.sendCommand',[{tabId:99},'DOM.getDocument',{}]),p);assert.equal(call(scope,'scripting.executeScript',[{target:{tabId:99}}]),p);await p;assert.equal(calls,4);assert.equal(probe.snapshot().rows.length,0);probe.restore();
});
test('target accessors are forwarded untouched and invalidate unsupported observation without getter execution',async()=>{
 let calls=0,reads=0;const promise=Promise.resolve(),scope=setup(()=>{calls++;return promise;}),probe=installWorkerAPIProbe(scope,{tabId:9});probe.reset('accessor');
 const debug={get tabId(){reads++;throw Error('target getter touched');}},script={get target(){reads++;throw Error('target getter touched');}},nested={target:{get tabId(){reads++;throw Error('target getter touched');}}};
 assert.equal(call(scope,'debugger.sendCommand',[debug,'DOM.getDocument',{}]),promise);assert.equal(call(scope,'scripting.executeScript',[script]),promise);assert.equal(call(scope,'scripting.executeScript',[nested]),promise);await promise;assert.equal(calls,3);assert.equal(reads,0);assert.equal(probe.snapshot().rows.length,0);assert.equal(probe.snapshot().unsupported,true);probe.restore();
});
test('callback and thenable results forward but invalidate trace without invoking then getters',()=>{
 const thenable={get then(){throw Error('then getter touched');}},scope=setup(()=>thenable),probe=installWorkerAPIProbe(scope,{tabId:9});probe.reset('thenable');assert.equal(call(scope,'tabs.get'),thenable);assert.equal(probe.snapshot().unsupported,true);assert.equal(probe.snapshot().rows[0].supported,false);probe.restore();let callbackCalls=0;const cb=()=>{callbackCalls++;},c=setup(function(...args){assert.equal(args[1],cb);return undefined;}),p=installWorkerAPIProbe(c,{tabId:9});p.reset('callback');assert.equal(call(c,'tabs.get',[9,cb]),undefined);assert.equal(callbackCalls,0);assert.equal(p.snapshot().unsupported,true);p.restore();
});
test('unlisted native method is never logged and cannot become an accepted phase',async()=>{
 const scope=setup(),probe=installWorkerAPIProbe(scope,{tabId:9});probe.reset('native');await call(scope,'debugger.sendCommand',[{tabId:9},'PRIVATE_INVALID_METHOD',{}]);await Promise.resolve();const s=probe.snapshot();assert.equal(s.unsupported,true);assert.equal(s.rows[0].method,null);assert(!JSON.stringify(s).includes('PRIVATE_INVALID_METHOD'));probe.restore();
});
test('cap/pending/reset/restore and copied snapshots cannot manufacture a complete trace',async()=>{
 let resolve;const p=new Promise(r=>resolve=r);let calls=0;const scope=setup(()=>{calls++;return p;}),probe=installWorkerAPIProbe(scope,{tabId:9,limit:2});probe.reset('one');for(let i=0;i<3;i++)assert.equal(call(scope,'tabs.get'),p);assert.equal(calls,3);assert.equal(probe.snapshot().overflow,true);assert.equal(probe.snapshot().inflight,3);assert.equal(probe.snapshot().rows.length,2);assert.throws(()=>probe.reset('two'));assert.throws(()=>probe.restore());resolve();await p;await Promise.resolve();const copy=probe.snapshot();copy.rows[0].ok=false;assert.equal(probe.snapshot().rows[0].ok,true);probe.reset('two');assert.equal(probe.snapshot().overflow,false);assert.equal(probe.snapshot().rows.length,0);probe.restore();
});
test('invalid config refuses before mutation, partial installation rolls back and external replacement is retained',()=>{
 for(const options of [{},{tabId:0},{tabId:9,limit:0},{tabId:9,limit:2049}]){const scope=setup(),original=scope.chrome.tabs.get;assert.throws(()=>installWorkerAPIProbe(scope,options));assert.equal(scope.chrome.tabs.get,original);}
 const scope=setup(),original=scope.chrome.debugger.sendCommand;Object.defineProperty(scope.chrome.permissions,'contains',{writable:false});assert.throws(()=>installWorkerAPIProbe(scope,{tabId:9}));assert.equal(scope.chrome.debugger.sendCommand,original);
 const other=setup(),probe=installWorkerAPIProbe(other,{tabId:9}),foreign=()=>Promise.resolve();other.chrome.tabs.get=foreign;assert.throws(()=>probe.restore());assert.equal(other.chrome.tabs.get,foreign);
});
