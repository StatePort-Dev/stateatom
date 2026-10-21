if(process.argv.includes('--native-handoff')){await import('./source-map-native.mjs');process.exit(process.exitCode||0);}
// SPDX-License-Identifier: Apache-2.0
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {TraceMap,generatedPositionFor} from '@jridgewell/trace-mapping';
import {root} from '../../scripts/vite-config.mjs';
import {fileManifest} from '../../scripts/atom-package-receipt.mjs';
const hostPath=process.env.ATOM_EXTENSION_PATH||root+'/dist/browser',hostBefore=await fileManifest(hostPath);
const atom=selector=>atomLocator(panel,selector);
import {startBrowser,panelFor,atomLocator,chooseTab,rpc,waitFor} from '../../scripts/harness.mjs';
import {storedZip} from '../helpers/source-map-zip.mjs';
const tag=new Date().toISOString().replace(/[:.]/g,'-'),dir=root+'/.artifacts/production-source-mapping-'+tag;
await mkdir(dir,{recursive:true});const runtime=await mkdtemp('/tmp/atom-production-maps-');
const result={revision:(await promisify(execFile)('git',['rev-parse','HEAD'],{cwd:root})).stdout.trim(),dirty:true,startedAt:new Date().toISOString(),node:process.version,config:{build:'esbuild minified React 18.3.1 production, external v3 map',ide:false,devInstrumentation:false,mv3:true,browserPlugin:'Browser plugin not available; repository Playwright harness',interaction:'Panel controls for attach, CSS selection, local file import, source lookup, diagnostic review/download and reader. Harness builds artifacts and computes manual generated coordinates; no UI/code anchor claimed.'},checks:[],errors:[]};
result.host={path:hostPath,panelPath:process.env.ATOM_PANEL_PATH||'panel.html',before:hostBefore};
function check(name,condition){result.checks.push({name,passed:!!condition});if(!condition)throw Error(name);}
const digest=b=>createHash('sha256').update(b).digest('hex');
await build({entryPoints:[root+'/tests/fixtures/production-source-mapping/OrderActions.jsx'],bundle:true,minify:true,sourcemap:'external',define:{'process.env.NODE_ENV':'"production"'},outfile:dir+'/app.js'});
const js=await readFile(dir+'/app.js'),mb=await readFile(dir+'/app.js.map'),map=JSON.parse(mb);
// A non-zero manual coordinate from the actual build map, not a fabricated UI anchor.
const source=map.sources.find(x=>x.endsWith('OrderActions.jsx')),generated=generatedPositionFor(new TraceMap(map),{source,line:6,column:76});
if(generated.line===null)throw Error('Fixture has no mapping for JSX expression');
function zip(mapBytes,assetBytes=js){const manifest={schemaVersion:1,releaseId:'synthetic-release-1',assets:[{asset:'app.js',assetSha256:digest(assetBytes),sourceMap:'app.js.map',sourceMapSha256:digest(mapBytes)}]};return storedZip([['manifest.json',JSON.stringify(manifest)],['app.js',assetBytes],['app.js.map',mapBytes]]);}
await writeFile(dir+'/release.zip',zip(mb));await writeFile(dir+'/wrong.zip',zip(mb,Buffer.from('different compiled content')));await writeFile(dir+'/positions.zip',zip(Buffer.from(JSON.stringify({...map,sourcesContent:undefined}))));await writeFile(dir+'/hostile.map',JSON.stringify({version:3,sources:['<img src=x onerror=alert(1)>'],names:[],mappings:'AAAA',sourcesContent:['<script>globalThis.PWNED=true</script>']}));await writeFile(dir+'/traversal.zip',storedZip([['../escape.map','{}']]));
const traffic=[];let server,b,panel,page;
try{
 server=createServer((req,res)=>{traffic.push(req.url);if(req.url==='/app.js'){res.setHeader('SourceMap','/app.js.map');res.setHeader('Content-Type','text/javascript');res.end(js);}else if(req.url==='/app.js.map'){res.setHeader('Content-Type','application/json');res.end(mb);}else if(req.url==='/redirect.map'){res.writeHead(302,{location:'https://unexpected.invalid/private.map'});res.end();}else if(req.url==='/denied.map'){res.writeHead(403);res.end();}else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Production mapping fixture</title><div id="root"></div><script src="/app.js"></script>');}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(4175,'127.0.0.1',resolve);});
 b=await startBrowser(runtime,'production-maps');result.chromium=b.context.browser()?.version();
 page=await b.context.newPage();await page.goto('http://127.0.0.1:4175/');await page.locator('#confirm').waitFor();
 panel=await panelFor(b.context,b.id);panel.on('pageerror',e=>result.errors.push(e.message));const id=await chooseTab(panel,'http://127.0.0.1:4175/');
 await atom('#source-map-details > summary').click();await atom('#source-map-readonly').check();await atom('#attach').click();await atom('#status').filter({hasText:'OK',exact:true}).waitFor();
 await atom('#property').selectOption('disabled');await atom('#selector-details > summary').click();await atom('#selector').fill('#confirm');await atom('#inspect-selector').click();await atom('#status').filter({hasText:'OK',exact:true}).waitFor();
 let state=await rpc(panel,{op:'state',tabId:id});check('Selected disabled property without IDE or dev plugin',state.selection?.property==='disabled'&&state.selection?.value===true&&!state.analysis.capabilities?.sourceResolver?.includes('ide')&&state.readOnly);
 await waitFor(async()=>{await atom('#refresh-tabs').click();return (await atom('#source-map-script option').allTextContents()).some(x=>x.startsWith('app.js ·'));});
 const scriptId=await atom('#source-map-script option').filter({hasText:/^app.js ·/}).first().getAttribute('value');await atom('#source-map-script').selectOption(scriptId);
 async function importFile(file,status){await atom('#source-map-file').setInputFiles(dir+'/'+file);await atom('#status').filter({hasText:'OK',exact:true}).waitFor();await atom('#source-map-status').filter({hasText:status}).waitFor();}
 const before=traffic.length;await importFile('release.zip','Exact artifact match');check('Offline local import makes no new app requests',traffic.length===before);
 await atom('#source-map-manual').evaluate(e=>{e.open=true;});await atom('#source-map-line').fill(String(generated.line));await atom('#source-map-column').fill(String(generated.column));await atom('#source-map-lookup').click();await atom('#source-map-location').filter({hasText:'not linked to element'}).waitFor();
 check('Exact artifact manual source lookup displays original expression with explicit missing anchor',(await atom('#source-map-preview').textContent()).includes('creditHold || !canConfirm')&&(await atom('#source-map-location').textContent()).includes('Exact artifact match'));
 check('Map connection cannot enable production experiments',await atom('#atom-run').isDisabled()&&await atom('#experiment').isDisabled()&&await atom('#atom-restore').isDisabled());
 await atom('#diagnostics-details > summary').click();await atom('#save-report').click();await atom('#diagnostic-status').filter({hasText:/^Saved/}).waitFor();await atom('#export-report').click();await atom('#export-review').waitFor();const preview=await atom('#export-json').inputValue();check('Diagnostic omits original code, map body and private source names',!preview.includes('creditHold')&&!preview.includes('sourcesContent')&&!preview.includes('OrderActions.jsx')&&JSON.parse(preview).runtime.sourceMaps.scripts.some(x=>x.map?.status==='Exact artifact match'));
 const dl=panel.waitForEvent('download');await atom('#export-confirm').click();await (await dl).saveAs(dir+'/diagnostic.stateatom.json');
 const reader=await b.context.newPage();await reader.goto('file://'+(process.env.ATOM_EXTENSION_PATH||root+'/dist/reader')+'/reader.html');await reader.locator('#diagnostic-file').setInputFiles(dir+'/diagnostic.stateatom.json');await reader.locator('#reader-status').filter({hasText:/Imported/}).waitFor();check('Offline reader explains artifact association and missing element link',(await reader.locator('#reader-summary').textContent()).includes('not linked to element'));
 await importFile('wrong.zip','Mismatch');check('Same filename wrong compiled content blocks mapping',await atom('#source-map-lookup').isDisabled()&&(await atom('#source-map-preview').textContent())==='');
 await importFile('positions.zip','Exact artifact match');await atom('#source-map-lookup').click();await atom('#source-map-location').filter({hasText:'Map lacks source content'}).waitFor();check('Positions-only release does not invent expression',!(await atom('#source-map-preview').textContent()).includes('creditHold'));
 await importFile('hostile.map','Unverified');await atom('#source-map-line').fill('1');await atom('#source-map-column').fill('0');await atom('#source-map-lookup').click();await atom('#source-map-preview').filter({hasText:'<script>'}).waitFor();check('Untrusted source text is inert',await atom('#source-map-preview script').count()===0&&!await panel.evaluate(()=>globalThis.PWNED));
 await atom('#source-map-file').setInputFiles(dir+'/traversal.zip');await atom('#status').filter({hasText:/Error:.*Unsafe/}).waitFor();check('Traversal archive rejected without losing prior unverified status',(await atom('#source-map-status').textContent()).includes('Unverified'));
 await atom('#source-map-discover').click();await atom('#status').filter({hasText:/^(OK|Error:)/}).waitFor();check('Declared same-origin map loads as Unverified',(await atom('#source-map-status').textContent()).includes('Unverified'));
 for(const endpoint of ['redirect.map','denied.map']){let error='';try{await rpc(panel,{op:'source-map-acquire',tabId:id,scriptId,url:'http://127.0.0.1:4175/'+endpoint});}catch(e){error=e.message;}check(endpoint+' fails with a clear bounded outcome',endpoint==='redirect.map'?/redirect|network/i.test(error):error.includes('403'));}
 await importFile('release.zip','Exact artifact match');await atom('#source-map-line').fill(String(generated.line));await atom('#source-map-column').fill(String(generated.column));await atom('#source-map-lookup').click();await atom('#source-map-location').filter({hasText:'not linked to element'}).waitFor();
 await panel.setViewportSize({width:440,height:900});await atom('#source-map-details').scrollIntoViewIfNeeded();await panel.screenshot({path:dir+'/source-map-440.png'});check('440px viewport has no horizontal overflow',await panel.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await atom('#source-map-lookup').focus();await panel.keyboard.press('Enter');await atom('#source-map-location').filter({hasText:'not linked to element'}).waitFor();check('Keyboard source lookup is usable',true);
 await panel.setViewportSize({width:1280,height:900});await atom('#inputs-nav').click();await atom('#scroll').evaluate(e=>e.scrollTop=0);await panel.screenshot({path:dir+'/first-viewport.png'});
 await page.reload();await waitFor(async()=>{const s=await rpc(panel,{op:'state',tabId:id});return s.sourceMaps.scripts.every(x=>!x.map);});await atom('#refresh-tabs').click();check('Navigation invalidates map and clears private source preview',(await atom('#source-map-preview').textContent())==='');
 await atom('#pick').click();await page.locator('#confirm').click({force:true});await waitFor(async()=>(await rpc(panel,{op:'state',tabId:id})).selection?.id==='confirm');check('Read-only picker survives navigation without invoking the disabled button',await page.locator('#confirm').isDisabled());
 await rpc(panel,{op:'detach',tabId:id});check('Detach marks source inventory stale',(await rpc(panel,{op:'state',tabId:id})).sourceMaps.status==='Stale');
 check('Panel console health',result.errors.length===0);result.status='PASS';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;await panel?.screenshot({path:dir+'/failure.png'}).catch(()=>{});console.error(e.stack);}finally{await b?.context.close().catch(()=>{});if(server)await new Promise(r=>server.close(r));result.host.after=await fileManifest(hostPath);if(JSON.stringify(result.host.before)!==JSON.stringify(result.host.after)){result.status='FAIL';process.exitCode=1;result.errors.push('Installed host changed during run');}result.finishedAt=new Date().toISOString();await writeFile(dir+'/result.json',JSON.stringify(result,null,2));console.log(result.status,result.checks.length,dir);}
