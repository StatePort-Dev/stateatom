// SPDX-License-Identifier: Apache-2.0
// Owned source-only controls. Hook controls never claim React/Router lifecycle.
import vm from 'node:vm';
import {transform} from 'esbuild';
import {createHash} from 'node:crypto';
import {instrumentMainInputBridge} from '../../experiments/react19-reducer/main-input-transform.mjs';
import {instrumentJSXConfigInputs} from '../../experiments/react19-reducer/jsx-config-transform.mjs';
import {createPropCopyObserver} from '../../experiments/react19-reducer/prop-copy-observer.mjs';
import {createJSXConfigInputObserver} from '../../experiments/react19-reducer/jsx-config-observer.mjs';
import {createCallbackCopyObserver} from '../../experiments/react19-reducer/callback-copy-observer.mjs';
import {createMainInputObserver} from '../../experiments/react19-reducer/main-input-observer.mjs';
export const mainInputCases=Object.freeze(['ordinary-one','two-equal-rows','active-filter','completed-filter','todos-getter','completed-getter','id-getter','throw-todos','throw-completed','throw-id','memo-skipped','foreign-filter','foreign-map','cross-invocation-memo','stop-in-key','seal-in-key','empty-filter','weak-cleared']);
export const expectedMainInputLinks=Object.freeze({'ordinary-one':1,'two-equal-rows':2,'active-filter':1,'completed-filter':1,'todos-getter':1,'completed-getter':1,'id-getter':1,'throw-todos':0,'throw-completed':0,'throw-id':0,'memo-skipped':0,'foreign-filter':0,'foreign-map':0,'cross-invocation-memo':0,'stop-in-key':0,'seal-in-key':0,'empty-filter':0,'weak-cleared':0});
export function mainInputFactory(){return '(()=>{const createPropCopyObserver='+createPropCopyObserver.toString()+';const createJSXConfigInputObserver='+createJSXConfigInputObserver.toString()+';const createCallbackCopyObserver='+createCallbackCopyObserver.toString()+';return '+createMainInputObserver.toString()+';})()';}

