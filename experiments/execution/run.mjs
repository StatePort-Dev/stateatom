// SPDX-License-Identifier: Apache-2.0
// Separate acquisition experiment. No product UI or value-ancestry claim.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {inventory} from './inventory.mjs';
import {startServer} from "../../scripts/inspection-server.mjs";
import {startBrowser,waitFor} from "../../scripts/harness.mjs";
import {fileDigests} from "../../scripts/short-loop-inputs.mjs";
import {root} from "../../scripts/vite-config.mjs";
const privateWrites=process.argv.includes('--private-writes');
const tag=process.env.EXECUTION_TAG||new Date().toISOString().replaceAll(/[:.]/g,'-');assert.match(tag,/^[a-zA-Z0-9_-]+$/);
const out=root+'/.runtime/execution-probes/'+tag;await mkdir(root+'/.runtime/execution-probes',{recursive:true});await mkdir(out);
const inputs=['experiments/execution','src/engine','tests/fixtures/inspection',"scripts/inspection-server.mjs",'scripts/harness.mjs','package.json','package-lock.json'],before=await fileDigests(root,inputs);
let revision=null;try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
const dependencyEntries=['node_modules/react/package.json','node_modules/react/cjs/react.development.js','node_modules/react-dom/package.json','node_modules/react-dom/cjs/react-dom.development.js','node_modules/@tanstack/query-core/package.json','node_modules/@tanstack/query-core/build/modern','node_modules/vite/package.json','node_modules/vite/dist/node','node_modules/@babel/core/package.json','node_modules/@babel/parser/package.json','node_modules/@babel/traverse/package.json','node_modules/esbuild/package.json','node_modules/esbuild/lib/main.js'];
const dependencySnapshot=await fileDigests(root,dependencyEntries);
const result={dependencySnapshot,dependencyScope:'Actual listed disk bytes only, not proof of loaded compiler inputs or complete transitive inventory',revision,startedAt:new Date().toISOString(),inputs:before,checks:[],errors:[],fullPath:false,configuration:{privateWrites,browserPlugin:'not available; repository pinned native Playwright',acquisitionOnly:true,productUI:false,scope:'Captured compiled main-default sources vs trusted server response bytes; not execution, response creator, ownership or HTTP field ancestry'}};
async function drain(cdp,ledger,pending){for(let i=0;i<16;i++){await cdp.send('Runtime.getIsolateId');const generation=ledger.version();await Promise.all([...pending]);await cdp.send('Runtime.getIsolateId');if(pending.size===0&&ledger.version()===generation)return;}ledger.failure('Checkpoint source drain budget exceeded');}
let server,browser;
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});};
try{
 server=await startServer('B',{reactHostProps:true,reactStateHandoffs:true,sourceWrites:true,writeAccessGuards:privateWrites,reactWriteAccessGuards:privateWrites,queryHandoffs:privateWrites,queryCallCensus:privateWrites,queryWriteAccessGuards:privateWrites});
 let activeLedger;const ledger=inventory({armedBeforeNavigation:true}),pending=new Set(),receipts=[];activeLedger=ledger;
 server.middlewares.stack.unshift({route:'',handle(req,res,next){const chunks=[],write=res.write,end=res.end;let total=0,overflow=false;const remember=chunk=>{if(chunk===undefined||chunk===null)return;const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);total+=b.length;if(total<=4*1024*1024)chunks.push(b);else overflow=true;};res.write=function(chunk,...args){remember(chunk);return write.call(this,chunk,...args);};res.end=function(chunk,...args){remember(chunk);const type=String(res.getHeader('content-type')||'');if(res.statusCode===200&&/javascript|ecmascript|text\/html/i.test(type)){if(overflow)activeLedger.failure('Trusted response capture budget');else{const url='http://127.0.0.1:4173'+req.url,kind=/text\/html/.test(type)?'document':'script',body=Buffer.concat(chunks).toString('utf8');activeLedger.receipt(url,body,kind);receipts.push({url,kind,bytes:total});}}return end.call(this,chunk,...args);};next();}});
 browser=await startBrowser(out,'compiled-inventory',false);result.browser=browser.context.browser()?.version();
 const page=await browser.context.newPage(),cdp=await browser.context.newCDPSession(page);page.on('pageerror',e=>result.errors.push(String(e)));
 cdp.on('Runtime.executionContextsCleared',()=>ledger.cleared());
 cdp.on('Runtime.executionContextCreated',p=>ledger.context(p.context));cdp.on('Runtime.executionContextDestroyed',p=>ledger.destroyed(p.executionContextId));
 cdp.on('Debugger.scriptParsed',p=>{ledger.parsed(p);const task=cdp.send('Debugger.getScriptSource',{scriptId:p.scriptId}).then(r=>ledger.source(p.scriptId,r.scriptSource)).catch(e=>ledger.failure('Compiled source unavailable: '+e.message));pending.add(task);task.finally(()=>pending.delete(task));});
 cdp.on('Page.frameAttached',()=>ledger.failure('Other attached frame observed'));cdp.on('Target.attachedToTarget',p=>ledger.failure('Related target observed: '+p.targetInfo.type));
 await cdp.send('Page.enable');await cdp.send('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:false,flatten:true});await cdp.send('Runtime.enable');await cdp.send('Debugger.enable');await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4173/react/');
 const mainFrameId=(await cdp.send('Page.getFrameTree')).frameTree.frame.id;
 async function outer(selector){const doc=await cdp.send('DOM.getDocument'),q=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector});return q.nodeId?(await cdp.send('DOM.getOuterHTML',{nodeId:q.nodeId})).outerHTML:null;}
 await waitFor(async()=>{const html=await outer('#p1');return html?.includes('>13<');});
 await drain(cdp,ledger,pending);
 result.baseline=ledger.checkpoint(mainFrameId);result.receipts=receipts;await writeFile(out+'/baseline.json',JSON.stringify(result.baseline,null,2));
 await check('unchanged P2/P1 remain rendered while acquisition reads no user expressions',async()=>{result.dom={p1:await outer('#p1'),p2:await outer('#p2')};assert.match(result.dom.p1,/>13</);assert.doesNotMatch(result.dom.p2,/\sdisabled(?:[=>\s])/);});
 await check('all captured main-default sources get an explicit exact-match or unknown verdict including dependencies',()=>{assert(result.baseline.scripts.some(s=>s.url.includes('/node_modules/')));assert(result.baseline.scripts.some(s=>s.url.includes('/@vite/')));assert(result.baseline.scripts.every(s=>typeof s.sourceDigest==='string'));assert.equal(result.baseline.fullPath,false);assert.equal(result.baseline.status,'Matched captured compiled main-world inventory',JSON.stringify(result.baseline.reasons));assert.equal(result.baseline.counts.unknown,0);assert.equal(result.baseline.counts.matched,result.baseline.scripts.length);});
 await check('a later anonymous compiled script invalidates checkpoint and remains unknown',async()=>{await cdp.send('Runtime.evaluate',{expression:'void 0;'});await drain(cdp,ledger,pending);assert.equal(ledger.current(result.baseline),false);result.anonymous=ledger.checkpoint(mainFrameId);assert.equal(result.anonymous.status,'Unknown/Unsupported');assert(result.anonymous.scripts.some(s=>s.url===''));});
 await check('forged server sourceURL cannot borrow matching receipt content',async()=>{await cdp.send('Runtime.evaluate',{expression:'void 0;\n//# sourceURL=http://127.0.0.1:4173/react/App.tsx'});await drain(cdp,ledger,pending);result.forged=ledger.checkpoint(mainFrameId);assert.equal(result.forged.status,'Unknown/Unsupported');assert(result.forged.reasons.some(s=>s.includes('sourceURL')));});
 await check('same-URL navigation does not reset prior unknown history',async()=>{await page.reload();await drain(cdp,ledger,pending);result.reload=ledger.checkpoint((await cdp.send('Page.getFrameTree')).frameTree.frame.id);assert.equal(result.reload.status,'Unknown/Unsupported');assert(result.reload.reasons.some(r=>r.includes('context destroyed')||r.includes('history cleared')));});
 await check('native substituted dependency bytes do not inherit unchanged App identity',async()=>{
  const other=inventory({armedBeforeNavigation:true});activeLedger=other;
  const p=await browser.context.newPage(),d=await browser.context.newCDPSession(p),tasks=new Set();
  d.on('Runtime.executionContextsCleared',()=>other.cleared());d.on('Runtime.executionContextCreated',e=>other.context(e.context));d.on('Runtime.executionContextDestroyed',e=>other.destroyed(e.executionContextId));
  d.on('Debugger.scriptParsed',e=>{other.parsed(e);const task=d.send('Debugger.getScriptSource',{scriptId:e.scriptId}).then(r=>other.source(e.scriptId,r.scriptSource)).catch(()=>other.failure('Compiled source unavailable'));tasks.add(task);task.finally(()=>tasks.delete(task));});
  await d.send('Runtime.enable');await d.send('Debugger.enable');
  await p.route('**/shared/logic.ts',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\n// dependency substitution control\n'});});
  await p.goto('http://127.0.0.1:4173/react/');await drain(d,other,tasks);
  result.substitution=other.checkpoint((await d.send('Page.getFrameTree')).frameTree.frame.id);
  assert.equal(result.substitution.status,'Unknown/Unsupported');assert(result.substitution.scripts.some(s=>s.url.endsWith('/shared/logic.ts')&&!s.match));
  assert.equal((await fileDigests(root,["tests/fixtures/inspection/react/App.tsx"]))["tests/fixtures/inspection/react/App.tsx"],before["tests/fixtures/inspection/react/App.tsx"]);await p.close();
 });
 await check('late attachment cannot certify earlier compilation history',async()=>{
  const late=inventory({armedBeforeNavigation:false});activeLedger=late;const p=await browser.context.newPage();await p.goto('http://127.0.0.1:4173/react/');const d=await browser.context.newCDPSession(p),tasks=new Set();
  d.on('Runtime.executionContextCreated',e=>late.context(e.context));d.on('Debugger.scriptParsed',e=>{late.parsed(e);const task=d.send('Debugger.getScriptSource',{scriptId:e.scriptId}).then(r=>late.source(e.scriptId,r.scriptSource)).catch(()=>late.failure('Compiled source unavailable'));tasks.add(task);task.finally(()=>tasks.delete(task));});
  await d.send('Runtime.enable');await d.send('Debugger.enable');await drain(d,late,tasks);result.late=late.checkpoint((await d.send('Page.getFrameTree')).frameTree.frame.id);assert.equal(result.late.status,'Unknown/Unsupported');assert(result.late.reasons.includes('History before attachment unavailable'));await p.close();
 });
 result.status='PASS_BOUNDED_COMPILED_INVENTORY_ACQUISITION';
}catch(e){result.status='FAIL';result.errors.push(String(e.stack||e));process.exitCode=1;}
finally{
 for(const[name,fn]of[['browser',()=>browser?.context.close()],['server',()=>server?.close()]])try{await fn();}catch(e){result.errors.push(name+': '+e);}
 result.inputsStable=JSON.stringify(before)===JSON.stringify(await fileDigests(root,inputs));if(!result.inputsStable||result.errors.length){result.status='FAIL';process.exitCode=1;}
 result.dependencySnapshotStable=JSON.stringify(dependencySnapshot)===JSON.stringify(await fileDigests(root,dependencyEntries));if(!result.dependencySnapshotStable){result.errors.push('Dependency disk snapshot changed');result.status='FAIL';process.exitCode=1;}
 result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out,result.errors);if(result.baseline)console.log('Baseline:',result.baseline.status,result.baseline.reasons);
}
