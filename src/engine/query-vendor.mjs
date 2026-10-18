// SPDX-License-Identifier: Apache-2.0
// Private, pinned development input copies only. Never edits installed packages.
import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';import path from 'node:path';import {createHash} from 'node:crypto';
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
import {guardPrivateInput} from './write-access.mjs';
import {firstQueryHashes,transformFirstQuery} from "../first-read/query-contracts.mjs";
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,sha=s=>createHash('sha256').update(s).digest('hex');
export const queryAdapter='query5-native-handoff/1';
export const queryVendorHashes={
 '@tanstack/query-core/build/modern/queryClient.js':'0e6ed14b21a7f613af25d8c5a28919d0594fd3619c797fcb659a529b2f7b4a50',
 '@tanstack/query-core/build/modern/queryCache.js':'63f42e7789c128b90e4bb3e77501df2847dc95bdca9446d9a67e81b2b4810c64',
 '@tanstack/query-core/build/modern/query.js':'4bb40e427701f1c8a9684b51933414929cd4d186a7352e478d55f92406546df2'
};
const helper=`const __saqOwn=Object.getOwnPropertyDescriptor,__saqApply=Reflect.apply;
function __saqField(o,k){const d=__saqOwn(o,k),v=d&&__saqOwn(d,'value');return v&&v.value;}
function __saqTap(kind,a,b,c,d,e){try{const r=__saqField(globalThis,'__STATEATOM__'),f=r&&__saqField(r,'queryTap');if(typeof f==='function')return __saqApply(f,r,['query5-native-handoff/1',kind,a,b,c,d,e]);}catch{}}
function __saqValue(kind,value,a){__saqTap(kind,value,a);return value;}`;
const body=source=>parse('class Placeholder { #queryCache; #queries; method(){'+source+'} }',{sourceType:'module'}).program.body[0].body.body[2].body;
export function transformQueryVendor(source,file,{queryCallCensus=false,queryWriteAccessGuards=false}={}){
 if(!queryVendorHashes[file]||sha(source)!==queryVendorHashes[file])throw Error('Query vendor digest mismatch: '+file);
 const ast=parse(source,{sourceType:'module'}),counts=Object.create(null),count=k=>counts[k]=(counts[k]||0)+1;
 const tap=(kind,...args)=>t.callExpression(t.identifier('__saqTap'),[t.stringLiteral(kind),...args]);
 const stmt=(kind,...args)=>t.expressionStatement(tap(kind,...args));
 const value=(kind,expression)=>t.callExpression(t.identifier('__saqValue'),[t.stringLiteral(kind),expression]);
 const privateField=name=>t.memberExpression(t.thisExpression(),t.privateName(t.identifier(name)));
 traverse(ast,{
  ClassMethod(p){const name=p.node.key.name;
   if(name==='constructor'){
    if(file.endsWith('/queryClient.js'))p.node.body.body.push(stmt('client',t.thisExpression(),privateField('queryCache')));
    else if(file.endsWith('/queryCache.js'))p.node.body.body.push(stmt('cacheMethod',t.identifier('__saqCacheGet'),t.identifier('__saqCachePrototype')),stmt('cache',t.thisExpression(),privateField('queries')));
    else {
     let found=0;p.traverse({AssignmentExpression(q){if(q.getFunctionParent()!==p||!t.isMemberExpression(q.node.left)||!t.isThisExpression(q.node.left.object)||!t.isIdentifier(q.node.left.property,{name:'state'}))return;
      q.node.right=t.assignmentExpression('=',t.identifier('__saqInitial'),q.node.right);found++;
     }});if(found!==1)throw Error('Query initial state site mismatch');
     p.node.body.body.unshift(t.variableDeclaration('let',[t.variableDeclarator(t.identifier('__saqInitial'))]));
     p.node.body.body.push(stmt('query',t.thisExpression(),privateField('client'),privateField('cache'),t.identifier('__saqInitial')));
    }count('constructor');p.skip();
   }else if(file.endsWith('/queryClient.js')&&name==='getQueryData'){
    p.node.body=body(`const __saqFrame=__saqTap('beginRead',this);try{
 const options=this.defaultQueryOptions({queryKey});
 const __saqCache=this.#queryCache,__saqCallee=__saqTap('cacheMethodAt',__saqCache);
 const __saqQuery=this.#queryCache.get(options.queryHash);
 if(__saqQuery===null||__saqQuery===void 0)return void 0;
 const __saqState=__saqQuery.state,__saqData=__saqState.data;
 __saqTap('read',__saqFrame,{cache:__saqCache,callee:__saqCallee,query:__saqQuery,state:__saqState,data:__saqData});return __saqData;
 }finally{__saqTap('endRead',__saqFrame);}`);count('read');p.skip();
   }else if(file.endsWith('/queryCache.js')&&name==='get'){
    // Keep the original member-call syntax, receiver and lookup once; eligibility uses only branded own-data slots.
    p.node.body=body(`const __saqMap=this.#queries,__saqCallee=__saqTap('mapMethodAt',__saqMap);const __saqResult=this.#queries.get(queryHash);__saqTap('got',this,__saqMap,__saqCallee,queryHash,__saqResult);return __saqResult;`);
    // The helper parser's placeholder needs the corresponding private declaration.
    count('get');p.skip();
   }else if(file.endsWith('/queryCache.js')&&name==='add'){
    p.traverse({CallExpression(q){const c=q.node.callee;if(!t.isMemberExpression(c)||!t.isIdentifier(c.property,{name:'set'}))return;
     const original=q.node;original.arguments[0]=t.assignmentExpression('=',t.identifier('__saqKey'),original.arguments[0]);
     if(!q.parentPath.isExpressionStatement())throw Error('Unexpected Query cache set site');
     q.parentPath.insertAfter(stmt('stored',t.thisExpression(),privateField('queries'),t.identifier('__saqKey'),t.identifier('query')));count('stored');q.skip();
    }});p.node.body.body.unshift(t.variableDeclaration('let',[t.variableDeclarator(t.identifier('__saqKey'))]));p.skip();
   }else if(file.endsWith('/query.js')&&name==='setData'){
    p.traverse({ReturnStatement(q){if(q.getFunctionParent()!==p)return;q.insertBefore(stmt('returned',t.thisExpression(),t.identifier('data')));count('returned');}});p.skip();
   }
  },
  ClassPrivateMethod(p){if(!file.endsWith('/query.js')||p.node.key.id.name!=='dispatch')return;
   p.traverse({
    ObjectExpression(q){const f=q.getFunctionParent();if(!f?.isArrowFunctionExpression()||!f.parentPath.isVariableDeclarator()||!t.isIdentifier(f.parentPath.node.id,{name:'reducer'}))return;
     const parent=q.parentPath;if(!parent.isReturnStatement()&&!(parent.isVariableDeclarator()&&t.isIdentifier(parent.node.id,{name:'newState'})))return;
     q.replaceWith(value('state',q.node));count('state');q.skip();
    },
    AssignmentExpression(q){if(q.getFunctionParent()!==p||!t.isMemberExpression(q.node.left)||!t.isThisExpression(q.node.left.object)||!t.isIdentifier(q.node.left.property,{name:'state'}))return;
     q.node.right=t.assignmentExpression('=',t.identifier('__saqAssigned'),q.node.right);q.parentPath.insertAfter(stmt('assigned',t.thisExpression(),t.identifier('__saqAssigned')));count('assigned');q.skip();
    }
   });p.node.body.body.unshift(t.variableDeclaration('let',[t.variableDeclarator(t.identifier('__saqAssigned'))]));p.skip();
  },
  FunctionDeclaration(p){if(!file.endsWith('/query.js')||p.node.id.name!=='getDefaultState')return;
   p.traverse({ReturnStatement(q){if(q.getFunctionParent()!==p||!t.isObjectExpression(q.node.argument))return;q.node.argument=value('state',q.node.argument);count('state');q.skip();}});p.skip();
  }
 });
 if(queryCallCensus){traverse(ast,{ClassMethod(p){const name=p.node.key.name,method=file.endsWith('/queryClient.js')&&name==='setQueryData'?'client-set':file.endsWith('/queryCache.js')&&name==='build'?'cache-build':file.endsWith('/query.js')&&name==='setData'?'query-set':null;
  if(name==='constructor'&&!file.endsWith('/queryClient.js')){p.node.body.body.push(stmt('census-brand',t.stringLiteral(file.endsWith('/queryCache.js')?'cache-build':'query-set'),t.identifier('__saqCensusPrototype'),t.identifier('__saqCensusMethod')));count('call-method-brand');p.skip();return;}if(!method)return;
  const token=t.identifier('__saqCallFrame');
  p.traverse({ReturnStatement(q){if(q.getFunctionParent()!==p)return;const original=q.node.argument||t.unaryExpression('void',t.numericLiteral(0));
   if(method==='client-set'&&t.isCallExpression(original)&&t.isMemberExpression(original.callee)&&t.isIdentifier(original.callee.property,{name:'setData'})){
    if(original.arguments.length!==2||!t.isObjectExpression(original.arguments[1]))throw Error('Query call options site mismatch');
    q.insertBefore(stmt('call-plan',t.cloneNode(token),privateField('queryCache'),t.identifier('data'),t.identifier('defaultedOptions')));count('call-plan');
    original.arguments[1]=t.callExpression(t.identifier('__saqValue'),[t.stringLiteral('call-ready'),original.arguments[1],t.cloneNode(token)]);count('call-ready');
   }
   q.node.argument=t.callExpression(t.identifier('__saqValue'),[t.stringLiteral('call-result'),original,t.cloneNode(token)]);count('call-return');q.skip();
  }});
  const data=t.identifier(method==='client-set'?'updater':method==='cache-build'?'client':'newData'),options=t.identifier('options'),original=p.node.body;
  p.node.body=t.blockStatement([t.variableDeclaration('const',[t.variableDeclarator(token,tap('call-begin',t.stringLiteral(method),t.thisExpression(),data,options))]),t.tryStatement(original,null,t.blockStatement([stmt('call-end',t.cloneNode(token))]))]);count('call-frame');p.skip();
 }});}
 const expected=file.endsWith('/queryClient.js')?{constructor:1,read:1}:file.endsWith('/queryCache.js')?{constructor:1,get:1,stored:1}:{constructor:1,returned:1,state:9,assigned:1};
 if(queryCallCensus)Object.assign(expected,{'call-frame':1,'call-return':file.endsWith('/queryClient.js')?2:1,...(file.endsWith('/queryClient.js')?{'call-plan':1,'call-ready':1}:{'call-method-brand':1})});
 if(JSON.stringify(Object.entries(counts).sort())!==JSON.stringify(Object.entries(expected).sort()))throw Error('Query native site-count mismatch: '+JSON.stringify(counts));
 ast.program.body.unshift(...parse(helper).program.body);
 if(file.endsWith('/queryCache.js'))ast.program.body.push(...parse("const __saqCachePrototype=QueryCache.prototype,__saqCacheGet=__saqField(__saqCachePrototype,'get');").program.body);
 if(queryCallCensus&&!file.endsWith('/queryClient.js'))ast.program.body.push(...parse("const __saqCensusPrototype="+(file.endsWith('/queryCache.js')?'QueryCache':'Query')+".prototype,__saqCensusMethod=__saqField(__saqCensusPrototype,'"+(file.endsWith('/queryCache.js')?'build':'setData')+"');").program.body);
 let code=generate(ast,{comments:true},source).code,writeAccess;
 if(queryWriteAccessGuards){
  ({code,writeAccess}=guardPrivateInput(code,{family:'query5',basename:path.basename(file),helperName:'__saqGuard',helperSource:"function __saqGuard(meta,receiver){try{const r=__saqField(globalThis,'__STATEATOM__'),f=r&&__saqField(r,'potentialPropertyWrite');if(typeof f==='function')__saqApply(f,r,[meta,receiver]);}catch{}return receiver;}",scope:'Only three pinned adapter-generated Query inputs; original IDE source unavailable, other files/native/opaque/implicit/history effects unknown'}));
 }
 return{code,counts,sourceDigest:sha(source),outputDigest:sha(code),sourceBytes:Buffer.byteLength(source),outputBytes:Buffer.byteLength(code),...(writeAccess?{writeAccess}:{})};
}
export function makeQueryProbe(projectRoot,{queryCallCensus=false,queryWriteAccessGuards=false,firstReadContracts=false}={}){
 const inputHashes=firstReadContracts?Object.fromEntries(Object.entries(firstQueryHashes).map(([name,digest])=>['@tanstack/query-core/build/modern/'+name,digest])):queryVendorHashes;
 const records=[],files=new Map(),contract={queryCallCensus,queryWriteAccessGuards,firstReadContracts,status:'Observed',adapter:queryAdapter,version:null,sources:inputHashes};
 try{const require=createRequire(path.resolve(projectRoot,'__stateatom_query_resolve.cjs')),packageFile=require.resolve('@tanstack/query-core/package.json'),pkg=JSON.parse(readFileSync(packageFile,'utf8'));contract.version=pkg.version;if(pkg.version!=='5.90.3')throw Error('Unsupported Query '+pkg.version);
  for(const[file,digest]of Object.entries(inputHashes)){const absolute=path.join(path.dirname(packageFile),file.slice('@tanstack/query-core/'.length));if(sha(readFileSync(absolute))!==digest)throw Error('Vendor source differs: '+file);files.set(absolute,file);}
 }catch(e){contract.status='Unknown/Unsupported';contract.reason=String(e.message);}
 const plugin={name:'stateatom-query5-native-handoff',setup(build){
  if(firstReadContracts)build.onResolve({filter:/^stateatom:first-read-query-ledger$/},()=>({path:'/@stateatom/first-read-query',external:true}));
  build.onLoad({filter:/[\\/]@tanstack[\\/]query-core[\\/]build[\\/]modern[\\/](queryClient|queryCache|query|utils|notifyManager|subscribable|removable|timeoutManager)\.js$/},args=>{
   const file=files.get(args.path);if(!file)return;const source=readFileSync(args.path,'utf8');
   let transformed=queryVendorHashes[file]?transformQueryVendor(source,file,{queryCallCensus,queryWriteAccessGuards}):{code:source,counts:{},sourceDigest:sha(source),sourceBytes:Buffer.byteLength(source)};
   if(firstReadContracts){const first=transformFirstQuery(source,path.basename(file),{transformedSource:transformed.code});transformed={...transformed,code:first.code,firstReadCounts:first.counts,outputDigest:sha(first.code),outputBytes:Buffer.byteLength(first.code)};}
   records.push({file,...transformed,code:undefined});return{contents:transformed.code,loader:'js',resolveDir:path.dirname(args.path)};
  });
 }};
 return{contract,records,plugin};
}
