// SPDX-License-Identifier: Apache-2.0
// Sole harness-owned CDP target; no Atom, broker, MAIN acquisition or user profile.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {createBrowserEngine} from '../../src/engine/browser.mjs';
import {sha256} from '../../scripts/atom-package-receipt.mjs';

const [stage,caseFile]=process.argv.slice(2),scenario=JSON.parse(await readFile(caseFile));
assert(['baseline','candidate'].includes(stage));
const out='.artifacts/v02/disabled-domain/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(out,{recursive:true});
const engine='src/engine/browser.mjs',hashes=async()=>Object.fromEntries(await Promise.all(Object.keys(scenario.inputHashes).map(async p=>[p,sha256(await readFile(p))])));
const result={schema:'stateatom.disabled-domain-native/1',stage,status:'RUNNING',revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),startedAt:new Date().toISOString(),caseFile,caseSha256:sha256(await readFile(caseFile)),engineSha256:sha256(await readFile(engine)),rows:[],errors:[],configuration:{soleHarnessTarget:true,atomLoaded:false,fixtureSetupScripts:true,acquisitionScripts:false,coldDomainBeforeEach:true,sandbox:true}};
await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
let browser,server;
const html='<!doctype html><title>Disabled domain control</title><div id="controls"></div><div id="open"></div><div id="closed"></div><div id="text"><span>Alpha</span> <span>Beta</span></div><script>window.getterReads=0;for(const [kind,values]of [["button",["absent","empty","false","disabled","namespace"]],["input",["absent","empty","false","disabled","namespace"]],["textarea",["absent","empty","false","disabled","namespace"]]])for(const variant of values){const e=document.createElement(kind);e.id=kind+"-"+variant;if(variant==="namespace")e.setAttributeNS("urn:stateatom:control","disabled","");else if(variant!=="absent")e.setAttribute("disabled",variant==="empty"?"":variant);Object.defineProperty(e,"disabled",{get(){window.getterReads++;throw Error("Getter must not run")}});document.querySelector("#controls").append(e)}for(const [id,mode]of [["open","open"],["closed","closed"]]){const root=document.querySelector("#"+id).attachShadow({mode});root.innerHTML="<button id=off>Off</button><button id=on disabled>On</button>";for(const e of root.children)Object.defineProperty(e,"disabled",{get(){window.getterReads++;throw Error("Getter must not run")}})}document.querySelector("#controls").insertAdjacentHTML("beforeend","<select id=unsupported></select><button id=replace>Replace</button>");<\/script>';
try{
 assert.equal(scenario.schema,'stateatom.disabled-domain-case/1');
 assert.deepEqual(await hashes(),scenario.inputHashes);assert.equal(result.engineSha256,scenario.engineHashes[stage]);
 assert.equal(sha256(await readFile(scenario.browser.executable)),scenario.browser.executableSha256);
 server=createServer((_req,res)=>{res.setHeader('content-type','text/html');res.setHeader('cache-control','no-store');res.end(html);});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>{server.removeListener('error',reject);resolve();});});
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:scenario.browser.executable,headless:true,chromiumSandbox:true});
 result.browser=browser.version();assert.equal('Chrome/'+result.browser,scenario.browser.version);
 const context=await browser.newContext(),page=await context.newPage();await page.goto(origin);
 const cdp=await context.newCDPSession(page);
 // A fresh CDP session is already cold. Chrome refuses DOM.disable before any
 // enable/getDocument; subsequent rows explicitly disable the bootstrapped agent.
 const {root}=await cdp.send('DOM.getDocument',{depth:0});
 const bootstrap=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'#button-empty'});
 assert(bootstrap.nodeId>0);result.implicitBootstrap={documentBackend:root.backendNodeId,selectedNode:bootstrap.nodeId,explicitEnable:false};
 for(const row of scenario.controls){
  await page.goto(origin+'/?case='+encodeURIComponent(row.id));await cdp.send('DOM.disable');
  const methods=[];let replaced=false;
  const chrome={scripting:{executeScript(){throw Error('Acquisition must use native DOM only');}},debugger:{async sendCommand(target,method,params){
   assert.equal(target.tabId,9);methods.push(method);const response=await cdp.send(method,params);
   if(row.mutation&&!replaced&&method==='DOM.describeNode'){
    replaced=true;
    if(row.mutation==='node')await page.evaluate(()=>document.querySelector('#replace').replaceWith(document.querySelector('#replace').cloneNode(true)));
    else await page.goto(origin+'/?replacement-document');
   }
   return response;
  }}};
  const value=await createBrowserEngine(chrome).identifySelection(9,row.selector,row.property),getterReads=await page.evaluate(()=>window.getterReads);
  const observation={...row,actual:value,methods,getterReads};result.rows.push(observation);
  if(row.expected===null)assert.equal(value,null,row.id);else{assert.equal(value?.value,row.expected,row.id);assert.equal(value.property,row.property);assert.match(value.document,/^cdp:\d+$/);assert.match(value.node,/^cdp:\d+$/);}
  assert.equal(getterReads,0,row.id);assert(methods.every(m=>m.startsWith('DOM.')));
  assert.equal(methods.filter(m=>m==='DOM.enable').length,stage==='baseline'||row.property==='text'?1:0,row.id);
 }
 assert.equal(result.rows.length,22);result.status='PASS_COLD_NATIVE_IDENTITY_NOT_INSTALLED_BROKER';
}catch(error){result.status='FAIL';result.errors.push({name:error.name,message:error.message,stack:error.stack});process.exitCode=1;}
finally{
 for(const [name,close]of [['browser',()=>browser?.close()],['server',()=>server&&new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()))]])try{await close();result[name+'Closed']=true;}catch(error){result.status='FAIL';result.errors.push({phase:'cleanup-'+name,message:error.message});process.exitCode=1;}
 try{result.inputsAfter=await hashes();assert.deepEqual(result.inputsAfter,scenario.inputHashes);assert.equal(sha256(await readFile(engine)),result.engineSha256);}catch(error){result.status='FAIL';result.errors.push({phase:'final-inputs',message:error.message});process.exitCode=1;}
 result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({out,status:result.status,rows:result.rows.length,errors:result.errors.map(e=>e.message)}));
}
