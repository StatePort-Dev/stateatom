// SPDX-License-Identifier: Apache-2.0
// Presentation-only boolean model. No eval, property access or application calls.
const own=(o,k)=>{try{const d=o&&Object.getOwnPropertyDescriptor(o,k);return d&&'value'in d?d.value:undefined;}catch{return undefined;}};
const freeze=o=>{for(const v of Object.values(o))if(v&&typeof v==='object')freeze(v);return Object.freeze(o);};
export function parseExplanationCondition(expression){
 if(typeof expression!=='string'||!expression.length||expression.length>400)return null;
 let at=0,count=0,depth=0;
 const space=()=>{while(/\s/.test(expression[at]||'')&&at<expression.length)at++;};
 function token(value){space();if(expression.startsWith(value,at)){at+=value.length;return true;}return false;}
 function atom(){
  if(++count>64||++depth>12)throw Error();space();const start=at;let result;
  if(token('!'))result={kind:'not',child:atom(),start,end:at};
  else if(token('(')){const child=or();if(!token(')'))throw Error();result={kind:'group',child,start,end:at};}
  else{const m=/^[A-Za-z_$][\w$]*/.exec(expression.slice(at));if(!m)throw Error();at+=m[0].length;
   if(m[0]==='true'||m[0]==='false')result={kind:'literal',value:m[0]==='true',start,end:at};
   else{for(;;){const saved=at;if(!token('.')){at=saved;break;}space();const next=/^[A-Za-z_$][\w$]*/.exec(expression.slice(at));if(!next)throw Error();at+=next[0].length;}result={kind:'input',label:expression.slice(start,at),start,end:at};}
  }
  depth--;return result;
 }
 function and(){let left=atom();while(token('&&')){const right=atom();if(++count>64)throw Error();left={kind:'and',left,right,start:left.start,end:right.end};}return left;}
 function or(){let left=and();while(token('||')){const right=and();if(++count>64)throw Error();left={kind:'or',left,right,start:left.start,end:right.end};}return left;}
 try{const model=or();space();function bounded(n,level=0){return level<=12&&(!n.child||bounded(n.child,level+1))&&(!n.left||bounded(n.left,level+1)&&bounded(n.right,level+1));}if(at!==expression.length||!bounded(model))return null;return freeze(model);}catch{return null;}
}
export function evaluateExplanationCondition(model,inputs=[]){
 const length=own(inputs,'length'),supplied=Array.isArray(inputs)&&Number.isSafeInteger(length)&&length<=32?Array.from({length},(_,i)=>own(inputs,String(i))):[],leaves=[],skipped=[];let visits=0;
 const unknown={value:null,knownTrueTerms:0,knownFalseTerms:0,unknownInputs:0,observedInputs:0,literalInputs:0,masking:false,hypothetical:true,skipped:[],inputs:[]};
 function leaf(n){
  const start=own(n,'start'),end=own(n,'end'),label=own(n,'label');
  if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<=start||end>400)throw Error();
  const matches=supplied.filter(x=>own(x,'start')===start&&own(x,'end')===end),record=matches.length===1?matches[0]:null,value=own(record,'value'),known=own(record,'status')==='Observed'&&typeof value==='boolean';
  const fact={label,start,end,value:known?value:null,status:known?'Observed':'Unavailable'};leaves.push(fact);return fact.value;
 }
 function visit(n,level=0){
  if(!n||++visits>64||level>12)throw Error();const kind=own(n,'kind');
  if(kind==='literal'){const value=own(n,'value');if(typeof value!=='boolean')throw Error();leaves.push({start:own(n,'start'),end:own(n,'end'),value,status:'Code-linked'});return value;}
  if(kind==='input')return leaf(n);
  if(kind==='group')return visit(own(n,'child'),level+1);
  if(kind==='not'){const value=visit(own(n,'child'),level+1);return value===null?null:!value;}
  if(kind!=='and'&&kind!=='or')throw Error();const left=visit(own(n,'left'),level+1),before=leaves.length,right=visit(own(n,'right'),level+1);
  if(kind==='or'&&left===true||kind==='and'&&left===false)for(const f of leaves.slice(before))if(f.status==='Unavailable')skipped.push(f);
  // Unknown/non-boolean JS inputs are not assumed boolean or coerced. Only a
  // decisive known left operand permits a known short-circuit result.
  return left===null?null:kind==='or'?left===true?true:right:left===false?false:right;
 }
 try{
  const value=visit(model);let trueTerms=0,falseTerms=0;
  function normalized(n,negative=false){let kind=own(n,'kind');while(kind==='group'||kind==='not'){if(kind==='not')negative=!negative;n=own(n,'child');kind=own(n,'kind');}return{node:n,negative,kind:negative?(kind==='or'?'and':kind==='and'?'or':kind):kind};}
  const top=normalized(model),kind=top.kind;
  function terms(n,negative=false){const term=normalized(n,negative);if(term.kind===kind&&(kind==='or'||kind==='and')){terms(own(term.node,'left'),term.negative);terms(own(term.node,'right'),term.negative);return;}const saved=leaves.length,skip=skipped.length,raw=visit(term.node),v=raw===null?null:term.negative?!raw:raw;leaves.length=saved;skipped.length=skip;if(v===true)trueTerms++;if(v===false)falseTerms++;}
  // Bounded second pass derives static masking; it is not a second app read.
  visits=0;if(kind==='or'||kind==='and')terms(model);else{trueTerms=value===true?1:0;falseTerms=value===false?1:0;}
  return freeze({value,knownTrueTerms:trueTerms,knownFalseTerms:falseTerms,unknownInputs:leaves.filter(x=>x.status==='Unavailable').length,observedInputs:leaves.filter(x=>x.status==='Observed').length,literalInputs:leaves.filter(x=>x.status==='Code-linked').length,masking:kind==='or'&&value===true&&trueTerms>1||kind==='and'&&value===false&&falseTerms>1,hypothetical:true,skipped:[...new Set(skipped)],inputs:leaves});
 }catch{return freeze(unknown);}
}
