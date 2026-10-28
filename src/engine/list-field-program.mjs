// SPDX-License-Identifier: Apache-2.0
// Compose original-source recipes structurally. This is not an owned compilation,
// whole-page effect proof, native invocation or a public profile admission token.
import {createHash} from 'node:crypto';
import {admitListFieldSources} from './list-field-source-admission.mjs';
import {instrumentReducerFieldWrites} from './reducer-field-writes.mjs';
import {instrumentComponentFieldReads} from './component-field-reads.mjs';
import {instrumentComponentPropTransfers} from './component-prop-transfers.mjs';
import {instrumentListData} from './list-data-transform.mjs';
const sha=s=>createHash('sha256').update(s).digest('hex');
export function prepareListFieldProgram(files,{root,field}={}){
 const unknown=reason=>({status:'Unknown/Unsupported',reason,modules:[],fieldOwnership:'Unknown/Unsupported',fullPath:false});
 try{
  const admission=admitListFieldSources(files,{root,field});if(admission.status!=='Conditional source admission')return unknown('Finite original source admission unavailable');
  const {compiler}=admission,props=admission.edges.filter(e=>e.kind==='component-prop'),roles=new Map();
  function role(file,value){if(roles.has(file))throw Error('Multiple original compiler owners in one module unsupported');roles.set(file,value);}
  role(compiler.reducer.file,{kind:'writer',binding:compiler.reducer.binding});
  const senders=new Map();for(const e of props){if(!e.sourceBinding)throw Error('Original sender unavailable');const key=JSON.stringify([e.file,e.sourceBinding]);let sender=senders.get(key);if(!sender){sender={file:e.file,binding:e.sourceBinding,outputs:new Set()};senders.set(key,sender);}sender.outputs.add(e.prop);}
  for(const sender of senders.values()){
   let input;if(sender.file===compiler.root.file&&sender.binding===compiler.root.binding)input=compiler.root.input;
   else{const incoming=props.filter(e=>e.targetFile===sender.file&&e.targetBinding===sender.binding);const params=new Set(incoming.map(e=>e.parameter));if(params.size!==1)throw Error('Unique original incoming parameter required');input=[...params][0];}
   role(sender.file,{kind:'transfer',binding:sender.binding,inputs:[input],outputs:[...sender.outputs]});
  }
  const readers=new Map();for(const e of props)if(e.valueKind==='row'){const key=JSON.stringify([e.targetFile,e.targetBinding,e.parameter]);readers.set(key,{file:e.targetFile,kind:'read',binding:e.targetBinding,parameter:e.parameter});}
  if(readers.size!==1)throw Error('One bounded selected row reader required');for(const reader of readers.values())role(reader.file,reader);
  const modules=[];
  for(const original of admission.modules){const input=files.find(f=>f.file===original.file),r=roles.get(original.file),observers={},module={...original,writer:null,fieldRead:null,transfer:null,dataSites:[],observers};let base,code=input.text;
   const name=kind=>{const identifier='__saList_'+kind+'_'+original.sourceDigest.slice(0,12);observers[kind]=identifier;return identifier;};
   if(r?.kind==='writer'){
    base=instrumentReducerFieldWrites(input.text,input.file,{binding:r.binding,field,observerName:name('write'),capture:'invocation',includeAst:true});if(base.status!=='Code-linked writer sites')throw Error('Writer recipe unavailable');module.writer={binding:r.binding,field,sites:base.sites};
   }else if(r?.kind==='read'){
    base=instrumentComponentFieldReads(input.text,input.file,{binding:r.binding,parameter:r.parameter,field,observerName:name('read'),includeAst:true});if(base.status!=='Code-linked field reads')throw Error('Reader recipe unavailable');module.fieldRead=base.sites[0];
   }else if(r?.kind==='transfer'){
    base=instrumentComponentPropTransfers(input.text,input.file,{binding:r.binding,inputs:r.inputs,outputs:r.outputs,observerName:name('transfer'),includeAst:true});if(base.status!=='Code-linked prop transfers')throw Error('Transfer recipe unavailable');module.transfer=base.site;
   }
   if(base)code=base.code;const sites=admission.dataSites.filter(s=>s.file===input.file);
   if(sites.length){const data=instrumentListData(input.text,input.file,{sites,observerName:name('data'),ast:base?.ast});if(data.status!=='Code-linked list data')throw Error('Original data composition unavailable');code=data.code;module.dataSites=data.sites;}
   module.code=code;module.outputDigest=sha(code);modules.push(module);
  }
  const digest=sha(JSON.stringify({field,modules:modules.map(({file,sourceDigest,outputDigest,writer,fieldRead,transfer,dataSites,observers})=>({file,sourceDigest,outputDigest,writer,fieldRead,transfer,dataSites,observers}))}));
  return{status:'Code-linked list program',modules,digest,admission,fieldOwnership:'Unknown/Unsupported',fullPath:false,scope:'Original source recipe composition only; loaded compiled code, native effects and no-write interval remain unproved'};
 }catch{return unknown('Bounded original recipe composition unavailable');}
}

export function bindListFieldModule(module,runtimeSpecifier){
 if(!module||typeof module.code!=='string'||module.outputDigest!==sha(module.code)||typeof runtimeSpecifier!=='string'||!runtimeSpecifier||runtimeSpecifier.length>4096)throw Error('Exact compiled module and owned runtime specifier required');
 let local='__saListAPI_'+module.sourceDigest.slice(0,12);while(module.code.includes(local))local+='_';
 const methods={write:'reducerFieldSource',read:'componentFieldSource',transfer:'componentTransferSource',data:'listDataSource'},before=[`import {api as ${local}} from ${JSON.stringify(runtimeSpecifier)};`],after=[];
 for(const [role,name]of Object.entries(module.observers)){if(!Object.hasOwn(methods,role)||!/^[$A-Z_a-z][$\w]*$/.test(name))throw Error('Original observer binding required');before.push(`const ${name}=${local}.${methods[role]};`);}
 const register=(method,args)=>`try{if(typeof ${local}.${method}==='function')${local}.${method}(${args});}catch{}`;
 if(module.fieldRead)before.push(register('registerComponentFields',JSON.stringify(module.fieldRead)));
 if(module.transfer)before.push(register('registerComponentTransfers',JSON.stringify(module.transfer)));
 if(module.dataSites.length)before.push(register('registerListData',JSON.stringify(module.dataSites)));
 if(module.writer){if(!/^[$A-Z_a-z][$\w]*$/.test(module.writer.binding))throw Error('Original reducer binding required');after.push(register('registerReducerFields',module.writer.binding+','+JSON.stringify(module.writer.sites.map(s=>s.id))+','+JSON.stringify(module.writer.field)));}
 return before.join('\n')+'\n'+module.code+'\n'+after.join('\n');
}
