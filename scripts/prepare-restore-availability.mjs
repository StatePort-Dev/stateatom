// SPDX-License-Identifier: Apache-2.0
// Freeze ONE new affected case from an exact issued local pair; never launch here.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {sha256,verifyArtifactHashes} from './atom-package-receipt.mjs';
import {admitRestoreAvailabilityPackage,restoreAvailabilityProtocol} from '../tests/integration/restore-availability-native.mjs';

const [handoffFile,admissionFile]=process.argv.slice(2);
assert(process.argv.length===4&&[handoffFile,admissionFile].every(x=>typeof x==='string'&&x&&!x.startsWith('--')),'Pass exact78 handoff and admission result only');
const root=process.cwd(),json=async f=>JSON.parse(await readFile(f)),h=await json(handoffFile),typesFile=path.dirname(path.resolve(handoffFile))+'/type-consumer-result.json',types=await json(typesFile),admission=await json(admissionFile);
admitRestoreAvailabilityPackage({h,types,admission,handoffSha256:sha256(await readFile(handoffFile))});await verifyArtifactHashes([h.package,h.ui]);
const oldCaseFile=root+'/docs/testing/owned-editor-reply-case77.json',old=await json(oldCaseFile),app=(await json(old.dependencyReceipt)).apps.find(a=>a.slug==='Serkanbyx--e-commerce-frontend'),original=await json(app.sourceManifest);
assert.equal(Object.keys(original).length,65);assert(app.originalSourceAndLockFilesMatch);
const inputHashes={},productInputs={};
for(const[f,v]of Object.entries(h.buildSources.manifest)){const file=path.resolve(f);assert.equal(sha256(await readFile(file)),v,'Current build source drift');productInputs[file]=v;}
for(const[f,v]of Object.entries(original))for(const base of [app.workingCopy,app.immutableSource]){const file=path.resolve(base,f);assert.equal(sha256(await readFile(file)),v,'Original source drift');inputHashes[file]=v;}
for(const[f,v]of Object.entries(old.inputHashes))if(f.includes('/node_modules/')){assert.equal(sha256(await readFile(f)),v,'Pinned app dependency drift');inputHashes[f]=v;}
for(const kind of ['standalone','embedding'])for(const[f,v]of Object.entries(h.consumerReceipt.hostFiles[kind])){const file=path.resolve(h.hosts[kind],f);assert.equal(sha256(await readFile(file)),v,'Built host drift');inputHashes[file]=v;}
const b=await json(root+'/.artifacts/v03/restore-availability-source/2026-10-25/registration.json');
const retained77File=old.out+'/results.json';assert.equal(sha256(await readFile(retained77File)),b.retainedV03Raw.sha256);const retained77=await json(retained77File);
assert.equal(sha256(await readFile(oldCaseFile)),retained77.inputsAfter[oldCaseFile],'Retained77 case drift');assert.equal(sha256(await readFile(old.atomHandoff)),retained77.inputsAfter[old.atomHandoff],'Retained77 handoff drift');
const retainedResults=[...old.retainedResults,{file:old.out+'/results.json',sha256:b.retainedV03Raw.sha256}];
for(const c of b.retainedNativeCases){const s=await json(c.case);retainedResults.push({file:s.out+'/results.json',sha256:c.rawSha256});}
for(const c of retainedResults)assert.equal(sha256(await readFile(c.file)),c.sha256,'Retained raw drift');
const files=[handoffFile,typesFile,admissionFile,h.package.file,h.ui.file,oldCaseFile,old.atomHandoff,old.dependencyReceipt,app.sourceManifest,old.node.executable,old.chrome.executable,
 'scripts/prepare-restore-availability.mjs','tests/integration/restore-availability-native.mjs','tests/atom/restore-availability-harness.test.mjs','experiments/restore-availability-qualification.mjs','tests/engine/restore-availability-qualification.test.mjs',
 'scripts/native-browser.mjs','scripts/harness.mjs','scripts/atom-package-receipt.mjs','tests/helpers/native-inspector-ui.mjs','tests/helpers/source-access-native-desktop.mjs','tests/helpers/inspector-input-order.mjs','tests/integration/inspector-input-order-native.mjs',
 'docs/superpowers/specs/2026-10-25-v03-packed-restore-availability-design.md','docs/superpowers/plans/2026-10-25-v03-packed-restore-availability.md',
 '.artifacts/v03/undo-eligibility-review/2026-10-24/final-checkpoint.json',...retainedResults.map(x=>x.file)];
for(const f of files)inputHashes[path.resolve(f)]=sha256(await readFile(f));
const out=root+'/.artifacts/v03/restore-availability/'+new Date().toISOString().replace(/[:.]/g,'-'),caseFile=root+'/docs/testing/restore-availability-case78.json';
const s={schema:'stateatom.restore-availability-case/1',id:'V03.24-local78-restoration-availability',maximumNativeRuns:1,out,atomHandoff:path.resolve(handoffFile),atomSha256:h.package.sha256,uiSha256:h.ui.sha256,packedTypes:typesFile,packedAdmission:path.resolve(admissionFile),dependencyReceipt:old.dependencyReceipt,application:old.application,applicationRevision:old.applicationRevision,sourceFiles:65,syntheticProducts:old.syntheticProducts,syntheticImage:old.syntheticImage,node:old.node,chrome:old.chrome,retainedResults,productInputs,inputHashes,protocol:restoreAvailabilityProtocol(),boundaries:{originalGuide:'FAIL',successfulRestoration:false,fullV03:false,SDK:false,publication:false,otherRepository:false,installedUserProfile:false,humanVisualAcceptance:false},stoppingRule:'One literal native outcome. Actual flag/button agreement plus two applied Live receipts and safe Close qualify this affected scope only. External-revision guard stays unchanged. Missing/failed/stale/console/cleanup/input mismatch is INCOMPLETE; preserve raw and do not repeat this case.'};
await mkdir(path.dirname(out),{recursive:true});await mkdir(out);
await writeFile(out+'/preparation.json',JSON.stringify({caseFile,registeredBeforeNative:true,browserStarted:false,sourceProductBehaviorChangesAfterV03_23:0,helperOrIDEProcess:false,extensionSetup:'historical-cli-preload',oldResultsUnchanged:true,productInputs:Object.keys(productInputs).length,otherFrozenInputs:Object.keys(inputHashes).length},null,2)+'\n',{flag:'wx'});
await writeFile(caseFile,JSON.stringify(s,null,2)+'\n',{flag:'wx'});console.log(caseFile,out);
