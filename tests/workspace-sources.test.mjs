// SPDX-License-Identifier: Apache-2.0
// Real synthetic filesystem inputs, not installed-helper/browser qualification.
import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import {readdirSync,readlinkSync,renameSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {readWorkspaceSources} from '../core/workspace-sources.mjs';
async function fixture(t){const root=await mkdtemp('/tmp/atom-workspace-sources-');t.after(()=>rm(root,{recursive:true,force:true}));await mkdir(root+'/src');return{root,async file(name,text='export const value = 1;'){await mkdir(path.dirname(root+'/'+name),{recursive:true});await writeFile(root+'/'+name,text);}};}
test('selected candidate precedes160 unrelated files and duplicates consume no budget',async t=>{
 const f=await fixture(t);for(let i=0;i<160;i++)await f.file('src/a'+i+'.js');await f.file('src/zz/Selected.vue','<template><button disabled>Original</button></template>');
 const files=await readWorkspaceSources(f.root,'src',{priorityFiles:['src/zz/Selected.vue','src/zz/Selected.vue']});assert.equal(files.length,160);assert.equal(files[0].file,'src/zz/Selected.vue');assert.equal(new Set(files.map(f=>f.file)).size,160);assert.equal(files[0].text,'<template><button disabled>Original</button></template>');
});
test('priority and background share the existing total UTF8 byte budget without truncation',async t=>{
 const f=await fixture(t),priority=[];for(let i=0;i<7;i++){const file='src/'+i+'.ts';priority.push(file);await f.file(file,'Ж'.repeat(128000));}priority.push('src/rest.ts');await f.file('src/rest.ts','r'.repeat(208000));await f.file('src/extra.ts','x');
 const files=await readWorkspaceSources(f.root,'src',{priorityFiles:priority});assert.equal(files.length,8);assert.equal(files.reduce((n,f)=>n+Buffer.byteLength(f.text),0),2000000);assert(!files.some(f=>f.file==='src/extra.ts'));assert(files.every(f=>Buffer.byteLength(f.text)<=256000));
});
test('oversized priority file stays absent instead of truncated into a known source',async t=>{
 const f=await fixture(t);await f.file('src/huge.js','x'.repeat(256001));await f.file('src/current.js','original');const files=await readWorkspaceSources(f.root,'src',{priorityFiles:['src/huge.js']});assert.deepEqual(files,[{file:'src/current.js',text:'original'}]);
});
test('more than160 distinct candidate files still respects the shared file budget',async t=>{
 const f=await fixture(t),priority=[];for(let i=0;i<162;i++){const file='src/f'+i+'.js';priority.push(file);await f.file(file);}const files=await readWorkspaceSources(f.root,'src',{priorityFiles:priority});assert.equal(files.length,160);assert.deepEqual(files.map(f=>f.file),priority.slice(0,160));
});
test('candidate paths cannot escape the mapped subtree or original excluded directories',async t=>{
 const f=await fixture(t);await f.file('outside.js');for(const dir of ['node_modules','.git','dist','artifacts'])await f.file('src/'+dir+'/hidden.js');await f.file('src/.env','private');const files=await readWorkspaceSources(f.root,'src',{priorityFiles:['outside.js',...['node_modules','.git','dist','artifacts'].map(d=>'src/'+d+'/hidden.js'),'src/.env','../outside.js','%2e%2e/outside.js','src\\outside.js','/etc/passwd','src//hidden.js','src/./hidden.js','x'.repeat(1025)+'.js']});assert.deepEqual(files,[]);
});
test('inside and outside leaf/ancestor symlinks do not bypass candidate scope',async t=>{
 const f=await fixture(t);await f.file('outside.js','outside');await f.file('src/real/good.js','inside');await symlink(f.root+'/outside.js',f.root+'/src/out.js');await symlink(f.root+'/src/real/good.js',f.root+'/src/in.js');await symlink(f.root+'/src/real',f.root+'/src/alias');await symlink(f.root,f.root+'/src/outer');const files=await readWorkspaceSources(f.root,'src',{priorityFiles:['src/out.js','src/in.js','src/alias/good.js','src/outer/outside.js']});assert.deepEqual(files,[{file:'src/real/good.js',text:'inside'}]);
});
test('a FIFO with a source suffix is never opened as source or allowed to block analysis',{skip:process.platform==='win32'},async t=>{
 const f=await fixture(t);execFileSync('mkfifo',[f.root+'/src/pipe.js']);assert.deepEqual(await readWorkspaceSources(f.root,'src',{priorityFiles:['src/pipe.js']}),[]);
});
test('trust revoked across awaited metadata refuses the source result',async t=>{
 const f=await fixture(t);await f.file('src/secret.js');let allowed=true;const pending=readWorkspaceSources(f.root,'src',{priorityFiles:['src/secret.js'],isAllowed:()=>{if(allowed)queueMicrotask(()=>{allowed=false;});return allowed;}});await assert.rejects(pending,/trust|workspace|revoked/i);
});
test('Linux descriptor probe: trust revoked after opening closes the acquired descriptor before rejecting',{skip:process.platform!=='linux'},async t=>{
 const f=await fixture(t);await f.file('src/revoked.js');let revoked=false;
 const descriptors=()=>readdirSync('/proc/self/fd').filter(fd=>{try{return readlinkSync('/proc/self/fd/'+fd)===f.root+'/src/revoked.js';}catch{return false;}});
 const isAllowed=()=>{if(descriptors().length)revoked=true;return !revoked;};
 await assert.rejects(readWorkspaceSources(f.root,'src',{priorityFiles:['src/revoked.js'],isAllowed}),/trust|workspace|revoked/i);assert.equal(revoked,true);assert.deepEqual(descriptors(),[]);
});
test('Linux descriptor probe: replacing an opened file cannot publish its old descriptor as current source',{skip:process.platform!=='linux'},async t=>{
 const f=await fixture(t);await f.file('src/current.js','old original');await f.file('replacement.tmp','new original');let replaced=false;
 const isAllowed=()=>{if(!replaced){const open=readdirSync('/proc/self/fd').some(fd=>{try{return readlinkSync('/proc/self/fd/'+fd)===f.root+'/src/current.js';}catch{return false;}});if(open){replaced=true;renameSync(f.root+'/src/current.js',f.root+'/retained-old.tmp');renameSync(f.root+'/replacement.tmp',f.root+'/src/current.js');}}return true;};
 const files=await readWorkspaceSources(f.root,'src',{priorityFiles:['src/current.js'],isAllowed});assert.equal(replaced,true);assert(files.every(f=>f.text!=='old original'));assert(files.every(f=>f.file==='src/current.js'&&f.text==='new original'));
});
