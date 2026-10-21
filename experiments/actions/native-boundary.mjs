// SPDX-License-Identifier: Apache-2.0
// Finite protocol experiment. NativeCDP transport adapted from this repository's
// scripts/native-browser.mjs (Apache-2.0). No Atom/extension product acceptance.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir,readFile,readdir,open,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=process.cwd(),self='experiments/actions/native-boundary.mjs',fixture='tests/fixtures/inspection/action-trace-native.html',protocol='node_modules/playwright-core/types/protocol.d.ts',plan='docs/superpowers/plans/2026-10-21-a05-native-boundary.md';
const out='.artifacts/a05/native-boundary/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
const hash=s=>createHash('sha256').update(s).digest('hex'),inputs=async()=>Object.fromEntries(await Promise.all([self,fixture,protocol,plan,'package.json','package-lock.json'].map(async f=>[f,hash(await readFile(f))])));
const result={schema:'stateatom.a05-native-boundary/1',status:'RUNNING',revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),startedAt:new Date().toISOString(),inputsBefore:await inputs(),configuration:{scope:'Finite native protocol experiment; NOT Atom product/UI/permission acceptance',transport:'One owned Chrome raw CDP session per mode; no extension, wrapper, source instrumentation, app evaluation or getters',breakpoints:'Explicit click EventListener and native return-typed locations; separate same-source function breakpoint control',budget:{pauses:128,returnsPerActivation:8,caseMilliseconds:10000},historicalBeforeScriptExecutionRepeated:false,pausedTimingMayChange:true},checks:[],errors:[],cases:[],productA05Complete:false,asyncEffectsLinked:false};
await writeFile(out+'/driver.mjs',await readFile(self));await writeFile(out+'/fixture.html',await readFile(fixture));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(fn,timeout=10000){const until=Date.now()+timeout;let last;while(Date.now()<until){try{const r=await fn();if(r)return r;}catch(e){last=e;}await delay(20);}throw Error('Finite wait expired'+(last?': '+last.message:''));}
class NativeCDP{
 constructor(socket){this.socket=socket;this.next=0;this.pending=new Map();this.listeners=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(String(e.data));if(m.id){const p=this.pending.get(m.id);if(p){this.pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}}else for(const fn of this.listeners.get((m.sessionId||'')+':'+m.method)||[])fn(m.params);});socket.addEventListener('close',()=>{for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('Own native CDP closed'));}this.pending.clear();});}
 send(method,params={},sessionId){const id=++this.next;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error('Native command budget: '+method));},10000);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
 on(sessionId,event,fn){const key=(sessionId||'')+':'+event,list=this.listeners.get(key)||[];list.push(fn);this.listeners.set(key,list);}
 async session(targetId){const {sessionId}=await this.send('Target.attachToTarget',{targetId,flatten:true});return{send:(method,params)=>this.send(method,params,sessionId),on:(event,fn)=>this.on(sessionId,event,fn)};}
}
let owned;
async function close(){const o=owned;owned=null;if(!o)return;try{await o.cdp?.send('Browser.close');}catch{}if(o.child.exitCode===null){o.child.kill('SIGTERM');try{await waitFor(()=>o.child.exitCode!==null,3000);}catch{o.child.kill('SIGKILL');await waitFor(()=>o.child.exitCode!==null,3000);}}o.cdp?.socket.close();await o.log.close();}
async function launch(name){
 const profile=path.resolve(out,name);await mkdir(profile);let executable=chromium.executablePath();if(existsSync('.browsers')){const dir=(await readdir('.browsers')).find(n=>/^chromium-/.test(n));if(dir)executable=path.resolve('.browsers',dir,'chrome-linux64/chrome');}
 const log=await open(profile+'/chrome.log','wx'),child=spawn(executable,['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--disable-extensions','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-dev-shm-usage','about:blank'],{stdio:['ignore',log.fd,log.fd]});owned={child,log};
 const endpoint=await waitFor(async()=>{if(child.exitCode!==null)throw Error('Own Chrome exited '+child.exitCode);const [port,suffix]=String(await readFile(profile+'/DevToolsActivePort')).trim().split('\n');return'ws://127.0.0.1:'+port+suffix;});
 const socket=new WebSocket(endpoint);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});const cdp=new NativeCDP(socket);owned.cdp=cdp;
 const version=await cdp.send('Browser.getVersion'),{targetId}=await cdp.send('Target.createTarget',{url:'about:blank'}),session=await cdp.session(targetId);
 return{cdp,session,version,executable};
}
const selectors=['#direct','#direct-child','#capture-child','#delegated-child','#arrow','#bound','#disabled','#factory-a','#factory-b','#replace-target','#replace-handler','#replace-target','#throwing','#finally','#finally-throw','#async','#unrelated'];
async function mode(enabled){
 const b=await launch(enabled?'on':'off'),s=b.session,pauses=[],ownedReturns=new Map(),pending=new Set(),scripts=new Map();let current,listenerArmed=false,callBreakpoint=null,overflow=false;
 const record={enabled,browser:b.version,executable:b.executable,cases:[],pauses,cleanup:[]};result.cases.push(record);
 async function node(selector){const {root}=await s.send('DOM.getDocument'),{nodeId}=await s.send('DOM.querySelector',{nodeId:root.nodeId,selector});assert(nodeId,'Missing synthetic '+selector);const {node}=await s.send('DOM.describeNode',{nodeId});return{nodeId,backendNodeId:node.backendNodeId,nodeName:node.nodeName};}
 async function output(){const n=await node('#output'),{outerHTML}=await s.send('DOM.getOuterHTML',{nodeId:n.nodeId});return JSON.parse(outerHTML.slice(outerHTML.indexOf('>')+1,outerHTML.lastIndexOf('<')).replaceAll('&quot;','"').replaceAll('&gt;','>').replaceAll('&lt;','<').replaceAll('&amp;','&'));}
 async function removeReturns(){for(const id of ownedReturns.keys())await s.send('Debugger.removeBreakpoint',{breakpointId:id});ownedReturns.clear();}
 async function click(selector){const n=await node(selector);await s.send('DOM.scrollIntoViewIfNeeded',{nodeId:n.nodeId});const {model}=await s.send('DOM.getBoxModel',{nodeId:n.nodeId}),q=model.content,x=(q[0]+q[2]+q[4]+q[6])/4,y=(q[1]+q[3]+q[5]+q[7])/4;
  for(const type of ['mouseMoved','mousePressed','mouseReleased'])await s.send('Input.dispatchMouseEvent',{type,x,y,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});await delay(35);await Promise.all([...pending]);return n;}
 async function paused(p){
  try{
   if(pauses.length>=128){overflow=true;throw Error('Pause budget exceeded');}
   const f=p.callFrames?.[0],native={reason:p.reason,dataKeys:Object.keys(p.data||{}).sort(),eventName:typeof p.data?.eventName==='string'?p.data.eventName:undefined,targetName:typeof p.data?.targetName==='string'?p.data.targetName:undefined,hitBreakpoints:p.hitBreakpoints||[],case:current?.selector,frame:f?{callFrameId:f.callFrameId,functionName:f.functionName,location:f.location,functionLocation:f.functionLocation,scriptURL:scripts.get(f.location.scriptId)?.url}:null,thisNode:null,returnPointOnly:true,eventObjectIdentity:'Unavailable',originalEventTarget:'Unavailable',runtimeFunctionObjectIdentity:'Unavailable'};
   if(f?.this?.objectId)try{const {node}=await s.send('DOM.describeNode',{objectId:f.this.objectId});native.thisNode={backendNodeId:node.backendNodeId,nodeName:node.nodeName};}catch{native.thisBoundary='Native this value is not a DOM node';}
   pauses.push(native);
   native.ownedReturnHits=(p.hitBreakpoints||[]).filter(id=>ownedReturns.has(id)).map(id=>({breakpointId:id,entryObservation:ownedReturns.get(id)}));
   if(p.reason==='EventListener'&&f){
    const {locations}=await s.send('Debugger.getPossibleBreakpoints',{start:f.location,restrictToFunction:true});native.possibleLocationTypes=[...new Set(locations.map(l=>l.type||'ordinary'))];const returns=locations.filter(l=>l.type==='return');native.returnLocations=returns.slice(0,8);native.returnLocationBudgetExceeded=returns.length>8;
    for(const location of returns.slice(0,8)){const {type,...position}=location;const {breakpointId,actualLocation}=await s.send('Debugger.setBreakpoint',{location:position});ownedReturns.set(breakpointId,pauses.length-1);(native.installedReturns??=[]).push({breakpointId,actualLocation});}
   }
  }catch(e){result.errors.push('Pause acquisition: '+e.message);}finally{await s.send('Debugger.resume').catch(e=>result.errors.push('Own resume: '+e.message));}
 }
 s.on('Debugger.scriptParsed',p=>scripts.set(p.scriptId,{url:p.url,executionContextId:p.executionContextId,hash:p.hash}));
 s.on('Debugger.paused',p=>{const t=paused(p);pending.add(t);t.finally(()=>pending.delete(t));});
 await s.send('Page.enable');await s.send('DOM.enable');await s.send('Debugger.enable');await s.send('Page.navigate',{url:pathToFileURL(path.resolve(fixture)).href});await waitFor(()=>output());
 record.frame=(await s.send('Page.getFrameTree')).frameTree.frame;record.initial=await output();
 if(enabled){await s.send('DOMDebugger.setEventListenerBreakpoint',{eventName:'click',targetName:'*'});listenerArmed=true;}
 for(const selector of selectors){current={selector,index:record.cases.length};const before=pauses.length,beforeOutput=await output();current.selected=await node(selector);await click(selector);current.output=await output();current.beforeOutput=beforeOutput;current.pauseIndices=Array.from({length:pauses.length-before},(_,i)=>i+before);record.cases.push(current);await removeReturns();}
 if(listenerArmed){await s.send('DOMDebugger.removeEventListenerBreakpoint',{eventName:'click',targetName:'*'});listenerArmed=false;record.cleanup.push('EventListener breakpoint removed');}
 // Acquire an actual registered handler object through native metadata, never
 // evaluate an expression to obtain it. The same-source B invocation is control.
 if(enabled){const n=await node('#factory-a'),{object}=await s.send('DOM.resolveNode',{nodeId:n.nodeId,objectGroup:'a05-native-probe'}),{listeners}=await s.send('DOMDebugger.getEventListeners',{objectId:object.objectId});const handler=listeners.find(l=>l.type==='click')?.handler?.objectId;assert(handler,'Native registered function object unavailable');
  ({breakpointId:callBreakpoint}=await s.send('Debugger.setBreakpointOnFunctionCall',{objectId:handler}));current={selector:'#factory-b',kind:'same-source-function-breakpoint'};const before=pauses.length;current.selected=await click('#factory-b');current.output=await output();current.pauseIndices=Array.from({length:pauses.length-before},(_,i)=>i+before);record.functionBreakpointControl=current;await s.send('Debugger.removeBreakpoint',{breakpointId:callBreakpoint});callBreakpoint=null;await s.send('Runtime.releaseObjectGroup',{objectGroup:'a05-native-probe'});record.cleanup.push('Function breakpoint and native object group removed');
 }
 const beforeCleanupClick=pauses.length;current={selector:'#direct',kind:'disarmed-control'};await click('#direct');record.afterDisarm=await output();record.disarmedNewPauses=pauses.length-beforeCleanupClick;record.overflow=overflow;record.scripts=[...scripts.entries()].filter(([,v])=>v.url===pathToFileURL(path.resolve(fixture)).href).map(([scriptId,v])=>({scriptId,...v}));
 assert.equal(record.disarmedNewPauses,0);assert.equal(ownedReturns.size,0);assert.equal(listenerArmed,false);assert.equal(callBreakpoint,null);assert.equal(overflow,false);record.cleanup.push('Disarmed real click has zero pauses; only own Chrome closed');await close();return record;
}
try{
 const off=await mode(false),on=await mode(true);assert(off.pauses.length===0);assert(on.pauses.length>0);
 assert.deepEqual(on.initial,off.initial);assert.equal(on.cases.length,selectors.length);for(let i=0;i<selectors.length;i++)assert.deepEqual(on.cases[i].output,off.cases[i].output,selectors[i]);result.checks.push({name:'Original native interaction outputs/order/error identity agree off/on for all finite controls',status:'PASS'});
 const disabled=on.cases.find(c=>c.selector==='#disabled');assert.equal(disabled.pauseIndices.length,0);assert.deepEqual(disabled.output,disabled.beforeOutput);result.checks.push({name:'Disabled control neither invokes nor pauses',status:'PASS'});
 const direct=on.pauses.find(p=>p.case==='#direct'&&p.reason==='EventListener');assert(direct);assert.equal(direct.thisNode?.backendNodeId,on.cases[0].selected.backendNodeId);result.checks.push({name:'Actual direct EventListener pause identifies native currentTarget through this',status:'PASS'});
 const control=on.functionBreakpointControl,hits=control.pauseIndices.map(i=>on.pauses[i]);assert(hits.some(p=>p.hitBreakpoints.length>0));assert(hits.some(p=>p.thisNode?.backendNodeId===control.selected.backendNodeId));result.checks.push({name:'Breakpoint on registered closure A also fires closure B from same source; identity shortcut rejected',status:'PASS'});
 assert.equal(on.disarmedNewPauses,0);result.checks.push({name:'Owned breakpoints cleaned; later trusted click has no pause',status:'PASS'});
 result.findings={eventListenerEntries:on.pauses.filter(p=>p.reason==='EventListener').length,returnPointPauses:on.pauses.filter(p=>p.ownedReturnHits.length).length,missingNativeThis:on.pauses.filter(p=>p.reason==='EventListener'&&!p.thisNode).map(p=>p.case),eventObjectIdentity:'Unavailable; not inferred from click time/currentTarget/source',originalEventTargetIdentity:'Unavailable without a separate supported carrier',completedSynchronousExit:'Not accepted from a pre-return breakpoint alone',sameSourceFunctionObjectIdentity:'Rejected by actual A/B control',asyncConsequences:'Unlinked; fixture scheduling equality is not causality'};
 result.status='PARTIAL_NATIVE_ENTRY_AND_RETURN_POINTS_NOT_A05_ACCEPTANCE';
}catch(e){result.status='FAIL';result.errors.push(String(e.stack||e));process.exitCode=1;}
finally{try{await close();}catch(e){result.errors.push('Cleanup: '+e.message);}result.inputsAfter=await inputs();result.inputsStable=JSON.stringify(result.inputsBefore)===JSON.stringify(result.inputsAfter);if(!result.inputsStable||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2)+'\n');console.log(result.status,out,result.checks,result.errors);}
