// SPDX-License-Identifier: Apache-2.0
import type {CapabilityDescription} from './capabilities.js';
export {describeCapabilities,operationPolicy,CAPABILITY_VERSION,FEATURE_IDS} from './capabilities.js';
export type {CapabilityDescription,CapabilityContext,Admission,FeatureId} from './capabilities.js';
export type SourceLocation={file:string;line:number;column?:number;endLine?:number;endColumn?:number;sourceDigest?:string};
export declare function isInspectionOrigin(url:string,readOnlySites?:boolean):boolean;
export type InputScalar=boolean|number|string;
export interface InputTarget {tabId:number;origin:string;run:string;document:string;node:string;selector:string;property:'text'|'disabled';value:string|boolean;observedAt:number;build:string|null}
export interface ResponseInputResource {id:string;kind:'json-response';revision:number|string;type:'boolean'|'number'|'string';value:InputScalar;writable:true;locator:{url:string;method:'GET';requestId:string;requestOrdinal:number;pointer:string}}
export interface ControlInputResource {id:string;kind:'dom-control';revision:number|string;type:'boolean'|'number'|'string';value:InputScalar;writable:true;locator:{document:string;node:string;selector:string;control:'text'|'textarea'|'number'|'checkbox'|'select';options?:string[]}}
/** Inert data. A plan grants no authority; each runtime adapter can refuse a kind. */
export interface ExperimentPlan {schema:'stateatom.experiment-plan/1';id:string;investigationId:string;mode:'live'|'draft';target:InputTarget;changes:Array<{resource:ResponseInputResource|ControlInputResource;value:InputScalar}>;requiredGrants:import('./platform.js').Capability[];refresh:'none';atomic:false;cleanup:'adapter-specific'}
export type AtomOperation=
 |{op:'connect-site';tabId:number;connection:import('./platform.js').SiteConnection}
 |{op:'forget-site';tabId:number}
 |{op:'tabs'|'unpair'|'list-diagnostics'}
 |{op:'capabilities';tabId:number;capabilityVersion?:1}
 |{op:'pair';url:string;token:string;origin:string;sourceRoot:string;receipt?:unknown}
 |{op:'delete-diagnostic';id:string}
 |{op:'inputs-open';tabId:number}
 |{op:'inputs-read';tabId:number;investigationId:string}
 |{op:'inputs-apply';tabId:number;plan:ExperimentPlan}
 |{op:'inputs-undo'|'inputs-baseline';tabId:number;investigationId:string;expectedRevision:number}
 |{op:'inputs-close';tabId:number;investigationId?:string}
 |{op:'attach';tabId:number;readOnly?:boolean}
 |{op:'source-map-import';tabId:number;scriptId:string;name:string;data:string}
 |{op:'source-map-acquire';tabId:number;scriptId:string;url?:string}
 |{op:'source-map-lookup';tabId:number;scriptId:string;line:number;column:number}
 |{op:'source-map-clear';tabId:number}
 |{op:'detach'|'restore'|'metrics';tabId:number}
 |{op:'pick'|'cancel-pick';tabId:number;pickerId?:string}
 |{op:'state';tabId:number;refreshDeep?:boolean}
 |{op:'inspect-selector';tabId:number;selector:string}
 |{op:'refine-pick';tabId:number;pickerId:string;index:number}
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
