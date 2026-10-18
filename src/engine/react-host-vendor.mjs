import {transformFirstReact} from "../first-read/react-contracts.mjs";
// SPDX-License-Identifier: Apache-2.0
// Experimental pinned dev-input transform; installed packages are never modified.
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {guardPrivateInput} from './write-access.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
export const hostAdapter='react18-final-host-props/1';
const sha=s=>createHash('sha256').update(s).digest('hex');
export const vendorHashes={
 'react/cjs/react.development.js':'1ff3a1d9861a87984329584fa1172aea920855d79eb57dae0d1cebe54093d7e3',
 'react/cjs/react-jsx-runtime.development.js':'581f93fa33c32b3aa7ea35b85b80258922517de046f5447236047dcc2845d9ff',
 'react/cjs/react-jsx-dev-runtime.development.js':'cd9394f47e01e9f1d87f7a8adcfc0ad8f8813d5c124ee74627791921f3277ac5',
 'react-dom/cjs/react-dom.development.js':'1459b808bc6991de5a1ec3a86d8beee32dbb6c14282cf13f84e00dfebfbdc025'
};
const helper=`function __stateatomHostTap(kind,a,b,c){try{const runtime=__stateatomHostOwnDescriptor(globalThis,'__STATEATOM__')?.value;const tap=runtime&&__stateatomHostOwnDescriptor(runtime,'reactHostTap')?.value;if(typeof tap==='function')tap(kind,a,b,c,${JSON.stringify(hostAdapter)});}catch{}return a;}
const __stateatomHostApply=Reflect.apply;
function __stateatomFreezeCallee(receiver,key){const fn=receiver[key];return function(...args){const value=__stateatomHostApply(fn,receiver,args);__stateatomHostTap('factory-freeze',fn,args[0]);return value;};}`;
export function transformReactVendor(source,file,{reactStateHandoffs=false,reactWriteAccessGuards=false,firstReadContracts=false}={}){
 if(!vendorHashes[file]||sha(source)!==vendorHashes[file])throw Error('React host vendor digest mismatch: '+file);
 const ast=parse(source,{sourceType:'script'}),counts={};
 const count=k=>counts[k]=(counts[k]||0)+1;
 const tap=(kind,...args)=>t.callExpression(t.identifier('__stateatomHostTap'),[t.stringLiteral(kind),...args]);
 const statement=(kind,...args)=>t.expressionStatement(tap(kind,...args));
 const dom=file.startsWith('react-dom/');
 traverse(ast,{
  AssignmentExpression(p){if(dom)return;const n=p.node;if(t.isMemberExpression(n.left)&&t.isIdentifier(n.left.object,{name:'exports'})&&['createElement','jsx','jsxs','jsxDEV'].includes(n.left.property.name)){n.right=tap('factory-brand',n.right);count('exports');p.skip();}},
  Function(p){const name=p.node.id?.name||(p.parentPath.isVariableDeclarator()?p.parentPath.node.id.name:null);
   if(dom&&reactStateHandoffs&&['mountState','updateReducer','dispatchSetState'].includes(name)){
    p.traverse({
     VariableDeclarator(q){if(q.getFunctionParent()!==p)return;
      if(name==='dispatchSetState'&&t.isIdentifier(q.node.id,{name:'update'})){q.parentPath.insertAfter(statement('state-dispatch',t.identifier('queue'),t.identifier('update'),t.identifier('fiber')));count('state-dispatch');}
      if(name==='updateReducer'&&t.isIdentifier(q.node.id,{name:'current'})){q.parentPath.insertAfter(statement('state-begin',t.identifier('hook'),t.identifier('current'),t.identifier('queue')));count('state-begin');}
     },
     IfStatement(q){if(name==='updateReducer'&&q.getFunctionParent()===p&&t.isMemberExpression(q.node.test)&&t.isIdentifier(q.node.test.object,{name:'update'})&&t.isIdentifier(q.node.test.property,{name:'hasEagerState'})){q.insertAfter(statement('state-applied',t.identifier('hook'),t.identifier('update'),t.identifier('newState')));count('state-applied');}},
     ReturnStatement(q){if(q.getFunctionParent()!==p||!t.isArrayExpression(q.node.argument))return;
      if(name==='mountState'){q.insertBefore(statement('state-mount',t.identifier('hook'),t.identifier('queue'),t.identifier('currentlyRenderingFiber$1')));count('state-mount');}
      if(name!=='dispatchSetState'){q.node.argument=tap('state-result',q.node.argument,t.identifier('hook'),t.identifier('currentlyRenderingFiber$1'));count('state-result');}
     }
    });p.skip();
   }
   if(!dom&&name==='ReactElement'){
    p.traverse({CallExpression(q){const c=q.node.callee;if(t.isMemberExpression(c)&&t.isIdentifier(c.object,{name:'Object'})&&t.isIdentifier(c.property,{name:'freeze'})){q.node.callee=t.callExpression(t.identifier('__stateatomFreezeCallee'),[c.object,t.stringLiteral('freeze')]);count('freeze');q.skip();}}});p.skip();
   }
   if(!dom&&name===(file.endsWith('/react.development.js')?'createElement':'jsxDEV')){
    count('factory');let returns=0;
    p.traverse({ReturnStatement(q){if(q.getFunctionParent()!==p)return;returns++;q.node.argument=tap('factory-result',q.node.argument,t.identifier('props'),t.identifier('type'));}});
    if(returns!==1)throw Error('Unexpected native factory return count');
    const original=p.node.body.body;p.node.body.body=[statement('factory-enter'),t.tryStatement(t.blockStatement(original),null,t.blockStatement([statement('factory-exit')]))];p.skip();
   }
   if(dom&&['createFiber','createFiberRoot'].includes(name)){
    count(name);let returns=0;p.traverse({ReturnStatement(q){if(q.getFunctionParent()!==p)return;returns++;q.node.argument=name==='createFiber'?tap('fiber-brand',q.node.argument):tap('root-brand',q.node.argument,t.identifier('hydrate'));}});if(returns!==1)throw Error('Unexpected native '+name+' return count');p.skip();
   }
   if(dom&&['setInitialProperties','commitUpdate'].includes(name)){
    count(name);let returns=0;p.traverse({ReturnStatement(q){if(q.getFunctionParent()===p)returns++;}});if(returns)throw Error('Unexpected native props early return');
    p.node.body.body.push(statement('host-applied',t.identifier('domElement'),t.identifier(name==='setInitialProperties'?'rawProps':'newProps')));p.skip();
   }
   if(dom&&name==='commitRootImpl'){
    p.traverse({AssignmentExpression(q){const n=q.node;if(q.getFunctionParent()===p&&t.isMemberExpression(n.left)&&t.isIdentifier(n.left.object,{name:'root'})&&t.isIdentifier(n.left.property,{name:'current'})&&t.isIdentifier(n.right,{name:'finishedWork'})&&q.parentPath.isExpressionStatement()){q.parentPath.insertAfter(statement('root-committed',t.identifier('root'),t.identifier('finishedWork')));count('root-current');q.skip();}}});p.skip();
   }
  }
 });
 const expected=dom?{createFiber:1,createFiberRoot:1,setInitialProperties:1,commitUpdate:1,'root-current':2,...(reactStateHandoffs?{'state-mount':1,'state-dispatch':1,'state-begin':1,'state-applied':1,'state-result':2}:{})}:{factory:1,exports:file.endsWith('/react-jsx-runtime.development.js')?2:1,freeze:2};
 if(JSON.stringify(Object.entries(counts).sort())!==JSON.stringify(Object.entries(expected).sort()))throw Error('React host native site-count mismatch: '+JSON.stringify(counts));
 ast.program.body.unshift(...parse('const __stateatomHostOwnDescriptor=Object.getOwnPropertyDescriptor;').program.body);
 ast.program.body.push(...parse(helper).program.body);
 let code=generate(ast,{retainLines:true,comments:true},source).code,writeAccess;
 if(reactWriteAccessGuards)({code,writeAccess}=guardPrivateInput(code,{family:'react18',basename:path.basename(file),sourceType:'script',hoistMetadata:true,helperName:'__stateatomWriteGuard',preamble:'const __stateatomWriteOwn=Object.getOwnPropertyDescriptor,__stateatomWriteApply=Reflect.apply;',helperSource:"function __stateatomWriteField(o,k){const d=__stateatomWriteOwn(o,k),v=d&&__stateatomWriteOwn(d,'value');return v&&v.value;}function __stateatomWriteGuard(meta,receiver){try{const r=__stateatomWriteField(globalThis,'__STATEATOM__'),f=r&&__stateatomWriteField(r,'potentialPropertyWrite');if(typeof f==='function')__stateatomWriteApply(f,r,[meta,receiver]);}catch{}return receiver;}",scope:'Only four pinned adapter-generated React inputs; original IDE source unavailable, native/opaque/implicit/other-code history effects unknown'}));
 let firstReadCounts;if(firstReadContracts&&dom){const transformed=transformFirstReact(source,file,{transformedSource:code});code=transformed.code;firstReadCounts=transformed.counts;}
 return {code,counts,...(firstReadCounts?{firstReadCounts}:{}),sourceDigest:sha(source),outputDigest:sha(code),sourceBytes:Buffer.byteLength(source),outputBytes:Buffer.byteLength(code),...(writeAccess?{writeAccess}:{})};
}
export function makeReactHostProbe(projectRoot,{reactStateHandoffs=false,reactWriteAccessGuards=false,firstReadContracts=false}={}){
 const records=[],files=new Map(),contract={reactWriteAccessGuards,status:'Observed',adapter:hostAdapter,versions:{},sources:vendorHashes};
 try{const require=createRequire(path.resolve(projectRoot,'__stateatom_probe_resolve.cjs'));const bases={};
  for(const name of['react','react-dom']){const packageFile=require.resolve(name+'/package.json'),pkg=JSON.parse(readFileSync(packageFile,'utf8'));contract.versions[name]=pkg.version;if(pkg.version!=='18.3.1')throw Error('Unsupported '+name+' '+pkg.version);bases[name]=path.dirname(packageFile);}
  for(const[file,digest]of Object.entries(vendorHashes)){const name=file.split('/')[0],absolute=path.join(bases[name],file.slice(name.length+1));if(sha(readFileSync(absolute))!==digest)throw Error('Vendor source differs: '+file);files.set(absolute,file);}
 }catch(e){contract.status='Unknown/Unsupported';contract.reason=String(e.message);}
 const plugin={name:'stateatom-'+hostAdapter.replaceAll('/','-')+(reactStateHandoffs?'-state':''),setup(build){build.onLoad({filter:/[\\/]react(?:-dom)?[\\/]cjs[\\/].*\.development\.js$/},args=>{const file=files.get(args.path);if(!file)return;const transformed=transformReactVendor(readFileSync(args.path,'utf8'),file,{reactStateHandoffs,reactWriteAccessGuards,firstReadContracts});records.push({file,...transformed,code:undefined});return {contents:transformed.code,loader:'js',resolveDir:path.dirname(args.path)};});}};
 return {contract,records,plugin};
}
