// SPDX-License-Identifier: Apache-2.0
import {explanationFacts,TemplateExplanation,ChromeBuiltInExplanation} from '../../../core/action-explanations.mjs';
import {supportsCapabilityPolicy} from './transport.mjs';
export function createActionUI({document,$,rpc,tab,action}){
 let key,epoch=0,controller;
 const model=document.defaultView?.location?.protocol==='chrome-extension:'?document.defaultView.LanguageModel:null;
 const provider=ChromeBuiltInExplanation(model),node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 function cancel(){controller?.abort();controller=null;}
 function render(state){
  const stale=!!state?.stale||(state?.analysis?.actionBindings||[]).some(b=>b.freshness==='Stale');
  const sourcePermission=supportsCapabilityPolicy(state?.capabilityPolicy)?state.capabilityPolicy.operations.open:null;
  const next=JSON.stringify([state?.tabId,state?.run,state?.selection,state?.property,state?.analysis?.actionContext,state?.analysis?.actionBindings,stale,state?.stale?.at,sourcePermission]);if(key===next)return;key=next;++epoch;cancel();
  const analysis=state?.analysis,bindings=analysis?.actionBindings||[],source=bindings.filter(b=>['react-jsx','vue-template'].includes(b.mechanism)),native=bindings.filter(b=>b.mechanism==='dom-listener');
  $('action-handlers').replaceChildren();$('action-more').replaceChildren();$('action-native').replaceChildren();$('action-more-details').hidden=source.length<=3;$('action-native-details').hidden=!native.length;
  $('action-summary').textContent=stale?'Stale · inspect again for current action evidence.':source.length?'Declared in source · execution not observed':'Unknown/Unsupported · no exact source event binding. Native metadata, where available, is separate.';
  function open(source,label){const b=node('button',label,'sp-button-subtle');b.type='button';b.disabled=stale||!sourcePermission?.available;b.title=b.disabled?sourcePermission?.reason||'Stale or unavailable source connection':'';b.onclick=()=>action(async()=>{const fresh=await rpc({op:'state',tabId:tab(),refreshDeep:true});if(fresh.stale||fresh.analysis?.actionBindings?.some(b=>b.freshness==='Stale')||JSON.stringify(fresh.analysis?.actionContext)!==JSON.stringify(analysis.actionContext))throw Error('Stale action evidence; inspect again');await rpc({op:'open',tabId:tab(),source});});return b;}
  function row(b){const card=node('article',null,'sp-atom-action-card'),head=node('div',null,'sp-section-row');head.append(node('code',b.event+' → '+(b.entry?.symbol||b.binding?.expression||'Unknown')),node('span',stale?'Stale':'Declared in source','sp-status'));card.append(head);
   if(b.binding){card.append(node('pre',b.binding.expression));const loc=b.entry?.source||b.binding.source;if(loc)card.append(open(loc,'Open handler in IDE · '+loc.file.split('/').at(-1)+':'+loc.line));}
   card.append(node('p','Execution: not observed','sp-atom-hint'));
   if(b.entry?.reason)card.append(node('p',b.entry.reason,'sp-atom-hint'));
   const links=[...(b.hookRelations||[]),...(b.calls||[])];
   if(links.length){const details=node('details'),summary=node('summary','Inspect call path / relevant hooks');details.append(summary);for(const link of links){const p=node('p',(stale?'Stale':link.status==='Candidate'?'Possible call':link.status)+' · '+(link.hook||link.symbol)+' · '+(link.relation||link.reason||''),'sp-atom-hint');details.append(p);if(link.source)details.append(open(link.source,'Open in IDE · '+link.source.file.split('/').at(-1)+':'+link.source.line));}details.append(node('p','Source relationships only. Hooks run during render; a returned callback may run later.','sp-atom-hint'));card.append(details);}
   return card;
  }
  source.forEach((b,i)=>$(i<3?'action-handlers':'action-more').append(row(b)));
  for(const b of native){const p=node('p',(stale?'Stale':b.status==='Observed'?'Registered on DOM':'Unknown/Unsupported')+' · '+b.event+' · '+b.registeredOn+' · '+(b.capture?'capture':'bubble')+' · '+(b.entry?.reason||''),'sp-atom-hint');$('action-native').append(p);if(b.registration){$('action-native').append(node('p','Generated script '+b.registration.scriptId+':'+b.registration.line+':'+b.registration.column+' · original source unvalidated · once '+b.once+' · passive '+b.passive,'sp-atom-hint'));const at=b.registration.readAt;$('action-native').append(node('p',Number.isFinite(at)&&at>=0&&at<=8640000000000000?'Metadata read at '+new Date(at).toLocaleTimeString()+' · callback identity unverified':'Metadata read time not recorded · callback identity unverified','sp-atom-hint'));}}
  $('action-native').append(node('p','Bounded snapshot: selected node, document, html and body only. Other ancestors, shadow roots, window and framework portal paths are not covered. Registration is not invocation.','sp-atom-hint'));
  const facts=explanationFacts(state),template=TemplateExplanation(facts);
  $('action-explanation').textContent='';$('action-explain').disabled=!state?.selection||stale;$('action-cancel').hidden=true;$('action-local-status').textContent='Optional on-device English explanation · experimental; template always available.';
  $('action-explain').onclick=()=>{
   cancel();const own=epoch;controller=new AbortController();const pending=controller,signal=pending.signal;
   $('action-explanation').textContent=template.summary+' '+template.limitations.filter(x=>!template.summary.includes(x)).join(' ');
   if(!$('action-local-enabled').checked)return;
   $('action-cancel').hidden=false;$('action-explain').disabled=true;$('action-local-status').textContent='Checking local model / download…';
   void provider.explain(facts,{userActivation:document.defaultView?.navigator.userActivation?.isActive===true,allowDownload:true,signal,timeoutMs:120000,onProgress:p=>{if(own===epoch&&controller===pending)$('action-local-status').textContent='Downloading local model: '+Math.round(p*100)+'%';}}).then(r=>{if(own!==epoch||signal.aborted||controller!==pending)return;$('action-explanation').textContent=r.summary+' '+r.limitations.filter(x=>!r.summary.includes(x)).join(' ');$('action-local-status').textContent=r.provider==='chrome-built-in'?'Experimental local model · grounded sentence selection · not evidence':r.reason;}).finally(()=>{if(own===epoch&&controller===pending){$('action-explain').disabled=false;$('action-cancel').hidden=true;}});
  };
  $('action-cancel').onclick=()=>{cancel();$('action-local-status').textContent='Cancelled · showing template.';$('action-explain').disabled=false;$('action-cancel').hidden=true;};
  $('action-local-enabled').onchange=()=>{cancel();$('action-explain').disabled=!state?.selection||stale;$('action-cancel').hidden=true;const own=epoch;if($('action-local-enabled').checked)void provider.availability().then(a=>{if(own===epoch&&$('action-local-enabled').checked)$('action-local-status').textContent=a==='available'?'Local model available.':a==='downloadable'||a==='downloading'?'Explain simply starts/resumes the local model download; disk, CPU/GPU and battery may be used.':'Local model unavailable · using templates.';});};
 }
 return {render,dispose(){++epoch;cancel();}};
}
