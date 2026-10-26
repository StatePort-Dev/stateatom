// SPDX-License-Identifier: Apache-2.0
// Read-only metadata on an authenticated owned X display; no keyboard or activation.
import assert from 'node:assert/strict';import path from 'node:path';import {readFile} from 'node:fs/promises';
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
const scope=(ok,message)=>{if(!ok)throw Object.assign(Error(message),{code:'OWNERSHIP_SCOPE_FAILURE'});};
const same=(a,b)=>a&&b&&['pid','ppid','startTime','uid','exe','exeSha256'].every(k=>a[k]===b[k]);
export async function discoverInventoryDaemon({launcher,daemonExecutable,daemonSha256,readProcess=readComparisonProcess,readChildren=pid=>readFile('/proc/'+pid+'/task/'+pid+'/children','utf8')}){
 const current=await readProcess(launcher.pid);scope(same(current,launcher),'Launcher identity changed');
 const raw=await readChildren(launcher.pid),ids=raw.trim()?raw.trim().split(/\s+/):[];scope(ids.length<=16&&new Set(ids).size===ids.length&&ids.every(x=>/^[1-9][0-9]*$/.test(x)),'Invalid owned child inventory');const found=[];
 for(const id of ids){const p=await readProcess(Number(id));if(!p||path.basename(p.exe)!=='dbus-daemon')continue;scope(p.ppid===launcher.pid&&p.uid===launcher.uid&&p.exe===daemonExecutable&&p.exeSha256===daemonSha256,'Foreign daemon child');found.push(p);}
 scope(found.length<=1,'Ambiguous daemon children');scope(same(await readProcess(launcher.pid),launcher),'Launcher changed during discovery');return found[0]??null;
}
export async function collectInventoryBus(o){
 const result={at:new Date().toISOString(),status:'Unknown',daemon:null,services:[],errors:[]};
 const owner=async()=>{try{await assertInventoryOwner(o);}catch(e){scope(false,'Browser/display ownership changed: '+e.message);}};
 await owner();
 try{
  if(!o.daemonWitness){result.errors.push('Independent daemon witness unavailable');return result;}
  const daemon=await o.readProcess(o.daemonWitness.pid);scope(same(daemon,o.daemonWitness),'Daemon witness changed');scope(daemon.uid===o.browser.uid&&daemon.exe===o.daemonExecutable&&daemon.exeSha256===o.daemonSha256,'Foreign daemon witness');
  let p=daemon,owned=false;const seen=new Set();for(let i=0;p&&i<8;i++){scope(!seen.has(p.pid)&&p.uid===o.browser.uid,'Foreign daemon ancestry');seen.add(p.pid);if(p.pid===o.launcher.pid){scope(same(p,o.launcher),'Launcher identity changed');owned=true;break;}p=await o.readProcess(p.ppid);}scope(owned,'Private daemon ancestry not attested');
  const env=parseInventoryEnvironment(await o.readEnvironment(o.browser.pid));
  if(!env.DISPLAY||!env.XAUTHORITY||!env.DBUS_SESSION_BUS_ADDRESS){result.errors.push('Owned Chrome environment metadata unavailable');return result;}
  scope(env.DISPLAY===o.desktop.env.DISPLAY&&env.XAUTHORITY===o.desktop.env.XAUTHORITY,'Foreign Chrome display environment');
  inventoryDBusArgs(env.DBUS_SESSION_BUS_ADDRESS,'org.freedesktop.DBus');
  const daemonPID=parseInventoryPID(await o.query('org.freedesktop.DBus',env.DBUS_SESSION_BUS_ADDRESS));scope(daemonPID===daemon.pid,'Bus address belongs to a different daemon');scope(same(await o.readProcess(daemonPID),daemon),'Daemon changed after query');result.daemon={...daemon,ownerAttested:true};result.address=env.DBUS_SESSION_BUS_ADDRESS;
  for(const name of inventoryBusNames.slice(1)){const row={name,pid:'Unknown',process:'Unknown',environment:'Unknown'};try{row.pid=parseInventoryPID(await o.query(name,result.address));const before=await o.readProcess(row.pid);if(!before)throw Error('Service process metadata unavailable');scope(before.uid===o.browser.uid,'Foreign service UID');const environment=parseInventoryEnvironment(await o.readEnvironment(row.pid)),after=await o.readProcess(row.pid);scope(same(after,before),'Service identity changed');scope(parseInventoryPID(await o.query(name,result.address))===row.pid,'Service owner changed');if(environment.DISPLAY)scope(environment.DISPLAY===o.desktop.env.DISPLAY,'Service belongs to a different display');row.process=before;row.environment=environment;}catch(e){if(e.code==='OWNERSHIP_SCOPE_FAILURE')throw e;row.error=String(e.message).slice(0,200);}result.services.push(row);}
  await owner();scope(same(await o.readProcess(daemonPID),daemon),'Bus daemon changed');result.status='Collected';
 }catch(e){if(e.code==='OWNERSHIP_SCOPE_FAILURE')throw e;result.errors.push(String(e.message).slice(0,200));}return result;
}
