// SPDX-License-Identifier: Apache-2.0
// Finite Linux native-prompt qualification; not whole P03 artifact acceptance.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {access,mkdir,open,readFile,writeFile} from 'node:fs/promises';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {waitFor,rpc} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
const hf=process.argv.find(a=>a.endsWith('atom-handoff.json'))||'.artifacts/atom/atom-handoff.json';
const h=JSON.parse(await readFile(hf)),out='.artifacts/p03/environment-native/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const inputFiles=['tests/integration/source-access-environment.mjs','scripts/native-browser.mjs','tests/helpers/native-inspector-ui.mjs','scripts/harness.mjs'],inputHashes=async()=>Object.fromEntries(await Promise.all(inputFiles.map(async f=>[f,sha256(await readFile(f))])));
const result={inputsBefore:await inputHashes(),schema:'stateatom.p03-native-permission-environment/1',status:'RUNNING',startedAt:new Date().toISOString(),handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},configuration:{operator:'agent',platform:'Linux nested Xephyr X11; fixed Chrome153 native dialog geometry',appOrigin:'https://example.com',permissionPreapproval:false,permissionOverride:false,TLSBypass:false,account:false,artifactConnection:false,scope:'Actual product Allow site gesture and browser-owned Deny/Allow; not P03 artifact/auth/local-fallback acceptance'},checks:[],cases:[]};
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
let desktop,browser,d,log;
try{
 await check('exact immutable pair, installed consumer and complete hosts',async()=>{await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);for(const k of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[k]),h.consumerReceipt.hostFiles[k]);});
 let number=97;while(await access('/tmp/.X11-unix/X'+number).then(()=>true,()=>false))number++;
 const display=':'+number;result.configuration.display=display;log=await open(out+'/xephyr.log','a');
 desktop=spawn('Xephyr',[display,'-screen','1100x900','-nolisten','tcp','-noreset','-ac'],{stdio:['ignore',log.fd,log.fd]});
 await waitFor(()=>access('/tmp/.X11-unix/X'+number).then(()=>true,()=>false));
 const native=(args)=>execFileSync('xdotool',args,{env:{...process.env,DISPLAY:display},timeout:3000,stdio:'pipe'});
 async function decide(kind,decision){
  // Chrome ignores early clicks while the native dialog appears. This fixed UI
  // stabilization is not a product-performance measurement or a permission stub.
  await new Promise(r=>setTimeout(r,1000));
  const screenshot=out+'/'+kind+'-'+decision+'.png';
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-f','x11grab','-video_size','1100x900','-i',display,'-frames:v','1',screenshot],{timeout:5000,stdio:'pipe'});
  native(['mousemove',decision==='deny'?'628':'704','281','click','1']);return screenshot;
 }
 for(const kind of ['standalone','embedding']){
  const entry={kind,checks:[],before:await fileManifest(h.hosts[kind])};result.cases.push(entry);
  const local=async(name,fn)=>{await check(kind+' '+name,fn);entry.checks.push(name);};
  browser=await startNativeBrowser(out+'/profiles',kind,true,false,[],{extensionPath:h.hosts[kind],headless:false,display});
  entry.browser=browser.context.browser().version();assert.match(entry.browser,/Chrome\/153\./,'Native coordinates must be requalified on another Chrome major');
  const panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));
  d=await nativeInspectorUI(panel,browser);const origin=result.configuration.appOrigin,tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin);
  await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
  await d.click('refresh-tabs');await d.waitOK();await d.select('tabs',tabId);await d.waitOK();
  const state=()=>rpc(panel,{op:'state',tabId}),permitted=()=>panel.evaluate(o=>chrome.permissions.contains({origins:[o+'/*']}),origin);
  await local('fresh profile requires explicit site access and has no change grant',async()=>{assert.equal(await permitted(),false);assert.equal(await d.text('attach'),'Allow site and attach');assert.equal((await state()).productionChange.active,false);});
  await d.click('attach');entry.denialScreenshot=await decide(kind,'deny');
  await waitFor(async()=>(await d.text('status')).startsWith('Error:'));
  await local('actual native Deny returns a bounded permission error without attach',async()=>{assert.match(await d.text('status'),/permission denied/i);assert.equal(await permitted(),false);const s=await state();assert.equal(s.attached,false);assert.equal(s.productionChange.active,false);entry.denial={permission:false,attached:s.attached,status:await d.text('status')};});
  await d.click('attach');entry.grantScreenshot=await decide(kind,'allow');await d.waitOK();
  await local('fresh native Allow gives read-only attach and no production grant',async()=>{assert.equal(await permitted(),true);const s=await state();assert.equal(s.attached,true);assert.equal(s.readOnly,true);assert.equal(s.productionChange.active,false);entry.grant={permission:true,attached:s.attached,readOnly:s.readOnly,productionChange:s.productionChange};});
  await local('site grant does not grant another artifact origin',async()=>{assert.equal(await panel.evaluate(()=>chrome.permissions.contains({origins:['https://artifacts.example.com/*']})),false);});
  await local('actual permission removal invalidates attach and preserves read-only authority',async()=>{const removed=await panel.evaluate(o=>chrome.permissions.remove({origins:[o+'/*']}),origin);assert.equal(removed,true);await waitFor(async()=>{const s=await state();return s.attached===false;});assert.equal(await permitted(),false);assert.equal((await state()).productionChange.active,false);entry.revocation={removed,permission:false};});
  await local('exact complete host files remain unchanged',async()=>{entry.after=await fileManifest(h.hosts[kind]);assert.deepEqual(entry.before,entry.after);});
  await d.close();d=null;await browser.context.close();browser=null;
 }
 result.status='PASS_NATIVE_PERMISSION_ENVIRONMENT_NOT_P03_ACCEPTANCE';
}catch(error){result.status='FAIL';result.error=error.stack;process.exitCode=1;console.error(error);}
finally{
 await d?.close().catch(()=>{});await browser?.context.close().catch(()=>{});
 if(desktop?.exitCode===null)desktop.kill('SIGTERM');await log?.close();
 result.inputsAfter=await inputHashes();if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)){result.status='FAIL';result.error=(result.error||'')+'\nRegistered input changed';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);
}
