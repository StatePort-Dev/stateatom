// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseInventoryEnvironment,parseInventoryPID,inventoryDBusArgs,collectChooserWindows} from './helpers/chooser-inventory.mjs';
const identity={pid:45,startTime:'12',uid:1000,exe:'/owned/chrome',exeSha256:'a'.repeat(64),ownerAttested:true};
const desktop={authenticated:true,env:{DISPLAY:':22',XAUTHORITY:'/owned/out/xauth'}};
const base=()=>({browser:identity,desktop,out:'/owned/out',readProcess:async()=>({...identity}),xdo:a=>a[0]==='search'?'100 101':a[0]==='getwindowfocus'?'101':a[0]==='getwindowpid'?'45':'Window'});
test('inventory environment retains only exact display/address/auth keys',()=>{
 assert.deepEqual(parseInventoryEnvironment(Buffer.from('SECRET=hidden\0DISPLAY=:22\0DBUS_SESSION_BUS_ADDRESS=unix:path=/tmp/private\0XAUTHORITY=/owned/xauth\0PATH=private\0')),{DISPLAY:':22',DBUS_SESSION_BUS_ADDRESS:'unix:path=/tmp/private',XAUTHORITY:'/owned/xauth'});
 assert.throws(()=>parseInventoryEnvironment(Buffer.from('DISPLAY=:1\0DISPLAY=:2\0')));
});
test('DBus PID result is closed and positive',()=>{assert.equal(parseInventoryPID('(uint32 123,)\n'),123);for(const x of ['(123,)','(uint32 0,)','(uint32 1,) trailing','secret','(uint32 9007199254740992,)'])assert.throws(()=>parseInventoryPID(x));});
test('DBus query uses only explicit address and fixed read-only owner methods',()=>{
 const a=inventoryDBusArgs('unix:path=/tmp/private','org.freedesktop.portal.Desktop');assert.deepEqual(a,['call','--address','unix:path=/tmp/private','--dest','org.freedesktop.DBus','--object-path','/org/freedesktop/DBus','--method','org.freedesktop.DBus.GetConnectionUnixProcessID','--timeout','2','org.freedesktop.portal.Desktop']);
 for(const n of ['org.evil.Run','--interactive',''])assert.throws(()=>inventoryDBusArgs('unix:path=/tmp/private',n));for(const a of ['tcp:host=remote','autolaunch:',''])assert.throws(()=>inventoryDBusArgs(a,'org.freedesktop.DBus'));
});
test('inventory reads windows/focus without native input',async()=>{const args=[];const o=base(),run=o.xdo;o.xdo=a=>{args.push(a);return run(a);};const v=await collectChooserWindows(o);assert.equal(v.windows.length,2);assert.equal(v.focus,'101');assert.equal(v.windows[0].process.pid,45);assert(args.every(a=>['search','getwindowfocus','getwindowpid','getwindowname'].includes(a[0])));});
test('missing PID/title/focus stay Unknown without aborting inventory',async()=>{const o=base();o.xdo=a=>{if(a[0]==='search')return '100';throw Object.assign(Error('missing'),{status:1});};const v=await collectChooserWindows(o);assert.equal(v.focus,'Unknown');assert.equal(v.windows[0].pid,'Unknown');assert.equal(v.windows[0].title,'Unknown');assert.equal(v.windows[0].process,'Unknown');});
test('no visible windows is explicit empty inventory',async()=>{const o=base();o.xdo=a=>{throw Object.assign(Error('none'),{status:1});};assert.deepEqual((await collectChooserWindows(o)).windows,[]);});
test('foreign/stale/unauthenticated display refuses before any query',async()=>{for(const patch of [{desktop:{...desktop,authenticated:false}},{desktop:{...desktop,env:{...desktop.env,DISPLAY:':0;evil'}}},{desktop:{...desktop,env:{...desktop.env,XAUTHORITY:'/foreign'}}},{readProcess:async()=>({...identity,startTime:'13'})}]){let calls=0;await assert.rejects(collectChooserWindows({...base(),...patch,xdo:()=>{calls++;return '';}}));assert.equal(calls,0);}});
test('oversized/malformed window inventory refuses before field reads',async()=>{for(const value of ['0','abc',Array.from({length:33},(_,i)=>String(i+1)).join(' '),'1 1']){let calls=0;await assert.rejects(collectChooserWindows({...base(),xdo:()=>{calls++;return value;}}));assert.equal(calls,1);}});
test('bounded title, PID reuse and missing process do not invent owner',async()=>{const o=base();o.xdo=a=>a[0]==='search'?'1':a[0]==='getwindowfocus'?'1':a[0]==='getwindowpid'?'55':'x'.repeat(5000);o.readProcess=async p=>p===45?identity:null;const v=await collectChooserWindows(o);assert.equal(v.windows[0].title.length,512);assert.equal(v.windows[0].titleTruncated,true);assert.equal(v.windows[0].process,'Unknown');});
test('closed inventory case, driver and native-free source entrypoints exist',async()=>{
 const c=await import('../scripts/chooser-inventory-case.mjs');assert.equal(c.inventoryCaseFile.endsWith('/docs/testing/l02-chooser-inventory-case.json'),true);
 assert.deepEqual(c.parseInventoryArgs([], 'prepare'),{});assert.throws(()=>c.parseInventoryArgs(['--reset'],'prepare'));
 assert.deepEqual(c.parseInventoryArgs([c.inventoryCaseFile,'--preflight'],'run'),{preflight:true});for(const x of [[],['/tmp/case'],[c.inventoryCaseFile,'--retry']])assert.throws(()=>c.parseInventoryArgs(x,'run'));
 const d=await readFile(new URL('./integration/chooser-inventory-native.mjs',import.meta.url),'utf8');for(const s of ['LanguageModel','l02CheckAvailability','developerPrivate','loadComparisonUnpackedChooser','--load-extension',"['key'","['type'"])assert(!d.includes(s),s);assert(d.includes('native-run-started.json'));assert(d.includes('collectChooserWindows'));assert(d.includes('independentComparisonCleanup'));
});
test('private bus requires exact daemon ancestry before service/environment reads',async()=>{
 const {collectInventoryBus}=await import('./helpers/chooser-inventory.mjs');const launcher={pid:40,startTime:'10',uid:1000,exe:'/usr/bin/dbus-run-session',exeSha256:'c'.repeat(64)},daemon={pid:42,ppid:40,startTime:'11',uid:1000,exe:'/usr/bin/dbus-daemon',exeSha256:'d'.repeat(64)};
 const o={...base(),launcher,daemonExecutable:daemon.exe,daemonSha256:daemon.exeSha256,readEnvironment:async()=>Buffer.from('DISPLAY=:22\0XAUTHORITY=/owned/out/xauth\0DBUS_SESSION_BUS_ADDRESS=unix:path=/tmp/owned\0SECRET=never\0'),query:async name=>'(uint32 '+(name==='org.freedesktop.DBus'?42:45)+',)',readProcess:async p=>p===45?identity:p===42?daemon:p===40?launcher:null};
 const v=await collectInventoryBus(o);assert.equal(v.daemon.ownerAttested,true);assert.equal(v.services.length,5);assert.equal(v.services[0].environment.DISPLAY,':22');assert(!JSON.stringify(v).includes('never'));
 let serviceCalls=0;const bad=await collectInventoryBus({...o,readProcess:async p=>p===42?{...daemon,ppid:1}:o.readProcess(p),query:async n=>{if(n!=='org.freedesktop.DBus')serviceCalls++;return o.query(n);}});assert.equal(bad.status,'Unknown');assert.equal(serviceCalls,0);
});
test('window enumeration is limited to top-level windows on the private bare X server',async()=>{const o=base(),original=o.xdo;o.xdo=args=>{if(args[0]==='search')assert.deepEqual(args,['search','--onlyvisible','--maxdepth','1','--name','.*']);return original(args);};await collectChooserWindows(o);});
