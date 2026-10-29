// SPDX-License-Identifier: Apache-2.0
// Actual unchanged independent app; only Atom owns its debugger attachment.
import assert from 'node:assert/strict';
import path from 'node:path';
import {createServer} from 'node:http';
import {spawn,execFileSync} from 'node:child_process';
import {stripVTControlCharacters} from 'node:util';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {sourceAccessDesktop} from '../helpers/source-access-native-desktop.mjs';
import {installGuideExtension} from '../helpers/guide-extension-install.mjs';
import {rpc,waitFor} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {parseDiagnostic} from '../../core/diagnostic.mjs';
import {parseHandoffReport} from '../../core/handoff-files.mjs';
import {nativeInspectorUI,nativeDownloads} from '../helpers/native-inspector-ui.mjs';

const [handoffFile,dependencyFile,caseArgument]=process.argv.slice(2);
assert(handoffFile&&dependencyFile&&[4,5].includes(process.argv.length),'Exact Atom handoff, prepared dependency receipt and optional registered case required');
const h=JSON.parse(await readFile(handoffFile)),dependencies=JSON.parse(await readFile(dependencyFile));
const app=dependencies.apps.find(a=>a.slug==='Serkanbyx--e-commerce-frontend');
assert(app?.originalSourceAndLockFilesMatch&&app.status==='PASS_FROZEN_DEPENDENCY_PREPARATION_NOT_APP_ACCEPTANCE');
const caseFile=caseArgument||'docs/testing/independent-react-basic-case.json',scenario=JSON.parse(await readFile(caseFile));
if(scenario.expectedAtomVersion)assert.equal(h.package.version,scenario.expectedAtomVersion);
if(scenario.expectedUIVersion)assert.equal(h.ui.version,scenario.expectedUIVersion);
const guide=scenario.guideInstall;
if(guide){assert.equal(guide.mode,'chrome-ui-native-folder');assert(!scenario.previousReaderHandoff,'Old reader refusal is historical, not part of this installation question');for(const[f,hash]of Object.entries(guide.inputHashes))assert.equal(sha256(await readFile(f)),hash,f);}
const previous=scenario.previousReaderHandoff?JSON.parse(await readFile(scenario.previousReaderHandoff)):null;
if(previous)assert.equal(previous.package.version,'0.1.0-candidate.20261021.65');
const sourceManifest=JSON.parse(await readFile(app.sourceManifest));
const out=path.resolve('.artifacts/u04/current-handoff/'+new Date().toISOString().replace(/[:.]/g,'-'));
await mkdir(out,{recursive:true});
await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const registered=[...new Set([...Object.keys({...h.sourceManifest,...h.buildSources.manifest}),caseFile,'docs/testing/independent-apps.json','tests/integration/current-handoff-native.mjs','tests/helpers/native-inspector-ui.mjs','scripts/native-browser.mjs','scripts/harness.mjs',app.sourceManifest,dependencyFile,handoffFile,...(previous?[scenario.previousReaderHandoff]:[]),...(guide?Object.keys(guide.inputHashes):[])])];
const inputs=async()=>Object.fromEntries(await Promise.all(registered.map(async f=>[f,sha256(await readFile(f))])));
async function originalSources(){for(const [f,hash] of Object.entries(sourceManifest)){assert.equal(sha256(await readFile(path.join(app.workingCopy,f))),hash,'working source '+f);assert.equal(sha256(await readFile(path.join(app.immutableSource,f))),hash,'immutable source '+f);}return Object.keys(sourceManifest).length;}
const result={schema:'stateatom.v03-independent-react-basic/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),handoff:{file:handoffFile,package:h.package,ui:h.ui},application:{repository:'https://github.com/'+scenario.application,revision:scenario.revision,workingCopy:app.workingCopy,installedVersions:app.installedVersions},configuration:scenario.environment,limits:scenario.limits,checks:[],errors:[],console:[],traffic:[],inputsBefore:await inputs()};
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
let desktop;
let api,vite,browser,ui,downloads,viteOutput='',viteFailure,failureAppProbe,failureAppShot;
async function observe(page,surface){
  page.on('pageerror',e=>result.errors.push({surface,message:e.message}));
  const driver=await nativeInspectorUI(page,browser);
  driver.p.on('Runtime.consoleAPICalled',e=>{if(['error','warning','warn'].includes(e.type))result.console.push({surface,type:e.type,message:e.args.map(a=>a.value??a.description??'').join(' ').slice(0,1500)});});
  driver.p.on('Log.entryAdded',({entry})=>{if(['error','warning'].includes(entry.level))result.console.push({surface,type:entry.level,message:entry.text.slice(0,1500)});});
  await driver.p.send('Runtime.enable');await driver.p.send('Log.enable');return driver;
}
async function stopVite(){if(!vite)return;if(vite.exitCode===null&&vite.signalCode===null){vite.kill('SIGTERM');try{await waitFor(()=>vite.exitCode!==null||vite.signalCode!==null,5000);}catch{vite.kill('SIGKILL');await waitFor(()=>vite.exitCode!==null||vite.signalCode!==null,5000);}}result.viteExit={code:vite.exitCode,signal:vite.signalCode};}
async function openBrowser(role){
 const options={extensionPath:h.hosts.standalone};
 if(guide){
  desktop??=await sourceAccessDesktop(out);
  Object.assign(options,{headless:false,display:desktop.display,beforeExtensionLoad:async context=>{
   const installation=await installGuideExtension(context,{folder:h.hosts.standalone,desktop,out,role,expectedBrowser:guide.expectedBrowser,expectedExecutableSha256:guide.expectedExecutableSha256});
   (result.guideInstallations??=[]).push(installation);
  }});
 }
 const b=await startNativeBrowser(out+'/profiles',role,true,false,[],options);
 try{
  if(guide){assert.equal(b.context.browser().version(),guide.expectedBrowser);assert.equal(b.command.extensionSetup,'guide-ui');assert(result.guideInstallations.at(-1).installed.cards.some(c=>c.id===b.id&&c.name==='StateAtom'));(result.guideWorkerAdmissions??=[]).push({role,extensionId:b.id,worker:b.extensionWorker});}
  return b;
 }catch(error){
  try{await b.context.close();}catch(cleanupError){result.browserAdmissionCleanupError=String(cleanupError.stack||cleanupError);browser=b;}
  throw error;
 }
}
async function stopAPI(){if(!api?.listening)return;api.closeAllConnections();await new Promise(resolve=>api.close(resolve));}
try{
  await check('exact supplied pair, standalone bytes, build inputs and untouched independent source',async()=>{
    await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
    for(const [f,v] of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(sha256(await readFile(f)),v,f);
    assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);
    if(previous){await verifyArtifactHashes([previous.package,previous.ui]);assert.deepEqual(await fileManifest(previous.hosts.standalone),previous.consumerReceipt.hostFiles.standalone);}
    result.originalSourceFiles=await originalSources();
  });
  api=createServer((req,res)=>{
    result.traffic.push({method:req.method,url:req.url});res.setHeader('access-control-allow-origin','*');res.setHeader('cache-control','no-store');
    let data;const products=scenario.syntheticProducts.map(({imagePath,...p})=>({...p,image:result.apiOrigin+imagePath}));
    if(req.method!=='GET'){res.writeHead(405);res.end();return;}
    if(req.url==='/synthetic.svg'){res.setHeader('content-type','image/svg+xml');res.end(scenario.syntheticImage);return;}
    if(req.url==='/products')data=products;
    else if(req.url==='/products/categories')data=['electronics'];
    else if(req.url==='/products/1')data=products[0];
    else{res.writeHead(404);res.end();return;}
    res.setHeader('content-type','application/json');res.end(JSON.stringify(data));
  });
  await new Promise((resolve,reject)=>{api.once('error',reject);api.listen(0,'127.0.0.1',resolve);});result.apiOrigin='http://127.0.0.1:'+api.address().port;
  const probe=createServer();await new Promise((resolve,reject)=>{probe.once('error',reject);probe.listen(0,'127.0.0.1',resolve);});const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  result.appOrigin='http://127.0.0.1:'+port;
  // Frozen before any app/browser execution. No generated backend code enters app sources.
  await writeFile(out+'/registration.json',JSON.stringify({...result,scenario,apiResponses:{products:scenario.syntheticProducts.map(({imagePath,...p})=>({...p,image:result.apiOrigin+imagePath})),categories:['electronics']}},null,2),{flag:'wx'});
  const args=[path.join(app.workingCopy,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port',String(port),'--strictPort'];
  vite=spawn(process.execPath,args,{cwd:app.workingCopy,env:{PATH:path.dirname(process.execPath)+':/usr/bin:/bin',LANG:'C.UTF-8',CI:'1',VITE_API_BASE_URL:result.apiOrigin},stdio:['ignore','pipe','pipe']});
  vite.once('error',e=>{viteFailure=e;});for(const stream of[vite.stdout,vite.stderr])stream.on('data',data=>{viteOutput+=data;});
  await waitFor(()=>{if(viteFailure)throw viteFailure;if(vite.exitCode!==null||vite.signalCode!==null)throw Error('Owned Vite exited before readiness');const plain=stripVTControlCharacters(viteOutput);return plain.includes(result.appOrigin+'/')&&plain.includes('Local:');},30000);
  await writeFile(out+'/vite-command.json',JSON.stringify({executable:process.execPath,node:process.version,args,cwd:app.workingCopy,env:{PATH:path.dirname(process.execPath)+':/usr/bin:/bin',LANG:'C.UTF-8',CI:'1',VITE_API_BASE_URL:result.apiOrigin},ownedPid:vite.pid,readiness:'strictPort + this live child stdout exact Local URL; no foreign listener adoption'},null,2));
  browser=await openBrowser('origin');result.browser=browser.context.browser().version();
  const panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/panel.html');ui=await observe(panel,'inspector');downloads=await nativeDownloads(out+'/profiles/origin',out+'/downloads');
  await check('isolated origin profile has no prior reports or app authority',async()=>{
    assert.deepEqual((await rpc(panel,{op:'list-handoffs'})).entries,[]);
    assert.deepEqual(await panel.evaluate(async()=>Object.keys((await chrome.storage.session.get('stateport.atom.v1.tabs'))['stateport.atom.v1.tabs']||{})),[]);
  });
  const tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,result.appOrigin+'/');result.tabId=tabId;
  const appDOM=()=>panel.evaluate(async({id,cart,add})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:(cart,add)=>({url:location.href,title:document.title,cart:document.querySelector(cart)?.textContent,add:document.querySelector(add)?.textContent,body:document.body.innerText.slice(0,15000),ready:document.readyState}),args:[cart,add]}))[0].result,{id:tabId,cart:scenario.cartSelector,add:scenario.addSelector});
  failureAppProbe=appDOM;
  await waitFor(async()=>{const v=await appDOM();return v.ready==='complete'&&v.add?.includes('Add to Cart');},30000);
  await ui.click('setup-toggle');await ui.click('refresh-tabs');await ui.waitOK();await ui.select('tabs',tabId);await ui.waitOK();await ui.click('attach');await ui.waitOK();await ui.click('setup-toggle');await ui.select('site-mode','read-only');await ui.click('save-site');await ui.waitOK();
  if(scenario.appViewport)await panel.evaluate(async({id,viewport})=>chrome.debugger.sendCommand({tabId:id},'Emulation.setDeviceMetricsOverride',{...viewport,deviceScaleFactor:1,mobile:false}),{id:tabId,viewport:scenario.appViewport});
  const state=()=>rpc(panel,{op:'state',tabId,refreshDeep:false});
  await panel.evaluate(async id=>{
    globalThis.__v03AppLogs=[];chrome.debugger.onEvent.addListener((source,method,p)=>{if(source.tabId===id&&(method==='Runtime.exceptionThrown'||method==='Runtime.consoleAPICalled'&&['error','warning','warn'].includes(p.type)||method==='Log.entryAdded'&&['error','warning'].includes(p.entry.level)))globalThis.__v03AppLogs.push({method,params:p});});
    await chrome.debugger.sendCommand({tabId:id},'Runtime.enable');await chrome.debugger.sendCommand({tabId:id},'Log.enable');
  },tabId);
  failureAppShot=async()=>{const data=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.captureScreenshot',{format:'png'})).data,tabId);await writeFile(out+'/failure-app.png',Buffer.from(data,'base64'));};
  async function pointer(selector){return panel.evaluate(async({id,selector})=>{
    await chrome.tabs.update(id,{active:true});const point=(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:async selector=>{const e=document.querySelector(selector);if(!e)throw Error('Missing app target '+selector);e.scrollIntoView({block:'center'});let previous,stable=0;for(let i=0;i<120;i++){await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);stable=previous&&Math.abs(previous.x-x)<0.1&&Math.abs(previous.y-y)<0.1?stable+1:0;previous={x,y};if(stable>=3&&r.width>0&&r.height>0&&(hit===e||e.contains(hit)))return{x,y};}throw Error('App target did not settle or is obscured: '+selector);},args:[selector]}))[0].result;
    for(const type of['mouseMoved','mousePressed','mouseReleased'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});return point;
  },{id:tabId,selector});}
  await check('actual independent shop renders synthetic products and original cart control',async()=>{result.appBefore=await appDOM();assert.equal(result.appBefore.url,result.appOrigin+'/');assert.equal(result.appBefore.title,'ShopHub - Your Modern E-commerce Store');assert.equal(result.appBefore.cart,'Cart');assert.match(result.appBefore.body,/V03 synthetic blue mug/);});
  if(scenario.requireLoadedImages)await check('registered synthetic images decode in the actual shop viewport',async()=>{result.appImages=await waitFor(()=>panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:()=>{const images=[...document.querySelectorAll('img')];return images.length===2&&images.every(i=>i.complete&&i.naturalWidth>0)?images.map(i=>({alt:i.alt,width:i.naturalWidth,height:i.naturalHeight})):null;}}))[0].result,tabId));});
  const appShot=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.captureScreenshot',{format:'png'})).data,tabId);await writeFile(out+'/app-first-viewport.png',Buffer.from(appShot,'base64'));
  await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await pointer(scenario.cartSelector);await waitFor(async()=>{const s=await state();return s.selection&&s.picker?.status==='selected';});await ui.waitOK();
  result.initialPick=(await state()).selection;result.refinements=[];
  while((await state()).selection.tag!=='button'&&result.refinements.length<4){await ui.click('picker-parent');await ui.waitOK();result.refinements.push((await state()).selection);}
  await check('native picker and actual parent refinement identify read-only cart without navigation or badge',async()=>{
    const s=await state();assert.equal(s.selection.tag,'button');assert.equal(s.selection.value,'Cart');assert.equal(s.selection.property,'text');assert.equal(s.readOnly,true);assert.equal(s.analysis.capabilities.sourceResolver,'unavailable');assert.equal(s.analysis.stateatom.runtime.status,'Unknown/Unsupported');
    assert.equal(await panel.evaluate(async({id,selector,cart})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:(selector,cart)=>document.querySelector(selector)===document.querySelector(cart),args:[selector,cart]}))[0].result,{id:tabId,selector:s.selection.selector,cart:scenario.cartSelector}),true);
    const v=await appDOM();assert.equal(v.url,result.appOrigin+'/');assert.equal(v.cart,'Cart');result.selectionBefore=s.selection;
  });
  await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='picking');await ui.click('pick');await waitFor(async()=>(await state()).picker.status==='cancelled');
  await check('inspector Cancel preserves exact selected node and visible cart state',async()=>{assert.equal((await state()).selection.domIdentity.node,result.selectionBefore.domIdentity.node);const v=await appDOM();assert.equal(v.url,result.appOrigin+'/');assert.equal(v.cart,'Cart');});
  result.screenshots={desktop:await ui.screenshot(out+'/inspector-desktop.png',{width:1100,focus:'setup-toggle'}),narrow:await ui.screenshot(out+'/inspector-narrow.png',{width:440,focus:'setup-toggle'})};
  await ui.click('evidence-nav');await ui.click('diagnostic-toggle');await ui.fill('diagnostic-notes','V03 independent app: original cart observation before adding one synthetic item');await ui.click('save-report');await waitFor(async()=>(await ui.text('diagnostic-status')).startsWith('Saved'));
  const oldEntry=(await rpc(panel,{op:'list-handoffs'})).entries.find(e=>e.version===1);assert(oldEntry);const old=await rpc(panel,{op:'open-handoff',id:oldEntry.id});const oldDiagnostic=parseDiagnostic(old.raw);
  await check('old locally saved snapshot is historical Cart with Unknown runtime',async()=>{assert.equal(oldDiagnostic.target.value,'Cart');assert.equal(oldDiagnostic.kind,'historical-diagnostic');assert.equal(oldDiagnostic.runtime.status,'Unknown/Unsupported');result.oldSnapshot={id:oldEntry.id,sha256:sha256(old.raw),capturedAt:oldDiagnostic.capturedAt};await writeFile(out+'/before.stateatom.json',old.raw);});
  result.addPointer=await pointer(scenario.addSelector);await waitFor(async()=>(await appDOM()).cart==='1Cart');await ui.click('load');await ui.waitOK();
  await check('ordinary app action changes count; Inspect again observes 1Cart without fabricated lineage',async()=>{const s=await state();assert.equal(s.selection.value,'1Cart');assert.notEqual(s.selection.observedAt,result.selectionBefore.observedAt);assert.equal(s.readOnly,true);assert.equal(s.analysis.stateatom.runtime.status,'Unknown/Unsupported');assert.equal((await appDOM()).url,result.appOrigin+'/');assert.equal((await rpc(panel,{op:'open-handoff',id:oldEntry.id})).raw,old.raw);result.selectionAfter=s.selection;});
  await ui.click('handoff-current');await waitFor(()=>panel.evaluate(s=>!document.querySelector(s).disabled,ui.q('handoff-preview')));
  for(const k of['title','actual','expected'])await ui.fill('handoff-'+k,scenario.issue[k]);await ui.fill('handoff-steps',scenario.issue.steps.join('\n'));
  const prior=downloads.ids();await ui.click('handoff-preview');
  const reviewOutcome=await waitFor(()=>panel.evaluate(({save,status,simple})=>!document.querySelector(save).disabled?'ready':document.querySelector(status).textContent.startsWith('HANDOFF_LIMIT')&&!document.querySelector(simple).hidden?'limit':null,{save:ui.q('handoff-save'),status:ui.q('handoff-status'),simple:ui.q('handoff-simple')}));
  if(reviewOutcome==='limit'){
    result.detailedReport={status:'FAIL',reason:'HANDOFF_LIMIT',message:await ui.text('handoff-status'),fallback:'explicit existing simple report; not detailed path acceptance'};
    result.checks.push({name:'original detailed current report path',...result.detailedReport});console.log('FAIL_RETAINED detailed current report HANDOFF_LIMIT');
    assert.notEqual(scenario.requireDetailed,true,'Registered detailed acceptance cannot substitute a simple report');
    assert.deepEqual(downloads.ids(),prior);await ui.click('handoff-simple');await ui.click('handoff-preview');await waitFor(()=>panel.evaluate(s=>!document.querySelector(s).disabled,ui.q('handoff-save')));
  }else result.detailedReport={status:'PASS'};
  result.reviewSummary=await ui.text('handoff-summary');
  await check('explicit review shows reporter words and omissions before any download',async()=>{assert.deepEqual(downloads.ids(),prior);assert.match(result.reviewSummary,/V03 cart interaction demonstration/);assert.match(result.reviewSummary,/successful scenario/);assert.match(result.reviewSummary,/historical|Recorded/);result.screenshots.review=await ui.screenshot(out+'/review-narrow.png',{width:440,focus:'handoff-heading'});});
  await ui.click('handoff-save');await waitFor(async()=>(await ui.text('handoff-status')).startsWith('Saved'));
  const reportEntry=(await rpc(panel,{op:'list-handoffs'})).entries.find(e=>e.version===2);assert(reportEntry);const saved=await rpc(panel,{op:'open-handoff',id:reportEntry.id});
  await ui.click('handoff-download');const download=await downloads.next(prior);const parsed=await parseHandoffReport(download.raw),r=parsed.record;
  await check('download is exact saved reviewed bytes with default selected text exclusion and historical trust',async()=>{
    assert.equal(download.raw,saved.raw);assert.equal(parsed.trust,'historical-untrusted');assert.equal(r.report.issue.title,scenario.issue.title);assert.equal(r.report.issue.actual,scenario.issue.actual);assert.equal(r.report.target.property,'text');
    let rows=[];
    if(result.detailedReport.status==='FAIL'){assert.equal(r.profile,'minimal-snapshot/1');assert.equal(r.report.technicalEvidence.state,'omitted');assert.deepEqual(r.report.target.value,{state:'omitted',reason:'private-content-default'});assert.equal(Object.hasOwn(r,'inputEvidence'),false);}
    else{assert.equal(r.report.target.value.state,'omitted');assert.equal(r.profile,'input-evidence/1');assert.equal(r.inputEvidence.projection.selectedObservation.value.state,'omitted');rows=r.report.technicalEvidence.fields;assert(!rows.some(f=>f.category&&['selectedText','selectionDetails','sourceLocations','sourceExcerpts','runtimeValues','responseBodies','networkLocations','routePaths','originalNotes','diagnosticDetails'].includes(f.category)&&['included','filtered','replaced'].includes(f.state)));}
    result.report={file:download.file,sha256:sha256(download.raw),bytes:Buffer.byteLength(download.raw),profile:r.profile,trust:parsed.trust,selectedValue:r.report.target.value,sourceDiagnostic:r.report.sourceDiagnostic,technicalRows:rows.length};
  });
  if(scenario.requireDetailed)await check('actual detailed file retains the exact selected occurrence and existing structural bounds',async()=>{
    let nodes=0,members=0,arrayEntries=0;const stack=[r];while(stack.length){const value=stack.pop();nodes++;if(value&&typeof value==='object'){if(Array.isArray(value))arrayEntries+=value.length;else members+=Object.keys(value).length;stack.push(...Object.values(value));}}
    assert.equal(result.detailedReport.status,'PASS');if(scenario.reportNodeMinimum)assert(nodes>=scenario.reportNodeMinimum);assert(nodes<=20000);assert(members<=10000);assert(arrayEntries<=9999);assert.equal(r.report.sourceDiagnostic.capturedAt,result.selectionAfter.observedAt);assert.equal(r.report.technicalEvidence.state,'reviewed-projection');assert(r.report.technicalEvidence.joins.some(j=>j.kind==='map'&&j.evidenceKind==='Unknown/Unsupported'));result.report.structure={nodes,members,arrayEntries};
  });
  result.appConsole=await panel.evaluate(()=>globalThis.__v03AppLogs);await ui.close();ui=null;downloads.close();downloads=null;await browser.context.close();browser=null;
  await stopVite();await stopAPI();const requestsBeforeReader=result.traffic.length;
  browser=await openBrowser('recipient');result.readerBrowser=browser.context.browser().version();const reader=await browser.context.newPage();await reader.goto('chrome-extension://'+browser.id+'/reader.html');ui=await observe(reader,'fresh-reader');
  const live=()=>reader.evaluate(async()=>({appTabs:(await chrome.tabs.query({})).filter(t=>/^https?:/.test(t.url||'')).length,storedTabs:Object.keys((await chrome.storage.session.get('stateport.atom.v1.tabs'))['stateport.atom.v1.tabs']||{})}));
  const authority=page=>page.evaluate(async()=>({session:await chrome.storage.session.get(null),local:await chrome.storage.local.get(null)}));
  await check('recipient is fresh with original browser and app/API stopped',async()=>{assert.equal(result.readerBrowser,result.browser);assert.deepEqual(await live(),{appTabs:0,storedTabs:[]});assert.equal(api.listening,false);assert(vite.exitCode!==null||vite.signalCode!==null);});
  const readerRequests=[];
  if(scenario.requireExactReaderAuthority){result.readerAuthorityBefore=await waitFor(async()=>{const a=await authority(reader);return a.local['stateport.atom.v1.migration']===1?a:null;});assert.deepEqual(result.readerAuthorityBefore,{session:{},local:{'stateport.atom.v1.diagnostics':[],'stateport.atom.v1.migration':1}});ui.p.on('Network.requestWillBeSent',e=>readerRequests.push({url:e.request.url,method:e.request.method}));await ui.p.send('Network.enable');}
  await ui.files('#diagnostic-file',[download.file]);await waitFor(()=>reader.evaluate(()=>document.getElementById('reader-status').textContent.startsWith('Historical issue report')));
  await check('fresh recipient reads historical reporter words and explicit omissions without authority',async()=>{
    result.reader=await reader.evaluate(()=>({status:document.getElementById('reader-status').textContent,summary:document.getElementById('reader-summary').textContent}));assert.match(result.reader.status,/untrusted claims.*not reverified/);assert.match(result.reader.summary,/V03 cart interaction demonstration/);assert.match(result.reader.summary,/successful scenario/);assert.match(result.reader.summary,/omitted|excluded/i);assert.deepEqual(await live(),{appTabs:0,storedTabs:[]});assert.equal(result.traffic.length,requestsBeforeReader);
    await ui.p.send('Emulation.setDeviceMetricsOverride',{width:1100,height:900,deviceScaleFactor:1,mobile:false});await reader.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);});await reader.screenshot({path:out+'/reader-desktop.png'});
  });
  await check('extension healthy, logs captured and original app/build/archive bytes unchanged',async()=>{assert.deepEqual(result.errors,[]);assert.deepEqual(result.console,[]);assert.deepEqual(result.appConsole,[]);assert.equal(await originalSources(),65);assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);assert.equal(result.screenshots.desktop.overflow,false);assert.equal(result.screenshots.narrow.overflow,false);});
  if(scenario.requireExactReaderAuthority)await check('detailed import leaves exact storage authority unchanged and makes no external reader-target request',async()=>{result.readerAuthorityAfter=await authority(reader);assert.deepEqual(result.readerAuthorityAfter,result.readerAuthorityBefore);assert.deepEqual(readerRequests.filter(r=>!r.url.startsWith('chrome-extension://'+browser.id+'/')),[]);result.readerRequests=readerRequests;});
  if(previous){
    await ui.close();ui=null;await browser.context.close();browser=null;
    browser=await startNativeBrowser(out+'/profiles','previous-reader-control',true,false,[],{extensionPath:previous.hosts.standalone});const oldReader=await browser.context.newPage();await oldReader.goto('chrome-extension://'+browser.id+'/reader.html');ui=await observe(oldReader,'previous-reader-control');
    const before=await waitFor(async()=>{const a=await authority(oldReader);return a.local['stateport.atom.v1.migration']===1?a:null;});assert.deepEqual(before,{session:{},local:{'stateport.atom.v1.diagnostics':[],'stateport.atom.v1.migration':1}});
    await ui.files('#diagnostic-file',[download.file]);await waitFor(()=>oldReader.evaluate(()=>document.getElementById('reader-status').textContent.startsWith('Rejected diagnostic:')));
    await check('exact old65 reader refuses this newly generated larger file without acquiring authority',async()=>{result.previousReader={handoff:scenario.previousReaderHandoff,package:previous.package,reader:await oldReader.evaluate(()=>({status:document.getElementById('reader-status').textContent,summary:document.getElementById('reader-summary').textContent,body:document.body.innerText})),authorityBefore:before,authorityAfter:await authority(oldReader)};assert.equal(result.previousReader.reader.status,'Rejected diagnostic: HANDOFF_LIMIT');assert.equal(result.previousReader.reader.summary,'');assert.deepEqual(result.previousReader.authorityAfter,before);assert.equal(await oldReader.evaluate(async()=>(await chrome.tabs.query({})).filter(t=>/^https?:/.test(t.url||'')).length),0);assert.deepEqual(await fileManifest(previous.hosts.standalone),previous.consumerReceipt.hostFiles.standalone);assert.deepEqual(result.errors,[]);assert.deepEqual(result.console,[]);await oldReader.screenshot({path:out+'/previous-reader-refusal.png'});});
  }
  result.status=result.detailedReport.status==='FAIL'?'PARTIAL_BASIC_AND_EXPLICIT_SIMPLE_READER_DETAILED_LIMIT':'PASS_BOUNDED_INDEPENDENT_BASIC_NOT_FULL_V03';
  if(scenario.requireDetailed)result.status='PASS_CURRENT_ACTUAL_HANDOFF_UI_NOT_FULL_V03';
  if(guide){assert.equal(result.guideInstallations.length,2);assert(result.guideInstallations.every(i=>i.status==='PASS_RENDERED_UI_AND_NATIVE_CHOOSER_NOT_TOOLBAR_USABILITY'));result.guideInstallUIProved=true;result.status='PASS_GUIDE_UI_INSTALL_AND_ASSISTED_BASIC_HANDOFF_NOT_FULL_V03';}
  if(result.detailedReport.status==='FAIL')process.exitCode=2;
}catch(error){result.status='FAIL';result.error=error.stack;process.exitCode=1;console.error(error);}
finally{
  if(result.status==='FAIL'&&ui&&browser){try{result.failureUI=await ui.p.send('Runtime.evaluate',{expression:'document.body.innerText',returnByValue:true});}catch{}try{result.failureAppDOM=await failureAppProbe?.();await failureAppShot?.();}catch{}}
  await ui?.close().catch(()=>{});downloads?.close();await browser?.context.close().catch(()=>{});await stopVite();await stopAPI();
  if(desktop){try{await desktop.close();await waitFor(async()=>{try{await stat('/tmp/.X11-unix/X'+desktop.display.slice(1));return false;}catch(e){return e.code==='ENOENT';}});result.ownedDesktopClosed=true;}catch(e){result.status='FAIL';result.desktopCleanupError=e.stack;process.exitCode=1;}}
  await writeFile(out+'/vite.log',viteOutput);result.viteLogSha256=sha256(viteOutput);result.inputsAfter=await inputs();
  if(JSON.stringify(result.inputsAfter)!==JSON.stringify(result.inputsBefore)){result.status='FAIL';result.inputDrift=true;process.exitCode=1;}
  try{result.sourceFilesAfter=await originalSources();}catch(e){result.status='FAIL';result.sourceError=e.stack;process.exitCode=1;}
  result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/results.json'}));
}
