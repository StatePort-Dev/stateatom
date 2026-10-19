// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,access} from 'node:fs/promises';
import {assertImmutableArtifact,inspectInstalledPair,verifyArtifactHashes,stageCandidate} from '../../scripts/atom-package-receipt.mjs';

const expected={atomVersion:'1.0.0-test.1',uiVersion:'2.0.0-test.1',apiVersion:1,wireVersion:1,uiContract:'2.1.0'};
async function fixture(t){
 const base=await mkdtemp('/tmp/atom-receipt-test-');t.after(()=>rm(base,{recursive:true,force:true}));
 const atom=base+'/node_modules/@stateport/atom',ui=base+'/node_modules/@stateport/extension-ui';await mkdir(atom+'/dist',{recursive:true});await mkdir(ui+'/assets/fonts',{recursive:true});
 const atomPkg={name:'@stateport/atom',version:expected.atomVersion,peerDependencies:{'@stateport/extension-ui':expected.uiVersion},exports:{}};
 const uiPkg={name:'@stateport/extension-ui',version:expected.uiVersion,exports:{}};
 for(const entry of ['runtime','ui','platform','transport']){atomPkg.exports['./'+entry]={types:'./dist/'+entry+'.d.ts',default:'./dist/'+entry+'.mjs'};await writeFile(atom+'/dist/'+entry+'.mjs','export {};');await writeFile(atom+'/dist/'+entry+'.d.ts','export {};');}
 for(const file of ['atom.css','content.js','reader.js','reader.html','reader.css','contract.json']){atomPkg.exports['./'+file]='./'+file;await writeFile(atom+'/'+file,'fixture');}
 for(const file of ['tokens.css','components.css','fonts.css','contract.json','assets/fonts/InterVariable.woff2']){uiPkg.exports['./'+file]='./'+file;await writeFile(ui+'/'+file,'fixture');}
 await writeFile(atom+'/package.json',JSON.stringify(atomPkg));await writeFile(ui+'/package.json',JSON.stringify(uiPkg));
 await writeFile(atom+'/contract.json',JSON.stringify({apiVersion:1,wireVersion:1,uiContract:expected.uiContract,uiPackage:expected.uiVersion}));await writeFile(ui+'/contract.json',JSON.stringify({uiContractVersion:expected.uiContract}));
 for(const dir of [atom,ui])for(const file of ['LICENSE','NOTICE'])await writeFile(dir+'/'+file,'preserved notice');
 await mkdir(atom+'/LICENSES');await writeFile(atom+'/LICENSES/Apache-2.0.txt','notice');await writeFile(atom+'/dist/THIRD_PARTY_LICENSES.md','notice');await writeFile(ui+'/assets/fonts/Inter-LICENSE.txt','notice');
 return{base,atom,ui,atomPkg,uiPkg};
}
test('installed pair distinguishes versions and resolves all exports and declarations inside consumer',async t=>{const {base}=await fixture(t);const r=await inspectInstalledPair(base,expected);assert.equal(r.atomVersion,expected.atomVersion);assert.equal(r.uiVersion,expected.uiVersion);assert.equal(r.uiContract,'2.1.0');assert(r.files['@stateport/atom/dist/runtime.d.ts']);});
test('manifest key order does not change byte identity',async t=>{const {base}=await fixture(t),r=await inspectInstalledPair(base,expected);await inspectInstalledPair(base,{...expected,files:Object.fromEntries(Object.entries(r.files).reverse())});});
for(const [label,mutate,pattern] of [
 ['wrong UI peer',async f=>{f.atomPkg.peerDependencies['@stateport/extension-ui']='2.0.0-old';await writeFile(f.atom+'/package.json',JSON.stringify(f.atomPkg));},/peer/i],
 ['old contract',f=>writeFile(f.atom+'/contract.json',JSON.stringify({apiVersion:0,wireVersion:0})),/contract/i],
 ['missing export',async f=>{delete f.atomPkg.exports['./reader.js'];await writeFile(f.atom+'/package.json',JSON.stringify(f.atomPkg));},/export/i],
 ['missing asset',f=>rm(f.ui+'/assets/fonts/InterVariable.woff2'),/ENOENT|asset/i],
 ['stale declarations',f=>writeFile(f.atom+'/dist/runtime.d.ts','export type Stale = true;'),/digest/i]
])test('reject '+label,async t=>{const f=await fixture(t),before=await inspectInstalledPair(f.base,expected);await mutate(f);await assert.rejects(inspectInstalledPair(f.base,{...expected,files:before.files}),pattern);});
test('wrong artifact hash is refused before consumer installation',async t=>{const f=await fixture(t);await assert.rejects(verifyArtifactHashes([{file:f.atom+'/package.json',sha256:'0'.repeat(64)}]),/digest/i);});
test('same identity allows exact reproduction but refuses different bytes, preserving original',async t=>{const f=await fixture(t),dir=f.base+'/issued';await mkdir(dir+'/old',{recursive:true});await writeFile(dir+'/old/atom-1.0.0.tgz','original');await assertImmutableArtifact([dir],'atom-1.0.0.tgz',Buffer.from('original'));await assert.rejects(assertImmutableArtifact([dir],'atom-1.0.0.tgz',Buffer.from('changed')),/identity/i);});
test('rejected staging cannot poison restoration of already issued bytes',async t=>{
 const f=await fixture(t),parent=f.base+'/issued';await mkdir(parent+'/accepted',{recursive:true});await writeFile(parent+'/accepted/atom.tgz','original');
 const stage=await stageCandidate(parent,'rejected');await writeFile(stage.directory+'/atom.tgz','changed');
 await assert.rejects(access(stage.finalDirectory),{code:'ENOENT'});
 await assert.rejects(assertImmutableArtifact([parent],'atom.tgz',Buffer.from('changed')),/identity/i);
 await assertImmutableArtifact([parent],'atom.tgz',Buffer.from('original'));
 const accepted=await stageCandidate(parent,'reproduction');await writeFile(accepted.directory+'/atom.tgz','original');await accepted.promote();
 await access(accepted.finalDirectory+'/atom.tgz');await assertImmutableArtifact([parent],'atom.tgz',Buffer.from('original'));
});
