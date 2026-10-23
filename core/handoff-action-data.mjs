// SPDX-License-Identifier: Apache-2.0
// Bounded passive JSON utilities shared only by historical action codecs.
import{assertUniqueHandoffJSONMembers,assertHandoffJSONArrayBudget,MAX_HANDOFF_JSON_NODES}from'./handoff-json.mjs';
export const actionError=(message='Invalid historical action evidence',code='INVALID_ACTION_EVIDENCE')=>Object.assign(Error(message),{code});
export const actionFail=message=>{throw actionError(message);};
export const actionHash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export const actionUUID=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x);
export const actionTime=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&!Object.is(x,-0)&&x<=8640000000000000;
export const actionISO=x=>typeof x==='string'&&Number.isFinite(Date.parse(x))&&new Date(Date.parse(x)).toISOString()===x;
export const actionCanonical=x=>JSON.stringify(function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}(x));
export const actionEqual=(a,b)=>actionCanonical(a)===actionCanonical(b);
export async function actionDigest(raw){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),x=>x.toString(16).padStart(2,'0')).join('');}
export function actionOwn(value,allowed){
 if(!value||typeof value!=='object'||Array.isArray(value)||![null,Object.prototype].includes(Object.getPrototypeOf(value)))actionFail('Own plain action evidence options required');
 const out=Object.create(null);for(const key of Reflect.ownKeys(value)){const d=Object.getOwnPropertyDescriptor(value,key);if(typeof key!=='string'||!allowed.includes(key)||!d.enumerable||!Object.hasOwn(d,'value'))actionFail('Unknown action evidence option or accessor');out[key]=d.value;}return out;
}
export function actionArray(value,max=1024){
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)actionFail('Plain action evidence array required');const d=Object.getOwnPropertyDescriptors(value),n=d.length.value;
 if(n>max||Reflect.ownKeys(d).length!==n+1)actionFail('Action evidence array limit or decoration');const out=[];for(let i=0;i<n;i++){if(!d[i]||!Object.hasOwn(d[i],'value'))actionFail('Sparse/accessor action evidence array');out.push(d[i].value);}return out;
}
export function actionKeys(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))actionFail('Unexpected action evidence fields');}
export function actionJSON(raw){
 if(typeof raw!=='string')actionFail('Action evidence JSON text required');if(new TextEncoder().encode(raw).length>1048576)throw actionError('Historical file exceeds 1 MiB','HANDOFF_LIMIT');
 let record;try{record=JSON.parse(raw);}catch{actionFail('Malformed action evidence JSON');}assertUniqueHandoffJSONMembers(raw);assertHandoffJSONArrayBudget(record);
 const stack=[[record,0]];let n=0;while(stack.length){const[x,depth]=stack.pop();if(++n>MAX_HANDOFF_JSON_NODES||depth>16||typeof x==='string'&&x.length>16384)throw actionError('Action evidence structure limit','HANDOFF_LIMIT');if(typeof x==='number'&&(!Number.isFinite(x)||Object.is(x,-0)))actionFail('JSON-stable action evidence number required');if(x&&typeof x==='object')for(const[k,v]of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(k))actionFail('Forbidden action evidence key');stack.push([v,depth+1]);}}
 return record;
}
export function actionFrozen(value){const copy=structuredClone(value);function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}return freeze(copy);}
export function actionClock(options){const fn=Object.hasOwn(options,'now')?options.now:Date.now;if(typeof fn!=='function')actionFail('Host action evidence clock required');const now=fn();if(!actionTime(now))actionFail('Invalid action evidence time');return new Date(now).toISOString();}
// Snapshot mutable review choices before asynchronous integrity checks.
export function actionInertReview(value){
 let count=0;function copy(v,depth){if(++count>32768||depth>8)throw actionError('Action review structure limit','HANDOFF_LIMIT');if(v===null||typeof v==='boolean')return v;if(typeof v==='number'){if(!Number.isFinite(v)||Object.is(v,-0))actionFail('JSON-stable review scalar required');return v;}if(typeof v==='string'){if(v.length>4096)throw actionError('Action review text limit','HANDOFF_LIMIT');return v;}if(!v||typeof v!=='object')actionFail('Inert review data required');if(Array.isArray(v))return actionArray(v,2048).map(x=>copy(x,depth+1));const out={};for(const[k,x]of Object.entries(actionOwn(v,Reflect.ownKeys(v).filter(k=>typeof k==='string')))){if(['__proto__','prototype','constructor'].includes(k))actionFail('Forbidden review key');out[k]=copy(x,depth+1);}return out;}return copy(value,0);
}
