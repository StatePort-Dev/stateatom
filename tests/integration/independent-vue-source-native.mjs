// SPDX-License-Identifier: Apache-2.0
// Independent app runtime is unchanged; Atom alone owns its debugger attachment.
import assert from 'node:assert/strict';
import path from 'node:path';
import {createServer} from 'node:http';
import {spawn, execFileSync} from 'node:child_process';
import {stripVTControlCharacters} from 'node:util';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {rpc, waitFor, startIDE} from '../../scripts/harness.mjs';
import net from 'node:net';
import {sha256, fileManifest, verifyArtifactHashes, inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {parseDiagnostic} from '../../core/diagnostic.mjs';
import {nativeInspectorUI, nativeDownloads} from '../helpers/native-inspector-ui.mjs';

const [handoffFile, dependencyFile, caseArgument] = process.argv.slice(2);
assert([4,5].includes(process.argv.length), 'Exact Atom handoff, dependency receipt and optional registered case required');
const caseFile = caseArgument || 'docs/testing/independent-vue-source-case.json';
const scenario = JSON.parse(await readFile(caseFile));
const h = JSON.parse(await readFile(handoffFile));
const consumer = JSON.parse(await readFile(scenario.consumerReceipt));
const development = JSON.parse(await readFile(scenario.developmentHandoff));
assert.equal(consumer.status,'PASS_INSTALLED_PROFILE_ADMISSION_NOT_APP_ACCEPTANCE');
assert.equal(development.plugin.version,scenario.expectedPluginVersion);
assert.equal(development.plugin.sha256,scenario.expectedPluginSha256);
assert.equal(development.helper.sha256,scenario.expectedHelperSha256);
assert.equal(development.helper.version,scenario.expectedHelperVersion);
assert.equal(consumer.artifacts.plugin.sha256,development.plugin.sha256);
assert.equal(consumer.artifacts.helper.sha256,development.helper.sha256);
assert.equal(h.package.version, scenario.expectedAtomVersion);
assert.equal(h.ui.version, scenario.expectedUIVersion);
const app = JSON.parse(await readFile(dependencyFile)).apps.find(a => a.slug === 'CorentinTh--it-tools');
assert(app?.originalSourceAndLockFilesMatch && app.status === 'PASS_FROZEN_DEPENDENCY_PREPARATION_NOT_APP_ACCEPTANCE');
assert.equal(execFileSync(scenario.nodeExecutable, ['--version'], {encoding:'utf8'}).trim(), scenario.nodeVersion);
const manifest = JSON.parse(await readFile(app.sourceManifest));
assert.equal(Object.keys(manifest).length, 498);
const out = path.resolve('.artifacts/v03/independent-vue-source/' + new Date().toISOString().replace(/[:.]/g, '-'));
await mkdir(out, {recursive:true});
await writeFile(out + '/driver.mjs', await readFile(new URL(import.meta.url)));
const registered = [...new Set([...Object.keys({...h.sourceManifest, ...h.buildSources.manifest}), caseFile,
  'docs/testing/independent-apps.json', 'tests/integration/independent-vue-source-native.mjs',
  'tests/helpers/native-inspector-ui.mjs', 'scripts/native-browser.mjs', 'scripts/harness.mjs',
  handoffFile, dependencyFile, app.sourceManifest, scenario.developmentHandoff, scenario.consumerReceipt,
  'scripts/ide-runner.mjs','scripts/installed-helper.mjs','scripts/owned-ide-endpoint.mjs','scripts/code-sandbox-wrapper.sh','tests/ide-host.cjs',
  ...Object.keys(development.sourceManifest),development.plugin.file,development.helper.file,
  ...Object.keys(consumer.installedPlugin.files).map(f=>path.join(consumer.installedPlugin.path,f))])];
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
const result = {schema:'stateatom.v03-independent-vue-source/1', status:'RUNNING', startedAt:new Date().toISOString(),
  revision:execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim(),
  sourceDirty:!!execFileSync('git', ['status', '--porcelain'], {encoding:'utf8'}).trim(),
  handoff:{file:handoffFile, package:h.package, ui:h.ui}, scenario,
  application:{repository:'https://github.com/' + scenario.application, revision:scenario.revision, workingCopy:app.workingCopy, installedVersions:app.installedVersions},
  checks:[], errors:[], console:[], inputsBefore:await inputs()};
const check = async (name, fn) => {await fn(); result.checks.push({name, status:'PASS'}); console.log('PASS', name);};
let vite, browser, ui, downloads, panel, tabId, ide, ideOpened=false, viteOutput = '', viteFailure;
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
  input:document.querySelector(input)?.value, disabled:document.querySelector(input)?.disabled, inputCount:document.querySelectorAll(input).length, count:document.querySelector(count)?.textContent.trim(),
  overlay:document.querySelector('vite-error-overlay')?.shadowRoot?.textContent.slice(0,12000),
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
async function freePort(){const p=createServer();await new Promise((r,j)=>{p.once('error',j);p.listen(0,'127.0.0.1',r);});const port=p.address().port;await new Promise(r=>p.close(r));return port;}
async function connectSource(){
  const occupied=await new Promise(resolve=>{const s=net.createConnection({host:'127.0.0.1',port:49331});s.setTimeout(1000);s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(true);});});
  assert.equal(occupied,false,'Own IDE debug port occupied; no existing process adopted or stopped');
  const runtime=out+'/ide-profile',helperPort=await freePort();
  ide=await startIDE(runtime,{logDir:out+'/ide-logs',installedVsix:development.helper.file,projectRoot:app.workingCopy,ownedEndpoint:true,userSettings:{'stateatom.appOrigin':result.appOrigin,'stateatom.sourceFolder':'.','stateatom.helperPort':helperPort}});
  result.installedHelper=JSON.parse(await readFile(runtime+'/installed-helper-host.json'));
  assert.equal(result.installedHelper.loadedFromIsolatedInstallation,true);assert.equal(result.installedHelper.vsixSha256,development.helper.sha256);
  assert.equal(ide.conn.root,app.workingCopy);assert.equal(new URL(ide.conn.url).port,String(helperPort));
  // The host writes connection.json before the public copy-receipt command
  // finishes. Wait for its complete private output, never synthesize a receipt.
  const {raw,receipt}=await waitFor(async()=>{const raw=await readFile(runtime+'/private-receipt.json','utf8');return{raw,receipt:JSON.parse(raw)};});
  assert.equal(receipt.origin,result.appOrigin);assert.equal(receipt.sourceRoot,'.');assert.equal(receipt.helper.session,ide.conn.helper.session);
  await ui.fill('connection-receipt',raw);await ui.click('connect-receipt');await ui.waitOK();
  assert.equal(await panel.evaluate(s=>document.querySelector(s).value,ui.q('connection-receipt')),'');
  result.privateReceipt={file:runtime+'/private-receipt.json',sha256:sha256(raw),publicCommandCopied:true,secretCleared:true};
  // Collect from a fresh original page load after exact-origin/source admission.
  const before=(await appCommand('Page.getFrameTree',{})).frameTree.frame.loaderId;
  await appCommand('Page.reload',{ignoreCache:true});await waitFor(async()=>{const frame=(await appCommand('Page.getFrameTree',{})).frameTree.frame;const d=await appDOM();return frame.loaderId!==before&&d.input===''&&d.count==='0';},scenario.appReadyTimeoutMs);
  const current=await state();assert.equal(current.connection.mode,'development');assert.deepEqual([...current.connection.actions].sort(),[...scenario.developmentActions].sort());
  result.connectionSetup={mode:current.connection.mode,actions:current.connection.actions,readOnly:current.readOnly,installedVSIX:true,ownedEndpoint:true,helperPort};
  assert.equal(result.connectionSetup.readOnly,scenario.expectedDevelopmentReadOnly);
  result.checks.push({name:'actual installed VSIX/private receipt/native source connect and exact-origin cache/reload admission',status:'PASS'});
}
async function selectedSource(s){
  assert.equal(s.selection.tag,'textarea');assert.equal(s.selection.value,false);assert.equal(s.selection.property,'disabled');assert.equal(s.selection.markerOnSelected,true);
  assert.equal(s.readOnly,scenario.expectedDevelopmentReadOnly);assert.equal(s.analysis.capabilities.sourceResolver,'open-ide');assert.equal(s.analysis.stateatom.runtime.status,'Observed');
  assert.equal(await panel.evaluate(async({id,selected,target})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:(a,b)=>document.querySelector(a)===document.querySelector(b),args:[selected,target]}))[0].result,{id:tabId,selected:s.selection.selector,target:scenario.selectionSelector}),true);
  const links=s.analysis.sources.filter(x=>x.file===scenario.expectedSource&&x.expressions?.includes(scenario.expectedExpression));assert.equal(links.length,1,'Exact selected original disabled expression');
  const source=links[0];assert.equal(source.sourceDigest,manifest[scenario.expectedSource]);
  const reads=s.analysis.stateatom.runtime.nodes.filter(n=>n.status==='Observed'&&n.kind!=='target'&&n.expression===scenario.requiredObservedScalarRead.expression&&n.value===scenario.requiredObservedScalarRead.value);assert(reads.length,'Actual selected scalar disabled read, not a nearby equal value');
  return source;
}
async function openSelectedSource(){
  const s=await state(),source=await selectedSource(s),runtime=out+'/ide-profile',reset=crypto.randomUUID();
  await writeFile(runtime+'/editor-reset.tmp',JSON.stringify({id:reset}));const{rename}=await import('node:fs/promises');await rename(runtime+'/editor-reset.tmp',runtime+'/editor-reset.json');
  await waitFor(async()=>JSON.parse(await readFile(runtime+'/editor-reset-done.json')).id===reset);
  let prior='';try{prior=await readFile(runtime+'/ide-audit.jsonl','utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
  await ui.click('source-nav');const index=s.analysis.sources.indexOf(source);await ui.p.send('Page.bringToFront');
  await panel.evaluate(({selector,index})=>{const e=document.querySelectorAll(selector+' button')[index];if(!e)throw Error('Missing original source button');for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS')a.open=true;e.scrollIntoView({block:'center'});e.focus();},{selector:ui.q('sources'),index});await ui.key('Enter','Enter',13);
  const audit=await waitFor(async()=>(await readFile(runtime+'/ide-audit.jsonl','utf8')).slice(prior.length).split('\n').filter(Boolean).map(JSON.parse).find(a=>a.file===path.join(app.workingCopy,source.file)&&['line','column','endLine','endColumn'].every(k=>a[k]===source[k])));
  const raw=await readFile(path.join(app.workingCopy,source.file),'utf8'),lines=raw.split('\n'),fragment=source.line===source.endLine?lines[source.line-1].slice(source.column-1,source.endColumn-1):lines.slice(source.line-1,source.endLine).map((l,i,a)=>i===0?l.slice(source.column-1):i===a.length-1?l.slice(0,source.endColumn-1):l).join('\n');
  assert.equal(audit.selectedText,fragment.slice(0,300));assert.equal(audit.observedBy,'VS Code window.activeTextEditor API');return {source,audit};
}

try {
  await check('exact supplied pair, standalone host, build inputs and all498 original files', async () => {
    await verifyArtifactHashes([h.package,h.ui]); await inspectInstalledPair(h.consumer,h.consumerReceipt);
    assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);
    for (const [f,hash] of Object.entries({...h.sourceManifest,...h.buildSources.manifest})) assert.equal(sha256(await readFile(f)),hash,f);
    for (const [name, v] of Object.entries(app.installedVersions)) assert.equal(sha256(await readFile(path.join(app.workingCopy,'node_modules',name,'package.json'))),v.packageJsonSha256,name);
    result.sourceBefore=await sourceAudit(true);
    assert.deepEqual(result.sourceBefore.generated.map(d=>({file:d.file,sha256:d.after})),scenario.initialGeneratedDeltas);
    assert.equal(consumer.appRoot,app.workingCopy);
    await verifyArtifactHashes([development.plugin,development.helper]);
    for(const [f,hash]of Object.entries(development.sourceManifest))assert.equal(sha256(await readFile(f)),hash,f);
    assert.deepEqual(await fileManifest(consumer.installedPlugin.path),consumer.installedPlugin.files);
  });
  const probe=createServer(); await new Promise((r,j)=>{probe.once('error',j);probe.listen(0,'127.0.0.1',r);});
  const port=probe.address().port; await new Promise(r=>probe.close(r)); result.appOrigin='http://127.0.0.1:'+port;
  const pkg=JSON.parse(await readFile(path.join(app.workingCopy,'package.json')));
  assert.equal(pkg.scripts.dev,'vite');
  const configFile=path.join(consumer.consumer,'stateatom-connected-'+path.basename(out)+'.config.mjs');
  const config=`import original from ${JSON.stringify(path.join(app.workingCopy,'vite.config.ts'))};\nimport {stateatomPlugin} from '@stateport/vite-plugin';\nexport default {...original,root:${JSON.stringify(app.workingCopy)},cacheDir:${JSON.stringify(out+'/vite-cache')},plugins:[stateatomPlugin({enabled:true,profile:'vue3',root:${JSON.stringify(app.workingCopy)}}),...original.plugins]};\n`;
  await writeFile(configFile,config,{flag:'wx'});result.overlayConfig={file:configFile,sha256:sha256(config),assistance:'Original config imported; only installed plugin/root/private cache added'};
  const args=[path.join(consumer.consumer,'node_modules/vite/bin/vite.js'),'--config',configFile,'--host','127.0.0.1','--port',String(port),'--strictPort'];
  const env={PATH:path.dirname(scenario.nodeExecutable)+':/usr/bin:/bin',LANG:'C.UTF-8',CI:'1',npm_package_version:pkg.version};
  result.command={executable:scenario.nodeExecutable,node:scenario.nodeVersion,args,cwd:app.workingCopy,env,relation:'original dev script vite; actual installed Vite4 plus explicit private plugin config overlay'};
  await writeFile(out+'/registration.json',JSON.stringify({...result,appSourceBefore:result.sourceBefore},null,2),{flag:'wx'});
  vite=spawn(scenario.nodeExecutable,args,{cwd:app.workingCopy,env,stdio:['ignore','pipe','pipe']});
  vite.once('error',e=>{viteFailure=e;}); for (const stream of [vite.stdout,vite.stderr]) stream.on('data',d=>{viteOutput+=d;});
  await waitFor(()=>{if(viteFailure)throw viteFailure;if(vite.exitCode!==null||vite.signalCode!==null)throw Error('Owned Vite exited before readiness');const plain=stripVTControlCharacters(viteOutput);return plain.includes('Local:')&&plain.includes(result.appOrigin+'/');},scenario.startupTimeoutMs);
  result.command.ownedPid=vite.pid;
  // Browser stderr captures pre-attach module errors without an app CDP sidecar
  // or injected application listeners. Acceptance order and timeout stay intact.
  browser=await startNativeBrowser(out+'/profiles','origin',true,false,['--enable-logging=stderr','--log-level=0'],{extensionPath:h.hosts.standalone}); result.browser=browser.context.browser().version();
  panel=await browser.context.newPage(); await panel.goto('chrome-extension://'+browser.id+'/panel.html'); ui=await observe(panel,'inspector'); downloads=await nativeDownloads(out+'/profiles/origin',out+'/downloads');
  await check('fresh profile has no saved reports or tab authority',async()=>{assert.deepEqual((await rpc(panel,{op:'list-handoffs'})).entries,[]);assert.deepEqual(await panel.evaluate(async()=>Object.keys((await chrome.storage.session.get('stateport.atom.v1.tabs'))['stateport.atom.v1.tabs']||{})),[]);});
  tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,result.appOrigin+scenario.route); result.tabId=tabId;
  await waitFor(async()=>{const d=await appDOM();return d.ready==='complete'&&d.input===''&&d.count==='0';},scenario.appReadyTimeoutMs);
  await ui.click('refresh-tabs');await ui.waitOK();await ui.select('tabs',tabId);await ui.waitOK();
  await ui.select('site-mode','development');
  for(const name of ['cache','reload','override','replay']){const expected=scenario.developmentActions.includes(name);if(await panel.evaluate(s=>document.querySelector(s).checked,ui.q('site-'+name))!==expected)await ui.click('site-'+name);}
  await ui.click('save-site');await ui.waitOK();await ui.click('attach');await ui.waitOK();
  await panel.evaluate(async id=>{globalThis.__v03AppLogs=[];chrome.debugger.onEvent.addListener((source,method,p)=>{if(source.tabId===id&&(method==='Runtime.exceptionThrown'||method==='Runtime.consoleAPICalled'&&['error','warning','warn'].includes(p.type)||method==='Log.entryAdded'&&['error','warning'].includes(p.entry.level)))globalThis.__v03AppLogs.push({method,params:p});});await chrome.debugger.sendCommand({tabId:id},'Runtime.enable');await chrome.debugger.sendCommand({tabId:id},'Log.enable');},tabId);
  await connectSource();
  await appCommand('Emulation.setDeviceMetricsOverride',{...scenario.viewport,deviceScaleFactor:1,mobile:false});
  await check('original text-statistics page renders empty textarea and Character count0',async()=>{result.appBefore=await appDOM();assert.equal(result.appBefore.url,result.appOrigin+scenario.route);assert.equal(result.appBefore.inputCount,1);assert.equal(result.appBefore.disabled,false);assert.equal(result.appBefore.count,'0');assert.deepEqual(result.appBefore.statistics,['0','0','0','0 Bytes']);});
  await writeFile(out+'/app-first-viewport.png',Buffer.from((await appCommand('Page.captureScreenshot',{format:'png'})).data,'base64'));
  await ui.select('property',scenario.property);await ui.waitOK();await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await pointer(scenario.selectionSelector);await waitFor(async()=>(await state()).selection);
  await check('native picker and installed helper bind exact textarea disabled expression and original scalar read',async()=>{
    const s=await state();await selectedSource(s);result.selectionBefore=s.selection;
    const file=out+'/source-before-state.json';await writeFile(file,JSON.stringify(s,null,2),{mode:0o600});result.sourceBeforeState={file,sha256:sha256(await readFile(file))};
  });
  await check('native Open in IDE selects exact original SFC range in installed helper host',async()=>{result.opened=await openSelectedSource();ideOpened=true;});
  await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='cancelled');
  await check('Cancel preserves selected occurrence and empty app state',async()=>{assert.equal((await state()).selection.domIdentity.node,result.selectionBefore.domIdentity.node);const d=await appDOM();assert.equal(d.input,'');assert.equal(d.count,'0');assert.equal(d.url,result.appOrigin+scenario.route);});
  await ui.click('diagnostic-toggle');const old=await save('V03 independent Vue: original textarea disabled=false; selected source read, parent/default/consumer ancestry unknown');
  await check('original disabled=false saved snapshot is historical with selected observed source fragments',async()=>{assert.equal(old.parsed.target.value,false);assert.equal(old.parsed.kind,'historical-diagnostic');assert.equal(old.parsed.runtime.status,'Observed');result.originalSnapshot={id:old.parsed.id,sha256:sha256(old.raw)};await writeFile(out+'/before.stateatom.json',old.raw);});
  await pointer(scenario.inputSelector);await appCommand('Input.insertText',{text:scenario.input});await waitFor(async()=>(await appDOM()).count==='8');
  await ui.click('load');await ui.waitOK();
  await check('ordinary native input retains selected source at a new occurrence, old historical bytes unchanged',async()=>{
    result.appAfter=await appDOM();assert.equal(result.appAfter.input,scenario.input);assert.deepEqual(result.appAfter.statistics,scenario.expectedStatistics);
    const s=await state();await selectedSource(s);assert.notEqual(s.selection.observedAt,result.selectionBefore.observedAt);
    assert.equal((await rpc(panel,{op:'open-handoff',id:old.parsed.id})).raw,old.raw);result.selectionAfter=s.selection;
    const file=out+'/source-after-state.json';await writeFile(file,JSON.stringify(s,null,2),{mode:0o600});result.sourceAfterState={file,sha256:sha256(await readFile(file))};
  });
  const saved=await save('V03 independent Vue: successful ordinary text entry, not an application bug or Atom intervention');
  const prior=downloads.ids();await ui.click('export-report');await waitFor(()=>panel.evaluate(s=>document.querySelector(s).open,ui.q('export-review')));
  const raw=await panel.evaluate(s=>document.querySelector(s).value,ui.q('export-json')),report=parseDiagnostic(raw);
  await check('explicit v1 review retains selected disabled=false source fragments with default exclusions before download',async()=>{assert.deepEqual(downloads.ids(),prior);assert.equal(raw,saved.raw);assert.equal(report.kind,'historical-diagnostic');assert.equal(report.target.value,false);assert.equal(report.runtime.status,'Observed');assert.equal(report.configuration.ide,true);assert.equal(report.contentPolicy.includeContent,false);assert.equal(report.capturedAt,result.selectionAfter.observedAt);});
  await ui.click('export-confirm');const download=await downloads.next(prior);
  await check('actual native download equals saved and reviewed diagnostic',async()=>{assert.equal(download.raw,raw);result.report={file:download.file,sha256:sha256(raw),bytes:Buffer.byteLength(raw),id:report.id,capturedAt:report.capturedAt,profile:'historical-diagnostic-v1'};});
  await pointer(scenario.inputSelector);
  await appCommand('Input.dispatchKeyEvent',{type:'keyDown',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
  await appCommand('Input.dispatchKeyEvent',{type:'keyUp',key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:2});
  for(const type of ['keyDown','keyUp'])await appCommand('Input.dispatchKeyEvent',{type,key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8});
  await waitFor(async()=>{const d=await appDOM();return d.input===''&&d.count==='0';});await ui.click('load');await ui.waitOK();
  await check('ordinary select-all/delete returns baseline while both selected source snapshots remain exact',async()=>{await selectedSource(await state());assert.equal((await rpc(panel,{op:'open-handoff',id:old.parsed.id})).raw,old.raw);assert.equal((await rpc(panel,{op:'open-handoff',id:report.id})).raw,saved.raw);result.appRestored=await appDOM();});
  result.screenshots={desktop:await ui.screenshot(out+'/inspector-desktop.png',{width:1100,focus:'setup-toggle'}),narrow:await ui.screenshot(out+'/inspector-narrow.png',{width:440,focus:'setup-toggle'})};
  await ui.click('unpair');await ui.waitOK();await ui.click('load');await ui.waitOK();
  await check('Disconnect source keeps Basic disabled=false and historical source files without live source authority',async()=>{const s=await state();assert.equal(s.selection.value,false);assert.equal(s.analysis.capabilities.sourceResolver,'unavailable');assert.equal(s.analysis.stateatom.runtime.status,'Unknown/Unsupported');assert.equal((await rpc(panel,{op:'open-handoff',id:report.id})).raw,saved.raw);});
  result.appConsole=await panel.evaluate(()=>globalThis.__v03AppLogs);
  await ui.close();ui=null;downloads.close();downloads=null;await browser.context.close();browser=null;await stopVite();await ide.close(true);ide=null;result.originHelperClosed=true;
  browser=await startNativeBrowser(out+'/profiles','recipient',true,false,[],{extensionPath:h.hosts.standalone});result.readerBrowser=browser.context.browser().version();const reader=await browser.context.newPage();await reader.goto('chrome-extension://'+browser.id+'/reader.html');ui=await observe(reader,'fresh-reader');
  const authority=()=>reader.evaluate(async()=>({session:await chrome.storage.session.get(null),local:await chrome.storage.local.get(null)}));
  const tabs=()=>reader.evaluate(async()=>(await chrome.tabs.query({})).filter(t=>/^https?:/.test(t.url||'')).length);
  result.readerAuthorityBefore=await waitFor(async()=>{const a=await authority();return a.local['stateport.atom.v1.migration']===1?a:null;});
  await check('fresh recipient starts after owned origin app/browser stopped with empty authority',async()=>{assert.equal(result.readerBrowser,result.browser);assert(vite.exitCode!==null||vite.signalCode!==null);assert.equal(await tabs(),0);assert.deepEqual(result.readerAuthorityBefore,{session:{},local:{'stateport.atom.v1.diagnostics':[],'stateport.atom.v1.migration':1}});});
  const requests=[];ui.p.on('Network.requestWillBeSent',e=>requests.push({url:e.request.url,method:e.request.method}));await ui.p.send('Network.enable');
  await ui.files('#diagnostic-file',[download.file]);await waitFor(()=>reader.evaluate(()=>document.getElementById('reader-status').textContent.startsWith('Imported')));
  await check('passive reader renders historical disabled=false source claims as untrusted without authority or import requests',async()=>{result.reader=await reader.evaluate(()=>({status:document.getElementById('reader-status').textContent,summary:document.getElementById('reader-summary').textContent}));assert.match(result.reader.status,/historical.*untrusted claims, not reverified/);assert.match(result.reader.summary,/disabled = false/);assert.match(result.reader.summary,/Observed/);assert.equal(result.originHelperClosed,true);assert.equal(await tabs(),0);result.readerAuthorityAfter=await authority();assert.deepEqual(result.readerAuthorityAfter,result.readerAuthorityBefore);assert.deepEqual(requests.filter(r=>!r.url.startsWith('chrome-extension://'+browser.id+'/')),[]);result.readerRequests=requests;});
  await ui.p.send('Emulation.setDeviceMetricsOverride',{width:1100,height:900,deviceScaleFactor:1,mobile:false});await reader.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);});await reader.screenshot({path:out+'/reader-desktop.png'});
  await check('owned logs and narrow view healthy; source exceptions limited to preregistered generated files',async()=>{assert.deepEqual(result.errors,[]);assert.deepEqual(result.console,[]);assert.deepEqual(result.appConsole,[]);assert.equal(result.screenshots.desktop.overflow,false);assert.equal(result.screenshots.narrow.overflow,false);result.sourceAfter=await sourceAudit(true);assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);});
  result.status='PASS_INSTALLED_INDEPENDENT_VUE_SELECTED_SOURCE_NOT_FULL_C09_OR_V03';
} catch(error) {
  result.status='FAIL';result.error=error.stack;process.exitCode=1;console.error(error);
  try{if(panel&&tabId)result.failureAppDOM=await appDOM();}catch{}
  try{if(ui)result.failureUI=await ui.p.send('Runtime.evaluate',{expression:'document.body.innerText',returnByValue:true});}catch{}
} finally {
  await ui?.close().catch(()=>{});downloads?.close();await browser?.context.close().catch(()=>{});await stopVite();
  if(ide)try{await ide.close(ideOpened);ide=null;result.originHelperClosed=true;}catch(e){result.status='FAIL';result.helperCleanupError=e.message;process.exitCode=1;}
  await writeFile(out+'/vite.log',viteOutput);result.viteLogSha256=sha256(viteOutput);result.inputsAfter=await inputs();
  try{if(result.overlayConfig)assert.equal(sha256(await readFile(result.overlayConfig.file)),result.overlayConfig.sha256);}catch(e){result.status='FAIL';result.configDriftError=e.message;process.exitCode=1;}
  if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)){result.status='FAIL';result.inputDrift=true;process.exitCode=1;}
  try{result.sourceAfter=await sourceAudit(true);for(const delta of result.sourceAfter.generated)await writeFile(out+'/generated-'+delta.file.replaceAll('/','_'),await readFile(path.join(app.workingCopy,delta.file)));}catch(e){result.status='FAIL';result.sourceError=e.stack;process.exitCode=1;}
  result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2),{mode:0o600});console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/results.json'}));
}
