// SPDX-License-Identifier: Apache-2.0
// Chrome internal UI + native folder chooser on one owned nested display only.
import assert from 'node:assert/strict';
import {readFile,writeFile,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {waitFor} from '../../scripts/harness.mjs';
export async function installGuideExtension({send,session,command},{folder,desktop,out,role,expectedBrowser,expectedExecutableSha256}){
 const record={schema:'stateatom.guide-extension-install/1',role,status:'RUNNING',startedAt:new Date().toISOString(),command,folder,steps:[],screens:[]};
 let page,inspect;
 const shot=name=>{const file=out+'/'+role+'-'+name+'.png';desktop.shot(file);record.screens.push(file);return file;};
 try{
  assert.equal(command.extensionSetup,'guide-ui');
  assert(!command.args.some(a=>/^--(?:load-extension|disable-extensions|ignore-certificate|headless)/.test(a)));
  const actual=(await readFile('/proc/'+command.pid+'/cmdline','utf8')).split('\0').filter(Boolean);
  record.processCmdlineNulSegments=actual;record.processCmdlineFormat='Raw proc segments; Chromium may collapse/rewrite process title and append internal flags';
  const processTitle=actual.join(' ');assert.equal(await realpath('/proc/'+command.pid+'/exe'),await realpath(command.executable));for(const arg of command.args)assert(processTitle.includes(arg),'Owned process command retains '+arg);assert(!/(?:^|\s)--(?:load-extension|disable-extensions(?:-except)?|ignore-certificate-errors)(?:=|\s|$)/.test(processTitle),'Actual process command must not preload extensions or bypass certificates');
  record.browser=(await send('Browser.getVersion')).product;assert.equal(record.browser,expectedBrowser);record.executableSha256=createHash('sha256').update(await readFile(command.executable)).digest('hex');assert.equal(record.executableSha256,expectedExecutableSha256);
  const {targetId}=await send('Target.createTarget',{url:'chrome://extensions/'});record.targetId=targetId;page=await session(targetId);await page.send('Runtime.enable');await page.send('Page.bringToFront');
  const evaluate=async(fn,arg)=>{const r=await page.send('Runtime.evaluate',{expression:'('+fn.toString()+')('+JSON.stringify(arg)+')',awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  inspect=()=>evaluate(()=>{
   const nodes=[];function walk(node){if(nodes.length>=5000)throw Error('Chrome extension DOM inspection limit');nodes.push(node);if(node.shadowRoot)walk(node.shadowRoot);for(const child of node.children||[])walk(child);}walk(document.documentElement);
   const control=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{id:e.id,tag:e.tagName,label:e.innerText||e.getAttribute('aria-label'),checked:e.checked??e.getAttribute('aria-checked'),disabled:e.disabled===true,visible:r.width>0&&r.height>0,x:r.x+r.width/2,y:r.y+r.height/2};};
   return{url:location.href,ready:document.readyState,title:document.title,dev:control(nodes.find(e=>e.tagName==='CR-TOGGLE'&&e.id==='devMode')),load:control(nodes.find(e=>e.id==='loadUnpacked')),cards:nodes.filter(e=>e.tagName==='EXTENSIONS-ITEM').map(e=>({id:e.id,name:e.shadowRoot?.querySelector('#name')?.textContent.trim(),text:e.shadowRoot?.innerHTML?e.shadowRoot.textContent.slice(-5000):e.textContent})),controls:nodes.filter(e=>['CR-TOGGLE','CR-BUTTON'].includes(e.tagName)).map(control).slice(0,40)};
  });
  const click=async control=>{assert(control?.visible&&!control.disabled,'Expected visible enabled Chrome control');for(const type of ['mouseMoved','mousePressed','mouseReleased'])await page.send('Input.dispatchMouseEvent',{type,x:control.x,y:control.y,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});};
  const initial=await waitFor(async()=>{const s=await inspect();return s.ready==='complete'&&s.dev?s:null;});record.initial=initial;assert(!initial.cards.some(c=>c.name==='StateAtom'),'Fresh UI profile cannot already contain StateAtom');shot('extensions-empty');record.steps.push({action:'observed fresh extensions page without StateAtom',at:new Date().toISOString()});
  if(initial.dev.checked!==true&&initial.dev.checked!=='true')await click(initial.dev);
  const enabled=await waitFor(async()=>{const s=await inspect();return(s.dev.checked===true||s.dev.checked==='true')&&s.load?.visible?s:null;});record.developerMode=enabled;shot('developer-mode');
  const windows=()=>desktop.native(['search','--onlyvisible','--name','.']).split('\n').filter(Boolean);
  const previous=new Set(windows());await click(enabled.load);record.steps.push({action:'trusted Load unpacked click',at:new Date().toISOString()});
  const chooser=await waitFor(()=>{for(const id of windows().reverse())if(!previous.has(id)){const title=desktop.native(['getwindowname',id]);if(/extension|folder|directory/i.test(title))return{id,title};}return null;});record.chooser=chooser;desktop.native(['windowfocus',chooser.id]);shot('native-folder-chooser');
  desktop.native(['key','--clearmodifiers','ctrl+l']);desktop.native(['type','--clearmodifiers','--delay','1',folder]);shot('folder-entered');
  const geometry=Object.fromEntries(desktop.native(['getwindowgeometry','--shell',chooser.id]).split('\n').map(s=>s.split('=')));assert(Number(geometry.WIDTH)>500&&Number(geometry.HEIGHT)>300);record.chooser.geometry=geometry;
  desktop.native(['mousemove',String(Number(geometry.X)+Number(geometry.WIDTH)-49),String(Number(geometry.Y)+Number(geometry.HEIGHT)-22),'click','1']);record.steps.push({action:'native folder chooser confirmation',at:new Date().toISOString()});
  const installed=await waitFor(async()=>{const s=await inspect();return s.cards.some(c=>c.name==='StateAtom')?s:null;},30000);record.installed=installed;shot('extension-installed');record.steps.push({action:'rendered StateAtom card after folder selection',at:new Date().toISOString()});record.status='PASS_RENDERED_UI_AND_NATIVE_CHOOSER_NOT_TOOLBAR_USABILITY';
 }catch(e){record.status='FAIL';record.error=e.stack;try{record.failureState=await inspect?.();}catch(f){record.failureStateError=f.message;}try{shot('install-failure');}catch(f){record.failureScreenshotError=f.message;}throw e;}
 finally{await page?.detach().catch(()=>{});record.finishedAt=new Date().toISOString();await writeFile(out+'/'+role+'-installation.json',JSON.stringify(record,null,2),{flag:'wx'});}
 return record;
}
