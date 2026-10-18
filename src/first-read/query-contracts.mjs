// SPDX-License-Identifier: Apache-2.0
// Exact pinned source sites, not a general effect instrumenter or readonly proof.
import {readFileSync} from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
export const firstQueryHashes=Object.freeze({
 'queryClient.js':'0e6ed14b21a7f613af25d8c5a28919d0594fd3619c797fcb659a529b2f7b4a50','queryCache.js':'63f42e7789c128b90e4bb3e77501df2847dc95bdca9446d9a67e81b2b4810c64','query.js':'4bb40e427701f1c8a9684b51933414929cd4d186a7352e478d55f92406546df2','utils.js':'9e0d49572ecccee892605be4c3c8352b24ac50dae50cd3f90eda9999574f1316','notifyManager.js':'d38d49a59008327820741debbf18eb467dc057e604e0cb7e6633d81194c2ab8c','subscribable.js':'fdc001e3682f0af6b001227a6055a94424bb0fd7ab9105811f8755348e972f9f','removable.js':'61c66b9411fab1ac36457c3e56554c6297c2805d3946a236b2e1998b00d4fd09','timeoutManager.js':'c5897815e2c2cb6f02401de3425f99d56884732930186d1b8095e6904c5d6589'});
export const firstQueryModule='stateatom:first-read-query-ledger';
export function transformFirstQuery(source,file,{transformedSource=source}={}){
 if(!firstQueryHashes[file]||createHash('sha256').update(source).digest('hex')!==firstQueryHashes[file])throw Error('First-read Query input differs: '+file);
 const ast=parse(transformedSource,{sourceType:'module'}),counts={},count=k=>counts[k]=(counts[k]||0)+1;
 const tap=(kind,...args)=>t.expressionStatement(t.callExpression(t.identifier('__safrTap'),[t.stringLiteral(kind),...args]));
 traverse(ast,{
  ClassMethod(p){const name=p.node.key.name;
   if(file==='queryClient.js'){
    if(name==='constructor'){p.node.body.body.push(tap('client',t.thisExpression(),t.memberExpression(t.identifier('arguments'),t.identifier('length')),t.memberExpression(t.thisExpression(),t.privateName(t.identifier('queryCache')))));count('client');p.skip();}
    else if(['mount','setDefaultOptions','setQueryDefaults','setMutationDefaults'].includes(name)){p.node.body.body.unshift(tap('client-config',t.thisExpression()));count('client-config');p.skip();}
   }else if(file==='query.js'&&name==='constructor'){p.node.body.body.push(tap('query-create',t.thisExpression(),t.memberExpression(t.thisExpression(),t.privateName(t.identifier('client')))));count('query-create');p.skip();}
   else if(file==='subscribable.js'&&name==='subscribe'){p.node.body.body.unshift(tap('subscribe',t.thisExpression()));count('subscribe');p.skip();}
   else if(file==='timeoutManager.js'&&name==='setTimeoutProvider'){p.node.body.body.unshift(tap('timeout-config',t.thisExpression()));count('timeout-config');p.skip();}
  },
  VariableDeclarator(p){if(!t.isIdentifier(p.node.id,{name:'data'}))return;const method=p.getFunctionParent()?.node.key?.name;if(file==='queryClient.js'&&method==='setQueryData'){p.parentPath.insertAfter(tap('updater',t.identifier('updater'),t.identifier('prevData'),t.identifier('query'),t.thisExpression(),t.identifier('data')));count('updater');}else if(file==='query.js'&&method==='setData'){p.parentPath.insertAfter(tap('query-data',t.thisExpression(),t.identifier('data'),t.identifier('newData')));count('query-data');}},
  FunctionDeclaration(p){if(file!=='utils.js'||p.node.id.name!=='replaceData')return;
   const branch=p.node.body.body[0],property=branch?.test?.left?.argument;if(!t.isIfStatement(branch)||!t.isMemberExpression(property)||!t.isIdentifier(property.object,{name:'options'})||!t.isIdentifier(property.property,{name:'structuralSharing'}))throw Error('First sharing branch differs');
   const temp=p.scope.generateUidIdentifier('saFirstSharing');branch.test.left.argument=t.cloneNode(temp);
   p.node.body.body.unshift(t.variableDeclaration('const',[t.variableDeclarator(temp,property)]),tap('sharing',t.identifier('prevData'),t.identifier('data'),t.unaryExpression('typeof',t.cloneNode(temp))));count('sharing');p.skip();
  },
  ObjectProperty(p){if(file!=='notifyManager.js'||!['setNotifyFunction','setBatchNotifyFunction','setScheduler'].includes(p.node.key.name)||!t.isArrowFunctionExpression(p.node.value)||!t.isBlockStatement(p.node.value.body))return;p.node.value.body.body.unshift(tap('notify-config'));count('notify-config');p.skip();},
  CallExpression(p){const n=p.node,c=n.callee;
   if(file==='removable.js'&&t.isMemberExpression(c)&&t.isIdentifier(c.property,{name:'setTimeout'})&&t.isArrowFunctionExpression(n.arguments[0])){n.arguments[0].body.body.unshift(tap('gc',t.thisExpression()));count('gc');p.skip();return;}
   if(!['query.js','queryCache.js'].includes(file)||!t.isMemberExpression(c)||!t.isIdentifier(c.property,{name:'forEach'})||!t.isMemberExpression(c.object)||!t.isThisExpression(c.object.object)||!t.isIdentifier(c.object.property,{name:file==='query.js'?'observers':'listeners'}))return;
   if(n.arguments.length!==1||!t.isArrowFunctionExpression(n.arguments[0])||!t.isBlockStatement(n.arguments[0].body))throw Error('First notification loop differs');
   const counter=p.scope.generateUidIdentifier('saFirstCount'),callback=n.arguments[0];
   callback.body.body.unshift(t.expressionStatement(t.updateExpression('++',t.cloneNode(counter))));
   const kind=file==='query.js'?'query-notify':'cache-notify',event=t.identifier(file==='query.js'?'action':'event');
   // Keep the original callee/receiver/member-call syntax and its single property
   // lookup. Callback count is observed; native callee identity is NOT acquired.
   p.replaceWith(t.callExpression(t.arrowFunctionExpression([],t.blockStatement([
    t.variableDeclaration('let',[t.variableDeclarator(t.cloneNode(counter),t.numericLiteral(0))]),
    t.tryStatement(t.blockStatement([t.returnStatement(n)]),null,t.blockStatement([tap(kind,t.thisExpression(),event,t.cloneNode(counter),t.stringLiteral('Unknown/Unsupported'))]))
   ])),[]));count(kind);p.skip();
  }
 });
 const expected={'queryClient.js':{client:1,'client-config':4,updater:1},'queryCache.js':{'cache-notify':1},'query.js':{'query-notify':1,'query-create':1,'query-data':1},'utils.js':{sharing:1},'notifyManager.js':{'notify-config':3},'subscribable.js':{subscribe:1},'removable.js':{gc:1},'timeoutManager.js':{'timeout-config':1}}[file];
 if(JSON.stringify(Object.entries(counts).sort())!==JSON.stringify(Object.entries(expected).sort()))throw Error('First-read site mismatch '+file+': '+JSON.stringify(counts));
 ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('__safrTap'),t.identifier('firstQueryTap'))],t.stringLiteral(firstQueryModule)));
 return{code:generate(ast,{comments:true}).code,counts};
}
export function queryFirstReadPlugin({instrument=true,externalLedger=false,records=[]}={}){
 return{name:'stateatom-first-read-query-contracts',setup(build){
  build.onResolve({filter:/^stateatom:first-read-query-ledger$/},()=>externalLedger?{path:'/@stateatom/first-read-query',external:true}:{path:path.resolve(import.meta.dirname,'query-ledger.mjs')});
  if(instrument)build.onLoad({filter:/[\\/]@tanstack[\\/]query-core[\\/]build[\\/]modern[\\/][^\\/]+\.js$/},args=>{const file=path.basename(args.path);if(!firstQueryHashes[file])return;const result=transformFirstQuery(readFileSync(args.path,'utf8'),file);records.push({file,counts:result.counts,inputDigest:firstQueryHashes[file],outputDigest:createHash('sha256').update(result.code).digest('hex')});return{contents:result.code,loader:'js',resolveDir:path.dirname(args.path)};});
 }};
}
