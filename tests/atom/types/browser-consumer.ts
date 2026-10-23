import {mountAtom} from '@stateport/atom/ui';
import {createAtomRuntime} from '@stateport/atom/runtime';
import {createChromePlatform,createEventHub,createDebuggerBroker,type ChromeAPI} from '@stateport/atom/platform';
import {createAtomClient,chromeTransport,type CapabilityDescription} from '@stateport/atom/transport';
declare const api:ChromeAPI;
const platform=createChromePlatform(api,{events:createEventHub(),broker:createDebuggerBroker(api.debugger)});
const runtime=createAtomRuntime(platform);
const client=createAtomClient(chromeTransport(api));
const view=mountAtom(document.body,client,{sourceAnalysisWorkerURL:'chrome-extension://owned/source-analysis-worker.js',requestOriginPermission:async origin=>origin.startsWith('https://')});
const policy:Promise<CapabilityDescription>=client.request({op:'capabilities',tabId:1});
client.request({op:'source-map-lookup',tabId:1,scriptId:'1',line:1,column:0});
// @ts-expect-error A map lookup requires a generated column.
client.request({op:'source-map-lookup',tabId:1,scriptId:'1',line:1});
view.dispose();client.dispose();void runtime.shutdown();void policy;

// Optional host owner and explicit source family are consumed from the archive.
import {createNativeControlOwner,type NativeControlOwner} from '@stateport/atom/platform';
const nativeOwner:NativeControlOwner=createNativeControlOwner(api,{startupTimeout:5000,closeTimeout:5000,maxSessions:16});
const nativePlatform=createChromePlatform(api,{events:createEventHub(),broker:createDebuggerBroker(api.debugger),controlOwner:nativeOwner});
const nativeAvailable:boolean|undefined=nativePlatform.nativeControlsAvailable;
client.request({op:'inputs-open',tabId:1,sourceKind:'dom-control'});
client.request({op:'capabilities',tabId:1,sourceKind:'json-response'});
// @ts-expect-error source families are a bounded enum, not an evaluator selector.
client.request({op:'inputs-open',tabId:1,sourceKind:'javascript'});
// @ts-expect-error plan application cannot switch the active source family.
client.request({op:'inputs-apply',tabId:1,sourceKind:'dom-control'});
void nativeAvailable;

client.request({op:'production-begin',tabId:1,ownerId:'settings-view'});
client.request({op:'production-advance',tabId:1,ownerId:'settings-view',ticket:'opaque-ticket'});
client.request({op:'production-close',tabId:1,ownerId:'settings-view'});
// @ts-expect-error Browser requests cannot invent a target grant.
client.request({op:'production-confirm',tabId:1,ownerId:'settings-view',ticket:'t',grant:{active:true}});

import {createInspectorConnections} from '@stateport/atom/transport';
const inspectorConnections=createInspectorConnections(runtime,{isTrusted:sender=>sender.id==='host',maxClients:16});
const liveTransport=chromeTransport(api,{inspectorOwnership:true,startupTimeout:5000});
const liveClient=createAtomClient(liveTransport);
liveClient.request({op:'inputs-open',tabId:1,ownerId:'view',sourceKind:'dom-control'});
liveClient.request({op:'capabilities',tabId:1,ownerId:'view'});
liveClient.subscribeConnection?.(status=>{const closed:'closed'=status.state;void closed;});
runtime.connectInspector?.('typed-live-session').close('Typed cleanup');
// @ts-expect-error owner identity cannot be supplied on an unrelated operation.
liveClient.request({op:'attach',tabId:1,ownerId:'wrong-scope'});
void inspectorConnections.dispose();

const fieldPreview=mountAtom(document.createElement('div'),client,{inputEditorPreview:true,onReconnect:async()=>{},idPrefix:'field-preview-'});
void fieldPreview.dispose();

const historicalList=await client.request({op:'list-handoffs'});
for(const entry of historicalList.entries){
 const trust:'historical-untrusted'=entry.trust;
 const file=await client.request({op:'open-handoff',id:entry.id});
 if(file){const raw:string=file.raw;const saved=await client.request({op:'save-handoff',raw});const status:'saved'|'unchanged'=saved.status;void status;}
 void trust;
}
// @ts-expect-error Local reports cannot choose a live app target or grant.
client.request({op:'save-handoff',raw:'{}',tabId:1,grant:'inject'});
// @ts-expect-error Removal needs the reopened exact digest.
client.request({op:'delete-handoff',id:'uuid'});

