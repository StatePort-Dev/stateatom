// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,stat,utimes,symlink,readdir} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {watch} from 'node:fs';
import {readZip} from '../core/source-map-archive.mjs';
import {readSourceBundle,associateSourceMap,lookupSource} from '../core/source-maps.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),encode=s=>Buffer.from(s),decode=b=>new TextDecoder('utf-8',{fatal:true}).decode(b);
async function producer(){let api;await assert.doesNotReject(async()=>{api=await import('../core/release-bundle.mjs');},'release-bundle producer must be available');assert.equal(typeof api.prepareReleaseBundle,'function');return api.prepareReleaseBundle;}
async function fixture(t){
 const dir=await mkdtemp('/tmp/stateatom-release-bundle-');t.after(()=>rm(dir,{recursive:true,force:true}));const root=path.join(dir,'built');await mkdir(path.join(root,'assets'),{recursive:true});
 const bodies=new Map([['assets/main.js',encode('\ufefffunction main(){return "🔎";}\n')],['assets/ленивый.js',encode('function lazy(){return 2;}')]]),assets=[];
 for(const [asset,body]of [...bodies]){const sourceMap=asset+'.map',map=encode(JSON.stringify({version:3,sources:['../../private/original.ts'],sourceRoot:'https://invalid.example/private/',names:[],mappings:'AAAA',sourcesContent:['globalThis.BUNDLE_MUST_NOT_RUN++; function handler(){}']}));bodies.set(sourceMap,map);assets.push({asset,sourceMap});await writeFile(path.join(root,asset),body);await writeFile(path.join(root,sourceMap),map);}
 await writeFile(path.join(root,'UNLISTED_PRIVATE.txt'),'UNLISTED_PRIVATE_BYTES');const recipe={schema:'stateatom.release-bundle-recipe/1',releaseId:'synthetic-release',assets},recipeFile=path.join(dir,'recipe.json'),outputFile=path.join(dir,'release.zip');await writeFile(recipeFile,JSON.stringify(recipe));return{dir,root,bodies,recipe,recipeFile,outputFile};
}
test('explicit built chunks produce a private compatible bundle with raw hashes and inert source metadata',async t=>{
 const f=await fixture(t),prepare=await producer();globalThis.BUNDLE_MUST_NOT_RUN=0;t.after(()=>delete globalThis.BUNDLE_MUST_NOT_RUN);
 const r=await prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile}),bytes=await readFile(f.outputFile),files=await readZip(bytes),manifest=JSON.parse(decode(files.get('manifest.json')));
 assert.equal(r.status,'PREPARED_NOT_ATTACHED');assert.equal(r.assets,2);assert.equal(r.bytes,bytes.length);assert.equal(r.sha256,sha(bytes));assert.equal((await stat(f.outputFile)).mode&0o077,0);
 assert.deepEqual([...files.keys()].sort(),['manifest.json',...f.bodies.keys()].sort());assert.equal(manifest.schemaVersion,1);assert.equal(manifest.releaseId,f.recipe.releaseId);
 for(const a of manifest.assets){assert.equal(a.assetSha256,sha(f.bodies.get(a.asset)));assert.equal(a.sourceMapSha256,sha(f.bodies.get(a.sourceMap)));assert.deepEqual(Buffer.from(files.get(a.asset)),f.bodies.get(a.asset));}
 const bundles=await readSourceBundle(bytes,'release.zip');assert.equal(bundles.length,2);
 for(const b of bundles){const decoded=encode(decode(b.assetBytes));if(b.asset.asset==='assets/main.js')assert.notEqual(sha(decoded),b.asset.assetSha256);const a=await associateSourceMap({digest:sha(decoded),digestDomain:'utf8-script-source',startLine:0,startColumn:0},b);assert.equal(a.status,'Exact artifact match');assert.match(lookupSource(a.parsed,1,0).excerpt,/BUNDLE_MUST_NOT_RUN/);}
 assert.equal(globalThis.BUNDLE_MUST_NOT_RUN,0);
});
test('recipe order and file mtimes do not change bundle bytes in the recorded Node environment',async t=>{
 const f=await fixture(t),prepare=await producer();await prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile});const a=await readFile(f.outputFile);f.recipe.assets.reverse();await writeFile(f.recipeFile,JSON.stringify(f.recipe));for(const n of f.bodies.keys())await utimes(path.join(f.root,n),new Date(0),new Date(0));
 const outputFile=path.join(f.dir,'again.zip');await prepare({root:f.root,recipeFile:f.recipeFile,outputFile});assert.deepEqual(await readFile(outputFile),a);
});
async function rewrite(f){await writeFile(f.recipeFile,JSON.stringify(f.recipe));}
async function refuses(f,pattern,options={}){const prepare=await producer();await assert.rejects(prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile,...options}),pattern);await assert.rejects(stat(f.outputFile),{code:'ENOENT'});}
test('closed unique-member recipes reject missing, extra, ambiguous and invalid declarations without output',async t=>{
 for(const change of[r=>r.schema='other',r=>r.extra=true,r=>r.releaseId='',r=>r.assets=[],r=>r.assets='not an array',r=>r.assets[0].extra=true,r=>r.assets.push(r.assets[0])]){const f=await fixture(t);change(f.recipe);await rewrite(f);await refuses(f,/recipe|release|asset|Duplicate/i);}
 const f=await fixture(t);await writeFile(f.recipeFile,JSON.stringify(f.recipe).replace('"releaseId":','"releaseId":"shadow","releaseId":'));await refuses(f,/recipe|Duplicate/i);
 const huge=await fixture(t);await writeFile(huge.recipeFile,' '.repeat(128*1024+1));await refuses(huge,/recipe.*budget/i);
});
test('unsafe artifact paths and artifact/map/manifest role collisions refuse before writing',async t=>{
 for(const name of['../outside.js','/absolute.js','C:/drive.js','a\\b.js','a/%2e%2e/b.js','./assets/main.js','manifest.json']){const f=await fixture(t);await writeFile(path.join(f.dir,'outside.js'),'OUTSIDE_PRIVATE');await writeFile(path.join(f.root,'manifest.json'),'MANIFEST_COLLISION');f.recipe.assets[0].asset=name;await rewrite(f);await refuses(f,/path|reserved|manifest/i);}
 const f=await fixture(t);f.recipe.assets[0].sourceMap=f.recipe.assets[1].asset;await rewrite(f);await refuses(f,/role|conflict|artifact/i);
});
test('symlink files and intermediate directories and nonregular files cannot escape the selected root',async t=>{
 for(const kind of['file','directory','nonregular']){const f=await fixture(t),target=path.join(f.root,'assets/main.js');if(kind==='file'){await rm(target);await symlink(path.join(f.root,'assets/ленивый.js'),target);}else if(kind==='directory'){const outside=path.join(f.dir,'linked');await mkdir(outside);for(const[n,b]of f.bodies)await writeFile(path.join(outside,path.basename(n)),b);await rm(path.join(f.root,'assets'),{recursive:true});await symlink(outside,path.join(f.root,'assets'));}else{await rm(target);await mkdir(target);}await refuses(f,/symlink|regular|symbolic/i);}
});
test('invalid UTF-8, malformed or indexed maps fail; no sourceRoot or sources path is followed',async t=>{
 for(const [name,value]of[['assets/main.js',Buffer.from([0xff])],['assets/main.js.map',Buffer.from([0xff])],['assets/main.js.map',Buffer.from('{invalid')],['assets/main.js.map',encode(JSON.stringify({version:3,sections:[]}))],['assets/main.js.map',encode(JSON.stringify({version:3,sources:[],names:[],mappings:'!'}))]]){const f=await fixture(t);await writeFile(path.join(f.root,name),value);await refuses(f,/UTF-8|source map|JSON|VLQ/i);}
 const f=await fixture(t),m=JSON.parse(decode(f.bodies.get('assets/main.js.map')));delete m.sourcesContent;await writeFile(path.join(f.root,'assets/main.js.map'),JSON.stringify(m));const prepare=await producer();await prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile});const b=(await readSourceBundle(await readFile(f.outputFile),'release.zip')).find(b=>b.asset.asset==='assets/main.js'),r=await associateSourceMap({digest:sha(encode(decode(b.assetBytes))),digestDomain:'utf8-script-source',startLine:0,startColumn:0},b);assert.equal(r.status,'Exact artifact match');assert.equal(lookupSource(r.parsed,1,0).excerpt,null);
});
test('per-file and expanded archive budgets cannot be bypassed by highly compressible artifacts',async t=>{
 const f=await fixture(t);await writeFile(path.join(f.root,'assets/main.js'),'x'.repeat(4*1024*1024+1));await refuses(f,/file.*budget|entry.*budget/i);
 const g=await fixture(t);g.recipe.assets=[];const body='x'.repeat(3.5*1024*1024);for(let i=0;i<5;i++){const asset='assets/large'+i+'.js';await writeFile(path.join(g.root,asset),body);g.recipe.assets.push({asset,sourceMap:'assets/main.js.map'});}await rewrite(g);await refuses(g,/expansion|expanded|archive.*budget/i);
});
test('compressed ZIP limit remains enforced for large incompressible UTF-8 inputs',async t=>{
 const f=await fixture(t);f.recipe.assets=[];for(let i=0;i<3;i++){const asset='assets/random'+i+'.js';await writeFile(path.join(f.root,asset),'// '+randomBytes(3*1024*1024-100).toString('base64'));f.recipe.assets.push({asset,sourceMap:'assets/main.js.map'});}await rewrite(f);await refuses(f,/archive.*budget|bundle.*budget/i);
});
test('64 distinct pairs exceed 128 entries; a shared explicit map preserves all64 assets',async t=>{
 const f=await fixture(t);f.recipe.assets=[];for(let i=0;i<64;i++){const asset='assets/chunk'+i+'.js',sourceMap=asset+'.map';await writeFile(path.join(f.root,asset),'function chunk(){}');await writeFile(path.join(f.root,sourceMap),f.bodies.get('assets/main.js.map'));f.recipe.assets.push({asset,sourceMap});}await rewrite(f);await refuses(f,/entry|entries|directory.*budget/i);
 for(const a of f.recipe.assets)a.sourceMap='assets/main.js.map';await rewrite(f);const prepare=await producer(),r=await prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile});assert.equal(r.assets,64);assert.equal((await readZip(await readFile(f.outputFile))).size,66);assert.equal((await readSourceBundle(await readFile(f.outputFile),'release.zip')).length,64);
});
test('cancellation before and after starting leaves no output; existing output and its target remain unchanged',async t=>{
 const prepare=await producer();for(const when of['before','after-start']){const f=await fixture(t),c=new AbortController();if(when==='before')c.abort();const job=prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile,signal:c.signal});if(when==='after-start')queueMicrotask(()=>c.abort());await assert.rejects(job,/cancel/i);await assert.rejects(stat(f.outputFile),{code:'ENOENT'});}
 const f=await fixture(t);await writeFile(f.outputFile,'EXISTING_PRIVATE');await assert.rejects(prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile}),{code:'EEXIST'});assert.equal(await readFile(f.outputFile,'utf8'),'EXISTING_PRIVATE');const outputFile=path.join(f.dir,'link.zip');await symlink(f.outputFile,outputFile);await assert.rejects(prepare({root:f.root,recipeFile:f.recipeFile,outputFile}),{code:'EEXIST'});assert.equal(await readFile(f.outputFile,'utf8'),'EXISTING_PRIVATE');
 const missing=path.join(f.dir,'missing','release.zip');await assert.rejects(prepare({root:f.root,recipeFile:f.recipeFile,outputFile:missing}),{code:'ENOENT'});await assert.rejects(stat(path.dirname(missing)),{code:'ENOENT'});
});
test('unpaired Unicode path surrogates cannot create a manifest/ZIP filename disagreement',async t=>{
 const f=await fixture(t);f.recipe.assets[0].asset='assets/\ud800.js';await writeFile(path.join(f.root,f.recipe.assets[0].asset),'function changed(){}');await rewrite(f);await refuses(f,/path|Unicode/i);
});
test('real cancellation on private staging creation leaves neither public output nor staging data',async t=>{
 const f=await fixture(t),prepare=await producer(),c=new AbortController();await writeFile(path.join(f.root,'assets/main.js'),'// '+randomBytes(1024*1024).toString('base64'));let observed=false;
 const watcher=watch(f.dir,(_,name)=>{if(String(name).startsWith('.stateatom-source-')){observed=true;c.abort();}});t.after(()=>watcher.close());
 await assert.rejects(prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile,signal:c.signal}),/cancel/i);assert.equal(observed,true);await assert.rejects(stat(f.outputFile),{code:'ENOENT'});assert.deepEqual((await readdir(f.dir)).sort(),['built','recipe.json']);
});
test('a competing destination survives the real stale-metadata or publication interleaving',()=>{
 const r=JSON.parse(execFileSync(process.execPath,[path.resolve('tests/helpers/release-bundle-io-race.mjs')],{encoding:'utf8',stdio:['ignore','pipe','pipe']}));assert(r.phase);assert.equal(r.refused,true);assert.equal(r.foreignRetained,true);
});
test('the public output first appears complete; cancellation after publication preserves the completed artifact',async t=>{
 const f=await fixture(t),prepare=await producer(),c=new AbortController();await writeFile(path.join(f.root,'assets/main.js'),'// '+randomBytes(1024*1024).toString('base64'));let visible;
 const watcher=watch(f.dir,(_,name)=>{if(name==='release.zip'&&!visible){visible=readFile(f.outputFile).then(readZip).then(files=>({count:files.size}),error=>({error:error.message}));c.abort();}});t.after(()=>watcher.close());
 let receipt;await assert.doesNotReject(async()=>{receipt=await prepare({root:f.root,recipeFile:f.recipeFile,outputFile:f.outputFile,signal:c.signal});});assert(visible);assert.deepEqual(await visible,{count:5});assert.equal(receipt.status,'PREPARED_NOT_ATTACHED');assert.equal(receipt.cleanup.status,'Complete');assert.equal(receipt.sha256,sha(await readFile(f.outputFile)));assert.deepEqual((await readdir(f.dir)).sort(),['built','recipe.json','release.zip']);
});
test('actual CLI writes a bounded receipt and refuses existing output or ambiguous usage',async t=>{
 const f=await fixture(t),cli=path.resolve('scripts/prepare-source-bundle.mjs'),args=['--root',f.root,'--recipe',f.recipeFile,'--output',f.outputFile];let output;
 assert.doesNotThrow(()=>{output=execFileSync(process.execPath,[cli,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']});});const r=JSON.parse(output);assert.equal(r.status,'PREPARED_NOT_ATTACHED');assert.equal(r.assets,2);assert.equal(r.sha256,sha(await readFile(f.outputFile)));assert(!output.includes(f.dir));
 assert.throws(()=>execFileSync(process.execPath,[cli,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}),e=>{assert.equal(e.status,1);assert.match(e.stderr,/Output exists/);return true;});assert.equal(sha(await readFile(f.outputFile)),r.sha256);
 assert.match(execFileSync(process.execPath,[cli,'--help'],{encoding:'utf8'}),/--root.*--recipe.*--output/s);
 for(const bad of[[],['--root'],['--unknown','value'],['--help','extra'],[...args,'--root',f.root]])assert.throws(()=>execFileSync(process.execPath,[cli,...bad],{encoding:'utf8',stdio:['ignore','pipe','pipe']}),e=>{assert.equal(e.status,1);assert.match(e.stderr,/Usage/);return true;});
});
