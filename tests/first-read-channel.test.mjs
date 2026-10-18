// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,readdir,writeFile,mkdir,cp,chmod,rm,symlink,rename} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {createHash,randomUUID} from 'node:crypto';
import {buildFirstReadProfile} from '../stateatom-field-revision/build-profile.mjs';
import {startFirstReadServer,loadFirstReadCompilation,isOwnedFirstReadCompilation} from '../stateatom-field-revision/profile-channel.mjs';
const root=path.resolve(import.meta.dirname,'..');
function request(url,{headers={},method='GET'}={}) {return new Promise((resolve,reject)=>{const req=http.request(url,{headers,method},r=>{let body='';r.on('data',c=>body+=c);r.on('end',()=>resolve({status:r.statusCode,headers:r.headers,body}));}).on('error',reject);req.end();});}
test('no channel and foreign origins fail closed without workspace compilation',async()=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'stateatom-no-channel-'));
 try {for(const origin of ['http://127.0.0.1:4173','https://example.com','http://localhost:4173','http://127.0.0.1:4174','http://127.0.0.1:4173/path']){const r=await loadFirstReadCompilation(temp,origin);assert.equal(r.status,'Unknown');assert.equal(r.fullPath,false);assert(!JSON.stringify(r).includes(temp));}}finally{await rm(temp,{recursive:true,force:true});}
});
test('real temporary owned channel serves UTF-8 bytes, authenticates privately, recomputes and cleans up',async t=>{
 const candidate=await buildFirstReadProfile(),tempBase=await mkdtemp(path.join(os.tmpdir(),'stateatom-channel-')),temp=path.join(tempBase,'workspace');await mkdir(temp);let channel;
 try {
  // Copy declared inputs and recipe/tool receipts only. No compiler or fixture mock.
  const names=new Set([...candidate.manifest.inputs,...candidate.manifest.trust.files].map(i=>i.file));
  for(const name of [...names]) {let dir=path.dirname(name);while(dir.startsWith('node_modules/')){try{await readFile(path.join(root,dir,'package.json'));names.add(dir+'/package.json');}catch{}dir=path.dirname(dir);}}
  names.add('package.json');for(const name of names){await mkdir(path.dirname(path.join(temp,name)),{recursive:true});await cp(path.join(root,name),path.join(temp,name));}
  channel=await startFirstReadServer({projectRoot:temp});
  assert.deepEqual(Object.keys(channel).sort(),['bindControlledBrowser','close','profile','server']);
  const live=path.join(temp,'.runtime/first-read-live'),files=await readdir(live);assert.equal(files.length,1);
  const capPath=path.join(live,files[0]),cap=JSON.parse(await readFile(capPath,'utf8'));
  const {stat}=await import('node:fs/promises');assert.equal((await stat(capPath)).mode&0o777,0o600);
  assert(!JSON.stringify(channel.profile).includes(cap.token));
  const endpoint=cap.origin+cap.endpoint,sessionEndpoint=cap.origin+'/__stateatom/first-read-session';
  for(const forged of [null,{},Object.freeze({schema:1,freshProfile:true,sandbox:true,soleStateAtomExtension:true})])await assert.rejects(channel.bindControlledBrowser(forged),/^Error: Controlled browser binding denied$/);
  const session=await request(sessionEndpoint,{headers:{authorization:'Bearer '+cap.token}});assert.equal(session.status,200);assert.equal(JSON.parse(session.body),null);assert(!session.body.includes(cap.token));assert(!session.body.includes(temp));
  for(const headers of [{},{authorization:'Bearer wrong'},{authorization:'Bearer '+cap.token,origin:cap.origin},{authorization:'Bearer '+cap.token,host:'localhost:4173'}]){const r=await request(sessionEndpoint,{headers});assert.equal(r.status,403);assert(!r.headers['access-control-allow-origin']);}

  for(const headers of [{},{authorization:'Bearer wrong'},{authorization:'Bearer '+cap.token,origin:'http://127.0.0.1:4173'},{authorization:'Bearer '+cap.token,host:'localhost:4173'}]){const r=await request(endpoint,{headers});assert.equal(r.status,403);assert(!r.body.includes(cap.token));assert(!r.headers['access-control-allow-origin']);}
  const post=await request(sessionEndpoint,{headers:{authorization:'Bearer '+cap.token},method:'POST'});assert.equal(post.status,403);
  const receipt=await request(endpoint,{headers:{authorization:'Bearer '+cap.token}});assert.equal(receipt.status,200);assert.deepEqual(JSON.parse(receipt.body),channel.profile.manifest);
  const html=await request(cap.origin+'/react/');assert.match(html.headers['content-type'],/charset=utf-8/);assert(!html.body.includes('/@vite/client'));assert(html.body.includes(channel.profile.manifest.bundle.digest));
  const script=await request(cap.origin+'/closed-profile/'+channel.profile.manifest.bundle.digest+'.js');assert.equal(script.body,channel.profile.code);assert.match(script.headers['content-type'],/charset=utf-8/);assert.equal(script.headers['cache-control'],'no-store');
  const api=await request(cap.origin+'/api/rules');assert.deepEqual(JSON.parse(api.body).rules,{quota:12});
  const good=await loadFirstReadCompilation(temp,cap.origin);assert.equal(good.status,'Code-linked');assert(isOwnedFirstReadCompilation(good));assert(!isOwnedFirstReadCompilation(JSON.parse(JSON.stringify(good))));assert(Object.isFrozen(good.manifest.inputs[0]));assert.equal(good.scope,'Owned compilation correspondence only');assert.equal(good.fullPath,false);assert.equal(good.controlledBrowser,null);assert(!JSON.stringify(good).includes(cap.token));assert(!JSON.stringify(good).includes(capPath));
  await t.test('session JSON cannot compose on channel/manifest/bundle mismatch, malformed identities or changing native occurrence',async()=>{
   // This is only a private HTTP transport fixture. It never issues a launcher
   // witness and does not establish a real browser's native launch facts.
   const base={schema:1,witnessId:randomUUID(),targetId:'native-target-fixture',extensionId:'a'.repeat(32),browserVersion:'Chrome/153.0.0.0',mainFrameId:'native-frame-fixture',contextUniqueId:'native-context-fixture',startedAt:Date.now(),freshProfile:true,sandbox:true,soleStateAtomExtension:true,channelId:cap.id,manifestId:channel.profile.manifest.id,bundleDigest:channel.profile.manifest.bundle.digest};
   const listeners=channel.server.listeners('request');let responses=[],reads=0;
   channel.server.removeAllListeners('request');
   const handler=(req,res)=>{if(req.url==='/__stateatom/first-read-session'){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(responses[Math.min(reads++,responses.length-1)]));}else for(const fn of listeners)fn(req,res);};
   channel.server.on('request',handler);
   try{
    for(const change of [{channelId:randomUUID()},{manifestId:randomUUID()},{bundleDigest:'0'.repeat(64)},{schema:2},{sandbox:false},{extensionId:'evil'},{contextUniqueId:''},{targetId:'x'.repeat(257)},{startedAt:Date.now()+60000},{extra:'undeclared'}]){
     responses=[{...base,...change}];reads=0;const result=await loadFirstReadCompilation(temp,cap.origin);assert.equal(result.status,'Code-linked');assert.equal(result.controlledBrowser,null);
    }
    for(const after of [null,{...base,witnessId:randomUUID()},{...base,contextUniqueId:'replacement-context'},{...base,targetId:'replacement-target'}]){
     responses=[base,after];reads=0;const result=await loadFirstReadCompilation(temp,cap.origin);assert.equal(reads,2);assert.equal(result.status,'Code-linked');assert.equal(result.controlledBrowser,null);
    }
    responses=[{...base,browserVersion:'x'.repeat(5000)}];reads=0;const oversized=await loadFirstReadCompilation(temp,cap.origin);assert.equal(oversized.status,'Code-linked');assert.equal(oversized.controlledBrowser,null);
   }finally{channel.server.removeListener('request',handler);for(const fn of listeners)channel.server.on('request',fn);}
  });
  await t.test('nested native binary shadow is rejected before any unverified executable is selected',async()=>{
   const nested=path.join(temp,'node_modules/esbuild/node_modules/@esbuild/linux-x64');await mkdir(path.join(nested,'bin'),{recursive:true});
   try{await writeFile(path.join(nested,'package.json'),JSON.stringify({name:'@esbuild/linux-x64',version:'0.25.12'}));await writeFile(path.join(nested,'bin/esbuild'),'unverified non-executable control');await assert.rejects(buildFirstReadProfile({projectRoot:temp}),/Native compiler resolution outside pinned path/);}finally{await rm(path.join(temp,'node_modules/esbuild/node_modules'),{recursive:true,force:true});}
  });
  await t.test('nested Babel dependency shadow is rejected before its source executes',async()=>{
   const nested=path.join(temp,'node_modules/@babel/plugin-transform-react-jsx/node_modules/@babel/helper-plugin-utils');await mkdir(nested,{recursive:true});
   try{await writeFile(path.join(nested,'package.json'),JSON.stringify({name:'@babel/helper-plugin-utils',main:'index.js'}));await writeFile(path.join(nested,'index.js'),"throw Error('UNVERIFIED_BABEL_SHADOW_EXECUTED');");await assert.rejects(buildFirstReadProfile({projectRoot:temp}),/Tool resolution outside pinned graph/);}finally{await rm(path.join(temp,'node_modules/@babel/plugin-transform-react-jsx/node_modules'),{recursive:true,force:true});}
  });
  await t.test('workspace and ancestor tsconfig cannot alter the fixed declared raw configuration',async()=>{
   const before=channel.profile.manifest.bundle.digest;for(const file of [path.join(temp,'tsconfig.json'),path.join(tempBase,'tsconfig.json')]){
    try{await writeFile(file,'{"compilerOptions":');const next=await buildFirstReadProfile({projectRoot:temp});assert.equal(next.manifest.bundle.digest,before);assert.deepEqual(next.manifest.compiler.options.tsconfigRaw,{});}finally{await rm(file,{force:true});}
   }
  });
  await t.test('host observations remain visible while exact stable compilation correspondence permits different Node/V8 hosts',async()=>{
   const originalManifest=channel.profile.manifest,other=JSON.parse(JSON.stringify(originalManifest));other.compiler.host={...other.compiler.host,node:'simulated-other-node',v8:'simulated-other-v8'};delete other.digest;other.digest=createHash('sha256').update(JSON.stringify(other)).digest('hex');channel.profile.manifest=other;
   try{const linked=await loadFirstReadCompilation(temp,cap.origin);assert.equal(linked.status,'Code-linked');assert.deepEqual(linked.compilerHosts.server,other.compiler.host);assert.equal(linked.compilerHosts.helper.node,process.versions.node);assert.equal(linked.compilerHosts.helper.v8,process.versions.v8);assert(Object.isFrozen(linked.compilerHosts));}finally{channel.profile.manifest=originalManifest;}
  });
  const {build}=await import('esbuild');const helperFile=path.join(temp,'helper.cjs');
  const helperBuild=await build({entryPoints:[path.join(root,'stateatom-field-revision/profile-channel.mjs')],bundle:true,platform:'node',format:'cjs',target:'node20',outfile:helperFile,metafile:true,logLevel:'silent'});
  assert(!Object.keys(helperBuild.metafile.inputs).some(f=>f.includes('node_modules/esbuild/')||f.includes('node_modules/vite/')||f.includes('node_modules/playwright/')||f.includes('node_modules/playwright-core/')));
  const installed=createRequire(import.meta.url)(helperFile),installedResult=await installed.loadFirstReadCompilation(temp,cap.origin);assert.equal(installedResult.status,'Code-linked');assert(installed.isOwnedFirstReadCompilation(installedResult));
  await assert.rejects(startFirstReadServer({projectRoot:temp}),/channel|port|listen/i);
  await chmod(live,0o777);assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');await chmod(live,0o700);
  await chmod(capPath,0o644);assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');await chmod(capPath,0o600);
  await writeFile(capPath,JSON.stringify({...cap,expiresAt:Date.now()-1}),{mode:0o600});assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');await writeFile(capPath,JSON.stringify(cap));
  const other=path.join(live,'competing.json');await writeFile(other,JSON.stringify({...cap,id:randomUUID()}),{mode:0o600});assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');await rm(other);
  // Keep the channel-owned inode: recreating identical bytes would be a
  // replacement that cleanup must preserve, and inode reuse made this flaky.
  const savedCapPath=capPath+'.original';await rename(capPath,savedCapPath);
  try{await symlink(path.join(temp,'package.json'),capPath);assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');}
  finally{await rm(capPath,{force:true});await rename(savedCapPath,capPath);}
  const malformed='{'+JSON.stringify(cap.token);await writeFile(capPath,malformed);await assert.rejects(startFirstReadServer({projectRoot:temp}),e=>!e.message.includes(cap.token));await writeFile(capPath,JSON.stringify(cap));
  const savedOverride=process.env.ESBUILD_BINARY_PATH;process.env.ESBUILD_BINARY_PATH='/private/nonexistent';assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');if(savedOverride===undefined)delete process.env.ESBUILD_BINARY_PATH;else process.env.ESBUILD_BINARY_PATH=savedOverride;
  const app='stateatom-phase2/fixtures/react/App.tsx',original=await readFile(path.join(temp,app));await writeFile(path.join(temp,app),Buffer.concat([original,Buffer.from('\n// changed source')]));assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');await writeFile(path.join(temp,app),original);
  const appPath=path.join(temp,app);await rename(appPath,appPath+'.original');try{await symlink(path.join(root,app),appPath);await assert.rejects(buildFirstReadProfile({projectRoot:temp}),/symlink denied/);assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');}finally{await rm(appPath,{force:true});await rename(appPath+'.original',appPath);}
  const apiFile=path.join(temp,'node_modules/esbuild/lib/main.js'),apiBytes=await readFile(apiFile);await writeFile(apiFile,Buffer.concat([apiBytes,Buffer.from('\n// tampered compiler')]));assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');await writeFile(apiFile,apiBytes);
  const binaryFile=path.join(temp,'node_modules/@esbuild/linux-x64/bin/esbuild'),binaryBytes=await readFile(binaryFile);await rename(binaryFile,binaryFile+'.original');try{await writeFile(binaryFile,Buffer.concat([binaryBytes,Buffer.from('tampered')]));assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');}finally{await rm(binaryFile,{force:true});await rename(binaryFile+'.original',binaryFile);}
  // The endpoint reports bytes and input records, never a source-effect authority.
  const saved=JSON.parse(JSON.stringify(channel.profile.manifest));
  const refreshDigest=()=>{delete channel.profile.manifest.digest;channel.profile.manifest.digest=createHash('sha256').update(JSON.stringify(channel.profile.manifest)).digest('hex');};
  channel.profile.manifest.bundle.digest='0'.repeat(64);refreshDigest();assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');channel.profile.manifest=JSON.parse(JSON.stringify(saved));
  channel.profile.manifest.inputs[0].stageDigest='0'.repeat(64);refreshDigest();assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');channel.profile.manifest=JSON.parse(JSON.stringify(saved));
  channel.profile.manifest.compiler.options.minify=true;refreshDigest();assert.equal((await loadFirstReadCompilation(temp,cap.origin)).status,'Unknown');channel.profile.manifest=JSON.parse(JSON.stringify(saved));
  await writeFile(path.join(live,'unrelated.txt'),'preserve');
  const realClose=channel.server.close.bind(channel.server);channel.server.close=cb=>realClose(()=>cb(Error('synthetic close failure')));
  await assert.rejects(channel.close(),/cleanup failed/);channel=null;assert.deepEqual(await readdir(live),['unrelated.txt']);
  await t.test('cleanup preserves a replaced capability inode even when its bytes match',async()=>{
   const replacementChannel=await startFirstReadServer({projectRoot:temp});
   try{
    const own=(await readdir(live)).find(n=>n.endsWith('.json')),ownPath=path.join(live,own),savedPath=ownPath+'.original';
    const originalBytes=await readFile(ownPath),originalStat=await stat(ownPath);await rename(ownPath,savedPath);
    await writeFile(ownPath,originalBytes,{mode:0o600});assert.notEqual((await stat(ownPath)).ino,originalStat.ino);
    await replacementChannel.close();assert.deepEqual(await readFile(ownPath),originalBytes);
    assert.deepEqual(await readFile(savedPath),originalBytes);assert.equal(await readFile(path.join(live,'unrelated.txt'),'utf8'),'preserve');
   }finally{await replacementChannel.close();}
  });
 } finally {await channel?.close();await rm(tempBase,{recursive:true,force:true});}
});
