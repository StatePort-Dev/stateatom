// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
const load=()=>import('../src/engine/list-install.mjs');
test('selected-list installed plugin stays inert by default and only applies to development serve',async()=>{
 const {stateatomSelectedList}=await load();const plugin=stateatomSelectedList();assert.equal(plugin.apply,'serve');assert.equal(plugin.name,'stateatom-selected-list');await plugin.configResolved({root:'/not/an/app'});await plugin.configureServer({});assert.equal(plugin.selectedListSession,null);await plugin.closeBundle();
});
test('enabled selected-list launch refuses absent source configuration before touching a workspace',async()=>{
 const {stateatomSelectedList}=await load();const plugin=stateatomSelectedList({enabled:true});await plugin.configResolved({root:'/not/an/app'});await assert.rejects(plugin.configureServer({}),/source configuration/);await plugin.closeBundle();
});
