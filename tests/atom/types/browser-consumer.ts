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
