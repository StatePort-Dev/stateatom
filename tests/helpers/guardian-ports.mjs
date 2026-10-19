// SPDX-License-Identifier: Apache-2.0
export function event(){const listeners=new Set();return{addListener:fn=>listeners.add(fn),removeListener:fn=>listeners.delete(fn),clear:()=>listeners.clear(),emit:(...args)=>{for(const f of [...listeners])f(...args);}};}
export function portPair(sender={}){
 const a={name:'stateatom.guardian/1',onMessage:event(),onDisconnect:event(),closed:false},b={...a,onMessage:event(),onDisconnect:event(),sender};
 for(const [self,peer]of [[a,b],[b,a]]){self.postMessage=m=>{if(self.closed)throw Error('Port closed');const data=JSON.parse(JSON.stringify(m));queueMicrotask(()=>{if(!peer.closed)peer.onMessage.emit(data,peer);});};self.disconnect=()=>{if(self.closed)return;self.closed=true;peer.closed=true;queueMicrotask(()=>peer.onDisconnect.emit(peer));};}
 return {a,b};
}
export const tick=()=>new Promise(r=>setTimeout(r,0));
