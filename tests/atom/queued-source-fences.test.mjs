// SPDX-License-Identifier: Apache-2.0
// Actual runtime/platform/broker composition; synthetic native boundary only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createAtomRuntime} from '../../packages/atom/src/runtime.mjs';
import {createChromePlatform,createDebuggerBroker,createEventHub} from '../../packages/atom/src/platform.mjs';

test('same-origin navigation during authority await must fence old source before native dispatch', async () => {
  const tick = () => new Promise(resolve => setImmediate(resolve));
  const origin = 'http://127.0.0.1:4173';
  const data = {'stateport.atom.v1.connections':[{origin,mode:'development',actions:['cache','reload']}]};
  const area = {
    async get(keys) { return Object.fromEntries(keys.filter(key => key in data).map(key => [key,data[key]])); },
    async set(value) { Object.assign(data,value); },
  };
  let hold = false, release;
  const gate = new Promise(resolve => { release = resolve; }), sources = [];
  const api = {
    permissions:{contains:async () => { if (hold) await gate; return true; }},
    runtime:{id:'test',sendMessage:async () => {}},storage:{local:area,session:area},
    tabs:{get:async id => ({id,url:origin+'/'}),query:async () => [],onUpdated:{addListener(){},removeListener(){}}},
    debugger:{attach:async () => {},detach:async () => {},sendCommand:async (_,method,params) => {
      if (method === 'Debugger.getScriptSource') { sources.push(params.scriptId); return {scriptSource:'const x=1;'}; }
      return method === 'Page.getFrameTree' ? {frameTree:{frame:{id:'frame',loaderId:'original'}}} : {};
    }},
    scripting:{executeScript:async () => []},
  };
  const events = createEventHub();
  const platform = createChromePlatform(api,{events,broker:createDebuggerBroker(api.debugger)});
  const runtime = createAtomRuntime(platform);
  const emit = (method,params) => events.emit({type:'debugger',source:{tabId:1},method,params});
  try {
    await runtime.request({version:1,id:'attach',session:'review',payload:{op:'attach',tabId:1}});
    emit('Runtime.executionContextCreated',{context:{id:1,uniqueId:'original',auxData:{isDefault:true,frameId:'frame'}}});
    await tick();
    hold = true;
    emit('Debugger.scriptParsed',{scriptId:'old-run-script',executionContextId:1,url:origin+'/original.js',length:10});
    for(let i=0;i<10;i++) await tick();
    assert.deepEqual(sources,[]);
    emit('Page.frameNavigated',{frame:{id:'frame',loaderId:'next',url:origin+'/next'}});
    for(let i=0;i<10;i++) await tick();
    hold = false;
    release();
    for(let i=0;i<40;i++) await tick();
    const state = await runtime.request({version:1,id:'state',session:'review',payload:{op:'state',tabId:1}});
    assert.equal(state.mainLoaderId,'next');
    assert.equal(state.sampleBytes,0,'post-read fence already prevents stale publication');
    assert.deepEqual(sources,[],'Old run must not reach native getScriptSource after navigation');
  } finally {
    hold = false;
    release();
    await runtime.shutdown();
  }
});

for(const stop of ['cancel','clear','replace'])test('a queued source-map request must not acquire native source after '+stop, async () => {
  const tick = () => new Promise(resolve => setImmediate(resolve));
  const origin = 'http://127.0.0.1:4173';
  const data = {'stateport.atom.v1.connections':[{origin,mode:'read-only',actions:[]}]};
  const area = {
    async get(keys) { return Object.fromEntries(keys.filter(key => key in data).map(key => [key,data[key]])); },
    async set(value) { Object.assign(data,value); },
  };
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const nativeReads = [];
  const api = {
    permissions:{contains:async () => true},
    runtime:{id:'test',sendMessage:async () => {}},storage:{local:area,session:area},
    tabs:{get:async id => ({id,url:origin+'/'}),query:async () => [],onUpdated:{addListener(){},removeListener(){}}},
    debugger:{attach:async () => {},detach:async () => {},sendCommand:async (_,method,params) => {
      if (method === 'Debugger.getScriptSource') {
        nativeReads.push(params.scriptId);
        await gate;
        return {scriptSource:'const x=1;'};
      }
      return method === 'Page.getFrameTree' ? {frameTree:{frame:{id:'frame',loaderId:'loader'}}} : {};
    }},
    scripting:{executeScript:async () => []},
  };
  const events = createEventHub(), broker = createDebuggerBroker(api.debugger);
  broker.sourceParsing = {configured:true,available:true,run:async () => { throw Error('Cancelled import must not parse'); }};
  const platform = createChromePlatform(api,{events,broker}), runtime = createAtomRuntime(platform);
  const call = (id,payload,signal) => runtime.request({version:1,id,session:'review',payload:{tabId:1,...payload}},{signal});
  try {
    await call('attach',{op:'attach'});
    // Read-only attachment inventories scripts without background body reads.
    for(let i=1;i<=6;i++) events.emit({type:'debugger',source:{tabId:1},method:'Debugger.scriptParsed',params:{
      scriptId:String(i),url:origin+'/'+i+'.js',executionContextId:1,length:10,startLine:0,startColumn:0,
    }});
    for(let i=0;i<10;i++) await tick();
    assert.deepEqual(nativeReads,[]);
    const controller = new AbortController();
    const requests = [];
    for(let i=1;i<=5;i++) {
      requests.push(call('map'+i,{op:'source-map-import',scriptId:String(i),name:'app.map',data:btoa('{}')},
        i===5 ? controller.signal : undefined).catch(error => error.code || error.message));
      for(let j=0;j<10;j++) await tick();
    }
    assert.deepEqual(nativeReads,['1','2','3','4']);
    let replacement;
    if(stop==='cancel')controller.abort();
    else if(stop==='clear')await call('clear',{op:'source-map-clear'});
    else replacement=call('replacement',{op:'source-map-import',scriptId:'6',name:'app.map',data:btoa('{}')}).catch(error=>error.code||error.message);
    assert.equal(await requests[4],'CANCELLED');
    release();
    await Promise.all([...requests,replacement]);
    // shutdown waits for the underlying cancelled job, not merely Promise.race.
    await runtime.shutdown();
    assert.deepEqual(nativeReads,stop==='replace'?['1','2','3','4','6']:['1','2','3','4'], 'Cancelled/replaced queue entry must not dispatch Debugger.getScriptSource');
  } finally {
    release();
    await runtime.shutdown();
  }
});
