import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {validateRequest,safePath} from '../core/bridge.mjs';
test('bridge rejects Host Origin token commands and unpaired extensions',()=>{
 const cfg={port:47731,token:'a'.repeat(64),extension:'a'.repeat(32)};
 const good={host:'127.0.0.1:47731',origin:'chrome-extension://'+'a'.repeat(32),authorization:'Bearer '+'a'.repeat(64)};
 assert.equal(validateRequest(good,cfg,'analyze'),true);
 for(const h of [{host:'evil:47731'},{origin:'http://127.0.0.1:4173'},{origin:'chrome-extension://'+'b'.repeat(32)},{authorization:'Bearer nope'}])assert.throws(()=>validateRequest({...good,...h},cfg,'analyze'));
 assert.throws(()=>validateRequest(good,cfg,'shell'));
});
test('canonical workspace containment rejects traversal and symlink escape',async()=>{
 const dir=await mkdtemp(tmpdir()+'/xray-security-');
 try {await mkdir(dir+'/workspace');await writeFile(dir+'/outside.txt','outside');await writeFile(dir+'/workspace/good.js','ok');await symlink(dir+'/outside.txt',dir+'/workspace/link.js');
 assert.equal(await safePath(dir+'/workspace','good.js'),dir+'/workspace/good.js');
 for(const f of ['../outside.txt','/etc/passwd','link.js','%2e%2e/outside.txt']) await assert.rejects(safePath(dir+'/workspace',f));
 }finally{await rm(dir,{recursive:true,force:true});}
});
