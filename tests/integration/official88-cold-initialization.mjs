// SPDX-License-Identifier: Apache-2.0
// I02.38: ONE changed-source cold regression,300s preparation/original120s inference. No API override.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,open,access,readlink,copyFile} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {inspectionExplanationFacts} from '../../core/inspection-explanations.mjs';
import {modelMetadataAllowsExplain,qualifyOfficialModelSmoke} from '../helpers/official-model-smoke-qualification.mjs';
const root=resolve(new URL('../..',import.meta.url).pathname),caseName='docs/testing/official88-cold-initialization-case.json',baseName='.artifacts/i02/current88/cold-initialization/2026-10-28';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
async function main(){
 const args=process.argv.slice(2);
 if(args.length!==6||args[0]!=='--case'||args[2]!=='--case-sha'||args[4]!=='--revision')throw Error('OFFICIAL_COLD_CASE_REQUIRED');
 if(args[1]!==caseName)throw Error('OFFICIAL_COLD_CASE_PATH');
 if(!/^[a-f0-9]{64}$/.test(args[3])||!/^[a-f0-9]{40}$/.test(args[5]))throw Error('OFFICIAL_COLD_REVISION_OR_HASH');
 const bytes=await readFile(join(root,caseName));assert.equal(sha(bytes),args[3],'OFFICIAL_COLD_CASE_HASH');const c=JSON.parse(bytes);
 assert.equal(git('rev-parse','HEAD'),args[5],'OFFICIAL_COLD_REVISION');
 assert.equal(c.schema,'stateatom.i02-current88-cold-regression/1');assert.equal(c.nativeAttemptBudget,1);assert.equal(c.modelEnabledExplainMaximum,1);assert.equal(c.productWarmAndInferenceTimeoutMs,120000);assert.equal(c.productColdInitializationTimeoutMs,300000);assert.equal(c.maximumUIObservationMs,545000);
 assert.equal(c.out,baseName+'/native');assert.equal(c.attemptFile,baseName+'/native-attempt.json');
 assert.equal(c.profileSource,join(root,'.artifacts/l02/official-google-readiness/2026-10-28/native/profiles/official87-metadata'));
 assert.equal(git('status','--porcelain'),'','OFFICIAL_COLD_SOURCE_DIRTY');assert.equal(sha(execFileSync('git',['show','HEAD:'+caseName],{cwd:root})),args[3]);
 const {fileManifest}=await import(pathToFileURL(join(root,'scripts/atom-package-receipt.mjs')));
 const verifyInputs=async()=>{
  for(const [file,h]of Object.entries(c.inputHashes))assert.equal(sha(await readFile(resolve(root,file))),h,file);
  assert.deepEqual(await fileManifest(c.dist),c.distributionManifest);
  for(const [file,target]of Object.entries(c.profileLinkManifest))assert.equal(await readlink(join(c.profileSource,file)),target);
 };
 await verifyInputs();assert.equal(git('-C',c.host,'rev-parse','HEAD'),c.hostRevision);assert.equal(git('-C',c.host,'status','--porcelain'),'');
 assert.equal(execFileSync('/usr/bin/google-chrome',['--version'],{encoding:'utf8'}).trim(),c.browserVersion);
 assert.equal(await access('/proc/'+c.profileSourceBrowserPid).then(()=>true,()=>false),false,'Original profile owner must remain absent');
 const info=JSON.parse(await readFile(join(c.dist,'BUILD-INFO.json')));assert.equal(info.developmentId,c.developmentId);assert.equal(info.atom.packageVersion,'0.1.0-candidate.20261028.88');assert.equal(info.atom.artifactSha256,'f132a0736364a08de5715d54d84fc92831bfde57b019a4ade8b4318081f434ec');assert.equal(info.ui.artifactSha256,'2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5');
 const attempt=await open(join(root,c.attemptFile),'wx');try{await attempt.writeFile(JSON.stringify({sourceRevision:args[5],caseSha256:args[3],startedAt:new Date().toISOString(),maximumAttempts:1,retriesAllowed:0},null,2)+'\n');}finally{await attempt.close();}
 console.log('NATIVE_ATTEMPT 1/1');const out=join(root,c.out);await mkdir(out);await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));await writeFile(out+'/case.json',bytes);
 const r={schema:'stateatom.i02-current88-cold-regression-result/1',status:'RUNNING',startedAt:new Date().toISOString(),sourceRevision:args[5],sourceDirty:false,caseSha256:args[3],hostRevision:c.hostRevision,configuration:{operator:'agent',testInstallationOnly:true,normalInstallationQualified:false,existingProductOnly:true,productWarmAndInferenceTimeoutMs:120000,productColdInitializationTimeoutMs:300000,maximumUIObservationMs:545000,maximumEnabledExplain:1,sourcePathCreateMaximum:1,sourcePathPromptMaximum:1,nativeAPICountersCollected:false,modelAPIOverride:false,experimentalProviderSelected:false,newPromptOrCorpus:false,appTargetTestCDP:false,CAOrTrustChange:false,personalProfile:false,sourceOwnedProfilePreserved:true,ownedProfileClone:true,networkMeteringUnlimitedVerified:false,qualityUsefulnessQualified:false,wholeL02:false},checks:[],errors:[],observedPhases:[]};
 let browser,desktop,control,panel,driver,server,tabId,detached=false;
 try{
  // Only explicitly registered regular files enter the new profile. Stale singleton
  // links, old DevTools port and old chrome.log never enter it. Original434 files stay exact.
  const profile=out+'/profiles/official88-model';await mkdir(profile,{recursive:true});
  for(const [file,h]of Object.entries(c.cloneFileManifest)){
   assert(!file.startsWith('/')&&!file.split('/').some(p=>p==='..'||p==='.'||!p));
   const dest=join(profile,file);await mkdir(dirname(dest),{recursive:true});await copyFile(join(c.profileSource,file),dest);assert.equal(sha(await readFile(dest)),h,file);
  }
  assert.deepEqual(await fileManifest(profile),c.cloneFileManifest);r.profileClone={source:c.profileSource,destination:profile,regularFiles:Object.keys(c.cloneFileManifest).length,sourceUnmodified:true,excludedRootFiles:c.cloneExcludedRootFiles,excludedSingletonLinks:Object.keys(c.profileLinkManifest)};
  const {googleChromeFixture,ownedBrowserControl}=await import(pathToFileURL(c.googleAdapter)),{sourceAccessDesktop}=await import(pathToFileURL(join(root,'tests/helpers/source-access-native-desktop.mjs'))),{nativeInspectorUI}=await import(pathToFileURL(join(root,'tests/helpers/native-inspector-ui.mjs'))),{rpc,waitFor}=await import(pathToFileURL(join(root,'scripts/harness.mjs')));
  const fixture=await readFile(join(root,c.fixture));server=createServer((req,res)=>{if(req.url==='/'){res.setHeader('content-type','text/html');res.end(fixture);}else if(req.url==='/frame'){res.setHeader('content-type','text/html');res.end('<!doctype html><title>Inert frame</title><p>Frame target is outside this smoke.</p>');}else{res.writeHead(204);res.end();}});await new Promise((res,rej)=>{server.once('error',rej);server.listen(0,'127.0.0.1',res);});r.origin='http://127.0.0.1:'+server.address().port;
  desktop=await sourceAccessDesktop(out);r.display=desktop.display;const native=await googleChromeFixture(root,out);r.nativeAdapter=native.provenance;
  browser=await native.startNativeBrowser(out+'/profiles','official88-model',true,true,['--enable-unsafe-extension-debugging'],{extensionPath:c.dist,headless:false,display:desktop.display,beforeExtensionLoad:async({send})=>{assert.equal((await send('Extensions.loadUnpacked',{path:c.dist})).id,c.developmentId);}});
  browser.command.extensionSetup='test-only Extensions.loadUnpacked, not guide UI';assert.equal(browser.command.profile,profile);r.browser={version:browser.context.browser().version(),command:browser.command};assert.equal(browser.id,c.developmentId);assert.equal(r.browser.version,c.browserProduct);
  assert(!browser.command.args.some(a=>/^--(?:headless|ignore-certificate|disable-web-security|js-flags|enable-features|disable-features|load-extension|disable-extensions)(?:=|$)/.test(a)));
  control=await ownedBrowserControl(browser.command);r.owner=control.provenance;r.pidNamespace=await readlink('/proc/self/ns/pid');r.processStatBefore=String(await readFile('/proc/'+browser.command.pid+'/stat')).trim();r.browserExecutable=await readlink('/proc/'+browser.command.pid+'/exe');assert.equal(r.browserExecutable,'/opt/google/chrome/chrome');assert.equal(sha(await readFile('/proc/'+browser.command.pid+'/exe')),c.browserExeSha256);
  panel=await browser.context.newPage();panel.on('pageerror',()=>r.errors.push('owned extension page exception'));await panel.goto('chrome-extension://'+browser.id+'/atom.html');driver=await nativeInspectorUI(panel,browser);
  // Own extension code only: prove Chrome loaded this exact new UI, then disable
  // its Debugger before any app attachment. No app test debugger or body collection.
  const uiURL='chrome-extension://'+browser.id+'/atom-page.js',parsed=[];
  driver.p.on('Debugger.scriptParsed',event=>{if(event.url===uiURL)parsed.push(event);});
  await driver.p.send('Debugger.enable');const loaded=await waitFor(()=>parsed.length?parsed:null);assert.equal(loaded.length,1,'Unique owned compiled UI module');
  const compiled=await driver.p.send('Debugger.getScriptSource',{scriptId:loaded[0].scriptId});
  r.loadedExtensionUI={url:loaded[0].url,scriptId:loaded[0].scriptId,sha256:sha(compiled.scriptSource),characters:compiled.scriptSource.length};
  assert.equal(r.loadedExtensionUI.sha256,c.distributionManifest['atom-page.js']);await driver.p.send('Debugger.disable');r.loadedExtensionUI.debuggerDisabledBeforeApp=true;
  r.originalControl={raw:c.originalControlRaw,sha256:c.originalControlRawSha256,version:'0.1.0-candidate.20261028.87',outcome:'download85percent then original120s template timeout; not ready-model accepted'};
  r.checks.push('actual owned compiled UI matches exact88 distribution before app activity');
  tabId=await panel.evaluate(async url=>(await chrome.tabs.create({url})).id,r.origin+'/');await waitFor(()=>panel.evaluate(async id=>(await chrome.tabs.get(id)).status==='complete',tabId));
  const app=()=>panel.evaluate(async id=>(await chrome.scripting.executeScript({target:{tabId:id,frameIds:[0]},world:'MAIN',func:()=>({actions:window.actions,calls:window.calls})}))[0].result,tabId),state=()=>rpc(panel,{op:'state',tabId,refreshDeep:false});
  await driver.click('refresh-tabs');await driver.waitOK();if(await panel.evaluate(s=>document.querySelector(s).value,driver.q('tabs'))!==String(tabId))await driver.select('tabs',tabId);await driver.waitOK();await driver.click('attach');await driver.waitOK();await driver.fill('selector','#confirm');await driver.click('inspect-selector');await driver.waitOK();await driver.click('actions-nav');
  const initial=await state(),counters=await app();assert.equal(initial.readOnly,true);assert.equal(initial.analysis.capabilities.sourceResolver,'unavailable');assert.equal(initial.analysis.stateatom.runtime.status,'Unknown/Unsupported');assert.deepEqual(counters,{actions:{submit:0,click:0},calls:{}});r.initialSelection=initial.selection;r.initialCounters=counters;r.checks.push('exact88/UI2 owned Google, clone, readonly Basic and unchanged synthetic app');
  const ui=()=>panel.evaluate(()=>{const get=id=>document.querySelector('[data-atom-id="'+id+'"]');return{enabled:get('action-local-enabled').checked,status:get('action-local-status').textContent,text:get('action-explanation').textContent,explainDisabled:get('action-explain').disabled,cancelHidden:get('action-cancel').hidden};});assert.equal((await ui()).enabled,false);
  await panel.evaluate(()=>{globalThis.__model31Witness={changes:[],explains:[]};document.addEventListener('change',event=>{if(event.target?.getAttribute('data-atom-id')==='action-local-enabled')__model31Witness.changes.push({trusted:event.isTrusted,checked:event.target.checked,active:navigator.userActivation.isActive});});document.addEventListener('click',event=>{if(event.target?.closest('[data-atom-id="action-explain"]'))__model31Witness.explains.push({trusted:event.isTrusted,enabled:document.querySelector('[data-atom-id="action-local-enabled"]').checked,active:navigator.userActivation.isActive});});});
  await driver.click('action-explain');r.template=await waitFor(async()=>{const x=await ui();return !x.explainDisabled&&x.status.includes('template explanation')&&x.text?x:null;});assert.deepEqual(await app(),counters);r.checks.push('trusted model-off template control on stored facts without app action');
  await driver.click('action-local-enabled');r.metadataUI=await waitFor(async()=>{const x=await ui();r.lastUI=x;return x.enabled&&x.status!=='Checking local model availability…'?x:null;},45000);assert.equal(r.metadataUI.text,r.template.text);assert.deepEqual(await app(),counters);r.checks.push('trusted explicit opt-in and actual product availability UI');
  if(!modelMetadataAllowsExplain(r.metadataUI.status))r.status='INCOMPLETE_METADATA_GATE_NO_ENABLED_EXPLAIN';
  else{
   const start=performance.now();await driver.click('action-explain');let last;
   while(performance.now()-start<=c.maximumUIObservationMs){const x=await ui();r.lastUI=x;if(x.status!==last){r.observedPhases.push({elapsedMs:performance.now()-start,status:x.status});last=x.status;console.log('MODEL_UI',x.status);}if(!x.explainDisabled&&x.cancelHidden){r.settled=x;break;}await new Promise(res=>setTimeout(res,100));}
   if(!r.settled){r.productDeadlineOverrun=true;const x=await ui();if(!x.cancelHidden)await driver.click('action-cancel');r.settled=await waitFor(async()=>{const x=await ui();return !x.explainDisabled&&x.cancelHidden?x:null;},5000);}
   r.beforeOptOutWitness=await panel.evaluate(()=>globalThis.__model31Witness);const current=await state(),facts=inspectionExplanationFacts(current,{question:'action'});assert.deepEqual(current.selection,initial.selection);
   r.qualification=qualifyOfficialModelSmoke({template:r.template,settled:r.settled,witness:r.beforeOptOutWitness,allowedSummaries:facts.summaries,countersBefore:counters,countersAfter:await app()});r.status=r.qualification.status;r.coldPreparationBeyondOriginal120sObserved=r.observedPhases.some(p=>p.elapsedMs>120000&&/^Downloading local model/.test(p.status));r.validatedGroundedModelOutputObserved=r.qualification.modelInitializedAndValidatedOutputObserved;r.checks.push('one trusted enabled Explain ends with bounded validated product output or explicit fallback');
   r.candidateScreen={file:out+'/product-result-candidate.png',view:await driver.screenshot(out+'/product-result-candidate.png',{width:440,focus:'action-local-status'}),humanAccepted:false};
  }
  if((await ui()).enabled)await driver.click('action-local-enabled');r.optedOut=await ui();assert.equal(r.optedOut.enabled,false);r.finalWitness=await panel.evaluate(()=>globalThis.__model31Witness);assert(r.finalWitness.explains.filter(x=>x.enabled).length<=1);assert(r.finalWitness.explains.every(x=>x.trusted));
  await driver.fill('selector','#confirm');await driver.click('inspect-selector');await driver.waitOK();const fresh=await state();assert.equal(fresh.readOnly,true);assert.deepEqual(fresh.selection.domIdentity,initial.selection.domIdentity);assert.equal(fresh.selection.value,initial.selection.value);assert.deepEqual(await app(),counters);r.freshBasic={readOnly:fresh.readOnly,selection:fresh.selection};r.checks.push('opt-out and fresh free readonly Basic retain target and zero app actions');
  await rpc(panel,{op:'detach',tabId});detached=true;r.appDetached=true;
 }catch(error){r.status='FAIL';r.error=error.stack||String(error);process.exitCode=1;}
 finally{
  if(panel&&driver)try{const x=await panel.evaluate(()=>({enabled:document.querySelector('[data-atom-id="action-local-enabled"]')?.checked,cancelHidden:document.querySelector('[data-atom-id="action-cancel"]')?.hidden}));if(x.cancelHidden===false)await driver.click('action-cancel');if(x.enabled)await driver.click('action-local-enabled');}catch(error){r.errors.push('UI cleanup: '+String(error));}
  if(panel&&tabId&&!detached)try{const {rpc}=await import(pathToFileURL(join(root,'scripts/harness.mjs')));await rpc(panel,{op:'detach',tabId});r.appDetached=true;}catch(error){r.errors.push('detach: '+String(error));}
  for(const [name,close]of [['driver',()=>driver?.close()],['control',()=>control?.close()],['browser',()=>browser?.context.close()],['desktop',()=>desktop?.close()],['server',()=>server?.listening?new Promise((res,rej)=>{server.closeAllConnections();server.close(e=>e?rej(e):res());}):undefined]])try{await close();r[name+'Closed']=true;}catch(error){r.errors.push(name+': '+String(error));}
  if(browser?.command?.pid){r.ownedBrowserPidAbsent=await access('/proc/'+browser.command.pid).then(()=>false,()=>true);if(!r.ownedBrowserPidAbsent)r.errors.push('Owned browser PID still present; no full-tree inference');}
  try{await verifyInputs();r.allInputsUnchanged=true;r.checks.push('frozen inputs/full36dist/original434profile files and3links unchanged');}catch(error){r.allInputsUnchanged=false;r.errors.push(String(error));}
  if(r.errors.length){r.status='FAIL';process.exitCode=1;}r.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(r,null,2)+'\n');console.log(r.status,out);
 }
}
main().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});
