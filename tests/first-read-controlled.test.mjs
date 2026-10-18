// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,symlink,rm,readdir} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('controlled browser ownership cannot be obtained from JSON, clones or browser-shaped declarations',async()=>{
 const module=await import("../src/first-read/controlled-session.mjs");
 assert.equal(typeof module.launchControlledFirstReadBrowser,'function');
 assert.deepEqual(Object.keys(module).sort(),['controlledBrowserView','isOwnedControlledBrowserWitness','launchControlledFirstReadBrowser']);
 const claimed={schema:1,witnessId:'11111111-1111-4111-8111-111111111111',targetId:'TARGET',extensionId:'a'.repeat(32),browserVersion:'Chrome/153.0.0.0',mainFrameId:'FRAME',contextUniqueId:'CONTEXT',startedAt:Date.now(),freshProfile:true,sandbox:true,soleStateAtomExtension:true};
 for(const value of [null,undefined,1,'owned',{},claimed,structuredClone(claimed),Object.freeze({...claimed}),{context:{},worker:{},id:claimed.extensionId}]){
  assert.equal(module.isOwnedControlledBrowserWitness(value),false);
  assert.equal(await module.controlledBrowserView(value),null);
 }
});

test('source-only launcher refuses unsafe/missing built outputs before importing or launching browser tools',async()=>{
 const {launchControlledFirstReadBrowser}=await import("../src/first-read/controlled-session.mjs");
 const temp=await mkdtemp(path.join(os.tmpdir(),'stateatom-controlled-'));
 try{
  await assert.rejects(launchControlledFirstReadBrowser({projectRoot:temp}),/^Error: Controlled first-read browser initialization failed$/);
  assert.deepEqual(await readdir(temp),[]);
  await mkdir(path.join(temp,'dist'));await symlink(path.resolve(import.meta.dirname,'../dist/browser'),path.join(temp,'dist/browser'));
  await assert.rejects(launchControlledFirstReadBrowser({projectRoot:temp}),/^Error: Controlled first-read browser initialization failed$/);
  assert.deepEqual((await readdir(temp)).sort(),['dist']);
 }finally{await rm(temp,{recursive:true,force:true});}
});

test('serialized startup readiness and helper compilation never create controlled browser authority',async()=>{
 const {controlledBrowserView,isOwnedControlledBrowserWitness}=await import("../src/first-read/controlled-session.mjs");
 const claimed={schema:1,witnessId:'11111111-1111-4111-8111-111111111111',targetId:'TARGET',extensionId:'a'.repeat(32),browserVersion:'Chrome/153.0.0.0',mainFrameId:'FRAME',contextUniqueId:'CONTEXT',startedAt:Date.now(),freshProfile:true,sandbox:true,soleStateAtomExtension:true,gate:{helperCompiled:true,delivered:true,contextUniqueId:'CONTEXT'}};
 for(const value of [claimed,structuredClone(claimed),Object.freeze({...claimed,gate:Object.freeze(claimed.gate)}),{...claimed,startedAt:0},Object.freeze({})]){
  assert.equal(isOwnedControlledBrowserWitness(value),false);
  assert.equal(await controlledBrowserView(value),null);
 }
});

