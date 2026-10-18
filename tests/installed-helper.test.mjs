// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const module=await import('../scripts/installed-helper.mjs').catch(error=>{if(error.code!=='ERR_MODULE_NOT_FOUND')throw error;return {};});
const digest=text=>createHash('sha256').update(text).digest('hex');
// Removing the path containment or bundle comparison would accept the development
// helper (or different installed bytes) as the reviewed VSIX. These are real files.
test('installed acceptance binds the actual loaded helper to reviewed package bytes inside its isolated extensions directory',async()=>{
 assert.equal(typeof module.verifyInstalledHelper,'function','installed helper verifier missing');
 const root=await mkdtemp(join(tmpdir(),'stateatom-installed-'));try{
  const dir=join(root,'extensions'),ext=join(dir,'local-research.stateatom-dev-helper-0.1.0');await mkdir(ext,{recursive:true});
  const pkg={publisher:'local-research',name:'stateatom-dev-helper',version:'0.1.0',main:'./extension.cjs',license:'(MIT AND Apache-2.0)'};
  await writeFile(join(ext,'package.json'),JSON.stringify(pkg));await writeFile(join(ext,'extension.cjs'),'reviewed bundle');
  const expected={id:'local-research.stateatom-dev-helper',version:'0.1.0',main:'extension.cjs',bundleSha256:digest('reviewed bundle'),packageSha256:digest(JSON.stringify(pkg))};
  const actual=await module.verifyInstalledHelper({extensionPath:ext,extensionsDir:dir,expected});assert.equal(actual.id,expected.id);assert.equal(actual.bundleSha256,expected.bundleSha256);
  await writeFile(join(ext,'extension.cjs'),'different bundle');await assert.rejects(module.verifyInstalledHelper({extensionPath:ext,extensionsDir:dir,expected}),/bundle/i);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('installed acceptance refuses outside or symlinked development helper and changed entry metadata',async()=>{
 assert.equal(typeof module.verifyInstalledHelper,'function','installed helper verifier missing');
 const root=await mkdtemp(join(tmpdir(),'stateatom-installed-'));try{
  const dir=join(root,'extensions'),outside=join(root,'dev');await mkdir(dir);await mkdir(outside);
  const pkg={publisher:'local-research',name:'stateatom-dev-helper',version:'0.1.0',main:'./extension.cjs'};await writeFile(join(outside,'package.json'),JSON.stringify(pkg));await writeFile(join(outside,'extension.cjs'),'reviewed bundle');
  const expected={id:'local-research.stateatom-dev-helper',version:'0.1.0',main:'extension.cjs',bundleSha256:digest('reviewed bundle'),packageSha256:digest(JSON.stringify(pkg))};
  await assert.rejects(module.verifyInstalledHelper({extensionPath:outside,extensionsDir:dir,expected}),/directory/i);
  await symlink(outside,join(dir,'helper'));await assert.rejects(module.verifyInstalledHelper({extensionPath:join(dir,'helper'),extensionsDir:dir,expected}),/directory/i);
  const ext=join(dir,'installed');await mkdir(ext);await writeFile(join(ext,'package.json'),JSON.stringify({...pkg,main:'../dev/extension.cjs'}));await writeFile(join(ext,'extension.cjs'),'reviewed bundle');
  await assert.rejects(module.verifyInstalledHelper({extensionPath:ext,extensionsDir:dir,expected}),/package|metadata|entry/i);
 }finally{await rm(root,{recursive:true,force:true});}
});
// VS Code rewrites formatting and adds __metadata during real VSIX installation.
// Ignoring arbitrary packaged fields would hide entry changes; comparing raw
// package bytes would reject this legitimate install transformation.
test('installer-only metadata and formatting do not substitute the packaged manifest or executable',async()=>{
 assert.equal(typeof module.verifyInstalledHelper,'function');const root=await mkdtemp(join(tmpdir(),'stateatom-installed-'));try{
  const dir=join(root,'extensions'),ext=join(dir,'helper');await mkdir(ext,{recursive:true});
  const pkg={publisher:'local-research',name:'stateatom-dev-helper',version:'0.1.0',main:'./extension.cjs'};
  const expected={id:'local-research.stateatom-dev-helper',version:'0.1.0',main:'extension.cjs',bundleSha256:digest('reviewed bundle'),packageSha256:digest(JSON.stringify(pkg)),packageManifest:pkg};
  await writeFile(join(ext,'package.json'),JSON.stringify({...pkg,__metadata:{source:'vsix',installedTimestamp:123}},null,2));await writeFile(join(ext,'extension.cjs'),'reviewed bundle');
  const actual=await module.verifyInstalledHelper({extensionPath:ext,extensionsDir:dir,expected});assert.equal(actual.bundleSha256,expected.bundleSha256);assert.equal(actual.packagedManifestMatched,true);
  await writeFile(join(ext,'package.json'),JSON.stringify({...pkg,activationEvents:['*'],__metadata:{source:'vsix'}}));await assert.rejects(module.verifyInstalledHelper({extensionPath:ext,extensionsDir:dir,expected}),/metadata|package|manifest/i);
 }finally{await rm(root,{recursive:true,force:true});}
});
