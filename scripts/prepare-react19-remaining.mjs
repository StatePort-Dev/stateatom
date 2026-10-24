// SPDX-License-Identifier: Apache-2.0
// Reuse retained app/tooling. Credit prior semantics only through exact byte checks.
import assert from 'node:assert/strict';import{readFile,writeFile,mkdir,readdir}from'node:fs/promises';import{execFileSync}from'node:child_process';import{createHash}from'node:crypto';import path from'node:path';
const root=process.cwd(),sha=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(f));
const [baseFile,handoffFile]=process.argv.slice(2);assert(baseFile&&handoffFile&&process.argv.length===4,'Pass retained75 prepared.json and exact76 handoff');
const base=await json(baseFile),current=await json(handoffFile),old=base.atom;
assert.equal(old.package.version,'0.1.0-candidate.20261021.75');assert.equal(current.package.version,'0.1.0-candidate.20261021.76');assert.equal(base.plugin.plugin.version,'0.1.0-candidate.20261021.7');assert.deepEqual(current.contract,old.contract);assert.deepEqual(current.package.exports,old.package.exports);assert.equal(current.ui.sha256,old.ui.sha256);
for(const artifact of[old.package,old.ui,current.package,current.ui,base.plugin.plugin])assert.equal(sha(await readFile(artifact.file)),artifact.sha256);
const prior=await json(base.out+'/results.json'),checkpoint=await json(base.out+'/verification/pre-font-change-checkpoint.json');
assert.equal(sha(await readFile(base.out+'/results.json')),checkpoint.artifacts['results.json']);assert.equal(sha(await readFile(base.out+'/verification/verification.json')),checkpoint.artifacts['verification/verification.json']);assert.equal(checkpoint.sourceClean,true);assert.equal(prior.status,'INCOMPLETE_PRODUCT_QUALIFICATION_NOT_A02');assert.equal(prior.checks.length,6);assert.equal(checkpoint.verification.nativeSemanticScenarios,4);assert(prior.errors[0].includes("'11px' !== '13px'"));
const permitted=new Set(['packages/atom/src/atom.css','packages/atom/src/template.mjs','packages/atom/package.json','packages/atom/CHANGELOG.md','package-lock.json']),changed=[];
assert.deepEqual(Object.keys(old.buildSources.manifest),Object.keys(current.buildSources.manifest));
for(const[file,hash]of Object.entries(current.buildSources.manifest)){
 assert.equal(sha(await readFile(root+'/'+file)),hash,'Current build source drift: '+file);
 if(hash!==old.buildSources.manifest[file]){assert(permitted.has(file),'Unexpected source change: '+file);changed.push({file,before:old.buildSources.manifest[file],after:hash});}
}
assert(changed.some(x=>x.file==='packages/atom/src/template.mjs'));
for(const manifest of[base.plugin.sourceManifest,base.helperInputs,base.appDependencyInputs,base.copiedOriginals,base.vendorFiles,base.toolInputs])for(const[file,hash]of Object.entries(manifest))assert.equal(sha(await readFile(path.resolve(root,file))),hash,'Mechanism/tool/app drift: '+file);
for(const[file,hash]of Object.entries(base.originalSourceFiles))assert.equal(sha(await readFile(root+'/.runtime/todomvc/'+file)),hash,'Original upstream identity drift: '+file);
const out=root+'/.artifacts/a02/react19-remaining/'+new Date().toISOString().replace(/[:.]/g,'-');await mkdir(out,{recursive:true});
for(const[label,artifact]of[['previous-payload',old.package],['current-payload',current.package]]){
 const names=execFileSync('tar',['-tzf',artifact.file],{encoding:'utf8'}).trim().split('\n');assert(names.every(n=>n.startsWith('package/')&&!n.split('/').includes('..')));await mkdir(out+'/'+label);execFileSync('tar',['-xzf',artifact.file,'-C',out+'/'+label,'--no-same-owner']);
}
const payloads=[];async function payload(dir){const map={};async function walk(p){for(const e of await readdir(p,{withFileTypes:true})){const f=p+'/'+e.name;if(e.isDirectory())await walk(f);else{assert(e.isFile(),'Nonregular payload');map[f.slice(dir.length+1)]=sha(await readFile(f));}}}await walk(dir);return map;}
for(const label of['previous-payload','current-payload'])payloads.push(await payload(out+'/'+label+'/package'));assert.deepEqual(Object.keys(payloads[0]),Object.keys(payloads[1]));
const allowedPayload=new Set(['CHANGELOG.md','package.json','dist/ui.mjs','dist/atom.css','dist/source-manifest.json']),payloadChanges=[];
for(const[file,hash]of Object.entries(payloads[1]))if(hash!==payloads[0][file]){assert(allowedPayload.has(file),'Unexpected payload behavior change: '+file);payloadChanges.push(file);}
const before=out+'/previous-payload/package',after=out+'/current-payload/package',text=async(dir,file)=>readFile(dir+'/'+file,'utf8');
const from='data-atom-id="native-state-summary" hidden',to='data-atom-id="native-state-summary" class="sp-atom-native-state" hidden';
const uiBefore=await text(before,'dist/ui.mjs'),uiAfter=await text(after,'dist/ui.mjs');assert.equal(uiBefore.split(from).length,2,'Expected one summary class insertion');assert.equal(uiBefore.replace(from,to),uiAfter,'UI must differ by the one class literal only');
const cssBefore=await text(before,'dist/atom.css'),cssAfter=await text(after,'dist/atom.css'),rule='[data-sp-ui][data-atom-root] .sp-atom-native-state { font-size:var(--sp-font-size-body); }\n';assert.equal(cssAfter.split(rule).length,2);assert.equal(cssAfter.replace(rule,''),cssBefore,'CSS must differ by only one scoped body-token rule');
// Validate the raw source delta as well as the executable payload delta.
const historical=file=>execFileSync('git',['show',checkpoint.sourceRevision+':'+file],{encoding:'utf8'});
for(const file of ['packages/atom/src/template.mjs','packages/atom/src/atom.css','packages/atom/package.json','package-lock.json','packages/atom/CHANGELOG.md'])assert.equal(sha(historical(file)),old.buildSources.manifest[file]);
const rawFrom=JSON.stringify(from).slice(1,-1),rawTo=JSON.stringify(to).slice(1,-1),oldTemplate=historical('packages/atom/src/template.mjs');assert.equal(oldTemplate.split(rawFrom).length,2);assert.equal(oldTemplate.replace(rawFrom,rawTo),await readFile(root+'/packages/atom/src/template.mjs','utf8'));
assert.equal(historical('packages/atom/src/atom.css'),cssBefore);assert.equal(await readFile(root+'/packages/atom/src/atom.css','utf8'),cssAfter);
for(const file of ['packages/atom/package.json','package-lock.json'])assert.equal(historical(file).replaceAll(old.package.version,current.package.version),await readFile(root+'/'+file,'utf8'),'Only candidate metadata may change: '+file);
const oldChangelog=historical('packages/atom/CHANGELOG.md'),newChangelog=await readFile(root+'/packages/atom/CHANGELOG.md','utf8');assert(newChangelog.startsWith('# Changelog\n\n## '+current.package.version));assert(newChangelog.endsWith(oldChangelog.slice('# Changelog\n'.length)));
const pkg=JSON.parse(await text(before,'package.json'));pkg.version=current.package.version;assert.deepEqual(pkg,JSON.parse(await text(after,'package.json')));
const sourceBefore=JSON.parse(await text(before,'dist/source-manifest.json')),sourceAfter=JSON.parse(await text(after,'dist/source-manifest.json'));const sourceDelta=Object.keys(sourceAfter).filter(k=>sourceAfter[k]!==sourceBefore[k]);assert.deepEqual(sourceDelta,['packages/atom/src/template.mjs']);
const hostEquality={};for(const file of Object.keys(old.consumerReceipt.hostFiles.standalone))if(!['panel.js','atom.css'].includes(file)){
 const expected=old.consumerReceipt.hostFiles.standalone[file],actual=current.consumerReceipt.hostFiles.standalone[file];assert.equal(actual,expected,'Unchanged host code drift: '+file);assert.equal(sha(await readFile(current.hosts.standalone+'/'+file)),actual);hostEquality[file]=actual;
}
const receipt={schema:'stateatom.react19-mechanism-credit/1',oldNativeResult:base.out+'/results.json',oldNativeResultSHA256:checkpoint.artifacts['results.json'],oldNativeStatus:prior.status,oldCandidate:old.package.version,currentCandidate:current.package.version,currentHandoff:path.resolve(handoffFile),oldNativeSemanticScenarios:4,currentNativeSemanticScenariosExecuted:0,sourceChanges:changed,payloadChanges,uiSingleClassLiteralOnly:true,cssSingleScopedTokenRuleOnly:true,rawSourceDeltaExact:true,sourceRuntimeManifestChanges:sourceDelta,unchangedPayloadFiles:Object.keys(payloads[1]).filter(f=>!payloadChanges.includes(f)),unchangedHostFiles:hostEquality,pluginSourceUnchanged:true,helperSourceUnchanged:true,appAndToolsUnchanged:true,selectedOccurrenceReuse:false,scope:'Credit four recorded75 semantic scenarios for unchanged mechanism code only. Not fresh76 native observations or a PASS for the old partial run. New remaining witnesses must be acquired on their own node/page/revision.'};
await writeFile(out+'/mechanism-credit.json',JSON.stringify(receipt,null,2),{flag:'wx'});
let config=await readFile(base.overlay,'utf8');config=config.replaceAll(base.out+'/vite-ready.json',out+'/vite-ready.json').replaceAll(base.out+'/vite-cache',out+'/vite-cache');
const prepared={...base,out,atom:current,atomHandoff:path.resolve(handoffFile),caseFile:root+'/docs/testing/react19-remaining-case.json',mechanismCredit:out+'/mechanism-credit.json',mechanismCreditHash:sha(JSON.stringify(receipt,null,2)),overlay:out+'/vite-server.mjs',overlayHash:sha(config),preparationHistory:{basePrepared:path.resolve(baseFile),previousNative:base.out+'/results.json',change:'Only one scoped body token rule and one template class; no app/tooling reinstall or app source edit.'}};
await writeFile(prepared.overlay,config,{flag:'wx'});await writeFile(out+'/prepared.json',JSON.stringify(prepared,null,2),{flag:'wx'});console.log(out+'/prepared.json');
