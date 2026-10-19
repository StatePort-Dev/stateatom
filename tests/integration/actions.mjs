// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {startServer} from '../../scripts/inspection-server.mjs';
import {startIDE,startBrowser,panelFor,atomLocator,pair,chooseTab,approveDevelopment,rpc,waitFor} from '../../scripts/harness.mjs';
import {root} from '../../scripts/vite-config.mjs';
import {fileManifest} from '../../scripts/atom-package-receipt.mjs';
const hostPath=process.env.ATOM_EXTENSION_PATH||root+'/dist/browser',hostBefore=await fileManifest(hostPath);
const atom=selector=>atomLocator(panel,selector);
const tag=process.env.ACTION_TAG||new Date().toISOString().replace(/[:.]/g,'-');if(!/^[\w-]{1,100}$/.test(tag))throw Error('Invalid ACTION_TAG');
const out=root+'/.runtime/action-runs/'+tag,runtime=out+'/profiles';await mkdir(root+'/.runtime/action-runs',{recursive:true});await mkdir(out);await mkdir(runtime);
const inputFiles=['core/action-analysis.mjs','core/action-native.mjs','core/action-explanations.mjs','core/analyzer.mjs','core/bridge.mjs','core/diagnostic.mjs','core/runtime-state.mjs','packages/atom/src/action-ui.mjs','packages/atom/src/runtime.mjs','packages/atom/src/platform.mjs','packages/atom/src/ui.mjs','packages/atom/src/template.mjs','packages/atom/src/atom.css','src/engine/script-transform.mjs','tests/fixtures/inspection/react/actions.tsx','tests/fixtures/inspection/react/action-hooks.ts','dist/browser/worker.js','dist/browser/panel.js','dist/browser/atom.css','dist/ide/extension.cjs'];
async function hashes(){const out={};for(const f of inputFiles)out[f]=createHash('sha256').update(await readFile(root+'/'+f)).digest('hex');return out;}
const beforeHashes=await hashes();
const result={startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,browserPath:'Browser plugin not available; existing sandboxed Playwright MV3 + VS Code harness',checks:[],health:[],cases:[]};
result.host={path:hostPath,panelPath:process.env.ATOM_PANEL_PATH||'panel.html',before:hostBefore};
let ide,browser,server,panel,page;const check=(name,ok)=>{result.checks.push({name,status:ok?'PASS':'FAIL'});assert(ok,name);};
async function inspect(selector){
 const started=performance.now();
 const before=await rpc(panel,{op:'state',tabId:result.tabId});
 if(!await atom('#selector').isVisible())await atom('#selector-details > summary').click();
 await atom('#selector').fill(selector);await atom('#inspect-selector').click();
 const s=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId:result.tabId});return s.selection?.observedAt!==before.selection?.observedAt&&s.selection?.selector===selector&&s.analysis?s:null;},60000);
 await atom('#status').filter({hasText:/^(OK|Error:)/}).waitFor();assert.equal(await atom('#status').innerText(),'OK');
 await writeFile(out+'/latest-inspection.json',JSON.stringify(s,null,2));
 await atom('#action-summary').filter({hasText:/Declared|Unknown/}).waitFor();result.inspectionTimes??=[];result.inspectionTimes.push({selector,ms:Math.round(performance.now()-started)});return s;
}
async function openHandler(s){
 const b=s.analysis.actionBindings.find(b=>b.mechanism==='react-jsx'),loc=b.entry.source||b.binding.source,reset=crypto.randomUUID();
 await writeFile(runtime+'/editor-reset.json',JSON.stringify({id:reset}));await waitFor(async()=>JSON.parse(await readFile(runtime+'/editor-reset-done.json','utf8')).id===reset);
 const at=Date.now();await panel.getByRole('button',{name:/^Open handler in IDE/}).first().click();
 const audit=await waitFor(async()=>{const records=(await readFile(runtime+'/ide-audit.jsonl','utf8')).trim().split('\n').map(JSON.parse);return records.find(a=>a.at>=at&&a.file===root+'/'+loc.file&&a.line===loc.line&&a.column===loc.column&&a.endLine===loc.endLine&&a.endColumn===loc.endColumn);});
 check('actual IDE document/selection '+s.selection.selector,!!audit);result.cases.push({selector:s.selection.selector,context:s.analysis.actionContext,binding:b,editor:audit});
}
try{
 ide=await startIDE(runtime,{logDir:out});server=await startServer('B');browser=await startBrowser(runtime,'actions');panel=await panelFor(browser.context,browser.id);page=await browser.context.newPage();
 for(const [p,surface] of [[page,'app'],[panel,'panel']]){p.on('pageerror',e=>result.health.push({surface,error:e.message}));p.on('console',m=>{if(m.type()==='error')result.health.push({surface,console:m.text()});});}
 await pair(panel,ide.conn,'http://127.0.0.1:4173','tests/fixtures/inspection');await atom('#token').fill('');
 await page.goto('http://127.0.0.1:4173/react/actions.html');await page.locator('#hook-one').waitFor();result.tabId=await chooseTab(panel,'/react/actions.html');await approveDevelopment(panel);await atom('#attach').click();await atom('#status').filter({hasText:'OK'}).waitFor();await page.reload();await page.locator('#hook-one').waitFor();
 result.browser=browser.context.browser().version();check('page identity/nonblank/no overlay',await page.title()==='Action Inspector controls'&&await page.locator('button').count()>10&&!await page.locator('vite-error-overlay').count());
 await atom('#property').selectOption('disabled');await atom('#status').filter({hasText:'OK'}).waitFor();
 for(const [id,kind] of [['direct','reference'],['inline','inline'],['hook','reference'],['memo','reference'],['factory','factory'],['prop','reference']]){
  const s=await inspect('#'+id+'-one'),b=s.analysis.actionBindings.find(b=>b.mechanism==='react-jsx');check(id+' exact JSX',!!b&&b.kind===kind&&b.binding.source.sourceDigest.length===64);check(id+' not observed',b.execution.status==='not-observed');if(['direct','hook','memo'].includes(id))await openHandler(s);if(id==='hook')check('custom hook only relevant relation',b.hookRelations.length===1&&b.hookRelations[0].hook==='useOrders');if(id==='factory'||id==='prop')check(id+' unresolved',b.entry.status==='Unknown/Unsupported');
 }
 const one=await inspect('#hook-one'),two=await inspect('#hook-two');check('separate exact DOM instances',one.analysis.actionContext.instance!==two.analysis.actionContext.instance);check('disabled binding never invoked',await page.evaluate(()=>window.actionInvocations)===0&&two.selection.value===true);
 await atom('#actions-nav').click();await panel.screenshot({path:out+'/actions-desktop.png',fullPage:false});await panel.setViewportSize({width:390,height:844});await panel.screenshot({path:out+'/actions-narrow.png',fullPage:false});check('narrow no overflow',await panel.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await atom('#action-explain').click();check('cancel hidden and excluded from keyboard',!await atom('#action-cancel').isVisible());await atom('#action-explain').focus();await panel.keyboard.press('Enter');check('keyboard explanation activation',/not observed/.test(await atom('#action-explanation').innerText()));check('template explanation',/not observed/.test(await atom('#action-explanation').innerText()));
 const availability=await panel.evaluate(async()=>{if(!globalThis.LanguageModel)return 'API missing';try{return await LanguageModel.availability({expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:[{type:'text',languages:['en']}]});}catch{return 'unavailable';}});result.localAI={availability,actualModelRun:false,reason:'No automated model download; real-device quality/latency acceptance remains separate.'};
 await atom('#diagnostic-toggle').click();await atom('#save-report').click();await atom('#diagnostic-status').filter({hasText:/Saved/}).waitFor();await atom('#export-report').click();const report=JSON.parse(await atom('#export-json').inputValue());check('reviewed diagnostic retains actions without excerpts',report.runtime.actionBindings.some(b=>b.mechanism==='react-jsx')&&report.runtime.actionBindings.every(b=>!b.binding?.expression));await atom('#export-cancel').click();
 const native=await inspect('#native-action');check('native selected registration',native.analysis.actionBindings.some(b=>b.mechanism==='dom-listener'&&b.registeredOn==='selected-element'&&b.event==='click'&&b.once));check('delegation distinct',native.analysis.actionBindings.filter(b=>b.registeredOn!=='selected-element').every(b=>b.entry.status==='Unknown/Unsupported'));
 const old=await inspect('#direct-one');await page.locator('#direct-one').evaluate(e=>e.replaceWith(e.cloneNode(true)));await rpc(panel,{op:'state',tabId:result.tabId,refreshDeep:true});await atom('#refresh-tabs').click();await atom('#action-summary').filter({hasText:'Stale'}).waitFor();check('DOM replacement stale',await atom('#action-explain').isDisabled());
 await page.reload();await page.locator('#direct-one').waitFor();await inspect('#direct-one');await page.reload();await atom('#action-summary').filter({hasText:'Stale'}).waitFor();check('navigation stale',await atom('#action-explain').isDisabled());
 await rpc(panel,{op:'unpair'});const basic=await inspect('#native-action');check('browser-only native fallback without IDE',basic.analysis.capabilities.sourceResolver==='unavailable'&&basic.analysis.actionBindings.some(b=>b.registeredOn==='selected-element'&&b.event==='click'));await rpc(panel,{op:'detach',tabId:result.tabId});await atom('#refresh-tabs').click();await atom('#action-summary').filter({hasText:'Stale'}).waitFor();check('detach stale',await atom('#action-explain').isDisabled());
 result.status='PASS';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;console.error(e);if(panel)await panel.screenshot({path:out+'/failure.png'}).catch(()=>{});}
finally{for(const [name,fn] of [['browser',()=>browser?.context.close()],['server',()=>server?.close()],['ide',()=>ide?.close(false)]])try{await fn();}catch(e){result.health.push({cleanup:name,error:e.message});process.exitCode=1;result.status='FAIL';}result.host.after=await fileManifest(hostPath);if(JSON.stringify(result.host.before)!==JSON.stringify(result.host.after)){result.status='FAIL';process.exitCode=1;result.health.push({error:'Installed host changed during run'});}result.finishedAt=new Date().toISOString();result.inputDigests={before:beforeHashes,after:await hashes()};if(JSON.stringify(result.inputDigests.before)!==JSON.stringify(result.inputDigests.after)){result.status='FAIL';result.health.push({error:'Input bytes changed during the run'});process.exitCode=1;}await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out);}
