// SPDX-License-Identifier: Apache-2.0
// Research-only call-site capture, no product importer or application callback wrapper.
import{parse}from'@babel/parser';import traverseModule from'@babel/traverse';import generatorModule from'@babel/generator';import*as t from'@babel/types';import{createHash}from'node:crypto';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export function instrumentArrayCallsites(source,file,{enabled=false,sourceType='module'}={}){
 const sourceDigest=hash(source),empty={code:source,sites:[],unsupported:[],sourceDigest,skipped:false};if(!enabled)return empty;
 let ast;try{ast=parse(source,{sourceType,plugins:['jsx']});}catch{return{...empty,skipped:true,unsupported:[{file,reason:'Source grammar not admitted'}]};}
 let collision=false,dynamic=false;traverse(ast,{Identifier(p){if(p.node.name==='__sa_array_calls')collision=true;},WithStatement(){dynamic=true;},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))dynamic=true;}});
 if(collision||dynamic)return{...empty,skipped:true,unsupported:[{file,reason:collision?'Reserved observer binding collision':'Dynamic eval/with source scope unsupported'}]};
 const runtime=t.identifier('__sa_array_calls'),clone=n=>t.cloneNode(n,true),hook=(name,args)=>t.callExpression(t.memberExpression(clone(runtime),t.identifier(name)),args),void0=()=>t.unaryExpression('void',t.numericLiteral(0));
 const kindOf=n=>{const c=n.callee;if(!t.isMemberExpression(c)&&!t.isOptionalMemberExpression(c))return null;const key=!c.computed&&t.isIdentifier(c.property)?c.property.name:c.computed&&t.isStringLiteral(c.property)?c.property.value:null;return['filter','map'].includes(key)?key:null;};
 const records=new Map(),unsupported=[];
 function parameterContext(p){for(let q=p;q;q=q.parentPath)if(q.listKey==='params')return true;return false;}
 function ownerBoundary(owner){
  if(!owner||!owner.isFunctionDeclaration()&&!owner.isFunctionExpression()&&!owner.isArrowFunctionExpression()||owner.node.async||owner.node.generator)return'Unsupported function owner';
  if(owner.findParent(q=>q.isClass()||q.isClassMethod()||q.isClassPrivateMethod()||q.isObjectMethod()))return'Class/method owner context unsupported';
  let hoisted=false;owner.traverse({Function(q){if(q.isFunctionDeclaration())hoisted=true;q.skip();}});return hoisted?'Owner hoisted function declaration unsupported':null;
 }
 function collect(p){
  const kind=kindOf(p.node);if(!kind)return;const n=p.node,c=n.callee,cb=p.get('arguments.0'),owner=p.getFunctionParent();
  const at={id:hash(file+'\0'+sourceDigest+'\0'+n.start+':'+n.end),file,sourceDigest,kind,line:n.loc.start.line,column:n.loc.start.column+1,endLine:n.loc.end.line,endColumn:n.loc.end.column+1};let reason=null;
  if(n.optional||c.optional||p.isOptionalCallExpression())reason='Optional array call not observed';
  else if(c.computed)reason='Computed array method not observed';
  else if(parameterContext(p))reason='Parameter evaluation context unsupported';
  else if(!cb?.isArrowFunctionExpression()||n.arguments.some(a=>t.isSpreadElement(a)))reason='Inline arrow callback without spread required';
  else if(cb.node.async||cb.node.generator)reason='Async/generator callback unsupported';
  else if(cb.node.params.length!==1||!t.isIdentifier(cb.node.params[0]))reason='One simple original callback parameter required';
  else if(cb.node.body.directives?.length)reason='Callback directive incompatible with rest capture';
  else reason=ownerBoundary(owner);
  if(!reason){let finalizer=false,nested=false,hoisted=false;cb.traverse({Function(q){if(q.isFunctionDeclaration())hoisted=true;q.skip();},TryStatement(q){if(q.node.finalizer)finalizer=true;}});cb.traverse({CallExpression(q){if(kindOf(q.node))nested=true;},OptionalCallExpression(q){if(kindOf(q.node))nested=true;}});if(hoisted)reason='Callback hoisted function declaration can replace original parameter';else if(finalizer)reason='Callback finalizer can replace returned value';else if(nested)reason='Nested array call callback outside this observation profile';}
  records.set(n,{path:p,node:n,kind,cb,owner,site:at,reason});if(reason)unsupported.push({...at,reason});
 }
 traverse(ast,{CallExpression:collect,OptionalCallExpression:collect});
 const admitted=[...records.values()].filter(x=>!x.reason);if(!admitted.length)return{...empty,unsupported};if(admitted.length>256)return{...empty,skipped:true,unsupported:[{file,reason:'Source site capacity exceeded'}]};
 const owners=new Map(),sites=[];
 function temporaries(owner){const ids=['saArrReceiver','saArrMethod','saArrToken'].map(name=>owner.scope.generateUidIdentifier(name));const list=owners.get(owner.node)||[];list.push(ids);owners.set(owner.node,list);return ids;}
 function callback(node,path,token){
  const next=clone(node),rest=path.scope.generateUidIdentifier('saArrArgs'),item=path.scope.generateUidIdentifier('saArrInput'),index=path.scope.generateUidIdentifier('saArrIndex'),array=path.scope.generateUidIdentifier('saArrArray');next.params.push(t.restElement(clone(rest)));
  if(!t.isBlockStatement(next.body))next.body=t.blockStatement([t.returnStatement(next.body)]);
  const returned=value=>hook('yielded',[clone(token),clone(item),clone(index),clone(array),value||void0()]);
  traverse(t.file(t.program([t.expressionStatement(next)])),{Function(p){if(p.node!==next)p.skip();},ReturnStatement(p){if(p.getFunctionParent()?.node!==next)return;p.node.argument=returned(p.node.argument);p.skip();}});
  next.body.body.unshift(t.variableDeclaration('const',[t.variableDeclarator(clone(item),clone(next.params[0])),t.variableDeclarator(clone(index),t.memberExpression(clone(rest),t.numericLiteral(0),true)),t.variableDeclarator(clone(array),t.memberExpression(clone(rest),t.numericLiteral(1),true))]));
  next.body.body.push(t.returnStatement(returned(void0())));return next;
 }
 traverse(ast,{CallExpression:{exit(p){
  const r=records.get(p.node);if(!r||r.reason)return;const n=p.node,[receiver,method,token]=temporaries(r.owner),args=n.arguments.map(clone);args[0]=t.conditionalExpression(clone(token),callback(n.arguments[0],r.cb,token),clone(n.arguments[0]));
  const assign=(id,value)=>t.assignmentExpression('=',clone(id),value),release=ids=>ids.map(id=>assign(id,t.nullLiteral()));
  const originalCall=hook('apply',[clone(method),clone(receiver),t.arrayExpression(args)]);
  const expression=t.sequenceExpression([hook('abort',[clone(token)]),assign(receiver,n.callee.object),assign(method,t.memberExpression(clone(receiver),clone(n.callee.property))),assign(token,hook('begin',[clone(method),clone(receiver),t.valueToNode(r.site)])),hook('finish',[clone(token),originalCall,...release([receiver,method,token])])]);
  p.replaceWith(expression);p.skip();sites.push(r.site);
 }}});
 // Clean up generated strong temporaries without adding an application call frame.
 traverse(ast,{Function(p){const groups=owners.get(p.node);if(!groups)return;const original=t.isBlockStatement(p.node.body)?p.node.body:t.blockStatement([t.returnStatement(p.node.body)]),body=original.body,ids=groups.flat(),cleanup=[];
  for(const[receiver,method,token]of groups){cleanup.push(t.expressionStatement(hook('abort',[clone(token)])));for(const id of[receiver,method,token])cleanup.push(t.expressionStatement(t.assignmentExpression('=',clone(id),t.nullLiteral())));}
  const replacement=t.blockStatement([t.variableDeclaration('let',ids.map(id=>t.variableDeclarator(clone(id)))),t.tryStatement(t.blockStatement(body),null,t.blockStatement(cleanup))]);replacement.directives=original.directives;p.node.body=replacement;
 }});
 sites.sort((a,b)=>a.line-b.line||a.column-b.column);return{code:generate(ast,{comments:true},source).code,sites,unsupported,sourceDigest,skipped:false};
}
