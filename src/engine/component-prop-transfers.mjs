// SPDX-License-Identifier: Apache-2.0
// Original produced bindings and component JSX operands, not array/effect proof.
import {createHash} from 'node:crypto';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export function instrumentComponentPropTransfers(source,file,{binding,inputs,outputs,observerName}={}){
 const refuse=reason=>({status:'Unknown/Unsupported',code:source,site:null,unsupported:[reason],fullPath:false});
 if(typeof source!=='string'||Buffer.byteLength(source)>2*1024*1024||typeof file!=='string'||!file||file.length>4096||![binding,observerName].every(n=>typeof n==='string'&&t.isValidIdentifier(n)&&n!=='arguments')||!Array.isArray(inputs)||!inputs.length||inputs.length>8||!inputs.every(n=>typeof n==='string'&&t.isValidIdentifier(n))||new Set(inputs).size!==inputs.length||!Array.isArray(outputs)||!outputs.length||outputs.length>8||!outputs.every(n=>typeof n==='string'&&t.isValidIdentifier(n))||new Set(outputs).size!==outputs.length)return refuse('Invalid bounded transfer input');
 try{
  const ast=parse(source,{sourceType:'module',plugins:['jsx','typescript']}),functions=[];let program,unsafe=false;
  traverse(ast,{Program(p){program=p;},Identifier(p){if(p.node.name===observerName||p.node.name==='eval'&&!p.scope.getBinding('eval'))unsafe=true;},Function(p){if(p.node.id?.name===binding)functions.push(p);else if(p.isArrowFunctionExpression()&&p.parentPath.isVariableDeclarator()&&t.isIdentifier(p.parentPath.node.id,{name:binding}))functions.push(p);}});
  if(unsafe||functions.length!==1)return refuse('Unique component and closed observer scope required');const fn=functions[0],self=fn.scope.getBinding(binding);
  if(!t.isBlockStatement(fn.node.body)||fn.node.async||fn.node.generator||!self?.constant||self.identifier!==(fn.node.id||fn.parentPath.node.id)||fn.node.params.length>1||fn.node.params.length===1&&!t.isObjectPattern(fn.node.params[0]))return refuse('Stable synchronous component required');
  const props=fn.node.params.length?fn.get('params.0.properties'):[];if(props.some(p=>!p.isObjectProperty()||p.node.computed||!p.get('value').isIdentifier()))return refuse('Direct component parameters required');
  const digest=hash(source),loc=(node,kind)=>({id:hash(digest+':'+node.start+':'+kind),file,sourceDigest:digest,line:node.loc.start.line,column:node.loc.start.column+1,kind}),site={...loc(fn.node,'component-prop-transfer'),inputs:[],outputs:[]},bindings=new Map(),inputPaths=[],outputPaths=[];
  for(const name of inputs){const b=fn.scope.getBinding(name);if(!b?.constant||b.scope!==fn.scope)throw Error('Stable local input required');bindings.set(b,name);const prop=props.find(p=>p.node.value===b.identifier);
   if(prop){site.inputs.push({...loc(prop.node,'parameter'),binding:name,prop:prop.node.key.name||prop.node.key.value});inputPaths.push({kind:'parameter',binding:b});continue;}
   const decl=b.path;if(!decl.isVariableDeclarator()||!decl.get('id').isArrayPattern()||decl.node.id.elements[0]!==b.identifier||!decl.parentPath.isVariableDeclaration({kind:'const'})||decl.parentPath.node.declarations.length!==1||decl.parentPath.parentPath!==fn.get('body'))throw Error('Original local state tuple binding required');
   const call=decl.get('init'),callee=call.isCallExpression()?call.get('callee'):null,imported=callee?.isIdentifier()?callee.scope.getBinding(callee.node.name)?.path:null;
   if(!imported?.isImportSpecifier()||imported.parent.source.value!=='react'||(imported.node.imported.name||imported.node.imported.value)!=='useReducer')throw Error('Original imported state call required');
   site.inputs.push({...loc(decl.node,'state-binding'),binding:name,prop:null});inputPaths.push({kind:'state-binding',binding:b,decl:decl.parentPath});
  }
  fn.traverse({JSXElement(p){const opening=p.get('openingElement');if(!t.isJSXIdentifier(opening.node.name)||!/^[A-Z]/.test(opening.node.name.name))return;
   const attrs=opening.get('attributes'),matches=attrs.filter(a=>a.isJSXAttribute()&&t.isJSXIdentifier(a.node.name)&&outputs.includes(a.node.name.name));if(!matches.length)return;
   if(matches.length!==1||attrs.some(a=>a.isJSXSpreadAttribute()))throw Error('One transfer prop with no spread required');const names=attrs.map(a=>a.node.name.name);if(new Set(names).size!==names.length)throw Error('Duplicate JSX prop');
   const attribute=matches[0],value=attribute.get('value');if(!value.isJSXExpressionContainer()||!value.get('expression').isIdentifier())throw Error('Original opaque reference operand required');const operand=value.get('expression'),b=operand.scope.getBinding(operand.node.name);if(!b?.constant)throw Error('Immutable output binding required');
   let callback=null,cb=null,receiver=null;
   if(!bindings.has(b)){
    cb=operand.getFunctionParent();const call=cb?.parentPath;if(!cb||cb===fn||!(cb.isArrowFunctionExpression()||cb.isFunctionExpression())||cb.node.async||cb.node.generator||!call.isCallExpression()||call.node.arguments.length!==1||call.node.arguments[0]!==cb.node||!t.isMemberExpression(call.node.callee)||call.node.callee.computed||!t.isIdentifier(call.node.callee.property,{name:'map'})||!t.isIdentifier(call.node.callee.object)||!t.isIdentifier(cb.node.params[0])||cb.scope.getBinding(cb.node.params[0].name)!==b||cb.getFunctionParent()!==fn)throw Error('Direct original map-row callback required');
    receiver=call.get('callee.object');const rb=receiver.scope.getBinding(receiver.node.name);if(!rb?.constant||rb.scope!==fn.scope)throw Error('Stable map receiver binding required');callback={...loc(call.node,'map-row-callback'),method:'map',receiver:receiver.node.name,parameter:b.identifier.name};
   }else if(operand.getFunctionParent()!==fn)throw Error('Deferred input prop escape unsupported');
   if(site.outputs.length>=32)throw Error('Output budget exceeded');site.outputs.push({...loc(attribute.node,'component-prop'),prop:attribute.node.name.name,binding:b.identifier.name,callback});outputPaths.push({element:p,operand,callback:cb,receiver});
  }});
  if(!site.outputs.length)return refuse('No corresponding original component props');
  const unique=name=>{let n;do{n=program.scope.generateUidIdentifier(name)}while(n.name===observerName);return n;};const event=unique('saTransferEvent'),identity=unique('saTransferValue'),token=unique('saTransferFrame'),kind=unique('kind'),a=unique('a'),b=unique('b'),c=unique('c'),d=unique('d');
  const observe=(kind,args)=>t.callExpression(t.cloneNode(event),[t.stringLiteral(kind),...args]);
  // Path APIs keep declaration indices valid when entry instrumentation is inserted.
  fn.get('body').unshiftContainer('body',t.variableDeclaration('const',[t.variableDeclarator(t.cloneNode(token),observe('enter',[t.identifier(binding),t.stringLiteral(site.id)]))]));
  const paramStatements=[];
  for(let i=0;i<inputPaths.length;i++){const input=inputPaths[i],statement=t.expressionStatement(observe('input',[t.cloneNode(token),t.stringLiteral(site.inputs[i].id),t.identifier(input.binding.identifier.name)]));if(input.kind==='state-binding')input.decl.insertAfter(statement);else paramStatements.push(statement);}
  if(paramStatements.length)fn.get('body').get('body.0').insertAfter(paramStatements);
  for(let i=outputPaths.length-1;i>=0;i--){const target=outputPaths[i],meta=site.outputs[i];target.operand.replaceWith(t.callExpression(t.cloneNode(identity),[t.stringLiteral('prop'),t.cloneNode(token),t.stringLiteral(meta.id),target.operand.node]));const wrapped=t.callExpression(t.cloneNode(identity),[t.stringLiteral('element'),t.cloneNode(token),t.stringLiteral(meta.id),target.element.node]);if(target.element.parentPath.isJSXElement()||target.element.parentPath.isJSXFragment())target.element.replaceWith(t.jsxExpressionContainer(wrapped));else target.element.replaceWith(wrapped);
   if(target.callback){const body=target.callback.node.body,statement=t.expressionStatement(observe('callback',[t.cloneNode(token),t.stringLiteral(meta.id),t.identifier(meta.callback.parameter),t.identifier(meta.callback.receiver)]));if(t.isBlockStatement(body))target.callback.get('body').unshiftContainer('body',statement);else target.callback.node.body=t.blockStatement([statement,t.returnStatement(body)]);}
  }
  ast.program.body.unshift(t.functionDeclaration(t.cloneNode(event),[kind,a,b,c,d].map(n=>t.cloneNode(n)),t.blockStatement([t.tryStatement(t.blockStatement([t.returnStatement(t.callExpression(t.identifier(observerName),[kind,a,b,c,d].map(n=>t.cloneNode(n))))]),t.catchClause(null,t.blockStatement([t.returnStatement(t.nullLiteral())])))])),t.functionDeclaration(t.cloneNode(identity),[kind,a,b,c].map(n=>t.cloneNode(n)),t.blockStatement([t.expressionStatement(t.callExpression(t.cloneNode(event),[kind,a,b,c].map(n=>t.cloneNode(n)))),t.returnStatement(t.cloneNode(c))])));
  return{status:'Code-linked prop transfers',code:generate(ast,{comments:true,retainLines:true},source).code,site,unsupported:[],fullPath:false,scope:'Original state/parameter/JSX and callback references only; actual native array method and ownership/commit matching remain separate'};
 }catch{return refuse('Original component transfer grammar refused');}
}
