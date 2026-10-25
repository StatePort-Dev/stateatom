// SPDX-License-Identifier: Apache-2.0
// Owned compiled JSX configs; original app/framework bodies are never fabricated.
import vm from 'node:vm';
import {transform} from 'esbuild';
import {createHash} from 'node:crypto';
import {createJSXConfigInputObserver} from '../../experiments/react19-reducer/jsx-config-observer.mjs';
import {instrumentJSXConfigInputs} from '../../experiments/react19-reducer/jsx-config-transform.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
export const jsxConfigCases=Object.freeze(['ordinary','two','expression-getter','key-getter','proxy-value','proxy-config','alias','spread','accessor','computed','own-key','prototype-key','freeze-mutate','primitive','clone','stop-expression','seal-expression','iterator-mutate','iterator-throw','descriptor-replaced']);
export const syntheticReactCore=`exports.cloneElement=function(element,config){return {props:Object.assign({},element.props,config)};};`;
export const syntheticJSXSource=`'use strict';function ReactElement(type,key,props,owner,debugStack,debugTask){type={props};Object.freeze(props);Object.freeze(type);return type;}exports.jsx=function(type,config,key){var props=config;if('key' in config){props={};for(var name in config)if(name!=='key')props[name]=config[name];}return ReactElement(type,key,props,null,null,null);};exports.jsxs=exports.jsx;`;
export function jsxCaseSource(caseName){
 if(!jsxConfigCases.includes(caseName))throw Error('Unknown owned JSX source case');
 let config='{todo:row,dispatch}',key="'fixed-key'",action='';
 if(['expression-getter','stop-expression','seal-expression'].includes(caseName))config='{todo:readRow(),dispatch}';
 if(caseName==='key-getter'){config='{todo:readRow(),dispatch}';key='row.id';}
 if(caseName==='alias')config='supplied';
 if(caseName==='proxy-config')config='proxyConfig';
 if(caseName==='spread')config='{todo:row,...extra}';
 if(caseName==='accessor')config="{get todo(){reads++;trace.push('field-get');return row;},dispatch}";
 if(caseName==='computed')config="{['todo']:row,dispatch}";
 if(caseName==='own-key')config="{todo:row,key:'embedded-key',dispatch}";
 if(caseName==='primitive')config="{todo:'synthetic-private-scalar',dispatch}";
 if(caseName==='prototype-key')action="Object.defineProperty(Object.prototype,'key',{configurable:true,enumerable:true,value:'prototype-key'});";
 if(caseName==='freeze-mutate')action="Object.freeze=function(value){freezeCalls++;if(nativeOwn(value,'todo'))value.todo=second;return nativeFreeze(value);};";
 if(caseName==='iterator-mutate'||caseName==='iterator-throw')action="Array.prototype[Symbol.iterator]=function(){iteratorCalls++;mutation++;"+(caseName==='iterator-throw'?'throw sentinel;':'return nativeApply(savedIterator,this,[]);')+"};";
 if(caseName==='descriptor-replaced')action="Object.getOwnPropertyDescriptor=function(){descriptorCalls++;throw sentinel;};";
 const call=`finalElement=make(Row,${config},${key});`;
 const calls=caseName==='two'?call+"secondElement=make(Row,{todo:second,dispatch},'second');":caseName==='clone'?call+'finalElement=retainedReact.cloneElement(finalElement,{todo:row});':call;
 return `import {jsx as make} from 'react/jsx-runtime';
const nativeOwn=Object.getOwnPropertyDescriptor,nativeFreeze=Object.freeze,nativeApply=Reflect.apply,savedIterator=Array.prototype[Symbol.iterator];
let row={private:'synthetic-private'},second={private:'synthetic-private'},trace=[],reads=0,keyReads=0,valueTraps=0,iteratorCalls=0,mutation=0,freezeCalls=0,descriptorCalls=0,helperFrame=false,sentinel={},sameThrown=false,finalElement,secondElement;
function Row(){throw Error('Component must not execute');}function dispatch(){}
if(caseName==='proxy-value')row=new Proxy(row,{get(){valueTraps++;throw sentinel;},getOwnPropertyDescriptor(){valueTraps++;throw sentinel;},ownKeys(){valueTraps++;throw sentinel;}});
if(caseName==='key-getter')Object.defineProperty(row,'id',{get(){keyReads++;trace.push('key');helperFrame=helperFrame||/Object\\.tap|__saJSXCfgInput|__saJSXNativeTap/.test(String(new Error().stack));return 'key';}});
function readRow(){reads++;trace.push('todo');helperFrame=helperFrame||/Object\\.tap|__saJSXCfgInput|__saJSXNativeTap/.test(String(new Error().stack));if(caseName==='stop-expression')control.stop();if(caseName==='seal-expression')control.seal();return row;}
const supplied={todo:row,dispatch},extra={todo:second},proxyConfig=new Proxy({todo:row,dispatch},{get(t,k,r){trace.push('proxy:get:'+String(k));return Reflect.get(t,k,r);},ownKeys(t){trace.push('proxy:keys');return Reflect.ownKeys(t);},getOwnPropertyDescriptor(t,k){trace.push('proxy:descriptor:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k);},has(t,k){trace.push('proxy:has:'+String(k));return Reflect.has(t,k);}});
try{${action}${calls}}catch(e){sameThrown=e===sentinel;if(!sameThrown)throw e;}
finally{Object.freeze=nativeFreeze;Object.getOwnPropertyDescriptor=nativeOwn;Array.prototype[Symbol.iterator]=savedIterator;if(caseName==='prototype-key')delete Object.prototype.key;}
const d=finalElement?nativeOwn(finalElement.props,'todo'):null,e=secondElement?nativeOwn(secondElement.props,'todo'):null;
globalThis.fixtureRow=row;globalThis.fixtureSecond=second;globalThis.fixtureElement=finalElement;globalThis.fixtureSecondElement=secondElement;
globalThis.fixtureTrace=trace;globalThis.fixtureSummary={hasElement:!!finalElement,storedIsRow:!!d&&Object.prototype.hasOwnProperty.call(d,'value')&&d.value===row,storedIsSecond:!!d&&d.value===second,secondStoredIsSecond:!!e&&e.value===second,accessorStillPresent:!!d&&typeof d.get==='function',sameThrown,reads,keyReads,valueTraps,iteratorCalls,mutation,freezeCalls,descriptorCalls,helperFrame};`;
}
export async function prepareJSXConfigCase({caseName,mode='on'}){
 if(!['original','off','on'].includes(mode))throw Error('Unknown owned JSX source mode');
 const source=jsxCaseSource(caseName),receipt=instrumentJSXConfigInputs(source,'owned-jsx-'+caseName+'.js',{enabled:mode!=='original'});
 const compiled=await transform(receipt.code,{loader:'js',format:'cjs',target:'es2022',legalComments:'inline'});
 return{caseName,mode,code:compiled.code,sourceDigest:hash(source),compiledDigest:hash(compiled.code),receipt:{...receipt,code:undefined}};
}
export function executeJSXConfigCase({reactSource,jsxSource,prepared,hook='normal'}){
 if(!['normal','missing','accessor','throwing'].includes(hook))throw Error('Unknown JSX metadata hook control');
 const{caseName,mode}=prepared;const context=vm.createContext({exports:{},process:{env:{NODE_ENV:'development'}},caseName});
 const bootstrap=`'use strict';globalThis.warnings=0;globalThis.console={log(){},warn(){warnings++;},error(){warnings++;}};globalThis.observer=(${createJSXConfigInputObserver.toString()})({page:'jsx-source:'+caseName});globalThis.inputRefs=[];globalThis.hookGetterReads=0;
const nativeDefine=Object.defineProperty;globalThis.control={stop(){${mode==='on'?'observer.stop();':''}},seal(){${mode==='on'?'observer.sealWindow();':''}}};
${mode==='on'&&hook==='accessor'?"Object.defineProperty(globalThis,'__STATEATOM_REACT19_JSX_INPUT__',{get(){hookGetterReads++;throw Error('tap getter');}});":mode==='on'&&hook!=='missing'?"globalThis.__STATEATOM_REACT19_JSX_INPUT__=function(kind,value,config,site){"+(hook==='throwing'?"throw Error('owned telemetry failure');":"if(kind==='config-input')nativeDefine(inputRefs,inputRefs.length,{value:{value,config},enumerable:true,writable:true,configurable:true});return observer.tap(kind,value,config,site);")+"};":''}`;
 new vm.Script(bootstrap,{filename:'owned-jsx-bootstrap.js'}).runInContext(context,{timeout:5000});
 new vm.Script(reactSource,{filename:'retained-react-core.cjs'}).runInContext(context,{timeout:5000});const react=context.exports;context.retainedReact=react;context.exports={};
 context.require=name=>{if(name==='react')return react;throw Error('Unknown retained module');};
 new vm.Script(jsxSource,{filename:'retained-jsx-source.cjs'}).runInContext(context,{timeout:5000});const jsx=context.exports;context.exports={};
 context.require=name=>{if(name==='react/jsx-runtime')return jsx;throw Error('Unknown owned application import');};
 new vm.Script(prepared.code,{filename:'owned-compiled-jsx-case.cjs'}).runInContext(context,{timeout:5000});context.observer.sealWindow();
 const inputOracle=[];for(let i=0;i<context.inputRefs.length;i++){const r=context.inputRefs[i];inputOracle.push({isOriginalRow:r.value===context.fixtureRow,isSecondRow:r.value===context.fixtureSecond,isSelectedProps:!!context.fixtureElement&&r.config===context.fixtureElement.props});}
 const out={summary:context.fixtureSummary,trace:context.fixtureTrace,warnings:context.warnings,snapshot:context.observer.snapshot(),selected:context.observer.lookup(context.fixtureElement),secondSelected:context.observer.lookup(context.fixtureSecondElement),retention:context.observer.retention(),inputOracle,hookGetterReads:context.hookGetterReads,prepared:{caseName,mode,sourceDigest:prepared.sourceDigest,compiledDigest:prepared.compiledDigest,receipt:prepared.receipt},sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0,modelCalls:0};
 return JSON.parse(JSON.stringify(out));
}
