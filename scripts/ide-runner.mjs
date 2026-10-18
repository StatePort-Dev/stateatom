import {runTests} from '@vscode/test-electron';import path from 'node:path';
import {readFile,mkdir,writeFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {createRequire} from 'node:module';import {helperDigest} from './installed-helper.mjs';
const root=path.resolve(import.meta.dirname,'..'),runtime=process.env.XRAY_RUNTIME||root+'/.runtime';
try{
 let developmentPath=root+'/dist/ide';
 if(process.env.XRAY_INSTALLED_VSIX){
  const vsix=path.resolve(process.env.XRAY_INSTALLED_VSIX),require=createRequire(import.meta.url),{readZip}=require('@vscode/vsce/out/zip.js');
  const entries=await readZip(vsix,name=>['extension/package.json','extension/extension.cjs'].includes(name)),raw=entries.get('extension/package.json'),bundle=entries.get('extension/extension.cjs');
  if(!raw||!bundle)throw Error('Installed acceptance requires packaged helper metadata and bundle');
  const pkg=JSON.parse(raw);if(pkg.publisher!== 'local-research'||pkg.name!=='stateatom-dev-helper'||pkg.main!=='./extension.cjs')throw Error('Unexpected local helper distribution');
  const expected={id:pkg.publisher+'.'+pkg.name,version:pkg.version,main:'extension.cjs',packageManifest:pkg,packageSha256:helperDigest(raw),bundleSha256:helperDigest(bundle),vsixSha256:helperDigest(await readFile(vsix))};
  await writeFile(runtime+'/expected-installed-helper.json',JSON.stringify(expected));
  const cliEnv={...process.env};delete cliEnv.ELECTRON_RUN_AS_NODE;
  const installed=execFileSync('/usr/share/code/bin/code',['--user-data-dir='+runtime+'/vscode-user','--extensions-dir='+runtime+'/vscode-extensions','--install-extension',vsix],{env:cliEnv,encoding:'utf8',timeout:60000});process.stdout.write(installed);
  // Only the inert acceptance driver is a development extension. The product must
  // resolve from --extensions-dir and match the reviewed VSIX in the real host.
  developmentPath=runtime+'/acceptance-driver';await mkdir(developmentPath);
  await writeFile(developmentPath+'/package.json',JSON.stringify({name:'stateatom-acceptance-driver',publisher:'local-research',version:'0.0.0',engines:{vscode:'^1.95.0'},main:'./driver.cjs',extensionDependencies:['local-research.stateatom-dev-helper']}));await writeFile(developmentPath+'/driver.cjs','exports.activate=()=>{};');
 }
 await runTests({vscodeExecutablePath:root+'/scripts/code-sandbox-wrapper.sh',extensionDevelopmentPath:developmentPath,extensionTestsPath:root+'/tests/ide-host.cjs',launchArgs:[root,'--user-data-dir='+runtime+'/vscode-user','--extensions-dir='+runtime+'/vscode-extensions','--remote-debugging-port=49331','--disable-updates','--skip-welcome','--skip-release-notes'],extensionTestsEnv:{XRAY_RUNTIME:runtime}});
}catch(e){console.error(e);process.exitCode=1;}
