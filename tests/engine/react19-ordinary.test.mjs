// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {installReact19Experiment} from '../../experiments/react19-reducer/observer.mjs';
import {installOrdinaryReducerAcquisition} from '../../experiments/react19-reducer/ordinary-observer.mjs';
function fixture({enabled=true,state={}}={}){
  const c=vm.createContext({WeakRef,structuredClone});vm.runInContext('('+installReact19Experiment.toString()+')('+JSON.stringify({enabled})+')',c);vm.runInContext('('+installOrdinaryReducerAcquisition.toString()+')()',c);
  const tap=c.__STATEATOM_REACT19_TAP__,base=c.__R19_EXPERIMENT__,api=c.__R19_ORDINARY__;
  const rootFiber={tag:3},fiber={tag:0,return:rootFiber},first={tag:5,return:fiber},second={tag:5,return:fiber},dom1={},dom2={},root={current:rootFiber};rootFiber.child=fiber;fiber.child=first;first.sibling=second;first.stateNode=dom1;second.stateNode=dom2;
  for(const f of[rootFiber,fiber,first,second])tap('fiber',f);tap('root',root);
  const queue={dispatch(){}},hook={queue,memoizedState:state,next:null};fiber.memoizedState=hook;tap('state-result',[state,queue.dispatch],hook,fiber);tap('root-current',root,rootFiber);
  const apply=(result,{clone=false}={})=>{const action={},update={action},next={queue,memoizedState:state,next:null};tap('dispatch',queue,update,fiber,action);tap('begin',next,hook,queue,fiber);tap('reducer-applied',result,next,queue,clone?{action}:update,state,action,fiber,()=>{});next.memoizedState=result;fiber.memoizedState=next;tap('state-result',[result,queue.dispatch],next,fiber);tap('root-current',root,rootFiber);return next;};
  return{c,tap,base,api,root,rootFiber,fiber,first,second,dom1,dom2,queue,hook,apply};
}
test('native committed ancestor acquisition needs no consumer or reducer oracle and reads no app fields',()=>{
  let traps=0;const state=new Proxy({},{get(){traps++;throw Error('get');},getOwnPropertyDescriptor(){traps++;throw Error('descriptor');},ownKeys(){traps++;throw Error('keys');}}),f=fixture({state}),r=f.api.snapshot(f.dom1);
  assert.equal(r.status,'Observed');assert.equal(r.ancestors.length,1);assert.equal(r.ancestors[0].resultId,f.base.id(state));assert.equal(r.ancestors[0].updateId,null);assert.equal(r.selectedPropertyOrigin,'Unknown/Unsupported');assert.equal(r.fullPath,false);assert.equal(f.base.all().oracleResults.length,0);assert.equal(traps,0);
});
test('equal DOM instances retain distinct selected identities and shared ancestor is not row provenance',()=>{
  const f=fixture(),one=f.api.snapshot(f.dom1),two=f.api.snapshot(f.dom2);assert.equal(one.status,'Observed');assert.equal(two.status,'Observed');assert.notEqual(one.nodeId,two.nodeId);assert.equal(one.ancestors[0].queueId,two.ancestors[0].queueId);assert.equal(one.stateToProp,'Unknown/Unsupported');assert.equal(two.selectedPropertyOrigin,'Unknown/Unsupported');
});
test('same state object still has a new applied revision; cloned update never borrows dispatch origin',()=>{
  const state={},f=fixture({state}),initial=f.api.snapshot(f.dom1);f.apply(state);const same=f.api.snapshot(f.dom1);assert.equal(same.status,'Observed');assert.equal(same.ancestors[0].resultId,initial.ancestors[0].resultId);assert.notEqual(same.ancestors[0].revisionId,initial.ancestors[0].revisionId);assert(same.ancestors[0].updateId);
  f.apply({},{clone:true});const cloned=f.api.snapshot(f.dom1);assert.equal(cloned.status,'Observed');assert.equal(cloned.ancestors[0].updateOriginStatus,'Unknown/Unsupported');assert.equal(cloned.ancestors[0].updateId,null);
});
test('foreign, detached, stale root, hook and queue cannot reuse a committed witness',()=>{
  for(const mutate of[f=>{f.first.stateNode={};},f=>{f.root.current={};},f=>{f.fiber.memoizedState={...f.hook};},f=>{f.hook.queue={...f.queue};},f=>{f.hook.memoizedState={};}]){const f=fixture();mutate(f);assert.equal(f.api.snapshot(f.dom1).status,'Unknown/Unsupported');}
  const f=fixture();assert.equal(f.api.snapshot({}).status,'Unknown/Unsupported');assert.equal(f.api.snapshot(null).status,'Unknown/Unsupported');
});
test('uncommitted work cannot replace exact current ancestor state',()=>{
  const f=fixture(),before=f.api.snapshot(f.dom1),pending={},wip={tag:0},hook={queue:f.queue,memoizedState:pending,next:null};f.tap('fiber',wip);f.tap('state-result',[pending,f.queue.dispatch],hook,wip);const after=f.api.snapshot(f.dom1);assert.equal(after.status,'Observed');assert.equal(after.ancestors[0].resultId,before.ancestors[0].resultId);
});
test('class component state on an ancestor is not traversed as a native hook list',()=>{
  let traps=0;const f=fixture(),state=new Proxy({},{getOwnPropertyDescriptor(){traps++;throw Error('app descriptor');}}),classFiber={tag:1,memoizedState:state,return:f.rootFiber,child:f.fiber};f.tap('fiber',classFiber);f.rootFiber.child=classFiber;f.fiber.return=classFiber;f.tap('root-current',f.root,f.rootFiber);assert.equal(f.api.snapshot(f.dom1).status,'Observed');assert.equal(traps,0);
});
test('committed child/sibling tree determines ancestry when a reused child return points to an old alternate',()=>{
  const f=fixture(),old={tag:0,return:f.rootFiber};f.tap('fiber',old);f.first.return=old;assert.equal(f.api.snapshot(f.dom1).status,'Observed');assert.equal(f.api.snapshot(f.dom1).ancestors[0].fiberId,f.base.id(f.fiber));
});
test('primitive, disabled, stopped and ledger overflow remain explicit unknown',()=>{
  assert.equal(fixture({state:1}).api.snapshot({}).status,'Unknown/Unsupported');const p=fixture({state:1});assert.equal(p.api.snapshot(p.dom1).status,'Unknown/Unsupported');const off=fixture({enabled:false});assert.equal(off.api.snapshot(off.dom1).status,'Unknown/Unsupported');const f=fixture();f.base.stop();assert.equal(f.api.snapshot(f.dom1).status,'Unknown/Unsupported');
  const capped=fixture();for(let i=0;i<4100;i++)capped.tap('state-result',[{},capped.queue.dispatch],capped.hook,capped.fiber);assert.equal(capped.api.snapshot(capped.dom1).status,'Unknown/Unsupported');
});
