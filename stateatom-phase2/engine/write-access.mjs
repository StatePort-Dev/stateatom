// SPDX-License-Identifier: Apache-2.0
// Exact lvalue positions only; receiver/key/default expressions remain reads.
export function isWriteTarget(path){
 let current=path;
 for(let depth=0;current?.parentPath&&depth<256;depth++){
  const parent=current.parentPath,key=current.key;
  if(parent.isTSAsExpression()||parent.isTSTypeAssertion()||parent.isTSNonNullExpression()||parent.isTSSatisfiesExpression()||parent.isParenthesizedExpression()){if(key!=='expression')return false;current=parent;continue;}
  if(parent.isAssignmentExpression())return key==='left';
  if(parent.isUpdateExpression())return key==='argument';
  if(parent.isUnaryExpression({operator:'delete'}))return key==='argument';
  if(parent.isForInStatement()||parent.isForOfStatement())return key==='left';
  if(parent.isAssignmentPattern()){if(key!=='left')return false;current=parent;continue;}
  if(parent.isRestElement()){if(key!=='argument')return false;current=parent;continue;}
  if(parent.isObjectProperty()){if(key!=='value'||!parent.parentPath.isObjectPattern())return false;current=parent;continue;}
  if(parent.isArrayPattern()||parent.isObjectPattern()){current=parent;continue;}
  return false;
 }
 // A deeply nested target must not be rewritten as a read on budget exhaustion.
 return !!current?.parentPath;
}

import traverseModule from '@babel/traverse';import * as t from '@babel/types';
import {parse} from '@babel/parser';import generatorModule from '@babel/generator';import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule;
export function guardPropertyWriteReceivers(ast,{source,meta,guard,maxSites=2048,maxSourceBytes=2*1024*1024}={}){
 const exclusions=[];let sites=0,excluded=0,budgetLost=false;
 const scope='Eligible source property-write receiver accesses only; not completed writes, native/opaque effects, implicit class fields or complete writer history';
 const exclude=(path,reason)=>{excluded++;if(exclusions.length<128)exclusions.push({...meta(path.node,'unsupported'),reason});};
 if(!Number.isSafeInteger(maxSites)||maxSites<0||maxSites>8192||!Number.isSafeInteger(maxSourceBytes)||maxSourceBytes<0||maxSourceBytes>8*1024*1024||Buffer.byteLength(source)>maxSourceBytes)return{status:'Unknown/Unsupported',sites:0,excluded:0,budgetLost:true,exclusions:[],completeWriterCoverage:false,scope};
 function optionalReceiver(path){let count=0,found=path.isOptionalMemberExpression()||path.isOptionalCallExpression(),lost=false;if(!found)path.traverse({enter(p){if(++count>256){lost=true;p.stop();return;}if(p.isOptionalMemberExpression()||p.isOptionalCallExpression()){found=true;p.stop();}}});return{found,lost};}
 traverse(ast,{
  ClassProperty(p){if(p.node.loc)exclude(p,'Implicit class-field definition is not guarded; explicit member writes in its initializer are separate');},
  ClassPrivateProperty(p){if(p.node.loc)exclude(p,'Implicit private-field definition is not a guarded public-field write');},
  OptionalMemberExpression:{exit(p){if(isWriteTarget(p)&&p.node.loc)exclude(p,'Optional-chain write access excluded to preserve short-circuit propagation');}},
  MemberExpression:{exit(p){if(!p.node.loc||!isWriteTarget(p))return;if(t.isSuper(p.node.object)){exclude(p,'Super write access excluded: implicit receiver/key ordering not established');return;}
   const optional=optionalReceiver(p.get('object'));if(optional.found||optional.lost){if(optional.lost)budgetLost=true;exclude(p,optional.lost?'Receiver traversal budget; property access left unchanged':'Receiver containing optional chain excluded conservatively');return;}
   if(sites>=maxSites){budgetLost=true;exclude(p,'Property-write receiver guard site budget exceeded; access left unchanged');return;}
   const m=meta(p.node,'potential-property-write',{privateAccess:t.isPrivateName(p.node.property),form:p.node.computed?'computed-member':'member'});p.node.object=guard(m,p.node.object);sites++;
  }}
 });
 return{status:budgetLost?'Unknown/Unsupported':excluded?'Partial':'Observed eligible property targets',sites,excluded,budgetLost,exclusions,completeWriterCoverage:false,scope};
}

// Compiler-only staging. No application code is executed to build this metadata.
export function guardPrivateInput(inputSource,{family,basename,helperName,helperSource,preamble='',sourceType='module',hoistMetadata=false,scope}={}){
 const inputDigest=createHash('sha256').update(inputSource).digest('hex'),inputFile='__stateatom_private__/'+family+'/'+inputDigest+'/'+basename,input=parse(inputSource,{sourceType}),rows=[];
 const fileName=helperName+'File',digestName=helperName+'Digest',tableName=helperName+'Metadata';
 const contract=guardPropertyWriteReceivers(input,{source:inputSource,meta:(node,kind,extra={})=>({file:inputFile,sourceDigest:inputDigest,line:node.loc?.start.line,column:node.loc?.start.column+1,endLine:node.loc?.end.line,endColumn:node.loc?.end.column+1,key:String(node.start),expression:inputSource.slice(node.start,node.end).slice(0,400),kind,privateInput:true,...extra}),guard:(meta,receiver)=>{
  let record=t.valueToNode(meta);if(hoistMetadata){for(const p of record.properties)if(p.key.name==='file'||p.key.name==='sourceDigest')p.value=t.identifier(p.key.name==='file'?fileName:digestName);const index=rows.length;rows.push(record);record=t.memberExpression(t.identifier(tableName),t.numericLiteral(index),true);}
  return t.callExpression(t.identifier(helperName),[record,receiver]);
 }});
 // Captures and the private metadata table precede any original CJS initializer.
 const prefix=parse(preamble,{sourceType}).program.body;
 if(hoistMetadata)prefix.push(t.variableDeclaration('const',[t.variableDeclarator(t.identifier(fileName),t.stringLiteral(inputFile)),t.variableDeclarator(t.identifier(digestName),t.stringLiteral(inputDigest)),t.variableDeclarator(t.identifier(tableName),t.arrayExpression(rows))]));
 input.program.body.unshift(...prefix);input.program.body.push(...parse(helperSource,{sourceType}).program.body);
 const generate=generatorModule.default||generatorModule,code=generate(input,{comments:true},inputSource).code;
 return {code,writeAccess:{...contract,inputFile,inputDigest,inputSource,inputBytes:Buffer.byteLength(inputSource),scope}};
}
