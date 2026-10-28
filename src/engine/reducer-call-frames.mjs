// SPDX-License-Identifier: Apache-2.0
// Optional source recipe after the existing pinned native derivative. Not installed
// by the public plugin; source admission is not evidence of native execution.
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
import {transformPinnedReact19} from './react19-vendor.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
export function instrumentReducerCallFrames(source){
 const ast=parse(source,{sourceType:'script'});let owner=null,program;const calls=[];
 traverse(ast,{Program(p){program=p},FunctionDeclaration(p){if(p.node.id?.name==='updateReducerImpl'){if(owner)throw Error('Duplicate reducer owner');owner=p;}}});
 if(!owner||owner.node.async||owner.node.generator)throw Error('Native reducer owner required');
 owner.traverse({CallExpression(p){
  if(p.getFunctionParent()!==owner||!t.isIdentifier(p.node.callee,{name:'__sa19Tap'})||!['reducer-applied','reducer-ignored'].includes(p.node.arguments[0]?.value))return;
  const args=p.node.arguments,call=args[1],expected=['hook','queue','update','pendingQueue','updateLane','currentlyRenderingFiber','reducer'];
  if(args.length!==9||!t.isCallExpression(call)||!t.isIdentifier(call.callee,{name:'reducer'})||call.arguments.length!==2||!call.arguments.every((a,i)=>t.isIdentifier(a,{name:['pendingQueue','updateLane'][i]}))||!expected.every((name,i)=>t.isIdentifier(args[i+2],{name}))||p.scope.getBinding('reducer')!==owner.scope.getBinding('reducer')||!owner.scope.getBinding('reducer'))throw Error('Original native reducer call shape required');
  calls.push(p);
 }});
 if(calls.length!==2||new Set(calls.map(p=>p.node.arguments[0].value)).size!==2)throw Error('Exactly applied and ignored native calls required');
 const helper=program.scope.generateUidIdentifier('stateatomNativeReducerCall');
 for(const p of calls){const token=owner.scope.generateUidIdentifier('stateatomNativeCall');owner.node.body.body.unshift(t.variableDeclaration('let',[t.variableDeclarator(t.cloneNode(token))]));const original=p.node.arguments[1];p.node.arguments[1]=t.callExpression(t.cloneNode(helper),[t.assignmentExpression('=',t.cloneNode(token),t.objectExpression([])),t.identifier('reducer'),...original.arguments]);p.node.arguments.push(t.cloneNode(token));}
 const code=`function ${helper.name}(token,reducer,input,action){__sa19Tap('reducer-call-begin',token,reducer,input,action);try{const result=reducer(input,action);__sa19Tap('reducer-call-complete',result,token);return result}catch(error){__sa19Tap('reducer-call-abort',token);throw error}}`;
 ast.program.body.unshift(...parse(code,{sourceType:'script'}).program.body);
 return{code:generate(ast,{comments:true},source).code,calls:2,nativeVersionAdmitted:false,nativeExecuted:false,fullPath:false};
}
export function transformPinnedReducerCallFrames(source,file='react-dom/cjs/react-dom-client.development.js'){
 if(file!=='react-dom/cjs/react-dom-client.development.js')throw Error('Pinned ReactDOM call source required');
 const base=transformPinnedReact19(source,file),result=instrumentReducerCallFrames(base.code);return{...result,nativeVersionAdmitted:true,sourceDigest:base.sourceDigest,version:base.version};
}
