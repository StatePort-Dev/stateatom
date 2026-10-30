// SPDX-License-Identifier: Apache-2.0
import {randomBytes,timingSafeEqual} from 'node:crypto';
import {appOrigin} from '../packages/atom/src/origin-policy.mjs';
const equal=(a,b)=>typeof a==='string'&&typeof b==='string'&&Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
export function createSourceApproval({approve,isAllowed,now=Date.now,timeoutMs=60000}){
 let pending=null,grant=null,closed=false;
 const allowed=()=>!closed&&isAllowed();
 return {
  async request({origin,extensionId,signal}){
   if(!allowed()||signal?.aborted)throw Error('Source connection cancelled');
   if(typeof approve!=='function')throw Error('Update the StateAtom IDE helper to connect directly');
   if(!/^[a-p]{32}$/.test(extensionId)||!appOrigin(origin,{exact:true})||new URL(origin).protocol!=='http:')throw Error('Source connection origin denied');
   if(pending)throw Error('Finish the source confirmation already open in your IDE');
   const controller=new AbortController(),own={controller};pending=own;
   const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
   let timer;
   const cancelled=new Promise((_,reject)=>{controller.signal.addEventListener('abort',()=>reject(Error('Source connection cancelled or expired')),{once:true});timer=setTimeout(abort,timeoutMs);timer.unref?.();});
   const decision=Promise.resolve().then(()=>approve({origin,extensionId,signal:controller.signal}));
   // Do not stack prompts if a cancelled native confirmation is still open.
   void decision.finally(()=>{if(pending===own)pending=null;}).catch(()=>{});
   try{
    const result=await Promise.race([decision,cancelled]);
    if(!allowed()||signal?.aborted||controller.signal.aborted)throw Error('Source connection cancelled');
    if(!result||typeof result.sourceRoot!=='string')throw Error('Source access was not approved. Basic inspection is still available.');
    grant={token:randomBytes(32).toString('hex'),origin,extensionId,sourceRoot:result.sourceRoot,expiresAt:now()+timeoutMs,paired:false};
    return {...grant};
   }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  },
  credential(token){return allowed()&&grant&&(grant.paired||now()<grant.expiresAt)&&equal(token,grant.token)?{...grant}:null;},
  paired(token){if(!allowed()||!grant||now()>=grant.expiresAt&&!grant.paired||!equal(token,grant.token))throw Error('Source approval expired');grant.paired=true;},
  close(){closed=true;grant=null;pending?.controller.abort();}
 };
}
