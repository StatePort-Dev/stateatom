import {sourceSlice,validateTrace} from '../stateatom-phase2/engine/slice.mjs';
import {realpath,readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import {timingSafeEqual} from 'node:crypto';
import http from 'node:http';
import {analyzeSources,digest,sourceBinding} from './analyzer.mjs';
const operations=new Set(['analyze','open','definitions','references']);
export function targetIdentity(s){return {tab:Number.isInteger(s.tabId)?s.tabId:null,frame:s.frame??0,property:s.property,value:s.value,instance:s.instance,page:s.page};}
export function validateRequest(headers,cfg,operation){
 if(headers.host!=='127.0.0.1:'+cfg.port)throw Error('Host denied');
 const match=/^chrome-extension:\/\/([a-p]{32})$/.exec(headers.origin||'');
 if(!match||(cfg.extension&&cfg.extension!==match[1]))throw Error('Origin denied');
 const token=(headers.authorization||'').replace(/^Bearer /,'');
 if(token.length!==cfg.token.length||!timingSafeEqual(Buffer.from(token),Buffer.from(cfg.token)))throw Error('Token denied');
 if(operation!=='pair'&&!operations.has(operation))throw Error('Operation denied');return true;
}
export async function safePath(root,relative){
 if(typeof relative!=='string'||relative.includes('%')||path.isAbsolute(relative))throw Error('Path denied');
 const base=await realpath(root),full=await realpath(path.resolve(base,relative));
 if(!full.startsWith(base+path.sep))throw Error('Outside workspace');return full;
}
async function sourceFiles(root,subdir){
 const base=await safePath(root,subdir),out=[];let bytes=0;
 async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){if(['node_modules','.git','dist','artifacts'].includes(entry.name)||entry.isSymbolicLink())continue;const name=path.join(dir,entry.name);if(entry.isDirectory())await walk(name);else if(/\.(jsx?|tsx?|vue|svelte)$/.test(name)&&out.length<160){const size=(await stat(name)).size;if(size>256000||bytes+size>2000000)continue;bytes+=size;out.push({file:path.relative(root,name),text:await readFile(name,'utf8')});}}}
 await walk(base);return out;
}
export function instrumentedSources(files,marker){const [file,,hash]=String(marker).split(':');return files.filter(f=>f.file===file&&digest(f.text).slice(0,12)===hash);}
export function startBridge({root,port=47731,token,onOpen,onDefinitions,onReferences}){
 const cfg={port,token,extension:null},bindings=new Map();
 const server=http.createServer(async(req,res)=>{
  const origin=req.headers.origin;res.setHeader('Vary','Origin');
  if(/^chrome-extension:\/\/[a-p]{32}$/.test(origin||'')&&(!cfg.extension||origin.endsWith(cfg.extension)))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Headers','authorization,content-type');res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  try{
   const op=req.url?.slice(1);validateRequest(req.headers,cfg,op);if(req.method!=='POST')throw Error('POST only');
   let data='';for await(const c of req){data+=c;if(Buffer.byteLength(data)>1500000)throw Error('Payload limit');}const body=JSON.parse(data||'{}');let result;
   if(op==='pair'){
    if(!/^http:\/\/127\.0\.0\.1:(4173|4174|4175)$/.test(body.origin))throw Error('App origin denied');
    await safePath(root,body.sourceRoot);cfg.extension=origin.split('://')[1];bindings.set(body.origin,body.sourceRoot);result={paired:true,workspace:path.basename(root),origin:body.origin};
   }else{
    const sourceRoot=bindings.get(body.origin);if(!sourceRoot)throw Error('Origin not mapped');
    if(op==='analyze'){
     const files=await sourceFiles(root,sourceRoot),samples=body.samples||[];

     // File-level binding: unrelated loaded scripts cannot validate another file.
     const eligible=(body.selection.marker?instrumentedSources(files,body.selection.marker):files.filter(f=>sourceBinding(f.text,samples))).map(f=>{const matching=samples.filter(s=>sourceBinding(f.text,[s]));const executable=matching.some(s=>(body.proofs||[]).some(p=>p.digest===digest(s)&&p.kind==='executable'));return {...f,freshness:body.selection.marker?'instrumented-source-digest':executable?'executable-AST-matched':'map-claimed-unverified'};});
     const bound=eligible.length>0;result=analyzeSources(eligible,{...body.selection,unbound:!bound},body.requests||[],{run:body.run,build:digest([...samples].sort().join(''))||'unbound',freshness:bound?'build-observed; source freshness per edge':'unbound'});
     result.stateatom={target:targetIdentity(body.selection),runtime:validateTrace(files,body.deepTrace),slices:result.sources.map(source=>sourceSlice(files,source))};
     result.boundFiles=eligible.map(f=>f.file);result.bindings=eligible.map(f=>({file:f.file,method:body.selection.marker?'instrumented marker + source digest':sourceBinding(f.text,samples)}));
    }else{
     const full=await safePath(root,body.file),sub=await safePath(root,sourceRoot);if(!full.startsWith(sub+path.sep))throw Error('Outside mapped sources');
     const text=await readFile(full,'utf8');if(body.sourceDigest!==digest(text))throw Error('Stale source');
     if(!Number.isInteger(body.line)||body.line<1||body.line>text.split('\n').length||!Number.isInteger(body.column)||body.column<1)throw Error('Range denied');
     if(op==='open')result=await onOpen(full,body);else if(op==='definitions')result=await onDefinitions(full,body);else result=await onReferences(full,body);
    }
   }
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,result}));
  }catch(e){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}));}
 });
 return {server,cfg,ready:new Promise((resolve,reject)=>server.once('error',reject).listen(port,'127.0.0.1',resolve)),close:()=>new Promise(r=>server.close(r))};
}
