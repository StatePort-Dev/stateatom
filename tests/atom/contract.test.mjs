import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Atom public UI compatibility matches its actual peer and shared visual contract',async()=>{
 const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url),'utf8'));
 const atom=await read('../../packages/atom/package.json'),contract=await read('../../packages/atom/contract.json'),ui=await read('../../packages/extension-ui/package.json'),uiContract=await read('../../packages/extension-ui/contract.json');
 assert.equal(contract.uiContract,uiContract.uiContractVersion);
 assert.equal(contract.uiPackage,ui.version);
 assert.equal(atom.peerDependencies['@stateport/extension-ui'],ui.version);
});

test('browser entrypoints import without Chrome or document and expose factories',async()=>{
 const runtime=await import('../../packages/atom/src/runtime.mjs');
 const ui=await import('../../packages/atom/src/ui.mjs');
 assert.equal(typeof runtime.createAtomRuntime,'function');assert.equal(typeof ui.mountAtom,'function');
});
test('exclusive leases refuse another consumer without touching its debugger',async()=>{
 const {createDebuggerBroker}=await import('../../packages/atom/src/platform.mjs');
 const calls=[];const broker=createDebuggerBroker({attach:async()=>calls.push('attach'),detach:async()=>calls.push('detach'),sendCommand:async(_,m)=>calls.push(m)});
 const foreign=await broker.acquire({tabId:7,owner:'other',capabilities:['read']});
 await assert.rejects(broker.acquire({tabId:7,owner:'atom',capabilities:['read']}),{code:'BUSY'});
 await assert.rejects(foreign.command('Network.clearBrowserCache'),{code:'CAPABILITY_DENIED'});
 assert.deepEqual(calls,[]);await foreign.release();
 const atom=await broker.acquire({tabId:7,owner:'atom',capabilities:['read']});await atom.attach();await atom.command('Network.enable');await atom.release();
 assert.deepEqual(calls,['attach','Network.enable','detach']);await assert.rejects(atom.command('Network.enable'),{code:'LEASE_EXPIRED'});
});
test('wire rejects malformed, unknown and mismatched messages before dispatch',async()=>{
 const {validateRequest}=await import('../../packages/atom/src/transport.mjs');
 for(const m of [{},{version:2,id:'x',session:'s',payload:{op:'tabs'}},{version:1,id:'x',session:'s',payload:{op:'eval',tabId:1}},{version:1,id:'x',session:'s',payload:{op:'inspect-selector',tabId:-1,selector:'#x'}}])assert.throws(()=>validateRequest(m),{code:'INVALID_MESSAGE'});
 assert.equal(validateRequest({version:1,id:'x',session:'s',payload:{op:'tabs'}}).payload.op,'tabs');
});

test('scoped storage never reads or writes a neighboring host key',async()=>{
 const {namespacedStorage}=await import('../../packages/atom/src/platform.mjs');
 const data={diagnostics:['host'],'stateport.atom.v1.diagnostics':['atom'],capture:'private'};
 const area={async get(keys){return Object.fromEntries(keys.filter(k=>k in data).map(k=>[k,data[k]]));},async set(v){Object.assign(data,v);}};
 const store=namespacedStorage(area);assert.deepEqual(await store.get('diagnostics'),{diagnostics:['atom']});await store.set({diagnostics:['new']});assert.deepEqual(data.diagnostics,['host']);assert.equal(data.capture,'private');
});
test('client dispose aborts pending work, removes subscriptions, and rejects late replies',async()=>{
 const {createAtomClient}=await import('../../packages/atom/src/transport.mjs');let resolve,signal,removed=0;
 const client=createAtomClient({request(m,o){signal=o.signal;return new Promise(r=>{resolve=()=>r({...m,ok:true,result:42});});},subscribe(){return()=>removed++;}});
 client.subscribe(()=>{});const request=client.request({op:'tabs'});client.dispose();assert.equal(signal.aborted,true);resolve();await assert.rejects(request,{code:'CANCELLED'});assert.equal(removed,1);await assert.rejects(client.request({op:'tabs'}),{code:'DISPOSED'});
});
test('dispatcher authenticates exact host pages and content selection cannot choose another target',async()=>{
 const {createAtomDispatcher}=await import('../../packages/atom/src/transport.mjs');const accepted=[];
 const dispatch=createAtomDispatcher({request:async m=>{accepted.push(m.payload);return{};}},{isTrusted:s=>s.id==='host'&&s.url==='chrome-extension://host/workspace/inspect.html',isSelectionSender:s=>s.id==='host'&&s.frameId===0&&s.tab?.id===7});
 const replies=[];assert.equal(dispatch({hostControl:'reserve',tabId:7},{id:'host',url:'chrome-extension://host/workspace/inspect.html'},r=>replies.push(r)),false);assert.deepEqual(replies,[]);for(const sender of [{id:'host',url:'https://evil.invalid/workspace/inspect.html'},{id:'foreign',url:'chrome-extension://host/workspace/inspect.html'},{id:'host',url:'chrome-extension://host/other.html'}])assert.equal(dispatch({op:'attach',tabId:7},sender,r=>replies.push(r)),false);
 assert.equal(dispatch({op:'selected',tabId:8,selector:'#p1',token:'picker'}, {id:'host',frameId:0,tab:{id:7}},()=>{}),false);
 dispatch({op:'tabs'},{id:'host',url:'chrome-extension://host/workspace/inspect.html'},r=>replies.push(r));await new Promise(r=>setTimeout(r,0));assert.deepEqual(accepted,[{op:'tabs'}]);assert.equal(replies[0].ok,true);dispatch({op:'selected',selector:'#p1',token:'picker',documentId:'forged'},{id:'host',frameId:0,tab:{id:7},documentId:'native-document'},()=>{});await new Promise(r=>setTimeout(r,0));assert.equal(accepted[1].documentId,'native-document');
});
test('release retains exclusivity until a pending native attach settles and detaches it',async()=>{
 const {createDebuggerBroker}=await import('../../packages/atom/src/platform.mjs');let finish;const calls=[];
 const broker=createDebuggerBroker({attach:()=>new Promise(r=>finish=r),detach:async()=>calls.push('detach')});
 const lease=await broker.acquire({tabId:1,owner:'atom',capabilities:['read']});const attaching=lease.attach();const releasing=lease.release();
 await assert.rejects(broker.acquire({tabId:1,owner:'other',capabilities:['read']}),{code:'BUSY'});finish();await Promise.allSettled([attaching,releasing]);assert.deepEqual(calls,['detach']);const other=await broker.acquire({tabId:1,owner:'other',capabilities:['read']});await other.release();
});
