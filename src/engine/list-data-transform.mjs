// SPDX-License-Identifier: Apache-2.0
// Bounded original creation/call instrumentation. Callback/owner framing adapts
// experiments/react19-reducer/array-callsite-transform.mjs; its evidence stays separate.
import {createHash} from 'node:crypto';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export function instrumentListData(source,file,{sites,observerName,sourceType='module',ast:providedAst=null}={}){
 const refuse=reason=>({status:'Unknown/Unsupported',code:source,sites:[],unsupported:[reason],fullPath:false});
 if(typeof source!=='string'||Buffer.byteLength(source)>2*1024*1024||typeof file!=='string'||!file||!Array.isArray(sites)||sites.length>512||typeof observerName!=='string'||!t.isValidIdentifier(observerName)||observerName==='arguments')return refuse('Invalid bounded data recipe');
 try{
  const digest=hash(source),original=parse(source,{sourceType,plugins:['jsx','typescript']}),ast=providedAst||original,byRange=new Map(),targets=[],owners=new Map();let program,unsafe=false;
  for(const site of sites){if(site.file!==file)continue;if(site.sourceDigest!==digest||!Number.isSafeInteger(site.start)||!Number.isSafeInteger(site.end)||site.end<=site.start||byRange.has(site.start+':'+site.end)||site.id!==hash(digest+':'+site.start+':'+site.end+':'+site.kind))throw Error('Exact original data-site identity required');byRange.set(site.start+':'+site.end,site);}
  traverse(original,{Identifier(p){if(p.node.name===observerName||p.node.name==='eval'&&!p.scope.getBinding('eval'))unsafe=true;},Program(p){if(p.scope.hasOwnBinding('Reflect'))unsafe=true;},WithStatement(){unsafe=true;}});
  if(unsafe)throw Error('Closed original helper scope required');
  traverse(ast,{Program(p){program=p;},enter(p){const site=byRange.get(p.node.start+':'+p.node.end);if(!site||p.node.end!==site.end)return;if(targets.some(r=>r.site===site))throw Error('Ambiguous original range');targets.push({p,site});}});
  if(targets.length!==byRange.size)throw Error('Original data site missing from compiler AST');
  const clone=n=>t.cloneNode(n,true),nil=()=>t.nullLiteral(),unique=name=>{let n;do{n=program.scope.generateUidIdentifier(name)}while(n.name===observerName);return n;};
  const event=unique('saDataEvent'),value=unique('saDataValue'),apply=unique('saDataApply');
  const observe=(kind,args=[])=>t.callExpression(clone(event),[t.stringLiteral(kind),...args]);
  const identity=(kind,a,b,c,d,expression)=>t.callExpression(clone(value),[t.stringLiteral(kind),a||nil(),b||nil(),c||nil(),d||nil(),expression]);
  function ownerFor(p){
   for(let q=p;q;q=q.parentPath)if(q.listKey==='params')throw Error('Parameter evaluation unsupported');const fn=p.getFunctionParent();
   if(!fn||!fn.isFunctionDeclaration()&&!fn.isFunctionExpression()&&!fn.isArrowFunctionExpression()||fn.node.async||fn.node.generator||fn.findParent(q=>q.isClass()||q.isObjectMethod()))throw Error('Synchronous ordinary owner required');
   let hoisted=false;fn.traverse({Function(q){if(q.isFunctionDeclaration())hoisted=true;q.skip();}});if(hoisted)throw Error('Owner function hoisting unsupported');
   let owner=owners.get(fn.node);if(!owner){owner={fn,ids:[],calls:[]};owners.set(fn.node,owner);}return owner;
  }
  const rowTargets=[],callTargets=[],emptyTargets=[];
  for(const record of targets){const{p,site}=record;record.owner=ownerFor(p);
   if(site.kind==='empty-array'){if(!p.isArrayExpression()||p.node.elements.length)throw Error('Original empty array required');emptyTargets.push(record);continue;}
   if(site.kind==='row-literal'){
    if(!p.isObjectExpression()||!p.node.properties.length||p.node.properties.length>16)throw Error('Bounded original row literal required');const keys=new Set();
    for(const prop of p.node.properties){if(t.isSpreadElement(prop))continue;const key=!prop.computed&&(t.isIdentifier(prop.key)?prop.key.name:t.isStringLiteral(prop.key)?prop.key.value:null);if(!t.isObjectProperty(prop)||!key||key.length>128||['__proto__','constructor','prototype'].includes(key)||keys.has(key))throw Error('Ordinary data fields required');keys.add(key);}
    record.site={...site,properties:p.node.properties.map(prop=>t.isSpreadElement(prop)?{kind:'spread'}:{kind:'field',key:t.isIdentifier(prop.key)?prop.key.name:prop.key.value})};rowTargets.push(record);continue;
   }
   if(site.kind!=='array-call'||!p.isCallExpression()||p.node.optional||!t.isMemberExpression(p.node.callee)||p.node.callee.optional||p.node.callee.computed||!t.isIdentifier(p.node.callee.property,{name:site.method})||!['concat','map','filter','every'].includes(site.method)||p.node.arguments.length!==1||t.isSpreadElement(p.node.arguments[0]))throw Error('Original one-argument array call required');
   if(site.method!=='concat'){
    const cb=p.get('arguments.0');if(!cb.isArrowFunctionExpression()||cb.node.async||cb.node.generator||cb.node.params.length!==1||!t.isIdentifier(cb.node.params[0])||cb.node.body.directives?.length)throw Error('One original arrow callback parameter required');
    let unsafe=false;cb.traverse({Function(q){if(q.isFunctionDeclaration())unsafe=true;q.skip();},TryStatement(q){if(q.node.finalizer)unsafe=true;},CallExpression(q){if(byRange.get(q.node.start+':'+q.node.end)?.kind==='array-call')unsafe=true;}});if(unsafe)throw Error('Nested/finalizing callback unsupported');
   }
   callTargets.push(record);
  }
  // Capture original field values as they are evaluated, then the completed object.
  for(const{p,site,owner}of rowTargets.sort((a,b)=>b.site.start-a.site.start)){
   const token=owner.fn.scope.generateUidIdentifier('saRowToken');owner.ids.push(token);let spread=0;
   for(const prop of p.node.properties){if(t.isSpreadElement(prop)){prop.argument=identity('row-spread',clone(token),t.numericLiteral(spread++),null,null,prop.argument);continue;}const key=t.isIdentifier(prop.key)?prop.key.name:prop.key.value;prop.shorthand=false;prop.value=identity('row-field',clone(token),t.stringLiteral(key),null,null,prop.value);}
   p.replaceWith(t.sequenceExpression([t.assignmentExpression('=',clone(token),observe('row-begin',[t.stringLiteral(site.id)])),identity('row-end',clone(token),null,null,null,p.node)]));
  }
  for(const{p,site}of emptyTargets)p.replaceWith(identity('empty-array',t.stringLiteral(site.id),null,null,null,p.node));
  // Finish row-only callback locals before cloning the original callback below.
  for(const owner of owners.values())if(owner.ids.length){if(!t.isBlockStatement(owner.fn.node.body))owner.fn.node.body=t.blockStatement([t.returnStatement(owner.fn.node.body)]);owner.fn.get('body').unshiftContainer('body',t.variableDeclaration('let',owner.ids.map(id=>t.variableDeclarator(clone(id)))));owner.ids=[];}
  for(const{p,site,owner}of callTargets.sort((a,b)=>b.site.start-a.site.start||a.site.end-b.site.end)){
   const n=p.node,receiver=owner.fn.scope.generateUidIdentifier('saListReceiver'),method=owner.fn.scope.generateUidIdentifier('saListMethod'),token=owner.fn.scope.generateUidIdentifier('saListCall');owner.ids.push(receiver,method,token);owner.calls.push([receiver,method,token]);let argument=n.arguments[0];
   if(site.method==='concat')argument=identity('concat-arg',clone(token),null,null,null,argument);
   else{
    const originalCallback=clone(argument),cb=clone(argument),rest=unique('saListArgs'),item=unique('saListItem'),index=unique('saListIndex'),array=unique('saListArray');cb.params.push(t.restElement(clone(rest)));if(!t.isBlockStatement(cb.body))cb.body=t.blockStatement([t.returnStatement(cb.body)]);
    const yielded=expr=>identity('array-yield',clone(token),clone(item),clone(index),clone(array),expr||t.unaryExpression('void',t.numericLiteral(0)));
    traverse(t.file(t.program([t.expressionStatement(cb)])),{Function(q){if(q.node!==cb)q.skip();},ReturnStatement(q){if(q.getFunctionParent()?.node!==cb)return;q.node.argument=yielded(q.node.argument);q.skip();}});
    cb.body.body.unshift(t.variableDeclaration('const',[t.variableDeclarator(clone(item),clone(cb.params[0])),t.variableDeclarator(clone(index),t.memberExpression(clone(rest),t.numericLiteral(0),true)),t.variableDeclarator(clone(array),t.memberExpression(clone(rest),t.numericLiteral(1),true))]));cb.body.body.splice(1,0,t.expressionStatement(observe('array-entry',[clone(token),clone(item),clone(index),clone(array)])));cb.body.body.push(t.returnStatement(yielded()));argument=t.conditionalExpression(clone(token),cb,originalCallback);
   }
   const assign=(id,expr)=>t.assignmentExpression('=',clone(id),expr),nativeCall=t.callExpression(clone(apply),[clone(method),clone(receiver),t.arrayExpression([argument])]);
   const finish=identity('array-end',clone(token),null,null,null,nativeCall);
   // Function arguments are evaluated left-to-right: clear strong temporaries only
   // after the original native call returns, while passing its actual result once.
   finish.arguments.push(assign(receiver,nil()),assign(method,nil()),assign(token,nil()));
   p.replaceWith(t.sequenceExpression([observe('array-abort',[clone(token)]),assign(receiver,n.callee.object),assign(method,t.memberExpression(clone(receiver),clone(n.callee.property))),assign(token,observe('array-begin',[clone(method),clone(receiver),t.stringLiteral(site.id)])),finish]));
  }
  for(const owner of owners.values())if(owner.calls.length){const original=t.isBlockStatement(owner.fn.node.body)?owner.fn.node.body:t.blockStatement([t.returnStatement(owner.fn.node.body)]),cleanup=[];for(const[receiver,method,token]of owner.calls){cleanup.push(t.expressionStatement(observe('array-abort',[clone(token)])));for(const id of[receiver,method,token])cleanup.push(t.expressionStatement(t.assignmentExpression('=',clone(id),nil())));}const body=t.blockStatement([t.variableDeclaration('let',owner.ids.map(id=>t.variableDeclarator(clone(id)))),t.tryStatement(t.blockStatement(original.body),null,t.blockStatement(cleanup))]);body.directives=original.directives;owner.fn.node.body=body;}
  const names=['kind','a','b','c','d','result'].map(n=>unique(n));ast.program.body.unshift(t.variableDeclaration('const',[t.variableDeclarator(clone(apply),t.memberExpression(t.identifier('Reflect'),t.identifier('apply')))]),t.functionDeclaration(clone(event),names.map(clone),t.blockStatement([t.tryStatement(t.blockStatement([t.returnStatement(t.callExpression(t.identifier(observerName),names.map(clone)))]),t.catchClause(null,t.blockStatement([t.returnStatement(nil())])))])),t.functionDeclaration(clone(value),names.map(clone),t.blockStatement([t.expressionStatement(t.callExpression(clone(event),names.map(clone))),t.returnStatement(clone(names[5]))])));
  return{status:'Code-linked list data',code:generate(ast,{comments:true,retainLines:true},source).code,sites:targets.map(r=>r.site),unsupported:[],sourceDigest:digest,fullPath:false,scope:'Original creation/operands/callback returns only; no unobserved-write or code-interval authority'};
 }catch{return refuse('Original bounded list data grammar refused');}
}
