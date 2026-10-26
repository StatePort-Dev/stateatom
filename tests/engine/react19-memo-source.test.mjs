// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {createCommittedSourcePathObserver} from '../../experiments/react19-reducer/committed-source-path-observer.mjs';
import {memoSourcePolicy,feedCommittedSource,attachMemoSource} from '../helpers/react19-memo-source-fixture.mjs';
const U='Unknown/Unsupported';
function fixture({sourceOptions={},nativeOptions={},sealed=true,policyChange=null,enabled=true,weakRef=WeakRef}={}){
 const p=memoSourcePolicy();if(policyChange)policyChange(p);const o=createCommittedSourcePathObserver({page:'memo-source',enabled,policy:p,weakRef});o.startWindow('owned');
 const source=feedCommittedSource(o,p,sourceOptions),native=attachMemoSource(o,p,source,nativeOptions),capture=sealed?o.sealWindow():null;
 return{o,p,source,native,capture,lookup:(node=native.nodes[0])=>o.lookupNode(node)};
}
const unknown=f=>{const r=f.lookup();assert.equal(r.status,U);assert.equal(r.links.length,0);return r;};
for(const kind of ['memo-function-update-return','memo-bailout-return'])test('complete original gate + same-ref '+kind+' yields conditional memo link',()=>{
 const f=fixture({nativeOptions:{kinds:[kind,kind]}}),r=f.lookup();assert.equal(f.capture.stateSource.snapshot.status,'Observed');assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');assert.equal(r.status,'Observed');assert.equal(r.links.length,1);assert.equal(r.links[0].nativeMemo.kind,kind);assert.equal(r.links[0].nativeMemo.propsReference,'Same');assert.equal(r.sourceOnly,true);assert.equal(r.nativeOrigin,'NotAttested');assert.equal(r.selectedPropertyOrigin,U);assert.equal(r.fieldOwnership,U);assert.equal(r.stateToProp,U);assert.equal(r.fullPath,false);assert(!JSON.stringify(r).includes('PRIVATE-'));
});
for(const kind of ['memo-function-update-return','memo-bailout-return'])test('complete source + different retained props produces Unknown boundary for '+kind,()=>{
 const f=fixture({nativeOptions:{kinds:[kind,kind],usedProps:[{},{}]}}),r=unknown(f);assert.equal(r.reason,'Incoming memo element props were not retained');assert.equal(r.selectedCommittedSourceAssociation,U);assert.equal(r.memoBoundary.nativeMemo.kind,kind);assert.equal(r.memoBoundary.nativeMemo.propsReference,'Different');assert.equal(r.memoBoundary.stateSource.nativeReturnedStateSourceAssociation,'Observed');assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');assert(Object.isFrozen(r.memoBoundary));assert(!JSON.stringify(r).includes('PRIVATE-'));
});
test('mixed rows permit selected actual-props match and expose unselected row boundary only when selected',()=>{
 const f=fixture({nativeOptions:{kinds:['memo-function-update-return','memo-bailout-return'],usedProps:[null,{}]}}),a=f.lookup(),b=f.lookup(f.native.nodes[1]);assert.equal(a.status,'Observed');assert.equal(a.memoBoundary,undefined);assert.equal(a.links[0].nativeMemo.kind,'memo-function-update-return');assert.equal(b.status,U);assert.equal(b.links.length,0);assert.equal(b.memoBoundary.nativeMemo.kind,'memo-bailout-return');
});
for(const [name,options] of [['native state',{nativeState:false}],['App completion',{appComplete:false}],['Main completion',{mainComplete:false}],['App native props',{appNative:false}]])test('missing original '+name+' cannot become memo positive or complete boundary',()=>{
 const f=fixture({sourceOptions:options,nativeOptions:{usedProps:[{},{}]}});assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,U);const r=unknown(f);assert.equal(r.memoBoundary,undefined);
});
test('unsealed memo source stays Unknown until old gate seals',()=>{const f=fixture({sealed:false});unknown(f);f.o.sealWindow();assert.equal(f.lookup().status,'Observed');});
test('missing optional memo policy keeps unsupported memo explicit',()=>{const f=fixture({policyChange:p=>delete p.memoBranch});const r=unknown(f);assert.equal(r.memoBoundary,undefined);assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');});
test('memo-policy accessor refuses without invocation or fallback',()=>{
 let calls=0;const f=fixture({policyChange:p=>Object.defineProperty(p,'memoBranch',{get(){calls++;throw Error('policy');},enumerable:true})});unknown(f);assert.equal(calls,0);assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');
});
test('malformed provided memo profile cannot silently use ordinary fallback',()=>{const f=fixture({policyChange:p=>{p.memoBranch.version='19.2.6';}});unknown(f);assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');});
test('missing unselected memo outcome cannot hide behind a positive',()=>{const f=fixture({nativeOptions:{emitOutcomes:[true,false]}}),r=unknown(f);assert.equal(r.memoBoundary,undefined);});
test('missing unselected memo outcome cannot hide behind a known selected boundary',()=>{const f=fixture({nativeOptions:{emitOutcomes:[true,false],usedProps:[{},{}]}}),r=unknown(f);assert.equal(r.memoBoundary,undefined);});
test('partial source native-element marks refuse before any memo boundary',()=>{const f=fixture({nativeOptions:{emitElements:[true,false],usedProps:[{},{}]}}),r=unknown(f);assert.equal(r.memoBoundary,undefined);});
test('unavailable later callback source ref cannot hide behind a known selected boundary',()=>{
 const missing=new WeakSet();class ControlledRef{constructor(value){this.value=value;}deref(){return missing.has(this.value)?undefined:this.value;}}
 const f=fixture({weakRef:ControlledRef,nativeOptions:{usedProps:[{},{}]}});missing.add(f.source.elements[1]);const r=unknown(f);assert.equal(r.memoBoundary,undefined);assert.equal(f.o.lookupStateSource(f.source.elements[0]).status,'Observed');
});
test('later commit expires sealed memo source even if native events refresh',()=>{
 const f=fixture();assert.equal(f.lookup().status,'Observed');for(let i=0;i<2;i++){const fiber=f.native.components[i],e=f.source.elements[i];f.o.referenceTap('element-fiber',fiber,e,f.p.elementFiber.sites[1].id);f.o.referenceTap('memo-function-update-return',fiber,f.native.innerComponents[i],e.props,f.native.stream.sites[0].id);}f.native.publish();unknown(f);
});
test('fresh source inspection can qualify another memo commit in the same root',()=>{
 const f=fixture(),before=f.lookup();f.o.startWindow('next');const source=feedCommittedSource(f.o,f.p),native=attachMemoSource(f.o,f.p,source,{existingRoot:f.native.root});f.o.sealWindow();const r=f.o.lookupNode(native.nodes[0]);assert.equal(r.status,'Observed');assert.notEqual(r.links[0].nativeMemo.commitId,before.links[0].nativeMemo.commitId);assert.notEqual(r.window,before.window);
});
test('multiple selected memo source ancestors refuse unique join',()=>{
 const f=fixture({nativeOptions:{commit:false}});f.native.components[0].sibling=null;f.native.components[0].child=f.native.components[1];f.native.publish();const r=f.lookup(f.native.nodes[1]);assert.equal(r.status,U);assert.equal(r.links.length,0);assert.equal(r.memoBoundary,undefined);
});
test('selected nonconsumption ancestor plus selected positive is ambiguous',()=>{
 const f=fixture({nativeOptions:{commit:false,usedProps:[{},null]}});f.native.components[0].sibling=null;f.native.components[0].child=f.native.components[1];f.native.publish();const r=f.lookup(f.native.nodes[1]);assert.equal(r.status,U);assert.equal(r.links.length,0);assert.equal(r.memoBoundary,undefined);
});
test('foreign node never inherits another selected memo boundary',()=>{const f=fixture({nativeOptions:{usedProps:[{},{}]}}),r=f.lookup({});assert.equal(r.status,U);assert.equal(r.memoBoundary,undefined);});
test('invalid window replacement preserves memo result, valid clears source refs',()=>{const f=fixture(),before=f.lookup();assert.equal(f.o.startWindow(''),null);assert.deepEqual(f.lookup(),before);f.o.startWindow('next');unknown(f);assert.equal(f.o.referenceRetention().callbacks,0);});
test('Off/Stop remain empty and terminal with opt-in memo policy',()=>{const off=fixture({enabled:false});unknown(off);assert.equal(off.o.referenceRetention().callbacks,0);const f=fixture();f.o.stop();f.o.stop();unknown(f);assert.equal(f.o.referenceRetention().callbacks,0);assert.equal(f.o.startWindow('again'),null);});
