// SPDX-License-Identifier: Apache-2.0
// Native local review choices only; no capture, file I/O, storage or app authority.
import {handoffCategoryLabels} from '../../../core/handoff-presentation.mjs';
const issueNames=['title','actual','expected','question','steps'];
const issueLabels={title:'title',actual:'what happened',expected:'expected behavior',question:'question',steps:'steps'};
const error=(code,message)=>Object.assign(new Error(message),{code});
const valueText=v=>typeof v==='string'?(v===''?'Empty text':v):JSON.stringify(v);
function title(f){
 const names={sources:'Source',nodes:'Runtime item',network:'Exchange',actionBindings:'Action',exchangeBindings:'Exchange identity',stateHandoffs:'State handoff'};
 for(const[key,label]of Object.entries(names)){const m=f.sourcePointer.match(new RegExp('/'+key+'/(\\d+)(?:/|$)'));if(m)return label+' '+(Number(m[1])+1)+' · '+f.label;}
 return f.label;
}
export function createHandoffReview({document,root,onChange=()=>{}}){
 if(!document?.createElement||!root?.replaceChildren||typeof onChange!=='function')throw Error('Native review document/root required');
 let mode=null,controls=[],categoryControls=[],fieldControls=[],issueControls=[],noteControls=[],busy=false;
 const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
 function applyDisabled(){for(const{node,locked}of controls)node.disabled=busy||(typeof locked==='function'?locked():locked);}
 function register(node,locked=false){controls.push({node,locked});node.disabled=busy||(typeof locked==='function'?locked():locked);return node;}
 function checkbox(label,key,id,{checked=false,locked=false}={}){
  const line=el('label',undefined,'sp-atom-review-check'),input=register(el('input'),locked);input.type='checkbox';input.checked=checked;input.dataset[key]=id;input.onchange=()=>{if(!input.disabled){applyDisabled();onChange();}};line.append(input,el('span',label));return{line,input,locked};
 }
 function clear(){mode=null;controls=[];categoryControls=[];fieldControls=[];issueControls=[];noteControls=[];root.replaceChildren();}
 function disclosure(label){const d=el('details',undefined,'sp-atom-review-disclosure');d.append(el('summary',label));return d;}
 function renderField(f,parent,categoryControl=null){
  const omittedCategory=()=>mode==='report'&&categoryControl?.checked===true;
  const box=el('div',undefined,'sp-atom-review-field'),name=el('label'),select=register(el('select'),omittedCategory);
  name.append(el('span',title(f)+' · '+f.evidenceKind+' historical claim'));select.dataset.spReviewField=f.id;
  const options=mode==='source'?[['default',f.category===null?'Keep recorded metadata':'Follow category'],...(f.category===null?[]:[['include','Include this field']]),['omit','Omit this field'],['replace','Reviewer replacement']]:[['default','Keep current content'],['omit','Omit this field'],['replace','Reviewer replacement']];
  for(const[value,label]of options){const option=el('option',label);option.value=value;select.append(option);}select.value='default';name.append(select);
  const preview=el('div',(f.preview.state==='filtered'?'Filtered preview: ':f.preview.state==='replaced'?'Existing reviewer redaction: ':'Saved fragment: ')+valueText(f.preview.value),'sp-atom-review-preview');
  const replacement=register(el('textarea'),omittedCategory);replacement.rows=2;replacement.maxLength=4096;replacement.hidden=true;replacement.dataset.spReviewReplacement=f.id;replacement.setAttribute('aria-label','Reviewer redaction for '+title(f)+'; not a new observation');replacement.oninput=()=>{if(!replacement.disabled)onChange();};
  select.onchange=()=>{replacement.hidden=select.value!=='replace';if(!select.disabled)onChange();};
  box.append(name,preview,replacement);parent.append(box);fieldControls.push({id:f.id,select,replacement,categoryControl,allowed:new Set(options.map(x=>x[0]))});
 }
 function content(fields,parent){
  const unavailable=[];
  for(const[category,label]of Object.entries(handoffCategoryLabels)){
   const all=fields.filter(f=>f.category===category),available=all.filter(f=>f.available);
   if(!available.length){unavailable.push(label);continue;}
   const box=el('div',undefined,'sp-atom-review-category'),check=checkbox((mode==='source'?'Include ':'Omit ')+label+' · '+available.length+' '+(available.length===1?'field':'fields'),'spReviewCategory',category);categoryControls.push(check.input);box.append(check.line);
   const details=disclosure('Review '+label.toLowerCase()+' fields');for(const f of available)renderField(f,details,check.input);
   const missing=all.length-available.length;if(missing)details.append(el('p',missing+' fields unavailable in this saved input.','sp-atom-review-help'));
   for(const scope of new Set(available.map(f=>f.scope)))details.append(el('p',scope,'sp-atom-review-help'));
   box.append(details);parent.append(box);
  }
  const metadata=fields.filter(f=>f.category===null&&f.available);
  if(metadata.length){const details=disclosure('Recorded metadata · '+metadata.length+' fields');details.append(el('p','Recorded statuses, numbers and digests are kept by default. They grant no runtime authority.','sp-atom-review-help'));for(const f of metadata)renderField(f,details);parent.append(details);}
  if(unavailable.length)parent.append(el('p','Not retained or unavailable here: '+unavailable.join(', ')+'. No additional data will be fetched.','sp-atom-review-help'));
 }
 function source(catalogue){
  clear();mode='source';content(catalogue.fields,root);
 }
 function report(record){
  clear();if(record.profile!=='reviewed-snapshot/1')return;mode='report';
  const parent=disclosure('Choose content to omit from a copy'),issue=disclosure('Reporter words');
  for(const name of issueNames){const locked=record.privacy.redactedIssueFields.includes(name),check=checkbox((locked?'Already omitted: ':'Omit ')+issueLabels[name],'spReviewIssue',name,{locked,checked:locked});issueControls.push({...check,name});issue.append(check.line);}parent.append(issue);
  const fields=[record.report.target.value,...record.report.technicalEvidence.fields].map(f=>({...f,available:['included','filtered','replaced'].includes(f.state),preview:{state:f.state,...(Object.hasOwn(f,'value')?{value:f.value}:{})}}));content(fields,parent);
  if(record.additions.length){const notes=disclosure('Developer notes · unverified');for(const[n,note]of record.additions.entries()){const check=checkbox('Omit developer note '+(n+1),'spReviewNote',note.id);noteControls.push(check.input);notes.append(check.line,el('div',note.text,'sp-atom-review-preview'));}parent.append(notes);}
  root.append(parent);
 }
 function read(){
  if(!mode)return{};
  const includeFields=[],omitFields=[],replaceFields=[];
  for(const f of fieldControls){if(mode==='report'&&f.categoryControl?.checked)continue;if(!f.allowed.has(f.select.value))throw error('INVALID_CONTENT_REVIEW','Choose a supported review option');if(f.select.value==='include')includeFields.push(f.id);else if(f.select.value==='omit')omitFields.push(f.id);else if(f.select.value==='replace'){if(f.replacement.value.length>4096)throw error('HANDOFF_LIMIT','Reviewer replacement exceeds 4096 characters');replaceFields.push({id:f.id,text:f.replacement.value});}}
  const categories=categoryControls.filter(n=>n.checked).map(n=>n.dataset.spReviewCategory);
  if(mode==='source')return{includeCategories:categories,includeFields,omitFields,replaceFields};
  return{omitIssueFields:issueControls.filter(c=>!c.locked&&c.input.checked).map(c=>c.name),omitCategories:categories,omitFields,replaceFields,omitNotes:noteControls.filter(n=>n.checked).map(n=>n.dataset.spReviewNote)};
 }
 return Object.freeze({source,report,read,clear,busy(value){busy=value===true;applyDisabled();}});
}
