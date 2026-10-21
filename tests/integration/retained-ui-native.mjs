// SPDX-License-Identifier: (MIT AND Apache-2.0)
// Retained host/short-loop questions with explicit native MV3 transport.
// Native helpers follow scripts/native-browser.mjs (Apache-2.0). No app CDP owner.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,open,rename} from 'node:fs/promises';
import {fork,execFileSync} from 'node:child_process';
import path from 'node:path';
import net from 'node:net';
import {root} from '../../scripts/vite-config.mjs';
import {startNativeBrowser,nativeApproveDevelopment} from '../../scripts/native-browser.mjs';
import {startIDE,startBrowser,rpc,waitFor} from '../../scripts/harness.mjs';
import {fileDigests,todoRevision,fixtureEntries} from '../../scripts/short-loop-inputs.mjs';
import {fixtureCases,independentCases,remainingStrongVariant} from '../helpers/short-loop-cases.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';

const hf=process.argv.find(s=>s.endsWith('atom-handoff.json'))||'.artifacts/atom/atom-handoff.json',h=JSON.parse(await readFile(hf));
const shortLoop=process.argv.includes('--short-loop'),vueSourceActions=process.argv.includes('--vue-source-actions');
if(vueSourceActions&&!shortLoop)throw Error('--vue-source-actions requires the original short-loop controls');
const out='.artifacts/a01/'+(shortLoop?'retained-short-loop-native':'retained-host-ui-native')+'/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const inputEntries=['core','src/engine','ide-extension','dist/ide','scripts/inspection-server.mjs','scripts/harness.mjs','scripts/native-browser.mjs','tests/ide-host.cjs','tests/integration/retained-ui-native.mjs','tests/integration/react.mjs','tests/helpers/retained-ui-server.mjs','tests/helpers/short-loop-cases.mjs','tests/fixtures/inspection',...(shortLoop?['tests/integration/short-loop.mjs']:[])];
const inputs=async()=>({...await fileDigests(root,inputEntries),...Object.fromEntries(await Promise.all(Object.keys({...h.sourceManifest,...h.buildSources.manifest}).map(async f=>[f,sha256(await readFile(f))])))});
const result={schema:shortLoop?'stateatom.retained-short-loop-native/1':'stateatom.retained-host-ui-native/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,
 handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},
 configuration:{originalCommand:'npm run verify:react-host-ui',originalDriver:'tests/integration/react.mjs',operator:'agent',browserPlugin:'Unavailable; exact immutable native MV3 pair required',appTargetSession:false,transport:'Native inspector Input and existing Atom debugger app Input; explicit chrome.scripting probes, no app page facade/parallel app-target CDP',reactHostProps:true,sourceConsumption:true,reactCommit:false,firstReadContracts:false,model:false,IDE:'Real current VS Code host, exact source-open selection audit',scope:'Same eleven original non-acceptance host-UI checks per host; synthetic pinned React18.3.1 only. No ordinary19 producer, full HTTP path, human acceptance or release.'},
 additiveVueSourceActions:vueSourceActions,checks:[],errors:[],cases:[],inputsBefore:await inputs()};
