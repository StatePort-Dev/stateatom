// SPDX-License-Identifier: Apache-2.0
// Pinned dev-only product recipe promoted from A02.3; ancestor observations only.
// Historical experiment stays unchanged. The tap sites preserve its native grammar.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const sha=s=>createHash('sha256').update(s).digest('hex');
export const react19Profile=Object.freeze({version:'19.2.5',files:Object.freeze({
 'react/cjs/react.development.js':'4325e6263375459503858c0982d50bbc25bc33e66676954698c67221d2ee8b72',
 'react-dom/cjs/react-dom-client.development.js':'806b25cf84808a5ae0104e81633caabb1aa11fce71e72ef7afe4c1f8d2ebec08'
})});
const expectedDOM={fiber:1,root:1,'state-result:mountReducer':1,'state-result:updateReducerImpl':1,'state-result:rerenderReducer':1,begin:1,'reducer-ignored':1,'reducer-applied':1,'render-phase-unresolved':1,dispatch:1,'root-current':1,'host:setInitialProperties':1,'host:commitUpdate':1};
export const react19Adapter='react19-state-ancestors/1';
const helper=`const __sa19Own=Object.getOwnPropertyDescriptor,__sa19Apply=Reflect.apply;
function __sa19Data(object,key){const d=object&&__sa19Own(object,key);return d&&__sa19Own(d,'value')?.value;}
function __sa19Tap(kind,value){try{const runtime=__sa19Data(globalThis,'__STATEATOM__'),tap=__sa19Data(runtime,'react19NativeTap');if(typeof tap==='function')__sa19Apply(tap,runtime,arguments.length<2?[kind,value]:arguments);}catch{}return value;}`;
export function transformReact19Grammar(source,file){
 if(source.includes('__sa19'))throw Error('React19 profile helper collision');
 const dom=file==='react-dom/cjs/react-dom-client.development.js';
 if(!dom&&file!=='react/cjs/react.development.js')throw Error('Unknown React19 profile input file');
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
 if(sorted(counts)!==sorted(expected))throw Error('React19 profile site-count mismatch: '+JSON.stringify(counts));
 ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);
 const code=generate(ast,{comments:true},source).code;
 return{code,counts,sourceDigest:sha(source),outputDigest:sha(code),nativeVersionAdmitted:false};
}
export function transformPinnedReact19(source,file){
 const digest=react19Profile.files[file];if(!digest)throw Error('Unknown pinned React19 input file');
 if(sha(source)!==digest)throw Error('React19 profile vendor digest mismatch: '+file);
 return{...transformReact19Grammar(source,file),nativeVersionAdmitted:true,version:react19Profile.version,scope:'Pinned native ancestor acquisition only; field ownership, general prop transfer and selected-property origin Unknown'};
}

export function makeReact19Probe(projectRoot){
 const files=new Map(),records=[],contract={status:'Observed',adapter:react19Adapter,versions:{},sources:react19Profile.files};
 try{
  const require=createRequire(path.resolve(projectRoot,'__stateatom_react19_resolve.cjs')),bases={};
  for(const name of['react','react-dom']){
   const file=require.resolve(name+'/package.json'),pkg=JSON.parse(readFileSync(file,'utf8'));
   contract.versions[name]=pkg.version;
   if(pkg.name!==name||pkg.version!==react19Profile.version)throw Error('React19 profile requires '+name+' '+react19Profile.version);
   bases[name]=path.dirname(file);
  }
  for(const[file,digest]of Object.entries(react19Profile.files)){
   const name=file.split('/')[0],absolute=path.join(bases[name],file.slice(name.length+1));
   if(sha(readFileSync(absolute))!==digest)throw Error('React19 vendor source differs: '+file);
   files.set(absolute,file);
  }
 }catch(error){contract.status='Unknown/Unsupported';contract.reason=String(error.message);files.clear();}
 const plugin={name:'stateatom-react19-state-ancestors',setup(build){
  build.onLoad({filter:/[\\/]react(?:-dom)?[\\/]cjs[\\/].*\.development\.js$/},args=>{
   const file=files.get(args.path);if(!file)return;
   // Recheck bytes at load, not only at config: edited files cannot reuse admission.
   const transformed=transformPinnedReact19(readFileSync(args.path,'utf8'),file);
   records.push({file,...transformed,code:undefined});
   return{contents:transformed.code,loader:'js',resolveDir:path.dirname(args.path)};
  });
 }};
 return{contract,records,plugin};
}
