// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {instrumentScript,stateatomPlugin} from '../engine/plugin.mjs';
import {transformReactVendor} from '../engine/react-host-vendor.mjs';
import {phaseConfig} from '../server.mjs';
import {root} from '../../scripts/vite-config.mjs';

test('state handoff observes only explicitly enabled pinned native sites',()=>{
 const file='react-dom/cjs/react-dom.development.js',source=readFileSync(root+'/node_modules/'+file,'utf8');
 const plain=transformReactVendor(source,file),observed=transformReactVendor(source,file,{reactStateHandoffs:true});
 assert(!plain.code.includes('state-dispatch'));
 for(const kind of ['state-mount','state-dispatch','state-begin','state-applied','state-result'])assert(observed.code.includes(kind),kind);
 assert.equal(observed.counts['state-mount'],1);assert.equal(observed.counts['state-dispatch'],1);assert.equal(observed.counts['state-begin'],1);assert.equal(observed.counts['state-applied'],1);assert.equal(observed.counts['state-result'],2);
});
test('only statically identified React useState array bindings receive source association',()=>{
 const source=`import React,{useState as state} from 'react';function App(){const [a,setA]=state(null);const [b,setB]=React.useState(null);const [c,setC]=other.useState(null);return <p>{a}</p>;}`;
 const observed=instrumentScript(source,'App.tsx',{reactHostProps:true,reactStateHandoffs:true}).code;
 assert.equal((observed.match(/__sa.reactStateResult\(/g)||[]).length,2);
 assert(!instrumentScript(source,'App.tsx',{reactHostProps:true}).code.includes('reactStateResult'));
 assert.throws(()=>instrumentScript(source,'App.tsx',{reactStateHandoffs:true}),/host.*props/i);
});
test('server state handoff option is explicit and requires host/source modes',()=>{
 assert.throws(()=>stateatomPlugin({enabled:true,reactStateHandoffs:true}),/host.*props/i);
 assert.throws(()=>stateatomPlugin({enabled:true,reactHostProps:true,sourceConsumption:false,reactStateHandoffs:true}),/source.*consumption/i);
 assert(phaseConfig('B',{reactHostProps:true,reactStateHandoffs:true}).plugins[1].load('\0stateatom-runtime').includes('reactStateHandoffs:true'));
 assert(phaseConfig('B').plugins[1].load('\0stateatom-runtime').includes('reactStateHandoffs:false'));
});

import {createStateHandoffLedger} from '../engine/react-state.mjs';
function syntheticLedger(){const fibers=new WeakSet(),events=[];const field=(o,k)=>o&&Object.getOwnPropertyDescriptor(o,k)?.value,origins=new WeakMap();let i=0;const ledger=createStateHandoffLedger({page:'synthetic',field,isFiber:v=>fibers.has(v),origin:v=>origins.get(v),weakRef:WeakRef,add:(meta,value)=>{const n={...meta,value,id:'read'+(++i)};events.push(n);return n;}});return{ledger,fibers,origins,events};}
function mount(f){const queue={dispatch(){}},hook={queue,memoizedState:null,next:null},fiber={memoizedState:hook};f.fibers.add(fiber);f.ledger.tap('state-mount',hook,queue,fiber);return{queue,hook,fiber};}
function result(f,h){const r=[h.hook.memoizedState,h.queue.dispatch];f.ledger.tap('state-result',r,h.hook,h.fiber);f.ledger.stage({binding:'data'},'render',r);f.ledger.associate({file:'Fixture.jsx',binding:'data'},'render',r[0],r[1]);return f.events.at(-1);}
test('synthetic control: handoff uses the applied update object instead of the latest equal-valued dispatch',()=>{
 const f=syntheticLedger(),h=mount(f),a={rules:{quota:12}},b={rules:{quota:12}},u={action:a},v={action:b};f.origins.set(a,{exchangeId:'first',consumptionId:'consume1',pointer:''});f.origins.set(b,{exchangeId:'second',consumptionId:'consume2',pointer:''});
 f.ledger.tap('state-dispatch',h.queue,u,h.fiber);f.ledger.tap('state-dispatch',h.queue,v,h.fiber);f.ledger.tap('state-applied',h.hook,u,a);h.hook.memoizedState=a;const read=result(f,h),w=f.ledger.witness([read],new Set([h.fiber]))[0];assert.equal(w.parsedObject.consumptionId,'consume1');assert.equal(w.valueOrigin,'Unknown/Unsupported');assert.equal(f.ledger.witness([read],new Set())[0].status,'Unknown/Unsupported');
});
test('synthetic control: copied update and functional replacement do not inherit parsed-object ancestry',()=>{
 const f=syntheticLedger(),h=mount(f),data={value:12},u={action:data};f.origins.set(data,{consumptionId:'original'});f.ledger.tap('state-dispatch',h.queue,u,h.fiber);f.ledger.tap('state-applied',h.hook,{...u},data);h.hook.memoizedState=data;let read=result(f,h),w=f.ledger.witness([read],new Set([h.fiber]))[0];assert.equal(w.status,'Unknown/Unsupported');assert.equal(w.parsedObject,null);
 const fn={action:()=>data};f.ledger.tap('state-dispatch',h.queue,fn,h.fiber);f.ledger.tap('state-applied',h.hook,fn,data);read=result(f,h);w=f.ledger.witness([read],new Set([h.fiber]))[0];assert.match(w.reason,/Functional/);assert.equal(w.parsedObject,null);
});
test('unbranded custom hook result does not invoke a proxy descriptor trap for telemetry',()=>{
 const f=syntheticLedger();let reads=0;const result=new Proxy([],{getOwnPropertyDescriptor(){reads++;throw Error('app trap');}});f.ledger.stage({binding:'data'},'render',result);f.ledger.associate({file:'Fixture.jsx',binding:'data'},'render',null,()=>{});assert.equal(reads,0);f.ledger.stop();assert.equal(f.ledger.retention().reads,0);
});
test('altered original hook array cannot join a different returned object to the native update',()=>{const f=syntheticLedger(),h=mount(f),a={value:12},b={value:12},u={action:a};f.origins.set(a,{consumptionId:'A'});f.ledger.tap('state-dispatch',h.queue,u,h.fiber);f.ledger.tap('state-applied',h.hook,u,a);h.hook.memoizedState=a;const r=[a,h.queue.dispatch];f.ledger.tap('state-result',r,h.hook,h.fiber);r[0]=b;f.ledger.stage({binding:'data'},'render',r);const read=f.ledger.associate({binding:'data'},'render',r[0],r[1]);assert.equal(f.ledger.witness([read],new Set([h.fiber]))[0].status,'Unknown/Unsupported');});
test('a later unobserved native hook replacement invalidates the earlier handoff witness',()=>{const f=syntheticLedger(),h=mount(f),a={value:12},u={action:a};f.origins.set(a,{consumptionId:'A'});f.ledger.tap('state-dispatch',h.queue,u,h.fiber);f.ledger.tap('state-applied',h.hook,u,a);h.hook.memoizedState=a;const read=result(f,h);h.hook.memoizedState={value:12};assert.equal(f.ledger.witness([read],new Set([h.fiber]))[0].status,'Unknown/Unsupported');});
test('retained identical native hook across a branded alternate is valid, a copied hook is not',()=>{const f=syntheticLedger(),h=mount(f),a={value:12},u={action:a};f.origins.set(a,{consumptionId:'A'});f.ledger.tap('state-dispatch',h.queue,u,h.fiber);f.ledger.tap('state-applied',h.hook,u,a);h.hook.memoizedState=a;const read=result(f,h),alternate={memoizedState:h.hook,alternate:h.fiber};h.fiber.alternate=alternate;f.fibers.add(alternate);assert.equal(f.ledger.witness([read],new Set([alternate]))[0].status,'Observed');alternate.memoizedState={...h.hook};assert.equal(f.ledger.witness([read],new Set([alternate]))[0].status,'Unknown/Unsupported');});
test('later application Object.is replacement is not invoked by state telemetry',()=>{const f=syntheticLedger(),h=mount(f),value={quota:12},update={action:value},original=Object.is;let calls=0;Object.is=(...args)=>{calls++;return original(...args);};try{f.ledger.tap('state-dispatch',h.queue,update,h.fiber);f.ledger.tap('state-applied',h.hook,update,value);h.hook.memoizedState=value;const read=result(f,h);f.ledger.witness([read],new Set([h.fiber]));assert.equal(calls,0);}finally{Object.is=original;}});
