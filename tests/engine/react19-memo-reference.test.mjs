// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createReact19Acquisition} from '../../src/engine/react19-acquisition.mjs';
import {createNativeElementFiberObserver} from '../../experiments/react19-reducer/native-element-fiber-observer.mjs';
import {elementFiberPolicy,memoReferencePolicy,memoReferenceTree} from '../helpers/react19-memo-reference-fixture.mjs';
const U='Unknown/Unsupported';
function fixture({memoPolicy=memoReferencePolicy(),memoEnabled=true,prepared=true,kind='memo-function-update-return',usedProps=null,weakRef=WeakRef,enabled=true}={}){
 const f=memoReferenceTree(),policy=elementFiberPolicy(),api=createNativeElementFiberObserver({page:'memo-page',enabled,policy,memoPolicy:memoEnabled?memoPolicy:undefined,weakRef});
 const register=fiber=>api.tap('fiber',fiber);for(const x of [f.rootFiber,f.componentFiber,f.host,f.otherHost])register(x);api.tap('root',f.root);
 const emit=(element=f.element,fiber=f.componentFiber)=>api.tap('element-fiber',fiber,element,policy.sites[0].id);
 const outcome=(eventKind=kind,props=usedProps||f.props,fiber=f.componentFiber,component=f.component)=>{fiber.tag=15;fiber.type=component;fiber.memoizedProps=props;fiber.pendingProps=props;return api.tap(eventKind,fiber,component,props,memoPolicy?.sites?.find(s=>s.eventKind===eventKind)?.id);};
 const commit=()=>api.tap('root-current',f.root,f.rootFiber);
 if(prepared){emit();outcome();commit();}
 return{...f,api,policy,memoPolicy,register,emit,outcome,commit,match:(element=f.element,node=f.node)=>api.match(node,element)};
}
function unknown(f){const r=f.match();assert.equal(r.status,U);assert.equal(r.match,null);return r;}
test('core strict memo matcher uses opaque wrapper/inner function/props/current pointer, while old matcher stays tag0',()=>{
 const f=memoReferenceTree(),api=createReact19Acquisition({page:'memo-core'});f.componentFiber.tag=15;f.componentFiber.type=f.component;
 for(const x of [f.rootFiber,f.componentFiber,f.host,f.otherHost])api.tap('fiber',x);api.tap('root',f.root);api.tap('root-current',f.root,f.rootFiber);
 const r=api.matchCommittedMemo(f.node,f.props,f.wrapper,f.component,f.componentFiber);assert.equal(r.status,'Observed');assert.equal(typeof r.match.memoElementTypeId,'string');assert.equal(r.selectedPropertyOrigin,U);
 assert.equal(api.matchCommittedProps(f.node,f.props,f.component).status,U);
 for(const [props,wrapper,component,fiber] of [[{},f.wrapper,f.component,f.componentFiber],[f.props,{},f.component,f.componentFiber],[f.props,f.wrapper,()=>{},f.componentFiber],[f.props,f.wrapper,f.component,{}]])assert.equal(api.matchCommittedMemo(f.node,props,wrapper,component,fiber).status,U);
});
for(const kind of ['memo-function-update-return','memo-bailout-return'])test(kind+' with identical actual props gives conditional memo reference only',()=>{
 const f=fixture({kind}),r=f.match();assert.equal(r.status,'Observed');assert.equal(r.nativeOrigin,'NotAttested');assert.equal(r.sourceOnly,true);assert.equal(r.fullPath,false);assert.equal(r.selectedPropertyOrigin,U);assert.equal(r.stateToProp,U);assert.equal(r.fieldOwnership,U);
 assert.equal(r.memoOutcome.kind,kind);assert.equal(typeof r.memoOutcome.eventId,'string');assert.equal(typeof r.memoOutcome.siteId,'string');assert.equal(r.memoOutcome.propsReference,'Same');assert.equal(typeof r.match.memoElementTypeId,'string');assert.doesNotThrow(()=>JSON.stringify(r));
});
for(const kind of ['memo-function-update-return','memo-bailout-return'])test(kind+' using retained different props never substitutes equal incoming props',()=>{
 const usedProps={},f=fixture({kind,usedProps}),r=unknown(f);assert.equal(r.reason,'Incoming memo element props were not retained');assert.equal(r.memoOutcome.kind,kind);assert.equal(r.memoOutcome.propsReference,'Different');
});
test('unselected memo with substituted props cannot claim selected nonconsumption',()=>{
 const f=fixture({usedProps:{}});const r=f.match(f.element,{});assert.equal(r.status,U);assert.notEqual(r.reason,'Incoming memo element props were not retained');
});
test('absent optional policy retains old unsupported memo behavior',()=>{const f=fixture({memoEnabled:false});unknown(f);});
test('element event without actual memo outcome is Unknown, never invented bailout',()=>{const f=fixture({prepared:false});f.emit();f.componentFiber.tag=15;f.componentFiber.type=f.component;f.commit();unknown(f);});
test('old outcome before the element event cannot prove the later incoming element',()=>{const f=fixture({prepared:false});f.outcome();f.emit();f.commit();unknown(f);});
test('later commit without a new element and outcome expires the old memo evidence',()=>{const f=fixture();assert.equal(f.match().status,'Observed');f.commit();unknown(f);});
test('new element cannot borrow earlier same-interval outcome even with identical props',()=>{const f=fixture({prepared:false}),next={};f.emit();f.outcome();f.emit(next);f.commit();assert.equal(f.match(next).status,U);unknown(f);});
test('new complete memo cycle after earlier commit can qualify, old element stays expired',()=>{
 const f=fixture(),before=f.match(),next={};f.emit(next);f.outcome();f.commit();unknown(f);const after=f.match(next);assert.equal(after.status,'Observed');assert.notEqual(after.match.commitId,before.match.commitId);assert.notEqual(after.memoOutcome.eventId,before.memoOutcome.eventId);
});
for(const [name,change] of [
 ['current props',f=>{f.componentFiber.memoizedProps={};}],['current inner function',f=>{f.componentFiber.type=()=>{};}],
 ['current wrapper',f=>{f.componentFiber.elementType={};}],['tag',f=>{f.componentFiber.tag=14;}],
 ['root',f=>{f.root.current={};}],['unmount',f=>{f.rootFiber.child=null;}],
])test('changed '+name+' cannot reuse memo association',()=>{const f=fixture();change(f);unknown(f);});
test('uncommitted alternate with equal props/wrapper cannot replace exact current memo pointer',()=>{
 const f=fixture({prepared:false}),other={tag:14,type:f.wrapper,elementType:f.wrapper,pendingProps:f.props,memoizedProps:f.props};f.register(other);f.emit(f.element,other);f.outcome('memo-function-update-return',f.props,other);f.commit();unknown(f);
});
test('two matching memo ancestors refuse uniqueness',()=>{
 const f=fixture({prepared:false}),outer={tag:14,type:f.wrapper,elementType:f.wrapper,pendingProps:f.props,memoizedProps:f.props,child:f.componentFiber};f.register(outer);f.rootFiber.child=outer;
 f.emit();f.outcome();f.emit(f.element,outer);f.outcome('memo-function-update-return',f.props,outer);f.commit();unknown(f);
});
test('memo wrapper type/compare and element/props/function references remain opaque',()=>{
 const f=fixture({prepared:false});let calls=0;const trap=()=>{calls++;throw Error('opaque app ref');};
 const wrapper=new Proxy({},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap}),element=new Proxy({},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap}),props=new Proxy({},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap}),component=new Proxy(function Item(){},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap,apply:trap});
 f.componentFiber.elementType=wrapper;f.componentFiber.type=wrapper;f.componentFiber.pendingProps=props;f.emit(element);f.outcome('memo-function-update-return',props,f.componentFiber,component);f.commit();assert.equal(f.match(element).status,'Observed');assert.doesNotThrow(()=>JSON.stringify(f.match(element)));assert.equal(calls,0);
});
for(const key of ['memoizedProps','type','elementType'])test('current memo '+key+' accessor cannot hide a competing ancestor',()=>{
 const f=fixture(),outer={tag:15,type:f.component,elementType:f.wrapper,memoizedProps:f.props,child:f.componentFiber};f.register(outer);f.rootFiber.child=outer;let calls=0;Object.defineProperty(outer,key,{get(){calls++;throw Error('metadata');}});unknown(f);assert.equal(calls,0);
});
test('missing weak memo outcome references refuse whole evidence',()=>{
 const missing=new WeakSet();class ControlledRef{constructor(value){this.value=value;}deref(){return missing.has(this.value)?undefined:this.value;}}
 const f=fixture({weakRef:ControlledRef});assert.equal(f.match().status,'Observed');missing.add(f.component);unknown(f);
});
test('kind/site mismatch and unregistered memo outcome cannot become eligible later',()=>{
 const f=fixture({prepared:false});f.emit();f.componentFiber.tag=15;f.componentFiber.type=f.component;f.api.tap('memo-bailout-return',f.componentFiber,f.component,f.props,f.memoPolicy.sites[0].id);f.commit();unknown(f);
 const g=fixture({prepared:false}),other={tag:15};g.api.tap('memo-function-update-return',other,g.component,g.props,g.memoPolicy.sites[0].id);g.register(other);g.emit();g.outcome();g.commit();unknown(g);
});
test('memo events share bounded opt-in reference capacity; Stop clears all weak outcomes',()=>{
 const f=fixture({prepared:false});f.emit();for(let i=0;i<4097;i++)f.outcome();f.commit();unknown(f);assert.equal(f.api.retention().events,4096);assert.equal(f.api.retention().capped,true);
 const g=fixture();g.api.stop();unknown(g);assert.equal(g.api.retention().bindings,0);assert.equal(g.api.retention().memoOutcomes,0);
});
for(const [name,change] of [
 ['schema',p=>{p.schema='other';}],['version',p=>{p.version='19.2.6';}],['unadmitted',p=>{p.nativeVersionAdmitted=false;}],
 ['duplicate role',p=>{p.sites[1].role=p.sites[0].role;}],['duplicate ID',p=>{p.sites[1].id=p.sites[0].id;}],
 ['element site collision',p=>{p.sites[0].id='1'.repeat(64);}],['wrong event',p=>{p.sites[1].eventKind='memo-function-update-return';}],
 ['coordinate',p=>{p.sites[1].line=0;}],['unknown field',p=>{p.extra=true;}],
])test('optional closed memo policy refuses '+name,()=>{const p=memoReferencePolicy();change(p);unknown(fixture({memoPolicy:p}));});
test('optional policy getter is not invoked; Off performs no memo reflection',()=>{
 let calls=0;const p=memoReferencePolicy();Object.defineProperty(p,'sites',{get(){calls++;throw Error('policy');}});const bad=fixture({memoPolicy:p,prepared:false});bad.emit();bad.commit();unknown(bad);assert.equal(calls,0);
 const f=fixture({prepared:false,enabled:false}),opaque=new Proxy({},{getOwnPropertyDescriptor(){calls++;throw Error('off');}});f.api.tap('memo-function-update-return',opaque,opaque,opaque,'x');unknown(f);assert.equal(calls,0);assert.equal(f.api.retention().events,0);
});
test('ordinary tag0 path stays available under valid opt-in memo policy without a memo event',()=>{
 const f=fixture({prepared:false});f.componentFiber.tag=0;f.componentFiber.type=f.component;f.emit();f.commit();const r=f.match();assert.equal(r.status,'Observed');assert.equal(r.memoOutcome,undefined);assert.equal(f.api.retention().memoEnabled,true);
});
test('different props are not classified as known nonconsumption without exact current selected proof',()=>{
 const f=fixture({usedProps:{}});f.componentFiber.memoizedProps={};const r=unknown(f);assert.notEqual(r.reason,'Incoming memo element props were not retained');assert.equal(r.memoOutcome,undefined);
});
test('unavailable competing current memo outcome cannot hide behind a valid candidate',()=>{
 const missing=new WeakSet();class ControlledRef{constructor(value){this.value=value;}deref(){return missing.has(this.value)?undefined:this.value;}}
 const f=fixture({prepared:false,weakRef:ControlledRef}),otherProps={},other={tag:14,type:f.wrapper,elementType:f.wrapper,pendingProps:otherProps,memoizedProps:otherProps};f.register(other);
 f.emit();f.outcome();f.emit(f.element,other);f.outcome('memo-function-update-return',otherProps,other);f.commit();missing.add(otherProps);unknown(f);
});
