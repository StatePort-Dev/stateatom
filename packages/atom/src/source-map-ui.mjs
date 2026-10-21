// SPDX-License-Identifier: Apache-2.0
import {supportsCapabilityPolicy} from './transport.mjs';
import {isCurrentGeneratedAnchor} from '../../../core/source-anchor.mjs';
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
<details id="source-map-manual" data-atom-id="source-map-manual" class="sp-disclosure"><summary>Advanced lookup · not linked to element</summary><fieldset><legend>Manual source lookup</legend><div class="sp-toolbar"><label>Generated line (1-based) <input id="source-map-line" data-atom-id="source-map-line" type="number" min="1" value="1"></label><label>Column (0-based) <input id="source-map-column" data-atom-id="source-map-column" type="number" min="0" value="0"></label></div><button id="source-map-lookup" data-atom-id="source-map-lookup">View source</button></fieldset></details>
<p id="source-map-location" data-atom-id="source-map-location" role="status"></p><pre id="source-map-preview" data-atom-id="source-map-preview" class="sp-code"></pre>
<p id="source-analysis-status" data-atom-id="source-analysis-status" class="sp-atom-hint" role="status"></p><button id="source-analysis-cancel" data-atom-id="source-analysis-cancel" hidden>Cancel source analysis</button>
<details id="source-analysis-details" data-atom-id="source-analysis-details" class="sp-disclosure" hidden><summary>Source function and possible calls</summary><p id="source-analysis-summary" data-atom-id="source-analysis-summary" class="sp-atom-hint"></p><ul id="source-analysis-calls" data-atom-id="source-analysis-calls"></ul><p id="source-analysis-identifiers" data-atom-id="source-analysis-identifiers" class="sp-atom-hint"></p><pre id="source-analysis-expression" data-atom-id="source-analysis-expression" class="sp-code"></pre></details>
</details>`;
export function createSourceMapUI({document,$,rpc,tab,load,action,requestPermission,sourceAnalysis}){
 let state=null,key='',disposed=false,generation=0,previewTimer,controller;
 const selected=()=>state?.sourceMaps?.scripts?.find(r=>r.scriptId===$('source-map-script').value);
 const clearPreview=()=>{controller?.abort();controller=null;sourceAnalysis?.cancel();clearTimeout(previewTimer);$('source-map-location').textContent='';$('source-map-preview').textContent='';$('source-analysis-status').textContent='';$('source-analysis-cancel').hidden=true;$('source-analysis-details').hidden=true;$('source-analysis-details').open=false;$('source-analysis-summary').textContent='';$('source-analysis-calls').replaceChildren();$('source-analysis-identifiers').textContent='';$('source-analysis-expression').textContent='';};
 const scope=()=>JSON.stringify([state?.attached,state?.stale,state?.analysis?.actionContext,(state?.analysis?.actionBindings||[]).filter(b=>['dom-listener','react-host-props'].includes(b.mechanism)).map(b=>[b.id,b.event,b.status,b.freshness,b.identity,b.registeredOn,b.registration?.scriptId,b.registration?.line,b.registration?.column,b.registration?.positionBase,b.registration?.registeredNode,b.capture,b.passive,b.once,b.boundOn,b.property,b.generated,b.frameworkVersion,b.carrier?.profile,b.carrier?.hostNode,b.carrier?.frameId,b.carrier?.executionContextId])]);
 function render(s){
  state=s;const scripts=s?.sourceMaps?.scripts||[],old=$('source-map-script').value;
  $('source-map-script').replaceChildren(...scripts.map(r=>{const o=document.createElement('option');o.value=r.scriptId;let name;try{name=new URL(r.url).pathname.split('/').at(-1);}catch{name='script';}o.textContent=name+' · script '+r.scriptId;return o;}));if(scripts.some(r=>r.scriptId===old))$('source-map-script').value=old;
  show();
 }
 function show(){const r=selected(),maps=state?.sourceMaps,next=tab()+':'+maps?.epoch+':'+maps?.status+':'+r?.scriptId+':'+r?.map?.mapDigest+':'+r?.map?.status+':'+JSON.stringify([r?.frameId,r?.executionContextId,r?.cdpHash,r?.digest])+':'+scope();if(key!==next){key=next;generation++;clearPreview();}
  $('source-map-status').textContent=maps?.status==='Stale'?'Stale · reconnect after navigation or debugger change':r?.map?r.map.status+' · '+(r.map.hasContent?'Source available':'Map lacks source content; positions only')+' · '+r.map.reason:r?'Connect source map · not linked to element':'Attach and inspect a tab to discover loaded scripts';
  $('source-map-identity').textContent=r?JSON.stringify({...r,url:'[shown in inspected tab only]',sourceMapURL:r.sourceMapURL?'[declared reference available]':null},null,2):'';
  const unavailable=!state?.attached||!r||maps?.status==='Stale';for(const id of ['source-map-discover','source-map-acquire','source-map-file'])$(id).disabled=unavailable;
  $('source-map-lookup').disabled=unavailable||!r.map||['Mismatch','Stale','Unavailable'].includes(r.map.status);$('source-map-discover').disabled=unavailable||!r.sourceMapURL;
  $('source-map-clear').disabled=false;
  const policy=state?.capabilityPolicy,known=supportsCapabilityPolicy(policy);
  for(const [id,op] of [['source-map-file','source-map-import'],['source-map-discover','source-map-acquire'],['source-map-acquire','source-map-acquire'],['source-map-lookup','source-map-lookup'],['source-map-clear','source-map-clear']]){
   const decision=known?policy.operations?.[op]:null;$(id).disabled||=!decision?.available;$(id).title=decision?.available?'':decision?.reason||'Host does not advertise capability policy v1';
  }
 }
 $('source-map-script').onchange=show;
 async function changed(fn){const id=tab(),g=generation;clearPreview();await fn();if(disposed||id!==tab()||g!==generation)return;await load({refreshDeep:false});}
 $('source-map-file').onchange=()=>action(async()=>{const file=$('source-map-file').files[0],scriptId=selected()?.scriptId,id=tab();if(!file)return;if(file.size>8*1024*1024)throw Error('Import limit is 8 MiB');if(!/\.(map|zip)$/i.test(file.name))throw Error('Choose a .map or .zip file');const g=generation;try{const bytes=new Uint8Array(await file.arrayBuffer());if(disposed||g!==generation||id!==tab())return;let text='';for(let i=0;i<bytes.length;i+=16384)text+=String.fromCharCode(...bytes.subarray(i,i+16384));await changed(()=>rpc({op:'source-map-import',tabId:id,scriptId,name:file.name,data:btoa(text)}));}finally{$('source-map-file').value='';}});
 $('source-map-discover').onclick=()=>action(()=>changed(()=>rpc({op:'source-map-acquire',tabId:tab(),scriptId:selected()?.scriptId})));
 $('source-map-acquire').onclick=()=>action(async()=>{const input=$('source-map-url').value,url=new URL(input),id=tab(),scriptId=selected()?.scriptId;if(url.protocol!=='https:'&&!(url.protocol==='http:'&&url.hostname==='127.0.0.1'))throw Error('Artifact URL requires HTTPS');const permitted=requestPermission?await requestPermission(url.origin):true;if(!permitted)throw Error('Origin permission denied');await changed(()=>rpc({op:'source-map-acquire',tabId:id,scriptId,url:input}));});
 $('source-map-clear').onclick=()=>action(async()=>{clearPreview();await rpc({op:'source-map-clear',tabId:tab()});await load({refreshDeep:false});});
 $('source-map-lookup').onclick=()=>action(async()=>{const id=tab(),g=generation,r=selected();clearPreview();const result=await rpc({op:'source-map-lookup',tabId:id,scriptId:r?.scriptId,line:Number($('source-map-line').value),column:Number($('source-map-column').value)});if(disposed||id!==tab()||g!==generation)return;$('source-map-location').textContent=(result.source?result.source+':'+result.line+':'+result.column+' · ':'')+(result.match||'Unavailable')+' · '+result.link+' · runtime operands not observed'+(result.excerpt===null?' · Map lacks source content':'');$('source-map-preview').textContent=result.excerpt||result.reason||'No source content at this position';clearTimeout(previewTimer);previewTimer=setTimeout(()=>{if(!disposed){clearPreview();$('source-map-location').textContent='Preview expired; reconnect source maps';}},300000);});
 $('source-analysis-cancel').onclick=()=>sourceAnalysis?.cancel();
 function showAnalysis(result,parent){
  $('source-analysis-cancel').hidden=true;
  const linked=parent.status==='Code-linked'&&parent.match==='Exact artifact match';
  $('source-analysis-status').textContent='Source analysis · '+result.status+' · '+(linked?'Exact source mapping':'Candidate · source mapping unverified')+(result.gaps?.length?' · '+result.gaps.join('; '):'');
  if(!result.entry)return;
  $('source-analysis-details').hidden=false;
  $('source-analysis-summary').textContent=(result.entry.symbol||'Anonymous function')+' · lexical source only; execution and branch choice not observed; runtime values unavailable.';
  $('source-analysis-calls').replaceChildren(...(result.calls||[]).map(call=>{const li=document.createElement('li'),index=call.source?.file?.match(/\/(\d+)$/)?.[1];li.textContent='Possible call: '+(call.symbol||call.expression||'Unknown')+' · Candidate · '+(call.targetStatus==='Code-linked'?'lexical target in included source'+(index===undefined?'':' #'+(Number(index)+1))+' at '+call.source.line+':'+call.source.column:'target unknown')+'; execution not observed';return li;}));
  $('source-analysis-identifiers').textContent='Source identifiers: '+((result.identifiers||[]).map(v=>v.name).join(', ')||'none')+' · values unavailable';
  $('source-analysis-expression').textContent=result.expression||'';
 }
 function current(anchor){const binding=state?.analysis?.actionBindings?.find(b=>b.id===anchor?.acquisition?.bindingId);return !disposed&&state?.attached&&!state?.stale&&isCurrentGeneratedAnchor(anchor,{context:state?.analysis?.actionContext,binding,maps:state?.sourceMaps});}
 function connectNative(anchor){if(!current(anchor))throw Error('Native source context changed; refresh handlers');$('source-map-details').open=true;$('source-map-script').value=anchor.generated.scriptId;show();$('source-map-file').focus();}
 async function viewNative(anchor){
  if(!current(anchor))throw Error('Native source context changed; refresh handlers');
  const known=supportsCapabilityPolicy(state?.capabilityPolicy),decision=known?state.capabilityPolicy.operations['source-map-anchor']:null;if(!decision?.available)throw Error(decision?.reason||'Host does not advertise native source reading');
  $('source-map-details').open=true;$('source-map-script').value=anchor.generated.scriptId;show();clearPreview();
  const own=new AbortController();controller=own;const id=tab(),g=generation;
  try{const result=await rpc({op:'source-map-anchor',tabId:id,bindingId:anchor.acquisition.bindingId,snapshotId:anchor.acquisition.snapshotId,contextKey:JSON.stringify(anchor.identity),...(sourceAnalysis?.available?{includeAnalysisInput:true}:{})},own.signal);
   if(disposed||own.signal.aborted||id!==tab()||g!==generation)return;await load({refreshDeep:false});if(disposed||own.signal.aborted||id!==tab()||g!==generation)return;
   const host=result.anchor?.relation==='selected-react-compatible-host-callback-generated-location';$('source-map-location').textContent=(result.source?result.source+':'+result.line+':'+result.column+' · ':'')+result.status+' · '+(result.match||'Unavailable')+(host?' · current own host callback-slot location; renderer/version unverified; execution not observed; property producer unknown':' · registered listener location; execution not observed; property producer unknown')+(result.contentStatus==='Unavailable'?' · Position only; source content unavailable':'');
   $('source-map-preview').textContent=result.excerpt||result.reason||'No source content at this position';
   previewTimer=setTimeout(()=>{if(!disposed){clearPreview();$('source-map-location').textContent='Preview expired; reconnect source maps';}},300000);
   $('source-map-preview').scrollIntoView?.({block:'nearest'});
   if(sourceAnalysis?.available&&result.analysisInput){
    $('source-analysis-status').textContent='Analyzing source…';$('source-analysis-cancel').hidden=false;
    const analyzed=await sourceAnalysis.analyze(result.analysisInput,{signal:own.signal});
    if(disposed||own.signal.aborted||id!==tab()||g!==generation)return;showAnalysis(analyzed,result);
   }else $('source-analysis-status').textContent='Source analysis unavailable · '+(sourceAnalysis?.available?'No usable original source input':'This inspector provides source preview only');
  }catch(e){if(!own.signal.aborted&&!disposed)throw e;}finally{if(controller===own)controller=null;}
 }
 return {render,connectNative,viewNative,dispose(){disposed=true;++generation;clearPreview();sourceAnalysis?.dispose();}};
}
