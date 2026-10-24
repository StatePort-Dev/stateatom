// SPDX-License-Identifier: Apache-2.0
// Controlled source-template/style rendering, not a new native acquisition run.
import assert from 'node:assert/strict';import{readFile,writeFile,mkdir}from'node:fs/promises';import{createHash}from'node:crypto';import{chromium}from'playwright';
import{template}from'../../packages/atom/src/template.mjs';import{inspectionView}from'../../browser-extension/inspection-view.mjs';
const root=process.cwd(),out=root+'/.artifacts/a02/react19-font/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
const files=['packages/atom/src/template.mjs','packages/atom/src/atom.css','packages/extension-ui/dist/tokens.css','packages/extension-ui/dist/components.css'],sha=b=>createHash('sha256').update(b).digest('hex'),inputs={};for(const file of files)inputs[file]=sha(await readFile(root+'/'+file));
const retained=root+'/.artifacts/a02/react19-product-cache/2026-10-24T08-20-31-062Z/results.json',source=JSON.parse(await readFile(retained)),summary=inspectionView(source.observations.changedOther).nativeStateAncestors.summary;
const styles=(await Promise.all(files.slice(2).concat(files[1]).map(f=>readFile(root+'/'+f,'utf8')))).join('\n');
const result={schema:'stateatom.react19-controlled-font/1',scope:'Controlled source-template CSS rendering with copied historical summary text only; no app, extension, native acquisition, complete visual fidelity or human acceptance claim',browserPlugin:'Browser plugin not available',sourceRecord:retained,sourceRecordHash:sha(await readFile(retained)),inputs,checks:[],errors:[],screenshots:[],status:'RUNNING'};let browser,page;
try{
 browser=await chromium.launch({headless:true,chromiumSandbox:true});page=await browser.newPage({viewport:{width:440,height:900}});await page.route('**/*',r=>r.abort());
 await page.setContent('<!doctype html><meta charset="utf-8"><title>Controlled Atom native summary font</title><style>'+styles+'</style><p id="outside" class="sp-atom-native-state">Adjacent host paragraph</p><section data-sp-ui data-atom-root style="width:440px;max-width:100%;height:900px">'+template+'</section>');
 await page.locator('[data-atom-id="native-state-summary"]').evaluate((e,text)=>{e.hidden=false;e.textContent=text;},summary);
 for(const width of[440,360]){
  await page.setViewportSize({width,height:900});const measured=await page.evaluate(()=>{const e=document.querySelector('[data-atom-id="native-state-summary"]'),p=e.closest('.sp-atom-boundaries'),root=e.closest('[data-atom-root]');return{font:getComputedStyle(e).fontSize,bodyToken:getComputedStyle(root).getPropertyValue('--sp-font-size-body').trim(),parentFont:getComputedStyle(p).fontSize,outside:getComputedStyle(document.querySelector('#outside')).fontSize,overflow:e.scrollWidth>e.clientWidth+1};});
  result.checks.push({width,measured});assert.equal(measured.font,'13px','New data paragraph must not inherit 11px evidence metadata typography');assert.equal(measured.font,measured.bodyToken);assert.equal(measured.parentFont,'11px','Other evidence typography must remain scoped');assert.equal(measured.outside,'16px','Adjacent host CSS must remain unchanged');assert.equal(measured.overflow,false);
  await page.locator('[data-atom-id="evidence-section"]').scrollIntoViewIfNeeded();const file=out+'/source-'+width+'-candidate.png';await page.screenshot({path:file});result.screenshots.push(file);
 }
 result.status='PASS_CONTROLLED_FONT_ONLY';
}catch(e){result.errors.push(String(e.stack||e));result.status='FAIL_CONTROLLED_FONT_ONLY';process.exitCode=1;if(page)await page.screenshot({path:out+'/failure-candidate.png'}).catch(()=>{});}
finally{await browser?.close();result.browserClosed=true;await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out+'/results.json');}
