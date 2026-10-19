// SPDX-License-Identifier: Apache-2.0
import type {AtomPlatform} from './platform.js';
import type {AtomMessage} from './transport.js';
export interface AtomRuntime {readonly ready:Promise<void>;request(message:AtomMessage,options?:{signal?:AbortSignal}):Promise<unknown>;cancel(session:string,id:string):void;connectInspector?(session:string):{close(reason?:string):Promise<unknown>};shutdown():Promise<void>}
export declare function createAtomRuntime(platform:AtomPlatform,options?:{readOnlySites?:boolean}):AtomRuntime;
