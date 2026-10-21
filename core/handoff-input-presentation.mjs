import {handoffHasInputEvidence} from './handoff-presentation.mjs';
// SPDX-License-Identifier: Apache-2.0
// Passive wording and review catalogue for already parsed, frozen public records.
import {handoffInputEvidenceFields} from './handoff-input-evidence.mjs';
export const handoffInputCategories=Object.freeze({inputIdentities:'Input identities',inputValues:'Input values',inputLocations:'Historical input locations',inputErrors:'Input errors and notes'});
const value=x=>typeof x==='string'?(x===''?'Empty text':x):JSON.stringify(x);
const time=x=>x===null?'unknown':new Date(x).toISOString();
export function handoffInputFieldLabel(path){
 const names={'/source/id':'Source snapshot identity','/source/run':'Source run','/projection/binding/context/identity':'Selected occurrence identity','/projection/binding/context/location':'Selected historical location','/projection/selectedObservation/value':'Original selected value','/projection/editorObservation/value':'Later selected value','/projection/editorObservation/reason':'Later observation note','/projection/snapshot/investigationId':'Investigation identity','/projection/snapshot/recordedCleanup':'Recorded cleanup result','/projection/snapshot/closeReason':'Close reason'};
 if(names[path])return names[path];
 const note=path.match(/^\/projection\/snapshot\/notes\/(\d+)$/);if(note)return'Snapshot note '+(+note[1]+1);
 const tx=path.match(/^\/projection\/transactions\/(\d+)\/(.*)$/);if(!tx)return'Historical input field';
 const prefix='Change '+(+tx[1]+1),p=tx[2];if(p==='id')return prefix+' identity';
 const o=p.match(/^outcomes\/(\d+)\/(.*)$/);if(!o)return prefix+' metadata';
 const resource=prefix+' · input '+(+o[1]+1),part=o[2];
 const labels={resourceId:'identity',value:'requested value',error:'error', 'after/identity':'acknowledged identity','after/revision':'acknowledged revision','after/location':'acknowledged historical location','after/options':'acknowledged options','after/value':'acknowledged value'};
 if(labels[part])return resource+' · '+labels[part];
 const d=part.match(/^deliveries\/(\d+)\/(.*)$/);return d?resource+' · delivery '+(+d[1]+1)+' · '+({receipt:'receipt identity',requestId:'request identity',url:'origin',error:'error'}[d[2]]||'metadata'):resource+' metadata';
}
export function handoffInputFields(record){return handoffHasInputEvidence(record)&&record.inputEvidence?handoffInputEvidenceFields(record.inputEvidence):[];}
export function handoffInputSummary(record){
 if(!handoffHasInputEvidence(record))return'';
 if(record.inputEvidence===null)return'Historical input evidence: omitted from this copy; cannot be restored here.';
 const p=record.inputEvidence.projection,s=p.snapshot;
 return'Historical input evidence: '+(s?s.availableTransactions+' retained '+(s.availableTransactions===1?'change':'changes')+' · '+s.freshness:'not recorded')+'. Application consumption and selected-property effect remain unknown.';
}
export function handoffInputText(record,{advanced=false}={}){
 if(!handoffHasInputEvidence(record))return'';const packet=record.inputEvidence;
 if(!packet)return handoffInputSummary(record);
 const p=packet.projection,s=p.snapshot,a=packet.acquisition,lines=[];
 if(advanced){
  lines.push('Recorded metadata · content identity, not authorship or execution proof.','Source digest: '+packet.source.diagnosticDigest,'Source created: '+packet.source.createdAt,'Source sample hash: '+(packet.source.sampleHash??'not recorded'),'Capture digest: '+(a.captureDigest??'not recorded'),'Private reply checksum: '+a.privateReplyDigest,'Input packet checksum: '+packet.evidenceDigest,'Input component parent: '+(packet.lineage?.parentArtifactDigest??'none required'));
 }else{
  lines.push(handoffInputSummary(record),'Original selected '+p.selectedObservation.property+' observation: '+time(p.selectedObservation.observedAt)+' · '+packet.source.freshness+'.');
  if(p.editorObservation)lines.push('Later selected observation: '+time(p.editorObservation.observedAt)+' · '+p.editorObservation.status+'. Dependency on changed inputs: unknown.');
  else lines.push('Later selected observation: not recorded.');
  lines.push('Input capture: '+time(a.capturedAt)+' · '+(a.kind??'not recorded')+' · '+(a.sourceKind??'unknown source family')+'.','Occurrence binding: '+p.binding.status+' · '+p.binding.visibleJoin+'.',...p.binding.reasons.map(x=>'Binding limit: '+x+'.'));
  if(s)lines.push('Investigation: '+(s.closed?'closed':'open at capture')+' · revision '+s.revision+' · '+s.freshness+'.','History coverage: '+s.historyCoverage+'; earlier and total history unknown.','Resources present: '+s.resourcesPresent+'; pending: '+(s.pendingCount??'unknown')+'; unsupported: '+(s.unsupportedCount??'unknown')+'; discovery truncated: '+s.discoveryTruncated+'.','Cleanup: '+s.cleanup+'; tainted: '+s.tainted+'; scope: '+s.scope+'.');
  for(const tx of p.transactions??[]){lines.push('','Change '+tx.ordinal+' · '+tx.kind+' · '+(tx.mode??'mode not recorded')+' · '+tx.phase+'.','Transaction time: not recorded. Atomic: false. Consumption: unknown. Effect: unknown. Application restored: '+(tx.applicationRestored===null?'unknown':tx.applicationRestored)+'.');for(const o of tx.outcomes){lines.push('Input '+o.ordinal+' · '+o.phase+(o.afterClose?' · after close':'')+'. Before value: not recorded. Consumption and effect: unknown.');if(o.after)lines.push('Native acknowledgement: '+o.after.kind+' · '+o.after.type+'. Confirms this write acknowledgement only.');for(const d of o.deliveries)lines.push('Delivery '+d.requestOrdinal+' · delivered: '+d.delivered+' · after close: '+d.afterClose+'. Delivery does not establish application consumption.');}}
 }
 for(const f of handoffInputFields(record)){const technical=['inputIdentities','inputLocations'].includes(f.category);if(technical!==advanced)continue;lines.push(handoffInputFieldLabel(f.path)+': '+(['included','filtered'].includes(f.state)?value(f.value)+' · '+f.state+(f.state==='filtered'?' ('+f.reason+')':''):f.state)+'.');}
 if(!advanced)lines.push('',...packet.limitations,...record.inputLimitations);return lines.join('\n');
}
