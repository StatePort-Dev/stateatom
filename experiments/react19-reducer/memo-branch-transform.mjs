// SPDX-License-Identifier: Apache-2.0
// Pinned source call-return facts only; no memo consumer/runtime qualification.
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';import {createHash} from 'node:crypto';
import {transformPinnedNativeStateReturn} from './native-state-return-transform.mjs';
import {instrumentElementFiberGrammar} from './native-element-fiber-transform.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
const fileName='react-dom/cjs/react-dom-client.development.js',ownerName='updateSimpleMemoComponent',parameters=['current','workInProgress','Component','nextProps','renderLanes'];
const roles={functionUpdate:{callee:'updateFunctionComponent',kind:'memo-function-update-return',args:parameters},bailout:{callee:'bailoutOnAlreadyFinishedWork',kind:'memo-bailout-return',args:['current','workInProgress','renderLanes']}};
const helper=`const __saMemoBranchOwn=Object.getOwnPropertyDescriptor,__saMemoBranchApply=Reflect.apply;
function __saMemoBranchTap(result,kind,fiber,component,props,site){try{const d=__saMemoBranchOwn(globalThis,'__STATEATOM_MEMO_BRANCH_TAP__'),f=d&&__saMemoBranchOwn(d,'value')?.value;if(typeof f==='function')__saMemoBranchApply(f,undefined,[kind,fiber,component,props,site]);}catch{}return result;}`;
function findSites(ast){
 let fn=null;traverse(ast,{FunctionDeclaration(p){if(p.node.id?.name!==ownerName)return;if(fn)throw Error('Duplicate memo owner');fn=p;}});
 if(!fn||fn.node.async||fn.node.generator||fn.node.params.length!==5||!parameters.every((name,i)=>t.isIdentifier(fn.node.params[i],{name})))throw Error('Closed memo owner parameters required');
 const bindings={};for(const name of parameters){const b=fn.scope.getBinding(name);if(!b||b.kind!=='param')throw Error('Owned memo parameters required');bindings[name]=b;}
 for(const name of parameters)if(name!=='nextProps'&&!bindings[name].constant||bindings[name].constantViolations.some(p=>p.getFunctionParent()!==fn))throw Error('Memo owner parameter mutation refused');
 const calls={},returns=[];let unsafe=false;
 fn.get('body').traverse({Function(p){p.skip();},WithStatement(){unsafe=true;},ReturnStatement(p){returns.push(p);},CallExpression(p){
  const n=p.node;if(t.isIdentifier(n.callee,{name:'eval'})){unsafe=true;return;}
  const role=Object.keys(roles).find(k=>t.isIdentifier(n.callee,{name:roles[k].callee}));if(!role)return;
  if(calls[role])throw Error('Duplicate memo branch call');const expected=roles[role],b=p.scope.getBinding(expected.callee);
  if(!b?.constant||!b.path.isFunctionDeclaration()||b.scope!==fn.scope.parent||n.arguments.length!==expected.args.length)throw Error('Closed external memo callee binding required');
  for(let i=0;i<expected.args.length;i++){const name=expected.args[i];if(!t.isIdentifier(n.arguments[i],{name})||p.scope.getBinding(name)!==bindings[name])throw Error('Exact original memo operands required');}
  for(const name of ['workInProgress','Component','nextProps'])if(p.scope.getBinding(name)!==bindings[name])throw Error('Exact injected memo reference bindings required');
  if(p.scope.getBinding('__saMemoBranchTap'))throw Error('Lexical memo helper collision');
  const tail=p.parentPath.isSequenceExpression()&&p.parentPath.node.expressions.at(-1)===n?p.parentPath:p;
  if(!tail.parentPath.isReturnStatement()||tail.parentPath.node.argument!==tail.node)throw Error('Original memo branch return position required');
  calls[role]=p;
 }});
 if(unsafe||returns.length!==2||Object.keys(calls).length!==2||fn.node.body.body.at(-1)!==calls.functionUpdate.parentPath.node)throw Error('Two closed memo branch returns required');
 return Object.keys(roles).map(role=>({role,path:calls[role]}));
}
export function instrumentMemoBranchGrammar(source,file,{originalSource=source}={}){
 if(typeof source!=='string'||typeof originalSource!=='string'||typeof file!=='string')throw TypeError('Source/file required');
 const empty={code:source,skipped:false,unsupported:[],policy:null,counts:{functionUpdate:0,bailout:0},sourceDigest:hash(originalSource),inputDigest:hash(source),sourceOnly:true,nativeVersionAdmitted:false,retainedMemoItemQualified:false};
 const refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});
 if(file!==fileName||Buffer.byteLength(source)>4*1024*1024||Buffer.byteLength(originalSource)>4*1024*1024||source.includes('__saMemoBranch')||originalSource.includes('__saMemoBranch'))return refuse('Memo source/file/helper bound refused');
 try{
  const ast=parse(source,{sourceType:'script'}),original=parse(originalSource,{sourceType:'script'}),targets=findSites(ast),originals=findSites(original),sites=[];
  for(let i=0;i<targets.length;i++){
   const target=targets[i],n=originals[i].path.node,l=n.loc;if(target.role!==originals[i].role)throw Error('Memo source correspondence refused');
   const site={id:hash(file+'\0'+empty.sourceDigest+'\0'+n.start+':'+n.end+':'+target.role),file,sourceDigest:empty.sourceDigest,kind:'native-memo-branch',owner:ownerName,role:target.role,eventKind:roles[target.role].kind,line:l.start.line,column:l.start.column+1,endLine:l.end.line,endColumn:l.end.column+1};sites.push(site);
   target.path.replaceWith(t.callExpression(t.identifier('__saMemoBranchTap'),[target.path.node,t.stringLiteral(site.eventKind),t.identifier('workInProgress'),t.identifier('Component'),t.identifier('nextProps'),t.stringLiteral(site.id)]));target.path.skip();
  }
  ast.program.body.unshift(...parse(helper,{sourceType:'script'}).program.body);const code=generate(ast,{comments:true},source).code;parse(code,{sourceType:'script'});
  return{...empty,code,counts:{functionUpdate:1,bailout:1},policy:{schema:'stateatom.native-memo-branch-source/1',file,sourceDigest:empty.sourceDigest,sites,nativeVersionAdmitted:false},outputDigest:hash(code),recipe:'stateatom.native-memo-branch-source/1',scope:'Provisional original native memo branch callee returned and actual local props references; user/subtree/commit/property origin unproven'};
 }catch{return refuse('Closed memo branch ownership/grammar refused');}
}
export function transformPinnedMemoBranch(source,file=fileName){
 if(file!==fileName)throw Error('Only pinned ReactDOM memo source admitted');
 const native=transformPinnedNativeStateReturn(source,file),element=instrumentElementFiberGrammar(native.code,file,{originalSource:source});if(element.skipped)throw Error('Pinned element source chain refused');
 const memo=instrumentMemoBranchGrammar(element.code,file,{originalSource:source});if(memo.skipped)throw Error('Pinned memo branch grammar refused');
 return{...memo,nativeVersionAdmitted:true,version:native.version,policy:{...memo.policy,nativeVersionAdmitted:true,version:native.version},nativeReturnPolicy:native.policy,nativeReturnCounts:native.counts,elementFiberPolicy:{...element.policy,nativeVersionAdmitted:true,version:native.version},elementFiberCounts:element.counts,baseCounts:native.baseCounts,chainDigests:{baseSource:native.baseSourceDigest,baseOutput:native.baseOutputDigest,nativeReturnOutput:native.outputDigest,elementInput:element.inputDigest,elementOutput:element.outputDigest,memoInput:memo.inputDigest,memoOutput:memo.outputDigest}};
}
