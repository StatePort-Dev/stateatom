/* StatePort extension UX fixtures. No real capture, network, CDP or filesystem access. */
(function(root){'use strict';
const clone=v=>JSON.parse(JSON.stringify(v));
function origin(raw){let u;try{u=new URL(raw.trim())}catch{throw Error('Enter an exact HTTP(S) origin')}if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.search||u.hash||u.pathname!=='/'||u.hostname.includes('*'))throw Error('Use an origin only: scheme + host + optional port');return u.origin}
function origins(raw){return [...new Set(raw.split(/[\n,]/).map(v=>v.trim()).filter(Boolean).map(origin))]}
function profile(o){return {origin:origin(o),capture:{reload:true,origins:[]},maps:{mode:'auto',url:'',granted:false,status:'Not checked',capability:'Not available',file:'',fixture:'exact'},instrument:{handlers:true,native:false,hooks:true,values:false,mode:'selected'},env:o.includes('localhost')?'development':o.includes('staging')?'staging':'production'}}
function emptyCapture(){return {phase:'ready',reload:true,reloaded:false,partial:false,requests:0,actions:0,checkpoints:0,bytes:0,auth:'',cardId:null,reason:null}}
function create(){let profiles=['https://staging.meridian.example','https://app.meridian.example','http://localhost:5173'].map(profile);profiles[0].capture.origins=['https://api.meridian.example'];profiles[0].maps.url='https://builds.meridian.example/releases/r7/manifest.json';return {profiles,selected:profiles[0].origin,connection:'connected',capture:emptyCapture(),action:{observing:false,calls:[],selected:'handleConfirm'}}}
function start(s,reload,overrides){if(s.connection!=='connected')throw Error('Open StatePort Desktop first');if(overrides)throw Error('Restore Atom overrides before Capture');if(!['ready','saved'].includes(s.capture.phase))throw Error('Finish this capture first');s.capture={...emptyCapture(),phase:'preparing',reload,partial:!reload}}
function ready(s){if(s.capture.phase!=='preparing')return;s.capture.phase='recording';s.capture.reloaded=s.capture.reload;if(s.capture.reload){s.capture.requests=8;s.capture.actions=1;s.capture.checkpoints=1;s.capture.bytes=184}}
function activity(s){if(s.capture.phase!=='recording')return;s.capture.requests+=2;s.capture.actions++;s.capture.checkpoints++;s.capture.bytes+=36}
function stop(s){if(!['recording','interrupted'].includes(s.capture.phase))throw Error('No recording to review');s.capture.phase='review'}
function interrupt(s){if(s.capture.phase!=='recording')return;s.capture.phase='interrupted';s.capture.partial=true;s.capture.reason='Debugger detached'}
function receipt(s){if(s.capture.phase!=='review')throw Error('Review required');if(!['keep','exclude'].includes(s.capture.auth))throw Error('Choose browser sign-in handling');s.capture.phase='saved';s.capture.cardId='card_demo_731'}
function discard(s){s.capture=emptyCapture()}
function identity(asset,map){if(asset.hash&&map.hash)return asset.hash===map.hash?'Exact match':'Build mismatch';return 'Unverified'}
function mapCapability(map){return Array.isArray(map.sourcesContent)&&map.sourcesContent.some(v=>typeof v==='string')?'Source available':'Positions only'}
function observe(s){s.action.observing=true}function unobserve(s){s.action.observing=false}
function event(s,disabled,captureValues=false){if(disabled||!s.action.observing)return false;s.action.calls.push({id:s.action.calls.length+1,evidence:'Observed',handler:'handleConfirm',event:'click',target:'button#confirm',args:captureValues?{orderId:731}:null,duration:14,request:'POST /api/orders/731/confirm',response:200});return true}
function exportProfile(p){return {origin:p.origin,capture:clone(p.capture),maps:{mode:p.maps.mode},instrument:clone(p.instrument),env:p.env}}
const api={clone,origin,origins,profile,create,start,ready,activity,stop,interrupt,receipt,discard,identity,mapCapability,observe,unobserve,event,exportProfile};if(typeof module!=='undefined')module.exports=api;else root.ExtensionDemoModel=api;
})(typeof window==='undefined'?globalThis:window);
