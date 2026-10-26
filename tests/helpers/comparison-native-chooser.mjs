// SPDX-License-Identifier: Apache-2.0
// Owned native directory chooser only; no privileged install, model or trust APIs.
import assert from 'node:assert/strict';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {readComparisonProcess} from './comparison-native-desktop.mjs';
const titlePattern=/^Select the extension directory\.?$/;
export function comparisonChooserScreenshot(file,desktop){
 assert(/^:\d+$/.test(desktop.env.DISPLAY));
 execFileSync('/usr/bin/ffmpeg',['-hide_banner','-loglevel','error','-f','x11grab','-video_size','1100x1000','-i',desktop.env.DISPLAY,'-ss','0.25','-frames:v','1','-n',file],{env:desktop.env,timeout:5000,stdio:['ignore','pipe','pipe']});
}
export async function loadComparisonUnpackedChooser({page,s,browser,desktop,observe,xdo,checkStop=()=>{},record=async()=>{},readProcess=readComparisonProcess,capture=file=>comparisonChooserScreenshot(file,desktop)}={}){
 assert(s&&typeof s.out==='string'&&path.isAbsolute(s.out)&&path.resolve(s.out)===s.out);assert.equal(s.hostPath,path.join(s.out,'evaluation-host'));
 assert.equal(desktop?.authenticated,true);assert(/^:\d+$/.test(desktop.env.DISPLAY));assert.equal(desktop.env.XAUTHORITY,s.out+'/xauth');
 assert(browser?.ownerAttested===true&&Number.isSafeInteger(browser.pid)&&browser.pid>0&&/^\d+$/.test(browser.startTime)&&Number.isSafeInteger(browser.uid)&&path.isAbsolute(browser.exe)&&/^[a-f0-9]{64}$/.test(browser.exeSha256));
 for(const fn of [observe,xdo,checkStop,record,readProcess,capture])assert.equal(typeof fn,'function');
 const receipt={schema:'stateatom.comparison-native-chooser/1',method:'native-load-unpacked-chooser',browserPID:browser.pid,browserStartTime:browser.startTime,folder:s.hostPath,button:null,chooserWindowID:null,chooserPID:null,chooserTitle:null,focusChecks:[],screenshots:[],submitted:false,dismissed:false,startedAt:new Date().toISOString(),stage:'ownership'};
 const emit=async()=>{checkStop();await record(JSON.parse(JSON.stringify(receipt)));checkStop();};
 const owner=async()=>{checkStop();const current=await readProcess(browser.pid);for(const key of ['pid','startTime','uid','exe','exeSha256'])assert.equal(current?.[key],browser[key],'Owned Chrome identity changed');checkStop();};
 const windows=()=>{checkStop();let text;try{text=xdo(['search','--all','--onlyvisible','--pid',String(browser.pid),'--name',titlePattern.source]);}catch(e){if(e.status===1)return[];throw e;}const ids=text.trim()?text.trim().split(/\s+/):[];assert(ids.length<=1,'Ambiguous native chooser');for(const id of ids)assert(/^[1-9][0-9]*$/.test(id));return ids;};
 const windowFacts=id=>{const pid=xdo(['getwindowpid',id]),title=xdo(['getwindowname',id]);assert(/^[1-9][0-9]*$/.test(pid));assert.equal(Number(pid),browser.pid);assert(titlePattern.test(title),'Unexpected native dialog');return{pid:Number(pid),title};};
 const focused=()=>{const id=xdo(['getwindowfocus']);assert.equal(id,receipt.chooserWindowID,'Native chooser lost focus');const facts=windowFacts(id);assert.equal(facts.title,receipt.chooserTitle);return{id,facts};};
 const focus=async step=>{await owner();const{id,facts}=focused();receipt.focusChecks.push({step,windowID:id,pid:facts.pid,title:facts.title,at:new Date().toISOString()});await emit();focused();};
 await owner();assert.equal(page.url(),'chrome://extensions/');assert.deepEqual(windows(),[],'Directory chooser already present');
 await page.bringToFront();checkStop();const button=page.getByRole('button',{name:'Load unpacked',exact:true});assert.equal(await button.count(),1);assert.equal(await button.isVisible(),true);assert.equal(await button.isEnabled(),true);const bounds=await button.boundingBox();assert(bounds);for(const key of ['x','y','width','height'])assert(Number.isFinite(bounds[key]));assert(bounds.width>0&&bounds.height>0&&bounds.x>=0&&bounds.y>=0);
 receipt.button={label:'Load unpacked',bounds};receipt.stage='button';await emit();await button.click();checkStop();
 const id=await observe(async()=>{const ids=windows();return ids.length===1?ids[0]:null;},15000);const facts=windowFacts(id);receipt.chooserWindowID=id;receipt.chooserPID=facts.pid;receipt.chooserTitle=facts.title;receipt.stage='chooser';await emit();
 xdo(['windowfocus',id]);await focus('before-location');xdo(['key','--clearmodifiers','ctrl+l']);
 const shot=s.out+'/chooser-candidate.png';await capture(shot);receipt.screenshots.push(shot);await focus('before-path');
 xdo(['type','--clearmodifiers','--delay','1',s.hostPath]);await focus('before-submit');xdo(['key','--clearmodifiers','Return']);receipt.submitted=true;receipt.submittedAt=new Date().toISOString();receipt.stage='submitted';await emit();
 await observe(async()=>windows().length===0,15000);receipt.dismissed=true;receipt.dismissedAt=new Date().toISOString();receipt.stage='dismissed';await emit();return receipt;
}
export function guardInstallationChooserReceipt(receipt,s,browser){
 assert.equal(receipt?.schema,'stateatom.comparison-native-chooser/1');assert.equal(receipt.method,'native-load-unpacked-chooser');assert.equal(receipt.browserPID,browser.pid);assert.equal(receipt.browserStartTime,browser.startTime);assert.equal(receipt.folder,s.hostPath);assert.equal(receipt.chooserPID,browser.pid);assert.match(receipt.chooserWindowID,/^[1-9][0-9]*$/);assert(titlePattern.test(receipt.chooserTitle));assert.equal(receipt.button?.label,'Load unpacked');for(const key of ['x','y','width','height'])assert(Number.isFinite(receipt.button.bounds?.[key]));assert(receipt.button.bounds.x>=0&&receipt.button.bounds.y>=0&&receipt.button.bounds.width>0&&receipt.button.bounds.height>0);assert.equal(receipt.submitted,true);assert.equal(receipt.dismissed,true);assert.equal(receipt.stage,'dismissed');assert.deepEqual(receipt.screenshots,[s.out+'/chooser-candidate.png']);
 assert(Array.isArray(receipt.focusChecks));assert.deepEqual(receipt.focusChecks.map(v=>v.step),['before-location','before-path','before-submit']);
 for(const row of receipt.focusChecks){assert.equal(row.windowID,receipt.chooserWindowID);assert.equal(row.pid,browser.pid);assert.equal(row.title,receipt.chooserTitle);assert(Number.isFinite(Date.parse(row.at)));}
 for(const key of ['startedAt','submittedAt','dismissedAt'])assert(Number.isFinite(Date.parse(receipt[key])));assert(Date.parse(receipt.startedAt)<=Date.parse(receipt.submittedAt)&&Date.parse(receipt.submittedAt)<=Date.parse(receipt.dismissedAt));let previous=Date.parse(receipt.startedAt);for(const row of receipt.focusChecks){const at=Date.parse(row.at);assert(at>=previous&&at<=Date.parse(receipt.submittedAt));previous=at;}return receipt;
}
