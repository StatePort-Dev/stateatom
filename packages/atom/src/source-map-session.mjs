// SPDX-License-Identifier: Apache-2.0
import {associateSourceMap,createReleaseMapIndex,readSourceBundle,lookupSource,sourceExcerpt,sourceDigest,jsonBytes,validateManifest,MAP_LIMITS,parseSourceMap} from '../../../core/source-maps.mjs';
import {restoreSourceMap} from '../../../core/source-parse-job.mjs';
import {sourceParseError,validSourceParseResult} from '../../../core/source-parse-contract.mjs';
import {isCurrentGeneratedAnchor} from '../../../core/source-anchor.mjs';
import {createReadOnlySourceProvider} from '../../../core/source-provider.mjs';
import {ARCHIVE_LIMITS} from '../../../core/source-map-archive.mjs';
import {isDevelopmentOrigin} from './capabilities.mjs';
const enc=new TextEncoder(),ttl=300000,MAX_SCRIPTS=128;
const CACHE_BYTES=8*1024*1024,MAX_PARSED_MAPS=8;
export function sourceMapURL(input,base){let u;try{u=new URL(input,base);}catch{throw Error('Invalid source-map URL');}if(u.username||u.password||u.hash||!(u.protocol==='https:'||isDevelopmentOrigin(u.href)))throw Error('Source-map URL requires HTTPS (or a supported synthetic localhost)');return u;}
export function createSourceMapSession({send,fetch,permitted,onChange=()=>{},processArtifact}={}){
 const tabs=new Map();
 const process=async(operation,bytes,options)=>{const result=await processArtifact(operation,bytes,options);if(!validSourceParseResult(result,operation))throw sourceParseError('SOURCE_PARSE_INVALID');return result.value;};
 const parseMap=processArtifact?async(bytes,options)=>restoreSourceMap(await process('map',bytes,options)):parseSourceMap;
 const readBundle=async(bytes,name,options)=>processArtifact&&/\.zip$/i.test(name)?process('bundle',bytes,options):readSourceBundle(bytes,name,options);
 function own(s,signal){const c=new AbortController(),abort=()=>c.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)c.abort();s.controllers.add(c);return{c,close(){signal?.removeEventListener('abort',abort);s.controllers.delete(c);}};}
 function replaceWork(s){s.generation++;for(const c of s.controllers)c.abort();s.controllers.clear();return s.generation;}

 function state(id){const s=tabs.get(id);if(!s)throw Error('Attach this tab before connecting source maps');if(Date.now()-s.at>ttl){invalidate(id,'Session expired; reconnect source maps');s.at=Date.now();}return s;}
 function script(id,scriptId){const s=state(id),r=s.scripts.get(scriptId);if(s.status==='Stale')throw Error('Stale source session; attach again');if(!r)throw Error('Choose a loaded script');return {s,r};}
 function current(id,s,r,generation){if(tabs.get(id)!==s||s.status==='Stale'||s.generation!==generation||s.scripts.get(r.scriptId)!==r)throw Error('Stale source-map operation; reconnect');}
 function touch(id,s){s.at=Date.now();clearTimeout(s.timer);s.timer=setTimeout(()=>{invalidate(id,'Source session expired; reconnect');onChange(id);},ttl);s.timer?.unref?.();}
 function invalidate(id,reason){const s=tabs.get(id);if(!s)return;clearTimeout(s.timer);s.status='Stale';s.reason=reason;s.generation++;s.releaseIndex?.close();s.releaseIndex=null;for(const r of s.scripts.values()){r.parsed=null;if(r.map)r.map={...r.map,status:'Stale',reason};}s.lookup=null;for(const c of s.controllers)c.abort();s.controllers.clear();}
 async function content(id,s,r,g,{signal}={}){const check=()=>{current(id,s,r,g);if(signal?.aborted)throw Error('Source lookup cancelled');};check();if(r.length>MAP_LIMITS.bytes)throw Error('Loaded script source size budget');const got=await send(id,'Debugger.getScriptSource',{scriptId:r.scriptId});check();if(typeof got.scriptSource!=='string'||got.scriptSource.length>MAP_LIMITS.bytes||enc.encode(got.scriptSource).length>MAP_LIMITS.bytes)throw Error('Loaded script source unavailable or exceeds budget');const digest=await sourceDigest(enc.encode(got.scriptSource));check();r.digest=digest;r.digestDomain='utf8-script-source';}
 function parsedEntries(s){const unique=new Map();for(const r of s.scripts.values())if(r.parsed&&!unique.has(r.parsed))unique.set(r.parsed,{parsed:r.parsed,mapDigest:r.map?.mapDigest,bytes:r.bytes||0,used:s.parsedUse?.get(r.parsed)||0});return[...unique.values()];}
 function cacheInfo(s){const entries=parsedEntries(s),index=s.releaseIndex?.describe();return{budgetBytes:CACHE_BYTES,retainedMapBytes:index?.retainedBytes||0,parsedInputBytes:index?.parsedInputBytes??entries.reduce((n,e)=>n+e.bytes,0),parsedMaps:index?.parsedMaps??entries.length};}
 function used(s,r){if(r.parsed){s.parsedUse??=new WeakMap();s.cacheClock=(s.cacheClock||0)+1;s.parsedUse.set(r.parsed,s.cacheClock);}}
 function releaseUnused(s,index,digest){if(digest&&!parsedEntries(s).some(e=>e.mapDigest===digest))index.release(digest);}
 function reserve(s,index,match){
  const entries=parsedEntries(s);if(entries.some(e=>e.mapDigest===match.mapDigest))return;
  let bytes=entries.reduce((n,e)=>n+e.bytes,0),count=entries.length;const retained=index.describe().retainedBytes;
  for(const entry of entries.sort((a,b)=>a.used-b.used)){
   if(retained+bytes+match.mapBytes<=CACHE_BYTES&&count<MAX_PARSED_MAPS)break;
   for(const r of s.scripts.values())if(r.parsed===entry.parsed)r.parsed=null;
   releaseUnused(s,index,entry.mapDigest);bytes-=entry.bytes;count--;
  }
  if(retained+bytes+match.mapBytes>CACHE_BYTES||count>=MAX_PARSED_MAPS)throw Error('Release index and parsed-map cache budget');
 }
 function retireConnection(s){s.releaseIndex?.close();s.releaseIndex=null;for(const other of s.scripts.values()){if(other.map){s.history.push({scriptId:other.scriptId,status:'Stale',mapDigest:other.map.mapDigest});other.map={...other.map,status:'Stale',reason:'Explicit source connection replaced'};}other.parsed=null;}s.history=s.history.slice(-8);s.lookup=null;}
 function assign(r,result,bytes){r.map={status:result.status,reason:result.reason,mapDigest:result.mapDigest,manifestDigest:result.manifestDigest,verificationMethod:result.verificationMethod,hasContent:result.parsed?.hasContent??false,sourceCount:result.parsed?.sourceCount??0,releaseId:result.releaseId,mappingLines:result.parsed?.lines.length??0};r.parsed=result.status==='Mismatch'?null:result.parsed;r.bytes=bytes;}
 function releaseGap(r,index,error){r.parsed=null;r.bytes=0;r.map={status:['NO_RELEASE_MATCH','RELEASE_ARTIFACT_MISMATCH'].includes(error.code)?'Mismatch':'Unavailable',reason:error.message,mapDigest:null,manifestDigest:index.describe().manifestDigest,verificationMethod:'unverified-artifact-association',hasContent:false,sourceCount:0,releaseId:null,mappingLines:0};}
 function markKnownMismatches(s,index){for(const other of s.scripts.values())if(other.digest){const match=index.find(other.digest);if(match.status!=='Unique')releaseGap(other,index,Object.assign(Error(match.status==='Missing'?'No matching artifact in the new release bundle for this loaded script':'Ambiguous release assets; no unique map for this loaded script'),{code:match.status==='Missing'?'NO_RELEASE_MATCH':'AMBIGUOUS_RELEASE_MAP'}));}}
 async function install(id,s,r,g,bundles,{signal}={}){
  const check=()=>{if(signal?.aborted)throw Error('Source import cancelled');current(id,s,r,g);};check();
  if(bundles.length&&bundles.every(b=>b.asset&&b.assetBytes&&b.manifestDigest)){
   const index=await createReleaseMapIndex(bundles,{signal,assertCurrent:check,parseMap});let result;
   try{result=await index.associate(r,{signal,assertCurrent:check});check();}catch(error){if(error.code!=='NO_RELEASE_MATCH'){index.close();throw error;}check();retireConnection(s);s.releaseIndex=index;releaseGap(r,index,error);markKnownMismatches(s,index);touch(id,s);return snapshot(id);}
   retireConnection(s);s.releaseIndex=index;const match=index.find(r.digest);assign(r,result,match.mapBytes);markKnownMismatches(s,index);used(s,r);touch(id,s);return snapshot(id);
  }
  current(id,s,r,g);let candidates=bundles;
  if(bundles.length>1){const matches=[];for(const b of bundles)if(b.assetBytes&&await sourceDigest(enc.encode(new TextDecoder('utf-8',{fatal:true}).decode(b.assetBytes)))===r.digest)matches.push(b);candidates=matches;if(candidates.length!==1)throw Error('Bundle does not identify one map for this loaded script; select its .map separately');}
  const candidate=candidates[0];if(!candidate)throw Error('No map for this script');const result=await associateSourceMap(r,candidate,{parseMap,signal});check();
  // Replacing an artifact invalidates its old lookup. The old association remains bounded history.
  if(s.releaseIndex)retireConnection(s);if(r.map)s.history.push({scriptId:r.scriptId,status:'Stale',mapDigest:r.map.mapDigest});s.history=s.history.slice(-8);s.lookup=null;
  assign(r,result,candidate.mapBytes.length);
  const mapped=[...s.scripts.values()].filter(x=>x.parsed);if(mapped.length>8||mapped.reduce((n,x)=>n+(x.bytes||0),0)>8*1024*1024){r.parsed=null;r.map={...r.map,status:'Unavailable',reason:'Parsed-map memory budget; clear cached maps'};}
  used(s,r);touch(id,s);return snapshot(id);
 }
 async function ensure(id,scriptId,{signal}={}){
  const {s,r}=script(id,scriptId),g=s.generation,owner=own(s,signal),jobSignal=owner.c.signal,work=async()=>{
  const stillCurrent=()=>{if(jobSignal.aborted)throw Error('Source lookup cancelled');current(id,s,r,g);};stillCurrent();
  if(r.parsed&&r.map&&!['Mismatch','Stale','Unavailable'].includes(r.map.status)){used(s,r);return snapshot(id);}
  const index=s.releaseIndex;if(!index)throw Error('Connect a usable source map or release bundle');
  const check=()=>{if(jobSignal.aborted)throw Error('Source lookup cancelled');current(id,s,r,g);if(s.releaseIndex!==index)throw Error('Release source connection changed');};
  check();if(!r.digest)await content(id,s,r,g,{signal:jobSignal});check();
  const match=index.find(r.digest);
  try{if(match.status==='Unique')reserve(s,index,match);const result=await index.associate(r,{signal:jobSignal,assertCurrent:check});check();assign(r,result,match.mapBytes);used(s,r);touch(id,s);if(result.status==='Mismatch')throw Object.assign(Error(result.reason),{code:'RELEASE_ARTIFACT_MISMATCH'});return snapshot(id);}
  catch(error){releaseUnused(s,index,match.mapDigest);check();releaseGap(r,index,error);throw error;}
  };
  const job=(s.sourceQueue||Promise.resolve()).then(work);s.sourceQueue=job.then(()=>undefined,()=>undefined);return job.finally(()=>owner.close());
 }
 async function importBundle(id,scriptId,bytes,name,{signal}={}){if(bytes.length>ARCHIVE_LIMITS.compressed)throw Error('Import size budget');const {s,r}=script(id,scriptId),g=replaceWork(s),owner=own(s,signal),jobSignal=owner.c.signal;try{await content(id,s,r,g,{signal:jobSignal});const bundles=await readBundle(bytes,name,{signal:jobSignal});if(jobSignal.aborted)throw Error('Source import cancelled');return await install(id,s,r,g,bundles,{signal:jobSignal});}finally{owner.close();}}
 async function download(id,s,r,g,input,signal){
  const u=sourceMapURL(input);if(!await permitted(u.origin))throw Error('Origin permission required for source-map download');current(id,s,r,g);if(signal.aborted)throw Error('Cancelled');
  let response;try{response=await fetch(u.href,{credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',cache:'no-store',signal});}catch{throw Error('Map download unavailable: network, redirect, SSO or browser policy');}
  current(id,s,r,g);if(!response.ok)throw Error('Map download HTTP '+response.status);if(response.redirected||response.url&&new URL(response.url).origin!==u.origin)throw Error('Map redirect denied');
  if(Number(response.headers.get('content-length'))>ARCHIVE_LIMITS.compressed)throw Error('Download size budget');
  const reader=response.body?.getReader();if(!reader)throw Error('Empty artifact response');const chunks=[];let n=0;
  try{for(;;){const p=await reader.read();if(signal.aborted)throw Error('Cancelled');current(id,s,r,g);if(p.done)break;n+=p.value.length;if(n>ARCHIVE_LIMITS.compressed)throw Error('Download size budget');chunks.push(p.value);}}finally{await reader.cancel().catch(()=>{});}
  const bytes=new Uint8Array(n);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length;}return {bytes,url:u};
 }
 async function acquire(id,scriptId,url,{signal}={}){
  const {s,r}=script(id,scriptId),g=replaceWork(s),owner=own(s,signal),c=owner.c;const timer=setTimeout(()=>c.abort(),10000);
  try{
   // A missing URL means discovery, limited to the selected script's own origin.
   let input=url;if(!input){if(!r.sourceMapURL)throw Error('No declared map reference for this script');const u=sourceMapURL(r.sourceMapURL,r.url);if(u.origin!==new URL(r.url).origin)throw Error('Cross-origin map requires an explicit URL and origin permission');input=u.href;}
   const got=await download(id,s,r,g,input,c.signal);await content(id,s,r,g,{signal:c.signal});let bundles;
   if(got.url.pathname.endsWith('.zip'))bundles=await readBundle(got.bytes,'release.zip',{signal:c.signal});
   else {const data=processArtifact?await process('manifest',got.bytes,{signal:c.signal}):jsonBytes(got.bytes);if(data?.schemaVersion===1){const m=validateManifest(data),pathname=new URL(r.url).pathname,assets=m.assets.filter(a=>pathname.endsWith('/'+a.asset));if(assets.length!==1)throw Error('Manifest needs one asset for this loaded script URL');const a=assets[0],au=sourceMapURL(a.asset,got.url),mu=sourceMapURL(a.sourceMap,got.url);if(au.origin!==got.url.origin||mu.origin!==got.url.origin)throw Error('Manifest artifact origin denied');const ab=await download(id,s,r,g,au.href,c.signal),mb=await download(id,s,r,g,mu.href,c.signal);bundles=[{asset:a,assetBytes:ab.bytes,mapBytes:mb.bytes,releaseId:m.releaseId,manifestDigest:await sourceDigest(got.bytes)}];}else bundles=[{mapBytes:got.bytes}];}
   if(c.signal.aborted)throw Error('Map acquisition cancelled or timed out');return await install(id,s,r,g,bundles,{signal:c.signal});
  }finally{clearTimeout(timer);owner.close();}
 }
 async function lookupAnchor(id,anchor,input,{signal,includeAnalysisInput=false}={}){
  if(!isCurrentGeneratedAnchor(anchor,input)||anchor.identity.tabId!==id)throw Error('Current native source anchor required');
  const {s,r}=script(id,anchor.generated.scriptId),g=s.generation;
  const check=()=>{if(signal?.aborted)throw Error('Source view cancelled');const maps=snapshot(id);current(id,s,r,g);if(!isCurrentGeneratedAnchor(anchor,input)||!isCurrentGeneratedAnchor(anchor,{context:input.context,binding:input.binding,maps}))throw Error('Stale native source anchor or changed inspection');};
  check();if(!r.parsed||!r.map||['Mismatch','Stale','Unavailable'].includes(r.map.status))throw Error('Connect a usable source map for this registered listener script');
  const host=anchor.relation==='selected-react-compatible-host-callback-generated-location',pos=lookupSource(r.parsed,anchor.generated.line,anchor.generated.column),base={anchor,match:r.map.status,verificationMethod:r.map.verificationMethod,execution:'not-observed',callbackIdentity:'Unknown/Unsupported',propertyProducer:'Unknown/Unsupported',httpOrigin:'Unknown/Unsupported',operands:'not observed'};
  if(pos.status==='Unavailable')return{...base,...pos,contentStatus:'Unavailable',excerpt:null,sourceDigest:null};
  let provider;
  try{
   const serialized=JSON.stringify({schema:'stateatom.readonly-source-files/1',kind:'user-map',ownerDigest:r.map.mapDigest,files:r.parsed.sources.map((source,index)=>({index,source,content:r.parsed.sourcesContent[index]??null}))});
   provider=await createReadOnlySourceProvider(serialized,{signal});
   check();const descriptor=provider.list().find(f=>f.index===pos.sourceIndex);if(!descriptor)throw Error('Mapped original source index is unavailable');
   const file=provider.read(descriptor.key),excerpt=file.status==='Available'?sourceExcerpt(file.content,pos.line,pos.column):null,invalid=file.status==='Available'&&excerpt===null;
   const analysisInput=includeAnalysisInput===true&&!invalid&&file.status==='Available'?{schema:'stateatom.source-analysis-input/1',serialized,point:{file:descriptor.key,line:pos.line,column:pos.column},identity:{run:anchor.identity.run,build:anchor.identity.build}}:null;
   check();return{...base,source:pos.source,sourceIndex:pos.sourceIndex,sourceKey:descriptor.key,line:pos.line,column:pos.column,name:pos.name,sourceDigest:file.sourceDigest??null,sourceDigestDomain:file.sourceDigestDomain??null,contentStatus:file.status,excerpt,status:invalid?'Unavailable':r.map.status==='Exact artifact match'?'Code-linked':'Candidate',link:invalid?'not linked to original source content':r.map.status==='Exact artifact match'?(host?'selected own host callback-slot location; renderer/version not attested':'selected native listener registered location'):(host?'selected own host callback-slot location; source mapping unverified; renderer/version not attested':'selected native listener location; source mapping unverified'),reason:invalid?'Mapped position is outside provided source content':file.status==='Unavailable'?'Map lacks source content; position only':r.map.reason,...(analysisInput?{analysisInput}:{})};
  }finally{provider?.close();}
 }
 function snapshot(id){const s=tabs.get(id);if(!s)return {status:'Unavailable',scripts:[],history:[],lookup:null,bundle:null,cache:{budgetBytes:CACHE_BYTES,retainedMapBytes:0,parsedInputBytes:0,parsedMaps:0}};state(id);return {status:s.status,epoch:s.epoch,reason:s.reason,history:s.history,bundle:s.releaseIndex?.describe()||null,cache:cacheInfo(s),lookup:s.lookup?{scriptId:s.lookup.scriptId,line:s.lookup.line,column:s.lookup.column,originalLine:s.lookup.originalLine,originalColumn:s.lookup.originalColumn,link:'not linked to element'}:null,scripts:[...s.scripts.values()].map(({parsed,bytes,...r})=>({...r}))};}
 return {begin(id,epoch){const old=tabs.get(id);if(old)invalidate(id,'New inspection epoch');tabs.set(id,{epoch,status:'Connected',reason:null,scripts:new Map(),contexts:new Map(),headerRefs:new Map(),generation:0,at:Date.now(),history:old?[...old.scripts.values()].filter(r=>r.map).slice(0,8).map(r=>({scriptId:r.scriptId,status:'Stale',mapDigest:r.map.mapDigest})):[],lookup:null,controllers:new Set()});touch(id,tabs.get(id));while(tabs.size>3){const oldest=tabs.keys().next().value;invalidate(oldest,'Evicted');tabs.delete(oldest);}},
  event(id,method,p){const s=tabs.get(id);if(!s||s.status==='Stale')return;
   if(method==='Runtime.executionContextCreated'){const c=p.context;if(c?.id)s.contexts.set(c.id,c.auxData?.frameId||null);}
   if(method==='Runtime.executionContextsCleared'){invalidate(id,'Execution contexts replaced');return true;}
   if(method==='Runtime.executionContextDestroyed'){if([...s.scripts.values()].some(r=>r.executionContextId===p.executionContextId)){invalidate(id,'Script execution context destroyed');return true;}return;}
   if(method==='Network.responseReceived'&&p.type==='Script'){const h=p.response?.headers||{},ref=Object.entries(h).find(([k])=>['sourcemap','x-sourcemap'].includes(k.toLowerCase()))?.[1];if(typeof ref==='string'&&ref.length<=4096&&p.response.url?.length<=4096){if(s.headerRefs.size<128)s.headerRefs.set(p.response.url,ref);for(const r of s.scripts.values())if(r.url===p.response.url&&!r.sourceMapURL)r.sourceMapURL=ref;return true;}}
   if(method==='Debugger.scriptParsed'){
    if(!p.scriptId||p.isLiveEdit){if(p.isLiveEdit){invalidate(id,'Live script replacement');return true;}return;}
    let u;try{u=new URL(p.url);if(!['http:','https:'].includes(u.protocol))return;}catch{return;}
    if(!s.scripts.has(p.scriptId)&&s.scripts.size>=MAX_SCRIPTS){s.reason='Script inventory truncated at 128 scripts';return;}
    const old=s.scripts.get(p.scriptId);if(old){s.generation++;s.lookup=null;}
    s.scripts.set(p.scriptId,{scriptId:p.scriptId,length:Number.isSafeInteger(p.length)?p.length:null,url:p.url.slice(0,4096),executionContextId:p.executionContextId,frameId:s.contexts.get(p.executionContextId)||null,cdpHash:typeof p.hash==='string'?p.hash.slice(0,128):null,cdpHashDomain:'v8-script-content-sha256',buildId:typeof p.buildId==='string'?p.buildId.slice(0,128):null,startLine:p.startLine??0,startColumn:p.startColumn??0,endLine:p.endLine,endColumn:p.endColumn,special:!!p.hasSourceURL||p.startLine!==0||p.startColumn!==0,sourceMapURL:typeof p.sourceMapURL==='string'&&p.sourceMapURL.length<=4096?p.sourceMapURL:s.headerRefs.get(p.url)||null,map:null});
    if(old?.parsed&&s.releaseIndex)releaseUnused(s,s.releaseIndex,old.map?.mapDigest);return true;
   }
  },snapshot,import:importBundle,acquire,ensure,lookupAnchor,
  lookup(id,scriptId,line,column){const {s,r}=script(id,scriptId);if(!r.parsed)throw Error('No usable map; connect a matching artifact');const pos=lookupSource(r.parsed,line,column);s.lookup={scriptId,line,column,originalLine:pos.line??null,originalColumn:pos.column??null};return {...pos,match:r.map.status,reason:r.map.reason};},
  invalidate,clear(id){const s=tabs.get(id);if(s){s.generation++;s.releaseIndex?.close();s.releaseIndex=null;for(const c of s.controllers)c.abort();for(const r of s.scripts.values()){r.parsed=null;r.map=null;r.bytes=0;}s.lookup=null;s.history=[];}},remove(id){invalidate(id,'Tab closed');tabs.delete(id);},dispose(){for(const id of tabs.keys())invalidate(id,'Session ended');tabs.clear();}
 };
}
