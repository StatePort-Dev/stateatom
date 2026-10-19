import {mountAtom} from '@stateport/atom/ui';
import {createAtomRuntime} from '@stateport/atom/runtime';
import {createChromePlatform,createEventHub,createDebuggerBroker,type ChromeAPI} from '@stateport/atom/platform';
import {createAtomClient,chromeTransport,type CapabilityDescription} from '@stateport/atom/transport';
declare const api:ChromeAPI;
const platform=createChromePlatform(api,{events:createEventHub(),broker:createDebuggerBroker(api.debugger)});
const runtime=createAtomRuntime(platform);
const client=createAtomClient(chromeTransport(api));
const view=mountAtom(document.body,client,{requestOriginPermission:async origin=>origin.startsWith('https://')});
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
