// SPDX-License-Identifier: Apache-2.0
// Compiler proof of a fresh own-data literal, never arbitrary props introspection.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import * as t from '@babel/types';
import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
const hash=s=>createHash('sha256').update(s).digest('hex');
const helper=`const __saJSXCfgOwn=Object.getOwnPropertyDescriptor;
const __saJSXCfgGlobal=__saJSXCfgOwn(globalThis,'__STATEATOM_REACT19_JSX_INPUT__');
const __saJSXCfgTap=__saJSXCfgGlobal&&__saJSXCfgOwn(__saJSXCfgGlobal,'value')?.value;
function __saJSXCfgInput(config,site){try{if(typeof __saJSXCfgTap==='function'){const d=__saJSXCfgOwn(config,'todo'),v=d&&__saJSXCfgOwn(d,'value');if(v){const input=v.value;if(input!==null&&(typeof input==='object'||typeof input==='function'))__saJSXCfgTap('config-input',input,config,site);}}}catch{}return config;}`;
export function instrumentJSXConfigInputs(source,file,{enabled=false}={}){
 const sourceDigest=hash(source),empty={code:source,sites:[],unsupported:[],sourceDigest,skipped:false,sourceOnly:true,nativeRuntimeProven:false};
 if(!enabled)return empty;
 const refuse=reason=>({...empty,skipped:true,unsupported:[{file,reason}]});
 if(typeof file!=='string'||!file||file.length>1024||Buffer.byteLength(source)>1024*1024)return refuse('Bounded source file/grammar required');
 let ast;try{ast=parse(source,{sourceType:'module',plugins:['jsx']});}catch{return refuse('Compiled module grammar not admitted');}
 let collision=false,dynamic=false,ambient=false;traverse(ast,{Program(p){ambient=!!(p.scope.getOwnBinding('Object')||p.scope.getOwnBinding('globalThis'));},Identifier(p){if(p.node.name.startsWith('__saJSXCfg'))collision=true;},WithStatement(){dynamic=true;},CallExpression(p){if(t.isIdentifier(p.node.callee,{name:'eval'}))dynamic=true;}});
 if(ambient)return refuse('Module ambient Object/globalThis binding shadows JSX helper dependencies');
 if(collision||dynamic)return refuse(collision?'Private JSX helper binding collision':'Dynamic source scope unsupported');
 const records=[],unsupported=[];
 function inspect(p){
  if(!t.isIdentifier(p.node.callee))return;const binding=p.scope.getBinding(p.node.callee.name),s=binding?.path;
  if(!s?.isImportSpecifier()||s.parentPath.node.source.value!=='react/jsx-runtime')return;
  const imported=t.isIdentifier(s.node.imported)?s.node.imported.name:s.node.imported.value;if(imported!=='jsx'&&imported!=='jsxs')return;
  const n=p.node,config=n.arguments[1];let reason=null;
  if(p.isOptionalCallExpression()||n.optional||n.arguments.some(a=>t.isSpreadElement(a))||n.arguments.length<2||n.arguments.length>3)reason='Direct fixed JSX invocation required';
  else if(!t.isObjectExpression(config))reason='Inline fresh own-data config required; aliases unsupported';
  else{
   let todo=0,unsafe=false,unknownKey=false,reserved=false;
   for(const prop of config.properties){
    if(!t.isObjectProperty(prop)||prop.computed||prop.method){unsafe=true;continue;}
    const key=t.isIdentifier(prop.key)?prop.key.name:t.isStringLiteral(prop.key)?prop.key.value:null;
    if(key===null){unknownKey=true;continue;}if(key==='todo')todo++;
    if(['__proto__','key','ref','children'].includes(key))reserved=true;
   }
   // Fixed non-todo configs are untouched; unknown keys may conceal an override.
   if(todo===0&&!unsafe&&!unknownKey)return;
   if(unsafe||unknownKey)reason='Spread/accessor/method/computed config unsupported';
   else if(todo!==1)reason='One unique own-data todo input required';
   else if(reserved)reason='Reserved key/ref/children/proto config unsupported';
  }
  if(reason){unsupported.push({file,line:n.loc.start.line,column:n.loc.start.column+1,reason});return;}
  records.push({path:p,site:{id:hash(file+'\0'+sourceDigest+'\0'+n.start+':'+n.end),file,sourceDigest,line:n.loc.start.line,column:n.loc.start.column+1,endLine:n.loc.end.line,endColumn:n.loc.end.column+1}});
 }
 traverse(ast,{CallExpression:inspect,OptionalCallExpression:inspect});
 if(unsupported.length)return{...empty,skipped:true,unsupported};
 if(!records.length)return empty;if(records.length>256)return refuse('JSX source site capacity exceeded');
 for(const r of records)r.path.node.arguments[1]=t.callExpression(t.identifier('__saJSXCfgInput'),[r.path.node.arguments[1],t.valueToNode(r.site)]);
 ast.program.body.unshift(...parse(helper,{sourceType:'module'}).program.body);
 return{...empty,code:generate(ast,{comments:true},source).code,sites:records.map(r=>r.site),recipe:'source-fresh-jsx-config-input/1'};
}
