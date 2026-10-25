// SPDX-License-Identifier: Apache-2.0
// Isolated source recipe. Existing product/vendor adapters are not modified.
import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {react19Profile} from '../../src/engine/react19-vendor.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const sha=text=>createHash('sha256').update(text).digest('hex');
export const propCopyProfile=Object.freeze({recipe:'react19-classic-prop-copy-input/1',version:react19Profile.version,file:'react/cjs/react.development.js',sha256:react19Profile.files['react/cjs/react.development.js']});
const helper=`const __saPropCopyOwn=Object.getOwnPropertyDescriptor;
const __saPropCopyDescriptor=__saPropCopyOwn(globalThis,'__STATEATOM_REACT19_PROP_COPY__');
const __saPropCopyObserver=__saPropCopyDescriptor&&__saPropCopyOwn(__saPropCopyDescriptor,'value')?.value;
function __saPropCopyTap(kind,value,props,key){try{if(typeof __saPropCopyObserver==='function')__saPropCopyObserver(kind,value,props,key);}catch{}return value;}`;
const isID=(node,name)=>t.isIdentifier(node,{name});
const parameterNames=['type','key','props','owner','debugStack','debugTask'];
function fail(what){throw Error('Prop-copy recipe shape/site-count/binding mismatch: '+what);}
export function transformPropCopyGrammar(source,file=propCopyProfile.file){
 if(file!==propCopyProfile.file)throw Error('Unknown prop-copy input file');
 if(typeof source!=='string'||Buffer.byteLength(source)>1024*1024)fail('source input');
 if(source.includes('__saPropCopy'))throw Error('Prop-copy helper collision');
 const ast=parse(source,{sourceType:'script'}),elements=[],creators=[];
 traverse(ast,{
  FunctionDeclaration(p){if(isID(p.node.id,'ReactElement'))elements.push(p);},
  AssignmentExpression(p){const n=p.node;if(t.isMemberExpression(n.left)&&!n.left.computed&&isID(n.left.object,'exports')&&isID(n.left.property,'createElement')&&t.isFunctionExpression(n.right)){if(p.scope.getBinding('exports'))fail('shadowed exports');creators.push(p.get('right'));}}
 });
 if(elements.length!==1||creators.length!==1)fail('function owners');
 const element=elements[0],creator=creators[0];
 if(element.node.params.length!==6||element.node.params.some((p,i)=>!isID(p,parameterNames[i])))fail('ReactElement parameters');
 if(creator.node.async||creator.node.generator||creator.node.params.length!==3||creator.node.params.some((p,i)=>!isID(p,['type','config','children'][i])))fail('createElement parameters');
 const counts={'props-created':0,'copy-input':0,'element-return':0};let callerCount=0;
 const tap=(kind,value,...refs)=>t.callExpression(t.identifier('__saPropCopyTap'),[t.stringLiteral(kind),value,...refs]);
 const sameBinding=(p,name)=>p.scope.getBinding(name)===creator.scope.getBinding(name)&&!!creator.scope.getBinding(name);
 creator.traverse({
  AssignmentExpression(p){if(p.getFunctionParent()!==creator)return;const n=p.node;if(n.operator!=='=')return;
   if(isID(n.left,'i')&&t.isObjectExpression(n.right)&&n.right.properties.length===0){if(!sameBinding(p,'i'))fail('creation binding');counts['props-created']++;p.node.right=tap('props-created',n.right);p.skip();return;}
   if(t.isMemberExpression(n.left)&&n.left.computed&&isID(n.left.object,'i')&&isID(n.left.property,'propName')&&t.isMemberExpression(n.right)&&n.right.computed&&isID(n.right.object,'config')&&isID(n.right.property,'propName')){
    if(!['i','propName','config'].every(name=>sameBinding(p,name)))fail('copy binding');counts['copy-input']++;p.replaceWith(tap('copy-input',n,t.identifier('i'),t.identifier('propName')));p.skip();
   }
  },
  ReturnStatement(p){if(p.getFunctionParent()!==creator)return;const n=p.node.argument;
   if(t.isCallExpression(n)&&isID(n.callee,'ReactElement')){const binding=p.scope.getBinding('ReactElement');if(binding?.path.node!==element.node||n.arguments.length!==6||!isID(n.arguments[2],'i'))fail('constructor caller binding');callerCount++;}
  }
 });
 element.traverse({ReturnStatement(p){if(p.getFunctionParent()!==element)return;if(!isID(p.node.argument,'type'))fail('element return');counts['element-return']++;p.node.argument=tap('element-return',p.node.argument,t.identifier('props'));p.skip();}});
 if(callerCount!==1||Object.values(counts).some(n=>n!==1))fail(JSON.stringify(counts));
 ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);
 const code=generate(ast,{comments:true},source).code;
 return {code,counts,sourceDigest:sha(source),outputDigest:sha(code),nativeVersionAdmitted:false,recipe:propCopyProfile.recipe,scope:'Original classic todo copy-input only; native origin/storage/transfer/ownership/selected producer unqualified'};
}
export function transformPinnedPropCopy(source,file=propCopyProfile.file){
 if(file!==propCopyProfile.file)throw Error('Unknown pinned prop-copy input file');
 if(typeof source!=='string'||sha(source)!==propCopyProfile.sha256)throw Error('Pinned prop-copy vendor digest mismatch');
 return {...transformPropCopyGrammar(source,file),nativeVersionAdmitted:true,version:propCopyProfile.version};
}
