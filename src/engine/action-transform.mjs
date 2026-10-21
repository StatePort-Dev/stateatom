// SPDX-License-Identifier: Apache-2.0
// Separate opt-in development mechanism; existing property/finite transforms are
// unchanged. Never execute application expressions to discover action evidence.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
export function instrumentActions(text,file,{enabled=false,imports=true,sourceType='module',runtimeURL='/@stateatom/action-observation'}={}){
 const empty={code:text,sites:[],unsupported:[],skipped:false};if(!enabled)return empty;
 let ast;try{ast=parse(text,{sourceType,plugins:['typescript','jsx']});}catch{return{...empty,skipped:true,unsupported:[{file,reason:'Action source grammar unavailable'}]};}
 let reserved=false,dynamic=false;traverse(ast,{Identifier(p){if(p.node.name.startsWith('__sa_action'))reserved=true;},WithStatement(){dynamic=true;},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))dynamic=true;}});
 if(reserved||dynamic||imports&&sourceType!=='module')return{...empty,skipped:true,unsupported:[{file,reason:reserved?'Reserved action helper identifier collision':dynamic?'Dynamic eval/with source scope unsupported':'Action runtime imports require an explicit ESM source'}]};
 const sourceDigest=createHash('sha256').update(text).digest('hex'),sites=[],unsupported=[],candidates=[];
 traverse(ast,{Function:{exit(p){
  let reason;if(!(p.isFunctionDeclaration()||p.isFunctionExpression()||p.isArrowFunctionExpression()))reason='Method/getter/constructor action body unsupported';
  else if(p.node.async||p.node.generator)reason='Async/generator body observation unsupported';
  else if(!t.isIdentifier(p.node.params[0]))reason='Simple original first event parameter required';
  p.traverse({AwaitExpression(){reason='Suspension boundary';},YieldExpression(){reason='Suspension boundary';},Super(){reason='Super boundary';},WithStatement(){reason='Dynamic scope boundary';},CallExpression(q){if(t.isIdentifier(q.node.callee,{name:'eval'}))reason='Direct eval boundary';},FunctionDeclaration(){reason='Nested hoisted declaration boundary';}});
  if(reason){unsupported.push({file,line:p.node.loc.start.line,column:p.node.loc.start.column+1,reason});return;}
  const n=p.node,site={id:sourceDigest+':'+n.start,file,sourceDigest,line:n.loc.start.line,column:n.loc.start.column+1,endLine:n.loc.end.line,endColumn:n.loc.end.column+1,kind:p.isArrowFunctionExpression()?'arrow':'function',symbol:n.id?.name||(p.parentPath.isVariableDeclarator()&&t.isIdentifier(p.parentPath.node.id)?p.parentPath.node.id.name:'Anonymous function')};sites.push(site);candidates.push({p,site});
 }}});
 if(sites.length>256)return{...empty,skipped:true,unsupported:[{file,reason:'Action source site budget exceeded'}]};
 const call=(method,args)=>t.callExpression(t.memberExpression(t.identifier('__sa_actions'),t.identifier(method)),args);
 for(const {p,site}of candidates){const n=p.node,body=t.isBlockStatement(n.body)?n.body:t.blockStatement([t.returnStatement(n.body)]),original=body.body;
  const token=t.identifier('__sa_actionToken'),threw=t.identifier('__sa_actionThrew'),error=t.identifier('__sa_actionError');
  body.body=[t.variableDeclaration('const',[t.variableDeclarator(token,call('enter',[t.stringLiteral(site.id),t.identifier(n.params[0].name)]))]),t.variableDeclaration('let',[t.variableDeclarator(threw,t.booleanLiteral(false))]),t.tryStatement(t.blockStatement(original),t.catchClause(error,t.blockStatement([t.expressionStatement(t.assignmentExpression('=',threw,t.booleanLiteral(true))),t.throwStatement(error)])),t.blockStatement([t.expressionStatement(call('leave',[token,threw]))]))];n.body=body;
 }
 if(imports&&sites.length)ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('__sa_actions'),t.identifier('__sa_actions'))],t.stringLiteral(runtimeURL)));
 return{code:sites.length?generate(ast,{comments:true},text).code:text,sites,unsupported,sourceDigest,skipped:false};
}
