// SPDX-License-Identifier: Apache-2.0
// OWNED synthetic policy, fibers and event stream. Never real native evidence.
export function elementFiberPolicy(){
 const file='react-dom/cjs/react-dom-client.development.js',sourceDigest='806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08';
 return{schema:'stateatom.native-element-fiber-source/1',file,sourceDigest,nativeVersionAdmitted:true,version:'19.2.5',sites:[['create','createFiberFromElement'],['update','updateElement'],['single','reconcileChildFibersImpl']].map(([role,owner],i)=>({id:String(i+1).repeat(64),file,sourceDigest,kind:'native-element-fiber',owner,role,line:i+1,column:1,endLine:i+1,endColumn:2}))};
}
export function elementFiberTree(){
 const node={},otherNode={},props={},component=function Item(){},element={};
 const fiber=fields=>({tag:0,child:null,sibling:null,type:null,memoizedProps:null,pendingProps:null,...fields});
 const rootFiber=fiber({tag:3}),componentFiber=fiber({type:component,memoizedProps:props,pendingProps:props}),host=fiber({tag:5,stateNode:node}),otherHost=fiber({tag:5,stateNode:otherNode}),root={current:rootFiber};
 rootFiber.child=componentFiber;componentFiber.child=host;host.sibling=otherHost;
 return{node,otherNode,props,component,element,rootFiber,componentFiber,host,otherHost,root,fiber};
}
