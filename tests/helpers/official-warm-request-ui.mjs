// SPDX-License-Identifier: Apache-2.0
// Unlike generic retrying waits, fatal product states stop this one native case.
import assert from 'node:assert/strict';
export async function waitForWarmRequestUI(read,{phase,timeoutMs,intervalMs=100,now=()=>performance.now(),pause=ms=>new Promise(r=>setTimeout(r,ms))}){
 assert(['generating','settled'].includes(phase));assert(Number.isFinite(timeoutMs)&&timeoutMs>0);const start=now();
 while(now()-start<timeoutMs){
  const ui=await read();
  if(/^Downloading local model/.test(ui.status))throw Error('UNEXPECTED_DOWNLOAD_STOP_NO_RESUME');
  if(phase==='generating'){
   if(ui.status==='Generating local explanation…'&&ui.explainDisabled&&ui.cancelHidden===false)return ui;
   if(ui.explainDisabled===false)throw Error('SETTLED_BEFORE_GENERATING');
  }else if(ui.explainDisabled===false&&ui.cancelHidden===true)return ui;
  await pause(intervalMs);
 }
 throw Error('WARM_UI_PHASE_TIMEOUT');
}
