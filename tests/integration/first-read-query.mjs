// SPDX-License-Identifier: Apache-2.0
// Native branch acquisition only. No product UI/readonly/full-path acceptance.
import {parse,parseExpression} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {createServer} from 'vite';
import {phaseConfig} from "../../scripts/inspection-server.mjs";import {root} from "../../scripts/vite-config.mjs";import {startBrowser} from "../../scripts/harness.mjs";import {fileDigests} from "../../scripts/short-loop-inputs.mjs";import {firstQueryHashes} from "../../src/first-read/query-contracts.mjs";
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
// Create new operational storage privately; existing permissions are never relaxed.
await mkdir(root+'/.runtime',{recursive:true,mode:0o700});
const tag=process.env.FIRST_READ_TAG||new Date().toISOString().replaceAll(/[:.]/g,'-');assert.match(tag,/^[a-zA-Z0-9_-]{1,100}$/);
const out=root+'/.runtime/first-read-runs/'+tag;await mkdir(root+'/.runtime/first-read-runs',{recursive:true});await mkdir(out);
const entries=['tests/integration',"src/first-read",'src/engine','tests/fixtures/inspection',"scripts/inspection-server.mjs",'scripts/harness.mjs','scripts/ide-runner.mjs','scripts/installed-helper.mjs','scripts/vite-config.mjs','scripts/short-loop-inputs.mjs','package.json','package-lock.json',...Object.keys(firstQueryHashes).map(f=>'node_modules/@tanstack/query-core/build/modern/'+f)];const before=await fileDigests(root,entries);let revision=null;try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
const result={schema:1,tag,revision,sourceArchive:revision===null,startedAt:new Date().toISOString(),inputs:before,checks:[],errors:[],fullPath:false,productUI:false,configuration:{firstReadBranchAcquisition:true,originalSourceUnchanged:true,react:'18.3.1 dev',query:'5.90.3',inspectorModuleSnapshot:true,applicationExpressionReplay:false,scope:'Eight pinned Query inputs and original callbacks/branch values only; code/effect/alias proof not supplied'}};
let server,browser;const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});};
async function close(){if(browser){await browser.context.close();browser=null;}if(server){await server.close();server=null;}}
async function mode(name){
 const enabled=name!=='off',cfg=phaseConfig('B',{reactHostProps:true,reactStateHandoffs:true,sourceWrites:true,writeAccessGuards:true,reactWriteAccessGuards:true,queryHandoffs:true,queryCallCensus:true,queryWriteAccessGuards:true,firstReadContracts:enabled});
 if(['listener','sharing','notify-config'].includes(name))cfg.plugins.push({name:'declared-first-read-'+name,enforce:'post',transform(code,id){if(!id.endsWith('/shared/cache.ts'))return;
  if(name==='listener')return{code:code+"\ncache.getQueryCache().subscribe(event=>{if(event.type==='updated'){event.query.state.data.rules.quota=12;document.documentElement.setAttribute('data-first-read-control','listener');}});",map:null};
  if(name==='sharing'){
   const ast=parse(code,{sourceType:'module'});let changed=0;
   traverse(ast,{NewExpression(p){if(!t.isIdentifier(p.node.callee,{name:'QueryClient'})||p.node.arguments.length)return;p.node.arguments=[parseExpression("({defaultOptions:{queries:{structuralSharing:(_old,data)=>{data.rules.quota=12;document.documentElement.setAttribute('data-first-read-control','sharing');return data;}}}})")];changed++;p.skip();}});assert.equal(changed,1);return{code:generate(ast).code,map:null};
  }
  return{code:code+"\nimport {notifyManager as __firstNotifyControl} from '@tanstack/query-core';__firstNotifyControl.setNotifyFunction(callback=>callback());document.documentElement.setAttribute('data-first-read-control','notify-config');",map:null};
 }});
 if(['functional-state','restoring-getter'].includes(name))cfg.plugins.push({name:'declared-first-read-'+name,enforce:'post',transform(code,id){if(!id.endsWith('/react/App.tsx'))return;
  const ast=parse(code,{sourceType:'module'});let changed=0;
  traverse(ast,{
   CallExpression(p){if(name!=='functional-state'||!t.isIdentifier(p.node.callee,{name:'setData'})||p.node.arguments.length!==1)return;p.node.arguments[0]=t.arrowFunctionExpression([],p.node.arguments[0]);changed++;p.skip();},
   VariableDeclarator(p){if(name!=='restoring-getter'||!t.isObjectPattern(p.node.id)||!p.node.id.properties.some(x=>t.isObjectProperty(x)&&t.isIdentifier(x.key,{name:'rules'})))return;
    p.parentPath.insertBefore(parse("const __restoringRules=data.rules;Object.defineProperty(data,'rules',{configurable:true,get(){Object.defineProperty(data,'rules',{configurable:true,writable:true,enumerable:true,value:__restoringRules});return {get quota(){document.documentElement.setAttribute('data-first-read-control','restoring-getter');return 12;}};}});").program.body);changed++;p.skip();}
  });assert.equal(changed,1);return{code:generate(ast).code,map:null};
 }});
 server=await createServer(cfg);await server.listen();server.phase2Plugin=cfg.plugins[1];browser=await startBrowser(out,name,false);result.browser=browser.context.browser()?.version();const page=await browser.context.newPage();page.on('pageerror',e=>result.errors.push(String(e)));
 if(name==='devtools')await page.addInitScript(()=>{window.__REACT_DEVTOOLS_GLOBAL_HOOK__={supportsFiber:true,inject(){return 1;},onCommitFiberRoot(){document.documentElement.setAttribute('data-first-read-control','devtools');}};});
 await page.goto('http://127.0.0.1:4173/react/');await page.locator('#p1').waitFor();
 const dom=await page.evaluate(()=>({p1:document.getElementById('p1').textContent,p2:document.getElementById('p2').disabled,p3:document.getElementById('p3').textContent,semantic:document.getElementById('semantics').textContent,control:document.documentElement.getAttribute('data-first-read-control')}));
 const branch=enabled?await page.evaluate(async()=>{const owned=await import('/@id/__x00__stateatom-first-read-query');return owned.firstQuerySnapshot();}):null;
 const alternate=enabled?await page.evaluate(async()=>{const other=await import('/@stateatom/first-read-query');return other.firstQuerySnapshot();}):null;
 const traces={};for(const[selector,property]of[['#p1','text'],['#p2','disabled']])traces[selector]=await page.locator(selector).evaluate((e,p)=>window.__STATEATOM__.snapshot(e.getAttribute('data-stateatom'),p,e),property);
 const probe=server.phase2Plugin.queryHandoffs,inputs=probe.records.map(r=>({file:r.file,sourceDigest:r.sourceDigest,outputDigest:r.outputDigest,firstReadCounts:r.firstReadCounts||null,counts:r.counts}));
 const reactInputs=server.phase2Plugin.reactHost.records.map(r=>({file:r.file,sourceDigest:r.sourceDigest,outputDigest:r.outputDigest,firstReadCounts:r.firstReadCounts||null}));
 const snapshot={dom,branch,alternate,traces,inputs,reactInputs,fullPath:false,readonlyEffects:'Unknown/Unsupported',sourceEffectProof:'Unknown/Unsupported',missing:'Reviewed alias/callback contracts, complete closed compiler/code history, read-specific receipts and product verifier not yet acquired'};
 await writeFile(out+'/'+name+'.json',JSON.stringify(snapshot,null,2));await close();return snapshot;
}
try{
 const off=await mode('off'),on=await mode('on');
 await check('unchanged original P1/P2/cache and getter/error semantics agree without and with branch acquisition',()=>{assert.deepEqual(on.dom,off.dom);assert.equal(on.dom.p1,'13');assert.equal(on.dom.p2,false);assert.equal(on.dom.p3,'15');assert.match(on.dom.semantic,/"count":1/);assert.match(on.dom.semantic,/"same":true/);});
 await check('all eight exact pinned Query inputs were actually transformed',()=>{assert.deepEqual(on.inputs.map(r=>r.file.split('/').at(-1)).sort(),Object.keys(firstQueryHashes).sort());assert(on.inputs.every(r=>r.firstReadCounts&&r.outputDigest));});
 await check('equal ledger code at another module URL cannot borrow the original module instance',()=>{assert.notEqual(on.branch.id,on.alternate.id);assert(on.branch.events.length>0);assert.equal(on.alternate.events.length,0);});
 await check('direct first-data updater and undefined previous Query are original branch observations',()=>{assert.equal(on.branch.status,'Observed');assert.equal(on.branch.overflow,false);assert(on.branch.events.some(r=>r.kind==='client'&&r.args[1].value===0));assert(on.branch.events.some(r=>r.kind==='updater'&&r.args[0].type==='object'&&r.args[1].type==='undefined'&&r.args[2].type==='undefined'));assert(on.branch.events.some(r=>r.kind==='sharing'&&r.args[0].type==='undefined'&&r.args[2].value==='undefined'));});
 await check('actual original notification callbacks are counted without fabricating native callee or readonly authority',()=>{const cache=on.branch.events.filter(r=>r.kind==='cache-notify'),query=on.branch.events.filter(r=>r.kind==='query-notify');assert.equal(cache.length,2);assert.equal(query.length,1);assert([...cache,...query].every(r=>r.args[2].value===0&&r.args[3].value==='Unknown/Unsupported'));assert.equal(on.branch.fullPath,false);});
 await check('original P1/P2 retain distinct read occurrences; only member receiver is acquired, destructuring receiver stays a candidate',()=>{
  const events=on.branch.events,parse=events.find(e=>e.kind==='parse'&&e.args[2].value?.endsWith(':exchange1'));assert(parse);
  const updater=events.find(e=>e.kind==='updater'&&e.args[0].id===parse.args[0].id);assert(updater);assert(updater.sequence>parse.sequence);
  const ids=[];for(const[selector,kind]of[['#p1','destructure'],['#p2','member']]){
   const trace=on.traces[selector],read=trace.nodes.find(n=>n.kind===kind&&n.origin?.pointer==='/rules/quota');assert(read);ids.push(read.id);
   const field=events.find(e=>e.kind===(kind==='destructure'?'field-receiver-candidate':'field')&&e.args[0].value===read.id),scope=events.find(e=>e.kind==='field-scope'&&e.args[0].value===read.id);assert(field);assert(scope);
   assert.equal(field.args[1].value,parse.args[0].id);assert.equal(field.args[1].value,read.origin.firstReadRootId);assert.equal(field.args[3].value,'/rules/quota');assert.equal(field.args[4].value,12);
   assert.equal(scope.args[1].value,trace.target.scope);assert.equal(scope.args[2].value,trace.page);assert.equal(scope.args[3].value,kind);assert.equal(scope.args[4].value,read.sourceDigest);
   assert.equal(trace.stateHandoffs[0].parsedObject.firstReadRootId,field.args[1].value);assert(field.sequence>updater.sequence);assert.equal(read.valueOrigin,'Unknown/Unsupported');
  }assert.notEqual(ids[0],ids[1]);
 });
 await check('pinned React mount/direct-action/eager/application sites share actual parsed identity without claiming foreign-exposure exclusion',()=>{
  const e=on.branch.events,parse=e.find(r=>r.kind==='parse'&&r.args[2].value?.endsWith(':exchange1')),root=parse.args[0].id,dispatch=e.find(r=>r.kind==='react-dispatch'&&r.args[0].id===root);assert(dispatch);
  const queue=dispatch.args[1].id,update=dispatch.args[2].id,mount=e.find(r=>r.kind==='react-mount'&&r.args[2].id===queue);assert.equal(mount.args[0].type,'null');
  const apply=e.find(r=>r.kind==='react-apply'&&r.args[3].id===update);assert(apply);assert.equal(apply.args[0].id,root);assert.equal(apply.args[2].id,queue);
  const reducer=e.find(r=>r.kind==='react-reducer'&&r.args[1].id===root);assert(reducer);assert.equal(reducer.args[0].type,'null');
  const eager=e.find(r=>r.kind==='react-eager'&&r.args[4].id===update);if(eager){assert.equal(eager.args[0].id,root);assert.equal(eager.args[2].id,root);}
  assert(e.some(r=>r.kind==='react-devtools-absent'));assert(!e.some(r=>r.kind==='react-devtools-present'));assert(on.reactInputs.find(r=>r.file.startsWith('react-dom/')).firstReadCounts);assert.equal(on.fullPath,false);
 });
 await check('only the first eligible App read region can be a candidate and both selected dependencies refer to its exact scope/root',()=>{
  const regions=on.branch.events.filter(e=>e.kind==='read-region');assert.equal(regions.length,1);const region=regions[0];
  const parse=on.branch.events.find(e=>e.kind==='parse'&&e.args[2].value?.endsWith(':exchange1'));assert.equal(region.args[0].id,parse.args[0].id);
  for(const t of Object.values(on.traces))assert.equal(region.args[1].value,t.target.scope);
 });
 const functional=await mode('functional-state');await check('actual functional updater returning the same parsed object remains unsupported direct-action ancestry',()=>{
  assert.equal(functional.dom.p1,off.dom.p1);assert.equal(functional.dom.p2,off.dom.p2);assert(functional.branch.events.some(e=>e.kind==='react-dispatch'&&e.args[0].type==='function'));
  for(const t of Object.values(functional.traces))assert(t.stateHandoffs.some(h=>h.parsedObject===null&&h.reason?.includes('Functional')));assert.equal(functional.fullPath,false);
 });
 const devtools=await mode('devtools');await check('actual DevTools Fiber callback is an explicit foreign-exposure refusal control despite unchanged P1/P2',()=>{
  assert.equal(devtools.dom.control,'devtools');assert.equal(devtools.dom.p1,off.dom.p1);assert(devtools.branch.events.some(e=>e.kind==='react-devtools-present'));assert(!devtools.branch.events.some(e=>e.kind==='react-devtools-absent'));assert.equal(devtools.fullPath,false);
 });
 const restoring=await mode('restoring-getter');await check('actual self-restoring getter preserves the original values but cannot fabricate an acquired destructuring receiver',()=>{
  assert.equal(restoring.dom.control,'restoring-getter');assert.equal(restoring.dom.p1,off.dom.p1);assert.equal(restoring.dom.p2,off.dom.p2);
  const read=restoring.traces['#p1'].nodes.find(n=>n.kind==='destructure'&&n.origin?.pointer==='/rules/quota');assert(read);
  assert(restoring.branch.events.some(e=>e.kind==='field-receiver-candidate'&&e.args[0].value===read.id));assert(!restoring.branch.events.some(e=>e.kind==='field'&&e.args[0].value===read.id));assert.equal(restoring.fullPath,false);
 });
 const listener=await mode('listener');await check('actual same-value cache listener producer stays distinct despite unchanged selected values',()=>{assert.equal(listener.dom.control,'listener');for(const k of ['p1','p2','p3','semantic'])assert.deepEqual(listener.dom[k],off.dom[k]);assert(listener.branch.events.some(r=>r.kind==='subscribe'));assert(listener.branch.events.filter(r=>r.kind==='cache-notify').some(r=>r.args[2].value>0));assert.equal(listener.fullPath,false);});
 const sharing=await mode('sharing');await check('actual same-value structuralSharing producer cannot be reported as absent callback',()=>{assert.equal(sharing.dom.control,'sharing');assert.equal(sharing.dom.p1,off.dom.p1);assert.equal(sharing.dom.p2,off.dom.p2);assert(sharing.branch.events.some(r=>r.kind==='client'&&r.args[1].value===1));assert(sharing.branch.events.some(r=>r.kind==='sharing'&&r.args[2].value==='function'));assert.equal(sharing.fullPath,false);});
 const configured=await mode('notify-config');await check('native notification configuration remains an explicit profile premise, even without changed selected scalar',()=>{assert.equal(configured.dom.control,'notify-config');assert.equal(configured.dom.p1,off.dom.p1);assert(configured.branch.events.some(r=>r.kind==='notify-config'));assert.equal(configured.fullPath,false);});
 await check('both original structures retain their own read shape and observed committed state, not a completed HTTP claim',()=>{const p1=on.traces['#p1'],p2=on.traces['#p2'];assert(p1.nodes.some(n=>n.kind==='destructure'&&n.origin?.pointer==='/rules/quota'));assert(p2.nodes.some(n=>n.kind==='member'&&n.origin?.pointer==='/rules/quota'));for(const t of[p1,p2]){assert.equal(t.commit.producer.status,'Observed');assert(t.stateHandoffs.some(h=>h.status==='Observed'&&h.parsedObject?.consumptionId));assert(t.nodes.filter(n=>n.origin).every(n=>n.valueOrigin==='Unknown/Unsupported'));}});
 result.status='PASS_BOUNDED_FIRST_READ_QUERY_BRANCHES';
}catch(e){result.status='FAIL';result.errors.push(String(e.stack||e));process.exitCode=1;}
finally{try{await close();}catch(e){result.errors.push('cleanup: '+e);}result.inputsStable=JSON.stringify(before)===JSON.stringify(await fileDigests(root,entries));if(!result.inputsStable||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out,result.errors);}
