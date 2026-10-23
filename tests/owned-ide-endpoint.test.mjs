// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {connectOwnedIDE} from '../scripts/owned-ide-endpoint.mjs';

const endpoint='ws://127.0.0.1:49331/devtools/browser/03fe7907-ca90-42d5-9f27-a76161bbe5a6';
function scenario(output,{alive=true}={}) {
  const attempts=[],foreign={connections:0},owned={kind:'owned'};
  // A different launcher has acquired the former free port. HTTP discovery now
  // addresses that foreign owner; only the child-specific UUID identifies ours.
  const connect=async url=>{attempts.push(url);if(url===endpoint)return owned;foreign.connections++;return {kind:'foreign'};};
  return {attempts,foreign,owned,options:{connect,readOutput:async()=>output,isRunning:()=>alive,timeout:0}};
}
test('foreign listener appearing after preflight is never adopted without own readiness',async()=>{
  const s=scenario('Installing VSIX...\n');
  await assert.rejects(connectOwnedIDE(s.options),/own.*endpoint/i);
  assert.deepEqual(s.attempts,[]);assert.deepEqual(s.foreign,{connections:0});
});
test('only exact own child WebSocket identity is connected before any UI use',async()=>{
  const s=scenario('Starting own IDE\nDevTools listening on '+endpoint+'\n');
  assert.equal(await connectOwnedIDE(s.options),s.owned);assert.deepEqual(s.attempts,[endpoint]);assert.equal(s.foreign.connections,0);
});
test('dead child cannot authorize a stale debugger readiness line',async()=>{
  const s=scenario('DevTools listening on '+endpoint+'\n',{alive:false});
  await assert.rejects(connectOwnedIDE(s.options),/child.*exited/i);assert.deepEqual(s.attempts,[]);
});
test('nonlocal, wrong port, malformed and multiple readiness endpoints fail closed',async()=>{
  for(const output of[
    'DevTools listening on '+endpoint.replace('127.0.0.1','example.test')+'\n',
    'DevTools listening on '+endpoint.replace(':49331',':49332')+'\n',
    'DevTools listening on ws://127.0.0.1:49331/devtools/browser/not-an-id\n',
    'DevTools listening on '+endpoint+'\nDevTools listening on '+endpoint+'\n',
  ]) {const s=scenario(output);await assert.rejects(connectOwnedIDE(s.options),/endpoint/i);assert.deepEqual(s.attempts,[]);}
});
test('child exit during readiness acquisition refuses before connecting',async()=>{
  const s=scenario(''),options={...s.options};let alive=true;options.isRunning=()=>alive;options.readOutput=async()=>{alive=false;return 'DevTools listening on '+endpoint+'\n';};
  await assert.rejects(connectOwnedIDE(options),/child.*exited/i);assert.deepEqual(s.attempts,[]);
});
test('partial output cannot authorize a debugger connection',async()=>{
  const s=scenario('DevTools listening on '+endpoint);
  await assert.rejects(connectOwnedIDE(s.options),/own.*endpoint/i);assert.deepEqual(s.attempts,[]);
});
test('child exit while connecting detaches only the owned connection before UI use',async()=>{
  let alive=true,closed=0;
  await assert.rejects(connectOwnedIDE({readOutput:async()=> 'DevTools listening on '+endpoint+'\n',isRunning:()=>alive,connect:async url=>{assert.equal(url,endpoint);alive=false;return{close:async()=>{closed++;}};},timeout:0}),/child.*exited/i);
  assert.equal(closed,1);
});