const hash=s=>createHash('sha256').update(s).digest('hex');
export async function prepareMainInputApplication(source,file){
 const bridge=instrumentMainInputBridge(source,file,{enabled:true});
 if(bridge.skipped)throw Error('Main source profile refused: '+JSON.stringify(bridge.unsupported));
 const common={loader:'jsx',jsx:'automatic',format:'esm',target:'es2022',sourcefile:file,tsconfigRaw:{compilerOptions:{}}};
 const original=await transform(source,common),lowered=await transform(bridge.code,common);
 const config=instrumentJSXConfigInputs(lowered.code,'main-input-lowered.js',{enabled:true});
 if(config.skipped||config.sites.length!==2)throw Error('Closed Main JSX config sites refused');
 const originalCJS=await transform(original.code,{loader:'js',format:'cjs',target:'es2022',tsconfigRaw:{compilerOptions:{}}});
 const observedCJS=await transform(config.code,{loader:'js',format:'cjs',target:'es2022',tsconfigRaw:{compilerOptions:{}}});
 return{originalCode:originalCJS.code,observedCode:observedCJS.code,loweredCode:lowered.code,configCode:config.code,
  policy:{mainSite:bridge.mainSite,filterSite:bridge.filterSite,mapSite:bridge.mapSite},
  receipt:{schema:'stateatom.main-input-application-receipt/1',sourceDigest:hash(source),file,originalCompiledDigest:hash(originalCJS.code),observedCompiledDigest:hash(observedCJS.code),loweredDigest:hash(lowered.code),configDigest:hash(config.code),mainSite:bridge.mainSite,filterSite:bridge.filterSite,mapSite:bridge.mapSite,configSites:config.sites,sourceOnly:true,ownedHookControlsRequired:true,ReactDOMExecuted:false,nativeRuntimeProven:false}};
}
// This source is a fixture environment, NOT an alternative React implementation.
export function mainInputFixtureSource(){return [
 "'use strict';",
 "const own=Object.getOwnPropertyDescriptor,define=Object.defineProperty,apply=Reflect.apply,savedFilter=Array.prototype.filter,savedMap=Array.prototype.map;",
 "globalThis.fixtureTrace=[];globalThis.fixtureReads={todos:0,completed:0,id:0};globalThis.fixtureSentinel={};globalThis.fixtureHelperNameInStack=false;globalThis.fixtureDispatchCalls=0;globalThis.fixtureBodies=0;globalThis.fixtureMemoCalls=0;",
 "function trace(value){define(fixtureTrace,fixtureTrace.length,{value,enumerable:true,writable:true,configurable:true});}",
 "function getterStack(){fixtureHelperNameInStack=fixtureHelperNameInStack||/mainEnter|mainReturned|mainExit|Object\\.(tap|enter|returned|exit)/.test(String(new Error().stack));}",
 "const first={id:'a',title:'private-main-input',completed:false},second={id:'b',title:'private-main-input',completed:true};",
 "if(caseName==='two-equal-rows')second.completed=false;if(caseName==='empty-filter')first.completed=true;",
 "const rows=['two-equal-rows','active-filter','completed-filter'].includes(caseName)?[first,second]:[first];",
 "const route=['active-filter','completed-getter','throw-completed','empty-filter'].includes(caseName)?'/active':caseName==='completed-filter'?'/completed':'/';",
 "if(caseName==='completed-getter'||caseName==='throw-completed')define(first,'completed',{get(){fixtureReads.completed++;trace('completed');getterStack();if(caseName==='throw-completed')throw fixtureSentinel;return false;},enumerable:true,configurable:true});",
 "if(['id-getter','throw-id','stop-in-key','seal-in-key'].includes(caseName))define(first,'id',{get(){fixtureReads.id++;trace('id');getterStack();if(caseName==='throw-id')throw fixtureSentinel;if(caseName==='stop-in-key')control.stop();if(caseName==='seal-in-key')control.seal();return 'a';},enumerable:true,configurable:true});",
 "const props={dispatch(){fixtureDispatchCalls++;throw Error('Owned Main must not dispatch');}};",
 "if(caseName==='todos-getter'||caseName==='throw-todos')define(props,'todos',{get(){fixtureReads.todos++;trace('todos');getterStack();if(caseName==='throw-todos')throw fixtureSentinel;return rows;},enumerable:true});else props.todos=rows;",
 "let memo=[first];globalThis.invocationIndex=0;",
 "globalThis.ownedHooks={useMemo(callback){fixtureMemoCalls++;trace('memo');if(caseName==='memo-skipped'||caseName==='cross-invocation-memo'&&invocationIndex>0){trace('cached');return memo;}memo=callback();return memo;},useCallback(callback){trace('useCallback');return callback;}};",
 "globalThis.ownedRouter={useLocation(){fixtureBodies++;trace('location');return {pathname:route};}};",
 "globalThis.ownedItem={Item:function Item(){throw Error('Item type must not execute');}};",
 "globalThis.control={stop(){trace('stop');if(mode!=='original')__sa_callback_copy.stop();},seal(){trace('seal');if(mode!=='original')__sa_callback_copy.sealWindow();}};",
 "if(caseName==='foreign-filter')Array.prototype.filter=function(callback){trace('foreign-filter');return apply(savedFilter,this,arguments);};",
 "if(caseName==='foreign-map')Array.prototype.map=function(callback){trace('foreign-map');return apply(savedMap,this,arguments);};",
 "globalThis.fixtureFirst=first;globalThis.fixtureSecond=second;globalThis.fixtureRows=rows;globalThis.fixtureProps=props;",
 "globalThis.restoreFixture=function(){Array.prototype.filter=savedFilter;Array.prototype.map=savedMap;};"
].join('\n');}
export function executeMainInputSourceCase({coreSource,jsxSource,constantsCode,appCode,applicationReceipt,factory=mainInputFactory(),policy,caseName,mode,onContextStarted=()=>{},onStage=()=>{}}){
 if(!mainInputCases.includes(caseName)||!['original','off','on'].includes(mode))throw Error('Unknown owned Main source case');
 const originalMainFunctionSourceUsed=!!applicationReceipt&&applicationReceipt.sourceDigest==='09164b4bb70f4162ca2d32e3961133653fd0f9934244ba21eb85477218008a28'&&hash(appCode)===(mode==='original'?applicationReceipt.originalCompiledDigest:applicationReceipt.observedCompiledDigest);
 if(applicationReceipt&&!originalMainFunctionSourceUsed)throw Error('Main source receipt mismatch before VM');
 const context=vm.createContext({caseName,mode,process:{env:{NODE_ENV:'development'}}});onContextStarted();
 const run=(source,name)=>new vm.Script(source,{filename:name}).runInContext(context,{timeout:5000});
 onStage('bootstrap');
 run("'use strict';globalThis.weakUnavailable=false;globalThis.fixtureWarnings=0;globalThis.console={log(){},warn(){fixtureWarnings++;},error(){fixtureWarnings++;}};"+
  (caseName==='weak-cleared'?"globalThis.WeakRef=class OwnedWeakRef{constructor(value){this.value=value;}deref(){return weakUnavailable?undefined:this.value;}};":'')+
  (mode!=='original'?'globalThis.__sa_callback_copy=('+factory+')('+JSON.stringify({page:'main-input-source:'+caseName,enabled:mode==='on',policy})+');globalThis.__sa_array_calls=__sa_callback_copy.arrayRuntime;__sa_callback_copy.sealWindow();'+
   (mode==='on'?'Object.defineProperty(globalThis,"__STATEATOM_REACT19_JSX_INPUT__",{value:__sa_callback_copy.tap});':''):''),
  'owned-main-input-bootstrap.js');
 function module(source,name,require){
  context.ownedRequire=require;context.ownedModule={exports:{}};context.ownedExports=context.ownedModule.exports;
  run('(function(require,exports,module){'+source+'\n})(ownedRequire,ownedExports,ownedModule);',name);return context.ownedModule.exports;
 }
 onStage('retained-core');
 const core=module(coreSource,'retained-react-core.cjs',()=>{throw Error('Unknown Core dependency');});
 onStage('retained-jsx');
 const jsx=module(jsxSource,'retained-react-jsx.cjs',name=>{if(name==='react')return core;throw Error('Unknown JSX dependency');});
 onStage('owned-fixture');run(mainInputFixtureSource(),'owned-main-input-fixture.js');
 onStage('constants');const constants=module(constantsCode,'retained-todo-constants.cjs',()=>{throw Error('Unknown constants dependency');});
 onStage('main-module');
 const main=module(appCode,'retained-Main-with-owned-hooks.cjs',name=>{
  if(name==='react')return context.ownedHooks;if(name==='react-router-dom')return context.ownedRouter;if(name==='react/jsx-runtime')return jsx;if(name==='./item')return context.ownedItem;if(name==='../constants')return constants;throw Error('Unknown Main dependency: '+name);
 });context.mainModule=main;
 if(mode!=='original')run('__sa_callback_copy.startWindow('+JSON.stringify(caseName)+');','owned-main-input-window.js');
 const roots=[],sameThrown=[],rootRows=[],elements=[];
 onStage('main-call');
 const invocations=caseName==='cross-invocation-memo'?2:1;
 for(let i=0;i<invocations;i++){
  context.invocationIndex=i;
  run('globalThis.fixtureRoot=null;globalThis.fixtureSameThrown=false;try{fixtureRoot=mainModule.Main(fixtureProps);}catch(error){fixtureSameThrown=error===fixtureSentinel;if(!fixtureSameThrown)throw error;}','owned-main-input-call.js');
  roots.push(context.fixtureRoot);sameThrown.push(context.fixtureSameThrown);
 }
 context.restoreFixture();
 // Only fixed framework-owned data objects are read. No todo value is traversed.
 const own=(value,key)=>{const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!Object.hasOwn(d,'value'))throw Error('Expected fixed own framework data');return d.value;};
 const oracle=[];
 for(let i=0;i<roots.length;i++){
  const root=roots[i];if(!root){rootRows.push(0);continue;}
  if(own(root,'type')!=='main')throw Error('Unexpected Main source output');
  const children=own(own(root,'props'),'children'),ul=children[1];if(own(ul,'type')!=='ul')throw Error('Unexpected fixed Main list output');
  const rows=own(own(ul,'props'),'children');if(!Array.isArray(rows))throw Error('Expected original native map array');
  rootRows.push(rows.length);
  for(let j=0;j<rows.length;j++){const element=rows[j],todo=own(own(element,'props'),'todo');elements.push(element);oracle.push({invocation:i,index:j,itemIsFirst:todo===context.fixtureFirst,itemIsSecond:todo===context.fixtureSecond});}
 }
 if(caseName==='weak-cleared')context.weakUnavailable=true;
 onStage('seal');
 let seal=null,selected=[];
 if(mode!=='original'){
  run('globalThis.fixtureSeal=__sa_callback_copy.sealWindow();','owned-main-input-seal.js');seal=context.fixtureSeal;
  context.sourceElements=elements;
  run('globalThis.fixtureSelected=[];for(let i=0;i<sourceElements.length;i++)Object.defineProperty(fixtureSelected,fixtureSelected.length,{value:__sa_callback_copy.lookup(sourceElements[i]),enumerable:true});globalThis.fixtureLookalike=__sa_callback_copy.lookup({});','owned-main-input-lookup.js');
  selected=context.fixtureSelected;
 }
 const out={caseName,mode,summary:{rootRows,sameThrown,reads:context.fixtureReads,mainBodiesEntered:context.fixtureBodies,memoCalls:context.fixtureMemoCalls,dispatchCalls:context.fixtureDispatchCalls,helperNameInStack:context.fixtureHelperNameInStack,warnings:context.fixtureWarnings,invocations},trace:context.fixtureTrace,identityOracle:oracle,seal,selected,lookalike:mode==='original'?null:context.fixtureLookalike,
  sourceOnly:true,fixtureInputsOnly:true,originalMainFunctionSourceUsed,ownedHookAndRouterControls:true,realHookLifecycleProven:false,realRouterExecuted:false,ItemComponentExecuted:false,ReactDOMExecuted:false,originalWholeAppExecuted:false,browserStarted:false,nativeRuntimeProven:false,installedRuntimeProven:false,modelCalls:0,nativeWriterCalls:0,fullA02:false,controlledWeakUnavailability:caseName==='weak-cleared',realGCProven:false};
 return JSON.parse(JSON.stringify(out));
}
