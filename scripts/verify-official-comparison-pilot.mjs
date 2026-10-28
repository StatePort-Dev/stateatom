// SPDX-License-Identifier: Apache-2.0
// ONE saved reader for the new explicit test-only route; no browser or model calls.
import assert from 'node:assert/strict';
import {readFile,writeFile,open} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileManifest} from './atom-package-receipt.mjs';
import {pilotFileSha256,pilotProfileManifest,qualifyOfficialComparisonPilot} from '../experiments/official-comparison-pilot-qualification.mjs';
import {assertUniqueHandoffJSONMembers} from '../core/handoff-json.mjs';
const base='.artifacts/l02/official-comparison-pilot/2026-10-28',casePath='docs/testing/official-comparison-pilot-case.json',rawPath=base+'/native/results.json';
if(process.argv.length!==4||process.argv[2]!==casePath||process.argv[3]!==rawPath)throw Error('OFFICIAL_PILOT_READER_SCOPE');
const caseBytes=await readFile(casePath,'utf8');assertUniqueHandoffJSONMembers(caseBytes);const c=JSON.parse(caseBytes),caseSha=createHash('sha256').update(caseBytes).digest('hex');
const attempt=await open(base+'/reader-attempt.json','wx');try{await attempt.writeFile(JSON.stringify({caseSha256:caseSha,raw:rawPath,maximumReads:1,at:new Date().toISOString()},null,2)+'\n');}finally{await attempt.close();}
const rawBytes=await readFile(rawPath,'utf8');assertUniqueHandoffJSONMembers(rawBytes);const r=JSON.parse(rawBytes),rawSha=createHash('sha256').update(rawBytes).digest('hex'),exit=JSON.parse(await readFile(base+'/driver-exit.json'));
assert.equal(exit.rawSha256,rawSha);assert.equal(exit.sourceRevision,r.sourceRevision);assert.equal(r.caseSha256,caseSha);
for(const [file,h]of Object.entries(c.inputHashes))assert.equal(await pilotFileSha256(file),h,file);
assert.deepEqual(await fileManifest(c.officialDist),c.officialDistManifest);assert.deepEqual(await fileManifest(c.preparedHost),c.preparedHostManifest);assert.deepEqual(await pilotProfileManifest(c.profileSource),{files:c.profileFiles,links:c.profileLinks});
const qualification=qualifyOfficialComparisonPilot(r,c);
const result={...qualification,caseSha256:caseSha,rawSha256:rawSha,readerSha256:await pilotFileSha256(new URL(import.meta.url)),inputCount:Object.keys(c.inputHashes).length,sourceRevision:r.sourceRevision,actualBrowser:r.browser?.version,sourceFixtureOnly:false,semanticQualityAssessed:false,originalFullReadersExecuted:false,at:new Date().toISOString()};
await writeFile(base+'/saved-verification.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
