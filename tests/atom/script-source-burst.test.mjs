// SPDX-License-Identifier: Apache-2.0
// Runtime event burst model, not native guardian or application qualification.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createAtomRuntime} from '../../packages/atom/src/runtime.mjs';
import {createChromePlatform,createDebuggerBroker,createEventHub} from '../../packages/atom/src/platform.mjs';
const tick=()=>new Promise(r=>setImmediate(r));
const message=payload=>({version:1,id:crypto.randomUUID(),session:'source-burst',payload});
async function fixture(t,{legacy=false}={}){
 const origin='http://127.0.0.1:4173',data={'stateport.atom.v1.connections':[{origin,mode:'development',actions:['cache','reload']}]};
 const area={async get(keys){return Object.fromEntries(keys.filter(k=>k in data).map(k=>[k,data[k]]));},async set(v){Object.assign(data,v);}};
 let release,active=0,peak=0,blocked=true;const gate=new Promise(r=>release=r),sources=[],controls=[];
 const api={permissions:{contains:async()=>true},runtime:{id:'test',sendMessage:async()=>{}},storage:{local:area,session:area},
  tabs:{get:async id=>({id,url:origin+'/'}),query:async()=>[],onUpdated:{addListener(){},removeListener(){}}},
  debugger:{attach:async()=>{},detach:async()=>{},sendCommand:async(_,method,params)=>{
   if(method==='Debugger.getScriptSource'){sources.push(params.scriptId);active++;peak=Math.max(peak,active);try{if(blocked)await gate;return{scriptSource:'const original = 1;'};}finally{active--;}}
   controls.push(method);return method==='Page.getFrameTree'?{frameTree:{frame:{id:'frame',loaderId:'loader'}}}:{};
  }},scripting:{executeScript:async()=>[]}};
 const events=createEventHub(),broker=createDebuggerBroker(api.debugger);
 if(legacy){const acquire=broker.acquire.bind(broker);broker.acquire=async options=>{const lease=await acquire(options);delete lease.nativeCommandGuard;return lease;};}
 const platform=createChromePlatform(api,{events,broker}),runtime=createAtomRuntime(platform);
 const emit=(method,params)=>events.emit({type:'debugger',source:{tabId:1},method,params});
 const unblock=()=>{blocked=false;release();};t.after(async()=>{unblock();await runtime.shutdown();});
 await runtime.request(message({op:'attach',tabId:1}));
 emit('Runtime.executionContextCreated',{context:{id:1,uniqueId:'original-context',auxData:{isDefault:true,frameId:'frame'}}});await tick();
 const burst=n=>{for(let i=0;i<n;i++)emit('Debugger.scriptParsed',{scriptId:String(i),executionContextId:1,url:origin+'/src/file'+i+'.js',length:19});};
 return{runtime,platform,data,emit,burst,unblock,sources,controls,get peak(){return peak;}};
}
test('scriptParsed burst bounds source reads while ordinary control commands remain available',async t=>{
 const f=await fixture(t);f.burst(96);for(let i=0;i<20;i++)await tick();
 assert(f.peak>0);assert(f.peak<=4,'source reads must not flood the guardian RPC window: peak '+f.peak);
 await f.platform.chrome.debugger.sendCommand({tabId:1},'Performance.getMetrics');assert(f.controls.includes('Performance.getMetrics'));
 f.unblock();for(let i=0;i<1000&&new Set(f.sources).size<96;i++)await tick();
 assert.equal(new Set(f.sources).size,96,'accepted source reads must drain while the session remains current');
 await f.runtime.shutdown();
});
test('queued source reads cannot enter a replacement navigation run',async t=>{
 const f=await fixture(t);f.burst(96);for(let i=0;i<20;i++)await tick();const before=f.sources.length;
 f.emit('Page.frameNavigated',{frame:{id:'frame',loaderId:'next',url:'http://127.0.0.1:4173/next'}});for(let i=0;i<10;i++)await tick();
 f.unblock();for(let i=0;i<40;i++)await tick();assert(before<=4);assert.equal(f.sources.length,before,'no old queued read sent into new run');
 const s=await f.runtime.request(message({op:'state',tabId:1}));assert.equal(s.sampleBytes,0);
});
test('source burst overflow stays explicit and cannot block detach',async t=>{
 const f=await fixture(t);f.burst(300);for(let i=0;i<30;i++)await tick();
 const s=await f.runtime.request(message({op:'state',tabId:1}));assert(s.events.some(e=>e.error==='Script source read queue budget reached'),'overflow must be retained as an unavailable read');
 await f.runtime.request(message({op:'detach',tabId:1}));f.unblock();for(let i=0;i<30;i++)await tick();assert(f.sources.length<=4);
});
test('custom legacy broker without synchronous guard refuses queued source acquisition only',async t=>{
 const f=await fixture(t,{legacy:true});await assert.rejects(f.platform.readScriptSource(1,'old-script',()=>{}),{code:'SOURCE_READ_UNAVAILABLE'});
 assert.deepEqual(f.sources,[]);await f.platform.chrome.debugger.sendCommand({tabId:1},'Performance.getMetrics');assert(f.controls.includes('Performance.getMetrics'));
});
