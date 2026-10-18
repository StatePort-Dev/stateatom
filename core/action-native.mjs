// SPDX-License-Identifier: Apache-2.0
// CDP metadata only. Never read handler descriptions, function source or closures.
export async function inspectNativeActions(send,selector,identity){
 const group='stateatom-actions-'+crypto.randomUUID(),out=[];
 const gap=reason=>({id:'native:unknown',event:'unknown',mechanism:'dom-listener',registeredOn:'unknown',entry:{status:'Unknown/Unsupported',reason,evidenceIds:[]},calls:[],hookRelations:[],execution:{status:'not-observed'},freshness:'snapshot',identity});
 if(selector.includes(' >>> '))return [gap('Native listener lookup in shadow roots is unsupported')];
 try{
  const {root}=await send('DOM.getDocument',{depth:0});
  const selected=await send('DOM.querySelector',{nodeId:root.nodeId,selector});if(!selected.nodeId)return [gap('Selected node unavailable')];
  const targets=[{nodeId:selected.nodeId,registeredOn:'selected-element'},{nodeId:root.nodeId,registeredOn:'document'}];
  for(const name of ['html','body']){const r=await send('DOM.querySelector',{nodeId:root.nodeId,selector:name});if(r.nodeId&&!targets.some(t=>t.nodeId===r.nodeId))targets.push({nodeId:r.nodeId,registeredOn:name});}
  for(const target of targets){
   const {object}=await send('DOM.resolveNode',{nodeId:target.nodeId,objectGroup:group});
   if(!object?.objectId)continue;
   const {listeners=[]}=await send('DOMDebugger.getEventListeners',{objectId:object.objectId,depth:1,pierce:false});
   for(const l of listeners.slice(0,12-out.length)){
    const id='native:'+out.length,delegated=target.registeredOn!=='selected-element';
    out.push({id,event:typeof l.type==='string'?l.type.slice(0,40):'unknown',mechanism:'dom-listener',registeredOn:target.registeredOn,status:'Observed',capture:l.useCapture===true,passive:l.passive===true,once:l.once===true,registration:{scriptId:String(l.scriptId).slice(0,80),line:l.lineNumber+1,column:l.columnNumber+1,nodeId:target.nodeId,mapping:'generated-script; original source unvalidated'},entry:{status:'Unknown/Unsupported',reason:delegated?'Propagation/delegation candidate; application callback and propagation unknown':'Registered listener; application function name and original source unknown',evidenceIds:[id+':registration']},calls:[],hookRelations:[],execution:{status:'not-observed'},freshness:'snapshot',identity});
   }
   if(out.length>=12)break;
  }
  return out;
 }catch{return [gap('Native listener metadata unavailable in this attached session')];}
 finally{await send('Runtime.releaseObjectGroup',{objectGroup:group}).catch(()=>{});}
}
