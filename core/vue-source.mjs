// SPDX-License-Identifier: Apache-2.0
// Compiler-backed source descriptors only: no application code is evaluated.
import {parse as parseSFC} from '@vue/compiler-sfc';
import {baseParse} from '@vue/compiler-dom';
import {parse} from '@babel/parser';

export function vueSourceUnit(file,text){
 let descriptor,tree,ast;
 try{
  const parsed=parseSFC(text,{filename:file});if(parsed.errors.length)return null;
  descriptor=parsed.descriptor;
  if(!descriptor.template||descriptor.template.src||descriptor.template.lang||descriptor.script||descriptor.scriptSetup?.src||!['js','ts',undefined].includes(descriptor.scriptSetup?.lang))return null;
  const script=descriptor.scriptSetup;
  ast=parse(script?text.slice(0,script.loc.start.offset).replace(/[^\n]/g,' ')+script.content:'',{sourceType:'module',plugins:['typescript']});
  tree=baseParse(descriptor.template.content);
 }catch{return null;}
 const start=descriptor.template.loc.start.offset,targets=[];
 const position=offset=>{const head=text.slice(0,offset);return {line:head.split('\n').length,column:offset-head.lastIndexOf('\n')};};
 function expression(exp){
  if(!exp)return null;const offset=start+exp.loc.start.offset;
  try{const parsed=parse(text.slice(0,offset).replace(/[^\n]/g,' ')+exp.content,{sourceType:'module',plugins:['typescript']});if(parsed.program.body.length!==1||parsed.program.body[0].type!=='ExpressionStatement')return null;const statement=parsed.program.body[0];ast.program.body.push(statement);return statement.expression;}catch{return null;}
 }
 function walk(node,outerBoundary){
  if(node.type!==1){for(const c of node.children||[])walk(c,outerBoundary);return;}
  const at=position(start+node.loc.start.offset),end=position(start+node.loc.end.offset);
  const scopeBoundary=outerBoundary||node.props.some(p=>p.type===7&&['for','slot'].includes(p.name));
  const override=node.props.some(p=>p.type===7&&(p.name==='on'&&!p.arg||p.name==='bind'&&(!p.arg||!p.arg.isStatic||/^on[A-Z]/.test(p.arg.content))));
  const expressions=[],events=[];
  for(const p of node.props){if(p.type!==7||!p.exp)continue;const parsed=expression(p.exp);
   if(p.name==='on'&&p.arg)events.push({event:p.arg?.isStatic?p.arg.content:'unknown',capture:false,expression:parsed,raw:p.exp.content,boundary:scopeBoundary?'Vue loop/slot lexical scope boundary':override?'Vue event-object/dynamic binding override boundary':!p.arg?.isStatic?'Vue dynamic event argument boundary':p.modifiers.length?'Vue event modifier wrapper boundary':!parsed?'Unsupported Vue event statement/expression':null});
   else expressions.push(p.exp.content);
  }
  const collect=n=>{if(n.type===5)expressions.push(n.content.content);for(const c of n.children||[])collect(c);};collect(node);
  targets.push({tag:node.tag,...at,endLine:end.line,endColumn:end.column,node,expressions,events});
  for(const child of node.children||[])walk(child,scopeBoundary);
 }
 walk(tree,false);return {descriptor,tree,ast,targets};
}
