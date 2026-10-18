// SPDX-License-Identifier: Apache-2.0
import type {AtomPlatform} from './platform';
import type {AtomMessage} from './transport';
export interface AtomRuntime {readonly ready:Promise<void>;request(message:AtomMessage,options?:{signal?:AbortSignal}):Promise<unknown>;cancel(session:string,id:string):void;shutdown():Promise<void>}
export declare function createAtomRuntime(platform:AtomPlatform,options?:Record<string,never>):AtomRuntime;
