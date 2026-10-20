// SPDX-License-Identifier: Apache-2.0
// Local historical files only. No app/source permission or linked-resource fetch.
import {readHandoffFile} from '../../../core/handoff-files.mjs';
const failure=(message,code='OPERATION_FAILED')=>Object.assign(new Error(message),{code});
export function createHandoffLibrary({$,document,rpc,onContext,openReport,openLegacy}){
 let disposed=false,entries=[],refreshEpoch=0,selectionEpoch=0,work=null;
 const selected=()=>entries.find(e=>e.id===$('report-select').value);
 const status=text=>{if(!disposed)$('diagnostic-status').textContent=text;};
 function render(){
  if(disposed)return;const entry=selected();
  $('export-report').disabled=$('delete-report').disabled=!entry||!!work;
  $('report-refresh').disabled=!!work;
  onContext({available:entry?.version===1&&!work,contextKey:entry?.id??null});
 }
 function current(token){return !disposed&&work===token&&!token.signal.aborted;}
 async function run(operation){
  if(disposed)return;work?.abort();const token=new AbortController();work=token;render();
  try{await operation(token);}catch(e){if(current(token))status(e.code==='HANDOFF_ID_CONFLICT'?'Report ID conflict: different bytes. Existing file preserved.':['UNSUPPORTED_INPUT_EVIDENCE','UNSUPPORTED_HANDOFF_FORMAT'].includes(e.code)?'This format is not supported. Ask for a compatible export or use a matching Atom reader.':e.message);}
  finally{if(work===token){work=null;render();}}
 }
 async function refresh(prefer,signal){
  if(disposed)return;const token=++refreshEpoch,selection=selectionEpoch,result=await rpc({op:'list-handoffs'},signal);
  if(disposed||token!==refreshEpoch)return;
  if(!Array.isArray(result?.entries))throw failure('Local report listing unavailable');
  const previous=$('report-select').value,chosen=prefer&&selection===selectionEpoch?prefer:previous;
  entries=result.entries;
  $('report-select').replaceChildren(...entries.map(e=>{
   const option=document.createElement('option');option.value=e.id;
   const label=e.version===2?e.title||'Issue report':e.property?'Saved '+e.property+' snapshot':'Saved snapshot';
   option.textContent=label+' · '+new Date(e.createdAt).toLocaleString();return option;
  }));
  $('report-select').value=entries.some(e=>e.id===chosen)?chosen:entries.at(-1)?.id||'';
  if(previous!==$('report-select').value)selectionEpoch++;
  render();
 }
 async function display(entry,token){
  const file=await rpc({op:'open-handoff',id:entry.id},token.signal);
  if(!current(token)||selected()?.id!==entry.id)return;
  if(!file)throw failure('Saved report expired or was removed; refresh the list');
  if(file.version===1){await openLegacy(file);return;}
  const parent=entries.find(e=>e.digest===file.record.lineage.parentArtifactDigest),parentFile=parent?await rpc({op:'open-handoff',id:parent.id},token.signal):null;
  if(!current(token)||selected()?.id!==entry.id)return;
  await openReport(file.raw,parentFile?{parentRaw:parentFile.raw}:{});
 }
 $('report-select').onchange=()=>{if(disposed)return;selectionEpoch++;work?.abort();work=null;render();};
 $('export-report').onclick=()=>run(async token=>{const entry=selected();if(entry)await display(entry,token);});
 $('report-refresh').onclick=()=>run(async token=>{await refresh(undefined,token.signal);if(current(token))status('Local file list refreshed. Reports remain historical and untrusted.');});
 $('delete-report').onclick=()=>run(async token=>{
  const entry=selected();if(!entry)return;const result=await rpc({op:'delete-handoff',id:entry.id,expectedDigest:entry.digest},token.signal);
  if(!current(token))return;await refresh(undefined,token.signal);if(current(token))status(result.removed?'Deleted the selected local report.':'Report was already absent; list refreshed.');
 });
 $('report-import').onchange=()=>run(async token=>{
  const file=$('report-import').files?.[0];if(!file)return;
  try{
   if(!Number.isSafeInteger(file.size)||file.size<0||file.size>1048576)throw failure('Report limit is 1 MiB');
   const buffer=await file.arrayBuffer();if(!current(token))return;
   if(buffer.byteLength>1048576)throw failure('Report limit is 1 MiB');
   let raw;try{raw=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(buffer);}catch{throw failure('Report must contain valid UTF-8 JSON');}
   await readHandoffFile(raw);if(!current(token))return;
   const result=await rpc({op:'save-handoff',raw},token.signal);if(!current(token))return;
   await refresh(result.entry.id,token.signal);if(!current(token))return;
   status((result.status==='unchanged'?'Existing identical report selected.':'Imported report locally; not sent.')+(result.evicted.length?' Oldest local reports removed by retention: '+result.evicted.length+'.':''));
   const entry=selected();if(entry?.id===result.entry.id)await display(entry,token);
  }finally{if(!disposed)$('report-import').value='';}
 });
 render();
 return Object.freeze({refresh,
  async getSource(signal){
   if(disposed)throw failure('Report library is closed','DISPOSED');const entry=selected();
   if(entry?.version!==1)throw failure('Select a saved v1 snapshot first');
   const file=await rpc({op:'open-handoff',id:entry.id},signal);
   if(disposed||selected()?.id!==entry.id)throw failure('Selected saved snapshot changed','CANCELLED');
   if(file?.version!==1)throw failure('Saved snapshot expired or was removed; refresh the list');return file.raw;
  },
  dispose(){if(disposed)return;disposed=true;++refreshEpoch;++selectionEpoch;work?.abort();work=null;entries=[];$('export-report').disabled=$('delete-report').disabled=$('report-import').disabled=true;}
 });
}
