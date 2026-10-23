// SPDX-License-Identifier: Apache-2.0
// Independent app runtime is unchanged; Atom alone owns its debugger attachment.
import assert from 'node:assert/strict';
import path from 'node:path';
import {createServer} from 'node:http';
import {spawn, execFileSync} from 'node:child_process';
import {stripVTControlCharacters} from 'node:util';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {rpc, waitFor} from '../../scripts/harness.mjs';
import {sha256, fileManifest, verifyArtifactHashes, inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {parseDiagnostic} from '../../core/diagnostic.mjs';
import {nativeInspectorUI, nativeDownloads} from '../helpers/native-inspector-ui.mjs';

const [handoffFile, dependencyFile] = process.argv.slice(2);
assert.equal(process.argv.length, 4, 'Exact handoff and prepared dependency receipt required');
const caseFile = 'docs/testing/independent-vue-basic-case.json';
const scenario = JSON.parse(await readFile(caseFile));
const h = JSON.parse(await readFile(handoffFile));
assert.equal(h.package.version, scenario.expectedAtomVersion);
assert.equal(h.ui.version, scenario.expectedUIVersion);
const app = JSON.parse(await readFile(dependencyFile)).apps.find(a => a.slug === 'CorentinTh--it-tools');
assert(app?.originalSourceAndLockFilesMatch && app.status === 'PASS_FROZEN_DEPENDENCY_PREPARATION_NOT_APP_ACCEPTANCE');
assert.equal(execFileSync(scenario.nodeExecutable, ['--version'], {encoding:'utf8'}).trim(), scenario.nodeVersion);
const manifest = JSON.parse(await readFile(app.sourceManifest));
assert.equal(Object.keys(manifest).length, 498);
const out = path.resolve('.artifacts/v03/independent-vue-basic/' + new Date().toISOString().replace(/[:.]/g, '-'));
await mkdir(out, {recursive:true});
await writeFile(out + '/driver.mjs', await readFile(new URL(import.meta.url)));
const registered = [...new Set([...Object.keys({...h.sourceManifest, ...h.buildSources.manifest}), caseFile,
  'docs/testing/independent-apps.json', 'tests/integration/independent-vue-basic-native.mjs',
  'tests/helpers/native-inspector-ui.mjs', 'scripts/native-browser.mjs', 'scripts/harness.mjs',
  handoffFile, dependencyFile, app.sourceManifest])];
const inputs = async () => Object.fromEntries(await Promise.all(registered.map(async f => [f, sha256(await readFile(f))])));
async function sourceAudit(allowGenerated) {
  const generated = [];
  for (const [file, expected] of Object.entries(manifest)) {
    assert.equal(sha256(await readFile(path.join(app.immutableSource, file))), expected, 'immutable ' + file);
    const actual = sha256(await readFile(path.join(app.workingCopy, file)));
    if (actual !== expected) {
      assert(allowGenerated && scenario.generatedSourceExceptions.includes(file), 'Unexpected source delta ' + file);
      generated.push({file, before:expected, after:actual});
    }
  }
  return {files:498, unchanged:498 - generated.length, generated};
}
const result = {schema:'stateatom.v03-independent-vue-basic/1', status:'RUNNING', startedAt:new Date().toISOString(),
  revision:execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim(),
  sourceDirty:!!execFileSync('git', ['status', '--porcelain'], {encoding:'utf8'}).trim(),
  handoff:{file:handoffFile, package:h.package, ui:h.ui}, scenario,
  application:{repository:'https://github.com/' + scenario.application, revision:scenario.revision, workingCopy:app.workingCopy, installedVersions:app.installedVersions},
  checks:[], errors:[], console:[], inputsBefore:await inputs()};
const check = async (name, fn) => {await fn(); result.checks.push({name, status:'PASS'}); console.log('PASS', name);};
let vite, browser, ui, downloads, panel, tabId, viteOutput = '', viteFailure;
async function stopVite() {
  if (!vite) return;
  if (vite.exitCode === null && vite.signalCode === null) {
    vite.kill('SIGTERM');
    try {await waitFor(() => vite.exitCode !== null || vite.signalCode !== null, 5000);}
    catch {vite.kill('SIGKILL'); await waitFor(() => vite.exitCode !== null || vite.signalCode !== null, 5000);}
  }
  result.viteExit = {code:vite.exitCode, signal:vite.signalCode};
}
async function observe(page, surface) {
  page.on('pageerror', e => result.errors.push({surface, message:e.message}));
  const d = await nativeInspectorUI(page, browser);
  d.p.on('Runtime.consoleAPICalled', e => {if (['error','warning','warn'].includes(e.type)) result.console.push({surface, type:e.type, message:e.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0,1500)});});
  d.p.on('Log.entryAdded', ({entry}) => {if (['error','warning'].includes(entry.level)) result.console.push({surface, type:entry.level, message:entry.text.slice(0,1500)});});
  await d.p.send('Runtime.enable'); await d.p.send('Log.enable'); return d;
}
const appDOM = () => panel.evaluate(async ({id, input, count}) => (await chrome.scripting.executeScript({target:{tabId:id}, world:'ISOLATED', func:(input,count) => ({
  url:location.href, title:document.title, ready:document.readyState,
  input:document.querySelector(input)?.value, count:document.querySelector(count)?.textContent.trim(),
  label:document.querySelector(count)?.closest('.n-statistic')?.querySelector('.n-statistic__label')?.textContent.trim(),
  statistics:[...document.querySelectorAll('.n-statistic-value__content')].map(e => e.textContent.trim()), body:document.body.innerText.slice(0,15000)
}), args:[input,count]}))[0].result, {id:tabId, input:scenario.inputSelector, count:scenario.countSelector});
const appCommand = (method, params) => panel.evaluate(async ({id,method,params}) => chrome.debugger.sendCommand({tabId:id}, method, params), {id:tabId,method,params});
async function pointer(selector) {
  const point = await panel.evaluate(async ({id,selector}) => {
    await chrome.tabs.update(id, {active:true});
    return (await chrome.scripting.executeScript({target:{tabId:id}, world:'ISOLATED', func:async selector => {
      const e = document.querySelector(selector); if (!e) throw Error('Missing target ' + selector);
      e.scrollIntoView({block:'center'}); let previous, stable = 0;
      for (let i=0; i<120; i++) {
        await new Promise(requestAnimationFrame); const r=e.getBoundingClientRect(), x=r.x+r.width/2, y=r.y+r.height/2, hit=document.elementFromPoint(x,y);
        stable=previous && Math.abs(previous.x-x)<0.1 && Math.abs(previous.y-y)<0.1 ? stable+1 : 0; previous={x,y};
        if (stable>=3 && r.width>0 && r.height>0 && (hit===e || e.contains(hit))) return {x,y};
      }
      throw Error('Target obscured or unsettled ' + selector);
    }, args:[selector]}))[0].result;
  }, {id:tabId,selector});
  for (const type of ['mouseMoved','mousePressed','mouseReleased']) await appCommand('Input.dispatchMouseEvent', {type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});
  return point;
}
const state = () => rpc(panel, {op:'state',tabId,refreshDeep:false});
async function save(notes) {
  const before = new Set((await rpc(panel,{op:'list-handoffs'})).entries.map(e=>e.id));
  await ui.fill('diagnostic-notes',notes); await ui.click('save-report');
  const entry = await waitFor(async () => (await rpc(panel,{op:'list-handoffs'})).entries.find(e => e.version===1 && !before.has(e.id)));
  const stored = await rpc(panel,{op:'open-handoff',id:entry.id}); return {...stored, parsed:parseDiagnostic(stored.raw)};
}
try {
  await check('exact supplied pair, standalone host, build inputs and all498 original files', async () => {
    await verifyArtifactHashes([h.package,h.ui]); await inspectInstalledPair(h.consumer,h.consumerReceipt);
    assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);
    for (const [f,hash] of Object.entries({...h.sourceManifest,...h.buildSources.manifest})) assert.equal(sha256(await readFile(f)),hash,f);
    for (const [name, v] of Object.entries(app.installedVersions)) assert.equal(sha256(await readFile(path.join(app.workingCopy,'node_modules',name,'package.json'))),v.packageJsonSha256,name);
    result.sourceBefore=await sourceAudit(false);
  });
  const probe=createServer(); await new Promise((r,j)=>{probe.once('error',j);probe.listen(0,'127.0.0.1',r);});
  const port=probe.address().port; await new Promise(r=>probe.close(r)); result.appOrigin='http://127.0.0.1:'+port;
  const pkg=JSON.parse(await readFile(path.join(app.workingCopy,'package.json')));
  assert.equal(pkg.scripts.dev,'vite');
  const args=[path.join(app.workingCopy,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'];
  const env={PATH:path.dirname(scenario.nodeExecutable)+':/usr/bin:/bin',LANG:'C.UTF-8',CI:'1',npm_package_version:pkg.version};
  result.command={executable:scenario.nodeExecutable,node:scenario.nodeVersion,args,cwd:app.workingCopy,env,relation:'original dev script vite; owned direct child'};
  await writeFile(out+'/registration.json',JSON.stringify({...result,appSourceBefore:result.sourceBefore},null,2),{flag:'wx'});
  vite=spawn(scenario.nodeExecutable,args,{cwd:app.workingCopy,env,stdio:['ignore','pipe','pipe']});
  vite.once('error',e=>{viteFailure=e;}); for (const stream of [vite.stdout,vite.stderr]) stream.on('data',d=>{viteOutput+=d;});
  await waitFor(()=>{if(viteFailure)throw viteFailure;if(vite.exitCode!==null||vite.signalCode!==null)throw Error('Owned Vite exited before readiness');const plain=stripVTControlCharacters(viteOutput);return plain.includes('Local:')&&plain.includes(result.appOrigin+'/');},scenario.startupTimeoutMs);
  result.command.ownedPid=vite.pid;
  browser=await startNativeBrowser(out+'/profiles','origin',true,false,[],{extensionPath:h.hosts.standalone}); result.browser=browser.context.browser().version();
  panel=await browser.context.newPage(); await panel.goto('chrome-extension://'+browser.id+'/panel.html'); ui=await observe(panel,'inspector'); downloads=await nativeDownloads(out+'/profiles/origin',out+'/downloads');
  await check('fresh profile has no saved reports or tab authority',async()=>{assert.deepEqual((await rpc(panel,{op:'list-handoffs'})).entries,[]);assert.deepEqual(await panel.evaluate(async()=>Object.keys((await chrome.storage.session.get('stateport.atom.v1.tabs'))['stateport.atom.v1.tabs']||{})),[]);});
  tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,result.appOrigin+scenario.route); result.tabId=tabId;
  await waitFor(async()=>{const d=await appDOM();return d.ready==='complete'&&d.input===''&&d.count==='0';},scenario.appReadyTimeoutMs);
  await ui.click('refresh-tabs');await ui.waitOK();await ui.select('tabs',tabId);await ui.waitOK();await ui.click('attach');await ui.waitOK();
  await appCommand('Emulation.setDeviceMetricsOverride',{...scenario.viewport,deviceScaleFactor:1,mobile:false});
  await panel.evaluate(async id=>{globalThis.__v03AppLogs=[];chrome.debugger.onEvent.addListener((source,method,p)=>{if(source.tabId===id&&(method==='Runtime.exceptionThrown'||method==='Runtime.consoleAPICalled'&&['error','warning','warn'].includes(p.type)||method==='Log.entryAdded'&&['error','warning'].includes(p.entry.level)))globalThis.__v03AppLogs.push({method,params:p});});await chrome.debugger.sendCommand({tabId:id},'Runtime.enable');await chrome.debugger.sendCommand({tabId:id},'Log.enable');},tabId);
  await check('original text-statistics page renders empty textarea and Character count0',async()=>{result.appBefore=await appDOM();assert.equal(result.appBefore.url,result.appOrigin+scenario.route);assert.equal(result.appBefore.label,scenario.countLabel);assert.equal(result.appBefore.count,'0');assert.deepEqual(result.appBefore.statistics,['0','0','0','0 Bytes']);});
  await writeFile(out+'/app-first-viewport.png',Buffer.from((await appCommand('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await pointer(scenario.countSelector);await waitFor(async()=>(await state()).selection);
  await check('native picker identifies exact visible statistic span with Unknown read-only provenance',async()=>{const s=await state();assert.equal(s.selection.tag,'span');assert.equal(s.selection.value,'0');assert.equal(s.selection.property,'text');assert.equal(s.readOnly,true);assert.equal(s.analysis.capabilities.sourceResolver,'unavailable');assert.equal(s.analysis.stateatom.runtime.status,'Unknown/Unsupported');assert.equal(await panel.evaluate(async({id,selected,target})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:(a,b)=>document.querySelector(a)===document.querySelector(b),args:[selected,target]}))[0].result,{id:tabId,selected:s.selection.selector,target:scenario.countSelector}),true);result.selectionBefore=s.selection;});
  await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='cancelled');
  await check('Cancel preserves selected occurrence and empty app state',async()=>{assert.equal((await state()).selection.domIdentity.node,result.selectionBefore.domIdentity.node);const d=await appDOM();assert.equal(d.input,'');assert.equal(d.count,'0');assert.equal(d.url,result.appOrigin+scenario.route);});
  await ui.click('diagnostic-toggle');const old=await save('V03 independent Vue: original empty input and Character count0');
  await check('original0 saved snapshot is historical and Unknown',async()=>{assert.equal(old.parsed.target.value,'0');assert.equal(old.parsed.kind,'historical-diagnostic');assert.equal(old.parsed.runtime.status,'Unknown/Unsupported');result.originalSnapshot={id:old.parsed.id,sha256:sha256(old.raw)};await writeFile(out+'/before.stateatom.json',old.raw);});
  await pointer(scenario.inputSelector);await appCommand('Input.insertText',{text:scenario.input});await waitFor(async()=>(await appDOM()).count===scenario.expectedCount);
  await ui.click('load');await ui.waitOK();
  await check('ordinary native input and Inspect again observe8 without changing saved0 or claiming a producer',async()=>{result.appAfter=await appDOM();assert.equal(result.appAfter.input,scenario.input);assert.deepEqual(result.appAfter.statistics,scenario.expectedStatistics);const s=await state();assert.equal(s.selection.value,scenario.expectedCount);assert.notEqual(s.selection.observedAt,result.selectionBefore.observedAt);assert.equal(s.readOnly,true);assert.equal(s.analysis.stateatom.runtime.status,'Unknown/Unsupported');assert.equal((await rpc(panel,{op:'open-handoff',id:old.parsed.id})).raw,old.raw);result.selectionAfter=s.selection;});
  const saved=await save('V03 independent Vue: successful ordinary text entry, not an application bug or Atom intervention');
  const prior=downloads.ids();await ui.click('export-report');await waitFor(()=>panel.evaluate(s=>document.querySelector(s).open,ui.q('export-review')));
  const raw=await panel.evaluate(s=>document.querySelector(s).value,ui.q('export-json')),report=parseDiagnostic(raw);
  await check('explicit v1 review retains8 and Unknown with default content exclusion before download',async()=>{assert.deepEqual(downloads.ids(),prior);assert.equal(raw,saved.raw);assert.equal(report.kind,'historical-diagnostic');assert.equal(report.target.value,scenario.expectedCount);assert.equal(report.runtime.status,'Unknown/Unsupported');assert.equal(report.configuration.ide,false);assert.equal(report.contentPolicy.includeContent,false);assert.equal(report.capturedAt,result.selectionAfter.observedAt);});
  await ui.click('export-confirm');const download=await downloads.next(prior);
  await check('actual native download equals saved and reviewed diagnostic',async()=>{assert.equal(download.raw,raw);result.report={file:download.file,sha256:sha256(raw),bytes:Buffer.byteLength(raw),id:report.id,capturedAt:report.capturedAt,profile:'historical-diagnostic-v1'};});
  await pointer(scenario.inputSelector);
  await appCommand('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
  await appCommand('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
  for(const type of ['keyDown','keyUp'])await appCommand('Input.dispatchKeyEvent',{type,key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});
  await waitFor(async()=>{const d=await appDOM();return d.input===''&&d.count==='0';});await ui.click('load');await ui.waitOK();
  await check('ordinary select-all/delete returns baseline while saved0 and8 remain historical exact bytes',async()=>{assert.equal((await state()).selection.value,'0');assert.equal((await state()).readOnly,true);assert.equal((await rpc(panel,{op:'open-handoff',id:old.parsed.id})).raw,old.raw);assert.equal((await rpc(panel,{op:'open-handoff',id:report.id})).raw,saved.raw);result.appRestored=await appDOM();});
  result.screenshots={desktop:await ui.screenshot(out+'/inspector-desktop.png',{width:1100,focus:'setup-toggle'}),narrow:await ui.screenshot(out+'/inspector-narrow.png',{width:440,focus:'setup-toggle'})};
  result.appConsole=await panel.evaluate(()=>globalThis.__v03AppLogs);
  await ui.close();ui=null;downloads.close();downloads=null;await browser.context.close();browser=null;await stopVite();
  browser=await startNativeBrowser(out+'/profiles','recipient',true,false,[],{extensionPath:h.hosts.standalone});result.readerBrowser=browser.context.browser().version();const reader=await browser.context.newPage();await reader.goto('chrome-extension://'+browser.id+'/reader.html');ui=await observe(reader,'fresh-reader');
  const authority=()=>reader.evaluate(async()=>({session:await chrome.storage.session.get(null),local:await chrome.storage.local.get(null)}));
  const tabs=()=>reader.evaluate(async()=>(await chrome.tabs.query({})).filter(t=>/^https?:/.test(t.url||'')).length);
  result.readerAuthorityBefore=await waitFor(async()=>{const a=await authority();return a.local['stateport.atom.v1.migration']===1?a:null;});
  await check('fresh recipient starts after owned origin app/browser stopped with empty authority',async()=>{assert.equal(result.readerBrowser,result.browser);assert(vite.exitCode!==null||vite.signalCode!==null);assert.equal(await tabs(),0);assert.deepEqual(result.readerAuthorityBefore,{session:{},local:{'stateport.atom.v1.diagnostics':[],'stateport.atom.v1.migration':1}});});
  const requests=[];ui.p.on('Network.requestWillBeSent',e=>requests.push({url:e.request.url,method:e.request.method}));await ui.p.send('Network.enable');
  await ui.files('#diagnostic-file',[download.file]);await waitFor(()=>reader.evaluate(()=>document.getElementById('reader-status').textContent.startsWith('Imported')));
  await check('passive reader renders historical8 Unknown and untrusted without app authority or import requests',async()=>{result.reader=await reader.evaluate(()=>({status:document.getElementById('reader-status').textContent,summary:document.getElementById('reader-summary').textContent}));assert.match(result.reader.status,/historical.*untrusted claims, not reverified/);assert.match(result.reader.summary,/text = "8"/);assert.match(result.reader.summary,/Unknown\/Unsupported/);assert.equal(await tabs(),0);result.readerAuthorityAfter=await authority();assert.deepEqual(result.readerAuthorityAfter,result.readerAuthorityBefore);assert.deepEqual(requests.filter(r=>!r.url.startsWith('chrome-extension://'+browser.id+'/')),[]);result.readerRequests=requests;});
  await ui.p.send('Emulation.setDeviceMetricsOverride',{width:1100,height:900,deviceScaleFactor:1,mobile:false});await reader.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);});await reader.screenshot({path:out+'/reader-desktop.png'});
  await check('owned logs and narrow view healthy; source exceptions limited to preregistered generated files',async()=>{assert.deepEqual(result.errors,[]);assert.deepEqual(result.console,[]);assert.deepEqual(result.appConsole,[]);assert.equal(result.screenshots.desktop.overflow,false);assert.equal(result.screenshots.narrow.overflow,false);result.sourceAfter=await sourceAudit(true);assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);});
  result.status='PASS_INDEPENDENT_VUE_BASIC_NOT_SOURCE_OR_FULL_V03';
} catch(error) {
  result.status='FAIL';result.error=error.stack;process.exitCode=1;console.error(error);
  try{if(panel&&tabId)result.failureAppDOM=await appDOM();}catch{}
  try{if(ui)result.failureUI=await ui.p.send('Runtime.evaluate',{expression:'document.body.innerText',returnByValue:true});}catch{}
} finally {
  await ui?.close().catch(()=>{});downloads?.close();await browser?.context.close().catch(()=>{});await stopVite();
  await writeFile(out+'/vite.log',viteOutput);result.viteLogSha256=sha256(viteOutput);result.inputsAfter=await inputs();
  if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)){result.status='FAIL';result.inputDrift=true;process.exitCode=1;}
  try{result.sourceAfter=await sourceAudit(true);for(const delta of result.sourceAfter.generated)await writeFile(out+'/generated-'+delta.file.replaceAll('/','_'),await readFile(path.join(app.workingCopy,delta.file)));}catch(e){result.status='FAIL';result.sourceError=e.stack;process.exitCode=1;}
  result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/results.json'}));
}
