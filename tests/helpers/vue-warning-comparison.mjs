// SPDX-License-Identifier: Apache-2.0
// Stable comparison only. Raw CDP records remain retained separately.
export function diagnosticMessages(events){
 const out=[];
 for(const {method,params:p} of events){
  if(method==='Runtime.consoleAPICalled'&&['warning','warn','error'].includes(p.type))out.push({kind:'console',level:p.type,args:p.args.map(a=>{const{objectId,...descriptor}=a;return{...descriptor,valueAvailable:Object.hasOwn(a,'value')};})});
  else if(method==='Runtime.exceptionThrown')out.push({kind:'exception',details:p.exceptionDetails.text,exception:p.exceptionDetails.exception?(()=>{const{objectId,...descriptor}=p.exceptionDetails.exception;return descriptor;})():null});
  else if(method==='Log.entryAdded'&&['warning','error'].includes(p.entry.level))out.push({kind:'log',level:p.entry.level,source:p.entry.source,text:p.entry.text});
 }
 return out;
}
const ordered=value=>Array.isArray(value)?value.map(ordered):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])])):value;
export function compareMessages(left,right){
 const count=messages=>{const map=new Map();for(const message of messages){const key=JSON.stringify(ordered(message));map.set(key,(map.get(key)||0)+1);}return map;},a=count(left),b=count(right);
 const delta=(a,b)=>[...a.keys()].sort().flatMap(key=>{const n=a.get(key)-(b.get(key)||0);return n>0?[{message:JSON.parse(key),count:n}]:[];});
 const onlyLeft=delta(a,b),onlyRight=delta(b,a);return{equal:!onlyLeft.length&&!onlyRight.length,onlyLeft,onlyRight};
}
