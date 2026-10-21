import {createQueryLedger} from './query-handoff.mjs';
import {createStateHandoffLedger} from './react-state.mjs';
import {captureBrowserActionObservation} from './action-observer.mjs';
const actionArray=Array.isArray,actionInteger=Number.isSafeInteger,actionExec=RegExp.prototype.exec;
// Factory-owned identity; public page globals never establish observer provenance.
const observerInstances=new WeakMap();
const lookupObserver=observerInstances.get.bind(observerInstances),retainObserver=observerInstances.set.bind(observerInstances),forgetObserver=observerInstances.delete.bind(observerInstances),freezeObserverAPI=Object.freeze;
// Captured references for private telemetry only. This is not primordial attestation.
const telemetryOps=(()=>{
  const invoke=Reflect.apply,M=Map,S=Set,string=String,isArray=Array.isArray,isFinite=Number.isFinite,describe=Object.getOwnPropertyDescriptor,hasOwn=Object.hasOwn;
  const get=M.prototype.get,set=M.prototype.set,remove=M.prototype.delete,keys=M.prototype.keys,size=describe(M.prototype,'size').get;
  const setAdd=S.prototype.add,setHas=S.prototype.has,setValues=S.prototype.values,setSize=describe(S.prototype,'size').get;
  const weakGet=WeakMap.prototype.get,weakHas=WeakSet.prototype.has,push=Array.prototype.push,pop=Array.prototype.pop,slice=String.prototype.slice;
  const mapNext=Object.getPrototypeOf(invoke(keys,new M(),[])).next,setNext=Object.getPrototypeOf(invoke(setValues,new S(),[])).next;
  const clockDescriptor=describe(Date,'now'),clock=clockDescriptor&&hasOwn(clockDescriptor,'value')?clockDescriptor.value:null,date=Date;
  const append=(list,value)=>invoke(push,list,[value]);
  function dependencies(input){
    const values=[],seen=new S();let lost=false;
    const accept=value=>{if(typeof value!=='string'||!value){lost=true;return;}if(invoke(setHas,seen,[value]))return;if(values.length>=80){lost=true;return;}invoke(setAdd,seen,[value]);append(values,value);};
    if(isArray(input)){
      const length=describe(input,'length')?.value;if(typeof length!=='number')return{values,lost:true};const end=length<4096?length:4096;if(length>end)lost=true;
      for(let i=0;i<end;i++){const d=describe(input,string(i));if(!d||!hasOwn(d,'value'))lost=true;else accept(d.value);}
    }else{
      try{const count=invoke(setSize,input,[]),iterator=invoke(setValues,input,[]),end=count<80?count:80;if(count>end)lost=true;for(let i=0;i<end;i++)accept(invoke(setNext,iterator,[]).value);}catch{lost=true;}
    }
    return{values,lost};
  }
  return freezeObserverAPI({
    now:()=>invoke(clock,date,[]),set:()=>new S(),mapGet:(m,k)=>invoke(get,m,[k]),mapSet:(m,k,v)=>invoke(set,m,[k,v]),mapSize:m=>invoke(size,m,[]),mapDelete:(m,k)=>invoke(remove,m,[k]),firstKey:m=>invoke(mapNext,invoke(keys,m,[]),[]).value,
    weakGet:(m,k)=>invoke(weakGet,m,[k]),weakHas:(m,k)=>invoke(weakHas,m,[k]),setAdd:(s,k)=>invoke(setAdd,s,[k]),setHas:(s,k)=>invoke(setHas,s,[k]),setSize:s=>invoke(setSize,s,[]),push:append,pop:a=>invoke(pop,a,[]),string:v=>string(v),slice:(v,end)=>invoke(slice,v,[0,end]),isFinite,dependencies,
  });
})();
// Dev-only synchronous observations; no application object serialization or extra body reads.
export function createObserver(w,{sourceConsumption=false,fetchInitiators=false,reactStateHandoffs=false,sourceWrites=false,queryHandoffs=false,queryCallCensus=false,writeAccessGuards=false,actionTrace=false}={}) {
  const retained=lookupObserver(w);
  if(retained?.phase==='publishing')throw new Error('StateAtom observer initialization in progress');
  const existing=retained?.api;
  if(existing?.active){if(existing.sourceConsumption!==sourceConsumption||existing.fetchInitiators!==fetchInitiators||existing.reactStateHandoffs!==reactStateHandoffs||existing.sourceWrites!==sourceWrites||existing.queryHandoffs!==queryHandoffs||existing.queryCallCensus!==queryCallCensus||existing.writeAccessGuards!==writeAccessGuards||existing.actionTrace!==actionTrace)throw new Error('StateAtom observation mode mismatch; reload the page before switching modes');return existing;}
  if(writeAccessGuards&&(!sourceWrites||!sourceConsumption))throw new Error('Write-access guards require source writes and source consumption');
  if(queryCallCensus&&!queryHandoffs)throw new Error('Native call census requires Query handoffs');
  if(queryHandoffs&&!sourceConsumption)throw new Error('Query handoffs require source consumption');
  if(reactStateHandoffs&&!sourceConsumption)throw new Error('State handoffs require source consumption');
  if(fetchInitiators&&!sourceConsumption)throw new Error('Exact fetch acquisition requires source consumption');
  let active=true, serial=0, scopeSerial=0, exchangeSerial=0, stale=null, dropped=0;
  const page=w.crypto.randomUUID(), limits={records:2000,exportBytes:512000,closure:120};
  const nodes=new Map(), targets=new Map(), bindings=new Map(), captures=new Map(), urlCounts=new Map();
  const actionSites=new Map(),actionSiteList=[],actionFactory=actionTrace?captureBrowserActionObservation(w):null;let actionCollector=null,actionUnavailable=null;
  const origins=new WeakMap(), descriptors=new WeakMap(), responses=new WeakMap(), writes=new WeakMap(),invalidatedDescriptors=new WeakSet(),potentialWriteObjects=new WeakSet();
  const stack=[], exchanges=[];
  const sourcePromises=new WeakMap();
  // Opt-in React dev probe. DOM nodes stay in WeakMaps and never cross the export boundary.
  const reactRoots=new Map(),committed=new WeakMap(),reactRefs=new WeakMap(),jsxStack=[];let rootSerial=0,commitSerial=0;
  const nodeProto=w.Node?.prototype,elementProto=w.Element?.prototype;
  const nativeContains=nodeProto?.contains,nativeAttribute=elementProto?.getAttribute;
  const nativeText=nodeProto&&Object.getOwnPropertyDescriptor(nodeProto,'textContent')?.get;
  const nativeParent=nodeProto&&Object.getOwnPropertyDescriptor(nodeProto,'parentNode')?.get;
  const nativeDisabled=w.HTMLButtonElement&&Object.getOwnPropertyDescriptor(w.HTMLButtonElement.prototype,'disabled')?.get;
  const nativeWalker=w.Document?.prototype.createTreeWalker,walkerNext=w.TreeWalker?.prototype.nextNode;
  const ownDescriptor=Object.getOwnPropertyDescriptor,nativeApply=Reflect.apply,objectPrototype=Object.prototype,NativeMutationObserver=w.MutationObserver;
  const mapRead=(map,key)=>map?telemetryOps.mapGet(map,key):undefined;
  const ownDataValue=descriptor=>{const d=descriptor&&ownDescriptor(descriptor,'value');return d?d.value:undefined;};
  const promiseConstructor=sourceConsumption?ownDataValue(ownDescriptor(w,'Promise')):null,promisePrototype=typeof promiseConstructor==='function'?ownDataValue(ownDescriptor(promiseConstructor,'prototype')):null,nativeThen=promisePrototype&&ownDataValue(ownDescriptor(promisePrototype,'then'));
  const fetchDocument=fetchInitiators?w.document:null,headGetter=fetchInitiators&&w.Document&&ownDescriptor(w.Document.prototype,'head')?.get,metaQuery=fetchInitiators?w.Document?.prototype.querySelectorAll:null,listItem=fetchInitiators?w.NodeList?.prototype.item:null,listLength=fetchInitiators&&w.NodeList&&ownDescriptor(w.NodeList.prototype,'length')?.get;
  const rootGetter=fetchInitiators&&w.Document&&ownDescriptor(w.Document.prototype,'documentElement')?.get,fetchRoot=fetchDocument&&rootGetter?nativeApply(rootGetter,fetchDocument,[]):null;
  const fetchHead=fetchDocument&&headGetter?nativeApply(headGetter,fetchDocument,[]):null;let headChanged=false;
  const headGuard=fetchInitiators&&fetchHead&&NativeMutationObserver?new NativeMutationObserver(records=>{if(records.length)headChanged=true;}):null;if(headGuard)headGuard.observe(fetchHead,{childList:true,subtree:true,attributes:true,characterData:true});
  const rootGuard=fetchInitiators&&fetchDocument&&NativeMutationObserver?new NativeMutationObserver(records=>{if(records.some(r=>r.target===fetchDocument||r.target===fetchRoot))headChanged=true;}):null;if(rootGuard)rootGuard.observe(fetchDocument,{childList:true,subtree:true});
  function fetchPolicyReason(){
    if(ownDataValue(ownDescriptor(w,'__STATEATOM_FETCH_POLICY__'))!==true)return 'CSP/document preflight unavailable or unsupported; no Function attempted';
    if(!headGuard||!rootGuard||!rootGetter||nativeApply(rootGetter,fetchDocument,[])!==fetchRoot||!metaQuery||!listItem||!listLength||!nativeAttribute||nativeApply(headGetter,fetchDocument,[])!==fetchHead)return 'Static document policy cannot be checked; no Function attempted';
    if(headGuard.takeRecords().length||rootGuard.takeRecords().some(r=>r.target===fetchDocument||r.target===fetchRoot))headChanged=true;if(headChanged)return 'Document head changed; static policy precondition unavailable; no Function attempted';
    const list=nativeApply(metaQuery,fetchDocument,['meta[http-equiv]']),length=nativeApply(listLength,list,[]);if(length>32)return 'Document metadata budget; no Function attempted';
    for(let i=0;i<length;i++){const node=nativeApply(listItem,list,[i]),name=nativeApply(nativeAttribute,node,['http-equiv']);if(typeof name==='string'&&/content-security-policy/i.test(name))return 'CSP meta policy unsupported; no Function attempted';}return null;
  }
  const fetchConstructor=fetchInitiators?ownDataValue(ownDescriptor(w,'Function')):null;
  const arrayPrototype=Array.prototype,nativeCreate=Object.create;
  const serializationHook=()=>!!(ownDescriptor(objectPrototype,'toJSON')||ownDescriptor(arrayPrototype,'toJSON'));
  const nativeNodeType=nodeProto&&ownDescriptor(nodeProto,'nodeType')?.get;
  const nativeGetPrototype=Object.getPrototypeOf,promiseDescriptors=promisePrototype?{constructor:ownDescriptor(promisePrototype,'constructor'),then:ownDescriptor(promisePrototype,'then'),species:ownDescriptor(promiseConstructor,Symbol.species)}:null;
  const sameDescriptor=(a,b)=>!!a&&!!b&&['value','writable','get','set','enumerable','configurable'].every(k=>{const x=ownDescriptor(a,k),y=ownDescriptor(b,k);return !x&&!y||!!x&&!!y&&ownDataValue(x)===ownDataValue(y);});
  function ordinaryPromise(p){return !!promiseDescriptors&&ownDataValue(promiseDescriptors.constructor)===promiseConstructor&&typeof nativeThen==='function'&&nativeGetPrototype(p)===promisePrototype&&!ownDescriptor(p,'constructor')&&!ownDescriptor(p,'then')&&sameDescriptor(ownDescriptor(promisePrototype,'constructor'),promiseDescriptors.constructor)&&sameDescriptor(ownDescriptor(promisePrototype,'then'),promiseDescriptors.then)&&sameDescriptor(ownDescriptor(promiseConstructor,Symbol.species),promiseDescriptors.species);}
  const isNode=value=>{try{return !!nativeNodeType?.call(value);}catch{return false;}};
  const hostAdapter='react18-final-host-props/1',nativeFactories=new WeakSet(),nativeFibers=new WeakSet(),nativeRoots=new WeakMap(),hostProps=new WeakMap(),hostNodeRecords=new WeakMap(),hostNodes=new Map(),hostCommits=new WeakMap(),factoryFrames=[];
  const nativeWeakSetAdd=WeakSet.prototype.add,nativeWeakSetHas=WeakSet.prototype.has,nativeWeakMapGet=WeakMap.prototype.get;
  const potentialObject=v=>writeAccessGuards&&nativeApply(nativeWeakSetHas,potentialWriteObjects,[v]);
  const nativeKeys=Object.keys,nativePropertyCalls=sourceWrites?new Map([[Object.assign,'Object.assign'],[Object.defineProperty,'Object.defineProperty'],[Object.defineProperties,'Object.defineProperties'],[Object.setPrototypeOf,'Object.setPrototypeOf'],[Reflect.set,'Reflect.set'],[Reflect.defineProperty,'Reflect.defineProperty'],[Reflect.deleteProperty,'Reflect.deleteProperty']].filter(([fn])=>typeof fn==='function')):null;
  const NativeWeakRef=w.WeakRef,nativeWeakDeref=NativeWeakRef&&ownDescriptor(NativeWeakRef.prototype,'deref')?.value;
  const nativeFreeze=Object.freeze,nativeIsFrozen=Object.isFrozen,nativeFrozenProps=new WeakSet();
  let hostProbe=null,hostPropsSerial=0,hostNodeSerial=0,hostRootSerial=0,hostAppliedSerial=0;
  const hostLimits={nodes:256,fibers:512},missingField=Symbol('missing native field');
  const field=(value,key)=>{const d=ownDescriptor(value,key);return d&&'value'in d?d.value:missingField;};
  const stateLedger=reactStateHandoffs?createStateHandoffLedger({page,field,isFiber:v=>nativeFibers.has(v),origin:v=>origins.get(v),add,weakRef:NativeWeakRef}):null;
  const queryLedger=queryHandoffs?createQueryLedger({page,origin:v=>origins.get(v),weakRef:NativeWeakRef,callCensus:queryCallCensus}):null;
  const rootKey=(meta,scope)=>scope+':'+meta.file+':'+meta.key;
  function domValue(element,property){
    if(property==='text'&&nativeText)return nativeText.call(element)?.trim();
    if(property==='disabled'&&nativeDisabled)try{return nativeDisabled.call(element);}catch{}
    return undefined;
  }
  function owns(root,element){
    if(!root.active||!nativeContains?.call(root.container,element))return false;
    // Nested independent roots belong to their closest registered container.
    for(let n=element;n;n=nativeParent?.call(n)){
      if(n===root.container)return true;
      for(const other of reactRoots.values())if(other.active&&other.container===n&&other!==root)return false;
    }return false;
  }
  function drain(root){if(root.mutations?.takeRecords().length)root.version++;}
  function hostDirty(record){if(record.observer.takeRecords().length)record.dirty=true;return record.dirty;}
  function hostApplied(node,props){
    if(!isNode(node)||!NativeMutationObserver||!NativeWeakRef||!object(props))return;
    const previous=hostNodeRecords.get(node);if(previous){previous.active=false;previous.observer.disconnect();}
    // Cleanup handles must not retain application nodes or their props/children graph.
    const record={propsRef:new NativeWeakRef(props),active:true,dirty:false,id:previous?.id||page+':hostNode'+(++hostNodeSerial),applied:++hostAppliedSerial};
    record.observer=new NativeMutationObserver(records=>{if(records.length)record.dirty=true;});record.observer.observe(node,{subtree:true,attributes:true,childList:true,characterData:true});
    hostNodeRecords.set(node,record);hostNodes.delete(record.id);hostNodes.set(record.id,record);
    while(hostNodes.size>hostLimits.nodes){const [key,old]=hostNodes.entries().next().value;old.active=false;old.observer.disconnect();hostNodes.delete(key);}
  }
  function hostRootCommitted(owner,finished){
    const native=nativeRoots.get(owner),root=native?.registration;if(!root?.active||mapRead(reactRoots,root.key)!==root||field(owner,'current')!==finished||!nativeFibers.has(finished))return;
    const list=[],seen=new Set(),pending=[{fiber:finished,path:[]}];let reason=null;
    while(pending.length){const {fiber,path}=pending.pop();if(!nativeFibers.has(fiber)||seen.has(fiber)||seen.size>=hostLimits.fibers){reason='Unknown native Fiber identity or commit traversal budget';break;}seen.add(fiber);
      const tag=field(fiber,'tag'),child=field(fiber,'child'),sibling=field(fiber,'sibling');
      if([tag,child,sibling].includes(missingField)){reason='Native Fiber data fields unavailable';break;}
      if(sibling)pending.push({fiber:sibling,path});
      // Conservatively exclude hidden/pending trees, hydration and portals.
      if([4,18,19].includes(tag)||[13,22].includes(tag)&&field(fiber,'memoizedState')!==null)continue;
      if(child)pending.push({fiber:child,path:[...path,fiber]});
      if(tag!==5)continue;
      const type=field(fiber,'type'),node=field(fiber,'stateNode'),props=field(fiber,'memoizedProps');
      if(typeof type!=='string'||!isNode(node)||!object(props)){reason='Unsupported native host shape';break;}
      if(type.includes('-')||hostProps.has(props)&&field(props,'is')!==missingField){reason='Custom elements/customized built-ins outside this probe';break;}
      list.push({type,node,props,path:[...path,fiber]});
    }
    root.lastScan=reason;drain(root);if(reason)return;
    const commitId=page+':hostCommit'+(++commitSerial);
    for(const {type,node,props,path}of list){const applied=hostNodeRecords.get(node),produced=hostProps.get(props),properties=new Map();
      if(!applied?.active||applied.propsRef.deref()!==props||hostDirty(applied)||!produced||produced.context.meta.tag!==type||!owns(root,node)){hostCommits.delete(node);continue;}
      const context=produced.context,ancestors=stateLedger?path.map(f=>new NativeWeakRef(f)):[];
      for(const property of['text','disabled']){const targetId=mapRead(context.ids,property),target=mapRead(nodes,targetId);if(!target||target.aggregateText)continue;
        const raw=field(props,property==='text'?'children':'disabled'),expected=property==='disabled'?(typeof target.value==='boolean'?target.value:null):['string','number'].includes(typeof target.value)?String(target.value).trim():null;
        if(expected===null||raw!==target.value||nativeAttribute.call(node,'data-stateatom')!==context.marker||domValue(node,property)!==expected)continue;
        properties.set(property,{root,applied,ancestors,record:{status:'Observed',mechanism:'pinned React DOM committed Fiber + final native props object identity',producer:{status:'Observed',scope:'actual React committed host prop; general DOM last-writer analysis unavailable'},page,rootId:native.id,commitId,observedAt:Date.now(),marker:context.marker,targetId,property,value:expected,source:root.meta,adapter:hostAdapter,hostNodeId:applied.id,hostPropsId:produced.id,applied:applied.applied,mutationVersion:root.version}});
      }hostCommits.set(node,properties);
    }
  }
  function hostSnapshot(element,instance,property){
    const unknown=reason=>({status:'Unknown/Unsupported',reason});
    if(hostProbe?.status!=='Observed')return unknown(hostProbe?.reason||'Native host probe unavailable');
    const binding=element&&mapRead(hostCommits.get(element),property);if(!binding)return unknown('No supported committed final host-props identity for this DOM node/property');
    const {root,applied,record}=binding;
    if(stale)return {...record,status:'Stale',reason:stale};drain(root);
    if(root.lastScan||!root.active||mapRead(reactRoots,root.key)!==root||!owns(root,element)||!applied.active||hostNodeRecords.get(element)!==applied||hostDirty(applied)||root.version!==record.mutationVersion||nativeAttribute.call(element,'data-stateatom')!==instance||instance!==record.marker||domValue(element,property)!==record.value||!nodes.has(record.targetId))return unknown(root.lastScan||'Committed host node/props changed, mutated or no longer retained');
    return {...record};
  }
  function markCommit(root,phase,commitTime){
    if(!active||stale||mapRead(reactRoots,root.key)!==root||!root.active||!nativeWalker||!walkerNext)return;
    drain(root);
    const commitId=page+':commit'+(++commitSerial),found=[],counts=new Map();
    const walker=nativeWalker.call(w.document,root.container,1);let e=root.container;
    // A bounded scan; if truncated, no selected element gets a purported complete scan.
    for(let count=0;e&&count<=512;count++,e=walkerNext.call(walker)){
      if(count===512){root.lastScan='Unknown/Unsupported: DOM scan budget';return;}
      if(!owns(root,e)||!(e instanceof w.Element))continue;
      const marker=nativeAttribute.call(e,'data-stateatom');if(!marker)continue;
      counts.set(marker,(mapRead(counts,marker)||0)+1);found.push({element:e,marker});
    }
    root.lastScan=null;
    for(const {element,marker}of found){const properties=new Map();
      const ref=reactRefs.get(element);
      if(!ref?.active||ref.root!==root||ref.version!==root.version||ref.context.marker!==marker){committed.delete(element);continue;}
      for(const property of ['text','disabled']){const targetId=mapRead(ref.context.ids,property),target=mapRead(nodes,targetId);if(!target||target.aggregateText||mapRead(counts,marker)!==1)continue;
        const value=domValue(element,property),expected=property==='disabled'?(target.value?.kind==='undefined'?false:typeof target.value==='boolean'?target.value:null):['string','number'].includes(typeof target.value)?String(target.value).trim():null;
        if(expected===null||value!==expected)continue;
        properties.set(property,{root,ref,record:{status:'Observed',mechanism:'React dev callback ref + Profiler root commit',page,rootId:root.id,commitId,phase,commitTime,observedAt:Date.now(),marker,targetId,property,value,source:root.meta,producer:{status:'Unknown/Unsupported',reason:'Ref/marker may survive cloneElement or post-JSX prop replacement; final property producer not established'},scope:'React invoked the ref derived from this JSX occurrence inside this root; targetId identifies that original observed JSX expression, not a proven final property producer'}});
      }committed.set(element,properties);
    }
  }
  const object=v=>v!==null&&(typeof v==='object'||typeof v==='function');
  const primitive=v=>{const type=typeof v;if(v===null||type==='boolean')return v;if(type==='number')return telemetryOps.isFinite(v)?v:telemetryOps.string(v);if(type==='string')return telemetryOps.slice(v,256);return{kind:type};};
  const pointer=k=>{const text=telemetryOps.string(k);let result='';for(let i=0;i<text.length;i++)result+=text[i]==='~'?'~0':text[i]==='/'?'~1':text[i];return result;};
  function put(map,key,value,max=limits.records){telemetryOps.mapSet(map,key,value);while(telemetryOps.mapSize(map)>max)telemetryOps.mapDelete(map,telemetryOps.firstKey(map));}
  function feed(id){if(id&&stack.length){const context=stack[stack.length-1];if(telemetryOps.setHas(context.deps,id))return;if(telemetryOps.setSize(context.deps)>=80){context.dependencyLoss=true;return;}telemetryOps.setAdd(context.deps,id);}}
  function add(meta,value,deps=[],extra={},feedResult=true,dependencyLoss=false){
    if(!active)return null;
    try{const observed=telemetryOps.dependencies(deps),n={...meta,...extra,id:page+':'+(++serial),at:telemetryOps.now(),page,value:primitive(value),deps:observed.values,status:'Observed'};
      if(observed.lost||dependencyLoss){n.missingDependencies=true;n.boundary=(n.boundary?n.boundary+'; ':'')+'Dependency retention exceeded or unsupported; observations incomplete';}
      if(n.origin){n.origin={...n.origin,scope:'parsed object/field identity only; not current value ancestry'};n.valueOrigin='Unknown/Unsupported';n.boundary=(n.boundary?n.boundary+'; ':'')+'unobserved equal-value/raw writes are not excluded; parsed identity does not establish current value origin';}
      telemetryOps.mapSet(nodes,n.id,n);while(telemetryOps.mapSize(nodes)>limits.records){telemetryOps.mapDelete(nodes,telemetryOps.firstKey(nodes));dropped++;}if(feedResult)feed(n.id);return n;
    }catch{return null;}
  }
  function tagJSON(value,origin,budget,depth=0){
    if(!object(value)||depth>20||budget.remaining<=0)return;
    origins.set(value,origin);const own=Object.create(null);descriptors.set(value,own);let count=0;
    // JSON.parse produces plain data. Stop before allocating an unbounded descriptor copy.
    for(const key in value){if(!Object.hasOwn(value,key))continue;if(++count>128||--budget.remaining<0){budget.exceeded=true;break;}
      const d=ownDescriptor(value,key);if(!d||!('value'in d))continue;own[key]=d;
      const field={...origin,pointer:origin.pointer+'/'+pointer(key)};
      if(field.pointer.length>512){budget.exceeded=true;continue;}
      if(object(d.value))tagJSON(d.value,field,budget,depth+1);
      else{const leaf={pointer:field.pointer,value:primitive(d.value)};const bytes=JSON.stringify(leaf).length;
        if(budget.bytes+bytes<=8192&&budget.leaves.length<128){budget.bytes+=bytes;budget.leaves.push(leaf);}else budget.exceeded=true;
      }
    }
  }
  function capture(meta,scope,fn){
    if(!active)return fn();const context={deps:telemetryOps.set(),meta,scope,dependencyLoss:false};telemetryOps.push(stack,context);let value;
    try{value=fn();}catch(error){telemetryOps.pop(stack);add({...meta,kind:'throw',scope},undefined,context.deps,{boundary:'original exception propagated'},true,context.dependencyLoss);throw error;}
    telemetryOps.pop(stack);const origin=object(value)?telemetryOps.weakGet(origins,value):null;
    const n=add({...meta,scope},value,context.deps,origin?{origin}:{},true,context.dependencyLoss);
    if(n){put(captures,scope+':'+meta.key,{node:n,object:meta.kind==='destructure-root'&&object(value)?value:null});if(meta.binding&&!meta.historyUnknown)put(bindings,scope+':'+meta.binding,n.id);if(meta.target)put(targets,scope+':'+meta.target+':'+meta.property,n.id);}
    return value;
  }
  function recordJSON(exchange,value){
    if(serializationHook())return;
    const consumptionId=stateLedger||queryLedger?page+':jsonConsumption'+(++serial):null;
    const budget={remaining:2048,bytes:0,leaves:[],exceeded:false};tagJSON(value,{...(consumptionId?{consumptionId}:{}),exchangeId:exchange.id,url:exchange.url,urlOrdinal:exchange.urlOrdinal,pointer:'',body:'actual parsed JSON object identity'},budget);
    exchanges.push({...exchange,...(consumptionId?{consumptionId}:{}),consumedAt:Date.now(),body:'application called Response.json',parsedLeaves:budget.leaves,budgetExceeded:budget.exceeded});while(exchanges.length>32)exchanges.shift();
  }
  function invalidateParsedFields(target,known,node){
    if(!known)return;let map=writes.get(target);if(!map){map=new Map();writes.set(target,map);}const names=nativeKeys(known);
    for(let i=0;i<names.length;i++){const key=names[i];invalidatedDescriptors.add(known[key]);if(node)put(map,key,node.id,128);}
  }
  function consumePromise(promise,value,via='await'){
    if(!active||!sourceConsumption)return;
    try{const entry=sourcePromises.get(promise);if(!entry||entry.consumed)return;
      if(entry.kind==='fetch'){entry.consumed=true;if(object(value))responses.set(value,entry.exchange);}
      else if((via==='await'&&entry.mode==='await'||via==='then'&&entry.mode==='armed-then')&&ordinaryPromise(promise)){entry.consumed=true;recordJSON(entry.exchange,value);}
    }catch{} // Telemetry never changes the application's successful consumption.
  }
  function actionTraceInfo(){const info=nativeCreate(null);info.schema=1;info.enabled=actionTrace;info.available=active&&!stale&&actionTrace&&!actionUnavailable&&actionFactory.available&&telemetryOps.mapSize(actionSites)>0;info.siteCount=telemetryOps.mapSize(actionSites);info.reason=!active?'Observer stopped':stale||actionUnavailable||(!actionTrace?'Action instrumentation disabled':!actionFactory.available?'Native event observation unavailable':!telemetryOps.mapSize(actionSites)?'No supported action source registered':null);info.mechanism='opt-in-original-event-synchronous-body/1';return info;}
  function actionTraceRead(){if(serializationHook()){const unavailable=nativeCreate(null);unavailable.schema=1;unavailable.status='Unknown/Unsupported';unavailable.reason='Application serialization hook unsupported';return unavailable;}return actionCollector?.snapshot()||{schema:1,status:!active?'stopped':stale?'stale':'idle',reason:actionTraceInfo().reason,records:[],runtimeFunctionObjectIdentity:'Unavailable',asyncEffects:'Unlinked',completeListenerCoverage:false,actionUndone:false};}
  const api={version:1,get actionTrace(){return actionTrace;},actionTraceInfo,actionTraceRead,
    registerActionSites(batch){
      if(!active||!actionTrace||actionUnavailable)return;
      try{if(!actionArray(batch)||batch.length>256)throw Error();let added=false;
        for(let i=0;i<batch.length;i++){const source=batch[i],field=key=>ownDataValue(ownDescriptor(source,key)),id=field('id'),file=field('file'),sourceDigest=field('sourceDigest'),line=field('line'),column=field('column'),endLine=field('endLine'),endColumn=field('endColumn'),kind=field('kind'),symbol=field('symbol');
          if(typeof id!=='string'||!nativeApply(actionExec,/^[a-f0-9]{64}$/,[id])||typeof file!=='string'||file.length>1024||typeof sourceDigest!=='string'||!nativeApply(actionExec,/^[a-f0-9]{64}$/,[sourceDigest])||!actionInteger(line)||line<=0||!actionInteger(column)||column<=0||!actionInteger(endLine)||endLine<=0||!actionInteger(endColumn)||endColumn<=0||(kind!=='function'&&kind!=='arrow')||typeof symbol!=='string'||symbol.length>256)throw Error();
          const old=mapRead(actionSites,id);if(old){if(old.file!==file||old.sourceDigest!==sourceDigest||old.line!==line||old.column!==column)throw Error();continue;}if(telemetryOps.mapSize(actionSites)>=512)throw Error();const record=freezeObserverAPI({id,file,sourceDigest,line,column,endLine,endColumn,kind,symbol});put(actionSites,id,record,512);telemetryOps.push(actionSiteList,record);added=true;
        }if(added&&actionCollector)actionCollector.invalidate();
      }catch{actionUnavailable='Action source catalog unavailable or over budget';actionCollector?.invalidate();}
    },
    actionTraceArm(element,identity,options){const info=actionTraceInfo();if(!info.available)throw Error(info.reason);actionCollector?.stop();actionCollector=actionFactory.create({identity:{run:identity.run,build:identity.build,frame:identity.frame,page},sites:actionSiteList});return actionCollector.arm(element,options);},
    actionTraceCancel(){actionCollector?.cancel();return actionTraceRead();},actionTraceClear(){actionCollector?.clear();return actionTraceRead();},
    actionEnter(site,event){return actionCollector?.enter(site,event)??null;},actionLeave(token,threw){return actionCollector?.leave(token,threw)??false;},
    get writeAccessGuards(){return writeAccessGuards;},
    potentialPropertyWrite(meta,obj){if(!active||!writeAccessGuards||!object(obj))return obj;try{const known=nativeApply(nativeWeakMapGet,descriptors,[obj]);if(!known)return obj;
      nativeApply(nativeWeakSetAdd,potentialWriteObjects,[obj]);
      const n=add({...meta,kind:'potential-property-write',completedWrite:false,invocation:'Unknown/Unsupported'},undefined,[],{boundary:meta.privateAccess?'Potential private-member access; public-field write not established, identity conservatively invalidated':'Potential property write access before key/RHS/operation; a skipped, failed or suspended operation is not a completed write'+(meta.privateInput?'; Adapter-generated private input only; original IDE source unavailable':'')},false);
      invalidateParsedFields(obj,known,n);
    }catch{}return obj;},get queryCallCensus(){return queryCallCensus;},queryCallObservations(){return queryLedger?.callSnapshot()||{status:"Unknown/Unsupported",events:[],fullPath:false};},get queryHandoffs(){return queryHandoffs;},
    queryTap(adapter,kind,a,b,c,d,e){if(!active||!queryLedger||adapter!=='query5-native-handoff/1')return;switch(kind){
      case 'census-brand':return queryLedger.censusBrand(a,b,c);case 'call-begin':return queryLedger.callBegin(a,b,c,d);case 'call-plan':return queryLedger.callPlan(a,b,c,d);case 'call-result':return queryLedger.callResult(a,b);case 'call-ready':return queryLedger.callReady(a,b);case 'call-end':return queryLedger.callEnd(a);
      case 'state':return queryLedger.state(a);case 'cache':return queryLedger.cache(a,b);case 'client':return queryLedger.client(a,b);case 'query':return queryLedger.query(a,b,c,d);case 'assigned':return queryLedger.assigned(a,b);case 'stored':return queryLedger.stored(a,b,c,d);case 'cacheMethod':return queryLedger.cacheMethod(a,b);case 'cacheMethodAt':return queryLedger.cacheMethodAt(a);case 'mapMethodAt':return queryLedger.mapMethodAt(a);case 'beginRead':return queryLedger.beginRead(a);case 'got':return queryLedger.got(a,b,c,d,e);case 'read':return queryLedger.read(a,b);case 'endRead':return queryLedger.endRead(a);case 'returned':return queryLedger.returned(a,b);
    }},
    queryObservations(){return queryLedger?.snapshot()||{status:'Unknown/Unsupported',reason:'Query handoffs disabled',events:[],fullPath:false};},get sourceConsumption(){return sourceConsumption;},get fetchInitiators(){return fetchInitiators;},get reactStateHandoffs(){return reactStateHandoffs;},get sourceWrites(){return sourceWrites;},get active(){return active;},page,limits,
    scope(){return page+':scope'+(++scopeSerial);},capture,
    consumeAwait(meta,value,promise){consumePromise(promise,value);return value;},
    sourceCallee(receiver,key,jsonMode=null){const entry=sourcePromises.get(receiver);
      if(entry?.kind==='json'&&entry.mode==='pending-then'&&!ordinaryPromise(receiver))entry.mode=null;
      const fn=receiver[key];return function(...args){
      if(active&&sourceConsumption&&key==='then'&&entry?.kind==='json'&&entry.mode==='pending-then')entry.mode=fn===nativeThen&&typeof args[0]==='function'&&ordinaryPromise(receiver)?'armed-then':null;
      if(active&&sourceConsumption&&key==='then'&&fn===nativeThen&&sourcePromises.has(receiver)&&typeof args[0]==='function'){
        const handler=args[0];args[0]=function(value){consumePromise(receiver,value,'then');return nativeApply(handler,this,[value]);};
      }
      const value=nativeApply(fn,receiver,args);
      if(active&&sourceConsumption&&jsonMode&&fn===wrappedJSON){const entry=sourcePromises.get(value);if(entry?.kind==='json'&&ordinaryPromise(value))entry.mode=jsonMode==='await'?'await':jsonMode==='then'?'pending-then':null;}
      return value;
    };},
    reactStateResult(meta,scope,result){stateLedger?.stage(meta,scope,result);return result;},
    reactStateBinding(meta,scope,value,setter){const n=stateLedger?.associate(meta,scope,value,setter);if(n&&meta.binding)put(bindings,scope+':'+meta.binding,n.id);},
    enableReactHostProbe(contract){hostProbe=contract?.adapter===hostAdapter?{...contract}:{status:'Unknown/Unsupported',reason:'Unsupported host-props adapter contract'};},
    reactFactory(receiver,key){const fn=receiver[key];return function(...args){
      if(!active||hostProbe?.status!=='Observed'||!nativeFactories.has(fn)||!jsxStack.length)return nativeApply(fn,receiver,args);
      const frame={context:jsxStack.at(-1),depth:0,produced:false,unsafe:false};factoryFrames.push(frame);
      try{return nativeApply(fn,receiver,args);}finally{factoryFrames.pop();}
    };},
    reactHostTap(kind,a,b,c,adapter){
      if(!active||adapter!==hostAdapter)return;
      if(kind.startsWith('state-')){if(hostProbe?.status==='Observed')stateLedger?.tap(kind,a,b,c);return;}
      if(kind==='factory-brand'){if(typeof a==='function')nativeFactories.add(a);return;}
      if(kind==='fiber-brand'){if(object(a))nativeFibers.add(a);return;}
      if(kind==='root-brand'){
        if(!object(a)||b!==false)return;const container=field(a,'containerInfo'),registration=[...reactRoots.values()].find(r=>r.active&&!r.nativeBound&&r.container===container);
        if(registration){registration.nativeBound=true;nativeRoots.set(a,{registration,id:page+':nativeRoot'+(++hostRootSerial)});}return;
      }
      if(hostProbe?.status!=='Observed')return;
      if(kind==='host-applied'){hostApplied(a,b);return;}
      if(kind==='root-committed'){hostRootCommitted(a,b);return;}
      const frame=factoryFrames.at(-1);if(!frame)return;
      if(kind==='factory-enter'){frame.depth++;for(const name of['children','disabled','is'])if(ownDescriptor(objectPrototype,name))frame.unsafe=true;return;}
      if(kind==='factory-exit'){frame.depth--;return;}
      if(kind==='factory-freeze'){if(a===nativeFreeze&&object(b))nativeFrozenProps.add(b);return;}
      if(kind==='factory-result'&&frame.depth===1&&!frame.produced){frame.produced=true;if(!frame.unsafe&&typeof c==='string'&&c===frame.context.meta.tag&&object(b)&&nativeFrozenProps.has(b)&&nativeIsFrozen(b))hostProps.set(b,{context:frame.context,id:page+':props'+(++hostPropsSerial)});}
    },
    reactContainer(meta,scope,container){
      if(active&&nativeContains&&isNode(container)){
        const key=rootKey(meta,scope),previous=mapRead(reactRoots,key);if(previous){previous.active=false;previous.mutations?.disconnect();}
        for(const other of reactRoots.values())if(other.container===container){other.active=false;other.mutations?.disconnect();}
        const root={key,meta,container,id:page+':root'+(++rootSerial),active:true,version:0};
        if(w.MutationObserver){root.mutations=new w.MutationObserver(records=>{if(records.length)root.version++;});root.mutations.observe(container,{subtree:true,childList:true,attributes:true,characterData:true});}
        if(reactRoots.size>=32&&!reactRoots.has(key)){const oldest=reactRoots.values().next().value;oldest.active=false;oldest.mutations?.disconnect();}
        put(reactRoots,key,root,32);
      }return container;
    },
    reactRender(meta,scope,element,createElement,Profiler){
      const root=mapRead(reactRoots,rootKey(meta,scope));if(!active||!root||!root.active)return element;
      return createElement(Profiler,{id:root.id,onRender:(_id,phase,_actual,_base,_start,time)=>{try{markCommit(root,phase,time);}catch{root.lastScan='Unknown/Unsupported: commit observation failed';}}},element);
    },
    reactElement(meta,scope,fn){const context={meta,marker:scope+':'+meta.target,ids:new Map()};jsxStack.push(context);try{return fn();}finally{jsxStack.pop();}},
    reactRef(){
      const context=jsxStack.at(-1);let previous;
      return element=>{try{
        if(previous){previous.active=false;previous=null;}
        if(!active||!context||!element||!nativeAttribute||nativeAttribute.call(element,'data-stateatom')!==context.marker)return;
        const root=[...reactRoots.values()].find(r=>owns(r,element));if(!root)return;
        drain(root);const ref={context,root,version:root.version,active:true};reactRefs.set(element,ref);previous=ref;
      }catch{} }; // No returned cleanup; compatible with React 18 and 19 ref semantics.
    },
    // Dev-only Vue computed debug events: actual reads, never toRaw()/getter re-execution.
    // Deliberately an observation, not a synthetic operand or framework commit edge.
    vueComputed(computed,args){
      if(!active||args.length>2)return nativeApply(computed,undefined,args);
      // Do not inspect/clone arbitrary application debug objects (including Proxies).
      // Existing debug options are passed through unchanged; this adapter is not enabled there.
      if(args[1]!=null)return nativeApply(computed,undefined,args);
      const options={onTrack(event){
        if(!active||!stack.length)return;
        try{
          if(event.type!=='get'||typeof event.key!=='string')return;
          const origin=origins.get(event.target),original=descriptors.get(event.target)?.[event.key];
          if(!origin||!original||invalidatedDescriptors.has(original)||!('value'in original))return;
          const current=ownDescriptor(event.target,event.key);
          if(!current||!('value'in current)||current.value!==original.value||writes.get(event.target)?.has(event.key))return;
          const context=stack.at(-1),path=origin.pointer+'/'+pointer(event.key);if(path.length>512)return;
          add({...context.meta,kind:'framework-read',scope:context.scope,framework:'Vue computed onTrack',expression:'actual Vue get '+event.key},current.value,[],{objectIdentity:{...origin,pointer:path,scope:'parsed raw object/key identity only; not current value provenance'},valueOrigin:'Unknown/Unsupported',boundary:'actual raw framework read; same-value/local writes not excluded; exact operand/state-write/commit correspondence not established'});
        }catch{} // Optional telemetry must not alter the application's read/error behavior.
      }};
      return nativeApply(computed,undefined,[args[0],options]);
    },
    target(meta,scope,fn){const value=capture({...meta,kind:'target'},scope,fn),context=jsxStack.at(-1);if(context?.marker===scope+':'+meta.target)context.ids.set(meta.property,mapRead(targets,context.marker+':'+meta.property));return value;},
    read(meta,scope,binding,value){if(!active)return value;
      const previous=meta.historyUnknown?null:mapRead(bindings,scope+':'+binding),origin=object(value)?telemetryOps.weakGet(origins,value):null;
      add({...meta,kind:'read',scope,binding},value,previous?[previous]:[],{...(origin?{origin}:{}),...(meta.historyUnknown?{boundary:'mutable or block/loop binding history unsupported'}:previous||origin?{}:{boundary:'binding write/parameter provenance not observed'})});return value;
    },
    member(meta,obj,key){
      const value=obj[key]; // The original property read, including its one ToPropertyKey/getter invocation.
      if(!active)return value;
      if(object(key)){add({...meta,kind:'member'},value,[],{boundary:'computed object key history unsupported; key not coerced again'});return value;}
      const write=object(obj)?mapRead(telemetryOps.weakGet(writes,obj),key):null;
      const original=object(obj)?telemetryOps.weakGet(descriptors,obj)?.[key]:null;
      const current=original?ownDescriptor(obj,key):null;
      const changed=original&&(!current||!('value'in current)||current.value!==original.value);
      const potential=potentialObject(obj),invalidated=original&&(telemetryOps.weakHas(invalidatedDescriptors,original)||potential),origin=original&&!changed&&!invalidated&&object(obj)?telemetryOps.weakGet(origins,obj):null;
      add({...meta,kind:'member',key:typeof key==='symbol'?'[symbol]':telemetryOps.string(key)},value,write?[write]:[],
        potential?{boundary:'Potential property write access invalidated this parsed field; completion is not established by this guard'}:write?{boundary:'local property write; HTTP leaf no longer authoritative'}:invalidated?{boundary:'Observed property operation invalidated this parsed field; write record may have expired'}:changed?{boundary:'JSON property changed since parse; local history unknown'}:origin?{origin:{...origin,pointer:origin.pointer+'/'+pointer(key)}}:{boundary:'object/property history not observed; not an original own JSON data field'});
      return value;
    },
    propertyCallee(meta,scope,receiver,key){const fn=receiver[key],kind=mapRead(nativePropertyCalls,fn);return function(...args){
      if(!kind||!active)return nativeApply(fn,receiver,args);let result;
      try{return result=nativeApply(fn,receiver,args);}finally{try{
        const first=args[0],second=kind==='Reflect.set'&&args.length>3&&args[3]!==first?args[3]:null;
        const knownFirst=object(first)?descriptors.get(first):null,knownSecond=object(second)?descriptors.get(second):null;
        if(knownFirst||knownSecond){const n=add({...meta,kind:'native-property-call',scope,operation:kind},result,[],{boundary:'Original captured native property call attempted; known target fields invalidated conservatively, including partial failure; opaque effects and complete coverage unknown'});
          invalidateParsedFields(first,knownFirst,n);invalidateParsedFields(second,knownSecond,n);
        }

      }catch{}} // Never replace the original native result/error.
    };},
    writeReference(value){return object(value)&&NativeWeakRef&&typeof nativeWeakDeref==='function'?{ref:new NativeWeakRef(value)}:{value};},
    writeTarget(reference){const ref=field(reference,'ref');if(ref!==missingField)return nativeApply(nativeWeakDeref,ref,[]);const value=field(reference,'value');reference.value=null;return value;},
    propertyOperation(meta,scope,reference,key,result){
      const ref=reference&&field(reference,'ref'),obj=ref&&ref!==missingField?nativeApply(nativeWeakDeref,ref,[]):null;if(!active||!sourceWrites||!object(obj)||typeof key!=='string')return result;
      try{const original=descriptors.get(obj)?.[key];if(original)invalidatedDescriptors.add(original);
        const n=add({...meta,kind:'property-operation',scope},result,[],{boundary:'Original property operation completed; accessor/proxy effects and complete write coverage are not established'});if(n){let map=writes.get(obj);if(!map){map=new Map();writes.set(obj,map);}put(map,key,n.id,128);}}catch{}return result;
    },
    write(meta,scope,obj,key,fn){const value=capture({...meta,kind:'local-write'},scope,fn);obj[key]=value;
      if(active&&object(obj)&&!object(key)){const original=descriptors.get(obj)?.[key];if(original)invalidatedDescriptors.add(original);let map=writes.get(obj);if(!map){map=new Map();writes.set(obj,map);}const n=mapRead(captures,scope+':'+meta.key)?.node;if(n)put(map,key,n.id,128);}return value;
    },
    pattern(meta,scope,binding,value,initKey,keys,last=false){
      const init=mapRead(captures,scope+':'+initKey);let origin=init?.object?origins.get(init.object):null,current=init?.object;
      for(const key of keys){const original=current&&descriptors.get(current)?.[key],d=original?ownDescriptor(current,key):null;
        if(!original||invalidatedDescriptors.has(original)||potentialObject(current)||!d||!('value'in d)||d.value!==original.value||writes.get(current)?.has(key)){origin=null;break;}current=original.value;
      }
      const n=add({...meta,kind:'destructure',scope,binding},value,init?[init.node.id]:[],origin?{origin:{...origin,pointer:origin.pointer+keys.map(k=>'/'+pointer(k)).join('')}}:{boundary:'destructure root/property history unknown'});
      if(n&&!meta.historyUnknown)put(bindings,scope+':'+binding,n.id);if(last&&init)init.object=null;return value;
    },
    snapshot(instance,property,element){
      if(serializationHook()){const unavailable=nativeCreate(null);unavailable.schema=1;unavailable.page=page;unavailable.status='Unknown/Unsupported';unavailable.reason='Application prototype serialization hook unsupported; not invoked for inspection';unavailable.target=null;return unavailable;}
      if(!active)return {schema:1,page,status:'Unknown/Unsupported',reason:'observer stopped; old history is not current',target:null,nodes:[],recentExchanges:[],retention:{hostNodes:hostNodes.size,reactRoots:reactRoots.size},limits};
      const binding=element&&mapRead(committed.get(element),property);
      let commit={status:'Unknown/Unsupported',reason:'No supported React commit binding for this actual DOM node/property'};
      if(binding){const {root,ref,record}=binding;
        drain(root);
        if(stale)commit={...record,status:'Stale',reason:stale};
        else if(mapRead(reactRoots,root.key)!==root||!owns(root,element)||!ref.active||ref.version!==root.version||root.lastScan||nativeAttribute.call(element,'data-stateatom')!==instance||record.marker!==instance||domValue(element,property)!==record.value||!nodes.has(record.targetId))commit={status:'Unknown/Unsupported',reason:root.lastScan||(ref.version!==root.version?'DOM changed after the recorded ref commit':'Committed DOM identity, marker, value or retained execution no longer current')};
        else commit={...record};
      }
      if(hostProbe)commit=hostSnapshot(element,instance,property);
      const targetId=commit.status==='Observed'?commit.targetId:mapRead(targets,instance+':'+property),target=mapRead(nodes,targetId),out=[],seen=new Set();let missing=false;
      const walk=id=>{if(seen.has(id)||out.length>=limits.closure){if(!seen.has(id))missing=true;return;}seen.add(id);const n=mapRead(nodes,id);if(!n){missing=true;return;}if(n.missingDependencies)missing=true;out.push(n);for(const d of n.deps)walk(d);};if(targetId)walk(targetId);
      if(missing&&commit.status==='Observed')commit={...commit,status:'Unknown/Unsupported',reason:'Committed execution closure/retention budget'};
      const producerUnknown=hostProbe?commit.status!=='Observed'||commit.producer?.status!=='Observed':commit.status==='Observed'&&commit.producer?.status!=='Observed';
      const stateHandoffs=stateLedger&&commit.status==='Observed'?stateLedger.witness(out,new Set((mapRead(hostCommits.get(element),property)?.ancestors||[]).map(r=>r.deref()).filter(Boolean))):null;
      const result={schema:1,page,...(actionTrace?{actionTrace:{availability:actionTraceInfo(),observation:actionTraceRead()}}:{}),...(stateHandoffs?{stateHandoffs}:{}),status:stale?'Stale':target&&!missing&&!producerUnknown?'Observed':'Unknown/Unsupported',reason:stale||(missing?'trace closure/retention budget':!target?'No dev target execution observed':producerUnknown?(commit.reason||commit.producer?.reason||'Final host producer unavailable'):null),target:target||null,commit,nodes:out,
        independentObservations:[...nodes.values()].filter(n=>n.scope===target?.scope&&n.kind==='binding'&&!seen.has(n.id)).slice(-20).map(n=>({...n,separateFromTarget:true})),
        exchanges:exchanges.filter(e=>out.some(n=>n.origin?.exchangeId===e.id)),recentExchanges:exchanges.slice(-32),dropped,missing,
        retention:{nodes:nodes.size,captures:captures.size,bindings:bindings.size,targets:targets.size,reactRoots:reactRoots.size,hostNodes:hostNodes.size,objectRoots:[...captures.values()].filter(c=>c.object).length},boundaries:[...new Set([...out.map(n=>n.boundary).filter(Boolean),...(sourceWrites?['Completed property-write coverage incomplete: computed keys, logical assignments, class initializers, aliased/unrecognized native/opaque writes and missing earlier history remain unsupported.']:[]),...(writeAccessGuards?['Potential write-access guards conservatively invalidate eligible source receivers; optional/super/implicit-field/native/opaque/history gaps remain.']:[])])],limits};
      if(JSON.stringify(result).length>limits.exportBytes)return {schema:1,page,status:'Unknown/Unsupported',reason:'export byte budget',target:null,nodes:[],exchanges:[],recentExchanges:[],limits};return result;
    },
    invalidate(reason){stale=reason;actionCollector?.invalidate();},
    stop(){
      active=false;
      for(const cleanup of[()=>actionCollector?.stop(),()=>stateLedger?.stop(),()=>queryLedger?.stop(),()=>headGuard?.disconnect(),()=>rootGuard?.disconnect()])try{cleanup();}catch{}
      try{for(const record of hostNodes.values()){record.active=false;try{record.observer.disconnect();}catch{}}}catch{}try{hostNodes.clear();}catch{}
      try{for(const root of reactRoots.values()){root.active=false;try{root.mutations?.disconnect();}catch{}}}catch{}try{reactRoots.clear();}catch{}
      restoreHook(w,'fetch',wrappedFetch,fetchDescriptor);restoreHook(proto,'json',wrappedJSON,jsonDescriptor);
    },
  };
  const originalFetch=w.fetch,proto=w.Response.prototype,originalJSON=proto.json;
  const nativeDefine=Object.defineProperty,nativeDelete=Reflect.deleteProperty;
  function savedDescriptor(receiver,key){const descriptor=ownDescriptor(receiver,key);if(!descriptor)return;const saved=nativeCreate(null),keys=['value','writable','get','set','enumerable','configurable'];for(let i=0;i<keys.length;i++){const value=ownDescriptor(descriptor,keys[i]);if(value)saved[keys[i]]=ownDataValue(value);}return saved;}
  const fetchDescriptor=savedDescriptor(w,'fetch'),jsonDescriptor=savedDescriptor(proto,'json');
  function restoreHook(receiver,key,wrapper,descriptor){try{if(ownDataValue(ownDescriptor(receiver,key))!==wrapper)return;if(descriptor)nativeDefine(receiver,key,descriptor);else nativeDelete(receiver,key);}catch{}}

  function wrappedFetch(...args){
    const serial=++exchangeSerial,id=page+':exchange'+serial;let acquisition,invoke;
    if(fetchInitiators){const scriptURL='stateatom-fetch://'+page+'/'+serial;acquisition={status:'Unknown/Unsupported',scriptURL,reason:'Generated-script budget exceeded'};
      const denied=fetchPolicyReason();if(denied)acquisition.reason=denied;
      if(!denied&&serial<=32)try{if(typeof fetchConstructor!=='function')throw new Error('constructor unavailable');invoke=nativeApply(fetchConstructor,undefined,['apply','fetch','receiver','args','return apply(fetch,receiver,args);\n//# sourceURL='+scriptURL]);acquisition={status:'Generated',scriptURL};}catch{acquisition.reason='CSP/Function constructor unavailable; native fetch preserved';}}
    const promise=invoke?invoke(nativeApply,originalFetch,this,args):nativeApply(originalFetch,this,args);let url='[unsupported input]';
    if(typeof args[0]==='string')try{url=new URL(args[0],w.location.href).href;}catch{}
    let urlOrdinal=null;
    if(/^http:\/\/127\.0\.0\.1:(4173|4174|4175)\//.test(url)&&url.length<1024){urlOrdinal=(mapRead(urlCounts,url)||0)+1;put(urlCounts,url,urlOrdinal,128);}
    if(sourceConsumption){if(active&&urlOrdinal!==null&&object(promise))sourcePromises.set(promise,{kind:'fetch',exchange:{id,url,urlOrdinal,...(acquisition?{acquisition}:{}),method:'not inspected; browser owns method',startedAt:Date.now()}});}
    else promise.then(response=>{if(!active||urlOrdinal===null)return;try{responses.set(response,{id,url,urlOrdinal,method:'not inspected; browser owns method',startedAt:Date.now()});}catch{}},()=>{}).catch(()=>{});
    return promise;
  }
  function wrappedJSON(...args){
    const promise=nativeApply(originalJSON,this,args),exchange=responses.get(this);
    if(sourceConsumption){if(active&&exchange&&object(promise))sourcePromises.set(promise,{kind:'json',exchange,mode:null,consumed:false});}
    else promise.then(value=>{if(!active||!exchange)return;try{recordJSON(exchange,value);}catch{}},()=>{}).catch(()=>{});return promise;
  }
  // Freeze only our API surface. Application objects and callbacks remain untouched.
  freezeObserverAPI(api);
  const registration={api,phase:'publishing'};retainObserver(w,registration);
  try{w.fetch=wrappedFetch;proto.json=wrappedJSON;w.__STATEATOM__=api;registration.phase='active';return api;}
  catch(error){forgetObserver(w);try{api.stop();}catch{}throw error;}
}
