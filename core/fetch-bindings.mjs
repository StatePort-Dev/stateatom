// SPDX-License-Identifier: Apache-2.0
// Browser-owned CDP facts. Page-reported Response associations remain untrusted.
const scriptPattern=/^stateatom-fetch:\/\/[a-f0-9-]{36}\/[1-9][0-9]{0,2}$/;
const localURL=url=>typeof url==='string'&&url.length<=1024&&/^http:\/\/127\.0\.0\.1:(4173|4174|4175)\//.test(url);
export const fetchScriptBody=url=>'(function anonymous(apply,fetch,receiver,args\n) {\nreturn apply(fetch,receiver,args);\n//# sourceURL='+url+'\n})';
export function newFetchBindings(epoch){return {epoch,startedAt:Date.now(),contexts:{},scripts:{},requests:{},overflow:false};}
function put(s,map,key,value,limit){if(Object.hasOwn(map,key)){map[key]=value;return;}if(Object.keys(map).length>=limit){s.overflow=true;return;}Object.defineProperty(map,key,{value,writable:true,enumerable:true,configurable:true});}
export function fetchBindingEvent(s,method,p){
 if(method==='Runtime.executionContextsCleared'){s.contexts={};s.scripts={};s.requests={};s.overflow=false;return;}
 if(method==='Runtime.executionContextDestroyed'){delete s.contexts[p.executionContextId];return;}
 if(method==='Runtime.executionContextCreated'){const c=p.context;if(c?.auxData?.isDefault===true)put(s,s.contexts,c.id,{frameId:c.auxData.frameId,isDefault:true,uniqueId:c.uniqueId},32);return;}
 if(method==='Debugger.scriptParsed'&&scriptPattern.test(p.url)){put(s,s.scripts,p.scriptId,{url:p.url,contextId:p.executionContextId},32);return p.scriptId;}
 if(method==='Network.requestWillBeSent'&&p.type==='Fetch'){
  if(typeof p.request?.url!=='string'||p.request.url.length>1024||typeof p.request.method!=='string'||p.request.method.length>32){s.overflow=true;return;}
  const old=Object.hasOwn(s.requests,p.requestId)?s.requests[p.requestId]:null,f=p.initiator?.stack?.callFrames?.[0];
  if(old){old.hops++;old.redirect=true;return;}
  put(s,s.requests,p.requestId,{id:p.requestId,url:p.request?.url,method:p.request?.method,frameId:p.frameId,hops:1,redirect:!!p.redirectResponse,top:p.initiator?.type==='script'&&f?{scriptId:f.scriptId,line:f.lineNumber,column:f.columnNumber}:null,finished:false},64);return;
 }
 const r=Object.hasOwn(s.requests,p.requestId)?s.requests[p.requestId]:null;if(!r)return;
 if(method==='Network.responseReceived'&&p.type==='Fetch'&&(typeof p.response.url!=='string'||p.response.url.length>1024)){s.overflow=true;delete r.response;return;}
 if(method==='Network.responseReceived'&&p.type==='Fetch')r.response={url:p.response.url,status:p.response.status,frameId:p.frameId,fromServiceWorker:p.response.fromServiceWorker};
 if(method==='Network.loadingFinished')r.finished=true;
 if(method==='Network.loadingFailed')r.failed=true;
}
export function fetchScriptSource(s,id,source){if(Object.hasOwn(s.scripts,id)&&typeof source==='string'&&source.length<=512)s.scripts[id].source=source;}
export function bindFetchTrace(trace,s,{mainFrameId,run}={}){
 const scope='Exact browser fetch/Response exchange identity only; not current value ancestry or complete HTTP provenance';
 return (trace?.exchanges||[]).slice(0,32).map(exchange=>{
  const unknown=reason=>({exchangeId:exchange.id,status:'Unknown/Unsupported',reason,scope});
  const a=exchange.acquisition;if(!a||a.status!=='Generated')return unknown(a?.reason||'Exact initiator acquisition not enabled or unavailable');
  if(!s||s.epoch!==run||s.overflow||!mainFrameId)return unknown('Browser context/epoch/retention unavailable');
  const serial=typeof exchange.id==='string'&&exchange.id.startsWith(trace.page+':exchange')?exchange.id.slice((trace.page+':exchange').length):'';
  if(!/^[1-9][0-9]{0,2}$/.test(serial)||a.scriptURL!=='stateatom-fetch://'+trace.page+'/'+serial||!localURL(exchange.url))return unknown('Page/exchange acquisition identity mismatch');
  const candidates=Object.entries(s.scripts).filter(([,v])=>v.url===a.scriptURL);
  if(candidates.length!==1)return unknown('Missing or duplicate compiled script identity');
  const[scriptId,script]=candidates[0],context=s.contexts[script.contextId];
  if(script.source!==fetchScriptBody(a.scriptURL)||context?.isDefault!==true||context.frameId!==mainFrameId)return unknown('Actual compiled source/default main-frame context unavailable');
  const requests=Object.values(s.requests).filter(r=>r.frameId===mainFrameId&&r.top?.scriptId===scriptId&&r.top.line===2&&r.top.column===7);
  if(requests.length!==1)return unknown('Missing or competing immediate native fetch callsite');
  const request=requests[0],response=request.response;
  if(request.hops!==1||request.redirect||request.failed||!request.finished||!response||response.fromServiceWorker!==false||response.frameId!==mainFrameId||request.url!==exchange.url||response.url!==request.url)return unknown('Incomplete, redirected, service-worker or incompatible request/response');
  return {exchangeId:exchange.id,status:'Observed',requestId:request.id,url:request.url,method:request.method,responseStatus:response.status,scriptId,executionContextId:script.contextId,frameId:mainFrameId,page:trace.page,run,scope,trust:'CDP request/script facts plus instrumented-page Response report; not runtime attestation.'};
 });
}
// Deliberately conservative: even permissive/report-only CSP stays unsupported.
export function allowsFetchGeneration(headers){return !!headers&&typeof headers==='object'&&!Object.keys(headers).some(k=>k.toLowerCase()==='content-security-policy'||k.toLowerCase()==='content-security-policy-report-only');}
// Constant extension operation, never imported data or arbitrary page evaluation.
export function installFetchPolicy(allowed,url){"stateatom:fetch-policy-helper/1";if(location.href.split('#')[0]!==url.split('#')[0])return false;Object.defineProperty(window,'__STATEATOM_FETCH_POLICY__',{value:allowed===true,configurable:true});return true;}
