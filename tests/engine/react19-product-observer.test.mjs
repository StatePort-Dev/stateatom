// SPDX-License-Identifier: Apache-2.0
// Synthetic native metadata through the product observer; not native React proof.
import test from 'node:test';import assert from 'node:assert/strict';
import {createObserver} from '../../src/engine/observer.mjs';
const contract={status:'Observed',adapter:'react19-state-ancestors/1',versions:{react:'19.2.5','react-dom':'19.2.5'}};
function fixture({enabled=true,admit=contract,weakRef=WeakRef}={}){
 class R extends Response{};
 const w={crypto,fetch,Response:R,WeakRef:weakRef,location:{href:'http://127.0.0.1:4173/'}};
 const api=createObserver(w,{react19StateAncestors:enabled}),tap=(...args)=>api.react19NativeTap(...args);
 if(enabled)api.enableReact19Probe(admit);
 const state={},queue={dispatch(){}},hook={queue,memoizedState:state,next:null},node={},other={},host={tag:5,stateNode:node},fiber={tag:0,memoizedState:hook,child:host},finished={tag:3,child:fiber},root={current:finished};
 function populate(){for(const f of[finished,fiber,host])tap('fiber',f);tap('root',root);tap('state-result',[state,queue.dispatch],hook,fiber);tap('root-current',root,finished);}
 if(enabled)populate();return{w,api,tap,node,other,root,finished,hook,populate};
}
test('unmarked actual node has independent ancestor evidence without source or committed producer promotion',()=>{
 const f=fixture(),r=f.api.snapshot(null,'text',f.node);assert.equal(f.api.nativeStateAcquisition,true);
 assert.equal(Object.getOwnPropertyDescriptor(f.api,'nativeStateAcquisition').value,true);
 assert.equal(r.status,'Unknown/Unsupported');assert.equal(r.target,null);assert.equal(r.commit.status,'Unknown/Unsupported');
 assert.equal(r.nativeStateAncestors.status,'Observed');assert.equal(r.nativeStateAncestors.ancestors.length,1);
 assert.equal(r.nativeStateAncestors.selectedPropertyOrigin,'Unknown/Unsupported');assert.equal(r.nativeStateAncestors.fullPath,false);
 assert.equal(f.api.snapshot('borrowed-marker','disabled',f.other).nativeStateAncestors.status,'Unknown/Unsupported');f.api.stop();
});
test('React19 observer mode is private to its own enabled observer and cannot silently reuse another mode',()=>{
 const f=fixture({enabled:false});assert.equal(f.api.nativeStateAcquisition,false);
 assert.equal(f.api.snapshot(null,'text',f.node).nativeStateAncestors,undefined);
 assert.throws(()=>createObserver(f.w,{react19StateAncestors:true}),/mode mismatch/);f.api.stop();
});
test('missing, wrong adapter or wrong native version contracts never collect positive ancestors',()=>{
 for(const admit of[null,{...contract,status:'Unknown/Unsupported'},{...contract,adapter:'react18-final-host-props/1'},{...contract,versions:{react:'19.2.5','react-dom':'19.2.6'}}]){
  const f=fixture({admit});assert.equal(f.api.snapshot(null,'text',f.node).nativeStateAncestors.status,'Unknown/Unsupported');f.api.stop();
 }
});
for(const end of['invalidate','stop'])test(end+' disables native taps and retained React19 evidence',()=>{
 const f=fixture();assert.equal(f.api.snapshot(null,'text',f.node).nativeStateAncestors.status,'Observed');
 f.api[end]('test revision changed');f.populate();const r=f.api.snapshot(null,'text',f.node);
 assert.equal(r.nativeStateAncestors.status,'Unknown/Unsupported');assert.equal(r.nativeStateAncestors.ancestors.length,0);f.api.stop();
});
test('observer cannot upgrade unavailable WeakRef or a collector capacity refusal',()=>{
 const a=fixture({weakRef:null});assert.equal(a.api.snapshot(null,'text',a.node).nativeStateAncestors.status,'Unknown/Unsupported');a.api.stop();
 const f=fixture();for(let i=0;i<4100;i++)f.tap('root-current',f.root,f.finished);
 assert.equal(f.api.snapshot(null,'text',f.node).nativeStateAncestors.status,'Unknown/Unsupported');f.api.stop();
});
test('admission accessors are not called and repeated configuration cannot revive earlier native history',()=>{
 let getters=0;const accessor=Object.defineProperty({},'adapter',{get(){getters++;return contract.adapter;}}),a=fixture({admit:accessor});
 assert.equal(a.api.snapshot(null,'text',a.node).nativeStateAncestors.status,'Unknown/Unsupported');assert.equal(getters,0);a.api.stop();
 const f=fixture();assert.equal(f.api.snapshot(null,'text',f.node).nativeStateAncestors.status,'Observed');
 f.api.enableReact19Probe(contract);f.populate();assert.equal(f.api.snapshot(null,'text',f.node).nativeStateAncestors.status,'Unknown/Unsupported');f.api.stop();
});
