// SPDX-License-Identifier: Apache-2.0
import {readFile,writeFile,mkdtemp,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {root} from './vite-config.mjs';
const handoff=JSON.parse(await readFile(process.argv[2]||root+'/.artifacts/atom/atom-handoff.json','utf8'));
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
if(await hash(handoff.package.file)!==handoff.package.sha256||await hash(handoff.ui.file)!==handoff.ui.sha256)throw Error('Packed artifact digest mismatch');
const consumer=await mkdtemp('/tmp/stateatom-types-');
await writeFile(consumer+'/package.json',JSON.stringify({private:true,type:'module',dependencies:{'@stateport/atom':'file:'+handoff.package.file,'@stateport/extension-ui':'file:'+handoff.ui.file}}));
execFileSync('npm',['install','--offline','--ignore-scripts','--no-audit','--no-fund'],{cwd:consumer,stdio:'pipe'});
const resolve=createRequire(consumer+'/package.json');
const contract=JSON.parse(await readFile(resolve.resolve('@stateport/atom/contract.json'),'utf8'));
const pkg=JSON.parse(await readFile(consumer+'/node_modules/@stateport/atom/package.json','utf8'));
for(const key of Object.keys(pkg.exports)){
 const resolved=resolve.resolve('@stateport/atom/'+key.slice(2));
 if(!resolved.startsWith(consumer+'/node_modules/'))throw Error('Export escaped installed consumer: '+key);
 await readFile(resolved);
}
const checks=[];
for(const [file,module,moduleResolution] of [['node-consumer.mts','NodeNext','NodeNext'],['browser-consumer.ts','ESNext','Bundler']]){
 await copyFile(root+'/tests/atom/types/'+file,consumer+'/'+file);
 const config={compilerOptions:{noEmit:true,strict:true,skipLibCheck:false,target:'ES2022',lib:['ES2022','DOM'],types:[],module,moduleResolution},files:[file]};
 const configFile=consumer+'/'+file+'.json';await writeFile(configFile,JSON.stringify(config));
 try{execFileSync(process.execPath,[root+'/node_modules/typescript/lib/tsc.js','--project',configFile],{cwd:consumer,stdio:'pipe'});}catch(e){process.stdout.write(e.stdout||'');process.stderr.write(e.stderr||'');throw Error('Packed declaration consumer failed: '+file,{cause:e});}
 checks.push({file,moduleResolution,status:'PASS'});
}
const result={schema:'stateatom.packed-types/1',package:{...handoff.package},compiler:JSON.parse(await readFile(root+'/node_modules/typescript/package.json','utf8')).version,contract,consumer,checks};
const output=path.dirname(handoff.package.file)+'/type-consumer-result.json';await writeFile(output,JSON.stringify(result,null,2));
console.log('PASS packed NodeNext and browser consumers; TypeScript '+result.compiler+'; '+output);
