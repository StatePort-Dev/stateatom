// SPDX-License-Identifier: Apache-2.0
// Separate Node acquisition hooks. No bridge endpoint or product source authority.
import {AsyncLocalStorage} from 'node:async_hooks';
import {types} from 'node:util';
import {errorMonitor} from 'node:events';
import {installedVitePin} from './compiler-pin.mjs';
const field=(object,key)=>{if(!object||types.isProxy(object))return;const d=Object.getOwnPropertyDescriptor(object,key);return d&&Object.hasOwn(d,'value')?d.value:undefined;};
export function installCompilerAcquisition(server,observer,ledger,{onBody=()=>{}}={}){
 const implementationDigest=installedVitePin();
 const env=server.environments.client,container=env.pluginContainer,graph=env.moduleGraph,als=new AsyncLocalStorage();
 if(env.config.consumer!=='client'||env.config.dev.moduleRunnerTransform)throw Error('Only the native client transform pipeline is supported');
 const originals={request:env.transformRequest,transform:container.transform,stage:observer.transform,update:graph.updateModuleTransformResult,invalidate:graph.invalidateModule};
 const receipts=[],errors=[],captures=new Set();let closed=false,receiptOverflow=false,retainedBytes=0;
 const error=message=>{if(!errors.includes(message)&&errors.length<8)errors.push(message);};
 const safe=fn=>{try{return fn();}catch{error('Compiler acquisition callback unavailable');return undefined;}};
 env.transformRequest=function(...args){
  const parent=als.getStore(),context={request:parent?.request,calls:[],proposals:[],completed:false,proposalOverflow:false};
  return als.run(context,async()=>{try{
   const result=await Reflect.apply(originals.request,this,args);
   if(!closed&&!context.proposalOverflow){const matches=context.proposals.filter(p=>p.result===result);if(matches.length===1)safe(()=>ledger.seal(result,matches[0].id,matches[0].tokens));}
   if(!closed&&context.request?.url===args[0])context.request.result=result;
   return result;
  }finally{context.completed=true;context.proposals.length=0;}});
 };
 container.transform=function(...args){const parent=als.getStore(),token=safe(()=>ledger.begin(args[1],args[0]));if(!token)return Reflect.apply(originals.transform,this,args);const context={...parent,owner:parent?.owner||parent,activePipeline:token};return als.run(context,async()=>{try{const result=await Reflect.apply(originals.transform,this,args);if(!closed){safe(()=>ledger.finish(token,field(result,'code')));parent?.calls.push(token);}return result;}catch(error){safe(()=>ledger.fail(token));throw error;}});};
 observer.transform=function(...args){const result=Reflect.apply(originals.stage,this,args),token=als.getStore()?.activePipeline;if(!closed&&token&&result)safe(()=>ledger.stage(token,args[0],typeof result==='string'?result:field(result,'code')));return result;};
 graph.updateModuleTransformResult=function(...args){const store=als.getStore(),context=store?.owner||store;if(!closed&&context?.proposals&&!context.completed){if(context.proposals.length<256)context.proposals.push({result:args[1],id:args[0]?.id,tokens:[...context.calls]});else context.proposalOverflow=true;}return Reflect.apply(originals.update,this,args);};
 graph.invalidateModule=function(...args){if(!closed&&args[0]?.file?.startsWith(server.config.root)&&/\.(tsx?|jsx?)$/.test(args[0].file))safe(()=>ledger.invalidate());return Reflect.apply(originals.invalidate,this,args);};
 const middleware={route:'',handle(req,res,next){
  const request={url:req.url,result:null},chunks=[];let bytes=0,overflow=captures.size>=64,done=false,finishHook=false;const write=res.write,end=res.end;
  const cleanup=()=>{if(done)return;done=true;retainedBytes-=bytes;bytes=0;chunks.length=0;captures.delete(cleanup);res.off('finish',finish);res.off('close',cleanup);res.off(errorMonitor,cleanup);req.off?.('aborted',cleanup);};
  const finish=()=>{
   if(done)return;
   try{if(!closed&&res.statusCode===200&&req.method==='GET'&&/javascript|ecmascript|text\/html/i.test(String(res.getHeader('content-type')||'')))safe(()=>{
    if(overflow){error('Trusted response capture budget');return;}
    const raw=Buffer.concat(chunks),body=raw.toString('utf8');if(!Buffer.from(body).equals(raw)){error('Noncanonical UTF-8 response');return;}
    const url='http://127.0.0.1:4173'+request.url,kind=/text\/html/i.test(String(res.getHeader('content-type')))?'document':'script';
    onBody(url,body,kind);
    if(request.result&&!receiptOverflow){const claim=ledger.receipt(request.result,body,url);if(receipts.length<256)receipts.push({url,claim});else receiptOverflow=true;}
   });}finally{cleanup();}
  };
  if(!overflow)captures.add(cleanup);else error('Trusted response active budget');
  res.once('close',cleanup);res.once(errorMonitor,cleanup);req.once?.('aborted',cleanup);
  const remember=(chunk,encoding,isEnd=false)=>{
   if(done||overflow||chunk==null||(isEnd&&typeof chunk==='function'))return;
   safe(()=>{
    if(types.isProxy(chunk)||!(typeof chunk==='string'||Buffer.isBuffer(chunk))){overflow=true;error('Unsupported response chunk');return;}
    const size=typeof chunk==='string'?Buffer.byteLength(chunk,typeof encoding==='string'?encoding:undefined):chunk.length;
    if(!size)return;
    if(chunks.length>=4096||bytes+size>2*1024*1024||retainedBytes+size>8*1024*1024){overflow=true;retainedBytes-=bytes;bytes=0;chunks.length=0;return;}
    const b=typeof chunk==='string'?Buffer.from(chunk,typeof encoding==='string'?encoding:undefined):Buffer.from(chunk);
    bytes+=b.length;retainedBytes+=b.length;chunks.push(b);
   });
  };
  res.write=function(...args){remember(args[0],args[1]);return Reflect.apply(write,this,args);};
  res.end=function(...args){remember(args[0],args[1],true);if(!done&&!finishHook){finishHook=true;res.once('finish',finish);}return Reflect.apply(end,this,args);};
  return als.run({request,calls:[]},()=>next());
 }};
 server.middlewares.stack.unshift(middleware);
 return {receipts,errors,implementationDigest,captureState:()=>({active:captures.size,retainedBytes}),close(){closed=true;for(const cleanup of captures)cleanup();env.transformRequest=originals.request;container.transform=originals.transform;observer.transform=originals.stage;graph.updateModuleTransformResult=originals.update;graph.invalidateModule=originals.invalidate;const i=server.middlewares.stack.indexOf(middleware);if(i>=0)server.middlewares.stack.splice(i,1);}};
}
