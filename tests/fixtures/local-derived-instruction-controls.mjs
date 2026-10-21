// SPDX-License-Identifier: Apache-2.0
// Existing genuine inputs only; focused diagnostics never replace original30+4.
import {localDerivedCorpus} from './local-derived-corpus.mjs';
export function localDerivedInstructionControls(){
 const all=localDerivedCorpus(),ids=['source-keyup','source-pointerdown','native-click','one-blocker','negated-masking','unknown-left','local-scalar','untrusted-handler-label','body-supplement:separate-body-without-binding','body-supplement:binding-plus-independent-body'];
 return ids.map(id=>{const c=all.find(c=>c.id===id);if(!c)throw Error('Missing registered control '+id);return{...c,originalCampaign:c.campaign,campaign:'instruction-controls10'};});
}
