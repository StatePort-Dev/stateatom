// SPDX-License-Identifier: Apache-2.0
// Same-function, module-only Main input bridge on the existing interval recipe.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {createHash} from 'node:crypto';
import {instrumentCallbackCopyIntervals} from './callback-copy-transform.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const hash=s=>createHash('sha256').update(s).digest('hex');
export function instrumentMainInputBridge(source,file,{enabled=false,sourceType='module'}={}){
 if(typeof source!=='string'||typeof file!=='string'||!file||file.length>1024)throw TypeError('Source text and bounded file identity required');
 const sourceDigest=hash(source),empty={code:source,sourceDigest,mainSite:null,filterSite:null,mapSite:null,sites:[],intervalSites:[],unsupported:[],skipped:false,sourceOnly:true,nativeRuntimeProven:false};
 const refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});
 if(!enabled)return empty;
 if(sourceType!=='module')return refuse('Only strict module Main source admitted');
 let original,main;
 try{original=parse(source,{sourceType,plugins:['jsx']});}catch{return refuse('Source grammar not admitted');}
 let candidates=0,unsafe=false;
 traverse(original,{
  FunctionDeclaration(p){if(p.node.id?.name!=='Main')return;candidates++;if(p.parentPath.isProgram()||p.parentPath.isExportNamedDeclaration()&&p.parentPath.parentPath.isProgram())main=p;},
  CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))unsafe=true;}
 });
 if(candidates!==1||!main||main.node.async||main.node.generator||unsafe)return refuse('One normal top-level Main without direct eval required');
 const params=main.node.params;
 if(params.length!==1||!t.isObjectPattern(params[0]))return refuse('Main own todos destructuring required');
 let hasTodos=false;
 for(const p of params[0].properties){
  if(!t.isObjectProperty(p)||p.computed||!p.shorthand||!t.isIdentifier(p.key)||!t.isIdentifier(p.value,{name:p.key.name})||!['todos','dispatch'].includes(p.key.name))return refuse('Only unaliased todos/dispatch parameter bindings admitted');
  if(p.key.name==='todos')hasTodos=true;
 }
 if(!hasTodos||main.scope.getBinding('todos')?.kind!=='param')return refuse('Original todos parameter binding required');
 main.get('body').traverse({Function(p){p.skip();},VariableDeclaration(p){if(p.node.kind==='var')unsafe=true;},FunctionDeclaration(p){if(p.node.id?.name==='todos')unsafe=true;},TryStatement(p){if(p.node.finalizer)unsafe=true;}});
 if(unsafe)return refuse('Main body var/redeclared binding or finalizer not admitted');
 const loc=main.node.loc;
 const mainSite={id:hash(sourceDigest+':Main:todos:'+main.node.start+':'+main.node.end),file,sourceDigest,kind:'main-input',line:loc.start.line,column:loc.start.column+1,endLine:loc.end.line,endColumn:loc.end.column+1,functionName:'Main',parameter:'todos'};
 const base=instrumentCallbackCopyIntervals(source,file,{enabled:true,sourceType});
 if(base.skipped||base.unsupported.length)return{...empty,skipped:true,unsupported:base.unsupported};
 const filter=base.sites.filter(s=>s.kind==='filter'),map=base.sites.filter(s=>s.kind==='map');
 if(base.sites.length!==2||filter.length!==1||map.length!==1||base.intervalSites.length!==1||!base.sites.every(s=>s.line>=mainSite.line&&s.endLine<=mainSite.endLine))return refuse('Exactly one Main-local filter/map pair required');
 const filterSite=filter[0],mapSite=map[0],ast=parse(base.code,{sourceType,plugins:['jsx']});
 const member=(node,owner,name)=>t.isMemberExpression(node)&&!node.computed&&t.isIdentifier(node.object,{name:owner})&&t.isIdentifier(node.property,{name});
 const hook=(name,args)=>t.callExpression(t.memberExpression(t.identifier('__sa_callback_copy'),t.identifier(name)),args);
 const clone=n=>t.cloneNode(n,true);
 function matchLiteral(node,expected){
  if(!t.isObjectExpression(node)||node.properties.length!==8)return false;
  const seen=new Set();
  for(const p of node.properties){
   if(!t.isObjectProperty(p)||p.computed||p.shorthand||!t.isIdentifier(p.key)||!Object.hasOwn(expected,p.key.name)||seen.has(p.key.name))return false;
   const value=expected[p.key.name];if(typeof value==='string'?!t.isStringLiteral(p.value,{value}):!t.isNumericLiteral(p.value,{value}))return false;seen.add(p.key.name);
  }
  return true;
 }
 try{
  let begins=0,entries=0;
  traverse(ast,{CallExpression(p){
   if(member(p.node.callee,'__sa_array_calls','begin')){
    if(p.node.arguments.length!==3)throw Error('begin arity');
    const s=base.sites.find(s=>matchLiteral(p.node.arguments[2],s));if(!s)throw Error('begin metadata');
    p.node.arguments[2]=t.stringLiteral(s.id);begins++;
   }else if(member(p.node.callee,'__sa_callback_copy','enter')){
    if(p.node.arguments.length!==5||!matchLiteral(p.node.arguments[1],mapSite))throw Error('callback metadata');
    p.node.arguments[1]=t.stringLiteral(mapSite.id);entries++;
   }
  }});
  if(begins!==2||entries!==1)throw Error('tag coverage');
  let count=0;
  traverse(ast,{FunctionDeclaration(p){
   if(p.node.id?.name!=='Main')return;count++;
   const returns=[];p.get('body').traverse({Function(q){q.skip();},ReturnStatement(q){returns.push(q);}});
   if(returns.length!==1||!returns[0].node.argument)throw Error('one own return required');
   const frame=p.scope.generateUidIdentifier('saMainInputFrame'),result=p.scope.generateUidIdentifier('saMainInputResult');
   // Evaluate outside the hook call's argument context: V8 must not infer the
   // telemetry method name for an application's nested callback.
   returns[0].replaceWith(t.blockStatement([
    t.variableDeclaration('const',[t.variableDeclarator(clone(result),returns[0].node.argument)]),
    t.returnStatement(hook('mainReturned',[clone(frame),clone(result)]))
   ]));
   const entry=t.variableDeclaration('const',[t.variableDeclarator(clone(frame),hook('mainEnter',[t.memberExpression(t.identifier('arguments'),t.numericLiteral(0),true),t.identifier('todos'),t.stringLiteral(mainSite.id)]))]);
   const body=p.node.body.body;p.node.body.body=[entry,t.tryStatement(t.blockStatement(body),null,t.blockStatement([t.expressionStatement(hook('mainExit',[clone(frame)]))]))];
  }});
  if(count!==1)throw Error('Main coverage');
  const code=generate(ast,{comments:true},source).code;parse(code,{sourceType,plugins:['jsx']});
  return{...empty,code,mainSite,filterSite,mapSite,sites:base.sites,intervalSites:base.intervalSites,recipe:'stateatom.main-input-source/1'};
 }catch{return refuse('Generated Main body/tag/binding coverage not admitted');}
}
