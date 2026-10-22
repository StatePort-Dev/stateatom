// SPDX-License-Identifier: Apache-2.0
// Actual packed UI over controlled HTTP loopback. Trusted HTTPS is a separate P03 gate.
import assert from 'node:assert/strict';import {build} from 'esbuild';
import {createServer} from 'node:http';import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {startNativeBrowser} from '../../scripts/native-browser.mjs';
import {nativeInspectorUI} from '../helpers/native-inspector-ui.mjs';
import {waitFor,rpc} from '../../scripts/harness.mjs';
import {sha256,fileManifest,verifyArtifactHashes,inspectInstalledPair} from '../../scripts/atom-package-receipt.mjs';
import {storedZip} from '../helpers/source-map-zip.mjs';
const hf=process.argv.find(a=>a.endsWith('atom-handoff.json'))||'.artifacts/atom/atom-handoff.json',h=JSON.parse(await readFile(hf));
const out='.artifacts/p03/access-errors-native/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
const files=['tests/integration/source-access-errors-native.mjs','tests/fixtures/production-source-mapping/NativeListeners.js','scripts/native-browser.mjs','scripts/harness.mjs','tests/helpers/native-inspector-ui.mjs','docs/completion/84-p03-artifact-errors-and-local-fallback.md'],inputs=async()=>Object.fromEntries(await Promise.all([...new Set([...Object.keys({...h.sourceManifest,...h.buildSources.manifest}),...files])].map(async f=>[f,sha256(await readFile(f))])));
const result={schema:'stateatom.p03-access-errors-native/1',status:'RUNNING',startedAt:new Date().toISOString(),inputsBefore:await inputs(),handoff:{file:hf,sha256:sha256(await readFile(hf)),package:h.package,ui:h.ui},configuration:{operator:'agent',transport:'controlled HTTP127.0.0.1; required loopback permission',HTTPSAcceptance:false,nativePermissionPrompt:false,account:false,appTargetSession:false,sidecar:false,source:'Original synthetic NativeListeners.js minified by existing esbuild, current native listener coordinates only',scope:'Rendered safe errors, actual existing local ZIP fallback, privacy, cancellation/timeout and read-only controls; not full P03'},checks:[],cases:[]};
let server,browser,d,panel;const traffic=[],pending=[];const marker='P03_PRIVATE_AUTH_BODY_OR_QUERY';
const check=async(name,fn)=>{await fn();result.checks.push({name,status:'PASS'});console.log('PASS',name);};
try{
 await check('exact immutable package pair and installed native hosts',async()=>{await verifyArtifactHashes([h.package,h.ui]);await inspectInstalledPair(h.consumer,h.consumerReceipt);for(const k of ['standalone','embedding'])assert.deepEqual(await fileManifest(h.hosts[k]),h.consumerReceipt.hostFiles[k]);});
 const built=await build({entryPoints:['tests/fixtures/production-source-mapping/NativeListeners.js'],bundle:true,minify:true,sourcemap:'external',write:false,outfile:'app.js',platform:'browser'}),js=built.outputFiles.find(f=>f.path.endsWith('/app.js')).contents,map=built.outputFiles.find(f=>f.path.endsWith('.map')).contents;
 const manifest={schemaVersion:1,releaseId:'p03-safe-errors-synthetic',assets:[{asset:'app.js',sourceMap:'app.js.map',assetSha256:sha256(js),sourceMapSha256:sha256(map)}]},zip=storedZip([['manifest.json',new TextEncoder().encode(JSON.stringify(manifest))],['app.js',js],['app.js.map',map]]);await writeFile(out+'/release.zip',zip);result.fixture={scriptSha256:sha256(js),mapSha256:sha256(map),zipSha256:sha256(zip)};
 server=createServer((req,res)=>{const route=new URL(req.url,'http://fixture').pathname;traffic.push({url:req.url,cookie:!!req.headers.cookie,referrer:!!req.headers.referer});
  if(route==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}
  else if(route==='/app.js.map'){res.setHeader('Content-Type','application/json');res.end(map);}
  else if(route==='/denied.map'){res.writeHead(403);res.end(marker);}
  else if(route==='/signin.map'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><form>'+marker+'</form></html>');}
  else if(route==='/redirect.map'){res.writeHead(302,{location:'/forbidden-'+marker});res.end();}
  else if(route==='/empty.map'){res.end('');}
  else if(route==='/oversize.map'){res.writeHead(200,{'Content-Length':String(8*1024*1024+1)});res.flushHeaders();res.end();}
  else if(route==='/slow.map'||route==='/timeout.map'){const p={route,closed:false};pending.push(p);res.on('close',()=>p.closed=true);}
  else if(route==='/favicon.ico'){res.writeHead(204);res.end();}
  else{res.setHeader('Content-Type','text/html');res.setHeader('Set-Cookie','P03_SYNTHETIC_COOKIE=fixture-private; Path=/');res.end('<!doctype html><title>P03 artifact errors fixture</title><style>body{font:18px system-ui;padding:32px}button{font:inherit;padding:18px;margin:12px}</style><h1>Artifact errors fixture</h1><button id="first">Confirm</button><button id="second">Confirm</button><script src="/app.js"></script>');}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';
 for(const kind of ['standalone','embedding']){
  const entry={kind,checks:[],before:await fileManifest(h.hosts[kind])};result.cases.push(entry);const local=async(name,fn)=>{await check(kind+' '+name,fn);entry.checks.push(name);};
  browser=await startNativeBrowser(out+'/profiles',kind,true,false,[],{extensionPath:h.hosts[kind]});panel=await browser.context.newPage();await panel.goto('chrome-extension://'+browser.id+'/'+(kind==='standalone'?'panel.html':'workspace/inspect.html'));d=await nativeInspectorUI(panel,browser);
  const tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,url);await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
  await d.click('refresh-tabs');await d.waitOK();await d.select('tabs',tabId);await d.waitOK();if(!await panel.evaluate(s=>document.querySelector(s).checked,d.q('source-map-readonly')))await d.click('source-map-readonly');await d.click('attach');await d.waitOK();await d.fill('selector','#first');await d.click('inspect-selector');await d.waitOK();await d.click('native-source-0');await d.waitOK();
  const state=()=>rpc(panel,{op:'state',tabId}),counts=()=>panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:()=>({...window.actionCounts})}))[0].result,tabId),zero={first:0,second:0,delegated:0};
  const acquire=async path=>{await d.fill('source-map-url',url+path);await d.click('source-map-acquire');};
  const failed=async pattern=>{await waitFor(async()=>pattern.test(await d.text('source-map-access-status')));await waitFor(async()=>(await d.text('status')).startsWith('Error:'));};
  const feedback=()=>panel.evaluate(({file,status})=>{const f=document.querySelector(file),p=document.querySelector(status);return{text:p.textContent,hidden:p.hidden,display:getComputedStyle(p).display,focus:document.activeElement===f,disabled:f.disabled};},{file:d.q('source-map-file'),status:d.q('source-map-access-status')});
  entry.errors=[];
  for(const [path,pattern]of [['denied.map',/HTTP 403.*local/i],['signin.map',/document.*may.*sign.in.*local/i],['redirect.map',/network.*redirect.*policy.*local/i],['empty.map',/empty.*local/i],['oversize.map',/budget.*local/i]]){
   await acquire(path+'?token='+marker);await failed(pattern);
   await local(path+' shows safe fallback and focuses the enabled existing file picker',async()=>{const f=await feedback();assert.match(f.text,pattern);assert.equal(f.hidden,false);assert.notEqual(f.display,'none');assert.equal(f.focus,true);assert.equal(f.disabled,false);assert(!f.text.includes(marker));assert(!(await d.text('status')).includes(marker));assert.equal((await state()).productionChange.active,false);assert.deepEqual(await counts(),zero);entry.errors.push({path,...f});});
   if(path==='denied.map'){
    entry.failureViewports={};for(const width of [440,390]){const metrics=await d.screenshot(out+'/'+kind+'-fallback-'+width+'-candidate.png',{width,focus:'source-map-file'});assert.equal(metrics.overflow,false);assert.equal(metrics.rootFont,'13px');entry.failureViewports[width]=metrics;}
    await panel.evaluate(s=>document.querySelector(s).focus(),d.q('source-map-file'));await d.key('Tab','Tab',9);assert(await panel.evaluate(()=>document.activeElement.closest('[data-atom-root]')!==null));
   }
  }
  await d.files(d.q('source-map-file'),[out+'/release.zip']);await waitFor(()=>panel.evaluate(s=>document.querySelector(s).value==='',d.q('source-map-file')));await d.waitOK();await d.click('native-source-0');await d.waitOK();
  await local('the offered local ZIP actually restores exact selected-handler source without IDE or manual coordinates',async()=>{assert.match(await d.text('source-map-location'),/Code-linked.*Exact artifact match.*registered listener/);assert.match(await d.text('source-map-preview'),/firstAction|FIRST_HANDLER_PRIVATE/);const f=await feedback();assert.equal(f.hidden,true);assert.equal(f.display,'none');const s=await state();assert.equal(s.sourceMaps.bundle.assetCount,1);assert.equal(s.readOnly,true);assert.equal(s.productionChange.active,false);assert.deepEqual(await counts(),zero);entry.localFallback={location:await d.text('source-map-location'),bundle:s.sourceMaps.bundle};});
  await acquire('slow.map');await waitFor(()=>pending.some(p=>p.route==='/slow.map'&&!p.closed));await d.click('source-map-clear');await d.waitOK();await waitFor(()=>pending.some(p=>p.route==='/slow.map'&&p.closed));
  await local('Clear cancels a real pending download and removes prior fallback/source content',async()=>{assert.equal((await feedback()).hidden,true);assert.equal(await d.text('source-map-preview'),'');assert.equal((await state()).sourceMaps.bundle,null);assert.deepEqual(await counts(),zero);});
  const before=Date.now();await acquire('timeout.map');await failed(/timed out.*local/i);entry.timeoutMs=Date.now()-before;
  await local('real existing ten-second timeout offers local import without a false network diagnosis',async()=>{assert(entry.timeoutMs>=9000);assert(!/network|SSO/.test((await feedback()).text));assert.equal((await state()).productionChange.active,false);assert.deepEqual(await counts(),zero);});
  await local('default reports omit private error/query/body strings and no inspector gesture invokes the app',async()=>{const s=await state(),report=await rpc(panel,{op:'save-diagnostic',tabId});assert(!JSON.stringify([s,report]).includes(marker));assert(!JSON.stringify(report).includes('FIRST_HANDLER_PRIVATE'));assert.deepEqual(await counts(),zero);});
  await local('exact host identities remain unchanged',async()=>{entry.after=await fileManifest(h.hosts[kind]);assert.deepEqual(entry.before,entry.after);});
  await d.close();d=null;await browser.context.close();browser=null;
 }
 await check('all artifact requests omit credentials/referrers and redirects never fetch the refused destination',async()=>{const artifact=traffic.filter(t=>/\.(?:map)(?:\?|$)/.test(t.url));assert(artifact.length>=14);assert(artifact.every(t=>!t.cookie&&!t.referrer));assert(!traffic.some(t=>t.url.startsWith('/forbidden-')));result.traffic=traffic;result.pending=pending;});
 result.status='PASS_PACKED_ACCESS_ERRORS_LOCAL_FALLBACK_NOT_FULL_P03';
}catch(error){result.status='FAIL';result.error=error.stack;process.exitCode=1;console.error(error);if(panel){result.failureUI=await panel.evaluate(()=>document.body.innerText.slice(-4500)).catch(()=>null);await panel.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}}
finally{await d?.close().catch(()=>{});await browser?.context.close().catch(()=>{});server?.closeAllConnections();if(server)await new Promise(r=>server.close(r));result.inputsAfter=await inputs();if(JSON.stringify(result.inputsBefore)!==JSON.stringify(result.inputsAfter)){result.status='FAIL';result.error=(result.error||'')+'\nRegistered inputs changed';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,out);}
