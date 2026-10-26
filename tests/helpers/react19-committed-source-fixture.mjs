// SPDX-License-Identifier: Apache-2.0
// OWNED complete event fixture using real observer factories, never actual React/App.
import {appElementRetentionPolicy,recordRetentionApp} from './app-element-retention-fixture.mjs';
import {elementFiberPolicy} from './react19-committed-element-fixture.mjs';
export function committedSourcePolicy(){
 const p=appElementRetentionPolicy(),site=(id,kind,functionName)=>({id:id.repeat(64),file:'owned-native.js',sourceDigest:'b'.repeat(64),kind,functionName,line:1,column:1,endLine:20,endColumn:100});
 return{...p,native:{file:'owned-native.js',sourceDigest:'b'.repeat(64),version:'19.2.5',nativeVersionAdmitted:false,returnSites:[site('8','native-state-return','mountReducer'),site('9','native-state-return','updateReducerImpl'),site('a','native-state-return','rerenderReducer')],renderSites:[site('b','native-render-component','renderWithHooks'),site('c','native-render-component','renderWithHooksAgain')]},elementFiber:elementFiberPolicy()};
}
export function feedCommittedSource(o,p,{rows=[{title:'PRIVATE-ONE'},{title:'PRIVATE-TWO'}],nativeState=true,appComplete=true,mainComplete=true,appNative=true,reuseElements=null,beforeReturned=null}={}){
 function App(){}const appFiber={},nativeHook={},adapter={...o,appHook:{...o.appHook,
  appEnter(tag){o.nativeTap('render-component',appFiber,App,p.native.renderSites[0].id);return o.appHook.appEnter(tag,App);},
  result(token,tuple,method,tag){if(nativeState)o.nativeTap('state-result',tuple,nativeHook,appFiber,p.native.returnSites[0].id,tuple[0],tuple[1]);return o.appHook.result(token,tuple,method,tag);}
 }};
 const app=recordRetentionApp(adapter,p,{rows,native:appNative,complete:appComplete}),m=o.mainInput,token=m.mainEnter(app.c,rows,p.main.mainSite.id),filter=m.arrayRuntime.begin(Array.prototype.filter,rows,p.main.filterSite.id),visible=rows.filter(()=>true);m.arrayRuntime.finish(filter,visible);
 const map=m.arrayRuntime.begin(Array.prototype.map,visible,p.main.mapSite.id),jsxSite={id:'7'.repeat(64),file:'owned-lowered.js',sourceDigest:'a'.repeat(64),line:1,column:1,endLine:1,endColumn:99};
 const elements=visible.map((item,index,array)=>{const handle=m.enter(map,p.main.mapSite.id,item,index,array),element=reuseElements?.[index]||{props:{todo:item}},props=element.props;o.tap('config-input',item,props,jsxSite);o.tap('jsx-element-return',element,props);if(beforeReturned)beforeReturned(element,index);m.returned(handle,element);m.exit(handle);return element;});
 m.arrayRuntime.finish(map,elements);const root={elements};if(mainComplete){m.mainReturned(token,root);m.mainExit(token);}return{app,appFiber,nativeHook,App,elements,root,rows};
}
export function attachCommittedNative(o,p,source,{emit=true,commit=true,alternate=false,cloneElement=false,existingRoot=null}={}){
 const fiber=fields=>({tag:0,type:null,pendingProps:null,memoizedProps:null,child:null,sibling:null,...fields}),rootFiber=fiber({tag:3}),App=source.appFiber,components=[],hosts=[],nodes=[];
 Object.assign(App,{tag:0,type:source.App,pendingProps:{},memoizedProps:{},child:null,sibling:null});rootFiber.child=App;const root=existingRoot||{current:rootFiber};
 for(const f of [rootFiber,App])o.referenceTap('fiber',f);o.referenceTap('root',root);
 for(let i=0;i<source.elements.length;i++){
  const element=source.elements[i],node={},host=fiber({tag:5,stateNode:node}),component=fiber({type:function Item(){},pendingProps:element.props,memoizedProps:element.props,child:host});
  components.push(component);hosts.push(host);nodes.push(node);if(i)components[i-1].sibling=component;else App.child=component;
  o.referenceTap('fiber',component);o.referenceTap('fiber',host);
  let target=component;if(alternate){target=fiber({type:component.type,pendingProps:element.props,memoizedProps:element.props});component.alternate=target;target.alternate=component;o.referenceTap('fiber',target);}
  if(emit)o.referenceTap('element-fiber',target,cloneElement?{props:element.props}:element,p.elementFiber.sites[0].id);
 }
 const publish=()=>{root.current=rootFiber;return o.referenceTap('root-current',root,rootFiber);};if(commit)publish();return{fiber,rootFiber,App,root,components,hosts,nodes,publish};
}
