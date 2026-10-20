// SPDX-License-Identifier: Apache-2.0
// Internal lexical check after the caller validates JSON syntax and byte size.
// Never canonicalize imported bytes: shadow members must be refused, not erased.
export function assertUniqueHandoffJSONMembers(raw,{maxDepth=16,maxMembers=10000}={}){
 const stack=[];let members=0;
 const limit=()=>{throw Object.assign(new Error('Historical JSON structure bound'),{code:'HANDOFF_LIMIT'});};
 for(let i=0;i<raw.length;i++){
  const char=raw[i];
  if(char==='"'){
   const start=i;
   for(i++;i<raw.length;i++){if(raw[i]==='\\')i++;else if(raw[i]==='"')break;}
   const object=stack.at(-1);
   if(object?.names&&object.expectKey){
    const key=JSON.parse(raw.slice(start,i+1));
    if(object.names.has(key))throw Object.assign(new Error('Duplicate JSON object member names; use an unambiguous export.'),{code:'INVALID_HANDOFF_JSON'});
    object.names.add(key);object.expectKey=false;
    if(++members>maxMembers)limit();
   }
  }else if(char==='{'||char==='['){
   stack.push(char==='{'?{names:new Set(),expectKey:true}:{});
   if(stack.length>maxDepth+1)limit();
  }else if(char==='}'||char===']')stack.pop();
  else if(char===','&&stack.at(-1)?.names)stack.at(-1).expectKey=true;
 }
}
