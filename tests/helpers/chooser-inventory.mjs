// SPDX-License-Identifier: Apache-2.0
// Read-only metadata on an authenticated owned X display; no keyboard or activation.
import assert from 'node:assert/strict';import path from 'node:path';
import {readComparisonProcess} from './comparison-native-desktop.mjs';
export const inventoryBusNames=Object.freeze(['org.freedesktop.DBus','org.freedesktop.portal.Desktop','org.freedesktop.impl.portal.desktop.gtk','org.freedesktop.impl.portal.desktop.gnome','org.freedesktop.impl.portal.desktop.kde','org.gnome.keyring.SystemPrompter']);
export function parseInventoryEnvironment(raw){
 assert(Buffer.isBuffer(raw)&&raw.length<=1024*1024);const out={};
 for(const field of raw.toString('utf8').split('\0')){const i=field.indexOf('='),k=field.slice(0,i);if(['DISPLAY','DBUS_SESSION_BUS_ADDRESS','XAUTHORITY'].includes(k)){assert(!Object.hasOwn(out,k),'Duplicate environment key');out[k]=field.slice(i+1);assert(out[k].length<=4096);}}
 return out;
}
export function parseInventoryPID(raw){assert.equal(typeof raw,'string');const m=raw.match(/^\(uint32 ([1-9][0-9]*),\)\s*$/);assert(m,'Unexpected DBus PID result');const n=Number(m[1]);assert(Number.isSafeInteger(n)&&n<=4294967295);return n;}
export function inventoryDBusArgs(address,name){assert.equal(typeof address,'string');assert(/^unix:(?:path|abstract)=[^\s;]{1,400}(?:,guid=[a-f0-9]{32})?$/.test(address));assert(inventoryBusNames.includes(name));return ['call','--address',address,'--dest','org.freedesktop.DBus','--object-path','/org/freedesktop/DBus','--method','org.freedesktop.DBus.GetConnectionUnixProcessID','--timeout','2',name];}
export async function assertInventoryOwner({browser,desktop,out,readProcess=readComparisonProcess}){
 assert.equal(desktop?.authenticated,true);assert(/^:\d+$/.test(desktop.env.DISPLAY));assert(path.isAbsolute(out)&&path.resolve(out)===out);assert.equal(desktop.env.XAUTHORITY,out+'/xauth');assert.equal(browser?.ownerAttested,true);
 const p=await readProcess(browser.pid);for(const k of ['pid','startTime','uid','exe','exeSha256'])assert.equal(p?.[k],browser[k],'Owned browser identity changed');
}
export async function collectChooserWindows(o){
 await assertInventoryOwner(o);const {xdo,readProcess=readComparisonProcess}=o;const result={at:new Date().toISOString(),display:o.desktop.env.DISPLAY,focus:'Unknown',windows:[],errors:[]};let raw;
 try{raw=xdo(['search','--onlyvisible','--maxdepth','1','--name','.*']);}catch(e){if(e.status===1)raw='';else throw e;}
 const ids=raw.trim()?raw.trim().split(/\s+/):[];assert(ids.length<=32&&new Set(ids).size===ids.length&&ids.every(x=>/^[1-9][0-9]*$/.test(x)),'Invalid or oversized window inventory');
 const field=(a,key)=>{try{return xdo(a).trim();}catch(e){result.errors.push({key,status:e.status??null,message:String(e.message).slice(0,160)});return 'Unknown';}};
 const focus=field(['getwindowfocus'],'focus');if(/^[1-9][0-9]*$/.test(focus))result.focus=focus;
 for(const id of ids){const title=field(['getwindowname',id],id+'.title'),pidText=field(['getwindowpid',id],id+'.pid');const row={id,title:title.slice(0,512),titleTruncated:title.length>512,pid:'Unknown',process:'Unknown'};
  if(/^[1-9][0-9]*$/.test(pidText)&&Number.isSafeInteger(Number(pidText))){row.pid=Number(pidText);try{row.process=await readProcess(row.pid)??'Unknown';}catch(e){row.processError=String(e.message).slice(0,160);}}
  result.windows.push(row);
 }
 await assertInventoryOwner(o);return result;
}
export async function collectInventoryBus(o){
 const result={at:new Date().toISOString(),status:'Unknown',daemon:null,services:[],errors:[]};
 try{
  await assertInventoryOwner(o);const env=parseInventoryEnvironment(await o.readEnvironment(o.browser.pid));assert.equal(env.DISPLAY,o.desktop.env.DISPLAY);assert.equal(env.XAUTHORITY,o.desktop.env.XAUTHORITY);inventoryDBusArgs(env.DBUS_SESSION_BUS_ADDRESS,'org.freedesktop.DBus');
  const daemonPID=parseInventoryPID(await o.query('org.freedesktop.DBus',env.DBUS_SESSION_BUS_ADDRESS)),daemon=await o.readProcess(daemonPID);assert(daemon&&daemon.uid===o.browser.uid&&daemon.exe===o.daemonExecutable&&daemon.exeSha256===o.daemonSha256,'Private bus daemon identity unavailable');
  let p=daemon,owned=false;const seen=new Set();for(let i=0;p&&i<8;i++){assert(!seen.has(p.pid)&&p.uid===o.browser.uid);seen.add(p.pid);if(p.pid===o.launcher.pid){for(const k of ['startTime','exe','exeSha256','uid'])assert.equal(p[k],o.launcher[k]);owned=true;break;}p=await o.readProcess(p.ppid);}assert(owned,'Private bus daemon ancestry not attested');result.daemon={...daemon,ownerAttested:true};result.address=env.DBUS_SESSION_BUS_ADDRESS;
  for(const name of inventoryBusNames.slice(1)){const row={name,pid:'Unknown',process:'Unknown',environment:'Unknown'};try{row.pid=parseInventoryPID(await o.query(name,result.address));const before=await o.readProcess(row.pid);assert(before&&before.uid===o.browser.uid);const environment=parseInventoryEnvironment(await o.readEnvironment(row.pid)),after=await o.readProcess(row.pid);assert.deepEqual(after,before,'Service identity changed');assert.equal(parseInventoryPID(await o.query(name,result.address)),row.pid,'Service owner changed');row.process=before;row.environment=environment;}catch(e){row.error=String(e.message).slice(0,200);}result.services.push(row);}
  await assertInventoryOwner(o);const current=await o.readProcess(daemonPID);assert.deepEqual(current,daemon,'Bus daemon changed');result.status='Collected';
 }catch(e){result.errors.push(String(e.message).slice(0,200));}return result;
}
