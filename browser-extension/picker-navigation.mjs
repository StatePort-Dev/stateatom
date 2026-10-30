// SPDX-License-Identifier: Apache-2.0
// Standalone-tab navigation only. The runtime still owns picker admission and identity.
export function createPickerNavigationClient(client,chrome,inspectorTabId){
 let owned=null,disposed=false;
 const current=token=>!disposed&&owned===token&&!token.signal?.aborted;
 async function activate(fromId,toId,token){
  const from=await chrome.tabs.get(fromId);
  if(!from.active||!current(token))return false;
  const window=await chrome.windows.get(from.windowId);
  if(!window.focused||!current(token))return false;
  const to=await chrome.tabs.get(toId);
  if(!current(token))return false;
  await chrome.tabs.update(toId,{active:true});
  if(to.windowId!==from.windowId&&current(token))await chrome.windows.update(to.windowId,{focused:true});
  return current(token);
 }
 const off=client.subscribeConnection?.(()=>{owned=null;})||(()=>{});
 return Object.freeze({
  subscribe:fn=>client.subscribe(fn),
  subscribeConnection:fn=>client.subscribeConnection?.(fn)||(()=>{}),
  async request(message,options){
   if(['cancel-pick','detach','connect-site','forget-site','inspect-selector'].includes(message.op))owned=null;
   const token=message.op==='pick'?{tabId:message.tabId,id:message.pickerId,signal:options?.signal,shown:false,returning:false}:null;
   if(token)owned=token;
   let result;
   try{result=await client.request(message,options);}catch(error){if(token&&owned===token)owned=null;throw error;}
   if(token&&current(token)&&result?.id===token.id&&result.status==='picking'){
    try{token.shown=await activate(inspectorTabId,token.tabId,token);}
    catch(error){if(owned===token)owned=null;await client.request({op:'cancel-pick',tabId:token.tabId,pickerId:token.id}).catch(()=>{});throw error;}
   }
   const active=owned;
   if(message.op==='state'&&active?.shown&&!active.returning&&message.tabId===active.tabId&&result?.picker?.id===active.id&&['selected','cancelled','unsupported'].includes(result.picker.status)&&current(active)){
    active.returning=true;
    // A closed inspector or a user's new foreground tab must not spoil the result.
    try{await activate(active.tabId,inspectorTabId,active);}catch{}finally{if(owned===active)owned=null;}
   }
   return result;
  },
  dispose(){disposed=true;owned=null;off();return client.dispose();}
 });
}
