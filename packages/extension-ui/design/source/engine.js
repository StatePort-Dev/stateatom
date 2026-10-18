/* Deterministic synthetic state for UX review. Not a tracer or a network interceptor. */
(function(root){'use strict';
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const parts=p=>p===''?[]:p.slice(1).split('/').map(k=>k.replace(/~1/g,'/').replace(/~0/g,'~'));
const get=(o,p)=>parts(p).reduce((v,k)=>v==null?undefined:v[k],o);
function set(o,p,v,mode){const ps=parts(p);if(ps.some(k=>['__proto__','constructor','prototype'].includes(k)))throw Error('Unsafe path');if(!ps.length)return clone(v);const n=clone(o);let c=n;for(const k of ps.slice(0,-1)){if(!c||typeof c!=='object'||!Object.hasOwn(c,k))throw Error('Missing parent');c=c[k];}if(!c||typeof c!=='object')throw Error('Invalid target');const k=ps.at(-1);if(Array.isArray(c)&&(!/^\d+$/.test(k)||Number(k)>=c.length))throw Error('Invalid array index');if(mode==='remove'){if(Array.isArray(c))c.splice(Number(k),1);else delete c[k];}else c[k]=clone(v);return n;}
const ek=k=>k.replace(/~/g,'~0').replace(/\//g,'~1');
function diff(a,b,p=''){if(equal(a,b))return [];if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b))return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>diff(a[k],b[k],p+'/'+ek(k)));return [{path:p||'/',before:clone(a),after:clone(b),op:a===undefined?'add':b===undefined?'remove':'replace'}];}
const changes=(a,b)=>Object.keys(a).flatMap(r=>diff(a[r],b[r]).map(d=>({...d,source:r})));
function create(key='hold'){const original={order:{body:{id:731,account:{name:'Northline Studio',creditHold:true},total:2850,currency:'USD',note:'',tags:['priority','net-30'],owner:null},status:200,delay:0},permissions:{body:{canConfirm:key!=='two',role:'manager'},status:200,delay:0},local:{body:{formValid:true,variant:'solid'}}};const s={scenario:key,linked:!['browser','pm','production'].includes(key),unknown:key==='unknown',env:key==='production'?'production':'sandbox',mode:['pm','production'].includes(key)?'summary':'technical',target:key==='types'?'total':'confirm',original,draft:clone(original),current:clone(original),armed:null,raw:{},errors:{},metaErrors:{},waiting:false,restored:false,history:[]};sync(s,'order');sync(s,'permissions');return s;}
const readonly=s=>s.env==='production'||s.mode==='summary';
const pending=s=>changes(s.armed||s.original,s.draft).length;
const active=s=>s.armed?changes(s.original,s.armed).length:0;
const stale=s=>!equal(s.current,s.original);
function writable(s){if(readonly(s))throw Error('Read-only');}
function sync(s,r){if(r!=='local')s.raw[r]=JSON.stringify(s.draft[r].body,null,2);delete s.errors[r];}
function edit(s,r,p,v,mode){writable(s);if(s.errors[r])throw Error('Fix JSON first');s.draft[r].body=set(s.draft[r].body,p,v,mode);delete s.metaErrors['field:'+r+':'+p];sync(s,r);}
function raw(s,r,t){writable(s);s.raw[r]=t;try{s.draft[r].body=JSON.parse(t);delete s.errors[r];for(const k of Object.keys(s.metaErrors))if(k.startsWith('field:'+r+':'))delete s.metaErrors[k];}catch{s.errors[r]='Invalid JSON';}}
function meta(s,r,k,v){writable(s);const n=Number(v);if(v===''||!Number.isInteger(n)||(k==='status'?(n<200||n>599):(n<0||n>10000))){s.metaErrors[r+':'+k]=k==='status'?'Status: 200–599':'Delay: 0–10000 ms';return;}s.draft[r][k]=n;delete s.metaErrors[r+':'+k];}
function resetPath(s,r,p){writable(s);const v=get(s.original[r].body,p);s.draft[r].body=set(s.draft[r].body,p,v,v===undefined?'remove':undefined);sync(s,r);delete s.metaErrors['field:'+r+':'+p];}
function resetResponse(s,r){writable(s);s.draft[r]=clone(s.original[r]);sync(s,r);for(const k of Object.keys(s.metaErrors))if(k.startsWith(r+':')||k.startsWith('field:'+r+':'))delete s.metaErrors[k];}
function resetDraft(s){writable(s);s.draft=clone(s.armed||s.original);s.errors={};s.metaErrors={};sync(s,'order');sync(s,'permissions');}
const canApply=s=>!readonly(s)&&pending(s)>0&&!Object.keys(s.errors).length&&!Object.keys(s.metaErrors).length;
function arm(s){writable(s);if(!canApply(s))throw Error('Cannot apply draft');s.armed=clone(s.draft);s.waiting=true;s.restored=false;}
function output(s){const o=s.current.order,b=o.body,p=s.current.permissions,l=s.current.local.body;let error=o.status>=400?'HTTP '+o.status:p.status>=400?'Permissions HTTP '+p.status:null;if(!error&&(!b||typeof b!=='object'||!b.account||typeof b.account.creditHold!=='boolean'||!Number.isFinite(b.total)||typeof b.currency!=='string'))error='Invalid order data';if(!error&&(!p.body||typeof p.body.canConfirm!=='boolean'))error='Invalid permissions';return {disabled:error?true:Boolean(b.account.creditHold||!p.body.canConfirm||!l.formValid),creditHold:b?.account?.creditHold,canConfirm:p.body?.canConfirm,formValid:l.formValid,variant:l.variant,total:b?.total,currency:b?.currency,name:b?.account?.name,note:b?.note,error};}
function receive(s){const before=output(s);s.current=clone(s.armed||s.original);s.waiting=false;s.restored=!s.armed;s.history.push({kind:s.armed?'override':'original',before,after:clone(output(s)),changes:changes(s.original,s.current)});}
function disarm(s){s.armed=null;s.waiting=false;s.restored=false;s.draft=clone(s.original);s.errors={};s.metaErrors={};sync(s,'order');sync(s,'permissions');}
function status(s){if(Object.keys(s.errors).length||Object.keys(s.metaErrors).length)return 'Invalid draft';if(pending(s))return 'Prepared';if(s.waiting)return 'Waiting for request';if(s.armed)return 'Applied';if(stale(s))return 'Not restored';return s.restored?'Restored':'Original';}
const E={clone,equal,get,set,diff,changes,create,readonly,edit,raw,meta,resetPath,resetResponse,resetDraft,pending,active,canApply,arm,receive,disarm,output,status,stale};if(typeof module!=='undefined'&&module.exports)module.exports=E;else root.AtomDemoEngine=E;
})(typeof window!=='undefined'?window:globalThis);
