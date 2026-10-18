// SPDX-License-Identifier: Apache-2.0
// Private workspace acquisition. A matching compilation is not an effect proof.
import http from 'node:http';
import {constants} from 'node:fs';
import {mkdir,lstat,realpath,readdir,open,unlink} from 'node:fs/promises';
import path from 'node:path';
import {randomBytes,randomUUID,createHash,timingSafeEqual} from 'node:crypto';
import {buildFirstReadProfile} from './build-profile.mjs';
import {isOwnedControlledBrowserWitness,controlledBrowserView} from './controlled-session.mjs';
const ORIGIN='http://127.0.0.1:4173',HOST='127.0.0.1:4173';
const ENDPOINT='/__stateatom/first-read-manifest',SESSION_ENDPOINT='/__stateatom/first-read-session',SESSION_LIMIT=4096,LIFETIME=15*60*1000,METADATA_LIMIT=256*1024;
const sha=v=>createHash('sha256').update(v).digest('hex');
const issuedCompilations=new WeakSet();
export function isOwnedFirstReadCompilation(value){return value!==null&&typeof value==='object'&&issuedCompilations.has(value);}
function freezeProjection(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freezeProjection(child);Object.freeze(value);}return value;}
const unknown=reason=>({status:'Unknown',reason,scope:'Owned compilation correspondence only',fullPath:false});
async function rootPath(projectRoot){const root=path.resolve(projectRoot);if(await realpath(root)!==root||!(await lstat(root)).isDirectory())throw Error('Workspace denied');return root;}
function owned(st){return typeof process.getuid!=='function'||st.uid===process.getuid();}
async function directory(root,{create=false}={}){
 let current=root;
 for(const name of ['.runtime','first-read-live']){
  current=path.join(current,name);
  if(create)try{await mkdir(current,{mode:0o700});}catch(e){if(e.code!=='EEXIST')throw e;}
  const st=await lstat(current);if(!st.isDirectory()||st.isSymbolicLink()||!owned(st)||(st.mode&0o022))throw Error('Private channel directory denied');
 }
 return current;
}
async function capability(file,root){
 if(await realpath(file)!==file)throw Error('Private capability path denied');
 const handle=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
 try{
  const a=await handle.stat();if(!a.isFile()||!owned(a)||(a.mode&0o777)!==0o600||a.size>4096)throw Error('Private capability permissions denied');
  const bytes=await handle.readFile();const b=await handle.stat();if(bytes.length>4096||a.ino!==b.ino||a.size!==b.size||a.mtimeMs!==b.mtimeMs||a.ctimeMs!==b.ctimeMs)throw Error('Private capability changed');
  let c;try{c=JSON.parse(bytes.toString('utf8'));}catch{throw Error('Private capability invalid');}const now=Date.now();
  if(c.schema!==1||typeof c.id!=='string'||!/^[a-f0-9-]{36}$/.test(c.id)||!Number.isSafeInteger(c.pid)||c.pid<1||c.origin!==ORIGIN||c.endpoint!==ENDPOINT||c.workspaceDigest!==sha(root)||typeof c.token!=='string'||!/^[a-f0-9]{64}$/.test(c.token)||!Number.isSafeInteger(c.createdAt)||!Number.isSafeInteger(c.expiresAt)||c.createdAt>now||c.expiresAt<=c.createdAt||c.expiresAt-c.createdAt>LIFETIME)throw Error('Private capability metadata denied');
  return {value:c,active:c.expiresAt>now,identity:{dev:a.dev,ino:a.ino},bytes:sha(bytes)};
 }finally{await handle.close();}
}
async function channels(dir,root){
 const names=await readdir(dir);if(names.length>64)throw Error('Private channel discovery budget exceeded');
 const found=[];
 for(const name of names.filter(n=>n.endsWith('.json'))){const file=path.join(dir,name),st=await lstat(file);if(st.isSymbolicLink())throw Error('Private capability symlink denied');const cap=await capability(file,root);if(cap.active)found.push({file,...cap});}
 return found;
}
async function ownedUnlink(file,identity){
 try{const st=await lstat(file);if(!st.isSymbolicLink()&&st.dev===identity.dev&&st.ino===identity.ino)await unlink(file);}catch(e){if(e.code!=='ENOENT')throw e;}
}
function closeServer(server){return new Promise((resolve,reject)=>{server.close(error=>error&&error.code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve());server.closeAllConnections?.();});}
function fixed(res,status,type,body){res.writeHead(status,{'content-type':type+'; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(body);}
export async function startFirstReadServer({projectRoot=process.cwd()}={}){
 const root=await rootPath(projectRoot),dir=await directory(root,{create:true});
 if((await channels(dir,root)).length)throw Error('Competing active first-read channel');
 const {code,manifest}=await buildFirstReadProfile({projectRoot:root}),profile={code,manifest};
 // Only the source development server loads Vite's existing synthetic API. The
 // installed IDE acquisition below neither imports Vite nor starts a server.
 const phaseURL=new URL('../stateatom-phase2/server.mjs',import.meta.url).href;
 const {phaseConfig}=await import(phaseURL),middlewares=[];
 phaseConfig('A').plugins.find(p=>p.name==='phase2-synthetic-api').configureServer({middlewares:{use:fn=>middlewares.push(fn)}});
 const token=randomBytes(32).toString('hex'),id=randomUUID(),createdAt=Date.now();
 const cap={schema:1,id,pid:process.pid,origin:ORIGIN,endpoint:ENDPOINT,createdAt,expiresAt:createdAt+LIFETIME,workspaceDigest:sha(root),token};
 const file=path.join(dir,id+'.json');let identity,closed=false,boundBrowser=null;
 async function bindControlledBrowser(witness){
  if(closed||Date.now()>=cap.expiresAt||!isOwnedControlledBrowserWitness(witness)||boundBrowser&&isOwnedControlledBrowserWitness(boundBrowser))throw Error('Controlled browser binding denied');
  await controlledBrowserView(witness);
  if(closed||Date.now()>=cap.expiresAt||!isOwnedControlledBrowserWitness(witness)||boundBrowser&&isOwnedControlledBrowserWitness(boundBrowser))throw Error('Controlled browser binding denied');
  boundBrowser=witness;
 }
 async function browserSession(){
  if(closed||Date.now()>=cap.expiresAt||!boundBrowser)return null;
  const selected=boundBrowser,view=await controlledBrowserView(selected);
  if(!view||closed||boundBrowser!==selected||Date.now()>=cap.expiresAt)return null;
  const result={...view,channelId:id,manifestId:manifest.id,bundleDigest:manifest.bundle.digest};
  return Buffer.byteLength(JSON.stringify(result))<=SESSION_LIMIT?result:null;
 }

 const server=http.createServer((req,res)=>{
  if(req.headers.host!==HOST){fixed(res,403,'text/plain','Request denied');return;}
  if(req.url===ENDPOINT||req.url===SESSION_ENDPOINT){
   const authorization=req.headers.authorization||'',expected='Bearer '+token;
   if(req.method!=='GET'||req.headers.origin!==undefined||Buffer.byteLength(authorization)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(authorization),Buffer.from(expected))||Date.now()>=cap.expiresAt){fixed(res,403,'text/plain','Request denied');return;}
   if(req.url===ENDPOINT){fixed(res,200,'application/json',JSON.stringify(profile.manifest));return;}
   browserSession().then(view=>fixed(res,200,'application/json',JSON.stringify(view)),()=>fixed(res,200,'application/json','null'));return;
  }
  if(req.method!=='GET'){fixed(res,405,'text/plain','GET required');return;}
  if(req.url==='/__stateatom/first-read-start'){fixed(res,200,'text/html','<!doctype html><html><head><meta charset="utf-8"><title>StateAtom first-read setup</title></head><body><h1>StateAtom first-read setup</h1><p>Choose this tab in StateAtom and enable inspection before opening the application.</p><p><a href="/react/">Open the first-read application</a></p></body></html>');return;}
  if(req.url==='/react/'||req.url==='/react/index.html'){fixed(res,200,'text/html','<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div><script src="/closed-profile/'+manifest.bundle.digest+'.js"></script></body></html>');return;}
  if(req.url==='/closed-profile/'+manifest.bundle.digest+'.js'){fixed(res,200,'text/javascript',code);return;}
  let i=0;const next=()=>{const middleware=middlewares[i++];if(middleware)middleware(req,res,next);else fixed(res,404,'text/plain','Not found');};next();
 });
 // Neither a failed close nor a failed unlink suppresses the other attempt.
 async function close(){if(closed)return;closed=true;boundBrowser=null;const results=await Promise.allSettled([closeServer(server),identity?ownedUnlink(file,identity):Promise.resolve()]);if(results.some(r=>r.status==='rejected'))throw Error('First-read channel cleanup failed');}
 try{
  await new Promise((resolve,reject)=>server.once('error',reject).listen(4173,'127.0.0.1',resolve));
  if((await channels(dir,root)).length)throw Error('Competing active first-read channel');
  const handle=await open(file,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);
  try{const st=await handle.stat();identity={dev:st.dev,ino:st.ino};await handle.writeFile(JSON.stringify(cap));}finally{await handle.close();}
  return {server,profile,bindControlledBrowser,close};
 }catch(error){await close().catch(()=>{});throw Error(error?.code==='EADDRINUSE'?'First-read port already in use':error?.code==='EPERM'?'First-read local listener denied':'First-read channel start failed');}
}
function getMetadata(token,endpoint=ENDPOINT,budget=METADATA_LIMIT){return new Promise((resolve,reject)=>{
 const deadline=setTimeout(()=>{req.destroy();reject(Error('Private manifest timeout'));},2500);
 const req=http.get({hostname:'127.0.0.1',port:4173,path:endpoint,headers:{host:HOST,authorization:'Bearer '+token},timeout:2000,agent:false},res=>{
  if(res.statusCode!==200||!/^application\/json\b/.test(res.headers['content-type']||'')){res.resume();reject(Error('Private manifest unavailable'));return;}
  const chunks=[];let size=0;res.on('data',c=>{size+=c.length;if(size>budget){res.destroy();reject(Error('Private manifest budget exceeded'));}else chunks.push(c);});res.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{reject(Error('Private manifest invalid'));}});res.on('error',()=>reject(Error('Private manifest unavailable')));
 });req.on('timeout',()=>req.destroy(Error('Private manifest timeout')));req.on('error',()=>reject(Error('Private manifest unavailable')));req.on('close',()=>clearTimeout(deadline));
});}
function comparison(manifest){
 if(!manifest||manifest.schema!==1||manifest.profile!=='react18-query5-first-data-render/1'||typeof manifest.digest!=='string'||manifest.digest.length!==64||!Array.isArray(manifest.inputs)||manifest.inputs.length>160||!manifest.trust||!Array.isArray(manifest.trust.files)||manifest.trust.files.length>1024||!manifest.compiler||!manifest.bundle)throw Error('Compilation manifest invalid');
 const {digest,...rest}=manifest;if(sha(JSON.stringify(rest))!==digest)throw Error('Compilation manifest changed');
 const {id,createdAt,...stable}=rest;
 const {host,...compiler}=stable.compiler;
 if(!host||typeof host.node!=='string'||host.node.length>80||typeof host.v8!=='string'||host.v8.length>80||host.platform!=='linux'||host.arch!=='x64')throw Error('Compilation host observation invalid');
 return JSON.stringify({...stable,compiler});
}

