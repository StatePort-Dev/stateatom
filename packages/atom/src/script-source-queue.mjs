// SPDX-License-Identifier: Apache-2.0
// Background source acquisition must leave room for guardian control/cleanup RPCs.
// Queue metadata/work only, never cached source bodies or authorization grants.
export function createScriptSourceQueue(){
 const queued=[];let active=0;
 const cancelled=()=>Object.assign(Error('Script source read cancelled'),{code:'CANCELLED'});
 function pump(){
  while(active<4&&queued.length){
   const task=queued.shift();task.waiting=false;active++;
   void Promise.resolve().then(()=>{if(task.signal?.aborted)throw cancelled();task.assertCurrent?.();return task.work();}).then(task.resolve,task.reject).finally(()=>{task.cleanup();active--;pump();});
  }
 }
 return (work,{signal,assertCurrent}={})=>new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(cancelled());return;}
  if(queued.length>=256){reject(Object.assign(Error('Script source read queue budget reached'),{code:'SOURCE_READ_LIMIT'}));return;}
  const task={work,resolve,reject,signal,assertCurrent,waiting:true,cleanup:()=>signal?.removeEventListener('abort',abort)};
  const abort=()=>{if(!task.waiting)return;const index=queued.indexOf(task);if(index<0)return;queued.splice(index,1);task.waiting=false;task.cleanup();reject(cancelled());};
  signal?.addEventListener('abort',abort,{once:true});queued.push(task);pump();
 });
}
