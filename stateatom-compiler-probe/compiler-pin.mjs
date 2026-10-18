// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs';
import {compilerHash} from './model.mjs';
const pin=JSON.parse(readFileSync(new URL('./vite-7.3.7-inputs.json',import.meta.url),'utf8'));
export function verifyVitePin({version,files}){
 if(version!==pin.version)throw Error('Compiler acquisition supports pinned Vite '+pin.version+' only');
 if(files.size!==Object.keys(pin.files).length)throw Error('Pinned Vite input set changed');
 for(const[name,digest]of Object.entries(pin.files))if(!files.has(name)||compilerHash(files.get(name))!==digest)throw Error('Pinned Vite implementation bytes changed: '+name);
 return compilerHash(JSON.stringify(pin));
}
export function installedVitePin(){
 const pkg=JSON.parse(readFileSync(new URL('../node_modules/vite/package.json',import.meta.url),'utf8'));
 const files=new Map(Object.keys(pin.files).map(name=>[name,readFileSync(new URL('../node_modules/vite/dist/node/'+name,import.meta.url))]));return verifyVitePin({version:pkg.version,files});
}
