// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
export function warmSourceOrder(){const rows=[];for(const warmup of [true,false])for(let block=0;block<(warmup?3:20);block++)(block%2?['javascript-es6','synthetic']:['synthetic','javascript-es6']).forEach((caseId,position)=>rows.push({ordinal:rows.length,warmup,block,position,caseId}));return rows;}
const distribution=values=>{const a=[...values].sort((a,b)=>a-b),n=a.length;assert(n);return{n,min:a[0],p50:n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2,p95:a[Math.ceil(n*.95)-1],max:a[n-1]};};
export function summarizeWarmSource(rows,host){
 const r=rows.filter(x=>x.host===host),order=warmSourceOrder();assert.equal(r.length,46,'Missing/duplicate warm rows');
 const tabs=new Map();for(const x of r){if(tabs.has(x.caseId))assert.equal(x.tabId,tabs.get(x.caseId),'Changed case target');else tabs.set(x.caseId,x.tabId);}assert.equal(new Set(tabs.values()).size,2,'Distinct corpus targets required');
 for(let i=0;i<order.length;i++){const x=r[i];for(const[k,v]of Object.entries(order[i]))assert.equal(x[k],v,'Changed/reordered '+k);assert(Number.isSafeInteger(x.tabId)&&x.tabId>0);for(const k of ['trusted','newPreview','analysisStarted','exactMatch'])assert.equal(x[k],true,k);assert.equal(x.status,'complete');assert(Number.isSafeInteger(x.previewChars)&&x.previewChars>0);assert.equal(x.analysisStatus,x.caseId==='synthetic'?'Available':'Partial');for(const k of ['previewReadyMs','previewPaintMs','analysisReadyMs','analysisPaintMs'])assert(Number.isFinite(x[k])&&x[k]>0,k);assert(x.previewPaintMs>=x.previewReadyMs);assert(x.analysisReadyMs>=x.previewReadyMs);assert(x.analysisPaintMs>=x.analysisReadyMs&&x.analysisPaintMs>=x.previewPaintMs);}
 const measured=r.filter(x=>!x.warmup),cases={};for(const id of ['synthetic','javascript-es6']){const a=measured.filter(x=>x.caseId===id),preview=distribution(a.map(x=>x.previewPaintMs)),analysis=distribution(a.map(x=>x.analysisPaintMs));cases[id]={expectedStatus:id==='synthetic'?'Available':'Partial',preview,analysis,previewReady:distribution(a.map(x=>x.previewReadyMs)),analysisReady:distribution(a.map(x=>x.analysisReadyMs)),targets:{previewPass:preview.p95<=3000,analysisPass:analysis.p95<=3000}};}
 return{host,raw:r.length,measured:measured.length,warmup:r.length-measured.length,cases,performanceAcceptance:false,targetsWaived:false};
}
export function assertMapCache(cache,{cleared=false}={}){for(const k of ['retainedMapBytes','parsedInputBytes'])assert(Number.isSafeInteger(cache?.[k])&&cache[k]>=0,k);assert(cache.retainedMapBytes+cache.parsedInputBytes<=8*1024*1024);if(cleared){assert.equal(cache.retainedMapBytes,0);assert.equal(cache.parsedInputBytes,0);}}

// Serialized into the own inspector only. No app evaluation or source in rows.
export function installWarmSourceTiming(){
 globalThis.__warmSourceTiming?.close();
 const q=id=>document.querySelector('[data-atom-id="'+id+'"]'),preview=q('source-map-preview'),location=q('source-map-location'),analysis=q('source-analysis-status');
 if(!preview||!location||!analysis)throw Error('Own source UI required');
 let armed=null,pending=null,epoch=0;const samples=[],errors=[];
 const fail=message=>{errors.push(message);pending=null;armed=null;epoch++;};
 const click=event=>{if(!event.target.closest('[data-atom-id="native-source-0"]'))return;if(pending){fail('Overlapping warm gesture');return;}if(!armed)return;if(!event.isTrusted){fail('Untrusted warm gesture');return;}pending={...armed,start:performance.now(),epoch:++epoch,trusted:true,newPreview:false,analysisStarted:false,exactMatch:false};armed=null;};
 const complete=t=>{if(pending!==t||!t.previewPaintMs||!t.analysisPaintMs)return;const{start,epoch:_,...row}=t;samples.push({...row,status:'complete'});pending=null;};
 const paint=(t,kind,text)=>requestAnimationFrame(()=>requestAnimationFrame(()=>{if(pending!==t||epoch!==t.epoch)return;const node=kind==='preview'?preview:analysis;if(node.textContent!==text){fail('Content changed before '+kind+' paint');return;}t[kind+'PaintMs']=performance.now()-t.start;complete(t);}));
 const observer=new MutationObserver(records=>{const t=pending;if(!t)return;const newPreview=records.some(r=>r.target===preview||preview.contains(r.target)),text=preview.textContent;
  if(!t.newPreview&&newPreview&&text.trim()&&location.textContent.includes('Code-linked')&&location.textContent.includes('Exact artifact match')){t.newPreview=true;t.exactMatch=true;t.previewChars=text.length;t.previewReadyMs=performance.now()-t.start;paint(t,'preview',text);}
  if(analysis.textContent==='Analyzing source…')t.analysisStarted=true;
  const match=analysis.textContent.match(/^Source analysis · (Available|Partial|Unavailable|Budget|Cancelled) ·/);
  if(t.newPreview&&t.analysisStarted&&match&&!t.analysisReadyMs){t.analysisStatus=match[1];t.analysisReadyMs=performance.now()-t.start;paint(t,'analysis',analysis.textContent);}
 });
 for(const node of [preview,location,analysis])observer.observe(node,{childList:true,subtree:true,characterData:true});document.addEventListener('click',click,true);
 globalThis.__warmSourceTiming={samples,errors,arm(meta){if(armed||pending)throw Error('Warm timing already armed');armed={...meta};},close(){epoch++;observer.disconnect();document.removeEventListener('click',click,true);pending=null;armed=null;}};
}
