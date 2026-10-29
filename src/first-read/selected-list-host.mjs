// SPDX-License-Identifier: Apache-2.0
// Trusted Node launch configuration, never page-provided authority.
import path from 'node:path';
export function selectedListHost(value){
 if(value===undefined)return{kind:'standalone',panel:'panel.html',worker:'worker.js'};
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join(',')!=='directory,sha256'||typeof value.directory!=='string'||!path.isAbsolute(value.directory)||path.resolve(value.directory)!==value.directory||!/^[a-f0-9]{64}$/.test(value.sha256))throw Error('Official extension directory and byte pin required');
 return{kind:'stateport',directory:value.directory,sha256:value.sha256,panel:'atom.html',worker:'service-worker.js'};
}
export function fetchPolicyDeclaration(ast,code,{official=false}={}){
 const declarations=ast.program.body.flatMap(node=>node.type==='ExportNamedDeclaration'?[node.declaration]:[node]).filter(node=>node?.type==='FunctionDeclaration');
 const marked=declarations.filter(node=>node.body.directives?.some(d=>d.value.value==='stateatom:fetch-policy-helper/1'));
 const matches=marked.length?marked:official?[]:declarations.filter(node=>node.id?.name==='installFetchPolicy');
 if(matches.length!==1||matches[0].end-matches[0].start>32768)throw Error('Built policy declaration unavailable');
 return code.slice(matches[0].start,matches[0].end);
}
