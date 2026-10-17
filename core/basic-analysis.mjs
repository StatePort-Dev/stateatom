// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 StateAtom contributors.
// Browser-safe fallback. Page observations are data, not source/lineage authority.
export async function resolveInspection({selection,requests=[],identity,resolve}){
 if(resolve)try{const a=await resolve();if(!Array.isArray(a.sources)||!a.graph||!a.stateatom)throw Error('Invalid resolver result');return {...a,capabilities:{sourceResolver:'open-ide',desktopRequired:false}};}catch{}
 const target={tab:selection.tabId??null,frame:selection.frame??0,property:selection.property,value:selection.value,page:selection.page??null,instance:selection.instance??null};
 const reason='Open IDE source resolver unavailable; DOM and collected requests remain observations. Source, operands and HTTP lineage are Unknown.';
 return {sources:[],fields:[],graph:{identity,nodes:[{...selection,trace:undefined,id:'ui',elementId:selection.id},...requests.map(r=>({id:'request:'+r.id,url:r.url,kind:'request',status:'Observed',scope:'collected exchange, not dependency'}))],edges:[]},stateatom:{target,runtime:{status:'Unknown/Unsupported',reason,nodes:[],independentObservations:[],unknownBoundaries:[reason,'Page SDK records are not source-validated without IDE.']},slices:[]},capabilities:{sourceResolver:'unavailable',desktopRequired:false},limitations:[reason,'Historical diagnostic only; not executable state or replay.']};
}
