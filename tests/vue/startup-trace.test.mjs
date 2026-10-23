// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createViteStartupTrace} from '../helpers/vite-startup-trace.mjs';
const origin='http://127.0.0.1:43121';
test('local outdated response retains status URL and ordering but not headers or request bodies',async()=>{
 const t=createViteStartupTrace({origin,maxEvents:10,maxBytes:10000,readMetadata:async()=>'{"browserHash":"new"}'});
 t.capture('Network.requestWillBeSent',{requestId:'a',timestamp:1,request:{url:origin+'/deps/marked.js?v=old',method:'GET',headers:{Authorization:'private'},postData:'private'}});
 t.capture('Network.responseReceived',{requestId:'a',timestamp:2,response:{url:origin+'/deps/marked.js?v=old',status:504,statusText:'Outdated Optimize Dep',headers:{'Set-Cookie':'private'}}});await t.drain();
 const s=t.snapshot();assert.equal(s.events.length,2);assert.equal(s.events[1].status,504);assert.equal(s.metadata[0].observedAfterSequence,1);assert.equal(s.metadata[0].text,'{"browserHash":"new"}');assert(!JSON.stringify(s).includes('private'));
});
test('owned HMR frames are preserved in sequence and foreign sockets are outside trace scope',()=>{
 const t=createViteStartupTrace({origin,maxEvents:10,maxBytes:10000});
 t.capture('Network.webSocketCreated',{requestId:'ws',url:'ws://127.0.0.1:43121/'});t.capture('Network.webSocketFrameReceived',{requestId:'ws',timestamp:1,response:{opcode:1,payloadData:'{"type":"full-reload","path":"*"}'}});
 t.capture('Network.webSocketCreated',{requestId:'foreign',url:'wss://foreign.test/'});t.capture('Network.webSocketFrameReceived',{requestId:'foreign',response:{opcode:1,payloadData:'private'}});
 assert.deepEqual(t.snapshot().events.map(e=>e.method),['Network.webSocketCreated','Network.webSocketFrameReceived']);assert.match(t.snapshot().events[1].payloadData,/full-reload/);
});
test('trace overflow is explicit rather than a successfully complete truncated trace',()=>{
 const t=createViteStartupTrace({origin,maxEvents:1,maxBytes:10000});for(let i=0;i<2;i++)t.capture('Network.requestWillBeSent',{requestId:String(i),request:{url:origin+'/'+i,method:'GET'}});
 assert.equal(t.snapshot().overflow,true);assert.equal(t.snapshot().dropped,1);
});
test('metadata read failure stays explicit and does not turn into an empty successful snapshot',async()=>{
 const t=createViteStartupTrace({origin,maxEvents:10,maxBytes:10000,readMetadata:async()=>{throw Object.assign(Error('missing'),{code:'ENOENT'});}});
 t.capture('Network.responseReceived',{requestId:'a',response:{url:origin+'/dep.js',status:504,statusText:'Outdated Optimize Dep'}});await t.drain();const m=t.snapshot().metadata[0];assert.equal(m.error.code,'ENOENT');assert.equal(m.text,undefined);
});
test('local navigation and failed local request are visible without changing raw input',()=>{
 const t=createViteStartupTrace({origin,maxEvents:10,maxBytes:10000}),e={requestId:'a',request:{url:origin+'/entry.js',method:'GET'}};const original=structuredClone(e);t.capture('Network.requestWillBeSent',e);t.capture('Network.loadingFailed',{requestId:'a',errorText:'net::ERR_ABORTED',canceled:true});t.capture('Page.frameNavigated',{frame:{id:'frame',loaderId:'load',url:origin+'/text-statistics'}});
 assert.equal(t.snapshot().events.length,3);assert.deepEqual(e,original);assert.equal(t.snapshot().events[1].errorText,'net::ERR_ABORTED');
});
