// SPDX-License-Identifier: Apache-2.0
// Public evaluation fixture only; never bundled into the extension.
import {spawnSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {todoRevision,fileDigests} from './short-loop-inputs.mjs';
import {root} from './vite-config.mjs';
const tag=process.env.APP_TAG||'todomvc-redux-'+todoRevision.slice(0,12);
if(!/^[a-zA-Z0-9_-]{1,100}$/.test(tag))throw Error('Invalid APP_TAG');
const destination=root+'/.runtime/independent-apps/'+tag,upstream=process.env.TODOMVC_SOURCE;
if(!upstream)throw Error('TODOMVC_SOURCE must name a read-only Git mirror of the public tastejs/todomvc upstream');
const entries=['license.md','examples/react-redux/src','examples/react-redux/public','examples/react-redux/package.json','examples/react-redux/package-lock.json'];
await mkdir(root+'/.runtime/independent-apps',{recursive:true});await mkdir(destination);
const archive=spawnSync('git',['-C',upstream,'archive',todoRevision,...entries],{maxBuffer:16*1024*1024});
if(archive.error||archive.status!==0)throw archive.error||Error(archive.stderr.toString());
const unpack=spawnSync('tar',['-x','-C',destination],{input:archive.stdout,stdio:['pipe','inherit','inherit']});if(unpack.error||unpack.status!==0)throw unpack.error||Error('Archive extraction failed');
await writeFile(destination+'/SOURCE_SHA256.json',JSON.stringify(await fileDigests(destination,entries),null,2)+'\n');
await writeFile(destination+'/REVISION',todoRevision+'\n');
const install=spawnSync('npm',['ci','--omit=dev','--ignore-scripts','--no-audit','--no-fund'],{cwd:destination+'/examples/react-redux',stdio:'inherit'});
if(install.error||install.status!==0)throw install.error||Error('Locked dependency installation failed');
console.log(destination);