// A test-private copy exposes only the production transport functions. The
// production module/API is unchanged; no launcher or witness is issued here.
// Fake protocol replies below exercise bounded cleanup logic, not native facts.
async function transportUnit(){
 const {readFile}=await import('node:fs/promises');
 const source=await readFile(new URL("../src/first-read/controlled-session.mjs",import.meta.url),'utf8');
 return import('data:text/javascript;base64,'+Buffer.from(source+'\nexport {admitPausedScript,observeHelper,contextGate,clearGate,stopTransport};\n').toString('base64'));
}
function transportState({count=0,paused=0,expired=false,failDisable=false}={}){
 const commands=[];
 const s={startedAt:Date.now()-(expired?16*60*1000:0),closed:false,invalid:false,transportStopped:false,transportStop:null,paused:new Map(),transportTasks:new Set(),sourceRequests:0,scriptRequests:count,policyLengths:new Set([1]),policySources:new Set(['x']),mainFrameId:'FRAME',context:{id:1,uniqueId:'CONTEXT',frameId:'FRAME'},revision:1,cdpDetached:false,
  cdp:{send:async(method,params)=>{commands.push({method,params});if(failDisable&&method==='Fetch.disable')throw Error('synthetic native disable failure');return {};},detach:async()=>{commands.push({method:'detach'});}}};
 for(let i=0;i<paused;i++)s.paused.set('held-'+i,{id:'held-'+i,release:null});
 return {s,commands};
}
const pausedEvent=id=>({requestId:id,frameId:'FRAME',resourceType:'Script',request:{url:'http://127.0.0.1:4173/closed-profile/'+ 'a'.repeat(64)+'.js',method:'GET'},responseStatusCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript; charset=utf-8'}]});

test('terminal transport limits deny admission before allocation and bound a burst to one cleanup',async t=>{
 const unit=await transportUnit();
 for(const config of [{paused:8},{count:64},{expired:true}])await t.test(JSON.stringify(config),async()=>{
  const {s,commands}=transportState();unit.contextGate(s);
  if(config.count)s.scriptRequests=config.count;
  if(config.expired)s.startedAt=Date.now()-16*60*1000;
  for(let i=0;i<(config.paused||0);i++)s.paused.set('held-'+i,{id:'held-'+i,release:null});
  const before=s.paused.size,count=s.scriptRequests;
  unit.admitPausedScript(s,pausedEvent('overflow'));
  assert.equal(s.transportStopped,true);assert.equal(s.invalid,true);assert.equal(s.paused.size,before);assert.equal(s.scriptRequests,count);assert.equal(s.transportTasks.size,0);
  const terminal=s.transportStop;assert(terminal instanceof Promise);
  for(let i=0;i<10000;i++){unit.admitPausedScript(s,pausedEvent('later-'+i));unit.observeHelper(s,{scriptId:'later-'+i,executionContextId:1,length:1});}
  assert.strictEqual(s.transportStop,terminal);assert.equal(s.paused.size,before);assert.equal(s.scriptRequests,count);assert.equal(s.sourceRequests,0);assert.equal(s.transportTasks.size,0);
  assert.equal(await terminal,true);assert.equal(s.paused.size,0);
  assert.equal(commands.filter(c=>c.method==='Fetch.disable').length,1);
  assert.equal(commands.filter(c=>c.method==='Fetch.continueRequest').length,before);
  assert.equal(commands.length,before+1);
 });
});

test('terminal transport stop cancels a held gate once; clean navigation can create a fresh gate',async()=>{
 const unit=await transportUnit(),{s,commands}=transportState();
 unit.contextGate(s);const first=s.gate;unit.clearGate(s);
 assert.equal(first.cancelled,true);assert.equal(s.transportStopped,false);assert.equal(s.invalid,false);assert.equal(commands.length,0);
 s.context={id:2,uniqueId:'NEXT',frameId:'FRAME'};s.revision++;unit.contextGate(s);const current=s.gate;
 unit.admitPausedScript(s,pausedEvent('held'));
 assert.equal(s.paused.size,1);assert.equal(s.transportTasks.size,1);assert.equal(s.transportStopped,false);assert.equal(current.delivered,false);
 const stopped=unit.stopTransport(s);assert.strictEqual(unit.stopTransport(s),stopped);assert.equal(current.cancelled,true);assert.equal(s.gate,null);assert.equal(s.invalid,true);
 assert.equal(await stopped,true);await Promise.allSettled([...s.transportTasks]);
 assert.equal(s.paused.size,0);assert.equal(s.transportTasks.size,0);assert.equal(commands.filter(c=>c.method==='Fetch.disable').length,1);assert.equal(commands.filter(c=>c.method==='Fetch.continueRequest').length,1);
 assert(!commands.some(c=>c.method==='Runtime.getIsolateId'));
 assert.equal(unit.isOwnedControlledBrowserWitness(s),false);assert.equal(await unit.controlledBrowserView(s),null);
});

test('failed terminal disable has one bounded detach fallback and never readmits requests',async()=>{
 const unit=await transportUnit(),{s,commands}=transportState({count:64,failDisable:true});unit.contextGate(s);
 unit.admitPausedScript(s,pausedEvent('overflow'));const stopped=s.transportStop;
 assert.equal(await stopped,false);assert.equal(s.cdpDetached,true);
 for(let i=0;i<1000;i++)unit.admitPausedScript(s,pausedEvent('later-'+i));
 assert.strictEqual(unit.stopTransport(s),stopped);assert.equal(s.paused.size,0);assert.equal(s.transportTasks.size,0);assert.equal(s.scriptRequests,64);
 assert.deepEqual(commands.map(c=>c.method),['Fetch.disable','detach']);
});


test('terminal cleanup independently aborts failed releases without recursive stop work',async()=>{
 const unit=await transportUnit(),{s,commands}=transportState();unit.contextGate(s);
 s.paused.set('held',{id:'held',release:null});
 s.cdp.send=async(method,params)=>{commands.push({method,params});if(method!=='Fetch.disable')throw Error('synthetic release failure');return {};};
 const stopped=unit.stopTransport(s);assert.equal(await stopped,false);assert.equal(s.paused.size,0);
 assert.strictEqual(unit.stopTransport(s),stopped);assert.equal(s.transportTasks.size,0);
 assert.deepEqual(commands.map(c=>c.method),['Fetch.continueRequest','Fetch.failRequest','Fetch.disable']);
});
