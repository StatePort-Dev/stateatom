import {makeDiagnostic,retainDiagnostics,recordDiagnosticExperiment} from '../core/diagnostic.mjs';
import {resolveInspection} from '../core/basic-analysis.mjs';
import {observeDeep,handleDeepOverlay,deepExperiment} from '../stateatom-phase2/engine/browser.mjs';
import {putSample,beginInspection,isCurrentInspection,lockExperiment,unlockExperiment,recordStale} from '../core/runtime-state.mjs';
import {observeElement} from './adapters.js';
import {assessExperiment,flatten,edge} from '../core/evidence.mjs';
let diagnosticQueue=Promise.resolve();
function diagnostics(update){const task=diagnosticQueue.then(async()=>{const stored=await chrome.storage.local.get("diagnostics");const list=retainDiagnostics(stored.diagnostics,null);const result=update?update(list):list;await chrome.storage.local.set({diagnostics:result});return result;});diagnosticQueue=task.catch(()=>{});return task;}
let tabs={},pairing=null;const ready=chrome.storage.session.get(['tabs','pairing']).then(x=>{tabs=x.tabs||{};pairing=x.pairing||null;});
const allowed=url=>{try{return /^http:\/\/127\.0\.0\.1:(4173|4174|4175)$/.test(new URL(url).origin);}catch{return false;}};
const persist=()=>{for(const s of Object.values(tabs)){cap(s);if(s.deepExperiment&&JSON.stringify(s.deepExperiment).length>400000)s.deepExperiment={id:s.deepExperiment.id,status:s.deepExperiment.status,scope:s.deepExperiment.scope,details:'full trials returned to panel; omitted from session buffer'};if(s.experiment&&JSON.stringify(s.experiment).length>512000)s.experiment={status:s.experiment.status,reason:s.experiment.reason,experimentId:s.experiment.experimentId,field:s.experiment.field,selector:s.experiment.selector,identity:s.experiment.identity,details:'full trials returned in operation result; omitted from session buffer'};}while(Object.keys(tabs).length>3||JSON.stringify(tabs).length>5000000){const oldest=Object.entries(tabs).sort((a,b)=>(a[1].lastTouched||0)-(b[1].lastTouched||0))[0];if(!oldest)break;delete tabs[oldest[0]];}return chrome.storage.session.set({tabs,pairing});};
const send=(id,method,params={})=>chrome.debugger.sendCommand({tabId:id},method,params);
function state(id){const s=tabs[id]??={requests:[],pending:{},samples:[],sampleEntries:{},run:crypto.randomUUID(),attached:false,events:[],selection:null,override:null};s.lastTouched=Date.now();return s;}
function cap(s){const cutoff=Date.now()-300000;if(s.diagnosticExperiment?.result.completedAt<cutoff)s.diagnosticExperiment=null;if(s.stale?.at<cutoff)s.stale=null;if(s.sampleEntries){for(const[k,e]of Object.entries(s.sampleEntries))if(e.at<cutoff)delete s.sampleEntries[k];s.samples=Object.values(s.sampleEntries).map(e=>e.text);}if(s.analysisAt&&s.analysisAt<cutoff){s.analysis=null;s.selection=null;s.experiment=null;}if(s.experiment?.completedAt&&s.experiment.completedAt<cutoff)s.experiment=null;s.requests=s.requests.filter(x=>x.time>cutoff).slice(-32);while(JSON.stringify(s.requests).length>256000)s.requests.shift();s.samples=s.samples.slice(-50);while(s.samples.join('').length>800000)s.samples.shift();if(Object.keys(s.pending).length>64)s.pending={};s.events=s.events.slice(-30);}
async function bridge(op,body){if(!pairing)throw Error('Pair IDE first');const response=await fetch(pairing.url+'/'+op,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+pairing.token},body:JSON.stringify(body)});const r=await response.json();if(!r.ok)throw Error(r.error);return r.result;}
async function attach(id){const tab=await chrome.tabs.get(id);if(!allowed(tab.url))throw Error('Synthetic local origins only');const s=state(id);s.origin=new URL(tab.url).origin;if(s.attached){try{await send(id,'Network.enable');return;}catch{s.attached=false;}}await chrome.debugger.attach({tabId:id},'1.3');s.attached=true;s.origin=new URL(tab.url).origin;
 await send(id,'Network.enable',{maxTotalBufferSize:2000000,maxResourceBufferSize:512000});await send(id,'Debugger.enable',{maxScriptsCacheSize:2000000});await send(id,'Page.enable');await send(id,'Performance.enable');await send(id,'Network.setCacheDisabled',{cacheDisabled:true});await persist();}
