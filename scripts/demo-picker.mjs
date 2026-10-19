// SPDX-License-Identifier: Apache-2.0
// Actual packed extension and synthetic app. No IDE, account or app mutation grant.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {startBrowser,chooseTab,rpc,waitFor} from './harness.mjs';
import {verifyArtifactHashes,fileManifest,sha256} from './atom-package-receipt.mjs';
import {root} from './vite-config.mjs';
const args=process.argv.slice(2),smoke=args.includes('--smoke'),file=args.find(a=>a!=='--smoke')||root+'/.artifacts/atom/atom-handoff.json';
const handoff=JSON.parse(await readFile(file,'utf8'));await verifyArtifactHashes([handoff.package,handoff.ui]);
if(!handoff.consumerReceipt)throw Error('Checked packed consumer receipt required');
const out=root+'/.artifacts/u05/demo/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
const result={schema:'stateatom.picker-demo/1',status:'STARTING',mode:'read-only Basic; no IDE/helper',handoff:{file,sha256:sha256(await readFile(file)),package:handoff.package,ui:handoff.ui},steps:[],limits:['Only tested primary pointer/mouse gesture paths are suppressed','Escape also reaches page key handlers; use Cancel in inspector to avoid page keys','Frame/closed-root internals unsupported; no source or runtime provenance claim'],out};
let server,browser;
try{
 const html=await readFile(root+'/tests/fixtures/picker/index.html','utf8');server=createServer((req,res)=>{res.setHeader('content-type','text/html');res.end(req.url==='/frame'?'<!doctype html><button>Frame boundary</button>':html);});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const origin='http://127.0.0.1:'+server.address().port;result.origin=origin;
 const host=handoff.hosts.standalone;assert.deepEqual(await fileManifest(host),handoff.consumerReceipt.hostFiles.standalone);
 browser=await startBrowser(out+'/profiles','u05-live-demo',true,!smoke,[],{extensionPath:host});const context=browser.context,page=await context.newPage();await page.goto(origin+'/');
 const panel=await context.newPage();await panel.setViewportSize({width:960,height:900});await panel.goto('chrome-extension://'+browser.id+'/panel.html');const ui=id=>panel.locator('[data-atom-id="'+id+'"]'),tabId=await chooseTab(panel,origin+'/');await ui('attach').click();await ui('status').filter({hasText:'OK',exact:true}).waitFor();const state=()=>rpc(panel,{op:'state',tabId});assert.equal((await state()).readOnly,true);
 console.log('Atom '+handoff.package.version+' + UI '+handoff.ui.version+'\nSynthetic app: '+origin+'\nInspector: '+panel.url()+'\nSelect page element → application tab → nested target → inspector ancestor buttons.\nCancel in inspector avoids page keys. Escape cancels but may reach application key handlers.\nNo SDK, IDE, account or mutation grant. Ctrl+C closes this isolated demo.');
 if(smoke){
  await ui('pick').click();await waitFor(async()=>(await state()).picker?.status==='picking');await page.bringToFront();const box=await page.locator('#confirm > span').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.screenshot({path:out+'/01-native-hover.png'});await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await waitFor(async()=>{const s=await state();return s.picker?.status==='selected'&&s.selection?.tag==='span';});assert.deepEqual(await page.evaluate(()=>window.actions),{click:0,submit:0});result.steps.push('Exact nested span selected; application click/submit counters remain zero');
  await panel.bringToFront();const button=ui('picker-choices').getByRole('button',{name:'button#confirm',exact:true});await button.focus();await panel.keyboard.press('Enter');await waitFor(async()=>(await state()).selection?.tag==='button');await panel.screenshot({path:out+'/02-refined-inspector.png'});result.steps.push('Keyboard refinement selects actual parent button; Basic remains explicit Unknown');
  await waitFor(async()=>await ui('pick').getAttribute('aria-pressed')==='false');await ui('pick').click();await waitFor(async()=>(await state()).picker?.status==='picking');await ui('pick').click();await waitFor(async()=>(await state()).picker?.status==='cancelled');await panel.screenshot({path:out+'/03-cancelled.png'});await page.bringToFront();await page.locator('#confirm').click();assert.deepEqual(await page.evaluate(()=>window.actions),{click:1,submit:1});await page.screenshot({path:out+'/04-app-active-after-cancel.png'});result.steps.push('UI cancellation restores ordinary application click/submit behavior');result.status='PASS_SMOKE';
 }else{result.status='READY_INTERACTIVE';await writeFile(out+'/demo.json',JSON.stringify(result,null,2));await panel.bringToFront();await new Promise(resolve=>{process.once('SIGINT',resolve);process.once('SIGTERM',resolve);context.once('close',resolve);});}
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;console.error(e);}finally{await browser?.context.close().catch(()=>{});if(server)await new Promise(resolve=>server.close(resolve));await writeFile(out+'/demo.json',JSON.stringify(result,null,2));console.log(result.status,out);}
