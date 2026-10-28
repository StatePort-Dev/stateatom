// SPDX-License-Identifier: Apache-2.0
// Frozen301 conjunction diagnostic: real extension/helper; not installed IDE/UI
// presentation/export/official-host acceptance and not the full282 matrix.
import {parseDiagnostic} from '../../core/diagnostic.mjs';
import assert from 'node:assert/strict';import {mkdir,readFile,writeFile} from 'node:fs/promises';import {createHash,randomBytes} from 'node:crypto';
import {buildListFieldCompilation} from '../../src/engine/list-field-compilation.mjs';
import {startListFieldServer} from '../../src/engine/list-field-server.mjs';
import {createListFieldCodeContext,listFieldCodeContextView} from '../../src/engine/list-field-code.mjs';
import {launchControlledFirstReadBrowser} from '../../src/first-read/controlled-session.mjs';
import {startBridge} from '../../core/bridge.mjs';
import {rpc,waitFor} from '../../scripts/harness.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {nativeApproveDevelopment,nativeChooseTab} from '../../scripts/native-browser.mjs';
const presentation=process.argv.includes('--presentation'),domControls=process.argv.includes('--dom-controls');
const root=process.cwd(),out=root+'/.artifacts/a02/selected-list-route/'+new Date().toISOString().replace(/[:.]/g,'-'),sha=s=>createHash('sha256').update(s).digest('hex');await mkdir(out,{recursive:true});
const sourceRoot='.runtime/todomvc/examples/react',options={projectRoot:root,appRoot:sourceRoot,entry:'src/index.js',root:{file:'src/todo/app.jsx',export:'App'},field:'title',sources:['src/todo/app.jsx','src/todo/reducer.js','src/todo/components/main.jsx','src/todo/components/item.jsx','src/todo/components/footer.jsx']};
const result={schema:'stateatom.selected-list-route-diagnostic/1',case:domControls?'docs/completion/305-a02-native-dom-interval-case.md':presentation?'docs/completion/303-a02-selected-list-presentation-case.md':'docs/completion/301-a02-list-helper-native-case.md',out,startedAt:new Date().toISOString(),checks:[],errors:[],fullA02:false,installedIDE:false,publicPresentation:false,officialHost:false};let source,bridge,session,appSession;
async function check(name,fn){await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);}
try{
 const compilation=await buildListFieldCompilation(options);await writeFile(out+'/manifest.json',JSON.stringify(compilation.manifest,null,2));await writeFile(out+'/bundle.js',compilation.code);
 await writeFile(out+'/frozen-inputs.json',JSON.stringify({case:sha(await readFile(result.case)),script:sha(await readFile(new URL(import.meta.url))),manifest:compilation.manifest.digest,bundle:compilation.manifest.bundle.digest,extensionWorker:sha(await readFile('dist/browser/worker.js'))},null,2));
 source=await startListFieldServer({compilation});bridge=startBridge({root,port:0,token:randomBytes(32).toString('hex'),onOpen:async()=>({opened:false,reason:'Source-helper diagnostic, no installed IDE'}),onDefinitions:async()=>[],onReferences:async()=>[]});await bridge.ready;bridge.cfg.port=bridge.server.address().port;
 session=await launchControlledFirstReadBrowser({projectRoot:root,headed:true,appProfile:'selected-list'});const {panel}=session,ui=await nativeInspectorUI(panel,session.browser);
 await ui.click('source-nav');await ui.fill('connection-receipt',JSON.stringify({schemaVersion:1,helper:bridge.helper,workspace:bridge.workspace,url:'http://127.0.0.1:'+bridge.cfg.port,origin:'http://127.0.0.1:4173',token:bridge.cfg.token,sourceRoot}));await ui.click('connect-receipt');await ui.waitOK();
 const tabId=await nativeChooseTab(panel,session.setupURL);await nativeApproveDevelopment(panel,tabId);await rpc(panel,{op:'attach',tabId});
 const app=await session.arm();appSession=app;app.on('Runtime.exceptionThrown',e=>result.errors.push(e.exceptionDetails.text));
 async function node(selector){const{root}=await app.send('DOM.getDocument');return(await app.send('DOM.querySelector',{nodeId:root.nodeId,selector})).nodeId;}
 async function nodes(selector){const{root}=await app.send('DOM.getDocument');return(await app.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector})).nodeIds;}
 async function key(key,code,n,modifiers=0){for(const type of['keyDown','keyUp'])await app.send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:n,modifiers,...(key==='Enter'&&type==='keyDown'?{text:'\r',unmodifiedText:'\r'}:{})});}
 async function fill(selector,value){await app.send('Page.bringToFront');await app.send('DOM.focus',{nodeId:await waitFor(()=>node(selector))});await key('a','KeyA',65,2);await app.send('Input.insertText',{text:value});}
 await app.send('Page.navigate',{url:'http://127.0.0.1:4173/list/'});await waitFor(()=>node('[aria-label="New Todo Input"]'));
 const context=await createListFieldCodeContext({compilation,effects:source.effects,witness:session.witness});result.context=listFieldCodeContextView(context);assert.equal(result.context.status,'Owned list code context',JSON.stringify(result.context));bridge.bindListFieldContext(context);console.log('PASS actual owned context issued');
 async function inspect(name,selector){
  await rpc(panel,{op:'property',tabId,property:'text'});
  const reply=await rpc(panel,{op:'inspect-selector',tabId,selector,...(presentation?{elementProperties:true}:{})});
  const state=await rpc(panel,{op:'state',tabId});await writeFile(out+'/'+name+'-state.json',JSON.stringify(state,null,2));
  await writeFile(out+'/'+name+'-analysis.json',JSON.stringify(reply,null,2));return state.analysis?.stateatom?.selectedListProfile;
 }
 const labels='[data-testid="todo-item-label"]';for(let i=0;i<2;i++){await fill('[aria-label="New Todo Input"]','same');await key('Enter','Enter',13);await waitFor(async()=>(await nodes(labels)).length===i+1);}
 const second='[data-testid="todo-item"]:nth-child(2) [data-testid="todo-item-label"]',first='[data-testid="todo-item"]:nth-child(1) [data-testid="todo-item-label"]';
 const created=await inspect('created',second);await check('real created row joins acquired source, native code and selected field',()=>{assert.equal(created?.status,'Supported finite trace',JSON.stringify(created));assert.equal(created.fullPath,true);assert(created.chain.every(step=>step.source?.file));});
 async function edit(value){const nodeId=await node(first);await app.send('DOM.scrollIntoViewIfNeeded',{nodeId});const{model}=await app.send('DOM.getBoxModel',{nodeId}),q=model.content,x=(q[0]+q[2])/2,y=(q[1]+q[5])/2;for(const count of[1,2])for(const type of['mousePressed','mouseReleased'])await app.send('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:count});await fill('[aria-label="Edit todo"]',value);await key('Enter','Enter',13);await waitFor(async()=>!await node('[aria-label="Edit todo"]'));}
 await edit('changed');const changed=await inspect('changed',first);await check('real changed title has supported exact field chain',()=>assert.equal(changed?.fullPath,true,JSON.stringify(changed)));
 await edit('changed');const same=await inspect('same-value',first);await check('same-value edit has a new exact applied revision',()=>{assert.equal(same?.fullPath,true,JSON.stringify(same));assert.notEqual(changed.occurrence.joins.revisionId,same.occurrence.joins.revisionId);});
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
 await inspect('before-unknown-code',first);try{await app.send('Runtime.evaluate',{expression:'document.documentElement.setAttribute("data-unknown-code-control","executed")'});}finally{/* Own observer closes with the session below. */}
 await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).analysis?.stateatom?.selectedListProfile?.status==='Stale');const denied=await inspect('unknown-code',first);await check('unknown MAIN code stales history and refuses a fresh profile',()=>assert.equal(denied?.fullPath,false,JSON.stringify(denied)));
 if(presentation)await check('built passive reader imports actual saved history with no source action',async()=>{
  const reader=await session.browser.context.newPage();await reader.goto('chrome-extension://'+session.browser.id+'/reader.html');const readerUI=await nativeInspectorUI(reader,session.browser);
  try{await readerUI.files('#diagnostic-file',[out+'/historical-diagnostic.json']);await waitFor(()=>reader.evaluate(()=>document.getElementById('reader-status').textContent.startsWith('Imported historical diagnostic')));const text=await reader.evaluate(()=>document.getElementById('reader-summary').textContent);assert.match(text,/Historical text origin/);assert.match(text,/reducer.js:50:84/);assert.match(text,/not reverified.*no action authority/);assert.equal(await reader.evaluate(()=>document.querySelectorAll('#reader-summary button').length),0);await reader.screenshot({path:out+'/historical-reader-candidate.png'});await writeFile(out+'/historical-reader.txt',text);}finally{await readerUI.close();}
 });
 assert.deepEqual(result.errors,[]);result.status='PASS_BOUNDED_NATIVE_ROUTE';
}catch(error){if(appSession)try{const shot=await appSession.send('Page.captureScreenshot',{format:'png'});await writeFile(out+'/failed-app.png',Buffer.from(shot.data,'base64'));const{root:doc}=await appSession.send('DOM.getDocument');const html=await appSession.send('DOM.getOuterHTML',{nodeId:doc.nodeId});await writeFile(out+'/failed-app.html',html.outerHTML);}catch{}result.status='INCOMPLETE';result.error=String(error.stack||error);if(error.cause){result.cause=String(error.cause.stack||error.cause);if(error.cause.nativeTargets)result.nativeTargets=error.cause.nativeTargets;if(error.cause.discoveryError)result.discoveryError=error.cause.discoveryError;if(error.cause.historyDiagnostic)result.historyDiagnostic=error.cause.historyDiagnostic;}process.exitCode=1;}
finally{for(const[name,resource]of[['browser',session],['helper',bridge],['source',source]])if(resource)try{await resource.close();result[name+'Closed']=true;}catch(error){result.errors.push(name+' cleanup: '+error);process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify({out,status:result.status,error:result.error||null,cause:result.cause||null,errors:result.errors}));}
