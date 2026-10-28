// SPDX-License-Identifier: Apache-2.0
// Reuse only the existing complete code-history predicate and native provisioning
// witness, never the React18/Query source/effect or occurrence proof.
import path from 'node:path';
import {joinListFieldObservations} from './list-field-join.mjs';
import {checkFirstReadCode} from '../first-read/verify.mjs';
import {isOwnedControlledBrowserWitness,controlledBrowserView} from '../first-read/controlled-session.mjs';
import {listFieldEffectsView,validateListFieldEffects} from './list-field-effects.mjs';
import {validateOwnedListFieldCompilation,listFieldCompilationWorkspace} from './list-field-compilation.mjs';
const contexts=new WeakMap();
const unknown=reason=>Object.freeze({status:'Unknown/Unsupported',reason,fullPath:false,currentOwnership:'Unknown/Unsupported'});
const identityKeys=['witnessId','targetId','extensionId','mainFrameId','contextUniqueId'];
const sameContext=(a,b)=>a&&b&&identityKeys.every(key=>a[key]===b[key]);
export function checkListFieldCode({manifest,controlledBrowser,code,run}={}){
 const result=checkFirstReadCode({manifest,controlledBrowser},code,run);
 if(result.status!=='Conditional closed-code join')return unknown(result.reason);
 return Object.freeze({...result,status:'Conditional list code interval',currentOwnership:'Unknown/Unsupported',scope:'Exact compiled byte/context interval only; not invocation, field effects or selected lineage. Raw journal/view DTOs are not owned authority.'});
}
export async function createListFieldCodeContext({compilation,effects,witness}={}){
 // A serialized native view is never an issuance path. No test-only bypass.
 if(!isOwnedControlledBrowserWitness(witness)||!await validateListFieldEffects(effects)||!await validateOwnedListFieldCompilation(compilation))return unknown('Owned source/effect/native capabilities unavailable');
 const effectView=listFieldEffectsView(effects);
 if(effectView.manifestDigest!==compilation.manifest.digest||effectView.bundleDigest!==compilation.manifest.bundle.digest)return unknown('Source effect account and compiled bytes do not join');
 const native=await controlledBrowserView(witness);
 if(!native||!isOwnedControlledBrowserWitness(witness)||!await validateListFieldEffects(effects))return unknown('Current controlled native context unavailable');
 const capability=Object.freeze({});contexts.set(capability,{compilation,effects,witness,native});return capability;
}
export function listFieldCodeContextView(capability){
 const c=contexts.get(capability);if(!c)return unknown('No owned list code context');
 return Object.freeze({status:'Owned list code context',bundleDigest:c.compilation.manifest.bundle.digest,manifestDigest:c.compilation.manifest.digest,...Object.fromEntries(identityKeys.map(key=>[key,c.native[key]])),fullPath:false,currentOwnership:'Unknown/Unsupported',scope:'Owned compiler/effect/native context binding; actual trusted extension journal remains required'});
}
export async function inspectListFieldCodeContext(capability,{code,run}={}){
 const c=contexts.get(capability);if(!c)return unknown('No owned list code context');
 if(!isOwnedControlledBrowserWitness(c.witness)||!await validateListFieldEffects(c.effects)){contexts.delete(capability);return unknown('Source or controlled native context revoked')}
 const current=await controlledBrowserView(c.witness);
 if(!sameContext(c.native,current)){contexts.delete(capability);return unknown('Native frame/context changed')}
 // The actual caller must be the trusted extension/helper route. A caller's raw
 // JSON cannot become a field/occurrence proof through this conditional result.
 const result=checkListFieldCode({manifest:c.compilation.manifest,controlledBrowser:current,code,run});
 if(!await validateListFieldEffects(c.effects)||!isOwnedControlledBrowserWitness(c.witness)){contexts.delete(capability);return unknown('Source or native context changed during code verification')}
 const finalNative=await controlledBrowserView(c.witness);
 if(!sameContext(current,finalNative)){contexts.delete(capability);return unknown('Native frame/context changed during code verification')}
 return result;
}

// Called only by the authenticated extension/helper path. This records the
// inspection's original occurrence; it does not promise a perpetually live view.
export async function verifyListFieldSelection(capability,{trace,selection,code,run}={}){
 const c=contexts.get(capability);if(!c)return unknown('No owned list code context');
 const interval=await inspectListFieldCodeContext(capability,{code,run});
 if(interval.status!=='Conditional list code interval')return interval;
 const joined=joinListFieldObservations({manifest:c.compilation.manifest,trace,selection});
 if(joined.status!=='Conditional selected list join')return joined;
 const source=listFieldEffectsView(c.effects);if(source.status!=='Code-linked')return unknown('Source effect capability revoked');
 return{schema:'stateatom.selected-list-profile/1',status:'Supported finite trace',fullPath:true,field:joined.field,page:joined.page,freshness:'Recorded',observedAt:selection.observedAt,
  fieldOwnership:'Code-linked for the recorded write-to-read interval',chain:joined.chain,
  sourceProof:{status:'Code-linked',profile:source.profile,digest:source.proofDigest,manifestDigest:source.manifestDigest,bundleDigest:source.bundleDigest,scope:source.scope},
  occurrence:{status:'Observed',joins:joined.joins,scope:'Original acquired write, transfer, read and selected commit at this inspection'},
  code:{status:'Code-linked',journalId:interval.journalId,generation:interval.generation,frame:interval.frame,contextUniqueId:interval.contextUniqueId,witnessId:interval.witnessId,scope:interval.scope},
  scope:'Original reducer field creation to the captured selected committed text, under the finite reviewed source/effect and acquired code/DOM interval. Instrumented-page observations, not native invocation attestation.',
  limits:['Describes the captured inspection, not subsequent renders; re-inspect for a new revision.','No keystroke, HTTP/query or arbitrary application/field ownership claim.','Unknown code, source drift, missing references, changed selected text and unsupported native histories deny current authority.']};
}

// Local helper routing is bound to the same workspace/source tree and native
// extension as issuance. Request JSON never supplies the capability itself.
export async function verifyListFieldRoute(capability,{root,sourceRoot,origin,extensionId,...observations}={}){
 const c=contexts.get(capability);
 if(!c)return unknown('No owned list code context');
 if(typeof root!=='string'||typeof sourceRoot!=='string'||path.resolve(root)!==listFieldCompilationWorkspace(c.compilation)||sourceRoot!==c.compilation.manifest.program.appRoot||origin!=='http://127.0.0.1:4173'||extensionId!==c.native.extensionId)return unknown('List context does not belong to this helper workspace, source mapping or extension');
 return verifyListFieldSelection(capability,observations);
}
