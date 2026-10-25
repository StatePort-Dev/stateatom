// SPDX-License-Identifier: Apache-2.0
// Isolated exact JSX development source return hook; no product profile switch.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export const jsxConfigProfile=Object.freeze({recipe:'react19-jsx-config-input/1',file:'react/cjs/react-jsx-runtime.development.js',version:'19.2.5',sha256:'dd50fd0db2fba44e0eee66243a45c81cfa3774cf41e4e6c0c080a601815c694d'});
const helper=`const __saJSXNativeOwn=Object.getOwnPropertyDescriptor;
const __saJSXNativeGlobal=__saJSXNativeOwn(globalThis,'__STATEATOM_REACT19_JSX_INPUT__');
const __saJSXNativeObserver=__saJSXNativeGlobal&&__saJSXNativeOwn(__saJSXNativeGlobal,'value')?.value;
function __saJSXNativeTap(value,props){try{if(typeof __saJSXNativeObserver==='function')__saJSXNativeObserver('jsx-element-return',value,props);}catch{}return value;}`;
export function transformJSXConfigGrammar(source,file=jsxConfigProfile.file){
 if(file!==jsxConfigProfile.file)throw Error('Unknown JSX config native file');
 if(typeof source!=='string'||Buffer.byteLength(source)>1024*1024||source.includes('__saJSXNative'))throw Error('JSX native source/helper grammar refused');
 const ast=parse(source,{sourceType:'script'}),owners=[];let count=0;
 traverse(ast,{Program(p){if(p.scope.getOwnBinding('Object')||p.scope.getOwnBinding('globalThis'))throw Error('JSX native ambient Object/globalThis binding shadows helper dependencies');},Function(p){if(p.node.id?.name==='ReactElement')owners.push(p);}});
 if(owners.length!==1)throw Error('JSX native owner count mismatch');const p=owners[0],names=['type','key','props','owner','debugStack','debugTask'];
 if(p.node.async||p.node.generator||p.node.params.length!==6||p.node.params.some((n,i)=>!t.isIdentifier(n,{name:names[i]})))throw Error('JSX native parameter binding mismatch');
 const props=p.scope.getBinding('props'),type=p.scope.getBinding('type');if(props?.kind!=='param'||type?.kind!=='param')throw Error('JSX native binding unavailable');
 p.traverse({ReturnStatement(q){if(q.getFunctionParent()!==p)return;if(!t.isIdentifier(q.node.argument,{name:'type'})||q.scope.getBinding('type')!==type||q.scope.getBinding('props')!==props)throw Error('JSX native return/binding mismatch');count++;q.node.argument=t.callExpression(t.identifier('__saJSXNativeTap'),[q.node.argument,t.identifier('props')]);q.skip();}});
 if(count!==1)throw Error('JSX native return count mismatch');
 ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);const code=generate(ast,{comments:true},source).code;
 return{code,counts:{'jsx-element-return':count},sourceDigest:hash(source),outputDigest:hash(code),nativeVersionAdmitted:false,recipe:jsxConfigProfile.recipe,scope:'Exact native JSX props/element identity only; historical config input/storage/ownership separately scoped'};
}
export function transformPinnedJSXConfig(source,file=jsxConfigProfile.file){
 if(file!==jsxConfigProfile.file||hash(source)!==jsxConfigProfile.sha256)throw Error('JSX config vendor digest/file mismatch');
 return{...transformJSXConfigGrammar(source,file),nativeVersionAdmitted:true,version:jsxConfigProfile.version};
}
