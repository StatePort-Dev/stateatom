// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';
import vm from 'node:vm';
import {transform} from 'esbuild';
import {mainInputFactory,executeMainInputSourceCase,prepareMainInputApplication} from '../helpers/react19-main-input-controls.mjs';
import {instrumentMainInputBridge} from '../../experiments/react19-reducer/main-input-transform.mjs';
const file='.runtime/todomvc/examples/react/src/todo/components/main.jsx',source=await readFile(file,'utf8'),hash=s=>createHash('sha256').update(s).digest('hex');
test('disabled source profile preserves exact bytes without inspection/instrumentation',()=>{const r=instrumentMainInputBridge(source,file);assert.equal(r.code,source);assert.equal(r.skipped,false);assert.equal(r.mainSite,null);});
test('actual Main source admits one parameter/filter/map policy and primitive site tags',()=>{
 const r=instrumentMainInputBridge(source,file,{enabled:true});assert.equal(r.skipped,false);assert.equal(r.sourceDigest,hash(source));assert.equal(r.mainSite.sourceDigest,r.sourceDigest);assert.equal(r.mainSite.functionName,'Main');assert.equal(r.mainSite.parameter,'todos');assert.equal(r.filterSite.kind,'filter');assert.equal(r.mapSite.kind,'map');
 assert.match(r.code,/mainEnter/);assert.match(r.code,/mainReturned/);assert.match(r.code,/mainExit/);assert.match(r.code,/finally/);parse(r.code,{sourceType:'module',plugins:['jsx']});assert.equal(r.nativeRuntimeProven,false);
});
test('Main parameter list is not rewritten or replaced with a wrapper function',()=>{const r=instrumentMainInputBridge(source,file,{enabled:true}),ast=parse(r.code,{sourceType:'module',plugins:['jsx']}),main=ast.program.body.find(n=>n.type==='ExportNamedDeclaration'&&n.declaration?.id?.name==='Main').declaration;assert.equal(main.type,'FunctionDeclaration');assert.equal(main.params.length,1);assert.equal(main.params[0].type,'ObjectPattern');assert.equal(main.async,false);assert.equal(main.generator,false);});
for(const[label,change]of [
 ['async Main',s=>s.replace('function Main','async function Main')],
 ['generator Main',s=>s.replace('function Main','function* Main')],
 ['aliased parameter',s=>s.replace('{ todos, dispatch }','{ todos: rows, dispatch }')],
 ['default parameter',s=>s.replace('{ todos, dispatch }','{ todos = [], dispatch }')],
 ['rest parameter',s=>s.replace('{ todos, dispatch }','{ todos, ...rest }')],
 ['reserved callback binding',s=>'const __sa_callback_copy={};\n'+s],
 ['reserved array binding',s=>'const __sa_array_calls={};\n'+s],
 ['extra array pair',s=>s+'\nconst extra = [].filter(x=>true).map(x=>x);'],
 ['no Main',s=>s.replace('function Main','function Other')],
 ['direct eval',s=>s.replace('const { pathname:',"eval('x'); const { pathname:")],
]){
 test('source refuses '+label+' as a whole without a partial rewrite',()=>{const bad=change(source),r=instrumentMainInputBridge(bad,file,{enabled:true});assert.equal(r.skipped,true);assert.equal(r.code,bad);assert(r.unsupported.length);});
}
test('script semantics are outside this module-only profile',()=>{const r=instrumentMainInputBridge(source,file,{enabled:true,sourceType:'script'});assert.equal(r.skipped,true);assert.equal(r.code,source);});


