// SPDX-License-Identifier: Apache-2.0
// Opt-in source body observations, prepared on ORIGINAL function nodes before
// property traversal. Generated observer thunks are never action sites.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export function prepareActionInstrumentation(ast,text,file,{baseText=text,sourceOffset=0}={}){
 const sites=[],unsupported=[],candidates=[],refusal=reason=>({sites:[],unsupported:[{file,reason}],skipped:true,install(){}});
 let reserved=false,dynamic=false;traverse(ast,{Identifier(p){if(p.node.name.startsWith('__sa_action'))reserved=true;},WithStatement(){dynamic=true;},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))dynamic=true;}});
 if(reserved||dynamic)return refusal(reserved?'Reserved action helper identifier collision':'Dynamic eval/with source scope unsupported');
 const sourceDigest=hash(baseText),position=offset=>{const head=baseText.slice(0,offset);return{line:head.split('\n').length,column:offset-head.lastIndexOf('\n')};};
 traverse(ast,{Function:{exit(p){
  let reason;if(!(p.isFunctionDeclaration()||p.isFunctionExpression()||p.isArrowFunctionExpression()))reason='Method/getter/constructor action body unsupported';
  else if(p.node.async||p.node.generator)reason='Async/generator body observation unsupported';
  else if(!t.isIdentifier(p.node.params[0]))reason='Simple original first event parameter required';
  p.traverse({AwaitExpression(){reason='Suspension boundary';},YieldExpression(){reason='Suspension boundary';},Super(){reason='Super boundary';},WithStatement(){reason='Dynamic scope boundary';},CallExpression(q){if(t.isIdentifier(q.node.callee,{name:'eval'}))reason='Direct eval boundary';},FunctionDeclaration(){reason='Nested hoisted declaration boundary';}});
  const n=p.node,at=position(sourceOffset+n.start),end=position(sourceOffset+n.end);
  if(reason){unsupported.push({file,...at,reason});return;}
  const site={id:hash(file+'\0'+sourceDigest+':'+(sourceOffset+n.start)),file,sourceDigest,...at,endLine:end.line,endColumn:end.column,kind:p.isArrowFunctionExpression()?'arrow':'function',symbol:n.id?.name||(p.parentPath.isVariableDeclarator()&&t.isIdentifier(p.parentPath.node.id)?p.parentPath.node.id.name:'Anonymous function')};sites.push(site);candidates.push({node:n,site});
 }}});
 if(sites.length>256)return refusal('Action source site budget exceeded');
 return{sites,unsupported,sourceDigest,skipped:false,install({receiver='__sa_actions',enter='enter',leave='leave'}={}){
 const call=(method,args)=>t.callExpression(t.memberExpression(t.identifier(receiver),t.identifier(method)),args);
 for(const {node:n,site}of candidates){const body=t.isBlockStatement(n.body)?n.body:t.blockStatement([t.returnStatement(n.body)]),original=body.body;
  const token=t.identifier('__sa_actionToken'),threw=t.identifier('__sa_actionThrew'),error=t.identifier('__sa_actionError');
  body.body=[t.variableDeclaration('const',[t.variableDeclarator(token,call(enter,[t.stringLiteral(site.id),t.identifier(n.params[0].name)]))]),t.variableDeclaration('let',[t.variableDeclarator(threw,t.booleanLiteral(false))]),t.tryStatement(t.blockStatement(original),t.catchClause(error,t.blockStatement([t.expressionStatement(t.assignmentExpression('=',threw,t.booleanLiteral(true))),t.throwStatement(error)])),t.blockStatement([t.expressionStatement(call(leave,[token,threw]))]))];n.body=body;
 }
 }};
}
export function instrumentActions(text,file,{enabled=false,imports=true,sourceType='module',runtimeURL='/@stateatom/action-observation'}={}){
 const empty={code:text,sites:[],unsupported:[],skipped:false};if(!enabled)return empty;
 let ast;try{ast=parse(text,{sourceType,plugins:['typescript','jsx']});}catch{return{...empty,skipped:true,unsupported:[{file,reason:'Action source grammar unavailable'}]};}
 if(imports&&sourceType!=='module')return{...empty,skipped:true,unsupported:[{file,reason:'Action runtime imports require an explicit ESM source'}]};
 const prepared=prepareActionInstrumentation(ast,text,file);if(prepared.skipped)return{...empty,skipped:true,unsupported:prepared.unsupported};prepared.install();
 if(imports&&prepared.sites.length)ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('__sa_actions'),t.identifier('__sa_actions'))],t.stringLiteral(runtimeURL)));
 return{code:prepared.sites.length?generate(ast,{comments:true},text).code:text,sites:prepared.sites,unsupported:prepared.unsupported,sourceDigest:prepared.sourceDigest,skipped:false};
}
