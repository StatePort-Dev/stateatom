// SPDX-License-Identifier: Apache-2.0
export type Capability='read'|'inject'|'reload'|'cache'|'override'|'replay';
export interface StorageArea {get(keys:string[]):Promise<Record<string,any>>;set(value:Record<string,unknown>):Promise<void>}
export interface ChromeAPI {runtime:{id:string;sendMessage(message:unknown):Promise<any>;onMessage:{addListener(fn:Function):void;removeListener(fn:Function):void}};storage:{session:StorageArea;local:StorageArea};debugger:{attach(target:{tabId:number},version:string):Promise<void>;detach(target:{tabId:number}):Promise<void>;sendCommand(target:{tabId:number},method:string,params?:Record<string,unknown>):Promise<any>;getTargets():Promise<any[]>};scripting:{executeScript(operation:any):Promise<any[]>};tabs:{get(id:number):Promise<any>;query(query:object):Promise<any[]>;reload(id:number,options:object):Promise<void>;sendMessage(id:number,message:object):Promise<any>;onUpdated:{addListener(fn:Function):void;removeListener(fn:Function):void}}}
export interface HostEvent {type:'debugger'|'detach'|'removed';source?:{tabId:number};method?:string;params?:any;reason?:string;tabId?:number}
export interface EventHub {subscribe(fn:(event:HostEvent)=>void):()=>void;emit(event:HostEvent):void}
export interface DebuggerLease {tabId:number;documentId:string|null;assert(capability?:Capability):void;attach():Promise<void>;command(method:string,params?:Record<string,unknown>):Promise<any>;release():Promise<void>;invalidate():void}
export interface DebuggerBroker {acquire(options:{tabId:number;documentId?:string|null;owner:string;capabilities:Capability[]}):Promise<DebuggerLease>;invalidate(tabId:number):void}
export interface AtomPlatform {chrome:Omit<ChromeAPI,'runtime'> & {runtime:Pick<ChromeAPI['runtime'],'id'|'sendMessage'>};fetch:typeof fetch;events:EventHub;ready?:Promise<void>;owns(tabId:number):boolean;authorize(tabId:number,capability:Capability):Promise<void>;shutdown():Promise<void>;detached(tabId:number):void}
export declare const capabilities:readonly Capability[];
export declare function atomError(code:string,message?:string):Error & {code:string};
export declare function createDebuggerBroker(api:ChromeAPI['debugger']):DebuggerBroker;
export declare function createEventHub():EventHub;
export declare function namespacedStorage(area:StorageArea,namespace?:string):{get(keys:string|string[]):Promise<Record<string,any>>;set(value:Record<string,unknown>):Promise<void>};
export declare function createChromePlatform(api:ChromeAPI,options:{events:EventHub;broker:DebuggerBroker;capabilities?:Capability[];namespace?:string}):AtomPlatform;
export declare function migrateStandaloneDiagnostics(area:StorageArea):Promise<void>;
