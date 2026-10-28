// SPDX-License-Identifier: Apache-2.0
// Admission describes resources, never the truth of a source/execution claim.
import {appOrigin,loopbackOrigin,helperURL} from './origin-policy.mjs';
export const CAPABILITY_VERSION=1;
export const DEBUGGER_CAPABILITIES=Object.freeze(['read','inject','reload','cache','override','replay']);
export const GLOBAL_OPERATIONS=Object.freeze(['pair','unpair','tabs','list-diagnostics','delete-diagnostic','save-handoff','list-handoffs','open-handoff','delete-handoff']);
export const OPERATIONS=Object.freeze([...GLOBAL_OPERATIONS,'capabilities','save-diagnostic','attach','pick','cancel-pick','refine-pick','selected','deep-experiment','restore','property','inspect-selector','state','open','definitions','references','experiment','detach','metrics','source-map-import','source-map-acquire','source-map-lookup','source-map-anchor','source-map-clear','connect-site','forget-site','inputs-capture','inputs-open','inputs-read','inputs-apply','inputs-undo','inputs-baseline','inputs-close','production-begin','production-advance','production-confirm','production-cancel','production-close','production-revoke','actions-arm','actions-read','actions-cancel','actions-clear','observation-start','observation-read','observation-stop','observation-clear','observation-checkpoint','observation-capture']);
export const FEATURE_IDS=Object.freeze(['basic.inspect','basic.pick','basic.pick-refine','basic.attach-read-only','basic.request-site-access','source.navigate','actions.source','inputs.observed','experiment.response','experiment.controlled','experiment.restore','production.maps','actions.trace','inputs.live','inputs.draft-apply','production.changes','production.observations','explanations.local-model']);
export const isDevelopmentOrigin=loopbackOrigin;
export const isBridgeURL=helperURL;
export function isInspectionOrigin(url,readOnlySites=false){return !!appOrigin(url)&&(loopbackOrigin(url)||readOnlySites===true&&new URL(url).protocol==='https:');}
export function debuggerCommandCapability(method){
 if(['Overlay.enable','Overlay.disable','Overlay.hideHighlight','Overlay.setInspectMode','DOM.enable','DOM.describeNode','DOM.pushNodesByBackendIdsToFrontend','DOM.getDocument','DOM.querySelector','DOM.resolveNode','DOM.requestNode','DOMDebugger.getEventListeners','Runtime.releaseObjectGroup','Network.enable','Page.enable','Runtime.enable','Debugger.enable','Debugger.disable','Performance.enable','Page.getFrameTree','Runtime.getIsolateId','Debugger.getScriptSource','Network.getResponseBody','Performance.getMetrics','Fetch.getResponseBody'].includes(method))return 'read';
 if(['Network.setCacheDisabled','Network.clearBrowserCache','Storage.clearDataForOrigin'].includes(method))return 'cache';
 if(method.startsWith('Fetch.'))return 'override';
 if(method==='Runtime.getProperties')return 'read';
 if(method==='Runtime.callFunctionOn')return 'inject';
 return null;
}
const allow=requiredGrants=>({available:true,reason:null,code:null,requiredGrants});
const deny=(code,reason,requiredGrants=[])=>({available:false,reason,code,requiredGrants});
const inputMutation=new Set(['inputs-open','inputs-apply','inputs-undo','inputs-baseline']);
const mutation=new Set(['deep-experiment','restore','experiment']);
const source=new Set(['open','definitions','references']);
const productionStages=new Set(['production-begin','production-advance','production-confirm']);
const productionCleanup=new Set(['production-cancel','production-close','production-revoke']);
// Local metadata and cleanup remain readable when browser resources are denied.
const local=new Set([...GLOBAL_OPERATIONS,'capabilities','state','property','detach','cancel-pick','source-map-clear','connect-site','forget-site','inputs-close',...productionCleanup]);
export function operationPolicy(op,c={}){
 if(c.disposed)return deny('DISPOSED','Atom runtime is disposed');
 if(!OPERATIONS.includes(op))return deny('INVALID_MESSAGE','Unknown Atom operation');
 if(c.busy&&!['state','capabilities','metrics','inputs-close','observation-read','observation-stop','observation-clear',...productionCleanup].includes(op))return deny('BUSY','Experiment running; conflicting action denied');
 if(c.inputEditorBusy&&mutation.has(op))return deny('BUSY','Close the input editor before running legacy trials');
 if(op.startsWith('inputs-')&&c.foreignInputEditor)return deny('BUSY','This input editor belongs to another inspector');
 if(op.startsWith('actions-')){if(c.actionInspector!==true)return deny('INSPECTOR_DISCONNECTED','Use a live inspector');if(c.foreignActionTrace)return deny('BUSY','Observation belongs to another inspector');if(['actions-cancel','actions-clear'].includes(op))return allow([]);}
 if(op.startsWith('observation-')){if(c.observationInspector!==true)return deny('INSPECTOR_DISCONNECTED','Use a live inspector');if(c.foreignObservation)return deny('BUSY','Observation belongs to another inspector');if(!['observation-start','observation-checkpoint'].includes(op))return allow([]);}
 if(local.has(op))return allow([]);
 if(op==='inputs-capture')return c.captureInspector!==true?deny('INSPECTOR_DISCONNECTED','Use a live inspector'):c.captureForeignEditor?deny('BUSY','This input editor belongs to another inspector'):c.hasSelection||c.hasHistoricalTarget?allow([]):deny('OBSERVATION_REQUIRED','Observation unavailable or expired; inspect again');
 if(op==='save-diagnostic')return c.hasSelection||c.hasHistoricalTarget?allow([]):deny('OBSERVATION_REQUIRED','Observation unavailable or expired; inspect again');
 if(!isInspectionOrigin(c.url,c.readOnlySites)&&!(c.siteApproved===true&&appOrigin(c.url)&&new URL(c.url).protocol==='http:'))return deny('ORIGIN_DENIED','Unsupported inspection origin');
 const production=new URL(c.url).protocol==='https:',readOnly=production||c.readOnly===true;
 if(op.startsWith('actions-')){if(c.controlledProfile)return deny('CAPABILITY_UNAVAILABLE','Action observation is outside the controlled finite profile');if(production)return deny('CAPABILITY_UNAVAILABLE','Action observation currently requires opt-in development instrumentation');if(!c.sourceConnected)return deny('SOURCE_REQUIRED','Connect the matching development project');if(op==='actions-arm'&&(!c.hasSelection||!c.hasAnalysis||c.stale))return deny('OBSERVATION_REQUIRED','Inspect a current target first');if(c.inputEditorBusy)return deny('BUSY','Close input editing before observing an interaction');}
 if(c.permission!==true)return deny('ORIGIN_DENIED','Site origin permission required');
 if(op==='observation-start'&&(!c.hasSelection||!c.hasAnalysis||c.stale))return deny('OBSERVATION_REQUIRED','Inspect a current target first');
 if(productionStages.has(op)){if(!production||c.productionHost!==true)return deny('CAPABILITY_UNAVAILABLE','Production Settings authority is unavailable for this target');if(c.productionInspector!==true)return deny('INSPECTOR_DISCONNECTED','Use a live inspector Settings view');}
 if(inputMutation.has(op)&&production&&c.productionChange?.active===true&&c.productionInspector!==true)return deny('INSPECTOR_DISCONNECTED','Production inputs require a live inspector');
 if(mutation.has(op)&&readOnly||inputMutation.has(op)&&readOnly&&!(production&&c.productionChange?.active===true)||source.has(op)&&production)return deny('CAPABILITY_DENIED','Read-only inspection: operation unavailable');
 if(source.has(op))return c.sourceConnected?allow([]):deny('SOURCE_REQUIRED','Connect the open IDE source provider first');
 if(c.lease==='foreign')return deny('BUSY','Debugger resource busy');
 if(c.lease==='expired')return deny('LEASE_EXPIRED','Debugger lease expired; attach again');
 if(!['none','owned'].includes(c.lease))return deny('CAPABILITY_UNAVAILABLE','Host cannot describe current debugger ownership');
 let required=['read'];
 if(op==='attach'){
  const requestedReadOnly=readOnly||c.requestReadOnly===true;
  if(c.attached&&c.readOnly!==requestedReadOnly)return deny('MODE_CONFLICT','Detach before changing inspection mode');
  required=['read','inject'];
 }else if(['inspect-selector','selected'].includes(op))required=['read','inject'];
 else if(['pick','refine-pick'].includes(op)||op.startsWith('actions-'))required=['read','inject'];
 else if(inputMutation.has(op))required=c.inputSourceKind==='dom-control'?['read','inject','replay']:['read','override'];
 else if(productionStages.has(op))required=['read','inject'];
 else if(op==='inputs-read'&&c.inputSourceKind==='dom-control')required=['read','inject'];
 else if(mutation.has(op))required=['read','inject','reload','cache','override','replay'];
 for(const grant of required)if(!c.grants?.includes(grant))return deny('CAPABILITY_DENIED',grant+' capability required',required);
 if((mutation.has(op)||inputMutation.has(op)||productionStages.has(op)||op==='inputs-read'||op.startsWith('source-map-')||['metrics','pick','refine-pick','actions-arm','actions-read','observation-start','observation-checkpoint'].includes(op))&&!c.attached)return deny('LEASE_REQUIRED','Attach this tab first',required);
 if(inputMutation.has(op)){if(c.inputSourceKind==='dom-control'){if(c.nativeInputOwner!==true)return deny('UNSAFE_LIFECYCLE','Native input changes require a live private content owner',required);}else if(c.workerIndependent!==true)return deny('UNSAFE_LIFECYCLE','Response changes require a worker-independent debugger owner',required);}
 if(op==='inputs-open'&&!c.hasInputEditor&&(!c.hasSelection||!c.hasAnalysis||c.stale))return deny('OBSERVATION_REQUIRED','Inspect a current target before opening inputs',required);
 if(['inputs-apply','inputs-undo','inputs-baseline','inputs-read'].includes(op)&&!c.hasInputEditor)return deny('OBSERVATION_REQUIRED','Open the current target input editor first',required);
 if(['deep-experiment','experiment'].includes(op)&&(!c.hasSelection||!c.hasAnalysis||c.stale))return deny('OBSERVATION_REQUIRED','Current attached inspection required; inspect again',required);
 if(op==='source-map-anchor'&&(!c.hasSelection||!c.hasAnalysis||c.stale))return deny('OBSERVATION_REQUIRED','Current attached inspection required; inspect again',required);
 if(op.startsWith('source-map-')&&c.sourceParser===false)return deny('CAPABILITY_UNAVAILABLE','Source exploration is unavailable in this host',required);
 if(op==='restore'&&!c.hasSelection&&!c.hasHistoricalTarget)return deny('OBSERVATION_REQUIRED','Inspect a target before restoring an investigation baseline',required);
 if(op==='experiment'&&(c.property!=='text'||!c.hasResponseFields))return deny('UNSUPPORTED_INPUT','Select a supported observed text response field first',required);
 return allow(required);
}
export function describeCapabilities(context={}){
 const operations=Object.fromEntries(OPERATIONS.map(op=>[op,operationPolicy(op,context)]));
 const inspect=operations['inspect-selector'];
 const observed=(present,reason)=>!inspect.available?inspect:present&&!context.stale?allow([]):deny('OBSERVATION_UNAVAILABLE',reason);
 const unavailable=reason=>deny('NOT_IMPLEMENTED',reason);
 return {schemaVersion:CAPABILITY_VERSION,wireVersion:1,featureIds:[...FEATURE_IDS],operations,features:{
  'basic.inspect':inspect,'basic.pick':operations.pick,'basic.pick-refine':operations['refine-pick'],
  'basic.attach-read-only':operationPolicy('attach',{...context,requestReadOnly:true}),
  'basic.request-site-access':!context.disposed&&context.readOnlySites===true&&(isInspectionOrigin(context.url,true)||context.siteApproved===true)&&context.permission===false?allow([]):deny('PERMISSION_REQUEST_UNAVAILABLE','No opted-in HTTPS permission request is available for this target'),
  'source.navigate':operations.open,
  'actions.source':observed(context.hasSourceActions,'No supported current application handler source binding'),
  'inputs.observed':observed(context.hasObservedInputs,'No supported recorded operands for this selected expression'),
  'experiment.response':operations.experiment,'experiment.controlled':operations['deep-experiment'],'experiment.restore':operations.restore,
  'production.maps':operations['source-map-import'],
  'actions.trace':context.actionTraceReady?operations['actions-arm']:unavailable('Supported action observation is unavailable in this project (A05 in progress)'),
  'inputs.live':operations['inputs-open'],
  'inputs.draft-apply':operations['inputs-open'],
  'production.observations':operations['observation-start'],
  'production.changes':context.productionChange?.active?allow([]):operations['production-begin'],
  'explanations.local-model':deny('DEVICE_CHECK_REQUIRED','Local model availability requires an explicit extension-page device check; fallback is not model validation')
 }};
}
