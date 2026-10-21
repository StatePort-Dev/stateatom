// SPDX-License-Identifier: Apache-2.0
// Main30 remains immutable; separate4 are declared synthetic model-input controls.
import bodyInputs from './local-derived-body-inputs.json' with {type:'json'};
import {localModelCorpus30} from './local-model-acceptance-corpus.mjs';
import {inspectionExplanationFacts} from '../../core/inspection-explanations.mjs';
export const localDerivedCorpusVersion='stateatom.local-derived-evaluation-corpus/1';
export function localDerivedCorpus(){
 const main=localModelCorpus30().map(c=>({...c,campaign:'main30'}));
 const supplement=bodyInputs.cases.map(c=>({id:'body-supplement:'+c.id,kind:'action',category:'synthetic-body-control',campaign:'body-supplement4',expected:'Admitted independent body count '+c.expectedBodies+'; no callback-object/binding/effect/HTTP attribution. '+(c.expectedBodies?'Separate body observation is not binding invocation.':'Wrong identity or stale history cannot supply current body evidence.'),facts:inspectionExplanationFacts(c.state,{question:'action'})}));
 return [...main,...supplement];
}
