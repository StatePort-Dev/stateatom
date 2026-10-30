// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {requestProjectConnection} from '../../packages/atom/src/project-connect.mjs';
const receipt={schemaVersion:1,helper:{id:'local-research.stateatom-dev-helper',version:'0.1.3',protocol:1,session:'12345678-1234-4234-8234-123456789abc'},workspace:{id:'a'.repeat(64),name:'Demo'},url:'http://127.0.0.1:47731',token:'b'.repeat(64),origin:'http://127.0.0.1:4173',sourceRoot:'.'};
const response=(result=receipt)=>new Response(JSON.stringify({ok:true,result}));
test('direct source request sends only exact page origin, never a source path or existing credential',async()=>{
 let sent;const signal=new AbortController().signal;
 const r=await requestProjectConnection({...receipt,signal,fetchImpl:async(url,options)=>{sent={url,options};return response();}});
 assert.deepEqual(r,receipt);assert.equal(sent.url,receipt.url+'/connect');assert.deepEqual(JSON.parse(sent.options.body),{origin:receipt.origin});assert.equal(sent.options.signal,signal);assert.equal(sent.options.credentials,'omit');assert.equal(sent.options.redirect,'error');assert.equal(sent.options.cache,'no-store');assert.deepEqual(Object.keys(sent.options.headers),['content-type']);
});
test('invalid endpoint or page is rejected before contacting any helper',async()=>{
 let calls=0;for(const patch of [{url:'http://remote.invalid:47731'},{url:receipt.url+'/path'},{origin:'https://example.test'},{origin:receipt.origin+'/path'}])await assert.rejects(requestProjectConnection({...receipt,...patch,fetchImpl:async()=>{calls++;return response();}}));assert.equal(calls,0);
});
test('unavailable and old helpers give recovery text; denied access never returns credentials',async()=>{
 await assert.rejects(requestProjectConnection({...receipt,fetchImpl:async()=>{throw Error('network');}}),/Open this project in VS Code/);
 for(const error of ['Token denied','Operation denied'])await assert.rejects(requestProjectConnection({...receipt,fetchImpl:async()=>new Response(JSON.stringify({ok:false,error}),{status:403})}),/Update the StateAtom IDE helper/);
 await assert.rejects(requestProjectConnection({...receipt,fetchImpl:async()=>new Response(JSON.stringify({ok:false,error:'Source access was not approved.'}),{status:403})}),/not approved/);
});
test('wrong page/helper, failed HTTP response and late cancelled approval cannot become a pair receipt',async()=>{
 for(const patch of[{origin:'http://127.0.0.1:4174'},{url:'http://127.0.0.1:47732'}])await assert.rejects(requestProjectConnection({...receipt,fetchImpl:async()=>response({...receipt,...patch})}),/does not match/);
 await assert.rejects(requestProjectConnection({...receipt,fetchImpl:async()=>new Response(JSON.stringify({ok:true,result:receipt}),{status:403})}));
 const c=new AbortController();await assert.rejects(requestProjectConnection({...receipt,signal:c.signal,fetchImpl:async()=>{c.abort();return response();}}),/cancelled/);
});
