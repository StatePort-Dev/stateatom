// SPDX-License-Identifier: Apache-2.0
// Source-only, bounded extension of the existing analyzer/evidence graph.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {edge} from './evidence.mjs';
import {vueSourceUnit} from './vue-source.mjs';
const traverse=traverseModule.default||traverseModule;
const hash=s=>createHash('sha256').update(s).digest('hex');
const unknown=reason=>({status:'Unknown/Unsupported',reason,evidenceIds:[]});
export function analyzeActions(files,selection,identity,graph,projectFiles=files){
 const result=[],[file,line,digest,column]=String(selection.marker||'').split(':');
 if(selection.unbound||selection.markerOnSelected!==true||!file)return result;
 const cache=new Map(),objects=new WeakMap();
 function unit(f){if(cache.has(f.file))return cache.get(f.file);let ast,vue;if(f.file.endsWith('.vue')){vue=vueSourceUnit(f.file,f.text);if(!vue)return null;ast=vue.ast;}else try{ast=parse(f.text,{sourceType:'unambiguous',plugins:['jsx','typescript']});}catch{return null;}let dynamicScope=false;traverse(ast,{WithStatement(){dynamicScope=true;},CallExpression(p){if(p.get('callee').isIdentifier({name:'eval'}))dynamicScope=true;}});const u={...f,ast,vue,dynamicScope,sourceDigest:hash(f.text)};cache.set(f.file,u);return u;}
 const f=files.find(f=>f.file===file&&hash(f.text).slice(0,12)===digest),u=f&&unit(f);if(!u)return result;
 const location=(p,u)=>({file:u.file,line:p.node.loc.start.line,column:p.node.loc.start.column+1,endLine:p.node.loc.end.line,endColumn:p.node.loc.end.column+1,sourceDigest:u.sourceDigest});
 let evidenceCount=0;
 function proof(from,source,relation,status='Code-linked',method='Lexical AST source relation; execution not observed'){
  const id='action-evidence:'+evidenceCount++,to=id+':source';graph.nodes.push({id:to,kind:'action-source',...source});graph.edges.push({id,...edge(from,to,relation,status,method,['source:'+source.sourceDigest],identity)});return [id];
 }
 function importTarget(p,u){
  if(!p.isImportSpecifier()&&!p.isImportDefaultSpecifier())return null;
  const declaration=p.parentPath.node,relative=declaration.source.value;if(!relative.startsWith('.'))return null;
  const base=path.posix.normalize(path.posix.join(path.posix.dirname(u.file),relative));
  const candidates=projectFiles.filter(f=>[base,...['.ts','.tsx','.js','.jsx','/index.ts','/index.tsx','/index.js','/index.jsx'].map(e=>base+e)].includes(f.file));
  if(candidates.length!==1)return null;const other=unit(candidates[0]);if(!other)return null;
  const name=p.isImportDefaultSpecifier()?'default':p.node.imported.name;let target;
  traverse(other.ast,{ExportNamedDeclaration(q){if(name==='default'||q.node.source)return;const d=q.get('declaration');if(d.isFunctionDeclaration()&&d.node.id?.name===name||d.isVariableDeclaration()&&d.node.declarations.some(v=>v.id.type==='Identifier'&&v.id.name===name)){const b=q.scope.getBinding(name);if(b)target=b.path;}for(const s of q.node.specifiers)if(s.exported.name===name){const b=q.scope.getBinding(s.local.name);if(b)target=b.path;}},ExportDefaultDeclaration(q){if(name==='default'){const d=q.get('declaration');target=d.isIdentifier()?q.scope.getBinding(d.node.name)?.path:d;}}});
  if(target?.node.id?.type==='Identifier'&&target.scope.getBinding(target.node.id.name)?.constant===false)return null;
  return target?{p:target,u:other}:null;
 }
 function functionPath(p){return p?.isFunction()?p:p?.isVariableDeclarator()&&p.get('init').isFunction()?p.get('init'):null;}
 function eventMemberRead(ref){
  const member=ref.parentPath,container=member?.parentPath,attribute=container?.parentPath;
  return member?.isMemberExpression()&&member.get('object')===ref&&!member.node.computed&&!member.node.optional&&container?.isJSXExpressionContainer()&&container.get('expression')===member&&attribute?.isJSXAttribute()&&/^on[A-Z][A-Za-z0-9]*$/.test(attribute.node.name?.name);
 }
 function objectDeclaration(binding,u){
  if(objects.has(binding))return objects.get(binding);
  const decl=binding.path,init=decl.isVariableDeclarator()?decl.get('init'):null;
  let reason=null,properties=[];
  if(binding.kind!=='const'||!binding.constant||!decl.isVariableDeclarator()||!decl.get('id').isIdentifier()||!init?.isObjectExpression())reason='Member receiver is not a constant local object literal';
  else if(u.dynamicScope||binding.scope.path.isProgram()&&u.ast.program.sourceType!=='module')reason='Object receiver has a dynamic or global script scope boundary';
  else if(decl.parentPath.parentPath.isExportNamedDeclaration())reason='Exported object receiver may escape this source scope';
  else if(init.node.properties.length>64||binding.referencePaths.length>64)reason='Bounded object declaration budget exceeded';
  else if(binding.referencePaths.some(ref=>!eventMemberRead(ref)))reason='Object receiver has a write, escape or unsupported reference';
  else {
   properties=init.get('properties');const keys=new Set();
   for(const p of properties){const n=p.node,key=n.key?.name??n.key?.value;if(!(p.isObjectProperty()||p.isObjectMethod()&&n.kind==='method')||n.computed||key===undefined||key==='__proto__'||keys.has(String(key))){reason='Object spread/getter/computed/duplicate/prototype property boundary';break;}keys.add(String(key));}
  }
  const record={reason,properties};objects.set(binding,record);return record;
 }
 function resolveProp(p,u,from,depth,seen){
  const receiver=p.isMemberExpression()?p.get('object'):p,b=receiver.scope.getBinding(receiver.node.name),fn=b?.scope.path;
  if(!b?.constant||b.kind!=='param'||!fn?.isFunction()||u.dynamicScope)return unknown('Mutable, dynamic or unavailable callback parameter');
  const params=fn.get('params');if(params.length!==1)return unknown('Unsupported component parameter form');
  const parameter=params[0];let name,parameterPath;
  if(p.isIdentifier()&&parameter.isObjectPattern()){
   const props=parameter.get('properties');if(props.length>32||props.some(q=>!q.isObjectProperty()||q.node.computed||!q.get('value').isIdentifier()))return unknown('Default/rest/computed/nested callback parameter boundary');
   if(new Set(props.map(q=>String(q.node.key.name??q.node.key.value))).size!==props.length)return unknown('Duplicate callback parameter property boundary');
   const matches=props.filter(q=>q.node.value.name===p.node.name);if(matches.length!==1)return unknown('Ambiguous callback parameter');
   name=matches[0].node.key.name??matches[0].node.key.value;parameterPath=matches[0].get('value');
  }else if(p.isMemberExpression()&&!p.node.computed&&!p.node.optional&&parameter.isIdentifier({name:receiver.node.name})){
   if(b.referencePaths.some(ref=>{const member=ref.parentPath,container=member?.parentPath;return!member?.isMemberExpression()||member.get('object')!==ref||member.node.computed||member.node.optional||!container?.isJSXExpressionContainer()||container.get('expression')!==member;}))return unknown('Props receiver has a write, escape or unsupported reference');
   name=p.node.property.name;parameterPath=parameter;
  }else return unknown('Default/rest/computed/nested callback parameter boundary');
  let declaration,componentName;
  if(fn.isFunctionDeclaration()&&fn.node.id){declaration=fn;componentName=fn.node.id.name;}
  else if(fn.parentPath.isVariableDeclarator()&&fn.parentPath.get('id').isIdentifier()&&fn.parentPath.get('init')===fn){declaration=fn.parentPath;componentName=declaration.node.id.name;}
  if(!declaration||!/^\p{Lu}/u.test(componentName))return unknown('Component wrapper or dynamic owner declaration unavailable');
  const component=declaration.parentPath.scope.getBinding(componentName),statement=declaration.isVariableDeclarator()?declaration.parentPath:declaration;
  if(!component?.constant||component.path!==declaration||statement.parentPath.isExportNamedDeclaration()||statement.parentPath.isExportDefaultDeclaration()||component.scope.path.isProgram()&&u.ast.program.sourceType!=='module')return unknown('Callback prop component is exported, mutable or outside private source scope');
  const key=u.file+':prop:'+component.identifier.start+':'+name;if(seen.has(key))return unknown('Prop forwarding source cycle');seen=new Set([...seen,key]);
  if(component.referencePaths.length>64)return unknown('Bounded component reference budget exceeded');
  const sites=new Set();for(const ref of component.referencePaths){const tag=ref.parentPath;if(!ref.isJSXIdentifier()||ref.key!=='name'||!(tag.isJSXOpeningElement()||tag.isJSXClosingElement()))return unknown('Component has an escaped or dynamic caller');sites.add(tag.parentPath);}
  if(sites.size!==1)return unknown('No unique source supply: multiple or ambiguous component JSX callsites');
  const site=[...sites][0];let cursor=site,level=0;
  while(cursor.parentPath&&!cursor.parentPath.isFunction()){
   const parent=cursor.parentPath;if(++level>16)return unknown('Bounded JSX source supply depth exceeded');
   if(parent.isReturnStatement()&&cursor.key==='argument')break;
   if(parent.isJSXElement()&&cursor.listKey==='children'&&parent.node.openingElement.name.type==='JSXIdentifier'&&/^[a-z]/.test(parent.node.openingElement.name.name)||parent.isJSXFragment()&&cursor.listKey==='children'||parent.isJSXExpressionContainer()&&cursor.key==='expression'){cursor=parent;continue;}
   return unknown('JSX source supply may escape or be transformed by a caller');
  }
  if(!cursor.parentPath)return unknown('JSX source supply has no bounded component return');
  const attrs=site.get('openingElement.attributes');if(attrs.length>64||attrs.some(q=>q.isJSXSpreadAttribute()))return unknown('Component prop spread or attribute budget boundary');
  const supplied=attrs.filter(q=>q.isJSXAttribute()&&q.node.name?.name===name);if(supplied.length!==1||!supplied[0].get('value').isJSXExpressionContainer())return unknown('Missing or duplicate explicit callback prop supply');
  const value=supplied[0].get('value.expression');let resolved;
  if(value.isFunction()){const source=location(value,u);resolved={symbol:value.node.id?.name||null,status:'Code-linked',source,evidenceIds:proof(from,source,'inline-supplied-handler'),hookRelations:[]};}
  else resolved=resolve(value,u,from,depth+1,seen);
  if(resolved.status!=='Code-linked')return resolved;
  return {...resolved,reason:'Source declares this callback for '+name+'. Transfer to this selected instance and runtime function identity were not observed.',evidenceIds:[...resolved.evidenceIds,...proof(from,location(value,u),'supplied-handler-prop'),...proof(from,location(parameterPath,u),'forwarded-handler-parameter')]};
 }
 function resolveMember(p,u,from,depth,seen){
  if(p.node.computed||p.node.optional||!p.get('object').isIdentifier()||!p.get('property').isIdentifier())return unknown('Dynamic member/prop callback upstream or getter target is unknown');
  const receiver=p.get('object'),b=receiver.scope.getBinding(receiver.node.name);if(!b)return unknown('Member/prop receiver binding unavailable');
  if(b.kind==='param')return resolveProp(p,u,from,depth,seen);
  const object=objectDeclaration(b,u);if(object.reason)return unknown(object.reason);
  const property=object.properties.find(q=>(q.node.key.name??String(q.node.key.value))===p.node.property.name);if(!property)return unknown('Own object handler property unavailable');
  const key=u.file+':'+b.identifier.start+':'+p.node.property.name;if(seen.has(key))return unknown('Object handler alias cycle');seen=new Set([...seen,key]);
  if(property.isObjectMethod()){
   const source=location(property.get('key'),u);return {symbol:p.node.property.name,status:'Code-linked',source,evidenceIds:proof(from,source,'declared-object-method'),hookRelations:[]};
  }
  const value=property.get('value');
  if(value.isFunction()){
   const source=location(value,u);return {symbol:value.node.id?.name||null,status:'Code-linked',source,evidenceIds:proof(from,source,'object-data-handler'),hookRelations:[]};
  }
  const resolved=resolve(value,u,from,depth+1,seen);if(resolved.status!=='Code-linked')return resolved;
  return {...resolved,evidenceIds:[...resolved.evidenceIds,...proof(from,location(property,u),'object-data-handler')]};
 }
 function resolve(p,u,from,depth=0,seen=new Set()){
  if(depth>4||!p?.node)return unknown('Bounded call/return depth exceeded');
  if(p.isMemberExpression()||p.isOptionalMemberExpression())return resolveMember(p,u,from,depth,seen);
  if(!p.isIdentifier())return unknown('Dynamic expression or handler factory boundary');
  const b=p.scope.getBinding(p.node.name);if(b?.kind==='param')return resolveProp(p,u,from,depth,seen);if(!b||!b.constant)return unknown('Missing or mutable lexical binding');
  const key=u.file+':'+b.identifier.start;if(seen.has(key))return unknown('Alias cycle');seen=new Set([...seen,key]);
  const decl=b.path,source=location({node:b.identifier},u);
  if(decl.isImportSpecifier()||decl.isImportDefaultSpecifier()){
   const t=importTarget(decl,u);if(!t)return unknown('Opaque or unsupported import');
   const fn=functionPath(t.p);if(!fn)return unknown('Imported non-function or unsupported re-export');
   return {symbol:t.p.node.id?.name||p.node.name,status:'Code-linked',source:location(t.p.node.id?{node:t.p.node.id}:t.p,t.u),evidenceIds:proof(from,location(t.p,t.u),'imported-function'),hookRelations:[]};
  }
  if(decl.isFunctionDeclaration()||decl.isVariableDeclarator()&&decl.get('init').isFunction())return {symbol:p.node.name,status:'Code-linked',source,evidenceIds:proof(from,source,'declared-handler'),hookRelations:[]};
  if(!decl.isVariableDeclarator())return unknown('Unsupported lexical binding');
  const init=decl.get('init');
  if(decl.get('id').isIdentifier()&&init.isIdentifier())return resolve(init,u,from,depth+1,seen);
  if(!init.isCallExpression()||!init.get('callee').isIdentifier())return unknown('Indirect value or unsupported callback construction');
  const hook=init.node.callee.name,calleeBinding=init.scope.getBinding(hook),cp=calleeBinding?.path;
  if(decl.get('id').isIdentifier()&&cp?.isImportSpecifier()&&cp.parentPath.node.source.value==='react'&&cp.node.imported.name==='useCallback'&&init.get('arguments.0')?.isFunction()){
   const evidenceIds=proof(from,source,'declared-handler'),hookSource=location(init,u);
   return {symbol:p.node.name,status:'Code-linked',source,evidenceIds,hookRelations:[{hook:'useCallback',relation:'creates-callback',status:'Code-linked',source:hookSource,evidenceIds:proof(from,hookSource,'creates-callback')}]};
  }
  if(!/^use[A-Z]/.test(hook)||!calleeBinding?.constant||!decl.get('id').isObjectPattern())return unknown('Handler factory or unsupported hook output');
  const props=decl.get('id.properties'),prop=props.find(q=>q.isObjectProperty()&&!q.node.computed&&q.node.value.type==='Identifier'&&q.node.value.name===p.node.name);
  if(!prop)return unknown('Unsupported hook destructuring');
  let hookUnit=u,hookPath=cp;
  if(cp.isImportSpecifier()||cp.isImportDefaultSpecifier()){const t=importTarget(cp,u);if(!t)return unknown('Opaque custom hook import');hookUnit=t.u;hookPath=t.p;}
  const fn=functionPath(hookPath);if(!fn||fn.node.async||fn.node.generator)return unknown('Custom hook immediate return unavailable (async/generator/opaque)');
  const returns=[];fn.traverse({Function(q){q.skip();},ReturnStatement(q){returns.push(q);}});
  // Only a top-level single literal return; no branch winner, spread, getter or mutation inference.
  if(returns.length!==1||returns[0].parentPath!==fn.get('body')||!returns[0].get('argument').isObjectExpression())return unknown('Conditional or unsupported custom hook return');
  const keyName=prop.node.key.name??prop.node.key.value,object=returns[0].get('argument');
  if(object.node.properties.some(q=>q.type!=='ObjectProperty'||q.computed))return unknown('Hook return spread/getter boundary');
  const matches=object.get('properties').filter(q=>(q.node.key.name??q.node.key.value)===keyName);if(matches.length!==1)return unknown('Missing or ambiguous returned handler');
  const resolved=resolve(matches[0].get('value'),hookUnit,from,depth+1,seen);if(resolved.status!=='Code-linked')return resolved;
  const hs=location(hookPath.node.id?{node:hookPath.node.id}:hookPath,hookUnit);
  return {...resolved,hookRelations:[...(resolved.hookRelations||[]),{hook,relation:'returns-handler',status:'Code-linked',source:hs,evidenceIds:proof(from,location(matches[0],hookUnit),'returns-handler')}]};
 }
 const matches=[];let entries=[];
 if(u.vue){
  const targets=u.vue.targets.filter(t=>t.tag===selection.tag&&t.line===Number(line)&&(!column||t.column===Number(column)));
  if(targets.length!==1)return result;
  const paths=new Map();traverse(u.ast,{ExpressionStatement(p){paths.set(p.node.expression,p.get('expression'));}});
  entries=targets[0].events.map(e=>({...e,boundary:e.boundary||u.vue.actionBoundary,p:paths.get(e.expression),sourceKind:'vue-template'}));
 }else{
  traverse(u.ast,{JSXOpeningElement(p){const n=p.node;if(n.name.type==='JSXIdentifier'&&/^[a-z]/.test(n.name.name)&&n.name.name===selection.tag&&n.loc.start.line===Number(line)&&(!column||n.loc.start.column+1===Number(column)))matches.push(p);}});
  if(matches.length!==1)return result;
  const attrs=matches[0].get('attributes');
  for(const [index,a]of attrs.entries()){
   const prop=a.node.name?.name;if(!a.isJSXAttribute()||typeof prop!=='string'||!/^on[A-Z][A-Za-z0-9]*$/.test(prop)||!a.get('value').isJSXExpressionContainer())continue;
   entries.push({p:a.get('value.expression'),event:prop.slice(2).replace(/Capture$/,'').toLowerCase(),capture:prop.endsWith('Capture'),sourceKind:'react-jsx',boundary:attrs.slice(index+1).some(q=>q.isJSXSpreadAttribute()||q.node.name?.name===prop)?'Later JSX spread or duplicate prop may override this declaration':null});
  }
 }
 for(const item of entries){
  if(result.length>=12)break;
  const {p,event,capture,sourceKind,boundary}=item;if(!p)continue;
  const id='action:'+result.length,bindingSource=location(p,u),expression=u.text.slice(p.node.start,p.node.end);
  if(expression.length>400)continue;
  graph.nodes.push({id,kind:'action-binding',...bindingSource});
  const binding={expression,source:bindingSource,evidenceIds:proof('ui',bindingSource,'declared-event-binding')};
  let entry=unknown('Anonymous expression; no unique runtime destination'),calls=[],hookRelations=[],kind='reference';
  if(boundary)entry=unknown(boundary);
  else if(p.isIdentifier()||p.isMemberExpression()){entry=resolve(p,u,id);hookRelations=entry.hookRelations||[];delete entry.hookRelations;}
  else if(p.isFunction()){
   kind='inline';entry={symbol:'Inline callback',status:'Code-linked',source:bindingSource,evidenceIds:proof(id,bindingSource,'inline-handler')};
   p.traverse({Function(q){q.skip();},CallExpression(q){if(calls.length>=8)return;const c=q.get('callee'),r=resolve(c,u,id);for(const h of r.hookRelations||[])if(!hookRelations.some(x=>x.hook===h.hook&&x.relation===h.relation))hookRelations.push(h);calls.push({...r,symbol:c.isIdentifier()?c.node.name:'Unknown',status:'Candidate',reason:r.status==='Code-linked'?'Possible call in callback; branch/execution not observed':r.reason,evidenceIds:[...r.evidenceIds,...proof(id,location(q,u),'possible-call','Candidate')]});}});
  }else if(p.isConditionalExpression()){
   kind='alternatives';for(const branch of ['consequent','alternate']){const c=p.get(branch),r=resolve(c,u,id);calls.push({...r,symbol:c.isIdentifier()?c.node.name:'Unknown',status:'Candidate',reason:'Binding branch unresolved; execution not observed',evidenceIds:[...r.evidenceIds,...proof(id,location(c,u),'binding-alternative','Candidate')]});}
  }else if(p.isCallExpression()){kind='factory';entry=unknown('Handler factory result unknown; arguments are not click callees');}
  if(sourceKind==='vue-template'&&entry.status==='Code-linked')entry.reason='Vue template source declares this callback. Its runtime function identity and invocation were not observed.';
  result.push({id,event,capture,mechanism:sourceKind,registeredOn:'selected-element',kind,binding,entry,calls,hookRelations,execution:{status:'not-observed'},freshness:'snapshot',identity:{...identity,tab:selection.tabId,frame:selection.frame??0,page:selection.page??null,instance:selection.instance??null}});
 }
 return result;
}
