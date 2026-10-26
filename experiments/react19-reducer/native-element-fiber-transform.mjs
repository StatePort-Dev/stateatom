// SPDX-License-Identifier: Apache-2.0
// Research source events only. Emission is not a committed-instance observation.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {createHash} from 'node:crypto';
import {transformPinnedReact19,react19Profile} from '../../src/engine/react19-vendor.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const hash=s=>createHash('sha256').update(s).digest('hex'),nativeFile='react-dom/cjs/react-dom-client.development.js';
const shapes={createFiberFromElement:['element','mode','lanes'],updateElement:['returnFiber','current','element','lanes'],reconcileChildFibersImpl:['returnFiber','currentFirstChild','newChild','lanes']};
const helper=`const __saElementFiberOwn=Object.getOwnPropertyDescriptor,__saElementFiberApply=Reflect.apply;
function __saElementFiberTap(fiber,element,site){try{const d=__saElementFiberOwn(globalThis,'__STATEATOM_ELEMENT_FIBER_TAP__'),f=d&&__saElementFiberOwn(d,'value')?.value;if(typeof f==='function')__saElementFiberApply(f,undefined,['element-fiber',fiber,element,site]);}catch{}return fiber;}`;
function sites(ast){
 const owners=new Map();
 traverse(ast,{FunctionDeclaration(p){const name=p.node.id?.name;if(!Object.hasOwn(shapes,name))return;if(owners.has(name))throw Error('Duplicate native element owner');owners.set(name,p);}});
 if(owners.size!==3)throw Error('Three native element owners required');
 const found=[];
 for(const [name,fn] of owners){
  const params=shapes[name];if(fn.node.async||fn.node.generator||fn.node.params.length!==params.length||!params.every((n,i)=>t.isIdentifier(fn.node.params[i],{name:n})))throw Error('Closed native element parameters required');
  const binding=n=>fn.scope.getBinding(n),same=(p,n)=>p.scope.getBinding(n)===binding(n)&&binding(n)?.kind==='param';
  let unsafe=false;fn.get('body').traverse({Function(p){p.skip();},WithStatement(){unsafe=true;},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))unsafe=true;}});if(unsafe)throw Error('Dynamic native element scope refused');
  if(name==='createFiberFromElement'){
   if(!binding('element').constant)throw Error('Stable native element argument required');
   const returns=[],calls=[];fn.get('body').traverse({Function(p){p.skip();},ReturnStatement(p){returns.push(p);},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'createFiberFromTypeAndProps'}))calls.push(p);}});
   if(returns.length!==1||!t.isIdentifier(returns[0].node.argument,{name:'mode'})||!same(returns[0],'mode')||calls.length!==1)throw Error('One original created fiber return required');
   const call=calls[0],n=call.node,b=call.scope.getBinding('createFiberFromTypeAndProps'),a=call.parentPath;
   if(!b?.constant||!b.path.isFunctionDeclaration()||!a.isAssignmentExpression({operator:'='})||!t.isIdentifier(a.node.left,{name:'mode'})||!same(a,'mode')||binding('mode').constantViolations.length!==1||binding('mode').constantViolations[0].node!==a.node||n.arguments.length!==6)throw Error('Closed original fiber creation binding required');
   for(const [i,key] of ['type','key','props','_owner'].entries())if(!t.isMemberExpression(n.arguments[i],{computed:false})||!t.isIdentifier(n.arguments[i].object,{name:'element'})||!t.isIdentifier(n.arguments[i].property,{name:key})||!same(call,'element'))throw Error('Original element creation operands required');
   if(!t.isIdentifier(n.arguments[4],{name:'mode'})||!t.isIdentifier(n.arguments[5],{name:'lanes'}))throw Error('Original mode/lanes required');
   found.push({role:'create',owner:name,path:returns[0],expression:returns[0].get('argument'),element:'element'});
  }else{
   const element=name==='updateElement'?'element':'newChild',prior=name==='updateElement'?'current':'currentFirstChild',target=name==='updateElement'?'current':'lanes',calls=[];
   fn.get('body').traverse({Function(p){p.skip();},CallExpression(p){const n=p.node;if(t.isIdentifier(n.callee,{name:'useFiber'})&&n.arguments.some(a=>t.isMemberExpression(a)&&t.isIdentifier(a.object,{name:element})&&t.isIdentifier(a.property,{name:'props'})))calls.push(p);}});
   if(calls.length!==1)throw Error('One original element reuse call required');
   const call=calls[0],n=call.node,b=call.scope.getBinding('useFiber'),assignment=call.parentPath;
   if(!b?.constant||!b.path.isFunctionDeclaration()||!assignment.isAssignmentExpression({operator:'='})||!t.isIdentifier(assignment.node.left,{name:target})||!same(assignment,target)||n.arguments.length!==2||!t.isIdentifier(n.arguments[0],{name:prior})||!same(call,prior)||!same(call,element)||!t.isMemberExpression(n.arguments[1],{computed:false})||n.arguments[1].optional||!t.isIdentifier(n.arguments[1].object,{name:element})||!t.isIdentifier(n.arguments[1].property,{name:'props'}))throw Error('Closed native element reuse operands/binding required');
   if(name==='updateElement'&&!binding(element).constant||binding(element).constantViolations.some(p=>p.getFunctionParent()!==fn))throw Error('Native element scope mutation refused');
   found.push({role:name==='updateElement'?'update':'single',owner:name,path:call,expression:call,element});
  }
 }
 return found.sort((a,b)=>['create','update','single'].indexOf(a.role)-['create','update','single'].indexOf(b.role));
}
export function instrumentElementFiberGrammar(source,file,{originalSource=source}={}){
 if(typeof source!=='string'||typeof originalSource!=='string'||typeof file!=='string')throw TypeError('Source/file required');
 const empty={code:source,skipped:false,unsupported:[],policy:null,counts:{create:0,update:0,single:0},sourceDigest:hash(originalSource),inputDigest:hash(source),sourceOnly:true,nativeVersionAdmitted:false};
 const refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});
 if(file!==nativeFile||Buffer.byteLength(source)>4*1024*1024||Buffer.byteLength(originalSource)>4*1024*1024||source.includes('__saElementFiber')||originalSource.includes('__saElementFiber'))return refuse('Native element input/profile bound or helper collision');
 try{
  const ast=parse(source,{sourceType:'script'}),original=parse(originalSource,{sourceType:'script'}),targets=sites(ast),originals=sites(original),records=[];
  for(let i=0;i<targets.length;i++){
   const target=targets[i],n=originals[i].path.node,l=n.loc;
   if(target.role!==originals[i].role||target.owner!==originals[i].owner)throw Error('Original native element correspondence refused');
   const site={id:hash(file+'\0'+empty.sourceDigest+'\0'+n.start+':'+n.end+':'+target.role),file,sourceDigest:empty.sourceDigest,kind:'native-element-fiber',owner:target.owner,role:target.role,line:l.start.line,column:l.start.column+1,endLine:l.end.line,endColumn:l.end.column+1};records.push(site);
   target.expression.replaceWith(t.callExpression(t.identifier('__saElementFiberTap'),[target.expression.node,t.identifier(target.element),t.stringLiteral(site.id)]));target.expression.skip();
  }
  ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);const code=generate(ast,{comments:true},source).code;parse(code,{sourceType:'script'});
  return{...empty,code,counts:{create:1,update:1,single:1},policy:{schema:'stateatom.native-element-fiber-source/1',file,sourceDigest:empty.sourceDigest,sites:records,nativeVersionAdmitted:false},outputDigest:hash(code),recipe:'stateatom.native-element-fiber-source/1',scope:'Provisional original native element/produced-fiber references; committed instance and property origins unproven'};
 }catch{return refuse('Closed native element ownership/grammar refused');}
}
export function transformPinnedElementFiber(source,file=nativeFile){
 if(file!==nativeFile)throw Error('Only pinned ReactDOM element input admitted');
 const base=transformPinnedReact19(source,file),r=instrumentElementFiberGrammar(base.code,file,{originalSource:source});
 if(r.skipped)throw Error('Pinned native element grammar refused');
 return{...r,nativeVersionAdmitted:true,version:react19Profile.version,policy:{...r.policy,version:react19Profile.version,nativeVersionAdmitted:true},baseSourceDigest:base.sourceDigest,baseOutputDigest:base.outputDigest,baseCounts:base.counts};
}
