// SPDX-License-Identifier: Apache-2.0
// Source-only synchronous native call bracket; no invocation/commit/property qualification.
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';import {createHash} from 'node:crypto';
import {transformPinnedMemoBranch} from './memo-branch-transform.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
const fileName='react-dom/cjs/react-dom-client.development.js',prefix='__saComponentCall';
const owners={renderWithHooks:{role:'initial',params:['current','workInProgress','Component','props','secondArg','nextRenderLanes']},renderWithHooksAgain:{role:'again',params:['workInProgress','Component','props','secondArg']}};
const helper=`const __saComponentCallOwn=Object.getOwnPropertyDescriptor,__saComponentCallApply=Reflect.apply,__saComponentCallCreate=Object.create;
function __saComponentCallBegin(fiber,component,props,site){try{const d=__saComponentCallOwn(globalThis,'__STATEATOM_COMPONENT_CALL_TAP__'),f=d&&__saComponentCallOwn(d,'value')?.value;if(typeof f!=='function')return null;const r=__saComponentCallCreate(null);r.fn=f;r.site=site;try{r.token=__saComponentCallApply(f,undefined,['component-call-begin',fiber,component,props,site]);}catch{}return r;}catch{return null;}}
function __saComponentCallReturn(r,value){if(r)try{__saComponentCallApply(r.fn,undefined,['component-call-return',r.token,value,r.site]);}catch{}}
function __saComponentCallThrow(r,error){if(r)try{__saComponentCallApply(r.fn,undefined,['component-call-throw',r.token,error,r.site]);}catch{}}
function __saComponentCallEnd(r){if(r)try{__saComponentCallApply(r.fn,undefined,['component-call-end',r.token,r.site]);}catch{}}`;
function targets(ast){
 const found=new Map();let reserved=false;
 traverse(ast,{Identifier(p){if(p.node.name.startsWith(prefix))reserved=true;},FunctionDeclaration(p){const name=p.node.id?.name;if(!Object.hasOwn(owners,name))return;if(found.has(name))throw Error('Duplicate native call owner');found.set(name,p);}});
 if(reserved||found.size!==2)throw Error('Closed native owner/helper namespace required');
 const result=[];
 for(const [name,shape]of Object.entries(owners)){
  const fn=found.get(name),params=shape.params;if(fn.node.async||fn.node.generator||fn.node.params.length!==params.length||!params.every((n,i)=>t.isIdentifier(fn.node.params[i],{name:n})))throw Error('Closed native owner parameters required');
  const bindings={};for(const key of ['workInProgress','Component','props','secondArg']){const b=fn.scope.getBinding(key);if(b?.kind!=='param'||!b.constant)throw Error('Stable native invocation references required');bindings[key]=b;}
  const calls=[];let unsafe=false;
  fn.get('body').traverse({Function(p){p.skip();},WithStatement(){unsafe=true;},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))unsafe=true;if(t.isIdentifier(p.node.callee,{name:'callComponentInDEV'}))calls.push(p);}});
  if(unsafe||calls.length!==1)throw Error('One non-dynamic original native call required');
  const call=calls[0],callee=call.scope.getBinding('callComponentInDEV');if(!callee?.constant||callee.scope!==fn.scope.parent||call.node.optional||call.node.arguments.length!==3)throw Error('Original native callee binding required');
  for(const [i,key]of ['Component','props','secondArg'].entries())if(!t.isIdentifier(call.node.arguments[i],{name:key})||call.scope.getBinding(key)!==bindings[key])throw Error('Exact original call operands required');
  if(call.scope.getBinding('workInProgress')!==bindings.workInProgress)throw Error('Exact injected native fiber binding required');
  let statement;
  if(shape.role==='initial'){
   const declarator=call.parentPath,declaration=declarator.parentPath;
   if(!declarator.isVariableDeclarator()||declarator.node.init!==call.node||!t.isIdentifier(declarator.node.id,{name:'children'})||!declaration.isVariableDeclaration({kind:'var'})||declaration.node.declarations.length!==1||declaration.parentPath.node!==fn.node.body)throw Error('One direct native var initializer required');
   statement=declaration;
  }else{
   const assignment=call.parentPath,expression=assignment.parentPath,block=expression.parentPath,loop=block.parentPath,binding=call.scope.getBinding('children');
   if(!assignment.isAssignmentExpression({operator:'='})||assignment.node.right!==call.node||!t.isIdentifier(assignment.node.left,{name:'children'})||binding?.kind!=='var'||binding.scope!==fn.scope||!expression.isExpressionStatement()||!block.isBlockStatement()||!loop.isDoWhileStatement()||loop.node.body!==block.node||loop.parentPath.node!==fn.node.body)throw Error('One original direct rerender assignment required');
   statement=expression;
  }
  result.push({fn,call,statement,owner:name,role:shape.role});
 }
 return result;
}
export function instrumentComponentCallGrammar(source,file,{originalSource=source}={}){
 if(typeof source!=='string'||typeof originalSource!=='string'||typeof file!=='string')throw TypeError('Source/file required');
 const empty={code:source,skipped:false,unsupported:[],policy:null,counts:{initial:0,again:0},sourceDigest:hash(originalSource),inputDigest:hash(source),sourceOnly:true,nativeVersionAdmitted:false,componentInvocationRuntimeQualified:false};
 const refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});
 if(file!==fileName||Buffer.byteLength(source)>4*1024*1024||Buffer.byteLength(originalSource)>4*1024*1024||source.includes(prefix)||originalSource.includes(prefix))return refuse('Native component source/file/helper bound refused');
 try{
  const ast=parse(source,{sourceType:'script'}),original=parse(originalSource,{sourceType:'script'}),admitted=targets(ast),locations=targets(original),sites=[];
  for(let i=0;i<admitted.length;i++){
   const row=admitted[i],old=locations[i],n=old.call.node,l=n.loc;if(row.owner!==old.owner||row.role!==old.role)throw Error('Native component source correspondence required');
   const site={id:hash(file+'\0'+empty.sourceDigest+'\0'+n.start+':'+n.end+':'+row.owner+':'+row.role),file,sourceDigest:empty.sourceDigest,kind:'native-component-call',owner:row.owner,role:row.role,callee:'callComponentInDEV',line:l.start.line,column:l.start.column+1,endLine:l.end.line,endColumn:l.end.column+1};sites.push(site);
   const receipt=row.fn.scope.generateUidIdentifier('saComponentCallFrame'),error=row.fn.scope.generateUidIdentifier('saComponentCallError');
   const start=t.variableDeclaration('const',[t.variableDeclarator(t.cloneNode(receipt),t.callExpression(t.identifier('__saComponentCallBegin'),[t.identifier('workInProgress'),t.identifier('Component'),t.identifier('props'),t.stringLiteral(site.id)]))]);
   // Original call stays here in its original owner, without an invocation wrapper.
   const invoke=t.expressionStatement(t.assignmentExpression('=',t.identifier('children'),row.call.node));
   const finish=t.expressionStatement(t.callExpression(t.identifier('__saComponentCallReturn'),[t.cloneNode(receipt),t.identifier('children')]));
   const caught=t.catchClause(t.cloneNode(error),t.blockStatement([t.expressionStatement(t.callExpression(t.identifier('__saComponentCallThrow'),[t.cloneNode(receipt),t.cloneNode(error)])),t.throwStatement(t.cloneNode(error))]));
   const end=t.blockStatement([t.expressionStatement(t.callExpression(t.identifier('__saComponentCallEnd'),[t.cloneNode(receipt)]))]);
   const bracket=t.tryStatement(t.blockStatement([invoke,finish]),caught,end),replacement=[];
   if(row.role==='initial')replacement.push(t.variableDeclaration('var',[t.variableDeclarator(t.identifier('children'))]));
   replacement.push(start,bracket);row.statement.replaceWithMultiple(replacement);
  }
  ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);const code=generate(ast,{comments:true},source).code;parse(code,{sourceType:'script'});
  return{...empty,code,counts:{initial:1,again:1},policy:{schema:'stateatom.native-component-call-source/1',file,sourceDigest:empty.sourceDigest,sites,nativeVersionAdmitted:false},outputDigest:hash(code),scope:'Original synchronous callComponentInDEV attempt bracket only; no actual component body, commit, parameter or property qualification'};
 }catch{return refuse('Closed native component call grammar/binding refused');}
}
export function transformPinnedComponentCall(source,file=fileName){
 if(file!==fileName)throw Error('Only pinned component-call source admitted');const memo=transformPinnedMemoBranch(source,file),r=instrumentComponentCallGrammar(memo.code,file,{originalSource:source});if(r.skipped)throw Error('Pinned component-call grammar refused');
 return{...r,nativeVersionAdmitted:true,version:memo.version,policy:{...r.policy,nativeVersionAdmitted:true,version:memo.version},baseCounts:memo.baseCounts,nativeReturnPolicy:memo.nativeReturnPolicy,nativeReturnCounts:memo.nativeReturnCounts,elementFiberPolicy:memo.elementFiberPolicy,elementFiberCounts:memo.elementFiberCounts,memoBranchPolicy:memo.policy,memoBranchCounts:memo.counts,memoOutputDigest:memo.outputDigest,chainDigests:{...memo.chainDigests,componentCallInput:memo.outputDigest,componentCallOutput:r.outputDigest}};
}
