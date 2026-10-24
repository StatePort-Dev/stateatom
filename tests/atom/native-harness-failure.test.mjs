// SPDX-License-Identifier: Apache-2.0
// Execute actual helper/driver source with only process/filesystem boundaries
// substituted. No child, browser, display, server, profile or native run.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {EventEmitter} from 'node:events';
import {createHash} from 'node:crypto';
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const hash=value=>createHash('sha256').update(value).digest('hex');
const helper=await readFile('scripts/native-browser.mjs','utf8');
const helperBody=helper.slice(helper.indexOf('export async function startNativeBrowser'),helper.indexOf('export async function nativeChooseTab')).replace('export async function','return async function');
function nativeStarter({synchronous=false,cleanupError=false,successfulSpawn=false}={}){
 const original=Object.assign(Error('spawn refused'),{code:'ENOENT'}),fallback=Error('poll fallback'),events={unhandled:0,logCloses:0,kills:0};
 const child=new EventEmitter();Object.assign(child,{pid:successfulSpawn?123:undefined,exitCode:successfulSpawn?0:null,signalCode:null,kill(){events.kills++;return false;}});
 const bindings={spawn(){if(synchronous)throw original;queueMicrotask(()=>{try{child.emit(successfulSpawn?'spawn':'error',original);}catch{events.unhandled++;}});return child;},mkdir:async()=>{},chromium:{executablePath:()=>'/own/chrome'},existsSync:()=>false,root:'/repo',readdir:async()=>[],path:{resolve:(...p)=>p.join('/')},process:{env:{}},open:async()=>({fd:5,async close(){events.logCloses++;if(cleanupError)throw Error('log close refused');}}),waitFor:async()=>{await Promise.resolve();throw fallback;},readFile:async()=>'',WebSocket:class{},NativeCDP:class{}};
 const start=new AsyncFunction(...Object.keys(bindings),helperBody)(...Object.values(bindings));
 return {original,fallback,events,run:async()=>{const fn=await start;return fn('/own/runtime','case',true,false,[],{extensionPath:'/own/extension'});}};
}
test('native browser asynchronous spawn failure rejects original error and closes owned log',async()=>{
 const x=nativeStarter();await assert.rejects(x.run(),e=>e===x.original);assert.equal(x.events.unhandled,0);assert.equal(x.events.logCloses,1);assert.equal(x.events.kills,0);
});
test('native browser synchronous spawn failure still closes its acquired log',async()=>{
 const x=nativeStarter({synchronous:true});await assert.rejects(x.run(),e=>e===x.original);assert.equal(x.events.logCloses,1);
});
test('native browser cleanup failure cannot replace original startup error',async()=>{
 const x=nativeStarter({cleanupError:true});await assert.rejects(x.run(),e=>e===x.original&&String(e.nativeBrowserCleanupError).includes('log close refused'));assert.equal(x.events.logCloses,1);
});
test('successful native spawn still reaches readiness and retains its failure',async()=>{
 const x=nativeStarter({successfulSpawn:true});await assert.rejects(x.run(),e=>e===x.fallback);assert.equal(x.events.logCloses,1);assert.equal(x.events.unhandled,0);
});

const drivers=['tests/integration/disabled-domain-native.mjs','tests/integration/input-domain-comparison-native.mjs'];
for(const file of drivers)for(const failure of ['case-read','git','input-read'])test(file+' writes terminal failure for initial '+failure,async()=>{
 const source=await readFile(file,'utf8'),writes=new Map(),original=Error('initial '+failure+' refused');let outputCreated=0;
 const engine='engine fixture',scenario={schema:file.includes('disabled-domain')?'stateatom.disabled-domain-case/1':'stateatom.input-domain-comparison-case/1',inputHashes:{'missing-input':'x'},engineHashes:{baseline:hash(engine)},handoffs:{A:'a-kit',B:'b-kit'},protocol:{cases:['A','B','B','A'].map((condition,caseIndex)=>({host:'standalone',condition,caseIndex})).concat(['B','A','A','B'].map((condition,i)=>({host:'embedding',condition,caseIndex:i+4})))}};
 const kits=version=>({package:{version},sourceManifest:{},buildSources:{manifest:{}}});
 const bindings={assert,process:{argv:file.includes('disabled-domain')?['node','driver','baseline','case']:['node','driver','case'],exitCode:0},console:{log(){},error(){}},mkdir:async()=>{outputCreated++;},readFile:async p=>{if(p==='case'){if(failure==='case-read')throw original;return JSON.stringify(scenario);}if(p==='a-kit')return JSON.stringify(kits('0.1.0-candidate.20261021.70'));if(p==='b-kit')return JSON.stringify(kits('0.1.0-candidate.20261021.71'));if(p==='src/engine/browser.mjs')return engine;if(String(p).includes('file:///'))return source;if(p==='tests/fixtures/native-controls/index.html'){if(failure==='input-read')throw original;return 'fixture';}if(p==='missing-input')throw original;return 'bytes';},writeFile:async(p,data)=>{writes.set(p,String(data));},appendFile:async()=>{},execFileSync:()=>{if(failure==='git')throw original;return 'revision';},sha256:hash,os:{platform:()=>'',release:()=>'',arch:()=>'',cpus:()=>[],totalmem:()=>0,freemem:()=>0,loadavg:()=>[]},URL};
 const body=source.replace(/^import .*\n/gm,'').replaceAll('import.meta.url',JSON.stringify('file:///fixture-driver.mjs'));
 await new AsyncFunction(...Object.keys(bindings),body)(...Object.values(bindings));
 assert.equal(outputCreated,1);const terminal=[...writes].find(([path])=>path.endsWith('/results.json'));assert(terminal,'Terminal record attempted');const r=JSON.parse(terminal[1]);assert.equal(r.status,'FAIL');assert(r.errors?.some(e=>e.message===original.message)||r.error?.includes(original.message));assert.equal(bindings.process.exitCode,1);assert.equal(r.initialInventoryComplete,false);
});

for(const cleanupFailure of [false,true])test('comparison finalizer preserves startup error and independently cleans owners'+(cleanupFailure?' after failed desktop cleanup':''),async()=>{
 const source=await readFile(drivers[1],'utf8'),tail=source.slice(source.indexOf('}catch(e){result.status=')),events=[],result={status:'RUNNING'},original=Error('startup refused');let stored;
 const bindings={result,out:'/owned',process:{exitCode:0},console:{error(){},log(){}},panel:null,d:{async close(){events.push('session');}},browser:{context:{async close(){events.push('browser');}}},desktop:{async close(){events.push('desktop');if(cleanupFailure)throw Error('desktop refused');}},server:{close(fn){events.push('server');fn();}},inputs:async()=>({fixed:'hash'}),preregistration:{inputs:{fixed:'hash'}},writeFile:async(_path,value)=>{stored=JSON.parse(value);},original};
 await new AsyncFunction(...Object.keys(bindings),'try{throw original;'+tail)(...Object.values(bindings));assert.deepEqual(events,['session','browser','desktop','server']);assert.equal(stored.status,'FAIL');assert(stored.error.includes('startup refused'));if(cleanupFailure)assert(stored.desktopCleanupError.includes('desktop refused'));
});
