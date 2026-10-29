// SPDX-License-Identifier: Apache-2.0
import {readFile} from 'node:fs/promises';import {tmpdir} from 'node:os';import {pathToFileURL} from 'node:url';import path from 'node:path';
import {materializeListToolchain} from './list-toolchain.mjs';
export function stateatomSelectedList(options={}){
 let workspace,tools,session=null,closing;
 const close=()=>closing??=(async()=>{try{await session?.close();}finally{await tools?.close();}})();
 return{name:'stateatom-selected-list',apply:'serve',get selectedListSession(){return session;},
  configResolved(config){workspace=path.resolve(config.root);},
  async configureServer(server){
   if(options.enabled!==true)return;
   if(!options.source||typeof options.source!=='object'||!Array.isArray(options.source.sources))throw Error('Selected-list source configuration required');
   if(typeof options.browserExecutable!=='string'||!path.isAbsolute(options.browserExecutable))throw Error('Selected-list requires an absolute Chrome executable path');
   if(session||tools||closing)throw Error('Selected-list plugin already started or closed');
   try{
    tools=await materializeListToolchain(await readFile(new URL('./runtime.json.gz',import.meta.url)),tmpdir());
    const {launchSelectedList}=await import(pathToFileURL(tools.root+'/src/engine/list-launch.mjs'));
    session=await launchSelectedList({workspace,toolRoot:tools.root,source:options.source,browserExecutable:options.browserExecutable,officialExtension:options.officialExtension});
    server.httpServer?.once('close',()=>void close().catch(error=>server.config?.logger?.error(error.message)));
    server.config?.logger?.info('StateAtom selected-list: connect the installed IDE helper to http://127.0.0.1:4173, authorize and attach the setup tab. Wait for “ready-to-open”, then open its application link. The session expires after 15 minutes.');
    let announced=false;const timer=setInterval(()=>{if(session.phase==='ready-to-open'&&!announced){announced=true;server.config?.logger?.info('StateAtom selected-list: ready-to-open.');}if(['closed','verifying','unavailable'].includes(session.phase))clearInterval(timer);},100);timer.unref?.();
    session.ready.catch(error=>server.config?.logger?.error('StateAtom selected-list: '+error.message));
   }catch(error){await close();throw error;}
  },closeBundle:close};
}
