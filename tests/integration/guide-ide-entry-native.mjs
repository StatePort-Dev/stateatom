// SPDX-License-Identifier: Apache-2.0
// Actual public VS Code installation/receipt entry. No app or development host.
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
const json=async f=>JSON.parse(await readFile(f)),scenario=await json(caseFile);assert.equal(scenario.schema,'stateatom.v03-ide-entry-case/1');
const out=path.resolve('.artifacts/v03/guide-ide-entry/'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(out,{recursive:true});await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)),{flag:'wx'});
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
 await check('exact registered Code/helper/product/project inputs; fresh isolated IDE dirs',async()=>{
  for(const[f,hash]of Object.entries({...scenario.inputHashes,...scenario.productInputs,...scenario.helperInputs}))assert.equal(sha256(await readFile(f)),hash,f);
  assert.equal(sha256(await readFile(scenario.code.executable)),scenario.code.sha256);assert.equal((await json(scenario.code.packageFile)).version,scenario.code.version);assert.equal((await json(scenario.code.productFile)).commit,scenario.code.commit);
  assert.equal(sha256(await readFile(scenario.helper.file)),scenario.helper.sha256);r.originalSourceBefore=await sourceAudit();assert.equal(await occupied(49331),false,'Own debug port occupied; no existing instance adopted/stopped');
  await mkdir(out+'/user/User',{recursive:true});await mkdir(out+'/extensions');assert.deepEqual(await readdir(out+'/extensions'),[]);
 });
 helperPort=await freePort();const settings={'telemetry.telemetryLevel':'off','update.mode':'none','extensions.autoUpdate':false,'extensions.ignoreRecommendations':true,'workbench.startupEditor':'none','chat.disableAIFeatures':true,'stateatom.appOrigin':scenario.origin,'stateatom.sourceFolder':scenario.sourceRoot,'stateatom.helperPort':helperPort};await writeFile(out+'/user/User/settings.json',JSON.stringify(settings));r.preparedSettings={file:out+'/user/User/settings.json',sha256:sha256(JSON.stringify(settings)),settingsUIClaim:false,origin:scenario.origin,sourceRoot:scenario.sourceRoot,helperPort};
 desktop=await sourceAccessDesktop(out);const env={...process.env,DISPLAY:desktop.display,DBUS_SESSION_BUS_ADDRESS:'unix:path=/tmp/stateatom-v03-no-bus-'+process.pid,GTK_USE_PORTAL:'0',XDG_DATA_HOME:out+'/xdg-data',XDG_CONFIG_HOME:out+'/xdg-config',XDG_CACHE_HOME:out+'/xdg-cache'};delete env.ELECTRON_RUN_AS_NODE;for(const k of ['XDG_DATA_HOME','XDG_CONFIG_HOME','XDG_CACHE_HOME'])await mkdir(env[k],{recursive:true});
 const args=[scenario.project.workingCopy,'--new-window','--user-data-dir='+out+'/user','--extensions-dir='+out+'/extensions','--shared-data-dir='+out+'/shared','--remote-debugging-port=49331','--disable-updates','--skip-welcome','--skip-release-notes'];
 log=await open(out+'/code.log','wx');child=spawn(scenario.code.executable,args,{env,stdio:['ignore',log.fd,log.fd]});child.on('error',e=>{spawnError=e;});r.command={executable:scenario.code.executable,args,pid:child.pid,display:desktop.display,userData:out+'/user',extensions:out+'/extensions',sharedData:out+'/shared'};await writeFile(out+'/registration.json',JSON.stringify(r,null,2),{flag:'wx'});
 ide=await connectOwnedIDE({readOutput:()=>readFile(out+'/code.log','utf8'),isRunning:()=>{if(spawnError)throw spawnError;return alive();},connect:(endpoint,options)=>{r.ownedEndpoint=endpoint;return chromium.connectOverCDP(endpoint,options);}});
 view=await waitFor(()=>ide.contexts().flatMap(c=>c.pages()).find(p=>/^vscode-file:/.test(p.url())),15000);session=await view.context().newCDPSession(view);session.on('Runtime.exceptionThrown',e=>r.errors.push({surface:'attached-workbench',message:e.exceptionDetails.exception?.description||e.exceptionDetails.text}));session.on('Runtime.consoleAPICalled',e=>{if(['error','warn','warning'].includes(e.type))r.console.push({surface:'attached-workbench',type:e.type,message:e.args.map(x=>x.value??x.description??'').join(' ').slice(0,1000)});});await session.send('Runtime.enable');
 const proc=await readFile('/proc/'+child.pid+'/cmdline','utf8');assert(proc.includes(out+'/user')&&proc.includes(out+'/extensions')&&proc.includes(out+'/shared'));const startup=await readFile(out+'/code.log','utf8');assert(!startup.includes('/home/roman/.vscode-shared/'),'Host shared storage is forbidden');assert(startup.includes(out+'/shared/sharedStorage/state.vscdb'),'Own shared storage must be observed');r.ownedSharedStorageObserved=true;assert(!args.some(a=>/^--(?:install-extension|extensionDevelopmentPath|extensionTestsPath|disable-workspace-trust|no-sandbox|disable-gpu-sandbox)/.test(a)));r.ownedProcessVerified=true;
 const win=await waitFor(()=>{try{return desktop.native(['search','--onlyvisible','--class','Code']).split('\n').filter(Boolean).at(-1);}catch{return null;}},10000);desktop.native(['windowfocus',win]);r.ownedWindow={id:win,title:desktop.native(['getwindowname',win])};shot('workspace-before-trust');
 await check('actual UI trusts only the selected original private workspace',async()=>{
  // Current Code defaults startupPrompt to never; the observed Restricted Mode
  // banner provides Manage. No modal is inferred merely from a fresh profile.
  const manage=view.getByText('Manage',{exact:true}).first();await manage.waitFor({state:'visible',timeout:15000});r.restrictedModeBefore=await view.getByText(/Restricted Mode is intended for safe code browsing/).innerText();shot('restricted-workspace');await manage.click();
  const trust=view.getByRole('button',{name:'Trust',exact:true}).first();await trust.waitFor({state:'visible',timeout:5000});r.trustControl=await trust.innerText();r.trustEditorBefore=await view.locator('body').innerText();assert(r.trustEditorBefore.includes('You are in Restricted Mode'),'Actual current workspace must be restricted before Trust');const storage=out+'/user/User/workspaceStorage';r.ownedWorkspaceRecords=[];for(const name of await readdir(storage)){try{const w=await json(storage+'/'+name+'/workspace.json');if(w.folder)r.ownedWorkspaceRecords.push(w.folder);}catch(e){if(e.code!=='ENOENT')throw e;}}assert.deepEqual(r.ownedWorkspaceRecords,['file://'+await realpath(scenario.project.workingCopy)],'Actual owned Code workspace record must match selected root');shot('workspace-trust-editor');await trust.click();await trust.waitFor({state:'hidden',timeout:10000});shot('trusted-workspace');
 });
 await command('Extensions: Install from VSIX','install');
 const chooser=await waitFor(()=>{try{const id=desktop.native(['search','--onlyvisible','--name','Install from VSIX|Open File|Select VSIX']).split('\n').filter(Boolean).at(-1);return id?{id,title:desktop.native(['getwindowname',id])}:null;}catch{return null;}},15000);r.nativeChooser=chooser;desktop.native(['windowfocus',chooser.id]);shot('native-vsix-chooser');desktop.native(['key','--clearmodifiers','ctrl+l']);desktop.native(['type','--clearmodifiers','--delay','1',scenario.helper.file]);const chooserImage=shot('native-vsix-entered'),chooserHash=sha256(await readFile(chooserImage));await writeFile(out+'/operator-open-request.json',JSON.stringify({phase:'native-vsix-open',file:chooserImage,sha256:chooserHash,chooser,display:desktop.display}),{flag:'wx'});console.log('STATEATOM_OPERATOR_REQUEST '+out+'/operator-open-request.json');
 const action=await waitFor(async()=>{try{return await json(out+'/operator-open.json');}catch(e){if(e.code==='ENOENT')return null;throw e;}},120000);assert.equal(action.phase,'native-vsix-open');assert.equal(action.imageSha256,chooserHash);assert(Number.isInteger(action.x)&&action.x>=0&&action.x<1100&&Number.isInteger(action.y)&&action.y>=0&&action.y<900);assert(alive(),'Owned Code must remain alive before native Open');r.nativeOpenAction=action;desktop.native(['windowfocus',chooser.id,'mousemove',String(action.x),String(action.y),'click','1']);
 // Any publisher trust prompt must be actually visible and explicitly recorded.
 const trustPublisher=view.getByRole('button',{name:/Trust Publisher.*Install|Trust.*Install|Install Anyway/}).first();
 const folder=await waitFor(async()=>{
  if(await trustPublisher.isVisible().catch(()=>false)){r.publisherTrustControl=await trustPublisher.innerText();shot('local-publisher-prompt');await trustPublisher.click();}
  const found=(await readdir(out+'/extensions')).find(n=>/^local-research\.stateatom-dev-helper-/.test(n));return found?path.join(out,'extensions',found):null;
 },45000);
 await check('actual native VSIX entry installs exact helper payload without CLI or development host',async()=>{
  const require=createRequire(import.meta.url),{readZip}=require('@vscode/vsce/out/zip.js'),entries=await readZip(scenario.helper.file,()=>true),raw=entries.get('extension/package.json'),pkg=JSON.parse(raw),bundle=entries.get('extension/extension.cjs');
  const expected={id:pkg.publisher+'.'+pkg.name,version:pkg.version,main:'extension.cjs',packageManifest:pkg,packageSha256:sha256(raw),bundleSha256:sha256(bundle)};
  const identity=await verifyInstalledHelper({extensionPath:folder,extensionsDir:out+'/extensions',expected});delete identity.loadedFromIsolatedInstallation;
  let count=0;for(const[name,bytes]of entries){if(!name.startsWith('extension/')||name==='extension/package.json')continue;assert.equal(sha256(await readFile(folder+'/'+name.slice('extension/'.length))),sha256(bytes),name);count++;}
  r.installedHelper={...identity,vsixSha256:scenario.helper.sha256,path:await realpath(folder),payloadEntriesCompared:count+1,observedBy:'Installed file bytes plus actual UI receipt; not Extension API loaded-path observation'};
  r.installOutcome=await waitFor(async()=>{const text=await view.locator('body').innerText();return /successfully installed|installed successfully|StateAtom Development Helper/i.test(text)?text.slice(-7000):null;},15000);shot('vsix-installed');
 });
 let clipboardBefore='';try{clipboardBefore=execFileSync('xclip',['-selection','clipboard','-o'],{env:{...process.env,DISPLAY:desktop.display},encoding:'utf8',timeout:2000,maxBuffer:32768,stdio:['ignore','pipe','pipe']});r.clipboardBefore={available:true,bytes:Buffer.byteLength(clipboardBefore),sha256:sha256(clipboardBefore)};}catch{r.clipboardBefore={available:false};}
 await command('StateAtom: Copy connection receipt','copy-receipt');
 const raw=await waitFor(()=>{
  let value;
  try{value=execFileSync('xclip',['-selection','clipboard','-o'],{env:{...process.env,DISPLAY:desktop.display},encoding:'utf8',timeout:2000,maxBuffer:32768,stdio:['ignore','pipe','pipe']});}
  catch(e){r.clipboardFailure={stage:'read',code:typeof e.code==='string'?e.code:null,status:Number.isInteger(e.status)?e.status:null,signal:typeof e.signal==='string'?e.signal:null};return null;}
  if(value===clipboardBefore)return null;
  try{parseConnectionReceipt(value);}catch{r.clipboardFailure={stage:'parse',code:'INVALID_CONNECTION_RECEIPT',message:'Invalid or unsupported connection receipt; copy a fresh receipt from the matching installed helper'};return null;}
  delete r.clipboardFailure;return value;
 },20000).catch(error=>{
  const failure=r.clipboardFailure;if(!failure)throw error;
  throw Object.assign(Error(failure.stage==='parse'?failure.message:'Owned-display clipboard read failed ('+(failure.code||'unknown')+')'),{code:failure.code||'CLIPBOARD_READ_FAILED'});
 });
 await check('public Copy connection receipt command produces actual private matching owned-display clipboard output',async()=>{
  const receipt=parseConnectionReceipt(raw);assert.equal(receipt.origin,scenario.origin);assert.equal(receipt.sourceRoot,scenario.sourceRoot);assert.equal(receipt.url,'http://127.0.0.1:'+helperPort);assert.equal(receipt.workspace.id,sha256(await realpath(scenario.project.workingCopy)));assert.equal(receipt.workspace.name,path.basename(scenario.project.workingCopy));assert.equal(receipt.helper.id,'local-research.stateatom-dev-helper');assert.equal(receipt.helper.version,scenario.helper.version);assert.equal(await occupied(helperPort),true);
  await writeFile(out+'/private-receipt.json',raw,{flag:'wx',mode:0o600});r.privateReceipt={file:out+'/private-receipt.json',sha256:sha256(raw),bytes:Buffer.byteLength(raw),schemaVersion:receipt.schemaVersion,helperId:receipt.helper.id,helperVersion:receipt.helper.version,origin:receipt.origin,sourceRoot:receipt.sourceRoot,workspaceMatches:true,tokenPrinted:false};
  const notice=await waitFor(async()=>{const text=await view.locator('body').innerText();return text.includes('Private StateAtom connection receipt copied.')?'Private StateAtom connection receipt copied.':null;});r.copyNotification=notice;shot('receipt-copied-notification');
 });
 await check('original workspace and registered inputs unchanged; no app/browser-source execution',async()=>{r.originalSourceAfter=await sourceAudit();assert.deepEqual(r.originalSourceBefore,r.originalSourceAfter);assert.deepEqual(r.console,[]);assert.deepEqual(r.errors,[]);});r.status='PASS_ACTUAL_VSIX_AND_PRIVATE_RECEIPT_ENTRY_NOT_FULL_V03';
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
