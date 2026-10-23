// SPDX-License-Identifier: Apache-2.0
// Agent-operated native MV3 catalogue; Atom alone owns the application debugger.
import assert from 'node:assert/strict';
import path from 'node:path';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {rpc,waitFor} from '../../scripts/harness.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
const [handoffFile,caseArgument]=process.argv.slice(2),caseFile=caseArgument||'docs/testing/native-disabled-controls-case.json';
assert(handoffFile,'Exact immutable handoff required');
const scenario=JSON.parse(await readFile(caseFile)),h=JSON.parse(await readFile(handoffFile));
assert.equal(h.package.version,scenario.expectedAtomVersion);assert.equal(h.ui.version,scenario.expectedUIVersion);assert.equal(h.ui.sha256,scenario.expectedUISha256);
const out=path.resolve('.artifacts/v03/native-disabled-controls/'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(out,{recursive:true});
const inputFiles=[...new Set([...Object.keys({...h.sourceManifest,...h.buildSources.manifest}),handoffFile,h.package.file,h.ui.file,caseFile,scenario.fixture,
 'tests/integration/native-disabled-controls.mjs','tests/helpers/native-inspector-ui.mjs','scripts/native-browser.mjs','scripts/harness.mjs'])];
const inputs=async()=>Object.fromEntries(await Promise.all(inputFiles.map(async f=>[f,sha256(await readFile(f))])));
const result={schema:'stateatom.native-disabled-controls/1',status:'RUNNING',startedAt:new Date().toISOString(),
 revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),
 handoff:{file:handoffFile,package:h.package,ui:h.ui},scenario,checks:[],errors:[],console:[],inputsBefore:await inputs(),selections:[]};
