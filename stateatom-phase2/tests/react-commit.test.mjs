// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {transformSync} from 'esbuild';
import {createHash} from 'node:crypto';
import {instrumentScript} from '../engine/plugin.mjs';
import {validateTrace} from '../engine/slice.mjs';
import {matchTarget,isSameSelection} from '../engine/browser.mjs';

test('opt-in commit transform compiles nested JSX and wraps only named React roots',()=>{
 const src=`import React from 'react';import {createRoot as mount}from'react-dom/client';function App(){return <main><span>{12}</span><button disabled={false}>OK</button></main>}const root=mount(container());root.render(<App/>);other.render(<App/>);`;
 const r=instrumentScript(src,'App.tsx',{reactCommit:true});
 transformSync(r.code,{loader:'tsx'});
 assert.equal((r.code.match(/__sa\.reactContainer\(/g)||[]).length,1);
 assert.equal((r.code.match(/__sa\.reactRender\(/g)||[]).length,1);
 assert(r.code.includes('__sa.reactRef()'));
 assert(!instrumentScript(src,'App.tsx').code.includes('reactRender'));
});
test('user refs, spread props, reassigned and loop roots stay outside the supported commit adapter',()=>{
 const src=`import React from 'react';import {createRoot}from'react-dom/client';let r=createRoot(c);r=foreign;r.render(<p ref={original}>{1}</p>);for(let i=0;i<2;i++){const x=createRoot(cs[i]);x.render(<p {...props}>{2}</p>);}`;
 const r=instrumentScript(src,'App.tsx',{reactCommit:true});transformSync(r.code,{loader:'tsx'});
 assert(!r.code.includes('__sa.reactRender('));assert(!r.code.includes('__sa.reactRef('));
 assert.equal(r.unsupported.filter(n=>n.reason.includes('existing ref or JSX spread')).length,2);
});
test('await and yield in JSX remain valid without being moved into a synchronous observer arrow',()=>{
 for(const source of [`import {createRoot}from'react-dom/client';createRoot(c).render(<button title={await Promise.resolve('ok')}>OK</button>);`,`function* f(){return <button title={yield 'ok'}>OK</button>}`]){
  const r=instrumentScript(source,'Async.tsx',{reactCommit:true});transformSync(r.code,{loader:'tsx'});assert(!r.code.includes('__sa.reactElement('));assert(r.unsupported.some(n=>/await|yield/.test(n.reason)));
 }
});
test('commit source digest participates in source validation even when target source is current',()=>{
 const text='const current=1',digest=createHash('sha256').update(text).digest('hex');
 const trace={status:'Observed',nodes:[{file:'App.tsx',sourceDigest:digest}],commit:{status:'Observed',source:{file:'entry.tsx',sourceDigest:'old'}}};
 const r=validateTrace([{file:'App.tsx',text},{file:'entry.tsx',text:'changed'}],trace);
 assert.equal(r.status,'Stale');assert.equal(r.commit.status,'Stale');assert.equal(r.fullPath,false);
});
test('commit correspondence requires the same page marker property and execution, not equal values alone',()=>{
 const observation={property:'disabled',value:false,page:'p',instance:'marker',trace:{page:'p',status:'Observed',target:{id:'t',value:false},commit:{status:'Observed',page:'p',marker:'marker',property:'disabled',value:false,targetId:'t',mechanism:'probe',producer:{status:'Observed'}}}};
 assert.match(matchTarget(observation).trace.commitIdentity,/^Observed:/);
 for(const changes of [{page:'other'},{marker:'other'},{property:'text'},{targetId:'other'}])assert.match(matchTarget({...observation,trace:{...observation.trace,commit:{...observation.trace.commit,...changes}}}).trace.commitIdentity,/^Unknown/);
});
test('selection mutation eligibility rejects another node document property or changed value',()=>{const before={document:'d',node:'n',property:'text',value:'13'};assert(isSameSelection(before,{...before}));for(const after of [null,{...before,node:'copy'},{...before,document:'reload'},{...before,property:'disabled'},{...before,value:'14'}])assert(!isSameSelection(before,after));});
