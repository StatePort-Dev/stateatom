// SPDX-License-Identifier: Apache-2.0
// POSIX-style explicit-file label operations only. Never filesystem or URL access.
export function normalizeActionSourceName(value){
 if(typeof value!=='string')return null;
 const absolute=value.startsWith('/'),trailing=value.endsWith('/'),parts=[];
 for(const part of value.split('/')){if(!part||part==='.')continue;if(part==='..'&&parts.length&&parts.at(-1)!=='..')parts.pop();else if(part==='..'){if(!absolute)parts.push(part);}else parts.push(part);}
 let result=(absolute?'/':'')+parts.join('/');if(!result)result=absolute?'/':'.';if(trailing&&result!=='/'&&result!=='.')result+='/';return result;
}
export function actionImportPath(from,relative){
 if(typeof from!=='string'||typeof relative!=='string'||!relative.startsWith('.'))return null;
 const index=from.lastIndexOf('/'),dir=index<0?'.':index===0?'/':from.slice(0,index);
 return normalizeActionSourceName(dir+'/'+relative);
}
