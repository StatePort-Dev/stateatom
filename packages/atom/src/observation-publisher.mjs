// SPDX-License-Identifier: Apache-2.0
// Coalesce publication, never observation. The caller updates its bounded
// ledger synchronously; persist always reads CURRENT state, not a queued copy.
// Nominal internal first-save window, not a Live-edit cadence or hard deadline.
export const OBSERVATION_PUBLICATION_DELAY_MS=16;
export function createObservationPublisher({persist,notify,schedule=task=>setTimeout(task,OBSERVATION_PUBLICATION_DELAY_MS)}){
 let flight=null,dirty=false;
 return function publish(){
  dirty=true;if(flight)return flight;
  let resolve,reject;const result=new Promise((a,b)=>{resolve=a;reject=b;});flight=result;
  // Native event callers are fire-and-forget. Handle rejection once per new
  // flight, while keeping the original rejected Promise available to awaiters.
  void result.catch(()=>{});
  const run=async()=>{
   try{
    while(dirty){
     dirty=false;
     try{await persist();}catch(error){if(dirty)continue;throw error;}
     if(!dirty)notify();
    }
    // Clear before resolving: a request at settlement must start a new flight.
    flight=null;resolve();
   }catch(error){flight=null;reject(error);}
  };
  // Defer only the first save. Collection already updated current bounded state.
  // A single queued task also combines requests when storage acknowledges fast.
  try{schedule(()=>{void run();});}catch(error){flight=null;reject(error);}
  return result;
 };
}
