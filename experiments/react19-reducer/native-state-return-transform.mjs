// SPDX-License-Identifier: Apache-2.0
// Closed source recipes; owned grammar controls never admit an actual native version.
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';import {createHash} from 'node:crypto';import {transform} from 'esbuild';
import {transformPinnedReact19,react19Profile} from '../../src/engine/react19-vendor.mjs';
import {prepareAppMainPropsApplication} from './app-main-props-transform.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
const nativeFile='react-dom/cjs/react-dom-client.development.js',returnNames=['mountReducer','updateReducerImpl','rerenderReducer'],renderNames=['renderWithHooks','renderWithHooksAgain'];
const parameters={mountReducer:['reducer','initialArg','init'],updateReducerImpl:['hook','current','reducer'],rerenderReducer:['reducer'],renderWithHooks:['current','workInProgress','Component','props','secondArg','nextRenderLanes'],renderWithHooksAgain:['workInProgress','Component','props','secondArg']};
function functions(ast){const found=new Map(),names=[...returnNames,...renderNames];traverse(ast,{FunctionDeclaration(p){if(!names.includes(p.node.id?.name))return;const name=p.node.id.name;if(found.has(name))throw Error('Duplicate native owner');found.set(name,p);}});if(found.size!==5)throw Error('Five exact native owners required');return found;}
function ownReturns(fn){const out=[];fn.get('body').traverse({Function(p){p.skip();},ReturnStatement(p){out.push(p);}});return out;}
function sourceSite(path,file,digest,kind,name){const n=path.node,l=n.loc;return{id:hash(file+'\0'+digest+'\0'+n.start+':'+n.end+':'+kind),file,sourceDigest:digest,kind,functionName:name,line:l.start.line,column:l.start.column+1,endLine:l.end.line,endColumn:l.end.column+1};}
export function instrumentNativeStateReturnGrammar(source,file,{originalSource=source}={}){
 if(typeof source!=='string'||typeof originalSource!=='string'||typeof file!=='string'||!file||file.length>1024)throw TypeError('Bounded source/file required');
 const empty={code:source,skipped:false,unsupported:[],policy:null,counts:{returns:0,renders:0},sourceDigest:hash(originalSource),inputDigest:hash(source),sourceOnly:true,nativeVersionAdmitted:false},refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});
 if(Buffer.byteLength(source)>4*1024*1024||Buffer.byteLength(originalSource)>4*1024*1024)return refuse('Native source bound exceeded');
 try{
  const ast=parse(source,{sourceType:'script'}),original=parse(originalSource,{sourceType:'script'}),owners=functions(ast),originals=functions(original),returnSites=[],renderSites=[];let unsafe=false;
  for(const [name,p]of owners){
   const expected=parameters[name];if(p.node.async||p.node.generator||p.node.params.length!==expected.length||p.node.params.some((n,i)=>!t.isIdentifier(n,{name:expected[i]})))throw Error('Native owner parameter mismatch');
   p.get('body').traverse({CallExpression(q){if(t.isIdentifier(q.node.callee,{name:'eval'}))unsafe=true;},WithStatement(){unsafe=true;}});
   if(unsafe)throw Error('Dynamic native scope refused');
  }
  for(const name of returnNames){
   const fn=owners.get(name),returns=ownReturns(fn),originalReturns=ownReturns(originals.get(name));if(returns.length!==1||originalReturns.length!==1)throw Error('One own native tuple return required');
   const p=returns[0],call=p.node.argument;if(!t.isCallExpression(call)||!t.isIdentifier(call.callee,{name:'__sa19Tap'})||call.arguments.length!==4||!t.isStringLiteral(call.arguments[0],{value:'state-result'})||!t.isArrayExpression(call.arguments[1])||call.arguments[1].elements.length!==2||!t.isIdentifier(call.arguments[2],{name:'hook'})||!t.isIdentifier(call.arguments[3],{name:'currentlyRenderingFiber'}))throw Error('Existing fresh tagged native tuple required');
   if(p.scope.getBinding('hook')!==fn.scope.getBinding('hook')||!fn.scope.getBinding('hook'))throw Error('Native hook binding required');
   const helper=p.scope.getBinding('__sa19Tap');if(!helper?.path.isFunctionDeclaration()||!helper.constant||helper.path.node.async||helper.path.node.generator)throw Error('Constant original native tap helper required');
   const elements=call.arguments[1].elements;
   for(const e of elements)if(!t.isIdentifier(e)&&!(t.isMemberExpression(e)&&!e.computed&&!e.optional&&t.isIdentifier(e.object)&&t.isIdentifier(e.property)))throw Error('Native reference expression only; no inference-changing literals');
   const site=sourceSite(originalReturns[0],file,empty.sourceDigest,'native-state-return',name);returnSites.push(site);
   const state=fn.scope.generateUidIdentifier('saNativeStateValue'),dispatch=fn.scope.generateUidIdentifier('saNativeDispatchValue');
   fn.node.body.body.unshift(t.variableDeclaration('let',[t.variableDeclarator(t.cloneNode(state)),t.variableDeclarator(t.cloneNode(dispatch))]));
   elements[0]=t.assignmentExpression('=',t.cloneNode(state),elements[0]);elements[1]=t.assignmentExpression('=',t.cloneNode(dispatch),elements[1]);
   call.arguments.push(t.stringLiteral(site.id),t.cloneNode(state),t.cloneNode(dispatch));
  }
  for(const name of renderNames){
   const fn=owners.get(name),site=sourceSite(originals.get(name),file,empty.sourceDigest,'native-render-component',name),fiber=fn.scope.getBinding('workInProgress'),component=fn.scope.getBinding('Component');
   if(fiber?.kind!=='param'||component?.kind!=='param')throw Error('Original native renderer parameters required');
   const helper=fn.scope.getBinding('__sa19Tap');if(!helper?.path.isFunctionDeclaration()||!helper.constant)throw Error('Native render helper binding unavailable');
   fn.node.body.body.unshift(t.expressionStatement(t.callExpression(t.identifier('__sa19Tap'),[t.stringLiteral('render-component'),t.identifier('workInProgress'),t.identifier('Component'),t.stringLiteral(site.id)])));renderSites.push(site);
  }
  const code=generate(ast,{comments:true},source).code;parse(code,{sourceType:'script'});
  const policy={file,sourceDigest:empty.sourceDigest,version:'19.2.5',nativeVersionAdmitted:false,returnSites,renderSites};
  return{...empty,code,policy,counts:{returns:3,renders:2},outputDigest:hash(code),recipe:'stateatom.native-state-return-reference-source/1'};
 }catch{return refuse('Closed native render/return grammar or binding refused');}
}
export function transformPinnedNativeStateReturn(source,file=nativeFile){
 if(file!==nativeFile)throw Error('Only pinned ReactDOM native return input admitted');
 const base=transformPinnedReact19(source,file),r=instrumentNativeStateReturnGrammar(base.code,file,{originalSource:source});
 if(r.skipped)throw Error('Pinned native state return grammar refused');
 return{...r,nativeVersionAdmitted:true,version:react19Profile.version,policy:{...r.policy,nativeVersionAdmitted:true},baseSourceDigest:base.sourceDigest,baseOutputDigest:base.outputDigest,baseCounts:base.counts,scope:'Pinned source recipes only; no actual native execution, state origin or ownership proof'};
}
export async function prepareNativeStateApp(source,file){
 const empty={code:source,skipped:false,policy:null,sourceOnly:true,nativeVersionAdmitted:false},refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});
 const base=await prepareAppMainPropsApplication(source,file,{enabled:true});if(base.skipped)return refuse('Closed original App compiler refused');
 try{
  const ast=parse(base.observedESM,{sourceType:'module'});let app=null,entry=null,count=0;
  traverse(ast,{FunctionDeclaration(p){if(p.node.id?.name==='App'&&p.parentPath.isProgram())app=p;}});
  if(!app)throw Error('Original generated App unavailable');const binding=app.scope.getBinding('App');
  if(!binding||binding.path.node!==app.node||!binding.constant)throw Error('Constant lexical App function required');
  app.traverse({Function(p){p.skip();},CallExpression(p){const n=p.node;if(t.isMemberExpression(n.callee,{computed:false})&&t.isIdentifier(n.callee.object,{name:'__sa_app_hook_binding'})&&t.isIdentifier(n.callee.property,{name:'appEnter'})){count++;entry=p;}}});
  if(count!==1||entry.node.arguments.length!==1||!t.isStringLiteral(entry.node.arguments[0],{value:base.policy.app.appSite.id})||entry.scope.getBinding('App')!==binding)throw Error('One exact lexical App frame entry required');
  entry.node.arguments.push(t.identifier('App'));const code=generate(ast,{comments:true},base.observedESM).code,compiled=await transform(code,{loader:'js',format:'cjs',target:'es2022',tsconfigRaw:{compilerOptions:{}}});
  return{...empty,code,observedESM:code,originalCode:base.originalCode,observedCode:compiled.code,policy:base.policy,receipt:{schema:'stateatom.native-state-app-identity-receipt/1',file,sourceDigest:hash(source),originalCompiledDigest:base.receipt.originalCompiledDigest,observedCompiledDigest:hash(compiled.code),observedESMDigest:hash(code),componentReferenceArgument:true,moduleWrapper:base.receipt.moduleWrapper,baseRecipe:base.receipt,sourceOnly:true,nativeRuntimeProven:false,fullA02:false}};
 }catch{return refuse('Exact constant App component reference refused');}
}