function ownedMainSource(caseName){let text=[
 'const caseName='+JSON.stringify(caseName)+',owner={},sentinel={};let trace=[],reads=0,valueReads=0,helperFrame=false;',
 "const first={};Object.defineProperty(first,'title',{get(){valueReads++;trace[trace.length]='value';const stack=String(new Error().stack);globalThis.ownedStack=stack;helperFrame=helperFrame||/mainEnter|mainReturned|mainExit/.test(stack);if(caseName==='throw-value')throw sentinel;return 'owned-label';}});",
 "const rows=[first],props={dispatch(){}};Object.defineProperty(props,'todos',{get(){reads++;trace[trace.length]='parameter';if(caseName==='throw-parameter')throw sentinel;return rows;}});",
 "export function Main({todos,dispatch}){const visible=todos.filter(todo=>{trace[trace.length]='filter';if(caseName==='throw-filter')throw sentinel;return true;});return visible.map(todo=>{trace[trace.length]='map';const value=todo.title;if(caseName==='throw-callback')throw sentinel;return {todo,value,flags:[this===owner,arguments[0]===props,caseName==='construct'?new.target===Main:new.target===undefined]};});}",
 "let result=[],sameThrown=false;try{result=caseName==='construct'?new Main(props):Main.call(owner,props);}catch(error){sameThrown=error===sentinel;if(!sameThrown)throw error;}",
 "const flags=[];for(let i=0;i<result.length;i++)flags[flags.length]=result[i].flags;globalThis.summary={count:result.length,firstMatches:result.length?result[0].todo===first:false,sameThrown,reads,valueReads,helperFrame,flags,mainLength:Main.length,mainName:Main.name};globalThis.trace=trace;"
].join('\n');
 if(caseName==='uid-collision')text=text.replace('return visible.map(',"{const _saMainInputFrame='owned';const _saMainInputResult=visible;return _saMainInputResult.map(").replace('});}\n','});}}\n');
 return text;
}
async function executeOwnedMain(caseName,mode){
 const input=ownedMainSource(caseName),r=instrumentMainInputBridge(input,'owned-semantic-main.jsx',{enabled:mode!=='original'});
 if(mode!=='original')assert.equal(r.skipped,false,JSON.stringify(r.unsupported));
 const context=vm.createContext({module:{exports:{}},exports:{}});
 if(mode!=='original'){
  const policy={mainSite:r.mainSite,filterSite:r.filterSite,mapSite:r.mapSite};
  new vm.Script('globalThis.__sa_callback_copy=('+mainInputFactory()+')('+JSON.stringify({page:'owned-semantics',enabled:mode==='on',policy})+');globalThis.__sa_array_calls=__sa_callback_copy.arrayRuntime;__sa_callback_copy.startWindow("case");').runInContext(context,{timeout:1000});
 }
 const compiled=await transform(r.code,{loader:'jsx',format:'cjs',target:'es2022'});
 new vm.Script('(function(exports,module){'+compiled.code+'\n})(exports,module);',{filename:'owned-main-semantics.cjs'}).runInContext(context,{timeout:1000});
 const snapshot=mode==='original'?null:context.__sa_callback_copy.sealWindow().snapshot;
 return JSON.parse(JSON.stringify({summary:context.summary,trace:context.trace,snapshot,debugStack:context.ownedStack}));
}
for(const caseName of ['ordinary','throw-parameter','throw-filter','throw-value','throw-callback','construct','uid-collision']){
 test('new source body preserves original/off/on owned Main semantics: '+caseName,async()=>{
  const original=await executeOwnedMain(caseName,'original'),off=await executeOwnedMain(caseName,'off'),on=await executeOwnedMain(caseName,'on');
  assert.equal(on.summary.helperFrame,original.summary.helperFrame,on.debugStack);
  assert.deepEqual(off.summary,original.summary);assert.deepEqual(on.summary,original.summary);assert.deepEqual(off.trace,original.trace);assert.deepEqual(on.trace,original.trace);
  assert.equal(on.summary.helperFrame,false);assert.equal(on.summary.mainLength,1);assert.equal(on.summary.mainName,'Main');
  assert.equal(on.summary.reads,1);assert.equal(on.snapshot.status,'Unknown/Unsupported');assert.equal(on.snapshot.links.length,0);
 });
}

test('owned source harness preserves pre-fixture warnings and does not label stub modules as original Main',()=>{
 const r=executeMainInputSourceCase({coreSource:"console.warn('owned bootstrap warning');exports.value=1;",jsxSource:'exports.value=2;',constantsCode:'exports.TOGGLE_ALL="owned";',appCode:'exports.Main=function Main(){return null;};',caseName:'ordinary-one',mode:'original'});
 assert.equal(r.summary.warnings,1);assert.equal(r.originalMainFunctionSourceUsed,false);assert.equal(r.ReactDOMExecuted,false);assert.equal(r.browserStarted,false);
});

test('actual Main compiler preparation is source-only and freezes both module forms and config sites',async()=>{
 const r=await prepareMainInputApplication(source,file);
 assert.equal(r.receipt.sourceDigest,hash(source));assert.equal(hash(r.originalCode),r.receipt.originalCompiledDigest);assert.equal(hash(r.observedCode),r.receipt.observedCompiledDigest);assert.equal(r.receipt.configSites.length,2);
 assert.equal(r.receipt.sourceOnly,true);assert.equal(r.receipt.ReactDOMExecuted,false);assert.equal(r.receipt.nativeRuntimeProven,false);assert.equal(r.receipt.ownedHookControlsRequired,true);
 assert.deepEqual(r.policy.mainSite,r.receipt.mainSite);
});
