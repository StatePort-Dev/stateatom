// SPDX-License-Identifier: Apache-2.0
// Trusted local Node provisioning evidence. This is not native attestation.
import {mkdir,lstat,realpath,readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {randomUUID,createHash} from 'node:crypto';

const sessions=new WeakMap(),LIFETIME=15*60*1000;
const safeString=(v,max=256)=>typeof v==='string'&&v.length>0&&v.length<=max&&!/[\x00-\x1f\x7f]/.test(v);
const owned=st=>typeof process.getuid!=='function'||st.uid===process.getuid();
const canonical=v=>JSON.stringify(v&&typeof v==='object'?Array.isArray(v)?v.map(x=>JSON.parse(canonical(x))):Object.fromEntries(Object.keys(v).sort().map(k=>[k,JSON.parse(canonical(v[k]))])):v);
const digest=v=>createHash('sha256').update(v).digest('hex');
function active(s){return s&&!s.closed&&!s.invalid&&Date.now()<s.startedAt+LIFETIME;}
export function isOwnedControlledBrowserWitness(value){const s=value&&typeof value==='object'?sessions.get(value):null;if(s&&!active(s))stopTransport(s);return !!active(s);}

async function safeDirectory(dir,{privateMode=false}={}){
 const st=await lstat(dir);
 if(!st.isDirectory()||st.isSymbolicLink()||!owned(st)||(st.mode&0o022)||(privateMode&&(st.mode&0o777)!==0o700)||await realpath(dir)!==dir)throw Error('Directory denied');
}
async function outputIdentity(root){
 const base=path.join(root,'dist','browser');
 // Build outputs can be group writable in a developer checkout. Symlinks and
 // non-files are refused; exact bytes are compared before and after launch.
 for(const dir of [path.join(root,'dist'),base]){const st=await lstat(dir);if(!st.isDirectory()||st.isSymbolicLink()||!owned(st)||await realpath(dir)!==dir)throw Error('Built output denied');}
 const records=[];let total=0,entries=0;
 async function walk(dir,depth=0){
  if(depth>8)throw Error('Output budget exceeded');
  const names=(await readdir(dir)).sort();
  for(const name of names){if(++entries>128)throw Error('Output budget exceeded');const file=path.join(dir,name),st=await lstat(file);if(st.isSymbolicLink()||!owned(st))throw Error('Built output denied');
   if(st.isDirectory())await walk(file,depth+1);else{if(!st.isFile()||st.size>8*1024*1024||(total+=st.size)>32*1024*1024)throw Error('Output budget exceeded');const bytes=await readFile(file);if(bytes.length!==st.size)throw Error('Built output changed');records.push([path.relative(base,file),digest(bytes)]);}
  }
 }
 await walk(base);
 const manifestFile=path.join(base,'manifest.json');if(!records.some(r=>r[0]==='manifest.json')||(await lstat(manifestFile)).size>32*1024)throw Error('Built manifest denied');
 const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
 if(manifest.manifest_version!==3||manifest.name!=='StateAtom'||!safeString(manifest.version,80)||manifest.background?.type!=='module'||manifest.background.service_worker!=='worker.js'||!records.some(r=>r[0]==='worker.js'))throw Error('Built manifest denied');
 return {base,manifest,workerDigest:records.find(r=>r[0]==='worker.js')[1],identity:digest(JSON.stringify(records))};
}
function commandLine(args,s){
 if(!Array.isArray(args)||args.length>256||args.some(a=>typeof a!=='string'||a.length>32768))throw Error('Native launch facts unavailable');
 if(args.some(a=>/^--(?:no-sandbox|disable-setuid-sandbox)(?:=|$)/.test(a)))throw Error('Sandbox denied');
 for(const flag of ['--disable-extensions-except','--load-extension'])if(args.filter(a=>a===flag||a.startsWith(flag+'=')).length!==1||!args.includes(flag+'='+s.output.base))throw Error('Extension launch denied');
 if(args.filter(a=>a==='--user-data-dir'||a.startsWith('--user-data-dir=')).length!==1||!args.includes('--user-data-dir='+s.profile))throw Error('Profile launch denied');
}
async function nativeFacts(s){
 const [target,version,line,tree,targets]=await Promise.all([
  s.cdp.send('Target.getTargetInfo'),s.cdp.send('Browser.getVersion'),s.cdp.send('Browser.getBrowserCommandLine'),s.cdp.send('Page.getFrameTree'),s.cdp.send('Target.getTargets')
 ]);
 const info=target.targetInfo,frame=tree.frameTree?.frame;
 if(!info||info.type!=='page'||info.openerId||info.openerFrameId||!safeString(info.targetId)||s.targetId&&s.targetId!==info.targetId||!frame||frame.parentId||!safeString(frame.id)||tree.frameTree.childFrames?.length)throw Error('Native target facts unavailable');
 if(!safeString(version.product,160)||!version.product.startsWith('Chrome/')&&!version.product.startsWith('HeadlessChrome/'))throw Error('Native browser version unavailable');
 commandLine(line.arguments,s);
 if(!Array.isArray(targets.targetInfos)||targets.targetInfos.length>128)throw Error('Native extension facts unavailable');
 if(!s.targetHistory?.consistent(targets.targetInfos)||!targets.targetInfos.some(t=>t.targetId===info.targetId&&t.type===info.type&&t.url===info.url))throw Error('Native target history unavailable');
 const extensionTargets=targets.targetInfos.filter(t=>typeof t.url==='string'&&t.url.startsWith('chrome-extension://'));
 const extensionIds=new Set(extensionTargets.map(t=>new URL(t.url).hostname));
 if(extensionIds.size!==1||!extensionIds.has(s.extensionId)||!extensionTargets.some(t=>t.type==='service_worker'&&t.url===s.workerURL))throw Error('Sole extension facts unavailable');
 const installed=await s.browser.worker.evaluate(async targetId=>{
  const targets=await chrome.debugger.getTargets();
  if(!Array.isArray(targets)||targets.length>128)return null;
  const matches=targets.filter(t=>t.id===targetId);if(matches.length!==1)return null;
  const target=matches[0];if(target.type!=='page'||!Number.isSafeInteger(target.tabId)||target.tabId<1)return null;
  const tab=await chrome.tabs.get(target.tabId);
  return {id:chrome.runtime.id,manifest:chrome.runtime.getManifest(),url:globalThis.location.href,app:{targetId:target.id,tabId:target.tabId},tab:{id:tab.id,openerTabId:tab.openerTabId}};
 },info.targetId);
 if(installed?.id!==s.extensionId||installed.url!==s.workerURL||canonical(installed.manifest)!==canonical(s.output.manifest))throw Error('Installed output identity unavailable');
 if(installed.app?.targetId!==info.targetId||!Number.isSafeInteger(installed.app.tabId)||installed.tab?.id!==installed.app.tabId||installed.tab.openerTabId!==undefined)throw Error('Native app tab join unavailable');
 const output=await outputIdentity(s.root);if(output.identity!==s.output.identity)throw Error('Built output changed');
 return {targetId:info.targetId,browserVersion:version.product,frameId:frame.id,url:info.url};
}
async function boundedFacts(s){
 let timer;
 try{return await Promise.race([nativeFacts(s),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Native facts unavailable')),2000);})]);}
 finally{clearTimeout(timer);}
}

// This is a transport scheduling guard, never helper-invocation authority. The
// actual fetch/exchange verifier remains responsible for any effect evidence.
const SCRIPT_PATTERN='http://127.0.0.1:4173/closed-profile/*.js',GATE_MS=2000;
const bundleURL=v=>typeof v==='string'&&/^http:\/\/127\.0\.0\.1:4173\/closed-profile\/[a-f0-9]{64}\.js$/.test(v);
async function timed(promise,ms){
 let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Controlled transport deadline')),ms);})]);}finally{clearTimeout(timer);}
}
function currentGate(s,g){return active(s)&&s.gate===g&&!g.cancelled&&g.frameId===s.mainFrameId&&g.contextId===s.context?.id&&g.contextUniqueId===s.context?.uniqueId;}
function deliveryReady(s){return !!(s.gate&&currentGate(s,s.gate)&&s.gate.delivered&&s.paused.size===0);}
function transportTask(s,promise){
 s.transportTasks.add(promise);
 promise.then(()=>s.transportTasks.delete(promise),()=>{s.transportTasks.delete(promise);stopTransport(s);});
}
function cancelGate(s){const g=s.gate;s.gate=null;if(g){g.cancelled=true;g.resolve(false);}}
function stopTransport(s){
 // Terminal admission denial is synchronous, before any cleanup await or new
 // request/task allocation. Every later event returns without new work.
 s.transportStopped=true;s.invalid=true;cancelGate(s);
 if(s.transportStop)return s.transportStop;
 const pending=[...s.paused.values()];
 s.transportStop=Promise.resolve().then(async()=>{
  const releases=await Promise.allSettled(pending.map(p=>resumePaused(s,p)));
  let success=releases.every(r=>r.status==='fulfilled'&&r.value===true);
  try{await timed(s.cdp.send('Fetch.disable'),400);}
  catch{
   success=false;
   // Disabling is attempted once. A native failure must still release this
   // session's interception ownership, including an unadmitted overflow event.
   try{await timed(s.cdp.detach(),400);s.cdpDetached=true;}catch{}
  }
  return success;
 }).catch(()=>false);
 return s.transportStop;
}
async function resumePaused(s,p){
 if(p.release)return p.release;
 p.release=(async()=>{
  try{await timed(s.cdp.send('Fetch.continueRequest',{requestId:p.id}),400);return true;}
  catch{
   stopTransport(s);
   try{await timed(s.cdp.send('Fetch.failRequest',{requestId:p.id,errorReason:'Aborted'}),400);}catch{}
   return false;
  }finally{s.paused.delete(p.id);}
 })();return p.release;
}
function clearGate(s){
 cancelGate(s);
 // Clean navigation can obtain a new context gate. Losing a context with held
 // bytes, terminal facts, or expiry permanently denies further admission.
 if(s.paused.size||!active(s))stopTransport(s);
}
function contextGate(s){
 clearGate(s);if(s.transportStopped)return;
 const c=s.context;if(!c||!Number.isSafeInteger(c.id)||!safeString(c.uniqueId)||c.frameId!==s.mainFrameId)return;
 let resolve;const helper=new Promise(r=>{resolve=r;});
 s.gate={frameId:c.frameId,contextId:c.id,contextUniqueId:c.uniqueId,cancelled:false,helperCompiled:false,delivered:false,requestSeen:false,candidates:new Set(),helper,resolve};
}
function observeHelper(s,p){
 if(s.transportStopped)return;
 if(!active(s)||!p||typeof p!=='object'){stopTransport(s);return;}
 const g=s.gate;if(!g||!currentGate(s,g)||p.executionContextId!==g.contextId||!s.policyLengths.has(p.length))return;
 if(!safeString(p.scriptId)||p.isLiveEdit===true||p.executionContextAuxData?.frameId&&p.executionContextAuxData.frameId!==g.frameId||p.executionContextAuxData?.isDefault===false){stopTransport(s);return;}
 if(g.candidates.has(p.scriptId))return;
 if(g.candidates.size>=8||s.sourceRequests>=128){stopTransport(s);return;}
 g.candidates.add(p.scriptId);s.sourceRequests++;
 transportTask(s,acquireHelper(s,g,p));
}
async function acquireHelper(s,g,p){
 try{
  const {scriptSource}=await timed(s.cdp.send('Debugger.getScriptSource',{scriptId:p.scriptId}),500);
  if(!currentGate(s,g))return;
  if(typeof scriptSource!=='string'||scriptSource.length>32770||scriptSource.length!==p.length){stopTransport(s);return;}
  if(s.policySources.has(scriptSource)){g.helperCompiled=true;g.resolve(true);}
 }catch{if(currentGate(s,g))stopTransport(s);}
}
function responseMetadata(p,s,g){
 if(!currentGate(s,g)||p.frameId!==g.frameId||p.resourceType!=='Script'||!bundleURL(p.request?.url)||p.request.method!=='GET'||p.responseStatusCode!==200||p.responseErrorReason!==undefined||p.redirectedRequestId!==undefined)return false;
 if(!Array.isArray(p.responseHeaders)||p.responseHeaders.length>64)return false;
 let size=0;for(const h of p.responseHeaders){if(!h||typeof h.name!=='string'||h.name.length>256||typeof h.value!=='string'||h.value.length>8192||(size+=h.name.length+h.value.length)>32768)return false;}
 return p.responseHeaders.some(h=>h.name.toLowerCase()==='content-type'&&/^text\/javascript\b/i.test(h.value));
}
function admitPausedScript(s,p){
 if(s.transportStopped)return;
 // Budget and metadata checks precede both the pending entry and its task.
 // An unadmitted request is released by the one terminal Fetch.disable path.
 const g=s.gate;
 if(!active(s)||!p||typeof p!=='object'||!safeString(p.requestId)||s.paused.size>=8||s.scriptRequests>=64||s.paused.has(p.requestId)||!g||g.requestSeen||!responseMetadata(p,s,g)){stopTransport(s);return;}
 const pending={id:p.requestId,release:null};
 s.scriptRequests++;s.paused.set(p.requestId,pending);g.requestSeen=true;
 transportTask(s,deliverPausedScript(s,pending,g,s.revision));
}
async function deliverPausedScript(s,pending,g,revision){
 try{
  await timed((async()=>{
   if(!await g.helper||!g.helperCompiled||!currentGate(s,g))throw Error('Controlled helper unavailable');
   // Native scheduling barriers do not assert that the helper was invoked or
   // that policy allowed generation. Only later actual fetch evidence can.
   const first=await s.cdp.send('Runtime.getIsolateId');
   const second=await s.cdp.send('Runtime.getIsolateId');
   if(!safeString(first.id)||first.id!==second.id||revision!==s.revision||!currentGate(s,g))throw Error('Controlled scheduling context changed');
  })(),GATE_MS);
  if(revision!==s.revision||!currentGate(s,g))throw Error('Controlled delivery context changed');
  const continued=await resumePaused(s,pending);
  if(!continued||revision!==s.revision||!currentGate(s,g))throw Error('Controlled delivery unavailable');
  g.delivered=true;
 }catch{await stopTransport(s);}
}
function closeTransport(s){return stopTransport(s);}

export async function controlledBrowserView(value){
 const s=value&&typeof value==='object'?sessions.get(value):null;if(!active(s)){if(s)stopTransport(s);return null;}
 const revision=s.revision;
 try{
  const facts=await boundedFacts(s);
  if(!active(s)||!deliveryReady(s)||revision!==s.revision||facts.frameId!==s.mainFrameId||!s.context||s.context.frameId!==facts.frameId||facts.url==='about:blank'||!safeString(s.context.uniqueId))return null;
  return Object.freeze({schema:1,witnessId:s.witnessId,targetId:s.targetId,extensionId:s.extensionId,browserVersion:facts.browserVersion,mainFrameId:facts.frameId,contextUniqueId:s.context.uniqueId,startedAt:s.startedAt,freshProfile:true,sandbox:true,soleStateAtomExtension:true});
 }catch{stopTransport(s);return null;}
}

export async function launchControlledFirstReadBrowser({projectRoot=process.cwd(),headed=true,appProfile='first-read'}={}){
 let s,browser,cdp,panelCDP,closing;
 async function close(){
  if(closing)return closing;
  if(s){s.closed=true;s.context=null;s.revision++;clearTimeout(s.expiryTimer);s.targetHistory?.close();for(const [event,handler] of s.targetHandlers||[])cdp.off(event,handler);s.targetHandlers=[];stopTransport(s);}
  closing=(async()=>{
   // Detach while the target is still alive; browser shutdown must not race
   // the detach. Failure of either release still permits the other attempt.
   let failed=false;
   try{if(s?.discoveryStarted&&!s.cdpDetached)await timed(cdp.send('Target.setDiscoverTargets',{discover:false}),400);}catch{failed=true;}
   if(s&&!await closeTransport(s))failed=true;
   try{if(panelCDP)await timed(panelCDP.detach(),400);}catch{failed=true;}
   try{if(cdp&&!s?.cdpDetached)await cdp.detach();}catch{failed=true;}
   try{if(browser)await browser.context.close();}catch{failed=true;}
   if(failed)throw Error('Controlled first-read browser cleanup failed');
  })();return closing;
 }
 try{
  if(typeof headed!=='boolean'||typeof projectRoot!=='string'||!['first-read','selected-list'].includes(appProfile))throw Error('Launch options denied');
  const root=path.resolve(projectRoot);if(await realpath(root)!==root)throw Error('Workspace denied');
  const rootStat=await lstat(root);if(!rootStat.isDirectory()||!owned(rootStat))throw Error('Workspace denied');
  const output=await outputIdentity(root);
  // Acquire the exact already-built helper declaration, not a differently
  // formatted Node function or a fuzzy/semantically equivalent source.
  const workerBytes=await readFile(path.join(output.base,'worker.js'));
  if(digest(workerBytes)!==output.workerDigest)throw Error('Built worker changed');
  const parserURL=pathToFileURL(createRequire(path.join(root,'package.json')).resolve('@babel/parser')).href;
  const parser=await import(parserURL),workerText=workerBytes.toString('utf8');
  const ast=parser.parse(workerText,{sourceType:'module'});
  const helpers=ast.program.body.filter(n=>n.type==='FunctionDeclaration'&&n.id?.name==='installFetchPolicy');
  if(helpers.length!==1)throw Error('Built policy declaration unavailable');
  const helper=helpers[0];
  if(!Number.isSafeInteger(helper.start)||!Number.isSafeInteger(helper.end)||helper.start<0||helper.end<=helper.start||helper.end>workerText.length||helper.end-helper.start>32768)throw Error('Built policy declaration denied');
  const declaration=workerText.slice(helper.start,helper.end),policySources=new Set([declaration,'('+declaration+')','('+declaration+'\n)']);
  const policyLengths=new Set([...policySources].map(source=>source.length));
  let dir=root;
  for(const name of ['.runtime','first-read-sessions']){dir=path.join(dir,name);try{await mkdir(dir,{mode:0o700});}catch(e){if(e.code!=='EEXIST')throw e;}await safeDirectory(dir,{privateMode:name==='first-read-sessions'});}
  const runtime=path.join(dir,randomUUID());await mkdir(runtime,{mode:0o700});await safeDirectory(runtime,{privateMode:true});
  const profile=path.join(runtime,'browser');
  // Source-only import: installed CommonJS IDE acquisition must not bundle or
  // eagerly load Playwright, Vite, or this development harness.
  const harnessURL=new URL("../../scripts/harness.mjs",import.meta.url).href;
  const {startBrowser}=await import(harnessURL);
  // This explicit automation pipeline needs Chromium's native command-line
  // reporting gate; no caller-supplied launch switches are forwarded.
  browser=await startBrowser(runtime,'browser',true,headed,['--enable-automation']);
  const profileStat=await lstat(profile);if(!profileStat.isDirectory()||profileStat.isSymbolicLink()||await realpath(profile)!==profile)throw Error('Fresh profile unavailable');
  const extensionId=browser.id,workerURL=browser.worker?.url();
  if(!/^[a-p]{32}$/.test(extensionId)||workerURL!=='chrome-extension://'+extensionId+'/'+output.manifest.background.service_worker)throw Error('Extension identity unavailable');
  const initialPages=browser.context.pages();if(initialPages.some(p=>p.url()!=='about:blank')||initialPages.length>1)throw Error('Unexpected initial page');
  // The fresh browser's initial blank has no browser-tab opener. Creating a
  // second tab can assign openerTabId even when CDP/page.opener report none.
  const page=initialPages[0]||await browser.context.newPage();if(page.url()!=='about:blank'||await page.opener())throw Error('App target denied');
  cdp=await browser.context.newCDPSession(page);
  s={root,output,profile,runtime,browser,cdp,extensionId,workerURL,witnessId:randomUUID(),startedAt:Date.now(),closed:false,invalid:false,revision:0,context:null,mainFrameId:null,targetId:null,gate:null,paused:new Map(),transportTasks:new Set(),sourceRequests:0,scriptRequests:0,policySources,policyLengths,transportStopped:false,transportStop:null,cdpDetached:false};
  s.expiryTimer=setTimeout(()=>stopTransport(s),LIFETIME);s.expiryTimer.unref?.();
  const revoke=()=>{if(s.closed)return;s.invalid=true;s.context=null;s.revision++;clearGate(s);};
  browser.context.on('close',revoke);page.on('close',revoke);page.on('crash',revoke);browser.worker.on('close',revoke);cdp.on('close',revoke);
  // Provision the sole trusted panel while the only app is still blank. Its
  // temporary blank target exists before app code and before witness issuance.
  const panelURL='chrome-extension://'+extensionId+'/panel.html';
  const panel=await browser.context.newPage();
  panel.on('close',revoke);panel.on('crash',revoke);
  if(panel.url()!=='about:blank'||page.url()!=='about:blank')throw Error('Initial panel denied');
  await panel.goto(panelURL);
  panelCDP=await browser.context.newCDPSession(panel);
  const {acquireGuardianTargets}=await import('./guardian-targets.mjs');
  const guardian=await acquireGuardianTargets({cdp,extensionWorker:browser.worker,base:output.base,extensionId});
  const [appTarget,panelTarget,panelTree,inventory]=await Promise.all([cdp.send('Target.getTargetInfo'),panelCDP.send('Target.getTargetInfo'),panelCDP.send('Page.getFrameTree'),cdp.send('Target.getTargets')]);
  const panelInfo=panelTarget.targetInfo,panelFrame=panelTree.frameTree?.frame;
  if(page.url()!=='about:blank'||appTarget.targetInfo?.url!=='about:blank'||panel.url()!==panelURL||panelInfo?.type!=='page'||panelInfo.url!==panelURL||!safeString(panelInfo.targetId)||!panelFrame||panelFrame.url!==panelURL||panelFrame.parentId||panelTree.frameTree.childFrames?.length)throw Error('Native panel identity unavailable');
  const workers=inventory.targetInfos?.filter(t=>t.type==='service_worker'&&t.url===workerURL);
  if(!Array.isArray(workers)||workers.length!==1)throw Error('Native worker identity unavailable');
  s.targetId=appTarget.targetInfo.targetId;
  const {createTargetHistory}=await import('./target-history.mjs');
  s.targetHistory=createTargetHistory({appId:s.targetId,panelId:panelInfo.targetId,workerId:workers[0].targetId,panelURL,workerURL,initial:inventory.targetInfos,guardian,profile:appProfile});
  s.targetHandlers=[];
  for(const [event,kind] of [['Target.targetCreated','created'],['Target.targetInfoChanged','changed'],['Target.targetDestroyed','destroyed'],['Target.targetCrashed','crashed']]){
   const handler=e=>{if(!s.closed&&!s.targetHistory.observe(kind,e?.targetInfo??e))stopTransport(s);};
   cdp.on(event,handler);s.targetHandlers.push([event,handler]);
  }
  // Required native discovery replay and post-enable scheduling/inventory
  // agreement close initialization before any caller can navigate the app.
  s.discoveryStarted=true;
  await timed(cdp.send('Target.setDiscoverTargets',{discover:true}),2000);
  const discoveryBarrier=await timed(cdp.send('Runtime.getIsolateId'),2000);
  if(!safeString(discoveryBarrier.id)||!s.targetHistory.consistent((await timed(cdp.send('Target.getTargets'),2000)).targetInfos)||!active(s))throw Error('Native target discovery unavailable');
  await panelCDP.detach();panelCDP=null;
  cdp.on('Runtime.executionContextsCleared',()=>{s.context=null;s.revision++;clearGate(s);});
  cdp.on('Runtime.executionContextDestroyed',e=>{if(s.context&&(e.executionContextUniqueId===s.context.uniqueId||e.executionContextId===s.context.id)){s.context=null;s.revision++;clearGate(s);}});
  cdp.on('Runtime.executionContextCreated',({context})=>{if(context.auxData?.isDefault===true){if(context.auxData.frameId!==s.mainFrameId){s.context=null;s.revision++;clearGate(s);return;}s.context={id:context.id,uniqueId:context.uniqueId,frameId:context.auxData.frameId};s.revision++;contextGate(s);}});
  cdp.on('Debugger.scriptParsed',p=>observeHelper(s,p));
  cdp.on('Fetch.requestPaused',p=>admitPausedScript(s,p));
  cdp.on('Page.frameAttached',revoke);
  cdp.on('Page.frameDetached',e=>{if(e.frameId===s.mainFrameId)revoke();});
  cdp.on('Page.frameNavigated',({frame})=>{if(frame.parentId){revoke();return;}s.mainFrameId=frame.id;s.context=null;s.revision++;clearGate(s);});
  await cdp.send('Page.enable');
  const initialTree=await cdp.send('Page.getFrameTree');s.mainFrameId=initialTree.frameTree?.frame?.id;
  await cdp.send('Runtime.enable');
  await cdp.send('Debugger.enable',{maxScriptsCacheSize:2*1024*1024});
  await cdp.send('Fetch.enable',{patterns:[{urlPattern:SCRIPT_PATTERN,resourceType:'Script',requestStage:'Response'}]});
  const facts=await boundedFacts(s);s.targetId=facts.targetId;
  if(facts.url!=='about:blank'||facts.frameId!==s.mainFrameId||!s.context||!safeString(s.context.uniqueId))throw Error('Initial native facts unavailable');
  const witness=Object.freeze({});sessions.set(witness,s);
  if(!active(s))throw Error('Controlled browser revoked');
  return {browser,page,panel,runtime,witness,close};
 }catch(error){await close().catch(()=>{});throw Error('Controlled first-read browser initialization failed',{cause:error});}
}
