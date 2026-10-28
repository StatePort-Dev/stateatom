// SPDX-License-Identifier: Apache-2.0
// Frozen301 conjunction diagnostic: real extension/helper; not installed IDE/UI
// presentation/export/official-host acceptance and not the full282 matrix.
import assert from 'node:assert/strict';import {mkdir,readFile,writeFile} from 'node:fs/promises';import {createHash,randomBytes} from 'node:crypto';
import {buildListFieldCompilation} from '../../src/engine/list-field-compilation.mjs';
import {startListFieldServer} from '../../src/engine/list-field-server.mjs';
import {createListFieldCodeContext,listFieldCodeContextView} from '../../src/engine/list-field-code.mjs';
import {launchControlledFirstReadBrowser} from '../../src/first-read/controlled-session.mjs';
import {startBridge} from '../../core/bridge.mjs';
import {chooseTab,approveDevelopment,pair,rpc,atomLocator,waitFor} from '../../scripts/harness.mjs';
const root=process.cwd(),out=root+'/.artifacts/a02/selected-list-route/'+new Date().toISOString().replace(/[:.]/g,'-'),sha=s=>createHash('sha256').update(s).digest('hex');await mkdir(out,{recursive:true});
const sourceRoot='.runtime/todomvc/examples/react',options={projectRoot:root,appRoot:sourceRoot,entry:'src/index.js',root:{file:'src/todo/app.jsx',export:'App'},field:'title',sources:['src/todo/app.jsx','src/todo/reducer.js','src/todo/components/main.jsx','src/todo/components/item.jsx','src/todo/components/footer.jsx']};
const result={schema:'stateatom.selected-list-route-diagnostic/1',case:'docs/completion/301-a02-list-helper-native-case.md',out,startedAt:new Date().toISOString(),checks:[],errors:[],fullA02:false,installedIDE:false,publicPresentation:false,officialHost:false};let source,bridge,session;
async function check(name,fn){await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);}
try{
 const compilation=await buildListFieldCompilation(options);await writeFile(out+'/manifest.json',JSON.stringify(compilation.manifest,null,2));await writeFile(out+'/bundle.js',compilation.code);
 await writeFile(out+'/frozen-inputs.json',JSON.stringify({case:sha(await readFile(result.case)),script:sha(await readFile(new URL(import.meta.url))),manifest:compilation.manifest.digest,bundle:compilation.manifest.bundle.digest,extensionWorker:sha(await readFile('dist/browser/worker.js'))},null,2));
 source=await startListFieldServer({compilation});bridge=startBridge({root,port:0,token:randomBytes(32).toString('hex'),onOpen:async()=>({opened:false,reason:'Source-helper diagnostic, no installed IDE'}),onDefinitions:async()=>[],onReferences:async()=>[]});await bridge.ready;bridge.cfg.port=bridge.server.address().port;
 session=await launchControlledFirstReadBrowser({projectRoot:root,headed:true,appProfile:'selected-list'});const {page,panel}=session;page.on('pageerror',e=>result.errors.push(e.message));const ui=s=>atomLocator(panel,s);
 await ui('#source-nav').click();if(!await ui('#connection-receipt').isVisible())await ui('#source-connection > summary').click();await ui('#connection-receipt').fill(JSON.stringify({schemaVersion:1,helper:bridge.helper,workspace:bridge.workspace,url:'http://127.0.0.1:'+bridge.cfg.port,origin:'http://127.0.0.1:4173',token:bridge.cfg.token,sourceRoot}));await ui('#connect-receipt').click();await ui('#status').filter({hasText:/^OK$/}).waitFor();await ui('#connection-receipt').fill('');await page.goto('http://127.0.0.1:4173/__stateatom/list-start');const tabId=await chooseTab(panel,'/__stateatom/list-start');await approveDevelopment(panel);await ui('#attach').click();await ui('#status').filter({hasText:/^OK$/}).waitFor();await page.goto('http://127.0.0.1:4173/list/');const input=page.getByLabel('New Todo Input');await input.waitFor();
 const context=await createListFieldCodeContext({compilation,effects:source.effects,witness:session.witness});result.context=listFieldCodeContextView(context);assert.equal(result.context.status,'Owned list code context',JSON.stringify(result.context));bridge.bindListFieldContext(context);console.log('PASS actual owned context issued');
 async function inspect(name,selector){
  await rpc(panel,{op:'property',tabId,property:'text'});
  const reply=await rpc(panel,{op:'inspect-selector',tabId,selector});
  const state=await rpc(panel,{op:'state',tabId});await writeFile(out+'/'+name+'-state.json',JSON.stringify(state,null,2));
  await writeFile(out+'/'+name+'-analysis.json',JSON.stringify(reply,null,2));return state.analysis?.stateatom?.selectedListProfile;
 }
 const labels=page.locator('[data-testid="todo-item-label"]');for(let i=0;i<2;i++){await input.fill('same');await input.press('Enter');await labels.nth(i).waitFor();}
 const second='[data-testid="todo-item"]:nth-child(2) [data-testid="todo-item-label"]',first='[data-testid="todo-item"]:nth-child(1) [data-testid="todo-item-label"]';
 const created=await inspect('created',second);await check('real created row joins acquired source, native code and selected field',()=>{assert.equal(created?.status,'Supported finite trace',JSON.stringify(created));assert.equal(created.fullPath,true);assert(created.chain.every(step=>step.source?.file));});
 async function edit(value){await labels.first().dblclick();const editor=page.getByLabel('Edit todo');await editor.fill(value);await editor.press('Enter');await editor.waitFor({state:'detached'});}
 await edit('changed');const changed=await inspect('changed',first);await check('real changed title has supported exact field chain',()=>assert.equal(changed?.fullPath,true,JSON.stringify(changed)));
 await edit('changed');const same=await inspect('same-value',first);await check('same-value edit has a new exact applied revision',()=>{assert.equal(same?.fullPath,true,JSON.stringify(same));assert.notEqual(changed.occurrence.joins.revisionId,same.occurrence.joins.revisionId);});
 const untouched=await inspect('untouched',second);await check('untouched equal row never borrows selected first row write',()=>assert.notEqual(untouched?.occurrence?.joins?.revisionId,same.occurrence.joins.revisionId));
 await inspect('before-unknown-code',first);const cdp=await session.browser.context.newCDPSession(page);try{await cdp.send('Runtime.evaluate',{expression:'document.documentElement.setAttribute("data-unknown-code-control","executed")'});}finally{await cdp.detach();}
 await waitFor(async()=>(await rpc(panel,{op:'state',tabId})).analysis?.stateatom?.selectedListProfile?.status==='Stale');const denied=await inspect('unknown-code',first);await check('unknown MAIN code stales history and refuses a fresh profile',()=>assert.equal(denied?.fullPath,false,JSON.stringify(denied)));
 assert.deepEqual(result.errors,[]);result.status='PASS_BOUNDED_NATIVE_ROUTE';
}catch(error){result.status='INCOMPLETE';result.error=String(error.stack||error);if(error.cause)result.cause=String(error.cause.stack||error.cause);process.exitCode=1;}
finally{for(const[name,resource]of[['browser',session],['helper',bridge],['source',source]])if(resource)try{await resource.close();result[name+'Closed']=true;}catch(error){result.errors.push(name+' cleanup: '+error);process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify({out,status:result.status,error:result.error||null,cause:result.cause||null,errors:result.errors}));}
