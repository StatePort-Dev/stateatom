// SPDX-License-Identifier: Apache-2.0
// Authored synthetic grammar/configs. No copied vendor runtime or browser evidence.
import vm from 'node:vm';
import {createPropCopyObserver} from '../../experiments/react19-reducer/prop-copy-observer.mjs';
export const propCopySyntheticGrammar=`'use strict';
function ReactElement(type, key, props, owner, debugStack, debugTask) {
 type = {type: type, props: props}; Object.freeze(props); Object.freeze(type); return type;
}
exports.createElement = function (type, config, children) {
 var i, propName; i = {};
 if (config != null) for (propName in config) if (Object.prototype.hasOwnProperty.call(config,propName)) i[propName] = config[propName];
 var defaults=type.defaultProps;
 if(defaults) for(propName in defaults) if(i[propName]===undefined) i[propName]=defaults[propName];
 return ReactElement(type, null, i, null, null, null);
};
exports.cloneElement = function (element, config) {var props=Object.assign({},element.props,config); return ReactElement(element.type,null,props,null,null,null);};`;
export const propCopyCases=Object.freeze(['object','equal-two','getter','proxy-config','proxy-value','stack-getter','throw-getter','prototype-setter','stop-getter','seal-getter','default-todo','clone','primitive']);
const scenario=`'use strict';
var trace=[], row={text:'synthetic-private-value'}, secondRow={text:'synthetic-private-value'}, finalElement, firstElement, sentinel=Object.freeze({fixtureError:true}), sameThrown=false, getterHelperFrame=false, proxyValueTraps=0;
function Todo(){throw Error('Component must not execute in a construction-input source control');}
var config={todo:row};
if(caseName==='getter'||caseName==='stack-getter'||caseName==='stop-getter'||caseName==='seal-getter'||caseName==='throw-getter'){
 config={};Object.defineProperty(config,'todo',{enumerable:true,get(){trace.push('get:todo');if(caseName==='throw-getter')throw sentinel;if(caseName==='stop-getter')control.stop();if(caseName==='seal-getter')control.seal();if(caseName==='stack-getter'){getterHelperFrame=String(new Error().stack).includes('__saPropCopyTap');return getterHelperFrame?secondRow:row;}return row;}});
}
if(caseName==='proxy-config')config=new Proxy(config,{get(t,k,r){trace.push('proxy:get:'+String(k));return Reflect.get(t,k,r);},ownKeys(t){trace.push('proxy:ownKeys');return Reflect.ownKeys(t);},getOwnPropertyDescriptor(t,k){trace.push('proxy:descriptor:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k);},has(t,k){trace.push('proxy:has:'+String(k));return Reflect.has(t,k);}});
if(caseName==='proxy-value'){row=new Proxy(row,{get(){proxyValueTraps++;throw Error('value get');},ownKeys(){proxyValueTraps++;throw Error('value keys');},getOwnPropertyDescriptor(){proxyValueTraps++;throw Error('value descriptor');}});config={todo:row};}
if(caseName==='prototype-setter')Object.defineProperty(Object.prototype,'todo',{configurable:true,set(value){trace.push('set:todo');this.escaped=value;}});
if(caseName==='default-todo'){Todo.defaultProps={todo:row};config={};}
if(caseName==='primitive')config={todo:'synthetic-private-scalar'};
try{
 if(caseName==='equal-two'){firstElement=exports.createElement(Todo,{todo:row});finalElement=exports.createElement(Todo,{todo:secondRow});}
 else if(caseName==='clone'){firstElement=exports.createElement(Todo,{todo:row});finalElement=exports.cloneElement(firstElement,{todo:secondRow});}
 else finalElement=exports.createElement(Todo,config);
}catch(error){sameThrown=error===sentinel;if(!sameThrown)throw error;}
finally{if(caseName==='prototype-setter')delete Object.prototype.todo;}
var ownTodo=finalElement?Object.getOwnPropertyDescriptor(finalElement.props,'todo'):null;
var expectedRow=caseName==='equal-two'||caseName==='clone'?secondRow:row;
var summary={hasElement:!!finalElement,ownsTodo:!!ownTodo,todoMatches:!!ownTodo&&ownTodo.value===expectedRow,todoType:ownTodo?typeof ownTodo.value:'missing',sameThrown,distinctRows:row!==secondRow};
`;
export function executePropCopySource({source,caseName,mode='on',hook='normal'}){
 if(!propCopyCases.includes(caseName)||!['original','off','on'].includes(mode)||!['normal','missing','accessor','throwing'].includes(hook))throw Error('Unknown owned source-control mode');
 const observer=createPropCopyObserver({page:'prop-source:'+caseName}),copyRefs=[];let hookGetterReads=0;
 const context=vm.createContext({exports:{},process:{env:{NODE_ENV:'development'}},console:{log(){},warn(){},error(){}},caseName,control:{stop(){if(mode==='on')observer.stop();},seal(){if(mode==='on')observer.sealWindow();}}});
 if(mode==='on'&&hook!=='missing'){
  if(hook==='accessor')Object.defineProperty(context,'__STATEATOM_REACT19_PROP_COPY__',{get(){hookGetterReads++;throw Error('tap getter');}});
  else context.__STATEATOM_REACT19_PROP_COPY__=(...args)=>{if(hook==='throwing')throw Error('observer failure');if(args[0]==='copy-input'&&args[3]==='todo')copyRefs.push({value:args[1],props:args[2]});return observer.tap(...args);};
 }
 new vm.Script(source,{filename:'owned-react-source.cjs'}).runInContext(context,{timeout:5000});
 new vm.Script(scenario,{filename:'owned-prop-config-fixture.js'}).runInContext(context,{timeout:5000});
 observer.sealWindow();
 return {summary:JSON.parse(JSON.stringify(context.summary)),trace:JSON.parse(JSON.stringify(context.trace)),snapshot:observer.snapshot(),selected:observer.lookup(context.finalElement),getterHelperFrame:context.getterHelperFrame,proxyValueTraps:context.proxyValueTraps,hookGetterReads,copyInputs:copyRefs.length,copyIntoSelectedProps:!!context.finalElement&&copyRefs.some(x=>x.props===context.finalElement.props),copyInputsMatchRows:copyRefs.every(x=>x.value===context.row||x.value===context.secondRow),sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0};
}