async function sample(id,url,text,key=url,kind='executable',run){const s=state(id);if(run&&s.run!==run)return;if(!allowed(url)||url.includes('/node_modules/')||url.includes('/@vite/')||text.length>256000)return;
 putSample(s,url,text,key,kind);cap(s);}
chrome.debugger.onEvent.addListener((source,method,p)=>{void (async()=>{await ready;const id=source.tabId,s=state(id),eventRun=s.run;try{
 if(method==='Page.frameNavigated'&&!p.frame.parentId){recordStale(s,'navigation/reload; previous execution invalidated');s.mainFrameId=p.frame.id;s.requests=[];s.pending={};s.requestOrdinals={};s.requestCounts={};s.samples=[];s.sampleEntries={};s.run=crypto.randomUUID();s.analysis=null;s.selection=null;s.experiment=null;beginInspection(s,{keepDiagnostic:true});if(allowed(p.frame.url))s.origin=new URL(p.frame.url).origin;else{s.origin=null;s.override=null;s.attached=false;await chrome.debugger.detach({tabId:id}).catch(()=>{});}}
 if(method==='Debugger.scriptParsed'&&allowed(p.url)&&!p.url.includes('/node_modules/')&&!p.url.includes('/@vite/')){
  if(p.sourceMapURL?.startsWith('data:')){try{const raw=p.sourceMapURL.split(',')[1],map=JSON.parse(p.sourceMapURL.includes(';base64')?atob(raw):decodeURIComponent(raw));for(const [i,text]of (map.sourcesContent||[]).entries())if(text)await sample(id,p.url,text,map.sources?.[i]||p.url,'map-claim',eventRun);}catch{}}
  const r=await send(id,'Debugger.getScriptSource',{scriptId:p.scriptId});const generated=new URL(p.url);generated.searchParams.set('__executedCode','1');await sample(id,p.url,r.scriptSource,generated.href,'executable',eventRun);
 }
 if(method==='Network.requestWillBeSent'&&p.type==='Fetch'&&(!s.mainFrameId||p.frameId===s.mainFrameId)){s.requestOrdinals??={};s.requestCounts??={};const u=p.request.url;s.requestOrdinals[p.requestId]=s.requestCounts[u]=(s.requestCounts[u]||0)+1;}
 if(method==='Network.responseReceived'&&allowed(p.response.url)&&p.type==='Fetch'){s.pending[p.requestId]={id:p.requestId,url:p.response.url,status:p.response.status,mime:p.response.mimeType,time:Date.now()};}
 if(method==='Network.loadingFinished'&&s.pending[p.requestId]){const r=s.pending[p.requestId];delete s.pending[p.requestId];if(p.encodedDataLength<512000){try{const body=await send(id,'Network.getResponseBody',{requestId:p.requestId});const text=body.base64Encoded?atob(body.body):body.body;if(text.length<128000){r.json=JSON.parse(text);if(s.run!==eventRun)return;s.requests.push(r);cap(s);}}catch{}}}
 if(method==='Fetch.requestPaused'){
  if(await handleDeepOverlay(id,p,s,send))return;
  const o=s.override;if(o&&p.request.url===o.url&&p.responseStatusCode&&!o.consumed){
   const response=await send(id,'Fetch.getResponseBody',{requestId:p.requestId});let json=JSON.parse(response.base64Encoded?atob(response.body):response.body);const keys=o.path.split('.');if(keys.some(k=>['__proto__','prototype','constructor'].includes(k)))throw Error('Unsafe field');let obj=json;for(const k of keys.slice(0,-1)){if(!Object.hasOwn(obj,k))throw Error('Missing field');obj=obj[k];}if(!Object.hasOwn(obj,keys.at(-1)))throw Error('Missing leaf');obj[keys.at(-1)]=o.value;
   const text=JSON.stringify(json);o.consumed++;o.actual=json;const bytes=new TextEncoder().encode(text);const body=btoa(String.fromCharCode(...bytes));
   await send(id,'Fetch.fulfillRequest',{requestId:p.requestId,responseCode:p.responseStatusCode,responseHeaders:(p.responseHeaders||[]).filter(h=>!['content-length','content-encoding','transfer-encoding','etag'].includes(h.name.toLowerCase())),body});s.lastOverride=structuredClone(o);
  }else await send(id,'Fetch.continueRequest',{requestId:p.requestId});
 }
 }catch(e){s.events.push({method,error:e.message});if(method==='Fetch.requestPaused')try{await send(id,'Fetch.continueRequest',{requestId:p.requestId});}catch{}}
 })();});
