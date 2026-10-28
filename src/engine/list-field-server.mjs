// SPDX-License-Identifier: Apache-2.0
// Local source route for the acquired finite list program. No manifest, native
// witness or private compiler capability is exposed through page HTTP.
import http from 'node:http';
import {validateOwnedListFieldCompilation} from './list-field-compilation.mjs';
import {establishListFieldEffects,listFieldEffectsView} from './list-field-effects.mjs';
function reply(res,status,type,body){res.writeHead(status,{'content-type':type+'; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(body);}
export async function startListFieldServer({compilation,port=4173}={}){
 if(!await validateOwnedListFieldCompilation(compilation))throw Error('Current owned list compilation required');
 const effects=await establishListFieldEffects(compilation);
 if(listFieldEffectsView(effects).status!=='Code-linked')throw Error('Reviewed list effects required');
 if(!Number.isSafeInteger(port)||port<0||port>65535)throw Error('Invalid local port');
 const {manifest,code,assets}=compilation;let closed=false,closing;
 const server=http.createServer(async(req,res)=>{
  try{
   if(closed){reply(res,503,'text/plain','Source session closed');return;}
   if(req.headers.host!=='127.0.0.1:'+server.address().port){reply(res,403,'text/plain','Host denied');return;}
   if(req.method!=='GET'){reply(res,405,'text/plain','GET required');return;}
   // Every served app body belongs to the acquired current source tree. Source
   // drift denies subsequent requests; the verifier also checks at inspection.
   if(!await validateOwnedListFieldCompilation(compilation)||closed){reply(res,503,'text/plain','Source revision unavailable');return;}
   if(req.url==='/__stateatom/list-start'){reply(res,200,'text/html','<!doctype html><html><head><meta charset="utf-8"><title>StateAtom list setup</title></head><body><h1>StateAtom list setup</h1><p>Enable inspection for this tab in StateAtom before opening the application.</p><a href="/list/">Open the list application</a></body></html>');return;}
   if(req.url==='/list/'){reply(res,200,'text/html','<!doctype html><html><head><meta charset="utf-8">'+assets.map(a=>'<link rel="stylesheet" href="/list-assets/'+a.digest+'.css">').join('')+'</head><body><div id="root"></div><script src="/closed-profile/'+manifest.bundle.digest+'.js"></script></body></html>');return;}
   if(req.url==='/closed-profile/'+manifest.bundle.digest+'.js'){reply(res,200,'text/javascript',code);return;}
   const asset=assets.find(a=>req.url==='/list-assets/'+a.digest+'.css');if(asset){reply(res,200,'text/css',asset.code);return;}
   reply(res,404,'text/plain','Not found');
  }catch{if(!res.headersSent)reply(res,503,'text/plain','Source revision unavailable');else res.destroy();}
 });
 const close=()=>{if(closing)return closing;closed=true;closing=new Promise((resolve,reject)=>{server.close(error=>error&&error.code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve());server.closeAllConnections?.();});return closing;};
 try{await new Promise((resolve,reject)=>server.once('error',reject).listen(port,'127.0.0.1',resolve));return{server,compilation,effects,close};}
 catch(error){await close().catch(()=>{});throw error;}
}
