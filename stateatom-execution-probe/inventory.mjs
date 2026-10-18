// SPDX-License-Identifier: Apache-2.0
// Acquisition-only Node harness model; no page authority or field-ancestry claims.
import {createHash,randomUUID} from 'node:crypto';
const digest=text=>createHash('sha256').update(text).digest('hex');
const local=url=>typeof url==='string'&&/^http:\/\/127\.0\.0\.1:4173\//.test(url)&&url.length<4096;
export function inventory({armedBeforeNavigation=false,maxScripts=256,maxBytes=8*1024*1024,maxReceipts=256}={}){
 const session= randomUUID(),startedAt=new Date().toISOString();
 const contexts=new Map(),scripts=new Map(),receipts=new Map(),failures=new Set();let generation=0,bytes=0,receiptCount=0;
 if(!armedBeforeNavigation)failures.add('History before attachment unavailable');
 const failure=reason=>{failures.add(reason);generation++;};
 const context=c=>{generation++;if(!c?.uniqueId||!Number.isInteger(c.id)){failure('Context identity unavailable');return;}if(contexts.has(c.id)&&contexts.get(c.id).uniqueId!==c.uniqueId){failure('Context ID reused');return;}if(contexts.size>=64){failure('Context budget exceeded');return;}contexts.set(c.id,{id:c.id,uniqueId:c.uniqueId,isDefault:typeof c.auxData?.isDefault==='boolean'?c.auxData.isDefault:null,frameId:c.auxData?.frameId});};
 const receipt=(url,text,kind)=>{generation++;if(!local(url)||typeof text!=='string'||!['script','document'].includes(kind)){failure('Unrecognized trusted receipt');return;}const hash=digest(text),key=kind+':'+hash,list=receipts.get(url)||new Map();if(list.has(key))return;if(++receiptCount>maxReceipts||bytes+Buffer.byteLength(text)>maxBytes){failure('Receipt budget exceeded');return;}bytes+=Buffer.byteLength(text);list.set(key,{kind,digest:hash,text});receipts.set(url,list);};
 const parsed=p=>{generation++;if(!p?.scriptId||scripts.has(p.scriptId)){failure('Missing or reused script identity');return;}if(scripts.size>=maxScripts){failure('Script budget exceeded');return;}const c=contexts.get(p.executionContextId);if(!c)failure('Script context unavailable');scripts.set(p.scriptId,{...p,contextUniqueId:c?.uniqueId,pending:true});};
 const source=(id,text)=>{generation++;const s=scripts.get(id);if(!s){failure('Source without captured script identity');return;}if(!s.pending){failure('Duplicate source completion');return;}if(typeof text!=='string'||bytes+Buffer.byteLength(text)>maxBytes){failure('Compiled source unavailable or budget exceeded');return;}bytes+=Buffer.byteLength(text);s.sourceDigest=digest(text);s.text=text;s.pending=false;};
 const script=(p,text)=>{parsed(p);source(p?.scriptId,text);};
 function span(text,p){if(![p.startLine,p.startColumn,p.endLine,p.endColumn].every(Number.isInteger))return null;const lines=text.split('\n');if(p.startLine<0||p.endLine>=lines.length||p.startColumn<0||p.endColumn<0||p.endLine<p.startLine||p.startColumn>lines[p.startLine].length||p.endColumn>lines[p.endLine].length)return null;const start=lines.slice(0,p.startLine).reduce((n,l)=>n+l.length+1,0)+p.startColumn,end=lines.slice(0,p.endLine).reduce((n,l)=>n+l.length+1,0)+p.endColumn;if(end<start)return null;const before=text.slice(0,start),after=text.slice(end);if(!/<script\b[^<>]*>$/i.test(before)||!/^<\/script\s*>/i.test(after)||/\bsrc\s*=/i.test(before.match(/<script\b[^<>]*>$/i)[0]))return null;return text.slice(start,end);}
 function checkpoint(mainFrameId){
  const reasons=new Set(failures),records=[];let excluded=0;if(!mainFrameId)reasons.add('Main frame unavailable');
  for(const c of contexts.values())if(c.isDefault&&c.frameId!==mainFrameId)reasons.add('Other default frame/realm present');
  for(const s of scripts.values()){
   const c=contexts.get(s.executionContextId);
   const record={scriptId:s.scriptId,url:s.url,sourceDigest:s.sourceDigest,contextUniqueId:s.contextUniqueId,executionContextId:s.executionContextId,frameId:c?.frameId,match:false};
   if(!c||c.uniqueId!==s.contextUniqueId){record.reason='Compiled context identity lost';reasons.add(record.reason);records.push(record);continue;}
   if(c.isDefault===false){excluded++;continue;}records.push(record);
   if(s.pending){record.reason='Compiled source lookup pending';reasons.add(record.reason);continue;}
   if(c.isDefault!==true||!c.frameId){record.reason='Context world/frame metadata unavailable';reasons.add(record.reason);continue;}
   if(!local(s.url)||s.hasSourceURL===true){reasons.add('Anonymous/dynamic/sourceURL executable is not a trusted response');continue;}
   const candidates=[...(receipts.get(s.url)?.values()||[])];if(candidates.length!==1){reasons.add('Missing or competing trusted response revision');continue;}
   const r=candidates[0];record.receiptDigest=r.digest;record.match=r.kind==='script'?r.text===s.text:span(r.text,s)===s.text;
   if(!record.match)reasons.add('Compiled bytes differ from exact trusted response/span');
  }
  if(!records.length)reasons.add('No main-world compiled scripts captured');
  return {session,startedAt,checkpointAt:new Date().toISOString(),counts:{captured:scripts.size,pendingSources:[...scripts.values()].filter(s=>s.pending).length,matched:records.filter(r=>r.match).length,unknown:records.filter(r=>!r.match).length,excludedIsolated:excluded,receipts:receiptCount},status:reasons.size?'Unknown/Unsupported':'Matched captured compiled main-world inventory',generation,mainFrameId,scripts:records,reasons:[...reasons],fullPath:false,readonlyEffects:'Unknown/Unsupported',scope:'Captured compiled default main-world scripts through this checkpoint only; isolated worlds excluded. Content match does not prove response-to-script creator or actual execution. Not whole-page closure, source equivalence, future-code exclusion, readonly effects or runtime attestation.'};
 }
 const destroyed=id=>{generation++;if([...scripts.values()].some(s=>s.executionContextId===id))failure('Compiled-script context destroyed');contexts.delete(id);};
const cleared=()=>{generation++;if(scripts.size)failure('Compiled context history cleared');contexts.clear();};
 return {context,receipt,script,parsed,source,failure,destroyed,cleared,version:()=>generation,checkpoint,current:checkpoint=>checkpoint.generation===generation};
}
