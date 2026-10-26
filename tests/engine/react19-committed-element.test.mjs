// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createReact19Acquisition} from '../../src/engine/react19-acquisition.mjs';
import {elementFiberPolicy,elementFiberTree} from '../helpers/react19-committed-element-fixture.mjs';
const load=()=>import('../../experiments/react19-reducer/native-element-fiber-observer.mjs'),U='Unknown/Unsupported';
async function fixture({prepared=true,policy=elementFiberPolicy(),enabled=true,weakRef=WeakRef}={}){
 const {createNativeElementFiberObserver}=await load(),f=elementFiberTree(),api=createNativeElementFiberObserver({page:'element-page',enabled,policy,weakRef});
 const register=fiber=>api.tap('fiber',fiber),emit=(element=f.element,fiber=f.componentFiber,site=policy?.sites?.[0]?.id)=>api.tap('element-fiber',fiber,element,site),commit=()=>api.tap('root-current',f.root,f.rootFiber);
 for(const x of [f.rootFiber,f.componentFiber,f.host,f.otherHost])register(x);api.tap('root',f.root);
 if(prepared){emit();commit();}
 return{...f,api,policy,register,emit,commit,match:(element=f.element,node=f.node)=>api.match(node,element)};
}
function unknown(f){const r=f.match();assert.equal(r.status,U);assert.equal(r.match,null);return r;}
test('core currentCommit is authoritative JSON-only identity and optional expected fiber is a conjunction',()=>{
 const api=createReact19Acquisition({page:'primitive'}),f=elementFiberTree();assert.equal(api.currentCommit().status,U);
 for(const x of [f.rootFiber,f.componentFiber,f.host,f.otherHost])api.tap('fiber',x);api.tap('root',f.root);api.tap('root-current',f.root,f.rootFiber);
 const c=api.currentCommit(),a=api.matchCommittedProps(f.node,f.props,f.component,f.componentFiber);assert.equal(c.status,'Observed');assert.equal(a.status,'Observed');assert.equal(a.match.commitId,c.commitId);assert.equal(a.match.rootId,c.rootId);
 assert.equal(api.matchCommittedProps(f.node,f.props,f.component,{}).status,U);
 assert.equal(api.matchCommittedProps(f.node,f.props,f.component,null).status,U);
 assert.equal(api.matchCommittedProps(f.node,f.props,f.component).status,'Observed');
 f.root.current={};assert.equal(api.currentCommit().status,U);api.stop();assert.equal(api.currentCommit().status,U);
});
test('complete owned native event/current commit yields conditional exact reference association only',async()=>{
 const f=await fixture(),r=f.match();assert.equal(r.status,'Observed');assert.equal(r.schema,'stateatom.native-element-committed-reference/1');
 assert.equal(r.nativeElementReferenceAssociation,'Observed');assert.equal(r.nativeOrigin,'NotAttested');assert.equal(r.sourceOnly,true);assert.equal(r.fullPath,false);
 for(const k of ['sourceElementOrigin','selectedPropertyOrigin','fieldOwnership','stateToProp'])assert.equal(r[k],U);
 for(const k of ['nodeId','rootId','commitId','fiberId','propsId','componentId','nativeElementId','eventId','siteId'])assert.equal(typeof r.match[k],'string');
 assert.doesNotThrow(()=>JSON.stringify(r));assert(Object.isFrozen(r));assert(Object.isFrozen(r.match));
});
test('no commit or no native element event cannot borrow an equal props result',async()=>{
 const a=await fixture({prepared:false});a.emit();unknown(a);
 const b=await fixture({prepared:false});b.commit();unknown(b);
 const c=await fixture();assert.equal(c.match({}).status,U);assert.equal(c.match(c.element,{}).status,U);
});
test('sibling DOM hosts share only their actual ancestor, not row/property provenance',async()=>{
 const f=await fixture(),a=f.match(),b=f.match(f.element,f.otherNode);assert.equal(b.status,'Observed');assert.notEqual(a.match.nodeId,b.match.nodeId);assert.equal(a.match.fiberId,b.match.fiberId);assert.equal(b.selectedPropertyOrigin,U);
});
test('a later commit without a fresh event expires even identical fiber/props references',async()=>{
 const f=await fixture(),before=f.match();f.commit();unknown(f);
 f.emit();f.commit();const after=f.match();assert.equal(after.status,'Observed');assert.notEqual(before.match.commitId,after.match.commitId);assert.notEqual(before.match.eventId,after.match.eventId);
});
test('newer element on reused fiber cannot resurrect an older element with the same props',async()=>{
 const f=await fixture(),other={};f.emit(other);f.commit();unknown(f);assert.equal(f.match(other).status,'Observed');
 f.emit();f.commit();assert.equal(f.match().status,'Observed');assert.equal(f.match(other).status,U);
});
test('uncommitted alternate cannot stand in for the selected current fiber',async()=>{
 const f=await fixture({prepared:false}),alternate=f.fiber({type:f.component,pendingProps:f.props,memoizedProps:f.props});
 f.register(alternate);f.componentFiber.alternate=alternate;alternate.alternate=f.componentFiber;f.emit(f.element,alternate);f.commit();unknown(f);
});
test('equal props in another selected sibling component cannot borrow an unrelated fiber event',async()=>{
 const f=await fixture(),otherNode={},otherHost=f.fiber({tag:5,stateNode:otherNode}),otherFiber=f.fiber({type:f.component,pendingProps:f.props,memoizedProps:f.props,child:otherHost});
 f.register(otherHost);f.register(otherFiber);f.componentFiber.sibling=otherFiber;assert.equal(f.match(f.element,otherNode).status,U);
});
test('one element on two matching ancestor fibers remains ambiguous',async()=>{
 const f=await fixture({prepared:false}),outer=f.fiber({type:f.component,pendingProps:f.props,memoizedProps:f.props,child:f.componentFiber});
 f.register(outer);f.rootFiber.child=outer;f.emit();f.emit(f.element,outer);f.commit();unknown(f);
});
test('an ambiguous candidate cannot be hidden by another individually matching props record',async()=>{
 const f=await fixture({prepared:false}),otherProps={},inner=f.fiber({type:f.component,pendingProps:otherProps,memoizedProps:otherProps,child:f.componentFiber}),outer=f.fiber({type:f.component,pendingProps:otherProps,memoizedProps:otherProps,child:inner});
 f.register(inner);f.register(outer);f.rootFiber.child=outer;f.emit(f.element,outer);f.emit();f.commit();unknown(f);
});
for(const [name,change] of [
 ['props',f=>{f.componentFiber.memoizedProps={};}],['type',f=>{f.componentFiber.type=()=>{};}],
 ['root',f=>{f.root.current={};}],['unmount',f=>{f.rootFiber.child=null;}],['cycle',f=>{f.otherHost.sibling=f.host;}],
 ['duplicate host',f=>{f.otherHost.stateNode=f.node;}],
])test('changed '+name+' refuses an older complete record',async()=>{const f=await fixture();change(f);unknown(f);});
test('unregistered native fiber event refuses rather than becoming eligible after later registration',async()=>{
 const f=await fixture({prepared:false}),foreign=f.fiber({type:f.component,pendingProps:f.props,memoizedProps:f.props,child:f.host});
 f.emit(f.element,foreign);f.register(foreign);f.rootFiber.child=foreign;f.commit();unknown(f);
});
for(const key of ['tag','pendingProps','type'])test('native event accessor '+key+' never executes or yields partial evidence',async()=>{
 const f=await fixture({prepared:false});let reads=0;Object.defineProperty(f.componentFiber,key,{get(){reads++;throw Error('metadata');}});f.emit();f.commit();unknown(f);assert.equal(reads,0);
});
test('opaque element/props/component references are never inspected or invoked',async()=>{
 const f=await fixture({prepared:false});let calls=0;const trap=()=>{calls++;throw Error('opaque application reference');};
 const element=new Proxy({},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap}),props=new Proxy({},{get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap}),component=new Proxy(function Item(){},{apply:trap,get:trap,getOwnPropertyDescriptor:trap,ownKeys:trap});
 f.componentFiber.type=component;f.componentFiber.memoizedProps=props;f.componentFiber.pendingProps=props;f.emit(element);f.commit();assert.equal(f.match(element).status,'Observed');assert.doesNotThrow(()=>JSON.stringify(f.match(element)));assert.equal(calls,0);
});
test('unavailable weak references refuse without replacing them with IDs',async()=>{
 class MissingRef{constructor(){}deref(){return undefined;}}
 const f=await fixture({weakRef:MissingRef});unknown(f);const g=await fixture({weakRef:null});unknown(g);
});
test('partial current-interval weak loss cannot hide another unverified element record',async()=>{
 const missing=new WeakSet();class SelectiveRef{constructor(value){this.value=value;}deref(){return missing.has(this.value)?undefined:this.value;}}
 const f=await fixture({prepared:false,weakRef:SelectiveRef}),otherProps={},other=f.fiber({type:f.component,pendingProps:otherProps,memoizedProps:otherProps});
 f.register(other);f.emit();f.emit(f.element,other);f.commit();missing.add(otherProps);unknown(f);
});
test('known expired records are ignored before dereferencing their unavailable metadata',async()=>{
 const missing=new WeakSet();class SelectiveRef{constructor(value){this.value=value;}deref(){if(missing.has(this.value))throw Error('expired controlled reference');return this.value;}}
 const f=await fixture({weakRef:SelectiveRef}),oldProps=f.props,nextProps={};
 f.componentFiber.pendingProps=nextProps;f.componentFiber.memoizedProps=nextProps;f.emit();f.commit();missing.add(oldProps);
 assert.equal(f.match().status,'Observed');
});
test('stop is terminal and clears reference records; off never delegates native metadata',async()=>{
 const f=await fixture();f.api.stop();f.api.stop();unknown(f);assert.equal(f.api.retention().bindings,0);assert.equal(f.api.retention().stopped,true);f.emit();unknown(f);
 let reads=0;const off=await fixture({prepared:false,enabled:false}),opaque=new Proxy({},{getOwnPropertyDescriptor(){reads++;throw Error('off');}});off.api.tap('element-fiber',opaque,opaque,'x');unknown(off);assert.equal(reads,0);assert.equal(off.api.retention().events,0);
});
test('multiple roots refuse instead of selecting the newest native stream',async()=>{
 const f=await fixture(),other=f.fiber({tag:3,child:f.componentFiber}),root={current:other};f.register(other);f.api.tap('root',root);f.api.tap('root-current',root,other);unknown(f);
});
test('element-event capacity refuses whole evidence, not a truncated positive',async()=>{
 const f=await fixture({prepared:false});for(let i=0;i<4097;i++)f.emit();f.commit();unknown(f);assert.equal(f.api.retention().capped,true);assert.equal(f.api.retention().events,4096);
});
for(const [name,change] of [
 ['schema',p=>{p.schema='other';}],['version',p=>{p.version='19.2.6';}],['digest',p=>{p.sourceDigest='0'.repeat(64);}],
 ['unadmitted',p=>{p.nativeVersionAdmitted=false;}],['duplicate role',p=>{p.sites[1].role='create';}],
 ['duplicate ID',p=>{p.sites[1].id=p.sites[0].id;}],['coordinate',p=>{p.sites[0].line=0;}],
 ['unknown field',p=>{p.extra=true;}],['site digest',p=>{p.sites[0].sourceDigest='0'.repeat(64);}],
])test('closed policy refuses '+name,async()=>{const policy=elementFiberPolicy();change(policy);const f=await fixture({policy});unknown(f);});
test('policy accessors refuse without invocation, admitted metadata is copied',async()=>{
 let reads=0;const p=elementFiberPolicy();Object.defineProperty(p,'sites',{get(){reads++;throw Error('policy');}});const f=await fixture({prepared:false,policy:p});f.commit();unknown(f);assert.equal(reads,0);
 const g=await fixture({prepared:false}),site=g.policy.sites[0].id;g.policy.sites[0].id='0'.repeat(64);g.api.tap('element-fiber',g.componentFiber,g.element,site);g.commit();assert.equal(g.match().status,'Observed');
});
