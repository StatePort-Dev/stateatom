// SPDX-License-Identifier: Apache-2.0
// Reuse only the existing complete code-history predicate and native provisioning
// witness, never the React18/Query source/effect or occurrence proof.
import {checkFirstReadCode} from '../first-read/verify.mjs';
import {isOwnedControlledBrowserWitness,controlledBrowserView} from '../first-read/controlled-session.mjs';
import {listFieldEffectsView,validateListFieldEffects} from './list-field-effects.mjs';
import {validateOwnedListFieldCompilation} from './list-field-compilation.mjs';
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
