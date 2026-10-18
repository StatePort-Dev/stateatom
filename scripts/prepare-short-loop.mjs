// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 StateAtom contributors.
// Optional test applications only; never used by the shipped extension.
import {spawnSync} from 'node:child_process';
import {mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {root} from './vite-config.mjs';
import {todoRevision as revision,fixtureEntries as entries,fileDigests} from './short-loop-inputs.mjs';

const destination=path.join(root,'.runtime/todomvc');
function run(command,args,options={}) {
 const result=spawnSync(command,args,{stdio:'inherit',...options});
 if(result.error)throw result.error;
 if(result.status!==0)throw Error(`${command} exited ${result.status}`);
}
// Exclusive creation prevents overwriting an earlier fixture or its dependencies.
await mkdir(path.dirname(destination),{recursive:true});
await mkdir(destination);
const supplied=process.env.TODOMVC_SOURCE;
const checkout=supplied||path.join(destination,'.upstream');
try {
 if(!supplied)run('git',['clone','--filter=blob:none','--no-checkout','https://github.com/tastejs/todomvc.git',checkout]);
 const archive=spawnSync('git',['-C',checkout,'archive',revision,...entries],{maxBuffer:16*1024*1024});
 if(archive.error||archive.status!==0)throw archive.error||Error(archive.stderr.toString());
 run('tar',['-x','-C',destination],{input:archive.stdout,stdio:['pipe','inherit','inherit']});
 await writeFile(path.join(destination,'SOURCE_SHA256.json'),JSON.stringify(await fileDigests(destination,entries),null,2)+'\n');
 if(!supplied)await rm(checkout,{recursive:true,force:true});
 for(const stack of ['react','vue'])run('npm',['ci','--omit=dev','--ignore-scripts','--no-audit','--no-fund'],{cwd:path.join(destination,'examples',stack)});
 await writeFile(path.join(destination,'REVISION'),revision+'\n');
 console.log('Prepared pinned TodoMVC test applications at .runtime/todomvc');
} catch(error) {
 console.error('Fixture preparation incomplete; inspect .runtime/todomvc before removing or retrying.');
 throw error;
}
