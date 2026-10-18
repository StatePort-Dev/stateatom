// SPDX-License-Identifier: Apache-2.0
// Source-only, bounded extension of the existing analyzer/evidence graph.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {edge} from './evidence.mjs';
const traverse=traverseModule.default||traverseModule;
const hash=s=>createHash('sha256').update(s).digest('hex');
const unknown=reason=>({status:'Unknown/Unsupported',reason,evidenceIds:[]});
export function analyzeActions(files,selection,identity,graph,projectFiles=files){
 const result=[],[file,line,digest,column]=String(selection.marker||'').split(':');
 if(selection.unbound||selection.markerOnSelected!==true||!file||file.endsWith('.vue'))return result;
 const cache=new Map();
 function unit(f){if(cache.has(f.file))return cache.get(f.file);let ast;try{ast=parse(f.text,{sourceType:'unambiguous',plugins:['jsx','typescript']});}catch{return null;}const u={...f,ast,sourceDigest:hash(f.text)};cache.set(f.file,u);return u;}
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
 function resolve(p,u,from,depth=0,seen=new Set()){
  if(depth>4||!p?.node)return unknown('Bounded call/return depth exceeded');
  if(p.isMemberExpression()||p.isOptionalMemberExpression())return unknown('Member/prop callback upstream or getter target is unknown');
  if(!p.isIdentifier())return unknown('Dynamic expression or handler factory boundary');
  const b=p.scope.getBinding(p.node.name);if(!b||!b.constant||b.kind==='param')return unknown('Missing, mutable or parameter binding');
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
 const matches=[];traverse(u.ast,{JSXOpeningElement(p){const n=p.node;if(n.name.type==='JSXIdentifier'&&/^[a-z]/.test(n.name.name)&&n.name.name===selection.tag&&n.loc.start.line===Number(line)&&(!column||n.loc.start.column+1===Number(column)))matches.push(p);}});
 if(matches.length!==1)return result;
 const opening=matches[0],attrs=opening.get('attributes');
 for(const [index,a]of attrs.entries()){
  if(result.length>=12)break;
  const prop=a.node.name?.name;if(!a.isJSXAttribute()||typeof prop!=='string'||!/^on[A-Z][A-Za-z0-9]*$/.test(prop)||!a.get('value').isJSXExpressionContainer())continue;
  const p=a.get('value.expression'),id='action:'+result.length,bindingSource=location(p,u),expression=u.text.slice(p.node.start,p.node.end);
  if(expression.length>400)continue;
  graph.nodes.push({id,kind:'action-binding',...bindingSource});
  const binding={expression,source:bindingSource,evidenceIds:proof('ui',bindingSource,'declared-event-binding')};
  let entry=unknown('Anonymous expression; no unique runtime destination'),calls=[],hookRelations=[],kind='reference';
  if(attrs.slice(index+1).some(q=>q.isJSXSpreadAttribute()||q.node.name?.name===prop))entry=unknown('Later JSX spread or duplicate prop may override this declaration');
  else if(p.isIdentifier()||p.isMemberExpression()){entry=resolve(p,u,id);hookRelations=entry.hookRelations||[];delete entry.hookRelations;}
  else if(p.isFunction()){
   kind='inline';entry={symbol:'Inline callback',status:'Code-linked',source:bindingSource,evidenceIds:proof(id,bindingSource,'inline-handler')};
   p.traverse({Function(q){q.skip();},CallExpression(q){if(calls.length>=8)return;const c=q.get('callee'),r=resolve(c,u,id);for(const h of r.hookRelations||[])if(!hookRelations.some(x=>x.hook===h.hook&&x.relation===h.relation))hookRelations.push(h);calls.push({...r,symbol:c.isIdentifier()?c.node.name:'Unknown',status:'Candidate',reason:r.status==='Code-linked'?'Possible call in callback; branch/execution not observed':r.reason,evidenceIds:[...r.evidenceIds,...proof(id,location(q,u),'possible-call','Candidate')]});}});
  }else if(p.isConditionalExpression()){
   kind='alternatives';for(const branch of ['consequent','alternate']){const c=p.get(branch),r=resolve(c,u,id);calls.push({...r,symbol:c.isIdentifier()?c.node.name:'Unknown',status:'Candidate',reason:'Binding branch unresolved; execution not observed',evidenceIds:[...r.evidenceIds,...proof(id,location(c,u),'binding-alternative','Candidate')]});}
  }else if(p.isCallExpression()){kind='factory';entry=unknown('Handler factory result unknown; arguments are not click callees');}
  result.push({id,event:prop.slice(2).replace(/Capture$/,'').toLowerCase(),capture:prop.endsWith('Capture'),mechanism:'react-jsx',registeredOn:'selected-element',kind,binding,entry,calls,hookRelations,execution:{status:'not-observed'},freshness:'snapshot',identity:{...identity,tab:selection.tabId,frame:selection.frame??0,page:selection.page??null,instance:selection.instance??null}});
 }
 return result;
}
