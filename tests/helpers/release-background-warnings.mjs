// SPDX-License-Identifier: Apache-2.0
// Test acceptance only. Keeps original logs intact; never filters product logging.
export function classifyReleaseConsole({appConsole=[],console=[],errors=[]},policy){
 if(policy?.schema!=='stateatom.release-background-warning-policy/1'||!Array.isArray(policy.application?.headers)||!Array.isArray(appConsole)||!Array.isArray(console)||!Array.isArray(errors))throw Error('Invalid release warning policy/input');
 const limits=new Map();for(const h of policy.application.headers){if(typeof h.message!=='string'||!Number.isSafeInteger(h.maximumCount)||h.maximumCount<1||limits.has(h.message))throw Error('Invalid release warning header');limits.set(h.message,h.maximumCount);}
 const accepted=[],rejected=[],counts=new Map();
 for(const [index,event]of appConsole.entries()){
  const header=event?.params?.args?.[0];
  if(event?.method!==policy.application.method||event?.params?.type!==policy.application.type||header?.type!=='string'||typeof header.value!=='string'||!limits.has(header.value)){rejected.push({surface:'application',index,reason:'unrecognized-event-or-header'});continue;}
  const count=(counts.get(header.value)||0)+1;counts.set(header.value,count);
  if(count>limits.get(header.value)){rejected.push({surface:'application',index,reason:'known-header-count-exceeded'});continue;}
  accepted.push({surface:'application',index,header:header.value,decision:policy.decision});
 }
 let workbenchCount=0;
 for(const[index,event]of console.entries()){
  if(event?.surface!==policy.workbench.surface||event?.type!==policy.workbench.type||event?.message!==policy.workbench.message){rejected.push({surface:event?.surface||'unknown',index,reason:'unrecognized-console-descriptor'});continue;}
  if(++workbenchCount>policy.workbench.maximumCount){rejected.push({surface:'workbench',index,reason:'known-descriptor-count-exceeded'});continue;}
  accepted.push({surface:'workbench',index,decision:policy.decision});
 }
 for(const[index]of errors.entries())rejected.push({surface:'execution-error',index,reason:'never-exempt'});
 return {decision:policy.decision,accepted,rejected,logsMutated:false};
}
