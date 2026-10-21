// SPDX-License-Identifier: Apache-2.0
// Isolated experiment. This is NOT a supported product React19 adapter.
import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const sha=s=>createHash('sha256').update(s).digest('hex');
export const react19ExperimentProfile=Object.freeze({version:'19.2.5',files:Object.freeze({
 'react/cjs/react.development.js':'4325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72',
 'react-dom/cjs/react-dom-client.development.js':'806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08'
})});
const expectedDOM={fiber:1,root:1,'state-result:mountReducer':1,'state-result:updateReducerImpl':1,'state-result:rerenderReducer':1,begin:1,'reducer-ignored':1,'reducer-applied':1,'render-phase-unresolved':1,dispatch:1,'root-current':1,'host:setInitialProperties':1,'host:commitUpdate':1};
const helper=`const __sa19Descriptor=Object.getOwnPropertyDescriptor(globalThis,'__STATEATOM_REACT19_TAP__');
const __sa19Observer=__sa19Descriptor&&__sa19Descriptor.value;
function __sa19Tap(kind,value,...refs){try{if(typeof __sa19Observer==='function')__sa19Observer(kind,value,...refs);}catch{}return value;}`;
export function transformReact19Grammar(source,file){
 if(source.includes('__sa19'))throw Error('React19 experiment helper collision');
 const dom=file==='react-dom/cjs/react-dom-client.development.js';
 if(!dom&&file!=='react/cjs/react.development.js')throw Error('Unknown React19 experiment input file');
 const ast=parse(source,{sourceType:'script'}),counts={};
 const count=k=>counts[k]=(counts[k]||0)+1;
 const id=n=>t.identifier(n),tap=(kind,value,...args)=>t.callExpression(id('__sa19Tap'),[t.stringLiteral(kind),value,...args]);
 const statement=(kind,value,...args)=>t.expressionStatement(tap(kind,value,...args));
 traverse(ast,{
  Function(p){const name=p.node.id?.name;
   if(!dom){if(name!=='ReactElement')return;p.traverse({ReturnStatement(q){if(q.getFunctionParent()!==p)return;count('element');q.node.argument=tap('element',q.node.argument,id('props'));q.skip();}});p.skip();return;}
   if(['createFiber','createFiberRoot'].includes(name)){p.traverse({ReturnStatement(q){if(q.getFunctionParent()!==p)return;const k=name==='createFiber'?'fiber':'root';count(k);q.node.argument=tap(k,q.node.argument);q.skip();}});p.skip();return;}
   if(['setInitialProperties','commitUpdate'].includes(name)){p.node.body.body.push(statement('host-applied',id('domElement'),id(name==='commitUpdate'?'newProps':'props')));count('host:'+name);p.skip();return;}
   if(!['mountReducer','updateReducerImpl','rerenderReducer','dispatchReducerAction'].includes(name))return;
   p.traverse({
    VariableDeclarator(q){if(q.getFunctionParent()!==p)return;
     if(name==='updateReducerImpl'&&t.isIdentifier(q.node.id,{name:'queue'})){q.parentPath.insertAfter(statement('begin',id('hook'),id('current'),id('queue'),id('currentlyRenderingFiber')));count('begin');}
     if(name==='dispatchReducerAction'&&t.isIdentifier(q.node.id,{name:'update'})){q.parentPath.insertAfter(statement('dispatch',id('queue'),id('update'),id('fiber'),id('action')));count('dispatch');}
    },
    CallExpression(q){if(q.getFunctionParent()!==p||!t.isIdentifier(q.node.callee,{name:'reducer'}))return;
     if(name==='updateReducerImpl'){
      if(q.node.arguments.length!==2||!t.isIdentifier(q.node.arguments[0],{name:'pendingQueue'})||!t.isIdentifier(q.node.arguments[1],{name:'updateLane'}))throw Error('Unexpected original reducer argument shape');
      const applied=q.parentPath.isConditionalExpression()&&q.key==='alternate',ignored=q.parentPath.isLogicalExpression()&&q.key==='right';if(!applied&&!ignored)throw Error('Unexpected original reducer call context');
      const k=applied?'reducer-applied':'reducer-ignored';count(k);q.replaceWith(tap(k,q.node,id('hook'),id('queue'),id('update'),id('pendingQueue'),id('updateLane'),id('currentlyRenderingFiber'),id('reducer')));q.skip();
     }else if(name==='rerenderReducer'){count('render-phase-unresolved');q.replaceWith(tap('render-phase-unresolved',q.node,id('hook')));q.skip();}
    },
    ReturnStatement(q){if(q.getFunctionParent()!==p||name==='dispatchReducerAction')return;if(!t.isArrayExpression(q.node.argument))throw Error('Unexpected native reducer result shape');count('state-result:'+name);q.node.argument=tap('state-result',q.node.argument,id('hook'),id('currentlyRenderingFiber'));q.skip();}
   });p.skip();
  },
  AssignmentExpression(p){const n=p.node;if(dom&&t.isMemberExpression(n.left)&&t.isIdentifier(n.left.object,{name:'root'})&&t.isIdentifier(n.left.property,{name:'current'})&&t.isIdentifier(n.right,{name:'finishedWork'})&&p.parentPath.isExpressionStatement()){p.parentPath.insertAfter(statement('root-current',id('root'),id('finishedWork')));count('root-current');p.skip();}}
 });
 const expected=dom?expectedDOM:{element:1},sorted=x=>JSON.stringify(Object.entries(x).sort());
 if(sorted(counts)!==sorted(expected))throw Error('React19 experiment site-count mismatch: '+JSON.stringify(counts));
 ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);
 const code=generate(ast,{comments:true},source).code;
 return{code,counts,sourceDigest:sha(source),outputDigest:sha(code),nativeVersionAdmitted:false};
}
export function transformPinnedReact19(source,file){
 const digest=react19ExperimentProfile.files[file];if(!digest)throw Error('Unknown pinned React19 input file');
 if(sha(source)!==digest)throw Error('React19 experiment vendor digest mismatch: '+file);
 return{...transformReact19Grammar(source,file),nativeVersionAdmitted:true,version:react19ExperimentProfile.version,scope:'Pinned experiment derivative only; product support/field ownership/general prop transfer Unknown'};
}
