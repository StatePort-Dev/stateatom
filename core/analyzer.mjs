import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import generatorModule from '@babel/generator';
import {createHash} from 'node:crypto';
import {baseParse} from '@vue/compiler-dom';
import {flatten,edge} from './evidence.mjs';
const traverse=traverseModule.default||traverseModule,generate=generatorModule.default||generatorModule;
export const digest=s=>createHash('sha256').update(s).digest('hex');
const parseJS=s=>parse(s,{sourceType:'unambiguous',errorRecovery:true,plugins:['jsx','typescript','decorators-legacy']});
function details(expressions,ast,text,sourceScope){
 const members=new Set(),names=new Set(),definitions=[];
 for(const expression of expressions){try {const a=parseJS('('+expression+')');traverse(a,{MemberExpression(p){const s=generate(p.node).code.replaceAll('?.','.');if(/^[\w$.]+$/.test(s))members.add(s);},Identifier(p){if(!p.parentPath.isMemberExpression()||p.key==='object')names.add(p.node.name);}});}catch{}}
 if(ast&&!sourceScope)traverse(ast,{Program(p){sourceScope=p.scope;p.stop();}});
 for(const name of names){const binding=sourceScope?.getBinding(name);if(!binding)continue;const p=binding.path;let expression=null;
  if(p.isVariableDeclarator())expression=p.node.init?generate(p.node.init).code.slice(0,300):null;
  else if(p.isFunctionDeclaration())expression='function';else expression=binding.kind==='param'?'function parameter':binding.kind;
  definitions.push({name,line:binding.identifier.loc.start.line,column:binding.identifier.loc.start.column+1,expression,method:'AST lexical binding; runtime value unavailable'});
 }
 return {members:[...members],names:[...names],definitions};
}
function extract(file,text,selection){
 const found=[];let ast;
 try {ast=parseJS(text);}catch{}
 if(ast&&!file.endsWith('.vue'))traverse(ast,{
 JSXElement(p){const n=p.node,attrs=n.openingElement.attributes;const id=attrs.find(a=>a.name?.name==='id')?.value?.value;
  const marker=selection.marker?.split(':');
  const cls=attrs.find(a=>a.name?.name==='className')?.value?.value;const classMatch=typeof cls==='string'&&selection.classes?.some(c=>cls.split(/\s+/).includes(c));const ownerPath=p.findParent(x=>x.isFunctionDeclaration()||x.isVariableDeclarator());const ownerMatch=selection.owners?.includes(ownerPath?.node.id?.name);if(!(selection.id&&id===selection.id)&&!(!selection.id&&marker&&Number(marker[1])===n.loc.start.line&&n.openingElement.name.name===selection.tag)&&!(!selection.id&&n.openingElement.name.name===selection.tag&&(classMatch||ownerMatch)))return;
  const expressions=[];p.traverse({JSXExpressionContainer(q){if(q.node.expression.type!=='JSXEmptyExpression')expressions.push(generate(q.node.expression).code);}});
  const owner=p.findParent(x=>x.isFunctionDeclaration()||x.isVariableDeclarator());
  found.push({file,line:n.loc.start.line,column:n.loc.start.column+1,endLine:n.loc.end.line,endColumn:n.loc.end.column+1,expressions,owner:owner?.node.id?.name,method:'AST JSX literal identity',...details(expressions,ast,text,p.scope)});
 },
 AssignmentExpression(p){const left=p.node.left;if(left.type!=='MemberExpression'||!['textContent','innerText','innerHTML'].includes(left.property.name))return;
  const call=left.object;if(call.type!=='CallExpression'||!['querySelector','getElementById'].includes(call.callee.property?.name))return;
  const literal=call.arguments[0]?.value;if(!selection.id||![selection.id,'#'+selection.id].includes(literal))return;
  const expressions=[generate(p.node.right).code];found.push({file,line:p.node.loc.start.line,column:p.node.loc.start.column+1,endLine:p.node.loc.end.line,endColumn:p.node.loc.end.column+1,expressions,method:'AST literal DOM assignment',...details(expressions,ast,text,p.scope)});
 }
 });
 if(file.endsWith('.vue')){
  const script=text.match(/<script[^>]*>([\s\S]*?)<\/script>/);let scriptAst;try{scriptAst=parseJS(script?.[1]||'');}catch{}
  const template=text.match(/<template[^>]*>([\s\S]*)<\/template>/);
  if(template){
   const templateStart=text.indexOf(template[1],template.index),lineOffset=text.slice(0,templateStart).split('\n').length-1;
   const columnOffset=templateStart-text.lastIndexOf('\n',templateStart-1)-1,vueFound=[];
   let tree;try{tree=baseParse(template[1]);}catch{}
   const walk=node=>{if(node.type===1){
    const attrs=Object.fromEntries(node.props.filter(p=>p.type===6).map(p=>[p.name,p.value?.content||'']));
    const classes=(attrs.class||'').split(/\s+/);const classMatch=selection.classes?.some(c=>classes.includes(c));
    const metadataFile=selection.runtime?.vue?.file;const fileMatch=metadataFile&&(metadataFile.endsWith('/'+file.split('/').at(-1))||metadataFile===file);
    const marker=selection.marker?.split(':');
    const markerMatch=marker&&Number(marker[1])===lineOffset+node.loc.start.line&&node.tag===selection.tag;
    if(marker?markerMatch:(selection.id&&attrs.id===selection.id)||(!selection.id&&node.tag===selection.tag&&(classMatch||fileMatch))){
     const expressions=[];const collect=n=>{if(n.type===5)expressions.push(n.content.content);if(n.type===1)for(const p of n.props)if(p.type===7&&p.exp&&p.name!=='on')expressions.push(p.exp.content);for(const c of n.children||[])collect(c);};collect(node);
     const d=details(expressions,scriptAst,text);const scriptOffset=script?text.slice(0,script.index+script[0].indexOf(script[1])).split('\n').length-1:0;d.definitions.forEach(x=>x.line+=scriptOffset);
     vueFound.push({attrs,source:{file,line:lineOffset+node.loc.start.line,column:node.loc.start.column+(node.loc.start.line===1?columnOffset:0),endLine:lineOffset+node.loc.end.line,endColumn:node.loc.end.column+(node.loc.end.line===1?columnOffset:0),expressions,method:marker?'SFC digest-bound marker line/tag / interpolation AST':'SFC literal identity / interpolation AST',...d}});
    }
   }for(const c of node.children||[])walk(c);};if(tree)walk(tree);
   let matches=vueFound;
   if(selection.marker&&matches.length>1){
    if(selection.id)matches=matches.filter(m=>m.attrs.id===selection.id);
    else if(selection.classes?.length){const narrowed=matches.filter(m=>(m.attrs.class||'').split(/\s+/).some(c=>selection.classes.includes(c)));if(narrowed.length)matches=narrowed;}
    if(matches.length!==1)matches=[];
   }
   found.push(...matches.map(m=>m.source));
  }
 }
 return found;
}
export function analyzeSources(files,selection,requests,identity){
 const sources=[];if(!selection.unbound)for(const f of files){
  if(selection.marker){const [mf,,hash]=selection.marker.split(':');if(mf!==f.file||digest(f.text).slice(0,12)!==hash)continue;}
  for(const s of extract(f.file,f.text,selection))sources.push({...s,sourceDigest:digest(f.text),sourceFreshness:f.freshness||identity.freshness,runtimeValue:null});
 }
 const fields=[];
 for(const r of requests)for(const field of flatten(r.json)){
  const staticMatches=sources.filter(s=>s.members.some(m=>m.endsWith('.'+field.path)||m===field.path)||s.names.includes(field.path.split('.').at(-1)));
  const valueMatch=typeof field.value==='string'&&field.value.length>1&&selection.text?.includes(field.value);
  if(staticMatches.length||valueMatch)fields.push({requestId:r.id,url:r.url,...field,status:'Candidate',method:staticMatches.length?'AST member suffix / identifier candidate':'value equality only',sourceFiles:staticMatches.map(s=>s.file)});
 }
 const graph={identity,nodes:[{...selection,id:'ui',elementId:selection.id},...requests.map(r=>({id:'request:'+r.id,url:r.url,kind:'request'}))],edges:[]};
 for(const [i,s]of sources.entries()){graph.nodes.push({id:'source:'+i,...s});graph.edges.push(edge('ui','source:'+i,'render-location','Code-linked',s.method,['source:'+s.sourceDigest],{...identity,freshness:s.sourceFreshness}));}
 for(const [i,f]of fields.entries()){graph.nodes.push({id:'field:'+i,...f});graph.edges.push(edge('ui','field:'+i,'possible-data-dependency','Candidate',f.method,['request:'+f.requestId],identity));}
 return {sources,fields,graph,limitations:['Static bindings are code-linked, not proof of runtime consumption.','Private framework metadata is version-sensitive.','No general alias, closure, event or store taint analysis.']};
}

function normalizedBody(text){
 try{const ast=parseJS(text);traverse(ast,{ImportDeclaration(p){p.node.source.value='__RESOLVED_MODULE_URL__';}});return generate(ast,{compact:true,comments:false}).code;}catch{return null;}
}
export function sourceBinding(text,samples){
 if(samples.some(s=>s.trim()===text.trim()))return 'source bytes / source-map sourcesContent equality';
 const body=normalizedBody(text);if(body&&samples.some(s=>normalizedBody(s)===body))return 'AST body equality (import URLs normalized)';return null;
}
