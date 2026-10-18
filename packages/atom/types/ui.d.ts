// SPDX-License-Identifier: Apache-2.0
import type {AtomClient} from './transport';
export interface AtomMount {readonly ready:Promise<void>;readonly element:HTMLElement;dispose():void}
export interface MountOptions {maxWidth?:string;padding?:string;idPrefix?:string;readerURL?:string}
export declare function mountAtom(rootElement:HTMLElement,client:AtomClient,options?:MountOptions):AtomMount;
