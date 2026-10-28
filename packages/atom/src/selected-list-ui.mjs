// SPDX-License-Identifier: Apache-2.0
export function renderSelectedList(document,container,profile,{openSource,available=false,reason='Source opening unavailable'}={}){
 container.replaceChildren();container.hidden=!profile;if(!profile)return;
 const el=(tag,text,style)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(style)n.className=style;return n;};
 container.append(el('h3','Text origin','sp-section-title'));
 if(!profile.fullPath){container.append(el('p',profile.status+' · '+profile.reason,'sp-help'));return;}
 const row=step=>{const line=el('div',undefined,'sp-data-row sp-atom-dependency'),source=step.source;
  const link=el('button',source.file.split('/').at(-1)+':'+source.line,'sp-atom-dependency-link');link.type='button';link.disabled=!available;
  link.title=available?source.file+':'+source.line+':'+source.column:reason;link.setAttribute('aria-label','Open in code: '+step.label+' · '+source.file+':'+source.line+':'+source.column);
  link.onclick=()=>{if(!link.disabled)openSource?.(source);};line.append(el('span',step.kind==='write'?'Writes '+profile.field:step.kind==='read'?'Reads '+profile.field:step.kind==='host'?'Displays text':step.label),link);return line;};
 container.append(...profile.chain.filter(s=>['write','read','host'].includes(s.kind)).map(row));
 const details=el('details',undefined,'sp-disclosure');details.append(el('summary','How it reached the element'),...profile.chain.map(row),el('p','Code-linked source chain · Observed write, read and selected commit.','sp-atom-hint'),el('p',profile.scope,'sp-atom-hint'));
 for(const limit of profile.limits)details.append(el('p',limit,'sp-atom-hint'));container.append(details,el('p','Recorded snapshot · inspect again after changes.','sp-atom-hint'));
}
