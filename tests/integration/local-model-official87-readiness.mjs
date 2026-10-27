// SPDX-License-Identifier: Apache-2.0
// L02.30: ONE exact official87/native Google metadata observation, never model inference.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,open,access,readlink} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {observeNativeModelMetadata} from '../helpers/local-model-metadata-observer.mjs';
const root=resolve(new URL('../..',import.meta.url).pathname);
const caseName='docs/testing/local-model-official87-readiness-case.json';
const baseName='.artifacts/l02/official-google-readiness/2026-10-28';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
async function main(){
 const args=process.argv.slice(2);
 if(args.length!==6||args[0]!=='--case'||args[2]!=='--case-sha'||args[4]!=='--revision')throw Error('OFFICIAL_MODEL_CASE_REQUIRED');
 if(args[1]!==caseName)throw Error('OFFICIAL_MODEL_CASE_PATH');
 if(!/^[a-f0-9]{64}$/.test(args[3])||!/^[a-f0-9]{40}$/.test(args[5]))throw Error('OFFICIAL_MODEL_REVISION_OR_HASH');
 const bytes=await readFile(join(root,caseName));assert.equal(sha(bytes),args[3],'OFFICIAL_MODEL_CASE_HASH');
 const c=JSON.parse(bytes);assert.equal(c.schema,'stateatom.l02-official87-google-metadata/1');
 assert.equal(c.nativeAttemptBudget,1);assert.equal(c.metadataTimeoutMs,30000);assert.equal(c.metadataCallsMaximum,1);
 assert.equal(c.createCallsMaximum,0);assert.equal(c.promptCallsMaximum,0);assert.equal(c.downloadInitiationsMaximum,0);
 assert.equal(c.out,baseName+'/native');assert.equal(c.attemptFile,baseName+'/native-attempt.json');
 assert.equal(git('rev-parse','HEAD'),args[5],'OFFICIAL_MODEL_REVISION');assert.equal(git('status','--porcelain'),'','OFFICIAL_MODEL_SOURCE_DIRTY');
 assert.equal(sha(execFileSync('git',['show','HEAD:'+caseName],{cwd:root})),args[3]);
 const {fileManifest}=await import(pathToFileURL(join(root,'scripts/atom-package-receipt.mjs')));
 const verifyInputs=async()=>{for(const [file,expected]of Object.entries(c.inputHashes))assert.equal(sha(await readFile(resolve(root,file))),expected,file);assert.deepEqual(await fileManifest(c.dist),c.distributionManifest);};
 await verifyInputs();assert.equal(git('-C',c.host,'rev-parse','HEAD'),c.hostRevision);assert.equal(git('-C',c.host,'status','--porcelain'),'');
 assert.equal(execFileSync('/usr/bin/google-chrome',['--version'],{encoding:'utf8'}).trim(),c.browserVersion);
 const info=JSON.parse(await readFile(join(c.dist,'BUILD-INFO.json')));
 assert.equal(info.atom.packageVersion,'0.1.0-candidate.20261028.87');assert.equal(info.atom.artifactSha256,'6b020d8ff4b221f321d01516fbf6941c6351a0dc6afdc9ff1b6f3c1d74e005ce');
 assert.equal(info.ui.artifactSha256,'2bfc8229a45e02f775bb563f27d9a803d51dd977145f46843c45a884e07289e5');assert.equal(info.developmentId,c.developmentId);
 const attempt=await open(join(root,c.attemptFile),'wx');try{await attempt.writeFile(JSON.stringify({schema:'stateatom.l02-official87-metadata-attempt/1',startedAt:new Date().toISOString(),sourceRevision:args[5],caseSha256:args[3],maximumAttempts:1,retriesAllowed:0},null,2)+'\n');}finally{await attempt.close();}
 console.log('NATIVE_ATTEMPT 1/1');
 const out=join(root,c.out);await mkdir(out);await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));await writeFile(out+'/case.json',bytes);
 const r={schema:'stateatom.l02-official87-google-metadata-result/1',status:'RUNNING',startedAt:new Date().toISOString(),sourceRevision:args[5],sourceDirty:false,caseSha256:args[3],hostRevision:c.hostRevision,configuration:{operator:'agent',testInstall:'Extensions.loadUnpacked; not guide or Store',metadataOnly:true,availabilityCallsMaximum:1,metadataTimeoutMs:30000,modelCreate:false,modelPrompt:false,modelDownloadInitiation:false,modelAPIOverride:false,modelFeatureFlags:false,CAOrTrustChange:false,profileImport:false,appTarget:false,applicationFacts:false,normalInstallationQualified:false,realModelUsefulnessQualified:false,wholeL02:false},checks:[],errors:[]};
 let browser,desktop,control;
 try{
  const {googleChromeFixture,ownedBrowserControl}=await import(pathToFileURL(c.googleAdapter));
  const {sourceAccessDesktop}=await import(pathToFileURL(join(root,'tests/helpers/source-access-native-desktop.mjs')));
  const {waitFor}=await import(pathToFileURL(join(root,'scripts/harness.mjs')));
  desktop=await sourceAccessDesktop(out);r.display=desktop.display;
  const fixture=await googleChromeFixture(root,out);r.nativeAdapter=fixture.provenance;
  browser=await fixture.startNativeBrowser(out+'/profiles','official87-metadata',true,true,['--enable-unsafe-extension-debugging'],{extensionPath:c.dist,headless:false,display:desktop.display,beforeExtensionLoad:async({send})=>{assert.equal((await send('Extensions.loadUnpacked',{path:c.dist})).id,c.developmentId);}});
  browser.command.extensionSetup='test-only Extensions.loadUnpacked, not guide UI';
  r.browser={version:browser.context.browser().version(),command:browser.command};assert.equal(browser.id,c.developmentId);assert.equal(r.browser.version,c.browserProduct);
  assert(!browser.command.args.some(a=>/^--(?:headless|ignore-certificate|disable-web-security|js-flags|enable-features|disable-features|load-extension|disable-extensions)(?:=|$)/.test(a)));
  control=await ownedBrowserControl(browser.command);r.browserOwner=control.provenance;r.pidNamespace=await readlink('/proc/self/ns/pid');
  r.processStatBefore=String(await readFile('/proc/'+browser.command.pid+'/stat')).trim();
  r.actualBrowserExecutable=await readlink('/proc/'+browser.command.pid+'/exe');assert.equal(r.actualBrowserExecutable,'/opt/google/chrome/chrome');assert.equal(sha(await readFile('/proc/'+browser.command.pid+'/exe')),c.browserExeSha256);
  r.checks.push('exact official87/UI2 distribution and owned headed Google transport');
  const panel=await browser.context.newPage();panel.on('pageerror',()=>r.errors.push('owned extension page exception'));
  const url='chrome-extension://'+browser.id+'/atom.html';await panel.goto(url);
  r.context=await panel.evaluate(()=>({href:location.href,origin:location.origin,topLevel:globalThis===top,secureContext:isSecureContext,runtimeId:chrome.runtime.id,readyState:document.readyState}));
  assert.equal(r.context.href,url);assert.equal(r.context.runtimeId,c.developmentId);assert.equal(r.context.topLevel,true);assert.equal(r.context.secureContext,true);
  r.checks.push('exact owned top-level extension document; no app or model adapter');
  // Start the single native call without awaiting it inside the canonical 20s CDP command.
  // Only our own result witness is polled; no API retry and no LanguageModel mutation.
  const begin=new Function('timeoutMs',"if(Object.hasOwn(globalThis,'__stateatomMetadata30'))throw Error('METADATA_ALREADY_STARTED');globalThis.__stateatomMetadata30={result:null};const observe="+observeNativeModelMetadata.toString()+";void observe(timeoutMs).then(result=>{globalThis.__stateatomMetadata30.result=result;});return true;");
  assert.equal(await panel.evaluate(begin,c.metadataTimeoutMs),true);
  r.metadata=await waitFor(()=>panel.evaluate(()=>globalThis.__stateatomMetadata30?.result||null),45000);
  assert(r.metadata.availabilityInvocations<=1);assert.equal(r.metadata.timeoutMs,30000);
  r.checks.push('one finite real native metadata observation; no session or inference operation');
  r.status=r.metadata.outcome==='pending'?'INCOMPLETE_METADATA_PENDING':r.metadata.outcome==='resolved'?'OBSERVED_NATIVE_METADATA_NOT_USEFULNESS':'OBSERVED_NATIVE_METADATA_GAP_NOT_UNAVAILABLE';
 }catch(error){r.status='FAIL';r.error=error.stack||String(error);process.exitCode=1;}
 finally{
  for(const [name,close]of [['control',()=>control?.close()],['browser',()=>browser?.context.close()],['desktop',()=>desktop?.close()]])try{await close();r[name+'Closed']=true;}catch(error){r.errors.push(name+': '+String(error));r.status='FAIL';process.exitCode=1;}
  if(browser?.command?.pid)r.ownedBrowserPidAbsent=await access('/proc/'+browser.command.pid).then(()=>false,()=>true);
  try{await verifyInputs();r.allInputsUnchanged=true;r.checks.push('frozen source/package/distribution/history inputs unchanged');}catch(error){r.allInputsUnchanged=false;r.errors.push(String(error));r.status='FAIL';process.exitCode=1;}
  if(r.ownedBrowserPidAbsent===false)r.errors.push('Owned browser PID still present after cleanup; no full tree inference');
  if(r.errors.length){r.status='FAIL';process.exitCode=1;}
  r.finishedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(r,null,2)+'\n');console.log(r.status,JSON.stringify(r.metadata??null),out);
 }
}
main().catch(error=>{console.error(error.stack||String(error));process.exitCode=1;});
