// SPDX-License-Identifier: Apache-2.0
// Synthetic mechanism controls, NOT Atom product UI or its permission policy.
import './app.mjs';
import {__sa_actions,mode} from '/trace-runtime.mjs';
const controls=document.getElementById('trace-controls'),status=document.getElementById('trace-status'),trace=document.getElementById('trace');
for(const id of ['direct','direct-child','capture-child','delegated-child','arrow','bound','disabled','factory-a','factory-b','replace-target','replace-handler','throwing','finally','finally-throw','async','unrelated','promise-return','proxy','stopped','before-capture','reuse']){
 const button=document.createElement('button');button.id='arm-'+id;button.textContent='Arm synthetic observation for #'+id;button.addEventListener('click',()=>{if(mode==='armed')__sa_actions.arm(document.getElementById(id),{timeoutMs:500});else __sa_actions.clear();status.textContent=JSON.stringify(__sa_actions.snapshot());});controls.append(button);
}
for(const operation of ['snapshot','cancel','clear','stop']){const button=document.createElement('button');button.id='trace-'+operation;button.textContent=operation;button.addEventListener('click',()=>{if(operation!=='snapshot')__sa_actions[operation]();trace.textContent=JSON.stringify(__sa_actions.snapshot());status.textContent=trace.textContent;});controls.append(button);}
status.textContent='ready:'+mode;
