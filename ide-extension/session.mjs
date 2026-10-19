// SPDX-License-Identifier: Apache-2.0
import {randomBytes} from 'node:crypto';
import {stat} from 'node:fs/promises';
import {startBridge,safePath} from '../core/bridge.mjs';
import {parseConnectionReceipt} from '../core/project-connection.mjs';
export function createHelperSession(){
 let bridge=null,connection=null,allowed=()=>false,generation=0;const pending=new Set();
 const close=async candidate=>{if(candidate)await candidate.close().catch(()=>{});};
 return {get connection(){return connection;},
  start({root,port=47731,isAllowed=()=>false,...callbacks}){
   if(!isAllowed())return Promise.reject(Error('Trust and select a local workspace first'));
   if(!Number.isInteger(port)||port<1||port>65535||port===80)return Promise.reject(Error('Choose a nondefault HTTP helper port 1–65535 in stateatom.helperPort'));
   if(connection&&connection.root===root&&connection.url==='http://127.0.0.1:'+port)return Promise.resolve(connection);
   const ticket=++generation,earlier=[...pending],previous=bridge;bridge=null;connection=null;allowed=()=>false;
   const current=()=>ticket===generation&&isAllowed();
   const task=(async()=>{
    // Superseded starts finish cancelling before another candidate binds the port.
    await Promise.allSettled(earlier);await close(previous);if(!current())throw Error('Helper startup cancelled; reconnect the selected workspace');
    const canonical=await safePath(root,'.');if(!current())throw Error('Helper startup cancelled; workspace trust or selection changed');
    const token=randomBytes(32).toString('hex'),candidate=startBridge({root:canonical,port,token,isAllowed:current,...callbacks});
    try{await candidate.ready;if(!current())throw Error('Helper startup cancelled; workspace trust or selection changed');}
    catch(e){await close(candidate);throw Error(e.code==='EADDRINUSE'?'Helper port occupied. Change stateatom.helperPort and retry connection.':e.message);}
    bridge=candidate;allowed=current;connection={url:'http://127.0.0.1:'+port,token,root:canonical,helper:candidate.helper,workspace:candidate.workspace};return connection;
   })();pending.add(task);void task.finally(()=>pending.delete(task)).catch(()=>{});return task;
  },
  async receipt({origin,sourceRoot='.'}){
   const active=connection,ticket=generation;if(!active||!allowed())throw Error('Trust and connect the selected workspace first');
   const folder=await safePath(active.root,sourceRoot);if(!(await stat(folder)).isDirectory())throw Error('Choose a source folder inside the selected workspace');
   if(connection!==active||generation!==ticket||!allowed())throw Error('Workspace connection changed; copy a fresh receipt');
   return parseConnectionReceipt({schemaVersion:1,helper:active.helper,workspace:active.workspace,url:active.url,token:active.token,origin,sourceRoot});
  },
  async stop(){generation++;const previous=bridge;bridge=null;connection=null;allowed=()=>false;await close(previous);await Promise.allSettled([...pending]);}
 };
}
