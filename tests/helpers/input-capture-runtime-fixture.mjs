// SPDX-License-Identifier: Apache-2.0
// Synthetic CDP/platform source harness, copied from the existing U02 fixture.
import {createAtomRuntime} from '../../packages/atom/src/runtime.mjs';
import {createChromePlatform,createDebuggerBroker,createEventHub} from '../../packages/atom/src/platform.mjs';
import {prepareExperimentPlan} from '../../core/experiment-plan.mjs';
export function captureControlOwner({writeGate,closeGate,status='applied'}={}){
 let resource={id:'control:name',kind:'dom-control',revision:0,type:'string',value:'AB',writable:true,locator:{document:'cdp:101',node:'native-name',selector:'#name',control:'text'}},writes=0,reads=0;
 return {available:true,get writes(){return writes;},get reads(){return reads;},async open(o){return {
  async read(){reads++;await o.guard(['read','inject']);return {ok:true,resources:[structuredClone(resource)],unsupported:[],truncated:false};},
  async write(expected,value){writes++;await o.guard(['read','inject','replay']);if(writeGate)await writeGate();if(status!=='applied')return {ok:false,status,attempted:true,code:'SYNTHETIC_ACK_FAILURE'};resource={...resource,value,revision:resource.revision+1};return {ok:true,status:'applied',attempted:true,after:structuredClone(resource)};},
  async close(){if(closeGate)await closeGate();return {cleanup:'closed'};}
 };}};
}
const origin='http://127.0.0.1:4173',url=origin+'/api';
const message=payload=>({version:1,id:crypto.randomUUID(),session:'inputs-runtime',payload});
const tick=()=>new Promise(r=>setTimeout(r,0));
export function inputCaptureRuntimeFixture(options={}){
 const data={'stateport.atom.v1.connections':[{origin,mode:'development',actions:['cache','reload','override','replay']}]},calls=[],events=createEventHub();let disabled=true,node=103,document=101,permission=true;
 const area={async get(keys){return Object.fromEntries(keys.filter(k=>k in data).map(k=>[k,structuredClone(data[k])]));},async set(v){Object.assign(data,structuredClone(v));}};
 const api={permissions:{contains:async()=>permission},runtime:{id:'test',sendMessage:async()=>{}},storage:{local:area,session:area},tabs:{get:async id=>({id,url:origin+'/react/'}),query:async()=>[],reload:async()=>calls.push({m:'RELOAD'}),onUpdated:{addListener(){},removeListener(){}}},debugger:{attach:async()=>{},detach:async()=>{},sendCommand:async(_,m,p)=>{calls.push({m,p});const custom=await options.send?.(m,p);if(custom!==undefined)return custom;if(m==='Page.getFrameTree')return{frameTree:{frame:{id:'main'}}};if(m==='DOM.getDocument')return{root:{nodeId:1,backendNodeId:document,nodeType:9}};if(m==='DOM.querySelector')return{nodeId:3};if(m==='DOM.describeNode')return{node:{nodeId:3,backendNodeId:node,nodeType:1,nodeName:'BUTTON',localName:'button',attributes:disabled?['disabled','']:[],childNodeCount:1,children:[{nodeType:3,nodeValue:'Confirm'}]}};if(m==='DOM.resolveNode')return{};if(m==='Network.getResponseBody'||m==='Fetch.getResponseBody')return{body:JSON.stringify({flag:true,note:'Привет'}),base64Encoded:false};return{};}},scripting:{executeScript:async op=>{calls.push({m:'SCRIPT'});return[{result:op.args.length===2?{selector:'#confirm',id:'confirm',tag:'button',text:'Confirm',owners:[],runtime:{},observedAt:1}:{property:op.args[1],value:op.args[1]==='disabled'?disabled:'Confirm',frame:0,page:null,trace:null}}];}}};
 const broker=createDebuggerBroker(api.debugger);broker.workerIndependent=options.workerIndependent!==false; // Models a non-worker owner; not native lifecycle proof.
 const platform=createChromePlatform(api,{events,broker,controlOwner:options.controlOwner}),runtime=createAtomRuntime(platform);
 const request=p=>runtime.request(message({tabId:1,...p}));
 const emit=async(method,params)=>{events.emit({type:'debugger',source:{tabId:1},method,params});await tick();await tick();};
 async function network(n,{finish=true,frameId='main',method='GET'}={}){await emit('Network.requestWillBeSent',{requestId:'q'+n,type:'Fetch',frameId,request:{url,method}});if(finish){await emit('Network.responseReceived',{requestId:'q'+n,type:'Fetch',frameId,response:{url,status:200,mimeType:'application/json'}});await emit('Network.loadingFinished',{requestId:'q'+n,encodedDataLength:100});}}
 async function inspect(){await request({op:'attach'});await request({op:'property',property:'disabled'});await request({op:'inspect-selector',selector:'#confirm'});await network(1);}
 const plan=s=>prepareExperimentPlan({investigationId:s.investigationId,mode:'draft',target:s.target,changes:[{resource:s.resources.find(r=>r.resource.locator.pointer==='/flag').resource,value:false}]});
 return {api,runtime,request,calls,events,broker,platform,data,network,inspect,emit,plan,setNode:n=>node=n,setDocument:n=>document=n,setDisabled:v=>disabled=v,deny:()=>permission=false};
}
