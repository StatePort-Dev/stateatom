// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {createAppMainPropsObserver} from '../../experiments/react19-reducer/app-main-props-observer.mjs';
import {appElementRetentionPolicy,recordRetentionApp,recordRetentionMain} from '../helpers/app-element-retention-fixture.mjs';
const load=()=>import('../../experiments/react19-reducer/app-element-retaining-observer.mjs');
async function setup(options={}){const m=await load(),p=appElementRetentionPolicy(),o=m.createAppElementRetainingObserver({page:'owned-app-main',enabled:true,policy:p,...options});o.startWindow('case');return {o,p};}
const unknown=s=>{assert.equal(s.status,'Unknown/Unsupported');assert.equal(s.links.length,0);};
test('retaining research mode delegates exact source outputs while holding only App elements',async()=>{
 const {o,p}=await setup(),plain=createAppMainPropsObserver({page:'owned-app-main',policy:p});plain.startWindow('case');
 const a=recordRetentionApp(o,p),b=recordRetentionApp(plain,p),m=recordRetentionMain(o,p,a);recordRetentionMain(plain,p,b);
 assert.deepEqual(o.sealWindow(),plain.sealWindow());assert.equal(o.lookup(m.elements[0]).status,'Observed');
 assert.equal(o.retention().referenceRetention.count,1);assert.equal(o.retention().referenceRetention.limit,64);
 assert.equal(o.retention().referenceRetention.mode,'research-strong-app-elements');assert.equal(o.retention().referenceRetention.reachableGraphBytes,'Unknown/Unsupported');
 assert.equal(o.tap,o.mainInput.tap);assert.equal(o.config,o.appHook.config);assert(Object.isFrozen(o.retention().referenceRetention));
 assert.doesNotMatch(JSON.stringify(o.retention()),/SECRET|dispatch/);
});
for(const kind of ['missing-native','copied-native-props','cloned-main-props','wrong-todos','foreign-filter','incomplete-App','incomplete-Main'])test('retaining mode preserves original refusal: '+kind,async()=>{
 const {o,p}=await setup(),a=recordRetentionApp(o,p,{native:kind!=='missing-native',copy:kind==='copied-native-props',complete:kind!=='incomplete-App'});
 recordRetentionMain(o,p,a,{arg:kind==='cloned-main-props'?{...a.c}:kind==='copied-native-props'?a.element.props:a.c,rows:kind==='wrong-todos'?[...a.rows]:a.rows,receiver:kind==='foreign-filter'?[...a.rows]:a.rows,complete:kind!=='incomplete-Main'});unknown(o.sealWindow().snapshot);
});
test('stop and successful next window release pins; malformed restart leaves current evidence intact',async()=>{
 const {o,p}=await setup();recordRetentionApp(o,p);assert.equal(o.retention().referenceRetention.count,1);assert.equal(o.startWindow(''),null);assert.equal(o.retention().referenceRetention.count,1);
 assert(o.startWindow('next'));assert.equal(o.retention().referenceRetention.count,0);recordRetentionApp(o,p);assert.equal(o.retention().referenceRetention.count,1);o.stop();assert.equal(o.retention().referenceRetention.count,0);unknown(o.snapshot());
});
test('only accepted App config/native event can pin; duplicate invalidation releases existing pins',async()=>{
 const {o,p}=await setup(),a=recordRetentionApp(o,p);assert.equal(o.retention().referenceRetention.count,1);
 o.tap('jsx-element-return',{},a.c);assert.equal(o.retention().invalid,true);assert.equal(o.retention().referenceRetention.count,0);unknown(o.sealWindow().snapshot);
});
test('capacity stays64 and original65th App refusal clears retaining resources',async()=>{
 const {o,p}=await setup();for(let i=0;i<64;i++)recordRetentionApp(o,p);assert.equal(o.retention().referenceRetention.count,64);
 recordRetentionApp(o,p);assert.equal(o.retention().overflow,true);assert.equal(o.retention().referenceRetention.count,0);unknown(o.sealWindow().snapshot);
});
test('off performs no delegated tap/reflection/retention and preserves exact return',async()=>{
 const {o}=await setup({enabled:false});let traps=0;const bad=new Proxy({},{get(){traps++;throw Error('get');},ownKeys(){traps++;throw Error('keys');},getOwnPropertyDescriptor(){traps++;throw Error('desc');}});
 assert.equal(o.tap('jsx-element-return',bad,bad,bad),bad);assert.equal(o.mainInput.tap('unknown',42,bad,bad),42);assert.equal(traps,0);
 const r=o.retention();assert.equal(r.events,0);assert.equal(r.referenceRetention.count,0);assert.equal(r.mainInput.callbackInterval.configInput.events,0);
});
test('metadata proxies are never reflected by retaining config lookup',async()=>{
 const {o}=await setup();let traps=0;const bad=new Proxy({},{get(){traps++;throw Error('get');},ownKeys(){traps++;throw Error('keys');},getOwnPropertyDescriptor(){traps++;throw Error('desc');}});
 assert.equal(o.tap('jsx-element-return',bad,bad,bad),bad);assert.equal(traps,0);assert.equal(o.retention().referenceRetention.count,0);
});
test('captured retaining intrinsics ignore later application replacements',async()=>{
 const {o,p}=await setup(),has=WeakSet.prototype.has,add=WeakSet.prototype.add,push=Array.prototype.push,it=Array.prototype[Symbol.iterator];let calls=0,r;
 try{WeakSet.prototype.has=()=>{calls++;throw Error('has');};WeakSet.prototype.add=()=>{calls++;throw Error('add');};Array.prototype.push=()=>{calls++;throw Error('push');};Array.prototype[Symbol.iterator]=()=>{calls++;throw Error('iter');};const a=recordRetentionApp(o,p);recordRetentionMain(o,p,a);r=o.sealWindow();}
 finally{WeakSet.prototype.has=has;WeakSet.prototype.add=add;Array.prototype.push=push;Array.prototype[Symbol.iterator]=it;}
 assert.equal(calls,0);assert.equal(r.snapshot.status,'Observed');assert.equal(o.retention().referenceRetention.count,1);
});
test('retaining mode never reconstructs a forced unavailable reference or overrides original Unknown',async()=>{
 const m=await load(),Original=globalThis.WeakRef;let unavailable=false,result;
 globalThis.WeakRef=class{constructor(v){this.v=v;}deref(){return unavailable?undefined:this.v;}};
 try{const p=appElementRetentionPolicy(),o=m.createAppElementRetainingObserver({page:'owned-app-main',policy:p}),a=recordRetentionApp(o,p);recordRetentionMain(o,p,a);unavailable=true;result=o.sealWindow();}
 finally{globalThis.WeakRef=Original;}
 unknown(result.snapshot);
});
test('owned Node child demonstrates weak control collection, retention and stop release without App/browser',()=>{
 const r=spawnSync(process.execPath,['--expose-gc','tests/helpers/app-element-retention-gc.mjs'],{encoding:'utf8',timeout:10000});assert.equal(r.status,0,r.stderr);const x=JSON.parse(r.stdout);assert.equal(x.weakControlCollected,true);assert.equal(x.retainedDuringWindow,true);assert.equal(x.releasedAfterStop,true);assert.equal(x.originalApp,false);assert.equal(x.browser,false);assert.equal(x.historicalCauseProven,false);
});

test('Main-local refusal releases App pins even when outer App observer remains valid',async()=>{
 const {o,p}=await setup(),a=recordRetentionApp(o,p);assert.equal(o.retention().referenceRetention.count,1);
 recordRetentionMain(o,p,a,{receiver:[...a.rows]});unknown(o.sealWindow().snapshot);
 assert.equal(o.retention().referenceRetention.count,0);
});
test('delegated array runtime preserves exact thrown error and releases pins on failure',async()=>{
 const {o,p}=await setup();recordRetentionApp(o,p);const error=Error('owned callback failure');let calls=0;
 assert.throws(()=>o.mainInput.arrayRuntime.apply(()=>{calls++;throw error;},undefined,[]),e=>e===error);
 assert.equal(calls,1);assert.equal(o.retention().referenceRetention.count,0);
});
