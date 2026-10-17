import {loadAccount,loadCounter,noise,addShadows} from '../common.js';
function greeting(name){let saved=name;document.querySelector('#forwarded').textContent=`Hello ${saved}`;}
let local=0;
async function render(){
 const data=await loadAccount();
 document.querySelector('#plan').textContent=data.profile.plan;
 document.querySelector('#total').textContent=`Total $${(data.invoice.cents/100).toFixed(2)}`;
 document.querySelector('#feature').textContent=data.flags.enabled?'Enabled':'Disabled';
 greeting(data.profile.name);
 document.querySelector('#branch').textContent=false?data.hidden.label:'Visible';
 await refresh();noise();addShadows();
}
async function refresh(){const counter=await loadCounter(true);document.querySelector('#async').textContent=`Count ${counter.value}`;}
document.querySelector('#refresh').onclick=refresh;
document.querySelector('#increment').onclick=()=>{document.querySelector('#local').textContent=`Local ${++local}`;noise();};
render();
