// SPDX-License-Identifier: Apache-2.0
import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';
const traverse=traverseModule.default||traverseModule;
export function listFunctionRanges(code,names){
 const result={};const record=(name,node,parent)=>{const role=names[name];if(!role)return;if(result[role])throw Error('Ambiguous original function '+role);result[role]={start:node.start,end:node.end,...(parent?{parent:{start:parent.start,end:parent.end}}:{})};};
 traverse(parse(code),{FunctionDeclaration(p){record(p.node.id?.name,p.node,p.findParent(p=>p.isFunction())?.node);},VariableDeclarator(p){const node=p.node;if(node.id.type!=='Identifier')return;let fn=node.init;if(fn?.type==='CallExpression')fn=fn.arguments[0];if(['FunctionExpression','ArrowFunctionExpression'].includes(fn?.type))record(node.id.name,fn,p.findParent(p=>p.isFunction())?.node);}});
 for(const role of Object.values(names))if(!result[role])throw Error('Original function range unavailable: '+role);return result;
}
export function listFunctionCounts(coverage,url,ranges,{initial=false,evidence={}}={}){
 const scripts=coverage.result.filter(s=>s.url===url);if(scripts.length!==1)throw Error('Exact native coverage script unavailable');
 const result={};for(const [role,range]of Object.entries(ranges)){
  const matches=scripts[0].functions.filter(f=>f.ranges?.[0]?.startOffset===range.start&&f.ranges[0].endOffset===range.end);
  // Only the first sample begins before app navigation. If the exact original
  // parent was never invoked, its nested callback could not yet be created.
  // After a reset, retained closures make this deduction invalid: refuse.
  if(matches.length===0&&initial&&range.parent){
   const parents=scripts[0].functions.filter(f=>f.ranges?.[0]?.startOffset===range.parent.start&&f.ranges[0].endOffset===range.parent.end);
   if(parents.length===1&&parents[0].ranges[0].count===0){result[role]=0;evidence[role]={kind:'not-created-before-first-parent-call',parent:parents[0].ranges[0]};continue;}
  }
  if(matches.length!==1||!Number.isSafeInteger(matches[0].ranges[0].count)||matches[0].ranges[0].count<0)throw Error('Exact native function count unavailable: '+role);
  result[role]=matches[0].ranges[0].count;evidence[role]={kind:'native-exact-function-range',range:matches[0].ranges[0]};
 }return result;
}
