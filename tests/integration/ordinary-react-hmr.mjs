// SPDX-License-Identifier: Apache-2.0
// Ordinary independent-source/edit controls; not a committed-host or HTTP lineage proof.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,cp,rename,open} from 'node:fs/promises';
import {execFileSync,fork} from 'node:child_process';
import path from 'node:path';
import net from 'node:net';
import {readExplanationUI,assertExplanationMeaning,runExplanationExtras} from '../helpers/explanation-native-cases.mjs';
import {root} from '../../scripts/vite-config.mjs';
import {fileDigests,todoRevision} from '../../scripts/short-loop-inputs.mjs';
import {startNativeBrowser,nativeApproveDevelopment} from '../../scripts/native-browser.mjs';
import {startIDE,startBrowser,rpc,waitFor} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';

const explanationsOnly=process.argv.includes('--explanations-only'),instancesOnly=process.argv.includes('--instances-only'),grammarOnly=process.argv.includes('--grammar-only')||explanationsOnly,pickerViewOnly=process.argv.includes('--picker-view-only'),independentOnly=process.argv.includes('--independent-only');
assert([instancesOnly,grammarOnly,pickerViewOnly,independentOnly].filter(Boolean).length<=1,'Select exactly one bounded mode');
const hf=process.argv.find(s=>s.endsWith('atom-handoff.json'))||'.artifacts/atom/atom-handoff.json';
const h=JSON.parse(await readFile(hf));
const out=(explanationsOnly?'.artifacts/l01/ui-native/':'.artifacts/a01/'+(independentOnly?'ordinary-corpus-native':pickerViewOnly?'ordinary-picker-view-native':grammarOnly?'ordinary-grammar-native':instancesOnly?'ordinary-instances-native':'ordinary-hmr-native')+'/')+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const sourceBase='.runtime/todomvc',appRelative='examples/react',appBase=sourceBase+'/'+appRelative;
const entries=['license.md',appRelative+'/src',appRelative+'/public',appRelative+'/package.json',appRelative+'/package-lock.json'];
const footer='src/todo/components/footer.jsx';
const inputEntries=['src/engine','core/analyzer.mjs','core/runtime-state.mjs','core/bridge.mjs','ide-extension/session.mjs','ide-extension/extension.mjs','dist/ide/extension.cjs','scripts/native-browser.mjs','scripts/harness.mjs','scripts/short-loop-inputs.mjs','tests/ide-host.cjs','tests/integration/ordinary-react-hmr.mjs','tests/helpers/ordinary-react-server.mjs','tests/helpers/ordinary-properties-server.mjs','tests/fixtures/inspection/ordinary-react',...(explanationsOnly?['tests/helpers/explanation-native-cases.mjs','tests/fixtures/explanations']:[]),...(independentOnly?['tests/helpers/ordinary-redux-server.mjs']:[])];
const inputs=async()=>({...await fileDigests(root,inputEntries),...Object.fromEntries(await Promise.all(Object.keys({...h.sourceManifest,...h.buildSources.manifest}).map(async f=>[f,sha256(await readFile(f))])))});
const result={
 schema:explanationsOnly?'stateatom.l01-native-explanations/1':independentOnly?'stateatom.ordinary-react-corpus-native/1':pickerViewOnly?'stateatom.ordinary-react-picker-view-native/1':grammarOnly?'stateatom.ordinary-react-grammar-native/1':instancesOnly?'stateatom.ordinary-react-instances-native/1':'stateatom.ordinary-react-hmr-native/1',status:'RUNNING',startedAt:new Date().toISOString(),
 revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,
 handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},
 configuration:{mode:explanationsOnly?'L01-real-copied-condition-summaries':independentOnly?'retained-three-corpus-questions-both-hosts':pickerViewOnly?'picker-display-cancel-history':grammarOnly?'synthetic-ordinary-grammar':instancesOnly?'equal-instances':'source-edits',operator:'agent',browserPlugin:'Browser plugin unavailable; exact paired native MV3 hosts and existing Atom debugger ownership required',
  source:grammarOnly?'Explicit synthetic grammar fixture in an exclusive copied workspace, using its verified locked React19 dependencies; independent business source unused/unchanged':'Read-only pinned extracted TodoMVC directory; edits only in an exclusive copied workspace including its locked dependencies',
  plugin:{enabled:true,sourceConsumption:true,reactHostProps:false,reactCommit:false,firstReadContracts:false},
  appTargetSession:false,probes:grammarOnly?'Explicit chrome.scripting MAIN/ISOLATED, native app Input and native DOM metadata/search through the existing Atom debugger; no harness DOM.getDocument, app-page facade or parallel app-target session. Getter event reads are explicit synthetic probes.':'Explicit chrome.scripting MAIN/ISOLATED, native app Input, DOM metadata/search (without harness DOM.getDocument) and Network.getResponseBody through the existing Atom debugger. No app-page facade or parallel app-target CDP.',
  IDE:'Real VS Code Extension Host, explicit copied project root and native source-open audit',model:false,
  limits:'Ordinary source/read fragments and selected-occurrence/source freshness only. No React19 final-host-props witness, full HTTP path, no-all-traffic assertion or human acceptance.'},
 checks:[],errors:[],cases:[],inputsBefore:await inputs()
};
let browser,panel,panelCDP,server,ide,origin,tabId;
const q=id=>'[data-atom-id="'+id+'"]';
async function check(name,fn){await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);}
async function protocol(){return panelCDP??=await browser.context.newCDPSession(panel);}
async function click(selector,index=0){
 await waitFor(()=>panel.evaluate(({selector,index})=>{const e=document.querySelectorAll(selector)[index];return e&&!e.disabled&&!e.hidden;},{selector,index}));
 const p=await protocol();await p.send('Page.bringToFront');
 const active=await panel.evaluate(async()=>{const t=await chrome.tabs.getCurrent();return{id:t.id,active:t.active};});
 const point=await panel.evaluate(async({selector,index})=>{
  const e=document.querySelectorAll(selector)[index];
  for(let a=e.parentElement;a;a=a.parentElement)if(a.tagName==='DETAILS'&&!(e.tagName==='SUMMARY'&&a===e.parentElement))a.open=true;
  e.scrollIntoView({block:'center',behavior:'instant'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
  const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);
  if(!r.width||!r.height||hit!==e&&!e.contains(hit))throw Error('Native UI target covered: '+selector);
  return{x,y};
 },{selector,index});
 (result.uiNativePoints??=[]).push({selector,index,point,active});
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
 assert(await panel.evaluate(({s,value})=>document.querySelector(s).value===value,{s:q(id),value}),'Native field fill did not match: '+id);
}
async function choose(id,value){
 await (await protocol()).send('Page.bringToFront');
 const index=await waitFor(()=>panel.evaluate(({s,value})=>{const e=document.querySelector(s);if(!e||e.disabled)return null;const i=[...e.options].findIndex(o=>o.value===value);if(i<0)return null;for(let p=e.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;e.scrollIntoView({block:'center'});e.focus();return i+1;},{s:q(id),value}));
 const current=await panel.evaluate(s=>({value:document.querySelector(s).value,count:document.querySelector(s).options.length}),q(id));
 if(current.value===value)return;
 if(id==='property')await key(index===1?'Home':'End',index===1?'Home':'End',index===1?36:35);else{await key('Home','Home',36);for(let i=1;i<index;i++)await key('ArrowDown','ArrowDown',40);}
 // Home/End/arrows already commit native select changes; no extra Space on a moved focus.
 assert(await panel.evaluate(({s,value})=>document.querySelector(s).value===value,{s:q(id),value}),'Native field fill did not match: '+id);
}
async function appProbe(){if(grammarOnly)return grammarProbe();return panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>({
 count:document.querySelector('.todo-count')?.textContent??null,
 titles:[...document.querySelectorAll('.todo-list label')].map(e=>e.textContent.trim()),
 completed:[...document.querySelectorAll('.todo-list .toggle')].map(e=>e.checked),
 ready:!!document.querySelector('.new-todo'),observer:typeof window.__STATEATOM__?.snapshot==='function'
})}))[0].result,tabId);}
async function appClick(selector,clickCount=1){
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
 await panel.evaluate(async({id,point,clickCount})=>{await chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y});for(let count=1;count<=clickCount;count++)for(const type of ['mousePressed','mouseReleased'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:'left',clickCount:count});},{id:tabId,point,clickCount});
}
async function addTodo(title){
 const {count:previousCount}=await waitFor(async()=>{const p=await appProbe();return p.ready?{count:p.titles.length}:null;});
 await appClick('.new-todo');
 await panel.evaluate(async({id,title})=>{await chrome.debugger.sendCommand({tabId:id},'Input.insertText',{text:title});for(const type of ['keyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});},{id:tabId,title});
 await waitFor(async()=>{const p=await appProbe();return p.titles.length===previousCount+1&&p.titles.at(-1)===title;});
}
async function editTitle(row,value){
 const prefix='.todo-list li:nth-child('+row+')';await appClick(prefix+' label',2);
 await waitFor(()=>panel.evaluate(async({id,selector})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:s=>{const e=document.querySelector(s);return !!e&&e.getBoundingClientRect().width>0;},args:[selector]}))[0]?.result,{id:tabId,selector:prefix+' input.edit'}));
 await appClick(prefix+' input.edit');
 await panel.evaluate(async({id,value})=>{
  for(const type of ['keyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:type==='keyDown'?2:0});
  await chrome.debugger.sendCommand({tabId:id},'Input.insertText',{text:value});
  for(const type of ['keyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 },{id:tabId,value});
 await waitFor(async()=>(await appProbe()).titles[row-1]===value&&await panel.evaluate(async({id,selector})=>(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:s=>!document.querySelector(s),args:[selector]}))[0]?.result,{id:tabId,selector:prefix+' input.edit'}));
}
async function rowDOM(row,selection,selector='.todo-list li:nth-child('+row+') label'){
 const read=()=>panel.evaluate(async({id,selector,identity})=>{
  const inspected=await chrome.debugger.sendCommand({tabId:id},'DOM.describeNode',{backendNodeId:Number(identity.node.slice(4))});
  const document=await chrome.debugger.sendCommand({tabId:id},'DOM.describeNode',{backendNodeId:Number(identity.document.slice(4))});
  const{searchId,resultCount}=await chrome.debugger.sendCommand({tabId:id},'DOM.performSearch',{query:selector,includeUserAgentShadowDOM:false});
  let metadata;try{
   if(resultCount!==1)throw Error('Native row selector does not identify exactly one element: '+resultCount);
   const{nodeIds}=await chrome.debugger.sendCommand({tabId:id},'DOM.getSearchResults',{searchId,fromIndex:0,toIndex:1});
   const{node}=await chrome.debugger.sendCommand({tabId:id},'DOM.describeNode',{nodeId:nodeIds[0]});
   const attributes={};for(let i=0;i<(node.attributes||[]).length;i+=2)attributes[node.attributes[i]]=node.attributes[i+1];
   const{frameTree}=await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree');
   if((frameTree.childFrames||[]).length)throw Error('This registered instance control requires the original single-frame app');
   return metadata={recordedIdentity:identity,inspectedBackendNodeId:inspected.node.backendNodeId,backendNodeId:node.backendNodeId,queriedFrontendNodeId:node.nodeId,documentBackendNodeId:document.node.backendNodeId,frame:frameTree.frame.id,attributes};
  }finally{try{await chrome.debugger.sendCommand({tabId:id},'DOM.discardSearchResults',{searchId});}catch(e){if(!String(e.message).includes('No search session with given id found'))throw e;if(metadata)metadata.searchCleanup='Already retired; exact native lookup above completed';}}
 },{id:tabId,selector,identity:selection.domIdentity});
 for(let attempt=0;attempt<2;attempt++)try{return await read();}catch(e){
  if(attempt||!String(e.message).includes('No search session with given id found'))throw e;
  const current=await rpc(panel,{op:'state',tabId});assert(current.selection,'Native metadata retry requires the same retained selection');assert.equal(current.selection.observedAt,selection.observedAt);assert.deepEqual(current.selection.domIdentity,selection.domIdentity);assert.equal(current.selection.instance,selection.instance);
  (result.nativeDOMReadRetries??=[]).push({selector,reason:'Native search session retired before metadata read; retry once against the unchanged selected identity',observedAt:selection.observedAt,identity:selection.domIdentity});
 }
}
async function inspectTitle(label,row,expected){
 await choose('property','text');const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt,appBefore=await appProbe();
 await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick('.todo-list li:nth-child('+row+') label');
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.picker?.status==='selected'&&s.selection?.observedAt!==before&&s.analysis?s:null;});
 const dom=await rowDOM(row,state.selection),runtime=state.analysis.stateatom?.runtime;result.lastTitleAttempt={label,row,selection:state.selection,dom};
 assert.equal(state.selection.value,expected);assert.equal(state.selection.tag,'label');assert.equal(dom.inspectedBackendNodeId,dom.backendNodeId);assert.equal(state.selection.frame,0);
 assert.equal(state.selection.instance,dom.attributes['data-stateatom']);assert.equal(state.selection.instance,runtime.target.scope+':'+runtime.target.target);
 assert.equal(runtime.status,'Observed');assert.equal(runtime.target.value,expected);assert.equal(runtime.fullPath,false);assert.equal(runtime.commit.status,'Unknown/Unsupported');
 const sources=state.analysis.sources.filter(x=>x.file.endsWith('src/todo/components/item.jsx'));assert.equal(sources.length,1);const source=sources[0],digest=sha256(await readFile(result.currentWorkspace+'/src/todo/components/item.jsx'));
 assert.equal(source.sourceDigest,digest);assert.equal(runtime.target.sourceDigest,digest);
 const reads=runtime.nodes.filter(n=>n.expression==='title'&&n.kind!=='target');assert(reads.some(n=>n.kind==='read'));assert(reads.some(n=>n.kind==='destructure'));
 const byId=new Map(runtime.nodes.map(n=>[n.id,n])),reachable=new Set(),pending=[runtime.target.id];while(pending.length){const id=pending.pop();if(reachable.has(id))continue;reachable.add(id);pending.push(...byId.get(id)?.deps||[]);}
 assert(reads.every(n=>n.value===expected&&n.page===state.selection.page&&n.sourceDigest===digest&&n.scope===runtime.target.scope&&reachable.has(n.id)));
 const ui=await waitFor(()=>panel.evaluate(expected=>{const value={status:document.querySelector('[data-atom-id="status"]').textContent,expressions:document.querySelector('[data-atom-id="expressions"]').textContent,operands:document.querySelector('[data-atom-id="operands"]').textContent,freshness:document.querySelector('[data-atom-id="freshness"]').textContent};return value.status==='OK'&&value.expressions.includes('title')&&value.operands.includes(JSON.stringify(expected))?value:null;},expected));
 assert.deepEqual(await appProbe(),appBefore);
 const record={label,row,selectionMethod:'Real native U05 picker',dom,selection:state.selection,source,runtime,reads,ui,run:state.run},file=out+'/'+label+'-observation.json';
 await writeFile(file,JSON.stringify(record,null,2));return{...record,file,sha256:sha256(await readFile(file))};
}
async function launch(kind,name,{readOnly=false}={}){
 browser=await startNativeBrowser(out+'/profiles',name,true,false,[],{extensionPath:h.hosts[kind]});
 panel=await browser.context.newPage();panel.on('pageerror',e=>result.errors.push({name,message:e.message}));
 await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));
 await (await protocol()).send('Emulation.setDeviceMetricsOverride',{width:1100,height:1000,deviceScaleFactor:1,mobile:false});
 tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin);
 await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
 if(!readOnly)await nativeApproveDevelopment(panel,tabId);await action('refresh-tabs');await choose('tabs',String(tabId));
 // Native select value alone precedes its asynchronous context/load completion.
 // Attach only after the chosen tab's actual connection has rendered.
 const preAttach=await waitFor(()=>panel.evaluate(({id,mode})=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');const r={tab:Number(get('tabs').value),status:get('status').textContent,mode:get('site-mode').value,label:get('connection-label').textContent};return r.tab===id&&r.status==='OK'&&r.mode===mode&&r.label==='Not attached'?r:null;},{id:tabId,mode:readOnly?'read-only':'development'}));(result.preAttachUI??=[]).push({name,...preAttach});await action('attach');
 await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).attached);
 let attachedUI;try{attachedUI=await waitFor(()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');const r={status:get('status').textContent,label:get('connection-label').textContent,browserOpen:get('browser-connection').open,sourceOpen:get('source-connection').open};return r.status==='OK'&&r.label.startsWith('Attached')&&!r.browserOpen&&!r.sourceOpen?r:null;}));}catch(e){const s=await rpc(panel,{op:'state',tabId});result.lastAttachFailure={name,attached:s.attached,run:s.run,stale:s.stale?.reason,mode:s.connection?.mode,ui:await panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return{status:get('status').textContent,label:get('connection-label').textContent,tab:Number(get('tabs').value),browserOpen:get('browser-connection').open,sourceOpen:get('source-connection').open,siteMode:get('site-mode').value};})};throw e;}(result.attachedUI??=[]).push({name,...attachedUI});
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
async function startServer(workspace,enabled,{redux=false}={}){
 const log=await open(out+'/server-'+path.basename(workspace)+'-'+enabled+'.log','wx');
 const child=fork(path.resolve(redux?'tests/helpers/ordinary-redux-server.mjs':grammarOnly?'tests/helpers/ordinary-properties-server.mjs':'tests/helpers/ordinary-react-server.mjs'),[workspace,String(enabled),path.resolve(out)+'/vite-'+path.basename(workspace)+'-'+enabled],{cwd:workspace,stdio:['ignore',log.fd,log.fd,'ipc']});
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
 for(const[id,value]of [['bridge',ide.conn.url],['origin',origin],['source-root',grammarOnly?'control-src':'src'],['token',ide.conn.token]])await fill(id,value);
 await action('pair');try{await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).connection.source?.url===ide.conn.url);}catch(e){const state=await rpc(panel,{op:'state',tabId});result.lastPairFailure={attached:state.attached,sourceConnected:!!state.connection.source,staleReason:state.stale?.reason??null,ui:await panel.evaluate(()=>({status:document.querySelector('[data-atom-id="status"]').textContent,tokenPresent:!!document.querySelector('[data-atom-id="token"]').value}))};throw e;}await fill('token','');
}
async function reloadApp(){
 const before=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree')).frameTree.frame,tabId);
 await panel.evaluate(id=>chrome.debugger.sendCommand({tabId:id},'Page.reload',{ignoreCache:true}),tabId);
 const after=await waitFor(async()=>{
  const frame=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree')).frameTree.frame,tabId);
  return frame.loaderId!==before.loaderId&&frame.url.startsWith(origin)&&(await appProbe()).ready?frame:null;
 });
 (result.reloads??=[]).push({before:{frame:before.id,loader:before.loaderId},after:{frame:after.id,loader:after.loaderId,url:after.url},ready:true});
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
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.selector==='.todo-count'&&s.selection.property==='text'&&s.selection.observedAt!==before&&s.analysis?s:null;});
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
async function saveOriginal(label,{notes='Ordinary source/edit baseline; historical, not a complete path',content=false}={}){
 await action('diagnostic-toggle');await fill('diagnostic-notes',notes);
 if(content&&!await panel.evaluate(()=>document.querySelector('[data-atom-id="diagnostic-content"]').checked))await action('diagnostic-content');
 const prior=new Set((await rpc(panel,{op:'list-handoffs'})).entries.map(e=>e.id));await action('save-report');
 const saved=await waitFor(async()=>{const id=await panel.evaluate(()=>document.querySelector('[data-atom-id="report-select"]').value);return id&&!prior.has(id)?rpc(panel,{op:'open-handoff',id}):null;});
 assert.equal(saved.version,1);const file=out+'/'+label+'-original.v1.json';await writeFile(file,saved.raw);await action('diagnostic-toggle');
 return{id:saved.record.id,file,sha256:sha256(saved.raw),raw:saved.raw};
}
async function grammarProbe(){return panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>({
 ready:!!document.querySelector('#controls-name'),observer:typeof window.__STATEATOM__?.snapshot==='function',
 name:document.querySelector('#controls-name')?.value,hold:document.querySelector('#controls-hold')?.checked,
 disabled:document.querySelector('#condition')?.disabled,direct:document.querySelector('#direct')?.textContent,
 forwarded:document.querySelector('#forwarded')?.textContent,overridden:document.querySelector('#overridden')?.textContent,
 getterEvents:window.ordinaryPropertyEvents?.slice()
})}))[0].result,tabId);}
async function changeGrammarName(value){
 await appClick('#controls-name');
 await panel.evaluate(async({id,value})=>{
  for(const type of ['keyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'a',code:'KeyA',windowsVirtualKeyCode:65,modifiers:type==='keyDown'?2:0});
  await chrome.debugger.sendCommand({tabId:id},'Input.insertText',{text:value});
 },{id:tabId,value});
 await waitFor(async()=>{const p=await grammarProbe();return p.name===value&&p.direct===value&&p.forwarded===value;});
}
async function inspectGrammar(label,selector,property,value,file,expression){
 await choose('property',property);
 const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt,appBefore=await grammarProbe();
 await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick(selector);
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.picker?.status==='selected'&&s.selection?.observedAt!==before&&s.analysis?s:null;});
 const dom=await rowDOM(0,state.selection,selector),runtime=state.analysis.stateatom?.runtime;result.lastGrammarAttempt={label,selection:state.selection,dom,runtime};
 assert.equal(state.selection.value,value);assert.equal(dom.inspectedBackendNodeId,dom.backendNodeId);assert.equal(state.selection.instance,dom.attributes['data-stateatom']);
 assert.equal(state.selection.instance,runtime.target.scope+':'+runtime.target.target);assert.equal(state.selection.frame,0);
 assert.equal(runtime.status,'Observed');assert.equal(runtime.target.value,value);assert.equal(runtime.target.expression,expression);assert.equal(runtime.fullPath,false);assert.equal(runtime.commit.status,'Unknown/Unsupported');
 const matches=state.analysis.sources.filter(s=>s.file===file);assert.equal(matches.length,1);const source=matches[0],digest=sha256(await readFile(result.currentWorkspace+'/'+file));assert.equal(source.sourceDigest,digest);assert.equal(runtime.target.sourceDigest,digest);
 const byId=new Map(runtime.nodes.map(n=>[n.id,n])),reachable=new Set(),pending=[runtime.target.id];while(pending.length){const id=pending.pop();if(reachable.has(id))continue;reachable.add(id);pending.push(...byId.get(id)?.deps||[]);}
 for(const n of runtime.nodes){assert(reachable.has(n.id));assert.equal(n.page,state.selection.page);if(n.sourceDigest)assert.equal(n.sourceDigest,sha256(await readFile(result.currentWorkspace+'/'+n.file)));}
 const ui=await waitFor(()=>panel.evaluate(expression=>{const r={status:document.querySelector('[data-atom-id="status"]').textContent,expressions:document.querySelector('[data-atom-id="expressions"]').textContent,operands:document.querySelector('[data-atom-id="operands"]').textContent,freshness:document.querySelector('[data-atom-id="freshness"]').textContent};return r.status==='OK'&&r.expressions.includes(expression)?r:null;},expression));
 assert.deepEqual(await grammarProbe(),appBefore,'Inspection did not execute the policy getter or change the application');
 const record={label,selectionMethod:'Real native U05 picker',selection:state.selection,dom,source,runtime,ui,appBefore,appAfter:await grammarProbe(),run:state.run,...(explanationsOnly?{state,nativeTabId:tabId,explanation:await readExplanationUI(panel)}:{})};if(explanationsOnly)assertExplanationMeaning(record);const destination=out+'/'+label+'-observation.json';await writeFile(destination,JSON.stringify(record,null,2));return{...record,file:destination,sha256:sha256(await readFile(destination))};
}
function skipped(observation){
 assert(observation.runtime.nodes.some(n=>n.kind==='read'&&n.expression==='hold'&&n.value===true));
 assert(!observation.runtime.nodes.some(n=>['policy.allowed','!policy.allowed'].includes(n.expression)));
 assert.deepEqual(observation.appBefore.getterEvents,[]);
}
function parameterBoundary(observation){
 const reads=observation.runtime.nodes.filter(n=>n.kind==='read'&&n.expression==='text');assert.equal(reads.length,1);assert.equal(reads[0].value,observation.selection.value);assert.equal(reads[0].scope,observation.runtime.target.scope);
 assert(reads[0].boundary.includes('parameter provenance not observed'));assert(observation.runtime.boundaries.some(b=>b.includes('parameter provenance not observed')));
 assert(!observation.runtime.nodes.some(n=>['declared','effective'].includes(n.expression)));
 return reads[0];
}
async function grammarSequence(entry,kind,workspace){
 result.currentWorkspace=workspace.dir;await mkdir(workspace.dir+'/control-src');
 for(const file of ['App.jsx','Label.jsx','Forward.jsx'])await cp(explanationsOnly&&file==='App.jsx'?'tests/fixtures/explanations/App.jsx':'tests/fixtures/inspection/ordinary-react/'+file,workspace.dir+'/control-src/'+file);
 await cp('tests/fixtures/inspection/ordinary-react/index.html',workspace.dir+'/index.html');entry.fixtureManifest=await fileDigests(workspace.dir,['control-src','index.html']);
 const withoutObserver=p=>({...p,observer:false});
 await startServer(workspace.dir,false);await launch(kind,kind+'-grammar-off');
 entry.off={initial:await grammarProbe()};await changeGrammarName('Birch');entry.off.masked=await grammarProbe();await appClick('#controls-hold');await waitFor(async()=>!(await grammarProbe()).hold);entry.off.taken=await grammarProbe();await changeGrammarName('Bi');entry.off.short=await grammarProbe();await closeBrowser();await stopServer();
 await startServer(workspace.dir,true);ide=await startOwnedIDE(workspace.dir);await launch(kind,kind+'-grammar-on');await pair();await reloadApp();
 await check(kind+' native ordinary skipped boolean does not execute its right getter during inspection',async()=>{
  entry.initial=await grammarProbe();assert.deepEqual(withoutObserver(entry.initial),entry.off.initial);assert.equal(entry.initial.disabled,true);
  const condition=await inspectGrammar(kind+'-skipped-initial','#condition','disabled',true,'control-src/App.jsx','hold || !policy.allowed');skipped(condition);condition.ide=await openSource(condition,workspace.dir);entry.initialCondition=condition;entry.saved=await saveOriginal(kind+'-grammar');
 });
 await check(kind+' native wrapper equal values keep exact local parameter and instance boundaries',async()=>{
  const direct=await inspectGrammar(kind+'-direct','#direct','text','Cedar','control-src/App.jsx','name');assert(direct.runtime.nodes.some(n=>n.kind==='read'&&n.expression==='name'&&n.value==='Cedar'));
  const forwarded=await inspectGrammar(kind+'-forwarded','#forwarded','text','Cedar','control-src/Label.jsx','text'),overridden=await inspectGrammar(kind+'-overridden','#overridden','text','Cedar','control-src/Label.jsx','text');
  const a=parameterBoundary(forwarded),b=parameterBoundary(overridden);assert.notEqual(forwarded.dom.backendNodeId,overridden.dom.backendNodeId);assert.notEqual(forwarded.selection.instance,overridden.selection.instance);assert.notEqual(a.id,b.id);assert.equal(forwarded.source.sourceDigest,overridden.source.sourceDigest);forwarded.ide=await openSource(forwarded,workspace.dir);entry.initialTexts={direct,forwarded,overridden};
 });
 await check(kind+' actual form change is masked while hold skips the right operand',async()=>{
  await choose('property','disabled');await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick('#condition');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='selected');const old=await rpc(panel,{op:'state',tabId});
  await changeGrammarName('Birch');assert.deepEqual(withoutObserver(await grammarProbe()),entry.off.masked);
  const previous=await rpc(panel,{op:'state',tabId}),freshness=await panel.evaluate(()=>document.querySelector('[data-atom-id="freshness"]').textContent);entry.maskedOldSnapshot={selection:previous.selection,stale:previous.stale,freshness};if(previous.selection){assert.equal(previous.selection.observedAt,old.selection.observedAt);assert(freshness.includes('Not live'));}else assert(freshness.startsWith('Stale'));
  const condition=await inspectGrammar(kind+'-masked','#condition','disabled',true,'control-src/App.jsx','hold || !policy.allowed');skipped(condition);assert.notEqual(condition.runtime.target.id,entry.initialCondition.runtime.target.id);entry.masked=condition;
  const forwarded=await inspectGrammar(kind+'-forwarded-changed','#forwarded','text','Birch','control-src/Label.jsx','text'),overridden=await inspectGrammar(kind+'-overridden-unchanged','#overridden','text','Cedar','control-src/Label.jsx','text');parameterBoundary(forwarded);parameterBoundary(overridden);entry.changedTexts={forwarded,overridden};
 });
 await check(kind+' actual hold change takes only the original right getter with observed boolean transformation',async()=>{
  await appClick('#controls-hold');await waitFor(async()=>!(await grammarProbe()).hold);assert.deepEqual(withoutObserver(await grammarProbe()),entry.off.taken);assert.deepEqual((await grammarProbe()).getterEvents,['allowed:Birch']);
  const condition=await inspectGrammar(kind+'-taken','#condition','disabled',false,'control-src/App.jsx','hold || !policy.allowed');assert(condition.runtime.nodes.some(n=>n.kind==='member'&&n.expression==='policy.allowed'&&n.value===true));assert(condition.runtime.nodes.some(n=>n.kind==='unary'&&n.expression==='!policy.allowed'&&n.value===false));entry.taken=condition;
 });
 await check(kind+' repeated native form validation obtains current reads and leaves saved original bytes historical',async()=>{
  await changeGrammarName('Bi');assert.deepEqual(withoutObserver(await grammarProbe()),entry.off.short);assert.deepEqual((await grammarProbe()).getterEvents,['allowed:Birch','allowed:Bi']);
  const condition=await inspectGrammar(kind+'-short','#condition','disabled',true,'control-src/App.jsx','hold || !policy.allowed');assert(condition.runtime.nodes.some(n=>n.kind==='member'&&n.expression==='policy.allowed'&&n.value===false));assert(condition.runtime.nodes.some(n=>n.kind==='unary'&&n.expression==='!policy.allowed'&&n.value===true));assert.notEqual(condition.runtime.target.id,entry.taken.runtime.target.id);entry.short=condition;
  assert.equal((await rpc(panel,{op:'open-handoff',id:entry.saved.id})).raw,entry.saved.raw);assert.equal(sha256(await readFile(entry.saved.file)),entry.saved.sha256);
 });
 if(explanationsOnly)await runExplanationExtras({kind,entry,workspace,out,h,check,panel:()=>panel,protocol,action,appClick,grammarProbe,inspectGrammar,waitFor,rpc,tabId,unpair:()=>rpc(panel,{op:'unpair'}),basicPick:async()=>{await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick('#mask');return waitFor(async()=>{const state=await rpc(panel,{op:'state',tabId});return state.picker?.status==='selected'&&state.analysis?.capabilities.sourceResolver==='unavailable'&&state.selection?.selector==='#mask'?{state}:null;});},openReader:async file=>{
  const original=panel,originalCDP=panelCDP;const reader=await browser.context.newPage();await reader.goto('chrome-extension://'+browser.id+'/reader.html');const p=await browser.context.newCDPSession(reader);try{await p.send('Page.bringToFront');const root=(await p.send('DOM.getDocument')).root.nodeId,input=(await p.send('DOM.querySelector',{nodeId:root,selector:'#diagnostic-file'})).nodeId;await p.send('DOM.setFileInputFiles',{nodeId:input,files:[path.resolve(file)]});return await waitFor(()=>reader.evaluate(()=>{const status=document.getElementById('reader-status').textContent;if(!status.startsWith('Imported historical'))return null;return{status,summary:document.getElementById('reader-summary').textContent,detailsOpen:[...document.querySelectorAll('details')].find(n=>n.querySelector('summary')?.textContent==='Recorded findings and limits')?.open};}));}finally{const id=await reader.evaluate(async()=>(await chrome.tabs.getCurrent()).id);await p.detach();await original.evaluate(id=>chrome.tabs.remove(id),id);panel=original;panelCDP=originalCDP;}
 }});
 entry.finalManifest=await fileDigests(workspace.dir,['src','public','package.json','package-lock.json','license.md']);assert.deepEqual(entry.finalManifest,workspace.initialManifest);assert.deepEqual(await fileDigests(workspace.dir,['control-src','index.html']),entry.fixtureManifest);
 await panel.screenshot({path:out+'/'+kind+'-grammar-candidate.png'});delete entry.saved.raw;await closeBrowser();await stopServer();await ide.close(true);ide=null;assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
}

