// SPDX-License-Identifier: Apache-2.0
// Module-owned, bounded acquisition metadata only. No public callback adoption,
// object fields, application getters, source text or strong graph references.
const apply=Reflect.apply,get=WeakMap.prototype.get,set=WeakMap.prototype.set,push=Array.prototype.push;
const freeze=Object.freeze;
const slice=String.prototype.slice,finite=Number.isFinite,NativeWeakMap=WeakMap;
const ledgerId=globalThis.crypto.randomUUID();
let objects=new NativeWeakMap(),objectCount=0,sequence=0,active=true,overflow=false;const events=[];
export function firstQueryObjectId(value){
 if(!active||value===null||typeof value!=='object'&&typeof value!=='function')return null;
 const old=apply(get,objects,[value]);if(old)return old;if(objectCount>=256){overflow=true;return null;}
 const id=ledgerId+':object'+(++objectCount);apply(set,objects,[value,id]);return id;
}
function metadata(value){const type=value===null?'null':typeof value;if(type==='object'||type==='function')return freeze({type,id:firstQueryObjectId(value)});if(type==='undefined')return freeze({type});if(type==='string')return value.length<=128?freeze({type,value}):freeze({type:'Unsupported',reason:'String budget exceeded'});if(type==='number')return finite(value)?freeze({type,value}):freeze({type:'Unsupported',reason:'Nonfinite scalar'});if(type==='boolean'||type==='null')return freeze({type,value});return freeze({type:'Unsupported'});}
export function firstQueryTap(kind,...args){
 if(!active||overflow)return;if(typeof kind!=='string'||kind.length===0||kind.length>64||events.length>=256){overflow=true;return;}
 try{const fields=[];for(let i=0;i<args.length&&i<5;i++)apply(push,fields,[metadata(args[i])]);apply(push,events,[freeze({sequence:++sequence,kind,args:freeze(fields)})]);}catch{overflow=true;}
}
export function firstQuerySnapshot(){const copy=[];for(let i=0;i<events.length;i++)apply(push,copy,[events[i]]);return{id:ledgerId,status:active&&!overflow?'Observed':'Unknown/Unsupported',events:copy,overflow,retention:{events:events.length,objects:objectCount},fullPath:false,scope:'Declared original Query branch/loop metadata only; not complete aliases, pristine intrinsics, field revision or source authority'};}
export function stopFirstQuery(){active=false;events.length=0;objects=new NativeWeakMap();}
