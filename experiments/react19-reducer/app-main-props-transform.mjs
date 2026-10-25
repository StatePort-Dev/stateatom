// SPDX-License-Identifier: Apache-2.0
// Closed App JSX configuration compiler; original App binding recipe unchanged.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {transform} from 'esbuild';
import {createHash} from 'node:crypto';
import {instrumentAppHookBinding} from './app-hook-binding-transform.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule,hash=s=>createHash('sha256').update(s).digest('hex');
export async function prepareAppMainPropsApplication(source,file,{enabled=false}={}){
 if(typeof source!=='string'||typeof file!=='string'||!file||file.length>1024)throw TypeError('Bounded App source/file required');
 const empty={code:source,skipped:false,unsupported:[],policy:null,sourceOnly:true,nativeRuntimeProven:false},refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});if(!enabled)return empty;
 const hook=instrumentAppHookBinding(source,file,{enabled:true});if(hook.skipped)return refuse('App hook profile refused');
 const options={loader:'jsx',jsx:'automatic',format:'esm',target:'es2022',sourcefile:file,tsconfigRaw:{compilerOptions:{}}};
 const lowered=await transform(hook.code,options),ast=parse(lowered.code,{sourceType:'module'});let app=null,mainBinding=null,bound=null,target=null,targets=0,unsafe=false;
 const isHook=(p,name)=>p.isCallExpression()&&t.isMemberExpression(p.node.callee,{computed:false})&&t.isIdentifier(p.node.callee.object,{name:'__sa_app_hook_binding'})&&t.isIdentifier(p.node.callee.property,{name});
 const imported=(binding,name,module)=>binding?.path.isImportSpecifier()&&t.isIdentifier(binding.path.node.imported,{name})&&binding.path.node.local.name===name&&binding.path.parentPath.node.source.value===module;
 traverse(ast,{FunctionDeclaration(p){if(p.node.id?.name==='App'&&p.parentPath.isProgram())app=p;}});
 if(!app)return refuse('Generated App declaration unavailable');mainBinding=app.scope.getBinding('Main');if(!imported(mainBinding,'Main','./components/main'))return refuse('Original Main named import required');
 app.traverse({Function(p){p.skip();},CallExpression(p){if(isHook(p,'bound')){if(bound)unsafe=true;bound=p;}if(t.isIdentifier(p.node.arguments[0],{name:'Main'})&&p.scope.getBinding('Main')===mainBinding){targets++;target=p;}}});
 if(unsafe||!bound||targets!==1||!target||bound.node.arguments.length!==5)return refuse('One generated bound event and original Main JSX call required');
 const args=bound.node.arguments,[frame,tuple,todos,dispatch,tag]=args;
 if(!t.isIdentifier(frame)||!t.isIdentifier(tuple)||!t.isIdentifier(todos,{name:'todos'})||!t.isIdentifier(dispatch,{name:'dispatch'})||!t.isStringLiteral(tag,{value:hook.bindingSite.id}))return refuse('Generated App binding witness mismatch');
 const frameBinding=bound.scope.getBinding(frame.name),todosBinding=bound.scope.getBinding('todos'),dispatchBinding=bound.scope.getBinding('dispatch');
 if(!frameBinding?.path.isVariableDeclarator()||!isHook(frameBinding.path.get('init'),'appEnter')||frameBinding.path.node.init.arguments.length!==1||!t.isStringLiteral(frameBinding.path.node.init.arguments[0],{value:hook.appSite.id})||!todosBinding||!dispatchBinding||!todosBinding.constant||!dispatchBinding.constant||todosBinding.path.node!==dispatchBinding.path.node||!todosBinding.path.isVariableDeclarator()||!t.isArrayPattern(todosBinding.path.node.id)||!t.isIdentifier(todosBinding.path.node.init,{name:tuple.name})||todosBinding.path.parentPath.node.kind!=='const')return refuse('Exact lexical App bindings unavailable');
 const call=target.node,callee=target.scope.getBinding(t.isIdentifier(call.callee)?call.callee.name:'');
 if(!callee?.path.isImportSpecifier()||!t.isIdentifier(callee.path.node.imported,{name:'jsx'})||callee.path.parentPath.node.source.value!=='react/jsx-runtime'||call.arguments.length!==2||!t.isObjectExpression(call.arguments[1])||call.arguments[1].properties.length!==2)return refuse('One automatic jsx Main call with fresh two-field config required');
 const properties=call.arguments[1].properties,names=['todos','dispatch'],bindings=[todosBinding,dispatchBinding];
 for(let i=0;i<2;i++){const p=properties[i];if(!t.isObjectProperty(p)||p.computed||!t.isIdentifier(p.key,{name:names[i]})||!t.isIdentifier(p.value,{name:names[i]})||target.scope.getBinding(names[i])!==bindings[i])return refuse('Config values must be the exact original const bindings');}
 if(target.scope.getBinding(frame.name)!==frameBinding||target.node.start<=bound.node.end)return refuse('Config must follow the same App bound event');
 const sourceDigest=hash(lowered.code),node=call.arguments[1],loc=node.loc,configSite={id:hash(file+'\0'+sourceDigest+'\0'+node.start+':'+node.end+':app-main-config'),file:file+':lowered',sourceDigest,kind:'app-main-config',line:loc.start.line,column:loc.start.column+1,endLine:loc.end.line,endColumn:loc.end.column+1,appSiteId:hook.appSite.id,bindingSiteId:hook.bindingSite.id,field:'todos',component:'Main'};
 call.arguments[1]=t.callExpression(t.memberExpression(t.identifier('__sa_app_hook_binding'),t.identifier('config')),[t.cloneNode(frame),node,t.stringLiteral(configSite.id)]);
 const observedESM=generate(ast,{comments:true},lowered.code).code,cjs={loader:'js',format:'cjs',target:'es2022',tsconfigRaw:{compilerOptions:{}}};
 const originalESM=await transform(source,options),original=await transform(originalESM.code,cjs),observed=await transform(observedESM,cjs),policy={app:{appSite:hook.appSite,bindingSite:hook.bindingSite},configSite};
 return{...empty,code:observedESM,originalCode:original.code,observedCode:observed.code,observedESM,policy,receipt:{schema:'stateatom.app-main-config-application-receipt/1',file,sourceDigest:hash(source),originalCompiledDigest:hash(original.code),observedCompiledDigest:hash(observed.code),observedESMDigest:hash(observedESM),loweredDigest:sourceDigest,...policy,moduleWrapper:'strict CJS compatibility wrapper for original ESM',sourceOnly:true,nativeRuntimeProven:false,fullA02:false}};
}
