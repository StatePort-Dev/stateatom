// SPDX-License-Identifier: Apache-2.0
// New source-only profile of the existing wrapperless array expression recipe.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {createHash} from 'node:crypto';
import {instrumentArrayCallsites} from './array-callsite-transform.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
export function instrumentCallbackCopyIntervals(source,file,{enabled=false,sourceType='module'}={}){
 const sourceDigest=createHash('sha256').update(source).digest('hex');
 const empty={code:source,sites:[],intervalSites:[],unsupported:[],sourceDigest,skipped:false,sourceOnly:true,nativeRuntimeProven:false};
 if(!enabled)return empty;
 const refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});
 let original;try{original=parse(source,{sourceType,plugins:['jsx']});}catch{return refuse('Source grammar not admitted');}
 let collision=false;traverse(original,{Identifier(p){if(p.node.name==='__sa_callback_copy')collision=true;}});if(collision)return refuse('Reserved callback interval binding collision');
 const base=instrumentArrayCallsites(source,file,{enabled:true,sourceType});
 // This profile never silently observes only the convenient part of one source.
 if(base.skipped||base.unsupported.length)return{...empty,skipped:true,unsupported:base.unsupported};
 const maps=base.sites.filter(s=>s.kind==='map');if(!maps.length)return empty;
 const ast=parse(base.code,{sourceType,plugins:['jsx']}),begins=new Map(),intervalSites=[];
 const member=(n,name)=>t.isMemberExpression(n)&&!n.computed&&t.isIdentifier(n.object,{name:'__sa_array_calls'})&&t.isIdentifier(n.property,{name});
 const clone=n=>t.cloneNode(n,true),hook=(name,args)=>t.callExpression(t.memberExpression(t.identifier('__sa_callback_copy'),t.identifier(name)),args);
 try{
  traverse(ast,{CallExpression(p){if(!member(p.node.callee,'begin'))return;
   const n=p.node,parent=p.parentPath;if(n.arguments.length!==3||!parent.isAssignmentExpression({operator:'='})||!t.isIdentifier(parent.node.left))throw Error('begin shape');
   const binding=parent.scope.getBinding(parent.node.left.name);if(!binding||begins.has(binding))throw Error('begin binding');
   const literal=n.arguments[2];const site=base.sites.find(s=>t.isObjectExpression(literal)&&literal.properties.length===8&&literal.properties.every(prop=>t.isObjectProperty(prop)&&!prop.computed&&!prop.shorthand&&t.isIdentifier(prop.key)&&Object.hasOwn(s,prop.key.name)&&(typeof s[prop.key.name]==='string'?t.isStringLiteral(prop.value,{value:s[prop.key.name]}):t.isNumericLiteral(prop.value,{value:s[prop.key.name]})))&&new Set(literal.properties.map(prop=>prop.key.name)).size===8);if(!site)throw Error('begin site');begins.set(binding,site);
  }});
  traverse(ast,{ArrowFunctionExpression(p){
   const found=[];p.traverse({Function(q){q.skip();},CallExpression(q){if(member(q.node.callee,'yielded')&&q.getFunctionParent()===p)found.push(q);}});
   if(!found.length)return;const first=found[0].node.arguments;
   if(first.length!==5||!first.slice(0,4).every(n=>t.isIdentifier(n)))throw Error('yield shape');
   const binding=p.scope.getBinding(first[0].name),site=begins.get(binding);if(!site)throw Error('yield token binding');if(site.kind!=='map')return;
   const condition=p.parentPath;if(!condition.isConditionalExpression()||condition.node.consequent!==p.node||!t.isIdentifier(condition.node.test,{name:first[0].name})||condition.scope.getBinding(first[0].name)!==binding)throw Error('callback gate');
   if(!t.isBlockStatement(p.node.body)||p.node.params.length!==2||!t.isIdentifier(p.node.params[0])||!t.isRestElement(p.node.params[1])||!t.isIdentifier(p.node.params[1].argument))throw Error('callback parameters');
   const start=p.node.body.body[0];if(!t.isVariableDeclaration(start,{kind:'const'})||start.declarations.length!==3)throw Error('callback inputs');
   for(let i=0;i<3;i++)if(!t.isIdentifier(start.declarations[i].id,{name:first[i+1].name}))throw Error('callback input binding');
   if(!t.isIdentifier(start.declarations[0].init,{name:p.node.params[0].name}))throw Error('callback item');
   for(let i=1;i<3;i++)if(!t.isMemberExpression(start.declarations[i].init,{computed:true})||!t.isIdentifier(start.declarations[i].init.object,{name:p.node.params[1].argument.name})||!t.isNumericLiteral(start.declarations[i].init.property,{value:i-1}))throw Error('callback rest inputs');
   const frame=p.scope.generateUidIdentifier('saCallbackFrame');
   for(const q of found){const a=q.node.arguments;if(a.length!==5)throw Error('yield arity');for(let i=0;i<4;i++)if(!t.isIdentifier(a[i],{name:first[i].name})||q.scope.getBinding(a[i].name)!==p.scope.getBinding(first[i].name))throw Error('yield lexical binding');q.node.arguments[4]=hook('returned',[clone(frame),a[4]]);}
   const entry=t.variableDeclaration('const',[t.variableDeclarator(clone(frame),hook('enter',[clone(first[0]),t.valueToNode(site),clone(first[1]),clone(first[2]),clone(first[3])]))]);
   const body=p.node.body.body.slice(1);p.node.body.body=[start,entry,t.tryStatement(t.blockStatement(body),null,t.blockStatement([t.expressionStatement(hook('exit',[clone(frame)]))]))];intervalSites.push(site);
  }});
  if(begins.size!==base.sites.length||intervalSites.length!==maps.length||new Set(intervalSites.map(s=>s.id)).size!==maps.length)throw Error('interval coverage');
 }catch{return refuse('Generated array callback grammar/binding/coverage not admitted');}
 return{...empty,code:generate(ast,{comments:true},source).code,sites:base.sites,intervalSites,recipe:'stateatom.callback-copy-interval-source/1'};
}
