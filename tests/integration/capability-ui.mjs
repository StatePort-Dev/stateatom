// SPDX-License-Identifier: Apache-2.0
// Rendered UI with a controlled client; not browser-permission or picker proof.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {startBrowser,waitFor} from '../../scripts/harness.mjs';
import {root} from '../../scripts/vite-config.mjs';
const handoff=JSON.parse(await readFile(root+'/.artifacts/atom/atom-handoff.json','utf8'));
const out=root+'/.artifacts/atom/capability-ui/'+new Date().toISOString().replaceAll(/[:.]/g,'-');await mkdir(out,{recursive:true});
const installed=handoff.consumer+'/node_modules/@stateport/atom/dist/';
await build({stdin:{contents:`
import {mountAtom} from ${JSON.stringify(installed+'ui.mjs')};
import {describeCapabilities} from ${JSON.stringify(installed+'transport.mjs')};
const facts={url:'http://127.0.0.1:4173/',permission:true,grants:['read','inject','cache','reload','override','replay'],lease:'owned',attached:true};
let state={attached:true},listener,permissionRequests=0,currentFacts=facts;
const client={async request(p){if(p.op==='tabs')return [{id:1,url:currentFacts.url}];if(p.op==='state')return state;if(p.op==='pick')return {};throw Error('Unexpected fixture operation: '+p.op);},subscribe(fn){listener=fn;return()=>{};}};
window.fixture={permissionRequests:()=>permissionRequests,set(mode){currentFacts={...facts,...(mode==='denied'?{url:'https://example.invalid/',readOnlySites:true,permission:false}:{})};state={attached:true,...(mode==='selected'?{selection:{selector:'#fixture',property:'text',value:'hello',observedAt:Date.now()}}:{}),...(mode==='legacy'?{}:{capabilityPolicy:describeCapabilities({...currentFacts,...(mode==='readonly'?{url:'https://example.invalid/',readOnlySites:true,readOnly:true}:{} )})})};listener?.({event:'state-invalidated',tabId:1});}};
window.fixture.ready=mountAtom(document.getElementById('root'),client,{requestOriginPermission:async()=>{permissionRequests++;return false;}}).ready;
`,resolveDir:handoff.consumer,loader:'js'},bundle:true,format:'iife',platform:'browser',outfile:out+'/fixture.js'});
await writeFile(out+'/index.html','<!doctype html><meta charset="utf-8"><div id="root" style="height:700px"></div><script src="fixture.js"></script>');
const result={kind:'rendered controlled-client fixture; no native capability claims',package:handoff.package,checks:[]};let browser;
try{
 browser=await startBrowser(out+'/profiles','ui',false);const page=await browser.context.newPage();await page.goto('file://'+out+'/index.html');await page.evaluate(()=>window.fixture.ready);
 const ui=id=>page.locator('[data-atom-id="'+id+'"]');
 assert(await ui('pick').isDisabled());assert.match(await ui('pick').getAttribute('title'),/does not advertise/);result.checks.push('legacy host does not infer permission from wire v1');
 await page.evaluate(()=>window.fixture.set('supported'));await waitFor(async()=>!await ui('pick').isDisabled());assert.equal(await ui('source-map-clear').isDisabled(),false);assert.equal(await ui('atom-restore').isDisabled(),true);result.checks.push('current policy enables admitted controls after legacy fallback; no Restore before investigation');
 await page.evaluate(()=>window.fixture.set('readonly'));await waitFor(async()=>/Read-only/i.test(await ui('atom-run').getAttribute('title')));assert(await ui('atom-run').isDisabled());assert(await ui('experiment').isDisabled());result.checks.push('read-only policy disables existing edit controls with reason');
 await page.evaluate(()=>window.fixture.set('selected'));await waitFor(async()=>!await ui('pick').isDisabled());await ui('browser-connection').evaluate(e=>{e.open=true;});await ui('pick').click();await waitFor(async()=>await ui('status').innerText()==='OK');assert.equal(await ui('pick').isDisabled(),false);assert.equal(await ui('inspect-selector').isDisabled(),false);result.checks.push('clearing a selection leaves same-target picker and inspect controls available');
 await page.evaluate(()=>window.fixture.set('denied'));await ui('refresh-tabs').click();await waitFor(async()=>await ui('attach').innerText()==='Allow site and attach');assert.equal(await ui('attach').isDisabled(),false);await ui('attach').click();await waitFor(async()=>/denied/i.test(await ui('status').innerText()));assert.equal(await page.evaluate(()=>window.fixture.permissionRequests()),1);result.checks.push('denied HTTPS attach retains a user-invoked permission request path');
 result.status='PASS';await page.screenshot({path:out+'/candidate.png'});
}catch(e){result.status='FAIL';result.error=e.stack;throw e;}finally{await browser?.context.close();await writeFile(out+'/result.json',JSON.stringify(result,null,2));console.log(result.status,out);}
