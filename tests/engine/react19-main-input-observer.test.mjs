// SPDX-License-Identifier: Apache-2.0
// New owned source controls; no browser or application expression replay.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createMainInputObserver} from '../../experiments/react19-reducer/main-input-observer.mjs';
const digest='a'.repeat(64),site=(id,kind)=>({id:id.repeat(64),file:'owned-main.jsx',sourceDigest:digest,kind,line:1,column:1,endLine:20,endColumn:1});
const policy=()=>({mainSite:{...site('1','main-input'),functionName:'Main',parameter:'todos'},filterSite:site('2','filter'),mapSite:site('3','map')});
const jsxSite={id:'4'.repeat(64),file:'owned-compiled.js',sourceDigest:'b'.repeat(64),line:1,column:1,endLine:1,endColumn:40};
const nativeFilter=Array.prototype.filter,nativeMap=Array.prototype.map,apply=Reflect.apply;
function control(options={}){const p=policy(),o=createMainInputObserver({page:'owned-main-input',enabled:true,policy:p,...options});o.startWindow('case');return{o,p};}
function renderMap(o,p,rows){
 const token=o.arrayRuntime.begin(nativeMap,rows,p.mapSite.id);
 const elements=apply(nativeMap,rows,[(item,index,array)=>{
  const frame=o.enter(token,p.mapSite.id,item,index,array),config={todo:item};
  o.tap('config-input',item,config,jsxSite);const element={props:config};o.tap('jsx-element-return',element,config);
  assert.equal(o.returned(frame,element),element);o.exit(frame);return element;
 }]);
 assert.equal(o.arrayRuntime.finish(token,elements),elements);return elements;
}
function program(o,p,{todos=[{private:'private-main-input'}],receiver=todos,memo=null,complete=true,close=true}={}){
 const arg={todos},main=o.mainEnter(arg,todos,p.mainSite.id);let visible=memo;
 if(!visible){const filter=o.arrayRuntime.begin(nativeFilter,receiver,p.filterSite.id);visible=apply(nativeFilter,receiver,[()=>true]);assert.equal(o.arrayRuntime.finish(filter,visible),visible);}
 const elements=renderMap(o,p,visible),root={elements};
 if(complete)assert.equal(o.mainReturned(main,root),root);
 if(close)o.mainExit(main);
 return{arg,todos,visible,elements,root,main};
}
const view=o=>o.sealWindow().snapshot;
const unknown=s=>{assert.equal(s.status,'Unknown/Unsupported');assert.equal(s.links.length,0);};
test('same Main binding/native filter return/map receiver and actual callback lookup produce one bounded link',()=>{
 const{o,p}=control(),r=program(o,p),s=view(o);assert.equal(s.schema,'stateatom.main-parameter-filter-map/1');assert.equal(s.status,'Observed');assert.equal(s.links.length,1);
 const l=s.links[0];assert.equal(l.filterResultId,l.mapReceiverId);assert.equal(l.parameterId,l.filterReceiverId);assert.equal(l.parameter,'todos');assert.equal(l.mainSite.sourceDigest,digest);
 assert.equal(s.callbackInterval.status,'Observed');assert.equal(l.callbackOccurrence.configInputOccurrence.field,'todo');
 for(const k of ['propStorage','propTransfer','fieldOwnership','stateRevision','selectedPropertyOrigin','componentInstance'])assert.equal(s[k],'Unknown/Unsupported');
 assert.equal(s.nativeOrigin,'NotAttested');assert.equal(s.fullPath,false);assert.equal(o.lookup(r.elements[0]).links.length,1);unknown(o.lookup({props:{todo:r.todos[0]}}));
 assert.doesNotMatch(JSON.stringify(s),/private-main-input/);
});
test('two equal-valued row objects retain distinct scoped links',()=>{const{o,p}=control();program(o,p,{todos:[{private:'same'},{private:'same'}]});const s=view(o);assert.equal(s.links.length,2);assert.notEqual(s.links[0].callbackOccurrence.itemId,s.links[1].callbackOccurrence.itemId);assert.notEqual(s.links[0].callbackOccurrence.elementId,s.links[1].callbackOccurrence.elementId);});
test('equal-copy filter receiver is not the bound parameter',()=>{const{o,p}=control(),todos=[{}];program(o,p,{todos,receiver:[...todos]});unknown(view(o));});
test('cached result without a current filter cannot be borrowed despite an actual callback interval',()=>{const{o,p}=control(),todos=[{}];program(o,p,{todos,memo:[todos[0]]});const s=view(o);unknown(s);assert.equal(s.callbackInterval.status,'Observed');});
test('previous Main invocation filter result cannot qualify a later memo-only map',()=>{const{o,p}=control(),todos=[{}],first=program(o,p,{todos});program(o,p,{todos,memo:first.visible});unknown(view(o));});
test('normal callback results in an abruptly exited Main do not qualify',()=>{const{o,p}=control();program(o,p,{complete:false});unknown(view(o));});
test('seal during an open Main never becomes positive after late return/exit',()=>{const{o,p}=control(),r=program(o,p,{complete:false,close:false}),before=o.sealWindow();unknown(before.snapshot);o.mainReturned(r.main,r.root);o.mainExit(r.main);unknown(o.snapshot());assert.deepEqual(before.snapshot.links,[]);});
test('stale Main token after a new window cannot adopt a fresh path',()=>{const{o,p}=control(),old=o.mainEnter({todos:[]},[],p.mainSite.id);o.startWindow('next');o.mainReturned(old,{});o.mainExit(old);unknown(view(o));});
test('Stop clears all bridge references and never accepts later observations',()=>{const{o,p}=control();program(o,p);o.stop();const s=view(o);unknown(s);assert.equal(s.sealed,false);assert.equal(o.retention().mainFrames,0);assert.equal(o.retention().calls,0);assert.equal(o.retention().callbacks,0);program(o,p);unknown(o.snapshot());});
test('off profile leaves application output but records no bridge',()=>{const{o,p}=control({enabled:false}),r=program(o,p);assert.equal(r.elements.length,1);unknown(view(o));assert.equal(o.retention().mainFrames,0);});
test('new event metadata objects/getters/Proxies are never inspected',()=>{
 for(const field of ['main','filter','map']){const{o,p}=control();let traps=0;const bad=new Proxy({},{get(){traps++;throw Error('app');},ownKeys(){traps++;throw Error('app');},getOwnPropertyDescriptor(){traps++;throw Error('app');}});
  if(field==='main')o.mainEnter({todos:[]},[],bad);else if(field==='filter')o.arrayRuntime.begin(nativeFilter,[],bad);else{o.mainEnter({todos:[]},[],p.mainSite.id);o.enter({},bad,{},0,[]);}
  unknown(view(o));assert.equal(traps,0);
 }
});
test('constructor metadata accessors are refused without invoking them',()=>{let reads=0;const p=policy();Object.defineProperty(p.mainSite,'sourceDigest',{get(){reads++;return digest;}});assert.throws(()=>createMainInputObserver({page:'owned',policy:p}));assert.equal(reads,0);});
test('constructor policy sites cannot cross source digests/files or change binding',()=>{
 for(const change of [p=>p.filterSite.sourceDigest='b'.repeat(64),p=>p.mapSite.file='foreign.jsx',p=>p.mainSite.parameter='other',p=>p.mainSite.functionName='Other']){
  const p=policy();change(p);assert.throws(()=>createMainInputObserver({page:'owned',policy:p}));
 }
});
test('source policy is copied before application mutations',()=>{const{o,p}=control(),saved=policy();p.mainSite.parameter='other';p.filterSite.sourceDigest='b'.repeat(64);program(o,saved);assert.equal(view(o).status,'Observed');});
test('foreign filter intrinsic is unqualified even if it returns a suitable array',()=>{const{o,p}=control(),todos=[{}],main=o.mainEnter({todos},todos,p.mainSite.id),f=o.arrayRuntime.begin(function filter(){},todos,p.filterSite.id),visible=[todos[0]];o.arrayRuntime.finish(f,visible);const elements=renderMap(o,p,visible);o.mainReturned(main,{elements});o.mainExit(main);unknown(view(o));});
test('native filter must finish normally before its result can become a map receiver',()=>{const{o,p}=control(),todos=[{}],main=o.mainEnter({todos},todos,p.mainSite.id);o.arrayRuntime.begin(nativeFilter,todos,p.filterSite.id);const elements=renderMap(o,p,[todos[0]]);o.mainReturned(main,{elements});o.mainExit(main);unknown(view(o));});
test('aborted filter cannot qualify a map receiver',()=>{const{o,p}=control(),todos=[{}],main=o.mainEnter({todos},todos,p.mainSite.id),f=o.arrayRuntime.begin(nativeFilter,todos,p.filterSite.id);o.arrayRuntime.abort(f);const elements=renderMap(o,p,[todos[0]]);o.mainReturned(main,{elements});o.mainExit(main);unknown(view(o));});
test('two filter occurrences returning the same object are ambiguous',()=>{
 const{o,p}=control(),todos=[{}],main=o.mainEnter({todos},todos,p.mainSite.id),visible=[todos[0]];
 for(let i=0;i<2;i++){const f=o.arrayRuntime.begin(nativeFilter,todos,p.filterSite.id);o.arrayRuntime.finish(f,visible);}
 const elements=renderMap(o,p,visible);o.mainReturned(main,{elements});o.mainExit(main);unknown(view(o));
});
test('out-of-order Main exits refuse rather than taking the nearest frame',()=>{const{o,p}=control(),a=o.mainEnter({todos:[]},[],p.mainSite.id);o.mainEnter({todos:[]},[],p.mainSite.id);o.mainReturned(a,{});o.mainExit(a);unknown(view(o));});
test('Main frame capacity is finite and clears weak-reference metadata on refusal',()=>{const{o,p}=control();for(let i=0;i<65;i++){const a=[],m=o.mainEnter({todos:a},a,p.mainSite.id);o.mainReturned(m,{});o.mainExit(m);}unknown(view(o));assert.equal(o.retention().overflow,true);assert(o.retention().mainFrames<=64);});
test('application values and argument Proxies are not reflected or traversed',()=>{
 const{o,p}=control();let traps=0;const item=new Proxy({},{get(){traps++;throw Error('app');},ownKeys(){traps++;throw Error('app');},getOwnPropertyDescriptor(){traps++;throw Error('app');}}),todos=[item],arg=new Proxy({},{get(){traps++;throw Error('arg');},ownKeys(){traps++;throw Error('arg');},getOwnPropertyDescriptor(){traps++;throw Error('arg');}});
 const main=o.mainEnter(arg,todos,p.mainSite.id),f=o.arrayRuntime.begin(nativeFilter,todos,p.filterSite.id),visible=apply(nativeFilter,todos,[()=>true]);o.arrayRuntime.finish(f,visible);const elements=renderMap(o,p,visible);o.mainReturned(main,{elements});o.mainExit(main);assert.equal(view(o).status,'Observed');assert.equal(traps,0);
});
test('captured WeakMap/array intrinsics do not invoke later app replacements',()=>{
 const{o,p}=control(),get=WeakMap.prototype.get,push=Array.prototype.push,iterator=Array.prototype[Symbol.iterator];let calls=0,s;
 try{WeakMap.prototype.get=function(){calls++;throw Error('app');};Array.prototype.push=function(){calls++;throw Error('app');};Array.prototype[Symbol.iterator]=function(){calls++;throw Error('app');};program(o,p);s=view(o);}
 finally{WeakMap.prototype.get=get;Array.prototype.push=push;Array.prototype[Symbol.iterator]=iterator;}
 assert.equal(calls,0);assert.equal(s.status,'Observed');
});
test('a weak-unavailable Main binding cannot borrow a still-observed callback-only interval',()=>{
 const Original=globalThis.WeakRef,refs=[],dead=new WeakSet();let s;
 globalThis.WeakRef=class ControlledWeakRef{constructor(value){this.value=value;refs[refs.length]=this;}deref(){return dead.has(this)?undefined:this.value;}};
 try{const{o,p}=control();program(o,p);dead.add(refs[1]);s=view(o);}finally{globalThis.WeakRef=Original;}
 unknown(s);assert.equal(s.callbackInterval.status,'Observed');
});
test('same-source filter/map metadata still must lie inside the declared Main range',()=>{
 for(const change of [p=>{p.filterSite.line=21;p.filterSite.endLine=22;},p=>p.mapSite.endColumn=2]){
  const p=policy();change(p);assert.throws(()=>createMainInputObserver({page:'owned',policy:p}));
 }
});

