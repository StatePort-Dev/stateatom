// SPDX-License-Identifier: Apache-2.0
// OWNED declared-event identity controls, never actual React/native execution.
import test from 'node:test';import assert from 'node:assert/strict';
import {createNativeStateSourcePathObserver} from '../../experiments/react19-reducer/native-state-source-path-observer.mjs';
const U='Unknown/Unsupported',site=(id,kind,name,file='owned-native.js',digest='e')=>({id:id.repeat(64),file,sourceDigest:digest.repeat(64),kind,functionName:name,line:1,column:1,endLine:20,endColumn:100});
function setup({enabled=true,opaque=false}={}){
 const p={app:{appSite:site('1','app-hook-function','App','owned-App.jsx','a'),bindingSite:{...site('2','app-hook-binding','App','owned-App.jsx','a'),callName:'useReducer',todosBinding:'todos',dispatchBinding:'dispatch'}},main:{mainSite:{...site('3','main-input','Main','owned-Main.jsx','b'),parameter:'todos'},filterSite:site('4','filter','Main','owned-Main.jsx','b'),mapSite:site('5','map','Main','owned-Main.jsx','b')},configSite:{...site('6','app-main-config','App','owned-lowered.js','c'),appSiteId:'1'.repeat(64),bindingSiteId:'2'.repeat(64),field:'todos',component:'Main'},jsxSite:site('7','jsx-config','Main','owned-main-lowered.js','d'),native:{file:'owned-native.js',sourceDigest:'e'.repeat(64),version:'19.2.5',nativeVersionAdmitted:false,returnSites:[site('8','native-state-return','mountReducer'),site('9','native-state-return','updateReducerImpl'),site('a','native-state-return','rerenderReducer')],renderSites:[site('b','native-render-component','renderWithHooks'),site('c','native-render-component','renderWithHooksAgain')]}};
 let traps=0;const deny={get(){traps++;throw Error('get');},getOwnPropertyDescriptor(){traps++;throw Error('descriptor');},ownKeys(){traps++;throw Error('keys');}},wrap=v=>opaque?new Proxy(v,deny):v,component=wrap(function App(){});
 const o=createNativeStateSourcePathObserver({page:'owned-state-source',enabled,policy:p});o.startWindow('case');
 function app({items=[{same:'value'},{same:'value'}],sharedState=null,sharedDispatch=null,fault=null}={}){
  const state=sharedState||wrap(items),dispatch=sharedDispatch||wrap(function dispatch(){}),tuple=wrap([state,dispatch]),fiber=wrap({}),method=wrap(()=>tuple);
  o.nativeTap('render-component',fiber,fault==='other-component'?function App(){}:component,p.native.renderSites[0].id);
  const t=o.appHook.appEnter(p.app.appSite.id,component);
  if(fault!=='missing-native')o.nativeTap('state-result',tuple,wrap({}),fiber,p.native.returnSites[0].id,state,dispatch);
  const bound=fault==='copy-state'?[...items]:state;
  o.appHook.result(t,tuple,method,p.app.bindingSite.id);o.appHook.bound(t,tuple,bound,dispatch,p.app.bindingSite.id);
  const config=wrap({todos:bound,dispatch}),element=wrap({});o.appHook.config(t,config,p.configSite.id);
  o.tap('jsx-element-return',element,fault==='copy-props'?{todos:bound,dispatch}:config);
  if(fault!=='abrupt')o.appHook.appReturned(t,element);o.appHook.appExit(t);
  return{t,state:bound,items,dispatch,tuple,config,element,fiber};
 }
 function main(parent,{copyArgument=false,foreignReturn=false,duplicateElement=false,missingExit=false}={}){
  const m=o.mainInput,arg=copyArgument?{todos:parent.state,dispatch:parent.dispatch}:parent.config,frame=m.mainEnter(arg,parent.state,p.main.mainSite.id);
  const f=m.arrayRuntime.begin(Array.prototype.filter,parent.state,p.main.filterSite.id),visible=parent.items.slice();m.arrayRuntime.finish(f,visible);m.arrayRuntime.abort(null);
  const map=m.arrayRuntime.begin(Array.prototype.map,visible,p.main.mapSite.id),elements=[];
  for(let i=0;i<visible.length;i++){const item=visible[i],h=m.enter(map,p.main.mapSite.id,item,i,visible),config=wrap({todo:item}),e=duplicateElement&&i?elements[0]:wrap({});o.tap('config-input',item,config,p.jsxSite);o.tap('jsx-element-return',e,config);m.returned(h,foreignReturn?wrap({}):e);if(!missingExit)m.exit(h);elements.push(e);}
  m.arrayRuntime.finish(map,elements);m.arrayRuntime.abort(null);m.mainReturned(frame,{});m.mainExit(frame);return elements;
 }
 return{o,p,app,main,traps:()=>traps};
}
function unknown(s){assert.equal(s.status,U);assert.equal(s.links.length,0);}
// Controlled declared-event references only: not real GC, React or native execution.
function controlled(fn){const Original=globalThis.WeakRef,lost=new WeakSet(),reads=new Map();globalThis.WeakRef=class{constructor(v){this.value=v;}deref(){reads.set(this.value,(reads.get(this.value)||0)+1);return lost.has(this.value)?undefined:this.value;}};try{return fn({lose:v=>lost.add(v),reads});}finally{globalThis.WeakRef=Original;}}
for(const selectedFirst of [false,true])test('exact selected source survives unrelated native fiber loss, selectedFirst='+selectedFirst,()=>controlled(({lose})=>{
 const f=setup(),a=f.app(),b=f.app(),ea=f.main(a),eb=f.main(b),selected=selectedFirst?ea[0]:eb[0],other=selectedFirst?b:a;
 f.o.sealWindow();const before=f.o.lookupStateSource(selected);assert.equal(before.status,'Observed');assert.equal(before.links.length,1);lose(other.fiber);
 unknown(f.o.sealWindow().stateSource.snapshot);const after=f.o.lookupStateSource(selected);assert.equal(after.status,'Observed');assert.deepEqual(after.links,before.links);assert.equal(after.sourceOnly,true);assert.equal(after.nativeOrigin,'NotAttested');assert.equal(after.fullPath,false);unknown(f.o.sealWindow().stateSource.snapshot);
}));
test('selected source avoids unrelated native fiber dereference',()=>controlled(({reads})=>{const f=setup(),a=f.app(),b=f.app();f.main(a);const selected=f.main(b)[1];f.o.sealWindow();reads.clear();assert.equal(f.o.lookupStateSource(selected).status,'Observed');assert.equal(reads.has(a.fiber),false);assert(reads.get(b.fiber)>0);}));
test('selected native loss cannot borrow neighboring complete source reference',()=>controlled(({lose})=>{const f=setup(),a=f.app(),b=f.app(),ea=f.main(a),eb=f.main(b);f.o.sealWindow();lose(b.fiber);unknown(f.o.lookupStateSource(eb[0]));assert.equal(f.o.lookupStateSource(ea[0]).status,'Observed');unknown(f.o.sealWindow().stateSource.snapshot);}));
test('selected callback weak loss remains Unknown even with its live private index key',()=>controlled(({lose})=>{const f=setup(),a=f.app(),elements=f.main(a);f.o.sealWindow();lose(elements[0]);unknown(f.o.lookupStateSource(elements[0]));unknown(f.o.lookupStateSource(elements[1]));unknown(f.o.sealWindow().stateSource.snapshot);}));
test('foreign or equal-content unindexed element never substitutes for exact source',()=>controlled(()=>{const f=setup(),a=f.app(),elements=f.main(a);f.o.sealWindow();assert.equal(f.o.lookupStateSource(elements[0]).status,'Observed');for(const value of [{},{...elements[0]},null,42])unknown(f.o.lookupStateSource(value));}));
test('unsealed, stale and stopped source queries remain Unknown',()=>controlled(()=>{const f=setup(),a=f.app(),elements=f.main(a);unknown(f.o.lookupStateSource(elements[0]));f.o.sealWindow();assert.equal(f.o.lookupStateSource(elements[0]).status,'Observed');f.o.startWindow('new');const b=f.app(),next=f.main(b);f.o.sealWindow();unknown(f.o.lookupStateSource(elements[0]));assert.equal(f.o.lookupStateSource(next[0]).status,'Observed');f.o.stop();unknown(f.o.lookupStateSource(next[0]));}));
test('a global duplicate callback invalidation still vetoes exact source selection',()=>controlled(()=>{const f=setup(),a=f.app(),selected=f.main(a)[0],b=f.app();f.main(b,{duplicateElement:true});unknown(f.o.sealWindow().stateSource.snapshot);unknown(f.o.lookupStateSource(selected));}));
