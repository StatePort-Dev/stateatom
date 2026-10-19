// SPDX-License-Identifier: Apache-2.0
import type {AtomClient} from './transport.js';
export interface AtomMount {readonly ready:Promise<void>;readonly element:HTMLElement;dispose():Promise<void>|void}
export interface MountOptions {maxWidth?:string;padding?:string;idPrefix?:string;readerURL?:string;requestOriginPermission?:(origin:string)=>Promise<boolean>}
export declare function mountAtom(rootElement:HTMLElement,client:AtomClient,options?:MountOptions):AtomMount;
