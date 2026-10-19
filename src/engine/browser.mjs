export function matchTarget(observation){
 const trace=observation.trace;if(!trace?.target)return observation;
 const v=trace.target.value,computed=observation.property==='disabled'?(v?.kind==='undefined'?false:Boolean(v)):['string','number'].includes(typeof v)?String(v).trim():null;
 const matched=!trace.target.aggregateText&&computed!==null&&computed===observation.value;
 return {...observation,trace:{...trace,...(!matched?{status:'Unknown/Unsupported',reason:'DOM/trace mismatch or aggregate text; selected-property execution not established'}:{}),targetCorrespondence:matched?'marker and DOM value agree':'mismatch',commitIdentity:matched&&trace.status==='Observed'&&trace.commit?.producer?.status==='Observed'&&trace.commit?.status==='Observed'&&trace.commit.targetId===trace.target.id&&trace.commit.page===trace.page&&trace.page===observation.page&&trace.commit.marker===observation.instance&&trace.commit.property===observation.property&&trace.commit.value===observation.value?'Observed: '+trace.commit.mechanism:'Unknown/Unsupported: '+(trace.commit?.reason||trace.commit?.producer?.reason||'no proven final-property producer; last instance evaluation only')}};
}
export function assessDeepTrials(trials,expectedBuild,requireAppParsed=true){
 const base=trials[0],same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);const stable=!!expectedBuild&&trials.length===3&&trials.every(t=>t.a.build===expectedBuild&&same(t.a.value,base.a.value)&&t.interventions.length===base.interventions.length&&t.interventions.every((i,j)=>i.name===base.interventions[j].name&&i.b.build===expectedBuild&&i.rollback.build===expectedBuild&&same(i.b.value,base.interventions[j].b.value)&&same(i.rollback.value,t.a.value)&&i.consumed&&(!requireAppParsed||i.b.runtimeConsumed)));
 for(const t of trials)for(const i of t.interventions)i.effectStatus=stable&&!same(i.b.value,t.a.value)?'Experimentally verified':stable?'Observed':'Unknown/Unsupported';
 const changed=trials.some(t=>t.interventions.some(i=>!same(i.b.value,t.a.value)));
 return {status:stable?(changed?'Experimentally verified':'Observed'):'Unknown/Unsupported',reproducible:stable,reason:stable?'3 equal outcomes, reset/rollback, build and app JSON parsing checked':'unstable, unconsumed, build mismatch or application consumption unknown'};
}
export function isSameSelection(expected,current){return !!expected&&!!current&&['document','node','property','value'].every(k=>expected[k]===current[k]);}
export async function handleDeepOverlay(id,p,s,send){if(!s.deepOverrides)return false;const ordinal=s.requestOrdinals?.[p.networkId];const rule=s.deepOverrides.find(o=>o.url===p.request.url&&!o.consumed&&(!o.requestOrdinal||o.requestOrdinal===ordinal));if(!rule){await send(id,'Fetch.continueRequest',{requestId:p.requestId});return true;}
 if(!Number.isInteger(ordinal)||p.request.method!=='GET'||!p.responseStatusCode||!(p.responseHeaders||[]).some(h=>h.name.toLowerCase()==='content-type'&&h.value.includes('application/json')))throw Error('Deep overlay requires observed main-frame GET Fetch / application-json; ordinal='+ordinal+' resource='+p.resourceType);
 const r=await send(id,'Fetch.getResponseBody',{requestId:p.requestId});const raw=r.base64Encoded?atob(r.body):r.body;if(raw.length>128000)throw Error('Overlay body budget');const json=JSON.parse(raw);for(const patch of rule.patches){const keys=patch.path.split('.');if(keys.some(k=>['__proto__','prototype','constructor'].includes(k)))throw Error('Unsafe patch');let obj=json;for(const k of keys.slice(0,-1)){if(!obj||!Object.hasOwn(obj,k))throw Error('Patch missing');obj=obj[k];}if(!obj||!Object.hasOwn(obj,keys.at(-1)))throw Error('Patch leaf missing');obj[keys.at(-1)]=patch.value;}
 const text=JSON.stringify(json);rule.consumed++;rule.actual=json;rule.networkId=p.networkId;rule.requestOrdinal=ordinal;await send(id,'Fetch.fulfillRequest',{requestId:p.requestId,responseCode:p.responseStatusCode,responseHeaders:p.responseHeaders.filter(h=>!['content-length','content-encoding','etag','transfer-encoding'].includes(h.name.toLowerCase())),body:btoa(String.fromCharCode(...new TextEncoder().encode(text)))});return true;
}
export function createBrowserEngine(chrome){
async function observeDeep(id,selection,property='text',{includeTrace=true,beforeMainScript=async()=>{}}={}){
 if(!selection?.selector)return {property,status:'Unknown/Unsupported',reason:'Selection missing',trace:null};
 const operation={target:{tabId:id},world:'MAIN',func:(selector,property,includeTrace)=>{const e=selector.split(' >>> ').reduce((root,part,i)=>i?root?.shadowRoot?.querySelector(part):document.querySelector(part),null);if(!e)return {property,status:'Unknown/Unsupported',reason:'Element missing',trace:null};const marker=e.getAttribute('data-stateatom');let value;if(property==='disabled'){const get=Object.getOwnPropertyDescriptor(HTMLButtonElement.prototype,'disabled')?.get;if(e instanceof HTMLButtonElement)value=get.call(e);else return {property,status:'Unknown/Unsupported',reason:'disabled: HTMLButtonElement only',trace:null};}else value=Object.getOwnPropertyDescriptor(Node.prototype,'textContent').get.call(e)?.trim();let page=null,trace=null;if(includeTrace&&marker)try{const runtime=Object.getOwnPropertyDescriptor(window,'__STATEATOM__')?.value,version=runtime&&Object.getOwnPropertyDescriptor(runtime,'version')?.value,snapshot=runtime&&Object.getOwnPropertyDescriptor(runtime,'snapshot')?.value;page=runtime&&Object.getOwnPropertyDescriptor(runtime,'page')?.value||null;if(version===1&&typeof snapshot==='function'){trace=snapshot.call(runtime,marker,property,e);const first=Object.getOwnPropertyDescriptor(runtime,'firstReadObservations')?.value;if(trace&&typeof first==='function')trace.firstReadObservations=first.call(runtime);}}catch{trace={status:'Unknown/Unsupported',reason:'Optional instrumentation unavailable'};}return {property,value,instance:includeTrace?marker:null,frame:0,page,trace};},args:[selection.selector,property,includeTrace]};await beforeMainScript(operation,'deep-helper');const r=await chrome.scripting.executeScript(operation);return r[0]?.result?matchTarget(r[0].result):{property,status:'Unknown/Unsupported',reason:'Observation unavailable',trace:null};
}
// Browser-owned DOM identities and native node data. No inspection compilation:
// even an isolated executeScript would invalidate a finite code-history proof.
async function identifySelection(id,selector,property){
 const send=(method,params={})=>chrome.debugger.sendCommand({tabId:id},method,params);
 const validId=v=>Number.isSafeInteger(v)&&v>0;
 try{
  if(!['text','disabled'].includes(property))return null;
  await send('DOM.enable',{includeWhitespace:'all'});
  const {root}=await send('DOM.getDocument',{depth:0});if(!validId(root?.nodeId)||!validId(root.backendNodeId))return null;
  const parts=selector.split(' >>> ');
  async function selected(){
   let scope=root.nodeId,nodeId;
   for(let i=0;i<parts.length;i++){
    ({nodeId}=await send('DOM.querySelector',{nodeId:scope,selector:parts[i]}));if(!validId(nodeId))return null;
    if(i<parts.length-1){
     const {node}=await send('DOM.describeNode',{nodeId,depth:0}),open=(node?.shadowRoots||[]).filter(r=>r.shadowRootType==='open');
     if(open.length!==1||!validId(open[0].backendNodeId))return null;
     const {nodeIds}=await send('DOM.pushNodesByBackendIdsToFrontend',{backendNodeIds:[open[0].backendNodeId]});scope=nodeIds?.[0];if(!validId(scope))return null;
    }
   }
   return nodeId;
  }
  const nodeId=await selected();if(!nodeId)return null;
  const {node}=await send('DOM.describeNode',{nodeId,depth:property==='text'?32:0});if(node?.nodeType!==1||!validId(node.backendNodeId))return null;
  let value;
  if(property==='disabled'){
   // HTML buttons have an uppercase native nodeName. Other namespaces and XML
   // documents are not silently treated as HTMLButtonElement instances.
   if(node.nodeName!=='BUTTON'||node.localName!=='button'||!Array.isArray(node.attributes)||node.attributes.length%2)return null;
   value=node.attributes.some((v,i)=>i%2===0&&v==='disabled');
  }else{
   let count=0,chars=0;const chunks=[];
   function text(n,depth){
    if(++count>2048||depth>32)throw Error('Native DOM text budget');
    if(n.nodeType===3||n.nodeType===4){if(typeof n.nodeValue!=='string'||(chars+=n.nodeValue.length)>128000)throw Error('Native DOM text budget');chunks.push(n.nodeValue);return;}
    if(![1,9,11].includes(n.nodeType))return;
    if(!Number.isSafeInteger(n.childNodeCount)||n.childNodeCount<0||(n.children||[]).length!==n.childNodeCount)throw Error('Incomplete native DOM subtree');
    for(const child of n.children||[])text(child,depth+1);
   }
   text(node,0);value=chunks.join('').trim();
  }
  if(await selected()!==nodeId)return null;
  const current=await send('DOM.getDocument',{depth:0});if(current.root?.backendNodeId!==root.backendNodeId)return null;
  return {document:'cdp:'+root.backendNodeId,node:'cdp:'+node.backendNodeId,property,value};
 }catch{return null;}
}
async function deepExperiment({id,s,send,reset,selection,variants,signal,includeTrace=true,beforeMainScript=async()=>{}}){
 if(!Array.isArray(variants)||variants.length<1||variants.length>4)throw Error('1..4 intervention variants');const origin=s.origin;for(const v of variants){if(!Array.isArray(v.rules)||v.rules.length>4)throw Error('Overlay rule budget');for(const rule of v.rules){if(new URL(rule.url).origin!==origin||!Array.isArray(rule.patches)||rule.patches.length>4||JSON.stringify(rule).length>4096)throw Error('Overlay scope/budget');}}
 const run=crypto.randomUUID(),trials=[],originalBuild=s.analysis?.graph?.identity?.build;const property=selection.property||'text';let baseline;
 async function checkpoint(rules){if(signal?.aborted)throw Object.assign(Error('CANCELLED'),{code:'CANCELLED'});s.deepOverrides=rules?structuredClone(rules).map(r=>({...r,consumed:0})):null;
 await reset(id,null);
 let previous,stable=0,observed;for(let i=0;i<150;i++){await new Promise(r=>setTimeout(r,50));observed=await observeDeep(id,selection,property,{includeTrace,beforeMainScript});const ready=property==='disabled'?observed.value!==undefined:observed.value!==undefined&&observed.value!=='Loading'&&observed.value!==null;const key=JSON.stringify(observed.value);if(ready&&key===previous)stable++;else stable=0;previous=key;if(stable>=3)break;}if(stable<3)throw Error('Target did not settle');const bytes=new TextEncoder().encode([...s.samples].sort().join(''));const build=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');const rulesOut=structuredClone(s.deepOverrides);for(const rule of rulesOut||[]){const pointer=p=>'/'+p.split('.').map(k=>k.replaceAll('~','~0').replaceAll('/','~1')).join('/');const parsed=observed.trace?.recentExchanges?.find(e=>e.url===rule.url&&e.urlOrdinal===rule.requestOrdinal&&rule.patches.every(p=>e.parsedLeaves?.some(f=>f.pointer===pointer(p.path)&&JSON.stringify(f.value)===JSON.stringify(p.value))));rule.application=parsed?{status:'Observed',exchangeId:parsed.id,urlOrdinal:parsed.urlOrdinal,consumedAt:parsed.consumedAt,binding:'same URL + fetch start ordinal; synthetic main-frame GET without redirects; patch value checks are not identity inference'}:{status:'Unknown/Unsupported',reason:'app JSON parse not observed/bound'};}return {build,at:Date.now(),...observed,runtimeConsumed:!!rulesOut&&rulesOut.every(r=>r.application.status==='Observed'),rules:rulesOut,requests:structuredClone(s.requests),reset:'full reload + browser cache/storage cleared',run:s.run};}
 try{for(let repeat=0;repeat<3;repeat++){const a=await checkpoint(null);if(baseline===undefined)baseline=a.value;const interventions=[];for(const variant of variants){const b=await checkpoint(variant.rules),rollback=await checkpoint(null);interventions.push({name:variant.name,b,rollback,delivered:b.rules?.every(r=>r.consumed===1),consumed:b.rules?.every(r=>r.consumed===1)&&b.runtimeConsumed,restored:JSON.stringify(rollback.value)===JSON.stringify(a.value),changed:JSON.stringify(b.value)!==JSON.stringify(a.value),interpretation:JSON.stringify(b.value)===JSON.stringify(a.value)?'Observed no effect under these conditions; does not disprove dependency':'Observed target changed under intervention'});}trials.push({repeat,a,interventions});}}
 finally{s.deepOverrides=null;await reset(id,null);await new Promise(r=>setTimeout(r,350));s.selection={...selection,trace:null,page:null};}
 const assessment=assessDeepTrials(trials,originalBuild,!!selection.page);return {id:run,...assessment,scope:'conditional endpoint influence / masked no-effect; intermediate arrows remain separately supported or unknown',baseline,trials,rollback:'reload + cache/storage reset; no backend or source write',completedAt:Date.now()};
}

return {observeDeep,identifySelection,deepExperiment};
}
export const observeDeep=(...args)=>createBrowserEngine(globalThis.chrome).observeDeep(...args);
export const identifySelection=(...args)=>createBrowserEngine(globalThis.chrome).identifySelection(...args);
export const deepExperiment=(...args)=>createBrowserEngine(globalThis.chrome).deepExperiment(...args);
