// SPDX-License-Identifier: Apache-2.0
// Owned authored app/config source, not an independent app or browser acceptance.
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createPropCopyObserver} from '../../experiments/react19-reducer/prop-copy-observer.mjs';
import {createCallbackCopyObserver} from '../../experiments/react19-reducer/callback-copy-observer.mjs';
import {instrumentCallbackCopyIntervals} from '../../experiments/react19-reducer/callback-copy-transform.mjs';
export const callbackCopyCases=Object.freeze(['new','before','sibling','nested-reuse','wrong-equal','two-new','getter','stack-getter','proxy-config','proxy-item','prototype-setter','throw-getter','stop-getter','seal-getter','iterator-mutate','iterator-throw','weakmap-get','array-push']);
export const callbackCopyApplication=`'use strict';
var trace=[],first={private:'private-synthetic'},second={private:'private-synthetic'},shared=null,sentinel={},sameThrown=false,valueProxyTraps=0,helperFrame=false,iteratorCalls=0,originalIterator,intrinsicCalls=0,originalWeakGet,originalPush;
function Row(){throw Error('Component must not execute');}
if(caseName==='proxy-item')first=new Proxy(first,{get(){valueProxyTraps++;throw sentinel;},ownKeys(){valueProxyTraps++;throw sentinel;},getOwnPropertyDescriptor(){valueProxyTraps++;throw sentinel;}});
var rows=caseName==='two-new'||caseName==='sibling'?[first,caseName==='sibling'?first:second]:[first];
function configFor(item){
 var config={todo:caseName==='wrong-equal'?second:item};
 if(caseName==='getter'||caseName==='stack-getter'||caseName==='throw-getter'||caseName==='stop-getter'||caseName==='seal-getter'){
  config={};Object.defineProperty(config,'todo',{enumerable:true,get(){trace.push('get');if(caseName==='throw-getter')throw sentinel;if(caseName==='stop-getter')control.stop();if(caseName==='seal-getter')control.seal();if(caseName==='stack-getter'){helperFrame=/__saPropCopyTap|Object\\.(returned|tap|enter|exit)|forwarded/.test(String(new Error().stack));return helperFrame?second:item;}return item;}});
 }
 if(caseName==='proxy-config')config=new Proxy(config,{get(t,k,r){trace.push('get:'+String(k));return Reflect.get(t,k,r);},ownKeys(t){trace.push('keys');return Reflect.ownKeys(t);},getOwnPropertyDescriptor(t,k){trace.push('descriptor:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k);},has(t,k){trace.push('has:'+String(k));return Reflect.has(t,k);}});
 return config;
}
function nested(rows){return rows.map(item=>exports.createElement(Row,configFor(item)));}
function application(rows){
 if(caseName==='before')shared=exports.createElement(Row,configFor(rows[0]));
 return rows.filter(item=>true).map(item=>{
  trace.push('callback');
  if(caseName==='before')return shared;
  if(caseName==='sibling'){if(!shared)shared=exports.createElement(Row,configFor(item));return shared;}
  if(caseName==='nested-reuse')return nested([item])[0];
  var config=configFor(item);
  if(caseName==='iterator-mutate'||caseName==='iterator-throw'){
   originalIterator=Array.prototype[Symbol.iterator];Array.prototype[Symbol.iterator]=function(){iteratorCalls++;if(caseName==='iterator-throw')throw sentinel;config.todo=second;return originalIterator.call(this);};
  }
  if(caseName==='weakmap-get'){originalWeakGet=WeakMap.prototype.get;WeakMap.prototype.get=function(){intrinsicCalls++;throw sentinel;};}
  if(caseName==='array-push'){originalPush=Array.prototype.push;Array.prototype.push=function(){intrinsicCalls++;throw sentinel;};}
  return exports.createElement(Row,config);
 });
}
var result=[];
if(caseName==='prototype-setter')Object.defineProperty(Object.prototype,'todo',{configurable:true,set(value){trace.push('setter');this.escaped=value;}});
try{result=application(rows);}catch(error){sameThrown=error===sentinel;if(!sameThrown)throw error;}
finally{if(caseName==='prototype-setter')delete Object.prototype.todo;if(originalIterator)Array.prototype[Symbol.iterator]=originalIterator;if(originalWeakGet)WeakMap.prototype.get=originalWeakGet;if(originalPush)Array.prototype.push=originalPush;}
var firstProps=result[0]?Object.getOwnPropertyDescriptor(result[0].props,'todo'):null;
var secondProps=result[1]?Object.getOwnPropertyDescriptor(result[1].props,'todo'):null;
var summary={count:result.length,ownsTodo:!!firstProps,todoMatches:!!firstProps&&firstProps.value===first,secondMatches:!!secondProps&&secondProps.value===second,distinctElements:result.length===2?result[0]!==result[1]:null,sameThrown,iteratorCalls,intrinsicCalls,valueProxyTraps,helperFrame};
`;
export function executeCallbackCopySource({source,caseName,mode='on'}){
 if(!callbackCopyCases.includes(caseName)||!['original','off','on'].includes(mode))throw Error('Unknown owned callback source control');
 const context=vm.createContext({exports:{},caseName,process:{env:{NODE_ENV:'development'}},console:{log(){},warn(){},error(){}}});
 const bootstrap=`'use strict';const createPropCopyObserver=${createPropCopyObserver.toString()};globalThis.__sa_callback_copy=(${createCallbackCopyObserver.toString()})({page:'callback-source:'+caseName,enabled:${mode==='on'}});globalThis.__sa_array_calls=__sa_callback_copy.arrayRuntime;globalThis.control={stop(){${mode==='on'?'__sa_callback_copy.stop();':''}},seal(){${mode==='on'?'__sa_callback_copy.sealWindow();':''}}};${mode==='on'?"globalThis.__STATEATOM_REACT19_PROP_COPY__=__sa_callback_copy.tap;":''}`;
 new vm.Script(bootstrap,{filename:'owned-recorder-bootstrap.js'}).runInContext(context,{timeout:5000});
 new vm.Script(source,{filename:'retained-react-source.cjs'}).runInContext(context,{timeout:5000});
 const receipt=instrumentCallbackCopyIntervals(callbackCopyApplication,'owned-callback-application.js',{enabled:mode!=='original',sourceType:'script'});
 if(mode!=='original'&&(receipt.skipped||receipt.intervalSites.length!==2))throw Error('Owned callback application grammar refused');
 new vm.Script(receipt.code,{filename:'owned-callback-application.js'}).runInContext(context,{timeout:5000});
 context.__sa_callback_copy.sealWindow();
 const selected=[];for(let i=0;i<context.result.length;i++)selected.push(context.__sa_callback_copy.lookup(context.result[i]));
 const out={summary:context.summary,trace:context.trace,snapshot:context.__sa_callback_copy.snapshot(),selected,retention:context.__sa_callback_copy.retention(),receipt:{...receipt,code:undefined,generatedDigest:createHash('sha256').update(receipt.code).digest('hex')},sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0,modelCalls:0};
 return JSON.parse(JSON.stringify(out));
}
