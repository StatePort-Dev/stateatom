// SPDX-License-Identifier: Apache-2.0
// Exact final kit through normal Linux Chrome installation; no workload rerun.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {installGuideExtension} from '../helpers/guide-extension-install.mjs';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {sourceAccessDesktop} from '../helpers/source-access-native-desktop.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {fileManifest,sha256} from '../../scripts/atom-package-receipt.mjs';
const out='.artifacts/v03/current96-kit-install/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const receiptFile='.artifacts/release/current96/receipt.json',receipt=JSON.parse(await readFile(receiptFile)),r={schema:'stateatom.current96-kit-install/1',status:'RUNNING',out,receipt:{file:receiptFile,sha256:sha256(await readFile(receiptFile))},cases:[],errors:[],console:[],assistance:['Actual Developer mode / Load unpacked / native folder chooser','Explicit inspector extension URL after installation; no new toolbar usability claim','No app/helper/source workflow from this installation-only check']};let desktop,browser,ui;
const manifest=await fileManifest(receipt.kit);delete manifest['KIT-RECEIPT.json'];assert.deepEqual(manifest,receipt.files);
try{
 desktop=await sourceAccessDesktop(out);
 for(const role of ['standalone','official-extension']){
  const folder=receipt.kit+'/'+role,c={role,checks:[]};r.cases.push(c);const m=JSON.parse(await readFile(folder+'/manifest.json'));
  browser=await startNativeBrowser(out+'/profiles',role,true,false,[],{extensionPath:folder,headless:false,display:desktop.display,beforeExtensionLoad:async api=>{c.installation=await installGuideExtension(api,{folder,desktop,out,role,expectedBrowser:'Chrome/153.0.8010.12',expectedExecutableSha256:'8c599d43aec53f2460a31ae2f4af6bd863f8258b34ff519564bc5d4726bfaa1e',expectedName:m.name});}});c.checks.push('normal actual Chrome installation and folder chooser; no preload');
  const p=await browser.context.newPage();p.on('pageerror',e=>r.errors.push({role,message:e.message}));await p.goto('chrome-extension://'+browser.id+'/'+(role==='standalone'?'panel.html':'atom.html'));ui=await nativeInspectorUI(p,browser);ui.p.on('Runtime.consoleAPICalled',e=>{if(['error','warn','warning'].includes(e.type))r.console.push({role,text:e.args.map(a=>a.value??a.description??'').join(' ')});});await ui.p.send('Runtime.enable');
  const state=await p.evaluate(async()=>({text:document.body.innerText,appTabs:(await chrome.tabs.query({})).filter(t=>/^https?:/.test(t.url||'')).length,session:await chrome.storage.session.get(null),local:await chrome.storage.local.get(null)}));assert.equal(state.appTabs,0);assert.match(state.text,/Atom|Select page element/);c.initial=state;
  for(const[key,value]of Object.entries(state.session))assert(key==='stateport.debugger.v1.owners'&&Array.isArray(value)&&!value.length,'unexpected session authority '+key);
  assert(!Object.keys(state.local).some(k=>/grant|lease|connection|input/.test(k)));c.checks.push('installed inspector renders without app tabs or restored session authority');
  if(role==='official-extension'){
   const response=await p.evaluate(async()=>{const r=await fetch('BUILD-INFO.json');return await r.json();});assert.equal(response.atom.artifactSha256,receipt.atom.sha256);assert.equal(response.atom.packageVersion,'0.1.0-candidate.20261029.96');assert.equal(response.developmentKit.plugin.version,'0.1.0-candidate.20261029.17');c.buildInfo={atom:response.atom.packageVersion,atomSha256:response.atom.artifactSha256,plugin:response.developmentKit.plugin.version};c.checks.push('installed extension serves exact96 component receipt');
  }
  c.screenshot=await ui.screenshot(out+'/'+role+'-installed.png',{width:440,focus:'setup-toggle'});assert.equal(c.screenshot.overflow,false);
  await ui.close();ui=null;await browser.context.close();browser=null;console.log('PASS',role,c.checks.length);
 }
 const after=await fileManifest(receipt.kit);delete after['KIT-RECEIPT.json'];assert.deepEqual(after,receipt.files);assert.equal(sha256(await readFile(receiptFile)),r.receipt.sha256);assert.deepEqual(r.errors,[]);assert.deepEqual(r.console,[]);r.status='PASS_CURRENT96_NORMAL_FOLDER_INSTALL_NOT_FULL_V03';
}catch(e){r.status='FAIL';r.error=e.stack;process.exitCode=1;console.error(e);}
finally{await ui?.close().catch(()=>{});await browser?.context.close();await desktop?.close();r.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(r,null,2));console.log('RESULT',r.status,out);}
