// SPDX-License-Identifier: Apache-2.0
// Conditional syntax only. Never executes a function or verifies runtime premises.
import {parse} from '@babel/parser';
import traverseModule from '@babel/traverse';
import {createHash} from 'node:crypto';
const traverse=traverseModule.default||traverseModule;
const escaped=key=>key.replaceAll('~','~0').replaceAll('/','~1');
export function functionFragment({file,text,name,line,budget=160,maxDepth=12,maxBytes=256000}={}){
 const reasons=[],reads=new Set(),primitives=new Set();let steps=0,location,sourceDigest=null;
 const result=()=>({status:reasons.length?'Unknown/Unsupported':'Conditional source fragment',syntaxSupported:reasons.length===0,file,sourceDigest,name,location,reasons,ownDataPremises:[...reads],primitivePremises:[...primitives],runtimePremisesVerified:false,ownership:'Unknown/Unsupported',fullPath:false,claim:'Whole straight-line body uses supported syntax only. Actual callee/source equivalence, ordinary own-data reads, primitive observations and exact invocation remain unverified; no readonly/lifetime certificate.',limits:{budget,maxDepth,maxBytes}});
 if(typeof file!=='string'||file.length>4096||typeof text!=='string'||typeof name!=='string'||!name||name.length>256||line!==undefined&&(!Number.isSafeInteger(line)||line<1)||![budget,maxDepth,maxBytes].every(n=>Number.isSafeInteger(n)&&n>=0)||budget>10000||maxDepth>64||maxBytes>256000||text.length>maxBytes||Buffer.byteLength(text)>maxBytes){reasons.push('Invalid or exceeded input limits');return result();}
 sourceDigest=createHash('sha256').update(text).digest('hex');
 let ast;try{ast=parse(text,{sourceType:'unambiguous',plugins:['typescript','jsx']});}catch{reasons.push('Source parse failed');return result();}
 const matches=[];try{traverse(ast,{Function(p){const candidate=p.node.id?.name||(p.parentPath.isVariableDeclarator()?p.parentPath.node.id.name:null);if(candidate===name&&(!line||p.node.loc.start.line===line))matches.push(p.node);}});}catch{reasons.push('Function traversal unavailable');return result();}
 if(matches.length!==1){reasons.push('Missing or ambiguous exact function');return result();}
 const fn=matches[0];location=fn.loc;if(fn.async||fn.generator||fn.params.length!==1||fn.params[0].type!=='Identifier'){reasons.push('Ordinary single identifier parameter required');return result();}
 const env=new Map([[fn.params[0].name,{kind:'region',path:''}]]),scalar={kind:'scalar'};
 function fail(reason){throw Error(reason);}
 function primitive(value){if(value.kind==='region'){if(!value.path)fail('Returning/operating on the whole region unsupported');primitives.add(value.path);}return scalar;}
 function expression(n,depth=0){if(++steps>budget||depth>maxDepth)fail('Expression budget exceeded');if(!n)return scalar;
  switch(n.type){
   case 'NumericLiteral':case 'StringLiteral':case 'BooleanLiteral':case 'NullLiteral':case 'BigIntLiteral':return scalar;
   case 'Identifier':if(!env.has(n.name))fail('Free/global/closure identifier: '+n.name);return env.get(n.name);
   case 'MemberExpression':{if(n.computed||n.optional||n.property.type!=='Identifier')fail('Computed/optional property unsupported');const base=expression(n.object,depth+1);if(base.kind!=='region')fail('Member on unknown/scalar receiver');const path=base.path+'/'+escaped(n.property.name);reads.add(path);return{kind:'region',path};}
   case 'BinaryExpression':if(!['+','-','*','/','%','**','<','<=','>','>=','===','!==','==','!=','|','&','^','<<','>>','>>>'].includes(n.operator))fail('Operator unsupported');primitive(expression(n.left,depth+1));primitive(expression(n.right,depth+1));return scalar;
   case 'UnaryExpression':if(!['!','typeof','void','+','-','~'].includes(n.operator))fail('Unary operation unsupported');{const value=expression(n.argument,depth+1);if(!['!','typeof','void'].includes(n.operator))primitive(value);}return scalar;
   case 'LogicalExpression':primitive(expression(n.left,depth+1));primitive(expression(n.right,depth+1));return scalar;
   case 'ConditionalExpression':expression(n.test,depth+1);primitive(expression(n.consequent,depth+1));primitive(expression(n.alternate,depth+1));return scalar;
   default:fail('Unsupported expression/effect: '+n.type);
  }
 }
 try{
  if(fn.body.type!=='BlockStatement')primitive(expression(fn.body));
  else{
   const body=fn.body.body;if(!body.length||body.at(-1).type!=='ReturnStatement')fail('Single final return required');
   for(let i=0;i<body.length;i++){const s=body[i];if(++steps>budget)fail('Statement budget exceeded');
    if(s.type==='ReturnStatement'&&i===body.length-1){primitive(expression(s.argument));continue;}
    if(s.type!=='VariableDeclaration'||s.kind!=='const')fail('Unsupported statement/effect: '+s.type);
    for(const d of s.declarations){if(d.id.type!=='Identifier'||!d.init||env.has(d.id.name))fail('Immutable ordinary local alias required');const value=expression(d.init);env.set(d.id.name,value);}
   }
  }
 }catch(e){reasons.push(e.message);}
 return result();
}
