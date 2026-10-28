// SPDX-License-Identifier: Apache-2.0
// Original destructuring and JSX operands only. No replay or ownership authority.
import {createHash} from 'node:crypto';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export function instrumentComponentFieldReads(source,file,{binding,parameter,field,observerName,includeAst=false}={}){
 const empty=reason=>({status:'Unknown/Unsupported',code:source,sites:[],unsupported:[reason],fullPath:false,fieldOwnership:'Unknown/Unsupported'});
 if(typeof source!=='string'||Buffer.byteLength(source)>2*1024*1024||typeof file!=='string'||!file||file.length>4096||![binding,parameter,observerName].every(s=>typeof s==='string'&&t.isValidIdentifier(s)&&s!=='arguments')||typeof field!=='string'||!field||field.length>128||['__proto__','constructor','prototype'].includes(field))return empty('Invalid bounded field-read input');
 try{
  const ast=parse(source,{sourceType:'module',plugins:['jsx','typescript']}),functions=[];let program,unsafe=false;
  traverse(ast,{Program(p){program=p;},Identifier(p){if(p.node.name===observerName||p.node.name==='eval'&&!p.scope.getBinding('eval'))unsafe=true;},Function(p){if(p.node.id?.name===binding)functions.push(p);else if(p.isArrowFunctionExpression()&&p.parentPath.isVariableDeclarator()&&t.isIdentifier(p.parentPath.node.id,{name:binding}))functions.push(p);}});
  if(unsafe||functions.length!==1)return empty('Unique component and closed lexical observer scope required');
  const fn=functions[0],self=fn.scope.getBinding(binding);
  if(fn.node.async||fn.node.generator||!t.isBlockStatement(fn.node.body)||fn.node.params.length!==1||!t.isObjectPattern(fn.node.params[0])||!self?.constant||self.identifier!==(fn.node.id||fn.parentPath.node.id))return empty('Named synchronous immutable component binding required');
  const params=fn.get('params.0.properties');if(params.some(p=>!p.isObjectProperty()||p.node.computed||!p.get('value').isIdentifier()))return empty('Direct component parameters required');
  const row=fn.scope.getBinding(parameter);if(!row?.constant||!params.some(p=>p.node.value===row.identifier))return empty('Exact immutable row parameter required');
  const reads=[];
  fn.traverse({Function(p){p.skip();},VariableDeclarator(p){
   if(!p.get('id').isObjectPattern()||!p.get('init').isIdentifier({name:parameter})||p.scope.getBinding(parameter)!==row)return;
   const props=p.get('id.properties'),decl=p.parentPath;
   if(!decl.isVariableDeclaration({kind:'const'})||decl.node.declarations.length!==1||decl.parentPath!==fn.get('body')||props.some(q=>!q.isObjectProperty()||q.node.computed||!q.get('value').isIdentifier()))throw Error('Direct ordinary immutable destructure required');
   const targets=props.filter(q=>(q.node.key.name||q.node.key.value)===field);if(targets.length!==1)throw Error('Unique selected field required');const selected=targets[0],scalar=p.scope.getBinding(selected.node.value.name);
   if(!scalar?.constant||scalar.identifier!==selected.node.value)throw Error('Immutable produced scalar required');reads.push({decl,selected,scalar});
  }});
  if(reads.length!==1)return empty('One original row field destructure required');
  const read=reads[0],hosts=[];
  for(const reference of read.scalar.referencePaths){const operand=reference.parentPath;if(!operand.isJSXExpressionContainer()||operand.node.expression!==reference.node)continue;const host=operand.parentPath;
   if(!host.isJSXElement()||reference.getFunctionParent()!==fn)continue;const opening=host.node.openingElement;
   if(!t.isJSXIdentifier(opening.name)||!/^[a-z][\w-]*$/.test(opening.name.name))continue;
   if(host.node.children.some(child=>child!==operand.node&&!(t.isJSXText(child)&&!child.value.trim())))throw Error('One exact host text operand required');
   if(hosts.length>=32)throw Error('Host site budget exceeded');hosts.push({host,operand});
  }
  if(!hosts.length)return empty('No exact direct host text operand');
  const sourceDigest=hash(source),location=(node,kind)=>({id:hash(sourceDigest+':'+node.start+':'+kind),file,sourceDigest,line:node.loc.start.line,column:node.loc.start.column+1,kind});
  const parameterProperty=params.find(p=>p.node.value===row.identifier);
  const site={...location(fn.node,'component-field-read'),field,parameter,parameterProp:parameterProperty.node.key.name||parameterProperty.node.key.value,read:location(read.selected.node,'original-destructured-field'),hosts:hosts.map(h=>location(h.host.node,'host-text-operand'))};
  const unique=name=>{let n;do{n=program.scope.generateUidIdentifier(name)}while(n.name===observerName);return n;};
  const helper=unique('saFieldReadEvent'),identity=unique('saFieldReadValue'),token=unique('saFieldReadFrame'),kind=unique('kind'),a=unique('a'),b=unique('b'),c=unique('c');
  const event=(type,args)=>t.callExpression(t.cloneNode(helper),[t.stringLiteral(type),...args]);
  // Entry reads the already-produced row parameter only, never props again.
  fn.get('body').unshiftContainer('body',t.variableDeclaration('const',[t.variableDeclarator(t.cloneNode(token),event('enter',[t.identifier(binding),t.stringLiteral(site.id),t.identifier(parameter)]))]));
  read.decl.insertAfter(t.expressionStatement(event('read',[t.cloneNode(token),t.stringLiteral(site.read.id),t.identifier(read.scalar.identifier.name)])));
  for(let i=hosts.length-1;i>=0;i--){const{operand,host}=hosts[i],id=site.hosts[i].id;
   operand.node.expression=t.callExpression(t.cloneNode(identity),[t.stringLiteral('operand'),t.cloneNode(token),t.stringLiteral(id),operand.node.expression]);
   const wrapper=t.callExpression(t.cloneNode(identity),[t.stringLiteral('element'),t.cloneNode(token),t.stringLiteral(id),host.node]);
   if(host.parentPath.isJSXElement()||host.parentPath.isJSXFragment())host.replaceWith(t.jsxExpressionContainer(wrapper));else host.replaceWith(wrapper);
  }
  ast.program.body.unshift(
   t.functionDeclaration(t.cloneNode(helper),[kind,a,b,c].map(n=>t.cloneNode(n)),t.blockStatement([t.tryStatement(t.blockStatement([t.returnStatement(t.callExpression(t.identifier(observerName),[kind,a,b,c].map(n=>t.cloneNode(n))))]),t.catchClause(null,t.blockStatement([t.returnStatement(t.nullLiteral())])))])),
   t.functionDeclaration(t.cloneNode(identity),[kind,a,b,c].map(n=>t.cloneNode(n)),t.blockStatement([t.expressionStatement(t.callExpression(t.cloneNode(helper),[kind,a,b,c].map(n=>t.cloneNode(n)))),t.returnStatement(t.cloneNode(c))]))
  );
  return{status:'Code-linked field reads',...(includeAst?{ast}:{}),code:generate(ast,{comments:true,retainLines:true},source).code,sites:[site],unsupported:[],fullPath:false,fieldOwnership:'Unknown/Unsupported',scope:'Original produced binding and direct JSX operand only; getter/Proxy safety, source authenticity and selected commit remain separate'};
 }catch{return empty('Field-read lexical grammar refused');}
}
