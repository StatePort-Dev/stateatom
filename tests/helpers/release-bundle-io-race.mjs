// SPDX-License-Identifier: Apache-2.0
// Isolated real-filesystem interleavings; no production hook or fake stat value.
import fs from 'node:fs/promises';
import {watch} from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
import {randomBytes} from 'node:crypto';
import {prepareReleaseBundle} from '../../core/release-bundle.mjs';
const dir=await fs.mkdtemp('/tmp/stateatom-output-ownership-'),root=dir+'/built',outputFile=dir+'/release.zip',recipeFile=dir+'/recipe.json',c=new AbortController();await fs.mkdir(root);
await fs.writeFile(root+'/app.js','// '+randomBytes(1024*1024).toString('base64'));await fs.writeFile(root+'/app.map',JSON.stringify({version:3,sources:[],names:[],mappings:''}));await fs.writeFile(recipeFile,JSON.stringify({schema:'stateatom.release-bundle-recipe/1',releaseId:'synthetic',assets:[{asset:'app.js',sourceMap:'app.map'}]}));
const originalStat=fs.lstat,originalLink=fs.link;let phase=null,error;
fs.lstat=async function(file,...args){const s=await originalStat(file,...args);if(file===outputFile&&c.signal.aborted&&!phase){phase='real metadata becomes stale before cleanup';await fs.rename(outputFile,dir+'/own-moved.zip');await fs.writeFile(outputFile,'FOREIGN_REPLACEMENT',{flag:'wx',mode:0o600});}return s;};
fs.link=async function(source,destination){if(destination===outputFile&&!phase){phase='competing destination appears immediately before publication';await fs.writeFile(outputFile,'FOREIGN_REPLACEMENT',{flag:'wx',mode:0o600});}return originalLink(source,destination);};syncBuiltinESMExports();
const watcher=watch(dir,(_,name)=>{if(name==='release.zip')c.abort();});
try{await prepareReleaseBundle({root,recipeFile,outputFile,signal:c.signal});}catch(e){error={message:e.message,code:e.code??null};}
finally{watcher.close();fs.lstat=originalStat;fs.link=originalLink;syncBuiltinESMExports();}
const retained=await fs.readFile(outputFile).then(b=>b.equals(Buffer.from('FOREIGN_REPLACEMENT'))).catch(()=>false);
await fs.rm(dir,{recursive:true,force:true});console.log(JSON.stringify({phase,refused:!!error,error,foreignRetained:retained}));