function validBrowserView(view,cap,manifest){
 if(view===null)return null;
 const keys=['schema','witnessId','targetId','extensionId','browserVersion','mainFrameId','contextUniqueId','startedAt','freshProfile','sandbox','soleStateAtomExtension','channelId','manifestId','bundleDigest'];
 if(!view||typeof view!=='object'||Array.isArray(view)||Object.keys(view).length!==keys.length||keys.some(k=>!Object.hasOwn(view,k)))throw Error('Controlled browser metadata invalid');
 const bounded=(v,n)=>typeof v==='string'&&v.length>0&&v.length<=n&&!/[\x00-\x1f\x7f]/.test(v);
 const uuid=v=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v);
 const now=Date.now();
 if(view.schema!==1||!uuid(view.witnessId)||!bounded(view.targetId,256)||typeof view.extensionId!=='string'||!/^[a-p]{32}$/.test(view.extensionId)||!bounded(view.browserVersion,160)||! /^(?:Headless)?Chrome\//.test(view.browserVersion)||!bounded(view.mainFrameId,256)||!bounded(view.contextUniqueId,256)||!Number.isSafeInteger(view.startedAt)||view.startedAt>now||now-view.startedAt>=LIFETIME||view.freshProfile!==true||view.sandbox!==true||view.soleStateAtomExtension!==true||view.channelId!==cap.id||view.manifestId!==manifest.id||view.bundleDigest!==manifest.bundle.digest)throw Error('Controlled browser metadata invalid');
 return Object.fromEntries(keys.map(k=>[k,view[k]]));
}
async function acquireBrowserView(cap,manifest){
 try{return validBrowserView(await getMetadata(cap.token,SESSION_ENDPOINT,SESSION_LIMIT),cap,manifest);}catch{return null;}
}

