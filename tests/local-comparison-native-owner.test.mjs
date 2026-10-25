// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {comparisonCollectionFixture} from './helpers/comparison-collection-fixture.mjs';
import {parseProcStat,attestComparisonBrowser,retireComparisonProcess,acquireComparisonLease,independentComparisonCleanup,readComparisonProcess} from './helpers/comparison-native-desktop.mjs';
import {collectComparisonConsole,proveComparisonLoadedScript,driveComparisonRows,runComparisonNative} from './integration/local-comparison-native.mjs';

const proc=(pid,ppid,startTime,exe='/bin/source-fixture')=>({pid,ppid,startTime,uid:1000,exe,exeSha256:'a'.repeat(64)});
const owner=()=>({main:proc(20,10,'200','/chrome'),launcher:proc(10,99,'100'),nativePID:99,uid:1000,binary:'/chrome',binarySha256:'a'.repeat(64),processInfo:[{type:'browser',id:20}],product:'Chrome/155.1.2.3',version:'155.1.2.3'});
test('native module imports without CLI/preflight/profile/browser work',()=>assert.equal(typeof runComparisonNative,'function'));
test('actual driver CLI refuses unknown flags before case/profile IO',()=>{const p=spawnSync(process.execPath,['tests/integration/local-comparison-native.mjs','--old-campaign'],{encoding:'utf8'});assert.equal(p.status,1);assert.match(p.stderr,/COMPARISON_NATIVE_ERROR INVALID_ARGUMENTS/);});
test('proc parser handles spaces and closing parentheses in command name',()=>{const fields=['S','9',...Array(17).fill('0'),'1234',...Array(4).fill('0')];assert.deepEqual(parseProcStat('20 (chrome ) task) '+fields.join(' ')),{pid:20,ppid:9,startTime:'1234'});});
test('process identity is current Linux proc evidence, not launch argv',async()=>{const p=await readComparisonProcess(process.pid);assert.equal(p.pid,process.pid);assert.equal(p.uid,process.getuid());assert.match(p.startTime,/^\d+$/);assert.equal(p.exe,await (await import('node:fs/promises')).realpath(process.execPath));assert.match(p.exeSha256,/^[a-f0-9]{64}$/);});
test('browser ownership requires current main PID plus own launcher ancestry',async()=>{const x=owner(),all=new Map([[20,x.main],[10,x.launcher]]);const p=await attestComparisonBrowser(x,{read:async id=>all.get(id)});assert.equal(p.ownerAttested,true);assert.deepEqual(p.parentChain.map(x=>x.pid),[20,10]);});
for(const [label,change]of [
 ['foreign uid',x=>x.main.uid=2000],['foreign binary',x=>x.main.exe='/other'],['changed binary hash',x=>x.main.exeSha256='b'.repeat(64)],['reused launcher',x=>x.launcher.startTime='101'],['foreign parent',x=>x.launcher.ppid=77],['missing browser process',x=>x.processInfo=[]],['multiple browser roots',x=>x.processInfo.push({type:'browser',id:21})],['version mismatch',x=>x.product='Chrome/153.0.0.0']
])test('owner refuses '+label,async()=>{const x=owner(),expectedLauncher=structuredClone(x.launcher);change(x);const all=new Map([[20,x.main],[10,x.launcher]]);await assert.rejects(attestComparisonBrowser({...x,launcher:expectedLauncher},{read:async id=>all.get(id)}));});
test('unattested and reused process identities are never signalled',async()=>{const signals=[],p=proc(20,10,'200');assert.equal((await retireComparisonProcess(p,{read:async()=>({...p,startTime:'201'}),signal:(...x)=>signals.push(x)})).state,'ReusedDifferentIdentity');assert.equal((await retireComparisonProcess(p,{read:async()=>{throw Error('read denied');},signal:(...x)=>signals.push(x)})).state,'Unknown');assert.deepEqual(signals,[]);});
test('owned process termination waits for disappearance and never asserts heap/cache deletion',async()=>{let alive=true;const p=proc(20,10,'200'),signals=[];const r=await retireComparisonProcess(p,{read:async()=>alive?p:null,signal:(...x)=>{signals.push(x);alive=false;},pause:async()=>{}});assert.equal(r.state,'Absent');assert.deepEqual(signals,[[20,'SIGTERM']]);});
test('lease is exclusive, retained foreign replacement is never removed',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'atom-lease-'));try{const lease=await acquireComparisonLease(root,'c'.repeat(32));await assert.rejects(acquireComparisonLease(root,'d'.repeat(32)));await (await import('node:fs/promises')).writeFile(lease.file,'foreign');assert.equal(await lease.release(),false);assert.equal(await readFile(lease.file,'utf8'),'foreign');}finally{await rm(root,{recursive:true,force:true});}});
test('own lease releases once with exact receipt and partial cleanup is independent',async()=>{const root=await mkdtemp(path.join(os.tmpdir(),'atom-lease-'));try{const lease=await acquireComparisonLease(root,'c'.repeat(32));assert.equal(await lease.release(),true);assert.equal(await lease.release(),true);const calls=[],r={cleanup:{},cleanupErrors:[]};await independentComparisonCleanup(r,{first:async()=>{calls.push(1);throw Error('one');},second:async()=>{calls.push(2);return true;},unknown:async()=>undefined});assert.deepEqual(calls,[1,2]);assert.deepEqual(r.cleanup,{first:false,second:true,unknown:false});assert.equal(r.cleanupErrors.length,1);}finally{await rm(root,{recursive:true,force:true});}});
class Page extends EventEmitter{url(){return 'chrome-extension://'+ 'a'.repeat(32)+'/l02-eval.html';}}
const message=(type='warning')=>({type:()=>type,text:()=> 'source fixture diagnostic',location:()=>({url:'test',lineNumber:1})});
test('scoped console collector retains late delivered errors until explicit stop',async()=>{const page=new Page(),c=collectComparisonConsole(page,page.url());page.emit('console',message());page.emit('console',message('error'));const result=await c.stop();assert.equal(result.status,'Stopped');assert.equal(result.records.length,2);assert.equal(result.records[1].type,'error');page.emit('console',message());assert.equal(result.records.length,2);assert.equal(page.listenerCount('console'),0);});
test('lost page, metadata exceptions or bounded console overflow remain Unknown',async()=>{for(const kind of ['close','metadata','overflow']){const page=new Page(),c=collectComparisonConsole(page,page.url());if(kind==='close')page.emit('close');if(kind==='metadata')page.emit('console',{type(){throw Error('missing');}});if(kind==='overflow')for(let i=0;i<129;i++)page.emit('console',message());const r=await c.stop();assert.equal(r.status,'Unknown');if(kind==='overflow'){assert.equal(r.overflow,true);assert.equal(r.records.length,128);}}});
test('loaded script proof uses actual CDP source, exact URL and nonce before model',async()=>{const {caseData:s}=comparisonCollectionFixture(),script='/* actual source fixture */',url='chrome-extension://'+'a'.repeat(32)+'/l02-eval.js';s.addon.jsSha256=(await import('../scripts/comparison-evaluation-case.mjs')).comparisonSha(script);const session=new EventEmitter();session.send=async method=>{if(method==='Debugger.enable')session.emit('Debugger.scriptParsed',{url,scriptId:'4'});return method==='Debugger.getScriptSource'?{scriptSource:script}:{};};const result=await proveComparisonLoadedScript({session,page:{evaluate:async()=>s.nonce},s,extensionId:'a'.repeat(32),write:async(_f,b)=>assert.equal(b,script)});assert.equal(result.sourceSha256,s.addon.jsSha256);assert.equal(result.scriptId,'4');});
for(const mode of ['hash','nonce','missing','duplicate'])test('script proof refuses '+mode,async()=>{const {caseData:s}=comparisonCollectionFixture(),session=new EventEmitter(),url='chrome-extension://'+'a'.repeat(32)+'/l02-eval.js';let writes=0;session.send=async method=>{if(method==='Debugger.enable'&&mode!=='missing'){session.emit('Debugger.scriptParsed',{url,scriptId:'4'});if(mode==='duplicate')session.emit('Debugger.scriptParsed',{url,scriptId:'5'});}return method==='Debugger.getScriptSource'?{scriptSource:'foreign'}:{};};await assert.rejects(proveComparisonLoadedScript({session,page:{evaluate:async()=>mode==='nonce'?'foreign':s.nonce},s,extensionId:'a'.repeat(32),write:async()=>{writes++;}}));assert.equal(writes,0);});
test('fixed row driver retains acquired records before guard and stops without retry',async()=>{const {caseData:s,result:r}=comparisonCollectionFixture(),rows=r.runs;r.runs=[];let calls=0;await assert.rejects(driveComparisonRows({s,r,run:async index=>{calls++;const row=structuredClone(rows[index]);if(index===1)row.id='foreign';return row;},save:async()=>{}}));assert.equal(calls,2);assert.equal(r.runs.length,2);assert.equal(r.runs[1].id,'foreign');assert.equal(r.currentAttempt.index,1);});
test('fixed driver executes exactly34 order controls with ten inference records and no lifecycle extras',async()=>{const {caseData:s,result:r}=comparisonCollectionFixture(),rows=r.runs;r.runs=[];await driveComparisonRows({s,r,run:async index=>structuredClone(rows[index]),save:async()=>{}});assert.equal(r.runs.length,34);assert.equal(r.runs.filter(x=>x.inferenceReturned).length,10);assert.equal(r.unvisited.length,0);});
test('row observation failure retains prior rows, pending attempt and exact remaining IDs',async()=>{const {caseData:s,result:r}=comparisonCollectionFixture(),rows=r.runs;r.runs=[];let calls=0;await assert.rejects(driveComparisonRows({s,r,run:async index=>{calls++;if(index===1)throw Error('Timeout');return structuredClone(rows[index]);},save:async()=>{}}));assert.equal(calls,2);assert.equal(r.runs.length,1);assert.equal(r.currentAttempt.index,1);assert.deepEqual(r.unvisited,s.expectedCases.slice(1).map(x=>x.id));});
test('a present proc entry with unreadable executable is Unknown, never absent',async()=>{
 const fields=['S','9',...Array(17).fill('0'),'1234',...Array(4).fill('0')];
 await assert.rejects(readComparisonProcess(20,{read:async()=> '20 (owned) '+fields.join(' '),metadata:async()=>({uid:1000}),link:async()=>{throw Object.assign(Error('exe disappeared'),{code:'ENOENT'});}}));
});
test('console URL drift cannot silently adopt another document',async()=>{const page=new Page(),c=collectComparisonConsole(page,page.url());page.url=()=> 'https://foreign.invalid/';page.emit('console',message());const r=await c.stop();assert.equal(r.status,'Unknown');assert.equal(r.records.length,0);});
test('registered visual candidate hook runs only after an acquired row passes its guard',async()=>{const {caseData:s,result:r}=comparisonCollectionFixture(),rows=r.runs;r.runs=[];const seen=[];await driveComparisonRows({s,r,run:async index=>structuredClone(rows[index]),save:async()=>{},afterRow:async(row,expected)=>{if(expected.id==='unknown-left')seen.push([row.id,expected.index]);}});assert.deepEqual(seen,[['unknown-left',22]]);});

