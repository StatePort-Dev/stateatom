import {fork} from 'node:child_process';
import {startListFieldChannel} from '../../core/list-field-channel.mjs';
// SPDX-License-Identifier: Apache-2.0
// Frozen301 conjunction diagnostic: real extension/helper; not installed IDE/UI
// presentation/export/official-host acceptance and not the full282 matrix.
import {parseDiagnostic} from '../../core/diagnostic.mjs';
import assert from 'node:assert/strict';import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';import {createHash,randomBytes} from 'node:crypto';
import {buildListFieldCompilation} from '../../src/engine/list-field-compilation.mjs';
import {startListFieldServer} from '../../src/engine/list-field-server.mjs';
import {createListFieldCodeContext,listFieldCodeContextView} from '../../src/engine/list-field-code.mjs';
import {launchControlledFirstReadBrowser} from '../../src/first-read/controlled-session.mjs';
import {startBridge} from '../../core/bridge.mjs';
import {rpc,waitFor,startIDE} from '../../scripts/harness.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {nativeApproveDevelopment,nativeChooseTab} from '../../scripts/native-browser.mjs';
const installedPluginWorkspace=process.argv.find(a=>a.startsWith('--installed-plugin-workspace='))?.slice('--installed-plugin-workspace='.length);
const installedVsix=process.argv.find(a=>a.startsWith('--installed-vsix='))?.slice('--installed-vsix='.length);
const lifecycle=process.argv.find(a=>a.startsWith('--lifecycle='))?.slice('--lifecycle='.length);
if(lifecycle&&!['source','reload'].includes(lifecycle))throw Error('Unknown lifecycle case');
const heldOutCorrected=process.argv.includes('--held-out-picker-settled');
const heldOut=heldOutCorrected||process.argv.includes('--held-out');
const presentation=process.argv.includes('--presentation'),domControls=process.argv.includes('--dom-controls'),privateChannel=!!installedVsix||process.argv.includes('--private-channel');
const root=process.cwd(),out=root+'/.artifacts/a02/selected-list-route/'+new Date().toISOString().replace(/[:.]/g,'-'),sha=s=>createHash('sha256').update(s).digest('hex');await mkdir(out,{recursive:true});
const workspace=installedPluginWorkspace||root,sourceRoot=installedPluginWorkspace?'app':'.runtime/todomvc/examples/react',options={projectRoot:root,appRoot:sourceRoot,entry:'src/index.js',root:{file:'src/todo/app.jsx',export:'App'},field:'title',sources:['src/todo/app.jsx','src/todo/reducer.js','src/todo/components/main.jsx','src/todo/components/item.jsx','src/todo/components/footer.jsx']};
const result={schema:'stateatom.selected-list-route-diagnostic/1',case:lifecycle?'docs/completion/321-a02-installed-lifecycle-case.md':heldOutCorrected?'docs/completion/314-a02-held-out-picker-barrier.md':heldOut?'docs/completion/313-a02-held-out-case.md':installedPluginWorkspace?'docs/completion/311-a02-installed-plugin-case.md':installedVsix?'docs/completion/309-a02-installed-helper-case.md':privateChannel?'docs/completion/307-a02-private-helper-channel-case.md':domControls?'docs/completion/305-a02-native-dom-interval-case.md':presentation?'docs/completion/303-a02-selected-list-presentation-case.md':'docs/completion/301-a02-list-helper-native-case.md',out,startedAt:new Date().toISOString(),checks:[],errors:[],fullA02:false,installedIDE:false,publicPresentation:false,officialHost:false};let source,bridge,session,appSession,channel,installedSession,sourceRestore,ideVerified=false;
async function check(name,fn){await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);}
try{
 let compilation;
 if(installedPluginWorkspace){
  const {pathToFileURL}=await import('node:url');const {createServer}=await import(pathToFileURL(workspace+'/node_modules/vite/dist/node/index.js'));
  const browserExecutable=(await import('playwright')).chromium.executablePath();
  const installedSource=heldOut?(await import('../helpers/selected-list-held-out.mjs')).heldOutSource:{appRoot:'app',entry:options.entry,root:options.root,field:options.field,sources:options.sources};
  const config=`import {stateatomSelectedList} from '@stateport/vite-plugin/selected-list';export default {plugins:[stateatomSelectedList(${JSON.stringify({enabled:true,browserExecutable,source:installedSource})})],server:{host:'127.0.0.1',port:0}};`;
  await writeFile(workspace+'/vite.config.mjs',config);const vite=await createServer({root:workspace,configFile:workspace+'/vite.config.mjs'});source={close:()=>vite.close()};await vite.listen();
  installedSession=vite.config.plugins.find(p=>p.name==='stateatom-selected-list').selectedListSession;assert(installedSession);session=installedSession.browser;compilation=installedSession.compilation;
  result.installedPlugin=JSON.parse(await readFile(workspace+'/node_modules/@stateport/vite-plugin/package.json'));await writeFile(out+'/installed-vite-config.mjs',config);
 }else compilation=await buildListFieldCompilation(options);await writeFile(out+'/manifest.json',JSON.stringify(compilation.manifest,null,2));await writeFile(out+'/bundle.js',compilation.code);
 await writeFile(out+'/frozen-inputs.json',JSON.stringify({case:sha(await readFile(result.case)),script:sha(await readFile(new URL(import.meta.url))),manifest:compilation.manifest.digest,bundle:compilation.manifest.bundle.digest,extensionWorker:sha(await readFile('dist/browser/worker.js'))},null,2));
 if(!installedSession)source=await startListFieldServer({compilation});
 if(installedVsix){
  const {createServer}=await import('node:net'),reservation=createServer();await new Promise(r=>reservation.listen(0,'127.0.0.1',r));const port=reservation.address().port;await new Promise(r=>reservation.close(r));
  const runtime=root+'/.runtime/selected-list-ide/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(runtime,{recursive:true,mode:0o700});const ide=await startIDE(runtime,{logDir:out,installedVsix,projectRoot:workspace,ownedEndpoint:true,userSettings:{'stateatom.helperPort':port,'stateatom.appOrigin':'http://127.0.0.1:4173','stateatom.sourceFolder':sourceRoot}});
  bridge={cfg:{port:Number(new URL(ide.conn.url).port),token:ide.conn.token},helper:ide.conn.helper,workspace:ide.conn.workspace,runtime,ide,close:async()=>{await ide.close(ideVerified);for(const name of['installed-helper-host.json','host-complete.json','offline-host.json','ide-audit.jsonl'])try{await writeFile(out+'/'+name,await readFile(runtime+'/'+name));}catch(e){if(e.code!=='ENOENT')throw e;}}};result.installedVsixSha256=sha(await readFile(installedVsix));
 }else if(privateChannel){const child=fork(new URL('../helpers/list-channel-bridge.mjs',import.meta.url),[],{stdio:['ignore','ignore','inherit','ipc']});const ready=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{child.kill('SIGTERM');reject(Error('Separate helper startup timeout'));},10000);child.once('error',reject);child.once('message',m=>{clearTimeout(timer);m.error?reject(Error(m.error)):resolve(m)});child.send({root});});bridge={cfg:{port:ready.port,token:ready.token},helper:ready.helper,workspace:ready.workspace,close:async()=>{if(child.connected)child.send({close:true});try{await waitFor(()=>child.exitCode!==null,10000);}catch{child.kill('SIGTERM');throw Error('Separate helper cleanup timeout');}}};result.separateHelperPid=child.pid;}
 else{bridge=startBridge({root,port:0,token:randomBytes(32).toString('hex'),onOpen:async()=>({opened:false,reason:'Source-helper diagnostic, no installed IDE'}),onDefinitions:async()=>[],onReferences:async()=>[]});await bridge.ready;bridge.cfg.port=bridge.server.address().port;}
 if(!session)session=await launchControlledFirstReadBrowser({projectRoot:root,headed:true,appProfile:'selected-list'});const {panel}=session,ui=await nativeInspectorUI(panel,session.browser);
 await ui.click('source-nav');await ui.fill('connection-receipt',JSON.stringify({schemaVersion:1,helper:bridge.helper,workspace:bridge.workspace,url:'http://127.0.0.1:'+bridge.cfg.port,origin:'http://127.0.0.1:4173',token:bridge.cfg.token,sourceRoot}));await ui.click('connect-receipt');await ui.waitOK();
 const tabId=await nativeChooseTab(panel,session.setupURL);await nativeApproveDevelopment(panel,tabId);await rpc(panel,{op:'attach',tabId});
 if(installedSession)await waitFor(()=>installedSession.phase==='ready-to-open');
 const app=installedSession?await session.browser.native.session(session.targetId):await session.arm();appSession=app;app.on('Runtime.exceptionThrown',e=>result.errors.push(e.exceptionDetails.text));
 async function node(selector){const{root}=await app.send('DOM.getDocument');return(await app.send('DOM.querySelector',{nodeId:root.nodeId,selector})).nodeId;}
 async function nodes(selector){const{root}=await app.send('DOM.getDocument');return(await app.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector})).nodeIds;}
 async function key(key,code,n,modifiers=0){for(const type of['keyDown','keyUp'])await app.send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:n,modifiers,...(key==='Enter'&&type==='keyDown'?{text:'\r',unmodifiedText:'\r'}:{})});}
 async function fill(selector,value){await app.send('Page.bringToFront');await app.send('DOM.focus',{nodeId:await waitFor(()=>node(selector))});await key('a','KeyA',65,2);await app.send('Input.insertText',{text:value});}
 await app.send('Page.navigate',{url:'http://127.0.0.1:4173/list/'});await waitFor(()=>node('[aria-label="New Todo Input"]'));
 let context;
 if(installedSession){await installedSession.ready;result.installedLauncherReady=true;}
 else{context=await createListFieldCodeContext({compilation,effects:source.effects,witness:session.witness});result.context=listFieldCodeContextView(context);assert.equal(result.context.status,'Owned list code context',JSON.stringify(result.context));if(privateChannel)channel=await startListFieldChannel({root,context});else bridge.bindListFieldContext(context);}
 console.log('PASS owned launcher ready');
 if(privateChannel)await check('private verifier denies browser Origin, wrong bearer and wrong Host',async()=>{
  const dir=workspace+'/.runtime/selected-list-live',names=(await readdir(dir)).filter(n=>n.endsWith('.json'));assert.equal(names.length,1);const cap=JSON.parse(await readFile(dir+'/'+names[0]));
  for(const headers of[{origin:'http://127.0.0.1:4173',authorization:'Bearer '+cap.token},{authorization:'Bearer wrong'},{host:'localhost:'+cap.port,authorization:'Bearer '+cap.token}]){const r=await fetch('http://127.0.0.1:'+cap.port+cap.endpoint,{method:'POST',headers,body:'{}'});assert.equal(r.status,403);}
 });
 async function inspect(name,selector){
  await rpc(panel,{op:'property',tabId,property:'text'});
  const reply=await rpc(panel,{op:'inspect-selector',tabId,selector,...(presentation||installedVsix?{elementProperties:true}:{})});
  const state=await rpc(panel,{op:'state',tabId});await writeFile(out+'/'+name+'-state.json',JSON.stringify(state,null,2));
  await writeFile(out+'/'+name+'-analysis.json',JSON.stringify(reply,null,2));return state.analysis?.stateatom?.selectedListProfile;
 }
 const labels='[data-testid="todo-item-label"]';for(let i=0;i<2;i++){await fill('[aria-label="New Todo Input"]',heldOut?'separate caption':'same');await key('Enter','Enter',13);await waitFor(async()=>(await nodes(labels)).length===i+1);}
 const second='[data-testid="todo-item"]:nth-child(2) [data-testid="todo-item-label"]',first='[data-testid="todo-item"]:nth-child(1) [data-testid="todo-item-label"]';
 const created=await inspect('created',second);await check('real created row joins acquired source, native code and selected field',()=>{assert.equal(created?.status,'Supported finite trace',JSON.stringify(created));assert.equal(created.fullPath,true);assert(created.chain.every(step=>step.source?.file));});
 async function edit(value){const nodeId=await node(first);await app.send('DOM.scrollIntoViewIfNeeded',{nodeId});const{model}=await app.send('DOM.getBoxModel',{nodeId}),q=model.content,x=(q[0]+q[2])/2,y=(q[1]+q[5])/2;for(const count of[1,2])for(const type of['mousePressed','mouseReleased'])await app.send('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:count});await fill('[aria-label="Edit todo"]',value);await key('Enter','Enter',13);await waitFor(async()=>!await node('[aria-label="Edit todo"]'));}
 await edit(heldOut?'renamed caption':'changed');const changed=await inspect('changed',first);await check('real changed title has supported exact field chain',()=>assert.equal(changed?.fullPath,true,JSON.stringify(changed)));
 await edit(heldOut?'renamed caption':'changed');const same=await inspect('same-value',first);await check('same-value edit has a new exact applied revision',()=>{assert.equal(same?.fullPath,true,JSON.stringify(same));assert.notEqual(changed.occurrence.joins.revisionId,same.occurrence.joins.revisionId);});
 if(installedVsix)await check('current source link opens its exact range in the actual installed IDE helper',async()=>{
  await ui.click('refresh-tabs');await waitFor(()=>panel.evaluate(id=>[...document.querySelector('[data-atom-id="tabs"]').options].some(o=>o.value===String(id)),tabId));await ui.select('tabs',String(tabId));await ui.click('load');await ui.waitOK();await ui.click('inputs-nav');
  await panel.evaluate(()=>{const b=document.querySelector('[data-atom-id="selected-list-origin"] > div button');if(!b||b.disabled)throw Error('Current source action unavailable');b.focus();});await ui.key('Enter','Enter',13);await ui.waitOK();
  const expected=same.chain[0].source;const opened=await waitFor(async()=>{const rows=String(await readFile(bridge.runtime+'/ide-audit.jsonl')).trim().split('\n').map(JSON.parse);return rows.find(r=>r.file===workspace+'/'+expected.file&&r.line===expected.line&&r.column===expected.column);});await writeFile(out+'/selected-source-open.json',JSON.stringify(opened,null,2));ideVerified=true;result.installedIDE=true;
 });
 if(heldOut)await check('actual picker overlay preserves the selected renamed field interval',async()=>{
  const beforePick=await rpc(panel,{op:'state',tabId});const {completedListPicker}=await import('../helpers/selected-list-picker-wait.mjs');
  await ui.click('pick');const picking=await waitFor(async()=>{const state=await rpc(panel,{op:'state',tabId});return state.picker?.status==='picking'?state:null;});
  await app.send('Page.bringToFront');const nodeId=await node(first);await app.send('DOM.scrollIntoViewIfNeeded',{nodeId});const{model}=await app.send('DOM.getBoxModel',{nodeId}),q=model.content,x=(q[0]+q[2])/2,y=(q[1]+q[5])/2;
  await app.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
  const hovered=await app.send('Page.captureScreenshot',{format:'png'});await writeFile(out+'/held-out-picker-hover-candidate.png',Buffer.from(hovered.data,'base64'));
  for(const type of ['mousePressed','mouseReleased'])await app.send('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});
  const state=await waitFor(async()=>{const value=await rpc(panel,{op:'state',tabId});return completedListPicker(value,{pickerId:picking.picker.id,observedAt:beforePick.selection.observedAt,revisionId:same.occurrence.joins.revisionId})?value:null;});
  await writeFile(out+'/held-out-picker-state.json',JSON.stringify(state,null,2));assert.equal(state.analysis.stateatom.selectedListProfile.field,'caption');assert.equal(state.analysis.stateatom.selectedListProfile.occurrence.joins.revisionId,same.occurrence.joins.revisionId);
 });
 if(presentation){
  await ui.click('refresh-tabs');await waitFor(()=>panel.evaluate(id=>[...document.querySelector('[data-atom-id="tabs"]').options].some(o=>o.value===String(id)),tabId));await ui.select('tabs',String(tabId));await ui.click('load');await ui.waitOK();await ui.click('inputs-nav');
  await check('mounted current text origin has three readable links and nine folded steps',async()=>{
   const v=await panel.evaluate(()=>{const e=document.querySelector('[data-atom-id="selected-list-origin"]');return{hidden:e.hidden,text:e.innerText,links:e.querySelectorAll(':scope > div button').length,steps:e.querySelectorAll('details button').length,folded:!e.querySelector('details').open,empty:document.querySelector('[data-atom-id="element-properties"]').innerText};});
   assert.equal(v.hidden,false);assert.equal(v.links,3);assert.equal(v.steps,9);assert.equal(v.folded,true);assert.doesNotMatch(v.text,/react19:|data:\d|revision:/);assert.doesNotMatch(v.empty,/Dependencies not found/);result.presentation=v;
  });
  await check('desktop and narrow rendered text origin fit and keyboard opens the details',async()=>{
   result.viewports=[];for(const width of[440,390]){const metrics=await ui.screenshot(out+'/text-origin-'+width+'-candidate.png',{width,focus:'selection-header'});assert.equal(metrics.overflow,false);result.viewports.push(metrics);}
   await panel.evaluate(()=>document.querySelector('[data-atom-id="selected-list-origin"] details summary').focus());await ui.key('Enter','Enter',13);
   assert.equal(await panel.evaluate(()=>document.querySelector('[data-atom-id="selected-list-origin"] details').open),true);
   await ui.screenshot(out+'/text-origin-expanded-candidate.png',{width:440,focus:'selected-list-origin'});
  });
  await check('actual local diagnostic stores scoped historical source and occurrence metadata',async()=>{
   await ui.click('evidence-nav');await ui.click('save-report');await ui.waitOK();const reports=await rpc(panel,{op:'list-diagnostics'});const report=reports.find(r=>r.runtime?.selectedListProfile?.fullPath===true);assert(report,'saved selected-list diagnostic');
   const decoded=parseDiagnostic(JSON.stringify(report));assert.equal(decoded.runtime.selectedListProfile.occurrence.joins.revisionId.split(':').at(-1),same.occurrence.joins.revisionId.split(':').at(-1));assert.equal(decoded.runtime.selectedListProfile.chain.length,9);assert.equal(decoded.runtime.fullPath,false);assert.match(decoded.runtime.selectedListProfile.trust,/not reverified.*no action authority/);await writeFile(out+'/historical-diagnostic.json',JSON.stringify(decoded,null,2));
  });result.publicPresentation=true;
 }
 const untouched=await inspect('untouched',second);await check('untouched equal row never borrows selected first row write',()=>assert.notEqual(untouched?.occurrence?.joins?.revisionId,same.occurrence.joins.revisionId));
 if(domControls){
  const initial=await inspect('dom-baseline',first);assert.equal(initial.fullPath,true);
  async function textNode(selector){const{root}=await app.send('DOM.getDocument',{depth:-1});const{nodeId}=await app.send('DOM.querySelector',{nodeId:root.nodeId,selector});const{node:description}=await app.send('DOM.describeNode',{nodeId,depth:1});const child=description.children?.find(n=>n.nodeType===3);assert(child?.nodeId,'native text node');return child;}
  const mutate=async(selector,value)=>app.send('DOM.setNodeValue',{nodeId:(await textNode(selector)).nodeId,value});
  await mutate(second,'unrelated sibling');const sibling=await inspect('dom-sibling',first);
  await check('unrelated sibling text mutation preserves the exact selected revision',()=>{assert.equal(sibling.fullPath,true,JSON.stringify(sibling));assert.equal(sibling.occurrence.joins.revisionId,initial.occurrence.joins.revisionId);});
  for(const [name,value]of[['changed','native external text'],['same-value','restored']]){
   if(name==='same-value'){await edit('changed');const noop=await inspect('dom-noop-commit',first);await check('new React commit without a selected host write cannot clear prior external text',()=>assert.equal(noop.fullPath,false,JSON.stringify(noop)));await edit('restored');const fresh=await inspect('dom-new-commit',first);assert.equal(fresh.fullPath,true,JSON.stringify(fresh));assert.notEqual(fresh.occurrence.joins.commitId,initial.occurrence.joins.commitId);}
   const before=await textNode(first);await mutate(first,value);const after=await textNode(first);assert.equal(after.nodeValue,value);if(name==='same-value')assert.equal(before.nodeValue,value);
   const refused=await inspect('dom-'+name,first);
   await check('post-commit '+name+' native text mutation refuses without unknown MAIN compilation',async()=>{assert.equal(refused.fullPath,false,JSON.stringify(refused));assert.match(refused.reason,/Selected text changed after commit|DOM interval unavailable/);const state=JSON.parse(await readFile(out+'/dom-'+name+'-state.json'));assert.equal(state.analysis.codeJournal.freshness,'Recorded');assert.equal(listFieldCodeContextView(context).status,'Owned list code context');});
   const repeated=await inspect('dom-'+name+'-repeat',first);assert.equal(repeated.fullPath,false,'reinspection cannot restamp the same commit');
  }
  await edit('restored again');const recovered=await inspect('dom-recovered',first);await check('new original React commit establishes a fresh selected DOM interval',()=>assert.equal(recovered.fullPath,true,JSON.stringify(recovered)));
 }
 if(lifecycle){
  async function click(selector,{hover=false}={}){await app.send('Page.bringToFront');const nodeId=await node(selector);await app.send('DOM.scrollIntoViewIfNeeded',{nodeId});const{model}=await app.send('DOM.getBoxModel',{nodeId}),q=model.content,x=(q[0]+q[2])/2,y=(q[1]+q[5])/2;await app.send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});if(!hover)for(const type of ['mousePressed','mouseReleased'])await app.send('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});}
  if(lifecycle==='source'){
   await inspect('before-toggle',first);const prior=await rpc(panel,{op:'state',tabId}),identity=prior.selection.domIdentity;
   await click('[data-testid="todo-item-toggle"]');const toggled=await inspect('toggled',first);
   await check('unrelated completed-field write is not invented as a new title writer',()=>{if(toggled?.fullPath)assert.equal(toggled.occurrence.joins.writeCallId,same.occurrence.joins.writeCallId);else assert.equal(toggled?.fullPath,false);});
   await click('a[href="#/active"]');await waitFor(async()=>(await nodes(labels)).length===1);
   await check('hidden selected row cannot be replaced by another node under its old selector',async()=>{await assert.rejects(rpc(panel,{op:'inspect-selector',tabId,selector:first,expectedIdentity:{document:identity.document,node:identity.node}}),/changed|expired/i);});
   await click('a[href="#/"]');await waitFor(async()=>(await nodes(labels)).length===2);await edit('restored visible');assert.equal((await inspect('visible-fresh',first))?.fullPath,true);
   const beforeRemove=await rpc(panel,{op:'state',tabId});await click('[data-testid="todo-item"]',{hover:true});await waitFor(async()=>{try{return await app.send('DOM.getBoxModel',{nodeId:await node('[data-testid="todo-item-button"]')});}catch{return false;}});await click('[data-testid="todo-item-button"]');await waitFor(async()=>(await nodes(labels)).length===1);
   await check('removed selected node cannot lend its chain to the surviving equal-position row',async()=>{const identity=beforeRemove.selection.domIdentity;await assert.rejects(rpc(panel,{op:'inspect-selector',tabId,selector:first,expectedIdentity:{document:identity.document,node:identity.node}}),/changed|expired/i);});
   await edit('surviving row');assert.equal((await inspect('before-source-change',first))?.fullPath,true);
   const file=workspace+'/app/src/todo/components/header.jsx',bytes=await readFile(file);sourceRestore={file,bytes};await writeFile(file,Buffer.concat([bytes,Buffer.from('\n// controlled source revision change\n')]));
   await check('changed original source revokes the current full-chain capability',async()=>assert.equal((await inspect('source-changed',first))?.fullPath,false));
   await writeFile(file,bytes);sourceRestore=null;
   await check('restoring bytes cannot revive a revoked source/native capability',async()=>assert.equal((await inspect('source-restored',first))?.fullPath,false));
   await rpc(panel,{op:'detach',tabId});const detached=await rpc(panel,{op:'state',tabId});await writeFile(out+'/detached-state.json',JSON.stringify(detached,null,2));await check('explicit detach ends attached inspection and its current chain',()=>{assert.equal(detached.attached,false);assert.notEqual(detached.analysis?.stateatom?.selectedListProfile?.fullPath,true);});
  }else{
   await app.send('Page.reload');await waitFor(()=>node('[aria-label="New Todo Input"]'));await fill('[aria-label="New Todo Input"]','after reload');await key('Enter','Enter',13);await waitFor(async()=>(await nodes(labels)).length===1);
   await check('reload cannot borrow the previous native context proof for a new row',async()=>assert.equal((await inspect('after-reload',first))?.fullPath,false));
  }
 }else{
 await inspect('before-unknown-code',first);try{await app.send('Runtime.evaluate',{expression:'document.documentElement.setAttribute("data-unknown-code-control","executed")'});}finally{/* Own observer closes with the session below. */}
 await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).analysis?.stateatom?.selectedListProfile?.status==='Stale');const denied=await inspect('unknown-code',first);await check('unknown MAIN code stales history and refuses a fresh profile',()=>assert.equal(denied?.fullPath,false,JSON.stringify(denied)));
 }
 if(presentation)await check('built passive reader imports actual saved history with no source action',async()=>{
  const reader=await session.browser.context.newPage();await reader.goto('chrome-extension://'+session.browser.id+'/reader.html');const readerUI=await nativeInspectorUI(reader,session.browser);
  try{await readerUI.files('#diagnostic-file',[out+'/historical-diagnostic.json']);await waitFor(()=>reader.evaluate(()=>document.getElementById('reader-status').textContent.startsWith('Imported historical diagnostic')));const text=await reader.evaluate(()=>document.getElementById('reader-summary').textContent);assert.match(text,/Historical text origin/);assert.match(text,/reducer.js:50:84/);assert.match(text,/not reverified.*no action authority/);assert.equal(await reader.evaluate(()=>document.querySelectorAll('#reader-summary button').length),0);await reader.screenshot({path:out+'/historical-reader-candidate.png'});await writeFile(out+'/historical-reader.txt',text);}finally{await readerUI.close();}
 });
 if(channel){await channel.close();await check('closing private verifier denies a fresh separate-helper analysis',async()=>{const denied=await inspect('channel-closed',first);assert.equal(denied.fullPath,false);assert.match(denied.reason,/private.*verifier unavailable/);});}
 assert.deepEqual(result.errors,[]);result.status='PASS_BOUNDED_NATIVE_ROUTE';
}catch(error){if(appSession)try{const shot=await appSession.send('Page.captureScreenshot',{format:'png'});await writeFile(out+'/failed-app.png',Buffer.from(shot.data,'base64'));const{root:doc}=await appSession.send('DOM.getDocument');const html=await appSession.send('DOM.getOuterHTML',{nodeId:doc.nodeId});await writeFile(out+'/failed-app.html',html.outerHTML);}catch{}result.status='INCOMPLETE';result.error=String(error.stack||error);if(error.cause){result.cause=String(error.cause.stack||error.cause);if(error.cause.nativeTargets)result.nativeTargets=error.cause.nativeTargets;if(error.cause.discoveryError)result.discoveryError=error.cause.discoveryError;if(error.cause.historyDiagnostic)result.historyDiagnostic=error.cause.historyDiagnostic;}process.exitCode=1;}
finally{if(sourceRestore)try{await writeFile(sourceRestore.file,sourceRestore.bytes);}catch(error){result.errors.push('source restoration: '+error);process.exitCode=1;}for(const[name,resource]of[['browser',session],['channel',channel],['helper',bridge],['source',source]])if(resource)try{await resource.close();result[name+'Closed']=true;}catch(error){result.errors.push(name+' cleanup: '+error);process.exitCode=1;}if(installedSession)try{assert.equal(installedSession.phase,'closed');assert.deepEqual((await readdir(workspace+'/.runtime/selected-list-live')).filter(n=>n.endsWith('.json')),[]);result.installedLifecycleClosed=true;}catch(error){result.errors.push('installed cleanup: '+error);process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify({out,status:result.status,error:result.error||null,cause:result.cause||null,errors:result.errors}));}
