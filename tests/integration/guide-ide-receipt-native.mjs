// SPDX-License-Identifier: Apache-2.0
// Actual public VS Code installation/receipt entry. Retained actual UI installation; only public Copy receipt.
import assert from 'node:assert/strict';
import path from 'node:path';
import {readFile,writeFile,mkdir,open,readdir,realpath} from 'node:fs/promises';
import {spawn,execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createServer,createConnection} from 'node:net';
import {chromium} from 'playwright';
import {sha256} from '../../scripts/atom-package-receipt.mjs';
import {connectOwnedIDE} from '../../scripts/owned-ide-endpoint.mjs';
import {verifyInstalledHelper} from '../../scripts/installed-helper.mjs';
import {sourceAccessDesktop} from '../helpers/source-access-native-desktop.mjs';
import {parseConnectionReceipt} from '../../core/project-connection.mjs';
import {waitFor} from '../../scripts/harness.mjs';
const [caseFile]=process.argv.slice(2);assert.equal(process.argv.length,3,'Exact preregistered case required');
const json=async f=>JSON.parse(await readFile(f)),scenario=await json(caseFile);assert.equal(scenario.schema,'stateatom.v03-ide-receipt-case/1');
const out=path.resolve('.artifacts/v03/guide-ide-receipt/'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)),{flag:'wx'});
const registered=[...new Set([caseFile,...Object.keys(scenario.inputHashes),...Object.keys(scenario.productInputs),...Object.keys(scenario.helperInputs)])];
const inputs=async()=>Object.fromEntries(await Promise.all(registered.map(async f=>[f,sha256(await readFile(f))])));
const r={schema:'stateatom.v03-ide-entry/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceDirty:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),scenario,out,checks:[],console:[],errors:[]};
let desktop,child,log,ide,view,session,spawnError;let helperPort;
const alive=()=>!!child&&child.exitCode===null&&child.signalCode===null&&!spawnError;
const check=async(name,fn)=>{await fn();r.checks.push({name,status:'PASS'});console.log('PASS '+name);};
const occupied=port=>new Promise(resolve=>{const s=createConnection({host:'127.0.0.1',port});s.setTimeout(800);s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(true);});});
async function freePort(){const s=createServer();await new Promise((resolve,reject)=>{s.once('error',reject);s.listen(0,'127.0.0.1',resolve);});const p=s.address().port;await new Promise((resolve,reject)=>s.close(e=>e?reject(e):resolve()));return p;}
async function sourceAudit(){const manifest=await json(scenario.project.sourceManifest);assert.equal(Object.keys(manifest).length,65);for(const[f,hash]of Object.entries(manifest)){assert.equal(sha256(await readFile(scenario.project.workingCopy+'/'+f)),hash,f);assert.equal(sha256(await readFile(scenario.project.immutableSource+'/'+f)),hash,f);}return manifest;}
const shot=name=>{const file=out+'/'+name+'.png';desktop.shot(file);return file;};
async function command(label,name){
 desktop.native(['key','--clearmodifiers','ctrl+shift+p']);
 await view.locator('.quick-input-widget').waitFor({state:'visible',timeout:5000});
 desktop.native(['key','--clearmodifiers','ctrl+a']);desktop.native(['type','--clearmodifiers','--delay','1','>'+label]);
 const choice=view.locator('.quick-input-list .monaco-list-row').filter({hasText:label});await choice.first().waitFor({state:'visible',timeout:5000});
 const text=await choice.first().innerText();assert(text.includes(label),'Public palette command missing');shot(name+'-palette');
 // Native Enter activates the visible filtered public command, no executeCommand API.
 desktop.native(['key','--clearmodifiers','Return']);
 (r.commands??=[]).push({label,visibleChoice:text,at:new Date().toISOString()});
}
try{
 r.inputsBefore=await inputs();
 await check('exact registered Code/helper/product/project inputs and new owned destination dirs',async()=>{
  for(const[f,hash]of Object.entries({...scenario.inputHashes,...scenario.productInputs,...scenario.helperInputs}))assert.equal(sha256(await readFile(f)),hash,f);
  assert.equal(sha256(await readFile(scenario.code.executable)),scenario.code.sha256);assert.equal((await json(scenario.code.packageFile)).version,scenario.code.version);assert.equal((await json(scenario.code.productFile)).commit,scenario.code.commit);
  assert.equal(sha256(await readFile(scenario.helper.file)),scenario.helper.sha256);r.originalSourceBefore=await sourceAudit();assert.equal(await occupied(49331),false,'Own debug port occupied; no existing instance adopted/stopped');
  await mkdir(out+'/user/User',{recursive:true});await mkdir(out+'/extensions');assert.deepEqual(await readdir(out+'/extensions'),[]);
 });
 const installed=await json(scenario.priorInstallation.file);assert.equal(sha256(await readFile(scenario.priorInstallation.file)),scenario.priorInstallation.sha256);assert.equal(installed.status,'PASS_ACTUAL_UI_INSTALL_PLUS_OFFLINE_PAYLOAD_NOT_RECEIPT_OR_FULL_V03');
 for(const[f,hash]of Object.entries(installed.persistentManifest)){assert(!f.endsWith('/DevToolsActivePort')&&!/Singleton(Lock|Cookie|Socket)$/.test(f));const from=path.join(installed.root,f),to=path.join(out,f);assert.equal(sha256(await readFile(from)),hash,f);await mkdir(path.dirname(to),{recursive:true});await writeFile(to,await readFile(from),{flag:'wx',mode:0o600});assert.equal(sha256(await readFile(to)),hash,f);}
 r.retainedInstallation={file:scenario.priorInstallation.file,actualInstallationRevision:installed.actualInstallationRevision,copiedRegularFiles:Object.keys(installed.persistentManifest).length,newInstallationClaim:false,originalProfileUnchanged:true};
 helperPort=await freePort();const settings={'telemetry.telemetryLevel':'off','update.mode':'none','extensions.autoUpdate':false,'extensions.ignoreRecommendations':true,'workbench.startupEditor':'none','chat.disableAIFeatures':true,'stateatom.appOrigin':scenario.origin,'stateatom.sourceFolder':scenario.sourceRoot,'stateatom.helperPort':helperPort};await writeFile(out+'/user/User/settings.json',JSON.stringify(settings));r.preparedSettings={file:out+'/user/User/settings.json',sha256:sha256(JSON.stringify(settings)),settingsUIClaim:false,origin:scenario.origin,sourceRoot:scenario.sourceRoot,helperPort};
 desktop=await sourceAccessDesktop(out);const env={...process.env,DISPLAY:desktop.display,DBUS_SESSION_BUS_ADDRESS:'unix:path=/tmp/stateatom-v03-no-bus-'+process.pid,GTK_USE_PORTAL:'0',XDG_DATA_HOME:out+'/xdg-data',XDG_CONFIG_HOME:out+'/xdg-config',XDG_CACHE_HOME:out+'/xdg-cache'};delete env.ELECTRON_RUN_AS_NODE;for(const k of ['XDG_DATA_HOME','XDG_CONFIG_HOME','XDG_CACHE_HOME'])await mkdir(env[k],{recursive:true});
 const args=[scenario.project.workingCopy,'--new-window','--user-data-dir='+out+'/user','--extensions-dir='+out+'/extensions','--shared-data-dir='+out+'/shared','--remote-debugging-port=49331','--disable-updates','--skip-welcome','--skip-release-notes'];
 log=await open(out+'/code.log','wx');child=spawn(scenario.code.executable,args,{env,stdio:['ignore',log.fd,log.fd]});child.on('error',e=>{spawnError=e;});r.command={executable:scenario.code.executable,args,pid:child.pid,display:desktop.display,userData:out+'/user',extensions:out+'/extensions',sharedData:out+'/shared'};await writeFile(out+'/registration.json',JSON.stringify(r,null,2),{flag:'wx'});
 ide=await connectOwnedIDE({readOutput:()=>readFile(out+'/code.log','utf8'),isRunning:alive,connect:(endpoint,options)=>{r.ownedEndpoint=endpoint;return chromium.connectOverCDP(endpoint,options);}});
 view=await waitFor(()=>ide.contexts().flatMap(c=>c.pages()).find(p=>/^vscode-file:/.test(p.url())),15000);session=await view.context().newCDPSession(view);session.on('Runtime.exceptionThrown',e=>r.errors.push({surface:'attached-workbench',message:e.exceptionDetails.exception?.description||e.exceptionDetails.text}));session.on('Runtime.consoleAPICalled',e=>{if(['error','warn','warning'].includes(e.type))r.console.push({surface:'attached-workbench',type:e.type,message:e.args.map(x=>x.value??x.description??'').join(' ').slice(0,1000)});});await session.send('Runtime.enable');
 const proc=await readFile('/proc/'+child.pid+'/cmdline','utf8');assert(proc.includes(out+'/user')&&proc.includes(out+'/extensions')&&proc.includes(out+'/shared'));const startup=await readFile(out+'/code.log','utf8');assert(!startup.includes('/home/roman/.vscode-shared/'),'Host shared storage is forbidden');assert(startup.includes(out+'/shared/sharedStorage/state.vscdb'),'Own shared storage must be observed');r.ownedSharedStorageObserved=true;assert(!args.some(a=>/^--(?:install-extension|extensionDevelopmentPath|extensionTestsPath|disable-workspace-trust|no-sandbox|disable-gpu-sandbox)/.test(a)));r.ownedProcessVerified=true;
 const win=await waitFor(()=>{try{return desktop.native(['search','--onlyvisible','--class','Code']).split('\n').filter(Boolean).at(-1);}catch{return null;}},10000);desktop.native(['windowfocus',win]);r.ownedWindow={id:win,title:desktop.native(['getwindowname',win])};shot('retained-installed-workspace');
 await check('copied retained actual UI installation matches exact helper payload; not a new installation',async()=>{
  const folder=out+'/extensions/local-research.stateatom-dev-helper-0.1.3',require=createRequire(import.meta.url),{readZip}=require('@vscode/vsce/out/zip.js'),entries=await readZip(scenario.helper.file,()=>true),raw=entries.get('extension/package.json'),pkg=JSON.parse(raw);const expected={id:pkg.publisher+'.'+pkg.name,version:pkg.version,main:'extension.cjs',packageManifest:pkg,packageSha256:sha256(raw),bundleSha256:sha256(entries.get('extension/extension.cjs'))};
  r.installedHelper=await verifyInstalledHelper({extensionPath:folder,extensionsDir:out+'/extensions',expected});delete r.installedHelper.loadedFromIsolatedInstallation;r.installedHelper.observedBy='Copied installed file bytes plus actual public UI receipt; no Extension API loaded-path observation';const walk=async(base,prefix='')=>{const files={};for(const e of await readdir(base,{withFileTypes:true})){const name=prefix?prefix+'/'+e.name:e.name;if(e.isDirectory())Object.assign(files,await walk(base+'/'+e.name,name));else{assert(e.isFile());files[name]=sha256(await readFile(base+'/'+e.name));}}return files;};assert.deepEqual(await walk(folder),installed.payloadManifest);r.payloadEntries=7;
 });
 let clipboardBefore='';try{clipboardBefore=execFileSync('xclip',['-selection','clipboard','-o'],{env:{...process.env,DISPLAY:desktop.display},encoding:'utf8',timeout:2000,maxBuffer:32768,stdio:['ignore','pipe','pipe']});r.clipboardBefore={available:true,bytes:Buffer.byteLength(clipboardBefore),sha256:sha256(clipboardBefore)};}catch{r.clipboardBefore={available:false};}
 await command('StateAtom: Copy connection receipt','copy-receipt');
 const raw=await waitFor(()=>{try{const value=execFileSync('xclip',['-selection','clipboard','-o'],{env:{...process.env,DISPLAY:desktop.display},encoding:'utf8',timeout:2000,maxBuffer:32768,stdio:['ignore','pipe','pipe']});if(value!==clipboardBefore){parseConnectionReceipt(value);return value;}return null;}catch{return null;}},20000);
 await check('public Copy connection receipt command produces actual private matching owned-display clipboard output',async()=>{
  const receipt=parseConnectionReceipt(raw);assert.equal(receipt.origin,scenario.origin);assert.equal(receipt.sourceRoot,scenario.sourceRoot);assert.equal(receipt.url,'http://127.0.0.1:'+helperPort);assert.equal(receipt.workspace.id,sha256(await realpath(scenario.project.workingCopy)));assert.equal(receipt.workspace.name,path.basename(scenario.project.workingCopy));assert.equal(receipt.helper.id,'local-research.stateatom-dev-helper');assert.equal(receipt.helper.version,scenario.helper.version);assert.equal(await occupied(helperPort),true);
  await writeFile(out+'/private-receipt.json',raw,{flag:'wx',mode:0o600});r.privateReceipt={file:out+'/private-receipt.json',sha256:sha256(raw),bytes:Buffer.byteLength(raw),schemaVersion:receipt.schemaVersion,helperId:receipt.helper.id,helperVersion:receipt.helper.version,origin:receipt.origin,sourceRoot:receipt.sourceRoot,workspaceMatches:true,tokenPrinted:false};
  const notice=await waitFor(async()=>{const text=await view.locator('body').innerText();return text.includes('Private StateAtom connection receipt copied.')?'Private StateAtom connection receipt copied.':null;});r.copyNotification=notice;shot('receipt-copied-notification');
 });
 await check('original workspace and registered inputs unchanged; no app/browser-source execution',async()=>{r.originalSourceAfter=await sourceAudit();assert.deepEqual(r.originalSourceBefore,r.originalSourceAfter);assert.deepEqual(r.console,[]);assert.deepEqual(r.errors,[]);});r.status='PASS_ACTUAL_PRIVATE_RECEIPT_ON_RETAINED_UI_INSTALL_NOT_FULL_V03';
}catch(e){r.status='FAIL';r.error=e.stack;if(e.desktopCleanupError)r.desktopStartupCleanupError=e.desktopCleanupError;process.exitCode=1;try{if(desktop)r.failureScreenshot=shot('failure');}catch(f){r.failureScreenshotError=f.message;}console.error(e.message);}
finally{
 try{await session?.detach();await ide?.close();}catch(e){r.status='FAIL';r.sessionCleanupError=e.stack;process.exitCode=1;}
 try{if(child?.pid&&child.exitCode===null&&child.signalCode===null){child.kill('SIGTERM');try{await waitFor(()=>child.exitCode!==null||child.signalCode!==null,8000);}catch{child.kill('SIGKILL');await waitFor(()=>child.exitCode!==null||child.signalCode!==null,5000);}}r.ownedCodeClosed=!!child&&!alive();}catch(e){r.status='FAIL';r.codeCleanupError=e.stack;process.exitCode=1;}
 try{if(log)await log.close();}catch(e){r.status='FAIL';r.logCleanupError=e.stack;process.exitCode=1;}
 try{if(desktop){await desktop.close();r.ownedDesktopClosed=true;}}catch(e){r.status='FAIL';r.desktopCleanupError=e.stack;process.exitCode=1;}
 try{if(child){await waitFor(async()=>!await occupied(49331),5000);r.debugPortReleased=true;}if(helperPort){await waitFor(async()=>!await occupied(helperPort),5000);r.helperPortReleased=true;}}catch(e){r.status='FAIL';r.portCleanupError=e.stack;process.exitCode=1;}
 try{r.originalSourceAfter=await sourceAudit();if(r.originalSourceBefore)assert.deepEqual(r.originalSourceBefore,r.originalSourceAfter);}catch(e){r.status='FAIL';r.originalMutationError=e.stack;process.exitCode=1;}
 try{r.inputsAfter=await inputs();if(JSON.stringify(r.inputsBefore)!==JSON.stringify(r.inputsAfter)){r.status='FAIL';r.inputDrift=true;process.exitCode=1;}}catch(e){r.status='FAIL';r.inputReadError=e.stack;process.exitCode=1;}
 r.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(r,null,2),{flag:'wx'});console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/results.json',status:r.status}));
}
