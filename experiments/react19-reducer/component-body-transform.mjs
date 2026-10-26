// SPDX-License-Identifier: Apache-2.0
// Source-only original parameter/return observations. No native/commit/field attestation.
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex'),prefix='__saComponentBody';
const helper=`const __saComponentBodyOwn=Object.getOwnPropertyDescriptor,__saComponentBodyApply=Reflect.apply,__saComponentBodyCreate=Object.create;
const __saComponentBodyTap=(()=>{try{const d=__saComponentBodyOwn(globalThis,'__STATEATOM_COMPONENT_BODY_TAP__'),f=d&&__saComponentBodyOwn(d,'value')?.value;return typeof f==='function'?f:null;}catch{return null;}})();
function __saComponentBodyEntry(self,a,b,site){if(!__saComponentBodyTap)return null;try{const r=__saComponentBodyCreate(null);try{r.token=__saComponentBodyApply(__saComponentBodyTap,undefined,['component-body-entry',self,a,b,site]);}catch{}return r.token===undefined?null:r;}catch{return null;}}
function __saComponentBodyReturn(r,value,site){if(r)try{__saComponentBodyApply(__saComponentBodyTap,undefined,['component-body-return',r.token,value,site]);}catch{}return value;}`;
export function instrumentComponentBody(source,file){
 if(typeof source!=='string'||typeof file!=='string')throw TypeError('Source and file required');
 const empty={code:source,sourceDigest:hash(source),sourceOnly:true,nativeOrigin:'NotAttested',componentInvocationRuntimeQualified:false,policy:null,skipped:true};
 const refuse=()=>({...empty,unsupported:[{file,reason:'Closed original component parameter/return grammar required'}]});
 if(!file||file.length>1024||Buffer.byteLength(source)>1024*1024||source.includes(prefix))return refuse();
 try{
  const ast=parse(source,{sourceType:'unambiguous',plugins:['jsx']}),candidates=[];let unsafe=false;
  traverse(ast,{
   Program(p){for(const n of ['Object','Reflect','globalThis','undefined'])if(p.scope.getBinding(n))unsafe=true;},
   Identifier(p){if(p.node.name.startsWith(prefix)||['eval','Function'].includes(p.node.name))unsafe=true;},WithStatement(){unsafe=true;},
   'MemberExpression|OptionalMemberExpression'(p){if(t.isStringLiteral(p.node.property)&&['eval','Function'].includes(p.node.property.value))unsafe=true;},
   'CallExpression|OptionalCallExpression|NewExpression'(p){if(t.isIdentifier(p.node.callee)&&['eval','Function'].includes(p.node.callee.name))unsafe=true;},
   Function(p){if(p.node.id&&p.node.params.length===1&&t.isObjectPattern(p.node.params[0]))candidates.push(p);}
  });
  if(unsafe||candidates.length!==1)throw Error('One safe named component required');
  const fn=candidates[0],node=fn.node,name=node.id.name,pattern=node.params[0];
  if(node.async||node.generator||!t.isBlockStatement(node.body)||pattern.properties.length!==2)throw Error('Synchronous two-key body required');
  const params=pattern.properties.map(p=>{if(!t.isObjectProperty(p)||p.computed||!t.isIdentifier(p.key)||!t.isIdentifier(p.value))throw Error('Plain original binding required');return{key:p.key.name,binding:p.value.name};});
  if(params[0].key===params[1].key||params[0].binding===params[1].binding)throw Error('Distinct parameter keys/bindings required');
  for(const p of params){const b=fn.scope.getBinding(p.binding);if(b?.kind!=='param'||!b.constant||p.binding===name)throw Error('Stable original parameter required');}
  const self=fn.scope.getBinding(name);if(!self?.constant||self.path.node!==node)throw Error('Exact stable self binding required');
  const returns=[];fn.get('body').traverse({Function(p){p.skip();},ReturnStatement(p){returns.push(p);}});
  if(returns.length!==1||returns[0].parentPath.node!==node.body||returns[0].node!==node.body.body.at(-1)||!returns[0].node.argument)throw Error('One direct final original return required');
  // Every introduced free helper reference must still resolve to Program, never a local shadow.
  const bodyScope=fn.get('body').scope;
  for(const n of ['Object','Reflect','globalThis','undefined'])if(bodyScope.getBinding(n))throw Error('Helper scope shadow refused');
  const sites=[['component-body-entry',pattern],['component-body-return',returns[0].node]].map(([kind,n])=>({id:hash(file+'\0'+empty.sourceDigest+'\0'+n.start+':'+n.end+':'+kind),file,sourceDigest:empty.sourceDigest,kind,owner:name,line:n.loc.start.line,column:n.loc.start.column+1,endLine:n.loc.end.line,endColumn:n.loc.end.column+1}));
  const receipt=fn.scope.generateUidIdentifier('saBodyFrame'),start=t.variableDeclaration('const',[t.variableDeclarator(receipt,t.callExpression(t.identifier('__saComponentBodyEntry'),[t.identifier(name),...params.map(p=>t.identifier(p.binding)),t.stringLiteral(sites[0].id)]))]);
  const ret=returns[0].node;ret.argument=t.callExpression(t.identifier('__saComponentBodyReturn'),[t.cloneNode(receipt),ret.argument,t.stringLiteral(sites[1].id)]);
  node.body.body.unshift(start);ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);
  const code=generate(ast,{comments:true},source).code;parse(code,{sourceType:'unambiguous',plugins:['jsx']});
  return{...empty,skipped:false,code,outputDigest:hash(code),policy:{schema:'stateatom.component-body-source/1',file,sourceDigest:empty.sourceDigest,owner:name,parameters:params,sites},scope:'Original bound parameter references and normal object return only; source admission, not runtime qualification'};
 }catch{return refuse();}
}
export function transformRetainedItemBody(source,file='src/todo/components/item.jsx'){
 if(file!=='src/todo/components/item.jsx'||typeof source!=='string'||hash(source)!=='49c48717b33728e6c001070e95ee29a290d8da9909f7cdf12000d20adc28a086')throw Error('Exact retained Item source required');
 const r=instrumentComponentBody(source,file);if(r.skipped)throw Error('Retained Item body grammar refused');return r;
}
