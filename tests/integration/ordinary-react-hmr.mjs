// SPDX-License-Identifier: Apache-2.0
// Ordinary independent-source/edit controls; not a committed-host or HTTP lineage proof.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,cp,rename,open} from 'node:fs/promises';
import {execFileSync,fork} from 'node:child_process';
import path from 'node:path';
import net from 'node:net';
import {root} from '../../scripts/vite-config.mjs';
import {fileDigests,todoRevision} from '../../scripts/short-loop-inputs.mjs';
import {startNativeBrowser,nativeApproveDevelopment} from '../../scripts/native-browser.mjs';
import {startIDE,rpc,waitFor} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';

const hf=process.argv.find(s=>s.endsWith('atom-handoff.json'))||'.artifacts/atom/atom-handoff.json';
const h=JSON.parse(await readFile(hf));
const out='.artifacts/a01/ordinary-hmr-native/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const sourceBase='.runtime/todomvc',appRelative='examples/react',appBase=sourceBase+'/'+appRelative;
const entries=['license.md',appRelative+'/src',appRelative+'/public',appRelative+'/package.json',appRelative+'/package-lock.json'];
const footer='src/todo/components/footer.jsx';
const inputEntries=['src/engine','core/analyzer.mjs','core/runtime-state.mjs','core/bridge.mjs','ide-extension/session.mjs','ide-extension/extension.mjs','dist/ide/extension.cjs','scripts/native-browser.mjs','scripts/harness.mjs','scripts/short-loop-inputs.mjs','tests/ide-host.cjs','tests/integration/ordinary-react-hmr.mjs','tests/helpers/ordinary-react-server.mjs'];
const inputs=async()=>({...await fileDigests(root,inputEntries),...Object.fromEntries(await Promise.all(Object.keys({...h.sourceManifest,...h.buildSources.manifest}).map(async f=>[f,sha256(await readFile(f))])))});
const result={
 schema:'stateatom.ordinary-react-hmr-native/1',status:'RUNNING',startedAt:new Date().toISOString(),
 revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,
 handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},
 configuration:{operator:'agent',browserPlugin:'Browser plugin unavailable; exact paired native MV3 hosts and existing Atom debugger ownership required',
  source:'Read-only pinned extracted TodoMVC directory; edits only in an exclusive copied workspace including its locked dependencies',
  plugin:{enabled:true,sourceConsumption:true,reactHostProps:false,reactCommit:false,firstReadContracts:false},
  appTargetSession:false,probes:'Explicit chrome.scripting MAIN/ISOLATED, native app Input and Network.getResponseBody through the existing Atom debugger. No app-page facade or parallel app-target CDP.',
  IDE:'Real VS Code Extension Host, explicit copied project root and native source-open audit',model:false,
  limits:'Ordinary source/read fragments and source-version freshness only. No React19 final-host-props witness, full HTTP path, no-all-traffic assertion or human acceptance.'},
 checks:[],errors:[],cases:[],inputsBefore:await inputs()
};
let browser,panel,panelCDP,server,ide,origin,tabId;
const q=id=>'[data-atom-id="'+id+'"]';
async function check(name,fn){await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);}
async function protocol(){return panelCDP??=await browser.context.newCDPSession(panel);}
async function click(selector,index=0){
 await waitFor(()=>panel.evaluate(({selector,index})=>{const e=document.querySelectorAll(selector)[index];return e&&!e.disabled&&!e.hidden;},{selector,index}));
 const p=await protocol();await p.send('Page.bringToFront');
 const point=await panel.evaluate(async({selector,index})=>{
  const e=document.querySelectorAll(selector)[index];
  for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS'&&!(e.tagName==='SUMMARY'&&a===e.parentElement))a.open=true;
  e.scrollIntoView({block:'center',behavior:'instant'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
  const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);
  if(!r.width||!r.height||hit!==e&&!e.contains(hit))throw Error('Native UI target covered: '+selector);
  return{x,y};
 },{selector,index});
 for(const type of ['mouseMoved','mousePressed','mouseReleased'])await p.send('Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});
}
const action=id=>click(q(id));
async function key(key,code=key,n=key==='Enter'?13:key==='Tab'?9:undefined){
 const p=await protocol();for(const type of ['keyDown','keyUp'])await p.send('Input.dispatchKeyEvent',{type,key,code,...(n?{windowsVirtualKeyCode:n}:{})});
}
async function fill(id,value){
 await (await protocol()).send('Page.bringToFront');
 await waitFor(()=>panel.evaluate(s=>{const e=document.querySelector(s);return e&&!e.disabled;},q(id)));
 await panel.evaluate(s=>{const e=document.querySelector(s);for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;e.scrollIntoView({block:'center'});e.focus();e.select();},q(id));
 await (await protocol()).send('Input.insertText',{text:value});
 assert.equal(await panel.evaluate(s=>document.querySelector(s).value,q(id)),value);
}
async function choose(id,value){
 await (await protocol()).send('Page.bringToFront');
 const index=await waitFor(()=>panel.evaluate(({s,value})=>{const e=document.querySelector(s);if(!e||e.disabled)return null;const i=[...e.options].findIndex(o=>o.value===value);if(i<0)return null;for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;e.scrollIntoView({block:'center'});e.focus();return i+1;},{s:q(id),value}));
 await key('Home','Home',36);for(let i=1;i<index;i++)await key('ArrowDown','ArrowDown',40);await key(' ','Space',32);
 assert.equal(await panel.evaluate(s=>document.querySelector(s).value,q(id)),value);
}
async function appProbe(){return panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>({
 count:document.querySelector('.todo-count')?.textContent??null,
 titles:[...document.querySelectorAll('.todo-list label')].map(e=>e.textContent.trim()),
 completed:[...document.querySelectorAll('.todo-list .toggle')].map(e=>e.checked),
 ready:!!document.querySelector('.new-todo'),observer:typeof window.__STATEATOM__?.snapshot==='function'
})}))[0].result,tabId);}
async function appClick(selector){
 const point=await waitFor(()=>panel.evaluate(async({id,selector})=>{
  await chrome.tabs.update(id,{active:true});
  const replies=await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:async s=>{
   const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});
   await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   const r=e.getBoundingClientRect();if(!r.width||!r.height)return null;
   for(const x of [r.x+Math.min(8,r.width/2),r.x+r.width/2,r.right-Math.min(8,r.width/2)]){
    const y=r.y+r.height/2,hit=document.elementFromPoint(x,y);
    if(hit===e||e.contains(hit))return{x,y,width:innerWidth,height:innerHeight,selector:s,hit:hit.tagName};
   }return null;
  },args:[selector]});
  const r=replies[0]?.result;return r&&Number.isFinite(r.x)&&Number.isFinite(r.y)?r:null;
 },{id:tabId,selector}));
 (result.appNativePoints??=[]).push(point);
 await panel.evaluate(async({id,point})=>{for(const type of ['mouseMoved','mousePressed','mouseReleased'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,x:point.x,y:point.y,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});},{id:tabId,point});
}
async function addTodo(title){
 await appClick('.new-todo');
 await panel.evaluate(async({id,title})=>{await chrome.debugger.sendCommand({tabId:id},'Input.insertText',{text:title});for(const type of ['keyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});},{id:tabId,title});
 await waitFor(async()=>(await appProbe()).titles.includes(title));
}
async function launch(kind,name){
 browser=await startNativeBrowser(out+'/profiles',name,true,false,[],{extensionPath:h.hosts[kind]});
 panel=await browser.context.newPage();panel.on('pageerror',e=>result.errors.push({name,message:e.message}));
 await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));
 await (await protocol()).send('Emulation.setDeviceMetricsOverride',{width:1100,height:1000,deviceScaleFactor:1,mobile:false});
 tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin);
 await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
 await nativeApproveDevelopment(panel,tabId);await action('refresh-tabs');await choose('tabs',String(tabId));await action('attach');
 await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).attached);
 await waitFor(async()=>(await appProbe()).ready);
}
async function closeBrowser(){
 await panelCDP?.detach().catch(()=>{});panelCDP=null;
 if(browser){await browser.context.close();browser=null;}panel=null;tabId=null;
}
async function stopServer(){
 if(!server)return;const owned=server;server=null;
 if(owned.child.exitCode===null){owned.child.send({op:'stop'});try{await waitFor(()=>owned.child.exitCode!==null,15000);}catch{owned.child.kill('SIGTERM');await waitFor(()=>owned.child.exitCode!==null,5000);}}
 await owned.log.close();assert.equal(owned.child.exitCode,0,'Own dev server cleanup');
}
async function startServer(workspace,enabled){
 const log=await open(out+'/server-'+path.basename(workspace)+'-'+enabled+'.log','wx');
 const child=fork(path.resolve('tests/helpers/ordinary-react-server.mjs'),[workspace,String(enabled),path.resolve(out)+'/vite-'+path.basename(workspace)+'-'+enabled],{cwd:workspace,stdio:['ignore',log.fd,log.fd,'ipc']});
 let ready,error;child.on('message',m=>{if(m.type==='ready')ready=m;else if(m.type==='error')error=m.message;});server={child,log};
 const receipt=await waitFor(()=>{if(error)throw Error(error);if(child.exitCode!==null)throw Error('Own dev server exited '+child.exitCode);return ready;},45000);
 assert.equal(receipt.cwd,workspace);origin=receipt.origin;(result.devServers??=[]).push(receipt);
}
async function copyWorkspace(kind){
 const dir=path.resolve(out+'/'+kind+'-workspace');await mkdir(dir);
 for(const entry of ['src','public','package.json','package-lock.json','node_modules'])await cp(appBase+'/'+entry,dir+'/'+entry,{recursive:true,verbatimSymlinks:true});
 await cp(sourceBase+'/license.md',dir+'/license.md');
 const manifest=await fileDigests(dir,['src','public','package.json','package-lock.json','license.md']);
 for(const[p,digest]of Object.entries(manifest))assert.equal(digest,result.upstream.sourceFiles[p==='license.md'?p:appRelative+'/'+p]);
 return{dir,initialManifest:manifest};
}
async function startOwnedIDE(workspace){
 const busy=await new Promise(resolve=>{const s=net.createConnection({host:'127.0.0.1',port:49331});s.setTimeout(1000);s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(true);});});
 if(busy)throw Error('Own IDE port49331 occupied; no other process changed');
 const runtime=out+'/profiles/ide-'+path.basename(workspace);
 const instance=await startIDE(runtime,{logDir:out+'/ide-'+path.basename(workspace),projectRoot:workspace});
 instance.runtime=runtime;return instance;
}
async function pair(){
 for(const[id,value]of [['bridge',ide.conn.url],['origin',origin],['source-root','src'],['token',ide.conn.token]])await fill(id,value);
 await action('pair');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).connection.source?.url===ide.conn.url);await fill('token','');
}
async function observeServed(){
 await panel.evaluate(id=>{
  window.__a01Served=[];window.__a01NetworkErrors=[];const pending=new Map();
  window.__a01Network=async(target,method,p)=>{
   if(target.tabId!==id)return;
   if(method==='Network.responseReceived'&&new URL(p.response.url).pathname.endsWith('/todo/components/footer.jsx'))pending.set(p.requestId,p.response.url);
   if(method==='Network.loadingFinished'&&pending.has(p.requestId)){
    const url=pending.get(p.requestId);pending.delete(p.requestId);
    try{const r=await chrome.debugger.sendCommand({tabId:id},'Network.getResponseBody',{requestId:p.requestId}),body=r.base64Encoded?atob(r.body):r.body;window.__a01Served.push({url,body,observedBy:'Native Chrome Network.getResponseBody on existing Atom debugger'});}
    catch(e){window.__a01NetworkErrors.push(e.message);}
   }
  };chrome.debugger.onEvent.addListener(window.__a01Network);
 },tabId);
}
async function servedFile(label,previous){
 const entry=await waitFor(()=>panel.evaluate(previous=>window.__a01Served.find(e=>!previous.includes(e.body))||null,previous||[]),30000);
 const file=out+'/'+label+'-served-footer.js';await writeFile(file,entry.body);
 return{file,sha256:sha256(await readFile(file)),url:entry.url,observedBy:entry.observedBy,body:entry.body};
}
async function inspect(label,expectedText,sourceText,workspace){
 await choose('property','text');
 const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt;
 if(!await panel.evaluate(()=>document.querySelector('[data-atom-id="selector-details"]').open))await click(q('selector-details')+' > summary');
 await fill('selector','.todo-count');await action('inspect-selector');
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.observedAt!==before&&s.analysis?s:null;});
 assert.equal(state.selection.selector,'.todo-count');
 result.lastInspection={label,selection:state.selection,sourceFiles:state.analysis.sources.map(s=>s.file)};assert.equal(state.selection.value,expectedText);assert.equal((await appProbe()).count,expectedText);
 const matches=state.analysis.sources.filter(s=>s.file.endsWith(footer));assert.equal(matches.length,1,'One matching selected Footer source');
 const source=matches[0],actualSource=await readFile(workspace+'/'+footer,'utf8');assert.equal(source.sourceDigest,sha256(actualSource));
 assert(source.expressions.some(e=>e.includes(sourceText)),'Matching current expression in selected source');
 const runtime=state.analysis.stateatom?.runtime;assert.equal(runtime?.status,'Observed');assert.equal(runtime.fullPath,false);
 assert(runtime.nodes.some(n=>n.expression==='activeTodos.length'&&n.value===1),'Original actual count read');
 assert.notEqual(runtime.commit?.producer?.status,'Observed','No React19 final host-props witness');
 const readUI=()=>panel.evaluate(()=>({expressions:document.querySelector('[data-atom-id="expressions"]').textContent,operands:document.querySelector('[data-atom-id="operands"]').textContent,freshness:document.querySelector('[data-atom-id="freshness"]').textContent,status:document.querySelector('[data-atom-id="status"]').textContent}));
 let ui;try{ui=await waitFor(async()=>{const current=await readUI();return current.status==='OK'&&current.expressions.includes(sourceText)&&current.operands.includes('activeTodos.length')?current:null;});}catch(e){result.lastUI=await readUI();throw e;}
 assert(ui.expressions.includes(sourceText));assert(ui.operands.includes('activeTodos.length'));
 const record={label,selectionMethod:'Actual native CSS-selector UI; original TodoMVC .filters overlays the count span',selection:state.selection,source,runtime,ui,run:state.run,inspectionGeneration:state.inspectionGeneration,sourceGeneration:state.sourceGeneration};
 const file=out+'/'+label+'-observation.json';await writeFile(file,JSON.stringify(record,null,2));
 return{...record,file,sha256:sha256(await readFile(file))};
}
async function openSource(observation,workspace){
 const reset=crypto.randomUUID();await writeFile(ide.runtime+'/editor-reset.tmp',JSON.stringify({id:reset}));await rename(ide.runtime+'/editor-reset.tmp',ide.runtime+'/editor-reset.json');
 await waitFor(async()=>JSON.parse(await readFile(ide.runtime+'/editor-reset-done.json','utf8')).id===reset);
 let prior='';try{prior=await readFile(ide.runtime+'/ide-audit.jsonl','utf8');}catch(e){if(e.code!=='ENOENT')throw e;}
 const state=await rpc(panel,{op:'state',tabId}),index=state.analysis.sources.findIndex(s=>s.file===observation.source.file);assert(index>=0);
 await click(q('sources')+' button',index);
 const audit=await waitFor(async()=>String(await readFile(ide.runtime+'/ide-audit.jsonl')).slice(prior.length).split('\n').filter(Boolean).map(JSON.parse).find(a=>a.file===path.join(workspace,observation.source.file)&&['line','column','endLine','endColumn'].every(k=>a[k]===observation.source[k])));
 const source=observation.source,lines=String(await readFile(path.join(workspace,source.file))).split('\n');
 const fragment=source.line===source.endLine?lines[source.line-1].slice(source.column-1,source.endColumn-1):lines.slice(source.line-1,source.endLine).map((line,i,all)=>i===0?line.slice(source.column-1):i===all.length-1?line.slice(0,source.endColumn-1):line).join('\n');
 assert.equal(audit.selectedText,fragment.slice(0,300),'Actual editor selection contains current source bytes');
 return audit;
}
async function saveOriginal(label){
 await action('diagnostic-toggle');await fill('diagnostic-notes','Ordinary source/edit baseline; historical, not a complete path');
 const prior=new Set((await rpc(panel,{op:'list-handoffs'})).entries.map(e=>e.id));await action('save-report');
 const saved=await waitFor(async()=>{const id=await panel.evaluate(()=>document.querySelector('[data-atom-id="report-select"]').value);return id&&!prior.has(id)?rpc(panel,{op:'open-handoff',id}):null;});
 assert.equal(saved.version,1);const file=out+'/'+label+'-original.v1.json';await writeFile(file,saved.raw);await action('diagnostic-toggle');
 return{id:saved.record.id,file,sha256:sha256(saved.raw),raw:saved.raw};
}
async function waitStale(old){
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});const text=await panel.evaluate(()=>document.querySelector('[data-atom-id="freshness"]').textContent);return s.run!==old.run&&text.startsWith('Stale')?{run:s.run,freshness:text,sourceCount:s.analysis?.sources?.length??0}:null;},30000);
 assert.equal(state.sourceCount,0);return state;
}
try{
 await check('exact current immutable .33 archives installed pair and entire hosts',async()=>{
  await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);
  for(const kind of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
 });
 await check('pinned independent extraction source and locked versions are current without changing original',async()=>{
  const revision=String(await readFile(sourceBase+'/REVISION')).trim();assert.equal(revision,todoRevision);
  const recorded=JSON.parse(await readFile(sourceBase+'/SOURCE_SHA256.json')),actual=await fileDigests(sourceBase,entries),expected=Object.fromEntries(Object.entries(recorded).filter(([f])=>f==='license.md'||f.startsWith(appRelative+'/')));
  assert.deepEqual(actual,expected);const lock=JSON.parse(await readFile(appBase+'/package-lock.json')),versions={};
  for(const name of ['react','react-dom','react-router-dom']){versions[name]=JSON.parse(await readFile(appBase+'/node_modules/'+name+'/package.json')).version;assert.equal(versions[name],lock.packages['node_modules/'+name].version);}
  result.upstream={kind:'Pinned extracted directory, no nested Git metadata',revision,sourceFiles:actual,versions};
 });
 for(const kind of ['standalone','embedding']){
  const workspace=await copyWorkspace(kind),entry={kind,workspace,observations:[],sourceVersions:[]};result.cases.push(entry);
  const original=await readFile(workspace.dir+'/'+footer,'utf8');entry.sourceVersions.push({stage:'original',sha256:sha256(original)});
  await startServer(workspace.dir,false);await launch(kind,kind+'-off');
  await addTodo('Alpha ordinary');await addTodo('Beta ordinary');await appClick('.todo-list .toggle');await waitFor(async()=>(await appProbe()).count==='1 item left!');
  entry.baseline=await appProbe();assert.equal(entry.baseline.observer,false);await closeBrowser();await stopServer();
  await startServer(workspace.dir,true);ide=await startOwnedIDE(workspace.dir);await launch(kind,kind+'-on');await pair();await observeServed();
  await panel.evaluate(id=>chrome.debugger.sendCommand({tabId:id},'Page.reload',{ignoreCache:true}),tabId);await waitFor(async()=>(await appProbe()).ready);
  await addTodo('Alpha ordinary');await addTodo('Beta ordinary');await appClick('.todo-list .toggle');await waitFor(async()=>(await appProbe()).count==='1 item left!');
  await check(kind+' ordinary observer-off/on application outputs agree before any source edit',async()=>{entry.initialApp=await appProbe();assert.deepEqual({...entry.initialApp,observer:false},entry.baseline);assert.equal(entry.initialApp.observer,true);});
  await check(kind+' actual native picker selects visible independent task title and preserves the app state',async()=>{
   const before=await appProbe();await choose('property','text');await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick('.todo-list label');
   const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.picker?.status==='selected'&&s.analysis?s:null;});assert.equal(state.selection.value,'Alpha ordinary');assert.deepEqual(await appProbe(),before);
   const source=state.analysis.sources.filter(s=>s.file.endsWith('src/todo/components/item.jsx'));assert.equal(source.length,1);assert.equal(source[0].sourceDigest,sha256(await readFile(workspace.dir+'/src/todo/components/item.jsx')));
   const runtime=state.analysis.stateatom?.runtime;assert.equal(runtime?.status,'Observed');assert.equal(runtime.fullPath,false);assert(runtime.nodes.some(n=>n.expression==='title'&&n.value==='Alpha ordinary'));assert.notEqual(runtime.commit?.producer?.status,'Observed');
   entry.nativeTitle={selectionMethod:'Real native U05 picker',selection:state.selection,source:source[0],runtime};
  });
  entry.served=[await servedFile(kind+'-original',[])];
  let observation;
  await check(kind+' actual selected count resolves ordinary current source/read and IDE range',async()=>{observation=await inspect(kind+'-original','1 item left!','activeTodos.length',workspace.dir);observation.ide=await openSource(observation,workspace.dir);entry.observations.push(observation);});
  entry.saved=await saveOriginal(kind);
  const token='$'+'{activeTodos.length} ';assert.equal(original.split(token).length,2);const same=original.replace(token,'$'+'{activeTodos.length + 0} ');
  await check(kind+' actual same-output source edit invalidates old result and binds new served bytes on explicit reinspection',async()=>{
   await writeFile(workspace.dir+'/'+footer,same);entry.sourceVersions.push({stage:'same-output',sha256:sha256(same)});entry.sameStale=await waitStale(observation);
   await waitFor(async()=>(await appProbe()).ready);await addTodo('Alpha ordinary');await addTodo('Beta ordinary');await appClick('.todo-list .toggle');await waitFor(async()=>(await appProbe()).count==='1 item left!');
   entry.served.push(await servedFile(kind+'-same-output',entry.served.map(e=>e.body)));const next=await inspect(kind+'-same-output','1 item left!','activeTodos.length + 0',workspace.dir);
   assert.notEqual(next.source.sourceDigest,observation.source.sourceDigest);assert.notEqual(next.run,observation.run);assert.notEqual(next.selection.page,observation.selection.page);next.ide=await openSource(next,workspace.dir);entry.observations.push(next);observation=next;
  });
  const changed=same.replace('left!','remaining after edit!');assert.notEqual(changed,same);
  await check(kind+' actual changed-output source edit reaches browser text and current source, not a synthetic watch event',async()=>{
   await writeFile(workspace.dir+'/'+footer,changed);entry.sourceVersions.push({stage:'different-output',sha256:sha256(changed)});entry.changedStale=await waitStale(observation);
   await waitFor(async()=>(await appProbe()).ready);await addTodo('Alpha ordinary');await addTodo('Beta ordinary');await appClick('.todo-list .toggle');await waitFor(async()=>(await appProbe()).count==='1 item remaining after edit!');
   entry.served.push(await servedFile(kind+'-different-output',entry.served.map(e=>e.body)));const next=await inspect(kind+'-different-output','1 item remaining after edit!','activeTodos.length + 0',workspace.dir);assert.notEqual(next.source.sourceDigest,observation.source.sourceDigest);next.ide=await openSource(next,workspace.dir);entry.observations.push(next);observation=next;
  });
  await check(kind+' repeated normal update and old saved source keep separate observations and immutable history',async()=>{
   await appClick('.todo-list .toggle');await waitFor(async()=>(await appProbe()).count==='2 items remaining after edit!');
   const saved=await rpc(panel,{op:'open-handoff',id:entry.saved.id});assert.equal(saved.raw,entry.saved.raw);assert.equal(sha256(await readFile(entry.saved.file)),entry.saved.sha256);
   await choose('property','text');await action('load');await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.value==='2 items remaining after edit!'&&s.selection.observedAt!==observation.selection.observedAt;});
   const current=await rpc(panel,{op:'state',tabId});assert.equal(current.analysis.stateatom.runtime.fullPath,false);assert(current.analysis.stateatom.runtime.nodes.some(n=>n.expression==='activeTodos.length'&&n.value===2));entry.repeated={selection:current.selection,runtime:current.analysis.stateatom.runtime};
   assert.equal((await rpc(panel,{op:'open-handoff',id:entry.saved.id})).raw,entry.saved.raw);
  });
  entry.networkProbeErrors=await panel.evaluate(()=>window.__a01NetworkErrors);assert.deepEqual(entry.networkProbeErrors,[]);
  entry.finalManifest=await fileDigests(workspace.dir,['src','public','package.json','package-lock.json','license.md']);
  for(const[p,digest]of Object.entries(entry.workspace.initialManifest))if(p!==footer)assert.equal(entry.finalManifest[p],digest);
  await panel.screenshot({path:out+'/'+kind+'-source-after-edit-candidate.png'});
  for(const e of entry.served)delete e.body;delete entry.saved.raw;
  await closeBrowser();await stopServer();await ide.close(true);ide=null;
  assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
 }
 result.status='PASS_ORDINARY_REACT_SOURCE_EDIT_ONLY';
}catch(e){result.status='FAIL';result.error=String(e.stack||e);process.exitCode=1;console.error(e);await panel?.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}
finally{
 await closeBrowser().catch(e=>result.errors.push({cleanup:'browser',message:e.message}));await stopServer().catch(e=>result.errors.push({cleanup:'server',message:e.message}));
 if(ide)await ide.close(false).catch(e=>result.errors.push({cleanup:'IDE',message:e.message}));
 result.upstreamAfter=await fileDigests(sourceBase,entries);result.inputsAfter=await inputs();
 if(result.upstream&&JSON.stringify(result.upstream.sourceFiles)!==JSON.stringify(result.upstreamAfter)||JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)||result.errors.length){result.status='FAIL';process.exitCode=1;}
 result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);
}
