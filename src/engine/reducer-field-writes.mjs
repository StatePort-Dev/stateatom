// SPDX-License-Identifier: Apache-2.0
// Original object-literal field definition sites only. No writer-exclusion,
// applied state, consumer or committed-property authority is supplied here.
import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const digest=value=>createHash('sha256').update(value).digest('hex');
export function instrumentReducerFieldWrites(source,file,{binding,field,observerName}={}){
 const unknown=reason=>({status:'Unknown/Unsupported',code:source,sites:[],unsupported:[reason],fullPath:false,fieldOwnership:'Unknown/Unsupported'});
 if(typeof source!=='string'||Buffer.byteLength(source)>2*1024*1024||typeof file!=='string'||!file||file.length>4096||
  typeof binding!=='string'||!t.isValidIdentifier(binding)||typeof observerName!=='string'||!t.isValidIdentifier(observerName)||observerName==='arguments'||
  typeof field!=='string'||!field||field.length>128||['__proto__','constructor','prototype'].includes(field))return unknown('Invalid bounded field-site input');
 try{
  const ast=parse(source,{sourceType:'module',plugins:['jsx','typescript']}),candidates=[],sites=[],targets=[];let program,collision=false,dynamicScope=false;
  traverse(ast,{
   Program(p){program=p;},
   Identifier(p){if(p.node.name===observerName)collision=true;},
   CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'})&&!p.scope.getBinding('eval'))dynamicScope=true;},
   BindingIdentifier(p){if(p.node.name!==binding)return;const b=p.scope.getBinding(binding);if(b&&!candidates.includes(b))candidates.push(b);}
  });
  if(collision||dynamicScope)return unknown('Observer collision or dynamic scope unavailable');
  if(candidates.length!==1||!candidates[0].constant)return unknown('Unique immutable reducer binding required');
  const b=candidates[0],fn=b.path.isVariableDeclarator()?b.path.get('init'):b.path;
  if(!(fn.isFunctionDeclaration()||fn.isFunctionExpression()||fn.isArrowFunctionExpression())||fn.node.async||fn.node.generator||fn.node.params.length!==2||!fn.node.params.every(p=>t.isIdentifier(p)))return unknown('Two-parameter synchronous reducer required');
  const action=fn.scope.getBinding(fn.node.params[1].name);
  if(!action||!action.constant)return unknown('Immutable action parameter required');
  const sourceDigest=digest(source);let refusal=null;
  fn.traverse({ObjectExpression(p){
   const properties=p.node.properties,key=x=>!x.computed&&(t.isIdentifier(x.key)?x.key.name:t.isStringLiteral(x.key)?x.key.value:null);
   const matches=properties.filter(x=>!t.isSpreadElement(x)&&key(x)===field);
   if(!matches.length)return;
   const selected=matches[0],at=properties.indexOf(selected);
   if(matches.length!==1||!t.isObjectProperty(selected)||properties.some(x=>!t.isSpreadElement(x)&&(!t.isObjectProperty(x)||x.computed||key(x)==='__proto__'))||properties.slice(at+1).some(x=>t.isSpreadElement(x))){refusal='Overridden, accessor, prototype or computed field definition';return;}
   let value=selected.value;const actionPath=[];
   while(t.isMemberExpression(value)&&!value.computed&&!value.optional&&t.isIdentifier(value.property)){
    if(actionPath.length>=12){refusal='Action path budget exceeded';return;}
    actionPath.unshift(value.property.name);value=value.object;
   }
   if(!actionPath.length||!t.isIdentifier(value)||p.scope.getBinding(value.name)!==action){refusal='Field initializer is not an original action member path';return;}
   if(sites.length>=64){refusal='Field site budget exceeded';return;}
   const site={schema:'stateatom.reducer-field-site/1',id:digest(sourceDigest+':'+p.node.start+':'+field),file,sourceDigest,field,actionPath,line:selected.loc.start.line,column:selected.loc.start.column+1,objectStart:p.node.start,objectEnd:p.node.end};
   sites.push(site);targets.push({path:p,site});
  }});
  if(refusal||!sites.length)return unknown(refusal||'No eligible original field definition');
  const privateName=base=>{let name;do{name=program.scope.generateUidIdentifier(base);}while(name.name===observerName);return name;};
  const helper=privateName('stateatomFieldWrite');
  // The argument is the completed ORIGINAL object expression. The observer gets
  // that exact object after all initializer effects, and cannot replace its return.
  // Observer integration is trusted instrumentation, not page-supplied proof.
  for(const {path,site}of targets.reverse()){
   path.replaceWith(t.callExpression(t.cloneNode(helper),[t.valueToNode(site),path.node]));
  }
  const meta=privateName('metadata'),value=privateName('value');
  const declaration=t.functionDeclaration(t.cloneNode(helper),[meta,value],t.blockStatement([
   t.tryStatement(t.blockStatement([t.expressionStatement(t.callExpression(t.identifier(observerName),[t.cloneNode(meta),t.cloneNode(value)]))]),t.catchClause(null,t.blockStatement([]))),
   t.returnStatement(t.cloneNode(value))
  ]));
  ast.program.body.unshift(declaration);
  return{status:'Code-linked writer sites',code:generate(ast,{retainLines:true,comments:true},source).code,sites,unsupported:[],fullPath:false,fieldOwnership:'Unknown/Unsupported',scope:'Original completed object-literal field definitions only; outside writes and applied/selected origin remain unproved'};
 }catch{return unknown('Source parsing or field-site transformation unavailable');}
}
