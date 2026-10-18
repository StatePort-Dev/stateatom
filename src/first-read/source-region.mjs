// SPDX-License-Identifier: Apache-2.0
// Code-linked marker for the finite original App region only. An occurrence does
// not certify effects; earlier uncommitted regions and later renders must refuse.
import {createHash} from 'node:crypto';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generatorModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
export const originalAppDigest='3fd03e72156b4c2deab0996d68b52f45740b3eb0660b0bf9c4c4f2ee39baaefd';
export function instrumentReadRegion(source,file,code){
 if(!file.endsWith("tests/fixtures/inspection/react/App.tsx")||createHash('sha256').update(source).digest('hex')!==originalAppDigest)return{status:'Unknown/Unsupported',reason:'Outside reviewed original App source',code,count:0};
 const ast=parse(code,{sourceType:'module',plugins:['typescript','jsx']}),alias='__safrRegionTap';let count=0;
 traverse(ast,{VariableDeclarator(p){if(!t.isObjectPattern(p.node.id))return;const init=p.node.init;
  if(!t.isCallExpression(init)||!t.isMemberExpression(init.callee)||!t.isIdentifier(init.callee.object,{name:'__sa'})||!t.isIdentifier(init.callee.property,{name:'capture'})||!t.isObjectExpression(init.arguments[0]))return;
  const props=init.arguments[0].properties,kind=props.find(n=>t.isObjectProperty(n)&&t.isIdentifier(n.key,{name:'kind'}))?.value;
  if(!t.isStringLiteral(kind,{value:'destructure-root'})||p.getFunctionParent()?.node.id?.name!=='App'||!t.isIdentifier(init.arguments[1]))return;
  const body=p.node.id.properties;if(body.length!==1||!t.isObjectProperty(body[0])||!t.isIdentifier(body[0].key,{name:'rules'})||!t.isObjectPattern(body[0].value)||body[0].value.properties.length!==1)return;
  const leaf=body[0].value.properties[0];if(!t.isObjectProperty(leaf)||!t.isIdentifier(leaf.key,{name:'quota'})||!t.isIdentifier(leaf.value,{name:'allowance'}))return;
  p.parentPath.insertBefore(t.expressionStatement(t.callExpression(t.identifier(alias),[t.stringLiteral('read-region'),t.identifier('data'),t.cloneNode(init.arguments[1]),t.stringLiteral(file),t.stringLiteral(originalAppDigest)])));count++;p.skip();
 }});
 if(count!==1)throw Error('Reviewed original App read region changed');
 if(ast.program.body.some(n=>t.isImportDeclaration(n)&&n.specifiers.some(s=>s.local.name===alias)))throw Error('Reserved read region binding collision');
 ast.program.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier(alias),t.identifier('firstQueryTap'))],t.stringLiteral('/@stateatom/first-read-query')));
 return{status:'Code-linked',code:generate(ast,{retainLines:true,comments:true}).code,count,sourceDigest:originalAppDigest,fullPath:false};
}
