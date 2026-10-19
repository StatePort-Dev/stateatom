// SPDX-License-Identifier: Apache-2.0
// Exact application authority is narrower than Chrome's host match patterns.
export function appOrigin(input,{exact=false}={}){
 if(typeof input!=='string'||input.length>4096||input.trim()!==input)return null;
 try{const u=new URL(input);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port==='0'||!u.hostname||u.origin==='null')return null;
 // Reject aliases that the URL parser would silently normalize into loopback.
 const authority=input.match(/^https?:\/\/([^/?#]+)/)?.[1];if(authority!==u.host)return null;
 if(exact&&input!==u.origin)return null;return u.origin;
 }catch{return null;}
}
export function loopbackOrigin(input){const origin=appOrigin(input);if(!origin)return false;const u=new URL(origin);return u.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(u.hostname);}
export function helperURL(input){const origin=appOrigin(input,{exact:true});return !!origin&&new URL(origin).protocol==='http:'&&new URL(origin).hostname==='127.0.0.1'&&!!new URL(origin).port;}
export function siteRecord(value){
 const bad=()=>{throw Object.assign(new Error('Invalid exact site connection'),{code:'INVALID_CONNECTION'});};
 if(!value||!appOrigin(value.origin,{exact:true})||!['read-only','development'].includes(value.mode)||!Array.isArray(value.actions)||value.actions.some(a=>!['cache','reload','override','replay'].includes(a))||new Set(value.actions).size!==value.actions.length)bad();
 if(value.mode==='read-only'&&value.actions.length||value.mode==='development'&&new URL(value.origin).protocol!=='http:')bad();
 if(Object.keys(value).some(k=>!['origin','mode','actions'].includes(k)))bad();
 return Object.freeze({origin:value.origin,mode:value.mode,actions:Object.freeze([...value.actions]),source:null});
}
