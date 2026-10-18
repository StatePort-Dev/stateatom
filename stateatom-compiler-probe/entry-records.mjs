// SPDX-License-Identifier: Apache-2.0
// Acquisition experiment only; never used by the product observer or analyzer.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
export function instrumentEntries(source,{retainOperands=false}={}){
  const ast=parse(source,{sourceType:'module'});const members=[];
  traverse(ast,{ObjectMethod(p){if(t.isIdentifier(p.node.key,{name:'member'})&&p.findParent(q=>q.isFunctionDeclaration()&&q.node.id?.name==='createObserver'))members.push(p);}});
  if(members.length!==1)throw Error('Expected one supported member body');
  const p=members[0],first=p.node.body.body[0],last=p.node.body.body.at(-1);
  if(p.node.params.length!==3||!['meta','obj','key'].every((name,i)=>t.isIdentifier(p.node.params[i],{name}))||!t.isVariableDeclaration(first)||!t.isMemberExpression(first.declarations[0]?.init)||!t.isIdentifier(first.declarations[0].init.object,{name:'obj'})||!t.isIdentifier(first.declarations[0].init.property,{name:'key'})||!t.isReturnStatement(last)||!t.isIdentifier(last.argument,{name:'value'}))throw Error('Expected one supported member body');
  let additions=0;
  p.traverse({CallExpression(q){if(!t.isIdentifier(q.node.callee,{name:'add'}))return;const original=q.node;
    q.replaceWith(t.sequenceExpression([
      t.assignmentExpression('=',t.identifier('__sa_entry_node'),original),
      t.logicalExpression('&&',t.identifier('__sa_entry'),t.logicalExpression('&&',t.identifier('__sa_entry_node'),t.assignmentExpression('=',t.memberExpression(t.identifier('__sa_entry'),t.identifier('nodeId')),t.memberExpression(t.identifier('__sa_entry_node'),t.identifier('id'))))),
      t.identifier('__sa_entry_node'),
    ]));q.skip();additions++;
  }});
  if(additions!==2)throw Error('Expected one supported member body with two original add sites');
  const enter=parse(`const __sa_entry=${retainOperands?'active&&':''}++__sa_invocation_log.count<=256?(__sa_invocation_log.entries[__sa_invocation_log.count]={callee:api.member,page,nodeId:null${retainOperands?',receiver:obj,key,readCompleted:false,readValueRetained:false,readValue:void 0':''}}):null;let __sa_entry_node;if(${retainOperands?'active&&':''}!__sa_entry)__sa_invocation_log.overflow=true;`,{sourceType:'module'}).program.body;
  if(retainOperands)p.node.body.body.splice(1,0,...parse("if(__sa_entry){__sa_entry.readCompleted=true;if(value===null||typeof value==='boolean'||typeof value==='number'||typeof value==='string'&&value.length<=256){__sa_entry.readValueRetained=true;__sa_entry.readValue=value;}}",{sourceType:'module'}).program.body);
  p.node.body.body.unshift(...enter);
  if(retainOperands){
    const stops=[];traverse(ast,{ObjectMethod(q){if(t.isIdentifier(q.node.key,{name:'stop'})&&q.findParent(r=>r.isFunctionDeclaration()&&r.node.id?.name==='createObserver'))stops.push(q);}});
    const firstStop=stops[0]?.node.body.body[0];
    if(stops.length!==1||!t.isExpressionStatement(firstStop)||!t.isAssignmentExpression(firstStop.expression,{operator:'='})||!t.isIdentifier(firstStop.expression.left,{name:'active'})||!t.isBooleanLiteral(firstStop.expression.right,{value:false}))throw Error('Expected one supported observer stop body');
    stops[0].node.body.body.splice(1,0,...parse('for(const __sa_index in __sa_invocation_log.entries){if(__sa_invocation_log.entries[__sa_index].page===page)delete __sa_invocation_log.entries[__sa_index];}',{sourceType:'module'}).program.body);
  }
  const index=ast.program.body.findLastIndex(n=>t.isImportDeclaration(n))+1;
  ast.program.body.splice(index,0,parse('const __sa_invocation_log={entries:Object.create(null),count:0,overflow:false};',{sourceType:'module'}).program.body[0]);
  return{code:generate(ast,{comments:true}).code,transformed:1};
}
