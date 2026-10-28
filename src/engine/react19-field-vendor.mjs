// SPDX-License-Identifier: Apache-2.0
// Optional exact native derivative. Not installed by the public profile yet.
import {createHash} from 'node:crypto';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
import {transformPinnedReducerCallFrames} from './reducer-call-frames.mjs';import {instrumentComponentCallGrammar} from './component-call-frames.mjs';import {transformPinnedReact19} from './react19-vendor.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export const fieldJSXPins=Object.freeze({
 'react/cjs/react-jsx-runtime.development.js':'dd50fd0db2fba44e0eee66243a45c81cfa3774cf41e4e6c0c080a601815c694d',
 'react/cjs/react-jsx-dev-runtime.development.js':'5a36d0fbb3554be840e6367736f88ebafdb1873a4f40c13f499c3969fa918dd6'
});
const helper=`const __saFieldJSXOwn=Object.getOwnPropertyDescriptor,__saFieldJSXApply=Reflect.apply;
function __saFieldJSXTap(element,props){try{const d=__saFieldJSXOwn(globalThis,'__STATEATOM__'),runtime=d&&__saFieldJSXOwn(d,'value')?.value,t=runtime&&__saFieldJSXOwn(runtime,'react19NativeTap'),fn=t&&__saFieldJSXOwn(t,'value')?.value;if(typeof fn==='function')__saFieldJSXApply(fn,runtime,['jsx-element-return',element,props]);}catch{}return element;}`;
export function transformFieldJSXGrammar(source){
 if(typeof source!=='string'||Buffer.byteLength(source)>1024*1024||source.includes('__saFieldJSX'))throw Error('JSX helper/source bound refused');
 const ast=parse(source,{sourceType:'script'}),owners=[];let count=0;
 traverse(ast,{Program(p){for(const name of ['Object','Reflect','globalThis'])if(p.scope.hasOwnBinding(name))throw Error('JSX helper globals shadowed');},Function(p){if(p.node.id?.name==='ReactElement')owners.push(p);},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))throw Error('Dynamic JSX native scope refused');}});
 if(owners.length!==1)throw Error('One native ReactElement owner required');const owner=owners[0],names=['type','key','props','owner','debugStack','debugTask'];
 if(owner.node.async||owner.node.generator||owner.node.params.length!==6||!names.every((n,i)=>t.isIdentifier(owner.node.params[i],{name:n})))throw Error('Original JSX native signature required');
 const props=owner.scope.getBinding('props'),value=owner.scope.getBinding('type');
 owner.traverse({ReturnStatement(p){if(p.getFunctionParent()!==owner)return;if(!t.isIdentifier(p.node.argument,{name:'type'})||p.scope.getBinding('type')!==value||p.scope.getBinding('props')!==props)throw Error('Original JSX native return required');count++;p.node.argument=t.callExpression(t.identifier('__saFieldJSXTap'),[p.node.argument,t.identifier('props')]);p.skip();}});
 if(count!==1)throw Error('One native JSX return required');ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);
 return{code:generate(ast,{comments:true},source).code,counts:{'jsx-element-return':count},sourceDigest:hash(source),nativeVersionAdmitted:false,fullPath:false};
}
export function transformPinnedFieldVendor(source,file){
 if(file==='react-dom/cjs/react-dom-client.development.js'){
  const reducer=transformPinnedReducerCallFrames(source,file),component=instrumentComponentCallGrammar(reducer.code,file,{originalSource:source});if(component.skipped)throw Error('Pinned original component-call shape refused');
  return{code:component.code,sourceDigest:hash(source),outputDigest:hash(component.code),version:'19.2.5',nativeVersionAdmitted:true,reducerCalls:reducer.calls,componentCounts:component.counts,componentSites:component.policy.sites,fullPath:false};
 }
 if(file==='react/cjs/react.development.js')return transformPinnedReact19(source,file);
 if(!Object.hasOwn(fieldJSXPins,file)||hash(source)!==fieldJSXPins[file])throw Error('Field JSX native file/digest pin mismatch');
 const result=transformFieldJSXGrammar(source);return{...result,version:'19.2.5',nativeVersionAdmitted:true,outputDigest:hash(result.code)};
}
