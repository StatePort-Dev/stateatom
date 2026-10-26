// SPDX-License-Identifier: Apache-2.0
// OWNED VM source integration. No actual React/App/native or lifetime proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {memoSourcePolicy,feedCommittedSource,attachMemoSource} from '../helpers/react19-memo-source-fixture.mjs';
const builder=await import('../../experiments/react19-reducer/committed-memo-bootstrap.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return{};throw error;});
const U='Unknown/Unsupported',slots=['__sa_app_hook_binding','__sa_callback_copy','__sa_array_calls','__STATEATOM_REACT19_JSX_INPUT__','__STATEATOM__','__STATEATOM_ELEMENT_FIBER_TAP__','__STATEATOM_MEMO_BRANCH_TAP__'];
const context=()=>vm.createContext({Array,WeakRef});
function bootstrap(p=memoSourcePolicy(),mode='on',ctx=context()){
 assert.equal(typeof builder.committedMemoBootstrap,'function');
 vm.runInContext(builder.committedMemoBootstrap({page:'memo-bootstrap',mode,policy:p}),ctx);
 const m=ctx.__sa_callback_copy,native=(...args)=>ctx.__STATEATOM__?.react19NativeTap(...args),o={appHook:ctx.__sa_app_hook_binding,mainInput:m,tap:ctx.__STATEATOM_REACT19_JSX_INPUT__||((_kind,value)=>value),nativeTap:native,
 referenceTap(...args){const kind=args[0],fn=kind==='element-fiber'?ctx.__STATEATOM_ELEMENT_FIBER_TAP__:kind.startsWith('memo-')?ctx.__STATEATOM_MEMO_BRANCH_TAP__:ctx.__STATEATOM__?.react19NativeTap;return fn?fn(...args):args[1];},
 startWindow:m.startWindow,sealWindow:m.sealWindow,stop:m.stop,lookupNode:m.lookupNode,lookupStateSource:m.lookupStateSource,retention:m.retention,referenceRetention:m.referenceRetention};
 return{ctx,o,p};
}
function run({nativeOptions={},sourceOptions={},mode='on'}={}){const f=bootstrap(memoSourcePolicy(),mode);f.o.startWindow('owned');f.source=feedCommittedSource(f.o,f.p,sourceOptions);f.native=attachMemoSource(f.o,f.p,f.source,nativeOptions);f.capture=f.o.sealWindow();f.result=f.o.lookupNode(f.native.nodes[0]);return f;}
for(const kind of ['memo-function-update-return','memo-bailout-return'])test('serialized bootstrap joins full real source factories through all actual hooks: '+kind,()=>{
 const f=run({nativeOptions:{kinds:[kind,kind]}}),r=f.result;assert.equal(f.capture.stateSource.snapshot.status,'Observed');assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');assert.equal(r.status,'Observed');assert.equal(r.links.length,1);assert.equal(r.links[0].nativeMemo.kind,kind);assert.equal(r.links[0].nativeMemo.propsReference,'Same');assert.equal(r.sourceOnly,true);assert.equal(r.nativeOrigin,'NotAttested');assert.equal(r.selectedPropertyOrigin,U);assert.equal(r.fullPath,false);assert(!JSON.stringify(r).includes('PRIVATE-'));assert.equal(f.o.referenceRetention().nativeElement.memoEnabled,true);
});
for(const kind of ['memo-function-update-return','memo-bailout-return'])test('emitted bootstrap preserves different actual memo props as explicit Unknown: '+kind,()=>{
 const f=run({nativeOptions:{kinds:[kind,kind],usedProps:[{},{}]}}),r=f.result;assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');assert.equal(r.status,U);assert.equal(r.links.length,0);assert.equal(r.memoBoundary.nativeMemo.kind,kind);assert.equal(r.memoBoundary.nativeMemo.propsReference,'Different');assert.equal(r.selectedCommittedSourceAssociation,U);
});
for(const [name,sourceOptions] of [['native-return',{nativeState:false}],['App-completion',{appComplete:false}],['Main-completion',{mainComplete:false}],['App-native-props',{appNative:false}]])test('serialized hook wiring cannot bypass original '+name+' gate',()=>{const f=run({sourceOptions});assert.equal(f.result.status,U);assert.equal(f.result.links.length,0);assert.equal(f.result.memoBoundary,undefined);});
test('missing unselected memo outcome refuses whole bootstrap lookup',()=>{const f=run({nativeOptions:{emitOutcomes:[true,false]}});assert.equal(f.result.status,U);assert.equal(f.result.links.length,0);});
test('foreign node cannot inherit serialized selected proof',()=>{const f=run();assert.equal(f.result.status,'Observed');assert.equal(f.o.lookupNode({}).status,U);});
test('Off bootstrap retains disabled old scaffolding but no native/JSX hooks or pins',()=>{
 const f=run({mode:'off'});for(const name of slots.slice(3))assert(!Object.hasOwn(f.ctx,name),name);assert(f.ctx.__sa_app_hook_binding);assert(f.ctx.__sa_callback_copy);assert(f.ctx.__sa_array_calls);assert.equal(f.result.status,U);const r=f.o.retention();assert.equal(r.referenceRetention.count,0);assert.equal(f.o.referenceRetention().callbacks,0);assert.equal(f.o.referenceRetention().nativeElement.events,0);
});
test('retention mode is original research-only App pins, valid restart and Stop release both stores',()=>{
 const f=run();let r=f.o.retention().referenceRetention;assert.equal(r.mode,'research-strong-app-elements');assert.equal(r.count,1);assert.equal(r.limit,64);assert.equal(r.reachableGraphBytes,U);assert.equal(r.historicalGCCauseProven,false);assert.equal(f.o.referenceRetention().callbacks,2);
 assert.equal(f.o.startWindow(''),null);assert.equal(f.o.lookupNode(f.native.nodes[0]).status,'Observed');assert.equal(f.o.retention().referenceRetention.count,1);f.o.startWindow('next');assert.equal(f.o.retention().referenceRetention.count,0);assert.equal(f.o.referenceRetention().callbacks,0);assert.equal(f.o.lookupNode(f.native.nodes[0]).status,U);
 const s=feedCommittedSource(f.o,f.p),n=attachMemoSource(f.o,f.p,s,{existingRoot:f.native.root});f.o.sealWindow();assert.equal(f.o.lookupNode(n.nodes[0]).status,'Observed');assert.equal(f.o.retention().referenceRetention.count,1);f.o.stop();f.o.stop();assert.equal(f.o.retention().referenceRetention.count,0);assert.equal(f.o.referenceRetention().callbacks,0);assert.equal(f.o.referenceRetention().nativeElement.bindings,0);assert.equal(f.o.referenceRetention().nativeElement.stopped,true);assert.equal(f.o.startWindow('again'),null);assert.equal(f.o.lookupNode(n.nodes[0]).status,U);const stopped=feedCommittedSource(f.o,f.p);attachMemoSource(f.o,f.p,stopped);f.o.sealWindow();assert.equal(f.o.retention().referenceRetention.count,0);assert.equal(f.o.referenceRetention().callbacks,0);assert.equal(f.o.referenceRetention().nativeElement.bindings,0);
});
test('later root commit invalidates old serialized source window',()=>{const f=run();f.native.publish();assert.equal(f.o.lookupNode(f.native.nodes[0]).status,U);});
for(const slot of slots)test('owned collision '+slot+' refuses before any other installation/getter call',()=>{
 const p=memoSourcePolicy(),ctx=context();let reads=0;Object.defineProperty(ctx,slot,{get(){reads++;throw Error('collision getter');},configurable:true});assert.equal(typeof builder.committedMemoBootstrap,'function');const script=builder.committedMemoBootstrap({page:'collision',mode:'on',policy:p});assert.throws(()=>vm.runInContext(script,ctx),/collision/i);assert.equal(reads,0);for(const other of slots)if(other!==slot)assert(!Object.hasOwn(ctx,other),other);
});
for(const [name,mutate] of [['wrong element version',p=>p.elementFiber.version='19.2.6'],['missing memo profile',p=>delete p.memoBranch],['false memo admission',p=>p.memoBranch.nativeVersionAdmitted=false],['cross-policy site collision',p=>p.memoBranch.sites[0].id=p.elementFiber.sites[0].id],['inherited memo version',p=>{const old=p.memoBranch;delete old.version;Object.setPrototypeOf(old,{version:'19.2.5'});}]] )test('builder refuses malformed supplied profile: '+name,()=>{
 const p=memoSourcePolicy();mutate(p);assert.equal(typeof builder.committedMemoBootstrap,'function');assert.throws(()=>builder.committedMemoBootstrap({page:'bad-policy',mode:'on',policy:p}));
});
for(const [name,install] of [['new profile', (p,get)=>Object.defineProperty(p.memoBranch.sites[0],'id',{get,enumerable:true})],['old source field',(p,get)=>Object.defineProperty(p.app.bindingSite,'callName',{get,enumerable:true})]])test('safe metadata copy refuses '+name+' accessor without invoking it',()=>{
 const p=memoSourcePolicy();let reads=0;install(p,()=>{reads++;return'WRONG';});assert.equal(typeof builder.committedMemoBootstrap,'function');assert.throws(()=>builder.committedMemoBootstrap({page:'getter',mode:'on',policy:p}));assert.equal(reads,0);
});
test('metadata own toJSON methods and inherited array getter are not called or serialized',()=>{
 const p=memoSourcePolicy();let calls=0;for(const x of [p,p.app,p.memoBranch,p.memoBranch.sites,p.elementFiber.sites[0],p.native.returnSites])Object.defineProperty(x,'toJSON',{value(){calls++;throw Error('toJSON');}});Object.setPrototypeOf(p.elementFiber.sites,Object.create(Array.prototype,{toJSON:{get(){calls++;throw Error('inherited toJSON');}}}));const f=bootstrap(p);assert.equal(calls,0);f.o.startWindow('owned');const s=feedCommittedSource(f.o,p),n=attachMemoSource(f.o,p,s);f.o.sealWindow();assert.equal(f.o.lookupNode(n.nodes[0]).status,'Observed');assert.equal(calls,0);
});
test('cyclic metadata refuses before serializing or executing a bootstrap',()=>{const p=memoSourcePolicy();p.memoBranch.sites[0].cycle=p;assert.equal(typeof builder.committedMemoBootstrap,'function');assert.throws(()=>builder.committedMemoBootstrap({page:'cycle',mode:'on',policy:p}));});
test('standalone factory runs without module scope and runtime cannot override embedded profiles',()=>{
 assert.equal(typeof builder.committedMemoFactory,'function');const p=memoSourcePolicy(),source=builder.committedMemoFactory({elementFiber:p.elementFiber,memoBranch:p.memoBranch});assert.equal(source,builder.committedMemoFactory({elementFiber:p.elementFiber,memoBranch:p.memoBranch}));const ctx=context(),make=vm.runInContext('('+source+')',ctx),old={app:p.app,main:p.main,configSite:p.configSite,native:p.native};assert.equal(typeof make,'function');assert.throws(()=>make({page:'override',policy:{...old,elementFiber:p.elementFiber}}),/override/i);assert.throws(()=>make({page:'override',policy:{...old,memoBranch:p.memoBranch}}),/override/i);const o=make({page:'standalone',enabled:true,policy:old});o.startWindow('owned');const s=feedCommittedSource(o,p);const original=o.referenceTap; // frozen API remains the real source factory
 // Direct factory has separate native/reference inputs, like the original composition.
 const n=attachMemoSource(o,p,s);o.sealWindow();assert.equal(o.lookupNode(n.nodes[0]).status,'Observed');assert.equal(o.retention().referenceRetention.count,1);assert.equal(Object.getOwnPropertyNames(ctx).some(k=>slots.includes(k)),false);assert.equal(original.length,0);o.stop();
});
for(const [name,args] of [['mode',{page:'invalid',mode:'maybe'}],['empty page',{page:'',mode:'on'}],['long page',{page:'x'.repeat(129),mode:'on'}]])test('bootstrap rejects invalid '+name+' before source execution',()=>{assert.equal(typeof builder.committedMemoBootstrap,'function');assert.throws(()=>builder.committedMemoBootstrap({...args,policy:memoSourcePolicy()}));});
