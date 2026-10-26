// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createNativeElementFiberObserver} from '../../experiments/react19-reducer/native-element-fiber-observer.mjs';
import {committedSourcePolicy,feedCommittedSource,attachCommittedNative} from '../helpers/react19-committed-source-fixture.mjs';
import {createNativeStateSourcePathObserver} from '../../experiments/react19-reducer/native-state-source-path-observer.mjs';
import {elementFiberTree} from '../helpers/react19-committed-element-fixture.mjs';
const U='Unknown/Unsupported',load=()=>import('../../experiments/react19-reducer/committed-source-path-observer.mjs');
async function fixture({sourceOptions={},nativeOptions={},sealed=true,enabled=true,weakRef=WeakRef}={}){
 const {createCommittedSourcePathObserver}=await load(),p=committedSourcePolicy(),o=createCommittedSourcePathObserver({page:'joined-page',enabled,policy:p,weakRef});o.startWindow('owned');
 const source=feedCommittedSource(o,p,sourceOptions),native=attachCommittedNative(o,p,source,nativeOptions),capture=sealed?o.sealWindow():null;
 return{o,p,source,native,capture,lookup:(node=native.nodes[0])=>o.lookupNode(node)};
}
function unknown(f){const r=f.lookup();assert.equal(r.status,U);assert.equal(r.links.length,0);return r;}
test('consumer readonly currentCommit follows its core and refuses stopped/off state',()=>{
 const policy=committedSourcePolicy().elementFiber,o=createNativeElementFiberObserver({page:'readonly',policy});assert.equal(o.currentCommit().status,U);o.stop();assert.equal(o.currentCommit().status,U);assert(Object.isFrozen(o.currentCommit()));
});
test('complete original source gate and exact committed elements join by actual references',async()=>{
 const f=await fixture(),a=f.lookup(),b=f.lookup(f.native.nodes[1]);
 assert.equal(f.capture.stateSource.snapshot.status,'Observed');assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');
 assert.equal(a.status,'Observed');assert.equal(b.status,'Observed');assert.equal(a.schema,'stateatom.committed-state-source-reference/1');assert.equal(a.links.length,1);
 assert.equal(a.selectedCommittedSourceAssociation,'Observed');assert.equal(a.sourceOnly,true);assert.equal(a.nativeOrigin,'NotAttested');assert.equal(a.fullPath,false);
 for(const k of ['nativeStateOrigin','tupleIndexOrigin','fieldOwnership','selectedPropertyOrigin','stateToProp'])assert.equal(a[k],U);
 const x=a.links[0],y=b.links[0];assert.equal(x.stateSource.appAssociationId,y.stateSource.appAssociationId);assert.notEqual(x.stateSource.callbackAssociationId,y.stateSource.callbackAssociationId);assert.notEqual(x.nativeElement.fiberId,y.nativeElement.fiberId);
 assert.equal(x.stateSource.nativeReturnedStateSourceAssociation,'Observed');assert.equal(x.stateSource.nativeReturnedStateReference.nativeStateId,x.stateSource.nativeReturnedStateReference.boundTodosId);
 assert(Object.isFrozen(a));assert(Object.isFrozen(a.links));assert(!JSON.stringify(a).includes('PRIVATE-'));assert.doesNotThrow(()=>JSON.stringify(a));
});
for(const [name,options] of [['native state',{nativeState:false}],['App completion',{appComplete:false}],['Main completion',{mainComplete:false}],['App native props',{appNative:false}]])test('missing original '+name+' cannot be replaced by current native element evidence',async()=>{
 const f=await fixture({sourceOptions:options});assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,U);unknown(f);
});
test('unsealed source window does not borrow the committed native result',async()=>{const f=await fixture({sealed:false});unknown(f);f.o.sealWindow();assert.equal(f.lookup().status,'Observed');});
for(const [name,options] of [['element event',{emit:false}],['commit',{commit:false}],['actual element',{cloneElement:true}],['current fiber',{alternate:true}]])test('missing '+name+' leaves complete original source gate unjoined',async()=>{
 const f=await fixture({nativeOptions:options});assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');unknown(f);
});
test('already observed native event may finish its first commit after source seal',async()=>{
 const f=await fixture({nativeOptions:{commit:false}});unknown(f);f.native.publish();assert.equal(f.lookup().status,'Observed');
});
test('partial native events cannot hide behind a selected complete candidate',async()=>{
 const f=await fixture({nativeOptions:{emit:false,commit:false}});f.o.referenceTap('element-fiber',f.native.components[0],f.source.elements[0],f.p.elementFiber.sites[0].id);f.native.publish();unknown(f);
});
test('a later commit cannot revive the old sealed source window even with fresh native events',async()=>{
 const f=await fixture();assert.equal(f.lookup().status,'Observed');
 for(let i=0;i<2;i++)f.o.referenceTap('element-fiber',f.native.components[i],f.source.elements[i],f.p.elementFiber.sites[1].id);f.native.publish();unknown(f);
 assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');
});
test('valid replacement clears source refs; invalid replacement preserves exact prior result',async()=>{
 const f=await fixture(),before=f.lookup(),r=f.o.startWindow('');assert.equal(r,null);assert.deepEqual(f.lookup(),before);
 assert(f.o.startWindow('next'));unknown(f);assert.equal(f.o.referenceRetention().callbacks,0);
});
test('new complete source occurrence cannot borrow older visible commit from reused elements',async()=>{
 const f=await fixture(),oldElements=f.source.elements;f.o.startWindow('next');
 const next=feedCommittedSource(f.o,f.p,{rows:f.source.rows,reuseElements:oldElements});f.o.sealWindow();assert.equal(f.o.lookupStateSource(oldElements[0]).status,'Observed');unknown(f);
 // Sealed windows cannot add a late native mark to pretend it preceded the old commit.
 f.o.referenceTap('element-fiber',f.native.components[0],next.elements[0],f.p.elementFiber.sites[0].id);unknown(f);
});
test('foreign selected node or sibling cannot select a nearby source occurrence',async()=>{
 const f=await fixture();assert.equal(f.lookup({}).status,U);const a=f.lookup(f.native.nodes[1]);assert.equal(a.status,'Observed');assert.notEqual(a.links[0].nativeElement.nodeId,f.lookup().links[0].nativeElement.nodeId);
});
test('lost current callback weak reference refuses the whole join; no ID reconstruction',async()=>{
 const unavailable=new WeakSet();class ControlledRef{constructor(value){this.value=value;}deref(){return unavailable.has(this.value)?undefined:this.value;}}
 const f=await fixture({weakRef:ControlledRef});assert.equal(f.lookup().status,'Observed');unavailable.add(f.source.elements[1]);unknown(f);assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');
});
test('Off and Stop preserve old empty gates and terminal cleanup',async()=>{
 const off=await fixture({enabled:false});unknown(off);assert.equal(off.o.referenceRetention().callbacks,0);
 const f=await fixture();f.o.stop();f.o.stop();unknown(f);assert.equal(f.o.referenceRetention().callbacks,0);assert.equal(f.o.startWindow('restart'),null);assert.equal(f.o.referenceRetention().stopped,true);
});
test('old capture, source snapshots and complete gate DTOs remain exactly delegated',async()=>{
 const f=await fixture(),old=createNativeStateSourcePathObserver({page:'joined-page',enabled:true,policy:f.p});old.startWindow('owned');const prior=feedCommittedSource(old,f.p),capture=old.sealWindow();
 assert.deepEqual(f.capture,capture);assert.deepEqual(f.o.snapshot(),old.snapshot());assert.deepEqual(f.o.retention(),old.retention());assert.deepEqual(f.o.lookupStateSource(f.source.elements[0]),old.lookupStateSource(prior.elements[0]));
});
test('a new complete inspection can qualify a fresh commit in the same native root',async()=>{
 const f=await fixture(),before=f.lookup();f.o.startWindow('next');const source=feedCommittedSource(f.o,f.p),native=attachCommittedNative(f.o,f.p,source,{existingRoot:f.native.root});f.o.sealWindow();const after=f.o.lookupNode(native.nodes[0]);
 assert.equal(after.status,'Observed');assert.notEqual(after.window,before.window);assert.notEqual(after.links[0].nativeElement.commitId,before.links[0].nativeElement.commitId);assert.notEqual(after.links[0].nativeElement.fiberId,before.links[0].nativeElement.fiberId);
});
test('native events before source return cannot acquire later source occurrence',async()=>{
 const {createCommittedSourcePathObserver}=await load(),p=committedSourcePolicy(),o=createCommittedSourcePathObserver({page:'ordering',policy:p});o.startWindow('owned');const t=elementFiberTree();
 for(const x of [t.rootFiber,t.componentFiber,t.host,t.otherHost])o.referenceTap('fiber',x);o.referenceTap('root',t.root);
 const source=feedCommittedSource(o,p,{beforeReturned(element){t.componentFiber.pendingProps=element.props;t.componentFiber.memoizedProps=element.props;o.referenceTap('element-fiber',t.componentFiber,element,p.elementFiber.sites[0].id);}});
 o.referenceTap('root-current',t.root,t.rootFiber);o.sealWindow();assert.equal(o.lookupStateSource(source.elements[1]).status,'Observed');assert.equal(o.lookupNode(t.node).status,U);
});
test('unavailable prior commit scope is never treated as an initial commit',async()=>{
 const f=await fixture();f.o.startWindow('next');feedCommittedSource(f.o,f.p,{rows:f.source.rows,reuseElements:f.source.elements});f.native.root.current={};
 f.o.referenceTap('element-fiber',f.native.components[0],f.source.elements[0],f.p.elementFiber.sites[0].id);f.native.root.current=f.native.rootFiber;f.o.referenceTap('root-current',{},{});f.o.sealWindow();unknown(f);assert.equal(f.o.referenceRetention().invalid,true);
});
test('two selected complete source/native ancestors refuse instead of choosing one',async()=>{
 const f=await fixture({nativeOptions:{commit:false}});f.native.components[0].sibling=null;f.native.components[0].child=f.native.components[1];f.native.publish();assert.equal(f.o.lookupNode(f.native.nodes[1]).status,U);
});
test('source callback reference capacity stays bounded with original gate refusal',async()=>{
 const {createCommittedSourcePathObserver}=await load(),p=committedSourcePolicy(),o=createCommittedSourcePathObserver({page:'capacity',policy:p});o.startWindow('owned');feedCommittedSource(o,p,{rows:Array.from({length:513},(_,id)=>({id}))});o.sealWindow();
 assert(o.referenceRetention().callbacks<=512);assert.equal(o.lookupNode({}).status,U);assert.equal(o.referenceRetention().invalid,true);
});
