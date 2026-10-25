// SPDX-License-Identifier: Apache-2.0
// Authored config cases on actual product observer source, no DOM/browser acceptance.
import vm from 'node:vm';
export const nativeForwardingGrammar=`'use strict';function ReactElement(type,key,props,owner,debugStack,debugTask){type={props};Object.freeze(props);return type;}exports.createElement=function(type,config){var props={};for(var key in config)if(Object.prototype.hasOwnProperty.call(config,key))props[key]=config[key];return ReactElement(type,null,props,null,null,null);};`;
export const nativeForwardingCases=Object.freeze(['ordinary','getter','proxy-config','proxy-item','throw-getter','iterator-mutate','iterator-throw','stopped','stale','unadmitted','missing-runtime','runtime-accessor','tap-accessor','throwing-tap','late-runtime']);
const scenario=`'use strict';
var trace=[],row={private:'synthetic-private'},sentinel={},finalElement,originalIterator,iteratorCalls=0,mutation=0,proxyItemTraps=0,getterReads=0,sameThrown=false,helperFrame=false;
function Row(){throw Error('Component body must not execute');}
if(caseName==='proxy-item')row=new Proxy(row,{get(){proxyItemTraps++;throw sentinel;},ownKeys(){proxyItemTraps++;throw sentinel;},getOwnPropertyDescriptor(){proxyItemTraps++;throw sentinel;}});
var config={todo:row};
if(caseName==='getter'||caseName==='throw-getter'){
 config={};Object.defineProperty(config,'todo',{enumerable:true,get(){getterReads++;trace.push('get');helperFrame=/__sa19Tap|react19NativeTap|Object\\.tap/.test(String(new Error().stack));if(caseName==='throw-getter')throw sentinel;return row;}});
}
if(caseName==='proxy-config')config=new Proxy(config,{get(t,k,r){trace.push('get:'+String(k));return Reflect.get(t,k,r);},ownKeys(t){trace.push('keys');return Reflect.ownKeys(t);},getOwnPropertyDescriptor(t,k){trace.push('descriptor:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k);},has(t,k){trace.push('has:'+String(k));return Reflect.has(t,k);}});
if(caseName==='late-runtime')installRuntime();
if(caseName==='iterator-mutate'||caseName==='iterator-throw'){
 originalIterator=Array.prototype[Symbol.iterator];Array.prototype[Symbol.iterator]=function(){iteratorCalls++;mutation++;if(caseName==='iterator-throw')throw sentinel;return nativeApply(originalIterator,this,[]);};
}
try{finalElement=exports.createElement(Row,config);}catch(e){sameThrown=e===sentinel;if(!sameThrown)throw e;}
finally{if(originalIterator)Array.prototype[Symbol.iterator]=originalIterator;}
var todoDescriptor=finalElement?Object.getOwnPropertyDescriptor(finalElement.props,'todo'):null;
var summary={hasElement:!!finalElement,todoMatches:!!todoDescriptor&&todoDescriptor.value===row,sameThrown,iteratorCalls,mutation,proxyItemTraps,getterReads,helperFrame};
var metadata={calls:metadataCalls,receiverSame,arity,elementSame:!!finalElement&&lastElement===finalElement,propsSame:!!finalElement&&lastProps===finalElement.props,kind,accessorReads};
var nativeAncestors=api.snapshot(null,'text',null).nativeStateAncestors||null;
api.stop();
`;
export function executeNativeForwardingSource({source,observerBundle,caseName,mode='on'}){
 if(!nativeForwardingCases.includes(caseName)||!['original','off','on'].includes(mode))throw Error('Unknown owned native forwarding control');
 const context=vm.createContext({exports:{},caseName,process:{env:{NODE_ENV:'development'}},crypto,fetch,Response,console:{log(){},warn(){},error(){}},WeakRef});
 new vm.Script(observerBundle,{filename:'actual-product-observer-bundle.js'}).runInContext(context,{timeout:5000});
 const bootstrap=`'use strict';const nativeApply=Reflect.apply;const w={crypto,fetch,Response,WeakRef,location:{href:'http://127.0.0.1:4173/'}};
var api=__StateAtomForwardingProduct.createObserver(w,{react19StateAncestors:${mode==='on'}});
if(${mode==='on'}&&caseName!=='unadmitted')api.enableReact19Probe({status:'Observed',adapter:'react19-state-ancestors/1',versions:{react:'19.2.5','react-dom':'19.2.5'}});
if(caseName==='stopped')api.stop();if(caseName==='stale')api.invalidate('owned-source-revision-changed');
var metadataCalls=0,receiverSame=true,arity=null,lastElement=null,lastProps=null,kind=null,accessorReads=0,originalTap=api.react19NativeTap,runtime={};
Object.defineProperty(runtime,'react19NativeTap',{value:function(){metadataCalls++;receiverSame=receiverSame&&this===runtime;arity=arguments.length;kind=arguments[0];lastElement=arguments[1];lastProps=arguments[2];if(caseName==='throwing-tap')throw Error('Owned telemetry failure');return nativeApply(originalTap,api,arguments);}});
function installRuntime(){globalThis.__STATEATOM__=runtime;}
if(caseName==='runtime-accessor')Object.defineProperty(globalThis,'__STATEATOM__',{get(){accessorReads++;throw Error('runtime getter');}});
else if(caseName==='tap-accessor'){const r={};Object.defineProperty(r,'react19NativeTap',{get(){accessorReads++;throw Error('tap getter');}});globalThis.__STATEATOM__=r;}
else if(caseName!=='missing-runtime'&&caseName!=='late-runtime')installRuntime();`;
 new vm.Script(bootstrap,{filename:'owned-product-bootstrap.js'}).runInContext(context,{timeout:5000});
 new vm.Script(source,{filename:'owned-react-source.cjs'}).runInContext(context,{timeout:5000});
 new vm.Script(scenario,{filename:'owned-forwarding-config.js'}).runInContext(context,{timeout:5000});
 return JSON.parse(JSON.stringify({summary:context.summary,trace:context.trace,metadata:context.metadata,nativeAncestors:context.nativeAncestors,sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0,modelCalls:0}));
}
