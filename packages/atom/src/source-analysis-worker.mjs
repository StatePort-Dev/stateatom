// SPDX-License-Identifier: Apache-2.0
// Fixed owned asset. Source is passed as data, never imported or evaluated.
import {analyzeExplicitSource,sourceAnalysisGap} from '../../../core/source-function-analysis.mjs';
let used=false;
self.addEventListener('message',async event=>{
 if(used)return;used=true;const m=event.data;
 if(!m||Object.keys(m).sort().join(',')!=='id,input,schema'||m.schema!=='stateatom.source-analysis-request/1'||typeof m.id!=='string'||m.id.length>80){self.close();return;}
 let result;try{result=await analyzeExplicitSource(m.input);}catch{result=sourceAnalysisGap('Source analysis unavailable');}
 self.postMessage({schema:'stateatom.source-analysis-reply/1',id:m.id,result});self.close();
});