async function pickerPresentation(){return panel.evaluate(()=>{
 const get=id=>document.querySelector('[data-atom-id="'+id+'"]');
 return{title:get('selection-title').textContent,value:get('selection-value').textContent,freshness:get('freshness').textContent,
  sourceButtons:get('sources').querySelectorAll('button').length,operandRows:get('operands').querySelectorAll('li').length,
  actionButtons:get('action-handlers').querySelectorAll('button').length+get('action-more').querySelectorAll('button').length,
  explanation:get('action-explanation').textContent,explainDisabled:get('action-explain').disabled,
  saveDisabled:get('save-report').disabled,inspectDisabled:get('load').disabled,inputOpenDisabled:get('input-open').disabled,raw:get('evidence').textContent,
  pickerStatus:get('picker-status').textContent,pickerPressed:get('pick').getAttribute('aria-pressed')==='true',property:get('property').value,overflow:document.documentElement.scrollWidth>innerWidth+1,
  guidance:{label:get('inspection-next').textContent,disabled:get('inspection-next').disabled},
  font:{title:getComputedStyle(get('selection-title')).fontSize,operand:getComputedStyle(get('operands')).fontSize,hint:getComputedStyle(get('freshness')).fontSize}};
 });}
async function startPickerView(){await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker.status==='picking');}
async function maskedView(){return waitFor(async()=>{const v=await pickerPresentation();return v.pickerPressed&&v.pickerStatus.includes('Click an element')&&v.title==='Select an element'&&v.sourceButtons===0&&v.operandRows===0&&v.actionButtons===0&&!v.explanation&&v.explainDisabled&&v.saveDisabled&&v.inspectDisabled&&v.inputOpenDisabled&&v.guidance.label==='Cancel element selection'&&!v.guidance.disabled?v:null;});}
async function guidanceEnter(){
 const p=await protocol();await p.send('Page.bringToFront');await panel.evaluate(s=>{
  const e=document.querySelector(s);e.scrollIntoView({block:'center',behavior:'instant'});e.focus();if(document.activeElement!==e)throw Error('Guidance did not receive actual keyboard focus');
  window.__a01GuidanceEvents=[];window.__a01GuidanceAbort?.abort();window.__a01GuidanceAbort=new AbortController();for(const type of ['keydown','keypress','keyup','click'])document.addEventListener(type,event=>{if(event.target===e)window.__a01GuidanceEvents.push({type:event.type,key:event.key??null,isTrusted:event.isTrusted,defaultPrevented:event.defaultPrevented});},{capture:true,signal:window.__a01GuidanceAbort.signal});
 },q('inspection-next'));
 // Installed Playwright's primary Chromium input supplies Enter text '\r'; an
 // untexted keyDown delivers a key event but not the button's activation.
 const descriptor={key:'Enter',code:'Enter',windowsVirtualKeyCode:13,modifiers:0,location:0,isKeypad:false};await p.send('Input.dispatchKeyEvent',{type:'keyDown',...descriptor,text:'\r',unmodifiedText:'\r',autoRepeat:false});await p.send('Input.dispatchKeyEvent',{type:'keyUp',...descriptor});
 const events=await panel.evaluate(()=>{window.__a01GuidanceAbort.abort();return window.__a01GuidanceEvents;});assert(events.some(e=>e.type==='click'&&e.isTrusted),'Enter must cause a real trusted guidance activation');(result.guidanceNativeEvents??=[]).push(events);
}
async function originalAfterCancel(original){
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.picker.status==='cancelled'?s:null;});
 assert.deepEqual(state.selection,original.selection);assert.equal(state.analysis.stateatom.runtime.target.id,original.runtime.target.id);assert.equal(state.analysis.stateatom.runtime.target.at,original.runtime.target.at);assert.deepEqual(state.analysis.stateatom.runtime.nodes.map(n=>[n.id,n.at]),original.runtime.nodes.map(n=>[n.id,n.at]));
 const ui=await waitFor(async()=>{const v=await pickerPresentation();return !v.pickerPressed&&v.title===original.selection.text&&v.sourceButtons>0&&v.operandRows>0&&!v.saveDisabled&&!v.inspectDisabled?v:null;});
 assert(ui.freshness.includes('Not live'));return{selection:state.selection,runtime:state.analysis.stateatom.runtime,ui,inspectionGeneration:state.inspectionGeneration};
}
async function basicPickerView(entry,kind,workspace){
 await startServer(workspace.dir,false);await launch(kind,kind+'-basic-picker-view',{readOnly:true});await addTodo('Basic Cedar');
 await check(kind+' native Basic read-only selection has no parallel app debugger or invented source',async()=>{
  await choose('property','text');await startPickerView();await appClick('.todo-list label');const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.picker.status==='selected'&&s.selection&&s.analysis?s:null;});
  assert.equal(state.readOnly,true);assert.equal(state.selection.value,'Basic Cedar');assert.equal(state.analysis.capabilities.sourceResolver,'unavailable');assert.equal(state.analysis.stateatom.runtime.status,'Unknown/Unsupported');assert.equal(state.analysis.sources.length,0);const dom=await rowDOM(1,state.selection);assert.equal(dom.backendNodeId,dom.inspectedBackendNodeId);entry.basic={selection:state.selection,dom,runtime:state.analysis.stateatom.runtime,ui:await waitFor(async()=>{const v=await pickerPresentation();return !v.pickerPressed&&v.title==='Basic Cedar'&&!v.saveDisabled?v:null;}),app:await appProbe()};
 });
 await check(kind+' native Basic UI Cancel guidance Enter and real Escape restore the exact old DOM snapshot',async()=>{
  entry.basic.cancelled=[];for(const method of ['UI Cancel','guidance Enter','app Escape']){
   await startPickerView();const masked=await maskedView();const held=await rpc(panel,{op:'state',tabId});assert.deepEqual(held.selection,entry.basic.selection);entry.basic.lastCancelAttempt={method,before:held.picker,masked};
   if(method==='UI Cancel')await action('pick');else if(method==='guidance Enter')await guidanceEnter();else await panel.evaluate(async id=>{await chrome.tabs.update(id,{active:true});for(const type of ['rawKeyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27,modifiers:0,location:0});},tabId);
   const after=await rpc(panel,{op:'state',tabId});entry.basic.lastCancelAttempt.after={picker:after.picker,ui:await pickerPresentation(),status:await panel.evaluate(()=>document.querySelector('[data-atom-id="status"]').textContent)};
   const cancelled=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});entry.basic.lastCancelAttempt.lastPicker=s.picker;return s.picker.status==='cancelled'?s:null;});assert.deepEqual(cancelled.selection,entry.basic.selection);const ui=await waitFor(async()=>{const v=await pickerPresentation();return !v.pickerPressed&&v.title==='Basic Cedar'&&!v.saveDisabled&&!v.inspectDisabled?v:null;});assert.equal(ui.freshness,entry.basic.ui.freshness);assert.equal(ui.inputOpenDisabled,entry.basic.ui.inputOpenDisabled);assert.deepEqual(await appProbe(),entry.basic.app);entry.basic.cancelled.push({method,masked,selection:cancelled.selection,ui});
  }
 });await closeBrowser();await stopServer();
}
async function pickerViewSequence(entry,kind,workspace){
 result.currentWorkspace=workspace.dir;await basicPickerView(entry,kind,workspace);await startServer(workspace.dir,true);ide=await startOwnedIDE(workspace.dir);await launch(kind,kind+'-picker-view');await pair();await reloadApp();await addTodo('Equal Cedar');await addTodo('Equal Cedar');
 await check(kind+' original native selected source/read and saved history exist before another pick',async()=>{
  const original=await inspectTitle(kind+'-before-picker-view',1,'Equal Cedar');original.ide=await openSource(original,workspace.dir);entry.original=original;entry.saved=await saveOriginal(kind+'-picker-view');entry.appBefore=await appProbe();assert.equal(await panel.evaluate(()=>document.querySelector('[data-atom-id="action-local-enabled"]').checked),false);await action('action-explain');entry.beforeUI=await pickerPresentation();assert(entry.beforeUI.sourceButtons>0);assert(entry.beforeUI.operandRows>0);assert(entry.beforeUI.explanation);assert.equal(entry.beforeUI.inputOpenDisabled,false);
 });
 await check(kind+' native picker and background refresh hide old details while UI Cancel restores exact prior event',async()=>{
  await startPickerView();entry.picking=await maskedView();const held=await rpc(panel,{op:'state',tabId});assert.deepEqual(held.selection,entry.original.selection);assert.equal(held.analysis.stateatom.runtime.target.id,entry.original.runtime.target.id);entry.heldDuringPick={selection:held.selection,targetId:held.analysis.stateatom.runtime.target.id,picker:held.picker};
  await action('refresh-tabs');entry.afterRefresh=await maskedView();assert(!entry.afterRefresh.raw.includes(entry.original.runtime.target.id));
  for(const width of [390,1100]){await (await protocol()).send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await panel.evaluate(()=>document.querySelector('[data-atom-id="scroll"]').scrollTop=0);const ui=await maskedView();assert.equal(ui.overflow,false);(entry.viewport??=[]).push({width,ui});await panel.screenshot({path:out+'/'+kind+'-picking-'+width+'-candidate.png'});}
  await action('pick');entry.uiCancelled=await originalAfterCancel(entry.original);assert.equal(entry.uiCancelled.ui.inputOpenDisabled,entry.beforeUI.inputOpenDisabled);assert.deepEqual(await appProbe(),entry.appBefore);assert.equal((await rpc(panel,{op:'open-handoff',id:entry.saved.id})).raw,entry.saved.raw);
 });
 await check(kind+' actual application Escape preserves the same old snapshot and original clocks',async()=>{
  await startPickerView();await maskedView();await panel.evaluate(async id=>{await chrome.tabs.update(id,{active:true});for(const type of ['rawKeyDown','keyUp'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchKeyEvent',{type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27,modifiers:0,location:0});},tabId);
  entry.escapeCancelled=await originalAfterCancel(entry.original);assert.equal(entry.escapeCancelled.ui.inputOpenDisabled,entry.beforeUI.inputOpenDisabled);assert.deepEqual(await appProbe(),entry.appBefore);assert.equal((await rpc(panel,{op:'open-handoff',id:entry.saved.id})).raw,entry.saved.raw);
 });
 await check(kind+' correctly labelled cancellation guidance accepts real Enter and restores the exact old event',async()=>{
  await startPickerView();entry.guidancePicking=await maskedView();await guidanceEnter();entry.guidanceCancelled=await originalAfterCancel(entry.original);assert.equal(entry.guidanceCancelled.ui.inputOpenDisabled,entry.beforeUI.inputOpenDisabled);assert.deepEqual(await appProbe(),entry.appBefore);assert.equal((await rpc(panel,{op:'open-handoff',id:entry.saved.id})).raw,entry.saved.raw);
 });
 await check(kind+' explicit fresh equal-value second pick uses its own current DOM/read identity',async()=>{
  const second=await inspectTitle(kind+'-after-picker-view',2,'Equal Cedar');entry.second=second;assert.notEqual(second.dom.backendNodeId,entry.original.dom.backendNodeId);assert.notEqual(second.runtime.target.scope,entry.original.runtime.target.scope);assert.notEqual(second.runtime.target.id,entry.original.runtime.target.id);assert(second.selection.observedAt>entry.original.selection.observedAt);assert.equal((await rpc(panel,{op:'open-handoff',id:entry.saved.id})).raw,entry.saved.raw);assert.equal(sha256(await readFile(entry.saved.file)),entry.saved.sha256);assert.deepEqual(await appProbe(),entry.appBefore);
 });
 entry.finalManifest=await fileDigests(workspace.dir,['src','public','package.json','package-lock.json','license.md']);assert.deepEqual(entry.finalManifest,workspace.initialManifest);await panel.screenshot({path:out+'/'+kind+'-after-picker-cancel-candidate.png'});delete entry.saved.raw;await closeBrowser();await stopServer();await ide.close(true);ide=null;assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
}

async function waitStale(old){
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});const text=await panel.evaluate(()=>document.querySelector('[data-atom-id="freshness"]').textContent);return s.run!==old.run&&text.startsWith('Stale')?{run:s.run,freshness:text,sourceCount:s.analysis?.sources?.length??0}:null;},30000);
 assert.equal(state.sourceCount,0);return state;
}
const corpusApps=[
 {name:'react',base:sourceBase,relative:appRelative,versions:['react','react-dom','react-router-dom'],questions:[{id:'remaining',selector:'.todo-count',file:footer,expression:'activeTodos.length',value:1,question:'After adding Alpha and Beta and completing Alpha, which expression and observed read explain the remaining count?'}]},
 {name:'react-redux',base:'.runtime/independent-apps/todomvc-redux-'+todoRevision.slice(0,12),relative:'examples/react-redux',versions:['react','react-dom','react-redux','@reduxjs/toolkit'],questions:[{id:'remaining',selector:'.todo-count',file:'src/components/footer.jsx',expression:'activeCount',value:1,question:'After adding Alpha and Beta and completing Alpha, which expression and observed read explain the remaining count?'},{id:'completed-title',selector:'.todo-list li:first-child label',file:'src/components/item.jsx',expression:'todo.text',value:'Alpha independent',question:'Where is the completed Alpha title rendered and what title value was actually read?'}]}
];
async function corpusUpstream(app){
 const revision=String(await readFile(app.base+'/REVISION')).trim();assert.equal(revision,todoRevision);
 const entries=['license.md',...['src','public','package.json','package-lock.json'].map(p=>app.relative+'/'+p)];
 const sourceFiles=await fileDigests(app.base,entries),recorded=JSON.parse(await readFile(app.base+'/SOURCE_SHA256.json'));
 assert.deepEqual(sourceFiles,Object.fromEntries(Object.entries(recorded).filter(([p])=>p==='license.md'||p.startsWith(app.relative+'/'))));
 const base=app.base+'/'+app.relative,lock=JSON.parse(await readFile(base+'/package-lock.json')),versions={};
 for(const name of app.versions){versions[name]=JSON.parse(await readFile(base+'/node_modules/'+name+'/package.json')).version;assert.equal(versions[name],lock.packages['node_modules/'+name].version);}
 return{base:app.base,relative:app.relative,revision,sourceFiles,versions,heldout:false,historicalHeldout:app.name==='react-redux',evaluation:'Retained original questions; already exposed, not a fresh holdout'};
}
async function corpusWorkspace(kind,app,upstream){
 const dir=path.resolve(out+'/'+kind+'-'+app.name+'-workspace');await mkdir(dir);
 for(const p of ['src','public','package.json','package-lock.json','node_modules'])await cp(app.base+'/'+app.relative+'/'+p,dir+'/'+p,{recursive:true,verbatimSymlinks:true});
 await cp(app.base+'/license.md',dir+'/license.md');const initialManifest=await fileDigests(dir,['src','public','package.json','package-lock.json','license.md']);
 for(const[p,digest]of Object.entries(initialManifest))assert.equal(digest,upstream.sourceFiles[p==='license.md'?p:app.relative+'/'+p]);
 return{dir,initialManifest};
}
async function inspectCorpus(label,question,workspace){
 await choose('property','text');const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt,appBefore=await appProbe();
 if(!await panel.evaluate(()=>document.querySelector('[data-atom-id="selector-details"]').open))await click(q('selector-details')+' > summary');
 await fill('selector',question.selector);await action('inspect-selector');
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.selector===question.selector&&s.selection.property==='text'&&s.selection.observedAt!==before&&s.analysis?s:null;});
 // DOM.performSearch also searches text; a bare .todo-count returned two hits.
 // Use the original known span's XPath for native metadata only. UI question and
 // selected backend/marker checks stay exactly the same and mismatches still fail.
 const nativeMetadataQuery=question.selector==='.todo-count'?'//span[@class="todo-count"]':question.selector;
 const dom=await rowDOM(null,state.selection,nativeMetadataQuery),runtime=state.analysis.stateatom?.runtime;
 result.lastCorpusAttempt={label,selection:state.selection,sourceFiles:state.analysis.sources.map(s=>s.file),runtimeStatus:runtime?.status};
 assert.equal(dom.inspectedBackendNodeId,dom.backendNodeId);assert.equal(state.selection.instance,dom.attributes['data-stateatom']);assert.equal(state.selection.frame,0);
 assert.equal(runtime.status,'Observed');assert.equal(runtime.fullPath,false);assert.equal(runtime.commit.status,'Unknown/Unsupported');assert.equal(state.selection.instance,runtime.target.scope+':'+runtime.target.target);assert.equal(runtime.target.value,state.selection.value);
 const sources=state.analysis.sources.filter(s=>s.file.endsWith(question.file));assert.equal(sources.length,1);const source=sources[0],digest=sha256(await readFile(workspace+'/'+question.file));assert.equal(source.sourceDigest,digest);assert.equal(runtime.target.sourceDigest,digest);assert(source.expressions.some(e=>e.includes(question.expression)));
 const byId=new Map(runtime.nodes.map(n=>[n.id,n])),reachable=new Set(),pending=[runtime.target.id];while(pending.length){const id=pending.pop();if(reachable.has(id))continue;reachable.add(id);pending.push(...byId.get(id)?.deps||[]);}
 // Existing member observations do not carry a direct scope field. Bind them by
 // actual selected-target dependency IDs/page/digest; never invent that field.
 const reads=runtime.nodes.filter(n=>n.expression===question.expression&&n.kind!=='target'&&n.status==='Observed');assert(reads.length);for(const n of reads){assert.equal(n.value,question.value);if(n.scope!==undefined)assert.equal(n.scope,runtime.target.scope);assert.equal(n.sourceDigest,digest);assert.equal(n.page,state.selection.page);assert(reachable.has(n.id));}
 const ui=await waitFor(()=>panel.evaluate(({expression,value})=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');const r={status:get('status').textContent,expressions:get('expressions').textContent,operands:get('operands').textContent,freshness:get('freshness').textContent};return r.status==='OK'&&r.expressions.includes(expression)&&r.operands.includes(expression+' = '+JSON.stringify(value))?r:null;},{expression:question.expression,value:question.value}));
 assert.deepEqual(await appProbe(),appBefore);const record={label,question,selectionMethod:'Actual native CSS-selector UI; same retained independent question',nativeMetadataQuery,dom,selection:state.selection,source,runtime,reads,ui,run:state.run};const file=out+'/'+label+'-observation.json';await writeFile(file,JSON.stringify(record,null,2));return{...record,file,sha256:sha256(await readFile(file))};
}
async function corpusDownload(name,saved,question){
 const [port,route]=String(await readFile(out+'/profiles/'+name+'/DevToolsActivePort')).trim().split('\n'),dir=path.resolve(out+'/downloads/'+name);await mkdir(dir,{recursive:true});
 const socket=new WebSocket('ws://127.0.0.1:'+port+route),items=new Map();
 try{
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(['Browser.downloadWillBegin','Browser.downloadProgress'].includes(m.method))items.set(m.params.guid,{...items.get(m.params.guid),...m.params});});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Native download configuration timeout')),10000);socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(m.id===1){clearTimeout(timer);m.error?reject(Error(m.error.message)):resolve();}});socket.send(JSON.stringify({id:1,method:'Browser.setDownloadBehavior',params:{behavior:'allow',downloadPath:dir,eventsEnabled:true}}));});
  await action('diagnostic-toggle');await action('export-report');const preview=await waitFor(()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return get('export-review').open&&get('export-json').value?get('export-json').value:null;}));assert.equal(preview,saved.raw);assert(preview.includes(question.question));await action('export-confirm');
  const downloaded=await waitFor(async()=>{const x=[...items.values()].find(x=>x.state==='completed');if(!x)return null;assert(x.totalBytes>0);assert.equal(x.receivedBytes,x.totalBytes);const file=x.filePath||path.join(dir,x.suggestedFilename);assert(file.startsWith(dir+path.sep));const raw=await readFile(file,'utf8');assert.equal(raw,preview);return{file,sha256:sha256(raw),native:{guid:x.guid,state:x.state,receivedBytes:x.receivedBytes,totalBytes:x.totalBytes}};});
  await action('diagnostic-toggle');return downloaded;
 }finally{socket.close();}
}
async function corpusReader(entry,kind,app){
 // No extension, application server or IDE connection exists in this fresh profile.
 browser=await startBrowser(out+'/profiles',kind+'-'+app.name+'-passive-reader',false);panel=await browser.context.newPage();const requests=[];panel.on('request',r=>requests.push(r.url()));panel.on('pageerror',e=>result.errors.push({reader:app.name,message:e.message}));
 const reader=path.join(h.hosts[kind],'reader.html');await panel.goto('file://'+path.resolve(reader));
 for(const record of entry.questions){await panel.locator('#diagnostic-file').setInputFiles(record.download.file);await panel.locator('#reader-status').filter({hasText:/^Imported historical diagnostic/}).waitFor();const summary=await panel.locator('#reader-summary').textContent();assert(summary.includes(record.question.question));assert(summary.includes(record.question.file));assert(summary.includes('Complete provenance is not established'));const raw=await panel.locator('#reader-payload').textContent(),payload=JSON.parse(raw);assert.deepEqual(payload,JSON.parse(await readFile(record.download.file)));assert(payload.runtime.nodes.some(n=>n.expression===record.question.expression&&n.value===record.question.value));await panel.screenshot({path:out+'/'+kind+'-'+app.name+'-'+record.question.id+'-reader-candidate.png'});record.reader={freshProfile:true,noExtension:true,appServerClosed:server===null,IDEClosed:ide===null,summary,payloadSha256:sha256(raw),status:await panel.locator('#reader-status').textContent()};}
 assert(requests.every(u=>u.startsWith('file:')));entry.reader={reader,sha256:sha256(await readFile(reader)),requests,networkScope:'Observed fresh-reader page requests are file-only; not a whole-browser traffic absence claim'};await closeBrowser();
}
async function corpusSequence(kind,app,upstream){
 const workspace=await corpusWorkspace(kind,app,upstream),entry={kind,app:app.name,heldout:false,historicalHeldout:app.name==='react-redux',workspace,questions:[]};result.cases.push(entry);const options={redux:app.name==='react-redux'};
 async function prepare(){await addTodo('Alpha independent');await addTodo('Beta independent');await appClick('.todo-list li:first-child .toggle');return waitFor(async()=>{const p=await appProbe();return p.completed[0]&&!p.completed[1]&&p.count?.includes('1 item left')?p:null;});}
 await startServer(workspace.dir,false,options);await launch(kind,kind+'-'+app.name+'-corpus-off');entry.off=await prepare();assert.equal(entry.off.observer,false);await closeBrowser();await stopServer();
 const name=kind+'-'+app.name+'-corpus-on';await startServer(workspace.dir,true,options);ide=await startOwnedIDE(workspace.dir);await launch(kind,name);await pair();await reloadApp();
 await check(kind+' '+app.name+' original two tasks/native toggle match instrumentation-off output',async()=>{entry.on=await prepare();assert.equal(entry.on.observer,true);assert.deepEqual({...entry.on,observer:false},entry.off);});
 for(const question of app.questions)await check(kind+' '+app.name+' '+question.id+' original source/read/IDE/save/review/native-download question',async()=>{const label=kind+'-'+app.name+'-'+question.id,record={question,status:'RUNNING'};entry.questions.push(record);record.observation=await inspectCorpus(label,question,workspace.dir);record.observation.ide=await openSource(record.observation,workspace.dir);record.saved=await saveOriginal(label,{notes:question.question,content:true});record.download=await corpusDownload(name,record.saved,question);assert.equal(record.download.sha256,record.saved.sha256);delete record.saved.raw;record.status='USEFUL_SUPPORTED_FRAGMENT';await panel.screenshot({path:out+'/'+label+'-panel-candidate.png'});});
 entry.finalManifest=await fileDigests(workspace.dir,['src','public','package.json','package-lock.json','license.md']);assert.deepEqual(entry.finalManifest,workspace.initialManifest);await closeBrowser();await stopServer();await ide.close(true);ide=null;
 await check(kind+' '+app.name+' exact reviewed questions load in a fresh passive reader after app/IDE close',()=>corpusReader(entry,kind,app));assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
}
try{
 await check('exact current immutable '+h.package.version+' sources archives installed pair and entire hosts',async()=>{
  for(const[file,digest]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(sha256(await readFile(file)),digest,'Current package source: '+file);
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
 if(independentOnly){result.corpus=[];for(const app of corpusApps)await check(app.name+' retained corpus pinned source and installed locked versions',async()=>{result.corpus.push(await corpusUpstream(app));});}
 for(const kind of ['standalone','embedding']){
  if(independentOnly){for(const[appIndex,app]of corpusApps.entries())await corpusSequence(kind,app,result.corpus[appIndex]);continue;}
  const workspace=await copyWorkspace(kind),entry={kind,workspace,observations:[],sourceVersions:[]};result.cases.push(entry);
  const original=await readFile(workspace.dir+'/'+footer,'utf8');entry.sourceVersions.push({stage:'original',sha256:sha256(original)});
  if(pickerViewOnly){await pickerViewSequence(entry,kind,workspace);continue;}
  if(grammarOnly){await grammarSequence(entry,kind,workspace);continue;}
  if(instancesOnly){
   result.currentWorkspace=workspace.dir;
   await startServer(workspace.dir,false);await launch(kind,kind+'-instances-off');
   await addTodo('Equal Cedar');await addTodo('Equal Cedar');entry.off={initial:await appProbe()};await editTitle(1,'Equal Cedar');entry.off.same=await appProbe();await editTitle(1,'Changed Cedar');entry.off.changed=await appProbe();await closeBrowser();await stopServer();
   await startServer(workspace.dir,true);ide=await startOwnedIDE(workspace.dir);await launch(kind,kind+'-instances-on');await pair();
   await reloadApp();await addTodo('Equal Cedar');await addTodo('Equal Cedar');
   await check(kind+' equal-output native picks retain distinct DOM/instance/target/read identities',async()=>{
    const before=await appProbe();assert.deepEqual({...before,observer:false},entry.off.initial);const first=await inspectTitle(kind+'-equal-first',1,'Equal Cedar');first.ide=await openSource(first,workspace.dir);entry.first=first;entry.saved=await saveOriginal(kind+'-instances');
    const second=await inspectTitle(kind+'-equal-second',2,'Equal Cedar');entry.second=second;assert.notEqual(first.dom.backendNodeId,second.dom.backendNodeId);assert.notEqual(first.selection.instance,second.selection.instance);assert.notEqual(first.runtime.target.scope,second.runtime.target.scope);assert.notEqual(first.runtime.target.id,second.runtime.target.id);assert.equal(first.source.sourceDigest,second.source.sourceDigest);assert.equal(first.selection.page,second.selection.page);assert(first.reads.every(n=>!second.reads.some(m=>m.id===n.id)));
   });
   await check(kind+' actual same-value first-row edit preserves per-instance source reads without a value join',async()=>{
    await editTitle(1,'Equal Cedar');assert.deepEqual({...await appProbe(),observer:false},entry.off.same);const first=await inspectTitle(kind+'-same-first',1,'Equal Cedar'),second=await inspectTitle(kind+'-same-second',2,'Equal Cedar');entry.same={first,second,secondEventChanged:second.runtime.target.id!==entry.second.runtime.target.id};assert.notEqual(first.runtime.target.id,entry.first.runtime.target.id);assert.notEqual(first.selection.instance,second.selection.instance);assert(first.reads.every(n=>!second.reads.some(m=>m.id===n.id)));entry.beforeDifferent=await inspectTitle(kind+'-before-different',1,'Equal Cedar');
   });
   await check(kind+' changed first title stays separate from the old second value and old inspector/save',async()=>{
    await editTitle(1,'Changed Cedar');assert.deepEqual({...await appProbe(),observer:false},entry.off.changed);
    const previous=await rpc(panel,{op:'state',tabId}),freshness=await panel.evaluate(()=>document.querySelector('[data-atom-id="freshness"]').textContent);entry.oldSnapshot={selection:previous.selection,stale:previous.stale,freshness};
    if(previous.selection){assert.equal(previous.selection.value,'Equal Cedar');assert.equal(previous.selection.observedAt,entry.beforeDifferent.selection.observedAt);assert(freshness.includes('Not live'));}else{assert.equal(previous.stale?.target?.value,'Equal Cedar');assert(freshness.startsWith('Stale'));}
    const first=await inspectTitle(kind+'-changed-first',1,'Changed Cedar');first.ide=await openSource(first,workspace.dir);const second=await inspectTitle(kind+'-unchanged-second',2,'Equal Cedar');entry.changed={first,second};assert.notEqual(first.runtime.target.scope,second.runtime.target.scope);assert(first.reads.every(n=>!second.reads.some(m=>m.id===n.id)));
    const saved=await rpc(panel,{op:'open-handoff',id:entry.saved.id});assert.equal(saved.raw,entry.saved.raw);assert.equal(sha256(await readFile(entry.saved.file)),entry.saved.sha256);
   });
   await check(kind+' reinspection without app changes retains actual read IDs/time rather than inventing an execution',async()=>{
    const again=await inspectTitle(kind+'-second-reinspect',2,'Equal Cedar');entry.secondReinspect=again;const prior=entry.changed.second;assert.equal(again.runtime.target.id,prior.runtime.target.id);assert.equal(again.runtime.target.at,prior.runtime.target.at);assert.deepEqual(again.reads.map(n=>[n.id,n.at]),prior.reads.map(n=>[n.id,n.at]));assert(again.selection.observedAt>prior.selection.observedAt);assert.equal(again.dom.backendNodeId,prior.dom.backendNodeId);assert.equal((await rpc(panel,{op:'open-handoff',id:entry.saved.id})).raw,entry.saved.raw);
   });
   entry.finalManifest=await fileDigests(workspace.dir,['src','public','package.json','package-lock.json','license.md']);assert.deepEqual(entry.finalManifest,workspace.initialManifest);await panel.screenshot({path:out+'/'+kind+'-equal-instances-candidate.png'});delete entry.saved.raw;await closeBrowser();await stopServer();await ide.close(true);ide=null;assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);continue;
  }
  await startServer(workspace.dir,false);await launch(kind,kind+'-off');
  await addTodo('Alpha ordinary');await addTodo('Beta ordinary');await appClick('.todo-list .toggle');await waitFor(async()=>(await appProbe()).count==='1 item left!');
  entry.baseline=await appProbe();assert.equal(entry.baseline.observer,false);await closeBrowser();await stopServer();
  await startServer(workspace.dir,true);ide=await startOwnedIDE(workspace.dir);await launch(kind,kind+'-on');await pair();await observeServed();
  await reloadApp();
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
 result.status=explanationsOnly?'PASS_SCOPED_L01_INSTALLED_EXPLANATIONS_NOT_REAL_MODEL':independentOnly?'PASS_RETAINED_THREE_CORPUS_QUESTIONS_BOTH_HOSTS':pickerViewOnly?'PASS_ORDINARY_PICKER_DISPLAY_CANCEL_ONLY':grammarOnly?'PASS_SYNTHETIC_ORDINARY_REACT_GRAMMAR_ONLY':instancesOnly?'PASS_ORDINARY_REACT_EQUAL_INSTANCES_ONLY':'PASS_ORDINARY_REACT_SOURCE_EDIT_ONLY';
}catch(e){result.status='FAIL';result.error=String(e.stack||e);process.exitCode=1;console.error(e);await panel?.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}
finally{
 await closeBrowser().catch(e=>result.errors.push({cleanup:'browser',message:e.message}));await stopServer().catch(e=>result.errors.push({cleanup:'server',message:e.message}));
 if(ide)await ide.close(false).catch(e=>result.errors.push({cleanup:'IDE',message:e.message}));
 result.upstreamAfter=await fileDigests(sourceBase,entries);result.inputsAfter=await inputs();
 if(independentOnly&&result.corpus)for(const[appIndex,app]of corpusApps.entries()){const current=await corpusUpstream(app);if(JSON.stringify(current)!==JSON.stringify(result.corpus[appIndex])){result.status='FAIL';process.exitCode=1;result.errors.push({app:app.name,message:'Original retained corpus changed'});}}
 if(result.upstream&&JSON.stringify(result.upstream.sourceFiles)!==JSON.stringify(result.upstreamAfter)||JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)||result.errors.length){result.status='FAIL';process.exitCode=1;}
 result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);
}
