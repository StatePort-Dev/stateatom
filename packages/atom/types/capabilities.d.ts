// SPDX-License-Identifier: Apache-2.0
import type {Capability} from './platform.js';
import type {AtomOperation} from './transport.js';
export type FeatureId='basic.inspect'|'basic.pick'|'basic.pick-refine'|'basic.attach-read-only'|'basic.request-site-access'|'source.navigate'|'actions.source'|'inputs.observed'|'experiment.response'|'experiment.controlled'|'experiment.restore'|'production.maps'|'actions.trace'|'inputs.live'|'inputs.draft-apply'|'production.changes'|'explanations.local-model';
export interface Admission {available:boolean;reason:string|null;code:string|null;requiredGrants:Capability[]}
export interface CapabilityContext {url?:string|null;siteApproved?:boolean;readOnlySites?:boolean;permission?:boolean;grants?:readonly Capability[];lease?:'none'|'owned'|'foreign'|'expired'|'unknown';disposed?:boolean;attached?:boolean;readOnly?:boolean;requestReadOnly?:boolean;sourceConnected?:boolean;hasSelection?:boolean;hasHistoricalTarget?:boolean;hasAnalysis?:boolean;hasResponseFields?:boolean;hasInputEditor?:boolean;inputEditorBusy?:boolean;workerIndependent?:boolean;property?:'text'|'disabled';stale?:boolean;busy?:boolean;hasSourceActions?:boolean;hasObservedInputs?:boolean;instrumented?:boolean}
export interface CapabilityDescription {schemaVersion:1;wireVersion:1;featureIds:FeatureId[];operations:Record<AtomOperation['op'],Admission>;features:Record<FeatureId,Admission>}
export declare const CAPABILITY_VERSION:1;
export declare const FEATURE_IDS:readonly FeatureId[];
export declare function operationPolicy(operation:AtomOperation['op'],context?:CapabilityContext):Admission;
export declare function describeCapabilities(context?:CapabilityContext):CapabilityDescription;
