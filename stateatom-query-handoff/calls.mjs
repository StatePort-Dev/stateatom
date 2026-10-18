// SPDX-License-Identifier: Apache-2.0
// Two native call sites only. Not an effects certificate or product UI acceptance.
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';
import {startServer} from '../stateatom-phase2/server.mjs';import {startBrowser} from '../scripts/harness.mjs';import {fileDigests} from '../scripts/short-loop-inputs.mjs';import {root} from '../scripts/vite-config.mjs';import {queryVendorHashes} from '../stateatom-phase2/engine/query-vendor.mjs';
const queryWriteAccessGuards=process.argv.includes('--query-write-access-guards');
const reactStateHandoffs=!process.argv.includes('--without-react-state');
const cases=['native','nested-wrapper','build-wrapper','build-getter','noncallable','getter-ready','getter-throw','callee-ABA','method-getter','functional','custom-sharing','listener','later-alias'];
const tag=process.env.QUERY_CALL_TAG||new Date().toISOString().replaceAll(/[:.]/g,'-');assert.match(tag,/^[a-zA-Z0-9_-]{1,100}$/);const out=root+'/.runtime/query-call-runs/'+tag;await mkdir(root+'/.runtime/query-call-runs',{recursive:true});await mkdir(out);
const entries=['stateatom-query-handoff','stateatom-phase2/engine','stateatom-phase2/fixtures','stateatom-phase2/server.mjs','scripts/harness.mjs','scripts/vite-config.mjs','scripts/short-loop-inputs.mjs','package.json','package-lock.json',...Object.keys(queryVendorHashes).map(f=>'node_modules/'+f)],before=await fileDigests(root,entries);
let revision=null;try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
const result={schema:1,tag,revision,sourceArchive:revision===null,startedAt:new Date().toISOString(),inputs:before,checks:[],errors:[],controls:[],fullPath:false,readonlyEffects:'Unknown/Unsupported',productUI:false,configuration:{queryHandoffs:true,queryCallCensus:true,sourceConsumption:true,sourceWrites:true,reactHostProps:true,reactStateHandoffs,queryWriteAccessGuards,browserPlugin:'Unavailable; repository pinned Playwright, acquisition without MV3/IDE; actual UI checked separately',claim:'Two selected native call-site eligibility/body operand correspondences only; other callees effects and alias lifetime unknown'}};
let server,browser;
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});};
async function close(){for(const[name,fn]of[['browser',()=>browser?.context.close()],['server',()=>server?.close()]])try{await fn();}catch(e){result.errors.push(name+': '+e);}browser=null;server=null;}
async function mode(name){server=await startServer(name==='on'?'B':'A',{sourceConsumption:true,queryHandoffs:name==='on',queryCallCensus:name==='on',sourceWrites:true,reactHostProps:true,reactStateHandoffs,writeAccessGuards:name==='on'&&queryWriteAccessGuards,queryWriteAccessGuards:name==='on'&&queryWriteAccessGuards});browser=await startBrowser(out,name,false);result.browser=browser.context.browser()?.version();const results={};
 for(const control of cases){const page=await browser.context.newPage();page.on('pageerror',e=>result.errors.push(String(e)));await page.goto('http://127.0.0.1:4173/react/query-call-controls.html');await page.waitForFunction(()=>window.queryCallsReady);results[control]=await page.evaluate(name=>window.runQueryCallCase(name),control);await page.close();}
 const page=await browser.context.newPage();page.on('pageerror',e=>result.errors.push(String(e)));await page.goto('http://127.0.0.1:4173/react/');await page.locator('#p1').waitFor();const dom=await page.evaluate(()=>({p1:document.getElementById('p1').textContent,p2:document.getElementById('p2').disabled,p3:document.getElementById('p3').textContent}));
 const census=name==='on'?await page.evaluate(()=>window.__STATEATOM__.queryCallObservations()):null;return{results,dom,census,page,probe:server.phase2Plugin.queryHandoffs};
}
try{
 const off=await mode('off');result.off={dom:off.dom,semantics:Object.fromEntries(cases.map(k=>[k,off.results[k].semantics]))};await close();const on=await mode('on');result.on={dom:on.dom,census:on.census,probe:on.probe};
 await check('original P2/P1 and cached P3 are unchanged off/on',()=>{assert.deepEqual(on.dom,off.dom);assert.deepEqual(on.dom,{p1:'13',p2:false,p3:'15'});});
 for(const name of cases)await check(name+' preserves behavior and only supported selected call-site/body relations',()=>{const actual=on.results[name];assert.deepEqual(actual.semantics,off.results[name].semantics,name);const s=actual.census,entries=s.events.filter(e=>e.kind==='native-body-entry'&&e.method==='query-set');assert.equal(s.retention.frames,0);assert.equal(s.readonlyEffects,'Unknown/Unsupported');assert.equal(s.fullPath,false);assert.equal(s.overflow,false);
  if(['native','callee-ABA','functional','custom-sharing','listener','later-alias'].includes(name))assert(entries.some(e=>e.callSite.status==='Observed'),name);
  if(['nested-wrapper','build-wrapper','build-getter','method-getter'].includes(name)){assert(entries.length,name);assert(entries.every(e=>e.callSite.status==='Unknown/Unsupported'),name);}
  if(name==='nested-wrapper')assert.equal(actual.semantics.writes,1);
  if(name==='noncallable'){assert.equal(entries.length,0);assert(actual.semantics.errorMessage);}
  if(name==='getter-ready'){assert.equal(entries.length,2);assert.deepEqual(entries.map(e=>e.callSite.status),['Unknown/Unsupported','Observed']);assert.notEqual(entries[0].frameId,entries[1].frameId);assert.equal(actual.semantics.getters,1);assert.equal(actual.semantics.updates,3);}
  if(name==='getter-throw'){assert(actual.afterThrow.events.some(e=>e.kind==='native-body-exit'&&e.method==='client-set'&&e.outcome==='abrupt'));assert.equal(entries.length,1);assert.equal(entries[0].callSite.status,'Observed');}
  if(['custom-sharing','functional','later-alias'].includes(name))assert.equal(actual.semantics.writes,1);
  result.controls.push({name,...actual});
 });
 await check('original native first store exposes two selected relations without a readonly certificate',()=>{assert.equal(on.probe.contract.queryCallCensus,true);assert.equal(on.probe.records.length,3);assert.equal(on.census.events.filter(e=>e.kind==='native-body-entry'&&e.callSite.status==='Observed').length,2);assert.equal(on.census.readonlyEffects,'Unknown/Unsupported');assert.equal(on.census.retention.frames,0);assert(on.census.events.some(e=>e.kind==='native-body-entry'&&e.method==='query-set'&&typeof e.parsedObject?.consumptionId==='string'));});
 await check('stop invalidates the call census explicitly',async()=>{const stopped=await on.page.evaluate(()=>{window.__STATEATOM__.stop();return window.__STATEATOM__.queryCallObservations();});assert.equal(stopped.status,'Unknown/Unsupported');});
 result.status='PASS_TWO_SITE_NATIVE_CALL_CENSUS';
}catch(e){result.status='FAIL';result.errors.push(String(e.stack||e));process.exitCode=1;}
finally{await close();result.inputsStable=JSON.stringify(before)===JSON.stringify(await fileDigests(root,entries));if(!result.inputsStable||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out,result.errors);}
