// SPDX-License-Identifier: Apache-2.0
export const sourceMapTemplate=`
<details id="source-map-details" data-atom-id="source-map-details" class="sp-disclosure"><summary>Source maps · no IDE required</summary>
<label><input id="source-map-readonly" data-atom-id="source-map-readonly" type="checkbox"> Read-only inspection on next attach (automatic for HTTPS sites)</label>
<p class="sp-atom-hint">Explore source for a script loaded in this tab. A map does not identify the producer of the selected property.</p>
<label>Loaded JavaScript <select id="source-map-script" data-atom-id="source-map-script"></select></label>
<div class="sp-toolbar"><button id="source-map-discover" data-atom-id="source-map-discover">Load declared map</button><button id="source-map-clear" data-atom-id="source-map-clear">Clear cached maps</button></div>
<label>Choose .map or release ZIP <input id="source-map-file" data-atom-id="source-map-file" type="file" accept=".map,.zip"></label>
<p class="sp-atom-hint">Local only · no upload. An exact release ZIP contains manifest.json, built JS and maps. Sources are not saved in diagnostics.</p>
<details class="sp-disclosure"><summary>Internal artifact URL</summary><label>HTTPS map, ZIP or manifest URL <input id="source-map-url" data-atom-id="source-map-url" type="url" placeholder="https://builds.example/map"></label><button id="source-map-acquire" data-atom-id="source-map-acquire">Allow origin and load</button><p class="sp-atom-hint">Credentials are omitted. Redirects are refused. Corporate SSO may require a local bundle.</p></details>
<p id="source-map-status" data-atom-id="source-map-status" role="status"></p>
<details class="sp-disclosure"><summary>Artifact identity details</summary><pre id="source-map-identity" data-atom-id="source-map-identity"></pre></details>
<fieldset><legend>Manual source lookup · not linked to element</legend><div class="sp-toolbar"><label>Generated line (1-based) <input id="source-map-line" data-atom-id="source-map-line" type="number" min="1" value="1"></label><label>Column (0-based) <input id="source-map-column" data-atom-id="source-map-column" type="number" min="0" value="0"></label></div><button id="source-map-lookup" data-atom-id="source-map-lookup">View source</button></fieldset>
<p id="source-map-location" data-atom-id="source-map-location" role="status"></p><pre id="source-map-preview" data-atom-id="source-map-preview" class="sp-code"></pre>
</details>`;
export function createSourceMapUI({document,$,rpc,tab,load,action,requestPermission}){
 let state=null,key='',disposed=false,generation=0,previewTimer;
 const selected=()=>state?.sourceMaps?.scripts?.find(r=>r.scriptId===$('source-map-script').value);
 const clearPreview=()=>{clearTimeout(previewTimer);$('source-map-location').textContent='';$('source-map-preview').textContent='';};
 function render(s){
  state=s;const scripts=s?.sourceMaps?.scripts||[],old=$('source-map-script').value;
  $('source-map-script').replaceChildren(...scripts.map(r=>{const o=document.createElement('option');o.value=r.scriptId;let name;try{name=new URL(r.url).pathname.split('/').at(-1);}catch{name='script';}o.textContent=name+' · script '+r.scriptId;return o;}));if(scripts.some(r=>r.scriptId===old))$('source-map-script').value=old;
  show();
 }
 function show(){const r=selected(),maps=state?.sourceMaps,next=tab()+':'+maps?.epoch+':'+r?.scriptId+':'+r?.map?.mapDigest+':'+r?.map?.status;if(key!==next){key=next;generation++;clearPreview();}
  $('source-map-status').textContent=maps?.status==='Stale'?'Stale · reconnect after navigation or debugger change':r?.map?r.map.status+' · '+(r.map.hasContent?'Source available':'Map lacks source content; positions only')+' · '+r.map.reason:r?'Connect source map · not linked to element':'Attach and inspect a tab to discover loaded scripts';
  $('source-map-identity').textContent=r?JSON.stringify({...r,url:'[shown in inspected tab only]',sourceMapURL:r.sourceMapURL?'[declared reference available]':null},null,2):'';
  const unavailable=!state?.attached||!r||maps?.status==='Stale';for(const id of ['source-map-discover','source-map-acquire','source-map-file'])$(id).disabled=unavailable;
  $('source-map-lookup').disabled=unavailable||!r.map||['Mismatch','Stale','Unavailable'].includes(r.map.status);$('source-map-discover').disabled=unavailable||!r.sourceMapURL;
 }
 $('source-map-script').onchange=show;
 async function changed(fn){const id=tab(),g=generation;await fn();if(disposed||id!==tab()||g!==generation)return;await load();}
 $('source-map-file').onchange=()=>action(async()=>{const file=$('source-map-file').files[0],scriptId=selected()?.scriptId,id=tab();if(!file)return;if(file.size>8*1024*1024)throw Error('Import limit is 8 MiB');if(!/\.(map|zip)$/i.test(file.name))throw Error('Choose a .map or .zip file');const g=generation;try{const bytes=new Uint8Array(await file.arrayBuffer());if(disposed||g!==generation||id!==tab())return;let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));await changed(()=>rpc({op:'source-map-import',tabId:id,scriptId,name:file.name,data:btoa(text)}));}finally{$('source-map-file').value='';}});
 $('source-map-discover').onclick=()=>action(()=>changed(()=>rpc({op:'source-map-acquire',tabId:tab(),scriptId:selected()?.scriptId})));
 $('source-map-acquire').onclick=()=>action(async()=>{const input=$('source-map-url').value,url=new URL(input),id=tab(),scriptId=selected()?.scriptId;if(url.protocol!=='https:'&&!(url.protocol==='http:'&&url.hostname==='127.0.0.1'))throw Error('Artifact URL requires HTTPS');const permitted=requestPermission?await requestPermission(url.origin):true;if(!permitted)throw Error('Origin permission denied');await changed(()=>rpc({op:'source-map-acquire',tabId:id,scriptId,url:input}));});
 $('source-map-clear').onclick=()=>action(async()=>{await rpc({op:'source-map-clear',tabId:tab()});clearPreview();await load();});
 $('source-map-lookup').onclick=()=>action(async()=>{const id=tab(),g=generation,r=selected();const result=await rpc({op:'source-map-lookup',tabId:id,scriptId:r?.scriptId,line:Number($('source-map-line').value),column:Number($('source-map-column').value)});if(disposed||id!==tab()||g!==generation)return;$('source-map-location').textContent=(result.source?result.source+':'+result.line+':'+result.column+' · ':'')+(result.match||'Unavailable')+' · '+result.link+' · runtime operands not observed'+(result.excerpt===null?' · Map lacks source content':'');$('source-map-preview').textContent=result.excerpt||result.reason||'No source content at this position';clearTimeout(previewTimer);previewTimer=setTimeout(()=>{if(!disposed){clearPreview();$('source-map-location').textContent='Preview expired; reconnect source maps';}},300000);});
 return {render,dispose(){disposed=true;++generation;clearPreview();}};
}
