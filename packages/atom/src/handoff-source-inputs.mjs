// SPDX-License-Identifier: Apache-2.0
// Explicit local File inputs only. No capture, lookup, download or app authority.
import {parseDiagnostic} from '../../../core/diagnostic.mjs';
import {filterHandoffReviewText} from '../../../core/handoff-content.mjs';
const MAX=1048576,FILE_MAX=262144,TOTAL_MAX=524288;
const fail=message=>{throw Error(message);};
function sizes(files,maxCount,maxEach,maxTotal){if(files.length<1||files.length>maxCount)fail('Choose one to '+maxCount+' local files.');let total=0;for(const f of files){if(!Number.isSafeInteger(f.size)||f.size<0||f.size>maxEach||(total+=f.size)>maxTotal)fail('Local file byte limit exceeded.');}}
async function bytes(f){const b=await f.arrayBuffer();if(Object.getPrototypeOf(b)!==ArrayBuffer.prototype||b.byteLength!==f.size)fail('Local file size changed while reading.');return b;}
export function createHandoffSourceInputs({document,$,onChange=()=>{},onState=()=>{}}){
 let parent=null,generation=0,developerRaw=null,paths=[],rows=[],loading=false,error='';
 const diagnostic=$('reader-source-diagnostic'),files=$('reader-source-files'),root=$('reader-source-rows'),status=$('reader-source-input-status');
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 function reason(){if(!parent)return 'Open an issue report first.';if(loading)return 'Reading the selected Developer diagnostic…';if(error)return error;if(!developerRaw)return 'Choose a saved Developer diagnostic. No source files are read until Review.';if(!paths.length)return 'This diagnostic records no source paths. You can still add a note without a comparison.';if(!rows.length)return 'Choose one to eight local files, then select their exact recorded paths.';const used=new Set();for(const r of rows){if(!paths.includes(r.path))return 'Choose an exact recorded path for every local file.';if(used.has(r.path))return 'Choose unique recorded paths; a path cannot be mapped twice.';used.add(r.path);}return '';}
 function ready(){return reason()==='';}
 function update(){status.textContent=reason()||'Ready for local comparison. Only checked metadata enters the revision; source text stays local.';onState();}
 function changed(){onChange();update();}
 function draw(){root.replaceChildren();for(const[i,r]of rows.entries()){
  const box=el('div');box.className='sp-atom-review-category';const label=el('label',filterHandoffReviewText(String(r.file.name||'Local file'))+' · '+r.file.size+' bytes'),select=el('select');select.dataset.spSourcePath=String(i);const empty=el('option','Choose recorded path…');empty.value='';select.append(empty);for(const path of paths){const option=el('option',filterHandoffReviewText(path));option.value=path;select.append(option);}select.value=r.path;select.onchange=()=>{r.path=select.value;changed();};label.append(select);
  const consent=el('label');consent.className='sp-atom-review-check';const check=el('input');check.type='checkbox';check.checked=r.include;check.dataset.spSourceInclude=String(i);check.onchange=()=>{r.include=check.checked;changed();};consent.append(check,el('span','Include comparison metadata for this file'));box.append(label,consent);root.append(box);
 }}
 function clear(){generation++;developerRaw=null;paths=[];rows=[];loading=false;error='';diagnostic.value='';files.value='';root.replaceChildren();update();}
 diagnostic.onchange=async()=>{
  const token=++generation,owner=parent;developerRaw=null;paths=[];loading=false;error='';rows=rows.map(r=>({file:r.file,path:'',include:false}));draw();onChange();
  try{const selected=Array.from(diagnostic.files||[]);sizes(selected,1,MAX,MAX);loading=true;update();const raw=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(await bytes(selected[0])),record=parseDiagnostic(raw);if(token!==generation||owner!==parent)return;developerRaw=raw;paths=[...new Set(record.sources.map(s=>s.file))];}
  catch(e){if(token!==generation||owner!==parent)return;error='Developer diagnostic: '+e.message;}
  finally{if(token===generation&&owner===parent){loading=false;draw();update();}}
 };
 files.onchange=()=>{rows=[];error='';try{const selected=Array.from(files.files||[]);sizes(selected,8,FILE_MAX,TOTAL_MAX);rows=selected.map(file=>({file,path:'',include:false}));}catch(e){error=e.message;}draw();changed();};
 clear();
 return Object.freeze({setParent(key){if(key===parent)return;parent=key;clear();},reset(){clear();onChange();},ready,state(){return Object.freeze({diagnosticReady:!!developerRaw,loading,count:rows.length,ready:ready()});},async prepare(){
  const why=reason();if(why)fail(why);const raw=developerRaw,selected=rows.map(r=>({file:r.file,path:r.path,include:r.include}));sizes(selected.map(r=>r.file),8,FILE_MAX,TOTAL_MAX);const result=[];for(const r of selected)result.push({file:r.path,bytes:await bytes(r.file)});return{developerDiagnosticRaw:raw,files:result,includeFiles:selected.filter(r=>r.include).map(r=>r.path)};
 }});
}
