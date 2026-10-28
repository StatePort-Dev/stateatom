// SPDX-License-Identifier: Apache-2.0
// Qualifies a collected native product UI receipt, never agreed-corpus usefulness.
import assert from 'node:assert/strict';
export function modelMetadataAllowsExplain(status){
 return status==='Local model available.'||status==='Explain simply starts/resumes the local model download; disk, CPU/GPU and battery may be used.';
}
export function qualifyOfficialModelSmoke({template,settled,witness,allowedSummaries,countersBefore,countersAfter}){
 assert.equal(template.enabled,false);assert.equal(template.explainDisabled,false);assert.equal(template.cancelHidden,true);assert(template.text);
 assert.deepEqual(countersAfter,countersBefore);
 assert.equal(witness.changes.length,1);assert.equal(witness.changes[0].trusted,true);assert.equal(witness.changes[0].checked,true);assert.equal(witness.changes[0].active,true);
 assert.equal(witness.explains.length,2);
 for(const [i,entry]of witness.explains.entries()){assert.equal(entry.trusted,true);assert.equal(entry.active,true);assert.equal(entry.enabled,i===1);}
 assert.equal(settled.enabled,true);assert.equal(settled.explainDisabled,false);assert.equal(settled.cancelHidden,true);
 assert(allowedSummaries.includes(settled.text),'Current grounded summary required');
 const model=settled.status==='Experimental local model · grounded sentence selection · not evidence';
 if(!model){assert(['Local explanation cancelled or timed out.','Local model output unavailable or rejected; showing the template.','Local model was not started.','Local model unavailable.','Local model status unknown · showing the template.','Cancelled · showing template.'].includes(settled.status));assert.equal(settled.text,template.text);}
 return {status:model?'OBSERVED_GROUNDED_MODEL_SMOKE_NOT_USEFULNESS':'OBSERVED_PRODUCT_TEMPLATE_FALLBACK_NOT_MODEL_ACCEPTANCE',modelInitializedAndValidatedOutputObserved:model,nativeAPICountersCollected:false,normalInstallationQualified:false,usefulnessQualified:false,wholeL02:false};
}
