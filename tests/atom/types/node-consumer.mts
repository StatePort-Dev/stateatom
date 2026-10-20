import {createAtomRuntime,type AtomRuntime} from '@stateport/atom/runtime';
import {mountAtom,type AtomMount} from '@stateport/atom/ui';
import {createChromePlatform,createDebuggerBroker,createGuardianBroker,createEventHub,namespacedStorage,migrateStandaloneDiagnostics,capabilities,atomError,type ChromeAPI} from '@stateport/atom/platform';
import {createAtomClient,chromeTransport,createAtomDispatcher,validateRequest,API_VERSION,CAPABILITY_VERSION,FEATURE_IDS,describeCapabilities,operationPolicy,supportsCapabilityPolicy,type AtomOperation,type CapabilityDescription} from '@stateport/atom/transport';
declare const chrome:ChromeAPI;
const events=createEventHub(),broker=createDebuggerBroker(chrome.debugger);
const platform=createChromePlatform(chrome,{events,broker,capabilities:[...capabilities],readOnlySites:true});
const runtime:AtomRuntime=createAtomRuntime(platform,{readOnlySites:true});
const client=createAtomClient(chromeTransport(chrome));
const mount:AtomMount=mountAtom(document.body,client,{readerURL:'reader.html'});
const response:Promise<CapabilityDescription>=client.request({op:'capabilities',tabId:1,capabilityVersion:1});
const describe:CapabilityDescription=describeCapabilities({url:'https://example.invalid/',permission:false,lease:'none',grants:['read']});
const admitted:boolean=operationPolicy('inspect-selector',{disposed:true}).available;
if(supportsCapabilityPolicy(describe))describe.features['basic.inspect'].available satisfies boolean;
const payload:AtomOperation={op:'attach',tabId:1,readOnly:true};
validateRequest({version:API_VERSION,id:'a',session:'s',payload});
createAtomDispatcher(runtime,{isTrusted:()=>true,isSelectionSender:()=>false});
namespacedStorage(chrome.storage.local).get('diagnostics');
migrateStandaloneDiagnostics(chrome.storage.local);
// @ts-expect-error Arbitrary evaluator requests are not public operations.
client.request({op:'eval',tabId:1});
// @ts-expect-error Wire v1 does not imply a future capability schema.
client.request({op:'capabilities',tabId:1,capabilityVersion:2});
void [response,mount,admitted,CAPABILITY_VERSION,FEATURE_IDS,atomError];
const connection:import('@stateport/atom/platform').SiteConnection={origin:'http://localhost:3000',mode:'development',actions:['cache','reload']};
client.request({op:'connect-site',tabId:1,connection});
client.request({op:'forget-site',tabId:1});
events.emit({type:'navigation',tabId:1,url:'http://localhost:3001/'});
events.emit({type:'permissions-removed'});
// @ts-expect-error Source paths cannot be smuggled into a site connection literal.
client.request({op:'connect-site',tabId:1,connection:{origin:'http://localhost:3000',mode:'development',actions:[],sourceRoot:'/private'}});
// @ts-expect-error Evaluation is not a permitted development action.
client.request({op:'connect-site',tabId:1,connection:{origin:'http://localhost:3000',mode:'development',actions:['eval']}});

client.request({op:'inputs-open',tabId:1});
client.request({op:'inputs-read',tabId:1,investigationId:'i'});
client.request({op:'inputs-undo',tabId:1,investigationId:'i',expectedRevision:1});
client.request({op:'inputs-baseline',tabId:1,investigationId:'i',expectedRevision:1});
client.request({op:'inputs-close',tabId:1,investigationId:'i'});
// @ts-expect-error Undo requires the current investigation and ledger revision.
client.request({op:'inputs-undo',tabId:1});
// @ts-expect-error A plan is versioned data, never a source expression or eval request.
client.request({op:'inputs-apply',tabId:1,plan:'window.value = 1'});

const guarded=createGuardianBroker(chrome,{documentPath:"atom-guardian.html"});
const resourceReady:Promise<void>=guarded.ready;
void resourceReady;

// Optional host owner and explicit source family are consumed from the archive.
import {createNativeControlOwner,type NativeControlOwner} from '@stateport/atom/platform';
const nativeOwner:NativeControlOwner=createNativeControlOwner(chrome,{startupTimeout:5000,closeTimeout:5000,maxSessions:16});
const nativePlatform=createChromePlatform(chrome,{events,broker,controlOwner:nativeOwner});
const nativeAvailable:boolean|undefined=nativePlatform.nativeControlsAvailable;
client.request({op:'inputs-open',tabId:1,sourceKind:'dom-control'});
client.request({op:'capabilities',tabId:1,sourceKind:'json-response'});
// @ts-expect-error source families are a bounded enum, not an evaluator selector.
client.request({op:'inputs-open',tabId:1,sourceKind:'javascript'});
// @ts-expect-error plan application cannot switch the active source family.
client.request({op:'inputs-apply',tabId:1,sourceKind:'dom-control'});
void nativeAvailable;

import {createInspectorConnections} from '@stateport/atom/transport';
const inspectorConnections=createInspectorConnections(runtime,{isTrusted:sender=>sender.id==='host',maxClients:16});
const liveTransport=chromeTransport(chrome,{inspectorOwnership:true,startupTimeout:5000});
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

liveClient.request({op:'production-begin',tabId:1,ownerId:'settings-view'});
liveClient.request({op:'production-confirm',tabId:1,ownerId:'settings-view',ticket:'opaque-ticket'});
liveClient.request({op:'production-revoke',tabId:1,ownerId:'settings-view'});
// @ts-expect-error A confirmation needs its current private ticket and view.
liveClient.request({op:'production-confirm',tabId:1,ownerId:'settings-view'});
// @ts-expect-error Wire requests cannot choose target, duration or capabilities.
liveClient.request({op:'production-begin',tabId:1,ownerId:'settings-view',duration:99999999});
if(platform.productionChanges){
 platform.productionChanges.transition('begin',1,{owner:{},viewId:'settings-view',assertCurrent(){}});
 // @ts-expect-error Host transitions require a live context assertion.
 platform.productionChanges.transition('confirm',1,{owner:{},viewId:'settings-view'});
}

const historicalList=await client.request({op:'list-handoffs'});
const historicalFile=await client.request({op:'open-handoff',id:'00000000-0000-0000-0000-000000000000'});
if(historicalFile){
 const original:string=historicalFile.raw;
 const saved=await client.request({op:'save-handoff',raw:original});
 const trust:'historical-untrusted'=saved.entry.trust;void trust;
 await client.request({op:'delete-handoff',id:saved.entry.id,expectedDigest:saved.entry.digest});
}
void historicalList.entries;
// @ts-expect-error Local reports cannot adopt an execution or source grant.
client.request({op:'save-handoff',raw:'{}',ownerId:'live-owner'});
