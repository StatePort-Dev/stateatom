// SPDX-License-Identifier: Apache-2.0
// Coalesce publication, never observation. The caller updates its bounded
// ledger synchronously; persist always reads CURRENT state, not a queued copy.
export function createObservationPublisher({persist,notify}){
 let flight=null,dirty=false;
 return function publish(){
  dirty=true;if(flight)return flight;
  let resolve,reject;const result=new Promise((a,b)=>{resolve=a;reject=b;});flight=result;
  void (async()=>{
   try{
    while(dirty){
     dirty=false;
     try{await persist();}catch(error){if(dirty)continue;throw error;}
     if(!dirty)notify();
    }
    // Clear before resolving: a request at settlement must start a new flight.
    flight=null;resolve();
   }catch(error){flight=null;reject(error);}
  })();
  return result;
 };
}
