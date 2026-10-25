// SPDX-License-Identifier: Apache-2.0
// Closed original App ESM profile; no tuple slot reads or native state inference.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export function instrumentAppHookBinding(source,file,{enabled=false,sourceType='module'}={}){
 if(typeof source!=='string'||typeof file!=='string'||!file||file.length>1024)throw TypeError('Source text and bounded App file required');
 const sourceDigest=hash(source),empty={code:source,sourceDigest,appSite:null,bindingSite:null,unsupported:[],skipped:false,sourceOnly:true,nativeRuntimeProven:false};
 const refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});if(!enabled)return empty;if(sourceType!=='module'||Buffer.byteLength(source)>1024*1024)return refuse('Bounded strict App module required');
 let ast;try{ast=parse(source,{sourceType,plugins:['jsx']});}catch{return refuse('App source grammar not admitted');}
 let app=null,functions=0,unsafe=false;
 traverse(ast,{Identifier(p){if(p.node.name==='__sa_app_hook_binding')unsafe=true;},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))unsafe=true;},FunctionDeclaration(p){if(p.node.id?.name!=='App')return;functions++;if(p.parentPath.isProgram()||p.parentPath.isExportNamedDeclaration()&&p.parentPath.parentPath.isProgram())app=p;}});
 if(unsafe||functions!==1||!app||app.node.async||app.node.generator||app.node.params.length)return refuse('One normal App() without eval or reserved binding required');
 const ownReturns=[];app.get('body').traverse({Function(p){if(p.isFunctionDeclaration())unsafe=true;p.skip();},VariableDeclaration(p){if(p.node.kind==='var')unsafe=true;},TryStatement(p){if(p.node.finalizer)unsafe=true;},ReturnStatement(p){ownReturns.push(p);}});
 if(unsafe||ownReturns.length!==1||!t.isJSXElement(ownReturns[0].node.argument)&&!t.isJSXFragment(ownReturns[0].node.argument))return refuse('One App JSX return without var/hoisted declaration/finalizer required');
 function imported(binding,name,module){const p=binding?.path;return p?.isImportSpecifier()&&t.isIdentifier(p.node.imported,{name})&&p.node.local.name===name&&p.parentPath.node.source.value===module;}
 const reducerBinding=app.scope.getBinding('useReducer'),methodImported=imported(reducerBinding,'useReducer','react');if(!methodImported)return refuse('Original named React.useReducer import required');
 let calls=0,declaration=null,call=null;
 traverse(ast,{CallExpression(p){if(!t.isIdentifier(p.node.callee,{name:'useReducer'})||p.scope.getBinding('useReducer')!==reducerBinding)return;calls++;
  const d=p.parentPath,v=d.parentPath;if(!d.isVariableDeclarator()||d.node.init!==p.node||!v.isVariableDeclaration({kind:'const'})||v.node.declarations.length!==1||v.parentPath.node!==app.node.body||!t.isArrayPattern(d.node.id)||d.node.id.elements.length!==2||!t.isIdentifier(d.node.id.elements[0],{name:'todos'})||!t.isIdentifier(d.node.id.elements[1],{name:'dispatch'}))return;
  if(p.node.arguments.length!==2||!t.isIdentifier(p.node.arguments[0],{name:'todoReducer'})||!t.isArrayExpression(p.node.arguments[1])||p.node.arguments[1].elements.length||!imported(p.scope.getBinding('todoReducer'),'todoReducer','./reducer'))return;
  declaration=v;call=p;
 }});
 if(calls!==1||!declaration||!call)return refuse('One original const [todos,dispatch]=useReducer(todoReducer,[]) required');
 const describe=(p,kind,extra)=>{const n=p.node,l=n.loc;return{id:hash(file+'\0'+sourceDigest+'\0'+n.start+':'+n.end+':'+kind),file,sourceDigest,kind,line:l.start.line,column:l.start.column+1,endLine:l.end.line,endColumn:l.end.column+1,...extra};};
 const appSite=describe(app,'app-hook-function',{functionName:'App'}),bindingSite=describe(declaration,'app-hook-binding',{callName:'useReducer',todosBinding:'todos',dispatchBinding:'dispatch'});
 const clone=n=>t.cloneNode(n,true),hook=(name,args)=>t.callExpression(t.memberExpression(t.identifier('__sa_app_hook_binding'),t.identifier(name)),args),frame=app.scope.generateUidIdentifier('saAppFrame'),method=app.scope.generateUidIdentifier('saAppMethod'),tuple=app.scope.generateUidIdentifier('saAppTuple'),output=app.scope.generateUidIdentifier('saAppResult');
 try{
  const pattern=clone(declaration.node.declarations[0].id),args=call.node.arguments.map(clone),callee=clone(call.node.callee);
  declaration.replaceWithMultiple([
   t.variableDeclaration('const',[t.variableDeclarator(clone(method),callee)]),
   t.variableDeclaration('const',[t.variableDeclarator(clone(tuple),t.callExpression(clone(method),args))]),
   t.expressionStatement(hook('result',[clone(frame),clone(tuple),clone(method),t.stringLiteral(bindingSite.id)])),
   t.variableDeclaration('const',[t.variableDeclarator(pattern,clone(tuple))]),
   t.expressionStatement(hook('bound',[clone(frame),clone(tuple),t.identifier('todos'),t.identifier('dispatch'),t.stringLiteral(bindingSite.id)]))
  ]);
  const returnPath=ownReturns[0],value=returnPath.node.argument;
  returnPath.replaceWith(t.blockStatement([t.variableDeclaration('const',[t.variableDeclarator(clone(output),value)]),t.returnStatement(hook('appReturned',[clone(frame),clone(output)]))]));
  const body=app.node.body.body;app.node.body.body=[t.variableDeclaration('const',[t.variableDeclarator(clone(frame),hook('appEnter',[t.stringLiteral(appSite.id)]))]),t.tryStatement(t.blockStatement(body),null,t.blockStatement([t.expressionStatement(hook('appExit',[clone(frame)]))]))];
  const code=generate(ast,{comments:true},source).code;parse(code,{sourceType:'module',plugins:['jsx']});return{...empty,code,appSite,bindingSite,recipe:'stateatom.app-hook-binding-source/1'};
 }catch{return refuse('Generated App binding/body coverage not admitted');}
}
