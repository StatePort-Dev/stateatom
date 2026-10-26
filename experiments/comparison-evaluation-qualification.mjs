// SPDX-License-Identifier: Apache-2.0
// Research collection predicates only. DTO fixtures are never native evidence.
import assert from 'node:assert/strict';
import {guardInstallationChooserReceipt} from '../tests/helpers/comparison-native-chooser.mjs';import {localDerivedCorpus} from '../tests/fixtures/local-derived-corpus.mjs';
import {projectDerivedComparison,validateDerivedComparisonStructure} from '../core/derived-comparisons.mjs';
import {comparisonProtocol,expectedComparisonCases,expectedComparisonCreateOptions,comparisonSha,comparisonCurrentCaseId,comparisonChooserCaseId,comparisonCandidate} from '../scripts/comparison-evaluation-case.mjs';
export const comparisonCollectionStatus='COLLECTED_COMPARISON_CANDIDATE_NOT_L02';
export const comparisonIncompleteStatus='INCOMPLETE_COMPARISON_CANDIDATE_NOT_L02';
export const comparisonCleanupKeys=['console','browser','browserConnection','launcher','dragSource','desktop','chromeLog','profileLease','knownOwnedRetired','frozenInputs'];
const text=(x,max=8192)=>typeof x==='string'&&x.length>0&&x.length<=max,sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x),start=x=>typeof x==='string'&&/^\d+$/.test(x),pid=x=>Number.isSafeInteger(x)&&x>0;
const words=x=>x===null?0:x.trim().split(/\s+/).length;
function event(r,name){const all=r.events.filter(e=>e.op===name);assert.equal(all.length,1,'Expected exactly one '+name);return all[0];}
function templateFields(r,expected){for(const key of ['summary','evidenceIds','limitations'])assert.deepEqual(r[key],expected[key]);}
export function guardComparisonRunRecord(r,expected,s){
 assert.equal(r.id,expected.id);assert.equal(r.campaign,expected.campaign);assert.equal(r.caseIndex,expected.index);assert.equal(r.expectedEligible,expected.eligible);
 assert.equal(r.activation.trusted,true);assert.equal(r.activation.isActive,true);assert.deepEqual(r.requestOptions,{userActivation:true,allowDownload:false,timeoutMs:30000});
 assert(!Object.hasOwn(r,'error')&&!Object.hasOwn(r,'cancel')&&!Object.hasOwn(r,'changed'));
 templateFields(r.template,expected.template);templateFields(r.currentTemplate,expected.template);templateFields(r.result,expected.template);assert.equal(r.exactCurrentReferences,true);assert.equal(r.exactCurrentLimits,true);
 assert.equal(r.registeredPrompt,expected.prompt);assert.deepEqual(r.registeredConstraint,expected.constraint);assert(Number.isFinite(r.started)&&Number.isFinite(r.elapsedMs)&&r.elapsedMs>=0&&r.elapsedMs<=35000);assert(text(r.usefulness)&&r.usefulness.startsWith('UNASSESSED'));
 assert(Array.isArray(r.events)&&r.events.length<=32);let previous=r.started;
 for(const e of r.events){assert(Number.isFinite(e.at)&&e.at>=previous&&e.at<=r.started+r.elapsedMs);previous=e.at;}
 assert.equal(r.wordCounts.template,words(expected.template.summary));
 if(!expected.eligible){assert.deepEqual(r.events,[]);assert.equal(r.inferenceReturned,false);assert.equal(r.annotationAccepted,false);assert.equal(r.annotationText,null);assert.equal(r.result.provider,'template');assert.equal(r.result.annotation,null);assert.equal(r.wordCounts.annotation,0);return 'template-outside-scope';}
 assert.deepEqual(r.events.map(e=>e.op),['availability-start','availability-resolved','create-start','create-resolved','prompt-start','prompt-resolved','destroy-attempt','destroy-returned']);
 assert.deepEqual(event(r,'availability-start').options,{expectedInputs:s.expectedCreateOptions.expectedInputs,expectedOutputs:s.expectedCreateOptions.expectedOutputs});assert.equal(event(r,'availability-resolved').result,'available');
 assert.deepEqual(event(r,'create-start').options,s.expectedCreateOptions);
 const settings=event(r,'create-resolved').returnedSettings;assert(['Observed','Unknown/Unsupported'].includes(settings.status));
 assert(settings.topK===null||Number.isFinite(settings.topK));assert(settings.temperature===null||Number.isFinite(settings.temperature));
 if(settings.topK!==null)assert.equal(settings.topK,s.expectedCreateOptions.topK);if(settings.temperature!==null)assert.equal(settings.temperature,s.expectedCreateOptions.temperature);
 if(settings.status==='Observed'){assert.equal(settings.topK,s.expectedCreateOptions.topK);assert.equal(settings.temperature,s.expectedCreateOptions.temperature);}else assert(settings.topK===null||settings.temperature===null);
 const sent=event(r,'prompt-start'),returned=event(r,'prompt-resolved');assert.equal(sent.prompt,expected.prompt);assert.deepEqual(sent.requestedConstraint,expected.constraint);assert.deepEqual(sent.constraint,expected.constraint);assert.equal(sent.signalPresent,true);assert.equal(returned.rawType,'string');assert.equal(typeof returned.raw,'string');assert.equal(returned.signalAbortedAtReturn,false);assert.equal(r.inferenceReturned,true);
 const c=localDerivedCorpus()[expected.index];assert.equal(c.id,expected.id);let validated,invalid=false;
 try{validated=validateDerivedComparisonStructure(returned.raw,projectDerivedComparison(c.facts),c.facts);}catch{invalid=true;}
 if(invalid){assert.equal(r.result.provider,'template');assert.equal(r.result.annotation,null);assert.equal(r.annotationAccepted,false);assert.equal(r.annotationText,null);assert.equal(r.wordCounts.annotation,0);assert.equal(r.result.reason,'Local annotation unavailable or rejected; showing the template.');return 'model-returned-client-rejected';}
 assert.equal(r.result.provider,'chrome-built-in-derived-comparison');assert.deepEqual(r.result.annotation,validated);assert.equal(comparisonSha(r.result.annotation.identity),expected.identitySha256);assert.equal(r.result.annotation.factualEntailmentVerified,false);assert.equal(r.annotationAccepted,true);assert.equal(r.annotationText,validated.text);assert.equal(r.wordCounts.annotation,words(validated.text));return 'model-returned-client-accepted';
}
export function guardComparisonCollection(r,s){
 assert.equal(s.schema,'stateatom.l02-comparison-case/1');assert.deepEqual(s.protocol,comparisonProtocol());assert.deepEqual(s.expectedCases,expectedComparisonCases());assert.deepEqual(s.expectedCreateOptions,expectedComparisonCreateOptions());
 assert.equal(r.schema,'stateatom.l02-comparison-native/1');assert.equal(r.caseId,s.id);assert(sha(r.caseSha256));assert.match(r.sourceRevision,/^[a-f0-9]{40}$/);assert(pid(r.nativePID));
 assert.equal(r.issuedPair.atomSha256,s.atomSha256);assert.equal(r.issuedPair.uiSha256,s.uiSha256);assert(sha(r.issuedPair.atomSha256)&&sha(r.issuedPair.uiSha256));assert.equal(r.issuedPair.checkedBeforeBrowser,true);assert.equal(r.issuedPair.newProviderIsArchiveExport,false);
 assert.equal(r.diagnosticOnly,true);assert.equal(r.originalAcceptanceWaived,false);assert.equal(r.modelQualityAssessed,false);assert.equal(r.fullL02,false);assert.equal(r.productProviderSelected,false);assert.deepEqual(r.actualNode,s.node);
 const b=r.browser;assert.equal(b.product,'Chrome/'+s.chrome.version);assert.equal(b.ownerAttested,true);assert.equal(b.uid,s.profile.uid);assert.equal(b.profile,s.profile.path);assert.equal(b.exe,s.chrome.binary);assert(sha(b.exeSha256));assert.equal(b.exeSha256,s.chrome.binarySha256);assert(pid(b.pid)&&pid(b.launcherPID)&&start(b.startTime)&&start(b.launcherStartTime));assert.deepEqual(b.originalArguments,s.launchArguments);
 assert(Array.isArray(b.parentChain)&&b.parentChain.length>=1&&b.parentChain.length<=8);assert.equal(b.parentChain[0].pid,b.pid);assert.equal(b.parentChain[0].startTime,b.startTime);let launcher;
 for(const[i,p]of b.parentChain.entries()){assert(pid(p.pid)&&pid(p.ppid)&&start(p.startTime));if(i)assert.equal(b.parentChain[i-1].ppid,p.pid);if(p.pid===b.launcherPID)launcher=p;}
 assert(launcher);assert.equal(launcher.startTime,b.launcherStartTime);assert.equal(launcher.ppid,r.nativePID);
 assert.match(r.extensionId,/^[a-p]{32}$/);assert.equal(r.evalURL,'chrome-extension://'+r.extensionId+'/l02-eval.html');
 if(s.id===comparisonCurrentCaseId||s.id===comparisonChooserCaseId){
  const candidate=comparisonCandidate(s.id===comparisonChooserCaseId?'native-chooser':'current-owned');assert.equal(s.atomSha256,candidate.atomSha256);assert.equal(s.uiSha256,candidate.uiSha256);
  const d=r.extensionDiscovery;assert.equal(d?.method,'exact-prepared-path-in-extension-ui');
  assert.equal(d.before.ready,true);assert.deepEqual(d.before.items,[]);
  assert.equal(d.latest.ready,true);assert(text(d.latest.at,64)&&Number.isFinite(Date.parse(d.latest.at)));
  const selected={id:r.extensionId,path:s.hostPath,state:'ENABLED',location:'UNPACKED'};
  assert.deepEqual(d.selected,selected);assert.deepEqual(d.latest.items,[selected]);
  assert.match(s.profile.previousExtensionId,/^[a-p]{32}$/);assert.notEqual(r.extensionId,s.profile.previousExtensionId);
 }

 const proof=r.runtimeProof;assert(text(proof.scriptId,256));assert.equal(proof.scriptURL,'chrome-extension://'+r.extensionId+'/l02-eval.js');assert(sha(proof.sourceSha256));assert.equal(proof.sourceSha256,s.addon.jsSha256);assert.equal(proof.nonce,s.nonce);assert.equal(proof.loadedFile,s.out+'/loaded-evaluation.js');assert.equal(r.originalHostUnchanged,true);
 if(s.id===comparisonChooserCaseId){assert.equal(r.installation.method,'native-load-unpacked-chooser');guardInstallationChooserReceipt(r.folderChooser,s,b);assert.equal(r.nativeDrop,undefined);assert.equal(r.ownedProcesses.dragSource,undefined);}else assert.equal(r.installation.method,'native-gtk-folder-drop');assert.equal(r.installation.sourceFolder,s.hostPath);assert.equal(r.installation.developerModeObserved,true);assert(['disabled','absent'].includes(r.installation.previousState));assert.equal(r.installation.authenticatedX,true);assert.equal(r.installation.privateDBus,true);
 assert.equal(r.profileLease.acquired,true);assert.equal(r.profileLease.releaseConfirmed,true);assert.equal(r.profileLease.nonce,s.nonce);assert.equal(r.profileLease.profile,s.profile.path);
 assert.equal(r.runs.length,34);let model=0;for(const[i,row]of r.runs.entries()){const result=guardComparisonRunRecord(row,s.expectedCases[i],s);if(result!=='template-outside-scope')model++;}assert.equal(model,10);
 const log=r.consoleCollection;assert.equal(log.schema,'stateatom.l02-comparison-console/1');assert.equal(log.pageURL,r.evalURL);assert.equal(log.status,'Stopped');assert.equal(log.scope,'Evaluation page deliveries until explicit stop');assert.equal(log.overflow,false);assert(Array.isArray(log.records)&&log.records.length<=128);assert.equal(log.seen,log.records.length);assert(log.records.every(x=>x.type==='warning'));assert(Number.isFinite(log.startedAt)&&Number.isFinite(log.stoppedAt)&&log.stoppedAt>=log.startedAt);assert.deepEqual(r.errors,[]);assert.deepEqual(r.pageErrors,[]);
 for(const k of comparisonCleanupKeys)assert.equal(r.cleanup[k],true);
 const chooser=s.id===comparisonChooserCaseId;for(const role of (chooser?['browser','launcher','desktop']:['browser','launcher','desktop','dragSource']))assert(r.ownedProcesses[role]);
 assert(Array.isArray(r.processRetirement)&&r.processRetirement.length>=(chooser?3:4)&&r.processRetirement.length<=128);
 for(const p of Object.values(r.ownedProcesses)){assert(pid(p.pid)&&start(p.startTime));const retired=r.processRetirement.find(q=>q.pid===p.pid&&q.startTime===p.startTime);assert(retired&&['Absent','ReusedDifferentIdentity'].includes(retired.state));}
 assert.equal(r.ownedProcesses.browser.pid,b.pid);assert.equal(r.ownedProcesses.browser.startTime,b.startTime);assert.equal(r.ownedProcesses.launcher.pid,b.launcherPID);assert.equal(r.ownedProcesses.launcher.startTime,b.launcherStartTime);
 assert.equal(r.inputsUnchanged,true);assert(r.inputsBefore&&Object.keys(r.inputsBefore).length>0);assert.deepEqual(r.inputsAfter,r.inputsBefore);
 return comparisonCollectionStatus;
}
export function finalizeComparisonCollection(r,s){try{assert.equal(r.status,comparisonCollectionStatus);guardComparisonCollection(r,s);return r.status=comparisonCollectionStatus;}catch{return r.status=comparisonIncompleteStatus;}}
