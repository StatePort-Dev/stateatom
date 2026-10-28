// SPDX-License-Identifier: Apache-2.0
// Finite lexical list/row use account. This is NOT a readonly runtime certificate.
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import * as t from '@babel/types';import {createHash} from 'node:crypto';import path from 'node:path';
import {instrumentReducerFieldWrites} from './reducer-field-writes.mjs';
const traverse=traverseModule.default||traverseModule,hash=s=>createHash('sha256').update(s).digest('hex');
export function admitListFieldSources(files,{root,field,maxSteps=512}={}){
 const modules=new Map(),used=new Set(),edges=[],dataSites=[],unsupported=[],scalarFields=new Set(),kinds=new Map(),queue=[],callbacks=new Map(),nativeSites=new Map(),consumed=new Map();let steps=0,reducerFn,compiler=null;
 const premises=[
  'Actual selected field and every listed row field are original ordinary own-data primitive reads; no getter/Proxy or object-valued field is admitted by this source result.',
  'Original array methods and ordinary array construction/species are independently acquired and admitted; syntax does not identify a native implementation.',
  'Complete admitted main-world code and native retention effects, including absence of foreign Fiber/DevTools exposure and unknown code, cover the whole write-to-read interval.',
  'Exact source hashes, applied call/state/row, source callback/props/parameter/read and selected current commit identities match; HMR/Stop/missing references invalidate current authority.'
 ];
 const result=ok=>({status:ok?'Conditional source admission':'Unknown/Unsupported',sourceUsesComplete:ok,scope:'Lexical list/row references within the finite admitted source graph, conditional on every separate runtime premise',modules:[...used].sort().map(file=>({file,sourceDigest:modules.get(file).digest})),edges,compiler:ok?compiler:null,dataSites:ok?dataSites:[],scalarFields:[...scalarFields].sort(),unsupported,runtimePremises:premises,fieldOwnership:'Unknown/Unsupported',fullPath:false});
 const fail=(why,p,ctx)=>{unsupported.push({reason:why,...(ctx?{file:ctx.file,sourceDigest:ctx.digest}:{}),...(p?.node?.loc?{line:p.node.loc.start.line,column:p.node.loc.start.column+1}:{})});throw Error('Source admission refused');};
 const tick=(p,ctx)=>{if(++steps>maxSteps)fail('Source-use budget exceeded',p,ctx);};
 const location=(p,ctx,kind,extra={})=>({kind,file:ctx.file,sourceDigest:ctx.digest,line:p.node.loc.start.line,column:p.node.loc.start.column+1,...extra});
 try{
  if(!Array.isArray(files)||!files.length||files.length>32||!Number.isSafeInteger(maxSteps)||maxSteps<1||maxSteps>4096||typeof root?.file!=='string'||typeof root?.export!=='string'||typeof field!=='string'||!field||field.length>128)fail('Invalid bounded source inputs');
  let bytes=0;for(const input of files){if(typeof input?.file!=='string'||!input.file||input.file.length>4096||modules.has(input.file)||typeof input.text!=='string'||Buffer.byteLength(input.text)>256000||(bytes+=Buffer.byteLength(input.text))>2000000)fail('Missing, duplicate or oversized source input');
   const ast=parse(input.text,{sourceType:'module',plugins:['jsx','typescript']}),ctx={file:input.file,text:input.text,digest:hash(input.text),ast,exports:new Map(),program:null};
   traverse(ast,{Program(p){ctx.program=p;}});
   for(const statement of ctx.program.get('body'))if(statement.isExportNamedDeclaration()){
    if(statement.node.source)continue;const d=statement.get('declaration');if(d?.isFunctionDeclaration()&&d.node.id)ctx.exports.set(d.node.id.name,ctx.program.scope.getBinding(d.node.id.name));
    if(d?.isVariableDeclaration())for(const v of d.get('declarations'))if(v.get('id').isIdentifier())ctx.exports.set(v.node.id.name,ctx.program.scope.getBinding(v.node.id.name));
    for(const spec of statement.get('specifiers'))if(spec.isExportSpecifier())ctx.exports.set(spec.node.exported.name||spec.node.exported.value,ctx.program.scope.getBinding(spec.node.local.name));
   }
   modules.set(input.file,ctx);
  }
  function imported(p,name){if(!p?.isIdentifier())return false;const b=p.scope.getBinding(p.node.name),i=b?.path;return i?.isImportSpecifier()&&i.parent.source.value==='react'&&(i.node.imported.name||i.node.imported.value)===name;}
  function resolve(binding,ctx,seen=new Set()){
   if(!binding||seen.has(binding)||!binding.constant)fail('Unique immutable source binding required',binding?.path,ctx);seen.add(binding);used.add(ctx.file);
   if(binding.path.isImportSpecifier()){
    const source=binding.path.parent.source.value;if(!source.startsWith('.'))fail('Opaque component/reducer module',binding.path,ctx);
    const stem=path.posix.normalize(path.posix.join(path.posix.dirname(ctx.file),source)),matches=[stem,stem+'.js',stem+'.jsx',stem+'.ts',stem+'.tsx'].filter(f=>modules.has(f));if(matches.length!==1)fail('Missing or ambiguous local module',binding.path,ctx);
    const next=modules.get(matches[0]),name=binding.path.node.imported.name||binding.path.node.imported.value;return resolve(next.exports.get(name),next,seen);
   }
   return{binding,ctx};
  }
  function functionOf(binding,ctx){const r=resolve(binding,ctx);let fn=r.binding.path;
   if(fn.isVariableDeclarator())fn=fn.get('init');
   if(fn.isCallExpression()&&imported(fn.get('callee'),'memo')&&fn.node.arguments.length===1)fn=fn.get('arguments.0');
   if(!(fn.isFunctionDeclaration()||fn.isFunctionExpression()||fn.isArrowFunctionExpression())||fn.node.async||fn.node.generator)fail('Ordinary synchronous source function required',fn,r.ctx);used.add(r.ctx.file);return{...r,fn};
  }
  function enqueue(binding,kind,ctx){if(!binding||!binding.constant)fail('Mutable or missing row/list alias',binding?.path,ctx);const old=kinds.get(binding);if(old&&old!==kind)fail('Competing row/list alias kinds',binding.path,ctx);if(!old){kinds.set(binding,kind);queue.push({binding,kind,ctx});used.add(ctx.file);}}
  function componentProp(element,prop,kind,ctx){
   const opening=element.get('openingElement'),name=opening.get('name');if(!name.isJSXIdentifier()||!/^[A-Z]/.test(name.node.name))fail('Opaque or native element receives row/list reference',name,ctx);
   const receiver=functionOf(name.scope.getBinding(name.node.name),ctx),params=receiver.fn.get('params');if(params.length!==1||!params[0].isObjectPattern())fail('Direct destructured component parameter required',receiver.fn,receiver.ctx);
   const properties=params[0].get('properties');if(properties.some(p=>!p.isObjectProperty()||p.node.computed||!p.get('value').isIdentifier()))fail('Computed, default or rest component props unsupported',params[0],receiver.ctx);
   const matches=properties.filter(p=>(p.node.key.name||p.node.key.value)===prop);if(matches.length!==1)fail('Unique corresponding component prop required',params[0],receiver.ctx);
   let sender=opening.getFunctionParent();while(sender&&!sender.node.id&&!sender.parentPath.isVariableDeclarator())sender=sender.getFunctionParent();
   const senderName=sender?.node.id?.name||(sender?.parentPath.isVariableDeclarator()?sender.parentPath.node.id.name:null);
   enqueue(receiver.fn.scope.getBinding(matches[0].node.value.name),kind,receiver.ctx);edges.push(location(opening,ctx,'component-prop',{prop,valueKind:kind,sourceBinding:senderName,targetBinding:receiver.fn.node.id?.name||receiver.binding.identifier.name,targetFile:receiver.ctx.file,parameter:matches[0].node.value.name}));
  }
  function returns(fn){if(!fn.get('body').isBlockStatement())return[fn.get('body')];const list=[];fn.get('body').traverse({Function(p){p.skip()},ReturnStatement(p){if(p.node.argument)list.push(p.get('argument'));else list.push(p);}});return list;}
  function mapKind(p,param){if(p.isJSXElement()||p.isJSXFragment())return'elements';if(p.isIdentifier()&&p.scope.getBinding(p.node.name)===param||p.isObjectExpression())return'collection';if(p.isConditionalExpression()){const a=mapKind(p.get('consequent'),param),b=mapKind(p.get('alternate'),param);return a===b?a:null;}return null;}
  function nativeCall(call,member,kind,ctx){
   if(kind!=='collection'||member.node.computed||!member.get('property').isIdentifier())fail('Opaque collection receiver',call,ctx);
   const method=member.node.property.name,args=call.get('arguments');if(!['filter','map','every','concat'].includes(method)||args.length!==1)fail('Unsupported native array method/arguments',call,ctx);
   let output='collection';if(method!=='concat'){
    const fn=args[0];if(!(fn.isArrowFunctionExpression()||fn.isFunctionExpression())||fn.node.async||fn.node.generator||fn.node.params.length!==1||!fn.get('params.0').isIdentifier())fail('One ordinary inline array callback required',fn,ctx);
    const param=fn.scope.getBinding(fn.node.params[0].name),values=returns(fn);if(!values.length)fail('Callback return unavailable',fn,ctx);
    if(method==='map'){const types=values.map(p=>mapKind(p,param));if(!types[0]||types.some(x=>x!==types[0]))fail('Unsupported or competing map output',fn,ctx);output=types[0];}
    callbacks.set(fn.node,{method,output});enqueue(param,'row',ctx);
   }else if(args[0].isSpreadElement())fail('Spread concat argument unsupported',call,ctx);
   nativeSites.set(call.node,{method,output});edges.push(location(call,ctx,'native-array',{method,output}));if(method!=='every')consume(call,output,ctx);
  }
  function returnValue(p,kind,ctx){const fn=p.getFunctionParent();if(!fn)fail('Unbound return value',p,ctx);
   if(fn===reducerFn){if(kind!=='collection')fail('Reducer returned a non-list tracked value',p,ctx);return;}
   const cb=callbacks.get(fn.node);if(cb){if(cb.method==='filter'||cb.method==='every'||cb.method==='map'&&kind==='row')return;fail('Unexpected callback reference return',p,ctx);}
   const parent=fn.parentPath;if(parent?.isCallExpression()&&fn.key===0&&imported(parent.get('callee'),'useMemo')&&fn.node.params.length===0&&!fn.node.async&&!fn.node.generator){consume(parent,kind,ctx);return;}
   fail('Reference returned through opaque function',p,ctx);
  }
  function isWriteTarget(p){
   for(let current=p;current?.parentPath;){const parent=current.parentPath;
    if(parent.isAssignmentExpression())return current.key==='left';
    if(parent.isUpdateExpression()||parent.isUnaryExpression({operator:'delete'}))return true;
    if(parent.isForOfStatement()||parent.isForInStatement())return current.key==='left';
    if(parent.isArrayPattern()||parent.isObjectPattern()||parent.isRestElement()||parent.isAssignmentPattern()&&current.key==='left'||parent.isObjectProperty()&&parent.parentPath.isObjectPattern()&&current.key==='value'){current=parent;continue;}
    return false;
   }return false;
  }
  function consume(p,kind,ctx){tick(p,ctx);let seen=consumed.get(p.node);if(!seen){seen=new Set();consumed.set(p.node,seen);}if(seen.has(kind))return;seen.add(kind);const up=p.parentPath;if(!up)fail('Unbound tracked value',p,ctx);
   if(isWriteTarget(p)||up.isAssignmentExpression())fail('Row/list alias write or assignment escape',up,ctx);
   if(up.isMemberExpression()&&p.key==='object'){
    if(up.node.computed||up.node.optional||!up.get('property').isIdentifier())fail('Computed/optional row or list access unsupported',up,ctx);
    const next=up.parentPath;if(isWriteTarget(up))fail('Row/list property write',next,ctx);
    if(next?.isCallExpression()&&up.key==='callee'){nativeCall(next,up,kind,ctx);return;}
    const key=up.node.property.name;if(kind==='collection'&&key==='length')return;if(kind==='row'){scalarFields.add(key);edges.push(location(up,ctx,'conditional-scalar-read',{field:key}));return;}fail('Unsupported collection member',up,ctx);
   }
   if(up.isVariableDeclarator()&&p.key==='init'){
    if(up.parentPath.node.kind!=='const')fail('Mutable row/list alias',up,ctx);const id=up.get('id');
    if(id.isIdentifier()){enqueue(up.scope.getBinding(id.node.name),kind,ctx);return;}
    if(kind==='row'&&id.isObjectPattern()){
     for(const prop of id.get('properties')){if(!prop.isObjectProperty()||prop.node.computed||!prop.get('value').isIdentifier())fail('Nonordinary row destructuring',prop,ctx);const key=prop.node.key.name||prop.node.key.value;if(typeof key!=='string')fail('Unknown row field',prop,ctx);scalarFields.add(key);edges.push(location(prop,ctx,'conditional-scalar-read',{field:key}));}return;
    }fail('Unsupported row/list alias pattern',up,ctx);
   }
   if(up.isJSXExpressionContainer()){
    const holder=up.parentPath;if(holder.isJSXAttribute()){const name=holder.get('name');if(!name.isJSXIdentifier())fail('Computed JSX prop',holder,ctx);componentProp(holder.parentPath.parentPath,name.node.name,kind,ctx);return;}
    if(kind==='elements'&&(holder.isJSXElement()||holder.isJSXFragment()))return;fail('Raw row/list rendered as children',up,ctx);
   }
   if(up.isReturnStatement()||up.isArrowFunctionExpression()&&p.key==='body'){returnValue(p,kind,ctx);return;}
   if(up.isConditionalExpression()&&p.key!=='test'){consume(up,kind,ctx);return;}
   if(up.isArrayExpression()){
    const call=up.parentPath;if(call?.isCallExpression()&&up.listKey==='arguments'&&up.key===1&&(imported(call.get('callee'),'useMemo')||imported(call.get('callee'),'useCallback'))){edges.push(location(up,ctx,'native-hook-retention'));return;}
    if(kind==='row'&&up.node.elements.length===1){consume(up,'collection',ctx);return;}fail('Reference stored in unsupported array container',up,ctx);
   }
   if(up.isSpreadElement()&&kind==='row'&&up.parentPath.isObjectExpression()){
    const literal=up.parentPath;if(literal.node.properties.some(n=>!t.isSpreadElement(n)&&(!t.isObjectProperty(n)||n.computed||(n.key.name||n.key.value)==='__proto__')))fail('Nonordinary copied row object',literal,ctx);consume(literal,'row',ctx);return;
   }
   if(up.isCallExpression()&&p.listKey==='arguments'){
    const site=nativeSites.get(up.node);if(site?.method==='concat'&&kind==='row')return;fail('Opaque call receives row/list reference',up,ctx);
   }
   if(up.isUnaryExpression({operator:'!'})||up.isIfStatement()&&p.key==='test'||up.isConditionalExpression()&&p.key==='test'||up.isBinaryExpression()&&['===','!=='].includes(up.node.operator))return;
   fail('Unsupported row/list reference context',up,ctx);
  }
  const rootCtx=modules.get(root.file);if(!rootCtx)fail('Root module unavailable');const owner=functionOf(rootCtx.exports.get(root.export),rootCtx),calls=[];
  owner.fn.traverse({Function(p){p.skip()},CallExpression(p){if(imported(p.get('callee'),'useReducer'))calls.push(p);}});
  if(calls.length!==1)fail('One root useReducer binding required',owner.fn,owner.ctx);const call=calls[0],decl=call.parentPath,args=call.get('arguments');
  if(args.length!==2||!args[0].isIdentifier()||!args[1].isArrayExpression()||args[1].node.elements.length||!decl.isVariableDeclarator()||decl.parentPath.node.kind!=='const'||!decl.get('id').isArrayPattern()||decl.node.id.elements.length!==2||!decl.node.id.elements.every(n=>t.isIdentifier(n)))fail('Ordinary fresh-list reducer binding required',call,owner.ctx);
  const reducer=functionOf(args[0].scope.getBinding(args[0].node.name),owner.ctx);reducerFn=reducer.fn;if(reducerFn.node.params.length!==2||!reducerFn.node.params.every(n=>t.isIdentifier(n)))fail('Two ordinary reducer parameters required',reducerFn,reducer.ctx);
  compiler={root:{file:owner.ctx.file,binding:owner.fn.node.id?.name||owner.binding.identifier.name,input:decl.node.id.elements[0].name},reducer:{file:reducer.ctx.file,binding:reducerFn.node.id?.name||reducer.binding.identifier.name,field}};
  const recipe=instrumentReducerFieldWrites(reducer.ctx.text,reducer.ctx.file,{binding:reducer.binding.identifier.name,field,observerName:'__stateatomAdmissionOnly',capture:'invocation'});if(recipe.status!=='Code-linked writer sites')fail('Selected field-creation source recipe unavailable',reducerFn,reducer.ctx);
  enqueue(owner.fn.scope.getBinding(decl.node.id.elements[0].name),'collection',owner.ctx);enqueue(reducerFn.scope.getBinding(reducerFn.node.params[0].name),'collection',reducer.ctx);
  // First discover the receiver/callback/prop graph; then account for each fresh
  // selected producer object before it reaches state, including pre-state escapes.
  function drain(){while(queue.length){const job=queue.shift();tick(job.binding.path,job.ctx);for(const ref of job.binding.referencePaths)consume(ref,job.kind,job.ctx);}}
  drain();const positions=new Set(recipe.sites.map(s=>s.objectStart));reducerFn.traverse({ObjectExpression(p){if(positions.has(p.node.start))consume(p,'row',reducer.ctx);}});drain();
  // Resolve incoming concat objects after fresh producer seeds and aliases have
  // been traversed. An unused valid producer site cannot admit an opaque input.
  for(const [node,site]of nativeSites)if(site.method==='concat'){
   const argument=node.arguments[0];let admitted=consumed.get(argument)?.has('row')===true;
   if(t.isIdentifier(argument))for(const [binding,kind]of kinds)if(kind==='row'&&binding.referencePaths.some(p=>p.node===argument)){admitted=true;break;}
   if(!admitted)fail('Untracked incoming concat row');
  }
  // These implicit/dynamic lexical aliases are outside the finite checker. Reject
  // them in every participating module, including nested arrows and bridge files.
  for(const file of used){const ctx=modules.get(file);traverse(ctx.ast,{Identifier(p){
   if(p.node.name==='arguments')fail('Implicit arguments alias unsupported',p,ctx);
   if(p.node.name==='eval'&&!p.scope.getBinding('eval'))fail('Dynamic eval scope unsupported',p,ctx);
  }});}
  // Compiler coordinates, not execution or a runtime ownership certificate.
  for(const file of used){const ctx=modules.get(file);traverse(ctx.ast,{enter(p){
   let shape=null;const native=nativeSites.get(p.node);
   if(native)shape={kind:'array-call',...native};
   else if(p.isObjectExpression()&&consumed.get(p.node)?.has('row'))shape={kind:'row-literal'};
   else if(p.isArrayExpression()&&!p.node.elements.length&&(p.node===args[1].node||p.getFunctionParent()===reducerFn))shape={kind:'empty-array'};
   if(shape)dataSites.push({...location(p,ctx,shape.kind),...shape,start:p.node.start,end:p.node.end,id:hash(ctx.digest+':'+p.node.start+':'+p.node.end+':'+shape.kind)});
  }});}
  return result(true);
 }catch(error){if(!unsupported.length)unsupported.push({reason:'Source parse or bounded admission unavailable'});return result(false);}
}
