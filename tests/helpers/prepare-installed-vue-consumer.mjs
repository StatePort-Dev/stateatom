// SPDX-License-Identifier: Apache-2.0
// Private installed-package preparation, not independent application acceptance.
import assert from 'node:assert/strict';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,open,realpath} from 'node:fs/promises';
import {sha256,fileManifest} from '../../scripts/atom-package-receipt.mjs';

const [handoffFile,dependencyFile]=process.argv.slice(2);
assert.equal(process.argv.length,4,'Exact development handoff and original prepared dependency receipt required');
const h=JSON.parse(await readFile(handoffFile)),app=JSON.parse(await readFile(dependencyFile)).apps.find(a=>a.slug==='CorentinTh--it-tools');
assert.match(h.plugin.version,/^0\.1\.0-candidate\.20261021\.\d+$/,'Expected supplied local development candidate');
assert(app?.originalSourceAndLockFilesMatch);
for(const a of [h.plugin,h.helper])assert.equal(sha256(await readFile(a.file)),a.sha256);
for(const [f,hash]of Object.entries(h.sourceManifest))assert.equal(sha256(await readFile(f)),hash,f);
const node='/home/roman/.config/nvm/versions/node/v18.18.2/bin/node';
assert.equal(execFileSync(node,['--version'],{encoding:'utf8'}).trim(),'v18.18.2');
const npm=path.resolve(path.dirname(node),'../lib/node_modules/npm/bin/npm-cli.js');
assert.equal(execFileSync(node,[npm,'--version'],{encoding:'utf8'}).trim(),'9.8.1');
const out=path.resolve('.artifacts/v03/installed-vue-consumer/'+new Date().toISOString().replace(/[:.]/g,'-'));
const consumer=out+'/consumer';await mkdir(consumer,{recursive:true});
await writeFile(out+'/driver.mjs',await readFile(new URL(import.meta.url)));
for(const name of ['empty-user.npmrc','empty-global.npmrc'])await writeFile(out+'/'+name,'');
await writeFile(consumer+'/package.json',JSON.stringify({name:'stateatom-private-installed-vue-consumer',version:'0.0.0',private:true,type:'module',engines:{node:'18.18.2'},dependencies:{'@stateport/vite-plugin':'file:'+h.plugin.file,vite:'4.4.9'}},null,2));
const env={PATH:path.dirname(node)+':/usr/bin:/bin',LANG:'C.UTF-8',CI:'1',npm_config_userconfig:out+'/empty-user.npmrc',npm_config_globalconfig:out+'/empty-global.npmrc',npm_config_cache:out+'/npm-cache',npm_config_registry:'https://registry.npmjs.org'};
const args=[npm,'install','--ignore-scripts','--engine-strict','--no-audit','--no-fund','--save-exact'];
const result={schema:'stateatom.installed-vue-consumer/1',status:'RUNNING',startedAt:new Date().toISOString(),handoffFile,dependencyFile,artifacts:{plugin:h.plugin,helper:h.helper},consumer,node,nodeVersion:'18.18.2',npmVersion:'9.8.1',command:{executable:node,args,cwd:consumer,env},appRoot:app.workingCopy,applicationExecuted:false,checks:[]};
await writeFile(out+'/registration.json',JSON.stringify(result,null,2),{flag:'wx'});
const log=await open(out+'/npm-install.log','wx');
try{
  const child=spawn(node,args,{cwd:consumer,env,stdio:['ignore',log.fd,log.fd]});
  const timer=setTimeout(()=>child.kill('SIGTERM'),180000);
  const exit=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',(code,signal)=>resolve({code,signal}));}).finally(()=>clearTimeout(timer));
  result.installExit=exit;assert.deepEqual(exit,{code:0,signal:null});
  const installed=consumer+'/node_modules/@stateport/vite-plugin';
  const location=await realpath(installed);assert(location.startsWith(consumer+'/node_modules/'));
  const pkg=JSON.parse(await readFile(installed+'/package.json'));
  assert.equal(pkg.version,h.plugin.version);assert.equal(pkg.engines.node,'18.18.2 || >=24 <25');assert.equal(pkg.peerDependencies.vite,'4.4.9 || 7.3.7');
  assert.deepEqual(JSON.parse(await readFile(installed+'/dist/source-manifest.json')),h.sourceManifest);
  const installedFiles=await fileManifest(installed);result.installedPlugin={path:installed,realpath:location,version:pkg.version,files:installedFiles};
  for(const f of ['LICENSE','NOTICE','LICENSES/Apache-2.0.txt','README.md','dist/engine/plugin.mjs','dist/engine/observer.mjs'])assert(installedFiles[f],f);
  result.checks.push({name:'strict Node18 npm9 install of exact supplied plugin and Vite4 without lifecycle scripts',status:'PASS'});
  const probeFile=out+'/probe-installed-profile.mjs';
  const probe=`import assert from 'node:assert/strict';import{writeFile,mkdir}from'node:fs/promises';import{stateatomPlugin}from './consumer/node_modules/@stateport/vite-plugin/dist/engine/plugin.mjs';
const original=${JSON.stringify(app.workingCopy)},base=${JSON.stringify(out)},checks=[];const config={root:original,plugins:[{name:'vite:vue'}]};
assert.doesNotThrow(()=>stateatomPlugin({enabled:true,profile:'vue3',root:original}).configResolved(config));checks.push('exact installed tuple metadata admitted, not app runtime proof');
assert.throws(()=>stateatomPlugin({enabled:true,root:original}).configResolved(config),/default.*24.*7\\.3\\.7/);checks.push('default cannot use Vue tuple');
assert.throws(()=>stateatomPlugin({enabled:true,profile:'vue3'}).configResolved({root:original,plugins:[]}),/Vue.*plugin|plugin.*Vue/);checks.push('missing compiler plugin refused');
for(const [label,patch]of [['wrong-vite',{vite:'7.3.7',vue:'3.3.4'}],['wrong-vue',{vite:'4.4.9',vue:'3.5.44'}]]){const root=base+'/metadata-fixtures/'+label;await mkdir(root+'/node_modules/@vitejs/plugin-vue',{recursive:true});for(const [name,version]of Object.entries({...patch,'@vitejs/plugin-vue':'4.3.2'})){await mkdir(root+'/node_modules/'+name,{recursive:true});await writeFile(root+'/node_modules/'+name+'/package.json',JSON.stringify({name,version}));}assert.throws(()=>stateatomPlugin({enabled:true,profile:'vue3'}).configResolved({root,plugins:[{name:'vite:vue'}]}),/Vue.*18\\.18\\.2.*4\\.4\\.9.*3\\.3\\.4/);checks.push(label+' refused');}
assert.throws(()=>stateatomPlugin({enabled:true,profile:'vue3',reactHostProps:true}),/Vue.*profile.*option/);assert.throws(()=>stateatomPlugin({enabled:true,profile:'unknown'}),/profile/);checks.push('mixed options and unknown profile refused');
console.log(JSON.stringify({node:process.version,checks}));`;
  await writeFile(probeFile,probe,{flag:'wx'});
  const checked=JSON.parse(execFileSync(node,[probeFile],{cwd:consumer,env,encoding:'utf8'}));
  assert.equal(checked.node,'v18.18.2');assert.equal(checked.checks.length,6);result.profileProbes=checked;
  result.checks.push({name:'actual installed wrapper under Node18 admits exact tuple and refuses unsupported configurations',status:'PASS'});
  result.packageLock={file:consumer+'/package-lock.json',sha256:sha256(await readFile(consumer+'/package-lock.json'))};
  result.installedVite=JSON.parse(await readFile(consumer+'/node_modules/vite/package.json')).version;assert.equal(result.installedVite,'4.4.9');
  for(const [f,hash]of Object.entries(h.sourceManifest))assert.equal(sha256(await readFile(f)),hash,f);
  result.status='PASS_INSTALLED_PROFILE_ADMISSION_NOT_APP_ACCEPTANCE';
}catch(e){result.status='FAIL';result.error=e.stack;process.exitCode=1;console.error(e.message);}
finally{await log.close();result.finishedAt=new Date().toISOString();await writeFile(out+'/result.json',JSON.stringify(result,null,2));console.log('STATEATOM_RESULT '+JSON.stringify({file:out+'/result.json',status:result.status}));}
