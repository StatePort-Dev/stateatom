// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {isDevelopmentOrigin,isBridgeURL,operationPolicy} from '../../packages/atom/src/capabilities.mjs';
import {createChromePlatform,createDebuggerBroker,createEventHub} from '../../packages/atom/src/platform.mjs';
const all=['read','inject','cache','reload','override','replay'];
function fixture(){
 let url='http://localhost:53001/app',permission=true,attachHook=async()=>{},acquireHook=async()=>{},permissionHook=null;const calls=[],data={};
 const area={get:async ks=>Object.fromEntries(ks.filter(k=>k in data).map(k=>[k,data[k]])),set:async v=>Object.assign(data,structuredClone(v))};
 const api={runtime:{id:'test',sendMessage:async()=>{}},storage:{local:area,session:area},permissions:{contains:async()=>permissionHook?await permissionHook():permission},tabs:{get:async id=>({id,url}),query:async()=>[],reload:async()=>calls.push('reload'),sendMessage:async()=>{},onUpdated:{}},debugger:{attach:async()=>{calls.push('attach');await attachHook();},detach:async()=>calls.push('detach'),sendCommand:async(_,m)=>{calls.push(m);return m==='Page.getFrameTree'?{frameTree:{frame:{id:'frame'}}}:{};}},scripting:{executeScript:async()=>{calls.push('inject');return[];}}};
 const events=createEventHub(),nativeBroker=createDebuggerBroker(api.debugger),broker={...nativeBroker,acquire:async o=>{await acquireHook();return nativeBroker.acquire(o);}},platform=createChromePlatform(api,{events,broker,readOnlySites:true});
 return{platform,events,calls,setURL:v=>url=v,setPermission:v=>permission=v,onAttach:fn=>attachHook=fn,onAcquire:fn=>acquireHook=fn,onPermission:fn=>permissionHook=fn};
}
test('ordinary loopback ports accepted; lookalikes and URL tricks rejected',()=>{
 for(const origin of ['http://localhost:53001','http://127.0.0.1:3000','http://[::1]:5173'])assert(isDevelopmentOrigin(origin),origin);
 for(const origin of ['http://localhost.evil:3000','http://127.0.0.2:3000','http://2130706433:3000','http://user@localhost:3000','file:///tmp/app','http://localhost:0'])assert.equal(isDevelopmentOrigin(origin),false,origin);
 assert(isBridgeURL('http://127.0.0.1:53009'));
 for(const value of ['http://localhost:47731','http://127.0.0.1:47731/','http://127.0.0.1:47731?x','http://127.0.0.1.evil:47731','http://127.0.0.1:0'])assert.equal(isBridgeURL(value),false,value);
});
test('localhost defaults to editing without cache/storage authority',async()=>{
 const f=fixture();try{const facts=await f.platform.describeTarget(1);assert.deepEqual(facts.grants,['read','inject','override','replay']);assert.equal(facts.readOnly,false);await assert.rejects(f.platform.authorize(1,'cache'),{code:'CAPABILITY_DENIED'});assert(!f.calls.length);}finally{await f.platform.shutdown();}
});
test('exact project records isolate two ports and keep source separate; HTTPS cannot become development',async()=>{
 const f=fixture();try{await f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'development',actions:['cache','reload']});assert((await f.platform.describeTarget(1)).grants.includes('cache'));assert.equal((await f.platform.describeTarget(1)).connection.source,null);
 f.setURL('http://localhost:53002/app');assert.deepEqual((await f.platform.describeTarget(2)).grants,['read','inject','override','replay']);
 f.setURL('https://example.invalid/');await assert.rejects(f.platform.connectSite(2,{origin:'https://example.invalid',mode:'development',actions:['cache']}),{code:'INVALID_CONNECTION'});
 f.setURL('http://custom.invalid:3000/');assert.equal((await f.platform.describeTarget(2)).siteApproved,false);await f.platform.connectSite(2,{origin:'http://custom.invalid:3000',mode:'development',actions:['cache']});assert.equal((await f.platform.describeTarget(2)).siteApproved,true);
 }finally{await f.platform.shutdown();}
});
test('navigation during attach cannot retain or reuse old authority, including returning to the origin',async()=>{
 const f=fixture();try{await f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'development',actions:all.slice(2)});f.onAttach(async()=>f.setURL('http://localhost:53002/app'));
 await assert.rejects(f.platform.chrome.debugger.attach({tabId:1}),{code:'ORIGIN_DENIED'});assert(f.calls.includes('detach'));f.setURL('http://localhost:53001/app');await assert.rejects(f.platform.chrome.debugger.sendCommand({tabId:1},'Network.clearBrowserCache'));assert(!f.calls.includes('Network.clearBrowserCache'));
 }finally{await f.platform.shutdown();}
});
test('revocation invalidates cached lease before commands and removes the site approval',async()=>{
 const f=fixture();try{await f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'development',actions:['cache']});await f.platform.chrome.debugger.attach({tabId:1});f.setPermission(false);await assert.rejects(f.platform.chrome.debugger.sendCommand({tabId:1},'Network.clearBrowserCache'),{code:'ORIGIN_DENIED'});f.setPermission(true);assert.deepEqual((await f.platform.describeTarget(1)).grants,['read','inject','override','replay']);assert(!f.calls.includes('Network.clearBrowserCache'));
 }finally{await f.platform.shutdown();}
});
test('source navigation is a separate read-only development authorization; production stays denied',()=>{
 const c={url:'http://localhost:3000',permission:true,lease:'none',grants:['read','inject'],readOnly:true,sourceConnected:true};assert.equal(operationPolicy('open',c).available,true);assert.equal(operationPolicy('restore',c).available,false);assert.equal(operationPolicy('open',{...c,url:'https://prod.invalid',readOnlySites:true}).available,false);
});
test('delayed command after a browser permission change cannot return private code',async()=>{
 const f=fixture();try{await f.platform.chrome.debugger.attach({tabId:1});f.setPermission(false);await assert.rejects(f.platform.chrome.debugger.sendCommand({tabId:1},'Debugger.getScriptSource',{scriptId:'1'}),{code:'ORIGIN_DENIED'});assert(!f.calls.includes('Debugger.getScriptSource'));}finally{await f.platform.shutdown();}
});
test('permissions removal deletes session grants and releases every owned target',async()=>{
 const f=fixture();try{await f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'development',actions:['cache']});await f.platform.chrome.debugger.attach({tabId:1});await f.platform.permissionsRemoved();assert.equal(f.platform.owns(1),false);assert.deepEqual((await f.platform.describeTarget(1)).grants,['read','inject','override','replay']);}finally{await f.platform.shutdown();}
});
test('denied access clears retained private data even for a Basic reservation without attach origin',async()=>{
 const {createAtomRuntime}=await import('../../packages/atom/src/runtime.mjs');const f=fixture();
 await f.platform.chrome.storage.session.set({tabs:{1:{run:'old',attached:false,requests:[],pending:{},samples:[],sampleEntries:{},events:[],selection:{selector:'#target',property:'text',value:'private'},analysis:{sources:[{file:'private.js'}]}}}});f.setPermission(false);
 const runtime=createAtomRuntime(f.platform,{readOnlySites:true});try{const s=await runtime.request({version:1,id:'private-state',session:'origin-policy',payload:{op:'state',tabId:1}});assert.equal(s.analysis,null);assert.equal(s.selection,null);}finally{await runtime.shutdown();}
});
test('candidate listing exposes custom HTTP for explicit approval without granting inspection',async()=>{
 const {createAtomRuntime}=await import('../../packages/atom/src/runtime.mjs');const f=fixture();f.platform.chrome.tabs.query=async()=>[{id:1,url:'http://project.test:3000/'}];f.setURL('http://project.test:3000/');const runtime=createAtomRuntime(f.platform,{readOnlySites:true});
 try{const request=payload=>runtime.request({version:1,id:crypto.randomUUID(),session:'candidates',payload});assert.equal((await request({op:'tabs'})).length,1);assert.equal((await request({op:'capabilities',tabId:1})).operations.attach.available,false);}finally{await runtime.shutdown();}
});
test('a default host cannot opt into HTTPS by submitting a connection record alone',async()=>{
 const f=fixture();f.setURL('https://example.invalid/');const defaultPlatform=createChromePlatform({...f.platform.chrome,permissions:{contains:async()=>true}},{events:createEventHub(),broker:createDebuggerBroker(f.platform.chrome.debugger)});
 try{await assert.rejects(defaultPlatform.connectSite(1,{origin:'https://example.invalid',mode:'read-only',actions:[]}),{code:'ORIGIN_DENIED'});}finally{await defaultPlatform.shutdown();await f.platform.shutdown();}
});
test('native picker uses the current owned document on development ports, without page listeners',async()=>{
 const {createAtomRuntime}=await import('../../packages/atom/src/runtime.mjs');const f=fixture();await f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'development',actions:['cache']});const native=f.platform.chrome.debugger.sendCommand;f.platform.chrome.debugger.sendCommand=async(t,m,p)=>m==='DOM.getDocument'?{root:{nodeId:1,backendNodeId:101,nodeType:9,children:[]}}:native(t,m,p);
 const runtime=createAtomRuntime(f.platform,{readOnlySites:true});try{await runtime.request({version:1,id:'attach-current-document',session:'origin-policy',payload:{op:'attach',tabId:1}});await runtime.request({version:1,id:'pick-current-document',session:'origin-policy',payload:{op:'pick',tabId:1}});assert(f.calls.includes('Overlay.setInspectMode'));assert(!f.calls.includes('inject'));}finally{await runtime.shutdown();}
});
const envelope=payload=>({version:1,id:crypto.randomUUID(),session:'f02-review',payload});
test('review: approved custom HTTP development mode survives a same-origin reload',async()=>{
 const {createAtomRuntime}=await import('../../packages/atom/src/runtime.mjs');const f=fixture();f.setURL('http://project.test:3000/');await f.platform.connectSite(1,{origin:'http://project.test:3000',mode:'development',actions:['cache','reload','override','replay']});const runtime=createAtomRuntime(f.platform,{readOnlySites:true});try{await runtime.request(envelope({op:'attach',tabId:1}));f.events.emit({type:'debugger',source:{tabId:1},method:'Page.frameNavigated',params:{frame:{id:'frame',loaderId:'new',url:'http://project.test:3000/reload'}}});await new Promise(r=>setTimeout(r,0));assert.equal((await runtime.request(envelope({op:'state',tabId:1}))).readOnly,false);}finally{await runtime.shutdown();}
});
test('review: authority loss clears private stale action bindings and full trial buffers',async()=>{
 const {createAtomRuntime}=await import('../../packages/atom/src/runtime.mjs');const f=fixture();await f.platform.chrome.storage.session.set({tabs:{1:{run:'old',origin:'http://localhost:53001',requests:[],pending:{},samples:[],sampleEntries:{},events:[],selection:{selector:'#target',property:'text',value:'PRIVATE_VALUE'},analysis:{actionBindings:[{binding:{expression:'PRIVATE_SOURCE'}}]},deepExperiment:{trials:[{body:'PRIVATE_TRIAL'}]},lastOverride:{actual:'PRIVATE_RESPONSE'}}}});const runtime=createAtomRuntime(f.platform,{readOnlySites:true});try{await runtime.ready;f.setPermission(false);const s=await runtime.request(envelope({op:'state',tabId:1}));assert(!JSON.stringify(s).includes('PRIVATE_'));}finally{await runtime.shutdown();}
});
test('review: pending broker acquisition cannot inherit a replacement connection identity',async()=>{
 const f=fixture();try{await f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'development',actions:['cache']});let release,started;const begun=new Promise(r=>started=r);f.onAcquire(()=>{started();return new Promise(r=>release=r);});const pending=f.platform.authorize(1,'cache').then(()=>true,e=>e.code);await begun;await f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'read-only',actions:[]});release();assert.equal(await pending,'ORIGIN_DENIED');assert(!f.calls.includes('Network.clearBrowserCache'));}finally{await f.platform.shutdown();}
});
test('review: pending connection approval cannot restore grants after permission removal',async()=>{
 const f=fixture();try{let release,started;const begun=new Promise(r=>started=r);f.onPermission(()=>{started();return new Promise(r=>release=r);});const pending=f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'development',actions:['cache']}).then(()=>true,e=>e.code);await begun;await f.platform.permissionsRemoved();f.onPermission(null);release(true);assert.equal(await pending,'ORIGIN_DENIED');assert.deepEqual((await f.platform.describeTarget(1)).grants,['read','inject','override','replay']);}finally{await f.platform.shutdown();}
});
test('review: platform HTTPS opt-in alone cannot bypass default runtime opt-in',async()=>{
 const {createAtomRuntime}=await import('../../packages/atom/src/runtime.mjs');const f=fixture();f.setURL('https://example.invalid/');const runtime=createAtomRuntime(f.platform);try{const p=await runtime.request(envelope({op:'capabilities',tabId:1}));assert.equal(p.operations.attach.available,false);}finally{await runtime.shutdown();}
});
test('local development has editing grants without a site-permissions checklist; HTTPS does not',async()=>{
 const f=fixture();try{let c=await f.platform.describeTarget(1);assert.equal(c.readOnly,false);assert(c.grants.includes('override'));assert(c.grants.includes('replay'));assert(!c.grants.includes('cache'));assert(!c.grants.includes('reload'));f.setURL('https://app.invalid/');c=await f.platform.describeTarget(1);assert.equal(c.readOnly,true);assert.deepEqual(c.grants,['read','inject']);assert.equal(f.calls.length,0);}finally{await f.platform.shutdown();}
});
test('ordinary dev attach works without cache grants and leaves cache/storage alone',async()=>{
 const {createAtomRuntime}=await import('../../packages/atom/src/runtime.mjs'),f=fixture();await f.platform.connectSite(1,{origin:'http://localhost:53001',mode:'development',actions:['override','replay']});const runtime=createAtomRuntime(f.platform,{readOnlySites:true});try{await runtime.request(envelope({op:'attach',tabId:1}));assert.equal((await runtime.request(envelope({op:'state',tabId:1}))).attached,true);assert(!f.calls.some(c=>/Cache|Storage|reload/.test(c)));}finally{await runtime.shutdown();}
});
