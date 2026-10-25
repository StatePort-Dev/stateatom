// SPDX-License-Identifier: Apache-2.0
// Authored source-only controls. Every CJS module has its own lexical wrapper.
import vm from 'node:vm';
import {transform} from 'esbuild';
import {createHash} from 'node:crypto';
import {createPropCopyObserver} from '../../experiments/react19-reducer/prop-copy-observer.mjs';
import {createJSXConfigInputObserver} from '../../experiments/react19-reducer/jsx-config-observer.mjs';
import {createCallbackCopyObserver} from '../../experiments/react19-reducer/callback-copy-observer.mjs';
import {instrumentCallbackCopyIntervals} from '../../experiments/react19-reducer/callback-copy-transform.mjs';
import {instrumentJSXConfigInputs} from '../../experiments/react19-reducer/jsx-config-transform.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
export const expectedCallbackJSXLinks=Object.freeze({'ordinary':1,'two':2,'wrong-equal':0,'reassign':0,'before':0,'sibling':0,'nested-reuse':0,'nested-own':2,'expression-getter':1,'key-getter':1,'throw-expression':0,'throw-key':0,'freeze-mutate':1,'freeze-throw':0,'prototype-key':0,'clone':0,'stop-expression':0,'seal-expression':0,'proxy-item':1,'iterator-mutate':1,'iterator-throw':1,'weakmap-get':1,'array-push':1,'descriptor-replaced':1,'throw-after-first':0,'classic-new':1,'foreign-map':0,'alias':0,'spread':0,'accessor':0});
export const callbackJSXCases=Object.freeze(Object.keys(expectedCallbackJSXLinks));
export const syntheticClassicCore="'use strict';function ReactElement(type,key,props,owner,debugStack,debugTask){type={props};Object.freeze(props);Object.freeze(type);return type;}exports.createElement=function(type,config,children){var i;i={};for(var propName in config)i[propName]=config[propName];return ReactElement(type,null,i,null,null,null);};exports.cloneElement=function(element,config){return {props:Object.assign({},element.props,config)};};";
export function callbackJSXCaseSource(caseName){
 if(!callbackJSXCases.includes(caseName))throw Error('Unknown owned callback JSX case');
 let config='{todo:item,dispatch}',key="'fixed-key'",body='',before='',action='';
 if(['expression-getter','throw-expression','stop-expression','seal-expression'].includes(caseName))config='{todo:readRow(item),dispatch}';
 if(['key-getter','throw-key'].includes(caseName))key='item.id';
 if(caseName==='wrong-equal')config='{todo:second,dispatch}';
 if(caseName==='reassign')body+='item=second;';
 if(caseName==='alias')config='supplied';
 if(caseName==='spread')config='{todo:item,...extra}';
 if(caseName==='accessor')config='{get todo(){reads++;return item;},dispatch}';
 const value=caseName==='wrong-equal'?'second':['expression-getter','throw-expression','stop-expression','seal-expression'].includes(caseName)?'readRow(item)':'item';
 const jsxCall=caseName==='classic-new'?'retainedReact.createElement(Row,'+config+')':['alias','spread','accessor'].includes(caseName)?'make(Row,'+config+','+key+')':'<Row todo={'+value+'} dispatch={dispatch} key={'+key+'}/>';
 if(caseName==='before')before="shared=make(Row,{todo:first,dispatch},'before');";
 if(caseName==='before')body+='return shared;';
 else if(caseName==='sibling')body+="if(!shared)shared=make(Row,{todo:item,dispatch},'sibling');return shared;";
 else if(caseName==='nested-reuse')body+='return nested([item])[0];';
 else if(caseName==='nested-own')body+="nested([item]);return "+jsxCall+";";
 else if(caseName==='clone')body+='return retainedReact.cloneElement('+jsxCall+',{todo:item});';
 else body+='return '+jsxCall+';';
 if(caseName==='prototype-key')action="Object.defineProperty(Object.prototype,'key',{configurable:true,enumerable:true,value:'proto-key'});";
 if(caseName==='freeze-mutate'||caseName==='freeze-throw')action="Object.freeze=function(value){freezeCalls++;if(nativeOwn(value,'todo')){"+(caseName==='freeze-throw'?'throw sentinel;':'value.todo=second;')+"}return nativeFreeze(value);};";
 if(caseName==='iterator-mutate'||caseName==='iterator-throw')action="Array.prototype[Symbol.iterator]=function(){iteratorCalls++;"+(caseName==='iterator-throw'?'throw sentinel;':'first=second;return nativeApply(savedIterator,this,[]);')+"};";
 if(caseName==='weakmap-get')action="WeakMap.prototype.get=function(){intrinsicCalls++;throw sentinel;};";
 if(caseName==='array-push')action="Array.prototype.push=function(){intrinsicCalls++;throw sentinel;};";
 if(caseName==='descriptor-replaced')action="Object.getOwnPropertyDescriptor=function(){intrinsicCalls++;throw sentinel;};";
 const nested=['nested-reuse','nested-own'].includes(caseName)?"function nested(rows){return rows.map(item=>make(Row,{todo:item,dispatch},'nested'));}":'';
 return "import {jsx as make} from 'react/jsx-runtime';\n"+
 "const nativeOwn=Object.getOwnPropertyDescriptor,nativeFreeze=Object.freeze,nativeApply=Reflect.apply,savedIterator=Array.prototype[Symbol.iterator],savedGet=WeakMap.prototype.get,savedPush=Array.prototype.push;\n"+
 "let first={private:'private-owned'},second={private:'private-owned'},shared=null,sentinel={},trace=[],reads=0,keyReads=0,valueTraps=0,iteratorCalls=0,intrinsicCalls=0,freezeCalls=0,helperFrame=false,lexicalOK=true,sameThrown=false,result=[],callbackLength=null;\n"+
 "function Row(){throw Error('Component must not execute');}function dispatch(){}const supplied={todo:first,dispatch},extra={todo:second};\n"+
 "if(caseName==='proxy-item')first=new Proxy(first,{get(){valueTraps++;throw sentinel;},ownKeys(){valueTraps++;throw sentinel;},getOwnPropertyDescriptor(){valueTraps++;throw sentinel;}});\n"+
 "if(caseName==='key-getter'||caseName==='throw-key')Object.defineProperty(first,'id',{get(){keyReads++;trace[trace.length]='key';helperFrame=helperFrame||/__saJSX|Object\\.(tap|returned|enter|exit)/.test(String(new Error().stack));if(caseName==='throw-key')throw sentinel;return 'key';}});\n"+
 "function readRow(item){reads++;trace[trace.length]='read';helperFrame=helperFrame||/__saJSX|Object\\.(tap|returned|enter|exit)/.test(String(new Error().stack));if(caseName==='throw-expression')throw sentinel;if(caseName==='stop-expression')control.stop();if(caseName==='seal-expression')control.seal();return item;}\n"+
 nested+"\n"+
 "function application(rows){"+before+"return rows.filter(item=>true).map(item=>{trace[trace.length]='callback';lexicalOK=lexicalOK&&this===owner&&arguments[0]===rows&&new.target===undefined;if(caseName==='throw-after-first'&&item===second)throw sentinel;"+body+"});}\n"+
 "const rows=caseName==='two'||caseName==='throw-after-first'?[first,second]:caseName==='sibling'?[first,first]:[first],owner={};\n"+
 "if(caseName==='foreign-map')Object.defineProperty(Array.prototype,'map',{value:function(cb){callbackLength=cb.length;return nativeApply(nativeMap,this,[cb]);},configurable:true,writable:true});\n"+
 "try{"+action+"result=application.call(owner,rows);}catch(error){sameThrown=error===sentinel;if(!sameThrown)throw error;}\n"+
 "finally{Object.freeze=nativeFreeze;Object.getOwnPropertyDescriptor=nativeOwn;Array.prototype[Symbol.iterator]=savedIterator;WeakMap.prototype.get=savedGet;Array.prototype.push=savedPush;if(caseName==='prototype-key')delete Object.prototype.key;if(caseName==='foreign-map')Object.defineProperty(Array.prototype,'map',{value:nativeMap,configurable:true,writable:true});}\n"+
 "const d=result[0]?nativeOwn(result[0].props,'todo'):null;globalThis.fixtureFirst=first;globalThis.fixtureSecond=second;globalThis.fixtureResult=result;globalThis.fixtureTrace=trace;globalThis.fixtureSummary={count:result.length,storedFirst:!!d&&d.value===first,storedSecond:!!d&&d.value===second,sameThrown,reads,keyReads,valueTraps,iteratorCalls,intrinsicCalls,freezeCalls,helperFrame,lexicalOK,callbackLength};";
}
export async function prepareCallbackJSXCase({caseName,mode='on'}={}){
 if(!['original','off','on'].includes(mode))throw Error('Unknown owned callback JSX mode');
 const source=callbackJSXCaseSource(caseName),interval=instrumentCallbackCopyIntervals(source,'owned-callback-'+caseName+'.jsx',{enabled:mode!=='original'});
 if(mode!=='original'&&(interval.skipped||interval.intervalSites.length!==(['nested-reuse','nested-own'].includes(caseName)?2:1)))throw Error('Owned callback interval grammar refused: '+caseName);
 const lowered=await transform(interval.code,{loader:'jsx',jsx:'automatic',format:'esm',target:'es2022',sourcefile:'owned-callback-'+caseName+'.jsx'});
 const config=instrumentJSXConfigInputs(lowered.code,'owned-compiled-'+caseName+'.js',{enabled:mode!=='original'});
 const compiled=await transform(config.code,{loader:'js',format:'cjs',target:'es2022',legalComments:'inline'});
 return{caseName,mode,code:compiled.code,sourceDigest:hash(source),compiledDigest:hash(compiled.code),intervalReceipt:{...interval,code:undefined},configReceipt:{...config,code:undefined}};
}
export function executeCallbackJSXCase({reactSource,jsxSource,prepared,hook='normal'}){
 if(!['normal','missing','accessor','throwing'].includes(hook))throw Error('Unknown owned callback hook');
 const{caseName,mode}=prepared,classic=caseName==='classic-new',context=vm.createContext({caseName,process:{env:{NODE_ENV:'development'}}});
 const bootstrap="'use strict';globalThis.warnings=0;globalThis.console={log(){},warn(){warnings++;},error(){warnings++;}};const createPropCopyObserver="+createPropCopyObserver.toString()+";const createJSXConfigInputObserver="+createJSXConfigInputObserver.toString()+";globalThis.__sa_callback_copy=("+createCallbackCopyObserver.toString()+")({page:'callback-jsx-source:'+caseName,enabled:"+(mode==='on')+",inputProfile:'"+(classic?'classic-copy':'jsx-config')+"'});globalThis.__sa_array_calls=__sa_callback_copy.arrayRuntime;globalThis.nativeMap=Array.prototype.map;globalThis.control={stop(){"+(mode==='on'?'__sa_callback_copy.stop();':'')+"},seal(){"+(mode==='on'?'__sa_callback_copy.sealWindow();':'')+"}};globalThis.inputRefs=[];globalThis.hookGetterReads=0;const nativeDefine=Object.defineProperty;"+
 (mode==='on'&&hook==='accessor'?"Object.defineProperty(globalThis,'"+(classic?'__STATEATOM_REACT19_PROP_COPY__':'__STATEATOM_REACT19_JSX_INPUT__')+"',{get(){hookGetterReads++;throw Error('hook getter');}});":mode==='on'&&hook!=='missing'?"globalThis."+(classic?'__STATEATOM_REACT19_PROP_COPY__':'__STATEATOM_REACT19_JSX_INPUT__')+"=function(kind,value,config,site){"+(hook==='throwing'?"throw Error('owned telemetry failure');":"if(kind==='config-input'||kind==='copy-input'&&site==='todo')nativeDefine(inputRefs,inputRefs.length,{value:{value,config},enumerable:true,writable:true,configurable:true});if(kind==='jsx-element-return'||kind==='element-return')for(let i=0;i<inputRefs.length;i++)if(inputRefs[i].config===config)nativeDefine(inputRefs[i],'element',{value,enumerable:true,configurable:true});return __sa_callback_copy.tap(kind,value,config,site);")+"};":'');
 new vm.Script(bootstrap,{filename:'owned-callback-jsx-bootstrap.js'}).runInContext(context,{timeout:5000});
 function module(source,name,require){context.require=require;context.module={exports:{}};context.exports=context.module.exports;new vm.Script('(function(require,exports,module){'+source+'\n})(require,exports,module);',{filename:name}).runInContext(context,{timeout:5000});return context.module.exports;}
 const react=module(reactSource,'retained-react-core.cjs',()=>{throw Error('Unknown React dependency');});context.retainedReact=react;
 const jsx=module(jsxSource,'retained-jsx-runtime.cjs',name=>{if(name==='react')return react;throw Error('Unknown JSX dependency');});
 module(prepared.code,'owned-callback-app.cjs',name=>{if(name==='react/jsx-runtime')return jsx;throw Error('Unknown app dependency');});
 context.__sa_callback_copy.sealWindow();
 const selected=[],identityOracle=[];for(let i=0;i<context.fixtureResult.length;i++)selected.push(context.__sa_callback_copy.lookup(context.fixtureResult[i]));
 for(let i=0;i<context.inputRefs.length;i++){const r=context.inputRefs[i];if(r.element)identityOracle.push({valueIsOriginalCallbackItem:r.value===context.fixtureFirst||caseName==='two'&&r.value===context.fixtureSecond,configIsReturnedProps:r.config===r.element.props});}
 const out={summary:context.fixtureSummary,trace:context.fixtureTrace,warnings:context.warnings,snapshot:context.__sa_callback_copy.snapshot(),selected,retention:context.__sa_callback_copy.retention(),identityOracle,hookGetterReads:context.hookGetterReads,prepared:{...prepared,code:undefined},sourceOnly:true,fixtureInputsOnly:true,browserStarted:false,nativeWriterCalls:0,modelCalls:0};
 return JSON.parse(JSON.stringify(out));
}
