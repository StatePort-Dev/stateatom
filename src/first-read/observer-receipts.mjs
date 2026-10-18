// SPDX-License-Identifier: Apache-2.0
// Opt-in acquisition in the owned observer. No first-render/effect certificate:
// Member receipts identify the original receiver. Destructuring receivers are
// reconstructed candidates requiring an own-data/no-write proof; a restoring
// getter can return a foreign object during the original pattern operation.
// Neither record establishes the scalar's current ancestry.
import {parse} from '@babel/parser';
export function instrumentReadReceipts(source,{ledgerURL='/@stateatom/first-read-query'}={}){
 let code=source;
 function once(original,replacement){const i=code.indexOf(original);if(i<0||code.indexOf(original,i+1)>=0)throw Error('Owned read receipt site changed: '+original.slice(0,64));code=code.slice(0,i)+replacement+code.slice(i+original.length);}
 once('  const api={version:1,','  const api={version:1,firstReadObservations(){return active?__firstSnapshot():{status:"Unknown/Unsupported",reason:"Observer stopped",events:[],fullPath:false};},');
 once('createStateHandoffLedger({page,field,isFiber:v=>nativeFibers.has(v),origin:v=>origins.get(v),add,weakRef:NativeWeakRef})','createStateHandoffLedger({page,field,isFiber:v=>nativeFibers.has(v),origin:v=>origins.get(v),add,weakRef:NativeWeakRef,objectId:__firstObjectId})');
 once('  function recordJSON(exchange,value){',`  function firstReadReceipt(n,receiver,scope,value){
    if(!active||!n||!n.origin||typeof n.origin.firstReadRootId!=='string')return;
    try{
      const receiverId=__firstObjectId(receiver);if(!receiverId)return;
      __firstTap(n.kind==='destructure'?'field-receiver-candidate':'field',n.id,n.origin.firstReadRootId,receiverId,n.origin.pointer,value);
      __firstTap('field-scope',n.id,scope,page,n.kind,n.sourceDigest);
    }catch{} // Owned acquisition cannot replace the original application's result.
  }
  function recordJSON(exchange,value){`);
 once("const budget={remaining:2048,bytes:0,leaves:[],exceeded:false};tagJSON(value,{...(consumptionId?{consumptionId}:{}),",`const firstReadRootId=__firstObjectId(value);
    __firstTap('parse',value,consumptionId,exchange.id,page);
    const budget={remaining:2048,bytes:0,leaves:[],exceeded:false};tagJSON(value,{firstReadRootId,...(consumptionId?{consumptionId}:{}),`);
 once("      add({...meta,kind:'member',key:typeof key==='symbol'?'[symbol]':telemetryOps.string(key)},value,write?[write]:[],", "      firstReadReceipt(add({...meta,kind:'member',key:typeof key==='symbol'?'[symbol]':telemetryOps.string(key)},value,write?[write]:[],");
 once("{boundary:'object/property history not observed; not an original own JSON data field'});", "{boundary:'object/property history not observed; not an original own JSON data field'}),obj,stack[0]?.scope,value);");
 once("let origin=init?.object?origins.get(init.object):null,current=init?.object;", "let origin=init?.object?origins.get(init.object):null,current=init?.object,firstReadReceiver=null;");
 once("origin=null;break;}current=original.value;", "origin=null;break;}firstReadReceiver=current;current=original.value;");
 once("      if(n&&!meta.historyUnknown)put(bindings,scope+':'+binding,n.id);if(last&&init)init.object=null;return value;", "      firstReadReceipt(n,firstReadReceiver,scope,value);\n      if(n&&!meta.historyUnknown)put(bindings,scope+':'+binding,n.id);if(last&&init)init.object=null;return value;");
 code=`import {firstQueryTap as __firstTap,firstQueryObjectId as __firstObjectId,firstQuerySnapshot as __firstSnapshot} from ${JSON.stringify(ledgerURL)};\n`+code;
 parse(code,{sourceType:'module'});return code;
}
