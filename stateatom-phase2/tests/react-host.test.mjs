// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import vm from 'node:vm';
import {instrumentScript,stateatomPlugin} from '../engine/plugin.mjs';
import {transformReactVendor,vendorHashes,makeReactHostProbe} from '../engine/react-host-vendor.mjs';
import {root} from '../../scripts/vite-config.mjs';
import {transformSync} from 'esbuild';
test('host lowering preserves existing compiler support for namespaced SVG attributes',()=>{
 const source=`import React from 'react'; const x=<svg><use xlink:href="#shape"/></svg>;`;
 const baseline=transformSync(source,{loader:'jsx',jsxFactory:'React.createElement'}).code;
 assert(baseline.includes('"xlink:href"'));
 const observed=instrumentScript(source,'Svg.jsx',{reactHostProps:true}).code;
 assert(transformSync(observed,{loader:'jsx'}).code.includes('"xlink:href"'));
});
test('vendor source identity and native site counts guard every transformed input',()=>{
 const contract=makeReactHostProbe(root);assert.equal(contract.contract.status,'Observed');
 for(const file of Object.keys(vendorHashes)){const src=readFileSync(root+'/node_modules/'+file,'utf8'),r=transformReactVendor(src,file);assert(r.code.includes('react18-final-host-props/1'));assert(r.code.includes('Copyright (c) Facebook'));assert(r.outputBytes>0);assert.throws(()=>transformReactVendor(src+'\n',file),/digest mismatch/);}
});
test('host transform wraps every eligible generated callee including nested hosts without injecting refs',()=>{
 const src=`import React from'react';import{createRoot}from'react-dom/client';createRoot(c).render(<main><span>{1}</span><button disabled={false}>OK</button><p ref={r}>{2}</p><p {...props}>{3}</p></main>);`;
 const r=instrumentScript(src,'App.tsx',{reactHostProps:true});assert.equal((r.code.match(/__sa.reactFactory\(/g)||[]).length,4);assert(!r.code.includes('__sa.reactRef'));assert(r.unsupported.some(n=>n.reason.includes('JSX spread')));
});
test('native factory taps preserve getter count return element ref and exact original error',()=>{
 const source=readFileSync(root+'/node_modules/react/cjs/react.development.js','utf8'),code=transformReactVendor(source,'react/cjs/react.development.js').code;
 function load(text,telemetry){const module={exports:{}};const context={module,exports:module.exports,process:{env:{NODE_ENV:'development'}},console,__STATEATOM__:{reactHostTap:telemetry},setTimeout,clearTimeout};context.globalThis=context;vm.runInNewContext(text,context);return module.exports;}
 const baseline=load(source,()=>{}),events=[],observed=load(code,(kind)=>{events.push(kind);});
 for(const React of[baseline,observed]){let count=0;const config={get disabled(){count++;return false;}};const element=React.createElement('button',config,'OK');assert.equal(count,1);assert.equal(element.props.disabled,false);assert.equal(element.ref,null);const error={original:true};assert.throws(()=>React.createElement('button',{get disabled(){throw error;}}),e=>e===error);}
 assert.equal(events.filter(e=>e==='factory-enter').length,2);assert.equal(events.filter(e=>e==='factory-exit').length,2);
 // Optional telemetry failures cannot turn a successful app call into an error.
 assert.equal(load(code,()=>{throw Error('telemetry');}).createElement('button',null).ref,null);
});
test('unsupported compiler configuration leaves JSX execution with the original bundler',()=>{
 const p=stateatomPlugin({enabled:true,root:root+'/fixture',reactHostProps:true});p.config({root,esbuild:{jsx:'automatic'}});assert.equal(p.reactHost.contract.status,'Unknown/Unsupported');const code=`import {createElement}from'react';const x=<button disabled={false}/>;`;const out=p.transform(code,root+'/fixture/App.jsx');assert(!out.code.includes('__sa.reactFactory'));assert(out.code.includes('<button'));
});
test('native host taps do not invoke a later replaced descriptor function',()=>{
 const source=readFileSync(root+'/node_modules/react/cjs/react.development.js','utf8'),observed=transformReactVendor(source,'react/cjs/react.development.js').code;
 function calls(text){const module={exports:{}},context=vm.createContext({module,exports:module.exports,process:{env:{NODE_ENV:'development'}},console,__STATEATOM__:{reactHostTap(){}},setTimeout,clearTimeout});vm.runInContext(text,context);vm.runInContext(`globalThis.descriptorCalls=0;const saved=Object.getOwnPropertyDescriptor;Object.getOwnPropertyDescriptor=function(...args){descriptorCalls++;return Reflect.apply(saved,Object,args);};`,context);module.exports.createElement('button',{disabled:false},'OK');return context.descriptorCalls;}
 assert.equal(calls(observed),calls(source));
});
