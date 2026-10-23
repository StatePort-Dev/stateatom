// SPDX-License-Identifier: Apache-2.0
// Linux graphical maintainer route, with a real isolated installed VSIX.
import assert from 'node:assert/strict';
import {createServer} from 'node:net';
import {readFile,writeFile,mkdir,access,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {root} from './vite-config.mjs';
import {startIDE,waitFor} from './harness.mjs';
import {sha256} from './atom-package-receipt.mjs';
import {parseConnectionReceipt,HELPER_VERSION} from '../core/project-connection.mjs';
import {sourceAccessDesktop} from '../tests/helpers/source-access-native-desktop.mjs';
import {summarizeInstalledEvidence} from '../tests/helpers/installed-maintainer-lane.mjs';
assert.equal(process.argv.length,3,'Usage: node scripts/verify-installed-maintainer.mjs <timestamped development handoff.json>');
process.chdir(root);const hf=path.relative(root,path.resolve(process.argv[2]));
assert.match(hf,/^\.artifacts\/development\/\d{4}-\d{2}-\d{2}T[\d-]+Z\/handoff\.json$/,'Exact retained development handoff required');
const out='.artifacts/v01/installed-helper/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true,mode:0o700});
const paths=['scripts/verify-installed-maintainer.mjs','scripts/owned-ide-endpoint.mjs','tests/owned-ide-endpoint.test.mjs','scripts/installed-helper.mjs','scripts/ide-runner.mjs','scripts/harness.mjs','scripts/code-sandbox-wrapper.sh','tests/ide-host.cjs','tests/offline-guard.cjs','tests/helpers/source-access-native-desktop.mjs','tests/helpers/installed-maintainer-lane.mjs','tests/atom/installed-maintainer-lane.test.mjs','core/project-connection.mjs','packages/atom/src/origin-policy.mjs','package.json','package-lock.json','docs/superpowers/plans/2026-10-23-v01-installed-maintainer.md'];
const inputs=async()=>Object.fromEntries(await Promise.all(paths.map(async f=>[f,sha256(await readFile(f))])));
const result={schema:'stateatom.installed-maintainer-job/1',status:'RUNNING',startedAt:new Date().toISOString(),revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),inputsBefore:await inputs(),configuration:{platform:process.platform,graphical:true,isolatedUserAndExtensions:true,certificateSetup:false,ownedDebuggerEndpoint:true,browserUI:false,protocolClient:'Controlled Node request with synthetic extension origin; not actual Atom UI source association',acceptanceDriverOnlyIsDevelopmentExtension:true},checks:[]};
const check=(name)=>{result.checks.push({name,status:'PASS'});console.log('PASS',name);};
const lock='.artifacts/v01/installed-helper.lock',runtime=path.resolve(out,'private-profiles'),workspace=path.resolve(out,'private-workspace');
let ownsLock=false,desktop,ide,privateToken;
async function freePort(port){const server=createServer();await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});const value=server.address().port;await new Promise(resolve=>server.close(resolve));return value;}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
try{
  const h=JSON.parse(await readFile(hf));assert.equal(h.schema,'stateatom.development-artifacts/1');assert.equal(h.helper.version,HELPER_VERSION);
  assert.equal(path.dirname(path.resolve(h.helper.file)),path.dirname(path.resolve(hf)));
  assert.equal(sha256(await readFile(h.helper.file)),h.helper.sha256);result.artifact={handoff:hf,handoffSha256:sha256(await readFile(hf)),file:path.relative(root,h.helper.file),sha256:h.helper.sha256,version:h.helper.version,originalSourceRevision:h.sourceRevision};check('exact retained VSIX bytes and matching helper protocol, no producer rebuild');
  if(process.platform!=='linux')throw Error('BLOCKED: this declared maintainer route requires Linux');
  if(!process.env.DISPLAY)throw Error('BLOCKED: graphical parent DISPLAY is missing');
  await access('/usr/share/code/code').catch(()=>{throw Error('BLOCKED: installed /usr/share/code/code is missing');});
  for(const executable of['Xephyr','xdotool']){try{execFileSync('which',[executable],{stdio:'ignore'});}catch{throw Error('BLOCKED: '+executable+' is missing');}}
  try{await freePort(49331);}catch(error){if(error.code==='EADDRINUSE')throw Error('BLOCKED: IDE port49331 already has an owner; nothing was attached or stopped');throw error;}
  try{await mkdir(lock);ownsLock=true;}catch(error){if(error.code==='EEXIST')throw Error('BLOCKED: another installed maintainer job owns the lock');throw error;}
  await writeFile(lock+'/owner.json',JSON.stringify({pid:process.pid,out},null,2));check('required Linux tools available and foreign IDE/cooperative lock absent');
  const helperPort=await freePort(0),origin='http://127.0.0.1:53021';
  await mkdir(workspace+'/src',{recursive:true,mode:0o700});await mkdir(workspace+'/.vscode',{mode:0o700});
  const text='export const readiness = true;\n',source={file:'src/example.js',line:1,column:14,endLine:1,endColumn:23,selectedText:'readiness'};
  await writeFile(workspace+'/'+source.file,text);await writeFile(workspace+'/.vscode/settings.json',JSON.stringify({'stateatom.appOrigin':origin,'stateatom.sourceFolder':'.','stateatom.helperPort':helperPort}));
  result.syntheticSource={file:source.file,sha256:sha256(text),range:source};await writeFile(out+'/preregistration.json',JSON.stringify(result,null,2),{flag:'wx'});
  desktop=await sourceAccessDesktop(out);const saved=Object.fromEntries(['DISPLAY','DBUS_SESSION_BUS_ADDRESS','GTK_USE_PORTAL'].map(k=>[k,process.env[k]]));
  try{process.env.DISPLAY=desktop.display;process.env.DBUS_SESSION_BUS_ADDRESS='unix:path='+runtime+'/no-shared-session-bus';process.env.GTK_USE_PORTAL='0';ide=await startIDE(runtime,{logDir:out,installedVsix:h.helper.file,projectRoot:workspace,ownedEndpoint:true});}
  finally{for(const[k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;}
  assert.equal(ide.conn.root,workspace,'Private acceptance host must belong to chosen workspace');
  const installed=JSON.parse(await readFile(runtime+'/installed-helper-host.json')),expected=JSON.parse(await readFile(runtime+'/expected-installed-helper.json'));assert.equal(expected.vsixSha256,h.helper.sha256);assert.equal(installed.vsixSha256,h.helper.sha256);assert.equal(installed.loadedFromIsolatedInstallation,true);check('actual VS Code Extension API loaded reviewed VSIX from isolated installed extensions');
  const receipt=await waitFor(async()=>parseConnectionReceipt(await readFile(runtime+'/private-receipt.json','utf8')));assert.equal(receipt.origin,origin);assert.equal(receipt.sourceRoot,'.');assert.equal(receipt.helper.session,ide.conn.helper.session);privateToken=receipt.token;check('public IDE receipt command produced matching private workspace/session receipt');
  async function request(op,body){const response=await fetch(receipt.url+'/'+op,{method:'POST',redirect:'error',headers:{'content-type':'application/json',origin:'chrome-extension://'+'a'.repeat(32),authorization:'Bearer '+receipt.token},body:JSON.stringify(body)});return response.json();}
  const paired=await request('pair',{origin,sourceRoot:'.',clientProtocol:1,connection:{schemaVersion:1,helper:receipt.helper,workspace:receipt.workspace}});assert.equal(paired.ok,true);assert.equal(paired.result.paired,true);check('controlled helper protocol pairs only the chosen private workspace/session');
  const auditFile=runtime+'/ide-audit.jsonl',before=await readFile(auditFile,'utf8').catch(()=>'');
  for(const[category,body,error]of[['stale',{...source,sourceDigest:'0'.repeat(64)},/Stale source/],['escape',{...source,file:'../outside.js',sourceDigest:sha256(text)},/Path denied/]]){const denied=await request('open',{origin,...body});assert.equal(denied.ok,false);assert.match(denied.error,error);check(category+' source Open refused before an editor selection');}
  await sleep(150);assert.equal(await readFile(auditFile,'utf8').catch(()=>''),before);
  const opened=await request('open',{origin,...source,sourceDigest:sha256(text)});assert.equal(opened.ok,true);
  const audit=await waitFor(async()=>(await readFile(auditFile,'utf8').catch(()=>'')).split('\n').filter(Boolean).map(JSON.parse).find(x=>x.file===workspace+'/'+source.file&&x.line===1&&x.column===14&&x.endColumn===23&&x.selectedText==='readiness'));check('actual active-editor API observed exact synthetic source file and selection');
  await ide.close(true);ide=null;const host=JSON.parse(await readFile(runtime+'/host-complete.json')),offline=JSON.parse(await readFile(runtime+'/offline-host.json'));assert.equal(offline.probeDenied,true);assert.equal(host.passed,true);check('owned IDE quit cleanly with trusted host completion and scoped offline guard');
  result.evidence=summarizeInstalledEvidence({expected,installed,host,audit,workspace,source});assert.equal(sha256(await readFile(h.helper.file)),h.helper.sha256);assert.equal(sha256(await readFile(workspace+'/'+source.file)),sha256(text));check('shareable evidence contains exact installation/range and no private receipt');
  result.status='PASS_INSTALLED_VSIX_MAINTAINER_ROUTE';
}catch(error){result.status=String(error.message).startsWith('BLOCKED:')?'BLOCKED_ENVIRONMENT':'FAIL';result.error=String(error.message).replaceAll(workspace,'[private workspace]').replaceAll(runtime,'[private profile]');if(privateToken)result.error=result.error.replaceAll(privateToken,'[private token]');process.exitCode=1;console.error(result.status,result.error);}
finally{
  if(ide)await ide.close(false).catch(()=>{result.cleanupFailed=true;result.status='FAIL';process.exitCode=1;});await desktop?.close();if(ownsLock)await rm(lock,{recursive:true});
  result.inputsAfter=await inputs();if(JSON.stringify(result.inputsAfter)!==JSON.stringify(result.inputsBefore)){result.status='FAIL';result.sourceDrift=true;process.exitCode=1;}
  result.finishedAt=new Date().toISOString();const raw=JSON.stringify(result,null,2);assert(!privateToken||!raw.includes(privateToken),'Private receipt must not enter result');assert(!raw.includes(workspace)&&!raw.includes(runtime),'Private profiles must not enter shareable result');await writeFile(out+'/results.json',raw);console.log('STATEATOM_INSTALLED_RESULT '+JSON.stringify({file:out+'/results.json',status:result.status}));
}
