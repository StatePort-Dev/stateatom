// SPDX-License-Identifier: Apache-2.0
// One v3 evaluation copy; no browser, model, download or original host mutation.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,cp,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {build} from 'esbuild';
import {fileManifest} from './atom-package-receipt.mjs';
import {pilotFileSha256,pilotProfileManifest} from '../experiments/official-comparison-pilot-qualification.mjs';
import {focusedProtocol,expectedFocusedCases,expectedFocusedCreateOptions} from '../experiments/focused-evaluation-qualification.mjs';
const root=process.cwd(),base='.artifacts/l02/focused-current-driver/2026-10-29',old=JSON.parse(await readFile('docs/testing/official-comparison-pilot-case.json'));
assert.equal(await access(base).then(()=>true,()=>false),false,'New case directory must not already exist');
assert.equal(await access('/proc/'+old.profileSourceOwnerPid).then(()=>true,()=>false),false);
assert.deepEqual(await pilotProfileManifest(old.profileSource),{files:old.profileFiles,links:old.profileLinks});
const host=old.host,officialDist=old.officialDist,hostRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:host,encoding:'utf8'}).trim();
assert.equal(execFileSync('git',['status','--porcelain'],{cwd:host,encoding:'utf8'}).trim(),'');
const preparedHost=resolve(base,'prepared-host'),nonce=randomBytes(16).toString('hex');await mkdir(base,{recursive:true});await cp(officialDist,preparedHost,{recursive:true,errorOnExist:true,force:false});
const built=await build({entryPoints:['tests/helpers/local-focused-evaluation-page.mjs'],bundle:true,platform:'browser',format:'iife',target:'chrome156',write:false,metafile:true});
await writeFile(join(preparedHost,'l02-eval.js'),built.outputFiles[0].contents);
const html=(await readFile('tests/fixtures/local-focused-evaluation.html','utf8')).replace('<main>','<meta name="stateatom-focused-case" content="'+nonce+'"><main>').replace(/id="([^"]+)"/g,'id="$1" data-atom-id="$1"');await writeFile(join(preparedHost,'l02-eval.html'),html);
const native=await build({entryPoints:['tests/integration/focused-current-driver.mjs',old.googleAdapter,'scripts/native-browser.mjs','tests/helpers/source-access-native-desktop.mjs','tests/helpers/native-inspector-ui.mjs'],bundle:true,platform:'node',packages:'external',write:false,outdir:'/tmp/focused-native-bindings',metafile:true,logLevel:'silent'});
const inputHashes={};for(const file of new Set([...Object.keys(built.metafile.inputs),...Object.keys(native.metafile.inputs),'scripts/prepare-focused-current-driver.mjs','tests/fixtures/local-focused-evaluation.html','docs/completion/267-l02-official-context-comparison-pilot.md','docs/completion/268-l02-official-warm-lifecycle.md','docs/testing/official-comparison-pilot-case.json','package-lock.json','docs/testing/focused-annotation-case.json','.artifacts/l02/focused-annotation/2026-10-29/native/results.json','.artifacts/l02/focused-annotation/2026-10-29/native-exit.json','.artifacts/l02/official-comparison-pilot/2026-10-28/native/results.json']))inputHashes[file]=await pilotFileSha256(resolve(file));
const c={schema:'stateatom.l02-focused-case/3',maximumNativeAttempts:1,out:base+'/native',attemptFile:base+'/native-attempt.json',host,hostRevision,officialDist,officialDistManifest:await fileManifest(officialDist),preparedHost,preparedHostManifest:await fileManifest(preparedHost),nonce,addon:{jsSha256:await pilotFileSha256(join(preparedHost,'l02-eval.js')),htmlSha256:await pilotFileSha256(join(preparedHost,'l02-eval.html'))},developmentId:old.developmentId,googleAdapter:old.googleAdapter,browserProduct:old.browserProduct,browserExeSha256:old.browserExeSha256,profileSource:old.profileSource,profileSourceOwnerPid:old.profileSourceOwnerPid,profileFiles:old.profileFiles,profileLinks:old.profileLinks,cloneFiles:old.cloneFiles,protocol:focusedProtocol(),expectedCases:expectedFocusedCases(),expectedCreateOptions:expectedFocusedCreateOptions(),inputHashes,productProviderSelected:false,originalAcceptanceWaived:false,fullL02:false};
assert.equal(await pilotFileSha256('/opt/google/chrome/chrome'),c.browserExeSha256);
await writeFile('docs/testing/focused-current-driver-case.json',JSON.stringify(c,null,2)+'\n');console.log(JSON.stringify({case:'docs/testing/focused-current-driver-case.json',sha256:await pilotFileSha256('docs/testing/focused-current-driver-case.json'),sourceInputs:Object.keys(inputHashes).length,hostRevision,eligible:c.expectedCases.filter(x=>x.eligible).length,modelCalls:0}));
