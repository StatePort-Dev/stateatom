// SPDX-License-Identifier: Apache-2.0
// Acquisition only at pinned original React branch sites. No callback invocation
// for inspection and no claim that foreign Fiber/state exposure is excluded.
import {createHash} from 'node:crypto';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const fileName='react-dom/cjs/react-dom.development.js',digest='1459b808bc6991de5a1ec3a86d8beee32dbb6c14282cf13f84e00dfebfbdc025';
export function transformFirstReact(source,file,{transformedSource=source}={}){
 if(file!==fileName||createHash('sha256').update(source).digest('hex')!==digest)throw Error('First-read React vendor digest mismatch');
 const ast=parse(transformedSource,{sourceType:'unambiguous'}),counts={};
 const tap=(kind,...names)=>{counts[kind]=(counts[kind]||0)+1;return t.expressionStatement(t.callExpression(t.identifier('__firstReactTap'),[t.stringLiteral(kind),...names.map(n=>t.identifier(n))]));};
 traverse(ast,{FunctionDeclaration(p){const name=p.node.id.name;
  if(name==='basicStateReducer')p.node.body.body.unshift(tap('react-reducer','state','action'));
  if(name==='injectInternals')p.traverse({ReturnStatement(q){if(q.getFunctionParent()===p&&t.isBooleanLiteral(q.node.argument,{value:false})&&q.parentPath.isBlockStatement()&&q.parentPath.parentPath.isIfStatement()&&t.isBinaryExpression(q.parentPath.parentPath.node.test,{operator:'==='})&&t.isUnaryExpression(q.parentPath.parentPath.node.test.left,{operator:'typeof'})&&t.isIdentifier(q.parentPath.parentPath.node.test.left.argument,{name:'__REACT_DEVTOOLS_GLOBAL_HOOK__'}))q.insertBefore(tap('react-devtools-absent'));},VariableDeclarator(q){if(q.getFunctionParent()===p&&t.isIdentifier(q.node.id,{name:'hook'}))q.parentPath.insertAfter(tap('react-devtools-present','hook'));}});
  if(!['mountState','dispatchSetState','updateReducer'].includes(name))return;
  p.traverse({VariableDeclarator(q){if(q.getFunctionParent()!==p)return;const n=q.node.id.name;
   if(name==='mountState'&&n==='dispatch')q.parentPath.insertAfter(tap('react-mount','initialState','hook','queue','dispatch','currentlyRenderingFiber$1'));
   if(name==='dispatchSetState'&&n==='update')q.parentPath.insertAfter(tap('react-dispatch','action','queue','update','fiber'));
   if(name==='dispatchSetState'&&n==='eagerState')q.parentPath.insertAfter(tap('react-eager','action','currentState','eagerState','lastRenderedReducer','update'));
  },IfStatement(q){if(name==='updateReducer'&&q.getFunctionParent()===p&&t.isMemberExpression(q.node.test)&&t.isIdentifier(q.node.test.object,{name:'update'})&&t.isIdentifier(q.node.test.property,{name:'hasEagerState'}))q.insertAfter(tap('react-apply','newState','hook','queue','update','reducer'));}});
 }});
 const expected={'react-reducer':1,'react-mount':1,'react-dispatch':1,'react-eager':1,'react-apply':1,'react-devtools-absent':1,'react-devtools-present':1};
 if(JSON.stringify(Object.entries(counts).sort())!==JSON.stringify(Object.entries(expected).sort()))throw Error('First-read React branch site count mismatch: '+JSON.stringify(counts));
 ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('__firstReactTap'),t.identifier('firstQueryTap'))],t.stringLiteral('stateatom:first-read-query-ledger')));
 return{code:generate(ast,{retainLines:true,comments:true},transformedSource).code,counts};
}
