// SPDX-License-Identifier: Apache-2.0
// Unmodified pinned ordinary app, isolated vendor derivative, not Atom support.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,realpath} from 'node:fs/promises';
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {build} from 'esbuild';
import {sha256 as sha} from '../../scripts/atom-package-receipt.mjs';
import {startBrowser} from '../../scripts/harness.mjs';
import {react19ExperimentProfile,transformPinnedReact19} from './vendor.mjs';
import {installReact19Experiment} from './observer.mjs';
import {installOrdinaryReducerAcquisition} from './ordinary-observer.mjs';
const root=process.cwd(),upstream='.runtime/todomvc',app=upstream+'/examples/react',packages=path.resolve(app,'node_modules');
const out='.artifacts/a02/ordinary-reducer/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
const json=async f=>JSON.parse(await readFile(f)),sourceFiles=await json(upstream+'/SOURCE_SHA256.json'),revision=(await readFile(upstream+'/REVISION','utf8')).trim();
assert.equal(revision,'ff43b02e59dfa604386bb382034b2cd07c2bcd8a');
for(const[f,h]of Object.entries(sourceFiles))assert.equal(sha(await readFile(upstream+'/'+f)),h,'Upstream source changed: '+f);
for(const name of['react','react-dom'])assert.equal((await json(packages+'/'+name+'/package.json')).version,react19ExperimentProfile.version);
const pinned=new Map();for(const[file,digest]of Object.entries(react19ExperimentProfile.files)){const f=await realpath(packages+'/'+file);assert.equal(sha(await readFile(f)),digest,file);pinned.set(f,file);}
const files=new Set(['experiments/react19-reducer/ordinary-run.mjs','experiments/react19-reducer/ordinary-observer.mjs','experiments/react19-reducer/observer.mjs','experiments/react19-reducer/vendor.mjs','tests/engine/react19-ordinary.test.mjs','tests/engine/react19-reducer.test.mjs','tests/engine/react19-reducer-observer.test.mjs','scripts/harness.mjs','scripts/owned-ide-endpoint.mjs','scripts/vite-config.mjs','scripts/atom-package-receipt.mjs','package.json','package-lock.json','docs/superpowers/plans/2026-10-23-a02-ordinary-reducer-acquisition.md',upstream+'/SOURCE_SHA256.json',upstream+'/REVISION',app+'/package.json',app+'/package-lock.json',...Object.keys(sourceFiles).map(f=>upstream+'/'+f)]);
const outputs={},transforms=[];
for(const mode of['original','observed']){
  const plugin={name:'exact-isolated-react19-sites',setup(b){b.onLoad({filter:/[\\/]cjs[\\/](react|react-dom-client)\.development\.js$/},async args=>{const file=pinned.get(args.path);if(!file)return;const transformed=transformPinnedReact19(await readFile(args.path,'utf8'),file);transforms.push({...transformed,code:undefined,file});return{contents:transformed.code,loader:'js',resolveDir:path.dirname(args.path)};});}};
  const built=await build({entryPoints:[app+'/src/index.js'],outfile:path.resolve(out,mode+'.js'),bundle:true,write:false,metafile:true,format:'iife',platform:'browser',target:'es2022',jsx:'automatic',loader:{'.js':'jsx'},legalComments:'inline',define:{'process.env.NODE_ENV':'"development"'},plugins:mode==='observed'?[plugin]:[]});
  outputs[mode]={};for(const f of built.outputFiles){const name=path.basename(f.path);assert([mode+'.js',mode+'.css'].includes(name));outputs[mode][name]=Buffer.from(f.contents);await writeFile(out+'/'+name,f.contents);}
  assert(outputs[mode][mode+'.js']);assert(outputs[mode][mode+'.css']);await writeFile(out+'/'+mode+'-metafile.json',JSON.stringify(built.metafile,null,2));for(const f of Object.keys(built.metafile.inputs))files.add(f);
}
assert.equal(transforms.length,2);assert(transforms.every(t=>t.nativeVersionAdmitted));
const inputHashes=async()=>Object.fromEntries(await Promise.all([...files].sort().map(async f=>[f,sha(await readFile(f))]))),before=await inputHashes();
const phases=['equal','same','changed','filtered','stopped'],caseNames=[...['original','off','on'].flatMap(mode=>phases.map(phase=>mode+' visible '+phase)),'on exact equal-instance native ancestor queues without oracle','on same-value edit advances actual reducer result/revision','on different edit retains shared queue without row property-origin claim','on detached native host refused after real toggle/filter','on stop removes witness while app continues','off observer never supplies a witness','original/off/on visible outputs agree'];
const registration={schema:'stateatom.ordinary-reducer-registration/1',registeredAt:new Date().toISOString(),browserNotStarted:true,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),upstream:{revision,sourceFiles},configuration:{modes:['original','off','on'],originalApplicationSourceUnchanged:true,jsx:'automatic',development:true,withExtension:false,chromiumSandbox:true,extraArguments:[],consumerOracle:false,scope:'Native committed reducer ancestors only; selected-property producer/ownership/prop transfer Unknown',productReact19Support:false,fullPath:false},expectedCases:caseNames,inputsBefore:before,bundles:Object.fromEntries(Object.entries(outputs).flatMap(([mode,entries])=>Object.entries(entries).map(([name,bytes])=>[name,sha(bytes)]))),transforms};
await writeFile(out+'/registered-before-browser.json',JSON.stringify(registration,null,2),{flag:'wx'});
const result={schema:'stateatom.ordinary-reducer-acquisition/1',status:'RUNNING',registration:out+'/registered-before-browser.json',configuration:registration.configuration,checks:[],runs:[],errors:[],console:[],A02Complete:false};
const check=async(name,fn)=>{assert(caseNames.includes(name),'Unregistered case');assert(!result.checks.some(c=>c.name===name),'Duplicate case');await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
let server,browser,currentPage;
try{
  server=createServer((req,res)=>{const u=new URL(req.url,'http://127.0.0.1'),mode=u.searchParams.get('mode');if(u.pathname==='/'){if(!['original','off','on'].includes(mode)){res.writeHead(400).end();return;}const bundle=mode==='original'?'original':'observed';res.setHeader('content-type','text/html; charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><title>Pinned ordinary app acquisition experiment</title><link rel="stylesheet" href="/'+bundle+'.css"><div id="root"></div><script src="/'+bundle+'.js"></script>');return;}
    if(u.pathname==='/favicon.ico'){res.writeHead(204).end();return;}const name=u.pathname.slice(1),bytes=Object.values(outputs).map(x=>x[name]).find(Boolean);if(!bytes){res.writeHead(404).end();return;}res.setHeader('content-type',name.endsWith('.js')?'text/javascript':'text/css');res.end(bytes);});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const origin='http://127.0.0.1:'+server.address().port;
  browser=await startBrowser(out,'ordinary-browser',false);result.browser=browser.context.browser().version();
  for(const mode of['original','off','on']){
    const page=await browser.context.newPage();currentPage=page;page.on('pageerror',e=>result.errors.push({mode,message:String(e)}));page.on('console',m=>{if(['error','warning'].includes(m.type()))result.console.push({mode,type:m.type(),text:m.text()});});
    if(mode!=='original')await page.addInitScript({content:'('+installReact19Experiment.toString()+')('+JSON.stringify({enabled:mode==='on'})+');('+installOrdinaryReducerAcquisition.toString()+')();'});
    await page.goto(origin+'/?mode='+mode);const add=page.getByRole('textbox',{name:'New Todo Input'}),labels=page.locator('[data-testid="todo-item-label"]');await add.waitFor();
    const run={mode,samples:{}};result.runs.push(run);
    const sample=async phase=>{const value={texts:await labels.allTextContents(),nodes:[]};for(let i=0;i<await labels.count();i++)value.nodes.push(await labels.nth(i).evaluate(node=>globalThis.__R19_ORDINARY__?.snapshot(node)??null));if(mode!=='original')value.ledger=await page.evaluate(()=>globalThis.__R19_EXPERIMENT__.all());run.samples[phase]=value;await writeFile(out+'/'+mode+'-'+phase+'.json',JSON.stringify(value,null,2));return value;};
    const visible=async(phase,texts)=>{await page.waitForFunction(expected=>JSON.stringify([...document.querySelectorAll('[data-testid="todo-item-label"]')].map(x=>x.textContent))===JSON.stringify(expected),texts);const s=await sample(phase);await check(mode+' visible '+phase,()=>assert.deepEqual(s.texts,texts));return s;};
    for(let i=0;i<2;i++){await add.fill('SAME');await add.press('Enter');}const equal=await visible('equal',['SAME','SAME']);
    await labels.first().dblclick();const edit=page.getByRole('textbox',{name:'Edit todo',exact:true});await edit.fill('SAME');await edit.press('Enter');await edit.waitFor({state:'detached'});const same=await visible('same',['SAME','SAME']);
    await labels.first().dblclick();await edit.fill('CHANGED');await edit.press('Enter');await edit.waitFor({state:'detached'});const changed=await visible('changed',['CHANGED','SAME']);
    const oldNode=mode==='on'?await labels.first().elementHandle():null;
    await page.locator('[data-testid="todo-item-toggle"]').first().check();await page.locator('a[href="#/active"]').click();const filtered=await visible('filtered',['SAME']);
    if(mode==='on'){
      const common=equal.nodes[0].ancestors.filter(a=>a.updateOriginStatus==='Observed'&&equal.nodes[1].ancestors.some(b=>a.queueId===b.queueId));assert.equal(common.length,1,'Expected one observed native reducer queue shared by the two selected ancestors');const queue=common[0].queueId,find=s=>s.nodes[0].ancestors.find(a=>a.queueId===queue);
      await check('on exact equal-instance native ancestor queues without oracle',()=>{assert.equal(equal.nodes[0].status,'Observed');assert.equal(equal.nodes[1].status,'Observed');assert.notEqual(equal.nodes[0].nodeId,equal.nodes[1].nodeId);assert.equal(equal.ledger.oracleResults.length,0);assert(find(equal).updateId);});
      await check('on same-value edit advances actual reducer result/revision',()=>{assert.equal(find(same).queueId,queue);assert.notEqual(find(same).resultId,find(equal).resultId);assert.notEqual(find(same).revisionId,find(equal).revisionId);assert.notEqual(find(same).updateId,find(equal).updateId);});
      await check('on different edit retains shared queue without row property-origin claim',()=>{assert.notEqual(find(changed).resultId,find(same).resultId);for(const phase of[equal,same,changed])for(const n of phase.nodes){assert.equal(n.selectedPropertyOrigin,'Unknown/Unsupported');assert.equal(n.stateToProp,'Unknown/Unsupported');assert.equal(n.fieldOwnership,'Unknown/Unsupported');assert.equal(n.fullPath,false);}assert.equal(changed.ledger.oracleResults.length,0);});
      await check('on detached native host refused after real toggle/filter',async()=>{assert.equal(await oldNode.evaluate(node=>globalThis.__R19_ORDINARY__.snapshot(node).status),'Unknown/Unsupported');assert.equal(filtered.nodes[0].status,'Observed');});await oldNode.dispose();
    }
    if(mode!=='original')await page.evaluate(()=>globalThis.__R19_EXPERIMENT__.stop());await add.fill('AFTER_STOP');await add.press('Enter');const stopped=await visible('stopped',['SAME','AFTER_STOP']);
    if(mode==='on')await check('on stop removes witness while app continues',()=>{for(const n of stopped.nodes)assert.equal(n.status,'Unknown/Unsupported');});
    if(mode==='off')await check('off observer never supplies a witness',()=>{for(const s of Object.values(run.samples))for(const n of s.nodes)assert.equal(n.status,'Unknown/Unsupported');});
    await page.close();currentPage=null;
  }
  await check('original/off/on visible outputs agree',()=>{for(const phase of phases)for(const run of result.runs.slice(1))assert.deepEqual(run.samples[phase].texts,result.runs[0].samples[phase].texts);});
  assert.equal(result.errors.length,0,JSON.stringify(result.errors));assert.equal(result.console.length,0,JSON.stringify(result.console));assert.equal(result.checks.length,caseNames.length);result.status='PASS_ORDINARY_NATIVE_REDUCER_ANCESTORS_NOT_PROPERTY_LINEAGE';
}catch(error){result.status='INCOMPLETE_ORDINARY_REDUCER_ACQUISITION_NOT_A02';result.errors.push(String(error.stack||error));process.exitCode=1;if(currentPage)await currentPage.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}
finally{await browser?.context.close().catch(e=>result.errors.push('browser cleanup '+String(e)));if(server)await new Promise(resolve=>server.close(resolve));result.inputsAfter=await inputHashes();result.inputsUnchanged=JSON.stringify(result.inputsAfter)===JSON.stringify(before);if(!result.inputsUnchanged){result.status='SOURCE_DRIFT_INVALID';process.exitCode=1;}result.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log('STATEATOM_ORDINARY_REDUCER_RESULT '+JSON.stringify({file:out+'/results.json',status:result.status,checks:result.checks.length,errors:result.errors}));}
