// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createObserver} from "../src/engine/observer.mjs";
import {makeDiagnostic,parseDiagnostic,serializeDiagnostic} from '../core/diagnostic.mjs';
import {runTelemetryControls} from "../experiments/compiler/telemetry-controls.mjs";
const define=Object.defineProperty,descriptor=Object.getOwnPropertyDescriptor,apply=Reflect.apply;
const originalSet=Set,mapIterator=Object.getPrototypeOf(new Map().keys()),setIterator=Object.getPrototypeOf(new Set().values());
const environment=()=>{class Response extends globalThis.Response{}return{crypto:globalThis.crypto,Response,fetch:()=>Promise.resolve(new Response('{}')),location:{href:'http://127.0.0.1:4173/'}};};
const meta=(kind,extra={})=>({kind,file:'controlled.ts',sourceDigest:'controlled',line:1,column:1,key:kind,expression:kind,...extra});
const changes=[
 ['Date.now',Date,'now'],['Map.set',Map.prototype,'set'],['Map.size',Map.prototype,'size'],['Map.keys',Map.prototype,'keys'],['Map.delete',Map.prototype,'delete'],
 ['Set constructor',globalThis,'Set'],['Set.add',Set.prototype,'add'],['Set iterator',Set.prototype,Symbol.iterator],['Set iterator next',setIterator,'next'],['Map iterator next',mapIterator,'next'],
 ['WeakMap.get',WeakMap.prototype,'get'],['Array.push',Array.prototype,'push'],['Array.pop',Array.prototype,'pop'],['Array.at',Array.prototype,'at'],['Array.slice',Array.prototype,'slice'],['Array.includes',Array.prototype,'includes'],
 ['Number.isFinite',Number,'isFinite'],['String.slice',String.prototype,'slice'],
];
for(const[name,owner,key]of changes)test('telemetry does not call post-bootstrap replacement '+name,()=>{
 const o=createObserver(environment()),scope=o.scope(),data={quota:12},before=descriptor(owner,key);let callbacks=0,userCalls=0,gets=0,result,error;
 const touch=()=>{callbacks++;data.quota=99;};
 const replacement=name==='Set constructor'?function(...args){touch();return new originalSet(...args);}:before.get?function(){touch();return apply(before.get,this,[]);}:function(...args){touch();return apply(before.value,this,args);};
 define(owner,key,{...before,...(before.get?{get:replacement}:{value:replacement})});
 try{
  result=o.capture(meta('binding',{binding:'binding'}),scope,()=>{userCalls++;return o.read(meta('read'),scope,'input',o.member(meta('member'),data,'quota'));});
  o.capture(meta('string'),scope,()=>o.member(meta('member'),{get text(){gets++;return 'hello';}},'text'));
  // Exercise bounded private-map eviction, not only its first set.
  if(name==='Map.delete'||name==='Map.keys'||name==='Map iterator next')for(let i=0;i<2010;i++)o.member(meta('member'),data,'quota');
 }catch(e){error=e;}finally{define(owner,key,before);}
 try{assert.equal(error,undefined);assert.equal(callbacks,0);assert.equal(data.quota,12);assert.equal(result,12);assert.equal(userCalls,1);assert.equal(gets,1);
  if(!['Map.delete','Map.keys','Map iterator next'].includes(name)){o.target(meta('target',{property:'text',target:'t'}),scope,()=>o.read(meta('read'),scope,'binding',12));assert(o.snapshot(scope+':t','text').nodes.some(n=>n.kind==='binding'&&n.value===12));}
 }finally{o.stop();}
});
test('clock accessor is not read after bootstrap',()=>{const o=createObserver(environment()),before=descriptor(Date,'now');let gets=0,value;define(Date,'now',{configurable:true,get(){gets++;throw Error('clock getter');}});try{value=o.member(meta('member'),{quota:12},'quota');}finally{define(Date,'now',before);}try{assert.equal(value,12);assert.equal(gets,0);}finally{o.stop();}});

test('dependency retention is explicit at 81 unique reads and unchanged within the 80 limit',()=>{for(const count of [80,81]){const o=createObserver(environment()),scope=o.scope();o.target(meta('target',{property:'text',target:'t'}),scope,()=>{for(let i=0;i<count;i++)o.member(meta('member'),{quota:i},'quota');return 1;});const s=o.snapshot(scope+':t','text');assert.equal(s.target.deps.length,80);assert.equal(s.missing,count===81);assert.equal(s.target.missingDependencies===true,count===81);if(count===81)assert.match(s.target.boundary,/Dependency retention/);o.stop();}});

test('incomplete dependency observation stays Unknown with its boundary in passive export',()=>{
 const o=createObserver(environment()),scope=o.scope();try{
  o.target(meta('target',{property:'text',target:'t'}),scope,()=>{for(let i=0;i<81;i++)o.member(meta('member'),{quota:i},'quota');return 1;});
  const runtime=o.snapshot(scope+':t','text'),report=parseDiagnostic(serializeDiagnostic(makeDiagnostic({selection:{selector:'#control',property:'text',value:'1'},analysis:{stateatom:{runtime}}},{includeContent:true})));
  assert.equal(report.runtime.status,'Unknown/Unsupported');assert.match(report.runtime.reason,/retention budget/);assert(report.runtime.nodes.some(n=>/Dependency retention/.test(n.boundary)));assert.equal(report.runtime.fullPath,false);
 }finally{o.stop();}
});

test('declared native controls preserve original error identity under every selected replacement',()=>{
 const o=createObserver(environment());try{const results=runTelemetryControls(o);assert.equal(results.length,21);for(const r of results){if(r.name.startsWith('dependency limit'))continue;assert.equal(r.error,null,r.name);assert.equal(r.callbacks,0,r.name);assert.equal(r.userCalls,1,r.name);assert.equal(r.getterCalls,1,r.name);assert.equal(r.errorCalls,1,r.name);assert.equal(r.sameError,true,r.name);assert.equal(r.quota,12,r.name);assert.equal(r.value,12,r.name);if(r.retained!==null)assert.equal(r.retained,true,r.name);}}finally{o.stop();}
});
