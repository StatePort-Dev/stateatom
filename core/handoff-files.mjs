import {parseHandoffActionReport,appendHandoffActionFinding,appendHandoffActionSource,redactHandoffActionReport} from './handoff-action-report.mjs';
// SPDX-License-Identifier: Apache-2.0
// Explicit passive file dispatch. The original minimal codec stays strict.
import {parseHandoffReport as parseMinimal,readHandoffFile as readMinimal,appendHandoffFinding as appendMinimal,handoffArtifactDigest} from './handoff-report.mjs';
import {parseReviewedHandoffReport,appendReviewedHandoffFinding,redactReviewedHandoff} from './handoff-reviewed.mjs';
import {parseHandoffSourceEvidence,appendSourceEvidenceNote,redactHandoffSourceEvidence} from './handoff-source-attachment.mjs';
import {parseHandoffInputReport,appendHandoffInputFinding,appendHandoffInputSource,redactHandoffInputReport} from './handoff-input-report.mjs';
import {appendHandoffSourceEvidence} from './handoff-source-attachment.mjs';
export {handoffArtifactDigest};
const MAX=1048576,error=(code,message)=>Object.assign(new Error(message),{code});
function profile(raw){
 if(typeof raw!=='string')throw error('INVALID_HANDOFF_REPORT','JSON text required');
 if(new TextEncoder().encode(raw).length>MAX)throw error('HANDOFF_LIMIT','Historical file exceeds 1 MiB');
 try{return JSON.parse(raw)?.profile;}catch{throw error('INVALID_HANDOFF_REPORT','Malformed JSON');}
}
export async function parseHandoffReport(raw,options={}){
 const kind=profile(raw);if(kind==='action-evidence/1')return parseHandoffActionReport(raw,options);if(kind==='input-evidence/1')return parseHandoffInputReport(raw,options);if(kind==='source-evidence/1')return parseHandoffSourceEvidence(raw,options);return kind==='reviewed-snapshot/1'?parseReviewedHandoffReport(raw,options):parseMinimal(raw,options);
}
export async function readHandoffFile(raw,options={}){
 if(!['reviewed-snapshot/1','source-evidence/1','input-evidence/1','action-evidence/1'].includes(profile(raw)))return readMinimal(raw,options);
 return Object.freeze({version:2,...await parseHandoffReport(raw,options)});
}
export async function appendHandoffFinding(raw,finding,options={}){
 const kind=profile(raw);if(kind==='action-evidence/1')return appendHandoffActionFinding(raw,finding,options);if(kind==='input-evidence/1')return appendHandoffInputFinding(raw,finding,options);if(kind==='source-evidence/1')return appendSourceEvidenceNote(raw,finding,options);return kind==='reviewed-snapshot/1'?appendReviewedHandoffFinding(raw,finding,options):appendMinimal(raw,finding,options);
}
export async function redactHandoffFile(raw,review={},options={}){
 const kind=profile(raw);if(kind==='action-evidence/1')return redactHandoffActionReport(raw,review,options);if(kind==='input-evidence/1')return redactHandoffInputReport(raw,review,options);if(kind==='source-evidence/1')return redactHandoffSourceEvidence(raw,review,options);if(kind==='reviewed-snapshot/1')return redactReviewedHandoff(raw,review,options);throw error('UNSUPPORTED_HANDOFF_FORMAT','Granular privacy is unavailable for this original profile.');
}
export async function readHandoffInput(file){
 const size=file?.size;
 if(!Number.isSafeInteger(size)||size<0||size>MAX)throw error('HANDOFF_LIMIT','Diagnostic limit is 1 MiB');
 const data=await file.arrayBuffer();if(data.byteLength>MAX||data.byteLength!==size)throw error('HANDOFF_LIMIT','File size changed or exceeds 1 MiB');
 try{return new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(data);}catch{throw error('INVALID_HANDOFF_REPORT','File is not valid UTF-8. Original files unchanged.');}
}

export function appendHandoffSourceFinding(raw,developerRaw,files,finding,options={}){
 return profile(raw)==='action-evidence/1'?appendHandoffActionSource(raw,developerRaw,files,finding,options):profile(raw)==='input-evidence/1'?appendHandoffInputSource(raw,developerRaw,files,finding,options):appendHandoffSourceEvidence(raw,developerRaw,files,finding,options);
}
