// SPDX-License-Identifier: Apache-2.0
// Source wrapper with actual pinned vendor bytes; not installed/native app proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {stateatomPlugin} from '../src/engine/vite-install.mjs';

const root=process.cwd(),config=()=>({root,plugins:[],esbuild:{jsx:'transform',jsxFactory:'React.createElement'}});

test('installed wrapper exposes React adapter status after real pinned-source configuration',()=>{
 const plugin=stateatomPlugin({enabled:true,root,reactHostProps:true,reactStateHandoffs:true});
 assert.equal(plugin.reactHost,null);assert.equal(plugin.queryHandoffs,null);
 plugin.config(config());
 assert.equal(plugin.reactHost?.contract.status,'Observed');
 assert.equal(plugin.reactHost.contract.adapter,'react18-final-host-props/1');
 assert.equal(plugin.queryHandoffs,null);
});

test('installed wrapper exposes Query status after configuration without sharing another plugin instance',()=>{
 const plugin=stateatomPlugin({enabled:true,root,queryHandoffs:true}),other=stateatomPlugin({enabled:true,root,queryHandoffs:true});
 assert.equal(plugin.queryHandoffs,null);plugin.config(config());
 assert.equal(plugin.queryHandoffs?.contract.status,'Observed');assert.equal(other.queryHandoffs,null);
 assert.equal(plugin.reactHost,null);other.config(config());assert.equal(other.queryHandoffs?.contract.status,'Observed');
});

test('disabled wrapper retains null statuses and does no vendor resolution',()=>{
 const plugin=stateatomPlugin({enabled:false,root:'/missing-unadmitted-project',reactHostProps:true,queryHandoffs:true});
 assert.equal(plugin.reactHost,null);assert.equal(plugin.queryHandoffs,null);
 assert.equal(plugin.config({root:'/missing-unadmitted-project'}),undefined);
 plugin.configResolved({root:'/missing-unadmitted-project',plugins:[]});
 assert.equal(plugin.reactHost,null);assert.equal(plugin.queryHandoffs,null);
});
