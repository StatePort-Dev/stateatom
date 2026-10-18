// SPDX-License-Identifier: MIT
// Native evaluation scaffolding adapted from the historical MIT short-loop harness.
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {transformSync} from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {root} from "../../scripts/vite-config.mjs";
import {stateatomPlugin} from "../../src/engine/plugin.mjs";
import {todoRevision,fileDigests} from "../../scripts/short-loop-inputs.mjs";
import {startIDE,startBrowser,panelFor,pair,chooseTab,rpc,select,waitFor} from "../../scripts/harness.mjs";

const tag=process.env.INDEPENDENT_TAG||new Date().toISOString().replaceAll(/[:.]/g,'-');assert.match(tag,/^[a-zA-Z0-9_-]{1,100}$/);
const out=root+'/.runtime/independent-runs/'+tag;await mkdir(root+'/.runtime/independent-runs',{recursive:true});await mkdir(out);
const runtime=out+'/profiles',origin='http://127.0.0.1:4175';
const inputs=['core','browser-extension','ide-extension/extension.mjs','src/engine','scripts/harness.mjs','scripts/ide-runner.mjs','scripts/vite-config.mjs','tests/ide-host.cjs','dist/browser','dist/reader','dist/ide/extension.cjs',"tests/integration/independent.mjs"];
const digests=await fileDigests(root,inputs),result={schema:1,tag,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),configuration:{upstream:'tastejs/todomvc',revision:todoRevision,node:process.version,reactCommit:false,sourceConsumption:true,ide:true,desktop:false,sandbox:true},inputs:digests,questions:[],errors:[],health:[],startedAt:new Date().toISOString()};
const apps=[{name:'react',relative:'.runtime/todomvc/examples/react',heldout:false,questions:[{id:'remaining',selector:'.todo-count',question:'After adding Alpha and Beta and completing Alpha, which expression and observed read explain the remaining count?',file:'footer.jsx',read:'activeTodos.length',value:1}]},{name:'react-redux',relative:'.runtime/independent-apps/'+(process.env.APP_TAG||'todomvc-redux-'+todoRevision.slice(0,12))+'/examples/react-redux',heldout:true,questions:[{id:'remaining',selector:'.todo-count',question:'After adding Alpha and Beta and completing Alpha, which expression and observed read explain the remaining count?',file:'footer.jsx',read:'activeCount',value:1},{id:'completed-title',selector:'.todo-list li:first-child label',question:'Where is the completed Alpha title rendered and what title value was actually read?',file:'item.jsx',read:'todo.text',value:'Alpha independent'}]}];
let ide,browser,server;
async function audit(){try{return await readFile(runtime+'/ide-audit.jsonl','utf8');}catch{return '';}}
async function inspectFromPanel(panel,tabId,selector){const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt;
 if(!await panel.locator('#selector').isVisible())await panel.locator('#selector-details > summary').click();
 await panel.locator('#selector').fill(selector);await panel.locator('#inspect-selector').click();
 await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();
 return waitFor(async()=>{const state=await rpc(panel,{op:'state',tabId});return state.analysis&&state.selection?.observedAt!==before?state:null;});
}
async function serve(app){const base=root+'/'+app.relative,html=await readFile(base+'/public/index.html','utf8');return createServer({configFile:false,root:base,publicDir:base+'/public',server:{host:'127.0.0.1',port:4175,strictPort:true,fs:{allow:[root]}},plugins:[stateatomPlugin({enabled:true,root:base+'/src'}),{name:'evaluation-environment-only',enforce:'pre',configureServer(s){s.middlewares.use(async(req,res,next)=>{if(req.url==='/base.js'){res.setHeader('Content-Type','application/javascript');res.end(await readFile(base+'/node_modules/todomvc-common/base.js','utf8'));return;}if(req.url==='/'){res.setHeader('Content-Type','text/html');res.end(await s.transformIndexHtml('/',html.replace('</body>','<script type="module" src="/src/index.js"></script></body>')));return;}next();});},transform(code,id){if(id.startsWith(base+'/src/')&&/\.(js|jsx)$/.test(id))return transformSync(code,{filename:id,configFile:false,babelrc:false,plugins:[[jsx,{runtime:'automatic'}]],sourceMaps:true});}}]});}
async function cleanup(){if(browser){await browser.context.close();browser=null;}if(server){await server.close();server=null;}}
try{
 ide=await startIDE(runtime,{logDir:out});
 for(const app of apps){const health={app:app.name,pageErrors:[],consoleErrors:[],blocked:[]};result.health.push(health);const before=await fileDigests(root+'/'+app.relative,['src','public','package.json','package-lock.json']);
  try{server=await serve(app);await server.listen();browser=await startBrowser(runtime,app.name);health.browser=browser.context.browser()?.version();
   await browser.context.route('**/*',r=>{const u=new URL(r.request().url());if(['http:','https:'].includes(u.protocol)&&u.hostname!=='127.0.0.1'){health.blocked.push(u.origin);return r.abort();}return r.continue();});
   const page=await browser.context.newPage(),panel=await panelFor(browser.context,browser.id);
   for(const p of[page,panel]){p.on('pageerror',e=>health.pageErrors.push(String(e)));p.on('console',m=>{if(m.type()==='error')health.consoleErrors.push(m.text());});}
   await pair(panel,ide.conn,origin,app.relative+'/src');await panel.locator('#token').fill('');await page.goto(origin);await page.locator('.new-todo').waitFor();const tabId=await chooseTab(panel,origin);await panel.locator('#attach').click();await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();await page.reload();await page.locator('.new-todo').waitFor();
   for(const title of['Alpha independent','Beta independent']){await page.locator('.new-todo').fill(title);await page.locator('.new-todo').press('Enter');}await page.locator('.todo-list li .toggle').first().check();await waitFor(()=>page.locator('.todo-list li').count().then(n=>n===2));
   const files=[];
   for(const question of app.questions){const record={app:app.name,heldout:app.heldout,...question,status:'NOT_RUN'};result.questions.push(record);
    try{const state=await inspectFromPanel(panel,tabId,question.selector);await writeFile(out+'/'+app.name+'-'+question.id+'-state.json',JSON.stringify(state,null,2));
     const sourceIndex=state.analysis.sources.findIndex(s=>s.file.endsWith('/'+question.file));assert(sourceIndex>=0,'source expression/range unavailable');
     assert(state.analysis.sources[sourceIndex].expressions.some(e=>e.includes(question.read)),'selected source expression does not contain the expected read');assert((await panel.locator('#expressions').textContent()).includes(question.read),'expression absent from real UI');assert((await panel.locator('#operands').textContent()).includes(question.read+' = '+JSON.stringify(question.value)),'observed read absent from real UI');const runtimeTrace=state.analysis.stateatom.runtime;assert.equal(runtimeTrace.status,'Observed');const operand=runtimeTrace.nodes.find(n=>n.expression===question.read&&n.value===question.value);assert(operand,'preselected actual read unavailable');
     assert.equal(state.selection.instance,await page.locator(question.selector).getAttribute('data-stateatom'));assert.equal(runtimeTrace.fullPath,false);
     const offset=(await audit()).length,source=state.analysis.sources[sourceIndex];await panel.locator('#sources button').nth(sourceIndex).click();
     const opened=await waitFor(async()=>(await audit()).slice(offset).split('\n').filter(Boolean).map(line=>JSON.parse(line)).find(a=>a.file===root+'/'+source.file&&['line','column','endLine','endColumn'].every(k=>a[k]===source[k])));record.ide=opened;
     await panel.locator('#diagnostics-details > summary').click();await panel.locator('#diagnostic-notes').fill(question.question);await panel.locator('#diagnostic-content').check();await panel.locator('#save-report').click();await panel.locator('#diagnostic-status').filter({hasText:/^Saved/}).waitFor();await panel.locator('#export-report').click();await panel.locator('#export-review').waitFor();
     const preview=await panel.locator('#export-json').inputValue();assert(preview.includes(question.question));const dl=panel.waitForEvent('download');await panel.locator('#export-confirm').click();const exported=out+'/'+app.name+'-'+question.id+'.stateatom.json';await(await dl).saveAs(exported);assert.equal(await readFile(exported,'utf8'),preview);files.push({question,file:exported});
     await panel.screenshot({path:out+'/'+app.name+'-'+question.id+'-panel.png'});await panel.locator('#diagnostics-details > summary').click();record.status='USEFUL_SUPPORTED_FRAGMENT';record.source=source;record.operand={expression:operand.expression,value:operand.value,status:operand.status};record.observedValue=state.selection.value;record.limits=runtimeTrace.unknownBoundaries;
    }catch(e){record.status='UNSUPPORTED_OR_FAIL';record.error=String(e.stack||e);}
   }
   await page.screenshot({path:out+'/'+app.name+'-application.png'});await cleanup();
   // Fresh reader profile has no extension, source connection, app server or IDE token.
   browser=await startBrowser(runtime,'reader-'+app.name,false);const reader=await browser.context.newPage();const requests=[];reader.on('request',r=>requests.push(r.url()));
   await reader.goto('file://'+root+'/dist/reader/reader.html');
   for(const item of files){await reader.locator('#diagnostic-file').setInputFiles(item.file);await reader.locator('#reader-status').filter({hasText:/Imported/}).waitFor();assert((await reader.locator('#reader-summary').textContent()).includes(item.question.question));await reader.screenshot({path:out+'/'+app.name+'-'+item.question.id+'-reader.png',fullPage:true});}
   assert(requests.every(u=>u.startsWith('file:')));health.offlineReader=true;await cleanup();
  }catch(e){health.error=String(e.stack||e);result.errors.push({app:app.name,error:health.error});for(const q of app.questions)if(!result.questions.some(r=>r.app===app.name&&r.id===q.id))result.questions.push({app:app.name,heldout:app.heldout,...q,status:'BLOCKED',reason:health.error});await cleanup();}
  health.businessSourceStable=JSON.stringify(before)===JSON.stringify(await fileDigests(root+'/'+app.relative,['src','public','package.json','package-lock.json']));health.inputDigests=before;
  health.versions=Object.fromEntries(await Promise.all(['react','react-dom',...(app.name==='react-redux'?['react-redux','@reduxjs/toolkit']:[])].map(async name=>[name,JSON.parse(await readFile(root+'/'+app.relative+'/node_modules/'+name+'/package.json','utf8')).version])));
 }
}catch(e){result.errors.push(String(e.stack||e));}
finally{
 try{await cleanup();}catch(e){result.errors.push('cleanup: '+e);}
 // This harness verifies fresh exact editor audits per question above. The shared
 // host's requireOpen=true has a historical /fixtures/ assertion, unsuitable here.
 try{await ide?.close(false);}catch(e){result.errors.push('IDE cleanup: '+e);}
 result.inputsStable=JSON.stringify(digests)===JSON.stringify(await fileDigests(root,inputs));
 result.status=!result.errors.length&&result.inputsStable&&result.health.every(h=>h.businessSourceStable&&!h.pageErrors.length)&&result.questions.length===3&&result.questions.every(q=>q.status==='USEFUL_SUPPORTED_FRAGMENT')?'PASS_SCOPED_APPLICATION_QUESTIONS':'NOT_MET';
 result.humanAcceptance='NOT_RUN';result.fullHTTPPath='NOT_ESTABLISHED';result.completedAt=new Date().toISOString();if(result.status==='NOT_MET')process.exitCode=1;await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out,result.questions.map(q=>[q.app,q.id,q.status]));
}
