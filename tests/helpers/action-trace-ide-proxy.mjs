// SPDX-License-Identifier: Apache-2.0
// Test-only transport gate: forwards exact responses from the real owned IDE.
// It neither synthesizes source results nor logs credentials/request bodies.
import http from 'node:http';
import {createHash} from 'node:crypto';
export async function startActionTraceIDEProxy(upstream){
 if(new URL(upstream).hostname!=='127.0.0.1')throw Error('Owned loopback IDE required');
 const receipts=[];let nextHold=false,held=null,holdWait=null,holdReady=null;
 function release(){held?.();held=null;}
 const server=http.createServer(async(req,res)=>{
  try{
   const chunks=[];for await(const b of req)chunks.push(b);
   const target=new URL(req.url,upstream);if(target.origin!==new URL(upstream).origin)throw Error('Only the owned IDE may be forwarded');
   const headers=Object.fromEntries(['content-type','authorization','origin','access-control-request-method','access-control-request-headers'].filter(k=>req.headers[k]).map(k=>[k,req.headers[k]]));
   const response=await fetch(target,{method:req.method,headers,body:Buffer.concat(chunks),signal:AbortSignal.timeout(15000),redirect:'error'});
   const bytes=Buffer.from(await response.arrayBuffer()),receipt={path:req.url,status:response.status,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};receipts.push(receipt);
   if(nextHold&&req.url==='/check-action-sources'){nextHold=false;receipt.held=true;const wait=new Promise(r=>held=r);holdReady?.();await wait;receipt.releasedAt=Date.now();}
   if(!res.destroyed){res.writeHead(response.status,Object.fromEntries(['content-type','access-control-allow-origin','access-control-allow-headers','access-control-allow-methods','vary'].filter(k=>response.headers.has(k)).map(k=>[k,response.headers.get(k)])));res.end(bytes);}
  }catch{if(!res.destroyed){res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({ok:false,error:'Owned test IDE transport unavailable'}));}}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 return{url:'http://127.0.0.1:'+server.address().port,receipts,get isHeld(){return held!==null;},holdNextSourceResponse(){nextHold=true;holdWait=new Promise(r=>holdReady=r);return holdWait;},release,async close(){nextHold=false;release();server.closeAllConnections();await new Promise(r=>server.close(r));}};
}