test('generated absent-token cleanup is harmless before native begin and after a completed Main',()=>{
 const{o,p}=control();o.arrayRuntime.abort(undefined);o.arrayRuntime.abort(null);program(o,p);o.arrayRuntime.abort(null);assert.equal(view(o).status,'Observed');
});
test('completed owned native token cleanup preserves its same-invocation handoff',()=>{
 const{o,p}=control(),todos=[{}],arg={todos},main=o.mainEnter(arg,todos,p.mainSite.id),f=o.arrayRuntime.begin(nativeFilter,todos,p.filterSite.id),visible=apply(nativeFilter,todos,[()=>true]);
 o.arrayRuntime.finish(f,visible);o.arrayRuntime.abort(f);const elements=renderMap(o,p,visible);o.mainReturned(main,{elements});o.mainExit(main);o.arrayRuntime.abort(f);assert.equal(view(o).status,'Observed');
});
test('foreign and previous-generation native cleanup tokens still refuse the bridge',()=>{
 for(const stale of [false,true]){const{o,p}=control(),todos=[{}],arg={todos};o.mainEnter(arg,todos,p.mainSite.id);const f=o.arrayRuntime.begin(nativeFilter,todos,p.filterSite.id);o.arrayRuntime.finish(f,[]);if(stale)o.startWindow('next');o.arrayRuntime.abort(stale?f:{});unknown(view(o));assert.equal(o.retention().invalid,true);}
});
