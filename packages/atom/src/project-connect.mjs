// SPDX-License-Identifier: Apache-2.0
import {parseConnectionReceipt} from '../../../core/project-connection.mjs';
import {appOrigin,helperURL} from './origin-policy.mjs';
export async function requestProjectConnection({url,origin,signal,fetchImpl=globalThis.fetch}){
 if(!helperURL(url)||!appOrigin(origin,{exact:true})||new URL(origin).protocol!=='http:')throw Error('Source connection requires a local helper and a development page.');
 let response;
 try{response=await fetchImpl(url+'/connect',{method:'POST',redirect:'error',cache:'no-store',credentials:'omit',signal,headers:{'content-type':'application/json'},body:JSON.stringify({origin})});}
 catch(error){if(signal?.aborted)throw error;throw Error('Open this project in VS Code with the StateAtom helper, then try again.');}
 const raw=await response.text();if(raw.length>16384)throw Error('Unexpected IDE helper response. Update the helper and try again.');
 let reply;try{reply=JSON.parse(raw);}catch{throw Error('Update the StateAtom IDE helper to connect directly.');}
 if(!response.ok||!reply?.ok)throw Error(['Token denied','Operation denied'].includes(reply?.error)?'Update the StateAtom IDE helper to connect directly.':String(reply?.error||'Source access was not approved.').slice(0,512));
 const receipt=parseConnectionReceipt(reply.result);
 if(signal?.aborted)throw Error('Source connection cancelled');
 if(receipt.origin!==origin||receipt.url!==url)throw Error('IDE response does not match this page.');
 return receipt;
}
