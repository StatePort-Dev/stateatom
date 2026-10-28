import {staleElementProperties} from '../packages/atom/src/element-properties.mjs';
// Browser-safe state primitives. Latest served revision, never an historical union.
export function putSample(state,url,text,key=url,kind='executable'){
 let sourceURL,owner;try{sourceURL=new URL(key,url);owner=new URL(url);}catch{return;}
 const revision=Number(owner.searchParams.get('t')||0);sourceURL.searchParams.delete('t');sourceURL.hash='';const identity=sourceURL.href;
 const entries=state.sampleEntries??={};if(entries[identity]&&entries[identity].revision>revision)return;
 if(entries[identity]?.text!==text)state.sourceGeneration=(state.sourceGeneration||0)+1;
 entries[identity]={text,revision,kind,at:Date.now()};let pairs=Object.entries(entries);
 while(pairs.length>50||pairs.reduce((n,[,e])=>n+e.text.length,0)>800000){delete entries[pairs[0][0]];pairs.shift();}
 state.samples=pairs.map(([,e])=>e.text);
}
export function beginInspection(state,{keepDiagnostic=false}={}){state.experiment=null;if(!keepDiagnostic)state.diagnosticExperiment=null;state.selection=null;state.analysis=null;state.elementInspection=null;return state.inspectionGeneration=(state.inspectionGeneration||0)+1;}
export function isCurrentInspection(state,generation,run){return state.run===run&&state.inspectionGeneration===generation;}
export function lockExperiment(state){if(state.busy)throw Error('Experiment already running');const id=crypto.randomUUID();state.busy=id;return id;}
export function unlockExperiment(state,id){if(state.busy===id)state.busy=null;}

export function recordStale(state,reason){
 if(!state.analysis&&!state.selection)return;
 state.stale={elementInspection:staleElementProperties(state.elementInspection,reason),actionBindings:(state.analysis?.actionBindings||[]).slice(0,24).map(b=>({...b,freshness:'Stale'})),status:'Stale',reason,at:state.analysisAt||Date.now(),identity:state.analysis?.graph?.identity||state.stale?.identity||null,configuration:state.analysis?{ide:state.analysis.capabilities?.sourceResolver==='open-ide',instrumented:!!state.selection?.page,desktop:false}:state.stale?.configuration||{ide:null,instrumented:null,desktop:false},target:state.selection?{selector:state.selection.selector,property:state.selection.property,value:state.selection.value,instance:state.selection.instance}:null};
}
