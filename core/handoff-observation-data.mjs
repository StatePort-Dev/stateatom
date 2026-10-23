// SPDX-License-Identifier: Apache-2.0
// Bounded passive JSON utilities shared only by historical observation codecs.
import{assertUniqueHandoffJSONMembers,assertHandoffJSONArrayBudget,MAX_HANDOFF_JSON_NODES}from'./handoff-json.mjs';
export const observationError=(message='Invalid historical observation evidence',code='INVALID_OBSERVATION_EVIDENCE')=>Object.assign(Error(message),{code});
export const observationFail=message=>{throw observationError(message);};
export const observationHash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export const observationUUID=x=>typeof x==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x);
export const observationTime=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&!Object.is(x,-0)&&x<=8640000000000000;
export const observationISO=x=>typeof x==='string'&&Number.isFinite(Date.parse(x))&&new Date(Date.parse(x)).toISOString()===x;
export const observationCanonical=x=>JSON.stringify(function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}(x));
export const observationEqual=(a,b)=>observationCanonical(a)===observationCanonical(b);
export async function observationDigest(raw){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),x=>x.toString(16).padStart(2,'0')).join('');}
export function observationOwn(value,allowed){
 if(!value||typeof value!=='object'||Array.isArray(value)||![null,Object.prototype].includes(Object.getPrototypeOf(value)))observationFail('Own plain observation evidence options required');
 const out=Object.create(null);for(const key of Reflect.ownKeys(value)){const d=Object.getOwnPropertyDescriptor(value,key);if(typeof key!=='string'||!allowed.includes(key)||!d.enumerable||!Object.hasOwn(d,'value'))observationFail('Unknown observation evidence option or accessor');out[key]=d.value;}return out;
}
export function observationArray(value,max=1024){
 if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)observationFail('Plain observation evidence array required');const d=Object.getOwnPropertyDescriptors(value),n=d.length.value;
 if(n>max||Reflect.ownKeys(d).length!==n+1)observationFail('Observation evidence array limit or decoration');const out=[];for(let i=0;i<n;i++){if(!d[i]||!Object.hasOwn(d[i],'value'))observationFail('Sparse/accessor observation evidence array');out.push(d[i].value);}return out;
}
export function observationKeys(value,keys){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==keys.length||keys.some(k=>!Object.hasOwn(value,k)))observationFail('Unexpected observation evidence fields');}
export function observationJSON(raw){
 if(typeof raw!=='string')observationFail('Observation evidence JSON text required');if(new TextEncoder().encode(raw).length>1048576)throw observationError('Historical file exceeds 1 MiB','HANDOFF_LIMIT');
 let record;try{record=JSON.parse(raw);}catch{observationFail('Malformed observation evidence JSON');}assertUniqueHandoffJSONMembers(raw);assertHandoffJSONArrayBudget(record);
 const stack=[[record,0]];let n=0;while(stack.length){const[x,depth]=stack.pop();if(++n>MAX_HANDOFF_JSON_NODES||depth>16||typeof x==='string'&&x.length>16384)throw observationError('Observation evidence structure limit','HANDOFF_LIMIT');if(typeof x==='number'&&(!Number.isFinite(x)||Object.is(x,-0)))observationFail('JSON-stable observation evidence number required');if(x&&typeof x==='object')for(const[k,v]of Object.entries(x)){if(['__proto__','prototype','constructor'].includes(k))observationFail('Forbidden observation evidence key');stack.push([v,depth+1]);}}
 return record;
}
export function observationFrozen(value){const copy=structuredClone(value);function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}return freeze(copy);}
export function observationClock(options){const fn=Object.hasOwn(options,'now')?options.now:Date.now;if(typeof fn!=='function')observationFail('Host observation evidence clock required');const now=fn();if(!observationTime(now))observationFail('Invalid observation evidence time');return new Date(now).toISOString();}
// Snapshot mutable review choices before asynchronous integrity checks.
export function observationInertReview(value){
 let count=0;function copy(v,depth){if(++count>32768||depth>8)throw observationError('Observation review structure limit','HANDOFF_LIMIT');if(v===null||typeof v==='boolean')return v;if(typeof v==='number'){if(!Number.isFinite(v)||Object.is(v,-0))observationFail('JSON-stable review scalar required');return v;}if(typeof v==='string'){if(v.length>4096)throw observationError('Observation review text limit','HANDOFF_LIMIT');return v;}if(!v||typeof v!=='object')observationFail('Inert review data required');if(Array.isArray(v))return observationArray(v,2048).map(x=>copy(x,depth+1));const out={};for(const[k,x]of Object.entries(observationOwn(v,Reflect.ownKeys(v).filter(k=>typeof k==='string')))){if(['__proto__','prototype','constructor'].includes(k))observationFail('Forbidden review key');out[k]=copy(x,depth+1);}return out;}return copy(value,0);
}
