// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {createReact19Acquisition} from '../../src/engine/react19-acquisition.mjs';

function fixture({props={},component=function Item(){},weakRef=WeakRef}={}){
 const api=createReact19Acquisition({page:'props-page',weakRef});
 const node={},otherNode={},rootFiber={tag:3},fiber={tag:0,type:component,memoizedProps:props},host={tag:5,stateNode:node},sibling={tag:5,stateNode:otherNode},root={current:rootFiber};
 rootFiber.child=fiber;fiber.child=host;host.sibling=sibling;
 for(const f of [rootFiber,fiber,host,sibling])api.tap('fiber',f);
 api.tap('root',root);api.tap('root-current',root,rootFiber);
 return {api,node,otherNode,rootFiber,fiber,host,sibling,root,props,component,
  match(){return api.matchCommittedProps(node,props,component);}};
}
const U='Unknown/Unsupported';
function unknown(f){const r=f.match();assert.equal(r.status,U);assert.equal(r.match,null);return r;}

test('opaque supplied props match one exact selected current function ancestor without a state hook',()=>{
 const f=fixture(),r=f.match();assert.equal(r.status,'Observed');
 assert.equal(r.schema,'stateatom.committed-props-reference/1');assert.equal(r.page,'props-page');
 assert.equal(r.suppliedReferenceOnly,true);assert.equal(r.fullPath,false);
 for(const k of ['sourceElementIdentity','selectedPropertyOrigin','fieldOwnership','stateToProp'])assert.equal(r[k],U);
 for(const k of ['nodeId','rootId','commitId','fiberId','propsId','componentId'])assert.equal(typeof r.match[k],'string');
 assert.equal(f.api.snapshot(f.node).status,U);assert.doesNotThrow(()=>JSON.stringify(r));
});
test('equal props and equal function name cannot substitute exact supplied references',()=>{
 const props={text:'same'},component=function Item(){},f=fixture({props,component});
 assert.equal(f.api.matchCommittedProps(f.node,{text:'same'},component).status,U);
 assert.equal(f.api.matchCommittedProps(f.node,props,function Item(){}).status,U);
 assert.equal(f.match().status,'Observed');
});
test('shared props do not become source element identity or row provenance',()=>{
 const f=fixture(),a=f.match(),b=f.api.matchCommittedProps(f.otherNode,f.props,f.component);
 assert.equal(b.status,'Observed');assert.notEqual(a.match.nodeId,b.match.nodeId);
 assert.equal(a.match.fiberId,b.match.fiberId);assert.equal(b.sourceElementIdentity,U);
 const other={tag:0,type:f.component,memoizedProps:f.props,child:f.sibling};
 f.api.tap('fiber',other);f.host.sibling=null;f.fiber.sibling=other;
 const c=f.api.matchCommittedProps(f.otherNode,f.props,f.component);
 assert.equal(c.status,'Observed');assert.notEqual(c.match.fiberId,a.match.fiberId);
});
test('two matching ancestors refuse rather than choosing the nearest',()=>{
 const f=fixture(),outer={tag:0,type:f.component,memoizedProps:f.props,child:f.fiber};
 f.api.tap('fiber',outer);f.rootFiber.child=outer;unknown(f);
});
for(const [name,change] of [
 ['props',f=>{f.fiber.memoizedProps={};}],['type',f=>{f.fiber.type=()=>{};}],
 ['unmount',f=>{f.rootFiber.child=null;}],['root',f=>{f.root.current={};}],
 ['node',f=>{f.host.stateNode={};}],['unregistered branch',f=>{f.host.sibling={tag:5,stateNode:{}};}],
 ['unregistered parent',f=>{f.rootFiber.child={child:f.fiber};}],
 ['cycle',f=>{f.sibling.sibling=f.host;}],
 ['duplicate host',f=>{f.sibling.stateNode=f.node;}],
])test('current '+name+' cannot borrow a committed props witness',()=>{const f=fixture();change(f);unknown(f);});
test('uncommitted alternate and stale return pointer do not replace current child/sibling ancestry',()=>{
 const f=fixture(),alternate={tag:0,type:f.component,memoizedProps:{},child:f.host};
 f.api.tap('fiber',alternate);f.fiber.alternate=alternate;alternate.alternate=f.fiber;
 f.host.return=alternate;assert.equal(f.match().status,'Observed');
 f.fiber.memoizedProps={};alternate.memoizedProps=f.props;unknown(f);
});
for(const tag of [1,5,11,14,15])test('unsupported component tag '+tag+' stays unknown',()=>{
 const f=fixture();f.fiber.tag=tag;unknown(f);
});
test('new commits give fresh identity while old DTOs stay historical and cannot mutate collector state',()=>{
 const f=fixture(),a=f.match();f.api.tap('root-current',f.root,f.rootFiber);const b=f.match();
 assert.notEqual(a.match.commitId,b.match.commitId);assert.equal(a.match.fiberId,b.match.fiberId);
 b.match.propsId='forged';assert.equal(f.match().match.propsId,a.match.propsId);
 f.api.stop();unknown(f);assert.equal(a.status,'Observed');
});
test('opaque application proxies are neither reflected nor called',()=>{
 let traps=0;const fail=()=>{traps++;throw Error('opaque application reference');};
 const props=new Proxy({},{get:fail,getOwnPropertyDescriptor:fail,ownKeys:fail});
 const component=new Proxy(function Item(){},{get:fail,getOwnPropertyDescriptor:fail,ownKeys:fail,apply:fail});
 const f=fixture({props,component});assert.equal(f.match().status,'Observed');
 assert.doesNotThrow(()=>JSON.stringify(f.match()));assert.equal(traps,0);
});
test('metadata accessors never execute and incomplete tree edges refuse',()=>{
 let calls=0;for(const [target,key] of [['fiber','memoizedProps'],['fiber','type'],['host','child'],['sibling','sibling']]){
  const f=fixture();Object.defineProperty(f[target],key,{get(){calls++;throw Error('getter');}});unknown(f);
 }assert.equal(calls,0);
});
test('multiple roots, stopped, unsupported WeakRef, foreign nodes and primitive arguments refuse',()=>{
 const f=fixture(),rootFiber={tag:3},root={current:rootFiber};f.api.tap('fiber',rootFiber);f.api.tap('root',root);f.api.tap('root-current',root,rootFiber);unknown(f);
 const stopped=fixture();stopped.api.stop();unknown(stopped);unknown(fixture({weakRef:null}));
 const g=fixture();for(const [node,props,type] of [[{},g.props,g.component],[null,g.props,g.component],[g.node,null,g.component],[g.node,1,g.component],[g.node,g.props,{}]])assert.equal(g.api.matchCommittedProps(node,props,type).status,U);
});
test('tree, ancestry and event limits refuse without partial positive observations',()=>{
 for(const n of [65,513]){const f=fixture();let parent=f.rootFiber;
  for(let i=0;i<n;i++){const next={tag:0,type:()=>{},memoizedProps:{}};f.api.tap('fiber',next);parent.child=next;parent=next;}
  parent.child=f.fiber;unknown(f);
 }
 const f=fixture();for(let i=0;i<4100;i++)f.api.tap('state-result',null);unknown(f);
});
test('supported ancestry boundary is inclusive and the next ancestor refuses',()=>{
 const f=fixture();let parent=f.rootFiber;
 // root + 61 wrappers + matching component + selected host = 64 ancestors.
 for(let i=0;i<61;i++){const next={tag:0};f.api.tap('fiber',next);parent.child=next;parent=next;}
 parent.child=f.fiber;assert.equal(f.match().status,'Observed');
 const extra={tag:0,child:f.fiber};f.api.tap('fiber',extra);parent.child=extra;unknown(f);
});
test('props queries do not alter old native snapshot identity, event counters or state-origin boundaries',()=>{
 const f=fixture(),state={},queue={dispatch(){}},hook={queue,memoizedState:state,next:null};
 f.fiber.memoizedState=hook;f.api.tap('state-result',[state,queue.dispatch],hook,f.fiber);
 const before=f.api.snapshot(f.node),retention=f.api.retention();
 assert.equal(before.status,'Observed');assert.equal(f.match().status,'Observed');
 assert.deepEqual(f.api.snapshot(f.node),before);assert.deepEqual(f.api.retention(),retention);
});
test('invalid primitive tree edges refuse for the supplied props method without relaxing old snapshots',()=>{
 for(const key of ['child','sibling']){const f=fixture();f.sibling[key]=1;unknown(f);}
});