const capturedInputs=await client.request({op:'inputs-capture',tabId:1,ownerId:'review-view',investigationId:'i',expectedRevision:0,includeCategories:['inputValues']});
const captureSchema:'stateatom.input-outcome-capture/1'=capturedInputs.schema;
const captureNotExecutable:false=capturedInputs.executable;
const captureDiagnostic:string=capturedInputs.diagnosticRaw;
void [captureSchema,captureNotExecutable,captureDiagnostic];
// @ts-expect-error Capture requires a local view owner.
client.request({op:'inputs-capture',tabId:1});
// @ts-expect-error Investigation and revision must be supplied together.
client.request({op:'inputs-capture',tabId:1,ownerId:'view',investigationId:'i'});
// @ts-expect-error Capture cannot accept injected editor state.
client.request({op:'inputs-capture',tabId:1,ownerId:'view',snapshot:{}});
// @ts-expect-error Only explicit outcome review categories exist.
client.request({op:'inputs-capture',tabId:1,ownerId:'view',includeCategories:['grants']});

client.request({op:'source-map-anchor',tabId:1,bindingId:'native:0',snapshotId:'snapshot',contextKey:'context'});
// @ts-expect-error native source coordinates are runtime-owned
client.request({op:'source-map-anchor',tabId:1,bindingId:'native:0',snapshotId:'snapshot',contextKey:'context',line:1});

client.request({op:'source-map-anchor',tabId:1,bindingId:'react-host:0',snapshotId:'host-read',contextKey:'context'});
// @ts-expect-error a current stored snapshot is required for host source reads
client.request({op:'source-map-anchor',tabId:1,bindingId:'react-host:0',contextKey:'context'});

client.request({op:'source-map-anchor',tabId:1,bindingId:'native:0',snapshotId:'read',contextKey:'context',includeAnalysisInput:true});
// @ts-expect-error parser input opt-in must be a boolean
client.request({op:'source-map-anchor',tabId:1,bindingId:'native:0',snapshotId:'read',contextKey:'context',includeAnalysisInput:'true'});

// Explicit private bounded observation operations; no arbitrary evaluator/filter.
liveClient.request({op:'observation-start',tabId:1,ownerId:'report-view'});
liveClient.request({op:'observation-stop',tabId:1,ownerId:'report-view',windowId:'opaque-window'});
liveClient.request({op:'state',tabId:1,ownerId:'report-view'});
// @ts-expect-error Private observation requires a view owner.
liveClient.request({op:'observation-start',tabId:1});
// @ts-expect-error Raw bodies cannot be requested for an observation window.
liveClient.request({op:'observation-start',tabId:1,ownerId:'report-view',includeBody:true});
// @ts-expect-error Start cannot accept a restored window identity.
liveClient.request({op:'observation-start',tabId:1,ownerId:'report-view',windowId:'old'});

liveClient.request({op:'observation-checkpoint',tabId:1,ownerId:'report-view',windowId:'opaque-window'});
const observationCapture=await liveClient.request({op:'observation-capture',tabId:1,ownerId:'report-view',windowId:'opaque-window',inputOwnerId:'input-view'});
const privateObservation:false=observationCapture.exportable;
const originalInputCapture:'stateatom.input-outcome-capture/1'=observationCapture.inputCapture.schema;
// @ts-expect-error Expected input revision cannot appear without its investigation.
liveClient.request({op:'observation-capture',tabId:1,ownerId:'view',windowId:'w',expectedRevision:1});
// @ts-expect-error A checkpoint never accepts a caller-observed value.
liveClient.request({op:'observation-checkpoint',tabId:1,ownerId:'view',windowId:'w',value:false});
void privateObservation;void originalInputCapture;

// Independent observer metadata selection does not replace other view policy.
void client.request({op: 'state', tabId: 1, observationOwnerId: 'observer-view', refreshDeep: false});

client.subscribe(event => { const windowId: string | undefined = event.windowId; const scope: 'production-observation' | 'input-history' | undefined = event.scope; void windowId; void scope; });

client.request({op:'observation-stop',tabId:1,ownerId:'view',windowId:'12345678-1234-1234-1234-123456789abc',reason:'tab-switch'});
// @ts-expect-error Only view-context reasons are accepted on this command.
client.request({op:'observation-stop',tabId:1,ownerId:'view',windowId:'12345678-1234-1234-1234-123456789abc',reason:'permission-lost'});
// @ts-expect-error Reads cannot supply a stopping reason.
client.request({op:'observation-read',tabId:1,ownerId:'view',windowId:'12345678-1234-1234-1234-123456789abc',reason:'tab-switch'});
