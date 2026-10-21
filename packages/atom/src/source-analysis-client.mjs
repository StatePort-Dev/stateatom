// SPDX-License-Identifier: Apache-2.0
// Only the owned document starts a fixed local Worker; no synchronous fallback.
const enc=new TextEncoder(),limit=65536,budget=1500;
const gap=(reason,status='Unavailable')=>({schema:'stateatom.source-function-analysis/1',status,entry:null,calls:[],identifiers:[],expression:null,graph:{nodes:[],edges:[]},execution:'not-observed',runtimeValues:'Unavailable',propertyProducer:'Unknown/Unsupported',httpOrigin:'Unknown/Unsupported',scope:'Bounded lexical source relationships only',gaps:[reason]});
const resultKeys=['schema','status','entry','calls','identifiers','expression','graph','execution','runtimeValues','propertyProducer','httpOrigin','scope','gaps'].sort().join(',');
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const source=v=>object(v)&&typeof v.file==='string'&&/^stateatom-source:\/\/(?:user-map|ide-owned)\/[a-f\d]{64}\/\d+$/i.test(v.file)&&Number(v.file.split('/').at(-1))<512&&['line','column','endLine','endColumn'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=1)&&v.endLine>=v.line&&(v.endLine!==v.line||v.endColumn>=v.column)&&typeof v.sourceDigest==='string'&&/^[a-f\d]{64}$/i.test(v.sourceDigest);
function dataOnly(value){
 let count=0;const forbidden=new Set(['ast','type','body','loc','tokens','comments','content','text','files','serialized','sourcesContent','analysisInput','__proto__','constructor','prototype']);
 function walk(v,depth){if(++count>8192||depth>10)return false;if(v===null||['string','boolean'].includes(typeof v))return true;if(typeof v==='number')return Number.isFinite(v);if(Array.isArray(v))return v.every(x=>walk(x,depth+1));if(!object(v)||['Observed','Experimentally verified'].includes(v.status))return false;return Object.entries(v).every(([k,x])=>!forbidden.has(k)&&walk(x,depth+1));}return walk(value,0);
}
function validResult(r){try{
 if(!r||Object.keys(r).sort().join(',')!==resultKeys||r.schema!=='stateatom.source-function-analysis/1'||!['Available','Partial','Unavailable','Budget','Cancelled'].includes(r.status)||r.execution!=='not-observed'||r.runtimeValues!=='Unavailable'||r.propertyProducer!=='Unknown/Unsupported'||r.httpOrigin!=='Unknown/Unsupported'||!Array.isArray(r.calls)||r.calls.length>8||!Array.isArray(r.identifiers)||r.identifiers.length>64||!Array.isArray(r.gaps)||r.gaps.length>80||r.gaps.some(v=>typeof v!=='string'||v.length>512)||(r.expression!==null&&(typeof r.expression!=='string'||r.expression.length>400))||enc.encode(JSON.stringify(r)).length>limit||!dataOnly(r))return false;
 if(['Available','Partial'].includes(r.status)){if(!object(r.entry)||r.entry.status!=='Code-linked'||!(r.entry.symbol===null||typeof r.entry.symbol==='string')||!source(r.entry.source))return false;}else if(r.entry!==null||r.calls.length||r.identifiers.length||r.expression!==null)return false;
 if(r.calls.some(c=>!object(c)||c.status!=='Candidate'||!['Code-linked','Unknown/Unsupported'].includes(c.targetStatus)||typeof c.symbol!=='string'||typeof c.expression!=='string'||c.expression.length>100||!source(c.callSource)||c.targetStatus==='Code-linked'&&!source(c.source)))return false;
 if(r.identifiers.some(v=>!object(v)||typeof v.name!=='string'||typeof v.kind!=='string'||typeof v.constant!=='boolean'||v.runtimeValue!=='Unavailable'||v.source!==null&&!source(v.source)))return false;
 const g=r.graph;if(!object(g)||Object.keys(g).some(k=>!['identity','nodes','edges'].includes(k))||!Array.isArray(g.nodes)||g.nodes.length>65||!Array.isArray(g.edges)||g.edges.length>64)return false;const ids=new Set(g.nodes.map(n=>n.id));return ids.size===g.nodes.length&&g.edges.every(e=>object(e)&&['Code-linked','Candidate'].includes(e.status)&&ids.has(e.from)&&ids.has(e.to));
 }catch{return false;}}

function ownedURL(value,baseURL){try{const base=new URL(baseURL),u=new URL(value,base);if(!['chrome-extension:','https:','http:'].includes(base.protocol)||u.protocol!==base.protocol||u.host!==base.host||u.username||u.password||u.href.includes('?')||u.href.includes('#')||!u.pathname.endsWith('/source-analysis-worker.js'))return null;return u.href;}catch{return null;}}
export function createSourceAnalysisClient({url,baseURL,Worker=globalThis.Worker,setTimer=setTimeout,clearTimer=clearTimeout}={}){
 let active=null,disposed=false;const asset=typeof url==='string'?ownedURL(url,baseURL):null;
 const cancel=()=>active?.finish(gap('Source analysis cancelled','Cancelled'));
 return{available:!!asset&&typeof Worker==='function',analyze(input,{signal}={}){
  cancel();if(disposed||!asset||typeof Worker!=='function')return Promise.resolve(gap('Source analysis unavailable in this inspector'));
  if(signal?.aborted)return Promise.resolve(gap('Source analysis cancelled','Cancelled'));
  return new Promise(resolve=>{
   let worker,timer,done=false;const id=crypto.randomUUID(),abort=()=>finish(gap('Source analysis cancelled','Cancelled'));
   const finish=result=>{if(done)return;done=true;clearTimer(timer);signal?.removeEventListener('abort',abort);worker?.terminate();if(active?.id===id)active=null;resolve(result);};active={id,finish};
   try{worker=new Worker(asset,{type:'module',name:'stateatom-source-analysis'});
    worker.addEventListener('message',event=>{const m=event.data;if(!m||Object.keys(m).sort().join(',')!=='id,result,schema'||m.schema!=='stateatom.source-analysis-reply/1'||m.id!==id||!validResult(m.result))finish(gap('Source analysis response unavailable'));else finish(m.result);});
    worker.addEventListener('error',event=>{event.preventDefault?.();finish(gap('Source analysis unavailable in this inspector'));});
    worker.addEventListener('messageerror',()=>finish(gap('Source analysis response unavailable')));
    signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}
    timer=setTimer(()=>finish(gap('Source analysis time budget exceeded','Budget')),budget);
    worker.postMessage({schema:'stateatom.source-analysis-request/1',id,input});
   }catch{finish(gap('Source analysis unavailable in this inspector'));}
  });
 },cancel,dispose(){disposed=true;cancel();}};
}
