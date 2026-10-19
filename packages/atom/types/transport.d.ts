// SPDX-License-Identifier: Apache-2.0
import type {CapabilityDescription} from './capabilities.js';
export {describeCapabilities,operationPolicy,CAPABILITY_VERSION,FEATURE_IDS} from './capabilities.js';
export type {CapabilityDescription,CapabilityContext,Admission,FeatureId} from './capabilities.js';
export type SourceLocation={file:string;line:number;column?:number;endLine?:number;endColumn?:number;sourceDigest?:string};
export declare function isInspectionOrigin(url:string,readOnlySites?:boolean):boolean;
export type AtomOperation=
 |{op:'connect-site';tabId:number;connection:import('./platform.js').SiteConnection}
 |{op:'forget-site';tabId:number}
 |{op:'tabs'|'unpair'|'list-diagnostics'}
 |{op:'capabilities';tabId:number;capabilityVersion?:1}
 |{op:'pair';url:string;token:string;origin:string;sourceRoot:string}
 |{op:'delete-diagnostic';id:string}
 |{op:'attach';tabId:number;readOnly?:boolean}
 |{op:'source-map-import';tabId:number;scriptId:string;name:string;data:string}
 |{op:'source-map-acquire';tabId:number;scriptId:string;url?:string}
 |{op:'source-map-lookup';tabId:number;scriptId:string;line:number;column:number}
 |{op:'source-map-clear';tabId:number}
 |{op:'detach'|'pick'|'restore'|'metrics';tabId:number}
 |{op:'state';tabId:number;refreshDeep?:boolean}
 |{op:'inspect-selector';tabId:number;selector:string}
 |{op:'selected';tabId:number;selector:string;token:string;documentId?:string}
 |{op:'property';tabId:number;property:'text'|'disabled'}
 |{op:'save-diagnostic';tabId:number;includeContent?:boolean;notes?:string}
 |{op:'open'|'definitions'|'references';tabId:number;source:SourceLocation}
 |{op:'deep-experiment';tabId:number;variants:Array<{name:string;rules:Array<{url:string;patches:Array<{path:string;value:unknown}>}>}>}
 |{op:'experiment';tabId:number;field:{url:string;path:string;requestId:string};value:unknown;actions:string[];controlPath:string};
export interface AtomMessage {version:1;id:string;session:string;payload:AtomOperation}
export interface AtomReply {version:1;id:string;session:string;ok:boolean;result?:unknown;error?:string;code?:string}
export interface AtomEvent {event:'selection'|'state-invalidated';tabId:number}
export interface AtomClient {request(payload:Extract<AtomOperation,{op:'capabilities'}>,options?:{signal?:AbortSignal}):Promise<CapabilityDescription>;request(payload:AtomOperation,options?:{signal?:AbortSignal}):Promise<unknown>;subscribe(fn:(event:AtomEvent)=>void):()=>void;dispose():void}
export interface AtomTransport {request(message:AtomMessage,options:{signal:AbortSignal}):Promise<AtomReply>;subscribe(fn:(event:AtomEvent)=>void):()=>void}
export declare const API_VERSION:1;
export declare function validateRequest(message:unknown):AtomMessage;
export declare function createAtomClient(transport:AtomTransport):AtomClient;
export declare function supportsCapabilityPolicy(value:unknown):value is CapabilityDescription;
export declare function chromeTransport(api:import('./platform.js').ChromeAPI):AtomTransport;
export declare function createAtomDispatcher(runtime:import('./runtime.js').AtomRuntime,policy:{isTrusted(sender:Record<string,any>):boolean;isSelectionSender(sender:Record<string,any>):boolean}):(message:any,sender:any,reply:(value:unknown)=>void)=>boolean;
