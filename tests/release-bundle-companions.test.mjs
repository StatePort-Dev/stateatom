// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,stat,symlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {prepareReleaseBundle} from '../core/release-bundle.mjs';
import {readSourceBundle,associateSourceMap,lookupSource} from '../core/source-maps.mjs';
import {readZip} from '../core/source-map-archive.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
async function fixture(t){
 const dir=await mkdtemp('/tmp/stateatom-companions-');t.after(()=>rm(dir,{recursive:true,force:true}));const root=dir+'/input';await mkdir(root+'/assets',{recursive:true});await mkdir(root+'/provided');
 const map={version:3,file:'shared.js',sourceRoot:'https://invalid.example/MUST_NOT_FETCH/',sources:['../private/same.ts','../private/same.ts','embedded.ts','../../MUST_NOT_FOLLOW.ts'],names:['unused','handler'],mappings:'ACAAC',sourcesContent:[null,null,'const embedded=1;',null],x_owner:{flag:true}},mapBytes=Buffer.from(JSON.stringify(map)),content='\ufefffunction handler(){\r\nreturn "🔎";\r}\u2028globalThis.COMPANION_EFFECT++;\u2029';
 const bodies=new Map([['assets/a.js',Buffer.from('function a(){}')],['assets/b.js',Buffer.from('function b(){}')],['assets/shared.map',mapBytes],['provided/body.ts',Buffer.from(content)],['provided/empty.ts',Buffer.alloc(0)]]);
 for(const[n,b]of bodies)await writeFile(root+'/'+n,b);await writeFile(root+'/UNLISTED_PRIVATE.ts','UNLISTED_PRIVATE_TEXT');
 const recipe={schema:'stateatom.release-bundle-recipe/2',releaseId:'explicit-companions',assets:[{asset:'assets/a.js',sourceMap:'assets/shared.map'},{asset:'assets/b.js',sourceMap:'assets/shared.map'}],companions:[{sourceMap:'assets/shared.map',sourceMapSha256:sha(mapBytes),sourceIndex:1,source:map.sources[1],file:'provided/body.ts'}]},recipeFile=dir+'/recipe.json',outputFile=dir+'/release.zip';
 const save=()=>writeFile(recipeFile,JSON.stringify(recipe)),prepare=async()=>{await save();return prepareReleaseBundle({root,recipeFile,outputFile});};return{dir,root,map,mapBytes,content,bodies,recipe,recipeFile,outputFile,save,prepare};
}
test('explicit companions enrich only selected missing indices and bind new output-map hashes without changing inputs',async t=>{
 const f=await fixture(t);globalThis.COMPANION_EFFECT=0;t.after(()=>delete globalThis.COMPANION_EFFECT);const receipt=await f.prepare(),files=await readZip(await readFile(f.outputFile)),actual=JSON.parse(new TextDecoder().decode(files.get('assets/shared.map'))),manifest=JSON.parse(new TextDecoder().decode(files.get('manifest.json')));
 assert.deepEqual(actual,{...f.map,sourcesContent:[null,f.content,'const embedded=1;',null]});assert.notEqual(sha(files.get('assets/shared.map')),sha(f.mapBytes));assert(manifest.assets.every(a=>a.sourceMapSha256===sha(files.get('assets/shared.map'))));
 assert.deepEqual([...files.keys()].sort(),['manifest.json','assets/a.js','assets/b.js','assets/shared.map'].sort());for(const[n,b]of f.bodies)assert.deepEqual(await readFile(f.root+'/'+n),b);assert.equal(globalThis.COMPANION_EFFECT,0);assert.equal((await stat(f.outputFile)).mode&0o077,0);
 assert.equal(receipt.companionSources.schema,'stateatom.source-enrichment-receipt/1');assert.equal(receipt.companionSources.maps.length,1);assert.deepEqual(receipt.companionSources.maps[0],{originalMapSha256:sha(f.mapBytes),enrichedMapSha256:sha(files.get('assets/shared.map')),sources:[{index:1,rawSourceSha256:sha(Buffer.from(f.content)),bytes:Buffer.byteLength(f.content)}]});assert(!/private|provided|COMPANION_EFFECT|input\//.test(JSON.stringify(receipt)));
 for(const b of await readSourceBundle(await readFile(f.outputFile),'release.zip')){const a=await associateSourceMap({digest:sha(b.assetBytes),digestDomain:'utf8-script-source',startLine:0,startColumn:0},b);assert.equal(a.status,'Exact artifact match');const p=lookupSource(a.parsed,1,0);assert.equal(p.sourceIndex,1);assert.equal(p.name,'handler');assert.match(p.excerpt,/handler/);assert.equal(a.parsed.sourcesContent[0],null);assert.equal(a.parsed.sourcesContent[3],null);}
});
test('explicit empty companion and absent sourcesContent preserve an empty string rather than invent other content',async t=>{
 const f=await fixture(t);delete f.map.sourcesContent;const original=Buffer.from(JSON.stringify(f.map));await writeFile(f.root+'/assets/shared.map',original);f.recipe.companions[0]={sourceMap:'assets/shared.map',sourceMapSha256:sha(original),sourceIndex:0,source:f.map.sources[0],file:'provided/empty.ts'};const r=await f.prepare(),b=(await readSourceBundle(await readFile(f.outputFile),'release.zip'))[0],a=await associateSourceMap({digest:sha(b.assetBytes),digestDomain:'utf8-script-source',startLine:0,startColumn:0},b);assert.deepEqual(a.parsed.sourcesContent,['',null,null,null]);assert.equal(r.companionSources.maps[0].sources[0].bytes,0);
});
async function refuses(f,pattern){await f.save();await assert.rejects(prepareReleaseBundle({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile}),pattern);await assert.rejects(stat(f.outputFile),{code:'ENOENT'});}
test('closed companion recipe fields, schema, counts and unique declarations refuse without output',async t=>{
 for(const change of[r=>delete r.companions,r=>r.companions=[],r=>r.companions='bad',r=>r.companions=Array(513).fill(r.companions[0]),r=>r.extra=true,r=>r.companions[0].extra=true,r=>delete r.companions[0].source,r=>r.companions.push({...r.companions[0]}),r=>r.schema='stateatom.release-bundle-recipe/1']){const f=await fixture(t);change(f.recipe);await refuses(f,/recipe|companion|duplicate/i);}
 const f=await fixture(t);await f.save();await writeFile(f.recipeFile,JSON.stringify(f.recipe).replace('"sourceIndex":1','"sourceIndex":0,"sourceIndex":1'));await assert.rejects(prepareReleaseBundle({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile}),/duplicate|recipe/i);await assert.rejects(stat(f.outputFile),{code:'ENOENT'});
});
test('exact original-map digest and source index plus name are required even for duplicate logical names',async t=>{
 for(const change of[c=>c.sourceMapSha256='0'.repeat(64),c=>c.sourceMapSha256=c.sourceMapSha256.toUpperCase(),c=>c.source='wrong.ts',c=>c.sourceIndex=3,c=>c.sourceIndex=-1,c=>c.sourceIndex=1.5,c=>c.sourceIndex=512,c=>c.sourceMap='assets/undeclared.map']){const f=await fixture(t);change(f.recipe.companions[0]);await refuses(f,/companion|digest|binding|mismatch/i);}
});
test('companions never replace existing string content including empty text',async t=>{
 for(const content of['','EXISTING_OWNER_SOURCE']){const f=await fixture(t);f.map.sourcesContent[1]=content;const bytes=Buffer.from(JSON.stringify(f.map));await writeFile(f.root+'/assets/shared.map',bytes);f.recipe.companions[0].sourceMapSha256=sha(bytes);await refuses(f,/replace.*existing/i);assert.deepEqual(await readFile(f.root+'/assets/shared.map'),bytes);}
});
test('only explicit regular safe local companion paths are read; roots and source names are inert',async t=>{
 for(const name of['../outside.ts','/absolute.ts','C:/outside.ts','provided/%2e%2e/secret.ts','provided\\body.ts','assets/a.js','assets/shared.map','manifest.json']){const f=await fixture(t);f.recipe.companions[0].file=name;await refuses(f,/path|role/i);}
 for(const kind of['file-link','directory-link','directory']){const f=await fixture(t);if(kind==='file-link'){await rm(f.root+'/provided/body.ts');await symlink(f.root+'/UNLISTED_PRIVATE.ts',f.root+'/provided/body.ts');}else if(kind==='directory-link'){await rm(f.root+'/provided',{recursive:true});await mkdir(f.dir+'/outside');await writeFile(f.dir+'/outside/body.ts','OUTSIDE');await symlink(f.dir+'/outside',f.root+'/provided');}else{await rm(f.root+'/provided/body.ts');await mkdir(f.root+'/provided/body.ts');}await refuses(f,/symlink|regular/i);}
});
test('invalid UTF-8 companion bytes and shadow map members refuse instead of canonicalizing ambiguity',async t=>{
 const f=await fixture(t);await writeFile(f.root+'/provided/body.ts',Buffer.from([0xff]));await refuses(f,/UTF-8.*companion/i);
 const g=await fixture(t),raw=Buffer.from(JSON.stringify(g.map).replace('"version":3','"version":3,"version":3'));await writeFile(g.root+'/assets/shared.map',raw);g.recipe.companions[0].sourceMapSha256=sha(raw);await refuses(g,/duplicate/i);
});
test('new source content and escaped enriched JSON obey existing content and raw-map caps',async t=>{
 const f=await fixture(t);await writeFile(f.root+'/provided/body.ts','x'.repeat(3*1024*1024));await refuses(f,/Source content budget/);
 const g=await fixture(t);await writeFile(g.root+'/provided/body.ts','\0'.repeat(800000));await refuses(g,/map size budget/i);
 const h=await fixture(t);await writeFile(h.root+'/provided/body.ts','x'.repeat(4*1024*1024+1));await refuses(h,/file size budget/i);
});
test('enrichment preserves aggregate expanded ZIP bound across many small original maps',async t=>{
 const f=await fixture(t);f.recipe.assets=[];f.recipe.companions=[];await writeFile(f.root+'/provided/large.ts','x'.repeat(2800000));for(let i=0;i<7;i++){const asset='assets/chunk'+i+'.js',sourceMap=asset+'.map';await writeFile(f.root+'/'+asset,'function chunk(){}');await writeFile(f.root+'/'+sourceMap,f.mapBytes);f.recipe.assets.push({asset,sourceMap});f.recipe.companions.push({sourceMap,sourceMapSha256:sha(f.mapBytes),sourceIndex:1,source:f.map.sources[1],file:'provided/large.ts'});}await refuses(f,/expansion budget/i);
});
test('reordering companion bindings or assets preserves deterministic ZIP and provenance without altering original maps',async t=>{
 const f=await fixture(t);f.recipe.companions.push({...f.recipe.companions[0],sourceIndex:0,file:'provided/empty.ts'});const a=await f.prepare(),bytes=await readFile(f.outputFile);f.recipe.companions.reverse();f.recipe.assets.reverse();const secondOutput=f.dir+'/again.zip';await f.save();const b=await prepareReleaseBundle({root:f.root,recipeFile:f.recipeFile,outputFile:secondOutput});assert.deepEqual(await readFile(secondOutput),bytes);assert.deepEqual(b.companionSources,a.companionSources);assert.deepEqual(await readFile(f.root+'/assets/shared.map'),f.mapBytes);
});
test('actual companion CLI receipt contains bounded digest provenance and never includes source text or selected paths',async t=>{
 const {execFileSync}=await import('node:child_process');const f=await fixture(t);await f.save();const raw=execFileSync(process.execPath,[path.resolve('scripts/prepare-source-bundle.mjs'),'--root',f.root,'--recipe',f.recipeFile,'--output',f.outputFile],{encoding:'utf8',stdio:['ignore','pipe','pipe']}),r=JSON.parse(raw);assert.equal(r.status,'PREPARED_NOT_ATTACHED');assert.equal(r.companionSources.maps.length,1);assert.equal(r.companionSources.maps[0].originalMapSha256,sha(f.mapBytes));assert.equal(r.sha256,sha(await readFile(f.outputFile)));assert(!raw.includes(f.dir));assert(!raw.includes(f.content));assert(!raw.includes(f.recipe.companions[0].source));assert(!raw.includes(f.recipe.companions[0].file));
});