if(shortLoop)result.configuration={...result.configuration,originalCommand:'npm run verify:short-loop',originalDriver:'tests/integration/short-loop.mjs',registration:'tests/helpers/short-loop-cases.mjs',criterion:'Original T+E+V+I; no full provenance criterion',reactHostProps:false,scope:'Same thirty original cases and 20PASS/10PARTIAL expectations per host; real native UI and actual IDE. Synthetic React/Vue plus retained independent projects; no fresh holdout, ordinary19 final producer, full HTTP path or human acceptance.'};
let browser,panel,panelCDP,server,ide,origin,tabId;
const q=id=>'[data-atom-id="'+id+'"]';
async function check(name,fn){await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);}
async function protocol(){return panelCDP??=await browser.context.newCDPSession(panel);}
async function click(selector,index=0){
 await waitFor(()=>panel.evaluate(({selector,index})=>{const e=document.querySelectorAll(selector)[index];return e&&!e.disabled&&!e.hidden;},{selector,index}));
 const p=await protocol();await p.send('Page.bringToFront');
 const point=await panel.evaluate(async({selector,index})=>{
  const e=document.querySelectorAll(selector)[index];for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS'&&!(e.tagName==='SUMMARY'&&a===e.parentElement))a.open=true;
  e.scrollIntoView({block:'center',behavior:'instant'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
  const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);if(!r.width||!r.height||hit!==e&&!e.contains(hit))throw Error('Covered native inspector control: '+selector);return{x,y};
 },{selector,index});
 (result.nativeUIPoints??=[]).push({selector,index,point});for(const type of ['mouseMoved','mousePressed','mouseReleased'])await p.send('Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});
}
const action=id=>click(q(id));
async function key(key,code=key,n){const p=await protocol();for(const type of ['keyDown','keyUp'])await p.send('Input.dispatchKeyEvent',{type,key,code,...(n?{windowsVirtualKeyCode:n}:{})});}
async function fill(id,value){
 const p=await protocol();await p.send('Page.bringToFront');await waitFor(()=>panel.evaluate(s=>{const e=document.querySelector(s);return e&&!e.disabled;},q(id)));
 await panel.evaluate(s=>{const e=document.querySelector(s);for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS')a.open=true;e.scrollIntoView({block:'center'});e.focus();e.select();},q(id));await p.send('Input.insertText',{text:value});
 assert(await panel.evaluate(({s,value})=>document.querySelector(s).value===value,{s:q(id),value}),'Native field mismatch: '+id);
}
async function choose(id,value){
 await (await protocol()).send('Page.bringToFront');
 const current=await waitFor(()=>panel.evaluate(({s,value})=>{const e=document.querySelector(s);if(!e||e.disabled)return null;const index=[...e.options].findIndex(o=>o.value===value);if(index<0)return null;for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS')a.open=true;e.scrollIntoView({block:'center'});e.focus();return{index,value:e.value};},{s:q(id),value}));
 if(current.value===value)return;if(id==='property')await key(current.index===0?'Home':'End',undefined,current.index===0?36:35);else{await key('Home','Home',36);for(let i=0;i<current.index;i++)await key('ArrowDown','ArrowDown',40);}
 assert(await panel.evaluate(({s,value})=>document.querySelector(s).value===value,{s:q(id),value}),'Native select mismatch: '+id);
}
// Probes read native DOM/browser data; never selected application expressions.
async function appSnapshot(selector='#p1'){
 return panel.evaluate(async({id,selector})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:selector=>{const e=document.querySelector(selector);return{ready:!!e,value:e?.textContent?.trim(),disabled:e?.disabled,marker:e?.getAttribute('data-stateatom'),title:document.querySelector('h1')?.textContent,overlay:!!document.querySelector('vite-error-overlay,nextjs-portal'),observer:typeof window.__STATEATOM__?.snapshot==='function',form:document.getElementById('form')?.value};},args:[selector]}))[0].result,{id:tabId,selector});
}
async function appClick(selector){
 const point=await waitFor(async()=>{
  const attempt=await panel.evaluate(async({id,selector})=>{await chrome.tabs.update(id,{active:true});return(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:async selector=>{
   const e=document.querySelector(selector);if(!e)return{point:null,reason:'Missing element',selector};e.scrollIntoView({block:'center',behavior:'instant'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect(),hits=[];
   for(const x of [r.x+Math.min(8,r.width/2),r.x+r.width/2,r.right-Math.min(8,r.width/2)]){const y=r.y+r.height/2,hit=document.elementFromPoint(x,y);hits.push(hit?.tagName||null);if(r.width&&r.height&&(hit===e||e.contains(hit)))return{point:{x,y},selector,hits,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};}return{point:null,selector,hits,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};
  },args:[selector]}))[0].result;},{id:tabId,selector});result.lastAppGeometry=attempt;return attempt?.point;
 });
 (result.nativeAppPoints??=[]).push({selector,point});await panel.evaluate(async({id,point})=>{for(const type of ['mouseMoved','mousePressed','mouseReleased'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});},{id:tabId,point});
}
async function editForm(value){
 await appClick('#form');await panel.evaluate(async({id,value})=>{for(const type of ['keyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:type==='keyDown'?2:0});await chrome.debugger.sendCommand({tabId:id},'Input.insertText',{text:value});},{id:tabId,value});await waitFor(async()=>(await appSnapshot()).form===value);
}
async function view(){return panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return{status:get('status').textContent,mode:get('mode').textContent,title:get('selection-title').textContent,value:get('selection-value').textContent,freshness:get('freshness').textContent,commit:get('commit-summary').textContent,operands:get('operands').textContent,operandCount:get('operands').querySelectorAll('li').length,sourceButtons:get('sources').querySelectorAll('button').length,expressions:get('expressions').textContent,independent:get('atom-independent').textContent};});}
async function inspect(selector,property,{refresh=false}={}){
 const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt;await choose('property',property);await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).property===property&&(await view()).status==='OK');
 if(refresh)await action('load');else{await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick(selector);}
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.selector===selector&&s.selection.property===property&&s.selection.observedAt!==before&&s.analysis?s:null;});
 const snapshot=await appSnapshot(selector),ui=await waitFor(async()=>{const v=await view();return v.status==='OK'&&v.title===snapshot.value&&v.value===(property==='text'?'Text':'disabled = '+JSON.stringify(state.selection.value))?v:null;});assert.equal(state.selection.value,property==='text'?snapshot.value:snapshot.disabled);assert.equal(state.selection.instance,snapshot.marker);
 const label=selector.replace('#','')+'-'+property+'-'+state.selection.observedAt,file=out+'/'+label+'-state.json';await writeFile(file,JSON.stringify(state,null,2));return{state,snapshot,ui,file,sha256:sha256(await readFile(file))};
}
async function openSource(observation,sourceIndex=0){
 const reset=crypto.randomUUID();await writeFile(ide.runtime+'/editor-reset.tmp',JSON.stringify({id:reset}));await rename(ide.runtime+'/editor-reset.tmp',ide.runtime+'/editor-reset.json');await waitFor(async()=>JSON.parse(await readFile(ide.runtime+'/editor-reset-done.json')).id===reset);
 let prior='';try{prior=String(await readFile(ide.runtime+'/ide-audit.jsonl'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const source=observation.state.analysis.sources[sourceIndex];assert(source);const actual=String(await readFile(path.join(root,source.file)));assert.equal(source.sourceDigest,sha256(actual));await click(q('sources')+' button',sourceIndex);
 const audit=await waitFor(async()=>String(await readFile(ide.runtime+'/ide-audit.jsonl')).slice(prior.length).split('\n').filter(Boolean).map(JSON.parse).find(a=>a.file===path.join(root,source.file)&&['line','column','endLine','endColumn'].every(k=>a[k]===source[k])));
 const lines=actual.split('\n'),fragment=source.line===source.endLine?lines[source.line-1].slice(source.column-1,source.endColumn-1):lines.slice(source.line-1,source.endLine).map((l,i,a)=>i===0?l.slice(source.column-1):i===a.length-1?l.slice(0,source.endColumn-1):l).join('\n');assert.equal(audit.selectedText,fragment.slice(0,300));return audit;
}
async function startServer(kind,{mode='B',hostProps=true}={}){
 const log=await open(out+'/server-'+kind+'.log','wx'),child=fork(path.resolve('tests/helpers/retained-ui-server.mjs'),[mode,String(hostProps),path.resolve(out)+'/vite-'+kind],{cwd:root,stdio:['ignore',log.fd,log.fd,'ipc']});server={child,log};let ready,error;child.on('message',m=>{if(m.type==='ready')ready=m;else error=m.message;});const receipt=await waitFor(()=>{if(error)throw Error(error);if(child.exitCode!==null)throw Error('Own server exited');return ready;},45000);origin=receipt.origin;(result.servers??=[]).push(receipt);
}
async function stopServer(){if(!server)return;const owned=server;server=null;if(owned.child.exitCode===null){owned.child.send({op:'stop'});try{await waitFor(()=>owned.child.exitCode!==null,15000);}catch{owned.child.kill('SIGTERM');await waitFor(()=>owned.child.exitCode!==null,5000);}}await owned.log.close();assert.equal(owned.child.exitCode,0);}
async function closeBrowser(){await panelCDP?.detach().catch(()=>{});panelCDP=null;await browser?.context.close();browser=null;panel=null;tabId=null;}
async function startOwnedIDE(kind){
 const busy=await new Promise(resolve=>{const s=net.createConnection({host:'127.0.0.1',port:49331});s.setTimeout(1000);s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(true);});});assert.equal(busy,false,'Own IDE port occupied; no foreign process changed');
 const runtime=out+'/profiles/ide-'+kind;const instance=await startIDE(runtime,{logDir:out+'/ide-'+kind,projectRoot:root});instance.runtime=runtime;return instance;
}
async function launch(kind,{name=kind+'-host-ui',route='/react/',sourceRoot='tests/fixtures/inspection',noIDE=false}={}){
 browser=await startNativeBrowser(out+'/profiles',name,true,false,[],{extensionPath:h.hosts[kind]});panel=await browser.context.newPage();panel.on('pageerror',e=>result.errors.push({surface:'inspector',message:e.message}));await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));await(await protocol()).send('Emulation.setDeviceMetricsOverride',{width:1100,height:1000,deviceScaleFactor:1,mobile:false});
 tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin+route);await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));await nativeApproveDevelopment(panel,tabId);await action('refresh-tabs');await choose('tabs',String(tabId));await waitFor(()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return get('status').textContent==='OK'&&get('site-mode').value==='development'&&get('connection-label').textContent==='Not attached';}));await action('attach');
 await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).attached);await waitFor(()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return get('status').textContent==='OK'&&get('connection-label').textContent.startsWith('Attached')&&!get('browser-connection').open&&!get('source-connection').open;}));
 if(!noIDE){for(const[id,value]of [['bridge',ide.conn.url],['origin',origin],['source-root',sourceRoot],['token',ide.conn.token]])await fill(id,value);await action('pair');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).connection.source?.url===ide.conn.url);await fill('token','');}
 await navigate(route,{readySelector:route==='/'?'.new-todo':'#p1'});return name;
}
async function navigate(route,{readySelector=route.includes('host-controls')?'#cloned':'#p1'}={}){
 const before=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree')).frameTree.frame,tabId);await panel.evaluate(({id,url})=>chrome.debugger.sendCommand({tabId:id},'Page.navigate',{url}),{id:tabId,url:origin+route});
 await waitFor(async()=>{const f=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree')).frameTree.frame,tabId);return f.loaderId!==before.loaderId&&f.url===origin+route;});await waitFor(async()=>(await appSnapshot(readySelector)).ready);
}
async function exportReport(name,observation){
 await action('diagnostic-toggle');await fill('diagnostic-notes','Which committed '+observation.state.selection.property+' computation belongs to '+observation.state.selection.selector+'?');if(!await panel.evaluate(()=>document.querySelector('[data-atom-id="diagnostic-content"]').checked))await action('diagnostic-content');const previous=new Set((await rpc(panel,{op:'list-handoffs'})).entries.map(e=>e.id));await action('save-report');
 const saved=await waitFor(async()=>{const id=await panel.evaluate(()=>document.querySelector('[data-atom-id="report-select"]').value);return id&&!previous.has(id)?rpc(panel,{op:'open-handoff',id}):null;});assert.equal(saved.version,1);await action('export-report');const preview=await waitFor(()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return get('export-review').open&&get('export-json').value?get('export-json').value:null;}));assert.equal(preview,saved.raw);const report=JSON.parse(preview);assert.equal(report.runtime.commit.hostPropsId,observation.state.analysis.stateatom.runtime.commit.hostPropsId);assert.equal(report.runtime.fullPath,false);
 const [port,route]=String(await readFile(out+'/profiles/'+name+'/DevToolsActivePort')).trim().split('\n'),dir=path.resolve(out+'/downloads/'+name);await mkdir(dir,{recursive:true});const socket=new WebSocket('ws://127.0.0.1:'+port+route),items=new Map();
 try{
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(['Browser.downloadWillBegin','Browser.downloadProgress'].includes(m.method))items.set(m.params.guid,{...items.get(m.params.guid),...m.params});});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Native download setup timeout')),10000);socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(m.id===1){clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve();}});socket.send(JSON.stringify({id:1,method:'Browser.setDownloadBehavior',params:{behavior:'allow',downloadPath:dir,eventsEnabled:true}}));});await action('export-confirm');
  const downloaded=await waitFor(async()=>{const x=[...items.values()].find(x=>x.state==='completed');if(!x)return null;assert(x.totalBytes>0);assert.equal(x.receivedBytes,x.totalBytes);const file=x.filePath||path.join(dir,x.suggestedFilename);assert(file.startsWith(dir+path.sep));assert.equal(String(await readFile(file)),preview);return{file,sha256:sha256(preview),native:{guid:x.guid,state:x.state,receivedBytes:x.receivedBytes,totalBytes:x.totalBytes}};});await action('diagnostic-toggle');return{...downloaded,reportId:report.id,hostPropsId:report.runtime.commit.hostPropsId};
 }finally{socket.close();}
}
async function offlineReader(entry,kind){
 browser=await startBrowser(out+'/profiles',kind+'-fresh-offline-reader',false);panel=await browser.context.newPage();const requests=[];panel.on('request',r=>requests.push(r.url()));panel.on('pageerror',e=>result.errors.push({surface:'reader',message:e.message}));const reader=path.resolve(h.hosts[kind]+'/reader.html');await panel.goto('file://'+reader);
 for(const item of entry.targets){await panel.locator('#diagnostic-file').setInputFiles(item.export.file);await panel.locator('#reader-status').filter({hasText:/^Imported historical/}).waitFor();const summary=await panel.locator('#reader-summary').textContent();for(const phrase of ['Historical host-property correspondence','actual React committed host prop','Complete HTTP provenance is not established'])assert(summary.includes(phrase));const payload=JSON.parse(await panel.locator('#reader-payload').textContent());assert.deepEqual(payload,JSON.parse(await readFile(item.export.file)));item.reader={summary,reportId:payload.id,historical:true,originalAppClosed:server===null,IDEClosed:ide===null};}
 assert(requests.every(u=>u.startsWith('file:')));entry.reader={freshProfile:true,noExtension:true,reader,readerSHA256:sha256(await readFile(reader)),observedRequests:requests,scope:'Fresh-reader page requests file-only; not whole-browser no-traffic proof'};await panel.screenshot({path:out+'/'+kind+'-offline-reader-candidate.png'});await closeBrowser();
}
const compact=s=>s.replace(/\s+/g,'');
async function nativeSelectedDOM(selector,state){
 let query=selector;
 if(/^#[a-zA-Z0-9_-]+$/.test(selector))query='//*[@id="'+selector.slice(1)+'"]';
 if(selector==='.todo-count')query='//span[@class="todo-count"]';
 if(selector==='.todo-count strong')query='//span[@class="todo-count"]/strong';
 if(selector==='.row:nth-last-child(2)')query='(//span[@class="row"])[1]';
 if(selector==='.row:nth-last-child(1)')query='(//span[@class="row"])[2]';
 for(let attempt=0;attempt<2;attempt++)try{
  const metadata=await panel.evaluate(async({id,query,identity})=>{
   const inspected=(await chrome.debugger.sendCommand({tabId:id},'DOM.describeNode',{backendNodeId:Number(identity.node.slice(4))})).node;
   const{searchId,resultCount}=await chrome.debugger.sendCommand({tabId:id},'DOM.performSearch',{query,includeUserAgentShadowDOM:false});let metadata;
   try{if(resultCount!==1)throw Error('Native metadata query must identify exactly one element: '+resultCount);const{nodeIds}=await chrome.debugger.sendCommand({tabId:id},'DOM.getSearchResults',{searchId,fromIndex:0,toIndex:1});const node=(await chrome.debugger.sendCommand({tabId:id},'DOM.describeNode',{nodeId:nodeIds[0]})).node;return metadata={query,backendNodeId:node.backendNodeId,inspectedBackendNodeId:inspected.backendNodeId,nodeName:node.nodeName};}
   finally{try{await chrome.debugger.sendCommand({tabId:id},'DOM.discardSearchResults',{searchId});}catch(e){if(!metadata||!String(e.message).includes('No search session with given id found'))throw e;metadata.searchCleanup='Already retired after completed lookup';}}
  },{id:tabId,query,identity:state.selection.domIdentity});assert.equal(metadata.backendNodeId,metadata.inspectedBackendNodeId);return metadata;
 }catch(e){if(attempt||!['No search session with given id found','Could not find node with given id'].some(message=>String(e.message).includes(message)))throw e;const current=await rpc(panel,{op:'state',tabId});assert.equal(current.selection?.observedAt,state.selection.observedAt);assert.deepEqual(current.selection.domIdentity,state.selection.domIdentity);(result.metadataReadRetries??=[]).push({selector,observedAt:state.selection.observedAt,reason:'Retry one retired native search/frontend ID against unchanged recorded selection; exact backend identity still required, no app action repeated'});}
}
async function shortInspect(group,c,{countCase=true}={}){
 const item={...c,stack:group.stack,mode:group.mode,independent:group.independent,noIDE:group.noIDE,status:'RUNNING'};
 if(countCase)group.cases.push(item);
 const nativeSelector=c.selector==='.row >> nth=0'?'.row:nth-last-child(2)':c.selector==='.row >> nth=1'?'.row:nth-last-child(1)':c.selector;
 if(c.picker&&c.selector.startsWith('.row >> nth='))assert(await panel.evaluate(async({id,selector,index})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:(selector,index)=>document.querySelector(selector)===document.querySelectorAll('.row')[index],args:[selector,index]}))[0].result,{id:tabId,selector:nativeSelector,index:c.id==='row-first'?0:1}),'Native selector must identify original indexed row');
 const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt;await choose('property',c.property);
 // The ordinary initial Text choice is a real UI default, not a persisted state
 // property until changed. Actual selected property is required below in all cases.
 await waitFor(()=>panel.evaluate(property=>{const e=document.querySelector('[data-atom-id="property"]');return e.value===property&&!e.disabled&&document.querySelector('[data-atom-id="status"]').textContent==='OK';},c.property));
 if(c.refresh)await action('load');else if(c.picker){await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick(nativeSelector);}
 else{await fill('selector',c.selector);await action('inspect-selector');}
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.analysis&&s.selection?.observedAt!==before&&s.selection.property===c.property?s:null;});
 item.dom=await nativeSelectedDOM(nativeSelector,state);const snapshot=await appSnapshot(nativeSelector),dom=c.property==='text'?snapshot.value:snapshot.disabled;
 item.ui=await waitFor(async()=>{const v=await view();return v.status==='OK'&&v.title===snapshot.value&&v.value===(c.property==='text'?'Text':'disabled = '+JSON.stringify(c.value))?v:null;});
 item.ui.operandRows=await panel.evaluate(()=>[...document.querySelector('[data-atom-id="operands"]').querySelectorAll('li')].map(row=>({expression:row.querySelector('span')?.textContent?.trim(),value:row.querySelector('code')?.textContent})));
 item.T=dom===c.value&&state.selection.value===dom;const sources=state.analysis.sources.filter(s=>s.expressions.some(e=>compact(e).includes(compact(c.expression))));item.E=sources.length===1&&compact(item.ui.expressions).includes(compact(c.expression));
 const runtime=state.analysis.stateatom?.runtime;
 item.observedValues=(runtime?.nodes||[]).filter(n=>n.status==='Observed'&&n.kind!=='target'&&typeof n.expression==='string'&&c.valueNames.some(x=>n.expression.includes(x))&&['string','number','boolean'].includes(typeof n.value)).map(n=>({kind:n.kind,expression:n.expression,value:n.value,status:n.status,uiVisible:item.ui.operandRows.some(row=>row.expression===n.expression+' ='&&row.value===JSON.stringify(n.value))}));
 item.V=runtime?.status==='Observed'&&item.observedValues.some(n=>n.uiVisible);item.I=false;
 if(item.E){item.ide=await openSource({state},state.analysis.sources.indexOf(sources[0]));item.I=true;}
 const partial=group.noIDE||group.mode==='A'||group.stack==='vue'&&(c.id.startsWith('row-')||group.independent&&c.id!=='remaining-strong-variant');item.expectedEvidence={T:true,E:!group.noIDE,V:!partial,I:!group.noIDE};
 assert.equal(item.ui.mode,group.noIDE?'Basic':group.mode==='B'?'Instrumented':'Source-linked');assert(item.ui.freshness.includes('Not live')&&item.ui.freshness.includes('Snapshot at'));
 if(group.mode==='A')assert.equal(item.ui.operandCount,0);if(group.mode==='B'&&c.id==='P4')assert(!item.ui.operandRows.some(r=>r.expression==='canConfirm ='));
 const stateFile=out+'/'+group.name+'-'+c.id+'-state.json';await writeFile(stateFile,JSON.stringify(state,null,2));item.state={file:stateFile,sha256:sha256(await readFile(stateFile)),selection:state.selection,runtimeStatus:runtime?.status,fullPathNotCriterion:runtime?.fullPath};item.selectionMethod=c.refresh?'Actual Inspect again':c.picker?'Actual native picker':'Actual native CSS-selector UI';item.nativeSelector=nativeSelector;
 for(const[k,expected]of Object.entries(item.expectedEvidence))assert.equal(item[k],expected,group.name+' '+c.id+' '+k);item.status=item.T&&item.E&&item.V&&item.I?'PASS':'PARTIAL';console.log('CASE',group.name,c.id,item.status);return item;
}
async function nativeTodoProbe(){return panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>({titles:[...document.querySelectorAll('.todo-list label')].map(e=>e.textContent.trim()),completed:[...document.querySelectorAll('.todo-list .toggle')].map(e=>e.checked),count:document.querySelector('.todo-count')?.textContent?.trim()})}))[0].result,tabId);}
async function prepareTodo(){
 for(const title of ['Alpha short','Beta short']){const before=(await nativeTodoProbe()).titles.length;await appClick('.new-todo');await panel.evaluate(async({id,title})=>{await chrome.debugger.sendCommand({tabId:id},'Input.insertText',{text:title});for(const type of ['keyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});},{id:tabId,title});await waitFor(async()=>(await nativeTodoProbe()).titles.length===before+1);}
 await appClick('.todo-list li:first-child .toggle');return waitFor(async()=>{const p=await nativeTodoProbe();return p.completed[0]&&!p.completed[1]&&p.titles.length===2?p:null;});
}
async function transitionPick(selector,property){
 const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt;await choose('property',property);await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick(selector);
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.selector===selector&&s.selection.property===property&&s.selection.observedAt!==before&&s.analysis?s:null;});await nativeSelectedDOM(selector,state);await waitFor(async()=>{const v=await view();return v.status==='OK'&&v.title===state.selection.text&&v.value===(property==='text'?'Text':'disabled = '+JSON.stringify(state.selection.value));});return state;
}
async function shortTransitions(entry,group){
 await check(entry.kind+' original picker-start masks old source/operands and retains Text property',async()=>{await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');const masked=await waitFor(async()=>{const v=await view();return v.title==='Select an element'&&v.sourceButtons===0&&v.operandCount===0?v:null;});assert.equal(await panel.evaluate(()=>document.querySelector('[data-atom-id="property"]').value),'text');entry.pickerMask=masked;await appClick('#p4');await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.selector==='#p4'&&s.selection.property==='text'&&s.analysis;});});
 await check(entry.kind+' original property switch clears old source/operands/independent observations and allows new inspection',async()=>{await choose('property','disabled');await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId}),v=await view();return s.property==='disabled'&&!s.selection&&!s.analysis&&v.sourceButtons===0&&v.operandCount===0&&v.independent==='';});await transitionPick('#p4','disabled');});
 await check(entry.kind+' original tab switch clears details and returning restores labelled original snapshot',async()=>{const original=tabId,old=(await rpc(panel,{op:'state',tabId})).selection;const other=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin+'/react/');await action('refresh-tabs');await choose('tabs',String(other));await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId:other}),v=await view();return !s.selection&&v.title==='Select an element'&&v.sourceButtons===0&&v.operandCount===0&&v.independent==='';});await choose('tabs',String(original));await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId:original}),v=await view();return s.selection?.observedAt===old.observedAt&&v.title==='Confirm combined'&&v.value==='disabled = true'&&v.freshness.includes('Not live');});await panel.evaluate(id=>chrome.tabs.remove(id),other);entry.restoredSelection=old;});
 await check(entry.kind+' original390px and first viewport retain bounded width and typography',async()=>{entry.widths=[];for(const width of [390,1100]){await(await protocol()).send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});const viewport=await panel.evaluate(async()=>{await document.fonts.ready;const e=document.querySelector('[data-atom-root]');return{width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,fontSize:getComputedStyle(e).fontSize,fontFamily:getComputedStyle(e).fontFamily};});assert.equal(viewport.width,width);assert.equal(viewport.overflow,false);entry.widths.push(viewport);await panel.screenshot({path:out+'/'+entry.kind+'-short-loop-'+width+'-candidate.png'});}});
}
async function shortNavigation(entry,group){
 const before=await rpc(panel,{op:'state',tabId});await navigate('/react/');
 await check(entry.kind+' original real navigation invalidates details and Inspect again obtains new page/run/read',async()=>{const stale=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId}),v=await view();return s.stale&&!s.analysis&&!s.selection&&v.freshness.startsWith('Stale')&&v.sourceButtons===0&&v.operandCount===0?{run:s.run,ui:v}:null;});await action('load');const after=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.observedAt>before.selection.observedAt&&s.analysis?s:null;});assert.notEqual(after.run,before.run);assert.notEqual(after.selection.page,before.selection.page);const ui=await waitFor(async()=>{const v=await view();return v.status==='OK'&&v.expressions.includes('form.length < 3')?v:null;});const rows=await panel.evaluate(()=>[...document.querySelectorAll('[data-atom-id="operands"] li')].map(e=>({expression:e.querySelector('span')?.textContent.trim(),value:e.querySelector('code')?.textContent})));assert(rows.some(r=>r.expression==='form ='&&r.value==='""'));entry.navigation={before:{run:before.run,selection:before.selection},stale,after:{run:after.run,selection:after.selection},ui,rows};});
}
async function independentVueActions(group,entry){
 const actions=[];
 for(const [index,c]of [independentCases('vue')[0],independentCases('vue')[2]].entries()){
  await shortInspect(group,{...c,id:'vue-source-action-'+index},{countCase:false});
  const state=await rpc(panel,{op:'state',tabId}),binding=state.analysis.actionBindings.find(b=>b.mechanism==='vue-template'&&b.event==='dblclick');
  assert(binding);assert.equal(binding.entry.status,'Code-linked');assert.equal(binding.entry.symbol,'startEdit');assert.equal(binding.execution.status,'not-observed');assert.match(binding.entry.reason,/runtime function identity.*not observed/);
  await action('actions-nav');const ui=await panel.evaluate(()=>document.querySelector('[data-atom-id="action-handlers"]').textContent);assert(ui.includes('startEdit')&&ui.includes('Execution: not observed'));
  const source=binding.entry.source,reset=crypto.randomUUID();assert.equal(source.sourceDigest,sha256(await readFile(source.file)));await writeFile(ide.runtime+'/editor-reset.tmp',JSON.stringify({id:reset}));await rename(ide.runtime+'/editor-reset.tmp',ide.runtime+'/editor-reset.json');await waitFor(async()=>JSON.parse(await readFile(ide.runtime+'/editor-reset-done.json')).id===reset);
  const prior=String(await readFile(ide.runtime+'/ide-audit.jsonl'));await click(q('action-handlers')+' button');
  const audit=await waitFor(async()=>String(await readFile(ide.runtime+'/ide-audit.jsonl')).slice(prior.length).split('\n').filter(Boolean).map(JSON.parse).find(a=>a.file===path.join(root,source.file)&&['line','column','endLine','endColumn'].every(k=>a[k]===source[k])));assert.equal(audit.selectedText,'startEdit');
  const editing=await panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:()=>document.querySelectorAll('.todo-list .edit').length}))[0].result,tabId);assert.equal(editing,0,'Picker/source opening must not invoke dblclick handler');actions.push({selection:state.selection,context:state.analysis.actionContext,binding,ui,editor:audit,editing});
 }
 assert.notEqual(actions[0].context.instance,actions[1].context.instance);assert.notEqual(actions[0].selection.instance,actions[1].selection.instance);assert.equal(actions[0].binding.entry.source.sourceDigest,actions[1].binding.entry.source.sourceDigest);entry.independentVueSourceActions=actions;
}
async function runShortLoop(kind){
 const entry={kind,groups:[]};result.cases.push(entry);ide=await startOwnedIDE(kind);
 for(const mode of ['B','A'])for(const stack of ['react','vue']){
  const group={name:kind+'-'+mode+'-'+stack,mode,stack,independent:false,noIDE:false,cases:[]};entry.groups.push(group);await startServer(group.name,{mode,hostProps:false});await launch(kind,{name:group.name,route:'/'+stack+'/'});
  await check(group.name+' original meaningful route, no overlay and collapsed optional panels',async()=>{group.initial=await appSnapshot();assert.equal(group.initial.overlay,false);assert.equal(group.initial.value,'13');assert(await panel.evaluate(()=>!document.querySelector('[data-atom-id="experiments-details"]').open&&!document.querySelector('[data-atom-id="diagnostics-details"]').open));});
  for(const c of fixtureCases(mode,stack))await shortInspect(group,c);
  if(vueSourceActions&&mode==='B'&&stack==='vue')await check(kind+' additive real QueryClient cached result retains opaque ancestry boundary',async()=>{entry.vueOpaqueCache=await shortInspect(group,{id:'vue-opaque-cache',selector:'#p3',property:'text',value:'15',expression:'cached',valueNames:['cached']},{countCase:false});const s=await rpc(panel,{op:'state',tabId});assert.notEqual(s.analysis.stateatom.runtime.fullPath,true);assert.notEqual(s.analysis.stateatom.runtime.commit?.producer?.status,'Observed');entry.vueOpaqueCache.scope='Actual real QueryClient cached result/read/source; cache revision and complete producer/HTTP ancestry unknown, not a full-lineage pass';});
  if(mode==='B'&&stack==='react')await shortTransitions(entry,group);
  if(mode==='B'){
   group.hypothesis=[];for(const[i,value]of ['','Alex',''].entries()){const old=(await rpc(panel,{op:'state',tabId})).selection;await editForm(value);if(i){const s=await rpc(panel,{op:'state',tabId});assert.deepEqual(s.selection,old);assert((await view()).freshness.includes('Not live'));}const c={id:'form-hypothesis-'+i,selector:'#p5',property:'disabled',value:[true,false,true][i],expression:'form.length < 3',valueNames:['form'],refresh:i>0};await waitFor(async()=>(await appSnapshot('#p5')).disabled===c.value);group.hypothesis.push(await shortInspect(group,c));}assert.deepEqual(group.hypothesis.map(c=>c.status),['PASS','PASS','PASS']);if(stack==='react')await shortNavigation(entry,group);
  }
  await closeBrowser();await stopServer();
 }
 const basic={name:kind+'-A-react-basic',mode:'A',stack:'react',independent:false,noIDE:true,cases:[]};entry.groups.push(basic);await startServer(basic.name,{mode:'A',hostProps:false});await launch(kind,{name:basic.name,noIDE:true});await shortInspect(basic,{id:'P4',selector:'#p4',property:'disabled',value:true,expression:'creditHold || !canConfirm',valueNames:['creditHold']});await closeBrowser();await stopServer();
 for(const stack of ['vue','react']){
  const group={name:kind+'-B-'+stack+'-todo',mode:'B',stack,independent:true,noIDE:false,cases:[]};entry.groups.push(group);await startServer(group.name,{mode:'todo-'+stack,hostProps:false});await launch(kind,{name:group.name,route:'/',sourceRoot:'.runtime/todomvc/examples/'+stack+'/src'});group.initial=await prepareTodo();for(const c of independentCases(stack))await shortInspect(group,c);if(stack==='vue'){await shortInspect(group,remainingStrongVariant);if(vueSourceActions)await check(kind+' additive unchanged independent Vue two-label source actions without altering original PARTIALs',()=>independentVueActions(group,entry));}await closeBrowser();await stopServer();
 }
 await ide.close(true);ide=null;const cases=entry.groups.flatMap(g=>g.cases);entry.counts={total:cases.length,PASS:cases.filter(c=>c.status==='PASS').length,PARTIAL:cases.filter(c=>c.status==='PARTIAL').length};assert.deepEqual(entry.counts,{total:30,PASS:20,PARTIAL:10});assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
}
try{
 await check('exact immutable package and UI pair installed in both native hosts',async()=>{for(const[file,d]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(sha256(await readFile(file)),d,file);await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);for(const kind of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);});
 if(shortLoop){assert.equal(String(await readFile('.runtime/todomvc/REVISION')).trim(),todoRevision);result.upstreamBefore=await fileDigests('.runtime/todomvc',fixtureEntries);assert.deepEqual(result.upstreamBefore,JSON.parse(await readFile('.runtime/todomvc/SOURCE_SHA256.json')));result.versions={};for(const stack of ['react','vue']){const base='.runtime/todomvc/examples/'+stack,lock=JSON.parse(await readFile(base+'/package-lock.json'));for(const name of stack==='react'?['react','react-dom','react-router-dom']:['vue','vue-router']){const version=JSON.parse(await readFile(base+'/node_modules/'+name+'/package.json')).version;assert.equal(version,lock.packages['node_modules/'+name].version);result.versions[stack+'/'+name]=version;}}}
 for(const kind of ['standalone','embedding']){
  if(shortLoop){await runShortLoop(kind);continue;}
  const entry={kind,targets:[]};result.cases.push(entry);await startServer(kind);ide=await startOwnedIDE(kind);const name=await launch(kind);
  await check(kind+' original QA actual React route and extension panel have meaningful content without overlay',async()=>{entry.initial=await appSnapshot();assert.equal(entry.initial.title,'StateAtom React + TS');assert.equal(entry.initial.value,'13');assert.equal(entry.initial.overlay,false);assert.equal(entry.initial.observer,true);const panelTitle=await panel.evaluate(()=>document.title);assert.equal(panelTitle,kind==='standalone'?'StatePort StateAtom':'Independent Atom embedding host');entry.panelTitle=panelTitle;entry.browser=browser.context.browser().version();entry.fonts=await panel.evaluate(async()=>{await document.fonts.ready;return{size:getComputedStyle(document.querySelector('[data-atom-root]')).fontSize,family:getComputedStyle(document.querySelector('[data-atom-root]')).fontFamily};});await panel.screenshot({path:out+'/'+kind+'-first-viewport-candidate.png'});});
  for(const[selector,property]of [['#p2','disabled'],['#p1','text']]){
   const item={selector,property};entry.targets.push(item);
   await check(kind+' '+selector+' actual panel scoped committed host correspondence and observed values',async()=>{item.observation=await inspect(selector,property);const rt=item.observation.state.analysis.stateatom.runtime;assert.equal(rt.commit.status,'Observed');assert.equal(rt.commit.producer.status,'Observed');assert.match(rt.commitIdentity,/^Observed:/);assert.equal(rt.fullPath,false);await waitFor(async()=>{const v=await view();return v.commit.startsWith('Observed · React committed')&&v.commit.includes('Complete HTTP provenance is not established')&&v.operandCount>0;});});
   await check(kind+' '+selector+' Open in IDE exact source range and selected bytes',async()=>{item.ide=await openSource(item.observation);});
   await check(kind+' '+selector+' actual saved reviewed downloaded JSON retains host identity and limits',async()=>{item.export=await exportReport(name,item.observation);});
   if(selector==='#p2')await check(kind+' Inspect again after native form update obtains a new committed execution',async()=>{await editForm('new');const fresh=await inspect(selector,property,{refresh:true}),prior=item.observation.state;assert.equal(fresh.state.analysis.stateatom.runtime.commit.status,'Observed');assert.notEqual(fresh.state.analysis.stateatom.runtime.commit.commitId,prior.analysis.stateatom.runtime.commit.commitId);assert.notEqual(fresh.state.analysis.stateatom.runtime.target.id,prior.analysis.stateatom.runtime.target.id);assert.equal(fresh.state.selection.page,prior.selection.page);assert(fresh.state.selection.observedAt>prior.selection.observedAt);item.afterNativeUpdate=fresh;});
  }
  await navigate('/react/host-controls.html');
  await check(kind+' equal-value clone is explicitly unsupported in actual panel',async()=>{entry.clone=await inspect('#cloned','disabled');const v=await view();assert(v.commit.startsWith('Unknown/Unsupported'));assert.equal(v.operandCount,0);assert.equal(entry.clone.state.analysis.stateatom.runtime.commit.status,'Unknown/Unsupported');await panel.screenshot({path:out+'/'+kind+'-clone-unsupported-candidate.png'});});
  await check(kind+' original explicit DOM mutation invalidates correspondence on reinspection',async()=>{entry.controlled=await inspect('#controlled','disabled');await panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>{const e=document.getElementById('controlled');e.textContent=e.textContent;return{operation:'Original retained textContent self-assignment control'};}}))[0].result,tabId);entry.mutated=await inspect('#controlled','disabled',{refresh:true});const v=await view();assert(v.commit.startsWith('Unknown/Unsupported'));assert.equal(v.operandCount,0);assert.equal(entry.mutated.state.analysis.stateatom.runtime.commit.status,'Unknown/Unsupported');});
  await closeBrowser();await stopServer();await ide.close(true);ide=null;
  await check(kind+' fresh standalone offline reader retains scoped historical host correspondence',()=>offlineReader(entry,kind));assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
 }
 if(shortLoop)result.status='PASS_RETAINED_SHORT_LOOP_EXPLICIT_ORIGINAL_PARTIALS_BOTH_HOSTS';else{assert.equal(result.checks.length,23);result.status='PASS_RETAINED_ELEVEN_HOST_UI_CHECKS_BOTH_HOSTS';}
}catch(e){result.status='FAIL';result.error=String(e.stack||e);process.exitCode=1;console.error(e);await panel?.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}
finally{
 await closeBrowser().catch(e=>result.errors.push({cleanup:'browser',message:e.message}));await stopServer().catch(e=>result.errors.push({cleanup:'server',message:e.message}));if(ide)await ide.close(false).catch(e=>result.errors.push({cleanup:'IDE',message:e.message}));result.inputsAfter=await inputs();if(shortLoop&&result.upstreamBefore){result.upstreamAfter=await fileDigests('.runtime/todomvc',fixtureEntries);if(JSON.stringify(result.upstreamBefore)!==JSON.stringify(result.upstreamAfter)){result.status='FAIL';process.exitCode=1;}}if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);
}