// Synthetic WebUI shapes exercise discovery rules, not actual Chrome installation.
const discovery=()=>import('./integration/local-comparison-native.mjs');
const discoveryPath='/owned/evaluation-host';
const discoveryPrior='b'.repeat(32);
const discoveryRow=()=>({id:'a'.repeat(32),path:discoveryPath,state:'ENABLED',location:'UNPACKED'});
test('exact enabled unpacked host discovery needs no service worker target',async()=>{
 const m=await discovery(),row=discoveryRow();
 assert.deepEqual(m.selectComparisonExtension({ready:true,items:[row]},discoveryPath,discoveryPrior),row);
 assert.equal(m.selectComparisonExtension({ready:true,items:[{...row,path:discoveryPath+'-foreign'}]},discoveryPath,discoveryPrior),null);
 assert.equal(m.selectComparisonExtension({ready:false,items:[]},discoveryPath,discoveryPrior),null);
 assert.equal(m.selectComparisonExtension({ready:true,items:[]},discoveryPath,discoveryPrior),null);
});
for(const [label,change] of [
 ['prior identity',r=>r.id=discoveryPrior],['malformed ID',r=>r.id='unknown'],
 ['missing ID',r=>delete r.id],['disabled',r=>r.state='DISABLED'],
 ['terminated',r=>r.state='TERMINATED'],['blocked',r=>r.state='BLOCKLISTED'],
 ['unknown state',r=>delete r.state],['store extension',r=>r.location='FROM_STORE'],
 ['missing location',r=>delete r.location]
])test('exact-path discovery refuses '+label,async()=>{
 const m=await discovery(),row=discoveryRow();change(row);
 assert.throws(()=>m.selectComparisonExtension({ready:true,items:[row]},discoveryPath,discoveryPrior));
});
test('duplicate matching paths and replayed baseline are refused even if IDs agree',async()=>{
 const m=await discovery(),row=discoveryRow(),s={ready:true,items:[row]};
 assert.throws(()=>m.selectComparisonExtension({...s,items:[row,{...row}]},discoveryPath,discoveryPrior));
 assert.throws(()=>m.assertComparisonExtensionAbsent(s,discoveryPath));
 assert.doesNotThrow(()=>m.assertComparisonExtensionAbsent({ready:true,items:[]},discoveryPath));
 assert.throws(()=>m.assertComparisonExtensionAbsent({ready:false,items:[]},discoveryPath));
});
test('WebUI snapshot walks shadow roots but returns only exact-path identity fields',async()=>{
 const m=await discovery(),{runInNewContext}=await import('node:vm');
 const row=discoveryRow(),foreign={...row,path:'/private/foreign',secret:'must-not-copy'};
 const item=data=>({localName:'extensions-item',data});
 const doc={querySelector:s=>s==='extensions-manager'?{}:null,querySelectorAll:()=>[
  {shadowRoot:{querySelectorAll:()=>[item({...row,secret:'must-not-copy'}),item(foreign)]}}
 ]};
 const result=runInNewContext('('+m.readComparisonExtensionUI.toString()+')(expectedPath)',{document:doc,expectedPath:discoveryPath});
 assert.deepEqual(JSON.parse(JSON.stringify(result)),{ready:true,items:[row]});
});
test('changed or missing WebUI shape does not report a ready inventory',async()=>{
 const m=await discovery(),{runInNewContext}=await import('node:vm');
 for(const doc of [
  {querySelector:()=>null,querySelectorAll:()=>[]},
  {querySelector:()=>({}),querySelectorAll:()=>[{localName:'extensions-item',data:{id:'a'.repeat(32)}}]},
  {querySelector:()=>({}),querySelectorAll:()=>[{localName:'extensions-item',data:{location:'UNPACKED'}}]}
 ]){
  const result=runInNewContext('('+m.readComparisonExtensionUI.toString()+')(expectedPath)',{document:doc,expectedPath:discoveryPath});
  assert.equal(result.ready,false);assert.equal(result.items.length,0);
 }
});
test('WebUI optional directory path on unrelated store item cannot block exact unpacked discovery',async()=>{
 const m=await discovery(),{runInNewContext}=await import('node:vm');
 const row=discoveryRow(),doc={querySelector:()=>({}),querySelectorAll:()=>[
  {localName:'extensions-item',data:{id:'c'.repeat(32),location:'FROM_STORE'}},
  {localName:'extensions-item',data:row}
 ]};
 const result=runInNewContext('('+m.readComparisonExtensionUI.toString()+')(expectedPath)',{document:doc,expectedPath:discoveryPath});
 assert.deepEqual(JSON.parse(JSON.stringify(result)),{ready:true,items:[row]});
});
