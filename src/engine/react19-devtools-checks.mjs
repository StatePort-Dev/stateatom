// SPDX-License-Identifier: Apache-2.0
// Observe the result of original native typeof operations, never repeat a hook
// lookup. Only the separately pinned React19 derivative admits this grammar.
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const prefix='__saNativeDevtools';
const helper=`const ${prefix}Own=Object.getOwnPropertyDescriptor,${prefix}Apply=Reflect.apply;
function ${prefix}(value,role,site){try{const d=${prefix}Own(globalThis,'__STATEATOM__'),runtime=d&&${prefix}Own(d,'value')?.value,t=runtime&&${prefix}Own(runtime,'react19NativeTap'),fn=t&&${prefix}Own(t,'value')?.value;if(typeof fn==='function')${prefix}Apply(fn,runtime,['devtools-type',value,role,site]);}catch{}return value;}`;
export function instrumentOriginalDevtoolsChecks(source){
 if(typeof source!=='string'||Buffer.byteLength(source)>2*1024*1024||source.includes(prefix))throw Error('Native DevTools source bound refused');
 const ast=parse(source,{sourceType:'script'}),counts={total:0,inject:0,module:0};
 traverse(ast,{Program(p){for(const key of ['Object','Reflect','globalThis'])if(p.scope.hasOwnBinding(key))throw Error('Native helper globals shadowed');},UnaryExpression(p){
  if(p.node.operator!=='typeof'||!t.isIdentifier(p.node.argument,{name:'__REACT_DEVTOOLS_GLOBAL_HOOK__'}))return;
  if(p.scope.getBinding('__REACT_DEVTOOLS_GLOBAL_HOOK__'))throw Error('Native hook reference shadowed');
  const inject=p.getFunctionParent()?.node.id?.name==='injectInternals',role=inject?'inject-internals':'module-check';counts.total++;counts[inject?'inject':'module']++;
  p.replaceWith(t.callExpression(t.identifier(prefix),[p.node,t.stringLiteral(role),t.stringLiteral('native-devtools-'+counts.total)]));p.skip();
 }});
 if(!counts.total||!counts.inject)throw Error('Original native DevTools absence branch missing');
 ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);
 return{code:generate(ast,{comments:true},source).code,counts,nativeVersionAdmitted:false,fullPath:false};
}