chrome.debugger.onDetach.addListener((source,reason)=>{void(async()=>{await ready;if(reason==='target_closed'){delete tabs[source.tabId];await persist();return;}const s=state(source.tabId);recordStale(s,'Debugger detached; inspect again');s.attached=false;s.override=null;s.analysis=null;s.experiment=null;beginInspection(s,{keepDiagnostic:true});s.events.push({detach:reason});await persist();})();});
chrome.action.onClicked.addListener(()=>chrome.tabs.create({url:chrome.runtime.getURL('panel.html')}));
async function inspect(id,selector){const s=state(id);if(s.busy)throw Error('Experiment running; selection denied');const generation=beginInspection(s),run=s.run;const r=await chrome.scripting.executeScript({target:{tabId:id},world:'MAIN',func:observeElement,args:[selector,!!pairing]});const selection=r[0].result;
 if(selection.unsupported)throw Error(selection.unsupported);
 selection.tabId=id;Object.assign(selection,await observeDeep(id,selection,s.property||'text',{includeTrace:!!pairing}));
 const identity={run,build:await hashText([...s.samples].sort().join('')),freshness:'DOM observation; source unverified'};const analysis=await resolveInspection({selection,requests:s.requests,identity,resolve:pairing?async()=>bridge('analyze',{origin:s.origin,selection,requests:s.requests,samples:s.samples,deepTrace:selection.trace,proofs:await Promise.all(Object.entries(s.sampleEntries||{}).map(async([url,e])=>({url,kind:e.kind,digest:await hashText(e.text)}))),run}):undefined});if(!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');s.selection=selection;s.analysis=analysis;s.stale=null;s.analysisAt=Date.now();
 s.analysis.graph.nodes.push({...s.selection,id:'dom-observation',elementId:s.selection.id});s.analysis.graph.edges.push(edge('ui','dom-observation',(selection.property||'text')+'-at-selection','Observed','MAIN DOM read',['dom-observation'],s.analysis.graph.identity));
 await persist();return s.analysis;}
async function readText(id,selector){const r=await chrome.scripting.executeScript({target:{tabId:id},func:(selector)=>{const e=selector.split(' >>> ').reduce((r,p,i)=>i?r?.shadowRoot?.querySelector(p):document.querySelector(p),null);return e?.textContent?.trim()??null;},args:[selector]});return r[0].result;}
async function reset(id,override){const s=state(id);s.override=override?{...override,consumed:0}:null;s.lastOverride=null;
 if(override)await send(id,'Fetch.enable',{patterns:[{urlPattern:override.url,requestStage:'Response'}]});else if(s.deepOverrides)await send(id,'Fetch.enable',{patterns:s.deepOverrides.map(o=>({urlPattern:o.url,requestStage:'Response'}))});else await send(id,'Fetch.disable');
 await send(id,'Network.clearBrowserCache');await send(id,'Storage.clearDataForOrigin',{origin:s.origin,storageTypes:'local_storage,indexeddb,cache_storage,service_workers'});await chrome.tabs.reload(id,{bypassCache:true});
 await new Promise((resolve,reject)=>{let done=false;const timeout=setTimeout(()=>{done=true;chrome.tabs.onUpdated.removeListener(f);reject(Error('Reload timeout'));},15000);function f(tabId,info){if(tabId===id&&info.status==='complete'&&!done){done=true;clearTimeout(timeout);chrome.tabs.onUpdated.removeListener(f);resolve();}}chrome.tabs.onUpdated.addListener(f);});
}
async function stable(id,selector){let old=null,n=0;for(let i=0;i<80;i++){await new Promise(r=>setTimeout(r,50));const t=await readText(id,selector);if(t&&t!=='Loading'&&t===old)n++;else n=0;old=t;if(n>=2)return t;}throw Error('UI did not settle');}
async function hashText(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
async function replay(id,selector,actions,override){
 if(!actions.length&&!override)return;await stable(id,selector);const s=state(id);if(override){s.override={...override,consumed:0};s.lastOverride=null;await send(id,'Fetch.enable',{patterns:[{urlPattern:override.url,requestStage:'Response'}]});}
 for(const target of actions){await chrome.scripting.executeScript({target:{tabId:id},func:selector=>{const el=document.querySelector(selector);if(!el)throw Error('Replay click target missing');el.click();},args:[target]});await new Promise(r=>setTimeout(r,150));}
}
async function experiment(id,field,value,actions=[]){const s=state(id);if(!s.selection)throw Error('Select an element first');const selection=structuredClone(s.selection),selector=selection.selector;
 if(!s.requests.some(r=>r.id===field.requestId&&r.url===field.url&&flatten(r.json).some(f=>f.path===field.path)))throw Error('Select observed response field');
 if(!Array.isArray(actions)||actions.length>4||actions.some(x=>typeof x!=='string'||x.length>256))throw Error('At most four click selectors');const experimentId=lockExperiment(s);const trials=[];let result;const originalIdentity=structuredClone(s.analysis.graph.identity);const checkpoint=async(text)=>({text,requests:structuredClone(s.requests),run:s.run,build:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode([...s.samples].sort().join(''))))).map(x=>x.toString(16).padStart(2,'0')).join(''),at:Date.now()});
 try{for(let i=0;i<3;i++){
  await reset(id,null);await replay(id,selector,actions);const a=await stable(id,selector),baseline=await checkpoint(a);
  await reset(id,actions.length?null:{url:field.url,path:field.path,value});await replay(id,selector,actions,actions.length?{url:field.url,path:field.path,value}:null);const b=await stable(id,selector),mutation=structuredClone(s.lastOverride),mutated=await checkpoint(b);
  await reset(id,null);await replay(id,selector,actions);const rollback=await stable(id,selector),restored=await checkpoint(rollback);
  // Irrelevant control chosen explicitly in product UI; must exist in the SAME response.
  const controlPath=s.controlPath;if(!controlPath||controlPath===field.path)throw Error('Choose distinct irrelevant control path');
  await reset(id,actions.length?null:{url:field.url,path:controlPath,value:'xray-control'});await replay(id,selector,actions,actions.length?{url:field.url,path:controlPath,value:'xray-control'}:null);const control=await stable(id,selector),controlMutation=structuredClone(s.lastOverride),controlled=await checkpoint(control);
  trials.push({build:baseline.build,a,b,rollback,control,checkpoints:{baseline,mutated,restored,controlled},buildStable:new Set([baseline.build,mutated.build,restored.build,controlled.build]).size===1,consumed:mutation?.consumed||0,controlConsumed:controlMutation?.consumed||0,reset:true,mutation,controlMutation,actions:['clear cache/storage','reload',...actions.map(s=>'programmatic click '+s),'wait DOM stable'],selector});
 }result={...assessExperiment(trials,originalIdentity.build),completedAt:Date.now(),experimentId,field,selector,trials,identity:{...originalIdentity,run:experimentId,freshness:'trial-scoped'}};
 }finally{try{await reset(id,null);await replay(id,selector,actions);await stable(id,selector);s.selection=selection;}finally{unlockExperiment(s,experimentId);}}
 s.experiment=result;if(result.status==='Experimentally verified'){
  result.edge=edge('ui','response:'+field.url+'#'+field.path,'influence',result.status,'3 ABA + irrelevant-field controls',['experiment:'+experimentId],result.identity);
  result.edge.conditions=['synthetic local app','reload and storage/cache reset','selected DOM text only','does not verify intermediate execution'];
 }await persist();return result;
}
chrome.runtime.onMessage.addListener((m,sender,reply)=>{void(async()=>{await ready;
 try{
  // Content scripts may only submit a picker selection; privileged operations require an extension page.
  const privileged=sender.id===chrome.runtime.id&&sender.url===chrome.runtime.getURL('panel.html');if(!privileged&&m.op!=='selected')throw Error('Page sender denied '+JSON.stringify({id:sender.id,url:sender.url,origin:sender.origin,tab:!!sender.tab}));
  let result;const id=m.tabId;if(id&&state(id).busy&&!['state','tabs','metrics'].includes(m.op))throw Error('Experiment running; conflicting action denied');
  if(m.op==='pair'){if(!/^http:\/\/127\.0\.0\.1:47731$/.test(m.url))throw Error('Bridge URL denied');pairing={url:m.url,token:m.token};try{result=await bridge('pair',{origin:m.origin,sourceRoot:m.sourceRoot});}catch(e){pairing=null;throw e;}await persist();}
  else if(m.op==='save-diagnostic'){const current=state(id);cap(current);if(!current.selection&&!current.stale?.target)throw Error('Observation unavailable or expired; inspect again');const report=makeDiagnostic(current,{includeContent:m.includeContent===true,notes:m.notes});await diagnostics(list=>retainDiagnostics(list,report));result=report;}
  else if(m.op==='list-diagnostics')result=await diagnostics();
  else if(m.op==='delete-diagnostic')result=await diagnostics(list=>list.filter(r=>r.id!==m.id));
  else if(m.op==='unpair'){pairing=null;for(const s of Object.values(tabs)){recordStale(s,'IDE disconnected; inspect again');beginInspection(s,{keepDiagnostic:true});}await persist();result={paired:false};}
  else if(m.op==='tabs')result=(await chrome.tabs.query({})).filter(t=>allowed(t.url)).map(t=>({id:t.id,url:t.url}));
  else if(m.op==='attach'){await attach(id);result={attached:true};}
  else if(m.op==='pick')result=await chrome.tabs.sendMessage(id,{op:'pick'});
  else if(m.op==='selected'){if(!sender.tab||!allowed(sender.tab.url))throw Error('Selection sender denied');result=await inspect(sender.tab.id,m.selector);chrome.runtime.sendMessage({event:'selection',tabId:sender.tab.id}).catch(()=>{});}
  else if(m.op==='deep-experiment'){const s=state(id);if(!s.selection)throw Error('Select target');const selected=structuredClone(s.selection),lock=lockExperiment(s);try{result=await deepExperiment({id,s,send,reset,selection:s.selection,variants:m.variants,includeTrace:!!pairing});s.deepExperiment=result;s.diagnosticExperiment=recordDiagnosticExperiment(selected,result);await persist();}finally{unlockExperiment(s,lock);}}
  else if(m.op==='restore'){const s=state(id),selection=structuredClone(s.selection),lock=lockExperiment(s);try{s.deepOverrides=null;await reset(id,null);await new Promise(r=>setTimeout(r,400));result=await observeDeep(id,selection,selection?.property||'text',{includeTrace:!!pairing});s.selection=selection?{...selection,...result}:null;}finally{unlockExperiment(s,lock);}}
  else if(m.op==='property'){if(!['text','disabled'].includes(m.property))throw Error('Unsupported property');const s=state(id);if(s.property!==m.property){recordStale(s,'Property changed; inspect again');beginInspection(s);}s.property=m.property;result={property:m.property};}
  else if(m.op==='inspect-selector'){if(typeof m.selector!=='string'||m.selector.length>1024)throw Error('Selector limit');const tab=await chrome.tabs.get(id);if(!allowed(tab.url))throw Error('Origin denied');result=await inspect(id,m.selector);}
  else if(m.op==='state'){const s=state(id);cap(s);if(m.refreshDeep&&s.analysis?.stateatom&&s.selection){const current=await observeDeep(id,s.selection,s.property||'text',{includeTrace:s.analysis.capabilities?.sourceResolver==='open-ide'});if(current.trace?.status==='Stale'){s.analysis.stateatom.runtime.status='Stale';s.analysis.stateatom.runtime.reason=current.trace.reason;}}result={...s,samples:undefined,pending:undefined,bufferBytes:JSON.stringify(s.requests).length,sampleEntries:undefined,sampleBytes:s.samples.join('').length};}
  else if(m.op==='open'||m.op==='definitions'||m.op==='references'){const s=state(id);result=await bridge(m.op,{origin:s.origin,...m.source});}
  else if(m.op==='experiment'){state(id).controlPath=m.controlPath;result=await experiment(id,m.field,m.value,m.actions);}
  else if(m.op==='detach'){const s=state(id);recordStale(s,'Debugger detached; inspect again');if(s.attached)await chrome.debugger.detach({tabId:id});s.attached=false;s.override=null;s.analysis=null;s.experiment=null;beginInspection(s);s.events.push({detach:'explicit user action'});await persist();result={detached:true};}
  else if(m.op==='metrics')result=await send(id,'Performance.getMetrics');
  else throw Error('Unsupported operation');reply({ok:true,result});
 }catch(e){reply({ok:false,error:e.message});}
 })();return true;});

chrome.tabs.onRemoved.addListener(id=>{delete tabs[id];void persist();});
