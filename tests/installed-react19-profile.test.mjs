// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {stateatomPlugin} from '../src/engine/vite-install.mjs';
import {stateatomPlugin as sourcePlugin} from '../src/engine/plugin.mjs';
import * as profiles from '../src/engine/vite-install-profile.mjs';
const profile='react19-state-ancestors';
test('React19 ancestor profile admits only its explicit Node/Vite/React tuple',()=>{
 const exact={node:'24.19.0',vite:'7.3.7',appVite:'7.3.7',react:'19.2.5',reactDOM:'19.2.5'};
 assert.equal(typeof profiles.assertReact19Profile,'function');
 assert.doesNotThrow(()=>profiles.assertReact19Profile(exact));
 for(const patch of[{node:'18.18.2'},{vite:'7.3.8'},{appVite:'4.4.9'},{react:'18.3.1'},{reactDOM:'19.2.4'},{react:undefined}])assert.throws(()=>profiles.assertReact19Profile({...exact,...patch}),/React19.*24.*7\.3\.7.*19\.2\.5/);
});
for(const flag of['reactCommit','reactHostProps','reactStateHandoffs','fetchInitiators','sourceWrites','queryHandoffs','queryCallCensus','writeAccessGuards','queryWriteAccessGuards','reactWriteAccessGuards','actionTrace'])test('React19 ancestor profile refuses mixed legacy option '+flag,()=>{
 assert.throws(()=>stateatomPlugin({enabled:true,profile,[flag]:true}),/React19.*profile.*option/);
});
test('disabled React19 profile is serve-only and does not resolve vendors, inject runtime, or transform app',()=>{
 const p=stateatomPlugin({enabled:false,profile,root:'/missing-react19-app'});
 assert.equal(p.apply,'serve');assert.doesNotThrow(()=>p.configResolved({root:'/missing-react19-app',plugins:[]}));
 assert.equal(p.config({}),undefined);assert.equal(p.transformIndexHtml.handler('<html/>'),undefined);
 assert.equal(p.transform('const x=1','/missing-react19-app/app.jsx'),undefined);
});
test('React19 profile injects the runtime before HTML application entries and preserves automatic JSX',()=>{
 const p=stateatomPlugin({enabled:true,profile,root:'/app'});
 assert.equal(p.transformIndexHtml.order,'pre');
 assert.deepEqual(p.transformIndexHtml.handler('<html/>'),[{tag:'script',attrs:{type:'module',src:'/@stateatom/runtime'},injectTo:'head-prepend'}]);
 const r=p.transform('import React from "react";export const App=()=> <><span>hello</span></>','/app/App.jsx');
 assert.match(r.code,/<span[^>]*>hello<\/span>/);assert.match(r.code,/<.*>/);assert.doesNotMatch(r.code,/React\.createElement|jsxFactory/);
 const runtime=p.load(p.resolveId('/@stateatom/runtime'));
 assert.match(runtime,/react19StateAncestors:true/);assert.match(runtime,/enableReact19Probe/);
 assert.doesNotMatch(runtime,/__STATEATOM_REACT19_TAP__|__R19_EXPERIMENT__/);
 assert.match(runtime,/from '\/@stateatom\/runtime\/react19-acquisition'/);
 assert.equal(typeof p.load(p.resolveId('/@stateatom/runtime/react19-acquisition')),'string');
});
test('explicit React19 profile refuses unpinned vendors instead of silently falling back to React18',()=>{
 const p=stateatomPlugin({enabled:true,profile,root:process.cwd()});
 assert.throws(()=>p.config({root:process.cwd(),esbuild:{jsx:'automatic'}}),/React19.*(19\.2\.5|Unsupported|differs)/);
});
test('default React18 and controlled first-read boundaries retain their old contract',()=>{
 assert.throws(()=>stateatomPlugin({enabled:true,firstReadContracts:true,profile}),/Controlled first-read/);
 const p=sourcePlugin({enabled:true,root:process.cwd(),reactHostProps:true});
 p.config({root:process.cwd(),esbuild:{jsx:'transform',jsxFactory:'React.createElement'}});
 assert.equal(p.reactHost.contract.adapter,'react18-final-host-props/1');assert.equal(p.reactHost.contract.status,'Observed');
 assert.equal(p.transformIndexHtml.handler('<html/>'),undefined);
 assert.doesNotMatch(p.load(p.resolveId('/@stateatom/runtime')),/react19StateAncestors:true/);
});
test('installed React19 version admission reads the resolved app metadata and leaves its automatic compiler intact',async()=>{
 const {mkdtemp,mkdir,writeFile,rm}=await import('node:fs/promises'),root=await mkdtemp('/tmp/atom-react19-profile-');
 try{
  await writeFile(root+'/package.json','{}');
  for(const [name,version]of[['vite','7.3.7'],['react','19.2.5'],['react-dom','19.2.5']]){await mkdir(root+'/node_modules/'+name,{recursive:true});await writeFile(root+'/node_modules/'+name+'/package.json',JSON.stringify({name,version}));}
  const p=stateatomPlugin({enabled:true,profile,root:'/different-root'}),config={root,plugins:[{name:'vite:react-babel'}],esbuild:{jsx:'automatic'}};
  assert.doesNotThrow(()=>p.configResolved(config));assert.equal(config.esbuild.jsx,'automatic');
  await writeFile(root+'/node_modules/react-dom/package.json',JSON.stringify({name:'react-dom',version:'19.2.6'}));
  assert.throws(()=>p.configResolved(config),/React19.*19\.2\.5/);
  // Config still separately requires the real pinned vendor bytes.
  assert.throws(()=>p.config(config),/React19|ENOENT/);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('current virtual React19 source resolves every private field dependency through owned routes',async()=>{
 const {build}=await import('esbuild'),p=stateatomPlugin({enabled:true,profile,root:'/app'}),loaded=[];
 const output=await build({stdin:{contents:"import '/@stateatom/runtime/react19-acquisition';",loader:'js',sourcefile:'virtual-consumer.mjs'},bundle:true,write:false,format:'esm',platform:'browser',plugins:[{name:'owned-virtual-runtime',setup(build){
  build.onResolve({filter:/.*/},args=>{if(args.path.startsWith('/@stateatom/runtime')){assert.equal(typeof p.resolveId(args.path),'string',args.path);return{path:args.path,namespace:'owned'}}if(args.namespace==='owned')throw Error('Unresolved relative runtime import: '+args.path);});
  build.onLoad({filter:/.*/,namespace:'owned'},args=>{loaded.push(args.path);const contents=p.load(p.resolveId(args.path));assert.equal(typeof contents,'string');return{contents,loader:'js'}});
 }}]});
 assert.equal(output.errors.length,0);assert(loaded.includes('/@stateatom/runtime/reducer-write-receipts'));assert(loaded.includes('/@stateatom/runtime/private-collections'));
});
