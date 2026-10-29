// SPDX-License-Identifier: Apache-2.0
// Owned installed development session. Browser admission and IDE pairing remain
// explicit user actions; no application expression is evaluated by this launcher.
import path from 'node:path';
import {buildListFieldCompilation} from './list-field-compilation.mjs';
import {startListFieldServer} from './list-field-server.mjs';
import {createListFieldCodeContext,listFieldCodeContextView} from './list-field-code.mjs';
import {launchControlledFirstReadBrowser} from '../first-read/controlled-session.mjs';
import {startListFieldChannel} from '../../core/list-field-channel.mjs';
export async function launchSelectedList({workspace,toolRoot,source,browserExecutable,headed=true}={}){
 let sourceServer,browser,channel,closed=false,closing,expiry;
 const close=()=>closing??=(async()=>{closed=true;clearTimeout(expiry);const failures=[];for(const resource of[channel,browser,sourceServer])if(resource)try{await resource.close();}catch(error){failures.push(error);}if(failures.length)throw new AggregateError(failures,'Selected-list cleanup failed');})();
 try{
  const compilation=await buildListFieldCompilation({...source,projectRoot:workspace,toolRoot});
  sourceServer=await startListFieldServer({compilation});
  browser=await launchControlledFirstReadBrowser({projectRoot:workspace,extensionRoot:toolRoot,browserExecutable,headed,appProfile:'selected-list'});
  let phase='waiting-for-attach';
  const ready=(async()=>{
   while(!closed){const targets=await browser.browser.worker.evaluate(async()=>chrome.debugger.getTargets()),target=targets.find(t=>t.id===browser.targetId);if(target?.attached===true)break;await new Promise(r=>setTimeout(r,100));}
   if(closed)throw Error('Selected-list session closed');
   const app=await browser.arm();phase='ready-to-open';
   while(!closed){
    const context=await createListFieldCodeContext({compilation,effects:sourceServer.effects,witness:browser.witness});
    if(listFieldCodeContextView(context).status==='Owned list code context'){
     if(closed)throw Error('Selected-list session closed');
     channel=await startListFieldChannel({root:path.resolve(workspace),context});
     if(closed){await channel.close();throw Error('Selected-list session closed');}
     phase='verifying';return{context,app};
    }
    await new Promise(r=>setTimeout(r,100));
   }
   throw Error('Selected-list session closed');
  })();
  // A session owns one closed source revision. HMR/rebuild requires restart;
  // the existing verifier rejects source, code, DOM and native-history drift.
  ready.catch(()=>{phase='unavailable';void close().catch(()=>{});});
  expiry=setTimeout(()=>void close().catch(()=>{}),15*60*1000);expiry.unref?.();
  return{compilation,browser,ready,get phase(){return closed?'closed':phase;},close};
 }catch(error){await close().catch(()=>{});throw error;}
}
