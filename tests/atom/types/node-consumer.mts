import {createAtomRuntime,type AtomRuntime} from '@stateport/atom/runtime';
import {mountAtom,type AtomMount} from '@stateport/atom/ui';
import {createChromePlatform,createDebuggerBroker,createEventHub,namespacedStorage,migrateStandaloneDiagnostics,capabilities,atomError,type ChromeAPI} from '@stateport/atom/platform';
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
