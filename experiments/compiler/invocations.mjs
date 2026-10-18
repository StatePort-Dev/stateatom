// SPDX-License-Identifier: Apache-2.0
// Experimental entry-record/native-reference acquisition. Not product UI or readonly proof.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';
import {createHash} from 'node:crypto';
import {phaseConfig} from "../../scripts/inspection-server.mjs";
import {root} from "../../scripts/vite-config.mjs";
import {startBrowser,waitFor} from "../../scripts/harness.mjs";
import {fileDigests} from "../../scripts/short-loop-inputs.mjs";
import {instrumentEntries} from './entry-records.mjs';
import {nativeReferences,assertEntryOwner} from './references.mjs';
import {runClosureControl} from './telemetry-controls.mjs';
import {effectFrontier,helperWriterControl} from './effect-frontier.mjs';
import {operandCheckpoint} from './operands.mjs';
const operands=process.argv.includes('--operands');
const effects=process.argv.includes('--effects-frontier')||operands;
const hash=x=>createHash('sha256').update(x).digest('hex');
const tag=process.env.INVOCATION_TAG||new Date().toISOString().replaceAll(/[:.]/g,'-');assert.match(tag,/^[a-zA-Z0-9_-]{1,100}$/);
const out=root+'/.runtime/invocation-probes/'+tag;await mkdir(root+'/.runtime/invocation-probes',{recursive:true});await mkdir(out);
const inputs=['experiments/compiler','src/engine','tests/fixtures/inspection',"scripts/inspection-server.mjs",'scripts/harness.mjs','scripts/vite-config.mjs','package.json','package-lock.json'];const before=await fileDigests(root,inputs);
let revision=null;try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
const result={revision,sourceArchive:revision===null,startedAt:new Date().toISOString(),inputs:before,configuration:{acquisitionOnly:true,effectFrontier:effects,entryOperands:operands,productUI:false,browserPlugin:'Unavailable; pinned Playwright/CDP',noEvaluation:true,noDebuggerPause:true,timing:'Precise coverage prevents optimized code; no timing equivalence claim',claim:'Instrumented returned-record-to-function reference; native closure snapshot at checkpoint, not native invocation attestation or readonly history'},checks:[],errors:[],fullPath:false};
const append=`
const __sa_mode=globalThis.__SA_DECLARED_ENTRY_MODE__;
const __sa_map_original=globalThis.__SA_DECLARED_MAP_ORIGINAL__;
if(__sa_map_original){Object.defineProperty(Map.prototype,'set',__sa_map_original);delete globalThis.__SA_DECLARED_MAP_ORIGINAL__;}
document.documentElement.setAttribute('data-sa-map-restored',String(!__sa_map_original||Object.getOwnPropertyDescriptor(Map.prototype,'set').value===__sa_map_original.value));
const __sa_clock_result=(${runClosureControl.toString()})(__sa);
document.documentElement.setAttribute('data-sa-clock',JSON.stringify(__sa_clock_result));
class __sa_Response extends Response{};
const __sa_other=createObserver({crypto,Response:__sa_Response,fetch:()=>Promise.resolve(new __sa_Response('{}')),location:{href:'http://127.0.0.1:4173/'}});
__sa_other.member({file:'controlled.ts',key:'other'}, {quota:777},'quota');
if(__sa_mode==='retention')for(let i=0;i<257;i++)__sa_other.member({file:'controlled.ts',key:'overflow'},{quota:i},'quota');
const __sa_touch=()=>{const n=+(document.documentElement.getAttribute('data-sa-traps')||0);document.documentElement.setAttribute('data-sa-traps',String(n+1));throw Error('declared property trap');};
document.documentElement.setAttribute('data-sa-traps','0');
const __sa_surface=__sa_mode==='foreign-marker'?__sa_other:__sa_mode==='proxy'?new Proxy(__sa,{get:__sa_touch,ownKeys:__sa_touch,getOwnPropertyDescriptor:__sa_touch}):__sa_mode==='method-accessor'?Object.freeze({get member(){return __sa_touch();}}):__sa;
if(globalThis.__SA_DECLARED_OPERANDS__&&__sa_mode!=='off'){
 if(__sa_mode.startsWith('operand-')){
  let __sa_reads=0,__sa_keys=0;const __sa_original={quota:12};let __sa_receiver=__sa_original,__sa_key='quota';
  if(__sa_mode==='operand-accessor')__sa_receiver={get quota(){__sa_reads++;return 12;}};
  if(__sa_mode==='operand-proxy')__sa_receiver=new Proxy(__sa_original,{get(target,key){__sa_reads++;return target[key];},getOwnPropertyDescriptor(){__sa_touch();}});
  if(__sa_mode==='operand-object-key')__sa_key={[Symbol.toPrimitive](){__sa_keys++;return 'quota';}};
  if(__sa_mode==='operand-same-value-before')__sa_receiver.quota=12;
  __sa.member({file:'controlled.ts',key:'operand-control',expression:'receiver.quota'},__sa_receiver,__sa_key);
  document.documentElement.setAttribute('data-sa-operand-entry',String(__sa_invocation_log.count));
  if(__sa_mode==='operand-later-value')__sa_receiver.quota=99;
  document.documentElement.setAttribute('data-sa-operand-counts',JSON.stringify({reads:__sa_reads,keys:__sa_keys}));
 }
 const __sa_stop_button=document.createElement('button');__sa_stop_button.id='sa-declared-stop';__sa_stop_button.textContent='Stop disposable observer probe';__sa_stop_button.addEventListener('click',()=>__sa.stop());document.body.appendChild(__sa_stop_button);
}
const __sa_holder=__sa_mode==='root-accessor'?Object.freeze({get observer(){return __sa_touch();}}):Object.freeze({observer:__sa_surface});
Object.defineProperty(document.documentElement,'__SA_DECLARED_PROBE__',{value:__sa_holder,configurable:true});
if(__sa_mode==='foreign-marker'){const guard=new MutationObserver(()=>{const elements=[document.querySelector('#p1'),document.querySelector('#p2')];if(elements.some(e=>!e?.getAttribute('data-stateatom')))return;guard.disconnect();for(const element of elements){const marker=element.getAttribute('data-stateatom'),i=marker.lastIndexOf(':');__sa_other.target({file:'controlled.ts',key:'foreign',target:marker.slice(i+1),property:element.id==='p1'?'text':'disabled'},marker.slice(0,i),()=>{if(element.id==='p1')return 13;__sa_other.member({file:'controlled.ts',key:'foreign-member'},{quota:12},'quota');return false;});}document.documentElement.setAttribute('data-sa-foreign-ready','true');});guard.observe(document.documentElement,{childList:true,subtree:true,attributes:true});}
`;
let server,browser,modeDeadline;const check=(name,fn)=>{fn();result.checks.push({name,status:'PASS'});};
async function mode(name){
 const cfg=phaseConfig('B',{reactHostProps:true,reactStateHandoffs:true,sourceWrites:true,writeAccessGuards:true,reactWriteAccessGuards:true,queryHandoffs:true,queryCallCensus:true,queryWriteAccessGuards:true});
 cfg.plugins.push({name:'declared-member-entry-probe',enforce:'post',transform(code,id){if(id!=='\0stateatom-runtime')return;let transformed=name==='off'?code:instrumentEntries(code,{retainOperands:operands}).code;if(name==='helper-writer')transformed=helperWriterControl(transformed);return{code:transformed+append,map:null};}});
 server=await createServer(cfg);await server.listen();browser=await startBrowser(out,name,false);result.browser=browser.context.browser()?.version();if(operands){const ownedContext=browser.context;modeDeadline=setTimeout(()=>ownedContext.close().catch(()=>{}),20000);}const page=await browser.context.newPage(),cdp=await browser.context.newCDPSession(page),scripts=new Map(),contexts=new Map();let pauses=0;const pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(String(e)));cdp.on('Debugger.paused',()=>{pauses++;});cdp.on('Debugger.scriptParsed',s=>scripts.set(s.scriptId,s));cdp.on('Runtime.executionContextCreated',e=>contexts.set(e.context.id,e.context));
 await cdp.send('Runtime.enable');await cdp.send('Debugger.enable');await cdp.send('Page.enable');await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
 if(name==='coverage'){await cdp.send('Profiler.enable');await cdp.send('Profiler.startPreciseCoverage',{callCount:true,detailed:true,allowTriggeredUpdates:false});}
 await page.addInitScript(({mode,operands})=>{globalThis.__SA_DECLARED_ENTRY_MODE__=mode;globalThis.__SA_DECLARED_OPERANDS__=operands;},{mode:name,operands});
 if(name==='prebootstrap'||name==='prebootstrap-bound')await page.addInitScript(bound=>{const original=Object.getOwnPropertyDescriptor(Date,'now'),apply=Reflect.apply;globalThis.__SA_DECLARED_CLOCK_ORIGINAL__=original;const replacement=function(){const state=globalThis.__SA_DECLARED_CLOCK_STATE__;if(state){state.calls++;state.data.quota=99;}return apply(original.value,Date,[]);};Object.defineProperty(Date,'now',{...original,value:bound?replacement.bind(null):replacement});},name==='prebootstrap-bound');
 if(name==='prebootstrap-map-set')await page.addInitScript(()=>{const original=Object.getOwnPropertyDescriptor(Map.prototype,'set'),apply=Reflect.apply;globalThis.__SA_DECLARED_MAP_ORIGINAL__=original;Object.defineProperty(Map.prototype,'set',{...original,value:function(key,value){const state=globalThis.__SA_DECLARED_CLOCK_STATE__;if(state){state.calls++;state.data.quota=99;}return apply(original.value,this,[key,value]);}});});
 await page.goto('http://127.0.0.1:4173/react/');
 let documentRoot=null;async function node(selector){const rootId=documentRoot||(await cdp.send('DOM.getDocument')).root.nodeId;return(await cdp.send('DOM.querySelector',{nodeId:rootId,selector})).nodeId;}
 const outer=async selector=>(await cdp.send('DOM.getOuterHTML',{nodeId:await node(selector)})).outerHTML;
 await waitFor(async()=>/\b13<\//.test(await outer('#p1')));
 documentRoot=(await cdp.send('DOM.getDocument')).root.nodeId;const frame=(await cdp.send('Page.getFrameTree')).frameTree.frame.id,html=await node('html'),attrs=(await cdp.send('DOM.getAttributes',{nodeId:html})).attributes;
 const attr=(list,key)=>{const i=list.indexOf(key);return i<0?null:list[i+1];};
 const snapshot={checkpoint:{id:tag+':'+name,startedAt:new Date().toISOString(),frameId:frame},dom:{p1:await outer('#p1'),p2:await outer('#p2'),semantics:await outer('#semantics')},clock:JSON.parse(attr(attrs,'data-sa-clock')),publicMapRestored:attr(attrs,'data-sa-map-restored')==='true',pauses,pageErrors,bindings:[],gaps:[],fullPath:false};
 const refs=nativeReferences(cdp);const object=(await cdp.send('DOM.resolveNode',{nodeId:html,objectGroup:'entry-checkpoint'})).object;
 try{
  const holder=await refs.own(object,'__SA_DECLARED_PROBE__'),api=await refs.own(holder,'observer'),member=await refs.own(api,'member');
  snapshot.memberLocation=await refs.location(member);
  if(name==='invalidated')await page.goto('about:blank');
  if(name==='repaint')await page.locator('#form').fill('new inspection');
  if(name!=='off'){
   const ownerPage=(await refs.scope(member,'page')).value;
   if((await refs.scope(member,'active')).value!==true||(await refs.scope(member,'stale')).value!==null)throw Error('Observer inactive or stale at native checkpoint');
   const log=await refs.scope(member,'__sa_invocation_log');snapshot.entryCount=await refs.primitive(log,'count');snapshot.overflow=await refs.primitive(log,'overflow');if(snapshot.overflow)throw Error('Entry retention exceeded; no complete selected-event acquisition');
   const entries=await refs.own(log,'entries'),slots=(await refs.properties(entries)).result.filter(p=>/^\d+$/.test(p.name)),events=[];
   for(const slot of slots){const properties=await refs.properties(slot.value);events.push({properties,sequence:Number(slot.name),callee:refs.data(properties,'callee'),page:refs.data(properties,'page').value,nodeId:refs.data(properties,'nodeId').value});}
   if(operands&&attr(attrs,'data-sa-operand-entry')){const sequence=Number(attr(attrs,'data-sa-operand-entry')),event=events.find(e=>e.sequence===sequence);assert(event);snapshot.operandControl=await operandCheckpoint({refs,event:event.properties});snapshot.operandCounts=JSON.parse(attr(attrs,'data-sa-operand-counts'));}
   const nodes=await refs.map(await refs.scope(member,'nodes')),targets=await refs.map(await refs.scope(member,'targets'));
   snapshot.pages=[...new Set(events.map(e=>e.page))];
   const locations=[];for(const page of snapshot.pages){const event=events.find(e=>e.page===page);locations.push({page,location:await refs.location(event.callee)});}snapshot.instanceLocations=locations;
   for(const[selector,property]of[['#p1','text'],['#p2','disabled']]){
    const attributes=(await cdp.send('DOM.getAttributes',{nodeId:await node(selector)})).attributes,marker=attr(attributes,'data-stateatom'),target=targets.get(marker+':'+property)?.value;if(marker!==snapshot.dom[selector==='#p1'?'p1':'p2'].match(/data-stateatom="([^"]*)"/)?.[1])throw Error('Selection changed after native checkpoint');assert(target,'actual retained selected target');assertEntryOwner({marker,ownerPage,eventPage:ownerPage,nodeId:target});
    const seen=new Set(),selected=[];async function walk(id){if(seen.has(id))return;if(seen.size>=120)throw Error('Selected closure budget');seen.add(id);const value=nodes.get(id);if(!value)throw Error('Selected node evicted');const properties=await refs.properties(value);if(properties.result.some(p=>p.name==='missingDependencies'&&p.value?.value===true))throw Error('Selected dependency retention incomplete');if(refs.data(properties,'kind').value==='member')selected.push(id);const deps=refs.data(properties,'deps');for(const dep of(await refs.properties(deps)).result.filter(p=>/^\d+$/.test(p.name)))await walk(dep.value.value);}
    await walk(target);if(!selected.length)snapshot.gaps.push({selector,property,reason:'No member node in selected retained dependency closure; no callee link fabricated'});
    for(const id of selected){const matches=events.filter(e=>e.nodeId===id);assert.equal(matches.length,1,'exact returned-record entry');const event=matches[0],callee=await refs.location(event.callee),calleePage=(await refs.scope(event.callee,'page')).value;
     assertEntryOwner({marker,ownerPage,eventPage:event.page,nodeId:id});assert.equal(event.page,calleePage);assert.equal(calleePage,ownerPage);assert(id.startsWith(calleePage+':'));
     const ops=await refs.scope(event.callee,'telemetryOps'),now=await refs.own(ops,'now'),clock=await refs.scope(now,'clock'),clockLocation=await refs.location(clock);
     const script=scripts.get(callee.scriptId),context=contexts.get(script?.executionContextId);assert.equal(context?.auxData?.isDefault,true);assert.equal(context?.auxData?.frameId,frame);
     const body=(await cdp.send('Debugger.getScriptSource',{scriptId:callee.scriptId})).scriptSource;
     let clockSource=null;if(clockLocation){const s=scripts.get(clockLocation.scriptId);clockSource={digest:hash((await cdp.send('Debugger.getScriptSource',{scriptId:clockLocation.scriptId})).scriptSource),sameContext:s?.executionContextId===script.executionContextId};}
     snapshot.bindings.push({selector,property,nodeId:id,page:calleePage,entrySequence:event.sequence,frameId:frame,contextUniqueId:context.uniqueId,checkpoint: snapshot.checkpoint.id,callee:{...callee,sourceDigest:hash(body)},clock:{location:clockLocation,source:clockSource,noJSLocationIsNotNativeAttestation:!clockLocation},status:'Observed',mechanism:'Declared instrumented entry/node association plus native function/closure checkpoint',readonlyEffects:'Unknown/Unsupported',fullPath:false});
     if(operands&&(await refs.own(nodes.get(id),'expression')).value==='record.rules.quota')snapshot.bindings.at(-1).operands=await operandCheckpoint({refs,event:event.properties});
     if(effects&&(await refs.own(nodes.get(id),'expression')).value==='record.rules.quota'){
      const binding=snapshot.bindings.at(-1);binding.effects=await effectFrontier({refs,cdp,member:event.callee,binding,scripts,contexts});
     }
    }
   }
   assert(!snapshot.bindings.some(b=>b.selector==='#p1'));assert(snapshot.bindings.some(b=>b.selector==='#p2'));
  }
  for(const[selector,field]of[['#p1','p1'],['#p2','p2']]){const current=(await cdp.send('DOM.getAttributes',{nodeId:await node(selector)})).attributes;if(attr(current,'data-stateatom')!==snapshot.dom[field].match(/data-stateatom="([^"]*)"/)?.[1])throw Error('Selection changed during native checkpoint');}refs.guard();
  if(operands&&name!=='off'){const log=await refs.scope(member,'__sa_invocation_log'),entries=await refs.own(log,'entries');await page.locator('#sa-declared-stop').click();const remaining=(await refs.properties(entries)).result.filter(p=>/^\d+$/.test(p.name));for(const entry of remaining)assert.notEqual(await refs.primitive(entry.value,'page'),(await refs.scope(member,'page')).value);snapshot.operandCleanup={stoppedOwnerEntries:0,otherOwnerEntries:remaining.length,contextDeadlineMs:20000};}
  snapshot.acquisition='Observed checkpoint references; effect and lifetime history unverified';
 }catch(error){snapshot.acquisition='Unknown/Unsupported';snapshot.reason=String(error.message);snapshot.bindings=[];}
 if(name==='coverage'){
  const coverage=await cdp.send('Profiler.takePreciseCoverage');snapshot.coverage=coverage.result.filter(s=>s.scriptId===snapshot.memberLocation?.scriptId).flatMap(s=>s.functions.filter(f=>f.functionName==='member').map(f=>({scriptId:s.scriptId,...f})));await cdp.send('Profiler.stopPreciseCoverage');
 }
 snapshot.rawDOM=snapshot.dom;snapshot.dom=Object.fromEntries(Object.entries(snapshot.rawDOM).map(([key,value])=>[key,value.replace(/data-stateatom="[a-f0-9-]{36}:/g,'data-stateatom="[PAGE]:')]));
 snapshot.references=refs.stats();refs.close();await cdp.send('Runtime.releaseObjectGroup',{objectGroup:'entry-checkpoint'});
 snapshot.traps=name==='invalidated'?attr(attrs,'data-sa-traps'):attr((await cdp.send('DOM.getAttributes',{nodeId:html})).attributes,'data-sa-traps');snapshot.pauses=pauses;snapshot.checkpoint.completedAt=new Date().toISOString();
 assert.equal(snapshot.pauses,0);assert.deepEqual(pageErrors,[]);assert.equal(snapshot.traps,'0');
 clearTimeout(modeDeadline);await browser.context.close();browser=null;await server.close();server=null;await writeFile(out+'/'+name+'.json',JSON.stringify(snapshot,null,2));return snapshot;
}
try{
 const off=await mode('off'),ordinary=await mode('ordinary');
 check('original selected P1/P2 and semantic getter/error outputs agree without and with entry probe',()=>{assert.deepEqual(ordinary.dom,off.dom);assert.match(off.dom.p1,/>13<\//);assert(!/\sdisabled(?:[=\s>])/.test(off.dom.p2));assert.match(off.dom.semantics,/"count":1/);assert.match(off.dom.semantics,/"same":true/);});
 check('selected retained member observations link exact entered function objects and current captured clock without evaluation or pause',()=>{assert(ordinary.bindings.length>0,ordinary.reason);for(const b of ordinary.bindings){assert.equal(b.callee.sourceDigest.length,64);assert.equal(b.clock.location,null);assert.equal(b.readonlyEffects,'Unknown/Unsupported');assert.equal(b.fullPath,false);}});
 check('two factory instances share one native function location yet retain different page and event identities',()=>{assert.equal(ordinary.pages.length,2);assert.deepEqual(ordinary.instanceLocations[0].location,ordinary.instanceLocations[1].location);assert.notEqual(ordinary.instanceLocations[0].page,ordinary.instanceLocations[1].page);});
 if(effects)check('one exact P2 quota entry carries a bounded captured-helper frontier, never a readonly certificate',()=>{
  const binding=ordinary.bindings.find(b=>b.effects),inventory=binding?.effects;assert(inventory);assert.equal(inventory.nodes.length,25);assert.equal(inventory.referenceStatus,'Observed');for(const key of['nodeId','page','entrySequence','frameId','contextUniqueId','checkpoint'])assert.deepEqual(inventory.entry[key],binding[key]);assert.equal(inventory.complete,false);assert.equal(inventory.readonlyEffects,'Unknown/Unsupported');assert.equal(inventory.fullPath,false);for(const node of inventory.nodes){assert.equal(node.evidence.readonlyEffects,'Unknown/Unsupported');assert.equal(node.evidence.fullPath,false);}for(const edge of inventory.edges)assert.equal(edge.executionAtThisSite,'Unknown/Unsupported');
 });
 const preboot=await mode('prebootstrap');check('restored public clock cannot conceal captured JS wrapper from native closure snapshot',()=>{assert.deepEqual(preboot.dom,off.dom);assert.equal(preboot.clock.publicClockRestored,true);assert.equal(preboot.clock.calls,3);assert.equal(preboot.clock.quota,99);assert.equal(preboot.clock.value,12);assert(preboot.bindings.length>0,preboot.reason);for(const b of preboot.bindings){assert(b.clock.location);assert(b.clock.source.sameContext);assert.equal(b.callee.sourceDigest,ordinary.bindings[0].callee.sourceDigest);assert.equal(b.readonlyEffects,'Unknown/Unsupported');}});
 const bound=await mode('prebootstrap-bound');check('bound JS clock has no direct JS location yet still executes the captured writer; no builtin or readonly authority inferred',()=>{assert.deepEqual(bound.dom,off.dom);assert.equal(bound.clock.publicClockRestored,true);assert.equal(bound.clock.calls,3);assert.equal(bound.clock.quota,99);assert(bound.bindings.length>0,bound.reason);for(const b of bound.bindings){assert.equal(b.clock.location,null);assert.equal(b.clock.noJSLocationIsNotNativeAttestation,true);assert.equal(b.readonlyEffects,'Unknown/Unsupported');}});
 const coverage=await mode('coverage');check('native coverage observes the shared member range without selecting its function instance',()=>{assert.deepEqual(coverage.dom,off.dom);assert.equal(coverage.pages.length,2);assert(coverage.coverage.some(f=>f.ranges[0]?.count>0));assert.deepEqual(coverage.instanceLocations[0].location,coverage.instanceLocations[1].location);assert(coverage.coverage.every(f=>!Object.hasOwn(f,'objectId')));});
 for(const name of['root-accessor','method-accessor','proxy','retention','invalidated','repaint','foreign-marker']){const rejected=await mode(name);check(name+' refuses an unsupported reference/history without getter or proxy traps',()=>{assert.deepEqual(rejected.dom,off.dom);assert.equal(rejected.acquisition,'Unknown/Unsupported');assert.equal(rejected.bindings.length,0);assert.equal(rejected.traps,'0');if(name==='invalidated'){assert.equal(rejected.references.invalidated,true);assert.match(rejected.reason,/checkpoint invalidated/);}if(name==='repaint')assert.match(rejected.reason,/Selection changed/);if(name==='foreign-marker')assert.match(rejected.reason,/observer page/);});}
 if(effects){
  const get=(snapshot,key)=>snapshot.bindings.find(b=>b.effects)?.effects.nodes.find(n=>n.key===key);
  check('bound clock target is a checkpoint JS reference with the same writer body, without builtin or event-time effect authority',()=>{const target=get(bound,'clock.boundTarget');assert.equal(bound.bindings.find(b=>b.effects).effects.nodes.length,26);assert.equal(get(bound,'clock').evidence.status,'Unknown/Unsupported');assert.equal(target.evidence.status,'Observed');assert.equal(target.evidence.functionDigest,get(preboot,'clock').evidence.functionDigest);assert.equal(target.evidence.syntax.assignments,1);assert.equal(target.evidence.readonlyEffects,'Unknown/Unsupported');});
  const writer=await mode('helper-writer');check('unchanged member function body cannot borrow ordinary transitive add effects after an actual helper writer',()=>{assert.deepEqual(writer.dom,off.dom);assert.equal(writer.clock.calls,3);assert.equal(writer.clock.quota,99);assert.equal(get(writer,'member').evidence.functionDigest,get(ordinary,'member').evidence.functionDigest);assert.notEqual(get(writer,'add').evidence.functionDigest,get(ordinary,'add').evidence.functionDigest);assert.equal(writer.bindings.find(b=>b.effects).effects.readonlyEffects,'Unknown/Unsupported');});
  const changedMap=await mode('prebootstrap-map-set');check('identical helper bodies with restored public Map.set expose a captured JS setter callback',()=>{assert.deepEqual(changedMap.dom,off.dom);assert.equal(changedMap.publicMapRestored,true);assert.equal(changedMap.clock.calls,4);assert.equal(changedMap.clock.quota,99);assert.equal(get(changedMap,'member').evidence.functionDigest,get(ordinary,'member').evidence.functionDigest);assert.equal(get(changedMap,'mapSet').evidence.functionDigest,get(ordinary,'mapSet').evidence.functionDigest);assert.equal(get(ordinary,'mapSet.set').evidence.status,'Unknown/Unsupported');assert.equal(get(changedMap,'mapSet.set').evidence.status,'Observed');assert(get(changedMap,'mapSet.set').evidence.syntax.assignments>0);});
 }
 if(operands){
  const original=ordinary.bindings.find(b=>b.operands);check('original P2 exact quota read retains receiver/key, original scalar and separate checkpoint descriptor',()=>{assert.equal(original.operands.status,'Observed');assert.equal(original.operands.key,'quota');assert.equal(original.operands.entryRead.value,12);assert.equal(original.operands.descriptorAtCheckpoint.value,12);assert.equal(original.operands.valueOrigin,'Unknown/Unsupported');assert.equal(ordinary.operandCleanup.stoppedOwnerEntries,0);assert.equal(ordinary.operandCleanup.otherOwnerEntries,1);});
  for(const name of['operand-accessor','operand-proxy','operand-object-key','operand-later-value','operand-same-value-before']){const control=await mode(name);check(name+' preserves original read/coercion and denies inferred field history',()=>{assert.deepEqual(control.dom,off.dom);assert.equal(control.operandCleanup.stoppedOwnerEntries,0);assert.equal(control.operandControl.valueOrigin,'Unknown/Unsupported');assert.equal(control.operandControl.fullPath,false);assert.deepEqual(control.operandCounts,{reads:['operand-accessor','operand-proxy'].includes(name)?1:0,keys:name==='operand-object-key'?1:0});if(['operand-accessor','operand-proxy','operand-object-key'].includes(name))assert.equal(control.operandControl.status,'Unknown/Unsupported');else{assert.equal(control.operandControl.status,'Observed');assert.equal(control.operandControl.entryRead.value,12);assert.equal(control.operandControl.descriptorAtCheckpoint.value,name==='operand-later-value'?99:12);}});}
 }
 result.status=operands?'PASS_BOUNDED_ENTRY_OPERANDS':effects?'PASS_BOUNDED_TRANSITIVE_EFFECT_FRONTIER':'PASS_BOUNDED_ENTRY_REFERENCE_ACQUISITION';
}catch(error){result.status='FAIL';result.errors.push(String(error.stack||error));process.exitCode=1;}
finally{
 clearTimeout(modeDeadline);
 for(const[name,fn]of[['browser',()=>browser?.context.close()],['server',()=>server?.close()]])try{await fn();}catch(error){result.errors.push(name+': '+error);}
 result.inputsStable=JSON.stringify(before)===JSON.stringify(await fileDigests(root,inputs));if(!result.inputsStable||result.errors.length){result.status='FAIL';process.exitCode=1;}result.completedAt=new Date().toISOString();await writeFile(out+'/results.json',JSON.stringify(result,null,2));console.log(result.status,out,result.checks.length,result.errors);
}
