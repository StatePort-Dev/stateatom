// SPDX-License-Identifier: (MIT AND Apache-2.0)
// Native UI helpers adapted from actions-native.mjs, same notices and ownership.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,open,rename,cp} from 'node:fs/promises';
import {fork,execFileSync} from 'node:child_process';
import path from 'node:path';
import net from 'node:net';
import {vuePositiveProperties,vuePositiveActions} from '../helpers/vue-positive-cases.mjs';
import {root} from '../../scripts/vite-config.mjs';
import {startNativeBrowser,nativeApproveDevelopment} from '../../scripts/native-browser.mjs';
import {startIDE,startBrowser,rpc,waitFor} from '../../scripts/harness.mjs';
import {fileDigests} from '../../scripts/short-loop-inputs.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';

const hf=process.argv.find(s=>s.endsWith('atom-handoff.json'))||'.artifacts/atom/atom-handoff.json',h=JSON.parse(await readFile(hf));
const out='.artifacts/a04/vue-native/'+new Date().toISOString().replace(/[:.]/g,'-');
await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const workspaces=new Map();
const inputEntries=['core','src/engine','ide-extension','dist/ide','scripts/harness.mjs','scripts/native-browser.mjs','tests/ide-host.cjs','tests/integration/vue-positive-native.mjs','tests/helpers/vue-positive-server.mjs','tests/helpers/vue-positive-cases.mjs','tests/fixtures/inspection/vue-positive','.runtime/todomvc/examples/vue/package.json','.runtime/todomvc/examples/vue/package-lock.json','.runtime/todomvc/examples/vue/node_modules/vue-router/package.json','.runtime/todomvc/examples/vue/node_modules/vue-router/LICENSE','.runtime/todomvc/examples/vue/node_modules/vue-router/dist','.runtime/todomvc/examples/vue/node_modules/@vue/devtools-api/lib','node_modules/vue/package.json','node_modules/vue/dist/vue.runtime.esm-bundler.js','node_modules/@vue/compiler-sfc/package.json','node_modules/@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js'];
const inputs=async()=>({...await fileDigests(root,inputEntries),...Object.fromEntries(await Promise.all(Object.keys({...h.sourceManifest,...h.buildSources.manifest}).map(async f=>[f,sha256(await readFile(f))])))});
const result={schema:'stateatom.vue-positive-native/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:true,handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},configuration:{originalCommand:'npm run verify:actions',operator:'agent',browserPlugin:'Unavailable; exact immutable native MV3 pair and existing Atom debugger required',appTargetSession:false,transport:'Explicit inspector/app native Input, chrome.scripting metadata and existing Atom debugger; no app-page facade or parallel app CDP',reactHostProps:false,sourceConsumption:true,reactCommit:false,firstReadContracts:false,model:false,IDE:'Actual current VS Code host and exact source-open audit',scope:'Synthetic Vue3.5.44 plus real locked independent-app vue-router4.6.4, exact current SFC/compiler/IDE, two native hosts. Positive selected source/read/action declarations; no runtime callback identity/invocation or complete library/state/HTTP ancestry.'},checks:[],errors:[],cases:[],inputsBefore:await inputs()};
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
async function key(key,code=key,n){const p=await protocol();for(const type of ['keyDown','keyUp'])await p.send('Input.dispatchKeyEvent',{type,key,code,...(n?{windowsVirtualKeyCode:n}:{}),...(type==='keyDown'&&key==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});}
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
async function appClick(selector){
 const point=await waitFor(async()=>{
  const attempt=await panel.evaluate(async({id,selector})=>{await chrome.tabs.update(id,{active:true});return(await chrome.scripting.executeScript({target:{tabId:id},world:'ISOLATED',func:async selector=>{
   const e=document.querySelector(selector);if(!e)return{point:null,reason:'Missing element',selector};e.scrollIntoView({block:'center',behavior:'instant'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);const r=e.getBoundingClientRect(),hits=[];
   for(const x of [r.x+Math.min(8,r.width/2),r.x+r.width/2,r.right-Math.min(8,r.width/2)]){const y=r.y+r.height/2,hit=document.elementFromPoint(x,y);hits.push(hit?.tagName||null);if(r.width&&r.height&&(hit===e||e.contains(hit)))return{point:{x,y},selector,hits,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};}return{point:null,selector,hits,rect:{x:r.x,y:r.y,width:r.width,height:r.height}};
  },args:[selector]}))[0].result;},{id:tabId,selector});result.lastAppGeometry=attempt;return attempt?.point;
 });
 (result.nativeAppPoints??=[]).push({selector,point});await panel.evaluate(async({id,point})=>{for(const type of ['mouseMoved','mousePressed','mouseReleased'])await chrome.debugger.sendCommand({tabId:id},'Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});},{id:tabId,point});
}
async function startServer(kind,{mode='B'}={}){
 if(!workspaces.has(kind)){const workspace=path.resolve(out+'/'+kind+'-workspace');await cp('tests/fixtures/inspection/vue-positive',workspace,{recursive:true});workspaces.set(kind,workspace);}
 const workspace=workspaces.get(kind);
 const log=await open(out+'/server-'+kind+'-'+mode+'.log','wx'),child=fork(path.resolve('tests/helpers/vue-positive-server.mjs'),[workspace,mode,path.resolve(out)+'/vite-'+kind+'-'+mode],{cwd:root,stdio:['ignore',log.fd,log.fd,'ipc']});server={child,log};let ready,error;child.on('message',m=>{if(m.type==='ready')ready=m;else error=m.message;});const receipt=await waitFor(()=>{if(error)throw Error(error);if(child.exitCode!==null)throw Error('Own server exited');return ready;},45000);origin=receipt.origin;(result.servers??=[]).push(receipt);
}
async function stopServer(){if(!server)return;const owned=server;server=null;if(owned.child.exitCode===null){owned.child.send({op:'stop'});try{await waitFor(()=>owned.child.exitCode!==null,15000);}catch{owned.child.kill('SIGTERM');await waitFor(()=>owned.child.exitCode!==null,5000);}}await owned.log.close();assert.equal(owned.child.exitCode,0);}
async function closeBrowser(){await panelCDP?.detach().catch(()=>{});panelCDP=null;await browser?.context.close();browser=null;panel=null;tabId=null;}
async function startOwnedIDE(kind){
 const busy=await new Promise(resolve=>{const s=net.createConnection({host:'127.0.0.1',port:49331});s.setTimeout(1000);s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(true);});});assert.equal(busy,false,'Own IDE port occupied; no foreign process changed');
 const runtime=out+'/profiles/ide-'+kind;const instance=await startIDE(runtime,{logDir:out+'/ide-'+kind,projectRoot:root});instance.runtime=runtime;return instance;
}
async function appProbe(){return panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>({title:document.title,ready:!!document.getElementById('library'),observer:typeof window.__STATEATOM__?.snapshot==='function',invocations:window.vueInvocations,alternative:window.vueAlternativeInvocations,getterReads:window.vueGetterReads,schedule:window.vueSchedule,semantic:document.getElementById('semantics')?.textContent,direct:document.getElementById('direct')?.textContent,computed:document.getElementById('computed')?.textContent,condition:document.getElementById('condition')?.disabled,library:document.getElementById('library')?.disabled,first:document.getElementById('row-value-first')?.textContent,second:document.getElementById('row-value-second')?.textContent,hash:location.hash,overlay:!!document.querySelector('vite-error-overlay')})}))[0].result,tabId);}
async function ui(){return panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return{operands:get('operands').textContent,expressions:get('expressions').textContent,sources:get('sources').textContent,mode:get('mode').textContent,status:get('status').textContent,summary:get('action-summary').textContent,handlers:get('action-handlers').textContent,more:get('action-more').textContent,explanation:get('action-explanation').textContent,explainDisabled:get('action-explain').disabled,cancelHidden:get('action-cancel').hidden};});}
async function reloadApp(){
 const before=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree')).frameTree.frame.loaderId,tabId);
 await panel.evaluate(id=>chrome.debugger.sendCommand({tabId:id},'Page.reload',{ignoreCache:true}),tabId);
 await waitFor(async()=>{const f=await panel.evaluate(async id=>(await chrome.debugger.sendCommand({tabId:id},'Page.getFrameTree')).frameTree.frame,tabId);return f.loaderId!==before&&(await appProbe()).ready;});
}
async function launch(kind,name,{source=true}={}){
 browser=await startNativeBrowser(out+'/profiles',name,true,false,[],{extensionPath:h.hosts[kind]});panel=await browser.context.newPage();panel.on('pageerror',e=>result.errors.push({surface:'inspector',message:e.message}));await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));await(await protocol()).send('Emulation.setDeviceMetricsOverride',{width:1100,height:1000,deviceScaleFactor:1,mobile:false});
 tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,origin+'/');await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));await nativeApproveDevelopment(panel,tabId);await action('refresh-tabs');await choose('tabs',String(tabId));await waitFor(()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return get('status').textContent==='OK'&&get('site-mode').value==='development'&&get('connection-label').textContent==='Not attached';}));await action('attach');
 await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).attached);await waitFor(()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return get('status').textContent==='OK'&&get('connection-label').textContent.startsWith('Attached')&&!get('browser-connection').open&&!get('source-connection').open;}));
 if(source){for(const[id,value]of [['bridge',ide.conn.url],['origin',origin],['source-root',path.relative(root,workspaces.get(kind))],['token',ide.conn.token]])await fill(id,value);await action('pair');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).connection.source?.url===ide.conn.url);await fill('token','');}
 await reloadApp();return waitFor(async()=>{const p=await appProbe();return p.ready&&p.invocations===0?p:null;});
}
async function inspect(selector,property='text'){
 const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt;await choose('property',property);await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId}),v=await ui();result.lastInspectionPreparation={property:s.property??null,effectiveProperty:s.property||'text',status:v.status,attached:s.attached,picker:s.picker?.status??null};return(s.property||'text')===property&&v.status==='OK';});
 await action('pick');await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).picker?.status==='picking');await appClick(selector);
 const state=await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.selection?.selector===selector&&s.selection.observedAt!==before&&s.analysis?s:null;});
 await waitFor(async()=>(await ui()).status==='OK');await action('actions-nav');const view=await waitFor(async()=>{const v=await ui();return /Declared|Unknown/.test(v.summary)?v:null;});
 assert((await appProbe()).ready);assert((state.analysis.actionBindings||[]).every(b=>b.execution.status==='not-observed'));
 const file=out+'/'+(result.currentHost||'host')+'-'+selector.slice(1)+'-'+state.selection.observedAt+'-state.json';await writeFile(file,JSON.stringify(state,null,2));return{state,ui:view,file,sha256:sha256(await readFile(file))};
}
async function openHandler(observation){
 const binding=observation.state.analysis.actionBindings.find(b=>b.mechanism==='vue-template'),source=binding.entry.source||binding.binding.source;
 const reset=crypto.randomUUID();await writeFile(ide.runtime+'/editor-reset.tmp',JSON.stringify({id:reset}));await rename(ide.runtime+'/editor-reset.tmp',ide.runtime+'/editor-reset.json');await waitFor(async()=>JSON.parse(await readFile(ide.runtime+'/editor-reset-done.json')).id===reset);
 let prior='';try{prior=String(await readFile(ide.runtime+'/ide-audit.jsonl'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const actual=String(await readFile(path.join(root,source.file)));assert.equal(source.sourceDigest,sha256(actual));await click(q('action-handlers')+' button');
 const audit=await waitFor(async()=>String(await readFile(ide.runtime+'/ide-audit.jsonl')).slice(prior.length).split('\n').filter(Boolean).map(JSON.parse).find(a=>a.file===path.join(root,source.file)&&['line','column','endLine','endColumn'].every(k=>a[k]===source[k])));
 const lines=actual.split('\n'),fragment=source.line===source.endLine?lines[source.line-1].slice(source.column-1,source.endColumn-1):lines.slice(source.line-1,source.endLine).map((l,i,a)=>i===0?l.slice(source.column-1):i===a.length-1?l.slice(0,source.endColumn-1):l).join('\n');assert.equal(audit.selectedText,fragment.slice(0,300));return audit;
}
async function exported(name){
 await action('diagnostic-toggle');await fill('diagnostic-notes','Which source declaration supplies this selected callback? Execution not observed.');
 if(await panel.evaluate(()=>document.querySelector('[data-atom-id="diagnostic-content"]').checked))await action('diagnostic-content');
 const previous=new Set((await rpc(panel,{op:'list-handoffs'})).entries.map(e=>e.id));await action('save-report');
 const saved=await waitFor(async()=>{const id=await panel.evaluate(()=>document.querySelector('[data-atom-id="report-select"]').value);return id&&!previous.has(id)?rpc(panel,{op:'open-handoff',id}):null;});assert.equal(saved.version,1);await action('export-report');
 const preview=await waitFor(()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return get('export-review').open&&get('export-json').value?get('export-json').value:null;}));assert.equal(preview,saved.raw);const report=JSON.parse(preview);assert(report.runtime.actionBindings.some(b=>b.mechanism==='vue-template'&&b.entry.status==='Code-linked'));assert(report.runtime.actionBindings.every(b=>!b.binding?.expression&&b.execution.status==='not-observed'));
 const file=out+'/'+name+'-actions-original.v1.json';await writeFile(file,preview);await action('export-cancel');await action('diagnostic-toggle');return{file,sha256:sha256(preview),reportId:report.id,scope:'Actual native Save and export review of exact stored v1 bytes; download not claimed by this control'};
}
async function captureWidths(entry){
 entry.widths=[];for(const width of [390,1100]){await(await protocol()).send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});const v=await panel.evaluate(async()=>{await document.fonts.ready;const root=document.querySelector('[data-atom-root]');return{width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,fontSize:getComputedStyle(root).fontSize,fontFamily:getComputedStyle(root).fontFamily};});assert.equal(v.width,width);assert.equal(v.overflow,false);assert.equal(v.fontSize,'13px');entry.widths.push(v);await panel.screenshot({path:out+'/'+entry.kind+'-actions-'+width+'-candidate.png'});}
}
async function openProperty(observation,source){
 const reset=crypto.randomUUID();await writeFile(ide.runtime+'/editor-reset.tmp',JSON.stringify({id:reset}));await rename(ide.runtime+'/editor-reset.tmp',ide.runtime+'/editor-reset.json');await waitFor(async()=>JSON.parse(await readFile(ide.runtime+'/editor-reset-done.json')).id===reset);
 let prior='';try{prior=String(await readFile(ide.runtime+'/ide-audit.jsonl'));}catch(e){if(e.code!=='ENOENT')throw e;}
 await action('source-nav');await click(q('sources')+' button',observation.state.analysis.sources.indexOf(source));
 const audit=await waitFor(async()=>String(await readFile(ide.runtime+'/ide-audit.jsonl')).slice(prior.length).split('\n').filter(Boolean).map(JSON.parse).find(a=>a.file===path.join(root,source.file)&&['line','column','endLine','endColumn'].every(k=>a[k]===source[k])));
 const actual=String(await readFile(source.file)),lines=actual.split('\n'),fragment=source.line===source.endLine?lines[source.line-1].slice(source.column-1,source.endColumn-1):lines.slice(source.line-1,source.endLine).map((l,i,a)=>i===0?l.slice(source.column-1):i===a.length-1?l.slice(0,source.endColumn-1):l).join('\n');assert.equal(audit.selectedText,fragment.slice(0,300));return audit;
}
async function propertyCase(c,entry){
 const item={expected:c,observation:await inspect('#'+c.id,c.property)},a=item.observation.state.analysis;
 assert.equal(item.observation.state.selection.value,c.value);assert.equal(item.observation.state.selection.markerOnSelected,true);assert.match(item.observation.state.selection.marker,/:\d+:[a-f0-9]{12}:\d+$/);
 const sources=a.sources.filter(s=>s.expressions.includes(c.expression));assert.equal(sources.length,1,'Exact selected expression '+c.id);assert.equal(sources[0].sourceDigest,sha256(await readFile(sources[0].file)));
 assert.equal(a.stateatom?.runtime?.status,'Observed','Selected observed runtime '+c.id);const reads=a.stateatom.runtime.nodes.filter(n=>n.status==='Observed'&&n.kind!=='target'&&n.expression===c.read&&['string','number','boolean'].includes(typeof n.value));assert(reads.length,'Original selected scalar read '+c.id);
 await action('inputs-nav');const visible=await panel.evaluate(s=>[...document.querySelectorAll(s+' li')].map(e=>({text:e.textContent,visible:e.getClientRects().length>0})),q('operands'));assert(visible.some(v=>v.visible&&v.text.includes(c.read+' =')&&reads.some(r=>v.text.includes(JSON.stringify(r.value)))),'Main rendered selected operand '+c.id);
 if(c.id==='library'&&c.value===true)assert(a.stateatom.runtime.nodes.some(n=>n.kind==='member'&&n.status==='Observed'&&n.expression==='route.name'&&n.value==='all'),'Real library input belongs to selected initial closure');
 item.reads=reads;item.ui=await ui();item.editor=await openProperty(item.observation,sources[0]);entry.properties.push(item);return item;
}
const semantic=p=>{const {observer,...rest}=p;return rest;};
async function normalSequence(){
 const rows=[];await appClick('#method');rows.push(await waitFor(async()=>{const p=await appProbe();return p.direct==='8'&&p.schedule.at(-1)==='after-handler'?p:null;}));
 await appClick('#method');rows.push(await waitFor(async()=>{const p=await appProbe();return p.direct==='9'&&p.schedule.at(-1)==='after-handler'?p:null;}));
 await appClick('#composable');rows.push(await waitFor(async()=>{const p=await appProbe();return p.direct==='11'?p:null;}));
 await appClick('#route-active');rows.push(await waitFor(async()=>{const p=await appProbe();return p.library===false?p:null;}));
 await appClick('#row-second');rows.push(await waitFor(async()=>{const p=await appProbe();return p.second==='14'?p:null;}));
 await appClick('#replace-handler');await appClick('#replaced');rows.push(await waitFor(async()=>{const p=await appProbe();return p.alternative===1?p:null;}));return rows;
}
async function reader(entry){
 browser=await startBrowser(out+'/profiles',entry.kind+'-reader',false);panel=await browser.context.newPage();const requests=[];panel.on('request',r=>requests.push(r.url()));panel.on('pageerror',e=>result.errors.push({surface:'reader',message:e.message}));await panel.goto('file://'+path.resolve(h.hosts[entry.kind]+'/reader.html'));
 const bytes=await readFile(entry.export.file),expected=JSON.parse(bytes);await panel.locator('#diagnostic-file').setInputFiles(path.resolve(entry.export.file));await waitFor(async()=>{const raw=await panel.locator('#reader-payload').textContent();return raw&&JSON.parse(raw).id===expected.id;});const payload=JSON.parse(await panel.locator('#reader-payload').textContent()),summary=await panel.locator('#reader-summary').textContent();assert.deepEqual(payload,expected);assert(summary.includes('vue-template')&&summary.includes('runtime function identity')&&summary.includes('execution not observed'));assert(requests.every(u=>u.startsWith('file:')));assert.equal(sha256(await readFile(entry.export.file)),entry.export.sha256);entry.reader={originalAppClosed:server===null,IDEClosed:ide===null,freshProfile:true,noExtension:true,summary,observedPageRequests:requests,payloadSha256:sha256(JSON.stringify(payload))};await panel.screenshot({path:out+'/'+entry.kind+'-vue-reader-candidate.png'});await closeBrowser();
}
async function run(kind){
 result.currentHost=kind;const entry={kind,properties:[],actions:[]};result.cases.push(entry);
 await startServer(kind,{mode:'A'});entry.workspace=path.relative(root,workspaces.get(kind));entry.originalSourceManifest=await fileManifest(workspaces.get(kind));entry.off={initial:await launch(kind,kind+'-off',{source:false})};assert.equal(entry.off.initial.observer,false);entry.off.sequence=await normalSequence();await closeBrowser();await stopServer();
 await startServer(kind);ide=await startOwnedIDE(kind);entry.initial=await launch(kind,kind+'-on');entry.browser=browser.context.browser().version();
 await check(kind+' actual Vue app uses real router source and same observer-off initial semantics',async()=>{assert.equal(entry.initial.title,'Vue source and library controls');assert(entry.initial.observer);assert(!entry.initial.overlay);assert.deepEqual(semantic(entry.initial),semantic(entry.off.initial));await panel.screenshot({path:out+'/'+kind+'-first-viewport-candidate.png'});});
 for(const c of vuePositiveProperties)await check(kind+' '+c.id+' actual picker T/E/V/I property/selected-read/exact IDE',()=>propertyCase(c,entry));
 await check(kind+' same source rows retain different actual native and instrumentation instances',async()=>{const [one,two]=entry.properties.filter(p=>p.expected.id.startsWith('row-value'));assert.notEqual(one.observation.state.analysis.actionContext.instance,two.observation.state.analysis.actionContext.instance);assert.notEqual(one.observation.state.selection.instance,two.observation.state.selection.instance);assert.equal(one.observation.state.analysis.sources[0].sourceDigest,two.observation.state.analysis.sources[0].sourceDigest);});
 for(const c of vuePositiveActions)await check(kind+' '+c.id+' source action/positive composable or explicit indirect boundary',async()=>{
  const observation=await inspect('#'+c.id,'disabled'),b=observation.state.analysis.actionBindings.find(b=>b.mechanism==='vue-template');assert(b);assert.equal(b.entry.status,c.status);assert.equal(b.execution.status,'not-observed');if(c.symbol){assert.equal(b.entry.symbol,c.symbol);assert.match(b.entry.reason,/runtime function identity.*not observed/);}if(c.relation)assert(b.hookRelations.some(h=>h.relation===c.relation));const item={expected:c,observation,binding:b};if(c.symbol)item.editor=await openHandler(observation);entry.actions.push(item);
 });
 await check(kind+' disabled and ordinary selection cause no application callback/getter or Promise-order change',async()=>{assert.deepEqual(semantic(await appProbe()),semantic(entry.initial));});
 await check(kind+' actual inert Vue v1 save/export retains source kind and missing runtime identity',async()=>{await inspect('#row-second','disabled');entry.export=await exported(kind);});
 await check(kind+' original typography/narrow layout and keyboard template remain usable',async()=>{await action('action-explain');assert((await ui()).explanation.includes('execution was not observed'));await captureWidths(entry);});
 entry.onSequence=await normalSequence();await check(kind+' normal method/composable/router/row/replaced-handler semantics agree with observer off',async()=>{assert.deepEqual(entry.onSequence.map(semantic),entry.off.sequence.map(semantic));assert.equal(entry.onSequence.at(-1).invocations,4);assert.equal(entry.onSequence.at(-1).first,'4');assert.equal(entry.onSequence.at(-1).second,'14');assert.equal(entry.onSequence.at(-1).semantic,'{"value":2,"same":true,"skipped":0}');});
 entry.updated={};await check(kind+' actual library and computed state updates reinspection shows new source/read snapshots',async()=>{
  entry.updated.library=await propertyCase({...vuePositiveProperties.find(c=>c.id==='library'),value:false}, {properties:[]});entry.updated.computed=await propertyCase({...vuePositiveProperties.find(c=>c.id==='computed'),value:'33'}, {properties:[]});entry.updated.row=await propertyCase({...vuePositiveProperties.find(c=>c.id==='row-value-second'),value:'14'}, {properties:[]});const a=entry.updated.library.observation.state.analysis;assert.notEqual(a.stateatom.runtime.fullPath,true);const routeReads=a.stateatom.runtime.nodes.filter(n=>n.status==='Observed'&&n.expression==='route.name');assert(routeReads.every(n=>n.value==='active'),'A prior route read must not be borrowed after navigation');entry.updated.libraryInnerRead={status:routeReads.length?'Observed':'Unknown/Unsupported',reason:routeReads.length?'Actual selected recomputation read retained':'Fresh computed result read retained; inner recomputed route read not in selected closure, not inferred from URL or old read'};assert.equal(sha256(await readFile(entry.export.file)),entry.export.sha256);
 });
 await check(kind+' replaced computed callback stays unknown after actual replacement and reinspection',async()=>{entry.replaced=await inspect('#replaced','disabled');const b=entry.replaced.state.analysis.actionBindings.find(b=>b.mechanism==='vue-template');assert.equal(b.entry.status,'Unknown/Unsupported');assert.equal(b.execution.status,'not-observed');});
 await check(kind+' actual isolated source edit/HMR expires old action and reinspection opens current declaration',async()=>{
  entry.beforeSourceEdit=await inspect('#method','disabled');const file=path.join(workspaces.get(kind),'App.vue'),before=await readFile(file,'utf8'),after=before.replace(/\bordinary\b/g,'saveCurrent');assert.notEqual(before,after);await writeFile(out+'/'+kind+'-source-before.vue',before);await writeFile(file,after);await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.stale?s:null;},30000);await waitFor(async()=>(await appProbe()).ready);await action('refresh-tabs');assert((await ui()).summary.startsWith('Stale'));entry.sourceEdit={file:path.relative(root,file),beforeSha256:sha256(before),afterSha256:sha256(after),retainedBefore:out+'/'+kind+'-source-before.vue'};entry.afterSourceEdit=await inspect('#method','disabled');const b=entry.afterSourceEdit.state.analysis.actionBindings.find(b=>b.mechanism==='vue-template');assert.equal(b.entry.symbol,'saveCurrent');assert.equal(b.entry.source.sourceDigest,sha256(after));entry.sourceEdit.editor=await openHandler(entry.afterSourceEdit);assert.equal(sha256(await readFile(entry.export.file)),entry.export.sha256);
 });
 await check(kind+' unpaired Basic keeps DOM/native observations without invented Vue source/read support',async()=>{const current=await appProbe();await rpc(panel,{op:'unpair'});entry.basic=await inspect('#library','disabled');assert.equal(entry.basic.state.analysis.capabilities.sourceResolver,'unavailable');assert.equal(entry.basic.state.analysis.sources.length,0);assert(!entry.basic.state.analysis.actionBindings.some(b=>b.mechanism==='vue-template'));assert.equal(entry.basic.state.selection.value,current.library);entry.basic.expectedDOMValue=current.library;entry.basic.routeHash=current.hash;});
 entry.finalSourceManifest=await fileManifest(workspaces.get(kind));await closeBrowser();await stopServer();await ide.close(true);ide=null;await check(kind+' fresh passive Vue report reader after app and IDE close',()=>reader(entry));assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);
}
try{
 await check('exact immutable archives installed pair and both hosts match current build inputs',async()=>{await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);for(const[f,d]of Object.entries({...h.sourceManifest,...h.buildSources.manifest}))assert.equal(sha256(await readFile(f)),d,f);for(const kind of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[kind]),h.consumerReceipt.hostFiles[kind]);});
 for(const kind of ['standalone','embedding'])await run(kind);result.status='PASS_SCOPED_VUE_PROPERTY_SOURCE_ACTION_AND_REAL_ROUTER';
}catch(e){result.status='FAIL';result.error=String(e.stack||e);process.exitCode=1;console.error(e);await panel?.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}
finally{await closeBrowser().catch(e=>result.errors.push({cleanup:'browser',message:e.message}));await stopServer().catch(e=>result.errors.push({cleanup:'server',message:e.message}));if(ide)await ide.close(false).catch(e=>result.errors.push({cleanup:'IDE',message:e.message}));result.inputsAfter=await inputs();if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)||result.errors.length){result.status='FAIL';process.exitCode=1;}delete result.currentHost;result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);}
