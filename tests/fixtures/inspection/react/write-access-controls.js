// SPDX-License-Identifier: Apache-2.0
// Source-only controls; native/implicit writes remain uncovered.
export async function runWriteAccessCase(name){
 const data=await(await fetch('/api/account?write-access')).json();window.writeAccessData=data;
 const order=[],error={original:true};let calls=0,caught=false,value;
 if(name==='computed'){const key={[Symbol.toPrimitive](hint){order.push('key:'+hint);return 'quota'}};data.rules[key]=12;}
 if(name==='compound'){const key={[Symbol.toPrimitive](hint){order.push('key:'+hint);return 'quota'}};data.rules[key]+=1;}
 if(name==='logical-skip')data.rules['quota']||=++calls;
 if(name==='logical-take')data.rules['missing']??=(calls++,7);
 if(name==='throw'){try{data.rules['quota']=(()=>{calls++;throw error})()}catch(e){caught=e===error}}
 if(name==='parameter-closure'){function f(o,g=()=>{o['quota']=12;return o.quota}){return g()}value=f(data.rules);}
 if(name==='parameter'){function f(x=(data.rules['quota']=12)){return x}value=f();}
 if(name==='class'){class C{field=(data.rules['quota']=12)}value=new C().field;}
 if(name==='private'){class Base{constructor(){return data.rules}}class Stamp extends Base{#x=0;static write(o){o.#x=7}}new Stamp();Stamp.write(data.rules);}
 if(name==='pattern')({value:data.rules['quota']=++calls}={value:12});
 if(name==='loop')for(data.rules['quota'] of [12,12])calls++;
 if(name==='delete')value=delete data.rules['quota'];
 if(name==='update')value=data.rules['quota']++;
 if(name==='proxy'){const p=new Proxy({x:1},{get(t,k,r){order.push('get:'+String(k));return Reflect.get(t,k,r)},set(t,k,v,r){order.push('set:'+String(k));return Reflect.set(t,k,v,r)},getOwnPropertyDescriptor(t,k){order.push('desc:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k)}});p['x']+=2;value=p.x;}
 if(name==='weak-lookup'){const original=WeakMap.prototype.get;eval('WeakMap.prototype.get=function(key){calls++;return Reflect.apply(original,this,[key])}');try{({})['x']=1}finally{eval('WeakMap.prototype.get=original')}}
 if(name==='optional'){const o=null;value=delete o?.x.field;}
 if(name==='implicit'){class Base{constructor(){return data.rules}}class Stamp extends Base{quota=12;field=()=>1}const result=new Stamp();value=result.field.name;}
 if(name==='await'){let release;const gate=new Promise(resolve=>{release=resolve});window.writeAccessRelease=()=>release(18);window.writeAccessPending=(async()=>{data.rules['quota']=await gate;window.writeAccessCompleted=true})();}
 const semantics={name,quota:data.rules.quota??null,calls,caught,order,value:value??null};document.getElementById('result').textContent=JSON.stringify(semantics);return semantics;
}
const result=document.createElement('pre');result.id='result';document.body.append(result);window.runWriteAccessCase=runWriteAccessCase;window.writeAccessReady=true;
