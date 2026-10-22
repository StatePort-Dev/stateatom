// SPDX-License-Identifier: Apache-2.0
// Pure synthetic composed historical report; not native reporter evidence.
import {productionObservationCaptureFixture as fixture} from './production-observation-capture-fixture.mjs';
import {createHandoffDraft} from '../../core/handoff-draft.mjs';
import {createHandoffReport} from '../../core/handoff-report.mjs';
import {createReviewedHandoffReport} from '../../core/handoff-reviewed.mjs';
import {createHandoffInputEvidence} from '../../core/handoff-input-evidence.mjs';
import {composeHandoffInputReport} from '../../core/handoff-input-report.mjs';
import {createHandoffObservationEvidence} from '../../core/handoff-observation-evidence.mjs';
import {composeHandoffObservationReport} from '../../core/handoff-observation-report.mjs';
import {handoffArtifactDigest as hash} from '../../core/handoff-files.mjs';
const now=()=>3000,all=['observationIdentities','observationLocations','observationValues'];
export async function observationReportFixture({minimal=false,withInput=false,captureOptions={}}={}){const c=await fixture(captureOptions),source=c.inputCapture.diagnosticRaw,draft=await createHandoffDraft(source,{title:'Confirm stays disabled',actual:'Entered a name',expected:'Confirm becomes enabled'},{now:()=>2600}),frozen=await draft.freeze({expectedRevision:0});let base=minimal?await createHandoffReport(source,JSON.stringify(frozen.baseline),{}, {now:()=>2700}):await createReviewedHandoffReport(source,JSON.stringify(frozen.baseline),{}, {now:()=>2700});if(withInput)base=await composeHandoffInputReport(base,await createHandoffInputEvidence(JSON.stringify(c.inputCapture)),{expectedParentDigest:await hash(base),now:()=>2800});const packet=await createHandoffObservationEvidence(JSON.stringify(c),{includeCategories:all},{now:()=>2900}),raw=await composeHandoffObservationReport(base,packet,{expectedParentDigest:await hash(base),now});return{c,source,base,packet,raw};}
