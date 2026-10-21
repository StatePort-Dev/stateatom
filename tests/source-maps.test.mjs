import {storedZip} from './helpers/source-map-zip.mjs';
// SPDX-License-Identifier: Apache-2.0
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parseSourceMap,readSourceBundle,associateSourceMap,lookupSource,sourceExcerpt} from '../core/source-maps.mjs';
import {readZip} from '../core/source-map-archive.mjs';
const bytes=x=>new TextEncoder().encode(typeof x==='string'?x:JSON.stringify(x));
const sha=x=>createHash('sha256').update(x).digest('hex');
const raw={version:3,file:'app.js',sources:['src/Order.tsx'],names:['creditHold'],mappings:'AAAAA',sourcesContent:['const disabled = creditHold || !canConfirm;']};
const script={digest:sha(bytes('loaded code')),digestDomain:'utf8-script-source',startLine:0,startColumn:0,endLine:0,endColumn:11};
function bundle(map=raw,code='loaded code'){const mb=bytes(map),ab=bytes(code);return {mapBytes:mb,assetBytes:ab,asset:{asset:'app.js',assetSha256:sha(ab),sourceMap:'app.js.map',sourceMapSha256:sha(mb)},releaseId:'r1'};}
test('matching bytes and user-selected manifest establish artifact identity, never UI identity',async()=>{const r=await associateSourceMap(script,bundle());assert.equal(r.status,'Exact artifact match');const pos=lookupSource(r.parsed,1,0);assert.equal(pos.line,1);assert.equal(pos.column,0);assert.equal(pos.source,'src/Order.tsx');assert.match(pos.excerpt,/creditHold/);assert.equal(pos.link,'not linked to element');});
test('same name and different script bytes cannot establish an exact association',async()=>{assert.equal((await associateSourceMap(script,bundle(raw,'different code'))).status,'Mismatch');const b=bundle();b.mapBytes=bytes({...raw,sourcesContent:['changed']});assert.equal((await associateSourceMap(script,b)).status,'Mismatch');});
test('map alone is unverified; positions-only map has no invented excerpt',async()=>{const r=await associateSourceMap(script,{mapBytes:bytes(raw)});assert.equal(r.status,'Unverified');const p=await parseSourceMap(bytes({...raw,sourcesContent:undefined}));assert.equal(lookupSource(p,1,0).excerpt,null);assert.equal(lookupSource(p,1,0).name,'creditHold');});
test('strict validation rejects malformed VLQ, invalid source/name indices and section maps',async()=>{for(const mappings of ['!','g','ACAA','AADA','AAAAAC','AAAA,AAAA'])await assert.rejects(()=>parseSourceMap(bytes({...raw,mappings})));await assert.rejects(()=>parseSourceMap(bytes({version:3,sections:[]})),/Unsupported/);await assert.rejects(()=>parseSourceMap(bytes({...raw,sourcesContent:[{}]})));await assert.rejects(()=>parseSourceMap(bytes({...raw,mappings:'A'.repeat(2100000)})),/budget/i);});
test('sourceRoot and hostile original source names are inert metadata',async()=>{const p=await parseSourceMap(bytes({...raw,sourceRoot:'https://private.invalid/',sources:['<img onerror=alert(1)>'],sourcesContent:['<script>evil()</script>']}));assert.match(lookupSource(p,1,0).excerpt,/<script>/);assert.match(lookupSource(p,1,0).source,/<img/);});
// Small independent ZIP writer: stored entries; no filesystem extraction.
test('ZIP bundle carries a manifest/map/artifact without extraction or network',async()=>{const b=bundle(),zip=storedZip([['manifest.json',bytes({schemaVersion:1,releaseId:'r1',assets:[b.asset]})],['app.js',b.assetBytes],['app.js.map',b.mapBytes]]);const entries=await readSourceBundle(zip,'release.zip');assert.equal(entries.length,1);assert.equal((await associateSourceMap(script,entries[0])).status,'Exact artifact match');});
test('ZIP traversal, duplicate paths, symlinks, false sizes and CRC corruption fail closed',async()=>{for(const name of ['../escape.map','/root.map','C:/evil.map','a\\b.map','a/%2e%2e/b.map'])await assert.rejects(()=>readZip(storedZip([[name,bytes('x')]])));await assert.rejects(()=>readZip(storedZip([['x.map',bytes('x')],['x.map',bytes('y')]])));const corrupted=storedZip([['x.map',bytes('x')]]);corrupted[35]^=1;await assert.rejects(()=>readZip(corrupted));const bomb=storedZip([['x.map',bytes('x')]]);bomb.writeUInt32LE(20000000,22);bomb.writeUInt32LE(20000000,24+36);await assert.rejects(()=>readZip(bomb));});
test('deflated ZIP imports within budgets; symlink and expansion lies are rejected',async()=>{const valid=storedZip([['app.js.map',bytes(raw)]],true);assert.equal((await readZip(valid)).size,1);const link=storedZip([['x.map',bytes('x')]]);const central=30+5+1;link.writeUInt32LE((0xa1ff*65536)>>>0,central+38);await assert.rejects(()=>readZip(link),/Unsupported/);const lied=storedZip([['x.map',bytes('A'.repeat(100000))]],true);const offset=30+5+lied.readUInt32LE(18);lied.writeUInt32LE(1,22);lied.writeUInt32LE(1,offset+24);await assert.rejects(()=>readZip(lied),/expansion|size/i);});
test('duplicate original source names preserve the mapped source index and its content',async()=>{const p=await parseSourceMap(bytes({version:3,sources:['same.ts','same.ts'],names:[],mappings:'ACAA',sourcesContent:['wrong original','selected original']}));assert.equal(lookupSource(p,1,0).excerpt,'selected original');});
test('ordinary ZIP directory entries are inert and valid nested artifact files remain available',async()=>{const files=await readZip(storedZip([['assets/',''],['assets/app.js.map',bytes(raw)]]));assert.equal(files.has('assets/app.js.map'),true);assert.equal(files.has('assets/'),false);});
test('source excerpts use JavaScript line terminators and UTF-16 columns without borrowing the following line',()=>{
 const line='/*😀*/ function handler(){}';
 for(const separator of['\n','\r\n','\r','\u2028','\u2029']){
  const content='prefix'+separator+line+separator+'next';
  assert.equal(sourceExcerpt(content,2,7),line);assert.equal(sourceExcerpt(content,2,line.length),line);
  assert.equal(sourceExcerpt(content,2,line.length+1),null);assert.equal(sourceExcerpt(content,4,0),null);
  assert.equal(sourceExcerpt(content,3,0),'next');assert.equal(sourceExcerpt('x'+separator,2,0),'');assert.equal(sourceExcerpt('x'+separator,2,1),null);
 }
 assert.equal(sourceExcerpt('a\r\nb\rc\nd\u2028e\u2029f',6,0),'f');
 const long='😀'.repeat(100)+'tail';assert.equal(sourceExcerpt(long,1,200),'😀'.repeat(80)+'tail');
});
