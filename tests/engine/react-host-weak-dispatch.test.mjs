// SPDX-License-Identifier: Apache-2.0
// Owned mock DOM and authored native-shaped events only; not React/browser/GC proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createObserver} from '../../src/engine/observer.mjs';
const adapter='react18-final-host-props/1';

function fixture({weakRef=WeakRef}={}){
 const brand=new WeakSet();
 class Node{
  constructor(parent=null){brand.add(this);this.parent=parent;this.attributes=new Map();}
  get nodeType(){if(!brand.has(this))throw Error('Foreign mock node');return 1;}
  get parentNode(){return this.parent;}
  get textContent(){return 'Confirm';}
  contains(node){for(let n=node;n;n=n.parent)if(n===this)return true;return false;}
 }
 class Element extends Node{getAttribute(name){return this.attributes.get(name)??null;}}
 class Button extends Element{get disabled(){return this.disabledValue;}}
 class MutationObserver{observe(){}disconnect(){}takeRecords(){return [];}}
 class R extends Response{}
 const w={crypto,fetch,Response:R,Promise,WeakRef:weakRef,Node,Element,HTMLButtonElement:Button,MutationObserver,location:{href:'http://127.0.0.1:4173/'}};
 const api=createObserver(w,{sourceConsumption:true,reactStateHandoffs:true});
 api.enableReactHostProbe({adapter,status:'Observed'});
 const tap=(kind,a,b,c)=>api.reactHostTap(kind,a,b,c,adapter);
 const meta=extra=>({file:'Owned.jsx',sourceDigest:'a'.repeat(64),line:1,column:1,endLine:1,endColumn:10,key:'owned',...extra});
 const container=new Element(),node=new Button(container),scope=api.scope(),marker=scope+':confirm';
 node.disabledValue=true;node.attributes.set('data-stateatom',marker);
 api.reactContainer(meta({key:'root'}),'root-scope',container);
 const queue={dispatch(){}},hook={queue,memoizedState:null,next:null};
 const host={tag:5,child:null,sibling:null,type:'button',stateNode:node,memoizedProps:null,memoizedState:null};
 const fiber={tag:0,child:host,sibling:null,memoizedState:hook},finished={tag:3,child:fiber,sibling:null,memoizedState:null};
 const owner={containerInfo:container,current:finished};
 for(const f of[finished,fiber,host])tap('fiber-brand',f);
 tap('root-brand',owner,false);tap('state-mount',hook,queue,fiber);
 const update={action:true};tap('state-dispatch',queue,update,fiber);tap('state-applied',hook,update,true);hook.memoizedState=true;
 const result=[true,queue.dispatch];tap('state-result',result,hook,fiber);
 api.reactStateResult({binding:'locked'},scope,result);api.reactStateBinding(meta({binding:'locked'}),scope,true,queue.dispatch);
 function createElement(type,props){
  tap('factory-enter');Object.freeze(props);tap('factory-freeze',Object.freeze,props);
  const element={type,props};tap('factory-result',element,props,type);tap('factory-exit');return element;
 }
 tap('factory-brand',createElement);
 const receiver={createElement},factory=api.reactFactory(receiver,'createElement');
 const element=api.reactElement(meta({target:'confirm',tag:'button'}),scope,()=>factory('button',{
  disabled:api.target(meta({target:'confirm',property:'disabled',expression:'locked'}),scope,()=>api.read(meta({key:'read',expression:'locked'}),scope,'locked',true))
 }));
 host.memoizedProps=element.props;tap('host-applied',node,element.props);
 return{api,tap,node,host,fiber,finished,owner,props:element.props,marker,
  commit:()=>tap('root-committed',owner,finished),snapshot:()=>api.snapshot(marker,'disabled',node)};
}

function positive(snapshot){
 assert.equal(snapshot.commit.status,'Observed');assert.equal(snapshot.commit.producer.status,'Observed');
 assert.equal(snapshot.status,'Observed');assert.equal(snapshot.target.value,true);
 assert(snapshot.nodes.some(n=>n.kind==='react-state-read'));
 assert(snapshot.stateHandoffs.some(h=>h.status==='Observed'));
 assert(snapshot.stateHandoffs.every(h=>h.valueOrigin==='Unknown/Unsupported'));
}
test('authored complete host/props/state source gates are reached before replacement controls',()=>{
 const f=fixture();try{f.commit();positive(f.snapshot());}finally{f.api.stop();}
});
for(const phase of ['commit','snapshot'])for(const kind of ['method','accessor'])test('host '+phase+' bypasses late WeakRef '+kind+' dispatch',()=>{
 const f=fixture();let error,snapshot,calls=0;
 if(phase==='snapshot'){f.commit();positive(f.snapshot());}
 const previous=Object.getOwnPropertyDescriptor(WeakRef.prototype,'deref');
 Object.defineProperty(WeakRef.prototype,'deref',{configurable:true,...(kind==='method'?{value(){calls++;throw Error('App weak method');}}:{get(){calls++;throw Error('App weak accessor');}})});
 try{if(phase==='commit')f.commit();snapshot=f.snapshot();}catch(e){error=e;}
 finally{Object.defineProperty(WeakRef.prototype,'deref',previous);}
 try{assert.equal(calls,0);assert.equal(error,undefined);positive(snapshot);}finally{f.api.stop();}
});
for(const change of ['equal-props','marker','DOM-value','commit-shape','stale','stop'])test('host weak dispatch fix preserves '+change+' refusal',()=>{
 const f=fixture();try{
  f.commit();positive(f.snapshot());
  if(change==='equal-props'){f.host.memoizedProps={...f.props};f.commit();}
  if(change==='marker')f.node.attributes.set('data-stateatom','different-occurrence');
  if(change==='DOM-value')f.node.disabledValue=false;
  if(change==='commit-shape'){f.host.type=null;f.commit();}
  if(change==='stale')f.api.invalidate('owned revision changed');
  if(change==='stop')f.api.stop();
  assert.notEqual(f.snapshot().status,'Observed');
 }finally{f.api.stop();}
});

for(const loss of ['props','ancestor'])test('unavailable '+loss+' reference retains its existing scoped Unknown boundary',()=>{
 const lost=new WeakSet(),refs=new WeakMap();
 // Deterministic loss control only; this class does not establish actual GC.
 class WeakControl{constructor(value){refs.set(this,value);}deref(){const value=refs.get(this);return lost.has(value)?undefined:value;}}
 const f=fixture({weakRef:WeakControl});try{
  f.commit();positive(f.snapshot());lost.add(loss==='props'?f.props:f.fiber);
  if(loss==='props'){f.commit();assert.notEqual(f.snapshot().status,'Observed');}
  else{const snapshot=f.snapshot();assert.equal(snapshot.commit.status,'Observed');assert(snapshot.stateHandoffs.length);assert(snapshot.stateHandoffs.every(h=>h.status==='Unknown/Unsupported'));}
 }finally{f.api.stop();}
});