export async function loadFirstReadCompilation(projectRoot,origin){
 if(origin!==ORIGIN)return unknown('First-read origin is not mapped to the owned local profile');
 try{
  const root=await rootPath(projectRoot);let dir;
  try{dir=await directory(root);}catch(e){if(e.code==='ENOENT')return unknown('No live first-read compilation channel');throw e;}
  const active=await channels(dir,root);if(active.length!==1)return unknown(active.length?'Competing live first-read compilation channels':'No live first-read compilation channel');
  const selected=active[0],manifest=await getMetadata(selected.value.token),declared=comparison(manifest);
  const browserBefore=await acquireBrowserView(selected.value,manifest);
  // Workspace files and helper-owned transforms, never an executable supplied by
  // the page or channel, produce this second independent set of bytes/receipts.
  const candidate=await buildFirstReadProfile({projectRoot:root});
  if(comparison(candidate.manifest)!==declared)return unknown('Owned compilation correspondence differs');
  const current=await capability(selected.file,root);if(!current.active||current.bytes!==selected.bytes||current.identity.ino!==selected.identity.ino||current.identity.dev!==selected.identity.dev)return unknown('First-read compilation channel changed');
  if((await channels(dir,root)).length!==1)return unknown('First-read compilation channel changed');
  const browserAfter=await acquireBrowserView(selected.value,manifest);
  const finalChannels=await channels(dir,root);
  if(finalChannels.length!==1||finalChannels[0].file!==selected.file||finalChannels[0].bytes!==selected.bytes||finalChannels[0].identity.ino!==selected.identity.ino||finalChannels[0].identity.dev!==selected.identity.dev)return unknown('First-read compilation channel changed');
  // A changed native occurrence never composes with the already acquired
  // compilation. Compiler correspondence remains separately labelled.
  const controlledBrowser=browserBefore&&browserAfter&&JSON.stringify(browserBefore)===JSON.stringify(browserAfter)?browserAfter:null;
  const projection=freezeProjection({status:'Code-linked',manifest,controlledBrowser,compilerHosts:{server:manifest.compiler.host,helper:candidate.manifest.compiler.host},scope:'Owned compilation correspondence only',fullPath:false});issuedCompilations.add(projection);return projection;
 }catch{return unknown('First-read compilation unavailable or workspace/compiler correspondence invalid');}
}
