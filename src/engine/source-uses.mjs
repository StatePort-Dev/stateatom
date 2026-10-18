// SPDX-License-Identifier: Apache-2.0
// All-reference source prerequisite only. No runtime/readonly/ownership certificate.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import {createHash} from 'node:crypto';
import {sourceSlice} from './slice.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const pointer=(base,key)=>base+'/'+key.replaceAll('~','~0').replaceAll('/','~1');
export function sourceUses(files,{file,binding:entry,line,budget=160,maxDepth=12,maxBytes=256000,maxFiles=160,maxProjectBytes=2000000}={}){
 const records=[],bindings=[],boundaries=[],gaps=[],queue=[],visited=new Set();let complete=true,steps=0;
 const result=()=>({status:records.length||bindings.length?'Code-linked':'Unknown/Unsupported',complete,records,bindings,boundaries,gaps,fullPath:false,ownership:'Unknown/Unsupported',claim:'Syntactic references and possible aliases only; no native handoff, getter safety, readonly effect or complete region lifetime proof',limits:{budget,maxDepth,maxBytes,maxFiles,maxProjectBytes}});
 if(!Array.isArray(files)||files.length>maxFiles||![budget,maxDepth,maxBytes,maxFiles,maxProjectBytes].every(n=>Number.isSafeInteger(n)&&n>=0)){complete=false;gaps.push('Invalid or exceeded input limits');return result();}
 const names=new Set();let totalBytes=0;for(const f of files){if(!f||typeof f.file!=='string'||!f.file||f.file.length>4096||names.has(f.file)||typeof f.text!=='string'){complete=false;gaps.push('Invalid or ambiguous source entry');return result();}names.add(f.file);const size=Buffer.byteLength(f.text);totalBytes+=size;if(size>maxBytes||totalBytes>maxProjectBytes){complete=false;gaps.push('Project source byte budget exceeded');return result();}}
 const source=files.filter(f=>f.file===file);if(source.length!==1){complete=false;gaps.push('Missing or competing source file');return result();}
 if(typeof source[0].text!=='string'||Buffer.byteLength(source[0].text)>maxBytes){complete=false;gaps.push('Source byte budget exceeded');return result();}
 const text=source[0].text,digest=createHash('sha256').update(text).digest('hex');let ast;try{ast=parse(text,{sourceType:'unambiguous',plugins:['typescript','jsx']});}catch{complete=false;gaps.push('Source parse failed');return result();}
 const location=p=>({file,sourceDigest:digest,line:p.node.loc?.start.line,column:(p.node.loc?.start.column??0)+1,endLine:p.node.loc?.end.line,endColumn:(p.node.loc?.end.column??0)+1,expression:generate(p.node).code.slice(0,600)});
 const record=(kind,p,path,extra={})=>{const r={kind,pointer:path,...location(p),...extra};records.push(r);return r;};
 const boundary=(p,path,reason)=>{complete=false;boundaries.push({pointer:path,reason,...location(p)});};
 const enqueue=(b,path,depth,reason)=>{if(!b){complete=false;gaps.push('Alias binding unavailable');return;}if(depth>maxDepth){complete=false;gaps.push('Alias depth budget exceeded');return;}const id=b.identifier.start+':'+path;if(visited.has(id))return;visited.add(id);queue.push({b,path,depth});bindings.push({name:b.identifier.name,pointer:path,reason,...location({node:b.identifier})});};
 const candidates=[];try{traverse(ast,{BindingIdentifier(p){if(p.node.name===entry&&(!line||p.node.loc.start.line===line)){const b=p.scope.getBinding(entry);if(b&&!candidates.includes(b))candidates.push(b);}}});}catch{complete=false;gaps.push('Source traversal unavailable');return result();}
 if(candidates.length!==1){complete=false;gaps.push('Missing or ambiguous exact entry binding');return result();}enqueue(candidates[0],'',0,'entry lexical binding');
 function aliases(pattern,path,scope,depth){
  if(pattern.type==='Identifier'){enqueue(scope.getBinding(pattern.name),path,depth,'ordinary/destructured alias');return;}
  if(pattern.type==='ObjectPattern'){for(const prop of pattern.properties){if(prop.type!=='ObjectProperty'||prop.computed){complete=false;gaps.push('Computed/rest destructuring unsupported');continue;}const key=prop.key.name??prop.key.value;if(typeof key!=='string'){complete=false;gaps.push('Destructuring key unsupported');continue;}aliases(prop.value,pointer(path,key),scope,depth);}return;}
  complete=false;gaps.push('Alias pattern/default/array unsupported');
 }
 function stateValue(callee){
  if(!callee.isIdentifier())return null;const setter=callee.scope.getBinding(callee.node.name),d=setter?.path;if(!d?.isVariableDeclarator()||d.node.id.type!=='ArrayPattern'||d.node.id.elements.length!==2||d.node.id.elements[1]!==setter.identifier||d.node.id.elements[0]?.type!=='Identifier')return null;
  const call=d.get('init');if(!call.isCallExpression())return null;const fn=call.get('callee');let imported=false;
  if(fn.isIdentifier()){const imp=fn.scope.getBinding(fn.node.name)?.path;imported=imp?.isImportSpecifier()&&imp.parent.source.value==='react'&&(imp.node.imported.name||imp.node.imported.value)==='useState';}
  if(fn.isMemberExpression()&&!fn.node.computed&&fn.node.property.name==='useState'&&fn.get('object').isIdentifier()){const imp=fn.scope.getBinding(fn.node.object.name)?.path;imported=(imp?.isImportDefaultSpecifier()||imp?.isImportNamespaceSpecifier())&&imp.parent.source.value==='react';}
  return imported?d.scope.getBinding(d.node.id.elements[0].name):null;
 }
 try{while(queue.length){const{b,path,depth}=queue.shift();if(!b.constant){complete=false;for(const p of b.constantViolations){if(++steps>budget){complete=false;gaps.push('Reassignment budget exceeded');queue.length=0;break;}boundary(p,path,'Binding reassignment invalidates local ownership candidate');}}
  for(const ref of b.referencePaths){if(++steps>budget){complete=false;gaps.push('Reference budget exceeded');queue.length=0;break;}
   let p=ref,current=path,unsupported=false,pathDepth=0;
   while(p.parentPath?.isMemberExpression()&&p.key==='object'){
    if(++pathDepth>maxDepth||++steps>budget){complete=false;gaps.push('Member traversal budget exceeded');unsupported=true;break;}p=p.parentPath;if(p.node.computed||p.node.optional){record('unsupported-member',p,current);boundary(p,current,'Computed/optional property path not followed');unsupported=true;break;}current=pointer(current,p.node.property.name);record('property-reference',p,current);
   }
   if(unsupported)continue;const parent=p.parentPath;
   if(parent?.isAssignmentExpression()&&p.key==='left'||parent?.isUpdateExpression()||parent?.isUnaryExpression({operator:'delete'})){record('write',parent,current);boundary(parent,current,'Property operation or binding write');continue;}
   if(parent?.isVariableDeclarator()&&p.key==='init'){
    if(parent.parentPath.node.kind!=='const'){boundary(parent,current,'Mutable alias binding unsupported');continue;}aliases(parent.node.id,current,parent.scope,depth+1);record('alias',parent,current);continue;
   }
   if(parent?.isCallExpression()||parent?.isNewExpression()){
    record('call-boundary',parent,current);const callee=parent.get('callee'),value=parent.isCallExpression()&&parent.node.arguments.length===1&&parent.node.arguments[0]===p.node?stateValue(callee):null;
    if(value){record('state-candidate',parent,current,{binding:value.identifier.name});enqueue(value,current,depth+1,'possible state alias; requires native runtime correspondence');boundary(parent,current,'State alias requires exact native runtime handoff; static names are insufficient');}
    else{const imported=callee.isIdentifier()&&callee.scope.getBinding(callee.node.name)?.path.isImportSpecifier();if(imported){const links=sourceSlice(files,{file,line:parent.node.loc.start.line,expressions:[generate(callee.node).code]});records.at(-1).possibleSourceLinks=links.nodes;}
     boundary(parent,current,'Opaque call/receiver escape; transitive readonly/lifetime effects unproved');}
    continue;
   }
   if(parent?.isReturnStatement()||parent?.isYieldExpression()||parent?.isAwaitExpression()||parent?.isJSXExpressionContainer()||parent?.isExportSpecifier()||parent?.isAssignmentExpression()||parent?.isObjectProperty()||parent?.isArrayExpression()){
    record('escape',parent,current);boundary(parent,current,'Return/props/container/assignment escape not followed');continue;
   }
   if(parent?.isLogicalExpression()||parent?.isConditionalExpression()&&p.key!=='test'){record('unsupported-forwarding',parent,current);boundary(parent,current,'Logical/conditional value forwarding not followed');}
   else if(parent?.isBinaryExpression()||parent?.isUnaryExpression()||parent?.isConditionalExpression()&&p.key==='test'||parent?.isIfStatement())record('local-use',parent,current,{premise:'Syntactic use only; primitive/getter/intrinsic/runtime behavior unproved'});
   else{record('unsupported-use',parent||p,current);boundary(parent||p,current,'Unsupported use context');}
  }
 }
 }catch{complete=false;gaps.push('Use traversal unavailable or unsupported');}
 return result();
}
