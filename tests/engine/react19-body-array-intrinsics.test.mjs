// SPDX-License-Identifier: Apache-2.0
// Owned conditional source protocol only: fake base is not native/source acquisition.
import test from 'node:test';import assert from 'node:assert/strict';
import {createComponentBodyPathObserver} from '../../experiments/react19-reducer/component-body-path-observer.mjs';
import {instrumentComponentCallGrammar} from '../../experiments/react19-reducer/component-call-transform.mjs';
import {instrumentComponentBody} from '../../experiments/react19-reducer/component-body-transform.mjs';
import {componentCallGrammar} from '../helpers/react19-component-call-grammar.mjs';
const U='Unknown/Unsupported',callPolicy=instrumentComponentCallGrammar(componentCallGrammar(),'react-dom/cjs/react-dom-client.development.js').policy,bodyPolicy=instrumentComponentBody('function Item({todo,dispatch}){return {};}','owned-body-array.js').policy;
const callSite=callPolicy.sites[0].id,entrySite=bodyPolicy.sites[0].id,returnSite=bodyPolicy.sites[1].id;
function fixture(options={}){
 const f={item:{},dispatch:function dispatch(){},fiber:{},self:function Item(){},props:{},element:{},result:{},node:{},sourceEligible:true,commit:0};
 const base={mainInput:{enter:()=>Object.freeze(Object.create(null)),returned:(handle,value)=>value,exit(){}},startWindow:()=>({id:'owned'}),sealWindow:()=>({sealed:true}),stop(){f.sourceEligible=false;},nativeTap:()=>null,referenceTap:kind=>{if(kind==='root-current')f.commit++;return null;},lookupNode:node=>({status:f.sourceEligible&&node===f.node?'Observed':U,links:[]}),currentReferenceCommit:()=>({status:'Observed',commitId:'owned-commit-'+f.commit}),matchInvocationNode:(node,element,fiber,self,props)=>({status:f.sourceEligible&&node===f.node&&element===f.element&&fiber===f.fiber&&self===f.self&&props===f.props?'Observed':U,links:[{ownedConditionalBase:true}]})};
 f.o=createComponentBodyPathObserver({page:'owned-body-array',base,callPolicy,bodyPolicy,...options});f.o.startWindow('owned');
 f.capture=({param=f.item,nativeOutcome=true,bodyOutcome=true}={})=>{
  const h=f.o.mainInput.enter(null,null,f.item);const returned=f.o.mainInput.returned(h,f.element);
  const native=f.o.componentCallTap('component-call-begin',f.fiber,f.self,f.props,callSite),body=f.o.componentBodyTap('component-body-entry',f.self,param,f.dispatch,entrySite);
  if(bodyOutcome)f.o.componentBodyTap('component-body-return',body,f.result,returnSite);
  if(nativeOutcome){f.o.componentCallTap('component-call-return',native,f.result,callSite);f.o.componentCallTap('component-call-end',native,callSite);}
  f.o.referenceTap('root-current');f.o.sealWindow();return{returned,native,body};
 };return f;
}
function patched(key,work){const descriptor=Object.getOwnPropertyDescriptor(Array.prototype,key);let calls=0,result,error;try{Object.defineProperty(Array.prototype,key,{configurable:true,get(){calls++;throw Error('owned application Array access');}});try{result=work();}catch(e){error=e;}}finally{Object.defineProperty(Array.prototype,key,descriptor);}return{calls,result,error};}
for(const key of ['push',Symbol.iterator,'every','some','includes'])for(const reset of [false,true])test('private body path avoids application Array '+String(key)+', reset='+reset,()=>{
 const f=fixture(),r=patched(key,()=>{if(reset)f.o.startWindow('next');const receipt=f.capture();return{receipt,match:f.o.lookupBodyNode(f.node),retention:f.o.bodyRetention()};});
 assert.equal(r.error,undefined);assert.equal(r.calls,0,'Observer invoked a later application prototype accessor');assert.equal(r.result.receipt.returned,f.element);assert.equal(r.result.match.status,'Observed');assert.equal(r.result.match.links.length,1);assert.equal(r.result.retention.faulted,false);assert.equal(r.result.retention.strongApplicationPins,0);assert.equal(r.result.match.nativeOrigin,'NotAttested');assert.equal(r.result.match.fullPath,false);
});
test('all private Array access replacements together leave exact protocol and DTOs intact',()=>{
 const f=fixture();const keys=['push',Symbol.iterator,'every','some','includes'],descriptors=keys.map(k=>Object.getOwnPropertyDescriptor(Array.prototype,k));let calls=0,result,error;
 try{for(let i=0;i<keys.length;i++)Object.defineProperty(Array.prototype,keys[i],{configurable:true,get(){calls++;throw Error('owned Array trap');}});try{f.o.startWindow('next');f.capture();result=f.o.lookupBodyNode(f.node);}catch(e){error=e;}}finally{for(let i=0;i<keys.length;i++)Object.defineProperty(Array.prototype,keys[i],descriptors[i]);}
 assert.equal(error,undefined);assert.equal(calls,0);assert.equal(result.status,'Observed');assert.equal(Object.getPrototypeOf(result),null);assert(Object.isFrozen(result));assert(Object.isFrozen(result.links));assert.equal(result.fieldOwnership,U);assert.equal(result.selectedPropertyOrigin,U);
});
for(const [name,options]of [['different parameter',{param:{}}],['incomplete native',{nativeOutcome:false}],['incomplete body',{bodyOutcome:false}]])test('array hardening retains '+name+' refusal',()=>{const f=fixture();f.capture(options);assert.equal(f.o.lookupBodyNode(f.node).status,U);});
test('global source and stopped gates still veto exact body routing',()=>{const f=fixture();f.capture();assert.equal(f.o.lookupBodyNode(f.node).status,'Observed');f.sourceEligible=false;assert.equal(f.o.lookupBodyNode(f.node).status,U);f.sourceEligible=true;f.o.stop();assert.equal(f.o.lookupBodyNode(f.node).status,U);assert.equal(f.o.bodyRetention().callbacks,0);});
test('weak-unavailable selected item remains Unknown without a value substitute',()=>{const lost=new WeakSet();class OwnedRef{constructor(v){this.value=v;}deref(){return lost.has(this.value)?undefined:this.value;}}const f=fixture({weakRef:OwnedRef});f.capture();assert.equal(f.o.lookupBodyNode(f.node).status,'Observed');lost.add(f.item);assert.equal(f.o.lookupBodyNode(f.node).status,U);});
import {createCommittedSourcePathObserver} from '../../experiments/react19-reducer/committed-source-path-observer.mjs';
import {memoSourcePolicy,feedCommittedSource,attachMemoSource} from '../helpers/react19-memo-source-fixture.mjs';
test('real complete declared-event source factories retain the exact body edge after late Array access replacement',()=>{
 const p=memoSourcePolicy(),base=createCommittedSourcePathObserver({page:'owned-array-full-source',policy:p}),o=createComponentBodyPathObserver({page:'owned-array-full-source',base,callPolicy,bodyPolicy});o.startWindow('owned');
 const source=feedCommittedSource(o,p),native=attachMemoSource(o,p,source,{commit:false}),fiber=native.components[0],self=native.innerComponents[0],props=source.elements[0].props,a=source.rows[0],b=function dispatch(){},result={};
 const keys=['push',Symbol.iterator,'every','some','includes'],descriptors=keys.map(k=>Object.getOwnPropertyDescriptor(Array.prototype,k));let calls=0,match,error,trap;
 try{for(let i=0;i<keys.length;i++)Object.defineProperty(Array.prototype,keys[i],{configurable:true,get(){calls++;trap=Error('owned Array access '+String(keys[i]));throw trap;}});try{
  const token=o.componentCallTap('component-call-begin',fiber,self,props,callSite),body=o.componentBodyTap('component-body-entry',self,a,b,entrySite);o.componentBodyTap('component-body-return',body,result,returnSite);o.componentCallTap('component-call-return',token,result,callSite);o.componentCallTap('component-call-end',token,callSite);native.publish();o.sealWindow();match=o.lookupBodyNode(native.nodes[0]);
 }catch(e){error=e;}}finally{for(let i=0;i<keys.length;i++)Object.defineProperty(Array.prototype,keys[i],descriptors[i]);}
 assert.equal(error,undefined);assert.equal(calls,0,trap?.stack);assert.equal(match.status,'Observed');assert.equal(match.links.length,1);assert.equal(match.fullPath,false);assert.equal(match.sourceOnly,true);assert.equal(match.fieldOwnership,U);
});
import {createReact19Acquisition} from '../../src/engine/react19-acquisition.mjs';
function acquisitionFixture(){const o=createReact19Acquisition({page:'owned-native-array'}),state={},queue={dispatch(){}},hook={queue,memoizedState:state,next:null},node={},props={},self=function Item(){},host={tag:5,stateNode:node},fiber={tag:0,type:self,memoizedProps:props,memoizedState:hook,child:host},finished={tag:3,child:fiber},root={current:finished};o.tap('fiber',finished);o.tap('fiber',fiber);o.tap('fiber',host);o.tap('root',root);o.tap('state-result',[state,queue.dispatch],hook,fiber);o.tap('root-current',root,finished);return{o,node,props,self,fiber,root,finished};}
for(const key of ['push','pop','includes'])test('lower acquisition event and tree/ancestor traversal avoid application Array '+key,()=>{
 const f=acquisitionFixture(),r=patched(key,()=>{f.o.tap('root-current',f.root,f.finished);return{current:f.o.currentCommit(),snapshot:f.o.snapshot(f.node),props:f.o.matchCommittedProps(f.node,f.props,f.self,f.fiber),retention:f.o.retention()};});
 assert.equal(r.error,undefined);assert.equal(r.calls,0);assert.equal(r.result.current.status,'Observed');assert.equal(r.result.snapshot.status,'Observed');assert.equal(r.result.snapshot.ancestors.length,1);assert.equal(r.result.props.status,'Observed');assert.equal(r.result.snapshot.fullPath,false);assert.equal(r.result.retention.available,true);
});
