// SPDX-License-Identifier: Apache-2.0
// Isolated real filesystem schedule. Never fabricates lstat/read/stat results.
import fs from'node:fs/promises';import{syncBuiltinESMExports}from'node:module';import{createHash}from'node:crypto';
import{prepareReleaseBundle}from'../../core/release-bundle.mjs';import{readZip}from'../../core/source-map-archive.mjs';
const role=process.argv[2],level=process.argv[3]||'ancestor';if(!['js','map','companion'].includes(role)||!['ancestor','root'].includes(level))throw Error('Explicit input race role/level required');
const dir=await fs.mkdtemp('/tmp/stateatom-input-race-'),root=dir+'/root',outside=dir+'/outside',marker='SYNTHETIC_OUTSIDE_SELECTED_ROOT',map=content=>Buffer.from(JSON.stringify({version:3,sources:['logical/source.ts'],names:[],mappings:'AAAA',sourcesContent:[content]})),sha=b=>createHash('sha256').update(b).digest('hex');
await fs.mkdir(root+'/nested',{recursive:true});await fs.mkdir(outside+'/nested',{recursive:true});const asset=role==='js'?'nested/app.js':'app.js',sourceMap=role==='map'?'nested/app.map':'app.map',insideMap=map(role==='companion'?null:'INSIDE'),outsideMap=map(role==='companion'?null:marker);
for(const[base,js,mb]of[[root,'INSIDE',insideMap],[outside,marker,outsideMap]]){await fs.writeFile(base+'/'+asset,js);await fs.writeFile(base+'/'+sourceMap,mb);await fs.writeFile(base+'/nested/body.ts',base===root?'INSIDE':marker);}
const recipe={schema:'stateatom.release-bundle-recipe/'+(role==='companion'?'2':'1'),releaseId:'controlled-input-replacement',assets:[{asset,sourceMap}],...(role==='companion'?{companions:[{sourceMap,sourceMapSha256:sha(insideMap),sourceIndex:0,source:'logical/source.ts',file:'nested/body.ts'}]}:{})};await fs.writeFile(dir+'/recipe.json',JSON.stringify(recipe));
const watched=level==='root'?root:root+'/nested',original=fs.lstat;let swapped=false;
fs.lstat=async function(file,...args){const actual=await original(file,...args);if(file===watched&&!swapped){swapped=true;await fs.rename(watched,watched+'-original');await fs.symlink(level==='root'?outside:outside+'/nested',watched);}return actual;};syncBuiltinESMExports();let result;
try{await prepareReleaseBundle({root,recipeFile:dir+'/recipe.json',outputFile:dir+'/release.zip'});const files=await readZip(await fs.readFile(dir+'/release.zip'));result={role,level,swapped,producerSucceeded:true,escaped:[...files.values()].some(b=>Buffer.from(b).includes(Buffer.from(marker)))};}
catch(error){result={role,level,swapped,producerSucceeded:false,refused:error.message,outputAbsent:await fs.stat(dir+'/release.zip').then(()=>false,e=>e.code==='ENOENT')};}
finally{fs.lstat=original;syncBuiltinESMExports();await fs.rm(dir,{recursive:true,force:true});}console.log(JSON.stringify(result));
