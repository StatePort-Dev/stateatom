// SPDX-License-Identifier: MIT
// Evolved from the historical MIT picker; original MIT notice applies.
// Native DOM/Overlay metadata only. Never evaluate application expressions.
const fail=message=>{throw Object.assign(Error(message),{code:'PICKER_UNSUPPORTED'});};
const positive=n=>Number.isSafeInteger(n)&&n>0;
const escaped=id=>/^[A-Za-z_][\w-]*$/.test(id)?id:[...id].map(c=>'\\'+c.codePointAt(0).toString(16)+' ').join('');
export function createPickerIndex({maxNodes=4096,maxDepth=48}={}){
 let nodes=new Map(),documentId,count=0,broken=false;
 function ingest(raw,parent=null,depth=0){
  if((!nodes.has(raw?.nodeId)&&++count>maxNodes)||depth>maxDepth){broken=true;fail('Native picker path budget exceeded');}
  if(!positive(raw?.nodeId)||!positive(raw.backendNodeId))fail('Native picker node unavailable');
  // Only an optional short ID is useful here. Inline styles, data URLs and
  // other attributes on unrelated siblings are not path metadata. Keep the
  // scan/storage bounded and fall back to exact-checked structural selectors.
  const attrs=raw.attributes||[];let id=null;
  if(attrs.length<=128)for(let i=0;i<attrs.length;i+=2){
   if(attrs[i]==='id'){const value=attrs[i+1];if(typeof value==='string'&&value.length<=160&&!value.includes('\0'))id=value;break;}
  }
  const n={nodeId:raw.nodeId,backendNodeId:raw.backendNodeId,nodeType:raw.nodeType,localName:raw.localName,parent,shadowRootType:raw.shadowRootType,id,children:[],roots:[]};nodes.set(n.nodeId,n);
  for(const child of raw.children||[]){n.children.push(child.nodeId);ingest(child,n.nodeId,depth+1);}
  for(const root of raw.shadowRoots||[]){n.roots.push(root.nodeId);ingest(root,n.nodeId,depth+1);}
  if(raw.contentDocument){n.children.push(raw.contentDocument.nodeId);ingest(raw.contentDocument,n.nodeId,depth+1);}
  return n;
 }
 function chain(id){
  if(broken)fail('Native picker path budget exceeded');
  const path=[];let n=nodes.get(id);
  for(let i=0;n&&i<maxDepth;i++){
   if(n.nodeId===documentId)return path;
   if(n.nodeType===9||n.shadowRootType&&n.shadowRootType!=='open')fail('Unsupported frame or closed shadow root');
   const parent=nodes.get(n.parent);if(!parent||!parent.children.includes(n.nodeId)&&!parent.roots.includes(n.nodeId))fail('Native picker ancestor removed or unavailable');
   path.push(n);n=parent;
  }
  fail('Native picker path unavailable or depth budget exceeded');
 }
 function selector(n,ids=true){
  const path=chain(n.nodeId),parts=[];let scope;
  for(const item of path){
   if(item.nodeType===11){scope=item;break;}
   if(item.nodeType!==1||!/^[-A-Za-z_][\w-]*$/.test(item.localName||''))fail('Unsupported native element kind');
   if(ids&&item.id&&item.id.length<=160&&!item.id.includes('\0')){parts.unshift('#'+escaped(item.id));break;}
   const parent=nodes.get(item.parent),siblings=parent.children.map(id=>nodes.get(id)).filter(v=>v?.nodeType===1&&v.localName===item.localName);
   parts.unshift(item.localName+':nth-of-type('+(siblings.indexOf(item)+1)+')');
  }
  // Even an ID inside a shadow root needs its exact outer scope.
  scope??=path.find(v=>v.nodeType===11);
  const result=(scope?selector(nodes.get(scope.parent),ids)+' >>> ':'')+parts.join(' > ');
  if(!result||result.length>1024)fail('Native picker selector budget exceeded');return result;
 }
 return{
  root(raw){nodes=new Map();count=0;broken=false;documentId=raw.nodeId;ingest(raw);},
  children(parentId,children){const parent=nodes.get(parentId);if(!parent)return;parent.children=children.map(c=>c.nodeId);for(const n of children)ingest(n,parentId);},
  remove(parentId,nodeId){const parent=nodes.get(parentId);if(parent){parent.children=parent.children.filter(id=>id!==nodeId);parent.roots=parent.roots.filter(id=>id!==nodeId);}},
  shadow(hostId,root){const host=nodes.get(hostId);if(host){host.roots.push(root.nodeId);ingest(root,hostId);}},
  path(id){const path=chain(id).filter(n=>n.nodeType===1);if(!path.length)fail('Native picker element unavailable');return path.slice(0,12).map(n=>({node:{backendNodeId:n.backendNodeId},selector:selector(n),structural:selector(n,false),label:(n.localName+(n.id?'#'+n.id:'')).slice(0,120)}));}
 };
}
// getDocument resets frontend IDs. Each sequence using those IDs must finish
// before another metadata reader asks for a document in the same owned tab.
export function createNativeDOMQueue(){
 const queues=new Map();return(id,read)=>{
  let q=queues.get(id);if(!q){q={tail:Promise.resolve(),count:0};queues.set(id,q);}
  if(q.count>=32)return Promise.reject(Object.assign(Error('Native DOM read queue budget exceeded'),{code:'PICKER_UNSUPPORTED'}));
  q.count++;const work=q.tail.catch(()=>{}).then(read);q.tail=work;
  const done=()=>{if(--q.count===0)queues.delete(id);};void work.then(done,done);return work;
 };
}
const highlightConfig={showInfo:true,showStyles:false,showRulers:false,showExtensionLines:false,showAccessibilityInfo:false,contentColor:{r:11,g:92,b:255,a:0.10},paddingColor:{r:11,g:92,b:255,a:0.06},borderColor:{r:11,g:92,b:255,a:0.8}};
export function createNativePicker({send,current,onSelect,onChange=()=>{},now=Date.now,lifetime=30000,readDOM=async(id,read)=>read()}){
 const sessions=new Map();
 const live=(id,s)=>sessions.get(id)===s&&['starting','picking','resolving','selected'].includes(s.status)&&current(id,s.epoch)&&now()<s.expiresAt;
 const view=s=>s?{status:s.status,reason:s.reason||'',id:s.id,expiresAt:s.expiresAt,selectedIndex:s.status==='selected'?s.selectedIndex:undefined,choices:(s.status==='selected'?s.choices:[]).map((v,index)=>({index,label:v.label}))}:{status:'idle',reason:'',choices:[]};
 function changed(id){onChange(id);}
 async function stop(id){await send(id,'Overlay.setInspectMode',{mode:'none',highlightConfig:{}});await send(id,'Overlay.hideHighlight');/* Keep the passive domain until lease release: disable() releases a held gesture's mouseup into the app. */}
 async function cancel(id,reason='Selection cancelled',expectedId){
  const s=sessions.get(id);if(expectedId&&s?.id!==expectedId)fail('Picker session changed or expired');if(!s)return view();clearTimeout(s.timer);s.status='cancelled';s.reason=reason;s.choices=[];s.index=null;s.controller?.abort();
  try{if(current(id,s.epoch))await stop(id);}catch(e){s.status='unsupported';s.reason='Picker cleanup failed; detach this tab before continuing';changed(id);throw e;}
  changed(id);return view(s);
 }
 async function resolve(id,s,choice){
  if(!live(id,s))fail('Picker session expired or changed');const {root}=await send(id,'DOM.getDocument',{depth:0});if(root.backendNodeId!==s.document)fail('Picker document changed');
  async function find(selector){let scope=root.nodeId,nodeId;
   const parts=selector.split(' >>> ');for(let i=0;i<parts.length;i++){
    ({nodeId}=await send(id,'DOM.querySelector',{nodeId:scope,selector:parts[i]}));if(!positive(nodeId))return null;
    if(i<parts.length-1){const {node}=await send(id,'DOM.describeNode',{nodeId,depth:0}),open=node.shadowRoots?.filter(v=>v.shadowRootType==='open');if(open?.length!==1)return null;const pushed=await send(id,'DOM.pushNodesByBackendIdsToFrontend',{backendNodeIds:[open[0].backendNodeId]});scope=pushed.nodeIds?.[0];}
   }
   return(await send(id,'DOM.describeNode',{nodeId,depth:0})).node?.backendNodeId;
  }
  let selector=choice.selector;if(await find(selector)!==choice.node.backendNodeId){selector=choice.structural;if(await find(selector)!==choice.node.backendNodeId)fail('Picker target removed or replaced');}
  if(!live(id,s))fail('Picker session expired or changed');return{selector,document:'cdp:'+s.document,node:'cdp:'+choice.node.backendNodeId};
 }
 async function select(id,s,index,options={}){
  if(options.signal?.aborted)fail('Picker request cancelled');
  if(!live(id,s)||!s.choices[index])fail('Picker session expired or choice unavailable');
  s.controller?.abort();const controller=new AbortController();s.controller=controller;
  const valid=()=>live(id,s)&&s.controller===controller&&!controller.signal.aborted;
  const abort=()=>controller.abort();options.signal?.addEventListener('abort',abort,{once:true});options.track?.(abort);
  try{
   const target=await readDOM(id,()=>resolve(id,s,s.choices[index]));if(!valid())fail('Picker request cancelled or superseded');
   await onSelect(id,target,{signal:controller.signal,current:valid});
   if(!valid())fail('Picker request cancelled or superseded');s.selectedIndex=index;s.status='selected';changed(id);return view(s);
  }catch(e){if(live(id,s)&&s.controller===controller&&!controller.signal.aborted){s.status='unsupported';s.reason=e.message;changed(id);}throw e;}
  finally{options.signal?.removeEventListener('abort',abort);}
 }
 return{
  snapshot:id=>view(sessions.get(id)),
  async start(id,epoch,options={}){
   if(options.signal?.aborted)fail('Picker request cancelled');await cancel(id,'Selection restarted');if(options.signal?.aborted)fail('Picker request cancelled');const s={id:options.id||crypto.randomUUID(),epoch,status:'starting',expiresAt:now()+lifetime,choices:[],index:createPickerIndex()};sessions.set(id,s);const abort=()=>{if(sessions.get(id)===s)void cancel(id,'Picker request cancelled',s.id).catch(()=>{});};options.signal?.addEventListener('abort',abort,{once:true});options.track?.(()=>{if(sessions.get(id)===s)abort();});
   try{await readDOM(id,async()=>{if(!live(id,s))fail('Picker session changed');await send(id,'DOM.enable',{includeWhitespace:'all'});const {root}=await send(id,'DOM.getDocument',{depth:1,pierce:true});if(!positive(root?.backendNodeId))fail('Native document unavailable');s.document=root.backendNodeId;s.index.root(root);});await send(id,'Overlay.enable');if(!live(id,s))fail('Picker session changed');await send(id,'Overlay.setInspectMode',{mode:'searchForNode',highlightConfig});if(!live(id,s)){if(sessions.get(id)===s)await stop(id);fail('Picker session changed');}
    if(s.status==='starting')s.status='picking';s.timer=setTimeout(()=>{void cancel(id,'Selection expired; start selection again').catch(()=>{});},lifetime);s.timer.unref?.();changed(id);return view(s);
   }catch(e){if(s.status==='cancelled'||sessions.get(id)!==s)throw e;s.status='unsupported';s.reason='Native picker unavailable: '+e.message;if(sessions.get(id)===s)await stop(id).catch(()=>{});changed(id);throw e;}finally{options.signal?.removeEventListener('abort',abort);}
  },
  cancel,
  async refine(id,pickerId,index,options={}){const s=sessions.get(id);if(!s||s.id!==pickerId||s.status!=='selected')fail('Picker refinement expired; select again');return select(id,s,index,options);},
  async event(id,method,p){
   const s=sessions.get(id);if(!s||!live(id,s))return;
   try{
    if(s.status==='resolving'&&s.index){
     if(method==='DOM.setChildNodes')s.index.children(p.parentId,p.nodes);
     if(method==='DOM.childNodeRemoved')s.index.remove(p.parentNodeId,p.nodeId);
     if(method==='DOM.shadowRootPushed')s.index.shadow(p.hostId,p.root);
    }
    if(method==='Overlay.inspectModeCanceled')return await cancel(id,'Selection cancelled with Escape; this key may also reach page handlers.');
    if(method!=='Overlay.inspectNodeRequested'||!['starting','picking'].includes(s.status))return;
    s.status='resolving';await stop(id);await readDOM(id,async()=>{if(!live(id,s))fail('Picker session changed');const {root}=await send(id,'DOM.getDocument',{depth:1,pierce:true});if(root.backendNodeId!==s.document)fail('Picker document changed');s.index.root(root);
    const {nodeIds}=await send(id,'DOM.pushNodesByBackendIdsToFrontend',{backendNodeIds:[p.backendNodeId]});await Promise.resolve();s.choices=s.index.path(nodeIds?.[0]);s.index=null;});await select(id,s,0);
   }catch(e){if(s.status==='cancelled'||sessions.get(id)!==s)return;if(s.status!=='unsupported'){s.status='unsupported';s.reason=e.message;}s.controller?.abort();clearTimeout(s.timer);changed(id);}
  },
  async dispose(){await Promise.allSettled([...sessions.keys()].map(id=>cancel(id,'Picker disposed')));sessions.clear();}
 };
}
// Kept as an inert compatibility entrypoint for old host content-script exports.
export function installPicker(){}
