// SPDX-License-Identifier: Apache-2.0
// Composition authority lives in the open IDE helper, not serialized page data.
import {establishProfileProof} from './profile-proof.mjs';
import {joinFirstRead} from './join.mjs';
import {checkFirstReadPremises} from './model.mjs';
const unknown=reason=>({schema:1,status:'Unknown/Unsupported',reason,fullPath:false});
const id=v=>typeof v==='string'&&v.length>0&&v.length<=256;
const sha=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export function checkFirstReadCode(compilation,code,run){
 try{
  const require=(ok,reason)=>{if(!ok)throw Error(reason);},v=compilation?.controlledBrowser,j=code?.journal,bundle=compilation?.manifest?.bundle;
  require(v?.schema===1&&[v.witnessId,v.targetId,v.extensionId,v.browserVersion,v.mainFrameId,v.contextUniqueId].every(id)&&v.freshProfile===true&&v.sandbox===true&&v.soleStateAtomExtension===true,'Actual controlled browser launch view unavailable');
  require(code.targetId===v.targetId&&code.extensionId===v.extensionId&&code.frameCount===1&&code.openerAbsent===true,'Browser target/frame/extension does not join the controlled session');
  require(j?.schema===1&&j.run===run&&id(j.id)&&j.mainFrameId===v.mainFrameId&&j.armedBeforeNavigation===true&&j.freshness==='Recorded'&&j.counts?.pending===0&&Number.isSafeInteger(j.generation)&&Date.now()-j.capturedAt>=0&&Date.now()-j.capturedAt<300000,'Complete current code history unavailable');
  require(Array.isArray(j.gaps)&&j.gaps.every(g=>['sourceURL','anonymous-or-non-http','isolated-world'].includes(g)),'Code-history loss or unsupported world/frame');
  require(sha(bundle?.digest)&&Number.isSafeInteger(bundle.bytes)&&bundle.bytes>0&&bundle.bytes<=2*1024*1024&&Array.isArray(j.scripts)&&j.scripts.length>0&&j.scripts.length<=256,'Bounded approved bundle/history unavailable');
  let bundles=0;const scripts=new Set();
  for(const s of j.scripts){
   require(id(s.scriptId)&&!scripts.has(s.scriptId)&&sha(s.digest)&&s.sourceStatus==='Hashed'&&Number.isSafeInteger(s.bytes)&&s.bytes>=0&&s.bytes<=2*1024*1024&&s.frameId===v.mainFrameId,'Unknown/lost/duplicate compilation');scripts.add(s.scriptId);
   // The sole loaded extension and the declared automation harness are the
   // isolated-world computing base; native realm separation grants no account
   // object reference there. This does not admit arbitrary MAIN-world code.
   if(s.world==='isolated'){require(id(s.contextUniqueId)&&s.contextUniqueId!==v.contextUniqueId,'Isolated/default context contradiction');continue;}
   require(s.world==='default'&&s.contextUniqueId===v.contextUniqueId,'Unknown or competing main-world context');
   if(s.digest===bundle.digest&&s.bytes===bundle.bytes&&s.ownedRole===null){bundles++;continue;}
   require(['selection-helper','deep-helper','fetch-policy-helper','fetch-passthrough'].includes(s.ownedRole),'Unapproved main-world compilation');
  }
  require(bundles===1,'Original owned bundle absent or multiply compiled');
  return{status:'Conditional closed-code join',fullPath:false,frame:v.mainFrameId,contextUniqueId:v.contextUniqueId,witnessId:v.witnessId,journalId:j.id,generation:j.generation,scope:'Exact acquired compilations in the controlled top-level realm; compilation is not invocation; native realm/CDP/compiler/extension are declared computing-base premises'};
 }catch(e){return unknown(e.message);}
}
export function verifyFirstRead({compilation,code,trace,selection,run}={}){
 const proof=establishProfileProof(compilation);if(proof.status!=='Code-linked')return unknown(proof.reason);
 const graph=checkFirstReadCode(compilation,code,run);if(graph.status!=='Conditional closed-code join')return unknown(graph.reason);
 const joined=joinFirstRead(trace,selection,{run,frame:graph.frame});if(joined.status!=='Conditional observed join')return unknown(joined.reason);
 const p=joined.premises,checked=checkFirstReadPremises({profile:proof,code:{...p.parse,closedCompilerInputs:true,sourceEquivalent:true,armedBeforeNavigation:true,drained:true,historyComplete:true,pending:0,unknownScripts:0,unknownContexts:0},...p});
 if(checked.status!=='Conditional premise set')return unknown(checked.reason);
 return{schema:1,status:'Supported finite trace',fullPath:true,case:joined.case,sourceProof:{status:'Code-linked',profile:proof.id,digest:proof.proofDigest,manifestId:proof.manifestId,bundleDigest:proof.bundleDigest,scope:proof.scope},occurrence:{...checked,status:'Observed',fullPath:undefined,authority:undefined},code:{status:'Code-linked',...graph,fullPath:undefined},joins:joined.joins,freshness:'Recorded',observedAt:selection.observedAt,scope:'Original React18/Query5 P1/P2 first eligible App data-render: exact parsed quota → particular scalar read → committed selected property. Finite source/effect derivation plus acquired occurrences; instrumented-page evidence, not native invocation attestation.',limits:['Later render, arbitrary application/pipeline, custom Query callbacks, foreign DevTools, unknown code/effects and incomplete history are unsupported.','P1 destructuring receiver is code-linked through ordinary JSON/no-write derivation; its acquired receipt alone is a reconstructed candidate.','No claim that the account remains readonly after this particular read.']};
}
