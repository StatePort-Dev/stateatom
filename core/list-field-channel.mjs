// SPDX-License-Identifier: Apache-2.0
// Private local verifier transport. Owned compiler/native capabilities never
// cross this channel; only the issuing process can verify the current occurrence.
import http from 'node:http';import path from 'node:path';
import {constants} from 'node:fs';import {mkdir,lstat,realpath,readdir,open,unlink} from 'node:fs/promises';
import {createHash,randomUUID,randomBytes,timingSafeEqual} from 'node:crypto';
import {listFieldCodeContextView,verifyListFieldRoute} from '../src/engine/list-field-code.mjs';
import {selectedListView} from './selected-list-view.mjs';
const endpoint='/__stateatom/list-verify',lifetime=15*60*1000,budget=1500000;
const sha=x=>createHash('sha256').update(x).digest('hex'),owned=s=>typeof process.getuid!=='function'||s.uid===process.getuid();
const unknown=()=>({status:'Unknown/Unsupported',fullPath:false,reason:'Current private selected-list verifier unavailable'});
async function directory(root,create=false){
 if(!path.isAbsolute(root)||await realpath(root)!==root||!(await lstat(root)).isDirectory())throw Error('Workspace denied');
 let dir=root;for(const name of['.runtime','selected-list-live']){dir=path.join(dir,name);if(create)try{await mkdir(dir,{mode:0o700});}catch(e){if(e.code!=='EEXIST')throw e;}
  const s=await lstat(dir);if(!s.isDirectory()||s.isSymbolicLink()||!owned(s)||(s.mode&0o022))throw Error('Private verifier directory denied');
 }return dir;
}
async function metadata(file,root){
 if(await realpath(file)!==file)throw Error('Private verifier symlink denied');
 const handle=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
 try{const a=await handle.stat();if(!a.isFile()||!owned(a)||(a.mode&0o777)!==0o600||a.size>4096)throw Error('Private verifier permissions denied');const raw=await handle.readFile(),b=await handle.stat();
  if(raw.length>4096||a.dev!==b.dev||a.ino!==b.ino||a.size!==b.size||a.mtimeMs!==b.mtimeMs||a.ctimeMs!==b.ctimeMs)throw Error('Private verifier changed');
  const c=JSON.parse(raw),now=Date.now();if(c.schema!=='stateatom.list-verifier-channel/1'||typeof c.id!=='string'||!/^[a-f0-9-]{36}$/.test(c.id)||c.workspace!==sha(root)||!Number.isSafeInteger(c.port)||c.port<1||c.port>65535||c.endpoint!==endpoint||!Number.isSafeInteger(c.pid)||c.pid<1||typeof c.token!=='string'||!/^[a-f0-9]{64}$/.test(c.token)||!Number.isSafeInteger(c.createdAt)||!Number.isSafeInteger(c.expiresAt)||c.createdAt>now||c.expiresAt<=c.createdAt||c.expiresAt-c.createdAt>lifetime)throw Error('Private verifier metadata denied');
  return {file,value:c,active:c.expiresAt>now,digest:sha(raw),identity:{dev:a.dev,ino:a.ino}};
 }finally{await handle.close();}
}
async function channels(root,create=false){const dir=await directory(root,create),names=await readdir(dir);if(names.length>64)throw Error('Private verifier discovery budget');const entries=[];for(const name of names.filter(n=>n.endsWith('.json'))){const entry=await metadata(path.join(dir,name),root);if(entry.active)entries.push(entry);}return{dir,entries};}
async function removeOwned(file,identity){try{const s=await lstat(file);if(!s.isSymbolicLink()&&s.dev===identity.dev&&s.ino===identity.ino)await unlink(file);}catch(e){if(e.code!=='ENOENT')throw e;}}
const closeServer=server=>new Promise((resolve,reject)=>{server.close(e=>e&&e.code!=='ERR_SERVER_NOT_RUNNING'?reject(e):resolve());server.closeAllConnections?.();});
export async function startListFieldChannel({root,context}={}){
 if(listFieldCodeContextView(context).status!=='Owned list code context')throw Error('Current owned list context required');
 const {dir,entries}=await channels(root,true);if(entries.length)throw Error('Competing active selected-list verifier');
 const createdAt=Date.now(),cap={schema:'stateatom.list-verifier-channel/1',id:randomUUID(),workspace:sha(root),pid:process.pid,port:0,endpoint,token:randomBytes(32).toString('hex'),createdAt,expiresAt:createdAt+lifetime};
 const file=path.join(dir,cap.id+'.json');let identity,closed=false,closing;
 const reply=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value));};
 const server=http.createServer(async(req,res)=>{
  try{const bearer=req.headers.authorization||'',expected='Bearer '+cap.token;
   if(closed||Date.now()>=cap.expiresAt||req.method!=='POST'||req.url!==endpoint||req.headers.host!=='127.0.0.1:'+cap.port||req.headers.origin!==undefined||Buffer.byteLength(bearer)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(bearer),Buffer.from(expected)))throw Error('Verifier request denied');
   let bytes=0;const chunks=[];for await(const chunk of req){bytes+=chunk.length;if(bytes>budget)throw Error('Verifier request budget');chunks.push(chunk);}const body=JSON.parse(Buffer.concat(chunks));
   if(body.channel!==cap.id||typeof body.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(body.requestId))throw Error('Verifier request identity denied');
   const result=await verifyListFieldRoute(context,{root,sourceRoot:body.sourceRoot,origin:body.origin,extensionId:body.extensionId,trace:body.trace,selection:body.selection,code:body.code,run:body.run});
   if(closed||Date.now()>=cap.expiresAt)throw Error('Verifier session expired');reply(res,200,{channel:cap.id,requestId:body.requestId,result});
  }catch{if(!res.headersSent)reply(res,403,{error:'Private verifier request denied'});else res.destroy();}
 });server.requestTimeout=5000;server.headersTimeout=5000;
 const close=()=>{if(closing)return closing;closed=true;closing=(async()=>{const results=await Promise.allSettled([closeServer(server),identity?removeOwned(file,identity):Promise.resolve()]);if(results.some(r=>r.status==='rejected'))throw Error('Selected-list verifier cleanup failed');})();return closing;};
 try{await new Promise((resolve,reject)=>server.once('error',reject).listen(0,'127.0.0.1',resolve));cap.port=server.address().port;if((await channels(root)).entries.length)throw Error('Competing active selected-list verifier');
  const handle=await open(file,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);try{const s=await handle.stat();identity={dev:s.dev,ino:s.ino};await handle.writeFile(JSON.stringify(cap));}finally{await handle.close();}
  return{close};
 }catch(e){await close().catch(()=>{});throw e;}
}
function request(cap,body){return new Promise((resolve,reject)=>{
 const bytes=JSON.stringify(body);if(Buffer.byteLength(bytes)>budget){reject(Error('Verifier payload budget'));return;}
 const req=http.request({hostname:'127.0.0.1',port:cap.port,path:endpoint,method:'POST',headers:{host:'127.0.0.1:'+cap.port,authorization:'Bearer '+cap.token,'content-type':'application/json','content-length':Buffer.byteLength(bytes)},agent:false},res=>{
  if(res.statusCode!==200||!/^application\/json\b/.test(res.headers['content-type']||'')){res.resume();reject(Error('Verifier unavailable'));return;}
  let size=0;const chunks=[];res.on('data',c=>{size+=c.length;if(size>budget){res.destroy();reject(Error('Verifier response budget'));}else chunks.push(c);});res.on('error',reject);res.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks)));}catch(e){reject(e);}});
 });const timer=setTimeout(()=>req.destroy(Error('Verifier timeout')),5000);req.on('error',reject);req.on('close',()=>clearTimeout(timer));req.end(bytes);
});}
export async function verifyRemoteListField({root,sourceRoot,origin,extensionId,trace,selection,code,run}={}){
 try{const {entries}=await channels(root);if(entries.length!==1)return unknown();const before=entries[0],cap=before.value,requestId=randomUUID();
  const response=await request(cap,{channel:cap.id,requestId,sourceRoot,origin,extensionId,trace,selection,code,run});const after=await metadata(before.file,root),current=await channels(root);
  if(!after.active||after.digest!==before.digest||after.identity.dev!==before.identity.dev||after.identity.ino!==before.identity.ino||current.entries.length!==1||current.entries[0].digest!==before.digest||response.channel!==cap.id||response.requestId!==requestId)return unknown();
  const p=response.result;if(p?.fullPath===true){const view=selectedListView({attached:true,selection,analysis:{capabilities:{sourceResolver:'open-ide'},stateatom:{selectedListProfile:p}}});return view?.fullPath===true?view:unknown();}
  return p?.fullPath===false&&['Unknown/Unsupported','Stale'].includes(p.status)?{status:p.status,fullPath:false,reason:typeof p.reason==='string'?p.reason.slice(0,1024):unknown().reason}:unknown();
 }catch{return unknown();}
}
