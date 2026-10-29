// SPDX-License-Identifier: Apache-2.0
// Frozen316 semantic measurement only; no owned/native lineage issuance.
import assert from 'node:assert/strict';import {build} from 'esbuild';import http from 'node:http';
import {mkdir,readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {gzipSync} from 'node:zlib';import {pathToFileURL} from 'node:url';import {tmpdir} from 'node:os';
import {materializeListToolchain} from '../../src/engine/list-toolchain.mjs';import {listFunctionRanges,listFunctionCounts} from '../helpers/list-function-counts.mjs';import {startBrowser} from '../../scripts/harness.mjs';
const cumulative=process.argv.includes('--complete-interval-counts');
const corrected=process.argv.includes('--initial-parent-proof');
const diagnostic=process.argv.includes('--diagnose-coverage');
const root=process.cwd(),out=root+'/.artifacts/a02/selected-list-semantics/'+new Date().toISOString().replace(/[:.]/g,'-'),sha=b=>createHash('sha256').update(b).digest('hex');await mkdir(out,{recursive:true});
const result={schema:'stateatom.list-semantic-parity/1',case:cumulative?'docs/completion/319-a02-complete-counter-interval.md':corrected?'docs/completion/318-a02-initial-function-count-proof.md':diagnostic?'docs/completion/317-a02-native-counter-diagnostic.md':'docs/completion/316-a02-current-semantic-case.md',out,phases:[],status:'INCOMPLETE',fullA02:false,profiled:true};
const roles=['todoReducer','App','Main','Item','Footer','Header','Input','addItem','toggleItem','removeItem','updateItem','commitEdit','handleDoubleClick','handleKeyDown','handleBlur','visibleTodos','activeTodos'];
const renamed={todoReducer:'reduceRecords',App:'Scene',Main:'Board',Item:'TaskRow',Footer:'Summary',Header:'EntryBox',Input:'TextEntry',addItem:'createRecord',updateItem:'renameRecord',visibleTodos:'visibleRecords',activeTodos:'activeRecords'};
const families=[{name:'original-source',workspace:'/tmp/stateatom-selected-consumer-hs1Lmc',record:'2026-10-29T06-21-25-852Z'},{name:'renamed-source',workspace:'/tmp/stateatom-heldout-consumer-etb3uM',record:'2026-10-29T06-40-03-099Z'}];
let server,tools,browser;
try{
 const prepared=[];
 for(const family of families){
  const installed=family.workspace+'/node_modules/@stateport/vite-plugin';
  tools=await materializeListToolchain(await readFile(installed+'/dist/selected-list/runtime.json.gz'),tmpdir());
  const {buildListFieldCompilation}=await import(pathToFileURL(tools.root+'/src/engine/list-field-compilation.mjs'));
  const source=family.name==='renamed-source'?(await import('../helpers/selected-list-held-out.mjs')).heldOutSource:{appRoot:'app',entry:'src/index.js',root:{file:'src/todo/app.jsx',export:'App'},field:'title',sources:['src/todo/app.jsx','src/todo/reducer.js','src/todo/components/main.jsx','src/todo/components/item.jsx','src/todo/components/footer.jsx']};
  const on=await buildListFieldCompilation({...source,projectRoot:family.workspace,toolRoot:tools.root}),record=root+'/.artifacts/a02/selected-list-route/'+family.record,prior=JSON.parse(await readFile(record+'/manifest.json'));
  assert.equal(sha(on.code),prior.bundle.digest,'recreated installed On bytes');assert.deepEqual(on.assets.map(a=>a.digest),prior.assets.map(a=>a.digest),'recreated installed CSS');
  const original=await build({bundle:true,write:false,metafile:true,preserveSymlinks:true,platform:'browser',format:'iife',target:'chrome153',define:{'process.env.NODE_ENV':'"development"'},jsx:'automatic',jsxDev:true,sourcemap:false,minify:false,legalComments:'inline',charset:'utf8',tsconfigRaw:{},absWorkingDir:family.workspace+'/app',entryPoints:['src/index.js'],outdir:'unused-original-output',loader:{'.js':'jsx'}});
  const code=original.outputFiles.find(f=>f.path.endsWith('.js')).text,assets=original.outputFiles.filter(f=>f.path.endsWith('.css')).map(f=>({code:f.text,digest:sha(f.text)}));
  const {stateatomSelectedList}=await import(pathToFileURL(installed+'/dist/selected-list/plugin.mjs')),off=stateatomSelectedList({enabled:false});off.configResolved({root:family.workspace});await off.configureServer({});assert.equal(off.selectedListSession,null);await off.closeBundle();
  const names=Object.fromEntries(roles.map(role=>[family.name==='renamed-source'?renamed[role]||role:role,role]));
  for(const phase of ['original','off','on']){const js=phase==='on'?on.code:code,css=phase==='on'?on.assets:assets,id=family.name+'-'+phase,dir=out+'/'+id;await mkdir(dir);await writeFile(dir+'/bundle.js',js);for(const asset of css)await writeFile(dir+'/'+asset.digest+'.css',asset.code);prepared.push({id,family:family.name,phase,code:js,assets:css,ranges:listFunctionRanges(js,names),digest:sha(js)});}
  await tools.close();tools=null;
 }
 await writeFile(out+'/frozen-inputs.json',JSON.stringify({case:sha(await readFile(result.case)),driver:sha(await readFile(new URL(import.meta.url))),counter:sha(await readFile(root+'/tests/helpers/list-function-counts.mjs')),inputs:prepared.map(({id,digest,ranges,assets})=>({id,digest,ranges,assets:assets.map(a=>a.digest)}))},null,2));
 server=http.createServer((req,res)=>{const [_,id,file]=String(req.url).split('/'),p=prepared.find(p=>p.id===id);if(!p){res.writeHead(404).end();return;}res.setHeader('Cache-Control','no-store');if(file==='bundle.js'){res.setHeader('Content-Type','text/javascript');res.end(p.code);return;}const css=p.assets.find(a=>file===a.digest+'.css');if(css){res.setHeader('Content-Type','text/css');res.end(css.code);return;}if(file){res.writeHead(404).end();return;}res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta charset="utf-8">'+p.assets.map(a=>'<link rel="stylesheet" href="/'+id+'/'+a.digest+'.css">').join('')+'<div id="root"></div><script src="/'+id+'/bundle.js"></script>');});await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));
 for(const preparedPhase of diagnostic?prepared.slice(0,1):prepared){
  const {id,family,phase,ranges}=preparedPhase,p={id,family,phase,samples:[],counterEvidence:{},errors:[]};result.phases.push(p);browser=await startBrowser(out,id,false);const page=await browser.context.newPage(),cdp=await browser.context.newCDPSession(page),url='http://127.0.0.1:'+server.address().port+'/'+id;
  page.on('pageerror',error=>p.errors.push(error.message));await cdp.send('Profiler.enable');await cdp.send('Profiler.startPreciseCoverage',{callCount:true,detailed:false});await page.goto(url);await page.getByLabel('New Todo Input').waitFor();
  const labels=()=>page.locator('[data-testid="todo-item-label"]');
  async function sample(name){
   const outputs=await page.locator('[data-testid="todo-item"]').evaluateAll(rows=>rows.map(row=>({text:row.querySelector('[data-testid="todo-item-label"]').textContent,completed:row.querySelector('[data-testid="todo-item-toggle"]').checked})));
   if(cumulative){p.samples.push({name,outputs});return;}
   const coverage=await cdp.send('Profiler.takePreciseCoverage');await writeFile(out+'/'+id+'/'+name+'-coverage.json.gz',gzipSync(JSON.stringify(coverage)));let counts;const evidence={};try{counts=listFunctionCounts(coverage,url+'/bundle.js',ranges,{initial:corrected&&name==='initial',evidence});p.counterEvidence[name]=evidence;}catch(error){if(!diagnostic)throw error;counts={status:'Unknown',reason:error.message};}p.samples.push({name,outputs,counts});
  }
  await sample('initial');
  const input=page.getByLabel('New Todo Input');for(let i=0;i<2;i++){await input.fill('same');await input.press('Enter');await labels().nth(i).waitFor();}await sample('created');
  if(diagnostic){await cdp.send('Profiler.stopPreciseCoverage');await browser.context.close();browser=null;p.browserClosed=true;await writeFile(out+'/'+id+'/results.json',JSON.stringify(p,null,2));break;}
  async function edit(value){await labels().first().dblclick();const editor=page.getByLabel('Edit todo');await editor.fill(value);await editor.press('Enter');await editor.waitFor({state:'detached'});}
  await edit('changed');await sample('changed');await edit('changed');await sample('same-value');
  await page.locator('[data-testid="todo-item-toggle"]').first().check();await sample('toggled');await page.getByRole('link',{name:'Active',exact:true}).click();await labels().filter({hasText:'changed'}).waitFor({state:'detached'});await sample('filtered');
  await page.getByRole('link',{name:'All',exact:true}).click();await labels().filter({hasText:'changed'}).waitFor();await sample('all');await page.locator('[data-testid="todo-item"]').first().hover();await page.locator('[data-testid="todo-item-button"]').first().click();await labels().filter({hasText:'changed'}).waitFor({state:'detached'});await sample('removed');
  await page.locator('[data-testid="todo-item-toggle"]').first().check();await page.getByRole('button',{name:'Clear completed',exact:true}).click();await labels().waitFor({state:'detached'});await sample('cleared');assert.deepEqual(p.errors,[]);
  if(phase!=='on')assert.equal(await page.evaluate(()=>typeof window.__STATEATOM__),'undefined');
  if(cumulative){const coverage=await cdp.send('Profiler.takePreciseCoverage');await writeFile(out+'/'+id+'/complete-coverage.json.gz',gzipSync(JSON.stringify(coverage)));const evidence={};p.completeCounts=listFunctionCounts(coverage,url+'/bundle.js',ranges,{evidence});p.counterEvidence.complete=evidence;}
  await cdp.send('Profiler.stopPreciseCoverage');await browser.context.close();browser=null;p.browserClosed=true;await writeFile(out+'/'+id+'/results.json',JSON.stringify(p,null,2));console.log('PASS phase',id);
 }
 if(!diagnostic)for(const family of families){const phases=result.phases.filter(p=>p.family===family.name);assert.deepEqual(phases[1].samples,phases[0].samples,family.name+' Off parity');assert.deepEqual(phases[2].samples,phases[0].samples,family.name+' On parity');if(cumulative){assert.deepEqual(phases[1].completeCounts,phases[0].completeCounts,family.name+' Off complete counts');assert.deepEqual(phases[2].completeCounts,phases[0].completeCounts,family.name+' On complete counts');}}
 result.status=diagnostic?'DIAGNOSTIC_ONLY_NO_ACCEPTANCE':'PASS_CURRENT_COMPILED_SEMANTICS';
}catch(error){result.error=String(error.stack||error);process.exitCode=1;}
finally{await browser?.context.close().catch(()=>{});await tools?.close().catch(()=>{});if(server)await new Promise(r=>{server.close(r);server.closeAllConnections?.();});result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify({out,status:result.status,error:result.error||null}));}
