import {HELPER_ID,HELPER_VERSION,HELPER_PROTOCOL} from './project-connection.mjs';
import {appOrigin} from '../packages/atom/src/origin-policy.mjs';
import {verifyFirstRead} from "../src/first-read/verify.mjs";
import {loadFirstReadCompilation} from "../src/first-read/profile-channel.mjs";
import {sourceSlice,validateTrace} from "../src/engine/slice.mjs";
import {readFile,stat} from 'node:fs/promises';
import {safePath,readWorkspaceSources} from './workspace-sources.mjs';
export {safePath} from './workspace-sources.mjs';
import path from 'node:path';
import {timingSafeEqual,randomUUID,createHash} from 'node:crypto';
import http from 'node:http';
import {analyzeSources,digest,sourceBinding} from './analyzer.mjs';
const operations=new Set(['analyze','open','definitions','references','check-action-sources']);
export function targetIdentity(s){return {tab:Number.isInteger(s.tabId)?s.tabId:null,frame:s.frame??0,property:s.property,value:s.value,instance:s.instance,page:s.page};}
export function validateRequest(headers,cfg,operation){
 if(headers.host!=='127.0.0.1:'+cfg.port)throw Error('Host denied');
 const match=/^chrome-extension:\/\/([a-p]{32})$/.exec(headers.origin||'');
 if(!match||(cfg.extension&&cfg.extension!==match[1]))throw Error('Origin denied');
 const token=(headers.authorization||'').replace(/^Bearer /,'');
 if(token.length!==cfg.token.length||!timingSafeEqual(Buffer.from(token),Buffer.from(cfg.token)))throw Error('Token denied');
 if(operation!=='pair'&&!operations.has(operation))throw Error('Operation denied');return true;
}
function sourceHints(selection,trace){
 const hints=new Set(),add=file=>{if(hints.size<160&&typeof file==='string')hints.add(file);};
 if(typeof selection?.marker==='string')add(selection.marker.split(':')[0]);
 add(trace?.target?.file);add(trace?.commit?.source?.file);
 for(const n of Array.isArray(trace?.nodes)?trace.nodes:[]){if(hints.size>=160)break;add(n?.file);}
 return [...hints];
}
export function instrumentedSources(files,marker){const [file,,hash]=String(marker).split(':');return files.filter(f=>f.file===file&&digest(f.text).slice(0,12)===hash);}
export function startBridge({root,port=47731,token,onOpen,onDefinitions,onReferences,isAllowed=()=>true}){
 const cfg={port,token,extension:null},bindings=new Map(),helper={id:HELPER_ID,version:HELPER_VERSION,protocol:HELPER_PROTOCOL,session:randomUUID()},workspace={id:createHash('sha256').update(path.resolve(root)).digest('hex'),name:path.basename(root)};
 const server=http.createServer(async(req,res)=>{
  const origin=req.headers.origin;res.setHeader('Vary','Origin');
  if(/^chrome-extension:\/\/[a-p]{32}$/.test(origin||'')&&(!cfg.extension||origin.endsWith(cfg.extension)))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Headers','authorization,content-type');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  try{
   if(!isAllowed())throw Error('Workspace trust or selection changed; reconnect in the IDE');const op=req.url?.slice(1);validateRequest(req.headers,cfg,op);if(req.method!=='POST')throw Error('POST only');
   let data='';for await(const c of req){data+=c;if(Buffer.byteLength(data)>1500000)throw Error('Payload limit');}const body=JSON.parse(data||'{}');let result;
   if(!isAllowed())throw Error('Workspace trust revoked');
   if(op==='pair'){
    if(body.clientProtocol!==undefined&&body.clientProtocol!==HELPER_PROTOCOL)throw Error('Helper protocol mismatch; install matching components');
    if(body.connection&&(body.connection.schemaVersion!==1||body.connection.helper?.id!==helper.id||body.connection.helper?.version!==helper.version||body.connection.helper?.protocol!==helper.protocol||body.connection.helper?.session!==helper.session||body.connection.workspace?.id!==workspace.id))throw Error('Stale or wrong-workspace receipt; copy a fresh receipt from this helper');
    if(!appOrigin(body.origin,{exact:true})||new URL(body.origin).protocol!=='http:')throw Error('App origin denied');
    await safePath(root,body.sourceRoot);cfg.extension=origin.split('://')[1];bindings.set(body.origin,body.sourceRoot);result={paired:true,workspace:path.basename(root),origin:body.origin,sourceRoot:body.sourceRoot,helper,workspaceIdentity:workspace};
   }else{
    const sourceRoot=bindings.get(body.origin);if(!sourceRoot)throw Error('Origin not mapped');
    if(op==='analyze'){
     const files=await readWorkspaceSources(root,sourceRoot,{priorityFiles:sourceHints(body.selection,body.deepTrace),isAllowed}),samples=body.samples||[];

     // File-level binding: unrelated loaded scripts cannot validate another file.
     const eligible=(body.selection.marker?instrumentedSources(files,body.selection.marker):files.filter(f=>sourceBinding(f.text,samples))).map(f=>{const matching=samples.filter(s=>sourceBinding(f.text,[s]));const executable=matching.some(s=>(body.proofs||[]).some(p=>p.digest===digest(s)&&p.kind==='executable'));return {...f,freshness:body.selection.marker?'instrumented-source-digest':executable?'executable-AST-matched':'map-claimed-unverified'};});
     const bound=eligible.length>0;result=analyzeSources(eligible,{...body.selection,unbound:!bound},body.requests||[],{run:body.run,build:digest([...samples].sort().join(''))||'unbound',freshness:bound?'build-observed; source freshness per edge':'unbound'},{projectFiles:files});
     result.stateatom={target:targetIdentity(body.selection),runtime:validateTrace(files,body.deepTrace),slices:result.sources.map(source=>sourceSlice(files,source))};
     if(body.deepTrace?.firstReadObservations){const compilation=await loadFirstReadCompilation(root,body.origin);result.stateatom.firstReadCompilation=compilation;result.stateatom.firstReadProfile=verifyFirstRead({compilation,code:body.firstReadCode,trace:body.deepTrace,selection:body.selection,run:body.run});}
     result.boundFiles=eligible.map(f=>f.file);result.bindings=eligible.map(f=>({file:f.file,method:body.selection.marker?'instrumented marker + source digest':sourceBinding(f.text,samples)}));
    }else if(op==='check-action-sources'){
     if(!Array.isArray(body.sources)||body.sources.length>32)throw Error('Action source budget');
     const sub=await safePath(root,sourceRoot);let current=true;
     for(const source of body.sources){const full=await safePath(root,source.file);if(!full.startsWith(sub+path.sep))throw Error('Outside mapped sources');const size=(await stat(full)).size;if(size>256000)throw Error('Action source budget');if(source.sourceDigest!==digest(await readFile(full,'utf8')))current=false;}
     result={current};
    }else{
     const full=await safePath(root,body.file),sub=await safePath(root,sourceRoot);if(!full.startsWith(sub+path.sep))throw Error('Outside mapped sources');
     const text=await readFile(full,'utf8');if(body.sourceDigest!==digest(text))throw Error('Stale source');
     if(!Number.isInteger(body.line)||body.line<1||body.line>text.split('\n').length||!Number.isInteger(body.column)||body.column<1)throw Error('Range denied');
     if(op==='open')result=await onOpen(full,body);else if(op==='definitions')result=await onDefinitions(full,body);else result=await onReferences(full,body);
    }
   }
   if(!isAllowed())throw Error('Workspace trust revoked');res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,result}));
  }catch(e){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}));}
 });
 return {server,cfg,helper,workspace,ready:new Promise((resolve,reject)=>server.once('error',reject).listen(port,'127.0.0.1',resolve)),close:()=>new Promise(r=>server.close(r))};
}
