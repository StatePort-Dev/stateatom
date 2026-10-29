// SPDX-License-Identifier: Apache-2.0
// L02.36: ONE focused-v3 cached-only collection in a labelled test-host copy.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,open,copyFile,access,readlink} from 'node:fs/promises';
import {join,resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileManifest} from '../../scripts/atom-package-receipt.mjs';
import {focusedProtocol,expectedFocusedCases,expectedFocusedCreateOptions,guardFocusedRunRecord,qualifyFocusedCollection} from '../../experiments/focused-evaluation-qualification.mjs';
import {pilotFileSha256,pilotProfileManifest} from '../../experiments/official-comparison-pilot-qualification.mjs';
const root=resolve(new URL('../..',import.meta.url).pathname),caseFile='docs/testing/focused-annotation-case.json',baseName='.artifacts/l02/focused-annotation/2026-10-29';
const sha=x=>createHash('sha256').update(x).digest('hex'),git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
async function main(){
 const args=process.argv.slice(2);if(args.length!==6||args[0]!=='--case'||args[2]!=='--case-sha'||args[4]!=='--revision')throw Error('FOCUSED_ANNOTATION_CASE_REQUIRED');
 if(args[1]!==caseFile)throw Error('FOCUSED_ANNOTATION_CASE_PATH');if(!/^[a-f0-9]{64}$/.test(args[3])||!/^[a-f0-9]{40}$/.test(args[5]))throw Error('FOCUSED_ANNOTATION_HASH_REVISION');
 const bytes=await readFile(join(root,caseFile));assert.equal(sha(bytes),args[3]);const c=JSON.parse(bytes);assert.equal(c.schema,'stateatom.l02-focused-case/3');assert.deepEqual(c.protocol,focusedProtocol());assert.deepEqual(c.expectedCases,expectedFocusedCases());assert.deepEqual(c.expectedCreateOptions,expectedFocusedCreateOptions());
 assert.equal(c.maximumNativeAttempts,1);assert.equal(c.out,baseName+'/native');assert.equal(c.attemptFile,baseName+'/native-attempt.json');assert.equal(c.preparedHost,join(root,baseName+'/prepared-host'));
 assert.equal(c.profileSource,join(root,'.artifacts/i02/current88/cold-initialization/2026-10-28/native/profiles/official88-model'));
 assert.equal(git('rev-parse','HEAD'),args[5]);assert.equal(git('status','--porcelain'),'');assert.equal(sha(execFileSync('git',['show','HEAD:'+caseFile],{cwd:root})),args[3]);
 const verify=async()=>{for(const [file,h]of Object.entries(c.inputHashes))assert.equal(await pilotFileSha256(resolve(root,file)),h,file);assert.deepEqual(await fileManifest(c.officialDist),c.officialDistManifest);assert.deepEqual(await fileManifest(c.preparedHost),c.preparedHostManifest);assert.deepEqual(await pilotProfileManifest(c.profileSource),{files:c.profileFiles,links:c.profileLinks});};
 await verify();assert.equal(git('-C',c.host,'rev-parse','HEAD'),c.hostRevision);assert.equal(git('-C',c.host,'status','--porcelain'),'');assert.equal(await access('/proc/'+c.profileSourceOwnerPid).then(()=>true,()=>false),false);
 const attempt=await open(join(root,c.attemptFile),'wx');try{await attempt.writeFile(JSON.stringify({sourceRevision:args[5],caseSha256:args[3],maximumNativeAttempts:1,at:new Date().toISOString(),modelCreateNotYetCalled:true},null,2)+'\n');}finally{await attempt.close();}
 console.log('NATIVE_ATTEMPT 1/1');const out=join(root,c.out);await mkdir(out);await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));await writeFile(out+'/case.json',bytes);
 const started=Date.now(),r={schema:'stateatom.l02-focused-native/3',status:'RUNNING',sourceRevision:args[5],sourceDirty:false,hostRevision:c.hostRevision,caseSha256:args[3],diagnosticOnly:true,originalAcceptanceWaived:false,modelQualityAssessed:false,fullL02:false,productProviderSelected:false,testOnlyCopiedHost:true,modelBuildId:'Unknown; no API-exposed build ID',runs:[],errors:[],pageErrors:[],console:{overflow:false,records:[],scope:'Owned evaluation document Runtime deliveries until close'},cleanup:{},startedAt:new Date().toISOString()};
 let browser,desktop,control,panel,driver;
 try{
  const profile=out+'/profiles/focused-cache';await mkdir(profile,{recursive:true});
  for(const [file,h]of Object.entries(c.cloneFiles)){assert(!file.startsWith('/')&&!file.split('/').some(x=>x==='..'||x==='.'||!x));const dest=join(profile,file);await mkdir(dirname(dest),{recursive:true});await copyFile(join(c.profileSource,file),dest);assert.equal(await pilotFileSha256(dest),h,file);}
  assert.deepEqual(await pilotProfileManifest(profile),{files:c.cloneFiles,links:{}});r.profileClone={source:c.profileSource,destination:profile,files:Object.keys(c.cloneFiles).length,sourcePreserved:true};
  const {googleChromeFixture,ownedBrowserControl}=await import(pathToFileURL(c.googleAdapter)),{sourceAccessDesktop}=await import(pathToFileURL(join(root,'tests/helpers/source-access-native-desktop.mjs'))),{nativeInspectorUI}=await import(pathToFileURL(join(root,'tests/helpers/native-inspector-ui.mjs'))),{waitFor}=await import(pathToFileURL(join(root,'scripts/harness.mjs')));
  desktop=await sourceAccessDesktop(out);r.display=desktop.display;const native=await googleChromeFixture(root,out);r.nativeAdapter=native.provenance;
  browser=await native.startNativeBrowser(out+'/profiles','focused-cache',true,true,['--enable-unsafe-extension-debugging'],{extensionPath:c.preparedHost,headless:false,display:desktop.display,beforeExtensionLoad:async({send})=>{assert.equal((await send('Extensions.loadUnpacked',{path:c.preparedHost})).id,c.developmentId);}});
  browser.command.extensionSetup='test-only copied host with comparison addon; not normal installation';r.browser={version:browser.context.browser().version(),command:browser.command};assert.equal(browser.id,c.developmentId);assert.equal(r.browser.version,c.browserProduct);assert.equal(await readlink('/proc/'+browser.command.pid+'/exe'),'/opt/google/chrome/chrome');assert.equal(await pilotFileSha256('/proc/'+browser.command.pid+'/exe'),c.browserExeSha256);
  assert(!browser.command.args.some(x=>/^--(?:headless|ignore-certificate|disable-web-security|js-flags|enable-features|disable-features|load-extension|disable-extensions)(?:=|$)/.test(x)));
  control=await ownedBrowserControl(browser.command);r.owner=control.provenance;r.pidNamespace=await readlink('/proc/self/ns/pid');r.processStatBefore=String(await readFile('/proc/'+browser.command.pid+'/stat')).trim();
  panel=await browser.context.newPage();panel.on('pageerror',()=>r.pageErrors.push('Owned evaluation page exception'));await panel.goto('chrome-extension://'+browser.id+'/l02-eval.html');driver=await nativeInspectorUI(panel,browser);
  driver.p.on('Runtime.consoleAPICalled',event=>{if(r.console.records.length>=128)r.console.overflow=true;else r.console.records.push({type:event.type,text:event.args.map(x=>x.value??x.description??x.type).join(' ').slice(0,2048)});});await driver.p.send('Runtime.enable');
  r.context=await panel.evaluate(()=>({href:location.href,runtimeId:chrome.runtime.id,topLevel:globalThis===top,nonce:document.querySelector('meta[name="stateatom-focused-case"]')?.content}));assert.equal(r.context.nonce,c.nonce);assert.equal(r.context.topLevel,true);
  const parsed=[],url='chrome-extension://'+browser.id+'/l02-eval.js';driver.p.on('Debugger.scriptParsed',event=>{if(event.url===url)parsed.push(event);});await driver.p.send('Debugger.enable');await waitFor(()=>parsed.length);assert.equal(parsed.length,1);
  const script=await driver.p.send('Debugger.getScriptSource',{scriptId:parsed[0].scriptId});r.compiledEvaluation={url:parsed[0].url,scriptId:parsed[0].scriptId,sha256:sha(script.scriptSource),characters:script.scriptSource.length,debuggerDisabledBeforeRun:false};assert.equal(r.compiledEvaluation.sha256,c.addon.jsSha256);await driver.p.send('Debugger.disable');r.compiledEvaluation.debuggerDisabledBeforeRun=true;
  const initial=await waitFor(()=>panel.evaluate(()=>{const s=globalThis.l02Evaluation;return s?.ready&&s.availability!==null?{availability:s.availability,api:s.api,realApiForwarding:s.realApiForwarding,caseOrder:s.caseOrder,results:s.results.length,errors:s.errors}:null;}),c.protocol.cachedAvailabilityMs);
  r.initialAvailability=initial.availability;assert.equal(initial.availability,'available');assert.equal(initial.api,'function');assert.equal(initial.realApiForwarding,true);assert.equal(initial.results,0);assert.deepEqual(initial.errors,[]);assert.deepEqual(initial.caseOrder,c.expectedCases.map(x=>({id:x.id,campaign:x.campaign,status:x.status,eligible:x.eligible})));
  for(const [index,expected]of c.expectedCases.entries()){
   assert(Date.now()-started<c.protocol.caseBudgetMs,'Original600s collection budget');if(await panel.evaluate(()=>document.getElementById('case').value)!==String(index))await driver.select('case',index);
   assert.equal(await panel.evaluate(()=>document.getElementById('case').value),String(index));await driver.click('run');
   const row=await waitFor(()=>panel.evaluate(i=>{const s=globalThis.l02Evaluation;return s.phase==='idle'&&s.results.length===i+1?s.results[i]:null;},index),c.protocol.observationTimeoutMs);row.caseIndex=index;r.runs.push(row);
   await writeFile(out+'/results-running.json',JSON.stringify(r,null,2)+'\n');const state=guardFocusedRunRecord(row,expected,{expectedCreateOptions:c.expectedCreateOptions});console.log('ROW',index,expected.id,state);
  }
  r.status='COLLECTION_FINISHED_PENDING_CLEANUP';
 }catch(error){r.status='INCOMPLETE_FOCUSED_ANNOTATION_NOT_L02';r.error=error.stack||String(error);r.errors.push(String(error));process.exitCode=1;}
 finally{
  if(panel&&driver)try{const active=await panel.evaluate(()=>globalThis.l02Evaluation?.active!==null);if(active)await driver.click('cancel');await new Promise(res=>setTimeout(res,100));const final=await panel.evaluate(()=>globalThis.l02Evaluation);if(final){r.finalController={phase:final.phase,active:final.active,errors:final.errors,availability:final.availability};r.runs=final.results.map((row,index)=>({...row,caseIndex:index}));}}catch(error){r.errors.push('Final controller read: '+String(error));}
  for(const [name,close]of [['driver',()=>driver?.close()],['control',()=>control?.close()],['browser',()=>browser?.context.close()],['desktop',()=>desktop?.close()]])try{await close();r.cleanup[name]=true;}catch(error){r.cleanup[name]=false;r.errors.push(name+': '+String(error));}
  if(browser?.command?.pid)r.cleanup.ownedBrowserPidAbsent=await access('/proc/'+browser.command.pid).then(()=>false,()=>true);
  try{await verify();r.allFrozenInputsUnchanged=true;r.originalHostUnchanged=true;r.profileSourceUnchanged=true;}catch(error){r.allFrozenInputsUnchanged=false;r.originalHostUnchanged=false;r.profileSourceUnchanged=false;r.errors.push(String(error));}
  r.unvisited=c.expectedCases.slice(r.runs.length).map(x=>x.id);r.finishedAt=new Date().toISOString();
  try{r.collection=qualifyFocusedCollection(r,c);r.status=r.collection.status;}catch(error){r.status='INCOMPLETE_FOCUSED_ANNOTATION_NOT_L02';r.qualificationError=String(error);process.exitCode=1;}
  await writeFile(out+'/results.json',JSON.stringify(r,null,2)+'\n');console.log(r.status,'rows',r.runs.length,out);
 }
}
main().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});
