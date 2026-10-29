// SPDX-License-Identifier: Apache-2.0
import {ChromeGroundedAnnotation} from '../../../core/derived-model-provider.mjs';
import {projectGroundedAnnotation} from '../../../core/grounded-annotations.mjs';
import {explanationIdentity} from '../../../core/inspection-explanations.mjs';
export function createPropertyLocalExplanationCard({document,facts,property}){
 const nodes=new Map(),prefix='property-'+property+'-';
 const el=(tag,text,key)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(key){nodes.set(key,e);e.setAttribute('data-atom-id',prefix+key.replace('property-',''));}return e;};
 const tools=el('details',undefined,'property-local-tools');tools.className='sp-disclosure';tools.open=false;
 tools.append(el('summary','Explain this result'));
 const answer=el('p',facts.summaries[0]);answer.setAttribute('data-atom-id',prefix+'recorded-answer');tools.append(answer);
 const scope=el('p','Computation snapshot. DOM producer and HTTP origin remain unverified.');scope.className='sp-atom-hint';tools.append(scope);
 const label=el('label'),enabled=el('input',undefined,'property-local-enabled');enabled.type='checkbox';enabled.checked=false;label.append(enabled,el('span',' Use Chrome on-device model (English)'));tools.append(label);
 const hint=el('p','Optional local note. Explain may download a model and use local disk, CPU/GPU and battery. No account or API key. The recorded answer above stays available.');hint.className='sp-atom-hint';tools.append(hint);
 const toolbar=el('div');toolbar.className='sp-toolbar';const run=el('button','Explain locally','property-local-run'),cancel=el('button','Cancel','property-local-cancel');run.type=cancel.type='button';run.disabled=true;cancel.hidden=true;toolbar.append(run,cancel);tools.append(toolbar);
 for(const key of ['property-local-note','property-local-status']){const p=el('p','',key);p.setAttribute('role','status');if(key.endsWith('status'))p.className='sp-atom-hint';tools.append(p);}
 const ui=createPropertyLocalExplanationUI({document,$:id=>nodes.get(id)});ui.render(facts,true);
 return{element:tools,dispose:()=>ui.dispose()};
}
export function createPropertyLocalExplanationUI({document,$}){
 const model=document.defaultView?.location?.protocol==='chrome-extension:'?document.defaultView.LanguageModel:null,provider=ChromeGroundedAnnotation(model);
 const tools=$('property-local-tools'),enabled=$('property-local-enabled'),run=$('property-local-run'),cancelButton=$('property-local-cancel'),note=$('property-local-note'),status=$('property-local-status');
 let facts,key,controller,epoch=0,metadata=0,notice,disposed=false,eligible=false;
 function cancel({clear=true}={}){++epoch;++metadata;clearTimeout(notice);notice=null;controller?.abort();controller=null;if(clear)note.textContent='';run.disabled=!eligible||!enabled.checked;cancelButton.hidden=true;tools.setAttribute?.('aria-busy','false');}
 function render(next,visible){
  const nextKey=explanationIdentity(next),wasEligible=eligible;eligible=!!visible&&!!projectGroundedAnnotation(next);tools.hidden=!eligible;
  facts=next;if(key===nextKey&&wasEligible===eligible)return;key=nextKey;cancel();tools.open=false;status.textContent='Optional on-device English note. The recorded answer remains above.';
 }
 enabled.onchange=async()=>{
  if(disposed)return;cancel();if(!enabled.checked){status.textContent='Local explanation off. The recorded answer is unchanged.';return;}
  if(!eligible)return;const own=metadata,current=()=>!disposed&&own===metadata&&enabled.checked;
  status.textContent='Checking local model availability…';notice=setTimeout(()=>{if(current())status.textContent='Local model status unknown; the recorded answer remains available.';},30000);
  const availability=await provider.availability();if(!current())return;clearTimeout(notice);notice=null;
  status.textContent=availability==='available'?'Local model available.':availability==='downloadable'||availability==='downloading'?'Explain starts or resumes the model download; local disk, CPU/GPU and battery may be used.':availability==='unavailable'?'Local model unavailable; the recorded answer remains available.':'Local model status unknown; the recorded answer remains available.';
 };
 run.onclick=async event=>{
  if(disposed||!eligible||!enabled.checked||event?.isTrusted!==true||document.defaultView?.navigator.userActivation?.isActive!==true)return;
  cancel();controller=new AbortController();const pending=controller,own=epoch,current=()=>!disposed&&own===epoch&&controller===pending&&!pending.signal.aborted;
  run.disabled=true;cancelButton.hidden=false;tools.setAttribute?.('aria-busy','true');
  try{
   const result=await provider.explain(facts,{userActivation:true,allowDownload:true,signal:pending.signal,timeoutMs:120000,coldInitializationTimeoutMs:300000,getCurrentFacts:()=>facts,onPhase:phase=>{if(current())status.textContent={checking:'Checking local model availability…',initializing:'Initializing local model…',downloading:'Downloading local model…',generating:'Selecting a local explanation…'}[phase];},onProgress:value=>{if(current())status.textContent='Downloading local model: '+Math.round(value*100)+'%';}});
   if(!current())return;note.textContent=result.annotation?.text??'';status.textContent=result.annotation?'Model-selected recorded facts · derived note, not evidence.':result.reason;
  }finally{if(current()){controller=null;run.disabled=false;cancelButton.hidden=true;tools.setAttribute?.('aria-busy','false');}}
 };
 cancelButton.onclick=()=>{if(disposed)return;cancel();status.textContent='Cancelled. The recorded answer is unchanged.';};
 return{render,dispose(){if(disposed)return;disposed=true;cancel();}};
}
