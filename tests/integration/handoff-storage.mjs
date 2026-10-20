// SPDX-License-Identifier: Apache-2.0
// Actual packed worker/Chrome storage and restart. Not UI or rich handoff proof.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {rpc} from '../../scripts/harness.mjs';
import {makeDiagnostic} from '../../core/diagnostic.mjs';
import {createHandoffDraft} from '../../core/handoff-draft.mjs';
import {createHandoffReport,handoffArtifactDigest} from '../../core/handoff-report.mjs';
import {fileManifest,verifyArtifactHashes,inspectInstalledPair,sha256} from '../../scripts/atom-package-receipt.mjs';
const hf=process.argv.find(x=>x.endsWith('atom-handoff.json'))||'.artifacts/atom/atom-handoff.json',h=JSON.parse(await readFile(hf));
const out='.artifacts/u03/storage-native/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const files=['tests/integration/handoff-storage.mjs','scripts/native-browser.mjs','scripts/harness.mjs'],inputs=async()=>Object.fromEntries(await Promise.all(files.map(async p=>[p,sha256(await readFile(p))]))),key='stateport.atom.v1.diagnostics';
const result={schema:'stateatom.handoff-storage-native/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},configuration:{operator:'agent',browserPlugin:'Browser plugin unavailable; existing isolated native Chrome harness',surface:'Trusted host dispatcher and actual namespaced Chrome local storage',IDE:false,model:false,app:false,appCDP:false,roles:'Backend storage only; UI save/reopen not claimed',restart:'Same isolated synthetic profile closed and relaunched',scope:'Partial U03.2b.2 runtime backend, not whole U03/C07/rich privacy'},checks:[],errors:[],artifacts:[],inputsBefore:await inputs()};
let browser,panel;
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
const v1=()=>makeDiagnostic({selection:{selector:'#synthetic',property:'disabled',value:true,observedAt:Date.now()}},{notes:'Synthetic historical example'});
function bigV1(){const r=v1();r.notes='🧪'.repeat(7000);r.network=Array.from({length:32},(_,i)=>({id:'q'+i,url:'https://example.invalid/synthetic',status:200,observedAt:Date.now(),evidence:'Observed exchange; not evidence of dependency',body:'🧪'.repeat(7000)}));return r;}
async function issue(){const source=JSON.stringify(v1()),draft=await createHandoffDraft(source,{title:'Synthetic issue',actual:'Disabled',expected:'Enabled'});await draft.freeze({expectedRevision:0});return '\n'+JSON.stringify(JSON.parse(await createHandoffReport(source,JSON.stringify(draft.read().baseline))),null,2)+'\n';}
async function open(kind,name){browser=await startNativeBrowser(out+'/profiles',name,true,false,[],{extensionPath:h.hosts[kind]});panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));panel.on('pageerror',e=>result.errors.push({kind,error:e.message}));}
const stored=()=>panel.evaluate(async key=>(await chrome.storage.local.get(key))[key],key);
async function denied(payload,code){const reply=await panel.evaluate(payload=>chrome.runtime.sendMessage(payload),payload);assert.equal(reply.ok,false);assert.equal(reply.code,code);}
try{
 await check('exact immutable pair and both installed host maps',async()=>{await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);for(const kind of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);});
 for(const kind of ['standalone','embedding']){
  const name=kind+'-storage';await open(kind,name);const legacy=[bigV1(),bigV1()],legacyBytes=JSON.stringify(legacy),raw=await issue(),id=JSON.parse(raw).id,digest=await handoffArtifactDigest(raw);
  await panel.evaluate(async({key,legacy})=>chrome.storage.local.set({[key]:legacy,diagnostics:'neighbor host untouched'}),{key,legacy});
  // Chrome may reorder object keys during serialization. Legacy objects never had raw file bytes.
  const seeded=await stored();assert.deepEqual(seeded,legacy);const seededBytes=JSON.stringify(seeded);
  await check(kind+' near-budget legacy array reads without inflation or reinterpretation',async()=>{assert(Buffer.byteLength(legacyBytes)<2097152);assert.deepEqual(await rpc(panel,{op:'list-diagnostics'}),legacy);assert(Array.isArray(await stored()));assert.equal(JSON.stringify(await stored()),seededBytes);});
  await check(kind+' actual save retains exact Unicode/whitespace bytes in the same key',async()=>{const saved=await rpc(panel,{op:'save-handoff',raw});assert.equal(saved.status,'saved');assert.deepEqual(saved.evicted,[]);const file=await rpc(panel,{op:'open-handoff',id});assert.equal(file.raw,raw);assert.equal(file.digest,digest);assert.equal(file.trust,'historical-untrusted');const value=await stored();assert(Buffer.byteLength(JSON.stringify(value))<=2097152);assert.equal(value.version,2);assert.equal(value.entries.length,3);assert.equal(await panel.evaluate(async()=>(await chrome.storage.local.get('diagnostics')).diagnostics),'neighbor host untouched');});
  await check(kind+' idempotency/conflicts/legacy deletion preserve the v2 original',async()=>{const before=await stored();assert.equal((await rpc(panel,{op:'save-handoff',raw})).status,'unchanged');await denied({op:'save-handoff',raw:' '+raw},'HANDOFF_ID_CONFLICT');await denied({op:'save-handoff',raw:'{}'},'UNSUPPORTED_HANDOFF_FORMAT');await denied({op:'save-handoff',raw:'{bad'},'INVALID_HANDOFF_REPORT');await rpc(panel,{op:'delete-diagnostic',id});assert.equal((await rpc(panel,{op:'open-handoff',id})).raw,raw);assert.deepEqual(await stored(),before);});
  await browser.context.close();browser=null;
  // Only this driver's isolated browser flag; avoid reconnecting to its closed endpoint.
  await unlink(out+'/profiles/'+name+'/DevToolsActivePort').catch(e=>{if(e.code!=='ENOENT')throw e;});await open(kind,name);
  await check(kind+' full browser restart reopens both old v1 and exact new v2 without an app',async()=>{assert.deepEqual(await rpc(panel,{op:'list-diagnostics'}),legacy);assert.equal((await rpc(panel,{op:'open-handoff',id})).raw,raw);assert.equal((await rpc(panel,{op:'list-handoffs'})).entries.length,3);assert.equal((await panel.evaluate(()=>chrome.tabs.query({url:['http://*/*','https://*/*']}))).length,0);});
  await check(kind+' actual Chrome byte usage stays bounded for heavily escaped raw files',async()=>{
   const raws=Array.from({length:3},()=>{const r=v1();r.network=Array.from({length:32},(_,i)=>({id:'q'+i,url:'https://example.invalid/',status:200,body:'\\'.repeat(6000)}));return JSON.stringify(r);});
   for(const raw of raws)await rpc(panel,{op:'save-handoff',raw});
   const value=await stored(),encodedBytes=Buffer.byteLength(JSON.stringify(value)),chromeBytes=await panel.evaluate(key=>chrome.storage.local.getBytesInUse(key),key);
   assert(encodedBytes<=2097152);assert(chromeBytes<=2097152+key.length);assert.equal((await rpc(panel,{op:'open-handoff',id:JSON.parse(raws[2]).id})).raw,raws[2]);
   result.artifacts.push({kind,quota:{encodedBytes,chromeBytes,fixedKeyBytes:key.length}});
  });
  const small=Array.from({length:8},()=>v1());await panel.evaluate(async({key,small})=>chrome.storage.local.set({[key]:small}),{key,small});
  await check(kind+' old and new records share the original eight-report retention budget',async()=>{const saved=await rpc(panel,{op:'save-handoff',raw});assert.deepEqual(saved.evicted,[small[0].id]);assert.equal((await rpc(panel,{op:'list-handoffs'})).entries.length,8);assert.equal((await rpc(panel,{op:'list-diagnostics'})).length,7);assert.equal(await rpc(panel,{op:'open-handoff',id:small[0].id}),null);});
  await check(kind+' stale removal refuses and exact explicit deletion removes only its record',async()=>{const before=await stored();await denied({op:'delete-handoff',id,expectedDigest:'a'.repeat(64)},'STALE_HANDOFF_RECORD');assert.deepEqual(await stored(),before);assert.equal((await rpc(panel,{op:'delete-handoff',id,expectedDigest:digest})).removed,true);assert.equal(await rpc(panel,{op:'open-handoff',id}),null);assert.equal((await rpc(panel,{op:'list-diagnostics'})).length,7);});
  const final=JSON.stringify(await stored());await writeFile(out+'/'+kind+'-store.json',final);result.artifacts.push({kind,store:{file:out+'/'+kind+'-store.json',sha256:sha256(final),bytes:Buffer.byteLength(final)},originalLegacyBytes:Buffer.byteLength(legacyBytes),rawDigest:digest});assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);await browser.context.close();browser=null;
 }
 result.status='PASS_NATIVE_HANDOFF_STORAGE';
}catch(e){result.status='FAIL';result.error=String(e.stack);process.exitCode=1;console.error(e);await panel?.screenshot({path:out+'/failure.png'}).catch(()=>{});}finally{await browser?.context.close();result.inputsAfter=await inputs();if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);}
