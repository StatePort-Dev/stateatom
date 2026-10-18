import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';
import vue from '@vitejs/plugin-vue';
import {transformSync} from '@babel/core';
import jsx from '@babel/plugin-transform-react-jsx';
import {mkdir,writeFile,readFile,copyFile,rename} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {todoRevision,fixtureEntries,fileDigests} from "../../scripts/short-loop-inputs.mjs";
import {stateatomPlugin} from "../../src/engine/plugin.mjs";
import {startServer} from "../../scripts/inspection-server.mjs";
import {root} from "../../scripts/vite-config.mjs";
import {startIDE,startBrowser,panelFor,pair,chooseTab,rpc,waitFor} from "../../scripts/harness.mjs";

// Adapted from the historical short-loop harness (MIT); runs only in this checkout.
const tag=process.env.SHORT_TAG||new Date().toISOString().replaceAll(':','-');
if(!/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,100}$/.test(tag))throw Error('Invalid SHORT_TAG');
const out=root+'/.runtime/short-loop-runs/'+tag;
const runtime=root+'/.runtime/short-'+tag+'-'+Date.now();
await mkdir(root+'/.runtime/short-loop-runs',{recursive:true});await mkdir(out);await mkdir(runtime,{recursive:true});
const result={schema:'stateatom-short-loop/1',startedAt:new Date().toISOString(),criterion:'T+E+V+I; not full provenance',revision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),configuration:{node:process.version,sandbox:true,viewport:{width:1280,height:900},browserPath:'Playwright; Browser plugin not available',todoRevision},checks:[],cases:[],hypotheses:[],health:[],errors:[]};
let ide,server,browser;
const sourceInputs=['core','browser-extension','ide-extension/extension.mjs','src/engine','tests/fixtures/inspection',"scripts/inspection-server.mjs",'scripts/harness.mjs','scripts/vite-config.mjs','scripts/ide-runner.mjs','scripts/short-loop-inputs.mjs','tests/ide-host.cjs','tests/offline-guard.cjs',"tests/integration/short-loop.mjs"];
const buildInputs=['dist/browser','dist/ide/extension.cjs','dist/ide/package.json'];
const compact=s=>s.replace(/\s+/g,'');
function check(name,condition){result.checks.push({name,status:condition?'PASS':'FAIL'});assert.ok(condition,name);}
async function persist(){await writeFile(out+'/results.json',JSON.stringify(result,null,2));}
async function independentServer(stack){
 const base=root+'/.runtime/todomvc/examples/'+stack;
 const html=await readFile(base+(stack==='react'?'/public/index.html':'/index.html'),'utf8');
 return createServer({configFile:false,root:base,publicDir:base+'/public',server:{host:'127.0.0.1',port:4175,strictPort:true,fs:{allow:[root]}},resolve:{alias:{'@':base+'/src'}},plugins:[stateatomPlugin({enabled:true,root:base+'/src'}),vue(),{name:'existing-oss-environment-adaptation',enforce:'pre',configureServer(s){s.middlewares.use(async(req,res,next)=>{if(req.url==='/base.js'){res.setHeader('Content-Type','application/javascript');res.end(await readFile(base+'/node_modules/todomvc-common/base.js','utf8'));return;}if(stack==='react'&&req.url==='/'){res.setHeader('Content-Type','text/html');res.end(await s.transformIndexHtml('/',html.replace('</body>','<script type="module" src="/src/index.js"></script></body>')));return;}next();});},transform(code,id){if(stack==='react'&&id.startsWith(base+'/src/')&&/\.(js|jsx)$/.test(id))return transformSync(code,{filename:id,configFile:false,babelrc:false,plugins:[[jsx,{runtime:'automatic'}]],sourceMaps:true});}}]});
}
async function setup(stack,mode,independent=false,noIDE=false){
 server=independent?await independentServer(stack):await startServer(mode);if(independent)await server.listen();
 browser=await startBrowser(runtime,`${mode}-${stack}-${independent?'todo':noIDE?'basic':'fixture'}`);
 const page=await browser.context.newPage(),panel=await panelFor(browser.context,browser.id);
 const health={stack,mode,independent,noIDE,pageErrors:[],consoleErrors:[],httpErrors:[]};result.health.push(health);
 for(const [p,surface]of[[page,'application'],[panel,'extension']]){p.on('pageerror',e=>health.pageErrors.push({surface,message:e.message}));p.on('console',m=>{if(m.type()==='error')health.consoleErrors.push({surface,message:m.text()});});p.on('response',r=>{if(r.status()>=400)health.httpErrors.push({surface,status:r.status(),url:r.url()});});}
 const origin=independent?'http://127.0.0.1:4175':'http://127.0.0.1:4173';
 if(!noIDE){await pair(panel,ide.conn,origin,independent?`.runtime/todomvc/examples/${stack}/src`:'tests/fixtures/inspection');await panel.locator('#token').fill('');await panel.locator('#source-connection > summary').click();}
 await page.goto(origin+(independent?'/':`/${stack}/`));await page.locator(independent?'.new-todo':'#p4').waitFor();
 const tabId=await chooseTab(panel,origin);await panel.locator('#attach').click();await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();await page.reload();await page.locator(independent?'.new-todo':'#p4').waitFor();
 if(independent){for(const title of['Alpha short','Beta short']){await page.locator('.new-todo').fill(title);await page.locator('.new-todo').press('Enter');}await page.locator('.todo-list li .toggle').first().check();await waitFor(()=>page.locator('.todo-list li').count().then(n=>n===2));}
 check('optional panels start collapsed '+stack+mode+independent,await panel.locator('#experiments-details').evaluate(e=>!e.open)&&await panel.locator('#diagnostics-details').evaluate(e=>!e.open));
 health.chromium=browser.context.browser()?.version();health.identity={url:page.url(),title:await page.title(),bodyLength:(await page.locator('body').innerText()).length,overlay:await page.locator('vite-error-overlay').count()};
 health.panelIdentity={url:panel.url(),title:await panel.title(),bodyLength:(await panel.locator('body').innerText()).length};
 check(stack+mode+' nonblank local app',health.identity.url.startsWith(origin)&&health.identity.bodyLength>30&&health.identity.overlay===0);
 check(stack+mode+' panel identity',health.panelIdentity.url.endsWith('/panel.html')&&health.panelIdentity.title==='StatePort StateAtom'&&health.panelIdentity.bodyLength>100);
 return{page,panel,tabId,stack,mode,independent,noIDE};
}
async function inspect(ctx,c){
 const{panel,page,tabId,stack,mode,independent,noIDE}=ctx;
 const name=[mode,stack,independent?'todo':noIDE?'basic':'fixture',c.id].join('-');
 const item={name,stack,mode,configuration:{browser:true,IDE:!noIDE,sources:!noIDE,devInstrumentation:mode==='B',independent},expected:c,selectionMethod:c.picker?'real picker pointer':'real inspector selector input'};
 try{
 if(!c.refresh)await panel.locator('#property').selectOption(c.property);
 const before=(await rpc(panel,{op:'state',tabId})).selection?.observedAt;
 if(c.refresh){await panel.locator('#load').click();}
 else if(c.picker){await panel.locator('#pick').click();const box=await page.locator(c.selector).boundingBox();if(!box)throw Error('No element box');await page.mouse.click(box.x+box.width/2,box.y+box.height/2);}
 else{if(!await panel.locator('#selector').isVisible())await panel.locator('#selector-details > summary').click();await panel.locator('#selector').fill(c.selector);await panel.locator('#inspect-selector').click();}
 await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId});return s.analysis&&s.selection?.observedAt!==before&&s.selection?.property===c.property?s:null;});
 await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();
 if(!c.refresh){await panel.locator('#load').click();await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();}
 const state=await rpc(panel,{op:'state',tabId});
 const rawDOM=await page.locator(c.selector).evaluate((e,property)=>property==='disabled'?e.disabled:e.textContent,c.property);
 const dom=c.property==='text'?rawDOM.trim():rawDOM;
 item.T=dom===c.value&&state.selection.value===dom;
 item.actual={dom,rawDOM,selectionValue:state.selection.value,marker:state.selection.marker,instance:state.analysis.stateatom?.runtime?.target?.scope||state.selection.deepTrace?.target?.scope};
 item.ui={operands:await panel.locator('#operands').innerText(),mode:await panel.locator('#mode').innerText(),freshness:await panel.locator('#freshness').innerText(),selected:await panel.locator('#selected').innerText(),sources:await panel.locator('#sources').innerText(),expressions:await panel.locator('#expressions').innerText(),summary:await panel.locator('#atom-summary').innerText(),chain:await panel.locator('#atom-chain').innerText(),independentObservations:await panel.locator('#atom-independent').textContent()};
 const expectedSources=state.analysis.sources.filter(s=>s.expressions.some(e=>compact(e).includes(compact(c.expression))));
 item.E=expectedSources.length===1&&compact(item.ui.expressions).includes(compact(c.expression));
 const nodes=state.analysis.stateatom?.runtime?.nodes||[];
 item.observedValues=nodes.filter(n=>n.status==='Observed'&&n.kind!=='target'&&typeof n.expression==='string'&&c.valueNames.some(x=>n.expression.includes(x))&&['string','number','boolean'].includes(typeof n.value)).map(n=>({kind:n.kind,expression:n.expression,value:n.value,scope:n.scope,status:n.status,uiVisible:item.ui.operands.includes(n.expression+' = '+JSON.stringify(n.value))}));
 item.V=state.analysis.stateatom?.runtime?.status==='Observed'&&item.observedValues.some(n=>n.uiVisible);
 item.I=false;
 if(item.E){const source=expectedSources[0],index=state.analysis.sources.indexOf(source);
 const resetId=crypto.randomUUID();await writeFile(runtime+'/editor-reset.tmp',JSON.stringify({id:resetId}));await rename(runtime+'/editor-reset.tmp',runtime+'/editor-reset.json');
 await waitFor(async()=>JSON.parse(await readFile(runtime+'/editor-reset-done.json','utf8')).id===resetId);
 item.editorPrecondition='All editors closed by isolated test host before this click';
 const beforeAudit=(await readFile(runtime+'/ide-audit.jsonl','utf8').catch(()=>'' )).trim().split('\n').filter(Boolean).length;await panel.getByRole('button',{name:'Open in IDE'}).nth(index).click();const audit=await waitFor(async()=>{const text=await readFile(runtime+'/ide-audit.jsonl','utf8');return text.trim().split('\n').filter(Boolean).slice(beforeAudit).map(JSON.parse).findLast(a=>a.file===root+'/'+source.file&&a.line===source.line&&a.column===source.column&&a.endLine===source.endLine&&a.endColumn===source.endColumn);});item.ideAudit=audit;item.auditOffsetBeforeClick=beforeAudit;item.I=true;}
 const partial=noIDE||mode==='A'||(stack==='vue'&&(c.id.startsWith('row-')||(independent&&c.id!=='remaining-strong-variant')));
 item.expectedEvidence={T:true,E:!noIDE,V:!partial,I:!noIDE};
 item.regression=Object.entries(item.expectedEvidence).some(([key,value])=>item[key]!==value);
 check(name+' mode',item.ui.mode===(noIDE?'Basic':mode==='B'?'Instrumented':'Source-linked'));
 check(name+' snapshot freshness',item.ui.freshness.includes('Not live')&&item.ui.freshness.includes('Snapshot at'));
 if(mode==='A')check(name+' no fabricated operands',await panel.locator('#operands li').count()===0);
 if(mode==='B'&&c.id==='P4')check(name+' skipped branch absent',!item.ui.operands.split('\n').some(line=>line.startsWith('canConfirm =')));
 item.status=item.T&&item.E&&item.V&&item.I?'PASS':'PARTIAL';
 item.runtimeStatus=state.analysis.stateatom?.runtime?.status;item.fullPathNotCriterion=state.analysis.stateatom?.runtime?.fullPath;
 await writeFile(out+'/'+name+'-state.json',JSON.stringify(state,null,2));
 await panel.locator('#atom-summary').scrollIntoViewIfNeeded();await panel.screenshot({path:out+'/'+name+'-inspector.png'});
 await page.screenshot({path:out+'/'+name+'-page.png'});
 if(item.I&&(c.id==='first-label'||(stack==='react'&&mode==='B'&&c.id==='P4'))){const idePage=ide.ideBrowser.contexts().flatMap(c=>c.pages()).find(p=>p.url().includes('workbench'));if(idePage)await idePage.screenshot({path:out+'/'+name+'-ide.png'});}
 }catch(e){item.status='ERROR';item.error=e.stack;}
 result.cases.push(item);await persist();console.log(name,item.status,JSON.stringify({T:item.T,E:item.E,V:item.V,I:item.I}),item.error||'');return item;
}
async function closeApp(){const currentBrowser=browser,currentServer=server;browser=server=undefined;try{await currentBrowser?.context.close();}finally{await currentServer?.close();}}
async function panelTransitions({page,panel,tabId}){
 await panel.locator('#pick').click();await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();
 check('picker start clears previous snapshot before another element is selected',await panel.locator('#operands li').count()===0&&await panel.getByRole('button',{name:'Open in IDE'}).count()===0);
 check('picker keeps the selected property',await panel.locator('#property').inputValue()==='text');
 const box=await page.locator('#p4').boundingBox();await page.mouse.click(box.x+10,box.y+10);
 await waitFor(async()=>{const state=await rpc(panel,{op:'state',tabId});return state.selection?.id==='p4'&&state.selection?.property==='text'&&state.analysis;});
 await panel.locator('#selected').filter({hasText:/^#p4/}).waitFor();
 await panel.locator('#property').selectOption('disabled');
 await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();
 check('property change clears old scalar operands',await panel.locator('#operands li').count()===0);
 check('property change clears old independent observations',(await panel.locator('#atom-independent').textContent())==='');
 check('property change removes old source actions',await panel.getByRole('button',{name:'Open in IDE'}).count()===0);
 if(!await panel.locator('#selector').isVisible())await panel.locator('#selector-details > summary').click();
 await panel.locator('#selector').fill('#p4');await panel.locator('#inspect-selector').click();
 await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();
 check('new inspection after property change',/disabled = true/.test(await panel.locator('#selected').innerText()));
 const other=await page.context().newPage();await other.goto('http://127.0.0.1:4173/react/?other-tab');await other.locator('#p4').waitFor();
 await chooseTab(panel,'?other-tab');await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();
 check('tab switch clears previous target and source',(await panel.locator('#selected').innerText()).startsWith('Select an element')&&await panel.getByRole('button',{name:'Open in IDE'}).count()===0);
 check('tab switch clears previous operands and independent observations',await panel.locator('#operands li').count()===0&&(await panel.locator('#atom-independent').textContent())==='');
 await panel.locator('#tabs').selectOption(String(tabId));await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();
 check('return to original tab restores its labelled snapshot',(await panel.locator('#selected').innerText()).startsWith('#p4')&&(await panel.locator('#freshness').innerText()).includes('Not live'));
 await other.close();
 await panel.setViewportSize({width:390,height:844});await panel.evaluate(()=>scrollTo(0,0));
 check('390px panel has no horizontal overflow',await panel.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await panel.screenshot({path:out+'/panel-390.png'});
 await panel.setViewportSize({width:1280,height:900});await panel.evaluate(()=>scrollTo(0,0));
 await panel.screenshot({path:out+'/panel-desktop.png'});
}
async function navigationFreshness({page,panel,tabId}){
 const before=await rpc(panel,{op:'state',tabId});
 await page.reload();await page.locator('#p5').waitFor();
 await waitFor(async()=>(await panel.locator('#freshness').innerText()).startsWith('Stale'),3000);
 check('navigation automatically marks previous snapshot stale',true);
 check('navigation clears old source and operand display',await panel.getByRole('button',{name:'Open in IDE'}).count()===0&&await panel.locator('#operands li').count()===0);
 await panel.locator('#load').click();await panel.locator('#status').filter({hasText:/^OK$/}).waitFor();
 const after=await rpc(panel,{op:'state',tabId});
 check('reinspection after navigation records a new observation',after.selection?.observedAt>before.selection.observedAt&&after.run!==before.run&&after.selection?.page!==before.selection.page);
 check('reinspection after navigation recovers selected expression and values',(await panel.locator('#expressions').innerText()).includes('form.length < 3')&&(await panel.locator('#operands').innerText()).includes('form = ""'));
 await panel.screenshot({path:out+'/after-navigation-reinspection.png'});
}
try{
 result.sourceDigests=await fileDigests(root,sourceInputs);result.buildDigests=await fileDigests(root,buildInputs);
 const fixtureRoot=root+'/.runtime/todomvc';
 assert.equal((await readFile(fixtureRoot+'/REVISION','utf8')).trim(),todoRevision,'prepared TodoMVC revision');
 result.fixtureDigests=await fileDigests(fixtureRoot,fixtureEntries);
 assert.deepEqual(result.fixtureDigests,JSON.parse(await readFile(fixtureRoot+'/SOURCE_SHA256.json','utf8')),'TodoMVC source tree matches prepared archive');
 result.fixtureVersions={};
 for(const stack of ['react','vue'])for(const name of stack==='react'?['react','react-dom','react-router-dom']:['vue','vue-router'])result.fixtureVersions[stack+'/'+name]=JSON.parse(await readFile(fixtureRoot+'/examples/'+stack+'/node_modules/'+name+'/package.json','utf8')).version;
 ide=await startIDE(runtime,{logDir:out});
 if(!process.env.SHORT_ONLY_TODO){
 for(const mode of['B','A'])for(const stack of['react','vue']){
 const ctx=await setup(stack,mode);
 const cases=mode==='B'?[{id:'P1',selector:'#p1',property:'text',value:'13',expression:'shown',valueNames:['shown','allowance']},{id:'P2',selector:'#p2',property:'disabled',value:false,expression:'!eligible',valueNames:['eligible']},{id:'P4',selector:'#p4',property:'disabled',value:true,expression:'creditHold || !canConfirm',valueNames:['creditHold']},{id:'P5',selector:'#p5',property:'disabled',value:true,expression:'form.length < 3',valueNames:['form']},{id:'row-first',selector:'.row >> nth=0',property:'text',value:'12',expression:stack==='vue'?'props.row.rules.quota':'row.rules.quota',valueNames:['rules.quota'],picker:true},{id:'row-second',selector:'.row >> nth=1',property:'text',value:'77',expression:stack==='vue'?'props.row.rules.quota':'row.rules.quota',valueNames:['rules.quota'],picker:true}]:[{id:'P4',selector:'#p4',property:'disabled',value:true,expression:'creditHold || !canConfirm',valueNames:['creditHold']},{id:'P5',selector:'#p5',property:'disabled',value:true,expression:'form.length < 3',valueNames:['form']}];
 for(const c of cases)await inspect(ctx,c);
 if(mode==='B'&&stack==='react')await panelTransitions(ctx);
 if(mode==='B'){
 const h={stack,configuration:'B+IDE',inputValues:['','Alex',''],expected:[true,false,true],actual:[],inspections:[]};
 for(const [i,value]of h.inputValues.entries()){const previous=await ctx.panel.locator('#selected').innerText();await ctx.page.locator('#form').fill(value);if(i>0){check(stack+' edit retains labelled snapshot '+i,(await ctx.panel.locator('#selected').innerText())===previous&&(await ctx.panel.locator('#freshness').innerText()).includes('Not live'));}await waitFor(()=>ctx.page.locator('#p5').evaluate(e=>e.disabled).then(v=>v===h.expected[i]));const c=await inspect(ctx,{id:'form-hypothesis-'+i,selector:'#p5',property:'disabled',value:h.expected[i],expression:'form.length < 3',valueNames:['form'],refresh:i>0});h.actual.push(c.actual?.dom);h.inspections.push(c.name);}
 h.status=JSON.stringify(h.actual)===JSON.stringify(h.expected)&&h.inspections.every(n=>result.cases.find(c=>c.name===n)?.status==='PASS')?'PASS':'PARTIAL';result.hypotheses.push(h);
 if(stack==='react')await navigationFreshness(ctx);
 }
 await closeApp();
 }
 const basic=await setup('react','A',false,true);await inspect(basic,{id:'P4',selector:'#p4',property:'disabled',value:true,expression:'creditHold || !canConfirm',valueNames:['creditHold']});await closeApp();
 }
 for(const stack of['vue','react']){
 const ctx=await setup(stack,'B',true);
 for(const c of[{id:'first-label',selector:'.todo-list li:nth-child(1) label',property:'text',value:'Alpha short',expression:stack==='vue'?'todo.title':'title',valueNames:['title'],picker:true},{id:'remaining-count',selector:'.todo-count',property:'text',value:stack==='vue'?'1 item left':'1 item left!',expression:stack==='vue'?'remaining':'activeTodos.length',valueNames:stack==='vue'?['remaining']:['activeTodos.length']},{id:'second-label',selector:'.todo-list li:nth-child(2) label',property:'text',value:'Beta short',expression:stack==='vue'?'todo.title':'title',valueNames:['title'],picker:true}])await inspect(ctx,c);
 if(process.env.SHORT_COUNT_VARIANT!=='0'&&stack==='vue')await inspect(ctx,{id:'remaining-strong-variant',selector:'.todo-count strong',property:'text',value:'1',expression:'remaining',valueNames:['remaining']});
 await closeApp();
 }
 result.status=result.cases.some(c=>c.status==='ERROR'||c.regression)||result.checks.some(c=>c.status==='FAIL')?'CHECK_ERRORS':'COMPLETED_WITH_EXPLICIT_PARTIALS';
 if(result.status==='CHECK_ERRORS')process.exitCode=1;
}catch(e){result.errors.push(e.stack);result.status='BLOCKED';console.error(e);process.exitCode=1;}
finally{
 await closeApp().catch(e=>result.errors.push(e.stack));await ide?.close(false).catch(e=>result.errors.push(e.stack));
 try{
  result.sourceStable=JSON.stringify(result.sourceDigests)===JSON.stringify(await fileDigests(root,sourceInputs));
  result.buildStable=JSON.stringify(result.buildDigests)===JSON.stringify(await fileDigests(root,buildInputs));
  result.fixtureStable=JSON.stringify(result.fixtureDigests)===JSON.stringify(await fileDigests(root+'/.runtime/todomvc',fixtureEntries));
  assert.ok(result.sourceStable&&result.buildStable&&result.fixtureStable,'execution inputs remained unchanged');
 }catch(error){result.errors.push(error.stack);}
 if(result.health.some(h=>h.pageErrors.length||h.identity?.overlay)||result.errors.length){result.status='CHECK_ERRORS';process.exitCode=1;}
 await copyFile(runtime+'/ide-audit.jsonl',out+'/ide-audit.jsonl').catch(()=>{});
 await copyFile(runtime+'/host-complete.json',out+'/ide-host-complete.json').catch(()=>{});
 result.completedAt=new Date().toISOString();result.runtime=runtime;result.toolVersions={playwright:JSON.parse(await readFile(root+'/node_modules/playwright/package.json','utf8')).version};
 await persist();console.log(result.status,JSON.stringify(result.cases.reduce((a,c)=>(a[c.status]=(a[c.status]||0)+1,a),{})));
}
