// SPDX-License-Identifier: Apache-2.0
// Background source acquisition must leave room for guardian control/cleanup RPCs.
// Queue metadata/work only, never cached source bodies or authorization grants.
export function createScriptSourceQueue(){
 const queued=[];let active=0;
 function pump(){
  while(active<4&&queued.length){
   const task=queued.shift();active++;
   void Promise.resolve().then(task.work).then(task.resolve,task.reject).finally(()=>{active--;pump();});
  }
 }
 return work=>new Promise((resolve,reject)=>{
  if(queued.length>=256){reject(Object.assign(Error('Script source read queue budget reached'),{code:'SOURCE_READ_LIMIT'}));return;}
  queued.push({work,resolve,reject});pump();
 });
}
