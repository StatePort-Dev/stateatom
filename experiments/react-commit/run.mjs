// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {instrumentScript} from "../../src/engine/plugin.mjs";
import {execFileSync} from 'node:child_process';
import {startServer} from "../../scripts/inspection-server.mjs";
import {startBrowser,waitFor} from "../../scripts/harness.mjs";
import {fileDigests} from "../../scripts/short-loop-inputs.mjs";
const tag=process.env.COMMIT_TAG||new Date().toISOString().replaceAll(/[:.]/g,'-');
assert.match(tag,/^[a-zA-Z0-9_-]+$/);
const root=new URL("../../",import.meta.url).pathname,out=root+'.runtime/react-commit-runs/'+tag;
await mkdir(root+'.runtime/react-commit-runs',{recursive:true});await mkdir(out,{recursive:false});
const inputs=['src/engine','tests/fixtures/inspection',"scripts/inspection-server.mjs",'scripts/harness.mjs','scripts/vite-config.mjs','scripts/short-loop-inputs.mjs','package.json','package-lock.json',"experiments/react-commit/run.mjs"];
const digests=await fileDigests(root,inputs),result={schema:1,tag,revision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),configuration:'React dev, opt-in reactCommit, native browser; no extension/IDE claim',startedAt:new Date().toISOString(),inputs:digests,checks:[],errors:[]};
let server,browser;
async function check(name,fn){await fn();result.checks.push({name,status:'PASS'});}
try{
 server=await startServer('B',{reactCommit:true});
 browser=await startBrowser(out,'browser',false);
 result.browser=browser.context.browser()?.version();
 const page=await browser.context.newPage();
 page.on('pageerror',e=>result.errors.push(String(e)));
 const measuredStart=performance.now();await page.goto('http://127.0.0.1:4173/react/');await page.locator('#p1').waitFor();result.pluginOnReadyMs=performance.now()-measuredStart;
 const snapshot=async(selector,property)=>page.locator(selector).first().evaluate((e,p)=>window.__STATEATOM__.snapshot(e.getAttribute('data-stateatom'),p,e),property);
 for(const [selector,property,pointer] of [['#p2','disabled','/rules/quota'],['#p1','text','/rules/quota']]){
  await check(selector+' ref-associated JSX fragment and exact parsed field; final producer unknown',async()=>{
   const trace=await snapshot(selector,property);await writeFile(out+'/'+selector.slice(1)+'.json',JSON.stringify(trace,null,2));
   (result.traceStats||={})[selector]={closureNodes:trace.nodes.length,exportBytes:Buffer.byteLength(JSON.stringify(trace)),retention:trace.retention};
   assert.equal(trace.commit?.status,'Observed');assert.equal(trace.commit.targetId,trace.target.id);
   assert(trace.nodes.some(n=>n.origin?.pointer===pointer));assert.equal(trace.commit.marker,await page.locator(selector).getAttribute('data-stateatom'));
  });
 }
 await check('two Row occurrences remain distinct',async()=>{const a=await snapshot('.row:first-of-type','text');const b=await snapshot('.row:last-of-type','text');assert.notEqual(a.target.scope,b.target.scope);assert.notEqual(a.commit.targetId,b.commit.targetId);});
 await page.screenshot({path:out+'/original.png'});
 await page.goto('http://127.0.0.1:4173/react/commit-controls.html');await page.waitForFunction(()=>window.commitControls);
 const initial=await snapshot('#controlled','disabled');assert.equal(initial.commit.status,'Observed');
 result.semanticBefore=await page.evaluate(()=>window.commitControls.events());
 result.refIntrospectionOn=await page.locator('#observed-ref').textContent();
 await check('retained first JSX cannot bind discarded second equal-value execution',async()=>{const trace=await snapshot('#retained-first','disabled');assert.equal(trace.commit.status,'Observed');assert(trace.nodes.some(n=>n.expression==='i'&&n.value===0));assert(!trace.nodes.some(n=>n.expression==='i'&&n.value===1));await writeFile(out+'/retained-first.json',JSON.stringify(trace,null,2));});
 await check('user ref and JSX spread retain explicit unsupported commit boundary',async()=>{assert.equal((await snapshot('#user-ref','text')).commit.status,'Unknown/Unsupported');assert.equal((await snapshot('#spread','text')).commit.status,'Unknown/Unsupported');});
 await check('equal-value cloneElement cannot establish final property producer',async()=>{const trace=await snapshot('#cloned','disabled');assert.equal(trace.commit.status,'Observed');assert.equal(trace.commit.producer.status,'Unknown/Unsupported');assert.equal(trace.status,'Unknown/Unsupported');await writeFile(out+'/clone-boundary.json',JSON.stringify(trace,null,2));});
 await check('StrictMode discarded same-value render does not replace committed evaluation',async()=>{
  await page.evaluate(()=>window.commitControls.suspend());
  await waitFor(async()=>page.evaluate(()=>window.commitControls.events().length).then(n=>n>result.semanticBefore.length));
  const suspended=await snapshot('#controlled','disabled');assert.equal(suspended.commit.status,'Observed');assert.equal(suspended.target.id,initial.target.id);assert.equal(suspended.commit.commitId,initial.commit.commitId);
  const scopes=await page.evaluate(()=>{const e=document.querySelector('#controlled'),s=window.__STATEATOM__.snapshot(e.getAttribute('data-stateatom'),'disabled',e);return s;});
  await writeFile(out+'/suspended.json',JSON.stringify(scopes,null,2));
  await page.evaluate(()=>window.commitControls.resume());await page.locator('#stage').filter({hasText:'2'}).waitFor();
  const resumed=await snapshot('#controlled','disabled');assert.equal(resumed.commit.status,'Observed');assert.notEqual(resumed.target.id,initial.target.id);assert.notEqual(resumed.commit.commitId,initial.commit.commitId);
  result.semanticAfterResume=await page.evaluate(()=>window.commitControls.events());
 });
 await check('independent roots remain separate even with equal values',async()=>{const a=await snapshot('#stage','text'),b=await snapshot('#other-value','text');assert.equal(b.commit.status,'Observed');assert.notEqual(a.commit.rootId,b.commit.rootId);});
 await check('duplicate execution marker is explicitly unsupported',async()=>{assert.equal((await snapshot('.duplicate','text')).commit.status,'Unknown/Unsupported');});
 await check('later uncommitted evaluation with same marker/value does not override commit',async()=>{
  const before=await snapshot('#controlled','disabled');
  await page.locator('#controlled').evaluate(e=>{const o=window.__STATEATOM__,s=o.snapshot(e.getAttribute('data-stateatom'),'disabled',e);o.target(s.target,s.target.scope,()=>false);});
  assert.equal((await snapshot('#controlled','disabled')).target.id,before.target.id);
 });
 await check('same-value DOM mutation invalidates old commit',async()=>{await page.locator('#other-value').evaluate(e=>e.textContent=e.textContent);assert.equal((await snapshot('#other-value','text')).commit.status,'Unknown/Unsupported');});
 await check('foreign commit cannot legitimize an imperatively copied marker',async()=>{await page.locator('#controlled').evaluate(e=>{const forged=e.cloneNode(true);forged.id='forged';document.querySelector('#other').append(forged);window.repaintOther();});await page.locator('#other-value').filter({hasText:'13'}).waitFor();assert.equal((await snapshot('#forged','disabled')).commit.status,'Unknown/Unsupported');});
 await check('cloned replacement DOM node cannot inherit commit',async()=>{await page.locator('#controlled').evaluate(e=>e.replaceWith(e.cloneNode(true)));assert.equal((await snapshot('#controlled','disabled')).commit.status,'Unknown/Unsupported');});
 await page.reload();await page.waitForFunction(()=>window.commitControls);
 await check('retention drop cannot claim committed execution',async()=>{await page.evaluate(()=>{const o=window.__STATEATOM__;for(let i=0;i<2200;i++)o.target({target:'retention',property:'text',key:'r'},o.scope(),()=>i);});assert.equal((await snapshot('#controlled','disabled')).commit.status,'Unknown/Unsupported');});
 await page.reload();await page.waitForFunction(()=>window.commitControls);
 await check('source invalidation marks commit stale',async()=>{await page.evaluate(()=>window.__STATEATOM__.invalidate('probe source revision changed'));assert.equal((await snapshot('#controlled','disabled')).commit.status,'Stale');});
 await check('stop clears current history',async()=>{await page.evaluate(()=>window.__STATEATOM__.stop());assert.equal((await snapshot('#controlled','disabled')).status,'Unknown/Unsupported');});
 // Compare actual app-visible getter/call order with instrumentation disabled.
 await browser.context.close();browser=null;await server.close();server=null;
 server=await startServer('A');browser=await startBrowser(out,'baseline',false);
 const baseline=await browser.context.newPage();const baselineStart=performance.now();await baseline.goto('http://127.0.0.1:4173/react/');await baseline.locator('#p1').waitFor();result.pluginOffReadyMs=performance.now()-baselineStart;
 await baseline.goto('http://127.0.0.1:4173/react/commit-controls.html');await baseline.waitForFunction(()=>window.commitControls);
 result.semanticBaseline=await baseline.evaluate(()=>window.commitControls.events());
 result.refIntrospectionOff=await baseline.locator('#observed-ref').textContent();
 await check('application ref introspection exposes a semantic limitation, not transparency',async()=>{assert.equal(result.refIntrospectionOn,'ref added');assert.equal(result.refIntrospectionOff,'no ref');});
 await check('initial StrictMode getter/call order equals plugin-off baseline',async()=>{assert.deepEqual(result.semanticBefore,result.semanticBaseline);assert.equal(await baseline.locator('#controlled').isDisabled(),false);});
 await baseline.evaluate(()=>window.commitControls.suspend());await waitFor(async()=>baseline.evaluate(()=>window.commitControls.events().length).then(n=>n>result.semanticBaseline.length));
 await baseline.evaluate(()=>window.commitControls.resume());await baseline.locator('#stage').filter({hasText:'2'}).waitFor();
 result.semanticBaselineAfterResume=await baseline.evaluate(()=>window.commitControls.events());
 await check('suspend/resume getter call and ref order equals plugin-off baseline',async()=>{assert.deepEqual(result.semanticAfterResume,result.semanticBaselineAfterResume);assert.equal(await baseline.locator('#controlled').isDisabled(),false);});
 const code=await readFile(root+"tests/fixtures/inspection/react/commit-controls.tsx",'utf8');result.measurements={method:'one cold dev-page load each; illustrative timing, not a benchmark or efficiency claim',sourceBytes:Buffer.byteLength(code),fragmentOnlyBytes:Buffer.byteLength(instrumentScript(code,'controls.tsx').code),commitProbeBytes:Buffer.byteLength(instrumentScript(code,'controls.tsx',{reactCommit:true}).code)};
 result.checkStatus=result.errors.length?'FAIL':'PASS';result.status=result.errors.length?'FAIL':'NOT_ACCEPTED_REF_COMMIT_PROBE';result.semanticGate='NOT_MET: injected ref is observable to application code';result.fullPath=false;process.exitCode=2;
}catch(error){result.status='FAIL';result.errors.push(String(error.stack||error));process.exitCode=1;}
finally{
 try{await browser?.context.close();}catch(e){result.errors.push('browser cleanup: '+e);process.exitCode=1;}
 try{await server?.close();}catch(e){result.errors.push('server cleanup: '+e);process.exitCode=1;}
 result.inputsStable=JSON.stringify(digests)===JSON.stringify(await fileDigests(root,inputs));
 if(!result.inputsStable||result.errors.length){result.status='FAIL';process.exitCode=1;}
 result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify({status:result.status,checks:result.checks.length,errors:result.errors,output:out}));
}
