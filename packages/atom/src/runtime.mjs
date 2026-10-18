import {inspectNativeActions} from '../../../core/action-native.mjs';
import {declareOwnedCode,ownedInjectionSource,bindOwnedFetchCode} from '../../../core/owned-code.mjs';
import {newCodeJournal,journalEvent,journalSource,journalReadySources,journalGap,journalSnapshot,journalView} from '../../../core/code-journal.mjs';
import {newFetchBindings,fetchBindingEvent,fetchScriptSource,bindFetchTrace,allowsFetchGeneration,installFetchPolicy} from '../../../core/fetch-bindings.mjs';
import {makeDiagnostic,retainDiagnostics,recordDiagnosticExperiment,recordTextExperiment} from '../../../core/diagnostic.mjs';
import {resolveInspection} from '../../../core/basic-analysis.mjs';
import {createBrowserEngine,handleDeepOverlay,isSameSelection} from "../../../src/engine/browser.mjs";
import {putSample,beginInspection,isCurrentInspection,lockExperiment,unlockExperiment,recordStale} from '../../../core/runtime-state.mjs';
import {observeElement} from '../../../browser-extension/adapters.js';
import {assessExperiment,flatten,edge} from '../../../core/evidence.mjs';
import {atomError} from './platform.mjs';
import {validateRequest} from './transport.mjs';
export function createAtomRuntime(platform, options={}) {
const chrome=platform.chrome,fetch=platform.fetch;
const {observeDeep,deepExperiment,identifySelection}=createBrowserEngine(chrome);
const pickers=new Map();
let stopped=false,eventsClosed=false,shutdownPromise;const jobs=new Map(),eventJobs=new Set();
let diagnosticQueue=Promise.resolve();
function diagnostics(update){const task=diagnosticQueue.then(async()=>{const stored=await chrome.storage.local.get("diagnostics");const list=retainDiagnostics(stored.diagnostics,null);const result=update?update(list):list;await chrome.storage.local.set({diagnostics:result});return result;});diagnosticQueue=task.catch(()=>{});return task;}
const workerIncarnation=crypto.randomUUID(),journalPending=new Map();
let tabs={},pairing=null;const ready=Promise.resolve(platform.ready).then(()=>chrome.storage.session.get(['tabs','pairing'])).then(x=>{tabs=x.tabs||{};pairing=x.pairing||null;for(const s of Object.values(tabs)){s.attached=false;recordStale(s,'Worker restarted; attach and inspect again');s.inspectionGeneration=(s.inspectionGeneration||0)+1;s.override=null;s.deepOverrides=null;s.busy=null;s.codeJournal=newCodeJournal(s.run,{debuggerSession:s.codeJournal?.debuggerSession,incarnation:workerIncarnation});journalGap(s.codeJournal,'worker-restart');}});
async function ownMainCode(id,s,operation,role){const j=s.codeJournal,contexts=Object.values(j?.contexts||{}).filter(c=>c.isDefault===true&&c.frameId===s.mainFrameId);if(contexts.length!==1){if(j)journalGap(j,'owned-code-unavailable');return;}await declareOwnedCode(j,role,ownedInjectionSource(operation.func,operation.args||[]),contexts[0].uniqueId);}
function codeState(s,options={}){return newCodeJournal(s.run,{debuggerSession:s.codeJournal?.debuggerSession,incarnation:workerIncarnation,...options});}
function codeAnalysis(s){if(!s.analysis)return null;const codeJournal=journalView(s.analysis.codeJournal,s.codeJournal),profile=s.analysis.stateatom?.firstReadProfile;return {...s.analysis,codeJournal,actionBindings:(s.analysis.actionBindings||[]).map(b=>s.analysis.actionsInvalidated||s.analysis.actionContext?.sourceGeneration!==(s.sourceGeneration||0)?{...b,freshness:'Stale'}:b),...(profile&&codeJournal?.freshness==='Stale'?{stateatom:{...s.analysis.stateatom,firstReadProfile:{...profile,status:'Stale',freshness:'Stale',fullPath:false,reason:'Code history changed or expired; inspect again'}}}:{})};}
function codeEligible(id,s,store=s.codeJournal){return tabs[id]===s&&s.attached===true&&allowed(s.origin)&&s.codeJournal===store;}
function acquireCode(id,s,store,scriptId){
 if(!codeEligible(id,s,store))return;
 const tasks=journalPending.get(store)||new Set();journalPending.set(store,tasks);
 const task=(async()=>{try{const r=await send(id,'Debugger.getScriptSource',{scriptId});if(codeEligible(id,s,store))await journalSource(store,scriptId,r.scriptSource,undefined,()=>codeEligible(id,s,store));}catch{if(codeEligible(id,s,store))await journalSource(store,scriptId,null);}})();
 tasks.add(task);void task.finally(()=>{tasks.delete(task);if(codeEligible(id,s,store))for(const next of journalReadySources(store))acquireCode(id,s,store,next);if(!tasks.size)journalPending.delete(store);});
}
function collectCode(id,s,method,p){
 if(!codeEligible(id,s))return;
 const store=s.codeJournal??=codeState(s),scriptId=journalEvent(store,method,p);if(scriptId)acquireCode(id,s,store,scriptId);
}
async function drainCode(id,s){
 const store=s.codeJournal,deadline=Date.now()+2000;if(!store||!s.attached)return;
 let timer;const exhausted=Symbol();
 try{for(let i=0;i<8;i++){const generation=store.generation,remaining=deadline-Date.now();if(remaining<=0)break;
  const work=(async()=>{await send(id,'Runtime.getIsolateId');await Promise.all([...(journalPending.get(store)||[])]);await send(id,'Runtime.getIsolateId');})();
  const r=await Promise.race([work,new Promise(resolve=>{timer=setTimeout(()=>resolve(exhausted),remaining);})]);clearTimeout(timer);if(r===exhausted)break;
  if(s.codeJournal!==store)return;if(!journalPending.get(store)?.size&&generation===store.generation)return;
 }}catch{/* An undrained acquisition is an explicit gap, never raw CDP error text. */}finally{clearTimeout(timer);}
 if(s.codeJournal===store)journalGap(store,'drain-budget');
}
const allowed=url=>{try{return /^http:\/\/127\.0\.0\.1:(4173|4174|4175)$/.test(new URL(url).origin);}catch{return false;}};
const persist=()=>{for(const s of Object.values(tabs)){cap(s);if(s.deepExperiment&&JSON.stringify(s.deepExperiment).length>400000)s.deepExperiment={id:s.deepExperiment.id,status:s.deepExperiment.status,scope:s.deepExperiment.scope,details:'full trials returned to panel; omitted from session buffer'};if(s.experiment&&JSON.stringify(s.experiment).length>512000)s.experiment={status:s.experiment.status,reason:s.experiment.reason,experimentId:s.experiment.experimentId,field:s.experiment.field,selector:s.experiment.selector,identity:s.experiment.identity,details:'full trials returned in operation result; omitted from session buffer'};}while(Object.keys(tabs).length>3||JSON.stringify(tabs).length>5000000){const oldest=Object.entries(tabs).sort((a,b)=>(a[1].lastTouched||0)-(b[1].lastTouched||0))[0];if(!oldest)break;delete tabs[oldest[0]];}return chrome.storage.session.set({tabs,pairing});};
const notifyInvalidation=id=>chrome.runtime.sendMessage({event:'state-invalidated',tabId:id}).catch(()=>{});
const send=(id,method,params={})=>chrome.debugger.sendCommand({tabId:id},method,params);
function state(id){const s=tabs[id]??={requests:[],pending:{},samples:[],sampleEntries:{},run:crypto.randomUUID(),attached:false,events:[],selection:null,override:null};s.fetchBindings??=newFetchBindings(s.run);s.codeJournal??=codeState(s);s.lastTouched=Date.now();return s;}
function cap(s){const cutoff=Date.now()-300000;if(s.codeJournal?.startedAt<cutoff)journalGap(s.codeJournal,'expired');if(s.fetchBindings?.startedAt<cutoff)s.fetchBindings={...newFetchBindings(s.run),overflow:true};if(s.diagnosticExperiment?.result.completedAt<cutoff)s.diagnosticExperiment=null;if(s.stale?.at<cutoff)s.stale=null;if(s.sampleEntries){for(const[k,e]of Object.entries(s.sampleEntries))if(e.at<cutoff)delete s.sampleEntries[k];s.samples=Object.values(s.sampleEntries).map(e=>e.text);}if(s.analysisAt&&s.analysisAt<cutoff){s.analysis=null;s.selection=null;s.experiment=null;}if(s.experiment?.completedAt&&s.experiment.completedAt<cutoff)s.experiment=null;s.requests=s.requests.filter(x=>x.time>cutoff).slice(-32);while(JSON.stringify(s.requests).length>256000)s.requests.shift();s.samples=s.samples.slice(-50);while(s.samples.join('').length>800000)s.samples.shift();if(Object.keys(s.pending).length>64)s.pending={};s.events=s.events.slice(-30);}
async function bridge(op,body,signal){if(!pairing)throw Error('Pair IDE first');const response=await fetch(pairing.url+'/'+op,{method:'POST',signal,headers:{'content-type':'application/json',authorization:'Bearer '+pairing.token},body:JSON.stringify(body)});const r=await response.json();if(!r.ok)throw Error(r.error);return r.result;}
async function permitFetchGeneration(id,s){
 const policy=s.documentPolicies?.[s.mainLoaderId],run=s.run;if(!policy||policy.frameId!==s.mainFrameId)return;
 const contexts=Object.values(s.fetchBindings.contexts).filter(c=>c.frameId===s.mainFrameId&&c.isDefault&&typeof c.uniqueId==='string');if(contexts.length!==1)return;
 const uniqueContextId=contexts[0].uniqueId;
 try{const current=(await send(id,'Page.getFrameTree')).frameTree.frame;
  if(s.run!==run||s.documentPolicies?.[s.mainLoaderId]!==policy||current.id!==policy.frameId||current.loaderId!==policy.loaderId)return;
  const declaration=installFetchPolicy.toString();for(const source of[declaration,'('+declaration+')','('+declaration+'\n)'])await declareOwnedCode(s.codeJournal,'fetch-policy-helper',source,uniqueContextId);if(s.run!==run)return;
  await send(id,'Runtime.callFunctionOn',{uniqueContextId,functionDeclaration:declaration,arguments:[{value:policy.allowed},{value:policy.url}],returnByValue:true});
 }catch{/* Missing/destroyed exact context stays unavailable. No Function capability test. */}
}
async function attach(id){const tab=await chrome.tabs.get(id);if(!allowed(tab.url))throw Error('Synthetic local origins only');await platform.authorize(id,'cache');const s=state(id);s.origin=new URL(tab.url).origin;if(s.attached){try{await send(id,'Network.enable');return;}catch{s.attached=false;}}await chrome.debugger.attach({tabId:id},'1.3');s.attached=true;s.origin=new URL(tab.url).origin;s.codeJournal=codeState(s,{debuggerSession:crypto.randomUUID()});
 await send(id,'Network.enable',{maxTotalBufferSize:2000000,maxResourceBufferSize:512000});await send(id,'Page.enable');await send(id,'Runtime.enable');await send(id,'Debugger.enable',{maxScriptsCacheSize:2000000});s.mainFrameId=(await send(id,'Page.getFrameTree')).frameTree.frame.id;await send(id,'Performance.enable');await send(id,'Network.setCacheDisabled',{cacheDisabled:true});await persist();}
async function sample(id,url,text,key=url,kind='executable',run){const s=state(id);if(run&&s.run!==run)return;if(!allowed(url)||url.includes('/node_modules/')||url.includes('/@vite/')||text.length>256000)return;
 const generation=s.sourceGeneration||0;putSample(s,url,text,key,kind);cap(s);if(s.analysis?.actionContext&&generation!==(s.sourceGeneration||0)){s.analysis.actionsInvalidated=true;notifyInvalidation(id);}}
async function onDebuggerEvent(source,method,p){await ready;if(platform.owns&&!platform.owns(source.tabId))return;const id=source.tabId,s=state(id),eventRun=s.run;try{
 if(method==='Page.frameNavigated'&&!p.frame.parentId){pickers.delete(id);recordStale(s,'navigation/reload; previous execution invalidated');s.mainFrameId=p.frame.id;s.mainLoaderId=p.frame.loaderId;s.requests=[];s.pending={};s.requestOrdinals={};s.requestCounts={};s.samples=[];s.sampleEntries={};s.run=crypto.randomUUID();s.codeJournal=codeState(s,{armedBeforeNavigation:s.attached===true});s.fetchBindings=newFetchBindings(s.run);s.analysis=null;s.selection=null;s.experiment=null;beginInspection(s,{keepDiagnostic:true});if(allowed(p.frame.url))s.origin=new URL(p.frame.url).origin;else{s.origin=null;s.override=null;s.attached=false;await chrome.debugger.detach({tabId:id}).catch(()=>{});}await persist();notifyInvalidation(id);await permitFetchGeneration(id,s);}
 collectCode(id,s,method,p);
 if(method==='Network.responseReceived'&&p.type==='Document'&&p.frameId===s.mainFrameId&&allowed(p.response.url)&&p.response.url.length<=1024){s.documentPolicies??={};s.documentPolicies[p.loaderId]={loaderId:p.loaderId,frameId:p.frameId,url:p.response.url,allowed:allowsFetchGeneration(p.response.headers)};while(Object.keys(s.documentPolicies).length>4)delete s.documentPolicies[Object.keys(s.documentPolicies)[0]];if(p.loaderId===s.mainLoaderId)await permitFetchGeneration(id,s);}
 const scriptId=fetchBindingEvent(s.fetchBindings,method,p);
 if(method==='Runtime.executionContextCreated'&&p.context?.auxData?.isDefault&&p.context.auxData.frameId===s.mainFrameId)await permitFetchGeneration(id,s);
 if(scriptId){const store=s.fetchBindings;const r=await send(id,'Debugger.getScriptSource',{scriptId});if(s.run===eventRun&&s.fetchBindings===store)fetchScriptSource(store,scriptId,r.scriptSource);}
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
}
async function onDebuggerDetach(source,reason){if(platform.owns&&!platform.owns(source.tabId))return;platform.detached(source.tabId);await ready;if(reason==='target_closed'){delete tabs[source.tabId];await persist();notifyInvalidation(source.tabId);return;}const s=state(source.tabId);recordStale(s,'Debugger detached; inspect again');s.attached=false;journalGap(s.codeJournal,'detach');s.fetchBindings=newFetchBindings(s.run);s.override=null;s.analysis=null;s.experiment=null;beginInspection(s,{keepDiagnostic:true});s.events.push({detach:reason});await persist();notifyInvalidation(source.tabId);}
async function inspect(id,selector,context){const s=state(id);if(s.busy)throw Error('Experiment running; selection denied');const generation=beginInspection(s),run=s.run,property=s.property||'text';if(context)context.inspection={s,id,generation,run};const before=await identifySelection(id,selector,property);const operation={target:{tabId:id},world:'MAIN',func:observeElement,args:[selector,!!pairing]};await ownMainCode(id,s,operation,'selection-helper');const r=await chrome.scripting.executeScript(operation);if(context?.documentId&&r[0]?.documentId!==context.documentId)throw atomError('SELECTION_EXPIRED','Picker document changed before inspection');const selection=r[0].result;
 if(selection.unsupported)throw Error(selection.unsupported);
 selection.tabId=id;Object.assign(selection,await observeDeep(id,selection,property,{includeTrace:!!pairing,beforeMainScript:(op,role)=>ownMainCode(id,s,op,role)}));
 if(selection.trace)selection.trace={...selection.trace,exchangeBindings:bindFetchTrace(selection.trace,s.fetchBindings,{mainFrameId:s.mainFrameId,run})};
 selection.domIdentity=await identifySelection(id,selector,property);
 if(tabs[id]!==s||!isCurrentInspection(s,generation,run)||!isSameSelection(before,selection.domIdentity)||selection.domIdentity.property!==selection.property||selection.domIdentity.value!==selection.value)throw Error('Selection changed during inspection; inspect again');
 let firstReadCode=null;if(selection.trace?.firstReadObservations){await drainCode(id,s);if(!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');await bindOwnedFetchCode(s.codeJournal,s.fetchBindings,{page:selection.trace.page,run,mainFrameId:s.mainFrameId});const tree=(await send(id,'Page.getFrameTree')).frameTree,tab=await chrome.tabs.get(id),targets=await chrome.debugger.getTargets(),nativeTarget=targets.find(t=>t.tabId===id);firstReadCode={targetId:nativeTarget?.id||null,extensionId:chrome.runtime.id,journal:journalSnapshot(s.codeJournal,{mainFrameId:s.mainFrameId,selectionGeneration:generation,observedAt:selection.observedAt}),frameCount:1+(tree.childFrames?.length||0),openerAbsent:!Number.isInteger(tab.openerTabId)};}
 const sourceGeneration=s.sourceGeneration||0;const identity={run,build:await hashText([...s.samples].sort().join('')),freshness:'DOM observation; source unverified'};const analysis=await resolveInspection({selection,requests:s.requests,identity,resolve:pairing?async()=>bridge('analyze',{origin:s.origin,selection,requests:s.requests,samples:s.samples,deepTrace:selection.trace,firstReadCode,proofs:await Promise.all(Object.entries(s.sampleEntries||{}).map(async([url,e])=>({url,kind:e.kind,digest:await hashText(e.text)}))),run},context?.signal):undefined});if(tabs[id]!==s||!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');await drainCode(id,s);if(tabs[id]!==s||!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');if(firstReadCode&&journalView(firstReadCode.journal,s.codeJournal).freshness!=='Recorded')throw Error('Code changed during inspection; inspect again');const native=s.attached?await inspectNativeActions((method,params)=>send(id,method,params),selector,identity):[];
 const current=await identifySelection(id,selector,property);if(!isCurrentInspection(s,generation,run)||!isSameSelection(selection.domIdentity,current))throw Error('Selected DOM changed during action inspection');
 if(sourceGeneration!==(s.sourceGeneration||0))throw Error('Source changed during action inspection; inspect again');
 analysis.actionContext={schema:1,tabId:id,frameId:s.mainFrameId||null,run,inspection:generation,sourceGeneration,document:selection.domIdentity.document,instance:selection.domIdentity.node,build:identity.build,observedAt:selection.observedAt};
 for(const b of native)if(b.status==='Observed'){const evidenceId=b.id+':registration';analysis.graph.nodes.push({id:b.id,kind:'listener-registration',...b.registration});analysis.graph.edges.push({id:evidenceId,...edge('ui',b.id,'registered-on-'+b.registeredOn,'Observed','CDP DOMDebugger.getEventListeners',[evidenceId],identity)});}
 analysis.actionBindings=[...(analysis.actionBindings||[]),...native].slice(0,24).map(b=>({...b,identity:{...analysis.actionContext,sourceRevision:b.binding?.source?.sourceDigest||null}}));
 if(tabs[id]!==s||!isCurrentInspection(s,generation,run))throw Error('Stale action result');
 analysis.codeJournal=journalSnapshot(s.codeJournal,{mainFrameId:s.mainFrameId,selectionGeneration:generation,observedAt:selection.observedAt});s.selection=selection;s.analysis=analysis;s.stale=null;s.analysisAt=Date.now();
 s.analysis.graph.nodes.push({...s.selection,id:'dom-observation',elementId:s.selection.id});s.analysis.graph.edges.push(edge('ui','dom-observation',(selection.property||'text')+'-at-selection','Observed','MAIN DOM read',['dom-observation'],s.analysis.graph.identity));
 await persist();if(tabs[id]!==s||!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');if(firstReadCode&&journalView(firstReadCode.journal,s.codeJournal).freshness!=='Recorded'){recordStale(s,'Code changed during inspection; inspect again');beginInspection(s,{keepDiagnostic:true});await persist();throw Error('Code changed during inspection; inspect again');}if(sourceGeneration!==(s.sourceGeneration||0)){recordStale(s,'Source changed during action inspection; inspect again');beginInspection(s,{keepDiagnostic:true});await persist();throw Error('Source changed during action inspection; inspect again');}return s.analysis;}
async function refreshActionSources(s,signal){
 if(!pairing||!s.analysis?.actionBindings?.some(b=>b.mechanism==='react-jsx'))return;
 const analysis=s.analysis,sources=new Map();
 for(const b of analysis.actionBindings){for(const loc of [b.binding?.source,b.entry?.source,...(b.calls||[]).map(c=>c.source),...(b.hookRelations||[]).map(h=>h.source)])if(loc)sources.set(loc.file,{file:loc.file,sourceDigest:loc.sourceDigest});}
 let current=false;try{current=(await bridge('check-action-sources',{origin:s.origin,sources:[...sources.values()]} ,signal)).current===true;}catch{/* Missing/changed source stays unavailable. */}
 if(s.analysis===analysis&&!current){analysis.actionBindings=analysis.actionBindings.map(b=>b.mechanism==='react-jsx'?{...b,freshness:'Stale'}:b);}
}
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
async function eligibleSelection(id,s){const selected=s.selection,generation=s.inspectionGeneration,run=s.run;
 if(!s.attached||!selected||!s.analysis||s.stale||s.analysis.stateatom?.runtime?.status==='Stale')throw Error('Current attached inspection required; inspect again');
 const current=await identifySelection(id,selected.selector,selected.property);
 if(s.selection!==selected||s.inspectionGeneration!==generation||s.run!==run||!isSameSelection(selected.domIdentity,current))throw Error('Selected DOM node or value changed; inspect again before experimenting');
}
async function experiment(id,field,value,actions=[],controlPath,signal){const s=state(id);await eligibleSelection(id,s);if(s.selection.property!=='text')throw Error('Response-field experiment supports text only');const selection=structuredClone(s.selection),selector=selection.selector;
 if(!s.requests.some(r=>r.id===field.requestId&&r.url===field.url&&flatten(r.json).some(f=>f.path===field.path)))throw Error('Select observed response field');
 if(typeof controlPath!=='string'||controlPath.length>512||controlPath===field.path)throw Error('Choose distinct irrelevant control path');
 if(!Array.isArray(actions)||actions.length>4||actions.some(x=>typeof x!=='string'||x.length>256))throw Error('At most four click selectors');const experimentId=lockExperiment(s);const trials=[];let result;const originalIdentity=structuredClone(s.analysis.graph.identity);const checkpoint=async(text)=>({text,requests:structuredClone(s.requests),run:s.run,build:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode([...s.samples].sort().join(''))))).map(x=>x.toString(16).padStart(2,'0')).join(''),at:Date.now()});
 try{for(let i=0;i<3;i++){if(signal?.aborted)throw atomError('CANCELLED');
  await reset(id,null);await replay(id,selector,actions);const a=await stable(id,selector),baseline=await checkpoint(a);
  if(signal?.aborted)throw atomError('CANCELLED');await reset(id,actions.length?null:{url:field.url,path:field.path,value});await replay(id,selector,actions,actions.length?{url:field.url,path:field.path,value}:null);const b=await stable(id,selector),mutation=structuredClone(s.lastOverride),mutated=await checkpoint(b);
  await reset(id,null);await replay(id,selector,actions);const rollback=await stable(id,selector),restored=await checkpoint(rollback);
  // Irrelevant control chosen explicitly in product UI; must exist in the SAME response.
  await reset(id,actions.length?null:{url:field.url,path:controlPath,value:'xray-control'});await replay(id,selector,actions,actions.length?{url:field.url,path:controlPath,value:'xray-control'}:null);const control=await stable(id,selector),controlMutation=structuredClone(s.lastOverride),controlled=await checkpoint(control);
  trials.push({build:baseline.build,a,b,rollback,control,checkpoints:{baseline,mutated,restored,controlled},buildStable:new Set([baseline.build,mutated.build,restored.build,controlled.build]).size===1,consumed:mutation?.consumed||0,controlConsumed:controlMutation?.consumed||0,reset:true,mutation,controlMutation,actions:['clear cache/storage','reload',...actions.map(s=>'programmatic click '+s),'wait DOM stable'],selector});
 }result={...assessExperiment(trials,originalIdentity.build),completedAt:Date.now(),experimentId,field,controlPath,selector,trials,identity:{...originalIdentity,run:experimentId,freshness:'trial-scoped'}};
 }finally{try{await reset(id,null);await replay(id,selector,actions);await stable(id,selector);s.selection=selection;}finally{unlockExperiment(s,experimentId);}}
 s.experiment=result;if(result.status==='Experimentally verified'){
  result.edge=edge('ui','response:'+field.url+'#'+field.path,'influence',result.status,'3 ABA + irrelevant-field controls',['experiment:'+experimentId],result.identity);
  result.edge.conditions=['synthetic local app','reload and storage/cache reset','selected DOM text only','does not verify intermediate execution'];
 }s.diagnosticExperiment=recordTextExperiment(selection,result);await persist();return result;
}
async function operation(m,context){const signal=context.signal;await ready;
 try{
  let result;const id=m.tabId;if(id&&state(id).busy&&!['state','tabs','metrics'].includes(m.op))throw Error('Experiment running; conflicting action denied');
  if(['deep-experiment','restore','experiment'].includes(m.op))for(const cap of ['reload','cache','override','replay'])await platform.authorize(id,cap);
  if(m.op==='pair'){if(!/^http:\/\/127\.0\.0\.1:47731$/.test(m.url))throw Error('Bridge URL denied');pairing={url:m.url,token:m.token};try{result=await bridge('pair',{origin:m.origin,sourceRoot:m.sourceRoot},signal);}catch(e){pairing=null;throw e;}await persist();}
  else if(m.op==='save-diagnostic'){const current=state(id);cap(current);if(!current.selection&&!current.stale?.target)throw Error('Observation unavailable or expired; inspect again');const report=makeDiagnostic({...current,analysis:codeAnalysis(current)},{includeContent:m.includeContent===true,notes:m.notes});await diagnostics(list=>retainDiagnostics(list,report));result=report;}
  else if(m.op==='list-diagnostics')result=await diagnostics();
  else if(m.op==='delete-diagnostic')result=await diagnostics(list=>list.filter(r=>r.id!==m.id));
  else if(m.op==='unpair'){pairing=null;for(const s of Object.values(tabs)){recordStale(s,'IDE disconnected; inspect again');beginInspection(s,{keepDiagnostic:true});}await persist();result={paired:false};}
  else if(m.op==='tabs')result=(await chrome.tabs.query({})).filter(t=>allowed(t.url)).map(t=>({id:t.id,url:t.url}));
  else if(m.op==='attach'){await attach(id);result={attached:true};}
  else if(m.op==='pick'){const token=crypto.randomUUID();pickers.set(id,{token,at:Date.now()});result=await chrome.tabs.sendMessage(id,{op:'pick',token});}
  else if(m.op==='selected'){const picker=pickers.get(id);pickers.delete(id);if(!picker||picker.token!==m.token||Date.now()-picker.at>30000)throw atomError('SELECTION_EXPIRED');context.documentId=m.documentId;result=await inspect(id,m.selector,context);chrome.runtime.sendMessage({event:'selection',tabId:id}).catch(()=>{});}
  else if(m.op==='deep-experiment'){const s=state(id);await eligibleSelection(id,s);const selected=structuredClone(s.selection),lock=lockExperiment(s);try{result=await deepExperiment({id,s,send,reset,selection:s.selection,variants:m.variants,signal,includeTrace:!!pairing,beforeMainScript:(op,role)=>ownMainCode(id,s,op,role)});s.deepExperiment=result;s.diagnosticExperiment=recordDiagnosticExperiment(selected,result);await persist();}finally{unlockExperiment(s,lock);}}
  else if(m.op==='restore'){const s=state(id),selection=structuredClone(s.selection),lock=lockExperiment(s);try{s.deepOverrides=null;await reset(id,null);await new Promise(r=>setTimeout(r,400));result=await observeDeep(id,selection,selection?.property||'text',{includeTrace:!!pairing,beforeMainScript:(op,role)=>ownMainCode(id,s,op,role)});s.selection=selection?{...selection,...result}:null;}finally{unlockExperiment(s,lock);}}
  else if(m.op==='property'){if(!['text','disabled'].includes(m.property))throw Error('Unsupported property');const s=state(id);if(s.property!==m.property){recordStale(s,'Property changed; inspect again');beginInspection(s);}s.property=m.property;result={property:m.property};}
  else if(m.op==='inspect-selector'){if(typeof m.selector!=='string'||m.selector.length>1024)throw Error('Selector limit');const tab=await chrome.tabs.get(id);if(!allowed(tab.url))throw Error('Origin denied');result=await inspect(id,m.selector,context);}
  else if(m.op==='state'){const s=state(id);cap(s);if(m.refreshDeep){const generation=s.inspectionGeneration,run=s.run;await refreshActionSources(s,signal);if(tabs[id]!==s||s.inspectionGeneration!==generation||s.run!==run)throw Error('Stale action source result');}if(m.refreshDeep&&s.selection&&s.analysis?.actionContext){const old=s.selection,g=s.inspectionGeneration,current=await identifySelection(id,old.selector,old.property);if(s.selection===old&&s.inspectionGeneration===g&&!isSameSelection(old.domIdentity,current)){recordStale(s,'Selected DOM node or value changed; inspect again');beginInspection(s,{keepDiagnostic:true});}}if(m.refreshDeep&&s.analysis?.stateatom&&s.selection&&!s.analysis.stateatom.firstReadProfile){const generation=s.inspectionGeneration,run=s.run;const current=await observeDeep(id,s.selection,s.property||'text',{includeTrace:s.analysis.capabilities?.sourceResolver==='open-ide',beforeMainScript:(op,role)=>ownMainCode(id,s,op,role)});if(tabs[id]!==s||s.inspectionGeneration!==generation||s.run!==run)throw Error('Stale inspection result');if(current.trace?.status==='Stale'){s.analysis.stateatom.runtime.status='Stale';s.analysis.stateatom.runtime.reason=current.trace.reason;}}result={...s,analysis:codeAnalysis(s),codeJournal:undefined,documentPolicies:undefined,fetchBindings:undefined,samples:undefined,pending:undefined,bufferBytes:JSON.stringify(s.requests).length,sampleEntries:undefined,sampleBytes:s.samples.join('').length};}
  else if(m.op==='open'||m.op==='definitions'||m.op==='references'){const s=state(id);result=await bridge(m.op,{origin:s.origin,...m.source},signal);}
  else if(m.op==='experiment'){result=await experiment(id,m.field,m.value,m.actions,m.controlPath,signal);}
  else if(m.op==='detach'){const s=state(id);recordStale(s,'Debugger detached; inspect again');await chrome.debugger.detach({tabId:id});s.attached=false;journalGap(s.codeJournal,'detach');s.fetchBindings=newFetchBindings(s.run);s.override=null;s.analysis=null;s.experiment=null;beginInspection(s);s.events.push({detach:'explicit user action'});await persist();result={detached:true};}
  else if(m.op==='metrics')result=await send(id,'Performance.getMetrics');
  else throw Error('Unsupported operation');return result;
 }catch(e){throw e;}
}

const unsubscribe=platform.events.subscribe(event=>{
 if(eventsClosed)return;
 const work=event.type==='debugger'?onDebuggerEvent(event.source,event.method,event.params):event.type==='detach'?onDebuggerDetach(event.source,event.reason):event.type==='removed'?(async()=>{await ready;platform.detached(event.tabId);delete tabs[event.tabId];await persist();notifyInvalidation(event.tabId);})():null;
 if(work){eventJobs.add(work);void work.catch(()=>{}).finally(()=>eventJobs.delete(work));}
});
return {ready,
 async request(message,{signal}={}){
  validateRequest(message);if(stopped)throw atomError('DISPOSED');
  const key=message.session+':'+message.id;if(jobs.has(key))throw atomError('INVALID_MESSAGE','Duplicate request');
  const controller=new AbortController(),id=message.payload.tabId;let rejectCancelled;const cancelled=new Promise((_,reject)=>{rejectCancelled=reject;});
  const context={signal:controller.signal,inspection:null};
  const abort=()=>{controller.abort();rejectCancelled(atomError('CANCELLED'));const own=context.inspection;if(own&&tabs[own.id]===own.s&&isCurrentInspection(own.s,own.generation,own.run))beginInspection(own.s,{keepDiagnostic:true});};
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  const promise=(async()=>{await ready;if(controller.signal.aborted)throw atomError('CANCELLED');const result=await operation(message.payload,context);if(controller.signal.aborted||stopped)throw atomError('CANCELLED');return result;})();
  jobs.set(key,{controller,promise,abort});
  void promise.finally(()=>{jobs.delete(key);signal?.removeEventListener('abort',abort);}).catch(()=>{});return Promise.race([promise,cancelled]);
 },cancel(session,id){jobs.get(session+':'+id)?.abort();},
 shutdown(){return shutdownPromise??=(async()=>{stopped=true;for(const j of jobs.values())j.abort();await Promise.allSettled([...jobs.values()].map(j=>j.promise));eventsClosed=true;unsubscribe();await Promise.allSettled([...eventJobs]);await ready;await platform.shutdown();for(const s of Object.values(tabs)){s.attached=false;recordStale(s,'Runtime stopped; attach and inspect again');beginInspection(s,{keepDiagnostic:true});}await persist();await diagnosticQueue;})();}
};
}
