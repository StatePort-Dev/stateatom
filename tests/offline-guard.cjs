// Harness-only guard, scoped to the dedicated Extension Host. Never installed in the product.
const http=require('node:http'),https=require('node:https');
const audit={blocked:[],scope:'Node http/https/fetch in dedicated extension host; excludes Electron/native/child processes'};
function assertLocal(input){const value=typeof input==='string'||input instanceof URL?String(input):input?.href||'http://'+(input?.hostname||input?.host||'localhost');const url=new URL(value);if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)){audit.blocked.push(url.origin);throw Error('XRAY TEST: external request blocked');}}
for(const module of [http,https]){const original=module.request;module.request=function(input,...args){assertLocal(input);return original.call(this,input,...args);};const get=module.get;module.get=function(input,...args){assertLocal(input);return get.call(this,input,...args);};}
if(global.fetch){const fetch=global.fetch;global.fetch=(input,...args)=>{assertLocal(typeof input==='object'&&input.url?input.url:input);return fetch(input,...args);};}
try{https.request('https://example.invalid/xray-offline-probe');}catch(e){audit.probeDenied=e.message.includes('external request blocked');}
module.exports=audit;
