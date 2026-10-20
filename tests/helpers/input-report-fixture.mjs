// SPDX-License-Identifier: Apache-2.0
// Synthetic ledger/diagnostic/local-byte fixture; never native U02/H05 proof.
import {createHash} from 'node:crypto';
import {inputOutcomeFixture} from './input-outcome-fixture.mjs';
import {makeDiagnostic} from '../../core/diagnostic.mjs';
import {createHandoffInputOutcomes} from '../../core/handoff-input-outcomes.mjs';
import {createHandoffInputEvidence} from '../../core/handoff-input-evidence.mjs';
import {createHandoffDraft} from '../../core/handoff-draft.mjs';
import {createHandoffReport} from '../../core/handoff-report.mjs';
import {createReviewedHandoffReport,redactReviewedHandoff} from '../../core/handoff-reviewed.mjs';
import {appendHandoffSourceEvidence} from '../../core/handoff-source-attachment.mjs';
export const hash=x=>createHash('sha256').update(x).digest('hex');
export async function inputReportFixture({profile='reviewed',sourceKind='dom-control',large=false,inputReview={includeCategories:['inputIdentities','inputValues','inputLocations','inputErrors']}}={}){
 const f=inputOutcomeFixture({sourceKind,...(large?{privateValue:'PrivateLargeInputValueCedar-'+ 'V'.repeat(3500)}:{})});for(let i=0;i<(large?64:1);i++){if(large)f.ledger.observeControls([{...f.resource(),value:'Budget before '+i,revision:'budget-before:'+i}]);f.apply();}
 const file='src/InputReportCedar.tsx',code='export const disabled = true; // actual local fixture bytes\n',build='a'.repeat(64);
 const sources=large?Array.from({length:16},(_,i)=>({file:i?file.replace('.tsx','-'+i+'.tsx'):file,line:1,column:1,sourceDigest:hash(code),expressions:Array.from({length:16},(_,j)=>'const expression'+j+' = '+ 'Z'.repeat(360))})):[{file,line:1,column:1,sourceDigest:hash(code)}];
 const diagnostic=at=>makeDiagnostic({selection:{tabId:7,selector:f.target.selector,property:'disabled',value:true,observedAt:1000},analysis:{sources,graph:{identity:{run:f.target.run,build}}}},{now:at,includeContent:large,notes:'Synthetic private diagnostic, not copied'});
 const diagnosticRaw=JSON.stringify(diagnostic(2000)),developerRaw=JSON.stringify(diagnostic(4000));
 const outcomes=await createHandoffInputOutcomes(diagnosticRaw,f.capture(),{includeCategories:['inputIdentities','inputValues','inputLocations','inputErrors']});
 const privateRaw=JSON.stringify({schema:'stateatom.input-outcome-capture/1',exportable:false,executable:false,capturedAt:2000,diagnosticRaw,outcomes,limitations:[]});
 const packetRaw=await createHandoffInputEvidence(privateRaw,inputReview,{now:()=>3000});
 const draft=await createHandoffDraft(diagnosticRaw,{title:'Input fixture issue',actual:'Cannot confirm',expected:'Enabled',question:'What changed?'},{now:()=>3000});await draft.freeze({expectedRevision:0});
 const baselineRaw=JSON.stringify(draft.read().baseline);
 let baseRaw=profile==='minimal'?await createHandoffReport(diagnosticRaw,baselineRaw,{},{now:()=>3000}):await createReviewedHandoffReport(diagnosticRaw,baselineRaw,{content:{includeCategories:['selectionDetails','sourceLocations',...(large?['sourceExcerpts']:[])]}},{now:()=>3000});
 if(large){const fields=JSON.parse(baseRaw).report.technicalEvidence.fields.filter(f=>f.category==='sourceExcerpts'&&f.state==='included').slice(0,100);baseRaw=await redactReviewedHandoff(baseRaw,{replaceFields:fields.map(f=>({id:f.id,text:'X'.repeat(4000)}))},{expectedParentDigest:hash(baseRaw),now:()=>3500});}
 const files=[{file,bytes:new TextEncoder().encode(code).buffer}];
 if(profile==='source')baseRaw=await appendHandoffSourceEvidence(baseRaw,developerRaw,files,{text:'Developer compared selected local bytes'},{includeFiles:[file],expectedParentDigest:hash(baseRaw),now:()=>4000});
 return {baseRaw,packetRaw,privateRaw,diagnosticRaw,developerRaw,files,file,code,build,baselineRaw};
}
