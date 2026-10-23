// SPDX-License-Identifier: Apache-2.0
// Continue a retained actual UI download without restarting its app or origin profile.
import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {waitFor} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes} from '../../scripts/atom-package-receipt.mjs';
import {parseHandoffReport} from '../../core/handoff-files.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';

const [handoffFile,downloadFile,parentResult]=process.argv.slice(2);
assert(handoffFile&&downloadFile&&parentResult&&process.argv.length===5,'Exact kit, retained UI download and original failed result required');
const h=JSON.parse(await readFile(handoffFile)),parent=JSON.parse(await readFile(parentResult)),raw=await readFile(downloadFile,'utf8');
const {record,trust}=await parseHandoffReport(raw);
assert.equal(parent.status,'FAIL');assert.equal(parent.detailedReport?.reason,'HANDOFF_LIMIT');
assert(parent.checks.some(c=>c.name==='explicit review shows reporter words and omissions before any download'&&c.status==='PASS'));
assert(path.resolve(downloadFile).startsWith(path.dirname(path.resolve(parentResult))+'/downloads/'));
assert.match(parent.error,/private-content-default/); // known harness expectation error, not reader acceptance
const out=path.resolve('.artifacts/v03/passive-recipient/'+new Date().toISOString().replace(/[:.]/g,'-'));
await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const files=[handoffFile,downloadFile,parentResult,'tests/integration/passive-handoff-recipient-native.mjs','tests/helpers/native-inspector-ui.mjs','scripts/native-browser.mjs','scripts/harness.mjs',...Object.keys({...h.sourceManifest,...h.buildSources.manifest})];
const inputs=async()=>Object.fromEntries(await Promise.all(files.map(async f=>[f,sha256(await readFile(f))])));
const result={schema:'stateatom.v03-passive-recipient-continuation/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),parent:{file:parentResult,sha256:sha256(await readFile(parentResult)),status:parent.status,detailedReport:parent.detailedReport},download:{file:downloadFile,sha256:sha256(raw),bytes:Buffer.byteLength(raw)},configuration:{freshProfile:true,realMV3:true,appStarted:false,originProfileReopened:false,IDE:false,account:false,certificates:false,CLIExtensionPreload:true},checks:[],errors:[],console:[],inputsBefore:await inputs()};
let browser,ui;
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
await writeFile(out+'/registration.json',JSON.stringify(result,null,2),{flag:'wx'});
try{
  await check('strict retained simple file omits selected text and technical/input evidence',async()=>{
    assert.equal(trust,'historical-untrusted');assert.equal(record.profile,'minimal-snapshot/1');assert.deepEqual(record.report.target.value,{state:'omitted',reason:'private-content-default'});assert.equal(record.report.technicalEvidence.state,'omitted');assert.equal(Object.hasOwn(record,'inputEvidence'),false);assert.equal(record.report.issue.title,'V03 cart interaction demonstration');assert.match(record.report.issue.actual,/successful scenario, not a reported application bug/);
    result.report={id:record.id,profile:record.profile,trust,target:record.report.target,technical:record.report.technicalEvidence};
  });
  await check('exact supplied immutable kit and current product build inputs',async()=>{await verifyArtifactHashes([h.package,h.ui]);for(const[f,hash]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(sha256(await readFile(f)),hash,f);assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);});
  browser=await startNativeBrowser(out+'/profiles','recipient',true,false,[],{extensionPath:h.hosts.standalone});result.browser=browser.context.browser().version();const page=await browser.context.newPage();await page.goto('chrome-extension://'+browser.id+'/reader.html');ui=await nativeInspectorUI(page,browser);
  page.on('pageerror',e=>result.errors.push(e.message));ui.p.on('Runtime.consoleAPICalled',e=>{if(['error','warning','warn'].includes(e.type))result.console.push({type:e.type,message:e.args.map(a=>a.value??a.description??'').join(' ')});});ui.p.on('Log.entryAdded',({entry})=>{if(['error','warning'].includes(entry.level))result.console.push(entry);});await ui.p.send('Runtime.enable');await ui.p.send('Log.enable');
  const authority=()=>page.evaluate(async()=>({appTabs:(await chrome.tabs.query({})).filter(t=>/^https?:/.test(t.url||'')).length,session:await chrome.storage.session.get(null),local:await chrome.storage.local.get(null)}));
  await check('fresh recipient before import has only empty diagnostic migration defaults, no app authority',async()=>{result.authorityBefore=await waitFor(async()=>{const a=await authority();return a.local['stateport.atom.v1.migration']===1?a:null;});assert.equal(result.authorityBefore.appTabs,0);assert.deepEqual(result.authorityBefore.session,{});assert.deepEqual(result.authorityBefore.local,{'stateport.atom.v1.diagnostics':[],'stateport.atom.v1.migration':1});});
  const requests=[];ui.p.on('Network.requestWillBeSent',e=>requests.push({url:e.request.url,method:e.request.method}));await ui.p.send('Network.enable');
  await ui.files('#diagnostic-file',[downloadFile]);await waitFor(()=>page.evaluate(()=>document.getElementById('reader-status').textContent.startsWith('Historical issue report')));
  await check('native file import renders historical reporter words and explicit omissions',async()=>{
    result.reader=await page.evaluate(()=>({status:document.getElementById('reader-status').textContent,summary:document.getElementById('reader-summary').textContent}));assert.match(result.reader.status,/untrusted claims.*not reverified/);assert.match(result.reader.summary,/V03 cart interaction demonstration/);assert.match(result.reader.summary,/successful scenario/);assert.match(result.reader.summary,/omitted|excluded/i);
  });
  await check('import grants no storage or app authority and requests no external resource',async()=>{result.authorityAfter=await authority();assert.deepEqual(result.authorityAfter,result.authorityBefore);assert.deepEqual(requests.filter(r=>!r.url.startsWith('chrome-extension://'+browser.id+'/')),[]);result.requests=requests;});
  for(const width of[1100,440]){
    await ui.p.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await page.evaluate(async()=>{scrollTo(0,0);await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});await page.screenshot({path:out+'/reader-'+width+'.png'});
    const v=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)}));assert.equal(v.overflow,false);assert(v.fonts.includes('StatePort Inter'));(result.screenshots??=[]).push(v);
  }
  await check('healthy desktop/narrow candidate reader with bundled font and unchanged file/host',async()=>{assert.deepEqual(result.errors,[]);assert.deepEqual(result.console,[]);assert.equal(await readFile(downloadFile,'utf8'),raw);assert.deepEqual(await fileManifest(h.hosts.standalone),h.consumerReceipt.hostFiles.standalone);});
  result.status='PASS_PASSIVE_SIMPLE_RECIPIENT_ONLY_ORIGINAL_DETAILED_PATH_FAILED';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;console.error(e);}
finally{
  await ui?.close().catch(()=>{});await browser?.context.close().catch(()=>{});result.inputsAfter=await inputs();if(JSON.stringify(result.inputsAfter)!==JSON.stringify(result.inputsBefore)){result.status='FAIL';result.inputDrift=true;process.exitCode=1;}
  result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/results.json'}));
}