let server,browser,panel,ui,tabId;
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
const state=()=>rpc(panel,{op:'state',tabId,refreshDeep:false});
const appCommand=async(method,params={})=>{
 const current=result.lastAppCommand={method,startedAt:new Date().toISOString()};
 const value=await panel.evaluate(async({id,method,params})=>chrome.debugger.sendCommand({tabId:id},method,params),{id:tabId,method,params});current.finishedAt=new Date().toISOString();return value;
};
const appData=()=>panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:()=>({ready:document.body?.dataset.ready,baseline:document.body?.dataset.baseline,proof:document.body?.dataset.proof,title:document.title,url:location.href})}))[0].result,tabId);
async function noAppEffects(){
 const p=JSON.parse((await appData()).proof);assert.equal(p.prototypeGetter,0);assert.equal(p.ownGetter,0);assert.equal(p.constructor,0);assert.deepEqual(p.actions,{});return p;
}
async function pointer(selector){
 const point=await panel.evaluate(async({id,selector})=>{
  await chrome.tabs.update(id,{active:true});return(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:async selector=>{
   const e=document.querySelector(selector);if(!e)throw Error('Missing target '+selector);e.scrollIntoView({block:'center'});let prior,stable=0;
   for(let i=0;i<120;i++){await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);stable=prior&&Math.abs(prior.x-x)<0.1&&Math.abs(prior.y-y)<0.1?stable+1:0;prior={x,y};if(stable>=3&&r.width>0&&r.height>0&&(hit===e||e.contains(hit)))return{x,y};}
   throw Error('Target obscured or unsettled '+selector);
  },args:[selector]}))[0].result;
 },{id:tabId,selector});
 await appCommand('Page.bringToFront');for(const type of ['mouseMoved','mousePressed','mouseReleased'])await appCommand('Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});
}
async function pick(id){
 const previous=(await state()).selection?.observedAt;await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await pointer('#'+id);
 return waitFor(async()=>{const s=await state();if(s.picker.status==='unsupported')return s;return s.picker.status==='selected'&&s.selection?.observedAt!==previous?s:null;});
}
try{
 await check('exact archives, installed standalone and all current product inputs',async()=>{
  await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
  assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);
  for(const [f,v]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(sha256(await readFile(f)),v,f);
 });
 const html=await readFile(scenario.fixture);
 server=createServer((req,res)=>{if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}res.setHeader('content-type','text/html; charset=utf-8');res.end(html);});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});result.origin='http://127.0.0.1:'+server.address().port;
 await writeFile(out+'/registration.json',JSON.stringify(result,null,2),{flag:'wx'});
 browser=await startNativeBrowser(out+'/profiles','catalogue',true,false,['--enable-logging=stderr','--log-level=0'],{extensionPath:h.hosts.standalone});result.browser=browser.context.browser().version();
 panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/panel.html');ui=await nativeInspectorUI(panel,browser);
 panel.on('pageerror',e=>result.errors.push({surface:'inspector',message:e.message}));
 await ui.p.send('Runtime.enable');await ui.p.send('Log.enable');
 ui.p.on('Runtime.consoleAPICalled',p=>{if(['error','warning','warn'].includes(p.type))result.console.push({surface:'inspector',type:p.type,message:p.args.map(a=>a.value??a.description??'').join(' ').slice(0,1000)});});
 tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,result.origin+'/');result.tabId=tabId;await waitFor(async()=>(await appData()).ready==='true');
 await ui.click('refresh-tabs');await ui.waitOK();await ui.select('tabs',tabId);await ui.waitOK();await ui.click('attach');await ui.waitOK();
 await panel.evaluate(async id=>{globalThis.__nativeDisabledLogs=[];chrome.debugger.onEvent.addListener((source,method,p)=>{if(source.tabId===id&&(method==='Runtime.exceptionThrown'||method==='Runtime.consoleAPICalled'&&['error','warning','warn'].includes(p.type)||method==='Log.entryAdded'&&['error','warning'].includes(p.entry.level)))globalThis.__nativeDisabledLogs.push({method,params:p});});await chrome.debugger.sendCommand({tabId:id},'Runtime.enable');await chrome.debugger.sendCommand({tabId:id},'Log.enable');},tabId);
 await appCommand('Emulation.setDeviceMetricsOverride',{...scenario.viewport,deviceScaleFactor:1,mobile:false});
 await check('actual read-only Basic fixture, no helper/IDE or source authority',async()=>{
  const s=await state(),d=await appData();assert.equal(s.readOnly,true);assert.equal(s.connection.mode,'read-only');assert.deepEqual(s.connection.actions,[]);assert.equal(d.title,'Native disabled controls');
  result.baseline=JSON.parse(d.baseline);for(const c of scenario.positive)assert.equal(result.baseline[c.id].nativeDisabled,c.value,c.id);
  assert.equal(result.baseline['fieldset-child'].effectiveDisabled,true);assert.equal(result.baseline['fieldset-child'].nativeDisabled,false);
  for(const id of ['namespace-input','namespace-textarea','namespace-button'])assert.equal(result.baseline[id].nullNamespaceAttribute,false);
  result.initialProof=await noAppEffects();
 });
 await ui.select('property','disabled');await ui.waitOK();
 for(const c of scenario.positive)await check('native picker '+c.id+' own disabled='+c.value+'; no application getter/action',async()=>{
  const s=await pick(c.id);assert.equal(s.picker.status,'selected',s.picker.reason);assert.equal(s.selection.id,c.id);assert.equal(s.selection.tag,c.tag);assert.equal(s.selection.property,'disabled');assert.equal(s.selection.value,c.value);assert.equal(s.selection.domIdentity.value,c.value);assert.match(s.selection.domIdentity.node,/^cdp:/);assert.equal(s.readOnly,true);assert.equal(s.analysis.capabilities.sourceResolver,'unavailable');assert.equal(s.analysis.stateatom.runtime.status,'Unknown/Unsupported');
  result.selections.push({id:c.id,tag:c.tag,value:s.selection.value,identity:s.selection.domIdentity,observedAt:s.selection.observedAt});await noAppEffects();
 });
 await check('repeated false inputs have distinct native nodes',async()=>{assert.notEqual(result.selections.find(s=>s.id==='input-off').identity.node,result.selections.find(s=>s.id==='input-repeat').identity.node);});
 for(const id of scenario.unsupported)await check(id+' remains unavailable with no fresh known target or application action',async()=>{
  const s=await pick(id);assert.equal(s.picker.status,'unsupported');assert.match(s.picker.reason,/Native disabled observation unavailable/);assert.notEqual(s.selection?.id,id);await noAppEffects();
 });
 await check('ordinary text fallback retains the native button text without getter calls',async()=>{await ui.select('property','text');await ui.waitOK();const s=await pick('button-off');assert.equal(s.picker.status,'selected');assert.equal(s.selection.value,'Button off');assert.equal(s.selection.property,'text');await noAppEffects();});
 await check('candidate viewports, retained zero counters, healthy scoped logs and exact installed host',async()=>{
  result.screenshots={desktop:await ui.screenshot(out+'/inspector-1100.png',{width:1100,focus:'inspection'}),narrow:await ui.screenshot(out+'/inspector-440.png',{width:440,focus:'inspection'})};
  assert.equal(result.screenshots.desktop.overflow,false);assert.equal(result.screenshots.narrow.overflow,false);
  await panel.evaluate(id=>chrome.tabs.update(id,{active:true}),tabId);await appCommand('Page.bringToFront');await writeFile(out+'/application.png',Buffer.from((await appCommand('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
  result.finalProof=await noAppEffects();result.appConsole=await panel.evaluate(()=>globalThis.__nativeDisabledLogs);assert.deepEqual(result.appConsole,[]);assert.deepEqual(result.errors,[]);assert.deepEqual(result.console,[]);
  assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);await verifyArtifactHashes([h.package,h.ui]);
 });
 result.status='PASS_NATIVE_REFLECTED_DISABLED_CATALOGUE_NOT_INDEPENDENT_SOURCE_OR_FULL_V03';
}catch(error){result.status='FAIL';result.error=error.stack;process.exitCode=1;console.error(error);try{if(tabId)result.failureState=await state();}catch{}try{if(tabId)result.failureApp=await appData();}catch{}}
finally{
 await ui?.close().catch(()=>{});await browser?.context.close().catch(()=>{});result.browserClosed=!!browser;
 if(server){await new Promise(resolve=>server.close(resolve));result.serverClosed=true;}
 result.inputsAfter=await inputs();if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)){result.status='FAIL';result.inputDrift=true;process.exitCode=1;}
 result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2),{mode:0o600});console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/results.json',status:result.status}));
}
