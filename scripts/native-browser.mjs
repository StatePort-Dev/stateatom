// SPDX-License-Identifier: Apache-2.0
// Backend fault-test driver: no automatic debugger attachment to app/worker.
// Application CDP attaches lazily, only after Atom's native admission.
import {spawn} from 'node:child_process';
import path from 'node:path';
import {mkdir,readFile,readdir,open} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {chromium} from 'playwright';
import {root} from './vite-config.mjs';
import {waitFor} from './harness.mjs';
class NativeCDP {
 constructor(socket){this.socket=socket;this.next=0;this.pending=new Map();this.listeners=new Map();socket.addEventListener('message',event=>{const m=JSON.parse(String(event.data));if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}else{for(const fn of this.listeners.get((m.sessionId||'')+':'+m.method)||[])fn(m.params);}});socket.addEventListener('close',()=>{for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('Native CDP closed'));}this.pending.clear();});}
 send(method,params={},sessionId){const id=++this.next;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('Native CDP timeout: '+method));},20000);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
 on(sessionId,event,fn){const key=(sessionId||'')+':'+event,list=this.listeners.get(key)||[];list.push(fn);this.listeners.set(key,list);}
 async session(targetId){const {sessionId}=await this.send('Target.attachToTarget',{targetId,flatten:true});return{send:(method,params)=>this.send(method,params,sessionId),on:(event,fn)=>this.on(sessionId,event,fn),detach:()=>this.send('Target.detachFromTarget',{sessionId})};}
}
export async function startNativeBrowser(runtime,name,_withExtension,_headed,extra=[],{extensionPath,headless=true,display,beforeExtensionLoad}={}){
 if(beforeExtensionLoad!==undefined&&(typeof beforeExtensionLoad!=='function'||headless||extra.some(a=>/^--(?:load-extension|disable-extensions(?:-except)?)(?:=|$)/.test(a))))throw Error('Guide installation requires headful owned UI setup without extension CLI flags');
 const profile=runtime+'/'+name;await mkdir(profile,{recursive:true});let executable=chromium.executablePath();if(existsSync(root+'/.browsers')){const dir=(await readdir(root+'/.browsers')).find(n=>/^chromium-/.test(n));if(dir)executable=root+'/.browsers/'+dir+'/chrome-linux64/chrome';}
 const args=[...(headless?['--headless=new']:[]),'--remote-debugging-port=0','--user-data-dir='+profile,...(beforeExtensionLoad?[]:['--disable-extensions-except='+extensionPath,'--load-extension='+extensionPath]),'--no-first-run','--no-default-browser-check','--disable-dev-shm-usage',...extra,'about:blank'];
 const launchEnvironment={...process.env,...(display?{DISPLAY:display}:{}),...(!headless&&display?{DBUS_SESSION_BUS_ADDRESS:'unix:path='+path.resolve(profile,'no-shared-session-bus'),GTK_USE_PORTAL:'0'}:{})};
 const log=await open(profile+'/chrome.log','a'),child=spawn(executable,args,{stdio:['ignore',log.fd,log.fd],env:launchEnvironment});
 const command={executable,args:[...args],profile,pid:child.pid,extensionSetup:beforeExtensionLoad?'guide-ui':'historical-cli-preload',...(beforeExtensionLoad?{configuredGuiEnvironment:Object.fromEntries(['XDG_DATA_HOME','XDG_CONFIG_HOME','XDG_CACHE_HOME','DISPLAY'].map(k=>[k,launchEnvironment[k]??null]))}:{})};
 let cdp,closed=false;const pages=[];
 const close=async()=>{if(closed)return;closed=true;try{await cdp?.send('Browser.close');}catch{}if(child.exitCode===null){child.kill('SIGTERM');try{await waitFor(()=>child.exitCode!==null,5000);}catch{child.kill('SIGKILL');}}cdp?.socket.close();await log.close();};
 try{
  const endpoint=await waitFor(async()=>{if(child.exitCode!==null)throw Error('Native Chrome exited '+child.exitCode);const [port,path]=String(await readFile(profile+'/DevToolsActivePort')).trim().split('\n');return'ws://127.0.0.1:'+port+path;});const socket=new WebSocket(endpoint);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});cdp=new NativeCDP(socket);
  const version=await cdp.send('Browser.getVersion'),manifest=JSON.parse(await readFile(extensionPath+'/manifest.json'));
  if(beforeExtensionLoad)await beforeExtensionLoad({send:cdp.send.bind(cdp),session:cdp.session.bind(cdp),command});
  const worker=await waitFor(async()=>{const {targetInfos}=await cdp.send('Target.getTargets');return targetInfos.find(t=>t.type==='service_worker'&&t.url.startsWith('chrome-extension://')&&new URL(t.url).pathname==='/'+manifest.background.service_worker);});const id=new URL(worker.url).host;
  function page(){let targetId=null,session=null,sessionPromise=null;const handlers=new Map();
   async function attach(){if(!targetId)throw Error('Navigate native page first');if(!sessionPromise)sessionPromise=(async()=>{session=await cdp.session(targetId);session.on('Runtime.exceptionThrown',e=>{const message=e.exceptionDetails.exception?.description||e.exceptionDetails.text;for(const fn of handlers.get('pageerror')||[])fn(Error(message));});await session.send('Runtime.enable');return session;})();return sessionPromise;}
   async function evaluate(fn,arg){const s=await attach();const expression='('+fn.toString()+')('+JSON.stringify(arg)+')';const result=await s.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value;}
   function locator(selector,filter){return{click:()=>evaluate(selector=>{const el=document.querySelector(selector);if(!el)throw Error('Missing '+selector);el.click();},selector),textContent:()=>evaluate(selector=>document.querySelector(selector)?.textContent,selector),isDisabled:()=>evaluate(selector=>document.querySelector(selector)?.disabled,selector),filter:options=>locator(selector,options),waitFor:()=>waitFor(async()=>{const text=await evaluate(selector=>document.querySelector(selector)?.textContent,selector);return text!==undefined&&(!filter?.hasText||text===filter.hasText);})};}
   const p={async goto(url){if(targetId)throw Error('Native backend page navigation requires a new target');({targetId}=await cdp.send('Target.createTarget',{url}));if(url.startsWith('chrome-extension:')){await attach();await waitFor(()=>evaluate(url=>location.href===url&&document.readyState==='complete'&&!!chrome.runtime?.id,url));}},evaluate,locator,on(event,fn){const list=handlers.get(event)||[];list.push(fn);handlers.set(event,list);},async screenshot({path}){const shot=await(await attach()).send('Page.captureScreenshot',{format:'png'});await(await import('node:fs/promises')).writeFile(path,Buffer.from(shot.data,'base64'));},async session(){return cdp.session(targetId);}};pages.push(p);return p;
  }
  return{id,command,extensionWorker:worker,context:{newPage:async()=>page(),newCDPSession:p=>p.session(),browser:()=>({version:()=>version.product}),close}};
 }catch(e){await close();throw e;}
}
export async function nativeChooseTab(panel,url){return waitFor(async()=>{const r=await panel.evaluate(()=>chrome.runtime.sendMessage({op:'tabs'}));if(!r.ok)throw Error(r.error);return r.result.find(t=>t.url===url)?.id;});}
export async function nativeApproveDevelopment(panel,tabId){const reply=await panel.evaluate(async tabId=>{const tab=await chrome.tabs.get(tabId);return chrome.runtime.sendMessage({op:'connect-site',tabId,connection:{origin:new URL(tab.url).origin,mode:'development',actions:['cache','reload','override','replay']}});},tabId);if(!reply.ok)throw Error(reply.error);}
