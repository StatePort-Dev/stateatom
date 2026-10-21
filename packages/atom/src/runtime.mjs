import {parseConnectionReceipt,assessProjectSetup,HELPER_PROTOCOL,HELPER_VERSION,HELPER_ID} from '../../../core/project-connection.mjs';
import {createResponseEditor} from './response-editor.mjs';
import {createControlEditor} from './control-editor.mjs';
import {appOrigin} from './origin-policy.mjs';
import {createSourceMapSession} from './source-map-session.mjs';
import {createNativePicker,createNativeDOMQueue} from '../../../browser-extension/picker.mjs';
import {inspectNativeActions} from '../../../core/action-native.mjs';
import {createActionTraceController,actionPageOperation,actionPageGlobal,resolveActionPageAPI} from './action-trace.mjs';
import {declareOwnedCode,ownedInjectionSource,bindOwnedFetchCode} from '../../../core/owned-code.mjs';
import {newCodeJournal,journalEvent,journalSource,journalReadySources,journalGap,journalSnapshot,journalView} from '../../../core/code-journal.mjs';
import {newFetchBindings,fetchBindingEvent,fetchScriptSource,bindFetchTrace,allowsFetchGeneration,installFetchPolicy} from '../../../core/fetch-bindings.mjs';
import {makeDiagnostic,recordDiagnosticExperiment,recordTextExperiment} from '../../../core/diagnostic.mjs';
import {createHandoffStore} from '../../../core/handoff-store.mjs';
import {createHandoffInputOutcomes} from '../../../core/handoff-input-outcomes.mjs';
import {resolveInspection} from '../../../core/basic-analysis.mjs';
import {createBrowserEngine,handleDeepOverlay,isSameSelection} from "../../../src/engine/browser.mjs";
import {putSample,beginInspection,isCurrentInspection,lockExperiment,unlockExperiment,recordStale} from '../../../core/runtime-state.mjs';
import {observeElement} from '../../../browser-extension/adapters.js';
import {assessExperiment,flatten,edge} from '../../../core/evidence.mjs';
import {atomError} from './platform.mjs';
import {validateRequest} from './transport.mjs';
import {describeCapabilities,operationPolicy,isDevelopmentOrigin,isInspectionOrigin,isBridgeURL} from './capabilities.mjs';
export function createAtomRuntime(platform, options={}) {
const chrome=platform.chrome,fetch=platform.fetch;
const sourceMaps=createSourceMapSession({onChange:id=>notifyInvalidation(id),send:(id,m,p)=>chrome.debugger.sendCommand({tabId:id},m,p),fetch,permitted:origin=>platform.permittedOrigin?.(origin)??Promise.resolve(false)});
const synthetic=isDevelopmentOrigin;
const nativeDOM=createNativeDOMQueue(),engine=createBrowserEngine(chrome);
const {observeDeep,deepExperiment}=engine;
const identifySelection=(id,...args)=>nativeDOM(id,()=>engine.identifySelection(id,...args));
let stopped=false,eventsClosed=false,shutdownPromise;const jobs=new Map(),eventJobs=new Set(),editors=new Map(),editorOwners=new Map(),inspectorClients=new Map();
const actionOwners=new Map(),actionEpochs=new Map();
let diagnosticQueue=Promise.resolve(),diagnosticContext=null;
const diagnosticStore=createHandoffStore({
 read:async()=>{const {diagnostics:value}=await chrome.storage.local.get('diagnostics');return value===undefined?null:typeof value==='string'?value:JSON.stringify(value);},
 write:async diagnostics=>{if(stopped||diagnosticContext?.signal.aborted)throw atomError('CANCELLED');await chrome.storage.local.set({diagnostics:JSON.parse(diagnostics)});}
});
function diagnostics(operation,context){
 const task=diagnosticQueue.then(async()=>{if(stopped||context.signal.aborted)throw atomError('CANCELLED');diagnosticContext=context;try{return await operation(diagnosticStore);}finally{diagnosticContext=null;}});
 diagnosticQueue=task.catch(()=>{});return task;
}
async function legacyDiagnostics(store){
 const {entries}=await store.list(),files=await Promise.all(entries.filter(e=>e.version===1).map(e=>store.open(e.id)));
 return files.filter(Boolean).map(file=>file.record);
}
const workerIncarnation=crypto.randomUUID(),journalPending=new Map();
let tabs={},pairing=null;const ready=Promise.resolve(platform.ready).then(()=>chrome.storage.session.get(['tabs','pairing'])).then(x=>{tabs=x.tabs||{};pairing=x.pairing||null;for(const s of Object.values(tabs)){delete s.productionGrantId;delete s.productionCleanup;s.inputRequests={};s.inputIntervened={};for(const r of s.requests||[]){delete r.inputResponse;delete r.inputBody;delete r.inputOriginalUnavailable;}s.attached=false;if(s.inputHistory)s.inputHistory={...s.inputHistory,status:'Stale',closed:true,executable:false,cleanup:'unknown',closeReason:'Worker restarted; open a new investigation'};recordStale(s,'Worker restarted; attach and inspect again');s.inspectionGeneration=(s.inspectionGeneration||0)+1;s.override=null;s.deepOverrides=null;s.busy=null;s.codeJournal=newCodeJournal(s.run,{debuggerSession:s.codeJournal?.debuggerSession,incarnation:workerIncarnation});journalGap(s.codeJournal,'worker-restart');}});
async function ownMainCode(id,s,operation,role){if(s.readOnly)return;const j=s.codeJournal,contexts=Object.values(j?.contexts||{}).filter(c=>c.isDefault===true&&c.frameId===s.mainFrameId);if(contexts.length!==1){if(j)journalGap(j,'owned-code-unavailable');return;}await declareOwnedCode(j,role,ownedInjectionSource(operation.func,operation.args||[]),contexts[0].uniqueId);}
function codeState(s,options={}){return newCodeJournal(s.run,{debuggerSession:s.codeJournal?.debuggerSession,incarnation:workerIncarnation,...options});}
function codeAnalysis(s){
 if(!s.analysis)return null;
 const edited=Number.isSafeInteger(s.inputEditedInspection)&&s.inputEditedInspection===s.inspectionGeneration;
 const codeJournal=journalView(s.analysis.codeJournal,s.codeJournal),profile=s.analysis.stateatom?.firstReadProfile;
 const staleProfile=profile&&(edited||codeJournal?.freshness==='Stale');
 return {...s.analysis,codeJournal,actionBindings:(s.analysis.actionBindings||[]).map(b=>edited||s.analysis.actionsInvalidated||s.analysis.actionContext?.sourceGeneration!==(s.sourceGeneration||0)?{...b,freshness:'Stale'}:b),...(s.analysis.stateatom?{stateatom:{...s.analysis.stateatom,...(edited?{runtime:{...s.analysis.stateatom.runtime,status:'Stale',reason:'Quick input editing changed this investigation; inspect again for a new execution snapshot'}}:{}),...(staleProfile?{firstReadProfile:{...profile,status:'Stale',freshness:'Stale',fullPath:false,reason:edited?'Input editing started; this execution observation is historical':'Code history changed or expired; inspect again'}}:{})}}:{})};
}
function codeEligible(id,s,store=s.codeJournal){return tabs[id]===s&&s.attached===true&&allowed(s.origin)&&s.codeJournal===store;}
function acquireCode(id,s,store,scriptId){
 if(!codeEligible(id,s,store))return;
 const tasks=journalPending.get(store)||new Set();journalPending.set(store,tasks);
 const task=(async()=>{try{const r=await send(id,'Debugger.getScriptSource',{scriptId});if(codeEligible(id,s,store))await journalSource(store,scriptId,r.scriptSource,undefined,()=>codeEligible(id,s,store));}catch{if(codeEligible(id,s,store))await journalSource(store,scriptId,null);}})();
 tasks.add(task);void task.finally(()=>{tasks.delete(task);if(codeEligible(id,s,store))for(const next of journalReadySources(store))acquireCode(id,s,store,next);if(!tasks.size)journalPending.delete(store);});
}
function collectCode(id,s,method,p){
 if(!codeEligible(id,s))return;
 const store=s.codeJournal??=codeState(s),scriptId=journalEvent(store,method,p);const actionOwner=actionOwners.get(id);if(actionOwner&&!actionOwner.contextCurrent())void stopActionTrace(id,'Native execution context changed',actionOwner).then(persist).then(()=>notifyInvalidation(id)).catch(()=>{});if(scriptId)acquireCode(id,s,store,scriptId);
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
const allowed=url=>isInspectionOrigin(url,options.readOnlySites)||platform.approvedSite?.(url)===true;
const persist=()=>{for(const s of Object.values(tabs)){cap(s);if(s.deepExperiment&&JSON.stringify(s.deepExperiment).length>400000)s.deepExperiment={id:s.deepExperiment.id,status:s.deepExperiment.status,scope:s.deepExperiment.scope,details:'full trials returned to panel; omitted from session buffer'};if(s.experiment&&JSON.stringify(s.experiment).length>512000)s.experiment={status:s.experiment.status,reason:s.experiment.reason,experimentId:s.experiment.experimentId,field:s.experiment.field,selector:s.experiment.selector,identity:s.experiment.identity,details:'full trials returned in operation result; omitted from session buffer'};}while(Object.keys(tabs).length>3||JSON.stringify(tabs).length>5000000){const oldest=Object.entries(tabs).sort((a,b)=>(a[1].lastTouched||0)-(b[1].lastTouched||0))[0];if(!oldest)break;void stopActionTrace(Number(oldest[0]),'Tab metadata evicted');actionEpochs.delete(Number(oldest[0]));void stopInputs(Number(oldest[0]),'Tab metadata evicted');delete tabs[oldest[0]];}const saved=Object.fromEntries(Object.entries(tabs).map(([id,s])=>{const {productionGrantId,productionCleanup,...copy}=s;return[id,copy];}));return chrome.storage.session.set({tabs:saved,pairing});};
const picker=createNativePicker({readDOM:nativeDOM,send:(id,m,p)=>send(id,m,p),current:(id,epoch)=>tabs[id]?.run===epoch&&tabs[id]?.attached===true&&platform.owns?.(id)!==false,onChange:id=>notifyInvalidation(id),onSelect:async(id,target,selection)=>{
 const c=await capabilityContext(id),decision=operationPolicy('inspect-selector',c);if(!decision.available)throw atomError(decision.code,decision.reason);for(const grant of decision.requiredGrants)await platform.authorize(id,grant);
 const context={signal:selection.signal,pickerCurrent:selection.current,pickIdentity:target};
 const abort=()=>{const own=context.inspection;if(own&&tabs[own.id]===own.s&&isCurrentInspection(own.s,own.generation,own.run)){recordStale(own.s,'Picker selection cancelled; inspect again');beginInspection(own.s,{keepDiagnostic:true});void persist().catch(()=>{});notifyInvalidation(id);}};
 selection.signal.addEventListener('abort',abort,{once:true});
 try{if(selection.signal.aborted||!selection.current())throw atomError('CANCELLED');await inspect(id,target.selector,context);}finally{selection.signal.removeEventListener('abort',abort);}
}});
const notifyInvalidation=id=>chrome.runtime.sendMessage({event:'state-invalidated',tabId:id}).catch(()=>{});
const send=(id,method,params={})=>chrome.debugger.sendCommand({tabId:id},method,params);
function state(id){const s=tabs[id]??={requests:[],pending:{},samples:[],sampleEntries:{},run:crypto.randomUUID(),attached:false,events:[],selection:null,override:null};s.fetchBindings??=newFetchBindings(s.run);s.codeJournal??=codeState(s);s.lastTouched=Date.now();return s;}
function cap(s){const cutoff=Date.now()-300000;if(s.codeJournal?.startedAt<cutoff)journalGap(s.codeJournal,'expired');if(s.fetchBindings?.startedAt<cutoff)s.fetchBindings={...newFetchBindings(s.run),overflow:true};if(s.diagnosticExperiment?.result.completedAt<cutoff)s.diagnosticExperiment=null;if(s.stale?.at<cutoff)s.stale=null;if(s.sampleEntries){for(const[k,e]of Object.entries(s.sampleEntries))if(e.at<cutoff)delete s.sampleEntries[k];s.samples=Object.values(s.sampleEntries).map(e=>e.text);}if(s.analysisAt&&s.analysisAt<cutoff){s.analysis=null;s.selection=null;s.experiment=null;}if(s.experiment?.completedAt&&s.experiment.completedAt<cutoff)s.experiment=null;s.requests=s.requests.filter(x=>x.time>cutoff).slice(-32);while(JSON.stringify(s.requests).length>256000)s.requests.shift();s.samples=s.samples.slice(-50);while(s.samples.join('').length>800000)s.samples.shift();if(Object.keys(s.pending).length>64)s.pending={};s.events=s.events.slice(-30);}
function invalidateScope(id,reason){
 void stopActionTrace(id,reason);
 void stopInputs(id,reason);const old=state(id),property=old.property;sourceMaps.invalidate(id,reason);void picker.cancel(id,reason).catch(()=>{});
 // Unsaved source/trial buffers are transient authority-bound material. Saved
 // diagnostics and external historical receipts retain their existing policy.
 for(const key of ['analysis','selection','stale','deepExperiment','experiment','diagnosticExperiment','lastOverride','override','deepOverrides','codeJournal','fetchBindings','actionTrace'])old[key]=null;
 old.requests=[];old.samples=[];old.sampleEntries={};old.pending={};old.origin=null;old.attached=false;
 tabs[id]={run:crypto.randomUUID(),attached:false,origin:null,readOnly:true,property,requests:[],samples:[],sampleEntries:{},pending:{},events:[],selection:null,analysis:null,stale:{status:'Stale',reason,at:Date.now()}};state(id);
 for(const job of jobs.values())if(job.tabId===id&&!['state','capabilities','connect-site','forget-site','detach','source-map-clear'].includes(job.op))job.abort();notifyInvalidation(id);
}
async function capabilityContext(id,request={},inputContext=null){
 const s=state(id);cap(s);let target={url:null,permission:false,grants:[],lease:'unknown'};
 try{if(platform.describeTarget)target={...target,...await platform.describeTarget(id)};}catch{/* Missing target facts cannot grant browser access. */}
 if(s.origin&&(new URL(target.url||'about:blank').origin!==s.origin||target.permission!==true)||target.permission!==true&&(s.analysis||s.selection||s.samples.length||s.requests.length)){invalidateScope(id,'Site permission or origin changed; attach again');await platform.invalidate?.(id);}
 if(s.attached&&target.lease!=='owned'){
  void stopActionTrace(id,'Debugger ownership lost');void stopInputs(id,'Debugger ownership lost');sourceMaps.invalidate(id,'Debugger ownership lost');void picker.cancel(id,'Debugger ownership lost').catch(()=>{});recordStale(s,'Debugger ownership lost; attach and inspect again');beginInspection(s,{keepDiagnostic:true});s.attached=false;s.override=null;s.deepOverrides=null;
 }
 const analysis=codeAnalysis(s);
 return {...target,readOnlySites:options.readOnlySites===true&&target.readOnlySites===true,disposed:stopped||target.disposed===true,
  attached:s.attached===true&&target.lease==='owned',readOnly:target.readOnly===true||(s.attached&&s.readOnly===true),requestReadOnly:request.readOnly===true,
  sourceConnected:!!pairing&&pairing.origin===new URL(target.url||'about:blank').origin,hasSelection:!!s.selection,hasHistoricalTarget:!!s.stale?.target,hasAnalysis:!!s.analysis,
  controlledProfile:!!s.analysis?.stateatom?.firstReadProfile,actionInspector:!!inputContext?.inspector?.active&&inspectorClients.get(inputContext.session)===inputContext.inspector,foreignActionTrace:!!actionOwners.get(id)&&(!inputContext||actionOwners.get(id).session!==inputContext.session||actionOwners.get(id).client!==inputContext.inspector||inputContext.ownerId!==null&&actionOwners.get(id).ownerId!==inputContext.ownerId),actionTraceReady:s.selection?.trace?.actionTrace?.availability?.available===true||!!s.actionTrace&&!s.actionTrace.freshness,
  foreignInputEditor:!!inputContext&&!!editors.get(id)&&!editors.get(id).snapshot().closed&&!sameInputOwner(id,inputContext),
  hasInputEditor:!!editors.get(id)&&!editors.get(id).snapshot().closed,inputEditorBusy:!!editors.get(id)&&(!editors.get(id).snapshot().closed||['active','unknown'].includes(editors.get(id).snapshot().cleanup)),
  captureInspector:inputCapturePolicyContext(id,inputContext).captureInspector,captureForeignEditor:inputCapturePolicyContext(id,inputContext).captureForeignEditor,
  productionHost:platform.productionChanges?.available===true,productionInspector:!!inputContext?.inspector?.active&&inspectorClients.get(inputContext.session)===inputContext.inspector,nativeInputOwner:platform.nativeControlsAvailable===true,inputSourceKind:editors.get(id)&&!editors.get(id).snapshot().closed?(editors.get(id).sourceKind||'json-response'):request.sourceKind||'json-response',
  hasResponseFields:s.requests.some(r=>r.json!==undefined),property:s.selection?.property||s.property||'text',
  stale:!!s.stale||analysis?.stateatom?.runtime?.status==='Stale',busy:!!s.busy,
  hasSourceActions:analysis?.actionBindings?.some(b=>b.binding?.source&&b.freshness!=='Stale')===true,
  hasObservedInputs:analysis?.stateatom?.runtime?.status==='Observed'&&analysis.stateatom.runtime.nodes?.some(n=>n.status==='Observed'&&Object.hasOwn(n,'value'))===true};
}
function inputsSnapshot(id){return editors.get(id)?.snapshot()||tabs[id]?.inputHistory||null;}
function stopInputs(id,reason){return editors.get(id)?.close(reason)||Promise.resolve(null);}
function sameActionOwner(owner,context){return owner.session===context.session&&owner.client===context.inspector&&owner.ownerId===context.ownerId;}
function stopActionTrace(id,reason,expected){const own=expected||actionOwners.get(id);if(!own)return Promise.resolve();if(actionOwners.get(id)===own){actionOwners.delete(id);const s=tabs[id];if(s?.actionTrace?.traceId===own.controller.snapshot()?.traceId){s.actionTrace={...s.actionTrace,freshness:'Stale',sourceCurrent:false,status:'stale',reason};for(const n of s.analysis?.graph?.nodes||[])if(String(n.id).startsWith('action-trace:'))n.status='Stale';for(const e of s.analysis?.graph?.edges||[])if(String(e.id).startsWith('action-trace:'))e.status='Stale';}}return own.controller.close(reason).catch(()=>{});}
async function clearRetiredActionTrace(id,traceId,context){
 const owner=actionEpochs.get(id),snapshot=owner?.controller.snapshot();
 if(actionOwners.has(id)||!owner||!sameActionOwner(owner,context)||snapshot?.traceId!==traceId)throw atomError('STALE_TARGET','Observation replaced or closed');
 // The native collector was already retired. Clear only this actor's known
 // historical metadata, never resolve a node or enter a replacement document.
 const result={...snapshot,status:'cleared',traceId:null,selectedId:null,records:[],sourceCurrent:false,freshness:'Stale',reason:'Observation cleared'};
 actionEpochs.delete(id);const s=tabs[id];
 if(s?.actionTrace?.traceId===traceId){s.actionTrace={...result,capturedAt:Date.now()};const prefix='action-trace:'+traceId+':';if(s.analysis?.graph){s.analysis.graph.nodes=s.analysis.graph.nodes.filter(n=>!String(n.id).startsWith(prefix));s.analysis.graph.edges=s.analysis.graph.edges.filter(e=>!String(e.id).startsWith(prefix));}}
 await persist();return result;
}
async function actionTraceOperation(id,m,context){
 assertInputClient(context);if(!context.inspector?.active||!context.ownerId)throw atomError('INSPECTOR_DISCONNECTED');
 const previous=actionOwners.get(id);if(previous&&!sameActionOwner(previous,context))throw atomError('BUSY','Observation belongs to another inspector');
 if(m.op==='actions-clear'&&!previous)return clearRetiredActionTrace(id,m.traceId,context);
 if(m.op!=='actions-arm'){
  if(!previous||previous.controller.snapshot()?.traceId!==m.traceId)throw atomError('STALE_TARGET','Observation replaced or closed');
  const method=m.op.slice('actions-'.length);let result;
  try{result=await previous.controller[method]();}catch(e){if(method==='cancel'||method==='clear'){await stopActionTrace(id,'Stale observation retired',previous);if(method==='clear')return clearRetiredActionTrace(id,m.traceId,context);result=previous.controller.snapshot();await persist();return result;}throw e;}
  const observed=result,guardResult=async()=>{await previous.guard();if(method==='read'&&previous.controller.snapshot()!==observed)throw atomError('STALE_TARGET','Observation changed while checking source');};await guardResult();
  if(method==='read'&&!result.freshness&&result.records?.some(r=>r.kind==='body-entry')&&pairing){const sources=[...new Map(result.records.filter(r=>r.kind==='body-entry').map(r=>[r.source.file,{file:r.source.file,sourceDigest:r.source.sourceDigest}])).values()];let sourceCurrent=false;try{sourceCurrent=(await bridge('check-action-sources',{origin:state(id).origin,sources},context.signal)).current===true;}catch{}await guardResult();result={...result,sourceCurrent};state(id).actionTrace={...result,capturedAt:Date.now()};}
  if(method==='clear'&&actionOwners.get(id)===previous){actionOwners.delete(id);if(actionEpochs.get(id)===previous)actionEpochs.delete(id);}await persist();return result;
 }
 if(previous)await stopActionTrace(id,'New observation');
 const s=state(id),selected=s.selection,run=s.run,inspection=s.inspectionGeneration,sourceGeneration=s.sourceGeneration||0,sourceConnection=pairing;
 if(!selected?.domIdentity||!s.analysis||s.stale)throw atomError('OBSERVATION_REQUIRED');
 const contexts=Object.values(s.codeJournal?.contexts||{}).filter(c=>c.isDefault===true&&c.frameId===s.mainFrameId);if(contexts.length!==1)throw atomError('CAPABILITY_UNAVAILABLE','Exact main execution context unavailable');const main=contexts[0];
 const identity={run,build:s.analysis.graph.identity.build,frame:s.mainFrameId},owner={session:context.session,client:context.inspector,ownerId:context.ownerId,controller:null};
 const contextCurrent=()=>{const current=Object.values(s.codeJournal?.contexts||{}).filter(c=>c.isDefault===true&&c.frameId===s.mainFrameId);return current.length===1&&current[0]===main;};owner.contextCurrent=contextCurrent;
 const guard=async()=>{assertInputClient(context);if(context.signal.aborted||stopped||pairing!==sourceConnection||tabs[id]!==s||s.run!==run||s.selection!==selected||s.inspectionGeneration!==inspection||(s.sourceGeneration||0)!==sourceGeneration||!s.attached||actionOwners.get(id)!==owner||!contextCurrent())throw atomError('STALE_TARGET','Selection, source or debugger context changed');if(editors.get(id)&&!editors.get(id).snapshot().closed)throw atomError('BUSY','Close input editing before observation');};
 const invoke=async(op,page,expected,traceId)=>{
  const group='atom-action-'+crypto.randomUUID();try{
   let objectId;if(op==='arm'){await guard();const native=await identifySelection(id,selected.selector,selected.property);await guard();if(!native||native.document!==selected.domIdentity.document||native.node!==selected.domIdentity.node)throw atomError('STALE_TARGET','Selected native node changed');const backendNodeId=Number(native.node.slice(4));const object=await send(id,'DOM.resolveNode',{backendNodeId,executionContextId:main.id,objectGroup:group});objectId=object.object?.objectId;if(!objectId)throw atomError('STALE_TARGET');}
   const globalDeclaration=actionPageGlobal.toString();await declareOwnedCode(s.codeJournal,'action-observation-global','('+globalDeclaration+')',main.uniqueId);
   const global=await send(id,'Runtime.callFunctionOn',{uniqueContextId:main.uniqueId,functionDeclaration:globalDeclaration,objectGroup:group,returnByValue:false});
   if(global.exceptionDetails||!global.result?.objectId)throw atomError('ACTION_TRACE_UNAVAILABLE');
   const apiArgs=await resolveActionPageAPI((m,p)=>send(id,m,p),global.result.objectId);
   const declaration=actionPageOperation.toString();await declareOwnedCode(s.codeJournal,'action-observation-helper','('+declaration+')',main.uniqueId);
   const response=await send(id,'Runtime.callFunctionOn',{uniqueContextId:main.uniqueId,functionDeclaration:declaration,arguments:[{value:op},{value:page},{value:expected},{value:traceId},objectId?{objectId}:{value:null},...apiArgs],returnByValue:true});if(response.exceptionDetails)throw atomError('ACTION_TRACE_UNAVAILABLE','Optional development observer unavailable');return response.result?.value;
  }finally{await send(id,'Runtime.releaseObjectGroup',{objectGroup:group}).catch(()=>{});}
 };
 owner.guard=guard;owner.controller=createActionTraceController({identity,guard,invoke,onChange:trace=>{if(tabs[id]!==s||actionEpochs.get(id)!==owner||s.run!==run||s.selection!==selected||s.inspectionGeneration!==inspection||(s.sourceGeneration||0)!==sourceGeneration||!contextCurrent())return;s.actionTrace={...trace,capturedAt:Date.now()};const g=s.analysis?.graph;if(g){g.nodes=g.nodes.filter(n=>!String(n.id).startsWith('action-trace:'));g.edges=g.edges.filter(e=>!String(e.id).startsWith('action-trace:'));for(const r of trace.records){const nodeId='action-trace:'+trace.traceId+':'+r.sequence;g.nodes.push({id:nodeId,kind:r.kind,status:trace.freshness?'Stale':'Observed',...(r.kind==='body-entry'?{symbol:r.source.symbol,sourceClaim:r.source}:{}),dispatchId:r.dispatchId,activationId:r.activationId,completion:r.completion});g.edges.push({id:nodeId+':edge',...edge('ui',nodeId,'independent-action-observation',trace.freshness?'Stale':'Observed','Opt-in original Event identity and synchronous body hooks; no property/network consequence',[nodeId],g.identity)});}}}});
 actionOwners.set(id,owner);actionEpochs.set(id,owner);context.cancelActionTrace=()=>{void stopActionTrace(id,'Observation request cancelled',owner);};
 try{const result=await owner.controller.arm();await persist();return result;}catch(e){await stopActionTrace(id,'Observation opening failed',owner);throw e;}
}
function assertInputClient(context){if(context.inspector?.active===false||(inspectorClients.get(context.session)||null)!==context.inspector)throw atomError('INSPECTOR_DISCONNECTED');}
function assertProductionClient(context){assertInputClient(context);if(!context.inspector?.active)throw atomError('INSPECTOR_DISCONNECTED','Use a live inspector Settings view');if(context.signal.aborted)throw atomError('CANCELLED');}
function sameInputOwner(id,context){const owner=editorOwners.get(id);return owner?.session===context.session&&owner.client===context.inspector&&owner.ownerId===context.ownerId;}
function requireInputOwner(id,context){assertInputClient(context);if(editors.has(id)&&!sameInputOwner(id,context))throw atomError('BUSY','This input editor belongs to another inspector');}
function requireInputs(id,investigationId,context){requireInputOwner(id,context);const editor=editors.get(id);if(!editor||editor.snapshot().investigationId!==investigationId)throw atomError('STALE_INVESTIGATION','Input investigation changed; open it again');return editor;}
function inputCapturePolicyContext(id,context){
 const s=tabs[id];return {disposed:stopped,captureInspector:!!context?.inspector?.active&&inspectorClients.get(context.session)===context.inspector,captureForeignEditor:!!context&&editors.has(id)&&!sameInputOwner(id,context),hasSelection:!!s?.selection,hasHistoricalTarget:!!s?.stale?.target,busy:!!s?.busy};
}
function inputSelectionContext(id,s){
 const selected=s.selection;
 if(!selected?.domIdentity||!s.origin||!s.run||!Number.isFinite(selected.observedAt))return null;
 return Object.freeze({tabId:id,origin:s.origin,run:s.run,document:selected.domIdentity.document,node:selected.domIdentity.node,frameId:s.mainFrameId||null,selector:selected.selector,property:selected.property,selectionObservedAt:selected.observedAt,inspectionGeneration:s.inspectionGeneration||0,sourceGeneration:s.sourceGeneration||0,leaseEpoch:s.inputLeaseEpoch||0});
}
async function captureInputs(id,m,context){
 assertInputClient(context);if(!context.inspector?.active)throw atomError('INSPECTOR_DISCONNECTED');requireInputOwner(id,context);
 const s=tabs[id],selected=s?.selection||s?.stale?.target;
 if(!selected)throw atomError('OBSERVATION_REQUIRED','Observation unavailable or expired; inspect again');
 const editor=editors.get(id),owner=editorOwners.get(id),snapshot=editor?.snapshot()||s.inputHistory||null;
 if(m.investigationId!==undefined){if(!editor||snapshot.investigationId!==m.investigationId)throw atomError('STALE_INVESTIGATION');if(snapshot.revision!==m.expectedRevision)throw atomError('STALE_REVISION');}
 const currentContext=inputSelectionContext(id,s),stale=s.stale,selection=s.selection;
 const stamp=()=>JSON.stringify({context:inputSelectionContext(id,s),selected:s.selection||s.stale?.target,stale:s.stale,run:s.run,origin:s.origin,frame:s.mainFrameId,inspection:s.inspectionGeneration,source:s.sourceGeneration,lease:s.inputLeaseEpoch,busy:s.busy,snapshot:editors.get(id)?.snapshot()||s.inputHistory||null});
 const before=stamp(),capturedAt=Date.now();
 const diagnosticRaw=JSON.stringify(makeDiagnostic({...s,sourceMaps:sourceMaps.snapshot(id),analysis:codeAnalysis(s)},{includeContent:m.includeContent===true,notes:m.notes,now:capturedAt}));
 const capture=snapshot?{kind:editor?'editor-snapshot':'runtime-summary',sourceKind:editor?.sourceKind||snapshot.sourceKind||'json-response',capturedAt,snapshotRevision:snapshot.revision,selectionContext:currentContext,investigationContext:editor?owner?.captureContext||null:null,snapshot}:null;
 // The projection copies inert descriptors synchronously before its first await.
 const outcomes=await createHandoffInputOutcomes(diagnosticRaw,capture,{includeCategories:m.includeCategories||[]});
 if(context.signal.aborted||stopped)throw atomError('CANCELLED');assertInputClient(context);requireInputOwner(id,context);
 if(tabs[id]!==s||editors.get(id)!==editor||editorOwners.get(id)!==owner||s.selection!==selection||s.stale!==stale||stamp()!==before)throw atomError('STALE_CAPTURE','Input snapshot changed while preparing capture; review again');
 const result=Object.freeze({schema:'stateatom.input-outcome-capture/1',exportable:false,executable:false,capturedAt,diagnosticRaw,outcomes,limitations:Object.freeze(['Atomic acquisition of stored runtime/editor data only; no new DOM, permission or execution observation.','Not a public file, saved report, replay, causal dependency, successful fix or application restoration attestation.'])});
 if(new TextEncoder().encode(JSON.stringify(result)).length>2097152)throw atomError('CAPTURE_LIMIT','Input capture reply exceeds2MiB');return result;
}
async function openInputs(id,context,sourceKind='json-response'){
 assertInputClient(context);const previous=editors.get(id);if(previous&&!previous.snapshot().closed){requireInputOwner(id,context);if((previous.sourceKind||'json-response')!==sourceKind)throw atomError('BUSY','Close the current input source before changing families');return previous.read();}
 if(previous){await previous.close('New investigation');if(['unknown','authority-lost'].includes(previous.snapshot().cleanup)&&platform.owns?.(id)!==false)throw atomError('BUSY','Native Fetch cleanup unconfirmed; detach and attach before reopening');}
 if(context.signal.aborted)throw atomError('CANCELLED');
 const s=state(id),selected=s.selection,run=s.run,generation=s.sourceGeneration||0,leaseEpoch=s.inputLeaseEpoch||0;
 if(!selected?.domIdentity||!s.analysis||s.stale)throw atomError('OBSERVATION_REQUIRED','Inspect a current target first');
 // A collected-source digest is not a full application build attestation.
 const build=null;
 let editor,published;
 const guard=()=>{assertInputClient(context);if(stopped||tabs[id]!==s||s.run!==run||s.selection!==selected||(s.sourceGeneration||0)!==generation||(s.inputLeaseEpoch||0)!==leaseEpoch||!s.attached)throw atomError('STALE_TARGET','Target, source revision or inspection changed');};
 const readCurrent=async()=>{
  guard();const native=await identifySelection(id,selected.selector,selected.property);guard();
  if(!native||native.document!==selected.domIdentity.document||native.node!==selected.domIdentity.node)throw atomError('STALE_TARGET','Selected native node changed');
  const c=await capabilityContext(id,{},context),decision=operationPolicy('inputs-apply',{...c,inputSourceKind:sourceKind,hasInputEditor:true});guard();
  const old=editor?.snapshot().target||published;
  return {target:{tabId:id,origin:s.origin,run,document:native.document,node:native.node,selector:selected.selector,property:selected.property,value:native.value,observedAt:old&&old.value===native.value?old.observedAt:Date.now(),build},admission:{available:decision.available,grants:c.grants||[]}};
 };
 const fresh=await readCurrent();guard();if(context.signal.aborted)throw atomError('CANCELLED');
 if(fresh.target.value!==selected.value)throw atomError('STALE_TARGET','Selected value changed; inspect again before opening inputs');
 if(!fresh.admission.available)throw atomError('CAPABILITY_DENIED','Current input editing authority required');published=fresh.target;
 const investigationId=crypto.randomUUID(),responses=s.requests.filter(r=>r.inputResponse&&typeof r.inputBody==='string').map(r=>({...r.inputResponse,document:fresh.target.document,body:r.inputBody}));
 const onChange=snapshot=>{
  if(tabs[id]!==s||editor&&editors.get(id)&&editors.get(id)!==editor)return;
  if(snapshot.history.length||sourceKind==='dom-control'&&snapshot.pending)s.inputEditedInspection=s.inspectionGeneration;
  s.inputHistory={sourceKind,investigationId:snapshot.investigationId,target:snapshot.target,revision:snapshot.revision,status:'Historical',executable:false,closed:snapshot.closed,cleanup:snapshot.cleanup,closeReason:snapshot.closeReason,resources:[],history:snapshot.history.slice(-8).map(t=>({id:t.id,kind:t.kind,phase:t.phase,outcomeCount:t.outcomes.length})),details:'Read-only runtime summary; rules, raw values and complete history are not restored'};
  notifyInvalidation(id);
 };
 editor=sourceKind==='dom-control'?createControlEditor({investigationId,target:fresh.target,readCurrent,onChange,openOwner:options=>platform.openNativeControls(options)}):createResponseEditor({investigationId,target:fresh.target,responses,readCurrent,send:(method,params)=>send(id,method,params),ownsFetch:()=>platform.owns?.(id)!==false&&s.attached===true&&(s.inputLeaseEpoch||0)===leaseEpoch,onChange});
 const selectedContext=inputSelectionContext(id,s);
 editors.set(id,editor);editorOwners.set(id,{session:context.session,client:context.inspector,ownerId:context.ownerId,captureContext:selectedContext?Object.freeze({...selectedContext,investigationId}):null});context.cancelInput=()=>{if(editors.get(id)===editor)void editor.close('Input opening cancelled');};
 const result=await editor.read();if(context.signal.aborted){await editor.close('Input opening cancelled');throw atomError('CANCELLED');}await persist();return result;
}
async function bridge(op,body,signal){const connection=pairing;if(!connection||connection.origin!==body.origin)throw Error('Pair IDE first');if(!await platform.permittedOrigin?.(connection.url)||!await platform.permittedOrigin?.(body.origin))throw atomError('ORIGIN_DENIED','Source connection permission revoked');const response=await fetch(connection.url+'/'+op,{method:'POST',redirect:'error',signal,headers:{'content-type':'application/json',authorization:'Bearer '+pairing.token},body:JSON.stringify(body)});const r=await response.json();if(pairing!==connection||!await platform.permittedOrigin?.(connection.url)||!await platform.permittedOrigin?.(body.origin))throw atomError('ORIGIN_DENIED','Source connection changed or revoked');if(!r.ok)throw Error(r.error);return r.result;}
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
async function attach(id,readOnly=false){const tab=await chrome.tabs.get(id);if(!allowed(tab.url))throw Error('Unsupported inspection origin');const facts=await platform.describeTarget(id),s=state(id),mode=facts.readOnly===true||readOnly;if(s.attached&&s.readOnly!==mode)throw Error('Detach before changing inspection mode');s.readOnly=mode;await platform.authorize(id,s.readOnly?'read':'cache');s.origin=new URL(tab.url).origin;if(s.attached){try{await send(id,'Network.enable');if(sourceMaps.snapshot(id).status==='Stale'){sourceMaps.begin(id,s.run);await send(id,'Debugger.disable');await send(id,'Debugger.enable',{maxScriptsCacheSize:2000000});}return;}catch{s.attached=false;}}s.inputLeaseEpoch=(s.inputLeaseEpoch||0)+1;await stopInputs(id,'Debugger session replaced');await chrome.debugger.attach({tabId:id},'1.3');s.attached=true;const retired=editors.get(id);if(retired?.snapshot().closed){editors.delete(id);editorOwners.delete(id);if(s.inputHistory)s.inputHistory={...s.inputHistory,cleanup:'previous-session-detached',closed:true,executable:false};}s.origin=new URL(tab.url).origin;s.codeJournal=codeState(s,{debuggerSession:crypto.randomUUID()});sourceMaps.begin(id,s.run);
 await send(id,'Network.enable',{maxTotalBufferSize:2000000,maxResourceBufferSize:512000});await send(id,'Page.enable');await send(id,'Runtime.enable');await send(id,'Debugger.enable',{maxScriptsCacheSize:2000000});s.mainFrameId=(await send(id,'Page.getFrameTree')).frameTree.frame.id;await send(id,'Performance.enable');if(!s.readOnly)await send(id,'Network.setCacheDisabled',{cacheDisabled:true});await persist();}
async function sample(id,url,text,key=url,kind='executable',run){const s=state(id);if(run&&s.run!==run)return;if(!allowed(url)||url.includes('/node_modules/')||url.includes('/@vite/')||text.length>256000)return;
 const generation=s.sourceGeneration||0;putSample(s,url,text,key,kind);cap(s);if(s.analysis?.actionContext&&generation!==(s.sourceGeneration||0)){void stopActionTrace(id,'Source changed');s.analysis.actionsInvalidated=true;notifyInvalidation(id);}}
async function collectInputNetwork(id,s,method,p,eventRun){
 if(method==='Network.requestWillBeSent'&&p.type==='Fetch'&&(!s.mainFrameId||p.frameId===s.mainFrameId)){s.requestOrdinals??={};s.requestCounts??={};const u=p.request.url;s.requestOrdinals[p.requestId]=s.requestCounts[u]=(s.requestCounts[u]||0)+1;s.inputRequests??={};s.inputRequests[p.requestId]={url:u,method:p.request.method,type:p.type,requestId:p.requestId,requestOrdinal:s.requestOrdinals[p.requestId],frameId:p.frameId,mainFrame:p.frameId===s.mainFrameId};while(Object.keys(s.inputRequests).length>64)delete s.inputRequests[Object.keys(s.inputRequests)[0]];}
 if(method==='Network.responseReceived'&&allowed(p.response.url)&&p.type==='Fetch'){s.pending[p.requestId]={id:p.requestId,url:p.response.url,status:p.response.status,mime:p.response.mimeType,time:Date.now(),...(s.inputRequests?.[p.requestId]?.mainFrame&&p.frameId===s.mainFrameId&&s.inputRequests[p.requestId].url===p.response.url&&p.response.status>=200&&p.response.status<300&&/^application\/(?:[\w.-]+\+)?json$/i.test(p.response.mimeType)?{inputResponse:s.inputRequests[p.requestId]}:{})};}
 if(method==='Network.loadingFinished'&&s.pending[p.requestId]){const r=s.pending[p.requestId],intervened=s.inputIntervened?.[p.requestId]===true;delete s.inputIntervened?.[p.requestId];delete s.pending[p.requestId];if(p.encodedDataLength<512000){try{const body=await send(id,'Network.getResponseBody',{requestId:p.requestId});const text=body.base64Encoded?new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(body.body),c=>c.charCodeAt(0))):body.body;if(text.length<128000){r.json=JSON.parse(text);if(s.run!==eventRun)return;if(r.inputResponse&&!intervened)r.inputBody=text;else if(r.inputResponse)r.inputOriginalUnavailable=true;s.requests.push(r);cap(s);const editor=editors.get(id);if(editor&&r.inputResponse&&!intervened)await editor.observe({...r.inputResponse,document:editor.snapshot().target.document,body:text});}}catch{}}}
}
async function handleInputPause(id,s,p){
 const editor=editors.get(id),meta=s.inputRequests?.[p.networkId];if(!editor)return false;const paused=editor.handlePaused(p,meta?{...meta,document:editor.snapshot().target.document}:null);if(editor.handledNetwork(p.networkId)){s.inputIntervened??={};s.inputIntervened[p.networkId]=true;}if(await paused){await persist();return true;}return false;
}
async function onDebuggerEvent(source,method,p){await ready;if(platform.owns&&!platform.owns(source.tabId))return;const id=source.tabId,s=state(id),eventRun=s.run;try{
 if(method.startsWith('Overlay.')||method.startsWith('DOM.')){if(source.sessionId){void picker.cancel(id,'Child-frame selection is unsupported').catch(()=>{});return;}await picker.event(id,method,p);return;}
 if(method==='Page.frameNavigated'&&!p.frame.parentId){
  if(s.origin&&new URL(p.frame.url).origin!==s.origin){invalidateScope(id,'Cross-origin navigation; attach again');await platform.invalidate?.(id);await persist();return;}
  void platform.productionChanges?.revoke(id,'navigation');
  if(s.productionGrantId){s.productionGrantId=null;s.attached=false;}
  // Advance identities before the first await: script events can arrive while permissions settle.
  void stopActionTrace(id,'Navigation closed observation');const closingInputs=stopInputs(id,'Navigation closed input editing');
  sourceMaps.invalidate(id,'Navigation; previous source association is stale');void picker.cancel(id,'Navigation cancelled selection').catch(()=>{});recordStale(s,'navigation/reload; previous execution invalidated');
  s.mainFrameId=p.frame.id;s.mainLoaderId=p.frame.loaderId;s.requests=[];s.pending={};s.requestOrdinals={};s.requestCounts={};s.inputRequests={};s.inputIntervened={};s.samples=[];s.sampleEntries={};s.run=crypto.randomUUID();
  sourceMaps.begin(id,s.run);s.codeJournal=codeState(s,{armedBeforeNavigation:s.attached===true});s.fetchBindings=newFetchBindings(s.run);s.analysis=null;s.selection=null;s.experiment=null;beginInspection(s,{keepDiagnostic:true});
  const navigationRun=s.run;await closingInputs;
  if(new URL(p.frame.url).protocol==='https:')s.readOnly=true;
  let permitted=allowed(p.frame.url)&&!!await platform.permittedOrigin?.(new URL(p.frame.url).origin);
  if(tabs[id]!==s||s.run!==navigationRun)return;
  if(permitted)s.origin=new URL(p.frame.url).origin;
  else{s.origin=null;s.override=null;s.attached=false;sourceMaps.invalidate(id,'Navigation origin not permitted');await chrome.debugger.detach({tabId:id}).catch(()=>{});}
  await persist();notifyInvalidation(id);if(!s.readOnly)await permitFetchGeneration(id,s);
 }
 const sourceMapChanged=sourceMaps.event(id,method,p);
 if(s.readOnly){
  // Passive context identities are required by read/inject observations too.
  // Do not acquire script bodies or enable any mutation authority in this path.
  if(['Runtime.executionContextCreated','Runtime.executionContextDestroyed','Runtime.executionContextsCleared'].includes(method))collectCode(id,s,method,p);
  if(method==='Fetch.requestPaused'&&await handleInputPause(id,s,p))return;
  if(s.productionGrantId&&['Network.requestWillBeSent','Network.responseReceived','Network.loadingFinished'].includes(method)){
   // Request/frame identities must be registered before any awaited authority
   // query: the matching Fetch pause may be dispatched concurrently. These
   // metadata are not a grant; body reads and every writer still revalidate it.
   if(method!=='Network.loadingFinished')await collectInputNetwork(id,s,method,p,eventRun);
   else{const facts=await platform.describeTarget(id);if(s.run===eventRun&&facts.productionChange?.active&&facts.productionChange.grantId===s.productionGrantId)await collectInputNetwork(id,s,method,p,eventRun);}
  }
  if(sourceMapChanged)notifyInvalidation(id);return;
 }
 collectCode(id,s,method,p);
 if(method==='Network.responseReceived'&&p.type==='Document'&&p.frameId===s.mainFrameId&&allowed(p.response.url)&&p.response.url.length<=1024){s.documentPolicies??={};s.documentPolicies[p.loaderId]={loaderId:p.loaderId,frameId:p.frameId,url:p.response.url,allowed:allowsFetchGeneration(p.response.headers)};while(Object.keys(s.documentPolicies).length>4)delete s.documentPolicies[Object.keys(s.documentPolicies)[0]];if(p.loaderId===s.mainLoaderId)await permitFetchGeneration(id,s);}
 const scriptId=fetchBindingEvent(s.fetchBindings,method,p);
 if(method==='Runtime.executionContextCreated'&&p.context?.auxData?.isDefault&&p.context.auxData.frameId===s.mainFrameId)await permitFetchGeneration(id,s);
 if(scriptId){const store=s.fetchBindings;const r=await send(id,'Debugger.getScriptSource',{scriptId});if(s.run===eventRun&&s.fetchBindings===store)fetchScriptSource(store,scriptId,r.scriptSource);}
 if(method==='Debugger.scriptParsed'&&allowed(p.url)&&!p.url.includes('/node_modules/')&&!p.url.includes('/@vite/')){
  if(p.sourceMapURL?.startsWith('data:')){try{const raw=p.sourceMapURL.split(',')[1],map=JSON.parse(p.sourceMapURL.includes(';base64')?atob(raw):decodeURIComponent(raw));for(const [i,text]of (map.sourcesContent||[]).entries())if(text)await sample(id,p.url,text,map.sources?.[i]||p.url,'map-claim',eventRun);}catch{}}
  const r=await send(id,'Debugger.getScriptSource',{scriptId:p.scriptId});const generated=new URL(p.url);generated.searchParams.set('__executedCode','1');await sample(id,p.url,r.scriptSource,generated.href,'executable',eventRun);
 }
 await collectInputNetwork(id,s,method,p,eventRun);
 if(method==='Fetch.requestPaused'){
  if(await handleInputPause(id,s,p))return;
  if(await handleDeepOverlay(id,p,s,send))return;
  const o=s.override;if(o&&p.request.url===o.url&&p.responseStatusCode&&!o.consumed){
   const response=await send(id,'Fetch.getResponseBody',{requestId:p.requestId});let json=JSON.parse(response.base64Encoded?atob(response.body):response.body);const keys=o.path.split('.');if(keys.some(k=>['__proto__','prototype','constructor'].includes(k)))throw Error('Unsafe field');let obj=json;for(const k of keys.slice(0,-1)){if(!Object.hasOwn(obj,k))throw Error('Missing field');obj=obj[k];}if(!Object.hasOwn(obj,keys.at(-1)))throw Error('Missing leaf');obj[keys.at(-1)]=o.value;
   const text=JSON.stringify(json);o.consumed++;o.actual=json;const bytes=new TextEncoder().encode(text);const body=btoa(String.fromCharCode(...bytes));
   await send(id,'Fetch.fulfillRequest',{requestId:p.requestId,responseCode:p.responseStatusCode,responseHeaders:(p.responseHeaders||[]).filter(h=>!['content-length','content-encoding','transfer-encoding','etag'].includes(h.name.toLowerCase())),body});s.lastOverride=structuredClone(o);
  }else await send(id,'Fetch.continueRequest',{requestId:p.requestId});
 }
 }catch(e){s.events.push({method,error:e.message});if(method==='Fetch.requestPaused')try{await send(id,'Fetch.continueRequest',{requestId:p.requestId});}catch{}}
}
async function onDebuggerDetach(source,reason){if(platform.owns&&!platform.owns(source.tabId))return;void stopActionTrace(source.tabId,'Debugger detached');void stopInputs(source.tabId,'Debugger detached');await picker.cancel(source.tabId,'Debugger detached').catch(()=>{});sourceMaps.invalidate(source.tabId,'Debugger detached');platform.detached(source.tabId);await ready;if(reason==='target_closed'){delete tabs[source.tabId];await persist();notifyInvalidation(source.tabId);return;}const s=state(source.tabId);recordStale(s,'Debugger detached; inspect again');s.attached=false;journalGap(s.codeJournal,'detach');s.fetchBindings=newFetchBindings(s.run);s.override=null;s.analysis=null;s.experiment=null;beginInspection(s,{keepDiagnostic:true});s.events.push({detach:reason});await persist();notifyInvalidation(source.tabId);}
async function inspect(id,selector,context){await stopActionTrace(id,'Selection changed');await stopInputs(id,'Selection changed');const s=state(id);s.origin=new URL((await chrome.tabs.get(id)).url).origin;if(s.busy)throw Error('Experiment running; selection denied');const generation=beginInspection(s),run=s.run,property=s.property||'text';if(context)context.inspection={s,id,generation,run};const before=await identifySelection(id,selector,property);if(context?.pickIdentity&&(!context.pickerCurrent()||before?.document!==context.pickIdentity.document||before?.node!==context.pickIdentity.node))throw atomError('SELECTION_EXPIRED','Picker target changed before inspection');const operation={target:{tabId:id},world:'MAIN',func:observeElement,args:[selector,!!pairing&&pairing.origin===s.origin&&!s.readOnly]};await ownMainCode(id,s,operation,'selection-helper');const r=await chrome.scripting.executeScript(operation);if(context?.documentId&&r[0]?.documentId!==context.documentId)throw atomError('SELECTION_EXPIRED','Picker document changed before inspection');const selection=r[0].result;
 if(selection.unsupported)throw Error(selection.unsupported);
 selection.tabId=id;Object.assign(selection,await observeDeep(id,selection,property,{includeTrace:!!pairing&&pairing.origin===s.origin&&!s.readOnly,beforeMainScript:(op,role)=>ownMainCode(id,s,op,role)}));
 if(selection.trace)selection.trace={...selection.trace,exchangeBindings:bindFetchTrace(selection.trace,s.fetchBindings,{mainFrameId:s.mainFrameId,run})};
 selection.domIdentity=await identifySelection(id,selector,property);
 if(tabs[id]!==s||!isCurrentInspection(s,generation,run)||!isSameSelection(before,selection.domIdentity)||selection.domIdentity.property!==selection.property||selection.domIdentity.value!==selection.value)throw Error('Selection changed during inspection; inspect again');
 let firstReadCode=null;if(selection.trace?.firstReadObservations){await drainCode(id,s);if(!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');await bindOwnedFetchCode(s.codeJournal,s.fetchBindings,{page:selection.trace.page,run,mainFrameId:s.mainFrameId});const tree=(await send(id,'Page.getFrameTree')).frameTree,tab=await chrome.tabs.get(id),targets=await chrome.debugger.getTargets(),nativeTarget=targets.find(t=>t.tabId===id);firstReadCode={targetId:nativeTarget?.id||null,extensionId:chrome.runtime.id,journal:journalSnapshot(s.codeJournal,{mainFrameId:s.mainFrameId,selectionGeneration:generation,observedAt:selection.observedAt}),frameCount:1+(tree.childFrames?.length||0),openerAbsent:!Number.isInteger(tab.openerTabId)};}
 const sourceGeneration=s.sourceGeneration||0;const identity={run,build:await hashText([...s.samples].sort().join('')),freshness:'DOM observation; source unverified'};const analysis=await resolveInspection({selection,requests:s.requests,identity,resolve:pairing&&pairing.origin===s.origin?async()=>bridge('analyze',{origin:s.origin,selection,requests:s.requests,samples:s.samples,deepTrace:selection.trace,firstReadCode,proofs:await Promise.all(Object.entries(s.sampleEntries||{}).map(async([url,e])=>({url,kind:e.kind,digest:await hashText(e.text)}))),run},context?.signal):undefined});if(tabs[id]!==s||!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');await drainCode(id,s);if(tabs[id]!==s||!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');if(firstReadCode&&journalView(firstReadCode.journal,s.codeJournal).freshness!=='Recorded')throw Error('Code changed during inspection; inspect again');const native=s.attached?await nativeDOM(id,()=>inspectNativeActions((method,params)=>send(id,method,params),selector,identity,{...selection.domIdentity,marker:selection.instance})):[];if(native.some(b=>b.freshness==='Stale'))throw Error(native.find(b=>b.freshness==='Stale').entry.reason);
 const current=await identifySelection(id,selector,property);if(!isCurrentInspection(s,generation,run)||!isSameSelection(selection.domIdentity,current))throw Error('Selected DOM changed during action inspection');
 if(sourceGeneration!==(s.sourceGeneration||0))throw Error('Source changed during action inspection; inspect again');
 analysis.actionContext={schema:1,tabId:id,frameId:s.mainFrameId||null,run,inspection:generation,sourceGeneration,document:selection.domIdentity.document,instance:selection.domIdentity.node,build:identity.build,observedAt:selection.observedAt};
 installNativeActions(analysis,native,identity,typeof selection.instance==='string');
 if(tabs[id]!==s||!isCurrentInspection(s,generation,run))throw Error('Stale action result');
 if(context?.pickerCurrent&&!context.pickerCurrent())throw atomError('SELECTION_EXPIRED','Picker selection cancelled or replaced');
 analysis.codeJournal=journalSnapshot(s.codeJournal,{mainFrameId:s.mainFrameId,selectionGeneration:generation,observedAt:selection.observedAt});s.selection=selection;s.analysis=analysis;s.stale=null;s.analysisAt=Date.now();
 s.analysis.graph.nodes.push({...s.selection,id:'dom-observation',elementId:s.selection.id});s.analysis.graph.edges.push(edge('ui','dom-observation',(selection.property||'text')+'-at-selection','Observed','MAIN DOM read',['dom-observation'],s.analysis.graph.identity));
 await persist();if(tabs[id]!==s||!isCurrentInspection(s,generation,run))throw Error('Stale inspection result');if(firstReadCode&&journalView(firstReadCode.journal,s.codeJournal).freshness!=='Recorded'){recordStale(s,'Code changed during inspection; inspect again');beginInspection(s,{keepDiagnostic:true});await persist();throw Error('Code changed during inspection; inspect again');}if(sourceGeneration!==(s.sourceGeneration||0)){recordStale(s,'Source changed during action inspection; inspect again');beginInspection(s,{keepDiagnostic:true});await persist();throw Error('Source changed during action inspection; inspect again');}return s.analysis;}
async function refreshActionSources(s,signal){
 if(!pairing||pairing.origin!==s.origin||!s.analysis?.actionBindings?.some(b=>['react-jsx','vue-template'].includes(b.mechanism)))return;
 const analysis=s.analysis,sources=new Map();
 for(const b of analysis.actionBindings){for(const loc of [b.binding?.source,b.entry?.source,...(b.calls||[]).map(c=>c.source),...(b.hookRelations||[]).map(h=>h.source)])if(loc)sources.set(loc.file,{file:loc.file,sourceDigest:loc.sourceDigest});}
 let current=false;try{current=(await bridge('check-action-sources',{origin:s.origin,sources:[...sources.values()]} ,signal)).current===true;}catch{/* Missing/changed source stays unavailable. */}
 if(s.analysis===analysis&&!current){analysis.actionBindings=analysis.actionBindings.map(b=>['react-jsx','vue-template'].includes(b.mechanism)?{...b,freshness:'Stale'}:b);}
}
function installNativeActions(analysis,native,identity,occurrenceRequired=false){
 const unavailable=occurrenceRequired&&native.some(b=>b.id==='native:unknown');
 const source=(analysis.actionBindings||[]).filter(b=>b.mechanism!=='dom-listener').map(b=>unavailable?{...b,freshness:'Stale'}:b);
 analysis.graph??={identity,nodes:[],edges:[]};
 analysis.graph.nodes=(analysis.graph.nodes||[]).filter(n=>!(n.kind==='listener-registration'&&/^native:\d+$/.test(n.id)));
 analysis.graph.edges=(analysis.graph.edges||[]).filter(e=>!/^native:\d+:registration$/.test(e.id));
 for(const b of native)if(b.status==='Observed'){const evidenceId=b.id+':registration';analysis.graph.nodes.push({id:b.id,kind:'listener-registration',...b.registration});analysis.graph.edges.push({id:evidenceId,...edge('ui',b.id,'registered-on-'+b.registeredOn,'Observed','CDP DOMDebugger.getEventListeners',[evidenceId],identity)});}
 analysis.actionBindings=[...source,...native].slice(0,24).map(b=>({...b,identity:{...analysis.actionContext,sourceRevision:b.binding?.source?.sourceDigest||null}}));
}
async function refreshActionSnapshot(id,s,signal){
 const analysis=s.analysis,selected=s.selection,generation=s.inspectionGeneration,run=s.run;
 const current=()=>tabs[id]===s&&s.analysis===analysis&&s.selection===selected&&s.inspectionGeneration===generation&&s.run===run;
 await refreshActionSources(s,signal);if(!current())throw Error('Stale action source result');
 if(!selected||!analysis?.actionContext)return;
 const before=await identifySelection(id,selected.selector,selected.property);if(!current())throw Error('Stale action identity result');
 const stale=reason=>{recordStale(s,reason);beginInspection(s,{keepDiagnostic:true});};
 if(!isSameSelection(selected.domIdentity,before)){stale('Selected DOM node or value changed; inspect again');return;}
 if(!s.attached)return;
 const identity=analysis.graph?.identity||analysis.actionContext;
 const native=await nativeDOM(id,()=>inspectNativeActions((method,params)=>send(id,method,params),selected.selector,identity,{...selected.domIdentity,marker:selected.instance}));
 if(!current()||!s.attached)throw Error('Stale native action result');
 const after=await identifySelection(id,selected.selector,selected.property);if(!current()||!s.attached)throw Error('Stale native action identity result');
 if(!isSameSelection(selected.domIdentity,after)){stale('Selected DOM node or value changed; inspect again');return;}
 const expired=native.find(b=>b.freshness==='Stale');if(expired){stale(expired.entry.reason);return;}
 installNativeActions(analysis,native,identity,typeof selected.instance==='string');
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
 let publishAvailability=false;
 try{
  let result;const id=m.tabId;
  // Historical capture skips browser refresh, not the local unsaved-cache limit.
  if(m.op==='inputs-capture'&&tabs[id])cap(tabs[id]);
  const capabilityState=m.op==='inputs-capture'?inputCapturePolicyContext(id,context):id?await capabilityContext(id,m,context):{disposed:stopped};
  if(signal.aborted)throw atomError('CANCELLED');
  const decision=operationPolicy(m.op,capabilityState);if(!decision.available)throw atomError(decision.code,decision.reason);
  publishAvailability=['experiment','deep-experiment','restore'].includes(m.op);
  for(const grant of decision.requiredGrants){await platform.authorize(id,grant);if(signal.aborted)throw atomError('CANCELLED');}
  if(m.op==='capabilities')result=describeCapabilities(capabilityState);
  else if(m.op.startsWith('actions-'))result=await actionTraceOperation(id,m,context);
  else if(['production-begin','production-advance','production-confirm'].includes(m.op)){
   assertProductionClient(context);if(!platform.productionChanges?.available)throw atomError('CAPABILITY_UNAVAILABLE');
   context.cancelProduction=()=>{void platform.productionChanges.close(context.inspector,context.ownerId);};
   result=await platform.productionChanges.transition(m.op.slice('production-'.length),id,{ticket:m.ticket,owner:context.inspector,viewId:context.ownerId,assertCurrent:()=>assertProductionClient(context)});assertProductionClient(context);
   if(m.op==='production-confirm'){const s=state(id);s.productionGrantId=result.grantId;s.productionCleanup=null;s.attached=false;s.readOnly=true;recordStale(s,'Production changes enabled; attach read-only and inspect again');beginInspection(s,{keepDiagnostic:true});await persist();notifyInvalidation(id);}
  }
  else if(m.op==='production-cancel'){assertProductionClient(context);result={cancelled:platform.productionChanges.cancel(m.ticket,context.inspector,context.ownerId)};}
  else if(m.op==='production-close'){await platform.productionChanges?.close(context.inspector,context.ownerId);result={closed:true};}
  else if(m.op==='production-revoke'){result=await platform.productionChanges?.revoke(id,'user')||{active:false,cleanup:'none'};await stopInputs(id,'Production changes revoked');await persist();notifyInvalidation(id);}
  else if(m.op==='connect-site'||m.op==='forget-site'){const origin=new URL(capabilityState.url).origin;for(const [other,s]of Object.entries(tabs))if(Number(other)===id||s.origin===origin){invalidateScope(Number(other),'Site connection changed; attach again');await platform.invalidate?.(Number(other));}result=m.op==='connect-site'?await platform.connectSite(id,m.connection):await platform.forgetSite(id);await persist();}
  else if(m.op==='pair'){await Promise.allSettled([...actionOwners.keys()].map(id=>stopActionTrace(id,'Source connection changed')));await Promise.allSettled([...editors.values()].map(e=>e.close('Source connection changed')));const receipt=m.receipt?parseConnectionReceipt(m.receipt):null;if(receipt&&['url','token','origin','sourceRoot'].some(k=>receipt[k]!==m[k]))throw Error('Receipt fields do not match; paste a fresh connection receipt');if(!isBridgeURL(m.url)||!(synthetic(m.origin)||platform.approvedSite?.(m.origin))||new URL(m.origin).protocol!=='http:')throw Error('Bridge or application origin denied');if(!await platform.permittedOrigin?.(m.url))throw atomError('ORIGIN_DENIED','Helper browser permission required');for(const s of Object.values(tabs)){recordStale(s,'Source connection changed; inspect again');beginInspection(s,{keepDiagnostic:true});}pairing={url:m.url,token:m.token,origin:m.origin};try{result=await bridge('pair',{origin:m.origin,sourceRoot:m.sourceRoot,clientProtocol:HELPER_PROTOCOL,...(receipt?{connection:{schemaVersion:1,helper:receipt.helper,workspace:receipt.workspace}}:{})},signal);if(result.helper?.protocol!==HELPER_PROTOCOL||result.helper?.id!==HELPER_ID||result.helper?.version!==HELPER_VERSION)throw atomError('HELPER_VERSION_MISMATCH','Helper version mismatch. Install matching helper/plugin artifacts and copy a fresh receipt; Basic remains available');}catch(e){pairing=null;throw e;}await persist();}
  else if(m.op==='save-diagnostic'){const current=state(id);cap(current);if(!current.selection&&!current.stale?.target)throw Error('Observation unavailable or expired; inspect again');const report=makeDiagnostic({...current,sourceMaps:sourceMaps.snapshot(id),analysis:codeAnalysis(current)},{includeContent:m.includeContent===true,notes:m.notes});await diagnostics(store=>store.save(JSON.stringify(report)),context);result=report;}
  else if(m.op==='list-diagnostics')result=await diagnostics(legacyDiagnostics,context);
  else if(m.op==='delete-diagnostic')result=await diagnostics(async store=>{const file=await store.open(m.id);if(file?.version===1)await store.remove(m.id,file.digest);return legacyDiagnostics(store);},context);
  else if(m.op==='save-handoff')result=await diagnostics(store=>store.save(m.raw),context);
  else if(m.op==='list-handoffs')result=await diagnostics(store=>store.list(),context);
  else if(m.op==='open-handoff')result=await diagnostics(store=>store.open(m.id),context);
  else if(m.op==='delete-handoff')result=await diagnostics(store=>store.remove(m.id,m.expectedDigest),context);
  else if(m.op==='unpair'){await Promise.allSettled([...actionOwners.keys()].map(id=>stopActionTrace(id,'Source disconnected')));await Promise.allSettled([...editors.values()].map(e=>e.close('Source disconnected')));pairing=null;for(const s of Object.values(tabs)){recordStale(s,'IDE disconnected; inspect again');beginInspection(s,{keepDiagnostic:true});}await persist();result={paired:false};}
  else if(m.op==='tabs')result=(await chrome.tabs.query({})).filter(t=>allowed(t.url)||appOrigin(t.url)&&new URL(t.url).protocol==='http:').map(t=>({id:t.id,url:t.url}));
  else if(m.op==='attach'){await attach(id,m.readOnly===true);result={attached:true};}
  else if(m.op==='pick')result=await picker.start(id,state(id).run,{id:m.pickerId,signal,track:cancel=>context.cancelPicker=cancel});
  else if(m.op==='cancel-pick')result=await picker.cancel(id,undefined,m.pickerId);
  else if(m.op==='refine-pick')result=await picker.refine(id,m.pickerId,m.index,{signal,track:cancel=>context.cancelPicker=cancel});
  else if(m.op==='selected')throw atomError('SELECTION_EXPIRED','Legacy page picker has no active selection session');
  else if(m.op==='deep-experiment'){const s=state(id);await eligibleSelection(id,s);const selected=structuredClone(s.selection),lock=lockExperiment(s);try{result=await deepExperiment({id,s,send,reset,selection:s.selection,variants:m.variants,signal,includeTrace:!!pairing&&pairing.origin===s.origin&&!s.readOnly,beforeMainScript:(op,role)=>ownMainCode(id,s,op,role)});s.deepExperiment=result;s.diagnosticExperiment=recordDiagnosticExperiment(selected,result);await persist();}finally{unlockExperiment(s,lock);}}
  else if(m.op==='restore'){const s=state(id),selection=structuredClone(s.selection),lock=lockExperiment(s);try{s.deepOverrides=null;await reset(id,null);await new Promise(r=>setTimeout(r,400));result=await observeDeep(id,selection,selection?.property||'text',{includeTrace:!!pairing&&pairing.origin===s.origin&&!s.readOnly,beforeMainScript:(op,role)=>ownMainCode(id,s,op,role)});s.selection=selection?{...selection,...result}:null;}finally{unlockExperiment(s,lock);}}
  else if(m.op==='inputs-capture')result=await captureInputs(id,m,context);
  else if(m.op==='inputs-open')result=await openInputs(id,context,m.sourceKind);
  else if(m.op==='inputs-read'){result=await requireInputs(id,m.investigationId,context).read();await persist();}
  else if(m.op==='inputs-apply'){result=await requireInputs(id,m.plan.investigationId,context).apply(m.plan,{signal});await persist();}
  else if(m.op==='inputs-undo'||m.op==='inputs-baseline'){result=await requireInputs(id,m.investigationId,context)[m.op==='inputs-undo'?'undoLast':'restoreBaseline'](m.expectedRevision,{signal});await persist();}
  else if(m.op==='inputs-close'){requireInputOwner(id,context);const editor=editors.get(id);if(m.investigationId&&editor?.snapshot().investigationId!==m.investigationId)throw atomError('STALE_INVESTIGATION');result=await stopInputs(id,'Editor closed');await persist();}
  else if(m.op==='property'){await stopActionTrace(id,'Property changed');if(!['text','disabled'].includes(m.property))throw Error('Unsupported property');const s=state(id);if(s.property!==m.property){await stopInputs(id,'Selected property changed');recordStale(s,'Property changed; inspect again');beginInspection(s);}s.property=m.property;result={property:m.property};}
  else if(m.op==='inspect-selector'){if(typeof m.selector!=='string'||m.selector.length>1024)throw Error('Selector limit');const tab=await chrome.tabs.get(id);if(!allowed(tab.url))throw Error('Origin denied');result=await inspect(id,m.selector,context);}
  else if(m.op==='state'){const s=state(id);cap(s);const editor=editors.get(id),editorActive=editor&&!editor.snapshot().closed;const refreshLegacy=m.refreshDeep&&!editorActive&&!['starting','picking','resolving'].includes(picker.snapshot(id).status);if(m.refreshDeep&&editorActive){const generation=s.inspectionGeneration,run=s.run,selection=s.selection;try{await editor.read();}catch{if(tabs[id]===s&&editors.get(id)===editor&&s.inspectionGeneration===generation&&s.run===run&&s.selection===selection){recordStale(s,'Input editor target changed; inspect again');beginInspection(s,{keepDiagnostic:true});}}}if(refreshLegacy&&operationPolicy('inspect-selector',capabilityState).available){await refreshActionSnapshot(id,s,signal);}if(refreshLegacy&&operationPolicy('inspect-selector',capabilityState).available&&s.analysis?.stateatom&&s.selection&&!s.analysis.stateatom.firstReadProfile){const generation=s.inspectionGeneration,run=s.run;const current=await observeDeep(id,s.selection,s.property||'text',{includeTrace:s.analysis.capabilities?.sourceResolver==='open-ide',beforeMainScript:(op,role)=>ownMainCode(id,s,op,role)});if(tabs[id]!==s||s.inspectionGeneration!==generation||s.run!==run)throw Error('Stale inspection result');if(current.trace?.status==='Stale'){s.analysis.stateatom.runtime.status='Stale';s.analysis.stateatom.runtime.reason=current.trace.reason;}}result={...s,inputs:inputsSnapshot(id),inputHistory:undefined,inputRequests:undefined,inputIntervened:undefined,picker:picker.snapshot(id),productionChange:capabilityState.productionChange||{schemaVersion:1,active:false,target:null,grantId:null,remainingMs:0,operations:[],reason:'Two confirmations required',cleanup:'none'},projectSetup:assessProjectSetup({paired:pairing?.origin===new URL(capabilityState.url||'about:blank').origin&&(!s.analysis||s.analysis.capabilities?.sourceResolver==='open-ide'),selection:s.selection,analysis:s.analysis,sourceMaps:sourceMaps.snapshot(id)}),connection:{...(capabilityState.connection||{origin:new URL(capabilityState.url||'about:blank').origin,mode:'read-only',actions:[]}),source:pairing?.origin===new URL(capabilityState.url||'about:blank').origin?{url:pairing.url}:null},capabilityPolicy:describeCapabilities(await capabilityContext(id,{},context)),sourceMaps:sourceMaps.snapshot(id),analysis:codeAnalysis(s),codeJournal:undefined,documentPolicies:undefined,fetchBindings:undefined,samples:undefined,pending:undefined,bufferBytes:JSON.stringify(s.requests).length,sampleEntries:undefined,sampleBytes:s.samples.join('').length};}
  else if(m.op==='open'||m.op==='definitions'||m.op==='references'){const s=state(id);result=await bridge(m.op,{origin:s.origin,...m.source},signal);}
  else if(m.op==='experiment'){result=await experiment(id,m.field,m.value,m.actions,m.controlPath,signal);}
  else if(m.op==='detach'){await stopActionTrace(id,'Debugger detached');await stopInputs(id,'Debugger detached');await picker.cancel(id,'Debugger detached').catch(()=>{});sourceMaps.invalidate(id,'Debugger detached');const s=state(id);recordStale(s,'Debugger detached; inspect again');await chrome.debugger.detach({tabId:id});s.attached=false;journalGap(s.codeJournal,'detach');s.fetchBindings=newFetchBindings(s.run);s.override=null;s.analysis=null;s.experiment=null;beginInspection(s);s.events.push({detach:'explicit user action'});await persist();result={detached:true};}
  else if(m.op==='source-map-import'){if(!state(id).attached)throw Error('Attach this tab first');const bytes=Uint8Array.from(atob(m.data),c=>c.charCodeAt(0));result=await sourceMaps.import(id,m.scriptId,bytes,m.name,{signal});}
  else if(m.op==='source-map-acquire'){if(!state(id).attached)throw Error('Attach this tab first');result=await sourceMaps.acquire(id,m.scriptId,m.url,{signal});}
  else if(m.op==='source-map-lookup')result=sourceMaps.lookup(id,m.scriptId,m.line,m.column);
  else if(m.op==='source-map-clear'){sourceMaps.clear(id);result=sourceMaps.snapshot(id);}
  else if(m.op==='metrics')result=await send(id,'Performance.getMetrics');
  else throw Error('Unsupported operation');return result;
 }finally{if(publishAvailability)notifyInvalidation(m.tabId);}
}

async function productionRevoked(event){
 await ready;const s=tabs[event.tabId];if(!s)return;
 if(event.cleanup==='pending'&&s.productionGrantId&&s.productionGrantId!==event.grantId)return;
 if(event.cleanup!=='pending'&&s.productionCleanup?.grantId!==event.grantId)return;
 s.productionCleanup={grantId:event.grantId,reason:event.reason,cleanup:event.cleanup};
 if(event.cleanup==='pending'){s.productionGrantId=null;s.readOnly=true;s.attached=false;recordStale(s,'Production change permission '+event.reason+'; owned cleanup '+event.cleanup);beginInspection(s,{keepDiagnostic:true});await stopInputs(event.tabId,'Production change permission '+event.reason);}
 await persist();notifyInvalidation(event.tabId);
}
const unsubscribe=platform.events.subscribe(event=>{
 if(eventsClosed)return;
 const work=event.type==='production-revoked'?productionRevoked(event):event.type==='permissions-removed'?(async()=>{await ready;for(const id of Object.keys(tabs).map(Number))invalidateScope(id,'Browser access revoked; reconnect explicitly');pairing=null;await platform.permissionsRemoved?.();await persist();})():event.type==='navigation'?(async()=>{await ready;const s=tabs[event.tabId];void stopActionTrace(event.tabId,'Navigation changed context');void platform.productionChanges?.revoke(event.tabId,'navigation');if(s?.origin&&new URL(event.url).origin!==s.origin){invalidateScope(event.tabId,'Cross-origin navigation; attach again');await platform.invalidate?.(event.tabId);await persist();}})():event.type==='debugger'?onDebuggerEvent(event.source,event.method,event.params):event.type==='detach'?onDebuggerDetach(event.source,event.reason):event.type==='removed'?(async()=>{await ready;void stopActionTrace(event.tabId,'Tab closed');actionEpochs.delete(event.tabId);await stopInputs(event.tabId,'Tab closed');editors.delete(event.tabId);editorOwners.delete(event.tabId);await picker.cancel(event.tabId,'Tab closed').catch(()=>{});sourceMaps.remove(event.tabId);platform.detached(event.tabId);delete tabs[event.tabId];await persist();notifyInvalidation(event.tabId);})():null;
 if(work){eventJobs.add(work);void work.catch(()=>{}).finally(()=>eventJobs.delete(work));}
});
return {ready,
 connectInspector(session){
  if(stopped)throw atomError('DISPOSED');if(typeof session!=='string'||!session||session.length>100)throw atomError('INVALID_MESSAGE');
  if(inspectorClients.has(session))throw atomError('BUSY','Inspector session already connected');
  const token={active:true,closing:null};inspectorClients.set(session,token);
  return Object.freeze({close(reason='Inspector disconnected'){
   if(token.closing)return token.closing;token.active=false;
   const cleanup=[platform.productionChanges?.close(token)];for(const[id,owner]of actionOwners)if(owner.session===session&&owner.client===token)cleanup.push(stopActionTrace(id,reason));for(const[id,owner]of editorOwners)if(owner.session===session&&owner.client===token)cleanup.push(stopInputs(id,reason));
   for(const job of jobs.values())if(job.session===session&&job.inspector===token)job.abort();
   return token.closing=Promise.allSettled(cleanup).then(async results=>{if(inspectorClients.get(session)===token)inspectorClients.delete(session);await persist();return results;});
  }});
 },
 async request(message,{signal}={}){
  validateRequest(message);if(stopped)throw atomError('DISPOSED');
  const key=message.session+':'+message.id;if(jobs.has(key))throw atomError('INVALID_MESSAGE','Duplicate request');
  const controller=new AbortController(),id=message.payload.tabId;let rejectCancelled;const cancelled=new Promise((_,reject)=>{rejectCancelled=reject;});
  const context={signal:controller.signal,inspection:null,session:message.session,inspector:inspectorClients.get(message.session)||null,ownerId:message.payload.ownerId??null};
  const abort=()=>{controller.abort();context.cancelPicker?.();context.cancelInput?.();context.cancelProduction?.();context.cancelActionTrace?.();rejectCancelled(atomError('CANCELLED'));const own=context.inspection;if(own&&tabs[own.id]===own.s&&isCurrentInspection(own.s,own.generation,own.run))beginInspection(own.s,{keepDiagnostic:true});};
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  const promise=(async()=>{await ready;if(controller.signal.aborted)throw atomError('CANCELLED');const result=await operation(message.payload,context);if(controller.signal.aborted||stopped)throw atomError('CANCELLED');return result;})();
  jobs.set(key,{controller,promise,abort,session:message.session,inspector:context.inspector,tabId:id,op:message.payload.op});
  void promise.finally(()=>{jobs.delete(key);signal?.removeEventListener('abort',abort);}).catch(()=>{});return Promise.race([promise,cancelled]);
 },cancel(session,id){jobs.get(session+':'+id)?.abort();},
 shutdown(){return shutdownPromise??=(async()=>{stopped=true;const actionCleanup=[...actionOwners.keys()].map(id=>stopActionTrace(id,'Runtime stopped'));const inputCleanup=[...editors.values()].map(e=>e.close('Runtime stopped'));for(const j of jobs.values())j.abort();await Promise.allSettled([...jobs.values()].map(j=>j.promise));eventsClosed=true;unsubscribe();await Promise.allSettled([...eventJobs]);await ready;await Promise.allSettled([...inputCleanup,...actionCleanup]);await picker.dispose();sourceMaps.dispose();await platform.shutdown();for(const s of Object.values(tabs)){s.attached=false;recordStale(s,'Runtime stopped; attach and inspect again');beginInspection(s,{keepDiagnostic:true});}await persist();await diagnosticQueue;})();}
};
}
